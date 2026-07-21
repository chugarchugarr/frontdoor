# GatePass — Codex Context

GitHub repository: `chugarchugarr/frontdoor`. In conversation, always call the product **GatePass**. Treat `frontdoor`, `froontdoor`, and `gatepass` as repository search aliases, but do not rename the product.

## What this is

GatePass is an HOA-controlled contractor marketplace and board operating system. Built with React + TypeScript frontend and a Hono backend using Prisma + SQLite.

**This is pre-revenue.** All product screens use modeled demo data. No paid HOA customers. No production contractor transactions. Production revenue: $0.

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

```
src/
  App.tsx              # Routes, metadata, 404
  api/
    procedures.ts      # All backend RPC functions
    proofPack.ts       # Export/record-pack PDF generation
  components/
    Dashboard.tsx      # Board OS overview
    Sidebar.tsx        # Board OS navigation
    ContractorWaitlist.tsx  # Contractor application form
    HomeownerPortal.tsx     # Resident portal demo
    ContractorPortal.tsx    # Contractor portal demo
    MarketplaceProofLoop.tsx # Contractor access flow demo (legacy filename)
    TransitionMoat.tsx      # Association records demo (legacy filename)
    InvestorProofDashboard.tsx # Investor status dashboard (legacy filename)
    ui-kit.tsx         # Shared form components (FDInput, FDTextarea, FDSelect, StatusTag)
    tokens.ts          # Design tokens, colors, reduced-motion CSS
    Violations.tsx     # Violations module
    ARCAgent.tsx       # ARC review module
    Homeowners.tsx     # Homeowners module
    ...
  lib/
    modeledDemoData.ts # Canonical demo data (DEMO_HOA_ID, counts, identities)
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
index.html             # SEO metadata, JSON-LD
```

## Voice and copy rules

- Direct, founder-led, no jargon
- Never use these words publicly: Problem, Solution, Why Now, Wedge, Moat, Traction, Proof, Use of Funds, Software wedge, Marketplace business, Transition-memory moat, Compliance memory, Transition memory, Board-safe, Moat signal, Flywheel, defensible memory record
- Remove all Home Show / LOI language
- Use "management company" not "PMC" in customer-facing copy
- Use "approved" or "the HOA decides" instead of overusing "permissioned"
- Contractor copy: "a roof, fence, drainage line, hail mark, or other exterior problem"
- Never label features as AI unless real AI calls back them
- Do not frame GatePass as an AI company. The marketplace, permission, records, and legal access path are the business.
- No fake scarcity, seat countdowns, or claims that a contractor application guarantees access.
- Transaction-share language must say the production structure is pending legal and payment approval. Never invent a percentage.
- Exterior observations must be limited to what is lawfully visible from a public approach or supplied by the homeowner or association.
- Product doctrine changes require contact from reality: a board conversation, contractor response, investor response, counsel ruling, or deployment result.

## Public forms

- HOA onboarding (`/onboard`) → access review application, no payment created
- Contractor application (`/contractors`) → application before payment, no fake scarcity, no lead/job guarantees
- "Founding access is $99 once, after approval."

## Demo data

All demo screens use `src/lib/modeledDemoData.ts` for canonical counts and identities. Display banner: "MODELED DEMO — NO PRODUCTION CUSTOMER OR TRANSACTION DATA". Do not use real-looking HOA/resident/contractor/address/email/phone data.

## Source-of-truth order

1. `APP.md` and this file.
2. Current public pages and modeled-demo constants.
3. Implementation details that do not conflict with the first two.

`docs/HOA-OS-ARCHITECTURE.md` and `docs/compliance-memory-layer.md` are historical design records. They contain superseded management-company replacement, AI-first, pricing, scarcity, and switching-cost language. Do not restore those positions without contact from reality.

## Pricing displayed

- HOA software: $20 per unit per year, $0 setup
- Founding contractor access: $99 once, after approval

## Raise

- $500,000 SAFE, $6 million post-money valuation

## Key routes

- `/` — Homepage
- `/investors` — Investor brief + current status
- `/pricing` — Pricing
- `/onboard` — HOA access review form
- `/contractors` — Contractor application
- `/demo` — Modeled product demo (noindex)
- `/privacy`, `/terms` — Legal pages

## What to verify after changes

1. `npm run check` passes
2. `npm run lint` passes
3. `npm run prod:build` succeeds
4. No banned words in source or build output
5. Forms submit successfully
6. Demo data renders correctly
7. SEO metadata present on public routes
