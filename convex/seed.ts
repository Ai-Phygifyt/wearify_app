import { internalMutation } from "./_generated/server";

export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if our seed data already exists (look for ST-001)
    const existingSeed = await ctx.db.query("stores").withIndex("by_storeId", (q) => q.eq("storeId", "ST-001")).first();
    if (existingSeed) return "Already seeded";

    // ===================== STORES =====================
    const stores = [
      { storeId: "ST-001", name: "MAUVE Sarees", city: "Mumbai", state: "Maharashtra", address: "123 Fashion Street, Dadar", pin: "400028", area: "Dadar", hours: "10:00 AM - 9:00 PM", status: "active", plan: "Smart", mrr: 15000, healthScore: 94, conversionRate: 42, sessions: 23, churnRisk: 12, featureScore: 78, catalogUtilization: 92, agreementStatus: "signed", discountCode: "Early Adopter 40%", onboardingStep: 5, ownerName: "Smita Kabra", ownerPhone: "+919800000001", ownerEmail: "smita@mauvesarees.com", gstin: "27AABCT1234A1Z5", subscriptionPlan: "Professional", catalogueCount: 45, digitisedPercent: 85 },
      { storeId: "ST-002", name: "Silk Heritage", city: "Delhi", state: "Delhi", address: "45 Chandni Chowk", pin: "110006", area: "Chandni Chowk", hours: "10:30 AM - 8:30 PM", status: "active", plan: "Smart", mrr: 15000, healthScore: 88, conversionRate: 38, sessions: 18, churnRisk: 22, featureScore: 65, catalogUtilization: 85, agreementStatus: "signed", discountCode: "Annual 25%", onboardingStep: 5, ownerName: "Raj Kumar", ownerPhone: "+919700000002", ownerEmail: "raj@silkheritage.com", gstin: "07BBACT5678B2Z3", subscriptionPlan: "Professional", catalogueCount: 38, digitisedPercent: 72 },
      { storeId: "ST-003", name: "Kanchi Collections", city: "Chennai", state: "Tamil Nadu", address: "78 T Nagar", pin: "600017", area: "T Nagar", hours: "9:30 AM - 9:00 PM", status: "active", plan: "Digital", mrr: 10000, healthScore: 96, conversionRate: 45, sessions: 31, churnRisk: 5, featureScore: 88, catalogUtilization: 95, agreementStatus: "signed", onboardingStep: 5, ownerName: "Priya Rajan", ownerPhone: "+919600000003", ownerEmail: "priya@kanchi.com", gstin: "33CCCCT9012C3Z1", subscriptionPlan: "Enterprise", catalogueCount: 62, digitisedPercent: 95 },
      { storeId: "ST-004", name: "Banarasi House", city: "Varanasi", state: "Uttar Pradesh", address: "12 Vishwanath Gali", pin: "221001", area: "Vishwanath", hours: "10:00 AM - 8:00 PM", status: "trial", plan: "Trial", mrr: 0, healthScore: 72, conversionRate: 22, sessions: 8, churnRisk: 45, featureScore: 42, catalogUtilization: 60, agreementStatus: "pending", discountCode: "Trial", onboardingStep: 3, ownerName: "Vikram Singh", ownerPhone: "+919500000004", ownerEmail: "vikram@banarasihouse.com" },
      { storeId: "ST-005", name: "Patola Palace", city: "Surat", state: "Gujarat", address: "89 Ring Road", pin: "395001", area: "Ring Road", hours: "10:00 AM - 9:30 PM", status: "active", plan: "Smart", mrr: 15000, healthScore: 91, conversionRate: 40, sessions: 26, churnRisk: 15, featureScore: 72, catalogUtilization: 88, agreementStatus: "signed", onboardingStep: 5, ownerName: "Meena Patel", ownerPhone: "+919400000005", ownerEmail: "meena@patolapalace.com", gstin: "24DDDDT3456D4Z9", subscriptionPlan: "Professional", catalogueCount: 55, digitisedPercent: 80 },
      { storeId: "ST-006", name: "Tant Bangla", city: "Kolkata", state: "West Bengal", address: "34 Gariahat Road", pin: "700029", area: "Gariahat", hours: "11:00 AM - 8:00 PM", status: "active", plan: "Digital", mrr: 10000, healthScore: 85, conversionRate: 35, sessions: 14, churnRisk: 18, featureScore: 58, catalogUtilization: 78, agreementStatus: "signed", discountCode: "Association 30%", onboardingStep: 4, ownerName: "Anita Das", ownerPhone: "+919300000006", ownerEmail: "anita@tantbangla.com", gstin: "19EEEBT7890E5Z7", subscriptionPlan: "Starter", catalogueCount: 28, digitisedPercent: 65 },
      { storeId: "ST-007", name: "Mysore Silks", city: "Bangalore", state: "Karnataka", status: "churned", plan: "---", mrr: 0, healthScore: 0, conversionRate: 0, sessions: 0, churnRisk: 100, featureScore: 0, catalogUtilization: 0, agreementStatus: "terminated", onboardingStep: 0 },
      { storeId: "ST-008", name: "Royal Weaves", city: "Jaipur", state: "Rajasthan", address: "56 Johari Bazaar", pin: "302003", area: "Johari Bazaar", hours: "10:00 AM - 8:30 PM", status: "trial", plan: "Trial", mrr: 0, healthScore: 68, conversionRate: 18, sessions: 5, churnRisk: 55, featureScore: 35, catalogUtilization: 45, agreementStatus: "pending", discountCode: "Trial", onboardingStep: 2, ownerName: "Deepak Sharma", ownerPhone: "+919200000008", ownerEmail: "deepak@royalweaves.com" },
    ];

    for (const store of stores) {
      await ctx.db.insert("stores", store);
    }

    // ===================== USER ACCOUNTS (for store owners) =====================
    // Real SHA-256 hash of "Store@123" + "wearify-salt-2024"
    const storeOwnerHash = "49138034eb9cb992dfaedb8dcb377e77801ffd1109736a20be469d96cc3a04f1";
    for (const store of stores) {
      if (store.ownerPhone) {
        await ctx.db.insert("users", {
          phone: store.ownerPhone,
          passwordHash: storeOwnerHash,
          name: store.ownerName || "Store Owner",
          role: "store_owner",
          storeId: store.storeId,
        });
      }
    }

    // ===================== STAFF =====================
    const staffList = [
      { name: "Ravi Patil", phone: "+919811111001", pin: "1234", role: "R04", storeId: "ST-001", status: "active", totalSales: 42, conversion: 38, sessionCount: 85, revenue: 125000 },
      { name: "Priya Sharma", phone: "+919811111002", pin: "2345", role: "R05", storeId: "ST-001", status: "active", totalSales: 35, conversion: 42, sessionCount: 72, revenue: 98000 },
      { name: "Amit Verma", phone: "+919811111003", pin: "3456", role: "R05", storeId: "ST-001", status: "active", totalSales: 28, conversion: 35, sessionCount: 65, revenue: 82000 },
      { name: "Sunita Reddy", phone: "+919811111004", pin: "1234", role: "R04", storeId: "ST-002", status: "active", totalSales: 38, conversion: 40, sessionCount: 78, revenue: 115000 },
      { name: "Karthik Iyer", phone: "+919811111005", pin: "2345", role: "R05", storeId: "ST-002", status: "active", totalSales: 30, conversion: 36, sessionCount: 68, revenue: 88000 },
      { name: "Lakshmi Devi", phone: "+919811111006", pin: "1234", role: "R04", storeId: "ST-003", status: "active", totalSales: 55, conversion: 48, sessionCount: 95, revenue: 180000 },
      { name: "Arjun Nair", phone: "+919811111007", pin: "2345", role: "R05", storeId: "ST-003", status: "active", totalSales: 40, conversion: 44, sessionCount: 80, revenue: 135000 },
      { name: "Deepa Gupta", phone: "+919811111008", pin: "1234", role: "R04", storeId: "ST-005", status: "active", totalSales: 36, conversion: 39, sessionCount: 74, revenue: 108000 },
    ];

    for (const s of staffList) {
      await ctx.db.insert("staff", s);
    }

    // ===================== SAREES (catalog for ST-001 MAUVE Sarees) =====================
    const sarees = [
      { storeId: "ST-001", name: "Royal Banarasi Silk", type: "Banarasi", fabric: "Silk", occasion: "Wedding", price: 28500, mrp: 32000, stock: 5, status: "active", colors: ["Red", "Gold"], emoji: "👑", grad: ["#8B0000", "#FFD700"], tag: "Premium", region: "Varanasi", weave: "Jacquard", weight: "Heavy", description: "Handwoven pure silk Banarasi with intricate zari work", drapingStyles: ["Nivi", "Bengali"], tryOns: 45, views: 120, conversions: 8, daysOld: 15, approvalStatus: "approved", addedBy: "Ravi Patil" },
      { storeId: "ST-001", name: "Kanjeevaram Temple Border", type: "Kanjeevaram", fabric: "Silk", occasion: "Wedding", price: 35000, mrp: 40000, stock: 3, status: "active", colors: ["Maroon", "Gold"], emoji: "🏛️", grad: ["#800000", "#C5A900"], tag: "Premium", region: "Kanchipuram", weave: "Temple", weight: "Heavy", description: "Traditional Kanjeevaram with temple border motifs", drapingStyles: ["Nivi", "Seedha Pallu"], tryOns: 38, views: 95, conversions: 6, daysOld: 22, approvalStatus: "approved", addedBy: "Priya Sharma" },
      { storeId: "ST-001", name: "Chanderi Floral", type: "Chanderi", fabric: "Cotton", occasion: "Festival", price: 8500, mrp: 10000, stock: 12, status: "active", colors: ["Pink", "White"], emoji: "🌸", grad: ["#FFB6C1", "#FFFFFF"], tag: "Trending", region: "Chanderi", weave: "Plain", weight: "Light", description: "Lightweight Chanderi with delicate floral prints", drapingStyles: ["Nivi", "Gujarati"], tryOns: 62, views: 180, conversions: 15, daysOld: 8, approvalStatus: "approved", addedBy: "Amit Verma" },
      { storeId: "ST-001", name: "Tussar Geometric", type: "Tussar", fabric: "Silk", occasion: "Party", price: 12000, mrp: 14000, stock: 8, status: "active", colors: ["Beige", "Brown"], emoji: "🔶", grad: ["#F5F5DC", "#8B4513"], tag: "Fast Moving", region: "Bihar", weave: "Geometric", weight: "Medium", description: "Natural tussar silk with contemporary geometric patterns", drapingStyles: ["Nivi"], tryOns: 28, views: 75, conversions: 4, daysOld: 30, approvalStatus: "approved", addedBy: "Ravi Patil" },
      { storeId: "ST-001", name: "Organza Pastel Dream", type: "Organza", fabric: "Organza", occasion: "Party", price: 6500, mrp: 8000, stock: 15, status: "active", colors: ["Lavender", "Mint"], emoji: "✨", grad: ["#E6E6FA", "#98FF98"], tag: "New", region: "Surat", weave: "Plain", weight: "Light", description: "Soft organza with pastel dual-tone effect", drapingStyles: ["Nivi", "Bengali"], tryOns: 55, views: 200, conversions: 12, daysOld: 5, approvalStatus: "approved", addedBy: "Priya Sharma" },
      { storeId: "ST-001", name: "Cotton Handloom Daily", type: "Handloom", fabric: "Cotton", occasion: "Daily", price: 2200, mrp: 2800, stock: 25, status: "active", colors: ["Blue", "White"], emoji: "🧶", grad: ["#4169E1", "#F0F8FF"], tag: "Fast Moving", region: "West Bengal", weave: "Handloom", weight: "Light", description: "Comfortable daily wear cotton handloom saree", drapingStyles: ["Nivi"], tryOns: 82, views: 250, conversions: 22, daysOld: 45, approvalStatus: "approved", addedBy: "Amit Verma" },
      { storeId: "ST-001", name: "Linen Summer Fresh", type: "Linen", fabric: "Linen", occasion: "Office", price: 4500, mrp: 5500, stock: 10, status: "active", colors: ["Sage", "Ivory"], emoji: "🌿", grad: ["#9DC183", "#FFFFF0"], tag: "Trending", region: "Bhagalpur", weave: "Plain", weight: "Light", description: "Premium linen saree perfect for office and formal occasions", drapingStyles: ["Nivi"], tryOns: 35, views: 100, conversions: 7, daysOld: 12, approvalStatus: "approved", addedBy: "Ravi Patil" },
      { storeId: "ST-001", name: "Chiffon Rose Garden", type: "Chiffon", fabric: "Chiffon", occasion: "Party", price: 5800, mrp: 7000, stock: 7, status: "active", colors: ["Rose", "Black"], emoji: "🌹", grad: ["#FF007F", "#000000"], tag: "Premium", region: "Surat", weave: "Printed", weight: "Light", description: "Flowing chiffon with bold rose prints", drapingStyles: ["Nivi", "Bengali"], tryOns: 42, views: 130, conversions: 9, daysOld: 18, approvalStatus: "approved", addedBy: "Priya Sharma" },
      { storeId: "ST-001", name: "Paithani Heritage", type: "Paithani", fabric: "Silk", occasion: "Wedding", price: 45000, mrp: 52000, stock: 2, status: "active", colors: ["Purple", "Gold"], emoji: "💎", grad: ["#800080", "#FFD700"], tag: "Premium", region: "Paithan", weave: "Peacock", weight: "Heavy", description: "Authentic Paithani with peacock motif border", drapingStyles: ["Nivi", "Seedha Pallu"], tryOns: 22, views: 68, conversions: 3, daysOld: 60, approvalStatus: "approved", addedBy: "Ravi Patil" },
      { storeId: "ST-001", name: "Georgette Sequin Party", type: "Georgette", fabric: "Georgette", occasion: "Party", price: 7800, mrp: 9500, stock: 6, status: "active", colors: ["Black", "Silver"], emoji: "🪩", grad: ["#1C1C1C", "#C0C0C0"], tag: "Trending", region: "Surat", weave: "Embroidered", weight: "Medium", description: "Glamorous georgette with sequin work for parties", drapingStyles: ["Nivi"], tryOns: 48, views: 155, conversions: 10, daysOld: 10, approvalStatus: "approved", addedBy: "Amit Verma" },
      // ST-002 Silk Heritage sarees
      { storeId: "ST-002", name: "Banarasi Brocade Gold", type: "Banarasi", fabric: "Silk", occasion: "Wedding", price: 32000, mrp: 38000, stock: 4, status: "active", colors: ["Red", "Gold"], emoji: "👑", grad: ["#DC143C", "#FFD700"], tag: "Premium", region: "Varanasi", weave: "Brocade", weight: "Heavy", description: "Heavy brocade Banarasi with gold thread work", tryOns: 30, views: 85, conversions: 5, daysOld: 20, approvalStatus: "approved" },
      { storeId: "ST-002", name: "Tussar Natural", type: "Tussar", fabric: "Silk", occasion: "Festival", price: 9800, mrp: 12000, stock: 9, status: "active", colors: ["Ivory", "Copper"], emoji: "🍂", grad: ["#FFFFF0", "#B87333"], tag: "Trending", region: "Jharkhand", weave: "Block Print", weight: "Medium", description: "Natural tussar with hand block prints", tryOns: 25, views: 70, conversions: 4, daysOld: 25, approvalStatus: "approved" },
      // ST-003 Kanchi Collections sarees
      { storeId: "ST-003", name: "Pure Kanchipuram Bridal", type: "Kanjeevaram", fabric: "Silk", occasion: "Wedding", price: 55000, mrp: 65000, stock: 2, status: "active", colors: ["Red", "Green", "Gold"], emoji: "💍", grad: ["#FF0000", "#006400"], tag: "Premium", region: "Kanchipuram", weave: "Korvai", weight: "Heavy", description: "Bridal Kanchipuram with dual-color korvai technique", tryOns: 18, views: 55, conversions: 2, daysOld: 35, approvalStatus: "approved" },
      { storeId: "ST-003", name: "Soft Silk Temple", type: "Kanjeevaram", fabric: "Silk", occasion: "Festival", price: 15000, mrp: 18000, stock: 8, status: "active", colors: ["Teal", "Gold"], emoji: "🏛️", grad: ["#008080", "#FFD700"], tag: "Fast Moving", region: "Kanchipuram", weave: "Temple Border", weight: "Medium", description: "Soft silk with classic temple border", tryOns: 42, views: 120, conversions: 10, daysOld: 14, approvalStatus: "approved" },
    ];

    for (const saree of sarees) {
      await ctx.db.insert("sarees", saree);
    }

    // ===================== CUSTOMERS =====================
    const customers = [
      { phone: "+919900000001", name: "Ananya Mehta", initials: "AM", totalVisits: 8, totalLooks: 24, totalStores: 2, storeCredit: 500, loyaltyPoints: 3200, loyaltyTier: "Silver", preferredOccasions: ["Wedding", "Festival"], preferredFabrics: ["Silk", "Chanderi"], preferredColors: ["Red", "Gold", "Pink"], budgetRange: "₹10K-25K", consentHistory: true, consentMessages: true, consentAiPersonal: true, consentPhotos: true, consentGrantedDate: "2025-06-15", language: "en" },
      { phone: "+919900000002", name: "Deepika Reddy", initials: "DR", totalVisits: 5, totalLooks: 15, totalStores: 1, storeCredit: 200, loyaltyPoints: 1800, loyaltyTier: "Silver", preferredOccasions: ["Party", "Office"], preferredFabrics: ["Georgette", "Chiffon"], preferredColors: ["Black", "Maroon"], budgetRange: "₹5K-10K", consentHistory: true, consentMessages: true, consentAiPersonal: false, consentPhotos: true, consentGrantedDate: "2025-08-20", language: "en" },
      { phone: "+919900000003", name: "Lakshmi Iyer", initials: "LI", totalVisits: 12, totalLooks: 36, totalStores: 3, storeCredit: 1200, loyaltyPoints: 8500, loyaltyTier: "Gold", preferredOccasions: ["Wedding", "Festival", "Daily"], preferredFabrics: ["Silk", "Cotton"], preferredColors: ["Red", "Blue", "Green"], budgetRange: "₹25K-50K", consentHistory: true, consentMessages: true, consentAiPersonal: true, consentPhotos: true, consentGrantedDate: "2025-03-10", language: "ta" },
      { phone: "+919900000004", name: "Fatima Sheikh", initials: "FS", totalVisits: 3, totalLooks: 8, totalStores: 1, storeCredit: 0, loyaltyPoints: 450, loyaltyTier: "Regular", preferredOccasions: ["Festival"], preferredFabrics: ["Organza"], preferredColors: ["Pastel"], budgetRange: "₹5K-10K", consentHistory: true, consentMessages: false, consentAiPersonal: false, consentPhotos: false, consentGrantedDate: "2026-01-05", language: "en" },
      { phone: "+919900000005", name: "Prerna Joshi", initials: "PJ", totalVisits: 15, totalLooks: 48, totalStores: 2, storeCredit: 2000, loyaltyPoints: 16000, loyaltyTier: "VIP", preferredOccasions: ["Wedding", "Party", "Gift"], preferredFabrics: ["Silk", "Linen", "Organza"], preferredColors: ["Purple", "Gold", "Rose"], budgetRange: "₹50K-1L", consentHistory: true, consentMessages: true, consentAiPersonal: true, consentPhotos: true, consentGrantedDate: "2024-12-01", language: "hi" },
    ];

    // Real SHA-256 hash of "Customer@123" + "wearify-salt-2024"
    const customerHash = "2f810dbeff5c43831cda2292f4af49f77b044f0ad05f90ef12f5ee9598e7b312";
    const customerIds: string[] = [];
    for (const c of customers) {
      const id = await ctx.db.insert("customers", { ...c, passwordHash: customerHash });
      customerIds.push(id);
      // Create user record
      await ctx.db.insert("users", {
        phone: c.phone,
        passwordHash: customerHash,
        name: c.name,
        role: "customer",
      });
    }

    // Add body scan data for first 2 customers (Ananya & Deepika) so ScanChoiceScreen can be tested
    // lastBodyScan indicates the customer has been scanned before (scan data lives on edge device)
    const _seedNow = Date.now();
    const _seedDay = 86400000;
    // Ananya Mehta — scanned 2 months ago (within 6-month validity)
    await ctx.db.patch(customerIds[0] as any, {
      lastBodyScan: _seedNow - 60 * _seedDay,
    });
    // Deepika Reddy — scanned 1 month ago
    await ctx.db.patch(customerIds[1] as any, {
      lastBodyScan: _seedNow - 30 * _seedDay,
    });

    // ===================== CUSTOMER-STORE LINKS =====================
    const csLinks = [
      { customerId: customerIds[0], storeId: "ST-001", storeName: "MAUVE Sarees", visits: 6, lastVisit: "2026-03-28", clv: 85000, segment: "VIP" },
      { customerId: customerIds[0], storeId: "ST-003", storeName: "Kanchi Collections", visits: 2, lastVisit: "2026-02-15", clv: 55000, segment: "Regular" },
      { customerId: customerIds[1], storeId: "ST-001", storeName: "MAUVE Sarees", visits: 5, lastVisit: "2026-03-22", clv: 42000, segment: "Regular" },
      { customerId: customerIds[2], storeId: "ST-001", storeName: "MAUVE Sarees", visits: 4, lastVisit: "2026-03-30", clv: 120000, segment: "VIP" },
      { customerId: customerIds[2], storeId: "ST-002", storeName: "Silk Heritage", visits: 5, lastVisit: "2026-03-25", clv: 95000, segment: "VIP" },
      { customerId: customerIds[2], storeId: "ST-003", storeName: "Kanchi Collections", visits: 3, lastVisit: "2026-03-18", clv: 75000, segment: "Regular" },
      { customerId: customerIds[3], storeId: "ST-001", storeName: "MAUVE Sarees", visits: 3, lastVisit: "2026-01-10", clv: 18000, segment: "New" },
      { customerId: customerIds[4], storeId: "ST-001", storeName: "MAUVE Sarees", visits: 8, lastVisit: "2026-04-02", clv: 250000, segment: "VIP" },
      { customerId: customerIds[4], storeId: "ST-005", storeName: "Patola Palace", visits: 7, lastVisit: "2026-03-28", clv: 180000, segment: "VIP" },
    ];
    for (const link of csLinks) {
      await ctx.db.insert("customerStoreLinks", link as any);
    }

    // ===================== TAILORS =====================
    const tailors = [
      { tailorId: "TL-001", name: "Manoj Darji", phone: "+919800100001", city: "Mumbai", area: "Dadar", specialties: ["silk_blouse", "designer_emb", "bridal"], experience: "15 years", bio: "Master blouse tailor specializing in bridal and designer work", badge: "pro", status: "verified", rating: 4.8, reviewCount: 124, revenue: 285000, referrals: 45, leadsThisMonth: 8, earnedThisMonth: 32000, commissionOwed: 4500, available: true, subscription: "pro", serviceRadius: 10, services: [{ id: "s1", name: "Silk Blouse Stitching", priceMin: 800, priceMax: 2500, days: 5, active: true }, { id: "s2", name: "Designer Embroidery", priceMin: 1500, priceMax: 5000, days: 10, active: true }, { id: "s3", name: "Bridal Blouse", priceMin: 3000, priceMax: 8000, days: 14, active: true }], workingDays: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false }, hoursOpen: "09:00", hoursClose: "19:00", joinDate: "2024-06-15", aadhaarVerified: true, panVerified: true, addressVerified: true },
      { tailorId: "TL-002", name: "Savita Pawar", phone: "+919800100002", city: "Mumbai", area: "Andheri", specialties: ["cotton_casual", "fall_pico", "alteration"], experience: "8 years", bio: "Quick and reliable alterations and casual wear", badge: "verified", status: "verified", rating: 4.5, reviewCount: 86, revenue: 145000, referrals: 28, leadsThisMonth: 5, earnedThisMonth: 18000, commissionOwed: 2000, available: true, subscription: "free", serviceRadius: 5, services: [{ id: "s1", name: "Fall & Pico", priceMin: 200, priceMax: 500, days: 2, active: true }, { id: "s2", name: "Blouse Alteration", priceMin: 300, priceMax: 800, days: 3, active: true }], workingDays: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false }, hoursOpen: "10:00", hoursClose: "18:00", joinDate: "2025-01-20", aadhaarVerified: true, panVerified: true, addressVerified: false },
      { tailorId: "TL-003", name: "Rakesh Kumar", phone: "+919800100003", city: "Delhi", area: "Lajpat Nagar", specialties: ["silk_blouse", "heavy_work", "bridal"], experience: "20 years", bio: "Expert in heavy bridal blouse work", badge: "pro", status: "verified", rating: 4.9, reviewCount: 210, revenue: 420000, referrals: 65, leadsThisMonth: 12, earnedThisMonth: 48000, available: true, subscription: "pro", serviceRadius: 15, services: [{ id: "s1", name: "Heavy Work Blouse", priceMin: 2000, priceMax: 10000, days: 12, active: true }], workingDays: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true }, hoursOpen: "08:00", hoursClose: "20:00", joinDate: "2024-03-01", aadhaarVerified: true, panVerified: true, addressVerified: true },
      { tailorId: "TL-004", name: "Geeta Bai", phone: "+919800100004", city: "Chennai", area: "T Nagar", specialties: ["silk_blouse", "petticoat", "fall_pico"], experience: "12 years", bio: "Traditional South Indian blouse specialist", badge: "verified", status: "verified", rating: 4.6, reviewCount: 95, revenue: 195000, referrals: 32, leadsThisMonth: 6, earnedThisMonth: 22000, available: true, subscription: "free", serviceRadius: 8, services: [{ id: "s1", name: "Silk Blouse", priceMin: 600, priceMax: 2000, days: 4, active: true }, { id: "s2", name: "Petticoat", priceMin: 400, priceMax: 800, days: 3, active: true }], workingDays: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false }, hoursOpen: "09:00", hoursClose: "18:00", joinDate: "2024-08-10", aadhaarVerified: true, panVerified: false, addressVerified: true },
    ];

    // Real SHA-256 hash of "Tailor@123" + "wearify-salt-2024"
    const tailorHash = "def85e4b3f98b1fbe9a4eefc94ff9dffcdbf42216eef358262538d6522689812";
    for (const t of tailors) {
      await ctx.db.insert("tailors", { ...t, passwordHash: tailorHash });
      await ctx.db.insert("users", {
        phone: t.phone,
        passwordHash: tailorHash,
        name: t.name,
        role: "tailor",
        tailorId: t.tailorId,
      });
    }

    // ===================== TAILOR PORTFOLIO =====================
    const portfolio = [
      { tailorId: "TL-001", tag: "Bridal Blouse", occasion: "Wedding", style: "Deep V Back", grad: ["#8B0000", "#FFD700"] },
      { tailorId: "TL-001", tag: "Designer Work", occasion: "Party", style: "Cold Shoulder", grad: ["#FF007F", "#000000"] },
      { tailorId: "TL-001", tag: "Silk Special", occasion: "Festival", style: "Princess Cut", grad: ["#800080", "#E6E6FA"] },
      { tailorId: "TL-002", tag: "Cotton Blouse", occasion: "Daily", style: "Simple Round", grad: ["#4169E1", "#87CEEB"] },
      { tailorId: "TL-003", tag: "Heavy Zardozi", occasion: "Wedding", style: "Full Sleeves", grad: ["#DAA520", "#8B0000"] },
      { tailorId: "TL-003", tag: "Kundan Work", occasion: "Wedding", style: "Halter Neck", grad: ["#FFD700", "#FF0000"] },
      { tailorId: "TL-004", tag: "Temple Blouse", occasion: "Festival", style: "Boat Neck", grad: ["#008080", "#FFD700"] },
    ];
    for (const p of portfolio) {
      await ctx.db.insert("tailorPortfolio", p);
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
      { agentId: "AGT-01", name: "Inventory Optimiser", phase: 1, mode: "supervised", status: "running", actions: 12, accuracy: 94.2, costPerDay: 85, storesUsing: 6, cycleTime: "14m", lastResult: "Detected 12 slow-moving silks at Silk Heritage.", humanComparison: "Agent accuracy: 78% match" },
      { agentId: "AGT-02", name: "Campaign Orchestrator", phase: 1, mode: "supervised", status: "running", actions: 4, accuracy: 91.5, costPerDay: 120, storesUsing: 6, cycleTime: "2h", lastResult: "Scheduled festival campaign for 3 stores.", humanComparison: "80% alignment" },
      { agentId: "AGT-03", name: "Store Health Monitor", phase: 1, mode: "autonomous", status: "running", actions: 8, accuracy: 97.1, costPerDay: 45, storesUsing: 8, cycleTime: "58m", lastResult: "Revenue down 18% at Silk Heritage.", humanComparison: "100% detection" },
      { agentId: "AGT-04", name: "Customer Intelligence", phase: 2, mode: "shadow", status: "running", actions: 0, accuracy: 88.4, costPerDay: 95, storesUsing: 3, cycleTime: "6h", lastResult: "Shadow mode. 15 VIP churn risk flagged.", humanComparison: "Shadow: logging only" },
      { agentId: "AGT-05", name: "Pricing Strategist", phase: 2, mode: "shadow", status: "paused", actions: 0, accuracy: 85.2, costPerDay: 0, storesUsing: 0, cycleTime: "1d", lastResult: "Paused.", humanComparison: "Paused" },
      { agentId: "AGT-06", name: "Staff Coach", phase: 2, mode: "shadow", status: "running", actions: 0, accuracy: 82.6, costPerDay: 60, storesUsing: 3, cycleTime: "12h", lastResult: "Coaching tip for Ravi.", humanComparison: "Shadow" },
      { agentId: "AGT-07", name: "Network Intelligence", phase: 3, mode: "off", status: "planned", actions: 0, accuracy: 0, costPerDay: 0, storesUsing: 0, cycleTime: "---", lastResult: "Phase 3. Requires 50+ stores.", humanComparison: "Not deployed" },
      { agentId: "AGT-08", name: "Demand Forecaster", phase: 1, mode: "supervised", status: "running", actions: 6, accuracy: 89.8, costPerDay: 70, storesUsing: 5, cycleTime: "24h", lastResult: "Forecast: 15% demand increase for silks next week.", humanComparison: "72% match" },
    ];
    for (const a of agents) { await ctx.db.insert("agents", a); }

    // ===================== AGENT TOOLS =====================
    const tools = [
      { toolId: "TL-01", name: "Price Markdown", description: "Auto-adjust pricing for slow-moving inventory", agents: "AGT-01,AGT-05", approval: "Owner", usedToday: 3, limit: "10/day" },
      { toolId: "TL-02", name: "WhatsApp Campaign Send", description: "Trigger WhatsApp campaigns to customer segments", agents: "AGT-02", approval: "Owner", usedToday: 1, limit: "3/day" },
      { toolId: "TL-03", name: "Health Alert", description: "Send health alerts to admin dashboard", agents: "AGT-03", approval: "Auto", usedToday: 2, limit: "50/day" },
      { toolId: "TL-04", name: "Customer Tag Update", description: "Update customer segment tags", agents: "AGT-04", approval: "System", usedToday: 0, limit: "100/day" },
      { toolId: "TL-05", name: "Reorder Draft", description: "Create reorder purchase suggestions", agents: "AGT-01", approval: "Manager", usedToday: 1, limit: "5/day" },
    ];
    for (const t of tools) { await ctx.db.insert("agentTools", t); }

    // ===================== AI MODELS =====================
    const models = [
      { modelId: "MDL-01", name: "WearPose v3", version: "3.2.1", type: "Pose", latency: 45, accuracy: 96.2, drift: 0.3, storesUsing: 8, dataPoints: [{ w: 1, v: 95.8 }, { w: 2, v: 96.0 }, { w: 3, v: 96.1 }, { w: 4, v: 96.2 }] },
      { modelId: "MDL-02", name: "DrapeTry v2", version: "2.4.0", type: "VTON", latency: 120, accuracy: 91.5, drift: 1.2, storesUsing: 8, dataPoints: [{ w: 1, v: 90.5 }, { w: 2, v: 91.0 }, { w: 3, v: 91.2 }, { w: 4, v: 91.5 }] },
      { modelId: "MDL-03", name: "SkinMatch v1", version: "1.1.0", type: "Skin", latency: 30, accuracy: 93.8, drift: 0.5, storesUsing: 6, dataPoints: [{ w: 1, v: 93.2 }, { w: 2, v: 93.5 }, { w: 3, v: 93.7 }, { w: 4, v: 93.8 }] },
      { modelId: "MDL-04", name: "SareeSearch v2", version: "2.0.1", type: "Search", latency: 200, accuracy: 88.4, drift: 2.1, storesUsing: 5, dataPoints: [{ w: 1, v: 86.5 }, { w: 2, v: 87.2 }, { w: 3, v: 88.0 }, { w: 4, v: 88.4 }] },
      { modelId: "MDL-05", name: "DemandNet", version: "1.0.3", type: "Forecast", latency: 500, accuracy: 82.1, drift: 3.5, storesUsing: 3, dataPoints: [{ w: 1, v: 80.0 }, { w: 2, v: 81.0 }, { w: 3, v: 81.5 }, { w: 4, v: 82.1 }] },
    ];
    for (const m of models) { await ctx.db.insert("models", m); }

    // ===================== TICKETS =====================
    const tickets = [
      { ticketId: "TK-001", storeName: "Banarasi House", subject: "Mirror offline GPU thermal", priority: "P1", status: "open", sla: "2h", aiDiagnosis: "GPU temp 82C → thermal shutdown" },
      { ticketId: "TK-002", storeName: "Silk Heritage", subject: "Catalog sync delay", priority: "P2", status: "progress", sla: "8h", aiDiagnosis: "CDN cache issue" },
      { ticketId: "TK-003", storeName: "MAUVE Sarees", subject: "Staff onboarding help", priority: "P3", status: "resolved", sla: "24h" },
    ];
    for (const t of tickets) { await ctx.db.insert("tickets", t); }

    // ===================== INVOICES =====================
    const invoices = [
      { invoiceId: "INV-2026-001", storeName: "MAUVE Sarees", amount: 15000, gst: 2700, total: 17700, date: "2026-04-01", status: "paid", dueDate: "2026-04-15" },
      { invoiceId: "INV-2026-002", storeName: "Silk Heritage", amount: 15000, gst: 2700, total: 17700, date: "2026-04-01", status: "pending", dueDate: "2026-04-15" },
      { invoiceId: "INV-2026-003", storeName: "Kanchi Collections", amount: 10000, gst: 1800, total: 11800, date: "2026-04-01", status: "paid", dueDate: "2026-04-15" },
      { invoiceId: "INV-2026-004", storeName: "Patola Palace", amount: 15000, gst: 2700, total: 17700, date: "2026-03-01", status: "overdue", dueDate: "2026-03-15" },
    ];
    for (const i of invoices) { await ctx.db.insert("invoices", i); }

    // ===================== VENDORS =====================
    const vendors = [
      { name: "AWS", type: "Cloud", dpaStatus: "Signed", riskLevel: "Low", monthlySpend: 45000 },
      { name: "Gupshup", type: "WhatsApp", dpaStatus: "Signed", riskLevel: "Low", monthlySpend: 12000 },
      { name: "Razorpay", type: "Payments", dpaStatus: "Signed", riskLevel: "Low", monthlySpend: 8000 },
      { name: "Anthropic", type: "LLM", dpaStatus: "Signed", riskLevel: "Medium", monthlySpend: 25000 },
    ];
    for (const v of vendors) { await ctx.db.insert("vendors", v); }

    // ===================== OFFERS =====================
    const offers = [
      { storeId: "ST-001", type: "festival", headline: "Gudi Padwa Special", subline: "Extra 10% off on silk sarees", badge: "Festival", cta: "Shop Now", expiry: "2026-04-15", grad: ["#FF6B35", "#FFD700"], icon: "🎉", active: true },
      { storeId: "ST-001", type: "loyalty", headline: "Silver Member Perk", subline: "Free blouse stitching on next purchase", badge: "Loyalty", cta: "Claim", grad: ["#C0C0C0", "#E8E8E8"], icon: "⭐", active: true },
      { storeId: "ST-003", type: "collection", headline: "New Bridal Collection", subline: "50+ new Kanchipuram arrivals", badge: "New", cta: "Explore", expiry: "2026-05-01", grad: ["#8B0000", "#FFD700"], icon: "💍", active: true },
    ];
    for (const o of offers) { await ctx.db.insert("offers", o); }

    // ===================== REMAINING ADMIN TABLES =====================
    // Legal Docs
    const legalDocs = [
      { docId: "DOC-001", name: "Master Service Agreement", type: "retailer", version: "2.1", status: "active", uploaded: "2025-01-15", effective: "2025-02-01", fileName: "MSA_v2.1.pdf", acceptedBy: 6, description: "Core service terms between Phygify and retailer" },
      { docId: "DOC-002", name: "Data Processing Addendum", type: "retailer", version: "1.3", status: "active", uploaded: "2025-01-15", effective: "2025-02-01", fileName: "DPA_v1.3.pdf", acceptedBy: 6, description: "DPDP Act 2023 compliant data processing terms" },
      { docId: "DOC-003", name: "Customer Privacy Policy", type: "customer", version: "1.2", status: "active", uploaded: "2025-03-01", effective: "2025-03-15", fileName: "Privacy_v1.2.pdf", acceptedBy: 842, description: "Customer-facing privacy policy per DPDP Act" },
    ];
    for (const d of legalDocs) { await ctx.db.insert("legalDocs", d); }

    // Notification Rules
    const notifRules = [
      { ruleId: "NR-001", name: "Mirror Offline Alert", trigger: "device.offline > 5m", target: "admin + store_owner", channel: "WhatsApp + Dashboard", active: true },
      { ruleId: "NR-002", name: "Health Drop Alert", trigger: "store.health < 70", target: "admin", channel: "Dashboard", active: true },
      { ruleId: "NR-003", name: "Invoice Overdue", trigger: "invoice.overdue > 5d", target: "store_owner", channel: "WhatsApp + Email", active: true },
      { ruleId: "NR-004", name: "New Referral", trigger: "tailor_referral.created", target: "tailor", channel: "WhatsApp", active: true },
    ];
    for (const n of notifRules) { await ctx.db.insert("notificationRules", n); }

    // Festivals
    const festivals = [
      { name: "Gudi Padwa", start: "2026-03-26", end: "2026-03-28", freeze: true, campaign: "Maharashtrian New Year" },
      { name: "Akshaya Tritiya", start: "2026-04-22", end: "2026-04-24", freeze: false, campaign: "Gold Rush" },
      { name: "Diwali", start: "2026-10-18", end: "2026-10-25", freeze: true, campaign: "Festival of Lights" },
    ];
    for (const f of festivals) { await ctx.db.insert("festivals", f); }

    // Changelog
    const changelogs = [
      { version: "4.3.0", date: "2026-04-01", type: "Major", notes: "Multi-module launch: Retailer, Tablet, Kiosk, Customer PWA, Tailor" },
      { version: "4.2.0", date: "2026-03-15", type: "Minor", notes: "DPDP consent management across all modules" },
      { version: "4.1.0", date: "2026-03-01", type: "Minor", notes: "Tailor marketplace integration" },
    ];
    for (const c of changelogs) { await ctx.db.insert("changelog", c); }

    // On-Call
    const oncall = [
      { role: "Platform Lead", name: "Arjun Rao", title: "CTO", week: "W14 2026", status: "On-Call", phone: "+919999900001" },
      { role: "DevOps", name: "Sneha Kulkarni", title: "SRE", week: "W14 2026", status: "On-Call", phone: "+919999900002" },
      { role: "ML Ops", name: "Vikram Desai", title: "ML Engineer", week: "W14 2026", status: "Backup", phone: "+919999900003" },
    ];
    for (const o of oncall) { await ctx.db.insert("onCallRotation", o); }

    // WhatsApp Templates
    const waTemplates = [
      { templateId: "WA-001", name: "Try-On Photo Share", status: "Approved", agent: "System", body: "Hi {{name}}! Here are your try-on looks from {{store}}. View: {{link}}" },
      { templateId: "WA-002", name: "Post-Visit Thank You", status: "Approved", agent: "AGT-02", body: "Thank you for visiting {{store}}, {{name}}! You tried {{count}} beautiful sarees." },
      { templateId: "WA-003", name: "Festival Campaign", status: "Approved", agent: "AGT-02", body: "{{festival}} Special at {{store}}! {{offer}}. Visit us this week." },
      { templateId: "WA-004", name: "Tailor Referral", status: "Approved", agent: "System", body: "Hi {{tailor}}, new blouse referral from {{store}}: {{customer}} needs {{service}}. Contact: {{phone}}" },
    ];
    for (const w of waTemplates) { await ctx.db.insert("waTemplates", w); }

    // Feature Flags
    const flags = [
      { key: "ai_try_on", enabled: true, description: "Virtual try-on AI processing" },
      { key: "tailor_marketplace", enabled: true, description: "Tailor discovery and referral" },
      { key: "loyalty_program", enabled: true, description: "Customer loyalty points" },
      { key: "demand_forecast", enabled: false, description: "AI demand forecasting" },
      { key: "voice_search", enabled: false, description: "Voice search on kiosk" },
    ];
    for (const f of flags) { await ctx.db.insert("featureFlags", f); }

    // Retention Policies
    const retention = [
      { policyId: "RP-001", category: "Session Data", retention: "12 months", deletion: "Auto-delete", law: "DPDP Act S8" },
      { policyId: "RP-002", category: "Customer Photos", retention: "6 months", deletion: "On request (30d)", law: "DPDP Act S12-13" },
      { policyId: "RP-003", category: "Payment Records", retention: "8 years", deletion: "Manual", law: "IT Act + GST" },
      { policyId: "RP-004", category: "Body Scan Data", retention: "6 months", deletion: "Auto-delete", law: "DPDP Act S8" },
    ];
    for (const r of retention) { await ctx.db.insert("retentionPolicies", r); }

    // Incidents
    const incidents = [
      { incidentId: "INC-001", severity: "P2", title: "CDN cache purge failure", startTime: "2026-04-03 14:30", endTime: "2026-04-03 15:45", duration: "1h 15m", storesAffected: 3, rootCause: "CDN provider maintenance window", status: "resolved" },
      { incidentId: "INC-002", severity: "P1", title: "Mirror GPU thermal at Banarasi House", startTime: "2026-04-05 11:00", storesAffected: 1, status: "open" },
    ];
    for (const i of incidents) { await ctx.db.insert("incidents", i); }

    // KB Articles
    const kbArticles = [
      { articleId: "KB-001", title: "How to add sarees to catalog", views: 245, helpful: 89, category: "Catalog", content: "Step-by-step guide to digitizing your saree collection." },
      { articleId: "KB-002", title: "Mirror troubleshooting guide", views: 180, helpful: 72, category: "Devices", content: "Common mirror issues and how to resolve them." },
      { articleId: "KB-003", title: "Customer consent management", views: 120, helpful: 65, category: "Privacy", content: "Managing DPDP consent for your customers." },
      { articleId: "KB-004", title: "Understanding your store health score", views: 310, helpful: 95, category: "Analytics", content: "How the health score is calculated and how to improve it." },
    ];
    for (const k of kbArticles) { await ctx.db.insert("kbArticles", k); }

    // Platform Config
    const configs = [
      { key: "platform_version", value: "4.3.0" },
      { key: "min_app_version", value: "4.0.0" },
      { key: "default_language", value: "en" },
      { key: "max_session_duration", value: "30" },
      { key: "loyalty_points_per_visit", value: "100" },
      { key: "loyalty_points_per_purchase", value: "500" },
      { key: "referral_reward_points", value: "200" },
    ];
    for (const c of configs) { await ctx.db.insert("platformConfig", c); }

    return "Seeded successfully";
  },
});

// =====================================================================
// ADDITIVE SEED — interconnected session/look/visit/order data
// Run this AFTER seedAll to populate the relational data that connects
// customers ↔ stores ↔ sessions ↔ looks ↔ tailors ↔ orders
// =====================================================================
export const seedRelational = internalMutation({
  args: {},
  handler: async (ctx) => {

    // Look up real IDs
    const allCustomers = await ctx.db.query("customers").take(10);
    const allStaff = await ctx.db.query("staff").take(20);
    const allSarees = await ctx.db.query("sarees").take(50);
    const allTailors = await ctx.db.query("tailors").take(10);

    if (allCustomers.length === 0 || allSarees.length === 0) {
      return "Run seedAll first";
    }

    // Helper to find entities
    const custByPhone = (p: string) => allCustomers.find((c) => c.phone === p);
    const staffByStore = (sid: string) => allStaff.filter((s) => s.storeId === sid);
    const sareesByStore = (sid: string) => allSarees.filter((s) => s.storeId === sid);
    const tailorById = (tid: string) => allTailors.find((t) => t.tailorId === tid);

    const c1 = custByPhone("+919900000001"); // Ananya Mehta
    const c2 = custByPhone("+919900000002"); // Deepika Reddy
    const c3 = custByPhone("+919900000003"); // Lakshmi Iyer
    const c4 = custByPhone("+919900000004"); // Fatima Sheikh
    const c5 = custByPhone("+919900000005"); // Prerna Joshi

    const st001Staff = staffByStore("ST-001");
    const st002Staff = staffByStore("ST-002");
    const st003Staff = staffByStore("ST-003");
    const st001Sarees = sareesByStore("ST-001");
    const st002Sarees = sareesByStore("ST-002");
    const st003Sarees = sareesByStore("ST-003");

    // ===================== SESSIONS =====================
    const now = Date.now();
    const DAY = 86400000;

    const sessions = [
      // Ananya @ MAUVE - recent session (completed)
      { sessionId: "SS-10001", storeId: "ST-001", storeName: "MAUVE Sarees", staffId: st001Staff[0]?._id, staffName: st001Staff[0]?.name || "Ravi Patil", customerId: c1?._id, customerPhone: c1?.phone, status: "completed", startTime: now - 2 * DAY, endTime: now - 2 * DAY + 1800000, duration: "30m", sareesTriedOn: 3, sareesBrowsed: 8, purchased: true, occasion: "Wedding", budget: "₹25K-50K", rating: 5, ratingComment: "Amazing experience!" },
      // Ananya @ MAUVE - older session
      { sessionId: "SS-10002", storeId: "ST-001", storeName: "MAUVE Sarees", staffId: st001Staff[1]?._id, staffName: st001Staff[1]?.name || "Priya Sharma", customerId: c1?._id, customerPhone: c1?.phone, status: "completed", startTime: now - 15 * DAY, endTime: now - 15 * DAY + 2400000, duration: "40m", sareesTriedOn: 4, sareesBrowsed: 12, purchased: true, occasion: "Festival" },
      // Ananya @ Kanchi Collections
      { sessionId: "SS-10003", storeId: "ST-003", storeName: "Kanchi Collections", staffId: st003Staff[0]?._id, staffName: st003Staff[0]?.name || "Lakshmi Devi", customerId: c1?._id, customerPhone: c1?.phone, status: "completed", startTime: now - 30 * DAY, endTime: now - 30 * DAY + 2100000, duration: "35m", sareesTriedOn: 2, sareesBrowsed: 6, purchased: false, occasion: "Wedding" },
      // Deepika @ MAUVE
      { sessionId: "SS-10004", storeId: "ST-001", storeName: "MAUVE Sarees", staffId: st001Staff[2]?._id, staffName: st001Staff[2]?.name || "Amit Verma", customerId: c2?._id, customerPhone: c2?.phone, status: "completed", startTime: now - 5 * DAY, endTime: now - 5 * DAY + 1500000, duration: "25m", sareesTriedOn: 2, sareesBrowsed: 5, purchased: true, occasion: "Party" },
      // Lakshmi @ Silk Heritage
      { sessionId: "SS-10005", storeId: "ST-002", storeName: "Silk Heritage", staffId: st002Staff[0]?._id, staffName: st002Staff[0]?.name || "Sunita Reddy", customerId: c3?._id, customerPhone: c3?.phone, status: "completed", startTime: now - 8 * DAY, endTime: now - 8 * DAY + 3600000, duration: "60m", sareesTriedOn: 5, sareesBrowsed: 15, purchased: true, occasion: "Wedding", budget: "₹50K+", rating: 5 },
      // Lakshmi @ Kanchi
      { sessionId: "SS-10006", storeId: "ST-003", storeName: "Kanchi Collections", staffId: st003Staff[1]?._id, staffName: st003Staff[1]?.name || "Arjun Nair", customerId: c3?._id, customerPhone: c3?.phone, status: "completed", startTime: now - 20 * DAY, endTime: now - 20 * DAY + 2700000, duration: "45m", sareesTriedOn: 3, sareesBrowsed: 10, purchased: true, occasion: "Festival" },
      // Prerna @ MAUVE
      { sessionId: "SS-10007", storeId: "ST-001", storeName: "MAUVE Sarees", staffId: st001Staff[0]?._id, staffName: st001Staff[0]?.name || "Ravi Patil", customerId: c5?._id, customerPhone: c5?.phone, status: "completed", startTime: now - 3 * DAY, endTime: now - 3 * DAY + 2400000, duration: "40m", sareesTriedOn: 4, sareesBrowsed: 10, purchased: true, occasion: "Party", budget: "₹50K+", rating: 4 },
      // Fatima @ MAUVE (no purchase)
      { sessionId: "SS-10008", storeId: "ST-001", storeName: "MAUVE Sarees", staffId: st001Staff[1]?._id, staffName: st001Staff[1]?.name || "Priya Sharma", customerId: c4?._id, customerPhone: c4?.phone, status: "completed", startTime: now - 60 * DAY, endTime: now - 60 * DAY + 1200000, duration: "20m", sareesTriedOn: 2, sareesBrowsed: 4, purchased: false, occasion: "Festival" },
    ];

    for (const s of sessions) {
      await ctx.db.insert("sessions", s as any);
    }

    // ===================== LOOKS (virtual try-on results) =====================
    const looks = [];
    // Ananya's looks at MAUVE session 1
    if (c1 && st001Sarees.length >= 3) {
      looks.push(
        { sessionId: "SS-10001", storeId: "ST-001", customerId: c1._id, customerPhone: c1.phone, sareeId: st001Sarees[0]._id, sareeName: st001Sarees[0].name, fabric: st001Sarees[0].fabric, price: st001Sarees[0].price, drapeStyle: "Nivi", isFav: true, isWished: false, grad: st001Sarees[0].grad || ["#8B0000", "#FFD700"], createdAt: now - 2 * DAY },
        { sessionId: "SS-10001", storeId: "ST-001", customerId: c1._id, customerPhone: c1.phone, sareeId: st001Sarees[1]._id, sareeName: st001Sarees[1].name, fabric: st001Sarees[1].fabric, price: st001Sarees[1].price, drapeStyle: "Seedha Pallu", isFav: false, isWished: true, grad: st001Sarees[1].grad || ["#800000", "#C5A900"], createdAt: now - 2 * DAY + 300000 },
        { sessionId: "SS-10001", storeId: "ST-001", customerId: c1._id, customerPhone: c1.phone, sareeId: st001Sarees[2]._id, sareeName: st001Sarees[2].name, fabric: st001Sarees[2].fabric, price: st001Sarees[2].price, drapeStyle: "Nivi", isFav: false, isWished: false, grad: st001Sarees[2].grad || ["#FFB6C1", "#FFFFFF"], createdAt: now - 2 * DAY + 600000 },
      );
    }
    // Ananya session 2 looks
    if (c1 && st001Sarees.length >= 6) {
      looks.push(
        { sessionId: "SS-10002", storeId: "ST-001", customerId: c1._id, customerPhone: c1.phone, sareeId: st001Sarees[4]._id, sareeName: st001Sarees[4].name, fabric: st001Sarees[4].fabric, price: st001Sarees[4].price, drapeStyle: "Bengali", isFav: true, isWished: false, grad: st001Sarees[4].grad || ["#E6E6FA", "#98FF98"], createdAt: now - 15 * DAY },
        { sessionId: "SS-10002", storeId: "ST-001", customerId: c1._id, customerPhone: c1.phone, sareeId: st001Sarees[5]._id, sareeName: st001Sarees[5].name, fabric: st001Sarees[5].fabric, price: st001Sarees[5].price, drapeStyle: "Nivi", isFav: false, isWished: false, grad: st001Sarees[5].grad || ["#4169E1", "#F0F8FF"], createdAt: now - 15 * DAY + 300000 },
      );
    }
    // Ananya @ Kanchi
    if (c1 && st003Sarees.length >= 2) {
      looks.push(
        { sessionId: "SS-10003", storeId: "ST-003", customerId: c1._id, customerPhone: c1.phone, sareeId: st003Sarees[0]._id, sareeName: st003Sarees[0].name, fabric: st003Sarees[0].fabric, price: st003Sarees[0].price, drapeStyle: "Nivi", isFav: false, isWished: true, grad: st003Sarees[0].grad || ["#FF0000", "#006400"], createdAt: now - 30 * DAY },
        { sessionId: "SS-10003", storeId: "ST-003", customerId: c1._id, customerPhone: c1.phone, sareeId: st003Sarees[1]._id, sareeName: st003Sarees[1].name, fabric: st003Sarees[1].fabric, price: st003Sarees[1].price, drapeStyle: "Seedha Pallu", isFav: false, isWished: false, grad: st003Sarees[1].grad || ["#008080", "#FFD700"], createdAt: now - 30 * DAY + 300000 },
      );
    }
    // Deepika @ MAUVE
    if (c2 && st001Sarees.length >= 8) {
      looks.push(
        { sessionId: "SS-10004", storeId: "ST-001", customerId: c2._id, customerPhone: c2.phone, sareeId: st001Sarees[7]._id, sareeName: st001Sarees[7].name, fabric: st001Sarees[7].fabric, price: st001Sarees[7].price, drapeStyle: "Nivi", isFav: true, isWished: false, grad: st001Sarees[7].grad || ["#FF007F", "#000000"], createdAt: now - 5 * DAY },
        { sessionId: "SS-10004", storeId: "ST-001", customerId: c2._id, customerPhone: c2.phone, sareeId: st001Sarees[9]._id, sareeName: st001Sarees[9].name, fabric: st001Sarees[9].fabric, price: st001Sarees[9].price, drapeStyle: "Nivi", isFav: false, isWished: true, grad: st001Sarees[9].grad || ["#1C1C1C", "#C0C0C0"], createdAt: now - 5 * DAY + 300000 },
      );
    }
    // Lakshmi @ Silk Heritage
    if (c3 && st002Sarees.length >= 2) {
      looks.push(
        { sessionId: "SS-10005", storeId: "ST-002", customerId: c3._id, customerPhone: c3.phone, sareeId: st002Sarees[0]._id, sareeName: st002Sarees[0].name, fabric: st002Sarees[0].fabric, price: st002Sarees[0].price, drapeStyle: "Bengali", isFav: true, isWished: false, grad: st002Sarees[0].grad || ["#DC143C", "#FFD700"], createdAt: now - 8 * DAY },
        { sessionId: "SS-10005", storeId: "ST-002", customerId: c3._id, customerPhone: c3.phone, sareeId: st002Sarees[1]._id, sareeName: st002Sarees[1].name, fabric: st002Sarees[1].fabric, price: st002Sarees[1].price, drapeStyle: "Nivi", isFav: false, isWished: false, grad: st002Sarees[1].grad || ["#FFFFF0", "#B87333"], createdAt: now - 8 * DAY + 300000 },
      );
    }
    // Prerna @ MAUVE
    if (c5 && st001Sarees.length >= 9) {
      looks.push(
        { sessionId: "SS-10007", storeId: "ST-001", customerId: c5._id, customerPhone: c5.phone, sareeId: st001Sarees[8]._id, sareeName: st001Sarees[8].name, fabric: st001Sarees[8].fabric, price: st001Sarees[8].price, drapeStyle: "Seedha Pallu", isFav: true, isWished: false, grad: st001Sarees[8].grad || ["#800080", "#FFD700"], createdAt: now - 3 * DAY },
        { sessionId: "SS-10007", storeId: "ST-001", customerId: c5._id, customerPhone: c5.phone, sareeId: st001Sarees[0]._id, sareeName: st001Sarees[0].name, fabric: st001Sarees[0].fabric, price: st001Sarees[0].price, drapeStyle: "Nivi", isFav: false, isWished: true, grad: st001Sarees[0].grad || ["#8B0000", "#FFD700"], createdAt: now - 3 * DAY + 300000 },
      );
    }

    for (const l of looks) {
      await ctx.db.insert("looks", l as any);
    }

    // ===================== WISHLIST =====================
    if (c1 && st001Sarees.length >= 2) {
      await ctx.db.insert("wishlist", { customerId: c1._id, sareeId: st001Sarees[1]._id, storeId: "ST-001", sareeName: st001Sarees[1].name, price: st001Sarees[1].price, addedAt: now - 2 * DAY });
    }
    if (c1 && st003Sarees.length >= 1) {
      await ctx.db.insert("wishlist", { customerId: c1._id, sareeId: st003Sarees[0]._id, storeId: "ST-003", sareeName: st003Sarees[0].name, price: st003Sarees[0].price, addedAt: now - 30 * DAY });
    }
    if (c2 && st001Sarees.length >= 10) {
      await ctx.db.insert("wishlist", { customerId: c2._id, sareeId: st001Sarees[9]._id, storeId: "ST-001", sareeName: st001Sarees[9].name, price: st001Sarees[9].price, addedAt: now - 5 * DAY });
    }
    if (c5 && st001Sarees.length >= 1) {
      await ctx.db.insert("wishlist", { customerId: c5._id, sareeId: st001Sarees[0]._id, storeId: "ST-001", sareeName: st001Sarees[0].name, price: st001Sarees[0].price, addedAt: now - 3 * DAY });
    }

    // ===================== WARDROBE (kiosk mirror session saves) =====================
    // Each wardrobe entry represents a look the customer saved from the smart mirror
    // during a try-on session. /c/wishlist -> Wardrobe tab reads this.
    if (c1 && st001Sarees.length >= 3) {
      await ctx.db.insert("wardrobe", { sessionId: "SS-10001", customerId: c1._id, sareeId: st001Sarees[0]._id, sareeName: st001Sarees[0].name, drapeStyle: "Nivi", accessories: ["Gold necklace", "Maang tikka"], neckline: "Round", price: st001Sarees[0].price, addedAt: now - 9 * DAY });
      await ctx.db.insert("wardrobe", { sessionId: "SS-10002", customerId: c1._id, sareeId: st001Sarees[2]._id, sareeName: st001Sarees[2].name, drapeStyle: "Gujarati", accessories: ["Jhumkas"], neckline: "V-neck", price: st001Sarees[2].price, addedAt: now - 21 * DAY });
    }
    if (c2 && st001Sarees.length >= 10) {
      await ctx.db.insert("wardrobe", { sessionId: "SS-10004", customerId: c2._id, sareeId: st001Sarees[7]._id, sareeName: st001Sarees[7].name, drapeStyle: "Nivi", accessories: ["Statement earrings"], neckline: "Halter", price: st001Sarees[7].price, addedAt: now - 5 * DAY });
      await ctx.db.insert("wardrobe", { sessionId: "SS-10004", customerId: c2._id, sareeId: st001Sarees[9]._id, sareeName: st001Sarees[9].name, drapeStyle: "Nivi", accessories: ["Pearl set"], neckline: "Boat", price: st001Sarees[9].price, addedAt: now - 5 * DAY + 200000 });
    }
    if (c3 && st002Sarees.length >= 2) {
      await ctx.db.insert("wardrobe", { sessionId: "SS-10005", customerId: c3._id, sareeId: st002Sarees[0]._id, sareeName: st002Sarees[0].name, drapeStyle: "Bengali", accessories: ["Shakha pola", "Red bindi"], neckline: "Round", price: st002Sarees[0].price, addedAt: now - 8 * DAY });
    }
    if (c5 && st001Sarees.length >= 9) {
      await ctx.db.insert("wardrobe", { sessionId: "SS-10007", customerId: c5._id, sareeId: st001Sarees[8]._id, sareeName: st001Sarees[8].name, drapeStyle: "Seedha Pallu", accessories: ["Temple jewellery", "Nose ring"], neckline: "Sweetheart", price: st001Sarees[8].price, addedAt: now - 3 * DAY });
      await ctx.db.insert("wardrobe", { sessionId: "SS-10007", customerId: c5._id, sareeId: st001Sarees[0]._id, sareeName: st001Sarees[0].name, drapeStyle: "Nivi", accessories: ["Diamond earrings"], neckline: "Round", price: st001Sarees[0].price, addedAt: now - 3 * DAY + 180000 });
    }

    // ===================== VISIT HISTORY =====================
    const visits = [];
    if (c1) {
      visits.push(
        { customerId: c1._id, storeId: "ST-001", storeName: "MAUVE Sarees", sessionId: "SS-10001", date: "Apr 8, 2026", sareesTried: 3, purchased: true, staffName: "Ravi Patil", pointsEarned: 500 },
        { customerId: c1._id, storeId: "ST-001", storeName: "MAUVE Sarees", sessionId: "SS-10002", date: "Mar 26, 2026", sareesTried: 4, purchased: true, staffName: "Priya Sharma", pointsEarned: 350 },
        { customerId: c1._id, storeId: "ST-003", storeName: "Kanchi Collections", sessionId: "SS-10003", date: "Mar 11, 2026", sareesTried: 2, purchased: false, staffName: "Lakshmi Devi", pointsEarned: 50 },
      );
    }
    if (c2) {
      visits.push(
        { customerId: c2._id, storeId: "ST-001", storeName: "MAUVE Sarees", sessionId: "SS-10004", date: "Apr 5, 2026", sareesTried: 2, purchased: true, staffName: "Amit Verma", pointsEarned: 200 },
      );
    }
    if (c3) {
      visits.push(
        { customerId: c3._id, storeId: "ST-002", storeName: "Silk Heritage", sessionId: "SS-10005", date: "Apr 2, 2026", sareesTried: 5, purchased: true, staffName: "Sunita Reddy", pointsEarned: 800 },
        { customerId: c3._id, storeId: "ST-003", storeName: "Kanchi Collections", sessionId: "SS-10006", date: "Mar 21, 2026", sareesTried: 3, purchased: true, staffName: "Arjun Nair", pointsEarned: 400 },
      );
    }
    if (c5) {
      visits.push(
        { customerId: c5._id, storeId: "ST-001", storeName: "MAUVE Sarees", sessionId: "SS-10007", date: "Apr 7, 2026", sareesTried: 4, purchased: true, staffName: "Ravi Patil", pointsEarned: 600 },
      );
    }
    for (const v of visits) {
      await ctx.db.insert("visitHistory", v as any);
    }

    // ===================== LOYALTY TRANSACTIONS =====================
    const loyaltyTx = [];
    if (c1) {
      loyaltyTx.push(
        { customerId: c1._id, storeId: "ST-001", type: "earn", points: 500, reason: "purchase", date: "Apr 8, 2026" },
        { customerId: c1._id, storeId: "ST-001", type: "earn", points: 350, reason: "purchase", date: "Mar 26, 2026" },
        { customerId: c1._id, storeId: "ST-003", type: "earn", points: 50, reason: "visit", date: "Mar 11, 2026" },
        { customerId: c1._id, storeId: "ST-001", type: "earn", points: 200, reason: "referral", date: "Mar 5, 2026" },
        { customerId: c1._id, storeId: "ST-001", type: "redeem", points: -500, reason: "redemption", date: "Feb 20, 2026" },
      );
    }
    if (c3) {
      loyaltyTx.push(
        { customerId: c3._id, storeId: "ST-002", type: "earn", points: 800, reason: "purchase", date: "Apr 2, 2026" },
        { customerId: c3._id, storeId: "ST-003", type: "earn", points: 400, reason: "purchase", date: "Mar 21, 2026" },
        { customerId: c3._id, type: "earn", points: 200, reason: "referral", date: "Mar 1, 2026" },
      );
    }
    if (c5) {
      loyaltyTx.push(
        { customerId: c5._id, storeId: "ST-001", type: "earn", points: 600, reason: "purchase", date: "Apr 7, 2026" },
        { customerId: c5._id, type: "earn", points: 1000, reason: "referral", date: "Mar 15, 2026" },
        { customerId: c5._id, storeId: "ST-001", type: "redeem", points: -2000, reason: "redemption", date: "Feb 10, 2026" },
      );
    }
    for (const tx of loyaltyTx) {
      await ctx.db.insert("loyaltyTransactions", tx as any);
    }

    // ===================== CUSTOMER REFERRALS =====================
    if (c1) {
      await ctx.db.insert("customerReferrals", { referrerId: c1._id, referrerPhone: c1.phone, referredName: "Sunita Agarwal", referredPhone: "+919900099001", status: "Visited", reward: 500, date: "Mar 5, 2026" });
      await ctx.db.insert("customerReferrals", { referrerId: c1._id, referrerPhone: c1.phone, referredName: "Kavya Mehta", status: "Pending", reward: 0, date: "Apr 1, 2026" });
    }
    if (c5) {
      await ctx.db.insert("customerReferrals", { referrerId: c5._id, referrerPhone: c5.phone, referredName: "Ritu Sharma", referredPhone: "+919900099002", status: "Rewarded", reward: 500, date: "Mar 15, 2026" });
      await ctx.db.insert("customerReferrals", { referrerId: c5._id, referrerPhone: c5.phone, referredName: "Neha Gupta", referredPhone: "+919900099003", status: "Visited", reward: 500, date: "Mar 28, 2026" });
    }

    // ===================== TAILOR REFERRALS =====================
    const tl1 = tailorById("TL-001");
    const tl2 = tailorById("TL-002");
    const tl4 = tailorById("TL-004");

    if (c1 && tl1) {
      await ctx.db.insert("tailorReferrals", { tailorId: "TL-001", customerId: c1._id, customerName: c1.name, customerPhone: c1.phone, saree: "Royal Banarasi Silk", fabric: "Silk", storeId: "ST-001", storeName: "MAUVE Sarees", occasion: "Wedding", budget: "₹2000-3000", measurementsShared: true, status: "confirmed", date: "Apr 8, 2026", time: "3:30 PM" });
    }
    if (c2 && tl2) {
      await ctx.db.insert("tailorReferrals", { tailorId: "TL-002", customerId: c2._id, customerName: c2.name, customerPhone: c2.phone, saree: "Chiffon Rose Garden", fabric: "Chiffon", storeId: "ST-001", storeName: "MAUVE Sarees", occasion: "Party", status: "new", date: "Apr 5, 2026" });
    }
    if (c3 && tl4) {
      await ctx.db.insert("tailorReferrals", { tailorId: "TL-004", customerId: c3._id, customerName: c3.name, customerPhone: c3.phone, saree: "Pure Kanchipuram Bridal", fabric: "Silk", storeId: "ST-003", storeName: "Kanchi Collections", occasion: "Wedding", measurementsShared: true, status: "completed", date: "Mar 21, 2026" });
    }

    // ===================== TAILOR ORDERS =====================
    if (c1) {
      await ctx.db.insert("tailorOrders", { orderId: "TO-1001", tailorId: "TL-001", tailorName: "Manoj Darji", customerId: c1._id, customerName: c1.name, customerPhone: c1.phone, saree: "Royal Banarasi Silk", fabric: "Silk", storeId: "ST-001", service: "Silk Blouse Stitching", priceQuoted: 1800, depositPaid: 500, status: "stitching", dueDate: "Apr 15, 2026", orderDate: "Apr 8, 2026", note: "Deep V back, matching zari border, full sleeves", tailorWhatsapp: "+919800100001", bust: "36", waist: "30", shoulder: "14.5", armLength: "22", backLength: "15" });
    }
    if (c3) {
      await ctx.db.insert("tailorOrders", { orderId: "TO-1002", tailorId: "TL-004", tailorName: "Geeta Bai", customerId: c3._id, customerName: c3.name, customerPhone: c3.phone, saree: "Pure Kanchipuram Bridal", fabric: "Silk", storeId: "ST-003", service: "Bridal Blouse", priceQuoted: 3500, depositPaid: 1000, status: "delivered", dueDate: "Apr 2, 2026", orderDate: "Mar 21, 2026", note: "Boat neck, elbow sleeves, temple border matching", tailorWhatsapp: "+919800100004", rating: 5, ratingComment: "Beautiful work!" });
    }
    if (c5) {
      await ctx.db.insert("tailorOrders", { orderId: "TO-1003", tailorId: "TL-001", tailorName: "Manoj Darji", customerId: c5._id, customerName: c5.name, customerPhone: c5.phone, saree: "Paithani Heritage", fabric: "Silk", storeId: "ST-001", service: "Designer Embroidery", priceQuoted: 4500, status: "confirmed", dueDate: "Apr 20, 2026", orderDate: "Apr 7, 2026", note: "Halter neck with peacock motif", tailorWhatsapp: "+919800100001" });
    }

    // ===================== TAILOR COMMISSION =====================
    await ctx.db.insert("tailorCommission", { tailorId: "TL-001", orderId: "TO-1001", amount: 180, type: "referral", status: "pending", date: "Apr 8, 2026", description: "Referral from MAUVE Sarees" });
    await ctx.db.insert("tailorCommission", { tailorId: "TL-004", orderId: "TO-1002", amount: 350, type: "order", status: "paid", date: "Apr 2, 2026", description: "Bridal blouse completed" });
    await ctx.db.insert("tailorCommission", { tailorId: "TL-001", amount: 2500, type: "payout", status: "paid", date: "Apr 1, 2026", description: "Monthly payout" });

    // ===================== FEEDBACK =====================
    if (c1) {
      await ctx.db.insert("feedback", { customerId: c1._id, customerPhone: c1.phone, storeId: "ST-001", sessionId: "SS-10001", rating: 5, chips: ["Loved the experience", "Great saree collection", "Try-on was realistic"], comment: "Amazing experience! The virtual try-on was so realistic.", date: "Apr 8, 2026" });
    }
    if (c3) {
      await ctx.db.insert("feedback", { customerId: c3._id, customerPhone: c3.phone, storeId: "ST-002", sessionId: "SS-10005", rating: 5, chips: ["Great saree collection", "Staff was helpful"], date: "Apr 2, 2026" });
    }

    // ===================== CAMPAIGNS =====================
    await ctx.db.insert("campaigns", { storeId: "ST-001", name: "Gudi Padwa Festival Sale", template: "WA-003", channel: "whatsapp", segment: "All Customers", scheduledDate: "2026-04-12", status: "scheduled", sent: 0, delivered: 0, opened: 0, clicked: 0, revenue: 0, createdAt: "2026-04-05" });
    await ctx.db.insert("campaigns", { storeId: "ST-001", name: "March New Arrivals", channel: "whatsapp", segment: "VIP", status: "completed", sent: 45, delivered: 42, opened: 38, clicked: 15, revenue: 85000, createdAt: "2026-03-01" });
    await ctx.db.insert("campaigns", { storeId: "ST-003", name: "Bridal Collection Launch", template: "WA-003", channel: "whatsapp", segment: "All", status: "sent", sent: 120, delivered: 115, opened: 98, clicked: 42, revenue: 220000, createdAt: "2026-03-15" });

    // ===================== AUDIT LOG =====================
    await ctx.db.insert("auditLog", { timestamp: "10:15 AM", action: "Store ST-001 plan changed to Professional", user: "admin@wearify.com", category: "billing", details: "Upgraded from Smart to Professional" });
    await ctx.db.insert("auditLog", { timestamp: "2:30 PM", action: "New tailor TL-001 verified", user: "admin@wearify.com", category: "tailor", details: "Manoj Darji - all KYC docs verified" });
    await ctx.db.insert("auditLog", { timestamp: "9:00 AM", action: "Feature flag ai_try_on enabled", user: "admin@wearify.com", category: "feature", details: "Virtual try-on enabled globally" });

    // ===================== ROLE EVENTS =====================
    await ctx.db.insert("roleEvents", { eventId: "RE-001", userName: "Ravi Patil", fromRole: "R05", toRole: "R04", reason: "Promotion", approvedBy: "Smita Kabra", date: "Mar 1, 2026", approved: true });
    await ctx.db.insert("roleEvents", { eventId: "RE-002", userName: "Karthik Iyer", fromRole: "R05", toRole: "R04", reason: "Manager vacancy", approvedBy: "Raj Kumar", date: "Feb 15, 2026", approved: true });

    // ===================== CUSTOMER SEGMENTS =====================
    await ctx.db.insert("customerSegments", { storeId: "ST-001", name: "VIP Shoppers", criteria: '{"minVisits":5,"minSpend":50000}', customerCount: 3, createdAt: "2026-03-01" });
    await ctx.db.insert("customerSegments", { storeId: "ST-001", name: "Wedding Season", criteria: '{"occasion":"Wedding","budgetMin":20000}', customerCount: 8, createdAt: "2026-03-15" });
    await ctx.db.insert("customerSegments", { storeId: "ST-003", name: "Silk Lovers", criteria: '{"fabric":"Silk"}', customerCount: 15, createdAt: "2026-02-01" });

    return "Relational data seeded successfully";
  },
});

// Standalone patch: adds body scan data to existing customers (safe to run on already-seeded DB)
export const patchBodyScans = internalMutation({
  args: {},
  handler: async (ctx) => {
    const ananya = await ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", "+919900000001"))
      .unique();
    const deepika = await ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", "+919900000002"))
      .unique();

    const now = Date.now();
    const DAY = 86400000;
    let patched = 0;

    if (ananya && !ananya.lastBodyScan) {
      await ctx.db.patch(ananya._id, { lastBodyScan: now - 60 * DAY });
      patched++;
    }
    if (deepika && !deepika.lastBodyScan) {
      await ctx.db.patch(deepika._id, { lastBodyScan: now - 30 * DAY });
      patched++;
    }

    return `Patched ${patched} customer(s) with body scan data`;
  },
});

