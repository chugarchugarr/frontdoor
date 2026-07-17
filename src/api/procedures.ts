import { db } from "@/api/db";
import { env } from "@/lib/env";
import Stripe from "stripe";
import { Resend } from "resend";
import { queue } from "@/api/queue";
import { getAuth } from "@adaptive-ai/sdk/server";
import { assertJobTransition, assertQuoteTransition, computeSplit } from "@/api/marketplace.guards";
import { CONTRACTOR_FOUNDING_SEAT_CAPACITY } from "@/lib/contractorInventory";

const DEMO_HOA_ID = "cmprlyrux00005etlni6qod8x";

const DEMO_NOW = () => new Date().toISOString();
const DEMO_FUTURE = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

function isDemoHoa(hoaId: string) {
  return hoaId === DEMO_HOA_ID;
}

function demoHomeowners() {
  return [
    { id: "demo-hw-1", hoaId: DEMO_HOA_ID, name: "Sample Resident 1", email: "resident1@example.invalid", phone: null, address: "Modeled Address 1", unit: null, role: "director", active: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), duesAccount: { id: "demo-dues-1", homeownerId: "demo-hw-1", balanceCents: 0, monthlyDueCents: 18500, stripeCustomerId: null, autopayEnabled: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW() }, _count: { violations: 0, workOrders: 1 } },
    { id: "demo-hw-2", hoaId: DEMO_HOA_ID, name: "Sample Resident 2", email: "resident2@example.invalid", phone: null, address: "Modeled Address 2", unit: null, role: "president", active: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), duesAccount: { id: "demo-dues-2", homeownerId: "demo-hw-2", balanceCents: 18500, monthlyDueCents: 18500, stripeCustomerId: null, autopayEnabled: false, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW() }, _count: { violations: 1, workOrders: 0 } },
    { id: "demo-hw-3", hoaId: DEMO_HOA_ID, name: "Sample Resident 3", email: "resident3@example.invalid", phone: null, address: "Modeled Address 3", unit: null, role: "treasurer", active: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), duesAccount: { id: "demo-dues-3", homeownerId: "demo-hw-3", balanceCents: 0, monthlyDueCents: 18500, stripeCustomerId: null, autopayEnabled: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW() }, _count: { violations: 0, workOrders: 0 } },
    { id: "demo-hw-4", hoaId: DEMO_HOA_ID, name: "Sample Resident 4", email: "resident4@example.invalid", phone: null, address: "Modeled Address 4", unit: null, role: "secretary", active: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), duesAccount: { id: "demo-dues-4", homeownerId: "demo-hw-4", balanceCents: 0, monthlyDueCents: 18500, stripeCustomerId: null, autopayEnabled: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW() }, _count: { violations: 0, workOrders: 0 } },
    { id: "demo-hw-5", hoaId: DEMO_HOA_ID, name: "Sample Resident 5", email: "resident5@example.invalid", phone: null, address: "Modeled Address 5", unit: null, role: "resident", active: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), duesAccount: { id: "demo-dues-5", homeownerId: "demo-hw-5", balanceCents: 0, monthlyDueCents: 18500, stripeCustomerId: null, autopayEnabled: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW() }, _count: { violations: 1, workOrders: 0 } },
    { id: "demo-hw-6", hoaId: DEMO_HOA_ID, name: "Sample Resident 6", email: "resident6@example.invalid", phone: null, address: "Modeled Address 6", unit: null, role: "resident", active: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), duesAccount: { id: "demo-dues-6", homeownerId: "demo-hw-6", balanceCents: 0, monthlyDueCents: 18500, stripeCustomerId: null, autopayEnabled: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW() }, _count: { violations: 1, workOrders: 1 } },
    { id: "demo-hw-7", hoaId: DEMO_HOA_ID, name: "Sample Resident 7", email: "resident7@example.invalid", phone: null, address: "Modeled Address 7", unit: null, role: "resident", active: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), duesAccount: { id: "demo-dues-7", homeownerId: "demo-hw-7", balanceCents: 0, monthlyDueCents: 18500, stripeCustomerId: null, autopayEnabled: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW() }, _count: { violations: 0, workOrders: 0 } },
    { id: "demo-hw-8", hoaId: DEMO_HOA_ID, name: "Sample Resident 8", email: "resident8@example.invalid", phone: null, address: "Modeled Address 8", unit: null, role: "resident", active: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), duesAccount: { id: "demo-dues-8", homeownerId: "demo-hw-8", balanceCents: 0, monthlyDueCents: 18500, stripeCustomerId: null, autopayEnabled: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW() }, _count: { violations: 1, workOrders: 0 } },
    { id: "demo-hw-9", hoaId: DEMO_HOA_ID, name: "Sample Resident 9", email: "resident9@example.invalid", phone: null, address: "Modeled Address 9", unit: null, role: "resident", active: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), duesAccount: { id: "demo-dues-9", homeownerId: "demo-hw-9", balanceCents: 0, monthlyDueCents: 18500, stripeCustomerId: null, autopayEnabled: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW() }, _count: { violations: 0, workOrders: 1 } },
    { id: "demo-hw-10", hoaId: DEMO_HOA_ID, name: "Sample Resident 10", email: "resident10@example.invalid", phone: null, address: "Modeled Address 10", unit: null, role: "resident", active: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), duesAccount: { id: "demo-dues-10", homeownerId: "demo-hw-10", balanceCents: 0, monthlyDueCents: 18500, stripeCustomerId: null, autopayEnabled: true, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW() }, _count: { violations: 1, workOrders: 0 } },
  ];
}

function demoViolations() {
  const hw = demoHomeowners();
  return [
    { id: "demo-v-1", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-2", address: "Modeled Address 2", category: "landscaping", description: "Dead front-yard tree requires board notice before removal deadline.", severity: "moderate", status: "noticed", noticeCount: 1, fineCents: null, reportedBy: "Board", latestNoticeAt: DEMO_NOW(), nextNoticeAt: DEMO_FUTURE(21), resolvedAt: null, notes: null, aiAnalysis: null, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), homeowner: hw[1], notices: [] },
    { id: "demo-v-2", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-5", address: "Modeled Address 5", category: "parking", description: "Trailer parked in driveway past permitted window.", severity: "minor", status: "open", noticeCount: 0, fineCents: null, reportedBy: "Board", latestNoticeAt: null, nextNoticeAt: null, resolvedAt: null, notes: null, aiAnalysis: null, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), homeowner: hw[4], notices: [] },
    { id: "demo-v-3", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-6", address: "Modeled Address 6", category: "architectural", description: "Fence stain color differs from approved palette.", severity: "moderate", status: "open", noticeCount: 0, fineCents: null, reportedBy: "Board", latestNoticeAt: null, nextNoticeAt: null, resolvedAt: null, notes: null, aiAnalysis: null, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), homeowner: hw[5], notices: [] },
    { id: "demo-v-4", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-8", address: "Modeled Address 8", category: "trash", description: "Bins visible from street outside collection window.", severity: "minor", status: "open", noticeCount: 0, fineCents: null, reportedBy: "Board", latestNoticeAt: null, nextNoticeAt: null, resolvedAt: null, notes: null, aiAnalysis: null, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), homeowner: hw[7], notices: [] },
    { id: "demo-v-5", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-10", address: "Modeled Address 10", category: "landscaping", description: "Unapproved front-bed hardscape materials installed.", severity: "moderate", status: "escalated", noticeCount: 2, fineCents: 5000, reportedBy: "Board", latestNoticeAt: DEMO_NOW(), nextNoticeAt: DEMO_FUTURE(14), resolvedAt: null, notes: null, aiAnalysis: null, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), homeowner: hw[9], notices: [] },
  ];
}

function demoWorkOrders() {
  const hw = demoHomeowners();
  return [
    { id: "demo-wo-1", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-1", title: "Pool gate latch repair", description: "North pool gate does not fully self-latch after closing.", category: "pool", location: "North pool gate", priority: "high", status: "open", assignedTo: null, assignedAt: null, estimatedCost: 85000, actualCost: null, completionNotes: null, boardApproved: false, boardApprovedAt: null, dueDate: DEMO_FUTURE(5), aiAnalysis: null, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), homeowner: hw[0] },
    { id: "demo-wo-2", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-6", title: "Common-area irrigation leak", description: "Irrigation box leaking near trail entrance.", category: "landscaping", location: "Trailhead common area", priority: "urgent", status: "assigned", assignedTo: "Demo Landscaping Vendor", assignedAt: DEMO_NOW(), estimatedCost: 120000, actualCost: null, completionNotes: null, boardApproved: true, boardApprovedAt: DEMO_NOW(), dueDate: DEMO_FUTURE(2), aiAnalysis: null, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), homeowner: hw[5] },
    { id: "demo-wo-3", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-9", title: "Entry monument lighting", description: "Two low-voltage fixtures out at main entrance.", category: "electrical", location: "Main monument", priority: "normal", status: "in_progress", assignedTo: "Demo Electrical Vendor", assignedAt: DEMO_NOW(), estimatedCost: 65000, actualCost: null, completionNotes: null, boardApproved: true, boardApprovedAt: DEMO_NOW(), dueDate: DEMO_FUTURE(9), aiAnalysis: null, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), homeowner: hw[8] },
  ];
}

function demoARCRequests() {
  const hw = demoHomeowners();
  return [
    { id: "demo-arc-1", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-1", address: "Modeled Address 1", projectType: "roof", description: "Replace roof using approved dimensional shingles in weathered wood color.", status: "submitted", estimatedCost: 1850000, startDate: null, documentUrls: null, reviewDeadline: DEMO_FUTURE(38), submittedAt: DEMO_NOW(), reviewedBy: null, reviewNotes: null, conditions: null, decidedAt: null, aiAnalysis: null, homeowner: hw[0] },
    { id: "demo-arc-2", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-7", address: "Modeled Address 7", projectType: "fence", description: "Replace rear fence with same height and approved cedar finish.", status: "under_review", estimatedCost: 620000, startDate: null, documentUrls: null, reviewDeadline: DEMO_FUTURE(22), submittedAt: DEMO_NOW(), reviewedBy: null, reviewNotes: null, conditions: null, decidedAt: null, aiAnalysis: null, homeowner: hw[6] },
    { id: "demo-arc-3", hoaId: DEMO_HOA_ID, homeownerId: "demo-hw-8", address: "Modeled Address 8", projectType: "paint", description: "Exterior trim repaint using approved neutral palette.", status: "submitted", estimatedCost: 240000, startDate: null, documentUrls: null, reviewDeadline: DEMO_FUTURE(41), submittedAt: DEMO_NOW(), reviewedBy: null, reviewNotes: null, conditions: null, decidedAt: null, aiAnalysis: null, homeowner: hw[7] },
  ];
}

function demoVotes() {
  return [{ id: "demo-vote-1", hoaId: DEMO_HOA_ID, meetingId: null, title: "Approve pool gate repair budget", description: "Authorize up to $1,200 for north pool gate safety repair.", type: "motion", status: "open", options: JSON.stringify(["Approve", "Reject", "Abstain"]), allowMultiple: false, requiresQuorum: true, quorumCount: 4, closesAt: DEMO_FUTURE(7), resultSummary: null, certifiedAt: null, aiAnalysis: null, createdAt: DEMO_NOW(), updatedAt: DEMO_NOW(), casts: [], meeting: null }];
}

function getStripe() {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

// ─── Health ───────────────────────────────────────────────────────────

export async function health() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    db: await db.$queryRaw`SELECT 1 as result`
      .then(() => "connected")
      .catch(() => "disconnected"),
  };
}

// ─── HOA Onboarding ───────────────────────────────────────────────────

export async function createHOACheckout(input: {
  name: string;
  community: string;
  zip: string;
  units: number;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  plan?: string;
}) {
  const stripe = getStripe();
  const plan = input.plan || "starter";
  const pricePerUnit = plan === "enterprise" ? 3000 : 2000; // cents
  const totalCents = input.units * pricePerUnit;

  const hoa = await db.hOA.create({
    data: {
      name: input.name,
      community: input.community,
      zip: input.zip,
      units: input.units,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      plan,
      pricePerUnit,
    },
  });

  const baseUrl = env.VITE_BASE_URL;
  const planLabel = plan === "enterprise" ? "Enterprise" : "Full Access";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `GatePass ${planLabel} — ${input.community} HOA`,
            description: `${input.units} units × $${pricePerUnit / 100}/unit/year`,
          },
          unit_amount: totalCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: input.contactEmail,
    metadata: { hoaId: hoa.id },
    success_url: `${baseUrl}/?hoa_success=true&id=${hoa.id}`,
    cancel_url: `${baseUrl}/?hoa_cancel=true`,
  });

  await db.hOA.update({
    where: { id: hoa.id },
    data: { stripeSessionId: session.id },
  });

  return { url: session.url, hoaId: hoa.id };
}

export async function createHOAAccessReview(input: {
  community: string;
  zip: string;
  units: number;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  role: string;
  managementSetup: string;
  needsHelpWith: string;
}) {
  const hoa = await db.hOA.create({
    data: {
      name: input.community,
      community: input.community,
      zip: input.zip,
      units: input.units,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      plan: "access_review",
      pricePerUnit: 2000,
      paid: false,
    },
  });

  return {
    ok: true,
    hoaId: hoa.id,
    message: "Access review received. GatePass will follow up before any enrollment or payment.",
  };
}

export async function getHOAStats() {
  const total = await db.hOA.count();
  const paid = await db.hOA.count({ where: { paid: true } });
  const totalUnits = await db.hOA.aggregate({
    _sum: { units: true },
    where: { paid: true },
  });
  const units = totalUnits._sum.units ?? 0;
  return {
    totalHOAs: total,
    paidHOAs: paid,
    totalUnits: units,
    arr: units * 20, // avg $20/unit
  };
}

export async function getHOAList() {
  return db.hOA.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      homeowners: { select: { id: true, role: true } },
      _count: {
        select: {
          violations: true,
          workOrders: true,
          meetings: true,
          arcRequests: true,
        },
      },
    },
  });
}

export async function getHOA(id: string) {
  return db.hOA.findUnique({
    where: { id },
    include: {
      homeowners: true,
      violations: { orderBy: { createdAt: "desc" }, take: 10 },
      meetings: { orderBy: { scheduledAt: "desc" }, take: 5 },
      arcRequests: { orderBy: { submittedAt: "desc" }, take: 10 },
      workOrders: { orderBy: { createdAt: "desc" }, take: 10 },
      amenities: true,
      announcements: { orderBy: { createdAt: "desc" }, take: 5 },
      budgets: { orderBy: { year: "desc" } },
    },
  });
}

// ─── Contractor Waitlist ──────────────────────────────────────────────

export async function createContractorCheckout(input: {
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  category: string;
  zip: string;
}) {
  const stripe = getStripe();
  const count = await db.contractorWaitlist.count();
  if (count >= CONTRACTOR_FOUNDING_SEAT_CAPACITY) throw new Error(`All ${CONTRACTOR_FOUNDING_SEAT_CAPACITY} founding contractor seats are filled.`);
  const position = count + 1;

  const contractor = await db.contractorWaitlist.create({
    data: {
      company: input.company,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      category: input.category,
      zip: input.zip,
      position,
    },
  });

  const baseUrl = env.VITE_BASE_URL;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "GatePass — Founding Contractor Seat",
            description: `${input.category} · Austin Metro · Seat #${position} of ${CONTRACTOR_FOUNDING_SEAT_CAPACITY}`,
          },
          unit_amount: 9900,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: input.email,
    metadata: { contractorId: contractor.id },
    success_url: `${baseUrl}/?contractor_success=true&id=${contractor.id}&pos=${position}`,
    cancel_url: `${baseUrl}/?contractor_cancel=true`,
  });

  await db.contractorWaitlist.update({
    where: { id: contractor.id },
    data: { stripeSessionId: session.id },
  });

  return { url: session.url, contractorId: contractor.id, position };
}

export async function createContractorApplication(input: {
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  category: string;
  zip: string;
}) {
  const count = await db.contractorWaitlist.count();
  const contractor = await db.contractorWaitlist.create({
    data: {
      company: input.company,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      category: input.category,
      zip: input.zip,
      position: count + 1,
      paid: false,
    },
  });

  return {
    ok: true,
    contractorId: contractor.id,
    message: "Application received. Payment happens only after approval.",
  };
}

export async function getContractorStats() {
  const total = await db.contractorWaitlist.count();
  const paid = await db.contractorWaitlist.count({ where: { paid: true } });
  const capacity = CONTRACTOR_FOUNDING_SEAT_CAPACITY;
  const remaining = Math.max(0, capacity - total);
  return { capacity, total, paid, reserved: total, remaining, spotsLeft: remaining };
}

export async function getWaitlistPosition(id: string) {
  return db.contractorWaitlist.findUnique({ where: { id } });
}

// ─── Marketplace Proof Loop ───────────────────────────────────────────

function demoMarketplaceDashboard() {
  return {
    demo: true,
    slots: [
      { id: "demo-slot-roofing", trade: "Roofing", status: "open", capacity: 3, seatsTaken: 1, priceCents: 9900, scarcityLabel: "2 founding seats left" },
      { id: "demo-slot-hvac", trade: "HVAC", status: "open", capacity: 2, seatsTaken: 1, priceCents: 9900, scarcityLabel: "1 founding seat left" },
    ],
    jobs: [
      { id: "demo-job-arc-roof", title: "ARC-approved roof replacement", category: "roofing", status: "quoted", estimatedValueCents: 1850000, source: "ARC request" },
      { id: "demo-job-hvac", title: "Clubhouse HVAC repair", category: "hvac", status: "completed", estimatedValueCents: 180000, source: "Work order" },
    ],
    quotes: [
      { id: "demo-quote-1", contractor: "Hill Country Roofing Co.", amountCents: 1850000, status: "approved", scope: "Replace shingle roof with HOA-approved color/material packet attached." },
    ],
    transactions: [
      { id: "demo-tx-1", grossAmountCents: 1850000, gatepassFeeCents: 92500, hoaShareCents: 0, status: "modeled", contractor: "Demo Roofing Contractor" },
    ],
    credits: [
      { id: "demo-credit-1", amountCents: 0, status: "modeled", memo: "Ledger placeholder only; no community economics promised before legal approval." },
    ],
    complianceRecords: [
      { id: "demo-compliance-1", summary: "Modeled roof replacement linked to ARC approval, contractor status, quote, and compliance record structure. No production payment is implied.", status: "generated" },
    ],
    proofLoop: [
      { label: "Transition review opened", detail: "Board enters through synthetic continuity-risk mapping and redacted compliance review.", value: "Transition" },
      { label: "Contractor application opened", detail: "GatePass accepts a modeled roofing application for Sample Austin HOA after workflow review.", value: "$99 after approval" },
      { label: "Homeowner job routed", detail: "ARC-approved roof replacement becomes a marketplace job instead of a dead lead.", value: "$18.5K job" },
      { label: "Contractor quote approved", detail: "Approved contractor submits modeled scope through GatePass and the board/homeowner approves in demo.", value: "Modeled" },
      { label: "Fee path modeled", detail: "Demo shows where GatePass fee capture would be recorded after real transaction infrastructure exists.", value: "Modeled" },
      { label: "Record generated", detail: "The completed job becomes an exportable association record.", value: "Modeled" },
    ],
  };
}

function demoInvestorProofMetrics() {
  return {
    demo: true,
    headline: "HOA-controlled contractor access.",
    metrics: {
      hoaPipeline: 5,
      transitionCases: 1,
      privateSignals: 0,
      contractorSlotsOpen: 25,
      contractorSignups: 0,
      marketplaceJobs: 2,
      quotesSubmitted: 1,
      complianceRecords: 1,
    },
    money: { demoGmvCents: 1850000, gatepassFeeCents: 92500, hoaCreditsCents: 0 },
    checklist: [
      { label: "Association record screen live", status: "done" as const },
      { label: "Modeled export screen observable", status: "done" as const },
      { label: "Marketplace transaction loop modeled", status: "demo" as const },
      { label: "First paid HOA record", status: "missing" as const },
      { label: "Real contractor payment + webhook", status: "missing" as const },
      { label: "Real proof pack from production HOA", status: "missing" as const },
    ],
    proofLinks: [
      { label: "Contractor access flow", href: "/demo?view=marketplace", note: "Modeled contractor transaction path with boundaries labeled." },
      { label: "Association record", href: "/demo?view=transition", note: "Redacted modeled board record." },
      { label: "Contractor access", href: "/contractors", note: "Austin founding-contractor supply path." },
      { label: "Investor brief", href: "/investors", note: "$500K SAFE at $6M post-money with demo/real boundaries labeled." },
    ],
    caution: [
      "Demo marketplace GMV is not production revenue.",
      "No fake production HOA records were seeded.",
      "Use Austin HOA pipeline, not committed communities, until signed/paid.",
      "Use case-by-case transition support, not cancellation-penalty buyout language.",
    ],
  };
}

function demoTransitionMoat() {
  const now = new Date().toISOString();
  const transitionCase = {
    id: "demo-transition-canyon-managed",
    hoaId: DEMO_HOA_ID,
    currentPmc: "Demo Management Co.",
    priorPmc: null,
    sourceSignal: "synthetic_demo",
    sourceUrl: null,
    signalSummary: "Synthetic demo case showing how a board records management-transition concerns without exposing real contract or stakeholder data.",
    complaintThemes: ["responsiveness", "violations", "board_packet", "contract_exit"],
    contractStatus: "unknown",
    renewalDate: "2026-10-31T05:00:00.000Z",
    noticeWindowDays: null,
    terminationFeeCents: null,
    buyoutOfferedCents: null,
    boardFear: "Continuity risk if records, vendors, and resident communication are scattered across tools.",
    decidingProof: "Redacted transition pack showing motion language, resident announcement, vendor continuity checklist, and compliance export structure.",
    counterMove: "Existing provider may offer operational fixes; GatePass preserves association-owned continuity either way.",
    nextStep: "Use the demo pack to show what an access review would capture after board approval.",
    status: "pilot_scoped",
    transitionScore: 92,
    replicabilityScore: 84,
    dataCompleteness: 88,
    createdAt: now,
    updatedAt: now,
    stakeholders: [] as unknown[],
    moatSignals: [] as unknown[],
  };
  const stakeholders = [
    { id: "demo-stakeholder-president", hoaId: DEMO_HOA_ID, transitionCaseId: transitionCase.id, name: "Demo Board President", role: "president", contact: null, stance: "champion", primaryConcern: "Safe board vote and resident communication", persuasionAngle: "Show the transition is governed, documented, and reversible.", lastInteractionAt: "2026-05-20T19:00:00.000Z", notes: "Redacted synthetic persona for demo only.", createdAt: now, updatedAt: now },
    { id: "demo-stakeholder-treasurer", hoaId: DEMO_HOA_ID, transitionCaseId: transitionCase.id, name: "Demo Treasurer", role: "treasurer", contact: null, stance: "supporter", primaryConcern: "Budget exposure and operating continuity", persuasionAngle: "Compare governed transition cost against record loss and operational disruption.", lastInteractionAt: "2026-05-20T19:00:00.000Z", notes: "Redacted synthetic persona for demo only.", createdAt: now, updatedAt: now },
    { id: "demo-stakeholder-director", hoaId: DEMO_HOA_ID, transitionCaseId: transitionCase.id, name: "Demo Board Director", role: "director", contact: null, stance: "neutral", primaryConcern: "Homeowner confidence during any change", persuasionAngle: "Lead with resident announcement sequence and support continuity.", lastInteractionAt: "2026-05-20T19:00:00.000Z", notes: "Redacted synthetic persona for demo only.", createdAt: now, updatedAt: now },
  ];
  const signals = [
    { id: "demo-signal-continuity", hoaId: DEMO_HOA_ID, transitionCaseId: transitionCase.id, category: "board_objection", label: "Record continuity risk", evidence: "Synthetic board note: records, decisions, and vendor handoffs need to remain association-owned.", source: "synthetic_demo", confidence: "medium", isPubliclyReplicable: false, moatWeight: 5, capturedBy: "GatePass", createdAt: now },
    { id: "demo-signal-vendor", hoaId: DEMO_HOA_ID, transitionCaseId: transitionCase.id, category: "switching_trigger", label: "Vendor continuity checklist", evidence: "Synthetic demo checklist for keeping approved vendors, open work orders, and resident communications visible during transition review.", source: "synthetic_demo", confidence: "medium", isPubliclyReplicable: false, moatWeight: 4, capturedBy: "GatePass", createdAt: now },
    { id: "demo-signal-pack", hoaId: DEMO_HOA_ID, transitionCaseId: transitionCase.id, category: "proof_artifact", label: "Redacted transition pack", evidence: "Demo packet includes board motion, resident announcement, vendor checklist, and compliance timeline export structure.", source: "synthetic_demo", confidence: "medium", isPubliclyReplicable: false, moatWeight: 5, capturedBy: "GatePass", createdAt: now },
  ];
  const demoCase = { ...transitionCase, stakeholders, moatSignals: signals };
  return {
    summary: {
      transitionCases: 1,
      boardStakeholders: stakeholders.length,
      recordSignals: signals.length,
      privateSignals: 3,
      recordWeight: 28,
      averageReplicability: 84,
      complianceEvents: 3,
      legalComplianceEvents: 2,
      investorLine: "Demo only: GatePass creates exportable association records.",
    },
    cases: [demoCase],
    stakeholders,
    signals,
  };
}

export async function createContractorProfile(input: {
  waitlistId?: string;
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  trades: string[];
  serviceZips: string[];
  licenseNumber?: string;
  insuranceStatus?: string;
  screeningStatus?: string;
  notes?: string;
}) {
  return db.contractorProfile.create({
    data: {
      waitlistId: input.waitlistId,
      company: input.company,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      trades: JSON.stringify(input.trades),
      serviceZips: JSON.stringify(input.serviceZips),
      licenseNumber: input.licenseNumber,
      insuranceStatus: input.insuranceStatus ?? "unknown",
      screeningStatus: input.screeningStatus ?? "waitlisted",
      notes: input.notes,
    },
  });
}

export async function promoteWaitlistToContractorProfile(input: { waitlistId: string; trades?: string[]; serviceZips?: string[] }) {
  const waitlist = await db.contractorWaitlist.findUnique({ where: { id: input.waitlistId } });
  if (!waitlist) throw new Error("Waitlist contractor not found");
  return createContractorProfile({
    waitlistId: waitlist.id,
    company: waitlist.company,
    contactName: waitlist.contactName,
    email: waitlist.email,
    phone: waitlist.phone ?? undefined,
    trades: input.trades ?? [waitlist.category],
    serviceZips: input.serviceZips ?? [waitlist.zip],
    screeningStatus: waitlist.paid ? "paid_founding_seat" : "waitlisted",
  });
}

export async function openContractorSlot(input: { hoaId: string; trade: string; capacity?: number; priceCents?: number; scarcityLabel?: string }) {
  return db.contractorSlot.create({ data: { hoaId: input.hoaId, trade: input.trade, capacity: input.capacity ?? 1, priceCents: input.priceCents ?? 9900, scarcityLabel: input.scarcityLabel } });
}

export async function grantContractorCommunityAccess(input: { contractorId: string; hoaId: string; trade: string; status?: string; accessType?: string }) {
  return db.contractorCommunityAccess.upsert({
    where: { contractorId_hoaId_trade: { contractorId: input.contractorId, hoaId: input.hoaId, trade: input.trade } },
    update: { status: input.status ?? "active", accessType: input.accessType ?? "founding_slot", activeFrom: new Date(), activeUntil: null },
    create: { contractorId: input.contractorId, hoaId: input.hoaId, trade: input.trade, status: input.status ?? "active", accessType: input.accessType ?? "founding_slot", activeFrom: new Date() },
  });
}

export async function createMarketplaceJobFromWorkOrder(input: { workOrderId: string; title?: string }) {
  const wo = await db.workOrder.findUnique({ where: { id: input.workOrderId } });
  if (!wo) throw new Error("Work order not found");
  const job = await db.marketplaceJob.create({ data: { hoaId: wo.hoaId, homeownerId: wo.homeownerId, workOrderId: wo.id, category: wo.category, title: input.title ?? wo.title, description: wo.description, estimatedValueCents: wo.estimatedCost, status: "open" } });
  await logComplianceEvent({ hoaId: wo.hoaId, module: "marketplace", eventType: "marketplace.job_created_from_work_order", actorType: "board", actorName: "GatePass Operator", targetType: "marketplace_job", targetId: job.id, targetLabel: job.title, summary: `Marketplace job opened from work order: ${job.title}`, dataSnapshot: { workOrderId: wo.id, category: wo.category, estimatedValueCents: wo.estimatedCost } });
  return job;
}

export async function createMarketplaceJobFromARC(input: { arcRequestId: string; title?: string }) {
  const arc = await db.aRCRequest.findUnique({ where: { id: input.arcRequestId } });
  if (!arc) throw new Error("ARC request not found");
  const job = await db.marketplaceJob.create({ data: { hoaId: arc.hoaId, homeownerId: arc.homeownerId, arcRequestId: arc.id, category: arc.projectType, title: input.title ?? `${arc.projectType} project`, description: arc.description, estimatedValueCents: arc.estimatedCost, status: "open" } });
  await logComplianceEvent({ hoaId: arc.hoaId, module: "marketplace", eventType: "marketplace.job_created_from_arc", actorType: "board", actorName: "GatePass Operator", targetType: "marketplace_job", targetId: job.id, targetLabel: job.title, summary: `Marketplace job opened from ARC request: ${job.title}`, legalFlag: true, legalCategory: "governance", dataSnapshot: { arcRequestId: arc.id, projectType: arc.projectType, estimatedCost: arc.estimatedCost } });
  return job;
}

export async function submitContractorQuote(input: { marketplaceJobId: string; contractorId: string; amountCents: number; scope: string }) {
  return db.$transaction(async (tx) => {
    const job = await tx.marketplaceJob.findUniqueOrThrow({ where: { id: input.marketplaceJobId } });
    const access = await tx.contractorCommunityAccess.findFirst({
      where: { contractorId: input.contractorId, hoaId: job.hoaId, trade: job.category, status: "active" },
    });
    if (!access) throw new Error("Contractor lacks access to this community/trade");
    const quote = await tx.contractorQuote.create({ data: { marketplaceJobId: input.marketplaceJobId, contractorId: input.contractorId, amountCents: input.amountCents, scope: input.scope, status: "submitted" } });
    if (job.status === "open") {
      assertJobTransition(job.status, "quoted");
      await tx.marketplaceJob.update({ where: { id: input.marketplaceJobId }, data: { status: "quoted" } });
    }
    return quote;
  });
}

export async function approveContractorQuote(input: { quoteId: string }) {
  return db.$transaction(async (tx) => {
    const quote = await tx.contractorQuote.findUniqueOrThrow({ where: { id: input.quoteId }, include: { marketplaceJob: true } });
    assertQuoteTransition(quote.status, "approved");
    assertJobTransition(quote.marketplaceJob.status, "approved");
    const approved = await tx.contractorQuote.update({ where: { id: input.quoteId }, data: { status: "approved" }, include: { marketplaceJob: true } });
    await tx.contractorQuote.updateMany({ where: { marketplaceJobId: quote.marketplaceJobId, id: { not: quote.id }, status: "submitted" }, data: { status: "declined" } });
    await tx.marketplaceJob.update({ where: { id: quote.marketplaceJobId }, data: { status: "approved" } });
    return approved;
  });
}

export async function settleMarketplaceTransaction(input: { quoteId: string; idempotencyKey: string; stripePaymentIntentId?: string }): Promise<unknown> {
  return db.$transaction(async (tx) => {
    const existing = await tx.marketplaceTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;
    const quote = await tx.contractorQuote.findUniqueOrThrow({ where: { id: input.quoteId }, include: { marketplaceJob: true } });
    if (quote.status !== "approved") throw new Error("Quote must be approved before settlement");
    const split = computeSplit(quote.amountCents);
    const transaction = await tx.marketplaceTransaction.create({
      data: {
        jobId: quote.marketplaceJobId,
        quoteId: quote.id,
        hoaId: quote.marketplaceJob.hoaId,
        contractorId: quote.contractorId,
        grossAmountCents: split.grossCents,
        gatepassFeeCents: split.gatepassFeeCents,
        hoaShareCents: split.hoaShareCents,
        stripePaymentIntentId: input.stripePaymentIntentId,
        idempotencyKey: input.idempotencyKey,
        status: "settled",
        settledAt: new Date(),
      },
    });
    await tx.marketplaceJob.update({ where: { id: quote.marketplaceJobId }, data: { status: "in_progress" } });
    return transaction;
  });
}

export async function recordMarketplaceTransaction(input: { jobId: string; quoteId?: string; contractorId: string; grossAmountCents: number; gatepassFeeCents: number; hoaShareCents: number; stripePaymentIntentId?: string; status?: string; idempotencyKey?: string }): Promise<unknown> {
  if (input.quoteId && input.idempotencyKey) {
    return settleMarketplaceTransaction({ quoteId: input.quoteId, idempotencyKey: input.idempotencyKey, stripePaymentIntentId: input.stripePaymentIntentId });
  }
  const job = await db.marketplaceJob.findUnique({ where: { id: input.jobId } });
  if (!job) throw new Error("Marketplace job not found");
  const tx = await db.marketplaceTransaction.create({ data: { jobId: input.jobId, quoteId: input.quoteId, hoaId: job.hoaId, contractorId: input.contractorId, grossAmountCents: input.grossAmountCents, gatepassFeeCents: input.gatepassFeeCents, hoaShareCents: input.hoaShareCents, stripePaymentIntentId: input.stripePaymentIntentId, idempotencyKey: input.idempotencyKey, status: input.status ?? "recorded", settledAt: input.status === "settled" ? new Date() : undefined } });
  await db.marketplaceJob.update({ where: { id: input.jobId }, data: { status: input.status === "settled" ? "in_progress" : "completed" } });
  return tx;
}

export async function recordCompliance(input: { transactionId: string; workSummary: string }): Promise<unknown> {
  return db.$transaction(async (tx) => {
    const transaction = await tx.marketplaceTransaction.findUniqueOrThrow({ where: { id: input.transactionId }, include: { job: true } });
    if (transaction.status !== "settled" && transaction.status !== "paid" && transaction.status !== "recorded") {
      throw new Error("Cannot write a record for an unsettled transaction");
    }
    if (transaction.job.status === "in_progress") assertJobTransition(transaction.job.status, "completed");
    const record = await tx.contractorComplianceRecord.create({
      data: {
        transactionId: transaction.id,
        contractorId: transaction.contractorId,
        hoaId: transaction.hoaId,
        marketplaceJobId: transaction.jobId,
        summary: input.workSummary,
        status: "generated",
        completedAt: new Date(),
      },
    });
    await tx.marketplaceJob.update({ where: { id: transaction.jobId }, data: { status: "completed" } });
    return record;
  });
}

export async function refundMarketplaceTransaction(input: { stripePaymentIntentId: string }): Promise<unknown> {
  return db.marketplaceTransaction.updateMany({ where: { stripePaymentIntentId: input.stripePaymentIntentId }, data: { status: "refunded" } });
}

export async function recordCommunityRevenueShare(input: { hoaId: string; transactionId?: string; amountCents: number; type?: string; status?: string; appliedTo?: string; memo?: string }) {
  const credit = await db.communityRevenueShare.create({ data: { hoaId: input.hoaId, transactionId: input.transactionId, amountCents: input.amountCents, type: input.type ?? "transaction_share", status: input.status ?? "earned", appliedTo: input.appliedTo, memo: input.memo } });
  await logComplianceEvent({ hoaId: input.hoaId, module: "marketplace", eventType: "marketplace.community_revenue_share", actorType: "system", actorName: "GatePass", targetType: "community_revenue_share", targetId: credit.id, targetLabel: input.memo ?? "Internal marketplace ledger entry", summary: `Internal marketplace ledger entry recorded: $${(input.amountCents / 100).toLocaleString()}`, legalFlag: true, legalCategory: "financial", dataSnapshot: input });
  return credit;
}

export async function getMarketplaceDashboard(input: { hoaId: string; demo?: boolean }) {
  if (input.demo || input.hoaId === DEMO_HOA_ID) return demoMarketplaceDashboard();
  const [slots, jobs, quotes, transactions, credits, complianceRecords] = await Promise.all([
    db.contractorSlot.findMany({ where: { hoaId: input.hoaId }, orderBy: { createdAt: "desc" } }),
    db.marketplaceJob.findMany({ where: { hoaId: input.hoaId }, orderBy: { createdAt: "desc" } }),
    db.contractorQuote.findMany({ where: { marketplaceJob: { hoaId: input.hoaId } }, include: { contractor: true }, orderBy: { createdAt: "desc" } }),
    db.marketplaceTransaction.findMany({ where: { hoaId: input.hoaId }, include: { contractor: true }, orderBy: { createdAt: "desc" } }),
    db.communityRevenueShare.findMany({ where: { hoaId: input.hoaId }, orderBy: { createdAt: "desc" } }),
    db.contractorComplianceRecord.findMany({ where: { hoaId: input.hoaId }, orderBy: { createdAt: "desc" } }),
  ]);
  return {
    demo: false,
    slots,
    jobs: jobs.map((j) => ({ ...j, source: j.workOrderId ? "Work order" : j.arcRequestId ? "ARC request" : "Manual" })),
    quotes: quotes.map((q) => ({ id: q.id, contractor: q.contractor.company, amountCents: q.amountCents, status: q.status, scope: q.scope })),
    transactions: transactions.map((t) => ({ id: t.id, grossAmountCents: t.grossAmountCents, gatepassFeeCents: t.gatepassFeeCents, hoaShareCents: t.hoaShareCents, status: t.status, contractor: t.contractor.company })),
    credits: credits.map((c) => ({ id: c.id, amountCents: c.amountCents, status: c.status, memo: c.memo ?? c.type })),
    complianceRecords,
    proofLoop: [
      { label: "Transition case", detail: "Open or import a PMC transition case.", value: "Wedge" },
      { label: "Contractor access", detail: "Open permissioned slots by community/trade.", value: `${slots.length} slots` },
      { label: "Marketplace job", detail: "Route ARC/work-order demand into a job.", value: `${jobs.length} jobs` },
      { label: "Quote", detail: "Permissioned contractor submits scope and price.", value: `${quotes.length} quotes` },
      { label: "Transaction", detail: "Record fee capture and internal ledger entry.", value: `${transactions.length} tx` },
      { label: "Association record", detail: "Link completed work back into board-owned records.", value: `${complianceRecords.length} records` },
    ],
  };
}

export async function getInvestorProofMetrics(input: { hoaId: string; demo?: boolean }) {
  if (input.demo || input.hoaId === DEMO_HOA_ID) return demoInvestorProofMetrics();
  const [moat, marketplace, waitlistCount] = await Promise.all([
    getTransitionMoat(input.hoaId),
    getMarketplaceDashboard({ hoaId: input.hoaId }),
    db.contractorWaitlist.count(),
  ]);
  const txs = marketplace.transactions;
  const credits = marketplace.credits;
  return {
    demo: false,
    headline: "HOA-controlled contractor access.",
    metrics: {
      hoaPipeline: await db.hOA.count(),
      transitionCases: moat.summary.transitionCases,
      privateMoatSignals: moat.summary.privateSignals,
      contractorSlotsOpen: Math.max(0, CONTRACTOR_FOUNDING_SEAT_CAPACITY - waitlistCount),
      contractorSignups: waitlistCount,
      marketplaceJobs: marketplace.jobs.length,
      quotesSubmitted: marketplace.quotes.length,
      complianceRecords: moat.summary.complianceEvents,
    },
    money: {
      demoGmvCents: txs.reduce((sum, t) => sum + t.grossAmountCents, 0),
      gatepassFeeCents: txs.reduce((sum, t) => sum + t.gatepassFeeCents, 0),
      hoaCreditsCents: credits.reduce((sum, c) => sum + c.amountCents, 0),
    },
    checklist: [
      { label: "Association record screen live", status: moat.summary.transitionCases ? "done" as const : "missing" as const },
      { label: "Modeled export available", status: moat.summary.complianceEvents ? "done" as const : "missing" as const },
      { label: "Marketplace transaction loop visible", status: marketplace.jobs.length ? "done" as const : "missing" as const },
      { label: "First paid HOA record", status: (await db.hOA.count({ where: { paid: true } })) ? "done" as const : "missing" as const },
      { label: "Real contractor payment + webhook", status: (await db.contractorWaitlist.count({ where: { paid: true } })) ? "done" as const : "missing" as const },
      { label: "Real proof pack from production HOA", status: moat.summary.complianceEvents ? "done" as const : "missing" as const },
    ],
    proofLinks: demoInvestorProofMetrics().proofLinks,
    caution: ["Production counts only. Demo data is labeled separately.", "Use Austin HOA pipeline until signed/paid commitments exist.", "Access support remains case-by-case and board-approved."],
  };
}

export async function exportMarketplaceProofPack(input?: { hoaId?: string; demo?: boolean }): Promise<{ filename: string; mimeType: string; base64: string }> {
  if (input?.demo && process.env.GATEPASS_ALLOW_DEMO !== "true" && env.VITE_NODE_ENV === "production") {
    throw new Error("Demo proof pack disabled in production");
  }
  const { buildProofPack } = await import("@/api/proofPack");
  const pdf = await buildProofPack({ live: !input?.demo, hoaId: input?.hoaId });
  return {
    filename: `gatepass-proof-pack${input?.demo ? "-demo" : ""}.pdf`,
    mimeType: "application/pdf",
    base64: pdf.toString("base64"),
  };
}

// ─── Austin Open Data — Shared helpers ───────────────────────────────

// No app token needed for anonymous access to Austin Open Data (public datasets)
const AUSTIN_API_HEADERS = {};

function fmtDate(d: string | undefined): string | null {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return null;
  }
}

function fmtValue(v: string | undefined): string | null {
  if (!v) return null;
  const n = Number(v);
  return isNaN(n) ? null : `$${n.toLocaleString()}`;
}

// ─── Austin Permit Feed (fixed) ───────────────────────────────────────

export async function getAustinPermits(zip?: string) {
  try {
    const url = new URL("https://data.austintexas.gov/resource/3syk-w9eu.json");
    url.searchParams.set("$limit", "25");
    url.searchParams.set("$order", "issue_date DESC");
    if (zip) {
      url.searchParams.set("$where", `original_zip='${zip}'`);
    }

    const res = await fetch(url.toString(), { headers: AUSTIN_API_HEADERS });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = (await res.json()) as Record<string, string>[];

    return data.map((p) => ({
      id: p.permit_number || String(Math.random()),
      type: p.work_class || p.permit_type_desc || "Permit",
      description: p.description || "",
      address: p.original_address1 || "",
      zip: p.original_zip || zip || "",
      contractor: p.contractor_company_name || p.contractor_full_name || "Unknown Contractor",
      contractorTrade: p.contractor_trade || null,
      contractorPhone: p.contractor_phone || null,
      value: fmtValue(p.total_job_valuation),
      date: fmtDate(p.issue_date),
      status: p.status_current || "Issued",
      projectId: p.project_id || null,
      permitClass: p.permit_class_mapped || p.permit_class || null,
      latitude: p.latitude || null,
      longitude: p.longitude || null,
    }));
  } catch (e) {
    console.warn("[permits] API fallback:", e);
    return MOCK_PERMITS;
  }
}

// ─── Zoning Cases — rezoning/land-use changes near HOA ───────────────

export async function getZoningCases(input?: { councilDistrict?: string; limit?: number }) {
  try {
    const url = new URL("https://data.austintexas.gov/resource/edir-dcnf.json");
    url.searchParams.set("$limit", String(input?.limit ?? 20));
    url.searchParams.set("$order", "application_start_date DESC");
    if (input?.councilDistrict) {
      url.searchParams.set("$where", `council_district='${input.councilDistrict}'`);
    }

    const res = await fetch(url.toString(), { headers: AUSTIN_API_HEADERS });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = (await res.json()) as Record<string, string>[];

    return data.map((c) => ({
      id: c.case_number || c.folderrsn || String(Math.random()),
      caseNumber: c.case_number || "",
      caseName: c.case_name || "",
      caseType: c.case_type || "",
      workType: c.work_type || "",
      status: c.detailed_status || "",
      proposedZoning: c.proposed_zoning || null,
      existingZoning: c.existing_zoning || null,
      proposedLandUse: c.proposed_land_use || null,
      existingLandUse: c.existing_land_use || null,
      siteAddress: c.site_address || "",
      councilDistrict: c.council_district || null,
      applicationDate: fmtDate(c.application_start_date),
      statusDate: fmtDate(c.status_date),
      ownerName: c.owner_fullname || null,
      caseManager: c.case_manager || null,
      // Flag as high-interest if it involves residential land use changes
      isResidentialImpact: !!(
        c.proposed_land_use?.toLowerCase().includes("residential") ||
        c.existing_land_use?.toLowerCase().includes("residential") ||
        c.proposed_zoning?.toLowerCase().startsWith("sf") ||
        c.proposed_zoning?.toLowerCase().startsWith("mf")
      ),
    }));
  } catch (e) {
    console.warn("[zoning] API error:", e);
    return [];
  }
}

// ─── Zoning By Address ────────────────────────────────────────────────

export async function getZoningByAddress(input: { streetName: string }) {
  try {
    const namePart = input.streetName.toUpperCase().replace(/[^A-Z0-9 ]/g, "");
    const url = new URL("https://data.austintexas.gov/resource/nbzi-qabm.json");
    url.searchParams.set("$where", `full_street_name like '%${namePart}%'`);
    url.searchParams.set("$limit", "10");

    const res = await fetch(url.toString(), { headers: AUSTIN_API_HEADERS });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = (await res.json()) as Record<string, string>[];

    return data.map((z) => ({
      streetName: z.full_street_name || "",
      zoningType: z.zoning_ztype || "",
      baseZone: z.base_zone || "",
      baseZoneCategory: z.base_zone_category || "",
    }));
  } catch (e) {
    console.warn("[zoning-address] API error:", e);
    return [];
  }
}

// ─── Permit Applications (pipeline — applied, not yet issued) ─────────

export async function getPermitApplications(input?: { zip?: string; limit?: number }) {
  try {
    const url = new URL("https://data.austintexas.gov/resource/ryhf-m453.json");
    url.searchParams.set("$limit", String(input?.limit ?? 25));
    url.searchParams.set("$order", "applieddate DESC");
    if (input?.zip) {
      url.searchParams.set("$where", `original_zip='${input.zip}'`);
    }

    const res = await fetch(url.toString(), { headers: AUSTIN_API_HEADERS });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = (await res.json()) as Record<string, string>[];

    return data.map((p) => ({
      id: p.permit_number || String(Math.random()),
      type: p.work_class || p.permit_type_desc || "Application",
      description: p.description || "",
      address: p.original_address1 || "",
      zip: p.original_zip || input?.zip || "",
      applicant: p.applicant_full_name || p.applicant_org || "Unknown",
      contractor: p.contractor_company_name || p.contractor_full_name || null,
      value: fmtValue(p.total_job_valuation),
      appliedDate: fmtDate(p.applieddate),
      status: p.status_current || "Applied",
      permitClass: p.permit_class_mapped || p.permit_class || null,
    }));
  } catch (e) {
    console.warn("[permit-applications] API error:", e);
    return [];
  }
}

// ─── Live City Feeds — aggregated payload ────────────────────────────

export async function getLiveCityFeeds(input?: { zip?: string; councilDistrict?: string }) {
  const [permits, zoningCases, applications] = await Promise.allSettled([
    getAustinPermits(input?.zip),
    getZoningCases({ councilDistrict: input?.councilDistrict }),
    getPermitApplications({ zip: input?.zip }),
  ]);

  return {
    permits: permits.status === "fulfilled" ? permits.value : [],
    zoningCases: zoningCases.status === "fulfilled" ? zoningCases.value : [],
    applications: applications.status === "fulfilled" ? applications.value : [],
    lastUpdated: new Date().toISOString(),
  };
}

const MOCK_PERMITS = [
  { id: "1", type: "Roof Replacement", description: "Remove and replace asphalt shingle roof", address: "Modeled Austin Address", zip: "78752", contractor: "Demo Roofing Company", contractorTrade: "General Contractor", contractorPhone: null, value: "$14,200", date: "Mar 8, 2026", status: "Final", projectId: null, permitClass: "Residential", latitude: null, longitude: null },
  { id: "2", type: "Foundation Repair", description: "Foundation leveling and pier installation", address: "1203 Elm St", zip: "78752", contractor: "Bedrock Foundation", contractorTrade: "General Contractor", contractorPhone: null, value: "$8,900", date: "Mar 5, 2026", status: "Active", projectId: null, permitClass: "Residential", latitude: null, longitude: null },
  { id: "3", type: "HVAC Replacement", description: "Full HVAC system replacement", address: "4521 Lamar Blvd", zip: "78751", contractor: "CoolAir Systems", contractorTrade: "Mechanical", contractorPhone: null, value: "$11,600", date: "Feb 28, 2026", status: "Active", projectId: null, permitClass: "Residential", latitude: null, longitude: null },
  { id: "4", type: "Electrical Panel", description: "200A panel upgrade", address: "902 Congress Ave", zip: "78701", contractor: "BrightWire Electric", contractorTrade: "Electrical", contractorPhone: null, value: "$4,800", date: "Feb 25, 2026", status: "Final", projectId: null, permitClass: "Residential", latitude: null, longitude: null },
  { id: "5", type: "Water Heater", description: "Tankless water heater installation", address: "3317 Red River St", zip: "78705", contractor: "AquaFlow Plumbing", contractorTrade: "Plumbing", contractorPhone: null, value: "$3,400", date: "Feb 22, 2026", status: "Active", projectId: null, permitClass: "Residential", latitude: null, longitude: null },
  { id: "6", type: "Solar Installation", description: "18-panel rooftop solar array", address: "6782 Burnet Rd", zip: "78757", contractor: "SunPower Austin", contractorTrade: "Electrical", contractorPhone: null, value: "$28,000", date: "Feb 20, 2026", status: "Active", projectId: null, permitClass: "Residential", latitude: null, longitude: null },
];

// ─── Homeowners ───────────────────────────────────────────────────────

export async function addHomeowner(input: {
  hoaId: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  unit?: string;
  role?: string;
  monthlyDueCents?: number;
}) {
  const homeowner = await db.homeowner.create({
    data: {
      hoaId: input.hoaId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      unit: input.unit,
      role: input.role || "resident",
    },
  });

  // Create dues account
  await db.duesAccount.create({
    data: {
      homeownerId: homeowner.id,
      monthlyDueCents: input.monthlyDueCents || 0,
    },
  });

  logComplianceEvent({
    hoaId: input.hoaId, module: "core", eventType: "homeowner.added",
    actorType: "board", actorName: "Board",
    targetType: "unit", targetId: homeowner.id, targetLabel: input.address,
    summary: `Homeowner added: ${input.name} at ${input.address}`,
    legalFlag: false, legalCategory: "governance",
    dataSnapshot: { name: input.name, email: input.email, address: input.address, role: input.role || "resident" },
  });

  return homeowner;
}

export async function getHomeowners(hoaId: string) {
  if (isDemoHoa(hoaId)) return demoHomeowners();
  return db.homeowner.findMany({
    where: { hoaId, active: true },
    include: {
      duesAccount: true,
      _count: {
        select: { violations: true, workOrders: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

// ─── PayOS ────────────────────────────────────────────────────────────

export async function getDuesAccount(homeownerId: string) {
  return db.duesAccount.findUnique({
    where: { homeownerId },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 24 },
      homeowner: { select: { name: true, address: true, email: true } },
    },
  });
}

export async function chargeMonthlyDues(hoaId: string) {
  // Charge all homeowners in this HOA their monthly dues
  const accounts = await db.duesAccount.findMany({
    where: {
      homeowner: { hoaId, active: true },
      monthlyDueCents: { gt: 0 },
    },
    include: { homeowner: true },
  });

  const results = [];
  for (const acct of accounts) {
    if (acct.monthlyDueCents > 0) {
      const tx = await db.transaction.create({
        data: {
          duesAccountId: acct.id,
          type: "charge",
          amountCents: acct.monthlyDueCents,
          description: `Monthly dues — ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
          status: "pending",
          dueDate: new Date(new Date().setDate(1)), // first of month
        },
      });
      await db.duesAccount.update({
        where: { id: acct.id },
        data: { balanceCents: { increment: acct.monthlyDueCents } },
      });
      results.push({ homeownerId: acct.homeownerId, transactionId: tx.id, amountCents: acct.monthlyDueCents });

      logComplianceEvent({
        hoaId, module: "payos", eventType: "dues.charged",
        actorType: "system", actorName: "GatePass System",
        targetType: "dues_account", targetId: acct.id, targetLabel: acct.homeowner.address,
        summary: `Monthly dues charged: ${acct.homeowner.name} — $${(acct.monthlyDueCents / 100).toFixed(2)} for ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
        legalFlag: true, legalCategory: "financial",
        dataSnapshot: { homeownerId: acct.homeownerId, amountCents: acct.monthlyDueCents, transactionId: tx.id },
      });
    }
  }
  return { charged: results.length, results };
}

export async function recordPayment(input: {
  duesAccountId: string;
  amountCents: number;
  description?: string;
  stripePaymentIntentId?: string;
}) {
  const tx = await db.transaction.create({
    data: {
      duesAccountId: input.duesAccountId,
      type: "payment",
      amountCents: input.amountCents,
      description: input.description || "Dues payment",
      status: "completed",
      paidAt: new Date(),
      stripePaymentIntentId: input.stripePaymentIntentId,
    },
  });

  await db.duesAccount.update({
    where: { id: input.duesAccountId },
    data: { balanceCents: { decrement: input.amountCents }, lastChargedAt: new Date() },
  });

  logComplianceEvent({
    hoaId: (await db.duesAccount.findUnique({ where: { id: input.duesAccountId }, include: { homeowner: { select: { hoaId: true, name: true, address: true } } } }))?.homeowner.hoaId ?? "unknown",
    module: "payos", eventType: "payment.received",
    actorType: "homeowner", actorName: "Homeowner",
    targetType: "dues_account", targetId: input.duesAccountId,
    summary: `Payment received: $${(input.amountCents / 100).toFixed(2)}${input.description ? ` — ${input.description}` : ""}`,
    legalFlag: true, legalCategory: "financial",
    dataSnapshot: { amountCents: input.amountCents, description: input.description, stripePaymentIntentId: input.stripePaymentIntentId },
  });

  return tx;
}

export async function getFinancialSummary(hoaId: string) {
  if (isDemoHoa(hoaId)) {
    return {
      totalOutstanding: 18500,
      delinquentCount: 1,
      delinquentAmount: 18500,
      budgetedYTD: 42500000,
      actualYTD: 41120000,
      variance: 1380000,
      homeownerCount: 10,
    };
  }

  const homeowners = await db.homeowner.findMany({
    where: { hoaId, active: true },
    include: { duesAccount: { include: { transactions: { orderBy: { createdAt: "desc" }, take: 1 } } } },
  });

  const totalBalance = homeowners.reduce((sum, h) => sum + (h.duesAccount?.balanceCents ?? 0), 0);
  const delinquent = homeowners.filter((h) => (h.duesAccount?.balanceCents ?? 0) > 0);
  const budgets = await db.budget.findMany({ where: { hoaId }, orderBy: { year: "desc" } });

  const totalBudgeted = budgets.reduce((s, b) => s + b.budgetedCents, 0);
  const totalActual = budgets.reduce((s, b) => s + b.actualCents, 0);

  return {
    totalOutstanding: totalBalance,
    delinquentCount: delinquent.length,
    delinquentAmount: delinquent.reduce((s, h) => s + (h.duesAccount?.balanceCents ?? 0), 0),
    budgetedYTD: totalBudgeted,
    actualYTD: totalActual,
    variance: totalBudgeted - totalActual,
    homeownerCount: homeowners.length,
  };
}

export async function addBudgetLine(input: {
  hoaId: string;
  year: number;
  month?: number;
  category: string;
  name: string;
  budgetedCents: number;
  notes?: string;
}) {
  return db.budget.create({ data: input });
}

// ─── FineBot: Violations ──────────────────────────────────────────────

export async function createViolation(input: {
  hoaId: string;
  homeownerId?: string;
  address: string;
  category: string;
  description: string;
  severity?: string;
  reportedBy?: string;
  photoUrls?: string[];
}) {
  const violation = await db.violation.create({
    data: {
      hoaId: input.hoaId,
      homeownerId: input.homeownerId,
      address: input.address,
      category: input.category,
      description: input.description,
      severity: input.severity || "minor",
      reportedBy: input.reportedBy,
      photoUrls: input.photoUrls ? JSON.stringify(input.photoUrls) : null,
      nextNoticeAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  logComplianceEvent({
    hoaId: input.hoaId, module: "finebot", eventType: "violation.created",
    actorType: "board", actorName: input.reportedBy || "Board",
    targetType: "unit", targetId: violation.id, targetLabel: input.address,
    summary: `Violation logged at ${input.address}: ${input.category} (${input.severity || "minor"})`,
    legalFlag: false, legalCategory: "enforcement",
    dataSnapshot: { category: input.category, description: input.description, severity: input.severity },
  });
  return violation;
}

export async function getViolations(hoaId: string) {
  if (isDemoHoa(hoaId)) return demoViolations();
  return db.violation.findMany({
    where: { hoaId },
    include: {
      homeowner: { select: { name: true, email: true } },
      notices: { orderBy: { sentAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function sendViolationNotice(violationId: string) {
  const violation = await db.violation.findUnique({
    where: { id: violationId },
    include: { homeowner: true, notices: true },
  });
  if (!violation) throw new Error("Violation not found");

  const noticeNumber = violation.notices.length + 1;
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const fineAmounts: Record<number, number> = { 1: 0, 2: 5000, 3: 10000 }; // $0, $50, $100
  const fineCents = fineAmounts[noticeNumber] ?? 15000;

  const body = `
Dear ${violation.homeowner?.name || "Resident"},

This is Notice #${noticeNumber} regarding a violation at ${violation.address}.

Category: ${violation.category.toUpperCase()}
Description: ${violation.description}

${noticeNumber > 1 ? `A fine of $${fineCents / 100} has been assessed.` : "Please remedy this violation within 30 days."}

Deadline: ${dueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

This is an automated notice from GatePass HOA OS.
  `.trim();

  const notice = await db.violationNotice.create({
    data: {
      violationId,
      noticeNumber,
      sentTo: violation.homeowner?.email || violation.address,
      dueDate,
      body,
    },
  });

  await db.violation.update({
    where: { id: violationId },
    data: {
      noticeCount: { increment: 1 },
      latestNoticeAt: new Date(),
      nextNoticeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: noticeNumber >= 3 ? "escalated" : "noticed",
      fineCents: noticeNumber > 1 ? fineCents : null,
    },
  });

  // Send email notice via Resend (non-blocking)
  sendViolationNoticeEmail(violationId).catch((e) =>
    console.error("[sendViolationNotice] email failed:", e)
  );

  logComplianceEvent({
    hoaId: violation.hoaId, module: "finebot", eventType: "violation.notice_sent",
    actorType: "system", actorName: "GatePass System",
    targetType: "unit", targetId: violationId, targetLabel: violation.address,
    summary: `Notice #${noticeNumber} sent to ${violation.address}: ${violation.category}${fineCents > 0 ? ` — fine: $${fineCents / 100}` : ""}`,
    legalFlag: true, legalCategory: "enforcement",
    dataSnapshot: { noticeNumber, fineCents, dueDate: dueDate.toISOString(), sentTo: notice.sentTo },
  });

  return { notice, noticeNumber, fineCents };
}

export async function resolveViolation(violationId: string, notes?: string) {
  const violation = await db.violation.findUnique({ where: { id: violationId } });
  const result = await db.violation.update({
    where: { id: violationId },
    data: { status: "resolved", resolvedAt: new Date(), notes },
  });
  if (violation) {
    logComplianceEvent({
      hoaId: violation.hoaId, module: "finebot", eventType: "violation.resolved",
      actorType: "board", actorName: "Board",
      targetType: "unit", targetId: violationId, targetLabel: violation.address,
      summary: `Violation resolved — ${violation.address} confirmed compliant`,
      legalFlag: false, legalCategory: "enforcement",
      dataSnapshot: { category: violation.category, notes },
    });
  }
  return result;
}

// ─── ARC Agent ────────────────────────────────────────────────────────

export async function submitARCRequest(input: {
  hoaId: string;
  homeownerId: string;
  address: string;
  projectType: string;
  description: string;
  estimatedCost?: number;
  startDate?: string;
  documentUrls?: string[];
}) {
  const reviewDeadline = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000); // 45 days

  return db.aRCRequest.create({
    data: {
      hoaId: input.hoaId,
      homeownerId: input.homeownerId,
      address: input.address,
      projectType: input.projectType,
      description: input.description,
      estimatedCost: input.estimatedCost,
      startDate: input.startDate ? new Date(input.startDate) : null,
      documentUrls: input.documentUrls ? JSON.stringify(input.documentUrls) : null,
      reviewDeadline,
    },
  });
}

export async function getARCRequests(hoaId: string) {
  if (isDemoHoa(hoaId)) return demoARCRequests();
  return db.aRCRequest.findMany({
    where: { hoaId },
    include: {
      homeowner: { select: { name: true, email: true, address: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function reviewARCRequest(input: {
  id: string;
  status: "approved" | "denied" | "revision_requested";
  reviewedBy: string;
  reviewNotes?: string;
  conditions?: string;
}) {
  const arc = await db.aRCRequest.findUnique({ where: { id: input.id } });
  const result = await db.aRCRequest.update({
    where: { id: input.id },
    data: {
      status: input.status,
      reviewedBy: input.reviewedBy,
      reviewNotes: input.reviewNotes,
      conditions: input.conditions,
      decidedAt: new Date(),
    },
  });

  // Send decision email via Resend (non-blocking)
  sendARCDecisionEmail(input.id).catch((e) =>
    console.error("[reviewARCRequest] email failed:", e)
  );

  if (arc) {
    const isLegal = input.status === "approved" || input.status === "denied";
    logComplianceEvent({
      hoaId: arc.hoaId, module: "arc",
      eventType: `arc.${input.status}`,
      actorType: "board", actorName: input.reviewedBy,
      targetType: "arc_request", targetId: input.id, targetLabel: `${arc.projectType} at ${arc.address}`,
      summary: `ARC ${input.status}: ${arc.projectType} at ${arc.address}${input.conditions ? ` — conditions: ${input.conditions}` : ""}`,
      legalFlag: isLegal, legalCategory: "governance",
      dataSnapshot: { status: input.status, reviewNotes: input.reviewNotes, conditions: input.conditions },
    });
  }

  return result;
}

// ─── BoardRoom ────────────────────────────────────────────────────────

export async function createMeeting(input: {
  hoaId: string;
  title: string;
  type?: string;
  scheduledAt: string;
  location?: string;
  virtualLink?: string;
  agenda?: string;
  quorumRequired?: number;
}) {
  return db.meeting.create({
    data: {
      hoaId: input.hoaId,
      title: input.title,
      type: input.type || "board",
      scheduledAt: new Date(input.scheduledAt),
      location: input.location,
      virtualLink: input.virtualLink,
      agenda: input.agenda,
      quorumRequired: input.quorumRequired,
    },
  });
}

export async function getMeetings(hoaId: string) {
  return db.meeting.findMany({
    where: { hoaId },
    include: {
      agendaItems: { orderBy: { order: "asc" } },
      votes: { select: { id: true, title: true, status: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });
}

export async function updateMeetingMinutes(input: {
  id: string;
  minutes: string;
  quorumMet?: boolean;
  status?: string;
}) {
  const meeting = await db.meeting.findUnique({ where: { id: input.id } });
  const result = await db.meeting.update({
    where: { id: input.id },
    data: {
      minutes: input.minutes,
      quorumMet: input.quorumMet,
      status: input.status || "completed",
    },
  });
  if (meeting) {
    logComplianceEvent({
      hoaId: meeting.hoaId, module: "boardroom", eventType: "meeting.minutes_recorded",
      actorType: "board", actorName: "Board Secretary",
      targetType: "meeting", targetId: input.id, targetLabel: meeting.title,
      summary: `Meeting minutes recorded: ${meeting.title}`,
      legalFlag: true, legalCategory: "governance",
      dataSnapshot: { quorumMet: input.quorumMet, status: input.status || "completed" },
    });
  }
  return result;
}

export async function addAgendaItem(input: {
  meetingId: string;
  order: number;
  title: string;
  description?: string;
  presenter?: string;
  duration?: number;
}) {
  return db.agendaItem.create({ data: input });
}

// ─── VoteBox ──────────────────────────────────────────────────────────

export async function createVote(input: {
  hoaId: string;
  meetingId?: string;
  title: string;
  description?: string;
  type?: string;
  options: string[];
  allowMultiple?: boolean;
  requiresQuorum?: boolean;
  quorumCount?: number;
  closesAt: string;
}) {
  return db.vote.create({
    data: {
      hoaId: input.hoaId,
      meetingId: input.meetingId,
      title: input.title,
      description: input.description,
      type: input.type || "motion",
      options: JSON.stringify(input.options),
      allowMultiple: input.allowMultiple || false,
      requiresQuorum: input.requiresQuorum ?? true,
      quorumCount: input.quorumCount,
      closesAt: new Date(input.closesAt),
    },
  });
}

export async function getVotes(hoaId: string) {
  if (isDemoHoa(hoaId)) return demoVotes();
  return db.vote.findMany({
    where: { hoaId },
    include: {
      casts: true,
      meeting: { select: { title: true, scheduledAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function castVote(input: {
  voteId: string;
  homeownerId: string;
  selection: string[];
}) {
  const vote = await db.vote.findUnique({ where: { id: input.voteId } });
  if (!vote) throw new Error("Vote not found");
  if (vote.status !== "open") throw new Error("Vote is not open");
  if (new Date() > vote.closesAt) throw new Error("Vote has closed");

  return db.voteCast.create({
    data: {
      voteId: input.voteId,
      homeownerId: input.homeownerId,
      selection: JSON.stringify(input.selection),
    },
  });
}

export async function getVoteResults(voteId: string) {
  const vote = await db.vote.findUnique({
    where: { id: voteId },
    include: { casts: true },
  });
  if (!vote) throw new Error("Vote not found");

  const options = JSON.parse(vote.options) as string[];
  const tallies: Record<string, number> = {};
  for (const opt of options) tallies[opt] = 0;

  for (const cast of vote.casts) {
    const selections = JSON.parse(cast.selection) as string[];
    for (const sel of selections) {
      if (tallies[sel] !== undefined) tallies[sel]++;
    }
  }

  return {
    voteId,
    title: vote.title,
    totalCasts: vote.casts.length,
    quorumMet: vote.quorumCount ? vote.casts.length >= vote.quorumCount : true,
    tallies,
    status: vote.status,
    closesAt: vote.closesAt,
  };
}

export async function closeVote(voteId: string) {
  const voteRecord = await db.vote.findUnique({ where: { id: voteId } });
  const results = await getVoteResults(voteId);
  const winner = Object.entries(results.tallies).sort((a, b) => b[1] - a[1])[0];
  const summary = winner
    ? `Result: "${winner[0]}" — ${winner[1]} votes (${results.totalCasts} total)`
    : "No votes cast";

  const closed = await db.vote.update({
    where: { id: voteId },
    data: { status: "closed", resultSummary: summary, certifiedAt: new Date() },
  });

  if (voteRecord) {
    logComplianceEvent({
      hoaId: voteRecord.hoaId, module: "votebox", eventType: "vote.closed",
      actorType: "system", actorName: "GatePass System",
      targetType: "vote", targetId: voteId, targetLabel: voteRecord.title,
      summary: `Vote closed: "${voteRecord.title}" — ${summary}`,
      legalFlag: true, legalCategory: "governance",
      dataSnapshot: { tallies: results.tallies, totalCasts: results.totalCasts, quorumMet: results.quorumMet },
    });
  }

  return closed;
}

// ─── WorkOrder ────────────────────────────────────────────────────────

export async function createWorkOrder(input: {
  hoaId: string;
  homeownerId?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority?: string;
  estimatedCost?: number;
  dueDate?: string;
}) {
  return db.workOrder.create({
    data: {
      hoaId: input.hoaId,
      homeownerId: input.homeownerId,
      title: input.title,
      description: input.description,
      category: input.category,
      location: input.location,
      priority: input.priority || "normal",
      estimatedCost: input.estimatedCost,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  });
}

export async function getWorkOrders(hoaId: string) {
  if (isDemoHoa(hoaId)) return demoWorkOrders();
  return db.workOrder.findMany({
    where: { hoaId },
    include: {
      homeowner: { select: { name: true, address: true } },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });
}

export async function updateWorkOrder(input: {
  id: string;
  status?: string;
  assignedTo?: string;
  actualCost?: number;
  completionNotes?: string;
  boardApproved?: boolean;
}) {
  const wo = await db.workOrder.findUnique({ where: { id: input.id } });
  const data: Record<string, unknown> = {};
  if (input.status !== undefined) data.status = input.status;
  if (input.assignedTo !== undefined) {
    data.assignedTo = input.assignedTo;
    data.assignedAt = new Date();
    data.status = "assigned";
  }
  if (input.actualCost !== undefined) data.actualCost = input.actualCost;
  if (input.completionNotes !== undefined) {
    data.completionNotes = input.completionNotes;
    data.completedAt = new Date();
    data.status = "completed";
  }
  if (input.boardApproved !== undefined) {
    data.boardApproved = input.boardApproved;
    data.boardApprovedAt = input.boardApproved ? new Date() : null;
  }

  const result = await db.workOrder.update({ where: { id: input.id }, data });

  if (wo) {
    if (input.boardApproved === true) {
      logComplianceEvent({
        hoaId: wo.hoaId, module: "workorder", eventType: "workorder.board_approved",
        actorType: "board", actorName: "Board",
        targetType: "work_order", targetId: input.id, targetLabel: wo.title,
        summary: `Board approved work order: ${wo.title}${wo.estimatedCost ? ` — est. $${wo.estimatedCost / 100}` : ""}`,
        legalFlag: true, legalCategory: "financial",
        dataSnapshot: { title: wo.title, estimatedCost: wo.estimatedCost, location: wo.location },
      });
    } else if (input.completionNotes !== undefined || input.status === "completed") {
      logComplianceEvent({
        hoaId: wo.hoaId, module: "workorder", eventType: "workorder.completed",
        actorType: "system", actorName: "GatePass System",
        targetType: "work_order", targetId: input.id, targetLabel: wo.title,
        summary: `Work order completed: ${wo.title}${input.actualCost ? ` — actual cost $${input.actualCost / 100}` : ""}`,
        legalFlag: false, legalCategory: "contract",
        dataSnapshot: { actualCost: input.actualCost, completionNotes: input.completionNotes },
      });
    }
  }

  return result;
}

// ─── Amenity Reservations ─────────────────────────────────────────────

export async function createAmenity(input: {
  hoaId: string;
  name: string;
  description?: string;
  capacity?: number;
  rules?: string;
  depositCents?: number;
  openTime?: string;
  closeTime?: string;
  advanceBookingDays?: number;
}) {
  return db.amenity.create({ data: input });
}

export async function getAmenities(hoaId: string) {
  return db.amenity.findMany({
    where: { hoaId, active: true },
    include: {
      reservations: {
        where: { date: { gte: new Date().toISOString().slice(0, 10) } },
        include: { homeowner: { select: { name: true } } },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
    },
  });
}

export async function createReservation(input: {
  amenityId: string;
  homeownerId: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount?: number;
  notes?: string;
}) {
  // Check for conflicts
  const existing = await db.reservation.findFirst({
    where: {
      amenityId: input.amenityId,
      date: input.date,
      status: { not: "cancelled" },
      OR: [
        { startTime: { lte: input.startTime }, endTime: { gt: input.startTime } },
        { startTime: { lt: input.endTime }, endTime: { gte: input.endTime } },
        { startTime: { gte: input.startTime }, endTime: { lte: input.endTime } },
      ],
    },
  });

  if (existing) throw new Error("Time slot already reserved");

  return db.reservation.create({ data: input });
}

export async function cancelReservation(id: string) {
  return db.reservation.update({ where: { id }, data: { status: "cancelled" } });
}

// ─── CommHub ──────────────────────────────────────────────────────────

export async function createAnnouncement(input: {
  hoaId: string;
  title: string;
  body: string;
  category?: string;
  pinned?: boolean;
  authorName: string;
  expiresAt?: string;
}) {
  return db.announcement.create({
    data: {
      hoaId: input.hoaId,
      title: input.title,
      body: input.body,
      category: input.category || "general",
      pinned: input.pinned || false,
      authorName: input.authorName,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  });
}

export async function getAnnouncements(hoaId: string) {
  return db.announcement.findMany({
    where: {
      hoaId,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function sendMessage(input: {
  homeownerId: string;
  subject: string;
  body: string;
  direction: "inbound" | "outbound";
  category?: string;
  referenceId?: string;
  referenceType?: string;
}) {
  return db.message.create({ data: input });
}

export async function getMessages(homeownerId: string) {
  return db.message.findMany({
    where: { homeownerId },
    include: { homeowner: { select: { name: true, address: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getHOAMessages(hoaId: string) {
  return db.message.findMany({
    where: { homeowner: { hoaId } },
    include: { homeowner: { select: { name: true, address: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

// ─── OS Dashboard ─────────────────────────────────────────────────────

// ─── Resend Email Helpers ─────────────────────────────────────────────

function getResend() {
  const key = env.RESEND_API_KEY;
  if (!key) throw new Error("Resend not configured");
  return new Resend(key);
}

export async function sendHOAWelcomeEmail(hoaId: string) {
  const hoa = await db.hOA.findUnique({ where: { id: hoaId } });
  if (!hoa) throw new Error("HOA not found");

  const resend = getResend();
  await resend.emails.send({
    from: "GatePass <info@gatepasshoa.com>",
    to: hoa.contactEmail,
    subject: `Welcome to GatePass OS — ${hoa.community}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1C1C1A;">
        <div style="background: #2A5240; padding: 32px 40px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #F4F1EC; font-size: 24px; margin: 0; font-weight: 700;">GatePass OS</h1>
          <p style="color: #B8883A; margin: 6px 0 0; font-size: 14px;">The HOA that runs itself.</p>
        </div>
        <div style="background: #F4F1EC; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e0ddd8; border-top: none;">
          <p style="font-size: 18px; font-weight: 600; margin: 0 0 16px;">You're in, ${hoa.contactName}.</p>
          <p style="color: #555; line-height: 1.7; margin: 0 0 24px;">
            <strong>${hoa.community}</strong> is now live on GatePass OS. Your community's ${hoa.units} units are enrolled on the ${hoa.plan === "full" ? "Full OS" : "Starter"} plan.
          </p>
          <div style="background: white; border: 1px solid #e0ddd8; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
            <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px;">What happens next</p>
            <ul style="margin: 0; padding: 0 0 0 20px; color: #333; line-height: 2;">
              <li>We'll reach out within 24 hours to complete onboarding</li>
              <li>Add your homeowner roster (CSV upload available)</li>
              <li>Configure your first dues cycle</li>
              <li>Activate your 9 OS modules</li>
            </ul>
          </div>
          <p style="color: #888; font-size: 13px; line-height: 1.6;">Questions? Reply to this email or reach us at <a href="mailto:info@gatepasshoa.com" style="color: #2A5240;">info@gatepasshoa.com</a></p>
        </div>
      </div>
    `,
  });
  return { sent: true };
}

export async function sendViolationNoticeEmail(violationId: string) {
  const violation = await db.violation.findUnique({
    where: { id: violationId },
    include: { homeowner: true, hoa: true },
  });
  if (!violation || !violation.homeowner) throw new Error("Violation or homeowner not found");

  const resend = getResend();
  const severityLabel = violation.severity === "high" ? "⚠️ High Priority" : violation.severity === "medium" ? "⚡ Medium Priority" : "ℹ️ Notice";
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  await resend.emails.send({
    from: "GatePass OS <info@gatepasshoa.com>",
    to: violation.homeowner.email,
    subject: `Violation Notice — ${violation.category} · ${violation.hoa.community}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1C1C1A;">
        <div style="background: #2A5240; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <p style="color: #B8883A; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">GatePass OS · ${violation.hoa.community}</p>
          <h1 style="color: #F4F1EC; font-size: 20px; margin: 0;">Violation Notice</h1>
        </div>
        <div style="background: #FFF9F0; border: 2px solid #B8883A; border-top: none; padding: 20px 32px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 13px; color: #888; margin: 0 0 4px;">${severityLabel}</p>
          <p style="font-size: 16px; font-weight: 600; margin: 0 0 16px;">Dear ${violation.homeowner.name},</p>
          <p style="color: #444; line-height: 1.7; margin: 0 0 20px;">
            A violation has been recorded on your property at <strong>${violation.homeowner.address}</strong>:
          </p>
          <div style="background: white; border: 1px solid #e0ddd8; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 6px;"><strong>Type:</strong> ${violation.category}</p>
            ${violation.description ? `<p style="margin: 0 0 6px;"><strong>Description:</strong> ${violation.description}</p>` : ""}
            <p style="margin: 0;"><strong>Correction required by:</strong> ${dueDate}</p>
          </div>
          <p style="color: #555; font-size: 13px; line-height: 1.7;">
            Please address this issue and contact your HOA board to confirm resolution. Unresolved violations may result in fines or escalation per your community's CC&Rs.
          </p>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">This notice was sent by GatePass OS on behalf of ${violation.hoa.community} HOA.</p>
        </div>
      </div>
    `,
  });

  await db.violation.update({
    where: { id: violationId },
    data: { latestNoticeAt: new Date(), noticeCount: { increment: 1 } },
  });

  return { sent: true };
}

export async function sendARCDecisionEmail(arcId: string) {
  const arc = await db.aRCRequest.findUnique({
    where: { id: arcId },
    include: { homeowner: true, hoa: true },
  });
  if (!arc || !arc.homeowner) throw new Error("ARC request or homeowner not found");

  const resend = getResend();
  const approved = arc.status === "approved";
  const statusLabel = approved ? "✅ Approved" : arc.status === "denied" ? "❌ Denied" : "🔄 Revision Required";
  const statusColor = approved ? "#2A5240" : arc.status === "denied" ? "#B91C1C" : "#B8883A";

  await resend.emails.send({
    from: "GatePass OS <info@gatepasshoa.com>",
    to: arc.homeowner.email,
    subject: `ARC Decision: ${arc.projectType} — ${arc.status === "approved" ? "Approved" : "Not Approved"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1C1C1A;">
        <div style="background: ${statusColor}; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">GatePass OS · ${arc.hoa.community}</p>
          <h1 style="color: white; font-size: 20px; margin: 0;">Architectural Review Decision</h1>
        </div>
        <div style="background: #F4F1EC; border: 1px solid #e0ddd8; border-top: none; padding: 28px 32px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; margin: 0 0 6px;">Dear ${arc.homeowner.name},</p>
          <p style="color: #666; line-height: 1.7; margin: 0 0 20px;">The Architectural Review Committee has reviewed your request:</p>
          <div style="background: white; border: 1px solid #e0ddd8; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 6px;"><strong>Project:</strong> ${arc.projectType}</p>
            <p style="margin: 0 0 6px;"><strong>Description:</strong> ${arc.description}</p>
            <p style="margin: 0 0 6px;"><strong>Decision:</strong> <span style="color: ${statusColor}; font-weight: 600;">${statusLabel}</span></p>
            ${arc.reviewNotes ? `<p style="margin: 8px 0 0; padding-top: 8px; border-top: 1px solid #f0ede8; color: #555; font-size: 13px;"><strong>Committee Notes:</strong> ${arc.reviewNotes}</p>` : ""}
          </div>
          ${approved
            ? `<p style="color: #2A5240; font-size: 14px;">You may proceed with your project. Please ensure all work complies with the approved scope and your community's design standards.</p>`
            : `<p style="color: #555; font-size: 14px;">If you have questions about this decision or would like to appeal, please contact your HOA board.</p>`
          }
          <p style="color: #888; font-size: 12px; margin-top: 20px;">GatePass OS · ${arc.hoa.community} HOA</p>
        </div>
      </div>
    `,
  });

  return { sent: true };
}

export async function sendContractorWelcomeEmail(contractorId: string) {
  const contractor = await db.contractorWaitlist.findUnique({ where: { id: contractorId } });
  if (!contractor) throw new Error("Contractor not found");

  const resend = getResend();
  await resend.emails.send({
    from: "GatePass <info@gatepasshoa.com>",
    to: contractor.email,
    subject: `You're #${contractor.position} on the GatePass Founding Contractor list`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1C1C1A;">
        <div style="background: #1C1C1A; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #B8883A; font-size: 22px; margin: 0;">GatePass</h1>
          <p style="color: #888; margin: 4px 0 0; font-size: 13px;">Austin Metro Contractor Network</p>
        </div>
        <div style="background: #F4F1EC; border: 1px solid #e0ddd8; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">Seat locked, ${contractor.contactName}.</p>
          <p style="color: #666; font-size: 28px; font-weight: 700; margin: 0 0 20px; color: #2A5240;">#${contractor.position} of 25</p>
          <p style="color: #555; line-height: 1.7; margin: 0 0 20px;">
            <strong>${contractor.company}</strong> has secured a founding contractor seat for <strong>${contractor.category}</strong> services in the Austin metro. You'll be in the first batch of contractors able to send Digital Knocks to opted-in homeowners.
          </p>
          <div style="background: white; border: 1px solid #e0ddd8; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
            <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 10px;">Founding benefits</p>
            <ul style="margin: 0; padding: 0 0 0 20px; color: #333; line-height: 2; font-size: 14px;">
              <li>Priority access when Austin launches</li>
              <li>Founding rate locked in for life</li>
              <li>Direct line to GatePass team</li>
              <li>Input on contractor features</li>
            </ul>
          </div>
          <p style="color: #888; font-size: 13px;">We'll be in touch as soon as the platform launches in your zip code (${contractor.zip}). Questions? Reply to this email.</p>
        </div>
      </div>
    `,
  });
  return { sent: true };
}

// ─── Stripe Webhook Handler ───────────────────────────────────────────

export async function stripeWebhook(input: { body: string; headers: Record<string, string | string[]> }): Promise<{ received: boolean; duplicate?: boolean }> {
  const stripe = getStripe();
  const sig = input.headers["stripe-signature"] ?? input.headers["Stripe-Signature"];

  let event: Stripe.Event;
  try {
    if (env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(input.body, Array.isArray(sig) ? sig[0] : sig, env.STRIPE_WEBHOOK_SECRET);
    } else if (env.VITE_NODE_ENV !== "production") {
      event = JSON.parse(input.body) as Stripe.Event;
    } else {
      throw new Error("Stripe webhook secret not configured");
    }
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    throw new Error("Invalid webhook signature");
  }

  const seen = await db.processedStripeEvent.findUnique({ where: { id: event.id } });
  if (seen) return { received: true, duplicate: true };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    if (meta.hoaId) {
      await db.hOA.update({ where: { id: meta.hoaId }, data: { paid: true, paidAt: new Date(), amountCents: session.amount_total ?? 0 } });
      sendHOAWelcomeEmail(meta.hoaId).catch((e) => console.error("[stripe-webhook] HOA welcome email failed:", e));
    }

    if (meta.contractorId) {
      await db.contractorWaitlist.update({ where: { id: meta.contractorId }, data: { paid: true, paidAt: new Date() } });
      sendContractorWelcomeEmail(meta.contractorId).catch((e) => console.error("[stripe-webhook] Contractor welcome email failed:", e));
    }

    if (meta.kind === "marketplace_job" && meta.quoteId) {
      await settleMarketplaceTransaction({
        quoteId: meta.quoteId,
        idempotencyKey: event.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      });
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentRef = typeof charge.payment_intent === "string" ? charge.payment_intent : undefined;
    if (paymentRef) await refundMarketplaceTransaction({ stripePaymentIntentId: paymentRef });
  }

  await db.processedStripeEvent.create({ data: { id: event.id, type: event.type } });
  return { received: true };
}

// ─── Homeowner CSV Bulk Import ────────────────────────────────────────

export async function bulkImportHomeowners(input: {
  hoaId: string;
  csv: string; // raw CSV text: name,email,address,unit,phone,monthlyDueCents
}) {
  const lines = input.csv.trim().split("\n");
  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());

  const col = (row: string[], field: string) => {
    const i = header.indexOf(field);
    return i >= 0 ? row[i]?.trim() : undefined;
  };

  const results: { name: string; status: "created" | "skipped"; reason?: string }[] = [];

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const row = line.split(",");
    const name = col(row, "name");
    const email = col(row, "email");
    const address = col(row, "address");

    if (!name || !email || !address) {
      results.push({ name: name ?? "unknown", status: "skipped", reason: "Missing name, email, or address" });
      continue;
    }

    const existing = await db.homeowner.findFirst({ where: { hoaId: input.hoaId, email } });
    if (existing) {
      results.push({ name, status: "skipped", reason: "Email already exists" });
      continue;
    }

    const homeowner = await db.homeowner.create({
      data: {
        hoaId: input.hoaId,
        name,
        email,
        address,
        unit: col(row, "unit"),
        phone: col(row, "phone"),
        role: "resident",
      },
    });

    const monthlyDueCents = Number(col(row, "monthlyduetickets") ?? col(row, "monthly_due_cents") ?? 0);
    await db.duesAccount.create({
      data: { homeownerId: homeowner.id, monthlyDueCents },
    });

    logComplianceEvent({
      hoaId: input.hoaId, module: "core", eventType: "homeowner.added",
      actorType: "board", actorName: "Board (CSV Import)",
      targetType: "unit", targetId: homeowner.id, targetLabel: address,
      summary: `Homeowner added via CSV import: ${name} at ${address}`,
      legalFlag: false, legalCategory: "governance",
      dataSnapshot: { name, email, address },
    });

    results.push({ name, status: "created" });
  }

  return {
    total: results.length,
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    results,
  };
}

// ─── GatePass Metrics (for BD Agent briefing) ─────────────────────────

export async function getGatePassMetrics() {
  const [totalHOAs, paidHOAs, totalHomeowners, openViolations, openWorkOrders, pendingARC, totalContractors, paidContractors] = await Promise.all([
    db.hOA.count(),
    db.hOA.count({ where: { paid: true } }),
    db.homeowner.count({ where: { active: true } }),
    db.violation.count({ where: { status: { in: ["open", "noticed", "escalated"] } } }),
    db.workOrder.count({ where: { status: { in: ["open", "assigned", "in_progress"] } } }),
    db.aRCRequest.count({ where: { status: { in: ["submitted", "under_review"] } } }),
    db.contractorWaitlist.count(),
    db.contractorWaitlist.count({ where: { paid: true } }),
  ]);

  const totalUnitsResult = await db.hOA.aggregate({ _sum: { units: true }, where: { paid: true } });
  const totalUnits = totalUnitsResult._sum.units ?? 0;
  const arr = totalUnits * 20; // $20/unit/year avg

  return {
    hoas: { total: totalHOAs, paid: paidHOAs },
    homeowners: totalHomeowners,
    units: totalUnits,
    arr,
    violations: { open: openViolations },
    workOrders: { open: openWorkOrders },
    arc: { pending: pendingARC },
    contractors: { total: totalContractors, paid: paidContractors, spotsLeft: Math.max(0, 25 - paidContractors) },
  };
}

// ─── Transition Intelligence Graph ────────────────────────────────────
// Public HOA/PMC data is only the acquisition wedge. These procedures capture
// the proprietary PMC exit memory: board psychology, contract blockers,
// transition triggers, proof artifacts, and reusable exit patterns.

type TransitionStatus = "identified" | "contacted" | "meeting" | "exit_pack_sent" | "pilot_scoped" | "won" | "lost" | "parked";
type MoatSignalCategory = "board_objection" | "contract_fact" | "pmc_failure" | "switching_trigger" | "compliance_risk" | "proof_artifact" | "case_study_metric";

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function computeTransitionScores(input: {
  complaintThemes?: string[];
  contractStatus?: string;
  renewalDate?: string;
  noticeWindowDays?: number;
  terminationFeeCents?: number;
  boardFear?: string;
  decidingProof?: string;
  stakeholderCount?: number;
  moatSignalCount?: number;
  privateSignalCount?: number;
}) {
  let readiness = 0;
  let completeness = 0;
  let replicability = 0;

  if ((input.complaintThemes ?? []).length) { readiness += 12; completeness += 12; }
  if (input.contractStatus && input.contractStatus !== "unknown") { readiness += 18; completeness += 15; replicability += 12; }
  if (input.renewalDate || input.noticeWindowDays) { readiness += 14; completeness += 12; replicability += 10; }
  if (input.terminationFeeCents !== undefined) { readiness += 10; completeness += 10; replicability += 8; }
  if (input.boardFear) { readiness += 12; completeness += 12; replicability += 15; }
  if (input.decidingProof) { readiness += 14; completeness += 12; replicability += 15; }
  if ((input.stakeholderCount ?? 0) > 0) { readiness += Math.min(12, (input.stakeholderCount ?? 0) * 4); completeness += 10; replicability += 10; }
  if ((input.moatSignalCount ?? 0) > 0) { completeness += Math.min(17, (input.moatSignalCount ?? 0) * 3); }
  if ((input.privateSignalCount ?? 0) > 0) { replicability += Math.min(30, (input.privateSignalCount ?? 0) * 6); }

  return {
    transitionScore: Math.min(100, readiness),
    dataCompleteness: Math.min(100, completeness),
    replicabilityScore: Math.min(100, replicability),
  };
}

async function refreshTransitionScores(transitionCaseId: string) {
  const tc = await db.transitionCase.findUnique({
    where: { id: transitionCaseId },
    include: { stakeholders: true, moatSignals: true },
  });
  if (!tc) return null;

  const privateSignals = tc.moatSignals.filter((s) => !s.isPubliclyReplicable).length;
  const scores = computeTransitionScores({
    complaintThemes: parseJsonArray(tc.complaintThemes),
    contractStatus: tc.contractStatus,
    renewalDate: tc.renewalDate?.toISOString(),
    noticeWindowDays: tc.noticeWindowDays ?? undefined,
    terminationFeeCents: tc.terminationFeeCents ?? undefined,
    boardFear: tc.boardFear ?? undefined,
    decidingProof: tc.decidingProof ?? undefined,
    stakeholderCount: tc.stakeholders.length,
    moatSignalCount: tc.moatSignals.length,
    privateSignalCount: privateSignals,
  });

  return db.transitionCase.update({ where: { id: transitionCaseId }, data: scores });
}

export async function createTransitionCase(input: {
  hoaId: string;
  currentPmc: string;
  priorPmc?: string;
  sourceSignal: string;
  sourceUrl?: string;
  signalSummary: string;
  complaintThemes: string[];
  contractStatus?: string;
  renewalDate?: string;
  noticeWindowDays?: number;
  terminationFeeCents?: number;
  buyoutOfferedCents?: number;
  boardFear?: string;
  decidingProof?: string;
  counterMove?: string;
  nextStep?: string;
  status?: TransitionStatus;
}) {
  const scores = computeTransitionScores(input);
  const transitionCase = await db.transitionCase.create({
    data: {
      hoaId: input.hoaId,
      currentPmc: input.currentPmc,
      priorPmc: input.priorPmc,
      sourceSignal: input.sourceSignal,
      sourceUrl: input.sourceUrl,
      signalSummary: input.signalSummary,
      complaintThemes: JSON.stringify(input.complaintThemes),
      contractStatus: input.contractStatus ?? "unknown",
      renewalDate: input.renewalDate ? new Date(input.renewalDate) : null,
      noticeWindowDays: input.noticeWindowDays,
      terminationFeeCents: input.terminationFeeCents,
      buyoutOfferedCents: input.buyoutOfferedCents,
      boardFear: input.boardFear,
      decidingProof: input.decidingProof,
      counterMove: input.counterMove,
      nextStep: input.nextStep,
      status: input.status ?? "identified",
      ...scores,
    },
  });

  await logComplianceEvent({
    hoaId: input.hoaId,
    module: "transition",
    eventType: "transition.case_created",
    actorType: "board",
    actorName: "GatePass Operator",
    targetType: "transition_case",
    targetId: transitionCase.id,
    targetLabel: `${input.currentPmc} exit case`,
    summary: `PMC exit case opened for ${input.currentPmc}: ${input.signalSummary}`,
    legalFlag: false,
    legalCategory: "contract",
    dataSnapshot: { sourceSignal: input.sourceSignal, complaintThemes: input.complaintThemes, contractStatus: input.contractStatus },
  });

  return transitionCase;
}

export async function updateTransitionCase(input: {
  id: string;
  contractStatus?: string;
  renewalDate?: string;
  noticeWindowDays?: number;
  terminationFeeCents?: number;
  buyoutOfferedCents?: number;
  boardFear?: string;
  decidingProof?: string;
  counterMove?: string;
  nextStep?: string;
  status?: TransitionStatus;
}) {
  const prior = await db.transitionCase.findUnique({ where: { id: input.id } });
  if (!prior) throw new Error("Transition case not found");

  const updated = await db.transitionCase.update({
    where: { id: input.id },
    data: {
      contractStatus: input.contractStatus,
      renewalDate: input.renewalDate ? new Date(input.renewalDate) : undefined,
      noticeWindowDays: input.noticeWindowDays,
      terminationFeeCents: input.terminationFeeCents,
      buyoutOfferedCents: input.buyoutOfferedCents,
      boardFear: input.boardFear,
      decidingProof: input.decidingProof,
      counterMove: input.counterMove,
      nextStep: input.nextStep,
      status: input.status,
    },
  });

  await logComplianceEvent({
    hoaId: prior.hoaId,
    module: "transition",
    eventType: "transition.case_updated",
    actorType: "board",
    actorName: "GatePass Operator",
    targetType: "transition_case",
    targetId: input.id,
    targetLabel: `${prior.currentPmc} exit case`,
    summary: `PMC exit case updated: ${prior.currentPmc}${input.status ? ` — ${input.status}` : ""}`,
    legalFlag: false,
    legalCategory: "contract",
    dataSnapshot: input,
  });

  return (await refreshTransitionScores(updated.id)) ?? updated;
}

export async function addBoardStakeholder(input: {
  hoaId: string;
  transitionCaseId?: string;
  name: string;
  role: string;
  contact?: string;
  stance?: "champion" | "supporter" | "neutral" | "blocker" | "unknown";
  primaryConcern?: string;
  persuasionAngle?: string;
  notes?: string;
}) {
  const stakeholder = await db.boardStakeholder.create({
    data: {
      hoaId: input.hoaId,
      transitionCaseId: input.transitionCaseId,
      name: input.name,
      role: input.role,
      contact: input.contact,
      stance: input.stance ?? "unknown",
      primaryConcern: input.primaryConcern,
      persuasionAngle: input.persuasionAngle,
      notes: input.notes,
      lastInteractionAt: new Date(),
    },
  });

  if (input.transitionCaseId) await refreshTransitionScores(input.transitionCaseId);
  return stakeholder;
}

export async function addMoatSignal(input: {
  hoaId: string;
  transitionCaseId?: string;
  category: MoatSignalCategory;
  label: string;
  evidence: string;
  source: string;
  confidence?: "low" | "medium" | "high" | "verified";
  isPubliclyReplicable?: boolean;
  moatWeight?: number;
  capturedBy?: string;
}) {
  const signal = await db.moatSignal.create({
    data: {
      hoaId: input.hoaId,
      transitionCaseId: input.transitionCaseId,
      category: input.category,
      label: input.label,
      evidence: input.evidence,
      source: input.source,
      confidence: input.confidence ?? "medium",
      isPubliclyReplicable: input.isPubliclyReplicable ?? false,
      moatWeight: Math.max(1, Math.min(5, input.moatWeight ?? 1)),
      capturedBy: input.capturedBy ?? "GatePass",
    },
  });

  await logComplianceEvent({
    hoaId: input.hoaId,
    module: "transition",
    eventType: `moat_signal.${input.category}`,
    actorType: "board",
    actorName: input.capturedBy ?? "GatePass",
    targetType: "moat_signal",
    targetId: signal.id,
    targetLabel: input.label,
    summary: `Record signal captured: ${input.label}`,
    legalFlag: input.category === "contract_fact" || input.category === "compliance_risk",
    legalCategory: input.category === "contract_fact" ? "contract" : input.category === "compliance_risk" ? "liability" : "governance",
    dataSnapshot: { evidence: input.evidence, source: input.source, confidence: input.confidence, isPubliclyReplicable: input.isPubliclyReplicable },
  });

  if (input.transitionCaseId) await refreshTransitionScores(input.transitionCaseId);
  return signal;
}

export async function getTransitionMoat(hoaId: string) {
  const [cases, stakeholders, signals, complianceCount, legalComplianceCount] = await Promise.all([
    db.transitionCase.findMany({ where: { hoaId }, include: { stakeholders: true, moatSignals: true }, orderBy: { updatedAt: "desc" } }),
    db.boardStakeholder.findMany({ where: { hoaId }, orderBy: [{ stance: "asc" }, { updatedAt: "desc" }] }),
    db.moatSignal.findMany({ where: { hoaId }, orderBy: [{ moatWeight: "desc" }, { createdAt: "desc" }] }),
    db.complianceEvent.count({ where: { hoaId } }),
    db.complianceEvent.count({ where: { hoaId, legalFlag: true } }),
  ]);

  const privateSignals = signals.filter((s) => !s.isPubliclyReplicable);
  const weightedMoat = signals.reduce((sum, s) => sum + s.moatWeight * (s.isPubliclyReplicable ? 1 : 2), 0);
  const averageReplicability = cases.length ? Math.round(cases.reduce((sum, c) => sum + c.replicabilityScore, 0) / cases.length) : 0;

  if (hoaId === DEMO_HOA_ID && cases.length === 0) return demoTransitionMoat();

  const redactStakeholder = (s: (typeof stakeholders)[number]) => ({
    ...s,
    contact: null,
    notes: s.notes ? "Redacted from public/demo view." : null,
  });
  const redactSignal = (s: (typeof signals)[number]) => ({
    ...s,
    evidence: s.isPubliclyReplicable ? s.evidence : "Private transition signal captured; evidence redacted from public/demo view.",
  });
  const redactCase = (c: (typeof cases)[number]) => ({
    ...c,
    stakeholders: [],
    moatSignals: [],
    complaintThemes: parseJsonArray(c.complaintThemes),
    sourceUrl: null,
    noticeWindowDays: null,
    terminationFeeCents: null,
    buyoutOfferedCents: null,
    boardFear: c.boardFear ? "Private board concern captured; redacted from public/demo view." : null,
    decidingProof: c.decidingProof ? "Redacted proof artifact available in board-approved pack." : null,
    counterMove: c.counterMove ? "Provider response scenario captured; redacted from public/demo view." : null,
  });

  return {
    summary: {
      transitionCases: cases.length,
      boardStakeholders: stakeholders.length,
      moatSignals: signals.length,
      privateSignals: privateSignals.length,
      weightedMoat,
      averageReplicability,
      complianceEvents: complianceCount,
      legalComplianceEvents: legalComplianceCount,
      investorLine: "Public HOA data is the wedge. GatePass's moat is private PMC exit memory plus compliance history.",
    },
    cases: cases.map(redactCase),
    stakeholders: stakeholders.map(redactStakeholder),
    signals: signals.map(redactSignal),
  };
}

export async function exportPilotProofPack(input: {
  hoaId: string;
  transitionCaseId?: string;
  requestedBy: string;
}) {
  const hoa = await db.hOA.findUnique({ where: { id: input.hoaId } });
  if (!hoa && input.hoaId === DEMO_HOA_ID) {
    const moat = demoTransitionMoat();
    const selectedCase = input.transitionCaseId
      ? moat.cases.find((c) => c.id === input.transitionCaseId)
      : moat.cases[0];
    return {
      generatedAt: new Date().toISOString(),
      requestedBy: input.requestedBy,
      demo: true,
      title: "Demo HOA Transition Proof Pack — redacted sample",
      positioning: "GatePass turns governed board actions into exportable association records.",
      moatThesis: {
        publicData: "Public HOA and contractor signals are acquisition inputs, not proof by themselves.",
        proprietaryData: "The durable layer is board-approved actions, continuity checklists, compliance events, and redacted transition history owned by the association.",
        hardLine: "Demo pack is synthetic; production packs must be redacted before external sharing.",
      },
      community: { id: DEMO_HOA_ID, name: "Demo HOA", community: "Demo HOA (Synthetic)", units: 847, plan: "full" },
      selectedCase: selectedCase ? {
        id: selectedCase.id,
        currentPmc: selectedCase.currentPmc,
        sourceSignal: selectedCase.sourceSignal,
        signalSummary: selectedCase.signalSummary,
        complaintThemes: selectedCase.complaintThemes,
        contractStatus: selectedCase.contractStatus,
        boardFear: selectedCase.boardFear,
        decidingProof: selectedCase.decidingProof,
        nextStep: selectedCase.nextStep,
        status: selectedCase.status,
      } : null,
      moatSummary: moat.summary,
      topSignals: moat.signals.slice(0, 12).map((s) => ({ label: s.label, category: s.category, evidence: s.evidence, confidence: s.confidence, moatWeight: s.moatWeight })),
      boardMap: moat.stakeholders.map((s) => ({ role: s.role, stance: s.stance, primaryConcern: s.primaryConcern })),
      complianceSummary: { totalEvents: 3, legalEvents: 2, moduleBreakdown: { transition: 1, boardroom: 1, workorder: 1 } },
      legalHighlights: [
        { module: "transition", eventType: "transition.review_pack_generated", summary: "Redacted transition-review pack generated for synthetic demo community", actor: "Demo Board", legalCategory: "contract" },
        { module: "boardroom", eventType: "meeting.minutes_recorded", summary: "Board meeting agenda recorded with PMC transition review as governed discussion item", actor: "Board Secretary", legalCategory: "governance" },
      ],
      firstPilotProofChecklist: [
        "One real PMC contract reviewed",
        "One board decision path captured",
        "One transition timeline opened",
        "One compliance timeline export generated",
        "One before/after benchmark report produced",
        "One redacted case study approved for investor/customer use",
      ],
    };
  }
  if (!hoa) throw new Error("HOA not found");

  const moat = await getTransitionMoat(input.hoaId);
  const compliance = await exportCompliancePack({
    hoaId: input.hoaId,
    dateFrom: "2000-01-01T00:00:00.000Z",
    dateTo: new Date().toISOString(),
    requestedBy: input.requestedBy,
    purpose: "pmc_transition",
  });
  const selectedCase = input.transitionCaseId
    ? moat.cases.find((c) => c.id === input.transitionCaseId)
    : moat.cases[0];

  return {
    generatedAt: new Date().toISOString(),
    requestedBy: input.requestedBy,
    title: `${hoa.community} PMC Exit Proof Pack`,
    positioning: "GatePass turns governed access decisions into structured association records.",
    moatThesis: {
      publicData: "HOA names, PMC names, and public reviews are copyable acquisition signals.",
      proprietaryData: "Board objections, private contract terms, switching triggers, transition timelines, compliance events, and operating benchmarks are generated only by helping boards actually leave PMCs.",
      hardLine: "A competitor can buy the map. They cannot buy the scar tissue.",
    },
    community: { id: hoa.id, name: hoa.name, community: hoa.community, units: hoa.units, plan: hoa.plan },
    selectedCase,
    moatSummary: moat.summary,
      topSignals: moat.signals.slice(0, 12).map((s) => ({ label: s.label, category: s.category, evidence: s.evidence, confidence: s.confidence, moatWeight: s.moatWeight })),
      boardMap: moat.stakeholders.map((s) => ({ role: s.role, stance: s.stance, primaryConcern: s.primaryConcern })),
    complianceSummary: compliance.summary,
    legalHighlights: compliance.legalHighlights,
    firstPilotProofChecklist: [
      "One real PMC contract reviewed",
      "One board decision path captured",
      "One transition timeline opened",
      "One compliance timeline export generated",
      "One before/after benchmark report produced",
      "One redacted case study approved for investor/customer use",
    ],
  };
}

export async function getOSDashboard(hoaId: string) {
  if (isDemoHoa(hoaId)) {
    return {
      hoa: { id: DEMO_HOA_ID, name: "Demo HOA", community: "Sample Austin HOA", city: "Austin", state: "TX", zip: "78732", units: 200, plan: "modeled demo", paid: false },
      stats: { homeowners: 10, openViolations: 5, openWorkOrders: 3, pendingARC: 3, openVotes: 1 },
      nextMeeting: { id: "demo-meeting-1", scheduledAt: DEMO_FUTURE(12), title: "Monthly board meeting" },
      financial: { totalOutstanding: 18500, delinquentCount: 1, budgetedYTD: 42500000, actualYTD: 41120000, variance: 1380000 },
    };
  }
  const [hoa, violations, workOrders, arcRequests, meetings, votes, financial] = await Promise.all([
    db.hOA.findUnique({ where: { id: hoaId }, include: { homeowners: { select: { id: true } } } }),
    db.violation.count({ where: { hoaId, status: { in: ["open", "noticed", "escalated"] } } }),
    db.workOrder.count({ where: { hoaId, status: { in: ["open", "assigned", "in_progress"] } } }),
    db.aRCRequest.count({ where: { hoaId, status: { in: ["submitted", "under_review"] } } }),
    db.meeting.findFirst({ where: { hoaId, status: "scheduled" }, orderBy: { scheduledAt: "asc" } }),
    db.vote.count({ where: { hoaId, status: "open" } }),
    getFinancialSummary(hoaId),
  ]);

  return {
    hoa,
    stats: {
      homeowners: hoa?.homeowners.length ?? 0,
      openViolations: violations,
      openWorkOrders: workOrders,
      pendingARC: arcRequests,
      openVotes: votes,
    },
    nextMeeting: meetings,
    financial,
  };
}

// ─── AI Agent Triggers ────────────────────────────────────────────────
// Each function enqueues the AI job and returns the job ID for polling.

export async function runContractorScreening(contractorId: string) {
  const job = queue.screenContractor({ contractorId });
  return { jobId: job.id };
}

export async function runDelinquencyAnalysis(input: { hoaId: string; homeownerId: string }) {
  const job = queue.analyzeDelinquency({ hoaId: input.hoaId, homeownerId: input.homeownerId });
  return { jobId: job.id };
}

export async function runViolationClassification(violationId: string) {
  const job = queue.classifyViolation({ violationId });
  return { jobId: job.id };
}

export async function runARCReview(arcId: string) {
  const job = queue.reviewARCRequest({ arcId });
  return { jobId: job.id };
}

export async function runWorkOrderRouting(workOrderId: string) {
  const job = queue.routeWorkOrder({ workOrderId });
  return { jobId: job.id };
}

export async function runAgendaGeneration(meetingId: string) {
  const job = queue.generateAgenda({ meetingId });
  return { jobId: job.id };
}

export async function runVoteSummary(voteId: string) {
  const job = queue.summarizeVoteResults({ voteId });
  return { jobId: job.id };
}

export async function runReservationAnalysis(reservationId: string) {
  const job = queue.analyzeReservation({ reservationId });
  return { jobId: job.id };
}

export async function runAnnouncementDraft(announcementId: string) {
  const job = queue.draftAnnouncement({ announcementId });
  return { jobId: job.id };
}

export async function getAgentJobStatus(jobId: number) {
  const job = queue.getJob(jobId);
  if (!job) return { status: "UNKNOWN", jobId };
  const statusMap: Record<number, string> = { 0: "PENDING", 1: "PROCESSING", 2: "DONE", 3: "FAILED" };
  return { status: statusMap[job.status] ?? "UNKNOWN", jobId, error: job.error };
}

// Fetch AI analysis result attached to a record
export async function getAIAnalysis(input: {
  type: "violation" | "arc" | "workorder" | "meeting" | "vote" | "reservation" | "announcement" | "dues" | "contractor";
  id: string;
}): Promise<Record<string, unknown> | null> {
  let raw: string | null = null;

  switch (input.type) {
    case "violation":
      raw = (await db.violation.findUnique({ where: { id: input.id }, select: { aiAnalysis: true } }))?.aiAnalysis ?? null;
      break;
    case "arc":
      raw = (await db.aRCRequest.findUnique({ where: { id: input.id }, select: { aiAnalysis: true } }))?.aiAnalysis ?? null;
      break;
    case "workorder":
      raw = (await db.workOrder.findUnique({ where: { id: input.id }, select: { aiAnalysis: true } }))?.aiAnalysis ?? null;
      break;
    case "meeting":
      raw = (await db.meeting.findUnique({ where: { id: input.id }, select: { aiAnalysis: true } }))?.aiAnalysis ?? null;
      break;
    case "vote":
      raw = (await db.vote.findUnique({ where: { id: input.id }, select: { aiAnalysis: true } }))?.aiAnalysis ?? null;
      break;
    case "reservation":
      raw = (await db.reservation.findUnique({ where: { id: input.id }, select: { aiAnalysis: true } }))?.aiAnalysis ?? null;
      break;
    case "announcement":
      raw = (await db.announcement.findUnique({ where: { id: input.id }, select: { aiAnalysis: true } }))?.aiAnalysis ?? null;
      break;
    case "dues":
      raw = (await db.duesAccount.findUnique({ where: { id: input.id }, select: { aiAnalysis: true } }))?.aiAnalysis ?? null;
      break;
    case "contractor":
      raw = (await db.contractorWaitlist.findUnique({ where: { id: input.id }, select: { aiScreeningResult: true } }))?.aiScreeningResult ?? null;
      break;
  }

  return raw ? JSON.parse(raw) : null;
}

// ─── Admin: Delete HOA ────────────────────────────────────────────────
// Hard-deletes an HOA and all its data. Used for cleanup of test/garbage HOAs.
export async function deleteHOA(hoaId: string) {
  const auth = await getAuth();
  if (!auth.userId) throw new Error("Unauthorized: must be logged in to delete an HOA");
  const hoa = await db.hOA.findUnique({ where: { id: hoaId } });
  if (!hoa) return { deleted: false };
  const hwIds = (await db.homeowner.findMany({ where: { hoaId }, select: { id: true } })).map(h => h.id);
  await db.duesAccount.deleteMany({ where: { homeownerId: { in: hwIds } } });
  await db.voteCast.deleteMany({ where: { homeownerId: { in: hwIds } } });
  await db.violation.deleteMany({ where: { hoaId } });
  await db.aRCRequest.deleteMany({ where: { hoaId } });
  await db.workOrder.deleteMany({ where: { hoaId } });
  const mtgIds = (await db.meeting.findMany({ where: { hoaId }, select: { id: true } })).map(m => m.id);
  await db.agendaItem.deleteMany({ where: { meetingId: { in: mtgIds } } });
  await db.meeting.deleteMany({ where: { hoaId } });
  await db.vote.deleteMany({ where: { hoaId } });
  const amenIds = (await db.amenity.findMany({ where: { hoaId }, select: { id: true } })).map(a => a.id);
  await db.reservation.deleteMany({ where: { amenityId: { in: amenIds } } });
  await db.amenity.deleteMany({ where: { hoaId } });
  await db.announcement.deleteMany({ where: { hoaId } });
  await db.budget.deleteMany({ where: { hoaId } });
  await db.homeowner.deleteMany({ where: { hoaId } });
  await db.hOA.delete({ where: { id: hoaId } });
  return { deleted: true, community: hoa.community };
}

// ─── Demo Seed ────────────────────────────────────────────────────────
// Creates (or resets) a fully-populated demo HOA for live presentations.
// Idempotent: if "Sample Austin HOA" already exists, wipes and rebuilds it.

export async function seedDemoData() {
  const DEMO_COMMUNITY = "Sample Austin HOA";

  // Wipe any prior demo HOA
  const prior = await db.hOA.findFirst({ where: { community: DEMO_COMMUNITY } });
  if (prior) {
    // Must delete leaf nodes first (FK constraints)
    const priorHomeowners = await db.homeowner.findMany({ where: { hoaId: prior.id }, select: { id: true } });
    const hwIds = priorHomeowners.map(h => h.id);
    // Leaf tables that reference homeowner
    // Must delete Transactions before DuesAccounts (FK constraint)
    const priorDuesAccounts = await db.duesAccount.findMany({ where: { homeownerId: { in: hwIds } }, select: { id: true } });
    await db.transaction.deleteMany({ where: { duesAccountId: { in: priorDuesAccounts.map(d => d.id) } } });
    await db.duesAccount.deleteMany({ where: { homeownerId: { in: hwIds } } });
    await db.voteCast.deleteMany({ where: { homeownerId: { in: hwIds } } });
    await db.violation.deleteMany({ where: { hoaId: prior.id } });
    await db.aRCRequest.deleteMany({ where: { hoaId: prior.id } });
    await db.workOrder.deleteMany({ where: { hoaId: prior.id } });
    // agendaItems reference meetings
    const priorMeetings = await db.meeting.findMany({ where: { hoaId: prior.id }, select: { id: true } });
    await db.agendaItem.deleteMany({ where: { meetingId: { in: priorMeetings.map(m => m.id) } } });
    await db.meeting.deleteMany({ where: { hoaId: prior.id } });
    // voteCasts already deleted above; now delete votes
    await db.vote.deleteMany({ where: { hoaId: prior.id } });
    // amenityReservations reference amenities
    const priorAmenities = await db.amenity.findMany({ where: { hoaId: prior.id }, select: { id: true } });
    await db.reservation.deleteMany({ where: { amenityId: { in: priorAmenities.map(a => a.id) } } });
    await db.amenity.deleteMany({ where: { hoaId: prior.id } });
    await db.announcement.deleteMany({ where: { hoaId: prior.id } });
    await db.budget.deleteMany({ where: { hoaId: prior.id } });
    // ComplianceEvents reference HOA directly
    await db.complianceEvent.deleteMany({ where: { hoaId: prior.id } });
    // aiAnalysis records reference the HOA indirectly — delete by refId patterns if needed
    await db.homeowner.deleteMany({ where: { hoaId: prior.id } });
    await db.hOA.delete({ where: { id: prior.id } });
  }

  // ── Create HOA ──
  const hoa = await db.hOA.create({
    data: {
      name: "Sample Austin HOA",
      community: DEMO_COMMUNITY,
      city: "Austin", state: "TX", zip: "78732",
      units: 847,
      contactName: "Demo Board President",
      contactEmail: "board@example.invalid",
      plan: "full",
      pricePerUnit: 2200,
      paid: true,
      paidAt: new Date("2026-01-15"),
      amountCents: 847 * 2200,
    },
  });

  // ── Transition Intelligence Graph demo seed ──
  const transitionCase = await db.transitionCase.create({
    data: {
      hoaId: hoa.id,
      currentPmc: "Demo Management Co.",
      sourceSignal: "synthetic_demo",
      sourceUrl: null,
      signalSummary: "Synthetic transition review case for demo purposes only.",
      complaintThemes: JSON.stringify(["responsiveness", "violations", "board_packet", "contract_exit"]),
      contractStatus: "unknown",
      renewalDate: new Date("2026-10-31T00:00:00-05:00"),
      noticeWindowDays: null,
      terminationFeeCents: null,
      buyoutOfferedCents: null,
      boardFear: "Continuity risk if records, vendors, and resident communication are scattered across tools.",
      decidingProof: "Redacted transition pack showing motion language, resident announcement, vendor checklist, and compliance export structure.",
      counterMove: "Existing provider may offer operational fixes; GatePass preserves association-owned continuity either way.",
      nextStep: "Use the demo pack to show what an access review would capture after board approval.",
      status: "pilot_scoped",
      transitionScore: 92,
      replicabilityScore: 84,
      dataCompleteness: 88,
    },
  });

  await db.boardStakeholder.createMany({
    data: [
      { hoaId: hoa.id, transitionCaseId: transitionCase.id, name: "Demo Board President", role: "president", contact: null, stance: "champion", primaryConcern: "Safe board vote and resident communication", persuasionAngle: "Show the transition is governed, documented, and reversible.", lastInteractionAt: new Date("2026-05-20T14:00:00-05:00"), notes: "Redacted synthetic persona for demo only." },
      { hoaId: hoa.id, transitionCaseId: transitionCase.id, name: "Demo Treasurer", role: "treasurer", contact: null, stance: "supporter", primaryConcern: "Budget exposure and operating continuity", persuasionAngle: "Compare governed transition cost against record loss and operational disruption.", lastInteractionAt: new Date("2026-05-20T14:00:00-05:00"), notes: "Redacted synthetic persona for demo only." },
      { hoaId: hoa.id, transitionCaseId: transitionCase.id, name: "Demo Board Director", role: "director", contact: null, stance: "neutral", primaryConcern: "Homeowner confidence during any change", persuasionAngle: "Lead with resident announcement sequence and support continuity.", lastInteractionAt: new Date("2026-05-20T14:00:00-05:00"), notes: "Redacted synthetic persona for demo only." },
    ],
  });

  await db.moatSignal.createMany({
    data: [
      { hoaId: hoa.id, transitionCaseId: transitionCase.id, category: "board_objection", label: "Record continuity risk", evidence: "Synthetic board note: records, decisions, and vendor handoffs need to remain association-owned.", source: "synthetic_demo", confidence: "medium", isPubliclyReplicable: false, moatWeight: 5, capturedBy: "GatePass" },
      { hoaId: hoa.id, transitionCaseId: transitionCase.id, category: "switching_trigger", label: "Vendor continuity checklist", evidence: "Synthetic demo checklist for keeping approved vendors, open work orders, and resident communications visible during transition review.", source: "synthetic_demo", confidence: "medium", isPubliclyReplicable: false, moatWeight: 4, capturedBy: "GatePass" },
      { hoaId: hoa.id, transitionCaseId: transitionCase.id, category: "proof_artifact", label: "Redacted transition pack", evidence: "Demo packet includes board motion, resident announcement, vendor checklist, and compliance timeline export structure.", source: "synthetic_demo", confidence: "medium", isPubliclyReplicable: false, moatWeight: 5, capturedBy: "GatePass" },
    ],
  });

  // ── Homeowners ──
  const homeonerData = [
    { name: "Demo Board President", email: "president@example.invalid", address: "1847 Stonelake Blvd", role: "president", monthly: 18500 },
    { name: "Demo Treasurer", email: "treasurer@example.invalid", address: "1203 Ranch Rd 620 N", role: "treasurer", monthly: 18500 },
    { name: "Demo Resident", email: "resident@example.invalid", address: "Modeled Address 1", role: "resident", monthly: 18500 },
    { name: "David Nguyen",     email: "dnguyen@outlook.com",   address: "902 Canyon Edge Dr",     role: "resident",   monthly: 18500 },
    { name: "Sample Resident",  email: "resident11@example.invalid", address: "Modeled Address 11", role: "resident",   monthly: 18500 },
    { name: "Robert Kim",       email: "rkim@gmail.com",        address: "6782 Lariat Loop",       role: "resident",   monthly: 18500 },
    { name: "Angela Davis",     email: "adavis@email.com",      address: "2241 Flat Creek Cove",   role: "resident",   monthly: 18500 },
    { name: "Tyler Brooks",     email: "tbrooks@gmail.com",     address: "5508 Cerro Vista Dr",    role: "resident",   monthly: 18500 },
    { name: "Maria Gonzalez",   email: "mgonzalez@email.com",   address: "1129 Crosswind Dr",      role: "resident",   monthly: 18500 },
    { name: "James Wilson",     email: "jwilson@outlook.com",   address: "3807 River Place Blvd",  role: "resident",   monthly: 18500 },
  ];

  const homeowners: { id: string; name: string; email: string; address: string; duesAccountId?: string }[] = [];
  for (const h of homeonerData) {
    const hw = await db.homeowner.create({
      data: { hoaId: hoa.id, name: h.name, email: h.email, address: h.address, role: h.role, phone: "512-555-" + String(Math.floor(1000 + Math.random() * 9000)) },
    });
    const dues = await db.duesAccount.create({
      data: { homeownerId: hw.id, monthlyDueCents: h.monthly },
    });
    // Give some homeowners a balance
    const balances: Record<string, number> = {
      "David Nguyen": 37000,   // 2 months behind
      "Tyler Brooks": 18500,   // 1 month behind
      "Angela Davis": 55500,   // 3 months behind
    };
    if (balances[h.name]) {
      await db.duesAccount.update({ where: { id: dues.id }, data: { balanceCents: balances[h.name] } });
    }
    homeowners.push({ id: hw.id, name: h.name, email: h.email, address: h.address, duesAccountId: dues.id });
  }

  // ── Budget ──
  const budgetItems = [
    { category: "maintenance", name: "Pool maintenance contract", budgetedCents: 1200000, actualCents: 1050000 },
    { category: "utilities",   name: "Common area utilities",     budgetedCents: 840000,  actualCents: 790000  },
    { category: "insurance",   name: "HOA liability insurance",   budgetedCents: 620000,  actualCents: 620000  },
    { category: "reserves",    name: "Capital reserve fund",      budgetedCents: 2400000, actualCents: 2400000 },
    { category: "landscaping", name: "Common area landscaping",   budgetedCents: 960000,  actualCents: 880000  },
    { category: "admin",       name: "Administrative & legal",    budgetedCents: 480000,  actualCents: 310000  },
  ];
  for (const b of budgetItems) {
    await db.budget.create({ data: { hoaId: hoa.id, year: 2026, ...b, notes: null } });
  }

  // ── Violations ──
  const violationData = [
    { hw: 2, category: "landscaping",   description: "Grass exceeding 6 inches, dead shrubs visible from street",           severity: "minor",    status: "open" },
    { hw: 3, category: "parking",       description: "Commercial vehicle parked in driveway — exceeds 24hr limit per CC&Rs", severity: "moderate", status: "noticed", noticeCount: 1, fineCents: 5000 },
    { hw: 5, category: "architectural", description: "Unpermitted fence extension — 6ft on property line, requires ARC approval", severity: "major", status: "escalated", noticeCount: 3, fineCents: 15000 },
    { hw: 6, category: "trash",         description: "Refuse bins left at curb beyond 24 hours on multiple occasions",      severity: "minor",    status: "open" },
    { hw: 8, category: "noise",         description: "Multiple neighbor complaints regarding construction noise before 7am", severity: "moderate", status: "open" },
  ];
  const violations = [];
  for (const v of violationData) {
    const hw = homeowners[v.hw];
    const viol = await db.violation.create({
      data: {
        hoaId: hoa.id, homeownerId: hw.id, address: hw.address,
        category: v.category, description: v.description,
        severity: v.severity, status: v.status,
        noticeCount: v.noticeCount ?? 0,
        fineCents: v.fineCents ?? null,
        reportedBy: "Board Inspection",
        nextNoticeAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
    violations.push(viol);
  }

  // ── ARC Requests ──
  const arcData = [
    { hw: 3, projectType: "pool",      description: "In-ground pool installation, 400 sq ft, includes spa and waterfall feature",    estimatedCost: 8500000, daysAgo: 10 },
    { hw: 4, projectType: "fence",     description: "Replace existing 4ft wood fence with 6ft cedar privacy fence along back property line", estimatedCost: 320000, daysAgo: 22 },
    { hw: 7, projectType: "solar",     description: "18-panel rooftop solar array, 9.6kW system, panel color matches roof (charcoal)",    estimatedCost: 2800000, daysAgo: 5  },
    { hw: 0, projectType: "deck",      description: "Composite deck addition, 300 sq ft, attached to rear of home",                       estimatedCost: 1850000, daysAgo: 35, status: "approved" },
    { hw: 1, projectType: "addition",  description: "540 sq ft home office addition — matches existing brick and roofline",               estimatedCost: 9200000, daysAgo: 40, status: "denied" },
  ];
  for (const a of arcData) {
    const hw = homeowners[a.hw];
    const submittedAt = new Date(Date.now() - a.daysAgo * 24 * 60 * 60 * 1000);
    const reviewDeadline = new Date(submittedAt.getTime() + 45 * 24 * 60 * 60 * 1000);
    await db.aRCRequest.create({
      data: {
        hoaId: hoa.id, homeownerId: hw.id, address: hw.address,
        projectType: a.projectType, description: a.description,
        estimatedCost: a.estimatedCost, reviewDeadline, submittedAt,
        status: a.status ?? "submitted",
      },
    });
  }

  // ── Work Orders ──
  const woData = [
    { title: "Pool pump replacement",         category: "pool",        priority: "urgent",  location: "Main pool equipment room", description: "Main circulation pump seized — pool closed until repaired. Needs 2HP Hayward replacement.", estimatedCost: 285000 },
    { title: "Clubhouse A/C not cooling",     category: "hvac",        priority: "high",    location: "Clubhouse — main hall",    description: "HVAC unit not reaching setpoint. Suspected refrigerant leak. Unit is 8 years old.", estimatedCost: 180000, assignedTo: "CoolAir Systems" },
    { title: "Parking lot pothole repair",    category: "structural",  priority: "normal",  location: "North parking lot, rows 3-5", description: "Multiple potholes 4–10 inches diameter. Trip hazard. Needs patching and seal coat.", estimatedCost: 420000 },
    { title: "Irrigation controller failure", category: "landscaping", priority: "normal",  location: "Common area Zone 4",       description: "Zone 4 irrigation controller not responding. Manual override shows heads working.", estimatedCost: 45000, status: "assigned" },
    { title: "Tennis court net replacement",  category: "general",     priority: "low",     location: "Court 1 & 2",              description: "Both nets are frayed and sagging. Replace with regulation nets.", estimatedCost: 32000 },
    { title: "Gate keypad battery failure",   category: "electrical",  priority: "urgent",  location: "Main entrance gate",       description: "Entry gate keypad dead. Backup battery drained. Residents unable to use keycode entry.", estimatedCost: 18000, status: "in_progress", assignedTo: "SecureGate Austin" },
  ];
  for (const wo of woData) {
    await db.workOrder.create({
      data: {
        hoaId: hoa.id, title: wo.title, description: wo.description,
        category: wo.category, priority: wo.priority,
        location: wo.location, status: wo.status ?? "open",
        assignedTo: wo.assignedTo ?? null,
        estimatedCost: wo.estimatedCost,
      },
    });
  }

  // ── Meetings ──
  const meeting1 = await db.meeting.create({
    data: {
      hoaId: hoa.id, title: "April Board Meeting", type: "board",
      scheduledAt: new Date("2026-04-07T19:00:00-05:00"),
      location: "Clubhouse Room B", quorumRequired: 3, status: "scheduled",
      agenda: "1. Call to order\n2. Financial report — Q1 2026\n3. Pool repair emergency update\n4. Violation enforcement review\n5. Pool reopening vote\n6. ARC committee update\n7. New business\n8. Adjournment",
    },
  });
  await db.agendaItem.createMany({
    data: [
      { meetingId: meeting1.id, order: 1, title: "Call to order", status: "pending" },
      { meetingId: meeting1.id, order: 2, title: "Financial report — Q1 2026", status: "pending", actionRequired: true },
      { meetingId: meeting1.id, order: 3, title: "Pool pump repair — emergency budget approval", status: "pending", actionRequired: true },
      { meetingId: meeting1.id, order: 4, title: "Violation enforcement update", status: "pending" },
      { meetingId: meeting1.id, order: 5, title: "Pool reopening timeline vote", status: "pending", actionRequired: true },
    ],
  });

  // Past meeting with minutes
  await db.meeting.create({
    data: {
      hoaId: hoa.id, title: "March Board Meeting", type: "board",
      scheduledAt: new Date("2026-03-03T19:00:00-05:00"),
      location: "Clubhouse Room B", status: "completed", quorumRequired: 3,
      minutes: "Meeting called to order at 7:05pm. Quorum of 4 board members confirmed.\n\nFinancial report: YTD budget variance is +$82,000. Reserve fund at target.\n\nPool maintenance contract renewed with AquaClear for $12,000/year.\n\nViolation enforcement: 3 open violations, 1 escalated to HOA attorney.\n\nMotion to approve 2026 community improvement schedule passed 4-0.\n\nMeeting adjourned at 8:45pm.",
    },
  });

  // ── Votes ──
  const vote1 = await db.vote.create({
    data: {
      hoaId: hoa.id, title: "Pool Reopening Date",
      description: "Vote to select the community pool reopening date for the 2026 season. Pump repair must complete first.",
      type: "motion", status: "open",
      options: JSON.stringify(["April 15", "April 22", "May 1"]),
      closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      requiresQuorum: true, quorumCount: 50,
    },
  });
  // Seed some votes cast (cycle through homeowners for FK requirement)
  const vote1Homeowners = homeowners.slice(0, 7); // use first 7 homeowners
  for (let i = 0; i < vote1Homeowners.length; i++) {
    const opts = ["April 15", "April 22", "May 1"];
    await db.voteCast.create({ data: { voteId: vote1.id, homeownerId: vote1Homeowners[i].id, selection: opts[i % opts.length] } });
  }

  const vote2 = await db.vote.create({
    data: {
      hoaId: hoa.id, title: "2026 Special Assessment — Gate System Upgrade",
      description: "One-time special assessment of $350/unit to fund modernization of all 4 community gate systems with license plate recognition.",
      type: "special_assessment", status: "closed",
      options: JSON.stringify(["Approve", "Deny"]),
      closesAt: new Date("2026-03-01"),
      requiresQuorum: true, quorumCount: 100,
      resultSummary: "Approved 214-48 (82% approval, quorum met)",
    },
  });
  // vote2 — use all 10 homeowners cycling through (no @@unique violation since different voteId)
  for (let i = 0; i < homeowners.length; i++) {
    await db.voteCast.create({ data: { voteId: vote2.id, homeownerId: homeowners[i].id, selection: i < Math.floor(homeowners.length * 0.82) ? "Approve" : "Deny" } });
  }

  // ── Amenities ──
  const pool = await db.amenity.create({
    data: {
      hoaId: hoa.id, name: "Main Community Pool", capacity: 75,
      description: "Olympic-size heated pool with lap lanes and children's area. Heated to 82°F year-round.",
      depositCents: 0, openTime: "06:00", closeTime: "22:00",
      rules: "No glass. Shower before entering. Children under 12 must be accompanied by adult. No diving in shallow end.",
    },
  });
  const clubhouse = await db.amenity.create({
    data: {
      hoaId: hoa.id, name: "Clubhouse & Event Hall", capacity: 120,
      description: "Full kitchen, AV system, tables & chairs included. Perfect for community events.",
      depositCents: 50000, openTime: "08:00", closeTime: "23:00",
      rules: "Deposit required. Clean-up by midnight. No amplified music after 10pm.",
    },
  });
  const courts = await db.amenity.create({
    data: {
      hoaId: hoa.id, name: "Tennis Courts (2)", capacity: 8,
      description: "Two hardcourt tennis courts with lighting for evening play.",
      depositCents: 0, openTime: "07:00", closeTime: "21:00",
      rules: "2-hour booking limit when courts are in demand. Court shoes required.",
    },
  });

  // Reservations
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const days = (n: number) => new Date(today.getTime() + n * 86400000);

  const resData = [
    { amenityId: pool.id,      hw: 0, date: fmt(days(1)),  start: "09:00", end: "10:00", guestCount: 4,  notes: "Lap swim" },
    { amenityId: pool.id,      hw: 2, date: fmt(days(2)),  start: "14:00", end: "17:00", guestCount: 12, notes: "Birthday party — reserved pool area" },
    { amenityId: clubhouse.id, hw: 1, date: fmt(days(3)),  start: "18:00", end: "22:00", guestCount: 45, notes: "Annual block party planning meeting" },
    { amenityId: courts.id,    hw: 4, date: fmt(days(1)),  start: "07:00", end: "08:30", guestCount: 2,  notes: "" },
    { amenityId: clubhouse.id, hw: 6, date: fmt(days(7)),  start: "11:00", end: "16:00", guestCount: 80, notes: "Quinceañera reception" },
    { amenityId: pool.id,      hw: 8, date: fmt(days(4)),  start: "16:00", end: "18:00", guestCount: 6,  notes: "Kids swim" },
  ];
  for (const r of resData) {
    const hw = homeowners[r.hw];
    await db.reservation.create({
      data: {
        amenityId: r.amenityId, homeownerId: hw.id,
        date: r.date, startTime: r.start, endTime: r.end,
        guestCount: r.guestCount, notes: r.notes || null,
        status: "confirmed",
      },
    });
  }

  // ── Announcements ──
  const annData = [
    { title: "⚠️ Pool Temporarily Closed — Pump Repair",         category: "urgent",      pinned: true,  body: "The main community pool is temporarily closed for emergency pump replacement. Estimated reopening: April 15. We apologize for the inconvenience. Updates will be posted as work progresses." },
    { title: "April Board Meeting — April 7 at 7:00 PM",         category: "governance",  pinned: false, body: "The next board meeting is April 7 at 7:00 PM in Clubhouse Room B. Key items: Q1 financial review, pool repair update, and the pool reopening vote. All residents welcome to attend." },
    { title: "2026 Gate System Upgrade — Assessment Approved",    category: "financial",   pinned: false, body: "The community voted 82% in favor of the $350/unit special assessment for gate system modernization. Billing will appear on your April dues statement. The new LPR gate system will be installed Q3 2026." },
    { title: "Spring Landscaping Schedule",                       category: "maintenance", pinned: false, body: "Austin Greenworks will perform common area spring maintenance March 28–April 2. Please keep vehicles clear of landscaped areas. Mulching, trimming, and irrigation system startup included." },
    { title: "Welcome to GatePass — Demo HOA",    category: "general",     pinned: false, body: "This synthetic demo community is operating on GatePass. Residents can submit ARC requests, view violations, book amenities, and vote on community matters online." },
  ];
  for (const a of annData) {
    await db.announcement.create({
      data: { hoaId: hoa.id, title: a.title, body: a.body, category: a.category, pinned: a.pinned, authorName: "HOA Board" },
    });
  }

  // ── Association record proof events ──
  await logComplianceEvent({
    hoaId: hoa.id,
    module: "transition",
    eventType: "transition.exit_pack_generated",
    actorType: "board",
    actorName: "Demo Board",
    targetType: "transition_case",
    targetId: transitionCase.id,
    targetLabel: "Demo transition case",
    summary: "Redacted transition-review pack generated for synthetic demo community",
    legalFlag: true,
    legalCategory: "contract",
    dataSnapshot: { artifacts: ["notice_letter", "board_motion", "resident_announcement", "vendor_checklist", "document_request"] },
  });

  await logComplianceEvent({
    hoaId: hoa.id,
    module: "boardroom",
    eventType: "meeting.minutes_recorded",
    actorType: "board",
    actorName: "Board Secretary",
    targetType: "meeting",
    targetId: meeting1.id,
    targetLabel: meeting1.title,
    summary: "Board meeting agenda recorded with PMC transition review as governed discussion item",
    legalFlag: true,
    legalCategory: "governance",
    dataSnapshot: { quorumRequired: 3, transitionCaseId: transitionCase.id },
  });

  await logComplianceEvent({
    hoaId: hoa.id,
    module: "workorder",
    eventType: "vendor.continuity_risk_logged",
    actorType: "board",
    actorName: "Marcus Torres",
    targetType: "work_order",
    targetLabel: "Pool pump replacement",
    summary: "Vendor continuity risk logged after pool repair exposed dependency on PMC-controlled vendor history",
    legalFlag: false,
    legalCategory: "contract",
    dataSnapshot: { transitionCaseId: transitionCase.id, risk: "vendor_history_locked_inside_pmc" },
  });

  return {
    hoaId: hoa.id,
    community: DEMO_COMMUNITY,
    stats: {
      homeowners: homeowners.length,
      violations: violationData.length,
      arcRequests: arcData.length,
      workOrders: woData.length,
      votes: 2,
      amenities: 3,
      reservations: resData.length,
      announcements: annData.length,
    },
  };
}

// ─── Association Record Layer ─────────────────────────────────────────
// L3 Trust → L8 Memory moat. Every legally/financially significant
// action is timestamped and stored in the durable compliance ledger.

/**
 * Internal utility — called by other procedures after the triggering DB write.
 * Fire-and-forget: never throws, never blocks the parent operation.
 */
export async function logComplianceEvent(input: {
  hoaId: string;
  module: "core" | "payos" | "finebot" | "arc" | "workorder" | "boardroom" | "votebox" | "amenity" | "commhub" | "transition" | "marketplace";
  eventType: string;
  actorType: "board" | "homeowner" | "system" | "admin";
  actorId?: string;
  actorName: string;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  summary: string;
  detail?: string;
  dataSnapshot?: Record<string, unknown>;
  legalFlag?: boolean;
  legalCategory?: "liability" | "financial" | "governance" | "enforcement" | "contract";
  documentHash?: string;
  documentUrl?: string;
}) {
  try {
    await db.complianceEvent.create({
      data: {
        hoaId: input.hoaId,
        module: input.module,
        eventType: input.eventType,
        actorType: input.actorType,
        actorId: input.actorId,
        actorName: input.actorName,
        targetType: input.targetType,
        targetId: input.targetId,
        targetLabel: input.targetLabel,
        summary: input.summary,
        detail: input.detail,
        dataSnapshot: input.dataSnapshot ? JSON.stringify(input.dataSnapshot) : undefined,
        legalFlag: input.legalFlag ?? false,
        legalCategory: input.legalCategory,
        documentHash: input.documentHash,
        documentUrl: input.documentUrl,
      },
    });
  } catch (err) {
    // Never propagate — compliance logging must never break the parent operation
    console.error("[ComplianceEvent] Failed to log event:", err);
  }
}

export async function getComplianceTimeline(input: {
  hoaId: string;
  page?: number;
  pageSize?: number;
  module?: string;
  legalOnly?: boolean;
  actorType?: string;
  targetId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 25;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { hoaId: input.hoaId };
  if (input.module) where.module = input.module;
  if (input.legalOnly) where.legalFlag = true;
  if (input.actorType) where.actorType = input.actorType;
  if (input.targetId) where.targetId = input.targetId;
  if (input.search) where.summary = { contains: input.search };
  if (input.dateFrom || input.dateTo) {
    where.createdAt = {
      ...(input.dateFrom ? { gte: new Date(input.dateFrom) } : {}),
      ...(input.dateTo ? { lte: new Date(input.dateTo) } : {}),
    };
  }

  const [events, total, legalCount] = await Promise.all([
    db.complianceEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.complianceEvent.count({ where }),
    db.complianceEvent.count({ where: { hoaId: input.hoaId, legalFlag: true } }),
  ]);

  return { events, total, page, pageSize, totalPages: Math.ceil(total / pageSize), legalCount };
}

export async function exportCompliancePack(input: {
  hoaId: string;
  dateFrom: string;
  dateTo: string;
  purpose?: string;
  requestedBy: string;
}) {
  const hoa = await db.hOA.findUnique({ where: { id: input.hoaId } });
  if (!hoa && isDemoHoa(input.hoaId)) {
    return {
      exportMeta: {
        generatedAt: new Date().toISOString(),
        requestedBy: input.requestedBy,
        purpose: input.purpose ?? "general",
        hoaId: DEMO_HOA_ID,
        hoaName: "Demo HOA",
        community: "Demo HOA (Synthetic)",
        dateRangeStart: input.dateFrom,
        dateRangeEnd: input.dateTo,
        demo: true,
      },
      summary: {
        totalEvents: 5,
        legalEvents: 2,
        moduleBreakdown: { finebot: 1, arc: 1, votebox: 1, payos: 1, boardroom: 1 },
      },
      legalHighlights: [
        { date: DEMO_NOW(), module: "arc", eventType: "arc.submitted", summary: "Synthetic roof request submitted for board review.", actor: "Demo Resident", legalCategory: "governance" },
        { date: DEMO_NOW(), module: "votebox", eventType: "vote.opened", summary: "Synthetic board motion opened for pool gate repair budget.", actor: "Demo Board", legalCategory: "governance" },
      ],
      fullTimeline: [
        { id: "demo-ce-1", date: DEMO_NOW(), module: "finebot", eventType: "violation.notice_ready", summary: "Synthetic violation notice prepared for board review.", detail: null, actor: "Demo Board (board)", target: "Demo unit", legalFlag: false, legalCategory: "enforcement" },
        { id: "demo-ce-2", date: DEMO_NOW(), module: "arc", eventType: "arc.submitted", summary: "Synthetic roof request submitted for board review.", detail: null, actor: "Demo Resident (resident)", target: "Demo property", legalFlag: true, legalCategory: "governance" },
        { id: "demo-ce-3", date: DEMO_NOW(), module: "votebox", eventType: "vote.opened", summary: "Synthetic board motion opened for pool gate repair budget.", detail: null, actor: "Demo Board (board)", target: "Pool gate repair", legalFlag: true, legalCategory: "governance" },
        { id: "demo-ce-4", date: DEMO_NOW(), module: "payos", eventType: "dues.balance_recorded", summary: "Synthetic dues balance recorded for demo account.", detail: null, actor: "GatePass Demo (system)", target: "Demo account", legalFlag: false, legalCategory: "financial" },
        { id: "demo-ce-5", date: DEMO_NOW(), module: "boardroom", eventType: "meeting.agenda_ready", summary: "Synthetic transition review agenda item prepared.", detail: null, actor: "Demo Board (board)", target: "Monthly board meeting", legalFlag: false, legalCategory: "governance" },
      ],
    };
  }
  if (!hoa) throw new Error("HOA not found");

  const events = await db.complianceEvent.findMany({
    where: {
      hoaId: input.hoaId,
      createdAt: { gte: new Date(input.dateFrom), lte: new Date(input.dateTo) },
    },
    orderBy: { createdAt: "asc" },
  });

  const legalEvents = events.filter(e => e.legalFlag);

  const pack = {
    exportMeta: {
      generatedAt: new Date().toISOString(),
      requestedBy: input.requestedBy,
      purpose: input.purpose ?? "general",
      hoaId: hoa.id,
      hoaName: hoa.name,
      community: hoa.community,
      dateRangeStart: input.dateFrom,
      dateRangeEnd: input.dateTo,
    },
    summary: {
      totalEvents: events.length,
      legalEvents: legalEvents.length,
      moduleBreakdown: events.reduce((acc, e) => {
        acc[e.module] = (acc[e.module] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
    legalHighlights: legalEvents.map(e => ({
      date: e.createdAt,
      module: e.module,
      eventType: e.eventType,
      summary: e.summary,
      actor: e.actorName,
      legalCategory: e.legalCategory,
    })),
    fullTimeline: events.map(e => ({
      id: e.id,
      date: e.createdAt,
      module: e.module,
      eventType: e.eventType,
      summary: e.summary,
      detail: e.detail,
      actor: `${e.actorName} (${e.actorType})`,
      target: e.targetLabel,
      legalFlag: e.legalFlag,
      legalCategory: e.legalCategory,
    })),
  };

  await db.complianceExport.create({
    data: {
      hoaId: input.hoaId,
      requestedBy: input.requestedBy,
      dateRangeStart: new Date(input.dateFrom),
      dateRangeEnd: new Date(input.dateTo),
      eventCount: events.length,
      exportJson: JSON.stringify(pack),
      purpose: input.purpose,
    },
  });

  return pack;
}
