import { db } from "@/api/db";
import { env } from "@/lib/env";
import Stripe from "stripe";

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
  return db.aRCRequest.update({
    where: { id: input.id },
    data: {
      status: input.status,
      reviewedBy: input.reviewedBy,
      reviewNotes: input.reviewNotes,
      conditions: input.conditions,
      decidedAt: new Date(),
    },
  });
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
