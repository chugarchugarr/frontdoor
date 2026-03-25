import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { SectionHeader, Btn, Card, StatusTag, Tag, EmptyState, Modal, FDInput, FDSelect, FDTextarea, Icons, Label } from "./ui-kit";
import { AIPanel, AIField, AIList, AIScore, AIBadge } from "./AIPanel";

const CATEGORIES = ["landscaping","parking","architectural","noise","trash","pet","other"];
const SEVERITIES = ["minor","moderate","major"];

export function Violations({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ address: "", category: "", description: "", severity: "minor", reportedBy: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data: violations = [], isLoading } = useQuery({
    queryKey: ["violations", hoaId],
    queryFn: () => rpc.getViolations(hoaId),
  });

  const createMut = useMutation({
    mutationFn: () => rpc.createViolation({ hoaId, ...form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["violations"] }); setModal(false); setForm({ address: "", category: "", description: "", severity: "minor", reportedBy: "" }); },
  });

  const noticeMut = useMutation({
    mutationFn: (id: string) => rpc.sendViolationNotice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["violations"] }),
  });

  const resolveMut = useMutation({
    mutationFn: (id: string) => rpc.resolveViolation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["violations"] }),
  });

  type ViolationRow = {id:string;address:string;category:string;description:string;severity:string;status:string;noticeCount:number;fineCents:number|null;createdAt:Date|string;homeowner:{name:string;email:string}|null;notices:{id:string}[];resolvedAt:Date|string|null};
  const allViolations = violations as ViolationRow[];
  const open = allViolations.filter(v => v.status !== "resolved" && v.status !== "cancelled");
  const resolved = allViolations.filter(v => v.status === "resolved");

  return (
    <div style={{ padding: "32px 40px", minHeight: "100vh" }} className="main-pad">
      <SectionHeader
        title="FineBot — Violations"
        sub="Automated violation tracking, notice generation, and escalation"
        action={<Btn onClick={() => setModal(true)}><Icons.Plus /> Log Violation</Btn>}
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Open", value: open.length, color: open.length > 0 ? T.danger : T.success },
          { label: "Escalated", value: (violations as {status:string}[]).filter(v => v.status === "escalated").length, color: T.danger },
          { label: "Resolved", value: resolved.length, color: T.success },
        ].map(s => (
          <Card key={s.label} style={{ padding: "16px 20px" }}>
            <Label>{s.label}</Label>
            <div style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Open violations */}
      {isLoading && <div style={{ color: T.inkLight, fontFamily: T.fontSans, padding: 40, textAlign: "center" }}>Loading...</div>}
      {!isLoading && open.length === 0 && <EmptyState icon="✅" title="No open violations" sub="Your community is in compliance." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {open.map(v => (
          <Card key={v.id} style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: T.ink }}>{v.address}</span>
                  <Tag color={v.severity === "major" ? T.danger : v.severity === "moderate" ? T.warn : T.inkMid}
                       bg={v.severity === "major" ? T.dangerPale : v.severity === "moderate" ? T.warnPale : T.creamDark}>
                    {v.severity}
                  </Tag>
                  <Tag>{v.category}</Tag>
                  <StatusTag status={v.status} />
                </div>
                <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid, marginBottom: 4 }}>{v.description}</div>
                {v.homeowner && <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>{v.homeowner.name} · {v.homeowner.email}</div>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight }}>Notices sent</div>
                <div style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 700, color: v.noticeCount > 1 ? T.danger : T.charcoal }}>{v.noticeCount}</div>
                {v.fineCents && <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.danger, marginTop: 2 }}>${v.fineCents/100} fine</div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${T.stone}30` }}>
              <Btn variant="outline" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => noticeMut.mutate(v.id)} disabled={noticeMut.isPending}>
                Send Notice #{v.noticeCount + 1}
              </Btn>
              <Btn variant="ghost" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => resolveMut.mutate(v.id)} disabled={resolveMut.isPending}>
                Mark Resolved
              </Btn>
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, alignSelf: "center", marginLeft: "auto" }}>
                {new Date(v.createdAt).toLocaleDateString()}
              </div>
            </div>
            <AIPanel
              label="FineBot AI"
              description="classifies violation, cites CC&Rs, drafts notice"
              runFn={() => rpc.runViolationClassification(v.id)}
              fetchFn={() => rpc.getAIAnalysis({ type: "violation", id: v.id })}
              queryKey={["violations", hoaId]}
              alreadyAnalyzed={!!(v as ViolationRow & { aiAnalysis?: string | null }).aiAnalysis}
              renderResult={(data) => {
                const d = data as { category?: string; severity?: string; ccr_section?: string; fine_recommended_cents?: number; notice_draft?: string; escalation_risk?: number; flags?: string[] };
                return (
                  <div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {d.category && <AIBadge value={d.category} map={{ landscaping: { color: T.forest, bg: T.forestPale }, parking: { color: T.blue, bg: T.bluePale }, architectural: { color: T.gold, bg: T.goldLight }, noise: { color: T.purple, bg: T.purplePale }, trash: { color: T.inkMid, bg: T.creamDark } }} />}
                      {d.severity && <AIBadge value={d.severity} map={{ minor: { color: T.inkMid, bg: T.creamDark }, moderate: { color: T.warn, bg: T.warnPale }, major: { color: T.danger, bg: T.dangerPale } }} />}
                    </div>
                    {d.ccr_section && <AIField label="CC&R Section" value={d.ccr_section} />}
                    {d.fine_recommended_cents != null && <AIField label="Recommended Fine" value={`$${(d.fine_recommended_cents/100).toFixed(0)}`} color={T.danger} />}
                    {d.escalation_risk != null && <AIScore label="Escalation Risk" score={d.escalation_risk} />}
                    {d.flags && <AIList label="Flags" items={d.flags} color={T.danger} />}
                    {d.notice_draft && <AIField label="Draft Notice" value={<span style={{ whiteSpace: "pre-wrap" }}>{d.notice_draft}</span>} />}
                  </div>
                );
              }}
            />
          </Card>
        ))}
      </div>

      {resolved.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Resolved ({resolved.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {resolved.map(v => (
              <Card key={v.id} style={{ padding: "14px 20px", opacity: 0.65 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600 }}>{v.address}</span>
                    <span style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginLeft: 8 }}>{v.category} · {v.description.slice(0,60)}{v.description.length > 60 ? "…" : ""}</span>
                  </div>
                  <StatusTag status="resolved" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Log Violation">
        <FDInput label="Property Address" placeholder="1847 Oakwood Dr" value={form.address} onChange={e => set("address", e.target.value)} />
        <FDSelect label="Category" value={form.category} onChange={e => set("category", e.target.value)}>
          <option value="">Select category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </FDSelect>
        <FDSelect label="Severity" value={form.severity} onChange={e => set("severity", e.target.value)}>
          {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
        </FDSelect>
        <FDTextarea label="Description" placeholder="Describe the violation..." value={form.description} onChange={e => set("description", e.target.value)} />
        <FDInput label="Reported By" placeholder="Board member name" value={form.reportedBy} onChange={e => set("reportedBy", e.target.value)} />
        <Btn full onClick={() => createMut.mutate()} disabled={!form.address || !form.category || !form.description || createMut.isPending}>
          {createMut.isPending ? "Logging…" : "Log Violation"}
        </Btn>
        {createMut.isError && <div style={{ marginTop: 12, color: T.danger, fontFamily: T.fontSans, fontSize: 13 }}>Error — please try again.</div>}
      </Modal>
    </div>
  );
}
