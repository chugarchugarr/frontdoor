import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T, GLOBAL_CSS } from "./tokens";
import { Btn, Card, Tag, FDInput, FDTextarea, FDSelect, Label, StatusTag, EmptyState } from "./ui-kit";

const DEMO_HOA_ID = "cmn5kapjd0000jitlk3ehms51";
const DEMO_HOMEOWNER_NAME = "Jennifer Park";
const DEMO_HOMEOWNER_ADDRESS = "4521 Comanche Trail";

const PROJECT_TYPES = ["fence","paint","deck","addition","shed","pool","solar","landscaping","roof","driveway","other"];

type Tab = "home" | "arc" | "amenity" | "announcements" | "vote";

function DemoNav({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderBottom: "1px solid #E5E5E5",
      padding: "0 20px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: T.forest, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em" }}>GatePass</span>
        <span style={{ width: 1, height: 16, background: "#E5E5E5", margin: "0 4px" }} />
        <span style={{ fontFamily: T.fontSans, fontSize: 12, color: "#525252" }}>
          {DEMO_HOMEOWNER_NAME} · {DEMO_HOMEOWNER_ADDRESS}
        </span>
      </div>
      <button
        onClick={onBack}
        style={{ fontFamily: T.fontSans, fontSize: 12, color: "#525252", background: "none", border: "1px solid #E5E5E5", borderRadius: 999, padding: "5px 14px", cursor: "pointer" }}
      >
        ← Exit Demo
      </button>
    </div>
  );
}

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "home", label: "My Home" },
    { id: "arc", label: "Submit Request" },
    { id: "amenity", label: "Book Amenity" },
    { id: "announcements", label: "Announcements" },
    { id: "vote", label: "Votes" },
  ];
  return (
    <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E5E5", padding: "0 24px", display: "flex", gap: 2 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            fontFamily: T.fontSans, fontSize: 13, fontWeight: active === t.id ? 600 : 400,
            color: active === t.id ? T.forest : "#525252",
            background: "none", border: "none", cursor: "pointer",
            padding: "14px 14px 12px",
            borderBottom: active === t.id ? `2px solid ${T.forest}` : "2px solid transparent",
            transition: "color 0.12s",
            letterSpacing: "-0.01em",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function MyHomeTab({ homeownerId }: { homeownerId: string }) {
  const { data: violations = [] } = useQuery({
    queryKey: ["violations", DEMO_HOA_ID],
    queryFn: () => rpc.getViolations(DEMO_HOA_ID),
  });
  const { data: arcRequests = [] } = useQuery({
    queryKey: ["arc", DEMO_HOA_ID],
    queryFn: () => rpc.getARCRequests(DEMO_HOA_ID),
  });

  type ViolationRow = { id: string; address: string; category: string; status: string; severity: string; createdAt: string | Date };
  type ARCRow = { id: string; homeownerId: string; projectType: string; status: string; submittedAt: string | Date };

  const myViolations = (violations as ViolationRow[]).filter(v => v.address === DEMO_HOMEOWNER_ADDRESS);
  const myARC = (arcRequests as ARCRow[]).filter(a => a.homeownerId === homeownerId);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      {/* Property card */}
      <Card style={{ padding: "24px 26px", marginBottom: 16, borderRadius: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <Label>Your Property</Label>
            <div style={{ fontFamily: T.fontSans, fontSize: 20, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.025em", marginBottom: 4 }}>
              {DEMO_HOMEOWNER_ADDRESS}
            </div>
            <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#525252" }}>Steiner Ranch HOA · Austin, TX 78732</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: T.forestPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>
      </Card>

      {/* Dues status */}
      <Card style={{ padding: "24px 26px", marginBottom: 16, borderRadius: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Label>Dues Status</Label>
            <div style={{ fontFamily: T.fontSans, fontSize: 28, fontWeight: 700, color: T.success, letterSpacing: "-0.03em", lineHeight: 1 }}>Current</div>
            <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#525252", marginTop: 6 }}>$185/month · Autopay enabled</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Tag color={T.success} bg={T.successPale}>Autopay On</Tag>
            <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "#A3A3A3", marginTop: 6 }}>Next charge: Apr 1</div>
          </div>
        </div>
      </Card>

      {/* Violations */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
          Violations ({myViolations.length})
        </div>
        {myViolations.length === 0 ? (
          <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#A3A3A3", padding: "16px 0" }}>No violations on record. ✓</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myViolations.map(v => (
              <Card key={v.id} style={{ padding: "14px 18px", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>{v.category}</span>
                    <span style={{ fontFamily: T.fontSans, fontSize: 12, color: "#737373", marginLeft: 8 }}>{v.severity}</span>
                  </div>
                  <StatusTag status={v.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ARC Requests */}
      <div>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
          ARC Requests ({myARC.length})
        </div>
        {myARC.length === 0 ? (
          <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#A3A3A3", padding: "16px 0" }}>No architectural review requests submitted yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myARC.map(a => (
              <Card key={a.id} style={{ padding: "14px 18px", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>{a.projectType}</div>
                  <StatusTag status={a.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ARCTab({ homeownerId }: { homeownerId: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ projectType: "", description: "", estimatedCost: "" });
  const [submitted, setSubmitted] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => rpc.submitARCRequest({
      hoaId: DEMO_HOA_ID,
      homeownerId,
      address: DEMO_HOMEOWNER_ADDRESS,
      projectType: form.projectType,
      description: form.description,
      estimatedCost: form.estimatedCost ? Math.round(parseFloat(form.estimatedCost) * 100) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["arc"] });
      setSubmitted(true);
    },
  });

  if (submitted) {
    return (
      <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.forestPale, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.025em", marginBottom: 10 }}>Request Submitted</div>
        <div style={{ fontFamily: T.fontSans, fontSize: 14, color: "#525252", lineHeight: 1.7, marginBottom: 24 }}>
          Your ARC request has been submitted. The board has 45 days to review. You'll be notified of the decision.
        </div>
        <Btn variant="ghost" onClick={() => { setSubmitted(false); setForm({ projectType: "", description: "", estimatedCost: "" }); }} style={{ borderRadius: 999 }}>
          Submit Another
        </Btn>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.025em", marginBottom: 6 }}>Architectural Review Request</div>
        <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#737373" }}>Submit modifications for board approval. 45-day review window.</div>
      </div>
      <Card style={{ padding: "26px 28px", borderRadius: 16 }}>
        <FDSelect label="Project Type" value={form.projectType} onChange={e => set("projectType", e.target.value)}>
          <option value="">Select type…</option>
          {PROJECT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </FDSelect>
        <FDTextarea label="Description" placeholder="Describe the proposed modification in detail…" value={form.description} onChange={e => set("description", e.target.value)} style={{ minHeight: 100 }} />
        <FDInput label="Estimated Cost ($)" type="number" placeholder="5000" value={form.estimatedCost} onChange={e => set("estimatedCost", e.target.value)} />
        <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "#A3A3A3", marginBottom: 16 }}>
          Review window starts at submission. You'll receive email updates on status changes.
        </div>
        <Btn full onClick={() => mutation.mutate()} disabled={!form.projectType || !form.description || mutation.isPending} style={{ background: T.forest }}>
          {mutation.isPending ? "Submitting…" : "Submit for Review"}
        </Btn>
        {mutation.isError && <div style={{ marginTop: 12, color: T.danger, fontFamily: T.fontSans, fontSize: 13 }}>Something went wrong — please try again.</div>}
      </Card>
    </div>
  );
}

function AmenityTab({ homeownerId }: { homeownerId: string }) {
  const qc = useQueryClient();
  const [bookingAmenityId, setBookingAmenityId] = useState<string | null>(null);
  const [rForm, setRForm] = useState({ date: "", startTime: "", endTime: "", guestCount: "", notes: "" });
  const [successId, setSuccessId] = useState<string | null>(null);
  const setRF = (k: string, v: string) => setRForm(f => ({ ...f, [k]: v }));

  const { data: amenities = [], isLoading } = useQuery({
    queryKey: ["amenities", DEMO_HOA_ID],
    queryFn: () => rpc.getAmenities(DEMO_HOA_ID),
  });

  const reserveMut = useMutation({
    mutationFn: () => rpc.createReservation({
      amenityId: bookingAmenityId!,
      homeownerId,
      date: rForm.date,
      startTime: rForm.startTime,
      endTime: rForm.endTime,
      guestCount: rForm.guestCount ? parseInt(rForm.guestCount) : undefined,
      notes: rForm.notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["amenities"] });
      setSuccessId(bookingAmenityId);
      setBookingAmenityId(null);
      setRForm({ date: "", startTime: "", endTime: "", guestCount: "", notes: "" });
    },
  });

  type AMN = { id: string; name: string; description?: string | null; capacity?: number | null; openTime?: string | null; closeTime?: string | null; depositCents?: number | null };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.025em", marginBottom: 6 }}>Book an Amenity</div>
        <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#737373" }}>Reserve community spaces for your household.</div>
      </div>

      {isLoading && <div style={{ color: "#A3A3A3", fontFamily: T.fontSans, padding: "40px 0", textAlign: "center" }}>Loading amenities…</div>}
      {!isLoading && (amenities as AMN[]).length === 0 && <EmptyState icon="🏊" title="No amenities configured" sub="The HOA hasn't set up any bookable amenities yet." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(amenities as AMN[]).map(a => (
          <Card key={a.id} style={{ padding: "22px 24px", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 600, color: "#0A0A0A", marginBottom: 4, letterSpacing: "-0.02em" }}>{a.name}</div>
                {a.description && <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#525252", marginBottom: 4 }}>{a.description}</div>}
                <div style={{ display: "flex", gap: 12 }}>
                  {a.capacity && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "#A3A3A3" }}>Cap: {a.capacity}</span>}
                  {a.openTime && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "#A3A3A3" }}>{a.openTime} – {a.closeTime}</span>}
                  {a.depositCents && a.depositCents > 0 && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.gold }}>Deposit: ${(a.depositCents/100).toFixed(0)}</span>}
                </div>
              </div>
              {successId === a.id ? (
                <Tag color={T.success} bg={T.successPale}>Booked ✓</Tag>
              ) : (
                <Btn variant="outline" style={{ borderRadius: 999, padding: "7px 18px", fontSize: 12 }} onClick={() => setBookingAmenityId(a.id)}>
                  Book
                </Btn>
              )}
            </div>

            {/* Inline booking form */}
            {bookingAmenityId === a.id && (
              <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 18, marginTop: 4 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <FDInput label="Date" type="date" value={rForm.date} onChange={e => setRF("date", e.target.value)} />
                  </div>
                  <FDInput label="Start Time" type="time" value={rForm.startTime} onChange={e => setRF("startTime", e.target.value)} />
                  <FDInput label="End Time" type="time" value={rForm.endTime} onChange={e => setRF("endTime", e.target.value)} />
                  <FDInput label="Guest Count" type="number" placeholder="4" value={rForm.guestCount} onChange={e => setRF("guestCount", e.target.value)} />
                  <FDInput label="Notes (optional)" placeholder="Birthday party" value={rForm.notes} onChange={e => setRF("notes", e.target.value)} />
                </div>
                {reserveMut.isError && <div style={{ color: T.danger, fontFamily: T.fontSans, fontSize: 13, marginBottom: 10 }}>Time conflict — please choose another slot.</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={() => reserveMut.mutate()} disabled={!rForm.date || !rForm.startTime || !rForm.endTime || reserveMut.isPending} style={{ background: T.forest }}>
                    {reserveMut.isPending ? "Booking…" : "Confirm Reservation"}
                  </Btn>
                  <Btn variant="ghost" onClick={() => setBookingAmenityId(null)} style={{ borderRadius: 999 }}>Cancel</Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsTab() {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements", DEMO_HOA_ID],
    queryFn: () => rpc.getAnnouncements(DEMO_HOA_ID),
  });

  const catColors: Record<string, { color: string; bg: string }> = {
    urgent:     { color: T.danger,  bg: T.dangerPale },
    financial:  { color: T.gold,    bg: T.goldLight },
    governance: { color: T.blue,    bg: T.bluePale },
    maintenance:{ color: T.purple,  bg: T.purplePale },
    events:     { color: T.forest,  bg: T.forestPale },
    general:    { color: "#737373", bg: "#F5F5F5" },
  };

  type ANN = { id: string; title: string; body: string; category: string; pinned: boolean; authorName: string; createdAt: Date | string };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.025em", marginBottom: 6 }}>Community Announcements</div>
        <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#737373" }}>Updates and notices from your HOA board.</div>
      </div>

      {isLoading && <div style={{ textAlign: "center", padding: "40px 0", color: "#A3A3A3", fontFamily: T.fontSans }}>Loading…</div>}
      {!isLoading && (announcements as ANN[]).length === 0 && <EmptyState icon="📣" title="No announcements yet" sub="Your board hasn't posted any announcements." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(announcements as ANN[]).map(a => {
          const c = catColors[a.category] || catColors.general;
          return (
            <Card key={a.id} style={{ padding: "20px 24px", borderRadius: 16, borderLeft: a.pinned ? `3px solid ${T.gold}` : undefined }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                {a.pinned && <Tag color={T.gold} bg={T.goldLight}>Pinned</Tag>}
                <Tag color={c.color} bg={c.bg}>{a.category}</Tag>
              </div>
              <div style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 600, color: "#0A0A0A", marginBottom: 8, letterSpacing: "-0.02em" }}>{a.title}</div>
              <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#525252", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 12 }}>{a.body}</div>
              <div style={{ fontFamily: T.fontMono, fontSize: 11, color: "#A3A3A3" }}>
                Posted by {a.authorName} · {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function VoteTab({ homeownerId }: { homeownerId: string }) {
  const qc = useQueryClient();
  const { data: votes = [], isLoading } = useQuery({
    queryKey: ["votes", DEMO_HOA_ID],
    queryFn: () => rpc.getVotes(DEMO_HOA_ID),
  });

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [cast, setCast] = useState<Record<string, boolean>>({});

  const castMut = useMutation({
    mutationFn: ({ voteId, option }: { voteId: string; option: string }) =>
      rpc.castVote({ voteId, homeownerId, selection: [option] }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["votes"] });
      setCast(c => ({ ...c, [vars.voteId]: true }));
    },
  });

  type VT = { id: string; title: string; description?: string | null; type: string; status: string; options: string; closesAt: Date | string };
  const open = (votes as VT[]).filter(v => v.status === "open");

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.025em", marginBottom: 6 }}>Community Votes</div>
        <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#737373" }}>Active motions, elections, and surveys for your community.</div>
      </div>

      {isLoading && <div style={{ textAlign: "center", padding: "40px 0", color: "#A3A3A3", fontFamily: T.fontSans }}>Loading…</div>}
      {!isLoading && open.length === 0 && <EmptyState icon="🗳️" title="No active votes" sub="There are no open votes at this time." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {open.map(v => {
          const options = JSON.parse(v.options) as string[];
          const closes = new Date(v.closesAt);
          const daysLeft = Math.max(0, Math.ceil((closes.getTime() - Date.now()) / 86400000));
          const hasCast = cast[v.id];

          return (
            <Card key={v.id} style={{ padding: "24px 26px", borderRadius: 16 }}>
              {hasCast ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.forestPale, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 600, color: "#0A0A0A", marginBottom: 6 }}>Vote Recorded</div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#737373" }}>Your vote for "{selections[v.id]}" has been submitted.</div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <Tag>{v.type.replace(/_/g, " ")}</Tag>
                      </div>
                      <div style={{ fontFamily: T.fontSans, fontSize: 17, fontWeight: 600, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: 4 }}>{v.title}</div>
                      {v.description && <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#525252" }}>{v.description}</div>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "#A3A3A3" }}>Closes in</div>
                      <div style={{ fontFamily: T.fontSans, fontSize: 20, fontWeight: 700, color: daysLeft < 3 ? T.danger : "#0A0A0A" }}>{daysLeft}d</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {options.map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 10, border: `1px solid ${selections[v.id] === opt ? T.forest : "#E5E5E5"}`, background: selections[v.id] === opt ? T.forestPale : "#FAFAFA", transition: "all 0.12s" }}>
                        <input
                          type="radio"
                          name={`vote-${v.id}`}
                          value={opt}
                          checked={selections[v.id] === opt}
                          onChange={() => setSelections(s => ({ ...s, [v.id]: opt }))}
                          style={{ accentColor: T.forest }}
                        />
                        <span style={{ fontFamily: T.fontSans, fontSize: 14, color: "#0A0A0A" }}>{opt}</span>
                      </label>
                    ))}
                  </div>

                  <Btn
                    onClick={() => castMut.mutate({ voteId: v.id, option: selections[v.id] })}
                    disabled={!selections[v.id] || castMut.isPending}
                    style={{ background: T.forest }}
                  >
                    {castMut.isPending ? "Submitting…" : "Cast Vote"}
                  </Btn>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function HomeownerPortal({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("home");

  const { data: homeowners = [] } = useQuery({
    queryKey: ["homeowners", DEMO_HOA_ID],
    queryFn: () => rpc.getHomeowners(DEMO_HOA_ID),
  });

  type HW = { id: string; name: string };
  const jennifer = (homeowners as HW[]).find(h => h.name === DEMO_HOMEOWNER_NAME);
  const homeownerId = jennifer?.id ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#FFFFFF" }}>
      <style>{GLOBAL_CSS}</style>
      <DemoNav onBack={onBack} />
      <TabBar active={tab} onChange={setTab} />
      <div style={{ flex: 1, background: "#FAFAFA" }}>
        {tab === "home"          && <MyHomeTab homeownerId={homeownerId} />}
        {tab === "arc"           && <ARCTab homeownerId={homeownerId} />}
        {tab === "amenity"       && <AmenityTab homeownerId={homeownerId} />}
        {tab === "announcements" && <AnnouncementsTab />}
        {tab === "vote"          && <VoteTab homeownerId={homeownerId} />}
      </div>
    </div>
  );
}
