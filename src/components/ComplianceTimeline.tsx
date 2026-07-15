import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { Btn, FDInput, FDSelect, Card, Label, EmptyState } from "./ui-kit";

// ─── Types ─────────────────────────────────────────────────────────────

type ComplianceEvent = {
  id: string;
  module: string;
  eventType: string;
  actorType: string;
  actorName: string;
  targetType?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  summary: string;
  detail?: string | null;
  legalFlag: boolean;
  legalCategory?: string | null;
  createdAt: string | Date;
};

// ─── Helpers ───────────────────────────────────────────────────────────

const MODULE_LABELS: Record<string, string> = {
  core: "Core", payos: "PayOS", finebot: "FineBot", arc: "ARC Agent",
  workorder: "WorkOrders", boardroom: "BoardRoom", votebox: "VoteBox",
  amenity: "Amenity", commhub: "CommHub",
};

const LEGAL_CATEGORY_COLORS: Record<string, string> = {
  liability: "#dc2626", financial: "#B8883A", governance: "#2A5240",
  enforcement: "#7c3aed", contract: "#0369a1",
};

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Export Modal ──────────────────────────────────────────────────────

function ExportModal({ hoaId, onClose }: { hoaId: string; onClose: () => void }) {
  const [form, setForm] = useState({
    dateFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    dateTo: new Date().toISOString().split("T")[0],
    purpose: "board_review",
    requestedBy: "Board President",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const exportMut = useMutation({
    mutationFn: () => rpc.exportCompliancePack({
      hoaId,
      dateFrom: new Date(form.dateFrom).toISOString(),
      dateTo: new Date(form.dateTo).toISOString(),
      purpose: form.purpose,
      requestedBy: form.requestedBy,
    }),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const communitySlug = (data.exportMeta?.community || "community").replace(/\s+/g, "-");
      a.href = url;
      a.download = `GatePass-CompliancePack-${communitySlug}-${form.dateTo}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    },
  });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg)", borderRadius: 16, padding: 32, maxWidth: 480, width: "100%",
        border: `1px solid var(--border)`,
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: T.fontSans, fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>
          Export Compliance Pack
        </h2>
        <p style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", marginBottom: 24, lineHeight: 1.6 }}>
          Generates a downloadable compliance record for the selected period. Use only as a board review aid unless counsel approves external/legal use.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <Label>Date Range From</Label>
            <FDInput type="date" value={form.dateFrom} onChange={e => set("dateFrom", e.target.value)} />
          </div>
          <div>
            <Label>Date Range To</Label>
            <FDInput type="date" value={form.dateTo} onChange={e => set("dateTo", e.target.value)} />
          </div>
          <div>
            <Label>Purpose</Label>
            <FDSelect value={form.purpose} onChange={e => set("purpose", e.target.value)}>
              <option value="board_review">Board Review</option>
              <option value="pmc_transition">PMC Transition</option>
              <option value="legal_hold">Legal Hold</option>
              <option value="insurance_claim">Insurance Claim</option>
            </FDSelect>
          </div>
          <div>
            <Label>Requested By</Label>
            <FDInput value={form.requestedBy} onChange={e => set("requestedBy", e.target.value)} placeholder="Your name" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Btn onClick={() => exportMut.mutate()} disabled={exportMut.isPending}>
            {exportMut.isPending ? "Generating…" : "Download Pack"}
          </Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ────────────────────────────────────────────────────────

function EventCard({ event }: { event: ComplianceEvent }) {
  const legalColor = event.legalCategory ? LEGAL_CATEGORY_COLORS[event.legalCategory] ?? T.forest : "transparent";
  const borderColor = event.legalFlag ? legalColor : "var(--border)";

  return (
    <div style={{
      display: "flex", gap: 14, padding: "14px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* Legal flag indicator */}
      <div style={{
        width: 3, minHeight: 48, borderRadius: 2, flexShrink: 0,
        background: borderColor, alignSelf: "stretch",
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          {/* Legal badge */}
          {event.legalFlag && (
            <span style={{
              fontSize: 10, fontFamily: T.fontMono, fontWeight: 600, padding: "2px 6px",
              borderRadius: 4, background: legalColor + "18", color: legalColor,
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              ⚖ {event.legalCategory}
            </span>
          )}
          {/* Module badge */}
          <span style={{
            fontSize: 10, fontFamily: T.fontMono, color: "var(--text-light)",
            padding: "2px 6px", borderRadius: 4, background: "var(--surface)",
            border: "1px solid var(--border)",
          }}>
            {MODULE_LABELS[event.module] || event.module}
          </span>
        </div>

        <p style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text)", lineHeight: 1.5, marginBottom: 4 }}>
          {event.summary}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.fontSans, fontSize: 11, color: "var(--text-light)" }}>
            {formatDate(event.createdAt)}
          </span>
          {event.targetLabel && (
            <span style={{ fontFamily: T.fontSans, fontSize: 11, color: "var(--text-mid)" }}>
              {event.targetLabel}
            </span>
          )}
          <span style={{ fontFamily: T.fontSans, fontSize: 11, color: "var(--text-light)" }}>
            {event.actorName} · {event.actorType}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export function ComplianceTimeline({ hoaId }: { hoaId: string }) {
  const [filters, setFilters] = useState({
    module: "", legalOnly: false, search: "", dateFrom: "", dateTo: "", page: 1,
  });
  const [showExport, setShowExport] = useState(false);
  const setF = (k: string, v: unknown) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const { data, isLoading } = useQuery({
    queryKey: ["complianceTimeline", hoaId, filters],
    queryFn: () => rpc.getComplianceTimeline({
      hoaId,
      page: filters.page,
      pageSize: 25,
      module: filters.module || undefined,
      legalOnly: filters.legalOnly || undefined,
      search: filters.search || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }),
    enabled: !!hoaId,
  });

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: 24, flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.forest, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
            Compliance Record
          </div>
          <h1 style={{ fontFamily: T.fontSans, fontSize: 24, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: 0 }}>
            Compliance Timeline
          </h1>
          {data && (
            <p style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", marginTop: 4 }}>
              {data.total.toLocaleString()} events · {data.legalCount.toLocaleString()} legally significant
            </p>
          )}
        </div>
        <Btn onClick={() => setShowExport(true)}>
          ↓ Export Compliance Pack
        </Btn>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20,
        padding: "14px 16px", background: "var(--surface)", borderRadius: 10,
        border: "1px solid var(--border)",
      }}>
        <FDSelect
          value={filters.module}
          onChange={e => setF("module", e.target.value)}
          style={{ minWidth: 140 }}
        >
          <option value="">All Modules</option>
          {Object.entries(MODULE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </FDSelect>

        <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={filters.legalOnly}
            onChange={e => setF("legalOnly", e.target.checked)}
            style={{ accentColor: T.gold }}
          />
          Legal events only
        </label>

        <FDInput
          placeholder="Search…"
          value={filters.search}
          onChange={e => setF("search", e.target.value)}
          style={{ minWidth: 180 }}
        />

        <FDInput
          type="date"
          value={filters.dateFrom}
          onChange={e => setF("dateFrom", e.target.value)}
          style={{ minWidth: 140 }}
        />
        <FDInput
          type="date"
          value={filters.dateTo}
          onChange={e => setF("dateTo", e.target.value)}
          style={{ minWidth: 140 }}
        />
      </div>

      {/* Event list */}
      <Card style={{ padding: "0 20px" }}>
        {isLoading && (
          <div style={{ padding: 40, textAlign: "center", fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)" }}>
            Loading compliance history…
          </div>
        )}

        {!isLoading && data?.events.length === 0 && (
          <EmptyState
            icon="shield"
            title="No compliance events yet"
            sub="Events will appear here as your community uses GatePass modules. Every violation notice, ARC decision, vote, and board action is recorded automatically."
          />
        )}

        {!isLoading && data?.events.map(event => (
          <EventCard key={event.id} event={event as ComplianceEvent} />
        ))}
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
          <Btn
            variant="ghost"
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            disabled={filters.page <= 1}
          >
            ← Previous
          </Btn>
          <span style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)" }}>
            Page {filters.page} of {data.totalPages}
          </span>
          <Btn
            variant="ghost"
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            disabled={filters.page >= data.totalPages}
          >
            Next →
          </Btn>
        </div>
      )}

      {showExport && <ExportModal hoaId={hoaId} onClose={() => setShowExport(false)} />}
    </div>
  );
}
