"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Screen =
  | "IDLE"
  | "LANG"
  | "AUTH"
  | "HOME"
  | "PRODUCT"
  | "BODY_SCAN"
  | "TRY_ON"
  | "WARDROBE"
  | "ORDER"
  | "TAILORS"
  | "TAILOR_DETAIL"
  | "FEEDBACK"
  | "DATA_SAVE"
  | "SESSION_END";

interface KioskConfig {
  storeId: string;
  storeName: string;
  tabletCode: string;
}

interface WardrobeItem {
  sareeId: Id<"sarees">;
  name: string;
  price: number;
  drapeStyle: string;
  accessories: string[];
  neckline: string;
  grad: string[];
  selected: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  { code: "ta", name: "Tamil", native: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD" },
  { code: "te", name: "Telugu", native: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41" },
  { code: "kn", name: "Kannada", native: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1" },
  { code: "ml", name: "Malayalam", native: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02" },
  { code: "bn", name: "Bengali", native: "\u09AC\u09BE\u0982\u09B2\u09BE" },
  { code: "mr", name: "Marathi", native: "\u092E\u0930\u093E\u0920\u0940" },
  { code: "gu", name: "Gujarati", native: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0" },
];

const CATEGORIES = [
  { name: "Bridal", icon: "\u2764", grad: ["#C0392B", "#8E44AD"] },
  { name: "Festive", icon: "\u2728", grad: ["#D4A843", "#E67E22"] },
  { name: "Party", icon: "\u2B50", grad: ["#2C5F7C", "#1ABC9C"] },
  { name: "Casual", icon: "\u263A", grad: ["#2D8544", "#27AE60"] },
];

const DRAPING_STYLES = ["Nivi", "Bengali", "Gujarati", "Seedha Pallu"];
const ACCESSORIES = ["Necklace", "Earrings", "Bangles", "Ring"];
const NECKLINES = ["V-Neck", "Boat Neck", "Sweetheart", "Round Neck", "High Neck", "Halter"];

const FEEDBACK_CHIPS = [
  "Loved the experience",
  "Great saree collection",
  "Easy to use",
  "Try-on was realistic",
  "Staff was helpful",
  "Would recommend",
  "Needs more options",
  "Too slow",
];

const GRADIENT_PRESETS = [
  ["#C0392B", "#8E44AD"],
  ["#D4A843", "#E67E22"],
  ["#2C5F7C", "#1ABC9C"],
  ["#2D8544", "#27AE60"],
  ["#71221D", "#C0392B"],
  ["#8E44AD", "#3498DB"],
];

// ---------------------------------------------------------------------------
// Main Kiosk Page
// ---------------------------------------------------------------------------
export default function KioskPage() {
  // Kiosk config
  const [config, setConfig] = useState<KioskConfig | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("IDLE");

  // Session state
  const [language, setLanguage] = useState("en");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState<Id<"customers"> | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [sessionId, setSessionId] = useState("");

  // Auth state
  const [authMode, setAuthMode] = useState<"phone" | "code">("phone");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [showConfirmPhone, setShowConfirmPhone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [storeCode, setStoreCode] = useState("");
  const [authError, setAuthError] = useState("");

  // Catalog state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSareeId, setSelectedSareeId] = useState<Id<"sarees"> | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);

  // Try-on state
  const [drapeStyle, setDrapeStyle] = useState("Nivi");
  const [activeAccessories, setActiveAccessories] = useState<string[]>([]);
  const [neckline, setNeckline] = useState("Round Neck");
  const [tryOnTimer, setTryOnTimer] = useState(180);

  // Body scan state
  const [scanPhase, setScanPhase] = useState<"position" | "countdown" | "scanning" | "done">("position");
  const [scanCountdown, setScanCountdown] = useState(3);

  // Wardrobe
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [whatsappShareCount, setWhatsappShareCount] = useState(0);
  const [showWhatsappConsent, setShowWhatsappConsent] = useState(false);

  // Order
  const [orderId, setOrderId] = useState("");
  const [orderExpiry, setOrderExpiry] = useState(600);

  // Tailors
  const [tailorSort, setTailorSort] = useState("Recommended");
  const [selectedTailorId, setSelectedTailorId] = useState<string | null>(null);
  const [showTailorConsent, setShowTailorConsent] = useState(false);

  // Feedback
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackChips, setFeedbackChips] = useState<string[]>([]);
  const [showThankYou, setShowThankYou] = useState(false);

  // Session end
  const [endTimer, setEndTimer] = useState(10);

  // Idle slideshow
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  // ---------------------------------------------------------------------------
  // Load config
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const stored = localStorage.getItem("wearify_kiosk_store");
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {
        window.location.href = "/kiosk/setup";
      }
    } else {
      window.location.href = "/kiosk/setup";
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Convex queries/mutations
  // ---------------------------------------------------------------------------
  const store = useQuery(
    api.stores.getByStoreId,
    config ? { storeId: config.storeId } : "skip"
  );

  const allSarees = useQuery(
    api.sarees.listByStore,
    config ? { storeId: config.storeId } : "skip"
  );

  const searchResults = useQuery(
    api.sarees.search,
    config && searchTerm.length >= 2
      ? { storeId: config.storeId, searchTerm }
      : "skip"
  );

  const occasionSarees = useQuery(
    api.sarees.listByOccasion,
    config && selectedCategory
      ? { storeId: config.storeId, occasion: selectedCategory === "Bridal" ? "Wedding" : selectedCategory === "Festive" ? "Festival" : selectedCategory }
      : "skip"
  );

  const selectedSaree = useQuery(
    api.sarees.getById,
    selectedSareeId ? { id: selectedSareeId } : "skip"
  );

  const tailors = useQuery(
    api.tailorOps.listByCity,
    store?.city ? { city: store.city } : "skip"
  );

  const selectedTailor = useQuery(
    api.tailorOps.getByTailorId,
    selectedTailorId ? { tailorId: selectedTailorId } : "skip"
  );

  const tailorPortfolio = useQuery(
    api.tailorOps.getPortfolio,
    selectedTailorId ? { tailorId: selectedTailorId } : "skip"
  );

  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const createSession = useMutation(api.sessionOps.createSession);
  const endSession = useMutation(api.sessionOps.endSession);
  const submitFeedback = useMutation(api.customers.submitFeedback);
  const addToWardrobe = useMutation(api.sessionOps.addToWardrobe);
  const createOrder = useMutation(api.sessionOps.createOrder);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------
  const displaySarees = searchTerm.length >= 2
    ? searchResults ?? []
    : selectedCategory
      ? occasionSarees ?? []
      : allSarees ?? [];

  // ---------------------------------------------------------------------------
  // Timers
  // ---------------------------------------------------------------------------
  // Idle slideshow
  useEffect(() => {
    if (currentScreen !== "IDLE") return;
    const interval = setInterval(() => {
      setSlideshowIndex((i) => (i + 1) % GRADIENT_PRESETS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentScreen]);

  // OTP timer
  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // Try-on timer
  useEffect(() => {
    if (currentScreen !== "TRY_ON" || tryOnTimer <= 0) return;
    const interval = setInterval(() => {
      setTryOnTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentScreen, tryOnTimer]);

  // Order expiry timer
  useEffect(() => {
    if (currentScreen !== "ORDER" || orderExpiry <= 0) return;
    const interval = setInterval(() => {
      setOrderExpiry((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentScreen, orderExpiry]);

  // Body scan countdown
  useEffect(() => {
    if (currentScreen !== "BODY_SCAN") return;
    if (scanPhase === "countdown" && scanCountdown > 0) {
      const timer = setTimeout(() => setScanCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (scanPhase === "countdown" && scanCountdown === 0) {
      setScanPhase("scanning");
      setTimeout(() => setScanPhase("done"), 3000);
    }
  }, [currentScreen, scanPhase, scanCountdown]);

  // Session end auto-return
  useEffect(() => {
    if (currentScreen !== "SESSION_END") return;
    if (endTimer <= 0) {
      resetSession();
      return;
    }
    const interval = setInterval(() => {
      setEndTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentScreen, endTimer]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const resetSession = useCallback(() => {
    setCurrentScreen("IDLE");
    setLanguage("en");
    setCustomerPhone("");
    setCustomerId(null);
    setIsGuest(false);
    setSessionId("");
    setAuthMode("phone");
    setPhoneDigits("");
    setShowConfirmPhone(false);
    setOtpSent(false);
    setOtpDigits("");
    setOtpTimer(60);
    setStoreCode("");
    setAuthError("");
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedSareeId(null);
    setSelectedColor(0);
    setDrapeStyle("Nivi");
    setActiveAccessories([]);
    setNeckline("Round Neck");
    setTryOnTimer(180);
    setScanPhase("position");
    setScanCountdown(3);
    setWardrobeItems([]);
    setWhatsappShareCount(0);
    setShowWhatsappConsent(false);
    setOrderId("");
    setOrderExpiry(600);
    setTailorSort("Recommended");
    setSelectedTailorId(null);
    setShowTailorConsent(false);
    setFeedbackRating(0);
    setFeedbackChips([]);
    setShowThankYou(false);
    setEndTimer(10);
  }, []);

  const goToScreen = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const handlePhoneKeyPress = (digit: string) => {
    if (digit === "del") {
      setPhoneDigits((d) => d.slice(0, -1));
    } else if (digit === "clear") {
      setPhoneDigits("");
    } else if (phoneDigits.length < 10) {
      setPhoneDigits((d) => d + digit);
    }
  };

  const handleOtpKeyPress = (digit: string) => {
    if (digit === "del") {
      setOtpDigits((d) => d.slice(0, -1));
    } else if (digit === "clear") {
      setOtpDigits("");
    } else if (otpDigits.length < 6) {
      setOtpDigits((d) => d + digit);
    }
  };

  const handleStoreCodeKeyPress = (digit: string) => {
    if (digit === "del") {
      setStoreCode((d) => d.slice(0, -1));
    } else if (digit === "clear") {
      setStoreCode("");
    } else if (storeCode.length < 6) {
      setStoreCode((d) => d + digit);
    }
  };

  const handleSendOtp = () => {
    if (phoneDigits.length !== 10) {
      setAuthError("Please enter a valid 10-digit number");
      return;
    }
    setShowConfirmPhone(false);
    setOtpSent(true);
    setOtpTimer(60);
    setAuthError("");
  };

  const handleVerifyOtp = async () => {
    if (otpDigits.length !== 6) {
      setAuthError("Please enter the full 6-digit OTP");
      return;
    }
    try {
      const result = await loginWithOtp({
        phone: "+91" + phoneDigits,
        otp: otpDigits,
        role: "customer",
        name: "Kiosk Customer",
      });
      if (result.success && "customerId" in result) {
        setCustomerPhone("+91" + phoneDigits);
        setCustomerId(result.customerId as Id<"customers">);
        // Create session
        if (config) {
          const sid = await createSession({
            storeId: config.storeId,
            storeName: config.storeName,
            customerPhone: "+91" + phoneDigits,
          });
          setSessionId(sid);
        }
        goToScreen("HOME");
      } else {
        setAuthError("error" in result ? (result.error as string) : "Verification failed");
      }
    } catch {
      setAuthError("Verification failed. Please try again.");
    }
  };

  const handleStoreCodeLogin = async () => {
    if (!config) return;
    if (storeCode === config.tabletCode) {
      setIsGuest(true);
      const sid = await createSession({
        storeId: config.storeId,
        storeName: config.storeName,
      });
      setSessionId(sid);
      goToScreen("HOME");
    } else {
      setAuthError("Invalid store code");
    }
  };

  const handleAddToWardrobe = () => {
    if (!selectedSaree) return;
    if (wardrobeItems.length >= 10) return;
    const already = wardrobeItems.find((w) => w.sareeId === selectedSaree._id);
    if (already) return;
    setWardrobeItems((prev) => [
      ...prev,
      {
        sareeId: selectedSaree._id,
        name: selectedSaree.name,
        price: selectedSaree.price,
        drapeStyle,
        accessories: [...activeAccessories],
        neckline,
        grad: selectedSaree.grad || GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)],
        selected: false,
      },
    ]);
    // Also persist to backend
    if (sessionId) {
      addToWardrobe({
        sessionId,
        customerId: customerId ?? undefined,
        sareeId: selectedSaree._id,
        sareeName: selectedSaree.name,
        drapeStyle,
        accessories: activeAccessories,
        neckline,
        price: selectedSaree.price,
      }).catch(() => {});
    }
  };

  const handleCreateOrder = async () => {
    if (!config || wardrobeItems.length === 0) return;
    const items = wardrobeItems.map((w) => ({
      sareeId: w.sareeId,
      name: w.name,
      price: w.price,
      quantity: 1,
    }));
    try {
      const oid = await createOrder({
        sessionId,
        storeId: config.storeId,
        customerId: customerId ?? undefined,
        customerPhone: customerPhone || undefined,
        items,
      });
      setOrderId(oid);
      setOrderExpiry(600);
      goToScreen("ORDER");
    } catch {
      // silently handle
    }
  };

  const handleSubmitFeedback = async () => {
    if (!config) return;
    try {
      await submitFeedback({
        customerId: customerId ?? undefined,
        customerPhone: customerPhone || undefined,
        storeId: config.storeId,
        sessionId: sessionId || undefined,
        rating: feedbackRating,
        chips: feedbackChips,
        date: new Date().toISOString().split("T")[0],
      });
    } catch {
      // silently handle
    }
    setShowThankYou(true);
    setTimeout(() => {
      setShowThankYou(false);
      goToScreen("DATA_SAVE");
    }, 2500);
  };

  const handleEndSessionClean = async () => {
    if (sessionId) {
      try {
        await endSession({ sessionId });
      } catch {
        // silently handle
      }
    }
    goToScreen("SESSION_END");
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const computeGST = (price: number) => (price < 1000 ? price * 0.05 : price * 0.12);

  const orderSubtotal = wardrobeItems.reduce((sum, w) => sum + w.price, 0);
  const orderGST = wardrobeItems.reduce((sum, w) => sum + computeGST(w.price), 0);
  const orderTotal = Math.round((orderSubtotal + orderGST) * 100) / 100;

  if (!config) return null;

  // ---------------------------------------------------------------------------
  // NumPad component
  // ---------------------------------------------------------------------------
  const NumPad = ({ onKey }: { onKey: (d: string) => void }) => (
    <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "del"].map(
        (key) => (
          <button
            key={key}
            onClick={() => onKey(key)}
            className={`h-16 rounded-2xl text-2xl font-bold cursor-pointer transition-all active:scale-95 ${
              key === "clear"
                ? "bg-wf-red/20 text-wf-red"
                : key === "del"
                  ? "bg-wf-amber/20 text-wf-amber"
                  : "bg-wf-card border border-wf-border text-wf-text hover:bg-wf-primary/10"
            }`}
          >
            {key === "del" ? "\u232B" : key === "clear" ? "C" : key}
          </button>
        )
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Gradient placeholder
  // ---------------------------------------------------------------------------
  const GradientBox = ({
    grad,
    className = "",
    children,
  }: {
    grad?: string[];
    className?: string;
    children?: React.ReactNode;
  }) => {
    const g = grad || GRADIENT_PRESETS[0];
    return (
      <div
        className={`rounded-2xl flex items-center justify-center ${className}`}
        style={{
          background: `linear-gradient(135deg, ${g[0]}, ${g[1] || g[0]})`,
        }}
      >
        {children}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Back button
  // ---------------------------------------------------------------------------
  const BackButton = ({ to, label }: { to: Screen; label?: string }) => (
    <button
      onClick={() => goToScreen(to)}
      className="flex items-center gap-2 text-wf-subtext text-lg font-medium cursor-pointer hover:text-wf-text transition-colors"
    >
      <span className="text-2xl">&larr;</span>
      {label || "Back"}
    </button>
  );

  // =========================================================================
  // SCREEN: IDLE
  // =========================================================================
  if (currentScreen === "IDLE") {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
        onClick={() => goToScreen("LANG")}
      >
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 transition-all duration-[2000ms] ease-in-out"
          style={{
            background: `linear-gradient(135deg, ${GRADIENT_PRESETS[slideshowIndex][0]}20, ${GRADIENT_PRESETS[slideshowIndex][1]}30, #000)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center space-y-8">
          {/* Logo area */}
          <div className="mb-4">
            <h1 className="text-7xl font-extrabold tracking-tight bg-gradient-to-r from-wf-primary to-wf-amber bg-clip-text text-transparent">
              Wearify
            </h1>
            <p className="text-wf-subtext text-xl mt-2">
              Virtual Try-On Experience
            </p>
          </div>

          {/* Store name */}
          <div className="text-wf-muted text-lg">
            {config.storeName}
          </div>

          {/* Gradient showcase cards */}
          <div className="flex gap-4 justify-center mt-8">
            {GRADIENT_PRESETS.map((g, i) => (
              <div
                key={i}
                className={`w-20 h-28 rounded-xl transition-all duration-1000 ${
                  i === slideshowIndex ? "scale-110 shadow-2xl" : "opacity-50 scale-95"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`,
                }}
              />
            ))}
          </div>

          {/* Touch to begin */}
          <p className="text-2xl text-wf-primary font-semibold animate-pulse mt-12">
            Touch to Begin
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: LANG
  // =========================================================================
  if (currentScreen === "LANG") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <h2 className="text-4xl font-bold text-wf-text mb-2">
          Choose Your Language
        </h2>
        <p className="text-wf-subtext text-lg mb-10">
          Select your preferred language
        </p>

        <div className="grid grid-cols-3 gap-5 max-w-2xl w-full">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                goToScreen("AUTH");
              }}
              className="h-24 rounded-2xl bg-wf-card border-2 border-wf-border hover:border-wf-primary text-center cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl font-bold text-wf-text">
                {lang.native}
              </span>
              <span className="text-sm text-wf-subtext">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: AUTH
  // =========================================================================
  if (currentScreen === "AUTH") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-wf-text text-center mb-1">
            Welcome to {config.storeName}
          </h2>
          <p className="text-wf-subtext text-lg text-center mb-8">
            {otpSent
              ? "Enter the OTP sent to your phone"
              : authMode === "phone"
                ? "Enter your phone number to continue"
                : "Enter the store code to continue as guest"}
          </p>

          {/* Mode toggle */}
          {!otpSent && (
            <div className="flex gap-2 mb-6 justify-center">
              <button
                onClick={() => {
                  setAuthMode("phone");
                  setAuthError("");
                }}
                className={`px-6 py-3 rounded-xl text-base font-semibold cursor-pointer transition-all ${
                  authMode === "phone"
                    ? "bg-wf-primary text-white"
                    : "bg-wf-card text-wf-subtext border border-wf-border"
                }`}
              >
                Phone Number
              </button>
              <button
                onClick={() => {
                  setAuthMode("code");
                  setAuthError("");
                }}
                className={`px-6 py-3 rounded-xl text-base font-semibold cursor-pointer transition-all ${
                  authMode === "code"
                    ? "bg-wf-primary text-white"
                    : "bg-wf-card text-wf-subtext border border-wf-border"
                }`}
              >
                Store Code
              </button>
            </div>
          )}

          {/* Phone mode */}
          {authMode === "phone" && !otpSent && (
            <>
              {/* Phone display */}
              <div className="bg-wf-card border-2 border-wf-border rounded-2xl px-6 py-5 mb-6 text-center">
                <span className="text-wf-subtext text-xl mr-2">+91</span>
                <span className="text-3xl font-bold text-wf-text tracking-widest font-mono">
                  {phoneDigits || "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                </span>
              </div>

              <NumPad onKey={handlePhoneKeyPress} />

              {authError && (
                <p className="text-wf-red text-sm text-center mt-4 font-medium">
                  {authError}
                </p>
              )}

              <button
                onClick={() => {
                  if (phoneDigits.length === 10) setShowConfirmPhone(true);
                  else setAuthError("Please enter a valid 10-digit number");
                }}
                disabled={phoneDigits.length !== 10}
                className="w-full mt-6 py-4 bg-wf-primary text-white rounded-2xl text-xl font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-wf-primary/90 transition-colors"
              >
                Continue
              </button>

              {/* Confirm phone modal */}
              {showConfirmPhone && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="bg-wf-bg rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
                    <h3 className="text-2xl font-bold text-wf-text mb-2 text-center">
                      Confirm Your Number
                    </h3>
                    <p className="text-3xl font-bold text-wf-primary text-center font-mono my-6">
                      +91 {phoneDigits}
                    </p>
                    <p className="text-wf-subtext text-center text-base mb-6">
                      We will send an OTP to this number
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowConfirmPhone(false)}
                        className="flex-1 py-4 bg-wf-card border border-wf-border rounded-2xl text-lg font-semibold cursor-pointer text-wf-text"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleSendOtp}
                        className="flex-1 py-4 bg-wf-primary text-white rounded-2xl text-lg font-semibold cursor-pointer"
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* OTP mode */}
          {authMode === "phone" && otpSent && (
            <>
              <div className="bg-wf-card border-2 border-wf-border rounded-2xl px-6 py-5 mb-4 text-center">
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold font-mono ${
                        otpDigits[i]
                          ? "border-wf-primary text-wf-text bg-wf-primary/5"
                          : "border-wf-border text-wf-muted"
                      }`}
                    >
                      {otpDigits[i] || "\u2022"}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mb-4">
                {otpTimer > 0 ? (
                  <span className="text-wf-subtext text-sm">
                    Resend OTP in {otpTimer}s
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setOtpTimer(60);
                      setOtpDigits("");
                    }}
                    className="text-wf-primary text-sm font-semibold cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <NumPad onKey={handleOtpKeyPress} />

              {authError && (
                <p className="text-wf-red text-sm text-center mt-4 font-medium">
                  {authError}
                </p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={otpDigits.length !== 6}
                className="w-full mt-6 py-4 bg-wf-primary text-white rounded-2xl text-xl font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-wf-primary/90 transition-colors"
              >
                Verify OTP
              </button>

              <button
                onClick={() => {
                  setOtpSent(false);
                  setOtpDigits("");
                  setAuthError("");
                }}
                className="w-full mt-3 py-3 text-wf-subtext text-base font-medium cursor-pointer"
              >
                Change Number
              </button>
            </>
          )}

          {/* Store code mode */}
          {authMode === "code" && (
            <>
              <div className="bg-wf-card border-2 border-wf-border rounded-2xl px-6 py-5 mb-6 text-center">
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold font-mono ${
                        storeCode[i]
                          ? "border-wf-primary text-wf-text bg-wf-primary/5"
                          : "border-wf-border text-wf-muted"
                      }`}
                    >
                      {storeCode[i] || "\u2022"}
                    </div>
                  ))}
                </div>
              </div>

              <NumPad onKey={handleStoreCodeKeyPress} />

              {authError && (
                <p className="text-wf-red text-sm text-center mt-4 font-medium">
                  {authError}
                </p>
              )}

              <button
                onClick={handleStoreCodeLogin}
                disabled={storeCode.length !== 6}
                className="w-full mt-6 py-4 bg-wf-primary text-white rounded-2xl text-xl font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-wf-primary/90 transition-colors"
              >
                Enter as Guest
              </button>
            </>
          )}

          {/* Back to language */}
          <button
            onClick={() => {
              goToScreen("LANG");
              setPhoneDigits("");
              setOtpSent(false);
              setOtpDigits("");
              setStoreCode("");
              setAuthError("");
            }}
            className="w-full mt-4 py-3 text-wf-muted text-sm cursor-pointer"
          >
            &larr; Change Language
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: HOME (Catalog Browse)
  // =========================================================================
  if (currentScreen === "HOME") {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-wf-text">
              {config.storeName}
            </h2>
            <p className="text-wf-subtext text-sm">
              {isGuest ? "Guest Session" : `Welcome, +91 ${phoneDigits}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => goToScreen("WARDROBE")}
              className="px-5 py-3 bg-wf-card border border-wf-border rounded-xl text-base font-semibold cursor-pointer text-wf-text hover:bg-wf-primary/10 transition-colors"
            >
              Wardrobe ({wardrobeItems.length})
            </button>
            <button
              onClick={() => goToScreen("TAILORS")}
              className="px-5 py-3 bg-wf-card border border-wf-border rounded-xl text-base font-semibold cursor-pointer text-wf-text hover:bg-wf-primary/10 transition-colors"
            >
              Tailors
            </button>
            <button
              onClick={() => goToScreen("FEEDBACK")}
              className="px-5 py-3 bg-wf-card border border-wf-border rounded-xl text-base font-semibold cursor-pointer text-wf-text hover:bg-wf-primary/10 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-6 pb-4 flex-shrink-0">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sarees by name, fabric, or type..."
                className="w-full px-5 py-4 bg-wf-card border border-wf-border rounded-xl text-lg text-wf-text placeholder:text-wf-muted outline-none focus:border-wf-primary transition-colors"
              />
            </div>
            <button className="w-14 h-14 bg-wf-card border border-wf-border rounded-xl flex items-center justify-center text-wf-subtext text-xl cursor-pointer">
              &#127908;
            </button>
            <button className="w-14 h-14 bg-wf-card border border-wf-border rounded-xl flex items-center justify-center text-wf-subtext text-xl cursor-pointer">
              &#9783;
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 pb-4 flex gap-4 flex-shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(selectedCategory === cat.name ? null : cat.name);
                setSearchTerm("");
              }}
              className={`flex-1 h-20 rounded-2xl flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-95 ${
                selectedCategory === cat.name
                  ? "ring-3 ring-wf-primary shadow-lg"
                  : "opacity-80 hover:opacity-100"
              }`}
              style={{
                background: `linear-gradient(135deg, ${cat.grad[0]}, ${cat.grad[1]})`,
              }}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-white text-xl font-bold">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Saree grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <h3 className="text-xl font-bold text-wf-text mb-4">
            {selectedCategory
              ? `${selectedCategory} Collection`
              : searchTerm
                ? `Search Results`
                : "All Sarees"}
            <span className="text-wf-muted font-normal text-base ml-2">
              ({displaySarees.length})
            </span>
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {displaySarees.map((saree) => (
              <button
                key={saree._id}
                onClick={() => {
                  setSelectedSareeId(saree._id);
                  setSelectedColor(0);
                  goToScreen("PRODUCT");
                }}
                className="bg-wf-card border border-wf-border rounded-2xl overflow-hidden text-left cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <GradientBox
                  grad={saree.grad || GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)]}
                  className="h-36 w-full"
                >
                  {saree.tag && (
                    <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {saree.tag}
                    </span>
                  )}
                </GradientBox>
                <div className="p-3">
                  <p className="text-base font-semibold text-wf-text truncate">
                    {saree.name}
                  </p>
                  <p className="text-sm text-wf-subtext">{saree.fabric}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-bold text-wf-primary">
                      &#8377;{saree.price.toLocaleString()}
                    </span>
                    {saree.occasion && (
                      <span className="text-xs bg-wf-primary/10 text-wf-primary px-2 py-0.5 rounded-full">
                        {saree.occasion}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {displaySarees.length === 0 && (
            <div className="text-center py-20 text-wf-muted text-xl">
              No sarees found
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: PRODUCT DETAIL
  // =========================================================================
  if (currentScreen === "PRODUCT" && selectedSareeId && !selectedSaree) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4 text-wf-primary">&#9881;</div>
          <p className="text-xl text-wf-subtext">Loading saree details...</p>
        </div>
      </div>
    );
  }

  if (currentScreen === "PRODUCT" && selectedSaree) {
    const colors = selectedSaree.colors || [];
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Top: Gradient placeholder */}
        <div className="relative flex-shrink-0">
          <GradientBox
            grad={selectedSaree.grad || GRADIENT_PRESETS[0]}
            className="w-full h-[45vh]"
          >
            <span className="text-white/30 text-6xl">&#128091;</span>
          </GradientBox>
          <div className="absolute top-5 left-5">
            <BackButton to="HOME" />
          </div>
          <button
            onClick={() => {
              // Toggle favorite - in-memory for now
            }}
            className="absolute top-5 right-5 w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl cursor-pointer"
          >
            &#9825;
          </button>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-wf-text mb-1">
            {selectedSaree.name}
          </h1>
          <p className="text-wf-subtext text-lg mb-4">
            {selectedSaree.fabric} &middot; {selectedSaree.type}
          </p>

          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-4xl font-extrabold text-wf-primary">
              &#8377;{selectedSaree.price.toLocaleString()}
            </span>
            {selectedSaree.mrp && selectedSaree.mrp > selectedSaree.price && (
              <span className="text-xl text-wf-muted line-through">
                &#8377;{selectedSaree.mrp.toLocaleString()}
              </span>
            )}
          </div>

          {selectedSaree.description && (
            <p className="text-wf-subtext text-base mb-6 leading-relaxed">
              {selectedSaree.description}
            </p>
          )}

          {/* Color selector */}
          {colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-wf-text mb-3">
                Colors
              </h3>
              <div className="flex gap-3">
                {colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={`w-12 h-12 rounded-full cursor-pointer border-3 transition-all ${
                      selectedColor === i
                        ? "border-wf-primary scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pb-4">
            <button
              onClick={() => {
                setScanPhase("position");
                setScanCountdown(3);
                goToScreen("BODY_SCAN");
              }}
              className="w-full py-5 bg-wf-primary text-white rounded-2xl text-xl font-bold cursor-pointer hover:bg-wf-primary/90 transition-colors"
            >
              Try On
            </button>
            <button
              onClick={handleAddToWardrobe}
              className="w-full py-4 bg-wf-card border-2 border-wf-primary text-wf-primary rounded-2xl text-lg font-semibold cursor-pointer hover:bg-wf-primary/5 transition-colors"
            >
              Add to Wardrobe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: BODY SCAN
  // =========================================================================
  if (currentScreen === "BODY_SCAN") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-lg w-full text-center">
          {scanPhase === "position" && (
            <>
              <h2 className="text-3xl font-bold text-wf-text mb-6">
                Body Scan
              </h2>
              {/* Camera frame placeholder */}
              <div className="mx-auto w-72 h-96 border-4 border-dashed border-wf-primary/40 rounded-3xl flex items-center justify-center mb-6 bg-wf-card">
                <div className="text-center">
                  <span className="text-6xl block mb-4">&#128247;</span>
                  <p className="text-wf-subtext text-lg">
                    Position yourself in the frame
                  </p>
                </div>
              </div>
              <p className="text-wf-muted text-base mb-8">
                Stand 3 feet away and face the mirror
              </p>
              <button
                onClick={() => setScanPhase("countdown")}
                className="px-12 py-5 bg-wf-primary text-white rounded-2xl text-xl font-bold cursor-pointer hover:bg-wf-primary/90 transition-colors"
              >
                Capture
              </button>
              <button
                onClick={() => goToScreen("PRODUCT")}
                className="block mx-auto mt-4 text-wf-subtext text-base cursor-pointer"
              >
                &larr; Back
              </button>
            </>
          )}

          {scanPhase === "countdown" && (
            <div className="flex flex-col items-center justify-center">
              <div className="w-72 h-96 border-4 border-wf-primary rounded-3xl flex items-center justify-center bg-wf-card mb-6">
                <span className="text-9xl font-extrabold text-wf-primary animate-pulse">
                  {scanCountdown}
                </span>
              </div>
              <p className="text-wf-subtext text-xl">Hold still...</p>
            </div>
          )}

          {scanPhase === "scanning" && (
            <div className="flex flex-col items-center justify-center">
              <div className="w-72 h-96 border-4 border-wf-amber rounded-3xl flex items-center justify-center bg-wf-card mb-6">
                <div className="text-center">
                  <div className="animate-spin text-5xl mb-4">&#9881;</div>
                  <p className="text-wf-amber text-xl font-semibold">
                    Scanning...
                  </p>
                </div>
              </div>
            </div>
          )}

          {scanPhase === "done" && (
            <div className="flex flex-col items-center justify-center">
              <div className="w-72 h-96 border-4 border-wf-green rounded-3xl flex items-center justify-center bg-wf-green/5 mb-6">
                <div className="text-center">
                  <span className="text-7xl block mb-4 text-wf-green">
                    &#10003;
                  </span>
                  <p className="text-wf-green text-2xl font-bold">
                    Scan Complete!
                  </p>
                </div>
              </div>
              <p className="text-wf-muted text-base mb-8">
                Body scan valid for 6 months
              </p>
              <button
                onClick={() => goToScreen("TRY_ON")}
                className="px-12 py-5 bg-wf-primary text-white rounded-2xl text-xl font-bold cursor-pointer hover:bg-wf-primary/90 transition-colors"
              >
                Continue to Try-On
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: TRY-ON
  // =========================================================================
  if (currentScreen === "TRY_ON") {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Timer bar */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <BackButton to="PRODUCT" />
          <div className="flex items-center gap-4">
            <div className="bg-wf-card border border-wf-border rounded-xl px-4 py-2">
              <span className="text-wf-subtext text-sm mr-2">Time</span>
              <span className={`text-xl font-bold font-mono ${tryOnTimer < 30 ? "text-wf-red" : "text-wf-text"}`}>
                {formatTime(tryOnTimer)}
              </span>
            </div>
            <button
              onClick={() => setTryOnTimer((t) => t + 30)}
              className="px-4 py-2 bg-wf-primary/10 text-wf-primary rounded-xl text-sm font-semibold cursor-pointer"
            >
              +30s
            </button>
          </div>
        </div>

        {/* Split view */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Left: Try-on preview */}
          <div className="flex-1">
            <GradientBox
              grad={selectedSaree?.grad || GRADIENT_PRESETS[0]}
              className="w-full h-full"
            >
              <div className="text-center text-white/50">
                <span className="text-8xl block mb-4">&#128091;</span>
                <p className="text-2xl font-semibold">Your Try-On Look</p>
                <p className="text-base mt-2">
                  {selectedSaree?.name} &middot; {drapeStyle} Style
                </p>
              </div>
            </GradientBox>
          </div>

          {/* Right: Controls */}
          <div className="w-80 flex-shrink-0 overflow-y-auto space-y-5">
            {/* Draping styles */}
            <div>
              <h3 className="text-lg font-bold text-wf-text mb-3">
                Draping Style
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {DRAPING_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setDrapeStyle(style)}
                    className={`py-3 rounded-xl text-base font-semibold cursor-pointer transition-all ${
                      drapeStyle === style
                        ? "bg-wf-primary text-white"
                        : "bg-wf-card border border-wf-border text-wf-text hover:bg-wf-primary/10"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div>
              <h3 className="text-lg font-bold text-wf-text mb-3">
                Accessories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc}
                    onClick={() =>
                      setActiveAccessories((prev) =>
                        prev.includes(acc)
                          ? prev.filter((a) => a !== acc)
                          : [...prev, acc]
                      )
                    }
                    className={`py-3 rounded-xl text-base font-semibold cursor-pointer transition-all ${
                      activeAccessories.includes(acc)
                        ? "bg-wf-amber text-white"
                        : "bg-wf-card border border-wf-border text-wf-text hover:bg-wf-amber/10"
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>

            {/* Necklines */}
            <div>
              <h3 className="text-lg font-bold text-wf-text mb-3">
                Neckline
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {NECKLINES.map((nl) => (
                  <button
                    key={nl}
                    onClick={() => setNeckline(nl)}
                    className={`py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                      neckline === nl
                        ? "bg-wf-blue text-white"
                        : "bg-wf-card border border-wf-border text-wf-text hover:bg-wf-blue/10"
                    }`}
                  >
                    {nl}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToWardrobe}
                className="w-full py-4 bg-wf-primary text-white rounded-2xl text-lg font-bold cursor-pointer hover:bg-wf-primary/90 transition-colors"
              >
                Save to Wardrobe
              </button>
              <button
                onClick={() => {
                  goToScreen("HOME");
                }}
                className="w-full py-3 bg-wf-card border border-wf-border text-wf-text rounded-2xl text-base font-semibold cursor-pointer hover:bg-wf-primary/10 transition-colors"
              >
                Next Saree
              </button>
              <button
                onClick={() => goToScreen("WARDROBE")}
                className="w-full py-3 bg-wf-green text-white rounded-2xl text-base font-semibold cursor-pointer hover:bg-wf-green/90 transition-colors"
              >
                Done &rarr; Wardrobe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: WARDROBE
  // =========================================================================
  if (currentScreen === "WARDROBE") {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between flex-shrink-0">
          <BackButton to="HOME" label="Back to Catalog" />
          <h2 className="text-2xl font-bold text-wf-text">My Wardrobe</h2>
          <div className="flex gap-3">
            <button
              onClick={() => goToScreen("TAILORS")}
              className="px-5 py-3 bg-wf-card border border-wf-border rounded-xl text-base font-semibold cursor-pointer text-wf-text"
            >
              Find Tailor
            </button>
          </div>
        </div>

        {/* 3-column layout */}
        <div className="flex-1 flex overflow-hidden px-6 pb-6 gap-6">
          {/* Left: Sarees list */}
          <div className="flex-1 overflow-y-auto space-y-3">
            <h3 className="text-lg font-semibold text-wf-text mb-2">
              Saved Looks ({wardrobeItems.length}/10)
            </h3>
            {wardrobeItems.length === 0 && (
              <div className="text-center py-16 text-wf-muted text-lg">
                <p>No sarees in your wardrobe yet.</p>
                <button
                  onClick={() => goToScreen("HOME")}
                  className="mt-4 text-wf-primary font-semibold cursor-pointer"
                >
                  Browse Sarees
                </button>
              </div>
            )}
            {wardrobeItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  item.selected
                    ? "border-wf-primary bg-wf-primary/5"
                    : "border-wf-border bg-wf-card hover:border-wf-primary/50"
                }`}
                onClick={() =>
                  setWardrobeItems((prev) =>
                    prev.map((w, i) =>
                      i === idx ? { ...w, selected: !w.selected } : w
                    )
                  )
                }
              >
                <GradientBox
                  grad={item.grad}
                  className="w-16 h-20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-wf-text truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-wf-subtext">
                    {item.drapeStyle} &middot; {item.neckline}
                  </p>
                  <p className="text-lg font-bold text-wf-primary">
                    &#8377;{item.price.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center ${
                    item.selected
                      ? "bg-wf-primary border-wf-primary text-white"
                      : "border-wf-border"
                  }`}
                >
                  {item.selected && <span>&#10003;</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Center: Model placeholder */}
          <div className="w-64 flex-shrink-0">
            <GradientBox
              grad={["#1A1A1A", "#333333"]}
              className="w-full h-full"
            >
              <div className="text-center text-white/30">
                <span className="text-7xl block mb-3">&#128100;</span>
                <p className="text-base">Your Look</p>
              </div>
            </GradientBox>
          </div>

          {/* Right: Accessories & Actions */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-wf-card border border-wf-border rounded-2xl p-4">
              <h3 className="text-base font-semibold text-wf-text mb-2">
                Accessories
              </h3>
              <div className="space-y-2">
                {ACCESSORIES.map((acc) => (
                  <div
                    key={acc}
                    className="flex items-center justify-between py-2 px-3 bg-wf-bg rounded-lg"
                  >
                    <span className="text-sm text-wf-text">{acc}</span>
                    <span className="text-xs text-wf-muted">+</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1" />

            {/* Share on WhatsApp */}
            <button
              onClick={() => {
                if (whatsappShareCount >= 5) return;
                setShowWhatsappConsent(true);
              }}
              disabled={
                wardrobeItems.filter((w) => w.selected).length === 0 ||
                whatsappShareCount >= 5
              }
              className="w-full py-4 bg-wf-green text-white rounded-2xl text-base font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-wf-green/90 transition-colors"
            >
              Share on WhatsApp ({whatsappShareCount}/5)
            </button>

            {/* Checkout */}
            <button
              onClick={handleCreateOrder}
              disabled={wardrobeItems.length === 0}
              className="w-full py-4 bg-wf-primary text-white rounded-2xl text-lg font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-wf-primary/90 transition-colors"
            >
              Checkout
            </button>
          </div>
        </div>

        {/* WhatsApp consent overlay */}
        {showWhatsappConsent && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-wf-bg rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold text-wf-text mb-4 text-center">
                Share via WhatsApp
              </h3>
              <p className="text-wf-subtext text-base text-center mb-6">
                By sharing, you consent to sending selected look details to your
                WhatsApp number. Your privacy is important to us.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWhatsappConsent(false)}
                  className="flex-1 py-4 bg-wf-card border border-wf-border rounded-2xl text-lg font-semibold cursor-pointer text-wf-text"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setWhatsappShareCount((c) => c + 1);
                    setShowWhatsappConsent(false);
                    const selected = wardrobeItems.filter((w) => w.selected);
                    const text = encodeURIComponent(
                      `Check out my Wearify looks from ${config.storeName}! ${selected.map((s) => s.name).join(", ")}`
                    );
                    const phone = customerPhone.replace("+", "");
                    window.open(
                      `https://wa.me/${phone || "91"}?text=${text}`,
                      "_blank"
                    );
                  }}
                  className="flex-1 py-4 bg-wf-green text-white rounded-2xl text-lg font-semibold cursor-pointer"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN: ORDER
  // =========================================================================
  if (currentScreen === "ORDER") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-xl w-full">
          <h2 className="text-3xl font-bold text-wf-text text-center mb-6">
            Order Summary
          </h2>

          {/* Items table */}
          <div className="bg-wf-card border border-wf-border rounded-2xl overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-wf-border flex justify-between text-sm font-semibold text-wf-subtext">
              <span>Item</span>
              <span>Price</span>
            </div>
            {wardrobeItems.map((item, idx) => (
              <div
                key={idx}
                className="px-5 py-3 border-b border-wf-border flex justify-between items-center"
              >
                <span className="text-base text-wf-text">{item.name}</span>
                <span className="text-base font-semibold text-wf-text">
                  &#8377;{item.price.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="px-5 py-3 border-b border-wf-border flex justify-between">
              <span className="text-sm text-wf-subtext">Subtotal</span>
              <span className="text-base font-semibold text-wf-text">
                &#8377;{orderSubtotal.toLocaleString()}
              </span>
            </div>
            <div className="px-5 py-3 border-b border-wf-border flex justify-between">
              <span className="text-sm text-wf-subtext">
                GST (5% under &#8377;1000, 12% above)
              </span>
              <span className="text-base font-semibold text-wf-text">
                &#8377;{orderGST.toFixed(2)}
              </span>
            </div>
            <div className="px-5 py-4 flex justify-between bg-wf-primary/5">
              <span className="text-lg font-bold text-wf-text">Total</span>
              <span className="text-2xl font-extrabold text-wf-primary">
                &#8377;{orderTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="bg-wf-card border border-wf-border rounded-2xl p-8 text-center mb-6">
            <div className="w-48 h-48 mx-auto border-2 border-dashed border-wf-border rounded-2xl flex items-center justify-center mb-4 bg-white">
              <div className="text-center">
                <span className="text-4xl block mb-2">&#9783;</span>
                <p className="text-sm font-mono font-bold text-wf-text">
                  {orderId || "------"}
                </p>
              </div>
            </div>
            <p className="text-xl font-semibold text-wf-text mb-1">
              Scan QR to Pay
            </p>
            <p className="text-wf-subtext text-base">
              Order ID: <span className="font-mono font-bold">{orderId}</span>
            </p>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <p className={`text-lg font-semibold ${orderExpiry < 60 ? "text-wf-red" : "text-wf-subtext"}`}>
              Expires in {formatTime(orderExpiry)}
            </p>
          </div>

          {/* Done */}
          <button
            onClick={() => goToScreen("FEEDBACK")}
            className="w-full py-4 bg-wf-primary text-white rounded-2xl text-xl font-bold cursor-pointer hover:bg-wf-primary/90 transition-colors"
          >
            Done
          </button>
          <button
            onClick={() => goToScreen("WARDROBE")}
            className="w-full mt-3 py-3 text-wf-subtext text-base font-medium cursor-pointer text-center"
          >
            &larr; Back to Wardrobe
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: TAILORS
  // =========================================================================
  if (currentScreen === "TAILORS" && !selectedTailorId) {
    const sortedTailors = [...(tailors || [])].sort((a, b) => {
      if (tailorSort === "Top Rated") return b.rating - a.rating;
      if (tailorSort === "Nearby") return 0; // No real distance data
      return b.rating - a.rating; // default recommended
    });

    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex items-center justify-between flex-shrink-0">
          <BackButton to="HOME" label="Back to Catalog" />
          <h2 className="text-2xl font-bold text-wf-text">Find a Tailor</h2>
          <div className="flex gap-2">
            {["Recommended", "Nearby", "Top Rated"].map((sort) => (
              <button
                key={sort}
                onClick={() => setTailorSort(sort)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                  tailorSort === sort
                    ? "bg-wf-primary text-white"
                    : "bg-wf-card border border-wf-border text-wf-subtext"
                }`}
              >
                {sort}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {sortedTailors.length === 0 && (
            <div className="text-center py-20 text-wf-muted text-xl">
              No tailors found in {store?.city || "your area"}
            </div>
          )}
          {sortedTailors.map((tailor) => (
            <button
              key={tailor._id}
              onClick={() => {
                setSelectedTailorId(tailor.tailorId);
                goToScreen("TAILOR_DETAIL");
              }}
              className="w-full flex items-center gap-5 p-5 bg-wf-card border border-wf-border rounded-2xl cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] text-left"
            >
              <div className="w-16 h-16 bg-wf-primary/10 rounded-full flex items-center justify-center text-2xl text-wf-primary flex-shrink-0">
                &#9986;
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-wf-text truncate">
                    {tailor.name}
                  </h3>
                  {tailor.badge && (
                    <span className="text-xs bg-wf-green/10 text-wf-green px-2 py-0.5 rounded-full font-semibold">
                      {tailor.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-wf-subtext">
                  {tailor.specialties?.join(", ") || "General tailoring"}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-wf-amber font-semibold">
                    {"&#9733;".repeat(0)} {tailor.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-wf-muted">
                    {tailor.reviewCount || 0} reviews
                  </span>
                  <span className="text-sm text-wf-muted">
                    {tailor.area || tailor.city}
                  </span>
                </div>
              </div>
              <span className="text-wf-muted text-2xl">&rarr;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: TAILOR DETAIL
  // =========================================================================
  if (currentScreen === "TAILOR_DETAIL" && selectedTailorId && !selectedTailor) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4 text-wf-primary">&#9881;</div>
          <p className="text-xl text-wf-subtext">Loading tailor details...</p>
        </div>
      </div>
    );
  }

  if (currentScreen === "TAILOR_DETAIL" && selectedTailor) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex-shrink-0">
          <button
            onClick={() => {
              setSelectedTailorId(null);
              goToScreen("TAILORS");
            }}
            className="flex items-center gap-2 text-wf-subtext text-lg font-medium cursor-pointer hover:text-wf-text transition-colors"
          >
            <span className="text-2xl">&larr;</span>
            Back to Tailors
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Tailor info */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-wf-primary/10 rounded-full flex items-center justify-center text-4xl text-wf-primary">
              &#9986;
            </div>
            <div>
              <h2 className="text-3xl font-bold text-wf-text">
                {selectedTailor.name}
              </h2>
              <p className="text-lg text-wf-subtext">
                {selectedTailor.area || selectedTailor.city}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-lg text-wf-amber font-semibold">
                  {selectedTailor.rating.toFixed(1)} stars
                </span>
                <span className="text-base text-wf-muted">
                  {selectedTailor.reviewCount || 0} reviews
                </span>
              </div>
            </div>
          </div>

          {selectedTailor.bio && (
            <p className="text-wf-subtext text-base mb-6 leading-relaxed">
              {selectedTailor.bio}
            </p>
          )}

          <div className="flex gap-3 mb-6">
            {selectedTailor.specialties?.map((spec) => (
              <span
                key={spec}
                className="px-4 py-2 bg-wf-primary/10 text-wf-primary rounded-xl text-sm font-semibold"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Portfolio grid */}
          <h3 className="text-xl font-bold text-wf-text mb-4">Portfolio</h3>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {(tailorPortfolio || []).map((item) => (
              <GradientBox
                key={item._id}
                grad={item.grad || GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)]}
                className="h-32 w-full"
              >
                {item.tag && (
                  <span className="text-white text-xs bg-black/40 px-2 py-1 rounded-full">
                    {item.tag}
                  </span>
                )}
              </GradientBox>
            ))}
            {(!tailorPortfolio || tailorPortfolio.length === 0) && (
              <div className="col-span-4 text-center py-10 text-wf-muted">
                No portfolio items yet
              </div>
            )}
          </div>

          {/* Connect button */}
          <button
            onClick={() => setShowTailorConsent(true)}
            className="w-full max-w-md mx-auto block py-5 bg-wf-green text-white rounded-2xl text-xl font-bold cursor-pointer hover:bg-wf-green/90 transition-colors"
          >
            Connect via WhatsApp
          </button>
        </div>

        {/* WhatsApp consent for tailor */}
        {showTailorConsent && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-wf-bg rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold text-wf-text mb-4 text-center">
                Connect with {selectedTailor.name}
              </h3>
              <p className="text-wf-subtext text-base text-center mb-6">
                You will be redirected to WhatsApp with a reference code. Your
                phone number may be shared with the tailor for follow-up.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTailorConsent(false)}
                  className="flex-1 py-4 bg-wf-card border border-wf-border rounded-2xl text-lg font-semibold cursor-pointer text-wf-text"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowTailorConsent(false);
                    const refCode = `WF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
                    const text = encodeURIComponent(
                      `Hi ${selectedTailor.name}, I found you on Wearify at ${config.storeName}. Reference: ${refCode}`
                    );
                    const phone = selectedTailor.phone.replace("+", "");
                    window.open(
                      `https://wa.me/${phone}?text=${text}`,
                      "_blank"
                    );
                  }}
                  className="flex-1 py-4 bg-wf-green text-white rounded-2xl text-lg font-semibold cursor-pointer"
                >
                  Open WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN: FEEDBACK
  // =========================================================================
  if (currentScreen === "FEEDBACK") {
    if (showThankYou) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <span className="text-8xl block mb-6 text-wf-green">
              &#10003;
            </span>
            <h2 className="text-4xl font-bold text-wf-text mb-2">
              Thank You!
            </h2>
            <p className="text-xl text-wf-subtext">
              Your feedback helps us improve
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-lg w-full text-center">
          <h2 className="text-3xl font-bold text-wf-text mb-2">
            How was your experience?
          </h2>
          <p className="text-wf-subtext text-lg mb-8">
            Rate your session at {config.storeName}
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setFeedbackRating(star)}
                className={`w-20 h-20 rounded-2xl text-4xl cursor-pointer transition-all active:scale-90 ${
                  feedbackRating >= star
                    ? "bg-wf-amber text-white scale-105"
                    : "bg-wf-card border border-wf-border text-wf-muted"
                }`}
              >
                &#9733;
              </button>
            ))}
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {FEEDBACK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() =>
                  setFeedbackChips((prev) =>
                    prev.includes(chip)
                      ? prev.filter((c) => c !== chip)
                      : [...prev, chip]
                  )
                }
                className={`px-5 py-3 rounded-xl text-base font-medium cursor-pointer transition-all ${
                  feedbackChips.includes(chip)
                    ? "bg-wf-primary text-white"
                    : "bg-wf-card border border-wf-border text-wf-text hover:bg-wf-primary/10"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmitFeedback}
            disabled={feedbackRating === 0}
            className="w-full max-w-sm mx-auto py-4 bg-wf-primary text-white rounded-2xl text-xl font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-wf-primary/90 transition-colors"
          >
            Submit Feedback
          </button>

          <button
            onClick={() => goToScreen("DATA_SAVE")}
            className="block mx-auto mt-4 text-wf-muted text-base cursor-pointer"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: DATA SAVE
  // =========================================================================
  if (currentScreen === "DATA_SAVE") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-lg w-full text-center">
          <h2 className="text-3xl font-bold text-wf-text mb-2">
            Save Your Session?
          </h2>
          <p className="text-wf-subtext text-lg mb-10">
            Choose what happens with your session data
          </p>

          {!isGuest && customerPhone && (
            <button
              onClick={handleEndSessionClean}
              className="w-full py-5 bg-wf-primary text-white rounded-2xl text-xl font-bold cursor-pointer hover:bg-wf-primary/90 transition-colors mb-4"
            >
              Save to My Account
              <span className="block text-sm font-normal text-white/70 mt-1">
                {customerPhone}
              </span>
            </button>
          )}

          <button
            onClick={handleEndSessionClean}
            className="w-full py-5 bg-wf-red text-white rounded-2xl text-xl font-bold cursor-pointer hover:bg-wf-red/90 transition-colors"
          >
            Delete Everything
            <span className="block text-sm font-normal text-white/70 mt-1">
              All session data will be permanently erased
            </span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: SESSION END
  // =========================================================================
  if (currentScreen === "SESSION_END") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-lg w-full text-center space-y-6">
          <span className="text-7xl block text-wf-green">&#10003;</span>
          <h2 className="text-4xl font-bold text-wf-text">
            Your Session Has Ended
          </h2>
          <div className="space-y-2">
            <p className="text-lg text-wf-subtext">
              All camera data has been cleared
            </p>
            <p className="text-base text-wf-muted">
              Your privacy is protected. No images or personal data are stored
              on this device after your session ends.
            </p>
          </div>
          <p className="text-wf-muted text-base">
            Returning to home screen in{" "}
            <span className="font-bold text-wf-text">{endTimer}s</span>
          </p>
          <button
            onClick={resetSession}
            className="mt-4 px-8 py-4 bg-wf-card border border-wf-border rounded-2xl text-lg font-semibold cursor-pointer text-wf-text"
          >
            Return Now
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl text-wf-text mb-4">
          Screen: {currentScreen}
        </p>
        <button
          onClick={() => goToScreen("IDLE")}
          className="px-6 py-3 bg-wf-primary text-white rounded-xl cursor-pointer"
        >
          Return to Start
        </button>
      </div>
    </div>
  );
}
