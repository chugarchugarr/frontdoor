import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { Btn, Tag } from "./ui-kit";

// ─── Spark icon ───────────────────────────────────────────────────────
export function SparkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/>
    </svg>
  );
}

// ─── AI Job status poller ─────────────────────────────────────────────
function useJobPoller(jobId: number | null, onDone: () => void) {
  const { data } = useQuery({
    queryKey: ["ai-job", jobId],
    queryFn: () => rpc.getAgentJobStatus(jobId!),
    enabled: jobId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "DONE" || status === "FAILED" ? false : 2000;
    },
  });

  useEffect(() => {
    if (data?.status === "DONE") onDone();
  }, [data?.status, onDone]);

  return data;
}

// ─── AIPanel ─────────────────────────────────────────────────────────
interface AIPanelProps {
  label: string;                       // e.g. "FineBot AI"
  description: string;                 // one-liner of what the agent does
  runFn: () => Promise<{ jobId: number }>;
  fetchFn: () => Promise<unknown>;     // fetches aiAnalysis from server
  queryKey: string[];                  // for invalidation after run
  renderResult: (data: unknown) => React.ReactNode;
  alreadyAnalyzed?: boolean;
}

export function AIPanel({
  label,
  description,
  runFn,
  fetchFn,
  queryKey,
  renderResult,
  alreadyAnalyzed,
}: AIPanelProps) {
  const qc = useQueryClient();
  const [jobId, setJobId] = useState<number | null>(null);
  const [open, setOpen] = useState(alreadyAnalyzed ?? false);

  const { data: analysis, refetch } = useQuery({
    queryKey: [...queryKey, "ai-analysis"],
    queryFn: fetchFn,
    enabled: false,
  });

  const handleDone = () => {
    refetch();
    qc.invalidateQueries({ queryKey });
    setJobId(null);
  };

  const jobStatus = useJobPoller(jobId, handleDone);
  const isRunning = jobId !== null && jobStatus?.status !== "DONE" && jobStatus?.status !== "FAILED";

  const run = useMutation({
    mutationFn: runFn,
    onSuccess: (data) => {
      setJobId(data.jobId);
      setOpen(true);
    },
  });

  const statusLabel = !jobId ? null
    : jobStatus?.status === "PENDING" ? "Queued…"
    : jobStatus?.status === "PROCESSING" ? "Thinking…"
    : jobStatus?.status === "FAILED" ? "Failed"
    : null;

  return (
    <div style={{
      border: `1px solid ${T.forest}30`,
      borderRadius: "16px",
      background: `${T.forest}08`,
      overflow: "hidden",
      marginTop: 16,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        background: `${T.forest}10`,
        borderBottom: open ? `1px solid ${T.forest}20` : "none",
        cursor: "pointer",
      }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T.forest }}><SparkIcon size={13} /></span>
          <span style={{ fontFamily: T.fontMono, fontSize: 11, fontWeight: 600, color: T.forest, letterSpacing: "0.06em" }}>{label}</span>
          <span style={{ fontFamily: T.fontSans, fontSize: 11, color: T.inkLight }}>{description}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {statusLabel && <Tag color={T.forest} bg={`${T.forest}15`}>{statusLabel}</Tag>}
          {!!analysis && !isRunning && <Tag color={T.success} bg={T.successPale}>Done</Tag>}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.inkLight} strokeWidth="2" strokeLinecap="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: 16 }}>
          {!analysis && !isRunning && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <p style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid, flex: 1, margin: 0 }}>
                Run the AI agent to get analysis, recommendations, and drafted content.
              </p>
              <Btn
                onClick={() => run.mutate()}
                disabled={run.isPending || isRunning}
                style={{ fontSize: 12, padding: "6px 14px", flexShrink: 0 }}
              >
                <SparkIcon size={12} /> Run Agent
              </Btn>
            </div>
          )}

          {isRunning && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
              <div className="ai-pulse" style={{
                width: 8, height: 8, borderRadius: "50%", background: T.forest,
              }} />
              <span style={{ fontFamily: T.fontSans, fontSize: 13, color: T.forest }}>
                {statusLabel ?? "Processing…"}
              </span>
            </div>
          )}

          {!!analysis && !isRunning && (
            <div>
              {renderResult(analysis)}
              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                <Btn variant="ghost" onClick={() => run.mutate()} disabled={run.isPending} style={{ fontSize: 11, padding: "4px 10px" }}>
                  <SparkIcon size={11} /> Re-run
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Shared result renderers ──────────────────────────────────────────

export function AIField({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: T.fontSans, fontSize: 13, color: color ?? T.ink, lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

export function AIScore({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? T.success : score >= 50 ? T.warn : T.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, width: 80 }}>{label}</div>
      <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2 }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.5s" }} />
      </div>
      <div style={{ fontFamily: T.fontMono, fontSize: 11, color, width: 30, textAlign: "right" }}>{score}</div>
    </div>
  );
}

export function AIList({ label, items, color }: { label: string; items: string[]; color?: string }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      {items.map((item, i) => (
        <div key={i} style={{ fontFamily: T.fontSans, fontSize: 12, color: color ?? "var(--text-mid)", padding: "2px 0 2px 12px", borderLeft: "2px solid var(--border)", marginBottom: 2, lineHeight: 1.5 }}>
          {item}
        </div>
      ))}
    </div>
  );
}

export function AIBadge({ value, map }: { value: string; map: Record<string, { color: string; bg: string }> }) {
  const style = map[value] ?? { color: "var(--text-mid)", bg: "var(--bg-subtle)" };
  return <Tag color={style.color} bg={style.bg}>{value}</Tag>;
}
