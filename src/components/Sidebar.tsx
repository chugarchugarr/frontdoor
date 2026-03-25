import React from "react";
import { T, GLOBAL_CSS } from "./tokens";
import { Icons } from "./ui-kit";

export type OSView =
  | "landing" | "hoa" | "contractor"
  | "dashboard" | "homeowners" | "payos" | "violations"
  | "arc" | "boardroom" | "votebox" | "workorders"
  | "amenity" | "commhub" | "permits";

const NAV_ITEMS: { id: OSView; label: string; icon: React.ReactNode; section?: string }[] = [
  { id: "dashboard",   label: "Overview",       icon: <Icons.Home />,     section: "HOA OS" },
  { id: "homeowners",  label: "Homeowners",      icon: <Icons.Users /> },
  { id: "payos",       label: "PayOS",           icon: <Icons.Dollar /> },
  { id: "violations",  label: "FineBot",         icon: <Icons.Alert /> },
  { id: "arc",         label: "ARC Agent",       icon: <Icons.Pencil /> },
  { id: "workorders",  label: "WorkOrder",       icon: <Icons.Wrench /> },
  { id: "boardroom",   label: "BoardRoom",       icon: <Icons.Calendar /> },
  { id: "votebox",     label: "VoteBox",         icon: <Icons.Vote /> },
  { id: "amenity",     label: "Amenity",         icon: <Icons.Star /> },
  { id: "commhub",     label: "CommHub",         icon: <Icons.Bell /> },
  { id: "permits",     label: "Permit Feed",     icon: <Icons.Activity />, section: "Intel" },
];

export function Sidebar({ current, onNav, hoaName }: { current: OSView; onNav: (v: OSView) => void; hoaName?: string }) {
  return (
    <aside className="sidebar" style={{ width: 220, flexShrink: 0, background: T.charcoal, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, overflow: "auto" }}>
      <style>{GLOBAL_CSS}</style>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#5A9E7A" }}>
          <Icons.Door />
          <span style={{ fontFamily: T.fontSerif, fontSize: 17, fontWeight: 600, color: T.white, letterSpacing: "-0.01em" }}>GatePass</span>
        </div>
        {hoaName && (
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {hoaName}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isCurrent = current === item.id;
          return (
            <React.Fragment key={item.id}>
              {item.section && (
                <div style={{ fontFamily: T.fontMono, fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 10px 4px", marginTop: 4 }}>
                  {item.section}
                </div>
              )}
              <button
                className={`nav-item${isCurrent ? " active" : ""}`}
                onClick={() => onNav(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", borderRadius: T.radius, border: "none",
                  background: isCurrent ? T.forestPale : "transparent",
                  color: isCurrent ? T.forest : "rgba(255,255,255,0.55)",
                  fontSize: 13, fontWeight: isCurrent ? 600 : 400,
                  textAlign: "left", width: "100%", cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                <span style={{ opacity: isCurrent ? 1 : 0.7 }}>{item.icon}</span>
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "14px 20px", borderTop: `1px solid rgba(255,255,255,0.07)` }}>
        <button
          onClick={() => onNav("landing")}
          style={{ fontFamily: T.fontSans, fontSize: 12, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}
        >
          ← Public site
        </button>
      </div>
    </aside>
  );
}
