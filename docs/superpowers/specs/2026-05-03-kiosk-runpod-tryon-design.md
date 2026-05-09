# Kiosk RunPod Try-On — Design Spec

**Date:** 2026-05-03
**Branch:** `kiosk-module` (worktree at `~/wearify-claude/wearify.kiosk-module`, branched from `pre-production`)
**Owner:** VRATHIK
**Status:** Approved for implementation planning

## Context

Wearify is positioned as an "AI-powered virtual try-on platform for Indian saree retailers" (CONTEXT.md §1), but the AI piece is currently absent. The kiosk's "send to trial" flow already creates `looks` rows (`convex/sessionOps.ts:createLook`), reuses customer body scans (`customers.recordBodyScan` / `lastBodyScan`), and renders saree catalog images on the mirror — but no actual try-on render is generated. `looks.imageFileId` was added as the slot for the rendered image (CONTEXT.md §"My Looks images" line 592 documents the existing read-priority chain `look.imageFileId → saree.imageIds[0] → gradient`); it is always `undefined` today.

A standalone proof-of-concept exists at `~/Documents/comfyui_next` — a Next.js + RunPod Serverless integration calling a ComfyUI Qwen Image Edit workflow with a saree-specific LoRA and prompt. This spec ports that capability into the Wearify kiosk module, aligned with the codebase's Convex-first conventions.

## Goal

Generate a real AI try-on render automatically when a customer in a kiosk session sends a saree to trial. The kiosk shows skeleton → AI render reactively from a `looks` row. The integration honours the existing kiosk auth model (device tokens, store-scoped mutations) and the codebase's "everything in Convex, no client polling" rule.

## Scope

### In scope (this spec)

1. **Convex action + scheduler + reactive query** for RunPod job lifecycle.
2. **Schema additions** on `looks` (status, jobId, snapshot file IDs, error fields, timing).
3. **Composite index** `looks.by_customerId_and_createdAt` for rate-limit range scans.
4. **`platformConfig` keys** for tunable caps and rate limits.
5. **Saree-only ComfyUI workflow JSON** ported byte-for-byte from `comfyui_next` reference (other categories dropped).
6. **Body-scan reuse** with retake affordance; retake offers fan-out re-render of session's existing looks.
7. **Four guards** at action entry: auth, kill switch, per-session caps, per-customer rate limits.
8. **Kiosk UI states** in the trial room: queued / processing / completed / failed; retry button on failure.
9. **Convex env vars** `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID` (no Next.js / Netlify env coupling).
10. **Dry-run mode** (`platformConfig.tryon.dryRun = "true"`) for end-to-end testing without RunPod spend.

### Out of scope (flagged for follow-up)

1. Tablet-side try-on trigger (tablet has no device-token auth yet).
2. Customer PWA self-serve try-on at `/c/looks` (different auth posture; result image already displays via existing fallback chain).
3. Multi-pose / pose-variant generation.
4. Color/pattern variants of a saree without a separate cloth image.
5. Cost dashboards, billing per store, per-store-per-day cost ceiling.
6. Webhook-based completion (RunPod supports it; we use polling to match the codebase pattern).
7. Audit log row per `runTryOn` call (`auditLog` table exists; emit `tryon.run` rows for forensics — small task, not blocking).
8. Admin UI for `tryon.*` `platformConfig` knobs (admin-controllable kill switch + tunable caps via `/admin` UI).
9. Image preprocess step (`"use node"` action with `sharp`) if RunPod payload size becomes an issue in practice.
10. Additional garment categories (men's formal, men's traditional) — workflow code already supports this shape, just adds new `CATEGORY_CONFIG` entries.

## Architecture

```
┌─────────────────────────┐         ┌─────────────────────────────────────────┐
│  KIOSK (browser, mirror)│         │              CONVEX                     │
│                         │         │                                         │
│  TrialRoom screen       │         │  ┌─────────────────────────────────┐    │
│   ├─ useQuery(getLook)──┼────────▶│  │ query  tryOn.getLook(lookId)    │    │
│   │  reactive: status,  │ live    │  │  reads looks row                │    │
│   │  imageFileId        │ stream  │  └─────────────────────────────────┘    │
│   │                     │         │                                         │
│   └─ useAction(runTryOn)┼────────▶│  ┌─────────────────────────────────┐    │
│      on send-to-trial   │  RPC    │  │ action tryOn.runTryOn(args)     │    │
│                         │         │  │  • requireKioskDeviceForStore   │    │
│                         │         │  │  • check tryon.enabled          │    │
│                         │         │  │  • check session/customer caps  │    │
│                         │         │  │  • check per-customer rate lim  │    │
│                         │         │  │  • read person + saree imgs     │    │
│                         │         │  │    from _storage as base64      │    │
│                         │         │  │  • POST RunPod /run             │──┐ │
│                         │         │  │  • insert looks row             │  │ │
│                         │         │  │    status="queued", jobId       │  │ │
│                         │         │  │  • scheduler.runAfter(1500,     │  │ │
│                         │         │  │      internal.tryOn.pollJob)    │  │ │
│                         │         │  └─────────────────────────────────┘  │ │
│                         │         │                                       │ │
│                         │         │  ┌─────────────────────────────────┐  │ │
│                         │         │  │ internal action tryOn.pollJob   │  │ │
│                         │         │  │  • GET RunPod /status/{jobId}   │──┤ │
│                         │         │  │  • IN_PROGRESS / IN_QUEUE →     │  │ │
│                         │         │  │    re-schedule self (backoff)   │  │ │
│                         │         │  │  • COMPLETED →                  │  │ │
│                         │         │  │    base64 → ctx.storage.store   │  │ │
│                         │         │  │    patch looks {status,         │  │ │
│                         │         │  │     imageFileId, completedAt}   │  │ │
│                         │         │  │  • FAILED / TIMEOUT →           │  │ │
│                         │         │  │    patch looks {status:failed}  │  │ │
│                         │         │  └─────────────────────────────────┘  │ │
└─────────────────────────┘         └───────────────────────────────────────┘ │
                                                                              │
                                            ┌─────────────────────────────────▼──┐
                                            │          RunPod Serverless         │
                                            │  POST /v2/{ID}/run    → jobId      │
                                            │  GET  /v2/{ID}/status/{jobId}      │
                                            │   COMPLETED → output.images[0]     │
                                            └────────────────────────────────────┘
```

### Module layout

| File | Role |
|---|---|
| `convex/schema.ts` | Add fields to `looks`; new index `by_customerId_and_createdAt` |
| `convex/tryOn.ts` *(new)* | Public action `runTryOn`, public action `retryLook`, public query `getLook`, internal action `pollJob`, internal mutations `_insertQueuedLook` / `_completeLook` / `_failLook`, internal queries `_countActiveForSession` / `_countForCustomerSince`. **Public** = client-callable; **internal** = only callable from other Convex code via `internal.*`. The dry-run check (`platformConfig.tryon.dryRun`) lives here in the orchestrator — not in `runpod.ts`. |
| `convex/runpod.ts` *(new)* | Pure RunPod / ComfyUI helpers — workflow JSON builder, REST submit/poll, base64 utils, response normalizer. No DB access. Action-runtime only. |
| `convex/sessionOps.ts` | Three existing call sites in `app/kiosk/page.tsx` that fire `createLook` (multi-select `onSendToTrial`, single-saree `onAddToTrial`, code-entry shortlist load) are switched to `tryOn.runTryOn`. The existing dedup behavior (one row per `(customerId, sessionId, sareeId)`) is preserved by `runTryOn`. `createLook` itself stays in place for any non-kiosk callers and as the row-insert primitive — `tryOn.runTryOn` calls it via an internal mutation, then layers on the RunPod fields. |
| `app/kiosk/page.tsx` | Trial-room UI: subscribe to per-saree `looks` row, show skeleton/result/error/retake. |
| `app/kiosk/screens/ScanChoiceScreen.tsx` (or sibling) | Add "Retake" affordance with fan-out confirm. |
| `convex/_generated/*` | Regenerated. |

### Public action signatures

```ts
// Client-callable. Kicks off a try-on for one saree.
runTryOn(args: {
  deviceToken: string;
  sessionId: string;
  sareeId: Id<"sarees">;
}): Promise<{ lookId: Id<"looks"> }>

// Client-callable. Re-runs a failed look (or any look, with a fresh body
// scan when useLatestBodyScan is true).
retryLook(args: {
  deviceToken: string;
  lookId: Id<"looks">;
  useLatestBodyScan?: boolean; // default false
}): Promise<{ lookId: Id<"looks"> }>

// Reactive query — kiosk subscribes to this for status / imageFileId.
getLook(args: {
  lookId: Id<"looks">;
}): Promise<LookDoc | null>
```

### Why this shape

- **Reactive `looks` row is the single source of truth.** Kiosk never polls; never knows about RunPod job ids. `looks.status` drives all UI states.
- **Internal action self-reschedules** via `ctx.scheduler.runAfter(delayMs, internal.tryOn.pollJob, { lookId })` with backoff (1500 → 2000 → 2500 → 3000 → 4000 ms, capped). Hard timeout: 5 min from `looks._creationTime`. Mirrors the comfyui_next backoff curve.
- **Result image goes into Convex File Storage** via `ctx.storage.store(new Blob([bytes], { type: "image/png" }))`. The `looks` row stores `imageFileId: Id<"_storage">` — same shape as `sarees.imageIds[]` and `customers.lastBodyScan.fileId`. Display via the existing `useConvexUrl` / `SareeThumb` family — no new image plumbing.
- **Boundary discipline.** `convex/runpod.ts` knows about RunPod + ComfyUI, nothing about Convex DB. `convex/tryOn.ts` knows about Convex (DB, scheduler, storage, auth) and orchestrates.

## Schema changes

### `looks` — additions (all optional for backward compat with seeded rows)

```ts
looks: defineTable({
  // ... all existing fields unchanged ...

  // Existing slot — already wired into /c/looks display priority.
  // The AI render writes here on completion. Was always undefined before.
  imageFileId: v.optional(v.id("_storage")),

  // Try-on lifecycle
  status: v.optional(v.string()),
  // "queued" | "processing" | "completed" | "failed"

  // RunPod job tracking
  runpodJobId: v.optional(v.string()),
  runpodEndpointId: v.optional(v.string()),
  // Endpoint snapshot at submit time so a later RUNPOD_ENDPOINT_ID change
  // doesn't orphan in-flight jobs from being polled.

  // Inputs (file-id snapshots — make the job reproducible/auditable
  // even if the customer later replaces lastBodyScan)
  personFileId: v.optional(v.id("_storage")),
  garmentFileId: v.optional(v.id("_storage")),

  // Failure path
  errorCode: v.optional(v.string()),
  // "RUNPOD_FAILED" | "TIMEOUT" | "INTERNAL"
  errorMessage: v.optional(v.string()),

  // Timing — debugging + later analytics
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  pollAttempts: v.optional(v.number()),

  // Cost — flagged future-work hook
  costPaise: v.optional(v.number()),
})
```

### New index

`by_customerId_and_createdAt: ["customerId", "createdAt"]` — backs the per-customer rate-limit range scans (`gte("createdAt", windowStart)`).

### `platformConfig` keys (no schema change — uses existing `{ key, value }` shape)

| Key | Default | Notes |
|---|---|---|
| `tryon.maxConcurrentPerSession` | `"3"` | Per-session in-flight cap |
| `tryon.maxPerSession` | `"20"` | Per-session total cap |
| `tryon.rateLimitPerMinute` | `"5"` | Per customer |
| `tryon.rateLimitPerHour` | `"30"` | Per customer |
| `tryon.timeoutMs` | `"300000"` | 5 min hard timeout |
| `tryon.runpodEndpointId` | *(none — falls back to env)* | Optional admin override |
| `tryon.enabled` | `"true"` | Kill switch |
| `tryon.dryRun` | `"false"` | Test mode — skips real RunPod call |

No new tables. Per-customer rate limits use `looks` itself via the new composite index. Concurrency cap uses `looks where sessionId=X and status in [queued, processing]` via the existing `by_sessionId` index + small in-memory filter. Session generation cap uses `looks where sessionId=X` count.

## Guards (in order, fail-fast)

```
runTryOn(deviceToken, sessionId, sareeId)
  │
  ├─ 0. Resolve session and customer (read-only via internal query):
  │     • session = sessions.where(sessionId=X).unique()  — throws if missing
  │     • customer = customers.get(session.customerId)    — may be null for
  │                                                          anonymous sessions
  │     • saree   = sarees.get(sareeId)                   — throws if missing
  │
  ├─ 1. Auth: requireKioskDeviceForStore(deviceToken, session.storeId)
  │     [existing helper — convex/kioskAuth.ts]
  │     Verifies device exists + not revoked + paired to session's store.
  │
  ├─ 2. Kill switch: read platformConfig "tryon.enabled"
  │     if !== "true" → throw "TRYON_DISABLED:"
  │
  ├─ 3. Cross-store saree check:
  │     saree.storeId must equal session.storeId (== device.storeId
  │     after step 1)
  │     → otherwise throw "UNAUTHORIZED: cross-store saree"
  │
  ├─ 4. Per-session caps (via internal.tryOn._countActiveForSession):
  │     a) Total cap: count(looks where sessionId=X) >= maxPerSession (20)
  │        → throw "SESSION_CAP_REACHED:"
  │     b) Concurrency cap: count(looks where sessionId=X AND
  │        status in ["queued","processing"]) >= maxConcurrentPerSession (3)
  │        → throw "CONCURRENCY_LIMIT:"
  │
  ├─ 5. Per-customer rate limits (only if customer is non-null, via
  │     internal.tryOn._countForCustomerSince — uses new index
  │     by_customerId_and_createdAt):
  │     a) Per-minute: count(...) >= rateLimitPerMinute (5)
  │        → throw "RATE_LIMIT_MINUTE:"
  │     b) Per-hour: count(...) >= rateLimitPerHour (30)
  │        → throw "RATE_LIMIT_HOUR:"
  │
  ├─ 6. Body scan present: customer.bodyScanFileId must be set
  │     (customer.lastBodyScan is a timestamp; the file id lives on
  │      customer.bodyScanFileId)
  │     → throw "NO_BODY_SCAN:"
  │
  ├─ 7. Saree image present: saree.imageIds[0] must exist
  │     → throw "INTERNAL: saree has no image"
  │
  ├─ 8. Dedup check (preserves existing createLook semantics):
  │     Look up looks by_sessionId where customerId=X AND sareeId=Y
  │     • Found, status in [queued, processing, completed]
  │       → return existing lookId, no new RunPod job, no new row
  │     • Found, status=failed → fall through to retry (like retryLook,
  │       but in-line — patches the existing row, doesn't insert a new one)
  │     • Not found → fall through to fresh insert
  │
  └─ Proceed: snapshot personFileId = customer.bodyScanFileId and
              garmentFileId = saree.imageIds[0]; either bypass to dry-run
              or POST RunPod; insert (or patch on retry) looks row with
              status="queued" + runpodJobId + endpointSnapshot;
              schedule poller.
```

Steps 0–8 are all reads + cheap counts. The expensive call (RunPod POST + Convex Storage reads for base64 conversion) only happens after every guard passes and the dedup check confirms a fresh job is needed.

### Race window (acknowledged)

Two parallel `runTryOn` calls from the same kiosk could both pass the concurrency check and both insert, briefly putting the session at 4 in-flight. Acceptable because:
- Action calls are normally sequenced one-at-a-time by the kiosk client.
- Even when racing, the bound is breached by 1, costing at most one extra RunPod job (~₹3).
- Closing the race fully needs an atomic in-flight counter mutation — heavier than the cost of an occasional +1.

If real usage shows the race biting, gate via a dedicated `kioskTryOnInFlight` mutation that atomically increments and rejects in one transaction. Same pattern as `kioskPairingAttempts`. **Flagged as a follow-up.**

## ComfyUI workflow port

### Reference

`~/Documents/comfyui_next/app/api/run/route.ts:72–344` — ~270 lines of nested JSON describing ~20 ComfyUI nodes (Qwen Image Edit + LoRA + VAE + KSampler + comparison/save). Two injection points:

- **Node 12** — `base64_data: clothImageBase64` ← saree image
- **Node 13** — `base64_data: personImageBase64` ← customer body scan
- **Node 8** — `value: prompt` ← saree prompt (verbatim from reference)
- **Node 4** — `lora_name` ← `Qwen-Image-Edit-2511-Object-Adder.safetensors`
- **Node 135** — negative prompt (verbatim from reference)

### Departures from the reference

1. **Saree-only.** Drop `mens_formal` and `mens_traditional` `CATEGORY_CONFIG` entries. Easy to re-add later.
2. **Image input is a Convex Storage `fileId`, not URL or client-supplied base64.**
   - Person: `customers.bodyScanFileId` (the `_storage` id; `customers.lastBodyScan` is a separate timestamp field, not an object).
   - Garment: `sareeDoc.imageIds[0]` (cover image, same priority as `SareeThumb`).
   - Action resolves both via `ctx.storage.get(fileId)` → `Blob` → base64.
   - Eliminates `urlToBase64` from the reference and removes the client-supplied-URL attack surface.
3. **No client-side workflow assembly.** The reference's `app/tryon/page.tsx` knows ComfyUI internals (status states, image normalization). Here, the kiosk knows nothing — it sees `looks.status` + `looks.imageFileId`.

### `convex/runpod.ts` exports (no DB)

```ts
export function buildSareeWorkflow(personBase64, garmentBase64): RunPodRunPayload
export async function submitRunPodJob(apiKey, endpointId, payload): Promise<{ id: string }>
export async function pollRunPodJob(apiKey, endpointId, jobId): Promise<RunPodStatusResponse>
export function fixBase64Padding(base64: string): string
export async function blobToBase64(blob: Blob): Promise<string>
export function extractImageBase64(status: RunPodStatusResponse): string | null
export function readRunPodConfig(): { apiKey: string; endpointId: string }
```

### Image size

Per the upload guards: body scan ≤ 10 MB, saree ≤ 5 MB. Worst-case combined base64 ~21 MB request body. RunPod accepts up to ~20 MB. Close to the line. The reference's workflow downscales internally (nodes 9 and 11 — `QwenEditAdaptiveLongestEdge` to 2300 / 1536), so model never sees the full size. Sending full-size is wasteful network but functional.

**Mitigation deferred:** if RunPod rejects oversized requests in practice, add a `"use node"` Node action `tryOn.preprocessImages` that resizes via `sharp` before submission. Not blocking.

## Devtools tampering threat model

The workflow JSON never crosses the wire. The kiosk sends only:

```ts
runTryOn({ deviceToken, sessionId, sareeId })  // → returns { lookId }
```

Then subscribes to the `looks` row. LoRA name, prompt, RunPod endpoint, RunPod API key — none reach the client.

| Attack | Mitigation |
|---|---|
| Tamper `sareeId` to point at another store's saree | Action checks `saree.storeId === device.storeId` and throws `UNAUTHORIZED:`. |
| Tamper `sessionId` to claim another customer's session | Read `customerId` from `sessions` row server-side. Action also asserts `session.storeId === device.storeId`. |
| Send a different `personFileId` | Client doesn't supply it. Action reads `customers.bodyScanFileId` from the customer row attached to the session. |
| Forge `deviceToken` | `requireKioskDeviceForStore` rejects unknown/revoked tokens. 32-random-byte space. |
| Replay valid `deviceToken` from a non-kiosk page | Existing kiosk threat model. Rate limits + concurrency caps + per-customer rate limits bound the blast radius. Admin can revoke. |
| Inject prompt overrides via mutation arg | No prompt args exist on `runTryOn`. Adding any in the future needs allow-list validation — flagged. |
| Read RunPod API key from network or client bundle | API key lives in Convex prod env only. Next.js never sees it. |
| Trigger expensive workflow shape via dev tools | Workflow shape is server-built. Only client-controllable input is sareeId — store-scoped + rate-limited. |

**Residual:** a kiosk with the device token in localStorage. Physical access to a paired kiosk lets an attacker trigger generations within the customer's allowance. Rate limits cap this at ~30/hr/customer = ~₹90/hr/customer worst case. Admin revocation is immediate. Matches the existing kiosk threat model documented in CONTEXT.md §"Kiosk device pairing."

## UX states

### Trial-room tile per saree

| `status` | Tile shows |
|---|---|
| `"queued"` | Skeleton + spinner. Subtitle: *"Preparing…"* |
| `"processing"` | Skeleton + spinner. Subtitle: *"Generating your look… {n}s"* |
| `"completed"` | Result image via `useConvexUrl(imageFileId)`. Tappable for fullscreen. |
| `"failed"` | Saree's catalog image (fallback) + error chip + **Retry** button. |

### Synchronous error toasts (action throws before scheduling)

| Throw prefix | Toast | Recoverable? |
|---|---|---|
| `CONCURRENCY_LIMIT:` | "Wait for current renders to finish" | Yes |
| `SESSION_CAP_REACHED:` | "You've reached this session's try-on limit" | No (this session) |
| `RATE_LIMIT_MINUTE:` | "Too many try-ons just now — wait a moment" | Yes (~1 min) |
| `RATE_LIMIT_HOUR:` | "Too many try-ons recently" | Yes (~1 hr) |
| `TRYON_DISABLED:` | "Try-on is temporarily unavailable" | No (admin) |
| `NO_BODY_SCAN:` | "Please complete a body scan first" | Yes — auto-opens scan modal |
| `UNAUTHORIZED:` | "Session error — restart kiosk" | No — bounce to setup |
| `INTERNAL:` | "Something went wrong — try again" | Yes |

### Asynchronous failures (poller writes `status: "failed"`)

`looks` row has `errorCode` + `errorMessage`. UI shows fallback layout above. **Retry** runs `tryOn.retryLook({ deviceToken, lookId })` which:

- Validates ownership (session must match device's store).
- Refuses if `status !== "failed"` (idempotent).
- Re-runs all guards (counts toward rate limits).
- Reuses the same `personFileId` / `garmentFileId` snapshot.
- Patches in place: clears `errorCode` / `errorMessage` / `runpodJobId`, sets `status: "queued"`, schedules fresh poller.
- No retry cap (rate limits are the protection).

### Retake (Q3 Option C)

Triggered by **Retake body scan** affordance in the trial room. Calls existing `customers.recordBodyScan`, which patches `customers.bodyScanFileId` and refreshes `customers.lastBodyScan` (timestamp).

Retake **does not retroactively re-render** existing `looks` rows. UI shows confirm dialog: *"Re-render existing tries with the new scan?"* If yes, fires `retryLook({ ..., useLatestBodyScan: true })` for every `completed` look in the current session. The `useLatestBodyScan` flag tells `retryLook` to snapshot a fresh `personFileId` from `customers.bodyScanFileId` instead of reusing the old one. User-initiated only — no surprise costs.

### Empty / kill states

- **No `imageIds[0]` on saree:** action throws `INTERNAL: saree has no image`.
- **No `bodyScanFileId` on customer:** action throws `NO_BODY_SCAN:`. Kiosk auto-opens scan modal.
- **`tryon.enabled = "false"`:** kiosk renders catalog images only, no skeleton, no error. Generate calls toast `TRYON_DISABLED:`. Effectively reverts to today's no-AI behavior. Admin emergency switch.

## Env vars & secrets

| Var | Used by | Set in |
|---|---|---|
| `RUNPOD_API_KEY` | `convex/runpod.ts` (Authorization: Bearer) | **Convex env only** (dev + prod) |
| `RUNPOD_ENDPOINT_ID` | `convex/runpod.ts` | **Convex env only** (dev + prod) |

Both live in Convex runtime (no Next.js / Netlify env coupling). Matches the codebase's "external API calls happen inside Convex" convention (per CONTEXT.md §"dual-runtime env var split" and the `campaignOps` precedent).

```bash
# Dev
npx convex env set RUNPOD_API_KEY 'rpa_...'
npx convex env set RUNPOD_ENDPOINT_ID '5xtrcoflci8ktl'

# Prod (do not run until ready to ship)
npx convex env set --prod RUNPOD_API_KEY 'rpa_...'
npx convex env set --prod RUNPOD_ENDPOINT_ID '5xtrcoflci8ktl'
```

Both also recorded in `.env.prod` (gitignored) for human reference, matching the existing pattern for `BETTER_AUTH_SECRET` and `CONVEX_DEPLOY_KEY`.

### Resolution order in the action

1. `platformConfig.tryon.runpodEndpointId` (if set, non-empty) — admin override.
2. `process.env.RUNPOD_ENDPOINT_ID` — default.

API key is **env-only** — no `platformConfig` override (secrets shouldn't be admin-configurable).

### Initial values for this branch

Reuse the existing comfyui_next deployment values (`RUNPOD_API_KEY=rpa_*****`, `RUNPOD_ENDPOINT_ID=5xtrcoflci8ktl`). Wire into dev Convex (`dev:formal-snake-780`) on first PR-merge. Hold off on prod values until ready to ship.

## Testing approach

Codebase has no Jest/Vitest. Verification is `pnpm run type-check` + manual flows + a new dry-run mode.

### Static gates (block merge)

| Gate | Command | Coverage |
|---|---|---|
| Type-check | `pnpm run type-check` | All TS — schema, action signatures, query consumers in `app/c/looks` |
| Lint | `pnpm run lint` | New code only |
| Convex deploy validation | `npx convex dev` (boot once) | Schema migration errors, action signature mismatches, missing indexes |

### Dry-run mode

`platformConfig.tryon.dryRun = "true"` makes the orchestrator (`convex/tryOn.ts`) bypass the real RunPod calls. The check lives in the orchestrator, not in the pure helpers — `convex/runpod.ts` stays free of mode flags.

- `tryOn.runTryOn` skips the call to `submitRunPodJob` and instead writes a `looks` row with `runpodJobId = "DRYRUN-<random>"`, `status = "queued"`, then schedules `pollJob` as normal.
- `tryOn.pollJob` checks the `DRYRUN-` prefix on the row's `runpodJobId`; if present, it skips `pollRunPodJob` and immediately writes a fixed canned image (~5 KB base64 PNG bundled as a constant in `runpod.ts`) into Convex Storage, patches the row to `completed`.
- All real codepaths run: insert `looks` row, scheduler fires poller, poller writes `imageFileId`, kiosk subscribes and renders.

Lets us verify schema, scheduler, polling, file storage, retry, retake, all guards — without RunPod account or spend.

### Manual smoke test plan

**Happy path (dry-run):**
1. `wt switch kiosk-module`, dev Convex up, kiosk paired to ST-001.
2. Customer logs in (OTP `123456`), captures body scan.
3. Send-to-trial on a saree → `looks` row appears `queued` → `processing` → `completed` with canned image.
4. `/c/looks` for that customer shows the rendered image.

**Concurrency cap (dry-run):**
5. Set `tryon.maxConcurrentPerSession = "1"`. Send 3 sarees in quick succession. First processes; next two throw `CONCURRENCY_LIMIT:`. After first completes, retry the others.

**Per-customer rate limit (dry-run):**
6. Set `tryon.rateLimitPerMinute = "2"`. Generate 3 in 30 seconds. Third throws `RATE_LIMIT_MINUTE:`.

**Retake fan-out (dry-run):**
7. Generate 2 sarees → both `completed`. Retake body scan. Confirm dialog → both retry → `looks` rows update with new `personFileId` and the canned image again.

**Failure path:**
8. Force a poller failure: temporarily set `RUNPOD_ENDPOINT_ID` bogus, dry-run off → action throws on submit, no row inserted, toast shown.
9. Force `RUNPOD_FAILED`: with dry-run, override canned response to mimic FAILED. Row patches to `failed`, retry button works.

**Auth tampering:**
10. Open devtools, modify outgoing `sareeId` to a saree from ST-002. Action throws `UNAUTHORIZED:`.

**Live RunPod (one round, gated):**
11. Toggle `tryon.dryRun = "false"`. Run one happy-path generation. Cost: ~₹3.

### Not tested (acknowledged)

- No automated regression test suite — same as the rest of the repo.
- No load test of polling at scale.
- No visual regression on the loading-state UI — manual eyeball.
- No performance test of `_countForCustomerSince` under high look count (index makes it O(log N)).

## Documentation

- Append a short stub to CONTEXT.md §11 ("Recent Work") and a new entry to §12 (Conversation Log) when shipping. The §12 entry will document: why Convex action over Next.js route, where the workflow JSON lives, the four guards and their default tunings, the two env vars and the optional `platformConfig` override, and the flagged follow-ups.

## Open questions / future work

1. Audit log row per `runTryOn` call — small task, useful for forensics. **P1 follow-up.**
2. Admin UI for `tryon.*` `platformConfig` knobs (kill switch, caps, rate limits). **P1 follow-up.**
3. Per-store-per-day cost ceiling. **P2 follow-up.**
4. Image preprocess via `"use node"` + `sharp` if RunPod payload size becomes an issue. **P2 — only if it bites.**
5. Race-window close via atomic in-flight counter. **P3 — only if the +1 breach matters.**
6. Tablet-side trigger (needs tablet auth first). **P3.**
7. Customer PWA self-serve try-on. **P3.**
8. Additional categories (men's formal, men's traditional). **P3 — pure addition.**
9. Webhook-based completion. **P3 — only if polling cost matters.**
