import { query, mutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./adminAuth";
import { Doc } from "./_generated/dataModel";

// Pairing-code lifetime: long enough to walk from the tablet to the mirror,
// short enough that a screenshot leaked later is useless.
const PAIRING_CODE_TTL_MS = 2 * 60 * 1000;

// Rate-limit code consumption per storeId. Limit the search space
// (10^6 = 1M codes) in practice to something unbruteforceable: 30 wrong
// guesses in 10 minutes → attacker gets 4,320 tries/day instead of millions.
const PAIRING_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const PAIRING_ATTEMPT_MAX_FAILS = 30;

// 32-byte token, hex-encoded. Opaque to clients.
const DEVICE_TOKEN_BYTES = 32;

function generateDeviceToken(): string {
  const bytes = new Uint8Array(DEVICE_TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

// 6-digit numeric code, crypto-RNG. Matches the trialRoom generator so the
// UX is uniform across OTP/trial-code/pairing-code.
function generatePairingCode(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  // Reject-sample via modulo is biased but trivial here — 2^24 / 10^6 ≈ 16.8,
  // so bias is ~0.0003 per digit. Not security-relevant for a rate-limited
  // code, but keeping this note so nobody "optimises" it later.
  const n = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
  return (n % 1_000_000).toString().padStart(6, "0");
}

function generateDeviceId(): string {
  // Human-readable-ish: K- prefix, 8-char base36 suffix. Collision-safe
  // enough for fleet management; the real identity is deviceToken.
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] % 36).toString(36);
  }
  return "K-" + out.toUpperCase();
}

// Authorize the caller as admin OR as the owner of the given store. The
// store-owner path piggybacks on the existing userSessions token that the
// store dashboard already sends; the admin path uses Better Auth identity.
// Returns { kind, email } so audit fields can record who did what.
async function authorizeForStore(
  ctx: QueryCtx | MutationCtx,
  storeId: string,
  sessionToken: string | undefined,
): Promise<{ kind: "admin" | "store_owner"; email: string }> {
  // Try store-owner first: it's cheaper (one index lookup) and is the
  // common path (self-serve setup).
  if (sessionToken) {
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_token", (q) => q.eq("token", sessionToken))
      .first();
    if (session && session.expiresAt > Date.now() && session.role === "store_owner") {
      const user = await ctx.db.get(session.userId);
      if (user && user.storeId === storeId) {
        // users.phone is the canonical identifier; no email field on the
        // store-owner schema. Audit log records phone — good enough.
        return { kind: "store_owner", email: user.phone ?? "unknown" };
      }
    }
  }
  // Fall back to admin (throws if not admin).
  const admin = await requireAdmin(ctx);
  return { kind: "admin", email: admin.email };
}

// Admin-only authorization. Used for global fleet operations where store
// scope is not applicable (e.g. listing all devices).
async function authorizeAdminOnly(
  ctx: QueryCtx | MutationCtx,
): Promise<{ kind: "admin"; email: string }> {
  const admin = await requireAdmin(ctx);
  return { kind: "admin", email: admin.email };
}

// ============================================================
// CREATE PAIRING CODE
// ============================================================

export const createPairingCode = mutation({
  args: {
    storeId: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await authorizeForStore(ctx, args.storeId, args.sessionToken);

    const store = await ctx.db
      .query("stores")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .unique();
    if (!store) {
      throw new Error("Store not found");
    }

    // Generate a code that isn't currently live for this store. Collisions
    // are rare (1M space, outstanding codes per store normally <10), but
    // the index makes the check cheap.
    let code = "";
    for (let i = 0; i < 10; i++) {
      const candidate = generatePairingCode();
      const existing = await ctx.db
        .query("kioskPairings")
        .withIndex("by_code", (q) => q.eq("code", candidate))
        .first();
      if (!existing || existing.consumedAt || existing.expiresAt < Date.now()) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      throw new Error("Could not generate a unique pairing code — try again");
    }

    const now = Date.now();
    const pairingId = await ctx.db.insert("kioskPairings", {
      code,
      storeId: args.storeId,
      storeName: store.name,
      createdByEmail: actor.email,
      createdByKind: actor.kind,
      createdAt: now,
      expiresAt: now + PAIRING_CODE_TTL_MS,
    });

    return {
      pairingId,
      code,
      expiresAt: now + PAIRING_CODE_TTL_MS,
      storeName: store.name,
    };
  },
});

// ============================================================
// CONSUME PAIRING CODE  (called by the unpaired kiosk)
// ============================================================

export const consumePairingCode = mutation({
  args: {
    code: v.string(),
    deviceLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const trimmedCode = args.code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      throw new Error("Invalid pairing code");
    }

    const pairing = await ctx.db
      .query("kioskPairings")
      .withIndex("by_code", (q) => q.eq("code", trimmedCode))
      .first();

    // We can't apply rate limiting pre-lookup because we don't know the
    // storeId yet. Limit per-code and globally-per-bad-code via the attempts
    // table keyed on the "storeId" we find (or "unknown" for total misses).
    const storeKey = pairing?.storeId ?? "__unknown__";
    await checkPairingAttempts(ctx, storeKey);

    if (!pairing) {
      await recordPairingFailure(ctx, storeKey);
      throw new Error("Invalid or expired pairing code");
    }
    if (pairing.consumedAt) {
      await recordPairingFailure(ctx, storeKey);
      throw new Error("This pairing code was already used");
    }
    if (pairing.expiresAt < Date.now()) {
      await recordPairingFailure(ctx, storeKey);
      throw new Error("This pairing code has expired");
    }

    // Mint the device. Consume the pairing row atomically with the insert
    // so a retry can't double-mint.
    const now = Date.now();
    const deviceId = generateDeviceId();
    const deviceToken = generateDeviceToken();
    const label = args.deviceLabel?.trim() || "Kiosk";

    await ctx.db.insert("devices", {
      deviceId,
      type: "Mirror",
      storeRef: undefined,
      storeName: pairing.storeName,
      storeId: pairing.storeId,
      status: "online",
      lifecycle: "ACTIVE",
      uptime: 100,
      gpuLatency: 0,
      cpuPercent: 0,
      gpuTemp: 0,
      memoryGb: 0,
      fps: 0,
      lastSeen: "just now",
      certExpiry: "",
      offlineQueue: 0,
      deviceToken,
      pairedAt: now,
      pairedByEmail: pairing.createdByEmail,
      pairedByKind: pairing.createdByKind,
      deviceLabel: label,
      lastSeenAt: now,
    });

    await ctx.db.patch(pairing._id, {
      consumedAt: now,
      consumedDeviceId: deviceId,
    });

    // Clear the attempt window on success so a successful pair doesn't
    // leave the next device locked out.
    await clearPairingAttempts(ctx, pairing.storeId);

    return {
      deviceId,
      deviceToken,
      storeId: pairing.storeId,
      storeName: pairing.storeName,
      deviceLabel: label,
    };
  },
});

// ============================================================
// REVOKE DEVICE
// ============================================================

export const revokeDevice = mutation({
  args: {
    deviceId: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const device = await ctx.db
      .query("devices")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .unique();
    if (!device) {
      throw new Error("Device not found");
    }

    const actor = await authorizeForStore(ctx, device.storeId, args.sessionToken);

    if (device.revokedAt) {
      // Idempotent — already revoked.
      return { ok: true, alreadyRevoked: true };
    }

    await ctx.db.patch(device._id, {
      revokedAt: Date.now(),
      revokedByEmail: actor.email,
      status: "offline",
      lifecycle: "DECOMMISSIONED",
      // Clear the token so even a cached copy on the kiosk stops working
      // without waiting for the requireKioskDevice revokedAt check.
      deviceToken: undefined,
    });

    return { ok: true, alreadyRevoked: false };
  },
});

// ============================================================
// LISTS
// ============================================================

export const listDevicesForStore = query({
  args: {
    storeId: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await authorizeForStore(ctx, args.storeId, args.sessionToken);
    const devices = await ctx.db
      .query("devices")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .take(100);
    return devices.map(pickDevicePublicFields);
  },
});

export const listAllPairedDevices = query({
  args: {},
  handler: async (ctx) => {
    await authorizeAdminOnly(ctx);
    // Only surface devices that went through the pairing flow (have a
    // pairedAt). Legacy seed devices with telemetry but no pairing
    // identity aren't relevant to the pairing view.
    const rows = await ctx.db.query("devices").take(500);
    return rows
      .filter((d) => d.pairedAt !== undefined || d.revokedAt !== undefined)
      .map(pickDevicePublicFields);
  },
});

export const listActivePairingCodesForStore = query({
  args: {
    storeId: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await authorizeForStore(ctx, args.storeId, args.sessionToken);
    const now = Date.now();
    const rows = await ctx.db
      .query("kioskPairings")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(20);
    return rows
      .filter((r) => !r.consumedAt && r.expiresAt > now)
      .map((r) => ({
        _id: r._id,
        code: r.code,
        storeName: r.storeName,
        createdByEmail: r.createdByEmail,
        createdByKind: r.createdByKind,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
      }));
  },
});

// ============================================================
// Rate-limit helpers
// ============================================================

async function checkPairingAttempts(
  ctx: MutationCtx,
  storeId: string,
): Promise<void> {
  const now = Date.now();
  const row = await ctx.db
    .query("kioskPairingAttempts")
    .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
    .unique();
  if (!row) return;
  if (now - row.windowStart > PAIRING_ATTEMPT_WINDOW_MS) return;
  if (row.failures >= PAIRING_ATTEMPT_MAX_FAILS) {
    throw new Error("Too many failed pairing attempts — try again later");
  }
}

async function recordPairingFailure(
  ctx: MutationCtx,
  storeId: string,
): Promise<void> {
  const now = Date.now();
  const row = await ctx.db
    .query("kioskPairingAttempts")
    .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
    .unique();
  if (!row) {
    await ctx.db.insert("kioskPairingAttempts", {
      storeId,
      failures: 1,
      windowStart: now,
    });
    return;
  }
  if (now - row.windowStart > PAIRING_ATTEMPT_WINDOW_MS) {
    await ctx.db.patch(row._id, { failures: 1, windowStart: now });
  } else {
    await ctx.db.patch(row._id, { failures: row.failures + 1 });
  }
}

async function clearPairingAttempts(
  ctx: MutationCtx,
  storeId: string,
): Promise<void> {
  const row = await ctx.db
    .query("kioskPairingAttempts")
    .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
    .unique();
  if (row) await ctx.db.delete(row._id);
}

// ============================================================
// Shared projection — never leak deviceToken to clients.
// ============================================================

function pickDevicePublicFields(d: Doc<"devices">) {
  return {
    _id: d._id,
    deviceId: d.deviceId,
    deviceLabel: d.deviceLabel,
    storeId: d.storeId,
    storeName: d.storeName,
    status: d.status,
    pairedAt: d.pairedAt,
    pairedByEmail: d.pairedByEmail,
    pairedByKind: d.pairedByKind,
    revokedAt: d.revokedAt,
    revokedByEmail: d.revokedByEmail,
    lastSeenAt: d.lastSeenAt,
    lifecycle: d.lifecycle,
  };
}
