import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { SectionHeader, Btn, Card, StatusTag, EmptyState, Modal, FDInput, FDTextarea, Icons, Label } from "./ui-kit";
import { AIPanel, AIField, AIList } from "./AIPanel";

export function AmenityModule({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [amenityModal, setAmenityModal] = useState(false);
  const [reserveModal, setReserveModal] = useState<string | null>(null);
  const [aForm, setAForm] = useState({ name: "", description: "", capacity: "", depositCents: "", openTime: "08:00", closeTime: "22:00", rules: "" });
  const [rForm, setRForm] = useState({ homeownerId: "", date: "", startTime: "", endTime: "", guestCount: "", notes: "" });
  const setAF = (k: string, v: string) => setAForm(f => ({ ...f, [k]: v }));
  const setRF = (k: string, v: string) => setRForm(f => ({ ...f, [k]: v }));

  const { data: amenities = [], isLoading } = useQuery({
    queryKey: ["amenities", hoaId],
    queryFn: () => rpc.getAmenities(hoaId),
  });

  const { data: homeowners = [] } = useQuery({
    queryKey: ["homeowners", hoaId],
    queryFn: () => rpc.getHomeowners(hoaId),
  });

  const createAmenityMut = useMutation({
    mutationFn: () => rpc.createAmenity({
      hoaId,
      name: aForm.name,
      description: aForm.description || undefined,
      capacity: aForm.capacity ? parseInt(aForm.capacity) : undefined,
      depositCents: aForm.depositCents ? Math.round(parseFloat(aForm.depositCents)*100) : 0,
      openTime: aForm.openTime,
      closeTime: aForm.closeTime,
      rules: aForm.rules || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["amenities"] }); setAmenityModal(false); setAForm({ name: "", description: "", capacity: "", depositCents: "", openTime: "08:00", closeTime: "22:00", rules: "" }); },
  });

  const reserveMut = useMutation({
    mutationFn: () => rpc.createReservation({
      amenityId: reserveModal!,
      homeownerId: rForm.homeownerId,
      date: rForm.date,
      startTime: rForm.startTime,
      endTime: rForm.endTime,
      guestCount: rForm.guestCount ? parseInt(rForm.guestCount) : undefined,
      notes: rForm.notes || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["amenities"] }); setReserveModal(null); setRForm({ homeownerId: "", date: "", startTime: "", endTime: "", guestCount: "", notes: "" }); },
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => rpc.cancelReservation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["amenities"] }),
  });

  type AMN = { id: string; name: string; description?: string|null; capacity?: number|null; depositCents?: number|null; openTime?: string|null; closeTime?: string|null; rules?: string|null; reservations: {id:string;date:string;startTime:string;endTime:string;status:string;guestCount?:number|null;homeowner:{name:string}}[] };

  return (
    <div style={{ padding: "32px 40px", minHeight: "100vh" }} className="main-pad">
      <SectionHeader
        title="Amenity — Reservations"
        sub="Pool, clubhouse, courts, and common area bookings"
        action={<Btn onClick={() => setAmenityModal(true)}><Icons.Plus /> Add Amenity</Btn>}
      />

      {isLoading && <div style={{ padding: 40, textAlign: "center", color: T.inkLight }}>Loading...</div>}
      {!isLoading && (amenities as AMN[]).length === 0 && <EmptyState icon="🏊" title="No amenities configured" sub="Add your community's amenities to enable reservations." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(amenities as AMN[]).map(a => {
          const upcoming = a.reservations.filter(r => r.status === "confirmed" && r.date >= new Date().toISOString().slice(0,10));
          return (
            <Card key={a.id} style={{ padding: "22px 26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 600, color: T.charcoal, marginBottom: 4 }}>{a.name}</div>
                  {a.description && <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid, marginBottom: 4 }}>{a.description}</div>}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {a.capacity && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>Cap: {a.capacity}</span>}
                    {a.openTime && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>{a.openTime} – {a.closeTime}</span>}
                    {a.depositCents && a.depositCents > 0 && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.gold }}>Deposit: ${(a.depositCents/100).toFixed(0)}</span>}
                  </div>
                </div>
                <Btn variant="outline" style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => setReserveModal(a.id)}>
                  <Icons.Plus /> Book
                </Btn>
              </div>

              {upcoming.length > 0 && (
                <div>
                  <Label>Upcoming Reservations</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {upcoming.slice(0,5).map(r => (
                      <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: T.creamDark, borderRadius: T.radius }}>
                        <div>
                          <span style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 500 }}>{r.homeowner.name}</span>
                          <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight, marginLeft: 8 }}>
                            {r.date} · {r.startTime}–{r.endTime}
                            {r.guestCount && ` · ${r.guestCount} guests`}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <StatusTag status={r.status} />
                          <button onClick={() => cancelMut.mutate(r.id)} style={{ background: "none", border: "none", color: T.danger, cursor: "pointer", fontSize: 12, fontFamily: T.fontSans }}>Cancel</button>
                          <AIPanel
                            label="Amenity AI"
                            description="conflict check, auto-confirm or suggest alternatives"
                            runFn={() => rpc.runReservationAnalysis(r.id)}
                            fetchFn={() => rpc.getAIAnalysis({ type: "reservation", id: r.id })}
                            queryKey={["amenities", hoaId]}
                            renderResult={(data) => {
                              const d = data as { status?: string; conflict?: boolean; conflict_details?: string; suggested_alternatives?: string[]; auto_confirmed?: boolean; deposit_required?: boolean; notes?: string[] };
                              return (
                                <div>
                                  {d.status && <AIField label="AI Status" value={d.status.toUpperCase()} color={d.status === "confirmed" ? T.success : d.status === "conflict" ? T.danger : T.warn} />}
                                  {d.conflict && d.conflict_details && <AIField label="Conflict" value={d.conflict_details} color={T.danger} />}
                                  {d.auto_confirmed && <AIField label="Auto-Confirmed" value="✓ No conflicts detected" color={T.success} />}
                                  {d.deposit_required && <AIField label="Deposit" value="Required for this booking" color={T.gold} />}
                                  {d.suggested_alternatives && <AIList label="Alternatives" items={d.suggested_alternatives} />}
                                  {d.notes && <AIList label="Notes" items={d.notes} />}
                                </div>
                              );
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {upcoming.length > 5 && <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, textAlign: "center", padding: 4 }}>+{upcoming.length-5} more</div>}
                  </div>
                </div>
              )}
              {upcoming.length === 0 && <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkLight }}>No upcoming reservations.</div>}
            </Card>
          );
        })}
      </div>

      {/* Add amenity */}
      <Modal open={amenityModal} onClose={() => setAmenityModal(false)} title="Add Amenity">
        <FDInput label="Name" placeholder="Main Pool" value={aForm.name} onChange={e => setAF("name", e.target.value)} />
        <FDTextarea label="Description" placeholder="Heated lap pool with sundecks..." value={aForm.description} onChange={e => setAF("description", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FDInput label="Capacity" type="number" placeholder="50" value={aForm.capacity} onChange={e => setAF("capacity", e.target.value)} />
          <FDInput label="Deposit ($)" type="number" placeholder="0" value={aForm.depositCents} onChange={e => setAF("depositCents", e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FDInput label="Opens" type="time" value={aForm.openTime} onChange={e => setAF("openTime", e.target.value)} />
          <FDInput label="Closes" type="time" value={aForm.closeTime} onChange={e => setAF("closeTime", e.target.value)} />
        </div>
        <FDTextarea label="Rules (optional)" placeholder="No glass. Towels required..." value={aForm.rules} onChange={e => setAF("rules", e.target.value)} />
        <Btn full onClick={() => createAmenityMut.mutate()} disabled={!aForm.name || createAmenityMut.isPending}>
          {createAmenityMut.isPending ? "Adding…" : "Add Amenity"}
        </Btn>
      </Modal>

      {/* Reserve */}
      <Modal open={!!reserveModal} onClose={() => setReserveModal(null)} title="Book Reservation">
        {(homeowners as {id:string;name:string}[]).length > 0 && (
          <select value={rForm.homeownerId} onChange={e => setRF("homeownerId", e.target.value)} style={{ width:"100%", padding:"10px 14px", border:`1px solid ${T.stone}`, borderRadius:T.radius, background:T.white, fontSize:14, marginBottom:18 }}>
            <option value="">Select homeowner</option>
            {(homeowners as {id:string;name:string;address:string}[]).map(h => <option key={h.id} value={h.id}>{h.name} — {h.address}</option>)}
          </select>
        )}
        <FDInput label="Date" type="date" value={rForm.date} onChange={e => setRF("date", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FDInput label="Start Time" type="time" value={rForm.startTime} onChange={e => setRF("startTime", e.target.value)} />
          <FDInput label="End Time" type="time" value={rForm.endTime} onChange={e => setRF("endTime", e.target.value)} />
        </div>
        <FDInput label="Guest Count" type="number" placeholder="4" value={rForm.guestCount} onChange={e => setRF("guestCount", e.target.value)} />
        <FDInput label="Notes" placeholder="Birthday party" value={rForm.notes} onChange={e => setRF("notes", e.target.value)} />
        {reserveMut.isError && <div style={{ color: T.danger, fontFamily: T.fontSans, fontSize: 13, marginBottom: 12 }}>Time slot conflict — please choose another time.</div>}
        <Btn full onClick={() => reserveMut.mutate()} disabled={!rForm.date || !rForm.startTime || !rForm.endTime || reserveMut.isPending}>
          {reserveMut.isPending ? "Booking…" : "Confirm Reservation"}
        </Btn>
      </Modal>
    </div>
  );
}
