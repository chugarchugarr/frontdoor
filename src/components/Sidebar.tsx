import React from "react";
import { T, GLOBAL_CSS } from "./tokens";
import { Icons } from "./ui-kit";

export type OSView =
  | "landing" | "hoa" | "contractor"
  | "dashboard" | "homeowners" | "payos" | "violations"
  | "arc" | "boardroom" | "votebox" | "workorders"
  | "amenity" | "commhub" | "permits" | "livefeeds"
  | "transition" | "compliance" | "marketplace" | "investor";

const NAV_ITEMS: { id: OSView; label: string; icon: React.ReactNode; section?: string }[] = [
  { id: "dashboard",   label: "Overview",    icon: <Icons.Home />,     section: "HOA OS" },
  { id: "homeowners",  label: "Homeowners",  icon: <Icons.Users /> },
  { id: "payos",       label: "PayOS",       icon: <Icons.Dollar /> },
  { id: "violations",  label: "FineBot",     icon: <Icons.Alert /> },
  { id: "arc",         label: "ARC Agent",   icon: <Icons.Pencil /> },
  { id: "workorders",  label: "WorkOrder",   icon: <Icons.Wrench /> },
  { id: "boardroom",   label: "BoardRoom",   icon: <Icons.Calendar /> },
  { id: "votebox",     label: "VoteBox",     icon: <Icons.Vote /> },
  { id: "amenity",     label: "Amenity",     icon: <Icons.Star /> },
  { id: "commhub",     label: "CommHub",     icon: <Icons.Bell /> },
  { id: "permits",     label: "Permit Feed", icon: <Icons.Activity />, section: "Contractor Network" },
  { id: "livefeeds",   label: "Live Feeds",  icon: <Icons.Signal /> },
  { id: "marketplace", label: "Contractor Access", icon: <Icons.Wrench /> },
  { id: "transition",  label: "Association Records", icon: <Icons.Map />, section: "Association Records" },
  { id: "compliance",  label: "Compliance",  icon: <Icons.Shield /> },
];

export function Sidebar({ current, onNav, hoaName }: { current: OSView; onNav: (v: OSView) => void; hoaName?: string }) {
  return (
    <aside className="sidebar" style={{
      width: 220,
      flexShrink: 0,
      background: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      overflow: "hidden",
      borderRight: "1px solid #E5E5E5",
    }}>
      <style>{GLOBAL_CSS}</style>

      <div style={{ padding: "20px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: T.forest,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.03em" }}>
            GatePass
          </span>
        </div>

        {hoaName && (
          <div style={{
            marginTop: 12,
            padding: "7px 10px",
            background: "#F7F7F7",
            borderRadius: 10,
            border: "1px solid #E5E5E5",
          }}>
            <div style={{ fontFamily: T.fontMono, fontSize: 9, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Community</div>
            <div style={{ fontFamily: T.fontSans, fontSize: 12, fontWeight: 500, color: "#0A0A0A", lineHeight: 1.3 }}>{hoaName}</div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: "4px 8px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const isCurrent = current === item.id;
          return (
            <React.Fragment key={item.id}>
              {item.section && (
                <div style={{
                  fontFamily: T.fontMono,
                  fontSize: 9,
                  color: "#A3A3A3",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  padding: "14px 8px 4px",
                }}>
                  {item.section}
                </div>
              )}
              <button
                onClick={() => onNav(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: isCurrent ? "#F0F5F2" : "transparent",
                  color: isCurrent ? T.forest : "#525252",
                  fontSize: 13,
                  fontWeight: isCurrent ? 600 : 400,
                  textAlign: "left",
                  width: "100%",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  transition: "background 0.12s, color 0.12s",
                }}
              >
                <span style={{ color: isCurrent ? T.forest : "#A3A3A3", flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #E5E5E5" }}>
        <button
          onClick={() => onNav("landing")}
          style={{
            fontFamily: T.fontSans,
            fontSize: 12,
            color: "#A3A3A3",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: "color 0.12s",
            letterSpacing: "-0.01em",
          }}
        >
          ← Public site
        </button>
      </div>
    </aside>
  );
}
