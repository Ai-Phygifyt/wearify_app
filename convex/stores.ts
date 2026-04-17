import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stores").order("asc").take(100);
  },
});

export const getByStoreId = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stores")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .unique();
  },
});

export const get = query({
  args: { id: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").take(100);
    const active = stores.filter((s) => s.status === "active").length;
    const trial = stores.filter((s) => s.status === "trial").length;
    const churned = stores.filter((s) => s.status === "churned").length;
    const avgHealth =
      stores.filter((s) => s.status !== "churned").length > 0
        ? Math.round(
            stores
              .filter((s) => s.status !== "churned")
              .reduce((acc, s) => acc + s.healthScore, 0) /
              stores.filter((s) => s.status !== "churned").length
          )
        : 0;
    const totalMrr = stores.reduce((acc, s) => acc + s.mrr, 0);

    return { total: stores.length, active, trial, churned, avgHealth, totalMrr };
  },
});

export const create = mutation({
  args: {
    storeId: v.string(),
    name: v.string(),
    city: v.string(),
    state: v.optional(v.string()),
    address: v.optional(v.string()),
    pin: v.optional(v.string()),
    status: v.string(),
    plan: v.string(),
    mrr: v.number(),
    ownerName: v.optional(v.string()),
    ownerPhone: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    gstin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stores", {
      ...args,
      healthScore: 0,
      conversionRate: 0,
      sessions: 0,
      churnRisk: 0,
      featureScore: 0,
      catalogUtilization: 0,
      agreementStatus: "pending",
      onboardingStep: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("stores"),
    name: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    address: v.optional(v.string()),
    pin: v.optional(v.string()),
    area: v.optional(v.string()),
    hours: v.optional(v.string()),
    closedOn: v.optional(v.string()),
    status: v.optional(v.string()),
    plan: v.optional(v.string()),
    mrr: v.optional(v.number()),
    healthScore: v.optional(v.number()),
    onboardingStep: v.optional(v.number()),
    agreementStatus: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    essentialMode: v.optional(v.boolean()),
    subscriptionPlan: v.optional(v.string()),
    nextBillingDate: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    notifyWhatsApp: v.optional(v.boolean()),
    notifyEmail: v.optional(v.boolean()),
    notifySms: v.optional(v.boolean()),
    logoFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

// ============================
// STAFF MANAGEMENT
// ============================
export const listStaffByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("staff")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .take(100);
  },
});

export const createStaff = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    pin: v.string(),
    role: v.string(),
    storeId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("staff", {
      name: args.name,
      phone: args.phone,
      pin: args.pin,
      role: args.role,
      storeId: args.storeId,
      status: "active",
      totalSales: 0,
      conversion: 0,
      sessionCount: 0,
      revenue: 0,
    });
    return id;
  },
});

export const updateStaff = mutation({
  args: {
    id: v.id("staff"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    pin: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(id, updates);
    }
  },
});

export const removeStaff = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============================
// FULL STORE REMOVAL (cascading delete across all related tables)
// This is the single canonical place that knows every table referencing storeId.
// Any new table with storeId must be added here.
// ============================
async function deleteStoreData(ctx: MutationCtx, storeId: string): Promise<number> {
  let deleted = 0;

  // Helper: delete all docs from an indexed query
  async function deleteByIndex<T extends { _id: any }>(
    query: Promise<T[]>
  ) {
    const docs = await query;
    for (const doc of docs) {
      await ctx.db.delete(doc._id);
      deleted++;
    }
  }

  // Helper: delete from tables without a by_storeId index (scan + filter)
  async function deleteByFilter(
    table: "wishlist" | "loyaltyTransactions" | "tailorReferrals" | "tailorOrders",
    limit: number
  ) {
    const docs = await ctx.db.query(table).take(limit);
    for (const doc of docs) {
      if ((doc as any).storeId === storeId) {
        await ctx.db.delete(doc._id);
        deleted++;
      }
    }
  }

  // 1. Store record itself
  const store = await ctx.db
    .query("stores")
    .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
    .first();
  if (store) {
    await ctx.db.delete(store._id);
    deleted++;
  }

  // 2. Users linked to this store (store_owner/staff)
  const users = await ctx.db.query("users").take(500);
  for (const u of users) {
    if (u.storeId === storeId) {
      await ctx.db.delete(u._id);
      deleted++;
    }
  }

  // 3. Staff
  await deleteByIndex(
    ctx.db.query("staff").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(200)
  );

  // 4. Sarees (catalog)
  await deleteByIndex(
    ctx.db.query("sarees").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(500)
  );

  // 5. Customer-store links
  await deleteByIndex(
    ctx.db.query("customerStoreLinks").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(500)
  );

  // 6. Sessions + their child records (shortlist, wardrobe)
  const sessions = await ctx.db
    .query("sessions")
    .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
    .take(500);
  for (const s of sessions) {
    await deleteByIndex(
      ctx.db.query("shortlist").withIndex("by_sessionId", (q) => q.eq("sessionId", s.sessionId)).take(200)
    );
    await deleteByIndex(
      ctx.db.query("wardrobe").withIndex("by_sessionId", (q) => q.eq("sessionId", s.sessionId)).take(200)
    );
    await ctx.db.delete(s._id);
    deleted++;
  }

  // 7. Looks
  await deleteByIndex(
    ctx.db.query("looks").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(500)
  );

  // 8. Visit history
  await deleteByIndex(
    ctx.db.query("visitHistory").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(500)
  );

  // 9. Offers
  await deleteByIndex(
    ctx.db.query("offers").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(200)
  );

  // 10. Feedback
  await deleteByIndex(
    ctx.db.query("feedback").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(500)
  );

  // 11. Campaigns
  await deleteByIndex(
    ctx.db.query("campaigns").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(200)
  );

  // 12. Customer segments
  await deleteByIndex(
    ctx.db.query("customerSegments").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(200)
  );

  // 13. Orders
  await deleteByIndex(
    ctx.db.query("orders").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(500)
  );

  // 14. Devices
  await deleteByIndex(
    ctx.db.query("devices").withIndex("by_storeId", (q) => q.eq("storeId", storeId)).take(100)
  );

  // 15-17. Tables with optional storeId (no index)
  await deleteByFilter("wishlist", 1000);
  await deleteByFilter("loyaltyTransactions", 1000);
  await deleteByFilter("tailorReferrals", 500);
  await deleteByFilter("tailorOrders", 500);

  return deleted;
}

// Internal mutation: remove one store by storeId
export const removeStore = internalMutation({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const deleted = await deleteStoreData(ctx, args.storeId);
    return { deleted, storeId: args.storeId };
  },
});

// Internal mutation: remove multiple stores at once
export const removeStores = internalMutation({
  args: { storeIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    let totalDeleted = 0;
    for (const storeId of args.storeIds) {
      totalDeleted += await deleteStoreData(ctx, storeId);
    }
    return { deleted: totalDeleted, stores: args.storeIds };
  },
});
