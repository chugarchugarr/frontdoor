import PDFDocument from "pdfkit";
import { db } from "@/api/db";

const COLORS = {
  cream: "#F3EFE6",
  forest: "#1F3A2D",
  gold: "#C8A24B",
  charcoal: "#23211C",
};

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export async function buildProofPack(opts: {
  live: boolean;
  hoaId?: string;
}): Promise<Buffer> {
  const where = opts.hoaId ? { hoaId: opts.hoaId } : {};

  const [txns, jobs, quotes, compliance] = await Promise.all([
    db.marketplaceTransaction.findMany({
      where: { ...where, status: { in: ["settled", "paid", "recorded"] } },
      include: { job: true, quote: { include: { contractor: true } }, contractor: true, complianceRecords: true },
      orderBy: { createdAt: "desc" },
    }),
    db.marketplaceJob.findMany({ where }),
    db.contractorQuote.count(),
    db.contractorComplianceRecord.count({ where }),
  ]);

  const gmv = txns.reduce((s, t) => s + t.grossAmountCents, 0);
  const fees = txns.reduce((s, t) => s + t.gatepassFeeCents, 0);
  const credit = txns.reduce((s, t) => s + t.hoaShareCents, 0);

  const doc = new PDFDocument({ size: "LETTER", margin: 54 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((res) => doc.on("end", () => res(Buffer.concat(chunks))));

  const W = doc.page.width;
  const M = 54;

  doc.rect(0, 0, W, 150).fill(COLORS.forest);
  doc.fill(COLORS.gold).fontSize(11).text("GATEPASS", M, 44, { characterSpacing: 3 });
  doc.fill(COLORS.cream).fontSize(28).text("Marketplace Proof Pack", M, 64);
  const banner = opts.live ? "LIVE RECORDS" : "DEMO — NOT LIVE TRACTION";
  doc.fill(opts.live ? COLORS.gold : "#E0726A").fontSize(12).text(banner, M, 108, { characterSpacing: 2 });
  doc.fill(COLORS.cream).fontSize(10).text(new Date().toLocaleString("en-US"), W - M - 160, 112, { width: 160, align: "right" });

  doc.fill(COLORS.charcoal);
  let y = 184;
  const stat = (label: string, value: string, x: number) => {
    doc.fill(COLORS.gold).fontSize(9).text(label.toUpperCase(), x, y, { characterSpacing: 1.5 });
    doc.fill(COLORS.forest).fontSize(22).text(value, x, y + 12);
  };
  const col = (W - M * 2) / 3;
  stat("Settled GMV", usd(gmv), M);
  stat("GatePass fees", usd(fees), M + col);
  stat("HOA credit", usd(credit), M + col * 2);
  y += 60;
  stat("Jobs", String(jobs.length), M);
  stat("Quotes", String(quotes), M + col);
  stat("Compliance records", String(compliance), M + col * 2);
  y += 70;

  doc.fill(COLORS.forest).fontSize(14).text("The atomic loop", M, y);
  y += 22;
  const loop = [
    "PMC / compliance pain — board-owned operating layer",
    "Contractor access slot opens by trade + community",
    "Job routes through GatePass (work order / ARC)",
    "Contractor quote — board approval",
    "Transaction settles: GatePass fee + HOA credit",
    "Completed work becomes compliance memory",
  ];
  doc.fontSize(10).fill(COLORS.charcoal);
  loop.forEach((line, i) => {
    doc.fill(COLORS.gold).text(`${String(i + 1).padStart(2, "0")}`, M, y, { continued: true })
      .fill(COLORS.charcoal).text(`  ${line}`);
    y += 16;
  });
  y += 14;

  doc.fill(COLORS.forest).fontSize(14).text("Settled transactions", M, y);
  y += 20;
  doc.fontSize(8.5).fill(COLORS.gold);
  doc.text("CONTRACTOR", M, y, { width: 130 });
  doc.text("JOB", M + 130, y, { width: 150 });
  doc.text("GROSS", M + 285, y, { width: 70, align: "right" });
  doc.text("FEE", M + 360, y, { width: 60, align: "right" });
  doc.text("HOA", M + 425, y, { width: 60, align: "right" });
  y += 14;
  doc.fill(COLORS.charcoal).fontSize(9);
  if (txns.length === 0) {
    doc.text("No settled transactions yet.", M, y);
    y += 16;
  }
  for (const txn of txns) {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = M;
    }
    doc.text(txn.contractor.company, M, y, { width: 130 });
    doc.text(txn.job.title, M + 130, y, { width: 150 });
    doc.text(usd(txn.grossAmountCents), M + 285, y, { width: 70, align: "right" });
    doc.text(usd(txn.gatepassFeeCents), M + 360, y, { width: 60, align: "right" });
    doc.text(usd(txn.hoaShareCents), M + 425, y, { width: 60, align: "right" });
    y += 16;
  }

  const footY = doc.page.height - 64;
  doc.moveTo(M, footY).lineTo(W - M, footY).strokeColor(COLORS.gold).stroke();
  doc.fontSize(8).fill(COLORS.charcoal).text(
    opts.live
      ? "All figures derive from stored MarketplaceTransaction records. Demo data is excluded unless the route is explicitly called with demo=true."
      : "DEMO EXPORT. Figures are illustrative and must not be presented as live traction.",
    M,
    footY + 8,
    { width: W - M * 2, lineBreak: false, height: 30 }
  );

  doc.end();
  return done;
}
