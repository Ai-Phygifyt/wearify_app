import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listTickets = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tickets").take(50);
  },
});

export const updateTicketStatus = mutation({
  args: {
    id: v.id("tickets"),
    status: v.string(),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const listKbArticles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("kbArticles").take(20);
  },
});
