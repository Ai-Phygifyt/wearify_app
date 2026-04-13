import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// SESSIONS
// ============================================================

export const createSession = mutation({
  args: {
    storeId: v.string(),
    storeName: v.optional(v.string()),
    staffId: v.optional(v.id("staff")),
    staffName: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    mirrorId: v.optional(v.string()),
    tabletLinked: v.optional(v.boolean()),
    occasion: v.optional(v.string()),
    budget: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = "SS-" + Date.now().toString();
    await ctx.db.insert("sessions", {
      sessionId,
      storeId: args.storeId,
      storeName: args.storeName,
      staffId: args.staffId,
      staffName: args.staffName,
      customerId: args.customerId,
      customerPhone: args.customerPhone,
      mirrorId: args.mirrorId,
      tabletLinked: args.tabletLinked,
      status: "active",
      startTime: Date.now(),
      occasion: args.occasion,
      budget: args.budget,
    });
    return sessionId;
  },
});

export const getSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    return session;
  },
});

export const listActiveSessions = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();
    return sessions.filter((s) => s.status === "active");
  },
});

// Find active session for a specific staff member in a store
// Used by kiosk to link to the tablet's session
export const getActiveSessionForStaff = query({
  args: { storeId: v.string(), staffId: v.id("staff") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_staffId", (q) => q.eq("staffId", args.staffId))
      .order("desc")
      .take(10);
    // Return the most recent active session for this staff in this store
    return sessions.find(
      (s) => s.status === "active" && s.storeId === args.storeId
    ) ?? null;
  },
});

export const listSessionsByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(100);
    return sessions;
  },
});

export const endSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    if (!session) throw new Error("Session not found");

    const endTime = Date.now();
    const durationMs = endTime - session.startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const duration = `${minutes}m ${seconds}s`;

    await ctx.db.patch(session._id, {
      status: "completed",
      endTime,
      duration,
    });
    return { endTime, duration };
  },
});

export const updateSession = mutation({
  args: {
    sessionId: v.string(),
    occasion: v.optional(v.string()),
    budget: v.optional(v.string()),
    visitNote: v.optional(v.string()),
    rating: v.optional(v.number()),
    ratingComment: v.optional(v.string()),
    sareesTriedOn: v.optional(v.number()),
    sareesBrowsed: v.optional(v.number()),
    purchased: v.optional(v.boolean()),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    staffId: v.optional(v.id("staff")),
    staffName: v.optional(v.string()),
    mirrorId: v.optional(v.string()),
    tabletLinked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    if (!session) throw new Error("Session not found");

    const { sessionId: _sid, ...updates } = args;
    // Remove undefined values so patch only updates provided fields
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(session._id, patch);
    }
    return session._id;
  },
});

// ============================================================
// LOOKS
// ============================================================

export const createLook = mutation({
  args: {
    sessionId: v.optional(v.string()),
    storeId: v.string(),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    sareeId: v.id("sarees"),
    sareeName: v.string(),
    fabric: v.optional(v.string()),
    price: v.optional(v.number()),
    drapeStyle: v.optional(v.string()),
    accessories: v.optional(v.array(v.string())),
    neckline: v.optional(v.string()),
    isFav: v.optional(v.boolean()),
    isWished: v.optional(v.boolean()),
    imageFileId: v.optional(v.id("_storage")),
    grad: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("looks", {
      sessionId: args.sessionId,
      storeId: args.storeId,
      customerId: args.customerId,
      customerPhone: args.customerPhone,
      sareeId: args.sareeId,
      sareeName: args.sareeName,
      fabric: args.fabric,
      price: args.price,
      drapeStyle: args.drapeStyle,
      accessories: args.accessories,
      neckline: args.neckline,
      isFav: args.isFav ?? false,
      isWished: args.isWished ?? false,
      imageFileId: args.imageFileId,
      grad: args.grad,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const listByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const looks = await ctx.db
      .query("looks")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .take(200);
    return looks;
  },
});

export const listBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const looks = await ctx.db
      .query("looks")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(200);
    return looks;
  },
});

export const listByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const looks = await ctx.db
      .query("looks")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(100);
    return looks;
  },
});

export const toggleFav = mutation({
  args: { lookId: v.id("looks") },
  handler: async (ctx, args) => {
    const look = await ctx.db.get(args.lookId);
    if (!look) throw new Error("Look not found");
    await ctx.db.patch(args.lookId, { isFav: !look.isFav });
    return !look.isFav;
  },
});

export const toggleWish = mutation({
  args: { lookId: v.id("looks") },
  handler: async (ctx, args) => {
    const look = await ctx.db.get(args.lookId);
    if (!look) throw new Error("Look not found");
    await ctx.db.patch(args.lookId, { isWished: !look.isWished });
    return !look.isWished;
  },
});

// ============================================================
// SHORTLIST
// ============================================================

export const addToShortlist = mutation({
  args: {
    sessionId: v.string(),
    sareeId: v.id("sarees"),
    storeId: v.string(),
    customerId: v.optional(v.id("customers")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("shortlist", {
      sessionId: args.sessionId,
      sareeId: args.sareeId,
      storeId: args.storeId,
      customerId: args.customerId,
      sentToMirror: false,
      addedAt: Date.now(),
    });
    return id;
  },
});

// Get a customer's shortlisted items from all previous sessions at a store
export const getCustomerPreviousShortlist = query({
  args: {
    customerId: v.id("customers"),
    storeId: v.string(),
    currentSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("shortlist")
      .withIndex("by_customerId_and_storeId", (q) =>
        q.eq("customerId", args.customerId).eq("storeId", args.storeId)
      )
      .order("desc")
      .take(100);
    // Exclude items from the current session
    if (args.currentSessionId) {
      return items.filter((item) => item.sessionId !== args.currentSessionId);
    }
    return items;
  },
});

export const removeFromShortlist = mutation({
  args: { shortlistId: v.id("shortlist") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.shortlistId);
  },
});

export const getShortlist = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("shortlist")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(100);
    return items;
  },
});

export const markSentToMirror = mutation({
  args: { shortlistId: v.id("shortlist") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.shortlistId);
    if (!item) throw new Error("Shortlist item not found");
    await ctx.db.patch(args.shortlistId, { sentToMirror: true });
  },
});

// ============================================================
// WARDROBE
// ============================================================

export const addToWardrobe = mutation({
  args: {
    sessionId: v.string(),
    customerId: v.optional(v.id("customers")),
    sareeId: v.id("sarees"),
    sareeName: v.string(),
    drapeStyle: v.optional(v.string()),
    accessories: v.optional(v.array(v.string())),
    neckline: v.optional(v.string()),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Max 10 items per session
    const existing = await ctx.db
      .query("wardrobe")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .take(11);
    if (existing.length >= 10) {
      throw new Error("Wardrobe is full (max 10 items per session)");
    }

    const id = await ctx.db.insert("wardrobe", {
      sessionId: args.sessionId,
      customerId: args.customerId,
      sareeId: args.sareeId,
      sareeName: args.sareeName,
      drapeStyle: args.drapeStyle,
      accessories: args.accessories,
      neckline: args.neckline,
      price: args.price,
      addedAt: Date.now(),
    });
    return id;
  },
});

export const removeFromWardrobe = mutation({
  args: { wardrobeId: v.id("wardrobe") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.wardrobeId);
  },
});

export const getWardrobe = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wardrobe")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(10);
    return items;
  },
});

// ============================================================
// ORDERS
// ============================================================

function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createOrder = mutation({
  args: {
    sessionId: v.optional(v.string()),
    storeId: v.string(),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    items: v.array(
      v.object({
        sareeId: v.id("sarees"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orderId = generateOrderId();

    // Calculate subtotal and GST
    let subtotal = 0;
    let gst = 0;
    for (const item of args.items) {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      // GST: 5% for items under Rs1000, 12% for items Rs1000 and above
      const gstRate = item.price < 1000 ? 0.05 : 0.12;
      gst += lineTotal * gstRate;
    }
    gst = Math.round(gst * 100) / 100;
    const total = Math.round((subtotal + gst) * 100) / 100;

    const now = Date.now();
    const qrExpiry = now + 10 * 60 * 1000; // 10 minutes from now

    await ctx.db.insert("orders", {
      orderId,
      sessionId: args.sessionId,
      storeId: args.storeId,
      customerId: args.customerId,
      customerPhone: args.customerPhone,
      items: args.items,
      subtotal,
      gst,
      total,
      status: "pending",
      paymentMethod: args.paymentMethod,
      qrExpiry,
      createdAt: now,
    });
    return orderId;
  },
});

export const getOrder = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();
    return order;
  },
});

export const listOrdersByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(100);
    return orders;
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();
    if (!order) throw new Error("Order not found");
    await ctx.db.patch(order._id, { status: args.status });
    return order._id;
  },
});
