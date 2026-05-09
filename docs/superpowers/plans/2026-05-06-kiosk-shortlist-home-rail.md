# Kiosk Shortlist Home Rail + Trial-Room Non-Persistence — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [`docs/superpowers/specs/2026-05-06-kiosk-shortlist-home-rail-design.md`](../specs/2026-05-06-kiosk-shortlist-home-rail-design.md)

**Goal:** Tablet shortlists cap at 10; kiosk codeEntry path lands on home with a new "Shortlisted" rail above Trending, auto-trialing only the first 2 (oldest by `addedAt`); `kioskTrialCart` deleted entirely so trial items live only in React state for the session.

**Architecture:** Pass-through React state on the kiosk for the shortlist, persisted across refresh via `localStorage.wearify_kiosk_shortlisted` (sessionId-keyed). `addToShortlist` server-side cap. Schema-side delete of `kioskTrialCart` table + four mutations + every kiosk call-site in one atomic commit.

**Tech Stack:** Convex (backend, schema), React 19 (kiosk + tablet UIs), TypeScript (strict). Verification: `pnpm run type-check` clean per task + manual smoke tests. No unit-test infra exists in this codebase — match the project's existing verification convention.

---

## File Structure

**Backend changes:**
- [`convex/schema.ts`](../../../convex/schema.ts) — remove `kioskTrialCart` table.
- [`convex/sessionOps.ts`](../../../convex/sessionOps.ts) — add 10-cap to `addToShortlist`; delete 4 trial-cart mutations.

**Tablet changes:**
- [`app/tablet/catalogue/page.tsx`](../../../app/tablet/catalogue/page.tsx) — gate add-button at cap; surface `SHORTLIST_FULL:`.
- [`app/tablet/catalogue/[id]/page.tsx`](../../../app/tablet/catalogue/[id]/page.tsx) — same.
- [`app/tablet/shortlist/page.tsx`](../../../app/tablet/shortlist/page.tsx) — header subtitle + `n/10` stat.

**Kiosk changes:**
- [`app/kiosk/page.tsx`](../../../app/kiosk/page.tsx) — new `shortlistedItems` state + localStorage helpers; `codeEntry.onValidCode` rewrite; `HomeScreen` Shortlisted rail; hydration restore; `handleWipe` cleanup; remove all `addTrialCartItem`/`removeTrialCartItem`/`listTrialCart` call-sites.

---

## Task ordering rationale

1. **Server-side cap first** (Task 1) — atomic, isolated; zero risk to existing flows.
2. **Tablet UI cap** (Task 2) — depends on the server error message; pairs naturally.
3. **Remove `kioskTrialCart` atomically** (Task 3) — schema + mutations + every kiosk call-site in ONE commit. Splitting would leave the build broken between commits.
4. **Kiosk shortlist state plumbing** (Task 4) — adds state + localStorage helpers; no behavior change yet.
5. **Kiosk codeEntry rewrite** (Task 5) — flips the data flow; lands on home; auto-trials first 2.
6. **HomeScreen Shortlisted rail** (Task 6) — visible UI for the data Tasks 4-5 set up.
7. **Hydration on refresh** (Task 7) — closes the page-reload gap.
8. **handleWipe cleanup** (Task 8) — final logout-clears-shortlist wiring.

---

## Task 1: Server-side shortlist 10-cap

**Files:**
- Modify: [`convex/sessionOps.ts`](../../../convex/sessionOps.ts) — `addToShortlist` mutation (~line 445)

- [ ] **Step 1: Read current `addToShortlist`** to confirm shape

Run: `sed -n '440,465p' convex/sessionOps.ts`
Expected: shows `addToShortlist` mutation with no length check.

- [ ] **Step 2: Add the cap check inside the handler**

Edit [`convex/sessionOps.ts`](../../../convex/sessionOps.ts) `addToShortlist` handler. Insert before the `ctx.db.insert("shortlist", ...)` call:

```typescript
// Max 10 items per session — server is the source of truth.
const existing = await ctx.db
  .query("shortlist")
  .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
  .take(11);
if (existing.length >= 10) {
  throw new Error("SHORTLIST_FULL: Shortlist is full (max 10 items)");
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm run type-check`
Expected: clean (no new errors).

- [ ] **Step 4: Convex deploy / dev refresh**

Run: `npx convex dev --once`
Expected: deploys without error.

- [ ] **Step 5: Commit**

```bash
git add convex/sessionOps.ts
git commit -m "feat(tablet): cap shortlist at 10 items per session

Adds server-side guard in addToShortlist; throws SHORTLIST_FULL: when
the session already has >= 10 entries.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Tablet UI 10-cap gating + `SHORTLIST_FULL:` handling

**Files:**
- Modify: [`app/tablet/catalogue/page.tsx`](../../../app/tablet/catalogue/page.tsx) — `handleAddToShortlist`
- Modify: [`app/tablet/catalogue/[id]/page.tsx`](../../../app/tablet/catalogue/[id]/page.tsx) — same handler
- Modify: [`app/tablet/shortlist/page.tsx`](../../../app/tablet/shortlist/page.tsx) — header subtitle + stat card

- [ ] **Step 1: Read tablet/catalogue/page.tsx handleAddToShortlist**

Run: `sed -n '110,130p' app/tablet/catalogue/page.tsx`
Expected: shows `handleAddToShortlist` swallowing errors via `catch {}`.

- [ ] **Step 2: Add cap-aware gate + error surface**

Replace `handleAddToShortlist` in [`app/tablet/catalogue/page.tsx`](../../../app/tablet/catalogue/page.tsx) with:

```typescript
const handleAddToShortlist = async (sareeId: Id<"sarees">) => {
  if (!sessionId || !storeId) return;
  if ((shortlistItems?.length ?? 0) >= 10) {
    alert("Shortlist full — remove an item to add more (max 10).");
    return;
  }
  try {
    await addToShortlist({
      sessionId,
      sareeId,
      storeId,
      ...(customerId ? { customerId } : {}),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.startsWith("SHORTLIST_FULL:")) {
      alert("Shortlist full — remove an item to add more (max 10).");
    }
    // else: already-added or other; silent like before
  }
};
```

- [ ] **Step 3: Same change in product-detail page**

Read [`app/tablet/catalogue/[id]/page.tsx`](../../../app/tablet/catalogue/[id]/page.tsx) lines 60-80 to find the `addToShortlist` call. Both call sites at lines 63 and 73 need the same wrap. Replace both with the same try/catch + cap-aware pattern. If the page doesn't have access to `shortlistItems` to check length client-side, just rely on the server error catch:

```typescript
try {
  await addToShortlist({ sessionId, sareeId, storeId });
} catch (err) {
  const msg = err instanceof Error ? err.message : "";
  if (msg.startsWith("SHORTLIST_FULL:")) {
    alert("Shortlist full — remove an item to add more (max 10).");
  }
}
```

- [ ] **Step 4: Update tablet/shortlist/page.tsx header**

In [`app/tablet/shortlist/page.tsx`](../../../app/tablet/shortlist/page.tsx) at line ~170, change:

```tsx
<p className="text-sm text-wf-subtext">
  {totalCount} {totalCount === 1 ? "item" : "items"} shortlisted &middot; {sentCount} sent to mirror
</p>
```

to:

```tsx
<p className="text-sm text-wf-subtext">
  {totalCount}/10 {totalCount === 1 ? "item" : "items"} shortlisted &middot; {sentCount} sent to mirror
</p>
```

And change the "Items Shortlisted" stat card (~line 197):

```tsx
<div className="text-2xl font-extrabold text-wf-text font-mono">{totalCount}</div>
```

to:

```tsx
<div className="text-2xl font-extrabold text-wf-text font-mono">{totalCount}/10</div>
```

- [ ] **Step 5: Type-check**

Run: `pnpm run type-check`
Expected: clean.

- [ ] **Step 6: Smoke test**

Manual: open `/tablet`, start a session, add 10 sarees to shortlist (one at a time from catalogue), then attempt an 11th. Expected: alert "Shortlist full — remove an item to add more (max 10)." `/tablet/shortlist` header shows `10/10 items shortlisted`.

- [ ] **Step 7: Commit**

```bash
git add app/tablet/catalogue/page.tsx app/tablet/catalogue/[id]/page.tsx app/tablet/shortlist/page.tsx
git commit -m "feat(tablet): UI cap of 10 on shortlist + show n/10

Client-side gate + SHORTLIST_FULL: error surface; shortlist page header
shows current count out of 10.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Remove `kioskTrialCart` entirely (atomic)

This task removes the table, the four mutations, AND every kiosk call-site in one commit. Splitting would leave the build broken.

**Files:**
- Modify: [`convex/schema.ts`](../../../convex/schema.ts) — drop `kioskTrialCart` table block
- Modify: [`convex/sessionOps.ts`](../../../convex/sessionOps.ts) — delete 4 mutations
- Modify: [`app/kiosk/page.tsx`](../../../app/kiosk/page.tsx) — remove all call sites + hydration branch

- [ ] **Step 1: Find every kioskTrialCart reference in the kiosk file**

Run: `grep -n "addTrialCartItem\|removeTrialCartItem\|clearTrialCart\|listTrialCart\|kioskTrialCart\|savedTrialCart" app/kiosk/page.tsx`
Expected: ~10-15 hits — useMutation declarations, call sites in onSendToTrial / onAddToTrial / codeEntry / onRemoveItem / onAddToWardrobe, the hydration query + merge branch.

- [ ] **Step 2: Find every reference in sessionOps.ts**

Run: `grep -n "addTrialCartItem\|removeTrialCartItem\|clearTrialCart\|listTrialCart\|kioskTrialCart" convex/sessionOps.ts`
Expected: 4 mutation/query exports + maybe table-name references in queries.

- [ ] **Step 3: Find any other references repo-wide**

Run: `grep -rn "addTrialCartItem\|removeTrialCartItem\|clearTrialCart\|listTrialCart\|kioskTrialCart" --include="*.ts" --include="*.tsx" -- .`
Expected: only `convex/sessionOps.ts`, `app/kiosk/page.tsx`, and `convex/_generated/*` (auto-regenerated). Confirm no surprise call-sites in the customer PWA, store admin, or seed.

- [ ] **Step 4: Remove the table from schema**

In [`convex/schema.ts`](../../../convex/schema.ts) delete the entire `kioskTrialCart: defineTable(...)` block including its indexes. (Search for `kioskTrialCart` to find it.)

- [ ] **Step 5: Delete the 4 mutations from sessionOps.ts**

In [`convex/sessionOps.ts`](../../../convex/sessionOps.ts) delete:
- `addTrialCartItem` mutation export
- `removeTrialCartItem` mutation export
- `clearTrialCart` mutation export (if exists)
- `listTrialCart` query export

Delete the section comment header that introduces them (e.g. `// KIOSK TRIAL CART`) if it now bookends nothing.

- [ ] **Step 6: Remove all call-sites from app/kiosk/page.tsx**

Edit [`app/kiosk/page.tsx`](../../../app/kiosk/page.tsx). Remove:
- The `useMutation(api.sessionOps.addTrialCartItem)` declaration
- The `useMutation(api.sessionOps.removeTrialCartItem)` declaration
- The `useMutation(api.sessionOps.clearTrialCart)` declaration if present
- The `useQuery(api.sessionOps.listTrialCart, ...)` query line and its `savedTrialCart` variable
- Every call to `addTrialCartItem({...})` — found in `onSendToTrial`, `onAddToTrial`, `codeEntry.onValidCode`, possibly product detail
- Every call to `removeTrialCartItem({...})` — found in `onRemoveItem`, `onAddToWardrobe` (the move-to-wardrobe path)
- The hydration effect's `if (savedTrialCart && ...)` branch that merged trial-cart rows into `trialItems`

The hydration effect should still run for wardrobe (`savedWardrobe`); only the trial-cart branch is removed.

- [ ] **Step 7: Type-check**

Run: `pnpm run type-check`
Expected: clean. Any references missed in step 6 will surface here.

- [ ] **Step 8: Convex schema deploy**

Run: `npx convex dev --once`
Expected: deploys; Convex acknowledges the table removal. (Existing rows persist orphaned in the deployed DB — acceptable per spec §"Out of scope".)

- [ ] **Step 9: Smoke test (the "before" baseline for non-persistence)**

Manual: kiosk login (via store code OR phoneAuth), add a saree to trial via "Send to Trial Room", logout. Login again as the same customer. Expected: trial room is **empty** (was previously populated from `kioskTrialCart`). Wardrobe still persists.

- [ ] **Step 10: Commit**

```bash
git add convex/schema.ts convex/sessionOps.ts app/kiosk/page.tsx
git commit -m "refactor(kiosk): drop kioskTrialCart — trial items session-only

Removes the kioskTrialCart table + addTrialCartItem/removeTrialCartItem/
clearTrialCart/listTrialCart mutations and every kiosk call-site. Trial
items now live only in React state for the duration of the session;
logout empties the trial room. Wardrobe persistence unchanged. Existing
deployed rows stay orphaned (out of scope per spec).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Kiosk shortlistedItems state + localStorage helpers

**Files:**
- Modify: [`app/kiosk/page.tsx`](../../../app/kiosk/page.tsx) — new state + helpers near the top of the component

- [ ] **Step 1: Add the state declaration**

In [`app/kiosk/page.tsx`](../../../app/kiosk/page.tsx) near the existing `useState` block (after `setTrialItems`, before `setWardrobeItems` is fine), add:

```typescript
const [shortlistedItems, setShortlistedItems] = useState<SareeItem[]>([]);
```

- [ ] **Step 2: Add localStorage read/write helpers**

Near the existing `persistKioskSession` helper, add a new helper block. The existing helper is in a `useCallback` that reads/writes `wearify_kiosk_session`. Mirror that:

```typescript
type KioskShortlistedRecord = {
  sessionId: string;
  sareeIds: Id<"sarees">[];
  autoTrialDone: boolean;
};

const persistShortlisted = useCallback(
  (record: KioskShortlistedRecord) => {
    try {
      localStorage.setItem("wearify_kiosk_shortlisted", JSON.stringify(record));
    } catch {
      /* ignore quota errors */
    }
  },
  [],
);

const readShortlistedRecord = useCallback((): KioskShortlistedRecord | null => {
  try {
    const raw = localStorage.getItem("wearify_kiosk_shortlisted");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KioskShortlistedRecord;
    if (typeof parsed.sessionId !== "string") return null;
    if (!Array.isArray(parsed.sareeIds)) return null;
    return parsed;
  } catch {
    return null;
  }
}, []);
```

- [ ] **Step 3: Type-check**

Run: `pnpm run type-check`
Expected: clean. The new state and helpers compile but are unused — that's fine.

- [ ] **Step 4: Commit**

```bash
git add app/kiosk/page.tsx
git commit -m "feat(kiosk): add shortlistedItems state + localStorage helpers

Plumbing only — no behavior change. State + persist/read helpers for
the next task to wire into codeEntry and HomeScreen.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Kiosk `codeEntry.onValidCode` rewrite — Shortlisted state + auto-trial first 2

**Files:**
- Modify: [`app/kiosk/page.tsx`](../../../app/kiosk/page.tsx) — `case "codeEntry":` block (~line 730-801)

- [ ] **Step 1: Read the current onValidCode block**

Run: `sed -n '730,810p' app/kiosk/page.tsx`
Expected: shows the current `setTrialItems(resolved)` + per-item `runTryOn` loop + `navigate(hasResolvedItems ? "trialRoom" : "home")`.

- [ ] **Step 2: Replace the mirror-items resolution + auto-trial block**

Within the `onValidCode` handler, replace the existing block that starts with `// Resolve shortlist items to full saree data` and ends just before `markCodeUsed` with the new logic.

The new block should:
1. Sort `data.mirrorItems` by `addedAt` ascending.
2. Resolve all to `SareeItem[]` via `sareeMap`, drop unresolved.
3. `setShortlistedItems(resolved)` and `persistShortlisted({ sessionId: data.trialRoom.sessionId, sareeIds: resolved.map(s => s._id), autoTrialDone: false })`.
4. Take first 2 → `setTrialItems(prev => [...prev, ...firstTwo])` (de-duped) and fire `runTryOn` for each with the existing `.catch(handleTryOnError)` shape that redirects to `consent` on `NO_BODY_SCAN:`.
5. Persist `autoTrialDone: true` after the loop.

Concretely:

```typescript
// Resolve shortlist items to full saree data, sorted by addedAt asc
// (oldest first — staff usually queues priority items first).
let resolved: SareeItem[] = [];
if (data.mirrorItems && allSarees) {
  const sareeMap = new Map(allSarees.map((s) => [s._id, s]));
  const sortedMirror = [...data.mirrorItems].sort(
    (a: { addedAt?: number }, b: { addedAt?: number }) =>
      (a.addedAt ?? 0) - (b.addedAt ?? 0),
  );
  resolved = sortedMirror
    .map((item: { sareeId: Id<"sarees"> }) => sareeMap.get(item.sareeId))
    .filter(Boolean) as SareeItem[];
}
setShortlistedItems(resolved);
persistShortlisted({
  sessionId: data.trialRoom.sessionId,
  sareeIds: resolved.map((s) => s._id),
  autoTrialDone: false,
});

// Auto-trial first 2 (oldest by addedAt). Remaining items sit in
// the Shortlisted home rail until customer self-adds them.
const firstTwo = resolved.slice(0, 2);
if (firstTwo.length > 0) {
  setTrialItems((prev) => {
    const existingIds = new Set(prev.map((s) => s._id));
    const merged = [...prev];
    for (const item of firstTwo) {
      if (!existingIds.has(item._id)) merged.push(item);
    }
    return merged;
  });
  for (const item of firstTwo) {
    runTryOn({
      deviceToken: deviceToken!,
      sessionId: data.trialRoom.sessionId,
      sareeId: item._id,
    })
      .then((res) => {
        setSareeLookIds((prev) => ({ ...prev, [item._id]: res.lookId }));
      })
      .catch((err: Error) => {
        // NO_BODY_SCAN: → consent → bodyScan; reconciliation effect
        // re-fires runTryOn for queued items once scan is recorded.
        handleTryOnError(err, showToast, () => navigate("consent"));
      });
  }
}
persistShortlisted({
  sessionId: data.trialRoom.sessionId,
  sareeIds: resolved.map((s) => s._id),
  autoTrialDone: true,
});

// Mark code as used
markCodeUsed({ code: data.trialRoom.code, storeId });

// Always land on home — Shortlisted rail will render the curated
// items above Trending Now. Body scan triggers lazily via the
// NO_BODY_SCAN: catch above if needed.
navigate("home");
```

Drop the `hasResolvedItems` variable and the conditional `navigate(hasResolvedItems ? "trialRoom" : "home")` — replace with `navigate("home")`.

- [ ] **Step 3: Type-check**

Run: `pnpm run type-check`
Expected: clean.

- [ ] **Step 4: Smoke test (data-only — UI rail comes in Task 6)**

Manual: shortlist 5 sarees on tablet, send all to mirror, enter code at kiosk. Open React DevTools → kiosk component → verify `shortlistedItems` state has 5 items, `trialItems` has the first 2. Lands on home (currently no Shortlisted rail visible — that's Task 6). Trial-count icon in header shows 2.

- [ ] **Step 5: Commit**

```bash
git add app/kiosk/page.tsx
git commit -m "feat(kiosk): codeEntry sets shortlistedItems, auto-trials first 2

Replaces the bulk dump-into-trialRoom behavior with: full sorted-by-
addedAt list goes into shortlistedItems state, only the first 2
auto-fire runTryOn and join trialItems, kiosk always navigates to
home. The Shortlisted home rail itself is added in the next task.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: HomeScreen Shortlisted rail (UI)

**Files:**
- Modify: [`app/kiosk/page.tsx`](../../../app/kiosk/page.tsx) — `HomeScreen` component (~line 1927) + its call-site in the case-`"home"` block (~line 954)

- [ ] **Step 1: Add the prop to HomeScreen signature**

Find the `HomeScreen` declaration (search for `function HomeScreen({`). Add `shortlistedItems` to the destructured prop list and to the type literal:

```typescript
function HomeScreen({
  sarees, trialItems, wardrobeItems, onProductTap, onSendToTrial,
  navigate, goHome, triggerLogout, trialCount, wardrobeCount, cartCount,
  maxTrial, showToast, storeName, storeLogoFileId,
  shortlistedItems,
}: {
  // ...existing props...
  shortlistedItems: SareeItem[];
})
```

- [ ] **Step 2: Render the Shortlisted rail above Trending**

In `HomeScreen` find the existing `<ScrollSection title="Trending Now">` (~line 2207). Add a new `<ScrollSection>` immediately before it, gated on `shortlistedItems.length > 0`:

```tsx
{shortlistedItems.length > 0 && (
  <ScrollSection title="Shortlisted">
    {shortlistedItems.map((s) => (
      <SareeCard
        key={s._id}
        saree={s}
        onTap={() => onProductTap(s)}
        onCheck={() => toggleSelect(s)}
        isSelected={selectedIds.has(s._id)}
        isInTrial={isInTrial(s._id)}
        isInWardrobe={isInWardrobe(s._id)}
      />
    ))}
  </ScrollSection>
)}
```

This must appear **before** `<ScrollSection title="Trending Now">` and only render when the filtered-grid path isn't active (it's inside the same `else` branch as Trending — verify by reading lines around 2206 to confirm the surrounding structure).

- [ ] **Step 3: Pass the prop from the parent's home case**

Find the case `"home"` block (~line 954) where `<HomeScreen ... />` is rendered. Add `shortlistedItems={shortlistedItems}` to the JSX prop list.

- [ ] **Step 4: Type-check**

Run: `pnpm run type-check`
Expected: clean. If the `SareeCard` props don't include `isSelected`, etc., they should — those props are used identically by the Trending rail above.

- [ ] **Step 5: Smoke test**

Manual: same flow as Task 5 (tablet shortlist 5 → code → kiosk). Now expected: kiosk home shows a "Shortlisted" rail above "Trending Now" with all 5 sarees. The first 2 cards have an "in trial" chip; the other 3 don't. Tapping any card opens the product detail screen as normal.

- [ ] **Step 6: Commit**

```bash
git add app/kiosk/page.tsx
git commit -m "feat(kiosk): render Shortlisted rail above Trending on home

New ScrollSection rendered when shortlistedItems is non-empty (i.e.
customer entered via tablet store code). Static like Trending — items
stay in the rail with in-trial chip after add.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Hydration restore on mount + refresh

**Files:**
- Modify: [`app/kiosk/page.tsx`](../../../app/kiosk/page.tsx) — extend the existing kiosk hydration `useEffect`

- [ ] **Step 1: Find the hydration effect**

Run: `grep -n "hydratedRef\|wearify_kiosk_session\|savedWardrobe" app/kiosk/page.tsx | head -20`
Expected: the hydration effect tied to `(customerId, storeId, allSarees)`.

- [ ] **Step 2: Add the shortlist hydration branch**

Inside the same effect, after the wardrobe merge branch, add:

```typescript
// Restore Shortlisted rail from localStorage if sessionId still matches.
// autoTrialDone flag prevents re-firing the first-2 auto-trial on a
// mid-session page refresh.
const shortlistedRecord = readShortlistedRecord();
if (
  shortlistedRecord &&
  shortlistedRecord.sessionId === sessionId &&
  shortlistedItems.length === 0
) {
  const sareeMap = new Map(allSarees.map((s) => [s._id, s]));
  const restored = shortlistedRecord.sareeIds
    .map((id) => sareeMap.get(id))
    .filter(Boolean) as SareeItem[];
  if (restored.length > 0) {
    setShortlistedItems(restored);
  }
}
```

The `shortlistedItems.length === 0` guard prevents re-applying the localStorage state on top of fresh state (e.g. when the codeEntry handler has just set it directly — that path doesn't go through localStorage hydration).

- [ ] **Step 3: Add `readShortlistedRecord`, `sessionId`, `shortlistedItems.length` to the effect dep array**

Locate the effect's dep array. Add the three names. The effect already depends on `customerId`, `storeId`, `allSarees`, etc.

- [ ] **Step 4: Type-check**

Run: `pnpm run type-check`
Expected: clean.

- [ ] **Step 5: Smoke test**

Manual: pair via store code (5-saree shortlist). Wait until home renders with the Shortlisted rail. Hit browser refresh. Expected: kiosk re-hydrates session from `wearify_kiosk_session`, lands on home, Shortlisted rail still shows the 5 items. First 2 still in trial (auto-trial doesn't re-fire — `autoTrialDone: true`).

- [ ] **Step 6: Commit**

```bash
git add app/kiosk/page.tsx
git commit -m "feat(kiosk): hydrate Shortlisted rail from localStorage on refresh

Existing wearify_kiosk_session retention restored sessionId across
refresh; this extends the same hydration effect to also restore
shortlistedItems from wearify_kiosk_shortlisted when sessionId
matches. autoTrialDone flag (set in Task 5) prevents re-firing the
first-2 auto-trial.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: handleWipe clears Shortlisted state + localStorage

**Files:**
- Modify: [`app/kiosk/page.tsx`](../../../app/kiosk/page.tsx) — `handleWipe` callback (~line 492)

- [ ] **Step 1: Read current handleWipe**

Run: `sed -n '492,520p' app/kiosk/page.tsx`
Expected: the callback that zeros all React state and removes `wearify_kiosk_session` from localStorage.

- [ ] **Step 2: Add shortlist cleanup**

Inside `handleWipe`, alongside the other `set*([])` calls, add:

```typescript
setShortlistedItems([]);
```

And alongside the existing `localStorage.removeItem("wearify_kiosk_session")`, add:

```typescript
try { localStorage.removeItem("wearify_kiosk_shortlisted"); } catch { /* ignore */ }
```

- [ ] **Step 3: Type-check**

Run: `pnpm run type-check`
Expected: clean.

- [ ] **Step 4: Smoke test the full lifecycle**

Manual end-to-end:
1. Tablet: shortlist 5 sarees → send to mirror → get code.
2. Kiosk: enter code → lands on home → Shortlisted rail visible with 5 items, 2 auto-in-trial.
3. Customer browses, adds 1 more from Shortlisted to trial.
4. Customer logs out (header logout button) → DataSaveScreen → tap "Save" → FeedbackScreen → submit feedback → returns to idle.
5. From idle, enter the same store again. Pair another customer (or the same). Expected: NO Shortlisted rail. Trial empty. Wardrobe still persisted (if seeded that way for the customer).
6. Same flow but tap "Delete" instead of "Save" on DataSaveScreen. Expected: identical end state — no Shortlisted, empty trial.

- [ ] **Step 5: Commit**

```bash
git add app/kiosk/page.tsx
git commit -m "feat(kiosk): handleWipe clears Shortlisted state + localStorage

Logout flow (Save or Delete on DataSaveScreen → FeedbackScreen submit
→ handleWipe) now also empties shortlistedItems and removes the
wearify_kiosk_shortlisted localStorage key. Final piece of the
trial+shortlist non-persistence guarantee.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage check:**

- ✅ §1 Tablet 10-cap: Tasks 1, 2.
- ✅ §2 Kiosk codeEntry rewrite + Shortlisted rail + auto-trial first 2: Tasks 4, 5, 6, 7.
- ✅ §3 Trial-room non-persistence: Task 3.
- ✅ §4 Logout clears trial + shortlisted: Task 3 (trial) + Task 8 (shortlisted).
- ✅ §5 Edge cases: covered by code paths in Tasks 5, 6, 7 (NO_BODY_SCAN catch in Task 5; static rail behavior in Task 6; sessionId match + autoTrialDone in Task 7).

**Placeholder scan:** No "TBD/TODO" / "appropriate error handling" / "similar to" references. Every step has the exact code or shell command.

**Type/name consistency:** `setShortlistedItems` / `shortlistedItems` consistent across Tasks 4-8. `persistShortlisted` / `readShortlistedRecord` consistent. `wearify_kiosk_shortlisted` localStorage key consistent. `KioskShortlistedRecord` type only declared in Task 4.

---

## Post-implementation (user-triggered)

After Task 8 commits, the user may run:

- `/review` (gstack) — multi-agent review of the branch.
- `/qa` (gstack) — browser-based QA against the staging URL.
- `/ship` (gstack) — open PR.

These are user-invoked slash commands; not part of the plan execution.
