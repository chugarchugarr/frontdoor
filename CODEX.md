# GatePass — Codex Context

GitHub repository: `chugarchugarr/frontdoor`. In conversation, always call the product **GatePass**. Treat `frontdoor`, `froontdoor`, and `gatepass` as repository search aliases, but do not rename the product.

## Controlling doctrine

> GatePass is the association-owned operating system that routes property work from an exterior signal to permission, verified execution, and a permanent record. Contractors pay for trusted access to communities; associations retain control of the workflow and data.

Every product surface, public sentence, demo label, investor explanation, and implementation decision must preserve that sequence and ownership structure.

## What this is

GatePass is an association-owned operating system and trusted contractor-access network for governed property work. It is built with React + TypeScript on the frontend and a Hono backend using Prisma + SQLite.

**This is pre-revenue.** All product screens use modeled demo data. No paid HOA customers. No production contractor transactions. Production revenue: $0.

## Product sequence

1. **Exterior signal** — a lawfully visible condition or a homeowner- or association-supplied observation. It is a signal, not a diagnosis or authorization.
2. **Permission** — the association applies its rules and approvals. The homeowner keeps contractor choice.
3. **Trusted access** — approved contractors may respond through the community channel. Payment does not buy approval, ranking, a lead, or guaranteed work.
4. **Verified execution** — credentials, applicable licenses, insurance, scope, approvals, and completion evidence remain attached to the work. Verification is a defined record standard, not an endorsement or guarantee.
5. **Permanent record** — the association owns and can export the workflow history when managers, management companies, vendors, or board members change.

## Tech stack

- Frontend: React 18 + TypeScript + Vite
- Backend: Hono (RPC-style API)
- Database: Prisma + SQLite
- Styling: Tailwind CSS + custom design tokens
- Build: Vite (frontend), tsx (backend)
- AI-assisted actions exist for specific workflows. GatePass is authentic SaaS; AI is a feature, not the product thesis or operating method.

## Commands

```bash
npm install          # install deps
npm run check        # typecheck + config check
npm run lint         # eslint
npm run dev          # start dev servers (frontend + backend)
npm run prod:build   # production build (frontend + migrations)
```

## Project structure

```text
src/
  App.tsx              # Routes, metadata, 404
  api/
    procedures.ts      # All backend RPC functions
    proofPack.ts       # Export/record-pack PDF generation
  components/
    Dashboard.tsx      # Board operating overview
    Sidebar.tsx        # Board operating navigation
    ContractorWaitlist.tsx  # Contractor application form
    HomeownerPortal.tsx     # Resident portal demo
    ContractorPortal.tsx    # Contractor portal demo
    MarketplaceProofLoop.tsx # Contractor work path demo (legacy filename)
    TransitionMoat.tsx      # Association records demo (legacy filename)
    InvestorProofDashboard.tsx # Internal investor status (legacy filename)
    ui-kit.tsx         # Shared form components
    tokens.ts          # Design tokens and responsive CSS
    Violations.tsx     # Violations module
    ARCAgent.tsx       # ARC review module
    Homeowners.tsx     # Homeowners module
    ...
  lib/
    modeledDemoData.ts # Canonical demo data
  pages/
    Landing.jsx        # Public homepage
    Investors.jsx      # Investor brief + current status
    Pricing.jsx        # HOA pricing page
    Privacy.jsx        # Privacy policy
    Terms.jsx          # Terms of service
    NotFound.tsx       # 404 page
public/
  robots.txt           # Disallows demo, operating, admin, and internal review routes
  sitemap.xml          # Public routes only
schema.prisma          # Database schema
index.html             # SEO metadata and JSON-LD
```

## Voice and copy rules

- Direct, founder-led, field-earned, no generic SaaS language.
- Public copy must explain the mechanism in this order: signal → permission → execution → record.
- Association ownership is the constant. A management company may operate in the system but does not own the workflow or data.
- Use "management company" rather than "PMC" in customer-facing copy.
- Use "approved," "the association decides," or "the board applies the rules" instead of overusing "permissioned."
- Contractor copy may refer to "a roof, fence, drainage line, hail mark, or other exterior condition."
- Never label GatePass as an AI company. AI may improve a workflow; it is not the operating method.
- Never imply that contractor payment purchases board approval, ranking, a lead, or job volume.
- Never imply that "verified" means endorsed, guaranteed, or certain to perform quality work.
- Any association or homeowner economic benefit remains counsel-gated and must not appear as a current promise.
- Exterior observations must be limited to what is lawfully visible from a public approach or supplied by the homeowner or association.
- Product doctrine changes require contact from reality: a board conversation, contractor response, investor response, counsel ruling, or deployment result.
- Never use these pitch-deck labels publicly: Problem, Solution, Why Now, Wedge, Moat, Traction, Proof, Use of Funds, Software wedge, Marketplace business, Transition-memory moat, Compliance memory, Transition memory, Board-safe, Moat signal, Flywheel, defensible memory record.
- Remove all Home Show and unsigned LOI language.

## Public forms

- HOA onboarding (`/onboard`) → workflow review application, no payment created.
- Contractor application (`/contractors`) → application before payment, no fake scarcity, no lead/job guarantees.
- Founding contractor access is $99 once, after approval.

## Demo data

All demo screens use `src/lib/modeledDemoData.ts` for canonical counts and identities. Display banner: "MODELED DEMO — NO PRODUCTION CUSTOMER OR TRANSACTION DATA". Do not use real-looking HOA, resident, contractor, address, email, or phone data.

The visible demo must make this path legible:

```text
exterior signal → association permission → trusted contractor access → verified execution → permanent association record
```

## Source-of-truth order

1. `APP.md` and this file.
2. Current public pages and modeled-demo constants.
3. Implementation details that do not conflict with the first two.

`docs/HOA-OS-ARCHITECTURE.md` and `docs/compliance-memory-layer.md` are historical design records. They contain superseded AI-first, management-company replacement, pricing, scarcity, switching-cost, and older marketplace language. Do not restore those positions without contact from reality.

## Pricing displayed

- HOA software: $20 per unit per year, $0 setup.
- Founding contractor access: $99 once, after approval.
- No public transaction-share promise.

## Raise

- $500,000 SAFE, $6 million post-money valuation.

## Key routes

- `/` — Homepage
- `/investors` — Investor brief + current status
- `/pricing` — Pricing
- `/onboard` — HOA workflow review form
- `/contractors` — Contractor application
- `/demo` — Modeled product demo (noindex)
- `/privacy`, `/terms` — Legal pages

## What to verify after changes

1. `npm run check` passes.
2. `npm run lint` passes.
3. `npm run prod:build` succeeds.
4. No banned words appear in public source or build output.
5. Forms submit successfully.
6. Demo data renders correctly.
7. SEO metadata is present on public routes.
8. Every visible explanation preserves association ownership and the sequence: exterior signal → permission → verified execution → permanent record.