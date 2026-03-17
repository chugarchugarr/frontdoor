import { useState, useEffect } from "react";
import { client as rpc } from "@/lib/client";
import { useQuery, useMutation } from "@tanstack/react-query";

// ─── Design Tokens ────────────────────────────────────────────────────
const T = {
  cream: "#F4F1EC",
  creamDark: "#EAE6DE",
  stone: "#D4CFC6",
  charcoal: "#1C1C1A",
  charcoalMid: "#2E2E2A",
  forest: "#2A5240",
  forestLight: "#3A6E54",
  forestPale: "#EAF0EC",
  gold: "#B8883A",
  goldLight: "#F0E4C8",
  ink: "#1A1A18",
  inkMid: "#4A4A44",
  inkLight: "#8A8A82",
  white: "#FFFFFF",
  danger: "#B84040",
  dangerPale: "#F8EDED",
  success: "#2A6040",
  successPale: "#EAF4EE",
  fontSerif: "'Playfair Display', 'Georgia', serif",
  fontSans: "'DM Sans', 'Helvetica Neue', sans-serif",
  fontMono: "'DM Mono', 'Courier New', monospace",
  radius: "4px",
  radiusMd: "8px",
  radiusLg: "12px",
};

const GRID_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: ${T.cream}; color: ${T.ink}; font-family: ${T.fontSans}; -webkit-font-smoothing: antialiased; }
  input, select, textarea { font-family: inherit; }
  button { cursor: pointer; font-family: inherit; }
  .fd-grid-bg {
    background-image:
      linear-gradient(rgba(42,82,64,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(42,82,64,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .anim-up { animation: fadeUp 0.6s ease both; }
  .anim-up-2 { animation: fadeUp 0.6s ease 0.1s both; }
  .anim-up-3 { animation: fadeUp 0.6s ease 0.2s both; }
  .anim-up-4 { animation: fadeUp 0.6s ease 0.3s both; }
  input:focus, textarea:focus, select:focus { outline: none; border-color: ${T.forest} !important; box-shadow: 0 0 0 2px rgba(42,82,64,0.12); }
  .permit-card:hover { border-color: ${T.forest} !important; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(42,82,64,0.1) !important; }
  .btn-primary:hover:not(:disabled) { background: ${T.forestLight} !important; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(42,82,64,0.25); }
  .btn-ghost:hover { background: ${T.creamDark} !important; }
  .btn-gold:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
  .role-card:hover { border-color: ${T.forest} !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(42,82,64,0.12) !important; }
  .tab-btn { transition: all 0.15s; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: ${T.stone}; border-radius: 3px; }
  /* Responsive layout classes */
  .hoa-cta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
    max-width: 1100px;
    margin: 0 auto;
  }
  .fd-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: ${T.cream}E8; backdrop-filter: blur(12px);
    border-bottom: 1px solid ${T.stone}40;
    padding: 0 40px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .fd-nav-links { display: flex; align-items: center; gap: 24px; }
  .fd-nav-secondary { display: flex; gap: 24px; align-items: center; }
  .fd-hero { padding: 160px 40px 100px; max-width: 1100px; margin: 0 auto; }
  .fd-section-pad { padding: 100px 40px; }
  .fd-how-pad { background: ${T.charcoal}; padding: 100px 40px; }
  @media (max-width: 768px) {
    .hoa-cta-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    .fd-nav { padding: 0 20px; }
    .fd-nav-secondary { display: none; }
    .fd-hero { padding: 100px 20px 60px; }
    .fd-section-pad { padding: 60px 20px; }
    .fd-how-pad { padding: 60px 20px; }
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────
const Icon = {
  Door: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="1.5"/>
      <circle cx="15.5" cy="12" r="0.75" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Shield: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Activity: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Tool: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  Building: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
  ),
  MapPin: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Check: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  ArrowRight: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  ArrowLeft: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  Bell: ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Lock: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Unlock: ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </svg>
  ),
};

// ─── Shared UI ────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 500, color: T.inkLight, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 8 }}>{children}</div>;
}

function FDInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <Label>{label}</Label>}
      <input {...props} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${T.stone}`, borderRadius: T.radius, background: T.white, fontSize: 14, color: T.ink, fontFamily: T.fontSans, transition: "border-color 0.15s", ...props.style }} />
    </div>
  );
}

function FDSelect({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && <Label>{label}</Label>}
      <select {...props} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${T.stone}`, borderRadius: T.radius, background: T.white, fontSize: 14, color: T.ink, fontFamily: T.fontSans, appearance: "none" as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8A82' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}>
        {children}
      </select>
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, disabled, type = "button", style: s }: {
  children: React.ReactNode; variant?: "primary" | "ghost" | "outline" | "gold";
  onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: T.radius, fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, letterSpacing: "0.01em", opacity: disabled ? 0.5 : 1, transition: "all 0.15s", cursor: disabled ? "not-allowed" : "pointer" };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: T.forest, color: T.white, border: "none" },
    ghost: { background: "transparent", color: T.inkMid, border: `1px solid ${T.stone}` },
    outline: { background: "transparent", color: T.forest, border: `1px solid ${T.forest}` },
    gold: { background: T.gold, color: T.white, border: "none" },
  };
  const cls = variant === "gold" ? "btn-gold" : variant === "ghost" ? "btn-ghost" : "btn-primary";
  return <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled} className={cls} style={{ ...base, ...variants[variant], ...s }}>{children}</button>;
}

function Toggle({ on, onToggle, label, sub }: { on: boolean; onToggle: () => void; label: string; sub?: string }) {
  return (
    <div onClick={onToggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", cursor: "pointer", borderBottom: `1px solid ${T.stone}20`, userSelect: "none" as const }}>
      <div>
        <div style={{ fontFamily: T.fontSans, fontSize: 14, color: T.ink, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ width: 44, height: 24, borderRadius: 12, background: on ? T.forest : T.stone, transition: "background 0.2s", position: "relative", flexShrink: 0, marginLeft: 16 }}>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: T.white, position: "absolute", top: 2, left: on ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
      </div>
    </div>
  );
}

function Tag({ children, color = T.forest, bg = T.forestPale }: { children: React.ReactNode; color?: string; bg?: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: T.fontMono, color, background: bg, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{children}</span>;
}

// ─── Categories ───────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "roofing", label: "Roofing", emoji: "🏠" },
  { id: "plumbing", label: "Plumbing", emoji: "🔧" },
  { id: "foundation", label: "Foundation", emoji: "🧱" },
  { id: "hvac", label: "HVAC", emoji: "❄️" },
  { id: "electrical", label: "Electrical", emoji: "⚡" },
  { id: "solar", label: "Solar", emoji: "☀️" },
  { id: "landscaping", label: "Landscaping", emoji: "🌿" },
  { id: "painting", label: "Painting", emoji: "🎨" },
];

type View = "landing" | "hoa" | "contractor" | "demo";

// ─── Permit Feed ──────────────────────────────────────────────────────
function PermitFeed() {
  const { data: permits, isLoading } = useQuery({
    queryKey: ["permits"],
    queryFn: () => rpc.getAustinPermits(),
    staleTime: 60000,
  });

  const categoryIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("roof")) return "🏠";
    if (t.includes("plumb") || t.includes("water")) return "🔧";
    if (t.includes("found")) return "🧱";
    if (t.includes("hvac") || t.includes("cool") || t.includes("heat")) return "❄️";
    if (t.includes("electric")) return "⚡";
    if (t.includes("solar")) return "☀️";
    return "📋";
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.forest }} />
        <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Austin Open Data · Live permit records</span>
      </div>
      {isLoading && <div style={{ padding: 40, textAlign: "center" as const, color: T.inkLight, fontFamily: T.fontSans, fontSize: 14 }}>Loading permits...</div>}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {(permits ?? []).map((p: { id: string; type: string; contractor: string; value: string | null; address: string; date: string | null; status: string }, i: number) => (
          <div key={p.id} className="permit-card" style={{ background: T.white, border: `1px solid ${T.stone}`, borderRadius: T.radiusMd, padding: "18px 20px", transition: "all 0.2s", cursor: "pointer", animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{categoryIcon(p.type)}</span>
                <div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: T.ink }}>{p.type}</div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginTop: 2 }}>{p.contractor}</div>
                </div>
              </div>
              {p.value && <div style={{ fontFamily: T.fontMono, fontSize: 12, fontWeight: 500, color: T.gold }}>{p.value}</div>}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.stone}30`, flexWrap: "wrap" as const }}>
              {p.address && <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.MapPin size={12} /><span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>{p.address}</span></div>}
              {p.date && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>{p.date}</span>}
              {p.status && <Tag>{p.status}</Tag>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────
function Landing({ onNav }: { onNav: (v: View) => void }) {
  const params = new URLSearchParams(window.location.search);
  const hoaSuccess = params.get("hoa_success");
  const contractorSuccess = params.get("contractor_success");
  const contractorPos = params.get("pos");

  const { data: contractorStats } = useQuery({ queryKey: ["contractorStats"], queryFn: () => rpc.getContractorStats(), refetchInterval: 30000 });
  const { data: hoaStats } = useQuery({ queryKey: ["hoaStats"], queryFn: () => rpc.getHOAStats() });

  if (hoaSuccess) return <SuccessScreen type="hoa" />;
  if (contractorSuccess) return <SuccessScreen type="contractor" position={contractorPos ? Number(contractorPos) : undefined} />;

  return (
    <div style={{ minHeight: "100vh", background: T.cream }} className="fd-grid-bg">
      <style>{GRID_CSS}</style>

      {/* Nav */}
      <nav className="fd-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.forest }}>
          <Icon.Door />
          <span style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 600, color: T.charcoal, letterSpacing: "-0.01em" }}>FrontDoor</span>
        </div>
        <div className="fd-nav-links">
          <div className="fd-nav-secondary">
            <button onClick={() => onNav("demo")} style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 500, color: T.inkMid, background: "none", border: "none", opacity: 0.7 }}>See Demo</button>
            <button onClick={() => onNav("hoa")} style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 500, color: T.inkMid, background: "none", border: "none", opacity: 0.7 }}>For HOAs</button>
          </div>
          <Btn variant="outline" onClick={() => onNav("contractor")} style={{ padding: "8px 18px", fontSize: 13 }}>Contractor Waitlist</Btn>
        </div>
      </nav>

      {/* Hero */}
      <section className="fd-hero">
        <div className="anim-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: T.forestPale, borderRadius: 20, border: `1px solid ${T.forest}20`, marginBottom: 32 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.forest }} />
          <span style={{ fontFamily: T.fontMono, fontSize: 11, fontWeight: 500, color: T.forest, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Now enrolling Austin HOAs</span>
        </div>
        <h1 className="anim-up-2" style={{ fontFamily: T.fontSerif, fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 700, color: T.charcoal, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 800, marginBottom: 28 }}>
          The digital front door<br /><span style={{ color: T.forest }}>to every home.</span>
        </h1>
        <p className="anim-up-3" style={{ fontFamily: T.fontSans, fontSize: 18, color: T.inkMid, lineHeight: 1.7, maxWidth: 540, marginBottom: 48 }}>
          Neighborhood infrastructure that gives homeowners full control over who can reach them — and gives contractors access to a warm, verified audience.
        </p>
        <div className="anim-up-4" style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, marginBottom: 80 }}>
          <Btn onClick={() => onNav("hoa")} style={{ padding: "14px 32px", fontSize: 15 }}>Enroll Your HOA <Icon.ArrowRight /></Btn>
          <Btn variant="ghost" onClick={() => onNav("demo")} style={{ padding: "14px 32px", fontSize: 15 }}>View Demo</Btn>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 48, paddingTop: 48, borderTop: `1px solid ${T.stone}`, flexWrap: "wrap" as const }}>
          {[
            { label: "HOA Units Enrolled", value: hoaStats ? hoaStats.totalUnits.toLocaleString() : "—" },
            { label: "Contractor Seats Left", value: contractorStats ? String(contractorStats.spotsLeft) : "—" },
            { label: "Annual HOA Rate", value: "$10/unit" },
            { label: "Contractor Deposit", value: "$99" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 32, fontWeight: 700, color: T.charcoal, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="fd-how-pad">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.forest, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 16 }}>How It Works</div>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: T.white, marginBottom: 64, letterSpacing: "-0.02em", maxWidth: 600 }}>Infrastructure that works for both sides.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}>
            {[
              { num: "01", title: "HOA Enrolls", body: "Board signs up their community. Every home gets a digital front door with permission toggles residents control.", icon: <Icon.Building /> },
              { num: "02", title: "Homeowners Set Permissions", body: "Each resident controls which contractor categories can reach them. Full transparency on who knocks and why.", icon: <Icon.Shield /> },
              { num: "03", title: "Permit Feed Goes Live", body: "Real-time data from Austin Open Data shows neighborhood repair activity. See what's happening on your street.", icon: <Icon.Activity /> },
              { num: "04", title: "Contractors Connect", body: "Verified contractors send digital knocks only to homeowners who opted in. Warm, consented leads. No cold doors.", icon: <Icon.Tool /> },
            ].map(s => (
              <div key={s.num} style={{ background: T.charcoalMid, padding: "36px 32px" }}>
                <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.forest, marginBottom: 20, letterSpacing: "0.08em" }}>{s.num}</div>
                <div style={{ color: T.forestLight, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 600, color: T.white, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontFamily: T.fontSans, fontSize: 14, color: `${T.white}60`, lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOA CTA */}
      <section className="fd-section-pad">
        <div className="hoa-cta-grid">
          <div>
            <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.forest, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 16 }}>For HOA Boards</div>
            <h2 style={{ fontFamily: T.fontSerif, fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 700, color: T.charcoal, letterSpacing: "-0.02em", marginBottom: 20, lineHeight: 1.15 }}>After the next hail storm,<br />your phone rings nonstop.</h2>
            <p style={{ fontFamily: T.fontSans, fontSize: 16, color: T.inkMid, lineHeight: 1.7, marginBottom: 32 }}>40 contractors will knock on every door in your neighborhood for weeks. Your residents will complain to you. FrontDoor stops that — and replaces it with a verified contractor network residents actually want.</p>
            {["HOA board authorizes platform — instant community enrollment", "Resident permission toggles — they control what reaches them", "Compliance dashboard — see who's soliciting your community", "Founding rate: $10/unit/year (goes to $15 at public launch)"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.forestPale, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><Icon.Check /></div>
                <span style={{ fontFamily: T.fontSans, fontSize: 14, color: T.inkMid, lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
            <div style={{ marginTop: 32 }}>
              <Btn onClick={() => onNav("hoa")} style={{ padding: "14px 32px" }}>Enroll Your HOA <Icon.ArrowRight /></Btn>
            </div>
          </div>

          {/* Sample HOA card */}
          <div style={{ background: T.white, borderRadius: T.radiusLg, border: `1px solid ${T.stone}`, overflow: "hidden" }}>
            <div style={{ background: T.forest, padding: "20px 24px", display: "flex", alignItems: "center", gap: 10 }}>
              <Icon.Shield size={18} />
              <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: T.white }}>Steiner Ranch HOA</span>
              <Tag bg="rgba(255,255,255,0.15)" color={T.white}>4,500 Units</Tag>
            </div>
            <div style={{ padding: 24 }}>
              <Label>Community Permissions</Label>
              {[
                { label: "Verified contractor requests", on: true },
                { label: "HOA-approved vendor list", on: true },
                { label: "Neighborhood repair alerts", on: true },
                { label: "Unsolicited solar sales", on: false },
                { label: "General solicitation", on: false },
              ].map(p => (
                <div key={p.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.stone}30` }}>
                  <span style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid }}>{p.label}</span>
                  <Tag color={p.on ? T.success : T.danger} bg={p.on ? T.successPale : T.dangerPale}>{p.on ? "Allowed" : "Blocked"}</Tag>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: "14px 16px", background: T.forestPale, borderRadius: T.radius }}>
                <Label>Annual Cost</Label>
                <div style={{ fontFamily: T.fontSerif, fontSize: 24, fontWeight: 700, color: T.charcoal }}>$45,000 <span style={{ fontSize: 14, fontWeight: 400, color: T.inkLight }}>/ year</span></div>
                <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginTop: 4 }}>4,500 units × $10 — billed to HOA, passed through dues</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contractor CTA */}
      <section style={{ background: T.forestPale, padding: "80px 40px", borderTop: `1px solid ${T.stone}` }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" as const }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.forest, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 16 }}>For Contractors</div>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 700, color: T.charcoal, marginBottom: 16, letterSpacing: "-0.02em" }}>Stop paying $50–200 per cold door.</h2>
          <p style={{ fontFamily: T.fontSans, fontSize: 16, color: T.inkMid, lineHeight: 1.7, marginBottom: 32 }}>Reserve your founding contractor seat for $99. Access verified, consenting homeowners in your zip code on launch day. {contractorStats ? `${contractorStats.spotsLeft} seats remaining.` : "25 seats total."}</p>
          <Btn variant="gold" onClick={() => onNav("contractor")} style={{ padding: "14px 32px", fontSize: 15 }}>Reserve My Seat — $99 <Icon.ArrowRight /></Btn>
          <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginTop: 16 }}>Refundable if Austin doesn't launch within 6 months.</div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: T.charcoal, padding: 40 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.forestLight }}><Icon.Door /><span style={{ fontFamily: T.fontSerif, fontSize: 16, color: T.white }}>FrontDoor</span></div>
          <div style={{ fontFamily: T.fontSans, fontSize: 12, color: `${T.white}40` }}>© 2026 FrontDoor · Austin, TX · Neighborhood infrastructure</div>
        </div>
      </footer>
    </div>
  );
}

// ─── HOA Onboarding ───────────────────────────────────────────────────
function HOAOnboarding({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ community: "", name: "", zip: "", units: "", contactName: "", contactEmail: "", contactPhone: "" });
  const totalCost = form.units ? Number(form.units) * 10 : 0;

  const mutation = useMutation({
    mutationFn: () => rpc.createHOACheckout({ name: form.name || form.community, community: form.community, zip: form.zip, units: Number(form.units), contactName: form.contactName, contactEmail: form.contactEmail, contactPhone: form.contactPhone }),
    onSuccess: (data: { url: string | null; hoaId: string }) => { if (data.url) window.location.href = data.url; },
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ minHeight: "100vh", background: T.cream }} className="fd-grid-bg">
      <style>{GRID_CSS}</style>
      <header style={{ padding: "0 40px", height: 64, borderBottom: `1px solid ${T.stone}40`, display: "flex", alignItems: "center", gap: 16, background: `${T.cream}E8`, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.inkLight, display: "flex", alignItems: "center", gap: 8, fontFamily: T.fontSans, fontSize: 13 }}><Icon.ArrowLeft size={16} /> Back</button>
        <div style={{ width: 1, height: 20, background: T.stone }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.forest }}><Icon.Door /><span style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 600, color: T.charcoal }}>FrontDoor</span></div>
        <Tag>HOA Enrollment</Tag>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 40px" }}>
        <div className="anim-up" style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.forest, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 12 }}>Founding Community Rate</div>
          <h1 style={{ fontFamily: T.fontSerif, fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: T.charcoal, letterSpacing: "-0.02em", marginBottom: 12 }}>Enroll Your HOA</h1>
          <p style={{ fontFamily: T.fontSans, fontSize: 15, color: T.inkMid, lineHeight: 1.7 }}>$10 per unit per year — billed annually. Lock in the founding rate before we go to $15 at public launch.</p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, marginBottom: 40 }}>
          {[1, 2].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? T.forest : T.stone, transition: "background 0.3s" }} />)}
        </div>

        <div className="anim-up-2" style={{ background: T.white, border: `1px solid ${T.stone}`, borderRadius: T.radiusMd, padding: 36 }}>
          {step === 1 ? (
            <>
              <h2 style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 600, color: T.charcoal, marginBottom: 28 }}>Community Details</h2>
              <FDInput label="Community Name" placeholder="Steiner Ranch HOA" value={form.community} onChange={e => set("community", e.target.value)} />
              <FDInput label="HOA Legal Name (if different)" placeholder="Steiner Ranch Community Association" value={form.name} onChange={e => set("name", e.target.value)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FDInput label="ZIP Code" placeholder="78732" value={form.zip} onChange={e => set("zip", e.target.value)} />
                <FDInput label="Number of Units" type="number" placeholder="500" value={form.units} onChange={e => set("units", e.target.value)} />
              </div>
              {totalCost > 0 && (
                <div style={{ padding: "16px 20px", background: T.forestPale, borderRadius: T.radius, marginBottom: 24, border: `1px solid ${T.forest}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><Label>Annual Total</Label><div style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 700, color: T.charcoal }}>${totalCost.toLocaleString()}</div></div>
                    <div style={{ textAlign: "right" as const }}><div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid }}>{form.units} units</div><div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight }}>× $10 / unit / yr</div></div>
                  </div>
                </div>
              )}
              <Btn onClick={() => setStep(2)} disabled={!form.community || !form.zip || !form.units}>Continue <Icon.ArrowRight /></Btn>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 600, color: T.charcoal, marginBottom: 28 }}>Board Contact</h2>
              <FDInput label="Contact Name" placeholder="Sarah Mitchell" value={form.contactName} onChange={e => set("contactName", e.target.value)} />
              <FDInput label="Email" type="email" placeholder="sarah@hoa.org" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
              <FDInput label="Phone (optional)" type="tel" placeholder="512-555-0100" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
              <div style={{ padding: "16px 20px", background: T.creamDark, borderRadius: T.radius, marginBottom: 28, display: "flex", justifyContent: "space-between" }}>
                <div><Label>Total Due Today</Label><div style={{ fontFamily: T.fontSerif, fontSize: 24, fontWeight: 700, color: T.charcoal }}>${totalCost.toLocaleString()}</div></div>
                <div style={{ textAlign: "right" as const, fontSize: 13, color: T.inkMid, fontFamily: T.fontSans }}><div>{form.community}</div><div>{form.units} units · Austin TX {form.zip}</div></div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Btn variant="ghost" onClick={() => setStep(1)}>Back</Btn>
                <Btn onClick={() => mutation.mutate()} disabled={!form.contactName || !form.contactEmail || mutation.isPending}>
                  {mutation.isPending ? "Redirecting..." : <>Pay & Enroll <Icon.ArrowRight /></>}
                </Btn>
              </div>
              {mutation.isError && <div style={{ marginTop: 16, padding: "12px 16px", background: T.dangerPale, borderRadius: T.radius, fontFamily: T.fontSans, fontSize: 13, color: T.danger }}>Something went wrong. Please try again.</div>}
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: 24, justifyContent: "center" }}>
          {["Founding rate locked in", "Stripe-secured payment", "HOA-authorized model"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}><Icon.Check size={12} /><span style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight }}>{t}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Contractor Waitlist ──────────────────────────────────────────────
function ContractorWaitlist({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ company: "", contactName: "", email: "", phone: "", category: "", zip: "" });
  const { data: stats } = useQuery({ queryKey: ["contractorStats"], queryFn: () => rpc.getContractorStats(), refetchInterval: 15000 });
  const mutation = useMutation({
    mutationFn: () => rpc.createContractorCheckout({ company: form.company, contactName: form.contactName, email: form.email, phone: form.phone, category: form.category, zip: form.zip }),
    onSuccess: (data: { url: string | null; contractorId: string; position: number }) => { if (data.url) window.location.href = data.url; },
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const spotsLeft = stats?.spotsLeft ?? 25;
  const pctFull = stats ? ((25 - spotsLeft) / 25) * 100 : 0;

  return (
    <div style={{ minHeight: "100vh", background: T.cream }} className="fd-grid-bg">
      <style>{GRID_CSS}</style>
      <header style={{ padding: "0 40px", height: 64, borderBottom: `1px solid ${T.stone}40`, display: "flex", alignItems: "center", gap: 16, background: `${T.cream}E8`, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.inkLight, display: "flex", alignItems: "center", gap: 8, fontFamily: T.fontSans, fontSize: 13 }}><Icon.ArrowLeft size={16} /> Back</button>
        <div style={{ width: 1, height: 20, background: T.stone }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.forest }}><Icon.Door /><span style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 600, color: T.charcoal }}>FrontDoor</span></div>
        <Tag bg={T.goldLight} color={T.gold}>Contractor Waitlist</Tag>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 40px" }}>
        <div className="anim-up" style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.gold, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 12 }}>Founding Contractor Seats</div>
          <h1 style={{ fontFamily: T.fontSerif, fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: T.charcoal, letterSpacing: "-0.02em", marginBottom: 12 }}>Reserve Your Seat</h1>
          <p style={{ fontFamily: T.fontSans, fontSize: 15, color: T.inkMid, lineHeight: 1.7 }}>$99 secures your founding seat in Austin. First access to verified, opted-in homeowner leads. Refundable if we don't launch in 6 months.</p>
        </div>

        {/* Scarcity bar */}
        <div className="anim-up-2" style={{ background: T.white, border: `1px solid ${T.stone}`, borderRadius: T.radiusMd, padding: 24, marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Seats Remaining</span>
            <span style={{ fontFamily: T.fontSerif, fontSize: 20, fontWeight: 700, color: spotsLeft <= 10 ? T.danger : T.charcoal }}>{spotsLeft} of 25</span>
          </div>
          <div style={{ height: 6, background: T.stone, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pctFull}%`, background: spotsLeft <= 5 ? T.danger : T.gold, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
          {spotsLeft <= 10 && <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.danger, marginTop: 10 }}>⚠ Less than 10 seats remaining</div>}
        </div>

        <div className="anim-up-3" style={{ background: T.white, border: `1px solid ${T.stone}`, borderRadius: T.radiusMd, padding: 36 }}>
          <h2 style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 600, color: T.charcoal, marginBottom: 28 }}>Your Information</h2>
          <FDInput label="Company Name" placeholder="Summit Roofing Co." value={form.company} onChange={e => set("company", e.target.value)} />
          <FDInput label="Your Name" placeholder="Mike Torres" value={form.contactName} onChange={e => set("contactName", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FDInput label="Email" type="email" placeholder="mike@summit.com" value={form.email} onChange={e => set("email", e.target.value)} />
            <FDInput label="Phone (optional)" type="tel" placeholder="512-555-0100" value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FDSelect label="Service Category" value={form.category} onChange={e => set("category", e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </FDSelect>
            <FDInput label="Primary ZIP" placeholder="78732" value={form.zip} onChange={e => set("zip", e.target.value)} />
          </div>

          {/* Value prop */}
          <div style={{ padding: "16px 20px", background: T.goldLight, borderRadius: T.radius, marginBottom: 28, border: `1px solid ${T.gold}20` }}>
            <Label>What $99 Gets You</Label>
            {["Named founding contractor seat (capped at 25)", "Priority access on Austin launch day", "Lock in $99/mo — public rate is $199", "Verified, opted-in homeowner leads only"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><Icon.Check size={12} /><span style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid }}>{f}</span></div>
            ))}
          </div>

          <Btn variant="gold" onClick={() => mutation.mutate()} disabled={!form.company || !form.contactName || !form.email || !form.category || !form.zip || mutation.isPending} style={{ width: "100%", justifyContent: "center", padding: "14px" }}>
            {mutation.isPending ? "Redirecting to Stripe..." : <>Reserve Seat — $99 <Icon.ArrowRight /></>}
          </Btn>
          {mutation.isError && <div style={{ marginTop: 16, padding: "12px 16px", background: T.dangerPale, borderRadius: T.radius, fontFamily: T.fontSans, fontSize: 13, color: T.danger }}>Something went wrong. Please try again.</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Demo View ────────────────────────────────────────────────────────
function DemoView({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"feed" | "knocks" | "permissions">("feed");
  const [permissions, setPermissions] = useState<Record<string, { on: boolean; sub: string }>>({
    "Verified contractor requests": { on: true, sub: "Only verified, licensed contractors" },
    "HOA-approved vendors": { on: true, sub: "Board-curated contractor list" },
    "Neighborhood repair alerts": { on: true, sub: "Permit activity near your home" },
    "Solar sales": { on: false, sub: "Unsolicited solar assessments" },
    "General solicitation": { on: false, sub: "Non-verified contractor outreach" },
    "Landscaping services": { on: true, sub: "Lawn care and outdoor services" },
  });
  const [knocks, setKnocks] = useState([
    { id: 1, company: "Summit Roofing Co.", service: "Roofing", reason: "Repairing hail damage 2 houses away. Several homes in the area may have similar damage from the March 2nd storm.", time: "2 hours ago", verified: true, jobsNearby: 3, responded: null as string | null },
    { id: 2, company: "Bedrock Foundation", service: "Foundation", reason: "Completing foundation leveling on your street. Homes built 2004–2008 in this subdivision share similar soil conditions.", time: "Yesterday", verified: true, jobsNearby: 1, responded: null as string | null },
    { id: 3, company: "SunPower Solar", service: "Solar", reason: "Offering free solar assessments in your neighborhood this week.", time: "3 days ago", verified: false, jobsNearby: 0, responded: null as string | null },
  ]);
  const respond = (id: number, action: string) => setKnocks(ks => ks.map(k => k.id === id ? { ...k, responded: action } : k));

  const tabs = [
    { id: "feed" as const, label: "Permit Feed", icon: <Icon.Activity /> },
    { id: "knocks" as const, label: "Digital Knocks", icon: <Icon.Bell /> },
    { id: "permissions" as const, label: "Front Door", icon: <Icon.Shield /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.cream }}>
      <style>{GRID_CSS}</style>
      <header style={{ background: T.forest, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center" }}><Icon.ArrowLeft size={18} /></button>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 600, color: T.white, letterSpacing: "-0.01em" }}>FrontDoor</div>
            <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>1847 OAKWOOD DR · AUSTIN TX 78752</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Tag bg="rgba(255,255,255,0.12)" color={T.white}><Icon.Shield size={10} /> Protected</Tag>
          <Tag bg={T.goldLight} color={T.gold}>Demo</Tag>
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: `1px solid ${T.stone}` }}>
        {[{ label: "Active Permits", value: "6", icon: <Icon.Activity size={16} /> }, { label: "Pending Knocks", value: "2", icon: <Icon.Bell size={16} /> }, { label: "Allowed Types", value: "4", icon: <Icon.Shield size={16} /> }].map((s, i) => (
          <div key={s.label} style={{ padding: "20px 24px", background: T.white, borderRight: i < 2 ? `1px solid ${T.stone}` : "none" }}>
            <div style={{ color: T.inkLight, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 700, color: T.charcoal }}>{s.value}</div>
            <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.inkLight, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: T.white, borderBottom: `1px solid ${T.stone}`, padding: "0 24px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="tab-btn" style={{ display: "flex", alignItems: "center", gap: 7, padding: "14px 16px", fontFamily: T.fontSans, fontSize: 13, fontWeight: 500, color: tab === t.id ? T.forest : T.inkLight, background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${T.forest}` : "2px solid transparent", cursor: "pointer" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 700, color: T.charcoal, marginBottom: 20, letterSpacing: "-0.01em" }}>
          {tab === "feed" ? "Neighborhood Activity" : tab === "knocks" ? "Digital Knock Requests" : "Your Front Door"}
        </h2>

        {tab === "feed" && <PermitFeed />}

        {tab === "knocks" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {knocks.map(k => (
              <div key={k.id} style={{ background: T.white, border: `1px solid ${k.responded ? T.stone : T.gold}40`, borderLeft: k.responded ? "none" : `3px solid ${T.gold}`, borderRadius: T.radiusMd, padding: 20, opacity: k.responded === "ignore" ? 0.5 : 1, transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: T.fontSans, fontSize: 15, fontWeight: 700, color: T.ink }}>{k.company}</span>
                      {k.verified ? <Tag><Icon.Check size={10} /> Verified</Tag> : <Tag color={T.inkLight} bg={T.creamDark}>Unverified</Tag>}
                    </div>
                    <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>{k.service} · {k.time}</div>
                  </div>
                  {k.jobsNearby > 0 && <Tag bg={T.goldLight} color={T.gold}>{k.jobsNearby} jobs nearby</Tag>}
                </div>
                <div style={{ padding: "12px 16px", background: T.creamDark, borderRadius: T.radius, fontFamily: T.fontSans, fontSize: 13, color: T.inkMid, lineHeight: 1.6, marginBottom: 14 }}>"{k.reason}"</div>
                {k.responded ? (
                  <div style={{ fontFamily: T.fontMono, fontSize: 11, color: k.responded === "accept" ? T.success : T.inkLight, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                    {k.responded === "accept" ? "✓ Contact accepted" : k.responded === "info" ? "ℹ Info requested" : "Ignored"}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn style={{ padding: "8px 16px", fontSize: 13, background: T.successPale, color: T.success, border: "none" }} onClick={() => respond(k.id, "accept")}><Icon.Check size={14} /> Accept</Btn>
                    <Btn variant="ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => respond(k.id, "info")}>Request Info</Btn>
                    <Btn variant="ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => respond(k.id, "ignore")}>Ignore</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "permissions" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <Tag bg={T.successPale} color={T.success}><Icon.Unlock size={10} /> {Object.values(permissions).filter(p => p.on).length} allowed</Tag>
              <Tag bg={T.dangerPale} color={T.danger}><Icon.Lock size={10} /> {Object.values(permissions).filter(p => !p.on).length} blocked</Tag>
            </div>
            <div style={{ background: T.white, border: `1px solid ${T.stone}`, borderRadius: T.radiusMd, padding: "4px 20px" }}>
              {Object.entries(permissions).map(([key, val]) => (
                <Toggle key={key} label={key} sub={val.sub} on={val.on} onToggle={() => setPermissions(p => ({ ...p, [key]: { ...p[key], on: !p[key].on } }))} />
              ))}
            </div>
            <p style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginTop: 16, lineHeight: 1.7 }}>Only verified contractors matching your allowed categories can send digital knock requests. Changes take effect immediately.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────
function SuccessScreen({ type, position }: { type: "hoa" | "contractor"; position?: number }) {
  return (
    <div style={{ minHeight: "100vh", background: T.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }} className="fd-grid-bg">
      <style>{GRID_CSS}</style>
      <div className="anim-up" style={{ maxWidth: 520, textAlign: "center" as const }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.forestPale, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", border: `2px solid ${T.forest}20` }}>
          <Icon.Check size={28} />
        </div>
        {type === "hoa" ? (
          <>
            <h1 style={{ fontFamily: T.fontSerif, fontSize: 36, fontWeight: 700, color: T.charcoal, marginBottom: 16, letterSpacing: "-0.02em" }}>Your HOA is enrolled.</h1>
            <p style={{ fontFamily: T.fontSans, fontSize: 16, color: T.inkMid, lineHeight: 1.7, marginBottom: 32 }}>We'll reach out within 24 hours to configure your community dashboard and get residents set up. Welcome to FrontDoor.</p>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: T.fontSerif, fontSize: 36, fontWeight: 700, color: T.charcoal, marginBottom: 16, letterSpacing: "-0.02em" }}>You're Contractor #{position ?? "—"}.</h1>
            <p style={{ fontFamily: T.fontSans, fontSize: 16, color: T.inkMid, lineHeight: 1.7, marginBottom: 32 }}>Your founding seat is reserved. You'll hear from us before the Austin launch. No more cold doors — only homeowners who want to hear from you.</p>
          </>
        )}
        <Btn onClick={() => { window.history.replaceState({}, "", "/"); window.location.reload(); }}>Back to FrontDoor</Btn>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>("landing");
  useEffect(() => { window.scrollTo(0, 0); }, [view]);
  return (
    <>
      {view === "landing" && <Landing onNav={setView} />}
      {view === "hoa" && <HOAOnboarding onBack={() => setView("landing")} />}
      {view === "contractor" && <ContractorWaitlist onBack={() => setView("landing")} />}
      {view === "demo" && <DemoView onBack={() => setView("landing")} />}
    </>
  );
}
