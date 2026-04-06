import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════════════
// WEARIFY TAILOR MODULE  —  Production v2.0
// Spec: Wearify_Tailor_Module_Feature_Spec.xlsx  (35 screens · TM-01→TM-10)
// Scope: Tailor-side only (supply). Customer / Retailer screens live in their own modules.
// Multi-specialty: tailors select 1-7 specialties (multi-select throughout).
// Languages: EN · HI · MR · KN · TA · TE · BN · GU · ML (9 languages, auto-detect).
// Design: "Heirloom Craft" — Plum / Gold / Saffron / Ivory — same tokens as Customer PWA.
// WhatsApp-first: every critical action also reachable via WhatsApp commands.
// ═══════════════════════════════════════════════════════════════════════

// ── Global Styles ───────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500;600&family=Noto+Sans:wght@400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{font-size:16px;-webkit-text-size-adjust:100%}
    body{font-family:"DM Sans",-apple-system,BlinkMacSystemFont,sans-serif;background:#1A0A2E;-webkit-font-smoothing:antialiased}
    .serif{font-family:"Cormorant Garamond",Georgia,serif!important}
    .mono{font-family:"DM Mono","JetBrains Mono",monospace!important}
    .noto{font-family:"Noto Sans","DM Sans",sans-serif!important}

    @keyframes fadeIn   {from{opacity:0}to{opacity:1}}
    @keyframes slideUp  {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn  {from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
    @keyframes popIn    {from{opacity:0;transform:scale(.55)}to{opacity:1;transform:scale(1)}}
    @keyframes shimmer  {0%{transform:translateX(-130%)rotate(18deg)}100%{transform:translateX(260%)rotate(18deg)}}
    @keyframes shimmerBg{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes spin     {to{transform:rotate(360deg)}}
    @keyframes float    {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes pageIn   {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes waveRing {0%{transform:scale(1);opacity:.5}100%{transform:scale(2.2);opacity:0}}
    @keyframes needle   {0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
    @keyframes dotBlink {0%,80%,100%{opacity:.2;transform:scale(.65)}40%{opacity:1;transform:scale(1)}}
    @keyframes barGrow  {from{height:0}to{height:var(--h,40px)}}
    @keyframes stitch   {0%{stroke-dashoffset:60}100%{stroke-dashoffset:0}}
    @keyframes goldPulse{0%,100%{box-shadow:0 0 0 rgba(201,148,26,0)}50%{box-shadow:0 0 20px rgba(201,148,26,.38)}}

    .anim-fadeIn  {animation:fadeIn  .38s ease both}
    .anim-slideUp {animation:slideUp .48s cubic-bezier(.22,1,.36,1) both}
    .anim-pageIn  {animation:pageIn  .42s cubic-bezier(.22,1,.36,1) both}
    .anim-scaleIn {animation:scaleIn .34s cubic-bezier(.22,1,.36,1) both}
    .anim-popIn   {animation:popIn   .28s cubic-bezier(.34,1.56,.64,1) both}
    .d1{animation-delay:.05s}.d2{animation-delay:.10s}.d3{animation-delay:.15s}
    .d4{animation-delay:.20s}.d5{animation-delay:.25s}.d6{animation-delay:.30s}
    .d7{animation-delay:.35s}.d8{animation-delay:.40s}

    .press:active   {transform:scale(.94)!important;transition:transform .08s!important}
    .press-lg:active{transform:scale(.97)!important;transition:transform .08s!important}
    .hover-lift{transition:transform .2s,box-shadow .2s}
    .hover-lift:hover{transform:translateY(-2px)}

    .silk{position:relative;overflow:hidden}
    .silk::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;
      background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.13) 50%,transparent 80%);
      animation:shimmer 5s ease-in-out infinite;pointer-events:none}

    .gold-shimmer{background:linear-gradient(90deg,#C9941A 0%,#E8C46A 38%,#fff8d0 50%,#E8C46A 62%,#C9941A 100%);
      background-size:200% auto;-webkit-background-clip:text;background-clip:text;
      -webkit-text-fill-color:transparent;animation:shimmerBg 3.5s linear infinite}

    .zari{height:1px;background:linear-gradient(90deg,transparent,rgba(201,148,26,.55) 50%,transparent)}

    .noise::before{content:'';position:absolute;inset:-50%;width:200%;height:200%;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      opacity:.03;pointer-events:none;z-index:0;border-radius:inherit}

    .weave{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='1' height='10' x='10' fill='%23C9941A' opacity='.07'/%3E%3Crect width='10' height='1' y='10' fill='%23C9941A' opacity='.07'/%3E%3C/svg%3E");background-size:20px 20px}

    ::-webkit-scrollbar{width:2px;height:2px}
    ::-webkit-scrollbar-thumb{background:rgba(201,148,26,.22);border-radius:4px}
    .no-scroll{-ms-overflow-style:none;scrollbar-width:none}
    .no-scroll::-webkit-scrollbar{display:none}
    ::selection{background:rgba(201,148,26,.22)}

    #tailor-root{min-height:100svh;display:flex;justify-content:center;align-items:flex-start;
      background:radial-gradient(ellipse at 50% 0%,#2D1B4E 0%,#0D0418 65%)}
    .pwa-shell{width:100%;max-width:430px;min-height:100svh;background:#FDF8F0;
      position:relative;overflow:hidden;display:flex;flex-direction:column}
    @media(min-width:600px){
      #tailor-root{padding:20px 0}
      .pwa-shell{min-height:calc(100svh - 40px);max-height:calc(100svh - 40px);border-radius:40px;
        box-shadow:0 32px 80px rgba(0,0,0,.65),0 0 0 8px #2D1B4E,0 0 0 10px rgba(201,148,26,.35)}}
    .screen-area{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
    input:focus,textarea:focus,select:focus{outline:none}
    button{cursor:pointer;border:none;background:none}
    .toggle-track{width:46px;height:26px;border-radius:13px;position:relative;transition:background .2s;cursor:pointer}
    .toggle-thumb{position:absolute;top:3px;width:20px;height:20px;border-radius:50%;
      background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.22);transition:left .2s}
    .typing span{display:inline-block;width:7px;height:7px;border-radius:50%;
      background:#E67E22;margin:0 2px;animation:dotBlink 1.2s ease infinite}
    .typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}
    .specialty-chip.selected{animation:goldPulse .4s ease}
  `}</style>
);

// ── Design Tokens ─────────────────────────────────────────────────────
const T = {
  plum:"#2D1B4E",plumL:"#4A2D6E",plumD:"#1A0A2E",plumXD:"#0D0418",plumGhost:"#F4EFF9",
  gold:"#C9941A",goldL:"#E8C46A",goldD:"#8B6914",goldGhost:"#FDF5E4",
  saff:"#E67E22",saffL:"#F5A55C",saffD:"#B55F10",saffGhost:"#FEF3E8",
  rose:"#C2848A",roseL:"#F0D0D4",roseD:"#8B4A52",
  teal:"#1B6B7E",tealL:"#2A9AB5",tealGhost:"#E8F6F9",
  ivory:"#FDF8F0",blush:"#FBF0F4",cream:"#F5EDE4",linen:"#EEE4D8",
  white:"#FFFFFF",
  text:"#1A0A1E",textMid:"#4A3558",textMuted:"#8B7EA0",textGhost:"#B8A8C8",
  onDark:"#FDF8F0",
  success:"#1B5E20",successBg:"#E8F5E9",
  error:"#B71C1C",errorBg:"#FFEBEE",
  amber:"#E65100",amberBg:"#FFF3E0",
  border:"#E8D5E0",borderGold:"#DFC07A",borderL:"#F2E8EE",
  shadow:"0 2px 14px rgba(45,27,78,.09)",
  shadowMd:"0 6px 24px rgba(45,27,78,.14)",
  shadowLg:"0 16px 56px rgba(45,27,78,.22)",
  shadowGold:"0 4px 20px rgba(201,148,26,.28)",
  shadowSaff:"0 4px 18px rgba(230,126,34,.25)",
  r:"16px",rSm:"10px",rMd:"12px",rLg:"24px",rPill:"100px",
  gradPlum:"linear-gradient(135deg,#2D1B4E 0%,#4A2D6E 100%)",
  gradGold:"linear-gradient(135deg,#C9941A 0%,#E8C46A 55%,#C9941A 100%)",
  gradSaff:"linear-gradient(135deg,#E67E22 0%,#F5A55C 55%,#E67E22 100%)",
  gradHero:"linear-gradient(155deg,#0D0418 0%,#1A0A2E 25%,#2D1B4E 55%,#5A2010 80%,#E67E22 100%)",
};

// ── Brand ─────────────────────────────────────────────────────────────
const WEARIFY = {
  name:"Wearify",logo:"🪷",
  company:"Phygify Technoservices Pvt. Ltd.",
  tailorTagline:"Craft. Connect. Earn.",
  disclaimer:"Wearify connects you with customers. Service, pricing and delivery are your responsibility as an independent tailor.",
};

// ── SPECIALTY OPTIONS (multi-select) ─────────────────────────────────
const SPECIALTIES = [
  {id:"silk_blouse",     label:"Silk Blouse",              icon:"🪡", desc:"Kanjivaram, Banarasi, Paithani"},
  {id:"cotton_casual",   label:"Cotton & Casual Blouse",   icon:"🧵", desc:"Cotton, Chanderi, Tant"},
  {id:"designer_emb",    label:"Designer & Embroidered",   icon:"✨", desc:"Zari, mirror work, hand embroidery"},
  {id:"bridal",          label:"Bridal Blouse",            icon:"💍", desc:"Heavy work, kundan, full bridal sets"},
  {id:"fall_pico",       label:"Fall & Pico Attachment",   icon:"📎", desc:"Saree finishing work"},
  {id:"petticoat",       label:"Petticoat Stitching",      icon:"🎀", desc:"Cotton & silk petticoats"},
  {id:"heavy_work",      label:"Heavy Embroidery Work",    icon:"🌺", desc:"Thread, sequin, aari work"},
  {id:"alteration",      label:"Alteration & Repair",      icon:"🔧", desc:"Blouse alterations, adjustments"},
  {id:"readymade",       label:"Readymade Blouse Fitting",  icon:"📐", desc:"Fitting & customisation of readymade"},
];

const CITIES = ["Varanasi","Mumbai","Delhi","Bengaluru","Chennai","Kolkata","Hyderabad","Pune","Jaipur","Ahmedabad","Surat","Kochi","Lucknow","Patna","Bhopal"];
const EXPERIENCES = ["< 1 year","1–3 years","3–7 years","7–15 years","15+ years"];
const SERVICE_RADIUS = ["Walk-in only","Up to 2 km","Up to 5 km","Home delivery available"];

// ── Mock Tailor Data (multi-specialty) ───────────────────────────────
const TAILOR_SELF = {
  id:"T001",name:"Priya Menon",initials:"PM",
  phone:"+91 98765 00001",city:"Varanasi",area:"Sigra",
  specialties:["silk_blouse","designer_emb","bridal"],   // ← ARRAY
  experience:"15 yrs",
  bio:"Specialist in silk & bridal blouses with 15 years of experience. 500+ happy customers across Varanasi.",
  badge:"pro",
  rating:4.8,reviewCount:84,leadsThisMonth:23,
  earnedThisMonth:11500,commissionOwed:700,freeReferralsUsed:5,
  available:true,subscription:"pro",
  serviceRadius:"Up to 2 km",
  services:[
    {id:"S1",name:"Silk Blouse",         priceMin:800, priceMax:3500,days:5, active:true},
    {id:"S2",name:"Cotton Blouse",       priceMin:300, priceMax:1200,days:3, active:true},
    {id:"S3",name:"Bridal Blouse",       priceMin:2500,priceMax:8000,days:10,active:true},
    {id:"S4",name:"Designer Embroidery", priceMin:1500,priceMax:6000,days:7, active:true},
    {id:"S5",name:"Fall & Pico",         priceMin:80,  priceMax:150, days:1, active:false},
  ],
  portfolio:[
    {id:"P1",grad:["#3D0A2E","#8B1D52"],tag:"Bridal Silk",   occasion:"Wedding",  style:"Embroidered Bridal"},
    {id:"P2",grad:["#0D1F3C","#1B4A72"],tag:"Banarasi Zari", occasion:"Festival", style:"Traditional Zari"},
    {id:"P3",grad:["#003D2E","#006B50"],tag:"Hand Embroidery",occasion:"Party",   style:"Modern Embroidered"},
    {id:"P4",grad:["#2D0A4E","#5A1A8B"],tag:"Designer Cut",  occasion:"Formal",  style:"Modern Crop"},
    {id:"P5",grad:["#4A1500","#8B3000"],tag:"Kundan Work",   occasion:"Bridal",  style:"Embroidered Bridal"},
    {id:"P6",grad:["#1B3D2E","#2E6B4A"],tag:"Chanderi Blouse",occasion:"Casual", style:"Modern Crop"},
    {id:"P7",grad:["#2D2A00","#6B6500"],tag:"Mirror Work",   occasion:"Festival", style:"Traditional Zari"},
    {id:"P8",grad:["#1A0A3E","#3A2070"],tag:"Heavy Brocade", occasion:"Wedding",  style:"Embroidered Bridal"},
  ],
  workingDays:{Mon:true,Tue:true,Wed:true,Thu:true,Fri:true,Sat:true,Sun:false},
  hours:{open:"10:00",close:"20:00"},
  joinDate:"Jan 2024",
};

const REFERRALS = [
  {id:"R001",date:"Today",time:"2:40 PM",status:"new",
   customer:"Priya Sharma",saree:"Kanjivaram Pure Silk",fabric:"Pure Silk",
   store:"Ramesh Silks, Varanasi",occasion:"Wedding",budget:"₹2,000–₹3,500",
   measurementsShared:true,note:"Deep V-back, full sleeves, zari border matching",
   waLink:"https://wa.me/919876512345"},
  {id:"R002",date:"Today",time:"11:15 AM",status:"contacted",
   customer:"Rekha Gupta",saree:"Banarasi Georgette",fabric:"Georgette",
   store:"Ramesh Silks, Varanasi",occasion:"Festival",budget:"₹800–₹1,200",
   measurementsShared:false,note:"Boat neck, 3/4 sleeve",
   waLink:"https://wa.me/919876598765"},
  {id:"R003",date:"Yesterday",time:"4:10 PM",status:"contacted",
   customer:"Sunita Agarwal",saree:"Paithani Silk",fabric:"Silk",
   store:"Ramesh Silks, Varanasi",occasion:"Wedding",budget:"₹1,500–₹2,500",
   measurementsShared:true,note:"Bridal blouse, heavy embroidery",
   waLink:"https://wa.me/919876500099"},
  {id:"R004",date:"Mar 20",time:"1:30 PM",status:"done",
   customer:"Kavita Singh",saree:"Chanderi Cotton Silk",fabric:"Cotton Silk",
   store:"Ramesh Silks, Varanasi",occasion:"Office",budget:"₹400–₹700",
   measurementsShared:false,note:"Simple collar, sleeveless",
   waLink:"https://wa.me/919876500088"},
  {id:"R005",date:"Mar 19",time:"3:20 PM",status:"done",
   customer:"Meena Pillai",saree:"Kanjivaram Temple Border",fabric:"Pure Silk",
   store:"Ramesh Silks, Varanasi",occasion:"Wedding",budget:"₹2,500–₹4,000",
   measurementsShared:true,note:"Full sleeves, blouse back design",
   waLink:"https://wa.me/919876500077"},
];

const ORDERS = [
  {id:"ORD001",customer:"Priya Sharma",fabricType:"Pure Silk",service:"Silk Blouse",
   price:2200,deliveryDate:"Mar 28, 2026",orderedDate:"Mar 23, 2026",
   status:"stitching",notes:"Deep V-back, zari border",referralId:"R001",daysLeft:4},
  {id:"ORD002",customer:"Rekha Gupta",fabricType:"Georgette",service:"Cotton Blouse",
   price:900,deliveryDate:"Mar 27, 2026",orderedDate:"Mar 23, 2026",
   status:"measurements",notes:"Boat neck, 3/4 sleeve",referralId:"R002",daysLeft:3},
  {id:"ORD003",customer:"Sunita Agarwal",fabricType:"Silk",service:"Bridal Blouse",
   price:3800,deliveryDate:"Apr 5, 2026",orderedDate:"Mar 22, 2026",
   status:"confirmed",notes:"Heavy embroidery, matching saree",referralId:"R003",daysLeft:12},
  {id:"ORD004",customer:"Kavita Singh",fabricType:"Cotton Silk",service:"Cotton Blouse",
   price:650,deliveryDate:"Mar 25, 2026",orderedDate:"Mar 20, 2026",
   status:"ready",notes:"Sleeveless, simple collar",referralId:"R004",daysLeft:1},
  {id:"ORD005",customer:"Meena Pillai",fabricType:"Pure Silk",service:"Silk Blouse",
   price:3100,deliveryDate:"Mar 22, 2026",orderedDate:"Mar 18, 2026",
   status:"delivered",notes:"Full sleeves, back design",referralId:"R005",daysLeft:0},
];

const REVIEWS = [
  {id:"REV001",customer:"Sunita A.",rating:5,date:"Mar 21",
   text:"Absolutely stunning work on my wedding blouse! Priya understood exactly what I wanted. Delivered 2 days early!",
   reply:null,photo:true},
  {id:"REV002",customer:"Kavita S.",rating:4,date:"Mar 18",
   text:"Very neat stitching. Slight delay but quality was excellent.",reply:"Thank you so much! Sorry for the small delay — glad you loved the result!",photo:false},
  {id:"REV003",customer:"Meena P.",rating:5,date:"Mar 15",
   text:"The Kanjivaram blouse is perfect. Priya has great taste in design suggestions!",reply:null,photo:true},
  {id:"REV004",customer:"Preeti R.",rating:4,date:"Mar 10",
   text:"Good work on the Banarasi blouse. Will come back for my next saree!",reply:null,photo:false},
];

const MONTHLY_STATS = {
  referrals:[3,5,7,2,8,6,4,9,5,6,8,11,9,7,12,10,8,14,11,9,13,8,6,10,12,9,7,11,8,5],
  thisMonth:{referrals:23,orders:18,avgValue:1850,repeatRate:32,peakDay:"Saturday",commissionOwed:700},
  lastMonth:{referrals:19,orders:15,avgValue:1720,repeatRate:28},
};

// ── i18n — 9 languages ────────────────────────────────────────────────
const LANG_META = {
  en:{label:"English",   native:"English",  },
  hi:{label:"Hindi",     native:"हिंदी",    },
  mr:{label:"Marathi",   native:"मराठी",    },
  kn:{label:"Kannada",   native:"ಕನ್ನಡ",   },
  ta:{label:"Tamil",     native:"தமிழ்",    },
  te:{label:"Telugu",    native:"తెలుగు",   },
  bn:{label:"Bengali",   native:"বাংলা",    },
  gu:{label:"Gujarati",  native:"ગુજરાતી",  },
  ml:{label:"Malayalam", native:"മലയാളം",  },
};

const STRINGS = {
  en:{
    appName:"Wearify Tailor",tagline:"Craft. Connect. Earn.",
    phone:"Mobile Number",getOTP:"Get OTP",verifyOTP:"Verify OTP",
    changeNumber:"← Change",resendIn:"Resend in",demoOTP:"Demo OTP",
    step:"Step",of:"of",register:"Join as Tailor",
    yourName:"Your Full Name",city:"City",area:"Area / Locality",
    specialties:"Your Specialties",selectMultiple:"Select all that apply",
    experience:"Years of Experience",priceRange:"Price Range",
    deliveryDays:"Delivery Days",addService:"+ Add Service",
    portfolio:"My Portfolio",uploadPhotos:"Upload Work Photos",
    atLeast4:"Minimum 4 photos needed to activate your profile",
    aiTagging:"AI auto-tags each photo",
    home:"Home",referrals:"Referrals",orders:"Orders",profile:"Profile",
    todayReferrals:"Today's Referrals",pendingOrders:"Pending Orders",
    thisMonthEarnings:"This Month",starRating:"My Rating",
    available:"Available",unavailable:"Unavailable",
    newRef:"New",contacted:"Contacted",done:"Done",all:"All",
    openWA:"Open WhatsApp",measurements:"Measurements Shared",
    occasion:"Occasion",fabric:"Fabric",budget:"Budget",store:"Store",
    customerNote:"Customer Note",preFilledMessage:"Pre-Filled Message",
    createOrder:"Create Order",agreedPrice:"Agreed Price (₹)",
    deliveryDate:"Delivery Date",specialNotes:"Special Notes",
    orderStatus:"Order Status",confirmed:"Confirmed",
    measurementsTaken:"Measurements Taken",stitching:"Stitching",
    ready:"Ready for Pickup",delivered:"Delivered",
    markAs:"Mark as",daysLeft:"days left",overdue:"Overdue",
    commission:"Commission",commissionModel:"₹50 per referral · ₹100 bridal",
    free5:"First 5 referrals free",goldTailor:"Gold Tailor rate: ₹35",
    monthlyStatement:"Monthly Statement",payNow:"Pay Commission",
    downloadPDF:"Download PDF",incomeProof:"Income Verification Letter",
    myRatings:"My Ratings",qualityScore:"Quality Score",
    avgRating:"Avg Rating",onTime:"On-Time Delivery",
    acceptRate:"Acceptance Rate",disputeRate:"Dispute Rate",
    replyToReview:"Reply to review",characterLimit:"150 char max",
    verificationStatus:"Verification Status",
    registered:"Registered",verified:"Verified",proTailor:"Pro Tailor",
    editProfile:"Edit Profile",serviceMenu:"Service Menu",
    availability:"Availability",settings:"Settings",language:"Language",
    subscription:"Subscription",privacy:"Privacy & DPDP",
    helpFAQ:"Help & FAQ",signOut:"Sign Out",
    signOutConfirm:"Are you sure you want to sign out?",
    signOutDesc:"You can sign back in anytime with your mobile number.",
    yes:"Yes, Sign Out",cancel:"Cancel",
    analytics:"My Analytics",
    waCommands:"WhatsApp Commands",
    save:"Save",saved:"Saved ✓",back:"← Back",next:"Continue →",
    finish:"Complete Registration",reviewing:"Profile Under Review",
    disclaimer:"Wearify connects you with customers. Service and pricing are your responsibility.",
    free5note:"Your first 5 referrals are commission-free. Currently used: ",
    workingDays:"Working Days",workingHours:"Working Hours",
    temporaryClose:"Temporarily Closed",resumeDate:"Resume Date",
    serviceRadius:"Service Radius",
    currentPlan:"Current Plan",upgradeTo:"Upgrade to",perMonth:"/month",
  },
  hi:{
    appName:"वियरिफाई टेलर",tagline:"सिलाई। जुड़ाव। कमाई।",
    phone:"मोबाइल नंबर",getOTP:"OTP प्राप्त करें",verifyOTP:"OTP सत्यापित करें",
    changeNumber:"← बदलें",resendIn:"फिर भेजें",demoOTP:"डेमो OTP",
    step:"चरण",of:"का",register:"दर्जी के रूप में जुड़ें",
    yourName:"पूरा नाम",city:"शहर",area:"क्षेत्र / मोहल्ला",
    specialties:"आपकी विशेषज्ञता",selectMultiple:"सभी लागू विकल्प चुनें",
    experience:"अनुभव (वर्ष)",priceRange:"मूल्य सीमा",
    deliveryDays:"डिलीवरी दिन",addService:"+ सेवा जोड़ें",
    portfolio:"मेरा पोर्टफोलियो",uploadPhotos:"काम की फोटो अपलोड करें",
    atLeast4:"प्रोफाइल सक्रिय करने के लिए कम से कम 4 फोटो चाहिए",
    aiTagging:"AI हर फोटो को टैग करता है",
    home:"होम",referrals:"लीड्स",orders:"ऑर्डर",profile:"प्रोफाइल",
    todayReferrals:"आज की लीड्स",pendingOrders:"लंबित ऑर्डर",
    thisMonthEarnings:"इस महीने",starRating:"मेरी रेटिंग",
    available:"उपलब्ध",unavailable:"अनुपलब्ध",
    newRef:"नया",contacted:"संपर्क किया",done:"पूर्ण",all:"सभी",
    openWA:"WhatsApp खोलें",measurements:"माप साझा किए",
    occasion:"अवसर",fabric:"कपड़ा",budget:"बजट",store:"स्टोर",
    customerNote:"ग्राहक की टिप्पणी",preFilledMessage:"पहले से भरा संदेश",
    createOrder:"ऑर्डर बनाएं",agreedPrice:"सहमत मूल्य (₹)",
    deliveryDate:"डिलीवरी तारीख",specialNotes:"विशेष नोट्स",
    orderStatus:"ऑर्डर स्थिति",confirmed:"पुष्टि हुई",
    measurementsTaken:"माप लिए",stitching:"सिलाई जारी",
    ready:"पिकअप के लिए तैयार",delivered:"डिलीवर हुआ",
    markAs:"इस रूप में चिह्नित करें",daysLeft:"दिन शेष",overdue:"देर हो गई",
    commission:"कमीशन",commissionModel:"₹50 प्रति लीड · ₹100 ब्राइडल",
    free5:"पहले 5 लीड मुफ्त",goldTailor:"गोल्ड दर्जी: ₹35",
    monthlyStatement:"मासिक विवरण",payNow:"कमीशन भुगतान",
    downloadPDF:"PDF डाउनलोड",incomeProof:"आय प्रमाण पत्र",
    myRatings:"मेरी रेटिंग",qualityScore:"गुणवत्ता स्कोर",
    avgRating:"औसत रेटिंग",onTime:"समय पर डिलीवरी",
    acceptRate:"स्वीकृति दर",disputeRate:"विवाद दर",
    replyToReview:"समीक्षा का जवाब",characterLimit:"150 अक्षर अधिकतम",
    verificationStatus:"सत्यापन स्थिति",
    registered:"पंजीकृत",verified:"सत्यापित",proTailor:"प्रो दर्जी",
    editProfile:"प्रोफाइल संपादित करें",serviceMenu:"सेवा मेनू",
    availability:"उपलब्धता",settings:"सेटिंग्स",language:"भाषा",
    subscription:"सदस्यता",privacy:"गोपनीयता",
    helpFAQ:"सहायता",signOut:"साइन आउट",
    signOutConfirm:"क्या आप साइन आउट करना चाहते हैं?",
    signOutDesc:"आप कभी भी अपने मोबाइल नंबर से वापस लॉग इन कर सकते हैं।",
    yes:"हाँ, साइन आउट",cancel:"रद्द",
    analytics:"मेरा विश्लेषण",
    waCommands:"WhatsApp कमांड",
    save:"सेव करें",saved:"सेव हो गया ✓",back:"← वापस",next:"जारी रखें →",
    finish:"पंजीकरण पूरा करें",reviewing:"प्रोफाइल समीक्षाधीन",
    disclaimer:"वियरिफाई आपको ग्राहकों से जोड़ता है। सेवा और मूल्य आपकी जिम्मेदारी है।",
    free5note:"आपकी पहली 5 लीड कमीशन-मुक्त हैं। अभी तक उपयोग: ",
    workingDays:"कार्य दिवस",workingHours:"कार्य समय",
    temporaryClose:"अस्थायी रूप से बंद",resumeDate:"पुनः आरंभ तिथि",
    serviceRadius:"सेवा क्षेत्र",
    currentPlan:"वर्तमान प्लान",upgradeTo:"अपग्रेड करें",perMonth:"/माह",
  },
  mr:{
    appName:"वियरिफाई शिंपी",tagline:"शिलाई. जोडा. कमवा.",
    phone:"मोबाइल नंबर",getOTP:"OTP मिळवा",verifyOTP:"OTP पडताळा",
    changeNumber:"← बदला",home:"होम",referrals:"लीड्स",orders:"ऑर्डर",profile:"प्रोफाइल",
    specialties:"तुमच्या विशेषता",selectMultiple:"सर्व लागू पर्याय निवडा",
    available:"उपलब्ध",unavailable:"अनुपलब्ध",save:"सेव करा",saved:"सेव झाले ✓",
    signOut:"साइन आउट",signOutConfirm:"तुम्हाला साइन आउट करायचे आहे का?",
    yes:"होय, साइन आउट",cancel:"रद्द",language:"भाषा",back:"← मागे",next:"पुढे →",
    step:"पाऊल",of:"पैकी",register:"शिंपी म्हणून सामील व्हा",
    yourName:"पूर्ण नाव",city:"शहर",area:"परिसर",experience:"अनुभव",
    createOrder:"ऑर्डर तयार करा",confirmed:"पुष्टी झाली",delivered:"दिले",
    ready:"पिकअपसाठी तयार",stitching:"शिलाई सुरू",commission:"कमिशन",
    myRatings:"माझी रेटिंग",verificationStatus:"सत्यापन स्थिती",
    registered:"नोंदणीकृत",verified:"सत्यापित",proTailor:"प्रो शिंपी",
    analytics:"माझे विश्लेषण",subscription:"सदस्यता",privacy:"गोपनीयता",
    helpFAQ:"मदत",disclaimer:"वियरिफाई तुम्हाला ग्राहकांशी जोडते.",
    free5note:"पहिल्या 5 लीड्स कमिशन-मुक्त आहेत. आत्तापर्यंत वापरलेल्या: ",
    currentPlan:"सध्याचा प्लान",perMonth:"/महिना",
  },
  kn:{
    appName:"ವಿಯರಿಫೈ ಟೈಲರ್",tagline:"ಹೊಲಿಗೆ. ಸಂಪರ್ಕ. ಗಳಿಕೆ.",
    phone:"ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",getOTP:"OTP ಪಡೆಯಿರಿ",verifyOTP:"OTP ಪರಿಶೀಲಿಸಿ",
    changeNumber:"← ಬದಲಿಸಿ",home:"ಹೋಮ್",referrals:"ಲೀಡ್ಸ್",orders:"ಆರ್ಡರ್",profile:"ಪ್ರೊಫೈಲ್",
    specialties:"ನಿಮ್ಮ ವಿಶೇಷತೆಗಳು",selectMultiple:"ಅಗತ್ಯವಿರುವ ಎಲ್ಲವನ್ನೂ ಆರಿಸಿ",
    available:"ಲಭ್ಯ",unavailable:"ಅಲಭ್ಯ",save:"ಸೇವ್ ಮಾಡಿ",saved:"ಸೇವ್ ಆಯಿತು ✓",
    signOut:"ಸೈನ್ ಔಟ್",signOutConfirm:"ನೀವು ಸೈನ್ ಔಟ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಾ?",
    yes:"ಹೌದು",cancel:"ರದ್ದು",language:"ಭಾಷೆ",back:"← ಹಿಂದೆ",next:"ಮುಂದೆ →",
    step:"ಹಂತ",of:"ರಲ್ಲಿ",register:"ಟೈಲರ್ ಆಗಿ ಸೇರಿ",yourName:"ಹೆಸರು",
    city:"ನಗರ",area:"ಪ್ರದೇಶ",experience:"ಅನುಭವ",commission:"ಕಮಿಷನ್",
    myRatings:"ನನ್ನ ರೇಟಿಂಗ್",verificationStatus:"ಪರಿಶೀಲನೆ",
    registered:"ನೋಂದಾಯಿಸಲಾಗಿದೆ",verified:"ಪರಿಶೀಲಿಸಲಾಗಿದೆ",proTailor:"ಪ್ರೊ ಟೈಲರ್",
    analytics:"ವಿಶ್ಲೇಷಣೆ",subscription:"ಚಂದಾದಾರಿಕೆ",privacy:"ಗೌಪ್ಯತೆ",
    helpFAQ:"ಸಹಾಯ",disclaimer:"ವಿಯರಿಫೈ ನಿಮ್ಮನ್ನು ಗ್ರಾಹಕರಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ.",
    currentPlan:"ಪ್ರಸ್ತುತ ಯೋಜನೆ",perMonth:"/ತಿಂಗಳು",
    createOrder:"ಆರ್ಡರ್ ರಚಿಸಿ",confirmed:"ದೃಢಪಡಿಸಲಾಗಿದೆ",delivered:"ಡೆಲಿವರಿ",
    ready:"ಪಿಕ್‌ಅಪ್‌ಗೆ ಸಿದ್ಧ",stitching:"ಹೊಲಿಗೆ ಜಾರಿಯಲ್ಲಿದೆ",
    free5note:"ಮೊದಲ 5 ಲೀಡ್ಸ್ ಉಚಿತ. ಬಳಸಿದ: ",
  },
  ta:{
    appName:"வியரிஃபை தையல்",tagline:"தைக்க. இணைக்க. சம்பாதிக்க.",
    phone:"மொபைல் எண்",getOTP:"OTP பெறுங்கள்",verifyOTP:"OTP சரிபாருங்கள்",
    changeNumber:"← மாற்று",home:"முகப்பு",referrals:"லீட்ஸ்",orders:"ஆர்டர்",profile:"சுயவிவரம்",
    specialties:"உங்கள் சிறப்பு",selectMultiple:"பொருந்தும் அனைத்தையும் தேர்ந்தெடுங்கள்",
    available:"கிடைக்கிறது",unavailable:"கிடைக்கவில்லை",save:"சேமி",saved:"சேமிக்கப்பட்டது ✓",
    signOut:"வெளியேறு",signOutConfirm:"வெளியேற விரும்புகிறீர்களா?",
    yes:"ஆம்",cancel:"ரத்து",language:"மொழி",back:"← பின்",next:"தொடர் →",
    step:"படி",of:"இல்",register:"தையல்காரராக சேரு",yourName:"பெயர்",
    city:"நகரம்",area:"பகுதி",experience:"அனுபவம்",commission:"கமிஷன்",
    myRatings:"என் மதிப்பீடு",verificationStatus:"சரிபார்ப்பு",
    registered:"பதிவு செய்யப்பட்டது",verified:"சரிபார்க்கப்பட்டது",proTailor:"ப்ரோ தையல்",
    analytics:"பகுப்பாய்வு",subscription:"சந்தா",privacy:"தனியுரிமை",
    helpFAQ:"உதவி",disclaimer:"வியரிஃபை உங்களை வாடிக்கையாளர்களுடன் இணைக்கிறது.",
    currentPlan:"தற்போதைய திட்டம்",perMonth:"/மாதம்",
    createOrder:"ஆர்டர் உருவாக்கு",confirmed:"உறுதிப்படுத்தப்பட்டது",
    delivered:"டெலிவரி",ready:"பிக்கப்பிற்கு தயார்",stitching:"தைக்கிறது",
    free5note:"முதல் 5 லீட்ஸ் இலவசம். பயன்படுத்தியது: ",
  },
  te:{
    appName:"వియరిఫై టైలర్",tagline:"కుట్టండి. కలుసుకోండి. సంపాదించండి.",
    phone:"మొబైల్ నంబర్",getOTP:"OTP పొందండి",verifyOTP:"OTP ధృవీకరించండి",
    changeNumber:"← మార్చు",home:"హోమ్",referrals:"లీడ్స్",orders:"ఆర్డర్",profile:"ప్రొఫైల్",
    specialties:"మీ నైపుణ్యాలు",selectMultiple:"వర్తించే అన్నీ ఎంచుకోండి",
    available:"అందుబాటులో",unavailable:"అందుబాటులో లేదు",save:"సేవ్",saved:"సేవ్ అయింది ✓",
    signOut:"సైన్ అవుట్",signOutConfirm:"మీరు సైన్ అవుట్ చేయాలనుకుంటున్నారా?",
    yes:"అవును",cancel:"రద్దు",language:"భాష",back:"← వెనుక",next:"కొనసాగించు →",
    step:"దశ",of:"లో",register:"టైలర్‌గా చేరండి",yourName:"పేరు",
    city:"నగరం",area:"ప్రాంతం",experience:"అనుభవం",commission:"కమిషన్",
    myRatings:"నా రేటింగ్",verificationStatus:"ధృవీకరణ",
    registered:"నమోదు",verified:"ధృవీకరించబడింది",proTailor:"ప్రో టైలర్",
    analytics:"విశ్లేషణ",subscription:"సభ్యత్వం",privacy:"గోప్యత",
    helpFAQ:"సహాయం",disclaimer:"వియరిఫై మీకు వినియోగదారులను కలుపుతుంది.",
    currentPlan:"ప్రస్తుత ప్లాన్",perMonth:"/నెల",
    createOrder:"ఆర్డర్ సృష్టించు",confirmed:"నిర్ధారించబడింది",
    delivered:"డెలివరీ",ready:"పికప్‌కు సిద్ధం",stitching:"కుట్టు జరుగుతోంది",
    free5note:"మొదటి 5 లీడ్స్ ఉచితం. వాడుకున్నవి: ",
  },
  bn:{
    appName:"ওয়্যারিফাই টেইলার",tagline:"সেলাই। সংযোগ। উপার্জন।",
    phone:"মোবাইল নম্বর",getOTP:"OTP পান",verifyOTP:"OTP যাচাই করুন",
    changeNumber:"← পরিবর্তন",home:"হোম",referrals:"লিডস",orders:"অর্ডার",profile:"প্রোফাইল",
    specialties:"আপনার বিশেষত্ব",selectMultiple:"সব প্রযোজ্য বিকল্প বেছে নিন",
    available:"উপলব্ধ",unavailable:"অনুপলব্ধ",save:"সেভ করুন",saved:"সেভ হয়েছে ✓",
    signOut:"সাইন আউট",signOutConfirm:"আপনি কি সাইন আউট করতে চান?",
    yes:"হ্যাঁ",cancel:"বাতিল",language:"ভাষা",back:"← ফিরে",next:"চালিয়ে যান →",
    step:"ধাপ",of:"এর",register:"টেইলার হিসেবে যোগ দিন",yourName:"পূর্ণ নাম",
    city:"শহর",area:"এলাকা",experience:"অভিজ্ঞতা",commission:"কমিশন",
    myRatings:"আমার রেটিং",verificationStatus:"যাচাইকরণ",
    registered:"নিবন্ধিত",verified:"যাচাইকৃত",proTailor:"প্রো টেইলার",
    analytics:"বিশ্লেষণ",subscription:"সদস্যতা",privacy:"গোপনীয়তা",
    helpFAQ:"সাহায্য",disclaimer:"ওয়্যারিফাই আপনাকে গ্রাহকদের সাথে সংযুক্ত করে।",
    currentPlan:"বর্তমান পরিকল্পনা",perMonth:"/মাস",
    createOrder:"অর্ডার তৈরি করুন",confirmed:"নিশ্চিত",delivered:"ডেলিভারি",
    ready:"পিকআপের জন্য প্রস্তুত",stitching:"সেলাই চলছে",
    free5note:"প্রথম ৫টি লিড বিনামূল্যে। ব্যবহৃত: ",
  },
  gu:{
    appName:"વ્યારિફાઇ ટેઇલર",tagline:"સીવો. જોડો. કમાઓ.",
    phone:"મોબાઇલ નંબર",getOTP:"OTP મેળવો",verifyOTP:"OTP ચકાસો",
    changeNumber:"← બદલો",home:"હોમ",referrals:"લીડ્સ",orders:"ઓર્ડર",profile:"પ્રોફાઇલ",
    specialties:"તમારી વિશેષતા",selectMultiple:"બધા લાગુ વિકલ્પો પસંદ કરો",
    available:"ઉપલબ્ધ",unavailable:"અનુપલબ્ધ",save:"સેવ",saved:"સેવ થઈ ✓",
    signOut:"સાઇન આઉટ",signOutConfirm:"શું તમે સાઇન આઉટ કરવા માંગો છો?",
    yes:"હા",cancel:"રદ્દ",language:"ભાષા",back:"← પાછળ",next:"આગળ →",
    step:"પગલું",of:"નું",register:"ટેઇલર તરીકે જોડાઓ",yourName:"નામ",
    city:"શહેર",area:"વિસ્તાર",experience:"અનુભવ",commission:"કમિશન",
    myRatings:"મારી રેટિંગ",verificationStatus:"ચકાસણી",
    registered:"નોંધાયેલ",verified:"ચકાસાયેલ",proTailor:"પ્રો ટેઇલર",
    analytics:"વિશ્લેષણ",subscription:"સભ્યપદ",privacy:"ગોપનીયતા",
    helpFAQ:"મદદ",disclaimer:"વ્યારિફાઇ તમને ગ્રાહકો સાથે જોડે છે.",
    currentPlan:"હાલની યોજના",perMonth:"/માસ",
    createOrder:"ઓર્ડર બનાવો",confirmed:"પુષ્ટિ",delivered:"ડિલિવરી",
    ready:"પિકઅપ માટે તૈયાર",stitching:"સિલાઈ ચાલે છે",
    free5note:"પ્રથમ 5 લીડ મફત. ઉપયોગ: ",
  },
  ml:{
    appName:"വിയരിഫൈ ടൈലർ",tagline:"തുന്നൽ. ബന്ധം. സമ്പാദ്യം.",
    phone:"മൊബൈൽ നമ്പർ",getOTP:"OTP നേടൂ",verifyOTP:"OTP സ്ഥിരീകരിക്കൂ",
    changeNumber:"← മാറ്റൂ",home:"ഹോം",referrals:"ലീഡ്സ്",orders:"ഓർഡർ",profile:"പ്രൊഫൈൽ",
    specialties:"നിങ്ങളുടെ വൈദഗ്ധ്യം",selectMultiple:"ബാധകമായ എല്ലാം തിരഞ്ഞെടുക്കൂ",
    available:"ലഭ്യം",unavailable:"ലഭ്യമല്ല",save:"സേവ് ചെയ്യൂ",saved:"സേവ് ആയി ✓",
    signOut:"സൈൻ ഔട്ട്",signOutConfirm:"സൈൻ ഔട്ട് ചെയ്യണോ?",
    yes:"അതെ",cancel:"റദ്ദാക്കൂ",language:"ഭാഷ",back:"← തിരികെ",next:"തുടരൂ →",
    step:"ഘട്ടം",of:"ലെ",register:"ടൈലർ ആയി ചേരൂ",yourName:"പേര്",
    city:"നഗരം",area:"പ്രദേശം",experience:"അനുഭവം",commission:"കമ്മീഷൻ",
    myRatings:"എന്റെ റേറ്റിംഗ്",verificationStatus:"സ്ഥിരീകരണം",
    registered:"രജിസ്റ്റർ ചെയ്തു",verified:"സ്ഥിരീകരിച്ചു",proTailor:"പ്രൊ ടൈലർ",
    analytics:"വിശകലനം",subscription:"സബ്സ്ക്രിപ്ഷൻ",privacy:"സ്വകാര്യത",
    helpFAQ:"സഹായം",disclaimer:"വിയരിഫൈ നിങ്ങളെ ഉപഭോക്താക്കളുമായി ബന്ധിപ്പിക്കുന്നു.",
    currentPlan:"നിലവിലെ പ്ലാൻ",perMonth:"/മാസം",
    createOrder:"ഓർഡർ ഉണ്ടാക്കൂ",confirmed:"സ്ഥിരീകരിച്ചു",delivered:"ഡെലിവറി",
    ready:"പിക്കപ്പിന് തയ്യാർ",stitching:"തുന്നൽ നടക്കുന്നു",
    free5note:"ആദ്യ 5 ലീഡ്സ് സൗജന്യം. ഉപയോഗിച്ചത്: ",
  },
};
const S = (key, lang="en") => {
  const l=STRINGS[lang]||{};
  return l[key]!==undefined ? l[key] : (STRINGS.en[key]||key);
};
const detectLang = () => {
  const nav=(navigator.language||"en").toLowerCase();
  const map={hi:"hi",mr:"mr",kn:"kn",ta:"ta",te:"te",bn:"bn",gu:"gu",ml:"ml"};
  for(const [code,lang] of Object.entries(map)) if(nav.startsWith(code)) return lang;
  return "en";
};

// ── Subscription Plans ────────────────────────────────────────────────
const PLANS = [
  {id:"free",name:"Free",price:0,perks:["Up to 3 referrals/month","Basic profile","4 portfolio photos","WhatsApp notifications"],limit:"3 referrals/month",color:T.textMuted},
  {id:"basic",name:"Basic",price:500,perks:["Unlimited referrals","Up to 10 portfolio photos","Verified badge eligibility","Performance insights","Priority support"],limit:"Unlimited",color:T.teal,highlight:false},
  {id:"pro",name:"Pro",price:2000,perks:["Everything in Basic","Pro badge on profile","Priority placement in search","City-level promotions","Advanced analytics","Income verification letter","₹35 reduced commission"],limit:"Unlimited + Priority",color:T.goldD,highlight:true},
];

// ── Context ───────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ── Utilities ─────────────────────────────────────────────────────────
const fmt   = n => "₹" + Number(n).toLocaleString("en-IN");
const mask  = p => p ? `${p.slice(0,8)} XXXXX` : "";
const greet = () => {const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening";};
const specialtyLabel = (id) => SPECIALTIES.find(s=>s.id===id)?.label || id;

// ═══════════════════════════════════════════════════════════════════════
// SVG ICON LIBRARY — Heirloom Craft (duotone: plum stroke + gold accent)
// ═══════════════════════════════════════════════════════════════════════
const I = {
  Needle:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M20 4L4 20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 4L16 3L14 7L20 4Z" fill={accent} stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="5" cy="19" r="2.5" stroke={color} strokeWidth="1.5"/>
      <circle cx="5" cy="19" r="1" fill={accent} opacity=".5"/>
      <path d="M14 7L10 11" stroke={accent} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Scissors:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="6" cy="6" r="3" stroke={color} strokeWidth="1.6"/>
      <circle cx="6" cy="18" r="3" stroke={color} strokeWidth="1.6"/>
      <circle cx="6" cy="6"  r="1.4" fill={accent} opacity=".35"/>
      <circle cx="6" cy="18" r="1.4" fill={accent} opacity=".35"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88" stroke={accent} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="20" y1="20" x2="8"    y2="8"     stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Thread:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9"   stroke={color} strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="9"   fill={accent} opacity=".07"/>
      <circle cx="12" cy="12" r="5"   stroke={color} strokeWidth="1.3"/>
      <circle cx="12" cy="12" r="2"   fill={accent} opacity=".4"/>
      <path d="M12 3 Q16 8 12 12 Q8 16 12 21" stroke={accent} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  Ruler:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="2" y="7" width="20" height="10" rx="2" stroke={color} strokeWidth="1.6"/>
      <rect x="2" y="7" width="20" height="10" rx="2" fill={accent} opacity=".09"/>
      {[5,8,11,14,17].map(x=>(
        <line key={x} x1={x} y1="7" x2={x} y2={x===8||x===14?10.5:9.5} stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      ))}
    </svg>
  ),
  Badge:({size=22,color=T.goldD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M12 2L14.5 7.5H20L15.5 11 17.5 17 12 13.5 6.5 17 8.5 11 4 7.5H9.5L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 2L14.5 7.5H20L15.5 11 17.5 17 12 13.5 6.5 17 8.5 11 4 7.5H9.5L12 2Z" fill={accent} opacity=".18"/>
      <polyline points="8,12 11,15 16,9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Home:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="8" rx="1" fill={accent} opacity=".25" stroke={accent} strokeWidth="1.4"/>
    </svg>
  ),
  Inbox:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <polyline points="22,12 16,12 14,15 10,15 8,12 2,12" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" fill={accent} opacity=".07"/>
    </svg>
  ),
  Orders:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="1.6"/>
      <rect x="4" y="2" width="16" height="20" rx="2" fill={accent} opacity=".06"/>
      <line x1="8" y1="8"  x2="16" y2="8"  stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="16" x2="12" y2="16" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Person:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.6"/>
      <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="7" r="2" fill={accent} opacity=".22"/>
    </svg>
  ),
  Camera:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" fill={accent} opacity=".07"/>
      <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.6"/>
      <circle cx="12" cy="13" r="2" fill={accent} opacity=".3"/>
    </svg>
  ),
  Rupee:({size=22,color=T.goldD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M6 3h12M6 8h12M15 21 9 8" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6 13h4a5 5 0 0 0 0-5H6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="9" stroke={accent} strokeWidth="1.2" opacity=".22"/>
    </svg>
  ),
  Star:({size=22,color=T.goldD,accent=T.gold,filled=false,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2Z"
        stroke={filled?accent:color} strokeWidth="1.6" strokeLinejoin="round" fill={filled?accent:"none"}/>
    </svg>
  ),
  Crown:({size=22,color=T.goldD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M3 17L6 7l6 5 6-5 3 10H3Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={accent} opacity=".18"/>
      <line x1="3" y1="20" x2="21" y2="20" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Chart:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <polyline points="22,12 18,8 13,13 9,9 2,16" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="2" y="2" width="20" height="20" rx="2" stroke={color} strokeWidth="1.5"/>
    </svg>
  ),
  WA:({size=22,color="#25D366",style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 0C5.495 0 .16 5.335.157 11.892a11.8 11.8 0 0 0 1.588 5.945L0 24l6.304-1.654a11.9 11.9 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893A11.82 11.82 0 0 0 20.397 3.48 11.82 11.82 0 0 0 12.05 0Z"/>
    </svg>
  ),
  Lock:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.6"/>
      <rect x="3" y="11" width="18" height="11" rx="2" fill={accent} opacity=".1"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1.5" fill={accent}/>
    </svg>
  ),
  Settings:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="3" stroke={accent} strokeWidth="1.6" fill={accent} opacity=".22"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke={color} strokeWidth="1.4"/>
    </svg>
  ),
  LogOut:({size=22,color=T.error,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <polyline points="16,17 21,12 16,7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  ArrowLeft:({size=20,color=T.plumD,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M19 12H5" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M12 19l-7-7 7-7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ArrowRight:({size=18,color=T.textGhost,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <polyline points="9 18 15 12 9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Check:({size=18,color=T.success,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  X:({size=18,color=T.textMuted,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Info:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="9" fill={accent} opacity=".07"/>
      <line x1="12" y1="16" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="8" r="1" fill={accent}/>
    </svg>
  ),
  Globe:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6"/>
      <path d="M12 3C9 7 9 17 12 21M12 3C15 7 15 17 12 21M3 12h18" stroke={accent} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Sparkle:({size=22,color=T.goldD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M12 2l2.09 6.26L20 9.27l-4.91 4.73L16.18 21 12 18.27 7.82 21l1.09-7L4 9.27l5.91-1.01L12 2Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={accent} opacity=".18"/>
    </svg>
  ),
  Help:({size=22,color=T.plumD,accent=T.gold,style={}})=>(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6"/>
      <circle cx="12" cy="12" r="9" fill={accent} opacity=".07"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill={accent}/>
    </svg>
  ),
};

// ═══════════════════════════════════════════════════════════════════════
// PRIMITIVE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════
function Btn({children,onClick,variant="plum",size="md",fullWidth,disabled,loading,style={},className=""}) {
  const sz={sm:{p:"8px 16px",fs:13},md:{p:"13px 22px",fs:15},lg:{p:"15px 28px",fs:16}}[size];
  const v={
    plum:   {background:T.gradPlum,   color:T.onDark, boxShadow:"0 4px 16px rgba(45,27,78,.32)"},
    gold:   {background:T.gradGold,   color:T.plumD,  boxShadow:"0 4px 16px rgba(201,148,26,.32)"},
    saff:   {background:T.gradSaff,   color:"#fff",   boxShadow:"0 4px 16px rgba(230,126,34,.32)"},
    wa:     {background:"#25D366",    color:"#fff",   boxShadow:"0 4px 16px rgba(37,211,102,.35)"},
    ivory:  {background:T.ivory,      color:T.text,   border:`1px solid ${T.border}`,boxShadow:T.shadow},
    outline:{background:"transparent",color:T.plum,   border:`1.5px solid ${T.plum}`},
    danger: {background:"linear-gradient(135deg,#B71C1C,#C62828)",color:"#fff"},
    teal:   {background:`linear-gradient(135deg,${T.teal},${T.tealL})`,color:"#fff",boxShadow:"0 4px 14px rgba(27,107,126,.28)"},
  }[variant]||{};
  return (
    <button onClick={disabled||loading?undefined:onClick} className={`press-lg ${className}`}
      style={{...v,padding:sz.p,fontSize:sz.fs,width:fullWidth?"100%":"auto",borderRadius:T.rPill,
        fontFamily:"'DM Sans',sans-serif",fontWeight:600,letterSpacing:"0.2px",
        cursor:disabled||loading?"not-allowed":"pointer",opacity:disabled?.42:1,
        display:"flex",alignItems:"center",justifyContent:"center",gap:8,
        transition:"opacity .15s,transform .1s",flexShrink:0,border:"none",...style}}>
      {loading
        ?<span style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>
        :children}
    </button>
  );
}

function Tag({children,color=T.plumL,bg,small,style={}}) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:small?"3px 9px":"4px 12px",borderRadius:T.rPill,background:bg||`${color}18`,color,fontSize:small?11:12,fontWeight:600,letterSpacing:"0.2px",whiteSpace:"nowrap",...style}}>{children}</span>;
}

function Card({children,style={},onClick,className=""}) {
  return <div onClick={onClick} className={`${onClick?"hover-lift":""} ${className}`}
    style={{background:T.white,borderRadius:T.r,boxShadow:T.shadow,border:`1px solid ${T.borderL}`,overflow:"hidden",cursor:onClick?"pointer":"default",transition:"box-shadow .2s,transform .2s",...style}}>{children}</div>;
}

function ToggleSwitch({on,onToggle,disabled}) {
  return (
    <div className="toggle-track press" onClick={disabled?undefined:onToggle}
      style={{background:on?T.gold:T.linen,border:`1.5px solid ${on?T.gold:T.border}`,cursor:disabled?"not-allowed":"pointer",flexShrink:0}}>
      <div className="toggle-thumb" style={{left:on?22:3}}/>
    </div>
  );
}

function Toast({msg,visible}) {
  if(!visible) return null;
  return <div className="anim-slideDown" style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:T.plumD,color:T.onDark,padding:"11px 22px",borderRadius:T.rPill,fontSize:13,fontWeight:500,zIndex:9999,boxShadow:T.shadowLg,whiteSpace:"nowrap",border:"1px solid rgba(201,148,26,.18)"}}>{msg}</div>;
}

function ScreenHeader({title,onBack,right,dark=false}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px 12px",
      background:dark?T.plumD:T.ivory,borderBottom:`1px solid ${dark?"rgba(201,148,26,.15)":T.borderL}`,
      position:"sticky",top:0,zIndex:20,boxShadow:"0 1px 0 rgba(201,148,26,.12)"}}>
      {onBack&&(
        <button onClick={onBack} className="press"
          style={{width:38,height:38,borderRadius:"50%",background:dark?"rgba(255,255,255,.08)":T.goldGhost,
            border:`1.5px solid ${dark?"rgba(255,255,255,.14)":T.border}`,display:"flex",alignItems:"center",
            justifyContent:"center",cursor:"pointer"}}>
          <I.ArrowLeft size={20} color={dark?T.onDark:T.plumD}/>
        </button>
      )}
      <div className="serif" style={{flex:1,fontWeight:600,fontSize:19,color:dark?T.onDark:T.plumD,fontStyle:"italic"}}>{title}</div>
      {right&&<div>{right}</div>}
    </div>
  );
}

function BadgeChip({badge,lang="en",size="md"}) {
  const cfg={
    registered:{label:S("registered",lang),color:"#6B7280",  bg:"#F3F4F6",  dot:"⬤"},
    verified:  {label:S("verified",lang),  color:T.teal,     bg:T.tealGhost,dot:"✓"},
    pro:       {label:S("proTailor",lang), color:T.goldD,    bg:T.goldGhost,dot:"★"},
  }[badge]||{label:"?",color:T.textMuted,bg:T.linen,dot:"?"};
  const sm=size==="sm";
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:sm?"3px 8px":"4px 12px",
      borderRadius:T.rPill,background:cfg.bg,color:cfg.color,fontSize:sm?10:12,
      fontWeight:700,letterSpacing:"0.3px",border:`1px solid ${cfg.color}28`}}>
      <span style={{fontSize:sm?9:11}}>{cfg.dot}</span>{cfg.label}
    </span>
  );
}

// Multi-specialty display chip
function SpecialtyChip({id,size="sm"}) {
  const sp = SPECIALTIES.find(s=>s.id===id);
  if(!sp) return null;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",
      borderRadius:T.rPill,background:T.saffGhost,color:T.saffD,fontSize:size==="sm"?11:13,
      fontWeight:600,border:`1px solid ${T.saffL}44`,whiteSpace:"nowrap"}}>
      {sp.label}
    </span>
  );
}

function PortfolioThumb({item,size=90,showTag=false}) {
  const pid=`pt-${item.id}`;
  return (
    <div className="silk press" style={{width:size,height:size*1.22,borderRadius:T.rMd,overflow:"hidden",
      flexShrink:0,position:"relative",background:`linear-gradient(148deg,${item.grad[0]},${item.grad[1]})`}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.13}} aria-hidden>
        <defs><pattern id={pid} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="6" y2="0" stroke="#fff" strokeWidth=".5"/>
          <line x1="6" y1="12" x2="12" y2="6" stroke="#fff" strokeWidth=".5"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill={`url(#${pid})`}/>
      </svg>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(13,4,24,.65) 0%,transparent 50%)"}}/>
      {showTag&&item.tag&&(
        <div style={{position:"absolute",bottom:5,left:4,right:4,fontSize:9,fontWeight:600,
          color:"rgba(253,248,240,.9)",lineHeight:1.2,textAlign:"center"}}>{item.tag}</div>
      )}
      {item.style&&showTag&&(
        <div style={{position:"absolute",top:5,right:5,background:"rgba(201,148,26,.75)",
          borderRadius:T.rPill,padding:"1px 6px",fontSize:8,fontWeight:700,color:"#fff"}}>{item.style.split(" ")[0]}</div>
      )}
    </div>
  );
}

// ── Status Config (reused across screens) ────────────────────────────
const ORDER_STATUS = {
  confirmed:   {label:"Confirmed",       icon:"🧵",color:T.plumL,  bg:T.plumGhost,step:1},
  measurements:{label:"Measurements",    icon:"📐",color:T.teal,   bg:T.tealGhost,step:2},
  stitching:   {label:"Stitching",       icon:"✂️", color:T.saff,   bg:T.saffGhost,step:3},
  ready:       {label:"Ready for Pickup",icon:"✅",color:T.success,bg:T.successBg,step:4},
  delivered:   {label:"Delivered",       icon:"📦",color:T.textMuted,bg:T.linen,   step:5},
};
const ORDER_STEPS = ["Confirmed","Measurements","Stitching","Ready","Delivered"];

// ── Bottom Navigation ─────────────────────────────────────────────────
function BottomNav({active,onChange,lang,newRefCount=0}) {
  const tabs=[
    {id:"home",      Icon:I.Home,    label:S("home",lang)},
    {id:"referrals", Icon:I.Inbox,   label:S("referrals",lang), badge:newRefCount},
    {id:"orders",    Icon:I.Orders,  label:S("orders",lang)},
    {id:"profile",   Icon:I.Person,  label:S("profile",lang)},
  ];
  return (
    <div style={{position:"sticky",bottom:0,background:"rgba(253,248,240,.97)",backdropFilter:"blur(20px)",
      borderTop:`1px solid ${T.borderL}`,display:"flex",padding:"6px 0 calc(6px + env(safe-area-inset-bottom))",
      zIndex:40,boxShadow:"0 -4px 20px rgba(45,27,78,.07)"}}>
      {tabs.map(tab=>{
        const sel=active===tab.id;
        return (
          <button key={tab.id} onClick={()=>onChange(tab.id)} className="press"
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              border:"none",background:"none",cursor:"pointer",padding:"5px 2px",
              color:sel?T.plum:T.textMuted,transition:"color .2s"}}>
            <div style={{position:"relative",transform:sel?"scale(1.15)":"scale(1)",transition:"transform .2s"}}>
              <tab.Icon size={20} color={sel?T.plum:T.textMuted}/>
              {tab.badge>0&&<div className="anim-popIn" style={{position:"absolute",top:-5,right:-7,width:16,height:16,
                borderRadius:"50%",background:T.gradSaff,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff"}}>{tab.badge}</div>}
            </div>
            <span style={{fontSize:10,fontWeight:sel?700:400}}>{tab.label}</span>
            {sel&&<div style={{width:18,height:2.5,borderRadius:2,background:T.gradGold}}/>}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREEN 1 — AUTH (Phone + OTP)
// ═══════════════════════════════════════════════════════════════════════
function AuthScreen({onComplete,lang,onLangChange}) {
  const [step,setStep]=useState("phone");
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState(["","","","","",""]);
  const [timer,setTimer]=useState(60);
  const [canResend,setCanResend]=useState(false);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const refs=useRef([]);
  const valid=phone.length===10&&/^[6-9]/.test(phone);

  useEffect(()=>{
    if(step==="otp"){
      const t=setInterval(()=>setTimer(p=>{if(p<=1){clearInterval(t);setCanResend(true);return 0;}return p-1;}),1000);
      return()=>clearInterval(t);
    }
  },[step]);

  const handleOTP=(idx,val)=>{
    if(!/^\d*$/.test(val))return;
    const n=[...otp];n[idx]=val.slice(-1);setOtp(n);setError("");
    if(val&&idx<5)refs.current[idx+1]?.focus();
    if(n.every(d=>d)){
      if(n.join("")==="123456"){setLoading(true);setTimeout(()=>onComplete(),600);}
      else{setError("Incorrect OTP.");setOtp(["","","","","",""]);setTimeout(()=>refs.current[0]?.focus(),100);}
    }
  };

  return (
    <div className="anim-pageIn" style={{minHeight:"100svh",background:T.gradHero,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 0 40px",position:"relative",overflow:"hidden"}}>
      <div className="noise weave" style={{position:"absolute",inset:0}}/>
      {/* Floating orbs */}
      {[{x:"12%",y:"18%",s:110},{x:"78%",y:"48%",s:85},{x:"45%",y:"76%",s:95}].map((o,i)=>(
        <div key={i} style={{position:"absolute",left:o.x,top:o.y,width:o.s,height:o.s,borderRadius:"50%",
          background:`radial-gradient(circle,rgba(230,126,34,.16) 0%,transparent 70%)`,
          animation:`float ${4+i}s ease-in-out infinite`,animationDelay:`${i*.7}s`,pointerEvents:"none"}}/>
      ))}
      {/* Language pills */}
      <div className="no-scroll" style={{position:"absolute",top:14,left:0,right:0,display:"flex",gap:5,justifyContent:"center",overflowX:"auto",padding:"0 12px",zIndex:10}}>
        {Object.entries(LANG_META).map(([code,meta])=>(
          <button key={code} onClick={()=>onLangChange(code)} className="press"
            style={{padding:"4px 10px",borderRadius:T.rPill,flexShrink:0,border:"none",cursor:"pointer",
              background:lang===code?"rgba(201,148,26,.28)":"rgba(253,248,240,.1)",
              color:lang===code?T.goldL:"rgba(253,248,240,.5)",
              fontSize:12,fontWeight:lang===code?700:400,
              fontFamily:"Noto Sans,DM Sans,sans-serif",transition:"all .2s"}}>
            {meta.native}
          </button>
        ))}
      </div>
      {/* Logo */}
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"68px 24px 24px"}}>
        <div style={{width:78,height:78,borderRadius:"50%",background:"rgba(230,126,34,.18)",border:"2.5px solid rgba(230,126,34,.35)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,position:"relative"}}>
          <I.Needle size={36} color={T.saffL} accent="rgba(255,255,255,.4)" style={{animation:"needle 2.5s ease-in-out infinite"}}/>
          <div style={{position:"absolute",inset:-8,borderRadius:"50%",border:"1px solid rgba(230,126,34,.13)",animation:"waveRing 3s ease-out infinite"}}/>
        </div>
        <div className="serif gold-shimmer" style={{fontSize:30,fontWeight:700,fontStyle:"italic",marginBottom:4}}>{S("appName",lang)}</div>
        <div style={{fontSize:13,color:"rgba(253,248,240,.45)",letterSpacing:"1.5px"}}>{S("tagline",lang)}</div>
      </div>
      {/* Card */}
      <div className="anim-slideUp d3" style={{position:"relative",zIndex:1,width:"100%",maxWidth:380,padding:"0 16px",flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <Card style={{padding:"28px 20px 24px",background:"rgba(253,248,240,.97)",boxShadow:T.shadowLg,border:"1px solid rgba(230,126,34,.12)"}}>
          {step==="phone"?(
            <>
              <div className="serif" style={{fontSize:22,fontWeight:600,color:T.plumD,marginBottom:4,fontStyle:"italic"}}>{S("register",lang)}</div>
              <div style={{fontSize:13,color:T.textMuted,marginBottom:20}}>{S("phone",lang)}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",borderRadius:T.rMd,border:`1.5px solid ${T.border}`,background:T.blush,marginBottom:14}}>
                <Tag color={T.plumL} style={{fontFamily:"'DM Mono',monospace",fontSize:13,flexShrink:0}}>+91</Tag>
                <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                  placeholder="10-digit mobile number" inputMode="numeric"
                  style={{flex:1,border:"none",background:"transparent",fontSize:18,fontFamily:"'DM Mono',monospace",fontWeight:600,color:T.plumD,outline:"none",letterSpacing:"1px"}}/>
              </div>
              {error&&<div className="anim-slideDown" style={{color:T.error,fontSize:12,marginBottom:10}}>{error}</div>}
              <Btn fullWidth variant="saff" size="lg" disabled={!valid} onClick={()=>{setStep("otp");setTimer(60);setCanResend(false);}}>
                {S("getOTP",lang)} →
              </Btn>
              <div style={{textAlign:"center",marginTop:14,padding:"7px 12px",background:T.goldGhost,borderRadius:T.rMd}}>
                <span style={{fontSize:12,color:T.goldD}}>{S("demoOTP",lang)}: <strong>123456</strong></span>
              </div>
            </>
          ):(
            <>
              <div className="serif" style={{fontSize:22,fontWeight:600,color:T.plumD,marginBottom:4,fontStyle:"italic"}}>{S("verifyOTP",lang)}</div>
              <div style={{fontSize:13,color:T.textMuted,marginBottom:20}}>+91 {phone.slice(0,5)} XXXXX</div>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
                {otp.map((d,i)=>(
                  <input key={i} ref={el=>refs.current[i]=el} value={d}
                    onChange={e=>handleOTP(i,e.target.value)} inputMode="numeric" maxLength={1}
                    style={{width:44,height:54,textAlign:"center",borderRadius:T.rMd,
                      border:`2px solid ${d?T.saff:T.border}`,fontFamily:"'DM Mono',monospace",
                      fontSize:22,fontWeight:700,color:T.plumD,outline:"none",background:T.white,
                      boxShadow:d?`0 0 0 3px ${T.saff}22`:"none",transition:"border-color .2s"}}/>
                ))}
              </div>
              {loading&&<div style={{display:"flex",justifyContent:"center",marginBottom:12}}><span className="typing"><span/><span/><span/></span></div>}
              {error&&<div className="anim-slideDown" style={{color:T.error,fontSize:12,marginBottom:10,textAlign:"center"}}>{error}</div>}
              <div style={{textAlign:"center",fontSize:13,color:T.textMuted,marginBottom:14}}>
                {canResend
                  ?<button onClick={()=>{setTimer(60);setCanResend(false);setOtp(["","","","","",""]);}} style={{background:"none",border:"none",color:T.saff,fontWeight:600,cursor:"pointer",fontSize:13}}>Resend OTP</button>
                  :<>{S("resendIn",lang)} <strong style={{color:T.saff}}>{timer}s</strong></>}
              </div>
              <button onClick={()=>setStep("phone")} style={{background:"none",border:"none",color:T.textMuted,fontSize:13,cursor:"pointer",width:"100%",textAlign:"center"}}>{S("changeNumber",lang)}</button>
            </>
          )}
        </Card>
        <div style={{textAlign:"center",marginTop:14,color:"rgba(253,248,240,.22)",fontSize:11,letterSpacing:"0.6px"}}>WEARIFY · {WEARIFY.company}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SCREENS 2-5 — ONBOARDING WIZARD (4 steps + complete)
// ═══════════════════════════════════════════════════════════════════════
function WizardStep1({data,update,onNext,lang}) {
  const canNext = data.name.trim() && data.city && data.area.trim() && data.dpdpConsent;
  return (
    <div className="anim-pageIn">
      <div className="serif" style={{fontSize:22,fontWeight:600,color:T.plumD,fontStyle:"italic",marginBottom:4}}>About You</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:22}}>Basic details to create your tailor profile</div>
      {/* Name */}
      <div style={{marginBottom:16}}>
        <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("yourName",lang)}</label>
        <input value={data.name} onChange={e=>update("name",e.target.value)} placeholder="e.g. Priya Menon"
          style={{width:"100%",padding:"13px 14px",borderRadius:T.rMd,border:`1.5px solid ${data.name?T.saff:T.border}`,
            fontSize:16,fontFamily:"'DM Sans',sans-serif",color:T.plumD,outline:"none",background:T.white,transition:"border-color .2s"}}
          onFocus={e=>e.target.style.borderColor=T.saff} onBlur={e=>e.target.style.borderColor=data.name?T.saff:T.border}/>
      </div>
      {/* City */}
      <div style={{marginBottom:16}}>
        <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("city",lang)}</label>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {CITIES.map(c=>(
            <button key={c} onClick={()=>update("city",c)} className="press"
              style={{padding:"8px 14px",borderRadius:T.rPill,background:data.city===c?T.gradSaff:T.white,
                color:data.city===c?"#fff":T.textMid,border:`1.5px solid ${data.city===c?T.saff:T.border}`,
                fontSize:13,fontWeight:data.city===c?700:400,cursor:"pointer",transition:"all .2s"}}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {/* Area */}
      <div style={{marginBottom:20}}>
        <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("area",lang)}</label>
        <input value={data.area} onChange={e=>update("area",e.target.value)} placeholder="e.g. Sigra, Vishwanath Gali, Bandra West"
          style={{width:"100%",padding:"13px 14px",borderRadius:T.rMd,border:`1.5px solid ${data.area?T.saff:T.border}`,
            fontSize:15,fontFamily:"'DM Sans',sans-serif",color:T.plumD,outline:"none",background:T.white,transition:"border-color .2s"}}
          onFocus={e=>e.target.style.borderColor=T.saff} onBlur={e=>e.target.style.borderColor=data.area?T.saff:T.border}/>
      </div>
      {/* DPDP Consent — required before data collected per spec TM-01-01 */}
      <button onClick={()=>update("dpdpConsent",!data.dpdpConsent)} className="press"
        style={{display:"flex",gap:10,alignItems:"flex-start",background:"none",border:"none",cursor:"pointer",textAlign:"left",width:"100%",marginBottom:22,padding:"10px 12px",borderRadius:T.rMd,background:data.dpdpConsent?T.saffGhost:"transparent",border:`1px solid ${data.dpdpConsent?T.saffL:T.borderL}`,transition:"all .2s"}}>
        <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${data.dpdpConsent?T.saff:T.border}`,
          background:data.dpdpConsent?T.saffGhost:T.white,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all .15s"}}>
          {data.dpdpConsent&&<I.Check size={13} color={T.saff}/>}
        </div>
        <span style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>
          I agree to Wearify collecting my name, contact, and service information to create my tailor profile and connect me with customers. <span style={{color:T.saff,fontWeight:600}}>DPDP Act 2023 compliant.</span>
        </span>
      </button>
      <Btn fullWidth variant="saff" size="lg" disabled={!canNext} onClick={onNext}>
        {S("next",lang)}
      </Btn>
    </div>
  );
}

function WizardStep2({data,update,onNext,onBack,lang}) {
  const toggleSpecialty = (id) => {
    const current = data.specialties||[];
    const next = current.includes(id) ? current.filter(s=>s!==id) : [...current,id];
    update("specialties",next);
  };
  const canNext = (data.specialties||[]).length > 0 && data.experience;
  return (
    <div className="anim-pageIn">
      <div className="serif" style={{fontSize:22,fontWeight:600,color:T.plumD,fontStyle:"italic",marginBottom:4}}>Your Specialties</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:6}}>{S("specialties",lang)}</div>
      <div style={{padding:"7px 12px",background:T.goldGhost,borderRadius:T.rMd,border:`1px solid ${T.borderGold}`,marginBottom:18,display:"flex",gap:6,alignItems:"center"}}>
        <I.Info size={14} color={T.goldD} accent={T.gold}/>
        <span style={{fontSize:12,color:T.goldD,fontWeight:500}}>{S("selectMultiple",lang)} — choose all that apply</span>
      </div>
      {/* Multi-select specialty grid */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {SPECIALTIES.map(sp=>{
          const selected=(data.specialties||[]).includes(sp.id);
          return (
            <button key={sp.id} onClick={()=>toggleSpecialty(sp.id)} className={`press specialty-chip${selected?" selected":""}`}
              style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:T.rMd,
                background:selected?"linear-gradient(135deg,#fff,#FEF3E8)":T.white,
                border:`2px solid ${selected?T.saff:T.borderL}`,cursor:"pointer",textAlign:"left",
                transition:"all .2s",boxShadow:selected?T.shadowSaff:T.shadow}}>
              <div style={{width:36,height:36,borderRadius:T.rSm,background:selected?T.gradSaff:T.linen,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,transition:"background .2s"}}>
                {sp.icon}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:selected?700:500,fontSize:14,color:selected?T.saffD:T.textMid,transition:"color .2s"}}>{sp.label}</div>
                <div style={{fontSize:11,color:T.textGhost,marginTop:1}}>{sp.desc}</div>
              </div>
              {selected&&<I.Check size={18} color={T.saff}/>}
            </button>
          );
        })}
      </div>
      {/* Selected summary */}
      {(data.specialties||[]).length>0&&(
        <div className="anim-slideDown" style={{padding:"10px 12px",background:T.saffGhost,borderRadius:T.rMd,border:`1px solid ${T.saffL}44`,marginBottom:16}}>
          <div style={{fontSize:11,color:T.saffD,fontWeight:600,marginBottom:6}}>Selected ({(data.specialties||[]).length}):</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {(data.specialties||[]).map(id=><SpecialtyChip key={id} id={id}/>)}
          </div>
        </div>
      )}
      {/* Experience */}
      <div style={{marginBottom:24}}>
        <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("experience",lang)}</label>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {EXPERIENCES.map(e=>(
            <button key={e} onClick={()=>update("experience",e)} className="press"
              style={{padding:"8px 14px",borderRadius:T.rPill,background:data.experience===e?T.gradSaff:T.white,
                color:data.experience===e?"#fff":T.textMid,border:`1.5px solid ${data.experience===e?T.saff:T.border}`,
                fontSize:13,fontWeight:data.experience===e?700:400,cursor:"pointer"}}>
              {e}
            </button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn variant="ivory" size="lg" style={{flex:1}} onClick={onBack}>{S("back",lang)}</Btn>
        <Btn variant="saff"  size="lg" style={{flex:2}} disabled={!canNext} onClick={onNext}>{S("next",lang)}</Btn>
      </div>
    </div>
  );
}

function WizardStep3({data,update,onNext,onBack,lang}) {
  const [services,setServices]=useState(data.services||[{id:"s1",name:"",priceMin:"",priceMax:"",days:"",active:true}]);
  const [showSmartPrice,setShowSmartPrice]=useState(false);
  const updateSvc=(idx,field,val)=>{
    const next=[...services];next[idx]={...next[idx],[field]:val};
    setServices(next);update("services",next);
  };
  const addSvc=()=>{const next=[...services,{id:`s${Date.now()}`,name:"",priceMin:"",priceMax:"",days:"",active:true}];setServices(next);update("services",next);};
  const removeSvc=(idx)=>{const next=services.filter((_,i)=>i!==idx);setServices(next);update("services",next);};
  const canNext=services.some(s=>s.name&&s.priceMin&&s.priceMax);
  const serviceRadius=data.serviceRadius||SERVICE_RADIUS[0];

  return (
    <div className="anim-pageIn">
      <div className="serif" style={{fontSize:22,fontWeight:600,color:T.plumD,fontStyle:"italic",marginBottom:4}}>Services & Location</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:22}}>Set your price ranges and service area</div>

      {/* Service Menu */}
      <div style={{marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <label style={{fontSize:12,fontWeight:600,color:T.textMid,textTransform:"uppercase",letterSpacing:"0.4px"}}>Service Menu</label>
        <button onClick={()=>setShowSmartPrice(!showSmartPrice)}
          style={{background:"none",border:"none",fontSize:11,color:T.teal,fontWeight:600,cursor:"pointer"}}>
          💡 Smart Price Suggestion
        </button>
      </div>
      {showSmartPrice&&(
        <div className="anim-slideDown" style={{padding:"10px 12px",background:T.tealGhost,borderRadius:T.rMd,border:`1px solid ${T.teal}28`,marginBottom:12,fontSize:12,color:T.teal,lineHeight:1.6}}>
          <strong>Market averages in Varanasi:</strong><br/>
          Silk blouse: ₹800–₹2,500 · Cotton: ₹300–₹800 · Bridal: ₹2,000–₹6,000 · Embroidery: ₹1,200–₹5,000
        </div>
      )}
      {services.map((svc,i)=>(
        <div key={svc.id} style={{marginBottom:12,padding:"12px 14px",background:T.white,borderRadius:T.r,border:`1px solid ${T.borderL}`,boxShadow:T.shadow}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <input value={svc.name} onChange={e=>updateSvc(i,"name",e.target.value)} placeholder="Service name (e.g. Silk Blouse)"
              style={{flex:1,padding:"9px 12px",borderRadius:T.rSm,border:`1.5px solid ${svc.name?T.saff:T.border}`,
                fontSize:14,fontFamily:"'DM Sans',sans-serif",color:T.plumD,outline:"none",background:T.ivory}}
              onFocus={e=>e.target.style.borderColor=T.saff} onBlur={e=>e.target.style.borderColor=svc.name?T.saff:T.border}/>
            {services.length>1&&(
              <button onClick={()=>removeSvc(i)} className="press" style={{width:30,height:30,borderRadius:"50%",background:T.errorBg,border:`1px solid ${T.error}22`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                <I.X size={14} color={T.error}/>
              </button>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div>
              <div style={{fontSize:10,color:T.textGhost,marginBottom:4}}>MIN PRICE ₹</div>
              <input value={svc.priceMin} onChange={e=>updateSvc(i,"priceMin",e.target.value.replace(/\D/g,""))} placeholder="300" inputMode="numeric"
                style={{width:"100%",padding:"8px 10px",borderRadius:T.rSm,border:`1px solid ${T.border}`,fontSize:14,fontFamily:"'DM Mono',monospace",color:T.plumD,outline:"none"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:T.textGhost,marginBottom:4}}>MAX PRICE ₹</div>
              <input value={svc.priceMax} onChange={e=>updateSvc(i,"priceMax",e.target.value.replace(/\D/g,""))} placeholder="3000" inputMode="numeric"
                style={{width:"100%",padding:"8px 10px",borderRadius:T.rSm,border:`1px solid ${T.border}`,fontSize:14,fontFamily:"'DM Mono',monospace",color:T.plumD,outline:"none"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:T.textGhost,marginBottom:4}}>DAYS</div>
              <input value={svc.days} onChange={e=>updateSvc(i,"days",e.target.value.replace(/\D/g,""))} placeholder="5" inputMode="numeric"
                style={{width:"100%",padding:"8px 10px",borderRadius:T.rSm,border:`1px solid ${T.border}`,fontSize:14,fontFamily:"'DM Mono',monospace",color:T.plumD,outline:"none"}}/>
            </div>
          </div>
        </div>
      ))}
      <button onClick={addSvc} style={{background:"none",border:`1.5px dashed ${T.saff}`,borderRadius:T.rMd,padding:"10px",width:"100%",color:T.saff,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        + {S("addService",lang)}
      </button>
      <div style={{fontSize:11,color:T.textGhost,marginBottom:20,textAlign:"center"}}>Prices shown to customers as estimates only — final price agreed directly.</div>

      {/* Service radius */}
      <div style={{marginBottom:24}}>
        <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("serviceRadius",lang)}</label>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {SERVICE_RADIUS.map(r=>(
            <button key={r} onClick={()=>update("serviceRadius",r)} className="press"
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:T.rMd,
                background:serviceRadius===r?"linear-gradient(135deg,#fff,#FEF3E8)":T.white,
                border:`1.5px solid ${serviceRadius===r?T.saff:T.borderL}`,cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${serviceRadius===r?T.saff:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {serviceRadius===r&&<div style={{width:10,height:10,borderRadius:"50%",background:T.saff}}/>}
              </div>
              <span style={{fontSize:13,fontWeight:serviceRadius===r?600:400,color:serviceRadius===r?T.saffD:T.textMid}}>{r}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn variant="ivory" size="lg" style={{flex:1}} onClick={onBack}>{S("back",lang)}</Btn>
        <Btn variant="saff"  size="lg" style={{flex:2}} disabled={!canNext} onClick={onNext}>{S("next",lang)}</Btn>
      </div>
    </div>
  );
}

function WizardStep4({data,update,onFinish,onBack,lang,saving}) {
  const [count,setCount]=useState(data.portfolioCount||0);
  const upd=(n)=>{setCount(n);update("portfolioCount",n);};
  const canFinish=count>=4;
  const styleGroups=["Traditional Zari","Modern Crop","Embroidered Bridal","Casual Everyday"];
  const grads=[["#3D0A2E","#8B1D52"],["#0D1F3C","#1B4A72"],["#003D2E","#006B50"],["#2D0A4E","#5A1A8B"],["#4A1500","#8B3000"],["#1B3D2E","#2E6B4A"],["#2D2A00","#6B6500"],["#1A0A3E","#3A2070"]];
  const tags=["Bridal Silk","Banarasi Zari","Hand Embroidery","Designer Cut","Kundan Work","Chanderi Blouse","Mirror Work","Heavy Brocade"];

  return (
    <div className="anim-pageIn">
      <div className="serif" style={{fontSize:22,fontWeight:600,color:T.plumD,fontStyle:"italic",marginBottom:4}}>{S("portfolio",lang)}</div>
      <div style={{fontSize:13,color:T.textMuted,marginBottom:8}}>{S("atLeast4",lang)}</div>
      {/* Progress */}
      <div style={{padding:"10px 14px",background:count>=4?T.successBg:T.goldGhost,borderRadius:T.rMd,
        border:`1px solid ${count>=4?T.success:T.borderGold}`,marginBottom:16,display:"flex",gap:8,alignItems:"center"}}>
        {count>=4?<I.Check size={16} color={T.success}/>:<I.Camera size={16} color={T.goldD} accent={T.gold}/>}
        <span style={{fontSize:13,color:count>=4?T.success:T.goldD,fontWeight:600}}>
          {count} photo{count!==1?"s":""} added {count>=4?"— Ready to activate!":"— need at least 4"}
        </span>
      </div>
      {/* Photo grid simulation */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
        {Array.from({length:8}).map((_,i)=>{
          const filled=i<count;
          return (
            <div key={i} onClick={()=>{if(!filled&&count===i)upd(i+1);}}
              style={{aspectRatio:"3/4",borderRadius:T.rSm,cursor:!filled&&count===i?"pointer":"default",
                background:filled?`linear-gradient(148deg,${grads[i][0]},${grads[i][1]})`:T.linen,
                border:`2px dashed ${filled?T.saff:T.borderL}`,display:"flex",alignItems:"center",
                justifyContent:"center",position:"relative",overflow:"hidden",transition:"all .2s"}}>
              {filled?(
                <>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(13,4,24,.5),transparent)"}}/>
                  <div style={{position:"absolute",bottom:4,left:3,right:3,fontSize:7,fontWeight:600,color:"rgba(253,248,240,.85)",textAlign:"center",lineHeight:1.2}}>{tags[i]}</div>
                  <div style={{position:"absolute",top:4,right:4,width:16,height:16,borderRadius:"50%",background:"rgba(255,255,255,.9)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <I.Check size={9} color={T.success}/>
                  </div>
                </>
              ):(
                <I.Camera size={i===count?20:15} color={i===count?T.saff:T.borderL} accent={T.gold}/>
              )}
            </div>
          );
        })}
      </div>
      {/* AI tagging note */}
      <div style={{padding:"10px 12px",background:T.saffGhost,borderRadius:T.rMd,border:`1px solid ${T.saffL}44`,marginBottom:12,display:"flex",gap:8}}>
        <I.Sparkle size={16} color={T.saffD} accent={T.saff} style={{flexShrink:0,marginTop:1}}/>
        <div style={{fontSize:12,color:T.saffD,lineHeight:1.6}}><strong>{S("aiTagging",lang)}:</strong> fabric type, neckline, sleeve style, embroidery — no manual tagging needed. Photos are grouped into style clusters automatically.</div>
      </div>
      {/* Style clusters preview */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:8}}>Auto-created style clusters:</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {styleGroups.map(g=><Tag key={g} color={T.plumL} style={{fontSize:11}}>{g}</Tag>)}
        </div>
      </div>
      <div style={{padding:"9px 12px",background:T.plumGhost,borderRadius:T.rMd,marginBottom:20,fontSize:11,color:T.textMid,lineHeight:1.6}}>
        💡 Tailors with 8+ photos get <strong>3× more referrals</strong>. You can add more photos anytime after registration.
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn variant="ivory" size="lg" style={{flex:1}} onClick={onBack}>{S("back",lang)}</Btn>
        <Btn variant="saff"  size="lg" style={{flex:2}} disabled={!canFinish} loading={saving} onClick={onFinish}>
          {S("finish",lang)}
        </Btn>
      </div>
    </div>
  );
}

function RegistrationCompleteScreen({onGoToDashboard,lang}) {
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
      {/* Animated check */}
      <div style={{width:88,height:88,borderRadius:"50%",background:`linear-gradient(135deg,${T.saff},${T.saffL})`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:22,boxShadow:T.shadowSaff,animation:"waveRing 0s"}}>
        <I.Check size={40} color="#fff"/>
      </div>
      <div className="serif gold-shimmer" style={{fontSize:26,fontWeight:700,fontStyle:"italic",marginBottom:8,textAlign:"center"}}>Registration Complete!</div>
      <div style={{fontSize:14,color:T.textMuted,textAlign:"center",lineHeight:1.7,marginBottom:20,maxWidth:300}}>
        Your profile is now under review. Wearify will verify your portfolio within <strong>48 hours</strong>.
      </div>
      {/* Status steps */}
      <div style={{width:"100%",maxWidth:320,marginBottom:28}}>
        {[
          {icon:"✅",label:"Phone OTP verified",done:true},
          {icon:"✅",label:"Profile created",done:true},
          {icon:"⏳",label:"Portfolio review (48 hrs)",done:false},
          {icon:"🔵",label:"Verified badge earned",done:false},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 0",borderBottom:i<3?`1px solid ${T.borderL}`:"none"}}>
            <span style={{fontSize:18,flexShrink:0}}>{s.icon}</span>
            <span style={{fontSize:13,color:s.done?T.text:T.textMuted,fontWeight:s.done?600:400}}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{padding:"12px 16px",background:T.goldGhost,borderRadius:T.rMd,border:`1px solid ${T.borderGold}`,marginBottom:24,textAlign:"center",maxWidth:320,width:"100%"}}>
        <div style={{fontWeight:600,fontSize:13,color:T.goldD,marginBottom:4}}>
          <I.WA size={14} color={T.goldD} style={{display:"inline",marginRight:5}}/>
          WhatsApp Confirmation Sent
        </div>
        <div style={{fontSize:12,color:T.textMid}}>We've sent your registration details to your WhatsApp. You can manage everything from there too.</div>
      </div>
      <Btn fullWidth variant="saff" size="lg" onClick={onGoToDashboard} style={{maxWidth:320}}>
        Go to My Dashboard →
      </Btn>
    </div>
  );
}

function OnboardingWizard({onComplete,lang}) {
  const [step,setStep]=useState(1);
  const [saving,setSaving]=useState(false);
  const TOTAL=4;
  const [data,setData]=useState({
    name:"",city:"",area:"",dpdpConsent:false,
    specialties:[],               // ← multi-specialty array
    experience:"",
    services:[],serviceRadius:SERVICE_RADIUS[0],
    portfolioCount:0,
  });
  const update=(k,v)=>setData(d=>({...d,[k]:v}));
  const next=()=>setStep(s=>s+1);
  const back=()=>setStep(s=>s-1);
  const finish=()=>{setSaving(true);setTimeout(()=>onComplete(),1400);};

  return (
    <div className="anim-pageIn" style={{minHeight:"100svh",background:T.ivory,display:"flex",flexDirection:"column"}}>
      {/* Progress header */}
      <div className="noise weave" style={{background:T.gradHero,padding:"18px 18px 16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <I.Scissors size={18} color={T.saffL} accent="rgba(255,255,255,.4)"/>
            <span className="serif" style={{fontSize:15,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>{S("appName",lang)}</span>
            <div style={{marginLeft:"auto",fontSize:11,color:"rgba(253,248,240,.5)"}}>{S("step",lang)} {step} {S("of",lang)} {TOTAL}</div>
          </div>
          <div style={{display:"flex",gap:5}}>
            {Array.from({length:TOTAL}).map((_,i)=>(
              <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<step?T.saff:"rgba(253,248,240,.2)",transition:"background .3s"}}/>
            ))}
          </div>
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{flex:1,overflowY:"auto",padding:"24px 18px 100px"}}>
        {step===1&&<WizardStep1 data={data} update={update} onNext={next} lang={lang}/>}
        {step===2&&<WizardStep2 data={data} update={update} onNext={next} onBack={back} lang={lang}/>}
        {step===3&&<WizardStep3 data={data} update={update} onNext={next} onBack={back} lang={lang}/>}
        {step===4&&<WizardStep4 data={data} update={update} onFinish={finish} onBack={back} lang={lang} saving={saving}/>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HOME DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
function HomeScreen({onNavigate,lang}) {
  const {showToast}=useApp();
  const [available,setAvailable]=useState(TAILOR_SELF.available);
  const newRefs=REFERRALS.filter(r=>r.status==="new").length;
  const pendingOrders=ORDERS.filter(o=>o.status!=="delivered").length;
  const tailor=TAILOR_SELF;

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      {/* Hero */}
      <div className="noise weave" style={{background:T.gradHero,padding:"24px 18px 22px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:"rgba(230,126,34,.22)",border:"2px solid rgba(230,126,34,.35)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:T.saffL}}>{tailor.initials}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"rgba(253,248,240,.42)"}}>{greet()}</div>
              <div className="serif" style={{fontSize:18,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>{tailor.name}</div>
            </div>
            <BadgeChip badge={tailor.badge} lang={lang}/>
          </div>
          {/* Multi-specialty row */}
          <div className="no-scroll" style={{display:"flex",gap:5,overflowX:"auto",marginBottom:12}}>
            {tailor.specialties.map(id=>(
              <span key={id} style={{padding:"3px 10px",borderRadius:T.rPill,background:"rgba(230,126,34,.18)",border:"1px solid rgba(230,126,34,.28)",fontSize:11,fontWeight:600,color:T.saffL,whiteSpace:"nowrap",flexShrink:0}}>
                {specialtyLabel(id)}
              </span>
            ))}
          </div>
          {/* Availability toggle */}
          <div onClick={()=>{setAvailable(a=>!a);showToast(available?"Status: Unavailable":"Status: Available!");}}
            style={{display:"inline-flex",alignItems:"center",gap:8,padding:"7px 14px",borderRadius:T.rPill,cursor:"pointer",
              background:available?"rgba(27,94,32,.3)":"rgba(230,126,34,.2)",border:`1px solid ${available?"rgba(129,199,132,.35)":"rgba(230,126,34,.3)"}`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:available?"#81C784":T.saffL}}/>
            <span style={{fontSize:13,color:available?"#A5D6A7":T.saffL,fontWeight:600}}>
              {available?S("available",lang):S("unavailable",lang)}
            </span>
            <ToggleSwitch on={available} onToggle={()=>{}}/>
          </div>
        </div>
      </div>
      <div className="zari"/>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",background:T.white,borderBottom:`1px solid ${T.borderL}`}}>
        {[
          {Icon:I.Inbox,  v:newRefs,    l:S("todayReferrals",lang),col:T.saffD, sub:"new"},
          {Icon:I.Rupee,  v:fmt(tailor.earnedThisMonth), l:S("thisMonthEarnings",lang),col:T.goldD},
          {Icon:I.Star,   v:tailor.rating, l:S("starRating",lang),col:T.goldD},
        ].map(({Icon,v,l,col},i)=>(
          <div key={i} style={{padding:"12px 6px",textAlign:"center",borderRight:i<2?`1px solid ${T.borderL}`:undefined}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:3}}><Icon size={17} color={col} accent={T.gold}/></div>
            <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:16,color:T.plumD}}>{v}</div>
            <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>

      <div className="no-scroll" style={{overflowY:"auto",padding:"14px 14px 96px"}}>
        {/* New referral alert */}
        {newRefs>0&&(
          <div onClick={()=>onNavigate("referrals")} className="press silk anim-slideUp"
            style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",
              background:T.gradSaff,borderRadius:T.r,marginBottom:14,cursor:"pointer",boxShadow:T.shadowSaff}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <I.Inbox size={20} color="#fff"/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:"#fff",fontSize:15}}>{newRefs} New Referral{newRefs>1?"s":""} Waiting!</div>
              <div style={{color:"rgba(255,255,255,.75)",fontSize:12,marginTop:1}}>Tap to view and connect on WhatsApp</div>
            </div>
            <I.ArrowRight size={20} color="rgba(255,255,255,.7)"/>
          </div>
        )}

        {/* Pending orders */}
        {pendingOrders>0&&(
          <div onClick={()=>onNavigate("orders")} className="press"
            style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
              background:T.white,borderRadius:T.r,border:`1px solid ${T.borderGold}`,marginBottom:14,cursor:"pointer",boxShadow:T.shadow}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:T.goldGhost,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <I.Orders size={18} color={T.goldD} accent={T.gold}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,color:T.text,fontSize:14}}>{pendingOrders} Pending Order{pendingOrders>1?"s":""}</div>
              <div style={{color:T.textMuted,fontSize:12,marginTop:1}}>
                {ORDERS.filter(o=>o.status==="ready").length} ready for pickup · {ORDERS.filter(o=>o.daysLeft<=1&&o.status!=="delivered").length} due soon
              </div>
            </div>
            <I.ArrowRight size={18} color={T.textGhost}/>
          </div>
        )}

        {/* Commission free slots */}
        {tailor.freeReferralsUsed<5&&(
          <div style={{padding:"12px 14px",background:`linear-gradient(135deg,${T.saffGhost},${T.goldGhost})`,borderRadius:T.r,border:`1px solid ${T.borderGold}`,marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
            <I.Sparkle size={20} color={T.goldD} accent={T.gold}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13,color:T.goldD}}>Free Referrals Remaining: {5-tailor.freeReferralsUsed}</div>
              <div style={{fontSize:11,color:T.textMid,marginTop:1}}>First 5 referrals are commission-free. Used: {tailor.freeReferralsUsed}/5</div>
            </div>
          </div>
        )}

        {/* Recent referrals */}
        <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
          <div className="serif" style={{flex:1,fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic"}}>Recent Referrals</div>
          <button onClick={()=>onNavigate("referrals")} style={{background:"none",border:"none",color:T.plumL,fontSize:12,fontWeight:600,cursor:"pointer"}}>View all →</button>
        </div>
        {REFERRALS.slice(0,3).map((ref,i)=>(
          <ReferralCard key={ref.id} ref_={ref} lang={lang} onTap={()=>onNavigate("referral-detail",ref)} idx={i}/>
        ))}

        {/* Quick actions */}
        <div className="serif" style={{fontSize:16,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:10,marginTop:6}}>Quick Actions</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[
            {Icon:I.Camera,  label:"Add Portfolio Photo", screen:"portfolio",  grad:[T.plum,T.plumL]},
            {Icon:I.Orders,  label:"Create New Order",    screen:"create-order",grad:[T.saffD,T.saff]},
            {Icon:I.Crown,   label:"My Subscription",     screen:"subscription",grad:[T.goldD,"#E8A020"]},
            {Icon:I.Badge,   label:"Verification Status", screen:"verification",grad:[T.teal,T.tealL]},
          ].map((a,i)=>(
            <div key={i} onClick={()=>onNavigate(a.screen)} className={`press anim-scaleIn d${i+1}`}
              style={{borderRadius:T.r,overflow:"hidden",cursor:"pointer",boxShadow:T.shadow,border:`1px solid ${T.borderL}`}}>
              <div className="silk" style={{height:54,background:`linear-gradient(145deg,${a.grad[0]},${a.grad[1]})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <a.Icon size={24} color="rgba(255,255,255,.9)" accent="rgba(255,255,255,.4)"/>
              </div>
              <div style={{padding:"8px 10px 10px",background:T.white}}>
                <div style={{fontWeight:600,fontSize:12,color:T.text,lineHeight:1.3}}>{a.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{padding:"10px 14px",background:T.blush,borderRadius:T.rMd,border:`1px solid ${T.borderL}`,display:"flex",gap:8}}>
          <I.Info size={14} color={T.textMuted} accent={T.gold} style={{flexShrink:0,marginTop:1}}/>
          <div style={{fontSize:11,color:T.textMuted,lineHeight:1.6}}>{S("disclaimer",lang)}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// REFERRALS
// ═══════════════════════════════════════════════════════════════════════
function ReferralCard({ref_,lang,onTap,idx=0}) {
  const sc={
    new:      {label:S("newRef",lang),   color:T.saffD, bg:T.saffGhost,dot:T.saffL},
    contacted:{label:S("contacted",lang),color:T.teal,  bg:T.tealGhost,dot:T.tealL},
    done:     {label:S("done",lang),     color:T.success,bg:T.successBg,dot:"#81C784"},
  }[ref_.status]||{label:"?",color:T.textMuted,bg:T.linen,dot:T.border};

  return (
    <div onClick={onTap} className={`press hover-lift anim-slideUp d${Math.min(idx+1,6)}`}
      style={{display:"flex",gap:12,padding:"12px 14px",background:T.white,borderRadius:T.r,
        border:`1.5px solid ${ref_.status==="new"?T.saffL:T.borderL}`,marginBottom:10,cursor:"pointer",
        boxShadow:ref_.status==="new"?T.shadowSaff:T.shadow}}>
      <div style={{flexShrink:0,textAlign:"center",minWidth:46}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,color:T.plumD}}>{ref_.time}</div>
        <div style={{fontSize:10,color:T.textGhost,marginTop:1}}>{ref_.date}</div>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <span style={{fontWeight:700,fontSize:14,color:T.text}}>{ref_.customer}</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:T.rPill,background:sc.bg,fontSize:10,fontWeight:700,color:sc.color}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:sc.dot,flexShrink:0}}/>
            {sc.label}
          </span>
        </div>
        <div style={{fontSize:12,color:T.textMuted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ref_.saree} · {ref_.occasion}</div>
        <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:T.goldD,fontWeight:600}}>{ref_.budget}</span>
          {ref_.measurementsShared&&<span style={{fontSize:11,color:T.teal,fontWeight:500}}>📐 Measurements shared</span>}
        </div>
      </div>
      <I.ArrowRight size={18} color={T.textGhost} style={{flexShrink:0,marginTop:4}}/>
    </div>
  );
}

function ReferralsScreen({onNavigate,onBack,lang}) {
  const [filter,setFilter]=useState("all");
  const filters=[{id:"all",label:S("all",lang)},{id:"new",label:S("newRef",lang)},{id:"contacted",label:S("contacted",lang)},{id:"done",label:S("done",lang)}];
  const filtered=filter==="all"?REFERRALS:REFERRALS.filter(r=>r.status===filter);

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise weave" style={{background:T.gradHero,padding:"22px 18px 18px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:12}}>
            <I.ArrowLeft size={20} color={T.onDark}/>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <I.Inbox size={22} color={T.saffL} accent="rgba(255,255,255,.4)"/>
            <div className="serif" style={{fontSize:22,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>Referral Inbox</div>
          </div>
          <div style={{color:"rgba(253,248,240,.5)",fontSize:12,marginTop:4}}>{REFERRALS.length} total · {REFERRALS.filter(r=>r.status==="new").length} new today</div>
        </div>
      </div>
      <div className="zari"/>
      {/* Filter chips */}
      <div className="no-scroll" style={{display:"flex",gap:8,padding:"10px 14px 8px",overflowX:"auto",background:T.white,borderBottom:`1px solid ${T.borderL}`}}>
        {filters.map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} className="press"
            style={{padding:"6px 14px",borderRadius:T.rPill,whiteSpace:"nowrap",flexShrink:0,
              background:filter===f.id?T.gradSaff:T.ivory,color:filter===f.id?"#fff":T.textMid,
              border:`1px solid ${filter===f.id?T.saff:T.border}`,fontSize:12,fontWeight:filter===f.id?700:400,cursor:"pointer"}}>
            {f.label} ({filter===f.id?"":""}{REFERRALS.filter(r=>f.id==="all"||r.status===f.id).length})
          </button>
        ))}
      </div>
      <div className="no-scroll" style={{overflowY:"auto",padding:"12px 14px 96px"}}>
        {filtered.length===0
          ?<div style={{textAlign:"center",padding:"48px 24px",color:T.textMuted,fontSize:14}}>No referrals in this category yet.</div>
          :filtered.map((ref,i)=><ReferralCard key={ref.id} ref_={ref} lang={lang} onTap={()=>onNavigate("referral-detail",ref)} idx={i}/>)
        }
        <div style={{marginTop:10,padding:"10px 14px",background:T.blush,borderRadius:T.rMd,border:`1px solid ${T.borderL}`,display:"flex",gap:7,alignItems:"center"}}>
          <I.WA size={15}/>
          <span style={{fontSize:12,color:T.textMid}}>New referrals also arrive on your WhatsApp. Reply from there anytime.</span>
        </div>
      </div>
    </div>
  );
}

function ReferralDetailScreen({ref_,onBack,lang,showToast}) {
  const [sent,setSent]=useState(false);
  const tailor=TAILOR_SELF;
  const preMsg=`Hi ${ref_.customer}! I'm ${tailor.name} from Wearify. I saw your interest in a blouse for your ${ref_.saree}. I specialise in ${tailor.specialties.map(specialtyLabel).join(", ")}. Shall we discuss the design? 🙏`;

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title="Referral Details" onBack={onBack}
        right={<span style={{fontSize:11,padding:"4px 10px",borderRadius:T.rPill,
          background:ref_.status==="new"?T.saffGhost:T.successBg,
          color:ref_.status==="new"?T.saffD:T.success,fontWeight:700}}>
          {ref_.status.toUpperCase()}
        </span>}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"16px 16px 100px"}}>
        {/* Customer context */}
        <Card style={{marginBottom:14,padding:"15px"}}>
          <div style={{fontSize:11,fontWeight:600,color:T.textGhost,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:10}}>Customer Details</div>
          <div style={{fontSize:19,fontWeight:700,color:T.text,marginBottom:3}}>{ref_.customer}</div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:12}}>{ref_.date} · {ref_.time}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["Saree",ref_.saree],["Fabric",ref_.fabric],["Occasion",ref_.occasion],["Budget",ref_.budget],["Referred by",ref_.store]].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:10,color:T.textGhost,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.4px"}}>{l}</div>
                <div style={{fontSize:13,fontWeight:600,color:T.plumD}}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        {/* Note */}
        {ref_.note&&(
          <Card style={{marginBottom:14,padding:"13px"}}>
            <div style={{fontSize:11,fontWeight:600,color:T.textGhost,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:7}}>Customer Note</div>
            <div style={{fontSize:14,color:T.textMid,lineHeight:1.65,fontStyle:"italic"}}>"{ref_.note}"</div>
          </Card>
        )}
        {/* Measurements */}
        {ref_.measurementsShared?(
          <Card style={{marginBottom:14,padding:"13px",border:`1px solid ${T.borderGold}`}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
              <I.Ruler size={16} color={T.goldD} accent={T.gold}/>
              <span style={{fontWeight:700,fontSize:13,color:T.goldD}}>Measurements Shared (with consent)</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[["Bust","36\""],["Waist","30\""],["Shoulder","14.5\""],["Arm","22\""],["Back","15\""],["Neck","6\""]].map(([l,v])=>(
                <div key={l} style={{padding:"8px 10px",background:T.goldGhost,borderRadius:T.rSm}}>
                  <div style={{fontSize:9,color:T.textGhost,letterSpacing:"0.3px",marginBottom:2}}>{l.toUpperCase()}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:16,color:T.plumD}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:8}}>Customer consented to share measurements for this referral only.</div>
          </Card>
        ):(
          <div style={{padding:"11px 13px",background:T.blush,borderRadius:T.rMd,border:`1px solid ${T.borderL}`,marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
            <I.Lock size={15} color={T.textMuted} accent={T.gold}/>
            <span style={{fontSize:12,color:T.textMuted}}>Measurements not shared. You can request them via WhatsApp.</span>
          </div>
        )}
        {/* Your specialties match */}
        <div style={{padding:"11px 13px",background:T.saffGhost,borderRadius:T.rMd,border:`1px solid ${T.saffL}44`,marginBottom:14,display:"flex",gap:8,alignItems:"flex-start"}}>
          <I.Sparkle size={15} color={T.saffD} accent={T.saff} style={{flexShrink:0,marginTop:1}}/>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:T.saffD,marginBottom:4}}>Your Matching Specialties:</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {TAILOR_SELF.specialties.map(id=><SpecialtyChip key={id} id={id}/>)}
            </div>
          </div>
        </div>
        {/* Pre-filled message */}
        <Card style={{marginBottom:14,padding:"13px"}}>
          <div style={{fontSize:11,fontWeight:600,color:T.textGhost,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Pre-Filled WhatsApp Message</div>
          <div style={{padding:"10px 12px",background:"#DCF8C6",borderRadius:"4px 14px 14px 14px",fontSize:13,color:"#111",lineHeight:1.65,marginBottom:8}}>
            {preMsg}
          </div>
          <div style={{fontSize:11,color:T.textMuted}}>You can edit this before sending.</div>
        </Card>
        {/* Commission note */}
        <div style={{padding:"10px 13px",background:T.plumGhost,borderRadius:T.rMd,border:`1px solid ${T.plumL}18`,marginBottom:16,fontSize:12,color:T.textMid,lineHeight:1.6}}>
          💰 Commission: <strong>₹25</strong> on connect + <strong>₹25</strong> on order completion = <strong>₹50 total</strong>
          {ref_.budget.includes("2,000")||ref_.budget.includes("3,000")?<span style={{color:T.saff,fontWeight:600}}> · Bridal rate: ₹100</span>:null}
        </div>
        <div style={{padding:"9px 12px",background:T.saffGhost,borderRadius:T.rMd,border:`1px solid ${T.saffL}33`,marginBottom:16,fontSize:11,color:T.saffD,lineHeight:1.5}}>
          {S("disclaimer",lang)}
        </div>
      </div>
      {/* Sticky CTA */}
      <div style={{position:"sticky",bottom:0,background:"rgba(253,248,240,.97)",backdropFilter:"blur(16px)",borderTop:`1px solid ${T.borderL}`,padding:"12px 16px",zIndex:50}}>
        <div style={{display:"flex",gap:10}}>
          <Btn fullWidth variant={sent?"ivory":"wa"} size="lg" style={{flex:2}} onClick={()=>{setSent(true);showToast("Opening WhatsApp…");setTimeout(()=>window.open(`${ref_.waLink}?text=${encodeURIComponent(preMsg)}`,"_blank"),300);}}>
            {sent?<><I.Check size={16} color={T.success}/> Sent!</>:<><I.WA size={18}/> {S("openWA",lang)}</>}
          </Btn>
          <Btn variant="saff" size="lg" style={{flex:1}} onClick={()=>{}}>
            <I.Orders size={16} color="#fff"/> Create Order
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════
function OrdersScreen({onNavigate,onBack,lang}) {
  const [tab,setTab]=useState("all");
  const tabs=[
    {id:"all",      label:"All",      count:ORDERS.length},
    {id:"active",   label:"Active",   count:ORDERS.filter(o=>["confirmed","measurements","stitching"].includes(o.status)).length},
    {id:"ready",    label:"Ready",    count:ORDERS.filter(o=>o.status==="ready").length},
    {id:"delivered",label:"Delivered",count:ORDERS.filter(o=>o.status==="delivered").length},
  ];
  const filtered=tab==="all"?ORDERS:tab==="active"?ORDERS.filter(o=>["confirmed","measurements","stitching"].includes(o.status)):ORDERS.filter(o=>o.status===tab);

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise weave" style={{background:T.gradHero,padding:"22px 18px 18px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:12}}>
            <I.ArrowLeft size={20} color={T.onDark}/>
          </button>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <I.Orders size={22} color={T.saffL} accent="rgba(255,255,255,.4)"/>
                <div className="serif" style={{fontSize:22,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>My Orders</div>
              </div>
              <div style={{color:"rgba(253,248,240,.5)",fontSize:12,marginTop:4}}>{ORDERS.filter(o=>o.status!=="delivered").length} active · {ORDERS.filter(o=>o.daysLeft<=2&&o.status!=="delivered").length} due soon</div>
            </div>
            <Btn variant="saff" size="sm" onClick={()=>onNavigate("create-order")}>+ New</Btn>
          </div>
        </div>
      </div>
      <div className="zari"/>
      {/* Tab bar */}
      <div className="no-scroll" style={{display:"flex",gap:0,background:T.white,borderBottom:`1px solid ${T.borderL}`}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"11px 4px",background:"none",border:"none",cursor:"pointer",
              borderBottom:`3px solid ${tab===t.id?T.saff:"transparent"}`,
              color:tab===t.id?T.saffD:T.textMuted,fontSize:12,fontWeight:tab===t.id?700:400,transition:"all .2s",textAlign:"center"}}>
            {t.label}<br/>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:800,color:tab===t.id?T.saffD:T.textGhost}}>{t.count}</span>
          </button>
        ))}
      </div>
      <div className="no-scroll" style={{overflowY:"auto",padding:"12px 14px 96px"}}>
        {filtered.map((ord,i)=>(
          <OrderCard key={ord.id} order={ord} lang={lang} onTap={()=>onNavigate("order-detail",ord)} idx={i}/>
        ))}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"48px 24px",color:T.textMuted,fontSize:14}}>No orders here yet.</div>}
      </div>
    </div>
  );
}

function OrderCard({order,lang,onTap,idx=0}) {
  const sc=ORDER_STATUS[order.status]||ORDER_STATUS.confirmed;
  const isOverdue=order.daysLeft<=0&&order.status!=="delivered";
  const isDueSoon=order.daysLeft<=2&&order.daysLeft>0&&order.status!=="delivered";

  return (
    <div onClick={onTap} className={`press hover-lift anim-slideUp d${Math.min(idx+1,6)}`}
      style={{background:T.white,borderRadius:T.r,border:`1.5px solid ${isOverdue?T.error:isDueSoon?T.saff:T.borderL}`,
        marginBottom:10,cursor:"pointer",boxShadow:isOverdue?"0 4px 16px rgba(183,28,28,.12)":T.shadow,overflow:"hidden"}}>
      {/* Status strip */}
      <div style={{padding:"5px 14px",background:sc.bg,borderBottom:`1px solid ${sc.color}18`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:sc.color}}>
          <span>{sc.icon}</span>{sc.label}
        </span>
        {isOverdue&&<span style={{fontSize:11,fontWeight:700,color:T.error}}>⚠️ {S("overdue",lang)}</span>}
        {isDueSoon&&!isOverdue&&<span style={{fontSize:11,fontWeight:700,color:T.saff}}>{order.daysLeft}d left</span>}
      </div>
      <div style={{padding:"11px 14px 13px",display:"flex",gap:10,alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:2}}>{order.customer}</div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:6}}>{order.service} · {order.fabricType}</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:15,color:T.goldD}}>{fmt(order.price)}</span>
            <span style={{fontSize:11,color:T.textMuted}}>Due {order.deliveryDate}</span>
          </div>
        </div>
        <I.ArrowRight size={18} color={T.textGhost} style={{flexShrink:0,marginTop:4}}/>
      </div>
    </div>
  );
}

function CreateOrderScreen({onBack,lang,showToast}) {
  const [form,setForm]=useState({customer:"",fabric:"Pure Silk",service:"Silk Blouse",price:"",delivery:"",notes:""});
  const up=(k,v)=>setForm(f=>({...f,[k]:v}));
  const [saved,setSaved]=useState(false);

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("createOrder",lang)} onBack={onBack}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 100px"}}>
        <div style={{padding:"10px 13px",background:T.saffGhost,borderRadius:T.rMd,border:`1px solid ${T.saffL}44`,marginBottom:20,fontSize:12,color:T.saffD,lineHeight:1.6}}>
          💡 Create an order after the customer agrees to proceed. A WhatsApp confirmation is sent to them automatically.
        </div>
        {[
          {label:"Customer Name",   key:"customer",  placeholder:"e.g. Priya Sharma", type:"text"},
          {label:"Saree Fabric",    key:"fabric",    placeholder:"e.g. Pure Silk, Georgette", type:"text"},
          {label:"Service Type",    key:"service",   placeholder:"e.g. Silk Blouse Stitching", type:"text"},
          {label:S("agreedPrice",lang), key:"price", placeholder:"e.g. 2200", type:"number"},
          {label:S("deliveryDate",lang),key:"delivery",placeholder:"e.g. 28 March 2026", type:"text"},
        ].map(({label,key,placeholder,type})=>(
          <div key={key} style={{marginBottom:16}}>
            <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"}}>{label}</label>
            <input value={form[key]} onChange={e=>up(key,e.target.value)} placeholder={placeholder}
              inputMode={type==="number"?"numeric":"text"}
              style={{width:"100%",padding:"13px 14px",borderRadius:T.rMd,border:`1.5px solid ${form[key]?T.saff:T.border}`,
                fontSize:15,fontFamily:type==="number"?"'DM Mono',monospace":"'DM Sans',sans-serif",
                color:T.plumD,outline:"none",background:T.white,transition:"border-color .2s"}}
              onFocus={e=>e.target.style.borderColor=T.saff} onBlur={e=>e.target.style.borderColor=form[key]?T.saff:T.border}/>
          </div>
        ))}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("specialNotes",lang)}</label>
          <textarea value={form.notes} onChange={e=>up("notes",e.target.value)} placeholder="Design notes, preferences, special requirements..."
            style={{width:"100%",minHeight:80,padding:"12px 14px",borderRadius:T.rMd,border:`1.5px solid ${T.border}`,
              fontSize:14,fontFamily:"'DM Sans',sans-serif",color:T.plumD,resize:"none",outline:"none",background:T.white}}
            onFocus={e=>e.target.style.borderColor=T.saff} onBlur={e=>e.target.style.borderColor=T.border}/>
        </div>
        {/* WhatsApp preview */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:600,color:T.textMid,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.4px"}}>WhatsApp Confirmation Preview</div>
          <div style={{padding:"10px 12px",background:"#DCF8C6",borderRadius:"4px 14px 14px 14px",fontSize:13,color:"#111",lineHeight:1.65}}>
            Hi {form.customer||"[Customer Name]"}! Your order for {form.service||"[Service]"} (₹{form.price||"[Price]"}) is confirmed. Delivery by {form.delivery||"[Date]"}. — {TAILOR_SELF.name} via Wearify
          </div>
        </div>
        <Btn fullWidth variant="saff" size="lg" onClick={()=>{setSaved(true);showToast("Order created! WhatsApp sent to customer.");}} disabled={!form.customer||!form.price}>
          {saved?"✓ Order Created":"Confirm Order & Notify Customer"}
        </Btn>
      </div>
    </div>
  );
}

function OrderDetailScreen({order,onBack,lang,showToast}) {
  const [status,setStatus]=useState(order.status);
  const sc=ORDER_STATUS[status]||ORDER_STATUS.confirmed;
  const currentStep=sc.step;
  const nextStatus=Object.keys(ORDER_STATUS).find(k=>ORDER_STATUS[k].step===currentStep+1);

  const advance=()=>{
    if(nextStatus){setStatus(nextStatus);showToast(`Order marked as: ${ORDER_STATUS[nextStatus].label}`);}
  };

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title="Order Details" onBack={onBack}
        right={<BadgeChip badge="verified" lang={lang} size="sm"/>}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"16px 16px 100px"}}>
        {/* Order info */}
        <Card style={{marginBottom:14,padding:"15px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{fontSize:11,color:T.textGhost,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:3}}>Order {order.id}</div>
              <div style={{fontWeight:700,fontSize:18,color:T.text}}>{order.customer}</div>
              <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>{order.service} · {order.fabricType}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:20,color:T.goldD}}>{fmt(order.price)}</div>
              <div style={{fontSize:11,color:order.daysLeft<=2?T.error:T.textMuted,fontWeight:order.daysLeft<=2?700:400}}>
                {order.daysLeft>0?`${order.daysLeft} days left`:"Due today"}
              </div>
            </div>
          </div>
          {order.notes&&<div style={{padding:"9px 12px",background:T.blush,borderRadius:T.rSm,fontSize:13,color:T.textMid,fontStyle:"italic"}}>"{order.notes}"</div>}
        </Card>

        {/* 4-stage tracker */}
        <Card style={{marginBottom:14,padding:"15px"}}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:14}}>Order Status Tracker</div>
          <div style={{display:"flex",gap:0,alignItems:"center",marginBottom:12}}>
            {ORDER_STEPS.map((step,i)=>{
              const done=i<currentStep-1; const active=i===currentStep-1;
              return (
                <div key={step} style={{flex:i<ORDER_STEPS.length-1?1:"auto",display:"flex",alignItems:"center"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,
                    background:done||active?T.gradSaff:T.linen,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    border:`2px solid ${done||active?T.saff:T.border}`,
                    boxShadow:active?T.shadowSaff:"none",transition:"all .3s"}}>
                    {done?<I.Check size={14} color="#fff"/>:<span style={{fontSize:11,fontWeight:700,color:done||active?"#fff":T.textGhost}}>{i+1}</span>}
                  </div>
                  {i<ORDER_STEPS.length-1&&<div style={{flex:1,height:3,background:done?T.gradSaff:T.linen,transition:"background .4s"}}/>}
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            {ORDER_STEPS.map((s,i)=>(
              <div key={s} style={{fontSize:8,color:i<currentStep?T.saffD:T.textGhost,fontWeight:i===currentStep-1?700:400,textAlign:"center",flex:1}}>{s}</div>
            ))}
          </div>
          {/* Current status */}
          <div style={{marginTop:14,padding:"10px 12px",background:sc.bg,borderRadius:T.rMd,border:`1px solid ${sc.color}22`,display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:18}}>{sc.icon}</span>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:sc.color}}>{sc.label}</div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Customer is notified via WhatsApp automatically</div>
            </div>
          </div>
        </Card>

        {/* WhatsApp commands */}
        <Card style={{marginBottom:14,padding:"13px"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
            <I.WA size={15}/>
            <div style={{fontWeight:700,fontSize:13,color:T.text}}>WhatsApp Shortcut</div>
          </div>
          <div style={{padding:"8px 12px",background:"#ECF8EC",borderRadius:T.rSm,fontFamily:"'DM Mono',monospace",fontSize:12,color:"#1B5E20"}}>
            READY {order.id}
          </div>
          <div style={{fontSize:11,color:T.textMuted,marginTop:6}}>Send this to the Wearify WhatsApp bot to mark this order as Ready without opening the app.</div>
        </Card>

        {/* Delivery preference */}
        <Card style={{marginBottom:16,padding:"13px"}}>
          <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:10}}>Delivery Method</div>
          {["Walk-in Pickup","Store Pickup (Wearify partner store)","Home Delivery"].map((d,i)=>(
            <div key={d} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:i<2?`1px solid ${T.borderL}`:"none"}}>
              <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${i===0?T.saff:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {i===0&&<div style={{width:8,height:8,borderRadius:"50%",background:T.saff}}/>}
              </div>
              <span style={{fontSize:13,color:i===0?T.saffD:T.textMid,fontWeight:i===0?600:400}}>{d}</span>
              {i===1&&<Tag color={T.success} small>Drives store re-visit!</Tag>}
            </div>
          ))}
        </Card>

        <div style={{padding:"9px 12px",background:T.saffGhost,borderRadius:T.rMd,border:`1px solid ${T.saffL}33`,marginBottom:16,fontSize:11,color:T.saffD,lineHeight:1.5}}>
          {S("disclaimer",lang)}
        </div>
      </div>
      {/* CTA */}
      <div style={{position:"sticky",bottom:0,background:"rgba(253,248,240,.97)",backdropFilter:"blur(16px)",borderTop:`1px solid ${T.borderL}`,padding:"12px 16px",zIndex:50}}>
        {nextStatus?(
          <Btn fullWidth variant="saff" size="lg" onClick={advance}>
            <span style={{fontSize:16}}>{ORDER_STATUS[nextStatus].icon}</span>
            {S("markAs",lang)}: {ORDER_STATUS[nextStatus].label}
          </Btn>
        ):(
          <div style={{textAlign:"center",padding:"12px",fontSize:14,fontWeight:600,color:T.success}}>✓ Order Complete</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAYMENTS & COMMISSION
// ═══════════════════════════════════════════════════════════════════════
function CommissionScreen({onBack,lang}) {
  const tailor=TAILOR_SELF;
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise weave" style={{background:T.gradHero,padding:"22px 18px 20px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:12}}>
            <I.ArrowLeft size={20} color={T.onDark}/>
          </button>
          <div className="serif gold-shimmer" style={{fontSize:22,fontWeight:700,fontStyle:"italic"}}>{S("commission",lang)}</div>
          <div style={{color:"rgba(253,248,240,.5)",fontSize:13,marginTop:4}}>{S("commissionModel",lang)}</div>
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        {/* Commission breakdown */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {[
            {label:"Standard Referral",amount:"₹50",sub:"Per completed order",color:T.plumL,bg:T.plumGhost},
            {label:"Bridal / Premium",amount:"₹100",sub:"Order value > ₹2,000",color:T.goldD,bg:T.goldGhost},
            {label:"Gold Tailor Rate",amount:"₹35",sub:">20 refs + 4.5★",color:T.teal,bg:T.tealGhost},
            {label:"Free Referrals",amount:"5",sub:"Commission-free to start",color:T.success,bg:T.successBg},
          ].map(({label,amount,sub,color,bg},i)=>(
            <Card key={i} className={`anim-scaleIn d${i+1}`} style={{padding:"13px 12px",border:`1px solid ${color}22`,background:bg}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:22,color}}>{amount}</div>
              <div style={{fontWeight:600,fontSize:12,color,marginTop:2}}>{label}</div>
              <div style={{fontSize:10,color:T.textGhost,marginTop:3}}>{sub}</div>
            </Card>
          ))}
        </div>
        {/* Commission event flow */}
        <Card style={{marginBottom:16,padding:"14px"}}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:12}}>When You Pay Commission</div>
          {[
            {step:"Customer taps Connect",amount:"₹0",note:"Referral logged. No charge yet."},
            {step:"Customer contacts you",amount:"₹25",note:"Intent commission — you've received a lead."},
            {step:"Order completed",       amount:"₹25",note:"Completion bonus. Total: ₹50."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<2?`1px dashed ${T.borderL}`:"none"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:T.gradSaff,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13,color:T.text}}>{s.step}</div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{s.note}</div>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:13,color:i===0?T.textMuted:T.goldD}}>{s.amount}</div>
            </div>
          ))}
        </Card>
        {/* Free referral tracker */}
        <div style={{padding:"13px 14px",background:T.saffGhost,borderRadius:T.r,border:`1px solid ${T.saffL}44`,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,color:T.saffD,marginBottom:8}}>{S("free5",lang)}</div>
          <div style={{display:"flex",gap:6,marginBottom:6}}>
            {Array.from({length:5}).map((_,i)=>(
              <div key={i} style={{flex:1,height:8,borderRadius:4,background:i<tailor.freeReferralsUsed?T.gradSaff:T.linen}}/>
            ))}
          </div>
          <div style={{fontSize:12,color:T.saffD}}>{S("free5note",lang)}<strong>{tailor.freeReferralsUsed}/5</strong></div>
        </div>
        {/* Monthly invoice note */}
        <div style={{padding:"11px 13px",background:T.blush,borderRadius:T.rMd,border:`1px solid ${T.borderL}`,marginBottom:16,fontSize:12,color:T.textMid,lineHeight:1.65}}>
          📅 <strong>Monthly Invoice:</strong> Wearify sends your commission invoice on WhatsApp on the <strong>1st of each month</strong>. Payment due by the <strong>15th</strong> via UPI.
        </div>
      </div>
    </div>
  );
}

function StatementScreen({onBack,lang,showToast}) {
  const tailor=TAILOR_SELF;
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("monthlyStatement",lang)} onBack={onBack}
        right={<Btn variant="gold" size="sm" onClick={()=>showToast("PDF downloading…")}>{S("downloadPDF",lang)}</Btn>}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        <div style={{padding:"8px 12px",background:T.plumGhost,borderRadius:T.rMd,border:`1px solid ${T.plumL}18`,marginBottom:18,fontSize:11,color:T.textMid}}>
          Statement for <strong>March 2026</strong> · Generated Apr 1 · Due by Apr 15
        </div>
        {/* Summary */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[
            {l:"Referrals Received",  v:MONTHLY_STATS.thisMonth.referrals, col:T.plumL},
            {l:"Orders Completed",    v:MONTHLY_STATS.thisMonth.orders,    col:T.teal},
            {l:"Avg Order Value",     v:fmt(MONTHLY_STATS.thisMonth.avgValue), col:T.goldD},
            {l:"Commission Owed",     v:fmt(tailor.commissionOwed), col:T.saffD},
          ].map(({l,v,col},i)=>(
            <Card key={i} style={{padding:"12px"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:18,color}}>{v}</div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:3}}>{l}</div>
            </Card>
          ))}
        </div>
        {/* Net earnings */}
        <Card style={{marginBottom:16,padding:"14px",border:`1px solid ${T.borderGold}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:T.text}}>Net Earnings This Month</div>
              <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>Customer payments − commission owed</div>
            </div>
            <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:22,color:T.goldD}}>{fmt(tailor.earnedThisMonth - tailor.commissionOwed)}</div>
          </div>
        </Card>
        {/* Pay commission CTA */}
        <div style={{padding:"14px",background:T.saffGhost,borderRadius:T.r,border:`1px solid ${T.saffL}44`,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,color:T.saffD,marginBottom:4}}>Commission Due: {fmt(tailor.commissionOwed)}</div>
          <div style={{fontSize:12,color:T.textMid,marginBottom:12}}>Pay via UPI to <strong>wearify@razorpay</strong> or tap below.</div>
          <Btn fullWidth variant="saff" size="md" onClick={()=>showToast("Opening UPI payment…")}>{S("payNow",lang)}</Btn>
        </div>
        {/* Income verification */}
        <div style={{padding:"13px 14px",background:T.plumGhost,borderRadius:T.r,border:`1px solid ${T.plumL}22`,marginBottom:16}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <I.Info size={16} color={T.plumL} accent={T.gold} style={{flexShrink:0,marginTop:1}}/>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:T.plumD,marginBottom:4}}>{S("incomeProof",lang)}</div>
              <div style={{fontSize:12,color:T.textMid,lineHeight:1.6,marginBottom:10}}>Tailors with 6+ months of earnings history can download a Wearify income summary letter for bank/loan applications.</div>
              <Btn variant="plum" size="sm" onClick={()=>showToast("Income letter generated for bank/loan use.")}>Download Letter</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// RATINGS & VERIFICATION
// ═══════════════════════════════════════════════════════════════════════
function RatingsScreen({onBack,lang,onNavigate}) {
  const tailor=TAILOR_SELF;
  const [replyText,setReplyText]=useState({});
  const scoreBreakdown=[
    {label:"Avg Star Rating (40%)",   pct:40, val:"4.8/5.0",color:T.goldD},
    {label:"On-Time Delivery (30%)",  pct:30, val:"88%",    color:T.teal},
    {label:"Acceptance Rate (15%)",   pct:15, val:"95%",    color:T.plumL},
    {label:"Dispute Rate (10%)",      pct:10, val:"0%",     color:T.success},
    {label:"Portfolio Quality (5%)",  pct:5,  val:"9.2/10", color:T.saff},
  ];
  const compositeScore=86;

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("myRatings",lang)} onBack={onBack}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"16px 16px 96px"}}>
        {/* Star rating hero */}
        <div style={{textAlign:"center",padding:"20px 16px",background:`linear-gradient(135deg,${T.plumGhost},${T.goldGhost})`,borderRadius:T.r,border:`1px solid ${T.borderGold}`,marginBottom:18}}>
          <div style={{display:"flex",gap:4,justifyContent:"center",marginBottom:8}}>
            {[1,2,3,4,5].map(n=><I.Star key={n} size={28} color={T.goldD} accent={T.gold} filled={n<=4}/>)}
          </div>
          <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:32,color:T.goldD}}>{tailor.rating}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:4}}>
            <I.Thread size={14} color={T.textGhost} accent={T.gold}/>
            <span style={{fontSize:13,color:T.textMuted}}>{tailor.reviewCount} reviews · {tailor.reviewCount>=5?"Public rating shown":"Min 5 reviews needed"}</span>
          </div>
        </div>
        {/* Quality score — private */}
        <Card style={{marginBottom:16,padding:"14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:T.text}}>{S("qualityScore",lang)}</div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Private — used for search ranking only</div>
            </div>
            <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:26,color:T.saff}}>{compositeScore}<span style={{fontSize:14,color:T.textMuted}}>/100</span></div>
          </div>
          {scoreBreakdown.map(({label,pct,val,color})=>(
            <div key={label} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.textMid,marginBottom:3}}>
                <span>{label}</span><span style={{fontFamily:"'DM Mono',monospace",fontWeight:600,color}}>{val}</span>
              </div>
              <div style={{height:6,borderRadius:3,background:T.linen,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:3,background:color,width:`${(parseInt(val)||0)*pct/100}%`,transition:"width .8s ease"}}/>
              </div>
            </div>
          ))}
          <div style={{marginTop:10,padding:"8px 12px",background:T.saffGhost,borderRadius:T.rSm,fontSize:11,color:T.saffD}}>
            📱 Weekly coaching digest sent to your WhatsApp every Monday with tips to improve your score.
          </div>
        </Card>
        {/* Reviews */}
        <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:12,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>Customer Reviews</div>
        {REVIEWS.map((rev,i)=>(
          <Card key={rev.id} className={`anim-slideUp d${i+1}`} style={{marginBottom:12,padding:"13px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontWeight:700,fontSize:14,color:T.text}}>{rev.customer}</div>
              <div style={{display:"flex",gap:2}}>
                {[1,2,3,4,5].map(n=><I.Star key={n} size={13} color={T.goldD} accent={T.gold} filled={n<=rev.rating}/>)}
              </div>
            </div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:8}}>{rev.date} {rev.photo&&<span style={{color:T.teal,fontWeight:600}}>· Photo shared ✓</span>}</div>
            <div style={{fontSize:13,color:T.textMid,lineHeight:1.65,marginBottom:rev.reply?10:0}}>"{rev.text}"</div>
            {rev.reply&&(
              <div style={{padding:"8px 10px",background:T.plumGhost,borderRadius:T.rSm,fontSize:12,color:T.plumD,lineHeight:1.5}}>
                <span style={{fontWeight:700}}>Your reply: </span>{rev.reply}
              </div>
            )}
            {!rev.reply&&(
              <div style={{marginTop:8}}>
                <textarea value={replyText[rev.id]||""} onChange={e=>setReplyText(r=>({...r,[rev.id]:e.target.value.slice(0,150)}))}
                  placeholder="Write a reply (max 150 chars)..."
                  style={{width:"100%",minHeight:50,padding:"8px 10px",borderRadius:T.rSm,border:`1px solid ${T.border}`,fontSize:12,resize:"none",outline:"none",background:T.ivory,fontFamily:"'DM Sans',sans-serif"}}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:10,color:T.textGhost}}>{(replyText[rev.id]||"").length}/150</span>
                  {(replyText[rev.id]||"").length>0&&<Btn variant="plum" size="sm" onClick={()=>{}}>Post Reply</Btn>}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function VerificationScreen({onBack,lang}) {
  const current=TAILOR_SELF.badge;
  const tiers=[
    {id:"registered",title:S("registered",lang),dot:"🟡",color:"#6B7280",
     reqs:["Phone OTP verified","Profile name and city added","Portfolio upload started"],
     done:true},
    {id:"verified",  title:S("verified",lang),  dot:"🔵",color:T.teal,
     reqs:["Min 4 portfolio photos","Specialties and service menu complete","Admin team review completed (48 hrs)"],
     done:false},
    {id:"pro",       title:S("proTailor",lang), dot:"⭐",color:T.goldD,
     reqs:["Aadhaar verification (optional but recommended)","Min 10 customer reviews","Average rating ≥ 4.5","Active for 6+ months"],
     done:false},
  ];
  const order=["registered","verified","pro"];

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("verificationStatus",lang)} onBack={onBack}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        <div style={{padding:"10px 13px",background:T.plumGhost,borderRadius:T.rMd,border:`1px solid ${T.plumL}18`,marginBottom:20,display:"flex",gap:7,alignItems:"flex-start"}}>
          <I.Info size={15} color={T.plumL} accent={T.gold} style={{flexShrink:0,marginTop:1}}/>
          <div style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>Badges are awarded by the Wearify team based on quality. Verification is never pay-to-play. Only the Pro badge is connected to your subscription.</div>
        </div>
        {tiers.map((tier,i)=>{
          const isCurrent=tier.id===current;
          const isAchieved=order.indexOf(tier.id)<=order.indexOf(current);
          return (
            <div key={tier.id} className={`anim-slideUp d${i+1}`}
              style={{marginBottom:12,borderRadius:T.r,overflow:"hidden",border:`2px solid ${isCurrent?T.gold:isAchieved?T.borderGold:T.borderL}`,
                background:isCurrent?"linear-gradient(135deg,#fff,#FDF5E4)":T.white,
                boxShadow:isCurrent?T.shadowGold:T.shadow}}>
              <div style={{padding:"14px 16px",display:"flex",gap:12}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:isAchieved?T.goldGhost:T.linen,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  border:`2px solid ${isAchieved?T.borderGold:T.borderL}`,fontSize:22}}>
                  {tier.dot}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span className="serif" style={{fontSize:16,fontWeight:700,color:tier.color,fontStyle:"italic"}}>{tier.title}</span>
                    {isCurrent&&<Tag color={T.goldD} bg={T.goldGhost} small>Current ✓</Tag>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {tier.reqs.map((req,j)=>(
                      <div key={j} style={{display:"flex",alignItems:"center",gap:7}}>
                        {isAchieved?<I.Check size={13} color={T.success}/>:<div style={{width:13,height:13,borderRadius:"50%",border:`1.5px solid ${T.border}`,flexShrink:0}}/>}
                        <span style={{fontSize:12,color:isAchieved?T.textMid:T.textGhost}}>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{padding:"11px 14px",background:T.saffGhost,borderRadius:T.rMd,border:`1px solid ${T.saffL}33`,fontSize:12,color:T.saffD,lineHeight:1.6}}>
          ⭐ <strong>City-level badge scarcity:</strong> There are only <strong>3 Pro Tailors</strong> in Varanasi. The Pro badge signals premium quality to customers making high-value bridal decisions.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PORTFOLIO MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════
function PortfolioScreen({onBack,lang,showToast}) {
  const tailor=TAILOR_SELF;
  const [portfolio,setPortfolio]=useState(tailor.portfolio);
  const styleGroups=[...new Set(portfolio.map(p=>p.style))];

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("portfolio",lang)} onBack={onBack}
        right={<Btn variant="saff" size="sm" onClick={()=>showToast("Upload photo (demo)")}>+ Add</Btn>}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"14px 14px 96px"}}>
        {/* Count + info */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"11px 14px",background:T.goldGhost,borderRadius:T.r,border:`1px solid ${T.borderGold}`}}>
          <I.Camera size={20} color={T.goldD} accent={T.gold}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,color:T.goldD}}>{portfolio.length} portfolio photos</div>
            <div style={{fontSize:11,color:T.textMid,marginTop:1}}>AI auto-tags each photo · Max 20 photos</div>
          </div>
        </div>
        {/* Style clusters */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:8}}>Style Clusters (auto-grouped by AI)</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {styleGroups.map(g=><Tag key={g} color={T.plumL}>{g} ({portfolio.filter(p=>p.style===g).length})</Tag>)}
          </div>
        </div>
        {/* Grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:18}}>
          {portfolio.map((item,i)=>(
            <Card key={item.id} className={`anim-scaleIn d${Math.min(i+1,6)}`} style={{overflow:"hidden"}}>
              <div style={{position:"relative",height:140}}>
                <div style={{position:"absolute",inset:0,background:`linear-gradient(148deg,${item.grad[0]},${item.grad[1]})`}}/>
                <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.12}} aria-hidden>
                  <defs><pattern id={`wp${i}`} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="6" x2="6" y2="0" stroke="#fff" strokeWidth=".5"/>
                    <line x1="6" y1="12" x2="12" y2="6" stroke="#fff" strokeWidth=".5"/>
                  </pattern></defs>
                  <rect width="100%" height="100%" fill={`url(#wp${i})`}/>
                </svg>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(13,4,24,.6),transparent)"}}/>
                <div style={{position:"absolute",top:8,right:8,padding:"2px 8px",borderRadius:T.rPill,background:"rgba(201,148,26,.75)",fontSize:8,fontWeight:700,color:"#fff"}}>{item.style}</div>
                <div style={{position:"absolute",bottom:8,left:8,right:8,fontSize:10,fontWeight:600,color:"rgba(253,248,240,.9)"}}>{item.tag}</div>
              </div>
              <div style={{padding:"9px 10px 10px",background:T.white}}>
                <div style={{fontSize:11,color:T.textMuted,marginBottom:5}}>{item.occasion}</div>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={()=>showToast("Edit tags (demo)")} style={{flex:1,padding:"5px 0",borderRadius:T.rSm,background:T.plumGhost,border:`1px solid ${T.plumL}22`,fontSize:11,fontWeight:600,color:T.plumL,cursor:"pointer"}}>Edit Tags</button>
                  <button onClick={()=>{setPortfolio(p=>p.filter((_,j)=>j!==i));showToast("Photo removed");}} style={{width:28,height:28,borderRadius:T.rSm,background:T.errorBg,border:`1px solid ${T.error}18`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    <I.X size={13} color={T.error}/>
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {/* Add slot */}
          <div onClick={()=>showToast("Upload new photo (demo)")} className="press"
            style={{borderRadius:T.r,border:`2px dashed ${T.borderGold}`,aspectRatio:"2/2.4",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:8,background:T.goldGhost}}>
            <I.Camera size={28} color={T.goldD} accent={T.gold}/>
            <span style={{fontSize:12,color:T.goldD,fontWeight:600}}>Add Photo</span>
          </div>
        </div>
        {/* Service menu */}
        <div className="serif" style={{fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:10}}>{S("serviceMenu",lang)}</div>
        {tailor.services.map((svc,i)=>(
          <Card key={svc.id} className={`anim-slideUp d${i+1}`} style={{marginBottom:10,padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:T.text}}>{svc.name}</div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{svc.days} days delivery</div>
              </div>
              <div style={{textAlign:"right",marginRight:12}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:13,color:T.goldD}}>{fmt(svc.priceMin)}–{fmt(svc.priceMax)}</div>
                <div style={{fontSize:10,color:T.textGhost}}>estimate only</div>
              </div>
              <ToggleSwitch on={svc.active} onToggle={()=>showToast(`${svc.name} ${svc.active?"paused":"activated"}`)}/>
            </div>
          </Card>
        ))}
        <div style={{padding:"9px 13px",background:T.saffGhost,borderRadius:T.rMd,border:`1px solid ${T.saffL}33`,fontSize:11,color:T.saffD,marginTop:8}}>
          Prices shown to customers as estimates only — final price agreed directly with customer.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════
function AnalyticsScreen({onBack,lang}) {
  const stats=MONTHLY_STATS;
  const vs=(curr,prev)=>curr>prev?`+${curr-prev} vs last month`:`${curr-prev} vs last month`;

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("analytics",lang)} onBack={onBack}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"16px 14px 96px"}}>
        <div style={{padding:"8px 12px",background:T.plumGhost,borderRadius:T.rMd,marginBottom:16,fontSize:11,color:T.textMid}}>
          March 2026 · Updated daily
        </div>
        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
          {[
            {Icon:I.Inbox,  l:"Referrals Received",   v:stats.thisMonth.referrals, sub:vs(stats.thisMonth.referrals,stats.lastMonth.referrals),  col:T.plumL, bg:T.plumGhost},
            {Icon:I.Orders, l:"Orders Completed",     v:stats.thisMonth.orders,    sub:vs(stats.thisMonth.orders,stats.lastMonth.orders),          col:T.teal,  bg:T.tealGhost},
            {Icon:I.Rupee,  l:"Avg Order Value",      v:fmt(stats.thisMonth.avgValue), sub:vs(stats.thisMonth.avgValue,stats.lastMonth.avgValue)+" ₹", col:T.goldD, bg:T.goldGhost},
            {Icon:I.Star,   l:"Repeat Customer Rate", v:stats.thisMonth.repeatRate+"%", sub:vs(stats.thisMonth.repeatRate,stats.lastMonth.repeatRate)+"%", col:T.saff, bg:T.saffGhost},
          ].map(({Icon,l,v,sub,col,bg},i)=>(
            <Card key={i} className={`anim-scaleIn d${i+1}`} style={{padding:"13px 12px",background:bg,border:`1px solid ${col}22`}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                <Icon size={16} color={col} accent={T.gold}/>
                <span style={{fontSize:10,color:col,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.3px"}}>{l}</span>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:20,color}}>{v}</div>
              <div style={{fontSize:10,color:T.textGhost,marginTop:3}}>{sub}</div>
            </Card>
          ))}
        </div>
        {/* Bar chart — referrals by day */}
        <Card style={{padding:"14px 16px",marginBottom:16}}>
          <div className="serif" style={{fontWeight:600,fontSize:15,color:T.text,fontStyle:"italic",marginBottom:6}}>Monthly Referral Trend</div>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>Peak day: <strong>{stats.thisMonth.peakDay}</strong></div>
          <div style={{display:"flex",gap:2,alignItems:"flex-end",height:80}}>
            {stats.referrals.slice(-15).map((v,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{width:"100%",background:i===stats.referrals.slice(-15).indexOf(Math.max(...stats.referrals.slice(-15)))?T.gradSaff:T.gradPlum,
                  borderRadius:"2px 2px 0 0",height:v*4,transition:"height .6s ease",opacity:.85}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:9,color:T.textGhost}}>15 days ago</span>
            <span style={{fontSize:9,color:T.textGhost}}>Today</span>
          </div>
        </Card>
        {/* Weekly digest preview */}
        <div style={{padding:"13px 14px",background:"#ECF8EC",borderRadius:T.r,border:`1px solid rgba(27,94,32,.15)`,display:"flex",gap:10}}>
          <I.WA size={20} color="#25D366"/>
          <div style={{fontSize:12,color:"#1B5E20",lineHeight:1.65}}>
            <strong>Weekly WhatsApp Digest (sent every Monday):</strong><br/>
            "Your quality score this week: 86/100 ✨ On-time delivery: 88% ✅ Average rating: 4.8 ⭐ Keep it up, Priya!"
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════════════
function SubscriptionScreen({onBack,lang,showToast}) {
  const current=TAILOR_SELF.subscription;
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <div className="noise weave" style={{background:T.gradHero,padding:"22px 18px 20px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <button onClick={onBack} className="press" style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.15)",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:14}}>
            <I.ArrowLeft size={20} color={T.onDark}/>
          </button>
          <div className="serif gold-shimmer" style={{fontSize:22,fontWeight:700,fontStyle:"italic",marginBottom:4}}>{S("subscription",lang)}</div>
          <div style={{color:"rgba(253,248,240,.5)",fontSize:13}}>More visibility · More referrals · More earnings</div>
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"18px 14px 96px"}}>
        {PLANS.map((plan,i)=>{
          const isCurrent=plan.id===current;
          return (
            <div key={plan.id} className={`anim-slideUp d${i+1}`}
              style={{marginBottom:12,borderRadius:T.r,overflow:"hidden",border:`2px solid ${plan.highlight?T.gold:isCurrent?T.saff:T.borderL}`,
                background:plan.highlight?"linear-gradient(135deg,#fff,#FDF5E4)":T.white,
                boxShadow:plan.highlight?T.shadowGold:T.shadow,position:"relative"}}>
              {plan.highlight&&(
                <div style={{background:T.gradGold,padding:"5px",textAlign:"center"}}>
                  <span style={{fontSize:11,fontWeight:800,color:T.plumD,letterSpacing:"0.8px"}}>★ MOST POPULAR · RECOMMENDED</span>
                </div>
              )}
              <div style={{padding:`${plan.highlight?18:14}px 16px 16px`}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <div className="serif" style={{fontSize:20,fontWeight:700,color:plan.color,fontStyle:"italic"}}>{plan.name}</div>
                    <div style={{fontSize:11,color:plan.color,fontWeight:600,marginTop:2}}>{plan.limit}</div>
                  </div>
                  {plan.price===0
                    ?<div className="serif" style={{fontSize:24,fontWeight:700,color:T.textMuted,fontStyle:"italic"}}>Free</div>
                    :<div style={{textAlign:"right"}}>
                      <div className="serif" style={{fontSize:26,fontWeight:700,color:plan.highlight?T.goldD:T.plumD,fontStyle:"italic"}}>₹{plan.price}</div>
                      <div style={{fontSize:11,color:T.textMuted}}>{S("perMonth",lang)}</div>
                    </div>
                  }
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
                  {plan.perks.map((p,j)=>(
                    <div key={j} style={{display:"flex",alignItems:"center",gap:8}}>
                      <I.Check size={14} color={plan.color}/>
                      <span style={{fontSize:13,color:T.textMid}}>{p}</span>
                    </div>
                  ))}
                </div>
                {isCurrent
                  ?<div style={{padding:"10px",borderRadius:T.rPill,background:T.successBg,border:`1px solid ${T.success}`,textAlign:"center",fontSize:13,fontWeight:700,color:T.success}}>✓ {S("currentPlan",lang)}</div>
                  :<Btn fullWidth variant={plan.highlight?"gold":plan.price===0?"ivory":"plum"} onClick={()=>showToast(`Switching to ${plan.name}…`)}>
                    {plan.price===0?"Downgrade to Free":`${S("upgradeTo",lang)} ${plan.name} →`}
                  </Btn>
                }
              </div>
            </div>
          );
        })}
        {/* Featured placement */}
        <div style={{padding:"14px",background:`linear-gradient(135deg,${T.plumGhost},#FEF3E8)`,borderRadius:T.r,border:`1px solid ${T.borderGold}`,marginTop:8}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
            <I.Sparkle size={22} color={T.goldD} accent={T.gold}/>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:T.goldD,marginBottom:3}}>Featured Placement</div>
              <div style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>Get promoted inside Wearify store AI suggestions and city-level search. Available for Pro subscribers. ₹2,000–₹5,000/month per store zone.</div>
            </div>
          </div>
          <Btn fullWidth variant="gold" size="sm" onClick={()=>showToast("Wearify sales will contact you for featured placement.")}>Enquire About Featured Placement</Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// EDIT PROFILE
// ═══════════════════════════════════════════════════════════════════════
function EditProfileScreen({onBack,lang,showToast}) {
  const [form,setForm]=useState({
    name:TAILOR_SELF.name,area:TAILOR_SELF.area,
    bio:TAILOR_SELF.bio,experience:TAILOR_SELF.experience,
    specialties:[...TAILOR_SELF.specialties],  // ← multi-specialty array
  });
  const [saved,setSaved]=useState(false);
  const up=(k,v)=>{setForm(f=>({...f,[k]:v}));setSaved(false);};
  const toggleSpecialty=(id)=>{
    const current=form.specialties;
    const next=current.includes(id)?current.filter(s=>s!==id):[...current,id];
    up("specialties",next);
  };

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("editProfile",lang)} onBack={onBack}
        right={<Btn variant="saff" size="sm" loading={saved} onClick={()=>{setSaved(true);showToast("Profile saved!");}}>
          {saved?S("saved",lang):S("save",lang)}
        </Btn>}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        {[
          {label:S("yourName",lang),key:"name",placeholder:"Your full name"},
          {label:S("area",lang),   key:"area", placeholder:"Your area / locality"},
        ].map(({label,key,placeholder})=>(
          <div key={key} style={{marginBottom:16}}>
            <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"}}>{label}</label>
            <input value={form[key]} onChange={e=>up(key,e.target.value)} placeholder={placeholder}
              style={{width:"100%",padding:"13px 14px",borderRadius:T.rMd,border:`1.5px solid ${form[key]?T.saff:T.border}`,
                fontSize:15,fontFamily:"'DM Sans',sans-serif",color:T.plumD,outline:"none",background:T.white,transition:"border-color .2s"}}
              onFocus={e=>e.target.style.borderColor=T.saff} onBlur={e=>e.target.style.borderColor=form[key]?T.saff:T.border}/>
          </div>
        ))}
        {/* Bio */}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"}}>Bio (max 150 chars)</label>
          <textarea value={form.bio} onChange={e=>up("bio",e.target.value.slice(0,150))}
            placeholder="Describe your specialty and experience..."
            style={{width:"100%",minHeight:70,padding:"12px 14px",borderRadius:T.rMd,border:`1.5px solid ${T.border}`,fontSize:14,fontFamily:"'DM Sans',sans-serif",color:T.plumD,resize:"none",outline:"none",background:T.white}}
            onFocus={e=>e.target.style.borderColor=T.saff} onBlur={e=>e.target.style.borderColor=T.border}/>
          <div style={{fontSize:10,color:T.textGhost,marginTop:3,textAlign:"right"}}>{form.bio.length}/150</div>
        </div>
        {/* Experience */}
        <div style={{marginBottom:18}}>
          <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("experience",lang)}</label>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {EXPERIENCES.map(e=>(
              <button key={e} onClick={()=>up("experience",e)} className="press"
                style={{padding:"8px 14px",borderRadius:T.rPill,background:form.experience===e?T.gradSaff:T.white,
                  color:form.experience===e?"#fff":T.textMid,border:`1.5px solid ${form.experience===e?T.saff:T.border}`,
                  fontSize:13,fontWeight:form.experience===e?700:400,cursor:"pointer"}}>
                {e}
              </button>
            ))}
          </div>
        </div>
        {/* Multi-specialty edit */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <label style={{fontSize:12,fontWeight:600,color:T.textMid,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("specialties",lang)}</label>
            <Tag color={T.saff} bg={T.saffGhost}>{form.specialties.length} selected</Tag>
          </div>
          <div style={{padding:"10px 12px",background:T.goldGhost,borderRadius:T.rMd,border:`1px solid ${T.borderGold}`,marginBottom:10,fontSize:12,color:T.goldD,display:"flex",gap:6,alignItems:"center"}}>
            <I.Info size={13} color={T.goldD} accent={T.gold}/>
            {S("selectMultiple",lang)} — tap to toggle
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {SPECIALTIES.map(sp=>{
              const sel=form.specialties.includes(sp.id);
              return (
                <button key={sp.id} onClick={()=>toggleSpecialty(sp.id)} className="press"
                  style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",borderRadius:T.rMd,
                    background:sel?"linear-gradient(135deg,#fff,#FEF3E8)":T.white,
                    border:`2px solid ${sel?T.saff:T.borderL}`,cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
                  <span style={{fontSize:18,flexShrink:0}}>{sp.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:sel?700:500,fontSize:13,color:sel?T.saffD:T.textMid}}>{sp.label}</div>
                    <div style={{fontSize:10,color:T.textGhost}}>{sp.desc}</div>
                  </div>
                  {sel?<I.Check size={16} color={T.saff}/>:<div style={{width:18,height:18,borderRadius:"50%",border:`1.5px solid ${T.borderL}`}}/>}
                </button>
              );
            })}
          </div>
          {/* Selected summary */}
          {form.specialties.length>0&&(
            <div style={{marginTop:10,padding:"9px 12px",background:T.saffGhost,borderRadius:T.rMd,border:`1px solid ${T.saffL}44`}}>
              <div style={{fontSize:11,color:T.saffD,fontWeight:600,marginBottom:5}}>Your specialties ({form.specialties.length}):</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {form.specialties.map(id=><SpecialtyChip key={id} id={id}/>)}
              </div>
            </div>
          )}
        </div>
        <Btn fullWidth variant="saff" size="lg" onClick={()=>{setSaved(true);showToast("Profile saved!")}}>
          {saved?S("saved",lang):S("save",lang)}
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// AVAILABILITY SETTINGS
// ═══════════════════════════════════════════════════════════════════════
function AvailabilityScreen({onBack,lang,showToast}) {
  const [days,setDays]=useState(TAILOR_SELF.workingDays);
  const [openTime,setOpenTime]=useState("10:00");
  const [closeTime,setCloseTime]=useState("20:00");
  const [tempClosed,setTempClosed]=useState(false);
  const [resumeDate,setResumeDate]=useState("");
  const [radius,setRadius]=useState(TAILOR_SELF.serviceRadius);

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("availability",lang)} onBack={onBack}
        right={<Btn variant="saff" size="sm" onClick={()=>showToast("Availability saved!")}>Save</Btn>}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        {/* Working days */}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("workingDays",lang)}</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(days).map(([day,on])=>(
              <button key={day} onClick={()=>setDays(d=>({...d,[day]:!d[day]}))} className="press"
                style={{padding:"9px 12px",borderRadius:T.rPill,background:on?T.gradSaff:T.white,
                  color:on?"#fff":T.textMid,border:`1.5px solid ${on?T.saff:T.border}`,
                  fontSize:13,fontWeight:on?700:400,cursor:"pointer",transition:"all .2s"}}>
                {day}
              </button>
            ))}
          </div>
        </div>
        {/* Hours */}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("workingHours",lang)}</label>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:T.textGhost,marginBottom:4}}>OPENS AT</div>
              <input type="time" value={openTime} onChange={e=>setOpenTime(e.target.value)}
                style={{width:"100%",padding:"12px 12px",borderRadius:T.rMd,border:`1.5px solid ${T.border}`,fontSize:15,fontFamily:"'DM Mono',monospace",color:T.plumD,outline:"none",background:T.white}}
                onFocus={e=>e.target.style.borderColor=T.saff} onBlur={e=>e.target.style.borderColor=T.border}/>
            </div>
            <span style={{color:T.textMuted,fontWeight:600,flexShrink:0,marginTop:14}}>to</span>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:T.textGhost,marginBottom:4}}>CLOSES AT</div>
              <input type="time" value={closeTime} onChange={e=>setCloseTime(e.target.value)}
                style={{width:"100%",padding:"12px 12px",borderRadius:T.rMd,border:`1.5px solid ${T.border}`,fontSize:15,fontFamily:"'DM Mono',monospace",color:T.plumD,outline:"none",background:T.white}}
                onFocus={e=>e.target.style.borderColor=T.saff} onBlur={e=>e.target.style.borderColor=T.border}/>
            </div>
          </div>
        </div>
        {/* Service radius */}
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("serviceRadius",lang)}</label>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {SERVICE_RADIUS.map(r=>(
              <button key={r} onClick={()=>setRadius(r)} className="press"
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",borderRadius:T.rMd,
                  background:radius===r?"linear-gradient(135deg,#fff,#FEF3E8)":T.white,
                  border:`1.5px solid ${radius===r?T.saff:T.borderL}`,cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
                <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${radius===r?T.saff:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {radius===r&&<div style={{width:10,height:10,borderRadius:"50%",background:T.saff}}/>}
                </div>
                <span style={{fontSize:13,fontWeight:radius===r?600:400,color:radius===r?T.saffD:T.textMid}}>{r}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Temporary close */}
        <Card style={{marginBottom:16,padding:"14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:tempClosed?12:0}}>
            <div>
              <div style={{fontWeight:600,fontSize:14,color:T.text}}>{S("temporaryClose",lang)}</div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Pause all new referrals temporarily</div>
            </div>
            <ToggleSwitch on={tempClosed} onToggle={()=>setTempClosed(t=>!t)}/>
          </div>
          {tempClosed&&(
            <div className="anim-slideDown">
              <label style={{fontSize:12,fontWeight:600,color:T.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"}}>{S("resumeDate",lang)}</label>
              <input type="date" value={resumeDate} onChange={e=>setResumeDate(e.target.value)}
                style={{width:"100%",padding:"12px 12px",borderRadius:T.rMd,border:`1.5px solid ${T.border}`,fontSize:15,fontFamily:"'DM Mono',monospace",color:T.plumD,outline:"none",background:T.white}}/>
            </div>
          )}
        </Card>
        {/* Festival blocking */}
        <div style={{padding:"11px 13px",background:T.goldGhost,borderRadius:T.rMd,border:`1px solid ${T.borderGold}`,marginBottom:16,display:"flex",gap:8,alignItems:"flex-start"}}>
          <I.Sparkle size={15} color={T.goldD} accent={T.gold} style={{flexShrink:0,marginTop:1}}/>
          <div style={{fontSize:12,color:T.goldD,lineHeight:1.6}}>
            <strong>Festival Busy Period:</strong> Navratri is 18 days away. Consider blocking availability 2 weeks before and setting extended delivery timelines for orders during festive season.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PROFILE SETTINGS HUB
// ═══════════════════════════════════════════════════════════════════════
function ProfileScreen({onNavigate,lang,onSignOut}) {
  const tailor=TAILOR_SELF;
  const [showSignOut,setShowSignOut]=useState(false);
  const [available,setAvailable]=useState(tailor.available);
  const {showToast}=useApp();

  const menuItems=[
    {Icon:I.Person,   label:S("editProfile",lang),  sub:"Name, area, bio, specialties, experience", screen:"edit-profile"},
    {Icon:I.Camera,   label:S("portfolio",lang),     sub:"Manage photos, service menu, AI tags",     screen:"portfolio"},
    {Icon:I.Settings, label:S("availability",lang),  sub:"Working days, hours, radius, temp close",  screen:"availability"},
    {Icon:I.Badge,    label:S("verificationStatus",lang), sub:"Registered → Verified → Pro",         screen:"verification"},
    {Icon:I.Crown,    label:S("subscription",lang),  sub:"Free / Basic / Pro plans",                 screen:"subscription"},
    {Icon:I.Chart,    label:S("analytics",lang),     sub:"Referrals, orders, avg value, trends",     screen:"analytics"},
    {Icon:I.Rupee,    label:S("commission",lang),    sub:"Commission model and monthly statement",    screen:"commission"},
    {Icon:I.Globe,    label:S("language",lang),      sub:`${LANG_META[lang]?.native||"English"} · Tap to change`, screen:"language"},
    {Icon:I.Lock,     label:S("privacy",lang),       sub:"Data consent, delete account",             screen:"privacy"},
    {Icon:I.Help,     label:S("helpFAQ",lang),       sub:"WhatsApp commands, FAQ, contact Wearify",  screen:"help"},
  ];

  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      {/* Hero */}
      <div className="noise weave" style={{background:T.gradHero,padding:"26px 18px 22px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:10}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(230,126,34,.22)",border:"2.5px solid rgba(230,126,34,.38)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:T.saffL}}>{tailor.initials}</div>
            <div>
              <div className="serif" style={{fontSize:21,fontWeight:700,color:T.onDark,fontStyle:"italic"}}>{tailor.name}</div>
              <div style={{fontSize:12,color:"rgba(253,248,240,.5)",marginTop:2}}>{mask(tailor.phone)}</div>
              <div style={{display:"flex",gap:7,marginTop:6}}>
                <BadgeChip badge={tailor.badge} lang={lang}/>
                <Tag style={{background:"rgba(253,248,240,.12)",color:"rgba(253,248,240,.65)",fontSize:10}}>{tailor.experience}</Tag>
              </div>
            </div>
          </div>
          {/* Multi-specialty display */}
          <div className="no-scroll" style={{display:"flex",gap:5,overflowX:"auto"}}>
            {tailor.specialties.map(id=>(
              <span key={id} style={{padding:"3px 10px",borderRadius:T.rPill,background:"rgba(230,126,34,.18)",border:"1px solid rgba(230,126,34,.28)",fontSize:10,fontWeight:600,color:T.saffL,whiteSpace:"nowrap",flexShrink:0}}>
                {specialtyLabel(id)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="zari"/>
      {/* Availability */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",background:T.white,borderBottom:`1px solid ${T.borderL}`}}>
        <div>
          <div style={{fontWeight:600,fontSize:14,color:T.text}}>{available?S("available",lang):S("unavailable",lang)}</div>
          <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Toggle to accept or pause new referrals</div>
        </div>
        <ToggleSwitch on={available} onToggle={()=>{setAvailable(a=>!a);showToast(available?"Paused — no new referrals":"Available — accepting referrals now");}}/>
      </div>
      {/* Menu */}
      <div className="no-scroll" style={{overflowY:"auto",padding:"8px 0 80px"}}>
        {menuItems.map((item,i)=>(
          <button key={i} onClick={()=>onNavigate(item.screen)}
            style={{width:"100%",display:"flex",gap:14,alignItems:"center",padding:"14px 18px",background:"none",border:"none",cursor:"pointer",borderBottom:`1px solid ${T.borderL}`,transition:"background .15s",textAlign:"left"}}
            onMouseEnter={e=>e.currentTarget.style.background=T.blush} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{width:40,height:40,borderRadius:T.rMd,background:T.plumGhost,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <item.Icon size={20} color={T.plumD} accent={T.gold}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14,color:T.text}}>{item.label}</div>
              <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>{item.sub}</div>
            </div>
            <I.ArrowRight size={16} color={T.textGhost}/>
          </button>
        ))}
        {/* Sign out */}
        <div style={{padding:"14px 18px 8px"}}>
          <button onClick={()=>setShowSignOut(true)} className="press"
            style={{width:"100%",padding:"13px",borderRadius:T.rPill,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:T.errorBg,border:`1px solid ${T.error}22`,cursor:"pointer"}}>
            <I.LogOut size={18}/>
            <span style={{fontSize:14,fontWeight:600,color:T.error}}>{S("signOut",lang)}</span>
          </button>
          <div style={{textAlign:"center",marginTop:12,fontSize:11,color:T.textGhost}}>{WEARIFY.logo} {WEARIFY.name} · {WEARIFY.company}</div>
        </div>
        {/* Sign-out dialog */}
        {showSignOut&&(
          <div onClick={()=>setShowSignOut(false)} style={{position:"fixed",inset:0,background:"rgba(13,4,24,.65)",backdropFilter:"blur(8px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div onClick={e=>e.stopPropagation()} className="anim-scaleIn"
              style={{background:T.white,borderRadius:T.rLg,padding:"26px 22px",maxWidth:320,width:"100%",boxShadow:T.shadowLg,textAlign:"center"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:T.errorBg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><I.LogOut size={24}/></div>
              <div className="serif" style={{fontSize:18,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:6}}>{S("signOut",lang)}?</div>
              <p style={{fontSize:13,color:T.textMuted,lineHeight:1.65,marginBottom:20}}>{S("signOutDesc",lang)}</p>
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
// LANGUAGE SELECTOR (9 languages · 3×3 grid)
// ═══════════════════════════════════════════════════════════════════════
function LanguageScreen({onBack,currentLang,onChangeLang}) {
  const [selected,setSelected]=useState(currentLang);
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("language",currentLang)} onBack={onBack}/>
      <div style={{padding:"28px 20px 24px"}}>
        <div className="serif" style={{fontSize:18,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:4}}>Choose Your Language</div>
        <div style={{fontSize:13,color:T.textMuted,marginBottom:24}}>Wearify Tailor is available in {Object.keys(LANG_META).length} languages.</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:28}}>
          {Object.entries(LANG_META).map(([code,meta])=>{
            const sel=selected===code;
            return (
              <button key={code} onClick={()=>setSelected(code)} className="press"
                style={{padding:"14px 8px",borderRadius:T.r,background:sel?"linear-gradient(135deg,#fff,#FEF3E8)":T.white,
                  border:`2px solid ${sel?T.saff:T.borderL}`,cursor:"pointer",textAlign:"center",
                  boxShadow:sel?T.shadowSaff:T.shadow,transition:"all .2s"}}>
                <div style={{fontSize:22,fontFamily:"Noto Sans,DM Sans,sans-serif",fontWeight:sel?700:500,color:sel?T.saffD:T.textMid,marginBottom:4}}>
                  {meta.native}
                </div>
                <div style={{fontSize:10,color:sel?T.saffD:T.textGhost,fontWeight:sel?600:400}}>{meta.label}</div>
                {sel&&<div style={{marginTop:5,display:"flex",justifyContent:"center"}}><I.Check size={12} color={T.saff}/></div>}
              </button>
            );
          })}
        </div>
        <Btn fullWidth variant="saff" size="lg" onClick={()=>{onChangeLang(selected);onBack();}}>
          Apply Language →
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DPDP & PRIVACY
// ═══════════════════════════════════════════════════════════════════════
function PrivacyScreen({onBack,lang,showToast}) {
  const [consents,setConsents]=useState({referralData:true,whatsapp:true,analytics:false});
  const toggle=(k)=>setConsents(c=>({...c,[k]:!c[k]}));
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("privacy",lang)} onBack={onBack}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        <div style={{padding:"12px 14px",background:T.tealGhost,borderRadius:T.rMd,border:`1px solid ${T.teal}22`,marginBottom:20,display:"flex",gap:8,alignItems:"flex-start"}}>
          <I.Lock size={16} color={T.teal} accent={T.gold} style={{flexShrink:0,marginTop:1}}/>
          <div style={{fontSize:12,color:T.teal,lineHeight:1.6}}>Your data is handled under India's <strong>DPDP Act 2023</strong>. You control what is collected and can delete your data anytime.</div>
        </div>
        {[
          {key:"referralData",label:"Referral & Profile Data",sub:"Name, specialties, city, service menu shared with customers for matching. Required for the platform to work.",required:true},
          {key:"whatsapp",    label:"WhatsApp Notifications",sub:"New referrals, order updates, commission statements, and coaching tips via WhatsApp.",required:false},
          {key:"analytics",   label:"Performance Analytics",sub:"Anonymous usage data to improve the Wearify platform. No personal data shared.",required:false},
        ].map(({key,label,sub,required})=>(
          <Card key={key} style={{marginBottom:12,padding:"14px"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:T.text,marginBottom:2}}>{label}</div>
                <div style={{fontSize:12,color:T.textMuted,lineHeight:1.5}}>{sub}</div>
                {required&&<div style={{marginTop:4}}><Tag color={T.plumL} small>Required</Tag></div>}
              </div>
              <ToggleSwitch on={consents[key]} onToggle={required?undefined:()=>toggle(key)} disabled={required}/>
            </div>
          </Card>
        ))}
        <div style={{padding:"12px 14px",background:T.blush,borderRadius:T.rMd,border:`1px solid ${T.borderL}`,marginBottom:16,fontSize:12,color:T.textMid,lineHeight:1.6}}>
          📐 <strong>Measurement Data Note:</strong> Customer body measurements shared to you via referrals are sensitive personal data under DPDP. They are encrypted, shared only with your explicit referral, and must not be retained or shared further. Customers can request deletion at any time.
        </div>
        <Btn fullWidth variant="ivory" size="md" style={{marginBottom:10}} onClick={()=>showToast("Data export requested. You'll receive it on WhatsApp.")}>
          Download My Data
        </Btn>
        <Btn fullWidth variant="danger" size="md" onClick={()=>showToast("Account deletion request submitted. 30-day grace period applies.")}>
          Delete My Account
        </Btn>
        <div style={{textAlign:"center",marginTop:12,fontSize:11,color:T.textGhost}}>Account deletion takes 30 days. All your data will be permanently removed.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// WHATSAPP COMMANDS HELP
// ═══════════════════════════════════════════════════════════════════════
function WACommandsScreen({onBack,lang}) {
  const commands=[
    {cmd:"READY [order#]",  desc:"Mark an order as Ready for Pickup",    eg:"READY ORD001"},
    {cmd:"DONE [order#]",   desc:"Mark an order as Delivered",           eg:"DONE ORD001"},
    {cmd:"PAUSE",           desc:"Temporarily stop receiving referrals", eg:"PAUSE"},
    {cmd:"RESUME",          desc:"Start accepting referrals again",      eg:"RESUME"},
    {cmd:"STATEMENT",       desc:"Get your monthly commission statement",eg:"STATEMENT"},
    {cmd:"HELP",            desc:"Get a list of all commands",           eg:"HELP"},
  ];
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("waCommands",lang)} onBack={onBack}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"20px 16px 96px"}}>
        <div style={{padding:"12px 14px",background:"#ECF8EC",borderRadius:T.rMd,border:"1px solid rgba(37,211,102,.2)",marginBottom:18,display:"flex",gap:8,alignItems:"flex-start"}}>
          <I.WA size={18} color="#25D366" style={{flexShrink:0,marginTop:1}}/>
          <div style={{fontSize:12,color:"#1B5E20",lineHeight:1.65}}>
            <strong>WhatsApp-first design:</strong> All critical Wearify actions work via WhatsApp. You never need to open the app to manage your orders.
            <br/><br/>Send commands to: <strong style={{fontFamily:"'DM Mono',monospace"}}>+91-WEARIFY-BOT</strong>
          </div>
        </div>
        {commands.map(({cmd,desc,eg},i)=>(
          <Card key={i} className={`anim-slideUp d${Math.min(i+1,5)}`} style={{marginBottom:10,padding:"13px 14px"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:15,color:T.plumD,marginBottom:4}}>{cmd}</div>
            <div style={{fontSize:13,color:T.textMid,marginBottom:8}}>{desc}</div>
            <div style={{padding:"7px 12px",background:"#ECF8EC",borderRadius:T.rSm}}>
              <span style={{fontSize:11,color:"#1B5E20",fontFamily:"'DM Mono',monospace"}}>Example: </span>
              <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",fontWeight:600,color:"#1B5E20"}}>{eg}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HELP & FAQ
// ═══════════════════════════════════════════════════════════════════════
function HelpScreen({onBack,lang}) {
  const [open,setOpen]=useState(null);
  const faqs=[
    {q:"How does the commission work?",a:"Wearify charges ₹50 per completed referral (₹100 for bridal/premium orders). Your first 5 referrals are commission-free. Commission is collected monthly via UPI — no upfront payment required."},
    {q:"When will my profile go live?",a:"After you complete registration, Wearify reviews your portfolio within 48 hours. You'll receive a WhatsApp notification with the outcome. Rejected profiles get feedback for resubmission."},
    {q:"Can I manage everything via WhatsApp?",a:"Yes! You can mark orders as ready, pause/resume referrals, get your monthly statement, and receive all updates without opening the app. See WhatsApp Commands for the full list."},
    {q:"How are customer measurements protected?",a:"Measurements are encrypted (AES-256) and shared only with your explicit referral. Customers can revoke consent at any time. You must not retain or share measurements beyond the specific order they were shared for."},
    {q:"What happens if there's a dispute?",a:"Step 1: Resolve directly with the customer on WhatsApp. Step 2: If unresolved, either party can raise it via the app — Wearify admin reviews within 5 business days. Wearify does not guarantee outcomes, but monitors quality signals."},
    {q:"How do I add multiple specialties?",a:"During registration (Step 2) or via Profile → Edit Profile, tap as many specialties as apply to your work. All selected specialties are displayed on your profile and used for customer matching."},
    {q:"What is the Gold Tailor rate?",a:"Tailors with more than 20 referrals per month and an average rating of 4.5 or above earn Gold Tailor status, which reduces commission to ₹35 per referral as a loyalty reward."},
    {q:"How do I get the Verified or Pro badge?",a:"Verified badge: Complete your portfolio (4+ photos) and pass the Wearify admin review (within 48 hours). Pro badge: Aadhaar verification + 10+ reviews + 4.5 avg rating + 6 months active. Badges are never pay-to-play."},
  ];
  return (
    <div className="anim-pageIn" style={{minHeight:"100%",background:T.ivory}}>
      <ScreenHeader title={S("helpFAQ",lang)} onBack={onBack}/>
      <div className="no-scroll" style={{overflowY:"auto",padding:"16px 16px 96px"}}>
        {faqs.map((faq,i)=>(
          <div key={i} style={{marginBottom:8,borderRadius:T.rMd,overflow:"hidden",boxShadow:T.shadow,border:`1px solid ${T.borderL}`}}>
            <button onClick={()=>setOpen(open===i?null:i)}
              style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:open===i?T.plumGhost:T.white,border:"none",cursor:"pointer",textAlign:"left",transition:"background .15s"}}>
              <span style={{fontWeight:600,fontSize:14,color:T.plumD,flex:1,lineHeight:1.4,paddingRight:8}}>{faq.q}</span>
              <span style={{color:T.plumL,fontSize:18,flexShrink:0,transform:open===i?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
            </button>
            {open===i&&(
              <div className="anim-slideDown" style={{padding:"0 16px 14px",background:T.white,fontSize:13,color:T.textMid,lineHeight:1.7}}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
        {/* WA escalation */}
        <div style={{marginTop:16,padding:"13px 14px",background:"#ECF8EC",borderRadius:T.r,border:"1px solid rgba(37,211,102,.2)"}}>
          <div style={{fontWeight:700,fontSize:13,color:"#1B5E20",marginBottom:6}}>Still need help?</div>
          <div style={{fontSize:12,color:"#2E7D32",marginBottom:12}}>Chat with Wearify support on WhatsApp. Average response: under 2 hours.</div>
          <Btn fullWidth variant="wa" size="md" onClick={()=>window.open("https://wa.me/919876500000?text=Hi Wearify Support","_blank")}>
            <I.WA size={17}/> Chat with Wearify Support
          </Btn>
        </div>
        {/* WA Commands link */}
        <div style={{marginTop:10,textAlign:"center"}}>
          <button style={{background:"none",border:"none",color:T.plumL,fontSize:13,fontWeight:600,cursor:"pointer"}}>
            View WhatsApp Commands Guide →
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════════════
function AppShell() {
  const [authStep,setAuthStep]=useState("otp"); // "otp" | "wizard" | "wizard-complete" | "app"
  const [screen,setScreen]=useState("home");
  const [activeTab,setActiveTab]=useState("home");
  const [detailData,setDetailData]=useState(null);
  const [lang,setLang]=useState(()=>{
    try{return localStorage.getItem("wearify_tailor_lang")||detectLang();}catch(e){return detectLang();}
  });
  const [toast,setToast]=useState({msg:"",visible:false});

  const showToast=useCallback((msg)=>{
    setToast({msg,visible:true});setTimeout(()=>setToast({msg:"",visible:false}),2400);
  },[]);

  const changeLang=(l)=>{
    setLang(l);
    try{localStorage.setItem("wearify_tailor_lang",l);}catch(e){}
  };

  const navigate=useCallback((scr,data=null)=>{
    if(data!==null)setDetailData(data);
    setScreen(scr);
    if(["home","referrals","orders","profile"].includes(scr))setActiveTab(scr);
    window.scrollTo&&window.scrollTo(0,0);
  },[]);

  const goBack=useCallback(()=>{
    const backs={
      "referral-detail":"referrals","referrals":"home",
      "order-detail":"orders","orders":"home","create-order":"orders",
      "portfolio":"profile","edit-profile":"profile","availability":"profile",
      "verification":"profile","subscription":"profile","analytics":"profile",
      "commission":"profile","statement":"profile","payment-guide":"profile",
      "language":"profile","privacy":"profile","help":"profile","wa-commands":"help",
      "ratings":"profile",
    };
    setScreen(backs[screen]||"home");
  },[screen]);

  const handleSignOut=()=>{setAuthStep("otp");setScreen("home");};
  const newRefCount=REFERRALS.filter(r=>r.status==="new").length;
  const ctx={showToast};

  // ── Auth states ──
  if(authStep==="otp") return (
    <AppCtx.Provider value={ctx}>
      <div id="tailor-root">
        <GlobalStyles/>
        <Toast msg={toast.msg} visible={toast.visible}/>
        <div className="pwa-shell">
          <div className="screen-area">
            <AuthScreen onComplete={()=>setAuthStep("wizard")} lang={lang} onLangChange={changeLang}/>
          </div>
        </div>
      </div>
    </AppCtx.Provider>
  );

  if(authStep==="wizard") return (
    <AppCtx.Provider value={ctx}>
      <div id="tailor-root">
        <GlobalStyles/>
        <Toast msg={toast.msg} visible={toast.visible}/>
        <div className="pwa-shell">
          <div className="screen-area">
            <OnboardingWizard onComplete={()=>setAuthStep("wizard-complete")} lang={lang}/>
          </div>
        </div>
      </div>
    </AppCtx.Provider>
  );

  if(authStep==="wizard-complete") return (
    <AppCtx.Provider value={ctx}>
      <div id="tailor-root">
        <GlobalStyles/>
        <Toast msg={toast.msg} visible={toast.visible}/>
        <div className="pwa-shell">
          <div className="screen-area">
            <RegistrationCompleteScreen onGoToDashboard={()=>setAuthStep("app")} lang={lang}/>
          </div>
        </div>
      </div>
    </AppCtx.Provider>
  );

  // ── Main app ──
  const showNav=!["referral-detail","order-detail","create-order","portfolio","edit-profile",
    "availability","verification","subscription","analytics","commission","statement",
    "payment-guide","language","privacy","help","wa-commands","ratings"].includes(screen);

  const renderScreen=()=>{
    switch(screen){
      case "home":            return <HomeScreen onNavigate={navigate} lang={lang}/>;
      case "referrals":       return <ReferralsScreen onNavigate={navigate} onBack={()=>setScreen("home")} lang={lang}/>;
      case "referral-detail": return <ReferralDetailScreen ref_={detailData} onBack={goBack} lang={lang} showToast={showToast}/>;
      case "orders":          return <OrdersScreen onNavigate={navigate} onBack={()=>setScreen("home")} lang={lang}/>;
      case "order-detail":    return <OrderDetailScreen order={detailData} onBack={goBack} lang={lang} showToast={showToast}/>;
      case "create-order":    return <CreateOrderScreen onBack={goBack} lang={lang} showToast={showToast}/>;
      case "portfolio":       return <PortfolioScreen onBack={goBack} lang={lang} showToast={showToast}/>;
      case "edit-profile":    return <EditProfileScreen onBack={goBack} lang={lang} showToast={showToast}/>;
      case "availability":    return <AvailabilityScreen onBack={goBack} lang={lang} showToast={showToast}/>;
      case "verification":    return <VerificationScreen onBack={goBack} lang={lang}/>;
      case "subscription":    return <SubscriptionScreen onBack={goBack} lang={lang} showToast={showToast}/>;
      case "analytics":       return <AnalyticsScreen onBack={goBack} lang={lang}/>;
      case "commission":      return <CommissionScreen onBack={goBack} lang={lang}/>;
      case "statement":       return <StatementScreen onBack={goBack} lang={lang} showToast={showToast}/>;
      case "ratings":         return <RatingsScreen onBack={goBack} lang={lang} onNavigate={navigate}/>;
      case "language":        return <LanguageScreen onBack={goBack} currentLang={lang} onChangeLang={changeLang}/>;
      case "privacy":         return <PrivacyScreen onBack={goBack} lang={lang} showToast={showToast}/>;
      case "help":            return <HelpScreen onBack={goBack} lang={lang}/>;
      case "wa-commands":     return <WACommandsScreen onBack={goBack} lang={lang}/>;
      case "profile":         return <ProfileScreen onNavigate={navigate} lang={lang} onSignOut={handleSignOut}/>;
      default:                return <HomeScreen onNavigate={navigate} lang={lang}/>;
    }
  };

  return (
    <AppCtx.Provider value={ctx}>
      <div id="tailor-root">
        <GlobalStyles/>
        <Toast msg={toast.msg} visible={toast.visible}/>
        <div className="pwa-shell">
          <div className="screen-area">
            {renderScreen()}
          </div>
          {showNav&&(
            <BottomNav active={activeTab} onChange={t=>{setActiveTab(t);navigate(t);}} lang={lang} newRefCount={newRefCount}/>
          )}
          {/* Lang FAB — visible on Home */}
          {screen==="home"&&(
            <button onClick={()=>navigate("language")} className="press anim-popIn"
              style={{position:"fixed",bottom:90,right:16,width:46,height:46,borderRadius:"50%",
                background:T.gradHero,border:"2px solid rgba(230,126,34,.4)",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 4px 16px rgba(26,10,46,.4)",zIndex:99}}>
              <span style={{fontSize:13,fontWeight:700,color:T.goldL,fontFamily:"Noto Sans,DM Sans,sans-serif"}}>
                {LANG_META[lang]?.native?.slice(0,2)||"EN"}
              </span>
            </button>
          )}
        </div>
      </div>
    </AppCtx.Provider>
  );
}

export default AppShell;
