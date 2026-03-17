import { db } from "@/api/db";
import { env } from "@/lib/env";
import Stripe from "stripe";

function getStripe() {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

export async function health() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    db: await db.$queryRaw`SELECT 1 as result`
      .then(() => "connected")
      .catch(() => "disconnected"),
  };
}

// ─── HOA ──────────────────────────────────────────────────────────────

export async function createHOACheckout(input: {
  name: string;
  community: string;
  zip: string;
  units: number;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}) {
  const stripe = getStripe();
  const pricePerUnit = 1000; // $10.00 in cents
  const totalCents = input.units * pricePerUnit;

  // Save HOA record first
  const hoa = await db.hOA.create({
    data: {
      name: input.name,
      community: input.community,
      zip: input.zip,
      units: input.units,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
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
            name: `GatePass — ${input.community} HOA`,
            description: `${input.units} units × $10/unit/year — Founding community rate`,
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

  // Store session ID
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
  return {
    totalHOAs: total,
    paidHOAs: paid,
    totalUnits: totalUnits._sum.units ?? 0,
    arr: (totalUnits._sum.units ?? 0) * 10,
  };
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

  // Get position
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
          unit_amount: 9900, // $99
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
  const contractor = await db.contractorWaitlist.findUnique({ where: { id } });
  return contractor;
}

// ─── Austin Permit Feed ───────────────────────────────────────────────

export async function getAustinPermits(zip?: string) {
  try {
    // Austin Open Data portal — building permits
    const url = new URL(
      "https://data.austintexas.gov/resource/3syk-w9eu.json"
    );
    url.searchParams.set("$limit", "20");
    url.searchParams.set("$order", "issued_date DESC");
    if (zip) url.searchParams.set("zip", zip);

    const res = await fetch(url.toString(), {
      headers: { "X-App-Token": "GatePass-Phase1" },
    });

    if (!res.ok) throw new Error("API error");
    const data = await res.json() as Record<string, string>[];

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
    // Fallback mock data if API unavailable
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
