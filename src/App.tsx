import { useState } from "react";
import { client as rpc } from "@/lib/client";
import { useQuery, useMutation } from "@tanstack/react-query";
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
    <div style={{ minHeight: "100vh", background: T.cream, display: "flex", alignItems: "center", justifyContent: "center" }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>
      <div className="anim-up" style={{ textAlign: "center", maxWidth: 520, padding: 40 }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>{type === "hoa" ? "🏘️" : "🔧"}</div>
        <h1 style={{ fontFamily: T.fontSerif, fontSize: 36, fontWeight: 700, color: T.charcoal, marginBottom: 16, letterSpacing: "-0.02em" }}>
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
function Landing({ onNav }: { onNav: (v: "hoa" | "contractor" | "demo") => void }) {
  const params = new URLSearchParams(window.location.search);
  const { data: contractorStats } = useQuery({ queryKey: ["contractorStats"], queryFn: () => rpc.getContractorStats(), refetchInterval: 30000 });
  const { data: hoaStats } = useQuery({ queryKey: ["hoaStats"], queryFn: () => rpc.getHOAStats() });

  if (params.get("hoa_success")) return <SuccessScreen type="hoa" />;
  if (params.get("contractor_success")) return <SuccessScreen type="contractor" position={params.get("pos") ? Number(params.get("pos")) : undefined} />;

  return (
    <div style={{ minHeight: "100vh", background: T.cream }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: `${T.cream}E8`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.stone}40`, padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: T.forest }}>
          <Icons.Door />
          <span style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 600, color: T.charcoal }}>GatePass</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => onNav("demo")} style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 500, color: T.inkMid, background: "none", border: "none", opacity: 0.7 }}>Demo</button>
          <button onClick={() => onNav("hoa")} style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 500, color: T.inkMid, background: "none", border: "none", opacity: 0.7 }}>For HOAs</button>
          <Btn variant="outline" onClick={() => onNav("contractor")} style={{ padding: "7px 16px", fontSize: 12 }}>Contractor Waitlist</Btn>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "160px 40px 100px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="anim-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", background: T.forestPale, borderRadius: 20, border: `1px solid ${T.forest}20`, marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.forest }} />
          <span style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 500, color: T.forest, textTransform: "uppercase", letterSpacing: "0.08em" }}>Now enrolling Austin HOAs</span>
        </div>
        <h1 className="anim-up-2" style={{ fontFamily: T.fontSerif, fontSize: "clamp(44px, 6vw, 76px)", fontWeight: 700, color: T.charcoal, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 800, marginBottom: 24 }}>
          The operating system<br /><span style={{ color: T.forest }}>for your HOA.</span>
        </h1>
        <p className="anim-up-3" style={{ fontFamily: T.fontSans, fontSize: 18, color: T.inkMid, lineHeight: 1.7, maxWidth: 560, marginBottom: 16 }}>
          Your management company charges $50–150/unit/year to do what GatePass does automatically. Dues, violations, ARC reviews, work orders, elections — all handled by AI agents your community owns.
        </p>
        <p className="anim-up-3" style={{ fontFamily: T.fontSerif, fontSize: 16, color: T.forest, fontStyle: "italic", marginBottom: 44 }}>
          $20/unit/year. No management company needed.
        </p>
        <div className="anim-up-4" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 72 }}>
          <Btn onClick={() => onNav("hoa")} style={{ padding: "13px 28px", fontSize: 15 }}>Enroll Your HOA <Icons.ArrowR /></Btn>
          <Btn variant="ghost" onClick={() => onNav("demo")} style={{ padding: "13px 28px", fontSize: 15 }}>View Demo</Btn>
        </div>
        {/* Stats */}
        <div style={{ display: "flex", gap: 48, paddingTop: 40, borderTop: `1px solid ${T.stone}`, flexWrap: "wrap" }}>
          {[
            { label: "Units enrolled",        value: hoaStats ? hoaStats.totalUnits.toLocaleString() : "—" },
            { label: "Contractor seats left",  value: contractorStats ? String(contractorStats.spotsLeft) : "—" },
            { label: "Per unit / year",        value: "$20" },
            { label: "vs. management company", value: "−75%" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 32, fontWeight: 700, color: T.charcoal, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 9 modules */}
      <section style={{ background: T.charcoal, padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.forest, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>9 AI Agents</div>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, color: T.white, marginBottom: 48, letterSpacing: "-0.02em", maxWidth: 640 }}>
            One platform replaces every service a management company offers.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
            {[
              { icon: "🚪", name: "GatePass Core",  desc: "Gate access, contractor vetting, permit intel" },
              { icon: "💰", name: "PayOS",           desc: "Dues collection, budgeting, financial reports" },
              { icon: "⚠️", name: "FineBot",         desc: "Violations detection, notices, escalation" },
              { icon: "📐", name: "ARC Agent",       desc: "Architectural review, 45-day compliance tracking" },
              { icon: "🔧", name: "WorkOrder",       desc: "Maintenance requests, vendor routing, tracking" },
              { icon: "📅", name: "BoardRoom",       desc: "Meetings, agendas, minutes, governance" },
              { icon: "🗳️", name: "VoteBox",         desc: "Secure elections, motions, and surveys" },
              { icon: "🏊", name: "Amenity",         desc: "Pool, clubhouse, and court reservations" },
              { icon: "📣", name: "CommHub",         desc: "Announcements, newsletters, messaging" },
            ].map(m => (
              <div key={m.name} style={{ background: T.charcoalMid, padding: "28px 24px" }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>{m.icon}</div>
                <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 700, color: T.white, marginBottom: 6 }}>{m.name}</div>
                <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 40px", background: T.forestPale }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 700, color: T.charcoal, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Stop paying for a manager.<br />Residents own the OS.
          </h2>
          <p style={{ fontFamily: T.fontSans, fontSize: 16, color: T.inkMid, lineHeight: 1.7, marginBottom: 32 }}>
            GatePass puts every function of HOA management into software your community controls. No middleman. No markup. No 3am calls to a property manager.
          </p>
          <Btn onClick={() => onNav("hoa")} style={{ padding: "14px 32px", fontSize: 15 }}>Enroll Your HOA <Icons.ArrowR /></Btn>
        </div>
      </section>

      <footer style={{ background: T.charcoal, padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#5A9E7A" }}>
          <Icons.Door />
          <span style={{ fontFamily: T.fontSerif, fontSize: 15, color: T.white }}>GatePass</span>
        </div>
        <div style={{ fontFamily: T.fontSans, fontSize: 12, color: `${T.white}40` }}>© 2026 GatePass · Austin, TX · HOA Operating System</div>
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
    <div style={{ minHeight: "100vh", background: T.cream }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>
      <header style={{ padding: "0 40px", height: 64, borderBottom: `1px solid ${T.stone}40`, display: "flex", alignItems: "center", gap: 16, background: `${T.cream}E8`, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.inkLight, display: "flex", alignItems: "center", gap: 6, fontFamily: T.fontSans, fontSize: 13 }}><Icons.Back /> Back</button>
        <div style={{ width: 1, height: 20, background: T.stone }} />
        <span style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 600, color: T.charcoal }}>GatePass</span>
        <Tag>HOA Enrollment</Tag>
      </header>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "56px 40px" }}>
        <div className="anim-up" style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.forest, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>HOA OS</div>
          <h1 style={{ fontFamily: T.fontSerif, fontSize: 36, fontWeight: 700, color: T.charcoal, letterSpacing: "-0.02em", marginBottom: 10 }}>Enroll Your HOA</h1>
          <p style={{ fontFamily: T.fontSans, fontSize: 14, color: T.inkMid, lineHeight: 1.7 }}>Replace your management company with 9 AI agents for $20–22/unit/year.</p>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 36 }}>
          {[1, 2].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? T.forest : T.stone, transition: "background 0.3s" }} />)}
        </div>
        <Card style={{ padding: 32 }}>
          {step === 1 ? (
            <>
              <h2 style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 600, color: T.charcoal, marginBottom: 24 }}>Community Details</h2>
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
              <h2 style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 600, color: T.charcoal, marginBottom: 24 }}>Board Contact</h2>
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
    <div style={{ minHeight: "100vh", background: T.cream }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>
      <header style={{ padding: "0 40px", height: 64, borderBottom: `1px solid ${T.stone}40`, display: "flex", alignItems: "center", gap: 16, background: `${T.cream}E8`, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.inkLight, display: "flex", alignItems: "center", gap: 6, fontFamily: T.fontSans, fontSize: 13 }}><Icons.Back /> Back</button>
        <div style={{ width: 1, height: 20, background: T.stone }} />
        <span style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 600, color: T.charcoal }}>GatePass</span>
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
    <div style={{ minHeight: "100vh", background: T.cream }}>
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
    <div style={{ display: "flex", minHeight: "100vh", background: T.cream }}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar current={view} onNav={(v) => { if (v === "landing") { onExit(); } else { setView(v); } }} hoaName={(hoa as {community?: string} | null)?.community} />
      <main style={{ flex: 1, overflow: "auto" }}>
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
    <div style={{ minHeight: "100vh", background: T.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} className="gp-grid-bg">
      <style>{GLOBAL_CSS}</style>
      <div style={{ width: "100%", maxWidth: 500 }} className="anim-up">
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 32 }}>
          <Icons.Door />
          <span style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 600, color: T.charcoal }}>GatePass OS</span>
        </div>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: 24, fontWeight: 700, color: T.charcoal, marginBottom: 6 }}>Select a Community</h2>
        <p style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkLight, marginBottom: 24 }}>Choose an enrolled HOA to open its dashboard.</p>
        {isLoading && <div style={{ color: T.inkLight, fontFamily: T.fontSans }}>Loading...</div>}
        {!isLoading && (hoas as {id:string;community:string;units:number;paid:boolean;plan:string;_count:{violations:number;workOrders:number}}[]).length === 0 && (
          <EmptyState icon="🏘️" title="No HOAs enrolled yet" sub="Enroll your first community from the public site." />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {(hoas as {id:string;community:string;units:number;paid:boolean;plan:string}[]).map(h => (
            <Card key={h.id} className="card-hover" style={{ padding: "16px 20px", cursor: "pointer", transition: "all 0.15s" }} onClick={() => onSelect(h.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: T.ink }}>{h.community}</div>
                  <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight, marginTop: 2 }}>{h.units} units · {h.plan}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Tag color={h.paid ? T.success : T.warn} bg={h.paid ? T.successPale : T.warnPale}>{h.paid ? "Active" : "Pending"}</Tag>
                  <Icons.ArrowR />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <button onClick={onPublic} style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkLight, background: "none", border: "none", cursor: "pointer" }}>
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

  return (
    <>
      {view === "landing"    && <Landing onNav={(v) => { if (v === "demo") setView("demo"); else if (v === "hoa") setView("hoa"); else setView("contractor"); }} />}
      {view === "hoa"        && <HOAOnboarding onBack={() => setView("landing")} />}
      {view === "contractor" && <ContractorWaitlist onBack={() => setView("landing")} />}
      {view === "demo"       && <DemoView onBack={() => setView("landing")} />}
      {view === "os-select"  && <HOASelector onSelect={(id) => { setActiveHoaId(id); setView("os"); }} onPublic={() => setView("landing")} />}
      {view === "os" && activeHoaId && <HOAOSShell hoaId={activeHoaId} onExit={() => setView("os-select")} />}
    </>
  );
}
