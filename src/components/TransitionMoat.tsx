import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { Btn, Card, FDInput, FDSelect, FDTextarea, Label, SectionHeader, StatusTag, Tag } from "./ui-kit";

type MoatData = Awaited<ReturnType<typeof rpc.getTransitionMoat>>;
type TransitionCase = MoatData["cases"][number];
type MoatSignal = MoatData["signals"][number];
type BoardStakeholder = MoatData["stakeholders"][number];
type SignalCategory = "board_objection" | "contract_fact" | "pmc_failure" | "switching_trigger" | "compliance_risk" | "proof_artifact" | "case_study_metric";
type SignalConfidence = "low" | "medium" | "high" | "verified";
type StakeholderStance = "champion" | "supporter" | "neutral" | "blocker" | "unknown";

const themeOptions = ["responsiveness", "billing", "violations", "arc", "maintenance", "board_packet", "vendor", "contract_exit", "resident_comms"];

function money(cents?: number | null) {
  if (!cents) return "—";
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Meter({ label, value, color = T.forest }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <Label style={{ margin: 0 }}>{label}</Label>
        <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-mid)" }}>{value}/100</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "var(--bg-subtle)", overflow: "hidden" }}>
        <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: "100%", borderRadius: 999, background: color }} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card style={{ padding: 18 }}>
      <Label>{label}</Label>
      <div style={{ fontFamily: T.fontSans, fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em" }}>{value}</div>
      {sub && <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-light)", marginTop: 5, lineHeight: 1.45 }}>{sub}</div>}
    </Card>
  );
}

function CaseCard({ transitionCase }: { transitionCase: TransitionCase }) {
  return (
    <Card style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <h3 style={{ fontFamily: T.fontSans, fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>{transitionCase.currentPmc} exit case</h3>
            <StatusTag status={transitionCase.status} />
          </div>
          <p style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", lineHeight: 1.55, margin: 0 }}>{transitionCase.signalSummary}</p>
        </div>
        <Tag color={transitionCase.sourceSignal === "google_review" ? T.gold : T.forest} bg={transitionCase.sourceSignal === "google_review" ? T.goldLight : T.forestPale}>{transitionCase.sourceSignal.replace(/_/g, " ")}</Tag>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Meter label="Exit readiness" value={transitionCase.transitionScore} />
        <Meter label="Data completeness" value={transitionCase.dataCompleteness} color={T.gold} />
        <Meter label="Hard to copy" value={transitionCase.replicabilityScore} color={T.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 18 }}>
        <div><Label>Contract</Label><StatusTag status={transitionCase.contractStatus} /></div>
        <div><Label>Renewal</Label><div style={{ fontFamily: T.fontMono, fontSize: 12, color: "var(--text-mid)" }}>{formatDate(transitionCase.renewalDate)}</div></div>
        <div><Label>Notice window</Label><div style={{ fontFamily: T.fontMono, fontSize: 12, color: "var(--text-mid)" }}>{transitionCase.noticeWindowDays ?? "—"} days</div></div>
        <div><Label>Exit fee</Label><div style={{ fontFamily: T.fontMono, fontSize: 12, color: "var(--text-mid)" }}>{money(transitionCase.terminationFeeCents)}</div></div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
        {transitionCase.complaintThemes.map((theme) => <Tag key={theme}>{theme.replace(/_/g, " ")}</Tag>)}
      </div>

      {(transitionCase.boardFear || transitionCase.decidingProof || transitionCase.nextStep) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
          {transitionCase.boardFear && <div style={{ padding: 14, background: "var(--bg-subtle)", borderRadius: 12 }}><Label>Board fear</Label><p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-mid)" }}>{transitionCase.boardFear}</p></div>}
          {transitionCase.decidingProof && <div style={{ padding: 14, background: T.forestPale, borderRadius: 12 }}><Label>Deciding proof</Label><p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-mid)" }}>{transitionCase.decidingProof}</p></div>}
          {transitionCase.nextStep && <div style={{ padding: 14, background: T.goldLight, borderRadius: 12 }}><Label>Next step</Label><p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-mid)" }}>{transitionCase.nextStep}</p></div>}
        </div>
      )}
    </Card>
  );
}

export function TransitionMoat({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [caseForm, setCaseForm] = React.useState(false);
  const [signalForm, setSignalForm] = React.useState(false);
  const [stakeholderForm, setStakeholderForm] = React.useState(false);
  const [proofPack, setProofPack] = React.useState<unknown>(null);
  const [newCase, setNewCase] = React.useState({ currentPmc: "", sourceSignal: "google_review", signalSummary: "", complaintThemes: ["responsiveness", "contract_exit"], contractStatus: "unknown", boardFear: "", nextStep: "" });
  const [newSignal, setNewSignal] = React.useState<{ category: SignalCategory; label: string; evidence: string; source: string; confidence: SignalConfidence; isPubliclyReplicable: boolean; moatWeight: number }>({ category: "board_objection", label: "", evidence: "", source: "board_call", confidence: "high", isPubliclyReplicable: false, moatWeight: 5 });
  const [newStakeholder, setNewStakeholder] = React.useState<{ name: string; role: string; stance: StakeholderStance; primaryConcern: string; persuasionAngle: string }>({ name: "", role: "president", stance: "unknown", primaryConcern: "", persuasionAngle: "" });

  const { data, isLoading } = useQuery({ queryKey: ["transition-moat", hoaId], queryFn: () => rpc.getTransitionMoat(hoaId) });
  const primaryCaseId = data?.cases[0]?.id;

  const createCase = useMutation({
    mutationFn: () => rpc.createTransitionCase({ hoaId, ...newCase }),
    onSuccess: () => { setCaseForm(false); qc.invalidateQueries({ queryKey: ["transition-moat", hoaId] }); },
  });
  const addSignal = useMutation({
    mutationFn: () => rpc.addMoatSignal({ hoaId, transitionCaseId: primaryCaseId, ...newSignal }),
    onSuccess: () => { setSignalForm(false); qc.invalidateQueries({ queryKey: ["transition-moat", hoaId] }); },
  });
  const addStakeholder = useMutation({
    mutationFn: () => rpc.addBoardStakeholder({ hoaId, transitionCaseId: primaryCaseId, ...newStakeholder }),
    onSuccess: () => { setStakeholderForm(false); qc.invalidateQueries({ queryKey: ["transition-moat", hoaId] }); },
  });
  const exportProof = useMutation({
    mutationFn: () => rpc.exportPilotProofPack({ hoaId, transitionCaseId: primaryCaseId, requestedBy: "GatePass Operator" }),
    onSuccess: (pack) => setProofPack(pack),
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: 28 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <SectionHeader
          title="Transition Graph"
          sub="The uncopiable layer: every PMC exit becomes structured board psychology, contract intelligence, transition proof, and compliance memory."
          action={<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Btn variant="outline" onClick={() => setCaseForm(!caseForm)}>PMC Intake</Btn><Btn variant="ghost" onClick={() => setStakeholderForm(!stakeholderForm)} disabled={!primaryCaseId}>Board Map</Btn><Btn variant="gold" onClick={() => setSignalForm(!signalForm)} disabled={!primaryCaseId}>Moat Signal</Btn><Btn onClick={() => exportProof.mutate()} disabled={!primaryCaseId || exportProof.isPending}>Export Proof Pack</Btn></div>}
        />

        <Card style={{ padding: "18px 22px", marginBottom: 18, background: "linear-gradient(135deg, #1C1C1A, #2A5240)", color: "white" }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.58)", marginBottom: 8 }}>Investor-safe moat thesis</div>
          <div style={{ fontFamily: T.fontSans, fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Public HOA data is the wedge. Private PMC exit memory is the moat.</div>
          <div style={{ fontFamily: T.fontSans, fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.78)" }}>Competitors can scrape HOA names and bad PMC reviews. They cannot instantly replicate private contract terms, board-level switching psychology, transition failure modes, compliance timelines, and before/after operating benchmarks from real HOA exits.</div>
        </Card>

        {isLoading && <div style={{ padding: 48, textAlign: "center", fontFamily: T.fontSans, color: "var(--text-light)" }}>Loading transition memory…</div>}

        {data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
              <SummaryCard label="Exit cases" value={data.summary.transitionCases} sub="Prospects converted into transition memory" />
              <SummaryCard label="Private signals" value={data.summary.privateSignals} sub="Not publicly scrapeable" />
              <SummaryCard label="Weighted moat" value={data.summary.weightedMoat} sub="Signal weight × private multiplier" />
              <SummaryCard label="Compliance events" value={data.summary.complianceEvents} sub={`${data.summary.legalComplianceEvents} legally significant`} />
            </div>

            {caseForm && (
              <Card style={{ padding: 22, marginBottom: 18 }}>
                <h3 style={{ fontFamily: T.fontSans, fontSize: 17, fontWeight: 800, marginBottom: 18 }}>PMC Exit Intake</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  <FDInput label="Current PMC" value={newCase.currentPmc} onChange={(e) => setNewCase({ ...newCase, currentPmc: e.target.value })} placeholder="RealManage" />
                  <FDSelect label="Source" value={newCase.sourceSignal} onChange={(e) => setNewCase({ ...newCase, sourceSignal: e.target.value })}><option value="google_review">Google review</option><option value="board_conversation">Board conversation</option><option value="referral">Referral</option><option value="public_meeting">Public meeting</option><option value="inbound">Inbound</option><option value="other">Other</option></FDSelect>
                  <FDSelect label="Contract status" value={newCase.contractStatus} onChange={(e) => setNewCase({ ...newCase, contractStatus: e.target.value })}><option value="unknown">Unknown</option><option value="in_window">In notice window</option><option value="auto_renewed">Auto-renewed</option><option value="locked">Locked</option><option value="month_to_month">Month-to-month</option><option value="expired">Expired</option></FDSelect>
                </div>
                <FDTextarea label="Signal summary" value={newCase.signalSummary} onChange={(e) => setNewCase({ ...newCase, signalSummary: e.target.value })} placeholder="What public/private signal says this board may need an exit path…" />
                <FDTextarea label="Board fear" value={newCase.boardFear} onChange={(e) => setNewCase({ ...newCase, boardFear: e.target.value })} placeholder="What they fear will break if they leave the PMC…" />
                <FDTextarea label="Next step" value={newCase.nextStep} onChange={(e) => setNewCase({ ...newCase, nextStep: e.target.value })} placeholder="The next board-safe transition action…" />
                <div style={{ marginBottom: 18 }}><Label>Complaint themes</Label><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{themeOptions.map((theme) => { const active = newCase.complaintThemes.includes(theme); return <button key={theme} onClick={() => setNewCase({ ...newCase, complaintThemes: active ? newCase.complaintThemes.filter((t) => t !== theme) : [...newCase.complaintThemes, theme] })} style={{ border: "none", borderRadius: 999, padding: "5px 11px", fontFamily: T.fontMono, fontSize: 10, textTransform: "uppercase", cursor: "pointer", background: active ? T.forest : "var(--bg-subtle)", color: active ? "white" : "var(--text-mid)" }}>{theme.replace(/_/g, " ")}</button>; })}</div></div>
                <Btn onClick={() => createCase.mutate()} disabled={!newCase.currentPmc || !newCase.signalSummary || createCase.isPending}>Create exit case</Btn>
              </Card>
            )}

            {stakeholderForm && (
              <Card style={{ padding: 22, marginBottom: 18 }}>
                <h3 style={{ fontFamily: T.fontSans, fontSize: 17, fontWeight: 800, marginBottom: 18 }}>Board Psychology Map</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  <FDInput label="Name" value={newStakeholder.name} onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })} />
                  <FDSelect label="Role" value={newStakeholder.role} onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}><option value="president">President</option><option value="treasurer">Treasurer</option><option value="secretary">Secretary</option><option value="director">Director</option><option value="homeowner_voice">Homeowner voice</option><option value="vendor">Vendor</option><option value="other">Other</option></FDSelect>
                  <FDSelect label="Stance" value={newStakeholder.stance} onChange={(e) => setNewStakeholder({ ...newStakeholder, stance: e.target.value as StakeholderStance })}><option value="champion">Champion</option><option value="supporter">Supporter</option><option value="neutral">Neutral</option><option value="blocker">Blocker</option><option value="unknown">Unknown</option></FDSelect>
                </div>
                <FDTextarea label="Primary concern" value={newStakeholder.primaryConcern} onChange={(e) => setNewStakeholder({ ...newStakeholder, primaryConcern: e.target.value })} />
                <FDTextarea label="Persuasion angle" value={newStakeholder.persuasionAngle} onChange={(e) => setNewStakeholder({ ...newStakeholder, persuasionAngle: e.target.value })} />
                <Btn onClick={() => addStakeholder.mutate()} disabled={!newStakeholder.name || addStakeholder.isPending}>Add stakeholder</Btn>
              </Card>
            )}

            {signalForm && (
              <Card style={{ padding: 22, marginBottom: 18 }}>
                <h3 style={{ fontFamily: T.fontSans, fontSize: 17, fontWeight: 800, marginBottom: 18 }}>Moat Signal Capture</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <FDSelect label="Category" value={newSignal.category} onChange={(e) => setNewSignal({ ...newSignal, category: e.target.value as SignalCategory })}><option value="board_objection">Board objection</option><option value="contract_fact">Contract fact</option><option value="pmc_failure">PMC failure</option><option value="switching_trigger">Switching trigger</option><option value="compliance_risk">Compliance risk</option><option value="proof_artifact">Proof artifact</option><option value="case_study_metric">Case-study metric</option></FDSelect>
                  <FDSelect label="Source" value={newSignal.source} onChange={(e) => setNewSignal({ ...newSignal, source: e.target.value })}><option value="board_call">Board call</option><option value="board_email">Board email</option><option value="document">Document</option><option value="meeting">Meeting</option><option value="public">Public</option><option value="platform_usage">Platform usage</option><option value="operator_note">Operator note</option></FDSelect>
                  <FDSelect label="Confidence" value={newSignal.confidence} onChange={(e) => setNewSignal({ ...newSignal, confidence: e.target.value as SignalConfidence })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="verified">Verified</option></FDSelect>
                  <FDInput label="Moat weight 1–5" type="number" min={1} max={5} value={newSignal.moatWeight} onChange={(e) => setNewSignal({ ...newSignal, moatWeight: Number(e.target.value) })} />
                </div>
                <FDInput label="Label" value={newSignal.label} onChange={(e) => setNewSignal({ ...newSignal, label: e.target.value })} />
                <FDTextarea label="Evidence" value={newSignal.evidence} onChange={(e) => setNewSignal({ ...newSignal, evidence: e.target.value })} />
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", marginBottom: 18 }}><input type="checkbox" checked={newSignal.isPubliclyReplicable} onChange={(e) => setNewSignal({ ...newSignal, isPubliclyReplicable: e.target.checked })} />Publicly replicable signal</label>
                <Btn onClick={() => addSignal.mutate()} disabled={!newSignal.label || !newSignal.evidence || addSignal.isPending}>Capture moat signal</Btn>
              </Card>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.8fr)", gap: 18, alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {data.cases.map((c) => <CaseCard key={c.id} transitionCase={c} />)}
                {data.cases.length === 0 && <Card style={{ padding: 40, textAlign: "center", color: "var(--text-light)", fontFamily: T.fontSans }}>No transition cases yet. Open a PMC Exit Intake to start compounding the moat.</Card>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Card style={{ padding: 20 }}><h3 style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Board map</h3>{data.stakeholders.map((s: BoardStakeholder) => <div key={s.id} style={{ padding: "12px 0", borderTop: "1px solid var(--border)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong style={{ fontFamily: T.fontSans, fontSize: 13 }}>{s.name}</strong><StatusTag status={s.stance} /></div><div style={{ fontFamily: T.fontMono, fontSize: 10, color: "var(--text-light)", textTransform: "uppercase", marginTop: 4 }}>{s.role.replace(/_/g, " ")}</div>{s.primaryConcern && <p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5, margin: "8px 0 0" }}>{s.primaryConcern}</p>}</div>)}</Card>
                <Card style={{ padding: 20 }}><h3 style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Moat signals</h3>{data.signals.slice(0, 10).map((s: MoatSignal) => <div key={s.id} style={{ padding: "12px 0", borderTop: "1px solid var(--border)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><strong style={{ fontFamily: T.fontSans, fontSize: 13 }}>{s.label}</strong><Tag color={s.isPubliclyReplicable ? T.warn : T.success} bg={s.isPubliclyReplicable ? T.warnPale : T.successPale}>{s.isPubliclyReplicable ? "public" : "private"}</Tag></div><div style={{ fontFamily: T.fontMono, fontSize: 10, color: "var(--text-light)", textTransform: "uppercase", marginTop: 4 }}>{s.category.replace(/_/g, " ")} · weight {s.moatWeight}</div><p style={{ fontSize: 12, color: "var(--text-mid)", lineHeight: 1.5, margin: "8px 0 0" }}>{s.evidence}</p></div>)}</Card>
              </div>
            </div>

            {proofPack !== null && (
              <Card style={{ padding: 22, marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ fontFamily: T.fontSans, fontSize: 17, fontWeight: 800 }}>Pilot Proof Pack JSON</h3><Btn variant="ghost" onClick={() => setProofPack(null)}>Close</Btn></div>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 520, overflow: "auto", background: "#111", color: "#E7F6EC", padding: 16, borderRadius: 12, fontSize: 11, lineHeight: 1.55 }}>{JSON.stringify(proofPack, null, 2)}</pre>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
