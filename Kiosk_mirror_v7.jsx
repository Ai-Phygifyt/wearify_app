import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

/* ═══ TOKENS — 55" Portrait (2160×3840) ═══ */
var T = {
  ivory:'#FDF8F2', maroon:'#7B1D1D', maroonDk:'#5A1515',
  gold:'#C9941A', goldLt:'#E8C462', rose:'#F2D4D4', roseDk:'#E5B8B8',
  dark:'#1A0A0A', darkSoft:'#3A2A2A', border:'#EDD5D5',
  white:'#FFFFFF', black:'#000000', green:'#2D6B3F', greenLt:'#E8F5E9',
  red:'#C62828', grey:'#8A7E7E', greyLt:'#F5F0EB', greyMid:'#C4B8B8',
  head:"'Montserrat',sans-serif", body:"'Roboto',sans-serif",
  mono:"'Roboto Mono',monospace",
  pill:'100vw', card:'2vw',
  sh:'0 .4vmin 1.5vmin rgba(26,10,10,.08)',
  shM:'0 .8vmin 3vmin rgba(26,10,10,.12)',
  shL:'0 1.2vmin 5vmin rgba(26,10,10,.16)',
};

var CFG = {
  store:'Mauve', logo:'Mauve', powered:'Powered by Wearify',
  copy:'© Phygify Technoservices Pvt. Ltd.',
  tabletCode:'123456', otpDemo:'123456', staffPIN:'1234',
  maxTrial: 5, maxWardrobe: 10, maxWAShares: 5,
  tryOnSec: 180, otpSec: 60, inactivitySec: 300, /* #4: 5min auto-logout */
  scanValidMonths: 6,
};

/* ═══ DATA ═══ */
var CAT = [
  {id:'S01',name:'Royal Kanjivaram Silk',fab:'Pure Silk',occ:['Wedding'],price:18500,mrp:22000,colors:['#8B0000','#1B4965','#C9941A'],img:'https://picsum.photos/seed/k1/400/600',cat:'Bridal',desc:'Handwoven Kanjivaram with temple border.'},
  {id:'S02',name:'Emerald Banarasi',fab:'Pure Silk',occ:['Bridal'],price:24500,mrp:28000,colors:['#2D5A1B','#8B0000'],img:'https://picsum.photos/seed/b1/400/600',cat:'Bridal',desc:'Luxurious Banarasi with meenakari weave.'},
  {id:'S03',name:'Ruby Chanderi',fab:'Chanderi',occ:['Festive'],price:8500,mrp:10000,colors:['#9B1B30','#C9941A'],img:'https://picsum.photos/seed/c1/400/600',cat:'Festive',desc:'Lightweight Chanderi with zari border.'},
  {id:'S04',name:'Mustard Bandhani',fab:'Georgette',occ:['Festive'],price:4800,mrp:5600,colors:['#D4A017','#C62828'],img:'https://picsum.photos/seed/bn1/400/600',cat:'Festive',desc:'Vibrant Bandhani on georgette.'},
  {id:'S05',name:'Blush Organza',fab:'Organza',occ:['Party'],price:5500,mrp:6800,colors:['#F2D4D4','#4A0E4E'],img:'https://picsum.photos/seed/o1/400/600',cat:'Party',desc:'Sheer organza with sequin scatter.'},
  {id:'S06',name:'Midnight Satin',fab:'Satin',occ:['Party'],price:7200,mrp:8500,colors:['#1A0A2E','#C9941A'],img:'https://picsum.photos/seed/st1/400/600',cat:'Party',desc:'Luxe satin with crystal border.'},
  {id:'S07',name:'Sage Cotton',fab:'Cotton',occ:['Casual'],price:850,mrp:1100,colors:['#8B9E7B','#5A3E2B'],img:'https://picsum.photos/seed/ct1/400/600',cat:'Casual',desc:'Breathable handloom cotton.'},
  {id:'S08',name:'Indigo Khadi',fab:'Khadi',occ:['Casual'],price:950,mrp:1200,colors:['#2C3E6B','#FDF8F2'],img:'https://picsum.photos/seed/kh1/400/600',cat:'Casual',desc:'Natural indigo-dyed khadi.'},
];
var CATS_L = [{id:'Bridal',img:'https://picsum.photos/seed/cBr/300/200'},{id:'Festive',img:'https://picsum.photos/seed/cFe/300/200'},{id:'Party',img:'https://picsum.photos/seed/cPa/300/200'},{id:'Casual',img:'https://picsum.photos/seed/cCa/300/200'}];
var TAILORS = [{id:'T1',name:'Priya Sharma',spec:'Bridal Blouses',rating:4.8,rev:84,dist:'1.2 km',loc:'T.Nagar, Chennai',exp:'15 years',img:'https://picsum.photos/seed/tl1/200/200',portfolio:['https://picsum.photos/seed/tp1/300/400','https://picsum.photos/seed/tp2/300/400','https://picsum.photos/seed/tp3/300/400','https://picsum.photos/seed/tp4/300/400']},{id:'T2',name:'Meena Devi',spec:'Festival Wear',rating:4.6,rev:62,dist:'2.5 km',loc:'Mylapore, Chennai',exp:'12 years',img:'https://picsum.photos/seed/tl2/200/200',portfolio:['https://picsum.photos/seed/tp5/300/400','https://picsum.photos/seed/tp6/300/400']}];
var LANGS = [{c:'en',n:'English',v:'English'},{c:'hi',n:'Hindi',v:'हिंदी'},{c:'mr',n:'Marathi',v:'मराठी'},{c:'kn',n:'Kannada',v:'ಕನ್ನಡ'},{c:'ta',n:'Tamil',v:'தமிழ்'},{c:'te',n:'Telugu',v:'తెలుగు'},{c:'bn',n:'Bengali',v:'বাংলা'},{c:'gu',n:'Gujarati',v:'ગુજરાતી'},{c:'ml',n:'Malayalam',v:'മലయాളം'}];
var TABLET_SHORTLIST = CAT.slice(0, 3);

/* ═══ STRINGS ═══ */
var STR = {
  cont:{en:'Continue'},enterOTP:{en:'Enter OTP'},wrongOTP:{en:'Incorrect OTP.'},
  badPhone:{en:'Valid 10-digit number required'},enterPh:{en:'Enter mobile number'},
  staffHelp:{en:'Need help? Ask staff'},search:{en:'Search saree...'},
  trending:{en:'Trending Now'},shopCat:{en:'Categories'},newArr:{en:'New Arrivals'},
  similar:{en:'Similar Sarees'},consent:{en:'Start Your Try-On'},
  consentB:{en:'Photo processed by on-device AI. Images saved securely. Delete anytime.'},
  allow:{en:'Allow'},cancel:{en:'Cancel'},digiLook:{en:'Create Your Digital Look'},
  standIn:{en:'Stand inside the frame'},capture:{en:'Capture My Look'},
  voiceCapture:{en:'Or say "Capture" for voice'},
  creating:{en:'Creating your look...'},secure:{en:'Securely saved'},
  addWard:{en:'Add to Wardrobe'},myWard:{en:'My Wardrobe'},sarees:{en:'Sarees'},
  remove:{en:'Remove'},orderSum:{en:'Your Cart'},showTeam:{en:'Show to store team'},
  indPrice:{en:'Prices indicative. Final at counter.'},findTailor:{en:'Find Tailor'},
  checkout:{en:'Proceed to Checkout'},whatsapp:{en:'Share on WhatsApp'},
  feedback:{en:'Feedback'},submit:{en:'Submit'},thanks:{en:'Thank you!'},
  saveLooks:{en:'Save your looks?'},saveBody:{en:'Saved to Wearify profile.'},
  save:{en:'Save'},delAll:{en:'Delete All'},sessEnd:{en:'Session Ended'},
  privProt:{en:'Your privacy is protected.'},endSessQ:{en:'End Session?'},
  endSessB:{en:'Session ending. Log out?'},contTry:{en:'Continue'},
  logout:{en:'Logout'},home:{en:'Home'},from:{en:'from'},colors:{en:'Colors'},
  shortlisted:{en:'Shortlisted Sarees'},
  confirmNum:{en:'Confirm your number'},confirmNumB:{en:'OTP will be sent to:'},
  yes:{en:'Yes, Send OTP'},edit:{en:'Edit Number'},
  trialRoom:{en:'Trial Room'},sendToTrial:{en:'Send to Trial Room'},
  shortlistTrial:{en:'Shortlist for Trial Room'},
  trialFull:{en:'Max 5 sarees per trial batch. Remove one to add new.'},
  alreadyTrial:{en:'Already in Trial Room'},alreadyWard:{en:'Already in Wardrobe'},
  filter:{en:'Filter'},clearAll:{en:'Clear All'},apply:{en:'Apply'},
  resendOTP:{en:'Resend OTP'},haveCode:{en:'Store code?'},newCust:{en:'Phone login'},
  specialForYou:{en:'Specially Designed for You'},
  waConsent:{en:'Selected images will be shared via WhatsApp. Do you consent?'},
  tailorConsent:{en:'Reference code and items will be shared with tailor via Wearify WhatsApp. Consent?'},
  refCode:{en:'Reference Code'},viaWearify:{en:'Sent via Wearify WhatsApp'},
  moveToCart:{en:'Move to Cart'},scanBarcode:{en:'Scan Barcode'},
  removeFromWard:{en:'Also remove from wardrobe?'},
  shareLimit:{en:'Daily share limit reached'},
  qty:{en:'Qty'},selected:{en:'Selected'},
};
function S(k) { var e = STR[k]; return e ? (e.en || k) : k; }
function fmtP(n) { if (!n) return ''; var s = Math.round(n).toString(); if (s.length <= 3) return s; return s.slice(0,-3).replace(/\B(?=(\d{2})+(?!\d))/g,',') + ',' + s.slice(-3); }
function calcGST(p) { return p <= 1000 ? p * 0.05 : p * 0.12; }
function genTok() { var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = ''; for (var i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)]; return r; }

/* ═══ STYLES ═══ */
function GS() {
  useEffect(function() {
    if (document.getElementById('wk')) return;
    var s = document.createElement('style'); s.id = 'wk';
    s.textContent = "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&display=swap');" +
      "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}" +
      "html,body,#root{width:100vw;height:100vh;overflow:hidden;background:" + T.ivory + "}" +
      "body{font-family:" + T.body + ";color:" + T.dark + ";user-select:none}" +
      "@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}" +
      "@keyframes slideUp{from{opacity:0;transform:translateY(4vh)}to{opacity:1;transform:translateY(0)}}" +
      "@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}" +
      "@keyframes scanLine{0%{top:0}50%{top:90%}100%{top:0}}" +
      "@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}" +
      "@keyframes bounceIn{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.05);opacity:1}100%{transform:scale(1)}}" +
      "::-webkit-scrollbar{width:.5vw}::-webkit-scrollbar-thumb{background:" + T.roseDk + ";border-radius:100vw}";
    document.head.appendChild(s);
  }, []);
  return null;
}

/* ═══ ICONS ═══ */
function Ic(p) { return <svg viewBox={p.vb||"0 0 24 24"} fill="none" style={{width:p.size||'3vw',height:p.size||'3vw',flexShrink:0,...(p.style||{})}}>{p.children}</svg>; }
function IBack(p){var c=p.color||T.maroon;return <Ic {...p}><path d="M15 19l-7-7 7-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Ic>;}
function IHome(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><path d="M3 10.5L12 3l9 7.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke={c} strokeWidth="1.5"/><circle cx="12" cy="13" r="1.5" fill={a}/></Ic>;}
function ILogout(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M16 17l5-5-5-5" stroke={a} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12H9" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></Ic>;}
function ISearch(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><circle cx="10.5" cy="10.5" r="6" stroke={c} strokeWidth="1.8"/><path d="M15 15l5 5" stroke={a} strokeWidth="2" strokeLinecap="round"/></Ic>;}
function IFilter(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><path d="M3 6h18M6 12h12M9 18h6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><circle cx="8" cy="6" r="1.5" fill={a}/></Ic>;}
function IStarF(p){var a=p.accent||T.gold;return <Ic {...p}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={a}/></Ic>;}
function IStar(p){var c=p.color||T.maroon;return <Ic {...p}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={c} strokeWidth="1.5" fill="none"/></Ic>;}
function ICamera(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={c} strokeWidth="1.5"/><circle cx="12" cy="13" r="4" stroke={a} strokeWidth="1.5"/></Ic>;}
function IShield(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="1.5" fill="none"/><path d="M9 12l2 2 4-4" stroke={a} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Ic>;}
function IClose(p){var c=p.color||T.maroon;return <Ic {...p}><path d="M18 6L6 18M6 6l12 12" stroke={c} strokeWidth="2" strokeLinecap="round"/></Ic>;}
function ICheck(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" fill="none"/><path d="M8 12l3 3 5-5" stroke={a} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Ic>;}
function ICart(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={c} strokeWidth="1.5" fill="none"/><path d="M3 6h18" stroke={c} strokeWidth="1.5"/><path d="M16 10a4 4 0 01-8 0" stroke={a} strokeWidth="1.8" strokeLinecap="round"/></Ic>;}
function IWA(p){var c=p.color||'#25D366';return <Ic {...p}><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke={c} strokeWidth="1.3" fill="none"/></Ic>;}
function IQR(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><rect x="3" y="3" width="7" height="7" rx="1" stroke={c} strokeWidth="1.5" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1" stroke={c} strokeWidth="1.5" fill="none"/><rect x="3" y="14" width="7" height="7" rx="1" stroke={c} strokeWidth="1.5" fill="none"/><rect x="5" y="5" width="3" height="3" fill={a}/><rect x="16" y="5" width="3" height="3" fill={a}/><rect x="5" y="16" width="3" height="3" fill={a}/></Ic>;}
function IPhone(p){var c=p.color||T.grey;return <Ic {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z" stroke={c} strokeWidth="1.5" fill="none"/></Ic>;}
function IHanger(p){var c=p.color||T.maroon;return <Ic {...p}><path d="M12 2a2 2 0 00-2 2c0 .74.4 1.39 1 1.73V7L3 14v2h18v-2L13 7V5.73A2 2 0 0012 2z" stroke={c} strokeWidth="1.5" fill="none"/></Ic>;}
function ITrial(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><rect x="4" y="3" width="16" height="18" rx="2" stroke={c} strokeWidth="1.5" fill="none"/><circle cx="12" cy="10" r="3" stroke={a} strokeWidth="1.5" fill="none"/><path d="M8 21h8" stroke={c} strokeWidth="1.5"/></Ic>;}
function IChevR(p){var c=p.color||T.maroon;return <Ic {...p}><path d="M9 18l6-6-6-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Ic>;}
function IChevL(p){var c=p.color||T.maroon;return <Ic {...p}><path d="M15 18l-6-6 6-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></Ic>;}
function IMic(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><rect x="9" y="1" width="6" height="12" rx="3" stroke={c} strokeWidth="1.5" fill="none"/><path d="M5 10a7 7 0 0014 0" stroke={a} strokeWidth="1.5" strokeLinecap="round"/><path d="M12 17v4m-3 0h6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></Ic>;}
function IBarcode(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><rect x="3" y="4" width="2" height="16" fill={c}/><rect x="7" y="4" width="1" height="16" fill={a}/><rect x="10" y="4" width="2" height="16" fill={c}/><rect x="14" y="4" width="1" height="16" fill={a}/><rect x="17" y="4" width="1.5" height="16" fill={c}/></Ic>;}
function IScissors(p){var c=p.color||T.maroon,a=p.accent||T.gold;return <Ic {...p}><circle cx="6" cy="6" r="3" stroke={c} strokeWidth="1.5" fill="none"/><circle cx="6" cy="18" r="3" stroke={c} strokeWidth="1.5" fill="none"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" stroke={a} strokeWidth="1.8" strokeLinecap="round"/></Ic>;}
function IPlus(p){var c=p.color||T.maroon;return <Ic {...p}><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/></Ic>;}
function IMinus(p){var c=p.color||T.maroon;return <Ic {...p}><path d="M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/></Ic>;}

/* ═══ CONTEXT ═══ */
var Ctx = createContext({});
function useS() { return useContext(Ctx); }

/* ═══ PRIMITIVES ═══ */
function GoldDiv(p) { return <div style={{width:p.w||'90%',height:'1px',margin:'1vh auto',background:'linear-gradient(90deg,transparent,'+T.gold+',transparent)'}}/>; }
function Btn(p) {
  var d = p.disabled, v = p.v || 'primary';
  var sz = {sm:{padding:'1vh 3vw',fontSize:'1.6vmin'},md:{padding:'1.5vh 5vw',fontSize:'1.8vmin'},lg:{padding:'2vh 7vw',fontSize:'2.2vmin'}}[p.sz||'md'];
  var vs = {primary:{background:d?T.greyMid:T.maroon,color:T.white,border:'none'},secondary:{background:'transparent',color:d?T.greyMid:T.maroon,border:'1px solid '+(d?T.greyMid:T.maroon)},text:{background:'transparent',color:T.maroon,border:'none'},danger:{background:d?T.greyMid:T.red,color:T.white,border:'none'},gold:{background:d?T.greyMid:T.gold,color:T.white,border:'none'}}[v];
  return <button onClick={d?undefined:p.onClick} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'1vw',borderRadius:T.pill,fontFamily:T.body,fontWeight:600,cursor:d?'not-allowed':'pointer',minHeight:'5vh',minWidth:'10vw',whiteSpace:'nowrap',width:p.full?'100%':'auto',...sz,...vs,...(p.style||{})}}>{p.icon}{p.children}</button>;
}
function Toast(p) {
  useEffect(function() { if (p.vis) { var t = setTimeout(p.onClose, 3000); return function() { clearTimeout(t); }; } }, [p.vis]);
  if (!p.vis) return null;
  return <div style={{position:'fixed',top:'3vh',left:'50%',transform:'translateX(-50%)',background:{info:T.maroon,success:T.green,error:T.red,warning:T.gold}[p.type]||T.maroon,color:T.white,padding:'1.5vh 4vw',borderRadius:T.pill,fontSize:'1.6vmin',fontWeight:500,zIndex:9999,boxShadow:T.shL,animation:'slideUp .3s ease'}}>{p.msg}</div>;
}
function Overlay(p) {
  if (!p.vis) return null;
  return <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(26,10,10,.45)',backdropFilter:'blur(1vmin)',display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeIn .25s ease'}} onClick={p.onClose}><div onClick={function(e){e.stopPropagation()}} style={{background:T.white,borderRadius:T.card,padding:'3vh 4vw',width:'80vw',boxShadow:T.shL,animation:'bounceIn .35s ease'}}>{p.children}</div></div>;
}
function NumPad(p) {
  var keys = ['1','2','3','4','5','6','7','8','9','','0','del'];
  return <div style={{width:'100%',maxWidth:'85vw',margin:'0 auto'}}><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1vw'}}>{keys.map(function(k,i){if(k==='')return <div key={i}/>;if(k==='del')return <button key={i} onClick={p.onDel} style={{height:'7vh',borderRadius:T.card,border:'1px solid '+T.border,background:T.white,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><IBack size="3vmin"/></button>;return <button key={i} onClick={function(){p.onKey(k)}} style={{height:'7vh',borderRadius:T.card,border:'1px solid '+T.border,background:T.white,fontSize:'3vmin',fontFamily:T.mono,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{k}</button>;})}</div>{p.onSubmit&&<Btn v="primary" full onClick={p.onSubmit} disabled={p.subDis} style={{marginTop:'1.5vh'}} sz="lg">{p.subLabel||'Enter'}</Btn>}</div>;
}
function OTPBox(p) {
  var v = p.val||'', l = p.len||6;
  return <div style={{display:'flex',gap:'1.5vw',justifyContent:'center'}}>{Array.from({length:l}).map(function(_,i){return <div key={i} style={{width:'7vw',height:'8vh',borderRadius:T.card,background:T.white,border:'1px solid '+(v[i]?T.maroon:T.border),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3.5vmin',fontFamily:T.mono,fontWeight:600}}>{v[i]||''}</div>;})}</div>;
}

/* ═══ HDR — #2 Cart icon + Trial/Wardrobe persistent ═══ */
function Hdr(p) {
  var ctx = useS();
  var trC = ctx.trialRoom ? ctx.trialRoom.length : 0;
  var wdC = ctx.wardrobe ? ctx.wardrobe.length : 0;
  var ctC = ctx.cart ? ctx.cart.length : 0;
  return (
    <div style={{width:'100%',zIndex:100,background:T.ivory}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.5vh 3vw',minHeight:'7vh'}}>
        {p.onBack ? <div onClick={p.onBack} style={{width:'5vmin',height:'5vmin',borderRadius:'50%',border:'1px solid '+T.border,display:'flex',alignItems:'center',justifyContent:'center',background:T.white,cursor:'pointer'}}><IBack size="2.5vmin"/></div> : <div style={{width:'5vmin'}}/>}
        <div style={{fontFamily:T.head,fontSize:'3.5vmin',fontWeight:700,color:T.dark}}>{CFG.logo}</div>
        <div style={{display:'flex',gap:'1.2vw',alignItems:'center'}}>
          {/* Trial Room — only clickable if has items */}
          <div onClick={trC > 0 ? function(){ctx.navigate('trialRoom')} : undefined} style={{position:'relative',cursor:trC>0?'pointer':'default',width:'5vmin',height:'5vmin',display:'flex',alignItems:'center',justifyContent:'center',opacity:trC>0?1:.4}}>
            <ITrial size="2.8vmin"/>
            {trC > 0 && <div style={{position:'absolute',top:'-.3vh',right:'-.3vw',background:T.gold,color:T.white,borderRadius:'50%',width:'2.2vmin',height:'2.2vmin',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1vmin',fontWeight:700}}>{trC}</div>}
          </div>
          {/* Wardrobe */}
          <div onClick={function(){ctx.navigate('ward')}} style={{position:'relative',cursor:'pointer',width:'5vmin',height:'5vmin',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <IHanger size="2.8vmin"/>
            {wdC > 0 && <div style={{position:'absolute',top:'-.3vh',right:'-.3vw',background:T.maroon,color:T.white,borderRadius:'50%',width:'2.2vmin',height:'2.2vmin',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1vmin',fontWeight:700}}>{wdC}</div>}
          </div>
          {/* #2 Cart — visible when cart has items */}
          {ctC > 0 && <div onClick={function(){ctx.navigate('order')}} style={{position:'relative',cursor:'pointer',width:'5vmin',height:'5vmin',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ICart size="2.8vmin"/>
            <div style={{position:'absolute',top:'-.3vh',right:'-.3vw',background:T.green,color:T.white,borderRadius:'50%',width:'2.2vmin',height:'2.2vmin',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1vmin',fontWeight:700}}>{ctC}</div>
          </div>}
          <div onClick={p.onHome||ctx.goHome} style={{width:'5vmin',height:'5vmin',borderRadius:'50%',border:'1px solid '+T.border,display:'flex',alignItems:'center',justifyContent:'center',background:T.white,cursor:'pointer'}}><IHome size="2.5vmin"/></div>
          <div onClick={p.onLogout||ctx.triggerLogout} style={{width:'5vmin',height:'5vmin',borderRadius:'50%',border:'1px solid '+T.border,display:'flex',alignItems:'center',justifyContent:'center',background:T.white,cursor:'pointer'}}><ILogout size="2.5vmin"/></div>
        </div>
      </div>
      <GoldDiv w="100%"/>
    </div>
  );
}
function Footer() { return <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:100,background:T.dark,padding:'.8vh 3vw',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:'1.1vmin',color:T.greyMid}}>{CFG.copy}</span><span style={{fontSize:'1.1vmin',color:T.gold,fontWeight:500}}>{CFG.powered}</span></div>; }

/* ═══ SAREE CARD — #3 Duplicate labels + checkbox ═══ */
function SCard(p) {
  var pr = p.p, ld = useState(false);
  var inTr = p.inTrial, inWd = p.inWard, isSel = p.isSel;
  var disabled = inTr || inWd;
  var label = inWd ? S('alreadyWard') : inTr ? S('alreadyTrial') : isSel ? S('selected') : null;
  var labelBg = inWd ? T.maroon : inTr ? T.gold : isSel ? T.green : T.gold;
  return (
    <div onClick={disabled ? undefined : function(){p.onTap&&p.onTap(pr)}} style={{width:'100%',borderRadius:T.card,overflow:'hidden',background:disabled?T.greyLt:isSel?T.rose:T.white,boxShadow:T.sh,cursor:disabled?'default':'pointer',animation:'slideUp .4s ease both',border:isSel?'.25vmin solid '+T.gold:'none',opacity:disabled?.7:1,position:'relative'}}>
      {p.onCheck && !disabled && <div onClick={function(e){e.stopPropagation();p.onCheck(pr)}} style={{position:'absolute',top:'1vh',left:'1vw',zIndex:3,width:'4vmin',height:'4vmin',borderRadius:'.5vmin',border:'1px solid '+(isSel?T.gold:T.white),background:isSel?T.gold:'rgba(255,255,255,.8)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:T.sh}}>
        {isSel && <ICheck size="2.5vmin" color={T.white} accent={T.white}/>}
      </div>}
      <div style={{position:'relative',width:'100%',paddingTop:'150%',background:T.greyLt}}>
        {!ld[0] && <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,'+T.greyLt+' 25%,'+T.ivory+' 50%,'+T.greyLt+' 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}}/>}
        <img src={pr.img} alt={pr.name} onLoad={function(){ld[1](true)}} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',opacity:ld[0]?1:0}}/>
        {label && <div style={{position:'absolute',bottom:0,left:0,right:0,background:labelBg,padding:'.5vh 0',textAlign:'center',fontSize:'1.2vmin',fontWeight:600,color:T.white}}>{label}</div>}
      </div>
      <div style={{padding:'1.2vh 1.5vw'}}>
        <div style={{fontFamily:T.head,fontSize:'1.8vmin',fontWeight:600,lineHeight:1.3}}>{pr.name}</div>
        <div style={{fontSize:'1.3vmin',color:T.grey}}>{pr.fab}</div>
        <div style={{fontFamily:T.mono,fontSize:'1.8vmin',fontWeight:700,color:T.maroon,marginTop:'.3vh'}}>₹{fmtP(pr.price)}</div>
      </div>
    </div>
  );
}
function ScrollR(p) {
  var r = useRef(null);
  return <div style={{marginBottom:'2vh'}}>{p.title&&<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 3vw',marginBottom:'1vh'}}><div style={{fontFamily:T.head,fontSize:'2.5vmin',fontWeight:700}}>{p.title}</div><div style={{display:'flex',gap:'1vw'}}><div onClick={function(){r.current&&r.current.scrollBy({left:-r.current.offsetWidth*.6,behavior:'smooth'})}} style={{width:'4vmin',height:'4vmin',borderRadius:'50%',border:'1px solid '+T.border,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:T.white}}><IChevL size="2vmin"/></div><div onClick={function(){r.current&&r.current.scrollBy({left:r.current.offsetWidth*.6,behavior:'smooth'})}} style={{width:'4vmin',height:'4vmin',borderRadius:'50%',border:'1px solid '+T.border,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:T.white}}><IChevR size="2vmin"/></div></div></div>}<div ref={r} style={{display:'flex',gap:'2vw',overflowX:'auto',scrollSnapType:'x mandatory',paddingLeft:'3vw',paddingRight:'3vw',scrollbarWidth:'none'}}>{p.children}</div></div>;
}

/* ═══════ SCREENS ═══════ */

/* 1. IDLE — no changes */
function IdleScr(p) {
  var sl = useState(0);
  useEffect(function(){var t=setInterval(function(){sl[1](function(v){return(v+1)%3})},5000);return function(){clearInterval(t)}},[]);
  var slides = [{h:'See Yourself in This Beautiful Saree',s:'Virtual Try-On Experience',img:'https://picsum.photos/seed/idle1/600/1000'},{h:'New Bridal Collection',s:'Kanjivaram & Banarasi Silks',img:'https://picsum.photos/seed/idle2/600/1000'},{h:'Festival Specials',s:'Exclusive Sarees',img:'https://picsum.photos/seed/idle3/600/1000'}];
  return <div onClick={p.onStart} style={{width:'100vw',height:'100vh',position:'relative',overflow:'hidden',cursor:'pointer',background:T.ivory}}>{slides.map(function(s,i){return <div key={i} style={{position:'absolute',inset:0,opacity:i===sl[0]?1:0,transition:'opacity 1s ease',zIndex:1}}><img src={s.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',filter:'blur(.3vmin) brightness(.85)'}}/></div>})}<div style={{position:'absolute',inset:0,zIndex:2,background:'linear-gradient(180deg,rgba(253,248,242,.5),transparent 30%,transparent 50%,rgba(253,248,242,.9) 80%,'+T.ivory+')'}}/><div style={{position:'absolute',top:'2vh',left:'3vw',zIndex:10,fontFamily:T.head,fontSize:'3.5vmin',fontWeight:800}}>{CFG.logo}</div><div style={{position:'absolute',top:'40%',left:'50%',transform:'translate(-50%,-50%)',zIndex:10}}><div style={{display:'inline-flex',alignItems:'center',gap:'1.5vw',background:'rgba(60,50,50,.6)',backdropFilter:'blur(1vmin)',padding:'2vh 5vw',borderRadius:T.card,animation:'breathe 3s ease infinite'}}><span style={{fontFamily:T.head,fontSize:'3vmin',fontWeight:600,color:T.white}}>Touch to Start</span></div></div><div style={{position:'absolute',bottom:'8vh',left:0,right:0,zIndex:10,textAlign:'center',padding:'0 5vw'}}><h1 style={{fontFamily:T.head,fontSize:'4vmin',fontWeight:700,textTransform:'uppercase'}}>{slides[sl[0]].h}</h1><p style={{fontFamily:T.body,fontSize:'1.8vmin',color:T.darkSoft,marginTop:'1vh'}}>{slides[sl[0]].s}</p></div></div>;
}

/* 2. LANGUAGE — no changes */
function LangScr(p) {
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{marginTop:'8vh',textAlign:'center'}}><div style={{fontFamily:T.head,fontSize:'4vmin',fontWeight:700}}>{CFG.logo}</div><GoldDiv w="30vw"/><h2 style={{fontFamily:T.head,fontSize:'2.8vmin',fontWeight:600,marginTop:'2vh'}}>Select Your Language</h2></div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2vw',padding:'4vh 5vw',width:'90vw',marginTop:'3vh'}}>{LANGS.map(function(l){return <div key={l.c} onClick={function(){p.onSelect(l.c)}} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2.5vh 1vw',borderRadius:T.card,background:p.prev===l.c?T.maroon:T.white,color:p.prev===l.c?T.white:T.dark,border:'1px solid '+(p.prev===l.c?T.maroon:T.border),boxShadow:T.sh,cursor:'pointer',minHeight:'10vh'}}><span style={{fontFamily:T.head,fontSize:'2.5vw',fontWeight:700}}>{l.v}</span><span style={{fontSize:'1.2vw',opacity:.7,marginTop:'.5vh'}}>{l.n}</span></div>})}</div></div>;
}

/* 3. AUTH — no changes (phone confirm modal included) */
function AuthScr(p) {
  var inp = useState(''), err = useState(''), showConf = useState(false);
  var hKey=function(k){err[1]('');if(inp[0].length<10)inp[1](function(v){return v+k})};
  var hDel=function(){err[1]('');inp[1](function(v){return v.slice(0,-1)})};
  var hSub=function(){if(inp[0].length<6){err[1](S('badPhone'));return}if(inp[0].length===6){inp[0]===CFG.tabletCode?p.onTablet(inp[0]):err[1](S('wrongOTP'));return}if(inp[0].length===10){if(!['6','7','8','9'].includes(inp[0][0])){err[1](S('badPhone'));return}showConf[1](true);return}err[1](S('badPhone'))};
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',overflow:'hidden'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'2vh 3vw'}}><div onClick={p.onBack} style={{width:'5vmin',height:'5vmin',borderRadius:'50%',border:'1px solid '+T.border,display:'flex',alignItems:'center',justifyContent:'center',background:T.white,cursor:'pointer'}}><IBack size="2.5vmin"/></div><div style={{fontFamily:T.head,fontSize:'3.5vmin',fontWeight:700}}>{CFG.logo}</div><div style={{width:'5vmin'}}/></div><GoldDiv w="100%"/><div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'3vh 5vw'}}><h2 style={{fontFamily:T.head,fontSize:'3vmin',fontWeight:700}}>Hello!</h2><p style={{fontSize:'1.8vmin',color:T.grey,marginBottom:'2vh'}}>{inp[0].length<=6?S('haveCode')+' / '+S('newCust'):S('enterPh')}</p><div style={{display:'flex',gap:'2vw',marginBottom:'2vh',width:'80vw'}}><div style={{flex:1,padding:'1.5vh 2vw',borderRadius:T.card,background:inp[0].length<=6?T.rose:T.white,border:'1px solid '+(inp[0].length<=6?T.maroon:T.border),textAlign:'center'}}><div style={{fontSize:'1.5vmin',fontWeight:600,fontFamily:T.head,color:inp[0].length<=6?T.maroon:T.grey}}>Store Code</div></div><div style={{flex:1,padding:'1.5vh 2vw',borderRadius:T.card,background:inp[0].length>6?T.rose:T.white,border:'1px solid '+(inp[0].length>6?T.maroon:T.border),textAlign:'center'}}><div style={{fontSize:'1.5vmin',fontWeight:600,fontFamily:T.head,color:inp[0].length>6?T.maroon:T.grey}}>Phone</div></div></div><div style={{width:'80vw',padding:'1.5vh 3vw',borderRadius:'1.5vw',border:'1px solid '+(err[0]?T.red:T.border),background:T.white,display:'flex',alignItems:'center',gap:'1.5vw',minHeight:'7vh',marginBottom:'.5vh'}}><IPhone size="2.5vmin"/>{inp[0].length>6&&<span style={{fontFamily:T.mono,fontSize:'2.2vmin',color:T.grey}}>+91</span>}<span style={{fontFamily:T.mono,fontSize:'2.5vmin',fontWeight:500,flex:1,letterSpacing:'.15em'}}>{inp[0]}</span></div>{err[0]&&<div style={{fontSize:'1.4vmin',color:T.red,marginBottom:'1vh'}}>{err[0]}</div>}<NumPad onKey={hKey} onDel={hDel} onSubmit={hSub} subLabel={S('cont')} subDis={inp[0].length<6||(inp[0].length>6&&inp[0].length<10)}/></div><Overlay vis={showConf[0]} onClose={function(){showConf[1](false)}}><div style={{textAlign:'center'}}><h3 style={{fontFamily:T.head,fontSize:'2.5vmin',fontWeight:700,margin:'1vh 0'}}>{S('confirmNum')}</h3><p style={{fontSize:'1.4vmin',color:T.grey}}>{S('confirmNumB')}</p><div style={{fontFamily:T.mono,fontSize:'3vmin',fontWeight:700,color:T.maroon,margin:'1vh 0'}}>+91 {inp[0]}</div><div style={{display:'flex',gap:'2vw',marginTop:'2vh'}}><Btn v="secondary" full onClick={function(){showConf[1](false)}}>{S('edit')}</Btn><Btn v="primary" full onClick={function(){showConf[1](false);p.onPhone(inp[0])}}>{S('yes')}</Btn></div></div></Overlay><Footer/></div>;
}

/* 4. OTP — no changes */
function OtpScr(p) {
  var otp=useState(''),err=useState(''),timer=useState(CFG.otpSec),canR=useState(false);
  useEffect(function(){if(timer[0]<=0){canR[1](true);return}var t=setTimeout(function(){timer[1](function(v){return v-1})},1000);return function(){clearTimeout(t)}},[timer[0]]);
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',overflow:'hidden'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'2vh 3vw'}}><div onClick={p.onBack} style={{width:'5vmin',height:'5vmin',borderRadius:'50%',border:'1px solid '+T.border,display:'flex',alignItems:'center',justifyContent:'center',background:T.white,cursor:'pointer'}}><IBack size="2.5vmin"/></div><div style={{fontFamily:T.head,fontSize:'3.5vmin',fontWeight:700}}>{CFG.logo}</div><div style={{width:'5vmin'}}/></div><GoldDiv w="100%"/><div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'3vh 5vw'}}><h2 style={{fontFamily:T.head,fontSize:'3vmin',fontWeight:700}}>{S('enterOTP')}</h2><p style={{fontSize:'1.6vmin',color:T.grey,marginBottom:'3vh'}}>OTP sent to +91 {p.phone?p.phone.slice(0,2)+'****'+p.phone.slice(-4):''}</p><OTPBox val={otp[0]} len={6}/>{err[0]&&<div style={{fontSize:'1.4vmin',color:T.red,marginTop:'1vh'}}>{err[0]}</div>}<div style={{marginTop:'2vh'}}>{canR[0]?<div onClick={function(){timer[1](CFG.otpSec);canR[1](false);otp[1]('')}} style={{fontSize:'1.6vmin',color:T.maroon,fontWeight:600,cursor:'pointer',textDecoration:'underline'}}>{S('resendOTP')}</div>:<div style={{fontSize:'1.4vmin',color:T.grey}}>Resend in <span style={{fontFamily:T.mono,color:T.maroon}}>{timer[0]}s</span></div>}</div><div style={{marginTop:'2vh',width:'100%'}}><NumPad onKey={function(k){err[1]('');if(otp[0].length<6)otp[1](function(v){return v+k})}} onDel={function(){err[1]('');otp[1](function(v){return v.slice(0,-1)})}} onSubmit={function(){if(otp[0].length<6)return;otp[0]===CFG.otpDemo?p.onVerify():(err[1](S('wrongOTP')),otp[1](''))}} subLabel={S('cont')} subDis={otp[0].length<6}/></div></div><Footer/></div>;
}

/* 5. CONSENT (overlay) — no changes */
function ConsentScr(p) { return <Overlay vis={p.vis} onClose={p.onCancel}><div style={{textAlign:'center'}}><ICamera size="5vmin"/><h3 style={{fontFamily:T.head,fontSize:'2.5vmin',fontWeight:700,margin:'1vh 0'}}>{S('consent')}</h3><p style={{fontSize:'1.5vmin',color:T.grey,lineHeight:1.7,textAlign:'left',marginBottom:'2vh'}}>{S('consentB')}</p><div style={{display:'flex',gap:'2vw'}}><Btn v="secondary" full onClick={p.onCancel}>{S('cancel')}</Btn><Btn v="primary" full onClick={p.onAllow}>{S('allow')}</Btn></div></div></Overlay>; }

/* 6. SCAN — #6: Voice capture, NO header icons */
function ScanScr(p) {
  var det=useState(false),camOn=useState(false),cd=useState(10),phase=useState('position');
  useEffect(function(){var t=setTimeout(function(){det[1](true)},2500);return function(){clearTimeout(t)}},[]);
  useEffect(function(){if(phase[0]!=='countdown')return;if(cd[0]<=0){p.onCapture();return}var t=setTimeout(function(){cd[1](function(v){return v-1})},1000);return function(){clearTimeout(t)}},[phase[0],cd[0]]);
  var startCap=function(){camOn[1](true);phase[1]('countdown');cd[1](10)};
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    {/* #6: Minimal header — just logo, NO home/wardrobe/trial icons */}
    <div style={{textAlign:'center',padding:'2vh 0'}}><div style={{fontFamily:T.head,fontSize:'3.5vmin',fontWeight:700}}>{CFG.logo}</div><GoldDiv w="50%"/></div>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'0 3vw'}}>
      <h2 style={{fontFamily:T.head,fontSize:'2.8vmin',fontWeight:700}}>{S('digiLook')}</h2>
      <p style={{fontSize:'1.5vmin',color:T.grey,marginBottom:'1vh'}}>{S('standIn')}</p>
      <div style={{width:'85vw',flex:1,maxHeight:'60vh',position:'relative',borderRadius:T.card,overflow:'hidden',background:'linear-gradient(180deg,rgba(200,190,175,.3),rgba(200,190,175,.15))'}}>
        <img src="https://picsum.photos/seed/storeBg/600/900" alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(.8vmin) brightness(.9)',opacity:.6}}/>
        {camOn[0]&&<div style={{position:'absolute',top:'1vh',right:'1vw',background:T.red,borderRadius:T.pill,padding:'.3vh 1vw',fontSize:'1vmin',color:T.white,zIndex:5,display:'flex',alignItems:'center',gap:'.5vw'}}><div style={{width:'1vmin',height:'1vmin',borderRadius:'50%',background:T.white,animation:'pulse 1s infinite'}}/>CAMERA</div>}
        {phase[0]==='countdown'&&<div style={{position:'absolute',top:'4%',left:'50%',transform:'translateX(-50%)',background:'rgba(255,255,255,.85)',padding:'.6vh 2vw',borderRadius:T.card,fontFamily:T.mono,fontSize:'2.5vmin',fontWeight:600,zIndex:5}}>{cd[0]}s</div>}
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:3}}><svg viewBox="0 0 200 400" style={{height:'80%',opacity:det[0]?.7:.4}}><ellipse cx="100" cy="55" rx="28" ry="32" fill="none" stroke={det[0]?T.green:T.greyMid} strokeWidth="1.5"/><path d="M72 87C60 95 40 115 38 160L38 250Q38 260 48 260L65 260L65 200L75 200L75 350Q75 360 85 360L92 360L95 210L105 210L108 360L115 360Q125 360 125 350L125 200L135 200L135 260L152 260Q162 260 162 250L162 160C160 115 140 95 128 87" fill="none" stroke={det[0]?T.green:T.greyMid} strokeWidth="1.5"/></svg></div>
        {phase[0]==='position'&&det[0]&&<div style={{position:'absolute',bottom:'4%',left:'50%',transform:'translateX(-50%)',zIndex:5,display:'flex',gap:'2vw'}}>
          <Btn v="primary" onClick={startCap} sz="lg" style={{background:'rgba(255,255,255,.85)',color:T.dark}}>{S('capture')}</Btn>
          <Btn v="gold" onClick={startCap} sz="md" icon={<IMic size="2vmin" color={T.white}/>}>Voice</Btn>
        </div>}
      </div>
      <div style={{marginTop:'1vh',fontSize:'1.3vmin',color:T.grey,display:'flex',alignItems:'center',gap:'.5vw'}}><IMic size="1.5vmin" color={T.grey}/>{S('voiceCapture')}</div>
    </div><Footer/></div>;
}

/* 7. AI — #7: Transition screen between Home→Trial */
function AIScr(p) {
  var cd=useState(6),prog=useState(0);
  useEffect(function(){if(cd[0]<=0){p.onDone();return}var t=setTimeout(function(){cd[1](function(v){return v-1});prog[1](function(v){return Math.min(100,v+17)})},1000);return function(){clearTimeout(t)}},[cd[0]]);
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><h2 style={{fontFamily:T.head,fontSize:'2.8vmin',fontWeight:600}}>{S('creating')}</h2><div style={{width:'60vw',height:'.6vh',borderRadius:T.pill,background:T.greyLt,marginTop:'2vh',overflow:'hidden'}}><div style={{width:prog[0]+'%',height:'100%',background:'linear-gradient(90deg,'+T.maroon+','+T.gold+')',borderRadius:T.pill,transition:'width .8s ease'}}/></div><div style={{fontFamily:T.mono,fontSize:'2vmin',color:T.grey,marginTop:'1.5vh'}}>{cd[0]}s</div><div style={{display:'flex',alignItems:'center',gap:'1vw',marginTop:'3vh',padding:'1vh 3vw',borderRadius:T.pill,background:T.greenLt}}><IShield size="2vmin" color={T.green} accent={T.green}/><span style={{fontSize:'1.3vmin',color:T.green,fontWeight:500}}>{S('secure')}</span></div></div>;
}

/* 8. HOME — Major changes: selection→send to trial, voice, barcode, filter, labels */
function HomeScr(p) {
  var ctx = useS(), q = useState(''), selIds = useState([]);
  var isInTr = function(id) { return ctx.trialRoom.some(function(s){return s.id===id}); };
  var isInWd = function(id) { return ctx.wardrobe.some(function(s){return s.id===id}); };
  var isSel = function(id) { return selIds[0].includes(id); };
  var toggleSel = function(saree) {
    if (isInTr(saree.id) || isInWd(saree.id)) return;
    if (isSel(saree.id)) { selIds[1](function(s){return s.filter(function(x){return x!==saree.id})}); return; }
    if (selIds[0].length >= CFG.maxTrial) { ctx.showToast(S('trialFull'), 'warning'); return; }
    selIds[1](function(s){return [].concat(s,[saree.id])});
  };
  var sendToTrial = function() {
    var items = CAT.filter(function(c){return selIds[0].includes(c.id)});
    ctx.setTrialRoom(function(tr){return [].concat(tr,items)});
    selIds[1]([]);
    p.onSendToTrial();
  };
  var filtered = q[0] ? CAT.filter(function(pr){return pr.name.toLowerCase().includes(q[0].toLowerCase())||pr.cat.toLowerCase().includes(q[0].toLowerCase())}) : null;
  var renderCard = function(pr) {
    return <SCard p={pr} onTap={function(){p.onProd(pr)}} onCheck={toggleSel} inTrial={isInTr(pr.id)} inWard={isInWd(pr.id)} isSel={isSel(pr.id)}/>;
  };
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',overflow:'hidden'}}><Hdr/>
    <div style={{flex:1,overflowY:'auto',paddingBottom:'12vh'}}>
      {/* Search + Voice + Barcode + Filter (#8.5 from v5) */}
      <div style={{padding:'1.5vh 3vw',display:'flex',gap:'1.5vw',alignItems:'center'}}>
        <div style={{flex:1,display:'flex',alignItems:'center',gap:'1vw',padding:'1.2vh 2vw',borderRadius:'1.5vw',border:'1px solid '+T.border,background:T.white}}>
          <ISearch size="2vmin" color={T.grey} accent={T.grey}/><input type="text" value={q[0]} onChange={function(e){q[1](e.target.value)}} placeholder={S('search')} style={{flex:1,border:'none',outline:'none',background:'transparent',fontFamily:T.body,fontSize:'1.8vmin'}}/>{q[0]&&<div onClick={function(){q[1]('')}} style={{cursor:'pointer'}}><IClose size="2vmin" color={T.grey}/></div>}
        </div>
        <div onClick={function(){ctx.showToast('Listening...','info')}} style={{width:'6vh',height:'6vh',borderRadius:'50%',border:'1px solid '+T.border,background:T.white,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><IMic size="2.5vmin" color={T.grey}/></div>
        <div onClick={function(){ctx.showToast('Point camera at barcode','info')}} style={{width:'6vh',height:'6vh',borderRadius:T.card,border:'1px solid '+T.border,background:T.white,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><IBarcode size="2.5vmin"/></div>
        <div onClick={function(){ctx.showToast('Filter applied','info')}} style={{width:'6vh',height:'6vh',borderRadius:T.card,border:'1px solid '+T.border,background:T.white,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><IFilter size="2.5vmin"/></div>
      </div>
      {/* Selection bar — only shows when items are checked */}
      {selIds[0].length > 0 && <div style={{margin:'0 3vw 1.5vh',padding:'1.2vh 2vw',borderRadius:T.card,background:'linear-gradient(135deg,'+T.gold+'15,'+T.rose+')',border:'1px solid '+T.gold+'40',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontFamily:T.head,fontSize:'1.6vmin',fontWeight:600}}>{selIds[0].length} saree(s) selected</span>
        <Btn v="gold" sz="sm" onClick={sendToTrial} icon={<ITrial size="1.8vmin" color={T.white}/>}>{S('sendToTrial')}</Btn>
      </div>}
      {/* Shortlisted from Sales Tab */}
      {ctx.shortlisted.length > 0 && <ScrollR title={S('shortlisted')}>{ctx.shortlisted.map(function(pr){return <div key={pr.id} style={{minWidth:'30vw',maxWidth:'30vw',scrollSnapAlign:'start'}}>{renderCard(pr)}</div>})}</ScrollR>}
      {filtered ? <div style={{padding:'0 3vw'}}><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2vw'}}>{filtered.map(function(pr){return <div key={pr.id}>{renderCard(pr)}</div>})}</div></div> : <>
        <ScrollR title={S('trending')}>{CAT.slice(0,6).map(function(pr){return <div key={pr.id} style={{minWidth:'30vw',maxWidth:'30vw',scrollSnapAlign:'start'}}>{renderCard(pr)}</div>})}</ScrollR>
        <ScrollR title={S('shopCat')}>{CATS_L.map(function(c){return <div key={c.id} onClick={function(){q[1](c.id)}} style={{minWidth:'28vw',maxWidth:'28vw',scrollSnapAlign:'start',position:'relative',borderRadius:T.card,overflow:'hidden',height:'18vh',cursor:'pointer'}}><img src={c.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(.7)'}}/><div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,.7))',padding:'1.5vh 1.5vw'}}><span style={{fontFamily:T.head,fontSize:'2vmin',fontWeight:600,color:T.white}}>{c.id}</span></div></div>})}</ScrollR>
        <ScrollR title={S('newArr')}>{[].concat(CAT).reverse().slice(0,6).map(function(pr){return <div key={pr.id} style={{minWidth:'30vw',maxWidth:'30vw',scrollSnapAlign:'start'}}>{renderCard(pr)}</div>})}</ScrollR>
      </>}
    </div><Footer/></div>;
}

/* 9. PRODUCT DETAIL — no changes per doc */
function ProdScr(p) {
  var ctx = useS(), selC = useState(0);
  var inTr = ctx.trialRoom.some(function(s){return s.id===p.p.id});
  var inWd = ctx.wardrobe.some(function(s){return s.id===p.p.id});
  var disc = p.p.mrp > p.p.price ? Math.round(((p.p.mrp-p.p.price)/p.p.mrp)*100) : 0;
  var recs = CAT.filter(function(x){return x.cat===p.p.cat&&x.id!==p.p.id}).slice(0,4);
  var addToTrial = function() {
    if (inTr||inWd) return;
    if (ctx.trialRoom.length >= CFG.maxTrial) { ctx.showToast(S('trialFull'),'warning'); return; }
    ctx.setTrialRoom(function(tr){return [].concat(tr,[p.p])});
    ctx.showToast('Added to Trial Room','success');
  };
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',overflow:'hidden'}}><Hdr onBack={p.onBack}/><div style={{flex:1,overflowY:'auto',paddingBottom:'8vh'}}><div style={{display:'flex',gap:'2vw',padding:'1.5vh 3vw'}}><div style={{width:'42vw',position:'relative',borderRadius:T.card,overflow:'hidden'}}><div style={{paddingTop:'140%',position:'relative',background:T.greyLt}}><img src={p.p.img} alt="" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover'}}/></div></div><div style={{flex:1,display:'flex',flexDirection:'column',gap:'1vh'}}><h2 style={{fontFamily:T.head,fontSize:'2.8vmin',fontWeight:700}}>{p.p.name}</h2><div style={{fontSize:'1.5vmin',color:T.grey}}>{p.p.fab} · {p.p.occ.join(' · ')}</div><p style={{fontSize:'1.3vmin',color:T.darkSoft,lineHeight:1.6}}>{p.p.desc}</p><div style={{display:'flex',alignItems:'baseline',gap:'1vw'}}>{disc>0&&<span style={{fontFamily:T.mono,fontSize:'1.6vmin',color:T.green,fontWeight:600}}>-{disc}%</span>}<span style={{fontFamily:T.mono,fontSize:'2.5vmin',fontWeight:700,color:T.maroon}}>₹{fmtP(p.p.price)}</span></div><div style={{fontSize:'1.4vmin',fontWeight:600,fontFamily:T.head}}>{S('colors')}</div><div style={{display:'flex',gap:'1vw'}}>{p.p.colors.map(function(c,i){return <div key={i} onClick={function(){selC[1](i)}} style={{width:'3.5vmin',height:'3.5vmin',borderRadius:'50%',background:c,border:i===selC[0]?'.25vmin solid '+T.maroon:'1px solid '+T.border,cursor:'pointer'}}/>})}</div><Btn v={inTr?'gold':inWd?'secondary':'primary'} full onClick={addToTrial} sz="lg" disabled={inTr||inWd} icon={<ITrial size="2.2vmin" color={T.white}/>}>{inWd?S('alreadyWard'):inTr?S('alreadyTrial'):S('shortlistTrial')}</Btn></div></div><GoldDiv w="90%"/>{recs.length>0&&<ScrollR title={S('specialForYou')}>{recs.map(function(x){return <div key={x.id} style={{minWidth:'30vw',maxWidth:'30vw',scrollSnapAlign:'start'}}><SCard p={x} onTap={function(){ctx.navigate('prodDet',{product:x})}}/></div>})}</ScrollR>}</div><Footer/></div>;
}

/* 10. TRIAL ROOM — #10: Checkbox select sarees, move selected to wardrobe */
function TrialScr(p) {
  var ctx = useS(), dt = useState(CFG.tryOnSec), selIdx = useState(0), showEnd = useState(false);
  var selForWard = useState([]);
  useEffect(function(){if(dt[0]<=0){showEnd[1](true);return}var t=setTimeout(function(){dt[1](function(v){return v-1})},1000);return function(){clearTimeout(t)}},[dt[0]]);
  var ext = function(){dt[1](function(v){return v+60});showEnd[1](false)};
  var current = ctx.trialRoom[selIdx[0]] || ctx.trialRoom[0];
  var removeSaree = function(id){ctx.setTrialRoom(function(tr){return tr.filter(function(s){return s.id!==id})});if(selIdx[0]>0)selIdx[1](selIdx[0]-1)};
  var togWardSel = function(id){selForWard[1](function(s){return s.includes(id)?s.filter(function(x){return x!==id}):[].concat(s,[id])})};
  var moveToWardrobe = function(){
    var items = ctx.trialRoom.filter(function(s){return selForWard[0].includes(s.id)});
    if(items.length===0){ctx.showToast('Select sarees first','warning');return}
    if(ctx.wardrobe.length+items.length>CFG.maxWardrobe){ctx.showToast('Wardrobe limit ('+CFG.maxWardrobe+')','warning');return}
    ctx.setWardrobe(function(w){return [].concat(w,items)});
    ctx.setTrialRoom(function(tr){return tr.filter(function(s){return!selForWard[0].includes(s.id)})});
    selForWard[1]([]);
    ctx.showToast('Added '+items.length+' to wardrobe','success');
  };
  if(ctx.trialRoom.length===0) return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><ITrial size="8vmin" color={T.greyMid}/><h2 style={{fontFamily:T.head,fontSize:'2.5vmin',fontWeight:600,color:T.grey,marginTop:'2vh'}}>Trial Room Empty</h2><Btn v="primary" onClick={ctx.goHome} style={{marginTop:'3vh'}}>{S('home')}</Btn></div>;
  return <div style={{width:'100vw',height:'100vh',position:'relative',overflow:'hidden',background:T.ivory}}>
    <div style={{position:'absolute',top:0,left:0,right:0,zIndex:10,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1.5vh 3vw',background:'linear-gradient(180deg,rgba(253,248,242,.95),transparent)'}}>
      <div onClick={ctx.goHome} style={{width:'5vmin',height:'5vmin',borderRadius:'50%',background:'rgba(255,255,255,.8)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><IHome size="2.5vmin"/></div>
      <div style={{background:'rgba(60,50,50,.65)',padding:'.8vh 2.5vw',borderRadius:T.pill}}><span style={{fontFamily:T.mono,fontSize:'2.2vmin',fontWeight:600,color:dt[0]<=30?'#FF6B6B':T.white}}>{Math.floor(dt[0]/60)}:{String(dt[0]%60).padStart(2,'0')}</span></div>
      <div onClick={ctx.triggerLogout} style={{width:'5vmin',height:'5vmin',borderRadius:'50%',background:'rgba(255,255,255,.8)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><ILogout size="2.5vmin"/></div>
    </div>
    <div style={{display:'flex',width:'100%',height:'100%',paddingTop:'8vh'}}>
      {/* LEFT — 25vw sarees with checkboxes for wardrobe selection */}
      <div style={{width:'25vw',height:'100%',overflowY:'auto',padding:'1vh 1vw',background:'rgba(0,0,0,.03)',borderRight:'1px solid '+T.border}}>
        <div style={{fontFamily:T.head,fontSize:'1.6vmin',fontWeight:700,padding:'.5vh 1vw',marginBottom:'1vh'}}>{S('trialRoom')} ({ctx.trialRoom.length}/{CFG.maxTrial})</div>
        {ctx.trialRoom.map(function(saree,idx){
          var active = idx===selIdx[0];
          var selW = selForWard[0].includes(saree.id);
          return <div key={saree.id} onClick={function(){selIdx[1](idx)}} style={{display:'flex',gap:'1vw',padding:'1vh 1vw',marginBottom:'.8vh',borderRadius:T.card,background:active?T.rose:T.white,border:active?'.25vmin solid '+T.maroon:'1px solid '+T.border,cursor:'pointer',position:'relative'}}>
            {/* Checkbox for wardrobe selection */}
            <div onClick={function(e){e.stopPropagation();togWardSel(saree.id)}} style={{width:'3vmin',height:'3vmin',borderRadius:'.3vmin',border:'1px solid '+(selW?T.green:T.grey),background:selW?T.green:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,alignSelf:'center'}}>
              {selW&&<ICheck size="2vmin" color={T.white} accent={T.white}/>}
            </div>
            <img src={saree.img} alt="" style={{width:'7vw',height:'7vw',objectFit:'cover',borderRadius:T.card}}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontFamily:T.head,fontSize:'1.2vmin',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{saree.name}</div><div style={{fontFamily:T.mono,fontSize:'1.1vmin',color:T.maroon,fontWeight:600}}>₹{fmtP(saree.price)}</div></div>
            <div onClick={function(e){e.stopPropagation();removeSaree(saree.id)}} style={{position:'absolute',top:'.3vh',right:'.3vw',cursor:'pointer'}}><IClose size="1.5vmin" color={T.grey}/></div>
          </div>;
        })}
        {selForWard[0].length > 0 && <Btn v="primary" full onClick={moveToWardrobe} sz="sm" style={{marginTop:'1vh'}} icon={<IHanger size="1.8vmin" color={T.white}/>}>{S('addWard')} ({selForWard[0].length})</Btn>}
      </div>
      {/* RIGHT — 75% preview */}
      <div style={{flex:1,position:'relative'}}>
        {current && <img src={current.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(.95)'}}/>}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 60%,rgba(253,248,242,.9) 95%)'}}/>
        {current && <div style={{position:'absolute',bottom:'12vh',right:'3vw',width:'25vw',background:'rgba(255,255,255,.9)',backdropFilter:'blur(1vmin)',borderRadius:T.card,padding:'1.5vh 1.5vw',boxShadow:T.shM}}><div style={{fontFamily:T.head,fontSize:'2vmin',fontWeight:700}}>{current.name}</div><div style={{fontFamily:T.mono,fontSize:'1.8vmin',fontWeight:700,color:T.maroon}}>₹{fmtP(current.price)}</div><div style={{fontSize:'1.1vmin',color:T.grey,marginTop:'.5vh'}}>{current.desc}</div></div>}
      </div>
    </div>
    <Overlay vis={showEnd[0]} onClose={function(){showEnd[1](false)}}><div style={{textAlign:'center'}}><h3 style={{fontFamily:T.head,fontSize:'2.5vmin',fontWeight:700,marginBottom:'1vh'}}>{S('endSessQ')}</h3><div style={{display:'flex',gap:'2vw',marginTop:'2vh'}}><Btn v="danger" full onClick={ctx.triggerLogout}>{S('logout')}</Btn><Btn v="secondary" full onClick={ext}>{S('contTry')}</Btn></div></div></Overlay>
  </div>;
}

/* 11. WARDROBE — #11: Checkbox→cart, try-on images, WA share, designed for you */
function WardScr(p) {
  var ctx = useS(), selForCart = useState([]), selShare = useState([]), showWACon = useState(false);
  var togCart = function(id){selForCart[1](function(s){return s.includes(id)?s.filter(function(x){return x!==id}):[].concat(s,[id])})};
  var togShare = function(id){selShare[1](function(s){return s.includes(id)?s.filter(function(x){return x!==id}):[].concat(s,[id])})};
  var moveToCart = function(){
    var items = ctx.wardrobe.filter(function(s){return selForCart[0].includes(s.id)}).map(function(s){return Object.assign({},s,{qty:1})});
    if(items.length===0){ctx.showToast('Select sarees first','warning');return}
    ctx.setCart(function(c){return [].concat(c,items)});
    selForCart[1]([]);
    ctx.navigate('order');
  };
  var doShare = function(){
    if(selShare[0].length===0){ctx.showToast('Select images first','warning');return}
    if(ctx.waShareCount+selShare[0].length>CFG.maxWAShares){ctx.showToast(S('shareLimit')+' ('+CFG.maxWAShares+'/day)','warning');return}
    showWACon[1](true);
  };
  var recs = CAT.filter(function(pr){return!ctx.wardrobe.some(function(w){return w.id===pr.id})}).slice(0,4);
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',overflow:'hidden'}}><Hdr/>
    <div style={{display:'flex',justifyContent:'center',padding:'.5vh'}}><div style={{background:T.dark,color:T.white,padding:'.6vh 3vw',borderRadius:T.pill,fontFamily:T.head,fontSize:'2vmin',fontWeight:600}}>{S('myWard')} ♥ ({ctx.wardrobe.length}/{CFG.maxWardrobe})</div></div>
    <div style={{flex:1,overflowY:'auto',padding:'1vh 3vw',paddingBottom:'14vh'}}>
      {ctx.wardrobe.length === 0 ? <div style={{textAlign:'center',padding:'10vh 0',color:T.grey}}><IHanger size="6vmin" color={T.greyMid}/><div style={{marginTop:'2vh',fontSize:'1.8vmin'}}>Your wardrobe is empty</div><Btn v="primary" onClick={ctx.goHome} style={{marginTop:'2vh'}}>{S('home')}</Btn></div> :
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'2vw'}}>
        {ctx.wardrobe.map(function(saree,idx){
          var selC = selForCart[0].includes(saree.id);
          var selS = selShare[0].includes(saree.id);
          return <div key={idx} style={{background:T.white,borderRadius:T.card,overflow:'hidden',boxShadow:T.sh,position:'relative',border:selC?'.25vmin solid '+T.green:'none'}}>
            {/* Try-on image — 75% of card */}
            <div style={{position:'relative',width:'100%',paddingTop:'120%',background:T.greyLt}}><img src={saree.img} alt="" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover'}}/></div>
            <div style={{padding:'1vh 1.5vw'}}>
              <div style={{fontFamily:T.head,fontSize:'1.5vmin',fontWeight:600}}>{saree.name}</div>
              <div style={{fontFamily:T.mono,fontSize:'1.4vmin',color:T.maroon,fontWeight:600}}>₹{fmtP(saree.price)}</div>
              <div style={{display:'flex',gap:'1vw',marginTop:'.8vh',alignItems:'center'}}>
                {/* Cart checkbox */}
                <div onClick={function(){togCart(saree.id)}} style={{display:'flex',alignItems:'center',gap:'.5vw',cursor:'pointer'}}>
                  <div style={{width:'2.5vmin',height:'2.5vmin',borderRadius:'.3vmin',border:'1px solid '+(selC?T.green:T.grey),background:selC?T.green:'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>{selC&&<ICheck size="1.5vmin" color={T.white} accent={T.white}/>}</div>
                  <span style={{fontSize:'1.1vmin',color:T.grey}}>Cart</span>
                </div>
                {/* Share checkbox */}
                <div onClick={function(){togShare(saree.id)}} style={{display:'flex',alignItems:'center',gap:'.5vw',cursor:'pointer'}}>
                  <div style={{width:'2.5vmin',height:'2.5vmin',borderRadius:'.3vmin',border:'1px solid '+(selS?'#25D366':T.grey),background:selS?'#25D366':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>{selS&&<ICheck size="1.5vmin" color={T.white} accent={T.white}/>}</div>
                  <span style={{fontSize:'1.1vmin',color:T.grey}}>Share</span>
                </div>
              </div>
            </div>
          </div>;
        })}
      </div>}
      {/* Designed for you */}
      {recs.length > 0 && <div style={{marginTop:'2vh'}}><ScrollR title={S('specialForYou')}>{recs.map(function(pr){return <div key={pr.id} style={{minWidth:'30vw',maxWidth:'30vw',scrollSnapAlign:'start'}}><SCard p={pr} onTap={function(){ctx.navigate('prodDet',{product:pr})}}/></div>})}</ScrollR></div>}
    </div>
    {/* Bottom actions */}
    <div style={{position:'fixed',bottom:'4vh',left:'50%',transform:'translateX(-50%)',zIndex:100,display:'flex',gap:'2vw'}}>
      {selShare[0].length > 0 && <Btn v="gold" sz="sm" onClick={doShare} icon={<IWA size="1.8vmin" color={T.white}/>}>Share ({selShare[0].length})</Btn>}
      {selForCart[0].length > 0 && <Btn v="primary" sz="lg" onClick={moveToCart} icon={<ICart size="2vmin" color={T.white} accent={T.white}/>}>{S('moveToCart')} ({selForCart[0].length})</Btn>}
      {selForCart[0].length === 0 && ctx.wardrobe.length > 0 && <Btn v="secondary" sz="md" onClick={function(){ctx.navigate('order')}}>{S('checkout')}</Btn>}
    </div>
    {/* WA Consent */}
    <Overlay vis={showWACon[0]} onClose={function(){showWACon[1](false)}}><div style={{textAlign:'center'}}><IShield size="5vmin"/><h3 style={{fontFamily:T.head,fontSize:'2vmin',fontWeight:700,margin:'1vh 0'}}>WhatsApp Consent</h3><p style={{fontSize:'1.3vmin',color:T.grey,lineHeight:1.7,textAlign:'left',marginBottom:'2vh'}}>{S('waConsent')}</p><div style={{display:'flex',gap:'2vw'}}><Btn v="secondary" full onClick={function(){showWACon[1](false)}}>{S('cancel')}</Btn><Btn v="primary" full onClick={function(){showWACon[1](false);ctx.incWAShare(selShare[0].length);selShare[1]([]);ctx.showToast('Shared '+selShare[0].length+' image(s)','success')}}>{S('allow')}</Btn></div></div></Overlay>
    <Footer/></div>;
}

/* 12. ORDER — #12: Quantity, remove (ask wardrobe), find tailor, checkout removes from wardrobe */
function OrderScr(p) {
  var ctx = useS(), showQR = useState(false), tok = useState(genTok), exp = useState(600), rmIdx = useState(null), rmAskWard = useState(false);
  useEffect(function(){if(!showQR[0]||exp[0]<=0)return;var t=setTimeout(function(){exp[1](function(v){return v-1})},1000);return function(){clearTimeout(t)}},[showQR[0],exp[0]]);
  var updateQty = function(idx,delta){ctx.setCart(function(c){return c.map(function(item,i){if(i!==idx)return item;var nq=Math.max(1,(item.qty||1)+delta);return Object.assign({},item,{qty:nq})})})};
  var removeItem = function(idx,alsoWard){
    var item = ctx.cart[idx];
    ctx.setCart(function(c){return c.filter(function(_,i){return i!==idx})});
    if(alsoWard&&item){ctx.setWardrobe(function(w){return w.filter(function(s){return s.id!==item.id})})}
    rmIdx[1](null);rmAskWard[1](false);
  };
  var doCheckout = function(){
    /* #12.2: Remove checked-out items from wardrobe */
    var cartIds = ctx.cart.map(function(c){return c.id});
    ctx.setWardrobe(function(w){return w.filter(function(s){return!cartIds.includes(s.id)})});
    showQR[1](true);
  };
  var sub = ctx.cart.reduce(function(s,i){return s+i.price*(i.qty||1)},0);
  var gst = ctx.cart.reduce(function(s,i){return s+calcGST(i.price)*(i.qty||1)},0);
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',overflow:'hidden'}}><Hdr onBack={p.onBack}/>
    <div style={{flex:1,overflowY:'auto',padding:'1vh 4vw',paddingBottom:'8vh'}}>
      <h2 style={{fontFamily:T.head,fontSize:'2.8vmin',fontWeight:700,textAlign:'center'}}>{S('orderSum')}</h2>
      <p style={{fontSize:'1.4vmin',color:T.grey,textAlign:'center',marginBottom:'2vh'}}>{ctx.cart.length} items</p>
      {ctx.cart.map(function(item,idx){return <div key={idx} style={{display:'flex',gap:'2vw',padding:'1vh 2vw',background:T.white,borderRadius:T.card,boxShadow:T.sh,marginBottom:'1vh',alignItems:'center'}}>
        <img src={item.img} alt="" style={{width:'10vw',height:'8vh',objectFit:'cover',borderRadius:T.card}}/>
        <div style={{flex:1}}><div style={{fontFamily:T.head,fontSize:'1.6vmin',fontWeight:600}}>{item.name}</div><div style={{fontFamily:T.mono,fontSize:'1.4vmin',color:T.maroon,fontWeight:600}}>₹{fmtP(item.price)}</div></div>
        {/* Quantity controls */}
        <div style={{display:'flex',alignItems:'center',gap:'.8vw'}}>
          <div onClick={function(){updateQty(idx,-1)}} style={{width:'3.5vmin',height:'3.5vmin',borderRadius:'50%',border:'1px solid '+T.border,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:T.white}}><IMinus size="1.5vmin"/></div>
          <span style={{fontFamily:T.mono,fontSize:'1.8vmin',fontWeight:600,minWidth:'3vw',textAlign:'center'}}>{item.qty||1}</span>
          <div onClick={function(){updateQty(idx,1)}} style={{width:'3.5vmin',height:'3.5vmin',borderRadius:'50%',border:'1px solid '+T.border,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:T.white}}><IPlus size="1.5vmin"/></div>
        </div>
        <div onClick={function(){rmIdx[1](idx);rmAskWard[1](true)}} style={{cursor:'pointer'}}><IClose size="2vmin" color={T.red}/></div>
      </div>})}
      <div style={{background:T.white,borderRadius:T.card,padding:'2vh 3vw',boxShadow:T.sh,margin:'2vh 0'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:'1.4vmin'}}><span style={{color:T.grey}}>Subtotal</span><span>₹{fmtP(sub)}</span></div><div style={{display:'flex',justifyContent:'space-between',fontSize:'1.4vmin'}}><span style={{color:T.grey}}>GST</span><span>₹{fmtP(Math.round(gst))}</span></div><GoldDiv w="100%"/><div style={{display:'flex',justifyContent:'space-between',fontSize:'2vmin',fontWeight:700,color:T.maroon}}><span>Total</span><span>₹{fmtP(Math.round(sub+gst))}</span></div><div style={{fontSize:'1vmin',color:T.grey,fontStyle:'italic'}}>{S('indPrice')}</div></div>
      {!showQR[0] ? <div style={{display:'flex',gap:'2vw'}}><Btn v="primary" full sz="lg" onClick={doCheckout}>{S('checkout')}</Btn><Btn v="secondary" sz="md" onClick={function(){ctx.navigate('tailors')}} icon={<IScissors size="2vmin"/>}>{S('findTailor')}</Btn></div> :
      <div style={{textAlign:'center',animation:'slideUp .3s ease'}}><div style={{width:'30vw',height:'30vw',margin:'0 auto 1vh',background:T.white,borderRadius:T.card,boxShadow:T.sh,display:'flex',alignItems:'center',justifyContent:'center'}}><IQR size="22vw"/></div><div style={{fontFamily:T.mono,fontSize:'3.5vmin',fontWeight:700,color:T.maroon,letterSpacing:'.3em'}}>{tok[0]}</div><div style={{fontSize:'1.4vmin',color:T.grey}}>Expires {Math.floor(exp[0]/60)}:{String(exp[0]%60).padStart(2,'0')}</div><div style={{background:T.rose,borderRadius:T.card,padding:'2vh 3vw',marginTop:'1vh'}}><div style={{fontFamily:T.head,fontSize:'2vmin',fontWeight:600,color:T.maroon}}>{S('showTeam')}</div></div></div>}
    </div>
    {/* Remove item dialog — ask about wardrobe */}
    <Overlay vis={rmAskWard[0]} onClose={function(){rmAskWard[1](false);rmIdx[1](null)}}><div style={{textAlign:'center'}}><p style={{fontSize:'1.8vmin',marginBottom:'1vh'}}>Remove from cart?</p><p style={{fontSize:'1.4vmin',color:T.grey,marginBottom:'2vh'}}>{S('removeFromWard')}</p><div style={{display:'flex',flexDirection:'column',gap:'1vh'}}><Btn v="danger" full onClick={function(){removeItem(rmIdx[0],true)}}>Remove from Cart & Wardrobe</Btn><Btn v="secondary" full onClick={function(){removeItem(rmIdx[0],false)}}>Remove from Cart Only</Btn><Btn v="text" full onClick={function(){rmAskWard[1](false);rmIdx[1](null)}}>{S('cancel')}</Btn></div></div></Overlay>
    <Footer/></div>;
}

/* 13. TAILORS — v5 features: sort, portfolio, connect, consent, ref code, Wearify WA */
function TailorScr(p) {
  var ctx = useS(), sort = useState('rec'), view = useState('list'), st = useState(null), code = useState(genTok), showCon = useState(false);
  var sorted = [].concat(TAILORS).sort(function(a,b){return sort[0]==='near'?parseFloat(a.dist)-parseFloat(b.dist):sort[0]==='top'?b.rating-a.rating:b.rev-a.rev});
  if(view[0]==='connect'&&st[0]) return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',overflow:'hidden'}}><Hdr onBack={function(){view[1]('list')}}/>
    <div style={{flex:1,overflowY:'auto',padding:'2vh 4vw',paddingBottom:'8vh'}}>
      <div style={{background:T.white,borderRadius:T.card,padding:'2vh 3vw',boxShadow:T.sh,display:'flex',gap:'2vw',marginBottom:'2vh'}}><img src={st[0].img} alt="" style={{width:'12vw',height:'12vw',objectFit:'cover',borderRadius:T.card}}/><div><div style={{fontFamily:T.head,fontSize:'2vmin',fontWeight:700}}>{st[0].name}</div><div style={{fontSize:'1.3vmin',color:T.grey}}>{st[0].spec}</div><div style={{fontSize:'1.2vmin',color:T.grey}}>{st[0].loc} · {st[0].exp}</div></div></div>
      <h3 style={{fontFamily:T.head,fontSize:'2vmin',fontWeight:600,marginBottom:'1vh'}}>Portfolio</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1vw',marginBottom:'2vh'}}>{st[0].portfolio.map(function(img,i){return <img key={i} src={img} alt="" style={{width:'100%',height:'18vh',objectFit:'cover',borderRadius:T.card}}/>})}</div>
      <GoldDiv w="80%"/>
      <div style={{textAlign:'center',marginTop:'2vh'}}><h3 style={{fontFamily:T.head,fontSize:'2.2vmin',fontWeight:700,marginBottom:'1vh'}}>Connect with {st[0].name.split(' ')[0]}</h3><div style={{fontSize:'1.4vmin',color:T.grey,marginBottom:'.5vh'}}>{S('refCode')}</div><div style={{fontFamily:T.mono,fontSize:'3vmin',fontWeight:700,color:T.maroon,letterSpacing:'.3em',marginBottom:'1vh'}}>{code[0]}</div><div style={{width:'25vw',height:'25vw',margin:'0 auto 1.5vh',background:T.white,borderRadius:T.card,boxShadow:T.sh,display:'flex',alignItems:'center',justifyContent:'center'}}><IQR size="18vw"/></div><Btn v="primary" full sz="lg" onClick={function(){showCon[1](true)}} icon={<IWA size="2.5vmin" color={T.white}/>}>{S('whatsapp')}</Btn><div style={{fontSize:'1.1vmin',color:T.grey,marginTop:'1vh'}}>{S('viaWearify')}</div></div>
    </div>
    <Overlay vis={showCon[0]} onClose={function(){showCon[1](false)}}><div style={{textAlign:'center'}}><IShield size="5vmin"/><h3 style={{fontFamily:T.head,fontSize:'2vmin',fontWeight:700,margin:'1vh 0'}}>Tailor Connection Consent</h3><p style={{fontSize:'1.3vmin',color:T.grey,lineHeight:1.7,textAlign:'left',marginBottom:'1vh'}}>{S('tailorConsent')}</p><div style={{fontFamily:T.mono,fontSize:'2vmin',fontWeight:700,color:T.maroon,margin:'1vh 0'}}>Ref: {code[0]}</div><div style={{display:'flex',gap:'2vw'}}><Btn v="secondary" full onClick={function(){showCon[1](false)}}>{S('cancel')}</Btn><Btn v="primary" full onClick={function(){showCon[1](false);ctx.showToast('Sent via Wearify WhatsApp','success')}}>{S('allow')}</Btn></div></div></Overlay>
    <Footer/></div>;
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',overflow:'hidden'}}><Hdr onBack={p.onBack}/>
    <div style={{padding:'1vh 4vw',textAlign:'center'}}><h2 style={{fontFamily:T.head,fontSize:'2.5vmin',fontWeight:700}}>Expert Tailors</h2><p style={{fontSize:'1.4vmin',color:T.grey}}>Verified Professionals</p></div>
    <div style={{padding:'0 4vw',marginBottom:'1vh',display:'flex',gap:'1vw'}}>{[{id:'rec',l:'Recommended'},{id:'near',l:'Nearby'},{id:'top',l:'Top Rated'}].map(function(o){return <div key={o.id} onClick={function(){sort[1](o.id)}} style={{padding:'.5vh 2vw',borderRadius:T.pill,background:sort[0]===o.id?T.maroon:T.white,color:sort[0]===o.id?T.white:T.dark,fontSize:'1.3vmin',cursor:'pointer',border:'1px solid '+(sort[0]===o.id?T.maroon:T.border)}}>{o.l}</div>})}</div>
    <div style={{flex:1,overflowY:'auto',padding:'0 4vw',paddingBottom:'10vh'}}>{sorted.map(function(t){return <div key={t.id} style={{background:T.white,borderRadius:T.card,boxShadow:T.sh,padding:'2vh 2vw',marginBottom:'1.5vh',display:'flex',gap:'2vw'}}><img src={t.img} alt="" style={{width:'15vw',height:'15vw',objectFit:'cover',borderRadius:T.card}}/><div style={{flex:1}}><div style={{fontFamily:T.head,fontSize:'2vmin',fontWeight:700}}>{t.name}</div><div style={{fontSize:'1.3vmin',color:T.grey}}>{t.spec}</div><div style={{display:'flex',alignItems:'center',gap:'.5vw',fontSize:'1.2vmin',color:T.grey}}><IStarF size="1.5vmin"/> {t.rating} · +{t.rev} Clients</div><div style={{fontSize:'1.2vmin',color:T.grey}}>{t.loc} · {t.dist}</div><div style={{display:'flex',gap:'1.5vw',marginTop:'1vh'}}><Btn v="primary" sz="sm" onClick={function(){st[1](t);view[1]('connect')}}>View Portfolio →</Btn><Btn v="secondary" sz="sm" onClick={function(){st[1](t);view[1]('connect')}}>Connect</Btn></div></div></div>})}</div>
    <Footer/></div>;
}

/* 14. FEEDBACK — no changes */
function FeedScr(p) {
  var r = useState(0), done = useState(false);
  useEffect(function(){if(done[0]){var t=setTimeout(p.onSubmit,3000);return function(){clearTimeout(t)}}},[done[0]]);
  if(done[0]) return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><IStarF size="10vmin"/><h2 style={{fontFamily:T.head,fontSize:'3vmin',fontWeight:700,marginTop:'2vh'}}>{S('thanks')}</h2></div>;
  return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{background:T.white,borderRadius:T.card,padding:'4vh 5vw',boxShadow:T.shL,width:'80vw',animation:'bounceIn .35s ease'}}><h3 style={{fontFamily:T.head,fontSize:'2.8vmin',fontWeight:700,textAlign:'center'}}>{S('feedback')}</h3><div style={{display:'flex',justifyContent:'center',gap:'1vw',margin:'2vh 0'}}>{[1,2,3,4,5].map(function(n){return <div key={n} onClick={function(){r[1](n)}} style={{cursor:'pointer',minWidth:'5vh',minHeight:'5vh',display:'flex',alignItems:'center',justifyContent:'center'}}>{n<=r[0]?<IStarF size="5vmin"/>:<IStar size="5vmin"/>}</div>})}</div><Btn v="primary" full onClick={function(){done[1](true)}} sz="lg" disabled={r[0]===0}>{S('submit')}</Btn><div style={{display:'flex',gap:'2vw',marginTop:'1.5vh'}}><Btn v="secondary" full onClick={p.onHome} sz="sm">{S('home')}</Btn><Btn v="secondary" full onClick={p.onLogout} sz="sm">{S('logout')}</Btn></div></div></div>;
}

/* 15. DATA SAVE — no changes */
function DataScr(p) { return <div style={{width:'100vw',height:'100vh',background:T.ivory,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{background:T.white,borderRadius:T.card,padding:'4vh 5vw',boxShadow:T.shL,width:'75vw',animation:'bounceIn .35s ease',textAlign:'center'}}><IShield size="6vmin"/><h3 style={{fontFamily:T.head,fontSize:'2.5vmin',fontWeight:700,margin:'1vh 0'}}>{S('saveLooks')}</h3><p style={{fontSize:'1.4vmin',color:T.grey,lineHeight:1.7,marginBottom:'2vh',textAlign:'left'}}>{S('saveBody')}</p><Btn v="primary" full onClick={p.onSave} sz="lg" style={{marginBottom:'1vh'}}>{S('save')}</Btn><div style={{fontSize:'1.1vmin',color:T.grey,marginBottom:'1vh'}}>OR</div><Btn v="secondary" full onClick={p.onDel} style={{color:T.red,borderColor:T.red}}>{S('delAll')}</Btn></div></div>; }

/* 16. END — v5 style with shield + privacy */
function EndScr(p) {
  var cd = useState(3);
  useEffect(function(){if(cd[0]<=0){p.onDone();return}var t=setTimeout(function(){cd[1](function(v){return v-1})},1000);return function(){clearTimeout(t)}},[cd[0]]);
  return <div style={{width:'100vw',height:'100vh',background:T.dark,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><div style={{animation:'bounceIn .5s ease'}}><IShield size="12vmin" color={T.gold} accent={T.gold}/></div><h2 style={{fontFamily:T.head,fontSize:'3.5vmin',fontWeight:700,color:T.white,marginTop:'3vh'}}>{S('sessEnd')}</h2><p style={{fontSize:'1.8vmin',color:T.greyMid,marginTop:'1vh'}}>{S('privProt')}</p><div style={{fontFamily:T.mono,fontSize:'1.5vmin',color:T.grey,marginTop:'3vh'}}>{cd[0]}...</div></div>;
}

/* ═══ APPSHELL — #4: 5min inactivity + full routing ═══ */
function AppShell() {
  var scr = useState('idle'), lang = useState('en'), phone = useState('');
  var authP = useState(null), isNewUser = useState(true);
  var trialRoom = useState([]), wardrobe = useState([]), cart = useState([]);
  var shortlisted = useState([]);
  var selP = useState(null), prevL = useState(null);
  var bodyScanDone = useState(false), lastScanDate = useState(null);
  var showCon = useState(false);
  var waShareCount = useState(0);
  var tMsg = useState(''), tType = useState('info'), tVis = useState(false);
  var camBlack = useState(false);
  var hist = useRef([]);

  var nav = useCallback(function(s,params){hist.current.push(scr[0]);if(params&&params.product)selP[1](params.product);scr[1](s)},[scr[0]]);
  var goBack = useCallback(function(){var p=hist.current.pop();if(p)scr[1](p)},[]);
  var goHome = useCallback(function(){hist.current=[];scr[1]('home')},[]);
  var toast = useCallback(function(m,t){tMsg[1](m);tType[1](t||'info');tVis[1](true)},[]);

  var needsScan = function(){if(!bodyScanDone[0])return true;if(!lastScanDate[0])return true;return(Date.now()-lastScanDate[0])/(1000*60*60*24*30)>=CFG.scanValidMonths};

  /* #4: 5-minute global inactivity auto-logout */
  var lastG = useRef(Date.now());
  useEffect(function(){
    var h = function(){lastG.current=Date.now()};
    window.addEventListener('touchstart',h);window.addEventListener('mousedown',h);
    var chk = setInterval(function(){
      if(scr[0]!=='idle'&&scr[0]!=='sessEnd'){
        if(Date.now()-lastG.current>CFG.inactivitySec*1000) wipe();
      }
    },10000);
    return function(){window.removeEventListener('touchstart',h);window.removeEventListener('mousedown',h);clearInterval(chk)};
  },[scr[0]]);

  var wipe = useCallback(function(){
    phone[1]('');authP[1](null);isNewUser[1](true);
    trialRoom[1]([]);wardrobe[1]([]);cart[1]([]);shortlisted[1]([]);
    selP[1](null);bodyScanDone[1](false);lastScanDate[1](null);
    waShareCount[1](0);showCon[1](false);hist.current=[];
    try{sessionStorage.clear()}catch(e){}
    scr[1]('sessEnd');camBlack[1](true);
    setTimeout(function(){camBlack[1](false);scr[1]('idle')},3000);
  },[]);
  var trigLogout = useCallback(function(){nav('dataSave')},[nav]);

  var ctx = {
    lang:lang[0],phone:phone[0],authPath:authP[0],
    trialRoom:trialRoom[0],setTrialRoom:trialRoom[1],
    wardrobe:wardrobe[0],setWardrobe:wardrobe[1],
    cart:cart[0],setCart:cart[1],
    shortlisted:shortlisted[0],
    waShareCount:waShareCount[0],incWAShare:function(n){waShareCount[1](function(v){return v+(n||1)})},
    navigate:nav,goBack:goBack,goHome:goHome,triggerLogout:trigLogout,showToast:toast,
  };

  /* Auth handlers */
  var hTablet = function(){authP[1]('tablet');isNewUser[1](false);shortlisted[1](TABLET_SHORTLIST);goHome()};
  var hPhone = function(ph){phone[1](ph);authP[1]('phone');nav('otp')};
  var hOTPVerify = function(){if(isNewUser[0]&&needsScan()){showCon[1](true)}else{goHome()}};
  var hConAllow = function(){showCon[1](false);nav('bodyScan')};
  var hScanDone = function(){bodyScanDone[1](true);lastScanDate[1](Date.now());nav('aiProc')};

  var render = function(){
    switch(scr[0]){
      case 'idle': return <IdleScr onStart={function(){nav('lang')}}/>;
      case 'lang': return <LangScr onSelect={function(c){lang[1](c);prevL[1](c);nav('auth')}} prev={prevL[0]}/>;
      case 'auth': return <AuthScr onTablet={hTablet} onPhone={hPhone} onBack={goBack}/>;
      case 'otp': return <OtpScr phone={phone[0]} onVerify={hOTPVerify} onBack={goBack}/>;
      case 'bodyScan': return <ScanScr onCapture={hScanDone} onBack={goBack}/>;
      case 'aiProc': return <AIScr onDone={function(){
        /* #7/#1: After AI, go to trial if items exist, else home */
        if(trialRoom[0].length>0){scr[1]('trialRoom')}else{isNewUser[1](false);goHome()}
      }}/>;
      case 'home': return <HomeScr onProd={function(pr){selP[1](pr);nav('prodDet',{product:pr})}} onSendToTrial={function(){nav('aiProc')}}/>;
      case 'prodDet': return selP[0] ? <ProdScr p={selP[0]} onBack={goBack}/> : null;
      case 'trialRoom': return <TrialScr/>;
      case 'ward': return <WardScr/>;
      case 'order': return <OrderScr onBack={goBack}/>;
      case 'tailors': return <TailorScr onBack={goBack}/>;
      case 'dataSave': return <DataScr onSave={function(){toast('Saved','success');nav('feed')}} onDel={function(){wardrobe[1]([]);trialRoom[1]([]);cart[1]([]);bodyScanDone[1](false);toast('Deleted','info');nav('feed')}}/>;
      case 'feed': return <FeedScr onSubmit={function(){wipe()}} onHome={goHome} onLogout={wipe}/>;
      case 'sessEnd': return <EndScr onDone={function(){camBlack[1](false);scr[1]('idle')}}/>;
      default: return <IdleScr onStart={function(){nav('lang')}}/>;
    }
  };

  return <Ctx.Provider value={ctx}><GS/>
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',position:'relative'}}>{render()}</div>
    {camBlack[0]&&<div style={{position:'fixed',inset:0,background:T.black,zIndex:9998,animation:'fadeIn .3s ease'}}/>}
    <ConsentScr vis={showCon[0]} onAllow={hConAllow} onCancel={function(){showCon[1](false);goHome()}}/>
    <Toast msg={tMsg[0]} type={tType[0]} vis={tVis[0]} onClose={function(){tVis[1](false)}}/>
  </Ctx.Provider>;
}

export default AppShell;
