import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================
// CAMPAIGNS
// ============================

export const createCampaign = mutation({
  args: {
    storeId: v.string(),
    name: v.string(),
    template: v.optional(v.string()),
    channel: v.string(),
    segment: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    status: v.optional(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("campaigns", {
      storeId: args.storeId,
      name: args.name,
      template: args.template,
      channel: args.channel,
      segment: args.segment,
      scheduledDate: args.scheduledDate,
      status: args.status ?? "draft",
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      revenue: 0,
      createdAt: args.createdAt,
    });
    return id;
  },
});

export const listCampaignsByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(50);
  },
});

export const getCampaign = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    name: v.optional(v.string()),
    template: v.optional(v.string()),
    channel: v.optional(v.string()),
    segment: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    status: v.optional(v.string()),
    sent: v.optional(v.number()),
    delivered: v.optional(v.number()),
    opened: v.optional(v.number()),
    clicked: v.optional(v.number()),
    revenue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const fields: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    if (Object.keys(fields).length > 0) {
      await ctx.db.patch(id, fields);
    }
  },
});

export const sendCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    sentCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "sent",
      sent: args.sentCount,
    });
  },
});

export const deleteCampaign = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============================
// OFFERS
// ============================

export const createOffer = mutation({
  args: {
    storeId: v.string(),
    type: v.string(),
    headline: v.string(),
    subline: v.optional(v.string()),
    badge: v.optional(v.string()),
    cta: v.optional(v.string()),
    expiry: v.optional(v.string()),
    grad: v.optional(v.array(v.string())),
    icon: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("offers", {
      storeId: args.storeId,
      type: args.type,
      headline: args.headline,
      subline: args.subline,
      badge: args.badge,
      cta: args.cta,
      expiry: args.expiry,
      grad: args.grad,
      icon: args.icon,
      active: args.active ?? true,
    });
    return id;
  },
});

export const listOffersByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("offers")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(20);
  },
});

export const updateOffer = mutation({
  args: {
    id: v.id("offers"),
    type: v.optional(v.string()),
    headline: v.optional(v.string()),
    subline: v.optional(v.string()),
    badge: v.optional(v.string()),
    cta: v.optional(v.string()),
    expiry: v.optional(v.string()),
    grad: v.optional(v.array(v.string())),
    icon: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const fields: Record<string, string | boolean | string[]> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    if (Object.keys(fields).length > 0) {
      await ctx.db.patch(id, fields);
    }
  },
});

export const deleteOffer = mutation({
  args: { id: v.id("offers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const listActiveOffersByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const allOffers = await ctx.db
      .query("offers")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(100);
    return allOffers.filter((offer) => offer.active === true);
  },
});

// ============================
// CUSTOMER SEGMENTS
// ============================

export const createSegment = mutation({
  args: {
    storeId: v.string(),
    name: v.string(),
    criteria: v.string(),
    customerCount: v.optional(v.number()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("customerSegments", {
      storeId: args.storeId,
      name: args.name,
      criteria: args.criteria,
      customerCount: args.customerCount,
      createdAt: args.createdAt,
    });
    return id;
  },
});

export const listSegmentsByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerSegments")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(50);
  },
});

export const updateSegment = mutation({
  args: {
    id: v.id("customerSegments"),
    name: v.optional(v.string()),
    criteria: v.optional(v.string()),
    customerCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const fields: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    if (Object.keys(fields).length > 0) {
      await ctx.db.patch(id, fields);
    }
  },
});

export const deleteSegment = mutation({
  args: { id: v.id("customerSegments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
