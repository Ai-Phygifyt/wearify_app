import { query } from "./_generated/server";

export const listDocs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("legalDocs").take(20);
  },
});
