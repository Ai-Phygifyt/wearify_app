import { query } from "./_generated/server";

export const listInvoices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("invoices").take(50);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").take(50);
    const paid = invoices.filter((i) => i.status === "paid");
    const totalRevenue = paid.reduce((acc, i) => acc + i.total, 0);
    const totalGst = paid.reduce((acc, i) => acc + i.gst, 0);
    const pending = invoices.filter((i) => i.status === "pending").length;
    const overdue = invoices.filter((i) => i.status === "overdue").length;

    return { totalRevenue, totalGst, paid: paid.length, pending, overdue, total: invoices.length };
  },
});
