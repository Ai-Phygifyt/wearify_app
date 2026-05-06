# Kiosk Shortlist Home Rail + Trial-Room Non-Persistence — Design

**Date:** 2026-05-06
**Status:** Draft (pending user review)
**Scope:** Tablet shortlist + kiosk codeEntry path + kiosk trial-room persistence

---

## Overview

Three coupled changes to the tablet → kiosk flow:

1. **Tablet shortlist 10-cap.** Cap shortlisted items at 10 per session (server-enforced + client-gated).
2. **Kiosk codeEntry path: Shortlisted home rail + auto-trial first 2.** When a customer enters the store at the kiosk via a tablet-issued 6-digit code, the kiosk no longer dumps every shortlisted saree into the trial room. Instead, all shortlisted items render in a new "Shortlisted" rail on the kiosk home screen (above "Trending Now"), and only the **first 2** (oldest by `addedAt`) auto-fire `runTryOn` and join the trial room. The phoneAuth login path is unchanged.
3. **Trial room is no longer persistent.** The `kioskTrialCart` table and its mutations are removed entirely. Trial items live only in React state for the duration of the session. Logout (Save or Delete) ends with both trial items and the Shortlisted rail empty.

Wardrobe persistence is untouched.

---

## Section 1 — Tablet shortlist 10-cap

### Backend

[`convex/sessionOps.ts`](../../convex/sessionOps.ts) — `addToShortlist`:

- Pre-insert: count existing rows with `by_sessionId` index, `take(11)`. If `>= 10`, throw `SHORTLIST_FULL: Shortlist is full (max 10 items)`.
- Mirrors the wardrobe cap pattern at the same file ~line 564.

### Tablet UI

[`app/tablet/catalogue/page.tsx`](../../app/tablet/catalogue/page.tsx) and [`app/tablet/catalogue/[id]/page.tsx`](../../app/tablet/catalogue/[id]/page.tsx):

- Disable the "+ Shortlist" button when `shortlistItems.length >= 10`. Visual: same "Sent to Mirror" muted state.
- Catch errors prefixed with `SHORTLIST_FULL:` and surface a toast/inline message: "Shortlist full — remove an item to add more (max 10)."

[`app/tablet/shortlist/page.tsx`](../../app/tablet/shortlist/page.tsx):

- Header subtitle appends `(max 10)`.
- "Items Shortlisted" stat card shows `{n}/10`.

### Concurrency

Server-side `existing.length >= 10` is the source of truth. Two-staff-on-same-session race could insert 11 briefly (ToCToU); acceptable — staff don't share tablet sessions in practice.

---

## Section 2 — Kiosk codeEntry: Shortlisted home rail + auto-trial first 2

### Approach

**Pass-through React state + localStorage persistence.** The server already returns `mirrorItems` from `validateCode`; we parse it once at the entry point and keep it in React state for the session. Persisted across page refresh via localStorage keyed by sessionId. Tablet codes are single-use (status flips to `used` on validate), so post-pairing tablet edits don't matter to the kiosk — no need for live server subscription.

### State

New in [`app/kiosk/page.tsx`](../../app/kiosk/page.tsx):

```ts
const [shortlistedItems, setShortlistedItems] = useState<SareeItem[]>([]);
```

localStorage key:

```ts
// localStorage.wearify_kiosk_shortlisted
{
  sessionId: string,        // matches the kiosk's active sessionId
  sareeIds: Id<"sarees">[], // ordered by addedAt asc (oldest first)
  autoTrialDone: boolean,   // prevents re-firing auto-trial on refresh
}
```

### codeEntry `onValidCode` rewrite

Today (~lines 730-801): resolves `mirrorItems` → `setTrialItems(resolved)` → fires `runTryOn` for ALL → navigates to `trialRoom`.

New flow:

1. Sort `data.mirrorItems` by `addedAt` **ascending** (oldest first).
2. Resolve all to `SareeItem[]` via `sareeMap`. Drop unresolved (saree deleted post-shortlist) via `filter(Boolean)`.
3. `setShortlistedItems(resolved)` and write `wearify_kiosk_shortlisted` localStorage with `autoTrialDone: false`.
4. Take `resolved.slice(0, 2)`. For each:
   - Push into `trialItems` via `setTrialItems(prev => [...prev, item])` (existing pattern).
   - Fire `runTryOn({ deviceToken, sessionId, sareeId })`. Existing `.catch(handleTryOnError)` handles `NO_BODY_SCAN:` → `consent` redirect.
5. After the loop: update localStorage to `autoTrialDone: true`.
6. `markCodeUsed({ code, storeId })` (unchanged).
7. `navigate("home")` — always. Never `trialRoom` from this path. (Replaces today's `navigate(hasResolvedItems ? "trialRoom" : "home")`.)

**Note:** The current code calls `addTrialCartItem` for each item. With Section 3 removing that mutation entirely, those calls go away.

### HomeScreen render

[`app/kiosk/page.tsx`](../../app/kiosk/page.tsx) `HomeScreen` component (~line 1927):

- New prop: `shortlistedItems: SareeItem[]`.
- New `<ScrollSection title="Shortlisted">` rendered **above** the existing `<ScrollSection title="Trending Now">` (~line 2207).
- Section is gated on `shortlistedItems.length > 0` (so phoneAuth path, where shortlistedItems is always empty, never renders it).
- Same `SareeCard` component as Trending — chip state for in-trial / in-wardrobe works for free; tap → existing `onProductTap` → ProductDetail flow → existing `onAddToTrial` flow.
- Section is **static** for the session (matches Trending behavior). Items don't disappear from the rail when added to trial — the in-trial chip indicates state.

### Source gating ("only via store code")

Implicit, not explicit. `shortlistedItems` is only ever populated from the codeEntry handler. The phoneAuth/newCustomer/idle paths never touch it. So:

- `shortlistedItems.length === 0` on phoneAuth path → Shortlisted rail doesn't render.
- No new `entrySource` enum or branching logic.

### Hydration on mount

Existing kiosk hydration effect (which currently restores `customerId`/`sessionId` from `wearify_kiosk_session` and merges trial cart + wardrobe) gains a branch:

```ts
// Pseudocode — restore shortlistedItems from localStorage
const raw = localStorage.getItem("wearify_kiosk_shortlisted");
if (raw && allSarees) {
  const data = JSON.parse(raw);
  if (data.sessionId === sessionId) {
    const sareeMap = new Map(allSarees.map(s => [s._id, s]));
    const resolved = data.sareeIds
      .map((id: Id<"sarees">) => sareeMap.get(id))
      .filter(Boolean) as SareeItem[];
    setShortlistedItems(resolved);
  }
}
```

If `sessionId` mismatch (stale entry from previous customer's pairing), do nothing. The next codeEntry pairing will overwrite the localStorage key with the new sessionId.

`autoTrialDone` is read on hydration to prevent re-firing the first-2 auto-trial when the page reloads mid-session.

---

## Section 3 — Trial room non-persistence (remove `kioskTrialCart`)

### Schema

[`convex/schema.ts`](../../convex/schema.ts):

- Delete the `kioskTrialCart` table definition entirely (currently `{ customerId, storeId, sareeId, addedAt }` + indexes `by_customer_store`, `by_customer_store_saree`).

### Convex functions

[`convex/sessionOps.ts`](../../convex/sessionOps.ts) — delete:

- `addTrialCartItem` mutation
- `removeTrialCartItem` mutation
- `clearTrialCart` mutation
- `listTrialCart` query

### Kiosk call-sites

[`app/kiosk/page.tsx`](../../app/kiosk/page.tsx) — remove all calls to:

- `addTrialCartItem` — fired in `onSendToTrial` (home grid multi-select), `onAddToTrial` (product detail), `codeEntry` (shortlist load), and reconciliation paths.
- `removeTrialCartItem` — fired in `onRemoveItem` (trial room) and `onAddToWardrobe` (move trial → wardrobe).
- `listTrialCart` — read in the hydration effect; remove the query and the merge branch into `trialItems`.

### Wardrobe untouched

`addToWardrobe` / `listWardrobeByCustomer` / wardrobe hydration remain. The "saved for later" semantics still persist per `(customer, store)`.

### Existing data in deployed DB

Existing `kioskTrialCart` rows remain orphaned after the schema-side table removal. Convex will let them sit until manually purged. This is acceptable — they're harmless, and the dev/prod environments can each be cleaned up via a one-shot `internalMutation` after the change lands if desired (out of scope for this design).

---

## Section 4 — Logout clears both trial and shortlisted

### `handleWipe` (existing — runs after every logout via FeedbackScreen submit)

Today ([app/kiosk/page.tsx](../../app/kiosk/page.tsx) ~line 492): clears all React state including `trialItems`, `wardrobeItems`, `cartItems`; removes `localStorage.wearify_kiosk_session`.

**Add:**

- `setShortlistedItems([])`
- `localStorage.removeItem("wearify_kiosk_shortlisted")`

After Section 3, `setTrialItems([])` is sufficient to fully empty the trial room (no server rows to clear).

### `DataSaveScreen.onDelete` (the "Delete data" button)

Existing in-state clears (`setWardrobeItems([])`, `setTrialItems([])`, `setCartItems([])`) stay as-is. They run before navigating to FeedbackScreen, so the customer sees an empty trial state during feedback. handleWipe runs after feedback submit and finishes the cleanup including shortlist.

No additional logic for `shortlistedItems` here — handleWipe handles it.

### Out of scope: server-side wardrobe rows on Delete

Today, "Delete data" zeros React wardrobe state but does NOT delete the customer's `wardrobe` table rows. Pre-existing gap, separate from this design.

---

## Section 5 — Edge cases & failure modes

### Body-scan failure on auto-trial-first-2

`runTryOn` for the first 2 may throw `NO_BODY_SCAN:`. Existing `.catch(handleTryOnError)` redirects to `consent` → `bodyScan`. After scan completes, the **existing reconciliation effect** (keyed on `bodyScanInfo?.hasFileId`) walks `trialItems` and re-fires `runTryOn` for any item missing a lookId. Both queued items are already in `trialItems` (set optimistically), so they get processed. ✅ No new logic.

### Race with reconciliation effect

The reconciliation effect fires `runTryOn` for `trialItems` entries without a lookId. The auto-trial code-path also fires `runTryOn` synchronously. Server-side dedup at `_findExistingLook` ([convex/tryOn.ts:561-578](../../convex/tryOn.ts#L561)) catches duplicates. Worst case: one extra ~₹3 RunPod call, accepted by the existing tryOn spec.

### Empty shortlist on validate

If `mirrorItems.length === 0` (staff sent code without items somehow): `setShortlistedItems([])`, no auto-trial, navigate to home, Shortlisted rail doesn't render (`> 0` gate). Code is consumed regardless. Tablet UI today disables "Send All" when shortlist is empty, so this is mostly defensive.

### Saree deleted between tablet-add and kiosk-pair

`sareeMap.get(sareeId)` returns undefined → `filter(Boolean)` drops it. Shortlist may end up with fewer than 10 visible items but no crash. Auto-trial takes first 2 of what survived. If 0 or 1 items survive, auto-trial fires for whatever's left.

### Refresh mid-session (kiosk page reload after pairing)

- `wearify_kiosk_session` restores customerId/sessionId/storeId.
- Hydration effect reads `wearify_kiosk_shortlisted`; sessionId matches → restore `shortlistedItems`. `autoTrialDone: true` flag prevents re-firing the first-2 auto-trial.
- `trialItems` is React-state only (Section 3 removed persistence), so a refresh **does** lose in-progress trial items. Acceptable trade-off per Amendment A.

### Customer adds shortlisted item to trial via tap

Static section. `SareeCard` shows in-trial chip via `isInTrial(s._id)`. Item stays visible in the Shortlisted rail. ✅ Existing card behavior.

### Tablet 10-cap concurrent race

Server check is the source of truth. Two staff devices on the same session inserting concurrently could briefly produce 11 rows (ToCToU). Acceptable — not a typical workflow.

### New customer (no `customer` row from `validateCode`)

`data.customer` undefined → `customerId` stays null → no customer-keyed mutations. `runTryOn` still fires (uses `deviceToken` + `sessionId`). Shortlisted rail still renders. ✅ Existing pattern.

### Stale localStorage from previous customer

Customer A pairs → handleWipe deletes `wearify_kiosk_shortlisted` on logout. So stale data should be impossible by design.

If somehow stale (e.g., handleWipe didn't run due to crash), the next customer's codeEntry creates a new sessionId and overwrites the localStorage entry. Hydration's sessionId-match check rejects mismatched data. ✅ Defense in depth.

---

## Files changed

### Backend

- [`convex/schema.ts`](../../convex/schema.ts) — remove `kioskTrialCart` table definition.
- [`convex/sessionOps.ts`](../../convex/sessionOps.ts) — add 10-cap to `addToShortlist`; delete `addTrialCartItem`, `removeTrialCartItem`, `clearTrialCart`, `listTrialCart`.

### Tablet

- [`app/tablet/catalogue/page.tsx`](../../app/tablet/catalogue/page.tsx) — gate add button on `length >= 10`; surface `SHORTLIST_FULL:` errors.
- [`app/tablet/catalogue/[id]/page.tsx`](../../app/tablet/catalogue/[id]/page.tsx) — same.
- [`app/tablet/shortlist/page.tsx`](../../app/tablet/shortlist/page.tsx) — header subtitle "(max 10)" + "{n}/10" stat.

### Kiosk

- [`app/kiosk/page.tsx`](../../app/kiosk/page.tsx):
  - New state: `shortlistedItems` + localStorage helpers.
  - Rewrite `codeEntry.onValidCode`: sort by `addedAt` asc, set `shortlistedItems`, auto-trial first 2, navigate to `home`.
  - `HomeScreen`: new `shortlistedItems` prop; new `<ScrollSection title="Shortlisted">` above Trending.
  - Hydration effect: restore `shortlistedItems` from localStorage on mount, sessionId-match gate.
  - `handleWipe`: also clear `shortlistedItems` + remove `wearify_kiosk_shortlisted`.
  - Remove all `addTrialCartItem` / `removeTrialCartItem` / `listTrialCart` call sites.

---

## Out of scope

- Migration of existing `kioskTrialCart` rows in deployed dev/prod Convex DB. Orphaned rows are harmless; an `internalMutation` purge can be added separately if needed.
- Server-side `wardrobe` row deletion on "Delete data" — pre-existing gap.
- Live reactive subscription to shortlist on the kiosk (Approach B from brainstorming) — single-use codes make it unnecessary.
- Ordering policy for "first 2" beyond `addedAt` ascending — staff curator intent assumed.
- Visual differentiation of the Shortlisted rail vs Trending — uses identical `ScrollSection` styling per "like trending section" directive.
