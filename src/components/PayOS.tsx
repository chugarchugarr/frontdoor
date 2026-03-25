import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T } from "./tokens";
import { SectionHeader, Btn, Card, Tag, EmptyState, Modal, FDInput, FDSelect, Icons, StatCard } from "./ui-kit";
import { AIPanel, AIField, AIList } from "./AIPanel";

const BUDGET_CATS = ["maintenance","utilities","insurance","reserves","admin","amenities","other"];

export function PayOS({ hoaId }: { hoaId: string }) {
  const qc = useQueryClient();
  const [budgetModal, setBudgetModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ category: "maintenance", name: "", budgetedCents: "", year: String(new Date().getFullYear()), notes: "" });
  const setBF = (k: string, v: string) => setBudgetForm(f => ({ ...f, [k]: v }));

  const { data: financial, isLoading } = useQuery({
    queryKey: ["financial", hoaId],
    queryFn: () => rpc.getFinancialSummary(hoaId),
  });

  const { data: homeowners = [] } = useQuery({
    queryKey: ["homeowners", hoaId],
    queryFn: () => rpc.getHomeowners(hoaId),
  });

  const chargeMut = useMutation({
    mutationFn: () => rpc.chargeMonthlyDues(hoaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial"] }),
  });

  const addBudgetMut = useMutation({
    mutationFn: () => rpc.addBudgetLine({
      hoaId,
      year: parseInt(budgetForm.year),
      category: budgetForm.category,
      name: budgetForm.name,
      budgetedCents: Math.round(parseFloat(budgetForm.budgetedCents) * 100),
      notes: budgetForm.notes || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["financial"] }); setBudgetModal(false); },
  });

  type HW = { id: string; name: string; address: string; duesAccount: { balanceCents: number; monthlyDueCents: number; autopayEnabled: boolean } | null };

  return (
    <div style={{ padding: "32px 40px" }} className="main-pad">
      <SectionHeader
        title="PayOS — Dues & Finances"
        sub="Automated dues collection, budgeting, and financial reporting"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setBudgetModal(true)}><Icons.Plus /> Budget Line</Btn>
            <Btn onClick={() => chargeMut.mutate()} disabled={chargeMut.isPending}>
              {chargeMut.isPending ? "Charging…" : "Run Monthly Dues"}
            </Btn>
          </div>
        }
      />

      {chargeMut.isSuccess && (
        <div style={{ padding: "12px 16px", background: T.successPale, border: `1px solid ${T.success}30`, borderRadius: T.radius, marginBottom: 20, fontFamily: T.fontSans, fontSize: 13, color: T.success }}>
          ✓ Monthly dues charged to {(chargeMut.data as {charged:number}).charged} accounts.
        </div>
      )}

      {isLoading && <div style={{ padding: 40, textAlign: "center", color: T.inkLight }}>Loading...</div>}

      {financial && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
            <StatCard label="Outstanding Dues" value={`$${(financial.totalOutstanding/100).toLocaleString()}`} color={financial.totalOutstanding > 0 ? T.danger : T.success} />
            <StatCard label="Delinquent Accounts" value={financial.delinquentCount} color={financial.delinquentCount > 0 ? T.danger : T.success} />
            <StatCard label="Delinquent Amount" value={`$${(financial.delinquentAmount/100).toLocaleString()}`} color={T.danger} />
            <StatCard label="YTD Budget" value={`$${(financial.budgetedYTD/100).toLocaleString()}`} />
            <StatCard label="YTD Actual" value={`$${(financial.actualYTD/100).toLocaleString()}`} />
            <StatCard label="Variance" value={`${financial.variance >= 0 ? "+" : "-"}$${(Math.abs(financial.variance)/100).toLocaleString()}`} color={financial.variance >= 0 ? T.success : T.danger} />
          </div>
        </>
      )}

      {/* Homeowner dues roster */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Dues Accounts ({(homeowners as HW[]).length})</div>
        {(homeowners as HW[]).length === 0
          ? <EmptyState icon="🏠" title="No homeowners yet" sub="Add homeowners to track dues." />
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(homeowners as HW[]).map(h => {
                const bal = h.duesAccount?.balanceCents ?? 0;
                const monthly = h.duesAccount?.monthlyDueCents ?? 0;
                return (
                  <Card key={h.id} style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600, color: T.ink }}>{h.name}</div>
                        <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.inkLight }}>{h.address}</div>
                      </div>
                      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight }}>Monthly</div>
                          <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 600 }}>${(monthly/100).toFixed(0)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.inkLight }}>Balance Owed</div>
                          <div style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 700, color: bal > 0 ? T.danger : T.success }}>
                            {bal > 0 ? `$${(bal/100).toLocaleString()}` : "Current"}
                          </div>
                        </div>
                        {h.duesAccount?.autopayEnabled && <Tag color={T.success} bg={T.successPale}>Autopay</Tag>}
                      </div>
                    </div>
                    {bal > 0 && (
                      <AIPanel
                        label="PayOS AI"
                        description="delinquency analysis + collection email draft"
                        runFn={() => rpc.runDelinquencyAnalysis({ hoaId, homeownerId: h.id })}
                        fetchFn={() => rpc.getAIAnalysis({ type: "dues", id: h.id })}
                        queryKey={["financial", hoaId]}
                        renderResult={(data) => {
                          const d = data as { risk_level?: string; overdue_months?: number; recommended_action?: string; escalate_to_attorney?: boolean; collection_email?: string; payment_plan_suggestion?: string; flags?: string[] };
                          return (
                            <div>
                              {d.risk_level && <AIField label="Risk Level" value={d.risk_level.toUpperCase()} color={d.risk_level === "high" ? T.danger : d.risk_level === "medium" ? T.warn : T.success} />}
                              {d.overdue_months != null && <AIField label="Overdue Months" value={`${d.overdue_months} months`} />}
                              {d.recommended_action && <AIField label="Recommended Action" value={d.recommended_action} />}
                              {d.escalate_to_attorney && <AIField label="Attorney Referral" value="⚠️ Recommend legal escalation" color={T.danger} />}
                              {d.payment_plan_suggestion && <AIField label="Payment Plan" value={d.payment_plan_suggestion} />}
                              {d.flags && <AIList label="Flags" items={d.flags} color={T.danger} />}
                              {d.collection_email && <AIField label="Draft Collection Email" value={<span style={{ whiteSpace: "pre-wrap" }}>{d.collection_email}</span>} />}
                            </div>
                          );
                        }}
                      />
                    )}
                  </Card>
                );
              })}
            </div>
          )
        }
      </div>

      {/* Budget modal */}
      <Modal open={budgetModal} onClose={() => setBudgetModal(false)} title="Add Budget Line">
        <FDInput label="Year" type="number" value={budgetForm.year} onChange={e => setBF("year", e.target.value)} />
        <FDSelect label="Category" value={budgetForm.category} onChange={e => setBF("category", e.target.value)}>
          {BUDGET_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </FDSelect>
        <FDInput label="Line Item Name" placeholder="Pool maintenance contract" value={budgetForm.name} onChange={e => setBF("name", e.target.value)} />
        <FDInput label="Budgeted Amount ($)" type="number" placeholder="12000" value={budgetForm.budgetedCents} onChange={e => setBF("budgetedCents", e.target.value)} />
        <FDInput label="Notes (optional)" placeholder="Annual contract with AquaClear" value={budgetForm.notes} onChange={e => setBF("notes", e.target.value)} />
        <Btn full onClick={() => addBudgetMut.mutate()} disabled={!budgetForm.name || !budgetForm.budgetedCents || addBudgetMut.isPending}>
          {addBudgetMut.isPending ? "Saving…" : "Add Budget Line"}
        </Btn>
      </Modal>
    </div>
  );
}
