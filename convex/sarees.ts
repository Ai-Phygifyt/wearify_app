import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. List sarees for a store (bounded to 200)
export const listByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sarees")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .take(200);
  },
});

// 2. Get a single saree by _id
export const getById = query({
  args: { id: v.id("sarees") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// 3. Create a new saree with defaults for analytics fields
export const create = mutation({
  args: {
    storeId: v.string(),
    name: v.string(),
    type: v.string(),
    fabric: v.string(),
    occasion: v.string(),
    price: v.number(),
    mrp: v.optional(v.number()),
    stock: v.number(),
    status: v.string(),
    colors: v.array(v.string()),
    colorName: v.optional(v.string()),
    emoji: v.optional(v.string()),
    grad: v.optional(v.array(v.string())),
    tag: v.optional(v.string()),
    region: v.optional(v.string()),
    weave: v.optional(v.string()),
    weight: v.optional(v.string()),
    description: v.optional(v.string()),
    careInstructions: v.optional(v.string()),
    drapingStyles: v.optional(v.array(v.string())),
    auspiciousColors: v.optional(v.array(v.string())),
    aiTags: v.optional(v.array(v.string())),
    approvalStatus: v.optional(v.string()),
    addedBy: v.optional(v.string()),
    imageIds: v.optional(v.array(v.id("_storage"))),
    festivalDemand: v.optional(v.number()),
    reorderScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sareeId = await ctx.db.insert("sarees", {
      ...args,
      tryOns: 0,
      views: 0,
      conversions: 0,
      daysOld: 0,
      approvalStatus: args.approvalStatus ?? "pending",
    });
    return sareeId;
  },
});

// 4. Partial update a saree
export const update = mutation({
  args: {
    id: v.id("sarees"),
    storeId: v.optional(v.string()),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    fabric: v.optional(v.string()),
    occasion: v.optional(v.string()),
    price: v.optional(v.number()),
    mrp: v.optional(v.number()),
    stock: v.optional(v.number()),
    status: v.optional(v.string()),
    colors: v.optional(v.array(v.string())),
    colorName: v.optional(v.string()),
    emoji: v.optional(v.string()),
    grad: v.optional(v.array(v.string())),
    tag: v.optional(v.string()),
    region: v.optional(v.string()),
    weave: v.optional(v.string()),
    weight: v.optional(v.string()),
    description: v.optional(v.string()),
    careInstructions: v.optional(v.string()),
    drapingStyles: v.optional(v.array(v.string())),
    auspiciousColors: v.optional(v.array(v.string())),
    aiTags: v.optional(v.array(v.string())),
    tryOns: v.optional(v.number()),
    views: v.optional(v.number()),
    conversions: v.optional(v.number()),
    daysOld: v.optional(v.number()),
    approvalStatus: v.optional(v.string()),
    addedBy: v.optional(v.string()),
    imageIds: v.optional(v.array(v.id("_storage"))),
    festivalDemand: v.optional(v.number()),
    reorderScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    // Remove undefined fields so patch only updates provided values
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

// 5. Delete a saree
export const remove = mutation({
  args: { id: v.id("sarees") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// 6. Update stock level and auto-set status
export const updateStock = mutation({
  args: {
    id: v.id("sarees"),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    let status: string;
    if (args.stock <= 0) {
      status = "out_of_stock";
    } else if (args.stock <= 5) {
      status = "low_stock";
    } else {
      status = "active";
    }
    await ctx.db.patch(args.id, {
      stock: args.stock,
      status,
    });
  },
});

// 7. List sarees by storeId + occasion
export const listByOccasion = query({
  args: {
    storeId: v.string(),
    occasion: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sarees")
      .withIndex("by_storeId_and_occasion", (q) =>
        q.eq("storeId", args.storeId).eq("occasion", args.occasion)
      )
      .take(200);
  },
});

// 8. List sarees by storeId + fabric
export const listByFabric = query({
  args: {
    storeId: v.string(),
    fabric: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sarees")
      .withIndex("by_storeId_and_fabric", (q) =>
        q.eq("storeId", args.storeId).eq("fabric", args.fabric)
      )
      .take(200);
  },
});

// 9. List sarees pending approval
export const listPendingApproval = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sarees")
      .withIndex("by_approvalStatus", (q) =>
        q.eq("approvalStatus", "pending")
      )
      .take(200);
  },
});

// 10. Approve, reject (delete), or send for corrections
export const approveOrReject = mutation({
  args: {
    id: v.id("sarees"),
    approvalStatus: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("corrections")
    ),
    rejectionReason: v.optional(v.string()),
    correctionNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.approvalStatus === "rejected") {
      // Delete the saree on rejection — removed from catalog
      await ctx.db.delete(args.id);
      return;
    }
    const patch: Record<string, unknown> = {
      approvalStatus: args.approvalStatus,
    };
    if (args.approvalStatus === "corrections" && args.correctionNote) {
      patch.correctionNote = args.correctionNote;
    }
    if (args.approvalStatus === "approved") {
      // Clear any old correction notes on approval
      patch.correctionNote = undefined;
    }
    await ctx.db.patch(args.id, patch);
  },
});

// List sarees sent back for corrections
export const listCorrections = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("sarees")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .take(200);
    return all.filter((s) => s.approvalStatus === "corrections");
  },
});

// 11. Increment views count
export const incrementViews = mutation({
  args: { id: v.id("sarees") },
  handler: async (ctx, args) => {
    const saree = await ctx.db.get(args.id);
    if (!saree) {
      throw new Error("Saree not found");
    }
    await ctx.db.patch(args.id, {
      views: (saree.views ?? 0) + 1,
    });
  },
});

// 12. Increment tryOns count
export const incrementTryOns = mutation({
  args: { id: v.id("sarees") },
  handler: async (ctx, args) => {
    const saree = await ctx.db.get(args.id);
    if (!saree) {
      throw new Error("Saree not found");
    }
    await ctx.db.patch(args.id, {
      tryOns: (saree.tryOns ?? 0) + 1,
    });
  },
});

// 13. Search sarees by name/type/fabric (in-memory filter on bounded set)
export const search = query({
  args: {
    storeId: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const sarees = await ctx.db
      .query("sarees")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .take(200);

    const term = args.searchTerm.toLowerCase();
    return sarees.filter((saree) => {
      const name = saree.name.toLowerCase();
      const type = saree.type.toLowerCase();
      const fabric = saree.fabric.toLowerCase();
      return name.includes(term) || type.includes(term) || fabric.includes(term);
    });
  },
});
