import { query } from "./_generated/server";

export const listStaff = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("staff").take(50);
  },
});

export const listRoleEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("roleEvents").take(50);
  },
});
