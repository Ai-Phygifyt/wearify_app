import { query, mutation, internalQuery, internalMutation, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// ============================
// CAMPAIGNS
// ============================

export const createCampaign = mutation({
  args: {
    storeId: v.string(),
    name: v.string(),
    template: v.optional(v.string()),
    channel: v.string(),
    segment: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    status: v.optional(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("campaigns", {
      storeId: args.storeId,
      name: args.name,
      template: args.template,
      channel: args.channel,
      segment: args.segment,
      scheduledDate: args.scheduledDate,
      status: args.status ?? "draft",
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      revenue: 0,
      createdAt: args.createdAt,
    });
    return id;
  },
});

export const listCampaignsByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(50);
  },
});

export const getCampaign = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    name: v.optional(v.string()),
    template: v.optional(v.string()),
    channel: v.optional(v.string()),
    segment: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
    status: v.optional(v.string()),
    sent: v.optional(v.number()),
    delivered: v.optional(v.number()),
    opened: v.optional(v.number()),
    clicked: v.optional(v.number()),
    revenue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const fields: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    if (Object.keys(fields).length > 0) {
      await ctx.db.patch(id, fields);
    }
  },
});

export const sendCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    sentCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "sent",
      sent: args.sentCount,
    });
  },
});

export const deleteCampaign = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============================
// CAMPAIGN DISPATCH PIPELINE
// ============================
//
// Flow: UI calls dispatchCampaign (action) → resolves recipients via segment →
// per recipient, attempts external send (if provider keys set) else records
// "simulated" → writes a campaignSends row → updates campaign totals.
//
// No provider keys are required to test this end-to-end in demo mode; every
// send becomes a "simulated" campaignSends row. To wire a real provider,
// set one of these env vars in the Convex deployment:
//   SENDGRID_API_KEY + SENDGRID_FROM  — for email
//   TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM — for whatsapp
//   TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_SMS_FROM — for sms
//
// Idempotency: dispatchCampaign refuses to run if campaign.status === "sent".

export const _getCampaign = internalQuery({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Resolve recipients for a campaign. Walks customerStoreLinks for the store,
// filters by segment (case-insensitive) if one is set on the campaign, then
// hydrates customer rows for contact info.
export const _resolveRecipients = internalQuery({
  args: { storeId: v.string(), segment: v.optional(v.string()), channel: v.string() },
  handler: async (ctx, args) => {
    const wantSeg = args.segment?.trim().toLowerCase();
    const links = await ctx.db
      .query("customerStoreLinks")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();
    const matching = wantSeg && wantSeg !== "all"
      ? links.filter((l) => (l.segment ?? "").toLowerCase() === wantSeg)
      : links;
    const out: Array<{
      customerId: Id<"customers">; name: string; phone?: string; email?: string;
    }> = [];
    for (const link of matching) {
      const c = await ctx.db.get(link.customerId);
      if (!c) continue;
      out.push({
        customerId: c._id,
        name: c.name,
        phone: c.phone,
        email: c.email,
      });
    }
    return out;
  },
});

export const _writeSend = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    storeId: v.string(),
    customerId: v.optional(v.id("customers")),
    channel: v.string(),
    recipient: v.string(),
    status: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("campaignSends", {
      campaignId: args.campaignId,
      storeId: args.storeId,
      customerId: args.customerId,
      channel: args.channel,
      recipient: args.recipient,
      status: args.status,
      error: args.error,
      sentAt: Date.now(),
    });
  },
});

export const _markCampaignSent = internalMutation({
  args: {
    id: v.id("campaigns"),
    sent: v.number(),
    delivered: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "sent",
      sent: args.sent,
      delivered: args.delivered,
      scheduledDate: new Date().toISOString(),
    });
  },
});

// Template substitution — minimal: {name}, {store}.
function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

type SendOutcome = { status: "sent" | "simulated" | "failed"; error?: string };

async function sendEmail(to: string, subject: string, body: string): Promise<SendOutcome> {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM;
  if (!key || !from) return { status: "simulated" };
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{ type: "text/plain", value: body }],
      }),
    });
    if (!res.ok) return { status: "failed", error: `sendgrid ${res.status}` };
    return { status: "sent" };
  } catch (e) {
    return { status: "failed", error: e instanceof Error ? e.message : "sendgrid error" };
  }
}

async function sendTwilio(channel: "whatsapp" | "sms", to: string, body: string): Promise<SendOutcome> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = channel === "whatsapp"
    ? process.env.TWILIO_WHATSAPP_FROM
    : process.env.TWILIO_SMS_FROM;
  if (!sid || !token || !from) return { status: "simulated" };
  try {
    const fromFmt = channel === "whatsapp" ? `whatsapp:${from}` : from;
    const toFmt = channel === "whatsapp" ? `whatsapp:${to}` : to;
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const params = new URLSearchParams({ From: fromFmt, To: toFmt, Body: body });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) return { status: "failed", error: `twilio ${res.status}` };
    return { status: "sent" };
  } catch (e) {
    return { status: "failed", error: e instanceof Error ? e.message : "twilio error" };
  }
}

export const dispatchCampaign = action({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args): Promise<{
    sent: number; simulated: number; failed: number; skipped: number;
  }> => {
    const campaign: Doc<"campaigns"> | null = await ctx.runQuery(internal.campaignOps._getCampaign, { id: args.id });
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status === "sent") {
      throw new Error("Campaign already sent");
    }
    const recipients: Array<{
      customerId: Id<"customers">; name: string; phone?: string; email?: string;
    }> = await ctx.runQuery(internal.campaignOps._resolveRecipients, {
      storeId: campaign.storeId,
      segment: campaign.segment,
      channel: campaign.channel,
    });

    const template = campaign.template ?? `Hi {name}, a message from ${campaign.name}.`;
    let sent = 0, simulated = 0, failed = 0, skipped = 0;

    for (const r of recipients) {
      const body = renderTemplate(template, { name: r.name.split(" ")[0] || r.name, store: campaign.storeId });
      let outcome: SendOutcome;
      let recipient: string;
      if (campaign.channel === "email") {
        if (!r.email) { skipped++; continue; }
        recipient = r.email;
        outcome = await sendEmail(r.email, campaign.name, body);
      } else if (campaign.channel === "whatsapp" || campaign.channel === "sms") {
        if (!r.phone) { skipped++; continue; }
        recipient = r.phone;
        outcome = await sendTwilio(campaign.channel as "whatsapp" | "sms", r.phone, body);
      } else {
        skipped++; continue;
      }
      await ctx.runMutation(internal.campaignOps._writeSend, {
        campaignId: campaign._id,
        storeId: campaign.storeId,
        customerId: r.customerId,
        channel: campaign.channel,
        recipient,
        status: outcome.status,
        error: outcome.error,
      });
      if (outcome.status === "sent") sent++;
      else if (outcome.status === "simulated") simulated++;
      else failed++;
    }

    // "delivered" tracks real provider accepts; simulated counts as delivered
    // for demo-mode UX so the funnel bar isn't stuck at zero.
    await ctx.runMutation(internal.campaignOps._markCampaignSent, {
      id: campaign._id,
      sent: sent + simulated + failed,
      delivered: sent + simulated,
    });

    return { sent, simulated, failed, skipped };
  },
});

export const listSendsByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaignSends")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
      .take(500);
  },
});

// ============================
// OFFERS
// ============================

export const createOffer = mutation({
  args: {
    storeId: v.string(),
    type: v.string(),
    headline: v.string(),
    subline: v.optional(v.string()),
    badge: v.optional(v.string()),
    cta: v.optional(v.string()),
    expiry: v.optional(v.string()),
    grad: v.optional(v.array(v.string())),
    icon: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("offers", {
      storeId: args.storeId,
      type: args.type,
      headline: args.headline,
      subline: args.subline,
      badge: args.badge,
      cta: args.cta,
      expiry: args.expiry,
      grad: args.grad,
      icon: args.icon,
      active: args.active ?? true,
    });
    return id;
  },
});

export const listOffersByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("offers")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(20);
  },
});

export const updateOffer = mutation({
  args: {
    id: v.id("offers"),
    type: v.optional(v.string()),
    headline: v.optional(v.string()),
    subline: v.optional(v.string()),
    badge: v.optional(v.string()),
    cta: v.optional(v.string()),
    expiry: v.optional(v.string()),
    grad: v.optional(v.array(v.string())),
    icon: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const fields: Record<string, string | boolean | string[]> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    if (Object.keys(fields).length > 0) {
      await ctx.db.patch(id, fields);
    }
  },
});

export const deleteOffer = mutation({
  args: { id: v.id("offers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const listActiveOffersByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const allOffers = await ctx.db
      .query("offers")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(100);
    return allOffers.filter((offer) => offer.active === true);
  },
});

// ============================
// CUSTOMER SEGMENTS
// ============================

export const createSegment = mutation({
  args: {
    storeId: v.string(),
    name: v.string(),
    criteria: v.string(),
    customerCount: v.optional(v.number()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("customerSegments", {
      storeId: args.storeId,
      name: args.name,
      criteria: args.criteria,
      customerCount: args.customerCount,
      createdAt: args.createdAt,
    });
    return id;
  },
});

export const listSegmentsByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerSegments")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(50);
  },
});

export const updateSegment = mutation({
  args: {
    id: v.id("customerSegments"),
    name: v.optional(v.string()),
    criteria: v.optional(v.string()),
    customerCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const fields: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields[key] = value;
      }
    }
    if (Object.keys(fields).length > 0) {
      await ctx.db.patch(id, fields);
    }
  },
});

export const deleteSegment = mutation({
  args: { id: v.id("customerSegments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
