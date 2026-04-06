import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { QueryCtx } from "./_generated/server";

// Normalize phone: strip spaces, ensure +91 prefix with no space
function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "");
}

// Find store by owner phone, trying both "+91XXXXXXXXXX" and "+91 XXXXXXXXXX"
async function findStoreByOwnerPhone(ctx: QueryCtx, phone: string) {
  const normalized = normalizePhone(phone);
  let store = await ctx.db
    .query("stores")
    .withIndex("by_ownerPhone", (q) => q.eq("ownerPhone", normalized))
    .first();
  if (!store) {
    // Try with space format: "+91 XXXXXXXXXX"
    const withSpace = normalized.replace(/^\+91/, "+91 ");
    store = await ctx.db
      .query("stores")
      .withIndex("by_ownerPhone", (q) => q.eq("ownerPhone", withSpace))
      .first();
  }
  return store;
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
    // Check if phone already exists in the relevant table
    if (args.role === "customer") {
      const existing = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (existing) {
        return { success: false, error: "Phone number already registered" };
      }
      const hash = await hashPassword(args.password);
      const id = await ctx.db.insert("customers", {
        phone: args.phone,
        name: args.name,
        passwordHash: hash,
        totalVisits: 0,
        totalLooks: 0,
        totalStores: 0,
        storeCredit: 0,
        loyaltyPoints: 0,
        loyaltyTier: "Regular",
        initials: args.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
        consentHistory: true,
        consentMessages: true,
        consentAiPersonal: true,
        consentPhotos: true,
        consentGrantedDate: new Date().toISOString().split("T")[0],
        language: "en",
      });
      const token = generateToken();
      await ctx.db.insert("users", {
        phone: args.phone,
        passwordHash: hash,
        name: args.name,
        role: "customer",
        sessionToken: token,
        sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        lastLogin: Date.now(),
      });
      return { success: true, token, userId: id, role: "customer" };
    }

    if (args.role === "tailor") {
      const existing = await ctx.db
        .query("tailors")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (existing) {
        return { success: false, error: "Phone number already registered" };
      }
      const hash = await hashPassword(args.password);
      const tailorId = `TL-${String(Date.now()).slice(-6)}`;
      const id = await ctx.db.insert("tailors", {
        tailorId,
        phone: args.phone,
        name: args.name,
        passwordHash: hash,
        city: "",
        status: "pending",
        rating: 0,
        revenue: 0,
        referrals: 0,
        available: true,
        subscription: "free",
        joinDate: new Date().toISOString().split("T")[0],
      });
      const token = generateToken();
      await ctx.db.insert("users", {
        phone: args.phone,
        passwordHash: hash,
        name: args.name,
        role: "tailor",
        tailorId,
        sessionToken: token,
        sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        lastLogin: Date.now(),
      });
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
    const hash = await hashPassword(args.password);

    if (args.role === "store_owner") {
      const store = await findStoreByOwnerPhone(ctx, args.phone);
      if (!store) {
        return { success: false, error: "Store not found for this phone" };
      }
      // Check user record (try normalized phone)
      const normalizedPhone = normalizePhone(args.phone);
      let user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", normalizedPhone))
        .first();
      if (!user) {
        const withSpace = normalizedPhone.replace(/^\+91/, "+91 ");
        user = await ctx.db
          .query("users")
          .withIndex("by_phone", (q) => q.eq("phone", withSpace))
          .first();
      }
      if (!user || user.passwordHash !== hash) {
        return { success: false, error: "Invalid password" };
      }
      const token = generateToken();
      await ctx.db.patch(user._id, {
        sessionToken: token,
        sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        lastLogin: Date.now(),
      });
      return { success: true, token, storeId: store.storeId, storeName: store.name, role: "store_owner" };
    }

    if (args.role === "customer") {
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (!customer || customer.passwordHash !== hash) {
        return { success: false, error: "Invalid phone or password" };
      }
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (user) {
        const token = generateToken();
        await ctx.db.patch(user._id, {
          sessionToken: token,
          sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now(),
        });
        return { success: true, token, customerId: customer._id, role: "customer" };
      }
      return { success: false, error: "User record not found" };
    }

    if (args.role === "tailor") {
      const tailor = await ctx.db
        .query("tailors")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (!tailor || tailor.passwordHash !== hash) {
        return { success: false, error: "Invalid phone or password" };
      }
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (user) {
        const token = generateToken();
        await ctx.db.patch(user._id, {
          sessionToken: token,
          sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now(),
        });
        return { success: true, token, tailorId: tailor.tailorId, role: "tailor" };
      }
      return { success: false, error: "User record not found" };
    }

    return { success: false, error: "Invalid role" };
  },
});

// Login with OTP (creates account if not exists for customer)
export const loginWithOtp = mutation({
  args: {
    phone: v.string(),
    otp: v.string(),
    role: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.otp !== "123456") {
      return { success: false, error: "Invalid OTP" };
    }

    const token = generateToken();

    if (args.role === "store_owner") {
      const store = await findStoreByOwnerPhone(ctx, args.phone);
      if (!store) {
        return { success: false, error: "No store found for this phone number" };
      }
      const normalizedPhone = normalizePhone(args.phone);
      let user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", normalizedPhone))
        .first();
      if (!user) {
        const withSpace = normalizedPhone.replace(/^\+91/, "+91 ");
        user = await ctx.db
          .query("users")
          .withIndex("by_phone", (q) => q.eq("phone", withSpace))
          .first();
      }
      if (user) {
        await ctx.db.patch(user._id, {
          sessionToken: token,
          sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now(),
        });
      } else {
        await ctx.db.insert("users", {
          phone: normalizedPhone,
          name: store.ownerName || "Store Owner",
          role: "store_owner",
          storeId: store.storeId,
          sessionToken: token,
          sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now(),
        });
      }
      return { success: true, token, storeId: store.storeId, storeName: store.name, role: "store_owner" };
    }

    if (args.role === "customer") {
      let customer = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (!customer) {
        // Auto-create customer on first OTP login
        const custName = args.name || "Customer";
        const id = await ctx.db.insert("customers", {
          phone: args.phone,
          name: custName,
          initials: custName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
          totalVisits: 0,
          totalLooks: 0,
          totalStores: 0,
          storeCredit: 0,
          loyaltyPoints: 0,
          loyaltyTier: "Regular",
          consentHistory: true,
          consentMessages: true,
          consentAiPersonal: true,
          consentPhotos: true,
          consentGrantedDate: new Date().toISOString().split("T")[0],
          language: "en",
        });
        customer = await ctx.db.get(id);
      }
      let user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (user) {
        await ctx.db.patch(user._id, {
          sessionToken: token,
          sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now(),
        });
      } else {
        await ctx.db.insert("users", {
          phone: args.phone,
          name: customer!.name,
          role: "customer",
          sessionToken: token,
          sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now(),
        });
      }
      return { success: true, token, customerId: customer!._id, role: "customer" };
    }

    if (args.role === "tailor") {
      const tailor = await ctx.db
        .query("tailors")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (!tailor) {
        return { success: false, error: "No tailor account found. Please register first." };
      }
      let user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (user) {
        await ctx.db.patch(user._id, {
          sessionToken: token,
          sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now(),
        });
      } else {
        await ctx.db.insert("users", {
          phone: args.phone,
          name: tailor.name,
          role: "tailor",
          tailorId: tailor.tailorId,
          sessionToken: token,
          sessionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
          lastLogin: Date.now(),
        });
      }
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
    const hash = await hashPassword(args.password);
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
    if (!user) {
      return { success: false, error: "User not found" };
    }
    await ctx.db.patch(user._id, { passwordHash: hash });

    // Also update password in the entity table
    if (args.role === "customer") {
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (customer) {
        await ctx.db.patch(customer._id, { passwordHash: hash });
      }
    } else if (args.role === "tailor") {
      const tailor = await ctx.db
        .query("tailors")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (tailor) {
        await ctx.db.patch(tailor._id, { passwordHash: hash });
      }
    }

    return { success: true };
  },
});

// Validate session token
export const validateSession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.token) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.token))
      .first();
    if (!user) return null;
    if (user.sessionExpiry && user.sessionExpiry < Date.now()) return null;
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

// Logout
export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.token))
      .first();
    if (user) {
      await ctx.db.patch(user._id, {
        sessionToken: undefined,
        sessionExpiry: undefined,
      });
    }
    return { success: true };
  },
});
