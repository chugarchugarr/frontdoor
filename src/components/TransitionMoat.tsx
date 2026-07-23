import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T, GLOBAL_CSS } from "./tokens";
import { Btn, Card, Label, SectionHeader, StatusTag, Tag } from "./ui-kit";

type AssociationRecordData = Awaited<ReturnType<typeof rpc.getTransitionMoat>>;
type AssociationCase = AssociationRecordData["cases"][number];
type AssociationSignal = AssociationRecordData["signals"][number];
type BoardParticipant = AssociationRecordData["stakeholders"][number];

function formatDate(value?: Date | string | null) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatMoney(cents?: number | null) {
  if (!cents) return "Not recorded";
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

function Meter({ label, value, color = T.forest }: { label: string; value: number; color?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <Label style={{ margin: 0 }}>{label}</Label>
        <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-mid)" }}>{safeValue}/100</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "var(--bg-subtle)", overflow: "hidden" }}>
        <div style={{ width: `${safeValue}%`, height: "100%", borderRadius: 999, background: color }} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <Card style={{ padding: 18 }}>
      <Label>{label}</Label>
      <div style={{ fontFamily: T.fontSans, fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em" }}>{value}</div>
      <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-light)", marginTop: 5, lineHeight: 1.45 }}>{sub}</div>
    </Card>
  );
}

function ContinuityCard({ item }: { item: AssociationCase }) {
  const isSynthetic = item.sourceSignal === "synthetic_demo";
  return (
    <Card style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <h3 style={{ fontFamily: T.fontSans, fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", margin: 0 }}>Association continuity record</h3>
            <StatusTag status={item.status} />
            {isSynthetic && <Tag color={T.warn} bg={T.warnPale}>Synthetic demo</Tag>}
          </div>
          <p style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", lineHeight: 1.55, margin: 0 }}>{item.signalSummary}</p>
        </div>
        <Tag>{item.sourceSignal.replace(/_/g, " ")}</Tag>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Meter label="Workflow readiness" value={item.transitionScore} />
        <Meter label="Data completeness" value={item.dataCompleteness} color={T.gold} />
        <Meter label="Record depth" value={item.replicabilityScore} color={T.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 18 }}>
        <div><Label>Current operator</Label><div style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)" }}>{item.currentPmc || "Not recorded"}</div></div>
        <div><Label>Service agreement</Label><StatusTag status={isSynthetic ? "redacted" : item.contractStatus} /></div>
        <div><Label>Renewal date</Label><div style={{ fontFamily: T.fontMono, fontSize: 12, color: "var(--text-mid)" }}>{formatDate(item.renewalDate)}</div></div>
        <div><Label>Notice window</Label><div style={{ fontFamily: T.fontMono, fontSize: 12, color: "var(--text-mid)" }}>{item.noticeWindowDays ? `${item.noticeWindowDays} days` : "Not recorded"}</div></div>
        <div><Label>Recorded exit cost</Label><div style={{ fontFamily: T.fontMono, fontSize: 12, color: "var(--text-mid)" }}>{formatMoney(item.terminationFeeCents)}</div></div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
        {item.complaintThemes.map((theme) => <Tag key={theme}>{theme.replace(/_/g, " ")}</Tag>)}
      </div>

      {(item.boardFear || item.decidingProof || item.nextStep) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
          {item.boardFear && <div style={{ padding: 14, background: "var(--bg-subtle)", borderRadius: 12 }}><Label>Board concern</Label><p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-mid)" }}>{item.boardFear}</p></div>}
          {item.decidingProof && <div style={{ padding: 14, background: T.forestPale, borderRadius: 12 }}><Label>Decision evidence</Label><p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-mid)" }}>{item.decidingProof}</p></div>}
          {item.nextStep && <div style={{ padding: 14, background: T.goldLight, borderRadius: 12 }}><Label>Board-approved next step</Label><p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-mid)" }}>{item.nextStep}</p></div>}
        </div>
      )}
    </Card>
  );
}

export function TransitionMoat({ hoaId }: { hoaId: string }) {
  const [recordPack, setRecordPack] = React.useState<unknown>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["association-records", hoaId],
    queryFn: () => rpc.getTransitionMoat(hoaId),
  });
  const primaryCaseId = data?.cases[0]?.id;
  const exportRecord = useMutation({
    mutationFn: () => rpc.exportPilotProofPack({ hoaId, transitionCaseId: primaryCaseId, requestedBy: "GatePass Operator" }),
    onSuccess: (pack) => setRecordPack(pack),
  });

  return (
    <div className="gp-association-record-shell" style={{ minHeight: "100vh", background: "var(--bg)", padding: 28 }}>
      <style>{GLOBAL_CSS}{`
        @media (max-width: 760px) {
          .gp-association-record-shell { padding: 16px !important; }
          .gp-association-record-grid { grid-template-columns: 1fr !important; }
          .gp-association-summary { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 390px) {
          .gp-association-summary { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <SectionHeader
          title="Permanent Association Record"
          sub="Modeled demo of how permissions, contractor records, work evidence, and board decisions remain with the association."
          action={<Btn onClick={() => exportRecord.mutate()} disabled={!primaryCaseId || exportRecord.isPending}>Sample Export</Btn>}
        />

        <Card style={{ padding: "20px 22px", marginBottom: 18, background: "linear-gradient(135deg, #1C1C1A, #2A5240)", color: "white" }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.58)", marginBottom: 8 }}>Association-owned continuity</div>
          <div style={{ fontFamily: T.fontSans, fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>The operating history stays with the community.</div>
          <div style={{ fontFamily: T.fontSans, fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.78)" }}>A management company may work inside GatePass. It does not own the workflow, data, or export.</div>
        </Card>

        {isLoading && <div style={{ padding: 48, textAlign: "center", fontFamily: T.fontSans, color: "var(--text-light)" }}>Loading association record…</div>}

        {data && (
          <>
            <div className="gp-association-summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
              <SummaryCard label="Continuity records" value={data.summary.transitionCases} sub="Modeled association records" />
              <SummaryCard label="Private signals" value={data.summary.privateSignals} sub="Restricted association context" />
              <SummaryCard label="Record score" value={"recordWeight" in data.summary ? Number(data.summary.recordWeight) : 0} sub="Modeled record weight" />
              <SummaryCard label="Record events" value={data.summary.complianceEvents} sub={`${data.summary.legalComplianceEvents} governance highlights`} />
            </div>

            <div className="gp-association-record-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.8fr)", gap: 18, alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {data.cases.map((item: AssociationCase) => <ContinuityCard key={item.id} item={item} />)}
                {data.cases.length === 0 && <Card style={{ padding: 40, textAlign: "center", color: "var(--text-light)", fontFamily: T.fontSans }}>No modeled continuity record is available.</Card>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Card style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Board participants</h3>
                  {data.stakeholders.map((person: BoardParticipant) => (
                    <div key={person.id} style={{ padding: "12px 0", borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong style={{ fontFamily: T.fontSans, fontSize: 13 }}>{person.name}</strong><StatusTag status={person.stance} /></div>
                      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "var(--text-light)", textTransform: "uppercase", marginTop: 4 }}>{person.role.replace(/_/g, " ")}</div>
                      {person.primaryConcern && <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5, margin: "8px 0 0" }}>{person.primaryConcern}</p>}
                    </div>
                  ))}
                </Card>

                <Card style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Association signals</h3>
                  {data.signals.slice(0, 10).map((signal: AssociationSignal) => (
                    <div key={signal.id} style={{ padding: "12px 0", borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><strong style={{ fontFamily: T.fontSans, fontSize: 13 }}>{signal.label}</strong><Tag color={signal.isPubliclyReplicable ? T.warn : T.success} bg={signal.isPubliclyReplicable ? T.warnPale : T.successPale}>{signal.isPubliclyReplicable ? "public" : "private"}</Tag></div>
                      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "var(--text-light)", textTransform: "uppercase", marginTop: 4 }}>{signal.category.replace(/_/g, " ")} · weight {signal.moatWeight}</div>
                      <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5, margin: "8px 0 0" }}>{signal.evidence}</p>
                    </div>
                  ))}
                </Card>
              </div>
            </div>

            {recordPack !== null && (
              <Card style={{ padding: 22, marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ fontFamily: T.fontSans, fontSize: 17, fontWeight: 800 }}>Redacted Association Record</h3><Btn variant="ghost" onClick={() => setRecordPack(null)}>Close</Btn></div>
                <p style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", lineHeight: 1.6, marginBottom: 16 }}>The public demo export summarizes modeled data without exposing stakeholder contacts, internal identifiers, private notes, or contract terms.</p>
                {(() => {
                  const pack = recordPack as { title?: string; generatedAt?: string; complianceSummary?: { totalEvents?: number; legalEvents?: number }; firstPilotProofChecklist?: string[]; topSignals?: { label: string; evidence: string }[] };
                  return (
                    <div style={{ display: "grid", gap: 12 }}>
                      <Card style={{ padding: 16 }}><Label>Title</Label><div style={{ fontFamily: T.fontSans, fontWeight: 700 }}>{pack.title}</div><div style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)", marginTop: 6 }}>{pack.generatedAt}</div></Card>
                      <Card style={{ padding: 16 }}><Label>Record summary</Label><div style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)" }}>{pack.complianceSummary?.totalEvents ?? 0} modeled events · {pack.complianceSummary?.legalEvents ?? 0} governance highlights</div></Card>
                      <Card style={{ padding: 16 }}><Label>Redacted signals</Label><ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>{(pack.topSignals ?? []).slice(0, 4).map((signal) => <li key={signal.label} style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", marginBottom: 6 }}><strong>{signal.label}:</strong> {signal.evidence}</li>)}</ul></Card>
                      <Card style={{ padding: 16 }}><Label>First live workflow checklist</Label><ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>{(pack.firstPilotProofChecklist ?? []).map((item) => <li key={item} style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", marginBottom: 5 }}>{item}</li>)}</ul></Card>
                    </div>
                  );
                })()}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}