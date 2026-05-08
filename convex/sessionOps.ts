import { query, mutation, internalMutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireKioskDeviceForStore } from "./kioskAuth";

// ============================================================
// STORE-LINK HELPERS
// Shared: keep customerStoreLinks in sync with real kiosk activity so
// /c/me/stores and /c/me/history never lie about whether a customer has
// been seen at a store. The link is created on the first look/wardrobe
// save and refreshed on session end with accurate totals.
// ============================================================

function todayInIndia(): string {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/**
 * Idempotent: creates a customerStoreLinks row if one does not already
 * exist, otherwise touches lastVisit. Does NOT bump visits — that only
 * happens on session end so a single visit never counts twice.
 */
async function ensureStoreLink(
  ctx: MutationCtx,
  customerId: Id<"customers">,
  storeId: string
) {
  const existing = await ctx.db
    .query("customerStoreLinks")
    .withIndex("by_customerId_and_storeId", (q) =>
      q.eq("customerId", customerId).eq("storeId", storeId)
    )
    .unique();
  const today = todayInIndia();
  if (existing) {
    if (existing.lastVisit !== today) {
      await ctx.db.patch(existing._id, { lastVisit: today });
    }
    return existing._id;
  }
  const store = await ctx.db
    .query("stores")
    .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
    .unique();
  return await ctx.db.insert("customerStoreLinks", {
    customerId,
    storeId,
    storeName: store?.name,
    visits: 0, // session-end bumps this — prevents double counting on partial sessions
    lastVisit: today,
    clv: 0,
    segment: "New",
  });
}

// ============================================================
// SESSIONS
// ============================================================

export const createSession = mutation({
  args: {
    storeId: v.string(),
    storeName: v.optional(v.string()),
    staffId: v.optional(v.id("staff")),
    staffName: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    mirrorId: v.optional(v.string()),
    tabletLinked: v.optional(v.boolean()),
    occasion: v.optional(v.string()),
    budget: v.optional(v.string()),
    // Optional: kiosk callers send their paired deviceToken and it is
    // verified against storeId. Absent = legacy/tablet path (tablet has no
    // device identity yet — flagged for a future auth pass).
    deviceToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let mirrorId = args.mirrorId;
    if (args.deviceToken) {
      const device = await requireKioskDeviceForStore(ctx, args.deviceToken, args.storeId);
      // Trust the device's own id over anything the client supplied.
      mirrorId = device.deviceId;
    }
    const sessionId = "SS-" + Date.now().toString();
    await ctx.db.insert("sessions", {
      sessionId,
      storeId: args.storeId,
      storeName: args.storeName,
      staffId: args.staffId,
      staffName: args.staffName,
      customerId: args.customerId,
      customerPhone: args.customerPhone,
      mirrorId,
      tabletLinked: args.tabletLinked,
      status: "active",
      startTime: Date.now(),
      occasion: args.occasion,
      budget: args.budget,
    });
    return sessionId;
  },
});

export const getSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    return session;
  },
});

export const listActiveSessions = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();
    return sessions.filter((s) => s.status === "active");
  },
});

// Find active session for a specific staff member in a store
// Used by kiosk to link to the tablet's session
export const getActiveSessionForStaff = query({
  args: { storeId: v.string(), staffId: v.id("staff") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_staffId", (q) => q.eq("staffId", args.staffId))
      .order("desc")
      .take(10);
    // Return the most recent active session for this staff in this store
    return sessions.find(
      (s) => s.status === "active" && s.storeId === args.storeId
    ) ?? null;
  },
});

export const listSessionsByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(100);
    return sessions;
  },
});

export const endSession = mutation({
  args: {
    sessionId: v.string(),
    deviceToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    if (!session) throw new Error("Session not found");
    if (args.deviceToken) {
      await requireKioskDeviceForStore(ctx, args.deviceToken, session.storeId);
    }

    // Idempotency: if this session was already completed, return the prior
    // totals instead of double-writing a visit record.
    if (session.status === "completed") {
      return { endTime: session.endTime ?? Date.now(), duration: session.duration ?? "0m 0s" };
    }

    const endTime = Date.now();
    const durationMs = endTime - session.startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const duration = `${minutes}m ${seconds}s`;

    await ctx.db.patch(session._id, {
      status: "completed",
      endTime,
      duration,
    });

    // Close the loop: write visit history + bump the store link so
    // /c/me/stores, /c/me/history, and the My Stores tile reflect reality.
    if (session.customerId) {
      const looks = await ctx.db
        .query("looks")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
        .collect();
      const sareesTried = session.sareesTriedOn ?? looks.length;

      // Detect purchase via orders table (filter customer's orders by sessionId)
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_customerId", (q) => q.eq("customerId", session.customerId))
        .collect();
      const sessionOrders = orders.filter((o) => o.sessionId === args.sessionId);
      const purchased = session.purchased ?? sessionOrders.length > 0;
      const spentInSession = sessionOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);

      const storeName =
        session.storeName ??
        (
          await ctx.db
            .query("stores")
            .withIndex("by_storeId", (q) => q.eq("storeId", session.storeId))
            .unique()
        )?.name;

      const pointsEarned = purchased ? 500 : 50;
      const date = todayInIndia();

      await ctx.db.insert("visitHistory", {
        customerId: session.customerId,
        storeId: session.storeId,
        storeName,
        sessionId: args.sessionId,
        date,
        sareesTried,
        purchased,
        staffName: session.staffName,
        pointsEarned,
      });

      // Bump the customerStoreLinks counters — create if the look-time
      // ensureStoreLink somehow missed (e.g. session with no looks saved).
      const link = await ctx.db
        .query("customerStoreLinks")
        .withIndex("by_customerId_and_storeId", (q) =>
          q.eq("customerId", session.customerId!).eq("storeId", session.storeId)
        )
        .unique();
      if (link) {
        const newVisits = (link.visits ?? 0) + 1;
        const newClv = (link.clv ?? 0) + spentInSession;
        await ctx.db.patch(link._id, {
          visits: newVisits,
          lastVisit: date,
          clv: newClv,
          // Promote 'New' to 'Regular' once they have any meaningful activity
          segment:
            link.segment === "New" && newVisits >= 2 ? "Regular" : link.segment,
        });
      } else {
        await ctx.db.insert("customerStoreLinks", {
          customerId: session.customerId,
          storeId: session.storeId,
          storeName,
          visits: 1,
          lastVisit: date,
          clv: spentInSession,
          segment: "New",
        });
      }
    }

    return { endTime, duration };
  },
});

export const updateSession = mutation({
  args: {
    sessionId: v.string(),
    occasion: v.optional(v.string()),
    budget: v.optional(v.string()),
    visitNote: v.optional(v.string()),
    rating: v.optional(v.number()),
    ratingComment: v.optional(v.string()),
    sareesTriedOn: v.optional(v.number()),
    sareesBrowsed: v.optional(v.number()),
    purchased: v.optional(v.boolean()),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    staffId: v.optional(v.id("staff")),
    staffName: v.optional(v.string()),
    mirrorId: v.optional(v.string()),
    tabletLinked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    if (!session) throw new Error("Session not found");

    const { sessionId: _sid, ...updates } = args;
    // Remove undefined values so patch only updates provided fields
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(session._id, patch);
    }
    return session._id;
  },
});

// ============================================================
// LOOKS
// ============================================================

export const createLook = mutation({
  args: {
    sessionId: v.optional(v.string()),
    storeId: v.string(),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    sareeId: v.id("sarees"),
    sareeName: v.string(),
    fabric: v.optional(v.string()),
    price: v.optional(v.number()),
    drapeStyle: v.optional(v.string()),
    accessories: v.optional(v.array(v.string())),
    neckline: v.optional(v.string()),
    isFav: v.optional(v.boolean()),
    isWished: v.optional(v.boolean()),
    imageFileId: v.optional(v.id("_storage")),
    grad: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Idempotency: one look per (customer, session, saree). Re-adds in the
    // same session don't create duplicate entries in /c/looks.
    if (args.customerId && args.sessionId) {
      const existing = await ctx.db
        .query("looks")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
        .filter((q) =>
          q.and(
            q.eq(q.field("customerId"), args.customerId),
            q.eq(q.field("sareeId"), args.sareeId),
          ),
        )
        .first();
      if (existing) return existing._id;
    }
    const id = await ctx.db.insert("looks", {
      sessionId: args.sessionId,
      storeId: args.storeId,
      customerId: args.customerId,
      customerPhone: args.customerPhone,
      sareeId: args.sareeId,
      sareeName: args.sareeName,
      fabric: args.fabric,
      price: args.price,
      drapeStyle: args.drapeStyle,
      accessories: args.accessories,
      neckline: args.neckline,
      isFav: args.isFav ?? false,
      isWished: args.isWished ?? false,
      imageFileId: args.imageFileId,
      grad: args.grad,
      createdAt: Date.now(),
    });
    if (args.customerId) {
      await ensureStoreLink(ctx, args.customerId, args.storeId);
    }
    return id;
  },
});

export const listByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const looks = await ctx.db
      .query("looks")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .take(200);
    // Only surface completed AI try-ons. queued / processing / failed /
    // abandoned looks would otherwise fall back to the saree's model
    // catalog photo (no imageFileId yet) and surface as "look" cards
    // with a model-wearing-saree image — confusing the customer into
    // thinking that's their try-on render. Filter them out at source.
    const completed = looks.filter((l) => l.status === "completed");
    // Enrich with saree fallback. Prefer slot 3 (flat-lay, no model)
    // over slot 0 (model shot) — defense in depth in case a completed
    // look somehow lacks imageFileId.
    return await Promise.all(
      completed.map(async (l) => {
        const saree = await ctx.db.get(l.sareeId);
        const sareeImageId =
          saree?.imageIds?.[3] ?? saree?.imageIds?.[2] ?? saree?.imageIds?.[0];
        return {
          ...l,
          sareeImageId,
          sareeGrad: saree?.grad,
          sareeEmoji: saree?.emoji,
          storeIdLabel: l.storeId,
        };
      })
    );
  },
});

export const listBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const looks = await ctx.db
      .query("looks")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(200);
    // Same completed-only filter and flat-lay fallback as listByCustomer.
    // See the rationale comments there.
    const completed = looks.filter((l) => l.status === "completed");
    const sarees = await Promise.all(completed.map((l) => ctx.db.get(l.sareeId)));
    return completed.map((l, i) => {
      const saree = sarees[i];
      return {
        ...l,
        sareeImageId:
          saree?.imageIds?.[3] ?? saree?.imageIds?.[2] ?? saree?.imageIds?.[0],
        sareeGrad: saree?.grad,
        sareeEmoji: saree?.emoji,
      };
    });
  },
});

export const listByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const looks = await ctx.db
      .query("looks")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(100);
    return looks;
  },
});

export const toggleFav = mutation({
  args: { lookId: v.id("looks") },
  handler: async (ctx, args) => {
    const look = await ctx.db.get(args.lookId);
    if (!look) throw new Error("Look not found");
    await ctx.db.patch(args.lookId, { isFav: !look.isFav });
    return !look.isFav;
  },
});

export const toggleWish = mutation({
  args: { lookId: v.id("looks") },
  handler: async (ctx, args) => {
    const look = await ctx.db.get(args.lookId);
    if (!look) throw new Error("Look not found");
    await ctx.db.patch(args.lookId, { isWished: !look.isWished });
    return !look.isWished;
  },
});

// =====================================================================
// deleteLook — customer removes a look from their /c/looks history.
//
// Auth: customer ownership check (look.customerId === args.customerId).
// Idempotent: silently no-ops on a missing row so a double-tap from the
// UI doesn't surface a "Look not found" error.
//
// Side effects on storage:
//   - imageFileId (the AI try-on render — unique to this look) is deleted
//   - imageNoBgFileId (the bg-removed cutout — unique to this look) is deleted
// We do NOT delete personFileId (customer's body scan, shared across all
// looks for the customer) or garmentFileId (saree image owned by the
// store, shared across customers). Those are reused.
//
// Wardrobe rows that reference this look via wardrobe.lookId become
// orphaned; listWardrobeByCustomer already tolerates a missing look
// (falls through to the catalog fallback chain), so no cascade.
// =====================================================================

export const deleteLook = mutation({
  args: {
    lookId: v.id("looks"),
    customerId: v.id("customers"),
  },
  handler: async (ctx, args): Promise<{ deleted: boolean }> => {
    const look = await ctx.db.get(args.lookId);
    if (!look) return { deleted: false };
    if (look.customerId !== args.customerId) {
      throw new Error("UNAUTHORIZED: not your look");
    }
    // Best-effort storage cleanup — failures are silent so a stuck
    // storage call doesn't block the row deletion. Orphan blobs are
    // harmless; orphan look rows would clutter the customer's history.
    if (look.imageFileId) {
      try { await ctx.storage.delete(look.imageFileId); } catch { /* ignore */ }
    }
    if (look.imageNoBgFileId) {
      try { await ctx.storage.delete(look.imageNoBgFileId); } catch { /* ignore */ }
    }
    await ctx.db.delete(args.lookId);
    return { deleted: true };
  },
});

// ============================================================
// SHORTLIST
// ============================================================

export const addToShortlist = mutation({
  args: {
    sessionId: v.string(),
    sareeId: v.id("sarees"),
    storeId: v.string(),
    customerId: v.optional(v.id("customers")),
  },
  handler: async (ctx, args) => {
    // Max 10 items per session — server is the source of truth.
    const existing = await ctx.db
      .query("shortlist")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .take(11);
    if (existing.length >= 10) {
      throw new Error("SHORTLIST_FULL: Shortlist is full (max 10 items)");
    }

    const id = await ctx.db.insert("shortlist", {
      sessionId: args.sessionId,
      sareeId: args.sareeId,
      storeId: args.storeId,
      customerId: args.customerId,
      sentToMirror: false,
      addedAt: Date.now(),
    });
    return id;
  },
});

// Get a customer's shortlisted items from all previous sessions at a store
export const getCustomerPreviousShortlist = query({
  args: {
    customerId: v.id("customers"),
    storeId: v.string(),
    currentSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("shortlist")
      .withIndex("by_customerId_and_storeId", (q) =>
        q.eq("customerId", args.customerId).eq("storeId", args.storeId)
      )
      .order("desc")
      .take(100);
    // Exclude items from the current session
    if (args.currentSessionId) {
      return items.filter((item) => item.sessionId !== args.currentSessionId);
    }
    return items;
  },
});

export const removeFromShortlist = mutation({
  args: {
    shortlistId: v.id("shortlist"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.shortlistId);
    if (!row) return;
    if (row.sessionId !== args.sessionId) {
      throw new Error("Shortlist item does not belong to this session");
    }
    await ctx.db.delete(args.shortlistId);
  },
});

export const getShortlist = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("shortlist")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(100);
    return items;
  },
});

export const markSentToMirror = mutation({
  args: {
    shortlistId: v.id("shortlist"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.shortlistId);
    if (!item) throw new Error("Shortlist item not found");
    if (item.sessionId !== args.sessionId) {
      throw new Error("Shortlist item does not belong to this session");
    }
    await ctx.db.patch(args.shortlistId, { sentToMirror: true });
  },
});

// ============================================================
// WARDROBE
// ============================================================

export const addToWardrobe = mutation({
  args: {
    sessionId: v.string(),
    customerId: v.optional(v.id("customers")),
    sareeId: v.id("sarees"),
    sareeName: v.string(),
    drapeStyle: v.optional(v.string()),
    accessories: v.optional(v.array(v.string())),
    neckline: v.optional(v.string()),
    price: v.optional(v.number()),
    // The AI try-on look the customer is moving from trial → wardrobe.
    // Optional because the move can happen before the render completes,
    // and because guest/dry-run paths may not have one. When present,
    // listWardrobeByCustomer surfaces the look's imageFileId as the
    // primary thumbnail for /c/wardrobe + the kiosk wardrobe screen.
    lookId: v.optional(v.id("looks")),
  },
  handler: async (ctx, args) => {
    // Idempotent: if the same customer already has this saree in their
    // wardrobe, return the existing row id instead of inserting a duplicate.
    // Prevents the duplicate-React-key crash on hydration, and keeps the
    // kiosk UI consistent across sessions for the same customer.
    if (args.customerId) {
      const prior = await ctx.db
        .query("wardrobe")
        .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
        .take(200);
      const dup = prior.find((w) => w.sareeId === args.sareeId);
      if (dup) {
        // If the existing row had no lookId and the caller now has one,
        // patch it in. Lets a customer who previously moved a saree to
        // wardrobe before the AI render completed get the try-on image
        // bound on a subsequent re-add.
        if (args.lookId && !dup.lookId) {
          await ctx.db.patch(dup._id, { lookId: args.lookId });
        }
        return dup._id;
      }
    }

    // Max 10 items per session
    const existing = await ctx.db
      .query("wardrobe")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .take(11);
    if (existing.length >= 10) {
      throw new Error("Wardrobe is full (max 10 items per session)");
    }

    const id = await ctx.db.insert("wardrobe", {
      sessionId: args.sessionId,
      customerId: args.customerId,
      sareeId: args.sareeId,
      sareeName: args.sareeName,
      drapeStyle: args.drapeStyle,
      accessories: args.accessories,
      neckline: args.neckline,
      price: args.price,
      lookId: args.lookId,
      addedAt: Date.now(),
    });
    if (args.customerId) {
      const saree = await ctx.db.get(args.sareeId);
      if (saree?.storeId) {
        await ensureStoreLink(ctx, args.customerId, saree.storeId);
      }
    }
    return id;
  },
});

export const removeFromWardrobe = mutation({
  args: {
    wardrobeId: v.id("wardrobe"),
    customerId: v.optional(v.id("customers")),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.wardrobeId);
    if (!row) return;
    // If caller passes customerId, require it matches. Guest rows (no
    // customerId on either side) pass through.
    if (args.customerId && row.customerId && row.customerId !== args.customerId) {
      throw new Error("Wardrobe item does not belong to this customer");
    }
    await ctx.db.delete(args.wardrobeId);
  },
});

// One-shot cleanup for wardrobe rows that duplicated before addToWardrobe
// became idempotent. For every (customerId, sareeId) pair keep the OLDEST
// row and delete the rest. Run once: `npx convex run sessionOps:dedupeWardrobe '{}'`.
// One-shot: link existing wardrobe rows to their matching completed look.
// Walks every wardrobe row that's missing `lookId`; finds a look in the
// same session for the same (customer, saree) with status="completed";
// patches the row. Idempotent — re-runs are a no-op once linked, and we
// only patch when status === "completed" so in-flight looks are skipped.
//
// Run once per environment: npx convex run sessionOps:backfillWardrobeLookIds '{}'
export const backfillWardrobeLookIds = internalMutation({
  args: {},
  handler: async (ctx) => {
    const wardrobe = await ctx.db.query("wardrobe").take(5000);
    let scanned = 0;
    let patched = 0;
    let noMatch = 0;
    for (const w of wardrobe) {
      scanned += 1;
      if (w.lookId) continue; // already linked
      if (!w.customerId) continue; // guest rows have no customer-keyed look match

      // Prefer a look from the SAME session (the move trial→wardrobe path
      // produces a look in the active session). Fall back to any completed
      // look this customer has for this saree if the session match is empty.
      const sessionMatches = await ctx.db
        .query("looks")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", w.sessionId))
        .take(200);
      let candidate = sessionMatches.find(
        (l) =>
          l.customerId === w.customerId &&
          l.sareeId === w.sareeId &&
          l.status === "completed",
      );
      if (!candidate) {
        const customerLooks = await ctx.db
          .query("looks")
          .withIndex("by_customerId", (q) => q.eq("customerId", w.customerId))
          .take(500);
        // Most recent completed look for this saree.
        candidate = customerLooks
          .filter((l) => l.sareeId === w.sareeId && l.status === "completed")
          .sort((a, b) => b.createdAt - a.createdAt)[0];
      }
      if (!candidate) {
        noMatch += 1;
        continue;
      }
      await ctx.db.patch(w._id, { lookId: candidate._id });
      patched += 1;
    }
    return { scanned, patched, noMatch, alreadyLinked: scanned - patched - noMatch };
  },
});

export const dedupeWardrobe = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("wardrobe").take(5000);
    const seen = new Map<string, Id<"wardrobe">>(); // key = `${customerId}:${sareeId}`
    let kept = 0;
    let deleted = 0;
    // Walk in ascending _creationTime so the first row we see is the keeper.
    all.sort((a, b) => a._creationTime - b._creationTime);
    for (const row of all) {
      if (!row.customerId) { kept++; continue; } // guest rows: no dedup key
      const key = `${row.customerId}:${row.sareeId}`;
      if (seen.has(key)) {
        await ctx.db.delete(row._id);
        deleted++;
      } else {
        seen.set(key, row._id);
        kept++;
      }
    }
    return { kept, deleted, total: all.length };
  },
});

export const listWardrobeByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wardrobe")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .take(200);
    // Enrich with saree cover image + store metadata for the wishlist tab UI.
    // Fetch all sarees in parallel, then look up each unique store at most once
    // (a customer typically has few distinct stores in their wardrobe).
    const sarees = await Promise.all(items.map((w) => ctx.db.get(w.sareeId)));
    // Resolve the linked AI try-on look (if any) per row. Renderers prefer
    // the look's imageFileId over the catalog photo so the customer sees
    // their own try-on render in /c/wardrobe + the kiosk wardrobe screen.
    const looks = await Promise.all(
      items.map((w) => (w.lookId ? ctx.db.get(w.lookId) : null)),
    );
    const uniqueStoreIds = Array.from(
      new Set(sarees.map((s) => s?.storeId).filter((id): id is string => !!id)),
    );
    const storeRows = await Promise.all(
      uniqueStoreIds.map((sid) =>
        ctx.db
          .query("stores")
          .withIndex("by_storeId", (q) => q.eq("storeId", sid))
          .unique(),
      ),
    );
    const storeById = new Map(
      uniqueStoreIds.map((sid, i) => [sid, storeRows[i]]),
    );
    return items.map((w, i) => {
      const saree = sarees[i];
      const look = looks[i];
      const store = saree?.storeId ? storeById.get(saree.storeId) : null;
      return {
        ...w,
        storeId: saree?.storeId,
        storeName: store?.name,
        storeCity: store?.city,
        // Look render takes precedence — only surfaces if status is
        // completed AND imageFileId is set (e.g. a not-yet-finished
        // queued look returns null and the catalog fallback kicks in).
        lookImageFileId:
          look?.status === "completed" ? look.imageFileId ?? undefined : undefined,
        // Catalog fallback. Slot 3 first (flat-lay, no model — same chain
        // as the try-on garment input) → slot 0 last resort. Avoids the
        // model-leak surface area in /c/wardrobe.
        sareeImageId:
          saree?.imageIds?.[3] ?? saree?.imageIds?.[2] ?? saree?.imageIds?.[0],
        sareeGrad: saree?.grad,
        sareeEmoji: saree?.emoji,
        sareeFabric: saree?.fabric,
      };
    });
  },
});

export const getWardrobe = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wardrobe")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(10);
    return items;
  },
});

// ============================================================
// KIOSK CART — per (customer, store) persistent checkout cart
// ============================================================

export const addCartItem = mutation({
  args: {
    customerId: v.id("customers"),
    storeId: v.string(),
    sareeId: v.id("sarees"),
    qty: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("kioskCart")
      .withIndex("by_customer_store_saree", (q) =>
        q.eq("customerId", args.customerId).eq("storeId", args.storeId).eq("sareeId", args.sareeId),
      )
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("kioskCart", {
      customerId: args.customerId,
      storeId: args.storeId,
      sareeId: args.sareeId,
      qty: Math.max(1, args.qty ?? 1),
      addedAt: Date.now(),
    });
  },
});

export const updateCartQty = mutation({
  args: {
    customerId: v.id("customers"),
    storeId: v.string(),
    sareeId: v.id("sarees"),
    qty: v.number(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("kioskCart")
      .withIndex("by_customer_store_saree", (q) =>
        q.eq("customerId", args.customerId).eq("storeId", args.storeId).eq("sareeId", args.sareeId),
      )
      .unique();
    if (!row) return;
    await ctx.db.patch(row._id, { qty: Math.max(1, args.qty) });
  },
});

export const removeCartItem = mutation({
  args: {
    customerId: v.id("customers"),
    storeId: v.string(),
    sareeId: v.id("sarees"),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("kioskCart")
      .withIndex("by_customer_store_saree", (q) =>
        q.eq("customerId", args.customerId).eq("storeId", args.storeId).eq("sareeId", args.sareeId),
      )
      .unique();
    if (row) await ctx.db.delete(row._id);
  },
});

export const clearCart = mutation({
  args: { customerId: v.id("customers"), storeId: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("kioskCart")
      .withIndex("by_customer_store", (q) =>
        q.eq("customerId", args.customerId).eq("storeId", args.storeId),
      )
      .collect();
    for (const r of rows) await ctx.db.delete(r._id);
  },
});

export const listCart = query({
  args: { customerId: v.id("customers"), storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kioskCart")
      .withIndex("by_customer_store", (q) =>
        q.eq("customerId", args.customerId).eq("storeId", args.storeId),
      )
      .order("desc")
      .collect();
  },
});

// ============================================================
// ORDERS
// ============================================================

function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createOrder = mutation({
  args: {
    sessionId: v.optional(v.string()),
    storeId: v.string(),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    items: v.array(
      v.object({
        sareeId: v.id("sarees"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    paymentMethod: v.optional(v.string()),
    deviceToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.deviceToken) {
      await requireKioskDeviceForStore(ctx, args.deviceToken, args.storeId);
    }
    const orderId = generateOrderId();

    // Calculate subtotal and GST
    let subtotal = 0;
    let gst = 0;
    for (const item of args.items) {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      // GST: 5% for items under Rs1000, 12% for items Rs1000 and above
      const gstRate = item.price < 1000 ? 0.05 : 0.12;
      gst += lineTotal * gstRate;
    }
    gst = Math.round(gst * 100) / 100;
    const total = Math.round((subtotal + gst) * 100) / 100;

    const now = Date.now();
    const qrExpiry = now + 10 * 60 * 1000; // 10 minutes from now

    await ctx.db.insert("orders", {
      orderId,
      sessionId: args.sessionId,
      storeId: args.storeId,
      customerId: args.customerId,
      customerPhone: args.customerPhone,
      items: args.items,
      subtotal,
      gst,
      total,
      status: "pending",
      paymentMethod: args.paymentMethod,
      qrExpiry,
      createdAt: now,
    });
    return orderId;
  },
});

export const getOrder = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();
    return order;
  },
});

export const listOrdersByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(100);
    return orders;
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();
    if (!order) throw new Error("Order not found");
    await ctx.db.patch(order._id, { status: args.status });
    return order._id;
  },
});

// ============================================================
// BACKFILL MIGRATIONS
// One-shot repair for pre-existing customers whose looks/wardrobe/session
// rows were written before store-link tracking was wired. Idempotent —
// never overwrites rows that already exist, so safe to re-run.
//
// Invoke via Convex CLI:
//   npx convex run sessionOps:backfillStoreLinksFromActivity '{}'
//   npx convex run sessionOps:backfillVisitHistoryFromSessions '{}'
// ============================================================

export const backfillStoreLinksFromActivity = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Gather every (customerId, storeId) pair that has any kiosk activity.
    // Price maps are built in the same pass so we can seed CLV from orders.
    const looks = await ctx.db.query("looks").collect();
    const wardrobe = await ctx.db.query("wardrobe").collect();
    const orders = await ctx.db.query("orders").collect();

    type Key = string; // `${customerId}|${storeId}`
    const seen = new Map<
      Key,
      { customerId: Id<"customers">; storeId: string; sessionIds: Set<string>; lastActivity: number; spent: number }
    >();

    const touch = (
      customerId: Id<"customers"> | undefined,
      storeId: string | undefined,
      sessionId: string | undefined,
      timestamp: number,
      spent: number
    ) => {
      if (!customerId || !storeId) return;
      const key = `${customerId}|${storeId}`;
      const entry = seen.get(key);
      if (entry) {
        if (sessionId) entry.sessionIds.add(sessionId);
        if (timestamp > entry.lastActivity) entry.lastActivity = timestamp;
        entry.spent += spent;
      } else {
        seen.set(key, {
          customerId,
          storeId,
          sessionIds: new Set(sessionId ? [sessionId] : []),
          lastActivity: timestamp,
          spent,
        });
      }
    };

    for (const l of looks) touch(l.customerId, l.storeId, l.sessionId, l.createdAt, 0);

    // Wardrobe rows carry sareeId but not storeId — look up via saree.
    for (const w of wardrobe) {
      if (!w.customerId) continue;
      const saree = await ctx.db.get(w.sareeId);
      if (!saree?.storeId) continue;
      touch(w.customerId, saree.storeId, w.sessionId, w.addedAt, 0);
    }

    for (const o of orders) {
      touch(o.customerId, o.storeId, o.sessionId, o.createdAt, o.total ?? 0);
    }

    let created = 0;
    let skipped = 0;
    for (const { customerId, storeId, sessionIds, lastActivity, spent } of seen.values()) {
      const existing = await ctx.db
        .query("customerStoreLinks")
        .withIndex("by_customerId_and_storeId", (q) =>
          q.eq("customerId", customerId).eq("storeId", storeId)
        )
        .unique();
      if (existing) {
        skipped++;
        continue;
      }
      const store = await ctx.db
        .query("stores")
        .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
        .unique();
      const lastVisitDate = new Date(lastActivity).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      });
      await ctx.db.insert("customerStoreLinks", {
        customerId,
        storeId,
        storeName: store?.name,
        visits: Math.max(1, sessionIds.size),
        lastVisit: lastVisitDate,
        clv: spent,
        segment: sessionIds.size >= 2 ? "Regular" : "New",
      });
      created++;
    }

    return { created, skipped, distinctPairs: seen.size };
  },
});

export const backfillVisitHistoryFromSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").collect();
    const existingVisits = await ctx.db.query("visitHistory").collect();
    const byKey = new Set(existingVisits.map((v) => `${v.customerId}|${v.sessionId ?? ""}`));

    let created = 0;
    let skipped = 0;
    for (const s of sessions) {
      if (!s.customerId) { skipped++; continue; }
      const key = `${s.customerId}|${s.sessionId}`;
      if (byKey.has(key)) { skipped++; continue; }

      // Derive totals from the session itself first, fall back to counts.
      let sareesTried = s.sareesTriedOn;
      if (sareesTried === undefined) {
        const looks = await ctx.db
          .query("looks")
          .withIndex("by_sessionId", (q) => q.eq("sessionId", s.sessionId))
          .collect();
        sareesTried = looks.length;
      }

      let purchased = s.purchased;
      if (purchased === undefined) {
        const matchingOrders = await ctx.db
          .query("orders")
          .withIndex("by_customerId", (q) => q.eq("customerId", s.customerId))
          .collect();
        purchased = matchingOrders.some((o) => o.sessionId === s.sessionId);
      }

      const dateSource = s.endTime ?? s.startTime;
      const date = new Date(dateSource).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      });

      await ctx.db.insert("visitHistory", {
        customerId: s.customerId,
        storeId: s.storeId,
        storeName: s.storeName,
        sessionId: s.sessionId,
        date,
        sareesTried,
        purchased,
        staffName: s.staffName,
        pointsEarned: purchased ? 500 : 50,
      });
      created++;
    }

    return { created, skipped, totalSessions: sessions.length };
  },
});
