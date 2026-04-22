import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { assertFile, GUARDS } from "./fileValidation";
import { requireAdmin } from "./adminAuth";

// ============================
// TAILORS
// ============================

export const getByTailorId = query({
  args: { tailorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailors")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .unique();
  },
});

export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailors")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tailors").order("asc").take(100);
  },
});

export const listByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailors")
      .withIndex("by_city", (q) => q.eq("city", args.city.trim()))
      .take(100);
  },
});

export const updateProfile = mutation({
  args: {
    tailorId: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    area: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    bio: v.optional(v.string()),
    badge: v.optional(v.string()),
    language: v.optional(v.string()),
    serviceRadius: v.optional(v.number()),
    subscription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tailor = await ctx.db
      .query("tailors")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .unique();
    if (!tailor) throw new Error("Tailor not found");
    const { tailorId: _, ...fields } = args;
    const TRIM_KEYS = new Set(["name", "phone", "city", "area", "experience", "bio", "badge", "language", "subscription"]);
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      updates[key] = typeof value === "string" && TRIM_KEYS.has(key) ? value.trim() : value;
    }
    await ctx.db.patch(tailor._id, updates);
  },
});

export const updateAvailability = mutation({
  args: {
    tailorId: v.string(),
    available: v.optional(v.boolean()),
    workingDays: v.optional(
      v.object({
        Mon: v.boolean(),
        Tue: v.boolean(),
        Wed: v.boolean(),
        Thu: v.boolean(),
        Fri: v.boolean(),
        Sat: v.boolean(),
        Sun: v.boolean(),
      })
    ),
    hoursOpen: v.optional(v.string()),
    hoursClose: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tailor = await ctx.db
      .query("tailors")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .unique();
    if (!tailor) throw new Error("Tailor not found");
    const { tailorId: _, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(tailor._id, updates);
  },
});

export const updateServices = mutation({
  args: {
    tailorId: v.string(),
    services: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        priceMin: v.number(),
        priceMax: v.number(),
        days: v.number(),
        active: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const tailor = await ctx.db
      .query("tailors")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .unique();
    if (!tailor) throw new Error("Tailor not found");
    await ctx.db.patch(tailor._id, { services: args.services });
  },
});

export const registerTailor = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    city: v.string(),
    area: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    bio: v.optional(v.string()),
    language: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const phone = args.phone.trim();
    const city = args.city.trim();
    const area = args.area?.trim();
    const experience = args.experience?.trim();
    const bio = args.bio?.trim();
    const language = args.language?.trim();

    // Duplicate check — prevent creating a second tailor with the same phone
    const existing = await ctx.db
      .query("tailors")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first();
    if (existing) {
      throw new Error("A tailor with this phone number already exists");
    }

    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const tailorId = `TL-${randomDigits}`;
    return await ctx.db.insert("tailors", {
      tailorId,
      name,
      phone,
      city,
      area,
      specialties: args.specialties,
      experience,
      bio,
      language,
      passwordHash: args.passwordHash,
      status: "pending",
      rating: 0,
      revenue: 0,
      referrals: 0,
      leadsThisMonth: 0,
      earnedThisMonth: 0,
      commissionOwed: 0,
      freeReferralsUsed: 0,
      available: true,
      subscription: "free",
      joinDate: new Date().toISOString().split("T")[0],
      aadhaarVerified: false,
      panVerified: false,
      addressVerified: false,
      consentProfile: false,
      consentLocation: false,
      consentAnalytics: false,
    });
  },
});

// Admin-facing: approve / reject individual KYC docs. The rejectionReason,
// when set, is displayed back to the tailor so they know what to fix.
// Passing explicit `null` to `kycRejectionReason` clears it (on approval).
export const updateVerification = mutation({
  args: {
    tailorId: v.string(),
    aadhaarVerified: v.optional(v.boolean()),
    panVerified: v.optional(v.boolean()),
    addressVerified: v.optional(v.boolean()),
    kycRejectionReason: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const tailor = await ctx.db
      .query("tailors")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .unique();
    if (!tailor) throw new Error("Tailor not found");
    const updates: Record<string, unknown> = {};
    if (args.aadhaarVerified !== undefined) updates.aadhaarVerified = args.aadhaarVerified;
    if (args.panVerified !== undefined) updates.panVerified = args.panVerified;
    if (args.addressVerified !== undefined) updates.addressVerified = args.addressVerified;
    if (args.kycRejectionReason !== undefined) {
      updates.kycRejectionReason = args.kycRejectionReason ?? undefined;
    }
    // Recompute status from the post-update flag set so rejections demote
    // a previously-verified tailor (one bad doc shouldn't leave them
    // appearing "verified" in discovery).
    const fullyVerifiedAfter =
      (args.aadhaarVerified ?? tailor.aadhaarVerified) &&
      (args.panVerified ?? tailor.panVerified) &&
      (args.addressVerified ?? tailor.addressVerified);
    if (fullyVerifiedAfter) {
      updates.status = "verified";
    } else if (tailor.status === "verified") {
      updates.status = "pending";
    }
    await ctx.db.patch(tailor._id, updates);
  },
});

// Tailor-facing: submit or replace a single KYC document. Saving a fresh
// file resets that doc's verified flag (admin must re-review) and clears
// any global rejection reason so the tailor sees a clean "pending review"
// state after resubmitting.
export const submitKycDocument = mutation({
  args: {
    tailorId: v.string(),
    docType: v.union(v.literal("aadhaar"), v.literal("pan"), v.literal("address")),
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await assertFile(ctx, args.fileId, GUARDS.kycDocument);
    const tailor = await ctx.db
      .query("tailors")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .unique();
    if (!tailor) throw new Error("Tailor not found");
    const updates: Record<string, unknown> = { kycRejectionReason: undefined };
    if (args.docType === "aadhaar") {
      updates.aadhaarFileId = args.fileId;
      updates.aadhaarVerified = false;
    } else if (args.docType === "pan") {
      updates.panFileId = args.fileId;
      updates.panVerified = false;
    } else {
      updates.addressProofFileId = args.fileId;
      updates.addressVerified = false;
    }
    await ctx.db.patch(tailor._id, updates);
  },
});

// Admin-facing: list tailors that have at least one submitted KYC document
// but aren't fully verified yet. Used by the admin approval queue.
export const listKycQueue = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("tailors").take(500);
    return all.filter((t) => {
      const hasDocs = !!(t.aadhaarFileId || t.panFileId || t.addressProofFileId);
      const fullyVerified = !!(t.aadhaarVerified && t.panVerified && t.addressVerified);
      return hasDocs && !fullyVerified;
    });
  },
});

export const updateConsent = mutation({
  args: {
    tailorId: v.string(),
    consentProfile: v.optional(v.boolean()),
    consentLocation: v.optional(v.boolean()),
    consentAnalytics: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const tailor = await ctx.db
      .query("tailors")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .unique();
    if (!tailor) throw new Error("Tailor not found");
    const { tailorId: _, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(tailor._id, updates);
  },
});

// ============================
// PORTFOLIO
// ============================

export const addPortfolioItem = mutation({
  args: {
    tailorId: v.string(),
    tag: v.optional(v.string()),
    occasion: v.optional(v.string()),
    style: v.optional(v.string()),
    grad: v.optional(v.array(v.string())),
    imageFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    if (args.imageFileId) await assertFile(ctx, args.imageFileId, GUARDS.portfolioPhoto);
    return await ctx.db.insert("tailorPortfolio", {
      tailorId: args.tailorId,
      tag: args.tag,
      occasion: args.occasion,
      style: args.style,
      grad: args.grad,
      imageFileId: args.imageFileId,
    });
  },
});

export const removePortfolioItem = mutation({
  args: { id: v.id("tailorPortfolio") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getPortfolio = query({
  args: { tailorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailorPortfolio")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .take(100);
  },
});

// ============================
// REFERRALS
// ============================

export const createReferral = mutation({
  args: {
    tailorId: v.string(),
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    customerPhone: v.string(),
    saree: v.optional(v.string()),
    fabric: v.optional(v.string()),
    storeId: v.optional(v.string()),
    storeName: v.optional(v.string()),
    occasion: v.optional(v.string()),
    budget: v.optional(v.string()),
    measurementsShared: v.optional(v.boolean()),
    note: v.optional(v.string()),
    date: v.string(),
    time: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tailor = await ctx.db
      .query("tailors")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .unique();
    if (!tailor) throw new Error("Tailor not found");

    // Dedup window: if the same customer taps Connect on the same tailor
    // within 60 seconds (double-tap, jittery touch, flaky network retry),
    // return the existing referral instead of creating a duplicate lead.
    // Only consults "new" status — if the tailor already contacted /
    // quoted / declined, a fresh lead is the right signal.
    const DEDUP_WINDOW_MS = 60_000;
    const recent = await ctx.db
      .query("tailorReferrals")
      .withIndex("by_tailorId_and_status", (q) =>
        q.eq("tailorId", args.tailorId).eq("status", "new"),
      )
      .filter((q) => q.eq(q.field("customerPhone"), args.customerPhone))
      .order("desc")
      .first();
    if (recent && Date.now() - recent._creationTime < DEDUP_WINDOW_MS) {
      return recent._id;
    }

    const referralId = await ctx.db.insert("tailorReferrals", {
      tailorId: args.tailorId,
      customerId: args.customerId,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      saree: args.saree,
      fabric: args.fabric,
      storeId: args.storeId,
      storeName: args.storeName,
      occasion: args.occasion,
      budget: args.budget,
      measurementsShared: args.measurementsShared,
      note: args.note,
      status: "new",
      date: args.date,
      time: args.time,
    });

    await ctx.db.patch(tailor._id, {
      referrals: tailor.referrals + 1,
      leadsThisMonth: (tailor.leadsThisMonth ?? 0) + 1,
    });

    return referralId;
  },
});

export const getReferralById = query({
  args: { id: v.id("tailorReferrals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getOrderById = query({
  args: { id: v.id("tailorOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listReferrals = query({
  args: { tailorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailorReferrals")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .order("desc")
      .take(100);
  },
});

export const listNewReferrals = query({
  args: { tailorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailorReferrals")
      .withIndex("by_tailorId_and_status", (q) =>
        q.eq("tailorId", args.tailorId).eq("status", "new")
      )
      .order("desc")
      .take(100);
  },
});

export const updateReferralStatus = mutation({
  args: {
    id: v.id("tailorReferrals"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("quoted"),
      v.literal("confirmed"),
      v.literal("declined"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// ============================
// ORDERS
// ============================

export const createOrder = mutation({
  args: {
    tailorId: v.string(),
    tailorName: v.string(),
    referralId: v.optional(v.id("tailorReferrals")),
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    customerPhone: v.string(),
    saree: v.optional(v.string()),
    fabric: v.optional(v.string()),
    storeId: v.optional(v.string()),
    service: v.string(),
    priceQuoted: v.number(),
    depositPaid: v.optional(v.number()),
    dueDate: v.optional(v.string()),
    orderDate: v.string(),
    note: v.optional(v.string()),
    tailorWhatsapp: v.optional(v.string()),
    bust: v.optional(v.string()),
    waist: v.optional(v.string()),
    shoulder: v.optional(v.string()),
    armLength: v.optional(v.string()),
    backLength: v.optional(v.string()),
    neckDepthFront: v.optional(v.string()),
    neckDepthBack: v.optional(v.string()),
    sleeve: v.optional(v.string()),
    neck: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let random = "";
    for (let i = 0; i < 6; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const orderId = `TO-${random}`;

    // When the caller doesn't supply measurements explicitly, pull them from
    // the linked customer row. Lets "convert referral → order" skip a
    // re-entry step, since the customer's body-scan/profile measurements
    // already live on `customers`.
    let measurements = {
      bust: args.bust,
      waist: args.waist,
      shoulder: args.shoulder,
      armLength: args.armLength,
      backLength: args.backLength,
      neckDepthFront: args.neckDepthFront,
      neckDepthBack: args.neckDepthBack,
      sleeve: args.sleeve,
      neck: args.neck,
    };
    const hasAnyMeasurement = Object.values(measurements).some((v) => v !== undefined);
    if (!hasAnyMeasurement && args.customerId) {
      const customer = await ctx.db.get(args.customerId);
      if (customer) {
        measurements = {
          bust: customer.bust,
          waist: customer.waist,
          shoulder: customer.shoulder,
          armLength: customer.armLength,
          backLength: customer.backLength,
          neckDepthFront: customer.neckDepthFront,
          neckDepthBack: customer.neckDepthBack,
          sleeve: customer.sleeve,
          neck: customer.neck,
        };
      }
    }

    return await ctx.db.insert("tailorOrders", {
      orderId,
      tailorId: args.tailorId,
      tailorName: args.tailorName,
      referralId: args.referralId,
      customerId: args.customerId,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      saree: args.saree,
      fabric: args.fabric,
      storeId: args.storeId,
      service: args.service,
      priceQuoted: args.priceQuoted,
      depositPaid: args.depositPaid,
      status: "confirmed",
      dueDate: args.dueDate,
      orderDate: args.orderDate,
      note: args.note,
      tailorWhatsapp: args.tailorWhatsapp,
      ...measurements,
    });
  },
});

export const getOrder = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailorOrders")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();
  },
});

export const listOrders = query({
  args: { tailorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailorOrders")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .order("desc")
      .take(100);
  },
});

export const listOrdersByCustomer = query({
  args: { customerPhone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailorOrders")
      .withIndex("by_customerPhone", (q) =>
        q.eq("customerPhone", args.customerPhone)
      )
      .order("desc")
      .take(100);
  },
});

const ORDER_STATUS_FLOW = [
  "confirmed",
  "measurements",
  "stitching",
  "ready",
  "delivered",
] as const;

export const advanceOrderStatus = mutation({
  args: { id: v.id("tailorOrders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    const currentIndex = ORDER_STATUS_FLOW.indexOf(
      order.status as (typeof ORDER_STATUS_FLOW)[number]
    );
    if (currentIndex === -1 || currentIndex >= ORDER_STATUS_FLOW.length - 1) {
      throw new Error("Order is already at final status or has invalid status");
    }

    const nextStatus = ORDER_STATUS_FLOW[currentIndex + 1];
    await ctx.db.patch(args.id, { status: nextStatus });
    return nextStatus;
  },
});

// Soft-cancel an order. The row stays for audit; status moves to
// "cancelled" so it stops showing up in active-order flows and renders
// with a muted pill. Only allowed before stitching begins, and only by
// the tailor who owns the order.
export const cancelOrder = mutation({
  args: {
    id: v.id("tailorOrders"),
    tailorId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.tailorId !== args.tailorId) {
      throw new Error("You can only cancel your own orders");
    }
    if (order.status !== "confirmed" && order.status !== "measurements") {
      throw new Error("This order can no longer be cancelled — stitching has started");
    }
    await ctx.db.patch(args.id, { status: "cancelled" });
  },
});

export const rateOrder = mutation({
  args: {
    id: v.id("tailorOrders"),
    rating: v.number(),
    ratingComment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(args.id, {
      rating: args.rating,
      ratingComment: args.ratingComment,
    });

    // Update tailor's average rating
    const tailor = await ctx.db
      .query("tailors")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", order.tailorId))
      .unique();
    if (tailor) {
      const currentCount = tailor.reviewCount ?? 0;
      const currentRating = tailor.rating;
      const newCount = currentCount + 1;
      const newRating =
        Math.round(
          ((currentRating * currentCount + args.rating) / newCount) * 10
        ) / 10;
      await ctx.db.patch(tailor._id, {
        rating: newRating,
        reviewCount: newCount,
      });
    }
  },
});

// ============================
// COMMISSION
// ============================

export const listCommission = query({
  args: { tailorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tailorCommission")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .order("desc")
      .take(100);
  },
});

export const addCommission = mutation({
  args: {
    tailorId: v.string(),
    orderId: v.optional(v.string()),
    amount: v.number(),
    type: v.union(
      v.literal("referral"),
      v.literal("order"),
      v.literal("payout")
    ),
    status: v.union(v.literal("pending"), v.literal("paid")),
    date: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const commissionId = await ctx.db.insert("tailorCommission", {
      tailorId: args.tailorId,
      orderId: args.orderId,
      amount: args.amount,
      type: args.type,
      status: args.status,
      date: args.date,
      description: args.description,
    });

    // Update tailor earnings
    const tailor = await ctx.db
      .query("tailors")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .unique();
    if (tailor) {
      if (args.type === "payout") {
        await ctx.db.patch(tailor._id, {
          commissionOwed: Math.max(0, (tailor.commissionOwed ?? 0) - args.amount),
        });
      } else {
        await ctx.db.patch(tailor._id, {
          earnedThisMonth: (tailor.earnedThisMonth ?? 0) + args.amount,
          commissionOwed: (tailor.commissionOwed ?? 0) + args.amount,
          revenue: tailor.revenue + args.amount,
        });
      }
    }

    return commissionId;
  },
});

export const getEarnings = query({
  args: { tailorId: v.string() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("tailorCommission")
      .withIndex("by_tailorId", (q) => q.eq("tailorId", args.tailorId))
      .take(1000);

    let totalEarned = 0;
    let totalPending = 0;
    let totalPaid = 0;

    for (const record of records) {
      if (record.type === "payout") {
        totalPaid += record.amount;
      } else {
        totalEarned += record.amount;
        if (record.status === "pending") {
          totalPending += record.amount;
        } else if (record.status === "paid") {
          totalPaid += record.amount;
        }
      }
    }

    return { totalEarned, totalPending, totalPaid };
  },
});

// One-shot backfill: trim leading/trailing whitespace on string fields that
// feed indexes or UI filters. Idempotent — rows already clean get no write.
export const backfillTrimTailorStrings = internalMutation({
  args: {},
  handler: async (ctx) => {
    const TRIM_KEYS = ["name", "phone", "city", "area", "experience", "bio", "badge", "language", "subscription"] as const;
    const rows = await ctx.db.query("tailors").collect();
    let touched = 0;
    for (const row of rows) {
      const updates: Record<string, unknown> = {};
      for (const key of TRIM_KEYS) {
        const val = (row as Record<string, unknown>)[key];
        if (typeof val === "string" && val !== val.trim()) {
          updates[key] = val.trim();
        }
      }
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(row._id, updates);
        touched++;
      }
    }
    return { scanned: rows.length, touched };
  },
});
