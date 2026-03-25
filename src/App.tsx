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

// ─── Success screens ──────────────────────────────────────────────────
function SuccessScreen({ type, position }: { type: "hoa" | "contractor"; position?: number }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>
      <div className="anim-up" style={{ textAlign: "center", maxWidth: 520, padding: 40 }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>{type === "hoa" ? "🏘️" : "🔧"}</div>
        <h1 style={{ fontFamily: T.fontSerif, fontSize: 36, fontWeight: 700, color: "var(--text)", marginBottom: 16, letterSpacing: "-0.02em" }}>
          {type === "hoa" ? "You're enrolled." : "Seat reserved."}
        </h1>
        <p style={{ fontFamily: T.fontSans, fontSize: 16, color: T.inkMid, lineHeight: 1.7, marginBottom: 32 }}>
          {type === "hoa"
            ? "Your community is now live on GatePass OS. We'll reach out within 24 hours to complete onboarding."
            : `You're #${position} of 25 founding contractors. We'll contact you when Austin launches.`}
        </p>
        <Btn onClick={() => window.location.href = "/"}>Back to GatePass</Btn>
      </div>
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────
function Landing({ onNav }: { onNav: (v: "hoa" | "contractor" | "demo" | "os") => void }) {
  const params = new URLSearchParams(window.location.search);
  const auth = useAuth({ required: false });
  const { data: contractorStats } = useQuery({ queryKey: ["contractorStats"], queryFn: () => rpc.getContractorStats(), refetchInterval: 30000 });
  const { data: hoaStats } = useQuery({ queryKey: ["hoaStats"], queryFn: () => rpc.getHOAStats() });

  if (params.get("hoa_success")) return <SuccessScreen type="hoa" />;
  if (params.get("contractor_success")) return <SuccessScreen type="contractor" position={params.get("pos") ? Number(params.get("pos")) : undefined} />;

  const MODULES = [
    { icon: "🚪", name: "GatePass Core",  desc: "Gate access, contractor vetting, permit intel",  color: T.forest },
    { icon: "💰", name: "PayOS",           desc: "Dues collection, budgeting, financial reports",  color: T.gold },
    { icon: "⚠️", name: "FineBot",         desc: "Violations, CC&R enforcement, escalation",       color: T.danger },
    { icon: "📐", name: "ARC Agent",       desc: "Architectural review, 45-day compliance clock",  color: T.blue },
    { icon: "🔧", name: "WorkOrder",       desc: "Maintenance requests, vendor routing, tracking", color: T.purple },
    { icon: "📅", name: "BoardRoom",       desc: "Meetings, AI agendas, minutes, governance",      color: T.forest },
    { icon: "🗳️", name: "VoteBox",         desc: "Secure elections, motions, and surveys",         color: T.gold },
    { icon: "🏊", name: "Amenity",         desc: "Pool, clubhouse, and court reservations",        color: T.blue },
    { icon: "📣", name: "CommHub",         desc: "Announcements, newsletters, messaging",          color: T.forest },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.cream, overflowX: "hidden" }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(244,241,236,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.stone}50`,
        padding: "0 clamp(20px, 4vw, 48px)",
        height: 62,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.forest}, ${T.forestLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 2px 8px rgba(42,82,64,0.3)`,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontFamily: T.fontSerif, fontSize: 19, fontWeight: 700, color: T.charcoal, letterSpacing: "-0.01em" }}>GatePass</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => onNav("demo")} style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 500, color: T.inkMid, background: "none", border: "none", cursor: "pointer", padding: "7px 12px" }}>Demo</button>
          <button onClick={() => onNav("hoa")} style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 500, color: T.inkMid, background: "none", border: "none", cursor: "pointer", padding: "7px 12px" }}>For HOAs</button>
          <Btn variant="outline" onClick={() => onNav("contractor")} style={{ padding: "7px 14px", fontSize: 12 }}>Contractor Waitlist</Btn>
          {auth.status === "authenticated"
            ? <Btn onClick={() => onNav("os")} style={{ padding: "7px 16px", fontSize: 12 }}>Open OS →</Btn>
            : <Btn onClick={() => auth.signIn()} style={{ padding: "7px 16px", fontSize: 12 }}>HOA Login</Btn>
          }
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: "clamp(120px, 14vw, 168px) clamp(20px, 4vw, 48px) clamp(72px, 8vw, 100px)", maxWidth: 1120, margin: "0 auto" }}>
        {/* Live badge */}
        <div className="anim-up" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px", background: T.forestPale,
          borderRadius: 20, border: `1px solid ${T.forest}25`,
          marginBottom: 30,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.forest }} className="ai-ring" />
          <span style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 500, color: T.forest, textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Now enrolling Austin HOAs
          </span>
        </div>

        {/* Headline */}
        <h1 className="anim-up-2" style={{
          fontFamily: T.fontSerif,
          fontSize: "clamp(46px, 6.5vw, 80px)",
          fontWeight: 700,
          color: T.charcoal,
          lineHeight: 1.04,
          letterSpacing: "-0.03em",
          maxWidth: 820,
          marginBottom: 26,
        }}>
          The operating system<br />
          <span style={{ color: T.forest }}>for your HOA.</span>
        </h1>

        <p className="anim-up-3" style={{
          fontFamily: T.fontSans,
          fontSize: "clamp(15px, 1.8vw, 18px)",
          color: T.inkMid,
          lineHeight: 1.75,
          maxWidth: 540,
          marginBottom: 14,
        }}>
          Your management company charges $50–150/unit/year to do what GatePass does automatically. Dues, violations, ARC reviews, work orders, elections — all handled by AI agents your community owns.
        </p>

        <p className="anim-up-3" style={{
          fontFamily: T.fontSerif,
          fontSize: 16,
          color: T.forest,
          fontStyle: "italic",
          marginBottom: 44,
        }}>
          $20/unit/year. No management company needed.
        </p>

        <div className="anim-up-4" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 72 }}>
          <Btn onClick={() => onNav("hoa")} style={{ padding: "14px 30px", fontSize: 15, boxShadow: `0 4px 20px rgba(42,82,64,0.22)` }}>
            Enroll Your HOA <Icons.ArrowR />
          </Btn>
          <Btn variant="ghost" onClick={() => onNav("demo")} style={{ padding: "14px 30px", fontSize: 15 }}>
            View Live Demo
          </Btn>
        </div>

        {/* Stats row */}
        <div className="anim-up-5" style={{ display: "flex", gap: 0, paddingTop: 40, borderTop: `1px solid ${T.stone}`, flexWrap: "wrap" }}>
          {[
            { label: "Units enrolled",         value: hoaStats ? hoaStats.totalUnits.toLocaleString() : "—" },
            { label: "Contractor seats left",   value: contractorStats ? String(contractorStats.spotsLeft) : "—" },
            { label: "Per unit / year",         value: "$20" },
            { label: "vs. management company",  value: "−75%" },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: "0 40px",
              borderRight: i < 3 ? `1px solid ${T.stone}` : "none",
              paddingLeft: i === 0 ? 0 : undefined,
            }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 34, fontWeight: 700, color: T.charcoal, letterSpacing: "-0.025em" }}>{s.value}</div>
              <div style={{ fontFamily: T.fontMono, fontSize: 9.5, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.09em", marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9 modules ── */}
      <section style={{ background: "#161614", padding: "88px clamp(20px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 52, flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "#5A9E7A", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
                9 AI Agents
              </div>
              <h2 style={{
                fontFamily: T.fontSerif,
                fontSize: "clamp(28px, 4vw, 50px)",
                fontWeight: 700,
                color: "#F0EDE8",
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                maxWidth: 580,
              }}>
                One platform replaces every service a management company offers.
              </h2>
            </div>
            <div style={{
              padding: "14px 20px",
              background: "rgba(42,82,64,0.12)",
              border: "1px solid rgba(42,82,64,0.2)",
              borderRadius: T.radiusMd,
              textAlign: "right",
            }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 700, color: "#7EC99A" }}>$22<span style={{ fontSize: 14, opacity: 0.6 }}>/unit/yr</span></div>
              <div style={{ fontFamily: T.fontMono, fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Full OS · All 9 modules</div>
            </div>
          </div>

          {/* 3-col grid: 3×3 = exactly 9, no orphan */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid rgba(255,255,255,0.06)", borderRadius: T.radiusMd, overflow: "hidden" }}>
            {MODULES.map((m) => (
              <div key={m.name} style={{
                background: "#1A1A18",
                padding: "28px 24px",
                borderRight: "1px solid rgba(255,255,255,0.05)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                transition: "background 0.15s",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${m.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, marginBottom: 16,
                }}>
                  {m.icon}
                </div>
                <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 700, color: "#F0EDE8", marginBottom: 6, letterSpacing: "-0.01em" }}>{m.name}</div>
                <div style={{ fontFamily: T.fontSans, fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.65 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof / Why ── */}
      <section style={{ background: T.cream, padding: "80px clamp(20px, 4vw, 48px)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { icon: "⚡", title: "9 agents, zero staff", body: "Every function runs automatically. No management company sitting in the middle collecting fees for emails and spreadsheets." },
              { icon: "🔒", title: "Your community owns it", body: "No vendor lock-in. Your data, your rules, your platform. Cancel anytime — unlike a management contract." },
              { icon: "📍", title: "Built for Austin", body: "Pre-loaded with Travis County permit feeds, Austin code compliance data, and neighborhood-specific contractor intel." },
            ].map(f => (
              <div key={f.title} style={{
                background: T.white,
                border: `1px solid ${T.stone}`,
                borderRadius: T.radiusMd,
                padding: "28px 26px",
                boxShadow: "0 1px 4px rgba(28,28,26,0.05)",
              }}>
                <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 600, color: T.charcoal, marginBottom: 10, letterSpacing: "-0.01em" }}>{f.title}</div>
                <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid, lineHeight: 1.7 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "88px clamp(20px, 4vw, 48px)",
        background: `linear-gradient(160deg, ${T.forestMid} 0%, ${T.forest} 60%, ${T.forestLight} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <h2 style={{
            fontFamily: T.fontSerif,
            fontSize: "clamp(30px, 4vw, 48px)",
            fontWeight: 700,
            color: T.white,
            marginBottom: 18,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
          }}>
            Stop paying for a manager.<br />Residents own the OS.
          </h2>
          <p style={{ fontFamily: T.fontSans, fontSize: 16, color: "rgba(255,255,255,0.72)", lineHeight: 1.75, marginBottom: 36 }}>
            GatePass puts every function of HOA management into software your community controls. No middleman. No markup. No 3am calls to a property manager.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn
              onClick={() => onNav("hoa")}
              style={{ padding: "14px 32px", fontSize: 15, background: T.white, color: T.forest, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
            >
              Enroll Your HOA <Icons.ArrowR />
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => onNav("contractor")}
              style={{ padding: "14px 32px", fontSize: 15, borderColor: "rgba(255,255,255,0.3)", color: T.white }}
            >
              Contractor Waitlist
            </Btn>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#111110", padding: "28px clamp(20px, 4vw, 48px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "linear-gradient(135deg, #2A5240, #3A6E54)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontFamily: T.fontSerif, fontSize: 14, color: "#F0EDE8", fontWeight: 600 }}>GatePass</span>
        </div>
        <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "rgba(255,255,255,0.28)" }}>© 2026 GatePass · Austin, TX · HOA Operating System</div>
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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>
      <header style={{ padding: "0 40px", height: 62, borderBottom: `1px solid var(--border)`, display: "flex", alignItems: "center", gap: 14, background: "var(--bg)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-light)", display: "flex", alignItems: "center", gap: 6, fontFamily: T.fontSans, fontSize: 13, cursor: "pointer" }}><Icons.Back /> Back</button>
        <div style={{ width: 1, height: 20, background: "var(--border)" }} />
        <span style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 600, color: "var(--text)" }}>GatePass</span>
        <Tag>HOA Enrollment</Tag>
      </header>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "56px 40px" }}>
        <div className="anim-up" style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.forest, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>HOA OS</div>
          <h1 style={{ fontFamily: T.fontSerif, fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 10 }}>Enroll Your HOA</h1>
          <p style={{ fontFamily: T.fontSans, fontSize: 14, color: "var(--text-mid)", lineHeight: 1.7 }}>Replace your management company with 9 AI agents for $20–22/unit/year.</p>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 36 }}>
          {[1, 2].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? T.forest : T.stone, transition: "background 0.3s" }} />)}
        </div>
        <Card style={{ padding: 32 }}>
          {step === 1 ? (
            <>
              <h2 style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 24 }}>Community Details</h2>
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
                  <div><Label>Annual Total</Label><div style={{ fontFamily: T.fontSerif, fontSize: 26, fontWeight: 700, color: T.charcoal }}>${totalCost.toLocaleString()}</div></div>
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
              <h2 style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 24 }}>Board Contact</h2>
              <FDInput label="Your Name" placeholder="Sarah Mitchell" value={form.contactName} onChange={e => set("contactName", e.target.value)} />
              <FDInput label="Email" type="email" placeholder="sarah@hoa.org" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
              <FDInput label="Phone (optional)" type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
              <div style={{ padding: "12px 16px", background: T.creamDark, borderRadius: T.radius, marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
                <div><Label>Total Due Today</Label><div style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 700 }}>${totalCost.toLocaleString()}</div></div>
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

// ─── Contractor Waitlist ──────────────────────────────────────────────
const CATEGORIES = [
  { id: "roofing", label: "Roofing" }, { id: "plumbing", label: "Plumbing" },
  { id: "foundation", label: "Foundation" }, { id: "hvac", label: "HVAC" },
  { id: "electrical", label: "Electrical" }, { id: "solar", label: "Solar" },
  { id: "landscaping", label: "Landscaping" }, { id: "painting", label: "Painting" },
];

function ContractorWaitlist({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ company: "", contactName: "", email: "", phone: "", category: "", zip: "" });
  const { data: stats } = useQuery({ queryKey: ["contractorStats"], queryFn: () => rpc.getContractorStats(), refetchInterval: 15000 });
  const mutation = useMutation({
    mutationFn: () => rpc.createContractorCheckout({ company: form.company, contactName: form.contactName, email: form.email, phone: form.phone, category: form.category, zip: form.zip }),
    onSuccess: (data: { url: string | null }) => { if (data.url) window.location.href = data.url; },
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const spotsLeft = stats?.spotsLeft ?? 25;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>
      <header style={{ padding: "0 40px", height: 62, borderBottom: `1px solid var(--border)`, display: "flex", alignItems: "center", gap: 14, background: "var(--bg)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-light)", display: "flex", alignItems: "center", gap: 6, fontFamily: T.fontSans, fontSize: 13, cursor: "pointer" }}><Icons.Back /> Back</button>
        <div style={{ width: 1, height: 20, background: "var(--border)" }} />
        <span style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 600, color: "var(--text)" }}>GatePass</span>
        <Tag bg={T.goldLight} color={T.gold}>Contractor Waitlist</Tag>
      </header>
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "56px 40px" }}>
        <div className="anim-up" style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: T.fontSerif, fontSize: 34, fontWeight: 700, color: T.charcoal, letterSpacing: "-0.02em", marginBottom: 10 }}>Reserve Your Seat</h1>
          <p style={{ fontFamily: T.fontSans, fontSize: 14, color: T.inkMid, lineHeight: 1.7 }}>$99 secures your founding contractor seat. First access to verified leads on launch day.</p>
        </div>
        <Card style={{ padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.08em" }}>Seats Remaining</span>
            <span style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 700, color: spotsLeft <= 10 ? T.danger : T.charcoal }}>{spotsLeft} of 25</span>
          </div>
          <div style={{ height: 5, background: T.stone, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((25 - spotsLeft) / 25) * 100}%`, background: T.gold, borderRadius: 3 }} />
          </div>
        </Card>
        <Card style={{ padding: 32 }}>
          <FDInput label="Company" placeholder="Summit Roofing Co." value={form.company} onChange={e => set("company", e.target.value)} />
          <FDInput label="Your Name" placeholder="Mike Torres" value={form.contactName} onChange={e => set("contactName", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FDInput label="Email" type="email" placeholder="mike@summit.com" value={form.email} onChange={e => set("email", e.target.value)} />
            <FDInput label="Phone" type="tel" placeholder="512-555-0100" value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FDSelect label="Category" value={form.category} onChange={e => set("category", e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </FDSelect>
            <FDInput label="Primary ZIP" placeholder="78732" value={form.zip} onChange={e => set("zip", e.target.value)} />
          </div>
          <Btn variant="gold" full onClick={() => mutation.mutate()} disabled={!form.company || !form.contactName || !form.email || !form.category || !form.zip || mutation.isPending} style={{ marginTop: 8 }}>
            {mutation.isPending ? "Redirecting…" : "Reserve Seat — $99"}
          </Btn>
          <div style={{ fontFamily: T.fontSans, fontSize: 11, color: T.inkLight, textAlign: "center", marginTop: 10 }}>Refundable if Austin doesn't launch within 6 months.</div>
        </Card>
      </div>
    </div>
  );
}

// ─── Demo / Permit Feed ───────────────────────────────────────────────
function DemoView({ onBack }: { onBack: () => void }) {
  const { data: permits, isLoading } = useQuery({ queryKey: ["permits"], queryFn: () => rpc.getAustinPermits() });
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{GLOBAL_CSS}</style>
      <header style={{ background: T.forest, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><Icons.Back /></button>
          <span style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 600, color: T.white }}>Austin Permit Feed</span>
        </div>
        <Tag bg="rgba(255,255,255,0.12)" color={T.white}>Live · Open Data</Tag>
      </header>
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 16, fontFamily: T.fontSans, fontSize: 13, color: T.inkLight }}>Real-time building permits from Austin Open Data — shows contractor activity in your neighborhood.</div>
        {isLoading && <div style={{ textAlign: "center", padding: 40, color: T.inkLight }}>Loading permits...</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(permits ?? []).map((p: { id: string; type: string; contractor: string; value: string | null; address: string; date: string | null; status: string }) => (
            <Card key={p.id} className="card-hover" style={{ padding: "16px 20px", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: T.ink }}>{p.type}</div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight }}>{p.contractor}</div>
                </div>
                {p.value && <div style={{ fontFamily: T.fontMono, fontSize: 12, fontWeight: 600, color: T.gold }}>{p.value}</div>}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.stone}30`, flexWrap: "wrap" }}>
                {p.address && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>📍 {p.address}</span>}
                {p.date && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>{p.date}</span>}
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
        {view === "permits"     && <DemoView onBack={() => setView("dashboard")} />}
      </main>
    </div>
  );
}

// ─── HOA Selector (pick or demo) ──────────────────────────────────────
function HOASelector({ onSelect, onPublic }: { onSelect: (id: string) => void; onPublic: () => void }) {
  const { data: hoas = [], isLoading } = useQuery({ queryKey: ["hoa-list"], queryFn: () => rpc.getHOAList() });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>
      <div style={{ width: "100%", maxWidth: 500 }} className="anim-up">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${T.forest}, ${T.forestLight})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 10px rgba(42,82,64,0.3)` }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span style={{ fontFamily: T.fontSerif, fontSize: 19, fontWeight: 700, color: "var(--text)" }}>GatePass OS</span>
        </div>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 7, letterSpacing: "-0.02em" }}>Select a Community</h2>
        <p style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)", marginBottom: 24 }}>Choose an enrolled HOA to open its dashboard.</p>
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
      {view === "demo"       && <DemoView onBack={() => setView("landing")} />}
      {view === "os-select"  && (
        auth.status === "authenticated"
          ? <HOASelector onSelect={(id) => { setActiveHoaId(id); setView("os"); }} onPublic={() => setView("landing")} />
          : <div style={{ minHeight: "100vh", background: T.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <style>{GLOBAL_CSS}</style>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: T.fontSerif, fontSize: 20, color: T.charcoal, marginBottom: 16 }}>Sign in to access GatePass OS</div>
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
