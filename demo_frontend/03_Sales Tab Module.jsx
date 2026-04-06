import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════
// WEARIFY SALES TABLET — SESSION 1 v2  ·  PREMIUM EDITION
// Enhanced: Landscape layout · 9 languages · Session timer · Mirror status
//           Staff Presenting mode · Draping guide · Auspicious colours
//           Noise texture · Screen transitions · Visit note · i18n
// ═══════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────
// LANGUAGE SYSTEM — 9 Languages
// ─────────────────────────────────────────────────────
const LANGS = {
  en: { id:"en", name:"English",    native:"English",    script:"Latin",      flag:"🇬🇧" },
  hi: { id:"hi", name:"Hindi",      native:"हिंदी",      script:"Devanagari", flag:"🇮🇳" },
  mr: { id:"mr", name:"Marathi",    native:"मराठी",      script:"Devanagari", flag:"🪷" },
  kn: { id:"kn", name:"Kannada",    native:"ಕನ್ನಡ",     script:"Kannada",    flag:"🌸" },
  ta: { id:"ta", name:"Tamil",      native:"தமிழ்",      script:"Tamil",      flag:"🌺" },
  te: { id:"te", name:"Telugu",     native:"తెలుగు",     script:"Telugu",     flag:"🌻" },
  bn: { id:"bn", name:"Bengali",    native:"বাংলা",      script:"Bengali",    flag:"🌼" },
  gu: { id:"gu", name:"Gujarati",   native:"ગુજરાતી",   script:"Gujarati",   flag:"🌾" },
  ml: { id:"ml", name:"Malayalam",  native:"മലയാളം",     script:"Malayalam",  flag:"🌴" },
};

const STRINGS = {
  en: {
    good_morning:"Good morning", good_afternoon:"Good afternoon", good_evening:"Good evening",
    welcome_to:"Welcome to", our_tagline:"Where Tradition Meets Intelligence",
    new_customer:"New Customer", returning:"Returning Customer", guest:"Browse as Guest",
    new_desc:"Register with phone · unlock Smart Mirror & AI personalisation",
    returning_desc:"Verify phone · load your preferences & try-on history",
    guest_desc:"Browse catalogue · Mirror & WhatsApp unavailable",
    enter_pin:"Enter your PIN", staff_login:"Staff Access",
    send_otp:"Send OTP", verify_otp:"Verify OTP", otp_sent:"OTP sent to",
    resend:"Resend OTP", resend_in:"Resend in",
    privacy_title:"Your privacy matters", privacy_sub:"Choose what you'd like to share",
    visit_history:"Visit History & Preferences", visit_hist_desc:"Save occasion preferences and try-on history for better recommendations next visit.",
    whatsapp_updates:"WhatsApp Updates", wa_desc:"Receive try-on photos and new collection alerts. Max 2 messages per month.",
    ai_personal:"AI Personalisation", ai_desc:"Let AI Stylist learn your taste across visits for personalised recommendations.",
    i_agree:"I Agree · Start Shopping", no_thanks:"Continue without saving",
    occasion_title:"What's the occasion today?", budget_title:"Approximate budget?",
    colour_pref:"Colour preference?", optional:"Optional",
    show_sarees:"Show Me Beautiful Sarees",
    select_occasion:"Please select an occasion to continue",
    search_placeholder:"Search by name, fabric, occasion…",
    trending:"Trending This Week", new_arrivals:"New Arrivals",
    for_you:"Just for You", browse_all:"Complete Collection",
    add_shortlist:"Add to Shortlist", in_shortlist:"In Shortlist",
    send_mirror:"Send to Mirror →",
    about_saree:"About this Saree", ai_tip:"AI Styling Tip",
    care:"Care Instructions", you_may_love:"You Might Also Love",
    draping:"Draping Styles for this Saree",
    auspicious:"Auspicious Colours",
    on_display:"On Display", in_storage:"In Storage", being_shown:"Being Shown",
    over_budget:"over your budget", find_alt:"find alternatives",
    shortlist_tab:"Shortlist", ai_tab:"AI Stylist", customer_tab:"Customer", shift_tab:"My Shift",
    session_label:"Session", mirror_on:"Mirror", mirror_off:"No Mirror",
    presenting_on:"Presenting", presenting_off:"Staff View",
    language:"Language", choose_lang:"Choose your language",
    festival_in:"in", days:"days",
    sarees_found:"sarees found", nothing_found:"Nothing found",
    nothing_found_sub:"Try different search terms or browse by occasion",
    your_shortlist:"Your Shortlist", shortlist_empty:"Your shortlist is empty",
    shortlist_empty_sub:"Browse the collection and add sarees you love",
    explore:"Explore Collection",
    sarees_selected:"sarees selected",
    visit_note:"Add a visit note", visit_note_ph:"e.g. daughter's wedding in December, needs 5 sarees",
    save_note:"Save Note", skip:"Skip",
    demo_otp:"Demo OTP",
  },
  hi: {
    good_morning:"सुप्रभात", good_afternoon:"नमस्कार", good_evening:"शुभ संध्या",
    welcome_to:"में आपका स्वागत है", our_tagline:"जहाँ परंपरा बुद्धिमत्ता से मिलती है",
    new_customer:"नई ग्राहक", returning:"परिचित ग्राहक", guest:"अतिथि के रूप में देखें",
    new_desc:"फोन से रजिस्टर करें · स्मार्ट मिरर और AI का उपयोग करें",
    returning_desc:"फोन वेरीफाई करें · अपनी पसंद और इतिहास देखें",
    guest_desc:"संग्रह देखें · मिरर और WhatsApp उपलब्ध नहीं",
    enter_pin:"अपना PIN डालें", staff_login:"स्टाफ लॉगिन",
    send_otp:"OTP भेजें", verify_otp:"OTP जाँचें", otp_sent:"OTP भेजा गया",
    resend:"OTP दोबारा भेजें", resend_in:"दोबारा भेजें",
    privacy_title:"आपकी गोपनीयता महत्वपूर्ण है", privacy_sub:"चुनें कि आप क्या साझा करना चाहती हैं",
    visit_history:"विज़िट इतिहास और पसंद", visit_hist_desc:"अगली विज़िट में बेहतर सुझाव के लिए पसंद और इतिहास सहेजें।",
    whatsapp_updates:"WhatsApp अपडेट", wa_desc:"ट्राय-ऑन फ़ोटो और नए संग्रह की सूचना। महीने में अधिकतम 2 संदेश।",
    ai_personal:"AI व्यक्तिगतकरण", ai_desc:"AI स्टाइलिस्ट को आपकी पसंद सीखने दें।",
    i_agree:"मैं सहमत हूँ · खरीदारी शुरू करें", no_thanks:"बिना सहेजे जारी रखें",
    occasion_title:"आज का अवसर क्या है?", budget_title:"अनुमानित बजट?",
    colour_pref:"रंग की पसंद?", optional:"वैकल्पिक",
    show_sarees:"सुंदर साड़ियाँ दिखाएं",
    select_occasion:"जारी रखने के लिए अवसर चुनें",
    search_placeholder:"नाम, कपड़ा, अवसर से खोजें…",
    trending:"इस सप्ताह ट्रेंडिंग", new_arrivals:"नई आवक",
    for_you:"आपके लिए", browse_all:"पूरा संग्रह",
    add_shortlist:"शॉर्टलिस्ट में जोड़ें", in_shortlist:"शॉर्टलिस्ट में है",
    send_mirror:"मिरर पर भेजें →",
    about_saree:"इस साड़ी के बारे में", ai_tip:"AI स्टाइलिंग सुझाव",
    care:"देखभाल निर्देश", you_may_love:"आपको यह भी पसंद आ सकता है",
    draping:"इस साड़ी के लिए पहनने के तरीके",
    auspicious:"शुभ रंग",
    on_display:"प्रदर्शित", in_storage:"भंडार में", being_shown:"दिखाया जा रहा है",
    over_budget:"बजट से अधिक", find_alt:"विकल्प खोजें",
    shortlist_tab:"शॉर्टलिस्ट", ai_tab:"AI स्टाइलिस्ट", customer_tab:"ग्राहक", shift_tab:"मेरी शिफ्ट",
    session_label:"सत्र", mirror_on:"मिरर", mirror_off:"मिरर नहीं",
    presenting_on:"प्रेज़ेंटिंग", presenting_off:"स्टाफ व्यू",
    language:"भाषा", choose_lang:"अपनी भाषा चुनें",
    festival_in:"में", days:"दिन",
    sarees_found:"साड़ियाँ मिलीं", nothing_found:"कुछ नहीं मिला",
    nothing_found_sub:"अलग शब्दों से खोजें या अवसर से ब्राउज़ करें",
    your_shortlist:"आपकी शॉर्टलिस्ट", shortlist_empty:"शॉर्टलिस्ट खाली है",
    shortlist_empty_sub:"संग्रह देखें और पसंदीदा साड़ियाँ जोड़ें",
    explore:"संग्रह देखें",
    sarees_selected:"साड़ियाँ चुनी गई हैं",
    visit_note:"विज़िट नोट जोड़ें", visit_note_ph:"जैसे: दिसंबर में बेटी की शादी, 5 साड़ियाँ चाहिए",
    save_note:"नोट सहेजें", skip:"छोड़ें",
    demo_otp:"डेमो OTP",
  },
  mr: {
    good_morning:"सुप्रभात", good_afternoon:"नमस्कार", good_evening:"शुभ संध्याकाळ",
    welcome_to:"मध्ये आपले स्वागत", our_tagline:"जिथे परंपरा बुद्धिमत्तेला भेटते",
    new_customer:"नवीन ग्राहक", returning:"परत आलेली ग्राहक", guest:"अतिथी म्हणून पाहा",
    enter_pin:"तुमचा PIN टाका", staff_login:"स्टाफ लॉगिन",
    send_otp:"OTP पाठवा", verify_otp:"OTP तपासा", otp_sent:"OTP पाठवले",
    privacy_title:"तुमची गोपनीयता महत्त्वाची", privacy_sub:"काय शेअर करायचे ते निवडा",
    i_agree:"मी सहमत आहे · खरेदी सुरू करा", no_thanks:"न सेव्ह करता सुरू ठेवा",
    occasion_title:"आजचा प्रसंग काय आहे?", budget_title:"अंदाजे बजेट?",
    colour_pref:"रंगाची आवड?", optional:"पर्यायी",
    show_sarees:"सुंदर साड्या दाखवा",
    select_occasion:"पुढे जाण्यासाठी प्रसंग निवडा",
    search_placeholder:"नाव, कापड, प्रसंगाने शोधा…",
    trending:"या आठवड्यात ट्रेंडिंग", new_arrivals:"नवीन आगमन",
    for_you:"तुमच्यासाठी", browse_all:"संपूर्ण संग्रह",
    add_shortlist:"शॉर्टलिस्टमध्ये जोडा", in_shortlist:"शॉर्टलिस्टमध्ये आहे",
    send_mirror:"मिररवर पाठवा →",
    about_saree:"या साडीबद्दल", ai_tip:"AI स्टाइलिंग टिप",
    care:"काळजी सूचना", you_may_love:"तुम्हालाही आवडेल",
    draping:"या साडीसाठी नेसण्याच्या पद्धती",
    auspicious:"शुभ रंग",
    on_display:"प्रदर्शित", in_storage:"साठ्यात", being_shown:"दाखवले जात आहे",
    over_budget:"बजेटपेक्षा जास्त", find_alt:"पर्याय शोधा",
    shortlist_tab:"शॉर्टलिस्ट", ai_tab:"AI स्टाइलिस्ट", customer_tab:"ग्राहक", shift_tab:"माझी शिफ्ट",
    session_label:"सत्र", mirror_on:"मिरर", mirror_off:"मिरर नाही",
    presenting_on:"सादर करत आहे", presenting_off:"स्टाफ व्ह्यू",
    language:"भाषा", choose_lang:"तुमची भाषा निवडा",
    festival_in:"मध्ये", days:"दिवस",
    sarees_found:"साड्या सापडल्या", nothing_found:"काही सापडले नाही",
    nothing_found_sub:"वेगळ्या शब्दांनी शोधा",
    your_shortlist:"तुमची शॉर्टलिस्ट", shortlist_empty:"शॉर्टलिस्ट रिकामी आहे",
    shortlist_empty_sub:"संग्रह पाहा आणि आवडत्या साड्या जोडा",
    explore:"संग्रह पाहा",
    sarees_selected:"साड्या निवडल्या",
    visit_note:"भेट नोंद जोडा", visit_note_ph:"उदा. डिसेंबरमध्ये मुलीचे लग्न, 5 साड्या हव्यात",
    save_note:"नोंद जतन करा", skip:"वगळा",
    demo_otp:"डेमो OTP",
    new_desc:"फोनने नोंदणी करा · स्मार्ट मिरर वापरा",
    returning_desc:"फोन व्हेरिफाय करा · तुमचा इतिहास पाहा",
    guest_desc:"संग्रह पाहा · मिरर उपलब्ध नाही",
    visit_history:"भेट इतिहास", visit_hist_desc:"पुढच्या भेटीसाठी पसंती जतन करा.",
    whatsapp_updates:"WhatsApp अपडेट", wa_desc:"ट्राय-ऑन फोटो आणि नवीन संग्रह अलर्ट.",
    ai_personal:"AI वैयक्तिकरण", ai_desc:"AI ला तुमची आवड शिकू द्या.",
  },
  kn: {
    good_morning:"ಶುಭೋದಯ", good_afternoon:"ನಮಸ್ಕಾರ", good_evening:"ಶುಭ ಸಂಜೆ",
    welcome_to:"ಗೆ ಸ್ವಾಗತ", our_tagline:"ಸಂಪ್ರದಾಯ ಬುದ್ಧಿವಂತಿಕೆಯನ್ನು ಭೇಟಿಯಾಗುವ ಸ್ಥಳ",
    new_customer:"ಹೊಸ ಗ್ರಾಹಕ", returning:"ಮರಳಿ ಬಂದ ಗ್ರಾಹಕ", guest:"ಅತಿಥಿಯಾಗಿ ವೀಕ್ಷಿಸಿ",
    enter_pin:"ನಿಮ್ಮ PIN ನಮೂದಿಸಿ", staff_login:"ಸ್ಟಾಫ್ ಲಾಗಿನ್",
    send_otp:"OTP ಕಳುಹಿಸಿ", verify_otp:"OTP ಪರಿಶೀಲಿಸಿ", otp_sent:"OTP ಕಳುಹಿಸಲಾಗಿದೆ",
    privacy_title:"ನಿಮ್ಮ ಗೌಪ್ಯತೆ ಮುಖ್ಯ", privacy_sub:"ಏನು ಹಂಚಿಕೊಳ್ಳಬೇಕೆಂದು ಆಯ್ಕೆ ಮಾಡಿ",
    i_agree:"ನಾನು ಒಪ್ಪುತ್ತೇನೆ · ಶಾಪಿಂಗ್ ಶುರು", no_thanks:"ಉಳಿಸದೆ ಮುಂದುವರಿಯಿರಿ",
    occasion_title:"ಇಂದಿನ ಸಂದರ್ಭ ಯಾವುದು?", budget_title:"ಅಂದಾಜು ಬಜೆಟ್?",
    colour_pref:"ಬಣ್ಣದ ಆದ್ಯತೆ?", optional:"ಐಚ್ಛಿಕ",
    show_sarees:"ಸುಂದರ ಸೀರೆಗಳನ್ನು ತೋರಿಸಿ",
    select_occasion:"ಮುಂದುವರಿಯಲು ಸಂದರ್ಭ ಆಯ್ಕೆ ಮಾಡಿ",
    search_placeholder:"ಹೆಸರು, ಬಟ್ಟೆ, ಸಂದರ್ಭದಿಂದ ಹುಡುಕಿ…",
    trending:"ಈ ವಾರ ಟ್ರೆಂಡಿಂಗ್", new_arrivals:"ಹೊಸ ಆಗಮನ",
    for_you:"ನಿಮಗಾಗಿ", browse_all:"ಸಂಪೂರ್ಣ ಸಂಗ್ರಹ",
    add_shortlist:"ಶಾರ್ಟ್‌ಲಿಸ್ಟ್‌ಗೆ ಸೇರಿಸಿ", in_shortlist:"ಶಾರ್ಟ್‌ಲಿಸ್ಟ್‌ನಲ್ಲಿದೆ",
    send_mirror:"ಮಿರರ್‌ಗೆ ಕಳುಹಿಸಿ →",
    about_saree:"ಈ ಸೀರೆಯ ಬಗ್ಗೆ", ai_tip:"AI ಸ್ಟೈಲಿಂಗ್ ಟಿಪ್",
    care:"ಆರೈಕೆ ಸೂಚನೆಗಳು", you_may_love:"ನಿಮಗೂ ಇಷ್ಟವಾಗಬಹುದು",
    draping:"ಈ ಸೀರೆಗೆ ಉಡಿಗೆ ಶೈಲಿಗಳು",
    auspicious:"ಶುಭ ಬಣ್ಣಗಳು",
    on_display:"ಪ್ರದರ್ಶನದಲ್ಲಿ", in_storage:"ಸಂಗ್ರಹದಲ್ಲಿ", being_shown:"ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    over_budget:"ಬಜೆಟ್ ಮೀರಿದೆ", find_alt:"ಪರ್ಯಾಯ ಹುಡುಕಿ",
    shortlist_tab:"ಶಾರ್ಟ್‌ಲಿಸ್ಟ್", ai_tab:"AI ಸ್ಟೈಲಿಸ್ಟ್", customer_tab:"ಗ್ರಾಹಕ", shift_tab:"ನನ್ನ ಶಿಫ್ಟ್",
    session_label:"ಸೆಷನ್", mirror_on:"ಮಿರರ್", mirror_off:"ಮಿರರ್ ಇಲ್ಲ",
    presenting_on:"ತೋರಿಸಲಾಗುತ್ತಿದೆ", presenting_off:"ಸ್ಟಾಫ್ ವ್ಯೂ",
    language:"ಭಾಷೆ", choose_lang:"ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ",
    festival_in:"ನಲ್ಲಿ", days:"ದಿನಗಳು",
    sarees_found:"ಸೀರೆಗಳು ಸಿಕ್ಕಿವೆ", nothing_found:"ಏನೂ ಸಿಗಲಿಲ್ಲ",
    nothing_found_sub:"ಬೇರೆ ಪದಗಳಿಂದ ಹುಡುಕಿ",
    your_shortlist:"ನಿಮ್ಮ ಶಾರ್ಟ್‌ಲಿಸ್ಟ್", shortlist_empty:"ಶಾರ್ಟ್‌ಲಿಸ್ಟ್ ಖಾಲಿಯಾಗಿದೆ",
    shortlist_empty_sub:"ಸಂಗ್ರಹ ನೋಡಿ ಮತ್ತು ಇಷ್ಟದ ಸೀರೆಗಳನ್ನು ಸೇರಿಸಿ",
    explore:"ಸಂಗ್ರಹ ನೋಡಿ",
    sarees_selected:"ಸೀರೆಗಳು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ",
    visit_note:"ಭೇಟಿ ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ", visit_note_ph:"ಉದಾ. ಡಿಸೆಂಬರ್‌ನಲ್ಲಿ ಮಗಳ ಮದುವೆ, 5 ಸೀರೆಗಳು ಬೇಕು",
    save_note:"ಟಿಪ್ಪಣಿ ಉಳಿಸಿ", skip:"ಬಿಟ್ಟುಬಿಡಿ",
    demo_otp:"ಡೆಮೋ OTP",
    new_desc:"ಫೋನ್‌ನಿಂದ ನೋಂದಾಯಿಸಿ · ಸ್ಮಾರ್ಟ್ ಮಿರರ್ ಬಳಸಿ",
    returning_desc:"ಫೋನ್ ಪರಿಶೀಲಿಸಿ · ಇತಿಹಾಸ ನೋಡಿ",
    guest_desc:"ಸಂಗ್ರಹ ನೋಡಿ · ಮಿರರ್ ಲಭ್ಯವಿಲ್ಲ",
    visit_history:"ಭೇಟಿ ಇತಿಹಾಸ", visit_hist_desc:"ಮುಂದಿನ ಭೇಟಿಗೆ ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಿ.",
    whatsapp_updates:"WhatsApp ಅಪ್‌ಡೇಟ್", wa_desc:"ಟ್ರೈ-ಆನ್ ಫೋಟೋ ಮತ್ತು ಹೊಸ ಸಂಗ್ರಹ ಅಲರ್ಟ್.",
    ai_personal:"AI ವೈಯಕ್ತಿಕಗೊಳಿಸುವಿಕೆ", ai_desc:"AI ಗೆ ನಿಮ್ಮ ಅಭಿರುಚಿ ಕಲಿಯಲು ಅವಕಾಶ ನೀಡಿ.",
  },
};
// Fill remaining languages with English fallback
["te","bn","gu","ml"].forEach(id => { STRINGS[id] = {...STRINGS.en}; });

const LangCtx = createContext({ lang:"en", s:STRINGS.en, setLang:()=>{} });
const useLang = () => useContext(LangCtx);

// ─────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────
const T = {
  plum:"#2D1B4E", plumL:"#4A2D6E", plumD:"#1A0A2E", plumXD:"#0D0418",
  plumGhost:"#F4EFF9", plumTint:"#2D1B4E18",
  gold:"#C9941A", goldL:"#E8C46A", goldD:"#8B6914", goldXD:"#5C4510",
  goldGhost:"#FDF5E4", goldTint:"#C9941A18",
  rose:"#C2848A", roseL:"#F0D0D4", roseD:"#8B4A52", roseTint:"#C2848A18",
  ivory:"#FDF8F0", blush:"#FBF0F4", cream:"#F5EDE4", linen:"#EEE4D8",
  white:"#FFFFFF",
  text:"#1A0A1E", textMid:"#4A3558", textMuted:"#8B7EA0", textGhost:"#B8A8C8",
  onDark:"#FDF8F0",
  success:"#1B5E20", successBg:"#E8F5E9",
  error:"#B71C1C", errorBg:"#FFEBEE",
  amber:"#E65100", amberBg:"#FFF3E0",
  border:"#E8D5E0", borderGold:"#DFC07A", borderL:"#F2E8EE",
  shadow:"0 4px 20px rgba(45,27,78,.10)",
  shadowSm:"0 2px 8px rgba(45,27,78,.07)",
  shadowMd:"0 6px 24px rgba(45,27,78,.14)",
  shadowLg:"0 12px 48px rgba(45,27,78,.20)",
  shadowGold:"0 4px 20px rgba(201,148,26,.28)",
  shadowXL:"0 24px 80px rgba(26,10,46,.35)",
  r:"16px", rSm:"10px", rMd:"12px", rLg:"24px", rXl:"32px", rPill:"100px",
  gradPlum:"linear-gradient(135deg, #2D1B4E 0%, #4A2D6E 100%)",
  gradPlumD:"linear-gradient(160deg, #1A0A2E 0%, #2D1B4E 60%, #4A2D6E 100%)",
  gradGold:"linear-gradient(135deg, #C9941A 0%, #E8C46A 55%, #C9941A 100%)",
  gradHero:"linear-gradient(150deg, #0D0418 0%, #1A0A2E 25%, #2D1B4E 55%, #6B1D52 80%, #C9941A 100%)",
  gradCard:"linear-gradient(180deg, rgba(26,10,46,0) 30%, rgba(13,4,24,.92) 100%)",
  gradGlass:"linear-gradient(135deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,.04) 100%)",
};

// ─────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────
const MOCK = {
  store:{ name:"Ramesh Silks & Sarees", short:"Ramesh Silks", city:"Varanasi", since:"1987",
    tagline:"Where Tradition Meets Intelligence",
    festivalAlert:{ name:"Navratri", daysAway:12 } },
  staff:[
    { id:"S01", name:"Mohan Kumar",  pin:"1234", role:"Senior Associate", initials:"MK" },
    { id:"S02", name:"Anita Devi",   pin:"5678", role:"Sales Associate",   initials:"AD" },
    { id:"S03", name:"Rajesh Singh", pin:"9012", role:"Trainee Associate", initials:"RS" },
  ],
  sarees:[
    { id:"SAR001", name:"Kanjivaram Pure Silk", subtitle:"Handwoven Temple Border",
      fabric:"Silk", weave:"Kanjivaram", weight:"Heavy", price:45000, region:"Tamil Nadu",
      occasion:["Wedding","Festival"], colors:["Crimson","Antique Gold"],
      grad:["#3D0A2E","#8B1D52"], weavePattern:"diagonal",
      tags:["Heritage","Bridal","24K Zari","Pure Silk"],
      description:"A masterpiece of Kanjivaram weaving tradition. The rich crimson base is woven from pure mulberry silk with 24-karat gold zari temple borders — a timeless bridal heirloom.",
      aiTip:"Perfect for weddings. Heavy silk drapes beautifully in Tamil or Nivi style. The golden temple border catches evening light magnificently. Pairs best with a deep green or gold silk blouse.",
      care:"Dry clean only · Store in muslin cloth · Avoid direct sunlight",
      auspicious:{ wedding:["Crimson","Maroon","Pink"], festival:["Saffron","Green","Yellow"] },
      drapingStyles:["nivi","tamil","gujarati"],
      inStock:"floor", stockCount:2, isNew:false, daysOld:45, tryCount:28 },
    { id:"SAR002", name:"Banarasi Georgette", subtitle:"Meenakari Floral Motifs",
      fabric:"Georgette", weave:"Banarasi", weight:"Light", price:18500, region:"Varanasi",
      occasion:["Wedding","Party","Festival"], colors:["Royal Blue","Silver"],
      grad:["#0D1F3C","#1B3D72"], weavePattern:"grid",
      tags:["Trending","Lightweight","Meenakari","Local Craft"],
      description:"Woven in our own Varanasi, this Banarasi georgette features intricate silver meenakari floral motifs. Lighter than traditional Banarasi silk — elegance with every-day comfort.",
      aiTip:"Our best-seller this season. Light georgette is perfect for wedding functions — looks grand without the weight. Silver motifs catch the evening light beautifully.",
      care:"Gentle hand wash or dry clean · Iron on low heat · Store flat",
      auspicious:{ wedding:["Royal Blue","Navy","Purple"], festival:["Red","Green","Yellow"] },
      drapingStyles:["nivi","bengali","kashmiri"],
      festivalPick:true, inStock:"floor", stockCount:5, isNew:true, daysOld:8, tryCount:42 },
    { id:"SAR003", name:"Chanderi Cotton Silk", subtitle:"Sheer Zari Checks",
      fabric:"Cotton Silk", weave:"Chanderi", weight:"Light", price:5200, region:"Madhya Pradesh",
      occasion:["Office","Daily","Festival"], colors:["Sage Green","Gold"],
      grad:["#1B3D2E","#2E6B4A"], weavePattern:"check",
      tags:["Breathable","Office-Friendly","Handloom","Sheer"],
      description:"The legendary Chanderi — once called 'woven air'. This cotton-silk blend is the finest choice for daily wear and office occasions, offering comfort without compromising grace.",
      aiTip:"If she wants one saree for office and festivals alike, Chanderi is perfect. Sheer texture looks incredibly premium but feels featherlight.",
      care:"Hand wash in cold water · Dry in shade · Light iron",
      auspicious:{ festival:["Green","Yellow","White"], office:["Pastels","Beige","Grey"] },
      drapingStyles:["nivi","gujarati"],
      inStock:"floor", stockCount:12, isNew:false, daysOld:30, tryCount:18 },
    { id:"SAR004", name:"Mysore Silk Crepe", subtitle:"GI Tagged · Natural Sheen",
      fabric:"Silk", weave:"Mysore", weight:"Medium", price:22000, region:"Karnataka",
      occasion:["Wedding","Festival","Party"], colors:["Royal Purple","Gold"],
      grad:["#2D0A4E","#5A1A8B"], weavePattern:"diagonal",
      tags:["GI Tagged","Lustrous","Karnataka","Premium"],
      description:"GI-tagged Mysore silk with its characteristic crepe texture and natural sheen. The interlocked warp weave gives unmatched durability while maintaining a luxurious drape.",
      aiTip:"A gorgeous mid-range option. The purple Mysore silk has incredible natural sheen — looks like it costs three times more. Great for weddings without the bridal price tag.",
      care:"Dry clean recommended · Store with camphor balls",
      auspicious:{ wedding:["Purple","Violet","Plum"], festival:["Yellow","Green","Purple"] },
      drapingStyles:["nivi","kodagu","karnataka"],
      inStock:"storage", stockCount:3, isNew:false, daysOld:95, tryCount:31 },
    { id:"SAR005", name:"Pochampally Ikat", subtitle:"Double Ikat Geometric",
      fabric:"Silk Cotton", weave:"Pochampally", weight:"Medium", price:8500, region:"Telangana",
      occasion:["Festival","Party","Casual"], colors:["Terracotta","Ivory"],
      grad:["#4A1500","#8B3000"], weavePattern:"ikat",
      tags:["Geometric","Handloom","GI Tagged","Statement"],
      description:"Pochampally's signature double ikat — both warp and weft threads are tie-dyed before weaving, creating geometric patterns that seem to float on the fabric.",
      aiTip:"For customers who want to stand out. Double ikat makes every Pochampally unique. Perfect for women who love ethnic fashion with a contemporary edge.",
      care:"Hand wash gently · Dry in shade · Do not bleach",
      auspicious:{ festival:["Terracotta","Orange","Red"], party:["Ivory","Gold","Brown"] },
      drapingStyles:["nivi","andhra"],
      inStock:"floor", stockCount:4, isNew:false, daysOld:22, tryCount:15 },
    { id:"SAR006", name:"Bengal Tant Cotton", subtitle:"Traditional Handloom",
      fabric:"Cotton", weave:"Tant", weight:"Light", price:3500, region:"West Bengal",
      occasion:["Daily","Festival","Casual"], colors:["Sky Blue","White"],
      grad:["#0D3349","#1B6080"], weavePattern:"grid",
      tags:["Everyday","Breathable","Summer-Perfect","Bengal"],
      description:"The quintessential Bengal Tant — supremely breathable and perfect for India's warm climate. The crisp cotton drapes effortlessly and only gets softer with every wash.",
      aiTip:"The most comfortable saree in India. Perfect for daily wear and Durga Puja. The sky blue is fresh and modern. Excellent for first-time saree wearers.",
      care:"Machine wash gentle · Tumble dry on low · Iron on medium",
      auspicious:{ festival:["White","Red border","Saffron"], casual:["Light blues","White","Pastels"] },
      drapingStyles:["bengali","nivi"],
      inStock:"floor", stockCount:18, isNew:false, daysOld:15, tryCount:9 },
    { id:"SAR007", name:"Paithani Silk", subtitle:"Peacock & Vine Border",
      fabric:"Silk", weave:"Paithani", weight:"Heavy", price:35000, region:"Maharashtra",
      occasion:["Wedding","Festival"], colors:["Deep Teal","Gold"],
      grad:["#003D2E","#006B50"], weavePattern:"diagonal",
      tags:["Maharashtra Heritage","Peacock Motif","Bridal","Heirloom"],
      description:"A revered Maharashtrian tradition — Paithani silk features the iconic peacock and vine border woven entirely by hand. Each feather in the peacock is individually crafted.",
      aiTip:"If she's Maharashtrian or loves Maharashtrian culture, this Paithani will move her — it's a family heirloom saree. The peacock border has individual feathers woven in. Truly special.",
      care:"Dry clean only · Wrap in butter paper for storage",
      auspicious:{ wedding:["Teal","Green","Gold","Yellow"], festival:["Green","Purple","Peacock Blue"] },
      drapingStyles:["nauvari","nivi","maharashtrian"],
      inStock:"floor", stockCount:1, isNew:false, daysOld:60, tryCount:22 },
    { id:"SAR008", name:"Sambalpuri Ikat", subtitle:"Bandhakala Tie-Dye",
      fabric:"Silk Cotton", weave:"Sambalpuri", weight:"Medium", price:8500, region:"Odisha",
      occasion:["Festival","Party","Casual"], colors:["Deep Gold","Black"],
      grad:["#2D2A00","#6B6500"], weavePattern:"ikat",
      tags:["Odisha Heritage","Bandhakala","Artistic","Limited"],
      description:"Sambalpuri's ancient Bandhakala technique creates complex resist-dyed patterns on silk cotton. Each saree takes weeks to complete — a wearable work of art.",
      aiTip:"A very special handloom saree from Odisha. Deep gold and black is a striking, unusual combination. Great for festivals and parties where she wants to look truly unique.",
      care:"Hand wash with mild soap · Dry in shade",
      auspicious:{ festival:["Gold","Deep Yellow","Turmeric"], party:["Black-Gold","Bronze","Copper"] },
      drapingStyles:["nivi","odia"],
      inStock:"floor", stockCount:3, isNew:true, daysOld:5, tryCount:7 },
  ],
  occasions:[
    { id:"wedding",label:"Wedding",   icon:"💍", grad:["#3D0A2E","#8B1D52"] },
    { id:"festival",label:"Festival", icon:"🪔", grad:["#3D1800","#8B4500"] },
    { id:"daily",   label:"Daily",    icon:"☀️", grad:["#0D3849","#1B6080"] },
    { id:"office",  label:"Office",   icon:"💼", grad:["#1B2D4E","#2D4A7E"] },
    { id:"party",   label:"Party",    icon:"✨", grad:["#2D0A4E","#5A1A8B"] },
    { id:"gift",    label:"Gift",     icon:"🎁", grad:["#1B3D2E","#2E6B4A"] },
  ],
  budgets:[
    { id:"u3k",   label:"Under ₹3,000",      max:3000 },
    { id:"3to8",  label:"₹3,000 – ₹8,000",   min:3000, max:8000 },
    { id:"8to20", label:"₹8,000 – ₹20,000",  min:8000, max:20000 },
    { id:"20to50",label:"₹20,000 – ₹50,000", min:20000, max:50000 },
    { id:"50plus",label:"₹50,000 & above",   min:50000 },
  ],
  colorOptions:[
    { id:"reds",    label:"Reds & Pinks",      swatch:"#C2305A" },
    { id:"blues",   label:"Blues & Greens",    swatch:"#1B5E8F" },
    { id:"golds",   label:"Golds & Yellows",   swatch:"#C9941A" },
    { id:"purples", label:"Purples & Maroons", swatch:"#6B1D8B" },
    { id:"earthy",  label:"Earthy Tones",      swatch:"#8B5E3C" },
    { id:"pastel",  label:"Pastels & Light",   swatch:"#C4B0D8" },
  ],
  drapingGuide:[
    { id:"nivi",         name:"Nivi",          region:"Pan-India",    desc:"The classic drape — versatile and universally elegant. Suitable for every occasion.", color:"#3D1B6E" },
    { id:"bengali",      name:"Bengali",       region:"Bengal",       desc:"Pallu draped from behind over left shoulder. Elegant at pujas and cultural events.", color:"#1B3D7E" },
    { id:"gujarati",     name:"Gujarati",      region:"Gujarat",      desc:"Pallu in front — bright, festive and celebratory. Perfect for weddings and navratri.", color:"#7E3D1B" },
    { id:"maharashtrian",name:"Maharashtrian", region:"Maharashtra",  desc:"Pallu tucked in front for the Nauvari style. Traditional and regal for Paithani.", color:"#1B7E3D" },
    { id:"kashmiri",     name:"Kashmiri",      region:"Kashmir",      desc:"Worn with jacket-style blouse. Ideal for heavily embroidered and Banarasi sarees.", color:"#3D5A1B" },
    { id:"tamil",        name:"Tamil",         region:"Tamil Nadu",   desc:"With pleats tucked in front. Traditional South Indian style for silk sarees.", color:"#7E1B3D" },
  ],
};

// ─────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────
function useOrientation() {
  const check = () => typeof window!=="undefined" && window.innerWidth > window.innerHeight && window.innerWidth >= 600;
  const [landscape, setLandscape] = useState(check);
  useEffect(() => {
    const h = () => setTimeout(() => setLandscape(check()), 150);
    window.addEventListener("resize", h);
    window.addEventListener("orientationchange", h);
    return () => { window.removeEventListener("resize",h); window.removeEventListener("orientationchange",h); };
  }, []);
  return landscape;
}

function useSessionTimer(running=true) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds(s => s+1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const m = Math.floor(seconds/60), s = seconds%60;
  return { seconds, label:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`,
    color: seconds<900 ? T.success : seconds<1500 ? T.amber : T.error };
}

// ─────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────
const fmt = n => "₹"+Number(n).toLocaleString("en-IN");
const mask = p => p ? `+91 ${p.slice(0,5)} ${"X".repeat(Math.max(0,p.length-7))}${p.slice(-2)}` : "";
const inBudget = (price, budget) => {
  if (!budget) return true;
  if (budget.max && price>budget.max) return false;
  if (budget.min && price<budget.min) return false;
  return true;
};
const greetKey = () => { const h=new Date().getHours(); return h<12?"good_morning":h<17?"good_afternoon":"good_evening"; };

// ─────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────
const GlobalStyles = () => (
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Sans:wght@400;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;-webkit-text-size-adjust:100%}
body{font-family:"DM Sans",-apple-system,BlinkMacSystemFont,sans-serif;background:#0D0418;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;min-height:100svh;overflow-x:hidden}
.serif{font-family:"Cormorant Garamond",Georgia,serif!important}
.mono{font-family:"DM Mono","JetBrains Mono",monospace!important}
.noto{font-family:"Noto Sans","DM Sans",sans-serif!important}

/* ── Keyframes ── */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideLeft{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
@keyframes popIn{from{opacity:0;transform:scale(0.55)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{transform:translateX(-130%)rotate(18deg)}100%{transform:translateX(260%)rotate(18deg)}}
@keyframes shimmerBg{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes heartBeat{0%,100%{transform:scale(1)}25%{transform:scale(1.4)}50%{transform:scale(1.1)}}
@keyframes dotBlink{0%,80%,100%{opacity:.2;transform:scale(.65)}40%{opacity:1;transform:scale(1)}}
@keyframes goldPulse{0%,100%{box-shadow:0 0 0 rgba(201,148,26,0)}50%{box-shadow:0 0 28px rgba(201,148,26,.45)}}
@keyframes borderGlow{0%,100%{border-color:rgba(201,148,26,.3)}50%{border-color:rgba(201,148,26,.85)}}
@keyframes floatDot{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes noise{0%,100%{transform:translate(0,0)}10%{transform:translate(-1%,-2%)}20%{transform:translate(1%,2%)}
  30%{transform:translate(-2%,1%)}40%{transform:translate(2%,-1%)}50%{transform:translate(-1%,2%)}
  60%{transform:translate(1%,-2%)}70%{transform:translate(-2%,-1%)}80%{transform:translate(2%,1%)}
  90%{transform:translate(-1%,0)}}
@keyframes glassReveal{from{opacity:0;backdrop-filter:blur(0px)}to{opacity:1;backdrop-filter:blur(16px)}}
@keyframes pageIn{from{opacity:0;transform:translateY(16px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes countUp{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes waveRing{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.2);opacity:0}}
@keyframes petalFall{0%{opacity:0;transform:translate(var(--px),var(--py)) rotate(0deg) scale(0)}
  10%{opacity:.8}80%{opacity:.5}100%{opacity:0;transform:translate(var(--ex),var(--ey)) rotate(var(--rot)) scale(.4)}}
@keyframes barFill{from{width:0}to{width:var(--w)}}
@keyframes countUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes heroFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.005)}}
@keyframes gradMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes ringPulse{0%{transform:scale(1);opacity:.5}70%{transform:scale(1.6);opacity:0}100%{opacity:0}}
@keyframes proofIn{from{opacity:0;transform:scale(.8) translateX(-10px)}to{opacity:1;transform:scale(1) translateX(0)}}
@keyframes stampIn{from{opacity:0;transform:scale(1.4) rotate(-8deg)}to{opacity:1;transform:scale(1) rotate(-4deg)}}

/* ── Animation helpers ── */
.anim-fadeIn{animation:fadeIn .4s ease both}
.anim-slideUp{animation:slideUp .55s cubic-bezier(.22,1,.36,1) both}
.anim-slideDown{animation:slideDown .4s cubic-bezier(.22,1,.36,1) both}
.anim-scaleIn{animation:scaleIn .38s cubic-bezier(.22,1,.36,1) both}
.anim-popIn{animation:popIn .3s cubic-bezier(.34,1.56,.64,1) both}
.anim-pageIn{animation:pageIn .45s cubic-bezier(.22,1,.36,1) both}
.d1{animation-delay:.05s}.d2{animation-delay:.10s}.d3{animation-delay:.15s}
.d4{animation-delay:.20s}.d5{animation-delay:.25s}.d6{animation-delay:.30s}
.d7{animation-delay:.35s}.d8{animation-delay:.40s}.d9{animation-delay:.45s}
.press:active{transform:scale(.93)!important;transition:transform .08s ease!important}
.press-lg:active{transform:scale(.97)!important;transition:transform .08s ease!important}
.hover-lift{transition:transform .2s ease,box-shadow .2s ease}
.hover-lift:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(45,27,78,.20)}

/* ── Silk shimmer ── */
.silk{position:relative;overflow:hidden}
.silk::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;
  background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.16) 50%,transparent 80%);
  animation:shimmer 5.5s ease-in-out infinite;pointer-events:none}

/* ── Gold shimmer text ── */
.gold-shimmer{background:linear-gradient(90deg,#C9941A 0%,#E8C46A 35%,#fff5c0 50%,#E8C46A 65%,#C9941A 100%);
  background-size:200% auto;-webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;animation:shimmerBg 3.5s linear infinite}

/* ── Paisley background ── */
.paisley{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cellipse cx='40' cy='32' rx='10' ry='17' fill='none' stroke='%23C9941A' stroke-width='.65' stroke-opacity='.14'/%3E%3Cellipse cx='40' cy='32' rx='5' ry='10' fill='none' stroke='%23C9941A' stroke-width='.5' stroke-opacity='.09'/%3E%3Ccircle cx='40' cy='22' r='2' fill='%23C9941A' fill-opacity='.11'/%3E%3Cpath d='M33 52 Q40 59 47 52' fill='none' stroke='%23C9941A' stroke-width='.5' stroke-opacity='.09'/%3E%3C/svg%3E");
  background-size:80px 80px}

/* ── Noise overlay ── */
.noise::before{content:'';position:absolute;inset:-50%;width:200%;height:200%;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity:.028;animation:noise 4s steps(1) infinite;pointer-events:none;z-index:0;border-radius:inherit}

/* ── Gold divider ── */
.zari{height:1px;background:linear-gradient(90deg,transparent 0%,rgba(201,148,26,.15) 15%,rgba(201,148,26,.65) 50%,rgba(201,148,26,.15) 85%,transparent 100%)}
.zari-v{width:1px;background:linear-gradient(180deg,transparent 0%,rgba(201,148,26,.2) 20%,rgba(201,148,26,.55) 50%,rgba(201,148,26,.2) 80%,transparent 100%)}

/* ── Scrollbars ── */
::-webkit-scrollbar{width:2px;height:2px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(201,148,26,.22);border-radius:4px}
.no-scroll::-webkit-scrollbar{display:none}
.no-scroll{-ms-overflow-style:none;scrollbar-width:none}

/* ── Text selection ── */
::selection{background:rgba(201,148,26,.25);color:#1A0A1E}

/* ── Root layout ── */
#wearify-root{min-height:100svh;display:flex;justify-content:center;align-items:flex-start;background:radial-gradient(ellipse at 50% 0%,#2D1B4E 0%,#0D0418 60%)}
.tablet{width:100%;max-width:420px;min-height:100svh;background:#FDF8F0;position:relative;overflow:hidden;display:flex;flex-direction:column}

/* ── Landscape layout ── */
@media(min-width:600px) and (orientation:landscape){
  #wearify-root{align-items:center;padding:0}
  .tablet{max-width:100vw;min-height:100svh;max-height:100svh;flex-direction:row;border-radius:0}
  .tablet-sidebar{width:252px;min-width:252px;height:100svh;background:#1A0A2E;display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;position:relative}
  .tablet-content{flex:1;height:100svh;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column}
  .hide-landscape{display:none!important}
  .bottom-nav{display:none!important}
  .grid-auto{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:12px!important}
  .detail-split{display:flex!important;flex-direction:row!important;height:100svh;overflow:hidden}
  .detail-split-left{width:40%;height:100svh;position:sticky;top:0;flex-shrink:0;overflow:hidden}
  .detail-split-right{flex:1;height:100svh;overflow-y:auto;-webkit-overflow-scrolling:touch}
  .detail-split-left-hide{display:none}
}
@media(min-width:600px) and (orientation:portrait){
  #wearify-root{padding:20px 0;background:radial-gradient(ellipse at 50% 0%,#2D1B4E 0%,#0D0418 60%)}
  .tablet{max-width:430px;min-height:calc(100svh - 40px);max-height:calc(100svh - 40px);border-radius:40px;
    box-shadow:0 32px 80px rgba(0,0,0,.65),0 0 0 8px #2D1B4E,0 0 0 10px rgba(201,148,26,.35);overflow:hidden}
  .tablet-sidebar{display:none}.tablet-content{flex:1;overflow-y:auto}
  .grid-auto{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .detail-split{display:block}.detail-split-left{display:none}.detail-split-right{height:auto;overflow:visible}
}
@media(max-width:599px){
  .tablet-sidebar{display:none}.tablet-content{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}
  .grid-auto{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .detail-split{display:block}.detail-split-left{display:none}.detail-split-right{height:auto;overflow:visible}
}

/* ── Screen container ── */
.screen{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
input:focus{outline:none}
button{cursor:pointer;border:none;background:none}

/* ── Typing dots ── */
.typing span{display:inline-block;width:7px;height:7px;border-radius:50%;background:#C9941A;margin:0 2px;animation:dotBlink 1.2s ease infinite}
.typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}

/* ── Badge animation ── */
.badge-pop{animation:countUp .25s cubic-bezier(.34,1.56,.64,1) both}

/* ── Gold border glow on active cards ── */
.card-selected{border-color:rgba(201,148,26,.7)!important;animation:borderGlow 2s ease infinite;box-shadow:0 0 0 2px rgba(201,148,26,.15),0 8px 28px rgba(45,27,78,.15)!important}

/* ── Glass panel ── */
.glass{background:rgba(253,248,240,.08);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(253,248,240,.12)}

/* ── Presenting mode overlay ── */
.presenting-mode .staff-only{display:none!important}
`}</style>
);

// ─────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ─────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────
const Icon = {
  search:(p={})=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  mic:(p={})=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  heart:({filled,size=22,color})=><svg width={size} height={size} viewBox="0 0 24 24" fill={filled?(color||T.gold):"none"} stroke={filled?(color||T.gold):"rgba(255,255,255,.9)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  back:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>,
  check:(p={})=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  close:(p={})=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  sparkle:(p={})=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5Z"/><path d="M5 3L5.75 5.25L8 6L5.75 6.75L5 9L4.25 6.75L2 6L4.25 5.25Z"/><path d="M19 14L19.5 15.5L21 16L19.5 16.5L19 18L18.5 16.5L17 16L18.5 15.5Z"/></svg>,
  user:(p={})=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  clock:(p={})=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  mirror:(p={})=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="2" width="16" height="18" rx="3"/><path d="M8 22h8"/><path d="M12 20v2"/><circle cx="12" cy="11" r="4"/></svg>,
  lang:(p={})=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  shield:(p={})=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  info:(p={})=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  lock:(p={})=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  eye:(p={})=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  menu:(p={})=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
};

// ─────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────
function Btn({ children, onClick, variant="plum", size="md", fullWidth, disabled, loading, style={}, className="" }) {
  const sz = { sm:{padding:"8px 16px",fontSize:13,height:36}, md:{padding:"13px 22px",fontSize:15,height:50}, lg:{padding:"15px 28px",fontSize:16,height:56} }[size];
  const v = { plum:{background:T.gradPlum,color:T.onDark,border:"none",boxShadow:"0 4px 18px rgba(45,27,78,.32)"},
    gold:{background:T.gradGold,color:T.plumD,border:"none",boxShadow:"0 4px 18px rgba(201,148,26,.35)"},
    outline:{background:"transparent",color:T.plum,border:`1.5px solid ${T.plum}`,boxShadow:"none"},
    ghost:{background:"transparent",color:T.plum,border:"none",boxShadow:"none"},
    ivory:{background:T.ivory,color:T.text,border:`1px solid ${T.border}`,boxShadow:T.shadowSm},
    glass:{background:"rgba(253,248,240,.12)",color:T.onDark,border:"1px solid rgba(253,248,240,.2)",boxShadow:"none"},
  }[variant]||{};
  return (
    <button onClick={disabled||loading?undefined:onClick} className={`press-lg ${className}`}
      style={{ ...v,...sz, width:fullWidth?"100%":"auto", borderRadius:T.rPill,
        fontFamily:"'DM Sans',sans-serif", fontWeight:600, letterSpacing:"0.2px",
        cursor:disabled||loading?"not-allowed":"pointer", opacity:disabled?.42:1,
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        transition:"opacity .15s,box-shadow .2s,transform .1s", flexShrink:0, ...style }}>
      {loading ? <span style={{ width:18,height:18,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block" }}/> : children}
    </button>
  );
}

function Tag({ children, color=T.plumL, bg, small, style={} }) {
  return <span style={{ display:"inline-flex",alignItems:"center",padding:small?"3px 9px":"4px 12px",borderRadius:T.rPill,background:bg||`${color}18`,color,fontSize:small?11:12,fontWeight:600,letterSpacing:"0.2px",whiteSpace:"nowrap",...style }}>{children}</span>;
}

function Card({ children, style={}, onClick, className="" }) {
  return <div onClick={onClick} className={className} style={{ background:T.white,borderRadius:T.r,boxShadow:T.shadow,border:`1px solid ${T.borderL}`,overflow:"hidden",cursor:onClick?"pointer":"default",transition:"box-shadow .2s,transform .2s",...style }}>{children}</div>;
}

function PINDots({ length=6, filled=0 }) {
  return (
    <div style={{ display:"flex",gap:14,justifyContent:"center",padding:"6px 0" }}>
      {Array.from({length}).map((_,i)=>(
        <div key={i} style={{ width:14,height:14,borderRadius:"50%",
          background:i<filled?T.gold:"transparent",
          border:`2px solid ${i<filled?T.gold:T.borderGold}`,
          transition:"all .18s",
          boxShadow:i<filled?`0 0 8px ${T.gold}70`:"none",
          transform:i<filled?"scale(1.15)":"scale(1)" }}/>
      ))}
    </div>
  );
}

function OTPInput({ value, length=6 }) {
  const chars = value.split("").concat(Array(length).fill("")).slice(0,length);
  return (
    <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
      {chars.map((c,i)=>(
        <div key={i} style={{ width:46,height:58,borderRadius:T.rMd,
          background:T.white,border:`2px solid ${c?T.gold:T.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:"'DM Mono',monospace",fontSize:24,fontWeight:600,color:T.plum,
          transition:"border-color .2s,box-shadow .2s",
          boxShadow:c?`0 0 0 4px ${T.gold}22,0 4px 12px rgba(201,148,26,.15)`:"none" }}>
          {c||""}
        </div>
      ))}
    </div>
  );
}

function NumericKeypad({ onKey, onDelete, onSubmit, submitLabel="OK", submitDisabled }) {
  const rows = [[1,2,3],[4,5,6],[7,8,9],[null,0,"⌫"]];
  const sub = ["","ABC","DEF","GHI","JKL","MNO","PQRS","TUV","WXYZ"];
  return (
    <div style={{ padding:"0 6px",display:"flex",flexDirection:"column",gap:8 }}>
      {rows.map((row,ri)=>(
        <div key={ri} style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
          {row.map((k,ki)=>{
            if(k===null) return (
              <button key={ki} onClick={onSubmit} disabled={submitDisabled}
                style={{ height:62,borderRadius:T.rMd,background:submitDisabled?T.cream:T.gradPlum,
                  color:submitDisabled?T.textMuted:T.onDark,fontSize:13,fontWeight:700,letterSpacing:"0.5px",
                  textTransform:"uppercase",border:"none",cursor:submitDisabled?"not-allowed":"pointer",
                  transition:"background .2s,opacity .2s",boxShadow:submitDisabled?"none":"0 4px 14px rgba(45,27,78,.28)" }}>
                {submitLabel}
              </button>
            );
            const isDel = k==="⌫";
            return (
              <button key={ki} className="press" onClick={()=>isDel?onDelete():onKey(String(k))}
                style={{ height:62,borderRadius:T.rMd,background:T.white,border:`1.5px solid ${T.borderL}`,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  gap:0,cursor:"pointer",boxShadow:T.shadowSm,transition:"background .1s,border-color .1s" }}>
                <span style={{ fontSize:22,fontWeight:500,fontFamily:"'DM Mono',monospace",color:T.text,lineHeight:1 }}>{isDel?"⌫":k}</span>
                {typeof k==="number"&&k>0&&<span style={{ fontSize:9,color:T.textMuted,letterSpacing:"1px",marginTop:2 }}>{sub[k-1]}</span>}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Toast({ message, visible }) {
  if(!visible) return null;
  return (
    <div className="anim-slideDown" style={{ position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",
      background:T.text,color:T.onDark,padding:"12px 22px",borderRadius:T.rPill,
      fontSize:13,fontWeight:500,zIndex:999,boxShadow:T.shadowXL,whiteSpace:"nowrap",maxWidth:"90vw" }}>
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SAREE VISUALS
// ─────────────────────────────────────────────────────
function SareeThumbnail({ saree, height=200, showHeart=false, onHeart, isInShortlist, style={} }) {
  const pid = `pat-${saree.id}`;
  const getPattern = (type) => {
    if(type==="grid") return `<line x1="0" y1="9" x2="18" y2="9" stroke="#fff" stroke-width=".55"/><line x1="9" y1="0" x2="9" y2="18" stroke="#fff" stroke-width=".55"/>`;
    if(type==="ikat") return `<polygon points="9,0 18,9 9,18 0,9" fill="none" stroke="#fff" stroke-width=".55"/><circle cx="9" cy="9" r="1.5" fill="#fff" fill-opacity=".3"/>`;
    if(type==="check") return `<rect x="0" y="0" width="9" height="9" fill="#fff" fill-opacity=".06"/><rect x="9" y="9" width="9" height="9" fill="#fff" fill-opacity=".06"/>`;
    return `<line x1="0" y1="9" x2="9" y2="0" stroke="#fff" stroke-width=".55"/><line x1="9" y1="18" x2="18" y2="9" stroke="#fff" stroke-width=".55"/>`;
  };
  return (
    <div className="silk" style={{ height,position:"relative",overflow:"hidden",...style,
      background:`linear-gradient(148deg,${saree.grad[0]} 0%,${saree.grad[1]} 100%)` }}>
      {/* Woven pattern */}
      <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.15 }} aria-hidden>
        <defs><pattern id={pid} x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse"
          dangerouslySetInnerHTML={{__html:getPattern(saree.weavePattern)}}/></defs>
        <rect width="100%" height="100%" fill={`url(#${pid})`}/>
      </svg>
      {/* Central drape silhouette */}
      <svg viewBox="0 0 80 130" style={{ position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",width:52,height:78,opacity:.17 }} aria-hidden>
        <path d="M40 8C30 8 22 22 20 40 18 58 24 78 28 96 32 112 38 124 40 124 42 124 48 112 52 96 56 78 62 58 60 40 58 22 50 8 40 8Z" fill="white"/>
        <path d="M20 62C14 72 12 90 16 108" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity=".45"/>
        <path d="M60 62C66 72 68 90 64 108" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity=".45"/>
      </svg>
      {/* Gradient overlay */}
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(13,4,24,.82) 0%,transparent 58%)" }}/>
      {/* Badges */}
      {saree.isNew && <div style={{ position:"absolute",top:10,left:10,background:T.gradGold,color:T.plumD,fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:T.rPill,letterSpacing:"0.8px",textTransform:"uppercase" }}>New</div>}
      {saree.festivalPick && <div style={{ position:"absolute",top:10,left:saree.isNew?60:10,background:"rgba(201,148,26,.9)",color:T.plumD,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:T.rPill }}>✦ Festival Pick</div>}
      {/* Heart */}
      {showHeart && (
        <button className="press" onClick={e=>{e.stopPropagation();onHeart?.();}}
          style={{ position:"absolute",top:10,right:10,width:38,height:38,borderRadius:"50%",
            background:isInShortlist?"rgba(201,148,26,.95)":"rgba(255,255,255,.88)",
            border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 2px 10px rgba(0,0,0,.22)",transition:"background .2s",
            animation:isInShortlist?"heartBeat .35s ease both":undefined }}>
          <Icon.heart filled={isInShortlist} size={18} color={isInShortlist?"#fff":T.rose}/>
        </button>
      )}
      {/* Stock status badge */}
      {saree.inStock==="storage" && (
        <div style={{ position:"absolute",bottom:10,left:10,background:"rgba(13,4,24,.72)",color:"rgba(253,248,240,.88)",fontSize:10,fontWeight:500,padding:"3px 9px",borderRadius:T.rPill,backdropFilter:"blur(6px)" }}>
          In Storage
        </div>
      )}
    </div>
  );
}

function SareeCard({ saree, onTap, onHeart, isInShortlist, budget }) {
  const over = budget && !inBudget(saree.price, budget);
  return (
    <Card onClick={()=>onTap(saree)} className="press-lg hover-lift"
      style={{ cursor:"pointer", overflow:"hidden" }}>
      <SareeThumbnail saree={saree} height={190} showHeart onHeart={()=>onHeart(saree)} isInShortlist={isInShortlist}/>
      <div style={{ padding:"10px 12px 14px" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:15,color:T.text,lineHeight:1.2,marginBottom:2 }}>{saree.name}</div>
        <div style={{ fontSize:11,color:T.textMuted,marginBottom:8 }}>{saree.fabric} · {saree.region}</div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:16,color:over?T.amber:T.goldD }}>
            {fmt(saree.price)}{over&&<span style={{ fontSize:11,color:T.amber,marginLeft:4 }}>↑</span>}
          </div>
          {saree.tryCount>20&&<Tag color={T.plumL} small>🔥 {saree.tryCount}</Tag>}
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────
// STATUS BAR (portrait) — session timer + mirror + language
// ─────────────────────────────────────────────────────
function StatusBar({ sessionTimer, mirrorLinked, onLangOpen, presenting, onPresentingToggle }) {
  const { s } = useLang();
  const { lang } = useLang();
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 14px",
      background:T.ivory,borderBottom:`1px solid ${T.borderL}`,
      position:"sticky",top:0,zIndex:50 }}>
      {/* Session timer */}
      <div style={{ display:"flex",alignItems:"center",gap:5,flex:1 }}>
        <Icon.clock style={{ color:sessionTimer.color,width:14,height:14 }}/>
        <span style={{ fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color:sessionTimer.color }}>
          {sessionTimer.label}
        </span>
        <span style={{ fontSize:11,color:T.textMuted }}>{s.session_label}</span>
      </div>
      {/* Presenting mode */}
      <button onClick={onPresentingToggle} className="press"
        style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:T.rPill,
          background:presenting?T.plumGhost:"transparent",border:`1px solid ${presenting?T.plumL:T.borderL}`,
          cursor:"pointer",color:presenting?T.plumL:T.textMuted,fontSize:12,fontWeight:600 }}>
        <Icon.eye style={{ width:13,height:13 }}/>
        <span>{presenting?s.presenting_on:s.presenting_off}</span>
      </button>
      {/* Mirror status */}
      <div style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:T.rPill,
        background:mirrorLinked?T.successBg:T.amberBg,border:`1px solid ${mirrorLinked?"#81C784":"#FFCC80"}` }}>
        <div style={{ width:7,height:7,borderRadius:"50%",background:mirrorLinked?T.success:T.amber,
          animation:mirrorLinked?"goldPulse 2s ease infinite":"none" }}/>
        <Icon.mirror style={{ color:mirrorLinked?T.success:T.amber,width:13,height:13 }}/>
      </div>
      {/* Language pill */}
      <button onClick={onLangOpen} className="press"
        style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:T.rPill,
          background:T.goldGhost,border:`1px solid ${T.borderGold}`,cursor:"pointer" }}>
        <Icon.lang style={{ color:T.goldD,width:13,height:13 }}/>
        <span style={{ fontSize:12,fontWeight:700,color:T.goldD,fontFamily:"'DM Mono',monospace" }}>
          {lang.toUpperCase()}
        </span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// LANDSCAPE SIDEBAR
// ─────────────────────────────────────────────────────
function LandscapeSidebar({ staff, sessionTimer, mirrorLinked, activeTab, onTabChange, session, onLangOpen, presenting, onPresentingToggle, shortlistCount }) {
  const { s, lang } = useLang();
  const tabs = [
    { id:"catalogue",icon:<Icon.search/>,label:s.explore||"Discover" },
    { id:"shortlist",icon:<Icon.heart size={18}/>,label:s.shortlist_tab,badge:shortlistCount },
    { id:"stylist",  icon:<Icon.sparkle/>,label:s.ai_tab },
    { id:"customer", icon:<Icon.user/>,   label:s.customer_tab },
    { id:"shift",    icon:<Icon.clock/>,  label:s.shift_tab },
  ];
  return (
    <div className="tablet-sidebar noise paisley" style={{ position:"relative",zIndex:1 }}>
      {/* Top gradient overlay */}
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(160deg,rgba(45,27,78,.6) 0%,rgba(26,10,46,.3) 60%,rgba(45,27,78,.5) 100%)",zIndex:0,pointerEvents:"none" }}/>
      <div style={{ position:"relative",zIndex:1,height:"100%",display:"flex",flexDirection:"column",padding:"0 0 16px" }}>
        {/* Store logo + branding */}
        <div style={{ padding:"20px 18px 16px",borderBottom:"1px solid rgba(201,148,26,.15)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:"rgba(201,148,26,.18)",border:"1.5px solid rgba(201,148,26,.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>🪷</div>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:700,color:T.onDark,fontStyle:"italic",lineHeight:1.1 }}>{MOCK.store.short}</div>
              <div style={{ fontSize:10,color:"rgba(253,248,240,.45)",letterSpacing:"0.3px" }}>{MOCK.store.city} · Est. {MOCK.store.since}</div>
            </div>
          </div>
          {/* Staff badge */}
          <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(201,148,26,.12)",borderRadius:T.rMd,border:"1px solid rgba(201,148,26,.2)" }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:T.gradGold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:T.plumD }}>{staff?.initials}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13,fontWeight:600,color:T.onDark }}>{staff?.name}</div>
              <div style={{ fontSize:10,color:"rgba(253,248,240,.5)" }}>{staff?.role}</div>
            </div>
          </div>
        </div>
        {/* Session timer + status */}
        <div style={{ padding:"12px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid rgba(253,248,240,.06)" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10,color:"rgba(253,248,240,.4)",letterSpacing:"0.5px",textTransform:"uppercase",marginBottom:3 }}>{s.session_label}</div>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:22,fontWeight:600,color:sessionTimer.color }}>{sessionTimer.label}</div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <div style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:T.rPill,background:mirrorLinked?"rgba(46,125,50,.2)":"rgba(230,81,0,.15)",border:`1px solid ${mirrorLinked?"rgba(46,125,50,.4)":"rgba(230,81,0,.3)"}` }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:mirrorLinked?T.success:T.amber }}/>
              <span style={{ fontSize:10,color:mirrorLinked?"#81C784":"#FFCC80",fontWeight:600 }}>{mirrorLinked?s.mirror_on:s.mirror_off}</span>
            </div>
          </div>
        </div>
        {/* Customer context */}
        {session?.customer?.name&&(
          <div style={{ padding:"10px 18px",borderBottom:"1px solid rgba(253,248,240,.06)" }}>
            <div style={{ fontSize:10,color:"rgba(253,248,240,.4)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4 }}>Current Customer</div>
            <div style={{ fontSize:13,fontWeight:600,color:T.goldL }}>{session.customer.name}</div>
            {session.preferences?.occasion&&<div style={{ fontSize:11,color:"rgba(253,248,240,.5)",marginTop:2 }}>{session.preferences.occasion} · {session.preferences.budget?.label||"Open budget"}</div>}
          </div>
        )}
        {/* Nav tabs */}
        <div style={{ flex:1,padding:"8px 10px",display:"flex",flexDirection:"column",gap:3 }}>
          {tabs.map(tab=>{
            const sel=activeTab===tab.id;
            return (
              <button key={tab.id} onClick={()=>onTabChange(tab.id)} className="press"
                style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 12px",borderRadius:T.rMd,
                  background:sel?"rgba(253,248,240,.12)":"transparent",
                  border:`1px solid ${sel?"rgba(253,248,240,.15)":"transparent"}`,
                  cursor:"pointer",color:sel?T.onDark:"rgba(253,248,240,.5)",
                  transition:"all .2s",width:"100%",textAlign:"left" }}>
                <div style={{ transition:"transform .2s",transform:sel?"scale(1.1)":"scale(1)",flexShrink:0 }}>{tab.icon}</div>
                <span style={{ fontSize:13,fontWeight:sel?600:400,flex:1 }}>{tab.label}</span>
                {tab.badge>0&&<div style={{ width:18,height:18,borderRadius:"50%",background:T.gradGold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:T.plumD }}>{tab.badge}</div>}
                {sel&&<div style={{ width:3,height:3,borderRadius:"50%",background:T.gold }}/>}
              </button>
            );
          })}
        </div>
        {/* Bottom actions */}
        <div style={{ padding:"8px 10px 0",display:"flex",flexDirection:"column",gap:6,borderTop:"1px solid rgba(253,248,240,.06)" }}>
          <button onClick={onPresentingToggle} className="press"
            style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:T.rMd,
              background:presenting?"rgba(201,148,26,.15)":"transparent",
              border:`1px solid ${presenting?"rgba(201,148,26,.3)":"rgba(253,248,240,.08)"}`,
              cursor:"pointer",color:presenting?T.goldL:"rgba(253,248,240,.5)",width:"100%",textAlign:"left" }}>
            <Icon.eye style={{ width:16,height:16,flexShrink:0 }}/>
            <span style={{ fontSize:12,fontWeight:600 }}>{presenting?s.presenting_on:s.presenting_off}</span>
          </button>
          <button onClick={onLangOpen} className="press"
            style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:T.rMd,
              background:"rgba(201,148,26,.1)",border:"1px solid rgba(201,148,26,.2)",
              cursor:"pointer",color:T.goldL,width:"100%",textAlign:"left" }}>
            <Icon.lang style={{ width:16,height:16,flexShrink:0 }}/>
            <span style={{ fontSize:12,fontWeight:600 }}>{s.language}</span>
            <span style={{ marginLeft:"auto",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,color:T.gold }}>{lang.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// LANGUAGE MODAL
// ─────────────────────────────────────────────────────
function LanguageModal({ visible, onClose, currentLang, onSelect }) {
  if(!visible) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(13,4,24,.75)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} className="anim-slideUp"
        style={{ background:T.ivory,borderRadius:"24px 24px 0 0",padding:"24px 20px 32px",width:"100%",maxWidth:440,
          boxShadow:"0 -16px 60px rgba(45,27,78,.25)" }}>
        <div style={{ width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 20px" }}/>
        <div className="serif" style={{ fontSize:22,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:4,textAlign:"center" }}>
          Choose Language
        </div>
        <div style={{ fontSize:13,color:T.textMuted,textAlign:"center",marginBottom:20 }}>
          भाषा चुनें · भाषा निवडा · ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ
        </div>
        <div className="zari" style={{ marginBottom:20 }}/>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
          {Object.values(LANGS).map(lang=>{
            const sel = currentLang===lang.id;
            return (
              <button key={lang.id} onClick={()=>{ onSelect(lang.id); onClose(); }}
                className={`press ${sel?"card-selected":""}`}
                style={{ padding:"14px 8px",borderRadius:T.r,background:sel?"linear-gradient(135deg,#fff,#FDF5E4)":T.white,
                  border:`1.5px solid ${sel?T.gold:T.borderL}`,cursor:"pointer",textAlign:"center",
                  boxShadow:sel?T.shadowGold:T.shadowSm,transition:"all .2s" }}>
                <div style={{ fontSize:24,marginBottom:5 }}>{lang.flag}</div>
                <div style={{ fontSize:13,fontWeight:700,color:sel?T.plum:T.text,marginBottom:2 }}>{lang.native}</div>
                <div style={{ fontSize:10,color:T.textMuted }}>{lang.name}</div>
                {sel&&<div style={{ width:14,height:2.5,borderRadius:2,background:T.gradGold,margin:"6px auto 0" }}/>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// BOTTOM NAV
// ─────────────────────────────────────────────────────
function BottomNav({ active, onChange, shortlistCount }) {
  const { s } = useLang();
  const tabs = [
    { id:"catalogue",icon:<Icon.search/>,label:s.explore||"Discover" },
    { id:"shortlist",icon:<Icon.heart size={18}/>,label:s.shortlist_tab,badge:shortlistCount },
    { id:"stylist",  icon:<Icon.sparkle/>,label:s.ai_tab },
    { id:"customer", icon:<Icon.user/>,  label:s.customer_tab },
    { id:"shift",    icon:<Icon.clock/>, label:s.shift_tab },
  ];
  return (
    <div className="bottom-nav" style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
      width:"100%",maxWidth:420,background:"rgba(253,248,240,.97)",
      backdropFilter:"blur(20px)",borderTop:`1px solid ${T.borderL}`,
      display:"flex",padding:"6px 0 calc(6px + env(safe-area-inset-bottom))",
      zIndex:40,boxShadow:"0 -4px 20px rgba(45,27,78,.06)" }}>
      {tabs.map(tab=>{
        const sel=active===tab.id;
        return (
          <button key={tab.id} onClick={()=>onChange(tab.id)} className="press"
            style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              border:"none",background:"none",cursor:"pointer",padding:"6px 2px",
              color:sel?T.plum:T.textMuted,transition:"color .2s" }}>
            <div style={{ position:"relative" }}>
              <div style={{ transition:"transform .2s",transform:sel?"scale(1.18)":"scale(1)" }}>{tab.icon}</div>
              {tab.badge>0&&<div className="badge-pop" style={{ position:"absolute",top:-6,right:-8,width:17,height:17,borderRadius:"50%",background:T.gradGold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:T.plumD }}>{tab.badge}</div>}
            </div>
            <span style={{ fontSize:10,fontWeight:sel?700:400,letterSpacing:"0.2px" }}>{tab.label}</span>
            {sel&&<div style={{ width:18,height:2.5,borderRadius:2,background:T.gradGold }}/>}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SCREEN: ST-01 — STAFF PIN LOGIN
// ─────────────────────────────────────────────────────
function StaffPINScreen({ onSuccess, onLangOpen }) {
  const { s, lang } = useLang();
  const [pin, setPin] = useState(""); const [error, setError] = useState(""); const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false); const [countdown, setCountdown] = useState(0); const [shake, setShake] = useState(false);
  const [now, setNow] = useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),30000); return()=>clearInterval(t); },[]);
  const timeStr = now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
  const dateStr = now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"});
  const handleKey=k=>{ if(locked||pin.length>=6)return; setError(""); setPin(p=>p+k); };
  const handleDelete=()=>{ setError(""); setPin(p=>p.slice(0,-1)); };
  const handleSubmit=()=>{
    if(pin.length<4)return;
    const staff=MOCK.staff.find(x=>x.pin===pin);
    if(staff){ onSuccess(staff); return; }
    const next=attempts+1; setAttempts(next); setPin(""); setShake(true); setTimeout(()=>setShake(false),500);
    if(next>=3){ setLocked(true); setCountdown(300); const t=setInterval(()=>setCountdown(c=>{ if(c<=1){clearInterval(t);setLocked(false);setAttempts(0);return 0;} return c-1; }),1000); }
    else setError(`Incorrect PIN · ${3-next} attempt${3-next===1?"":"s"} remaining`);
  };
  return (
    <div className="noise paisley" style={{ minHeight:"100svh",background:T.gradHero,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 0 32px",position:"relative",overflow:"hidden" }}>
      {/* Floating gold orbs */}
      {[{x:"15%",y:"20%",s:120},{x:"80%",y:"60%",s:80},{x:"55%",y:"80%",s:100}].map((o,i)=>(
        <div key={i} style={{ position:"absolute",left:o.x,top:o.y,width:o.s,height:o.s,borderRadius:"50%",
          background:`radial-gradient(circle,rgba(201,148,26,.15) 0%,transparent 70%)`,
          pointerEvents:"none",animation:`floatDot ${4+i}s ease-in-out infinite`,animationDelay:`${i*.8}s` }}/>
      ))}
      {/* Time */}
      <div className="anim-fadeIn" style={{ padding:"28px 24px 0",textAlign:"center",width:"100%",position:"relative",zIndex:1 }}>
        <div style={{ color:"rgba(253,248,240,.38)",fontSize:13 }}>{dateStr}</div>
        <div style={{ color:"rgba(253,248,240,.72)",fontSize:32,fontFamily:"'DM Mono',monospace",fontWeight:300,marginTop:3,letterSpacing:2 }}>{timeStr}</div>
      </div>
      {/* Store branding */}
      <div className="anim-slideDown d2" style={{ textAlign:"center",padding:"24px 24px 20px",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1 }}>
        <div style={{ width:74,height:74,borderRadius:"50%",background:"rgba(201,148,26,.12)",border:"2px solid rgba(201,148,26,.30)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:"0 0 32px rgba(201,148,26,.18)",position:"relative" }}>
          <span style={{ fontSize:32 }}>🪷</span>
          <div style={{ position:"absolute",inset:-6,borderRadius:"50%",border:"1px solid rgba(201,148,26,.12)",animation:"waveRing 3s ease-out infinite" }}/>
        </div>
        <div className="serif gold-shimmer" style={{ fontSize:30,fontWeight:700,fontStyle:"italic",lineHeight:1.1 }}>
          {MOCK.store.short}
        </div>
        <div style={{ fontSize:12,color:"rgba(253,248,240,.42)",marginTop:5,letterSpacing:"0.8px",textTransform:"uppercase" }}>{MOCK.store.city} · Est. {MOCK.store.since}</div>
      </div>
      {/* PIN card */}
      <div className="anim-slideUp d3" style={{ width:"100%",maxWidth:380,padding:"0 16px",position:"relative",zIndex:1 }}>
        <div style={{ background:"rgba(253,248,240,.97)",borderRadius:T.rXl,padding:"28px 20px 22px",boxShadow:T.shadowXL,border:"1px solid rgba(201,148,26,.15)" }}>
          {locked ? (
            <div style={{ textAlign:"center",padding:"16px 0 20px" }}>
              <div style={{ width:56,height:56,borderRadius:"50%",background:T.amberBg,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px" }}>
                <Icon.lock style={{ color:T.amber }}/>
              </div>
              <div className="serif" style={{ fontSize:22,fontWeight:600,color:T.text,marginBottom:6 }}>Device Locked</div>
              <div style={{ fontSize:13,color:T.textMuted,lineHeight:1.6,marginBottom:14 }}>Too many incorrect attempts.<br/>Try again in:</div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:40,fontWeight:700,color:T.amber }}>
                {String(Math.floor(countdown/60)).padStart(2,"0")}:{String(countdown%60).padStart(2,"0")}
              </div>
            </div>
          ) : (
            <>
              <div style={{ textAlign:"center",marginBottom:18 }}>
                <div className="serif" style={{ fontSize:22,fontWeight:600,color:T.text }}>{s.enter_pin}</div>
                <div style={{ fontSize:13,color:T.textMuted,marginTop:3 }}>{s.staff_login}</div>
              </div>
              <div style={{ animation:shake?"slideLeft .09s ease 0s,slideLeft .09s ease .09s,slideLeft .09s ease .18s":undefined }}>
                <PINDots length={6} filled={pin.length}/>
              </div>
              {error&&<div className="anim-slideDown" style={{ textAlign:"center",marginTop:8,color:T.error,fontSize:13,fontWeight:500 }}>{error}</div>}
              <div style={{ marginTop:16 }}>
                <NumericKeypad onKey={handleKey} onDelete={handleDelete} onSubmit={handleSubmit} submitLabel={pin.length>=4?"Login":"→"} submitDisabled={pin.length<4}/>
              </div>
              <div style={{ marginTop:16,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
                <button onClick={onLangOpen} style={{ background:"none",border:"none",color:T.textMuted,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}>
                  <Icon.lang style={{ width:13,height:13 }}/>
                  <span style={{ fontFamily:"'DM Mono',monospace",fontWeight:700 }}>{lang.toUpperCase()}</span>
                  <span>· {s.language}</span>
                </button>
              </div>
            </>
          )}
        </div>
        <div style={{ textAlign:"center",marginTop:14,color:"rgba(253,248,240,.25)",fontSize:11,letterSpacing:"0.6px" }}>WEARIFY · {MOCK.store.tagline}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SCREEN: ST-00A — WELCOME
// ─────────────────────────────────────────────────────
function WelcomeScreen({ staff, onNew, onReturning, onGuest }) {
  const { s } = useLang();
  return (
    <div className="anim-pageIn" style={{ minHeight:"100svh",background:T.ivory }} >
      <div className="noise paisley" style={{ background:T.gradHero,padding:"36px 22px 32px",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"relative",zIndex:1 }}>
          <div className="anim-slideDown" style={{ display:"flex",alignItems:"center",gap:10,marginBottom:22 }}>
            <div style={{ width:40,height:40,borderRadius:"50%",background:"rgba(201,148,26,.22)",border:"1.5px solid rgba(201,148,26,.38)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:T.goldL }}>{staff.initials}</div>
            <div>
              <div style={{ fontSize:12,color:"rgba(253,248,240,.5)" }}>{s[greetKey()]}</div>
              <div style={{ fontWeight:600,color:T.onDark,fontSize:15 }}>{staff.name}</div>
            </div>
          </div>
          <div className="anim-slideUp d1" style={{ marginBottom:6 }}>
            <span className="serif" style={{ fontSize:14,color:"rgba(253,248,240,.5)",fontStyle:"italic" }}>{s.welcome_to}</span>
          </div>
          <div className="anim-slideUp d2 serif gold-shimmer" style={{ fontSize:34,fontWeight:700,lineHeight:1.1,marginBottom:10 }}>
            {MOCK.store.short}
          </div>
          <div className="anim-slideUp d3" style={{ fontSize:14,color:"rgba(253,248,240,.58)",lineHeight:1.6 }}>{MOCK.store.tagline}</div>
          {MOCK.store.festivalAlert&&(
            <div className="anim-slideUp d4" style={{ marginTop:16,display:"inline-flex",alignItems:"center",gap:8,background:"rgba(201,148,26,.16)",border:"1px solid rgba(201,148,26,.32)",padding:"8px 14px",borderRadius:T.rPill }}>
              <span>🪔</span>
              <span style={{ fontSize:13,color:T.goldL,fontWeight:500 }}>{MOCK.store.festivalAlert.name} {s.festival_in} {MOCK.store.festivalAlert.daysAway} {s.days}</span>
            </div>
          )}
        </div>
      </div>
      <div className="zari"/>
      <div style={{ padding:"24px 16px 16px" }}>
        <div className="serif anim-slideUp" style={{ fontSize:18,fontWeight:600,color:T.text,fontStyle:"italic",textAlign:"center",marginBottom:18 }}>How would you like to begin?</div>
        {[
          { label:s.new_customer,desc:s.new_desc,icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,grad:T.gradPlum,tags:["Mirror","AI","WhatsApp"],action:onNew },
          { label:s.returning,desc:s.returning_desc,icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.plumD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,grad:T.gradGold,tags:["Personalised","Profile"],action:onReturning },
        ].map((item,i)=>(
          <Card key={i} onClick={item.action} className={`press-lg hover-lift anim-slideUp d${i+1}`}
            style={{ marginBottom:12,border:`1.5px solid ${T.border}`,cursor:"pointer",background:i===0?"linear-gradient(135deg,#fff,#FBF0F4)":T.white }}>
            <div style={{ padding:"18px 18px 16px",display:"flex",gap:14,alignItems:"flex-start" }}>
              <div style={{ width:50,height:50,borderRadius:T.rMd,background:item.grad,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:i===0?"0 4px 14px rgba(45,27,78,.30)":"0 4px 14px rgba(201,148,26,.30)" }}>
                {item.icon}
              </div>
              <div style={{ flex:1 }}>
                <div className="serif" style={{ fontSize:20,fontWeight:700,color:T.text,marginBottom:3 }}>{item.label}</div>
                <div style={{ fontSize:13,color:T.textMid,lineHeight:1.55,marginBottom:8 }}>{item.desc}</div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {item.tags.map(t=><Tag key={t} color={i===0?T.plumL:T.goldD} small>{t}</Tag>)}
                </div>
              </div>
              <span style={{ color:T.textMuted,fontSize:20,marginTop:2 }}>›</span>
            </div>
          </Card>
        ))}
        <button onClick={onGuest} className="press" style={{ width:"100%",background:"none",border:"none",padding:"12px 0",cursor:"pointer",color:T.textMuted,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}>
          <Icon.info style={{ width:14,height:14 }}/>
          <span>{s.guest}</span>
          <span style={{ fontSize:11,color:T.textGhost }}>— {s.guest_desc}</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SCREEN: PHONE ENTRY
// ─────────────────────────────────────────────────────
function PhoneScreen({ isReturning, onBack, onNext }) {
  const { s } = useLang();
  const [phone, setPhone] = useState("");
  const valid = phone.length===10 && /^[6-9]/.test(phone);
  const formatted = phone.length>5 ? `${phone.slice(0,5)} ${phone.slice(5)}` : phone;
  return (
    <div className="anim-pageIn" style={{ minHeight:"100svh",background:T.ivory,display:"flex",flexDirection:"column" }}>
      <div className="noise" style={{ background:T.gradPlum,padding:"20px 20px 30px" }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,.12)",border:"none",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",marginBottom:18 }} className="press"><Icon.back/></button>
        <div className="anim-slideUp serif" style={{ fontSize:28,fontWeight:700,color:T.onDark,fontStyle:"italic",lineHeight:1.2 }}>
          {isReturning?"Welcome back":"Let's get started"}
        </div>
        <div style={{ color:"rgba(253,248,240,.58)",fontSize:14,marginTop:5 }}>
          {isReturning?s.returning_desc:s.new_desc}
        </div>
      </div>
      <div style={{ flex:1,padding:"22px 16px 16px" }}>
        {/* Phone display */}
        <div style={{ padding:"16px 18px",background:T.blush,borderRadius:T.r,border:`1.5px solid ${T.borderGold}`,textAlign:"center",marginBottom:18,boxShadow:T.shadowSm }}>
          <div style={{ fontSize:11,color:T.textMuted,marginBottom:6,letterSpacing:"0.5px",textTransform:"uppercase" }}>Mobile Number</div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
            <Tag color={T.plumL} style={{ fontFamily:"'DM Mono',monospace",fontSize:14 }}>+91</Tag>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:28,fontWeight:700,color:phone.length>0?T.plum:T.border,letterSpacing:"2px",minWidth:170,textAlign:"center" }}>
              {phone.length>0?formatted:"_ _ _ _ _ _ _ _ _ _"}
            </div>
          </div>
          {phone.length>0&&phone.length<10&&<div style={{ fontSize:12,color:T.textMuted,marginTop:6 }}>{10-phone.length} more digit{10-phone.length===1?"":"s"}</div>}
          {phone.length===10&&!/^[6-9]/.test(phone)&&<div style={{ fontSize:12,color:T.error,marginTop:6 }}>Number must start with 6, 7, 8, or 9</div>}
        </div>
        {/* Trust note */}
        <div style={{ display:"flex",gap:8,padding:"10px 12px",background:T.goldGhost,border:`1px solid ${T.borderGold}`,borderRadius:T.rMd,marginBottom:18 }}>
          <Icon.shield style={{ color:T.goldD,flexShrink:0,marginTop:1 }}/>
          <div style={{ fontSize:12,color:T.goldD,lineHeight:1.6 }}>OTP verification only. Phone is used to link your Mirror session. <strong>Never shared with third parties.</strong></div>
        </div>
        <NumericKeypad onKey={k=>{if(phone.length<10)setPhone(p=>p+k);}} onDelete={()=>setPhone(p=>p.slice(0,-1))} onSubmit={()=>valid&&onNext(phone)} submitLabel={s.send_otp} submitDisabled={!valid}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SCREEN: OTP
// ─────────────────────────────────────────────────────
function OTPScreen({ phone, onVerified, onBack }) {
  const { s } = useLang();
  const [otp,setOtp]=useState(""); const [timer,setTimer]=useState(60); const [error,setError]=useState(""); const [canResend,setCanResend]=useState(false);
  const DEMO="123456";
  useEffect(()=>{ const t=setInterval(()=>setTimer(p=>{ if(p<=1){clearInterval(t);setCanResend(true);return 0;} return p-1; }),1000); return()=>clearInterval(t); },[]);
  const verify=(code=otp)=>{ if(code===DEMO){onVerified(phone);}else{setError("Incorrect OTP. Please try again.");setOtp("");} };
  const handleKey=k=>{ if(otp.length<6){const n=otp+k;setOtp(n);setError("");if(n.length===6)verify(n);} };
  return (
    <div className="anim-pageIn" style={{ minHeight:"100svh",background:T.ivory,display:"flex",flexDirection:"column" }}>
      <div className="noise" style={{ background:T.gradPlum,padding:"20px 20px 30px" }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,.12)",border:"none",width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",marginBottom:18 }} className="press"><Icon.back/></button>
        <div className="anim-slideUp serif" style={{ fontSize:28,fontWeight:700,color:T.onDark,fontStyle:"italic" }}>{s.verify_otp}</div>
        <div style={{ color:"rgba(253,248,240,.58)",fontSize:14,marginTop:5 }}>{s.otp_sent} {mask(phone)}</div>
        <div style={{ marginTop:12,padding:"6px 12px",background:"rgba(201,148,26,.15)",borderRadius:T.rPill,display:"inline-flex",alignItems:"center",gap:6 }}>
          <span style={{ fontSize:12,color:T.goldL }}>💡 {s.demo_otp}: <strong>123456</strong></span>
        </div>
      </div>
      <div style={{ flex:1,padding:"30px 16px 16px" }}>
        <OTPInput value={otp} length={6}/>
        {error&&<div className="anim-slideDown" style={{ textAlign:"center",marginTop:14,color:T.error,fontSize:13,fontWeight:500 }}>{error}</div>}
        <div style={{ textAlign:"center",marginTop:18,fontSize:13,color:T.textMuted }}>
          {canResend?<button onClick={()=>{setTimer(60);setCanResend(false);setOtp("");setError("");}} style={{ background:"none",border:"none",color:T.plum,fontWeight:600,cursor:"pointer",fontSize:13 }}>{s.resend}</button>:<><span>{s.resend_in} </span><strong style={{ color:T.plum }}>{timer}s</strong></>}
        </div>
        <div style={{ marginTop:24 }}>
          <NumericKeypad onKey={handleKey} onDelete={()=>{setOtp(p=>p.slice(0,-1));setError("");}} onSubmit={()=>verify()} submitLabel={s.verify_otp} submitDisabled={otp.length<6}/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SCREEN: ST-17 — DPDP CONSENT
// ─────────────────────────────────────────────────────
function ConsentScreen({ phone, onConsented, onDeclined }) {
  const { s } = useLang();
  const [c,setC]=useState({history:false,messages:false,aiPersonal:false});
  const items=[
    { key:"history",  icon:"🗂", title:s.visit_history,   desc:s.visit_hist_desc },
    { key:"messages", icon:"💬", title:s.whatsapp_updates, desc:s.wa_desc },
    { key:"aiPersonal",icon:"✨",title:s.ai_personal,      desc:s.ai_desc },
  ];
  return (
    <div className="anim-pageIn" style={{ minHeight:"100svh",background:T.ivory,display:"flex",flexDirection:"column" }}>
      <div className="noise" style={{ background:T.gradPlum,padding:"28px 22px 30px",textAlign:"center" }}>
        <div style={{ width:58,height:58,borderRadius:"50%",background:"rgba(201,148,26,.18)",border:"1.5px solid rgba(201,148,26,.32)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:26 }}>🔐</div>
        <div className="anim-slideUp serif" style={{ fontSize:26,fontWeight:700,color:T.onDark,fontStyle:"italic",lineHeight:1.2 }}>{s.privacy_title}</div>
        <div style={{ color:"rgba(253,248,240,.6)",fontSize:13,marginTop:7,lineHeight:1.6 }}>
          {s.privacy_sub}<br/>
          <span style={{ fontFamily:"'DM Mono',monospace",color:T.goldL }}>{mask(phone)}</span>
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{ flex:1,overflowY:"auto",padding:"20px 16px 24px" }}>
        <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:18 }}>
          {items.map((item,i)=>(
            <Card key={item.key} onClick={()=>setC(prev=>({...prev,[item.key]:!prev[item.key]}))}
              className={`press-lg anim-slideUp d${i+1} hover-lift ${c[item.key]?"card-selected":""}`}
              style={{ cursor:"pointer",border:`1.5px solid ${c[item.key]?T.gold:T.borderL}`,background:c[item.key]?"linear-gradient(135deg,#fff,#FDF5E4)":T.white,transition:"border-color .2s,background .2s,box-shadow .2s" }}>
              <div style={{ padding:"15px 15px 13px",display:"flex",gap:12,alignItems:"flex-start" }}>
                <div style={{ fontSize:22,flexShrink:0,marginTop:2 }}>{item.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600,fontSize:15,color:T.text,marginBottom:3 }}>{item.title}</div>
                  <div style={{ fontSize:13,color:T.textMid,lineHeight:1.6 }}>{item.desc}</div>
                </div>
                <div style={{ width:44,height:24,borderRadius:12,background:c[item.key]?T.gold:T.cream,border:`1.5px solid ${c[item.key]?T.gold:T.border}`,position:"relative",transition:"background .2s",flexShrink:0,marginTop:4 }}>
                  <div style={{ position:"absolute",top:2,width:16,height:16,borderRadius:8,background:T.white,boxShadow:"0 1px 4px rgba(0,0,0,.2)",left:c[item.key]?22:2,transition:"left .2s" }}/>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div style={{ padding:"10px 12px",background:T.blush,borderRadius:T.rMd,marginBottom:20,display:"flex",gap:8 }}>
          <Icon.info style={{ color:T.rose,flexShrink:0,marginTop:1 }}/>
          <div style={{ fontSize:12,color:T.roseD,lineHeight:1.6 }}>Under India's DPDP Act 2023, you can withdraw consent or request data deletion at any time.</div>
        </div>
        <Btn fullWidth variant="plum" size="lg" onClick={()=>onConsented(c)} style={{ marginBottom:10 }}>
          <Icon.check/> {s.i_agree}
        </Btn>
        <Btn fullWidth variant="ivory" onClick={onDeclined} style={{ borderColor:T.borderL,color:T.textMuted }}>
          {s.no_thanks}
        </Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SCREEN: ST-00C — OCCASION & BUDGET
// ─────────────────────────────────────────────────────
function OccasionBudgetScreen({ onDone }) {
  const { s } = useLang();
  const [occ,setOcc]=useState(null); const [budget,setBudget]=useState(null); const [color,setColor]=useState(null);
  return (
    <div className="anim-pageIn" style={{ minHeight:"100svh",background:T.ivory,display:"flex",flexDirection:"column" }}>
      <div className="noise paisley" style={{ background:T.gradPlum,padding:"26px 20px 26px" }}>
        <div className="serif anim-slideUp" style={{ fontSize:26,fontWeight:700,color:T.onDark,fontStyle:"italic",textAlign:"center",lineHeight:1.2 }}>{s.occasion_title}</div>
        <div style={{ color:"rgba(253,248,240,.55)",fontSize:13,marginTop:5,textAlign:"center" }}>Helps us personalise every recommendation</div>
        <div style={{ display:"flex",justifyContent:"center",gap:5,marginTop:14 }}>
          {["Occasion","Budget","Ready"].map((_,i)=>(
            <div key={i} style={{ width:i===0&&occ||i===1&&budget||i===2?24:8,height:8,borderRadius:4,background:i===0&&occ||i===1&&budget?T.gold:"rgba(255,255,255,.2)",transition:"all .3s" }}/>
          ))}
        </div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{ flex:1,overflowY:"auto",padding:"20px 14px 24px" }}>
        {/* Occasions */}
        <div style={{ marginBottom:22 }}>
          <div className="serif" style={{ fontSize:17,fontWeight:600,color:T.text,marginBottom:14,fontStyle:"italic" }}>{s.occasion_title}</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
            {MOCK.occasions.map((o,i)=>{
              const sel=occ===o.id;
              return (
                <div key={o.id} onClick={()=>setOcc(o.id)} className={`press anim-scaleIn d${i+1} ${sel?"card-selected":""}`}
                  style={{ borderRadius:T.r,overflow:"hidden",cursor:"pointer",border:`2px solid ${sel?T.gold:"transparent"}`,boxShadow:sel?T.shadowGold:T.shadowSm,transition:"all .2s" }}>
                  <div className="silk" style={{ height:68,background:`linear-gradient(145deg,${o.grad[0]},${o.grad[1]})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative" }}>
                    <span style={{ fontSize:24 }}>{o.icon}</span>
                    {sel&&<div style={{ position:"absolute",inset:0,background:"rgba(201,148,26,.18)" }}/>}
                  </div>
                  <div style={{ padding:"8px 6px",background:sel?"linear-gradient(135deg,#fff,#FDF5E4)":T.white,textAlign:"center" }}>
                    <div style={{ fontSize:12,fontWeight:600,color:sel?T.plum:T.text }}>{o.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Budget */}
        <div style={{ marginBottom:20 }}>
          <div className="serif" style={{ fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:3 }}>{s.budget_title}</div>
          <div style={{ fontSize:12,color:T.textMuted,marginBottom:10 }}>{s.optional}</div>
          <div className="no-scroll" style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:4 }}>
            {MOCK.budgets.map(b=>{
              const sel=budget===b.id;
              return <button key={b.id} onClick={()=>setBudget(sel?null:b.id)} className="press"
                style={{ padding:"9px 15px",borderRadius:T.rPill,whiteSpace:"nowrap",background:sel?T.gradPlum:T.white,color:sel?T.onDark:T.textMid,border:`1.5px solid ${sel?T.plum:T.border}`,fontSize:13,fontWeight:500,cursor:"pointer",boxShadow:sel?T.shadow:T.shadowSm,transition:"all .2s",flexShrink:0 }}>{b.label}</button>;
            })}
          </div>
        </div>
        {/* Colour */}
        <div style={{ marginBottom:26 }}>
          <div className="serif" style={{ fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:3 }}>{s.colour_pref}</div>
          <div style={{ fontSize:12,color:T.textMuted,marginBottom:10 }}>{s.optional}</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {MOCK.colorOptions.map(c=>{
              const sel=color===c.id;
              return <button key={c.id} onClick={()=>setColor(sel?null:c.id)} className="press"
                style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 13px",borderRadius:T.rPill,cursor:"pointer",background:sel?`${c.swatch}18`:T.white,border:`1.5px solid ${sel?c.swatch:T.borderL}`,transition:"all .2s" }}>
                <div style={{ width:14,height:14,borderRadius:"50%",background:c.swatch,flexShrink:0 }}/>
                <span style={{ fontSize:12,fontWeight:500,color:sel?c.swatch:T.textMid,whiteSpace:"nowrap" }}>{c.label}</span>
              </button>;
            })}
          </div>
        </div>
        <Btn fullWidth variant="plum" size="lg" disabled={!occ}
          onClick={()=>onDone({ occasion:occ, budget:MOCK.budgets.find(b=>b.id===budget)||null, color })}>
          <Icon.sparkle/> {s.show_sarees}
        </Btn>
        {!occ&&<div style={{ textAlign:"center",marginTop:8,fontSize:12,color:T.textMuted }}>{s.select_occasion}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SCREEN: VISIT NOTE
// ─────────────────────────────────────────────────────
function VisitNoteScreen({ onSave, onSkip }) {
  const { s } = useLang();
  const [note,setNote]=useState("");
  return (
    <div className="anim-pageIn" style={{ minHeight:"100svh",background:T.ivory,display:"flex",flexDirection:"column" }}>
      <div className="noise" style={{ background:T.gradPlum,padding:"24px 20px 28px" }}>
        <div className="serif anim-slideUp" style={{ fontSize:24,fontWeight:700,color:T.onDark,fontStyle:"italic" }}>{s.visit_note}</div>
        <div style={{ color:"rgba(253,248,240,.58)",fontSize:13,marginTop:5 }}>Optional — helps you personalise the session</div>
      </div>
      <div className="zari"/>
      <div style={{ flex:1,padding:"24px 16px 24px" }}>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={s.visit_note_ph}
          style={{ width:"100%",minHeight:120,padding:"14px 16px",borderRadius:T.r,border:`1.5px solid ${T.border}`,background:T.white,fontSize:15,color:T.text,lineHeight:1.65,resize:"none",fontFamily:"'DM Sans',sans-serif",boxShadow:T.shadowSm,transition:"border-color .2s" }}
          onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
        <div style={{ display:"flex",gap:10,marginTop:16 }}>
          <Btn fullWidth variant="plum" onClick={()=>onSave(note)}><Icon.check/> {s.save_note}</Btn>
          <Btn fullWidth variant="ivory" onClick={onSkip}>{s.skip}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SCREEN: ST-02 — CATALOGUE HOME
// ─────────────────────────────────────────────────────
function CatalogueHomeScreen({ session, onNavigate, onSearch }) {
  const { s } = useLang();
  const { shortlist, toggleShortlist, presenting } = useApp();
  const { preferences } = session;
  const occ = MOCK.occasions.find(o=>o.id===preferences?.occasion);
  const budget = preferences?.budget;
  const trending = MOCK.sarees.filter(x=>x.tryCount>20);
  const newArr = MOCK.sarees.filter(x=>x.isNew);
  const forYou = MOCK.sarees.filter(x=>inBudget(x.price,budget)&&(occ?x.occasion.some(o=>o.toLowerCase().includes((occ.id||"").slice(0,3))):true));
  const QUICK = ["Wedding","Silk","Under ₹5K","Festival","Cotton","New","Office"];
  return (
    <div className={`anim-pageIn ${presenting?"presenting-mode":""}`} style={{ minHeight:"100svh",background:T.ivory }}>
      {/* Sticky header */}
      <div style={{ position:"sticky",top:0,zIndex:25,background:T.ivory,borderBottom:`1px solid ${T.borderL}` }}>
        <div className="noise paisley" style={{ background:`linear-gradient(135deg,${T.plum},${T.plumL})`,padding:"13px 16px 10px" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:11,color:"rgba(253,248,240,.45)" }}>{s[greetKey()]}</div>
              <div className="serif" style={{ fontSize:19,fontWeight:700,color:T.onDark,fontStyle:"italic" }}>
                {session?.customer?.name?`Welcome back, ${session.customer.name.split(" ")[0]}`:"Explore Our Collection"}
              </div>
            </div>
            {occ&&<Tag style={{ background:"rgba(201,148,26,.2)",color:T.goldL,fontSize:11 }}>{occ.icon} {occ.label}</Tag>}
          </div>
        </div>
        <div style={{ padding:"10px 12px 8px",background:T.ivory }}>
          <div onClick={()=>onSearch("")} style={{ display:"flex",alignItems:"center",gap:10,background:T.white,borderRadius:T.rPill,padding:"11px 14px",border:`1.5px solid ${T.border}`,cursor:"pointer",boxShadow:T.shadowSm }}>
            <Icon.search style={{ color:T.textMuted,flexShrink:0 }}/>
            <span style={{ flex:1,color:T.textMuted,fontSize:14 }}>{s.search_placeholder}</span>
            <div style={{ width:32,height:32,borderRadius:"50%",background:T.plumGhost,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Icon.mic style={{ color:T.plumL,width:16,height:16 }}/>
            </div>
          </div>
        </div>
        <div className="no-scroll" style={{ display:"flex",gap:8,padding:"0 12px 10px",overflowX:"auto" }}>
          {QUICK.map((f,i)=>(
            <button key={i} onClick={()=>onSearch(f)} style={{ padding:"5px 13px",borderRadius:T.rPill,whiteSpace:"nowrap",background:T.white,color:T.textMid,border:`1px solid ${T.border}`,fontSize:12,cursor:"pointer",boxShadow:T.shadowSm,flexShrink:0 }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="no-scroll" style={{ overflowY:"auto",paddingBottom:96 }}>
        {/* Festival alert */}
        {/* Editorial Hero — Staff Pick (always first) */}
        <EditorialHeroCard
          saree={MOCK.sarees[1]}
          onTap={saree=>onNavigate("detail",saree)}
          onHeart={()=>toggleShortlist(MOCK.sarees[1])}
          isInShortlist={shortlist.some(x=>x.id===MOCK.sarees[1].id)}
        />

        {MOCK.store.festivalAlert&&(
          <div className="silk anim-slideDown" style={{ margin:"12px 12px 0",background:`linear-gradient(135deg,${T.plum},${T.plumL})`,borderRadius:T.r,padding:"13px 14px",display:"flex",alignItems:"center",gap:12 }}>
            <span style={{ fontSize:26 }}>🪔</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700,color:T.onDark,fontSize:14 }}>{MOCK.store.festivalAlert.name} {s.festival_in} {MOCK.store.festivalAlert.daysAway} {s.days}</div>
              <div style={{ color:"rgba(253,248,240,.6)",fontSize:12,marginTop:2 }}>Festival collection tagged below</div>
            </div>
            <button onClick={()=>onSearch("Festival")} style={{ background:T.gradGold,border:"none",color:T.plumD,padding:"7px 13px",borderRadius:T.rPill,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0 }}>Shop Now</button>
          </div>
        )}

        {/* For You */}
        {forYou.length>0&&(
          <div style={{ padding:"20px 12px 0" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <div className="serif" style={{ flex:1,fontSize:19,fontWeight:600,color:T.text,fontStyle:"italic" }}>{occ?`Perfect for ${occ.label}`:s.for_you}</div>
              <button onClick={()=>onSearch("")} style={{ background:"none",border:"none",color:T.plumL,fontSize:12,fontWeight:600,cursor:"pointer" }}>View all →</button>
            </div>
            <div className="grid-auto" style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10 }}>
              {forYou.slice(0,4).map((saree,i)=>(
                <div key={saree.id} className={`anim-slideUp d${i+1}`}>
                  <SareeCard saree={saree} budget={budget} onTap={s=>onNavigate("detail",s)} onHeart={s=>toggleShortlist(s)} isInShortlist={shortlist.some(x=>x.id===saree.id)}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        <div style={{ padding:"20px 12px 0" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
            <div className="serif" style={{ flex:1,fontSize:19,fontWeight:600,color:T.text,fontStyle:"italic" }}>{s.trending}</div>
            <button onClick={()=>onSearch("")} style={{ background:"none",border:"none",color:T.plumL,fontSize:12,fontWeight:600,cursor:"pointer" }}>See all →</button>
          </div>
          <div className="no-scroll" style={{ display:"flex",gap:10,overflowX:"auto",paddingBottom:4 }}>
            {trending.map(saree=>(
              <div key={saree.id} style={{ flexShrink:0,width:158 }}>
                <Card onClick={()=>onNavigate("detail",saree)} className="press hover-lift" style={{ cursor:"pointer" }}>
                  <SareeThumbnail saree={saree} height={155} showHeart onHeart={()=>toggleShortlist(saree)} isInShortlist={shortlist.some(x=>x.id===saree.id)}/>
                  <div style={{ padding:"8px 10px 10px" }}>
                    <div className="serif" style={{ fontSize:14,fontWeight:600,color:T.text,lineHeight:1.2 }}>{saree.name}</div>
                    <div style={{ fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:13,color:T.goldD,marginTop:3 }}>{fmt(saree.price)}</div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* New arrivals */}
        {newArr.length>0&&(
          <div style={{ padding:"20px 12px 0" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <div className="serif" style={{ flex:1,fontSize:19,fontWeight:600,color:T.text,fontStyle:"italic" }}>{s.new_arrivals}</div>
              <Tag color={T.success} small>✦ {newArr.length} added</Tag>
            </div>
            <div className="grid-auto" style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10 }}>
              {newArr.map((saree,i)=>(
                <div key={saree.id} className={`anim-slideUp d${i+1}`}>
                  <SareeCard saree={saree} budget={budget} onTap={s=>onNavigate("detail",s)} onHeart={s=>toggleShortlist(s)} isInShortlist={shortlist.some(x=>x.id===saree.id)}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full collection */}
        <div style={{ padding:"20px 12px 8px" }}>
          <div className="serif" style={{ fontSize:19,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:12 }}>{s.browse_all} <span style={{ fontSize:14,color:T.textMuted,fontStyle:"normal",fontFamily:"'DM Sans',sans-serif" }}>({MOCK.sarees.length})</span></div>
          <div className="grid-auto" style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10 }}>
            {MOCK.sarees.map((saree,i)=>(
              <div key={saree.id} className={`anim-slideUp d${Math.min(i+1,6)}`}>
                <SareeCard saree={saree} budget={budget} onTap={s=>onNavigate("detail",s)} onHeart={s=>toggleShortlist(s)} isInShortlist={shortlist.some(x=>x.id===saree.id)}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SCREEN: ST-03 — SEARCH RESULTS
// ─────────────────────────────────────────────────────
function SearchResultsScreen({ initialQuery="", session, onNavigate, onBack }) {
  const { s } = useLang();
  const { shortlist, toggleShortlist } = useApp();
  const budget = session?.preferences?.budget;
  const [query,setQuery]=useState(initialQuery); const [sort,setSort]=useState("relevance");
  const results = MOCK.sarees.filter(saree=>{
    if(!query) return true;
    const q=query.toLowerCase();
    return saree.name.toLowerCase().includes(q)||saree.fabric.toLowerCase().includes(q)||saree.weave.toLowerCase().includes(q)||saree.region.toLowerCase().includes(q)||saree.occasion.some(o=>o.toLowerCase().includes(q))||saree.tags.some(t=>t.toLowerCase().includes(q));
  }).sort((a,b)=>sort==="low"?a.price-b.price:sort==="high"?b.price-a.price:sort==="new"?a.daysOld-b.daysOld:b.tryCount-a.tryCount);
  return (
    <div className="anim-pageIn" style={{ minHeight:"100svh",background:T.ivory,display:"flex",flexDirection:"column" }}>
      <div style={{ background:T.ivory,borderBottom:`1px solid ${T.borderL}`,padding:"10px 12px",position:"sticky",top:0,zIndex:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
          <button onClick={onBack} className="press" style={{ width:38,height:38,borderRadius:"50%",background:T.cream,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.text,flexShrink:0 }}><Icon.back/></button>
          <div style={{ flex:1,display:"flex",alignItems:"center",gap:8,background:T.white,borderRadius:T.rPill,padding:"9px 14px",border:`1.5px solid ${T.border}` }}>
            <Icon.search style={{ color:T.textMuted,flexShrink:0 }}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={s.search_placeholder} style={{ flex:1,border:"none",background:"transparent",fontSize:14,color:T.text,outline:"none" }}/>
            {query&&<button onClick={()=>setQuery("")} style={{ background:"none",border:"none",cursor:"pointer",color:T.textMuted }}><Icon.close/></button>}
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ fontSize:13,color:T.textMuted }}><strong style={{ color:T.text }}>{results.length}</strong> {s.sarees_found}</div>
          <div style={{ display:"flex",gap:5 }}>
            {[["relevance","Popular"],["low","↑ Price"],["high","↓ Price"],["new","New"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSort(v)} style={{ padding:"4px 11px",borderRadius:T.rPill,fontSize:11,fontWeight:500,background:sort===v?T.plum:T.white,color:sort===v?T.onDark:T.textMid,border:`1px solid ${sort===v?T.plum:T.border}`,cursor:"pointer" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="no-scroll" style={{ flex:1,overflowY:"auto",padding:"12px 12px 96px" }}>
        {results.length===0?(
          <div style={{ textAlign:"center",padding:"56px 24px" }}>
            <div style={{ fontSize:44,marginBottom:14 }}>🔍</div>
            <div className="serif" style={{ fontSize:20,fontWeight:600,color:T.text,marginBottom:6 }}>{s.nothing_found}</div>
            <div style={{ fontSize:13,color:T.textMuted,lineHeight:1.6 }}>{s.nothing_found_sub}</div>
          </div>
        ):(
          <div className="grid-auto" style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10 }}>
            {results.map((saree,i)=>(
              <div key={saree.id} className={`anim-slideUp d${Math.min(i+1,6)}`}>
                <SareeCard saree={saree} budget={budget} onTap={s=>onNavigate("detail",s)} onHeart={s=>toggleShortlist(s)} isInShortlist={shortlist.some(x=>x.id===saree.id)}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// COMPONENT: FABRIC FEEL INDICATORS
// ─────────────────────────────────────────────────────
const FABRIC_FEEL = {
  "Silk":        { drape:95, breathability:40, shine:98, weight:65 },
  "Georgette":   { drape:90, breathability:72, shine:80, weight:38 },
  "Cotton Silk": { drape:75, breathability:85, shine:55, weight:45 },
  "Cotton":      { drape:65, breathability:95, shine:20, weight:35 },
  "Silk Cotton": { drape:82, breathability:68, shine:70, weight:55 },
};
function FabricFeelBars({ fabric }) {
  const feel = FABRIC_FEEL[fabric] || { drape:70, breathability:70, shine:60, weight:50 };
  const bars = [
    { label:"Drape",         val:feel.drape,         color:"#6B1D8B" },
    { label:"Breathability", val:feel.breathability, color:"#1B5E7E" },
    { label:"Shine",         val:feel.shine,         color:"#C9941A" },
    { label:"Weight",        val:feel.weight,        color:"#3D1B6E", invert:true },
  ];
  return (
    <div style={{ padding:"14px 16px",background:T.blush,borderRadius:T.r,margin:"12px 16px 0",border:`1px solid ${T.borderL}` }}>
      <div style={{ fontWeight:700,fontSize:12,color:T.textMid,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.6px" }}>
        ✦ How this fabric feels
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
        {bars.map(b => (
          <div key={b.label} style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:90,fontSize:12,color:T.textMid,flexShrink:0,fontWeight:500 }}>{b.label}</div>
            <div style={{ flex:1,height:6,borderRadius:3,background:T.linen,overflow:"hidden",position:"relative" }}>
              <div style={{ height:"100%",borderRadius:3,background:`linear-gradient(90deg,${b.color}99,${b.color})`,
                width:`${b.invert?100-b.val:b.val}%`,
                animation:"barFill .8s cubic-bezier(.22,1,.36,1) both",
                animationDelay:`.${bars.indexOf(b)*15}s`,
                ["--w"]:`${b.invert?100-b.val:b.val}%` }}/>
            </div>
            <div style={{ width:32,textAlign:"right",fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:600,color:b.color }}>
              {b.invert ? (b.val<40?"Light":b.val<65?"Med":"Heavy") : (b.val>80?"High":b.val>55?"Mid":"Low")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// COMPONENT: SOCIAL PROOF RING
// ─────────────────────────────────────────────────────
function SocialProofRing({ count, label="women tried this month" }) {
  if (!count || count < 5) return null;
  return (
    <div className="anim-slideLeft" style={{ display:"inline-flex",alignItems:"center",gap:10,padding:"8px 14px 8px 8px",
      background:T.white,borderRadius:T.rPill,boxShadow:T.shadowSm,border:`1px solid ${T.borderL}` }}>
      {/* Avatar stack */}
      <div style={{ display:"flex",alignItems:"center",position:"relative" }}>
        {[T.rose,T.plumL,T.gold,"#6B1D8B","#1B5E8F"].slice(0,Math.min(4,Math.ceil(count/8)+1)).map((c,i)=>(
          <div key={i} style={{ width:24,height:24,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${c}99,${c})`,
            border:"2px solid #fff",marginLeft:i>0?-8:0,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,
            zIndex:5-i,boxShadow:"0 1px 4px rgba(0,0,0,.12)" }}>
            {["★","♀","✿","☽","♡"][i]}
          </div>
        ))}
      </div>
      <div style={{ lineHeight:1.2 }}>
        <span style={{ fontSize:13,fontWeight:700,color:T.plum,fontFamily:"'DM Mono',monospace" }}>{count}</span>
        <span style={{ fontSize:12,color:T.textMuted,marginLeft:4 }}>{label}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// COMPONENT: COLOR STORY
// ─────────────────────────────────────────────────────
function ColorStory({ saree }) {
  const palette = [
    { hex: saree.grad[0], label: saree.colors[0] || "Primary" },
    { hex: saree.grad[1], label: saree.colors[1] || "Secondary" },
    { hex: "#C9941A", label: "Zari / Border" },
    { hex: "#FDF8F0", label: "Pallu Base" },
  ];
  return (
    <div style={{ padding:"12px 16px 0" }}>
      <div style={{ fontWeight:700,fontSize:12,color:T.textMid,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.6px" }}>✦ Colour Story</div>
      <div style={{ display:"flex",gap:8,alignItems:"flex-end" }}>
        {palette.map((p,i)=>(
          <div key={i} style={{ flex: i===0||i===1 ? 2 : 1, display:"flex",flexDirection:"column",gap:4 }}>
            <div style={{ height: i===0?48:i===1?40:32,borderRadius:T.rSm,background:p.hex,
              boxShadow:`0 2px 8px ${p.hex}60`,transition:"transform .2s" }} className="press"/>
            <div style={{ fontSize:10,color:T.textMuted,textAlign:"center",lineHeight:1.3 }}>{p.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// COMPONENT: EDITORIAL HERO CARD
// ─────────────────────────────────────────────────────
function EditorialHeroCard({ saree, onTap, onHeart, isInShortlist }) {
  return (
    <div className="silk press-lg hover-lift" onClick={()=>onTap(saree)}
      style={{ margin:"14px 12px 0",borderRadius:T.rLg,overflow:"hidden",cursor:"pointer",
        background:`linear-gradient(148deg,${saree.grad[0]},${saree.grad[1]})`,
        boxShadow:"0 12px 40px rgba(26,10,46,.30)",minHeight:200,position:"relative",display:"flex",alignItems:"flex-end" }}>
      {/* Woven pattern */}
      <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.12 }} aria-hidden>
        <defs><pattern id="hero-pat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="10" x2="10" y2="0" stroke="#fff" strokeWidth=".7"/>
          <line x1="10" y1="20" x2="20" y2="10" stroke="#fff" strokeWidth=".7"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#hero-pat)"/>
      </svg>
      {/* Drape silhouette — large */}
      <svg viewBox="0 0 80 130" style={{ position:"absolute",right:"8%",bottom:-8,width:90,height:130,opacity:.2 }} aria-hidden>
        <path d="M40 4C28 4 20 20 18 40 16 60 22 82 26 102 30 118 38 130 40 130 42 130 50 118 54 102 58 82 64 60 62 40 60 20 52 4 40 4Z" fill="white"/>
      </svg>
      {/* Badges */}
      <div style={{ position:"absolute",top:14,left:14,display:"flex",gap:6,flexWrap:"wrap" }}>
        <div style={{ background:T.gradGold,color:T.plumD,fontSize:10,fontWeight:800,padding:"4px 12px",borderRadius:T.rPill,letterSpacing:"0.6px",boxShadow:"0 2px 8px rgba(201,148,26,.4)" }}>✦ STAFF PICK</div>
        {saree.isNew&&<div style={{ background:"rgba(253,248,240,.2)",backdropFilter:"blur(8px)",color:"#fff",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:T.rPill,border:"1px solid rgba(255,255,255,.2)" }}>NEW</div>}
      </div>
      {/* Heart */}
      <button onClick={e=>{e.stopPropagation();onHeart();}} className="press"
        style={{ position:"absolute",top:14,right:14,width:40,height:40,borderRadius:"50%",
          background:isInShortlist?"rgba(201,148,26,.92)":"rgba(255,255,255,.18)",
          backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.2)",
          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
          animation:isInShortlist?"heartBeat .35s ease both":undefined }}>
        <Icon.heart filled={isInShortlist} size={20} color={isInShortlist?"#fff":T.roseL}/>
      </button>
      {/* Bottom text */}
      <div style={{ position:"relative",zIndex:1,padding:"60px 18px 18px",width:"100%",
        background:"linear-gradient(to top,rgba(13,4,24,.9) 0%,transparent 100%)" }}>
        <div style={{ fontSize:11,color:"rgba(253,248,240,.55)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:4 }}>Featured Collection</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:"#fff",fontStyle:"italic",lineHeight:1.15,marginBottom:6 }}>
          {saree.name}
        </div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:18,color:T.goldL }}>{fmt(saree.price)}</div>
          <SocialProofRing count={saree.tryCount} label="tried this month"/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// COMPONENT: COMPLETE THE LOOK
// ─────────────────────────────────────────────────────
const COMPLETE_LOOK = {
  "SAR001": { blouse:"Deep green silk blouse", jewellery:"Gold temple necklace + jhumkas", bindi:"Large red bindi", footwear:"Gold kolhapuri heels" },
  "SAR002": { blouse:"Silver embroidered blouse", jewellery:"Pearl + silver choker", bindi:"Silver stone bindi", footwear:"Silver block heels" },
  "SAR003": { blouse:"Contrast deep teal blouse", jewellery:"Oxidised silver earrings", bindi:"Minimal dot bindi", footwear:"Brown leather flats" },
  "SAR004": { blouse:"Contrast mustard blouse", jewellery:"Gold filigree earrings", bindi:"Violet stone bindi", footwear:"Gold strappy heels" },
  "SAR005": { blouse:"Matching ikat blouse", jewellery:"Terracotta bead necklace", bindi:"Terracotta bindi", footwear:"Kolhapuri flats" },
  "SAR006": { blouse:"White cotton blouse", jewellery:"Red coral necklace + bangles", bindi:"Traditional red bindi", footwear:"White flats" },
  "SAR007": { blouse:"Deep maroon raw silk blouse", jewellery:"Nath + gold bangles + kolhapuri set", bindi:"Traditional red bindi", footwear:"Kolhapuri mojaris" },
  "SAR008": { blouse:"Black raw silk blouse", jewellery:"Dhokra brass necklace + earrings", bindi:"Tiny gold bindi", footwear:"Black block heels" },
};
function CompleteTheLook({ sareeId }) {
  const look = COMPLETE_LOOK[sareeId];
  if (!look) return null;
  const items = [
    { icon:"👗", label:"Blouse",    val:look.blouse },
    { icon:"📿", label:"Jewellery", val:look.jewellery },
    { icon:"✦",  label:"Bindi",     val:look.bindi },
    { icon:"👡", label:"Footwear",  val:look.footwear },
  ];
  return (
    <div style={{ padding:"14px 16px 0" }}>
      <div className="serif" style={{ fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:12 }}>Complete the Look</div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8 }}>
        {items.map(item=>(
          <div key={item.label} style={{ padding:"10px 11px",background:T.blush,borderRadius:T.rMd,border:`1px solid ${T.borderL}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              <span style={{ fontSize:10,fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.5px" }}>{item.label}</span>
            </div>
            <div style={{ fontSize:12,color:T.textMid,lineHeight:1.5,fontWeight:500 }}>{item.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SCREEN: ST-04 — SAREE DETAIL (landscape split-view)
// ─────────────────────────────────────────────────────
function SareeDetailScreen({ saree, session, onBack, onNavigate }) {
  const { s } = useLang();
  const { shortlist, toggleShortlist } = useApp();
  const isInShortlist = shortlist.some(x=>x.id===saree.id);
  const budget = session?.preferences?.budget;
  const over = budget && !inBudget(saree.price, budget);
  const similar = MOCK.sarees.filter(x=>x.id!==saree.id&&(x.fabric===saree.fabric||x.occasion.some(o=>saree.occasion.includes(o)))).slice(0,5);
  const occ = session?.preferences?.occasion;
  const auspColors = occ&&saree.auspicious?.[occ] || (saree.auspicious?.wedding||[]);

  const DetailContent = () => (
    <div className="no-scroll" style={{ overflowY:"auto",paddingBottom:120 }}>
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10 }}>
          <div>
            <div style={{ fontFamily:"'DM Mono',monospace",fontWeight:800,fontSize:28,color:over?T.amber:T.goldD }}>{fmt(saree.price)}</div>
            {over&&<div style={{ fontSize:12,color:T.amber,marginTop:2 }}>Over budget · <button onClick={()=>onNavigate("search","budget")} style={{ background:"none",border:"none",color:T.plumL,fontSize:12,fontWeight:600,cursor:"pointer",padding:0 }}>{s.find_alt}</button></div>}
          </div>
          <Tag color={saree.inStock==="storage"?T.amber:T.success} style={{ padding:"6px 14px",marginTop:4 }}>● {saree.inStock==="floor"?s.on_display:saree.inStock==="storage"?s.in_storage:s.being_shown}</Tag>
        </div>
        <SocialProofRing count={saree.tryCount} label="tried this month"/>
      </div>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap",padding:"10px 16px 0" }}>
        {saree.tags.map(t=><Tag key={t} color={T.plumL} small>{t}</Tag>)}
        {saree.occasion.map(o=><Tag key={o} color={T.goldD} bg={T.goldGhost} small>{o}</Tag>)}
      </div>
      <div className="zari" style={{ margin:"14px 16px" }}/>
      <div style={{ padding:"0 16px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14 }}>
        {[["Fabric",saree.fabric],["Weave",saree.weave],["Weight",saree.weight],["Region",saree.region],["Try-ons",saree.tryCount+"×"],["Stock",saree.stockCount+" pcs"]].map(([l,v])=>(
          <div key={l} style={{ background:T.blush,borderRadius:T.rSm,padding:"9px 10px" }}>
            <div style={{ fontSize:9,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:2 }}>{l}</div>
            <div style={{ fontSize:12,fontWeight:600,color:T.text }}>{v}</div>
          </div>
        ))}
      </div>
      <FabricFeelBars fabric={saree.fabric}/>
      <div style={{ padding:"14px 16px 0" }}><ColorStory saree={saree}/></div>
      <div style={{ padding:"14px 16px 0" }}>
        <div className="serif" style={{ fontSize:17,fontWeight:600,color:T.text,marginBottom:7,fontStyle:"italic" }}>{s.about_saree}</div>
        <p style={{ fontSize:14,color:T.textMid,lineHeight:1.78 }}>{saree.description}</p>
      </div>
      <div style={{ margin:"14px 16px 0",padding:"13px 15px",background:"linear-gradient(135deg,#F4EFF9,#FBF0F4)",borderRadius:T.r,border:"1px solid "+T.plumL+"22" }}>
        <div style={{ display:"flex",gap:8,alignItems:"flex-start" }}>
          <span style={{ fontSize:18,flexShrink:0 }}>✨</span>
          <div><div style={{ fontWeight:700,fontSize:12,color:T.plumL,marginBottom:3 }}>{s.ai_tip}</div>
          <p style={{ fontSize:13,color:T.textMid,lineHeight:1.65 }}>{saree.aiTip}</p></div>
        </div>
      </div>
      {auspColors.length>0&&(
        <div style={{ margin:"12px 16px 0",padding:"12px 14px",background:T.goldGhost,borderRadius:T.rMd,border:"1px solid "+T.borderGold }}>
          <div style={{ fontWeight:700,fontSize:12,color:T.goldD,marginBottom:8 }}>✦ {s.auspicious}</div>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{auspColors.map(c=><span key={c} style={{ padding:"3px 10px",borderRadius:T.rPill,background:T.white,border:"1px solid "+T.borderGold,fontSize:12,fontWeight:500,color:T.goldD }}>{c}</span>)}</div>
        </div>
      )}
      {saree.drapingStyles&&saree.drapingStyles.length>0&&(
        <div style={{ padding:"14px 16px 0" }}>
          <div className="serif" style={{ fontSize:17,fontWeight:600,color:T.text,marginBottom:10,fontStyle:"italic" }}>{s.draping}</div>
          <div className="no-scroll" style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:4 }}>
            {saree.drapingStyles.map(id=>{
              const d=MOCK.drapingGuide.find(x=>x.id===id); if(!d)return null;
              return <div key={id} style={{ flexShrink:0,width:128,padding:"10px",borderRadius:T.rMd,background:T.white,border:"1px solid "+T.borderL,boxShadow:T.shadowSm }}>
                <div style={{ width:26,height:26,borderRadius:"50%",background:d.color+"22",border:"1.5px solid "+d.color+"55",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6 }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={d.color} strokeWidth="2"><path d="M12 2 Q8 8 10 14 Q12 20 12 22 Q12 20 14 14 Q16 8 12 2Z"/></svg>
                </div>
                <div style={{ fontSize:12,fontWeight:700,color:T.text,marginBottom:2 }}>{d.name}</div>
                <div style={{ fontSize:10,color:T.textMuted,marginBottom:3 }}>{d.region}</div>
                <div style={{ fontSize:11,color:T.textMid,lineHeight:1.45 }}>{d.desc}</div>
              </div>;
            })}
          </div>
        </div>
      )}
      <CompleteTheLook sareeId={saree.id}/>
      <div style={{ margin:"14px 16px 0",padding:"11px 13px",background:T.cream,borderRadius:T.rMd }}>
        <div style={{ fontWeight:600,fontSize:12,color:T.textMid,marginBottom:4 }}>🧺 {s.care}</div>
        <div style={{ fontSize:13,color:T.textMuted }}>{saree.care}</div>
      </div>
      <div className="zari" style={{ margin:"16px 16px 14px" }}/>
      {similar.length>0&&(
        <div style={{ padding:"0 16px 0",marginBottom:18 }}>
          <div className="serif" style={{ fontSize:17,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:10 }}>{s.you_may_love}</div>
          <div className="no-scroll" style={{ display:"flex",gap:10,overflowX:"auto",paddingBottom:4 }}>
            {similar.map(x=><div key={x.id} style={{ flexShrink:0,width:145 }}>
              <Card onClick={()=>onNavigate("detail",x)} className="press hover-lift" style={{ cursor:"pointer" }}>
                <SareeThumbnail saree={x} height={130}/>
                <div style={{ padding:"8px 9px 10px" }}>
                  <div className="serif" style={{ fontSize:13,fontWeight:600,color:T.text,lineHeight:1.2 }}>{x.name}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:12,color:T.goldD,marginTop:3 }}>{fmt(x.price)}</div>
                </div>
              </Card>
            </div>)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="anim-pageIn detail-split" style={{ background:T.ivory,minHeight:"100svh" }}>
      {/* LEFT PANEL — landscape only: fixed saree visual */}
      <div className="detail-split-left">
        <SareeThumbnail saree={saree} height={9999} style={{ height:"100svh",borderRadius:0 }}/>
        <button onClick={onBack} className="press" style={{ position:"absolute",top:16,left:16,width:42,height:42,borderRadius:"50%",background:"rgba(253,248,240,.15)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",zIndex:10 }}><Icon.back/></button>
        <button onClick={()=>toggleShortlist(saree)} className="press" style={{ position:"absolute",top:16,right:16,width:42,height:42,borderRadius:"50%",background:isInShortlist?"rgba(201,148,26,.92)":"rgba(253,248,240,.15)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:10,animation:isInShortlist?"heartBeat .35s ease both":undefined }}>
          <Icon.heart filled={isInShortlist} size={20} color={isInShortlist?"#fff":T.roseL}/>
        </button>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"14px 14px 76px",background:"linear-gradient(to top,rgba(13,4,24,.92) 0%,transparent 55%)",zIndex:5 }}>
          <div className="serif" style={{ fontSize:20,fontWeight:700,color:"#fff",fontStyle:"italic",lineHeight:1.15 }}>{saree.name}</div>
          <div style={{ fontSize:12,color:"rgba(253,248,240,.55)",marginTop:3 }}>{saree.subtitle}</div>
        </div>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"12px 12px",background:"rgba(13,4,24,.82)",backdropFilter:"blur(12px)",zIndex:10 }}>
          <div style={{ display:"flex",gap:8 }}>
            <Btn fullWidth variant={isInShortlist?"gold":"plum"} size="md" onClick={()=>toggleShortlist(saree)} style={{ flex:2,fontSize:12 }}>
              {isInShortlist?<><Icon.heart filled size={15} color={T.plumD}/> {s.in_shortlist}</>:<><Icon.heart size={15}/> {s.add_shortlist}</>}
            </Btn>
            <Btn variant="glass" size="md" onClick={()=>onNavigate("shortlist")} style={{ flex:1,fontSize:12 }}><Icon.mirror/></Btn>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — portrait: full page, landscape: right half */}
      <div className="detail-split-right" style={{ background:T.ivory }}>
        {/* Portrait hero (hidden in landscape via CSS) */}
        <div style={{ position:"relative" }}>
          <SareeThumbnail saree={saree} height={280} style={{ borderRadius:0 }}/>
          <button onClick={onBack} className="press" style={{ position:"absolute",top:16,left:16,width:42,height:42,borderRadius:"50%",background:"rgba(253,248,240,.16)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff" }}><Icon.back/></button>
          <button onClick={()=>toggleShortlist(saree)} className="press" style={{ position:"absolute",top:16,right:16,width:42,height:42,borderRadius:"50%",background:isInShortlist?"rgba(201,148,26,.92)":"rgba(253,248,240,.16)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",animation:isInShortlist?"heartBeat .35s ease both":undefined }}>
            <Icon.heart filled={isInShortlist} size={20} color={isInShortlist?"#fff":T.roseL}/>
          </button>
          <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"14px 16px 16px",background:"linear-gradient(to top,rgba(13,4,24,.9) 0%,transparent 100%)" }}>
            <div className="serif" style={{ fontSize:24,fontWeight:700,color:"#fff",fontStyle:"italic",lineHeight:1.15 }}>{saree.name}</div>
            <div style={{ fontSize:13,color:"rgba(253,248,240,.6)",marginTop:3 }}>{saree.subtitle}</div>
          </div>
        </div>
        <DetailContent/>
        {/* CTA bar portrait */}
        <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(253,248,240,.97)",backdropFilter:"blur(16px)",borderTop:"1px solid "+T.borderL,padding:"11px 14px",zIndex:50 }}>
          <div style={{ display:"flex",gap:10 }}>
            <Btn fullWidth variant={isInShortlist?"ivory":"plum"} size="md" onClick={()=>toggleShortlist(saree)} style={{ flex:2 }}>
              {isInShortlist?<><Icon.heart filled size={17} color={T.gold}/> {s.in_shortlist}</>:<><Icon.heart size={17}/> {s.add_shortlist}</>}
            </Btn>
            <Btn variant="gold" size="md" onClick={()=>onNavigate("shortlist")} style={{ flex:1,fontSize:13 }}>{s.send_mirror}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────
// SHORTLIST SCREEN (ST-09)
// ─────────────────────────────────────────────────────
function ShortlistScreen({ session, onNavigate }) {
  const { s } = useLang();
  const { shortlist, toggleShortlist } = useApp();
  if(shortlist.length===0) return (
    <div style={{ minHeight:"100svh",background:T.ivory,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center" }}>
      <div style={{ width:80,height:80,borderRadius:"50%",background:T.blush,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18 }}><Icon.heart size={36} color={T.roseL}/></div>
      <div className="serif" style={{ fontSize:22,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:8 }}>{s.shortlist_empty}</div>
      <p style={{ fontSize:14,color:T.textMuted,lineHeight:1.6,maxWidth:260 }}>{s.shortlist_empty_sub}</p>
      <Btn variant="plum" size="md" onClick={()=>onNavigate("catalogue")} style={{ marginTop:22 }}>{s.explore} →</Btn>
    </div>
  );
  return (
    <div style={{ minHeight:"100svh",background:T.ivory }}>
      <div className="noise" style={{ background:T.gradPlum,padding:"26px 18px 20px" }}>
        <div className="serif" style={{ fontSize:24,fontWeight:700,color:T.onDark,fontStyle:"italic" }}>{s.your_shortlist}</div>
        <div style={{ color:"rgba(253,248,240,.6)",fontSize:13,marginTop:4 }}>{shortlist.length} {s.sarees_selected} · Ready for Smart Mirror</div>
      </div>
      <div className="zari"/>
      <div className="no-scroll" style={{ overflowY:"auto",padding:"14px 14px 130px" }}>
        {shortlist.map((saree,i)=>(
          <Card key={saree.id} className={`anim-slideUp d${Math.min(i+1,5)}`} style={{ marginBottom:10,display:"flex",overflow:"hidden" }}>
            <SareeThumbnail saree={saree} height={88} style={{ width:88,borderRadius:0,flexShrink:0 }}/>
            <div style={{ flex:1,padding:"10px 11px" }}>
              <div className="serif" style={{ fontSize:15,fontWeight:600,color:T.text,lineHeight:1.2 }}>{saree.name}</div>
              <div style={{ fontSize:11,color:T.textMuted,marginTop:1 }}>{saree.fabric} · {saree.region}</div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:14,color:T.goldD,marginTop:5 }}>{fmt(saree.price)}</div>
            </div>
            <button onClick={()=>toggleShortlist(saree)} className="press" style={{ width:40,background:"none",border:"none",cursor:"pointer",color:T.roseD,display:"flex",alignItems:"center",justifyContent:"center" }}><Icon.close/></button>
          </Card>
        ))}
      </div>
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,padding:"12px 14px",background:"rgba(253,248,240,.97)",backdropFilter:"blur(16px)",borderTop:`1px solid ${T.borderL}`,zIndex:50 }}>
        <Btn fullWidth variant="plum" size="lg">
          <Icon.mirror/> {s.send_mirror}
        </Btn>
      </div>
    </div>
  );
}

function PlaceholderTab({ title, icon, desc, badge }) {
  return (
    <div style={{ minHeight:"100svh",background:T.ivory,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center" }}>
      <div style={{ fontSize:52,marginBottom:14 }}>{icon}</div>
      <div className="serif" style={{ fontSize:22,fontWeight:600,color:T.text,fontStyle:"italic",marginBottom:8 }}>{title}</div>
      <p style={{ fontSize:14,color:T.textMuted,lineHeight:1.6,maxWidth:280 }}>{desc}</p>
      {badge&&<Tag color={T.goldD} style={{ marginTop:14 }}>{badge}</Tag>}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// APP SHELL
// ─────────────────────────────────────────────────────
function AppShell() {
  const landscape = useOrientation();
  const sessionTimer = useSessionTimer();
  const [langId,setLangId] = useState("en");
  const [langModalOpen,setLangModalOpen] = useState(false);
  const [screen,setScreen] = useState("pin");
  const [staff,setStaff] = useState(null);
  const [session,setSession] = useState({ customer:null, preferences:null, phone:null, isGuest:false });
  const [shortlist,setShortlist] = useState([]);
  const [activeTab,setActiveTab] = useState("catalogue");
  const [detailSaree,setDetailSaree] = useState(null);
  const [searchQuery,setSearchQuery] = useState("");
  const [toast,setToast] = useState({ visible:false, msg:"" });
  const [mirrorLinked] = useState(false);
  const [presenting,setPresenting] = useState(false);

  const s = STRINGS[langId] || STRINGS.en;
  const langCtxVal = { lang:langId, s, setLang:setLangId };

  const showToast = msg => { setToast({visible:true,msg}); setTimeout(()=>setToast({visible:false,msg:""}),2000); };
  const toggleShortlist = saree => {
    setShortlist(prev=>{
      const has = prev.some(x=>x.id===saree.id);
      if(has){ showToast(`Removed from shortlist`); return prev.filter(x=>x.id!==saree.id); }
      showToast(`Added: ${saree.name.split(" ").slice(0,2).join(" ")}`); return [...prev,saree];
    });
  };
  const navigate = (to, data=null) => {
    if(to==="detail"){ setDetailSaree(data); setScreen("detail"); }
    else if(to==="search"){ setSearchQuery(data||""); setScreen("search"); }
    else if(to==="shortlist"){ setActiveTab("shortlist"); setScreen("tab"); }
    else if(to==="catalogue"){ setActiveTab("catalogue"); setScreen("tab"); }
    else setScreen(to);
  };
  const tabChange = tab => { setActiveTab(tab); setScreen("tab"); };

  const appCtxVal = { shortlist, toggleShortlist, session, presenting };
  const showNav = ["tab","detail","search"].includes(screen);

  const renderTabContent = () => {
    if(activeTab==="catalogue") return <CatalogueHomeScreen session={session} onNavigate={navigate} onSearch={q=>{setSearchQuery(q||"");setScreen("search");}}/>;
    if(activeTab==="shortlist") return <ShortlistScreen session={session} onNavigate={navigate}/>;
    if(activeTab==="stylist")   return <PlaceholderTab title="AI Stylist" icon="✨" desc="Live Claude Sonnet — recommends sarees from this store's catalogue using your preferences." badge="Coming Session 2"/>;
    if(activeTab==="customer")  return <PlaceholderTab title="Customer Profile" icon="👤" desc="Visit history, preferences, and session notes." badge="Session 3"/>;
    if(activeTab==="shift")     return <PlaceholderTab title="My Shift" icon="⏱" desc="Session history, performance, and shift handoff." badge="Session 3"/>;
    return null;
  };

  const renderScreen = () => {
    if(screen==="pin")    return <StaffPINScreen onSuccess={s=>{setStaff(s);setScreen("welcome");}} onLangOpen={()=>setLangModalOpen(true)}/>;
    if(screen==="welcome") return <WelcomeScreen staff={staff} onNew={()=>setScreen("phone-new")} onReturning={()=>setScreen("phone-return")} onGuest={()=>{setSession(prev=>({...prev,isGuest:true}));setScreen("occasion");}}/>;
    if(screen==="phone-new"||screen==="phone-return") return <PhoneScreen isReturning={screen==="phone-return"} onBack={()=>setScreen("welcome")} onNext={ph=>{setSession(prev=>({...prev,phone:ph}));setScreen("otp");}}/>;
    if(screen==="otp") return <OTPScreen phone={session.phone} onBack={()=>setScreen(session.isGuest?"phone-new":"phone-new")} onVerified={ph=>{setSession(prev=>({...prev,phone:ph,verified:true}));setScreen("consent");}}/>;
    if(screen==="consent") return <ConsentScreen phone={session.phone} onConsented={c=>{setSession(prev=>({...prev,consents:c}));setScreen("occasion");}} onDeclined={()=>{setSession(prev=>({...prev,consents:null}));setScreen("occasion");}}/>;
    if(screen==="occasion") return <OccasionBudgetScreen onDone={prefs=>{setSession(prev=>({...prev,preferences:prefs}));setScreen("visitnote");}}/>;
    if(screen==="visitnote") return <VisitNoteScreen onSave={note=>{setSession(prev=>({...prev,visitNote:note}));setActiveTab("catalogue");setScreen("tab");}} onSkip={()=>{setActiveTab("catalogue");setScreen("tab");}}/>;
    if(screen==="tab") return (
      <div className={presenting?"presenting-mode":""}>
        <div className="staff-only">
          <StatusBar sessionTimer={sessionTimer} mirrorLinked={mirrorLinked} onLangOpen={()=>setLangModalOpen(true)} presenting={presenting} onPresentingToggle={()=>setPresenting(p=>!p)}/>
        </div>
        {renderTabContent()}
      </div>
    );
    if(screen==="detail") return (
      <div>
        <div className="staff-only">
          <StatusBar sessionTimer={sessionTimer} mirrorLinked={mirrorLinked} onLangOpen={()=>setLangModalOpen(true)} presenting={presenting} onPresentingToggle={()=>setPresenting(p=>!p)}/>
        </div>
        <SareeDetailScreen saree={detailSaree} session={session} onBack={()=>setScreen("tab")} onNavigate={navigate}/>
      </div>
    );
    if(screen==="search") return (
      <div>
        <div className="staff-only">
          <StatusBar sessionTimer={sessionTimer} mirrorLinked={mirrorLinked} onLangOpen={()=>setLangModalOpen(true)} presenting={presenting} onPresentingToggle={()=>setPresenting(p=>!p)}/>
        </div>
        <SearchResultsScreen initialQuery={searchQuery} session={session} onNavigate={navigate} onBack={()=>setScreen("tab")}/>
      </div>
    );
    return <StaffPINScreen onSuccess={s=>{setStaff(s);setScreen("welcome");}} onLangOpen={()=>setLangModalOpen(true)}/>;
  };

  return (
    <LangCtx.Provider value={langCtxVal}>
      <AppCtx.Provider value={appCtxVal}>
        <Toast message={toast.msg} visible={toast.visible}/>
        <LanguageModal visible={langModalOpen} onClose={()=>setLangModalOpen(false)} currentLang={langId} onSelect={setLangId}/>
        <div className="tablet">
          {/* Landscape sidebar */}
          {landscape && showNav && (
            <LandscapeSidebar staff={staff} sessionTimer={sessionTimer} mirrorLinked={mirrorLinked} activeTab={activeTab} onTabChange={id=>{setActiveTab(id);setScreen("tab");}} session={session} onLangOpen={()=>setLangModalOpen(true)} presenting={presenting} onPresentingToggle={()=>setPresenting(p=>!p)} shortlistCount={shortlist.length}/>
          )}
          {/* Content area */}
          <div className={landscape&&showNav?"tablet-content":"screen"}>
            {renderScreen()}
          </div>
          {/* Bottom nav (portrait only) */}
          {showNav && (
            <BottomNav active={activeTab} onChange={tabChange} shortlistCount={shortlist.length}/>
          )}
        </div>
      </AppCtx.Provider>
    </LangCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────
// ROOT EXPORT
// ─────────────────────────────────────────────────────
export default function App() {
  return (
    <div id="wearify-root">
      <GlobalStyles/>
      <AppShell/>
    </div>
  );
}
