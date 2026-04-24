import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

// The real OTP lives in MSG91. We track the Convex-side session so
// (a) downstream mutations (loginWithOtp, register) can verify that
// the phone was confirmed via MSG91 before minting a session, and
// (b) verify-attempts can be rate-limited without hitting MSG91 every
// time. Pattern borrowed from /home/vrathik/Documents/comfyui_next
// (see convex/otp.ts there).

// 10 minutes, matching MSG91's default OTP lifetime. Sessions that
// outlive this return "expired" to the caller.
const OTP_TTL_MS = 10 * 60 * 1000;

// Per-phone verify-attempt ceiling. 5 mirrors the reference app and is
// tighter than the default MSG91 throttle. Exceeding this forces the
// user to request a fresh OTP.
const MAX_ATTEMPTS = 5;

// Normalize phones to a canonical shape BEFORE we write/read, so that
// "+91 98000 00001", "+919800000001", "9800000001" all land on the
// same row. Matches phoneAuth.normalizePhone contract.
function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = "91" + digits;
  return "+" + digits;
}

// Private: drop any existing session row for this phone. Called on new
// send so only one live OTP exists per phone at any time.
async function clearExistingSession(ctx: MutationCtx, phone: string) {
  const existing = await ctx.db
    .query("otpSessions")
    .withIndex("by_phone", (q) => q.eq("phone", phone))
    .first();
  if (existing) await ctx.db.delete(existing._id);
}

// Called by /api/otp/send AFTER MSG91 confirms the OTP was dispatched.
// Writes a fresh row with verified=false. Any prior row for this phone
// is wiped so a stale "verified: true" from a previous login attempt
// can't be replayed.
export const createOtpSession = mutation({
  args: {
    phone: v.string(),
    requestId: v.string(),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    await clearExistingSession(ctx, phone);
    const now = Date.now();
    await ctx.db.insert("otpSessions", {
      phone,
      requestId: args.requestId,
      verified: false,
      attempts: 0,
      expiresAt: now + OTP_TTL_MS,
      createdAt: now,
    });
    return { ok: true };
  },
});

// Called by /api/otp/verify AFTER MSG91 confirms the OTP matches.
// Flips verified=true on the row. Downstream mutations (loginWithOtp)
// look for this flag.
export const markOtpVerified = mutation({
  args: {
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    const session = await ctx.db
      .query("otpSessions")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first();
    if (!session) {
      // Shouldn't happen in normal flow — /api/otp/send always writes a
      // row first. If it does (e.g. TTL elapsed between send and
      // verify), surface it so the UI can ask for a fresh OTP.
      throw new Error("No OTP session for this phone — request a new code");
    }
    if (session.expiresAt < Date.now()) {
      throw new Error("OTP expired — request a new code");
    }
    await ctx.db.patch(session._id, { verified: true });
    return { ok: true };
  },
});

// Called by /api/otp/verify BEFORE the MSG91 call, to bump the attempt
// counter and short-circuit if the phone has exhausted its budget.
// Keeping the ceiling server-side means a rogue client can't bypass by
// skipping the MSG91 roundtrip.
export const incrementAttempt = mutation({
  args: {
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    const session = await ctx.db
      .query("otpSessions")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first();
    if (!session) {
      throw new Error("No OTP session — request a new code");
    }
    if (session.expiresAt < Date.now()) {
      throw new Error("OTP expired — request a new code");
    }
    const newAttempts = session.attempts + 1;
    if (newAttempts > MAX_ATTEMPTS) {
      throw new Error("Too many attempts — request a new OTP");
    }
    await ctx.db.patch(session._id, { attempts: newAttempts });
    return { ok: true, attemptsUsed: newAttempts };
  },
});

// Internal helper used from phoneAuth.{verifyOtp, loginWithOtp}.
// Returns true iff there is a live, verified session for this phone.
// DOES NOT consume — callers that mint a session should call
// consumeVerifiedSession afterwards to prevent replay.
export async function isPhoneVerified(
  ctx: MutationCtx,
  phoneRaw: string,
): Promise<boolean> {
  const phone = normalizePhone(phoneRaw);
  const session = await ctx.db
    .query("otpSessions")
    .withIndex("by_phone", (q) => q.eq("phone", phone))
    .first();
  if (!session) return false;
  if (!session.verified) return false;
  if (session.expiresAt < Date.now()) return false;
  return true;
}

// Internal: call once a verified session has been consumed (e.g. user
// successfully logged in or registered). Deletes the row. Subsequent
// loginWithOtp calls for the same phone need a fresh OTP.
export async function consumeVerifiedSession(
  ctx: MutationCtx,
  phoneRaw: string,
): Promise<void> {
  const phone = normalizePhone(phoneRaw);
  const session = await ctx.db
    .query("otpSessions")
    .withIndex("by_phone", (q) => q.eq("phone", phone))
    .first();
  if (session) await ctx.db.delete(session._id);
}

// Optional polling query for UIs that want to show "code sent, awaiting
// user action" spinners. Returns the public-safe subset — never leaks
// the requestId or attempt counter to unauthenticated callers... actually
// we do expose attempts since it's useful for rendering "2/5 tries left".
export const checkStatus = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    const session = await ctx.db
      .query("otpSessions")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first();
    if (!session) return { exists: false } as const;
    const expired = session.expiresAt < Date.now();
    return {
      exists: true,
      verified: session.verified,
      expired,
      attempts: session.attempts,
      attemptsRemaining: Math.max(0, MAX_ATTEMPTS - session.attempts),
      expiresAt: session.expiresAt,
    } as const;
  },
});
