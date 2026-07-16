export const DEMO_HOA_ID = "cmprlyrux00005etlni6qod8x";

export const MODELED_DEMO_BANNER = "MODELED DEMO — NO PRODUCTION CUSTOMER DATA OR TRACTION";

export const modeledDemoData = {
  hoa: {
    id: DEMO_HOA_ID,
    community: "Sample Austin HOA",
    city: "Austin",
    state: "TX",
    zip: "78732",
    units: 200,
    plan: "modeled demo",
    paid: false,
  },
  stats: {
    residents: 10,
    homeowners: 10,
    delinquentAccounts: 1,
    outstandingBalanceCents: 18500,
    openViolations: 5,
    pendingARC: 3,
    openWorkOrders: 3,
    openVotes: 1,
    complianceEvents: 5,
    productionHoaCustomers: 0,
    productionContractorTransactions: 0,
    productionRevenueCents: 0,
  },
  contractor: {
    company: "Demo Roofing Company",
    contact: "Sample Contractor",
    email: "contractor@example.invalid",
    phone: "512-555-0100",
  },
};

export function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}
