import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ============================
// Loyalty tier helper
// ============================
function computeTier(points: number): string {
  if (points >= 15000) return "VIP";
  if (points >= 5000) return "Gold";
  if (points >= 1000) return "Silver";
  return "Regular";
}

// ============================
// Shared helpers (used by phoneAuth and tablet/kiosk creation flows)
// ============================
export function computeInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
}

/**
 * Idempotent: returns an existing customer by phone, or creates a stub
 * with minimal safe defaults. Centralizes customer creation so every
 * surface (OTP login, tablet register, kiosk first-time) produces
 * consistent records.
 *
 * Pass only what you have — the customer will fill the rest on /c/onboard.
 * Stored fields reflect current knowledge; profileComplete stays false
 * until name, DOB, height, and gender are all populated.
 */
export async function ensureCustomerByPhone(
  ctx: MutationCtx,
  phone: string,
  opts?: {
    name?: string;
    dateOfBirth?: string;
    language?: string;
  }
): Promise<{ customerId: Id<"customers">; created: boolean; profileComplete: boolean }> {
  const existing = await ctx.db
    .query("customers")
    .withIndex("by_phone", (q) => q.eq("phone", phone))
    .unique();
  if (existing) {
    // Backfill name/DOB/language if provided and missing — never overwrite known values
    const patch: Record<string, unknown> = {};
    if (opts?.name && (!existing.name || existing.name === "Customer")) {
      patch.name = opts.name;
      patch.initials = computeInitials(opts.name);
    }
    if (opts?.dateOfBirth && !existing.dateOfBirth) patch.dateOfBirth = opts.dateOfBirth;
    if (opts?.language && !existing.language) patch.language = opts.language;
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(existing._id, patch);
    }
    const merged = { ...existing, ...patch };
    return {
      customerId: existing._id,
      created: false,
      profileComplete: !!merged.profileComplete,
    };
  }
  const name = opts?.name?.trim() || "";
  const today = new Date().toISOString().split("T")[0];
  const customerId = await ctx.db.insert("customers", {
    phone,
    name: name || "Guest",
    initials: computeInitials(name || "Guest"),
    dateOfBirth: opts?.dateOfBirth,
    language: opts?.language || "en",
    profileComplete: false,
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
    consentGrantedDate: today,
  });
  return { customerId, created: true, profileComplete: false };
}

// ============================
// 1. getByPhone
// ============================
export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();
  },
});

// ============================
// 2. getById
// ============================
export const getById = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.customerId);
  },
});

// ============================
// 2b. ensureByPhone — public wrapper, used by kiosk/tablet to create a
// customer record without opening a login session. Idempotent.
// ============================
export const ensureByPhone = mutation({
  args: {
    phone: v.string(),
    name: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ensureCustomerByPhone(ctx, args.phone, {
      name: args.name,
      dateOfBirth: args.dateOfBirth,
      language: args.language,
    });
    return result;
  },
});

// ============================
// 3. updateProfile — partial updates from /c/me/preferences
// ============================
export const updateProfile = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.optional(v.string()),
    initials: v.optional(v.string()),
    phone: v.optional(v.string()),
    language: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    heightCm: v.optional(v.number()),
    heightUnit: v.optional(v.string()),
    email: v.optional(v.string()),
    city: v.optional(v.string()),
    photoFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { customerId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    // Recompute profileComplete if any gating field changed
    if (Object.keys(updates).length > 0) {
      const existing = await ctx.db.get(customerId);
      if (existing) {
        const merged = { ...existing, ...updates };
        updates.profileComplete = isProfileComplete(merged);
      }
      await ctx.db.patch(customerId, updates);
    }
  },
});

function isProfileComplete(c: {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  heightCm?: number;
  city?: string;
}): boolean {
  return !!(
    c.name &&
    c.name !== "Guest" &&
    c.name !== "Customer" &&
    c.dateOfBirth &&
    c.gender &&
    typeof c.heightCm === "number" &&
    c.heightCm > 0 &&
    c.city
  );
}

// ============================
// 3b. completeProfile — full onboarding save from /c/onboard
// ============================
export const completeProfile = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.string(),
    dateOfBirth: v.string(), // ISO YYYY-MM-DD, required at onboarding
    gender: v.string(),
    heightCm: v.number(),
    heightUnit: v.optional(v.string()),
    city: v.string(),
    email: v.optional(v.string()),
    photoFileId: v.optional(v.id("_storage")),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("Customer not found");
    const name = args.name.trim();
    if (!name) throw new Error("Name is required");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.dateOfBirth)) {
      throw new Error("Invalid date of birth");
    }
    if (args.heightCm < 50 || args.heightCm > 250) {
      throw new Error("Height must be between 50 and 250 cm");
    }
    await ctx.db.patch(args.customerId, {
      name,
      initials: computeInitials(name),
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      heightCm: args.heightCm,
      heightUnit: args.heightUnit ?? "cm",
      city: args.city.trim(),
      email: args.email?.trim() || undefined,
      photoFileId: args.photoFileId,
      language: args.language ?? customer.language ?? "en",
      profileComplete: true,
    });
    return { success: true };
  },
});

// ============================
// 4. updatePreferences
// ============================
export const updatePreferences = mutation({
  args: {
    customerId: v.id("customers"),
    preferredOccasions: v.optional(v.array(v.string())),
    preferredFabrics: v.optional(v.array(v.string())),
    preferredColors: v.optional(v.array(v.string())),
    budgetRange: v.optional(v.string()),
    upcomingOccasion: v.optional(v.string()),
    upcomingOccasionDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { customerId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(customerId, updates);
    }
  },
});

// ============================
// 5. updateConsent
// ============================
export const updateConsent = mutation({
  args: {
    customerId: v.id("customers"),
    consentHistory: v.optional(v.boolean()),
    consentMessages: v.optional(v.boolean()),
    consentAiPersonal: v.optional(v.boolean()),
    consentPhotos: v.optional(v.boolean()),
    consentGrantedDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { customerId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(customerId, updates);
    }
  },
});

// ============================
// 6. updateMeasurements
// ============================
export const updateMeasurements = mutation({
  args: {
    customerId: v.id("customers"),
    bust: v.optional(v.string()),
    waist: v.optional(v.string()),
    shoulder: v.optional(v.string()),
    armLength: v.optional(v.string()),
    backLength: v.optional(v.string()),
    neckDepthFront: v.optional(v.string()),
    neckDepthBack: v.optional(v.string()),
    sleeve: v.optional(v.string()),
    neck: v.optional(v.string()),
    measurementFabric: v.optional(v.string()),
    measurementDate: v.optional(v.string()),
    lastBodyScan: v.optional(v.number()),
    bodyScanFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { customerId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(customerId, updates);
    }
  },
});

// ============================
// 7. listStoreLinks
// ============================
export const listStoreLinks = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerStoreLinks")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .take(200);
  },
});

// ============================
// 8. getStoreLink
// ============================
export const getStoreLink = query({
  args: {
    customerId: v.id("customers"),
    storeId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerStoreLinks")
      .withIndex("by_customerId_and_storeId", (q) =>
        q.eq("customerId", args.customerId).eq("storeId", args.storeId)
      )
      .unique();
  },
});

// ============================
// 9. upsertStoreLink
// ============================
export const upsertStoreLink = mutation({
  args: {
    customerId: v.id("customers"),
    storeId: v.string(),
    storeName: v.optional(v.string()),
    visits: v.optional(v.number()),
    lastVisit: v.optional(v.string()),
    clv: v.optional(v.number()),
    segment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customerStoreLinks")
      .withIndex("by_customerId_and_storeId", (q) =>
        q.eq("customerId", args.customerId).eq("storeId", args.storeId)
      )
      .unique();

    if (existing) {
      const { customerId: _cId, storeId: _sId, ...fields } = args;
      const updates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          updates[key] = value;
        }
      }
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates);
      }
      return existing._id;
    } else {
      return await ctx.db.insert("customerStoreLinks", {
        customerId: args.customerId,
        storeId: args.storeId,
        storeName: args.storeName,
        visits: args.visits ?? 0,
        lastVisit: args.lastVisit,
        clv: args.clv ?? 0,
        segment: args.segment ?? "New",
      });
    }
  },
});

// ============================
// 10. listByStore
// ============================
export const listByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerStoreLinks")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .take(200);
  },
});

// ============================
// 11. addToWishlist
// ============================
export const addToWishlist = mutation({
  args: {
    customerId: v.id("customers"),
    sareeId: v.id("sarees"),
    storeId: v.string(),
    sareeName: v.string(),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wishlist", {
      customerId: args.customerId,
      sareeId: args.sareeId,
      storeId: args.storeId,
      sareeName: args.sareeName,
      price: args.price,
      addedAt: Date.now(),
    });
  },
});

// ============================
// 12. removeFromWishlist
// ============================
export const removeFromWishlist = mutation({
  args: { wishlistId: v.id("wishlist") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.wishlistId);
  },
});

// ============================
// 13. getWishlist
// ============================
export const getWishlist = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wishlist")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .take(200);
  },
});

// ============================
// 14. listVisitHistory
// ============================
export const listVisitHistory = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("visitHistory")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .take(200);
  },
});

// ============================
// 15. addVisit
// ============================
export const addVisit = mutation({
  args: {
    customerId: v.id("customers"),
    storeId: v.string(),
    storeName: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    date: v.string(),
    sareesTried: v.optional(v.number()),
    purchased: v.optional(v.boolean()),
    staffName: v.optional(v.string()),
    pointsEarned: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Insert visit history record
    const visitId = await ctx.db.insert("visitHistory", {
      customerId: args.customerId,
      storeId: args.storeId,
      storeName: args.storeName,
      sessionId: args.sessionId,
      date: args.date,
      sareesTried: args.sareesTried,
      purchased: args.purchased,
      staffName: args.staffName,
      pointsEarned: args.pointsEarned,
    });

    // Update customerStoreLink visits
    const link = await ctx.db
      .query("customerStoreLinks")
      .withIndex("by_customerId_and_storeId", (q) =>
        q.eq("customerId", args.customerId).eq("storeId", args.storeId)
      )
      .unique();

    if (link) {
      await ctx.db.patch(link._id, {
        visits: (link.visits ?? 0) + 1,
        lastVisit: args.date,
      });
    }

    // Update customer totalVisits
    const customer = await ctx.db.get(args.customerId);
    if (customer) {
      await ctx.db.patch(args.customerId, {
        totalVisits: (customer.totalVisits ?? 0) + 1,
      });
    }

    return visitId;
  },
});

// ============================
// 16. getLoyaltyTransactions
// ============================
export const getLoyaltyTransactions = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .take(200);
  },
});

// ============================
// 17. addLoyaltyPoints
// ============================
export const addLoyaltyPoints = mutation({
  args: {
    customerId: v.id("customers"),
    storeId: v.optional(v.string()),
    points: v.number(),
    reason: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Create earn transaction
    await ctx.db.insert("loyaltyTransactions", {
      customerId: args.customerId,
      storeId: args.storeId,
      type: "earn",
      points: args.points,
      reason: args.reason,
      date: args.date,
    });

    // Update customer loyalty points and tier
    const customer = await ctx.db.get(args.customerId);
    if (customer) {
      const newPoints = (customer.loyaltyPoints ?? 0) + args.points;
      await ctx.db.patch(args.customerId, {
        loyaltyPoints: newPoints,
        loyaltyTier: computeTier(newPoints),
      });
    }
  },
});

// ============================
// 18. redeemPoints
// ============================
export const redeemPoints = mutation({
  args: {
    customerId: v.id("customers"),
    storeId: v.optional(v.string()),
    points: v.number(),
    reason: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const currentPoints = customer.loyaltyPoints ?? 0;
    if (currentPoints < args.points) {
      throw new Error("Insufficient loyalty points");
    }

    // Create redeem transaction
    await ctx.db.insert("loyaltyTransactions", {
      customerId: args.customerId,
      storeId: args.storeId,
      type: "redeem",
      points: args.points,
      reason: args.reason,
      date: args.date,
    });

    // Deduct points and update tier
    const newPoints = currentPoints - args.points;
    await ctx.db.patch(args.customerId, {
      loyaltyPoints: newPoints,
      loyaltyTier: computeTier(newPoints),
    });
  },
});

// ============================
// 19. createReferral
// ============================
export const createReferral = mutation({
  args: {
    referrerId: v.id("customers"),
    referrerPhone: v.string(),
    referredName: v.string(),
    referredPhone: v.optional(v.string()),
    status: v.string(),
    reward: v.optional(v.number()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("customerReferrals", {
      referrerId: args.referrerId,
      referrerPhone: args.referrerPhone,
      referredName: args.referredName,
      referredPhone: args.referredPhone,
      status: args.status,
      reward: args.reward,
      date: args.date,
    });
  },
});

// ============================
// 20. listReferrals
// ============================
export const listReferrals = query({
  args: { referrerId: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerReferrals")
      .withIndex("by_referrerId", (q) => q.eq("referrerId", args.referrerId))
      .order("desc")
      .take(200);
  },
});

// ============================
// 21. submitFeedback
// ============================
export const submitFeedback = mutation({
  args: {
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    storeId: v.string(),
    sessionId: v.optional(v.string()),
    rating: v.number(),
    chips: v.optional(v.array(v.string())),
    comment: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("feedback", {
      customerId: args.customerId,
      customerPhone: args.customerPhone,
      storeId: args.storeId,
      sessionId: args.sessionId,
      rating: args.rating,
      chips: args.chips,
      comment: args.comment,
      date: args.date,
    });
  },
});

// ============================
// 22. listFeedbackByStore
// ============================
export const listFeedbackByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(200);
  },
});

// ============================
// 23. updateNotifPrefs
// ============================
export const updateNotifPrefs = mutation({
  args: {
    customerId: v.id("customers"),
    notifTryOn: v.optional(v.boolean()),
    notifThankYou: v.optional(v.boolean()),
    notifFestivals: v.optional(v.boolean()),
    notifNewArrivals: v.optional(v.boolean()),
    notifBirthday: v.optional(v.boolean()),
    notifReengagement: v.optional(v.boolean()),
    notifyTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { customerId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(customerId, updates);
    }
  },
});

// ============================
// Offers for customer's stores
// ============================
export const listOffersForCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("customerStoreLinks")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .take(20);
    const storeIds = links.map((l) => l.storeId);
    const allOffers = [];
    for (const storeId of storeIds) {
      const offers = await ctx.db
        .query("offers")
        .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
        .take(10);
      allOffers.push(...offers);
    }
    return allOffers;
  },
});

// ============================
// New arrivals across customer's stores
// ============================
export const listNewArrivalsForCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("customerStoreLinks")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .take(20);
    const storeIds = links.map((l) => l.storeId);
    const result: Record<string, { storeId: string; storeName: string; sarees: unknown[] }> = {};
    for (const storeId of storeIds) {
      const sarees = await ctx.db
        .query("sarees")
        .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
        .order("desc")
        .take(20);
      const recent = sarees.filter(
        (s) => s.status === "active" && (s.daysOld === undefined || s.daysOld <= 30)
      );
      if (recent.length > 0) {
        const link = links.find((l) => l.storeId === storeId);
        result[storeId] = {
          storeId,
          storeName: link?.storeName || storeId,
          sarees: recent.slice(0, 6),
        };
      }
    }
    return result;
  },
});

// ============================
// Get enriched store links with store data
// ============================
export const listStoreLinksEnriched = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("customerStoreLinks")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .take(20);
    const enriched = [];
    for (const link of links) {
      const store = await ctx.db
        .query("stores")
        .withIndex("by_storeId", (q) => q.eq("storeId", link.storeId))
        .first();
      enriched.push({
        ...link,
        storeName: store?.name || link.storeName || link.storeId,
        storeCity: store?.city || "",
        storeState: store?.state || "",
        storeAddress: store?.address || "",
        storeHours: store?.hours || "",
        storeClosedOn: store?.closedOn || "",
        storePhone: store?.ownerPhone || "",
        storeWhatsapp: store?.whatsappNumber || "",
      });
    }
    return enriched;
  },
});
