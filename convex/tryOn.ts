// convex/tryOn.ts
//
// Try-on orchestration. Public actions: runTryOn, retryLook.
// Public query: getLook. Internal: pollJob, _resolveContext,
// _countActiveForSession, _countForCustomerSince, _insertQueuedLook,
// _patchLook.
//
// See docs/superpowers/specs/2026-05-03-kiosk-runpod-tryon-design.md

import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
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
