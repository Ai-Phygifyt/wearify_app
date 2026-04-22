import { query, mutation, internalMutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { ensureCustomerByPhone } from "./customers";
import { findStaffWithPin } from "./stores";
import { generateSalt, hashWithSalt, constantTimeEquals } from "./authCrypto";

// Rate-limit staff PIN login per storeId. Matches the trialRoom
// pattern — per-storeId rolling window; prevents unlimited 4-digit
// enumeration from the API.
const STAFF_PIN_WINDOW_MS = 10 * 60 * 1000;
const STAFF_PIN_MAX_FAILS = 30;

// Rate-limit loginWithPassword per canonical phone. Budget is generous
// enough that "I forgot my password" retrying a few times won't lock
// themselves out, tight enough that online brute-force hits a wall fast.
const PWD_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const PWD_LOGIN_MAX_FAILS = 10;

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Create a new session row for a user (allows multiple devices concurrently).
async function createSession(ctx: MutationCtx, userId: Id<"users">, role: string): Promise<string> {
  const token = generateToken();
  const now = Date.now();
  await ctx.db.insert("userSessions", {
    userId,
    token,
    role,
    expiresAt: now + SESSION_TTL_MS,
    createdAt: now,
    lastSeenAt: now,
  });
  await ctx.db.patch(userId, { lastLogin: now });
  return token;
}

// Normalize phone to canonical format: +91XXXXXXXXXX (no spaces)
function normalizePhone(phone: string): string {
  // Strip all whitespace
  const cleaned = phone.replace(/\s+/g, "");
  // Extract digits only
  const digits = cleaned.replace(/\D/g, "");
  // If starts with 91 and has >10 digits, strip the country code
  if (digits.startsWith("91") && digits.length > 10) {
    return "+91" + digits.slice(2);
  }
  // If already has +91 prefix after stripping spaces, return as-is
  if (cleaned.startsWith("+91")) {
    return cleaned;
  }
  // Raw 10-digit number — add prefix
  if (digits.length === 10) {
    return "+91" + digits;
  }
  // Fallback: return stripped version
  return cleaned;
}

// Find store by owner phone (single canonical format lookup)
async function findStoreByOwnerPhone(ctx: QueryCtx, phone: string) {
  return await ctx.db
    .query("stores")
    .withIndex("by_ownerPhone", (q) => q.eq("ownerPhone", phone))
    .first();
}

// Legacy password hash — SHA-256 over (password + static salt). Only used
// by verifyPassword to accept credentials saved before the PBKDF2 migration.
// Any row hashed this way is rehashed with a per-user salt on first
// successful login. Never call this from write paths.
async function hashLegacyPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "wearify-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Verify a plaintext password against a stored row. Returns `true` if the
// password matches either the modern PBKDF2 hash (requires passwordSalt)
// or the legacy SHA-256+static-salt format. `legacy` is set when the
// caller should re-save with the modern format.
async function verifyPassword(
  password: string,
  stored: { passwordHash?: string; passwordSalt?: string },
): Promise<{ ok: boolean; legacy: boolean }> {
  if (!stored.passwordHash) return { ok: false, legacy: false };
  if (stored.passwordSalt) {
    const candidate = await hashWithSalt(password, stored.passwordSalt);
    return { ok: constantTimeEquals(candidate, stored.passwordHash), legacy: false };
  }
  const legacy = await hashLegacyPassword(password);
  return { ok: constantTimeEquals(legacy, stored.passwordHash), legacy: true };
}

// Build a fresh { passwordHash, passwordSalt } pair for a new password.
// Always use this when writing to the DB — never store bare legacy hashes.
async function makePasswordRecord(password: string): Promise<{
  passwordHash: string;
  passwordSalt: string;
}> {
  const passwordSalt = generateSalt();
  const passwordHash = await hashWithSalt(password, passwordSalt);
  return { passwordHash, passwordSalt };
}

// Cryptographically-random session token. 48 chars over a 55-char alphabet
// = ~277 bits of entropy, sourced from Web Crypto rather than Math.random().
function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(48);
  crypto.getRandomValues(bytes);
  let token = "";
  for (let i = 0; i < bytes.length; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return token;
}

// Cryptographically-random 6-digit numeric suffix for generated entity IDs
// (tailor, etc.). Replaces Math.random() so IDs aren't enumerable.
function generateSixDigits(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] % 10).toString();
  }
  return out;
}

// Verify OTP (dummy: always 123456)
export const verifyOtp = mutation({
  args: {
    phone: v.string(),
    otp: v.string(),
  },
  handler: async (_ctx, args) => {
    if (args.otp !== "123456") {
      return { success: false, error: "Invalid OTP" };
    }
    return { success: true };
  },
});

// Register a new user with phone + password
export const register = mutation({
  args: {
    phone: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.string(), // "customer" | "tailor" | "store_owner"
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);

    // Check if phone already exists in the relevant table
    if (args.role === "customer") {
      const existing = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (existing) {
        return { success: false, error: "Phone number already registered" };
      }
      const record = await makePasswordRecord(args.password);
      const ensured = await ensureCustomerByPhone(ctx, phone, { name: args.name });
      // Attach password hash + salt to the freshly created customer row
      await ctx.db.patch(ensured.customerId, record);
      const userId = await ctx.db.insert("users", {
        phone,
        ...record,
        name: args.name,
        role: "customer",
      });
      const token = await createSession(ctx, userId, "customer");
      return { success: true, token, userId: ensured.customerId, role: "customer" };
    }

    if (args.role === "tailor") {
      const existing = await ctx.db
        .query("tailors")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (existing) {
        return { success: false, error: "Phone number already registered" };
      }
      const record = await makePasswordRecord(args.password);
      const tailorId = `TL-${generateSixDigits()}`;
      const id = await ctx.db.insert("tailors", {
        tailorId,
        phone,
        name: args.name,
        ...record,
        city: "",
        status: "pending",
        rating: 0,
        revenue: 0,
        referrals: 0,
        leadsThisMonth: 0,
        earnedThisMonth: 0,
        commissionOwed: 0,
        freeReferralsUsed: 0,
        available: true,
        subscription: "free",
        joinDate: new Date().toISOString().split("T")[0],
        aadhaarVerified: false,
        panVerified: false,
        addressVerified: false,
        consentProfile: false,
        consentLocation: false,
        consentAnalytics: false,
      });
      const userId = await ctx.db.insert("users", {
        phone,
        ...record,
        name: args.name,
        role: "tailor",
        tailorId,
      });
      const token = await createSession(ctx, userId, "tailor");
      return { success: true, token, tailorId, userId: id, role: "tailor" };
    }

    // store_owner is created during onboarding, not self-registration
    return { success: false, error: "Invalid role for registration" };
  },
});

// Rehash a legacy SHA-256 password row with the modern PBKDF2 format.
// Called transparently from login on a successful legacy match — the
// caller never notices, and the DB stops carrying the weak hash.
async function rehashUserAndEntity(
  ctx: MutationCtx,
  userId: Id<"users">,
  entityTable: "customers" | "tailors" | null,
  entityId: Id<"customers"> | Id<"tailors"> | null,
  password: string,
) {
  const record = await makePasswordRecord(password);
  await ctx.db.patch(userId, record);
  if (entityTable && entityId) {
    // entityId type is verified via entityTable — safe to cast.
    await ctx.db.patch(entityId as never, record);
  }
}

// Login with phone + password. Dual-read: accepts both modern PBKDF2
// hashes (passwordSalt present) and legacy SHA-256 hashes; on legacy
// match, rehashes the row in-place so we migrate without forcing resets.
// Rate-limited per canonical phone so a known-phone brute-force attacker
// burns their budget in ~10 tries per 15-minute window.
export const loginWithPassword = mutation({
  args: {
    phone: v.string(),
    password: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    const now = Date.now();

    const attempts = await ctx.db
      .query("passwordLoginAttempts")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .unique();
    const inWindow =
      attempts && now - attempts.windowStart < PWD_LOGIN_WINDOW_MS;
    if (inWindow && attempts.count >= PWD_LOGIN_MAX_FAILS) {
      return {
        success: false,
        error: "Too many attempts. Please try again in a few minutes.",
      };
    }

    const recordFail = async () => {
      if (!attempts) {
        await ctx.db.insert("passwordLoginAttempts", {
          phone,
          windowStart: now,
          count: 1,
        });
      } else if (now - attempts.windowStart >= PWD_LOGIN_WINDOW_MS) {
        await ctx.db.patch(attempts._id, { windowStart: now, count: 1 });
      } else {
        await ctx.db.patch(attempts._id, { count: attempts.count + 1 });
      }
    };
    const resetOnSuccess = async () => {
      if (attempts && attempts.count > 0) {
        await ctx.db.patch(attempts._id, { windowStart: now, count: 0 });
      }
    };

    if (args.role === "store_owner") {
      const store = await findStoreByOwnerPhone(ctx, phone);
      if (!store) {
        await recordFail();
        return { success: false, error: "Store not found for this phone" };
      }
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", "store_owner"))
        .first();
      if (!user) { await recordFail(); return { success: false, error: "Invalid password" }; }
      const check = await verifyPassword(args.password, user);
      if (!check.ok) { await recordFail(); return { success: false, error: "Invalid password" }; }
      if (check.legacy) {
        await rehashUserAndEntity(ctx, user._id, null, null, args.password);
      }
      await resetOnSuccess();
      const token = await createSession(ctx, user._id, "store_owner");
      return { success: true, token, storeId: store.storeId, storeName: store.name, role: "store_owner" };
    }

    if (args.role === "customer") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", "customer"))
        .first();
      if (!user) { await recordFail(); return { success: false, error: "Invalid phone or password" }; }
      const check = await verifyPassword(args.password, user);
      if (!check.ok) { await recordFail(); return { success: false, error: "Invalid phone or password" }; }
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (!customer) {
        await recordFail();
        return { success: false, error: "Customer record not found" };
      }
      if (check.legacy) {
        await rehashUserAndEntity(ctx, user._id, "customers", customer._id, args.password);
      }
      await resetOnSuccess();
      const token = await createSession(ctx, user._id, "customer");
      return { success: true, token, customerId: customer._id, role: "customer" };
    }

    if (args.role === "tailor") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", "tailor"))
        .first();
      if (!user) { await recordFail(); return { success: false, error: "Invalid phone or password" }; }
      const check = await verifyPassword(args.password, user);
      if (!check.ok) { await recordFail(); return { success: false, error: "Invalid phone or password" }; }
      const tailor = await ctx.db
        .query("tailors")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (!tailor) {
        await recordFail();
        return { success: false, error: "Tailor record not found" };
      }
      if (check.legacy) {
        await rehashUserAndEntity(ctx, user._id, "tailors", tailor._id, args.password);
      }
      await resetOnSuccess();
      const token = await createSession(ctx, user._id, "tailor");
      return { success: true, token, tailorId: tailor.tailorId, role: "tailor" };
    }

    return { success: false, error: "Invalid role" };
  },
});

// Login with OTP. Customer accounts are never auto-created on login —
// the /c/register flow must pass allowCreate:true to sign up.
export const loginWithOtp = mutation({
  args: {
    phone: v.string(),
    otp: v.string(),
    role: v.string(),
    name: v.optional(v.string()),
    allowCreate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.otp !== "123456") {
      return { success: false, error: "Invalid OTP" };
    }

    const phone = normalizePhone(args.phone);

    if (args.role === "store_owner") {
      const store = await findStoreByOwnerPhone(ctx, phone);
      if (!store) {
        return { success: false, error: "No store found for this phone number" };
      }
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", "store_owner"))
        .first();
      const userId = existingUser
        ? existingUser._id
        : await ctx.db.insert("users", {
            phone,
            name: store.ownerName || "Store Owner",
            role: "store_owner",
            storeId: store.storeId,
          });
      const token = await createSession(ctx, userId, "store_owner");
      const hasPassword = !!(existingUser?.passwordHash);
      return { success: true, token, storeId: store.storeId, storeName: store.name, role: "store_owner", hasPassword };
    }

    if (args.role === "customer") {
      // Existing-customer lookup first
      const existingCustomer = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .unique();
      if (!existingCustomer && !args.allowCreate) {
        // Login path must not create accounts — tell the client to show Register CTA
        return { success: false, error: "no_account", errorCode: "NO_ACCOUNT" };
      }
      const ensured = await ensureCustomerByPhone(ctx, phone, {
        name: args.name,
      });
      const customer = await ctx.db.get(ensured.customerId);
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", "customer"))
        .first();
      const userId = existingUser
        ? existingUser._id
        : await ctx.db.insert("users", {
            phone,
            name: customer!.name,
            role: "customer",
          });
      const token = await createSession(ctx, userId, "customer");
      return {
        success: true,
        token,
        customerId: ensured.customerId,
        role: "customer",
        profileComplete: ensured.profileComplete,
      };
    }

    if (args.role === "tailor") {
      const tailor = await ctx.db
        .query("tailors")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (!tailor) {
        return { success: false, error: "No tailor account found. Please register first." };
      }
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", "tailor"))
        .first();
      const userId = existingUser
        ? existingUser._id
        : await ctx.db.insert("users", {
            phone,
            name: tailor.name,
            role: "tailor",
            tailorId: tailor.tailorId,
          });
      const token = await createSession(ctx, userId, "tailor");
      return { success: true, token, tailorId: tailor.tailorId, role: "tailor" };
    }

    return { success: false, error: "Invalid role" };
  },
});

// Set password (after OTP login, user can set a password). Always writes
// the modern PBKDF2 format with a fresh salt.
export const setPassword = mutation({
  args: {
    phone: v.string(),
    password: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    const record = await makePasswordRecord(args.password);

    const user = await ctx.db
      .query("users")
      .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", args.role))
      .first();
    if (!user) {
      return { success: false, error: "User not found" };
    }
    await ctx.db.patch(user._id, record);

    // Also update password in the entity table
    if (args.role === "customer") {
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (customer) {
        await ctx.db.patch(customer._id, record);
      }
    } else if (args.role === "tailor") {
      const tailor = await ctx.db
        .query("tailors")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (tailor) {
        await ctx.db.patch(tailor._id, record);
      }
    }

    return { success: true };
  },
});

// Validate session token. Looks up the per-device session row in userSessions,
// then returns the linked user — so sessions on other devices are unaffected
// when someone logs in on a new device.
export const validateSession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.token) return null;
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    return {
      phone: user.phone,
      name: user.name,
      role: user.role,
      storeId: user.storeId,
      tailorId: user.tailorId,
    };
  },
});

// Staff PIN login (within a store context). Lookup is a staff-by-store
// scan + hash compare because PINs are stored salted — the old plaintext
// equality index was removed. Legacy plaintext rows are accepted and
// lazy-migrated to hash on first successful login so existing seeds keep
// working without a blocking migration.
export const staffPinLogin = mutation({
  args: {
    storeId: v.string(),
    pin: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    if (!/^\d{4}$/.test(args.pin)) {
      return { success: false, error: "Invalid PIN" };
    }

    // Rate-limit gate per store (DoS-safer than per-staff lockout since we
    // don't know which staff the caller meant until after a match).
    const attempts = await ctx.db
      .query("staffPinAttempts")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .unique();
    const inWindow =
      attempts && now - attempts.windowStart < STAFF_PIN_WINDOW_MS;
    if (inWindow && attempts.count >= STAFF_PIN_MAX_FAILS) {
      return {
        success: false,
        error: "Too many attempts. Please try again in a few minutes.",
      };
    }

    const matches = await findStaffWithPin(ctx, args.storeId, args.pin);
    const staffMember = matches.find((m) => m.status !== "inactive") ?? matches[0];

    const recordFail = async () => {
      if (!attempts) {
        await ctx.db.insert("staffPinAttempts", {
          storeId: args.storeId,
          windowStart: now,
          count: 1,
        });
      } else if (now - attempts.windowStart >= STAFF_PIN_WINDOW_MS) {
        await ctx.db.patch(attempts._id, { windowStart: now, count: 1 });
      } else {
        await ctx.db.patch(attempts._id, { count: attempts.count + 1 });
      }
    };

    if (!staffMember) {
      await recordFail();
      return { success: false, error: "Invalid PIN" };
    }
    if (staffMember.status === "inactive") {
      await recordFail();
      return { success: false, error: "Staff account is inactive. Contact your store owner." };
    }

    // Lazy-migrate legacy plaintext PIN: hash + salt and clear the plaintext.
    if (!staffMember.pinHash || !staffMember.pinSalt) {
      const pinSalt = generateSalt();
      const pinHash = await hashWithSalt(args.pin, pinSalt);
      await ctx.db.patch(staffMember._id, { pinHash, pinSalt, pin: undefined });
    }

    // Reset the store's failure window on successful login.
    if (attempts && attempts.count > 0) {
      await ctx.db.patch(attempts._id, { windowStart: now, count: 0 });
    }

    return {
      success: true,
      staffId: staffMember._id,
      name: staffMember.name,
      role: staffMember.role,
      storeId: staffMember.storeId,
    };
  },
});

// Logout — deletes only the current device's session row.
export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
    return { success: true };
  },
});

// Logout from every device (invalidates all sessions for the current user).
export const logoutAll = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return { success: true, count: 0 };
    const allSessions = await ctx.db
      .query("userSessions")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();
    for (const s of allSessions) {
      await ctx.db.delete(s._id);
    }
    return { success: true, count: allSessions.length };
  },
});

// ============================
// Migration: normalize all phone numbers to +91XXXXXXXXXX (no spaces)
// Run once via dashboard: npx convex run phoneAuth:normalizeAllPhones
// ============================
export const normalizeAllPhones = internalMutation({
  args: {},
  handler: async (ctx) => {
    let fixed = 0;

    // Fix users table
    const users = await ctx.db.query("users").take(500);
    for (const user of users) {
      const normalized = normalizePhone(user.phone);
      if (normalized !== user.phone) {
        await ctx.db.patch(user._id, { phone: normalized });
        fixed++;
      }
    }

    // Fix stores.ownerPhone
    const stores = await ctx.db.query("stores").take(200);
    for (const store of stores) {
      if (store.ownerPhone) {
        const normalized = normalizePhone(store.ownerPhone);
        if (normalized !== store.ownerPhone) {
          await ctx.db.patch(store._id, { ownerPhone: normalized });
          fixed++;
        }
      }
    }

    // Fix customers table
    const customers = await ctx.db.query("customers").take(500);
    for (const customer of customers) {
      const normalized = normalizePhone(customer.phone);
      if (normalized !== customer.phone) {
        await ctx.db.patch(customer._id, { phone: normalized });
        fixed++;
      }
    }

    // Fix tailors table
    const tailors = await ctx.db.query("tailors").take(200);
    for (const tailor of tailors) {
      const normalized = normalizePhone(tailor.phone);
      if (normalized !== tailor.phone) {
        await ctx.db.patch(tailor._id, { phone: normalized });
        fixed++;
      }
    }

    // Fix staff table
    const staff = await ctx.db.query("staff").take(500);
    for (const s of staff) {
      const normalized = normalizePhone(s.phone);
      if (normalized !== s.phone) {
        await ctx.db.patch(s._id, { phone: normalized });
        fixed++;
      }
    }

    return { fixed };
  },
});
