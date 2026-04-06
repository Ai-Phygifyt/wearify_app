import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================
  // USERS (phone-based auth for store owners, customers, tailors)
  // ============================
  users: defineTable({
    phone: v.string(),
    passwordHash: v.optional(v.string()), // bcrypt hash, optional if OTP-only
    name: v.string(),
    role: v.string(), // "store_owner" | "customer" | "tailor" | "staff"
    storeId: v.optional(v.string()), // for store_owner/staff
    tailorId: v.optional(v.string()), // for tailor
    sessionToken: v.optional(v.string()),
    sessionExpiry: v.optional(v.number()),
    lastLogin: v.optional(v.number()),
  })
    .index("by_phone", ["phone"])
    .index("by_sessionToken", ["sessionToken"])
    .index("by_role", ["role"]),

  // ============================
  // STORES
  // ============================
  stores: defineTable({
    storeId: v.string(),
    name: v.string(),
    city: v.string(),
    state: v.optional(v.string()),
    address: v.optional(v.string()),
    pin: v.optional(v.string()),
    area: v.optional(v.string()),
    hours: v.optional(v.string()),
    closedOn: v.optional(v.string()),
    status: v.string(), // "active" | "trial" | "churned" | "suspended"
    plan: v.string(), // "Smart" | "Digital" | "Trial"
    mrr: v.number(),
    healthScore: v.number(),
    conversionRate: v.number(),
    sessions: v.number(),
    churnRisk: v.number(),
    featureScore: v.number(),
    catalogUtilization: v.number(),
    agreementStatus: v.string(), // "signed" | "pending" | "terminated"
    discountCode: v.optional(v.string()),
    onboardingStep: v.number(), // 0-8
    // KYC
    ownerName: v.optional(v.string()),
    ownerPhone: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    gstin: v.optional(v.string()),
    pan: v.optional(v.string()),
    shopLicense: v.optional(v.string()),
    logoFileId: v.optional(v.id("_storage")),
    aadhaarFileId: v.optional(v.id("_storage")),
    panFileId: v.optional(v.id("_storage")),
    gstCertFileId: v.optional(v.id("_storage")),
    shopLicenseFileId: v.optional(v.id("_storage")),
    storePhotoExtFileId: v.optional(v.id("_storage")),
    storePhotoIntFileId: v.optional(v.id("_storage")),
    // Bank
    bankAccount: v.optional(v.string()),
    bankIfsc: v.optional(v.string()),
    bankName: v.optional(v.string()),
    // Agreements
    msaAccepted: v.optional(v.boolean()),
    dpaAccepted: v.optional(v.boolean()),
    aupAccepted: v.optional(v.boolean()),
    hwAccepted: v.optional(v.boolean()),
    slaAccepted: v.optional(v.boolean()),
    signerName: v.optional(v.string()),
    signDate: v.optional(v.string()),
    // Billing
    billingCycle: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    // WhatsApp
    whatsappNumber: v.optional(v.string()),
    whatsappVerified: v.optional(v.boolean()),
    // Subscription
    subscriptionPlan: v.optional(v.string()), // "Starter" | "Professional" | "Enterprise"
    essentialMode: v.optional(v.boolean()),
    // Retailer settings
    digitisedPercent: v.optional(v.number()),
    catalogueCount: v.optional(v.number()),
  })
    .index("by_storeId", ["storeId"])
    .index("by_status", ["status"])
    .index("by_city", ["city"])
    .index("by_ownerPhone", ["ownerPhone"]),

  // ============================
  // STAFF (in-store employees)
  // ============================
  staff: defineTable({
    name: v.string(),
    phone: v.string(),
    pin: v.string(), // 4-6 digit PIN for tablet/mirror login
    role: v.string(), // "R03" owner | "R04" manager | "R05" salesperson
    storeRef: v.optional(v.id("stores")),
    storeId: v.string(),
    status: v.optional(v.string()), // "active" | "inactive"
    totalSales: v.optional(v.number()),
    conversion: v.optional(v.number()),
    sessionCount: v.optional(v.number()),
    revenue: v.optional(v.number()),
    coachingTips: v.optional(v.array(v.string())),
  })
    .index("by_storeId", ["storeId"])
    .index("by_role", ["role"])
    .index("by_phone", ["phone"])
    .index("by_storeId_and_pin", ["storeId", "pin"]),

  // ============================
  // SAREES (catalog items, per store)
  // ============================
  sarees: defineTable({
    storeId: v.string(),
    name: v.string(),
    type: v.string(), // "Banarasi" | "Kanjeevaram" | "Chanderi" etc.
    fabric: v.string(), // "Silk" | "Cotton" | "Linen" etc.
    occasion: v.string(), // "Wedding" | "Festival" | "Party" | "Office" | "Daily" | "Gift"
    price: v.number(),
    mrp: v.optional(v.number()),
    stock: v.number(),
    status: v.string(), // "active" | "low_stock" | "out_of_stock" | "archived"
    colors: v.array(v.string()),
    colorName: v.optional(v.string()),
    emoji: v.optional(v.string()), // placeholder visual
    grad: v.optional(v.array(v.string())), // gradient colors for placeholder
    tag: v.optional(v.string()), // "Premium" | "Trending" | "Aging" | "Fast Moving" | "New"
    region: v.optional(v.string()), // "Varanasi" | "Kanchipuram" etc.
    weave: v.optional(v.string()),
    weight: v.optional(v.string()), // "Light" | "Medium" | "Heavy"
    description: v.optional(v.string()),
    careInstructions: v.optional(v.string()),
    drapingStyles: v.optional(v.array(v.string())),
    auspiciousColors: v.optional(v.array(v.string())),
    aiTags: v.optional(v.array(v.string())),
    // Analytics
    tryOns: v.optional(v.number()),
    views: v.optional(v.number()),
    conversions: v.optional(v.number()),
    daysOld: v.optional(v.number()),
    // Catalog approval
    approvalStatus: v.optional(v.string()), // "pending" | "approved" | "rejected" | "corrections"
    correctionNote: v.optional(v.string()), // admin feedback when sent for corrections
    addedBy: v.optional(v.string()), // staff name
    // Images (file storage)
    imageIds: v.optional(v.array(v.id("_storage"))),
    // Pricing
    festivalDemand: v.optional(v.number()),
    reorderScore: v.optional(v.number()),
  })
    .index("by_storeId", ["storeId"])
    .index("by_storeId_and_status", ["storeId", "status"])
    .index("by_storeId_and_occasion", ["storeId", "occasion"])
    .index("by_storeId_and_fabric", ["storeId", "fabric"])
    .index("by_approvalStatus", ["approvalStatus"]),

  // ============================
  // CUSTOMERS (multi-store, linked by phone)
  // ============================
  customers: defineTable({
    phone: v.string(),
    name: v.string(),
    initials: v.optional(v.string()),
    totalVisits: v.optional(v.number()),
    totalLooks: v.optional(v.number()),
    totalStores: v.optional(v.number()),
    storeCredit: v.optional(v.number()),
    // Loyalty
    loyaltyPoints: v.optional(v.number()),
    loyaltyTier: v.optional(v.string()), // "Regular" | "Silver" | "Gold" | "VIP"
    // Preferences
    preferredOccasions: v.optional(v.array(v.string())),
    preferredFabrics: v.optional(v.array(v.string())),
    preferredColors: v.optional(v.array(v.string())),
    budgetRange: v.optional(v.string()),
    upcomingOccasion: v.optional(v.string()),
    upcomingOccasionDate: v.optional(v.string()),
    notifyTime: v.optional(v.string()), // "Morning" | "Afternoon" | "Evening"
    // Consent (DPDP)
    consentHistory: v.optional(v.boolean()),
    consentMessages: v.optional(v.boolean()),
    consentAiPersonal: v.optional(v.boolean()),
    consentPhotos: v.optional(v.boolean()),
    consentGrantedDate: v.optional(v.string()),
    // Notification prefs
    notifTryOn: v.optional(v.boolean()),
    notifThankYou: v.optional(v.boolean()),
    notifFestivals: v.optional(v.boolean()),
    notifNewArrivals: v.optional(v.boolean()),
    notifBirthday: v.optional(v.boolean()),
    notifReengagement: v.optional(v.boolean()),
    // Measurements (body scan)
    bust: v.optional(v.string()),
    waist: v.optional(v.string()),
    shoulder: v.optional(v.string()),
    armLength: v.optional(v.string()),
    backLength: v.optional(v.string()),
    neckDepthFront: v.optional(v.string()),
    neckDepthBack: v.optional(v.string()),
    sleeve: v.optional(v.string()),
    neck: v.optional(v.string()),
    measurementFabric: v.optional(v.string()),
    measurementDate: v.optional(v.string()),
    // Body scan
    lastBodyScan: v.optional(v.number()), // timestamp
    bodyScanFileId: v.optional(v.id("_storage")),
    // Language
    language: v.optional(v.string()),
    // Password (optional for login)
    passwordHash: v.optional(v.string()),
  })
    .index("by_phone", ["phone"]),

  // ============================
  // CUSTOMER-STORE LINK (many-to-many)
  // ============================
  customerStoreLinks: defineTable({
    customerId: v.id("customers"),
    storeId: v.string(),
    storeName: v.optional(v.string()),
    visits: v.optional(v.number()),
    lastVisit: v.optional(v.string()),
    clv: v.optional(v.number()), // customer lifetime value at this store
    segment: v.optional(v.string()), // "VIP" | "Regular" | "At Risk" | "New"
  })
    .index("by_customerId", ["customerId"])
    .index("by_storeId", ["storeId"])
    .index("by_customerId_and_storeId", ["customerId", "storeId"]),

  // ============================
  // SESSIONS (try-on sessions linking staff, customer, device)
  // ============================
  sessions: defineTable({
    sessionId: v.string(),
    storeId: v.string(),
    storeName: v.optional(v.string()),
    staffId: v.optional(v.id("staff")),
    staffName: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    mirrorId: v.optional(v.string()),
    tabletLinked: v.optional(v.boolean()),
    status: v.string(), // "active" | "completed"
    startTime: v.number(), // timestamp
    endTime: v.optional(v.number()),
    duration: v.optional(v.string()),
    sareesTriedOn: v.optional(v.number()),
    sareesBrowsed: v.optional(v.number()),
    purchased: v.optional(v.boolean()),
    occasion: v.optional(v.string()),
    budget: v.optional(v.string()),
    visitNote: v.optional(v.string()),
    rating: v.optional(v.number()), // 1-5 customer feedback
    ratingComment: v.optional(v.string()),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_storeId", ["storeId"])
    .index("by_status", ["status"])
    .index("by_customerId", ["customerId"])
    .index("by_staffId", ["staffId"]),

  // ============================
  // LOOKS (virtual try-on results)
  // ============================
  looks: defineTable({
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
    grad: v.optional(v.array(v.string())), // placeholder gradient
    createdAt: v.number(), // timestamp
  })
    .index("by_customerId", ["customerId"])
    .index("by_storeId", ["storeId"])
    .index("by_sessionId", ["sessionId"])
    .index("by_customerPhone", ["customerPhone"]),

  // ============================
  // SHORTLIST (tablet shortlist during session)
  // ============================
  shortlist: defineTable({
    sessionId: v.string(),
    sareeId: v.id("sarees"),
    storeId: v.string(),
    sentToMirror: v.optional(v.boolean()),
    addedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"]),

  // ============================
  // WISHLIST (customer saved items)
  // ============================
  wishlist: defineTable({
    customerId: v.id("customers"),
    sareeId: v.id("sarees"),
    storeId: v.string(),
    sareeName: v.string(),
    price: v.optional(v.number()),
    addedAt: v.number(),
  })
    .index("by_customerId", ["customerId"])
    .index("by_customerId_and_storeId", ["customerId", "storeId"]),

  // ============================
  // VISIT HISTORY
  // ============================
  visitHistory: defineTable({
    customerId: v.id("customers"),
    storeId: v.string(),
    storeName: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    date: v.string(),
    sareesTried: v.optional(v.number()),
    purchased: v.optional(v.boolean()),
    staffName: v.optional(v.string()),
    pointsEarned: v.optional(v.number()),
  })
    .index("by_customerId", ["customerId"])
    .index("by_storeId", ["storeId"])
    .index("by_customerId_and_storeId", ["customerId", "storeId"]),

  // ============================
  // LOYALTY TRANSACTIONS
  // ============================
  loyaltyTransactions: defineTable({
    customerId: v.id("customers"),
    storeId: v.optional(v.string()),
    type: v.string(), // "earn" | "redeem"
    points: v.number(),
    reason: v.string(), // "visit" | "purchase" | "referral" | "redemption"
    date: v.string(),
  })
    .index("by_customerId", ["customerId"]),

  // ============================
  // CUSTOMER REFERRALS (friend referrals)
  // ============================
  customerReferrals: defineTable({
    referrerId: v.id("customers"),
    referrerPhone: v.string(),
    referredName: v.string(),
    referredPhone: v.optional(v.string()),
    status: v.string(), // "Pending" | "Visited" | "Rewarded"
    reward: v.optional(v.number()),
    date: v.string(),
  })
    .index("by_referrerId", ["referrerId"]),

  // ============================
  // OFFERS (store promotions)
  // ============================
  offers: defineTable({
    storeId: v.string(),
    type: v.string(), // "festival" | "loyalty" | "birthday" | "collection" | "flash" | "referral"
    headline: v.string(),
    subline: v.optional(v.string()),
    badge: v.optional(v.string()),
    cta: v.optional(v.string()),
    expiry: v.optional(v.string()),
    grad: v.optional(v.array(v.string())),
    icon: v.optional(v.string()),
    active: v.optional(v.boolean()),
  })
    .index("by_storeId", ["storeId"]),

  // ============================
  // FEEDBACK
  // ============================
  feedback: defineTable({
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    storeId: v.string(),
    sessionId: v.optional(v.string()),
    rating: v.number(), // 1-5
    chips: v.optional(v.array(v.string())), // quick feedback tags
    comment: v.optional(v.string()),
    date: v.string(),
  })
    .index("by_storeId", ["storeId"])
    .index("by_customerId", ["customerId"]),

  // ============================
  // TAILORS
  // ============================
  tailors: defineTable({
    tailorId: v.string(),
    name: v.string(),
    phone: v.string(),
    city: v.string(),
    area: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())), // from 9 specialty types
    experience: v.optional(v.string()),
    bio: v.optional(v.string()),
    badge: v.optional(v.string()), // "pro" | "verified" | "new"
    status: v.string(), // "verified" | "pending" | "active"
    rating: v.number(),
    reviewCount: v.optional(v.number()),
    revenue: v.number(),
    referrals: v.number(),
    leadsThisMonth: v.optional(v.number()),
    earnedThisMonth: v.optional(v.number()),
    commissionOwed: v.optional(v.number()),
    freeReferralsUsed: v.optional(v.number()),
    available: v.optional(v.boolean()),
    subscription: v.optional(v.string()), // "free" | "pro"
    serviceRadius: v.optional(v.number()),
    // Services
    services: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      priceMin: v.number(),
      priceMax: v.number(),
      days: v.number(),
      active: v.boolean(),
    }))),
    // Working hours
    workingDays: v.optional(v.object({
      Mon: v.boolean(),
      Tue: v.boolean(),
      Wed: v.boolean(),
      Thu: v.boolean(),
      Fri: v.boolean(),
      Sat: v.boolean(),
      Sun: v.boolean(),
    })),
    hoursOpen: v.optional(v.string()),
    hoursClose: v.optional(v.string()),
    joinDate: v.optional(v.string()),
    // KYC
    aadhaarVerified: v.optional(v.boolean()),
    panVerified: v.optional(v.boolean()),
    addressVerified: v.optional(v.boolean()),
    // Language
    language: v.optional(v.string()),
    // Password
    passwordHash: v.optional(v.string()),
    // DPDP
    consentProfile: v.optional(v.boolean()),
    consentLocation: v.optional(v.boolean()),
    consentAnalytics: v.optional(v.boolean()),
  })
    .index("by_tailorId", ["tailorId"])
    .index("by_phone", ["phone"])
    .index("by_city", ["city"])
    .index("by_status", ["status"]),

  // ============================
  // TAILOR PORTFOLIO
  // ============================
  tailorPortfolio: defineTable({
    tailorId: v.string(),
    tag: v.optional(v.string()),
    occasion: v.optional(v.string()),
    style: v.optional(v.string()),
    grad: v.optional(v.array(v.string())), // placeholder gradient
    imageFileId: v.optional(v.id("_storage")),
  })
    .index("by_tailorId", ["tailorId"]),

  // ============================
  // TAILOR REFERRALS (from stores/mirrors to tailors)
  // ============================
  tailorReferrals: defineTable({
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
    status: v.string(), // "new" | "contacted" | "quoted" | "confirmed" | "declined" | "completed"
    date: v.string(),
    time: v.optional(v.string()),
  })
    .index("by_tailorId", ["tailorId"])
    .index("by_tailorId_and_status", ["tailorId", "status"])
    .index("by_customerId", ["customerId"]),

  // ============================
  // TAILOR ORDERS (blouse stitching etc.)
  // ============================
  tailorOrders: defineTable({
    orderId: v.string(),
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
    status: v.string(), // "confirmed" | "measurements" | "stitching" | "ready" | "delivered"
    dueDate: v.optional(v.string()),
    orderDate: v.string(),
    note: v.optional(v.string()),
    tailorWhatsapp: v.optional(v.string()),
    // Customer measurements for this order
    bust: v.optional(v.string()),
    waist: v.optional(v.string()),
    shoulder: v.optional(v.string()),
    armLength: v.optional(v.string()),
    backLength: v.optional(v.string()),
    neckDepthFront: v.optional(v.string()),
    neckDepthBack: v.optional(v.string()),
    sleeve: v.optional(v.string()),
    neck: v.optional(v.string()),
    // Rating
    rating: v.optional(v.number()),
    ratingComment: v.optional(v.string()),
  })
    .index("by_orderId", ["orderId"])
    .index("by_tailorId", ["tailorId"])
    .index("by_tailorId_and_status", ["tailorId", "status"])
    .index("by_customerId", ["customerId"])
    .index("by_customerPhone", ["customerPhone"]),

  // ============================
  // TAILOR COMMISSION
  // ============================
  tailorCommission: defineTable({
    tailorId: v.string(),
    orderId: v.optional(v.string()),
    amount: v.number(),
    type: v.string(), // "referral" | "order" | "payout"
    status: v.string(), // "pending" | "paid"
    date: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_tailorId", ["tailorId"]),

  // ============================
  // CAMPAIGNS (retailer marketing)
  // ============================
  campaigns: defineTable({
    storeId: v.string(),
    name: v.string(),
    template: v.optional(v.string()),
    channel: v.string(), // "whatsapp" | "sms" | "email"
    segment: v.optional(v.string()), // target segment
    scheduledDate: v.optional(v.string()),
    status: v.string(), // "draft" | "scheduled" | "sent" | "completed"
    sent: v.optional(v.number()),
    delivered: v.optional(v.number()),
    opened: v.optional(v.number()),
    clicked: v.optional(v.number()),
    revenue: v.optional(v.number()),
    createdAt: v.string(),
  })
    .index("by_storeId", ["storeId"])
    .index("by_status", ["status"]),

  // ============================
  // CUSTOMER SEGMENTS
  // ============================
  customerSegments: defineTable({
    storeId: v.string(),
    name: v.string(),
    criteria: v.string(), // JSON string of criteria
    customerCount: v.optional(v.number()),
    createdAt: v.string(),
  })
    .index("by_storeId", ["storeId"]),

  // ============================
  // WARDROBE (mirror session saved looks)
  // ============================
  wardrobe: defineTable({
    sessionId: v.string(),
    customerId: v.optional(v.id("customers")),
    sareeId: v.id("sarees"),
    sareeName: v.string(),
    drapeStyle: v.optional(v.string()),
    accessories: v.optional(v.array(v.string())),
    neckline: v.optional(v.string()),
    price: v.optional(v.number()),
    addedAt: v.number(),
  })
    .index("by_sessionId", ["sessionId"]),

  // ============================
  // ORDERS (purchase orders from mirror/checkout)
  // ============================
  orders: defineTable({
    orderId: v.string(), // 6-char token
    sessionId: v.optional(v.string()),
    storeId: v.string(),
    customerId: v.optional(v.id("customers")),
    customerPhone: v.optional(v.string()),
    items: v.array(v.object({
      sareeId: v.id("sarees"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
    })),
    subtotal: v.number(),
    gst: v.number(),
    total: v.number(),
    status: v.string(), // "pending" | "confirmed" | "completed" | "cancelled"
    paymentMethod: v.optional(v.string()),
    qrExpiry: v.optional(v.number()), // timestamp
    createdAt: v.number(),
  })
    .index("by_orderId", ["orderId"])
    .index("by_storeId", ["storeId"])
    .index("by_customerId", ["customerId"]),

  // ============================
  // DEVICES
  // ============================
  devices: defineTable({
    deviceId: v.string(),
    type: v.string(), // "Mirror" | "Tablet"
    storeRef: v.optional(v.id("stores")),
    storeName: v.string(),
    storeId: v.string(),
    status: v.string(), // "online" | "offline"
    lifecycle: v.string(), // "PROVISIONED" | "SHIPPING" | "INSTALLING" | "ACTIVE" | "OFFLINE" | "MAINTENANCE" | "DECOMMISSIONED"
    uptime: v.number(),
    gpuLatency: v.number(),
    cpuPercent: v.number(),
    gpuTemp: v.number(),
    memoryGb: v.number(),
    fps: v.number(),
    lastSeen: v.string(),
    certExpiry: v.string(),
    offlineQueue: v.number(),
    note: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    iotDeviceId: v.optional(v.string()),
    firmwareVersion: v.optional(v.string()),
  })
    .index("by_deviceId", ["deviceId"])
    .index("by_storeId", ["storeId"])
    .index("by_status", ["status"]),

  // ============================
  // AI AGENTS
  // ============================
  agents: defineTable({
    agentId: v.string(),
    name: v.string(),
    phase: v.number(),
    mode: v.string(),
    status: v.string(),
    actions: v.number(),
    accuracy: v.number(),
    costPerDay: v.number(),
    storesUsing: v.number(),
    cycleTime: v.string(),
    lastResult: v.string(),
    humanComparison: v.optional(v.string()),
  })
    .index("by_agentId", ["agentId"])
    .index("by_status", ["status"]),

  // ============================
  // AGENT TOOLS
  // ============================
  agentTools: defineTable({
    toolId: v.string(),
    name: v.string(),
    description: v.string(),
    agents: v.string(),
    approval: v.string(),
    usedToday: v.number(),
    limit: v.string(),
  }).index("by_toolId", ["toolId"]),

  // ============================
  // AI MODELS
  // ============================
  models: defineTable({
    modelId: v.string(),
    name: v.string(),
    version: v.string(),
    type: v.string(),
    latency: v.number(),
    accuracy: v.number(),
    drift: v.number(),
    storesUsing: v.number(),
    dataPoints: v.array(v.object({ w: v.number(), v: v.number() })),
  }).index("by_modelId", ["modelId"]),

  // ============================
  // TICKETS
  // ============================
  tickets: defineTable({
    ticketId: v.string(),
    storeName: v.string(),
    subject: v.string(),
    priority: v.string(),
    status: v.string(),
    sla: v.optional(v.string()),
    aiDiagnosis: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
  })
    .index("by_ticketId", ["ticketId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),

  // ============================
  // INVOICES
  // ============================
  invoices: defineTable({
    invoiceId: v.string(),
    storeName: v.string(),
    storeRef: v.optional(v.id("stores")),
    amount: v.number(),
    gst: v.number(),
    total: v.number(),
    date: v.string(),
    status: v.string(),
    dueDate: v.string(),
  })
    .index("by_invoiceId", ["invoiceId"])
    .index("by_status", ["status"]),

  // ============================
  // VENDORS
  // ============================
  vendors: defineTable({
    name: v.string(),
    type: v.string(),
    dpaStatus: v.string(),
    riskLevel: v.string(),
    monthlySpend: v.number(),
  }).index("by_name", ["name"]),

  // ============================
  // AUDIT LOG
  // ============================
  auditLog: defineTable({
    timestamp: v.string(),
    action: v.string(),
    user: v.string(),
    category: v.optional(v.string()),
    details: v.optional(v.string()),
  }),

  // ============================
  // FEATURE FLAGS
  // ============================
  featureFlags: defineTable({
    key: v.string(),
    enabled: v.boolean(),
    description: v.optional(v.string()),
  }).index("by_key", ["key"]),

  // ============================
  // PLATFORM CONFIG
  // ============================
  platformConfig: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  // ============================
  // LEGAL DOCS
  // ============================
  legalDocs: defineTable({
    docId: v.string(),
    name: v.string(),
    type: v.string(),
    version: v.string(),
    status: v.string(),
    uploaded: v.string(),
    effective: v.string(),
    fileName: v.string(),
    fileId: v.optional(v.id("_storage")),
    acceptedBy: v.number(),
    description: v.string(),
  })
    .index("by_docId", ["docId"])
    .index("by_type", ["type"]),

  // ============================
  // NOTIFICATION RULES
  // ============================
  notificationRules: defineTable({
    ruleId: v.string(),
    name: v.string(),
    trigger: v.string(),
    target: v.string(),
    channel: v.string(),
    active: v.boolean(),
  }).index("by_ruleId", ["ruleId"]),

  // ============================
  // FESTIVALS
  // ============================
  festivals: defineTable({
    name: v.string(),
    start: v.string(),
    end: v.string(),
    freeze: v.boolean(),
    campaign: v.string(),
  }),

  // ============================
  // CHANGELOG
  // ============================
  changelog: defineTable({
    version: v.string(),
    date: v.string(),
    type: v.string(),
    notes: v.string(),
  }),

  // ============================
  // ON-CALL ROTATION
  // ============================
  onCallRotation: defineTable({
    role: v.string(),
    name: v.string(),
    title: v.string(),
    week: v.string(),
    status: v.string(),
    phone: v.string(),
  }),

  // ============================
  // WHATSAPP TEMPLATES
  // ============================
  waTemplates: defineTable({
    templateId: v.string(),
    name: v.string(),
    status: v.string(),
    agent: v.string(),
    body: v.string(),
  }).index("by_templateId", ["templateId"]),

  // ============================
  // INCIDENTS
  // ============================
  incidents: defineTable({
    incidentId: v.string(),
    severity: v.string(),
    title: v.string(),
    startTime: v.string(),
    endTime: v.optional(v.string()),
    duration: v.optional(v.string()),
    storesAffected: v.number(),
    rootCause: v.optional(v.string()),
    status: v.string(),
  })
    .index("by_incidentId", ["incidentId"])
    .index("by_status", ["status"]),

  // ============================
  // KB ARTICLES
  // ============================
  kbArticles: defineTable({
    articleId: v.string(),
    title: v.string(),
    views: v.number(),
    helpful: v.number(),
    category: v.string(),
    content: v.optional(v.string()),
  }).index("by_articleId", ["articleId"]),

  // ============================
  // RETENTION POLICIES
  // ============================
  retentionPolicies: defineTable({
    policyId: v.string(),
    category: v.string(),
    retention: v.string(),
    deletion: v.string(),
    law: v.string(),
  }).index("by_policyId", ["policyId"]),

  // ============================
  // ROLE EVENTS
  // ============================
  roleEvents: defineTable({
    eventId: v.string(),
    userName: v.string(),
    fromRole: v.string(),
    toRole: v.string(),
    reason: v.string(),
    approvedBy: v.string(),
    date: v.string(),
    approved: v.boolean(),
  }).index("by_eventId", ["eventId"]),
});
