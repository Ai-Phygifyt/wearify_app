
import { useState, useEffect, useContext, createContext, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine
} from "recharts";

// ── Premium Global Styles ─────────────────────────────
const _GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body {
      font-family: "DM Sans", "IBM Plex Sans", -apple-system, BlinkMacSystemFont, sans-serif !important;
      background: #F5EDE4 !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .rm-serif { font-family: "Cormorant Garamond", Georgia, serif !important; }
    .rm-mono  { font-family: "DM Mono", "JetBrains Mono", monospace !important; }

    /* ── Keyframes ── */
    @keyframes rm-fadeIn   { from{opacity:0}to{opacity:1} }
    @keyframes rm-slideUp  { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
    @keyframes rm-slideDown{ from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)} }
    @keyframes rm-scaleIn  { from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)} }
    @keyframes rm-shimmer  { 0%{transform:translateX(-130%)rotate(18deg)}100%{transform:translateX(260%)rotate(18deg)} }
    @keyframes rm-shimmerBg{ 0%{background-position:-200% center}100%{background-position:200% center} }
    @keyframes rm-spin     { to{transform:rotate(360deg)} }
    @keyframes rm-barFill  { from{width:0}to{width:var(--w)} }
    @keyframes rm-dotPulse { 0%,100%{opacity:.25;transform:scale(.7)}40%{opacity:1;transform:scale(1)} }
    @keyframes rm-glow     { 0%,100%{box-shadow:0 0 0 rgba(201,148,26,0)}50%{box-shadow:0 0 20px rgba(201,148,26,.35)} }
    @keyframes rm-float    { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
    @keyframes rm-pageIn   { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }

    .rm-anim-fadeIn  { animation: rm-fadeIn   .4s ease both; }
    .rm-anim-slideUp { animation: rm-slideUp  .5s cubic-bezier(.22,1,.36,1) both; }
    .rm-anim-scaleIn { animation: rm-scaleIn  .35s cubic-bezier(.22,1,.36,1) both; }
    .rm-anim-pageIn  { animation: rm-pageIn   .45s cubic-bezier(.22,1,.36,1) both; }
    .rm-d1{animation-delay:.05s} .rm-d2{animation-delay:.10s} .rm-d3{animation-delay:.15s}
    .rm-d4{animation-delay:.20s} .rm-d5{animation-delay:.25s} .rm-d6{animation-delay:.30s}

    /* ── Silk shimmer on card surfaces ── */
    .rm-silk { position:relative; overflow:hidden; }
    .rm-silk::after { content:''; position:absolute; top:0; left:-100%; width:55%; height:100%;
      background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.14) 50%,transparent 80%);
      animation:rm-shimmer 5s ease-in-out infinite; pointer-events:none; }

    /* ── Gold shimmer text ── */
    .rm-gold-shimmer {
      background:linear-gradient(90deg,#C9941A 0%,#E8C46A 38%,#fff8d0 50%,#E8C46A 62%,#C9941A 100%);
      background-size:200% auto; -webkit-background-clip:text; background-clip:text;
      -webkit-text-fill-color:transparent; animation:rm-shimmerBg 3.5s linear infinite; }

    /* ── Gold zari divider ── */
    .rm-zari { height:1px; background:linear-gradient(90deg,transparent 0%,rgba(201,148,26,.15) 15%,rgba(201,148,26,.6) 50%,rgba(201,148,26,.15) 85%,transparent 100%); }

    /* ── Paisley micropattern ── */
    .rm-paisley {
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cellipse cx='36' cy='28' rx='9' ry='15' fill='none' stroke='%23C9941A' stroke-width='.55' stroke-opacity='.13'/%3E%3Ccircle cx='36' cy='19' r='2' fill='%23C9941A' fill-opacity='.10'/%3E%3Cpath d='M29 48 Q36 55 43 48' fill='none' stroke='%23C9941A' stroke-width='.45' stroke-opacity='.09'/%3E%3C/svg%3E");
      background-size:72px 72px; }

    /* ── Noise texture ── */
    .rm-noise::before { content:''; position:absolute; inset:-50%; width:200%; height:200%;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      opacity:.025; pointer-events:none; z-index:0; border-radius:inherit; }

    /* ── Hover lift for interactive cards ── */
    .rm-hover-lift { transition:transform .2s ease,box-shadow .2s ease !important; }
    .rm-hover-lift:hover { transform:translateY(-2px) !important; box-shadow:0 8px 28px rgba(10,22,40,.16) !important; }

    /* ── Active row highlight ── */
    .rm-row-hover:hover { background:rgba(201,148,26,.05) !important; }

    /* ── Press feedback ── */
    .rm-press:active { transform:scale(.96) !important; transition:transform .08s ease !important; }

    /* ── Card gold border on hover ── */
    .rm-card-gold:hover { border-color:rgba(201,148,26,.45) !important; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width:3px; height:3px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(201,148,26,.2); border-radius:4px; }
    .rm-no-scroll::-webkit-scrollbar { display:none; }
    .rm-no-scroll { -ms-overflow-style:none; scrollbar-width:none; }

    /* ── Text selection ── */
    ::selection { background:rgba(201,148,26,.22); color:#1A0A1E; }

    /* ── Font override for all children ── */
    [class], button, input, select, textarea, th, td, label, span, div, p, h1, h2, h3, h4, h5 {
      font-family: "DM Sans", "IBM Plex Sans", -apple-system, sans-serif;
    }
    code, pre, .mono-text { font-family: "DM Mono", "JetBrains Mono", monospace !important; }
  `}</style>
);

// ═══════════════════════════════════════════════════════
// DESIGN TOKENS  ·  Executive Precision — Premium Edition
// ═══════════════════════════════════════════════════════
const T = {
  // Core palette
  navy: "#0A1628",          // Midnight Navy — deeper, richer
  navyL: "#132236",         // Lighter navy for sidebar hover
  navyXL: "#1C3350",        // Sidebar item active
  teal: "#1A4A65",          // Jewel Teal
  tealL: "#245E80",         // Lighter teal
  accentBlue: "#5BA8D0",    // Accent — slightly muted
  gold: "#C9941A",          // Antique Gold — matching Sales Tablet
  goldL: "#E8C46A",         // Light gold
  goldD: "#8B6914",         // Dark gold for text
  goldGhost: "#FDF5E4",     // Gold ghost bg
  // Surfaces
  cream: "#FDF8F0",         // Warm ivory — matching Sales Tablet
  creamDark: "#F0E8DC",     // Slightly deeper
  linen: "#EEE4D8",         // Dividers
  blush: "#FBF0F4",         // Card alternate
  white: "#FFFFFF",
  // Status
  success: "#1B5E20",
  successLight: "#E8F5E9",
  alert: "#B71C1C",
  alertLight: "#FFEBEE",
  amber: "#E65100",
  amberLight: "#FFF3E0",
  // Text
  text: "#1A0A1E",          // Deep plum-black — warm
  textMid: "#3D2B4A",
  muted: "#7A6E8A",
  // Borders & shadows
  border: "#E8D5E0",
  borderL: "#F2E8EE",
  shadow: "0 2px 14px rgba(10,22,40,0.09)",
  shadowMd: "0 6px 28px rgba(10,22,40,0.13)",
  shadowLg: "0 12px 48px rgba(10,22,40,0.20)",
  shadowGold: "0 4px 20px rgba(201,148,26,0.25)",
  // Radii
  radius: "14px",
  radiusSm: "10px",
  radiusLg: "20px",
  radiusPill: "100px",
  // Gradients
  gradNav: "linear-gradient(170deg, #0A1628 0%, #132236 45%, #1A4A65 100%)",
  gradGold: "linear-gradient(135deg, #C9941A 0%, #E8C46A 55%, #C9941A 100%)",
  gradPrimary: "linear-gradient(135deg, #0A1628 0%, #1A4A65 100%)",
  gradSuccess: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
};

// ═══════════════════════════════════════════════════════
// MOCK DATA  (Session 1 + Session 2 extended)
// ═══════════════════════════════════════════════════════
const MOCK = {
  store: {
    id: "store_001",
    name: "Ramesh Silks & Sarees",
    owner: "Ramesh Agarwal",
    phone: "+91 98765 43210",
    city: "Varanasi",
    state: "Uttar Pradesh",
    gstin: "09AAACR5055K1ZB",
    subscription: "active",
    plan: "Professional",
    healthScore: 78,
    catalogueCount: 312,
    digitisedPercent: 84,
    essentialMode: false,
  },
  kpis: {
    todayRevenue: 48500,
    todayRevenueChange: +12.4,
    customersServed: 7,
    customersChange: +2,
    conversionRate: 34.2,
    conversionChange: -2.1,
    mirrorSessions: 18,
    sessionsChange: +5,
  },
  revenueWeek: [
    { day: "Mon", revenue: 32000 }, { day: "Tue", revenue: 41000 },
    { day: "Wed", revenue: 28500 }, { day: "Thu", revenue: 55000 },
    { day: "Fri", revenue: 62000 }, { day: "Sat", revenue: 78000 },
    { day: "Sun", revenue: 48500 },
  ],
  funnel: [
    { name: "Footfall", value: 52, fill: T.teal },
    { name: "Sessions", value: 18, fill: T.accentBlue },
    { name: "Try-Ons", value: 11, fill: T.gold },
    { name: "Purchases", value: 6, fill: T.success },
  ],
  alerts: [
    { id: 1, type: "aging", icon: "⚠️", color: T.amber, bg: T.amberLight, title: "14 sarees aging >90 days", subtitle: "Potential dead stock — take action now", screen: "aging" },
    { id: 2, type: "birthday", icon: "🎂", color: T.teal, bg: "#E3F2FD", title: "3 customers have birthdays this week", subtitle: "Send personalised WhatsApp greetings", screen: "campaigns" },
    { id: 3, type: "trend", icon: "📈", color: T.success, bg: T.successLight, title: "Georgette demand up 34% this week", subtitle: "Consider restocking — festival season approaching", screen: "analytics" },
  ],
  // ── Extended sarees with full detail for Session 2 screens ──
  sarees: [
    {
      id: "SAR001", name: "Kanjivaram Pure Silk", type: "Kanjivaram", fabric: "Pure Silk",
      price: 45000, mrp: 52000, stock: 3, status: "active", daysOld: 12,
      emoji: "🌺", tag: "Premium",
      color: "#8B1A1A", colorName: "Deep Maroon",
      region: "Tamil Nadu", occasion: "Wedding",
      weave: "Zari", weight: "Heavy",
      aiTags: ["Kanjivaram", "Pure Silk", "Zari Work", "Wedding", "Heavy", "South Indian", "Bridal"],
      description: "Authentic Kanjivaram pure silk saree with intricate zari work. Handwoven by master weavers of Kanchipuram, featuring traditional temple border motifs.",
      tryOns: 28, views: 156, sessions: 42, conversions: 3,
      images: ["front", "back", "pallu", "border"],
      addedBy: "Ramesh Agarwal",
      festivalDemand: "High — Diwali + Wedding season",
      reorderScore: 9.1,
    },
    {
      id: "SAR002", name: "Banarasi Georgette", type: "Banarasi", fabric: "Georgette",
      price: 18500, mrp: 22000, stock: 8, status: "active", daysOld: 45,
      emoji: "🌸", tag: "Trending",
      color: "#4A235A", colorName: "Royal Purple",
      region: "Uttar Pradesh", occasion: "Festival",
      weave: "Meenakari", weight: "Medium",
      aiTags: ["Banarasi", "Georgette", "Meenakari", "Festival", "Medium Weight", "North Indian"],
      description: "Lightweight Banarasi georgette with meenakari motifs. Perfect for festival and party occasions. Easy to drape, suitable for all body types.",
      tryOns: 45, views: 289, sessions: 67, conversions: 8,
      images: ["front", "back", "pallu", "border"],
      addedBy: "Mohan Kumar",
      festivalDemand: "Very High — Navratri + Diwali",
      reorderScore: 9.6,
    },
    {
      id: "SAR003", name: "Chanderi Cotton Silk", type: "Chanderi", fabric: "Cotton-Silk",
      price: 5200, mrp: 6500, stock: 12, status: "active", daysOld: 28,
      emoji: "🪷", tag: "",
      color: "#1A5276", colorName: "Peacock Blue",
      region: "Madhya Pradesh", occasion: "Casual",
      weave: "Jamdani", weight: "Light",
      aiTags: ["Chanderi", "Cotton-Silk", "Jamdani", "Casual", "Lightweight", "Everyday"],
      description: "Elegant Chanderi cotton-silk blend with traditional jamdani weave. Ideal for daily wear and office use. Naturally breathable fabric.",
      tryOns: 12, views: 98, sessions: 24, conversions: 5,
      images: ["front", "back", "pallu", "border"],
      addedBy: "Anita Devi",
      festivalDemand: "Moderate",
      reorderScore: 6.2,
    },
    {
      id: "SAR004", name: "Mysore Silk Crepe", type: "Mysore", fabric: "Silk Crepe",
      price: 22000, mrp: 26000, stock: 2, status: "low_stock", daysOld: 95,
      emoji: "🌼", tag: "Aging",
      color: "#F39C12", colorName: "Golden Yellow",
      region: "Karnataka", occasion: "Wedding",
      weave: "Plain", weight: "Medium",
      aiTags: ["Mysore Silk", "Crepe", "Plain Weave", "Wedding", "GI Tag", "Karnataka"],
      description: "GI-tagged Mysore silk crepe with natural lustre. Lightweight yet elegant. Features traditional gold border.",
      tryOns: 7, views: 45, sessions: 11, conversions: 0,
      images: ["front", "back", "pallu", "border"],
      addedBy: "Ramesh Agarwal",
      festivalDemand: "Low — Off season",
      reorderScore: 3.1,
    },
    {
      id: "SAR005", name: "Pochampally Ikat", type: "Pochampally", fabric: "Cotton-Silk",
      price: 12000, mrp: 14000, stock: 5, status: "active", daysOld: 60,
      emoji: "🎨", tag: "",
      color: "#1E8449", colorName: "Emerald Green",
      region: "Telangana", occasion: "Casual-Formal",
      weave: "Ikat", weight: "Medium",
      aiTags: ["Pochampally", "Ikat", "Handloom", "GI Tag", "Geometric", "Telangana"],
      description: "Authentic Pochampally double ikat saree. Handloom woven with unique geometric patterns created by resist dyeing process.",
      tryOns: 19, views: 112, sessions: 31, conversions: 4,
      images: ["front", "back", "pallu", "border"],
      addedBy: "Rajesh Singh",
      festivalDemand: "Moderate — Ugadi season",
      reorderScore: 5.8,
    },
    {
      id: "SAR006", name: "Tant Cotton Daily Wear", type: "Tant", fabric: "Cotton",
      price: 3500, mrp: 4200, stock: 18, status: "active", daysOld: 15,
      emoji: "🧵", tag: "Fast Moving",
      color: "#CB4335", colorName: "Vermillion Red",
      region: "West Bengal", occasion: "Daily",
      weave: "Plain", weight: "Feather Light",
      aiTags: ["Tant", "Cotton", "Handloom", "Daily Wear", "Bengal", "Summer"],
      description: "Traditional Bengal tant cotton with distinctive texture. Extremely comfortable for daily wear. Hand-woven on traditional pit loom.",
      tryOns: 8, views: 74, sessions: 19, conversions: 9,
      images: ["front", "back", "pallu", "border"],
      addedBy: "Mohan Kumar",
      festivalDemand: "High — Durga Puja",
      reorderScore: 8.4,
    },
    {
      id: "SAR007", name: "Paithani Silk", type: "Paithani", fabric: "Pure Silk",
      price: 38000, mrp: 45000, stock: 1, status: "low_stock", daysOld: 110,
      emoji: "🦚", tag: "Aging",
      color: "#1A237E", colorName: "Indigo Blue",
      region: "Maharashtra", occasion: "Wedding",
      weave: "Tapestry", weight: "Heavy",
      aiTags: ["Paithani", "Pure Silk", "Tapestry", "Wedding", "Peacock Motif", "Maharashtra"],
      description: "Exquisite Paithani silk with traditional peacock and flower motifs. Tapestry weave using gold and silver threads.",
      tryOns: 3, views: 22, sessions: 6, conversions: 0,
      images: ["front", "back", "pallu", "border"],
      addedBy: "Ramesh Agarwal",
      festivalDemand: "Low — Needs promotion",
      reorderScore: 2.4,
    },
    {
      id: "SAR008", name: "Sambalpuri Ikat", type: "Sambalpuri", fabric: "Silk-Cotton",
      price: 8500, mrp: 10000, stock: 6, status: "active", daysOld: 35,
      emoji: "🏺", tag: "",
      color: "#6C3483", colorName: "Amethyst Purple",
      region: "Odisha", occasion: "Festival",
      weave: "Ikat", weight: "Medium",
      aiTags: ["Sambalpuri", "Ikat", "Odisha", "GI Tag", "Tribal", "Festival"],
      description: "GI-tagged Sambalpuri ikat from Odisha. Traditional tribal motifs woven with bandha (tie-dye) technique.",
      tryOns: 14, views: 88, sessions: 27, conversions: 3,
      images: ["front", "back", "pallu", "border"],
      addedBy: "Anita Devi",
      festivalDemand: "Moderate — Puja season",
      reorderScore: 6.7,
    },
  ],

  // ── Aging sarees for AgingScreen / AgingActionSheet ──
  agingSarees: [
    { id: "SAR004", name: "Mysore Silk Crepe", emoji: "🌼", price: 22000, daysOld: 95, tier: "90+", action: null, views: 45, tryOns: 7 },
    { id: "SAR007", name: "Paithani Silk", emoji: "🦚", price: 38000, daysOld: 110, tier: "90+", action: null, views: 22, tryOns: 3 },
    { id: "SAR009", name: "Dharmavaram Silk", emoji: "🌻", price: 28000, daysOld: 125, tier: "120+", action: null, views: 18, tryOns: 2 },
    { id: "SAR010", name: "Kasavu Cotton", emoji: "⚪", price: 4200, daysOld: 88, tier: "60-90", action: null, views: 62, tryOns: 11 },
    { id: "SAR011", name: "Bhagalpuri Silk", emoji: "🌾", price: 9500, daysOld: 73, tier: "60-90", action: null, views: 54, tryOns: 9 },
    { id: "SAR012", name: "Gadwal Silk", emoji: "🏵️", price: 32000, daysOld: 130, tier: "120+", action: null, views: 11, tryOns: 1 },
  ],

  // ── Reorder suggestions (Chronos-2 mock output) ──
  reorderSuggestions: [
    {
      id: "R001", name: "Banarasi Georgette", emoji: "🌸",
      currentStock: 8, suggestedReorder: 15, confidence: 94,
      reason: "Navratri + Diwali demand spike predicted — 34% above baseline",
      urgency: "high", priceRange: "₹15,000–₹25,000",
      demandForecast: [
        { week: "W1", demand: 8, current: 8 },
        { week: "W2", demand: 12, current: 8 },
        { week: "W3", demand: 18, current: 8 },
        { week: "W4", demand: 14, current: 0 },
        { week: "W5", demand: 9, current: 0 },
      ],
    },
    {
      id: "R002", name: "Tant Cotton Daily", emoji: "🧵",
      currentStock: 18, suggestedReorder: 25, confidence: 88,
      reason: "Fast-moving SKU — stock depletes in 12 days at current velocity",
      urgency: "medium", priceRange: "₹3,000–₹5,000",
      demandForecast: [
        { week: "W1", demand: 9, current: 18 },
        { week: "W2", demand: 9, current: 9 },
        { week: "W3", demand: 7, current: 0 },
        { week: "W4", demand: 6, current: 0 },
        { week: "W5", demand: 5, current: 0 },
      ],
    },
    {
      id: "R003", name: "Kanjivaram Pure Silk", emoji: "🌺",
      currentStock: 3, suggestedReorder: 5, confidence: 82,
      reason: "Wedding season demand remains strong — high margin item",
      urgency: "high", priceRange: "₹40,000–₹60,000",
      demandForecast: [
        { week: "W1", demand: 2, current: 3 },
        { week: "W2", demand: 3, current: 1 },
        { week: "W3", demand: 3, current: 0 },
        { week: "W4", demand: 2, current: 0 },
        { week: "W5", demand: 1, current: 0 },
      ],
    },
    {
      id: "R004", name: "Chanderi Cotton Silk", emoji: "🪷",
      currentStock: 12, suggestedReorder: 8, confidence: 71,
      reason: "Moderate restock needed before office season picks up in Oct",
      urgency: "low", priceRange: "₹4,500–₹7,000",
      demandForecast: [
        { week: "W1", demand: 5, current: 12 },
        { week: "W2", demand: 4, current: 7 },
        { week: "W3", demand: 3, current: 3 },
        { week: "W4", demand: 4, current: 0 },
        { week: "W5", demand: 4, current: 0 },
      ],
    },
  ],

  // ── Festival calendar ──
  festivals: [
    { name: "Navratri", date: "Oct 3–12", daysAway: 14, impact: "Very High", color: T.gold },
    { name: "Diwali", date: "Oct 31", daysAway: 42, impact: "Very High", color: T.amber },
    { name: "Bhai Dooj", date: "Nov 2", daysAway: 44, impact: "High", color: T.teal },
    { name: "Chhath Puja", date: "Nov 7", daysAway: 49, impact: "High", color: T.success },
  ],

  // ── Revenue detail data ──
  revenueMonthly: [
    { month: "Oct '25", revenue: 420000 }, { month: "Nov '25", revenue: 510000 },
    { month: "Dec '25", revenue: 680000 }, { month: "Jan '26", revenue: 390000 },
    { month: "Feb '26", revenue: 445000 }, { month: "Mar '26", revenue: 340000 },
  ],
  revenueByCategory: [
    { name: "Kanjivaram", revenue: 180000, units: 4, avgTicket: 45000, trend: "+12%" },
    { name: "Banarasi", revenue: 142000, units: 8, avgTicket: 17750, trend: "+34%" },
    { name: "Chanderi", revenue: 88000, units: 17, avgTicket: 5176, trend: "+5%" },
    { name: "Pochampally", revenue: 72000, units: 6, avgTicket: 12000, trend: "-3%" },
    { name: "Tant Cotton", revenue: 63000, units: 18, avgTicket: 3500, trend: "+22%" },
    { name: "Mysore Silk", revenue: 44000, units: 2, avgTicket: 22000, trend: "-18%" },
    { name: "Sambalpuri", revenue: 34000, units: 4, avgTicket: 8500, trend: "+8%" },
    { name: "Paithani", revenue: 38000, units: 1, avgTicket: 38000, trend: "-41%" },
  ],
  revenueByStaff: [
    { name: "Mohan Kumar", revenue: 245000, conversions: 12, sessions: 28 },
    { name: "Anita Devi", revenue: 196000, conversions: 9, sessions: 22 },
    { name: "Rajesh Singh", revenue: 120000, conversions: 7, sessions: 18 },
  ],

  // ── Health score breakdown (6 dimensions from AGT-03) ──
  healthDimensions: [
    { name: "Revenue Health", weight: 25, score: 82, status: "green", icon: "💰", detail: "Daily revenue +12.4% vs 30-day avg. Category mix healthy.", actions: [] },
    { name: "Conversion Health", weight: 20, score: 74, status: "green", icon: "🎯", detail: "Try-on conversion 54.5% — above 45% target. Walk-in engagement strong.", actions: [] },
    { name: "Inventory Health", weight: 20, score: 61, status: "amber", icon: "👗", detail: "Dead stock 14 SKUs (4.5% of inventory). 84% digitised — 16% gap.", actions: ["Upload 50 more sarees to reach 100% digitisation", "Clear 3 sarees aged >120 days this week"] },
    { name: "Customer Health", weight: 15, score: 88, status: "green", icon: "👥", detail: "Repeat visit rate 62%. WhatsApp engagement at 78% for opted-in customers.", actions: [] },
    { name: "Platform Adoption", weight: 10, score: 71, status: "amber", icon: "🪞", detail: "18 mirror sessions/day this week, down from 24 last week.", actions: ["Remind staff to recommend mirror try-ons during browsing"] },
    { name: "Operational Health", weight: 10, score: 95, status: "green", icon: "⚙️", detail: "Edge device online 99.8% uptime. Sync successful. All staff logged in.", actions: [] },
  ],

  // ── Demand forecast (Chronos-2 output simulation) ──
  demandForecast: {
    "30d": [
      { week: "W1 Mar 22", actual: 48500, forecast: null, lower: null, upper: null },
      { week: "W2 Mar 29", actual: null, forecast: 52000, lower: 44000, upper: 61000 },
      { week: "W3 Apr 5", actual: null, forecast: 58000, lower: 48000, upper: 68000 },
      { week: "W4 Apr 12", actual: null, forecast: 71000, lower: 59000, upper: 83000 },
    ],
    "60d": [
      { week: "W1", actual: 48500, forecast: null, lower: null, upper: null },
      { week: "W2", actual: null, forecast: 52000, lower: 44000, upper: 61000 },
      { week: "W3", actual: null, forecast: 58000, lower: 48000, upper: 68000 },
      { week: "W4", actual: null, forecast: 71000, lower: 59000, upper: 83000 },
      { week: "W5 Nav", actual: null, forecast: 95000, lower: 82000, upper: 108000 },
      { week: "W6", actual: null, forecast: 88000, lower: 74000, upper: 102000 },
      { week: "W7", actual: null, forecast: 112000, lower: 95000, upper: 129000 },
      { week: "W8 Diw", actual: null, forecast: 148000, lower: 126000, upper: 170000 },
    ],
    "90d": [
      { week: "W1", actual: 48500, forecast: null, lower: null, upper: null },
      { week: "W2", actual: null, forecast: 52000, lower: 44000, upper: 61000 },
      { week: "W4", actual: null, forecast: 71000, lower: 59000, upper: 83000 },
      { week: "W5 Nav", actual: null, forecast: 95000, lower: 82000, upper: 108000 },
      { week: "W8 Diw", actual: null, forecast: 148000, lower: 126000, upper: 170000 },
      { week: "W10", actual: null, forecast: 108000, lower: 88000, upper: 128000 },
      { week: "W11", actual: null, forecast: 92000, lower: 74000, upper: 110000 },
      { week: "W12 Chr", actual: null, forecast: 125000, lower: 104000, upper: 146000 },
    ],
  },
  forecastByCategory: [
    { name: "Kanjivaram", trend: "stable", nextMonth: 195000, change: +8, confidence: 84 },
    { name: "Banarasi", trend: "rising", nextMonth: 198000, change: +39, confidence: 91 },
    { name: "Tant Cotton", trend: "rising", nextMonth: 78000, change: +24, confidence: 88 },
    { name: "Chanderi", trend: "stable", nextMonth: 92000, change: +5, confidence: 76 },
    { name: "Pochampally", trend: "falling", nextMonth: 58000, change: -19, confidence: 71 },
    { name: "Paithani", trend: "falling", nextMonth: 22000, change: -42, confidence: 68 },
  ],

  // ── Dead stock curve data ──
  deadStockCurve: [
    { bucket: "0–30d", count: 198, value: 2840000, pct: 63 },
    { bucket: "30–60d", count: 62, value: 820000, pct: 20 },
    { bucket: "60–90d", count: 31, value: 468000, pct: 10 },
    { bucket: "90–120d", count: 14, value: 310000, pct: 4.5 },
    { bucket: "120d+", count: 7, value: 240000, pct: 2.5 },
  ],

  customers: [
    {
      id: "C001", name: "Priya Sharma", phone: "+91 99999 11111",
      visits: 5, lastVisit: "2 days ago", lastVisitDate: "2026-03-20",
      clv: 85000, status: "VIP", segment: "Wedding Shopper",
      initials: "PS", joinedDate: "Jan 2025",
      churnRisk: "low", churnScore: 12,
      preferredFabric: ["Kanjivaram", "Banarasi"], preferredColor: ["Red", "Maroon"],
      budget: "₹20,000–₹60,000", occasion: "Wedding",
      dpdpConsent: { crm: true, marketing: true, analytics: true, grantedDate: "Jan 12, 2025" },
      whatsappOptIn: true,
      purchaseHistory: [
        { date: "Mar 18, 2026", item: "Kanjivaram Pure Silk", amount: 45000, staff: "Mohan Kumar" },
        { date: "Feb 3, 2026", item: "Banarasi Georgette", amount: 18500, staff: "Anita Devi" },
        { date: "Dec 14, 2025", item: "Chanderi Cotton Silk", amount: 5200, staff: "Mohan Kumar" },
      ],
      tryOnHistory: ["Kanjivaram Pure Silk", "Paithani Silk", "Mysore Silk Crepe"],
      birthday: "Apr 15",
      anniversary: "Nov 22",
      notes: "Prefers heavy silk for wedding occasions. Brings family. High-value buyer.",
      engagementScore: 91,
      campaignsSent: 8, campaignsOpened: 7,
    },
    {
      id: "C002", name: "Deepa Mehra", phone: "+91 99999 22222",
      visits: 3, lastVisit: "1 week ago", lastVisitDate: "2026-03-15",
      clv: 42000, status: "Regular", segment: "Festival Buyer",
      initials: "DM", joinedDate: "Mar 2025",
      churnRisk: "medium", churnScore: 44,
      preferredFabric: ["Georgette", "Chanderi"], preferredColor: ["Blue", "Green"],
      budget: "₹8,000–₹25,000", occasion: "Festival",
      dpdpConsent: { crm: true, marketing: true, analytics: false, grantedDate: "Mar 5, 2025" },
      whatsappOptIn: true,
      purchaseHistory: [
        { date: "Feb 14, 2026", item: "Sambalpuri Ikat", amount: 8500, staff: "Rajesh Singh" },
        { date: "Oct 2, 2025", item: "Tant Cotton Daily", amount: 3500, staff: "Mohan Kumar" },
      ],
      tryOnHistory: ["Banarasi Georgette", "Chanderi Cotton Silk"],
      birthday: "Jul 8",
      anniversary: null,
      notes: "Festival season buyer. Responds well to WhatsApp campaigns.",
      engagementScore: 68,
      campaignsSent: 5, campaignsOpened: 3,
    },
    {
      id: "C003", name: "Sunita Agarwal", phone: "+91 99999 33333",
      visits: 1, lastVisit: "3 weeks ago", lastVisitDate: "2026-03-01",
      clv: 15000, status: "New", segment: "First-Time",
      initials: "SA", joinedDate: "Mar 2026",
      churnRisk: "high", churnScore: 72,
      preferredFabric: ["Cotton"], preferredColor: ["Yellow", "Orange"],
      budget: "₹3,000–₹8,000", occasion: "Casual",
      dpdpConsent: { crm: true, marketing: false, analytics: true, grantedDate: "Mar 1, 2026" },
      whatsappOptIn: false,
      purchaseHistory: [
        { date: "Mar 1, 2026", item: "Chanderi Cotton Silk", amount: 5200, staff: "Anita Devi" },
      ],
      tryOnHistory: ["Tant Cotton Daily", "Chanderi Cotton Silk"],
      birthday: "Sep 3",
      anniversary: null,
      notes: "New customer. First visit — bought Chanderi. No WhatsApp consent yet.",
      engagementScore: 31,
      campaignsSent: 0, campaignsOpened: 0,
    },
    {
      id: "C004", name: "Kavitha Nair", phone: "+91 99999 44444",
      visits: 8, lastVisit: "Yesterday", lastVisitDate: "2026-03-21",
      clv: 125000, status: "VIP", segment: "Loyal Customer",
      initials: "KN", joinedDate: "Aug 2024",
      churnRisk: "low", churnScore: 5,
      preferredFabric: ["Pure Silk", "Silk Crepe"], preferredColor: ["Purple", "Gold"],
      budget: "₹30,000–₹80,000", occasion: "Wedding",
      dpdpConsent: { crm: true, marketing: true, analytics: true, grantedDate: "Aug 20, 2024" },
      whatsappOptIn: true,
      purchaseHistory: [
        { date: "Mar 21, 2026", item: "Paithani Silk", amount: 38000, staff: "Mohan Kumar" },
        { date: "Jan 11, 2026", item: "Kanjivaram Pure Silk", amount: 45000, staff: "Mohan Kumar" },
        { date: "Nov 5, 2025", item: "Mysore Silk Crepe", amount: 22000, staff: "Anita Devi" },
      ],
      tryOnHistory: ["Paithani Silk", "Kanjivaram Pure Silk", "Mysore Silk Crepe", "Dharmavaram Silk"],
      birthday: "Dec 19",
      anniversary: "Feb 14",
      notes: "Top buyer. Loyal for 18+ months. Prefers traditional heavy silks. Refer-a-friend — brought 2 customers.",
      engagementScore: 97,
      campaignsSent: 12, campaignsOpened: 11,
    },
    {
      id: "C005", name: "Meena Joshi", phone: "+91 99999 55555",
      visits: 2, lastVisit: "6 weeks ago", lastVisitDate: "2026-02-08",
      clv: 28000, status: "Regular", segment: "Dormant",
      initials: "MJ", joinedDate: "Nov 2025",
      churnRisk: "high", churnScore: 81,
      preferredFabric: ["Georgette", "Chiffon"], preferredColor: ["Pink", "Peach"],
      budget: "₹5,000–₹15,000", occasion: "Party",
      dpdpConsent: { crm: true, marketing: true, analytics: false, grantedDate: "Nov 18, 2025" },
      whatsappOptIn: true,
      purchaseHistory: [
        { date: "Dec 22, 2025", item: "Banarasi Georgette", amount: 18500, staff: "Rajesh Singh" },
        { date: "Nov 18, 2025", item: "Tant Cotton Daily", amount: 3500, staff: "Rajesh Singh" },
      ],
      tryOnHistory: ["Banarasi Georgette", "Sambalpuri Ikat"],
      birthday: "Feb 28",
      anniversary: null,
      notes: "Went quiet after December. Re-engagement campaign recommended.",
      engagementScore: 22,
      campaignsSent: 4, campaignsOpened: 1,
    },
  ],

  // ── Saved segments ──
  segments: [
    { id: "SEG001", name: "VIP Wedding Buyers", color: T.gold, count: 24, rules: ["Spent > ₹30,000", "Occasion = Wedding", "Visits ≥ 3"], lastRun: "2 hours ago" },
    { id: "SEG002", name: "Festival Season", color: T.teal, count: 87, rules: ["WhatsApp opt-in = Yes", "Last visit ≤ 60 days"], lastRun: "1 day ago" },
    { id: "SEG003", name: "Dormant Customers", color: T.alert, count: 31, rules: ["Last visit > 45 days", "CLV > ₹10,000"], lastRun: "3 days ago" },
    { id: "SEG004", name: "Birthday This Month", color: "#7B1FA2", count: 6, rules: ["Birthday month = current month"], lastRun: "Today" },
  ],

  // ── Campaign templates (Claude Haiku output) ──
  campaignTemplates: [
    {
      id: "T001", name: "Festival Sale", category: "Festival",
      icon: "🎉", color: T.gold,
      body: "Namaste {{name}}! 🌸 Navratri is almost here — and we've just added fresh arrivals perfect for the celebrations. As one of our valued customers, you get first look! Visit Ramesh Silks & Sarees before Oct 3.\n\nHappy Navratri! 🙏",
      estimatedOpen: "68%", estimatedRevenue: "₹45,000–₹80,000",
    },
    {
      id: "T002", name: "Birthday Wish", category: "Personal",
      icon: "🎂", color: "#7B1FA2",
      body: "Wishing you a wonderful birthday, {{name}}! 🎂✨\n\nAs a special gift from us, enjoy 10% off your next visit to Ramesh Silks this month. You deserve to look gorgeous on your special day!\n\nWith love, Ramesh Silks & Sarees 🌺",
      estimatedOpen: "82%", estimatedRevenue: "₹12,000–₹25,000",
    },
    {
      id: "T003", name: "Win-Back / Re-Engage", category: "Re-engagement",
      icon: "💌", color: T.teal,
      body: "Hi {{name}}, we miss you! 🌷\n\nIt's been a while since your last visit. We have beautiful new arrivals we think you'd love — including {{fabric}} sarees in shades you've shown interest in before.\n\nCome visit us at Ramesh Silks, Varanasi. We'd love to show you something special! 🙏",
      estimatedOpen: "54%", estimatedRevenue: "₹20,000–₹40,000",
    },
    {
      id: "T004", name: "New Arrival Alert", category: "Product",
      icon: "✨", color: T.navy,
      body: "Hello {{name}}! 🌺\n\nExciting news — we just received a stunning collection of {{category}} sarees, crafted especially for the season ahead.\n\nBe the first to see them. Visit Ramesh Silks & Sarees, Varanasi or reply to this message to book your private viewing. Quantities are limited!\n\nWarm regards, Ramesh Agarwal 🙏",
      estimatedOpen: "61%", estimatedRevenue: "₹35,000–₹60,000",
    },
    {
      id: "T005", name: "Clearance Offer", category: "Discount",
      icon: "🏷️", color: T.amber,
      body: "Special offer for you, {{name}}! 🎁\n\nFor a limited time, we're offering select sarees at special prices — up to 25% off on premium stock. This is exclusive to our valued customers.\n\nVisit us soon at Ramesh Silks, Varanasi. Offer ends this Sunday. 🌸",
      estimatedOpen: "71%", estimatedRevenue: "₹28,000–₹55,000",
    },
  ],
  staff: [
    {
      id: "ST001", name: "Mohan Kumar", role: "Senior Staff", conversions: 12, sessions: 28,
      pin: "1234", shift: "Morning", joined: "Aug 2024", phone: "+91 98111 00001",
      revenue: 245000, upsellRate: 42, avgSessionTime: "18 min", absentDays: 1,
      shiftHistory: [
        { date: "Mar 22", sessions: 5, conversions: 3, revenue: 52000, duration: "9AM–2PM" },
        { date: "Mar 21", sessions: 4, conversions: 2, revenue: 41000, duration: "9AM–2PM" },
        { date: "Mar 20", sessions: 6, conversions: 4, revenue: 68000, duration: "9AM–2PM" },
        { date: "Mar 19", sessions: 3, conversions: 1, revenue: 22000, duration: "9AM–2PM" },
        { date: "Mar 18", sessions: 5, conversions: 2, revenue: 38000, duration: "9AM–2PM" },
      ],
      coachingNotes: "Excellent with bridal customers. Suggest focusing on upselling accessories.",
      badges: ["🏆 Top Seller Mar", "⭐ 5-Star Rated"],
      weeklyRevenue: [38000, 45000, 52000, 61000, 48000, 72000, 52000],
      rank: 1,
    },
    {
      id: "ST002", name: "Rajesh Singh", role: "Sales Staff", conversions: 7, sessions: 18,
      pin: "5678", shift: "Evening", joined: "Nov 2024", phone: "+91 98111 00002",
      revenue: 120000, upsellRate: 28, avgSessionTime: "14 min", absentDays: 3,
      shiftHistory: [
        { date: "Mar 22", sessions: 3, conversions: 1, revenue: 18500, duration: "2PM–8PM" },
        { date: "Mar 21", sessions: 4, conversions: 2, revenue: 26000, duration: "2PM–8PM" },
        { date: "Mar 20", sessions: 2, conversions: 1, revenue: 12000, duration: "2PM–8PM" },
        { date: "Mar 19", sessions: 3, conversions: 2, revenue: 24000, duration: "2PM–8PM" },
        { date: "Mar 18", sessions: 3, conversions: 1, revenue: 19500, duration: "2PM–8PM" },
      ],
      coachingNotes: "Good product knowledge. Work on closing hesitant customers — offer 'save for later' feature.",
      badges: ["📈 Improved 20%"],
      weeklyRevenue: [18000, 22000, 26000, 19000, 24000, 20000, 18500],
      rank: 3,
    },
    {
      id: "ST003", name: "Anita Devi", role: "Senior Staff", conversions: 9, sessions: 22,
      pin: "9012", shift: "Morning", joined: "Sep 2024", phone: "+91 98111 00003",
      revenue: 196000, upsellRate: 36, avgSessionTime: "16 min", absentDays: 0,
      shiftHistory: [
        { date: "Mar 22", sessions: 4, conversions: 2, revenue: 34000, duration: "9AM–2PM" },
        { date: "Mar 21", sessions: 5, conversions: 3, revenue: 48000, duration: "9AM–2PM" },
        { date: "Mar 20", sessions: 4, conversions: 2, revenue: 32000, duration: "9AM–2PM" },
        { date: "Mar 19", sessions: 4, conversions: 1, revenue: 28000, duration: "9AM–2PM" },
        { date: "Mar 18", sessions: 3, conversions: 1, revenue: 22000, duration: "9AM–2PM" },
      ],
      coachingNotes: "Perfect attendance. Great with repeat customers. Encourage her to build more new customer relationships.",
      badges: ["🎯 Perfect Attendance", "💬 Customer Favourite"],
      weeklyRevenue: [28000, 32000, 34000, 41000, 38000, 45000, 34000],
      rank: 2,
    },
  ],

  // ── Billing & subscription mock ──
  billing: {
    plan: "Professional",
    status: "active",
    amount: 15000,
    billingCycle: "monthly",
    nextBillingDate: "Apr 22, 2026",
    paymentMethod: { type: "UPI", last4: "3210", brand: "GPay" },
    invoices: [
      { id: "INV-0024", date: "Mar 22, 2026", amount: 15000, status: "paid" },
      { id: "INV-0023", date: "Feb 22, 2026", amount: 15000, status: "paid" },
      { id: "INV-0022", date: "Jan 22, 2026", amount: 15000, status: "paid" },
      { id: "INV-0021", date: "Dec 22, 2025", amount: 15000, status: "paid" },
      { id: "INV-0020", date: "Nov 22, 2025", amount: 15000, status: "paid" },
    ],
    planFeatures: {
      Professional: ["AI Virtual Try-On", "Smart Mirror Kiosk", "WhatsApp Campaigns (4/month)", "Demand Forecasting", "Customer CRM", "Staff Management", "Data Export", "Priority Support"],
      Starter: ["AI Virtual Try-On", "Sales Tablet Only", "WhatsApp Campaigns (1/month)", "Basic Analytics", "Email Support"],
      Enterprise: ["Everything in Professional", "Multiple Store Locations", "Custom Integrations", "Dedicated Account Manager", "SLA 99.9%"],
    },
  },

  // ── Notification preferences mock ──
  notifications: {
    aging: { push: true, whatsapp: true, email: false, threshold: 90, label: "Aging Stock Alerts" },
    revenue: { push: true, whatsapp: false, email: true, threshold: null, label: "Daily Revenue Summary" },
    birthday: { push: true, whatsapp: true, email: false, threshold: 3, label: "Customer Birthdays (3 days before)" },
    lowStock: { push: true, whatsapp: false, email: false, threshold: 2, label: "Low Stock Alerts" },
    campaign: { push: true, whatsapp: true, email: true, threshold: null, label: "Campaign Delivery Reports" },
    healthScore: { push: true, whatsapp: false, email: true, threshold: 70, label: "Health Score Drops Below 70" },
    weeklyReport: { push: false, whatsapp: true, email: true, threshold: null, label: "Weekly Performance Report" },
  },

  campaigns: [
    { id: "WA001", name: "Diwali Collection Preview", status: "sent", sent: 145, delivered: 138, opened: 89, clicked: 34, revenue: 125000, date: "3 days ago" },
    { id: "WA002", name: "Festival Discount Offer", status: "scheduled", sent: 0, delivered: 0, opened: 0, clicked: 0, revenue: 0, date: "Tomorrow 10 AM" },
    { id: "WA003", name: "New Arrivals Alert", status: "draft", sent: 0, delivered: 0, opened: 0, clicked: 0, revenue: 0, date: "Draft" },
  ],

  // ── Follow-up queue (RM-WA-006) ──
  followUpQueue: [
    { id: "FU001", customer: "Priya Sharma", phone: "+91 99999 11111", visitDate: "Mar 22", sessionId: "SES-2023", shortlistedSarees: ["Banarasi Georgette", "Chanderi Cotton"], status: "pending", dueIn: "Tomorrow", priority: "high", reason: "Shortlisted 2 sarees, didn't purchase — high intent customer" },
    { id: "FU002", customer: "Sunita Agarwal", phone: "+91 99999 33333", visitDate: "Mar 21", sessionId: "SES-2022", shortlistedSarees: ["Tant Cotton"], status: "pending", dueIn: "Today", priority: "medium", reason: "First-time visitor — build relationship" },
    { id: "FU003", customer: "Meena Joshi", phone: "+91 99999 55555", visitDate: "Mar 19", sessionId: "SES-2019", shortlistedSarees: ["Mysore Silk", "Kanjivaram"], status: "sent", dueIn: "Done", priority: "high", reason: "High CLV customer — was considering ₹45K saree" },
    { id: "FU004", customer: "Guest Customer", phone: null, visitDate: "Mar 22", sessionId: "SES-2024", shortlistedSarees: ["Pochampally Ikat", "Sambalpuri"], status: "pending", dueIn: "2 days", priority: "low", reason: "No CRM record — WhatsApp share sent, need follow-up call" },
  ],

  // ── Auto-trigger rules (RM-WA-004) ──
  autoTriggers: [
    { id: "AT001", name: "Post-Visit Thank You", icon: "🙏", enabled: true, timing: "2 hours after visit", template: "Birthday Wish", audience: "All CRM customers", sentThisMonth: 34, color: T.teal },
    { id: "AT002", name: "Birthday Greeting", icon: "🎂", enabled: true, timing: "Day of birthday, 9 AM", template: "Birthday Wish", audience: "Consented customers", sentThisMonth: 6, color: "#7B1FA2" },
    { id: "AT003", name: "Anniversary Reminder", icon: "💍", enabled: true, timing: "3 days before anniversary", template: "Festival Sale", audience: "Consented customers", sentThisMonth: 2, color: T.gold },
    { id: "AT004", name: "Re-engagement (45d inactive)", icon: "💌", enabled: false, timing: "After 45 days no visit", template: "Win-Back / Re-Engage", audience: "Dormant segment", sentThisMonth: 0, color: T.amber },
    { id: "AT005", name: "Post-Purchase Care Tips", icon: "🧺", enabled: true, timing: "24 hours after purchase", template: "New Arrival Alert", audience: "Recent buyers", sentThisMonth: 18, color: T.success },
    { id: "AT006", name: "Referral Nudge", icon: "🤝", enabled: false, timing: "7 days after purchase", template: "New Arrival Alert", audience: "Recent buyers", sentThisMonth: 0, color: T.accentBlue },
  ],

  // ── Basket analysis data (RM-ANA-011) ──
  basketRules: [
    { antecedent: "Kanjivaram Silk", consequent: "Matching Blouse Piece", confidence: 0.73, lift: 2.4, support: 0.18, insight: "72% of Kanjivaram buyers also ask for a matching blouse — suggest pairing during try-on." },
    { antecedent: "Banarasi Georgette", consequent: "Chanderi Cotton Silk", confidence: 0.61, lift: 1.9, support: 0.14, insight: "Festival shoppers often buy one heavy saree and one everyday saree in the same visit." },
    { antecedent: "Tant Cotton", consequent: "Pochampally Ikat", confidence: 0.58, lift: 2.1, support: 0.11, insight: "Handloom lovers tend to buy across regional traditions in one visit." },
    { antecedent: "Wedding Saree (any)", consequent: "Blouse + Accessories", confidence: 0.84, lift: 3.2, support: 0.22, insight: "84% of wedding saree buyers purchase accessories — proactively offer blouse fabric during session." },
    { antecedent: "Chanderi + Tant", consequent: "3rd purchase within 30d", confidence: 0.44, lift: 1.7, support: 0.08, insight: "Customers who buy light fabrics return within 30 days. Send a new arrivals nudge on Day 20." },
  ],

  // ── Missed demand searches (RM-ANA-008) ──
  missedDemand: [
    { query: "teal chanderi under ₹4000", count: 18, daysTracked: 30, category: "Chanderi", pricePoint: 4000, color: "#008080", available: 0, insight: "High demand, zero supply — immediate stocking opportunity" },
    { query: "pastel georgette for office", count: 14, daysTracked: 30, category: "Georgette", pricePoint: 8000, color: "#B0C4DE", available: 2, insight: "Only 2 matching sarees — needs 8–10 more SKUs" },
    { query: "lightweight wedding silk", count: 11, daysTracked: 30, category: "Silk", pricePoint: 25000, color: "#FFD700", available: 1, insight: "Growing demand for lighter bridal options — Mysore Silk fit" },
    { query: "black cotton daily wear", count: 9, daysTracked: 30, category: "Cotton", pricePoint: 3500, color: "#333333", available: 0, insight: "Zero supply — quick win, source 5–6 pieces from Tant supplier" },
    { query: "gujarati patola under ₹15000", count: 7, daysTracked: 30, category: "Patola", pricePoint: 15000, color: "#FF6B35", available: 0, insight: "Niche but consistent demand — consider stocking 2–3 pieces" },
  ],

  // ── CLV predictions (RM-CRM-006) ──
  clvPredictions: [
    { customerId: "C001", name: "Priya Sharma", currentCLV: 85000, predictedCLV12m: 138000, predictedCLV3y: 320000, tier: "High-Value", churnProbability: 0.06, nextPurchaseProbability: 0.82, recommendation: "Nurture — VIP events, exclusive previews, personalised campaign" },
    { customerId: "C004", name: "Kavitha Nair", currentCLV: 125000, predictedCLV12m: 195000, predictedCLV3y: 480000, tier: "High-Value", churnProbability: 0.04, nextPurchaseProbability: 0.91, recommendation: "Grow — referral programme, bring a friend events, loyalty rewards" },
    { customerId: "C002", name: "Deepa Mehra", currentCLV: 42000, predictedCLV12m: 62000, predictedCLV3y: 145000, tier: "Medium-Value", churnProbability: 0.38, nextPurchaseProbability: 0.61, recommendation: "Activate — re-engagement WhatsApp, personalised festival offer" },
    { customerId: "C005", name: "Meena Joshi", currentCLV: 28000, predictedCLV12m: 32000, predictedCLV3y: 58000, tier: "At-Risk", churnProbability: 0.74, nextPurchaseProbability: 0.28, recommendation: "Win-back — last attempt before marking dormant, strong discount offer" },
    { customerId: "C003", name: "Sunita Agarwal", currentCLV: 15000, predictedCLV12m: 38000, predictedCLV3y: 95000, tier: "Growing", churnProbability: 0.28, nextPurchaseProbability: 0.65, recommendation: "Develop — new customer, build loyalty with personalised experience" },
  ],

  // ── Pricing intelligence (RM-PRD-003) ──
  pricingInsights: [
    { category: "Kanjivaram Silk", band1: { range: "₹30k–40k", conv: 28 }, band2: { range: "₹40k–50k", conv: 19 }, band3: { range: "₹50k+", conv: 9 }, optimal: "₹38,000–42,000", insight: "Sharp drop above ₹45k. Sweet spot at ₹38–42k for 2x conversion vs ₹50k+." },
    { category: "Banarasi Georgette", band1: { range: "₹10k–15k", conv: 61 }, band2: { range: "₹15k–22k", conv: 44 }, band3: { range: "₹22k+", conv: 18 }, optimal: "₹14,000–18,000", insight: "Below ₹15k drives highest conversions. Festival gifting budget ceiling." },
    { category: "Chanderi Cotton", band1: { range: "₹3k–5k", conv: 58 }, band2: { range: "₹5k–8k", conv: 42 }, band3: { range: "₹8k+", conv: 22 }, optimal: "₹4,500–6,500", insight: "Office wear segment is price-sensitive. ₹4.5–6.5k is the sweet spot." },
    { category: "Tant Cotton", band1: { range: "₹2k–4k", conv: 72 }, band2: { range: "₹4k–6k", conv: 48 }, band3: { range: "₹6k+", conv: 15 }, optimal: "₹2,500–3,500", insight: "Very price-elastic. Customers expect daily wear under ₹4k." },
  ],

  // ── Footfall prediction (RM-PRD-005) ──
  footfallForecast: [
    { day: "Mon Mar 23", predicted: 12, lower: 8, upper: 16, factors: ["Weekday", "Post-weekend"] },
    { day: "Tue Mar 24", predicted: 9, lower: 6, upper: 14, factors: ["Quiet weekday"] },
    { day: "Wed Mar 25", predicted: 11, lower: 7, upper: 15, factors: ["Mid-week pickup"] },
    { day: "Thu Mar 26", predicted: 14, lower: 10, upper: 18, factors: ["Pre-weekend"] },
    { day: "Fri Mar 27", predicted: 18, lower: 13, upper: 23, factors: ["Pay day Friday", "Weekend prep"] },
    { day: "Sat Mar 28", predicted: 28, lower: 22, upper: 34, factors: ["Weekend peak", "Festival -8 days"] },
    { day: "Sun Mar 29", predicted: 22, lower: 16, upper: 28, factors: ["Weekend shopping", "Family visits"] },
  ],

  // ── Wedding season projector (RM-PRD-002) ──
  weddingSeasonData: {
    currentMonth: "March",
    peakMonths: ["November", "December", "January", "February"],
    projections: [
      { month: "Oct", revenue: 340000, bridal: 82000, target: 310000, staffNeeded: 3 },
      { month: "Nov", revenue: 680000, bridal: 310000, target: 600000, staffNeeded: 5 },
      { month: "Dec", revenue: 820000, bridal: 445000, target: 750000, staffNeeded: 6 },
      { month: "Jan", revenue: 750000, bridal: 390000, target: 700000, staffNeeded: 5 },
      { month: "Feb", revenue: 590000, bridal: 280000, target: 550000, staffNeeded: 4 },
      { month: "Mar", revenue: 340000, bridal: 95000, target: 320000, staffNeeded: 3 },
    ],
    insights: [
      "Peak bridal season is Dec–Jan. Kanjivaram and Paithani see 3x normal demand.",
      "Stock 40% more premium silk (>₹30k) from October onwards.",
      "Hire 2 additional temporary staff for November and December.",
      "Run bridal consultation sessions — dedicated slots for families.",
    ],
  },


  // ── Global search index ──
  searchIndex: [
    { type: "saree", label: "Kanjivaram Pure Silk", sub: "₹45,000 · 3 in stock", icon: "🌺", screen: "saree-detail", id: "SAR001" },
    { type: "saree", label: "Banarasi Georgette", sub: "₹18,500 · Trending", icon: "🌸", screen: "saree-detail", id: "SAR002" },
    { type: "saree", label: "Chanderi Cotton Silk", sub: "₹5,200 · 12 in stock", icon: "🪷", screen: "saree-detail", id: "SAR003" },
    { type: "saree", label: "Mysore Silk Crepe", sub: "₹22,000 · Aging 95d", icon: "🌼", screen: "saree-detail", id: "SAR004" },
    { type: "customer", label: "Priya Sharma", sub: "VIP · CLV ₹85K", icon: "👤", screen: "customer-profile", id: "C001" },
    { type: "customer", label: "Kavitha Nair", sub: "VIP · CLV ₹1.25L", icon: "👤", screen: "customer-profile", id: "C004" },
    { type: "screen", label: "Revenue Detail", sub: "Analytics → Revenue", icon: "💰", screen: "revenue" },
    { type: "screen", label: "Demand Forecasting", sub: "Analytics → AI Forecast", icon: "🤖", screen: "forecast" },
    { type: "screen", label: "Health Score", sub: "Analytics → Health", icon: "💚", screen: "health" },
    { type: "screen", label: "Reorder Suggestions", sub: "Catalogue → Reorder AI", icon: "🔄", screen: "reorder" },
    { type: "screen", label: "DPDP Consent Dashboard", sub: "Customers → DPDP", icon: "🔐", screen: "dpdp-consent" },
    { type: "screen", label: "Staff Leaderboard", sub: "Staff → Rankings", icon: "🏆", screen: "leaderboard" },
    { type: "action", label: "Add New Saree", sub: "Upload 4 photos + AI tag", icon: "📷", screen: "upload" },
    { type: "action", label: "Send WhatsApp Campaign", sub: "New campaign builder", icon: "📱", screen: "campaign-builder" },
    { type: "action", label: "Export Store Data", sub: "CSV / JSON / XLSX", icon: "📤", screen: "data-export" },
    { type: "action", label: "Photo Booth Guide", sub: "5-step photography tips", icon: "💡", screen: "photo-guide" },
    { type: "screen", label: "Follow-Up Queue", sub: "Campaigns → Customer follow-ups", icon: "⏳", screen: "follow-up-queue" },
    { type: "screen", label: "Auto Triggers", sub: "Campaigns → Automated WhatsApp", icon: "⚡", screen: "auto-triggers" },
    { type: "screen", label: "Missed Demand Intelligence", sub: "Analytics → Zero-result searches", icon: "🔍", screen: "missed-demand" },
    { type: "screen", label: "Basket Analysis", sub: "Analytics → Cross-sell patterns", icon: "🛒", screen: "basket-analysis" },
    { type: "screen", label: "CLV Predictions", sub: "Customers → Lifetime value", icon: "📈", screen: "clv-predictions" },
    { type: "screen", label: "Smart Pricing", sub: "Analytics → Price sensitivity", icon: "🏷", screen: "smart-pricing" },
    { type: "screen", label: "Footfall Prediction", sub: "Analytics → Day/week forecast", icon: "👣", screen: "footfall-prediction" },
    { type: "screen", label: "Wedding Season Projector", sub: "Forecast → Bridal season plan", icon: "💍", screen: "wedding-season" },
    { type: "screen", label: "Catalogue Readiness Score", sub: "Catalogue → Quality & completeness", icon: "📊", screen: "catalogue-readiness" },
    { type: "screen", label: "Financial Overview", sub: "Analytics → ATV + Margin tracking", icon: "💹", screen: "financial-detail" },
  ],
};

// ═══════════════════════════════════════════════════════
// AUTH CONTEXT
// ═══════════════════════════════════════════════════════
const AuthContext = createContext(null);
function useAuth() { return useContext(AuthContext); }

// ═══════════════════════════════════════════════════════
// RBAC CONTEXT  (R03=Owner R04=Manager R05=Salesperson)
// ═══════════════════════════════════════════════════════
const RBACContext = createContext({ role: "owner" });
function useRole() {
  const { role } = useContext(RBACContext);
  return {
    role,
    isOwner:   role === "owner",
    isManager: role === "manager",
    isStaff:   role === "staff",
    canViewFinancial: role === "owner",
    canManageStaff:   role === "owner",
    canEditSettings:  role === "owner",
    canViewAnalytics: role === "owner" || role === "manager",
    canManageCatalogue: role === "owner" || role === "manager" || role === "staff",
    canViewCRM:       role === "owner" || role === "manager",
    canSendCampaigns: role === "owner" || role === "manager",
    canExportData:    role === "owner",
    canDeleteCustomer: role === "owner",
    canChangeBilling: role === "owner",
    canViewStaffDetails: role === "owner" || role === "manager",
    label: role === "owner" ? "Store Owner" : role === "manager" ? "Store Manager" : "Sales Staff",
    icon:  role === "owner" ? "👑" : role === "manager" ? "🧑‍💼" : "🏪",
  };
}

// RBAC-aware wrapper — renders nothing if insufficient role
function RBACGuard({ requires, children, fallback = null }) {
  const rbac = useRole();
  const allowed = Array.isArray(requires)
    ? requires.some(r => rbac[r])
    : rbac[requires];
  if (!allowed) {
    return fallback || (
      <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: "IBM Plex Sans, sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h3 style={{ margin: "0 0 8px", color: T.navy, fontSize: 16 }}>Access Restricted</h3>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>
          This section requires {rbac.label === "Sales Staff" ? "Manager or Owner" : "Owner"} access.
        </p>
      </div>
    );
  }
  return children;
}

// ═══════════════════════════════════════════════════════
// TRANSLATIONS  (RM-ONB-005 — Phase 1: EN + HI + KN + MR)
// ═══════════════════════════════════════════════════════
const LangContext = createContext("en");
function useLang() { return useContext(LangContext); }

const STRINGS = {
  en: {
    // Auth
    welcome: "Welcome back", enterPhone: "Enter your registered mobile number",
    mobileNumber: "Mobile Number", getOTP: "Get OTP", enterOTP: "Enter OTP",
    otpSentTo: "Sent to", resendOTP: "Resend OTP", changeNumber: "← Change number",
    newStore: "New store?", registerHere: "Register here →",
    // Home
    goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening",
    storeHealth: "Store Health", todayRevenue: "Today's Revenue",
    customersServed: "Customers Served", conversionRate: "Conversion Rate",
    mirrorSessions: "Mirror Sessions", weeklyRevenue: "This Week's Revenue",
    // Inventory
    catalogue: "Catalogue", addSaree: "+ Add Saree", batchUpload: "Batch Upload",
    searchSarees: "Search sarees...", totalSKUs: "Total SKUs", digitised: "Digitised",
    aging60: "Aging 60+", inStock: "In Stock", lowStock: "Low Stock", hidden: "Hidden",
    // Upload
    addNewSaree: "Add New Saree", photos: "Photos", photoHint: "Add 2+ photos to activate AI auto-tagging",
    sareeeName: "Saree Name", priceLbl: "Price (₹)", fabricLbl: "Fabric", quantityLbl: "Quantity",
    colourLbl: "Primary Colour", saveDone: "Save & Done", saveAnother: "Save & Add Another",
    aiAutoTags: "AI Auto-Tags", analysing: "FashionCLIP · Analysing...", tagged: "✓ Tagged",
    // Customers
    customers: "Customers", searchCustomers: "Search customers...",
    all: "All", vip: "VIP", regular: "Regular", newLabel: "New", dormant: "Dormant",
    // Staff
    staffManagement: "Staff Management", addStaff: "+ Add Staff",
    conversionLabel: "Conv.", sessionsLabel: "Sessions", revenueLabel: "Revenue",
    // Settings
    settings: "Settings", storeProfile: "Store Profile", notifications: "Notifications",
    billing: "Billing & Subscription", privacy: "Privacy & DPDP",
    photoGuide: "Photo Booth Guide", exportData: "Export Data",
    support: "Support & Help", logout: "Logout from Wearify",
    replayTour: "🗺️ Replay Setup Tour", essentialMode: "Essential Mode",
    // Errors
    phoneRequired: "Mobile number is required",
    phoneInvalid: "Enter a valid 10-digit Indian mobile number",
    phoneDigitsOnly: "Mobile number must contain only digits",
    otpInvalid: "Invalid OTP. Please try again.",
    otpExpired: "OTP has expired. Please request a new one.",
    nameRequired: "Name is required",
    nameTooShort: "Name must be at least 2 characters",
    nameTooLong: "Name must be under 100 characters",
    priceRequired: "Price is required",
    priceInvalid: "Enter a valid price (₹100 – ₹5,00,000)",
    priceMin: "Minimum price is ₹100",
    priceMax: "Maximum price is ₹5,00,000",
    quantityInvalid: "Enter a valid quantity (1–9999)",
    pinRequired: "PIN is required",
    pinLength: "PIN must be 4 to 6 digits",
    pinDigitsOnly: "PIN must contain only digits",
    gstinInvalid: "GSTIN must be 15 characters (e.g. 09AAACR5055K1ZB)",
    emailInvalid: "Enter a valid email address",
    fieldRequired: "This field is required",
    saveSuccess: "Changes saved ✓",
    deleteConfirm: "Are you sure? This cannot be undone.",
    // Help
    helpPhoneNumber: "Enter your 10-digit Indian mobile number without country code. We'll send a one-time OTP to verify.",
    helpPrice: "Enter the selling price in Indian Rupees. Minimum ₹100, maximum ₹5,00,000.",
    helpGSTIN: "Your 15-character GST Identification Number. Optional — used on customer receipts and invoices.",
    helpPIN: "A 4 to 6 digit secret number for staff to log in. Keep it confidential.",
    helpCatalogue: "Your digital catalogue helps customers browse on the Smart Mirror and Sales Tablet.",
    helpHealthScore: "A score from 0–100 reflecting how well your store is using Wearify. Higher is better.",
    helpConversionRate: "Percentage of mirror sessions that resulted in a purchase. Industry average is 35–45%.",
    helpCLV: "Customer Lifetime Value — the estimated total amount a customer will spend at your store.",
    helpChurnRisk: "Probability that a customer won't return. Green = loyal, Red = at risk.",
    helpEssentialMode: "Simplified view showing only the most important metrics. Ideal for store owners who are new to digital tools.",
  },
  hi: {
    welcome: "वापस स्वागत है", enterPhone: "अपना पंजीकृत मोबाइल नंबर दर्ज करें",
    mobileNumber: "मोबाइल नंबर", getOTP: "OTP प्राप्त करें", enterOTP: "OTP दर्ज करें",
    otpSentTo: "भेजा गया", resendOTP: "OTP पुनः भेजें", changeNumber: "← नंबर बदलें",
    newStore: "नया स्टोर?", registerHere: "यहाँ रजिस्टर करें →",
    goodMorning: "सुप्रभात", goodAfternoon: "शुभ दोपहर", goodEvening: "शुभ संध्या",
    storeHealth: "स्टोर स्वास्थ्य", todayRevenue: "आज की आमदनी",
    customersServed: "आज के ग्राहक", conversionRate: "रूपांतरण दर",
    mirrorSessions: "मिरर सेशन", weeklyRevenue: "इस सप्ताह की आमदनी",
    catalogue: "कैटलॉग", addSaree: "+ साड़ी जोड़ें", batchUpload: "बल्क अपलोड",
    searchSarees: "साड़ियाँ खोजें...", totalSKUs: "कुल आइटम", digitised: "डिजिटाइज़्ड",
    aging60: "60+ दिन पुरानी", inStock: "स्टॉक में", lowStock: "कम स्टॉक", hidden: "छुपाई गई",
    addNewSaree: "नई साड़ी जोड़ें", photos: "फ़ोटो",
    photoHint: "AI ऑटो-टैगिंग के लिए 2+ फ़ोटो जोड़ें",
    sareeeName: "साड़ी का नाम", priceLbl: "कीमत (₹)", fabricLbl: "कपड़ा", quantityLbl: "मात्रा",
    colourLbl: "मुख्य रंग", saveDone: "सेव करें और समाप्त करें", saveAnother: "सेव करें और एक और जोड़ें",
    aiAutoTags: "AI ऑटो-टैग", analysing: "FashionCLIP · विश्लेषण...", tagged: "✓ टैग किया",
    customers: "ग्राहक", searchCustomers: "ग्राहक खोजें...",
    all: "सभी", vip: "वीआईपी", regular: "नियमित", newLabel: "नया", dormant: "निष्क्रिय",
    staffManagement: "स्टाफ प्रबंधन", addStaff: "+ स्टाफ जोड़ें",
    conversionLabel: "रूपा.", sessionsLabel: "सेशन", revenueLabel: "आमदनी",
    settings: "सेटिंग्स", storeProfile: "स्टोर प्रोफ़ाइल", notifications: "सूचनाएं",
    billing: "बिलिंग और सदस्यता", privacy: "गोपनीयता और DPDP",
    photoGuide: "फोटो बूथ गाइड", exportData: "डेटा निर्यात करें",
    support: "सहायता और मदद", logout: "वेअरीफाई से लॉगआउट",
    replayTour: "🗺️ सेटअप दौरा दोहराएं", essentialMode: "आवश्यक मोड",
    phoneRequired: "मोबाइल नंबर आवश्यक है",
    phoneInvalid: "10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें",
    phoneDigitsOnly: "मोबाइल नंबर केवल अंकों में होना चाहिए",
    otpInvalid: "गलत OTP। कृपया पुनः प्रयास करें।",
    otpExpired: "OTP की समय-सीमा समाप्त हो गई। कृपया नया OTP मांगें।",
    nameRequired: "नाम आवश्यक है",
    nameTooShort: "नाम कम से कम 2 अक्षर का होना चाहिए",
    nameTooLong: "नाम 100 अक्षर से कम होना चाहिए",
    priceRequired: "कीमत आवश्यक है",
    priceInvalid: "मान्य कीमत दर्ज करें (₹100 – ₹5,00,000)",
    priceMin: "न्यूनतम कीमत ₹100 है",
    priceMax: "अधिकतम कीमत ₹5,00,000 है",
    quantityInvalid: "मान्य मात्रा दर्ज करें (1–9999)",
    pinRequired: "PIN आवश्यक है",
    pinLength: "PIN 4 से 6 अंकों का होना चाहिए",
    pinDigitsOnly: "PIN केवल अंकों में होना चाहिए",
    gstinInvalid: "GSTIN 15 अक्षरों का होना चाहिए",
    emailInvalid: "मान्य ईमेल पता दर्ज करें",
    fieldRequired: "यह फ़ील्ड आवश्यक है",
    saveSuccess: "परिवर्तन सहेजे गए ✓",
    deleteConfirm: "क्या आप सुनिश्चित हैं? यह पूर्ववत नहीं किया जा सकता।",
    helpPhoneNumber: "देश कोड के बिना अपना 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें।",
    helpPrice: "भारतीय रुपये में बिक्री मूल्य दर्ज करें। न्यूनतम ₹100, अधिकतम ₹5,00,000।",
    helpGSTIN: "15 अक्षरों का GST पहचान संख्या। वैकल्पिक — ग्राहक रसीदों पर उपयोग किया जाता है।",
    helpPIN: "स्टाफ लॉगिन के लिए 4 से 6 अंकों का गुप्त नंबर।",
    helpCatalogue: "आपकी डिजिटल कैटलॉग ग्राहकों को Smart Mirror और Tablet पर ब्राउज़ करने में मदद करती है।",
    helpHealthScore: "0–100 का स्कोर जो दर्शाता है कि आपका स्टोर वेअरीफाई का कितनी अच्छी तरह उपयोग कर रहा है।",
    helpConversionRate: "मिरर सेशन का वह प्रतिशत जो खरीदारी में बदला। उद्योग औसत 35–45% है।",
    helpCLV: "ग्राहक आजीवन मूल्य — अनुमानित कुल राशि जो एक ग्राहक आपके स्टोर पर खर्च करेगा।",
    helpChurnRisk: "संभावना है कि ग्राहक वापस नहीं आएगा। हरा = वफादार, लाल = जोखिम में।",
    helpEssentialMode: "केवल सबसे महत्वपूर्ण मेट्रिक्स दिखाने वाला सरल दृश्य।",
  },
  kn: {
    welcome: "ಮರಳಿ ಸ್ವಾಗತ", enterPhone: "ನಿಮ್ಮ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ",
    mobileNumber: "ಮೊಬೈಲ್ ನಂಬರ್", getOTP: "OTP ಪಡೆಯಿರಿ", enterOTP: "OTP ನಮೂದಿಸಿ",
    otpSentTo: "ಕಳುಹಿಸಲಾಗಿದೆ", resendOTP: "OTP ಮರು ಕಳುಹಿಸಿ", changeNumber: "← ನಂಬರ್ ಬದಲಿಸಿ",
    newStore: "ಹೊಸ ಅಂಗಡಿ?", registerHere: "ಇಲ್ಲಿ ನೋಂದಣಿ ಮಾಡಿ →",
    goodMorning: "ಶುಭ ಬೆಳಗು", goodAfternoon: "ಶುಭ ಮಧ್ಯಾಹ್ನ", goodEvening: "ಶುಭ ಸಂಜೆ",
    storeHealth: "ಅಂಗಡಿ ಆರೋಗ್ಯ", todayRevenue: "ಇಂದಿನ ಆದಾಯ",
    customersServed: "ಇಂದು ಸೇವಿಸಿದ ಗ್ರಾಹಕರು", conversionRate: "ಪರಿವರ್ತನೆ ದರ",
    mirrorSessions: "ಕನ್ನಡಿ ಸೆಶನ್", weeklyRevenue: "ಈ ವಾರದ ಆದಾಯ",
    catalogue: "ಕ್ಯಾಟಲಾಗ್", addSaree: "+ ಸೀರೆ ಸೇರಿಸಿ", batchUpload: "ಬ್ಯಾಚ್ ಅಪ್‌ಲೋಡ್",
    searchSarees: "ಸೀರೆ ಹುಡುಕಿ...",
    all: "ಎಲ್ಲಾ", vip: "ವಿಐಪಿ", regular: "ನಿಯಮಿತ", newLabel: "ಹೊಸ", dormant: "ನಿಷ್ಕ್ರಿಯ",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", logout: "ಲಾಗ್‌ಔಟ್",
    phoneRequired: "ಮೊಬೈಲ್ ನಂಬರ್ ಅಗತ್ಯ", phoneInvalid: "ಮಾನ್ಯ 10 ಅಂಕಿ ಮೊಬೈಲ್ ನಂಬರ್ ನಮೂದಿಸಿ",
    priceMin: "ಕನಿಷ್ಠ ಬೆಲೆ ₹100", priceMax: "ಗರಿಷ್ಠ ಬೆಲೆ ₹5,00,000",
    pinLength: "PIN 4 ರಿಂದ 6 ಅಂಕಿಗಳಾಗಿರಬೇಕು",
    saveSuccess: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ ✓",
    fieldRequired: "ಈ ಕ್ಷೇತ್ರ ಅಗತ್ಯ", deleteConfirm: "ನೀವು ಖಚಿತವಾಗಿ ಇದ್ದೀರಾ?",
    // fill remaining with English fallback below
  },
  mr: {
    welcome: "परत स्वागत आहे", enterPhone: "आपला नोंदणीकृत मोबाइल नंबर प्रविष्ट करा",
    mobileNumber: "मोबाइल नंबर", getOTP: "OTP मिळवा", enterOTP: "OTP प्रविष्ट करा",
    otpSentTo: "पाठवले", resendOTP: "OTP पुन्हा पाठवा", changeNumber: "← नंबर बदला",
    newStore: "नवीन दुकान?", registerHere: "येथे नोंदणी करा →",
    goodMorning: "सुप्रभात", goodAfternoon: "शुभ दुपार", goodEvening: "शुभ संध्याकाळ",
    storeHealth: "दुकान आरोग्य", todayRevenue: "आजची कमाई",
    customersServed: "आजचे ग्राहक", conversionRate: "रूपांतरण दर",
    mirrorSessions: "आरसा सत्र", weeklyRevenue: "या आठवड्याची कमाई",
    catalogue: "कॅटलॉग", addSaree: "+ साडी जोडा", batchUpload: "बल्क अपलोड",
    searchSarees: "साड्या शोधा...",
    all: "सर्व", vip: "व्हीआयपी", regular: "नियमित", newLabel: "नवीन", dormant: "निष्क्रिय",
    settings: "सेटिंग्ज", logout: "लॉगआउट",
    phoneRequired: "मोबाइल नंबर आवश्यक आहे", phoneInvalid: "वैध 10 अंकी भारतीय मोबाइल नंबर प्रविष्ट करा",
    priceMin: "किमान किंमत ₹100 आहे", priceMax: "कमाल किंमत ₹5,00,000 आहे",
    pinLength: "PIN 4 ते 6 अंकी असणे आवश्यक आहे",
    saveSuccess: "बदल जतन केले ✓",
    fieldRequired: "हे फील्ड आवश्यक आहे", deleteConfirm: "तुम्हाला खात्री आहे का?",
  },
};

// Translation hook with English fallback
function t(key, lang = "en") {
  return STRINGS[lang]?.[key] || STRINGS["en"]?.[key] || key;
}

// ═══════════════════════════════════════════════════════
// VALIDATION ENGINE  (Industry-standard rules for India)
// ═══════════════════════════════════════════════════════
const VALIDATION = {
  phone: (v, lang = "en") => {
    if (!v || v.trim() === "") return t("phoneRequired", lang);
    const digits = v.replace(/\s/g, "");
    if (!/^\d+$/.test(digits)) return t("phoneDigitsOnly", lang);
    if (digits.length !== 10) return t("phoneInvalid", lang);
    if (!["6","7","8","9"].includes(digits[0])) return "Indian mobile numbers must start with 6, 7, 8, or 9";
    return null;
  },
  pin: (v, lang = "en") => {
    if (!v || v.trim() === "") return t("pinRequired", lang);
    if (!/^\d+$/.test(v)) return t("pinDigitsOnly", lang);
    if (v.length < 4 || v.length > 6) return t("pinLength", lang);
    return null;
  },
  price: (v, lang = "en") => {
    if (!v || v === "") return t("priceRequired", lang);
    const n = parseFloat(v);
    if (isNaN(n)) return t("priceInvalid", lang);
    if (n < 100) return t("priceMin", lang);
    if (n > 500000) return t("priceMax", lang);
    return null;
  },
  quantity: (v, lang = "en") => {
    const n = parseInt(v);
    if (isNaN(n) || n < 1 || n > 9999) return t("quantityInvalid", lang);
    return null;
  },
  name: (v, lang = "en") => {
    if (!v || v.trim() === "") return t("nameRequired", lang);
    if (v.trim().length < 2) return t("nameTooShort", lang);
    if (v.trim().length > 100) return t("nameTooLong", lang);
    return null;
  },
  gstin: (v) => {
    if (!v || v.trim() === "") return null; // GSTIN is optional
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (v.length !== 15 || !regex.test(v.toUpperCase())) return t("gstinInvalid");
    return null;
  },
  email: (v) => {
    if (!v || v.trim() === "") return null; // email often optional
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(v)) return t("emailInvalid");
    return null;
  },
  required: (v, lang = "en") => {
    if (!v || v.toString().trim() === "") return t("fieldRequired", lang);
    return null;
  },
};

// useValidation hook — returns { errors, validate, isValid }
function useValidation(rules) {
  const [errors, setErrors] = useState({});
  const validate = (formData) => {
    const newErrors = {};
    for (const [field, validators] of Object.entries(rules)) {
      for (const validator of [].concat(validators)) {
        const err = validator(formData[field]);
        if (err) { newErrors[field] = err; break; }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const clearError = (field) => setErrors(e => { const n = {...e}; delete n[field]; return n; });
  const isValid = Object.keys(errors).length === 0;
  return { errors, validate, clearError, isValid };
}

// ═══════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════
function formatINR(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}
function formatINRFull(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
function getGreeting(lang = "en") {
  const h = new Date().getHours();
  if (h < 12) return t("goodMorning", lang);
  if (h < 17) return t("goodAfternoon", lang);
  return t("goodEvening", lang);
}


// ═══════════════════════════════════════════════════════
// COMMON UI COMPONENTS
// ═══════════════════════════════════════════════════════
function Badge({ children, color = T.teal, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 11px", borderRadius: T.radiusPill,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
      color, backgroundColor: bg || `${color}18`,
      border: `1px solid ${color}28`,
    }}>{children}</span>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick}
      className={`rm-card-gold${onClick ? " rm-hover-lift" : ""}`}
      style={{
        backgroundColor: T.white, borderRadius: T.radius,
        border: `1px solid ${T.border}`, boxShadow: T.shadow,
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
        ...style,
      }}
    >{children}</div>
  );
}

function Button({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false, fullWidth = false }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "DM Sans, IBM Plex Sans, sans-serif", fontWeight: 600,
    borderRadius: T.radiusPill,
    transition: "opacity .15s, transform .1s, box-shadow .2s",
    opacity: disabled ? 0.45 : 1,
    padding: size === "sm" ? "8px 16px" : size === "lg" ? "14px 28px" : "11px 22px",
    fontSize: size === "sm" ? 13 : size === "lg" ? 15 : 14,
    width: fullWidth ? "100%" : undefined,
    letterSpacing: "0.2px",
  };
  const variants = {
    primary:   { background: T.gradPrimary, color: T.cream, boxShadow: "0 4px 14px rgba(10,22,40,.28)" },
    secondary: { background: T.cream, color: T.navy, border: `1px solid ${T.border}`, boxShadow: T.shadow },
    gold:      { background: T.gradGold, color: T.navy, boxShadow: "0 4px 14px rgba(201,148,26,.28)" },
    danger:    { background: "linear-gradient(135deg,#B71C1C,#C62828)", color: T.white, boxShadow: "0 4px 14px rgba(183,28,28,.28)" },
    ghost:     { background: "transparent", color: T.teal, border: `1.5px solid ${T.teal}` },
    teal:      { background: "linear-gradient(135deg,#1A4A65,#245E80)", color: T.white, boxShadow: "0 4px 14px rgba(26,74,101,.28)" },
    amber:     { background: "linear-gradient(135deg,#E65100,#F57C00)", color: T.white, boxShadow: "0 4px 14px rgba(230,81,0,.28)" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} className="rm-press"
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.86"; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
    >{children}</button>
  );
}

// ── Validated Input  ─────────────────────────────────
function Input({ label, placeholder, value, onChange, type = "text", prefix, hint, error,
  readOnly, maxLength, helpKey, required: reqFlag }) {
  const lang = useContext(LangContext);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const showError = error && (touched || error);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {label && <label style={{ fontSize: 13, fontWeight: 600, color: T.navy, fontFamily: "DM Sans, sans-serif" }}>{label}{reqFlag && <span style={{ color: T.alert, marginLeft: 2 }}>*</span>}</label>}
        {helpKey && <HelpTooltip helpKey={helpKey} />}
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && <span style={{ position: "absolute", left: 14, color: T.muted, fontSize: 15, fontWeight: 500 }}>{prefix}</span>}
        <input type={type} placeholder={placeholder} value={value} readOnly={readOnly}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTouched(true); }}
          onChange={e => onChange && onChange(e.target.value)}
          style={{
            width: "100%", padding: prefix ? "12px 14px 12px 44px" : "12px 16px",
            border: `1.5px solid ${showError ? T.alert : focused ? T.gold : T.border}`,
            borderRadius: T.radiusSm, fontSize: 15,
            fontFamily: "DM Sans, IBM Plex Sans, sans-serif",
            backgroundColor: readOnly ? T.creamDark : T.white, color: T.text, outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.18s, box-shadow 0.18s",
            boxShadow: focused ? `0 0 0 3px ${T.gold}22` : "none",
          }} />
        {maxLength && value && <span style={{ position: "absolute", right: 10, fontSize: 10, color: value.length > maxLength * 0.85 ? T.amber : T.muted }}>{value.length}/{maxLength}</span>}
      </div>
      {hint && !showError && <span style={{ fontSize: 12, color: T.muted, marginTop: 4, display: "block" }}>{hint}</span>}
      {showError && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span style={{ fontSize: 12, color: T.alert, fontWeight: 500 }}>{error}</span>
        </div>
      )}
    </div>
  );
}

// ── Select with label + help ──────────────────────────
function Select({ label, value, onChange, options, helpKey, required: reqFlag }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {label && <label style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{label}{reqFlag && <span style={{ color: T.alert, marginLeft: 2 }}>*</span>}</label>}
        {helpKey && <HelpTooltip helpKey={helpKey} />}
      </div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "12px 14px", border: `1.5px solid ${T.border}`,
          borderRadius: T.radiusSm, fontSize: 15, fontFamily: "IBM Plex Sans, sans-serif",
          backgroundColor: T.white, color: T.text, outline: "none", appearance: "auto",
        }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Help Tooltip  ─────────────────────────────────────
function HelpTooltip({ helpKey, text }) {
  const lang = useContext(LangContext);
  const [show, setShow] = useState(false);
  const helpText = text || (helpKey ? t(helpKey, lang) : "");
  if (!helpText) return null;
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button onClick={() => setShow(v => !v)}
        style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: `${T.teal}20`, border: `1px solid ${T.teal}40`, cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.teal, display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1, flexShrink: 0 }}>
        ?
      </button>
      {show && (
        <div style={{ position: "absolute", left: 24, top: -4, zIndex: 200, backgroundColor: T.navy, color: T.white, padding: "8px 12px", borderRadius: T.radiusSm, fontSize: 12, lineHeight: 1.6, width: 240, boxShadow: T.shadowMd }}>
          {helpText}
          <div style={{ position: "absolute", left: -6, top: 10, width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: `6px solid ${T.navy}` }} />
        </div>
      )}
    </div>
  );
}

// ── Confirm Dialog  ───────────────────────────────────
function ConfirmDialog({ isOpen, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel",
  confirmVariant = "danger", onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(13,27,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: 24 }}>
      <div style={{ backgroundColor: T.white, borderRadius: T.radiusLg, padding: 28, maxWidth: 380, width: "100%", boxShadow: T.shadowLg }}>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>
          {confirmVariant === "danger" ? "🗑️" : "⚠️"}
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: T.navy, textAlign: "center" }}>{title}</h3>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: T.textMid, textAlign: "center", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>{cancelLabel}</Button>
          <Button variant={confirmVariant} onClick={onConfirm} style={{ flex: 2 }}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Role Badge (shows current user's role) ───────────
function RoleBadge({ role }) {
  const colors = { owner: T.gold, manager: T.teal, staff: T.accentBlue };
  const labels = { owner: "👑 Owner", manager: "🧑‍💼 Manager", staff: "🏪 Staff" };
  return <Badge color={colors[role] || T.muted}>{labels[role] || role}</Badge>;
}

// ── Role Selector (for demo/preview switching) ───────
function RoleSwitcher({ currentRole, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "8px 16px", backgroundColor: `${T.gold}10`, borderBottom: `1px solid ${T.gold}25`, alignItems: "center" }}>
      <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Preview as:</span>
      {["owner", "manager", "staff"].map(r => (
        <button key={r} onClick={() => onChange(r)}
          style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${currentRole === r ? T.gold : T.border}`, backgroundColor: currentRole === r ? T.gold : T.white, color: currentRole === r ? T.navy : T.muted, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
          {r === "owner" ? "👑 Owner" : r === "manager" ? "🧑‍💼 Mgr" : "🏪 Staff"}
        </button>
      ))}
      <span style={{ fontSize: 11, color: T.muted, marginLeft: 4, fontStyle: "italic" }}>RBAC preview</span>
    </div>
  );
}



function Skeleton({ width = "100%", height = 16, style = {} }) {
  const [opacity, setOpacity] = useState(0.4);
  useEffect(() => {
    const t = setInterval(() => setOpacity(o => o === 0.4 ? 0.8 : 0.4), 700);
    return () => clearInterval(t);
  }, []);
  return <div style={{ width, height, borderRadius: 6, backgroundColor: T.border, opacity, transition: "opacity 0.7s", ...style }} />;
}

function ProgressBar({ value, max = 100, color = T.teal, height = 6 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: "100%", height, backgroundColor: T.creamDark, borderRadius: 99 }}>
      <div style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: 99, transition: "width 0.6s ease" }} />
    </div>
  );
}

function DeltaBadge({ value }) {
  const pos = value >= 0;
  return (
    <span style={{
      fontSize: 12, fontWeight: 700,
      color: pos ? T.success : T.alert,
      fontFamily: "DM Mono, JetBrains Mono, monospace",
      background: pos ? T.successLight : T.alertLight,
      padding: "2px 9px", borderRadius: T.radiusPill,
      border: `1px solid ${pos ? T.success : T.alert}28`,
    }}>
      {pos ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}

// Modal overlay component
function Modal({ isOpen, onClose, title, children, width = 520 }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(10,22,40,0.62)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "16px",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      animation: "rm-fadeIn .2s ease both",
    }} onClick={onClose}>
      <div className="rm-anim-slideUp" style={{
        background: T.white, borderRadius: T.radiusLg,
        width: "100%", maxWidth: width, maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 24px 80px rgba(10,22,40,.30)",
        border: `1px solid ${T.border}`,
      }} onClick={e => e.stopPropagation()}>
        {title && (
          <div style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyXL} 100%)`,
            borderRadius: `${T.radiusLg} ${T.radiusLg} 0 0`,
          }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.cream, fontFamily: "DM Sans, sans-serif" }}>{title}</h3>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
              cursor: "pointer", width: 32, height: 32, borderRadius: "50%",
              color: T.cream, fontSize: 18, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
        )}
        <div style={{ padding: "20px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// Toast notification
function Toast({ message, type = "success", visible }) {
  return (
    <div style={{
      position: "fixed", bottom: 88, left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 48}px)`,
      background: type === "success"
        ? "linear-gradient(135deg, #0A1628, #1A4A65)"
        : "linear-gradient(135deg, #B71C1C, #C62828)",
      color: T.cream, padding: "13px 26px", borderRadius: T.radiusPill,
      fontSize: 14, fontWeight: 600, zIndex: 2000,
      opacity: visible ? 1 : 0,
      transition: "all 0.32s cubic-bezier(.22,1,.36,1)",
      boxShadow: visible ? "0 8px 32px rgba(10,22,40,.30)" : "none",
      whiteSpace: "nowrap", letterSpacing: "0.2px",
      border: `1px solid rgba(255,255,255,.12)`,
    }}>{message}</div>
  );
}

// Section header with back arrow
function ScreenHeader({ title, onBack, actions }) {
  return (
    <div className="rm-anim-slideDown" style={{
      padding: "16px 22px",
      display: "flex", alignItems: "center", gap: 12,
      borderBottom: `1px solid ${T.border}`,
      background: T.white,
      position: "sticky", top: 0, zIndex: 10,
      boxShadow: "0 1px 0 rgba(201,148,26,.18)",
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: T.goldGhost, border: `1.5px solid ${T.border}`,
          cursor: "pointer", width: 36, height: 36, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.navy, fontSize: 18, transition: "background .15s",
          flexShrink: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.background = T.linen}
          onMouseLeave={e => e.currentTarget.style.background = T.goldGhost}
        >←</button>
      )}
      <h2 className="rm-serif" style={{
        margin: 0, fontSize: 20, fontWeight: 600,
        color: T.navy, flex: 1, fontStyle: "italic",
        fontFamily: "Cormorant Garamond, Georgia, serif",
      }}>{title}</h2>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SESSION 1 SCREENS (preserved from Session 1)
// ═══════════════════════════════════════════════════════

// ── Login Screen (RD-01) ──────────────────────────────
function LoginScreen({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [lang, setLang] = useState("en");
  const refs = useRef([]);

  useEffect(() => {
    if (step === "otp" && !locked) {
      const interval = setInterval(() => setTimer(s => s > 0 ? s - 1 : 0), 1000);
      return () => clearInterval(interval);
    }
  }, [step, locked]);

  useEffect(() => {
    if (locked && lockTimer > 0) {
      const interval = setInterval(() => setLockTimer(s => {
        if (s <= 1) { setLocked(false); setOtpAttempts(0); return 0; }
        return s - 1;
      }), 1000);
      return () => clearInterval(interval);
    }
  }, [locked, lockTimer]);

  const handlePhoneContinue = () => {
    const err = VALIDATION.phone(phone, lang);
    setPhoneError(err || "");
    if (!err) { setStep("otp"); setTimer(30); }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val) || locked) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setOtpError("");
    if (val && idx < 5) refs.current[idx + 1]?.focus();
    if (next.every(d => d) && next.join("").length === 6) {
      // Simulate OTP check: 123456 is valid for demo
      if (next.join("") === "123456") {
        setTimeout(() => onLogin({ phone, name: "Ramesh Agarwal", role: "owner", lang }), 300);
      } else {
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);
        if (newAttempts >= 5) {
          setLocked(true);
          setLockTimer(3600); // 1 hour in seconds (show 60 min)
          setOtpError(t("otpInvalid", lang) + " Account locked for 60 minutes after 5 failed attempts.");
        } else {
          setOtpError(`${t("otpInvalid", lang)} (${5 - newAttempts} attempts remaining)`);
        }
        setOtp(["","","","","",""]);
        setTimeout(() => refs.current[0]?.focus(), 100);
      }
    }
  };

  const formatLockTime = (s) => {
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${m}:${sec.toString().padStart(2,"0")}`;
  };

  const languages = [
    { code: "en", label: "EN", name: "English" },
    { code: "hi", label: "हि", name: "Hindi" },
    { code: "kn", label: "ಕ", name: "Kannada" },
    { code: "mr", label: "म", name: "Marathi" },
  ];

  return (
    <LangContext.Provider value={lang}>
      <div style={{ minHeight: "100vh", backgroundColor: T.cream, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "IBM Plex Sans, sans-serif", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Language picker */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 20 }}>
            {languages.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)} title={l.name}
                style={{ padding: "5px 12px", borderRadius: 16, border: `1.5px solid ${lang === l.code ? T.teal : T.border}`, backgroundColor: lang === l.code ? `${T.teal}12` : T.white, cursor: "pointer", fontSize: 13, fontWeight: lang === l.code ? 700 : 500, color: lang === l.code ? T.teal : T.muted }}>
                {l.label}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🪢</div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: T.navy }}>Wearify</h1>
            <p style={{ color: T.muted, fontSize: 13, margin: "6px 0 0" }}>Where Tradition Meets Intelligence</p>
          </div>

          <Card style={{ padding: 32 }}>
            {step === "phone" ? (
              <>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: T.navy }}>{t("welcome", lang)}</h2>
                <p style={{ margin: "0 0 24px", color: T.muted, fontSize: 14 }}>{t("enterPhone", lang)}</p>

                <Input label={t("mobileNumber", lang)} placeholder="98765 43210"
                  value={phone} onChange={v => { setPhone(v.replace(/\D/g,"").slice(0,10)); setPhoneError(""); }}
                  type="tel" prefix="+91" error={phoneError} maxLength={10}
                  helpKey="helpPhoneNumber" required />

                <div style={{ marginBottom: 16, padding: "10px 12px", backgroundColor: `${T.teal}08`, borderRadius: T.radiusSm, fontSize: 12, color: T.textMid }}>
                  📱 Enter 10-digit number without country code or spaces
                </div>

                <Button fullWidth onClick={handlePhoneContinue} disabled={phone.length < 10}>
                  {t("getOTP", lang)}
                </Button>
                <p style={{ textAlign: "center", fontSize: 13, color: T.muted, marginTop: 20 }}>
                  {t("newStore", lang)} <span style={{ color: T.teal, cursor: "pointer", fontWeight: 600 }}>{t("registerHere", lang)}</span>
                </p>
              </>
            ) : (
              <>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: T.navy }}>{t("enterOTP", lang)}</h2>
                <p style={{ margin: "0 0 4px", color: T.muted, fontSize: 14 }}>{t("otpSentTo", lang)} +91 {phone}</p>
                <p style={{ margin: "0 0 24px", fontSize: 12, color: T.teal }}>💡 Demo: use <strong>123456</strong> as OTP</p>

                {locked ? (
                  <div style={{ padding: "16px", backgroundColor: T.alertLight, borderRadius: T.radius, textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
                    <div style={{ fontWeight: 700, color: T.alert, marginBottom: 4 }}>Account Locked</div>
                    <div style={{ fontSize: 13, color: T.textMid }}>Too many failed attempts.<br />Try again in <strong style={{ fontFamily: "JetBrains Mono, monospace" }}>{formatLockTime(lockTimer)}</strong></div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                    {otp.map((d, i) => (
                      <input key={i} ref={el => refs.current[i] = el} value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) { refs.current[i-1]?.focus(); } }}
                        style={{ width: 44, height: 52, textAlign: "center", fontSize: 22, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", border: `2px solid ${otpError ? T.alert : d ? T.teal : T.border}`, borderRadius: 8, backgroundColor: d ? "#E8F4FF" : T.white, outline: "none", color: T.navy }} />
                    ))}
                  </div>
                )}

                {otpError && (
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 12, padding: "10px 12px", backgroundColor: T.alertLight, borderRadius: T.radiusSm }}>
                    <span>⚠️</span>
                    <span style={{ fontSize: 12, color: T.alert, fontWeight: 500 }}>{otpError}</span>
                  </div>
                )}

                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  {timer > 0
                    ? <span style={{ fontSize: 13, color: T.muted }}>Resend OTP in <strong style={{ fontFamily: "JetBrains Mono, monospace" }}>{timer}s</strong></span>
                    : <span style={{ color: T.teal, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
                        onClick={() => { setTimer(30); setOtpAttempts(0); setOtpError(""); }}>
                        {t("resendOTP", lang)}
                      </span>
                  }
                </div>
                <Button variant="ghost" fullWidth onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setOtpError(""); }}>
                  {t("changeNumber", lang)}
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </LangContext.Provider>
  );
}

// ── Onboarding Wizard (RD-02 to RD-06) ───────────────
function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [storeName, setStoreName] = useState("");
  const [city, setCity] = useState("");
  const steps = ["Store Profile", "Add Sarees", "Add Staff", "WhatsApp", "You're Ready!"];
  const icons = ["🏪", "👗", "👥", "💬", "🎉"];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: T.cream, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "IBM Plex Sans, sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i <= step ? T.teal : T.border, transition: "all 0.3s" }} />
          ))}
        </div>
        <Card style={{ padding: 32 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{icons[step]}</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: T.navy }}>Step {step + 1}: {steps[step]}</h2>
            <p style={{ margin: 0, color: T.muted, fontSize: 14 }}>
              {["Set up your store profile to get started.", "Add your first sarees to the digital catalogue.", "Add your sales team so they can log in.", "Connect WhatsApp to send campaigns to customers.", "Your store is ready! Let's start selling smarter."][step]}
            </p>
          </div>
          {step === 0 && (
            <>
              <Input label="Store Name" placeholder="e.g. Ramesh Silks & Sarees" value={storeName} onChange={setStoreName} />
              <Input label="City" placeholder="e.g. Varanasi" value={city} onChange={setCity} />
              <Select label="State" value="Uttar Pradesh" onChange={() => {}} options={["Uttar Pradesh","Maharashtra","Tamil Nadu","Karnataka","West Bengal","Rajasthan"].map(s => ({ value: s, label: s }))} />
            </>
          )}
          {step === 1 && (
            <div style={{ backgroundColor: T.cream, borderRadius: T.radius, padding: 20, textAlign: "center", border: `2px dashed ${T.border}` }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📷</div>
              <p style={{ color: T.textMid, fontSize: 14, margin: "0 0 16px" }}>We recommend adding 20–50 sarees to start. Use your camera to capture each saree — our AI will auto-tag it.</p>
              <Button variant="teal">Open Camera to Add Saree</Button>
            </div>
          )}
          {step === 2 && (
            <div style={{ backgroundColor: T.cream, borderRadius: T.radius, padding: 16 }}>
              <p style={{ color: T.textMid, fontSize: 13, margin: "0 0 16px" }}>Add staff names and set their 4-digit login PINs. They'll use these on the Sales Tablet and Smart Mirror.</p>
              <Button variant="ghost" fullWidth>+ Add Staff Member</Button>
            </div>
          )}
          {step === 3 && (
            <div style={{ backgroundColor: "#E8F4FD", borderRadius: T.radius, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📱</div>
              <p style={{ color: T.textMid, fontSize: 13, margin: "0 0 16px" }}>Connect your WhatsApp Business number to send campaign messages to customers.</p>
              <Button variant="teal">Connect WhatsApp Business</Button>
            </div>
          )}
          {step === 4 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {["Smart Mirror Ready ✅", "AI Tagging Active ✅", "WhatsApp Connected ✅", "Analytics Live ✅"].map((item, i) => (
                  <div key={i} style={{ backgroundColor: T.successLight, padding: "10px 14px", borderRadius: T.radiusSm, fontSize: 13, color: T.success, fontWeight: 600, textAlign: "left" }}>{item}</div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {step > 0 && <Button variant="secondary" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>Back</Button>}
            <Button onClick={() => step < 4 ? setStep(s => s + 1) : onComplete()} style={{ flex: 2 }}>
              {step === 4 ? "Go to Dashboard →" : step === 1 || step === 2 || step === 3 ? "Skip for now →" : "Continue →"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Health Score Gauge (RD-27 widget) ────────────────
function HealthScoreGauge({ score = 78, size = 160 }) {
  const r = size * 0.38, cx = size / 2, cy = size * 0.56;
  const startAngle = -200, endAngle = 20;
  const totalAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (score / 100) * totalAngle;
  const toRad = a => (a * Math.PI) / 180;
  const arcPath = (start, end, radius) => {
    const s = { x: cx + radius * Math.cos(toRad(start)), y: cy + radius * Math.sin(toRad(start)) };
    const e = { x: cx + radius * Math.cos(toRad(end)), y: cy + radius * Math.sin(toRad(end)) };
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${Math.abs(end - start) > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
  };
  const color = score >= 75 ? T.success : score >= 50 ? T.gold : T.alert;
  return (
    <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
      <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke={T.creamDark} strokeWidth={size * 0.07} strokeLinecap="round" />
      <path d={arcPath(startAngle, scoreAngle, r)} fill="none" stroke={color} strokeWidth={size * 0.07} strokeLinecap="round" />
      <text x={cx} y={cy - r * 0.05} textAnchor="middle" fill={color} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: size * 0.22, fontWeight: 700 }}>{score}</text>
      <text x={cx} y={cy + size * 0.07} textAnchor="middle" fill={T.muted} style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: size * 0.1 }}>Health Score</text>
    </svg>
  );
}

// ── Home Screen (RD-07) ───────────────────────────────
function HomeScreen({ store, kpis, onNavigate, essentialMode }) {
  const kpiItems = essentialMode
    ? [
        { label: "Today's Revenue", value: formatINR(kpis.todayRevenue), delta: kpis.todayRevenueChange, icon: "💰", color: T.success, screen: "revenue" },
        { label: "Customers Today", value: kpis.customersServed, delta: kpis.customersChange, icon: "👥", color: T.teal, screen: null },
        { label: "Catalogue Ready", value: `${store.digitisedPercent}%`, delta: null, icon: "📷", color: T.gold, screen: "inventory" },
      ]
    : [
        { label: "Today's Revenue", value: formatINR(kpis.todayRevenue), delta: kpis.todayRevenueChange, icon: "💰", color: T.success, screen: "revenue" },
        { label: "Customers Served", value: kpis.customersServed, delta: kpis.customersChange, icon: "👥", color: T.teal, screen: "customers" },
        { label: "Conversion Rate", value: `${kpis.conversionRate}%`, delta: kpis.conversionChange, icon: "🎯", color: T.gold, screen: "analytics" },
        { label: "Mirror Sessions", value: kpis.mirrorSessions, delta: kpis.sessionsChange, icon: "🪞", color: T.accentBlue, screen: "analytics" },
      ];

  return (
    <div style={{ padding: "0 0 80px", fontFamily: "IBM Plex Sans, sans-serif", backgroundColor: T.cream, minHeight: "100vh" }}>
      <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.teal} 100%)`, padding: "24px 20px 28px", color: T.white }}>
        {essentialMode && (
          <div style={{ backgroundColor: T.gold, color: T.navy, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, marginBottom: 12, display: "inline-block" }}>
            📱 Essential Mode — Tap to upgrade
          </div>
        )}
        <h2 style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 700 }}>{getGreeting()}, {store.owner.split(" ")[0]} 👋</h2>
        <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>{store.name} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p>
      </div>
      <div style={{ padding: "0 16px", marginTop: -20 }}>
        <Card style={{ padding: 20, display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <HealthScoreGauge score={store.healthScore} size={120} />
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: T.muted }}>Store Health</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Catalogue 84%", "Sessions 78%", "CRM 91%"].map((item, i) => (
                <Badge key={i} color={T.teal}>{item}</Badge>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 12, color: T.muted }}>Tap any metric to improve score</p>
          </div>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: essentialMode ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {kpiItems.map((kpi, i) => (
            <Card key={i} onClick={kpi.screen ? () => onNavigate(kpi.screen) : undefined} style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 22 }}>{kpi.icon}</span>
                {kpi.delta != null && <DeltaBadge value={kpi.delta} />}
              </div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, fontWeight: 700, color: kpi.color, margin: "8px 0 2px" }}>{kpi.value}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{kpi.label}</div>
            </Card>
          ))}
        </div>
        {!essentialMode && (
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>This Week's Revenue</span>
              <span style={{ fontSize: 12, color: T.muted }}>₹3.4L total</span>
            </div>
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart data={MOCK.revenueWeek} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.teal} stopOpacity={0.3} /><stop offset="95%" stopColor={T.teal} stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [formatINR(v), "Revenue"]} contentStyle={{ fontFamily: "IBM Plex Sans", borderRadius: 8, border: `1px solid ${T.border}` }} />
                <Area type="monotone" dataKey="revenue" stroke={T.teal} strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK.alerts.map(alert => (
            <Card key={alert.id} onClick={() => onNavigate(alert.screen)} style={{ padding: "12px 16px", backgroundColor: alert.bg, border: `1px solid ${alert.color}20` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{alert.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{alert.title}</div>
                  <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>{alert.subtitle}</div>
                </div>
                <span style={{ color: T.muted, fontSize: 18 }}>›</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Inventory List (RD-09) ────────────────────────────
function InventoryScreen({ onNavigate }) {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const sarees = MOCK.sarees.filter(s =>
    (filter === "all" || s.status === filter || (filter === "aging" && s.daysOld >= 60)) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const statusColor = { active: T.success, low_stock: T.amber, inactive: T.muted };
  const statusLabel = { active: "In Stock", low_stock: "Low Stock", inactive: "Hidden" };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "16px 20px 12px", backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>Catalogue</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="sm" variant="ghost" onClick={() => onNavigate("batch-upload")}>Batch Upload</Button>
            <Button size="sm" variant="gold" onClick={() => onNavigate("upload")}>+ Add Saree</Button>
          </div>
        </div>
        <input placeholder="🔍  Search sarees..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: `1px solid ${T.border}`, borderRadius: 20, fontSize: 14, fontFamily: "IBM Plex Sans", outline: "none", backgroundColor: T.cream, boxSizing: "border-box", marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {[["all", "All"], ["active", "In Stock"], ["low_stock", "Low Stock"], ["aging", "Aging"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", backgroundColor: filter === val ? T.navy : T.cream, color: filter === val ? T.white : T.textMid, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {["grid", "list"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14, backgroundColor: view === v ? T.navy : T.cream, color: view === v ? T.white : T.muted }}>
                {v === "grid" ? "⊞" : "☰"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          {[{ label: "Total SKUs", value: 312, color: T.navy }, { label: "Digitised", value: "84%", color: T.teal }, { label: "Aging 60+", value: 14, color: T.amber }].map((s, i) => (
            <div key={i} style={{ backgroundColor: T.white, borderRadius: T.radiusSm, padding: "10px 12px", border: `1px solid ${T.border}`, textAlign: "center" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {sarees.map(s => (
              <Card key={s.id} onClick={() => onNavigate("saree-detail", s)} style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ height: 100, backgroundColor: s.status === "low_stock" ? T.amberLight : T.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative" }}>
                  {s.emoji}
                  {s.tag && <span style={{ position: "absolute", top: 8, left: 8, backgroundColor: s.tag === "Trending" ? T.gold : s.tag === "Aging" ? T.alert : T.navy, color: T.white, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{s.tag}</span>}
                  {s.stock <= 2 && <span style={{ position: "absolute", top: 8, right: 8, backgroundColor: T.alert, color: T.white, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>Low</span>}
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.navy, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>{s.fabric}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 700, color: T.navy }}>{formatINR(s.price)}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[s.status] }}>● {statusLabel[s.status]}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sarees.map(s => (
              <Card key={s.id} onClick={() => onNavigate("saree-detail", s)} style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 48, height: 56, backgroundColor: T.cream, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{s.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{s.fabric} · Stock: {s.stock}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 700, color: T.navy }}>{formatINR(s.price)}</span>
                      <Badge color={statusColor[s.status]}>{statusLabel[s.status]}</Badge>
                      {s.daysOld >= 60 && <Badge color={T.amber}>🕐 {s.daysOld}d</Badge>}
                    </div>
                  </div>
                  <span style={{ color: T.muted, fontSize: 20 }}>›</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Aging Inventory (RD-13) ──────────────────────────
function AgingScreen({ onNavigate }) {
  const [selectedSaree, setSelectedSaree] = useState(null);
  const tierColor = { "60-90": T.gold, "90+": T.amber, "120+": T.alert };
  const tiers = [
    { label: "120+ days", color: T.alert, items: MOCK.agingSarees.filter(s => s.tier === "120+") },
    { label: "90–120 days", color: T.amber, items: MOCK.agingSarees.filter(s => s.tier === "90+") },
    { label: "60–90 days", color: T.gold, items: MOCK.agingSarees.filter(s => s.tier === "60-90") },
  ];
  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "16px 20px", backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: T.navy }}>Aging Inventory</h2>
        <p style={{ margin: 0, fontSize: 13, color: T.muted }}>14 sarees need attention · ₹8.2L at risk</p>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", gap: 10, marginBottom: 0 }}>
        {[{ label: "60–90d", count: 2, color: T.gold }, { label: "90–120d", count: 2, color: T.amber }, { label: "120d+", count: 3, color: T.alert }].map((t, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, padding: "10px", textAlign: "center" }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 700, color: t.color }}>{t.count}</div>
            <div style={{ fontSize: 11, color: T.muted }}>{t.label}</div>
          </div>
        ))}
      </div>
      {tiers.map(tier => tier.items.length > 0 && (
        <div key={tier.label} style={{ padding: "12px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 99, backgroundColor: tier.color }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: tier.color }}>{tier.label}</span>
          </div>
          {tier.items.map(s => (
            <Card key={s.id} style={{ padding: "12px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 44, height: 52, backgroundColor: `${tier.color}18`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{s.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{formatINR(s.price)} · {s.views} views · {s.tryOns} try-ons</div>
                  <div style={{ marginTop: 6 }}>
                    <ProgressBar value={Math.min(s.daysOld, 150)} max={150} color={tier.color} height={4} />
                    <span style={{ fontSize: 11, color: tier.color, fontWeight: 600 }}>{s.daysOld} days in stock</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedSaree(s)}>Action</Button>
              </div>
            </Card>
          ))}
        </div>
      ))}
      {selectedSaree && <AgingActionSheet saree={selectedSaree} onClose={() => setSelectedSaree(null)} />}
    </div>
  );
}

// ── Customers (RD-16) ────────────────────────────────
function CustomersScreen({ onNavigate }) {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("all");
  const customers = MOCK.customers.filter(c =>
    (segment === "all" || c.status.toLowerCase() === segment || (segment === "dormant" && c.churnRisk === "high")) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const segmentColor = { VIP: T.gold, Regular: T.teal, New: T.success };
  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "16px 20px 12px", backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>Customers</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="sm" variant="ghost" onClick={() => onNavigate("segment-builder")}>🎯 Segments</Button>
            <Button size="sm" variant="ghost" onClick={() => onNavigate("dpdp-consent")}>🔐 DPDP</Button>
          </div>
        </div>
        <input placeholder="🔍  Search customers..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: `1px solid ${T.border}`, borderRadius: 20, fontSize: 14, fontFamily: "IBM Plex Sans", outline: "none", backgroundColor: T.cream, boxSizing: "border-box", marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {[["all", "All"], ["vip", "VIP"], ["regular", "Regular"], ["new", "New"], ["dormant", "Dormant"]].map(([val, label]) => (
            <button key={val} onClick={() => setSegment(val)}
              style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, backgroundColor: segment === val ? T.navy : T.cream, color: segment === val ? T.white : T.textMid, transition: "all 0.15s", whiteSpace: "nowrap" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {customers.map(c => (
          <Card key={c.id} onClick={() => onNavigate("customer-profile", c)} style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${segmentColor[c.status] || T.teal}22`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: segmentColor[c.status] || T.teal }}>
                {c.initials || c.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: T.navy }}>{c.name}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{c.segment} · Last: {c.lastVisit}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  {c.churnRisk === "high" && <Badge color={T.alert}>🔴 At Risk</Badge>}
                  {c.whatsappOptIn && <Badge color={T.success}>💬</Badge>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: T.navy, fontSize: 14 }}>{formatINR(c.clv)}</div>
                <Badge color={segmentColor[c.status] || T.teal}>{c.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Campaigns (RD-19) ─────────────────────────────────
function CampaignsScreen({ onNavigate }) {
  const statusStyle = { sent: { color: T.success, bg: T.successLight, label: "Sent" }, scheduled: { color: T.teal, bg: "#E3F2FD", label: "Scheduled" }, draft: { color: T.muted, bg: T.cream, label: "Draft" } };
  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "16px 20px 12px", backgroundColor: T.white, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>WhatsApp Campaigns</h2>
        <Button size="sm" variant="gold" onClick={() => onNavigate("campaign-builder")}>+ New Campaign</Button>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {MOCK.campaigns.map(c => {
          const s = statusStyle[c.status];
          return (
            <Card key={c.id} onClick={() => onNavigate("campaign-detail", c)} style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{c.date}</div>
                </div>
                <Badge color={s.color} bg={s.bg}>{s.label}</Badge>
              </div>
              {c.status === "sent" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[["Sent", c.sent], ["Delivered", c.delivered], ["Opened", c.opened], ["Clicked", c.clicked]].map(([label, val]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: T.navy }}>{val}</div>
                      <div style={{ fontSize: 10, color: T.muted }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
              {c.revenue > 0 && <div style={{ marginTop: 8, fontSize: 12, color: T.success, fontWeight: 600 }}>💰 Revenue attributed: {formatINR(c.revenue)}</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Analytics (RD-22) ─────────────────────────────────
function AnalyticsScreen({ onNavigate }) {
  const categoryData = [
    { name: "Kanjivaram", revenue: 180000 }, { name: "Banarasi", revenue: 142000 },
    { name: "Chanderi", revenue: 88000 }, { name: "Tant", revenue: 62000 }, { name: "Pochampally", revenue: 54000 },
  ];
  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "16px 20px 12px", backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>Analytics</h2>
      </div>
      <div style={{ padding: "12px 16px" }}>
        {/* Quick links to detail screens */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Revenue Detail", icon: "💰", screen: "revenue", color: T.success, sub: "Day/week/month breakdown" },
            { label: "Category Report", icon: "🗂", screen: "category-perf", color: T.teal, sub: "Heatmap + rankings" },
            { label: "Health Score", icon: "💚", screen: "health", color: T.gold, sub: "6-dimension composite" },
            { label: "AI Forecast", icon: "🤖", screen: "forecast", color: T.accentBlue, sub: "Chronos-2 · 30/60/90d" },
            { label: "Dead Stock", icon: "📉", screen: "dead-stock", color: T.alert, sub: "Aging curve + triggers" },
            { label: "Session Attribution", icon: "🔗", screen: "session-attribution", color: T.teal, sub: "Session → Sale proof" },
            { label: "Tried vs Sold vs Shared", icon: "🔀", screen: "tried-sold-shared", color: "#7B1FA2", sub: "Cross-reference analysis" },
            { label: "Staff Leaderboard", icon: "🏆", screen: "leaderboard", color: T.navy, sub: "Per-staff performance" },
            { label: "Missed Demand", icon: "🔍", screen: "missed-demand", color: T.amber, sub: "Zero-result searches" },
            { label: "Basket Analysis", icon: "🛒", screen: "basket-analysis", color: "#25D366", sub: "Cross-sell patterns" },
            { label: "Smart Pricing", icon: "🏷", screen: "smart-pricing", color: T.gold, sub: "Price sensitivity" },
            { label: "Footfall Prediction", icon: "👣", screen: "footfall-prediction", color: T.accentBlue, sub: "Daily/weekly forecast" },
            { label: "Financial Overview", icon: "💹", screen: "financial-detail", color: T.navy, sub: "ATV + margin tracking" },
          ].map((item, i) => (
            <Card key={i} onClick={() => onNavigate(item.screen)} style={{ padding: "14px 12px" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{item.sub}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: item.color, fontWeight: 600 }}>View →</div>
            </Card>
          ))}
        </div>

        {/* Snapshot KPIs */}
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>This Month Snapshot</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[{ label: "Revenue", value: "₹3.4L", icon: "💰", color: T.success }, { label: "Avg Basket", value: "₹8,083", icon: "🛍️", color: T.teal }, { label: "Try-On Conv.", value: "54.5%", icon: "🪞", color: T.gold }, { label: "Footfall", value: "312", icon: "👣", color: T.accentBlue }].map((k, i) => (
              <Card key={i} style={{ padding: 12 }}>
                <span style={{ fontSize: 18 }}>{k.icon}</span>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 18, fontWeight: 700, color: k.color, margin: "6px 0 2px" }}>{k.value}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{k.label}</div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Revenue by Category quick chart */}
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>Revenue by Category</h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate("category-perf")}>Full →</Button>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: T.muted }} tickFormatter={v => formatINR(v)} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: T.navy }} axisLine={false} tickLine={false} width={75} />
              <Tooltip formatter={v => [formatINR(v), "Revenue"]} contentStyle={{ fontFamily: "IBM Plex Sans", borderRadius: 8 }} />
              <Bar dataKey="revenue" fill={T.teal} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 14, background: `linear-gradient(135deg, ${T.navy}08, ${T.teal}12)`, border: `1px solid ${T.teal}30` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, marginBottom: 6 }}>AI Insight</div>
              <p style={{ margin: 0, fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>Georgette fabrics are trending this week with +34% demand. Consider restocking before Navratri (Oct 3). Customers who tried Banarasi Georgette converted 67% of the time.</p>
              <Button size="sm" variant="ghost" style={{ marginTop: 10 }} onClick={() => onNavigate("forecast")}>See full forecast →</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Staff (RD-28) ─────────────────────────────────────
function StaffScreen({ onNavigate }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [staffList, setStaffList] = useState(MOCK.staff);

  const handleAddStaff = (newStaff) => {
    const newMember = {
      id: `ST00${staffList.length + 1}`,
      name: newStaff.name,
      role: newStaff.role === "manager" ? "Store Manager" : "Sales Staff",
      conversions: 0, sessions: 0, pin: newStaff.pin, shift: newStaff.shift,
      joined: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      phone: "+91 " + newStaff.phone, revenue: 0, upsellRate: 0,
      avgSessionTime: "—", absentDays: 0, shiftHistory: [],
      coachingNotes: "New staff member — no coaching notes yet.",
      badges: [], weeklyRevenue: [0,0,0,0,0,0,0], rank: staffList.length + 1,
    };
    setStaffList(prev => [...prev, newMember]);
  };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "16px 20px 12px", backgroundColor: T.white, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>Staff Management</h2>
        <RBACGuard requires="canManageStaff" fallback={
          <span style={{ fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 4 }}>🔒 Owner only</span>
        }>
          <Button size="sm" variant="teal" onClick={() => setShowAddModal(true)}>+ Add Staff</Button>
        </RBACGuard>
      </div>

      {/* Staff count + plan limit note */}
      <div style={{ padding: "8px 20px", backgroundColor: T.cream, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted }}>
        <span>{staffList.length} staff member{staffList.length !== 1 ? "s" : ""} on this plan</span>
        <span>Professional plan allows up to 10 staff</span>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {staffList.map(s => {
          const rate = s.sessions > 0 ? ((s.conversions / s.sessions) * 100).toFixed(0) : 0;
          const rankColor = s.conversions >= 10 ? T.gold : s.conversions >= 7 ? T.teal : T.muted;
          return (
            <Card key={s.id} onClick={() => onNavigate("staff-detail", s)} style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${rankColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: rankColor, border: `2px solid ${rankColor}40` }}>{s.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{s.role} · {s.shift} Shift</div>
                  {s.badges && s.badges.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      {s.badges.slice(0, 2).map((b, bi) => <Badge key={bi} color={T.gold}>{b}</Badge>)}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: T.success, fontSize: 16 }}>{rate}%</div>
                  <div style={{ fontSize: 11, color: T.muted }}>Conv.</div>
                </div>
                <span style={{ color: T.muted, fontSize: 20 }}>›</span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                {[{ label: "Sessions", value: s.sessions }, { label: "Sales", value: s.conversions }, { label: "Revenue", value: formatINR(s.revenue) }].map((m, i) => (
                  <div key={i} style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: T.navy, fontSize: 14 }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <AddStaffModal isOpen={showAddModal} staffToEdit={null}
        onClose={() => setShowAddModal(false)} onSave={handleAddStaff} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SESSION 2 — NEW SCREENS
// ═══════════════════════════════════════════════════════

// ── AI Auto-Tag Badge (FashionCLIP output) ───────────
function AITagBadge({ tag, processing }) {
  const [pulse, setPulse] = useState(processing);
  useEffect(() => { setPulse(processing); }, [processing]);
  if (processing) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 16, backgroundColor: `${T.gold}22`, border: `1px dashed ${T.gold}`, fontSize: 12, fontWeight: 600, color: T.amber }}>
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, backgroundColor: T.gold, animation: "none", opacity: pulse ? 1 : 0.3 }}>●</span>
        {tag}
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 16, backgroundColor: `${T.teal}14`, border: `1px solid ${T.teal}30`, fontSize: 12, fontWeight: 600, color: T.teal, cursor: "default" }}>
      {tag}
    </span>
  );
}

// ── Photo Upload Slot ─────────────────────────────────
function PhotoSlot({ label, hasPhoto, onAdd, emoji }) {
  return (
    <div onClick={onAdd} style={{ flex: 1, minWidth: 70, height: 88, border: `2px dashed ${hasPhoto ? T.teal : T.border}`, borderRadius: T.radius, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundColor: hasPhoto ? `${T.teal}0A` : T.cream, gap: 4, transition: "all 0.2s", position: "relative" }}>
      {hasPhoto ? (
        <>
          <span style={{ fontSize: 32 }}>{emoji}</span>
          <div style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: T.success, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: T.white, fontSize: 10, fontWeight: 700 }}>✓</span>
          </div>
        </>
      ) : (
        <>
          <span style={{ fontSize: 20, color: T.muted }}>📷</span>
          <span style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>+</span>
        </>
      )}
      <span style={{ fontSize: 10, color: hasPhoto ? T.teal : T.muted, fontWeight: 600, textAlign: "center" }}>{label}</span>
    </div>
  );
}

// ── Saree Upload Screen (RD-10) ───────────────────────
function SareeUploadScreen({ onNavigate }) {
  const lang = useContext(LangContext);
  const rbac = useRole();
  const [photos, setPhotos] = useState({ front: false, back: false, pallu: false, border: false });
  const [form, setForm] = useState({ name: "", price: "", fabric: "Silk", color: "Red", quantity: "1" });
  const [aiPhase, setAiPhase] = useState("idle");
  const [aiTags, setAiTags] = useState([]);
  const [mode, setMode] = useState("single");
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [errors, setErrors] = useState({});
  const [photoQuality, setPhotoQuality] = useState({}); // slot → "good"|"blur"|"dark"

  const photoCount = Object.values(photos).filter(Boolean).length;

  // Image quality simulation
  const simulateQualityCheck = (slot) => {
    // Random quality outcome for demo
    const outcomes = ["good", "good", "good", "blur", "dark"];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  };

  const simulateAITagging = () => {
    setAiPhase("processing");
    setTimeout(() => {
      setAiTags(["Silk", "Heavy Weight", "Wedding", "Zari Work", "South Indian", "Bridal", "Traditional"]);
      setAiPhase("done");
    }, 2800);
  };

  const handlePhotoAdd = (slot) => {
    const quality = simulateQualityCheck(slot);
    const newPhotos = { ...photos, [slot]: true };
    const newQuality = { ...photoQuality, [slot]: quality };
    setPhotos(newPhotos);
    setPhotoQuality(newQuality);
    if (quality === "good") {
      const count = Object.values(newPhotos).filter(Boolean).length;
      if (count >= 2 && aiPhase === "idle") simulateAITagging();
    }
  };

  const removeTag = (tag) => setAiTags(prev => prev.filter(t2 => t2 !== tag));

  const showToast = (msg, type = "success") => {
    setToast({ visible: true, message: msg, type });
    setTimeout(() => setToast({ visible: false, message: "" }), 2200);
  };

  const validate = () => {
    const errs = {};
    const nameErr = VALIDATION.name(form.name, lang);
    if (nameErr) errs.name = nameErr;
    const priceErr = VALIDATION.price(form.price, lang);
    if (priceErr) errs.price = priceErr;
    const qtyErr = VALIDATION.quantity(form.quantity, lang);
    if (qtyErr) errs.quantity = qtyErr;
    if (photoCount < 1) errs.photos = "Please add at least 1 photo before saving";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (addAnother) => {
    if (!validate()) return;
    showToast(`${form.name} added to catalogue ✓`);
    if (addAnother) {
      setPhotos({ front: false, back: false, pallu: false, border: false });
      setForm({ name: "", price: "", fabric: "Silk", color: "Red", quantity: "1" });
      setAiPhase("idle"); setAiTags([]); setErrors({}); setPhotoQuality({});
    } else {
      setTimeout(() => onNavigate("inventory"), 800);
    }
  };

  if (!rbac.canManageCatalogue) return <RBACGuard requires="canManageCatalogue"><></></RBACGuard>;
  if (mode === "batch") return <BatchUploadScreen onNavigate={onNavigate} />;

  const qualityIcons = { good: "✅", blur: "🔲", dark: "🌑" };
  const qualityMessages = { good: "Good quality", blur: "Photo is blurry — try holding camera steady", dark: "Too dark — move to better lighting" };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title={t("addNewSaree", lang)} onBack={() => onNavigate("inventory")}
        actions={<Button size="sm" variant="ghost" onClick={() => setMode("batch")}>{t("batchUpload", lang)}</Button>} />

      <div style={{ padding: "16px" }}>
        {/* Photo slots with quality feedback */}
        <Card style={{ padding: 16, marginBottom: 16, border: errors.photos ? `2px solid ${T.alert}` : undefined }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{t("photos", lang)} <span style={{ color: T.alert }}>*</span></span>
            <span style={{ fontSize: 12, color: photoCount >= 2 ? T.success : T.muted, fontWeight: 600 }}>{photoCount}/4 added</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["front", "Front", "👗"], ["back", "Back", "🔄"], ["pallu", "Pallu", "✨"], ["border", "Border", "🌺"]].map(([slot, label, emoji]) => (
              <div key={slot} style={{ flex: 1 }}>
                <PhotoSlot label={label} hasPhoto={photos[slot]} onAdd={() => handlePhotoAdd(slot)} emoji={emoji} />
                {photos[slot] && photoQuality[slot] && (
                  <div style={{ marginTop: 4, textAlign: "center" }}>
                    <span style={{ fontSize: 14 }}>{qualityIcons[photoQuality[slot]]}</span>
                    {photoQuality[slot] !== "good" && (
                      <div style={{ fontSize: 9, color: T.alert, lineHeight: 1.3, marginTop: 2 }}>
                        {qualityMessages[photoQuality[slot]]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {errors.photos && (
            <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
              <span>⚠️</span><span style={{ fontSize: 12, color: T.alert }}>{errors.photos}</span>
            </div>
          )}
          {photoCount < 2 && (
            <p style={{ margin: "10px 0 0", fontSize: 12, color: T.muted, textAlign: "center" }}>
              📷 {t("photoHint", lang)}
            </p>
          )}
        </Card>

        {/* Basic details */}
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: T.navy }}>Basic Details</h3>
          <Input label={t("sareeeName", lang)} placeholder="e.g. Kanjivaram Bridal Silk"
            value={form.name} onChange={v => { setForm(f => ({ ...f, name: v })); setErrors(e => ({...e, name: undefined})); }}
            error={errors.name} maxLength={100} helpKey="helpCatalogue" required />
          <Input label={t("priceLbl", lang)} placeholder="e.g. 12500"
            value={form.price} onChange={v => { setForm(f => ({ ...f, price: v.replace(/[^\d]/g,"") })); setErrors(e => ({...e, price: undefined})); }}
            type="text" prefix="₹" error={errors.price} helpKey="helpPrice" required />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label={t("fabricLbl", lang)} value={form.fabric} onChange={v => setForm(f => ({ ...f, fabric: v }))}
              options={["Silk","Pure Silk","Cotton","Georgette","Crepe","Chiffon","Linen","Cotton-Silk","Organza","Tissue"].map(s => ({ value: s, label: s }))} />
            <Input label={t("quantityLbl", lang)} placeholder="1"
              value={form.quantity} onChange={v => { setForm(f => ({ ...f, quantity: v.replace(/[^\d]/g,"") })); setErrors(e => ({...e, quantity: undefined})); }}
              type="text" error={errors.quantity} />
          </div>
          <Select label={t("colourLbl", lang)} value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))}
            options={["Red","Maroon","Blue","Navy Blue","Green","Yellow","Pink","Purple","Gold","Orange","White","Black","Teal","Cream","Peach","Pastel Pink","Pastel Green"].map(c => ({ value: c, label: c }))} />
        </Card>

        {/* AI Auto-Tags */}
        {aiPhase !== "idle" && (
          <Card style={{ padding: 16, marginBottom: 16, border: `1px solid ${T.gold}40` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{t("aiAutoTags", lang)}</span>
              {aiPhase === "processing" && <Badge color={T.amber}>{t("analysing", lang)}</Badge>}
              {aiPhase === "done" && <Badge color={T.success}>{t("tagged", lang)}</Badge>}
            </div>
            {aiPhase === "processing" ? (
              <div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {["Detecting weave...", "Identifying region...", "Classifying occasion...", "Estimating weight..."].map((txt, i) => (
                    <AITagBadge key={i} tag={txt} processing />
                  ))}
                </div>
                <ProgressBar value={65} color={T.gold} />
                <span style={{ fontSize: 12, color: T.muted }}>3–5 seconds · FashionCLIP model</span>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {aiTags.map((tag, i) => (
                    <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <AITagBadge tag={tag} processing={false} />
                      <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.muted, lineHeight: 1, padding: "0 2px" }}>×</button>
                    </div>
                  ))}
                  <button style={{ padding: "4px 10px", borderRadius: 16, border: `1px dashed ${T.border}`, background: "none", cursor: "pointer", fontSize: 12, color: T.muted }}>+ Add tag</button>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: T.muted }}>Tap × to remove incorrect tags. These improve Smart Mirror search.</p>
              </>
            )}
          </Card>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Button fullWidth variant="primary" onClick={() => handleSave(false)}>{t("saveDone", lang)}</Button>
          <Button fullWidth variant="ghost" onClick={() => handleSave(true)}>{t("saveAnother", lang)}</Button>
        </div>
      </div>
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />
    </div>
  );
}

// ── Batch Upload Screen (RM-CAT-002) ─────────────────
function BatchUploadScreen({ onNavigate }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([
    { id: 1, name: "IMG_3421.jpg", progress: 100, status: "tagged", tags: ["Banarasi", "Silk", "Wedding"] },
    { id: 2, name: "IMG_3422.jpg", progress: 100, status: "tagged", tags: ["Chanderi", "Cotton", "Casual"] },
    { id: 3, name: "IMG_3423.jpg", progress: 72, status: "uploading", tags: [] },
    { id: 4, name: "IMG_3424.jpg", progress: 0, status: "queued", tags: [] },
    { id: 5, name: "IMG_3425.jpg", progress: 0, status: "queued", tags: [] },
  ]);

  const statusConfig = { tagged: { color: T.success, label: "AI Tagged ✓", bg: T.successLight }, uploading: { color: T.accentBlue, label: "Uploading…", bg: "#E3F2FD" }, queued: { color: T.muted, label: "Queued", bg: T.cream } };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
  };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="Batch Upload" onBack={() => onNavigate("inventory")} />

      <div style={{ padding: 16 }}>
        {/* Drop zone */}
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
          style={{ border: `2px dashed ${dragOver ? T.teal : T.border}`, borderRadius: T.radiusLg, padding: "32px 20px", textAlign: "center", backgroundColor: dragOver ? `${T.teal}08` : T.white, transition: "all 0.2s", marginBottom: 16, cursor: "pointer" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
          <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: T.navy }}>Drag & drop photos here</h3>
          <p style={{ margin: "0 0 16px", color: T.muted, fontSize: 13 }}>Upload multiple JPG/PNG files at once · Max 100 sarees per batch</p>
          <Button variant="teal">Choose Files</Button>
          <p style={{ margin: "12px 0 0", fontSize: 12, color: T.muted }}>AI will auto-tag each saree with FashionCLIP · Estimated 3–5 sec per photo</p>
        </div>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          {[{ label: "Total", value: 5, color: T.navy }, { label: "AI Tagged", value: 2, color: T.success }, { label: "Queued", value: 2, color: T.muted }].map((s, i) => (
            <div key={i} style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, padding: "10px", textAlign: "center" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 18, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upload queue */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>Upload Queue</span>
            <span style={{ fontSize: 12, color: T.muted }}>2 of 5 complete</span>
          </div>
          {uploadQueue.map((item, i) => {
            const s = statusConfig[item.status];
            return (
              <div key={item.id} style={{ padding: "12px 16px", borderBottom: i < uploadQueue.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {item.status === "tagged" ? "✅" : item.status === "uploading" ? "⏳" : "🕐"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: T.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  {item.status === "uploading" && <ProgressBar value={item.progress} color={T.accentBlue} height={4} />}
                  {item.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      {item.tags.map((t, ti) => <AITagBadge key={ti} tag={t} processing={false} />)}
                    </div>
                  )}
                </div>
                <Badge color={s.color} bg={s.bg}>{s.label}</Badge>
              </div>
            );
          })}
        </Card>

        <div style={{ marginTop: 16 }}>
          <Button fullWidth variant="primary" onClick={() => onNavigate("inventory")}>Save All Tagged Sarees</Button>
        </div>
      </div>
    </div>
  );
}

// ── Saree Detail View (RD-12) ─────────────────────────
function SareeDetailScreen({ saree, onNavigate }) {
  const s = saree || MOCK.sarees[0];
  const [activePhoto, setActivePhoto] = useState(0);
  const convRate = s.sessions > 0 ? ((s.conversions / s.sessions) * 100).toFixed(0) : 0;
  const tryOnRate = s.sessions > 0 ? ((s.tryOns / s.sessions) * 100).toFixed(0) : 0;
  const photos = ["Front View", "Back View", "Pallu Detail", "Border Detail"];

  const performanceData = [
    { day: "Mon", views: 14 }, { day: "Tue", views: 18 }, { day: "Wed", views: 9 },
    { day: "Thu", views: 22 }, { day: "Fri", views: 31 }, { day: "Sat", views: 28 }, { day: "Sun", views: 19 },
  ];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="Saree Details" onBack={() => onNavigate("inventory")}
        actions={<Button size="sm" variant="ghost" onClick={() => onNavigate("saree-edit", s)}>Edit</Button>} />

      {/* Image gallery */}
      <div style={{ backgroundColor: T.white }}>
        <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: s.daysOld >= 60 ? T.amberLight : `${T.teal}0A`, position: "relative", fontSize: 100 }}>
          {s.emoji}
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
            {s.tag && <Badge color={s.tag === "Trending" ? T.gold : s.tag === "Aging" ? T.alert : T.navy}>{s.tag}</Badge>}
            <Badge color={s.daysOld >= 90 ? T.alert : s.daysOld >= 60 ? T.amber : T.success}>
              {s.daysOld >= 60 ? `⚠️ ${s.daysOld}d old` : "✓ Fresh Stock"}
            </Badge>
          </div>
          {s.status === "low_stock" && (
            <div style={{ position: "absolute", bottom: 12, right: 12, backgroundColor: T.alert, color: T.white, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Low Stock: {s.stock} left</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, padding: "10px 16px", overflowX: "auto" }}>
          {photos.map((p, i) => (
            <button key={i} onClick={() => setActivePhoto(i)}
              style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${activePhoto === i ? T.teal : T.border}`, cursor: "pointer", fontSize: 12, fontWeight: 600, backgroundColor: activePhoto === i ? `${T.teal}12` : T.white, color: activePhoto === i ? T.teal : T.muted, whiteSpace: "nowrap", transition: "all 0.15s" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Core info */}
        <Card style={{ padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: T.navy }}>{s.name}</h2>
              <p style={{ margin: 0, fontSize: 13, color: T.muted }}>{s.fabric} · {s.region} · SKU: {s.id}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 22, fontWeight: 800, color: T.success }}>{formatINRFull(s.price)}</div>
              {s.mrp > s.price && <div style={{ fontSize: 12, color: T.muted, textDecoration: "line-through" }}>MRP {formatINRFull(s.mrp)}</div>}
            </div>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{s.description}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["Colour", s.colorName], ["Occasion", s.occasion], ["Weave", s.weave], ["Weight", s.weight]].map(([k, v]) => (
              <div key={k} style={{ padding: "4px 12px", backgroundColor: T.cream, borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 11, color: T.muted }}>{k}: </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance metrics */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>📊 Performance This Month</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Views", value: s.views, color: T.navy, icon: "👁" },
              { label: "Sessions", value: s.sessions, color: T.teal, icon: "🪞" },
              { label: "Try-Ons", value: s.tryOns, color: T.gold, icon: "✨" },
              { label: "Sales", value: s.conversions, color: T.success, icon: "💰" },
            ].map((m, i) => (
              <div key={i} style={{ textAlign: "center", padding: "10px 4px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 18, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div style={{ padding: "10px 12px", backgroundColor: `${T.teal}0A`, borderRadius: T.radiusSm, border: `1px solid ${T.teal}20` }}>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Try-On Rate</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 18, color: T.teal }}>{tryOnRate}%</div>
              <ProgressBar value={tryOnRate} color={T.teal} height={4} />
            </div>
            <div style={{ padding: "10px 12px", backgroundColor: `${T.success}0A`, borderRadius: T.radiusSm, border: `1px solid ${T.success}20` }}>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Conversion Rate</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 18, color: T.success }}>{convRate}%</div>
              <ProgressBar value={convRate} color={T.success} height={4} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={performanceData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <Bar dataKey="views" fill={`${T.teal}80`} radius={[3, 3, 0, 0]} />
              <Tooltip formatter={v => [v, "Views"]} contentStyle={{ fontFamily: "IBM Plex Sans", borderRadius: 8, fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: T.muted, textAlign: "center" }}>Daily views — last 7 days</p>
        </Card>

        {/* AI Tags */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>🤖</span>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>AI Tags</h3>
            </div>
            <button onClick={() => onNavigate("saree-edit", s)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 12, color: T.teal, fontWeight: 600 }}>Edit tags</button>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {s.aiTags.map((tag, i) => <AITagBadge key={i} tag={tag} processing={false} />)}
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: T.muted }}>These tags improve AI search results and recommendations on the Smart Mirror.</p>
        </Card>

        {/* Festival demand signal */}
        <Card style={{ padding: 14, marginBottom: 14, backgroundColor: s.reorderScore >= 8 ? `${T.gold}12` : T.white, border: `1px solid ${s.reorderScore >= 8 ? T.gold : T.border}40` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 24 }}>{s.reorderScore >= 8 ? "🔥" : s.reorderScore >= 5 ? "📈" : "📉"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>Demand Signal</div>
              <div style={{ fontSize: 13, color: T.textMid, marginTop: 2 }}>{s.festivalDemand}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 22, color: s.reorderScore >= 8 ? T.gold : s.reorderScore >= 5 ? T.teal : T.muted }}>{s.reorderScore}</div>
              <div style={{ fontSize: 10, color: T.muted }}>Reorder Score</div>
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Button variant="teal" onClick={() => onNavigate("saree-edit", s)} fullWidth>✏️ Edit Details</Button>
          <Button variant="secondary" onClick={() => {
            const msg = encodeURIComponent(`Check out this beautiful ${s.name} from ${MOCK.store.name}! Price: ${formatINRFull(s.price)}. Visit us at Ramesh Silks, Varanasi.`);
            window.open(`https://wa.me/?text=${msg}`, "_blank");
          }} fullWidth>📤 Share on WhatsApp</Button>
          <Button variant="ghost" fullWidth style={{ marginTop: 8 }} onClick={() => onNavigate("ai-description", s)}>
            ✨ Generate AI Description
          </Button>
        </div>
        {s.daysOld >= 60 && (
          <Button variant="amber" fullWidth style={{ marginTop: 10 }} onClick={() => onNavigate("aging")}>⚠️ View Aging Actions</Button>
        )}
      </div>
    </div>
  );
}

// ── Saree Edit Screen (RD-11) ─────────────────────────
function SareeEditScreen({ saree, onNavigate }) {
  const s = saree || MOCK.sarees[0];
  const [form, setForm] = useState({
    name: s.name,
    price: String(s.price),
    mrp: String(s.mrp || ""),
    fabric: s.fabric,
    colorName: s.colorName,
    region: s.region,
    occasion: s.occasion,
    weave: s.weave,
    weight: s.weight,
    quantity: String(s.stock),
    description: s.description,
    status: s.status,
  });
  const [tags, setTags] = useState([...s.aiTags]);
  const [newTag, setNewTag] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [hasChanges, setHasChanges] = useState(false);

  const update = (key, val) => { setForm(f => ({ ...f, [key]: val })); setHasChanges(true); };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag(""); setHasChanges(true);
    }
  };

  const handleSave = () => {
    setToast({ visible: true, message: "Changes saved ✓" });
    setHasChanges(false);
    setTimeout(() => { setToast({ visible: false, message: "" }); onNavigate("saree-detail", saree); }, 1600);
  };

  const statusOptions = [
    { value: "active", label: "✅ Active — visible in catalogue" },
    { value: "low_stock", label: "⚠️ Low Stock — still visible" },
    { value: "inactive", label: "🚫 Hidden — not visible to customers" },
    { value: "sold_out", label: "❌ Sold Out — auto-hides" },
  ];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="Edit Saree" onBack={() => onNavigate("saree-detail", saree)}
        actions={hasChanges && <Button size="sm" variant="teal" onClick={handleSave}>Save</Button>} />

      <div style={{ padding: 16 }}>
        {/* Status toggle */}
        <Card style={{ padding: 14, marginBottom: 14, border: `1px solid ${form.status === "inactive" ? T.muted : form.status === "active" ? `${T.success}40` : `${T.amber}40`}` }}>
          <Select label="Catalogue Status" value={form.status} onChange={v => update("status", v)} options={statusOptions} />
          <p style={{ margin: "-8px 0 0", fontSize: 12, color: T.muted }}>Controls visibility of this saree on Smart Mirror and Tablet.</p>
        </Card>

        {/* Core details */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: T.navy }}>Core Details</h3>
          <Input label="Saree Name" value={form.name} onChange={v => update("name", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Selling Price (₹)" value={form.price} onChange={v => update("price", v)} type="number" prefix="₹" />
            <Input label="MRP (₹)" value={form.mrp} onChange={v => update("mrp", v)} type="number" prefix="₹" hint="Optional" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Fabric" value={form.fabric} onChange={v => update("fabric", v)}
              options={["Pure Silk", "Silk", "Cotton", "Georgette", "Crepe", "Chiffon", "Linen", "Cotton-Silk", "Organza", "Tissue", "Silk Crepe"].map(f => ({ value: f, label: f }))} />
            <Input label="Quantity in Stock" value={form.quantity} onChange={v => update("quantity", v)} type="number" />
          </div>
        </Card>

        {/* Classification */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: T.navy }}>Classification</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Region / Origin" value={form.region} onChange={v => update("region", v)}
              options={["Tamil Nadu", "Uttar Pradesh", "Karnataka", "West Bengal", "Madhya Pradesh", "Telangana", "Maharashtra", "Odisha", "Rajasthan", "Gujarat", "Assam"].map(r => ({ value: r, label: r }))} />
            <Select label="Occasion" value={form.occasion} onChange={v => update("occasion", v)}
              options={["Wedding", "Festival", "Casual", "Casual-Formal", "Party", "Daily", "Bridal"].map(o => ({ value: o, label: o }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Weight" value={form.weight} onChange={v => update("weight", v)}
              options={["Feather Light", "Light", "Medium", "Heavy"].map(w => ({ value: w, label: w }))} />
            <Input label="Primary Colour" value={form.colorName} onChange={v => update("colorName", v)} />
          </div>
          <Input label="Weave Type" value={form.weave} onChange={v => update("weave", v)} hint="e.g. Zari, Ikat, Jamdani, Plain" />
        </Card>

        {/* Description */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.navy, marginBottom: 6 }}>Description</label>
          <textarea value={form.description} onChange={e => update("description", e.target.value)}
            rows={3} style={{ width: "100%", padding: "12px 14px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 14, fontFamily: "IBM Plex Sans, sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box", color: T.text }} />
          <p style={{ margin: "6px 0 0", fontSize: 12, color: T.muted }}>This appears on the Smart Mirror product detail screen.</p>
        </Card>

        {/* Tag management */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: T.navy }}>🤖 AI Tags</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {tags.map((tag, i) => (
              <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 16, backgroundColor: `${T.teal}14`, border: `1px solid ${T.teal}30`, fontSize: 12, fontWeight: 600, color: T.teal }}>
                {tag}
                <button onClick={() => { setTags(prev => prev.filter(t => t !== tag)); setHasChanges(true); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.muted, lineHeight: 1, padding: 0 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()}
              placeholder="Add a tag..." style={{ flex: 1, padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 14, fontFamily: "IBM Plex Sans", outline: "none" }} />
            <Button size="sm" variant="ghost" onClick={addTag}>Add</Button>
          </div>
        </Card>

        <Button fullWidth variant="primary" onClick={handleSave}>Save Changes</Button>
        {(() => {
          const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
          return (
            <>
              <Button fullWidth variant="danger" style={{ marginTop: 10 }} onClick={() => setShowDeleteConfirm(true)}>
                🗑️ Delete Saree
              </Button>
              <ConfirmDialog isOpen={showDeleteConfirm}
                title="Delete Saree?"
                message={`"${s.name}" will be permanently removed from your catalogue. This cannot be undone.`}
                confirmLabel="Yes, Delete"
                onConfirm={() => { setShowDeleteConfirm(false); onNavigate("inventory"); }}
                onCancel={() => setShowDeleteConfirm(false)} />
            </>
          );
        })()}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── Aging Action Sheet (RD-14) ────────────────────────
function AgingActionSheet({ saree, onClose }) {
  const [selected, setSelected] = useState(null);
  const [discountPct, setDiscountPct] = useState("15");
  const [toast, setToast] = useState({ visible: false, message: "" });

  const actions = [
    {
      id: "discount",
      icon: "🏷️",
      title: "Apply Discount",
      subtitle: "Reduce price to accelerate sale — auto-notifies interested customers",
      color: T.teal,
      bg: "#E3F2FD",
      preview: `₹${Math.round(saree.price * (1 - parseInt(discountPct || 0) / 100)).toLocaleString("en-IN")} (was ₹${saree.price.toLocaleString("en-IN")})`,
    },
    {
      id: "bundle",
      icon: "🎁",
      title: "Create Bundle",
      subtitle: "Pair with a fast-moving saree as a value bundle offer",
      color: T.gold,
      bg: T.amberLight,
      preview: "Bundle with Tant Cotton · Estimated value ₹" + formatINR(saree.price + 3500),
    },
    {
      id: "feature",
      icon: "🪞",
      title: "Feature on Mirror",
      subtitle: "Pin this saree to front of Smart Mirror catalogue for 7 days",
      color: T.navy,
      bg: `${T.navy}0A`,
      preview: "Pinned for 7 days · Auto-shown to next 50 mirror sessions",
    },
    {
      id: "clearance",
      icon: "🗑️",
      title: "Mark for Clearance",
      subtitle: "Mark as clearance stock at cost price — recommended for 120d+ items",
      color: T.alert,
      bg: T.alertLight,
      preview: "Price set to cost + 5% margin · Highest urgency WhatsApp blast",
    },
  ];

  const handleApply = () => {
    const action = actions.find(a => a.id === selected);
    setToast({ visible: true, message: `${action.title} applied to ${saree.name} ✓` });
    setTimeout(() => { setToast({ visible: false, message: "" }); onClose(); }, 1800);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={null} width={560}>
      <div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 0 16px", borderBottom: `1px solid ${T.border}`, marginBottom: 18 }}>
          <div style={{ width: 52, height: 60, backgroundColor: T.cream, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{saree.emoji}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: T.navy }}>{saree.name}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{formatINRFull(saree.price)} · {saree.daysOld} days in stock</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <Badge color={saree.daysOld >= 120 ? T.alert : saree.daysOld >= 90 ? T.amber : T.gold}>{saree.tier} days</Badge>
              <Badge color={T.muted}>{saree.views} views · {saree.tryOns} try-ons</Badge>
            </div>
          </div>
        </div>

        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: T.navy }}>Choose an Action</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {actions.map(a => (
            <div key={a.id} onClick={() => setSelected(a.id)}
              style={{ padding: 14, borderRadius: T.radius, border: `2px solid ${selected === a.id ? a.color : T.border}`, backgroundColor: selected === a.id ? a.bg : T.white, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, marginBottom: 2 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: T.textMid, marginBottom: selected === a.id ? 8 : 0 }}>{a.subtitle}</div>
                  {selected === a.id && (
                    <>
                      {a.id === "discount" && (
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                          <label style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Discount %:</label>
                          {["10", "15", "20", "25", "30"].map(pct => (
                            <button key={pct} onClick={e => { e.stopPropagation(); setDiscountPct(pct); }}
                              style={{ padding: "4px 10px", borderRadius: 16, border: `1px solid ${discountPct === pct ? T.teal : T.border}`, backgroundColor: discountPct === pct ? T.teal : T.white, color: discountPct === pct ? T.white : T.navy, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                              {pct}%
                            </button>
                          ))}
                        </div>
                      )}
                      <div style={{ padding: "8px 12px", backgroundColor: T.cream, borderRadius: T.radiusSm, fontSize: 13, color: a.color, fontWeight: 600, border: `1px solid ${a.color}30` }}>
                        Preview: {a.preview}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${selected === a.id ? a.color : T.border}`, backgroundColor: selected === a.id ? a.color : T.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {selected === a.id && <span style={{ color: T.white, fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="primary" onClick={handleApply} disabled={!selected} style={{ flex: 2 }}>Apply Action</Button>
        </div>
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </Modal>
  );
}

// ── Reorder Suggestions (RD-15) ───────────────────────
function ReorderSuggestionsScreen({ onNavigate }) {
  const [selected, setSelected] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const urgencyConfig = {
    high: { color: T.alert, bg: T.alertLight, label: "Urgent", icon: "🔴" },
    medium: { color: T.amber, bg: T.amberLight, label: "Soon", icon: "🟡" },
    low: { color: T.success, bg: T.successLight, label: "When Ready", icon: "🟢" },
  };

  const handleOrder = () => {
    setToast({ visible: true, message: `${selected.length} reorder request${selected.length > 1 ? "s" : ""} sent to supplier ✓` });
    setTimeout(() => { setToast({ visible: false, message: "" }); setSelected([]); }, 2200);
  };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="Reorder Suggestions" onBack={() => onNavigate("inventory")} />

      {/* Festival calendar banner */}
      <div style={{ margin: "12px 16px 0", backgroundColor: T.navy, borderRadius: T.radius, padding: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>📅</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: T.white }}>Upcoming Festivals</span>
          <Badge color={T.gold}>Next 60 days</Badge>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {MOCK.festivals.map((f, i) => (
            <div key={i} style={{ flexShrink: 0, backgroundColor: `${T.white}14`, borderRadius: T.radiusSm, padding: "8px 12px", border: `1px solid ${f.color}60` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.white }}>{f.name}</div>
              <div style={{ fontSize: 11, color: `${T.white}99` }}>{f.date}</div>
              <div style={{ fontSize: 11, color: f.color, fontWeight: 600, marginTop: 4 }}>{f.impact}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI explanation */}
      <div style={{ margin: "12px 16px 0", padding: "12px 14px", backgroundColor: `${T.teal}0C`, borderRadius: T.radius, border: `1px solid ${T.teal}25`, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18 }}>🤖</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 2 }}>Chronos-2 Demand Forecast</div>
          <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>Forecasts are based on your last 6 months of sales velocity, seasonal patterns, and festival calendar signals. Confidence intervals shown in each recommendation.</p>
        </div>
      </div>

      {/* Suggestion cards */}
      <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {MOCK.reorderSuggestions.map(r => {
          const u = urgencyConfig[r.urgency];
          const isSelected = selected.includes(r.id);
          return (
            <Card key={r.id} style={{ padding: 0, overflow: "hidden", border: `2px solid ${isSelected ? T.teal : T.border}`, transition: "border 0.15s" }}>
              {/* Header */}
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.border}` }}>
                <div onClick={() => toggle(r.id)} style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${isSelected ? T.teal : T.border}`, backgroundColor: isSelected ? T.teal : T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {isSelected && <span style={{ color: T.white, fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 28 }}>{r.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{r.priceRange}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Badge color={u.color} bg={u.bg}>{u.icon} {u.label}</Badge>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Confidence: <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: T.navy }}>{r.confidence}%</span></div>
                </div>
              </div>

              {/* Reason */}
              <div style={{ padding: "10px 16px", backgroundColor: u.bg, borderBottom: `1px solid ${T.border}` }}>
                <p style={{ margin: 0, fontSize: 13, color: T.textMid, lineHeight: 1.5 }}>🔍 {r.reason}</p>
              </div>

              {/* Reorder qty + chart */}
              <div style={{ padding: "12px 16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div style={{ padding: "10px 12px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Current Stock</div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 18, color: r.currentStock <= 3 ? T.alert : T.navy }}>{r.currentStock} pcs</div>
                  </div>
                  <div style={{ padding: "10px 12px", backgroundColor: `${T.teal}0A`, borderRadius: T.radiusSm, border: `1px solid ${T.teal}20` }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 2 }}>Suggested Order</div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 18, color: T.teal }}>{r.suggestedReorder} pcs</div>
                  </div>
                </div>

                {/* 5-week demand forecast chart */}
                <div style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontWeight: 600 }}>5-Week Demand Forecast vs. Stock</div>
                  <ResponsiveContainer width="100%" height={70}>
                    <BarChart data={r.demandForecast} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v, name) => [v, name === "demand" ? "Demand" : "Stock"]} contentStyle={{ fontFamily: "IBM Plex Sans", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="demand" fill={`${T.teal}90`} radius={[3, 3, 0, 0]} name="demand" />
                      <Bar dataKey="current" fill={`${T.gold}90`} radius={[3, 3, 0, 0]} name="stock" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: T.muted }}>
                    <span><span style={{ color: T.teal, fontWeight: 700 }}>■</span> Predicted Demand</span>
                    <span><span style={{ color: T.gold, fontWeight: 700 }}>■</span> Current Stock</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sticky bottom action */}
      {selected.length > 0 && (
        <div style={{ position: "fixed", bottom: 80, left: 0, right: 0, padding: "12px 16px", backgroundColor: T.white, borderTop: `1px solid ${T.border}`, boxShadow: T.shadowMd, zIndex: 100 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", maxWidth: 600, margin: "0 auto" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{selected.length} item{selected.length > 1 ? "s" : ""} selected</div>
              <div style={{ fontSize: 12, color: T.muted }}>Supplier will be notified via WhatsApp</div>
            </div>
            <Button variant="teal" onClick={handleOrder}>📦 Place Reorder</Button>
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SESSION 3 — NEW SCREENS
// ═══════════════════════════════════════════════════════

// ── Churn Risk Badge ──────────────────────────────────
function ChurnBadge({ score }) {
  if (score <= 20) return <Badge color={T.success}>✅ Loyal</Badge>;
  if (score <= 50) return <Badge color={T.gold}>⚠️ Watch</Badge>;
  return <Badge color={T.alert}>🔴 At Risk</Badge>;
}

// ── Customer Profile Screen (RD-17) ──────────────────
function CustomerProfileScreen({ customer, onNavigate }) {
  const c = customer || MOCK.customers[0];
  const [activeTab, setActiveTab] = useState("overview");
  const [showDPDP, setShowDPDP] = useState(false);
  const statusColor = { VIP: T.gold, Regular: T.teal, New: T.success };
  const engColor = c.engagementScore >= 70 ? T.success : c.engagementScore >= 40 ? T.gold : T.alert;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "Purchases" },
    { id: "tryon", label: "Try-Ons" },
    { id: "consent", label: "DPDP" },
  ];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Customer Profile" onBack={() => onNavigate("customers")}
        actions={
          <Button size="sm" variant="gold" onClick={() => onNavigate("campaign-builder", { prefillSegment: c.segment })}>
            📱 Send Message
          </Button>
        }
      />

      {/* Hero card */}
      <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.teal} 100%)`, padding: "20px 20px 28px" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${statusColor[c.status]}33`, border: `3px solid ${statusColor[c.status]}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, color: T.white, flexShrink: 0 }}>
            {c.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.white }}>{c.name}</h2>
              <Badge color={statusColor[c.status]}>{c.status}</Badge>
            </div>
            <div style={{ fontSize: 13, color: `${T.white}AA` }}>{c.phone}</div>
            <div style={{ fontSize: 12, color: `${T.white}80`, marginTop: 2 }}>Customer since {c.joinedDate} · {c.visits} visits</div>
          </div>
        </div>

        {/* 3 KPI strips */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
          {[
            { label: "Lifetime Value", value: formatINR(c.clv), color: T.gold },
            { label: "Engagement", value: `${c.engagementScore}%`, color: engColor },
            { label: "Churn Risk", value: `${c.churnScore}%`, color: c.churnScore > 50 ? T.alert : c.churnScore > 20 ? T.gold : T.success },
          ].map((k, i) => (
            <div key={i} style={{ backgroundColor: `${T.white}14`, borderRadius: T.radiusSm, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 15, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: `${T.white}80`, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ backgroundColor: T.white, borderBottom: `1px solid ${T.border}`, display: "flex", overflowX: "auto" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: "12px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: activeTab === tab.id ? T.teal : T.muted, borderBottom: `2px solid ${activeTab === tab.id ? T.teal : "transparent"}`, whiteSpace: "nowrap", transition: "all 0.15s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 16px" }}>
        {activeTab === "overview" && (
          <>
            {/* Preferences */}
            <Card style={{ padding: 16, marginBottom: 12 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>🎯 Preferences (AI Inferred)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Fabric", value: c.preferredFabric.join(", ") },
                  { label: "Colour", value: c.preferredColor.join(", ") },
                  { label: "Budget Range", value: c.budget },
                  { label: "Occasion", value: c.occasion },
                ].map((pref, i) => (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 13, color: T.muted, width: 80, flexShrink: 0 }}>{pref.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{pref.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: "10px 12px", backgroundColor: `${T.teal}08`, borderRadius: T.radiusSm, border: `1px solid ${T.teal}20` }}>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>🤖 AI Recommendation</div>
                <div style={{ fontSize: 13, color: T.navy, fontWeight: 500 }}>Show new {c.preferredFabric[0]} arrivals in {c.preferredColor[0]} — high match with purchase history.</div>
              </div>
            </Card>

            {/* Upcoming dates */}
            {(c.birthday || c.anniversary) && (
              <Card style={{ padding: 16, marginBottom: 12 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>📅 Upcoming Dates</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {c.birthday && (
                    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", backgroundColor: "#FFF3E0", borderRadius: T.radiusSm }}>
                      <span style={{ fontSize: 20 }}>🎂</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: T.navy }}>Birthday: {c.birthday}</div>
                        <div style={{ fontSize: 12, color: T.muted }}>Send personalised greeting 3 days before</div>
                      </div>
                      <Button size="sm" variant="gold" style={{ marginLeft: "auto" }} onClick={() => onNavigate("campaign-builder")}>Remind me</Button>
                    </div>
                  )}
                  {c.anniversary && (
                    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", backgroundColor: `${T.teal}08`, borderRadius: T.radiusSm }}>
                      <span style={{ fontSize: 20 }}>💍</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: T.navy }}>Anniversary: {c.anniversary}</div>
                        <div style={{ fontSize: 12, color: T.muted }}>Good time for a bridal saree suggestion</div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Engagement + churn */}
            <Card style={{ padding: 16, marginBottom: 12 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>📊 Engagement</h3>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <ChurnBadge score={c.churnScore} />
                {c.whatsappOptIn ? <Badge color={T.success}>💬 WhatsApp ON</Badge> : <Badge color={T.muted}>💬 WhatsApp OFF</Badge>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Campaigns Sent", value: c.campaignsSent, icon: "📤" },
                  { label: "Campaigns Opened", value: c.campaignsOpened, icon: "👁" },
                  { label: "Last Visit", value: c.lastVisit, icon: "🗓" },
                  { label: "Segment", value: c.segment, icon: "🏷️" },
                ].map((m, i) => (
                  <div key={i} style={{ padding: "10px 12px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                    <div style={{ fontSize: 12, color: T.muted }}>{m.icon} {m.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, marginTop: 2 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Staff notes */}
            {c.notes && (
              <Card style={{ padding: 16, marginBottom: 12 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: T.navy }}>📝 Staff Notes</h3>
                <p style={{ margin: 0, fontSize: 13, color: T.textMid, lineHeight: 1.7 }}>{c.notes}</p>
              </Card>
            )}

            {/* AI CLV link */}
            <Card style={{ padding: 14, backgroundColor: `${T.gold}08`, border: `1px solid ${T.gold}25` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>📈</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 2 }}>AI Lifetime Value Prediction</div>
                  <div style={{ fontSize: 12, color: T.muted }}>See 12-month and 3-year revenue projections + churn model</div>
                </div>
                <Button size="sm" variant="gold" onClick={() => onNavigate("clv-predictions")}>View →</Button>
              </div>
            </Card>
          </>
        )}

        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{c.purchaseHistory.length} Purchases</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: T.success }}>{formatINR(c.clv)} total</span>
            </div>
            {c.purchaseHistory.map((p, i) => (
              <Card key={i} style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{p.item}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{p.date} · Served by {p.staff}</div>
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 15, color: T.success }}>{formatINR(p.amount)}</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "tryon" && (
          <div>
            <p style={{ fontSize: 13, color: T.muted, margin: "0 0 14px" }}>{c.tryOnHistory.length} sarees tried on the Smart Mirror</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {c.tryOnHistory.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", backgroundColor: T.white, borderRadius: T.radius, border: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 22 }}>{["🌺", "🦚", "🌸", "🌼"][i % 4]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{item}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>Virtual try-on via Smart Mirror</div>
                  </div>
                  {c.purchaseHistory.some(p => p.item.includes(item.split(" ")[0])) && (
                    <Badge color={T.success}>Purchased ✓</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "consent" && (
          <div>
            <div style={{ padding: "12px 14px", backgroundColor: `${T.navy}08`, borderRadius: T.radius, border: `1px solid ${T.navy}15`, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>🔐 DPDP Act 2023 Compliance</div>
              <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>Consent granted on {c.dpdpConsent.grantedDate}. Customer may withdraw consent at any time. All data marked for deletion upon request.</p>
            </div>
            {[
              { label: "CRM Data", key: "crm", desc: "Store purchase history and preferences", icon: "🗂" },
              { label: "Marketing", key: "marketing", desc: "WhatsApp campaigns and promotional messages", icon: "📱" },
              { label: "Analytics", key: "analytics", desc: "Usage analytics and behaviour insights", icon: "📊" },
            ].map((item, i) => (
              <Card key={i} style={{ padding: "12px 16px", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{item.desc}</div>
                  </div>
                  <Badge color={c.dpdpConsent[item.key] ? T.success : T.alert}>{c.dpdpConsent[item.key] ? "Granted ✓" : "Withheld"}</Badge>
                </div>
              </Card>
            ))}
            {(() => {
              const [showDPDPDelete, setShowDPDPDelete] = useState(false);
              const rbac2 = useRole();
              if (!rbac2.canDeleteCustomer) return (
                <div style={{ marginTop: 14, padding: "10px 14px", backgroundColor: T.cream, borderRadius: T.radiusSm, fontSize: 12, color: T.muted, textAlign: "center" }}>
                  🔒 Only Store Owners can request data deletion
                </div>
              );
              return (
                <>
                  <Button variant="danger" fullWidth style={{ marginTop: 14 }} onClick={() => setShowDPDPDelete(true)}>
                    🗑 Request Data Deletion (DPDP §12)
                  </Button>
                  <p style={{ margin: "10px 0 0", fontSize: 12, color: T.muted, textAlign: "center" }}>Data deletion will anonymise all transactions and hard-delete PII within 30 days.</p>
                  <ConfirmDialog isOpen={showDPDPDelete}
                    title="Request Data Deletion?"
                    message={`This will permanently delete all personal data for ${c.name} within 30 days, as required by DPDP Act 2023 §12. Transactions will be anonymised. This action cannot be reversed.`}
                    confirmLabel="Confirm Deletion Request"
                    cancelLabel="Cancel"
                    onConfirm={() => { setShowDPDPDelete(false); }}
                    onCancel={() => setShowDPDPDelete(false)} />
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Segment Builder Screen (RD-18) ────────────────────
function SegmentBuilderScreen({ onNavigate }) {
  const [segmentName, setSegmentName] = useState("");
  const [rules, setRules] = useState([]);
  const [audienceCount, setAudienceCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const ruleOptions = [
    { id: "r_spent", label: "Total Spend", options: ["> ₹10,000", "> ₹30,000", "> ₹50,000", "> ₹1,00,000"] },
    { id: "r_visits", label: "Visit Count", options: ["≥ 1 visit", "≥ 3 visits", "≥ 5 visits", "≥ 10 visits"] },
    { id: "r_recency", label: "Last Visit", options: ["Within 7 days", "Within 30 days", "30–90 days ago", "More than 90 days ago"] },
    { id: "r_occasion", label: "Occasion", options: ["Wedding", "Festival", "Casual", "Party"] },
    { id: "r_status", label: "Customer Status", options: ["VIP", "Regular", "New"] },
    { id: "r_whatsapp", label: "WhatsApp Opt-In", options: ["Opted in", "Not opted in"] },
    { id: "r_birthday", label: "Birthday", options: ["This month", "Next month", "Within 30 days"] },
    { id: "r_fabric", label: "Preferred Fabric", options: ["Silk", "Cotton", "Georgette", "Chanderi"] },
  ];

  const addRule = (ruleId, value) => {
    const rule = ruleOptions.find(r => r.id === ruleId);
    if (!rules.find(r => r.id === ruleId)) {
      const newRules = [...rules, { id: ruleId, label: rule.label, value }];
      setRules(newRules);
      // Simulate audience count update
      const base = Math.floor(Math.random() * 40) + 15;
      setAudienceCount(Math.max(3, base - newRules.length * 8));
    }
  };

  const removeRule = (ruleId) => {
    const newRules = rules.filter(r => r.id !== ruleId);
    setRules(newRules);
    setAudienceCount(newRules.length === 0 ? 0 : Math.floor(Math.random() * 40) + 20);
  };

  const handleSave = () => {
    if (!segmentName || rules.length === 0) return;
    setToast({ visible: true, message: `Segment "${segmentName}" saved — ${audienceCount} customers ✓` });
    setSaved(true);
    setTimeout(() => { setToast({ visible: false, message: "" }); }, 2200);
  };

  const [expandedRule, setExpandedRule] = useState(null);

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="Build Customer Segment" onBack={() => onNavigate("customers")} />

      <div style={{ padding: 16 }}>
        {/* Existing segments */}
        <Card style={{ padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>Saved Segments</h3>
            <span style={{ fontSize: 12, color: T.muted }}>{MOCK.segments.length} total</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK.segments.map(seg => (
              <div key={seg.id} onClick={() => onNavigate("campaign-builder", { prefillSegment: seg.name })}
                style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", backgroundColor: T.cream, borderRadius: T.radiusSm, cursor: "pointer" }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: seg.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: T.navy }}>{seg.name}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{seg.rules.slice(0, 2).join(" · ")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: seg.color, fontSize: 15 }}>{seg.count}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>customers</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ height: 1, backgroundColor: T.border, margin: "4px 0 16px" }} />
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: T.navy }}>➕ Create New Segment</h3>

        {/* Segment name */}
        <Input label="Segment Name" placeholder="e.g. Navratri Shoppers" value={segmentName} onChange={setSegmentName} />

        {/* Rule builder */}
        <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: T.navy }}>Rules (AND logic)</h4>

        {rules.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {rules.map(r => (
              <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", backgroundColor: `${T.teal}0C`, borderRadius: T.radiusSm, border: `1px solid ${T.teal}25` }}>
                <span style={{ fontSize: 14, color: T.teal, fontWeight: 700 }}>IF</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: T.navy, fontWeight: 600 }}>{r.label}</span>
                  <span style={{ fontSize: 13, color: T.teal, marginLeft: 6 }}>{r.value}</span>
                </div>
                <button onClick={() => removeRule(r.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.muted }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Add rule */}
        <Card style={{ padding: 14, marginBottom: 14 }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: T.muted }}>+ Add a rule to filter customers:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ruleOptions.filter(r => !rules.find(ar => ar.id === r.id)).map(rule => (
              <div key={rule.id} style={{ position: "relative" }}>
                <button onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                  style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, backgroundColor: T.cream, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.navy, textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                  {rule.label} <span>▾</span>
                </button>
                {expandedRule === rule.id && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, boxShadow: T.shadowMd, overflow: "hidden" }}>
                    {rule.options.map((opt, i) => (
                      <div key={i} onClick={() => { addRule(rule.id, opt); setExpandedRule(null); }}
                        style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: T.navy, borderBottom: i < rule.options.length - 1 ? `1px solid ${T.border}` : "none" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = T.cream}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = T.white}>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Audience estimate */}
        {rules.length > 0 && (
          <Card style={{ padding: 14, marginBottom: 14, backgroundColor: `${T.gold}0C`, border: `1px solid ${T.gold}30` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 24 }}>👥</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>Estimated Audience: <span style={{ fontFamily: "JetBrains Mono, monospace", color: T.gold }}>{audienceCount} customers</span></div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>All {audienceCount} have WhatsApp opt-in — DPDP compliant ✓</div>
              </div>
            </div>
          </Card>
        )}

        <Button fullWidth variant="primary" onClick={handleSave} disabled={!segmentName || rules.length === 0}>Save Segment</Button>
        {saved && rules.length > 0 && (
          <Button fullWidth variant="teal" style={{ marginTop: 10 }} onClick={() => onNavigate("campaign-builder", { prefillSegment: segmentName })}>
            📱 Send Campaign to This Segment →
          </Button>
        )}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── DPDP Consent Dashboard (RD-35) ───────────────────
function DPDPConsentScreen({ onNavigate }) {
  const consentStats = {
    total: 5, crmConsent: 5, marketingConsent: 4, analyticsConsent: 3,
    pendingRequests: 0, deletionRequests: 0,
  };

  const auditLog = [
    { date: "Mar 22, 2026", customer: "Kavitha Nair", action: "Consent granted — Marketing", icon: "✅" },
    { date: "Mar 15, 2026", customer: "Sunita Agarwal", action: "Consent granted — CRM + Analytics", icon: "✅" },
    { date: "Mar 1, 2026", customer: "Sunita Agarwal", action: "Marketing consent withheld on signup", icon: "⚠️" },
    { date: "Feb 14, 2026", customer: "Deepa Mehra", action: "Analytics consent withdrawn (customer request)", icon: "🚫" },
    { date: "Jan 12, 2026", customer: "Priya Sharma", action: "Full consent granted (CRM + Marketing + Analytics)", icon: "✅" },
  ];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="DPDP Consent Dashboard" onBack={() => onNavigate("customers")} />

      <div style={{ padding: 14 }}>
        {/* Compliance status */}
        <Card style={{ padding: 14, marginBottom: 12, background: `linear-gradient(135deg, ${T.navy}08, ${T.teal}10)`, border: `1px solid ${T.teal}25` }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>🔐</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: T.navy }}>DPDP Act 2023 · Compliant ✅</div>
              <div style={{ fontSize: 12, color: T.muted }}>All customer data stored in AWS Mumbai (ap-south-1) · Data sovereignty met</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { label: "Total Customers", value: consentStats.total, color: T.navy },
              { label: "Pending Requests", value: consentStats.pendingRequests, color: consentStats.pendingRequests > 0 ? T.alert : T.success },
              { label: "Deletion Requests", value: consentStats.deletionRequests, color: consentStats.deletionRequests > 0 ? T.alert : T.success },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "8px", backgroundColor: T.white, borderRadius: T.radiusSm }}>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 18, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Consent breakdown */}
        <Card style={{ padding: 14, marginBottom: 12 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Consent by Category</h3>
          {[
            { label: "CRM Data Storage", count: consentStats.crmConsent, icon: "🗂", desc: "Purchase history, preferences, visit log" },
            { label: "Marketing Messages", count: consentStats.marketingConsent, icon: "📱", desc: "WhatsApp campaigns and promotional offers" },
            { label: "Analytics", count: consentStats.analyticsConsent, icon: "📊", desc: "Behaviour insights and engagement scoring" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.navy, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{item.desc}</div>
                <ProgressBar value={item.count} max={consentStats.total} color={T.teal} height={5} />
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{item.count} of {consentStats.total} customers</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Per-customer consent */}
        <Card style={{ padding: 0, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>Customer Consent Status</h3>
          </div>
          {MOCK.customers.map((c, i) => (
            <div key={c.id} style={{ padding: "12px 16px", borderBottom: i < MOCK.customers.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 12, alignItems: "center" }}
              onClick={() => onNavigate("customer-profile", c)} style={{ padding: "12px 16px", borderBottom: i < MOCK.customers.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.cream, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: T.navy, flexShrink: 0 }}>{c.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.navy }}>{c.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  {["crm", "marketing", "analytics"].map(type => (
                    <span key={type} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, backgroundColor: c.dpdpConsent[type] ? T.successLight : T.alertLight, color: c.dpdpConsent[type] ? T.success : T.alert, fontWeight: 600 }}>
                      {type.charAt(0).toUpperCase()}: {c.dpdpConsent[type] ? "✓" : "✗"}
                    </span>
                  ))}
                </div>
              </div>
              <span style={{ fontSize: 16, color: T.muted }}>›</span>
            </div>
          ))}
        </Card>

        {/* Audit log */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>Consent Audit Log</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: T.muted }}>Immutable record — never deleted (legal requirement)</p>
          </div>
          {auditLog.map((entry, i) => (
            <div key={i} style={{ padding: "10px 16px", borderBottom: i < auditLog.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{entry.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.navy }}>{entry.customer}</div>
                <div style={{ fontSize: 12, color: T.textMid, marginTop: 1 }}>{entry.action}</div>
              </div>
              <div style={{ fontSize: 11, color: T.muted, flexShrink: 0 }}>{entry.date}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── Campaign Builder Screen (RD-20) ──────────────────
function CampaignBuilderScreen({ prefill, onNavigate }) {
  const [step, setStep] = useState(0); // 0=template, 1=audience, 2=preview, 3=schedule
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(prefill?.prefillSegment || "Festival Season");
  const [scheduleOption, setScheduleOption] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const steps = ["Template", "Audience", "Preview", "Schedule"];
  const selectedSeg = MOCK.segments.find(s => s.name === selectedSegment) || MOCK.segments[1];

  const handleAIGenerate = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setSelectedTemplate(MOCK.campaignTemplates[0]);
      setAiGenerating(false);
    }, 2400);
  };

  const handleSend = () => {
    setToast({ visible: true, message: scheduleOption === "now" ? `Campaign sent to ${selectedSeg?.count || 0} customers ✓` : "Campaign scheduled ✓" });
    setTimeout(() => { setToast({ visible: false, message: "" }); onNavigate("campaigns"); }, 2000);
  };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="New Campaign" onBack={() => onNavigate("campaigns")} />

      {/* Step indicator */}
      <div style={{ backgroundColor: T.white, padding: "10px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 0 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: i <= step ? T.teal : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: T.white, zIndex: 1 }}>
              {i < step ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && <div style={{ position: "absolute", top: 12, left: "50%", right: "-50%", height: 2, backgroundColor: i < step ? T.teal : T.border, zIndex: 0 }} />}
            <div style={{ fontSize: 10, color: i === step ? T.teal : T.muted, fontWeight: i === step ? 700 : 400, marginTop: 4 }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {/* Step 0: Template selection */}
        {step === 0 && (
          <>
            {/* AI generate button */}
            <div style={{ padding: "14px 16px", backgroundColor: `${T.navy}08`, borderRadius: T.radius, border: `1px solid ${T.navy}15`, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 24 }}>🤖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>AI Template Generator</div>
                  <div style={{ fontSize: 12, color: T.muted }}>Claude Haiku writes a personalised template for your current season</div>
                </div>
                <Button size="sm" variant="teal" onClick={handleAIGenerate} disabled={aiGenerating}>
                  {aiGenerating ? "Writing..." : "✨ Generate"}
                </Button>
              </div>
              {aiGenerating && (
                <div style={{ marginTop: 10 }}>
                  <ProgressBar value={60} color={T.teal} />
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Claude Haiku is crafting your personalised template...</div>
                </div>
              )}
            </div>

            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Or choose a template:</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MOCK.campaignTemplates.map(t => (
                <div key={t.id} onClick={() => setSelectedTemplate(selectedTemplate?.id === t.id ? null : t)}
                  style={{ padding: 14, borderRadius: T.radius, border: `2px solid ${selectedTemplate?.id === t.id ? t.color : T.border}`, backgroundColor: selectedTemplate?.id === t.id ? `${t.color}0A` : T.white, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: selectedTemplate?.id === t.id ? 10 : 0 }}>
                    <span style={{ fontSize: 24 }}>{t.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>{t.category} · Est. open rate: <span style={{ fontWeight: 700, color: t.color }}>{t.estimatedOpen}</span></div>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${selectedTemplate?.id === t.id ? t.color : T.border}`, backgroundColor: selectedTemplate?.id === t.id ? t.color : T.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selectedTemplate?.id === t.id && <span style={{ color: T.white, fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>
                  {selectedTemplate?.id === t.id && (
                    <div style={{ padding: "10px 12px", backgroundColor: T.cream, borderRadius: T.radiusSm, fontSize: 13, color: T.textMid, lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "IBM Plex Sans" }}>
                      {t.body}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button fullWidth variant="primary" style={{ marginTop: 16 }} disabled={!selectedTemplate} onClick={() => setStep(1)}>
              Next: Choose Audience →
            </Button>
          </>
        )}

        {/* Step 1: Audience */}
        {step === 1 && (
          <>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Select Audience Segment</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {MOCK.segments.map(seg => (
                <div key={seg.id} onClick={() => setSelectedSegment(seg.name)}
                  style={{ padding: "12px 16px", borderRadius: T.radius, border: `2px solid ${selectedSegment === seg.name ? seg.color : T.border}`, backgroundColor: selectedSegment === seg.name ? `${seg.color}0A` : T.white, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: seg.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{seg.name}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>{seg.rules.slice(0, 2).join(" · ")}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 18, color: seg.color }}>{seg.count}</div>
                      <div style={{ fontSize: 10, color: T.muted }}>recipients</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "10px 14px", backgroundColor: T.successLight, borderRadius: T.radiusSm, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <div style={{ fontSize: 13, color: T.success, fontWeight: 600 }}>DPDP Compliant: All {selectedSeg?.count} recipients have active WhatsApp marketing consent</div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="secondary" onClick={() => setStep(0)} style={{ flex: 1 }}>← Back</Button>
              <Button variant="primary" onClick={() => setStep(2)} style={{ flex: 2 }} disabled={!selectedSegment}>Preview Message →</Button>
            </div>
          </>
        )}

        {/* Step 2: Preview */}
        {step === 2 && selectedTemplate && (
          <>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Message Preview</h3>

            {/* WhatsApp mockup */}
            <div style={{ backgroundColor: "#ECE5DD", borderRadius: T.radiusLg, padding: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "8px 12px", backgroundColor: "#075E54", borderRadius: T.radiusSm }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: T.white, fontSize: 14 }}>RS</div>
                <div>
                  <div style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>Ramesh Silks & Sarees</div>
                  <div style={{ color: "#A5C7B7", fontSize: 11 }}>WhatsApp Business · via Wearify</div>
                </div>
              </div>
              <div style={{ backgroundColor: T.white, borderRadius: "4px 16px 16px 16px", padding: "12px 14px", maxWidth: "85%", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#111", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "system-ui" }}>
                  {selectedTemplate.body.replace("{{name}}", "Priya")}
                </p>
                <div style={{ fontSize: 11, color: "#667781", textAlign: "right", marginTop: 6 }}>10:00 AM ✓✓</div>
              </div>
            </div>

            {/* Stats */}
            <Card style={{ padding: 14, marginBottom: 14 }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: T.navy }}>Campaign Estimates</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { label: "Recipients", value: selectedSeg?.count || 0, color: T.navy, icon: "👥" },
                  { label: "Est. Open Rate", value: selectedTemplate.estimatedOpen, color: T.teal, icon: "👁" },
                  { label: "Est. Revenue", value: selectedTemplate.estimatedRevenue.split("–")[0], color: T.success, icon: "💰" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "10px 8px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                    <div style={{ fontSize: 16 }}>{s.icon}</div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 16, color: s.color, marginTop: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: T.muted }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Button>
              <Button variant="primary" onClick={() => setStep(3)} style={{ flex: 2 }}>Schedule →</Button>
            </div>
          </>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>When to Send?</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {[
                { id: "now", label: "Send Now", icon: "🚀", desc: "Deliver immediately to all recipients" },
                { id: "scheduled", label: "Schedule for Later", icon: "🗓", desc: "Pick a date and time" },
                { id: "optimal", label: "AI Optimal Time", icon: "🤖", desc: "Claude picks the best send time based on open rate patterns" },
              ].map(opt => (
                <div key={opt.id} onClick={() => setScheduleOption(opt.id)}
                  style={{ padding: 14, borderRadius: T.radius, border: `2px solid ${scheduleOption === opt.id ? T.teal : T.border}`, backgroundColor: scheduleOption === opt.id ? `${T.teal}0A` : T.white, cursor: "pointer" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 22 }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>{opt.desc}</div>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${scheduleOption === opt.id ? T.teal : T.border}`, backgroundColor: scheduleOption === opt.id ? T.teal : T.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {scheduleOption === opt.id && <span style={{ color: T.white, fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>
                  {opt.id === "scheduled" && scheduleOption === "scheduled" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                      <Input label="Date" type="date" value={scheduledDate} onChange={setScheduledDate} />
                      <Input label="Time" type="time" value={scheduledTime} onChange={setScheduledTime} />
                    </div>
                  )}
                  {opt.id === "optimal" && scheduleOption === "optimal" && (
                    <div style={{ marginTop: 10, padding: "8px 12px", backgroundColor: `${T.teal}0A`, borderRadius: T.radiusSm, fontSize: 13, color: T.teal, fontWeight: 600 }}>
                      🤖 Recommended: Tomorrow 10:15 AM (highest predicted open rate for this segment)
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary card */}
            <Card style={{ padding: 14, marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: T.navy }}>Campaign Summary</h4>
              {[
                { label: "Template", value: selectedTemplate?.name || "—" },
                { label: "Audience", value: `${selectedSegment} (${selectedSeg?.count} people)` },
                { label: "Send Time", value: scheduleOption === "now" ? "Immediately" : scheduleOption === "optimal" ? "Tomorrow 10:15 AM (AI)" : `${scheduledDate || "—"} at ${scheduledTime}` },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: T.muted, width: 80, flexShrink: 0 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{item.value}</span>
                </div>
              ))}
            </Card>

            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</Button>
              <Button variant="teal" onClick={handleSend} style={{ flex: 2 }}>
                {scheduleOption === "now" ? "🚀 Send Campaign" : "📅 Schedule Campaign"}
              </Button>
            </div>
          </>
        )}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── Campaign Stats Detail (RD-21) ─────────────────────
function CampaignDetailScreen({ campaign, onNavigate }) {
  const c = campaign || MOCK.campaigns[0];
  const isSent = c.status === "sent";

  const deliveryFunnel = [
    { stage: "Sent", count: c.sent, pct: 100, color: T.navy },
    { stage: "Delivered", count: c.delivered, pct: c.sent > 0 ? Math.round((c.delivered / c.sent) * 100) : 0, color: T.teal },
    { stage: "Opened", count: c.opened, pct: c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0, color: T.gold },
    { stage: "Clicked", count: c.clicked, pct: c.sent > 0 ? Math.round((c.clicked / c.sent) * 100) : 0, color: T.success },
  ];

  const hourlyData = [
    { hour: "8AM", opens: 3 }, { hour: "9AM", opens: 8 }, { hour: "10AM", opens: 24 }, { hour: "11AM", opens: 19 },
    { hour: "12PM", opens: 11 }, { hour: "2PM", opens: 14 }, { hour: "4PM", opens: 8 }, { hour: "6PM", opens: 2 },
  ];

  const customerResponses = [
    { name: "Kavitha Nair", status: "clicked", response: "Visited store", revenue: 38000, time: "10:24 AM" },
    { name: "Priya Sharma", status: "opened", response: "Read message", revenue: 0, time: "10:31 AM" },
    { name: "Deepa Mehra", status: "opened", response: "Read message", revenue: 0, time: "11:15 AM" },
    { name: "Meena Joshi", status: "delivered", response: "Not opened yet", revenue: 0, time: "—" },
  ];

  const statusColor = { sent: { color: T.success, bg: T.successLight, label: "Sent" }, scheduled: { color: T.teal, bg: "#E3F2FD", label: "Scheduled" }, draft: { color: T.muted, bg: T.cream, label: "Draft" } };
  const s = statusColor[c.status];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Campaign Stats" onBack={() => onNavigate("campaigns")} />

      <div style={{ padding: 14 }}>
        {/* Campaign header */}
        <Card style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: T.navy }}>{c.name}</h2>
              <div style={{ fontSize: 13, color: T.muted }}>{c.date}</div>
            </div>
            <Badge color={s.color} bg={s.bg}>{s.label}</Badge>
          </div>
          {isSent && c.revenue > 0 && (
            <div style={{ padding: "10px 14px", backgroundColor: T.successLight, borderRadius: T.radiusSm, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>💰</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: T.success, fontFamily: "JetBrains Mono, monospace" }}>{formatINR(c.revenue)}</div>
                <div style={{ fontSize: 12, color: T.success }}>Revenue attributed to this campaign</div>
              </div>
            </div>
          )}
        </Card>

        {/* Delivery funnel */}
        {isSent && (
          <Card style={{ padding: 16, marginBottom: 12 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>📊 Delivery Funnel</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {deliveryFunnel.map((stage, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 70, fontSize: 13, fontWeight: 600, color: T.muted, textAlign: "right", flexShrink: 0 }}>{stage.stage}</div>
                  <div style={{ flex: 1 }}>
                    <ProgressBar value={stage.pct} color={stage.color} height={20} />
                  </div>
                  <div style={{ width: 60, textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: stage.color }}>{stage.count}</span>
                    <span style={{ fontSize: 11, color: T.muted, marginLeft: 4 }}>{stage.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ padding: "8px 12px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                <div style={{ fontSize: 11, color: T.muted }}>Open Rate</div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 20, color: T.gold }}>{deliveryFunnel[2].pct}%</div>
                <div style={{ fontSize: 11, color: T.muted }}>Industry avg: 25%</div>
              </div>
              <div style={{ padding: "8px 12px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                <div style={{ fontSize: 11, color: T.muted }}>Click-Through Rate</div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 20, color: T.success }}>{deliveryFunnel[3].pct}%</div>
                <div style={{ fontSize: 11, color: T.muted }}>Industry avg: 8%</div>
              </div>
            </div>
          </Card>
        )}

        {/* Hourly open timeline */}
        {isSent && (
          <Card style={{ padding: 16, marginBottom: 12 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>⏰ Opens by Hour</h3>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={hourlyData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [v, "Opens"]} contentStyle={{ fontFamily: "IBM Plex Sans", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="opens" fill={T.gold} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: T.muted }}>Peak engagement: 10 AM — use this time for future campaigns</p>
          </Card>
        )}

        {/* Customer response table */}
        {isSent && (
          <Card style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>Customer Responses</h3>
            </div>
            {customerResponses.map((r, i) => {
              const rColor = r.status === "clicked" ? T.success : r.status === "opened" ? T.teal : T.muted;
              return (
                <div key={i} style={{ padding: "10px 16px", borderBottom: i < customerResponses.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: T.cream, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: T.navy, flexShrink: 0 }}>{r.name[0]}{r.name.split(" ")[1]?.[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: T.navy }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{r.response}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Badge color={rColor}>{r.status}</Badge>
                    {r.revenue > 0 && <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 12, color: T.success, marginTop: 3 }}>{formatINR(r.revenue)}</div>}
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {!isSent && (
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{c.status === "scheduled" ? "🕐" : "📝"}</div>
            <h3 style={{ margin: "0 0 8px", color: T.navy }}>{c.status === "scheduled" ? "Scheduled" : "Draft"}</h3>
            <p style={{ color: T.muted, fontSize: 14 }}>{c.status === "scheduled" ? `This campaign is scheduled to send on ${c.date}. Stats will appear after delivery.` : "This campaign is a draft. Edit and send it to see delivery stats here."}</p>
            <Button variant="teal" style={{ marginTop: 16 }} onClick={() => onNavigate("campaign-builder")}>
              {c.status === "draft" ? "✏️ Edit & Send" : "✏️ Edit Campaign"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SESSION 4 — ANALYTICS DEEP-DIVE SCREENS
// ═══════════════════════════════════════════════════════

// ── Revenue Detail Screen (RD-08) ────────────────────
function RevenueDetailScreen({ onNavigate }) {
  const [range, setRange] = useState("week");

  const weekData = MOCK.revenueWeek;
  const monthData = MOCK.revenueMonthly;
  const chartData = range === "week" ? weekData.map(d => ({ label: d.day, value: d.revenue }))
    : monthData.map(d => ({ label: d.month, value: d.revenue }));

  const totalRevenue = chartData.reduce((s, d) => s + d.value, 0);
  const avgTicket = 8083;
  const txCount = Math.round(totalRevenue / avgTicket);

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Revenue Detail" onBack={() => onNavigate("analytics")} />

      {/* Date range toggle */}
      <div style={{ backgroundColor: T.white, padding: "10px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
        {[["week", "This Week"], ["month", "6 Months"]].map(([val, label]) => (
          <button key={val} onClick={() => setRange(val)}
            style={{ padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, backgroundColor: range === val ? T.navy : T.cream, color: range === val ? T.white : T.muted, transition: "all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Headline KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Total Revenue", value: formatINR(totalRevenue), color: T.success, icon: "💰" },
            { label: "Transactions", value: txCount, color: T.teal, icon: "🛍️" },
            { label: "Avg Ticket", value: formatINR(avgTicket), color: T.gold, icon: "📊" },
          ].map((k, i) => (
            <Card key={i} style={{ padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 16, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{k.label}</div>
            </Card>
          ))}
        </div>

        {/* Revenue trend chart */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>
            Revenue Trend {range === "week" ? "(Last 7 Days)" : "(Last 6 Months)"}
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.teal} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={T.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={`${T.border}`} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.muted }} tickFormatter={v => formatINR(v)} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={v => [formatINRFull(v), "Revenue"]} contentStyle={{ fontFamily: "IBM Plex Sans", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke={T.teal} strokeWidth={2.5} fill="url(#revGrad4)" dot={{ fill: T.teal, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue by category */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>By Category</h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate("category-perf")}>Full Report →</Button>
          </div>
          {MOCK.revenueByCategory.slice(0, 5).map((cat, i) => {
            const maxRev = MOCK.revenueByCategory[0].revenue;
            const trendPos = cat.trend.startsWith("+");
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{cat.name}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: trendPos ? T.success : T.alert }}>{cat.trend}</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 700, color: T.navy }}>{formatINR(cat.revenue)}</span>
                  </div>
                </div>
                <ProgressBar value={cat.revenue} max={maxRev} color={i === 0 ? T.gold : T.teal} height={6} />
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{cat.units} units · Avg ₹{(cat.avgTicket / 1000).toFixed(0)}K</div>
              </div>
            );
          })}
        </Card>

        {/* Revenue by staff */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>By Staff Member</h3>
          {MOCK.revenueByStaff.map((st, i) => {
            const maxRev = MOCK.revenueByStaff[0].revenue;
            const rate = ((st.conversions / st.sessions) * 100).toFixed(0);
            return (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < MOCK.revenueByStaff.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: T.cream, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: T.navy }}>{st.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: T.navy }}>{st.name}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{st.conversions} sales · {rate}% conv.</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: T.success }}>{formatINR(st.revenue)}</span>
                </div>
                <ProgressBar value={st.revenue} max={maxRev} color={i === 0 ? T.gold : T.teal} height={5} />
              </div>
            );
          })}
        </Card>

        {/* AI Insight */}
        <Card style={{ padding: 14, backgroundColor: `${T.teal}08`, border: `1px solid ${T.teal}20` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>AI Revenue Insight</div>
              <p style={{ margin: 0, fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>Banarasi Georgette drove 34% more revenue vs. last week — festival demand building. Paithani silk down 41%; consider a targeted WhatsApp campaign to move stock before Navratri.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Category Performance Screen (RD-23) ──────────────
function CategoryPerformanceScreen({ onNavigate }) {
  const [sortBy, setSortBy] = useState("revenue");

  const categories = [...MOCK.revenueByCategory].sort((a, b) => {
    if (sortBy === "revenue") return b.revenue - a.revenue;
    if (sortBy === "units") return b.units - a.units;
    return parseFloat(b.trend) - parseFloat(a.trend);
  });

  // Heatmap data: rows = categories, cols = weeks
  const heatmapData = [
    { cat: "Kanjivaram", w1: 85, w2: 72, w3: 91, w4: 88, w5: 95, w6: 82 },
    { cat: "Banarasi", w1: 62, w2: 78, w3: 88, w4: 94, w5: 98, w6: 91 },
    { cat: "Chanderi", w1: 55, w2: 60, w3: 58, w4: 62, w5: 65, w6: 61 },
    { cat: "Tant", w1: 70, w2: 75, w3: 82, w4: 88, w5: 91, w6: 84 },
    { cat: "Pochampally", w1: 48, w2: 44, w3: 41, w4: 39, w5: 42, w6: 38 },
    { cat: "Mysore Silk", w1: 30, w2: 28, w3: 25, w4: 22, w5: 20, w6: 18 },
  ];

  const heatColor = (v) => {
    if (v >= 85) return { bg: "#1B4965", text: T.white };
    if (v >= 70) return { bg: "#5FA8D3", text: T.white };
    if (v >= 55) return { bg: "#BDD5EA", text: T.navy };
    if (v >= 40) return { bg: "#F0EAE0", text: T.navy };
    return { bg: "#FFEBEE", text: T.alert };
  };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Category Performance" onBack={() => onNavigate("analytics")} />

      <div style={{ padding: "14px 16px" }}>
        {/* Sort toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["revenue", "Revenue"], ["units", "Units Sold"], ["trend", "Trend"]].map(([val, label]) => (
            <button key={val} onClick={() => setSortBy(val)}
              style={{ padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, backgroundColor: sortBy === val ? T.navy : T.cream, color: sortBy === val ? T.white : T.muted, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Category ranking bars */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>Category Rankings</h3>
          {categories.map((cat, i) => {
            const maxRev = categories[0].revenue;
            const trendPos = cat.trend.startsWith("+");
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div key={cat.name} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 16, width: 24 }}>{medals[i] || `${i + 1}.`}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{cat.name}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: trendPos ? T.success : T.alert }}>{cat.trend} MoM</span>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 700, color: T.navy }}>{formatINR(cat.revenue)}</span>
                      </div>
                    </div>
                    <ProgressBar value={sortBy === "units" ? cat.units : cat.revenue} max={sortBy === "units" ? categories[0].units : maxRev} color={i < 3 ? T.teal : T.muted} height={7} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, paddingLeft: 32, fontSize: 11, color: T.muted }}>
                  <span>📦 {cat.units} units</span>
                  <span>🏷️ Avg {formatINR(cat.avgTicket)}</span>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Demand heatmap */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: T.navy }}>Demand Heatmap</h3>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: T.muted }}>Sales intensity by category over last 6 weeks (darker = higher demand)</p>
          <div style={{ overflowX: "auto" }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "80px repeat(6, 1fr)", gap: 3, marginBottom: 3 }}>
              <div />
              {["W1", "W2", "W3", "W4", "W5", "W6"].map(w => (
                <div key={w} style={{ textAlign: "center", fontSize: 10, color: T.muted, fontWeight: 600 }}>{w}</div>
              ))}
            </div>
            {heatmapData.map((row) => (
              <div key={row.cat} style={{ display: "grid", gridTemplateColumns: "80px repeat(6, 1fr)", gap: 3, marginBottom: 3 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.navy, display: "flex", alignItems: "center" }}>{row.cat}</div>
                {[row.w1, row.w2, row.w3, row.w4, row.w5, row.w6].map((v, i) => {
                  const c = heatColor(v);
                  return (
                    <div key={i} style={{ height: 28, borderRadius: 4, backgroundColor: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: c.text }}>
                      {v}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, fontSize: 11, color: T.muted, flexWrap: "wrap" }}>
            {[["#1B4965", "90–100 (Hot)"], ["#5FA8D3", "70–89 (Strong)"], ["#BDD5EA", "55–69 (Moderate)"], ["#F0EAE0", "40–54 (Weak)"], ["#FFEBEE", "<40 (Slow)"]].map(([col, label]) => (
              <span key={col} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: col, display: "inline-block" }} />
                {label}
              </span>
            ))}
          </div>
        </Card>

        {/* AI recommendation */}
        <Card style={{ padding: 14, backgroundColor: `${T.gold}0A`, border: `1px solid ${T.gold}30` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>AI Category Insight</div>
              <p style={{ margin: 0, fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>Banarasi and Tant are gaining momentum heading into festival season. Mysore Silk and Pochampally are cooling — consider bundling with trending categories or featuring them on the Smart Mirror to increase trials.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Store Health Score Screen (RD-27) ─────────────────
function StoreHealthScreen({ onNavigate }) {
  const overallScore = MOCK.store.healthScore; // 78
  const [expanded, setExpanded] = useState(null);

  const statusColor = { green: T.success, amber: T.gold, red: T.alert };
  const statusLabel = { green: "Healthy", amber: "Needs Attention", red: "Critical" };
  const statusBg = { green: T.successLight, amber: T.amberLight, red: T.alertLight };

  const overallColor = overallScore >= 80 ? T.success : overallScore >= 60 ? T.gold : T.alert;

  // Calculate weighted score bar width
  const weightedContrib = MOCK.healthDimensions.map(d => ({
    ...d,
    weighted: (d.score * d.weight) / 100,
  }));

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Store Health Score" onBack={() => onNavigate("analytics")} />

      {/* Big score hero */}
      <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.teal} 100%)`, padding: "24px 20px 28px", textAlign: "center" }}>
        <HealthScoreGauge score={overallScore} size={180} />
        <div style={{ marginTop: -8 }}>
          <div style={{ fontSize: 13, color: `${T.white}AA`, marginBottom: 4 }}>Overall Store Health</div>
          <Badge color={overallColor} bg={`${overallColor}22`}>
            {overallScore >= 80 ? "🟢 Healthy" : overallScore >= 60 ? "🟡 Needs Attention" : "🔴 Critical"}
          </Badge>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: `${T.white}80`, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
            Score built from 6 dimensions — weighted by business impact. Updated every 4 hours.
          </p>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Score composition */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>Score Breakdown</h3>
          {MOCK.healthDimensions.map((dim, i) => (
            <div key={i}>
              <div onClick={() => setExpanded(expanded === i ? null : i)}
                style={{ display: "flex", gap: 12, alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
                <span style={{ fontSize: 22, width: 28, flexShrink: 0 }}>{dim.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{dim.name}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: T.muted }}>{dim.weight}% weight</span>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 16, color: statusColor[dim.status] }}>{dim.score}</span>
                    </div>
                  </div>
                  <ProgressBar value={dim.score} max={100} color={statusColor[dim.status]} height={7} />
                </div>
                <Badge color={statusColor[dim.status]} bg={statusBg[dim.status]}>{statusLabel[dim.status]}</Badge>
                <span style={{ color: T.muted, fontSize: 14 }}>{expanded === i ? "▲" : "▾"}</span>
              </div>

              {expanded === i && (
                <div style={{ padding: "12px 14px", backgroundColor: statusBg[dim.status], borderRadius: T.radiusSm, marginTop: -6, marginBottom: 12, border: `1px solid ${statusColor[dim.status]}25` }}>
                  <p style={{ margin: "0 0 8px", fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{dim.detail}</p>
                  {dim.actions.length > 0 && (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 12, color: T.navy, marginBottom: 6 }}>Recommended Actions:</div>
                      {dim.actions.map((action, ai) => (
                        <div key={ai} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                          <span style={{ color: statusColor[dim.status], fontSize: 13, fontWeight: 700, flexShrink: 0 }}>→</span>
                          <span style={{ fontSize: 13, color: T.navy }}>{action}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </Card>

        {/* Weighted contribution chart */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Weighted Contribution</h3>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={weightedContrib} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
              <XAxis type="number" domain={[0, 25]} tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: T.navy }} axisLine={false} tickLine={false} width={110} />
              <Tooltip formatter={(v) => [v.toFixed(1), "Points contributed"]} contentStyle={{ fontFamily: "IBM Plex Sans", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="weighted" radius={[0, 4, 4, 0]}
                fill={T.teal}
                label={{ position: "right", fontSize: 11, fill: T.navy, formatter: v => v.toFixed(1) }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Trend + quick actions */}
        <Card style={{ padding: 14 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Quick Wins to Improve Score</h3>
          {[
            { action: "Upload 50 more sarees", impact: "+3 pts", screen: "upload", icon: "📷" },
            { action: "Clear 3 sarees aged >120 days", impact: "+2 pts", screen: "aging", icon: "⚠️" },
            { action: "Run a WhatsApp re-engagement campaign", impact: "+2 pts", screen: "campaign-builder", icon: "📱" },
            { action: "Remind staff to log all mirror sessions", impact: "+1 pt", screen: "staff", icon: "🪞" },
          ].map((item, i) => (
            <div key={i} onClick={() => onNavigate(item.screen)}
              style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: T.radiusSm, cursor: "pointer", marginBottom: 6, backgroundColor: T.cream }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = `${T.teal}0A`}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = T.cream}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div style={{ flex: 1, fontSize: 13, color: T.navy }}>{item.action}</div>
              <Badge color={T.success}>{item.impact}</Badge>
              <span style={{ color: T.muted }}>›</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── Demand Forecasting Screen (RD-25) ─────────────────
function DemandForecastScreen({ onNavigate }) {
  const [horizon, setHorizon] = useState("30d");
  const data = MOCK.demandForecast[horizon];

  // Combine actual + forecast into single series for the chart
  const chartData = data.map(d => ({
    week: d.week,
    actual: d.actual,
    forecast: d.forecast,
    lower: d.lower,
    upper: d.upper,
  }));

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Demand Forecasting" onBack={() => onNavigate("analytics")} />

      {/* Horizon tabs */}
      <div style={{ backgroundColor: T.white, padding: "10px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
        {[["30d", "30 Days"], ["60d", "60 Days"], ["90d", "90 Days"]].map(([val, label]) => (
          <button key={val} onClick={() => setHorizon(val)}
            style={{ padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, backgroundColor: horizon === val ? T.navy : T.cream, color: horizon === val ? T.white : T.muted, transition: "all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* AI model banner */}
        <div style={{ padding: "12px 14px", backgroundColor: `${T.navy}08`, borderRadius: T.radius, border: `1px solid ${T.navy}15`, marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 22 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>Chronos-2 Forecast Engine</div>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>
              Trained on your store's 6-month sales history. Festival calendar + seasonal signals factored in. Shaded band shows 80% confidence interval.
            </p>
          </div>
        </div>

        {/* Forecast chart */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: T.navy }}>Revenue Forecast — Next {horizon}</h3>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: T.muted }}>Solid line = actual · Dashed = forecast · Band = confidence range</p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${T.border}`} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: T.muted }} tickFormatter={v => formatINR(v)} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(v, name) => [v ? formatINRFull(v) : "—", name === "actual" ? "Actual" : name === "forecast" ? "Forecast" : name]}
                contentStyle={{ fontFamily: "IBM Plex Sans", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="actual" stroke={T.navy} strokeWidth={2.5} dot={{ fill: T.navy, r: 4 }} connectNulls={false} name="actual" />
              <Line type="monotone" dataKey="forecast" stroke={T.gold} strokeWidth={2} strokeDasharray="6 3" dot={{ fill: T.gold, r: 3 }} connectNulls={false} name="forecast" />
              <Line type="monotone" dataKey="upper" stroke={`${T.gold}40`} strokeWidth={1} dot={false} connectNulls={false} name="upper" />
              <Line type="monotone" dataKey="lower" stroke={`${T.gold}40`} strokeWidth={1} dot={false} connectNulls={false} name="lower" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, fontSize: 11, color: T.muted, marginTop: 8 }}>
            <span><span style={{ color: T.navy, fontWeight: 700 }}>—</span> Actual revenue</span>
            <span><span style={{ color: T.gold, fontWeight: 700 }}>- -</span> Forecast</span>
            <span><span style={{ color: `${T.gold}80`, fontWeight: 700 }}>~</span> 80% confidence</span>
          </div>
        </Card>

        {/* Festival overlays */}
        <Card style={{ padding: 14, marginBottom: 14, background: `linear-gradient(135deg, ${T.navy}06, ${T.teal}10)` }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: T.navy }}>📅 Festival Demand Signals</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK.festivals.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", backgroundColor: `${f.color}12`, borderRadius: T.radiusSm, border: `1px solid ${f.color}25` }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: f.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{f.name}</span>
                  <span style={{ fontSize: 12, color: T.muted, marginLeft: 8 }}>{f.date}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.impact}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>in {f.daysAway} days</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category forecast table */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>Category-Level Forecast (Next Month)</h3>
          </div>
          {MOCK.forecastByCategory.map((cat, i) => {
            const trendPos = cat.change > 0;
            const trendIcon = cat.trend === "rising" ? "📈" : cat.trend === "falling" ? "📉" : "➡️";
            return (
              <div key={i} style={{ padding: "12px 16px", borderBottom: i < MOCK.forecastByCategory.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>{trendIcon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>Confidence: {cat.confidence}%</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: T.navy }}>{formatINR(cat.nextMonth)}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: trendPos ? T.success : T.alert }}>
                    {trendPos ? "▲" : "▼"} {Math.abs(cat.change)}%
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Action prompt */}
        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <Button fullWidth variant="teal" onClick={() => onNavigate("reorder")}>
            📦 Reorder Suggestions →
          </Button>
          <Button fullWidth variant="ghost" onClick={() => onNavigate("wedding-season")}>
            💍 Wedding Season Plan →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Dead Stock Curve Screen (RD-26) ───────────────────
function DeadStockCurveScreen({ onNavigate }) {
  const totalValue = MOCK.deadStockCurve.reduce((s, b) => s + b.value, 0);
  const atRiskValue = MOCK.deadStockCurve.slice(2).reduce((s, b) => s + b.value, 0); // 60d+
  const atRiskCount = MOCK.deadStockCurve.slice(2).reduce((s, b) => s + b.count, 0);

  const bucketColor = (idx) => {
    if (idx === 0) return T.success;
    if (idx === 1) return T.gold;
    if (idx === 2) return T.amber;
    return T.alert;
  };

  // Line chart showing aging velocity
  const velocityData = [
    { age: "0d", count: 312 },
    { age: "30d", count: 114 },
    { age: "60d", count: 52 },
    { age: "90d", count: 21 },
    { age: "120d", count: 7 },
    { age: "150d", count: 2 },
  ];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Dead Stock Curve" onBack={() => onNavigate("analytics")} />

      {/* Alert banner */}
      {atRiskCount > 0 && (
        <div style={{ margin: "12px 16px 0", padding: "12px 16px", backgroundColor: T.alertLight, borderRadius: T.radius, border: `1px solid ${T.alert}30`, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 24 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.alert }}>{atRiskCount} sarees at dead-stock risk</div>
            <div style={{ fontSize: 12, color: T.textMid, marginTop: 2 }}>{formatINR(atRiskValue)} in inventory value at risk of write-off</div>
          </div>
          <Button size="sm" variant="danger" onClick={() => onNavigate("aging")}>Take Action</Button>
        </div>
      )}

      <div style={{ padding: "14px 16px" }}>
        {/* Summary KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Total SKUs", value: 312, color: T.navy, icon: "📦" },
            { label: "At Risk (60d+)", value: atRiskCount, color: T.alert, icon: "⚠️" },
            { label: "Value at Risk", value: formatINR(atRiskValue), color: T.alert, icon: "💸" },
          ].map((k, i) => (
            <Card key={i} style={{ padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 16, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{k.label}</div>
            </Card>
          ))}
        </div>

        {/* Aging distribution bars */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>Inventory Age Distribution</h3>
          {MOCK.deadStockCurve.map((bucket, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: bucketColor(i) }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{bucket.bucket}</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: T.muted }}>{bucket.count} SKUs</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 700, color: bucketColor(i) }}>{formatINR(bucket.value)}</span>
                </div>
              </div>
              <ProgressBar value={bucket.pct} max={100} color={bucketColor(i)} height={10} />
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{bucket.pct}% of total inventory</div>
            </div>
          ))}
        </Card>

        {/* Decay curve line chart */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: T.navy }}>Inventory Decay Curve</h3>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: T.muted }}>How many SKUs survive to each age milestone</p>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={velocityData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.alert} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.alert} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="age" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} width={32} />
              <Tooltip formatter={v => [v, "SKUs still in stock"]} contentStyle={{ fontFamily: "IBM Plex Sans", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke={T.alert} strokeWidth={2.5} fill="url(#decayGrad)" dot={{ fill: T.alert, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: T.muted }}>Healthy stores clear >95% of stock within 90 days. Your 90-day clearance rate: <span style={{ fontWeight: 700, color: T.gold }}>93.3%</span></p>
        </Card>

        {/* Action triggers */}
        <Card style={{ padding: 14 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Automated Action Triggers</h3>
          {[
            { threshold: "60 days", trigger: "Auto-flag in Aging Inventory report", status: "active", color: T.gold },
            { threshold: "90 days", trigger: "Alert sent to store owner via WhatsApp", status: "active", color: T.amber },
            { threshold: "120 days", trigger: "Auto-suggest clearance pricing + WhatsApp blast", status: "active", color: T.alert },
            { threshold: "150 days", trigger: "Escalation: Super Admin notified for intervention", status: "configured", color: T.alert },
          ].map((rule, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: T.radiusSm, marginBottom: 6, backgroundColor: T.cream }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: rule.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: rule.color }}>@{rule.threshold}: </span>
                <span style={{ fontSize: 12, color: T.navy }}>{rule.trigger}</span>
              </div>
              <Badge color={rule.status === "active" ? T.success : T.muted}>{rule.status === "active" ? "ON" : "OFF"}</Badge>
            </div>
          ))}
          <Button fullWidth variant="amber" style={{ marginTop: 12 }} onClick={() => onNavigate("aging")}>
            ⚠️ View All Aging Sarees →
          </Button>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SESSION 5 — STAFF, SETTINGS & ADMIN SCREENS
// ═══════════════════════════════════════════════════════

// ── Staff Detail Screen (RD-29) ───────────────────────
function StaffDetailScreen({ staffMember, onNavigate }) {
  const s = staffMember || MOCK.staff[0];
  const [activeTab, setActiveTab] = useState("overview");
  const [showPIN, setShowPIN] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [note, setNote] = useState(s.coachingNotes);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const convRate = ((s.conversions / s.sessions) * 100).toFixed(0);
  const rankColor = s.conversions >= 10 ? T.gold : s.conversions >= 7 ? T.teal : T.muted;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "shifts", label: "Shift History" },
    { id: "coaching", label: "Coaching" },
  ];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Staff Profile" onBack={() => onNavigate("staff")} />

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, ${T.teal} 100%)`, padding: "20px 20px 24px" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${rankColor}33`, border: `3px solid ${rankColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, color: T.white, flexShrink: 0 }}>
            {s.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: T.white }}>{s.name}</h2>
            <div style={{ fontSize: 13, color: `${T.white}AA` }}>{s.role} · {s.shift} Shift · Since {s.joined}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {s.badges.map((badge, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 12, backgroundColor: `${T.white}20`, color: T.white }}>{badge}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 16 }}>
          {[
            { label: "Revenue", value: formatINR(s.revenue), color: T.gold },
            { label: "Sessions", value: s.sessions, color: T.white },
            { label: "Conv. Rate", value: `${convRate}%`, color: convRate >= 40 ? "#4caf50" : convRate >= 30 ? T.gold : "#ef5350" },
            { label: "Upsell", value: `${s.upsellRate}%`, color: T.accentBlue },
          ].map((k, i) => (
            <div key={i} style={{ backgroundColor: `${T.white}14`, borderRadius: T.radiusSm, padding: "10px 6px", textAlign: "center" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 15, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: `${T.white}80`, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ backgroundColor: T.white, borderBottom: `1px solid ${T.border}`, display: "flex" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: "12px 8px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: activeTab === tab.id ? T.teal : T.muted, borderBottom: `2px solid ${activeTab === tab.id ? T.teal : "transparent"}`, transition: "all 0.15s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 16px" }}>
        {activeTab === "overview" && (
          <>
            {/* Quick stats */}
            <Card style={{ padding: 16, marginBottom: 12 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Performance This Month</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Conversion Rate", value: convRate, max: 100, color: convRate >= 40 ? T.success : T.gold, suffix: "%" },
                  { label: "Upsell Rate", value: s.upsellRate, max: 100, color: T.teal, suffix: "%" },
                  { label: "Avg Session Time", value: parseInt(s.avgSessionTime), max: 30, color: T.accentBlue, suffix: " min" },
                ].map((m, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: T.textMid }}>{m.label}</span>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}{m.suffix}</span>
                    </div>
                    <ProgressBar value={m.value} max={m.max} color={m.color} height={6} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact & admin */}
            <Card style={{ padding: 16, marginBottom: 12 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Details</h3>
              {[
                { label: "Phone", value: s.phone },
                { label: "Shift", value: `${s.shift} (9AM–2PM)` },
                { label: "Absent Days (month)", value: `${s.absentDays} day${s.absentDays !== 1 ? "s" : ""}` },
                { label: "Login PIN", value: showPIN ? s.pin : "••••" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", paddingBottom: 10, marginBottom: 10, borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ fontSize: 13, color: T.muted, width: 120, flexShrink: 0 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.navy, flex: 1, fontFamily: item.label === "Login PIN" ? "JetBrains Mono, monospace" : undefined }}>{item.value}</span>
                  {item.label === "Login PIN" && (
                    <button onClick={() => setShowPIN(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: T.teal, fontWeight: 600 }}>{showPIN ? "Hide" : "Show"}</button>
                  )}
                </div>
              ))}
            </Card>

            {/* Actions */}
            {(() => {
              const [editModal, setEditModal] = useState(false);
              return (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Button variant="ghost" fullWidth onClick={() => setEditModal(true)}>✏️ Edit Profile</Button>
                    <Button variant="danger" fullWidth onClick={() => {
                      if (window.confirm(`Deactivate ${s.name}?\n\nThey will immediately lose access to all store devices.`)) {
                        onNavigate("staff");
                      }
                    }}>🚫 Deactivate</Button>
                  </div>
                  <AddStaffModal isOpen={editModal} staffToEdit={s} onClose={() => setEditModal(false)} onSave={() => {}} />
                </>
              );
            })()}
          </>
        )}

        {activeTab === "shifts" && (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>Last 5 Shifts</h3>
            </div>
            {s.shiftHistory.map((sh, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: i < s.shiftHistory.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{sh.date}</span>
                  <span style={{ fontSize: 12, color: T.muted }}>{sh.duration}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {[
                    { label: "Sessions", value: sh.sessions, color: T.teal },
                    { label: "Sales", value: sh.conversions, color: T.success },
                    { label: "Revenue", value: formatINR(sh.revenue), color: T.navy },
                  ].map((m, mi) => (
                    <div key={mi} style={{ textAlign: "center", padding: "8px 4px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: T.muted }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        )}

        {activeTab === "coaching" && (
          <>
            <Card style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>📝 Manager's Coaching Notes</h3>
                <button onClick={() => setEditNote(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.teal, fontWeight: 600 }}>{editNote ? "Save" : "Edit"}</button>
              </div>
              {editNote ? (
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={4}
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, fontFamily: "IBM Plex Sans, sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box", color: T.text }} />
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: T.textMid, lineHeight: 1.7 }}>{note}</p>
              )}
            </Card>

            {/* AI coaching suggestion */}
            <Card style={{ padding: 14, backgroundColor: `${T.teal}08`, border: `1px solid ${T.teal}20` }}>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 22 }}>🤖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>AI Coaching Suggestion</div>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>
                    {s.name.split(" ")[0]}'s conversion rate ({convRate}%) is {convRate >= 40 ? "above" : "below"} store average (38%). 
                    {convRate < 40 ? " Focus on closing techniques — suggest role-play with top performer Mohan Kumar." : " Encourage mentoring junior staff to spread best practices."}
                  </p>
                  <Button size="sm" variant="teal" onClick={() => onNavigate("ai-coaching", s)}>
                    View Full AI Coaching Report →
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── Store Settings Hub (RD-30 + sub-screens) ─────────
function StoreSettingsScreen({ store, essentialMode, onToggleEssential, onLogout, onNavigate, onReplayTour }) {
  const [activeSection, setActiveSection] = useState("main");

  const settingsSections = [
    { id: "store-profile", icon: "🏪", label: "Store Profile", desc: "Name, address, GSTIN, business hours", color: T.navy },
    { id: "staff-mgmt", icon: "👥", label: "Staff & Roles", desc: "Add staff, set PINs, manage permissions", color: T.teal, navigate: "staff" },
    { id: "notifications", icon: "🔔", label: "Notifications", desc: "Push, WhatsApp & email alert settings", color: T.gold, navigate: "notifications" },
    { id: "billing", icon: "💳", label: "Billing & Subscription", desc: `${store.plan} plan · ₹15,000/month`, color: T.success, navigate: "billing" },
    { id: "dpdp", icon: "🔐", label: "Privacy & DPDP", desc: "Consent dashboard, data deletion", color: "#7B1FA2", navigate: "dpdp-consent" },
    { id: "connected-apps", icon: "🔗", label: "Connected Apps", desc: "Tally, WhatsApp, Razorpay sync health", color: T.teal, navigate: "connected-apps" },
    { id: "morning-briefing", icon: "☀️", label: "Morning WhatsApp Briefing", desc: "Daily 7AM store summary on WhatsApp", color: T.gold, navigate: "morning-briefing" },
    { id: "photo-guide", icon: "📷", label: "Photo Booth Guide", desc: "Best practices for saree photography", color: T.accentBlue, navigate: "photo-guide" },
    { id: "data-export", icon: "📤", label: "Export Data", desc: "Download inventory, customers, sales as CSV", color: T.amber, navigate: "data-export" },
    { id: "support", icon: "💬", label: "Support & Help", desc: "FAQ, raise a ticket, contact Wearify team", color: T.teal, navigate: "support" },
  ];

  if (activeSection === "store-profile") {
    return <StoreProfileSection store={store} onBack={() => setActiveSection("main")} />;
  }

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <div style={{ padding: "16px 20px 12px", backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>Settings</h2>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Subscription card */}
        <Card style={{ padding: 16, marginBottom: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`, color: T.white }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>Active Subscription</div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{store.plan} Plan</div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>₹15,000/month · Next billing Apr 22</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 36 }}>⭐</span>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Active ✓</div>
            </div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: 12, backgroundColor: `${T.white}20`, color: T.white, border: `1px solid ${T.white}40` }}
            onClick={() => onNavigate("billing")}>Manage Subscription →</Button>
        </Card>

        {/* Essential Mode toggle */}
        <Card style={{ padding: "14px 16px", marginBottom: 10, border: `1px solid ${essentialMode ? T.gold : T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>📱 Essential Mode</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Simplified view — ideal for non-digital-savvy staff</div>
            </div>
            <div onClick={onToggleEssential} style={{ width: 48, height: 26, borderRadius: 13, backgroundColor: essentialMode ? T.gold : T.border, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: T.white, position: "absolute", top: 3, left: essentialMode ? 24 : 3, transition: "left 0.2s", boxShadow: T.shadow }} />
            </div>
          </div>
        </Card>

        {/* Settings list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {settingsSections.map((sec) => (
            <Card key={sec.id} onClick={() => sec.navigate ? onNavigate(sec.navigate) : setActiveSection(sec.id)}
              style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: `${sec.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {sec.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{sec.label}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{sec.desc}</div>
                </div>
                <span style={{ color: T.muted, fontSize: 20 }}>›</span>
              </div>
            </Card>
          ))}
        </div>

        <Button variant="ghost" fullWidth onClick={onReplayTour} style={{ marginBottom: 10 }}>🗺️ Replay Setup Tour</Button>
        <Button variant="danger" fullWidth onClick={onLogout}>Logout from Wearify</Button>
        <p style={{ textAlign: "center", fontSize: 11, color: T.muted, marginTop: 10 }}>Wearify v2.1.0 · Phygify Technoservices Pvt. Ltd.</p>
      </div>
    </div>
  );
}

// ── Store Profile sub-section ─────────────────────────
function StoreProfileSection({ store, onBack }) {
  const [form, setForm] = useState({
    name: store.name, owner: store.owner, phone: store.phone,
    city: store.city, state: store.state, gstin: store.gstin,
    address: "Shop 12, Vishwanath Gali, Varanasi", pincode: "221001",
    openTime: "10:00", closeTime: "20:00", closedDays: "Sunday",
  });
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="Store Profile" onBack={onBack}
        actions={<Button size="sm" variant="teal" onClick={() => setSaved(true)}>Save</Button>} />
      <div style={{ padding: 16 }}>
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>Business Info</h3>
          <Input label="Store Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Input label="Owner Name" value={form.owner} onChange={v => setForm(f => ({ ...f, owner: v }))} />
          <Input label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} type="tel" />
          <Input label="GSTIN" value={form.gstin} onChange={v => setForm(f => ({ ...f, gstin: v }))} hint="15-digit GST Identification Number" />
        </Card>
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>Address</h3>
          <Input label="Street Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="City" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} />
            <Input label="Pincode" value={form.pincode} onChange={v => setForm(f => ({ ...f, pincode: v }))} />
          </div>
          <Select label="State" value={form.state} onChange={v => setForm(f => ({ ...f, state: v }))}
            options={["Uttar Pradesh","Maharashtra","Tamil Nadu","Karnataka","West Bengal","Rajasthan","Gujarat","Telangana","Odisha"].map(s => ({ value: s, label: s }))} />
        </Card>
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>Business Hours</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Opening Time" value={form.openTime} onChange={v => setForm(f => ({ ...f, openTime: v }))} type="time" />
            <Input label="Closing Time" value={form.closeTime} onChange={v => setForm(f => ({ ...f, closeTime: v }))} type="time" />
          </div>
          <Select label="Weekly Off" value={form.closedDays} onChange={v => setForm(f => ({ ...f, closedDays: v }))}
            options={["Sunday","Monday","Tuesday","No weekly off"].map(d => ({ value: d, label: d }))} />
        </Card>
        {saved && <div style={{ padding: "10px 16px", backgroundColor: T.successLight, borderRadius: T.radiusSm, color: T.success, fontWeight: 600, fontSize: 13, textAlign: "center" }}>✅ Store profile saved successfully</div>}
      </div>
    </div>
  );
}

// ── Notification Preferences (RD-31) ─────────────────
function NotificationsScreen({ onNavigate }) {
  const [prefs, setPrefs] = useState({ ...MOCK.notifications });
  const [toast, setToast] = useState({ visible: false, message: "" });

  const toggle = (key, channel) => {
    setPrefs(prev => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  };

  const handleSave = () => {
    setToast({ visible: true, message: "Notification preferences saved ✓" });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="Notification Preferences" onBack={() => onNavigate("settings")}
        actions={<Button size="sm" variant="teal" onClick={handleSave}>Save</Button>} />

      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, backgroundColor: T.white, borderRadius: T.radius, border: `1px solid ${T.border}`, marginBottom: 14, overflow: "hidden" }}>
          {["Alert Type", "Push", "WhatsApp", "Email"].map((h, i) => (
            <div key={i} style={{ padding: "10px 8px", backgroundColor: T.cream, fontSize: 11, fontWeight: 700, color: T.muted, textAlign: i === 0 ? "left" : "center", gridColumn: i === 0 ? "span 1" : "span 1", display: i === 0 ? "block" : "block" }}>{h}</div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.entries(prefs).map(([key, pref]) => (
            <Card key={key} style={{ padding: "12px 16px" }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{pref.label}</div>
                {pref.threshold && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Triggers when threshold met</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["push", "whatsapp", "email"].map((channel) => {
                  const icons = { push: "📲", whatsapp: "💬", email: "📧" };
                  const active = pref[channel];
                  return (
                    <button key={channel} onClick={() => toggle(key, channel)}
                      style={{ flex: 1, padding: "8px 4px", border: `2px solid ${active ? T.teal : T.border}`, borderRadius: T.radiusSm, backgroundColor: active ? `${T.teal}0C` : T.cream, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s" }}>
                      <span style={{ fontSize: 18 }}>{icons[channel]}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: active ? T.teal : T.muted }}>{channel[0].toUpperCase() + channel.slice(1)}</span>
                      <span style={{ fontSize: 10, color: active ? T.success : T.muted, fontWeight: 600 }}>{active ? "ON" : "OFF"}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 14, padding: "12px 14px", backgroundColor: `${T.teal}08`, borderRadius: T.radius, border: `1px solid ${T.teal}20` }}>
          <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>
            📱 WhatsApp notifications are sent to your registered business number. Push notifications require the Wearify app to be installed on your phone.
          </p>
        </div>

        <Button fullWidth variant="primary" style={{ marginTop: 14 }} onClick={handleSave}>Save Preferences</Button>
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── Billing & Subscription (RD-32) ────────────────────
function BillingScreen({ onNavigate }) {
  const b = MOCK.billing;
  const [showPlans, setShowPlans] = useState(false);

  const planColors = { Professional: T.teal, Starter: T.muted, Enterprise: T.gold };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Billing & Subscription" onBack={() => onNavigate("settings")} />

      <div style={{ padding: "14px 16px" }}>
        {/* Current plan */}
        <Card style={{ padding: 16, marginBottom: 14, background: `linear-gradient(135deg, ${T.navy} 0%, ${T.teal} 100%)`, color: T.white }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Current Plan</div>
              <div style={{ fontWeight: 800, fontSize: 24 }}>{b.plan}</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                ₹{b.amount.toLocaleString("en-IN")}/month · billed {b.billingCycle}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>Next billing: {b.nextBillingDate}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 40 }}>⭐</span>
              <div style={{ marginTop: 4 }}>
                <Badge color={T.gold} bg={`${T.gold}33`}>Active ✓</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Plan features */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>What's Included</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowPlans(v => !v)}>Compare Plans</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {b.planFeatures[b.plan].map((feature, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: T.success, fontSize: 14, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: T.navy }}>{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Plan comparison */}
        {showPlans && (
          <Card style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>Available Plans</h3>
            </div>
            {["Starter", "Professional", "Enterprise"].map((plan, i) => {
              const isCurrent = plan === b.plan;
              const prices = { Starter: 8000, Professional: 15000, Enterprise: 35000 };
              return (
                <div key={plan} style={{ padding: "14px 16px", borderBottom: i < 2 ? `1px solid ${T.border}` : "none", backgroundColor: isCurrent ? `${T.teal}06` : T.white }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{plan}</span>
                        {isCurrent && <Badge color={T.teal}>Current</Badge>}
                      </div>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 18, color: planColors[plan], marginTop: 2 }}>₹{prices[plan].toLocaleString("en-IN")}/mo</div>
                    </div>
                    {!isCurrent && (
                      <Button size="sm" variant={plan === "Enterprise" ? "gold" : "ghost"}
                        onClick={() => {
                          if (window.confirm(`Switch to ${plan} plan at ₹${prices[plan].toLocaleString("en-IN")}/month?\n\nYou will be charged the new amount from your next billing date (${b.nextBillingDate}). Razorpay will process the payment automatically.`)) {
                            alert(`Plan change to ${plan} initiated. You'll receive a WhatsApp confirmation.`);
                          }
                        }}>
                        Upgrade
                      </Button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {b.planFeatures[plan].slice(0, 3).map((f, fi) => (
                      <div key={fi} style={{ fontSize: 12, color: T.textMid }}>✓ {f}</div>
                    ))}
                    {b.planFeatures[plan].length > 3 && <div style={{ fontSize: 12, color: T.muted }}>+{b.planFeatures[plan].length - 3} more features</div>}
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {/* Payment method */}
        <Card style={{ padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>Payment Method</div>
              <div style={{ fontSize: 13, color: T.textMid, marginTop: 4 }}>
                {b.paymentMethod.brand} · UPI ID ending {b.paymentMethod.last4}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => {
              const newUPI = window.prompt("Enter new UPI ID (e.g. name@upi):");
              if (newUPI && newUPI.includes("@")) {
                alert(`UPI ID updated to ${newUPI}. Changes take effect from next billing cycle.`);
              } else if (newUPI) {
                alert("Invalid UPI ID format. Please enter a valid UPI ID (e.g. yourname@paytm).");
              }
            }}>Change</Button>
          </div>
        </Card>

        {/* Invoice history */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>Invoice History</h3>
          </div>
          {b.invoices.map((inv, i) => (
            <div key={inv.id} style={{ padding: "12px 16px", borderBottom: i < b.invoices.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>🧾</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: T.navy }}>{inv.id}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{inv.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: T.navy }}>₹{inv.amount.toLocaleString("en-IN")}</div>
                <Badge color={T.success}>{inv.status}</Badge>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: T.teal }}>⬇</button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── Photo Booth Guide (RD-34) ─────────────────────────
function PhotoBoothGuideScreen({ onNavigate }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Lighting Setup",
      icon: "💡",
      color: T.gold,
      tip: "Use natural daylight or place two white tube lights at 45° angles — one on each side of the saree. Avoid harsh shadows. Never shoot directly into a window.",
      do: ["Soft diffused light from two sides", "Shoot between 10AM–4PM for natural light", "Use a white wall or plain backdrop"],
      dont: ["Direct sunlight creating harsh shadows", "Single overhead light (creates dark folds)", "Flash — it washes out fabric texture"],
    },
    {
      title: "Front View",
      icon: "👗",
      color: T.teal,
      tip: "Drape the saree flat on a hanger or mannequin. Capture the full saree from head to hem. Ensure the pallu is visible and well-spread. Camera should be at chest height.",
      do: ["Full length visible — top to bottom", "Pallu draped naturally to show design", "Sharp focus on body of saree"],
      dont: ["Cropped image missing border or hem", "Crumpled or folded fabric", "Blurry or shaky shot"],
    },
    {
      title: "Back View",
      icon: "🔄",
      color: T.navy,
      tip: "Show the reverse side to help customers understand the weave quality. Flip the hanger or turn the mannequin. Same lighting rules apply.",
      do: ["Reverse side clearly visible", "Texture and weave pattern visible", "Even, consistent lighting"],
      dont: ["Skip this shot — customers look for it", "Poor lighting that hides weave quality"],
    },
    {
      title: "Pallu Detail",
      icon: "✨",
      color: "#7B1FA2",
      tip: "Close-up of the pallu (end piece). This is the most decorative part — buyers focus heavily on it. Use macro mode if available. Hold camera 30–40cm from fabric.",
      do: ["Fill the frame with pallu design", "Capture zari/embroidery detail clearly", "Multiple angles if design is complex"],
      dont: ["Blurry close-up (use macro mode)", "Pallu in shadow", "Hand visible in frame"],
    },
    {
      title: "Border Detail",
      icon: "🌺",
      color: T.alert,
      tip: "Photograph 20–30cm of the border to show weave pattern, width, and design motifs. Lay the saree on a flat surface for this shot.",
      do: ["Border fully in frame and in focus", "Lay flat — no folds obscuring design", "Show both warp and weft if distinct"],
      dont: ["Border partially out of frame", "Shooting from wrong angle losing motif detail"],
    },
  ];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Photo Booth Guide" onBack={() => onNavigate("settings")} />

      {/* Progress bar */}
      <div style={{ backgroundColor: T.white, padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Step {activeStep + 1} of {steps.length}: {steps[activeStep].title}</span>
          <span style={{ fontSize: 12, color: T.muted }}>{Math.round(((activeStep + 1) / steps.length) * 100)}% done</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {steps.map((s, i) => (
            <div key={i} onClick={() => setActiveStep(i)} style={{ flex: 1, height: 6, borderRadius: 99, backgroundColor: i <= activeStep ? s.color : T.border, cursor: "pointer", transition: "background 0.2s" }} />
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Step card */}
        <Card style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
          {/* Step header */}
          <div style={{ padding: "20px 20px 16px", background: `linear-gradient(135deg, ${steps[activeStep].color}18, ${steps[activeStep].color}08)`, borderBottom: `1px solid ${steps[activeStep].color}20` }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{steps[activeStep].icon}</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: T.navy }}>{steps[activeStep].title}</h2>
            <p style={{ margin: 0, fontSize: 14, color: T.textMid, lineHeight: 1.7 }}>{steps[activeStep].tip}</p>
          </div>

          {/* Do's and Don'ts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            <div style={{ padding: "14px 14px", borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.success, marginBottom: 8 }}>✅ DO</div>
              {steps[activeStep].do.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ color: T.success, fontSize: 12, flexShrink: 0, marginTop: 1 }}>•</span>
                  <span style={{ fontSize: 12, color: T.navy, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 14px" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.alert, marginBottom: 8 }}>❌ DON'T</div>
              {steps[activeStep].dont.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ color: T.alert, fontSize: 12, flexShrink: 0, marginTop: 1 }}>•</span>
                  <span style={{ fontSize: 12, color: T.navy, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Step thumbnails */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto" }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => setActiveStep(i)}
              style={{ flexShrink: 0, width: 64, height: 64, borderRadius: T.radius, border: `2px solid ${i === activeStep ? s.color : T.border}`, backgroundColor: i === activeStep ? `${s.color}12` : T.white, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: i === activeStep ? s.color : T.muted }}>{s.title.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" onClick={() => setActiveStep(s => Math.max(0, s - 1))} disabled={activeStep === 0} style={{ flex: 1 }}>← Prev</Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="primary" onClick={() => setActiveStep(s => s + 1)} style={{ flex: 2 }}>Next: {steps[activeStep + 1].title} →</Button>
          ) : (
            <Button variant="teal" onClick={() => onNavigate("upload")} style={{ flex: 2 }}>📷 Start Uploading Sarees →</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Data Export Screen (RD-36) ────────────────────────
function DataExportScreen({ onNavigate }) {
  const [selectedExports, setSelectedExports] = useState([]);
  const [format, setFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const exportTypes = [
    { id: "inventory", icon: "👗", label: "Inventory / Catalogue", desc: "All sarees, tags, prices, stock levels", rows: 312 },
    { id: "customers", icon: "👥", label: "Customer Data", desc: "Names, CLV, segments (DPDP-filtered)", rows: MOCK.customers.length },
    { id: "sales", icon: "💰", label: "Sales & Transactions", desc: "All purchases with date, item, staff, amount", rows: 48 },
    { id: "campaigns", icon: "📱", label: "Campaign Performance", desc: "Delivery, open, click rates per campaign", rows: MOCK.campaigns.length },
    { id: "staff", icon: "🧑‍💼", label: "Staff Performance", desc: "Sessions, conversions, revenue per staff", rows: MOCK.staff.length },
    { id: "aging", icon: "⚠️", label: "Aging Report", desc: "All sarees with age, value, tier", rows: 14 },
  ];

  const toggleExport = (id) => setSelectedExports(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setDone(true);
      setToast({ visible: true, message: `${selectedExports.length} file${selectedExports.length > 1 ? "s" : ""} exported as ${format.toUpperCase()} ✓` });
      setTimeout(() => setToast({ visible: false, message: "" }), 2500);
    }, 2200);
  };

  const totalRows = selectedExports.reduce((sum, id) => {
    const t = exportTypes.find(e => e.id === id);
    return sum + (t ? t.rows : 0);
  }, 0);

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="Export Data" onBack={() => onNavigate("settings")} />

      <div style={{ padding: "14px 16px" }}>
        {/* DPDP notice */}
        <div style={{ padding: "12px 14px", backgroundColor: `${T.navy}08`, borderRadius: T.radius, border: `1px solid ${T.navy}15`, marginBottom: 14, display: "flex", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔐</span>
          <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>Customer exports are DPDP-filtered: only customers who've consented to CRM data sharing are included. Phone numbers are masked by default.</p>
        </div>

        {/* Format selector */}
        <Card style={{ padding: 14, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Export Format</h3>
          <div style={{ display: "flex", gap: 10 }}>
            {["csv", "json", "xlsx"].map(f => (
              <button key={f} onClick={() => setFormat(f)}
                style={{ flex: 1, padding: "10px 8px", border: `2px solid ${format === f ? T.teal : T.border}`, borderRadius: T.radiusSm, backgroundColor: format === f ? `${T.teal}0C` : T.white, cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{{ csv: "📄", json: "🗂", xlsx: "📊" }[f]}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: format === f ? T.teal : T.navy }}>{f.toUpperCase()}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{{ csv: "Excel-ready", json: "For developers", xlsx: "Formatted" }[f]}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Export type selection */}
        <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: T.navy }}>Select Data to Export</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {exportTypes.map((type) => {
            const isSelected = selectedExports.includes(type.id);
            return (
              <div key={type.id} onClick={() => toggleExport(type.id)}
                style={{ padding: "12px 16px", borderRadius: T.radius, border: `2px solid ${isSelected ? T.teal : T.border}`, backgroundColor: isSelected ? `${T.teal}06` : T.white, cursor: "pointer", display: "flex", gap: 12, alignItems: "center", transition: "all 0.15s" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? T.teal : T.border}`, backgroundColor: isSelected ? T.teal : T.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {isSelected && <span style={{ color: T.white, fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: 22 }}>{type.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{type.label}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{type.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: isSelected ? T.teal : T.muted }}>{type.rows}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>rows</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary + export button */}
        {selectedExports.length > 0 && (
          <Card style={{ padding: 14, marginBottom: 14, backgroundColor: `${T.gold}0A`, border: `1px solid ${T.gold}30` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>📦</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{selectedExports.length} dataset{selectedExports.length > 1 ? "s" : ""} · ~{totalRows} total rows</div>
                <div style={{ fontSize: 12, color: T.muted }}>Format: {format.toUpperCase()} · DPDP-compliant</div>
              </div>
            </div>
          </Card>
        )}

        <Button fullWidth variant="primary" onClick={handleExport}
          disabled={selectedExports.length === 0 || exporting}
          style={{ position: "relative" }}>
          {exporting ? "⏳ Preparing export..." : done ? "✅ Download Again" : `⬇ Export ${selectedExports.length > 0 ? selectedExports.length + " file" + (selectedExports.length > 1 ? "s" : "") : ""}`}
        </Button>

        {done && (
          <div style={{ marginTop: 12, padding: "12px 16px", backgroundColor: T.successLight, borderRadius: T.radius, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.success }}>Export ready</div>
              <div style={{ fontSize: 12, color: T.textMid }}>File sent to your registered email · Valid for 24 hours</div>
            </div>
          </div>
        )}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── Support & Help Screen (RD-33) ─────────────────────
function SupportScreen({ onNavigate }) {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [ticketText, setTicketText] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  const faqs = [
    { q: "How do I digitise my entire catalogue quickly?", a: "Use Batch Upload — go to Catalogue → Batch Upload, then drag and drop up to 100 photos at once. AI will auto-tag each saree. Aim for 4 photos per saree (Front, Back, Pallu, Border) for best results." },
    { q: "What is the Store Health Score?", a: "It's a 0–100 composite score across 6 dimensions: Revenue, Conversion, Inventory, Customer, Platform Adoption, and Operational Health. Each dimension is weighted by business impact. Tap each dimension in the Health Score screen to see what's driving your score and how to improve it." },
    { q: "How does DPDP compliance work in Wearify?", a: "When a customer is added to your CRM, they're asked for consent for 3 categories: CRM data, Marketing messages, and Analytics. WhatsApp campaigns only go to customers who've opted in. Customers can request data deletion, which anonymises their transactions within 30 days." },
    { q: "Can my staff use a separate device?", a: "Yes. Staff use the Wearify Sales Tablet app on a dedicated Android tablet in-store. They log in with their staff PIN. The Sales Tablet shows the full saree catalogue and can initiate Smart Mirror sessions." },
    { q: "How does demand forecasting work?", a: "Chronos-2 (Amazon's open-source time-series AI model) is trained on your store's 6-month sales history. It outputs weekly revenue and category-level forecasts with confidence intervals. The festival calendar is overlaid automatically to highlight demand spikes." },
    { q: "What happens if the Smart Mirror goes offline?", a: "The kiosk stores the last 24 hours of catalogue data on local storage (NVIDIA Jetson Orin NX). Customers can still browse and do virtual try-ons offline. Session data syncs automatically when connectivity resumes." },
  ];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Support & Help" onBack={() => onNavigate("settings")} />

      <div style={{ padding: "14px 16px" }}>
        {/* Contact cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { icon: "💬", label: "WhatsApp Support", sub: "Mon–Sat 9AM–7PM", color: T.success, action: () => window.open("https://wa.me/918800000000?text=Hi, I need help with Wearify", "_blank") },
            { icon: "📧", label: "Email Support", sub: "support@wearify.in", color: T.teal, action: () => window.open("mailto:support@wearify.in?subject=Support Request", "_blank") },
            { icon: "📚", label: "Help Docs", sub: "wearify.in/help", color: T.navy, action: () => window.open("https://wearify.in/help", "_blank") },
            { icon: "🎥", label: "Video Tutorials", sub: "YouTube channel", color: T.alert, action: () => window.open("https://youtube.com/@wearify", "_blank") },
          ].map((c, i) => (
            <Card key={i} onClick={c.action} style={{ padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{c.label}</div>
              <div style={{ fontSize: 11, color: c.color, fontWeight: 600, marginTop: 4 }}>{c.sub}</div>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>Frequently Asked Questions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {faqs.map((faq, i) => (
            <Card key={i} style={{ padding: 0, overflow: "hidden" }}>
              <div onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                style={{ padding: "14px 16px", cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: T.navy }}>{faq.q}</div>
                <span style={{ color: T.muted, fontSize: 16, flexShrink: 0 }}>{openFAQ === i ? "▲" : "▾"}</span>
              </div>
              {openFAQ === i && (
                <div style={{ padding: "0 16px 14px", fontSize: 13, color: T.textMid, lineHeight: 1.7, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                  {faq.a}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Raise a ticket */}
        <Card style={{ padding: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>🎫 Raise a Support Ticket</h3>
          {!ticketSent ? (
            <>
              <textarea value={ticketText} onChange={e => setTicketText(e.target.value)}
                placeholder="Describe your issue in detail — we'll respond within 4 business hours..."
                rows={4} style={{ width: "100%", padding: "12px 14px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, fontFamily: "IBM Plex Sans, sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box", color: T.text, marginBottom: 12 }} />
              <Button fullWidth variant="teal" disabled={!ticketText.trim()} onClick={() => setTicketSent(true)}>
                Submit Ticket
              </Button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.success, marginBottom: 6 }}>Ticket #WF-2026-0847 raised</div>
              <div style={{ fontSize: 13, color: T.muted }}>Our team will reply to your registered email within 4 business hours.</div>
              <Button variant="ghost" style={{ marginTop: 12 }} onClick={() => { setTicketText(""); setTicketSent(false); }}>Raise another ticket</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SESSION 6 — POLISH, COMPLETION & FINAL SCREENS
// ═══════════════════════════════════════════════════════

// ── Empty State component ────────────────────────────
function EmptyState({ icon = "🔍", title, subtitle, action, onAction }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center", fontFamily: "IBM Plex Sans, sans-serif" }}>
      <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.6 }}>{icon}</div>
      <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: T.navy }}>{title}</h3>
      {subtitle && <p style={{ margin: "0 0 20px", fontSize: 13, color: T.muted, lineHeight: 1.6, maxWidth: 260, marginLeft: "auto", marginRight: "auto" }}>{subtitle}</p>}
      {action && onAction && (
        <Button variant="teal" onClick={onAction}>{action}</Button>
      )}
    </div>
  );
}

// ── Global Quick Search Overlay ──────────────────────
function GlobalSearchOverlay({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const typeColors = { saree: T.teal, customer: "#7B1FA2", screen: T.navy, action: T.gold };
  const typeLabels = { saree: "Saree", customer: "Customer", screen: "Screen", action: "Quick Action" };

  const results = query.trim().length < 1
    ? MOCK.searchIndex.filter(item => item.type === "action").slice(0, 6) // show quick actions when empty
    : MOCK.searchIndex.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.sub.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  const handleSelect = (item) => {
    const payload = item.id
      ? (item.type === "saree" ? MOCK.sarees.find(s => s.id === item.id) : MOCK.customers.find(c => c.id === item.id))
      : undefined;
    onNavigate(item.screen, payload);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", flexDirection: "column" }}
      onClick={onClose}>
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(13,27,42,0.6)", backdropFilter: "blur(3px)" }} />

      {/* Search panel */}
      <div onClick={e => e.stopPropagation()}
        style={{ position: "relative", margin: "60px 16px 0", backgroundColor: T.white, borderRadius: T.radiusLg, boxShadow: T.shadowLg, overflow: "hidden", maxWidth: 560, width: "100%", alignSelf: "center" }}>
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 20, color: T.muted }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search sarees, customers, screens, actions..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 16, fontFamily: "IBM Plex Sans, sans-serif", color: T.navy, backgroundColor: "transparent" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: T.muted, lineHeight: 1 }}>×</button>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, fontWeight: 600, padding: "4px 8px", borderRadius: 6, border: `1px solid ${T.border}` }}>Esc</button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {results.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🤷</div>
              <div style={{ fontSize: 14, color: T.muted }}>No results for "{query}"</div>
            </div>
          ) : (
            <>
              <div style={{ padding: "8px 18px 4px", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 0.5 }}>
                {query ? `${results.length} RESULTS` : "QUICK ACTIONS"}
              </div>
              {results.map((item, i) => (
                <div key={i} onClick={() => handleSelect(item)}
                  style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 18px", cursor: "pointer", borderBottom: i < results.length - 1 ? `1px solid ${T.border}` : "none", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = T.cream}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = T.white}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: `${typeColors[item.type]}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{item.sub}</div>
                  </div>
                  <Badge color={typeColors[item.type]}>{typeLabels[item.type]}</Badge>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ padding: "10px 18px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 16, fontSize: 11, color: T.muted }}>
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}

// ── Staff Leaderboard Screen (RD-24) ─────────────────
function StaffLeaderboardScreen({ onNavigate }) {
  const [metric, setMetric] = useState("revenue");
  const [period, setPeriod] = useState("month");

  const sorted = [...MOCK.staff].sort((a, b) => {
    if (metric === "revenue") return b.revenue - a.revenue;
    if (metric === "conversions") return b.conversions - a.conversions;
    if (metric === "sessions") return b.sessions - a.sessions;
    return (b.conversions / b.sessions) - (a.conversions / a.sessions);
  });

  const storeAvgConvRate = (MOCK.staff.reduce((s, st) => s + (st.conversions / st.sessions), 0) / MOCK.staff.length * 100).toFixed(0);
  const totalRevenue = MOCK.staff.reduce((s, st) => s + st.revenue, 0);

  const medalIcons = ["🥇", "🥈", "🥉"];
  const medalColors = [T.gold, "#9E9E9E", "#CD7F32"];

  const metricValue = (st) => {
    if (metric === "revenue") return formatINR(st.revenue);
    if (metric === "conversions") return `${st.conversions}`;
    if (metric === "sessions") return `${st.sessions}`;
    return `${((st.conversions / st.sessions) * 100).toFixed(0)}%`;
  };

  const metricMax = () => {
    if (metric === "revenue") return Math.max(...MOCK.staff.map(s => s.revenue));
    if (metric === "conversions") return Math.max(...MOCK.staff.map(s => s.conversions));
    if (metric === "sessions") return Math.max(...MOCK.staff.map(s => s.sessions));
    return 100;
  };

  const metricBarVal = (st) => {
    if (metric === "revenue") return st.revenue;
    if (metric === "conversions") return st.conversions;
    if (metric === "sessions") return st.sessions;
    return (st.conversions / st.sessions) * 100;
  };

  // Weekly sparkline data per staff
  const sparkLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Staff Leaderboard" onBack={() => onNavigate("staff")} />

      {/* Controls */}
      <div style={{ backgroundColor: T.white, padding: "10px 16px 12px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {[["revenue", "💰 Revenue"], ["conversions", "🎯 Sales"], ["sessions", "🪞 Sessions"], ["rate", "📊 Rate"]].map(([val, label]) => (
            <button key={val} onClick={() => setMetric(val)}
              style={{ padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, backgroundColor: metric === val ? T.navy : T.cream, color: metric === val ? T.white : T.textMid, transition: "all 0.2s", whiteSpace: "nowrap" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["week", "This Week"], ["month", "This Month"]].map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)}
              style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${period === val ? T.teal : T.border}`, cursor: "pointer", fontSize: 12, fontWeight: 600, backgroundColor: period === val ? `${T.teal}0C` : T.white, color: period === val ? T.teal : T.muted, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Store summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Total Revenue", value: formatINR(totalRevenue), color: T.success, icon: "💰" },
            { label: "Store Avg Conv.", value: `${storeAvgConvRate}%`, color: T.teal, icon: "🎯" },
            { label: "Staff Active", value: MOCK.staff.length, color: T.navy, icon: "👥" },
          ].map((k, i) => (
            <Card key={i} style={{ padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 15, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{k.label}</div>
            </Card>
          ))}
        </div>

        {/* Podium — top 3 visual */}
        <Card style={{ padding: 20, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: T.navy, textAlign: "center" }}>🏆 Rankings</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: "center", marginBottom: 16 }}>
            {[sorted[1], sorted[0], sorted[2]].map((st, podiumIdx) => {
              if (!st) return <div key={podiumIdx} style={{ flex: 1 }} />;
              const rankIdx = sorted.indexOf(st);
              const heights = [120, 150, 90]; // 2nd, 1st, 3rd
              const podiumColors = [`${T.muted}20`, `${T.gold}20`, `${T.amber}20`];
              return (
                <div key={st.id} onClick={() => onNavigate("staff-detail", st)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ fontSize: rankIdx === 0 ? 28 : 22, marginBottom: 6 }}>{medalIcons[rankIdx]}</div>
                  <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${medalColors[rankIdx]}22`, border: `3px solid ${medalColors[rankIdx]}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: medalColors[rankIdx], marginBottom: 6 }}>
                    {st.name[0]}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, textAlign: "center", marginBottom: 4 }}>{st.name.split(" ")[0]}</div>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 800, color: medalColors[rankIdx] }}>{metricValue(st)}</div>
                  <div style={{ width: "100%", height: heights[podiumIdx], backgroundColor: podiumColors[podiumIdx], borderRadius: "8px 8px 0 0", marginTop: 8, border: `1px solid ${medalColors[rankIdx]}30` }} />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Full ranked list */}
        <Card style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>Detailed Ranking</h3>
            <span style={{ fontSize: 12, color: T.muted }}>Tap to view profile</span>
          </div>
          {sorted.map((st, i) => {
            const convRate = ((st.conversions / st.sessions) * 100).toFixed(0);
            const aboveAvg = parseFloat(convRate) >= parseFloat(storeAvgConvRate);
            return (
              <div key={st.id} onClick={() => onNavigate("staff-detail", st)}
                style={{ padding: "14px 16px", borderBottom: i < sorted.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer", display: "flex", gap: 12, alignItems: "center", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = T.cream}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = T.white}>
                <div style={{ width: 28, textAlign: "center" }}>
                  <span style={{ fontSize: 20 }}>{medalIcons[i] || `${i + 1}.`}</span>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${medalColors[i] || T.muted}22`, border: `2px solid ${medalColors[i] || T.muted}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: medalColors[i] || T.muted, flexShrink: 0 }}>
                  {st.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{st.name}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{st.role} · {st.shift}</div>
                  <div style={{ marginTop: 5 }}>
                    <ProgressBar value={metricBarVal(st)} max={metricMax()} color={i === 0 ? T.gold : T.teal} height={4} />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 16, color: i === 0 ? T.gold : T.navy }}>{metricValue(st)}</div>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 4 }}>
                    <Badge color={aboveAvg ? T.success : T.muted}>{convRate}% conv.</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Weekly sparkline comparison */}
        <Card style={{ padding: 16 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>Daily Revenue — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="day" allowDuplicatedCategory={false} data={sparkLabels.map(d => ({ day: d }))} tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: T.muted }} tickFormatter={v => formatINR(v)} axisLine={false} tickLine={false} width={36} />
              <Tooltip formatter={(v, name) => [formatINRFull(v), name]} contentStyle={{ fontFamily: "IBM Plex Sans", borderRadius: 8, fontSize: 12 }} />
              {MOCK.staff.map((st, i) => (
                <Line key={st.id} type="monotone"
                  data={st.weeklyRevenue.map((val, di) => ({ day: sparkLabels[di], value: val }))}
                  dataKey="value" name={st.name.split(" ")[0]}
                  stroke={[T.gold, T.teal, T.accentBlue][i]} strokeWidth={2}
                  dot={{ r: 3, fill: [T.gold, T.teal, T.accentBlue][i] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11 }}>
            {MOCK.staff.map((st, i) => (
              <span key={st.id} style={{ display: "flex", gap: 4, alignItems: "center", color: T.muted }}>
                <span style={{ display: "inline-block", width: 12, height: 3, borderRadius: 2, backgroundColor: [T.gold, T.teal, T.accentBlue][i] }} />
                {st.name.split(" ")[0]}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Essential Mode wrapper — strips analytics-heavy screens ──
function EssentialInventoryScreen({ onNavigate }) {
  const [search, setSearch] = useState("");
  const sarees = MOCK.sarees.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8);
  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "16px 20px 12px", backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>My Sarees</h2>
          <Button size="sm" variant="gold" onClick={() => onNavigate("upload")}>+ Add</Button>
        </div>
        <input placeholder="🔍  Search sarees..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", border: `1px solid ${T.border}`, borderRadius: 20, fontSize: 14, fontFamily: "IBM Plex Sans", outline: "none", backgroundColor: T.cream, boxSizing: "border-box" }} />
      </div>
      <div style={{ padding: "12px 16px" }}>
        {/* Digitisation progress nudge */}
        <div style={{ padding: "12px 14px", backgroundColor: `${T.gold}12`, borderRadius: T.radius, border: `1px solid ${T.gold}30`, marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>📷</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>84% of catalogue digitised</div>
            <ProgressBar value={84} color={T.gold} height={5} />
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Add 50 more sarees to reach 100%</div>
          </div>
          <Button size="sm" variant="gold" onClick={() => onNavigate("batch-upload")}>Upload</Button>
        </div>
        {sarees.length === 0
          ? <EmptyState icon="👗" title="No sarees found" subtitle="Try a different search term" action="Add Saree" onAction={() => onNavigate("upload")} />
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sarees.map(s => (
                <Card key={s.id} onClick={() => onNavigate("saree-detail", s)} style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ fontSize: 32, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: T.cream, borderRadius: 8 }}>{s.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>{s.fabric} · Stock: {s.stock}</div>
                    </div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 15, color: T.navy }}>{formatINR(s.price)}</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

// ── Essential Mode Analytics (simplified) ────────────
function EssentialAnalyticsScreen({ onNavigate }) {
  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "16px 20px 12px", backgroundColor: T.white, borderBottom: `1px solid ${T.border}` }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>My Numbers</h2>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ padding: "10px 14px", backgroundColor: T.amberLight, borderRadius: T.radius, border: `1px solid ${T.amber}30`, marginBottom: 14, fontSize: 13, color: T.amber, fontWeight: 600, display: "flex", gap: 8 }}>
          <span>📱</span>
          <span>Essential Mode is ON — showing simplified view. <button onClick={() => onNavigate("settings")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.teal, fontWeight: 700, padding: 0, marginLeft: 4 }}>Switch off →</button></span>
        </div>
        {[
          { label: "Today's Revenue", value: "₹48,500", delta: "+12.4%", icon: "💰", color: T.success },
          { label: "Customers Today", value: "7", delta: "+2", icon: "👥", color: T.teal },
          { label: "Sarees Sold", value: "6", delta: null, icon: "👗", color: T.navy },
          { label: "Mirror Sessions", value: "18", delta: "+5", icon: "🪞", color: T.gold },
          { label: "Store Health", value: "78/100", delta: null, icon: "💚", color: T.success },
          { label: "Sarees Aging 60d+", value: "14", delta: null, icon: "⚠️", color: T.amber },
        ].map((k, i) => (
          <Card key={i} style={{ padding: "14px 16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 28 }}>{k.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: T.muted }}>{k.label}</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 22, color: k.color }}>{k.value}</div>
            </div>
            {k.delta && <DeltaBadge value={parseFloat(k.delta)} />}
          </Card>
        ))}
        <Button fullWidth variant="ghost" onClick={() => onNavigate("analytics")} style={{ marginTop: 4 }}>See full analytics →</Button>
      </div>
    </div>
  );
}

// ── Onboarding Re-Tour from Settings ─────────────────
function OnboardingRetourModal({ isOpen, onClose, onStartTour }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Replay Setup Tour" width={400}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🗺️</div>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: T.textMid, lineHeight: 1.7 }}>
          This will walk you through setting up your store profile, adding sarees, connecting WhatsApp, and adding staff — same as when you first joined.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {["🏪 Store Profile", "👗 Add First Sarees", "👥 Add Staff & PINs", "💬 Connect WhatsApp", "🎉 Go to Dashboard"].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 14px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: T.teal, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: T.navy }}>{step}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="teal" onClick={onStartTour} style={{ flex: 2 }}>Start Tour →</Button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
// SESSION 7 — NEW FEATURE SCREENS
// ═══════════════════════════════════════════════════════

// ── Add/Edit Staff Modal  (RM-STF-001 with PIN validation) ──
function AddStaffModal({ isOpen, staffToEdit, onClose, onSave }) {
  const lang = useContext(LangContext);
  const [form, setForm] = useState({ name: "", phone: "", pin: "", confirmPin: "", role: "staff", shift: "Morning" });
  const [errors, setErrors] = useState({});
  const [showPin, setShowPin] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  useEffect(() => {
    if (staffToEdit) {
      setForm({ name: staffToEdit.name, phone: staffToEdit.phone || "", pin: "", confirmPin: "", role: staffToEdit.role === "Senior Staff" ? "staff" : "manager", shift: staffToEdit.shift });
    } else {
      setForm({ name: "", phone: "", pin: "", confirmPin: "", role: "staff", shift: "Morning" });
    }
    setErrors({});
  }, [staffToEdit, isOpen]);

  const validate = () => {
    const errs = {};
    const nameErr = VALIDATION.name(form.name, lang);
    if (nameErr) errs.name = nameErr;
    const phoneErr = VALIDATION.phone(form.phone, lang);
    if (phoneErr) errs.phone = phoneErr;
    if (!staffToEdit) {
      const pinErr = VALIDATION.pin(form.pin, lang);
      if (pinErr) errs.pin = pinErr;
      else if (form.pin !== form.confirmPin) errs.confirmPin = "PINs do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setToast({ visible: true, message: staffToEdit ? `${form.name} updated ✓` : `${form.name} added to staff ✓` });
    setTimeout(() => { setToast({ visible: false, message: "" }); onSave(form); onClose(); }, 1400);
  };

  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={staffToEdit ? "Edit Staff Member" : "Add Staff Member"} width={480}>
      <Input label="Full Name" placeholder="e.g. Mohan Kumar" value={form.name}
        onChange={v => { setForm(f => ({...f, name: v})); setErrors(e => ({...e, name: undefined})); }}
        error={errors.name} maxLength={60} required />
      <Input label="Mobile Number" placeholder="98765 43210" value={form.phone}
        onChange={v => { setForm(f => ({...f, phone: v.replace(/\D/g,"").slice(0,10)})); setErrors(e => ({...e, phone: undefined})); }}
        type="tel" prefix="+91" error={errors.phone} maxLength={10} required helpKey="helpPhoneNumber" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select label="Role" value={form.role} onChange={v => setForm(f => ({...f, role: v}))}
          options={[{ value: "staff", label: "Salesperson" }, { value: "manager", label: "Store Manager" }]} />
        <Select label="Shift" value={form.shift} onChange={v => setForm(f => ({...f, shift: v}))}
          options={["Morning", "Evening", "Full Day", "Flexible"].map(s => ({ value: s, label: s }))} />
      </div>
      {!staffToEdit && (
        <>
          <div style={{ position: "relative" }}>
            <Input label="Login PIN" placeholder="4–6 digits" value={form.pin}
              onChange={v => { setForm(f => ({...f, pin: v.replace(/\D/g,"").slice(0,6)})); setErrors(e => ({...e, pin: undefined})); }}
              type={showPin ? "text" : "password"} error={errors.pin} maxLength={6} required helpKey="helpPIN" />
            <button onClick={() => setShowPin(v => !v)} style={{ position: "absolute", right: 12, top: 34, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: T.muted }}>
              {showPin ? "🙈" : "👁"}
            </button>
          </div>
          <Input label="Confirm PIN" placeholder="Re-enter PIN"
            value={form.confirmPin}
            onChange={v => { setForm(f => ({...f, confirmPin: v.replace(/\D/g,"").slice(0,6)})); setErrors(e => ({...e, confirmPin: undefined})); }}
            type={showPin ? "text" : "password"} error={errors.confirmPin} maxLength={6} required />
        </>
      )}
      <div style={{ padding: "10px 14px", backgroundColor: `${T.gold}0C`, borderRadius: T.radiusSm, marginBottom: 14, fontSize: 12, color: T.textMid }}>
        🔐 PIN rules: 4–6 digits only · No letters · Staff uses this to log in on the Sales Tablet and Smart Mirror · Keep it confidential
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} style={{ flex: 2 }}>
          {staffToEdit ? "Save Changes" : "Add Staff Member"}
        </Button>
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </Modal>
  );
}

// ── Connected Apps Panel (RM-SET-004) ─────────────────
function ConnectedAppsScreen({ onNavigate }) {
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [tallyModal, setTallyModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const integrations = [
    {
      id: "whatsapp", name: "WhatsApp Business", icon: "💬", status: "connected",
      detail: "Linked to +91 98765 43210", lastSync: "2 min ago",
      color: "#25D366", desc: "Send campaigns, session shares, and automated messages to customers.",
    },
    {
      id: "razorpay", name: "Razorpay Billing", icon: "💳", status: "connected",
      detail: "Professional plan · Auto-renews Apr 22", lastSync: "Billing cycle",
      color: T.teal, desc: "Automated subscription billing and invoice generation.",
    },
    {
      id: "tally", name: "Tally / ERP Sync", icon: "🗂", status: "disconnected",
      detail: "Not connected", lastSync: "—",
      color: T.muted, desc: "One-way read sync from Tally to pull sales data. Wearify never writes to Tally.",
    },
    {
      id: "marg", name: "Marg ERP", icon: "📊", status: "disconnected",
      detail: "Not connected", lastSync: "—",
      color: T.muted, desc: "Import daily sales summary from Marg into Wearify analytics.",
    },
    {
      id: "gupshup", name: "Gupshup API", icon: "📡", status: "connected",
      detail: "WhatsApp Business API provider", lastSync: "Active",
      color: T.accentBlue, desc: "Powers all WhatsApp message delivery. Managed by Wearify — no action needed.",
    },
  ];

  const statusConfig = {
    connected: { color: T.success, bg: T.successLight, label: "Connected ✓" },
    error:     { color: T.alert,   bg: T.alertLight,   label: "Error ⚠️" },
    disconnected: { color: T.muted, bg: T.cream,        label: "Not Connected" },
    syncing:   { color: T.gold,   bg: T.amberLight,    label: "Syncing..." },
  };

  const handleConnect = (id) => {
    if (id === "whatsapp") { setWhatsappModal(true); return; }
    if (id === "tally" || id === "marg") { setTallyModal(true); return; }
  };

  const handleDisconnect = (id) => {
    setToast({ visible: true, message: `${id} disconnected successfully` });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Connected Applications" onBack={() => onNavigate("settings")} />

      <div style={{ padding: "14px 16px" }}>
        <div style={{ padding: "12px 14px", backgroundColor: `${T.navy}08`, borderRadius: T.radius, border: `1px solid ${T.navy}15`, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>🔗 Integration Policy</div>
          <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>
            Wearify only reads from ERP systems (Tally, Marg) — it never writes back. WhatsApp integration is managed through your registered business number. All data stays within your store.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {integrations.map(intg => {
            const sc = statusConfig[intg.status];
            return (
              <Card key={intg.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: `${intg.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                    {intg.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{intg.name}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{intg.detail}</div>
                  </div>
                  <Badge color={sc.color} bg={sc.bg}>{sc.label}</Badge>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, color: T.textMid, lineHeight: 1.5 }}>{intg.desc}</p>
                {intg.status === "connected" && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1, fontSize: 11, color: T.muted }}>Last sync: {intg.lastSync}</div>
                    <Button size="sm" variant="ghost" onClick={() => setToast({ visible: true, message: `Syncing ${intg.name}...` })}>🔄 Sync Now</Button>
                    <Button size="sm" variant="secondary" onClick={() => handleDisconnect(intg.id)}>Disconnect</Button>
                  </div>
                )}
                {intg.status === "disconnected" && (
                  <Button size="sm" variant="teal" onClick={() => handleConnect(intg.id)}>+ Connect {intg.name}</Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* WhatsApp setup wizard */}
      <Modal isOpen={whatsappModal} onClose={() => setWhatsappModal(false)} title="Connect WhatsApp Business">
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { step: "1", title: "Open WhatsApp Business", desc: "Make sure you have WhatsApp Business app installed and your store's number is registered." },
              { step: "2", title: "Enter your business number", desc: "This must be the same number customers will receive messages from." },
              { step: "3", title: "Verify OTP", desc: "WhatsApp will send a 6-digit code to confirm the connection." },
              { step: "4", title: "Approve message templates", desc: "Meta reviews business message templates. Approval takes 1–2 business days." },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: 12, padding: "12px 14px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#25D366", color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Input label="WhatsApp Business Number" placeholder="98765 43210" value="" onChange={() => {}} type="tel" prefix="+91" style={{ marginTop: 16 }} hint="Must match your WhatsApp Business registered number" />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setWhatsappModal(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="teal" onClick={() => { setWhatsappModal(false); setToast({ visible: true, message: "WhatsApp OTP sent. Please verify." }); setTimeout(() => setToast({ visible: false, message: "" }), 2500); }} style={{ flex: 2 }}>Send Verification OTP</Button>
          </div>
        </div>
      </Modal>

      {/* Tally/Marg setup */}
      <Modal isOpen={tallyModal} onClose={() => setTallyModal(false)} title="Connect ERP System">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗂</div>
          <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.7, margin: "0 0 20px" }}>
            ERP sync requires the <strong>Wearify Tally Plugin</strong> to be installed on your computer that runs Tally. Please contact support to get the plugin and setup instructions.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={() => setTallyModal(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="teal" onClick={() => { setTallyModal(false); onNavigate("support"); }} style={{ flex: 2 }}>Contact Support →</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── CSV Import Wizard (RM-CAT-008) ────────────────────
function CSVImportScreen({ onNavigate }) {
  const [step, setStep] = useState(0); // 0=upload, 1=mapping, 2=preview, 3=done
  const [mappings, setMappings] = useState({ name: "Product Name", price: "MRP", fabric: "Type", quantity: "Stock" });
  const [toast, setToast] = useState({ visible: false, message: "" });

  const wearifyCols = ["name","price","fabric","color","quantity","weave","occasion","region","description"];
  const supplierCols = ["Product Name","MRP","Selling Price","Type","Material","Colour","Qty","Category","Occasion","State","Notes","SKU"];
  const previewData = [
    { name: "Kanjivaram Silk", price: "45000", fabric: "Silk", color: "Red", quantity: "3" },
    { name: "Banarasi Cotton", price: "8500", fabric: "Cotton", color: "Blue", quantity: "7" },
    { name: "Chanderi Georgette", price: "6200", fabric: "Georgette", color: "Green", quantity: "5" },
  ];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="Import from Excel / CSV" onBack={() => onNavigate("inventory")} />

      {/* Step indicator */}
      <div style={{ backgroundColor: T.white, padding: "10px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 0 }}>
        {["Upload File", "Map Columns", "Preview", "Import"].map((s, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: i <= step ? T.teal : T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: T.white, zIndex: 1 }}>
              {i < step ? "✓" : i + 1}
            </div>
            {i < 3 && <div style={{ position: "absolute", top: 11, left: "50%", right: "-50%", height: 2, backgroundColor: i < step ? T.teal : T.border, zIndex: 0 }} />}
            <div style={{ fontSize: 9, color: i === step ? T.teal : T.muted, fontWeight: i === step ? 700 : 400, marginTop: 4, textAlign: "center" }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {step === 0 && (
          <>
            <div style={{ border: `2px dashed ${T.teal}`, borderRadius: T.radiusLg, padding: "36px 20px", textAlign: "center", backgroundColor: `${T.teal}04`, marginBottom: 16 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>📂</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: T.navy }}>Upload your supplier file</h3>
              <p style={{ margin: "0 0 16px", color: T.muted, fontSize: 13 }}>Supported: .xlsx, .xls, .csv — Max 500 rows per import</p>
              <Button variant="teal">Choose File</Button>
            </div>
            <Card style={{ padding: 14, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: T.navy }}>📋 What to include in your file</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Product Name", "Required"], ["Price / MRP", "Required"], ["Fabric Type", "Recommended"], ["Stock Qty", "Recommended"], ["Colour", "Optional"], ["Occasion", "Optional"]].map(([col, req], i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12 }}>
                    <span style={{ color: req === "Required" ? T.alert : req === "Recommended" ? T.gold : T.muted, fontSize: 10 }}>●</span>
                    <span style={{ color: T.navy, fontWeight: 500 }}>{col}</span>
                    <Badge color={req === "Required" ? T.alert : req === "Recommended" ? T.gold : T.muted}>{req}</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Button fullWidth variant="primary" onClick={() => setStep(1)}>📂 Upload Sample File (Demo)</Button>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: 13, color: T.textMid, marginBottom: 14 }}>Match your supplier's column names to Wearify's fields. Unmapped columns will be skipped.</p>
            <Card style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "10px 16px", backgroundColor: T.navy }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.white }}>Wearify Field</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.white }}>Your Column</div>
              </div>
              {wearifyCols.slice(0, 6).map((wCol, i) => (
                <div key={wCol} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "12px 16px", borderBottom: i < 5 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.navy, textTransform: "capitalize" }}>
                    {wCol} {["name","price"].includes(wCol) && <span style={{ color: T.alert }}>*</span>}
                  </div>
                  <select value={mappings[wCol] || ""}
                    onChange={e => setMappings(m => ({ ...m, [wCol]: e.target.value }))}
                    style={{ padding: "7px 10px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 13, fontFamily: "IBM Plex Sans, sans-serif", outline: "none" }}>
                    <option value="">— Skip this field —</option>
                    {supplierCols.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
              ))}
            </Card>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="secondary" onClick={() => setStep(0)} style={{ flex: 1 }}>← Back</Button>
              <Button variant="primary" onClick={() => setStep(2)} style={{ flex: 2 }}>Preview Import →</Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ padding: "10px 14px", backgroundColor: T.successLight, borderRadius: T.radiusSm, marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
              <span>✅</span>
              <div style={{ fontSize: 13, color: T.success, fontWeight: 600 }}>3 sarees ready to import · 0 errors detected</div>
            </div>
            <Card style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "8px 16px", backgroundColor: T.navy }}>
                {["Name", "Price", "Fabric", "Qty"].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: T.white }}>{h}</div>
                ))}
              </div>
              {previewData.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "10px 16px", borderBottom: i < previewData.length - 1 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{row.name}</div>
                  <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: T.success }}>₹{parseInt(row.price).toLocaleString("en-IN")}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{row.fabric}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{row.quantity}</div>
                </div>
              ))}
            </Card>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Button>
              <Button variant="teal" onClick={() => setStep(3)} style={{ flex: 2 }}>Import 3 Sarees →</Button>
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🎉</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: T.success }}>Import Successful!</h2>
            <p style={{ margin: "0 0 24px", color: T.muted, fontSize: 14 }}>3 sarees added to your catalogue. AI will auto-tag them within 2 minutes.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Button variant="ghost" onClick={() => setStep(0)}>Import Another File</Button>
              <Button variant="primary" onClick={() => onNavigate("inventory")}>View Catalogue →</Button>
            </div>
          </div>
        )}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── ABC Classification Screen (RM-INV-007) ───────────
function ABCClassificationScreen({ onNavigate }) {
  const abcData = [
    { id: "SAR001", name: "Kanjivaram Pure Silk", emoji: "🌺", revenue: 180000, pct: 24.3, tier: "A", reason: "Top 20% SKU · High value · Strong try-on conversion" },
    { id: "SAR002", name: "Banarasi Georgette", emoji: "🌸", revenue: 142000, pct: 19.2, tier: "A", reason: "Trending · High volume · Festival demand spike" },
    { id: "SAR006", name: "Tant Cotton", emoji: "🧵", revenue: 63000, pct: 8.5, tier: "A", reason: "Fast-moving · High unit volume · Repeat buyers" },
    { id: "SAR003", name: "Chanderi Cotton Silk", emoji: "🪷", revenue: 88000, pct: 11.9, tier: "B", reason: "Stable performance · Moderate demand" },
    { id: "SAR005", name: "Pochampally Ikat", emoji: "🎨", revenue: 72000, pct: 9.7, tier: "B", reason: "Consistent seller · Regional demand" },
    { id: "SAR008", name: "Sambalpuri Ikat", emoji: "🏺", revenue: 34000, pct: 4.6, tier: "B", reason: "Moderate sales · Festival specific" },
    { id: "SAR004", name: "Mysore Silk Crepe", emoji: "🌼", revenue: 44000, pct: 5.9, tier: "C", reason: "Slow mover · Aging 95 days · Consider clearance" },
    { id: "SAR007", name: "Paithani Silk", emoji: "🦚", revenue: 38000, pct: 5.1, tier: "C", reason: "Low try-on rate · Limited market · Very slow movement" },
    { id: "SAR009", name: "Dharmavaram Silk", emoji: "🌻", revenue: 28000, pct: 3.8, tier: "C", reason: "Aging 125 days · Near dead stock threshold" },
    { id: "SAR010", name: "Kasavu Cotton", emoji: "⚪", revenue: 21000, pct: 2.8, tier: "C", reason: "Regional demand only · Low browse rate" },
  ];

  const tierConfig = {
    A: { color: T.gold, bg: T.amberLight, label: "A — High Value", desc: "Top 20% SKUs generating 80% of revenue. Prioritise reorder.", count: 3, totalRevenue: 385000 },
    B: { color: T.teal, bg: `${T.teal}12`, label: "B — Medium Value", desc: "Middle 30% SKUs. Monitor and maintain stock levels.", count: 3, totalRevenue: 194000 },
    C: { color: T.muted, bg: T.cream, label: "C — Low Value", desc: "Bottom 50% SKUs. Consider markdown or clearance.", count: 4, totalRevenue: 131000 },
  };

  const [activeTab, setActiveTab] = useState("A");

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="ABC Inventory Classification" onBack={() => onNavigate("inventory")} />

      {/* Overview cards */}
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {["A","B","C"].map(tier => {
            const tc = tierConfig[tier];
            return (
              <Card key={tier} onClick={() => setActiveTab(tier)}
                style={{ padding: "12px 10px", textAlign: "center", border: `2px solid ${activeTab === tier ? tc.color : T.border}`, backgroundColor: activeTab === tier ? tc.bg : T.white }}>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 900, fontSize: 28, color: tc.color }}>{tier}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginTop: 2 }}>{tc.count} SKUs</div>
                <div style={{ fontSize: 11, color: T.muted }}>{formatINR(tc.totalRevenue)}</div>
              </Card>
            );
          })}
        </div>

        <Card style={{ padding: 14, marginBottom: 14, backgroundColor: `${tierConfig[activeTab].color}0A`, border: `1px solid ${tierConfig[activeTab].color}30` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, marginBottom: 4 }}>{tierConfig[activeTab].label}</div>
          <p style={{ margin: 0, fontSize: 13, color: T.textMid }}>{tierConfig[activeTab].desc}</p>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {abcData.filter(s => s.tier === activeTab).map((s, i) => (
            <Card key={s.id} onClick={() => onNavigate("saree-detail", MOCK.sarees.find(ms => ms.id === s.id) || MOCK.sarees[0])} style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 28, width: 44, height: 44, backgroundColor: T.cream, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{s.reason}</div>
                  <div style={{ marginTop: 6 }}>
                    <ProgressBar value={s.pct} max={25} color={tierConfig[s.tier].color} height={5} />
                    <span style={{ fontSize: 11, color: tierConfig[s.tier].color, fontWeight: 700 }}>{s.pct}% of total revenue</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 15, color: T.navy }}>{formatINR(s.revenue)}</div>
                  <Badge color={tierConfig[s.tier].color} bg={tierConfig[s.tier].bg}>{s.tier}-Class</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card style={{ padding: 14, marginTop: 14, backgroundColor: `${T.teal}08`, border: `1px solid ${T.teal}20` }}>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>AI Recommendation</div>
              <p style={{ margin: 0, fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>
                {activeTab === "A" ? "Prioritise restocking A-class sarees before Navratri. Your top 3 SKUs contribute 51% of revenue — never let them go out of stock." :
                 activeTab === "B" ? "B-class SKUs are stable. Monitor monthly. Chanderi Cotton Silk has upside potential — consider promoting it during office season." :
                 "4 C-class sarees are aging past 90 days. Recommended action: apply 15–25% discount this week. Consider not reordering after clearance."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Dead Stock Root Cause Analysis (RM-INV-006) ───────
function DeadStockRCAScreen({ onNavigate }) {
  const rcaData = [
    {
      id: "SAR004", name: "Mysore Silk Crepe", emoji: "🌼", daysOld: 95, price: 22000,
      cause: "presentation", causeLabel: "Presentation Issue", causeColor: T.gold,
      diagnosis: "Shown in 11 mirror sessions but 0 purchases. Customers view but don't buy.",
      evidence: ["Try-on rate: 63% — customers are interested", "0 purchases despite 11 try-ons", "No WhatsApp shares", "Staff notes: customers mention price concern at ₹22,000 range"],
      recommendation: "Price is likely the barrier — not quality. Test a 15% discount for 2 weeks. Alternatively, move to front of catalogue to increase visibility.",
      actions: ["discount", "feature"],
    },
    {
      id: "SAR007", name: "Paithani Silk", emoji: "🦚", daysOld: 110, price: 38000,
      cause: "discoverability", causeLabel: "Discoverability Issue", causeColor: T.amber,
      diagnosis: "Only 6 sessions — very few customers are seeing it on the mirror.",
      evidence: ["Only 3 try-ons in 110 days", "Never appeared in top search results", "Only 1 WhatsApp share", "Category: Paithani has only 2.1% browse share in your store"],
      recommendation: "This saree needs more visibility. Feature it on the mirror attract screen. Staff should proactively show it to customers browsing wedding sarees.",
      actions: ["feature", "bundle"],
    },
    {
      id: "SAR009", name: "Dharmavaram Silk", emoji: "🌻", daysOld: 125, price: 28000,
      cause: "quality", causeLabel: "Quality / Presentation Concern", causeColor: T.alert,
      diagnosis: "Shown frequently but never shortlisted. Customers see it and move on quickly.",
      evidence: ["18 views, 2 try-ons, 0 purchases", "Avg session time on this saree: 8 seconds (very low)", "No tags for 'occasion' — AI couldn't classify", "Photos may be low quality — no pallu or border shots"],
      recommendation: "Re-photograph this saree with all 4 angles. Add occasion and occasion tags. The quick abandonment suggests the product display is the issue, not the product itself.",
      actions: ["photo", "clearance"],
    },
  ];

  const [expanded, setExpanded] = useState(null);
  const causeIcons = { discoverability: "👁", presentation: "🏷️", quality: "📷" };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Dead Stock Root Cause Analysis" onBack={() => onNavigate("dead-stock")} />

      <div style={{ padding: "14px 16px" }}>
        <div style={{ padding: "12px 14px", backgroundColor: `${T.teal}08`, borderRadius: T.radius, border: `1px solid ${T.teal}20`, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>🤖 AI Causal Diagnosis</div>
          <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>
            Instead of just flagging aged stock, Wearify's AI determines WHY each saree is aging — whether the issue is <strong>discoverability</strong> (never shown), <strong>presentation</strong> (shown but not purchased), or <strong>quality signals</strong> (quick rejection). Each gets a different fix.
          </p>
        </div>

        {/* Cause legend */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {[["👁", "Discoverability", T.amber, "Not being shown to customers"], ["🏷️", "Presentation / Pricing", T.gold, "Shown but price is a barrier"], ["📷", "Quality Signals", T.alert, "Rapid rejection — retake photos"]].map(([icon, label, color, desc], i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "8px 12px", backgroundColor: `${color}12`, borderRadius: T.radiusSm, border: `1px solid ${color}30`, flex: 1, minWidth: 150 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color }}>{label}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {rcaData.map((item, idx) => (
          <Card key={item.id} style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
            <div onClick={() => setExpanded(expanded === idx ? null : idx)}
              style={{ padding: "14px 16px", cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 28, width: 48, height: 52, backgroundColor: `${item.causeColor}12`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{item.name}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{item.daysOld} days old · {formatINR(item.price)}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 16 }}>{causeIcons[item.cause]}</span>
                  <Badge color={item.causeColor}>{item.causeLabel}</Badge>
                </div>
              </div>
              <span style={{ color: T.muted, fontSize: 16 }}>{expanded === idx ? "▲" : "▾"}</span>
            </div>

            {expanded === idx && (
              <div style={{ borderTop: `1px solid ${T.border}` }}>
                <div style={{ padding: "12px 16px", backgroundColor: `${item.causeColor}08` }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 6 }}>🔍 Diagnosis</div>
                  <p style={{ margin: "0 0 12px", fontSize: 13, color: T.textMid }}>{item.diagnosis}</p>
                  <div style={{ fontWeight: 700, fontSize: 12, color: T.navy, marginBottom: 6 }}>Evidence:</div>
                  {item.evidence.map((ev, ei) => (
                    <div key={ei} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 12, color: T.textMid }}>
                      <span style={{ color: item.causeColor, flexShrink: 0 }}>→</span>{ev}
                    </div>
                  ))}
                </div>
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 6 }}>💡 Recommended Action</div>
                  <p style={{ margin: "0 0 14px", fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{item.recommendation}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button size="sm" variant="teal" onClick={() => onNavigate("aging")}>Take Action →</Button>
                    <Button size="sm" variant="ghost" onClick={() => onNavigate("saree-detail", MOCK.sarees.find(s => s.id === item.id) || MOCK.sarees[0])}>View Saree</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Session-to-Sale Attribution (RM-ANA-004) ─────────
function SessionAttributionScreen({ onNavigate }) {
  const sessions = [
    { id: "SES-2024", customer: "Kavitha Nair", staff: "Mohan Kumar", date: "Mar 22", duration: "24 min", sarees: ["Kanjivaram", "Paithani"], outcome: "purchased", revenue: 38000, sessionId: "MR-2024-0322" },
    { id: "SES-2023", customer: "Priya Sharma", staff: "Anita Devi", date: "Mar 21", duration: "19 min", sarees: ["Banarasi Georgette", "Chanderi"], outcome: "considering", revenue: 0, sessionId: "MR-2023-0321" },
    { id: "SES-2022", customer: "Guest Customer", staff: "Rajesh Singh", date: "Mar 21", duration: "31 min", sarees: ["Mysore Silk", "Kanjivaram", "Tant Cotton"], outcome: "left", revenue: 0, sessionId: "MR-2022-0321" },
    { id: "SES-2021", customer: "Deepa Mehra", staff: "Mohan Kumar", date: "Mar 20", duration: "17 min", sarees: ["Sambalpuri Ikat"], outcome: "purchased", revenue: 8500, sessionId: "MR-2021-0320" },
    { id: "SES-2020", customer: "Sunita Agarwal", staff: "Anita Devi", date: "Mar 19", duration: "22 min", sarees: ["Chanderi Cotton", "Tant Cotton"], outcome: "whatsapp_shared", revenue: 0, sessionId: "MR-2020-0319" },
  ];
  const outcomeConfig = {
    purchased: { color: T.success, bg: T.successLight, label: "Purchased ✓", icon: "💰" },
    considering: { color: T.gold, bg: T.amberLight, label: "Considering", icon: "🤔" },
    left: { color: T.muted, bg: T.cream, label: "Left Store", icon: "🚪" },
    whatsapp_shared: { color: T.teal, bg: `${T.teal}12`, label: "Shared on WA", icon: "💬" },
  };
  const totalRevenue = sessions.filter(s => s.outcome === "purchased").reduce((sum, s) => sum + s.revenue, 0);
  const convRate = ((sessions.filter(s => s.outcome === "purchased").length / sessions.length) * 100).toFixed(0);

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Session-to-Sale Attribution" onBack={() => onNavigate("analytics")} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Attributed Revenue", value: formatINR(totalRevenue), color: T.success, icon: "💰" },
            { label: "Session Conv. Rate", value: `${convRate}%`, color: T.teal, icon: "🎯" },
            { label: "Total Sessions", value: sessions.length, color: T.navy, icon: "🪞" },
          ].map((k, i) => (
            <Card key={i} style={{ padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{k.icon}</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 16, color: k.color, marginTop: 4 }}>{k.value}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{k.label}</div>
            </Card>
          ))}
        </div>

        <div style={{ padding: "10px 14px", backgroundColor: `${T.navy}08`, borderRadius: T.radius, marginBottom: 14, fontSize: 12, color: T.textMid }}>
          📊 Every mirror session is linked to an outcome — proving Wearify's direct revenue contribution. Sessions without a logged outcome are marked Unknown.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.map(s => {
            const oc = outcomeConfig[s.outcome];
            return (
              <Card key={s.id} style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${oc.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{oc.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{s.customer}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{s.date} · {s.duration} · {s.staff}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Badge color={oc.color} bg={oc.bg}>{oc.label}</Badge>
                    {s.revenue > 0 && <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 13, color: T.success, marginTop: 4 }}>{formatINR(s.revenue)}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: T.muted }}>Tried:</span>
                  {s.sarees.map((sr, i) => <Badge key={i} color={T.teal}>{sr}</Badge>)}
                </div>
                <div style={{ marginTop: 6, fontSize: 10, color: T.muted, fontFamily: "JetBrains Mono, monospace" }}>Session: {s.sessionId}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Top Tried vs Sold vs Shared (RM-ANA-007) ─────────
function TriedSoldSharedScreen({ onNavigate }) {
  const [view, setView] = useState("all");
  const data = [
    { name: "Banarasi Georgette", emoji: "🌸", tryOns: 45, sold: 8, shared: 22, insight: "high-shared", badge: "🔥 Viral" },
    { name: "Kanjivaram Silk", emoji: "🌺", tryOns: 28, sold: 3, shared: 14, insight: "pricing-barrier", badge: "⚠️ Price?" },
    { name: "Tant Cotton", emoji: "🧵", tryOns: 8, sold: 9, shared: 5, insight: "low-try-high-buy", badge: "💎 Efficient" },
    { name: "Chanderi Cotton", emoji: "🪷", tryOns: 12, sold: 5, shared: 8, insight: "balanced", badge: "✅ Balanced" },
    { name: "Pochampally Ikat", emoji: "🎨", tryOns: 19, sold: 4, shared: 11, insight: "pricing-barrier", badge: "⚠️ Price?" },
    { name: "Mysore Silk", emoji: "🌼", tryOns: 7, sold: 0, shared: 2, insight: "dead-issue", badge: "🚨 Investigate" },
    { name: "Paithani Silk", emoji: "🦚", tryOns: 3, sold: 0, shared: 1, insight: "dead-issue", badge: "🚨 Investigate" },
    { name: "Sambalpuri Ikat", emoji: "🏺", tryOns: 14, sold: 3, shared: 9, insight: "balanced", badge: "✅ Balanced" },
  ];

  const insightConfig = {
    "high-shared": { color: T.success, tip: "High shares drive new customers. Customers love it and tell friends." },
    "pricing-barrier": { color: T.gold, tip: "High try-ons + low purchases = price barrier. Consider a small discount or better value communication." },
    "low-try-high-buy": { color: T.accentBlue, tip: "Customers who try it, buy it immediately. May be underpriced — test a price increase." },
    "balanced": { color: T.teal, tip: "Healthy ratio of try-ons, purchases and shares." },
    "dead-issue": { color: T.alert, tip: "Very low engagement. Either discoverability issue or the saree needs better presentation." },
  };

  const maxVal = Math.max(...data.map(d => Math.max(d.tryOns, d.sold * 3, d.shared)));

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Tried vs Sold vs Shared" onBack={() => onNavigate("analytics")} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 14, fontSize: 12 }}>
          {[["🪞 Try-Ons", T.teal], ["💰 Sold ×3", T.success], ["💬 Shared", T.gold]].map(([label, color]) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, color: T.muted }}>
              <span style={{ display: "inline-block", width: 12, height: 4, borderRadius: 2, backgroundColor: color }} />{label}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.map((item, i) => {
            const ic = insightConfig[item.insight];
            return (
              <Card key={i} style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{item.name}</div>
                  </div>
                  <Badge color={ic.color}>{item.badge}</Badge>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[["🪞", "Try-Ons", item.tryOns, T.teal], ["💰", "Sold", item.sold * 3, T.success, item.sold], ["💬", "Shared", item.shared, T.gold]].map(([icon, label, barVal, color, actualVal]) => (
                    <div key={label} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, width: 16 }}>{icon}</span>
                      <span style={{ fontSize: 11, color: T.muted, width: 54, flexShrink: 0 }}>{label}</span>
                      <div style={{ flex: 1, height: 8, backgroundColor: T.creamDark, borderRadius: 99 }}>
                        <div style={{ width: `${(barVal / maxVal) * 100}%`, height: "100%", backgroundColor: color, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color, width: 22, textAlign: "right" }}>
                        {actualVal !== undefined ? actualVal : barVal}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, padding: "7px 10px", backgroundColor: `${ic.color}0C`, borderRadius: T.radiusSm, fontSize: 11, color: ic.color, fontWeight: 500 }}>
                  💡 {ic.tip}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Morning Briefing Preview (RM-WA-005) ──────────────
function MorningBriefingScreen({ onNavigate }) {
  const [enabled, setEnabled] = useState(true);
  const [time, setTime] = useState("07:00");
  const [language, setLanguage] = useState("hi");
  const [toast, setToast] = useState({ visible: false, message: "" });

  const sampleMessage = language === "hi"
    ? `🌅 *Wearify दैनिक रिपोर्ट — 22 मार्च 2026*\n\n💰 कल की बिक्री: ₹48,500 (+12.4%)\n👗 सबसे ज्यादा बिका: Banarasi Georgette\n⚠️ 14 साड़ियाँ 90+ दिनों से बिन बिकी हैं\n🎂 आज 2 ग्राहकों का जन्मदिन है\n\nआज का अनुमानित फुटफॉल: 15–20 ग्राहक\n\nशुभ दिन! 🙏`
    : `🌅 *Wearify Daily Report — 22 March 2026*\n\n💰 Yesterday's Sales: ₹48,500 (+12.4%)\n👗 Top Seller: Banarasi Georgette\n⚠️ 14 sarees aging 90+ days\n🎂 2 customer birthdays today\n\nExpected footfall today: 15–20 customers\n\nHave a great day! 🙏`;

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="Morning WhatsApp Briefing" onBack={() => onNavigate("settings")} />
      <div style={{ padding: "14px 16px" }}>
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>📱 Daily Briefing</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Receive a WhatsApp summary every morning</div>
            </div>
            <div onClick={() => setEnabled(v => !v)} style={{ width: 48, height: 26, borderRadius: 13, backgroundColor: enabled ? T.teal : T.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: T.white, position: "absolute", top: 3, left: enabled ? 24 : 3, transition: "left 0.2s", boxShadow: T.shadow }} />
            </div>
          </div>
          {enabled && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Send Time" type="time" value={time} onChange={setTime} />
              <Select label="Language" value={language} onChange={setLanguage}
                options={[{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी (Hindi)" }, { value: "kn", label: "ಕನ್ನಡ (Kannada)" }, { value: "mr", label: "मराठी (Marathi)" }]} />
            </div>
          )}
        </Card>

        {enabled && (
          <Card style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#075E54", display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: T.navy, fontSize: 12 }}>RS</div>
              <div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 13 }}>Wearify for {MOCK.store.name}</div>
                <div style={{ color: "#A5C7B7", fontSize: 11 }}>Preview · Delivered at {time}</div>
              </div>
            </div>
            <div style={{ backgroundColor: "#ECE5DD", padding: 16 }}>
              <div style={{ backgroundColor: T.white, borderRadius: "4px 16px 16px 16px", padding: "12px 14px", maxWidth: "90%", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7, color: "#111", fontFamily: "system-ui" }}>
                {sampleMessage}
              </div>
            </div>
          </Card>
        )}

        <Card style={{ padding: 14, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: T.navy }}>What's Included</h3>
          {["Yesterday's revenue and % change", "Top-selling saree of the day", "Aging stock alerts (90+ day items)", "Customer birthdays / anniversaries today", "Expected footfall prediction", "Pending follow-ups for staff"].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: T.textMid }}>
              <span style={{ color: T.success, flexShrink: 0 }}>✓</span>{item}
            </div>
          ))}
        </Card>

        <Button fullWidth variant="teal" onClick={() => { setToast({ visible: true, message: "Briefing settings saved ✓" }); setTimeout(() => setToast({ visible: false, message: "" }), 2000); }}>
          Save Briefing Settings
        </Button>
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── AI Staff Coaching (RM-STF-004) ────────────────────
function AIStaffCoachingScreen({ staffMember, onNavigate }) {
  const s = staffMember || MOCK.staff[0];
  const convRate = ((s.conversions / s.sessions) * 100).toFixed(0);
  const storeAvg = 38;

  const insights = [
    {
      type: convRate < storeAvg ? "warning" : "positive",
      icon: convRate < storeAvg ? "📉" : "📈",
      title: convRate < storeAvg ? `Conversion ${convRate}% — below store average (${storeAvg}%)` : `Conversion ${convRate}% — above store average ✓`,
      detail: convRate < storeAvg
        ? `${s.name.split(" ")[0]}'s conversion rate has been consistently below the store average for the past 3 weeks. Pattern analysis suggests difficulty closing customers who are comparing 3+ sarees.`
        : `${s.name.split(" ")[0]} is the top converter this month. They excel at narrowing choices early in sessions.`,
      recommendation: convRate < storeAvg
        ? "Suggest role-play exercise: practice the 'final 2 sarees' closing technique with Mohan Kumar. Focus on helping customers decide between finalists rather than showing more options."
        : "Encourage them to mentor Rajesh on their shortlisting approach.",
      color: convRate < storeAvg ? T.amber : T.success,
    },
    {
      type: s.absentDays > 1 ? "warning" : "positive",
      icon: s.absentDays > 1 ? "📅" : "🎯",
      title: s.absentDays > 1 ? `${s.absentDays} absent days this month` : "Perfect attendance this month ✓",
      detail: s.absentDays > 1 ? "Multiple absences are affecting session continuity. Customers who return specifically for this staff member face disappointment." : "Consistent presence builds customer relationships and trust.",
      recommendation: s.absentDays > 1 ? "Schedule a 1:1 check-in. Understand if there are personal or scheduling issues. Consider shift adjustment if needed." : "Recognise this in the team meeting.",
      color: s.absentDays > 1 ? T.amber : T.success,
    },
    {
      type: "insight",
      icon: "🪞",
      title: `Average session: ${s.avgSessionTime} — ${parseInt(s.avgSessionTime) > 20 ? "slightly long" : "good pace"}`,
      detail: parseInt(s.avgSessionTime) > 20
        ? "Long sessions can mean customers are indecisive or being shown too many options. Research shows optimal saree try-on sessions are 15–20 minutes."
        : "Session length is optimal. Customers are getting enough time without feeling rushed.",
      recommendation: parseInt(s.avgSessionTime) > 20 ? "Encourage limiting first shortlist to 8 sarees max. Use the AI comparison tool to help customers narrow down faster." : "Continue current approach.",
      color: parseInt(s.avgSessionTime) > 20 ? T.gold : T.teal,
    },
    {
      type: "positive",
      icon: "💬",
      title: `WhatsApp sharing rate: ${Math.round(s.upsellRate * 0.6)}% of sessions`,
      detail: `${s.name.split(" ")[0]} consistently shares try-on images with customers who don't purchase immediately. This drives ${Math.round(s.revenue * 0.12 / 1000)}K in follow-up sales.`,
      recommendation: "This is excellent practice. Share this habit in team training as a model for other staff to follow.",
      color: T.success,
    },
  ];

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="AI Coaching Insights" onBack={() => onNavigate("staff-detail", s)} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", backgroundColor: T.white, borderRadius: T.radius, border: `1px solid ${T.border}`, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: T.cream, border: `2px solid ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: T.navy, flexShrink: 0 }}>{s.name[0]}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: T.navy }}>{s.name}</div>
            <div style={{ fontSize: 13, color: T.muted }}>{s.role} · Analysis based on last 30 days</div>
          </div>
        </div>

        <div style={{ padding: "10px 14px", backgroundColor: `${T.teal}08`, borderRadius: T.radius, marginBottom: 14, display: "flex", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>
            These insights are generated by analysing session outcomes, conversion patterns, timing, and behavioural signals. All recommendations are based on industry best practices for high-end retail.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {insights.map((ins, i) => (
            <Card key={i} style={{ padding: 16, border: `1px solid ${ins.color}30`, backgroundColor: `${ins.color}05` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{ins.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: ins.color }}>{ins.title}</div>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{ins.detail}</p>
                </div>
              </div>
              <div style={{ padding: "10px 12px", backgroundColor: T.white, borderRadius: T.radiusSm, border: `1px solid ${ins.color}20` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ins.color, marginBottom: 4 }}>💡 COACHING RECOMMENDATION</div>
                <div style={{ fontSize: 13, color: T.navy, lineHeight: 1.6 }}>{ins.recommendation}</div>
              </div>
            </Card>
          ))}
        </div>

        <Button fullWidth variant="teal" style={{ marginTop: 16 }} onClick={() => onNavigate("staff-detail", s)}>
          ← Back to Staff Profile
        </Button>
      </div>
    </div>
  );
}

// ── AI Markdown Optimization (RM-FIN-005) ─────────────
// (Integrated into AgingActionSheet as enhanced discount advisor)
function MarkdownOptimizerModal({ saree, isOpen, onClose }) {
  const tiers = [
    { days: 90, discount: 15, title: "Early Markdown", rationale: "12% probability of organic sale in next 30 days. 15% discount doubles sell-through probability.", projectedRevenue: Math.round(saree?.price * 0.85), margin: "Good", color: T.gold },
    { days: 120, discount: 25, title: "Active Clearance", rationale: "Stock is consuming shelf space costing ₹450/month. 25% off recovers capital faster than waiting.", projectedRevenue: Math.round(saree?.price * 0.75), margin: "Acceptable", color: T.amber },
    { days: 180, discount: 40, title: "Final Clearance", rationale: "Beyond 180 days, cost of storage exceeds marginal revenue. Prioritise capital recovery.", projectedRevenue: Math.round(saree?.price * 0.60), margin: "Cost Recovery", color: T.alert },
  ];
  if (!isOpen || !saree) return null;
  const recommended = saree.daysOld < 100 ? tiers[0] : saree.daysOld < 150 ? tiers[1] : tiers[2];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Markdown Optimizer" width={480}>
      <div style={{ padding: "0 0 12px", marginBottom: 12, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{saree.name}</div>
        <div style={{ fontSize: 13, color: T.muted }}>{saree.daysOld} days in stock · Current price: {formatINRFull(saree.price)}</div>
      </div>

      <div style={{ padding: "10px 12px", backgroundColor: `${T.gold}0C`, borderRadius: T.radiusSm, marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 18 }}>🤖</span>
        <div style={{ fontSize: 13, color: T.navy, fontWeight: 500 }}>
          Recommended: <strong style={{ color: T.gold }}>{recommended.title} ({recommended.discount}% off)</strong>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {tiers.map((tier, i) => (
          <div key={i} style={{ padding: 14, borderRadius: T.radius, border: `1.5px solid ${tier === recommended ? tier.color : T.border}`, backgroundColor: tier === recommended ? `${tier.color}08` : T.white }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: tier.color }}>{tier.title} — {tier.discount}% off</div>
              {tier === recommended && <Badge color={tier.color}>Recommended</Badge>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: T.muted }}>Sell at: <strong style={{ color: T.navy, fontFamily: "JetBrains Mono, monospace" }}>{formatINRFull(tier.projectedRevenue)}</strong></div>
              <div style={{ fontSize: 12, color: T.muted }}>Margin: <strong style={{ color: tier.color }}>{tier.margin}</strong></div>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.5 }}>{tier.rationale}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="gold" onClick={onClose} style={{ flex: 2 }}>Apply {recommended.discount}% Discount</Button>
      </div>
    </Modal>
  );
}

// ── Essential Mode Manual Revenue Entry (RM-ESS-003) ──
function EssentialRevenueEntryModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const n = parseFloat(amount);
    if (!amount || isNaN(n) || n < 0) { setError("Please enter a valid amount (0 or more)"); return; }
    if (n > 1000000) { setError("Amount seems too high. Maximum ₹10,00,000 per day."); return; }
    setError("");
    setSaved(true);
    setTimeout(() => { setSaved(false); setAmount(""); onClose(); }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Today's Sales Entry" width={360}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💰</div>
        <p style={{ margin: 0, fontSize: 14, color: T.textMid, lineHeight: 1.6 }}>Enter your total sales for today. This helps calculate your Store Health Score.</p>
      </div>
      {!saved ? (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 22, color: T.muted, fontWeight: 700 }}>₹</span>
            <input value={amount} onChange={e => { setAmount(e.target.value.replace(/[^\d]/g,"")); setError(""); }}
              placeholder="e.g. 45000" type="text" inputMode="numeric"
              style={{ flex: 1, padding: "14px 16px", border: `2px solid ${error ? T.alert : T.teal}`, borderRadius: T.radiusSm, fontSize: 24, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, outline: "none", textAlign: "center", color: T.navy }} />
          </div>
          {error && <div style={{ display: "flex", gap: 6, marginBottom: 10 }}><span>⚠️</span><span style={{ fontSize: 12, color: T.alert }}>{error}</span></div>}
          <p style={{ fontSize: 12, color: T.muted, textAlign: "center", marginBottom: 16 }}>This is optional but recommended. Your data stays on your store.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Skip Today</Button>
            <Button variant="teal" onClick={handleSave} style={{ flex: 2 }}>Save ₹{amount ? parseInt(amount).toLocaleString("en-IN") : "—"}</Button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 700, color: T.success }}>Saved ₹{parseInt(amount).toLocaleString("en-IN")} ✓</div>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════
// SESSION 8 — FINAL FEATURE COMPLETION
// ═══════════════════════════════════════════════════════

// ── Customer Follow-Up Queue (RM-WA-006) ─────────────
function FollowUpQueueScreen({ onNavigate }) {
  const [queue, setQueue] = useState(MOCK.followUpQueue);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const priorityConfig = {
    high:   { color: T.alert, bg: T.alertLight, label: "High Priority" },
    medium: { color: T.gold, bg: T.amberLight, label: "Medium" },
    low:    { color: T.muted, bg: T.cream, label: "Low" },
  };

  const handleSendMessage = (item) => {
    if (!item.phone) { setToast({ visible: true, message: "No phone number — cannot send WhatsApp" }); setTimeout(() => setToast({ visible: false, message: "" }), 2000); return; }
    const sareeList = item.shortlistedSarees.join(", ");
    const msg = encodeURIComponent(`Hi ${item.customer}! 🌸\n\nWe noticed you showed interest in ${sareeList} during your last visit. Just wanted to check if you'd like to come back and have another look!\n\n— ${MOCK.store.name}, ${MOCK.store.city}`);
    window.open(`https://wa.me/91${item.phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
    setQueue(q => q.map(fi => fi.id === item.id ? { ...fi, status: "sent" } : fi));
    setToast({ visible: true, message: `Follow-up sent to ${item.customer} ✓` });
    setTimeout(() => setToast({ visible: false, message: "" }), 2200);
  };

  const handleDismiss = (id) => setQueue(q => q.filter(fi => fi.id !== id));

  const pending = queue.filter(f => f.status === "pending");
  const sent = queue.filter(f => f.status === "sent");

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Follow-Up Queue" onBack={() => onNavigate("campaigns")} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Pending Follow-ups", value: pending.length, color: T.alert, icon: "⏳" },
            { label: "Sent This Week", value: sent.length + 18, color: T.success, icon: "✅" },
          ].map((k, i) => (
            <Card key={i} style={{ padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 22 }}>{k.icon}</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 24, color: k.color, marginTop: 4 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: T.muted }}>{k.label}</div>
            </Card>
          ))}
        </div>

        {pending.length === 0 ? (
          <EmptyState icon="🎉" title="All follow-ups complete!" subtitle="No pending follow-ups. New ones appear here after customer sessions." />
        ) : (
          <>
            <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: T.navy }}>⏳ Pending ({pending.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {pending.map(item => {
                const pc = priorityConfig[item.priority];
                return (
                  <Card key={item.id} style={{ padding: 0, overflow: "hidden", border: `1px solid ${pc.color}30` }}>
                    <div style={{ padding: "10px 14px", backgroundColor: pc.bg, display: "flex", gap: 8, alignItems: "center" }}>
                      <Badge color={pc.color}>{pc.label}</Badge>
                      <span style={{ fontSize: 12, color: T.muted }}>Due: <strong style={{ color: pc.color }}>{item.dueIn}</strong></span>
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.navy, marginBottom: 2 }}>{item.customer}</div>
                      <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>Visited: {item.visitDate} · Session: {item.sessionId}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: T.muted }}>Interested in:</span>
                        {item.shortlistedSarees.map((s, si) => <Badge key={si} color={T.teal}>{s}</Badge>)}
                      </div>
                      <div style={{ padding: "8px 10px", backgroundColor: T.cream, borderRadius: T.radiusSm, fontSize: 12, color: T.textMid, marginBottom: 12 }}>
                        💡 {item.reason}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button size="sm" variant="teal" onClick={() => handleSendMessage(item)} style={{ flex: 2 }}>
                          {item.phone ? "📱 Send WhatsApp" : "📞 Call (No WA)"}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleDismiss(item.id)}>Dismiss</Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {sent.length > 0 && (
          <>
            <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: T.muted }}>✅ Sent ({sent.length})</h3>
            {sent.map(item => (
              <Card key={item.id} style={{ padding: "10px 14px", marginBottom: 8, opacity: 0.7 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 18 }}>✅</span>
                  <div style={{ flex: 1, fontSize: 13, color: T.muted }}>{item.customer} — {item.visitDate}</div>
                  <Badge color={T.success}>Sent</Badge>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── Auto-Triggered Campaigns (RM-WA-004) ─────────────
function AutoTriggersScreen({ onNavigate }) {
  const [triggers, setTriggers] = useState(MOCK.autoTriggers);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const toggleTrigger = (id) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
    const trig = triggers.find(t => t.id === id);
    setToast({ visible: true, message: `${trig.name} ${trig.enabled ? "disabled" : "enabled"} ✓` });
    setTimeout(() => setToast({ visible: false, message: "" }), 1800);
  };

  const activeCount = triggers.filter(t => t.enabled).length;
  const totalSent = triggers.reduce((s, t) => s + t.sentThisMonth, 0);

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Automated WhatsApp Triggers" onBack={() => onNavigate("campaigns")} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <Card style={{ padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>⚡</div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 22, color: T.success, marginTop: 4 }}>{activeCount}/{triggers.length}</div>
            <div style={{ fontSize: 11, color: T.muted }}>Active Triggers</div>
          </Card>
          <Card style={{ padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>📤</div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 22, color: T.teal, marginTop: 4 }}>{totalSent}</div>
            <div style={{ fontSize: 11, color: T.muted }}>Auto-Sent This Month</div>
          </Card>
        </div>

        <div style={{ padding: "10px 14px", backgroundColor: `${T.gold}0C`, borderRadius: T.radius, border: `1px solid ${T.gold}25`, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>
            ⚡ Auto-triggers send messages automatically based on customer actions and dates. They respect the <strong>2 messages/customer/month</strong> frequency cap and require active WhatsApp marketing consent.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {triggers.map(trig => (
            <Card key={trig.id} style={{ padding: 0, overflow: "hidden", border: trig.enabled ? `1px solid ${trig.color}30` : `1px solid ${T.border}` }}>
              <div style={{ padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${trig.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{trig.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{trig.name}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>⏱ {trig.timing}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>👥 {trig.audience}</div>
                </div>
                <div style={{ textAlign: "right", marginRight: 8 }}>
                  {trig.sentThisMonth > 0 && <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 13, color: T.success }}>{trig.sentThisMonth} sent</div>}
                </div>
                <div onClick={() => toggleTrigger(trig.id)} style={{ width: 48, height: 26, borderRadius: 13, backgroundColor: trig.enabled ? trig.color : T.border, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: T.white, position: "absolute", top: 3, left: trig.enabled ? 24 : 3, transition: "left 0.2s", boxShadow: T.shadow }} />
                </div>
              </div>
              {trig.enabled && (
                <div style={{ padding: "8px 16px 12px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: T.muted }}>Template: <strong>{trig.template}</strong></span>
                  <Button size="sm" variant="ghost" onClick={() => onNavigate("campaign-builder")} style={{ marginLeft: "auto" }}>Edit Template</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── Missed Demand Intelligence (RM-ANA-008) ───────────
function MissedDemandScreen({ onNavigate }) {
  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Missed Demand Intelligence" onBack={() => onNavigate("analytics")} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ padding: "12px 14px", backgroundColor: `${T.teal}08`, borderRadius: T.radius, border: `1px solid ${T.teal}20`, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>📊 How This Works</div>
          <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>
            When customers search on the Sales Tablet and get zero results — or very few results — Wearify captures those queries. These represent unmet demand in your store. Each item below is a restocking opportunity.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <Card style={{ padding: 12, textAlign: "center" }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 24, color: T.alert }}>59</div>
            <div style={{ fontSize: 11, color: T.muted }}>Total missed searches (30d)</div>
          </Card>
          <Card style={{ padding: 12, textAlign: "center" }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 24, color: T.gold }}>₹2.1L</div>
            <div style={{ fontSize: 11, color: T.muted }}>Potential revenue missed</div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK.missedDemand.map((item, i) => (
            <Card key={i} style={{ padding: 16, border: i === 0 ? `2px solid ${T.alert}40` : `1px solid ${T.border}` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: item.color, flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>"{item.query}"</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{item.category} · Target price: up to ₹{item.pricePoint.toLocaleString("en-IN")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 20, color: T.alert }}>{item.count}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>searches</div>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: T.muted }}>Currently in stock:</span>
                  <span style={{ fontWeight: 700, color: item.available === 0 ? T.alert : T.gold }}>{item.available} sarees match</span>
                </div>
                <ProgressBar value={item.available} max={10} color={item.available === 0 ? T.alert : T.gold} height={6} />
              </div>
              <div style={{ padding: "8px 10px", backgroundColor: `${T.teal}08`, borderRadius: T.radiusSm, fontSize: 12, color: T.teal, fontWeight: 500, marginBottom: 10 }}>
                💡 {item.insight}
              </div>
              <Button size="sm" variant="ghost" onClick={() => onNavigate("reorder")}>View Reorder Suggestions →</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Basket Analysis (RM-ANA-011) ─────────────────────
function BasketAnalysisScreen({ onNavigate }) {
  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Cross-Sell Basket Analysis" onBack={() => onNavigate("analytics")} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ padding: "12px 14px", backgroundColor: `${T.navy}08`, borderRadius: T.radius, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>🛒 Powered by Apriori / FP-Growth (mlxtend)</div>
          <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>Discovers which sarees are frequently bought together. These patterns train the Sales Tablet's recommendation engine — staff see these as "Customers Also Bought" suggestions during sessions.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Rules Found", value: MOCK.basketRules.length, color: T.navy, icon: "🔗" },
            { label: "Avg Confidence", value: `${Math.round(MOCK.basketRules.reduce((s, r) => s + r.confidence, 0) / MOCK.basketRules.length * 100)}%`, color: T.teal, icon: "🎯" },
            { label: "Top Lift", value: `${Math.max(...MOCK.basketRules.map(r => r.lift))}x`, color: T.gold, icon: "📈" },
          ].map((k, i) => (
            <Card key={i} style={{ padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{k.icon}</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 18, color: k.color, marginTop: 4 }}>{k.value}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{k.label}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MOCK.basketRules.map((rule, i) => (
            <Card key={i} style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge color={T.teal}>{rule.antecedent}</Badge>
                    <span style={{ fontSize: 16, color: T.muted }}>→</span>
                    <Badge color={T.gold}>{rule.consequent}</Badge>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
                {[
                  { label: "Confidence", value: `${Math.round(rule.confidence * 100)}%`, color: T.teal, tip: "When customer buys A, they also buy B this % of the time" },
                  { label: "Lift", value: `${rule.lift}x`, color: T.gold, tip: "How much more likely vs random chance (>1.5 = significant)" },
                  { label: "Support", value: `${Math.round(rule.support * 100)}%`, color: T.navy, tip: "% of all transactions that include both items" },
                ].map((m, mi) => (
                  <div key={mi} style={{ textAlign: "center", padding: "8px 4px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 16, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: T.muted }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "8px 10px", backgroundColor: `${T.teal}08`, borderRadius: T.radiusSm, fontSize: 12, color: T.teal, fontWeight: 500 }}>
                💡 {rule.insight}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CLV Predictions Dashboard (RM-CRM-006) ───────────
function CLVPredictionsScreen({ onNavigate }) {
  const [sortBy, setSortBy] = useState("predicted12m");
  const sorted = [...MOCK.clvPredictions].sort((a, b) => b[sortBy] - a[sortBy]);

  const tierConfig = {
    "High-Value":  { color: T.gold, bg: T.amberLight, icon: "⭐" },
    "Growing":     { color: T.success, bg: T.successLight, icon: "📈" },
    "Medium-Value":{ color: T.teal, bg: `${T.teal}12`, icon: "🔵" },
    "At-Risk":     { color: T.alert, bg: T.alertLight, icon: "🚨" },
  };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="AI Customer Lifetime Value" onBack={() => onNavigate("customers")} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ padding: "12px 14px", backgroundColor: `${T.navy}08`, borderRadius: T.radius, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>🤖 PyMC-Marketing BG/NBD Model</div>
          <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>Predicts how much each customer will spend over the next 12 months and 3 years, based on purchase frequency, recency, and monetary value. Updated monthly.</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["predicted12m", "12-Month"], ["predictedCLV3y", "3-Year"], ["churnProbability", "Churn Risk"]].map(([val, label]) => (
            <button key={val} onClick={() => setSortBy(val)}
              style={{ padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, backgroundColor: sortBy === val ? T.navy : T.cream, color: sortBy === val ? T.white : T.muted, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map((c, i) => {
            const tc = tierConfig[c.tier];
            const growthPct = Math.round(((c.predictedCLV12m - c.currentCLV) / c.currentCLV) * 100);
            return (
              <Card key={c.customerId} onClick={() => onNavigate("customer-profile", MOCK.customers.find(cu => cu.id === c.customerId))}
                style={{ padding: 16, border: `1px solid ${tc.color}25` }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${tc.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{tc.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{c.name}</div>
                    <Badge color={tc.color} bg={tc.bg}>{c.tier}</Badge>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: T.muted }}>Predicted 12m</div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 18, color: tc.color }}>{formatINR(c.predictedCLV12m)}</div>
                    <DeltaBadge value={growthPct} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {[
                    { label: "Current CLV", value: formatINR(c.currentCLV), color: T.navy },
                    { label: "3-Year CLV", value: formatINR(c.predictedCLV3y), color: T.teal },
                    { label: "Churn Risk", value: `${Math.round(c.churnProbability * 100)}%`, color: c.churnProbability > 0.5 ? T.alert : c.churnProbability > 0.25 ? T.gold : T.success },
                  ].map((m, mi) => (
                    <div key={mi} style={{ padding: "8px 6px", backgroundColor: T.cream, borderRadius: T.radiusSm, textAlign: "center" }}>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 13, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "8px 10px", backgroundColor: `${tc.color}08`, borderRadius: T.radiusSm, fontSize: 12, color: tc.color, fontWeight: 500 }}>
                  🎯 {c.recommendation}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Smart Pricing Suggestions (RM-PRD-003) ───────────
function SmartPricingScreen({ onNavigate }) {
  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Smart Pricing Suggestions" onBack={() => onNavigate("analytics")} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ padding: "12px 14px", backgroundColor: `${T.navy}08`, borderRadius: T.radius, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>🤖 AI Price Sensitivity Analysis</div>
          <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>AI analyses conversion rates across different price brackets within each category. These are suggestions — you decide the final price. The goal is to highlight where price changes have the biggest impact on sales.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MOCK.pricingInsights.map((cat, i) => (
            <Card key={i} style={{ padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.navy, marginBottom: 14 }}>{cat.category}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                {[cat.band1, cat.band2, cat.band3].map((band, bi) => {
                  const isOptimalRange = band === cat.band1;
                  const barH = [band.conv, 100];
                  return (
                    <div key={bi} style={{ textAlign: "center", padding: "12px 8px", backgroundColor: bi === 0 ? `${T.success}0A` : bi === 2 ? T.alertLight : T.cream, borderRadius: T.radiusSm, border: `1px solid ${bi === 0 ? T.success : bi === 2 ? T.alert : T.border}30` }}>
                      <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{band.range}</div>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 20, color: bi === 0 ? T.success : bi === 2 ? T.alert : T.gold }}>{band.conv}%</div>
                      <div style={{ fontSize: 10, color: T.muted }}>conversion</div>
                      {bi === 0 && <Badge color={T.success} style={{ marginTop: 4, fontSize: 9 }}>Best</Badge>}
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "10px 12px", backgroundColor: `${T.gold}0A`, borderRadius: T.radiusSm, border: `1px solid ${T.gold}25`, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: T.navy }}><strong>Recommended price band:</strong> {cat.optimal}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>💡 {cat.insight}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Footfall Prediction (RM-PRD-005) ─────────────────
function FootfallPredictionScreen({ onNavigate }) {
  const maxFootfall = Math.max(...MOCK.footfallForecast.map(d => d.upper));
  const totalWeek = MOCK.footfallForecast.reduce((s, d) => s + d.predicted, 0);

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Footfall Prediction" onBack={() => onNavigate("analytics")} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <Card style={{ padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>👣</div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 24, color: T.teal, marginTop: 4 }}>{totalWeek}</div>
            <div style={{ fontSize: 11, color: T.muted }}>Predicted this week</div>
          </Card>
          <Card style={{ padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>📅</div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 24, color: T.gold, marginTop: 4 }}>Sat</div>
            <div style={{ fontSize: 11, color: T.muted }}>Busiest day this week</div>
          </Card>
        </div>

        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>7-Day Forecast</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK.footfallForecast.map((day, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 70, fontSize: 12, color: T.muted, flexShrink: 0 }}>{day.day.split(" ")[0]}</div>
                <div style={{ flex: 1, position: "relative", height: 20 }}>
                  {/* Confidence band */}
                  <div style={{ position: "absolute", left: `${(day.lower / maxFootfall) * 100}%`, width: `${((day.upper - day.lower) / maxFootfall) * 100}%`, height: "100%", backgroundColor: `${T.teal}20`, borderRadius: 4 }} />
                  {/* Predicted bar */}
                  <div style={{ position: "absolute", left: 0, width: `${(day.predicted / maxFootfall) * 100}%`, height: "100%", backgroundColor: T.teal, borderRadius: 4, opacity: 0.85 }} />
                </div>
                <div style={{ width: 30, textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 13, color: T.navy, flexShrink: 0 }}>{day.predicted}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: T.muted }}>
            <span><span style={{ color: T.teal, fontWeight: 700 }}>■</span> Predicted</span>
            <span><span style={{ color: `${T.teal}40`, fontWeight: 700 }}>■</span> Confidence range</span>
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>📋 Staff Scheduling Recommendations</h3>
          {[
            { day: "Mon–Thu", footfall: "9–14 customers", staff: "2 staff (1 morning, 1 evening)", note: "Standard weekday coverage" },
            { day: "Fri", footfall: "18 customers", staff: "3 staff", note: "Pre-weekend pickup, ensure full coverage" },
            { day: "Sat", footfall: "28 customers", staff: "4–5 staff", note: "Peak day — all hands on deck, open on time" },
            { day: "Sun", footfall: "22 customers", staff: "3–4 staff", note: "Family shopping day — bridal session slots recommended" },
          ].map((rec, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 12px", borderRadius: T.radiusSm, backgroundColor: T.cream, marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, width: 60, flexShrink: 0 }}>{rec.day}</div>
              <div>
                <div style={{ fontSize: 12, color: T.textMid }}>{rec.staff} · {rec.footfall}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{rec.note}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── Wedding Season Projector (RM-PRD-002) ─────────────
function WeddingSeasonScreen({ onNavigate }) {
  const ws = MOCK.weddingSeasonData;
  const maxRevenue = Math.max(...ws.projections.map(p => p.revenue));

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Wedding Season Projector" onBack={() => onNavigate("forecast")} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ padding: "12px 16px", background: `linear-gradient(135deg, ${T.navy} 0%, ${T.teal} 100%)`, borderRadius: T.radius, marginBottom: 14, color: T.white }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>💍 Wedding Season Nov–Feb</div>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85, lineHeight: 1.6 }}>Bridal saree demand peaks in November–January. Plan inventory, staffing, and promotions 8–10 weeks in advance.</p>
        </div>

        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>6-Month Revenue Projection</h3>
          {ws.projections.map((month, i) => {
            const isPeak = ["Nov","Dec","Jan"].includes(month.month);
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: isPeak ? T.gold : T.navy }}>{month.month}</span>
                    {isPeak && <Badge color={T.gold}>Peak Season</Badge>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: isPeak ? T.gold : T.navy }}>{formatINR(month.revenue)}</span>
                    <span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>of which 💍 {formatINR(month.bridal)}</span>
                  </div>
                </div>
                <div style={{ position: "relative", height: 12, backgroundColor: T.creamDark, borderRadius: 6 }}>
                  <div style={{ position: "absolute", left: 0, width: `${(month.bridal / maxRevenue) * 100}%`, height: "100%", backgroundColor: `${T.gold}60`, borderRadius: 6 }} />
                  <div style={{ position: "absolute", left: 0, width: `${(month.revenue / maxRevenue) * 100}%`, height: "100%", backgroundColor: isPeak ? T.gold : T.teal, borderRadius: 6, opacity: 0.7 }} />
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Recommended staff: {month.staffNeeded}</div>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11, color: T.muted }}>
            <span><span style={{ color: T.teal, fontWeight: 700 }}>■</span> Total revenue</span>
            <span><span style={{ color: `${T.gold}80`, fontWeight: 700 }}>■</span> Bridal sarees</span>
          </div>
        </Card>

        <Card style={{ padding: 14 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: T.navy }}>🤖 AI Recommendations</h3>
          {ws.insights.map((insight, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", backgroundColor: T.cream, borderRadius: T.radiusSm, marginBottom: 8 }}>
              <span style={{ color: T.gold, fontSize: 14, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 13, color: T.navy, lineHeight: 1.5 }}>{insight}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── AI Product Description Generator (RM-CAT-010) ─────
function AIDescriptionScreen({ saree, onNavigate }) {
  const s = saree || MOCK.sarees[0];
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [language, setLanguage] = useState("en");
  const [description, setDescription] = useState(s.description || "");
  const [toast, setToast] = useState({ visible: false, message: "" });

  const sampleDescriptions = {
    en: `This exquisite ${s.name} is a masterpiece of Indian textile heritage. Handwoven in ${s.region} using ${s.fabric}, it features ${s.weave.toLowerCase()} work in rich ${s.colorName.toLowerCase()} hues. The intricate design makes it perfect for ${s.occasion.toLowerCase()} occasions. Its ${s.weight.toLowerCase()} drape ensures graceful movement throughout the day. A timeless addition to any saree collection.`,
    hi: `यह अद्भुत ${s.name} भारतीय वस्त्र विरासत की एक उत्कृष्ट कृति है। ${s.region} में हाथ से बुनी गई इस साड़ी में ${s.colorName.toLowerCase()} रंग की समृद्ध ${s.weave.toLowerCase()} कला है। इसकी जटिल डिजाइन इसे ${s.occasion.toLowerCase()} अवसरों के लिए आदर्श बनाती है।`,
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setDescription(sampleDescriptions[language] || sampleDescriptions.en);
      setGenerated(true);
      setGenerating(false);
    }, 2200);
  };

  const handleSave = () => {
    setToast({ visible: true, message: "Description saved to saree catalogue ✓" });
    setTimeout(() => { setToast({ visible: false, message: "" }); onNavigate("saree-detail", s); }, 1800);
  };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 100, backgroundColor: T.cream }}>
      <ScreenHeader title="AI Description Generator" onBack={() => onNavigate("saree-detail", s)} />
      <div style={{ padding: "14px 16px" }}>
        {/* Saree context */}
        <Card style={{ padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 32 }}>{s.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.navy }}>{s.name}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{s.fabric} · {s.region} · {s.occasion}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                {s.aiTags.slice(0, 4).map((tag, ti) => <Badge key={ti} color={T.teal}>{tag}</Badge>)}
              </div>
            </div>
          </div>
        </Card>

        {/* Language selector */}
        <Card style={{ padding: 14, marginBottom: 14 }}>
          <Select label="Generate description in" value={language} onChange={setLanguage}
            options={[{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी (Hindi)" }, { value: "kn", label: "ಕನ್ನಡ (Kannada)" }, { value: "mr", label: "मराठी (Marathi)" }]} />
          <div style={{ padding: "10px 12px", backgroundColor: `${T.teal}08`, borderRadius: T.radiusSm, marginTop: -4, marginBottom: 0, fontSize: 12, color: T.textMid }}>
            🤖 Claude Haiku will generate a 2–3 sentence, culturally appropriate description using the saree's AI tags as input. You can edit the result before saving.
          </div>
        </Card>

        <Button fullWidth variant="teal" onClick={handleGenerate} disabled={generating} style={{ marginBottom: 14 }}>
          {generating ? "✨ Claude Haiku is writing..." : "✨ Generate Description"}
        </Button>

        {generating && (
          <Card style={{ padding: 16, marginBottom: 14 }}>
            <ProgressBar value={65} color={T.teal} />
            <div style={{ fontSize: 12, color: T.muted, marginTop: 8, textAlign: "center" }}>Analysing saree attributes · Generating culturally appropriate copy...</div>
          </Card>
        )}

        {generated && (
          <Card style={{ padding: 16, marginBottom: 14, border: `1px solid ${T.teal}30` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 16 }}>🤖</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>AI-Generated Description</span>
              </div>
              <Badge color={T.success}>Ready to use</Badge>
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
              style={{ width: "100%", padding: "12px 14px", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 14, fontFamily: "IBM Plex Sans, sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6, color: T.text }} />
            <p style={{ margin: "8px 0 0", fontSize: 11, color: T.muted }}>Edit above before saving. This description will appear on the Smart Mirror and Sales Tablet.</p>
          </Card>
        )}

        {generated && (
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={handleGenerate} style={{ flex: 1 }}>🔄 Regenerate</Button>
            <Button variant="primary" onClick={handleSave} style={{ flex: 2 }}>Save Description →</Button>
          </div>
        )}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}

// ── Catalogue Readiness Score Widget (RM-CAT-009) ─────
function CatalogueReadinessScreen({ onNavigate }) {
  const score = 84;
  const factors = [
    { label: "Sarees digitised", value: 84, max: 100, unit: "%", color: T.teal, target: 100, action: "upload" },
    { label: "Sarees with 4 photos", value: 61, max: 100, unit: "%", color: T.gold, target: 80, action: "upload" },
    { label: "AI tags complete", value: 78, max: 100, unit: "%", color: T.teal, target: 95, action: "saree-detail" },
    { label: "Descriptions written", value: 42, max: 100, unit: "%", color: T.amber, target: 70, action: "ai-description" },
    { label: "Prices updated <30d", value: 91, max: 100, unit: "%", color: T.success, target: 90, action: "inventory" },
    { label: "No duplicate SKUs", value: 98, max: 100, unit: "%", color: T.success, target: 100, action: "inventory" },
  ];
  const overallColor = score >= 80 ? T.success : score >= 60 ? T.gold : T.alert;

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Catalogue Readiness Score" onBack={() => onNavigate("inventory")} />
      <div style={{ padding: "14px 16px" }}>
        {/* Hero score */}
        <Card style={{ padding: 20, marginBottom: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`, textAlign: "center" }}>
          <div style={{ marginBottom: 8 }}>
            <HealthScoreGauge score={score} size={160} />
          </div>
          <div style={{ color: `${T.white}CC`, fontSize: 13 }}>Catalogue Readiness Score</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
            <Badge color={overallColor} bg={`${overallColor}25`}>
              {score >= 80 ? "🟢 Good — Smart Mirror operating well" : score >= 60 ? "🟡 Needs improvement" : "🔴 Low — affects customer experience"}
            </Badge>
          </div>
        </Card>

        {/* Factor breakdown */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: T.navy }}>Score Breakdown</h3>
          {factors.map((factor, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < factors.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{factor.label}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {factor.value < factor.target && <span style={{ fontSize: 11, color: T.muted }}>Target: {factor.target}%</span>}
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: factor.color }}>{factor.value}{factor.unit}</span>
                </div>
              </div>
              <ProgressBar value={factor.value} max={100} color={factor.color} height={7} />
              {factor.value < factor.target && (
                <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: T.muted }}>Gap: {factor.target - factor.value}% to target</span>
                  <button onClick={() => onNavigate(factor.action === "ai-description" ? "inventory" : factor.action)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: T.teal, fontWeight: 600 }}>
                    Fix now →
                  </button>
                </div>
              )}
            </div>
          ))}
        </Card>

        <Card style={{ padding: 14, backgroundColor: `${T.teal}08`, border: `1px solid ${T.teal}20` }}>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>Top Improvement Opportunity</div>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>Adding AI descriptions to your remaining 58% of sarees could increase mirror try-on rate by 15–20%. Use the AI Description Generator for batch creation.</p>
              <Button size="sm" variant="teal" onClick={() => onNavigate("inventory")}>Generate Missing Descriptions →</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Financial Overview: ATV + Margin (RM-FIN-002, 004) ─
function FinancialDetailScreen({ onNavigate }) {
  const [costPrices, setCostPrices] = useState({
    "SAR001": "28000", "SAR002": "11000", "SAR003": "3200",
    "SAR004": "15000", "SAR005": "8000", "SAR006": "2200",
  });
  const [editingCost, setEditingCost] = useState(null);
  const [errors, setErrors] = useState({});

  const transactions = [
    { date: "Mar 22", saree: "Kanjivaram Pure Silk", price: 45000, qty: 1 },
    { date: "Mar 22", saree: "Banarasi Georgette", price: 18500, qty: 1 },
    { date: "Mar 21", saree: "Tant Cotton Daily", price: 3500, qty: 2 },
    { date: "Mar 20", saree: "Sambalpuri Ikat", price: 8500, qty: 1 },
    { date: "Mar 19", saree: "Chanderi Cotton Silk", price: 5200, qty: 1 },
  ];

  const totalRevenue = transactions.reduce((s, t) => s + t.price * t.qty, 0);
  const txCount = transactions.length;
  const atv = Math.round(totalRevenue / txCount);

  const categoryCosts = [
    { name: "Kanjivaram Silk", revenue: 180000, cost: 112000 },
    { name: "Banarasi Georgette", revenue: 142000, cost: 84000 },
    { name: "Chanderi Cotton", revenue: 88000, cost: 52000 },
    { name: "Tant Cotton", revenue: 63000, cost: 31000 },
    { name: "Pochampally Ikat", revenue: 72000, cost: 48000 },
  ];

  const validateCost = (id, val) => {
    const err = VALIDATION.price(val);
    setErrors(prev => ({ ...prev, [id]: err || undefined }));
    return !err;
  };

  return (
    <div style={{ fontFamily: "IBM Plex Sans, sans-serif", paddingBottom: 80, backgroundColor: T.cream }}>
      <ScreenHeader title="Financial Overview" onBack={() => onNavigate("analytics")} />
      <div style={{ padding: "14px 16px" }}>
        {/* ATV Card */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>💰 Average Transaction Value (ATV)</h3>
            <HelpTooltip text="Total revenue divided by number of transactions. Higher ATV means you're upselling effectively." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Current ATV", value: formatINR(atv), color: T.success },
              { label: "Last Month ATV", value: "₹7.2K", color: T.muted },
              { label: "Change", value: `+${Math.round(((atv - 7200) / 7200) * 100)}%`, color: T.success },
            ].map((m, i) => (
              <div key={i} style={{ textAlign: "center", padding: "10px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: 18, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {transactions.slice(0, 4).map((tx, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMid, padding: "6px 10px", backgroundColor: T.cream, borderRadius: T.radiusSm }}>
                <span>{tx.date} · {tx.saree}</span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: T.navy }}>{formatINR(tx.price * tx.qty)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Margin tracking */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.navy }}>📊 Margin by Category</h3>
            <HelpTooltip text="Enter your buying cost per saree (optional). Wearify calculates your gross margin automatically." />
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: T.muted }}>Enter cost prices to see margin analysis. Data stays private on your store.</p>

          {categoryCosts.map((cat, i) => {
            const margin = Math.round(((cat.revenue - cat.cost) / cat.revenue) * 100);
            const marginColor = margin >= 35 ? T.success : margin >= 20 ? T.gold : T.alert;
            return (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < categoryCosts.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{cat.name}</span>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: T.muted }}>Revenue: {formatINR(cat.revenue)}</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: marginColor }}>{margin}% margin</span>
                  </div>
                </div>
                <ProgressBar value={margin} max={60} color={marginColor} height={7} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.muted, marginTop: 3 }}>
                  <span>Cost: {formatINR(cat.cost)}</span>
                  <span>Gross profit: {formatINR(cat.revenue - cat.cost)}</span>
                </div>
              </div>
            );
          })}

          <div style={{ padding: "10px 12px", backgroundColor: `${T.teal}08`, borderRadius: T.radiusSm, marginTop: 4, fontSize: 12, color: T.textMid }}>
            💡 To update cost prices per saree, go to the Saree Edit screen and add the cost price. Wearify never shares cost data externally.
          </div>
        </Card>
      </div>
    </div>
  );
}

function PlaceholderScreen({ name, icon, description, session }) {
  return (
    <div style={{ padding: 20, fontFamily: "IBM Plex Sans, sans-serif" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: T.navy }}>{name}</h2>
      <div style={{ marginTop: 80, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div>
        <h3 style={{ color: T.navy, margin: "0 0 8px" }}>{name}</h3>
        <p style={{ color: T.muted, fontSize: 14, maxWidth: 300, margin: "0 auto 24px", lineHeight: 1.6 }}>{description}</p>
        <Badge color={T.teal}>Building in Session {session}</Badge>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// NAVIGATION — SIDEBAR + BOTTOM TABS
// ═══════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "🏠", group: "main" },
  { id: "inventory", label: "Catalogue", icon: "👗", group: "main", sub: [
    { id: "upload", label: "Add Saree", icon: "➕" },
    { id: "csv-import", label: "Import from Excel", icon: "📂" },
    { id: "batch-upload", label: "Batch Upload", icon: "📁" },
    { id: "aging", label: "Aging Stock", icon: "⚠️" },
    { id: "reorder", label: "Reorder AI", icon: "🔄" },
    { id: "abc-class", label: "ABC Classification", icon: "🏷" },
    { id: "catalogue-readiness", label: "Readiness Score", icon: "📊" },
    { id: "wedding-season", label: "Wedding Season Plan", icon: "💍" },
  ]},
  { id: "customers", label: "Customers", icon: "👥", group: "main", sub: [
    { id: "segment-builder", label: "Segment Builder", icon: "🎯" },
    { id: "dpdp-consent", label: "DPDP Consent", icon: "🔐" },
    { id: "clv-predictions", label: "AI Customer Lifetime Value", icon: "📈" },
    { id: "follow-up-queue", label: "Follow-Up Queue", icon: "⏳" },
  ]},
  { id: "campaigns", label: "Campaigns", icon: "📱", group: "main", sub: [
    { id: "campaign-builder", label: "New Campaign", icon: "➕" },
    { id: "auto-triggers", label: "Auto Triggers", icon: "⚡" },
    { id: "follow-up-queue", label: "Follow-Up Queue", icon: "⏳" },
  ]},
  { id: "analytics", label: "Analytics", icon: "📊", group: "main", sub: [
    { id: "revenue", label: "Revenue Detail", icon: "💰" },
    { id: "category-perf", label: "Category Report", icon: "🗂" },
    { id: "health", label: "Health Score", icon: "💚" },
    { id: "forecast", label: "AI Forecast", icon: "🤖" },
    { id: "dead-stock", label: "Dead Stock Curve", icon: "📉" },
    { id: "session-attribution", label: "Session Attribution", icon: "🔗" },
    { id: "tried-sold-shared", label: "Tried vs Sold vs Shared", icon: "📊" },
    { id: "missed-demand", label: "Missed Demand", icon: "🔍" },
    { id: "basket-analysis", label: "Basket Analysis", icon: "🛒" },
    { id: "smart-pricing", label: "Smart Pricing", icon: "🏷" },
    { id: "footfall-prediction", label: "Footfall Prediction", icon: "👣" },
    { id: "financial-detail", label: "Financial Overview", icon: "💹" },
  ]},
  { id: "staff", label: "Staff", icon: "🧑‍💼", group: "main", sub: [
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
  ]},
  { id: "settings", label: "Settings", icon: "⚙️", group: "bottom", sub: [
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "billing", label: "Billing", icon: "💳" },
    { id: "connected-apps", label: "Connected Apps", icon: "🔗" },
    { id: "morning-briefing", label: "Morning Briefing", icon: "☀️" },
    { id: "data-export", label: "Export Data", icon: "📤" },
    { id: "support", label: "Help & Support", icon: "💬" },
  ]},
];

function Sidebar({ activeScreen, onNavigate, store, collapsed, onToggle }) {
  const [expandedGroups, setExpandedGroups] = useState(["inventory"]);
  const toggleGroup = (id) => setExpandedGroups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="rm-noise rm-paisley" style={{
      width: collapsed ? 64 : 244, flexShrink: 0,
      background: T.gradNav,
      display: "flex", flexDirection: "column",
      transition: "width 0.25s cubic-bezier(.22,1,.36,1)",
      overflowX: "hidden", position: "relative",
    }}>
      {/* Subtle gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(201,148,26,.06) 0%, transparent 40%, rgba(26,74,101,.15) 100%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Logo row */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: collapsed ? "20px 0" : "20px 18px",
        borderBottom: "1px solid rgba(201,148,26,.18)",
        display: "flex", alignItems: "center", gap: 10,
        justifyContent: collapsed ? "center" : "space-between",
      }}>
        {!collapsed && (
          <div>
            <div className="rm-gold-shimmer" style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontWeight: 700, fontSize: 19, fontStyle: "italic",
              lineHeight: 1.1,
            }}>Wearify</div>
            <div style={{ fontSize: 11, color: "rgba(253,248,240,.48)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 148 }}>
              {store.name}
            </div>
          </div>
        )}
        {collapsed && <span style={{ fontSize: 20 }}>🪢</span>}
        <button onClick={onToggle} style={{
          background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)",
          cursor: "pointer", color: "rgba(253,248,240,.55)", fontSize: 13,
          padding: 0, width: 28, height: 28, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background .15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
        >{collapsed ? "»" : "«"}</button>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0", position: "relative", zIndex: 1 }}
        className="rm-no-scroll">
        {NAV_ITEMS.filter(n => n.group === "main").map(item => (
          <div key={item.id}>
            <div onClick={() => { onNavigate(item.id); if (item.sub) toggleGroup(item.id); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: collapsed ? "11px 0" : "10px 16px",
                justifyContent: collapsed ? "center" : "flex-start",
                cursor: "pointer",
                background: activeScreen === item.id ? "rgba(253,248,240,.10)" : "transparent",
                borderLeft: `3px solid ${activeScreen === item.id ? T.gold : "transparent"}`,
                transition: "background .15s, border-color .15s",
                marginBottom: 1,
              }}
              onMouseEnter={e => { if (activeScreen !== item.id) e.currentTarget.style.background = "rgba(253,248,240,.06)"; }}
              onMouseLeave={e => { if (activeScreen !== item.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 17, flexShrink: 0, filter: activeScreen === item.id ? "none" : "opacity(.75)" }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{
                    flex: 1, fontSize: 13.5,
                    fontWeight: activeScreen === item.id ? 700 : 450,
                    color: activeScreen === item.id ? T.cream : "rgba(253,248,240,.72)",
                    letterSpacing: "0.1px",
                  }}>{item.label}</span>
                  {item.sub && (
                    <span style={{ color: "rgba(253,248,240,.4)", fontSize: 11 }}>
                      {expandedGroups.includes(item.id) ? "▾" : "›"}
                    </span>
                  )}
                </>
              )}
            </div>
            {!collapsed && item.sub && expandedGroups.includes(item.id) && item.sub.map(sub => (
              <div key={sub.id} onClick={() => onNavigate(sub.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 16px 8px 40px", cursor: "pointer",
                  background: activeScreen === sub.id ? "rgba(253,248,240,.08)" : "transparent",
                  transition: "background .15s",
                  borderLeft: `3px solid ${activeScreen === sub.id ? T.goldL : "transparent"}`,
                }}
                onMouseEnter={e => { if (activeScreen !== sub.id) e.currentTarget.style.background = "rgba(253,248,240,.04)"; }}
                onMouseLeave={e => { if (activeScreen !== sub.id) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 13 }}>{sub.icon}</span>
                <span style={{
                  fontSize: 12.5,
                  color: activeScreen === sub.id ? T.goldL : "rgba(253,248,240,.60)",
                  fontWeight: activeScreen === sub.id ? 600 : 400,
                }}>{sub.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Zari divider */}
      {!collapsed && <div className="rm-zari" style={{ margin: "0 16px" }} />}

      <div style={{ padding: "6px 0 12px", position: "relative", zIndex: 1 }}>
        {NAV_ITEMS.filter(n => n.group === "bottom").map(item => (
          <div key={item.id}>
            <div onClick={() => { onNavigate(item.id); if (item.sub) toggleGroup(item.id); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: collapsed ? "11px 0" : "10px 16px",
                justifyContent: collapsed ? "center" : "flex-start",
                cursor: "pointer",
                background: activeScreen === item.id ? "rgba(253,248,240,.10)" : "transparent",
                borderLeft: `3px solid ${activeScreen === item.id ? T.gold : "transparent"}`,
                transition: "background .15s",
              }}
              onMouseEnter={e => { if (activeScreen !== item.id) e.currentTarget.style.background = "rgba(253,248,240,.06)"; }}
              onMouseLeave={e => { if (activeScreen !== item.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 17, flexShrink: 0, filter: "opacity(.75)" }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1, fontSize: 13.5, color: "rgba(253,248,240,.65)", fontWeight: 450 }}>{item.label}</span>
                  {item.sub && <span style={{ color: "rgba(253,248,240,.4)", fontSize: 11 }}>{expandedGroups.includes(item.id) ? "▾" : "›"}</span>}
                </>
              )}
            </div>
            {!collapsed && item.sub && expandedGroups.includes(item.id) && item.sub.map(sub => (
              <div key={sub.id} onClick={() => onNavigate(sub.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 16px 8px 40px", cursor: "pointer",
                  background: activeScreen === sub.id ? "rgba(253,248,240,.08)" : "transparent",
                  transition: "background .15s",
                  borderLeft: `3px solid ${activeScreen === sub.id ? T.goldL : "transparent"}`,
                }}
                onMouseEnter={e => { if (activeScreen !== sub.id) e.currentTarget.style.background = "rgba(253,248,240,.04)"; }}
                onMouseLeave={e => { if (activeScreen !== sub.id) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 13 }}>{sub.icon}</span>
                <span style={{ fontSize: 12.5, color: activeScreen === sub.id ? T.goldL : "rgba(253,248,240,.60)", fontWeight: activeScreen === sub.id ? 600 : 400 }}>{sub.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function BottomTabs({ activeScreen, onNavigate }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "inventory", icon: "👗", label: "Catalogue" },
    { id: "customers", icon: "👥", label: "Customers" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  const inventoryScreens = ["upload","aging","reorder","batch-upload","saree-detail","saree-edit","dead-stock","csv-import","abc-class","catalogue-readiness","ai-description","wedding-season","dead-stock-rca"];
  const customerScreens = ["customer-profile","segment-builder","dpdp-consent","clv-predictions","follow-up-queue"];
  const analyticsScreens = ["revenue","category-perf","health","forecast","session-attribution","tried-sold-shared","missed-demand","basket-analysis","smart-pricing","footfall-prediction","financial-detail"];
  const settingsScreens = ["notifications","billing","photo-guide","data-export","support","connected-apps","morning-briefing"];
  const staffScreens = ["staff","staff-detail","leaderboard","ai-coaching"];

  const getTab = (s) => {
    if (s === "home") return "home";
    if (inventoryScreens.includes(s) || s === "inventory") return "inventory";
    if (customerScreens.includes(s) || s === "customers" || s === "campaigns" || s === "campaign-builder" || s === "campaign-detail" || s === "auto-triggers") return "customers";
    if (analyticsScreens.includes(s) || s === "analytics") return "analytics";
    if (settingsScreens.includes(s) || staffScreens.includes(s) || s === "settings") return "settings";
    return null;
  };

  const activeTab = getTab(activeScreen);

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(253,248,240,0.97)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderTop: `1px solid ${T.border}`,
      display: "flex", justifyContent: "space-around",
      padding: "7px 0 calc(8px + env(safe-area-inset-bottom))",
      zIndex: 500, boxShadow: "0 -4px 20px rgba(10,22,40,.08)",
    }}>
      {tabs.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onNavigate(tab.id)}
            className="rm-press"
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, background: "none", border: "none", cursor: "pointer",
              padding: "4px 12px", flex: 1, position: "relative",
            }}>
            <div style={{
              width: 40, height: 34, borderRadius: 10, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: active ? T.navy : "transparent",
              transition: "background .2s",
            }}>
              <span style={{ fontSize: 19, filter: active ? "none" : "opacity(.65)" }}>{tab.icon}</span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 400,
              color: active ? T.navy : T.muted,
              fontFamily: "DM Sans, sans-serif",
            }}>{tab.label}</span>
            {active && <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: 24, height: 3, borderRadius: "0 0 3px 3px",
              background: T.gradGold,
            }} />}
          </button>
        );
      })}
    </div>
  );
}

function TopBar({ store, onNavigate, onSearchOpen }) {
  return (
    <div style={{
      background: T.white,
      borderBottom: `1px solid ${T.border}`,
      padding: "11px 22px",
      display: "flex", alignItems: "center", gap: 12,
      position: "sticky", top: 0, zIndex: 50,
      boxShadow: "0 1px 0 rgba(201,148,26,.15), 0 2px 12px rgba(10,22,40,.06)",
    }}>
      <div style={{ flex: 1 }}>
        <div className="rm-serif" style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontWeight: 700, fontSize: 18, fontStyle: "italic",
          color: T.navy, lineHeight: 1.1,
        }}>{store.name}</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 1, fontFamily: "DM Sans, sans-serif" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
        </div>
      </div>

      {/* Search trigger */}
      <button onClick={onSearchOpen}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 16px", border: `1.5px solid ${T.border}`,
          borderRadius: T.radiusPill, background: T.cream,
          cursor: "pointer", fontSize: 13, color: T.muted,
          fontFamily: "DM Sans, sans-serif",
          transition: "border-color .18s, box-shadow .18s",
          boxShadow: "none",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.boxShadow = T.shadowGold; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
      >
        🔍 <span style={{ fontSize: 12 }}>Search or ⌘K</span>
      </button>

      {/* Notification bell */}
      <button onClick={() => onNavigate("notifications")} style={{
        position: "relative", background: T.cream, border: `1.5px solid ${T.border}`,
        cursor: "pointer", width: 40, height: 40, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, transition: "border-color .15s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
      >
        🔔
        <span style={{
          position: "absolute", top: -1, right: -1, width: 16, height: 16,
          borderRadius: "50%", background: "linear-gradient(135deg,#B71C1C,#C62828)",
          color: T.white, fontSize: 9, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `2px solid ${T.white}`,
        }}>3</span>
      </button>

      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        background: T.gradPrimary,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: T.cream, fontWeight: 800, fontSize: 15, cursor: "pointer",
        border: `2px solid ${T.gold}55`,
        boxShadow: "0 0 0 3px rgba(201,148,26,.12)",
        fontFamily: "DM Sans, sans-serif",
      }}>
        {store.owner[0]}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════
function AppShell({ user, onLogout, onReplayOnboarding, currentRole, onRoleChange }) {
  const [activeScreen, setActiveScreen] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [essentialMode, setEssentialMode] = useState(false);
  const [selectedSaree, setSelectedSaree] = useState(null);
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const [searchOpen, setSearchOpen] = useState(false);
  const [retourOpen, setRetourOpen] = useState(false);
  const [revenueModal, setRevenueModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K opens search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const onNavigate = (screen, data) => {
    if (data !== undefined) setSelectedSaree(data);
    setActiveScreen(screen);
    window.scrollTo(0, 0);
  };

  const renderScreen = () => {
    // Essential mode overrides for high-complexity screens
    if (essentialMode) {
      if (activeScreen === "inventory") return <EssentialInventoryScreen onNavigate={onNavigate} />;
      if (activeScreen === "analytics") return <EssentialAnalyticsScreen onNavigate={onNavigate} />;
    }

    switch (activeScreen) {
      // ── Session 1 screens ─────────────────────────────────
      case "home":
        return <HomeScreen store={MOCK.store} kpis={MOCK.kpis} onNavigate={onNavigate} essentialMode={essentialMode} />;
      case "inventory":
        return <InventoryScreen onNavigate={onNavigate} />;
      case "aging":
        return <AgingScreen onNavigate={onNavigate} />;
      case "customers":
        return <CustomersScreen onNavigate={onNavigate} />;
      case "campaigns":
        return <CampaignsScreen onNavigate={onNavigate} />;
      case "analytics":
        return <AnalyticsScreen onNavigate={onNavigate} />;
      case "staff":
        return <StaffScreen onNavigate={onNavigate} />;

      // ── Session 2 screens ─────────────────────────────────
      case "upload":
        return <SareeUploadScreen onNavigate={onNavigate} />;
      case "batch-upload":
        return <BatchUploadScreen onNavigate={onNavigate} />;
      case "saree-detail":
        return <SareeDetailScreen saree={selectedSaree} onNavigate={onNavigate} />;
      case "saree-edit":
        return <SareeEditScreen saree={selectedSaree} onNavigate={onNavigate} />;
      case "reorder":
        return <ReorderSuggestionsScreen onNavigate={onNavigate} />;

      // ── Session 3 screens ─────────────────────────────────
      case "customer-profile":
        return <CustomerProfileScreen customer={selectedSaree} onNavigate={onNavigate} />;
      case "segment-builder":
        return <SegmentBuilderScreen onNavigate={onNavigate} />;
      case "dpdp-consent":
        return <DPDPConsentScreen onNavigate={onNavigate} />;
      case "campaign-builder":
        return <CampaignBuilderScreen prefill={selectedSaree} onNavigate={onNavigate} />;
      case "campaign-detail":
        return <CampaignDetailScreen campaign={selectedSaree} onNavigate={onNavigate} />;

      // ── Session 4 screens ─────────────────────────────────
      case "revenue":
        return <RevenueDetailScreen onNavigate={onNavigate} />;
      case "category-perf":
        return <CategoryPerformanceScreen onNavigate={onNavigate} />;
      case "health":
        return <StoreHealthScreen onNavigate={onNavigate} />;
      case "forecast":
        return <DemandForecastScreen onNavigate={onNavigate} />;
      case "dead-stock":
        return <DeadStockCurveScreen onNavigate={onNavigate} />;

      // ── Session 5 screens ─────────────────────────────────
      case "staff-detail":
        return <StaffDetailScreen staffMember={selectedSaree} onNavigate={onNavigate} />;
      case "settings":
        return <StoreSettingsScreen store={MOCK.store} essentialMode={essentialMode} onToggleEssential={() => setEssentialMode(e => !e)} onLogout={onLogout} onNavigate={onNavigate} onReplayTour={() => setRetourOpen(true)} />;
      case "notifications":
        return <NotificationsScreen onNavigate={onNavigate} />;
      case "billing":
        return <BillingScreen onNavigate={onNavigate} />;
      case "photo-guide":
        return <PhotoBoothGuideScreen onNavigate={onNavigate} />;
      case "data-export":
        return <DataExportScreen onNavigate={onNavigate} />;
      case "support":
        return <SupportScreen onNavigate={onNavigate} />;

      // ── Session 6 screens ─────────────────────────────────
      case "leaderboard":
        return <StaffLeaderboardScreen onNavigate={onNavigate} />;

      // ── Session 7 screens (NEW) ───────────────────────────
      case "connected-apps":
        return <ConnectedAppsScreen onNavigate={onNavigate} />;
      case "csv-import":
        return <CSVImportScreen onNavigate={onNavigate} />;
      case "abc-class":
        return <ABCClassificationScreen onNavigate={onNavigate} />;
      case "dead-stock-rca":
        return <DeadStockRCAScreen onNavigate={onNavigate} />;
      case "session-attribution":
        return <SessionAttributionScreen onNavigate={onNavigate} />;
      case "tried-sold-shared":
        return <TriedSoldSharedScreen onNavigate={onNavigate} />;
      case "morning-briefing":
        return <MorningBriefingScreen onNavigate={onNavigate} />;
      case "ai-coaching":
        return <AIStaffCoachingScreen staffMember={selectedSaree} onNavigate={onNavigate} />;

      // ── Session 8 screens (NEW) ───────────────────────────
      case "follow-up-queue":
        return <FollowUpQueueScreen onNavigate={onNavigate} />;
      case "auto-triggers":
        return <AutoTriggersScreen onNavigate={onNavigate} />;
      case "missed-demand":
        return <MissedDemandScreen onNavigate={onNavigate} />;
      case "basket-analysis":
        return <BasketAnalysisScreen onNavigate={onNavigate} />;
      case "clv-predictions":
        return <CLVPredictionsScreen onNavigate={onNavigate} />;
      case "smart-pricing":
        return <SmartPricingScreen onNavigate={onNavigate} />;
      case "footfall-prediction":
        return <FootfallPredictionScreen onNavigate={onNavigate} />;
      case "wedding-season":
        return <WeddingSeasonScreen onNavigate={onNavigate} />;
      case "ai-description":
        return <AIDescriptionScreen saree={selectedSaree} onNavigate={onNavigate} />;
      case "catalogue-readiness":
        return <CatalogueReadinessScreen onNavigate={onNavigate} />;
      case "financial-detail":
        return <FinancialDetailScreen onNavigate={onNavigate} />;


      default:
        return <HomeScreen store={MOCK.store} kpis={MOCK.kpis} onNavigate={onNavigate} essentialMode={essentialMode} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: T.cream, fontFamily: "DM Sans, IBM Plex Sans, sans-serif" }}>
      <_GlobalStyles />
      {!mobile && (
        <Sidebar activeScreen={activeScreen} onNavigate={onNavigate} store={MOCK.store} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* RBAC preview switcher — demo only */}
        {onRoleChange && (
          <RoleSwitcher currentRole={currentRole || "owner"} onChange={r => { onRoleChange(r); }} />
        )}
        <TopBar store={MOCK.store} onNavigate={onNavigate} onSearchOpen={() => setSearchOpen(true)} />
        <main className="rm-anim-pageIn" style={{ flex: 1, overflowY: "auto" }}>
          {renderScreen()}
        </main>
      </div>
      {mobile && <BottomTabs activeScreen={activeScreen} onNavigate={onNavigate} />}

      {/* Global overlays */}
      <GlobalSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={onNavigate} />
      <OnboardingRetourModal isOpen={retourOpen} onClose={() => setRetourOpen(false)} onStartTour={() => { setRetourOpen(false); onReplayOnboarding(); }} />
      <EssentialRevenueEntryModal isOpen={revenueModal} onClose={() => setRevenueModal(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════
export default function WearifyRetailerModule() {
  const [authState, setAuthState] = useState("login");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("owner"); // "owner" | "manager" | "staff"
  const [lang, setLang] = useState("en");

  const handleLogin = (userData) => {
    setUser(userData);
    setLang(userData.lang || "en");
    const isNewUser = !localStorage.getItem("wearify_onboarded");
    if (isNewUser) { setAuthState("onboarding"); } else { setAuthState("app"); }
  };

  const handleOnboardingComplete = () => {
    try { localStorage.setItem("wearify_onboarded", "true"); } catch(e) {}
    setAuthState("app");
  };

  const handleLogout = () => { setUser(null); setAuthState("login"); };

  const handleReplayOnboarding = () => {
    try { localStorage.removeItem("wearify_onboarded"); } catch(e) {}
    setAuthState("onboarding");
  };

  if (authState === "login") return (
    <LangContext.Provider value={lang}>
      <LoginScreen onLogin={handleLogin} />
    </LangContext.Provider>
  );
  if (authState === "onboarding") return (
    <LangContext.Provider value={lang}>
      <OnboardingWizard onComplete={handleOnboardingComplete} />
    </LangContext.Provider>
  );
  return (
    <LangContext.Provider value={lang}>
      <RBACContext.Provider value={{ role }}>
        <AppShell user={user} onLogout={handleLogout} onReplayOnboarding={handleReplayOnboarding}
          currentRole={role} onRoleChange={setRole} />
      </RBACContext.Provider>
    </LangContext.Provider>
  );
}
