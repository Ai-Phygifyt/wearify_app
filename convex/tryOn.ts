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
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import {
  buildSareeWorkflow,
  blobToBase64,
  readRunPodConfig,
  submitRunPodJob,
  DRYRUN_IMAGE_BASE64,
} from "./runpod";

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
// Look up a device by deviceToken and verify it's paired to the given
// store. Action-runtime equivalent of requireKioskDeviceForStore
// (which can't be called from action context because it heartbeats in
// mutations). Returns the device row or null.
// =====================================================================

export const _lookupDevice = internalQuery({
  args: {
    deviceToken: v.string(),
    storeId: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"devices"> | null> => {
    if (!args.deviceToken) return null;
    const device = await ctx.db
      .query("devices")
      .withIndex("by_deviceToken", (q) => q.eq("deviceToken", args.deviceToken))
      .unique();
    if (!device) return null;
    if (device.revokedAt) return null;
    if (device.storeId !== args.storeId) return null;
    return device;
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

// =====================================================================
// Helpers — config defaults
// =====================================================================

const PLATFORM_KEYS = [
  "tryon.enabled",
  "tryon.dryRun",
  "tryon.maxConcurrentPerSession",
  "tryon.maxPerSession",
  "tryon.rateLimitPerMinute",
  "tryon.rateLimitPerHour",
  "tryon.timeoutMs",
  "tryon.runpodEndpointId",
];

function readNum(s: string | undefined, fallback: number): number {
  if (!s) return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

// =====================================================================
// Public action: runTryOn
// Triggered by the kiosk on send-to-trial.
// =====================================================================

export const runTryOn = action({
  args: {
    deviceToken: v.string(),
    sessionId: v.string(),
    sareeId: v.id("sarees"),
  },
  handler: async (ctx, args): Promise<{ lookId: Id<"looks"> }> => {
    // -----------------------------------------------------------------
    // STEP 0 — resolve session, customer, saree
    // -----------------------------------------------------------------
    const ctxData: {
      session: Doc<"sessions"> | null;
      customer: Doc<"customers"> | null;
      saree: Doc<"sarees"> | null;
    } = await ctx.runQuery(internal.tryOn._resolveContext, {
      sessionId: args.sessionId,
      sareeId: args.sareeId,
    });
    const { session, customer, saree } = ctxData;
    if (!session) throw new Error("INTERNAL: session not found");
    if (!saree) throw new Error("INTERNAL: saree not found");

    // -----------------------------------------------------------------
    // Read platformConfig (defaults applied below)
    // -----------------------------------------------------------------
    const cfg: Record<string, string | undefined> = await ctx.runQuery(
      internal.tryOn._readPlatformConfig,
      { keys: PLATFORM_KEYS },
    );

    // -----------------------------------------------------------------
    // STEP 1 — auth (requireKioskDeviceForStore is a server-runtime
    // helper; we re-implement the check here in the action runtime by
    // calling an internal query). NOTE: we cannot call mutation-only
    // helpers from an action; the lastSeenAt heartbeat is skipped here
    // since this is a query path. The real auth check happens in
    // step 1 below; failure throws "UNAUTHORIZED:".
    // -----------------------------------------------------------------
    const device: Doc<"devices"> | null = await ctx.runQuery(
      internal.tryOn._lookupDevice,
      {
        deviceToken: args.deviceToken,
        storeId: session.storeId,
      },
    );
    if (!device) throw new Error("UNAUTHORIZED: kiosk device not paired to session store");

    // -----------------------------------------------------------------
    // STEP 2 — kill switch
    // -----------------------------------------------------------------
    if (cfg["tryon.enabled"] !== "true") {
      throw new Error("TRYON_DISABLED: try-on is currently unavailable");
    }

    // -----------------------------------------------------------------
    // STEP 3 — cross-store saree check
    // -----------------------------------------------------------------
    if (saree.storeId !== session.storeId) {
      throw new Error("UNAUTHORIZED: cross-store saree");
    }

    // -----------------------------------------------------------------
    // STEP 4 — per-session caps
    // -----------------------------------------------------------------
    const maxConc = readNum(cfg["tryon.maxConcurrentPerSession"], 3);
    const maxPer = readNum(cfg["tryon.maxPerSession"], 20);
    const counts: { total: number; inFlight: number } = await ctx.runQuery(
      internal.tryOn._countActiveForSession,
      { sessionId: args.sessionId },
    );
    if (counts.total >= maxPer) {
      throw new Error("SESSION_CAP_REACHED: try-on limit for this session reached");
    }
    if (counts.inFlight >= maxConc) {
      throw new Error("CONCURRENCY_LIMIT: wait for current renders to finish");
    }

    // -----------------------------------------------------------------
    // STEP 5 — per-customer rate limits (only if customer attached)
    // -----------------------------------------------------------------
    if (customer) {
      const perMin = readNum(cfg["tryon.rateLimitPerMinute"], 5);
      const perHr = readNum(cfg["tryon.rateLimitPerHour"], 30);
      const now = Date.now();
      const minCount: number = await ctx.runQuery(
        internal.tryOn._countForCustomerSince,
        { customerId: customer._id, since: now - 60_000 },
      );
      if (minCount >= perMin) {
        throw new Error("RATE_LIMIT_MINUTE: too many try-ons just now");
      }
      const hrCount: number = await ctx.runQuery(
        internal.tryOn._countForCustomerSince,
        { customerId: customer._id, since: now - 3_600_000 },
      );
      if (hrCount >= perHr) {
        throw new Error("RATE_LIMIT_HOUR: too many try-ons recently");
      }
    }

    // -----------------------------------------------------------------
    // STEP 6 — body scan present
    // -----------------------------------------------------------------
    if (!customer || !customer.bodyScanFileId) {
      throw new Error("NO_BODY_SCAN: please complete a body scan first");
    }
    const personFileId = customer.bodyScanFileId;

    // -----------------------------------------------------------------
    // STEP 7 — saree image present
    // -----------------------------------------------------------------
    const garmentFileId = saree.imageIds?.[0];
    if (!garmentFileId) {
      throw new Error("INTERNAL: saree has no image");
    }

    // -----------------------------------------------------------------
    // STEP 8 — dedup
    // -----------------------------------------------------------------
    const existing: Doc<"looks"> | null = await ctx.runQuery(
      internal.tryOn._findExistingLook,
      {
        sessionId: args.sessionId,
        customerId: customer._id,
        sareeId: args.sareeId,
      },
    );
    if (existing) {
      if (
        existing.status === "queued" ||
        existing.status === "processing" ||
        existing.status === "completed"
      ) {
        return { lookId: existing._id };
      }
      // existing.status === "failed" — fall through to retry path.
    }

    // -----------------------------------------------------------------
    // Submit RunPod job (dry-run if configured) — produces a jobId.
    // -----------------------------------------------------------------
    const dryRun = cfg["tryon.dryRun"] === "true";
    let runpodJobId: string;
    let endpointId: string;

    if (dryRun) {
      runpodJobId = `DRYRUN-${Math.random().toString(36).slice(2, 10)}`;
      endpointId = "dryrun";
    } else {
      // Real RunPod path is wired in Task 9. For Task 7, throw if
      // someone tries to use the real path before that wiring lands.
      throw new Error("INTERNAL: real RunPod path not yet implemented (Task 9)");
    }

    // -----------------------------------------------------------------
    // Insert / retry the looks row, schedule poller.
    // -----------------------------------------------------------------
    let lookId: Id<"looks">;
    if (existing && existing.status === "failed") {
      await ctx.runMutation(internal.tryOn._patchLookForRetry, {
        lookId: existing._id,
        runpodJobId,
        runpodEndpointId: endpointId,
        personFileId,
        garmentFileId,
      });
      lookId = existing._id;
    } else {
      lookId = await ctx.runMutation(internal.tryOn._insertQueuedLook, {
        sessionId: args.sessionId,
        storeId: session.storeId,
        customerId: customer._id,
        customerPhone: customer.phone,
        sareeId: args.sareeId,
        sareeName: saree.name,
        fabric: saree.fabric,
        price: saree.price,
        grad: saree.grad,
        runpodJobId,
        runpodEndpointId: endpointId,
        personFileId,
        garmentFileId,
      });
    }

    await ctx.scheduler.runAfter(1500, internal.tryOn.pollJob, { lookId });
    return { lookId };
  },
});

// =====================================================================
// Stub poller — real implementation in Task 8.
// Exported so the scheduler reference in runTryOn typechecks.
// =====================================================================

export const pollJob = internalAction({
  args: { lookId: v.id("looks") },
  handler: async (_ctx, _args) => {
    // No-op until Task 8 wires it up.
  },
});
