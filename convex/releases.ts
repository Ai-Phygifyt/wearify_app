import { query } from "./_generated/server";

export const listChangelog = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("changelog").take(20);
  },
});

export const listFestivals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("festivals").take(20);
  },
});
