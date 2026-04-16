# Wearify — Codebase Context

> Persistent reference for Claude Code sessions. Read this first to orient before exploring.

## 1. Project Purpose

**Wearify** is an AI-powered virtual try-on platform for Indian saree retailers. Full-stack Next.js 16 + Convex application spanning 6 interconnected modules:

| Module | Audience | Surface |
|---|---|---|
| **Admin** (Mission Control) | Wearify ops | Web dashboard, 18 governance sections |
| **Retailer** (Store Dashboard) | Store owners/managers | Web (store-side analytics, inventory, staff) |
| **Sales Tablet** | In-store staff | Tablet web app, PIN auth |
| **Smart Mirror / Kiosk** | Customers in store | Edge device, AI try-on, 9-language |
| **Customer PWA** | End customers | Mobile PWA, looks/wishlist/loyalty |
| **Tailor** | Blouse-stitching partners | Web, orders + referrals |

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Backend:** Convex (46 tables, real-time subscriptions, server functions)
- **Auth:** Better Auth + custom phone-OTP ([lib/phoneAuth.ts](lib/phoneAuth.ts), [convex/phoneAuth.ts](convex/phoneAuth.ts))
- **UI:** TailwindCSS v4, custom primitives in [components/ui/wearify-ui.tsx](components/ui/wearify-ui.tsx)
- **Charts:** Recharts &nbsp;|&nbsp; **Icons:** Lucide React
- **Storage:** Convex File Storage (KYC docs, try-on images)
- **i18n:** 9 Indian languages (EN, HI, MR, KN, TA, TE, BN, GU, ML) via [lib/i18n.ts](lib/i18n.ts)

## 3. Top-Level Directories

```
/app              Next.js App Router — all 6 module routes
/components       Reusable React components (admin shell, UI primitives, ConvexClientProvider)
/convex           Backend: schema (46 tables), queries, mutations, seed
/lib              Utilities: phone auth, i18n, file upload helpers
/kisko-ui         Design reference screenshots (18 Figma pages)
/demo_frontend    UI mockup images (saree catalog references)
/public           Static assets
/skills           Symlinks to Convex AI skills (migrations, setup)
```

Reference scaffolds at root: [Kiosk_mirror_v7.jsx](Kiosk_mirror_v7.jsx) (~80KB) and [Wearify_Customer_PWA_v3.jsx](Wearify_Customer_PWA_v3.jsx) — original Figma → JSX exports used as design source for `/kiosk` and `/c` implementations.

## 4. App Routes

### Admin (`/app/admin/*`) — 18 sections
[`agents`](app/admin/agents/), [`audit`](app/admin/audit/), [`billing`](app/admin/billing/), [`command-center`](app/admin/command-center/), [`dashboard`](app/admin/dashboard/), [`data-governance`](app/admin/data-governance/), [`devices`](app/admin/devices/), [`legal`](app/admin/legal/), [`login`](app/admin/login/), [`models`](app/admin/models/), [`network`](app/admin/network/), [`releases`](app/admin/releases/), [`resilience`](app/admin/resilience/), [`revenue`](app/admin/revenue/), [`security`](app/admin/security/), [`settings`](app/admin/settings/), [`stores`](app/admin/stores/) (+ `[id]`, `onboard` 8-step wizard), [`support`](app/admin/support/), [`vendors`](app/admin/vendors/)

Shell: [app/admin/layout.tsx](app/admin/layout.tsx) — collapsible sidebar, topbar, live status.

### Retailer (`/app/store/*`)
`login`, `analytics`, `campaigns`, `customers`, `inventory`, `settings`, `staff`

### Sales Tablet (`/app/tablet/*`)
`setup`, `pin`, `catalogue`, `session`, `shortlist`, `occasion`, `phone`, `register`

### Kiosk (`/app/kiosk/*`)
`/kiosk` home, `/kiosk/setup` (store ID + tablet code), `/kiosk/session` (try-on, language-aware)

### Customer PWA (`/app/c/*`)
`login`, `looks` (+ `[id]`), `wishlist`, `new`, `me/preferences`

### Tailor (`/app/tailor/*`)
`login`, `orders`, `referrals`, `profile`

### API
[`/app/api/auth/*`](app/api/auth/) — Better Auth endpoints

## 5. Convex Backend

**Tables (46 total in [convex/schema.ts](convex/schema.ts))** — grouped:

- **Core data:** `users`, `stores`, `staff`, `sarees`, `customers`, `customerStoreLinks`, `sessions`, `looks`, `shortlist`, `trialRoom`, `wishlist`, `visitHistory`, `loyaltyTransactions`, `customerReferrals`
- **Engagement:** `offers`, `feedback`, `campaigns`, `customerSegments`
- **Tailors:** `tailors`, `tailorPortfolio`, `tailorReferrals`, `tailorOrders`, `tailorCommission`
- **Admin / platform:** `devices`, `agents`, `agentTools`, `models`, `tickets`, `auditLog`, `featureFlags`, `platformConfig`, `orders`, `wardrobe`

**Key function files:**
- [convex/stores.ts](convex/stores.ts) — store CRUD, onboarding
- [convex/devices.ts](convex/devices.ts) — fleet telemetry, provisioning
- [convex/customers.ts](convex/customers.ts) — customer queries, loyalty, referrals
- [convex/sessionOps.ts](convex/sessionOps.ts) — session creation, look recording
- [convex/tailorOps.ts](convex/tailorOps.ts) — tailor orders, commissions
- [convex/trialRoom.ts](convex/trialRoom.ts) — kiosk access codes (6-digit, 15 min expiry)
- [convex/sarees.ts](convex/sarees.ts) — catalog CRUD, approval workflow
- [convex/campaignOps.ts](convex/campaignOps.ts) — email/WhatsApp campaign send
- [convex/phoneAuth.ts](convex/phoneAuth.ts) — OTP generate/verify
- [convex/dashboard.ts](convex/dashboard.ts) — analytics aggregations
- [convex/seed.ts](convex/seed.ts) — idempotent seeding

**Convex rule:** Always read `convex/_generated/ai/guidelines.md` before writing Convex code (overrides training-data patterns).

## 6. Key Features

1. **Admin Mission Control** — 18-section governance, store onboarding, fleet ops
2. **Kiosk staff PIN login + Trial Room codes** — staff PIN (4-digit) on mirror; 6-digit access codes generated via tablet for customers
3. **Tablet ↔ Mirror shortlist sync** — staff curates on tablet, customer sees on mirror
4. **Customer PWA** — phone+OTP login, "My Looks" feed (try-on history), wishlist, loyalty points, tailor discovery
5. **Tailor marketplace** — blouse orders, referral leads, commission tracking
6. **Loyalty + referrals** — points earn/redeem; friend referrals with credit
7. **Campaigns** — email + WhatsApp per-store with segment targeting
8. **DPDP consent** — customer privacy consent, photo retention policies
9. **9-language i18n** — kiosk + customer app
10. **KYC + File storage** — store/tailor docs (Aadhaar, PAN, GST) via Convex Storage

## 7. Important Files

| File | Purpose |
|---|---|
| [Kiosk_mirror_v7.jsx](Kiosk_mirror_v7.jsx) | Original kiosk UI scaffold (Figma export) |
| [Wearify_Customer_PWA_v3.jsx](Wearify_Customer_PWA_v3.jsx) | Original customer app scaffold |
| [components/ui/wearify-ui.tsx](components/ui/wearify-ui.tsx) | Shared UI primitives (KPI, Card, Tabs, Badge, Btn, Metric, Skeleton) |
| [convex/schema.ts](convex/schema.ts) | All 46 table definitions + indexes |
| [convex/seed.ts](convex/seed.ts) | Idempotent demo seed |
| [lib/phoneAuth.ts](lib/phoneAuth.ts) | OTP helpers (Twilio-ready) |
| [lib/i18n.ts](lib/i18n.ts) | Translation strings (9 languages) |
| [app/admin/layout.tsx](app/admin/layout.tsx) | Admin sidebar + topbar shell |
| [app/globals.css](app/globals.css) | Tailwind v4 theme, Wearify warm palette |

## 8. Test Credentials & Seed Data

**Admin:** `admin@wearify.com` (sign up via Better Auth)

**Stores** — OTP `123456`, password `Store@123`:

| Store | ID | Phone | City | Status |
|---|---|---|---|---|
| MAUVE Sarees | ST-001 | 9800000001 | Mumbai | active |
| Silk Heritage | ST-002 | 9700000002 | Delhi | active |
| Kanchi Collections | ST-003 | 9600000003 | Chennai | active |
| Banarasi House | ST-004 | 9500000004 | Varanasi | trial |
| Patola Palace | ST-005 | 9400000005 | Surat | active |

**Staff PINs** — manager `1234`, salesperson `2345` (per store)

**Customers** — OTP `123456`, password `Customer@123`:

| Name | Phone | Tier | Points |
|---|---|---|---|
| Ananya Mehta | 9900000001 | Silver | 3,200 |
| Lakshmi Iyer | 9900000003 | Gold | 8,500 |
| Prerna Joshi | 9900000005 | VIP | 16,000 |

**Tailors** — OTP `123456`, password `Tailor@123`: Manoj Darji (TL-001, Mumbai), Geeta Bai (TL-004, Chennai)

**Kiosk pairing:** Store ID `ST-001`, Tablet Code `123456`, Customer OTP `123456`

**Seed commands:**
```bash
npx convex run seed:seedAll '{}'
npx convex run seed:seedRelational '{}'
```

Also see [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md) at repo root.

## 9. Conventions

- **Auth:** phone-first (OTP + optional password). Better Auth wired but session middleware not yet enforced across all modules.
- **Styling:** Tailwind v4 with custom warm palette (ivory `#FDF8F2`, maroon `#7B1D1D`, gold `#C9941A`) in [app/globals.css](app/globals.css).
- **State:** client components use `useQuery` / `useMutation` from `convex/react` — all live-subscribed, no polling.
- **Naming:** Components `PascalCase`; Convex tables `camelCase`; indexes `by_fieldName`. Convex function files organized by domain.
- **i18n:** all kiosk + customer strings pulled from [lib/i18n.ts](lib/i18n.ts).
- **File uploads:** Convex `_storage` references in schema; helper in `lib/useUpload.ts`.
- **Don't add:** speculative abstractions, comments that restate code, backwards-compat shims for unreleased changes.

## 10. Dev Setup

```bash
npm install
npm run dev               # Next.js + Convex backend in parallel
npx convex dev            # Convex backend CLI standalone
npx convex dashboard      # Open Convex dashboard
npx convex run seed:seedAll '{}'   # Seed demo data
```

`.env.local` already has the Convex deployment URL.

## 11. Recent Work & Next Steps

**Completed (as of 2026-04-17):**
- Admin shell + 18-section sidebar nav
- Dashboard (Overview, System Health, Cost, API, Analytics tabs)
- Store registry, detail view, 8-step onboarding wizard
- Device fleet list + telemetry detail
- Seed script (5 stores, staff, customers, tailors, mirror/tablet)
- Kiosk staff 4-digit PIN login + trial room access codes
- Tablet session flow + staff PIN auth
- Customer PWA: looks, wishlist, preferences
- Tailor orders + referral management
- Kiosk 9-language support

**Next priorities:**
1. Secure session middleware (Better Auth across admin + all modules)
2. Real data for placeholder admin pages (agents, models, revenue, network, support, legal, security, data-governance, vendors, releases, resilience)
3. Real-time device telemetry dashboard (CPU/GPU/FPS/temp)
4. Campaign builder + email/WhatsApp send integration
5. AI agent control plane UI (pause/resume, tool registry)
6. Billing + invoice generation UI
7. Support ticket system with AI diagnosis
8. DPDP consent enforcement UI

---

**Maintenance:** when modules, tables, or major flows change materially, update the relevant section here so future sessions stay accurate.
