import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T, GLOBAL_CSS } from "./tokens";
import { Btn, Card, Tag, FDInput, FDSelect, Icons, Label } from "./ui-kit";

const CATEGORIES = [
  { id: "roofing",     label: "Roofing",      icon: "🏠" },
  { id: "plumbing",    label: "Plumbing",     icon: "🔧" },
  { id: "foundation",  label: "Foundation",   icon: "🏗️" },
  { id: "hvac",        label: "HVAC",         icon: "❄️" },
  { id: "electrical",  label: "Electrical",   icon: "⚡" },
  { id: "solar",       label: "Solar",        icon: "☀️" },
  { id: "landscaping", label: "Landscaping",  icon: "🌿" },
  { id: "painting",    label: "Painting",     icon: "🎨" },
];

const TRUST_POINTS = [
  { icon: "✓", text: "Permit-matched leads — homeowners with active Austin permits pulled from city data, matched to your trade" },
  { icon: "✓", text: "These are warm leads. A homeowner with a roofing permit is already spending money — you just get there first" },
  { icon: "✓", text: "Direct integration into GatePass WorkOrder routing for HOA-dispatched jobs" },
  { icon: "✓", text: "Full refund if Austin doesn't launch within 6 months" },
];

export function ContractorWaitlist({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ company: "", contactName: "", email: "", phone: "", category: "", zip: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data: stats } = useQuery({
    queryKey: ["contractorStats"],
    queryFn: () => rpc.getContractorStats(),
    refetchInterval: 20000,
  });

  const mutation = useMutation({
    mutationFn: () => rpc.createContractorCheckout({
      company: form.company,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      category: form.category,
      zip: form.zip,
    }),
    onSuccess: (data: { url: string | null }) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const spotsLeft = stats?.spotsLeft ?? 25;
  const spotsTaken = 25 - spotsLeft;
  const pct = Math.round((spotsTaken / 25) * 100);
  const isUrgent = spotsLeft <= 8;
  const canSubmit = form.company && form.contactName && form.email && form.category && form.zip && !mutation.isPending;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>

      {/* Header */}
      <header style={{
        padding: "0 32px", height: 60,
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 14,
        background: "var(--bg)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: "var(--text-light)", display: "flex", alignItems: "center", gap: 6, fontFamily: T.fontSans, fontSize: 13, cursor: "pointer" }}
        >
          <Icons.Back /> Back
        </button>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: `linear-gradient(135deg, ${T.forest}, ${T.forestLight})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span style={{ fontFamily: T.fontSans, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>GatePass</span>
        </div>
        <Tag bg={T.goldLight} color={T.gold}>Contractor Waitlist</Tag>
      </header>

      {/* Body */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "52px 32px", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 40, alignItems: "start" }}>

        {/* ── Left: value prop ── */}
        <div className="anim-up">

          {/* Urgency pill */}
          {isUrgent && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "5px 13px", borderRadius: 20,
              background: `${T.danger}12`, border: `1px solid ${T.danger}30`,
              marginBottom: 22,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.danger }} className="ai-pulse" />
              <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.danger, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Only {spotsLeft} seats left
              </span>
            </div>
          )}

          <h1 style={{
            fontFamily: T.fontSans,
            fontSize: "clamp(28px, 3.5vw, 40px)",
            fontWeight: 700, color: "var(--text)",
            letterSpacing: "-0.025em", lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Get first access<br />to HOA work orders.
          </h1>

          <p style={{ fontFamily: T.fontSans, fontSize: 14, color: "var(--text-mid)", lineHeight: 1.75, marginBottom: 28, maxWidth: 380 }}>
            GatePass cross-references Austin permit data with HOA homeowner records. Every contractor on the platform gets matched to homeowners who are actively spending on their trade — before anyone else even knows the job exists.
          </p>

          {/* Benefits list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {TRUST_POINTS.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.forestPale, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 9, color: T.forest, fontWeight: 700 }}>✓</span>
                </div>
                <span style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", lineHeight: 1.55 }}>{p.text}</span>
              </div>
            ))}
          </div>

          {/* Category grid */}
          <div>
            <Label>Trade categories accepting applications</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7, marginTop: 10 }}>
              {CATEGORIES.map(c => (
                <div
                  key={c.id}
                  onClick={() => set("category", c.id)}
                  style={{
                    padding: "10px 8px",
                    borderRadius: T.radius,
                    border: `1px solid ${form.category === c.id ? T.forest : "var(--border)"}`,
                    background: form.category === c.id ? T.forestPale : "var(--bg-card)",
                    cursor: "pointer", textAlign: "center",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 10, fontWeight: 600, color: form.category === c.id ? T.forest : "var(--text-light)" }}>{c.label}</div>
                </div>
              ))}
            </div>
            {form.category && (
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.forest, marginTop: 7 }}>
                ✓ {CATEGORIES.find(c => c.id === form.category)?.label} selected
              </div>
            )}
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="anim-up-2">

          {/* Seats progress card */}
          <Card style={{ padding: "18px 22px", marginBottom: 16, background: "var(--bg-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <Label style={{ margin: 0 }}>Founding Contractor Seats</Label>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                  <span style={{ fontFamily: T.fontSans, fontSize: 28, fontWeight: 700, color: isUrgent ? T.danger : "var(--text)", letterSpacing: "-0.02em" }}>{spotsLeft}</span>
                  <span style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)" }}>of 25 remaining</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: T.fontSans, fontSize: 26, fontWeight: 700, color: T.gold }}>$99</div>
                <div style={{ fontFamily: T.fontMono, fontSize: 9, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.06em" }}>one-time</div>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: "var(--bg-subtle)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: isUrgent
                  ? `linear-gradient(90deg, ${T.danger}, #E05050)`
                  : `linear-gradient(90deg, ${T.gold}, #D4A040)`,
                borderRadius: 4,
                transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontFamily: T.fontMono, fontSize: 9, color: "var(--text-light)" }}>{spotsTaken} reserved</span>
              <span style={{ fontFamily: T.fontMono, fontSize: 9, color: isUrgent ? T.danger : "var(--text-light)" }}>{pct}% full</span>
            </div>
          </Card>

          {/* Form card */}
          <Card style={{ padding: "26px 28px" }}>
            <h3 style={{ fontFamily: T.fontSans, fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 20, letterSpacing: "-0.01em" }}>
              Reserve your seat
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <FDInput label="Company Name" placeholder="Summit Roofing Co." value={form.company} onChange={e => set("company", e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <FDInput label="Your Name" placeholder="Mike Torres" value={form.contactName} onChange={e => set("contactName", e.target.value)} />
              </div>
              <FDInput label="Email" type="email" placeholder="mike@summit.com" value={form.email} onChange={e => set("email", e.target.value)} />
              <FDInput label="Phone" type="tel" placeholder="512-555-0100" value={form.phone} onChange={e => set("phone", e.target.value)} />
              <FDSelect label="Trade Category" value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </FDSelect>
              <FDInput label="Primary ZIP Code" placeholder="78732" value={form.zip} onChange={e => set("zip", e.target.value)} />
            </div>

            <Btn
              variant="gold"
              full
              onClick={() => mutation.mutate()}
              disabled={!canSubmit}
              style={{ marginTop: 4, padding: "13px 20px", fontSize: 14, boxShadow: `0 4px 20px rgba(184,136,58,0.25)` }}
            >
              {mutation.isPending ? "Redirecting to checkout…" : <>Reserve Seat — $99 <Icons.ArrowR /></>}
            </Btn>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
              {[
                { icon: "🔒", text: "Secure checkout" },
                { icon: "↩️", text: "Refundable" },
                { icon: "⚡", text: "Instant confirmation" },
              ].map(t => (
                <span key={t.text} style={{ fontFamily: T.fontSans, fontSize: 11, color: "var(--text-light)", display: "flex", alignItems: "center", gap: 4 }}>
                  {t.icon} {t.text}
                </span>
              ))}
            </div>

            {mutation.isError && (
              <div style={{ marginTop: 14, padding: "10px 14px", background: T.dangerPale, borderRadius: T.radius, fontFamily: T.fontSans, fontSize: 13, color: T.danger }}>
                Something went wrong — please try again.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
