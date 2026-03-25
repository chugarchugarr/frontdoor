import { db } from "@/api/db";
import { env } from "@/lib/env";
import Stripe from "stripe";
import { Resend } from "resend";
import { queue } from "@/api/queue";

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
  const pricePerUnit = plan === "full" ? 2200 : plan === "enterprise" ? 3000 : 2000; // cents
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
  const planLabel = plan === "full" ? "Full OS" : plan === "enterprise" ? "Enterprise" : "Starter";

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
            description: `${input.category} · Austin Metro · Seat #${position} of 25`,
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

export async function getContractorStats() {
  const total = await db.contractorWaitlist.count();
  const paid = await db.contractorWaitlist.count({ where: { paid: true } });
  const remaining = Math.max(0, 25 - paid);
  return { total, paid, remaining, spotsLeft: remaining };
}

export async function getWaitlistPosition(id: string) {
  return db.contractorWaitlist.findUnique({ where: { id } });
}

// ─── Austin Permit Feed ───────────────────────────────────────────────

export async function getAustinPermits(zip?: string) {
  try {
    const url = new URL("https://data.austintexas.gov/resource/3syk-w9eu.json");
    url.searchParams.set("$limit", "20");
    url.searchParams.set("$order", "issued_date DESC");
    if (zip) url.searchParams.set("zip", zip);

    const res = await fetch(url.toString(), {
      headers: { "X-App-Token": "GatePass-Phase1" },
    });

    if (!res.ok) throw new Error("API error");
    const data = (await res.json()) as Record<string, string>[];

    return data.map((p) => ({
      id: p.permit_num || String(Math.random()),
      type: p.work_class || p.permit_type_desc || "Permit",
      description: p.description || "",
      address: p.original_address1 || "",
      zip: p.zip || zip || "",
      contractor: p.contractor_company_name || "Unknown Contractor",
      value: p.total_valuation
        ? `$${Number(p.total_valuation).toLocaleString()}`
        : null,
      date: p.issued_date
        ? new Date(p.issued_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      status: p.status_current || "Issued",
    }));
  } catch (e) {
    console.warn("[permits] API fallback:", e);
    return MOCK_PERMITS;
  }
}

const MOCK_PERMITS = [
  { id: "1", type: "Roof Replacement", description: "Remove and replace asphalt shingle roof", address: "1847 Oakwood Dr", zip: "78752", contractor: "Summit Roofing Co.", value: "$14,200", date: "Mar 8, 2026", status: "Issued" },
  { id: "2", type: "Foundation Repair", description: "Foundation leveling and pier installation", address: "1203 Elm St", zip: "78752", contractor: "Bedrock Foundation", value: "$8,900", date: "Mar 5, 2026", status: "Issued" },
  { id: "3", type: "HVAC Replacement", description: "Full HVAC system replacement", address: "4521 Lamar Blvd", zip: "78751", contractor: "CoolAir Systems", value: "$11,600", date: "Feb 28, 2026", status: "Issued" },
  { id: "4", type: "Electrical Panel", description: "200A panel upgrade", address: "902 Congress Ave", zip: "78701", contractor: "BrightWire Electric", value: "$4,800", date: "Feb 25, 2026", status: "Finaled" },
  { id: "5", type: "Water Heater", description: "Tankless water heater installation", address: "3317 Red River St", zip: "78705", contractor: "AquaFlow Plumbing", value: "$3,400", date: "Feb 22, 2026", status: "Issued" },
  { id: "6", type: "Solar Installation", description: "18-panel rooftop solar array", address: "6782 Burnet Rd", zip: "78757", contractor: "SunPower Austin", value: "$28,000", date: "Feb 20, 2026", status: "Issued" },
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

  return homeowner;
}

export async function getHomeowners(hoaId: string) {
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

  return tx;
}

export async function getFinancialSummary(hoaId: string) {
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
  return db.violation.create({
    data: {
      hoaId: input.hoaId,
      homeownerId: input.homeownerId,
      address: input.address,
      category: input.category,
      description: input.description,
      severity: input.severity || "minor",
      reportedBy: input.reportedBy,
      photoUrls: input.photoUrls ? JSON.stringify(input.photoUrls) : null,
      // Next notice due in 14 days by default
      nextNoticeAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function getViolations(hoaId: string) {
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

  return { notice, noticeNumber, fineCents };
}

export async function resolveViolation(violationId: string, notes?: string) {
  return db.violation.update({
    where: { id: violationId },
    data: { status: "resolved", resolvedAt: new Date(), notes },
  });
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
  return db.meeting.update({
    where: { id: input.id },
    data: {
      minutes: input.minutes,
      quorumMet: input.quorumMet,
      status: input.status || "completed",
    },
  });
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
  const results = await getVoteResults(voteId);
  const winner = Object.entries(results.tallies).sort((a, b) => b[1] - a[1])[0];
  const summary = winner
    ? `Result: "${winner[0]}" — ${winner[1]} votes (${results.totalCasts} total)`
    : "No votes cast";

  return db.vote.update({
    where: { id: voteId },
    data: { status: "closed", resultSummary: summary, certifiedAt: new Date() },
  });
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

  return db.workOrder.update({ where: { id: input.id }, data });
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
    from: "GatePass <onboarding@gatepass.io>",
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
          <p style="color: #888; font-size: 13px; line-height: 1.6;">Questions? Reply to this email or reach us at <a href="mailto:hello@gatepass.io" style="color: #2A5240;">hello@gatepass.io</a></p>
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
    from: "GatePass OS <violations@gatepass.io>",
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
    from: "GatePass OS <arc@gatepass.io>",
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
    from: "GatePass <contractors@gatepass.io>",
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

export async function stripeWebhook(input: { body: string; headers: Record<string, string | string[]> }) {
  const stripe = getStripe();
  const sig = input.headers["stripe-signature"];
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(input.body, Array.isArray(sig) ? sig[0] : sig, webhookSecret);
    } catch (err) {
      console.error("[stripe-webhook] Signature verification failed:", err);
      throw new Error("Invalid webhook signature");
    }
  } else {
    // Dev mode: no webhook secret configured, parse raw body
    event = JSON.parse(input.body) as Stripe.Event;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    if (meta.hoaId) {
      await db.hOA.update({
        where: { id: meta.hoaId },
        data: {
          paid: true,
          paidAt: new Date(),
          amountCents: session.amount_total ?? 0,
        },
      });
      // Send welcome email (non-blocking)
      sendHOAWelcomeEmail(meta.hoaId).catch((e) =>
        console.error("[stripe-webhook] HOA welcome email failed:", e)
      );
    }

    if (meta.contractorId) {
      await db.contractorWaitlist.update({
        where: { id: meta.contractorId },
        data: { paid: true },
      });
      // Send contractor welcome email (non-blocking)
      sendContractorWelcomeEmail(meta.contractorId).catch((e) =>
        console.error("[stripe-webhook] Contractor welcome email failed:", e)
      );
    }
  }

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

export async function getOSDashboard(hoaId: string) {
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
}) {
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
