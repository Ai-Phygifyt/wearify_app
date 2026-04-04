import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("devices").order("asc").take(50);
  },
});

export const getByDeviceId = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("devices")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .unique();
  },
});

export const getByStoreId = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const devices = await ctx.db
      .query("devices")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .take(20);
    return devices;
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const devices = await ctx.db.query("devices").take(50);
    const online = devices.filter((d) => d.status === "online").length;
    const offline = devices.filter((d) => d.status === "offline").length;
    const mirrors = devices.filter((d) => d.type === "Mirror").length;
    const tablets = devices.filter((d) => d.type === "Tablet").length;
    const avgGpu =
      devices.filter((d) => d.gpuLatency > 0).length > 0
        ? Math.round(
            devices
              .filter((d) => d.gpuLatency > 0)
              .reduce((acc, d) => acc + d.gpuLatency, 0) /
              devices.filter((d) => d.gpuLatency > 0).length
          )
        : 0;

    return { total: devices.length, online, offline, mirrors, tablets, avgGpu };
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("devices"),
    status: v.string(),
    lifecycle: v.optional(v.string()),
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
