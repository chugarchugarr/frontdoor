import { useState } from "react";
import React from "react";
import { Routes, Route, useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { client as rpc } from "@/lib/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@adaptive-ai/sdk/client";
import LandingPage from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Investors from "./pages/Investors";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { T, GLOBAL_CSS } from "./components/tokens";
import { Btn, FDInput, FDSelect, Tag, Icons, Card, Label, EmptyState } from "./components/ui-kit";
import { Sidebar, type OSView } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Homeowners } from "./components/Homeowners";
import { PayOS } from "./components/PayOS";
import { Violations } from "./components/Violations";
import { ARCAgent } from "./components/ARCAgent";
import { BoardRoom } from "./components/BoardRoom";
import { VoteBox } from "./components/VoteBox";
import { WorkOrders } from "./components/WorkOrders";
import { AmenityModule } from "./components/AmenityModule";
import { CommHub } from "./components/CommHub";
import { ContractorWaitlist as ContractorWaitlistPanel } from "./components/ContractorWaitlist";
import { HomeownerPortal } from "./components/HomeownerPortal";
import { ContractorPortal } from "./components/ContractorPortal";
import { LiveFeeds } from "./components/LiveFeeds";
import { ComplianceTimeline } from "./components/ComplianceTimeline";
import { TransitionMoat } from "./components/TransitionMoat";
import { MarketplaceProofLoop } from "./components/MarketplaceProofLoop";
import { InvestorProofDashboard } from "./components/InvestorProofDashboard";
import AdminConsole from "./components/AdminConsole";
import { ErrorBoundary } from "./components/error-boundary";

// ─── Success screens ──────────────────────────────────────────────────
function _SuccessScreen({ type, position }: { type: "hoa" | "contractor"; position?: number }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{GLOBAL_CSS}</style>
      <div className="anim-up" style={{ textAlign: "center", maxWidth: 480, padding: "40px 32px" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: T.forestPale,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: T.fontSans, fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 14, letterSpacing: "-0.03em" }}>
          {type === "hoa" ? "You're enrolled." : "Seat reserved."}
        </h1>
        <p style={{ fontFamily: T.fontSans, fontSize: 15, color: "var(--text-mid)", lineHeight: 1.7, marginBottom: 32 }}>
          {type === "hoa"
            ? "Your community is now live on GatePass OS. We'll reach out within 24 hours to complete onboarding."
            : `You're #${position} of 25 founding contractors. We'll contact you when Austin launches.`}
        </p>
        <Btn onClick={() => window.location.href = "/"}>Back to GatePass</Btn>
      </div>
    </div>
  );
}

// Module icons as clean SVGs (no emoji)
const _MODULE_ICONS: Record<string, React.ReactNode> = {
  "GatePass Core": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  "PayOS":          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  "FineBot":        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  "ARC Agent":      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  "WorkOrder":      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  "BoardRoom":      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  "VoteBox":        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  "Amenity":        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>,
  "CommHub":        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};


// ─── HOA Onboarding ───────────────────────────────────────────────────
function HOAOnboarding({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ community: "", name: "", zip: "", units: "", plan: "full", contactName: "", contactEmail: "", contactPhone: "" });
  const totalCost = form.units ? Number(form.units) * 20 : 0;
  const mutation = useMutation({
    mutationFn: () => rpc.createHOACheckout({ name: form.name || form.community, community: form.community, zip: form.zip, units: Number(form.units), contactName: form.contactName, contactEmail: form.contactEmail, contactPhone: form.contactPhone, plan: form.plan }),
    onSuccess: (data: { url: string | null }) => { if (data.url) window.location.href = data.url; },
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{GLOBAL_CSS}</style>
      <header style={{ padding: "0 32px", height: 60, borderBottom: `1px solid var(--border)`, display: "flex", alignItems: "center", gap: 14, background: "var(--bg)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-light)", display: "flex", alignItems: "center", gap: 6, fontFamily: T.fontSans, fontSize: 13, cursor: "pointer", letterSpacing: "-0.01em" }}><Icons.Back /> Back</button>
        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
        <span style={{ fontFamily: T.fontSans, fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>GatePass</span>
        <Tag>HOA Enrollment</Tag>
      </header>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "64px 32px" }}>
        <div className="anim-up" style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: T.fontSans, fontSize: 11, color: T.forest, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontWeight: 600 }}>HOA OS</div>
          <h1 style={{ fontFamily: T.fontSans, fontSize: 34, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 10 }}>Enroll Your HOA</h1>
          <p style={{ fontFamily: T.fontSans, fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7 }}>Start with a board-safe transition review. Annual platform enrollment is $20/unit/year after approval.</p>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 36 }}>
          {[1, 2].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? T.forest : "var(--border)", transition: "background 0.3s" }} />)}
        </div>
        <Card style={{ padding: 32 }}>
          {step === 1 ? (
            <>
              <h2 style={{ fontFamily: T.fontSans, fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 24, letterSpacing: "-0.025em" }}>Community Details</h2>
              <FDInput label="Community Name" placeholder="Steiner Ranch HOA" value={form.community} onChange={e => set("community", e.target.value)} />
              <FDSelect label="Plan" value={form.plan} onChange={e => set("plan", e.target.value)}>
                  <option value="full">Full Access — $20/unit/yr (all 9 modules + transition memory)</option>
              </FDSelect>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FDInput label="ZIP Code" placeholder="78732" value={form.zip} onChange={e => set("zip", e.target.value)} />
                <FDInput label="Number of Units" type="number" placeholder="500" value={form.units} onChange={e => set("units", e.target.value)} />
              </div>
              {totalCost > 0 && (
                <div style={{ padding: "14px 18px", background: T.forestPale, borderRadius: T.radius, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><Label>Annual Total</Label><div style={{ fontFamily: T.fontSans, fontSize: 26, fontWeight: 700, color: "var(--text)" }}>${totalCost.toLocaleString()}</div></div>
                  <div style={{ textAlign: "right", fontFamily: T.fontSans, fontSize: 12, color: T.inkLight }}>
                    <div>{form.units} units × $20/yr</div>
                    <div style={{ color: T.success, marginTop: 4 }}>vs. ~${(Number(form.units) * 85).toLocaleString()}/yr management co.</div>
                  </div>
                </div>
              )}
              <Btn full onClick={() => setStep(2)} disabled={!form.community || !form.zip || !form.units}>Continue <Icons.ArrowR /></Btn>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: T.fontSans, fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 24, letterSpacing: "-0.025em" }}>Board Contact</h2>
              <FDInput label="Your Name" placeholder="Sarah Mitchell" value={form.contactName} onChange={e => set("contactName", e.target.value)} />
              <FDInput label="Email" type="email" placeholder="sarah@hoa.org" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
              <FDInput label="Phone (optional)" type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
              <div style={{ padding: "12px 16px", background: "var(--bg-subtle)", borderRadius: T.radius, marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
                  <div><Label>Annual Enrollment</Label><div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700 }}>${totalCost.toLocaleString()}</div></div>
                <div style={{ textAlign: "right", fontSize: 12, color: T.inkMid, fontFamily: T.fontSans }}><div>{form.community}</div><div>{form.units} units · {form.plan} plan</div></div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="ghost" onClick={() => setStep(1)}>Back</Btn>
                <Btn full onClick={() => mutation.mutate()} disabled={!form.contactName || !form.contactEmail || mutation.isPending}>
                  {mutation.isPending ? "Redirecting…" : <>Enroll annually <Icons.ArrowR /></>}
                </Btn>
              </div>
              {mutation.isError && <div style={{ marginTop: 14, padding: "10px 14px", background: T.dangerPale, borderRadius: T.radius, fontFamily: T.fontSans, fontSize: 13, color: T.danger }}>Something went wrong. Please try again.</div>}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// ContractorWaitlist is now in ./components/ContractorWaitlist.tsx
const ContractorWaitlist = ContractorWaitlistPanel;

// ─── Live Demo — 3-persona selector + OS shell ───────────────────────
const DEMO_HOA_ID = "cmprlyrux00005etlni6qod8x";

type DemoPersona = "select" | "board" | "homeowner" | "contractor";

function DemoSelector({ onSelect, onBack }: { onSelect: (p: Exclude<DemoPersona, "select">) => void; onBack: () => void }) {
  const PERSONAS = [
    {
      id: "board" as const,
      label: "Board Member",
      sub: "Full OS access — manage violations, payments, votes, work orders, and more.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      accent: T.forest,
      accentPale: T.forestPale,
      tag: "Board OS",
    },
    {
      id: "homeowner" as const,
      label: "Homeowner",
      sub: "Submit ARC requests, book amenities, cast votes, and view your property status.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      accent: T.blue,
      accentPale: T.bluePale,
      tag: "Resident Portal",
    },
    {
      id: "contractor" as const,
      label: "Contractor",
      sub: "Browse open work orders, track Austin permits, and manage your GatePass profile.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
      accent: T.gold,
      accentPale: T.goldLight,
      tag: "Contractor Portal",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Top bar */}
      <div style={{
        background: "#FFFFFF", borderBottom: "1px solid #E5E5E5",
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: T.forest, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em" }}>GatePass</span>
          <span style={{ fontFamily: T.fontSans, fontSize: 12, color: "#A3A3A3", marginLeft: 4 }}>Live Demo</span>
        </div>
        <button
          onClick={onBack}
          style={{ fontFamily: T.fontSans, fontSize: 12, color: "#525252", background: "none", border: "1px solid #E5E5E5", borderRadius: 999, padding: "5px 14px", cursor: "pointer" }}
        >
          ← Back to site
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "72px 24px 80px" }}>
        <div className="anim-up" style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px",
            background: T.forestPale, border: `1px solid rgba(42,82,64,0.15)`, borderRadius: 999,
            marginBottom: 24,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.forest }} />
            <span style={{ fontFamily: T.fontSans, fontSize: 11, fontWeight: 500, color: T.forest }}>Steiner Ranch HOA · Demo Data</span>
          </div>
          <h1 style={{ fontFamily: T.fontSans, fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 14 }}>
            Choose your perspective
          </h1>
          <p style={{ fontFamily: T.fontSans, fontSize: 15, color: "#737373", maxWidth: 460, margin: "0 auto", lineHeight: 1.7 }}>
            Every role in GatePass sees a tailored view. Pick one to explore the live demo.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {PERSONAS.map((p, i) => (
            <button
              key={p.id}
              className={`anim-up-${i + 2}`}
              onClick={() => onSelect(p.id)}
              style={{
                background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: 20,
                padding: "32px 28px", textAlign: "left", cursor: "pointer",
                transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
                display: "flex", flexDirection: "column", gap: 0,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = p.accent;
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div style={{ width: 48, height: 48, borderRadius: 14, background: p.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                {p.icon}
              </div>
              {/* Tag */}
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: p.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 500 }}>
                {p.tag}
              </div>
              {/* Label */}
              <div style={{ fontFamily: T.fontSans, fontSize: 20, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.025em", marginBottom: 10 }}>
                {p.label}
              </div>
              {/* Sub */}
              <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#737373", lineHeight: 1.65, flex: 1 }}>
                {p.sub}
              </div>
              {/* CTA */}
              <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, color: p.accent }}>Enter demo</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoardDemo({ onBack, initialView = "dashboard" }: { onBack: () => void; initialView?: OSView }) {
  const [view, setView] = useState<OSView>(initialView);
  const { data: demoHoas = [] } = useQuery({ queryKey: ["hoa-list", "demo"], queryFn: () => rpc.getHOAList() });
  const demoHoaId = ((demoHoas as { id: string; community: string }[]).find((h) => h.community === "Steiner Ranch HOA (Demo)")?.id) ?? DEMO_HOA_ID;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Demo banner */}
      <div style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E5E5",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.forest, flexShrink: 0 }} />
          <span style={{ fontFamily: T.fontSans, fontSize: 12, color: "#525252", letterSpacing: "-0.01em" }}>
            Board Demo · Steiner Ranch HOA · All 9 modules active
          </span>
        </div>
        <button
          onClick={onBack}
          style={{
            fontFamily: T.fontSans, fontSize: 12, color: "#525252",
            background: "none", border: "1px solid #E5E5E5",
            borderRadius: 999, padding: "4px 14px", cursor: "pointer",
            transition: "all 0.15s",
            flexShrink: 0,
            letterSpacing: "-0.01em",
          }}
        >
          ← Exit
        </button>
      </div>

      {/* Full OS shell */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          current={view}
          onNav={(v) => { if (v === "landing") onBack(); else setView(v); }}
          hoaName="Steiner Ranch HOA (Demo)"
        />
        <main style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
          {view === "dashboard"  && <Dashboard hoaId={demoHoaId} onNav={setView} />}
          {view === "homeowners" && <Homeowners hoaId={demoHoaId} />}
          {view === "payos"      && <PayOS hoaId={demoHoaId} />}
          {view === "violations" && <Violations hoaId={demoHoaId} />}
          {view === "arc"        && <ARCAgent hoaId={demoHoaId} />}
          {view === "boardroom"  && <BoardRoom hoaId={demoHoaId} />}
          {view === "votebox"    && <VoteBox hoaId={demoHoaId} />}
          {view === "workorders" && <WorkOrders hoaId={demoHoaId} />}
          {view === "amenity"    && <AmenityModule hoaId={demoHoaId} />}
          {view === "commhub"    && <CommHub hoaId={demoHoaId} />}
          {view === "permits"    && <PermitFeedView />}
          {view === "livefeeds"  && <LiveFeeds />}
          {view === "transition" && <TransitionMoat hoaId={demoHoaId} />}
          {view === "compliance" && <ComplianceTimeline hoaId={demoHoaId} />}
          {view === "marketplace" && <MarketplaceProofLoop hoaId={demoHoaId} demo />}
          {view === "investor" && <InvestorProofDashboard hoaId={demoHoaId} demo />}
        </main>
      </div>
    </div>
  );
}

function GatePassDemo({ onBack }: { onBack: () => void }) {
  const [persona, setPersona] = useState<DemoPersona>("select");

  if (persona === "board")      return <BoardDemo onBack={() => setPersona("select")} />;
  if (persona === "homeowner")  return <HomeownerPortal onBack={() => setPersona("select")} />;
  if (persona === "contractor") return <ContractorPortal onBack={() => setPersona("select")} />;

  return <DemoSelector onSelect={setPersona} onBack={onBack} />;
}

function PermitFeedView() {
  const { data: permits, isLoading } = useQuery({ queryKey: ["permits"], queryFn: () => rpc.getAustinPermits() });
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: 28 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.025em", marginBottom: 4 }}>Austin Permit Feed</h2>
            <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)" }}>Real-time contractor activity near your community.</div>
          </div>
          <Tag bg="rgba(90,158,122,0.12)" color="#7EC99A">Live · Open Data</Tag>
        </div>
        {isLoading && <div style={{ textAlign: "center", padding: 48, color: "var(--text-light)", fontFamily: T.fontSans }}>Loading permits…</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(permits ?? []).map((p: { id: string; type: string; contractor: string; value: string | null; address: string; date: string | null; status: string }) => (
            <Card key={p.id} className="card-hover" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{p.type}</div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>{p.contractor}</div>
                </div>
                {p.value && <div style={{ fontFamily: T.fontMono, fontSize: 12, fontWeight: 600, color: T.gold }}>{p.value}</div>}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 10, borderTop: `1px solid var(--border)`, flexWrap: "wrap" }}>
                {p.address && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)" }}>📍 {p.address}</span>}
                {p.date && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)" }}>{p.date}</span>}
                {p.status && <Tag>{p.status}</Tag>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HOA OS Shell ─────────────────────────────────────────────────────
function HOAOSShell({ hoaId, onExit }: { hoaId: string; onExit: () => void }) {
  const [view, setView] = useState<OSView>("dashboard");
  const { data: hoa } = useQuery({ queryKey: ["hoa", hoaId], queryFn: () => rpc.getHOA(hoaId) });
  const hoaZip = (hoa as {zip?: string} | null)?.zip;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar current={view} onNav={(v) => { if (v === "landing") { onExit(); } else { setView(v); } }} hoaName={(hoa as {community?: string} | null)?.community} />
      <main style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
        {view === "dashboard"   && <Dashboard hoaId={hoaId} onNav={setView} />}
        {view === "homeowners"  && <Homeowners hoaId={hoaId} />}
        {view === "payos"       && <PayOS hoaId={hoaId} />}
        {view === "violations"  && <Violations hoaId={hoaId} />}
        {view === "arc"         && <ARCAgent hoaId={hoaId} />}
        {view === "boardroom"   && <BoardRoom hoaId={hoaId} />}
        {view === "votebox"     && <VoteBox hoaId={hoaId} />}
        {view === "workorders"  && <WorkOrders hoaId={hoaId} />}
        {view === "amenity"     && <AmenityModule hoaId={hoaId} />}
        {view === "commhub"     && <CommHub hoaId={hoaId} />}
        {view === "permits"     && <PermitFeedView />}
        {view === "livefeeds"   && <LiveFeeds hoaZip={hoaZip} />}
        {view === "transition"  && <TransitionMoat hoaId={hoaId} />}
        {view === "compliance"  && <ComplianceTimeline hoaId={hoaId} />}
        {view === "marketplace" && <MarketplaceProofLoop hoaId={hoaId} />}
        {view === "investor"    && <InvestorProofDashboard hoaId={hoaId} />}
      </main>
    </div>
  );
}

// ─── HOA Selector (pick or demo) ──────────────────────────────────────
function HOASelector({ onSelect, onPublic }: { onSelect: (id: string) => void; onPublic: () => void }) {
  const { data: hoas = [], isLoading } = useQuery({ queryKey: ["hoa-list"], queryFn: () => rpc.getHOAList() });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ width: "100%", maxWidth: 480 }} className="anim-up">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: T.forest, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>GatePass OS</span>
        </div>
        <h2 style={{ fontFamily: T.fontSans, fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.03em" }}>Select a Community</h2>
        <p style={{ fontFamily: T.fontSans, fontSize: 14, color: "var(--text-light)", marginBottom: 28, fontWeight: 400 }}>Choose an enrolled HOA to open its dashboard.</p>
        {isLoading && <div style={{ color: T.inkLight, fontFamily: T.fontSans }}>Loading...</div>}
        {!isLoading && (hoas as {id:string;community:string;units:number;paid:boolean;plan:string;_count:{violations:number;workOrders:number}}[]).length === 0 && (
          <EmptyState icon="🏘️" title="No HOAs enrolled yet" sub="Enroll your first community from the public site." />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {(hoas as {id:string;community:string;units:number;paid:boolean;plan:string}[]).map(h => (
            <Card key={h.id} className="card-hover" style={{ padding: "16px 20px", cursor: "pointer" }} onClick={() => onSelect(h.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{h.community}</div>
                  <div style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)", marginTop: 3 }}>{h.units} units · {h.plan}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Tag color={h.paid ? T.success : T.warn} bg={h.paid ? T.successPale : T.warnPale}>{h.paid ? "Active" : "Pending"}</Tag>
                  <Icons.ArrowR />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <button onClick={onPublic} style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)", background: "none", border: "none", cursor: "pointer", marginTop: 8 }}>
          ← Back to public site
        </button>
      </div>
    </div>
  );
}

// ─── Route wrappers ───────────────────────────────────────────────────

function OnboardRoute() {
  const navigate = useNavigate();
  return <ErrorBoundary><HOAOnboarding onBack={() => navigate('/')} /></ErrorBoundary>;
}

function ContractorRoute() {
  const navigate = useNavigate();
  return <ErrorBoundary><ContractorWaitlist onBack={() => navigate('/')} /></ErrorBoundary>;
}

function DemoRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  if (searchParams.get("view") === "transition") {
    return <ErrorBoundary><BoardDemo initialView="transition" onBack={() => navigate('/demo')} /></ErrorBoundary>;
  }
  if (searchParams.get("view") === "marketplace") {
    return <ErrorBoundary><BoardDemo initialView="marketplace" onBack={() => navigate('/demo')} /></ErrorBoundary>;
  }
  if (searchParams.get("view") === "investor") {
    return <ErrorBoundary><BoardDemo initialView="investor" onBack={() => navigate('/demo')} /></ErrorBoundary>;
  }
  return <ErrorBoundary><GatePassDemo onBack={() => navigate('/')} /></ErrorBoundary>;
}

function TransitionDemoRoute() {
  const navigate = useNavigate();
  return <ErrorBoundary><BoardDemo initialView="transition" onBack={() => navigate('/demo')} /></ErrorBoundary>;
}

function MarketplaceLoopRoute() {
  return <ErrorBoundary><MarketplaceProofLoop hoaId={DEMO_HOA_ID} demo /></ErrorBoundary>;
}

function InvestorProofRoute() {
  return <ErrorBoundary><InvestorProofDashboard hoaId={DEMO_HOA_ID} demo /></ErrorBoundary>;
}

function OSRoute() {
  const auth = useAuth({ required: false });
  const navigate = useNavigate();
  const [activeHoaId, setActiveHoaId] = React.useState<string | null>(null);
  const [osView, setOsView] = React.useState<'select' | 'shell'>('select');

  if (auth.status !== 'authenticated') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: T.fontSans, fontSize: 20, color: 'var(--text)', marginBottom: 16 }}>Sign in to access GatePass OS</div>
          <Btn onClick={() => auth.signIn()}>Sign In</Btn>
        </div>
      </div>
    );
  }

  if (osView === 'shell' && activeHoaId) {
    return <HOAOSShell hoaId={activeHoaId} onExit={() => setOsView('select')} />;
  }

  return (
    <HOASelector
      onSelect={(id) => { setActiveHoaId(id); setOsView('shell'); }}
      onPublic={() => navigate('/')}
    />
  );
}

function AdminRoute() {
  const auth = useAuth({ required: false });
  if (auth.status !== 'authenticated') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: T.fontSans, fontSize: 20, color: 'var(--text)', marginBottom: 16 }}>Sign in to access GatePass Admin</div>
          <Btn onClick={() => auth.signIn()}>Sign In</Btn>
        </div>
      </div>
    );
  }
  return <ErrorBoundary><AdminConsole /></ErrorBoundary>;
}

// ─── App ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboard" element={<OnboardRoute />} />
      <Route path="/contractors" element={<ContractorRoute />} />
      <Route path="/demo" element={<DemoRoute />} />
      <Route path="/demo/transition" element={<TransitionDemoRoute />} />
      <Route path="/demo/marketplace" element={<MarketplaceLoopRoute />} />
      <Route path="/marketplace-loop" element={<MarketplaceLoopRoute />} />
      <Route path="/investor-proof" element={<InvestorProofRoute />} />
      <Route path="/os" element={<OSRoute />} />
      <Route path="/admin" element={<AdminRoute />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/investors" element={<Investors />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
