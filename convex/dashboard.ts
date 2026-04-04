import { query } from "./_generated/server";

export const listAgents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").take(20);
  },
});

export const listTickets = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tickets").take(50);
  },
});

export const listVendors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vendors").take(20);
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").take(100);
    const devices = await ctx.db.query("devices").take(50);
    const agents = await ctx.db.query("agents").take(20);
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .take(50);

    const activeStores = stores.filter((s) => s.status !== "churned");
    const totalMrr = stores.reduce((acc, s) => acc + s.mrr, 0);
    const avgUptime =
      devices.length > 0
        ? (
            devices.reduce((acc, d) => acc + d.uptime, 0) / devices.length
          ).toFixed(1)
        : "0";
    const runningAgents = agents.filter((a) => a.status === "running").length;
    const totalAgents = agents.length;
    const agentCost = agents.reduce((acc, a) => acc + a.costPerDay, 0);
    const churnRiskStores = activeStores.filter((s) => s.churnRisk > 30).length;

    return {
      storeCount: stores.length,
      activeStoreCount: activeStores.length,
      totalMrr,
      avgUptime,
      openTickets: tickets.length,
      p1Tickets: tickets.filter((t) => t.priority === "P1").length,
      runningAgents,
      totalAgents,
      agentCost,
      churnRiskStores,
    };
  },
});
