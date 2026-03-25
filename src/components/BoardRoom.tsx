import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { SectionHeader, Btn, Card, StatusTag, Tag, EmptyState, Modal, FDInput, FDSelect, FDTextarea, Icons, Label } from "./ui-kit";
import { AIPanel, AIField, AIList } from "./AIPanel";

const MEETING_TYPES = ["board","annual","special","committee","executive"];

export function BoardRoom({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [minutesModal, setMinutesModal] = useState<string | null>(null);
  const [minutesText, setMinutesText] = useState("");
  const [form, setForm] = useState({ title: "", type: "board", scheduledAt: "", location: "", virtualLink: "", agenda: "", quorumRequired: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings", hoaId],
    queryFn: () => rpc.getMeetings(hoaId),
  });

  const createMut = useMutation({
    mutationFn: () => rpc.createMeeting({
      hoaId,
      title: form.title,
      type: form.type,
      scheduledAt: form.scheduledAt,
      location: form.location || undefined,
      virtualLink: form.virtualLink || undefined,
      agenda: form.agenda || undefined,
      quorumRequired: form.quorumRequired ? parseInt(form.quorumRequired) : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["meetings"] }); setModal(false); setForm({ title: "", type: "board", scheduledAt: "", location: "", virtualLink: "", agenda: "", quorumRequired: "" }); },
  });

  const minutesMut = useMutation({
    mutationFn: (id: string) => rpc.updateMeetingMinutes({ id, minutes: minutesText, status: "completed" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["meetings"] }); setMinutesModal(null); setMinutesText(""); },
  });

  type MTG = { id: string; title: string; type: string; scheduledAt: Date | string; location?: string | null; virtualLink?: string | null; status: string; agenda?: string | null; minutes?: string | null; quorumRequired?: number | null; agendaItems: {id:string;order:number;title:string;status:string}[]; votes: {id:string;title:string;status:string}[] };

  const upcoming = (meetings as MTG[]).filter(m => m.status === "scheduled");
  const past = (meetings as MTG[]).filter(m => m.status !== "scheduled");

  return (
    <div style={{ padding: "32px 40px", minHeight: "100vh" }} className="main-pad">
      <SectionHeader
        title="BoardRoom — Governance"
        sub="Meeting scheduling, agenda management, and minutes recording"
        action={<Btn onClick={() => setModal(true)}><Icons.Plus /> Schedule Meeting</Btn>}
      />

      {isLoading && <div style={{ padding: 40, textAlign: "center", color: T.inkLight }}>Loading...</div>}
      {!isLoading && upcoming.length === 0 && <EmptyState icon="📅" title="No upcoming meetings" sub="Schedule your next board or annual meeting." />}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Upcoming</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcoming.map(m => (
              <Card key={m.id} style={{ padding: "22px 26px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 600, color: T.charcoal }}>{m.title}</span>
                      <Tag>{m.type}</Tag>
                      <StatusTag status={m.status} />
                    </div>
                    <div style={{ fontFamily: T.fontMono, fontSize: 12, color: T.inkLight }}>
                      {new Date(m.scheduledAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {m.location && <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginTop: 2 }}>📍 {m.location}</div>}
                    {m.virtualLink && <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.blue, marginTop: 2 }}>🔗 {m.virtualLink}</div>}
                  </div>
                  {m.quorumRequired && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight }}>Quorum</div>
                      <div style={{ fontFamily: T.fontSans, fontSize: 18, fontWeight: 700 }}>{m.quorumRequired}</div>
                    </div>
                  )}
                </div>
                {m.agenda && (
                  <div style={{ background: T.creamDark, borderRadius: T.radius, padding: "12px 16px", marginBottom: 14, fontFamily: T.fontSans, fontSize: 13, color: T.inkMid, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {m.agenda}
                  </div>
                )}
                {m.agendaItems.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Label>Agenda Items</Label>
                    {m.agendaItems.map(item => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${T.stone}20` }}>
                        <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, width: 20 }}>{item.order}.</span>
                        <span style={{ fontFamily: T.fontSans, fontSize: 13, color: T.ink }}>{item.title}</span>
                        <StatusTag status={item.status} />
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${T.stone}30` }}>
                  <Btn variant="ghost" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => { setMinutesText(""); setMinutesModal(m.id); }}>
                    Record Minutes
                  </Btn>
                </div>
                <AIPanel
                  label="BoardRoom AI"
                  description="generates Robert's Rules agenda from open items"
                  runFn={() => rpc.runAgendaGeneration(m.id)}
                  fetchFn={() => rpc.getAIAnalysis({ type: "meeting", id: m.id })}
                  queryKey={["meetings", hoaId]}
                  alreadyAnalyzed={!!(m as MTG & { aiAnalysis?: string | null }).aiAnalysis}
                  renderResult={(data) => {
                    const d = data as { agenda_items?: Array<{ order: number; title: string; time_allotment?: string; action_required?: boolean }>; estimated_duration_minutes?: number; quorum_notes?: string; preparation_checklist?: string[] };
                    return (
                      <div>
                        {d.estimated_duration_minutes && <AIField label="Est. Duration" value={`${d.estimated_duration_minutes} minutes`} />}
                        {d.quorum_notes && <AIField label="Quorum Notes" value={d.quorum_notes} />}
                        {d.agenda_items && d.agenda_items.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Generated Agenda</div>
                            {d.agenda_items.map((item, i) => (
                              <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: `1px solid ${T.stone}20` }}>
                                <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight, minWidth: 20 }}>{item.order}.</span>
                                <span style={{ fontFamily: T.fontSans, fontSize: 13, color: T.ink, flex: 1 }}>{item.title}</span>
                                {item.time_allotment && <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight }}>{item.time_allotment}</span>}
                                {item.action_required && <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.warn, background: T.warnPale, padding: "1px 6px", borderRadius: 4 }}>ACTION</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {d.preparation_checklist && <AIList label="Prep Checklist" items={d.preparation_checklist} />}
                      </div>
                    );
                  }}
                />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past meetings */}
      {past.length > 0 && (
        <div>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Past Meetings ({past.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {past.map(m => (
              <Card key={m.id} style={{ padding: "14px 20px", opacity: 0.75 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600 }}>{m.title}</span>
                    <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight, marginLeft: 10 }}>
                      {new Date(m.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {m.minutes && <Tag color={T.success} bg={T.successPale}>Minutes</Tag>}
                    <StatusTag status={m.status} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create meeting modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Schedule Meeting">
        <FDInput label="Meeting Title" placeholder="March Board Meeting" value={form.title} onChange={e => set("title", e.target.value)} />
        <FDSelect label="Type" value={form.type} onChange={e => set("type", e.target.value)}>
          {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </FDSelect>
        <FDInput label="Date & Time" type="datetime-local" value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FDInput label="Location" placeholder="Clubhouse" value={form.location} onChange={e => set("location", e.target.value)} />
          <FDInput label="Virtual Link" placeholder="https://zoom.us/..." value={form.virtualLink} onChange={e => set("virtualLink", e.target.value)} />
        </div>
        <FDInput label="Quorum Required" type="number" placeholder="3" value={form.quorumRequired} onChange={e => set("quorumRequired", e.target.value)} />
        <FDTextarea label="Agenda (optional)" placeholder="1. Call to order&#10;2. Financial report&#10;3. Old business&#10;4. New business" value={form.agenda} onChange={e => set("agenda", e.target.value)} />
        <Btn full onClick={() => createMut.mutate()} disabled={!form.title || !form.scheduledAt || createMut.isPending}>
          {createMut.isPending ? "Scheduling…" : "Schedule Meeting"}
        </Btn>
      </Modal>

      {/* Minutes modal */}
      <Modal open={!!minutesModal} onClose={() => setMinutesModal(null)} title="Record Meeting Minutes">
        <FDTextarea label="Minutes" placeholder="Called to order at 7:00 PM&#10;Present: ..." value={minutesText} onChange={e => setMinutesText(e.target.value)} style={{ minHeight: 200 }} />
        <Btn full onClick={() => minutesMut.mutate(minutesModal!)} disabled={!minutesText || minutesMut.isPending}>
          {minutesMut.isPending ? "Saving…" : "Save Minutes & Close Meeting"}
        </Btn>
      </Modal>
    </div>
  );
}
