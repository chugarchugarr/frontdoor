import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { Btn, Card, Tag, EmptyState, Modal, FDInput, FDSelect, Icons, Label, StatusTag } from "./ui-kit";

const ROLES = ["resident", "board", "president", "treasurer", "secretary"];

const ROLE_META: Record<string, { color: string; bg: string; label: string }> = {
  president:  { color: T.gold,    bg: T.goldLight,   label: "President" },
  treasurer:  { color: T.purple,  bg: T.purplePale,  label: "Treasurer" },
  secretary:  { color: T.blue,    bg: T.bluePale,    label: "Secretary" },
  board:      { color: T.forest,  bg: T.forestPale,  label: "Board" },
  resident:   { color: "#6A6A62", bg: "var(--bg-subtle)", label: "Resident" },
};

type HW = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address: string;
  unit?: string | null;
  role: string;
  duesAccount: { balanceCents: number; monthlyDueCents: number } | null;
  _count: { violations: number; workOrders: number };
};

function Avatar({ name, role, size = 40 }: { name: string; role: string; size?: number }) {
  const meta = ROLE_META[role] || ROLE_META.resident;
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: meta.bg,
      border: `2px solid ${meta.color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.fontSans, fontSize: size * 0.35, fontWeight: 700,
      color: meta.color, flexShrink: 0, letterSpacing: "-0.01em",
    }}>
      {initials}
    </div>
  );
}

function HomeownerRow({ h, expanded, onToggle }: { h: HW; expanded: boolean; onToggle: () => void }) {
  const bal = h.duesAccount?.balanceCents ?? 0;
  const monthly = h.duesAccount?.monthlyDueCents ?? 0;
  const meta = ROLE_META[h.role] || ROLE_META.resident;
  const isDelinquent = bal > 0;
  const monthsBehind = monthly > 0 ? Math.round(bal / monthly) : 0;

  return (
    <div
      className="card-hover"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${expanded ? "rgba(42,82,64,0.3)" : "var(--border)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: expanded ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
    >
      {/* Main row */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", padding: "14px 20px",
          display: "flex", alignItems: "center",
          background: "none", border: "none", cursor: "pointer",
          gap: 14, textAlign: "left",
        }}
      >
        <Avatar name={h.name} role={h.role} size={38} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{h.name}</span>
            <Tag color={meta.color} bg={meta.bg} style={{ fontSize: 9 }}>{meta.label}</Tag>
          </div>
          <div style={{ fontFamily: T.fontMono, fontSize: 11, color: "var(--text-light)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {h.address}{h.unit ? ` #${h.unit}` : ""}
          </div>
        </div>

        {/* Right side indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }} className="mobile-hide">
          {h._count.violations > 0 && (
            <Tag color={T.danger} bg={T.dangerPale}>{h._count.violations} {h._count.violations === 1 ? "violation" : "violations"}</Tag>
          )}
          {monthly > 0 && (
            <div style={{ textAlign: "right", minWidth: 80 }}>
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "var(--text-light)" }}>Dues</div>
              <div style={{ fontFamily: T.fontSans, fontSize: 12, fontWeight: 700, color: isDelinquent ? T.danger : T.success }}>
                {isDelinquent ? `$${(bal / 100).toLocaleString()} owed` : "Current"}
              </div>
            </div>
          )}
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s",
            transform: expanded ? "rotate(180deg)" : "none",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </button>

      {/* Expanded drawer */}
      {expanded && (
        <div className="anim-up" style={{
          borderTop: "1px solid var(--border)",
          padding: "18px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}>
          {/* Contact */}
          <div>
            <Label>Contact</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <a href={`mailto:${h.email}`} style={{ fontFamily: T.fontSans, fontSize: 13, color: T.forest, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,14 22,4"/></svg>
                {h.email}
              </a>
              {h.phone && (
                <a href={`tel:${h.phone}`} style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  {h.phone}
                </a>
              )}
            </div>
          </div>

          {/* Dues */}
          {monthly > 0 && (
            <div>
              <Label>Dues Status</Label>
              <div style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)" }}>
                ${(monthly / 100).toLocaleString()}/mo
              </div>
              {isDelinquent ? (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 700, color: T.danger }}>
                    ${(bal / 100).toLocaleString()} outstanding
                  </div>
                  <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.danger, opacity: 0.7, marginTop: 2 }}>
                    {monthsBehind} month{monthsBehind !== 1 ? "s" : ""} behind
                  </div>
                </div>
              ) : (
                <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, color: T.success, marginTop: 4 }}>✓ Current</div>
              )}
            </div>
          )}

          {/* Activity */}
          <div>
            <Label>Activity</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)" }}>Violations</span>
                <StatusTag status={h._count.violations > 0 ? "open" : "resolved"} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)" }}>Work orders</span>
                <span style={{ fontFamily: T.fontMono, fontSize: 12, color: "var(--text-light)" }}>{h._count.workOrders}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Homeowners({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "delinquent" | "violations" | "board">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", unit: "", role: "resident", monthlyDueCents: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data: homeowners = [], isLoading } = useQuery({
    queryKey: ["homeowners", hoaId],
    queryFn: () => rpc.getHomeowners(hoaId),
  });

  const hw = homeowners as HW[];

  const createMut = useMutation({
    mutationFn: () => rpc.addHomeowner({
      hoaId, name: form.name, email: form.email,
      phone: form.phone || undefined,
      address: form.address, unit: form.unit || undefined,
      role: form.role,
      monthlyDueCents: form.monthlyDueCents ? Math.round(parseFloat(form.monthlyDueCents) * 100) : 0,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homeowners"] });
      setModal(false);
      setForm({ name: "", email: "", phone: "", address: "", unit: "", role: "resident", monthlyDueCents: "" });
    },
  });

  // Stats
  const delinquentCount = hw.filter(h => (h.duesAccount?.balanceCents ?? 0) > 0).length;
  const boardCount = hw.filter(h => h.role !== "resident").length;
  const totalOwed = hw.reduce((s, h) => s + (h.duesAccount?.balanceCents ?? 0), 0);

  // Filter + search
  const filtered = hw.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.name.toLowerCase().includes(q) || h.email.toLowerCase().includes(q) || h.address.toLowerCase().includes(q);
    const matchFilter =
      filter === "all" ? true :
      filter === "delinquent" ? (h.duesAccount?.balanceCents ?? 0) > 0 :
      filter === "violations" ? h._count.violations > 0 :
      filter === "board" ? h.role !== "resident" : true;
    return matchSearch && matchFilter;
  });

  const boardMembers = filtered.filter(h => h.role !== "resident");
  const residents = filtered.filter(h => h.role === "resident");

  const FILTERS: { id: typeof filter; label: string; count: number }[] = [
    { id: "all",        label: "All",         count: hw.length },
    { id: "board",      label: "Board",        count: boardCount },
    { id: "delinquent", label: "Delinquent",   count: delinquentCount },
    { id: "violations", label: "Violations",   count: hw.filter(h => h._count.violations > 0).length },
  ];

  return (
    <div style={{ padding: "32px 36px", minHeight: "100vh" }} className="main-pad">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: T.fontSans, fontSize: 24, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Homeowners
          </h2>
          <p style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-light)" }}>
            Resident roster · dues · roles
          </p>
        </div>
        <Btn onClick={() => setModal(true)}><Icons.Plus /> Add Homeowner</Btn>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Residents", value: hw.length, color: "var(--text)" },
          { label: "Board Members",   value: boardCount, color: T.blue },
          { label: "Delinquent",      value: delinquentCount, color: delinquentCount > 0 ? T.danger : T.success },
          { label: "Total Owed",      value: totalOwed > 0 ? `$${(totalOwed/100).toLocaleString()}` : "$0", color: totalOwed > 0 ? T.danger : T.success },
        ].map(s => (
          <Card key={s.label} style={{ padding: "16px 18px" }}>
            <Label>{s.label}</Label>
            <div style={{ fontFamily: T.fontSans, fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Search + filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search input */}
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
          <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, address…"
            style={{
              width: "100%", padding: "9px 14px 9px 32px",
              border: "1px solid var(--border)", borderRadius: T.radius,
              background: "var(--bg-input)", fontSize: 13, color: "var(--text)",
              fontFamily: T.fontSans,
            }}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                fontFamily: T.fontSans, fontSize: 12, fontWeight: 500,
                padding: "7px 13px", borderRadius: 20,
                border: `1px solid ${filter === f.id ? T.forest : "var(--border)"}`,
                background: filter === f.id ? T.forestPale : "var(--bg-card)",
                color: filter === f.id ? T.forest : "var(--text-light)",
                cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {f.label}
              <span style={{ fontFamily: T.fontMono, fontSize: 10, opacity: 0.7 }}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} className="ai-skeleton" style={{ height: 66, borderRadius: "16px" }} />
          ))}
        </div>
      )}

      {!isLoading && hw.length === 0 && (
        <EmptyState icon="🏠" title="No homeowners yet" sub="Add residents to unlock all HOA OS modules." />
      )}

      {!isLoading && hw.length > 0 && filtered.length === 0 && (
        <EmptyState icon="🔍" title="No results" sub="Try adjusting your search or filter." />
      )}

      {/* Board */}
      {boardMembers.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 9, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Board</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontFamily: T.fontMono, fontSize: 9, color: "var(--text-light)" }}>{boardMembers.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {boardMembers.map(h => (
              <HomeownerRow key={h.id} h={h} expanded={expanded === h.id} onToggle={() => setExpanded(expanded === h.id ? null : h.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Residents */}
      {residents.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 9, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Residents</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontFamily: T.fontMono, fontSize: 9, color: "var(--text-light)" }}>{residents.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {residents.map(h => (
              <HomeownerRow key={h.id} h={h} expanded={expanded === h.id} onToggle={() => setExpanded(expanded === h.id ? null : h.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Add modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Homeowner">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <FDInput label="Full Name" placeholder="Sarah Mitchell" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <FDInput label="Email" type="email" placeholder="sarah@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
          <FDInput label="Phone (optional)" type="tel" placeholder="512-555-0100" value={form.phone} onChange={e => set("phone", e.target.value)} />
          <div style={{ gridColumn: "1 / -1" }}>
            <FDInput label="Address" placeholder="1847 Oakwood Dr" value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <FDInput label="Unit (optional)" placeholder="4B" value={form.unit} onChange={e => set("unit", e.target.value)} />
          <FDSelect label="Role" value={form.role} onChange={e => set("role", e.target.value)}>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_META[r]?.label ?? r}</option>)}
          </FDSelect>
          <div style={{ gridColumn: "1 / -1" }}>
            <FDInput label="Monthly Dues ($)" type="number" placeholder="185.00" value={form.monthlyDueCents} onChange={e => set("monthlyDueCents", e.target.value)} />
          </div>
        </div>
        <Btn full onClick={() => createMut.mutate()} disabled={!form.name || !form.email || !form.address || createMut.isPending}>
          {createMut.isPending ? "Adding…" : "Add Homeowner"}
        </Btn>
        {createMut.isError && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: T.dangerPale, borderRadius: T.radius, fontFamily: T.fontSans, fontSize: 13, color: T.danger }}>
            Something went wrong — please try again.
          </div>
        )}
      </Modal>
    </div>
  );
}
