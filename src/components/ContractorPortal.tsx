import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T, GLOBAL_CSS } from "./tokens";
import { Btn, Card, Tag, StatusTag, EmptyState } from "./ui-kit";

const DEMO_HOA_ID = "cmn5kapjd0000jitlk3ehms51";

type Tab = "jobs" | "permits" | "profile";

function DemoNav({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderBottom: "1px solid #E5E5E5",
      padding: "0 20px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: T.forest, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em" }}>GatePass</span>
        <span style={{ width: 1, height: 16, background: "#E5E5E5", margin: "0 4px" }} />
        <span style={{ fontFamily: T.fontSans, fontSize: 12, color: "#525252" }}>Summit Roofing Co · Contractor Portal</span>
      </div>
      <button
        onClick={onBack}
        style={{ fontFamily: T.fontSans, fontSize: 12, color: "#525252", background: "none", border: "1px solid #E5E5E5", borderRadius: 999, padding: "5px 14px", cursor: "pointer" }}
      >
        ← Exit Demo
      </button>
    </div>
  );
}

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "jobs",    label: "Available Jobs" },
    { id: "permits", label: "Permit Feed" },
    { id: "profile", label: "My Profile" },
  ];
  return (
    <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E5E5", padding: "0 24px", display: "flex", gap: 2 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            fontFamily: T.fontSans, fontSize: 13, fontWeight: active === t.id ? 600 : 400,
            color: active === t.id ? T.forest : "#525252",
            background: "none", border: "none", cursor: "pointer",
            padding: "14px 14px 12px",
            borderBottom: active === t.id ? `2px solid ${T.forest}` : "2px solid transparent",
            transition: "color 0.12s",
            letterSpacing: "-0.01em",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Tab: Available Jobs ──────────────────────────────────────────────
function JobsTab() {
  const [expressed, setExpressed] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState<string | null>(null);

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ["workOrders", DEMO_HOA_ID],
    queryFn: () => rpc.getWorkOrders(DEMO_HOA_ID),
  });

  type WO = {
    id: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    description: string | null;
    homeowner: { name: string; address: string } | null;
    createdAt: string | Date;
  };

  const open = (workOrders as unknown as WO[]).filter(w => w.status === "open" || w.status === "pending");

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.025em", marginBottom: 6 }}>
          Available Jobs
        </div>
        <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#737373" }}>
          Open work orders from Steiner Ranch HOA · Steiner Ranch, Austin TX
        </div>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#A3A3A3", fontFamily: T.fontSans }}>
          Loading jobs…
        </div>
      )}
      {!isLoading && open.length === 0 && (
        <EmptyState icon="🔧" title="No open jobs right now" sub="Check back soon — new work orders are posted as they're approved." />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {open.map(wo => {
          const hasExpressed = expressed[wo.id];
          const isConfirming = confirming === wo.id;

          return (
            <Card key={wo.id} style={{ padding: "22px 24px", borderRadius: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1, marginRight: 16 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    <Tag>{wo.category}</Tag>
                    {wo.priority === "high" && (
                      <Tag color={T.danger} bg={T.dangerPale}>Urgent</Tag>
                    )}
                    <StatusTag status={wo.status} />
                  </div>
                  <div style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 600, color: "#0A0A0A", letterSpacing: "-0.02em", marginBottom: 4 }}>
                    {wo.title}
                  </div>
                  {wo.description && (
                    <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#525252", lineHeight: 1.6 }}>
                      {wo.description}
                    </div>
                  )}
                </div>

                <div style={{ flexShrink: 0 }}>
                  {hasExpressed ? (
                    <Tag color={T.success} bg={T.successPale}>Interest Sent ✓</Tag>
                  ) : isConfirming ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <div style={{ fontFamily: T.fontSans, fontSize: 11, color: "#737373", textAlign: "right", maxWidth: 140 }}>
                        Confirm interest in this job?
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn
                          variant="ghost"
                          style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999 }}
                          onClick={() => setConfirming(null)}
                        >
                          Cancel
                        </Btn>
                        <Btn
                          style={{ fontSize: 12, padding: "5px 14px", borderRadius: 999, background: T.forest }}
                          onClick={() => {
                            setExpressed(e => ({ ...e, [wo.id]: true }));
                            setConfirming(null);
                          }}
                        >
                          Confirm
                        </Btn>
                      </div>
                    </div>
                  ) : (
                    <Btn
                      variant="outline"
                      style={{ borderRadius: 999, padding: "7px 16px", fontSize: 12 }}
                      onClick={() => setConfirming(wo.id)}
                    >
                      Express Interest
                    </Btn>
                  )}
                </div>
              </div>

              {wo.homeowner?.address && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 10, borderTop: "1px solid #F0F0F0", marginTop: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "#A3A3A3" }}>{wo.homeowner.address}</span>
                  <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "#D4D4D4", margin: "0 4px" }}>·</span>
                  <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "#A3A3A3" }}>
                    {new Date(wo.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Permit Feed ─────────────────────────────────────────────────
function PermitsTab() {
  const { data: permits = [], isLoading } = useQuery({
    queryKey: ["austinPermits"],
    queryFn: () => rpc.getAustinPermits(),
  });

  type Permit = {
    id: string;
    type: string;
    contractor: string;
    value: string | null;
    address: string;
    date: string | null;
    status: string;
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.025em", marginBottom: 6 }}>
            Austin Permit Feed
          </div>
          <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#737373" }}>
            Real-time contractor activity near Steiner Ranch from Austin Open Data.
          </div>
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px",
          background: T.forestPale,
          border: `1px solid rgba(42,82,64,0.15)`,
          borderRadius: 999,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.forest }} />
          <span style={{ fontFamily: T.fontSans, fontSize: 11, fontWeight: 500, color: T.forest }}>Live · Austin Open Data</span>
        </div>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#A3A3A3", fontFamily: T.fontSans }}>
          Loading permits…
        </div>
      )}
      {!isLoading && (permits as Permit[]).length === 0 && (
        <EmptyState icon="📋" title="No permits found" sub="Permit data is sourced from Austin Open Data. Check back soon." />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(permits as Permit[]).map(p => (
          <Card key={p.id} className="card-hover" style={{ padding: "18px 20px", borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: "#0A0A0A", marginBottom: 2 }}>{p.type}</div>
                <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "#737373" }}>{p.contractor}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {p.value && (
                  <span style={{ fontFamily: T.fontMono, fontSize: 12, fontWeight: 600, color: T.gold }}>{p.value}</span>
                )}
                {p.status && <Tag>{p.status}</Tag>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, paddingTop: 10, borderTop: "1px solid #F0F0F0", flexWrap: "wrap" }}>
              {p.address && (
                <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "#A3A3A3", display: "flex", alignItems: "center", gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {p.address}
                </span>
              )}
              {p.date && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: "#A3A3A3" }}>{p.date}</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: My Profile ──────────────────────────────────────────────────
function ProfileTab() {
  const TRUST_BADGES = [
    { label: "Licensed", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { label: "Insured", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { label: "Background Checked", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { label: "Permit Verified", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  ];

  const SPECIALTIES = ["Roofing", "Storm Damage", "Shingle Replacement", "Gutter Systems", "Skylight Install"];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
      {/* Profile header */}
      <Card style={{ padding: "28px 28px", borderRadius: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
          {/* Avatar */}
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: T.forestPale,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.forest} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontSans, fontSize: 20, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.025em", marginBottom: 2 }}>
              Summit Roofing Co.
            </div>
            <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "#525252", marginBottom: 8 }}>
              Mike Torres · Owner / Operator
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag color={T.forest} bg={T.forestPale}>Founding Contractor</Tag>
              <Tag color={T.gold} bg={T.goldLight}>Seat #3 of 25</Tag>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#F0F0F0", borderRadius: 12, overflow: "hidden", marginTop: 22 }}>
          {[
            { label: "Jobs Completed",  value: "47" },
            { label: "Response Rate",   value: "98%" },
            { label: "Avg Rating",      value: "4.9" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#FFFFFF", padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: T.fontSans, fontSize: 22, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.03em" }}>{stat.value}</div>
              <div style={{ fontFamily: T.fontSans, fontSize: 11, color: "#A3A3A3", marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trust badges */}
      <Card style={{ padding: "22px 24px", borderRadius: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
          Verifications
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {TRUST_BADGES.map(b => (
            <div key={b.label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10,
              background: T.forestPale, border: `1px solid rgba(42,82,64,0.12)`,
            }}>
              {b.icon}
              <span style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 500, color: "#0A0A0A" }}>{b.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Specialties */}
      <Card style={{ padding: "22px 24px", borderRadius: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
          Specialties
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SPECIALTIES.map(s => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
      </Card>

      {/* Contact / service area */}
      <Card style={{ padding: "22px 24px", borderRadius: 16 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
          Service Details
        </div>
        {[
          { label: "Service Area", value: "Austin metro · Travis & Williamson counties" },
          { label: "License #",    value: "RCL-2024-TX-88341" },
          { label: "Founded",      value: "2011 · 13 years in business" },
          { label: "Phone",        value: "(512) 555-0192" },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
            <span style={{ fontFamily: T.fontSans, fontSize: 13, color: "#A3A3A3" }}>{row.label}</span>
            <span style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 500, color: "#0A0A0A" }}>{row.value}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────
export function ContractorPortal({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("jobs");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#FFFFFF" }}>
      <style>{GLOBAL_CSS}</style>
      <DemoNav onBack={onBack} />
      <TabBar active={tab} onChange={setTab} />
      <div style={{ flex: 1, background: "#FAFAFA" }}>
        {tab === "jobs"    && <JobsTab />}
        {tab === "permits" && <PermitsTab />}
        {tab === "profile" && <ProfileTab />}
      </div>
    </div>
  );
}
