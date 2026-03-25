import React from "react";
import { useQuery } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { Card, Tag, StatusTag, Icons } from "./ui-kit";
import type { OSView } from "./Sidebar";

function MetricTile({ label, value, color, icon, onClick, badge }: {
  label: string; value: string | number;
  color?: string; icon: React.ReactNode;
  onClick?: () => void; badge?: number;
}) {
  return (
    <div
      className={onClick ? "card-hover" : ""}
      onClick={onClick}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "24px 24px",
        cursor: onClick ? "pointer" : "default",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ color: color || "var(--text-light)", opacity: 0.7 }}>{icon}</span>
        {badge !== undefined && badge > 0 && (
          <div style={{
            background: color || T.forest,
            color: "#fff",
            borderRadius: "999px",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            fontFamily: T.fontSans,
            lineHeight: 1.6,
            letterSpacing: "0.01em",
          }}>
            {badge}
          </div>
        )}
      </div>
      <div style={{
        fontFamily: T.fontSans,
        fontSize: 32,
        fontWeight: 700,
        color: color || "var(--text)",
        letterSpacing: "-0.03em",
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: T.fontSans,
        fontSize: 10,
        fontWeight: 500,
        color: "var(--text-light)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        {label}
      </div>
    </div>
  );
}

function ModuleCard({ label, icon: _icon, color, desc, badge, onClick }: {
  label: string; icon?: React.ReactNode;
  color: string; desc: string; badge?: number; onClick: () => void;
}) {
  return (
    <div
      className="card-hover"
      onClick={onClick}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "22px 22px",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }} />
        {badge !== undefined && badge > 0 && (
          <div style={{
            background: `${color}15`,
            color,
            borderRadius: "999px",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            fontFamily: T.fontSans,
          }}>
            {badge}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3, letterSpacing: "-0.01em" }}>{label}</div>
        <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-light)", lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

export function Dashboard({ hoaId, onNav }: { hoaId: string; onNav: (v: OSView) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["os-dashboard", hoaId],
    queryFn: () => rpc.getOSDashboard(hoaId),
    refetchInterval: 30000,
  });

  if (isLoading) return (
    <div style={{ padding: "48px 40px" }} className="main-pad">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="ai-skeleton" style={{ height: 110, borderRadius: "16px" }} />
        ))}
      </div>
    </div>
  );
  if (!data) return null;

  const { hoa, stats, nextMeeting, financial } = data;

  const modules: { id: OSView; label: string; icon: React.ReactNode; badge?: number; color: string; desc: string }[] = [
    { id: "homeowners", label: "Homeowners",  icon: <Icons.Users />,    badge: stats.homeowners,      color: T.forest,  desc: `${stats.homeowners} residents` },
    { id: "payos",      label: "PayOS",       icon: <Icons.Dollar />,   badge: 0,                     color: T.gold,    desc: financial ? `$${(financial.totalOutstanding/100).toLocaleString()} outstanding` : "Dues & finances" },
    { id: "violations", label: "FineBot",     icon: <Icons.Alert />,    badge: stats.openViolations,  color: T.danger,  desc: `${stats.openViolations} open violations` },
    { id: "arc",        label: "ARC Agent",   icon: <Icons.Pencil />,   badge: stats.pendingARC,      color: T.blue,    desc: `${stats.pendingARC} pending review` },
    { id: "workorders", label: "WorkOrder",   icon: <Icons.Wrench />,   badge: stats.openWorkOrders,  color: T.purple,  desc: `${stats.openWorkOrders} open orders` },
    { id: "boardroom",  label: "BoardRoom",   icon: <Icons.Calendar />, badge: 0,                     color: T.forest,  desc: nextMeeting ? new Date((nextMeeting as {scheduledAt: Date | string}).scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No upcoming" },
    { id: "votebox",    label: "VoteBox",     icon: <Icons.Vote />,     badge: stats.openVotes,       color: T.gold,    desc: `${stats.openVotes} active votes` },
    { id: "commhub",    label: "CommHub",     icon: <Icons.Bell />,     badge: 0,                     color: T.forest,  desc: "Announcements" },
    { id: "amenity",    label: "Amenity",     icon: <Icons.Star />,     badge: 0,                     color: T.purple,  desc: "Reservations" },
  ];

  return (
    <div style={{ padding: "40px 44px", maxWidth: 1100 }} className="main-pad">

      {/* Header */}
      <div className="anim-up" style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Tag style={{ fontSize: 9 }}>{hoa?.plan || "starter"} plan</Tag>
          {hoa?.paid && <Tag color={T.success} bg={T.successPale} style={{ fontSize: 9 }}>Active</Tag>}
        </div>
        <h1 style={{
          fontFamily: T.fontSans,
          fontSize: 30,
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          {hoa?.community || "Your HOA"}
        </h1>
        <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span>{hoa?.city}, {hoa?.state}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border)", display: "inline-block" }} />
          <span>{hoa?.units} units</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border)", display: "inline-block" }} />
          <span>{hoa?.zip}</span>
        </div>
      </div>

      {/* Key metrics */}
      <div className="anim-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 32 }}>
        <MetricTile label="Homeowners"    value={stats.homeowners}      icon={<Icons.Users />}    color={T.forest}  onClick={() => onNav("homeowners")} />
        <MetricTile label="Open Violations" value={stats.openViolations} icon={<Icons.Alert />}   color={stats.openViolations > 0 ? T.danger : T.success} badge={stats.openViolations} onClick={() => onNav("violations")} />
        <MetricTile label="Work Orders"   value={stats.openWorkOrders}  icon={<Icons.Wrench />}   color={stats.openWorkOrders > 0 ? T.purple : T.success} badge={stats.openWorkOrders} onClick={() => onNav("workorders")} />
        <MetricTile label="ARC Pending"   value={stats.pendingARC}      icon={<Icons.Pencil />}   color={stats.pendingARC > 0 ? T.blue : T.success} badge={stats.pendingARC} onClick={() => onNav("arc")} />
        <MetricTile label="Active Votes"  value={stats.openVotes}       icon={<Icons.Vote />}     color={stats.openVotes > 0 ? T.gold : T.success} badge={stats.openVotes} onClick={() => onNav("votebox")} />
      </div>

      {/* Financial + Next meeting row */}
      <div className="anim-up-3" style={{ display: "grid", gridTemplateColumns: financial ? "1fr auto" : "1fr", gap: 12, marginBottom: 32, alignItems: "start" }}>
        {financial && (
          <Card style={{ padding: "24px 28px", borderRadius: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontFamily: T.fontSans, fontSize: 11, fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Financial Snapshot</span>
              <button
                onClick={() => onNav("payos")}
                style={{ fontFamily: T.fontSans, fontSize: 12, fontWeight: 500, color: T.forest, background: "none", border: "none", cursor: "pointer", opacity: 0.9 }}
              >
                PayOS →
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 20 }}>
              {[
                { label: "Outstanding", value: `$${(financial.totalOutstanding / 100).toLocaleString()}`, color: financial.totalOutstanding > 0 ? T.danger : T.success },
                { label: "Delinquent",  value: String(financial.delinquentCount), color: financial.delinquentCount > 0 ? T.danger : T.success },
                { label: "YTD Budget",  value: `$${(financial.budgetedYTD / 100).toLocaleString()}` },
                { label: "YTD Actual",  value: `$${(financial.actualYTD / 100).toLocaleString()}` },
                { label: "Variance",    value: `${financial.variance >= 0 ? "+" : "−"}$${(Math.abs(financial.variance) / 100).toLocaleString()}`, color: financial.variance >= 0 ? T.success : T.danger },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: T.fontSans, fontSize: 10, fontWeight: 500, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 20, fontWeight: 700, color: s.color || "var(--text)", letterSpacing: "-0.02em" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {nextMeeting && (
          <Card
            className="card-hover"
            style={{ padding: "22px 24px", cursor: "pointer", minWidth: 240, borderRadius: "16px" }}
            onClick={() => onNav("boardroom")}
          >
            <span style={{ fontFamily: T.fontSans, fontSize: 11, fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 14 }}>Next Meeting</span>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 2 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "12px",
                background: `${T.forest}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.forest, flexShrink: 0,
              }}>
                <Icons.Calendar />
              </div>
              <div>
                <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4, letterSpacing: "-0.01em" }}>
                  {(nextMeeting as {title: string}).title}
                </div>
                <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-light)", lineHeight: 1.5 }}>
                  {new Date((nextMeeting as {scheduledAt: Date | string}).scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  {(nextMeeting as {location?: string}).location && (
                    <><br />{(nextMeeting as {location: string}).location}</>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <StatusTag status={(nextMeeting as {status: string}).status} />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Module grid */}
      <div className="anim-up-4">
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
        }}>
          <span style={{ fontFamily: T.fontSans, fontSize: 11, fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.08em" }}>All Modules</span>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: T.fontSans, fontSize: 10, color: "var(--text-light)",
            letterSpacing: "0.04em",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.forest }} className="ai-ring" />
            9 AI agents active
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          {modules.map((m, i) => (
            <div key={m.id} className={`anim-up-${Math.min(i + 2, 5)}`}>
              <ModuleCard {...m} onClick={() => onNav(m.id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
