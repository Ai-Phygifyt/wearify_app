import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===================== FEATURE FLAGS =====================
export const listFlags = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("featureFlags").take(50);
  },
});

export const toggleFlag = mutation({
  args: { id: v.id("featureFlags") },
  handler: async (ctx, args) => {
    const flag = await ctx.db.get(args.id);
    if (!flag) throw new Error("Flag not found");
    await ctx.db.patch(args.id, { enabled: !flag.enabled });
  },
});

// ===================== PLATFORM CONFIG =====================
export const listConfig = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("platformConfig").take(50);
  },
});

export const updateConfig = mutation({
  args: {
    id: v.id("platformConfig"),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { value: args.value });
  },
});

// ===================== AUDIT LOG =====================
export const listAuditLog = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("auditLog").order("desc").take(50);
  },
});

// ===================== NOTIFICATION RULES =====================
export const listNotificationRules = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notificationRules").take(20);
  },
});

export const toggleNotificationRule = mutation({
  args: { id: v.id("notificationRules") },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.id);
    if (!rule) throw new Error("Rule not found");
    await ctx.db.patch(args.id, { active: !rule.active });
  },
});

// ===================== WA TEMPLATES =====================
export const listWaTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("waTemplates").take(20);
  },
});

// ===================== AUDIT LOG =====================
export const addAuditEntry = mutation({
  args: {
    action: v.string(),
    user: v.string(),
    timestamp: v.optional(v.string()),
    category: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLog", {
      timestamp: args.timestamp ?? new Date().toLocaleTimeString(),
      action: args.action,
      user: args.user,
      category: args.category,
      details: args.details,
    });
  },
});
