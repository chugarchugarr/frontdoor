import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { SectionHeader, Btn, Card, StatusTag, Tag, EmptyState, Modal, FDInput, FDSelect, FDTextarea, Icons, Label } from "./ui-kit";
import { AIPanel, AIField, AIList, AIScore } from "./AIPanel";

const PROJECT_TYPES = ["fence","paint","addition","shed","pool","landscaping","roof","solar","deck","driveway","other"];

export function ARCAgent({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [reviewModal, setReviewModal] = useState<string | null>(null);
  const [form, setForm] = useState({ homeownerId: "", address: "", projectType: "", description: "", estimatedCost: "" });
  const [reviewForm, setReviewForm] = useState({ status: "approved" as "approved" | "denied" | "revision_requested", reviewedBy: "", reviewNotes: "", conditions: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setRF = (k: string, v: string) => setReviewForm(f => ({ ...f, [k]: v }));

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["arc", hoaId],
    queryFn: () => rpc.getARCRequests(hoaId),
  });

  const { data: homeowners = [] } = useQuery({
    queryKey: ["homeowners", hoaId],
    queryFn: () => rpc.getHomeowners(hoaId),
  });

  const createMut = useMutation({
    mutationFn: () => rpc.submitARCRequest({
      hoaId,
      homeownerId: form.homeownerId,
      address: form.address,
      projectType: form.projectType,
      description: form.description,
      estimatedCost: form.estimatedCost ? Math.round(parseFloat(form.estimatedCost) * 100) : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["arc"] }); setModal(false); setForm({ homeownerId: "", address: "", projectType: "", description: "", estimatedCost: "" }); },
  });

  const reviewMut = useMutation({
    mutationFn: (id: string) => rpc.reviewARCRequest({ id, ...reviewForm }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["arc"] }); setReviewModal(null); },
  });

  type ARC = { id: string; address: string; projectType: string; description: string; status: string; estimatedCost: number | null; reviewDeadline: Date | string; submittedAt: Date | string; homeowner: { name: string; email: string; address: string } };
  const pending = (requests as ARC[]).filter(r => ["submitted", "under_review"].includes(r.status));
  const decided = (requests as ARC[]).filter(r => !["submitted", "under_review"].includes(r.status));

  const daysLeft = (deadline: string) => {
    const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return d;
  };

  return (
    <div style={{ padding: "32px 40px", minHeight: "100vh" }} className="main-pad">
      <SectionHeader
        title="ARC Agent — Architectural Review"
        sub="45-day review window, automated deadline tracking, board routing"
        action={<Btn onClick={() => setModal(true)}><Icons.Plus /> New Request</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 32 }}>
        {[
          { label: "Pending Review", value: pending.length, color: pending.length > 0 ? T.blue : "var(--text)" },
          { label: "Approved",       value: (requests as ARC[]).filter(r => r.status === "approved").length,  color: T.success },
          { label: "Denied",         value: (requests as ARC[]).filter(r => r.status === "denied").length,   color: T.danger },
        ].map(s => (
          <Card key={s.label} style={{ padding: "20px 24px", borderRadius: 16 }}>
            <Label>{s.label}</Label>
            <div style={{ fontFamily: T.fontSans, fontSize: 32, fontWeight: 700, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {isLoading && <div style={{ padding: 40, textAlign: "center", color: T.inkLight }}>Loading...</div>}
      {!isLoading && pending.length === 0 && <EmptyState icon="📐" title="No pending ARC requests" sub="Homeowners submit modifications for board approval." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {pending.map(r => {
          const days = daysLeft(String(r.reviewDeadline));
          return (
            <Card key={r.id} style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: T.ink }}>{r.address}</span>
                    <Tag>{r.projectType}</Tag>
                    <StatusTag status={r.status} />
                  </div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid, marginBottom: 4 }}>{r.description}</div>
                  <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>{r.homeowner.name} · {r.homeowner.email}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight }}>Days remaining</div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: days < 7 ? T.danger : days < 14 ? T.warn : T.forest }}>{days}</div>
                  {r.estimatedCost && <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight, marginTop: 2 }}>${(r.estimatedCost/100).toLocaleString()}</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
                <Btn style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => { setReviewForm({ status: "approved", reviewedBy: "", reviewNotes: "", conditions: "" }); setReviewModal(r.id); }}>
                  Review
                </Btn>
                <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight, alignSelf: "center", marginLeft: "auto" }}>
                  Submitted {new Date(r.submittedAt).toLocaleDateString()} · Deadline {new Date(r.reviewDeadline).toLocaleDateString()}
                </div>
              </div>
              <AIPanel
                label="ARC Agent AI"
                description="reviews against CC&Rs, recommends approval/denial"
                runFn={() => rpc.runARCReview(r.id)}
                fetchFn={() => rpc.getAIAnalysis({ type: "arc", id: r.id })}
                queryKey={["arc", hoaId]}
                alreadyAnalyzed={!!(r as ARC & { aiAnalysis?: string | null }).aiAnalysis}
                renderResult={(data) => {
                  const d = data as { recommendation?: string; confidence?: number; ccr_sections?: string[]; conditions?: string[]; concerns?: string[]; decision_letter?: string };
                  return (
                    <div>
                      {d.recommendation && (
                        <AIField label="Recommendation" value={d.recommendation.toUpperCase()} color={d.recommendation === "approve" ? T.success : d.recommendation === "deny" ? T.danger : T.warn} />
                      )}
                      {d.confidence != null && <AIScore label="Confidence" score={d.confidence} />}
                      {d.ccr_sections && <AIList label="CC&R Sections" items={d.ccr_sections} />}
                      {d.conditions && <AIList label="Conditions" items={d.conditions} color={T.gold} />}
                      {d.concerns && <AIList label="Concerns" items={d.concerns} color={T.danger} />}
                      {d.decision_letter && <AIField label="Draft Decision Letter" value={<span style={{ whiteSpace: "pre-wrap" }}>{d.decision_letter}</span>} />}
                    </div>
                  );
                }}
              />
            </Card>
          );
        })}
      </div>

      {decided.length > 0 && (
        <div>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Decided ({decided.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {decided.map(r => (
              <Card key={r.id} style={{ padding: "14px 20px", opacity: 0.7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600 }}>{r.address}</span>
                    <span style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginLeft: 8 }}>{r.projectType}</span>
                  </div>
                  <StatusTag status={r.status} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Submit ARC request modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Submit ARC Request">
        {(homeowners as {id:string;name:string;address:string}[]).length > 0 && (
          <FDSelect label="Homeowner" value={form.homeownerId} onChange={e => { set("homeownerId", e.target.value); const h = (homeowners as {id:string;address:string}[]).find(x => x.id === e.target.value); if(h) set("address", h.address); }}>
            <option value="">Select homeowner</option>
            {(homeowners as {id:string;name:string;address:string}[]).map(h => <option key={h.id} value={h.id}>{h.name} — {h.address}</option>)}
          </FDSelect>
        )}
        <FDInput label="Property Address" placeholder="Modeled Address 1" value={form.address} onChange={e => set("address", e.target.value)} />
        <FDSelect label="Project Type" value={form.projectType} onChange={e => set("projectType", e.target.value)}>
          <option value="">Select type</option>
          {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </FDSelect>
        <FDTextarea label="Project Description" placeholder="Describe the proposed modification..." value={form.description} onChange={e => set("description", e.target.value)} />
        <FDInput label="Estimated Cost ($)" type="number" placeholder="5000" value={form.estimatedCost} onChange={e => set("estimatedCost", e.target.value)} />
        <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginBottom: 16 }}>⏱ 45-day review window starts at submission.</div>
        <Btn full onClick={() => createMut.mutate()} disabled={!form.address || !form.projectType || !form.description || createMut.isPending}>
          {createMut.isPending ? "Submitting…" : "Submit for Review"}
        </Btn>
      </Modal>

      {/* Review modal */}
      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)} title="Board Decision">
        <FDSelect label="Decision" value={reviewForm.status} onChange={e => setRF("status", e.target.value as "approved"|"denied"|"revision_requested")}>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="revision_requested">Revision Requested</option>
        </FDSelect>
        <FDInput label="Reviewed By" placeholder="Board member name" value={reviewForm.reviewedBy} onChange={e => setRF("reviewedBy", e.target.value)} />
        <FDTextarea label="Notes" placeholder="Review comments..." value={reviewForm.reviewNotes} onChange={e => setRF("reviewNotes", e.target.value)} />
        {reviewForm.status === "approved" && <FDTextarea label="Conditions (optional)" placeholder="Approved subject to..." value={reviewForm.conditions} onChange={e => setRF("conditions", e.target.value)} />}
        <Btn full onClick={() => reviewMut.mutate(reviewModal!)} disabled={!reviewForm.reviewedBy || reviewMut.isPending}>
          {reviewMut.isPending ? "Saving…" : "Submit Decision"}
        </Btn>
      </Modal>
    </div>
  );
}
