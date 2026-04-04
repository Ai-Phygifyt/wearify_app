import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").take(20);
  },
});

export const getByAgentId = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .unique();
  },
});

export const updateMode = mutation({
  args: {
    id: v.id("agents"),
    mode: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, string> = { mode: args.mode };
    if (args.status) updates.status = args.status;
    await ctx.db.patch(args.id, updates);
  },
});

export const listTools = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agentTools").take(20);
  },
});
