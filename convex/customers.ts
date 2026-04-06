import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
// 3. updateProfile
// ============================
export const updateProfile = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.optional(v.string()),
    initials: v.optional(v.string()),
    phone: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { customerId, ...fields } = args;
    const updates: Record<string, string> = {};
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
