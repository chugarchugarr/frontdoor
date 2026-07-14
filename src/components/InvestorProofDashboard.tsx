import React from "react";
import { useQuery } from "@tanstack/react-query";
import { client as rpc } from "@/lib/client";
import { T, GLOBAL_CSS } from "./tokens";
import { Btn, Card, Label, SectionHeader, Tag } from "./ui-kit";

const DEMO_HOA_ID = "cmprlyrux00005etlni6qod8x";
const fmtMoney = (cents: number) => `$${Math.round(cents / 100).toLocaleString()}`;

type ProofMetrics = {
  demo: boolean;
  headline: string;
  metrics: Record<string, number>;
  money: { demoGmvCents: number; gatepassFeeCents: number; hoaCreditsCents: number };
  checklist: { label: string; status: "done" | "demo" | "missing" }[];
  proofLinks: { label: string; href: string; note: string }[];
  caution: string[];
};

export function InvestorProofDashboard({ hoaId = DEMO_HOA_ID, demo = false }: { hoaId?: string; demo?: boolean }) {
  const { data, isLoading } = useQuery<ProofMetrics>({
    queryKey: ["investor-proof", hoaId, demo],
    queryFn: () => rpc.getInvestorProofMetrics({ hoaId, demo }),
  });

  return (
    <div className="gp-investor-shell" style={{ minHeight: "100vh", background: "var(--bg)", padding: 28 }}>
      <style>{GLOBAL_CSS}{`
        @media (max-width: 720px) {
          .gp-investor-shell { padding: 16px !important; }
          .gp-investor-hero { padding: 20px !important; }
          .gp-investor-hero h2 { font-size: 30px !important; line-height: .96 !important; }
          .gp-investor-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
          .gp-investor-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
          .gp-investor-money { grid-template-columns: 1fr !important; }
          .gp-investor-check-row { align-items: flex-start !important; }
          .gp-investor-actions { flex-direction: column !important; }
          .gp-investor-actions button { width: 100% !important; min-height: 44px !important; justify-content: center !important; }
        }
        @media (max-width: 390px) {
          .gp-investor-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <SectionHeader
          title="Investor Proof Dashboard"
          sub="One screen for the $500K SAFE / $6M post-money question: what proof exists, what is demo-only, and what the first paid pilot must finish."
          action={<Tag color={T.gold} bg={T.goldLight}>{data?.demo || demo ? "Demo + real boundary" : "Live records"}</Tag>}
        />

        {isLoading && <Card style={{ padding: 28, color: "var(--text-light)", fontFamily: T.fontSans }}>Loading investor proof…</Card>}

        {data && (
          <>
            <Card className="gp-investor-hero" style={{ padding: 26, marginBottom: 18, background: T.ink, color: T.white }}>
              <Label style={{ color: "rgba(255,255,255,0.45)" }}>Core investor line</Label>
              <h2 style={{ fontFamily: T.fontSans, fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1, letterSpacing: "-0.055em", marginBottom: 10 }}>{data.headline}</h2>
              <p style={{ fontFamily: T.fontSans, fontSize: 14, color: "rgba(255,255,255,0.58)", lineHeight: 1.65, maxWidth: 740 }}>GatePass starts with board-safe transition and compliance memory, then opens verified contractor access so transactions become proprietary operating records. The export button is the proof: the association owns the record.</p>
            </Card>

            <div className="gp-investor-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
              {Object.entries(data.metrics).map(([label, value]) => (
                <Card key={label} style={{ padding: 18 }}>
                  <Label>{label.replace(/([A-Z])/g, " $1")}</Label>
                  <div style={{ fontFamily: T.fontSans, fontSize: 30, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em" }}>{value}</div>
                </Card>
              ))}
            </div>

            <div className="gp-investor-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
              <Card style={{ padding: 22 }}>
                <Label>Marketplace economics demo</Label>
                <div className="gp-investor-money" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 14 }}>
                  <div><Label>Demo GMV</Label><strong style={{ fontSize: 24 }}>{fmtMoney(data.money.demoGmvCents)}</strong></div>
                  <div><Label>GatePass fee</Label><strong style={{ fontSize: 24 }}>{fmtMoney(data.money.gatepassFeeCents)}</strong></div>
                  <div><Label>Internal ledger</Label><strong style={{ fontSize: 24 }}>{fmtMoney(data.money.hoaCreditsCents)}</strong></div>
                </div>
                <p style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-light)", lineHeight: 1.55, marginTop: 14 }}>These are demo economics until real contractor transactions are processed. Production counts remain honest.</p>
              </Card>

              <Card style={{ padding: 22 }}>
                <Label>First paid pilot checklist</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.checklist.map((item) => (
                    <div className="gp-investor-check-row" key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <span style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", lineHeight: 1.35 }}>{item.label}</span>
                      <Tag color={item.status === "done" ? T.success : item.status === "demo" ? T.gold : T.warn} bg={item.status === "done" ? T.successPale : item.status === "demo" ? T.goldLight : T.warnPale}>{item.status}</Tag>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="gp-investor-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
              <Card style={{ padding: 22 }}>
                <Label>Proof routes</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.proofLinks.map((link) => (
                    <button key={link.href} onClick={() => window.location.href = link.href} style={{ textAlign: "left", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, cursor: "pointer" }}>
                      <div style={{ fontFamily: T.fontSans, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{link.label}</div>
                      <div style={{ fontFamily: T.fontSans, fontSize: 12, color: "var(--text-light)", marginTop: 3 }}>{link.note}</div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card style={{ padding: 22 }}>
                <Label>Honesty boundary</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.caution.map((line) => (
                    <div key={line} style={{ fontFamily: T.fontSans, fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>{line}</div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="gp-investor-actions" style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <Btn variant="gold" onClick={() => window.location.href = "/marketplace-loop"}>View marketplace loop</Btn>
              <Btn variant="ghost" onClick={() => window.location.href = "/demo?view=transition"}>View transition graph</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
