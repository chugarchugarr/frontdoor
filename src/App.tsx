import { useState } from "react";
import { client as rpc } from "@/lib/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@adaptive-ai/sdk/client";
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

// ─── Success screens ──────────────────────────────────────────────────
function SuccessScreen({ type, position }: { type: "hoa" | "contractor"; position?: number }) {
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
const MODULE_ICONS: Record<string, React.ReactNode> = {
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

// ─── Landing page ─────────────────────────────────────────────────────
function Landing({ onNav }: { onNav: (v: "hoa" | "contractor" | "demo" | "os") => void }) {
  const params = new URLSearchParams(window.location.search);
  const auth = useAuth({ required: false });
  const { data: contractorStats } = useQuery({ queryKey: ["contractorStats"], queryFn: () => rpc.getContractorStats(), refetchInterval: 30000 });
  const { data: hoaStats } = useQuery({ queryKey: ["hoaStats"], queryFn: () => rpc.getHOAStats() });

  if (params.get("hoa_success")) return <SuccessScreen type="hoa" />;
  if (params.get("contractor_success")) return <SuccessScreen type="contractor" position={params.get("pos") ? Number(params.get("pos")) : undefined} />;

  const MODULES = [
    { name: "GatePass Core",  desc: "Gate access, contractor vetting, permit intel" },
    { name: "PayOS",          desc: "Dues collection, budgeting, financial reports" },
    { name: "FineBot",        desc: "Violations, CC&R enforcement, escalation" },
    { name: "ARC Agent",      desc: "Architectural review, 45-day compliance clock" },
    { name: "WorkOrder",      desc: "Maintenance requests, vendor routing, tracking" },
    { name: "BoardRoom",      desc: "Meetings, AI agendas, minutes, governance" },
    { name: "VoteBox",        desc: "Secure elections, motions, and surveys" },
    { name: "Amenity",        desc: "Pool, clubhouse, and court reservations" },
    { name: "CommHub",        desc: "Announcements, newsletters, messaging" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", overflowX: "hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Floating pill nav ── */}
      <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 100, width: "calc(100% - 40px)", maxWidth: 860 }}>
        <nav style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid #E5E5E5",
          borderRadius: 999,
          padding: "10px 16px 10px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: T.forest,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style={{ fontFamily: T.fontSans, fontSize: 15, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em" }}>GatePass</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => onNav("demo")} style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 400, color: "#525252", background: "none", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 999 }}>Demo</button>
            <button onClick={() => onNav("hoa")} style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 400, color: "#525252", background: "none", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 999 }}>For HOAs</button>
            <button onClick={() => onNav("contractor")} style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 400, color: "#525252", background: "none", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 999 }}>Contractors</button>
            {auth.status === "authenticated"
              ? <Btn onClick={() => onNav("os")} style={{ padding: "8px 18px", fontSize: 13 }}>Open OS</Btn>
              : <Btn onClick={() => auth.signIn()} style={{ padding: "8px 18px", fontSize: 13 }}>Sign in</Btn>
            }
          </div>
        </nav>
      </div>

      {/* ── Hero ── */}
      <section style={{ paddingTop: "clamp(140px, 16vw, 180px)", paddingBottom: "clamp(80px, 10vw, 120px)", paddingLeft: "clamp(20px, 4vw, 48px)", paddingRight: "clamp(20px, 4vw, 48px)", maxWidth: 1080, margin: "0 auto" }}>

        {/* Status pill */}
        <div className="anim-up" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 14px 5px 10px",
          background: T.forestPale,
          borderRadius: 999,
          border: `1px solid rgba(42,82,64,0.15)`,
          marginBottom: 36,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.forest, flexShrink: 0 }} />
          <span style={{ fontFamily: T.fontSans, fontSize: 12, fontWeight: 500, color: T.forest, letterSpacing: "-0.01em" }}>
            Now enrolling Austin HOAs
          </span>
        </div>

        {/* Headline */}
        <h1 className="anim-up-2" style={{
          fontFamily: T.fontSans,
          fontSize: "clamp(52px, 7.5vw, 96px)",
          fontWeight: 800,
          color: "#0A0A0A",
          lineHeight: 1.0,
          letterSpacing: "-0.04em",
          maxWidth: 860,
          marginBottom: 32,
        }}>
          The operating system<br />
          for your HOA.
        </h1>

        <p className="anim-up-3" style={{
          fontFamily: T.fontSans,
          fontSize: "clamp(15px, 1.8vw, 18px)",
          color: "#525252",
          lineHeight: 1.7,
          maxWidth: 520,
          marginBottom: 12,
          fontWeight: 400,
        }}>
          Your management company charges $50–150/unit/year to do what GatePass does automatically. Dues, violations, ARC reviews, work orders, elections — all handled by AI agents your community owns.
        </p>

        <p className="anim-up-3" style={{
          fontFamily: T.fontSans,
          fontSize: 15,
          color: T.forest,
          fontWeight: 500,
          marginBottom: 48,
          letterSpacing: "-0.01em",
        }}>
          $20/unit/year. No management company needed.
        </p>

        <div className="anim-up-4" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 80 }}>
          <Btn onClick={() => onNav("hoa")} style={{ padding: "14px 28px", fontSize: 14, fontWeight: 500 }}>
            Enroll your HOA
          </Btn>
          <Btn variant="ghost" onClick={() => onNav("demo")} style={{ padding: "14px 28px", fontSize: 14, fontWeight: 500 }}>
            View live demo
          </Btn>
        </div>

        {/* Stats row — clean, no dividers */}
        <div className="anim-up-5" style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          {[
            { label: "Units enrolled",         value: hoaStats ? hoaStats.totalUnits.toLocaleString() : "—" },
            { label: "Contractor seats left",   value: contractorStats ? String(contractorStats.spotsLeft) : "—" },
            { label: "Per unit / year",         value: "$20" },
            { label: "vs. management company",  value: "−75%" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: T.fontSans, fontSize: 32, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.035em", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "#A3A3A3", marginTop: 5, fontWeight: 400 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9 modules ── */}
      <section style={{ background: "#FAFAFA", padding: "96px clamp(20px, 4vw, 48px)", borderTop: "1px solid #F0F0F0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 56, flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontFamily: T.fontSans, fontSize: 11, color: T.forest, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, fontWeight: 600 }}>
                9 AI Agents
              </div>
              <h2 style={{
                fontFamily: T.fontSans,
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 700,
                color: "#0A0A0A",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                maxWidth: 560,
              }}>
                One platform replaces every service a management company offers.
              </h2>
            </div>
            <div style={{
              padding: "16px 22px",
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 16,
              textAlign: "right",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontFamily: T.fontSans, fontSize: 26, fontWeight: 700, color: T.forest, letterSpacing: "-0.03em" }}>$22<span style={{ fontSize: 13, opacity: 0.5 }}>/unit/yr</span></div>
              <div style={{ fontFamily: T.fontSans, fontSize: 11, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>Full OS · All 9 modules</div>
            </div>
          </div>

          {/* 3-col grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {MODULES.map((m) => (
              <div key={m.name} className="card-hover" style={{
                background: "#FFFFFF",
                padding: "24px 22px",
                borderRadius: 16,
                border: "1px solid #F0F0F0",
                cursor: "default",
                transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: T.forestPale,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: T.forest,
                  marginBottom: 16,
                  flexShrink: 0,
                }}>
                  {MODULE_ICONS[m.name]}
                </div>
                <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: "#0A0A0A", marginBottom: 6, letterSpacing: "-0.02em" }}>{m.name}</div>
                <div style={{ fontFamily: T.fontSans, fontSize: 12.5, color: "#737373", lineHeight: 1.6, fontWeight: 400 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section style={{ background: "#FFFFFF", padding: "96px clamp(20px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              {
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                title: "9 agents, zero staff",
                body: "Every function runs automatically. No management company sitting in the middle collecting fees for emails and spreadsheets."
              },
              {
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                title: "Your community owns it",
                body: "No vendor lock-in. Your data, your rules, your platform. Cancel anytime — unlike a management contract."
              },
              {
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                title: "Built for Austin",
                body: "Pre-loaded with Travis County permit feeds, Austin code compliance data, and neighborhood-specific contractor intel."
              },
            ].map(f => (
              <div key={f.title} style={{
                background: "#FAFAFA",
                border: "1px solid #F0F0F0",
                borderRadius: 16,
                padding: "28px 26px",
              }}>
                <div style={{ marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 600, color: "#0A0A0A", marginBottom: 10, letterSpacing: "-0.02em" }}>{f.title}</div>
                <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#737373", lineHeight: 1.7 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "96px clamp(20px, 4vw, 48px)",
        background: "#111111",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontFamily: T.fontSans,
            fontSize: "clamp(32px, 4.5vw, 52px)",
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: 18,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
          }}>
            Stop paying for a manager. Residents own the OS.
          </h2>
          <p style={{ fontFamily: T.fontSans, fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: 40, fontWeight: 400 }}>
            GatePass puts every function of HOA management into software your community controls. No middleman. No markup. No 3am calls to a property manager.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn
              onClick={() => onNav("hoa")}
              style={{ padding: "14px 28px", fontSize: 14, background: "#FFFFFF", color: "#0A0A0A" }}
            >
              Enroll your HOA
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => onNav("contractor")}
              style={{ padding: "14px 28px", fontSize: 14, borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.7)" }}
            >
              Contractor Waitlist
            </Btn>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#0A0A0A", padding: "24px clamp(20px, 4vw, 48px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 7,
            background: T.forest,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontFamily: T.fontSans, fontSize: 14, color: "#FAFAFA", fontWeight: 600, letterSpacing: "-0.02em" }}>GatePass</span>
        </div>
        <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "-0.01em" }}>© 2026 GatePass · Austin, TX</div>
      </footer>
    </div>
  );
}

// ─── HOA Onboarding ───────────────────────────────────────────────────
function HOAOnboarding({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ community: "", name: "", zip: "", units: "", plan: "full", contactName: "", contactEmail: "", contactPhone: "" });
  const totalCost = form.units ? Number(form.units) * (form.plan === "full" ? 22 : 20) : 0;
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
          <p style={{ fontFamily: T.fontSans, fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7 }}>Replace your management company with 9 AI agents for $20–22/unit/year.</p>
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
                <option value="starter">Starter — $20/unit/yr (Gate access + CommHub + PayOS)</option>
                <option value="full">Full OS — $22/unit/yr (All 9 modules)</option>
              </FDSelect>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FDInput label="ZIP Code" placeholder="78732" value={form.zip} onChange={e => set("zip", e.target.value)} />
                <FDInput label="Number of Units" type="number" placeholder="500" value={form.units} onChange={e => set("units", e.target.value)} />
              </div>
              {totalCost > 0 && (
                <div style={{ padding: "14px 18px", background: T.forestPale, borderRadius: T.radius, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><Label>Annual Total</Label><div style={{ fontFamily: T.fontSans, fontSize: 26, fontWeight: 700, color: "var(--text)" }}>${totalCost.toLocaleString()}</div></div>
                  <div style={{ textAlign: "right", fontFamily: T.fontSans, fontSize: 12, color: T.inkLight }}>
                    <div>{form.units} units × ${form.plan === "full" ? 22 : 20}/yr</div>
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
                <div><Label>Total Due Today</Label><div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700 }}>${totalCost.toLocaleString()}</div></div>
                <div style={{ textAlign: "right", fontSize: 12, color: T.inkMid, fontFamily: T.fontSans }}><div>{form.community}</div><div>{form.units} units · {form.plan} plan</div></div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="ghost" onClick={() => setStep(1)}>Back</Btn>
                <Btn full onClick={() => mutation.mutate()} disabled={!form.contactName || !form.contactEmail || mutation.isPending}>
                  {mutation.isPending ? "Redirecting…" : <>Pay & Enroll <Icons.ArrowR /></>}
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

// ─── Live Demo — full OS shell, no auth required ─────────────────────
const DEMO_HOA_ID = "cmn5kapjd0000jitlk3ehms51";

function GatePassDemo({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<OSView>("dashboard");

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
            Demo · Steiner Ranch HOA · All 9 agents active
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
          {view === "dashboard"  && <Dashboard hoaId={DEMO_HOA_ID} onNav={setView} />}
          {view === "homeowners" && <Homeowners hoaId={DEMO_HOA_ID} />}
          {view === "payos"      && <PayOS hoaId={DEMO_HOA_ID} />}
          {view === "violations" && <Violations hoaId={DEMO_HOA_ID} />}
          {view === "arc"        && <ARCAgent hoaId={DEMO_HOA_ID} />}
          {view === "boardroom"  && <BoardRoom hoaId={DEMO_HOA_ID} />}
          {view === "votebox"    && <VoteBox hoaId={DEMO_HOA_ID} />}
          {view === "workorders" && <WorkOrders hoaId={DEMO_HOA_ID} />}
          {view === "amenity"    && <AmenityModule hoaId={DEMO_HOA_ID} />}
          {view === "commhub"    && <CommHub hoaId={DEMO_HOA_ID} />}
          {view === "permits"    && <PermitFeedView />}
        </main>
      </div>
    </div>
  );
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

// ─── Root ─────────────────────────────────────────────────────────────
type RootView = "landing" | "hoa" | "contractor" | "demo" | "os-select" | "os";

export default function App() {
  const [view, setView] = useState<RootView>("landing");
  const [activeHoaId, setActiveHoaId] = useState<string | null>(null);
  const auth = useAuth({ required: false });

  function handleNav(v: "hoa" | "contractor" | "demo" | "os") {
    if (v === "os") {
      if (auth.status === "authenticated") {
        setView("os-select");
      } else {
        auth.signIn();
      }
    } else if (v === "demo") setView("demo");
    else if (v === "hoa") setView("hoa");
    else setView("contractor");
  }

  // If user just authenticated and wanted OS, redirect them
  if (auth.status === "authenticated" && view === "landing") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("hoa_success")) {
      // handled inside Landing
    }
  }

  return (
    <>
      {view === "landing"    && <Landing onNav={handleNav} />}
      {view === "hoa"        && <HOAOnboarding onBack={() => setView("landing")} />}
      {view === "contractor" && <ContractorWaitlist onBack={() => setView("landing")} />}
      {view === "demo"       && <GatePassDemo onBack={() => setView("landing")} />}
      {view === "os-select"  && (
        auth.status === "authenticated"
          ? <HOASelector onSelect={(id) => { setActiveHoaId(id); setView("os"); }} onPublic={() => setView("landing")} />
          : <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <style>{GLOBAL_CSS}</style>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: T.fontSans, fontSize: 20, color: "var(--text)", marginBottom: 16 }}>Sign in to access GatePass OS</div>
                <Btn onClick={() => auth.signIn()}>Sign In</Btn>
              </div>
            </div>
      )}
      {view === "os" && activeHoaId && auth.status === "authenticated" && (
        <HOAOSShell hoaId={activeHoaId} onExit={() => setView("os-select")} />
      )}
    </>
  );
}
