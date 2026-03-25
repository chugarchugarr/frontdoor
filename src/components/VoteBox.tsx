import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { SectionHeader, Btn, Card, StatusTag, Tag, EmptyState, Modal, FDInput, FDSelect, FDTextarea, Icons } from "./ui-kit";

export function VoteBox({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [resultsModal, setResultsModal] = useState<string | null>(null);
  const [optionsText, setOptionsText] = useState("");
  const [form, setForm] = useState({ title: "", description: "", type: "motion", closesAt: "", allowMultiple: "false", requiresQuorum: "true", quorumCount: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data: votes = [], isLoading } = useQuery({
    queryKey: ["votes", hoaId],
    queryFn: () => rpc.getVotes(hoaId),
  });

  const { data: results } = useQuery({
    queryKey: ["vote-results", resultsModal],
    queryFn: () => rpc.getVoteResults(resultsModal!),
    enabled: !!resultsModal,
  });

  const createMut = useMutation({
    mutationFn: () => rpc.createVote({
      hoaId,
      title: form.title,
      description: form.description || undefined,
      type: form.type,
      options: optionsText.split("\n").map(s => s.trim()).filter(Boolean),
      allowMultiple: form.allowMultiple === "true",
      requiresQuorum: form.requiresQuorum === "true",
      quorumCount: form.quorumCount ? parseInt(form.quorumCount) : undefined,
      closesAt: form.closesAt,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["votes"] });
      setModal(false);
      setForm({ title: "", description: "", type: "motion", closesAt: "", allowMultiple: "false", requiresQuorum: "true", quorumCount: "" });
      setOptionsText("");
    },
  });

  const closeMut = useMutation({
    mutationFn: (id: string) => rpc.closeVote(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["votes"] }),
  });

  type VT = { id: string; title: string; description?: string | null; type: string; status: string; options: string; closesAt: Date | string; casts: {id:string}[]; resultSummary?: string | null; meeting?: {title:string}|null };
  const open = (votes as VT[]).filter(v => v.status === "open");
  const closed = (votes as VT[]).filter(v => v.status !== "open");

  return (
    <div style={{ padding: "32px 40px" }} className="main-pad">
      <SectionHeader
        title="VoteBox — Elections & Surveys"
        sub="Secure online voting, motions, elections, and surveys"
        action={<Btn onClick={() => setModal(true)}><Icons.Plus /> Create Vote</Btn>}
      />

      {isLoading && <div style={{ padding: 40, textAlign: "center", color: T.inkLight }}>Loading...</div>}
      {!isLoading && votes.length === 0 && <EmptyState icon="🗳️" title="No votes yet" sub="Create a motion, election, or survey for your community." />}

      {open.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Active ({open.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {open.map(v => {
              const options = JSON.parse(v.options) as string[];
              const closes = new Date(v.closesAt);
              const daysLeft = Math.max(0, Math.ceil((closes.getTime() - Date.now()) / 86400000));
              return (
                <Card key={v.id} style={{ padding: "22px 26px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 600, color: T.charcoal }}>{v.title}</span>
                        <Tag>{v.type}</Tag>
                        <StatusTag status={v.status} />
                      </div>
                      {v.description && <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid, marginBottom: 8 }}>{v.description}</div>}
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {options.map(opt => (
                          <div key={opt} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${T.forest}`, background: "transparent" }} />
                            <span style={{ fontFamily: T.fontSans, fontSize: 13, color: T.ink }}>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight }}>Votes cast</div>
                      <div style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 700, color: T.charcoal }}>{v.casts.length}</div>
                      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: daysLeft < 3 ? T.danger : T.inkLight, marginTop: 4 }}>
                        {daysLeft === 0 ? "Closes today" : `${daysLeft}d left`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${T.stone}30` }}>
                    <Btn variant="ghost" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => setResultsModal(v.id)}>
                      Live Results
                    </Btn>
                    <Btn variant="outline" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => closeMut.mutate(v.id)} disabled={closeMut.isPending}>
                      Close & Certify
                    </Btn>
                    <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight, alignSelf: "center", marginLeft: "auto" }}>
                      Closes {closes.toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Closed ({closed.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {closed.map(v => (
              <Card key={v.id} style={{ padding: "14px 20px", opacity: 0.75, cursor: "pointer" }} className="card-hover" onClick={() => setResultsModal(v.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600 }}>{v.title}</span>
                    {v.resultSummary && <span style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkMid, marginLeft: 10 }}>{v.resultSummary}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Tag>{v.casts.length} votes</Tag>
                    <StatusTag status={v.status} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Vote">
        <FDInput label="Title" placeholder="Approve 2026 Annual Budget" value={form.title} onChange={e => set("title", e.target.value)} />
        <FDTextarea label="Description (optional)" placeholder="Brief description of what homeowners are voting on..." value={form.description} onChange={e => set("description", e.target.value)} />
        <FDSelect label="Type" value={form.type} onChange={e => set("type", e.target.value)}>
          {["motion","election","survey","bylaw_amendment","special_assessment"].map(t => <option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
        </FDSelect>
        <FDTextarea label="Options (one per line)" placeholder="Yes&#10;No&#10;Abstain" value={optionsText} onChange={e => setOptionsText(e.target.value)} />
        <FDInput label="Closes At" type="datetime-local" value={form.closesAt} onChange={e => set("closesAt", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FDSelect label="Quorum Required?" value={form.requiresQuorum} onChange={e => set("requiresQuorum", e.target.value)}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </FDSelect>
          <FDInput label="Quorum Count" type="number" placeholder="Min votes needed" value={form.quorumCount} onChange={e => set("quorumCount", e.target.value)} />
        </div>
        <Btn full onClick={() => createMut.mutate()} disabled={!form.title || !optionsText || !form.closesAt || createMut.isPending}>
          {createMut.isPending ? "Creating…" : "Create Vote"}
        </Btn>
      </Modal>

      {/* Results modal */}
      <Modal open={!!resultsModal} onClose={() => setResultsModal(null)} title="Vote Results">
        {results && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 700, color: T.charcoal, marginBottom: 4 }}>{results.title}</div>
              <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkLight }}>{results.totalCasts} votes cast · {results.quorumMet ? "Quorum met ✓" : "Quorum not met"}</div>
            </div>
            {Object.entries(results.tallies).map(([opt, count]) => {
              const pct = results.totalCasts > 0 ? Math.round((count as number / results.totalCasts) * 100) : 0;
              return (
                <div key={opt} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: T.ink }}>{opt}</span>
                    <span style={{ fontFamily: T.fontMono, fontSize: 12, color: T.inkMid }}>{count as number} ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: T.stone, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: T.forest, borderRadius: 4, transition: "width 0.6s" }} />
                  </div>
                </div>
              );
            })}
            <StatusTag status={results.status} />
          </div>
        )}
      </Modal>
    </div>
  );
}
