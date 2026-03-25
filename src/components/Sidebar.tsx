import React from "react";
import { useAuth } from "@adaptive-ai/sdk/client";
import { T, GLOBAL_CSS } from "./tokens";
import { Icons } from "./ui-kit";

export type OSView =
  | "landing" | "hoa" | "contractor"
  | "dashboard" | "homeowners" | "payos" | "violations"
  | "arc" | "boardroom" | "votebox" | "workorders"
  | "amenity" | "commhub" | "permits";

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
  { id: "permits",     label: "Permit Feed", icon: <Icons.Activity />, section: "Intel" },
];

export function Sidebar({ current, onNav, hoaName }: { current: OSView; onNav: (v: OSView) => void; hoaName?: string }) {
  const auth = useAuth({ required: false });

  return (
    <aside className="sidebar" style={{
      width: 228,
      flexShrink: 0,
      background: "#141412",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      overflow: "hidden",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* Logo */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {/* Custom door icon with accent color */}
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #2A5240, #3A6E54)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(42,82,64,0.4)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 700, color: "#F0EDE8", letterSpacing: "-0.01em", lineHeight: 1 }}>
              GatePass
            </div>
            <div style={{ fontFamily: T.fontMono, fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
              HOA OS
            </div>
          </div>
        </div>

        {hoaName && (
          <div style={{
            marginTop: 14,
            padding: "8px 11px",
            background: "rgba(42,82,64,0.18)",
            borderRadius: 7,
            border: "1px solid rgba(42,82,64,0.22)",
          }}>
            <div style={{ fontFamily: T.fontMono, fontSize: 9, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Community</div>
            <div style={{ fontFamily: T.fontSans, fontSize: 12, fontWeight: 600, color: "#7EC99A", lineHeight: 1.3 }}>{hoaName}</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const isCurrent = current === item.id;
          return (
            <React.Fragment key={item.id}>
              {item.section && (
                <div style={{
                  fontFamily: T.fontMono,
                  fontSize: 9,
                  color: "rgba(255,255,255,0.22)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  padding: "12px 10px 5px",
                  marginTop: 4,
                }}>
                  {item.section}
                </div>
              )}
              <button
                className={`nav-item${isCurrent ? " active" : ""}`}
                onClick={() => onNav(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 11px",
                  borderRadius: 7,
                  border: "none",
                  background: isCurrent ? "rgba(42,82,64,0.22)" : "transparent",
                  color: isCurrent ? "#7EC99A" : "rgba(255,255,255,0.48)",
                  fontSize: 13,
                  fontWeight: isCurrent ? 600 : 400,
                  textAlign: "left",
                  width: "100%",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {isCurrent && (
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 2.5,
                    height: 18,
                    background: "#5A9E7A",
                    borderRadius: "0 2px 2px 0",
                  }} />
                )}
                <span style={{ opacity: isCurrent ? 1 : 0.65, flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {auth.status === "authenticated" && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 10,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#5A9E7A", flexShrink: 0 }} />
            <span style={{ fontFamily: T.fontMono, fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>
              Authenticated
            </span>
          </div>
        )}
        <button
          onClick={() => onNav("landing")}
          style={{
            fontFamily: T.fontSans,
            fontSize: 12,
            color: "rgba(255,255,255,0.25)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "color 0.12s",
          }}
        >
          ← Public site
        </button>
      </div>
    </aside>
  );
}
