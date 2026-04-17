# Wearify — Codebase Context

> Persistent reference for Claude Code sessions. Read this first to orient before exploring.

## 0. Working style (applies every session)

- **Ask before you code when the ask is vague.** If the user's request is ambiguous, under-scoped, or could reasonably be interpreted multiple ways, ask a focused clarifying question first. Guessing and redoing is more expensive than one round-trip.
- **Log substantial changes to section 12.** After a meaningful change — new feature, schema change, cross-module refactor, non-obvious design decision, or anything a future session would have to re-derive from code alone — append a concise entry to the Conversation Log below. Keep small fixes out of it.

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

## 12. Conversation Log — engineering decisions taken

Reverse-chronological. Each entry = a reason-to-exist for surrounding code. When extending or changing any of these, read the rationale first so you don't regress the intent.

### Kiosk session persistence + store logo upload

- **Refresh-logs-out problem:** kiosk customer state (`customerId`, `sessionId`, `customerName`, `phone`, `lang`, `hasBodyScan`) lived only in React `useState`, so any browser refresh dumped the user back at idle. Fixed with a `wearify_kiosk_session` localStorage record. On mount, a `useEffect` in [app/kiosk/page.tsx](app/kiosk/page.tsx) restores the session and lands directly on `home` (skipping login/scan). `handleWipe` deletes the key. Writes happen at OTP verify, tablet code entry, and new-customer register; `hasBodyScan` is re-persisted when `BodyScanScreen` completes so a mid-session refresh doesn't force a rescan.
- **Store logo pipeline:** `stores.update` now accepts `logoFileId`. [app/store/settings/page.tsx](app/store/settings/page.tsx)'s identity-card avatar is click-to-upload (uses `useUploadFile` from [lib/useUpload.ts](lib/useUpload.ts)); displays the uploaded logo via `api.files.getUrl`, falls back to initial. Kiosk `StoreBrand` already reads `storeData.logoFileId`, so the logo flows into the kiosk top-bar automatically.
- **Retention diagnostic:** added a one-line `console.log("[kiosk hydrate]", ...)` inside the hydration effect so users can verify what `listTrialCart` / `listWardrobeByCustomer` actually returned when retention looks off. Remove once confident.

### Shared `SareeThumb` — end image-invisibility across tablet + kiosk

- **Problem:** Image uploaded via `/store/inventory/add` (written to `sarees.imageIds[]`) never appeared in `/tablet/catalogue` or kiosk. Root cause: only `/store/inventory` had any code to render images — tablet and kiosk both drew gradient-only placeholders because they were built before the upload flow existed.
- **Fix:** extracted [`components/SareeThumb.tsx`](components/SareeThumb.tsx) as the single source of truth. Three-tier fallback: local `SAREE_IMAGE` map (seeded saree names → `/public/inventory/*` files shipped with the repo) → `api.files.getUrl({ fileId: imageIds[0] })` via Convex Storage → gradient placeholder (with optional centered emoji overlay). Fills parent; size/position controlled by wrapper div.
- **Call sites wired:** `/store/inventory` (grid thumb), `/tablet/catalogue` (grid + previous-shortlist 8x8 pills), `/tablet/catalogue/[id]` (detail hero), kiosk `SareeCard` (home grid, 130% aspect), kiosk `ProductDetailScreen` (38% hero), kiosk `TrialRoomScreen` (56x56 list thumb + full-bleed right-panel preview), kiosk `WardrobeScreen` (2-col grid), kiosk `OrderScreen` (64x64 cart thumb).
- **Schema note:** added `imageIds?: Id<"_storage">[]` to the kiosk-local `SareeItem` type (was missing even though the DB row has it).
- **Not touched:** `/c/looks`, `/c/wishlist` — those have a different priority chain (`look.imageFileId` takes precedence over `saree.imageIds[0]`) documented earlier in this log; leave them alone.

### Kiosk retention — body scan + wardrobe + trial cart per (customer, store)

- **Problem:** Returning customer `9061890670` at kiosk never saw the "Welcome back" screen, and trial room + wardrobe were empty every visit.
- **Root causes (all pre-existing on main, not merge-related):**
  1. `BodyScanScreen` was pure UI — countdown then `onCapture()`, no mutation. Only seeded customers (Ananya, Deepika) had `lastBodyScan` set via `seed.ts`.
  2. `wardrobeItems` was pure React state. The `wardrobe` table persisted items but kiosk never queried them back.
  3. No persistence layer for trial items at all — React state only, reset each session.
- **Fix — backend:**
  - `customers.recordBodyScan({ customerId, bodyScanFileId? })` ([convex/customers.ts](convex/customers.ts)) — patches `lastBodyScan = Date.now()`. `bodyScanFileId` optional since kiosk BodyScanScreen is currently fake-capture (no real photo upload yet).
  - New table `kioskTrialCart` ([convex/schema.ts](convex/schema.ts)): `{ customerId, storeId, sareeId, addedAt }` + indexes `by_customer_store`, `by_customer_store_saree`. Separate from `wardrobe` to keep "trying now" vs "saved for later" distinct.
  - `sessionOps.addTrialCartItem` / `removeTrialCartItem` / `clearTrialCart` / `listTrialCart` — idempotent per `(customer, store, saree)` triple.
- **Fix — frontend kiosk** ([app/kiosk/page.tsx](app/kiosk/page.tsx)):
  - `BodyScanScreen.onCapture` now calls `recordBodyScan({ customerId })` before navigating to `aiProcessing`. Fire-and-forget; guests skip.
  - Hydration effect: on `(customerId, storeId, allSarees)` ready, queries `listWardrobeByCustomer` (filtered by `storeId` via saree lookup) and `listTrialCart`, maps ids to `SareeItem` via the store's catalog, and **merges** (not replaces) into local state. `hydratedRef` keys on `${customerId}:${storeId}` and is reset in `handleWipe` so re-logins rehydrate.
  - Every `setTrialItems` add/remove site mirrors to `addTrialCartItem` / `removeTrialCartItem` (gated on `customerId` — guests don't persist). Covers: `onSendToTrial` (home), `onAddToTrial` (product detail), `onRemoveItem` (trial room), `onAddToWardrobe` (move trial→wardrobe deletes from cart), and `codeEntry` shortlist load.
- **Consequence:** any customer who completes a body scan once at a store will see the "Welcome back" `ScanChoiceScreen` on next visit (valid for `CFG.scanValidMonths = 6`). Wardrobe + trial cart persist per `(customer, store)` across sessions.
- **Deferred (flagged):** wardrobe rows are NOT deleted when the customer checks out — purchased items stay visible on return. Handle later via `removeFromWardrobe` mutation from checkout handler.

### `release` branch — merge of `main` + `origin/frontend`

- **Why:** teammate's `origin/frontend` branch restyled `/store/*` while `main` evolved independently (customer module, kiosk newCustomer capture, settings sub-pages, schema additions). Needed an integration branch with main's logic and frontend's `/store` visuals.
- **Rule:** main logic wins globally; `/store` follows frontend visually; kiosk stays on main.
- **Taken from frontend (clean):** `/store/analytics`, `/store/campaigns`, `/store/customers/*`, `/store/inventory/*`, `/store/layout`, `/store/login`, `/store/page`, `/store/staff`, `/store/store-theme.css`, `public/inventory/*` images, `package-lock.json`.
- **Reverted to main (frontend's changes dropped):** `app/kiosk/page.tsx`, `app/kiosk/layout.tsx`, `app/kiosk/kiosk-theme.css` — frontend's font swap (Cormorant/DM Sans → Montserrat/Roboto) and colour token rename would have broken main's kiosk CSS references + newCustomer capture flow.
- **Manually reconciled:** [app/store/settings/page.tsx](app/store/settings/page.tsx) — kept frontend's redesigned UI (`Toggle`, `SettingsRow`, gradient subscription card, inline profile edit, inline notification toggles). Kept main's `useRouter`-based logout + formatted `nextBilling` date. Wired `Staff & Roles → /store/staff` and `Upgrade → /store/settings/billing`. Dropped unused `SETTINGS_ITEMS` constant. Main's sub-page routes (`/store/settings/{profile,notifications,billing}`) still exist but are only reachable for billing; profile/notifications are now edited inline on the main settings page.
- **Convex:** all `convex/*` files byte-identical to main after merge — no logic loss.
- **Commits:** `182d92a` (merge) + `57f52a0` (missed Staff & Roles onClick wiring).
- **State:** local only; not pushed.

### Visit count consistency — `/c/me` + per-store breakdown

- **Problem:** `/c/me` showed "0 Visits" while `/c/me/history` showed "1 visit" for the same customer. `/c/me` was reading the denormalised `customers.totalVisits` column; nothing bumps it. `/c/me/history` reads the `visitHistory` table directly.
- **Fix:** `/c/me` now queries `customers.listVisitHistory` and derives count from rows — single source of truth. `customers.totalVisits` marked **deprecated** in schema; do not read/write.
- **Added:** per-store breakdown card on `/c/me/history` — aggregates visits per storeId, renders "BY STORE" pill list above the timeline.

### Session → visit/link wiring + backfill

- **Problem:** Kiosk sessions wrote `looks`/`wardrobe` but never `customerStoreLinks`/`visitHistory`, so Store Locator + Visit History + home "My Stores" were always empty for anyone not seeded.
- **Forward fix** ([convex/sessionOps.ts](convex/sessionOps.ts)):
  - New `ensureStoreLink(ctx, customerId, storeId)` helper — idempotent create-or-touch; called from `createLook` and `addToWardrobe`. Inserts `customerStoreLinks` with `visits: 0` (session-end owns the counter).
  - `endSession` now idempotently (skips if already `"completed"`) inserts a `visitHistory` row and bumps `customerStoreLinks` (`visits +1`, `lastVisit`, `clv += spentInSession`, promotes segment `New → Regular` at visits ≥ 2). Derives `sareesTried` from `session.sareesTriedOn` or looks count; detects `purchased` from orders filtered by sessionId.
- **Backfill** (two `internalMutation`s, idempotent, never overwrite existing rows):
  - `sessionOps:backfillStoreLinksFromActivity` — walks looks + wardrobe + orders, derives missing `(customerId, storeId)` pairs, creates links. Wardrobe rows resolve `storeId` via their saree.
  - `sessionOps:backfillVisitHistoryFromSessions` — walks `sessions` table, inserts missing `visitHistory` rows keyed by `(customerId, sessionId)`.
  - Run with: `npx convex run sessionOps:backfillStoreLinksFromActivity '{}'` and `...:backfillVisitHistoryFromSessions '{}'`.

### Customer module standardisation (big bang)

- **Schema changes** on `customers` ([convex/schema.ts](convex/schema.ts)): added `dateOfBirth`, `gender`, `heightCm`, `heightUnit`, `email`, `city`, `photoFileId`, `profileComplete`. Added `by_customerId` index on `wardrobe`.
- **Centralised creation** ([convex/customers.ts](convex/customers.ts)):
  - `ensureCustomerByPhone(ctx, phone, opts)` — shared helper. Idempotent get-or-create. Backfills missing name/DOB/language when caller supplies them; never overwrites.
  - `ensureByPhone` mutation — public wrapper used by kiosk (no login session needed).
  - `completeProfile(customerId, ...full)` — onboarding save; validates DOB format + height range; sets `profileComplete: true`.
  - `updateProfile` — extended with all new fields; auto-recomputes `profileComplete` on any edit.
  - `computeInitials(name)` — avatar fallback helper.
- **All creation surfaces route through the shared helper:** `phoneAuth.register` customer branch and `phoneAuth.loginWithOtp` customer branch both call `ensureCustomerByPhone` — single code path. `phoneAuth.loginWithOtp` takes `allowCreate: v.optional(v.boolean())`; defaults false (unknown phone returns `{ success: false, error: "no_account", errorCode: "NO_ACCOUNT" }`). Only `/c/register` and tablet register pass `allowCreate: true`.

### /c as a mobile app shell (splash → login/register split)

- **Splash** ([app/c/layout.tsx](app/c/layout.tsx)): full-screen plum→gold gradient with "W" monogram + "WEARIFY · TRY ON THE MOMENT". Renders over everything on initial mount for `SPLASH_MS = 1200`. `PUBLIC_ROUTES = {/c/login, /c/register}` are shell-less (no bottom nav).
- **Login** ([app/c/login/page.tsx](app/c/login/page.tsx)): existing users only. Unknown phone → gold-bordered "No account found" card appears on the OTP step with a "Register as new user" CTA that carries the typed phone into `/c/register?phone=...`. "New user? Register" link below the Send OTP button.
- **Register** ([app/c/register/page.tsx](app/c/register/page.tsx)): 3-step wizard with 3-dot progress bar. Phone → OTP (via `verifyOtp`) → profile form (photo / name / DOB / gender / height cm↔ft-in / city / email). On finish: `loginWithOtp({ allowCreate: true })` → `completeProfile` → `/c`.
- **Onboard-force gate removed** in `/c/layout.tsx`. Legacy `/c/onboard` route deleted — `/c/me/profile` is the "complete profile later" surface.

### Tablet register — mirrors /c/register

- [app/tablet/register/page.tsx](app/tablet/register/page.tsx) rebuilt to 3-step flow: phone → OTP → full profile (same fields as `/c/register`). Uses shared `loginWithOtp({ allowCreate: true })` + `completeProfile` pipeline. Tailwind styling matches tablet theme; helpers imported from [lib/profileHelpers.ts](lib/profileHelpers.ts).

### Kiosk first-time customer capture

- Added **`newCustomer` screen** in [app/kiosk/page.tsx](app/kiosk/page.tsx): when OTP verifies but customer is unknown, navigate to this screen. Captures minimal set (name + DOB — "13+" guard). Submits via `customers.ensureByPhone` (public wrapper, no session issued). On success, creates the kiosk session and proceeds to consent. Returning customers skip it.

### Shared profile helpers

- [lib/profileHelpers.ts](lib/profileHelpers.ts) is the single source of truth for `cmToFtIn` / `ftInToCm` / `clampHeightCm` / `ageFromDob` / `initialsOf` / `maxDobToday` / `validateProfile` / `validatePhoto` + constants (`MIN_HEIGHT_CM=120`, `MAX_HEIGHT_CM=220`, `MIN_AGE_YEARS=13`, `MAX_PHOTO_BYTES=4MB`). `/c/register`, `/c/me/profile`, and tablet register all import from here. If onboarding rules change, change them here.

### My Looks images + Wardrobe tab

- **`/c/looks`** ([app/c/looks/page.tsx](app/c/looks/page.tsx)): cards now render actual saree images. Query `sessionOps.listByCustomer` enriched to include `sareeImageId`/`sareeGrad`/`sareeEmoji` from the look's saree. Priority: `look.imageFileId` → `saree.imageIds[0]` → gradient silhouette. `<SareeSVG />` decoration only shows when no image at all.
- **`/c/wishlist`** ([app/c/wishlist/page.tsx](app/c/wishlist/page.tsx)): two-tab UI — **Wardrobe** (kiosk-session saves, via new `sessionOps.listWardrobeByCustomer` query) + **Wishlist** (hearted items, unchanged). Pill tab switcher in plum palette. Hero subtitle reflects active tab's count and value. `/c` home tile renamed **My Wardrobe** (👗) pointing to the same page (defaults to Wardrobe tab).
- Seed extended: `seedRelational` now inserts wardrobe rows for c1, c2, c3, c5 with drape style + accessories + neckline, so the Wardrobe tab is populated out of the box.

### Multi-device login fix

- **Problem:** `users.sessionToken` was a single field overwritten on every login → logging in on device B silently invalidated device A because `useQuery(validateSession)` is reactive.
- **Fix:** new `userSessions` table (`userId`, `token`, `role`, `expiresAt`, `createdAt`, indexes `by_token` + `by_userId`). `createSession(ctx, userId, role)` helper inserts a session row per device. `validateSession` reads from this table. `logout` deletes only the current session; new `logoutAll` nukes every session for a user. `sessionToken`/`sessionExpiry` fields on `users` are deprecated.

### Admin ↔ Store bidirectional data audit

- **Admin onboard wizard** ([app/admin/stores/onboard/page.tsx](app/admin/stores/onboard/page.tsx)): used to discard Step-6 staff entries. Fixed — loops `api.stores.createStaff` after `createStore` so staff captured during onboarding appear in `/store/staff` immediately.
- **Admin store detail Edit tab** ([app/admin/stores/[id]/page.tsx](app/admin/stores/[id]/page.tsx)): `MRR`, `Next Billing Date` inputs added; `hours` was collected but never saved — fixed. All now flow via `api.stores.update` and propagate live to `/store/settings/billing` + profile.
- **Store settings sub-pages** ([app/store/settings/*](app/store/settings/)):
  - `/store/settings/profile` — editable name, address, area, PIN, city, state, hours, closed-on, owner name/email.
  - `/store/settings/notifications` — WhatsApp/Email/SMS channel toggles + WhatsApp number field.
  - `/store/settings/billing` — read-only plan, MRR, billing cycle, next billing date, agreement status, payment method, bank, GSTIN/PAN.
  - Staff & Roles tile links to existing `/store/staff`.
- **Admin Tailors tab** — `+ Add Tailor` button on `/admin/stores` → Tailors. Opens inline form (name / phone / city / specialty). Uses existing `api.tailorOps.registerTailor` (same mutation tailor self-register uses), so the new tailor can immediately log in at `/tailor/login` with OTP `123456`. Duplicate-phone error surfaced inline.
- **stores.update mutation** extended with: `state`, `address`, `pin`, `area`, `hours`, `closedOn`, `ownerName`, `ownerEmail`, `whatsappNumber`, `notifyWhatsApp/Email/Sms`, `nextBillingDate`.
- **stores schema** gained: `nextBillingDate`, `notifyWhatsApp`, `notifyEmail`, `notifySms`.

### Test credentials still valid

Seed customers/stores/tailors all continue to work with OTP `123456`. See section 8 above.

---

**Maintenance:** when modules, tables, or major flows change materially, update the relevant section here so future sessions stay accurate. Append to section 12 when solving a non-obvious bug or making a design decision that future-you (or a new Claude session) would otherwise have to re-derive from scratch.
