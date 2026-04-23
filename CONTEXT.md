# Wearify — Codebase Context

> Persistent reference for Claude Code sessions. Read this first to orient before exploring.

## 0. Working style (applies every session)

- **Ask before you code when the ask is vague.** If the user's request is ambiguous, under-scoped, or could reasonably be interpreted multiple ways, ask a focused clarifying question first. Guessing and redoing is more expensive than one round-trip.
- **Log substantial changes to section 12.** After a meaningful change — new feature, schema change, cross-module refactor, non-obvious design decision, or anything a future session would have to re-derive from code alone — append a concise entry to the Conversation Log below. Keep small fixes out of it.
- **Never delete the CONTEXT.md file.** This file is the persistent memory of the project. If you need to update it, append to it. If it becomes corrupted, restore it from the last known good version.
- **Commit the changes accordingly after each substantial change.** 

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

### Customer feedback loop — wired to last visit, surfaced on store customer detail

- **Problem:** `/c/me/feedback` wrote feedback rows with `storeId: "general"` — not a real store id, so `listFeedbackByStore` (which is exact-match on `storeId`) never picked them up. The page's own tile copy promised "Share feedback on your last store visit" but nothing in the flow identified the last visit. Feedback was write-only dead data.
- **Fix — write path:** new `customers.getLastVisit({ customerId })` query returns the most-recent `visitHistory` row (or null) via the `by_customerId` index. `/c/me/feedback` subscribes to it and, on submit, passes the row's real `storeId` + `sessionId` to `submitFeedback`. Hero now shows "How was {storeName}?" with the visit date. If `getLastVisit` returns `null`, page renders a dedicated empty state ("No visits yet") instead of letting the user submit orphan rows.
- **Fix — read path:** new `customers.listFeedbackByCustomerAndStore({ customerId, storeId })` query (indexed `by_customerId`, filtered to `storeId` in memory — per-customer feedback is small). Consumed by a new **Feedback tab** on [app/store/customers/[id]/page.tsx](app/store/customers/[id]/page.tsx) showing: avg rating + count badge in the header, then per-row stars + chips (as teal pills) + serif-italic comment + session attribution (`SESSION <id>` in mono). Empty state if no feedback yet.
- **Not in this pass (flagged):** duplicate-rating guard (customer can currently rate the same visit twice — each click creates a new row), staff attribution on feedback (would need feedback rows to carry `staffId` from the session for coaching patterns), `/store/analytics` rating rollup, `/admin/network` cross-store ratings, and a post-checkout kiosk nudge to collect feedback while the visit is fresh. Foundation is now in place — any of these is a pure add-on.
- **Caveat:** pre-existing `feedback` rows written with `storeId: "general"` are not migrated. They'll sit in the table unread. If volume is non-trivial, add an internal mutation that maps each legacy row to the customer's nearest-in-time `visitHistory` row by `customerId + date`. Currently deferred.

### Tailor ratings — recompute-from-orders + real `/tailor/profile/ratings` page

- **Driver:** the menu item "Ratings & reviews" on `/tailor/profile` just pointed at `/tailor/orders`. And the running-average on `tailors.rating` had two correctness holes: it drifted because of repeated `round × 10` on each add, and it was irreversible — if an order rating was ever edited/deleted/cancelled post-rating, the aggregate couldn't be corrected without scanning anyway. So: fix the write path and build the read surface it deserved.
- **Canonical source is now `tailorOrders`.** New private helper `recomputeTailorRating(ctx, tailorId)` in [convex/tailorOps.ts](convex/tailorOps.ts) scans the tailor's orders, computes `sum / count` with a single round, and patches both `rating` and `reviewCount` on the tailor row. `rateOrder` calls it instead of doing incremental math. Any future `editRating` / `deleteRating` / cancel-clears-rating path just calls the same helper — no special cases.
- **`backfillTailorRatings` internalMutation** one-shot to correct drift from orders written under the old math. Run with `npx convex run tailorOps:backfillTailorRatings '{}'` when ready. Not wired to anything — safe to call multiple times (idempotent by construction).
- **New query `listReviewsForTailor({ tailorId })`** returns `{ reviews: [...], distribution: [1★count, 2★count, 3★count, 4★count, 5★count] }`. Reviews carry `{ rating, comment, service, orderDate, customerMasked }`. Masking is **first name + last-initial** via local `maskCustomerName` helper — product default; change there if marketing wants different PII rules.
- **`rateOrder` now range-checks** `1 <= rating <= 5` (previously accepted anything). Throws early before patching.
- **New route [app/tailor/profile/ratings/page.tsx](app/tailor/profile/ratings/page.tsx)** — uses `.t-*` design system. Summary card with big serif `avg/5`, star row, and a 5-row distribution bar (maroon→gold gradient, normalized to the tallest bucket so a single 5★ still fills visually). Review list renders customer handle + service + date + stars, with the comment pulled out in serif italic if present. Empty state if `total === 0`.
- **Menu wiring:** `MENU_ITEMS` in [app/tailor/profile/page.tsx](app/tailor/profile/page.tsx) now points "Ratings & reviews" at `/tailor/profile/ratings`. Two other `href: "#"` entries (Language, Privacy, Help) are still placeholders and render greyed-out.
- **Not built yet (flagged):** customer-facing review display on the kiosk "Connect tailor" card — the `listReviewsForTailor` query is already public so a future customer-side render is a pure UI task, no backend changes needed.

### Tailor login "takes 2 attempts" — stale-state bailout (mirrors customer-layout fix)

- **Symptom:** on `/tailor/login`, first successful OTP bounced the user straight back to login; second attempt worked. Same bug the customer layout already fixed.
- **Root cause** in [app/tailor/layout.tsx](app/tailor/layout.tsx): after `router.replace("/tailor")`, the layout re-renders with React state still holding the previous token and Convex's cached `validateSession` result (`null`, because the prior token was invalid). Both `useEffect`s run after that render — and the session-watcher effect fires first with `session === null` on the stale token, calls `redirectToLogin()`, and wipes the freshly-written new token from localStorage before the token-reader effect has a chance to re-sync React state.
- **Fix:** guard the session-watcher with `if (token !== localStorage.getItem("wearify_auth_token")) return;` so we never act on a `session === null` read against a token React is about to replace. Also added `pathname` to the token-reader's deps (so it re-runs on same-layout navigations even if `isLoginPage` happens not to flip), and `setToken(null)` on the "no saved token" branch to keep React state in sync with the cleared localStorage.
- **Prior art:** [app/c/layout.tsx:151-163](app/c/layout.tsx#L151-L163) and [:175-201](app/c/layout.tsx#L175-L201). If any other module layout adopts the "token in React state + useQuery(validateSession, {token})" pattern, copy this guard — don't re-derive.

### Security audit — remaining CRITICALs (trial-room rate limit + PIN hashing + password PBKDF2 + admin server gate)

- **Context:** follow-up to the "do now" batch below. Closes the four CRITICAL items left open in [REVIEW.md](REVIEW.md) (#1 password hashing, #4 trial-room enumeration, #5 admin client-side auth, #6 plaintext staff PINs). Tackled in ascending blast-radius so each landed as its own verifiable commit.
- **[convex/authCrypto.ts](convex/authCrypto.ts) — shared PBKDF2 helpers.** Single source of truth for password / PIN hashing. PBKDF2-SHA256, 100k iterations, 16-byte per-row salt, all via `crypto.subtle` so the file stays in the default Convex runtime (no Node action required). Exports `generateSalt`, `hashWithSalt`, `constantTimeEquals`. Reused across phoneAuth, stores, and seed.
- **Trial-room enumeration (#4).** `validateCode` was an unauth'd query with no rate limit → attacker could brute-force the 1M code space in seconds. Fix:
  - Converted `query → mutation` so we can write (queries can't).
  - New `trialCodeAttempts` table, one row per storeId, rolling 5-min window. Pre-check rejects further calls once a store hits 20 failed attempts in the window.
  - Kiosk UI ([app/kiosk/page.tsx](app/kiosk/page.tsx)) switched to `useMutation` and calls on Continue press instead of reactively on typing — UX is indistinguishable.
- **Staff PIN plaintext + unlimited retries (#6, partial #14).** PINs were stored as raw strings with a `by_storeId_and_pin` equality index and unlimited login attempts. Fix:
  - Schema: `staff.pin` now optional (kept readable for un-migrated rows); new `pinHash`/`pinSalt` fields hold the salted hash; `by_storeId_and_pin` index dropped.
  - `createStaff`/`updateStaff` in [convex/stores.ts](convex/stores.ts) hash on write and check uniqueness via the shared `findStaffWithPin(ctx, storeId, plaintextPin)` scan helper (staff tables are small — max ~20 rows per store).
  - `staffPinLogin` in [convex/phoneAuth.ts](convex/phoneAuth.ts) now rate-limits per storeId (new `staffPinAttempts` table, 10-min window, 30 fails), does constant-time hash compare, and **lazy-migrates** any legacy plaintext row to hash on first successful login (no forced reset). Failure window is cleared on success.
  - [convex/seed.ts](convex/seed.ts) hashes PIN inline so fresh seeds never write plaintext.
- **Password hashing (#1).** SHA-256 + hardcoded static salt → PBKDF2 with per-user salt. Same dual-read migration pattern:
  - Schema: added `passwordSalt` next to `passwordHash` on `users`, `customers`, `tailors`.
  - New `verifyPassword(password, { passwordHash, passwordSalt })` accepts both formats — returns `{ ok, legacy }`. Login path calls `rehashUserAndEntity` on legacy match so the user row + the mirrored customer/tailor row both upgrade transparently.
  - `register`, `setPassword`, and all seed paths always write new format via `makePasswordRecord`. Seed's old static-salt SHA-256 constants are gone.
  - Demo credentials (`Store@123` / `Customer@123` / `Tailor@123`) still work — they're just rehashed at seed time.
- **Admin server-side gate (#5, narrow scope).**
  - New [convex/adminAuth.ts](convex/adminAuth.ts) exports `requireAdmin(ctx)` — fetches the authenticated Better Auth user via `authComponent.safeGetAuthUser`, checks `email` against an allow-list (currently `admin@wearify.com`, mirroring the client), throws `UNAUTHORIZED: admin access required` otherwise.
  - Applied to the two mutations that are strictly admin-only: `stores.create` (admin onboarding wizard) and `tailorOps.updateVerification` (KYC approve/reject). The old client-side email check in [app/admin/layout.tsx](app/admin/layout.tsx) stays as UX gatekeeping, but it's no longer the only line of defence.
  - **Not yet protected** (deferred — needs role-aware auth, not just "admin or nothing"): `stores.update`, `stores.createStaff`/`updateStaff`/`removeStaff`, `tailorOps.registerTailor`. Each is called by BOTH admin and the relevant entity owner, so a blanket `requireAdmin` would break the store/tailor self-serve flows. These need an ownership check (`isAdmin OR ownsStore(storeId) OR ownsTailor(tailorId)`) which depends on the still-pending unified session middleware. Flagged in REVIEW.md item #13.
- **Still open from REVIEW.md** (intentionally deferred to the session-middleware pass): #7 rate limiting on login & OTP (staff PIN rate limit landed here as a partial), #10 kiosk localStorage device identity, #11 localStorage leakage, #13 server-side authz on remaining queries/mutations, #14 full per-staff PIN lockout, #20 sliding session expiration, #21 password reset. All discussed inline above.
- **Verification:** `npm run type-check` clean on each commit. No new lint issues; the handful of remaining `any`-warnings in stores.ts / seed.ts / tailorOps.ts predate this work.

### Security audit — "do now" batch (crypto RNG + trial-room PII narrowing + small bugs)

- **Context:** audit in [REVIEW.md](REVIEW.md) flagged 6 CRITICAL / 5 HIGH issues. Split into two passes: the cheap, isolated, non-architectural wins go now; the auth-shaped ones (admin client-side gate, kiosk device auth, server-side query authz, rate limiting, bcrypt, PIN hashing) get bundled with the upcoming "secure session middleware" work so they aren't redone.
- **[convex/phoneAuth.ts](convex/phoneAuth.ts):**
  - `generateToken` — `Math.random()` → `crypto.getRandomValues(Uint8Array(48))` with modulo-mapping onto the 55-char alphabet. Sessions are no longer predictable.
  - New `generateSixDigits` helper, also Web-Crypto sourced; used to build `TL-xxxxxx` tailor IDs (previously `Math.random()` — enumerable).
  - `staffPinLogin` now rejects `status === "inactive"` with a distinct error message (previously silently returned success for deactivated staff).
- **[convex/trialRoom.ts](convex/trialRoom.ts):**
  - `generateNumericCode` — `Math.random()` → `crypto.getRandomValues`. Space is still 1M — real brute-force defence still needs rate limiting on `validateCode`, flagged for the auth pass.
  - `validateCode` response narrowed. Dropped `customerPhone` from the `trialRoom` block (unused in UI — confirmed by grep). `customer` now projects only `{_id, name, phone, lastBodyScan, language}` instead of the full row, so a guessed code can't exfiltrate email / body measurements / preferences / password hash.
- **[convex/customers.ts](convex/customers.ts):** `completeProfile.dateOfBirth` now goes through a new `isValidIsoDate` helper that round-trips via `new Date(s + "T00:00:00Z").toISOString().slice(0,10)` — so `2024-02-30` is now rejected instead of being silently rolled to March 1 by `Date.parse`. `updateProfile` still only trims (noted as a lesser concern; pair with any future schema-side DOB cleanup).
- **Review item #8 (typo in files.ts) was stale** — [convex/files.ts:53](convex/files.ts#L53) already reads `shopLicenseFileId`. No change needed.
- **Explicitly deferred** (need the auth pass, not piecemeal patches): bcrypt with per-user salt (item 1), admin client-side gate (5), staff PIN plaintext (6), rate limiting (7), kiosk localStorage identity (10, 11), server-side authz on queries (13), PIN lockout (14). Password-reset + billing + virus scanning are feature roadmap, not security debt.
- **Type-check clean** (`npm run type-check`).

### Customer route rename — /c/wishlist → /c/wardrobe

- **Why:** Wardrobe (kiosk try-on saves) is the headline customer flow; Wishlist (hearted items) is secondary. Route name now matches what the feature is named everywhere else in the UI (home tile "My Wardrobe", kiosk "Wardrobe" screen). The page keeps both tabs; just the hero title flips per active tab.
- **Changes:** folder renamed ([app/c/wardrobe/page.tsx](app/c/wardrobe/page.tsx)); bottom-nav entry label+href updated in [app/c/layout.tsx](app/c/layout.tsx); home-tile router.push updated in [app/c/page.tsx](app/c/page.tsx); seed comment updated in [convex/seed.ts](convex/seed.ts).
- **No redirect shim** added from `/c/wishlist` — it just 404s. Fine for the current demo. If real customers ever bookmark it, add a `redirect()` page.

### /store/orders page — surface kiosk checkouts to the merchant

- **Why:** `sessionOps.createOrder` has always written `orders` rows on kiosk checkout; `listOrdersByStore` existed but no UI consumed it → merchants had zero visibility on kiosk-generated revenue. Caught by the cross-module connectivity audit (2026-04-20).
- **Surface:** new [app/store/orders/page.tsx](app/store/orders/page.tsx) + "Orders" entry in the store sidebar ([app/store/layout.tsx](app/store/layout.tsx)). Stats strip (count / pending / paid / revenue), status filter pills, expandable per-order rows with line items + subtotal/GST/total + session attribution.
- **Not an admin view** — admin already drills into stores, so admin can see per-store orders transitively. Skipped building `/admin/orders` to keep scope tight. Revisit if we ever want cross-store order reporting.

### Campaigns dispatch pipeline (SendGrid/Twilio + demo fallback)

- **Why:** `/store/campaigns` was a silent write-only page — campaigns got created but never actually sent; `sendCampaign` just patched a field. The audit flagged this as "dead-end write". Now the loop is real.
- **New table `campaignSends`** ([convex/schema.ts](convex/schema.ts)) — one row per (campaign, recipient) with `status: "sent" | "simulated" | "failed"`, `error?`, `sentAt`. Kept out of the `campaigns` row because per-recipient status is unbounded and useful for audit / resend logic.
- **Action `dispatchCampaign`** ([convex/campaignOps.ts](convex/campaignOps.ts)) — resolves recipients from `customerStoreLinks` filtered by `segment` (case-insensitive; `"all"` or missing = everyone), then per recipient tries the real provider if env keys are set, else records `"simulated"`. Idempotent: refuses to run if `campaign.status === "sent"`. This is the first Convex action in the codebase — uses `ctx.runQuery`/`ctx.runMutation` to keep DB access out of the action itself.
- **Provider keys** (set in Convex deployment env; absence = simulated mode):
  - `SENDGRID_API_KEY` + `SENDGRID_FROM` — email
  - `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_WHATSAPP_FROM` — whatsapp
  - `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_SMS_FROM` — sms
- **Template substitution:** `{name}` (first name from customer row) and `{store}` are the only supported vars. Add more here if marketing asks — keep the substitution list in sync with the template editor UI.
- **Internal helpers** (`_getCampaign`, `_resolveRecipients`, `_writeSend`, `_markCampaignSent`) are underscore-prefixed so the dispatch action is the only public entry — don't call the helpers directly from the UI, always go through `dispatchCampaign`.
- **UI** ([app/store/campaigns/page.tsx](app/store/campaigns/page.tsx)): Send Now button per unsent campaign + result banner showing sent / simulated / failed / skipped counts. `useAction(api.campaignOps.dispatchCampaign)`.
- **Verified:** ST-001 campaign dispatched to 14 customers, all `simulated` (no provider keys in this deployment). Re-dispatch correctly rejected. `listSendsByCampaign` query returned all 14 rows.

### Kiosk cart persistence + always-on cart icon

- **Problem 1:** Kiosk cart was pure React state (`useState<Array<SareeItem & { qty }>>`), so moving wardrobe items → cart, adjusting qty, or anything else was lost on logout. Inconsistent with wardrobe/trial-room which already persist per `(customer, store)`.
- **Problem 2:** Cart icon in kiosk header was gated on `cartCount > 0` — there was no way to open an empty cart (confusing when the user expected a static nav).
- **Schema:** new `kioskCart` table in [convex/schema.ts](convex/schema.ts) — `{ customerId, storeId, sareeId, qty, addedAt }` + indexes `by_customer_store`, `by_customer_store_saree`. Mirrors `kioskTrialCart` with a `qty` column; kept separate so "items I'm buying" stays distinct from "items I'm trying now" and "items I saved".
- **Backend** ([convex/sessionOps.ts](convex/sessionOps.ts)): `addCartItem` (idempotent upsert, default qty 1), `updateCartQty` (clamps ≥ 1), `removeCartItem`, `clearCart`, `listCart`. Same shape as the trial-cart mutations.
- **Frontend** ([app/kiosk/page.tsx](app/kiosk/page.tsx)):
  - Hydration effect now waits on `savedCart` alongside wardrobe + trial cart; maps rows → `SareeItem & { qty }` via `sareeMap`; merges (not replaces) into local state.
  - `OrderScreen` refactored — no longer takes `setCart`; takes explicit `onUpdateQty(idx, delta)` / `onRemoveItem(idx)` callbacks. Parent wraps each to mirror the change to the server via `updateCartQtyMut` / `removeCartItemMut`.
  - `onMoveToCart` (Wardrobe → cart) dedupes before firing `addCartItem` per new item (avoids double-writes if the user re-enters wardrobe).
  - `onCheckout` fires `clearCart` after order creation succeeds and wipes local cart state.
  - `handleWipe` stays local-only — logout wipes client state, server rows survive, next login hydrates. Matches wardrobe/trial-cart behavior exactly.
- **Cart icon bug:** removed the `cartCount > 0 &&` gate at the `KioskHeader` render site — the icon now always shows; the badge inside `iconBtn` already self-gates on `count > 0`, so the green pill only appears once items are added.

### String-field whitespace hardening — tailors + stores + staff + customers

- **Triggering bug:** Admin-registered "test" tailor wasn't showing up in kiosk Mumbai results. Root cause: `city: "Mumbai "` (trailing space) written to the DB. `listByCity` uses `withIndex("by_city", q => q.eq("city", args.city))`, an exact-match — whitespace kills the match.
- **Class of bug:** any indexed or exact-compared string field is vulnerable. `stores.city` is already indexed (`by_city`); `customers.phone`, `users.phone`, `tailors.phone`, `staff.phone` are all indexed and get exact-matched on login/lookup. One stray space anywhere in the write path silently breaks the read path.
- **Fix at write sites** — all four tables now trim string inputs:
  - [convex/tailorOps.ts](convex/tailorOps.ts) — `registerTailor` and `updateProfile` trim `name/phone/city/area/experience/bio/badge/language/subscription`.
  - [convex/stores.ts](convex/stores.ts) — `create`, `update`, `createStaff`, `updateStaff` trim text fields (name, city, state, address, pin, area, hours, owner fields, whatsappNumber, etc.). Enum fields (status/plan/role) go through untouched.
  - [convex/customers.ts](convex/customers.ts) — `ensureCustomerByPhone` trims the phone arg on entry; `updateProfile` trims name/initials/phone/language/DOB/gender/heightUnit/email/city; `completeProfile` extended to also trim gender/heightUnit/language (already trimmed name/city/email).
  - `listByCity` in [convex/tailorOps.ts](convex/tailorOps.ts) trims the incoming `city` arg as defense in depth.
- **Backfills** — three idempotent `internalMutation`s, run once:
  - `tailorOps:backfillTrimTailorStrings` — scanned 5, touched 1.
  - `stores:backfillTrimStoreAndStaffStrings` — scanned 8 stores + 7 staff, touched 0.
  - `customers:backfillTrimCustomerStrings` — scanned 21, touched 0.
- **Phone caveat:** phone inputs via the `phoneAuth` module already pass through `normalizePhone` which strips whitespace and non-digits. The trims above are belt-and-suspenders for paths that bypass `phoneAuth` (kiosk `ensureByPhone`, direct `stores.createStaff`, etc.).
- **Keep in mind:** if any new indexed string field gets added later, follow the same pattern (trim on create/update, defensive trim on query-by-index, and a one-shot backfill if existing rows might be dirty).

### Kiosk design-system alignment — maroon + Montserrat/Roboto + Lucide icons + inventory-image thumbs

- **Driver:** client-supplied "Modern Design System — Virtual Saree Try-on Kiosk" PDF. Kiosk must feel premium/elegant, be responsive, use icons instead of emojis, and include subtle animation.
- **Palette shift** in [app/kiosk/kiosk-theme.css](app/kiosk/kiosk-theme.css): `--k-maroon` `#6B1A1A` → `#68262A`, `--k-bg` `#F5F0EA` → `#FDF6EE`, `--k-border` → `#C9C9C9`, `--k-text` → `#222222`. Brand font: Cormorant Garamond italic → **Montserrat** (headings/CTA/`.k-brand`/`.k-display`/`.k-heading`); body DM Sans → **Roboto**; mono DM Mono → **Roboto Mono**. Google Fonts `<link>` in [app/kiosk/layout.tsx](app/kiosk/layout.tsx) updated.
- **New CSS primitives** (use instead of inline styles): `.k-btn` + `.k-btn-primary` / `.k-btn-secondary` / `.k-btn-ghost` / `.k-btn-pill` (min-height 48px per touch spec), `.k-input`, `.k-codebox` (OTP/code boxes with `.filled` and `.active` states), `.k-iconbtn` + `.k-iconbtn-badge` (44px round header buttons with count badge), `.k-chip` + `.k-chip-maroon` / `.k-chip-gold` / `.k-chip-green`, `.k-card` / `.k-card-hover`, `.k-divider-gold`, `.k-idle-tag`, `.k-form-col` (scrollable flex:1 + min-height:0 + overflow-y:auto — used by PhoneAuth/OTP/CodeEntry/NewCustomer so the Continue button stays reachable on short desktop viewports).
- **Animations:** `k-breathe`, `k-glow`, `k-spin`, `k-float` + refined `k-popIn`/`k-slideUp`/`k-scaleIn`. Staggered entry via `k-d1…k-d8` delay classes.
- **Icons:** all emojis removed from [app/kiosk/page.tsx](app/kiosk/page.tsx), replaced with `lucide-react` (`Phone`, `Hash`, `Hand`, `Camera`, `Lock`, `ShieldCheck`, `Shirt`, `ShoppingBag`, `ShoppingCart`, `Home`, `LogOut`, `Search`, `X`, `Check`, `Sparkles`, `Scissors`, `Star` filled/outline, `QrCode`, `ChevronLeft`/`Right`, `Delete`, `Minus`/`Plus`, `Loader2`).
- **Card sizing:** home grid `repeat(4, 1fr)` → `repeat(auto-fill, minmax(160px, 1fr))`; horizontal rails `220px` → `170px`; card aspect `130%` → `120%`; inner text trimmed (name 14→13, meta 12→11, price 16→14). Cards pack tighter and wrap responsively.
- **Inventory images wired in:** all saree thumbnails (SareeCard, ProductDetail hero, TrialRoom list + full-bleed preview, Wardrobe card, Cart row) route through the **shared** [components/SareeThumb.tsx](components/SareeThumb.tsx) — `{ name, fileId, grad, emoji, emojiSize, gradientAngle }`. Its three-tier fallback (local `/inventory/*` by name → Convex Storage URL → gradient+emoji) is the single source of truth; do NOT duplicate the `INVENTORY_IMAGES` map inline.
- **Responsive:** `@media (max-width: 820px)` and `(max-width: 520px)` rules shrink numpad buttons, codeboxes, iconbtns, and modal padding for portrait tablets.
- **Pre-existing lint warnings** (`set-state-in-effect` in countdown timers, a few unused vars) were NOT fixed — they predate this pass.

### Tailor module — design re-skin from Claude Design handoff

- Applied the design handoff bundle (`Tailor Module.html`) delivered via `api.anthropic.com/v1/design/h/e0i9RLFnOkv-rzA3yxctng`. Package contained README, chat transcript, styles.css, screens1/2 jsx, components, icons.
- **Only visual changes** — no features added or removed, no queries or mutations touched, every route still lands on the same component. Markup and classes re-written against a new design system.
- **New theme:** [app/tailor/tailor-theme.css](app/tailor/tailor-theme.css) — scoped to `.t-app` so it can't bleed into other modules. Imports via [app/tailor/layout.tsx](app/tailor/layout.tsx), which also loads Cormorant Garamond / DM Sans / DM Mono from Google Fonts.
- **Palette** (reinterpreted warm-premium): softened ivory `#FAF6EF`, deeper ink `#1A1512`, maroon `#7B1D1D`, gold `#B07B1A`, navy `#0D1F35` with ok-green and urgent-red semantic tones.
- **Typography:** Cormorant Garamond italics for serif "atelier" moments (headings, lead names, order titles), DM Sans for body, DM Mono for numbers and prices.
- **Component primitives added** (all `.t-` prefixed): `t-hero`, `t-stat`, `t-lead`, `t-pill` + variants, `t-order-row`, `t-pipeline`, `t-accordion`, `t-pinned-field` (navy-fill hero for bust/waist), `t-portfolio-tile`, `t-upload-tile`, `t-kyc-meter`, `t-service-row`, `t-toggle`, `t-seg` (segmented control).
- **Screens re-skinned:**
  - Dashboard ([/tailor](app/tailor/page.tsx)) — greeting with italic "ji", hero lead callout dominating, stats row, leads preview, in-progress orders.
  - Orders list + detail ([/tailor/orders](app/tailor/orders/page.tsx), [[id]](app/tailor/orders/[id]/page.tsx)) — segmented filters, stitched-pattern thumbnails, pipeline dots with current-step maroon halo, bust/waist pinned as navy fields, rest of measurements in Upper/Sleeves/Neck accordions.
  - Referrals list + detail ([/tailor/referrals](app/tailor/referrals/page.tsx), [[id]](app/tailor/referrals/[id]/page.tsx)) — new-leads urgency banner, lead cards with left-border accent for "new", and a dark hero CTA block for "Convert to order" (dominant action per the design brief).
  - Profile hub ([/tailor/profile](app/tailor/profile/page.tsx)) — identity card with gradient avatar, at-a-glance stats, menu list with dead links greyed out.
  - Portfolio ([/tailor/profile/portfolio](app/tailor/profile/portfolio/page.tsx)) — coaching empty state, 2-col aspect-3/4 tile grid, add-tile at the end, bottom-sheet add form with photo preview.
  - Services editor ([/tailor/profile/services](app/tailor/profile/services/page.tsx)) — serif-input row name with toggle, 3-col price/days inputs.
  - Verification ([/tailor/profile/verification](app/tailor/profile/verification/page.tsx)) — KYC meter with gradient bar, three upload tiles with status dots (not-submitted / pending / verified), badge progression guide.
  - Availability ([/tailor/profile/availability](app/tailor/profile/availability/page.tsx)) — "Currently accepting orders" toggle hero, 7-day pill grid, hour selects.
  - Commission ([/tailor/profile/commission](app/tailor/profile/commission/page.tsx)) — dark hero with total-earned mono number, 10% platform-fee card, ledger list.
  - Edit profile ([/tailor/profile/edit](app/tailor/profile/edit/page.tsx)) — standard form with specialty chip-toggles.
  - Bottom nav redesigned with uppercase labels, maroon active state, and a Leads entry added for direct referrals access (was only reachable via dashboard before).
- **Not touched:** `/tailor/login` still uses the global wearify theme. It works fine under `.t-app` (CSS vars overlay without breaking existing Tailwind classes) but wasn't re-skinned in this pass. Follow-up candidate. `/tailor/orders/create` was re-skinned in a follow-up pass (uses `t-screen` / `t-topbar` / `t-field` / `t-input` / phone prefix cell matching the login `PhoneField`).

### File-upload validation — size + MIME, client + server

- **Problem:** `useUploadFile` accepted any `File` with no size/type checks, and the Convex mutations that consumed the resulting `Id<"_storage">` didn't re-validate. A malicious client could bypass the client and store 100MB files or `.exe`s tagged as saree images.
- **Defence in depth:**
  - [lib/uploadGuards.ts](lib/uploadGuards.ts) — six preset `UploadGuard`s (sareePhoto, portfolioPhoto, storeLogo, customerPhoto, kycDocument, bodyScan) with size + accept lists. Exported `assertFileClient` for pre-upload validation. Values are mirrored in [convex/fileValidation.ts](convex/fileValidation.ts) — **keep them in sync**.
  - [lib/useUpload.ts](lib/useUpload.ts) — `upload(file, guard?)` accepts an optional guard and throws a typed error before hitting the network. Backward-compatible: callers that don't pass a guard still work (though they should).
  - [convex/fileValidation.ts](convex/fileValidation.ts) — `assertFile(ctx, fileId, guard)` fetches metadata via `ctx.db.system.get(fileId)` (per Convex guidelines §"File storage") and throws on size or MIME mismatch. `assertFiles` handles arrays. Error messages match the client exactly so UX is consistent.
  - **Server-guarded mutations:** `tailorOps.submitKycDocument` → kycDocument; `tailorOps.addPortfolioItem` → portfolioPhoto; `stores.update` → storeLogo (when `logoFileId` provided); `customers.updateProfile` and `customers.completeProfile` → customerPhoto (when `photoFileId` provided); `customers.recordBodyScan` → bodyScan; `sarees.create` and `sarees.update` → sareePhoto for each entry in `imageIds[]`.
  - **Client call sites passing matching guards:** `/store/inventory/add`, `/store/settings` (logo), `/tailor/profile/verification`, `/tailor/profile/portfolio`, `/c/me/profile`, `/c/register`, `/tablet/register`. Each surfaces the typed error inline near the input instead of a generic toast.
- **Current limits:** saree 5 MB, portfolio 5 MB, store logo 2 MB, customer photo 4 MB, KYC document 10 MB (image or PDF), body scan 10 MB. Change in both `lib/uploadGuards.ts` and `convex/fileValidation.ts` together.

### Tailor module build-out (items 1–4, 6, 8 from the audit)

- **KYC document upload wired end-to-end.** Schema added `aadhaarFileId`, `panFileId`, `addressProofFileId`, `kycRejectionReason` to `tailors`. New mutation `submitKycDocument({ tailorId, docType, fileId })` — uploads a doc, clears that doc's `verified` flag, clears the rejection reason. `updateVerification` extended to accept a rejection reason and auto-promotes `status` to `"verified"` when all three docs are approved. [convex/schema.ts](convex/schema.ts), [convex/tailorOps.ts](convex/tailorOps.ts).
- **Tailor verification UI** ([app/tailor/profile/verification/page.tsx](app/tailor/profile/verification/page.tsx)) rewritten: real file pickers, inline previews via `useConvexUrl`, three states per doc (Not submitted / Under review / Verified), rejection banner with admin note when present. Replace-on-resubmit UX.
- **Admin KYC approval queue** — brand new route [app/admin/tailors/page.tsx](app/admin/tailors/page.tsx). Tabs for Review / Verified / All. Expandable per-tailor card with side-by-side document previews, per-doc Approve, and a bulk Reject-with-reason. New query `tailorOps.listKycQueue` — tailors who have at least one submitted doc but aren't fully verified. Admin sidebar gets a `Scissors` icon entry.
- **Portfolio image upload** ([app/tailor/profile/portfolio/page.tsx](app/tailor/profile/portfolio/page.tsx)): file picker + local preview in the Add form. `addPortfolioItem` already supported `imageFileId` — just wire up from UI. Grid overlays `ConvexImage` on the gradient so uploaded cards show real photos while legacy entries fall back cleanly.
- **Service pricing editor** — new route [app/tailor/profile/services/page.tsx](app/tailor/profile/services/page.tsx). Reads/writes `tailors.services` array. Active-toggle, add/remove rows, per-row validation before save. Profile index's "Services & Pricing" link now points here (was pointing at `/edit`).
- **Kiosk "Connect tailor" is real.** The dead-end "coming soon" toast is gone. `TailorScreen` now receives `customerId`, `customerName`, `customerPhone`, `storeId`, `storeName` from the parent and, on Connect: writes a `tailorReferrals` row via `createReferral` (fire-and-forget — WhatsApp handoff is the priority) and opens `https://wa.me/...` with a prefilled intro message. [app/kiosk/page.tsx](app/kiosk/page.tsx).
- **Measurements auto-flow into tailorOrders.** `createOrder` now, when the caller doesn't supply measurements explicitly and a `customerId` is attached, pulls bust/waist/shoulder/armLength/backLength/neckDepth{Front,Back}/sleeve/neck from the customer row. Saves the tailor from re-measuring when a referral converts. [convex/tailorOps.ts](convex/tailorOps.ts).
- **Design brief** at [TAILOR_MODULE_BRIEF.md](TAILOR_MODULE_BRIEF.md) at repo root — standalone document meant for sharing with a designer who hasn't seen the codebase.

Not in this batch (deferred): `/c/tailors` customer discovery (item 5 of the audit), auto-commission on order completion (item 5 of the priority list), admin commission-rate config (item 9).

### Staff PIN uniqueness per store

- **Problem:** `staff.pin` had a per-store index (`by_storeId_and_pin` on `staff`) but neither `createStaff` nor `updateStaff` used it. Admins/owners could create two staff in the same store with the same PIN; `staffPinLogin` returns the first index hit, so the second staff silently couldn't log in and analytics got attributed to the wrong person.
- **Backend fix** ([convex/stores.ts](convex/stores.ts)):
  - `createStaff` now validates `^\d{4}$` and rejects duplicate PINs in the same store.
  - `updateStaff` validates on PIN change, fetches the current row to know `storeId`, queries the pair index, and rejects if a *different* staff already holds that PIN.
  - Error messages use the `PIN_TAKEN:` prefix so UIs can distinguish this from generic mutation failures.
- **Frontend fixes** — all three creation surfaces catch the prefix and show inline:
  - [app/store/staff/page.tsx](app/store/staff/page.tsx) — owner self-serve add form; tightened client validation from 4–6 digits to exactly 4.
  - [app/admin/stores/\[id\]/page.tsx](app/admin/stores/[id]/page.tsx) — admin store-detail staff tab; error surfaces in `staffErrors.pin`.
  - [app/admin/stores/onboard/page.tsx](app/admin/stores/onboard/page.tsx) — 8-step wizard step 5 now checks for **duplicate PINs within the list the admin is currently typing** (client-side, before submit) so the activation step doesn't half-commit. Server-side catch on activation jumps back to step 5 with the conflicting row highlighted.

### Codebase review batch — quick/medium wins from the 2026-04-17 audit

Applied the non-architectural subset of findings from the codebase review. Flagged the rest (middleware, httpOnly cookies, CI, `PhoneOtpBox` extraction, kiosk file split, full i18n, Better Auth decision, OTP env-gate, staff PIN rate-limit) for separate sessions — they need decisions or are multi-day.

- **Ownership checks on exposed mutations** ([convex/sessionOps.ts](convex/sessionOps.ts)): `removeFromShortlist` and `markSentToMirror` now require `sessionId` and verify the row's `sessionId` matches; `removeFromWardrobe` takes an optional `customerId` and rejects mismatches. Callers updated: [app/tablet/shortlist](app/tablet/shortlist/page.tsx), [app/tablet/catalogue/\[id\]](app/tablet/catalogue/[id]/page.tsx), [app/c/wishlist](app/c/wishlist/page.tsx).
- **`trialRoom` composite index** `by_code_and_storeId` added to [convex/schema.ts](convex/schema.ts); all three call sites in [convex/trialRoom.ts](convex/trialRoom.ts) (generate, validate, markUsed) now use it instead of `by_code + in-memory filter`. No more cross-store index matches.
- **Dropped the dead `users.by_sessionToken` index.** `userSessions` is the live table; this index was pure waste. [convex/schema.ts](convex/schema.ts).
- **`listWardrobeByCustomer` deduplicates store lookups.** Previously one store query per wardrobe row; now one query per unique `storeId` in the result set. [convex/sessionOps.ts](convex/sessionOps.ts).
- **`generateOrderId` bumped from 6 to 8 chars** — entropy raised from ~30 to ~40 bits, collision horizon pushed out significantly. [convex/sessionOps.ts](convex/sessionOps.ts).
- **Inventory upload parallelized.** `/store/inventory/add` now uploads all photos via `Promise.all` before calling `createSaree`. Orphan-blob risk on partial failure remains until a `deleteFile` mutation is added (noted in review §4.2).
- **`SareeThumb` composes `useConvexUrl` from `lib/ConvexImage`** instead of re-implementing the file-id-to-URL pattern. Also added `loading="lazy"` to the rendered `<img>` tags — kiosk grid no longer eager-loads every thumbnail on mount. [components/SareeThumb.tsx](components/SareeThumb.tsx).
- **`window.location.href` → `router.replace`** in [app/store/login](app/store/login/page.tsx), [app/c/login](app/c/login/page.tsx), [app/c/register](app/c/register/page.tsx). Post-login navigation stays in SPA, no full page reload.
- **Dead kiosk code removed:** the `[kiosk hydrate]` diagnostic `console.log` and the unused `isReturningCustomer` state (superseded by `scanEligibleRef`). [app/kiosk/page.tsx](app/kiosk/page.tsx).
- **New `package.json` scripts:** `type-check`, `format`, `seed`, `seed:relational` — one-liner entry points that were previously only in docs.

Review doc at `~/.claude/plans/now-go-through-entire-zazzy-goose.md` tracks the full finding list and flagged-for-later items.

### `/c/looks` = try-on history (trial entry, not wardrobe save)

- **Problem:** `/c/looks` only showed sarees that were moved to wardrobe — items tried but not saved never appeared. Root cause: `createLook` was only called from `onAddToWardrobe`. Every wardrobe item first passes through trial, but trial-only items were invisible to the Looks feed.
- **Semantic fix:** a "look" is a **try-on event**, not a save commitment. Trial entry IS the try-on — that's when the saree is shown on the mirror. So `createLook` now fires at all three trial-add sites in [app/kiosk/page.tsx](app/kiosk/page.tsx): `onSendToTrial` (home grid multi-select), `onAddToTrial` (product detail single-add), and the `codeEntry` shortlist load (tablet-curated items). Removed the now-redundant `createLook` in `onAddToWardrobe`.
- **Dedupe:** `createLook` in [convex/sessionOps.ts](convex/sessionOps.ts) now short-circuits when a row already exists for `(customerId, sessionId, sareeId)`, using the `by_sessionId` index plus a customerId/sareeId filter. Idempotent across trial add → remove → re-add in the same session. Different sessions still produce distinct looks (each visit is a new try-on occasion).

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
