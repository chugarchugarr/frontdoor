import { useState } from "react";
import { client as rpc } from "@/lib/client";

const C = {
  cream: "#F3EFE6",
  forest: "#1F3A2D",
  gold: "#C8A24B",
  charcoal: "#23211C",
  line: "#D9D2C2",
};

type StepKey = "promote" | "access" | "job" | "quote" | "approve" | "settle" | "compliance" | "export";

const STEPS: { key: StepKey; n: string; label: string; verb: string }[] = [
  { key: "promote", n: "01", label: "Promote contractor", verb: "Promote waitlist → profile" },
  { key: "access", n: "02", label: "Open slot + access", verb: "Open slot, grant community access" },
  { key: "job", n: "03", label: "Create job", verb: "Create job from work order / ARC" },
  { key: "quote", n: "04", label: "Submit quote", verb: "Contractor submits quote" },
  { key: "approve", n: "05", label: "Approve quote", verb: "Board approves quote" },
  { key: "settle", n: "06", label: "Settle transaction", verb: "Record fee + internal ledger entry" },
  { key: "compliance", n: "07", label: "Write memory", verb: "Write compliance record" },
  { key: "export", n: "08", label: "Export record pack", verb: "Generate investor PDF" },
];

export default function AdminConsole() {
  const [active, setActive] = useState<StepKey>("promote");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const push = (message: string) => setLog((items) => [`${new Date().toLocaleTimeString()}  ${message}`, ...items].slice(0, 50));

  async function run(step: StepKey, payload: Record<string, string>) {
    setBusy(true);
    try {
      let result: unknown;
      if (step === "promote") result = await rpc.promoteWaitlistToContractorProfile({ waitlistId: payload.waitlistId, trades: payload.trade ? [payload.trade] : undefined, serviceZips: payload.zip ? [payload.zip] : undefined });
      if (step === "access") {
        await rpc.openContractorSlot({ hoaId: payload.hoaId, trade: payload.trade, capacity: Number(payload.capacity || 1), priceCents: Number(payload.priceCents || 9900) });
        result = await rpc.grantContractorCommunityAccess({ contractorId: payload.contractorId, hoaId: payload.hoaId, trade: payload.trade });
      }
      if (step === "job") {
        result = payload.source === "arc"
          ? await rpc.createMarketplaceJobFromARC({ arcRequestId: payload.sourceId, title: payload.title })
          : await rpc.createMarketplaceJobFromWorkOrder({ workOrderId: payload.sourceId, title: payload.title });
      }
      if (step === "quote") result = await rpc.submitContractorQuote({ marketplaceJobId: payload.marketplaceJobId, contractorId: payload.contractorId, amountCents: Number(payload.amountCents), scope: payload.scope });
      if (step === "approve") result = await rpc.approveContractorQuote({ quoteId: payload.quoteId });
      if (step === "settle") result = await rpc.settleMarketplaceTransaction({ quoteId: payload.quoteId, idempotencyKey: payload.idempotencyKey, stripePaymentIntentId: payload.stripePaymentIntentId || undefined });
      if (step === "compliance") result = await rpc.recordCompliance({ transactionId: payload.transactionId, workSummary: payload.workSummary });
      if (step === "export") {
        const pack = await rpc.exportMarketplaceProofPack({ hoaId: payload.hoaId || undefined, demo: payload.demo === "true" });
        const binary = atob(pack.base64);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: pack.mimeType }));
        const a = document.createElement("a");
        a.href = url;
        a.download = pack.filename;
        a.click();
        URL.revokeObjectURL(url);
        result = { opened: pack.filename };
      }
      const id = typeof result === "object" && result && "id" in result ? ` id=${String((result as { id: unknown }).id)}` : "";
      push(`${step}: ok${id}`);
    } catch (error) {
      push(`${step}: ERROR ${error instanceof Error ? error.message : "failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ background: C.cream, color: C.charcoal, minHeight: "100vh", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <style>{`
        @media (max-width: 820px) {
          .gp-admin-header { padding: 16px !important; flex-direction: column !important; gap: 4px !important; align-items: flex-start !important; }
          .gp-admin-header h1 { font-size: 28px !important; line-height: .95 !important; }
          .gp-admin-layout { display: block !important; min-height: auto !important; }
          .gp-admin-nav { border-right: 0 !important; border-bottom: 1px solid ${C.line} !important; padding: 10px 8px !important; display: flex !important; overflow-x: auto !important; gap: 8px !important; -webkit-overflow-scrolling: touch !important; }
          .gp-admin-nav button { width: auto !important; min-width: 138px !important; border-radius: 12px !important; padding: 10px 12px !important; flex: 0 0 auto !important; }
          .gp-admin-main { padding: 22px 16px !important; }
          .gp-admin-main h2 { font-size: 32px !important; line-height: .95 !important; }
          .gp-admin-log { border-left: 0 !important; border-top: 1px solid ${C.line} !important; padding: 18px 16px 28px !important; }
          .gp-admin-form { max-width: none !important; }
          .gp-admin-form input { font-size: 16px !important; min-height: 44px !important; }
          .gp-admin-form button { width: 100% !important; min-height: 44px !important; }
        }
      `}</style>
      <header className="gp-admin-header" style={{ borderBottom: `1px solid ${C.line}`, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, margin: 0, color: C.forest }}>GatePass <span style={{ color: C.gold }}>Operator Console</span></h1>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: C.forest }}>pilot loop · live records</span>
      </header>
      <div className="gp-admin-layout" style={{ display: "grid", gridTemplateColumns: "minmax(180px,260px) 1fr minmax(240px,320px)", minHeight: "calc(100vh - 74px)" }}>
        <nav className="gp-admin-nav" style={{ borderRight: `1px solid ${C.line}`, padding: "16px 0" }}>
          {STEPS.map((step) => {
            const on = step.key === active;
            return <button key={step.key} onClick={() => setActive(step.key)} style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", padding: "12px 24px", display: "flex", gap: 14, alignItems: "baseline", background: on ? C.forest : "transparent", color: on ? C.cream : C.charcoal }}><span style={{ fontFamily: "monospace", fontSize: 12, color: C.gold }}>{step.n}</span><span style={{ fontSize: 14, fontWeight: 600 }}>{step.label}</span></button>;
          })}
        </nav>
        <main className="gp-admin-main" style={{ padding: "32px 36px" }}>
          {STEPS.filter((step) => step.key === active).map((step) => <div key={step.key}><p style={{ color: C.gold, fontFamily: "monospace", fontSize: 12, margin: "0 0 6px" }}>STEP {step.n}</p><h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, margin: "0 0 6px", color: C.forest }}>{step.label}</h2><p style={{ margin: "0 0 24px", opacity: 0.75 }}>{step.verb}</p><StepForm step={step.key} busy={busy} onRun={run} /></div>)}
        </main>
        <aside className="gp-admin-log" style={{ borderLeft: `1px solid ${C.line}`, padding: "20px 22px", background: "#EFEADD" }}>
          <h3 style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: 1, color: C.forest, margin: "0 0 12px" }}>EVENT LOG</h3>
          <div style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.7 }}>{log.length === 0 ? <span style={{ opacity: 0.5 }}>No actions yet.</span> : log.map((line, i) => <div key={i}>{line}</div>)}</div>
        </aside>
      </div>
    </div>
  );
}

function StepForm({ step, busy, onRun }: { step: StepKey; busy: boolean; onRun: (step: StepKey, payload: Record<string, string>) => void }) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const set = (key: string, value: string) => setFields((current) => ({ ...current, [key]: value }));
  const schema: Record<StepKey, { k: string; label: string }[]> = {
    promote: [{ k: "waitlistId", label: "Waitlist ID" }, { k: "trade", label: "Trade override" }, { k: "zip", label: "ZIP override" }],
    access: [{ k: "contractorId", label: "Contractor ID" }, { k: "hoaId", label: "HOA ID" }, { k: "trade", label: "Trade" }, { k: "capacity", label: "Access capacity" }, { k: "priceCents", label: "Access price cents" }],
    job: [{ k: "source", label: "Source: work_order or arc" }, { k: "sourceId", label: "Source ID" }, { k: "title", label: "Title override" }],
    quote: [{ k: "marketplaceJobId", label: "Marketplace Job ID" }, { k: "contractorId", label: "Contractor ID" }, { k: "amountCents", label: "Amount cents" }, { k: "scope", label: "Scope" }],
    approve: [{ k: "quoteId", label: "Quote ID" }],
    settle: [{ k: "quoteId", label: "Quote ID" }, { k: "idempotencyKey", label: "Idempotency key" }, { k: "stripePaymentIntentId", label: "Stripe payment intent" }],
    compliance: [{ k: "transactionId", label: "Transaction ID" }, { k: "workSummary", label: "Work summary" }],
    export: [{ k: "hoaId", label: "HOA ID (optional)" }, { k: "demo", label: "Demo? true/false" }],
  };
  return <div className="gp-admin-form" style={{ maxWidth: 520 }}>{schema[step].map((field) => <label key={field.k} style={{ display: "block", marginBottom: 14 }}><span style={{ display: "block", fontSize: 13, marginBottom: 5, color: C.forest }}>{field.label}</span><input value={fields[field.k] ?? ""} onChange={(event) => set(field.k, event.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.line}`, borderRadius: 6, background: "#fff", fontSize: 16, fontFamily: "monospace" }} /></label>)}<button disabled={busy} onClick={() => onRun(step, fields)} style={{ marginTop: 8, padding: "11px 22px", border: "none", borderRadius: 6, background: busy ? C.line : C.gold, color: C.charcoal, fontWeight: 700, fontSize: 14, cursor: busy ? "wait" : "pointer" }}>{step === "export" ? "Generate record pack" : busy ? "Working…" : "Run step"}</button></div>;
}
