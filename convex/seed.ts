import { internalMutation } from "./_generated/server";

export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingStore = await ctx.db.query("stores").first();
    if (existingStore) return "Already seeded";

    // ===================== STORES =====================
    const stores = [
      { storeId: "ST-001", name: "MAUVE Sarees", city: "Mumbai", status: "active", plan: "Smart", mrr: 15000, healthScore: 94, conversionRate: 42, sessions: 23, churnRisk: 12, featureScore: 78, catalogUtilization: 92, agreementStatus: "signed", discountCode: "Early Adopter 40%", onboardingStep: 5, ownerName: "Smita Kabra", ownerPhone: "+91 98XXXXXXXX" },
      { storeId: "ST-002", name: "Silk Heritage", city: "Delhi", status: "active", plan: "Smart", mrr: 15000, healthScore: 88, conversionRate: 38, sessions: 18, churnRisk: 22, featureScore: 65, catalogUtilization: 85, agreementStatus: "signed", discountCode: "Annual 25%", onboardingStep: 5, ownerName: "Raj Kumar", ownerPhone: "+91 97XXXXXXXX" },
      { storeId: "ST-003", name: "Kanchi Collections", city: "Chennai", status: "active", plan: "Digital", mrr: 10000, healthScore: 96, conversionRate: 45, sessions: 31, churnRisk: 5, featureScore: 88, catalogUtilization: 95, agreementStatus: "signed", onboardingStep: 5, ownerName: "Priya Rajan", ownerPhone: "+91 96XXXXXXXX" },
      { storeId: "ST-004", name: "Banarasi House", city: "Varanasi", status: "trial", plan: "Trial", mrr: 0, healthScore: 72, conversionRate: 22, sessions: 8, churnRisk: 45, featureScore: 42, catalogUtilization: 60, agreementStatus: "pending", discountCode: "Trial", onboardingStep: 3, ownerName: "Vikram Singh", ownerPhone: "+91 95XXXXXXXX" },
      { storeId: "ST-005", name: "Patola Palace", city: "Surat", status: "active", plan: "Smart", mrr: 15000, healthScore: 91, conversionRate: 40, sessions: 26, churnRisk: 15, featureScore: 72, catalogUtilization: 88, agreementStatus: "signed", onboardingStep: 5, ownerName: "Meena Patel", ownerPhone: "+91 94XXXXXXXX" },
      { storeId: "ST-006", name: "Tant Bangla", city: "Kolkata", status: "active", plan: "Digital", mrr: 10000, healthScore: 85, conversionRate: 35, sessions: 14, churnRisk: 18, featureScore: 58, catalogUtilization: 78, agreementStatus: "signed", discountCode: "Association 30%", onboardingStep: 4, ownerName: "Anita Das", ownerPhone: "+91 93XXXXXXXX" },
      { storeId: "ST-007", name: "Mysore Silks", city: "Bangalore", status: "churned", plan: "---", mrr: 0, healthScore: 0, conversionRate: 0, sessions: 0, churnRisk: 100, featureScore: 0, catalogUtilization: 0, agreementStatus: "terminated", onboardingStep: 0 },
      { storeId: "ST-008", name: "Royal Weaves", city: "Jaipur", status: "trial", plan: "Trial", mrr: 0, healthScore: 68, conversionRate: 18, sessions: 5, churnRisk: 55, featureScore: 35, catalogUtilization: 45, agreementStatus: "pending", discountCode: "Trial", onboardingStep: 2, ownerName: "Deepak Sharma", ownerPhone: "+91 92XXXXXXXX" },
    ];

    const storeIds: Record<string, string> = {};
    for (const store of stores) {
      const id = await ctx.db.insert("stores", store);
      storeIds[store.storeId] = id;
    }

    // ===================== DEVICES =====================
    const devices = [
      { deviceId: "MR-001", type: "Mirror", storeName: "MAUVE Sarees", storeId: "ST-001", status: "online", lifecycle: "ACTIVE", uptime: 99.8, gpuLatency: 45, cpuPercent: 42, gpuTemp: 58, memoryGb: 4.2, fps: 28, lastSeen: "2m", certExpiry: "Dec 2026", offlineQueue: 0, note: "Top performer" },
      { deviceId: "MR-002", type: "Mirror", storeName: "Silk Heritage", storeId: "ST-002", status: "online", lifecycle: "ACTIVE", uptime: 99.2, gpuLatency: 52, cpuPercent: 38, gpuTemp: 55, memoryGb: 3.8, fps: 30, lastSeen: "5m", certExpiry: "Dec 2026", offlineQueue: 0, note: "Healthy" },
      { deviceId: "MR-003", type: "Mirror", storeName: "Kanchi Collections", storeId: "ST-003", status: "online", lifecycle: "ACTIVE", uptime: 99.9, gpuLatency: 41, cpuPercent: 35, gpuTemp: 52, memoryGb: 3.5, fps: 30, lastSeen: "1m", certExpiry: "Nov 2026", offlineQueue: 0, note: "Lowest latency" },
      { deviceId: "TB-001", type: "Tablet", storeName: "MAUVE Sarees", storeId: "ST-001", status: "online", lifecycle: "ACTIVE", uptime: 98.5, gpuLatency: 0, cpuPercent: 22, gpuTemp: 0, memoryGb: 1.8, fps: 0, lastSeen: "8m", certExpiry: "Dec 2026", offlineQueue: 0, note: "Android tablet" },
      { deviceId: "MR-004", type: "Mirror", storeName: "Banarasi House", storeId: "ST-004", status: "offline", lifecycle: "OFFLINE", uptime: 87.3, gpuLatency: 0, cpuPercent: 0, gpuTemp: 82, memoryGb: 0, fps: 0, lastSeen: "3h", certExpiry: "Dec 2026", offlineQueue: 1842, note: "GPU thermal 82C" },
      { deviceId: "TB-002", type: "Tablet", storeName: "Patola Palace", storeId: "ST-005", status: "online", lifecycle: "ACTIVE", uptime: 99.1, gpuLatency: 0, cpuPercent: 18, gpuTemp: 0, memoryGb: 1.5, fps: 0, lastSeen: "12m", certExpiry: "Jan 2027", offlineQueue: 0, note: "Healthy" },
    ];

    for (const device of devices) {
      await ctx.db.insert("devices", device);
    }

    // ===================== AI AGENTS =====================
    const agents = [
      { agentId: "AGT-01", name: "Inventory Optimiser", phase: 1, mode: "supervised", status: "running", actions: 12, accuracy: 94.2, costPerDay: 85, storesUsing: 6, cycleTime: "14m", lastResult: "Detected 12 slow-moving silks at Silk Heritage. Generated 3 discount bundles + 1 reorder draft.", humanComparison: "Agent accuracy: 78% match with owner decisions." },
      { agentId: "AGT-02", name: "Campaign Orchestrator", phase: 1, mode: "supervised", status: "running", actions: 4, accuracy: 91.5, costPerDay: 120, storesUsing: 6, cycleTime: "2h", lastResult: "Scheduled Diwali early-bird for 3 stores. Audience: 842 opted-in.", humanComparison: "80% alignment with owner preferences." },
      { agentId: "AGT-03", name: "Store Health Monitor", phase: 1, mode: "autonomous", status: "running", actions: 8, accuracy: 97.1, costPerDay: 45, storesUsing: 8, cycleTime: "58m", lastResult: "Revenue down 18% at Silk Heritage. Root cause: conversion dropped 25%.", humanComparison: "100% detection accuracy." },
      { agentId: "AGT-04", name: "Customer Intelligence", phase: 2, mode: "shadow", status: "running", actions: 0, accuracy: 88.4, costPerDay: 95, storesUsing: 3, cycleTime: "6h", lastResult: "Shadow mode. 15 VIP churn risk flagged. Confidence: 0.84.", humanComparison: "Shadow: logging only." },
      { agentId: "AGT-05", name: "Pricing Strategist", phase: 2, mode: "shadow", status: "paused", actions: 0, accuracy: 85.2, costPerDay: 0, storesUsing: 0, cycleTime: "1d", lastResult: "Paused. Last: 15% discount on Chanderi would yield Rs 12K incremental.", humanComparison: "Paused - no comparison data yet." },
      { agentId: "AGT-06", name: "Staff Coach", phase: 2, mode: "shadow", status: "running", actions: 0, accuracy: 82.6, costPerDay: 60, storesUsing: 3, cycleTime: "12h", lastResult: "Coaching tip for Ravi (MAUVE): upsell rate 12% below avg.", humanComparison: "Shadow: tips generated but not yet delivered." },
      { agentId: "AGT-07", name: "Network Intelligence", phase: 3, mode: "off", status: "planned", actions: 0, accuracy: 0, costPerDay: 0, storesUsing: 0, cycleTime: "---", lastResult: "Phase 3. Requires 50+ stores.", humanComparison: "Not deployed." },
      { agentId: "AGT-08", name: "Manufacturer Insights", phase: 3, mode: "off", status: "planned", actions: 0, accuracy: 0, costPerDay: 0, storesUsing: 0, cycleTime: "---", lastResult: "Phase 3. Revenue Stream 3.", humanComparison: "Not deployed." },
    ];

    for (const agent of agents) {
      await ctx.db.insert("agents", agent);
    }

    // ===================== AUDIT LOG =====================
    const auditEntries = [
      { timestamp: "10:42", action: "Emergency stop MR-004 (Banarasi House)", user: "admin@phygifyt.com" },
      { timestamp: "09:15", action: "Onboarding approved: Tant Bangla", user: "admin@phygifyt.com" },
      { timestamp: "08:30", action: "Model v2.3 staged rollout (6 stores)", user: "admin@phygifyt.com" },
      { timestamp: "Yest", action: "Feature flag: tailor_marketplace ON", user: "admin@phygifyt.com" },
      { timestamp: "2d", action: "DPDP erasure: customer C-4421", user: "admin@phygifyt.com" },
      { timestamp: "2d", action: "AGT-01 mode: shadow to supervised", user: "admin@phygifyt.com" },
      { timestamp: "3d", action: "API key rotated: svc-whatsapp", user: "admin@phygifyt.com" },
      { timestamp: "3d", action: "Service credit Rs 750 for ST-002", user: "admin@phygifyt.com" },
      { timestamp: "4d", action: "DR drill: RDS restore passed (28 min)", user: "admin@phygifyt.com" },
    ];

    for (const entry of auditEntries) {
      await ctx.db.insert("auditLog", entry);
    }

    // ===================== FEATURE FLAGS =====================
    const flags = [
      { key: "tailor_marketplace", enabled: true, description: "Enable tailor marketplace for blouse referrals" },
      { key: "ai_stylist_v2", enabled: true, description: "AI Stylist v2 with enhanced recommendations" },
      { key: "demand_forecast", enabled: false, description: "Demand forecasting using DemandForecaster model" },
      { key: "voice_search", enabled: true, description: "Hindi/English voice-based catalog search" },
      { key: "skin_tone", enabled: true, description: "Skin tone analysis for color recommendations" },
      { key: "model_ab_test", enabled: false, description: "A/B testing for model versions" },
      { key: "network_trends", enabled: true, description: "Network-wide anonymized trend data" },
      { key: "promoted_placement", enabled: false, description: "Promoted product placements (Revenue Stream 5)" },
      { key: "saree_care_sub", enabled: false, description: "Saree care subscription service (Revenue Stream 7)" },
    ];

    for (const flag of flags) {
      await ctx.db.insert("featureFlags", flag);
    }

    // ===================== PLATFORM CONFIG =====================
    const configs = [
      { key: "Platform", value: "Wearify" },
      { key: "Entity", value: "Phygify Technoservices Pvt. Ltd." },
      { key: "Region", value: "ap-south-1 (Mumbai)" },
      { key: "DR", value: "ap-south-2 (Hyderabad)" },
      { key: "OTA Window", value: "2-5 AM IST" },
      { key: "Session Timeout", value: "1h admin / 7d owner" },
      { key: "Max Discount", value: "40% MRP" },
      { key: "LLM", value: "Claude Sonnet 4.5" },
      { key: "Data Residency", value: "India only" },
      { key: "DPIIT", value: "Active" },
    ];

    for (const config of configs) {
      await ctx.db.insert("platformConfig", config);
    }

    // ===================== VENDORS =====================
    const vendorsList = [
      { name: "AWS", type: "Cloud", dpaStatus: "Signed", riskLevel: "Low", monthlySpend: 52000 },
      { name: "Gupshup", type: "WhatsApp", dpaStatus: "Signed", riskLevel: "Low", monthlySpend: 8500 },
      { name: "Razorpay", type: "Payments", dpaStatus: "Signed", riskLevel: "Low", monthlySpend: 3200 },
      { name: "Anthropic", type: "LLM", dpaStatus: "Signed", riskLevel: "Medium", monthlySpend: 12000 },
      { name: "MSG91", type: "SMS", dpaStatus: "Signed", riskLevel: "Low", monthlySpend: 1800 },
      { name: "Pinecone", type: "Vector DB", dpaStatus: "Pending", riskLevel: "Medium", monthlySpend: 4500 },
    ];

    for (const vendor of vendorsList) {
      await ctx.db.insert("vendors", vendor);
    }

    // ===================== TICKETS =====================
    const ticketsList = [
      { ticketId: "TK-101", storeName: "Banarasi House", subject: "Mirror not detecting body", priority: "P1", status: "open", sla: "1h 42m", aiDiagnosis: "GPU thermal 82C -> FPS dropped to 8 -> PoseNet failing. Restart + thermal audit. Conf: 0.93." },
      { ticketId: "TK-098", storeName: "MAUVE Sarees", subject: "WhatsApp share delay >5s", priority: "P2", status: "progress", sla: "---", aiDiagnosis: "Gupshup API spike (p95: 4.2s). External. SMS fallback activated. Conf: 0.96." },
      { ticketId: "TK-095", storeName: "Silk Heritage", subject: "Catalog .webp upload fails", priority: "P3", status: "resolved", sla: "---", aiDiagnosis: "Added .webp support in v2.3.1. 0 recurrence. Conf: 1.00." },
    ];

    for (const ticket of ticketsList) {
      await ctx.db.insert("tickets", ticket);
    }

    // ===================== AGENT TOOLS =====================
    const tools = [
      { toolId: "T-01", name: "InventoryUpdate", description: "Update saree status/tags", agents: "AGT-01", approval: "Auto", usedToday: 8, limit: "unlimited" },
      { toolId: "T-02", name: "DiscountRecommend", description: "Create discount recommendation", agents: "AGT-01, AGT-05", approval: "Owner", usedToday: 2, limit: "10/day" },
      { toolId: "T-03", name: "BundleCreate", description: "Create product bundle", agents: "AGT-01, AGT-05", approval: "Owner", usedToday: 1, limit: "5/day" },
      { toolId: "T-04", name: "ReorderGenerate", description: "Generate purchase order draft", agents: "AGT-01", approval: "Owner", usedToday: 1, limit: "3/day" },
      { toolId: "T-05", name: "CatalogPromote", description: "Feature items in catalog", agents: "AGT-01, AGT-03", approval: "Auto", usedToday: 4, limit: "10/day" },
      { toolId: "T-06", name: "CampaignDraft", description: "Draft WhatsApp campaign", agents: "AGT-02", approval: "Owner", usedToday: 3, limit: "4/week" },
      { toolId: "T-07", name: "MessageSend", description: "Send approved campaign", agents: "AGT-02", approval: "System", usedToday: 1, limit: "1/week/store" },
      { toolId: "T-08", name: "InsightPush", description: "Push insight to dashboard", agents: "ALL", approval: "Auto", usedToday: 6, limit: "unlimited" },
      { toolId: "T-09", name: "AlertSend", description: "Send alert to owner", agents: "AGT-03", approval: "Auto", usedToday: 2, limit: "5/day" },
      { toolId: "T-10", name: "HealthScoreUpdate", description: "Update store health score", agents: "AGT-03", approval: "Auto", usedToday: 5, limit: "hourly" },
      { toolId: "T-11", name: "CoachingTipGen", description: "Generate micro-coaching tip", agents: "AGT-06", approval: "Manager", usedToday: 3, limit: "1/staff/day" },
      { toolId: "T-12", name: "ForecastQuery", description: "Query demand forecast model", agents: "AGT-01, AGT-05", approval: "Auto", usedToday: 4, limit: "unlimited" },
      { toolId: "T-13", name: "CustomerScore", description: "Compute customer health score", agents: "AGT-04", approval: "Auto", usedToday: 15, limit: "unlimited" },
      { toolId: "T-14", name: "SegmentUpdate", description: "Update customer micro-segments", agents: "AGT-04", approval: "Auto", usedToday: 1, limit: "weekly" },
      { toolId: "T-15", name: "NetworkAggregate", description: "Compute anonymised trends", agents: "AGT-07", approval: "Auto", usedToday: 0, limit: "weekly" },
    ];

    for (const tool of tools) {
      await ctx.db.insert("agentTools", tool);
    }

    // ===================== AI MODELS =====================
    const models = [
      { modelId: "M-01", name: "PoseNet-Saree", version: "v2.3", type: "Pose", latency: 18, accuracy: 96.8, drift: 0.2, storesUsing: 6, dataPoints: [{ w: 1, v: 96.2 }, { w: 2, v: 96.5 }, { w: 3, v: 96.8 }, { w: 4, v: 96.7 }, { w: 5, v: 96.9 }, { w: 6, v: 96.8 }] },
      { modelId: "M-02", name: "SareeDrape-VTON", version: "v2.3", type: "VTON", latency: 420, accuracy: 93.4, drift: 0.8, storesUsing: 6, dataPoints: [{ w: 1, v: 94.0 }, { w: 2, v: 93.8 }, { w: 3, v: 93.6 }, { w: 4, v: 93.5 }, { w: 5, v: 93.4 }, { w: 6, v: 93.4 }] },
      { modelId: "M-03", name: "SkinTone-Analyzer", version: "v1.8", type: "Skin", latency: 140, accuracy: 91.2, drift: 1.1, storesUsing: 6, dataPoints: [{ w: 1, v: 92.1 }, { w: 2, v: 91.9 }, { w: 3, v: 91.5 }, { w: 4, v: 91.3 }, { w: 5, v: 91.2 }, { w: 6, v: 91.2 }] },
      { modelId: "M-07", name: "VisualSearch-CNN", version: "v1.5", type: "Search", latency: 85, accuracy: 89.7, drift: 1.5, storesUsing: 4, dataPoints: [{ w: 1, v: 91.0 }, { w: 2, v: 90.5 }, { w: 3, v: 90.0 }, { w: 4, v: 89.8 }, { w: 5, v: 89.7 }, { w: 6, v: 89.7 }] },
      { modelId: "M-08", name: "DemandForecaster", version: "v1.2", type: "Forecast", latency: 2100, accuracy: 87.3, drift: 2.0, storesUsing: 6, dataPoints: [{ w: 1, v: 89.0 }, { w: 2, v: 88.5 }, { w: 3, v: 88.0 }, { w: 4, v: 87.5 }, { w: 5, v: 87.3 }, { w: 6, v: 87.3 }] },
      { modelId: "LLM", name: "Claude Sonnet 4.5", version: "4.5", type: "LLM", latency: 1200, accuracy: 98.8, drift: 0.1, storesUsing: 6, dataPoints: [{ w: 1, v: 98.7 }, { w: 2, v: 98.8 }, { w: 3, v: 98.8 }, { w: 4, v: 98.9 }, { w: 5, v: 98.8 }, { w: 6, v: 98.8 }] },
    ];

    for (const model of models) {
      await ctx.db.insert("models", model);
    }

    // ===================== INVOICES =====================
    const invoicesList = [
      { invoiceId: "INV-001", storeName: "MAUVE Sarees", amount: 15000, gst: 2700, total: 17700, date: "Mar 1", status: "paid", dueDate: "Mar 8" },
      { invoiceId: "INV-002", storeName: "Silk Heritage", amount: 15000, gst: 2700, total: 17700, date: "Mar 1", status: "paid", dueDate: "Mar 8" },
      { invoiceId: "INV-003", storeName: "Kanchi Collections", amount: 10000, gst: 1800, total: 11800, date: "Mar 1", status: "paid", dueDate: "Mar 8" },
      { invoiceId: "INV-004", storeName: "Patola Palace", amount: 15000, gst: 2700, total: 17700, date: "Mar 1", status: "paid", dueDate: "Mar 8" },
      { invoiceId: "INV-005", storeName: "Tant Bangla", amount: 10000, gst: 1800, total: 11800, date: "Mar 1", status: "paid", dueDate: "Mar 8" },
      { invoiceId: "INV-006", storeName: "Royal Weaves", amount: 0, gst: 0, total: 0, date: "---", status: "trial", dueDate: "---" },
    ];

    for (const invoice of invoicesList) {
      await ctx.db.insert("invoices", invoice);
    }

    // ===================== SESSIONS =====================
    const sessionsList = [
      { sessionId: "S-2841", storeName: "MAUVE Sarees", staffName: "Deepa", mirrorId: "MR-001", duration: "12m", sareesTriedOn: 6, status: "active" },
      { sessionId: "S-2840", storeName: "Kanchi Collections", staffName: "Ravi", mirrorId: "MR-003", duration: "8m", sareesTriedOn: 4, status: "active" },
      { sessionId: "S-2839", storeName: "Patola Palace", staffName: "Meena", mirrorId: "MR-002", duration: "22m", sareesTriedOn: 9, status: "completed" },
    ];

    for (const session of sessionsList) {
      await ctx.db.insert("sessions", session);
    }

    // ===================== INCIDENTS =====================
    const incidentsList = [
      { incidentId: "INC-012", severity: "P2", title: "Gupshup API degradation", startTime: "Mar 14 08:20", endTime: "Mar 14 09:45", duration: "85min", storesAffected: 6, rootCause: "External provider outage", status: "resolved" },
      { incidentId: "INC-011", severity: "P3", title: "RDS connection pool exhaustion", startTime: "Mar 10 14:00", endTime: "Mar 10 14:28", duration: "28min", storesAffected: 8, rootCause: "Idle connection leak in campaign service", status: "resolved" },
    ];

    for (const incident of incidentsList) {
      await ctx.db.insert("incidents", incident);
    }

    // ===================== KB ARTICLES =====================
    const kbArticlesList = [
      { articleId: "KB-01", title: "Mirror not detecting body poses", views: 42, helpful: 89, category: "Troubleshoot" },
      { articleId: "KB-02", title: "How to upload sarees using photo booth", views: 128, helpful: 95, category: "Guide" },
      { articleId: "KB-03", title: "WhatsApp campaign best practices", views: 85, helpful: 91, category: "Guide" },
      { articleId: "KB-04", title: "Understanding your Store Health Score", views: 64, helpful: 87, category: "Analytics" },
    ];

    for (const article of kbArticlesList) {
      await ctx.db.insert("kbArticles", article);
    }

    // ===================== TAILORS =====================
    const tailorsList = [
      { tailorId: "TL-001", name: "Stitchwell Tailors", city: "Mumbai", status: "verified", referrals: 42, revenue: 4200, rating: 4.6, specialization: "Blouse + Petticoat" },
      { tailorId: "TL-002", name: "Rupa Designers", city: "Delhi", status: "verified", referrals: 28, revenue: 2800, rating: 4.3, specialization: "Blouse specialist" },
      { tailorId: "TL-003", name: "Kamala Tailoring", city: "Chennai", status: "pending", referrals: 0, revenue: 0, rating: 0, specialization: "All ethnic wear" },
      { tailorId: "TL-004", name: "Sai Stitching", city: "Surat", status: "verified", referrals: 35, revenue: 3500, rating: 4.8, specialization: "Premium blouse" },
    ];

    for (const tailor of tailorsList) {
      await ctx.db.insert("tailors", tailor);
    }

    // ===================== LEGAL DOCS =====================
    const legalDocsList = [
      { docId: "LD-01", name: "Master Service Agreement (MSA)", type: "retailer", version: "v2.1", status: "active", uploaded: "Jan 2026", effective: "Jan 15, 2026", fileName: "MSA_v2.1.pdf", acceptedBy: 6, description: "Core SaaS subscription terms for retailers" },
      { docId: "LD-02", name: "Data Processing Agreement (DPA)", type: "retailer", version: "v1.3", status: "active", uploaded: "Jan 2026", effective: "Jan 15, 2026", fileName: "DPA_v1.3.pdf", acceptedBy: 6, description: "DPDP-compliant data processing terms" },
      { docId: "LD-03", name: "Acceptable Use Policy (AUP)", type: "retailer", version: "v1.0", status: "active", uploaded: "Jan 2026", effective: "Jan 15, 2026", fileName: "AUP_v1.0.pdf", acceptedBy: 6, description: "Platform acceptable use guidelines" },
      { docId: "LD-04", name: "Hardware Lease Agreement", type: "retailer", version: "v1.2", status: "active", uploaded: "Feb 2026", effective: "Feb 1, 2026", fileName: "HW_Lease_v1.2.pdf", acceptedBy: 4, description: "Mirror/tablet hardware lease terms" },
      { docId: "LD-05", name: "Customer Privacy Notice", type: "customer", version: "v1.1", status: "active", uploaded: "Jan 2026", effective: "Jan 15, 2026", fileName: "Privacy_Notice_v1.1.pdf", acceptedBy: 0, description: "End-customer DPDP privacy notice" },
      { docId: "LD-06", name: "Customer Terms of Service", type: "customer", version: "v1.0", status: "active", uploaded: "Jan 2026", effective: "Jan 15, 2026", fileName: "Customer_ToS_v1.0.pdf", acceptedBy: 0, description: "PWA/customer-facing terms" },
    ];

    for (const doc of legalDocsList) {
      await ctx.db.insert("legalDocs", doc);
    }

    // ===================== NOTIFICATION RULES =====================
    const notifRules = [
      { ruleId: "NR-01", name: "Device Offline Alert", trigger: "device.status == offline > 5min", target: "Admin + Store Owner", channel: "WhatsApp + Email", active: true },
      { ruleId: "NR-02", name: "P1 Ticket Escalation", trigger: "ticket.priority == P1 && !assigned > 15min", target: "On-Call Engineer", channel: "WhatsApp + PagerDuty", active: true },
      { ruleId: "NR-03", name: "Daily Health Digest", trigger: "cron: 09:00 IST daily", target: "Admin", channel: "Email", active: true },
      { ruleId: "NR-04", name: "Churn Risk Alert", trigger: "store.churnRisk > 40", target: "Admin + CSM", channel: "WhatsApp", active: true },
      { ruleId: "NR-05", name: "Revenue Milestone", trigger: "store.mrr crosses threshold", target: "Admin", channel: "Slack", active: false },
    ];

    for (const rule of notifRules) {
      await ctx.db.insert("notificationRules", rule);
    }

    // ===================== FESTIVALS =====================
    const festivalsList = [
      { name: "Navratri", start: "Oct 2", end: "Oct 12", freeze: true, campaign: "AGT-02 scheduled" },
      { name: "Diwali", start: "Oct 20", end: "Nov 1", freeze: true, campaign: "Peak revenue period" },
      { name: "Wedding Season", start: "Nov 1", end: "Feb 28", freeze: false, campaign: "High demand sustained" },
      { name: "Pongal", start: "Jan 14", end: "Jan 17", freeze: true, campaign: "Tamil Nadu focus" },
      { name: "Ugadi", start: "Mar 30", end: "Apr 1", freeze: true, campaign: "Telugu/Kannada focus" },
    ];

    for (const festival of festivalsList) {
      await ctx.db.insert("festivals", festival);
    }

    // ===================== CHANGELOG =====================
    const changelogList = [
      { version: "v2.3.1", date: "Mar 12", type: "Patch", notes: "Added .webp support, performance fixes" },
      { version: "v2.3.0", date: "Mar 10", type: "Minor", notes: "Model v2.3 rollout, skin tone improvements" },
      { version: "v2.2.0", date: "Feb 28", type: "Minor", notes: "SkinTone v1.8, campaign analytics" },
      { version: "v2.1.0", date: "Feb 14", type: "Minor", notes: "Kanjivaram support, WhatsApp share v2" },
      { version: "v2.0.0", date: "Jan 15", type: "Major", notes: "Platform launch, 5 pilot stores" },
    ];

    for (const entry of changelogList) {
      await ctx.db.insert("changelog", entry);
    }

    // ===================== ON-CALL ROTATION =====================
    const onCallList = [
      { role: "Primary", name: "Arjun M.", title: "SRE Lead", week: "This week", status: "active", phone: "+91 98XXXXXXX1" },
      { role: "Secondary", name: "Priya S.", title: "Backend Engineer", week: "This week", status: "active", phone: "+91 98XXXXXXX2" },
      { role: "Escalation", name: "Vikram R.", title: "CTO", week: "Always", status: "active", phone: "+91 98XXXXXXX3" },
    ];

    for (const person of onCallList) {
      await ctx.db.insert("onCallRotation", person);
    }

    // ===================== WHATSAPP TEMPLATES =====================
    const waTemplatesList = [
      { templateId: "WA-01", name: "welcome_store", status: "Approved", agent: "AGT-02", body: "Welcome to Wearify! Your smart mirror is ready. Start your first session today." },
      { templateId: "WA-02", name: "campaign_festival", status: "Approved", agent: "AGT-02", body: "{{festival}} special! Visit {{store}} to try the latest collection on our AI mirror." },
      { templateId: "WA-03", name: "session_share", status: "Approved", agent: "System", body: "Here are your looks from {{store}}! View your virtual try-on: {{link}}" },
      { templateId: "WA-04", name: "churn_reengagement", status: "Pending", agent: "AGT-04", body: "We miss you at {{store}}! New arrivals await. Book a session: {{link}}" },
    ];

    for (const template of waTemplatesList) {
      await ctx.db.insert("waTemplates", template);
    }

    // ===================== RETENTION POLICIES =====================
    const retentionList = [
      { policyId: "RP-01", category: "Camera frames (raw)", retention: "0 — never stored", deletion: "Real-time discard", law: "DPDP S4" },
      { policyId: "RP-02", category: "Try-on images (processed)", retention: "90 days", deletion: "Auto-delete", law: "DPDP S8(7)" },
      { policyId: "RP-03", category: "Session analytics", retention: "2 years", deletion: "Anonymise → archive", law: "IT Act 43A" },
      { policyId: "RP-04", category: "Customer PII", retention: "Until consent withdrawn", deletion: "Erasure within 72h", law: "DPDP S12-13" },
      { policyId: "RP-05", category: "Transaction records", retention: "8 years", deletion: "Archive to cold storage", law: "GST Act" },
      { policyId: "RP-06", category: "Audit logs", retention: "5 years", deletion: "Immutable, no deletion", law: "IT Act" },
    ];

    for (const policy of retentionList) {
      await ctx.db.insert("retentionPolicies", policy);
    }

    // ===================== ROLE EVENTS =====================
    const roleEventsList = [
      { eventId: "RE-01", userName: "Deepa K.", fromRole: "R03", toRole: "R02", reason: "Promotion to Store Manager", approvedBy: "admin@phygifyt.com", date: "Mar 12", approved: true },
      { eventId: "RE-02", userName: "Ravi M.", fromRole: "R04", toRole: "R03", reason: "Training completed", approvedBy: "admin@phygifyt.com", date: "Mar 8", approved: true },
      { eventId: "RE-03", userName: "Amit S.", fromRole: "R03", toRole: "R05", reason: "Role reassignment", approvedBy: "admin@phygifyt.com", date: "Feb 28", approved: true },
    ];

    for (const event of roleEventsList) {
      await ctx.db.insert("roleEvents", event);
    }

    // ===================== STAFF =====================
    const staffList = [
      { name: "Deepa K.", phone: "+91 98XXXXXX01", role: "R02", storeId: "ST-001", status: "active" },
      { name: "Ravi M.", phone: "+91 98XXXXXX02", role: "R03", storeId: "ST-003", status: "active" },
      { name: "Meena P.", phone: "+91 98XXXXXX03", role: "R03", storeId: "ST-005", status: "active" },
      { name: "Amit S.", phone: "+91 98XXXXXX04", role: "R05", storeId: "ST-002", status: "active" },
      { name: "Priya R.", phone: "+91 98XXXXXX05", role: "R04", storeId: "ST-003", status: "active" },
      { name: "Suresh V.", phone: "+91 98XXXXXX06", role: "R03", storeId: "ST-006", status: "active" },
    ];

    for (const member of staffList) {
      await ctx.db.insert("staff", member);
    }

    return "Seeded successfully";
  },
});
