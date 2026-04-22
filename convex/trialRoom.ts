import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const CODE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

// 6-digit trial-room code sourced from Web Crypto, not Math.random().
// Code space is still 1M — real brute-force protection needs rate limiting
// on validateCode (tracked alongside the rest of the auth-pass work).
function generateNumericCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < bytes.length; i++) {
    code += (bytes[i] % 10).toString();
  }
  return code;
}

// Generate a 6-digit code when tablet sends items to mirror
export const generateCode = mutation({
  args: {
    sessionId: v.string(),
    storeId: v.string(),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    staffId: v.optional(v.id("staff")),
  },
  handler: async (ctx, args) => {
    // Check if an active code already exists for this session
    const existing = await ctx.db
      .query("trialRoom")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(5);

    const activeCode = existing.find(
      (tr) => tr.status === "active" && tr.expiresAt > Date.now()
    );
    if (activeCode) {
      return { code: activeCode.code, expiresAt: activeCode.expiresAt, isExisting: true };
    }

    // Mark any old codes for this session as expired
    for (const old of existing) {
      if (old.status === "active") {
        await ctx.db.patch(old._id, { status: "expired" });
      }
    }

    // Generate a unique 6-digit code
    let code = generateNumericCode();
    // Ensure uniqueness among active codes in this store
    let attempts = 0;
    while (attempts < 10) {
      const conflict = await ctx.db
        .query("trialRoom")
        .withIndex("by_code_and_storeId", (q) =>
          q.eq("code", code).eq("storeId", args.storeId),
        )
        .take(5);
      const activeConflict = conflict.find((tr) => tr.status === "active");
      if (!activeConflict) break;
      code = generateNumericCode();
      attempts++;
    }

    const now = Date.now();
    const expiresAt = now + CODE_EXPIRY_MS;

    await ctx.db.insert("trialRoom", {
      code,
      storeId: args.storeId,
      sessionId: args.sessionId,
      customerId: args.customerId,
      customerPhone: args.customerPhone,
      staffId: args.staffId,
      status: "active",
      expiresAt,
      createdAt: now,
    });

    return { code, expiresAt, isExisting: false };
  },
});

// Validate a code entered on the kiosk
export const validateCode = query({
  args: {
    code: v.string(),
    storeId: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("trialRoom")
      .withIndex("by_code_and_storeId", (q) =>
        q.eq("code", args.code).eq("storeId", args.storeId),
      )
      .take(10);

    const entry = entries.find((tr) => tr.status === "active");

    if (!entry) {
      return { valid: false, error: "Invalid code" } as const;
    }

    if (entry.expiresAt < Date.now()) {
      return { valid: false, error: "Code expired" } as const;
    }

    // Get the shortlist items sent to mirror for this session
    const shortlistItems = await ctx.db
      .query("shortlist")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", entry.sessionId))
      .take(100);
    const mirrorItems = shortlistItems.filter((item) => item.sentToMirror);

    // Narrow customer projection — the kiosk only reads _id/name/phone/lastBodyScan/language.
    // Don't return full row (password hash, email, body measurements, preferences, etc.)
    // so a guessed code can't exfiltrate PII.
    let customer = null;
    if (entry.customerId) {
      const row = await ctx.db.get(entry.customerId);
      if (row) {
        customer = {
          _id: row._id,
          name: row.name,
          phone: row.phone,
          lastBodyScan: row.lastBodyScan,
          language: row.language,
        };
      }
    }

    // Get session data
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", entry.sessionId))
      .unique();

    return {
      valid: true,
      trialRoom: {
        _id: entry._id,
        code: entry.code,
        sessionId: entry.sessionId,
        storeId: entry.storeId,
        customerId: entry.customerId,
        expiresAt: entry.expiresAt,
      },
      mirrorItems,
      customer,
      session,
    } as const;
  },
});

// Mark code as used when kiosk consumes it
export const markCodeUsed = mutation({
  args: { code: v.string(), storeId: v.string() },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("trialRoom")
      .withIndex("by_code_and_storeId", (q) =>
        q.eq("code", args.code).eq("storeId", args.storeId),
      )
      .take(10);

    const entry = entries.find((tr) => tr.status === "active");
    if (!entry) throw new Error("Trial room code not found or already used");

    await ctx.db.patch(entry._id, { status: "used" });
    return entry._id;
  },
});

// Get trial room by session (used by tablet to show existing code)
export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("trialRoom")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(5);

    // Return the most recent active and non-expired code
    const active = entries.find(
      (tr) => tr.status === "active" && tr.expiresAt > Date.now()
    );
    return active ?? null;
  },
});
