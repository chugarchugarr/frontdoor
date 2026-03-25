import React from "react";
import { useQuery } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { StatCard, Card, Tag, StatusTag, Icons, Label } from "./ui-kit";
import type { OSView } from "./Sidebar";

export function Dashboard({ hoaId, onNav }: { hoaId: string; onNav: (v: OSView) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["os-dashboard", hoaId],
    queryFn: () => rpc.getOSDashboard(hoaId),
    refetchInterval: 30000,
  });

  if (isLoading) return <div style={{ padding: 40, color: T.inkLight, fontFamily: T.fontSans }}>Loading...</div>;
  if (!data) return null;

  const { hoa, stats, nextMeeting, financial } = data;

  const modules: { id: OSView; label: string; icon: React.ReactNode; badge?: number; color: string; desc: string }[] = [
    { id: "homeowners", label: "Homeowners",  icon: <Icons.Users />,    badge: stats.homeowners,    color: T.forest,  desc: `${stats.homeowners} residents` },
    { id: "payos",      label: "PayOS",       icon: <Icons.Dollar />,   badge: 0,                   color: T.gold,    desc: financial ? `$${(financial.totalOutstanding/100).toLocaleString()} outstanding` : "Dues & finances" },
    { id: "violations", label: "FineBot",     icon: <Icons.Alert />,    badge: stats.openViolations, color: T.danger, desc: `${stats.openViolations} open` },
    { id: "arc",        label: "ARC Agent",   icon: <Icons.Pencil />,   badge: stats.pendingARC,    color: T.blue,    desc: `${stats.pendingARC} pending` },
    { id: "workorders", label: "WorkOrder",   icon: <Icons.Wrench />,   badge: stats.openWorkOrders, color: T.purple, desc: `${stats.openWorkOrders} open` },
    { id: "boardroom",  label: "BoardRoom",   icon: <Icons.Calendar />, badge: 0,                   color: T.forest,        desc: nextMeeting ? new Date((nextMeeting as {scheduledAt: Date | string}).scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No upcoming" },
    { id: "votebox",    label: "VoteBox",     icon: <Icons.Vote />,     badge: stats.openVotes,     color: T.gold,    desc: `${stats.openVotes} active` },
    { id: "commhub",    label: "CommHub",     icon: <Icons.Bell />,     badge: 0,                   color: T.forest,  desc: "Announcements" },
    { id: "amenity",    label: "Amenity",     icon: <Icons.Star />,     badge: 0,                   color: T.purple,  desc: "Reservations" },
  ];

  return (
    <div style={{ padding: "32px 40px" }} className="main-pad">
      {/* Header */}
      <div className="anim-up" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em" }}>HOA OS</div>
          <Tag>{hoa?.plan || "starter"}</Tag>
        </div>
        <h1 style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 700, color: T.charcoal, letterSpacing: "-0.02em" }}>
          {hoa?.community || "Your HOA"}
        </h1>
        <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkLight, marginTop: 4 }}>
          {hoa?.city}, {hoa?.state} · {hoa?.units} units · {hoa?.zip}
        </div>
      </div>

      {/* Stats row */}
      <div className="anim-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
        <StatCard label="Homeowners" value={stats.homeowners} />
        <StatCard label="Open Violations" value={stats.openViolations} color={stats.openViolations > 0 ? T.danger : T.charcoal} />
        <StatCard label="Work Orders" value={stats.openWorkOrders} color={stats.openWorkOrders > 0 ? T.warn : T.charcoal} />
        <StatCard label="ARC Pending" value={stats.pendingARC} color={stats.pendingARC > 0 ? T.blue : T.charcoal} />
        <StatCard label="Active Votes" value={stats.openVotes} color={stats.openVotes > 0 ? T.gold : T.charcoal} />
      </div>

      {/* Financial summary */}
      {financial && (
        <div className="anim-up-3" style={{ marginBottom: 32 }}>
          <Card style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Label>Financial Snapshot</Label>
              <button onClick={() => onNav("payos")} style={{ fontFamily: T.fontSans, fontSize: 12, color: T.forest, background: "none", border: "none", cursor: "pointer" }}>View PayOS →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20 }}>
              {[
                { label: "Outstanding Dues", value: `$${(financial.totalOutstanding / 100).toLocaleString()}`, color: financial.totalOutstanding > 0 ? T.danger : T.success },
                { label: "Delinquent", value: String(financial.delinquentCount), color: financial.delinquentCount > 0 ? T.danger : T.success },
                { label: "YTD Budget", value: `$${(financial.budgetedYTD / 100).toLocaleString()}`, color: T.charcoal },
                { label: "YTD Actual", value: `$${(financial.actualYTD / 100).toLocaleString()}`, color: T.charcoal },
                { label: "Variance", value: `$${(Math.abs(financial.variance) / 100).toLocaleString()}`, color: financial.variance >= 0 ? T.success : T.danger },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: T.fontSerif, fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Next meeting */}
      {nextMeeting && (
        <div className="anim-up-3" style={{ marginBottom: 32 }}>
          <Card style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} className="card-hover" onClick={() => onNav("boardroom")}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ color: T.forest }}><Icons.Calendar /></div>
              <div>
                <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, color: T.ink }}>{(nextMeeting as {title: string}).title}</div>
                <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight, marginTop: 2 }}>
                  {new Date((nextMeeting as {scheduledAt: Date | string}).scheduledAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  {(nextMeeting as {location?: string}).location && ` · ${(nextMeeting as {location: string}).location}`}
                </div>
              </div>
            </div>
            <StatusTag status={(nextMeeting as {status: string}).status} />
          </Card>
        </div>
      )}

      {/* Module grid */}
      <div className="anim-up-4">
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>All Modules</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {modules.map(m => (
            <Card key={m.id} className="card-hover" style={{ padding: "20px", cursor: "pointer", transition: "all 0.15s" }} onClick={() => onNav(m.id)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ color: m.color }}>{m.icon}</div>
                {m.badge !== undefined && m.badge > 0 && (
                  <div style={{ background: m.color, color: T.white, borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "1px 7px", fontFamily: T.fontMono }}>{m.badge}</div>
                )}
              </div>
              <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight }}>{m.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
