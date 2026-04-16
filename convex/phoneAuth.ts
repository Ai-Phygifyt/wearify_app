import { query, mutation, internalMutation, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { ensureCustomerByPhone } from "./customers";

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

// Simple hash for passwords (not bcrypt, but adequate for demo + Convex runtime)
// In production, use an action with Node.js bcrypt
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "wearify-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 48; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
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
      const hash = await hashPassword(args.password);
      const ensured = await ensureCustomerByPhone(ctx, phone, { name: args.name });
      // Attach password hash to the freshly created customer row
      await ctx.db.patch(ensured.customerId, { passwordHash: hash });
      const userId = await ctx.db.insert("users", {
        phone,
        passwordHash: hash,
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
      const hash = await hashPassword(args.password);
      const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
      const tailorId = `TL-${randomDigits}`;
      const id = await ctx.db.insert("tailors", {
        tailorId,
        phone,
        name: args.name,
        passwordHash: hash,
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
        passwordHash: hash,
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

// Login with phone + password
export const loginWithPassword = mutation({
  args: {
    phone: v.string(),
    password: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    const hash = await hashPassword(args.password);

    if (args.role === "store_owner") {
      const store = await findStoreByOwnerPhone(ctx, phone);
      if (!store) {
        return { success: false, error: "Store not found for this phone" };
      }
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", "store_owner"))
        .first();
      if (!user || user.passwordHash !== hash) {
        return { success: false, error: "Invalid password" };
      }
      const token = await createSession(ctx, user._id, "store_owner");
      return { success: true, token, storeId: store.storeId, storeName: store.name, role: "store_owner" };
    }

    if (args.role === "customer") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", "customer"))
        .first();
      if (!user || user.passwordHash !== hash) {
        return { success: false, error: "Invalid phone or password" };
      }
      // Look up the customer record for the customerId
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (!customer) {
        return { success: false, error: "Customer record not found" };
      }
      const token = await createSession(ctx, user._id, "customer");
      return { success: true, token, customerId: customer._id, role: "customer" };
    }

    if (args.role === "tailor") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", "tailor"))
        .first();
      if (!user || user.passwordHash !== hash) {
        return { success: false, error: "Invalid phone or password" };
      }
      // Look up the tailor record for the tailorId
      const tailor = await ctx.db
        .query("tailors")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (!tailor) {
        return { success: false, error: "Tailor record not found" };
      }
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

// Set password (after OTP login, user can set a password)
export const setPassword = mutation({
  args: {
    phone: v.string(),
    password: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    const hash = await hashPassword(args.password);

    const user = await ctx.db
      .query("users")
      .withIndex("by_phone_and_role", (q) => q.eq("phone", phone).eq("role", args.role))
      .first();
    if (!user) {
      return { success: false, error: "User not found" };
    }
    await ctx.db.patch(user._id, { passwordHash: hash });

    // Also update password in the entity table
    if (args.role === "customer") {
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (customer) {
        await ctx.db.patch(customer._id, { passwordHash: hash });
      }
    } else if (args.role === "tailor") {
      const tailor = await ctx.db
        .query("tailors")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (tailor) {
        await ctx.db.patch(tailor._id, { passwordHash: hash });
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

// Staff PIN login (within a store context)
export const staffPinLogin = mutation({
  args: {
    storeId: v.string(),
    pin: v.string(),
  },
  handler: async (ctx, args) => {
    const staffMember = await ctx.db
      .query("staff")
      .withIndex("by_storeId_and_pin", (q) =>
        q.eq("storeId", args.storeId).eq("pin", args.pin)
      )
      .first();
    if (!staffMember) {
      return { success: false, error: "Invalid PIN" };
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
