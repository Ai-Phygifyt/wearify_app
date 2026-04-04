import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================
  // STORES
  // ============================
  stores: defineTable({
    storeId: v.string(), // e.g. "ST-001"
    name: v.string(),
    city: v.string(),
    state: v.optional(v.string()),
    address: v.optional(v.string()),
    pin: v.optional(v.string()),
    area: v.optional(v.string()),
    hours: v.optional(v.string()),
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
    onboardingStep: v.number(), // 0-5
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
    billingCycle: v.optional(v.string()), // "monthly" | "annual"
    paymentMethod: v.optional(v.string()),
    // WhatsApp
    whatsappNumber: v.optional(v.string()),
    whatsappVerified: v.optional(v.boolean()),
  })
    .index("by_storeId", ["storeId"])
    .index("by_status", ["status"])
    .index("by_city", ["city"]),

  // ============================
  // DEVICES
  // ============================
  devices: defineTable({
    deviceId: v.string(), // e.g. "MR-001"
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
  // STAFF
  // ============================
  staff: defineTable({
    name: v.string(),
    phone: v.string(),
    pin: v.optional(v.string()),
    role: v.string(), // "R01" - "R07"
    storeRef: v.optional(v.id("stores")),
    storeId: v.optional(v.string()),
    status: v.optional(v.string()),
  })
    .index("by_storeId", ["storeId"])
    .index("by_role", ["role"]),

  // ============================
  // AI AGENTS
  // ============================
  agents: defineTable({
    agentId: v.string(),
    name: v.string(),
    phase: v.number(),
    mode: v.string(), // "supervised" | "autonomous" | "shadow" | "off"
    status: v.string(), // "running" | "paused" | "planned"
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
    agents: v.string(), // comma-separated agent IDs
    approval: v.string(), // "Auto" | "Owner" | "System" | "Manager"
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
    type: v.string(), // "Pose" | "VTON" | "Skin" | "Search" | "Forecast" | "LLM"
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
    priority: v.string(), // "P1" | "P2" | "P3"
    status: v.string(), // "open" | "progress" | "resolved"
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
    status: v.string(), // "paid" | "pending" | "overdue" | "trial"
    dueDate: v.string(),
  })
    .index("by_invoiceId", ["invoiceId"])
    .index("by_status", ["status"]),

  // ============================
  // VENDORS
  // ============================
  vendors: defineTable({
    name: v.string(),
    type: v.string(), // "Cloud" | "WhatsApp" | "Payments" | "LLM" | "SMS" | "Vector DB"
    dpaStatus: v.string(), // "Signed" | "Pending"
    riskLevel: v.string(), // "Low" | "Medium" | "High"
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
    type: v.string(), // "retailer" | "customer"
    version: v.string(),
    status: v.string(), // "active" | "archived"
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
  // TAILORS
  // ============================
  tailors: defineTable({
    tailorId: v.string(),
    name: v.string(),
    city: v.string(),
    status: v.string(), // "verified" | "pending"
    referrals: v.number(),
    revenue: v.number(),
    rating: v.number(),
    specialization: v.string(),
  }).index("by_tailorId", ["tailorId"]),

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
    type: v.string(), // "Major" | "Minor" | "Patch"
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
    status: v.string(), // "Approved" | "Pending"
    agent: v.string(),
    body: v.string(),
  }).index("by_templateId", ["templateId"]),

  // ============================
  // SESSIONS (Live Mirror Sessions)
  // ============================
  sessions: defineTable({
    sessionId: v.string(),
    storeName: v.string(),
    staffName: v.string(),
    mirrorId: v.string(),
    duration: v.string(),
    sareesTriedOn: v.number(),
    status: v.string(), // "active" | "completed"
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_status", ["status"]),

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
    status: v.string(), // "open" | "resolved"
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
