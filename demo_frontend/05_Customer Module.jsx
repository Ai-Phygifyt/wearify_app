import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════
// WEARIFY — CUSTOMER MOBILE EXPERIENCE  (Production v1.0)
// WhatsApp-first · Web PWA · Zero app download · 375px mobile-first
// Aesthetic: Heirloom Luxury — Regal Indian Femininity
// Screens: CX-01 preview · CX-07–CX-22 full · 100% DPDP compliant
// ═══════════════════════════════════════════════════════════════════════

// ── Global Styles ───────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500;600&family=Noto+Sans:wght@400;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; -webkit-text-size-adjust: 100%; }
    body {
      font-family: "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif;
      background: #1A0A2E;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      min-height: 100svh; overflow-x: hidden;
    }
    .serif { font-family: "Cormorant Garamond", Georgia, serif !important; }
    .mono  { font-family: "DM Mono", "JetBrains Mono", monospace !important; }
    .noto  { font-family: "Noto Sans", "DM Sans", sans-serif !important; }

    @keyframes fadeIn   { from{opacity:0}to{opacity:1} }
    @keyframes slideUp  { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
    @keyframes slideDown{ from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)} }
    @keyframes slideLeft{ from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)} }
    @keyframes scaleIn  { from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)} }
    @keyframes popIn    { from{opacity:0;transform:scale(.55)}to{opacity:1;transform:scale(1)} }
    @keyframes shimmer  { 0%{transform:translateX(-130%)rotate(18deg)}100%{transform:translateX(260%)rotate(18deg)} }
    @keyframes shimmerBg{ 0%{background-position:-200% center}100%{background-position:200% center} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes heartBeat{ 0%,100%{transform:scale(1)}25%{transform:scale(1.4)}50%{transform:scale(1.1)} }
    @keyframes dotBlink { 0%,80%,100%{opacity:.2;transform:scale(.65)}40%{opacity:1;transform:scale(1)} }
    @keyframes float    { 0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)} }
    @keyframes pageIn   { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
    @keyframes waveRing { 0%{transform:scale(1);opacity:.55}100%{transform:scale(2.4);opacity:0} }
    @keyframes goldPulse{ 0%,100%{box-shadow:0 0 0 rgba(201,148,26,0)}50%{box-shadow:0 0 22px rgba(201,148,26,.4)} }
    @keyframes barFill  { from{width:0}to{width:var(--w)} }
    @keyframes shake    { 0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)} }
    @keyframes whatsapp { 0%{transform:scale(1)}30%{transform:scale(1.15)}60%{transform:scale(.97)}100%{transform:scale(1)} }
    @keyframes confetti { 0%{opacity:1;transform:translateY(0) rotate(0deg)}100%{opacity:0;transform:translateY(-80px) rotate(720deg)} }

    .anim-fadeIn  { animation: fadeIn  .4s ease both; }
    .anim-slideUp { animation: slideUp .52s cubic-bezier(.22,1,.36,1) both; }
    .anim-pageIn  { animation: pageIn  .45s cubic-bezier(.22,1,.36,1) both; }
    .anim-scaleIn { animation: scaleIn .36s cubic-bezier(.22,1,.36,1) both; }
    .anim-popIn   { animation: popIn   .3s cubic-bezier(.34,1.56,.64,1) both; }
    .d1{animation-delay:.05s}.d2{animation-delay:.10s}.d3{animation-delay:.15s}
    .d4{animation-delay:.20s}.d5{animation-delay:.25s}.d6{animation-delay:.30s}
    .d7{animation-delay:.35s}.d8{animation-delay:.40s}.d9{animation-delay:.45s}

    .press:active   { transform:scale(.94)!important; transition:transform .08s ease!important; }
    .press-lg:active{ transform:scale(.97)!important; transition:transform .08s ease!important; }
    .hover-lift     { transition:transform .2s,box-shadow .2s; }
    .hover-lift:hover{ transform:translateY(-2px); box-shadow:0 8px 28px rgba(45,27,78,.18)!important; }

    .silk { position:relative; overflow:hidden; }
    .silk::after { content:''; position:absolute; top:0; left:-100%; width:55%; height:100%;
      background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.15) 50%,transparent 80%);
      animation:shimmer 5.5s ease-in-out infinite; pointer-events:none; }

    .gold-shimmer { background:linear-gradient(90deg,#C9941A 0%,#E8C46A 38%,#fff8d0 50%,#E8C46A 62%,#C9941A 100%);
      background-size:200% auto; -webkit-background-clip:text; background-clip:text;
      -webkit-text-fill-color:transparent; animation:shimmerBg 3.5s linear infinite; }

    .zari { height:1px; background:linear-gradient(90deg,transparent 0%,rgba(201,148,26,.15) 15%,rgba(201,148,26,.62) 50%,rgba(201,148,26,.15) 85%,transparent 100%); }

    .paisley { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cellipse cx='36' cy='28' rx='9' ry='15' fill='none' stroke='%23C9941A' stroke-width='.55' stroke-opacity='.13'/%3E%3Ccircle cx='36' cy='19' r='2' fill='%23C9941A' fill-opacity='.10'/%3E%3Cpath d='M29 48 Q36 55 43 48' fill='none' stroke='%23C9941A' stroke-width='.45' stroke-opacity='.09'/%3E%3C/svg%3E");
      background-size:72px 72px; }

    .noise::before { content:''; position:absolute; inset:-50%; width:200%; height:200%;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      opacity:.025; pointer-events:none; z-index:0; border-radius:inherit; }

    ::-webkit-scrollbar { width:2px; height:2px; }
    ::-webkit-scrollbar-thumb { background:rgba(201,148,26,.22); border-radius:4px; }
    .no-scroll { -ms-overflow-style:none; scrollbar-width:none; }
    .no-scroll::-webkit-scrollbar { display:none; }
    ::selection { background:rgba(201,148,26,.22); color:#1A0A1E; }

    #cust-root { min-height:100svh; display:flex; justify-content:center; align-items:flex-start;
      background:radial-gradient(ellipse at 50% 0%,#2D1B4E 0%,#0D0418 65%); }
    .pwa-shell { width:100%; max-width:430px; min-height:100svh; background:#FDF8F0;
      position:relative; overflow:hidden; display:flex; flex-direction:column; }
    @media(min-width:600px){
      #cust-root { padding:20px 0; }
      .pwa-shell { min-height:calc(100svh - 40px); max-height:calc(100svh - 40px);
        border-radius:40px;
        box-shadow:0 32px 80px rgba(0,0,0,.65),0 0 0 8px #2D1B4E,0 0 0 10px rgba(201,148,26,.35); }
    }
    .screen-area { flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; }
    input:focus, textarea:focus { outline:none; }
    button { cursor:pointer; border:none; background:none; }

    /* WhatsApp bubble */
    .wa-bubble { background:#E8F5E9; border-radius:4px 16px 16px 16px;
      position:relative; box-shadow:0 1px 3px rgba(0,0,0,.12); }
    .wa-bubble-out { background:#DCF8C6; border-radius:16px 4px 16px 16px; }

    /* Toggle */
    .toggle-track { width:46px; height:26px; border-radius:13px; position:relative;
      transition:background .2s; cursor:pointer; }
    .toggle-thumb { position:absolute; top:3px; width:20px; height:20px; border-radius:50%;
      background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.22); transition:left .2s; }

    /* Star rating */
    .star { font-size:28px; cursor:pointer; transition:transform .15s; user-select:none; }
    .star:hover { transform:scale(1.2); }

    /* Loading dots */
    .typing span { display:inline-block; width:7px; height:7px; border-radius:50%;
      background:#C9941A; margin:0 2px; animation:dotBlink 1.2s ease infinite; }
    .typing span:nth-child(2){animation-delay:.2s}
    .typing span:nth-child(3){animation-delay:.4s}

    /* Confetti particle */
    .confetti-dot { position:absolute; width:8px; height:8px; border-radius:50%;
      animation:confetti .8s ease forwards; }
  `}</style>
);

// ── Design Tokens ────────────────────────────────────────────────────
const T = {
  plum:"#2D1B4E", plumL:"#4A2D6E", plumD:"#1A0A2E", plumXD:"#0D0418",
  plumGhost:"#F4EFF9",
  gold:"#C9941A", goldL:"#E8C46A", goldD:"#8B6914", goldGhost:"#FDF5E4",
  rose:"#C2848A", roseL:"#F0D0D4", roseD:"#8B4A52",
  ivory:"#FDF8F0", blush:"#FBF0F4", cream:"#F5EDE4", linen:"#EEE4D8",
  white:"#FFFFFF",
  text:"#1A0A1E", textMid:"#4A3558", textMuted:"#8B7EA0", textGhost:"#B8A8C8",
  onDark:"#FDF8F0",
  success:"#1B5E20", successBg:"#E8F5E9",
  error:"#B71C1C", errorBg:"#FFEBEE",
  amber:"#E65100", amberBg:"#FFF3E0",
  border:"#E8D5E0", borderGold:"#DFC07A", borderL:"#F2E8EE",
  shadow:"0 2px 14px rgba(45,27,78,.09)",
  shadowMd:"0 6px 24px rgba(45,27,78,.14)",
  shadowLg:"0 16px 56px rgba(45,27,78,.22)",
  shadowGold:"0 4px 20px rgba(201,148,26,.28)",
  r:"16px", rSm:"10px", rMd:"12px", rLg:"24px", rPill:"100px",
  gradPlum:"linear-gradient(135deg,#2D1B4E 0%,#4A2D6E 100%)",
  gradGold:"linear-gradient(135deg,#C9941A 0%,#E8C46A 55%,#C9941A 100%)",
  gradHero:"linear-gradient(155deg,#0D0418 0%,#1A0A2E 25%,#2D1B4E 55%,#6B1D52 80%,#C9941A 100%)",
};

// ── Wearify Brand (platform-level — not store-specific) ───────────────
const WEARIFY = {
  name:"Wearify",
  tagline:"Where Tradition Meets Intelligence",
  subline:"Your AI-powered saree experience",
  logo:"🪷",
  company:"Phygify Technoservices Pvt. Ltd.",
};

// ── Mock Data — Multiple Stores ────────────────────────────────────────
// A single customer may have visited many Wearify-enabled stores.
// Common identifier = phone number only.
const STORES = {
  "S001":{
    id:"S001", name:"Ramesh Silks & Sarees", short:"Ramesh Silks",
    city:"Varanasi", state:"UP",
    phone:"+91 98765 43210", address:"Vishwanath Gali, Varanasi, UP 221001",
    hours:"10:00 AM – 8:00 PM", closedOn:"Sunday",
    whatsapp:"https://wa.me/919876543210", mapUrl:"https://maps.google.com",
    since:"1987", emoji:"🏛️",
    grad:["#2D1B4E","#4A2D6E"],
    visits:3, lastVisit:"Mar 22, 2026",
  },
  "S002":{
    id:"S002", name:"Nalli Silks Mumbai", short:"Nalli Mumbai",
    city:"Mumbai", state:"MH",
    phone:"+91 91234 56789", address:"Linking Road, Bandra West, Mumbai 400050",
    hours:"11:00 AM – 9:00 PM", closedOn:"Monday",
    whatsapp:"https://wa.me/919123456789", mapUrl:"https://maps.google.com",
    since:"1928", emoji:"🌊",
    grad:["#0D1F3C","#1B4A72"],
    visits:1, lastVisit:"Dec 15, 2025",
  },
  "S003":{
    id:"S003", name:"Kanchipuram Silks Bangalore", short:"KP Silks BLR",
    city:"Bengaluru", state:"KA",
    phone:"+91 80123 45678", address:"Commercial Street, Bengaluru 560001",
    hours:"10:30 AM – 8:30 PM", closedOn:"Tuesday",
    whatsapp:"https://wa.me/918012345678", mapUrl:"https://maps.google.com",
    since:"1975", emoji:"🌺",
    grad:["#3D0A2E","#6B1A52"],
    visits:1, lastVisit:"Sep 3, 2025",
  },
};

const CUSTOMER = {
  name:"Priya Sharma", phone:"+91 98765 12345", masked:"+91 98765 XXXXX",
  initials:"PS",
  totalVisits:5, totalLooks:7, totalStores:3,
  storeCredit:500, loyaltyPoints:1840, loyaltyTier:"Silver",
  nextTierPoints:3160, nextTier:"Gold",
  visitedStoreIds:["S001","S002","S003"],
  consent:{ history:true, messages:true, aiPersonal:true, photos:true, grantedDate:"Mar 22, 2026" },
  preferences:{
    occasions:["Wedding","Festival"], fabrics:["Pure Silk","Georgette"],
    colors:["Crimson","Purple","Gold"], budget:"₹20,000 – ₹50,000",
    notifyTime:"Evening",
    upcomingOccasion:{ event:"Daughter's wedding", date:"December 2026" },
  },
  looks:[
    { id:"L001", saree:"Kanjivaram Pure Silk", fabric:"Pure Silk", price:45000,
      date:"Mar 22, 2026", visitId:"V005", storeId:"S001",
      isFav:true, isWished:false, grad:["#3D0A2E","#8B1D52"], tryOnImg:null },
    { id:"L002", saree:"Banarasi Georgette", fabric:"Georgette", price:18500,
      date:"Mar 22, 2026", visitId:"V005", storeId:"S001",
      isFav:false, isWished:true, grad:["#0D1F3C","#1B3D72"], tryOnImg:null },
    { id:"L003", saree:"Paithani Silk", fabric:"Silk", price:35000,
      date:"Jan 11, 2026", visitId:"V004", storeId:"S001",
      isFav:false, isWished:false, grad:["#003D2E","#006B50"], tryOnImg:null },
    { id:"L004", saree:"Mysore Silk Crepe", fabric:"Silk", price:22000,
      date:"Jan 11, 2026", visitId:"V004", storeId:"S001",
      isFav:false, isWished:true, grad:["#2D0A4E","#5A1A8B"], tryOnImg:null },
    { id:"L005", saree:"Chanderi Cotton Silk", fabric:"Cotton Silk", price:5200,
      date:"Nov 5, 2025", visitId:"V003", storeId:"S001",
      isFav:false, isWished:false, grad:["#1B3D2E","#2E6B4A"], tryOnImg:null },
    // Mumbai store
    { id:"L006", saree:"Nalli Kanjivaram Zari", fabric:"Pure Silk", price:52000,
      date:"Dec 15, 2025", visitId:"V006", storeId:"S002",
      isFav:true, isWished:false, grad:["#0D1F3C","#1B4A72"], tryOnImg:null },
    // Bangalore store
    { id:"L007", saree:"Kanchipuram Temple Border", fabric:"Pure Silk", price:38000,
      date:"Sep 3, 2025", visitId:"V007", storeId:"S003",
      isFav:false, isWished:true, grad:["#3D0A2E","#6B1A52"], tryOnImg:null },
  ],
  wishlist:[],
  visitHistory:[
    { id:"V005", date:"Mar 22, 2026", storeId:"S001",
      sareesTried:["Kanjivaram Pure Silk","Banarasi Georgette"],
      purchased:"Kanjivaram Pure Silk (₹45,000)", staff:"Mohan Kumar", points:200 },
    { id:"V004", date:"Jan 11, 2026", storeId:"S001",
      sareesTried:["Paithani Silk","Mysore Silk Crepe"],
      purchased:"Paithani Silk (₹35,000)", staff:"Anita Devi", points:150 },
    { id:"V003", date:"Nov 5, 2025", storeId:"S001",
      sareesTried:["Chanderi Cotton Silk","Tant Cotton"],
      purchased:"Tant Cotton (₹3,500)", staff:"Mohan Kumar", points:50 },
    { id:"V006", date:"Dec 15, 2025", storeId:"S002",
      sareesTried:["Nalli Kanjivaram Zari","Nalli Tissue Silk"],
      purchased:"Nalli Kanjivaram Zari (₹52,000)", staff:"Preethi S.", points:220 },
    { id:"V007", date:"Sep 3, 2025", storeId:"S003",
      sareesTried:["Kanchipuram Temple Border","Kanchipuram Peacock"],
      purchased:null, staff:"Lakshmi R.", points:20 },
    { id:"V002", date:"Aug 20, 2025", storeId:"S001",
      sareesTried:["Sambalpuri Ikat","Pochampally Ikat"],
      purchased:null, staff:"Rajesh Singh", points:20 },
  ],
  newArrivals:{
    "S001":[
      { id:"NA001", name:"Banarasi Silk Brocade", fabric:"Silk", price:28000, isNew:true, daysOld:3,
        grad:["#3D0A2E","#6B1D52"], occasion:"Wedding", match:95 },
      { id:"NA002", name:"Kanjivaram Border Saree", fabric:"Pure Silk", price:38000, isNew:true, daysOld:5,
        grad:["#0D1F3C","#2D4A7E"], occasion:"Festival", match:88 },
      { id:"NA003", name:"Georgette Embroidered", fabric:"Georgette", price:12500, isNew:true, daysOld:8,
        grad:["#2D0A4E","#5A1A8B"], occasion:"Party", match:76 },
    ],
    "S002":[
      { id:"NA004", name:"Nalli Soft Silk", fabric:"Soft Silk", price:18500, isNew:true, daysOld:4,
        grad:["#0D1F3C","#1B4A72"], occasion:"Festival", match:82 },
      { id:"NA005", name:"Nalli Tissue Zari", fabric:"Tissue Silk", price:32000, isNew:true, daysOld:6,
        grad:["#3D1800","#7B3A00"], occasion:"Wedding", match:74 },
    ],
    "S003":[
      { id:"NA006", name:"KP Peacock Motif", fabric:"Pure Silk", price:42000, isNew:true, daysOld:2,
        grad:["#3D0A2E","#6B1A52"], occasion:"Wedding", match:91 },
    ],
  },
  referrals:[
    { name:"Sunita Agarwal", status:"Visited", date:"Mar 10, 2026", reward:500 },
    { name:"Kavya Mehta", status:"Pending", date:"Mar 18, 2026", reward:0 },
  ],
  notifPrefs:{ tryOn:true, thankYou:true, festivals:true, newArrivals:true,
    birthday:true, reengagement:true, time:"Evening" },
};

// ── Offers & Promotions mock data ─────────────────────────────────────
const OFFERS_DATA = [
  {
    id:"O001", storeId:"S001", type:"festival",
    headline:"Navratri Festival Sale", subline:"Up to 20% off on Silk sarees",
    badge:"LIMITED TIME", badgeColor:"#C9941A",
    cta:"Shop Now", expiry:"Ends Oct 3",
    grad:["#3D0A2E","#8B1D52"],
    icon:"festival",
  },
  {
    id:"O002", storeId:"S001", type:"loyalty",
    headline:"Double Points Week!", subline:"Earn 2× loyalty points on every visit this week",
    badge:"LOYALTY BONUS", badgeColor:"#1A4A65",
    cta:"Visit Store", expiry:"Ends Mar 29",
    grad:["#0A1628","#1A4A65"],
    icon:"star",
  },
  {
    id:"O003", storeId:"S001", type:"birthday",
    headline:"Happy Birthday, Priya! 🎂", subline:"Enjoy 10% off any saree this month — our gift to you",
    badge:"PERSONAL OFFER", badgeColor:"#8B4A52",
    cta:"Redeem Now", expiry:"Valid all of April",
    grad:["#4A1A2E","#8B3A5A"],
    icon:"gift",
  },
  {
    id:"O004", storeId:"S002", type:"collection",
    headline:"Bridal 2026 Collection", subline:"New arrivals at Nalli Mumbai — exclusive bridal silks",
    badge:"NEW COLLECTION", badgeColor:"#1B5E20",
    cta:"Explore", expiry:"Just landed",
    grad:["#0D1F3C","#1B4A72"],
    icon:"sparkle",
  },
  {
    id:"O005", storeId:"S001", type:"flash",
    headline:"Flash Sale — Today Only!", subline:"Select Banarasi sarees at 15% off. Today, 6 PM – 8 PM",
    badge:"FLASH SALE", badgeColor:"#E65100",
    cta:"Shop Now", expiry:"Today · Ends 8 PM",
    grad:["#3D1800","#8B4500"],
    icon:"flash",
  },
  {
    id:"O006", storeId:"S001", type:"referral",
    headline:"Refer & Earn ₹500", subline:"Share Wearify with a friend. Both of you get ₹500 store credit!",
    badge:"REFER A FRIEND", badgeColor:"#1B5E20",
    cta:"Share Now", expiry:"Always active",
    grad:["#1B3D2E","#2E6B4A"],
    icon:"users",
  },
];

// ── Tailor mock data ──────────────────────────────────────────────────
const TAILORS = [
  {
    id:"T001", name:"Priya Menon", specialty:"Bridal & Designer Blouses",
    city:"Varanasi", area:"Sigra", distance:"0.8 km",
    rating:4.8, reviewCount:84, experience:"15 yrs",
    badge:"Pro Tailor", badgeColor:"#C9941A",
    fabrics:["Pure Silk","Kanjivaram","Paithani","Banarasi"],
    priceRange:"₹800 – ₹3,500",
    deliveryDays:5,
    whatsapp:"https://wa.me/919876500001",
    portfolio:[
      { grad:["#3D0A2E","#8B1D52"] },
      { grad:["#0D1F3C","#1B3D72"] },
      { grad:["#003D2E","#006B50"] },
    ],
    storeId:"S001",
  },
  {
    id:"T002", name:"Sunanda Devi", specialty:"Cotton & Casual Blouses",
    city:"Varanasi", area:"Lanka", distance:"1.4 km",
    rating:4.5, reviewCount:56, experience:"9 yrs",
    badge:"Verified", badgeColor:"#1A4A65",
    fabrics:["Cotton","Georgette","Chanderi","Tant"],
    priceRange:"₹300 – ₹1,200",
    deliveryDays:3,
    whatsapp:"https://wa.me/919876500002",
    portfolio:[
      { grad:["#1B3D2E","#2E6B4A"] },
      { grad:["#2D2A00","#6B6500"] },
    ],
    storeId:"S001",
  },
  {
    id:"T003", name:"Kavitha Rajan", specialty:"Embroidered & Zari Blouses",
    city:"Mumbai", area:"Bandra West", distance:"1.1 km",
    rating:4.9, reviewCount:112, experience:"18 yrs",
    badge:"Pro Tailor", badgeColor:"#C9941A",
    fabrics:["Pure Silk","Tissue Silk","Banarasi","Nalli"],
    priceRange:"₹1,200 – ₹5,000",
    deliveryDays:7,
    whatsapp:"https://wa.me/919876500003",
    portfolio:[
      { grad:["#0D1F3C","#1B4A72"] },
      { grad:["#3D1800","#7B3A00"] },
    ],
    storeId:"S002",
  },
];

const TAILOR_ORDERS = [
  {
    id:"TO001", tailorId:"T001", tailorName:"Priya Menon",
    saree:"Kanjivaram Pure Silk", fabric:"Pure Silk", storeId:"S001",
    service:"Silk Blouse Stitching", price:1800,
    agreedDate:"Mar 28, 2026", orderDate:"Mar 23, 2026",
    status:"stitching", // "confirmed" | "measurements" | "stitching" | "ready" | "delivered"
    notes:"Deep V-neck back, full sleeves, matching zari border",
    tailorWhatsapp:"https://wa.me/919876500001",
  },
  {
    id:"TO002", tailorId:"T002", tailorName:"Sunanda Devi",
    saree:"Chanderi Cotton Silk", fabric:"Cotton Silk", storeId:"S001",
    service:"Cotton Blouse Stitching", price:650,
    agreedDate:"Nov 12, 2025", orderDate:"Nov 5, 2025",
    status:"delivered",
    notes:"Boat neck, sleeveless",
    tailorWhatsapp:"https://wa.me/919876500002",
  },
];

const MEASUREMENTS = {
  bust:36, waist:30, shoulder:14.5, armLength:22,
  backLength:15, neckDepthFront:6, neckDepthBack:7,
  sleeve:"Full sleeves", neck:"V-neck",
  fabric:"Matching", updatedDate:"Mar 22, 2026",
};

// ── Contexts ──────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);
const LangCtx = createContext("en");
const useLang = () => useContext(LangCtx);

// ── i18n — 9 language strings ─────────────────────────────────────────
const LANG_META = {
  en:{ label:"English",   native:"English",   script:"Latin" },
  hi:{ label:"Hindi",     native:"हिंदी",      script:"Devanagari" },
  mr:{ label:"Marathi",   native:"मराठी",      script:"Devanagari" },
  kn:{ label:"Kannada",   native:"ಕನ್ನಡ",      script:"Kannada" },
  ta:{ label:"Tamil",     native:"தமிழ்",      script:"Tamil" },
  te:{ label:"Telugu",    native:"తెలుగు",     script:"Telugu" },
  bn:{ label:"Bengali",   native:"বাংলা",      script:"Bengali" },
  gu:{ label:"Gujarati",  native:"ગુજરાતી",    script:"Gujarati" },
  ml:{ label:"Malayalam", native:"മലയാളം",     script:"Malayalam" },
};

const STRINGS = {
  en:{
    appTagline:"Your AI-powered saree experience",
    welcomeBack:"Welcome back",
    enterMobile:"Enter your registered mobile number",
    getOTP:"Get OTP",
    verifyOTP:"Verify OTP",
    changeNumber:"← Change number",
    resendIn:"Resend in",
    demoOTP:"Demo OTP",
    myLooks:"My Looks",
    newArrivals:"New Arrivals",
    myWishlist:"My Wishlist",
    myStores:"My Stores",
    storeLocator:"Store Locator",
    recentLooks:"Recent Looks",
    home:"Home",
    new:"New",
    wishlist:"Wishlist",
    me:"Me",
    offersPromos:"Offers & Promotions",
    viewAll:"View all →",
    visitStore:"Visit Store",
    chatStore:"Chat with a store",
    chatStoreDesc:"Questions about a saree? WhatsApp the store directly.",
    chooseStore:"Choose Store",
    preferences:"My Preferences",
    visitHistory:"Visit History",
    loyaltyCredits:"Loyalty & Credits",
    referFriend:"Refer a Friend",
    rateVisit:"Rate Your Last Visit",
    whatsappPrefs:"WhatsApp Preferences",
    privacyDPDP:"Privacy & DPDP",
    helpFAQ:"Help & FAQ",
    language:"Language",
    signOut:"Sign Out",
    signOutConfirm:"Are you sure you want to sign out?",
    signOutDesc:"You can sign back in anytime with your mobile number.",
    yes:"Yes, Sign Out",
    cancel:"Cancel",
    myTailorOrders:"My Tailor Orders",
    findTailor:"Find a Tailor for this Saree",
    tailorNearYou:"Trusted tailors near you",
    connectTailor:"Connect on WhatsApp",
    orderStatus:"Order Status",
    measurements:"My Measurements",
    rateTailor:"Rate My Tailor",
    ordersForYou:"Tailors for your",
    shopNow:"Shop Now",
    explore:"Explore",
    redeem:"Redeem Now",
    share:"Share Now",
    endsOn:"Ends",
    savePrefs:"Save Preferences",
    saved:"Saved ✓",
    allStores:"All Stores",
    filterByStore:"Filter by store",
    tryon:"%n try-ons across %s stores",
    looksCount:"%n try-ons saved",
  },
  hi:{
    appTagline:"आपका AI-संचालित साड़ी अनुभव",
    welcomeBack:"वापस स्वागत है",
    enterMobile:"अपना पंजीकृत मोबाइल नंबर दर्ज करें",
    getOTP:"OTP प्राप्त करें",
    verifyOTP:"OTP सत्यापित करें",
    changeNumber:"← नंबर बदलें",
    resendIn:"फिर भेजें",
    demoOTP:"डेमो OTP",
    myLooks:"मेरे लुक्स",
    newArrivals:"नए आइटम",
    myWishlist:"मेरी विशलिस्ट",
    myStores:"मेरे स्टोर",
    storeLocator:"स्टोर खोजें",
    recentLooks:"हाल के लुक्स",
    home:"होम",
    new:"नया",
    wishlist:"विशलिस्ट",
    me:"मैं",
    offersPromos:"ऑफर और प्रमोशन",
    viewAll:"सब देखें →",
    visitStore:"स्टोर जाएं",
    chatStore:"स्टोर से बात करें",
    chatStoreDesc:"साड़ी के बारे में सवाल? WhatsApp पर पूछें!",
    chooseStore:"स्टोर चुनें",
    preferences:"मेरी प्राथमिकताएं",
    visitHistory:"विज़िट इतिहास",
    loyaltyCredits:"लॉयल्टी और क्रेडिट",
    referFriend:"दोस्त को रेफर करें",
    rateVisit:"विज़िट रेटिंग दें",
    whatsappPrefs:"WhatsApp सेटिंग्स",
    privacyDPDP:"गोपनीयता और DPDP",
    helpFAQ:"मदद और FAQ",
    language:"भाषा",
    signOut:"साइन आउट",
    signOutConfirm:"क्या आप साइन आउट करना चाहती हैं?",
    signOutDesc:"आप कभी भी अपने मोबाइल नंबर से वापस लॉग इन कर सकती हैं।",
    yes:"हाँ, साइन आउट",
    cancel:"रद्द करें",
    myTailorOrders:"मेरे दर्जी ऑर्डर",
    findTailor:"इस साड़ी के लिए दर्जी खोजें",
    tailorNearYou:"आपके पास विश्वसनीय दर्जी",
    connectTailor:"WhatsApp पर जुड़ें",
    orderStatus:"ऑर्डर स्थिति",
    measurements:"मेरे माप",
    rateTailor:"दर्जी को रेट करें",
    ordersForYou:"आपकी",
    shopNow:"अभी खरीदें",
    explore:"देखें",
    redeem:"अभी रिडीम करें",
    share:"शेयर करें",
    endsOn:"समाप्त",
    savePrefs:"सेव करें",
    saved:"सेव हो गया ✓",
    allStores:"सभी स्टोर",
    filterByStore:"स्टोर से फ़िल्टर करें",
    tryon:"%s स्टोर में %n ट्राई-ऑन",
    looksCount:"%n लुक्स सेव हैं",
  },
  mr:{
    appTagline:"तुमचा AI-चालित साडी अनुभव",
    welcomeBack:"परत स्वागत आहे",
    enterMobile:"तुमचा नोंदणीकृत मोबाइल नंबर टाका",
    getOTP:"OTP मिळवा",
    verifyOTP:"OTP पडताळा",
    changeNumber:"← नंबर बदला",
    resendIn:"पुन्हा पाठवा",
    demoOTP:"डेमो OTP",
    myLooks:"माझे लुक्स",
    newArrivals:"नवीन आगमन",
    myWishlist:"माझी विशलिस्ट",
    myStores:"माझे स्टोअर",
    storeLocator:"स्टोअर शोधा",
    recentLooks:"अलीकडील लुक्स",
    home:"होम",new:"नवीन",wishlist:"विशलिस्ट",me:"मी",
    offersPromos:"ऑफर आणि प्रमोशन",viewAll:"सर्व पहा →",
    visitStore:"स्टोअरला भेट द्या",chatStore:"स्टोअरशी बोला",
    chatStoreDesc:"साडीबद्दल प्रश्न? WhatsApp वर विचारा!",chooseStore:"स्टोअर निवडा",
    preferences:"माझ्या प्राधान्यक्रम",visitHistory:"भेटींचा इतिहास",
    loyaltyCredits:"लॉयल्टी आणि क्रेडिट",referFriend:"मित्राला रेफर करा",
    rateVisit:"भेटीचे मूल्यांकन करा",whatsappPrefs:"WhatsApp सेटिंग्ज",
    privacyDPDP:"गोपनीयता",helpFAQ:"मदत आणि FAQ",language:"भाषा",
    signOut:"साइन आउट",signOutConfirm:"तुम्हाला साइन आउट करायचे आहे का?",
    signOutDesc:"तुम्ही कधीही मोबाइल नंबरने परत लॉग इन करू शकता.",yes:"होय, साइन आउट",cancel:"रद्द करा",
    myTailorOrders:"माझे शिंपी ऑर्डर",findTailor:"या साडीसाठी शिंपी शोधा",
    tailorNearYou:"तुमच्या जवळचे विश्वसनीय शिंपी",connectTailor:"WhatsApp वर जोडा",
    orderStatus:"ऑर्डर स्थिती",measurements:"माझे माप",rateTailor:"शिंपीला रेट करा",
    ordersForYou:"तुमच्या",shopNow:"आता खरेदी करा",explore:"पहा",redeem:"आता रिडीम करा",
    share:"शेअर करा",endsOn:"संपतो",savePrefs:"सेव करा",saved:"सेव झाले ✓",
    allStores:"सर्व स्टोअर",filterByStore:"स्टोअरनुसार फिल्टर",
    tryon:"%s स्टोअरमध्ये %n ट्राय-ऑन",looksCount:"%n लुक्स जतन केले",
  },
  kn:{
    appTagline:"ನಿಮ್ಮ AI-ಚಾಲಿತ ಸೀರೆ ಅನುಭವ",
    welcomeBack:"ಮರಳಿ ಸ್ವಾಗತ",enterMobile:"ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    getOTP:"OTP ಪಡೆಯಿರಿ",verifyOTP:"OTP ಪರಿಶೀಲಿಸಿ",changeNumber:"← ಸಂಖ್ಯೆ ಬದಲಿಸಿ",
    resendIn:"ಮರಳಿ ಕಳುಹಿಸಿ",demoOTP:"ಡೆಮೊ OTP",myLooks:"ನನ್ನ ಲುಕ್ಸ್",
    newArrivals:"ಹೊಸ ಆಗಮನ",myWishlist:"ನನ್ನ ವಿಶ್‌ಲಿಸ್ಟ್",myStores:"ನನ್ನ ಅಂಗಡಿಗಳು",
    storeLocator:"ಅಂಗಡಿ ಹುಡುಕಿ",recentLooks:"ಇತ್ತೀಚಿನ ಲುಕ್ಸ್",
    home:"ಮನೆ",new:"ಹೊಸದು",wishlist:"ವಿಶ್‌ಲಿಸ್ಟ್",me:"ನಾನು",
    offersPromos:"ಆಫರ್ಸ್ ಮತ್ತು ಪ್ರಮೋಷನ್",viewAll:"ಎಲ್ಲ ನೋಡಿ →",
    visitStore:"ಅಂಗಡಿಗೆ ಭೇಟಿ ನೀಡಿ",chatStore:"ಅಂಗಡಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ",
    chatStoreDesc:"ಸೀರೆ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ? WhatsApp ನಲ್ಲಿ ಕೇಳಿ!",
    chooseStore:"ಅಂಗಡಿ ಆಯ್ಕೆ",preferences:"ಆದ್ಯತೆಗಳು",visitHistory:"ಭೇಟಿ ಇತಿಹಾಸ",
    loyaltyCredits:"ನಿಷ್ಠೆ ಮತ್ತು ಕ್ರೆಡಿಟ್",referFriend:"ಸ್ನೇಹಿತರನ್ನು ರೆಫರ್ ಮಾಡಿ",
    rateVisit:"ಭೇಟಿಯನ್ನು ರೇಟ್ ಮಾಡಿ",whatsappPrefs:"WhatsApp ಸೆಟ್ಟಿಂಗ್ಸ್",
    privacyDPDP:"ಗೌಪ್ಯತೆ",helpFAQ:"ಸಹಾಯ",language:"ಭಾಷೆ",
    signOut:"ಸೈನ್ ಔಟ್",signOutConfirm:"ನೀವು ಸೈನ್ ಔಟ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?",
    signOutDesc:"ನೀವು ಯಾವಾಗಲೂ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಮರಳಿ ಲಾಗಿನ್ ಮಾಡಬಹುದು.",
    yes:"ಹೌದು, ಸೈನ್ ಔಟ್",cancel:"ರದ್ದುಮಾಡಿ",
    myTailorOrders:"ನನ್ನ ದರ್ಜಿ ಆರ್ಡರ್‌ಗಳು",findTailor:"ಈ ಸೀರೆಗೆ ದರ್ಜಿ ಹುಡುಕಿ",
    tailorNearYou:"ನಿಮ್ಮ ಬಳಿ ವಿಶ್ವಾಸಾರ್ಹ ದರ್ಜಿಗಳು",connectTailor:"WhatsApp ನಲ್ಲಿ ಸಂಪರ್ಕ",
    orderStatus:"ಆರ್ಡರ್ ಸ್ಥಿತಿ",measurements:"ನನ್ನ ಅಳತೆಗಳು",rateTailor:"ದರ್ಜಿಯನ್ನು ರೇಟ್ ಮಾಡಿ",
    ordersForYou:"ನಿಮ್ಮ",shopNow:"ಈಗ ಖರೀದಿಸಿ",explore:"ನೋಡಿ",
    redeem:"ಈಗ ರಿಡೀಮ್ ಮಾಡಿ",share:"ಹಂಚಿಕೊಳ್ಳಿ",endsOn:"ಕೊನೆಗೊಳ್ಳುತ್ತದೆ",
    savePrefs:"ಸೇವ್ ಮಾಡಿ",saved:"ಸೇವ್ ಆಯಿತು ✓",
    allStores:"ಎಲ್ಲ ಅಂಗಡಿಗಳು",filterByStore:"ಅಂಗಡಿ ಮೂಲಕ ಫಿಲ್ಟರ್",
    tryon:"%s ಅಂಗಡಿಗಳಲ್ಲಿ %n ಟ್ರೈ-ಆನ್",looksCount:"%n ಲುಕ್ಸ್ ಉಳಿಸಲಾಗಿದೆ",
  },
  // TA, TE, BN, GU, ML — key strings, fall back to EN for unlisted
  ta:{
    appTagline:"உங்கள் AI-இயங்கும் புடவை அனுபவம்",
    welcomeBack:"மீண்டும் வரவேற்கிறோம்",enterMobile:"உங்கள் மொபைல் எண்ணை உள்ளிடுங்கள்",
    getOTP:"OTP பெறுங்கள்",verifyOTP:"OTP சரிபாருங்கள்",changeNumber:"← எண் மாற்றுங்கள்",
    home:"முகப்பு",new:"புதியது",wishlist:"விருப்பப் பட்டியல்",me:"நான்",
    myLooks:"என் தோற்றங்கள்",newArrivals:"புதிய வருகைகள்",myWishlist:"என் விரும்பியது",
    myStores:"என் கடைகள்",language:"மொழி",signOut:"வெளியேறு",
    signOutConfirm:"வெளியேற விரும்புகிறீர்களா?",yes:"ஆம், வெளியேறு",cancel:"ரத்து",
    findTailor:"இந்த புடவைக்கு தையல்காரர் தேடுங்கள்",
    connectTailor:"WhatsApp இல் இணைக்கவும்",
    myTailorOrders:"என் தையல் ஆர்டர்கள்",measurements:"என் அளவுகள்",
    allStores:"அனைத்து கடைகளும்",filterByStore:"கடையால் வடிகட்டு",savePrefs:"சேமிக்கவும்",saved:"சேமிக்கப்பட்டது ✓",
  },
  te:{
    appTagline:"మీ AI-శక్తితో నడిచే చీర అనుభవం",
    welcomeBack:"తిరిగి స్వాగతం",enterMobile:"మీ మొబైల్ నంబర్ నమోదు చేయండి",
    getOTP:"OTP పొందండి",verifyOTP:"OTP ధృవీకరించండి",changeNumber:"← నంబర్ మార్చండి",
    home:"హోమ్",new:"కొత్తది",wishlist:"విష్‌లిస్ట్",me:"నేను",
    myLooks:"నా లుక్స్",newArrivals:"కొత్త వచ్చినవి",myWishlist:"నా విష్‌లిస్ట్",
    myStores:"నా స్టోర్లు",language:"భాష",signOut:"సైన్ అవుట్",
    signOutConfirm:"మీరు సైన్ అవుట్ చేయాలనుకుంటున్నారా?",yes:"అవును, సైన్ అవుట్",cancel:"రద్దు",
    findTailor:"ఈ చీరకు దర్జీని కనుగొనండి",connectTailor:"WhatsApp లో కనెక్ట్ అవ్వండి",
    myTailorOrders:"నా దర్జీ ఆర్డర్లు",measurements:"నా కొలతలు",
    allStores:"అన్ని స్టోర్లు",filterByStore:"స్టోర్ ద్వారా ఫిల్టర్",savePrefs:"సేవ్ చేయండి",saved:"సేవ్ అయింది ✓",
  },
  bn:{
    appTagline:"আপনার AI-চালিত শাড়ি অভিজ্ঞতা",
    welcomeBack:"আবার স্বাগতম",enterMobile:"আপনার মোবাইল নম্বর দিন",
    getOTP:"OTP পান",verifyOTP:"OTP যাচাই করুন",changeNumber:"← নম্বর পরিবর্তন",
    home:"হোম",new:"নতুন",wishlist:"উইশলিস্ট",me:"আমি",
    myLooks:"আমার লুকস",newArrivals:"নতুন পণ্য",myWishlist:"আমার উইশলিস্ট",
    myStores:"আমার দোকান",language:"ভাষা",signOut:"সাইন আউট",
    signOutConfirm:"আপনি কি সাইন আউট করতে চান?",yes:"হ্যাঁ, সাইন আউট",cancel:"বাতিল",
    findTailor:"এই শাড়ির জন্য দর্জি খুঁজুন",connectTailor:"WhatsApp এ সংযুক্ত হন",
    myTailorOrders:"আমার দর্জি অর্ডার",measurements:"আমার মাপ",
    allStores:"সমস্ত দোকান",filterByStore:"দোকান দিয়ে ফিল্টার",savePrefs:"সংরক্ষণ করুন",saved:"সংরক্ষিত ✓",
  },
  gu:{
    appTagline:"તમારો AI-સંચાલિત સાડી અનુભવ",
    welcomeBack:"પાછા સ્વાગત છે",enterMobile:"તમારો મોબાઇલ નંબર દાખલ કરો",
    getOTP:"OTP મેળવો",verifyOTP:"OTP ચકાસો",changeNumber:"← નંબર બદલો",
    home:"હોમ",new:"નવું",wishlist:"વિશ્‍લિસ્ટ",me:"હું",
    myLooks:"મારા લૂક્સ",newArrivals:"નવા આગમન",myWishlist:"મારી વિશ્‍લિસ્ટ",
    myStores:"મારી દુકાનો",language:"ભાષા",signOut:"સાઇન આઉટ",
    signOutConfirm:"શું તમે સાઇન આઉટ કરવા માંગો છો?",yes:"હા, સાઇન આઉટ",cancel:"રદ્દ",
    findTailor:"આ સાડી માટે દરજી શોધો",connectTailor:"WhatsApp પર જોડાઓ",
    myTailorOrders:"મારા દરજી ઓર્ડર",measurements:"મારા માપ",
    allStores:"બધી દુકાનો",filterByStore:"દુકાન દ્વારા ફિલ્ટર",savePrefs:"સંગ્રહ કરો",saved:"સંગ્રહ થયું ✓",
  },
  ml:{
    appTagline:"നിങ്ങളുടെ AI-പ്രവർത്തിത സാരി അനുഭവം",
    welcomeBack:"തിരിച്ചു സ്വാഗതം",enterMobile:"നിങ്ങളുടെ മൊബൈൽ നമ്പർ നൽകൂ",
    getOTP:"OTP നേടൂ",verifyOTP:"OTP സ്ഥിരീകരിക്കൂ",changeNumber:"← നമ്പർ മാറ്റൂ",
    home:"ഹോം",new:"പുതിയത്",wishlist:"ആഗ്രഹ പട്ടിക",me:"ഞാൻ",
    myLooks:"എന്റെ ലുക്കുകൾ",newArrivals:"പുതിയ വരവ്",myWishlist:"എന്റെ ആഗ്രഹ പട്ടിക",
    myStores:"എന്റെ കടകൾ",language:"ഭാഷ",signOut:"സൈൻ ഔട്ട്",
    signOutConfirm:"സൈൻ ഔട്ട് ചെയ്യണോ?",yes:"അതെ, സൈൻ ഔട്ട്",cancel:"റദ്ദാക്കൂ",
    findTailor:"ഈ സാരിക്ക് ഒരു തയ്യൽക്കാരനെ കണ്ടെത്തൂ",connectTailor:"WhatsApp ൽ ബന്ധപ്പെടൂ",
    myTailorOrders:"എന്റെ തയ്യൽ ഓർഡറുകൾ",measurements:"എന്റെ അളവുകൾ",
    allStores:"എല്ലാ കടകളും",filterByStore:"കടകൾ അനുസരിച്ച് ഫിൽട്ടർ",savePrefs:"സേവ് ചെയ്യൂ",saved:"സേവ് ആയി ✓",
  },
};

// String lookup with fallback to English
const S = (key, lang="en") => {
  const l = STRINGS[lang]||{};
  return l[key] !== undefined ? l[key] : (STRINGS.en[key]||key);
};

// Auto-detect language from browser
const detectLang = () => {
  const nav = (navigator.language||navigator.userLanguage||"en").toLowerCase();
  const map = { "hi":"hi","mr":"mr","kn":"kn","ta":"ta","te":"te","bn":"bn","gu":"gu","ml":"ml" };
  for(const [code,lang] of Object.entries(map)){
    if(nav.startsWith(code)) return lang;
  }
  return "en";
};

// ── Utilities ─────────────────────────────────────────────────────────
const fmt = n => "₹" + Number(n).toLocaleString("en-IN");
const mask = p => p ? `${p.slice(0,8)} XXXXX` : "";
const greet = () => { const h = new Date().getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; };
const SAREE_GRADS = {
  "Kanjivaram":["#3D0A2E","#8B1D52"], "Banarasi":["#0D1F3C","#1B3D72"],
  "Chanderi":["#1B3D2E","#2E6B4A"],   "Mysore":["#2D0A4E","#5A1A8B"],
  "Paithani":["#003D2E","#006B50"],    "Pochampally":["#4A1500","#8B3000"],
  "Tant":["#0D3349","#1B6080"],        "Sambalpuri":["#2D2A00","#6B6500"],
  "Nalli":["#0D1F3C","#1B4A72"],       "Kanchipuram":["#3D0A2E","#6B1A52"],
  "default":["#2D1B4E","#4A2D6E"],
};
const getSareeGrad = name => {
  const k = Object.keys(SAREE_GRADS).find(k => name.includes(k));
  return k ? SAREE_GRADS[k] : SAREE_GRADS.default;
};

// ═══════════════════════════════════════════════════════════════════════
// PREMIUM DUOTONE SVG ICON LIBRARY
// Aesthetic: refined women-centric luxury — thin plum stroke + gold accent
// Usage: <I.Home size={22} color={T.plum} accent={T.gold} />
// ═══════════════════════════════════════════════════════════════════════
const I = {
  Home: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="8" rx="1" fill={accent} opacity=".25" stroke={accent} strokeWidth="1.4"/>
    </svg>
  ),
  Grid: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="1.6"/>
      <rect x="13" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="1.6"/>
      <rect x="3" y="13" width="8" height="8" rx="2" fill={accent} opacity=".22" stroke={accent} strokeWidth="1.5"/>
      <rect x="13" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="1.6"/>
    </svg>
  ),
  Sparkle: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M12 2l2.09 6.26L20 9.27l-4.91 4.73L16.18 21 12 18.27 7.82 21l1.09-7L4 9.27l5.91-1.01L12 2Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M12 2l2.09 6.26L20 9.27l-4.91 4.73L16.18 21 12 18.27 7.82 21l1.09-7L4 9.27l5.91-1.01L12 2Z" fill={accent} opacity=".18"/>
    </svg>
  ),
  Heart: ({size=22,color=T.roseD,accent=T.rose,filled=false,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke={filled?accent:color} strokeWidth="1.6" fill={filled?accent:"none"} opacity={filled?1:.9}/>
    </svg>
  ),
  Person: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.6"/>
      <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="7" r="2" fill={accent} opacity=".22"/>
    </svg>
  ),
  Store: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M3 9V21h18V9" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M1 7l2-4h18l2 4H1Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={accent} opacity=".18"/>
      <rect x="9" y="13" width="6" height="8" rx="1" stroke={color} strokeWidth="1.4"/>
    </svg>
  ),
  History: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="9" fill={accent} opacity=".07"/>
      <polyline points="12,7 12,12 15,15" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Crown: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M3 17L6 7l6 5 6-5 3 10H3Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={accent} opacity=".18"/>
      <line x1="3" y1="20" x2="21" y2="20" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Users: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.6"/>
      <path d="M1 21c0-3.866 3.582-7 8-7" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="17" cy="7" r="3" stroke={accent} strokeWidth="1.5"/>
      <path d="M23 21c0-3.314-2.686-6-6-6" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Star: ({size=22,color=T.plumD,accent=T.gold,filled=false,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2Z"
        stroke={filled?accent:color} strokeWidth="1.6" strokeLinejoin="round"
        fill={filled?accent:"none"} opacity={filled?1:.9}/>
    </svg>
  ),
  Bell: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={accent} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="18" cy="5" r="3" fill={accent} opacity=".85"/>
    </svg>
  ),
  Lock: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.6"/>
      <rect x="3" y="11" width="18" height="11" rx="2" fill={accent} opacity=".12"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1.5" fill={accent}/>
    </svg>
  ),
  Help: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="9" fill={accent} opacity=".07"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill={accent}/>
    </svg>
  ),
  Globe: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6"/>
      <path d="M12 3C9 7 9 17 12 21M12 3C15 7 15 17 12 21M3 12h18" stroke={accent} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  LogOut: ({size=22,color=T.error,accent="#FFCDD2",style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <rect x="3" y="3" width="6" height="18" rx="1" fill={accent} opacity=".2"/>
      <polyline points="16,17 21,12 16,7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Scissors: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="6" cy="6" r="3" stroke={color} strokeWidth="1.6"/>
      <circle cx="6" cy="18" r="3" stroke={color} strokeWidth="1.6"/>
      <circle cx="6" cy="6" r="1.5" fill={accent} opacity=".3"/>
      <circle cx="6" cy="18" r="1.5" fill={accent} opacity=".3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88" stroke={accent} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="20" y1="20" x2="8" y2="8" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Ruler: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="2" y="7" width="20" height="10" rx="2" stroke={color} strokeWidth="1.6"/>
      <rect x="2" y="7" width="20" height="10" rx="2" fill={accent} opacity=".10"/>
      {[5,8,11,14,17].map(x=>(
        <line key={x} x1={x} y1="7" x2={x} y2={x===8||x===14?10:9} stroke={color} strokeWidth="1.2"/>
      ))}
    </svg>
  ),
  Package: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill={accent} opacity=".10"/>
      <polyline points="2,7 12,12 22,7" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <line x1="12" y1="22" x2="12" y2="12" stroke={color} strokeWidth="1.6"/>
    </svg>
  ),
  Tag: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" fill={accent} opacity=".14"/>
      <circle cx="7" cy="7" r="1.5" fill={accent}/>
    </svg>
  ),
  Flash: ({size=22,color=T.amber,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={color} opacity=".2"/>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  Gift: ({size=22,color=T.roseD,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="3" y="8" width="18" height="4" rx="1" stroke={color} strokeWidth="1.6"/>
      <rect x="5" y="12" width="14" height="9" rx="1" stroke={color} strokeWidth="1.6"/>
      <rect x="5" y="12" width="14" height="9" rx="1" fill={color} opacity=".12"/>
      <path d="M12 8v13" stroke={color} strokeWidth="1.4"/>
      <path d="M12 8C12 8 9 6 9 4a3 3 0 0 1 3 3" stroke={T.rose} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12 8C12 8 15 6 15 4a3 3 0 0 0-3 3" stroke={T.rose} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Share: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="18" cy="5" r="3" stroke={accent} strokeWidth="1.5" fill={accent} opacity=".2"/>
      <circle cx="6" cy="12" r="3" stroke={color} strokeWidth="1.5"/>
      <circle cx="18" cy="19" r="3" stroke={color} strokeWidth="1.5"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={accent} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  ArrowRight: ({size=20,color=T.textGhost,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <polyline points="9 18 15 12 9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ArrowLeft: ({size=20,color=T.plumD,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M19 12H5" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M12 19l-7-7 7-7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Check: ({size=20,color=T.success,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  X: ({size=20,color=T.textMuted,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Saree: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <ellipse cx="12" cy="10" rx="5" ry="9" stroke={color} strokeWidth="1.6"/>
      <path d="M7 10C5 14 5 20 12 22 19 20 19 14 17 10" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9 5C9 5 11 3 12 2C13 3 15 5 15 5" stroke={accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="10" y1="6" x2="14" y2="6" stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  Lamp: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M12 2L6 10h12L12 2Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={accent} opacity=".22"/>
      <rect x="10" y="10" width="4" height="8" rx="1" stroke={color} strokeWidth="1.5"/>
      <path d="M8 20h8" stroke={accent} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  WA: ({size=22,color="#25D366",style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 0C5.495 0 .16 5.335.157 11.892a11.8 11.8 0 0 0 1.588 5.945L0 24l6.304-1.654a11.9 11.9 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893A11.82 11.82 0 0 0 20.397 3.48 11.82 11.82 0 0 0 12.05 0Z"/>
    </svg>
  ),
  Settings: ({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="3" stroke={accent} strokeWidth="1.6" fill={accent} opacity=".22"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke={color} strokeWidth="1.4"/>
    </svg>
  ),
};

// ═══════════════════════════════════════════════════════════════════════
// OFFERS & PROMOTIONS CAROUSEL
// ═══════════════════════════════════════════════════════════════════════
function OffersCarousel({ onNavigate, lang }) {
  const { customer } = useApp();
  const [dismissed, setDismissed] = useState([]);
  const scrollRef = useRef(null);
  const visible = OFFERS_DATA.filter(o =>
    customer.visitedStoreIds.includes(o.storeId) && !dismissed.includes(o.id)
  );
  if (!visible.length) return null;
  const iconMap = {
    festival: <I.Lamp size={26} color="#fff" accent="rgba(255,255,255,.5)"/>,
    star:     <I.Star size={26} color="#fff" accent="rgba(255,255,255,.5)" filled/>,
    gift:     <I.Gift size={26} color="#fff"/>,
    sparkle:  <I.Sparkle size={26} color="#fff" accent="rgba(255,255,255,.5)"/>,
    flash:    <I.Flash size={26} color="#fff"/>,
    users:    <I.Users size={26} color="#fff" accent="rgba(255,255,255,.5)"/>,
  };
  return (
    <div style={{padding:"16px 0 4px"}}>
      <div style={{display:"flex",alignItems:"center",padding:"0 14px 10px",gap:6}}>
        <I.Tag size={16} color={T.goldD} accent={T.gold}/>
        <span className="serif" style={{flex:1,fontSize:15,fontWeight:600,color:T.text,fontStyle:"italic"}}>
          {S("offersPromos",lang)}
        </span>
        <span style={{fontSize:11,color:T.textGhost}}>{visible.length} active</span>
      </div>
      <div ref={scrollRef} className="no-scroll"
        style={{display:"flex",gap:10,overflowX:"auto",padding:"0 14px 4px",scrollSnapType:"x mandatory"}}>
        {visible.map((offer) => {
          const store = STORES[offer.storeId];
          return (
            <div key={offer.id} className="silk press"
              style={{flexShrink:0,width:272,borderRadius:T.r,overflow:"hidden",cursor:"pointer",
                background:`linear-gradient(135deg,${offer.grad[0]},${offer.grad[1]})`,
                boxShadow:`0 6px 24px ${offer.grad[0]}55`,scrollSnapAlign:"start",position:"relative"}}>
              <button onClick={e=>{e.stopPropagation();setDismissed(d=>[...d,offer.id]);}}
                style={{position:"absolute",top:10,right:10,width:26,height:26,borderRadius:"50%",
                  background:"rgba(255,255,255,.15)",border:"none",cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>
                <I.X size={13} color="rgba(255,255,255,.8)"/>
              </button>
              <div style={{padding:"16px 16px 14px"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",
                  borderRadius:T.rPill,background:"rgba(255,255,255,.18)",
                  border:"1px solid rgba(255,255,255,.22)",marginBottom:10}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:offer.badgeColor,flexShrink:0}}/>
                  <span style={{fontSize:10,fontWeight:800,color:"#fff",letterSpacing:"0.8px"}}>{offer.badge}</span>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{flexShrink:0}}>{iconMap[offer.icon]||<I.Sparkle size={26} color="#fff"/>}</div>
                  <div>
                    <div className="serif" style={{fontSize:15,fontWeight:700,color:"#fff",fontStyle:"italic",lineHeight:1.25,marginBottom:3}}>
                      {offer.headline}
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.7)",lineHeight:1.5}}>{offer.subline}</div>
                  </div>
                </div>
              </div>
              <div style={{padding:"8px 16px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",
                borderTop:"1px solid rgba(255,255,255,.12)"}}>
                <div>
                  {store&&<div style={{display:"flex",alignItems:"center",gap:4}}>
                    <I.Store size={11} color="rgba(255,255,255,.5)" accent="rgba(255,255,255,.3)"/>
                    <span style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:500}}>{store.short}</span>
                  </div>}
                  <span style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{offer.expiry}</span>
                </div>
                <button onClick={()=>{
                  if(offer.type==="referral") onNavigate("refer");
                  else if(offer.type==="collection") onNavigate("new");
                  else onNavigate("stores-list");
                }} className="press"
                  style={{padding:"6px 14px",borderRadius:T.rPill,background:"rgba(255,255,255,.22)",
                    border:"1px solid rgba(255,255,255,.3)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  {offer.cta} ›
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAILOR DISCOVERY SHEET
// ═══════════════════════════════════════════════════════════════════════
function TailorDiscoverySheet({ look, onClose, showToast, lang }) {
  const [connected, setConnected] = useState({});
  const matched = TAILORS.filter(t =>
    t.storeId===look.storeId || t.fabrics.some(f=>look.fabric&&look.fabric.includes(f.split(" ")[0]))
  ).slice(0,3);

  const connect = (tailor) => {
    setConnected(c=>({...c,[tailor.id]:true}));
    showToast("Connecting you to " + tailor.name + " on WhatsApp…");
    setTimeout(()=>window.open(
      tailor.whatsapp + "?text=Hi " + tailor.name + "! I%27m interested in a blouse for my " + look.saree + " from Wearify. Can you help?",
      "_blank"),400);
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(13,4,24,.72)",
      backdropFilter:"blur(8px)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} className="anim-slideUp"
        style={{background:T.ivory,borderRadius:"24px 24px 0 0",padding:"20px 16px 36px",
          width:"100%",maxWidth:430,boxShadow:"0 -16px 60px rgba(45,27,78,.28)"}}>
        <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 18px"}}/>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <I.Scissors size={20} color={T.plumD} accent={T.gold}/>
          <div className="serif" style={{fontSize:18,fontWeight:600,color:T.text,fontStyle:"italic"}}>
            {S("findTailor",lang)}
          </div>
        </div>
        <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>
          {S("tailorNearYou",lang)} · Matched for <strong>{look.fabric}</strong> blouses
        </div>
        <div className="zari" style={{marginBottom:14}}/>
        {matched.length===0
          ?<div style={{textAlign:"center",padding:"20px",color:T.textMuted,fontSize:13}}>
            No verified tailors nearby yet. Ask the store staff for recommendations.
          </div>
          :matched.map((tailor,i)=>{
            const isConn = connected[tailor.id];
            return (
              <div key={tailor.id} className={"anim-slideUp d" + (i+1)}
                style={{marginBottom:12,padding:"12px 14px",background:T.white,borderRadius:T.r,
                  border:"1.5px solid " + (isConn?T.gold:T.borderL),boxShadow:T.shadow}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{display:"flex",gap:3,flexShrink:0}}>
                    {tailor.portfolio.slice(0,2).map((p,j)=>(
                      <div key={j} style={{width:34,height:42,borderRadius:T.rSm,
                        background:"linear-gradient(148deg," + p.grad[0] + "," + p.grad[1] + ")"}}/>
                    ))}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:14,color:T.text}}>{tailor.name}</span>
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:T.rPill,
                        background:tailor.badgeColor+"18",color:tailor.badgeColor}}>
                        {tailor.badge==="Pro Tailor"?"⭐":"✓"} {tailor.badge}
                      </span>
                    </div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{tailor.specialty}</div>
                    <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:T.goldD,fontWeight:600}}>{tailor.priceRange}</span>
                      <span style={{fontSize:11,color:T.textMid}}>{tailor.area} · {tailor.distance}</span>
                    </div>
                    <div style={{fontSize:11,color:T.textGhost,marginTop:2}}>Delivery ~{tailor.deliveryDays} days</div>
                  </div>
                </div>
                <button onClick={()=>connect(tailor)} className="press"
                  style={{marginTop:10,width:"100%",padding:"9px",borderRadius:T.rPill,
                    display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                    background:isConn?T.successBg:"linear-gradient(135deg,#1A3A2A,#25D366)",
                    border:"1px solid " + (isConn?T.success:"#25D366"),
                    color:isConn?T.success:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  {isConn
                    ?<><I.Check size={15} color={T.success}/> Message Sent!</>
                    :<><I.WA size={15}/> {S("connectTailor",lang)}</>}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: MY TAILOR ORDERS
// ═══════════════════════════════════════════════════════════════════════
function TailorOrdersScreen({ onBack, showToast, lang }) {
  const [ratingFor, setRatingFor] = useState(null);
  const [starRating, setStarRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [measureOpen, setMeasureOpen] = useState(false);

  const statusConfig = {
    confirmed:    { label:"Confirmed",          color:T.plumL,  bg:T.plumGhost, step:1 },
    measurements: { label:"Measurements Taken", color:"#1A4A65",bg:T.blush,     step:2 },
    stitching:    { label:"Stitching",           color:T.amber,  bg:T.amberBg,   step:3 },
    ready:        { label:"Ready for Pickup",    color:T.success,bg:T.successBg, step:4 },
    delivered:    { label:"Delivered",           color:T.success,bg:T.successBg, step:5 },
  };
  const steps = ["Confirmed","Measurements","Stitching","Ready","Delivered"];

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise" style={{background:T.gradHero,padding:"24px 18px 20px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press"
            style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",
              width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",
              justifyContent:"center",cursor:"pointer",color:T.onDark,marginBottom:16}}>
            <I.ArrowLeft size={20} color={T.onDark}/>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <I.Scissors size={24} color={T.goldL} accent="rgba(255,255,255,.5)"/>
            <div className="serif" style={{fontSize:24,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>
              {S("myTailorOrders",lang)}
            </div>
          </div>
          <div style={{color:"rgba(253,248,240,.55)",fontSize:13,marginTop:4}}>
            {TAILOR_ORDERS.length} orders · Track, manage and rate
          </div>
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"14px 14px 96px"}}>
        {/* Measurements card */}
        <div onClick={()=>setMeasureOpen(true)} className="press"
          style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
            background:"linear-gradient(135deg,#FDF5E4,#FBF0F4)",borderRadius:T.r,
            border:"1px solid " + T.borderGold,marginBottom:14,cursor:"pointer"}}>
          <I.Ruler size={22} color={T.goldD} accent={T.gold}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,color:T.goldD}}>{S("measurements",lang)}</div>
            <div style={{fontSize:12,color:T.textMid,marginTop:1}}>Updated {MEASUREMENTS.updatedDate} · Tap to share with tailor</div>
          </div>
          <I.ArrowRight size={18} color={T.goldD}/>
        </div>

        {TAILOR_ORDERS.map((order,i)=>{
          const sc = statusConfig[order.status]||statusConfig.confirmed;
          const store = STORES[order.storeId]||{};
          return (
            <div key={order.id} className={"anim-slideUp d" + (i+1)}
              style={{background:T.white,borderRadius:T.r,border:"1px solid " + T.borderL,
                boxShadow:T.shadow,marginBottom:14,overflow:"hidden"}}>
              <div style={{padding:"7px 14px",background:"linear-gradient(135deg," + (store.grad||[T.plum,T.plumL])[0] + "14," + (store.grad||[T.plum,T.plumL])[1] + "08)",
                display:"flex",alignItems:"center",gap:7,borderBottom:"1px solid " + T.borderL}}>
                <I.Store size={13} color={T.plumD} accent={T.gold}/>
                <span style={{fontSize:11,fontWeight:600,color:T.plumD}}>{store.short||"Store"}</span>
                <span style={{fontSize:10,color:T.textGhost}}>· {order.id}</span>
              </div>
              <div style={{padding:"13px 14px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div className="serif" style={{fontWeight:700,fontSize:15,color:T.text,fontStyle:"italic"}}>{order.service}</div>
                    <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>For: {order.saree}</div>
                  </div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:16,color:T.goldD}}>₹{order.price}</div>
                </div>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",
                  borderRadius:T.rPill,background:sc.bg,marginBottom:10}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:sc.color}}/>
                  <span style={{fontSize:12,fontWeight:700,color:sc.color}}>{sc.label}</span>
                </div>
                {order.status!=="delivered"&&(
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex",gap:0,marginBottom:5}}>
                      {steps.map((_,j)=>{
                        const done=j<sc.step;
                        return (
                          <div key={j} style={{flex:1}}>
                            <div style={{height:3,background:done?T.gold:T.linen,
                              borderRadius:j===0?"3px 0 0 3px":j===steps.length-1?"0 3px 3px 0":"0"}}/>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      {steps.map((s,j)=>(
                        <div key={j} style={{fontSize:8,color:j<sc.step?T.goldD:T.textGhost,fontWeight:j===sc.step-1?700:400,
                          textAlign:"center",width:(100/steps.length)+"%"}}>{s}</div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",
                  borderTop:"1px dashed " + T.borderL}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <I.Scissors size={13} color={T.plumL} accent={T.gold}/>
                    <span style={{fontSize:12,color:T.textMid}}>{order.tailorName}</span>
                  </div>
                  <span style={{fontSize:11,color:T.textGhost}}>Due {order.agreedDate}</span>
                </div>
                {order.notes&&<div style={{fontSize:11,color:T.textMuted,fontStyle:"italic",padding:"5px 0",borderTop:"1px solid " + T.borderL}}>"{order.notes}"</div>}
              </div>
              <div style={{padding:"10px 14px 14px",display:"flex",gap:8}}>
                <button onClick={()=>window.open(order.tailorWhatsapp,"_blank")} className="press"
                  style={{flex:2,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                    padding:"9px",borderRadius:T.rPill,
                    background:"linear-gradient(135deg,#1A3A2A,#25D366)",
                    border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  <I.WA size={15}/> WhatsApp Tailor
                </button>
                {order.status==="delivered"&&(
                  <button onClick={()=>{setRatingFor(order);setStarRating(0);}} className="press"
                    style={{flex:1,padding:"9px",borderRadius:T.rPill,background:T.goldGhost,
                      border:"1px solid " + T.borderGold,color:T.goldD,fontSize:13,fontWeight:600,
                      cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    <I.Star size={13} color={T.goldD} accent={T.gold} filled/> Rate
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div style={{padding:"12px 16px",background:T.blush,borderRadius:T.r,
          border:"1px solid " + T.borderL,display:"flex",gap:12,alignItems:"center"}}>
          <I.Scissors size={22} color={T.roseD}/>
          <div>
            <div style={{fontWeight:600,fontSize:13,color:T.text}}>Need a new tailor?</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Tap "Find a Tailor" on any Look Detail page.</div>
          </div>
        </div>
      </div>

      {/* Measurements sheet */}
      {measureOpen&&(
        <div onClick={()=>setMeasureOpen(false)} style={{position:"fixed",inset:0,background:"rgba(13,4,24,.72)",
          backdropFilter:"blur(8px)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} className="anim-slideUp"
            style={{background:T.ivory,borderRadius:"24px 24px 0 0",padding:"20px 16px 36px",
              width:"100%",maxWidth:430,maxHeight:"86svh",overflowY:"auto"}}>
            <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 16px"}}/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <I.Ruler size={20} color={T.goldD} accent={T.gold}/>
              <div className="serif" style={{fontSize:18,fontWeight:600,color:T.text,fontStyle:"italic"}}>{S("measurements",lang)}</div>
            </div>
            <div style={{fontSize:12,color:T.goldD,padding:"8px 12px",background:T.goldGhost,
              borderRadius:T.rMd,border:"1px solid " + T.borderGold,marginBottom:14}}>
              Share these with your tailor on WhatsApp for a perfect fit — no awkward first-meeting measurements!
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[["Bust",MEASUREMENTS.bust],["Waist",MEASUREMENTS.waist],["Shoulder",MEASUREMENTS.shoulder],
                ["Arm Length",MEASUREMENTS.armLength],["Back Length",MEASUREMENTS.backLength],["Neck",MEASUREMENTS.neckDepthFront]
              ].map(([label,val])=>(
                <div key={label} style={{padding:"10px 12px",background:T.white,borderRadius:T.rMd,
                  border:"1px solid " + T.borderL,boxShadow:T.shadow}}>
                  <div style={{fontSize:10,color:T.textGhost,fontWeight:600,letterSpacing:"0.4px",marginBottom:3}}>{label.toUpperCase()}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:20,color:T.plumD}}>{val}<span style={{fontSize:11,color:T.textMuted,marginLeft:2}}>in</span></div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
              {[["Sleeve",MEASUREMENTS.sleeve],["Neck",MEASUREMENTS.neck],["Fabric",MEASUREMENTS.fabric]].map(([l,v])=>(
                <div key={l} style={{padding:"8px 10px",background:T.white,borderRadius:T.rMd,border:"1px solid " + T.borderL}}>
                  <div style={{fontSize:9,color:T.textGhost,marginBottom:2}}>{l.toUpperCase()}</div>
                  <div style={{fontSize:12,fontWeight:600,color:T.text}}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>{
              const txt = `My blouse measurements\nBust: ${MEASUREMENTS.bust}" · Waist: ${MEASUREMENTS.waist}"\nShoulder: ${MEASUREMENTS.shoulder}" · Arm: ${MEASUREMENTS.armLength}"\nSleeve: ${MEASUREMENTS.sleeve} · Neck: ${MEASUREMENTS.neck}`;
              showToast("Measurements ready to paste!");
              try{navigator.clipboard.writeText(txt);}catch(e){}
            }} className="press"
              style={{width:"100%",padding:"13px",borderRadius:T.rPill,
                background:"linear-gradient(135deg,#1A3A2A,#25D366)",
                border:"none",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <I.WA size={17}/> Copy & Send on WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Rating sheet */}
      {ratingFor&&(
        <div onClick={()=>setRatingFor(null)} style={{position:"fixed",inset:0,background:"rgba(13,4,24,.72)",
          backdropFilter:"blur(8px)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} className="anim-slideUp"
            style={{background:T.ivory,borderRadius:"24px 24px 0 0",padding:"20px 16px 36px",
              width:"100%",maxWidth:430}}>
            <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 16px"}}/>
            <div className="serif" style={{fontSize:20,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:4}}>
              {S("rateTailor",lang)}
            </div>
            <div style={{fontSize:13,color:T.textMuted,marginBottom:18}}>{ratingFor.tailorName} · {ratingFor.service}</div>
            <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20}}>
              {[1,2,3,4,5].map(n=>(
                <span key={n} onClick={()=>setStarRating(n)} onMouseEnter={()=>setHovered(n)} onMouseLeave={()=>setHovered(0)}
                  style={{cursor:"pointer",transition:"transform .15s",transform:n<=(hovered||starRating)?"scale(1.2)":"scale(1)"}}>
                  <I.Star size={38} color={n<=(hovered||starRating)?T.gold:T.linen} accent={T.gold} filled={n<=(hovered||starRating)}/>
                </span>
              ))}
            </div>
            <button disabled={starRating===0} onClick={()=>{setRatingFor(null);showToast("Thank you for rating! ⭐");}} className="press"
              style={{width:"100%",padding:"13px",borderRadius:T.rPill,
                background:starRating===0?"rgba(45,27,78,.15)":T.gradPlum,
                border:"none",color:T.onDark,fontSize:14,fontWeight:600,
                cursor:starRating===0?"not-allowed":"pointer",opacity:starRating===0?.5:1}}>
              Submit Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: LANGUAGE PICKER
// ═══════════════════════════════════════════════════════════════════════
function LanguageScreen({ onBack, currentLang, onChangeLang }) {
  const [selected, setSelected] = useState(currentLang);
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise" style={{background:T.gradHero,padding:"24px 18px 24px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press"
            style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",
              width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",
              justifyContent:"center",cursor:"pointer",color:T.onDark,marginBottom:16}}>
            <I.ArrowLeft size={20} color={T.onDark}/>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <I.Globe size={22} color={T.goldL} accent="rgba(255,255,255,.5)"/>
            <div className="serif" style={{fontSize:24,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>
              {S("language",currentLang)} / Language
            </div>
          </div>
          <div style={{color:"rgba(253,248,240,.55)",fontSize:13}}>Choose your preferred language</div>
        </div>
      </div>
      <div className="zari"/>
      <div style={{padding:"20px 14px 36px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {Object.entries(LANG_META).map(([code, meta])=>{
            const isSel = selected===code;
            return (
              <button key={code} onClick={()=>setSelected(code)} className="press"
                style={{padding:"14px 14px",borderRadius:T.r,textAlign:"left",cursor:"pointer",
                  background:isSel?"linear-gradient(135deg,#fff,#FDF5E4)":T.white,
                  border:"2px solid " + (isSel?T.gold:T.borderL),
                  boxShadow:isSel?T.shadowGold:T.shadow,transition:"all .2s",position:"relative",overflow:"hidden"}}>
                {isSel&&<div style={{position:"absolute",top:0,right:0,width:26,height:26,
                  borderRadius:"0 14px 0 26px",background:T.gradGold,display:"flex",
                  alignItems:"center",justifyContent:"center"}}>
                  <I.Check size={11} color={T.plumD}/>
                </div>}
                <div style={{fontFamily:"Noto Sans,DM Sans,sans-serif",fontSize:20,fontWeight:700,
                  color:isSel?T.goldD:T.plumD,marginBottom:4,lineHeight:1.2}}>{meta.native}</div>
                <div style={{fontSize:11,color:T.textMuted}}>{meta.label}</div>
              </button>
            );
          })}
        </div>
        <div style={{padding:"10px 14px",background:T.blush,borderRadius:T.rMd,
          border:"1px solid " + T.borderL,fontSize:12,color:T.textMid,lineHeight:1.6,marginBottom:16}}>
          Auto-detect is on — your device language is detected on first launch. Override it here anytime.
        </div>
        <button onClick={()=>{onChangeLang(selected);onBack();}} className="press"
          disabled={selected===currentLang}
          style={{width:"100%",padding:"14px",borderRadius:T.rPill,
            background:selected===currentLang?"rgba(45,27,78,.15)":T.gradPlum,
            border:"none",color:T.onDark,fontSize:15,fontWeight:600,
            cursor:selected===currentLang?"default":"pointer",opacity:selected===currentLang?.5:1}}>
          {selected===currentLang ? "Language already set" : "Apply Language"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PRIMITIVE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════
function Btn({ children, onClick, variant="plum", size="md", fullWidth, disabled, loading, style={}, className="" }) {
  const sz = { sm:{p:"8px 16px",fs:13}, md:{p:"13px 22px",fs:15}, lg:{p:"15px 28px",fs:16} }[size];
  const v = {
    plum:{background:T.gradPlum,color:T.onDark,boxShadow:"0 4px 16px rgba(45,27,78,.32)"},
    gold:{background:T.gradGold,color:T.plumD,boxShadow:"0 4px 16px rgba(201,148,26,.32)"},
    outline:{background:"transparent",color:T.plum,border:`1.5px solid ${T.plum}`},
    ghost:{background:"transparent",color:T.plum},
    ivory:{background:T.ivory,color:T.text,border:`1px solid ${T.border}`,boxShadow:T.shadow},
    rose:{background:`linear-gradient(135deg,${T.roseD},${T.rose})`,color:"#fff",boxShadow:"0 4px 14px rgba(139,74,82,.30)"},
    wa:{background:"#25D366",color:"#fff",boxShadow:"0 4px 16px rgba(37,211,102,.35)"},
    danger:{background:"linear-gradient(135deg,#B71C1C,#C62828)",color:"#fff"},
  }[variant]||{};
  return (
    <button onClick={disabled||loading?undefined:onClick}
      className={`press-lg ${className}`}
      style={{...v, padding:sz.p, fontSize:sz.fs, width:fullWidth?"100%":"auto",
        borderRadius:T.rPill, fontFamily:"'DM Sans',sans-serif", fontWeight:600,
        letterSpacing:"0.2px", cursor:disabled||loading?"not-allowed":"pointer",
        opacity:disabled?.42:1, display:"flex", alignItems:"center", justifyContent:"center",
        gap:8, transition:"opacity .15s,transform .1s,box-shadow .2s", flexShrink:0, border:"none", ...style }}>
      {loading?<span style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>:children}
    </button>
  );
}

function Tag({ children, color=T.plumL, bg, small, style={} }) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:small?"3px 9px":"4px 12px",borderRadius:T.rPill,background:bg||`${color}18`,color,fontSize:small?11:12,fontWeight:600,letterSpacing:"0.2px",whiteSpace:"nowrap",...style}}>{children}</span>;
}

function Card({ children, style={}, onClick, className="" }) {
  return <div onClick={onClick} className={`${onClick?"hover-lift":""} ${className}`}
    style={{background:T.white,borderRadius:T.r,boxShadow:T.shadow,border:`1px solid ${T.borderL}`,overflow:"hidden",cursor:onClick?"pointer":"default",transition:"box-shadow .2s,transform .2s",...style}}>{children}</div>;
}

function Toggle({ on, onToggle, disabled }) {
  return (
    <div className="toggle-track press" onClick={disabled?undefined:onToggle}
      style={{background:on?T.gold:T.linen,border:`1.5px solid ${on?T.gold:T.border}`,cursor:disabled?"not-allowed":"pointer"}}>
      <div className="toggle-thumb" style={{left:on?22:3}}/>
    </div>
  );
}

// ── Store pill — compact badge showing a store with city ──────────────
function StorePill({ store, active, onClick, small }) {
  const g = store.grad||[T.plum,T.plumL];
  return (
    <button onClick={onClick} className="press"
      style={{display:"inline-flex",alignItems:"center",gap:6,padding:small?"5px 11px":"7px 14px",
        borderRadius:T.rPill,cursor:"pointer",border:"none",whiteSpace:"nowrap",flexShrink:0,
        background:active?`linear-gradient(135deg,${g[0]},${g[1]})`:"rgba(45,27,78,.08)",
        boxShadow:active?`0 3px 12px ${g[0]}44`:"none",
        transition:"background .2s,box-shadow .2s",
      }}>
      <span style={{fontSize:small?12:14}}>{store.emoji||"🏪"}</span>
      <span style={{fontSize:small?11:13,fontWeight:active?700:500,
        color:active?T.onDark:T.textMid}}>{store.short}</span>
      <span style={{fontSize:small?10:11,color:active?"rgba(253,248,240,.55)":T.textGhost}}>
        {store.city}
      </span>
    </button>
  );
}

// ── Store selector bar — horizontal scroll of store pills ─────────────
function StoreSelector({ selectedStoreId, onChange, stores, label="Filter by store" }) {
  const storeList = Object.values(stores);
  return (
    <div>
      {label&&<div style={{fontSize:11,color:T.textGhost,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px",padding:"10px 16px 6px"}}>{label}</div>}
      <div className="no-scroll" style={{display:"flex",gap:8,padding:"0 14px 10px",overflowX:"auto"}}>
        <button onClick={()=>onChange("ALL")} className="press"
          style={{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:T.rPill,
            whiteSpace:"nowrap",flexShrink:0,border:"none",cursor:"pointer",
            background:selectedStoreId==="ALL"?T.gradPlum:"rgba(45,27,78,.08)",
            color:selectedStoreId==="ALL"?T.onDark:T.textMid,fontWeight:selectedStoreId==="ALL"?700:500,
            fontSize:13,boxShadow:selectedStoreId==="ALL"?T.shadow:"none",transition:"background .2s"}}>
          🌐 All Stores
        </button>
        {storeList.map(s=>(
          <StorePill key={s.id} store={s} active={selectedStoreId===s.id} onClick={()=>onChange(s.id)}/>
        ))}
      </div>
    </div>
  );
}

// ── Wearify global header (replaces store-specific headers) ───────────
function WearifyHeader({ onBack, right, minimal }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px 12px",
      background:T.ivory,borderBottom:`1px solid ${T.borderL}`,
      position:"sticky",top:0,zIndex:20,
      boxShadow:"0 1px 0 rgba(201,148,26,.15)"}}>
      {onBack&&(
        <button onClick={onBack} className="press"
          style={{width:38,height:38,borderRadius:"50%",background:T.goldGhost,
            border:`1.5px solid ${T.border}`,display:"flex",alignItems:"center",
            justifyContent:"center",cursor:"pointer",color:T.plumD,flexShrink:0}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </button>
      )}
      <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
        <span style={{fontSize:18}}>{WEARIFY.logo}</span>
        <span className="serif gold-shimmer" style={{fontSize:20,fontWeight:700,fontStyle:"italic"}}>{WEARIFY.name}</span>
        {!minimal&&<span style={{fontSize:11,color:T.textGhost,marginTop:1,display:"none"}}>·</span>}
      </div>
      {right&&<div>{right}</div>}
    </div>
  );
}

function SareeCard({ look, onTap, onHeart, onWishlist, showHeart, showWishlist, isWished }) {
  const [pid] = useState(`p${look.id}`);
  const grad = look.grad || getSareeGrad(look.name||look.saree||"");
  const name = look.name || look.saree;
  return (
    <div onClick={()=>onTap&&onTap(look)} className="press-lg hover-lift"
      style={{borderRadius:T.r,overflow:"hidden",cursor:"pointer",boxShadow:T.shadow,border:`1px solid ${T.borderL}`}}>
      {/* Silk gradient visual */}
      <div className="silk" style={{height:170,position:"relative",background:`linear-gradient(148deg,${grad[0]} 0%,${grad[1]} 100%)`}}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.13}} aria-hidden>
          <defs><pattern id={pid} x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
            <line x1="0" y1="9" x2="9" y2="0" stroke="#fff" strokeWidth=".6"/>
            <line x1="9" y1="18" x2="18" y2="9" stroke="#fff" strokeWidth=".6"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill={`url(#${pid})`}/>
        </svg>
        <svg viewBox="0 0 80 130" style={{position:"absolute",bottom:-4,left:"50%",transform:"translateX(-50%)",width:52,height:78,opacity:.18}} aria-hidden>
          <path d="M40 8C30 8 22 22 20 40 18 58 24 78 28 96 32 112 38 124 40 124 42 124 48 112 52 96 56 78 62 58 60 40 58 22 50 8 40 8Z" fill="white"/>
        </svg>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(13,4,24,.78) 0%,transparent 55%)"}}/>
        {look.match && <div style={{position:"absolute",top:10,left:10,background:T.gradGold,color:T.plumD,fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:T.rPill}}>{look.match}% Match</div>}
        {look.isNew && <div style={{position:"absolute",top:look.match?10:10,left:look.match?72:10,background:"rgba(253,248,240,.22)",backdropFilter:"blur(8px)",color:T.onDark,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:T.rPill,border:"1px solid rgba(255,255,255,.2)"}}>New</div>}
        {showHeart && onHeart && (
          <button onClick={e=>{e.stopPropagation();onHeart(look);}} className="press"
            style={{position:"absolute",top:10,right:10,width:36,height:36,borderRadius:"50%",background:look.isFav?"rgba(201,148,26,.92)":"rgba(255,255,255,.85)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",animation:look.isFav?"heartBeat .35s ease both":undefined}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={look.isFav?"#fff":"none"} stroke={look.isFav?"#fff":T.rose} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        )}
        {showWishlist && onWishlist && (
          <button onClick={e=>{e.stopPropagation();onWishlist(look);}} className="press"
            style={{position:"absolute",top:10,right:10,width:36,height:36,borderRadius:"50%",background:isWished?"rgba(201,148,26,.92)":"rgba(255,255,255,.85)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={isWished?"#fff":"none"} stroke={isWished?"#fff":T.plumL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        )}
      </div>
      <div style={{padding:"10px 12px 13px"}}>
        <div className="serif" style={{fontWeight:600,fontSize:15,color:T.text,lineHeight:1.2,marginBottom:2}}>{name}</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:7}}>{look.fabric}{look.occasion?` · ${look.occasion}`:""}{look.date?` · ${look.date}`:""}</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:16,color:T.goldD}}>{fmt(look.price)}</div>
      </div>
    </div>
  );
}

function ScreenHeader({ title, onBack, right, bg=T.ivory }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px 12px",background:bg,borderBottom:`1px solid ${T.borderL}`,position:"sticky",top:0,zIndex:20,boxShadow:`0 1px 0 rgba(201,148,26,.15)`}}>
      {onBack && (
        <button onClick={onBack} className="press"
          style={{width:38,height:38,borderRadius:"50%",background:T.goldGhost,border:`1.5px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.navy||T.plumD,flexShrink:0}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </button>
      )}
      <div className="serif" style={{flex:1,fontWeight:600,fontSize:19,color:T.plumD,fontStyle:"italic"}}>{title}</div>
      {right&&<div>{right}</div>}
    </div>
  );
}

function Toast({ msg, visible }) {
  if(!visible) return null;
  return <div className="anim-slideDown" style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:T.plumD,color:T.onDark,padding:"11px 22px",borderRadius:T.rPill,fontSize:13,fontWeight:500,zIndex:9999,boxShadow:T.shadowLg,whiteSpace:"nowrap",border:"1px solid rgba(201,148,26,.18)"}}>{msg}</div>;
}

// ═══════════════════════════════════════════════════════════════════════
// BOTTOM NAVIGATION
// ═══════════════════════════════════════════════════════════════════════
function BottomNav({ active, onChange }) {
  const { wishlist } = useApp();
  const { lang:ctxLang } = useApp();
  const navLang = ctxLang||"en";
  const tabs = [
    { id:"home",     Icon:I.Home,    label:S("home",navLang) },
    { id:"looks",    Icon:I.Grid,    label:S("myLooks",navLang) },
    { id:"new",      Icon:I.Sparkle, label:S("new",navLang) },
    { id:"wishlist", Icon:I.Heart,   label:S("wishlist",navLang), badge:wishlist.length },
    { id:"me",       Icon:I.Person,  label:S("me",navLang) },
  ];
  return (
    <div style={{position:"sticky",bottom:0,background:"rgba(253,248,240,.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${T.borderL}`,display:"flex",padding:"6px 0 calc(6px + env(safe-area-inset-bottom))",zIndex:40,boxShadow:"0 -4px 20px rgba(45,27,78,.06)"}}>
      {tabs.map(tab=>{
        const sel=active===tab.id;
        return (
          <button key={tab.id} onClick={()=>onChange(tab.id)} className="press"
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,border:"none",background:"none",cursor:"pointer",padding:"5px 2px",color:sel?T.plum:T.textMuted,transition:"color .2s"}}>
            <div style={{position:"relative",transform:sel?"scale(1.15)":"scale(1)",transition:"transform .2s"}}>
              <tab.Icon size={20} color={sel?T.plum:T.textMuted}/>
              {tab.badge>0&&<div className="anim-popIn" style={{position:"absolute",top:-6,right:-8,width:17,height:17,borderRadius:"50%",background:T.gradGold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:T.plumD}}>{tab.badge}</div>}
            </div>
            <span style={{fontSize:10,fontWeight:sel?700:400,letterSpacing:"0.2px"}}>{tab.label}</span>
            {sel&&<div style={{width:18,height:2.5,borderRadius:2,background:T.gradGold}}/>}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: AUTH GATE (Phone + OTP)
// ═══════════════════════════════════════════════════════════════════════
function AuthScreen({ onAuth, currentLang="en", onLangChange }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);
  const valid = phone.length===10 && /^[6-9]/.test(phone);

  useEffect(()=>{
    if(step==="otp"){
      const t=setInterval(()=>setTimer(p=>{if(p<=1){clearInterval(t);setCanResend(true);return 0;}return p-1;}),1000);
      return()=>clearInterval(t);
    }
  },[step]);

  const handleOTP=(idx,val)=>{
    if(!/^\d*$/.test(val))return;
    const n=[...otp]; n[idx]=val.slice(-1); setOtp(n); setError("");
    if(val&&idx<5)refs.current[idx+1]?.focus();
    if(n.every(d=>d)){
      if(n.join("")==="123456"){setLoading(true);setTimeout(()=>onAuth(),500);}
      else{setError("Incorrect OTP. Please try again.");setOtp(["","","","","",""]);setTimeout(()=>refs.current[0]?.focus(),100);}
    }
  };

  return (
    <div className="anim-pageIn" style={{minHeight:"100svh",background:T.gradHero,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 0 40px",position:"relative",overflow:"hidden"}}>
      <div className="noise paisley" style={{position:"absolute",inset:0,opacity:1}}/>
      {[{x:"15%",y:"20%",s:120},{x:"80%",y:"55%",s:90},{x:"50%",y:"75%",s:100}].map((o,i)=>(
        <div key={i} style={{position:"absolute",left:o.x,top:o.y,width:o.s,height:o.s,borderRadius:"50%",background:`radial-gradient(circle,rgba(201,148,26,.15) 0%,transparent 70%)`,pointerEvents:"none",animation:`float ${4+i}s ease-in-out infinite`,animationDelay:`${i*.8}s`}}/>
      ))}
      <div style={{position:"relative",zIndex:1,width:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 24px 24px"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(201,148,26,.12)",border:"2px solid rgba(201,148,26,.30)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,fontSize:30,position:"relative"}}>
          {WEARIFY.logo}
          <div style={{position:"absolute",inset:-7,borderRadius:"50%",border:"1px solid rgba(201,148,26,.12)",animation:"waveRing 3s ease-out infinite"}}/>
        </div>
        <div className="serif gold-shimmer anim-slideDown" style={{fontSize:32,fontWeight:700,fontStyle:"italic",marginBottom:4}}>
          {WEARIFY.name}
        </div>
        <div style={{fontSize:13,color:"rgba(253,248,240,.45)",marginBottom:0,letterSpacing:"0.4px",textAlign:"center"}}>{WEARIFY.subline}</div>
      </div>
      <div className="anim-slideUp d3" style={{position:"relative",zIndex:1,width:"100%",maxWidth:380,padding:"0 16px",flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        {/* Language selector — inline row */}
        <div className="no-scroll anim-slideUp d2" style={{display:"flex",gap:6,overflowX:"auto",justifyContent:"center",marginBottom:12,paddingBottom:4}}>
          {Object.entries(LANG_META).map(([code,meta])=>(
            <button key={code} onClick={()=>onAuth&&onLangChange&&onLangChange(code)} className="press"
              style={{padding:"5px 10px",borderRadius:T.rPill,flexShrink:0,border:"none",cursor:"pointer",
                background:currentLang===code?"rgba(201,148,26,.25)":"rgba(253,248,240,.12)",
                color:currentLang===code?T.goldL:"rgba(253,248,240,.5)",
                fontSize:13,fontWeight:currentLang===code?700:400,
                fontFamily:"Noto Sans,DM Sans,sans-serif",
                transition:"all .2s"}}>
              {meta.native}
            </button>
          ))}
        </div>
        <Card style={{padding:"26px 20px 22px",background:"rgba(253,248,240,.97)",boxShadow:T.shadowLg,border:"1px solid rgba(201,148,26,.12)"}}>
          {step==="phone"?(
            <>
              <div className="serif" style={{fontSize:22,fontWeight:600,color:T.plumD,marginBottom:4,fontStyle:"italic"}}>Welcome back</div>
              <div style={{fontSize:13,color:T.textMuted,marginBottom:20}}>Enter your registered mobile to view your looks</div>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",borderRadius:T.rMd,border:`1.5px solid ${T.border}`,background:T.blush,marginBottom:14}}>
                <Tag color={T.plumL} style={{fontFamily:"'DM Mono',monospace",fontSize:13,flexShrink:0}}>+91</Tag>
                <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                  placeholder="Mobile number" inputMode="numeric"
                  style={{flex:1,border:"none",background:"transparent",fontSize:18,fontFamily:"'DM Mono',monospace",fontWeight:600,color:T.plumD,outline:"none",letterSpacing:"1px"}}/>
              </div>
              {error&&<div className="anim-slideDown" style={{color:T.error,fontSize:12,marginBottom:10}}>{error}</div>}
              <Btn fullWidth variant="plum" size="lg" disabled={!valid} onClick={()=>{setStep("otp");setTimer(60);setCanResend(false);}}>
                Send OTP →
              </Btn>
              <div style={{textAlign:"center",marginTop:14,padding:"6px 12px",background:T.goldGhost,borderRadius:T.rMd}}>
                <span style={{fontSize:12,color:T.goldD}}>💡 Demo OTP: <strong>123456</strong></span>
              </div>
            </>
          ):(
            <>
              <div className="serif" style={{fontSize:22,fontWeight:600,color:T.plumD,marginBottom:4,fontStyle:"italic"}}>Verify OTP</div>
              <div style={{fontSize:13,color:T.textMuted,marginBottom:20}}>Sent to +91 {phone.slice(0,5)} XXXXX</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
                {otp.map((d,i)=>(
                  <input key={i} ref={el=>refs.current[i]=el} value={d}
                    onChange={e=>handleOTP(i,e.target.value)} inputMode="numeric" maxLength={1}
                    style={{width:44,height:54,textAlign:"center",borderRadius:T.rMd,border:`2px solid ${d?T.gold:T.border}`,fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:700,color:T.plumD,outline:"none",background:T.white,boxShadow:d?`0 0 0 3px ${T.gold}22`:"none",transition:"border-color .2s"}}/>
                ))}
              </div>
              {loading&&<div style={{display:"flex",justifyContent:"center",marginBottom:12}}><span className="typing"><span/><span/><span/></span></div>}
              {error&&<div className="anim-slideDown" style={{color:T.error,fontSize:12,marginBottom:10,textAlign:"center"}}>{error}</div>}
              <div style={{textAlign:"center",fontSize:13,color:T.textMuted,marginBottom:14}}>
                {canResend?<button onClick={()=>{setTimer(60);setCanResend(false);setOtp(["","","","","",""]);}} style={{background:"none",border:"none",color:T.plumL,fontWeight:600,cursor:"pointer",fontSize:13}}>Resend OTP</button>:<>Resend in <strong style={{color:T.plumL}}>{timer}s</strong></>}
              </div>
              <button onClick={()=>setStep("phone")} style={{background:"none",border:"none",color:T.textMuted,fontSize:13,cursor:"pointer",width:"100%",textAlign:"center"}}>← Change number</button>
            </>
          )}
        </Card>
        <div style={{textAlign:"center",marginTop:14,color:"rgba(253,248,240,.22)",fontSize:11,letterSpacing:"0.6px"}}>WEARIFY · Phygify Technoservices Pvt. Ltd.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-07 — HOME / LANDING
// ═══════════════════════════════════════════════════════════════════════
function HomeScreen({ onNavigate, lang="en" }) {
  const { customer, wishlist, selectedStoreId, setSelectedStoreId } = useApp();
  const festivalDays = 12;
  const allStores = Object.values(STORES);
  // Most recently visited store for context
  const latestVisit = customer.visitHistory[0];
  const latestStore = latestVisit ? STORES[latestVisit.storeId] : allStores[0];
  const totalLooks = customer.looks.length;
  const totalStores = customer.visitedStoreIds.length;

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      {/* Wearify Hero */}
      <div className="noise paisley" style={{background:T.gradHero,padding:"28px 18px 22px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          {/* Wearify logo row */}
          <div className="anim-slideDown" style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:"rgba(201,148,26,.18)",border:"1.5px solid rgba(201,148,26,.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{WEARIFY.logo}</div>
            <div>
              <div className="serif gold-shimmer" style={{fontSize:20,fontWeight:700,fontStyle:"italic"}}>{WEARIFY.name}</div>
              <div style={{fontSize:11,color:"rgba(253,248,240,.35)",letterSpacing:"0.3px"}}>{WEARIFY.subline}</div>
            </div>
          </div>
          <div className="anim-slideUp d1" style={{fontSize:13,color:"rgba(253,248,240,.45)",marginBottom:2}}>{greet()},</div>
          <div className="anim-slideUp d2 serif" style={{fontSize:28,fontWeight:700,color:T.onDark,fontStyle:"italic",lineHeight:1.15,marginBottom:10}}>
            {customer.name.split(" ")[0]} ✨
          </div>
          {/* Stats row */}
          <div className="anim-slideUp d3" style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:T.rPill,background:"rgba(201,148,26,.15)",border:"1px solid rgba(201,148,26,.22)"}}>
              <I.Saree size={14} color={T.goldL} accent="rgba(255,255,255,.4)"/>
              <span style={{fontSize:12,color:T.goldL,fontWeight:600}}>{totalLooks} looks</span>
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:T.rPill,background:"rgba(201,148,26,.15)",border:"1px solid rgba(201,148,26,.22)"}}>
              <I.Store size={14} color={T.goldL} accent="rgba(255,255,255,.4)"/>
              <span style={{fontSize:12,color:T.goldL,fontWeight:600}}>{totalStores} stores</span>
            </div>
          </div>
          {/* Store credit banner */}
          {customer.storeCredit>0&&(
            <div className="anim-slideUp d4" onClick={()=>onNavigate("loyalty")}
              style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(201,148,26,.18)",border:"1px solid rgba(201,148,26,.35)",padding:"9px 14px",borderRadius:T.rPill,cursor:"pointer"}}>
              <I.Crown size={18} color={T.goldL} accent="rgba(255,255,255,.4)"/>
              <span style={{fontSize:13,color:T.goldL,fontWeight:600}}>
                You have <strong>₹{customer.storeCredit}</strong> Wearify credit waiting! →
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="zari"/>

      {/* ── Offers & Promotions ── */}
      <OffersCarousel onNavigate={onNavigate} lang={lang}/>
      <div className="zari" style={{margin:"0 14px 6px"}}/>

      {/* My Stores — horizontal store cards */}
      <div style={{padding:"16px 0 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"0 14px"}}>
          <div className="serif" style={{flex:1,fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic"}}>My Stores</div>
          <button onClick={()=>onNavigate("stores-list")} style={{background:"none",border:"none",color:T.plumL,fontSize:12,fontWeight:600,cursor:"pointer"}}>View all →</button>
        </div>
        <div className="no-scroll" style={{display:"flex",gap:10,padding:"0 14px 12px",overflowX:"auto"}}>
          {allStores.map((store,i)=>(
            <div key={store.id} onClick={()=>{setSelectedStoreId(store.id);onNavigate("store-detail");}}
              className={`press anim-scaleIn d${i+1} silk`}
              style={{flexShrink:0,width:160,borderRadius:T.r,overflow:"hidden",cursor:"pointer",boxShadow:T.shadow,border:`1.5px solid ${T.borderL}`}}>
              <div style={{height:62,background:`linear-gradient(145deg,${store.grad[0]},${store.grad[1]})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <I.Store size={28} color="rgba(255,255,255,.8)" accent="rgba(255,255,255,.4)"/>
              </div>
              <div style={{padding:"9px 10px 10px",background:T.white}}>
                <div style={{fontWeight:700,fontSize:12,color:T.text,lineHeight:1.2,marginBottom:2}}>{store.short}</div>
                <div style={{fontSize:10,color:T.textMuted}}>{store.city} · {store.visits} visit{store.visits!==1?"s":""}</div>
                <div style={{fontSize:10,color:T.textGhost,marginTop:1}}>Last: {store.lastVisit.split(",")[0]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Festival banner */}
      <div className="silk" onClick={()=>onNavigate("new")}
        style={{margin:"0 14px 14px",background:`linear-gradient(135deg,${T.plum},${T.plumL})`,borderRadius:T.r,padding:"13px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
        <I.Lamp size={28} color={T.goldL} accent="rgba(255,255,255,.4)"/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,color:T.onDark,fontSize:14}}>Navratri in {festivalDays} days</div>
          <div style={{color:"rgba(253,248,240,.6)",fontSize:12,marginTop:2}}>New sarees across your stores · Matched to your taste</div>
        </div>
        <Btn variant="gold" size="sm">View →</Btn>
      </div>

      {/* Quick action grid */}
      <div style={{padding:"0 14px 4px"}}>
        <div className="serif" style={{fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:14}}>What would you like to do?</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
          {[
            { Icon:I.Saree,   label:S("myLooks",lang),     sub:`${totalLooks} try-ons · ${totalStores} stores`,    screen:"looks",       grad:[T.plum,T.plumL] },
            { Icon:I.Sparkle, label:S("newArrivals",lang),  sub:"Matched for you · All stores",                  screen:"new",         grad:["#1B3D2E","#2E6B4A"] },
            { Icon:I.Heart,   label:S("myWishlist",lang),   sub:`${wishlist.length} sarees saved`,                screen:"wishlist",    grad:["#3D1800","#8B4500"] },
            { Icon:I.Store,   label:S("storeLocator",lang), sub:`${allStores.length} Wearify stores`,             screen:"stores-list", grad:["#0D1F3C","#1B3D72"] },
          ].map((a,i)=>(
            <div key={i} onClick={()=>onNavigate(a.screen)} className={`press anim-scaleIn d${i+1}`}
              style={{borderRadius:T.r,overflow:"hidden",cursor:"pointer",boxShadow:T.shadow,border:`1px solid ${T.borderL}`}}>
              <div className="silk" style={{height:64,background:`linear-gradient(145deg,${a.grad[0]},${a.grad[1]})`,display:"flex",alignItems:"center",justifyContent:"center"}}><a.Icon size={28} color="rgba(255,255,255,.88)" accent="rgba(255,255,255,.35)"/></div>
              <div style={{padding:"8px 10px 10px",background:T.white}}>
                <div style={{fontWeight:700,fontSize:13,color:T.text}}>{a.label}</div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent looks — cross-store */}
      {customer.looks.length>0&&(
        <div style={{padding:"18px 14px 4px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <I.History size={17} color={T.plumD} accent={T.gold}/>
            <div className="serif" style={{flex:1,fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic"}}>{S("recentLooks",lang)}</div>
            <button onClick={()=>onNavigate("looks")} style={{background:"none",border:"none",color:T.plumL,fontSize:12,fontWeight:600,cursor:"pointer"}}>{S("viewAll",lang)}</button>
          </div>
          <div className="no-scroll" style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}}>
            {customer.looks.slice(0,3).map(look=>(
              <div key={look.id} style={{flexShrink:0,width:156,position:"relative"}}>
                <SareeCard look={look} onTap={()=>onNavigate("look-detail",look)}/>
                {/* Store badge on look card */}
                {STORES[look.storeId]&&(
                  <div style={{position:"absolute",bottom:48,left:6,right:6,display:"flex",justifyContent:"flex-start"}}>
                    <div style={{background:"rgba(13,4,24,.72)",backdropFilter:"blur(4px)",padding:"2px 8px",borderRadius:T.rPill,display:"inline-flex",alignItems:"center",gap:4}}>
                      <I.Store size={8} color="rgba(253,248,240,.7)" accent="rgba(255,255,255,.3)"/>
                      <span style={{fontSize:9,color:"rgba(253,248,240,.75)",fontWeight:600}}>{STORES[look.storeId].city}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp CTA — Wearify-framed */}
      <div style={{padding:"14px 14px 28px"}}>
        <div style={{padding:"14px 16px",background:T.blush,borderRadius:T.r,border:`1px solid ${T.borderL}`,display:"flex",gap:12,alignItems:"center"}}>
          <I.WA size={26}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:14,color:T.text,marginBottom:2}}>{S("chatStore",lang)}</div>
            <div style={{fontSize:12,color:T.textMuted}}>{S("chatStoreDesc",lang)}</div>
          </div>
          <Btn variant="wa" size="sm" onClick={()=>onNavigate("stores-list")} style={{flexShrink:0}}>
            {S("chooseStore",lang)}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-08 — MY LOOKS
// ═══════════════════════════════════════════════════════════════════════
function MyLooksScreen({ onNavigate, onBack }) {
  const { customer, toggleFav } = useApp();
  const [storeFilter, setStoreFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("All");

  const storeFiltered = storeFilter==="ALL"
    ? customer.looks
    : customer.looks.filter(l=>l.storeId===storeFilter);
  const filtered = dateFilter==="All"
    ? storeFiltered
    : storeFiltered.filter(l=>l.date.includes(dateFilter));
  const totalStores = [...new Set(customer.looks.map(l=>l.storeId))].length;

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise" style={{background:T.gradHero,padding:"24px 18px 20px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.onDark,marginBottom:16}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="serif" style={{fontSize:26,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>My Looks</div>
          <div style={{color:"rgba(253,248,240,.55)",fontSize:13,marginTop:4}}>
            {customer.looks.length} try-ons across <strong style={{color:T.goldL}}>{totalStores} stores</strong>
          </div>
        </div>
      </div>
      <div className="zari"/>

      {/* Store filter row */}
      <div style={{background:T.white,borderBottom:`1px solid ${T.borderL}`}}>
        <div style={{fontSize:11,color:T.textGhost,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.6px",padding:"8px 14px 4px"}}>Filter by store</div>
        <div className="no-scroll" style={{display:"flex",gap:8,padding:"0 14px 10px",overflowX:"auto"}}>
          <button onClick={()=>setStoreFilter("ALL")} className="press"
            style={{padding:"6px 14px",borderRadius:T.rPill,whiteSpace:"nowrap",flexShrink:0,border:"none",cursor:"pointer",fontSize:12,fontWeight:storeFilter==="ALL"?700:500,background:storeFilter==="ALL"?T.gradPlum:"rgba(45,27,78,.08)",color:storeFilter==="ALL"?T.onDark:T.textMid}}>
            🌐 All Stores ({customer.looks.length})
          </button>
          {[...new Set(customer.looks.map(l=>l.storeId))].map(sid=>{
            const s=STORES[sid]; if(!s)return null;
            const cnt=customer.looks.filter(l=>l.storeId===sid).length;
            return (
              <StorePill key={sid} store={s} active={storeFilter===sid}
                onClick={()=>setStoreFilter(sid)}/>
            );
          })}
        </div>
      </div>

      {/* Date chips for current store filter */}
      {storeFiltered.length>0&&(
        <div className="no-scroll" style={{display:"flex",gap:8,padding:"10px 14px 6px",overflowX:"auto",background:T.ivory}}>
          {["All",...[...new Set(storeFiltered.map(l=>l.date))]].map(f=>(
            <button key={f} onClick={()=>setDateFilter(f)} className="press"
              style={{padding:"5px 12px",borderRadius:T.rPill,whiteSpace:"nowrap",background:dateFilter===f?T.plum:T.white,color:dateFilter===f?T.onDark:T.textMid,border:`1px solid ${dateFilter===f?T.plum:T.border}`,fontSize:11,fontWeight:500,cursor:"pointer",flexShrink:0}}>
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="no-scroll" style={{overflowY:"auto",padding:"8px 14px 96px"}}>
        {filtered.length===0
          ?<div style={{textAlign:"center",padding:"48px 24px",color:T.textMuted,fontSize:14}}>No looks found for this filter.</div>
          :(
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {filtered.map((look,i)=>{
              const store = STORES[look.storeId];
              return (
                <div key={look.id} className={`anim-scaleIn d${Math.min(i+1,6)}`} style={{position:"relative"}}>
                  <SareeCard look={look} onTap={l=>onNavigate("look-detail",l)} showHeart onHeart={toggleFav}/>
                  {/* Store city badge */}
                  {store&&(
                    <div style={{position:"absolute",bottom:50,left:6,pointerEvents:"none"}}>
                      <div style={{background:"rgba(13,4,24,.72)",backdropFilter:"blur(4px)",padding:"2px 8px",borderRadius:T.rPill,display:"inline-flex",alignItems:"center",gap:3}}>
                        <span style={{fontSize:9}}>{store.emoji}</span>
                        <span style={{fontSize:9,color:"rgba(253,248,240,.8)",fontWeight:600}}>{store.city}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-09 — LOOK DETAIL
// ═══════════════════════════════════════════════════════════════════════
function LookDetailScreen({ look, onBack, onNavigate }) {
  const { customer, toggleFav, toggleWish, wishlist, showToast } = useApp();
  const [compareMode, setCompareMode] = useState(false);
  const [compareLook, setCompareLook] = useState(null);
  const [showTailor, setShowTailor] = useState(false);
  const [pollSent, setPollSent] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const isFav = customer.looks.find(l=>l.id===look.id)?.isFav;
  const isWished = wishlist.some(x=>x.id===look.id);
  const grad = look.grad || getSareeGrad(look.saree||look.name||"");
  const pid = `detail-${look.id}`;
  const similar = customer.looks.filter(l=>l.id!==look.id).slice(0,4);
  const visitLooks = customer.looks.filter(l=>l.id!==look.id&&l.visitId===look.visitId);

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      {/* Hero visual */}
      <div style={{position:"relative"}}>
        <div className="silk" style={{height:300,background:`linear-gradient(148deg,${grad[0]} 0%,${grad[1]} 100%)`,position:"relative"}}>
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.14}} aria-hidden>
            <defs><pattern id={pid} x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
              <line x1="0" y1="9" x2="9" y2="0" stroke="#fff" strokeWidth=".65"/>
              <line x1="9" y1="18" x2="18" y2="9" stroke="#fff" strokeWidth=".65"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill={`url(#${pid})`}/>
          </svg>
          <svg viewBox="0 0 80 130" style={{position:"absolute",bottom:-4,left:"50%",transform:"translateX(-50%)",width:76,height:108,opacity:.22}} aria-hidden>
            <path d="M40 6C28 6 20 22 18 42 16 62 22 84 26 104 30 120 37 130 40 130 43 130 50 120 54 104 58 84 64 62 62 42 60 22 52 6 40 6Z" fill="white"/>
            <path d="M18 64C12 74 10 92 14 110" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity=".45"/>
            <path d="M62 64C68 74 70 92 66 110" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity=".45"/>
          </svg>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(13,4,24,.88) 0%,transparent 55%)"}}/>
          {/* Controls */}
          <button onClick={onBack} className="press" style={{position:"absolute",top:16,left:16,width:42,height:42,borderRadius:"50%",background:"rgba(253,248,240,.15)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{position:"absolute",top:16,right:16,display:"flex",gap:8}}>
            <button onClick={()=>toggleFav(look)} className="press" style={{width:42,height:42,borderRadius:"50%",background:isFav?"rgba(201,148,26,.92)":"rgba(253,248,240,.15)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",animation:isFav?"heartBeat .35s ease both":undefined}}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill={isFav?"#fff":"none"} stroke={isFav?"#fff":T.roseL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button onClick={()=>setShowShare(true)} className="press" style={{width:42,height:42,borderRadius:"50%",background:"rgba(253,248,240,.15)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.onDark}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
          </div>
          {/* Title overlay */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"12px 16px 16px"}}>
            <div className="serif" style={{fontSize:24,fontWeight:700,color:"#fff",fontStyle:"italic",lineHeight:1.15}}>{look.saree}</div>
            <div style={{color:"rgba(253,248,240,.6)",fontSize:12,marginTop:3}}>{look.fabric} · Tried {look.date}</div>
          </div>
        </div>
      </div>

      <div className="no-scroll" style={{overflowY:"auto",paddingBottom:120}}>
        {/* Price + social proof */}
        <div style={{padding:"16px 16px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:28,color:T.goldD}}>{fmt(look.price)}</div>
          <Tag color={T.success} style={{padding:"6px 14px"}}>● {look.visitId==="V005"?"On Display":"In Collection"}</Tag>
        </div>
        {/* Social proof */}
        <div style={{padding:"10px 16px 0"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"7px 12px",background:T.white,borderRadius:T.rPill,boxShadow:T.shadow,border:`1px solid ${T.borderL}`}}>
            {["#C2305A","#6B1D8B","#C9941A","#1B5E8F"].map((c,i)=>(
              <div key={i} style={{width:22,height:22,borderRadius:"50%",background:c,border:"2px solid #fff",marginLeft:i>0?-8:0,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,zIndex:4-i}}>♀</div>
            ))}
            <span style={{fontSize:12,color:T.textMuted,marginLeft:4}}><strong style={{color:T.plum}}>28</strong> women tried this month</span>
          </div>
        </div>

        <div className="zari" style={{margin:"14px 16px"}}/>

        {/* AI tip */}
        <div style={{margin:"0 16px",padding:"13px 15px",background:"linear-gradient(135deg,#F4EFF9,#FBF0F4)",borderRadius:T.r,border:`1px solid ${T.plumL}22`}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:18,flexShrink:0}}>✨</span>
            <div>
              <div style={{fontWeight:700,fontSize:12,color:T.plumL,marginBottom:3}}>AI Styling Note</div>
              <p style={{fontSize:13,color:T.textMid,lineHeight:1.65}}>This {look.fabric} looks beautifully on you. Perfect for {look.visitId==="V005"?"your upcoming wedding occasion":"festive gatherings"}. Pair with a deep green or gold silk blouse and traditional temple jewellery.</p>
            </div>
          </div>
        </div>

        {/* Compare feature */}
        {visitLooks.length>0&&(
          <div style={{padding:"16px 16px 0"}}>
            <div className="serif" style={{fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:10}}>Compare with another look</div>
            <div className="no-scroll" style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
              {visitLooks.map(l=>(
                <div key={l.id} onClick={()=>setCompareLook(compareLook?.id===l.id?null:l)} className="press"
                  style={{flexShrink:0,width:100,borderRadius:T.rMd,overflow:"hidden",border:`2px solid ${compareLook?.id===l.id?T.gold:T.borderL}`,cursor:"pointer",boxShadow:compareLook?.id===l.id?T.shadowGold:T.shadowSm}}>
                  <div className="silk" style={{height:80,background:`linear-gradient(148deg,${(l.grad||getSareeGrad(l.saree))[0]},${(l.grad||getSareeGrad(l.saree))[1]})`}}/>
                  <div style={{padding:"5px 6px 6px",background:T.white}}>
                    <div style={{fontSize:10,fontWeight:600,color:T.text,lineHeight:1.2,marginBottom:2}}>{l.saree.split(" ").slice(0,2).join(" ")}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,color:T.goldD}}>{fmt(l.price)}</div>
                  </div>
                </div>
              ))}
            </div>
            {compareLook&&(
              <div className="anim-slideUp" style={{marginTop:12,padding:"12px",background:T.blush,borderRadius:T.rMd,border:`1px solid ${T.borderGold}`}}>
                <div className="serif" style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:8,fontStyle:"italic"}}>Side-by-Side Comparison</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[look,compareLook].map((l,i)=>(
                    <div key={l.id} style={{borderRadius:T.rSm,overflow:"hidden",border:`2px solid ${i===0?T.gold:T.plumL}`}}>
                      <div className="silk" style={{height:90,background:`linear-gradient(148deg,${(l.grad||getSareeGrad(l.saree))[0]},${(l.grad||getSareeGrad(l.saree))[1]})`}}/>
                      <div style={{padding:"6px 8px",background:T.white}}>
                        <div style={{fontSize:11,fontWeight:600,color:T.text,lineHeight:1.2}}>{l.saree.split(" ").slice(0,3).join(" ")}</div>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:i===0?T.goldD:T.plumL,marginTop:2}}>{fmt(l.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Btn fullWidth variant="wa" size="sm" style={{marginTop:10}} onClick={()=>{setShowShare(true);showToast("Share these two looks with your family!");}}>
                  Share Both with Family for Votes 📲
                </Btn>
              </div>
            )}
          </div>
        )}

        {/* Similar */}
        {similar.length>0&&(
          <div style={{padding:"16px 16px 0"}}>
            <div className="serif" style={{fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:10}}>You might also love</div>
            <div className="no-scroll" style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}}>
              {similar.map(l=>(
                <div key={l.id} style={{flexShrink:0,width:148}}>
                  <SareeCard look={l} onTap={()=>onNavigate("look-detail",l)}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Find a Tailor section ── */}
      {look&&(
        <div style={{padding:"0 16px 14px"}}>
          <div style={{padding:"13px 16px",background:"linear-gradient(135deg,#FDF5E4,#FBF0F4)",borderRadius:T.r,
            border:`1px solid ${T.borderGold}`}}>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
              <I.Scissors size={20} color={T.goldD} accent={T.gold}/>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:T.goldD}}>Find a Tailor for this Saree</div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Verified tailors matched for <strong>{look.fabric}</strong> blouses near you</div>
              </div>
            </div>
            {/* Matched tailor previews */}
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {TAILORS.filter(t=>t.fabrics.some(f=>look.fabric&&look.fabric.includes(f.split(" ")[0]))).slice(0,2).map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",
                  background:T.white,borderRadius:T.rMd,border:`1px solid ${T.borderL}`,flex:1}}>
                  <div style={{width:28,height:34,borderRadius:T.rSm,background:`linear-gradient(148deg,${t.portfolio[0].grad[0]},${t.portfolio[0].grad[1]})`,flexShrink:0}}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:11,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:3,marginTop:1}}>
                      <I.Star size={10} color={T.gold} accent={T.gold} filled/>
                      <span style={{fontSize:10,color:T.textMuted}}>{t.rating} · {t.distance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowTailor(true)} className="press"
              style={{width:"100%",padding:"10px",borderRadius:T.rPill,
                background:T.gradPlum,border:"none",color:T.onDark,fontSize:13,fontWeight:600,
                cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              <I.Scissors size={15} color={T.onDark} accent={T.goldL}/>
              Connect with a Tailor →
            </button>
          </div>
        </div>
      )}

      {/* CTA bar */}
      <div style={{position:"sticky",bottom:0,background:"rgba(253,248,240,.97)",backdropFilter:"blur(16px)",borderTop:`1px solid ${T.borderL}`,padding:"11px 14px",zIndex:50}}>
        <div style={{display:"flex",gap:10}}>
          <Btn fullWidth variant={isWished?"ivory":"plum"} size="md" onClick={()=>{toggleWish(look);}} style={{flex:2}}>
            {isWished?<><I.Heart size={15} color={T.roseD} filled/> In Wishlist</>:<><I.Heart size={15} color={T.plumD}/> Save to Wishlist</>}
          </Btn>
          <Btn variant="gold" size="md" onClick={()=>window.open("https://wa.me/919876543210","_blank")} style={{flex:1,fontSize:13}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 2.059.541 3.981 1.488 5.638L0 24l6.544-1.477A11.946 11.946 0 0 0 12 24c6.626 0 12-5.373 12-12S18.626 0 12 0zm5.822 16.244c-.245.687-.921 1.259-1.638 1.427-1.07.246-2.699.189-5.041-1.015-3.063-1.573-5.01-4.687-5.163-4.903C5.824 11.551 5 10.33 5 9.07c0-1.26.663-1.882 1.146-2.125.483-.244.93-.272 1.26-.119.33.153.574.51.779 1.004.206.494.476 1.193.515 1.328.04.135.013.297-.066.476-.08.178-.268.398-.46.524-.178.115-.378.268-.24.518.137.25.609 1.011 1.31 1.637.898.797 1.658 1.045 1.902 1.161.245.115.378.088.519-.09.14-.178.609-.72.773-.962.163-.244.325-.204.544-.123.22.082 1.379.645 1.617.762.236.116.394.173.452.269.057.096.057.564-.188 1.112z"/></svg>
            Buy
          </Btn>
        </div>
      </div>

      {/* Tailor discovery sheet */}
      {showTailor&&<TailorDiscoverySheet look={look} onClose={()=>setShowTailor(false)} showToast={showToast}/> }

      {/* Share sheet */}
      {showShare&&<ShareSheet look={look} onClose={()=>setShowShare(false)} pollSent={pollSent} setPollSent={setPollSent} showToast={showToast}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// COMPONENT: CX-15 — SHARE WITH FAMILY SHEET
// ═══════════════════════════════════════════════════════════════════════
function ShareSheet({ look, onClose, pollSent, setPollSent, showToast }) {
  const [polling, setPolling] = useState(false);
  const [pollContacts, setPollContacts] = useState(["Amma","Didi","Akka"]);
  const [pollResults] = useState({yes:2,no:1,pending:0});
  const name = look.saree;
  const prewritten = `Look how gorgeous I look in this ${name} at ${WEARIFY.name}! ${fmt(look.price)}. What do you think — should I buy it? 😍`;

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(13,4,24,.72)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} className="anim-slideUp"
        style={{background:T.ivory,borderRadius:"24px 24px 0 0",padding:"20px 20px 32px",width:"100%",maxWidth:430,boxShadow:"0 -16px 60px rgba(45,27,78,.28)"}}>
        <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 18px"}}/>
        <div className="serif" style={{fontSize:20,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:4}}>Share with Family</div>
        <div style={{fontSize:13,color:T.textMuted,marginBottom:18}}>Share your look · Get family votes before deciding</div>
        <div className="zari" style={{marginBottom:18}}/>
        {/* Pre-written message */}
        <div style={{padding:"10px 12px",background:T.blush,borderRadius:T.rMd,border:`1px solid ${T.borderL}`,marginBottom:14,fontSize:13,color:T.textMid,lineHeight:1.6,fontStyle:"italic"}}>
          "{prewritten}"
        </div>
        {/* Share options */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          <Btn fullWidth variant="wa" size="md" onClick={()=>{showToast("Opening WhatsApp…");onClose();}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 2.059.541 3.981 1.488 5.638L0 24l6.544-1.477A11.946 11.946 0 0 0 12 24c6.626 0 12-5.373 12-12S18.626 0 12 0z"/></svg>
            Share on WhatsApp (1 tap)
          </Btn>
          <Btn fullWidth variant="plum" size="md" onClick={()=>setPolling(true)}>
            📊 Create Family Poll — "Which saree?"
          </Btn>
          <Btn fullWidth variant="ivory" size="md" onClick={()=>{showToast("Image saved!");onClose();}}>
            📥 Download Look Photo
          </Btn>
        </div>
        {/* Family poll */}
        {polling&&(
          <div className="anim-slideUp" style={{padding:"14px",background:T.white,borderRadius:T.r,border:`1px solid ${T.borderGold}`,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:7,fontWeight:700,fontSize:13,color:T.plumD,marginBottom:10}}><I.Share size={14} color={T.plumL} accent={T.gold}/> Family Poll</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {pollContacts.map((c,i)=><Tag key={i} color={T.plumL}>{c} ✓</Tag>)}
            </div>
            {pollSent?(
              <div style={{background:T.successBg,borderRadius:T.rMd,padding:"10px 12px"}}>
                <div style={{fontWeight:600,fontSize:13,color:T.success,marginBottom:4}}>Results so far:</div>
                <div style={{display:"flex",gap:12}}>
                  <span style={{fontSize:13,fontWeight:700,color:T.success}}>👍 Yes: {pollResults.yes}</span>
                  <span style={{fontSize:13,fontWeight:700,color:T.error}}>👎 No: {pollResults.no}</span>
                </div>
              </div>
            ):(
              <Btn fullWidth variant="plum" size="sm" onClick={()=>{setPollSent(true);showToast("Poll sent to family!");}}>
                Send Poll →
              </Btn>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-10 — MY PREFERENCES
// ═══════════════════════════════════════════════════════════════════════
function PreferencesScreen({ onBack, onNavigate }) {
  const { customer, updatePrefs } = useApp();
  const prefs = customer.preferences;
  const [occasion, setOccasion] = useState(prefs.upcomingOccasion);
  const [saved, setSaved] = useState(false);
  const occasions = ["Wedding","Festival","Office","Party","Daily","Gift"];
  const fabrics   = ["Pure Silk","Georgette","Chanderi","Cotton","Banarasi","Paithani"];
  const colors    = [{l:"Reds & Pinks",c:"#C2305A"},{l:"Blues & Greens",c:"#1B5E8F"},{l:"Golds",c:"#C9941A"},{l:"Purples",c:"#6B1D8B"},{l:"Earthy",c:"#8B5E3C"},{l:"Pastels",c:"#C4B0D8"}];
  const budgets   = ["Under ₹5,000","₹5,000–₹15,000","₹15,000–₹30,000","₹30,000–₹60,000","₹60,000+"];

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title="My Preferences" onBack={onBack}
        right={<Btn variant="plum" size="sm" onClick={()=>setSaved(true)} style={{animation:saved?"goldPulse .6s ease":undefined}}>{saved?"Saved ✓":"Save"}</Btn>}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        {/* Occasions */}
        <div style={{marginBottom:22}}>
          <div className="serif" style={{fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:12}}>Occasions I shop for</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {occasions.map(o=>{
              const sel=prefs.occasions.includes(o);
              return <button key={o} onClick={()=>{}} className="press" style={{padding:"8px 15px",borderRadius:T.rPill,background:sel?T.gradPlum:T.white,color:sel?T.onDark:T.textMid,border:`1.5px solid ${sel?T.plum:T.border}`,fontSize:13,fontWeight:500,cursor:"pointer",boxShadow:sel?T.shadow:T.shadowSm}}>{o}</button>;
            })}
          </div>
        </div>
        {/* Fabrics */}
        <div style={{marginBottom:22}}>
          <div className="serif" style={{fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:12}}>Fabrics I love</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {fabrics.map(f=>{
              const sel=prefs.fabrics.includes(f);
              return <button key={f} onClick={()=>{}} className="press" style={{padding:"8px 15px",borderRadius:T.rPill,background:sel?T.gradPlum:T.white,color:sel?T.onDark:T.textMid,border:`1.5px solid ${sel?T.plum:T.border}`,fontSize:13,fontWeight:500,cursor:"pointer"}}>{f}</button>;
            })}
          </div>
        </div>
        {/* Colors */}
        <div style={{marginBottom:22}}>
          <div className="serif" style={{fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:12}}>Colour preferences</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {colors.map(c=>{
              const sel=prefs.colors.some(pc=>c.l.toLowerCase().includes(pc.toLowerCase().split(" ")[0]));
              return (
                <button key={c.l} onClick={()=>{}} className="press" style={{display:"flex",alignItems:"center",gap:7,padding:"7px 13px",borderRadius:T.rPill,background:sel?`${c.c}18`:T.white,border:`1.5px solid ${sel?c.c:T.borderL}`,cursor:"pointer"}}>
                  <div style={{width:13,height:13,borderRadius:"50%",background:c.c,flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:500,color:sel?c.c:T.textMid,whiteSpace:"nowrap"}}>{c.l}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Budget */}
        <div style={{marginBottom:22}}>
          <div className="serif" style={{fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:12}}>Typical budget</div>
          <div className="no-scroll" style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
            {budgets.map(b=>{
              const sel=prefs.budget===b;
              return <button key={b} onClick={()=>{}} className="press" style={{padding:"9px 16px",borderRadius:T.rPill,whiteSpace:"nowrap",background:sel?T.gradPlum:T.white,color:sel?T.onDark:T.textMid,border:`1.5px solid ${sel?T.plum:T.border}`,fontSize:13,fontWeight:500,cursor:"pointer",flexShrink:0}}>{b}</button>;
            })}
          </div>
        </div>

        {/* Upcoming occasion — G-04 expert addition */}
        <div style={{padding:"16px",background:"linear-gradient(135deg,#FDF5E4,#FBF0F4)",borderRadius:T.r,border:`1px solid ${T.borderGold}`,marginBottom:20}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:12}}>
            <span style={{fontSize:18}}>📅</span>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:T.plumD,marginBottom:2}}>Tell us about an upcoming occasion</div>
              <div style={{fontSize:12,color:T.textMuted,lineHeight:1.6}}>This helps us keep the perfect sarees ready for you before your big day.</div>
            </div>
          </div>
          <input value={occasion.event} onChange={e=>setOccasion({...occasion,event:e.target.value})} placeholder="e.g. Daughter's wedding"
            style={{width:"100%",padding:"10px 13px",borderRadius:T.rSm,border:`1.5px solid ${T.border}`,fontSize:14,marginBottom:8,fontFamily:"'DM Sans',sans-serif",background:T.white,color:T.text,outline:"none",transition:"border-color .18s"}}
            onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
          <input value={occasion.date} onChange={e=>setOccasion({...occasion,date:e.target.value})} placeholder="Month & year (e.g. December 2026)"
            style={{width:"100%",padding:"10px 13px",borderRadius:T.rSm,border:`1.5px solid ${T.border}`,fontSize:14,fontFamily:"'DM Sans',sans-serif",background:T.white,color:T.text,outline:"none",transition:"border-color .18s"}}
            onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
          <div style={{fontSize:11,color:T.goldD,marginTop:8}}>✦ The store will reach out with hand-picked recommendations before your occasion.</div>
        </div>

        {/* DPDP link */}
        <button onClick={()=>onNavigate("dpdp")} style={{background:"none",border:"none",color:T.plumL,fontSize:13,cursor:"pointer",textDecoration:"underline",textDecorationColor:T.plumL+"60",padding:"4px 0"}}>
          🔐 How your data is used (DPDP Act 2023) →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-11A — ALL STORES (Store Locator / My Wearify Stores)
// ═══════════════════════════════════════════════════════════════════════
function StoresListScreen({ onBack, onNavigate, setSelectedStoreId }) {
  const allStores = Object.values(STORES);
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise paisley" style={{background:T.gradHero,padding:"24px 18px 24px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.onDark,marginBottom:16}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:20}}>{WEARIFY.logo}</span>
            <div className="serif gold-shimmer" style={{fontSize:22,fontWeight:700,fontStyle:"italic"}}>{WEARIFY.name} Stores</div>
          </div>
          <div style={{color:"rgba(253,248,240,.55)",fontSize:13}}>
            You've visited <strong style={{color:T.goldL}}>{allStores.length} stores</strong> across India
          </div>
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"16px 14px 96px"}}>
        <div style={{fontSize:12,color:T.textMuted,marginBottom:14,padding:"0 2px",lineHeight:1.6}}>
          All your try-on looks, visit history, and preferences are linked to your phone number — accessible across every Wearify-enabled store.
        </div>
        {allStores.map((store,i)=>{
          const storeLooks = CUSTOMER.looks.filter(l=>l.storeId===store.id);
          const storeVisits = CUSTOMER.visitHistory.filter(v=>v.storeId===store.id);
          return (
            <Card key={store.id} className={`anim-slideUp d${i+1}`}
              onClick={()=>{setSelectedStoreId(store.id);onNavigate("store-detail");}}
              style={{marginBottom:12,overflow:"hidden",cursor:"pointer"}}>
              <div className="silk" style={{height:72,background:`linear-gradient(145deg,${store.grad[0]},${store.grad[1]})`,display:"flex",alignItems:"center",gap:14,padding:"0 16px",position:"relative"}}>
                <span style={{fontSize:28}}>{store.emoji}</span>
                <div>
                  <div className="serif" style={{fontSize:18,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>{store.name}</div>
                  <div style={{fontSize:12,color:"rgba(253,248,240,.6)"}}>{store.city}, {store.state} · Est. {store.since}</div>
                </div>
                <div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(253,248,240,.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
              <div style={{padding:"12px 16px",display:"flex",gap:16}}>
                {[
                  {l:"Visits",v:storeVisits.length,Ic:I.History},
                  {l:"Looks",v:storeLooks.length,Ic:I.Grid},
                  {l:"Last visit",v:store.lastVisit,Ic:I.Star},
                ].map(({l,v,Ic})=>(
                  <div key={l} style={{textAlign:"center",flex:1,borderRight:l!=="Last visit"?`1px solid ${T.borderL}`:undefined,paddingRight:l!=="Last visit"?8:0}}>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:2}}><Ic size={14} color={T.textGhost} accent={T.gold}/></div>
                    <div style={{fontWeight:700,fontSize:13,color:T.plumD}}>{v}</div>
                    <div style={{fontSize:10,color:T.textGhost}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"0 14px 12px",display:"flex",gap:8}}>
                <Btn variant="plum" size="sm" style={{flex:1}} onClick={e=>{e.stopPropagation();setSelectedStoreId(store.id);onNavigate("store-detail");}}>
                  View Store
                </Btn>
                <Btn variant="wa" size="sm" style={{flex:1}} onClick={e=>{e.stopPropagation();window.open(store.whatsapp,"_blank");}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 2.059.541 3.981 1.488 5.638L0 24l6.544-1.477A11.946 11.946 0 0 0 12 24c6.626 0 12-5.373 12-12S18.626 0 12 0z"/></svg>
                  WhatsApp
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-11B — STORE DETAIL (single selected store)
// ═══════════════════════════════════════════════════════════════════════
function StoreDetailScreen({ onBack, selectedStoreId }) {
  const store = STORES[selectedStoreId] || Object.values(STORES)[0];
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise paisley" style={{background:`linear-gradient(155deg,${store.grad[0]} 0%,${store.grad[1]} 100%)`,padding:"24px 18px 28px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.onDark,marginBottom:16}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(201,148,26,.2)",border:"2px solid rgba(201,148,26,.35)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,fontSize:28}}>{store.emoji}</div>
          <div className="serif" style={{fontSize:26,fontWeight:700,color:T.onDark,fontStyle:"italic",marginBottom:2}}>
            {store.name}
          </div>
          <div style={{fontSize:12,color:"rgba(253,248,240,.5)",marginBottom:10}}>{store.city}, {store.state} · Est. {store.since}</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",background:"rgba(27,94,32,.3)",borderRadius:T.rPill,border:"1px solid rgba(129,199,132,.35)"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#81C784"}}/>
            <span style={{fontSize:12,color:"#A5D6A7",fontWeight:500}}>Open now · Closes at {(store.hours||"").split("–")[1]||"8 PM"}</span>
          </div>
          {/* Wearify badge */}
          <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(201,148,26,.12)",borderRadius:T.rPill,border:"1px solid rgba(201,148,26,.22)"}}>
            <span style={{fontSize:10}}>{WEARIFY.logo}</span>
            <span style={{fontSize:11,color:"rgba(253,248,240,.5)"}}>Wearify-enabled store</span>
          </div>
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        {/* Contact actions */}
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          <Btn fullWidth variant="wa" size="md" onClick={()=>window.open(store.whatsapp,"_blank")}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 2.059.541 3.981 1.488 5.638L0 24l6.544-1.477A11.946 11.946 0 0 0 12 24c6.626 0 12-5.373 12-12S18.626 0 12 0z"/></svg>
            WhatsApp
          </Btn>
          <Btn fullWidth variant="plum" size="md" onClick={()=>window.open(`tel:${store.phone||""}`)}>
            📞 Call Store
          </Btn>
        </div>
        {/* Info cards */}
        {[
          { icon:"📍", label:"Address", val:(store.address||""), action:()=>window.open(store.mapUrl||"https://maps.google.com"), actionLabel:"Get Directions →" },
          { icon:"🕐", label:"Hours", val:`${(store.hours||"")} · Closed on ${(store.closedOn||"")}`, action:null },
          { icon:"📱", label:"Phone", val:(store.phone||""), action:()=>window.open(`tel:${store.phone||""}`), actionLabel:"Call →" },
        ].map((item,i)=>(
          <Card key={i} style={{padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{fontSize:20,flexShrink:0}}>{item.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:T.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>{item.label}</div>
                <div style={{fontSize:14,color:T.text,lineHeight:1.5}}>{item.val}</div>
                {item.action&&<button onClick={item.action} style={{background:"none",border:"none",color:T.plumL,fontSize:12,fontWeight:600,cursor:"pointer",padding:"4px 0 0",textDecoration:"underline"}}>{item.actionLabel}</button>}
              </div>
            </div>
          </Card>
        ))}
        {/* Map placeholder */}
        <div onClick={()=>window.open(store.mapUrl||"https://maps.google.com")} className="press"
          style={{borderRadius:T.r,overflow:"hidden",height:160,background:`linear-gradient(135deg,${store.grad[0]},${store.grad[1]})`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:20,border:`1px solid ${T.borderL}`,position:"relative"}}>
          <div className="silk" style={{position:"absolute",inset:0}}/>
          <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:8}}>📍</div>
            <div className="serif" style={{fontSize:16,fontWeight:600,color:T.onDark,fontStyle:"italic"}}>View on Google Maps</div>
            <div style={{fontSize:12,color:"rgba(253,248,240,.6)",marginTop:2}}>{store.city}, {store.state}</div>
          </div>
        </div>
        {/* Collections */}
        <div className="serif" style={{fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:12}}>Collections</div>
        <div className="no-scroll" style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4,marginBottom:20}}>
          {[["Bridal",store.grad[0],store.grad[1],"34"],[" Festival","#3D1800","#8B4500","56"],["Office","#1B2D4E","#2D4A7E","28"],["Daily","#0D3349","#1B6080","42"]].map(([name,c1,c2,cnt])=>(
            <div key={name} className="silk press" style={{flexShrink:0,width:100,height:72,borderRadius:T.rMd,background:`linear-gradient(145deg,${c1},${c2})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:T.shadow}}>
              <div style={{fontWeight:700,fontSize:13,color:T.onDark,textAlign:"center"}}>{name}</div>
              <div style={{fontSize:10,color:"rgba(253,248,240,.55)",marginTop:2}}>{cnt} sarees</div>
            </div>
          ))}
        </div>
        {/* Private viewing CTA */}
        <div style={{padding:"14px 16px",background:T.goldGhost,borderRadius:T.r,border:`1px solid ${T.borderGold}`,display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:22}}>💎</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,color:T.goldD,marginBottom:2}}>Book a Private Viewing</div>
            <div style={{fontSize:12,color:T.textMid}}>Exclusive saree preview just for you. Available for our valued customers.</div>
          </div>
          <Btn variant="gold" size="sm" onClick={()=>window.open(store.whatsapp,"_blank")}>Book</Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-12 — NEW ARRIVALS
// ═══════════════════════════════════════════════════════════════════════
function NewArrivalsScreen({ onBack, onNavigate }) {
  const { wishlist, toggleWish, showToast, selectedStoreId, setSelectedStoreId } = useApp();
  const [notified, setNotified] = useState({});
  // Build combined new arrivals across all stores, filtered by selectedStoreId
  const allArrivals = Object.entries(CUSTOMER.newArrivals).flatMap(([sid,arr])=>
    arr.map(s=>({...s,storeId:sid}))
  );
  const filtered = selectedStoreId==="ALL"
    ? allArrivals
    : allArrivals.filter(s=>s.storeId===selectedStoreId);
  const selectedStoreName = selectedStoreId==="ALL" ? "All Stores" : (STORES[selectedStoreId]?.short||"All");

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise" style={{background:T.gradHero,padding:"24px 18px 20px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.onDark,marginBottom:16}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="serif" style={{fontSize:26,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>New Arrivals</div>
          <div style={{color:"rgba(253,248,240,.55)",fontSize:13,marginTop:4}}>
            {filtered.length} sarees · Matched to your taste · {selectedStoreName}
          </div>
        </div>
      </div>
      <div className="zari"/>
      {/* Store filter */}
      <StoreSelector selectedStoreId={selectedStoreId} onChange={setSelectedStoreId} stores={STORES} label="Show from store"/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"8px 14px 96px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,padding:"6px 12px",background:T.blush,borderRadius:T.rMd,border:`1px solid ${T.borderL}`}}>
          <span style={{fontSize:16}}>🎯</span>
          <div style={{fontSize:13,color:T.textMid,lineHeight:1.5}}>
            Showing <strong style={{color:T.plumD}}>{filtered.length} sarees</strong> matched to your preferences — Silk, Georgette · Wedding & Festival
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
          {filtered.map((saree,i)=>{
            const isWished = wishlist.some(x=>x.id===saree.id);
            const store = STORES[saree.storeId];
            return (
              <div key={saree.id} className={`anim-scaleIn d${Math.min(i+1,6)}`} style={{position:"relative"}}>
                <SareeCard look={{...saree,saree:saree.name,date:`${saree.daysOld}d ago`}}
                  onTap={s=>onNavigate("look-detail",{...s,saree:s.name})}
                  onWishlist={()=>toggleWish({...saree,saree:saree.name})}
                  showWishlist isWished={isWished}/>
                {/* Store city badge */}
                {store&&(
                  <div style={{position:"absolute",bottom:50,left:6,pointerEvents:"none"}}>
                    <div style={{background:"rgba(13,4,24,.72)",backdropFilter:"blur(4px)",padding:"2px 8px",borderRadius:T.rPill,display:"inline-flex",alignItems:"center",gap:3}}>
                      <span style={{fontSize:9}}>{store.emoji}</span>
                      <span style={{fontSize:9,color:"rgba(253,248,240,.8)",fontWeight:600}}>{store.city}</span>
                    </div>
                  </div>
                )}
                {saree.daysOld>10&&(
                  <button onClick={()=>{setNotified({...notified,[saree.id]:true});showToast("We'll notify you on WhatsApp!");}}
                    className="press" style={{position:"absolute",bottom:50,left:8,right:8,padding:"5px",borderRadius:T.rPill,background:notified[saree.id]?T.successBg:T.goldGhost,border:`1px solid ${notified[saree.id]?T.success:T.borderGold}`,fontSize:11,fontWeight:600,cursor:"pointer",color:notified[saree.id]?T.success:T.goldD,textAlign:"center"}}>
                    {notified[saree.id]?"✓ You'll be notified":"🔔 Notify me"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div style={{marginTop:20,padding:"14px 16px",background:T.blush,borderRadius:T.r,border:`1px solid ${T.borderL}`,textAlign:"center"}}>
          <div style={{fontSize:13,color:T.textMuted,marginBottom:10}}>Don't see what you're looking for?</div>
          <Btn variant="wa" size="md" onClick={()=>onNavigate("stores-list")}>
            Ask a Store on WhatsApp →
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-13 — WISHLIST
// ═══════════════════════════════════════════════════════════════════════
function WishlistScreen({ onBack, onNavigate }) {
  const { wishlist, toggleWish, showToast } = useApp();
  if(wishlist.length===0) return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
      <ScreenHeader title="My Wishlist" onBack={onBack}/>
      <div style={{padding:"60px 24px",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:T.blush,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T.roseL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>
        <div className="serif" style={{fontSize:20,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:8}}>Your wishlist is empty</div>
        <p style={{fontSize:14,color:T.textMuted,lineHeight:1.6,maxWidth:260,marginBottom:22}}>Browse new arrivals and save sarees you love. Check stock status anytime.</p>
        <Btn variant="plum" onClick={()=>onNavigate("new")}>Browse New Arrivals →</Btn>
      </div>
    </div>
  );
  const total = wishlist.reduce((s,x)=>s+x.price,0);
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title="My Wishlist" onBack={onBack}/>
      <div style={{padding:"12px 14px 6px",background:T.goldGhost,borderBottom:`1px solid ${T.borderGold}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:13,color:T.goldD}}><strong>{wishlist.length}</strong> sarees · total wishlist value</span>
        <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:15,color:T.goldD}}>{fmt(total)}</span>
      </div>
      <div className="no-scroll" style={{overflowY:"auto",padding:"12px 14px 96px"}}>
        {wishlist.map((saree,i)=>(
          <Card key={saree.id} className={`anim-slideUp d${Math.min(i+1,5)}`} style={{marginBottom:10,display:"flex",overflow:"hidden"}}>
            <div className="silk" style={{width:90,flexShrink:0,background:`linear-gradient(148deg,${(saree.grad||getSareeGrad(saree.saree||saree.name))[0]},${(saree.grad||getSareeGrad(saree.saree||saree.name))[1]})`}}>
              <svg viewBox="0 0 40 60" style={{width:"100%",height:"100%",opacity:.25}} aria-hidden>
                <path d="M20 4C15 4 11 11 10 20 9 29 12 39 14 47 16 55 19 62 20 62 21 62 24 55 26 47 28 39 31 29 30 20 29 11 25 4 20 4Z" fill="white"/>
              </svg>
            </div>
            <div style={{flex:1,padding:"11px 12px"}}>
              <div className="serif" style={{fontSize:15,fontWeight:600,color:T.text,lineHeight:1.2,marginBottom:2}}>{saree.saree||saree.name}</div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>{saree.fabric}{saree.occasion?` · ${saree.occasion}`:""}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:15,color:T.goldD}}>{fmt(saree.price)}</div>
                <Tag color={T.success} small>● Available</Tag>
              </div>
            </div>
            <button onClick={()=>toggleWish(saree)} className="press" style={{width:40,background:"none",border:"none",cursor:"pointer",color:T.roseD,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </Card>
        ))}
        <Btn fullWidth variant="wa" size="md" style={{marginTop:8}} onClick={()=>window.open("https://wa.me/919876543210")}>
          Ask store about my wishlist →
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-16 — DPDP CONSENT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════
function DPDPScreen({ onBack, showToast }) {
  const { customer } = useApp();
  const [consent, setConsent] = useState({...customer.consent});
  const [showDelete, setShowDelete] = useState(false);
  const items = [
    { key:"history", icon:"🗂", title:"Visit History & Preferences", desc:"Save your saree try-on history, occasion preferences, and colour choices. Powers personalised recommendations on your next visit." },
    { key:"messages", icon:"💬", title:"WhatsApp Messages", desc:"Receive your try-on photos, festival alerts, and care tips via WhatsApp. Maximum 2 messages per month." },
    { key:"aiPersonal", icon:"✨", title:"AI Personalisation", desc:"Let AI learn your taste across visits to give better recommendations. Your preferences improve over time." },
    { key:"photos", icon:"📸", title:"Try-On Photo Storage", desc:"Keep your mirror try-on images saved so you can view and share them anytime." },
  ];
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise" style={{background:T.gradHero,padding:"24px 18px 24px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.onDark,marginBottom:16}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(201,148,26,.18)",border:"1.5px solid rgba(201,148,26,.30)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}><I.Lock size={24} color={T.goldL} accent="rgba(255,255,255,.5)"/></div>
          <div className="serif" style={{fontSize:24,fontWeight:700,color:T.onDark,fontStyle:"italic",lineHeight:1.2}}>Your Privacy</div>
          <div style={{color:"rgba(253,248,240,.58)",fontSize:13,marginTop:5,lineHeight:1.6}}>
            You control exactly what {WEARIFY.name} can remember about you.<br/>
            Last updated: <strong style={{color:T.goldL}}>{customer.consent.grantedDate}</strong>
          </div>
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        {/* Consent toggles */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
          {items.map((item,i)=>(
            <Card key={item.key} className={`anim-slideUp d${i+1}`}
              style={{border:`1.5px solid ${consent[item.key]?T.gold:T.borderL}`,background:consent[item.key]?"linear-gradient(135deg,#fff,#FDF5E4)":T.white,transition:"all .2s"}}>
              <div style={{padding:"15px 15px 13px",display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:22,flexShrink:0,marginTop:2}}>{item.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:15,color:T.text,marginBottom:4}}>{item.title}</div>
                  <div style={{fontSize:12,color:T.textMid,lineHeight:1.65}}>{item.desc}</div>
                </div>
                <Toggle on={consent[item.key]} onToggle={()=>setConsent({...consent,[item.key]:!consent[item.key]})}/>
              </div>
            </Card>
          ))}
        </div>
        {/* Legal note */}
        <div style={{padding:"12px 14px",background:T.blush,borderRadius:T.rMd,marginBottom:20,display:"flex",gap:8}}>
          <span style={{fontSize:14,flexShrink:0}}>⚖️</span>
          <div style={{fontSize:12,color:T.roseD,lineHeight:1.6}}>
            Under India's <strong>Digital Personal Data Protection Act 2023</strong>, you can withdraw any consent or request full data deletion at any time. Changes take effect immediately.
          </div>
        </div>
        {/* Actions */}
        <Btn fullWidth variant="plum" size="lg" onClick={()=>showToast("Privacy preferences saved ✓")} style={{marginBottom:12}}>
          Save Preferences
        </Btn>
        <Btn fullWidth variant="ivory" size="md" onClick={()=>showToast("Your data will be sent to your WhatsApp within 24 hours.")} style={{marginBottom:12}}>
          📥 Download My Data (DPDP §14)
        </Btn>
        <button onClick={()=>setShowDelete(true)} style={{background:"none",border:"none",color:T.error,fontSize:13,fontWeight:600,cursor:"pointer",padding:"8px 0",width:"100%",textAlign:"center"}}>
          🗑 Delete All My Data (DPDP §13)
        </button>
        {showDelete&&(
          <div className="anim-scaleIn" style={{marginTop:12,padding:"16px",background:T.errorBg,borderRadius:T.r,border:`1px solid ${T.error}22`}}>
            <div style={{fontWeight:700,fontSize:14,color:T.error,marginBottom:6}}>Delete all my data from {WEARIFY.name}?</div>
            <div style={{fontSize:12,color:T.textMid,lineHeight:1.6,marginBottom:14}}>This will permanently remove your visit history, try-on photos, preferences, and all saved data. This cannot be undone. The process completes within 30 days.</div>
            <div style={{display:"flex",gap:8}}>
              <Btn fullWidth variant="danger" size="sm" onClick={()=>{setShowDelete(false);showToast("Deletion request submitted. Your data will be removed within 30 days.");}}>Yes, Delete Everything</Btn>
              <Btn fullWidth variant="ivory" size="sm" onClick={()=>setShowDelete(false)}>Cancel</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-17 — NOTIFICATION PREFERENCES
// ═══════════════════════════════════════════════════════════════════════
function NotifPrefsScreen({ onBack, showToast }) {
  const { customer } = useApp();
  const [prefs, setPrefs] = useState({...customer.notifPrefs});
  const categories = [
    { key:"tryOn",        icon:"📸", title:"Try-On Photos",       desc:"Your mirror look images after each visit.", locked:true },
    { key:"thankYou",     icon:"🙏", title:"Post-Visit Thank You", desc:"A personal thank you message 2 hours after your visit." },
    { key:"festivals",    icon:"🪔", title:"Festival Collections", desc:"Hand-picked sarees before Navratri, Diwali, and special occasions." },
    { key:"newArrivals",  icon:"✨", title:"New Arrivals",         desc:"New sarees matching your taste — max 1 message/week." },
    { key:"birthday",     icon:"🎂", title:"Birthday & Anniversary",desc:"A personal message on your special day with a store offer." },
    { key:"reengagement", icon:"💌", title:"'We Miss You' Messages", desc:"If you haven't visited in 30+ days — a personal note from the store." },
  ];
  const times = ["Morning (8AM–12PM)","Afternoon (12PM–5PM)","Evening (6PM–9PM)"];
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title="WhatsApp Preferences" onBack={onBack}
        right={<Btn variant="plum" size="sm" onClick={()=>showToast("Preferences saved ✓")}>Save</Btn>}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        <div style={{padding:"12px 14px",background:T.goldGhost,borderRadius:T.rMd,border:`1px solid ${T.borderGold}`,marginBottom:20,display:"flex",gap:8,alignItems:"flex-start"}}>
          <span>💬</span>
          <div style={{fontSize:12,color:T.goldD,lineHeight:1.6}}>All WhatsApp messages require your consent. You can opt out of any category or all messages with one tap.</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
          {categories.map((item,i)=>(
            <Card key={item.key} className={`anim-slideUp d${i+1}`}
              style={{border:`1.5px solid ${prefs[item.key]?T.borderGold:T.borderL}`}}>
              <div style={{padding:"13px 14px 12px",display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:20,flexShrink:0,marginTop:2}}>{item.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14,color:T.text,marginBottom:3}}>{item.title}</div>
                  <div style={{fontSize:12,color:T.textMuted,lineHeight:1.5}}>{item.desc}</div>
                  {item.locked&&<div style={{fontSize:11,color:T.goldD,marginTop:4}}>✦ Cannot be turned off</div>}
                </div>
                <Toggle on={prefs[item.key]} onToggle={item.locked?undefined:()=>setPrefs({...prefs,[item.key]:!prefs[item.key]})} disabled={item.locked}/>
              </div>
            </Card>
          ))}
        </div>
        {/* Best time — G-07 expert addition */}
        <Card style={{padding:"16px",border:`1px solid ${T.borderGold}`,background:T.goldGhost,marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:14,color:T.goldD,marginBottom:4}}>⏰ Best time to message me</div>
          <div style={{fontSize:12,color:T.textMid,lineHeight:1.5,marginBottom:12}}>We'll only send messages during your preferred time. Open rates are 40% better when messages arrive at the right time.</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {times.map(t=>(
              <button key={t} onClick={()=>setPrefs({...prefs,time:t})} className="press"
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:T.rMd,background:prefs.time===t?"linear-gradient(135deg,#fff,#FDF5E4)":T.white,border:`1.5px solid ${prefs.time===t?T.gold:T.border}`,cursor:"pointer",transition:"all .2s"}}>
                <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${prefs.time===t?T.gold:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {prefs.time===t&&<div style={{width:10,height:10,borderRadius:"50%",background:T.gold}}/>}
                </div>
                <span style={{fontSize:13,fontWeight:prefs.time===t?600:400,color:prefs.time===t?T.goldD:T.textMid}}>{t}</span>
              </button>
            ))}
          </div>
        </Card>
        {/* Global opt-out */}
        <button onClick={()=>showToast("All messages stopped. You can re-enable anytime.")} style={{background:"none",border:`1.5px solid ${T.error}`,padding:"12px",borderRadius:T.rPill,color:T.error,fontWeight:600,fontSize:13,cursor:"pointer",width:"100%",transition:"background .15s"}}
          onMouseEnter={e=>e.target.style.background=T.errorBg} onMouseLeave={e=>e.target.style.background="transparent"}>
          🚫 Stop ALL messages from {WEARIFY.name}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-18 — FEEDBACK & RATING
// ═══════════════════════════════════════════════════════════════════════
function FeedbackScreen({ onBack, showToast, onNavigate }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState([]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const quick = ["Staff was very helpful 👌","Loved the sarees ❤️","Mirror experience was amazing ✨","Beautiful store ambience 🌸","Great recommendations 🎯"];
  const submit = () => { setSubmitted(true); showToast("Thank you for your feedback! ⭐"); if(rating>=4)setTimeout(()=>onNavigate("refer"),1500); };
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title="Rate Your Visit" onBack={onBack}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"24px 16px 96px"}}>
        {submitted?(
          <div className="anim-scaleIn" style={{textAlign:"center",padding:"48px 24px"}}>
            <div style={{fontSize:60,marginBottom:16}}>🙏</div>
            <div className="serif" style={{fontSize:24,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:8}}>Thank you, {CUSTOMER.name.split(" ")[0]}!</div>
            <p style={{fontSize:14,color:T.textMuted,lineHeight:1.7,maxWidth:280,margin:"0 auto 24px"}}>Your feedback means the world to us. It helps us serve you better every time.</p>
            {rating>=4&&<div style={{padding:"14px",background:T.goldGhost,borderRadius:T.r,border:`1px solid ${T.borderGold}`,fontSize:13,color:T.goldD}}>✦ Redirecting you to refer a friend…</div>}
          </div>
        ):(
          <>
            {/* Visit context */}
            <div style={{padding:"12px 14px",background:T.blush,borderRadius:T.rMd,border:`1px solid ${T.borderL}`,marginBottom:22,display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:18}}>🗓</span>
              <div>
                <div style={{fontWeight:600,fontSize:13,color:T.text}}>Your visit on {CUSTOMER.lastVisit}</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>With Mohan Kumar · Tried Kanjivaram & Banarasi</div>
              </div>
            </div>
            {/* Stars */}
            <div style={{textAlign:"center",marginBottom:22}}>
              <div className="serif" style={{fontSize:18,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:14}}>How was your experience?</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {[1,2,3,4,5].map(n=>(
                  <span key={n} className="star" onClick={()=>setRating(n)} onMouseEnter={()=>setHovered(n)} onMouseLeave={()=>setHovered(0)}
                    style={{fontSize:36,color:n<=(hovered||rating)?"#C9941A":"#E8D5E0",transition:"color .15s"}}>★</span>
                ))}
              </div>
              {rating>0&&<div style={{fontSize:13,color:T.textMuted,marginTop:8}}>{["","Needs improvement 😕","Could be better 🤔","Good 👍","Great! 😊","Excellent! 🌟"][rating]}</div>}
            </div>
            {/* Quick feedback */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:10}}>Quick feedback (tap all that apply):</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {quick.map(q=>{
                  const sel=selected.includes(q);
                  return <button key={q} onClick={()=>setSelected(sel?selected.filter(x=>x!==q):[...selected,q])} className="press"
                    style={{padding:"7px 13px",borderRadius:T.rPill,background:sel?T.gradPlum:T.white,color:sel?T.onDark:T.textMid,border:`1px solid ${sel?T.plum:T.border}`,fontSize:12,fontWeight:500,cursor:"pointer"}}>{q}</button>;
                })}
              </div>
            </div>
            {/* Text */}
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Anything else you'd like to share? (optional)"
              style={{width:"100%",minHeight:90,padding:"12px 14px",borderRadius:T.rMd,border:`1.5px solid ${T.border}`,fontSize:14,fontFamily:"'DM Sans',sans-serif",color:T.text,resize:"none",outline:"none",transition:"border-color .18s",marginBottom:20}}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
            <Btn fullWidth variant="plum" size="lg" disabled={rating===0} onClick={submit}>
              Submit Feedback →
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-19 — REFER A FRIEND
// ═══════════════════════════════════════════════════════════════════════
function ReferScreen({ onBack, showToast }) {
  const [copied, setCopied] = useState(false);
  const refLink = `wearify.app/ref/PS78X`;
  const preMsg = `Hi! I've been shopping at ${WEARIFY.name} and loving their sarees. Use my link to get ₹500 off your first visit! ${refLink}`;
  const { customer } = useApp();
  const earned = customer.referrals.filter(r=>r.status==="Visited").reduce((s,r)=>s+r.reward,0);
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise paisley" style={{background:T.gradHero,padding:"24px 18px 28px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.onDark,marginBottom:16}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="serif gold-shimmer" style={{fontSize:26,fontWeight:700,fontStyle:"italic",marginBottom:6}}>Refer a Friend</div>
          <div style={{color:"rgba(253,248,240,.55)",fontSize:13,lineHeight:1.6}}>She gets ₹500 off her first visit.<br/>You earn ₹500 store credit.</div>
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        {/* Earnings summary */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          {[["Friends Referred",customer.referrals.length,"👭"],["Visited Store",customer.referrals.filter(r=>r.status==="Visited").length,"🏪"],["Credit Earned",`₹${earned}`,"💰"]].map(([l,v,ic])=>(
            <Card key={l} style={{padding:"12px 10px",textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:4}}>{ic}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:16,color:T.plumD}}>{v}</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:3,lineHeight:1.3}}>{l}</div>
            </Card>
          ))}
        </div>
        {/* Referral link */}
        <div style={{padding:"14px 16px",background:T.blush,borderRadius:T.r,border:`1.5px solid ${T.borderGold}`,marginBottom:16}}>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px"}}>Your referral link</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1,fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:600,color:T.plumD,wordBreak:"break-all"}}>{refLink}</div>
            <Btn variant="gold" size="sm" onClick={()=>{setCopied(true);showToast("Link copied!");}}>
              {copied?"✓":"Copy"}
            </Btn>
          </div>
        </div>
        {/* Pre-written message */}
        <div style={{marginBottom:16,padding:"12px 14px",background:T.white,borderRadius:T.rMd,border:`1px solid ${T.borderL}`,fontSize:13,color:T.textMid,lineHeight:1.65,fontStyle:"italic"}}>
          "{preMsg}"
        </div>
        <Btn fullWidth variant="wa" size="lg" style={{marginBottom:12}} onClick={()=>showToast("Opening WhatsApp with pre-written message…")}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 2.059.541 3.981 1.488 5.638L0 24l6.544-1.477A11.946 11.946 0 0 0 12 24c6.626 0 12-5.373 12-12S18.626 0 12 0z"/></svg>
          Share on WhatsApp (1 tap)
        </Btn>
        {/* Referral history */}
        {customer.referrals.length>0&&(
          <>
            <div className="serif" style={{fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:10}}>Referral History</div>
            {customer.referrals.map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:T.white,borderRadius:T.rMd,border:`1px solid ${T.borderL}`,marginBottom:8,boxShadow:T.shadow}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:T.plumGhost,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:T.plumD}}>{r.name[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14,color:T.text}}>{r.name}</div>
                  <div style={{fontSize:12,color:T.textMuted}}>{r.date}</div>
                </div>
                <div>
                  {r.status==="Visited"?<Tag color={T.success}>✓ Visited · ₹{r.reward} earned</Tag>:<Tag color={T.amber}>Pending</Tag>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-22 — LOYALTY DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
function LoyaltyScreen({ onBack, showToast }) {
  const { customer } = useApp();
  const tiers = [
    { name:"Regular", min:0,    max:999,   icon:"🌸", color:"#8B7EA0" },
    { name:"Silver",  min:1000, max:4999,  icon:"⭐", color:"#6B7280" },
    { name:"Gold",    min:5000, max:14999, icon:"🌟", color:T.goldD },
    { name:"VIP",     min:15000,max:999999,icon:"💎", color:T.plumL },
  ];
  const currentTier = tiers.find(t=>customer.loyaltyPoints>=t.min&&customer.loyaltyPoints<=t.max)||tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier)+1];
  const progress = nextTier?((customer.loyaltyPoints-currentTier.min)/(nextTier.min-currentTier.min))*100:100;
  const history = [
    { desc:"Visit + Purchase · Kanjivaram Silk", pts:200, date:"Mar 22" },
    { desc:"Visit + Purchase · Paithani Silk", pts:150, date:"Jan 11" },
    { desc:"Visit (browse only)", pts:20, date:"Aug 20" },
    { desc:"Referral Credit", pts:500, date:"Mar 10" },
    { desc:"Visit + Purchase · Tant Cotton", pts:50, date:"Nov 5" },
  ];
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise paisley" style={{background:T.gradHero,padding:"24px 18px 28px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.onDark,marginBottom:16}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:42}}>{currentTier.icon}</div>
            <div>
              <div className="serif gold-shimmer" style={{fontSize:26,fontWeight:700,fontStyle:"italic"}}>{currentTier.name} Member</div>
              <div style={{color:"rgba(253,248,240,.55)",fontSize:13,marginTop:2}}>{customer.name}</div>
            </div>
          </div>
          <div style={{marginTop:16,display:"flex",gap:16}}>
            <div style={{background:"rgba(201,148,26,.15)",border:"1px solid rgba(201,148,26,.28)",borderRadius:T.rMd,padding:"10px 16px",flex:1}}>
              <div style={{fontSize:11,color:T.goldL,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>Points</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:24,color:T.goldL}}>{customer.loyaltyPoints.toLocaleString("en-IN")}</div>
            </div>
            <div style={{background:"rgba(201,148,26,.15)",border:"1px solid rgba(201,148,26,.28)",borderRadius:T.rMd,padding:"10px 16px",flex:1}}>
              <div style={{fontSize:11,color:T.goldL,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>Store Credit</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:24,color:T.goldL}}>₹{customer.storeCredit}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        {/* Progress to next tier */}
        {nextTier&&(
          <Card style={{padding:"16px",marginBottom:20,border:`1px solid ${T.borderGold}`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>Progress to {nextTier.icon} {nextTier.name}</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>{customer.nextTierPoints.toLocaleString("en-IN")} more points needed</div>
              </div>
              <div style={{fontSize:24}}>{nextTier.icon}</div>
            </div>
            <div style={{height:10,borderRadius:5,background:T.linen,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:5,background:T.gradGold,width:`${progress}%`,transition:"width 1s ease"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:11,color:T.textMuted}}>{customer.loyaltyPoints} pts</span>
              <span style={{fontSize:11,color:T.textMuted}}>{nextTier.min} pts</span>
            </div>
          </Card>
        )}
        {/* Tier benefits */}
        <div className="serif" style={{fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:12}}>Your {currentTier.name} Benefits</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22}}>
          {[
            "Points on every visit — even if you don't buy",
            "2× points in birthday month 🎂",
            "1.5× points during festival season (Oct–Dec) 🪔",
            "Priority WhatsApp responses from the store",
            currentTier.name==="Gold"||currentTier.name==="VIP"?"Early access to new arrivals 🌟":"Unlock early access at Gold tier",
          ].map((b,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",background:T.white,borderRadius:T.rMd,border:`1px solid ${T.borderL}`}}>
              <span style={{color:T.gold,flexShrink:0}}>✦</span>
              <span style={{fontSize:13,color:T.text,lineHeight:1.5}}>{b}</span>
            </div>
          ))}
        </div>
        {/* All tiers */}
        <div className="serif" style={{fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:12}}>Loyalty Tiers</div>
        <div style={{display:"flex",gap:8,marginBottom:22}}>
          {tiers.map(t=>(
            <div key={t.name} style={{flex:1,padding:"10px 8px",borderRadius:T.rMd,background:customer.loyaltyTier===t.name?"linear-gradient(135deg,#fff,#FDF5E4)":T.white,border:`1.5px solid ${customer.loyaltyTier===t.name?T.gold:T.borderL}`,textAlign:"center",boxShadow:customer.loyaltyTier===t.name?T.shadowGold:T.shadow}}>
              <div style={{fontSize:20,marginBottom:4}}>{t.icon}</div>
              <div style={{fontWeight:700,fontSize:11,color:t.color}}>{t.name}</div>
              <div style={{fontSize:9,color:T.textGhost,marginTop:2}}>{t.min===0?"0":t.min.toLocaleString()}+</div>
            </div>
          ))}
        </div>
        {/* Points history */}
        <div className="serif" style={{fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:12}}>Points History</div>
        {history.map((h,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 0",borderBottom:`1px solid ${T.borderL}`}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:T.goldGhost,border:`1px solid ${T.borderGold}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:11,color:T.goldD,flexShrink:0}}>+{h.pts}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:T.text,lineHeight:1.4}}>{h.desc}</div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{h.date}</div>
            </div>
          </div>
        ))}
        {/* Redeem */}
        <div style={{marginTop:20,padding:"14px 16px",background:T.goldGhost,borderRadius:T.r,border:`1px solid ${T.borderGold}`,textAlign:"center"}}>
          <div style={{fontWeight:700,fontSize:14,color:T.goldD,marginBottom:4}}>Redeem your credit at the store</div>
          <div style={{fontSize:12,color:T.textMid,marginBottom:12}}>Show this screen to the staff and they'll apply your ₹{customer.storeCredit} credit</div>
          <Btn fullWidth variant="gold" size="md" onClick={()=>showToast("Show this to store staff to redeem!")}>
            🎁 Redeem ₹{customer.storeCredit} Credit
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: CX-14 — VISIT HISTORY
// ═══════════════════════════════════════════════════════════════════════
function VisitHistoryScreen({ onBack, onNavigate }) {
  const { customer } = useApp();
  const [storeFilter, setStoreFilter] = useState("ALL");
  const milestones = { 3:"🎉 Your 3rd visit!", 5:"🌟 You've visited 5 times — thank you!" };
  const filteredVisits = storeFilter==="ALL"
    ? customer.visitHistory
    : customer.visitHistory.filter(v=>v.storeId===storeFilter);
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title="Visit History" onBack={onBack}/>
      {/* Store filter */}
      <div style={{background:T.white,borderBottom:`1px solid ${T.borderL}`}}>
        <div className="no-scroll" style={{display:"flex",gap:8,padding:"10px 14px",overflowX:"auto"}}>
          <button onClick={()=>setStoreFilter("ALL")} className="press"
            style={{padding:"6px 14px",borderRadius:T.rPill,whiteSpace:"nowrap",flexShrink:0,border:"none",cursor:"pointer",fontSize:12,fontWeight:storeFilter==="ALL"?700:500,background:storeFilter==="ALL"?T.gradPlum:"rgba(45,27,78,.08)",color:storeFilter==="ALL"?T.onDark:T.textMid}}>
            🌐 All ({customer.visitHistory.length})
          </button>
          {[...new Set(customer.visitHistory.map(v=>v.storeId))].map(sid=>{
            const s=STORES[sid]; if(!s)return null;
            return <StorePill key={sid} store={s} small active={storeFilter===sid} onClick={()=>setStoreFilter(sid)}/>;
          })}
        </div>
      </div>
      <div className="no-scroll" style={{overflowY:"auto",padding:"16px 16px 96px"}}>
        {filteredVisits.map((visit,i)=>{
          const store = STORES[visit.storeId]||{};
          return (
            <div key={visit.id} className={`anim-slideUp d${Math.min(i+1,5)}`}>
              {milestones[i+1]&&(
                <div style={{textAlign:"center",padding:"10px 16px 14px"}}>
                  <Tag color={T.goldD} bg={T.goldGhost} style={{fontSize:12,padding:"6px 16px"}}>{milestones[i+1]}</Tag>
                </div>
              )}
              <Card style={{marginBottom:12,overflow:"hidden"}}>
                {/* Store header strip */}
                <div style={{padding:"8px 14px 8px",background:`linear-gradient(135deg,${(store.grad||[T.plum,T.plumL])[0]}15,${(store.grad||[T.plum,T.plumL])[1]}10)`,borderBottom:`1px solid ${T.borderL}`,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14}}>{store.emoji||"🏪"}</span>
                  <div>
                    <span style={{fontWeight:700,fontSize:12,color:T.plumD}}>{store.short||"Store"}</span>
                    <span style={{fontSize:11,color:T.textGhost,marginLeft:6}}>{store.city}</span>
                  </div>
                </div>
                <div style={{padding:"10px 14px 4px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${T.borderL}`}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:T.text}}>{visit.date}</div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>With {visit.staff} · {visit.sareesTried.length} sarees tried</div>
                  </div>
                  {visit.purchased?<Tag color={T.success} small>Purchased</Tag>:<Tag color={T.textMuted} small>Browse</Tag>}
                </div>
                <div style={{padding:"10px 14px 12px"}}>
                  <div style={{fontSize:12,color:T.textMuted,marginBottom:8,fontWeight:600}}>Sarees Tried:</div>
                  <div className="no-scroll" style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
                    {visit.sareesTried.map((s,j)=>{
                      const look = customer.looks.find(l=>l.saree===s);
                      const grad = getSareeGrad(s);
                      return (
                        <div key={j} onClick={look?()=>onNavigate("look-detail",look):undefined}
                          style={{flexShrink:0,width:70,cursor:look?"pointer":"default"}}>
                          <div className="silk" style={{height:60,borderRadius:T.rSm,background:`linear-gradient(148deg,${grad[0]},${grad[1]})`}}/>
                          <div style={{fontSize:9,color:T.textMid,marginTop:3,lineHeight:1.2,textAlign:"center"}}>{s.split(" ").slice(0,2).join(" ")}</div>
                        </div>
                      );
                    })}
                  </div>
                  {visit.purchased&&<div style={{marginTop:8,fontSize:12,color:T.success,fontWeight:600}}>✓ {visit.purchased}</div>}
                  <div style={{fontSize:11,color:T.goldD,marginTop:6}}>+{visit.points} loyalty points earned</div>
                </div>
              </Card>
            </div>
          );
        })}
        <Btn fullWidth variant="plum" size="md" style={{marginTop:8}} onClick={()=>onNavigate("stores-list")}>
          <span style={{display:"inline-flex",alignItems:"center",gap:5}}><I.Store size={14} color={T.onDark} accent={T.goldL}/> Browse Stores & Book a Visit →</span>
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: ME TAB (CX-10 + settings hub)
// ═══════════════════════════════════════════════════════════════════════
function MeScreen({ onNavigate, lang="en", onSignOut }) {
  const { customer, wishlist, selectedStoreId, setSelectedStoreId } = useApp();
  const visitedStores = customer.visitedStoreIds.map(id=>STORES[id]).filter(Boolean);
  const [showSignOut, setShowSignOut] = useState(false);
  const menuItems = [
    { Icon:I.Settings,  label:S("preferences",lang),      sub:"Occasions, fabrics, colours, upcoming events",             screen:"preferences" },
    { Icon:I.History,   label:S("visitHistory",lang),     sub:`${customer.visitHistory.length} visits across ${visitedStores.length} stores`, screen:"history" },
    { Icon:I.Crown,     label:S("loyaltyCredits",lang),   sub:`${customer.loyaltyPoints} pts · ₹${customer.storeCredit} credit · ${customer.loyaltyTier}`, screen:"loyalty" },
    { Icon:I.Scissors,  label:S("myTailorOrders",lang),   sub:"Track orders, measurements & rate tailors",                screen:"tailor-orders" },
    { Icon:I.Users,     label:S("referFriend",lang),      sub:"Earn ₹500 Wearify credit per successful referral",         screen:"refer" },
    { Icon:I.Star,      label:S("rateVisit",lang),        sub:"Share feedback on your last store visit",                   screen:"feedback" },
    { Icon:I.Bell,      label:S("whatsappPrefs",lang),    sub:"Control what messages you receive and when",               screen:"notifs" },
    { Icon:I.Lock,      label:S("privacyDPDP",lang),      sub:"Manage consent, download or delete your data",             screen:"dpdp" },
    { Icon:I.Globe,     label:S("language",lang),         sub:`${LANG_META[lang]?.native||"English"} · Tap to change`,    screen:"language" },
    { Icon:I.Help,      label:S("helpFAQ",lang),          sub:"Privacy, try-on, contact Wearify",                         screen:"help" },
  ];
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      {/* Wearify profile hero */}
      <div className="noise paisley" style={{background:T.gradHero,padding:"28px 18px 24px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          {/* Wearify branding */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16}}>
            <span style={{fontSize:16}}>{WEARIFY.logo}</span>
            <span className="serif gold-shimmer" style={{fontSize:17,fontWeight:700,fontStyle:"italic"}}>{WEARIFY.name}</span>
          </div>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(201,148,26,.2)",border:"2px solid rgba(201,148,26,.35)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:T.goldL,fontFamily:"'DM Sans',sans-serif"}}>{customer.initials}</div>
            <div>
              <div className="serif" style={{fontSize:22,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>{customer.name}</div>
              <div style={{fontSize:12,color:"rgba(253,248,240,.45)",marginTop:3}}>{customer.masked||mask(customer.phone)}</div>
              <div style={{display:"flex",gap:8,marginTop:6}}>
                <Tag style={{background:"rgba(201,148,26,.2)",color:T.goldL,fontSize:11}}>⭐ {customer.loyaltyTier}</Tag>
                <Tag style={{background:"rgba(253,248,240,.12)",color:"rgba(253,248,240,.7)",fontSize:11}}>{customer.totalVisits} Visits</Tag>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="zari"/>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,borderBottom:`1px solid ${T.borderL}`,background:T.white}}>
        {[
          { l:"Looks",   v:customer.looks.length,       Icon:I.Saree },
          { l:"Stores",  v:visitedStores.length,         Icon:I.Store },
          { l:"Wishlist",v:wishlist.length,              Icon:I.Heart },
          { l:"Credit",  v:"₹"+customer.storeCredit,    Icon:I.Crown },
        ].map(({l,v,Icon},i)=>(
          <div key={i} style={{padding:"12px 4px",textAlign:"center",borderRight:i<3?`1px solid ${T.borderL}`:undefined}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:4}}>
              <Icon size={18} color={T.plumD} accent={T.gold}/>
            </div>
            <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:17,color:T.plumD}}>{v}</div>
            <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>

      {/* My Stores section */}
      <div style={{padding:"16px 0 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"0 14px"}}>
          <div className="serif" style={{flex:1,fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic"}}>My Stores</div>
          <button onClick={()=>onNavigate("stores-list")} style={{background:"none",border:"none",color:T.plumL,fontSize:12,fontWeight:600,cursor:"pointer"}}>All →</button>
        </div>
        <div className="no-scroll" style={{display:"flex",gap:10,padding:"0 14px 14px",overflowX:"auto"}}>
          {visitedStores.map((store,i)=>(
            <div key={store.id} onClick={()=>{setSelectedStoreId(store.id);onNavigate("store-detail");}}
              className="press silk"
              style={{flexShrink:0,width:130,borderRadius:T.r,overflow:"hidden",cursor:"pointer",boxShadow:T.shadow,border:`1px solid ${T.borderL}`}}>
              <div style={{height:52,background:`linear-gradient(145deg,${store.grad[0]},${store.grad[1]})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <I.Store size={22} color="rgba(255,255,255,.85)" accent="rgba(255,255,255,.4)"/>
              </div>
              <div style={{padding:"7px 9px 8px",background:T.white}}>
                <div style={{fontWeight:700,fontSize:11,color:T.text,lineHeight:1.2}}>{store.short}</div>
                <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>{store.city}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="zari" style={{margin:"0 14px 4px"}}/>
      </div>

      {/* Settings menu */}
      <div className="no-scroll" style={{overflowY:"auto",padding:"8px 0 80px"}}>
        {menuItems.map((item,i)=>(
          <button key={i} onClick={()=>onNavigate(item.screen)}
            style={{width:"100%",display:"flex",gap:14,alignItems:"center",padding:"14px 18px",background:"none",border:"none",cursor:"pointer",borderBottom:`1px solid ${T.borderL}`,transition:"background .15s",textAlign:"left"}}
            onMouseEnter={e=>e.currentTarget.style.background=T.blush}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{width:40,height:40,borderRadius:T.rMd,background:T.plumGhost,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><item.Icon size={20} color={T.plumD} accent={T.gold}/></div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14,color:T.text}}>{item.label}</div>
              <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>{item.sub}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textGhost} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ))}
        {/* Footer */}
        <div style={{padding:"12px 18px 8px"}}>
          <Btn fullWidth variant="wa" size="md" style={{marginBottom:10}} onClick={()=>onNavigate("stores-list")}>
            <I.WA size={17}/> Chat with a Wearify Store
          </Btn>
          <button onClick={()=>setShowSignOut(true)} className="press"
            style={{width:"100%",padding:"12px",borderRadius:T.rPill,
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              background:T.errorBg,border:`1px solid ${T.error}22`,cursor:"pointer"}}>
            <I.LogOut size={18}/>
            <span style={{fontSize:14,fontWeight:600,color:T.error}}>{S("signOut",lang)}</span>
          </button>
          <div style={{textAlign:"center",marginTop:12,fontSize:11,color:T.textGhost}}>
            {WEARIFY.logo} {WEARIFY.name} · {WEARIFY.company}
          </div>
        </div>
        {/* Sign-out confirmation */}
        {showSignOut&&(
          <div onClick={()=>setShowSignOut(false)} style={{position:"fixed",inset:0,background:"rgba(13,4,24,.65)",
            backdropFilter:"blur(8px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div onClick={e=>e.stopPropagation()} className="anim-scaleIn"
              style={{background:T.white,borderRadius:T.radiusLg||T.rLg,padding:"24px 22px",maxWidth:320,width:"100%",
                boxShadow:"0 24px 80px rgba(10,22,40,.30)",textAlign:"center"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:T.errorBg,
                display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                <I.LogOut size={24}/>
              </div>
              <div className="serif" style={{fontSize:19,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:6}}>
                {S("signOut",lang)}?
              </div>
              <p style={{fontSize:13,color:T.textMuted,lineHeight:1.65,marginBottom:20}}>
                {S("signOutDesc",lang)}
              </p>
              <div style={{display:"flex",gap:10}}>
                <Btn fullWidth variant="ivory" onClick={()=>setShowSignOut(false)}>{S("cancel",lang)}</Btn>
                <Btn fullWidth variant="danger" onClick={()=>{setShowSignOut(false);onSignOut&&onSignOut();}}>{S("yes",lang)}</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN: HELP / FAQ
// ═══════════════════════════════════════════════════════════════════════
function HelpScreen({ onBack }) {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:"Is my try-on photo stored anywhere?", a:"Your mirror photos are processed on the device and never stored on our servers. Only the final try-on image (with your consent) is saved so you can share it with family. You can delete it anytime from Privacy settings." },
    { q:"Who can see my try-on images?", a:`Only you can see your looks. They are stored securely linked to your phone number. ${WEARIFY.name} staff can see your visit history but cannot access your personal images.` },
    { q:"How do I stop WhatsApp messages?", a:"Go to Me → WhatsApp Preferences and turn off any category, or tap 'Stop all messages'. You can also reply STOP to any message from us on WhatsApp and all messages will stop immediately." },
    { q:"Can I delete all my data?", a:"Yes. Go to Me → Privacy & DPDP → Delete All My Data. Your data will be permanently removed within 30 days. This includes try-on photos, preferences, and visit history." },
    { q:"What is the Smart Mirror try-on?", a:`The Smart Mirror at ${WEARIFY.name} uses AI to show how a saree would look on you — without physically wearing it. The AI processes your image entirely on the mirror device and the camera image is never stored or sent anywhere.` },
    { q:"Why do I need to give my phone number?", a:"Your phone number is used only to link your mirror session and send your try-on photos via WhatsApp. It's never shared with third parties or used for advertising." },
    { q:"What is Wearify?", a:`Wearify is the technology platform powering the Smart Mirror and this experience at ${WEARIFY.name}. It is made by Phygify Technoservices Pvt. Ltd., an Indian company based in Varanasi.` },
  ];
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title="Help & FAQ" onBack={onBack}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        <div style={{marginBottom:20}}>
          {faqs.map((faq,i)=>(
            <div key={i} style={{marginBottom:8,borderRadius:T.rMd,overflow:"hidden",boxShadow:T.shadow,border:`1px solid ${T.borderL}`}}>
              <button onClick={()=>setOpen(open===i?null:i)}
                style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:open===i?T.plumGhost:T.white,border:"none",cursor:"pointer",textAlign:"left",transition:"background .15s"}}>
                <span style={{fontWeight:600,fontSize:14,color:T.plumD,flex:1,lineHeight:1.4,paddingRight:8}}>{faq.q}</span>
                <span style={{color:T.plumL,fontSize:18,flexShrink:0,transform:open===i?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
              </button>
              {open===i&&(
                <div className="anim-slideDown" style={{padding:"0 16px 14px",background:T.plumGhost}}>
                  <p style={{fontSize:13,color:T.textMid,lineHeight:1.7}}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Escalation */}
        <div style={{padding:"16px",background:T.blush,borderRadius:T.r,border:`1px solid ${T.borderL}`,textAlign:"center"}}>
          <div className="serif" style={{fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:4}}>Still have a question?</div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:12}}>Chat directly with {WEARIFY.name} on WhatsApp — we're happy to help!</div>
          <Btn variant="wa" size="md" onClick={()=>window.open("https://wa.me/919876543210")}>
            Chat on WhatsApp →
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// WHATSAPP MESSAGE SIMULATOR (CX-01 to CX-06 previews)
// ═══════════════════════════════════════════════════════════════════════
function WASimulator({ onBack, onNavigate }) {
  const look = CUSTOMER.looks[0];
  const grad = look.grad;
  const messages = [
    {
      type:"out", time:"12:45 PM",
      content:<div style={{padding:"10px 12px"}}>
        <div className="silk" style={{width:"100%",height:220,borderRadius:T.rMd,marginBottom:8,background:`linear-gradient(148deg,${grad[0]},${grad[1]})`,display:"flex",alignItems:"flex-end",padding:12}}>
          <div style={{background:"rgba(253,248,240,.15)",backdropFilter:"blur(6px)",borderRadius:T.rSm,padding:"8px 10px",width:"100%"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#fff"}}>{look.saree}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>{WEARIFY.name} · {fmt(look.price)}</div>
          </div>
        </div>
        <p style={{fontSize:14,color:"#111",lineHeight:1.6,margin:0}}>{CUSTOMER.name.split(" ")[0]}, here's how you look in <strong>{look.saree}</strong> at {WEARIFY.name}! ✨</p>
        <p style={{fontSize:14,color:"#111",lineHeight:1.6,margin:"6px 0 0"}}>What does the family think? 💕</p>
        <button onClick={()=>onNavigate("home")} style={{marginTop:8,fontSize:13,color:"#128C7E",fontWeight:600,background:"none",border:"none",cursor:"pointer",padding:"4px 0",display:"block"}}>View all your looks: wearify.app/looks/PS78X →</button>
      </div>,
      label:"CX-01 · Try-On Photo",
    },
    {
      type:"out", time:"3:30 PM",
      content:<div style={{padding:"10px 12px"}}>
        <p style={{fontSize:14,color:"#111",lineHeight:1.6,margin:0}}>Thank you for visiting {WEARIFY.name}, {CUSTOMER.name.split(" ")[0]}! 🙏</p>
        <p style={{fontSize:14,color:"#111",lineHeight:1.6,margin:"6px 0"}}>We hope you loved the Kanjivaram. A small tip: <em>dry clean only, store in muslin cloth, avoid direct sunlight.</em></p>
        <p style={{fontSize:14,color:"#111",lineHeight:1.6,margin:"6px 0 0"}}>Your looks are saved. See you soon! ✨</p>
        <div style={{marginTop:8,display:"flex",gap:6,borderTop:"1px solid #E8E8E8",paddingTop:8}}>
          <button style={{flex:1,padding:"8px",borderRadius:6,border:"1px solid #25D366",background:"transparent",color:"#25D366",fontSize:12,fontWeight:600,cursor:"pointer"}}>⭐ Rate Visit</button>
          <button onClick={()=>onNavigate("home")} style={{flex:1,padding:"8px",borderRadius:6,border:"1px solid #128C7E",background:"transparent",color:"#128C7E",fontSize:12,fontWeight:600,cursor:"pointer"}}>View Looks →</button>
        </div>
      </div>,
      label:"CX-02 · Post-Visit Thank You",
    },
    {
      type:"out", time:"10:15 AM",
      content:<div style={{padding:"10px 12px"}}>
        <p style={{fontSize:14,color:"#111",lineHeight:1.6,margin:"0 0 8px"}}>{CUSTOMER.name.split(" ")[0]}, Navratri is just 12 days away! 🪔 We've handpicked sarees just for you — first look is yours.</p>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
          {Object.values(CUSTOMER.newArrivals).flat().slice(0,3).map(s=>(
            <div key={s.id} style={{flexShrink:0,width:100,borderRadius:8,overflow:"hidden",border:"1px solid #E8E8E8"}}>
              <div className="silk" style={{height:80,background:`linear-gradient(148deg,${s.grad[0]},${s.grad[1]})`}}/>
              <div style={{padding:"5px 6px",background:"#fff"}}>
                <div style={{fontSize:10,fontWeight:600,color:"#111",lineHeight:1.2}}>{s.name.split(" ").slice(0,2).join(" ")}</div>
                <div style={{fontSize:10,color:"#8B6914",fontWeight:700}}>{fmt(s.price)}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>onNavigate("new")} style={{marginTop:10,width:"100%",padding:"9px",borderRadius:6,background:"#2D1B4E",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>Shop Festival Collection →</button>
      </div>,
      label:"CX-03 · Festival Campaign",
    },
  ];
  return (
    <div style={{minHeight:"100%",background:"#E5DDD5"}}>
      {/* WhatsApp chat header */}
      <div style={{background:"#075E54",padding:"12px 14px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:20}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center"}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{width:36,height:36,borderRadius:"50%",background:"#128C7E",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff",flexShrink:0}}>RS</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{WEARIFY.name}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>WhatsApp Business · Tap to view profile</div>
        </div>
        <div style={{display:"flex",gap:12,color:"rgba(255,255,255,.8)"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
      </div>
      {/* Date chip */}
      <div style={{textAlign:"center",padding:"12px 0 4px"}}>
        <span style={{background:"rgba(255,255,255,.85)",fontSize:12,color:"#555",padding:"4px 14px",borderRadius:T.rPill,boxShadow:"0 1px 3px rgba(0,0,0,.08)"}}>Today, {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long"})}</span>
      </div>
      {/* Messages */}
      <div style={{padding:"8px 10px 100px"}}>
        {messages.map((msg,i)=>(
          <div key={i} style={{marginBottom:8}}>
            {/* Label badge */}
            <div style={{textAlign:"right",marginBottom:4}}>
              <span style={{background:"rgba(45,27,78,.15)",fontSize:10,color:"#4A3558",padding:"2px 10px",borderRadius:T.rPill,fontWeight:600}}>{msg.label}</span>
            </div>
            <div style={{display:"flex",justifyContent:"flex-start"}}>
              <div className="wa-bubble-out" style={{maxWidth:"88%",borderRadius:"16px 4px 16px 16px"}}>
                {msg.content}
                <div style={{textAlign:"right",padding:"2px 10px 6px",fontSize:11,color:"#999",display:"flex",justifyContent:"flex-end",gap:4}}>
                  <span>{msg.time}</span>
                  <span style={{color:"#53BDEB"}}>✓✓</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Reply indicator */}
        <div style={{textAlign:"center",marginTop:12,marginBottom:8}}>
          <span style={{background:"rgba(255,255,255,.85)",fontSize:11,color:"#555",padding:"6px 16px",borderRadius:T.rPill}}>This is how your WhatsApp messages look 💬 Tap any link to explore the PWA →</span>
        </div>
      </div>
      {/* WA input bar */}
      <div style={{position:"sticky",bottom:0,padding:"8px 10px",background:"#F0F0F0",display:"flex",gap:8,alignItems:"center"}}>
        <div style={{flex:1,background:"#fff",borderRadius:24,padding:"9px 14px",fontSize:14,color:"#aaa",boxShadow:"0 1px 3px rgba(0,0,0,.1)"}}>Type a message</div>
        <div style={{width:42,height:42,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════════════
function AppShell() {
  const [authed, setAuthed] = useState(false);
  const [screen, setScreen] = useState("home");
  const [activeTab, setActiveTab] = useState("home");
  const [detailData, setDetailData] = useState(null);
  const [customer, setCustomer] = useState(JSON.parse(JSON.stringify(CUSTOMER)));
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState({ msg:"", visible:false });
  // Multi-store state — "ALL" = cross-store view, or specific storeId
  const [selectedStoreId, setSelectedStoreId] = useState("ALL");
  // Language — auto-detect from device, persisted
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("wearify_lang") || detectLang(); } catch(e) { return detectLang(); }
  });
  const changeLang = (l) => {
    setLang(l);
    try { localStorage.setItem("wearify_lang", l); } catch(e) {}
  };
  const handleSignOut = () => { setAuthed(false); setScreen("home"); };

  const showToast = useCallback((msg)=>{
    setToast({msg,visible:true});
    setTimeout(()=>setToast({msg:"",visible:false}),2200);
  },[]);

  const toggleFav = useCallback((look)=>{
    setCustomer(prev=>{
      const looks = prev.looks.map(l=>l.id===look.id?{...l,isFav:!l.isFav}:l);
      const isFav = looks.find(l=>l.id===look.id)?.isFav;
      showToast(isFav?"Added to favourites ❤️":"Removed from favourites");
      return {...prev, looks};
    });
  },[showToast]);

  const toggleWish = useCallback((saree)=>{
    setWishlist(prev=>{
      const has = prev.some(x=>x.id===saree.id);
      showToast(has?"Removed from wishlist":"Added to wishlist 🤍");
      return has ? prev.filter(x=>x.id!==saree.id) : [...prev,saree];
    });
  },[showToast]);

  const navigate = useCallback((scr, data=null)=>{
    if(data!==null) setDetailData(data);
    setScreen(scr);
    if(["home","looks","new","wishlist","me"].includes(scr)) setActiveTab(scr);
    window.scrollTo&&window.scrollTo(0,0);
  },[]);

  const tabChange = useCallback((tab)=>{
    setActiveTab(tab);
    setScreen(tab);
  },[]);

  // selectedStore object derived from selectedStoreId
  const selectedStore = selectedStoreId!=="ALL" && STORES[selectedStoreId]
    ? STORES[selectedStoreId]
    : Object.values(STORES)[0];

  const ctx = {
    customer, wishlist, toggleFav, toggleWish, showToast,
    selectedStoreId, setSelectedStoreId, selectedStore,
    stores: STORES, lang,
  };

  if(!authed) return (
    <div id="cust-root">
      <GlobalStyles/>
      <div className="pwa-shell">
        <AuthScreen onAuth={()=>setAuthed(true)} currentLang={lang} onLangChange={changeLang}/>
      </div>
    </div>
  );

  const showNav = !["look-detail","wa-preview","dpdp","notifs","feedback","loyalty","refer","help","store-detail","stores-list","preferences","history","tailor-orders","language"].includes(screen);

  const renderScreen = () => {
    switch(screen){
      case "home":         return <HomeScreen onNavigate={navigate} lang={lang}/>;
      case "looks":        return <MyLooksScreen onNavigate={navigate} onBack={()=>setScreen("home")}/>;
      case "look-detail":  return <LookDetailScreen look={detailData} onBack={()=>setScreen(activeTab==="looks"?"looks":"home")} onNavigate={navigate}/>;
      case "new":          return <NewArrivalsScreen onBack={()=>setScreen("home")} onNavigate={navigate}/>;
      case "wishlist":     return <WishlistScreen onBack={()=>setScreen("home")} onNavigate={navigate}/>;
      case "me":           return <MeScreen onNavigate={navigate} lang={lang} onSignOut={handleSignOut}/>;
      case "stores-list":  return <StoresListScreen onBack={()=>setScreen("me")} onNavigate={navigate} setSelectedStoreId={setSelectedStoreId}/>;
      case "store-detail": return <StoreDetailScreen onBack={()=>setScreen(["me","stores-list"].includes(activeTab)?"me":"stores-list")} selectedStoreId={selectedStoreId}/>;
      case "preferences":  return <PreferencesScreen onBack={()=>setScreen("me")} onNavigate={navigate}/>;
      case "history":      return <VisitHistoryScreen onBack={()=>setScreen("me")} onNavigate={navigate}/>;
      case "loyalty":      return <LoyaltyScreen onBack={()=>setScreen("me")} showToast={showToast}/>;
      case "refer":        return <ReferScreen onBack={()=>setScreen("me")} showToast={showToast}/>;
      case "feedback":     return <FeedbackScreen onBack={()=>setScreen("me")} showToast={showToast} onNavigate={navigate}/>;
      case "notifs":       return <NotifPrefsScreen onBack={()=>setScreen("me")} showToast={showToast}/>;
      case "dpdp":         return <DPDPScreen onBack={()=>setScreen("me")} showToast={showToast}/>;
      case "help":         return <HelpScreen onBack={()=>setScreen("me")}/>;
      case "tailor-orders": return <TailorOrdersScreen onBack={()=>setScreen("me")} showToast={showToast} lang={lang}/>;
      case "language":      return <LanguageScreen onBack={()=>setScreen("me")} currentLang={lang} onChangeLang={changeLang}/>;
      case "wa-preview":   return <WASimulator onBack={()=>setScreen("home")} onNavigate={navigate}/>;
      default:             return <HomeScreen onNavigate={navigate}/>;
    }
  };

  return (
    <AppCtx.Provider value={ctx}>
      <div id="cust-root">
        <GlobalStyles/>
        <Toast msg={toast.msg} visible={toast.visible}/>
        <div className="pwa-shell">
          <div className="screen-area">
            {renderScreen()}
          </div>
          {showNav&&<BottomNav active={activeTab} onChange={tabChange}/>}
          {screen==="home"&&(
            <button onClick={()=>navigate("wa-preview")} className="press anim-popIn"
              style={{position:"fixed",bottom:90,right:16,width:50,height:50,borderRadius:"50%",background:"#25D366",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(37,211,102,.45)",zIndex:99,animation:"whatsapp 2s ease-in-out infinite 3s"}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            </button>
          )}
        </div>
      </div>
    </AppCtx.Provider>
  );
}

export default AppShell;
