// convex/tryOn.ts
//
// Try-on orchestration. Public actions: runTryOn, retryLook.
// Public query: getLook. Internal actions: pollJob.
// Internal queries: _resolveContext, _countActiveForSession,
//   _countForCustomerSince, _findExistingLook, _readPlatformConfig,
//   _getLookInternal.
// Internal mutations: _insertQueuedLook, _patchLookForRetry,
//   _markProcessing, _completeLook, _failLook.
//
// See docs/superpowers/specs/2026-05-03-kiosk-runpod-tryon-design.md

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// =====================================================================
// Resolve session, customer, saree in one read. The orchestrator
// runs the eight-step guard chain against this snapshot.
// =====================================================================

export const _resolveContext = internalQuery({
  args: {
    sessionId: v.string(),
    sareeId: v.id("sarees"),
  },
  handler: async (ctx, args): Promise<{
    session: Doc<"sessions"> | null;
    customer: Doc<"customers"> | null;
    saree: Doc<"sarees"> | null;
  }> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    const saree = await ctx.db.get(args.sareeId);
    let customer: Doc<"customers"> | null = null;
    if (session?.customerId) {
      customer = await ctx.db.get(session.customerId);
    }
    return { session, customer, saree };
  },
});

// =====================================================================
// Count active looks for a session — total + in-flight.
// Backs §4.1 guards 4a (SESSION_CAP_REACHED) and 4b (CONCURRENCY_LIMIT).
// Sessions are short-lived with small look counts; .collect() is bounded.
// =====================================================================

export const _countActiveForSession = internalQuery({
  args: { sessionId: v.string() },
  handler: async (ctx, args): Promise<{ total: number; inFlight: number }> => {
    const rows = await ctx.db
      .query("looks")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    const total = rows.length;
    const inFlight = rows.filter(
      (r) => r.status === "queued" || r.status === "processing",
    ).length;
    return { total, inFlight };
  },
});

// =====================================================================
// Count looks for a customer since a timestamp. Backs §4.1 guard 5
// (RATE_LIMIT_MINUTE / RATE_LIMIT_HOUR). Uses the composite index
// by_customerId_and_createdAt for an O(log N) range scan.
// Result set bounded by tryon.rateLimitPerHour (default 30) — the
// rate-limit guard rejects further calls once the cap is hit, so
// .collect() is safe at this N.
// =====================================================================

export const _countForCustomerSince = internalQuery({
  args: {
    customerId: v.id("customers"),
    since: v.number(),
  },
  handler: async (ctx, args): Promise<number> => {
    const rows = await ctx.db
      .query("looks")
      .withIndex("by_customerId_and_createdAt", (q) =>
        q.eq("customerId", args.customerId).gte("createdAt", args.since),
      )
      .collect();
    return rows.length;
  },
});

// =====================================================================
// Look up a single existing look for dedup (§4.1 guard 8).
// Returns the row if (customerId, sessionId, sareeId) already has one.
// by_sessionId scopes to a single session (small N), then filter narrows
// further — acceptable until a composite index is added.
// =====================================================================

export const _findExistingLook = internalQuery({
  args: {
    sessionId: v.string(),
    customerId: v.id("customers"),
    sareeId: v.id("sarees"),
  },
  handler: async (ctx, args): Promise<Doc<"looks"> | null> => {
    return await ctx.db
      .query("looks")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("customerId"), args.customerId),
          q.eq(q.field("sareeId"), args.sareeId),
        ),
      )
      .first();
  },
});

// =====================================================================
// Read platformConfig values (defaults applied in the action).
// =====================================================================

export const _readPlatformConfig = internalQuery({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, args): Promise<Record<string, string | undefined>> => {
    const out: Record<string, string | undefined> = {};
    for (const key of args.keys) {
      const row = await ctx.db
        .query("platformConfig")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      out[key] = row?.value;
    }
    return out;
  },
});

// =====================================================================
// Insert a new looks row in "queued" state. Mirrors createLook's row
// shape so /c/looks display + dedup behavior carry over.
// =====================================================================

export const _insertQueuedLook = internalMutation({
  args: {
    sessionId: v.string(),
    storeId: v.string(),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    sareeId: v.id("sarees"),
    sareeName: v.string(),
    fabric: v.optional(v.string()),
    price: v.optional(v.number()),
    grad: v.optional(v.array(v.string())),
    runpodJobId: v.string(),
    runpodEndpointId: v.string(),
    personFileId: v.id("_storage"),
    garmentFileId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<Id<"looks">> => {
    const now = Date.now();
    return await ctx.db.insert("looks", {
      sessionId: args.sessionId,
      storeId: args.storeId,
      customerId: args.customerId,
      customerPhone: args.customerPhone,
      sareeId: args.sareeId,
      sareeName: args.sareeName,
      fabric: args.fabric,
      price: args.price,
      grad: args.grad,
      createdAt: now,
      status: "queued",
      runpodJobId: args.runpodJobId,
      runpodEndpointId: args.runpodEndpointId,
      personFileId: args.personFileId,
      garmentFileId: args.garmentFileId,
      pollAttempts: 0,
    });
  },
});

// =====================================================================
// Patch a looks row to retry. Used by retryLook to reuse the row in
// place rather than insert a new one. Clears terminal-state fields.
// =====================================================================

export const _patchLookForRetry = internalMutation({
  args: {
    lookId: v.id("looks"),
    runpodJobId: v.string(),
    runpodEndpointId: v.string(),
    personFileId: v.id("_storage"),
    garmentFileId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.lookId, {
      status: "queued",
      runpodJobId: args.runpodJobId,
      runpodEndpointId: args.runpodEndpointId,
      personFileId: args.personFileId,
      garmentFileId: args.garmentFileId,
      errorCode: undefined,
      errorMessage: undefined,
      startedAt: undefined,
      completedAt: undefined,
      pollAttempts: 0,
    });
  },
});

// =====================================================================
// Mark a look "processing" — first poll fired. Records startedAt.
// =====================================================================

export const _markProcessing = internalMutation({
  args: {
    lookId: v.id("looks"),
  },
  handler: async (ctx, args): Promise<void> => {
    const row = await ctx.db.get(args.lookId);
    if (!row) return;
    // Only advance from queued/processing — do not re-open completed/failed rows.
    if (row.status !== "queued" && row.status !== "processing") return;
    const patch: Partial<Doc<"looks">> = {
      status: "processing",
      pollAttempts: (row.pollAttempts ?? 0) + 1,
    };
    // Preserve the original startedAt on re-polls so latency measurement is accurate.
    if (!row.startedAt) patch.startedAt = Date.now();
    await ctx.db.patch(args.lookId, patch);
  },
});

// =====================================================================
// Mark a look completed with the rendered image stored in _storage.
// =====================================================================

export const _completeLook = internalMutation({
  args: {
    lookId: v.id("looks"),
    imageFileId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.lookId, {
      status: "completed",
      imageFileId: args.imageFileId,
      completedAt: Date.now(),
    });
  },
});

// =====================================================================
// Mark a look failed.
// =====================================================================

export const _failLook = internalMutation({
  args: {
    lookId: v.id("looks"),
    errorCode: v.string(),
    errorMessage: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.lookId, {
      status: "failed",
      errorCode: args.errorCode,
      errorMessage: args.errorMessage,
      completedAt: Date.now(),
    });
  },
});

// =====================================================================
// Read a look (used by pollJob to check timeout / current attempt).
// Internal version — public getLook is in Task 11.
// =====================================================================

export const _getLookInternal = internalQuery({
  args: { lookId: v.id("looks") },
  handler: async (ctx, args): Promise<Doc<"looks"> | null> => {
    return await ctx.db.get(args.lookId);
  },
});
