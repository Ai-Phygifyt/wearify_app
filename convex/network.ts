import { query } from "./_generated/server";

export const listTailors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tailors").take(20);
  },
});

export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sessions").take(50);
  },
});
