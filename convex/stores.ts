import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
    status: v.optional(v.string()),
    plan: v.optional(v.string()),
    mrr: v.optional(v.number()),
    healthScore: v.optional(v.number()),
    onboardingStep: v.optional(v.number()),
    agreementStatus: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    essentialMode: v.optional(v.boolean()),
    subscriptionPlan: v.optional(v.string()),
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
