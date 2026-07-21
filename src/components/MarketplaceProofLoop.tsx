import React from "react";
import { useQuery } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T, GLOBAL_CSS } from "./tokens";
import { Btn, Card, Label, SectionHeader, Tag } from "./ui-kit";

const DEMO_HOA_ID = "cmprlyrux00005etlni6qod8x";

const fmtMoney = (cents: number) => `$${Math.round(cents / 100).toLocaleString()}`;

type MarketplaceDashboard = {
  demo: boolean;
  slots: { id: string; trade: string; status: string; capacity: number; seatsTaken: number; priceCents: number; scarcityLabel?: string | null }[];
  jobs: { id: string; title: string; category: string; status: string; estimatedValueCents?: number | null; source: string }[];
  quotes: { id: string; contractor: string; amountCents: number; status: string; scope: string }[];
  transactions: { id: string; grossAmountCents: number; gatepassFeeCents: number; hoaShareCents: number; status: string; contractor: string }[];
  credits: { id: string; amountCents: number; status: string; memo: string }[];
  complianceRecords: { id: string; summary: string; status: string }[];
  proofLoop: { label: string; detail: string; value?: string }[];
};

function LoopNode({ index, label, detail, value }: { index: number; label: string; detail: string; value?: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 12, alignItems: "start" }}>
      <div style={{ width: 34, height: 34, borderRadius: 12, background: index === 0 ? T.forest : T.gold, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.fontMono, fontSize: 12, fontWeight: 700 }}>
        {index + 1}
      </div>
      <Card style={{ padding: "14px 16px" }}>
        <div className="gp-loop-node-head" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{label}</div>
            <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-light)", marginTop: 4, lineHeight: 1.45 }}>{detail}</div>
          </div>
          {value && <Tag color={T.gold} bg={T.goldLight}>{value}</Tag>}
        </div>
      </Card>
    </div>
  );
}

export function MarketplaceProofLoop({ hoaId = DEMO_HOA_ID, demo = false }: { hoaId?: string; demo?: boolean }) {
  const { data, isLoading } = useQuery<MarketplaceDashboard>({
    queryKey: ["marketplace-dashboard", hoaId, demo],
    queryFn: () => rpc.getMarketplaceDashboard({ hoaId, demo }),
  });

  const dashboard = data;

  return (
    <div className="gp-market-shell" style={{ minHeight: "100vh", background: "var(--bg)", padding: 28 }}>
      <style>{GLOBAL_CSS}{`
        @media (max-width: 720px) {
          .gp-market-shell { padding: 16px !important; }
          .gp-market-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
          .gp-market-main { grid-template-columns: 1fr !important; gap: 14px !important; }
          .gp-card-title-row { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .gp-card-title-row button { width: 100% !important; min-height: 44px !important; justify-content: center !important; }
          .gp-money-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .gp-loop-node-head { flex-direction: column !important; }
          .gp-loop-node-head > span { align-self: flex-start !important; }
        }
        @media (max-width: 390px) {
          .gp-market-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <SectionHeader
        title="Contractor Access Flow"
          sub="Modeled demo of how contractor access works: an HOA-approved issue can become a quote and a record."
          action={<Tag color={T.gold} bg={T.goldLight}>{dashboard?.demo || demo ? "Demo data" : "Live records"}</Tag>}
        />

        {isLoading && <Card style={{ padding: 28, color: "var(--text-light)", fontFamily: T.fontSans }}>Loading marketplace loop…</Card>}

        {dashboard && (
          <>
            <div className="gp-market-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 22 }}>
              {[
                ["Access categories", dashboard.slots.length],
                ["Marketplace jobs", dashboard.jobs.length],
                ["Quotes", dashboard.quotes.length],
                ["Transactions", dashboard.transactions.length],
                ["Modeled ledger", dashboard.demo ? "Placeholder" : fmtMoney(dashboard.credits.reduce((s, c) => s + c.amountCents, 0))],
              ].map(([label, value]) => (
                <Card key={label} style={{ padding: 18 }}>
                  <Label>{label}</Label>
                  <div style={{ fontFamily: T.fontSans, fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em" }}>{value}</div>
                </Card>
              ))}
            </div>

            <div className="gp-market-main" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.75fr)", gap: 18, alignItems: "start" }}>
              <Card style={{ padding: 22 }}>
                <div className="gp-card-title-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div>
                    <Label>Atomic transaction</Label>
                    <h3 style={{ fontFamily: T.fontSans, fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>HOA-approved issue → contractor → modeled fee path → association record</h3>
                  </div>
            <Btn variant="ghost" onClick={() => window.location.href = "/investors#current-status"}>Investor status</Btn>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {dashboard.proofLoop.map((node, index) => <LoopNode key={node.label} index={index} {...node} />)}
                </div>
              </Card>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Card style={{ padding: 20 }}>
                  <Label>{dashboard.demo ? "Modeled economics" : "Transaction economics"}</Label>
                  {dashboard.transactions.map((tx) => (
                    <div key={tx.id} style={{ display: "grid", gap: 10 }}>
                      <div style={{ fontFamily: T.fontSans, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{tx.contractor}</div>
                      <div className="gp-money-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                        <div><Label>Gross job</Label><strong>{fmtMoney(tx.grossAmountCents)}</strong></div>
                        <div><Label>GatePass fee</Label><strong>{fmtMoney(tx.gatepassFeeCents)}</strong></div>
                        <div><Label>Community / homeowner share</Label><strong>{tx.hoaShareCents > 0 ? fmtMoney(tx.hoaShareCents) : "Structure pending"}</strong></div>
                      </div>
                    </div>
                  ))}
                </Card>

                <Card style={{ padding: 20 }}>
                  <Label>Contractor access categories</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {dashboard.slots.map((slot) => (
                      <div key={slot.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingBottom: 9, borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ fontFamily: T.fontSans, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{slot.trade}</div>
                          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: "var(--text-light)" }}>{fmtMoney(slot.priceCents)} after approval · no lead guarantee</div>
                        </div>
                        <Tag>{slot.status}</Tag>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card style={{ padding: 20 }}>
                  <Label>Compliance record generated</Label>
                  {dashboard.complianceRecords.map((record) => (
                    <p key={record.id} style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", lineHeight: 1.55, margin: 0 }}>{record.summary}</p>
                  ))}
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
