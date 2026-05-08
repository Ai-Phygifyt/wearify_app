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
- AI try-on integration via Convex action + RunPod serverless (saree-only, dry-run-capable)

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

### Review fixes — kiosk bg-removal + AIProcessingScreen edge cases

Driven by `/review` against the three trial-room commits in this branch (bg-removal, eager body-scan gate, AIProcessingScreen real progress). Five findings shipped in one cleanup commit.

- **F1: TrialTile got stuck on the polishing wave when bg-removal mutation rejected.** The `attachBgRemovedImage` mutation can return `{ patched: false }` for three legitimate reasons (`stale_source`, `already_set`, `no_source`). Before this fix, the queue's `runOne` resolved successfully on a `false` return → `bgStatus.state` became `"done"` → but `cutoutUrl` stayed undefined because no `looks.imageNoBgFileId` was patched. TrialTile's render priority was `if (status === "completed" && cutoutUrl)` for cutout, then `failed`, then a polishing wave when `status === "completed" || bgStatus in [queued|processing]`. With status completed but cutoutUrl missing, `isPolishing` evaluated to true forever. Customer saw a frozen wave. The right-panel `TrialPreviewImage` already had the explicit `bgStatus.state === "failed"` fallback to raw AI render — TrialTile didn't. Two-part fix: (a) `runOne` now THROWS on `{ patched: false }` (so the queue flips to `"failed"`, not `"done"`), and (b) TrialTile gained the same explicit fallback before the wave branch. Both surfaces converge on the same failed-state UX now.
- **F2: AIProcessingScreen 60s safety timer was effectively disabled.** The timer effect's deps array included `[onDone]`, and the parent passed `onDone` as an inline arrow. Every parent re-render (which fires on every reactive query update — `bodyScanInfo`, `sareeLookIds`, `cachedLooksForTrial`, etc.) tore down and recreated the timer. In practice the timer measured "time since last query update" rather than wall-clock time, so the 60s safety path almost never triggered. If RunPod genuinely stuck with no completions, the customer was trapped indefinitely. Fix: pin `onDone` in a ref (`onDoneRef`) updated via post-render effect, and run the timer effect with empty deps so it measures real wall-clock time. Same ref-pattern applied to the auto-advance effect for consistency, though that one's correctness didn't depend on it.
- **F3: orphan PNG cutouts in `_storage` when mutation rejects.** When `attachBgRemovedImage` returns `{ patched: false }`, the cutout PNG was already uploaded to Convex Storage — and nothing referenced it. Each rejection left a dead ~1-3 MB file. New `tryOn.deleteOrphanCutout({ deviceToken, fileId })` mutation: same auth shape as `attachBgRemovedImage` (kiosk device token), validates the file via `assertFile(GUARDS.lookCutout)` so a malicious caller can't delete arbitrary `_storage` rows, then `ctx.storage.delete(fileId)`. The bg-removal queue's `runOne` now calls `cleanup(fileId)` (passed by TrialTile, wraps `deleteOrphanCutout`) on `{ patched: false }` returns. Best-effort: cleanup errors are logged + swallowed. Not retried — the orphan is small enough that one missed delete won't matter, and we'd rather not block the failure path on a network round-trip.
- **F4: bgRemovalQueue module state grew unboundedly across customer sessions.** Kiosks are long-running tabs serving many customers per day. `pending`, `states`, and the `running` flag are module singletons that `handleWipe` (logout) didn't touch. Memory was bounded in practice (states are tiny), but stale `done` entries from previous customers cluttered the map. New `clearBgRemovalState()` export resets `pending` + `states` (and notifies listeners), called from `handleWipe`. The WASM model itself (`removeBgFn`) intentionally STAYS warm — that's the expensive bit, and resetting it would cost 30+ MB on the next customer's first render.
- **F6: AIProcessingScreen caption read "Finishing up" when all looks failed.** The auto-advance effect was gated on `completed >= 1`. If all RunPod jobs failed (`completed === 0`, `failed === total`), no auto-advance fired. The bar showed 100% (failed counts toward pct), the caption read "Finishing up", and the customer waited for the (now-fixed) 60s safety timer. New gate: auto-advance when `(completed + failed) >= total` covers the all-fail case directly. Trial room then shows failed tiles with their existing Retry CTAs.
- **What was NOT fixed** (scoped out of the review per the user's call):
  - F5: AIProcessingScreen useQuery re-subscribes when `sareeLookIds` mutates. Convex dedups internally; not a real issue.
  - F7: rapidly-removed sarees can leave orphan `runTryOn` calls when removal happens before the action resolves. Pre-existing behavior, not introduced by the bg-removal work; small (~₹3 per orphan render); requires a more invasive abort-promise refactor.
- **Files touched:** `convex/tryOn.ts` (new `deleteOrphanCutout` mutation), `lib/bgRemovalQueue.ts` (Job type +`cleanup` field, `runOne` throws on rejection + cleanup, new `clearBgRemovalState` export), `app/kiosk/page.tsx` (TrialTile bg-removal-failed fallback + cleanup wired through `enqueueBgRemoval`, `handleWipe` clears queue state), `app/kiosk/screens/AIProcessingScreen.tsx` (onDoneRef + mount-only safety timer + all-terminal auto-advance).
- **Verification:** type-check clean, build clean, ESLint clean on changed files (the 5 pre-existing `set-state-in-effect` errors at TrialRoomScreen lines 2860/2867/2883 are still there; predate this work).

### AIProcessingScreen — real progress + skip-when-empty

- **What it was:** a 6-second cosmetic countdown screen with a fake linear progress bar that advanced 17%/sec regardless of any actual try-on state. Title "Creating your look" / "Our AI is tailoring it just for you" + a "Securely saved" trust chip. After 6s it called `onDone()` which routed to trialRoom (if items) or home (if none). The screen had no real visibility into what RunPod was actually doing — RunPod renders take ~30-90s per saree, so when AIProcessingScreen exited, tiles in the trial room were still queued/processing. The 6s was a brand buffer, not a progress indicator.
- **What it is now:**
  - **Subscribes to actual look statuses** via a new `tryOn.getLooksByIds({ lookIds })` query that returns `{ _id, status, imageFileId }` per id reactively. The screen reads `trialItems` + `sareeLookIds` from the parent and resolves the ids that have been queued so far.
  - **Bar = (completed + failed) / total**. Failed looks count toward "done" because the trial room handles them with its own Retry CTA — leaving them as in-flight forever would lock the bar at <100%.
  - **Auto-advance on FIRST completion** — the moment one look hits `status === "completed"`, the screen calls `onDone()` and the trial room takes over. Other in-flight items continue rendering with the per-tile gaussian-blur wave animation we shipped in the bg-removal pass.
  - **60-second hard safety timeout.** RunPod cold-starts can take 30-60s; a stuck render shouldn't trap the customer indefinitely. Fires `onDone()` regardless of state at 60s.
  - **Caption flips by state**: in-flight → "Our AI is tailoring it just for you" / all complete (transient before auto-advance) → "All set — opening your trial room" / partial → "Finishing up". Counter line: `X of Y ready · Z failed` (only shows failed when present).
- **Skip when empty.** The body-scan-completion path on [app/kiosk/page.tsx](app/kiosk/page.tsx) used to always `navigate("aiProcessing")` after recordBodyScan succeeded. With the new eager body-scan gate (entry above this one), the common case for body-scan completion is "first-time customer captured a scan with nothing in the trial yet" — the AIProcessingScreen has nothing to show. Now: `if (trialItems.length > 0) navigate("aiProcessing") else navigate("home")`. Saves 6+ seconds on the brand-new-customer path. The Send-to-Trial path always has items by construction so it always lands on aiProcessing as before.
- **Why first-completion auto-advance, not all-completion:** waiting for ALL looks to complete would mean 60-180s on this screen for a 3-5 saree session — the trial room is already designed to handle in-flight items gracefully (per-tile wave + cutout reveal), so transitioning the moment we have one ready gets the customer to the destination view ASAP and lets the rest converge there.
- **Why no manual "View Now" button:** the auto-advance + 60s timeout cover the common cases. Adding a button means designing for the impatient-but-not-broken state, which is rare given typical RunPod times. Leaving it out keeps the screen clean. Easy to add later if needed.
- **Behavior on the codeEntry deferred auto-trial path:** after `recordBodyScan` flips `bodyScanInfo.hasFileId`, the reconciliation effect ([app/kiosk/page.tsx:464](app/kiosk/page.tsx#L464)) fires `runTryOn` for the queued shortlist items. lookIds populate ~1-2 ticks later. AIProcessingScreen handles the empty-then-populated lookIds shape via its `useMemo` over `trialItems + sareeLookIds`. The screen sits at "0 of 2 ready" briefly, then progresses as RunPod completes each.
- **What this is NOT:** the actual AI compute. RunPod processing happens in `convex/tryOn.ts` actions (`runTryOn` + `pollJob`). This screen is a passive observer of the `looks` table.
- **Files touched:** `convex/tryOn.ts` (new `getLooksByIds` query), `app/kiosk/screens/AIProcessingScreen.tsx` (full rewrite — props changed, new query subscription, auto-advance), `app/kiosk/page.tsx` (pass `trialItems` + `sareeLookIds` to the screen, gate `navigate("aiProcessing")` on `trialItems.length > 0` in the body-scan completion handler).
- **Verification:** type-check clean, build clean, ESLint clean.

### Eager body-scan gate — replaces lazy NO_BODY_SCAN: catch as the primary path

- **The bug:** existing customer logs in via phone OTP, has no `bodyScanFileId` on file, lands on home, browses, sends a saree to trial → red `[CONVEX A(tryOn:runTryOn)] Server Error … NO_BODY_SCAN: please complete a body scan first` shows up in the dev console. The kiosk's client-side catch handler did redirect them to consent so the customer-visible UX wasn't fully broken, but Convex's server log was being polluted by an expected-control-flow error on every cold try-on. Reported by user during /gstack QA.
- **Root cause:** the prior body-scan policy (CONTEXT.md §12 "Kiosk codeEntry — body-scan deferred (matching phoneAuth)") moved body-scan capture from upfront-gate to lazy-trigger. That made first-impressions snappier ("logs in directly with phone number → directly open the store; if new, body scan kicks in only when they send something to trial") but the lazy gate fires server-side: every cold session pays one `NO_BODY_SCAN:` throw the moment the customer hits a saree. For a returning customer with a 6-month-stale scan, the server is fine (`bodyScanFileId` is set, only `lastBodyScan` is old) — only the no-scan-ever case throws.
- **Fix shape (what we changed):**
  - Eager body-scan gate after every login path. If the customer has no `bodyScanFileId` AT ALL, route through `consent → bodyScan` BEFORE landing on `home`. Customers with a stale-but-present scan still go straight to home — the server doesn't enforce staleness, so they won't trip the error.
  - Three login surfaces gated: OTP returning customer, newCustomer (just registered, never has a scan), and codeEntry (tablet-curated entry). All three previously hard-coded `navigate("home")` post-session-create.
  - `codeEntry` additionally **defers the auto-trial** of the first 2 shortlisted sarees when the customer has no scan: `trialItems` is populated (so the Shortlisted rail chips light up) but `runTryOn` doesn't fire. The reconciliation effect ([app/kiosk/page.tsx:464-493](app/kiosk/page.tsx#L464-L493)) — which gates on `bodyScanInfo?.hasFileId` — automatically picks up the queued items once the scan is recorded and fires `runTryOn` for them. Net effect: the same end-state as before (first 2 rendering by the time the customer reaches the trial room), just routed through the body-scan capture first.
  - **Defense-in-depth client pre-check** added on the synchronous trial-add paths (`HomeScreen.onSendToTrial`, `ProductDetailScreen.onAddToTrial`). If `bodyScanInfo?.hasFileId === false`, we toast + redirect to consent without ever calling `runTryOn`. So even if the eager gate is bypassed (Skip button on consent + later add-to-trial attempt), the server is never called for a no-scan customer — Convex log stays clean.
- **What the gate uses, why it's narrow:** the check is `!customer.bodyScanFileId` (file presence), NOT the kiosk's existing `hasBodyScan` flag (which combines presence + age < 6 months). Stale scans don't trigger the gate. Reasoning: server-side `convex/tryOn.ts:541-543` only enforces presence; staleness is a UX-quality concern, not a correctness one. Re-prompting stale-scan customers to re-scan would be defensible but contradicts the "minimum friction for returning customers" intent. Per-user choice — flag this if you want to revisit.
- **`validateCode` projection extended.** The codeEntry path calls `convex/trialRoom.ts:validateCode` which deliberately narrows the customer projection (PII guard against guessed codes). Added a `hasBodyScanFile: row.bodyScanFileId !== undefined` boolean — exposes whether a scan exists without leaking the actual file id. The kiosk reads `data.customer?.hasBodyScanFile === true` as the gate predicate. Don't widen this projection further unless you really need to — the narrow shape is the security boundary.
- **Skip button on consent — kept.** User decision: keep the existing Skip affordance. Skip continues to navigate to home/trialRoom (browse-only mode). If the customer later tries to add a saree to trial, the client pre-check redirects them right back to consent. The server is never called, so no console error. The customer can keep tapping Skip indefinitely; that's their choice. (Earlier draft was going to remove Skip entirely; reversed.)
- **Lazy `NO_BODY_SCAN:` server throw — kept as defense-in-depth.** Still fires if a race condition slips through (e.g., admin deletes the scan between login and trial-add, or a future entry point we forget to gate). Should be rare in practice. The handler at `handleTryOnError` still pattern-matches the `NO_BODY_SCAN:` prefix and routes to consent. Production-quality means: the eager gate prevents 99% of fires, the client pre-check catches the remaining live-state cases, and the server throw is the irreducible safety net.
- **Three flows that change shape end-to-end:**
  - Phone OTP, no scan → `idle → lang → modeSelect → phoneAuth → otp → consent → bodyScan → aiProcessing → home` (was: `… → otp → home → [send to trial] → server error → consent → bodyScan → trialRoom`)
  - newCustomer (just registered) → `… → otp → newCustomer → consent → bodyScan → aiProcessing → home` (was: `… → newCustomer → home → server error → consent → …`)
  - codeEntry, no scan → `idle → lang → modeSelect → codeEntry → consent → bodyScan → aiProcessing → home (with shortlist rail)` and the deferred auto-trial fires from the reconciliation effect after the scan lands. (Was: `… → codeEntry → home → 2× server error from auto-trial → consent → …`)
- **No flow change for the happy paths.** Returning customer with a current scan → still lands directly on home, no consent screen. codeEntry with a scanned customer → still auto-trials the first 2 sarees synchronously. New non-customer + tablet code edge case (no `data.customer`) → still navigates to home unchanged (no scan to gate, no try-on possible without a customer).
- **Files touched:** `convex/trialRoom.ts` (added `hasBodyScanFile` to validateCode projection), `app/kiosk/page.tsx` (3 login-path navigates + 2 trial-add pre-checks).
- **Verification:** `pnpm run type-check` clean. `pnpm run build` clean. ESLint clean on the changed regions (5 pre-existing TrialRoomScreen `set-state-in-effect` warnings remain — predate this work). Manual browser verification deferred to next live session.
- **Out of scope (flagged):**
  - Convert the server-side `throw new Error("NO_BODY_SCAN:")` to a returned error object so race-condition fires don't show as red Convex log entries. Mostly cosmetic; keep the throw if we want the security-relevant log signal.
  - Add the eager gate to the retake path (customer in trial room taps "Retake body scan", lands in scanChoice — currently still routes through scanChoice/consent, which is correct for retake but uses the now-mostly-orphaned scanChoice screen).
  - Decide whether stale-scan (>6mo) customers should be re-prompted. Currently: no — they go to home directly. Trade-off: AI render quality vs friction. User's call.
  - Sticky "Body scan needed for try-on" banner on home for customers who Skip the eager gate. Right now they're silently in browse-only mode; the toast only fires when they attempt to add to trial.

### Kiosk trial room — bg-removed AI render via @imgly/background-removal

- **Why:** the kiosk trial-room right-panel hero was rendering the saree's catalog photo, not the AI try-on render. Even where the AI render was visible (the small `TrialTile` cards on the left rail), it included the RunPod-generated background (olive/green studio scene) that visually competed with the customer-on-saree subject. The brief: replace the trial-room display with the AI render but with the background removed, so the customer sees themselves "draped" against the kiosk's ivory backdrop. Other surfaces (`/c/wardrobe`, `/c/looks`, kiosk Wardrobe/Cart) keep using the original `imageFileId` — the cutout treatment is trial-room-only.
- **Library:** [@imgly/background-removal](https://github.com/imgly/background-removal-js) (browser variant). Single-threaded WASM, ~150-200 MB resident model, ~3-8s per image on mid-range hardware. The Node variant would have meant a Convex Node action with ONNX-runtime native deps — fragile and not free. Browser-side keeps it on the kiosk's compute, model warm across the session, and avoids any Convex action cost.
- **Schema:** new `looks.imageNoBgFileId: v.optional(v.id("_storage"))` ([convex/schema.ts](convex/schema.ts)) alongside the existing `imageFileId`. Original AI render is kept (audit, fallback, and non-trial-room surfaces). Backfill of pre-existing completed looks is **not** done — first time a returning customer hits a saree in the trial room, the cutout is produced just-in-time and cached forward. Dev / prod data sets stay where they are.
- **Mutation:** new public `tryOn.attachBgRemovedImage({ deviceToken, lookId, sourceImageFileId, fileId })` ([convex/tryOn.ts](convex/tryOn.ts)). Guards: `requireKioskDevice` (auth), look exists, `look.storeId === device.storeId` (cross-store protection), `look.imageFileId === sourceImageFileId` (cache-coherence — rejects if the source AI render was replaced between cutout-start and patch), idempotent if `imageNoBgFileId` already set, and server-side `assertFile(GUARDS.lookCutout)` mirrors the client guard.
- **Upload guard:** new `lookCutout` preset (5 MB, `image/png` only — preserves the alpha channel) in both [lib/uploadGuards.ts](lib/uploadGuards.ts) and [convex/fileValidation.ts](convex/fileValidation.ts) per the existing dual-source pattern.
- **Sequential queue** ([lib/bgRemovalQueue.ts](lib/bgRemovalQueue.ts) — new). Module-level singleton FIFO. Public surface: `enqueueBgRemoval`, `cancelBgRemoval`, and a `useBgRemovalStatus(lookId)` hook backed by `useSyncExternalStore` (no setState-in-effect lint noise). Per-job pipeline: `fetch(srcUrl)` → blob → lazy-imported `removeBackground(blob)` → wrap in `File` → upload via `useUploadFile(GUARDS.lookCutout)` → `attachBgRemovedImage` mutation.
- **Why sequential, not parallel** (decided after a parallel/sequential write-up; recorded here so future-you doesn't redo the analysis): `@imgly/background-removal` is single-threaded WASM. Five "parallel" jobs share the same WASM thread — wall time stays at ~5 × 5s either way, but parallel pays 5× the memory because each instance loads its own ~200 MB model. On a kiosk tablet that means 1 GB+ resident, almost guaranteed Chrome OOM kill. Sequential keeps memory bounded, model warm, UI responsive (other tiles can show queue position "Polishing 2 of 5…"), and gives a clean cancel path when the customer drops a saree mid-queue.
- **Cancel-on-remove:** `cancelBgRemoval(sareeLookIds[id])` is fired in the parent's `onRemoveItem` ([app/kiosk/page.tsx](app/kiosk/page.tsx)) so dropping a saree mid-queue frees the slot for the next one. No-op if the job is already processing or finished — only queued jobs cancel.
- **TrialTile rewrite** (small left-rail cards): observes `look.status` + `look.imageNoBgFileId` reactively, enqueues bg-removal as soon as a completed look has `imageFileId` resolvable but no cutout. Renders a wave animation during generate/polish phases; renders the bg-removed PNG once ready (centered on an ivory backdrop, no padding so the cutout fills the 1:1.2 card cleanly); renders the catalog photo + retry button on `failed`.
- **`TrialPreviewImage` (new component, right-panel hero):** same lifecycle as `TrialTile` but with on-screen captions ("Draping your saree…" / "Polishing the cutout…") and queue-position copy when 2+ jobs are stacked. The bg-removed PNG renders at `max-width: 80%` of the panel with a soft drop shadow and the ivory gradient backdrop showing through — that's where the customer sees themselves "draped." Falls back to plain catalog `SareeThumb` only when no look exists yet at all.
- **Failure handling:** any throw in the queue (model load fail, fetch error, oversized output, network) gets logged and the look's queue state flips to `failed`. The trial-room preview falls back to the raw `imageFileId` (skipping Phase B's wave) so the customer doesn't see a stuck loading state. No retry loop — re-mounting the tile re-enqueues naturally.
- **Animation system** ([app/kiosk/kiosk-theme.css](app/kiosk/kiosk-theme.css)): two phases share the same visual language so the transition feels continuous. Phase A `data-phase="generating"` — heavy 22-28 px gaussian blur on the catalog photo with a maroon-tinted radial mask sweeping diagonally + soft-light grain pulse + ivory veil. Phase B `data-phase="polishing"` — same wave but softer 12-16 px blur applied to the AI render this time, faster sheen cadence (2.4s vs 3.6s) so it converges visually. `.is-revealed` class triggers a 600 ms crossfade unwinding the blur to zero as the cutout lands. SVG turbulence wasn't needed — CSS keyframes + a layered radial gradient gave enough of the "fabric materializing" sensation.
- **Why no setState-in-effect:** the queue's React hook uses `useSyncExternalStore` — the idiomatic primitive for subscribing to module-level state. The `getSnapshot` callback returns a referentially-stable `IDLE_SNAPSHOT` constant for the empty case so the hook doesn't infinite-loop on equality checks. SSR/hydration returns the same idle constant via `getServerSnapshot`.
- **Surfaces explicitly NOT changed:** `/c/wardrobe`, `/c/looks`, kiosk Wardrobe screen, kiosk Cart/OrderScreen — all keep `imageFileId`. The trial room is the "here's how this saree looks on you" moment; everywhere else is product browse where the catalog/full-render context is the right semantic.
- **Files touched:** `convex/schema.ts` (new field), `convex/tryOn.ts` (new mutation + import of requireKioskDevice/assertFile), `convex/fileValidation.ts` + `lib/uploadGuards.ts` (lookCutout guard), `lib/bgRemovalQueue.ts` (new), `app/kiosk/page.tsx` (TrialTile rewrite + new TrialPreviewImage + import + onRemoveItem cancel hook + right-panel preview swap), `app/kiosk/kiosk-theme.css` (wave animation + cutout layer), `package.json` + `pnpm-lock.yaml` (`@imgly/background-removal` 1.7.0).
- **Build note:** the production build emits one warning — the ONNX runtime WASM file (24 MB) is too large for serwist precache. Acceptable: the SW's runtime caching (StaleWhileRevalidate) catches it on first navigation that imports the library. Don't fight the warning unless we're trying to fully precache the kiosk for offline first-paint.
- **Not in this pass (flagged):** backfill mutation that walks completed looks and produces cutouts in batch (would need a hidden offscreen page or a per-customer trigger — small task once we want it); cutouts on other surfaces (just lift the `imageNoBgFileId` priority into `/c/wardrobe`'s `Thumb` and the kiosk Wardrobe screen if the product call goes that way); pinch-zoom on the bg-removed cutout in the trial room; admin telemetry for bg-removal latency / failure rate; per-store kill switch via platformConfig.

### Wardrobe shows the AI try-on render as the thumbnail

- **Why:** `/c/wardrobe` and the kiosk wardrobe screen both rendered the saree's catalog photo as the thumbnail. Customers couldn't see "themselves" wearing the saree once they moved it from trial to wardrobe — visually identical to a regular product browse. The AI render exists on the corresponding `looks.imageFileId`; the wardrobe row just didn't link to it.
- **Schema:** new optional `wardrobe.lookId: v.id("looks")`. Records the look that was active when the customer hit "Add to wardrobe" inside the trial room. Optional because: (a) older rows pre-shipping this field, (b) the customer can move trial → wardrobe before the AI render completes (3A: allowed by design, the render shows up reactively when ready), (c) guest paths.
- **Backend:**
  - `addToWardrobe` accepts optional `lookId`. The dedup branch (when re-adding the same saree) patches `lookId` onto the existing row if it was missing — covers the "moved before render finished, re-added later" path.
  - `listWardrobeByCustomer` resolves the linked look and returns `lookImageFileId` only when `look.status === "completed"`. So a still-queued look doesn't surface a half-rendered image.
  - Catalog fallback chain switched from `imageIds[0]` to `imageIds[3] → [2] → [0]` — same flat-lay-first order used by the try-on garment input. Avoids the model-leak that `imageIds[0]` (model-wearing-saree shot) caused.
- **Kiosk:**
  - `TrialRoomScreen.onAddToWardrobe` passes `sareeLookIds[item._id]` through to `addToWardrobeMut`. `sareeLookIds` is already populated by the `runTryOn` `.then()` callback when each render completes.
  - Parent component derives `wardrobeLookImages: Record<sareeId, fileId>` reactively from `savedWardrobe.lookImageFileId`. Passed to `WardrobeScreen` as a `lookImages` prop.
  - `WardrobeScreen` thumbnail prefers `lookImages[saree._id]` over `saree.imageIds[3]/[2]/[0]`. `SareeThumb`'s existing fallback chain handles the case where neither resolves (gradient + emoji).
- **Customer PWA:** `/c/wardrobe`'s `<Thumb>` now reads `w.lookImageFileId ?? w.sareeImageId`. Convex's reactive subscription means a render that finishes after the customer is already viewing `/c/wardrobe` will swap in automatically — no refresh needed.
- **Backfill:** new `backfillWardrobeLookIds` `internalMutation` walks every wardrobe row missing `lookId`, finds a matching completed look (same session preferred, else most recent completed look for that customer + saree), patches the row. Idempotent — re-runs are no-ops once linked. Run on dev: `25 scanned, 2 patched, 23 noMatch`. The 23 unmatched rows fall through to the flat-lay catalog photo, which is correct for orphan / pre-AI rows.
- **Race the design accepts (3A):** customer hits "Add to wardrobe" while the AI render is still queued. Wardrobe row is created with `lookId` pointing at the queued look. `listWardrobeByCustomer` returns `lookImageFileId: undefined` because the status isn't `completed` yet. Thumbnail falls back to slot 3. When the look completes (status flips reactively), the query re-runs and the AI render appears in-place. No customer action needed.
- **What I deliberately did NOT touch:** kiosk `OrderScreen` (cart) thumbnails — those are still catalog photos. The cart represents items being purchased, not "the customer wearing them." Different surface, different intent.
- **Files touched:** `convex/schema.ts` (new field), `convex/sessionOps.ts` (mutation accepts lookId, query joins look, dedup-patch path, backfill mutation), `app/kiosk/page.tsx` (call-site pass-through, parent map, WardrobeScreen prop), `app/c/wardrobe/page.tsx` (Thumb fallback chain).

### Try-on uses flat-lay slot 3, not model-shot slot 0

- **Why:** the AI try-on was treating the customer's saree input image as "the whole scene" — copying body shape, hair, and face from whoever was modelling the saree in the catalog photo onto the customer in the output render. Visually wrong and creepy. Customer reported seeing "themselves with someone else's body" in `/c/looks`.
- **Root cause:** `convex/tryOn.ts` Step 7 (initial garment resolution) and `retryLook` both used `saree.imageIds[0]` as the garment input. Slot 0 is the front-facing model-wearing-saree shot in every Catelog-21 retailer upload. The RunPod model treats whatever it gets as a reference and bleeds the model into the output.
- **Inspection** of folders 01 / 05 / 11 / 15 in `Catelog-21/` confirmed the convention across the catalog drop:
  - Slot 0 (`01.*`) — front pose, full model
  - Slot 1 (`02.*`) — alternate pose, full model
  - Slot 2 (`03.*`) — closeup of border embroidery (sometimes hands)
  - **Slot 3 (`04.*`) — flat-lay top-down of the full saree, no model**. `imageIds[3]` is reliably a clean garment shot.
- **Fix:** garment resolution chain in both `runTryOn` (Step 7) and `retryLook` is now `imageIds[3] → imageIds[2] → imageIds[0]`. Slot 3 first means the AI sees only fabric — the only "human" reference comes from the customer's own `bodyScanFileId`. Body / face / hair leak eliminated.
- **One iteration:** first attempt was `imageIds[2]` (commit `0e5f809`). That helped most cases but still leaked sometimes because slot 2's closeups occasionally included hands. Bumped to slot 3 (commit `e25ed24`).
- **Existing in-flight looks** (already inserted with a stored `garmentFileId` from the old chain) keep using whatever was picked at queue time. Only NEW try-ons starting from now use slot 3. Acceptable — the customer can retry and that uses `look.garmentFileId ?? saree.imageIds[3] → ...` so a retry on an old failed look picks up the new chain.
- **Cleanup of sarees that can't comply** — separate commit `3904ad6`. New script `scripts/cleanup-flatlay-less-sarees.mjs` removed any saree whose `imageIds[3]` was missing. On dev: 4 sarees removed (ST-002 ×2, ST-003 ×2, all had 0 images). ST-001 retained all 21 Catelog-21 entries. ST-004 / ST-005 were already empty. Same dev-URL safety guard pattern as `seed-catelog21.mjs` — refuses prod, refuses unknown deployments without `FORCE=1`.
- **`listByCustomer` + `listBySession` filter to `status === "completed"`** (commit `f1f0863`) — same root issue surfaced differently. A queued / processing / failed / abandoned look had no `imageFileId` yet, so `/c/looks` fell through the same `sareeImageId` chain and again surfaced the model-wearing shot. Filter at source: in-flight looks simply don't appear until they finish; failed / abandoned ones never appear. Convex's reactive subscription means a queued look auto-appears once it completes. Saree fallback chain in those queries also bumped to slot 3 → 2 → 0 (defense in depth, mostly moot after the status filter).
- **`listWardrobeByCustomer`** (a separate query for saved-for-later items, not "AI try-on result") was deliberately NOT given the status filter — its semantics are different. Its catalog fallback chain WAS upgraded to slot 3 → 2 → 0 in the same pass, paired with the new wardrobe lookId lookup described in the next entry up.

### `/c/looks` images, lightbox, and full-drape sizing

- **`/c/looks/[id]` hero used to be gradient-only.** Detail page hero rendered a silk shimmer + cross-hatch pattern + generic saree-silhouette SVG, never the actual `look.imageFileId`. Even the catalog fallback wasn't wired. So every look detail showed the same placeholder regardless of what was tried on. Fixed by adding a `StoredImage` component with the priority chain `look.imageFileId → look.sareeImageId → gradient` (commit `c66e86c`). Decorations only render on the gradient-only path so they don't obscure a real image; bottom dark-to-transparent gradient stays for title legibility.
- **"From the Same Session" rail** had the same bug (commit `a94ebfc`). Required enriching `convex/sessionOps.ts` `listBySession` with the saree join (`sareeImageId`, `sareeGrad`, `sareeEmoji`) — it had been returning raw look rows. Same shape as `listByCustomer` now so consumers don't care which query feeds the data.
- **Recent Looks rail on `/c` home** (commit `790a7bd`) was rendering hard-coded `/kiosk/img1.jpg`–`img4.jpg` placeholders via a `pickImg(i+1)` helper — same content for every look. Replaced with the same priority chain via a new `LookTileImage` component. Also dropped the gold "LOOK" badge — redundant in a "Recent Looks" rail.
- **Hero lightbox** (commit `b09261d`). Tap the hero on `/c/looks/[id]` → fullscreen modal with the image at `object-fit: contain` (full saree visible vs the hero crop). Z-index 1000, dark backdrop, body scroll locked, safe-area-inset padding for notched devices, close button (×) and backdrop tap dismiss. Back / wishlist / share buttons inside the hero now `stopPropagation()` so tapping them doesn't also open the lightbox. Cursor on the hero is `zoom-in` when there's a real image, `default` on the gradient fallback.
- **Card / hero sizing** (commits `a0ff349`, `644c584`). Customer feedback: "the saree drape is cropped at the torso." Bumped:
  - `/c/looks` list cards: `140 → 240` (≈1.4:1 portrait at ~170px width on phones)
  - `/c/looks/[id]` hero: `360 → 520` (full head-to-hem)
  - "From the Same Session" rail: `130 × 130 → 150 × 210` (1:1.4 portrait)

### `/c/me` mobile polish + nav-sticky fix

- **Bottom nav was scrolling away on mobile** (commit `f99473d`). The nav used `position: sticky; bottom: 0;` but its parent `.cx-shell` had `overflow: hidden` and the inner `.cx-screen` was the actual scroll container. Sticky needs the element to be inside the scrolling ancestor — the nav was a sibling, so sticky silently fell back to static at the bottom of the shell. On viewport-sized devices the whole shell scrolled with the page, taking the nav with it. **Fix:** moved scroll from `.cx-screen` to `.cx-shell` (`overflow-x: hidden; overflow-y: auto; max-height: 100svh`). Nav as the last flex child + sticky bottom: 0 now resolves correctly. Mirror change in the tablet+ media query (windowed shell). The previous `.cx-shell { overflow: hidden }` clipped rounded corners — now achieved via `overflow-x: hidden` alone.
- **Profile photo on `/c/me` hero** (commit `5e7e771`). The hero rendered initials only, even when the customer had uploaded a photo via Edit Profile. Now reads `customer.photoFileId`, resolves via `useConvexUrl`, renders an `<img>` cropped into the existing 64×64 gold-bordered circle. Falls back to italic-serif initials when no photo.
- **`/c/me` hero compaction** (commit `b7c701b`). On a 360×640 phone the hero + zari decoration + stats + My Stores combined ate ~390px before any menu row — only 1–2 rows visible above the fold. Reclaimed ~50–60px by tightening hero padding (24/22 → 16/16), shrinking avatar (64 → 56, font 22 → 19), trimming brand-row marginBottom (14 → 10) and font (17 → 15), and removing the decorative `cx-zari` line below the hero. All overrides are inline on this page so other heroes (e.g. `/c` home) are unaffected.
- **Tap-target audit:** `.cx-row` is a full-width `<button>` at ~70px tall — the icon container being 42px doesn't matter for touch. Bottom-nav items are ~50px × ~90px. All ≥ 44px. No fix needed.
- **`/c/me/profile` Save button polish** (commits `8123d4e`, `077e769`).
  - Was: plum gradient at `opacity: 0.5` when saved (idle, no dirty changes) → white text washed out on beige page background.
  - Three explicit states now: **Save Changes** (solid `var(--cx-primary)` maroon, white text, gold shadow), **Saving...** (same maroon at 0.7 opacity), **✓ Saved** (gold-ghost background, dark-gold text, gold-glow border, checkmark glyph). No layout shift, no opacity ambiguity.
  - First pass used a plum gradient on Save Changes; flipped to solid maroon (`077e769`) per user preference for cleaner non-gradient brand.
- **Height input no longer snaps mid-keystroke** (commit `8125b65`). `setHeightCm` clamped to `[MIN_HEIGHT_CM, MAX_HEIGHT_CM]` on every onChange. Browser select-all-on-focus + typing `1` (en route to `175`) → state clamped to `120` → input snapped back. Field was effectively uneditable without using the spinner. **Fix:** new string-state mirrors (`heightCmInput` / `ftInput` / `inInput`) bound to the input's `value`. onChange updates the string + the underlying numeric state without clamping. onBlur clamps and rewrites the input string to the clamped value. Live "X ft Y in" helper updates as you type. Added `inputMode="numeric"` so iOS/Android shows the numeric keypad.

### Kiosk: 'All Sarees' grid below New Arrivals

- **Why:** the kiosk home was rendering only Trending Now (`sarees.slice(0, 8)`) + New Arrivals (`reverse().slice(0, 8)`) — capped at ~16 visible. For ST-001 with 21 sarees, customers had to type in the search bar or apply a filter to see the rest. There was no "browse all" affordance.
- **Fix:** new "All Sarees" `<ScrollSection>` rendered below New Arrivals when no filter is active. Uses the same `repeat(auto-fill, minmax(160px, 1fr))` grid as the filtered-results view for visual consistency. Inline `{n} items` counter on the section header. Curated rails (Trending / New Arrivals / Shortlisted) remain on top so the "pick of the day" affordance is preserved.
- **Files touched:** `app/kiosk/page.tsx` HomeScreen — single insertion below the New Arrivals `ScrollSection`.

### Trial-empty header + checkout actually removes wardrobe rows

- **Why (trial-empty header):** the `TrialRoomScreen` empty branch (when `items.length === 0`) returned a centered-only layout with no top bar. Customer could only escape via the inline "Browse Sarees" button — no path to wardrobe / cart / logout from an empty trial. Felt like a stuck screen.
- **Fix:** the empty branch now wraps in `<div className="k-shell">` and renders the standard `KioskHeader` (trial/wardrobe/cart icons + logout) at the top, with the empty-state graphic + button centered in a `flex: 1` body. The non-empty branch keeps its custom top bar (Home / timer / Retake / Logout) — different affordance, intentional.
- **Three new TrialRoomScreen props** to feed the header: `cartCount`, `storeName`, `storeLogoFileId`. Wired from the parent's existing state at the call site (`cartItems.reduce((n, c) => n + c.qty, 0)` for cart count to match how `KioskHeader` is fed elsewhere). `onGoHome` and `onLogout` (existing props) double as `goHome` and `triggerLogout` for the header — they were already pointing at the right callbacks.
- **Why (checkout → wardrobe removal):** [app/kiosk/page.tsx](app/kiosk/page.tsx) `onCheckout` was already creating a real `orders` row via `createOrder` (the "fake checkout" — no payment processor, just records intent). But the server-side `wardrobe` rows for purchased items were never deleted: only local kiosk state was filtered (line 1171). Result: customer checks out on the kiosk → `/c/wardrobe` (customer PWA) keeps showing purchased items as if unbought; on the next kiosk login the hydration effect re-loads them too. Out of sync with the act of purchase.
- **Fix:** new `removeFromWardrobeMut = useMutation(api.sessionOps.removeFromWardrobe)`. After `createOrder` succeeds, walk the `cartItems` and for each `sareeId`, find the matching row in `savedWardrobe` (already in scope from the hydration `useQuery`) and call `removeFromWardrobeMut({ wardrobeId: row._id, customerId })`. Best-effort per-row — try/catch silent so a stale row / race doesn't block the checkout finalization. Cart items that were added directly without ever being in the wardrobe (no matching row) get a `find` undefined → skipped, no-op.
- **Customer PWA sync is automatic** — `/c/wardrobe` uses `useQuery(api.sessionOps.listWardrobeByCustomer)` which is reactive, so the deletion propagates within the same Convex tick. No client-side polling, no extra wiring.
- **Why match by sareeId, not row id:** kiosk's local `wardrobeItems` state stores `SareeItem` objects (saree fields), not wardrobe rows — so it has `_id = saree._id`, not the wardrobe row id. The lookup against `savedWardrobe` (which has `wardrobe._id` + `sareeId`) bridges that. Wardrobe rows are deduplicated per `(customerId, sareeId)` post the earlier `dedupeWardrobe` migration, so `find` returns the single canonical row.
- **What "fake checkout" still means:** no payment integration, no inventory decrement, no shipping pipeline. Just `orders` row + `kioskCart` rows cleared + `wardrobe` rows for the purchased items deleted. Real-world payment + fulfillment would replace `createOrder` with a `createPayment` flow, but the wardrobe-clear step here is correct in either world.
- **Files touched:** `app/kiosk/page.tsx` only — added `removeFromWardrobeMut` declaration; extended `onCheckout` with the per-row deletion loop; extended `TrialRoomScreen` signature with three header-feed props; replaced the empty-branch return with `KioskHeader` + body wrapper.

### Multi-image gallery on product detail + trial-room timer extended

- **Why (gallery):** sarees in the new Catelog-21 batch ship with 4 product images each (`imageIds[]`), but [components/SareeThumb.tsx](components/SareeThumb.tsx) only ever rendered `imageIds[0]`. The remaining 3 images per saree were sitting in Convex Storage with no UI to view them. Customers in the kiosk and staff in the tablet detail view need an e-commerce-style gallery with arrows/dots/swipe to browse all four.
- **Component:** new [components/SareeImageGallery.tsx](components/SareeImageGallery.tsx) wraps `SareeThumb` per-image. Behavior:
  - **0 or 1 images** → falls through to plain `SareeThumb`. No arrows, no dots, no swipe handlers attached. Older seeded sarees (still 0–1 images) render unchanged.
  - **≥ 2 images** → 44px circular chevron buttons left/right (semi-transparent dark bg, white icon), animated dot pill at bottom-center (active dot widens to 22px), touch swipe with a 40-px threshold via `touchstart`/`touchend`.
  - Arrows **disable at the ends** (no wraparound) so the affordance stays clear — preferred over wrap-around per spec.
  - Click handlers `e.stopPropagation()` so an arrow tap doesn't bubble to the surrounding "tap card" handler in either surface.
- **Surfaces wired** — only product-detail surfaces:
  - [app/tablet/catalogue/[id]/page.tsx](app/tablet/catalogue/[id]/page.tsx) hero image (replaces direct `SareeThumb`).
  - [app/kiosk/page.tsx](app/kiosk/page.tsx) `ProductDetailScreen` hero (replaces direct `SareeThumb`).
- **Surfaces NOT wired** (intentionally): grid cards on home/catalogue/wardrobe — those should stay tap-to-detail. Kiosk `TrialRoomScreen` full-bleed preview — that's the AI-render of the currently-selected saree, not a gallery moment.
- **Why (trial timer):** customers were complaining the trial-room countdown was too short (3 min); the "Time's Up" popup also waited indefinitely for a response, which left abandoned sessions with PII on the mirror until staff intervened.
- **Three CFG knobs in [app/kiosk/page.tsx](app/kiosk/page.tsx) `CFG`:**
  - `tryOnSec: 240` — bumped from 180 (3 min → 4 min trial-room countdown).
  - `trialEndAutoLogoutSec: 180` — new. The "Time's Up" popup now auto-fires `onLogout` after 3 minutes of no user response.
  - `trialEndContinueSec: 120` — new. The "Continue" button adds 2 minutes to the trial timer (was hardcoded 60s).
- **Auto-logout countdown UX:** the popup shows `Auto-logout in M:SS` in maroon so the customer sees the deadline. Re-initializes to 180s every time the popup opens (so a Continue → re-trigger sequence gets a fresh window). Both Continue and Logout cancel it (Continue by closing the popup; Logout by firing immediately).
- **Files touched:** `components/SareeImageGallery.tsx` (new), `app/tablet/catalogue/[id]/page.tsx` (replaced SareeThumb in hero), `app/kiosk/page.tsx` (replaced SareeThumb in ProductDetailScreen hero, three CFG knobs, popup countdown UI + effect).
- **Not done (flagged):** desktop-style thumbnail strip below the gallery — out of scope per "arrows + dots" answer; can layer on later if a desktop admin view ever shows the gallery. Pinch-zoom on the active image — not requested. Per-image lazy loading — `SareeThumb` already passes `loading="lazy"` on the `<img>`, so non-active images effectively don't fetch until selected. Keyboard arrow nav — kiosks/tablets are touch-first, no keyboard.

### Catelog-21 seed — 21-saree fresh catalog for ST-001 (dev only)

- **Why:** ST-001's seeded catalog from `seed.ts` (the 14 sarees in section 8) was a hand-crafted demo set with mismatched/missing images and inconsistent metadata. A real product photoshoot bundle landed in `Catelog-21/` — 21 numbered subfolders (`01`–`21`), each with 4 product images plus an `Input Img.{png}` (the AI-input source for the photoshoot, not catalog content), plus a `Catelog-21 _ 060526_ Details.xlsx` with one row per saree (description, fabric, work, color, material/care, price). Goal: replace ST-001's catalog wholesale with these 21, each populated with all 4 images so the kiosk + tablet + RunPod try-on flows work against real product photography.
- **Mapping decisions** (asked, not invented):
  - **Replace, don't merge.** All existing ST-001 sarees deleted before insert. The owner had already manually deleted most via the retail UI; the script catches any orphans.
  - **Skip `Input Img.{png}`** in each folder — that's the AI photoshoot source, not a catalog image. Only the 4 numbered files (`01-04.{webp,jpg,png}`) go to Convex storage.
  - **Occasion = price band:** ≥ ₹20,000 → Wedding, ≥ ₹10,000 → Festival, else Party. Yields 2/12/7 — clean spread.
  - **Stock random 5–15** per saree. All `status: "active"` (5 isn't low_stock here; the auto-status logic only kicks in on `updateStock`).
  - **Name = `${colorName} ${fabric} Saree`** (e.g. "Pink Banarasi Silk Saree"). The xlsx description blurb is too long for a card title; the constructed name is short, sortable, and the full blurb still lives in `description`.
  - **Type derived from fabric:** `Banarasi`/`Banarasi Silk` → "Banarasi"; `Soft Silk`/`Art Silk` → "Designer Silk"; `Chiffon`/`Georgette`/`Net` → fabric-as-type; everything else → "Designer".
  - **Tag = "New"** on all 21 — fresh drop.
  - **Column-vs-description conflicts:** the xlsx fabric column reads "Tissue" for sarees `10`/`15`/`16`/`19`, but each row's description blurb explicitly says Georgette/Satin/Satin/Georgette respectively. The column was a data-entry slip — overrode with the description. Customer sees the right thing.
  - **MRP** is computed (`price × random(1.15..1.25)`, rounded to nearest ₹100) — the xlsx has only one price column, so this gives the UI a "Save ₹X" badge without faking discounts.
- **Where the data lives.** [scripts/seed-catelog21.mjs](scripts/seed-catelog21.mjs) hardcodes all 21 mappings as a JS array — chose this over parsing the xlsx at runtime because (a) the xlsx column-vs-description conflicts needed manual judgment anyway, and (b) the script is read-once-run-once; reproducibility matters more than DRY against the xlsx. The 50MB `Catelog-21/` source folder (images + xlsx) is intentionally **untracked** — too large for git, and the script+xlsx-parse already encode the mapping. If a teammate needs to re-run, they need the source folder shipped out-of-band.
- **Safety guards** (the script is destructive — deletes ST-001's catalog before re-inserting):
  - Refuses to run unless `CONVEX_URL`/`NEXT_PUBLIC_CONVEX_URL` contains the known dev deployment string `formal-snake-780`. Refuses outright on `quirky-narwhal-971` or any URL matching `/prod/`. `FORCE=1` overrides the unknown-dev case but NOT the known-prod refusal — i.e. you can re-target to a *different* dev deployment, never to prod.
  - Pre-flights every folder before any DB write: exactly 4 image files per folder, each ≤ 5MB (the `sareePhoto` upload guard), MIME inferred from extension. Aborts before deletion if any check fails.
  - Uses the public `sarees.create` mutation (which calls `assertFiles` against the `sareePhoto` guard) so server-side validation runs even though the script bypasses the UI.
- **Result on dev (`formal-snake-780`):** 21 sarees inserted, 84 images uploaded (4/saree), prices ₹4,999–₹24,999, stock 5–15 (avg 11), occasion split Wedding=2/Festival=12/Party=7, type split Designer=7/Georgette=5/Designer Silk=4/Banarasi=2/Chiffon=2/Net=1.
- **Run command:** `pnpm run seed:catelog21` (added to [package.json](package.json) scripts).
- **Not done (flagged):**
  - Prod deployment never seeded (out of scope; dev-only run per request). If/when prod is ready, re-run with explicit URL override AND re-confirm the source folder is on the runner machine.
  - `Catelog-21/` source folder isn't in git or LFS — if multiple devs need to re-run the seed, decide on storage (Git LFS / S3 bucket / shared drive). Currently: one machine has the source, the script encodes the metadata, so the seed is reproducible only from that machine.
  - The seeded-saree image-name → file mapping in [components/SareeThumb.tsx](components/SareeThumb.tsx) (`SAREE_IMAGE`) was for the OLD seeded catalog and doesn't include any of the new 21 names. Not a problem — the new sarees have `imageIds[]` populated directly from Convex storage, so `SareeThumb` falls through to the storage-URL tier (priority 2 in its three-tier fallback), skipping the local-inventory tier entirely. Safe to ignore unless you want offline thumbnail support.
  - `daysOld` set to 0 by `sarees.create`. Aging analytics on `/store/inventory` will treat the whole catalog as just-added.

### Kiosk Shortlisted home rail + tablet 10-cap + trial-room non-persistence

- **Why:** the tablet → kiosk handoff used to dump every shortlisted saree straight into the trial room and navigate to `trialRoom` on code entry. With staff curating up to ~10 picks per customer, that auto-fired 10 RunPod jobs per pairing (~₹30) before the customer had even seen anything. The new model: shortlisted items render as a "Shortlisted" `ScrollSection` on the kiosk home above "Trending Now"; only the **first 2** (oldest by `addedAt`) auto-trial, the customer self-adds the rest. Spec at [docs/superpowers/specs/2026-05-06-kiosk-shortlist-home-rail-design.md](docs/superpowers/specs/2026-05-06-kiosk-shortlist-home-rail-design.md), plan at [docs/superpowers/plans/2026-05-06-kiosk-shortlist-home-rail.md](docs/superpowers/plans/2026-05-06-kiosk-shortlist-home-rail.md).
- **Tablet shortlist 10-cap.** Server-side guard in `addToShortlist` ([convex/sessionOps.ts](convex/sessionOps.ts)) throws `SHORTLIST_FULL: Shortlist is full (max 10 items)` when `existing.length >= 10` (same `take(11)` index pattern as the wardrobe cap). Client gates in `/tablet/catalogue/page.tsx`, `/tablet/catalogue/[id]/page.tsx` (both shortlist-add AND send-to-mirror paths) pre-check length and surface the error via `alert("Shortlist full — remove an item to add more (max 10).")`. `/tablet/shortlist/page.tsx` header shows `n/10` so staff can see the budget.
- **`kioskTrialCart` deleted entirely.** Trial items used to persist per `(customer, store)` via the `kioskTrialCart` table — that's gone. Schema row removed, `addTrialCartItem`/`removeTrialCartItem`/`clearTrialCart`/`listTrialCart` mutations + query deleted, every kiosk call site stripped (codeEntry, `onSendToTrial`, `onAddToTrial`, `onRemoveItem`, `onAddToWardrobe`). Hydration effect's `savedTrialCart` branch is gone; effect now only restores wardrobe + cart. Trial items live ONLY in React state for the session — logout empties the trial room. Wardrobe and cart persistence are untouched. Existing deployed `kioskTrialCart` rows stay orphaned (intentionally out of scope; harmless).
- **Pass-through state + localStorage, NOT a server subscription.** `validateCode` already returns `mirrorItems`. The kiosk parses them once at the entry point (sorted by `addedAt` asc), sets `shortlistedItems` React state, and persists to `localStorage.wearify_kiosk_shortlisted = { sessionId, sareeIds, autoTrialDone }`. Tablet codes are single-use (status flips to `used` on validate) so a live server subscription buys nothing — no advantage to going server-truth on this. Survives browser refresh via the existing `wearify_kiosk_session` retention pattern; sessionId-mismatch on the localStorage record is treated as stale and ignored.
- **`autoTrialDone` flag prevents re-firing on refresh.** The codeEntry handler writes the localStorage record twice — once before the auto-trial loop with `autoTrialDone: false`, once after with `true`. The hydration effect on mount checks the flag indirectly: it just restores `shortlistedItems` from `sareeIds`, but the auto-trial logic ONLY runs in the codeEntry handler (not in the hydration effect), so a refresh restores the rail without re-firing `runTryOn`.
- **`HomeScreen` Shortlisted rail.** Gated on `shortlistedItems.length > 0`, so the phoneAuth login path (which never populates `shortlistedItems`) doesn't render it — source-gating is implicit, no `entrySource` enum needed. The rail is **static** for the session: items don't disappear when the customer adds them to trial. The existing `SareeCard` `isInTrial` chip handles state indication, matching the Trending rail's behavior exactly.
- **Body-scan failure on auto-trial.** Same NO_BODY_SCAN: catch as before — redirects to `consent` → `bodyScan`. The reconciliation effect (gated on `bodyScanInfo?.hasFileId`) re-fires `runTryOn` for both queued items once the scan is recorded. No new logic needed.
- **`handleWipe` clears shortlist on logout.** `setShortlistedItems([])`, `shortlistHydratedRef.current = null`, `localStorage.removeItem("wearify_kiosk_shortlisted")`. Both Save and Delete buttons on `DataSaveScreen` end at `handleWipe` after FeedbackScreen submit — so logout always empties trial + shortlist regardless of the customer's data-save choice. Wardrobe still persists per (customer, store) via its own server-side rows.
- **What I did NOT do (flagged):** purge orphan `kioskTrialCart` rows in the deployed Convex DB (write a one-shot `internalMutation` if it ever matters); migrate the existing tablet flow's "Send All to Mirror" generates the trial room code path — same as before, the change is purely on the kiosk-receiving side; explicit "this customer entered via store code" indicator on the home screen UI (it's implicit via the rail's presence); end-to-end browser smoke test (type-check + Convex deploy clean across all 8 commits, but no manual kiosk drive).
- **Files touched:** `convex/schema.ts` (kioskTrialCart deleted), `convex/sessionOps.ts` (cap added, 4 trial-cart fns deleted), `app/tablet/catalogue/page.tsx`, `app/tablet/catalogue/[id]/page.tsx`, `app/tablet/shortlist/page.tsx`, `app/kiosk/page.tsx` (state + localStorage helpers + codeEntry rewrite + HomeScreen rail + hydration effect + handleWipe). Eight commits in a clean chain, each individually buildable except Task 3 which is intentionally atomic.

### Customer module — installable PWA (manifest + SW + offline + install prompt)

- **Why:** `/c/*` was a polished mobile web app but had zero PWA primitives — no manifest, no service worker, no installable home-screen icon. Customers had to use it as a tab. Now it's installable on Android (Chrome `beforeinstallprompt` + in-app banner) and iOS (Safari "Add to Home Screen" via Apple meta tags). Plan and verification walkthrough at [docs/superpowers/plans/2026-05-03-customer-pwa-conversion.md](docs/superpowers/plans/2026-05-03-customer-pwa-conversion.md) and [...test-walkthrough.md](docs/superpowers/plans/2026-05-03-customer-pwa-test-walkthrough.md).
- **Tooling:** [@serwist/next](https://serwist.pages.dev) for the service worker (active fork of `next-pwa`, Next 16 compatible) + `serwist` runtime + dev `sharp` for icon generation. `swSrc: "app/sw.ts"` → `swDest: "public/sw.js"`. SW is **disabled in dev** (`disable: process.env.NODE_ENV === "development"` in [next.config.ts](next.config.ts)) because cached assets make iteration painful — production-only registration.
- **The Next 16 + Turbopack gotcha (read before any future build-config change).** Next 16 defaults to Turbopack for `next build`. Serwist injects a webpack plugin via `withSerwistInit`. Turbopack rejects builds with webpack config and hard-exits. Workaround in [package.json](package.json:10): `"build": "next build --webpack"`. **Do NOT remove `--webpack`** until either Serwist ships a Turbopack-native SW compiler OR Turbopack supports webpack-plugin compatibility. Dev still uses Turbopack via `next dev`. Netlify's deploy command (`npx convex deploy --cmd 'npm run build'`) calls `npm run build`, so this propagates to prod automatically.
- **The Next 16 `apple-mobile-web-app-capable` regression (iOS install path).** Next 16's `appleWebApp.capable: true` in `metadata` emits `<meta name="mobile-web-app-capable">` (the new W3C cross-platform name) but NOT the legacy `apple-mobile-web-app-capable` that iOS Safari requires for "Add to Home Screen" → standalone launch. Without the Apple-prefixed meta, iOS users get the home-screen icon but tapping it opens Safari with chrome bar instead of standalone. Fix in [app/layout.tsx](app/layout.tsx) `metadata.other`: `{ "apple-mobile-web-app-capable": "yes" }`. **Both forms are now emitted; preserve both.**
- **Manifest scope = `/c`.** [public/manifest.json](public/manifest.json) sets `"scope": "/c"` and `"start_url": "/c"`, which means installing the PWA gets you the customer app standalone — `/admin` and `/store` continue to render with browser chrome if visited from the installed window. Intentional. `theme_color` `#7B1D1D` (maroon hero), `background_color` `#FDF8F2` (ivory).
- **Icons.** Generated from a single source SVG ([public/icons/source.svg](public/icons/source.svg)) via [scripts/generate-pwa-icons.mjs](scripts/generate-pwa-icons.mjs) using `sharp`. Outputs: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (with 80% safe-zone padding on a maroon background for Android adaptive icons), `apple-touch-icon.png` (180×180), `apple-splash-2048x2732.png` (single iPad Pro size — iOS scales it for smaller devices). Re-run the script if the brand mark ever changes; it overwrites all 5 PNGs from the SVG.
- **Apple meta in [app/layout.tsx](app/layout.tsx).** `appleWebApp.capable: true`, `statusBarStyle: "default"`, `startupImage` points at the splash. iOS does NOT read `manifest.json` for icons or splash — these meta tags are the only way Safari installs work. Plus the `metadata.other["apple-mobile-web-app-capable"]` workaround above.
- **Theme color.** `#7B1D1D` (the customer-app maroon hero) lives in `viewport.themeColor` (Next 15+ moved this out of `metadata`). Drives the Android tab-bar tint on Chrome and the standalone status-bar background.
- **Service worker behavior** ([app/sw.ts](app/sw.ts)):
  - `precacheEntries` from Serwist's build manifest — Next.js static assets cached for instant repeat loads.
  - `runtimeCaching: defaultCache` — Serwist's batteries-included strategy (StaleWhileRevalidate for static, NetworkFirst for navigations, CacheFirst for fonts/images).
  - `navigationPreload: true` — speeds up SW-controlled navigation responses.
  - `fallbacks.entries: [{ url: "/c/offline", matcher: req.destination === "document" }]` — any document fetch that fails → render [app/c/offline/page.tsx](app/c/offline/page.tsx). Image/script/style fetches do NOT fall back (correct).
  - `skipWaiting + clientsClaim` — new SW versions take over immediately on next page load. Trade-off: a user on a slow network might get a mid-session SW swap. Acceptable for now; switch to "wait for restart" if it ever causes weirdness.
  - `/// <reference lib="webworker" />` on line 1 of `app/sw.ts` — required because the project tsconfig uses `dom` lib only, which doesn't include `ServiceWorkerGlobalScope`.
- **Offline fallback** ([app/c/offline/page.tsx](app/c/offline/page.tsx)). Added to `PUBLIC_ROUTES` in [app/c/layout.tsx:64](app/c/layout.tsx#L64) so the auth gate doesn't try to `validateSession` against an unreachable backend (which would redirect-to-login and defeat the offline page entirely). Page is fully static — no Convex queries — so SW caches the rendered HTML cleanly.
- **Install-prompt UX** ([components/c/InstallPrompt.tsx](components/c/InstallPrompt.tsx)). Listens for `beforeinstallprompt` (Chrome / Edge / Android only — iOS doesn't fire it), stashes the event, shows a dismissable banner above the bottom nav. Dismiss persists via `localStorage.wearify_pwa_install_dismissed` so we don't nag on every load. Suppressed when `matchMedia("(display-mode: standalone)").matches` (already-installed users never see it). Rendered inside the authenticated shell only — login/register/offline surfaces don't get the banner because installing pre-auth and immediately hitting a login wall is hostile.
- **`.gitignore` artifacts.** SW artifacts at `public/sw.js`, `public/sw.js.map`, `public/swe-worker-*.js`, `public/workbox-*.js`, `public/workbox-*.js.map` are gitignored — they're regenerated by every `npm run build`. Don't commit them.
- **Out of scope (deferred to follow-up plans):**
  - **Web push notifications** — needs VAPID key pair, `web-push` Convex action, new `pushSubscriptions` table keyed by `customerId`, client subscription UI inside `/c/me/preferences`, and a notification taxonomy (loyalty milestone, look ready, store offer). Standalone subsystem; the current SW uses `defaultCache` so adding a `self.addEventListener("push", ...)` is a clean superset, no refactor needed.
  - **Background Sync API** — for queueing wishlist toggles / look-saves while offline.
  - **Web Share Target** — receive shared images from other apps into a try-on flow.
  - **Per-language manifest variants** — currently `lang: "en"` only; could ship 9 manifests for each i18n locale once kiosk language picker writes back to the customer profile.
- **No new env vars.** Manifest + SW are pure build-time artifacts. Netlify deploys pick up the prod build via the existing `netlify.toml` flow.
- **Verification:** Lighthouse PWA audit passes (Installable + PWA-optimized) on `npm run build && npm run start` against `/c/login`. Offline fallback verified in DevTools → Network → Offline. Type-check clean across all 9 commits. Real-device install (Android Chrome / iOS Safari) deferred until next Netlify deploy — the verification walkthrough at `docs/superpowers/plans/2026-05-03-customer-pwa-test-walkthrough.md` covers the full sequence.

### Kiosk try-on cache — reuse completed looks across sessions

- **Why:** every logout → login was paying for fresh RunPod renders of items the customer already had completed AI results for. handleWipe clears `sareeLookIds`, retention rehydrates `trialItems` from `kioskTrialCart`, the reconciliation effect walks each item with no lookId and fires `runTryOn`. Server-side dedup at `_findExistingLook` is keyed on `sessionId` — the new session means no dedup hit, so a brand-new `looks` row gets inserted and a brand-new RunPod POST goes out. ~₹3 per saree per re-login. Wasteful at any volume.
- **Fix:** new public query `tryOn.getCachedLooksForSarees({ customerId, sareeIds })` returns a map `sareeId → lookId` for the most recent **completed** look per requested saree. The kiosk wires it as a `useQuery` based on `customerId` + `trialItems.map(_id)`, and the reconciliation effect prefers a cache hit over firing `runTryOn`. TrialTile's existing `useQuery(api.tryOn.getLook, lookId)` then renders the stored AI image directly — no compute.
- **Body-scan invalidation:** a cached look is only reused when `look.personFileId === customer.bodyScanFileId`. A rescan / retake (which writes a new `bodyScanFileId` on the customer row) automatically invalidates every prior look, so the next render reflects the new body. Customers without a current scan get an empty map (forces a fresh render once they capture one — same effective UX as before, just without the wasted call).
- **Race avoidance:** the reconciliation effect now waits for `cachedLooksForTrial` to settle (`=== undefined`) before deciding what to fire. Without the gate, the cache resolve and the reconciliation effect could race on the same render, fire `runTryOn` for an item that the cache would otherwise have covered, and spend the ₹3 anyway. The gate adds at most one extra render on first hydration.
- **Bounded scan:** server-side `.take(500)` cap on `by_customerId_and_createdAt` index. Per-customer hourly rate limit is 30/hr — even an extreme power user wouldn't accumulate 500 looks in a typical retention window. Cap is a defensive guard against pathological data, not an expected limit.
- **What this also fixes:** same-session re-add of a previously rendered saree (e.g. wardrobe → cart → trial during the same session) now also reuses cached looks. Previously, the action's session-scoped dedup wouldn't help cross-session, AND its in-session dedup wouldn't help if the look was created in a *prior* session.
- **Files:** `convex/tryOn.ts` (new query), `app/kiosk/page.tsx` (cachedLooksForTrial useQuery + reconciliation effect inline cache hit). No schema changes — uses the existing `by_customerId_and_createdAt` index on `looks`.

### Kiosk codeEntry — body-scan deferred (matching phoneAuth)

- **Why:** the `codeEntry` (tablet store-code) path still gated on `scanChoice` / `consent` after my prior phoneAuth change, even though the rest of the kiosk now treats body scan as lazy. Symptom that surfaced this: a returning customer entering via the tablet code with a real `bodyScanFileId` would briefly see `ScanChoiceScreen`'s `!hasPreviousScan` copy (`"Welcome, X / Let's capture a quick body scan…"`) because `bodyScanInfo` is a `useQuery` that returns `undefined` for the first ~100-300ms after `setCustomerId`. The screen self-corrected to `"Welcome back, X"` once the query resolved, but the flicker was visible and confusing.
- **Fix:** removed the scanChoice/consent gate at the end of `codeEntry onValidCode`. Now lands directly on `trialRoom` (when the tablet pre-loaded a shortlist) or `home` (when there's nothing pre-loaded). Body scan triggers lazily — via the `NO_BODY_SCAN:` catch redirect to `consent` from the codeEntry-loop's `runTryOn` call (changed from `scanChoice` → `consent` to match the phoneAuth path), and via the same catch on home/product-detail picks. Reconciliation effect re-fires `runTryOn` for queued items once the scan completes.
- **Same UX shape as phoneAuth:** returning customer with a valid `bodyScanFileId` → kiosk never shows a body-scan screen on entry. New customer / no-file → first send-to-trial throws `NO_BODY_SCAN:`, catch redirects to `consent` → `bodyScan` capture, then back into the trial flow.
- **Dead code now:** `scanChoice` screen is reachable only from the `RetakeConfirmModal` flow in `trialRoom` (line ~2763 — user taps "Retake body scan", confirms via modal, then lands on `scanChoice`). That entry is itself redundant since the retake modal already serves as the "are you sure" prompt; `scanChoice`'s "Use Previous Scan" button effectively undoes the retake intent. Worth retiring `scanChoice` entirely and routing retake → `consent` directly. Not in this pass — flagged.
- **Dead refs:** `scanEligibleRef` and `returningRef` are now write-only (the only read site was the gate I removed). Left in place for minimal surface area; safe to remove in a future cleanup.

### Saree image backfill script — closes the seed/runTryOn gap

- **Why:** seeded sarees ship with `grad` + `emoji` only — no `imageIds`. `convex/tryOn.ts` Step 7 hard-requires `saree.imageIds[0]` (RunPod needs an actual garment image), so every try-on against a seeded saree throws `INTERNAL: saree has no image`. The local files in `public/inventory/*` exist for the front-end `SareeThumb` fallback chain but were never linked into Convex Storage. Discovered at runtime when the kiosk hit the error post-pairing.
- **Fix:** new `scripts/backfill-saree-images.mjs` — Node script that reads each `public/inventory/<name>` file, posts to `files.generateUploadUrl`, then patches the matching saree row via `files.setSareeImages`. Idempotent: skips sarees that already have `imageIds`. Uses the same name → filename map as `components/SareeThumb.tsx` (kept in sync manually).
- **Run:** `pnpm seed:saree-images` (uses `.env.local` for the dev URL; pass `CONVEX_URL=...` to target prod).
- **Coverage:** the seed has 14 sarees; 9 names have a corresponding `public/inventory/*` file and get backfilled. The other 5 (`Royal Banarasi Silk`, `Banarasi Brocade Gold`, `Tussar Natural`, `Pure Kanchipuram Bridal`, `Soft Silk Temple`) have no local file and remain image-less — they'll throw `INTERNAL: saree has no image` until someone uploads via `/store/inventory/<id>`. The script logs them as `UNMAPPED` so the gap is visible.
- **No new dependencies.** Tiny inline `.env.local` parser avoids pulling `dotenv` in for one script. Convex's `convex/browser` ESM export + `convex/_generated/api.js` work with bare `node` — no `tsx` / `ts-node` needed. Script is `.mjs` to match.
- **Why not an internalAction or seed extension?** Convex internal actions can't read local disk and can't reach `localhost:3000` from the cloud, so they can't fetch `/inventory/*` files. A script running on the developer's machine is the only practical path — and it's a one-shot per environment, so additional automation isn't worth it.

### Kiosk phoneAuth — body-scan deferred to first send-to-trial

- **Why:** customer-facing phoneAuth path used to gate the home screen behind `scanChoice` (returning + scan-eligible) or `consent` → `bodyScan` (everyone else). For first-time phone-login customers especially, this meant 3-4 screens of body-scan flow before they ever saw a saree. Brief was: "logs in directly with phone number → directly open the store; if new, body scan kicks in only when they send something to trial."
- **Three navigation changes in `app/kiosk/page.tsx`:**
  - OTP `onVerified` (returning-customer branch): `if (scanEligibleRef.current) navigate("scanChoice"); else navigate("consent");` → `navigate("home")` unconditionally.
  - `newCustomer onRegistered`: `navigate("consent")` → `navigate("home")`.
  - `onSendToTrial` (home grid) and `onAddToTrial` (product detail) `runTryOn` `.catch` handlers: redirect target on `NO_BODY_SCAN:` changed from `scanChoice` → `consent` (skip the `scanChoice` intro for first-time customers; they go straight into camera permission → bodyScan).
- **What didn't change:** `codeEntry` (store-code / "store login" path) keeps its scanChoice/consent gating — the tablet-curated flow expects an upfront body-scan handshake. The `codeEntry` shortlist-load `runTryOn` `.catch` (line ~707) also kept its `scanChoice` redirect; it's redundant with the explicit navigation that follows but harmless.
- **End-to-end new-customer path now:** phoneAuth → otp → newCustomer → home → tap saree → Send to Trial → `setTrialItems` populates → `runTryOn` throws `NO_BODY_SCAN:` → catch redirects to `consent` → user grants camera → `bodyScan` capture → `recordBodyScan` writes `bodyScanFileId` → reconciliation effect (logged just below this entry) re-fires `runTryOn` for the queued items → `aiProcessing` (briefly, while polls run) → `trialRoom` shows AI renders.
- **Brief aiProcessing/trialRoom flicker on the no-scan path:** `onSendToTrial` calls `navigate("aiProcessing")` synchronously after the for loop; the `runTryOn` `.catch` fires async ~100-300ms later and overrides with `navigate("consent")`. Same shape on `onAddToTrial` (`navigate("trialRoom")` sync, `navigate("consent")` from catch). Acceptable — the user sees ~half a second of the next screen before the consent prompt; not worth gating the sync nav on `bodyScanInfo?.hasFileId` because that query is async-loaded and could regress users in the brief loading window.
- **Skip on consent is a known UX hole:** the existing consent screen's "Skip" still routes to `trialRoom` (or `home`) without recording a scan. A user who taps Skip from this new entry path will land in `trialRoom` with items but no scan — the reconciliation effect won't fire (gated on `bodyScanInfo?.hasFileId`) and TrialTiles will sit on "Preparing…". Explicit choice; not a default. Revisit if it becomes a real complaint.

### Kiosk try-on — reconciliation effect closes the no-body-scan + retention-hydration gaps

- **Symptom:** customer reaches `trialRoom`, every TrialTile sits on the "Preparing…" skeleton forever, and RunPod's console shows zero requests.
- **Root cause:** `runTryOn` is fired optimistically from three call sites in `app/kiosk/page.tsx` — `onSendToTrial` (home), `onAddToTrial` (product detail), `codeEntry` (tablet shortlist load). All three add the saree to `trialItems` first, *then* fire `runTryOn`. When the customer doesn't yet have a `bodyScanFileId`, the action throws `NO_BODY_SCAN:` at Step 6 of the guard chain (`convex/tryOn.ts:541-543`) — **before** `submitRunPodJob`. So no looks row, no RunPod request, and `sareeLookIds` stays empty. The `.catch` redirects to `scanChoice` and the customer completes the scan, but nothing in the existing flow re-fired `runTryOn` for the items already sitting in `trialItems`. `TrialTile` keys on `sareeLookIds[saree._id]`; missing → "Preparing…" forever.
- **Fix:** new reconciliation `useEffect` in `app/kiosk/page.tsx` keyed on `[customerId, sessionId, deviceToken, bodyScanInfo?.hasFileId, trialItems, sareeLookIds]`. Once a scan exists, walks `trialItems` and fires `runTryOn` for any saree missing both a lookId and an in-flight call. Dedup via `inFlightTryOnRef: useRef<Set<string>>`; cleared in `handleWipe`.
- **Bonus coverage:** the same effect fixes a latent hole in retention hydration — `savedTrialCart` repopulates `trialItems` for returning customers, but `sareeLookIds` is *not* rehydrated (previous-session lookIds aren't carried forward, by design). Without this effect, every retention-loaded item would also stick on "Preparing…". Now they get fresh looks generated on the next visit.
- **Why not just gate the call-site fires on `bodyScanInfo?.hasFileId`?** Two reasons: (1) `bodyScanInfo` is async-loaded; gating would regress users in the brief loading window. (2) The existing `NO_BODY_SCAN:` redirect is desirable UX — it *tells* the customer they need to scan. Better to keep the optimistic fires and add a recovery path than to refactor three call sites for the same effect.
- **Race window with the call-site fires:** when the scan IS present and a call site has just fired `runTryOn`, the effect can run on the next React commit before the call site's promise resolves. Without coordination, both fire for the same saree. Server-side dedup at `_findExistingLook` (`convex/tryOn.ts:561-578`) catches this when the first call has already inserted the looks row; the spec already accepts a 1-shot race breach in the worst case ("ambiguous TOCTOU, ~₹3 cost"). Not worth the call-site refactor to close fully.
- **Files touched:** `app/kiosk/page.tsx` only. Three insertions: ref declaration, effect, ref-clear in `handleWipe`. No backend or schema changes. Type-check clean.

### Kiosk RunPod try-on — Convex action + scheduled poller + reactive looks row

- **Why:** Wearify is positioned as an "AI virtual try-on platform" but the AI step was a placeholder until now. The kiosk's "send to trial" flow created `looks` rows but never generated an image — `looks.imageFileId` was always undefined, and `/c/looks` rendered the saree catalog image as a fallback (per the priority chain documented earlier in this log). This pass ports the standalone proof-of-concept at `~/Documents/comfyui_next` (Next.js + RunPod + Qwen Image Edit + saree LoRA) into the kiosk module.
- **Architecture choice — Convex action over Next.js API route.** The reference uses a Next.js API route + client polling. We chose a Convex action + scheduled internal poller + reactive `looks` row instead, for three reasons: (1) it matches the codebase's "everything in Convex, no client polling" rule (CONTEXT.md §9); (2) it keeps `RUNPOD_API_KEY` in the same runtime as `BETTER_AUTH_SECRET` and the SendGrid keys (per the dual-runtime env var split); (3) reactive subscription on the `looks` row gives the kiosk skeleton → result transitions for free without any timer logic on the client.
- **Workflow JSON ownership** — built entirely server-side in `convex/runpod.ts` (`buildSareeWorkflow`). Never crosses the wire. Devtools can inspect the action call (`{ deviceToken, sessionId, sareeId }`) and the reactive query stream, but cannot see or modify the LoRA name, prompt, negative prompt, sampler params, or RunPod endpoint. See spec §"Devtools tampering threat model" for the full attack table.
- **The eight guards (in code, in this order):** auth via `_lookupDevice` (action-runtime equivalent of `requireKioskDeviceForStore`), kill switch (`platformConfig.tryon.enabled`), cross-store saree check (`saree.storeId === device.storeId`), per-session caps (max 3 in-flight, max 20 total), per-customer rate limits (5/min, 30/hr via the new `looks.by_customerId_and_createdAt` index), body-scan presence (`customers.bodyScanFileId`), saree-image presence (`saree.imageIds[0]`), and dedup on `(customer, session, saree)` preserving `createLook`'s existing idempotency. All counts are O(log N) range scans; the expensive call (RunPod POST + base64 conversion) only happens after every guard passes.
- **Two env vars, one runtime.** `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID` live in Convex env only — never in Netlify, never in client bundle. Set via `npx convex env set` (and `--prod` when ready to ship). `platformConfig.tryon.runpodEndpointId` provides an admin-controlled override; API key is env-only by design.
- **Dry-run mode.** `platformConfig.tryon.dryRun = "true"` makes the orchestrator (`convex/tryOn.ts`) skip the real RunPod POST and write a canned 1×1 PNG via the same store/poll/complete chain. Used for end-to-end smoke testing without RunPod spend (and as the default state in dev).
- **Three kiosk call-site changes.** `app/kiosk/page.tsx` `onSendToTrial` (multi-select), `onAddToTrial` (product detail), and `codeEntry` shortlist load all switched from `createLook` mutation → `tryOn.runTryOn` action. `createLook` stays in `convex/sessionOps.ts` as the row-insert primitive for non-kiosk callers; `runTryOn` uses an internal `_insertQueuedLook` mutation with the same row shape.
- **Failure UX.** `TrialTile` subscribes to its `looks` row via `useQuery(api.tryOn.getLook)`. Status drives the UI: `queued`/`processing` → skeleton + Loader2 + elapsed counter; `completed` → AI render via `useConvexUrl(imageFileId)`; `failed` → saree thumbnail with maroon error chip + Retry button. Synchronous throws are pattern-matched by prefix (`CONCURRENCY_LIMIT:`, `RATE_LIMIT_MINUTE:`, etc.) into toasts via `handleTryOnError`. `NO_BODY_SCAN:` additionally auto-opens the scan flow.
- **Retake fan-out.** A "Retake body scan" button in the trial room opens a confirm modal with three actions: Cancel, Just retake, Retake + refresh. The "+ refresh" path queues `retryLook` with `useLatestBodyScan: true` for every look in the trial room once `customers.getLastBodyScanTs` reflects the new scan — fan-out is gated on the timestamp change so cancelling mid-flow doesn't fire retries against the old scan.
- **Retry idempotency.** `tryOn.retryLook` refuses `queued`/`processing` retries silently (returns existing lookId), and refuses `completed` retries unless `useLatestBodyScan: true` is passed (the retake fan-out exception). `failed` rows are always retriable. `_patchLookForRetry` clears `imageFileId`/`errorCode`/`errorMessage`/`startedAt`/`completedAt` so the row goes back to a clean `queued` state.
- **Not in this pass (flagged):** audit log row per `runTryOn` call (`auditLog` exists; emit `tryon.run` rows for forensics — small task), admin UI for `tryon.*` `platformConfig` knobs, per-store-per-day cost ceiling, image preprocess via `"use node"` + `sharp` if RunPod payload size becomes an issue, race-window close via atomic in-flight counter (current race breaches by at most 1, ~₹3), tablet-side trigger (needs tablet auth first), customer PWA self-serve try-on, additional categories (men's formal, men's traditional — pure addition), webhook-based completion.
- **Verification:** `pnpm run type-check` clean across all 16 commits. `npx convex dev` boots clean (the new `by_customerId_and_createdAt` index materializes, all functions register). End-to-end smoke test in dry-run mode and one live RunPod round are the next gates (Tasks 18 and 19 of `docs/superpowers/plans/2026-05-03-kiosk-runpod-tryon.md` — deferred pending env-var setup). See `docs/superpowers/specs/2026-05-03-kiosk-runpod-tryon-design.md` for the full spec.

### Production deployment — Netlify frontend + prod Convex + the dual-runtime env var split

- **URLs:**
  - Live app: <https://wearifyy.netlify.app> (Netlify, auto-deploys from `pre-production` branch).
  - Prod Convex: **`prod:quirky-narwhal-971`** → `https://quirky-narwhal-971.eu-west-1.convex.cloud` (functions) / `.convex.site` (Better Auth HTTP routes).
  - Dev Convex (still active): `dev:formal-snake-780` — keep using this for local work; don't cross-wire.
- **Build command** in [netlify.toml](netlify.toml): `npx convex deploy --cmd 'npm run build'`. That's Convex's recommended pattern — deploys `convex/*` to prod first, then runs `next build` with `NEXT_PUBLIC_CONVEX_URL` auto-injected from the deploy key. So the prod URL is never pinned in the repo.
- **The dual-runtime env var gotcha (read this before debugging prod auth):**
  - Better Auth in this app runs **inside Convex**, not inside Next.js. See [convex/betterAuth/auth.ts:24-25](convex/betterAuth/auth.ts#L24-L25) — it reads `process.env.SITE_URL` and `process.env.BETTER_AUTH_SECRET` from the Convex runtime. The Next.js API route at [app/api/auth/[...all]/route.ts](app/api/auth/[...all]/route.ts) is just a proxy that forwards to the Convex HTTP endpoint via `convexBetterAuthNextJs`.
  - Consequence: env vars split across two runtimes.
    - **Netlify env** (Next.js build + runtime): `CONVEX_DEPLOY_KEY`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `NEXT_PUBLIC_SITE_URL`, `SITE_URL`, `BETTER_AUTH_SECRET` (for any Next.js-side Better Auth fallback), `NODE_VERSION`.
    - **Convex prod env** (Convex dashboard → Production → Settings → Environment Variables, or `npx convex env set --prod`): `SITE_URL`, `BETTER_AUTH_SECRET`. **These must be set here too or every auth call returns HTTP 500.** Discovered the hard way; burned two iterations.
  - Keep `BETTER_AUTH_SECRET` in sync across both runtimes so that a Next.js-side token can be validated by the Convex-side instance.
- **`SITE_URL` must NOT have a trailing slash.** Better Auth appends paths like `/callback/google` and `https://x.netlify.app//callback/google` won't match registered callbacks. Noted because Netlify sometimes auto-formats with a slash when you paste.
- **`/api/auth/*` requires an `Origin` header.** Better Auth's CSRF check rejects requests with `MISSING_OR_NULL_ORIGIN` (HTTP 403). For server-to-server or curl calls, set `Origin: https://wearifyy.netlify.app` manually.
- **Admin bootstrapping on prod.** Admin login is sign-in only — no signup form (intentional; admin accounts are provisioned out-of-band). `admin@wearify.com` is hardcoded in the `ADMIN_EMAILS` allow-list ([convex/adminAuth.ts](convex/adminAuth.ts)) and in the client-side check at [app/admin/login/page.tsx:7](app/admin/login/page.tsx#L7). To create the prod admin account:

  ```bash
  curl -X POST https://wearifyy.netlify.app/api/auth/sign-up/email \
    -H 'Content-Type: application/json' \
    -H 'Origin: https://wearifyy.netlify.app' \
    -d '{"email":"admin@wearify.com","password":"<strong>","name":"Admin"}'
  ```

  Any other email will get a Better Auth user created but fail the admin allow-list — so arbitrary signups are harmless.
- **Secrets reference memo** at `.env.prod` (gitignored via `.env*`). Stores the Convex deploy key, Better Auth secret, and prod URLs for copy-paste into dashboards. Never commit; rotate the deploy key if it ever appears in a shared log.
- **Prod data state:** seed not yet run on prod. `npx convex run --prod seed:seedAll '{}'` + `...seed:seedRelational '{}'` to populate the 5 demo stores, staff PINs, customers, and tailors.
- **Not yet automated (flagged):** password-reset flow for admin (today's recovery is "delete the `users` row in Convex dashboard + sign up again"), Netlify deploy previews per PR, environment-specific analytics, Sentry/log aggregation.

### Kiosk device pairing — real auth for the `/kiosk` surface, admin-controlled

- **Why:** `/kiosk/setup` used to ask for a `storeId` (e.g. `ST-001`) and a hardcoded `tabletCode = 123456` that was never read server-side. `storeId` is not a secret — it's in URLs, seed docs, and CONTEXT.md. Anyone who knew it could impersonate a kiosk and write sessions/orders/body-scans for that store. The `tabletCode` was dead config. This pass replaces that with a short-lived pairing code → long-lived device token flow, admin-observable and admin-revocable.
- **Schema** ([convex/schema.ts](convex/schema.ts)):
  - `devices` gained `deviceToken` (hex 32-byte), `pairedAt`, `pairedByEmail`, `pairedByKind: "admin" | "store_owner"`, `revokedAt`, `revokedByEmail`, `deviceLabel`, `lastSeenAt`, plus a `by_deviceToken` index. Revoked rows are kept (status flipped, token cleared) so audit survives.
  - New `kioskPairings` table: 6-digit codes, 2-min TTL, single-use. Indexed by `code` and by `storeId`.
  - New `kioskPairingAttempts` table: per-store rolling-window rate limit (30 failures per 10 min) — same pattern as `staffPinAttempts` / `trialCodeAttempts`.
- **Backend guards** ([convex/kioskAuth.ts](convex/kioskAuth.ts)):
  - `requireKioskDevice(ctx, token)` — looks up by `by_deviceToken`, rejects missing/unknown/revoked, refreshes `lastSeenAt` on mutation calls.
  - `requireKioskDeviceForStore(ctx, token, storeId)` — additionally verifies the device is paired to the expected store. The device's own `storeId` is authoritative; the client-supplied one is only a sanity check.
- **Pairing mutations** ([convex/kioskPairing.ts](convex/kioskPairing.ts)):
  - `createPairingCode({ storeId, sessionToken? })` — authorizes as admin (Better Auth) OR as the `userSessions`-authenticated store owner of that store. Generates a 6-digit crypto-random code with uniqueness check against outstanding codes. Returns `{ code, expiresAt, storeName }`.
  - `consumePairingCode({ code, deviceLabel? })` — unauthenticated (the code IS the credential, like trial-room codes). Rate-limited per store. On success, inserts a `devices` row and returns `{ deviceId, deviceToken, storeId, storeName }` to the kiosk — the ONLY time `deviceToken` is ever returned to a client.
  - `revokeDevice({ deviceId, sessionToken? })` — same admin-or-owner auth. Sets `revokedAt`, clears `deviceToken` so cached copies die immediately without waiting for the revoked-check.
  - `listDevicesForStore`, `listActivePairingCodesForStore`, `listAllPairedDevices` — projection helper `pickDevicePublicFields` strips `deviceToken` from every read; never leak it to clients.
- **Guarded mutations** — four writes now accept an optional `deviceToken`:
  - [convex/sessionOps.ts](convex/sessionOps.ts): `createSession`, `createOrder`, `endSession`
  - [convex/customers.ts](convex/customers.ts): `recordBodyScan`
  - **Dual-mode rationale:** `deviceToken` is `v.optional(v.string())`, not required. If present, enforced via `requireKioskDeviceForStore`. If absent, the mutation runs without device check. This is deliberate — the tablet also calls `createSession`/`endSession` and has no device identity yet (staff PIN login doesn't mint a `userSessions` token). Tightening this to required is the next pass once the tablet gets real auth. **The kiosk always sends the token now**, so this captures the rogue-internet-client threat.
- **Secondary mutations left ungated** (flagged): `sessionOps.{addToWardrobe, createLook, updateSession, addTrialCartItem, removeTrialCartItem, addCartItem, updateCartQty, removeCartItem, clearCart}`, `trialRoom.{validateCode, markCodeUsed}`, `tailorOps.createReferral`, `phoneAuth.verifyOtp`, `customers.ensureByPhone`. These are session-scoped (require a sessionId that was created via the guarded `createSession`) — so they're protected transitively. Threading `deviceToken` into each is mechanical and deferred.
- **Frontend — kiosk:**
  - [app/kiosk/setup/page.tsx](app/kiosk/setup/page.tsx) fully rewritten: 6-digit code input (+ optional device label) → `consumePairingCode` → stores `{ storeId, storeName, deviceId, deviceToken, deviceLabel, pairedAt }` in `localStorage.wearify_kiosk_store`. The old `storeId`/`tabletCode` pair-field is gone.
  - [app/kiosk/layout.tsx](app/kiosk/layout.tsx) + [app/kiosk/page.tsx](app/kiosk/page.tsx): hydrate `deviceToken` on mount. Legacy configs missing `deviceToken` are wiped and the technician is bounced to `/kiosk/setup` — no legacy-compat mode, simplest migration. Token is passed on every `createSessionMut` / `createOrder` / `endSessionMut` / `recordBodyScan` call.
- **Frontend — store self-serve:** new [app/store/settings/kiosks/page.tsx](app/store/settings/kiosks/page.tsx). Linked from `/store/settings` via a new "Kiosk Mirrors" row (added to `SettingsRow` list in [app/store/settings/page.tsx](app/store/settings/page.tsx)). Generate-code block with a live `useCountdown` countdown, paired-devices list with per-row Revoke, and a revoked-devices dim list for audit clarity. Reads `storeId` and `sessionToken` from `localStorage.wearify_auth_user` + `wearify_auth_token` — same pattern `/store/settings/billing` already uses.
- **Frontend — admin:** [app/admin/devices/page.tsx](app/admin/devices/page.tsx) gained a **Pairing** tab (new `PairingTab` component in the same file). KPIs (paired / revoked / stores), issue-code picker (store dropdown → generates code with 2-minute countdown), and all paired devices grouped by store with per-row Revoke. Existing Fleet tab is untouched (seeded telemetry devices — no `pairedAt` — are filtered out of the Pairing view via `listAllPairedDevices`).
- **Threat model this closes:**
  - Rogue kiosk claiming to be a store → blocked (no valid `deviceToken`).
  - Stolen pairing code replay → blocked (single-use, consumed atomically).
  - Stolen pairing code hoarded → expires in 2 minutes.
  - Brute-force 1M code space → rate-limited to 30 fails per 10-min window per store.
  - Revoked device still functioning → blocked (`requireKioskDevice` checks `revokedAt`, and `deviceToken` is cleared on revoke so even cached copies die).
  - Client lying about `storeId` → backend uses the device's own `storeId`; `requireKioskDeviceForStore` cross-checks.
- **Authorization matrix** (who can do what via the pairing mutations):
  - `createPairingCode` / `revokeDevice` / `listDevicesForStore` / `listActivePairingCodesForStore` — admin for any store, store_owner for own store only.
  - `listAllPairedDevices` — admin only.
  - `consumePairingCode` — unauthenticated (code is the credential).
- **Not in this pass (flagged):**
  - Tablet-side pairing UI (tablet still has no server-side session identity — staff PIN login returns staff info but doesn't insert into `userSessions`; would need that first).
  - Threading `deviceToken` into the other ~10 kiosk-facing mutations (see "Secondary mutations left ungated" above). Not a hole in the model because they're session-scoped; just belt-and-suspenders for a future tightening.
  - Auto-revoke on staff role change / password reset.
  - Admin "bulk revoke all devices for a store" one-click.
  - Seed-time pairing (demo `devices` rows from `seed.ts` don't have a `pairedAt` and so won't appear in the new admin Pairing tab; fine — they're not real kiosks, and the Fleet tab still shows them).
- **Migration:** dual-read happens client-side — any legacy localStorage config without `deviceToken` is wiped on next load and the kiosk lands on setup. No backfill needed server-side. Existing seeded `devices` rows remain valid in the Fleet tab (they never had a `deviceToken` in the first place; they're mock telemetry).
- **Verification:** `npm run type-check` clean. Lint clean for all new code; only pre-existing `_foo` unused-var warnings in `customers.ts` / `sessionOps.ts` remain (predate this work). Smoke-testing the end-to-end flow (admin issue → kiosk consume → kiosk mutation → admin revoke → kiosk 401) is deferred to the next live session.

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
