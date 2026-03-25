import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { SectionHeader, Btn, Card, Tag, EmptyState, Modal, FDInput, FDSelect, Icons, Label } from "./ui-kit";

const ROLES = ["resident","board","president","treasurer","secretary"];

export function Homeowners({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", unit: "", role: "resident", monthlyDueCents: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data: homeowners = [], isLoading } = useQuery({
    queryKey: ["homeowners", hoaId],
    queryFn: () => rpc.getHomeowners(hoaId),
  });

  const createMut = useMutation({
    mutationFn: () => rpc.addHomeowner({
      hoaId,
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      address: form.address,
      unit: form.unit || undefined,
      role: form.role,
      monthlyDueCents: form.monthlyDueCents ? Math.round(parseFloat(form.monthlyDueCents) * 100) : 0,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["homeowners"] }); setModal(false); setForm({ name: "", email: "", phone: "", address: "", unit: "", role: "resident", monthlyDueCents: "" }); },
  });

  const roleColor: Record<string, { color: string; bg: string }> = {
    president:  { color: T.gold,    bg: T.goldLight },
    board:      { color: T.blue,    bg: T.bluePale },
    treasurer:  { color: T.purple,  bg: T.purplePale },
    secretary:  { color: T.forest,  bg: T.forestPale },
    resident:   { color: T.inkMid,  bg: T.creamDark },
  };

  type HW = { id: string; name: string; email: string; phone?: string|null; address: string; unit?: string|null; role: string; duesAccount: {balanceCents: number; monthlyDueCents: number} | null; _count: {violations: number; workOrders: number} };

  const boardMembers = (homeowners as HW[]).filter(h => h.role !== "resident");
  const residents = (homeowners as HW[]).filter(h => h.role === "resident");

  return (
    <div style={{ padding: "32px 40px", minHeight: "100vh" }} className="main-pad">
      <SectionHeader
        title="Homeowners"
        sub="Resident roster, dues accounts, and role management"
        action={<Btn onClick={() => setModal(true)}><Icons.Plus /> Add Homeowner</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Residents", value: (homeowners as HW[]).length },
          { label: "Board Members",   value: boardMembers.length, color: T.blue },
          { label: "Delinquent",      value: (homeowners as HW[]).filter(h => (h.duesAccount?.balanceCents ?? 0) > 0).length, color: T.danger },
        ].map(s => (
          <Card key={s.label} style={{ padding: "16px 20px" }}>
            <Label>{s.label}</Label>
            <div style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 700, color: s.color || T.charcoal }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {isLoading && <div style={{ padding: 40, textAlign: "center", color: T.inkLight }}>Loading...</div>}
      {!isLoading && (homeowners as HW[]).length === 0 && (
        <EmptyState icon="🏠" title="No homeowners yet" sub="Add residents to unlock all HOA OS modules." />
      )}

      {boardMembers.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Board</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {boardMembers.map(h => {
              const rc = roleColor[h.role] || roleColor.resident;
              return (
                <Card key={h.id} style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: rc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: rc.color, flexShrink: 0 }}>
                      {h.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: T.ink }}>{h.name}</div>
                      <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>{h.email}</div>
                    </div>
                  </div>
                  <Tag color={rc.color} bg={rc.bg}>{h.role}</Tag>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {residents.length > 0 && (
        <div>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Residents ({residents.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(residents as HW[]).map(h => {
              const bal = h.duesAccount?.balanceCents ?? 0;
              const monthly = h.duesAccount?.monthlyDueCents ?? 0;
              return (
                <Card key={h.id} style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.creamDark, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.fontSans, fontSize: 13, fontWeight: 700, color: T.inkMid, flexShrink: 0 }}>
                      {h.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, color: T.ink }}>{h.name}</div>
                      <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>{h.address}{h.unit ? ` #${h.unit}` : ""}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    {h._count.violations > 0 && <Tag color={T.danger} bg={T.dangerPale}>{h._count.violations} violations</Tag>}
                    {monthly > 0 && <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight }}>Dues</div>
                      <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, color: bal > 0 ? T.danger : T.success }}>
                        {bal > 0 ? `$${(bal/100).toLocaleString()} owed` : "Current"}
                      </div>
                    </div>}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Homeowner">
        <FDInput label="Full Name" placeholder="Sarah Mitchell" value={form.name} onChange={e => set("name", e.target.value)} />
        <FDInput label="Email" type="email" placeholder="sarah@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
        <FDInput label="Phone (optional)" type="tel" placeholder="512-555-0100" value={form.phone} onChange={e => set("phone", e.target.value)} />
        <FDInput label="Address" placeholder="1847 Oakwood Dr" value={form.address} onChange={e => set("address", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FDInput label="Unit (optional)" placeholder="4B" value={form.unit} onChange={e => set("unit", e.target.value)} />
          <FDSelect label="Role" value={form.role} onChange={e => set("role", e.target.value)}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </FDSelect>
        </div>
        <FDInput label="Monthly Dues ($)" type="number" placeholder="250" value={form.monthlyDueCents} onChange={e => set("monthlyDueCents", e.target.value)} />
        <Btn full onClick={() => createMut.mutate()} disabled={!form.name || !form.email || !form.address || createMut.isPending}>
          {createMut.isPending ? "Adding…" : "Add Homeowner"}
        </Btn>
        {createMut.isError && <div style={{ marginTop: 12, color: T.danger, fontFamily: T.fontSans, fontSize: 13 }}>Error — please try again.</div>}
      </Modal>
    </div>
  );
}
