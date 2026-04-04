import { query } from "./_generated/server";

export const listIncidents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("incidents").take(20);
  },
});

export const listOnCall = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("onCallRotation").take(10);
  },
});
