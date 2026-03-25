import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { SectionHeader, Btn, Card, StatusTag, Tag, EmptyState, Modal, FDInput, FDSelect, FDTextarea, Icons, Label } from "./ui-kit";
import { AIPanel, AIField, AIList, AIScore } from "./AIPanel";

const WO_CATS = ["plumbing","electrical","landscaping","hvac","structural","pool","general"];
const PRIORITIES = ["low","normal","high","urgent"];

export function WorkOrders({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [updateModal, setUpdateModal] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "general", location: "", priority: "normal", estimatedCost: "" });
  const [updateForm, setUpdateForm] = useState({ assignedTo: "", actualCost: "", completionNotes: "", status: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setUF = (k: string, v: string) => setUpdateForm(f => ({ ...f, [k]: v }));

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["workorders", hoaId],
    queryFn: () => rpc.getWorkOrders(hoaId),
  });

  const createMut = useMutation({
    mutationFn: () => rpc.createWorkOrder({
      hoaId,
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      priority: form.priority,
      estimatedCost: form.estimatedCost ? Math.round(parseFloat(form.estimatedCost)*100) : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workorders"] }); setModal(false); setForm({ title: "", description: "", category: "general", location: "", priority: "normal", estimatedCost: "" }); },
  });

  const updateMut = useMutation({
    mutationFn: (id: string) => rpc.updateWorkOrder({
      id,
      assignedTo: updateForm.assignedTo || undefined,
      actualCost: updateForm.actualCost ? Math.round(parseFloat(updateForm.actualCost)*100) : undefined,
      completionNotes: updateForm.completionNotes || undefined,
      status: updateForm.status || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workorders"] }); setUpdateModal(null); setUpdateForm({ assignedTo: "", actualCost: "", completionNotes: "", status: "" }); },
  });

  type WO = { id: string; title: string; description: string; category: string; location: string; priority: string; status: string; assignedTo?: string | null; estimatedCost?: number | null; actualCost?: number | null; completionNotes?: string | null; dueDate?: Date | string | null; createdAt: Date | string; homeowner?: {name:string;address:string}|null };

  const priorityColor = (p: string) => p === "urgent" ? T.danger : p === "high" ? T.warn : T.inkMid;
  const open = (orders as WO[]).filter(o => !["completed","cancelled"].includes(o.status));
  const done = (orders as WO[]).filter(o => ["completed","cancelled"].includes(o.status));

  return (
    <div style={{ padding: "32px 40px" }} className="main-pad">
      <SectionHeader
        title="WorkOrder — Maintenance Ops"
        sub="Track repairs, assign contractors, manage community maintenance"
        action={<Btn onClick={() => setModal(true)}><Icons.Plus /> New Work Order</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Open",        value: open.filter(o => o.status === "open").length },
          { label: "Assigned",    value: open.filter(o => o.status === "assigned").length, color: T.blue },
          { label: "In Progress", value: open.filter(o => o.status === "in_progress").length, color: T.purple },
          { label: "Urgent",      value: open.filter(o => o.priority === "urgent").length, color: T.danger },
        ].map(s => (
          <Card key={s.label} style={{ padding: "16px 20px" }}>
            <Label>{s.label}</Label>
            <div style={{ fontFamily: T.fontSerif, fontSize: 28, fontWeight: 700, color: s.color || T.charcoal }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {isLoading && <div style={{ padding: 40, textAlign: "center", color: T.inkLight }}>Loading...</div>}
      {!isLoading && open.length === 0 && <EmptyState icon="🔧" title="No open work orders" sub="Community maintenance is all caught up." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {open.map(o => (
          <Card key={o.id} style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 600, color: T.ink }}>{o.title}</span>
                  <Tag color={priorityColor(o.priority)} bg={o.priority === "urgent" ? T.dangerPale : o.priority === "high" ? T.warnPale : T.creamDark}>{o.priority}</Tag>
                  <Tag>{o.category}</Tag>
                  <StatusTag status={o.status} />
                </div>
                <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.inkMid, marginBottom: 4 }}>{o.description}</div>
                <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>📍 {o.location}</div>
                {o.assignedTo && <div style={{ fontFamily: T.fontSans, fontSize: 12, color: T.blue, marginTop: 2 }}>→ Assigned to: {o.assignedTo}</div>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                {o.estimatedCost && <div><Label>Est.</Label><div style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 600 }}>${(o.estimatedCost/100).toLocaleString()}</div></div>}
                {o.actualCost && <div style={{ marginTop: 4 }}><Label>Actual</Label><div style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 600 }}>${(o.actualCost/100).toLocaleString()}</div></div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${T.stone}30` }}>
              <Btn variant="outline" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => { setUpdateForm({ assignedTo: o.assignedTo||"", actualCost: "", completionNotes: "", status: "" }); setUpdateModal(o.id); }}>
                Update
              </Btn>
              <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight, alignSelf: "center", marginLeft: "auto" }}>
                {new Date(o.createdAt).toLocaleDateString()}
                {o.dueDate && ` · Due ${new Date(o.dueDate).toLocaleDateString()}`}
              </div>
            </div>
            <AIPanel
              label="WorkOrder AI"
              description="vendor routing, cost estimate, permit check"
              runFn={() => rpc.runWorkOrderRouting(o.id)}
              fetchFn={() => rpc.getAIAnalysis({ type: "workorder", id: o.id })}
              queryKey={["workorders", hoaId]}
              alreadyAnalyzed={!!(o as WO & { aiAnalysis?: string | null }).aiAnalysis}
              renderResult={(data) => {
                const d = data as { recommended_vendor_type?: string; suggested_vendors?: string[]; estimated_cost_range?: string; estimated_duration?: string; permits_required?: boolean; permit_notes?: string; urgency_score?: number; notes?: string[] };
                return (
                  <div>
                    {d.recommended_vendor_type && <AIField label="Vendor Type" value={d.recommended_vendor_type} />}
                    {d.estimated_cost_range && <AIField label="Estimated Cost" value={d.estimated_cost_range} color={T.gold} />}
                    {d.estimated_duration && <AIField label="Est. Duration" value={d.estimated_duration} />}
                    {d.urgency_score != null && <AIScore label="Urgency" score={d.urgency_score} />}
                    {d.permits_required && <AIField label="Permits Required" value={d.permit_notes ?? "Yes — check local requirements"} color={T.warn} />}
                    {d.suggested_vendors && <AIList label="Suggested Vendors" items={d.suggested_vendors} />}
                    {d.notes && <AIList label="Notes" items={d.notes} />}
                  </div>
                );
              }}
            />
          </Card>
        ))}
      </div>

      {done.length > 0 && (
        <div>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Completed ({done.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {done.map(o => (
              <Card key={o.id} style={{ padding: "14px 20px", opacity: 0.65 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600 }}>{o.title}</span>
                    <span style={{ fontFamily: T.fontSans, fontSize: 12, color: T.inkLight, marginLeft: 8 }}>{o.category} · {o.location}</span>
                    {o.actualCost && <span style={{ fontFamily: T.fontMono, fontSize: 12, color: T.inkMid, marginLeft: 8 }}>${(o.actualCost/100).toLocaleString()}</span>}
                  </div>
                  <StatusTag status={o.status} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Work Order">
        <FDInput label="Title" placeholder="Pool pump replacement" value={form.title} onChange={e => set("title", e.target.value)} />
        <FDTextarea label="Description" placeholder="Describe the issue..." value={form.description} onChange={e => set("description", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FDSelect label="Category" value={form.category} onChange={e => set("category", e.target.value)}>
            {WO_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </FDSelect>
          <FDSelect label="Priority" value={form.priority} onChange={e => set("priority", e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </FDSelect>
        </div>
        <FDInput label="Location" placeholder="Main pool deck" value={form.location} onChange={e => set("location", e.target.value)} />
        <FDInput label="Estimated Cost ($)" type="number" placeholder="2500" value={form.estimatedCost} onChange={e => set("estimatedCost", e.target.value)} />
        <Btn full onClick={() => createMut.mutate()} disabled={!form.title || !form.description || !form.location || createMut.isPending}>
          {createMut.isPending ? "Creating…" : "Create Work Order"}
        </Btn>
      </Modal>

      <Modal open={!!updateModal} onClose={() => setUpdateModal(null)} title="Update Work Order">
        <FDSelect label="Status" value={updateForm.status} onChange={e => setUF("status", e.target.value)}>
          <option value="">No change</option>
          {["open","assigned","in_progress","completed","on_hold","cancelled"].map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
        </FDSelect>
        <FDInput label="Assign To" placeholder="Austin HVAC Services" value={updateForm.assignedTo} onChange={e => setUF("assignedTo", e.target.value)} />
        <FDInput label="Actual Cost ($)" type="number" placeholder="2300" value={updateForm.actualCost} onChange={e => setUF("actualCost", e.target.value)} />
        <FDTextarea label="Completion Notes" placeholder="Work completed. Replaced pump motor..." value={updateForm.completionNotes} onChange={e => setUF("completionNotes", e.target.value)} />
        <Btn full onClick={() => updateMut.mutate(updateModal!)} disabled={updateMut.isPending}>
          {updateMut.isPending ? "Saving…" : "Update Work Order"}
        </Btn>
      </Modal>
    </div>
  );
}
