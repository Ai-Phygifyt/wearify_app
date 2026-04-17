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

  // UI extras
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [authStep, setAuthStep] = useState<"consent" | "phone" | "otp">("consent");
  const [tryOnTab, setTryOnTab] = useState<"STYLE" | "ACCESSORIES">("STYLE");
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [wardrobeLookTab, setWardrobeLookTab] = useState<"Blouse" | "Jewelry" | "Saree">("Blouse");
  const [orderQuantities, setOrderQuantities] = useState<Record<number, number>>({});
  const [feedbackText, setFeedbackText] = useState("");
  const [showTailorSortDropdown, setShowTailorSortDropdown] = useState(false);

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

  // Try-on end session warning at 5s
  useEffect(() => {
    if (currentScreen === "TRY_ON" && tryOnTimer === 5) {
      setShowEndSessionModal(true);
    }
    if (currentScreen === "TRY_ON" && tryOnTimer <= 0) {
      setShowEndSessionModal(false);
      goToScreen("WARDROBE");
    }
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
    setAuthStep("consent");
    setTryOnTab("STYLE");
    setShowEndSessionModal(false);
    setWardrobeLookTab("Blouse");
    setOrderQuantities({});
    setFeedbackText("");
    setShowLangDropdown(false);
    setShowTailorSortDropdown(false);
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
    const items = wardrobeItems.map((w, idx) => ({
      sareeId: w.sareeId,
      name: w.name,
      price: w.price,
      quantity: orderQuantities[idx] || 1,
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

  const fmt = (n: number) => "\u20B9" + Number(n).toLocaleString("en-IN");

  const computeGST = (price: number) => (price < 1000 ? price * 0.05 : price * 0.12);

  const orderSubtotal = wardrobeItems.reduce((sum, w, idx) => sum + w.price * (orderQuantities[idx] || 1), 0);
  const orderGST = wardrobeItems.reduce((sum, w, idx) => sum + computeGST(w.price) * (orderQuantities[idx] || 1), 0);
  const orderTotal = Math.round((orderSubtotal + orderGST) * 100) / 100;

  if (!config) return null;

  // ---------------------------------------------------------------------------
  // Reusable sub-components
  // ---------------------------------------------------------------------------

  /** NumPad with kiosk theme */
  const NumPad = ({ onKey }: { onKey: (d: string) => void }) => (
    <div className="k-numpad" style={{ maxWidth: 340, margin: "0 auto" }}>
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(
        (key) =>
          key === "" ? (
            <div key="empty" />
          ) : (
            <button
              key={key}
              onClick={() => onKey(key)}
              className={key === "del" ? "k-num-back" : ""}
            >
              {key === "del" ? "\u232B" : key}
            </button>
          )
      )}
    </div>
  );

  /** Gradient placeholder box */
  const GradientBox = ({
    grad,
    style: extraStyle,
    className = "",
    children,
  }: {
    grad?: string[];
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
  }) => {
    const g = grad || GRADIENT_PRESETS[0];
    return (
      <div
        className={`k-silk ${className}`}
        style={{
          background: `linear-gradient(135deg, ${g[0]}, ${g[1] || g[0]})`,
          borderRadius: "var(--k-r)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          ...extraStyle,
        }}
      >
        {children}
      </div>
    );
  };

  /** Top bar used on most screens */
  const TopBar = ({ onLogout }: { onLogout?: () => void }) => (
    <div className="k-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="k-topbar-logo">W</div>
        <span className="k-brand" style={{ fontSize: 17, color: "var(--k-text)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {config.storeName}
        </span>
      </div>
      {onLogout && (
        <button
          onClick={onLogout}
          className="k-press"
          style={{
            background: "none",
            border: "1px solid var(--k-border)",
            borderRadius: "var(--k-r-pill)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            color: "var(--k-text-muted)",
            padding: "6px 14px",
            fontFamily: "Roboto, sans-serif",
            letterSpacing: 0.5,
          }}
          title="Log out"
        >
          End Session
        </button>
      )}
    </div>
  );

  /** Sub-header with back + home */
  const SubHeader = ({ onBack, onHome }: { onBack?: () => void; onHome?: () => void }) => (
    <div className="k-subheader" style={{ gap: 12 }}>
      {onBack && (
        <button
          onClick={onBack}
          className="k-press"
          style={{
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "var(--k-text)",
            padding: "4px 8px",
          }}
        >
          ←
        </button>
      )}
      {onHome && (
        <button
          onClick={onHome}
          className="k-press"
          style={{
            background: "none",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            color: "var(--k-text-muted)",
            padding: "4px 8px",
          }}
        >
          ⌂
        </button>
      )}
    </div>
  );

  /** Horizontal scroll section with optional arrows */
  const HScrollSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const scroll = (dir: number) => {
      scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
    };
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", marginBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--k-text)", margin: 0, fontFamily: "Montserrat, sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</h3>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => scroll(-1)} className="k-press" style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--k-text)" }}>←</button>
            <button onClick={() => scroll(1)} className="k-press" style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--k-text)" }}>→</button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="k-no-scroll"
          style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 18px" }}
        >
          {children}
        </div>
      </div>
    );
  };

  /** Small product card for carousels */
  const ProductCard = ({
    saree,
    onClick,
  }: {
    saree: { _id: Id<"sarees">; name: string; fabric?: string; price: number; grad?: string[]; tag?: string; colors?: string[] };
    onClick: () => void;
  }) => (
    <div
      className="k-product-card k-press"
      onClick={onClick}
      style={{ minWidth: 160, maxWidth: 160, cursor: "pointer", flexShrink: 0 }}
    >
      <div style={{ position: "relative" }}>
        <GradientBox
          grad={saree.grad || GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)]}
          style={{ width: "100%", height: 140, borderRadius: "var(--k-r) var(--k-r) 0 0" }}
        >
          {saree.tag && (
            <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.5)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 100 }}>
              {saree.tag}
            </span>
          )}
        </GradientBox>
        <div className="k-heart" style={{ top: 8, right: 8 }}>
          <span style={{ fontSize: 14, color: "var(--k-text-muted)" }}>♡</span>
        </div>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--k-text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {saree.name}
        </p>
        {saree.fabric && (
          <p style={{ fontSize: 11, color: "var(--k-text-muted)", margin: "2px 0 0" }}>{saree.fabric}</p>
        )}
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--k-maroon)", margin: "4px 0 0" }}>
          {fmt(saree.price)}
        </p>
        {saree.colors && saree.colors.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {saree.colors.slice(0, 4).map((c, i) => (
              <div key={i} className="k-swatch" style={{ width: 14, height: 14, backgroundColor: c }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // =========================================================================
  // SCREEN: IDLE
  // =========================================================================
  if (currentScreen === "IDLE") {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          flex: 1,
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={() => goToScreen("HOME")}
      >
        {/* Background gradient slideshow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, ${GRADIENT_PRESETS[slideshowIndex][0]}40, ${GRADIENT_PRESETS[slideshowIndex][1]}50, var(--k-bg))`,
            transition: "background 2s ease-in-out",
          }}
        />
        {/* Beige overlay */}
        <div className="k-idle-bg" />

        {/* Top bar: store name left, lang selector right */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 28px 0",
          }}
        >
          <span
            className="k-brand"
            style={{ fontSize: 22, color: "var(--k-text)" }}
          >
            {config.storeName}
          </span>

          {/* Language selector */}
          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLangDropdown((v) => !v);
              }}
              className="k-press"
              style={{
                background: "var(--k-card)",
                border: "1px solid var(--k-border)",
                borderRadius: "var(--k-r-pill)",
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--k-text)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {LANGUAGES.find((l) => l.code === language)?.name || "Eng"}{" "}
              <span style={{ fontSize: 10 }}>⌄</span>
            </button>
            {showLangDropdown && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="k-scaleIn"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 4,
                  background: "var(--k-card)",
                  border: "1px solid var(--k-border)",
                  borderRadius: "var(--k-r)",
                  boxShadow: "var(--k-shadow-md)",
                  padding: 6,
                  zIndex: 50,
                  width: 160,
                }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLanguage(lang.code);
                      setShowLangDropdown(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      border: "none",
                      background: language === lang.code ? "var(--k-maroon)" : "transparent",
                      color: language === lang.code ? "#fff" : "var(--k-text)",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {lang.native} <span style={{ color: language === lang.code ? "rgba(255,255,255,.6)" : "var(--k-text-muted)", fontSize: 11 }}>({lang.name})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Centered content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100% - 60px)",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          {/* Main heading */}
          <div className="k-slideUp" style={{ marginBottom: 48, textAlign: "center" }}>
            <p
              className="k-brand"
              style={{
                fontSize: 30,
                color: "var(--k-text)",
                textTransform: "uppercase",
                letterSpacing: 3,
                margin: "0 0 10px",
                fontWeight: 700,
              }}
            >
              Experience the Art of the Saree
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--k-text-muted)",
                textTransform: "uppercase",
                letterSpacing: 2,
                margin: "0 0 40px",
                fontFamily: "Roboto, sans-serif",
              }}
            >
              Curated Collection · Virtual Try-On
            </p>

            {/* Touch to Start */}
            <div
              className="k-press k-slideUp k-d2"
              style={{
                display: "inline-block",
                background: "var(--k-maroon)",
                color: "#fff",
                borderRadius: "var(--k-r-pill)",
                padding: "20px 64px",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                boxShadow: "var(--k-shadow-lg)",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Touch Anywhere to Begin
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: LANG (merged into IDLE - redirect to AUTH)
  // =========================================================================
  if (currentScreen === "LANG") {
    goToScreen("AUTH");
    return null;
  }

  // =========================================================================
  // SCREEN: AUTH
  // =========================================================================
  if (currentScreen === "AUTH") {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)" }}>
        <TopBar onLogout={() => goToScreen("IDLE")} />
        <SubHeader onBack={() => goToScreen("IDLE")} onHome={() => goToScreen("IDLE")} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
          {/* Step 1: Consent modal */}
          {authStep === "consent" && (
            <div className="k-overlay k-fadeIn">
              <div className="k-modal k-scaleIn">
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--k-maroon)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "Montserrat, sans-serif", letterSpacing: 1 }}>W</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--k-text)", margin: "0 0 8px", fontFamily: "Montserrat, sans-serif" }}>
                  Start Your Try-On
                </h2>
                <p style={{ fontSize: 14, color: "var(--k-text-mid)", lineHeight: 1.5, margin: "0 0 24px" }}>
                  We need your phone number for verification and updates. Your data is safe and never shared.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => goToScreen("IDLE")}
                    className="k-press"
                    style={{
                      flex: 1,
                      padding: "14px 0",
                      borderRadius: "var(--k-r)",
                      border: "1.5px solid var(--k-border)",
                      background: "var(--k-card)",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "var(--k-text)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setAuthStep("phone")}
                    className="k-press"
                    style={{
                      flex: 1,
                      padding: "14px 0",
                      borderRadius: "var(--k-r)",
                      border: "none",
                      background: "var(--k-maroon)",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Allow
                  </button>
                </div>

                {/* Guest mode link */}
                <button
                  onClick={() => {
                    setAuthMode("code");
                    setAuthStep("phone");
                  }}
                  style={{
                    marginTop: 16,
                    background: "none",
                    border: "none",
                    color: "var(--k-text-muted)",
                    fontSize: 13,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Continue with store code instead
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Phone entry */}
          {authStep === "phone" && authMode === "phone" && (
            <div className="k-fadeIn" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 18px 0" }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--k-text)", margin: "0 0 4px" }}>Hello!</h2>
                <p style={{ fontSize: 15, color: "var(--k-text-mid)", margin: "0 0 24px" }}>Enter your mobile number</p>

                {/* Phone input */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "var(--k-card)",
                    border: "1.5px solid var(--k-border)",
                    borderRadius: "var(--k-r)",
                    padding: "14px 16px",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--k-text-muted)", background: "var(--k-bg)", padding: "4px 8px", borderRadius: 6, fontFamily: "Roboto, sans-serif" }}>IN +91</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "var(--k-text)", letterSpacing: 3, fontFamily: "'DM Mono', monospace", flex: 1 }}>
                    {phoneDigits || "••••••••••"}
                  </span>
                </div>

                {authError && (
                  <p style={{ color: "var(--k-red)", fontSize: 13, fontWeight: 500, textAlign: "center", margin: "0 0 10px" }}>
                    {authError}
                  </p>
                )}

                {/* Enter button */}
                <button
                  onClick={() => {
                    if (phoneDigits.length === 10) {
                      handleSendOtp();
                      setAuthStep("otp");
                    } else {
                      setAuthError("Please enter a valid 10-digit number");
                    }
                  }}
                  className="k-press"
                  style={{
                    width: "100%",
                    padding: "16px 0",
                    borderRadius: "var(--k-r)",
                    border: "none",
                    background: phoneDigits.length === 10 ? "var(--k-maroon)" : "var(--k-border)",
                    color: phoneDigits.length === 10 ? "#fff" : "var(--k-text-muted)",
                    fontSize: 17,
                    fontWeight: 700,
                    cursor: phoneDigits.length === 10 ? "pointer" : "default",
                    marginBottom: 16,
                  }}
                >
                  Enter
                </button>
              </div>

              {/* Numpad */}
              <NumPad onKey={handlePhoneKeyPress} />
              <div style={{ height: 12 }} />
            </div>
          )}

          {/* Step 2b: Store code entry */}
          {authStep === "phone" && authMode === "code" && (
            <div className="k-fadeIn" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 18px 0" }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--k-text)", margin: "0 0 4px" }}>Guest Access</h2>
                <p style={{ fontSize: 15, color: "var(--k-text-mid)", margin: "0 0 24px" }}>Enter the store code</p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 48,
                        height: 56,
                        borderRadius: "var(--k-r-sm)",
                        border: `2px solid ${storeCode[i] ? "var(--k-maroon)" : "var(--k-border)"}`,
                        background: storeCode[i] ? "rgba(107,26,26,.05)" : "var(--k-card)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        fontWeight: 700,
                        color: "var(--k-text)",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {storeCode[i] || "•"}
                    </div>
                  ))}
                </div>

                {authError && (
                  <p style={{ color: "var(--k-red)", fontSize: 13, fontWeight: 500, textAlign: "center", margin: "0 0 10px" }}>
                    {authError}
                  </p>
                )}

                <button
                  onClick={handleStoreCodeLogin}
                  className="k-press"
                  style={{
                    width: "100%",
                    padding: "16px 0",
                    borderRadius: "var(--k-r)",
                    border: "none",
                    background: storeCode.length === 6 ? "var(--k-maroon)" : "var(--k-border)",
                    color: storeCode.length === 6 ? "#fff" : "var(--k-text-muted)",
                    fontSize: 17,
                    fontWeight: 700,
                    cursor: storeCode.length === 6 ? "pointer" : "default",
                    marginBottom: 16,
                  }}
                >
                  Enter as Guest
                </button>

                <button
                  onClick={() => { setAuthMode("phone"); setAuthError(""); }}
                  style={{ background: "none", border: "none", color: "var(--k-text-muted)", fontSize: 13, cursor: "pointer", textDecoration: "underline", display: "block", margin: "0 auto" }}
                >
                  Use phone number instead
                </button>
              </div>
              <NumPad onKey={handleStoreCodeKeyPress} />
              <div style={{ height: 12 }} />
            </div>
          )}

          {/* Step 3: OTP entry */}
          {authStep === "otp" && (
            <div className="k-fadeIn" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 18px 0" }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--k-text)", margin: "0 0 4px" }}>Hello!</h2>
                <p style={{ fontSize: 15, color: "var(--k-text-mid)", margin: "0 0 24px" }}>Enter the OTP sent to +91 {phoneDigits}</p>

                {/* OTP boxes */}
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 48,
                        height: 56,
                        borderRadius: "var(--k-r-sm)",
                        border: `2px solid ${otpDigits[i] ? "var(--k-maroon)" : "var(--k-border)"}`,
                        background: otpDigits[i] ? "rgba(107,26,26,.05)" : "var(--k-card)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        fontWeight: 700,
                        color: "var(--k-text)",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {otpDigits[i] || "•"}
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  {otpTimer > 0 ? (
                    <span style={{ fontSize: 13, color: "var(--k-text-muted)" }}>Resend OTP in {otpTimer}s</span>
                  ) : (
                    <button
                      onClick={() => { setOtpTimer(60); setOtpDigits(""); }}
                      style={{ background: "none", border: "none", color: "var(--k-maroon)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                {authError && (
                  <p style={{ color: "var(--k-red)", fontSize: 13, fontWeight: 500, textAlign: "center", margin: "0 0 10px" }}>
                    {authError}
                  </p>
                )}

                <button
                  onClick={handleVerifyOtp}
                  className="k-press"
                  style={{
                    width: "100%",
                    padding: "16px 0",
                    borderRadius: "var(--k-r)",
                    border: "none",
                    background: otpDigits.length === 6 ? "var(--k-maroon)" : "var(--k-border)",
                    color: otpDigits.length === 6 ? "#fff" : "var(--k-text-muted)",
                    fontSize: 17,
                    fontWeight: 700,
                    cursor: otpDigits.length === 6 ? "pointer" : "default",
                    marginBottom: 16,
                  }}
                >
                  Enter
                </button>

                <button
                  onClick={() => { setAuthStep("phone"); setOtpSent(false); setOtpDigits(""); setAuthError(""); }}
                  style={{ background: "none", border: "none", color: "var(--k-text-muted)", fontSize: 13, cursor: "pointer", textDecoration: "underline", display: "block", margin: "0 auto" }}
                >
                  Change Number
                </button>
              </div>
              <NumPad onKey={handleOtpKeyPress} />
              <div style={{ height: 12 }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: HOME
  // =========================================================================
  if (currentScreen === "HOME") {
    const categoryCards = [
      { name: "Traditional Style", grad: ["#8B2E2E", "#C0392B"] },
      { name: "Draping Style", grad: ["#D4A843", "#E67E22"] },
      { name: "Modern Style", grad: ["#2C5F7C", "#1ABC9C"] },
      { name: "Contemporary", grad: ["#8E44AD", "#3498DB"] },
    ];

    const arrivalTypes = [
      { name: "Banarasi", grad: ["#C0392B", "#8E44AD"] },
      { name: "Kanchipuram", grad: ["#D4A843", "#E67E22"] },
      { name: "Paithani", grad: ["#2D8544", "#27AE60"] },
      { name: "Jamdani", grad: ["#2C5F7C", "#1ABC9C"] },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)" }}>
        <TopBar onLogout={() => goToScreen("FEEDBACK")} />

        {/* Search bar */}
        <div style={{ padding: "12px 18px", display: "flex", gap: 8 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--k-text-muted)", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sarees by name, fabric, or type..."
              style={{
                width: "100%",
                padding: "12px 14px 12px 40px",
                borderRadius: "var(--k-r)",
                border: "1px solid var(--k-border)",
                background: "var(--k-card)",
                fontSize: 14,
                color: "var(--k-text)",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
          <button
            className="k-press"
            style={{
              width: 46,
              height: 46,
              borderRadius: "var(--k-r)",
              border: "1px solid var(--k-border)",
              background: "var(--k-card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--k-text)",
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="17" x2="13" y2="17"/></svg>
          </button>
        </div>

        {/* Scrollable content area */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Trending Now */}
          <HScrollSection title="Trending Now">
            {displaySarees.slice(0, 8).map((saree) => (
              <ProductCard
                key={saree._id}
                saree={saree}
                onClick={() => {
                  setSelectedSareeId(saree._id);
                  setSelectedColor(0);
                  goToScreen("PRODUCT");
                }}
              />
            ))}
            {displaySarees.length === 0 && (
              <div style={{ padding: "20px 0", color: "var(--k-text-muted)", fontSize: 14, width: "100%", textAlign: "center" }}>
                No sarees found
              </div>
            )}
          </HScrollSection>

          {/* Shop By Categories */}
          <HScrollSection title="Shop By Categories">
            {categoryCards.map((cat) => (
              <div
                key={cat.name}
                className="k-press"
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat.name ? null : cat.name);
                  setSearchTerm("");
                }}
                style={{ minWidth: 130, cursor: "pointer", textAlign: "center", flexShrink: 0 }}
              >
                <GradientBox
                  grad={cat.grad}
                  style={{ width: 130, height: 130, borderRadius: "50%" }}
                />
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--k-text)", marginTop: 8 }}>{cat.name}</p>
              </div>
            ))}
          </HScrollSection>

          {/* New Arrivals */}
          <HScrollSection title="New Arrivals">
            {arrivalTypes.map((type) => (
              <div
                key={type.name}
                className="k-press"
                onClick={() => {
                  setSearchTerm(type.name);
                }}
                style={{ minWidth: 140, cursor: "pointer", textAlign: "center", flexShrink: 0 }}
              >
                <GradientBox
                  grad={type.grad}
                  style={{ width: 140, height: 100, borderRadius: "var(--k-r)" }}
                />
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--k-text)", marginTop: 8 }}>{type.name}</p>
              </div>
            ))}
          </HScrollSection>

          {/* Quick nav pills */}
          <div style={{ display: "flex", gap: 8, padding: "8px 18px 20px", flexWrap: "wrap" }}>
            <button onClick={() => goToScreen("WARDROBE")} className="k-press" style={{ padding: "10px 20px", borderRadius: "var(--k-r-pill)", border: "1px solid var(--k-border)", background: "var(--k-card)", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--k-text)" }}>
              My Wardrobe ({wardrobeItems.length})
            </button>
            <button onClick={() => goToScreen("TAILORS")} className="k-press" style={{ padding: "10px 20px", borderRadius: "var(--k-r-pill)", border: "1px solid var(--k-border)", background: "var(--k-card)", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--k-text)" }}>
              Find Tailor
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: PRODUCT DETAIL
  // =========================================================================
  if (currentScreen === "PRODUCT" && selectedSareeId && !selectedSaree) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--k-border)", borderTopColor: "var(--k-maroon)", animation: "k-spin 0.8s linear infinite", marginBottom: 16 }} />
        <p style={{ fontSize: 15, color: "var(--k-text-muted)", fontFamily: "Roboto, sans-serif" }}>Loading...</p>
      </div>
    );
  }

  if (currentScreen === "PRODUCT" && selectedSaree) {
    const colors = selectedSaree.colors || [];
    const hasDiscount = selectedSaree.mrp && selectedSaree.mrp > selectedSaree.price;
    const discountPct = hasDiscount ? Math.round(((selectedSaree.mrp! - selectedSaree.price) / selectedSaree.mrp!) * 100) : 0;

    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)" }}>
        <TopBar onLogout={() => goToScreen("FEEDBACK")} />
        <SubHeader onBack={() => goToScreen("HOME")} onHome={() => goToScreen("HOME")} />

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Large saree image */}
          <div style={{ position: "relative" }}>
            <GradientBox
              grad={selectedSaree.grad || GRADIENT_PRESETS[0]}
              style={{ width: "100%", height: "55vh", borderRadius: 0 }}
            >
              <div style={{ width: 60, height: 80, borderRadius: 4, background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)" }} />
            </GradientBox>
            <div className="k-heart" style={{ top: 14, right: 14, width: 38, height: 38 }}>
              <span style={{ fontSize: 18, color: "var(--k-text-muted)" }}>♡</span>
            </div>
          </div>

          {/* Info panel */}
          <div style={{ padding: "18px 18px 0" }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--k-text)", margin: "0 0 4px", fontFamily: "Montserrat, sans-serif" }}>
              {selectedSaree.name}
            </h1>
            <p style={{ fontSize: 13, color: "var(--k-text-muted)", margin: "0 0 10px" }}>
              {selectedSaree.fabric} · Handwoven · {selectedSaree.type || "Varanasi"}
            </p>

            {selectedSaree.description && (
              <p style={{ fontSize: 13, color: "var(--k-text-mid)", lineHeight: 1.6, margin: "0 0 14px" }}>
                {selectedSaree.description}
              </p>
            )}

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
              {hasDiscount && (
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--k-green)" }}>
                  -{discountPct}%
                </span>
              )}
              <span style={{ fontSize: 22, fontWeight: 800, color: "var(--k-maroon)" }}>
                {fmt(selectedSaree.price)}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: 14, color: "var(--k-text-muted)", textDecoration: "line-through" }}>
                  {fmt(selectedSaree.mrp!)}
                </span>
              )}
            </div>

            {/* Color swatches */}
            {colors.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {colors.map((color, i) => (
                  <div
                    key={i}
                    className={`k-swatch ${selectedColor === i ? "active" : ""}`}
                    onClick={() => setSelectedColor(i)}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}

            {/* Add Accessories section */}
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--k-text)", margin: "0 0 10px" }}>Add Accessories</h3>
              <div className="k-no-scroll" style={{ display: "flex", gap: 10, overflowX: "auto" }}>
                {["Traditional", "Draping", "Modern"].map((accType) => (
                  <div key={accType} style={{ minWidth: 90, textAlign: "center", flexShrink: 0 }}>
                    <GradientBox
                      grad={GRADIENT_PRESETS[Math.floor(Math.random() * 3)]}
                      style={{ width: 90, height: 70, borderRadius: "var(--k-r-sm)" }}
                    />
                    <p style={{ fontSize: 11, color: "var(--k-text-mid)", marginTop: 4 }}>{accType}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "var(--k-text-light)", fontStyle: "italic", marginTop: 6 }}>
                Accessories Are For Virtual Try-On Only Not Available For Purchase.
              </p>
            </div>

            {/* TRY-ON button */}
            <button
              onClick={() => {
                if (!customerId && !isGuest) {
                  goToScreen("AUTH");
                  return;
                }
                setScanPhase("position");
                setScanCountdown(3);
                goToScreen("BODY_SCAN");
              }}
              className="k-press"
              style={{
                width: "100%",
                padding: "18px 0",
                borderRadius: "var(--k-r-pill)",
                border: "none",
                background: "var(--k-maroon)",
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 18,
                letterSpacing: 1,
              }}
            >
              TRY-ON
            </button>
          </div>

          {/* Similar Categories */}
          <HScrollSection title="Similar Categories">
            {displaySarees
              .filter((s) => s._id !== selectedSaree._id)
              .slice(0, 6)
              .map((saree) => (
                <ProductCard
                  key={saree._id}
                  saree={saree}
                  onClick={() => {
                    setSelectedSareeId(saree._id);
                    setSelectedColor(0);
                  }}
                />
              ))}
          </HScrollSection>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: BODY SCAN
  // =========================================================================
  if (currentScreen === "BODY_SCAN") {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)" }}>
        <TopBar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 18px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--k-text)", margin: "0 0 4px", textAlign: "center", fontFamily: "Montserrat, sans-serif" }}>
            Create Your Digital Look
          </h2>
          <p style={{ fontSize: 14, color: "var(--k-text-mid)", margin: "0 0 20px", textAlign: "center" }}>
            Stand inside the Frame for a quick scan
          </p>

          {/* Scan area */}
          <div
            className="k-scan-frame"
            style={{
              flex: 1,
              width: "100%",
              maxWidth: 320,
              background: "var(--k-bg-warm)",
              borderRadius: "var(--k-r-lg)",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Body silhouette */}
            <svg
              viewBox="0 0 120 240"
              style={{ width: 100, height: 200, opacity: 0.15 }}
            >
              <ellipse cx="60" cy="40" rx="22" ry="28" fill="var(--k-text)" />
              <rect x="36" y="65" width="48" height="80" rx="12" fill="var(--k-text)" />
              <rect x="20" y="70" width="16" height="60" rx="8" fill="var(--k-text)" />
              <rect x="84" y="70" width="16" height="60" rx="8" fill="var(--k-text)" />
              <rect x="38" y="145" width="18" height="70" rx="9" fill="var(--k-text)" />
              <rect x="64" y="145" width="18" height="70" rx="9" fill="var(--k-text)" />
            </svg>

            {/* Corner brackets */}
            <div className="k-scan-corner tl" />
            <div className="k-scan-corner tr" />
            <div className="k-scan-corner bl" />
            <div className="k-scan-corner br" />

            {/* Scanning line */}
            {(scanPhase === "countdown" || scanPhase === "scanning") && (
              <div className="k-scan-line" />
            )}

            {/* Countdown overlay */}
            {scanPhase === "countdown" && scanCountdown > 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.15)" }}>
                <span style={{ fontSize: 80, fontWeight: 800, color: "var(--k-maroon)" }}>
                  {scanCountdown}
                </span>
              </div>
            )}

            {/* Scanning indicator */}
            {scanPhase === "scanning" && (
              <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
                <div className="k-timer" style={{ background: "var(--k-green)", color: "#fff", border: "none" }}>
                  Scanning...
                </div>
              </div>
            )}

            {/* Done */}
            {scanPhase === "done" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(45,133,68,.1)" }}>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: 56, color: "var(--k-green)" }}>✓</span>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--k-green)", marginTop: 8 }}>Scan Complete!</p>
                </div>
              </div>
            )}
          </div>

          {/* Timer pill for countdown/scanning */}
          {(scanPhase === "countdown" || scanPhase === "scanning") && (
            <div className="k-timer" style={{ marginTop: 16 }}>
              {scanPhase === "countdown" ? `${scanCountdown}s` : "Scanning..."}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ marginTop: 16, width: "100%", maxWidth: 320 }}>
            {scanPhase === "position" && (
              <button
                onClick={() => setScanPhase("countdown")}
                className="k-press"
                style={{
                  width: "100%",
                  padding: "16px 0",
                  borderRadius: "var(--k-r-pill)",
                  border: "none",
                  background: "var(--k-maroon)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Capture My Look
              </button>
            )}
            {scanPhase === "done" && (
              <button
                onClick={() => goToScreen("TRY_ON")}
                className="k-press"
                style={{
                  width: "100%",
                  padding: "16px 0",
                  borderRadius: "var(--k-r-pill)",
                  border: "none",
                  background: "var(--k-maroon)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Continue to Try-On
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: TRY-ON
  // =========================================================================
  if (currentScreen === "TRY_ON") {
    return (
      <div style={{ position: "relative", width: "100%", flex: 1, overflow: "hidden" }}>
        {/* Full-screen try-on result */}
        <GradientBox
          grad={selectedSaree?.grad || GRADIENT_PRESETS[0]}
          style={{ position: "absolute", inset: 0, borderRadius: 0 }}
        >
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.35)" }}>
            <div style={{ width: 60, height: 80, borderRadius: 6, background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)", margin: "0 auto 16px" }} />
            <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 4px", fontFamily: "Montserrat, sans-serif" }}>Your Try-On Look</p>
            <p style={{ fontSize: 13, margin: 0 }}>{selectedSaree?.name} · {drapeStyle} Style</p>
          </div>
        </GradientBox>

        {/* Top: back + timer */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
          <button
            onClick={() => goToScreen("PRODUCT")}
            className="k-press"
            style={{ background: "rgba(255,255,255,.85)", border: "none", borderRadius: "var(--k-r-pill)", padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--k-text)", boxShadow: "var(--k-shadow)" }}
          >
            ← Back
          </button>
          <div className="k-timer" style={{ background: tryOnTimer <= 30 ? "var(--k-red)" : "var(--k-card)", color: tryOnTimer <= 30 ? "#fff" : "var(--k-text)" }}>
            {formatTime(tryOnTimer)}
          </div>
        </div>

        {/* Left panel: Style / Accessories tabs */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 60,
            bottom: 80,
            width: 80,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            padding: "8px 6px",
            gap: 6,
          }}
        >
          {/* Tab pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
            <button
              onClick={() => setTryOnTab("STYLE")}
              className="k-press"
              style={{
                padding: "6px 4px",
                borderRadius: "var(--k-r-pill)",
                border: "none",
                background: tryOnTab === "STYLE" ? "var(--k-maroon)" : "rgba(255,255,255,.85)",
                color: tryOnTab === "STYLE" ? "#fff" : "var(--k-text)",
                fontSize: 9,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Style
            </button>
            <button
              onClick={() => setTryOnTab("ACCESSORIES")}
              className="k-press"
              style={{
                padding: "6px 4px",
                borderRadius: "var(--k-r-pill)",
                border: "none",
                background: tryOnTab === "ACCESSORIES" ? "var(--k-maroon)" : "rgba(255,255,255,.85)",
                color: tryOnTab === "ACCESSORIES" ? "#fff" : "var(--k-text)",
                fontSize: 9,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Acc.
            </button>
          </div>

          {/* Scrollable list */}
          <div className="k-no-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {tryOnTab === "STYLE" &&
              DRAPING_STYLES.map((style) => (
                <div
                  key={style}
                  className="k-press"
                  onClick={() => setDrapeStyle(style)}
                  style={{
                    cursor: "pointer",
                    textAlign: "center",
                    opacity: drapeStyle === style ? 1 : 0.7,
                  }}
                >
                  <GradientBox
                    grad={GRADIENT_PRESETS[DRAPING_STYLES.indexOf(style) % GRADIENT_PRESETS.length]}
                    style={{ width: 60, height: 60, borderRadius: "var(--k-r-sm)", margin: "0 auto", border: drapeStyle === style ? "2px solid var(--k-maroon)" : "2px solid transparent" }}
                  />
                  <p style={{ fontSize: 8, fontWeight: 600, color: "#fff", marginTop: 3, textShadow: "0 1px 4px rgba(0,0,0,.5)" }}>
                    {style.split(" ")[0]}
                  </p>
                </div>
              ))}
            {tryOnTab === "ACCESSORIES" &&
              ACCESSORIES.map((acc) => (
                <div
                  key={acc}
                  className="k-press"
                  onClick={() =>
                    setActiveAccessories((prev) =>
                      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
                    )
                  }
                  style={{
                    cursor: "pointer",
                    textAlign: "center",
                    opacity: activeAccessories.includes(acc) ? 1 : 0.6,
                  }}
                >
                  <GradientBox
                    grad={GRADIENT_PRESETS[(ACCESSORIES.indexOf(acc) + 2) % GRADIENT_PRESETS.length]}
                    style={{ width: 60, height: 60, borderRadius: "var(--k-r-sm)", margin: "0 auto", border: activeAccessories.includes(acc) ? "2px solid var(--k-gold)" : "2px solid transparent" }}
                  />
                  <p style={{ fontSize: 8, fontWeight: 600, color: "#fff", marginTop: 3, textShadow: "0 1px 4px rgba(0,0,0,.5)" }}>
                    {acc}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Right panel: floating info card */}
        <div
          className="k-slideIn"
          style={{
            position: "absolute",
            right: 8,
            top: 60,
            width: 170,
            zIndex: 10,
            background: "rgba(255,255,255,.92)",
            borderRadius: "var(--k-r)",
            padding: 12,
            boxShadow: "var(--k-shadow-md)",
            backdropFilter: "blur(8px)",
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--k-text)", margin: "0 0 2px" }}>
            {selectedSaree?.name || "Saree"}
          </h4>
          <p style={{ fontSize: 15, fontWeight: 800, color: "var(--k-maroon)", margin: "0 0 6px" }}>
            {fmt(selectedSaree?.price || 0)}
          </p>
          <p style={{ fontSize: 10, color: "var(--k-text-mid)", lineHeight: 1.4, margin: "0 0 8px" }}>
            {selectedSaree?.fabric} · {drapeStyle}
          </p>

          {/* Similar mini-cards */}
          <div className="k-no-scroll" style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 8 }}>
            {displaySarees.slice(0, 3).map((s) => (
              <div
                key={s._id}
                className="k-press"
                onClick={() => {
                  setSelectedSareeId(s._id);
                  setSelectedColor(0);
                }}
                style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", flexShrink: 0, cursor: "pointer" }}
              >
                <GradientBox grad={s.grad || GRADIENT_PRESETS[0]} style={{ width: 40, height: 40, borderRadius: 6 }} />
              </div>
            ))}
          </div>

          {/* Color swatches */}
          {selectedSaree?.colors && selectedSaree.colors.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {selectedSaree.colors.slice(0, 4).map((c, i) => (
                <div key={i} className={`k-swatch ${selectedColor === i ? "active" : ""}`} onClick={() => setSelectedColor(i)} style={{ width: 16, height: 16, backgroundColor: c }} />
              ))}
            </div>
          )}

          {/* Small icon buttons */}
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => goToScreen("HOME")} className="k-press" style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "1px solid var(--k-border)", background: "var(--k-card)", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "var(--k-text-muted)", fontFamily: "Roboto, sans-serif" }}>HOME</button>
            <button onClick={() => goToScreen("WARDROBE")} className="k-press" style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: "var(--k-maroon)", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#fff", fontFamily: "Roboto, sans-serif" }}>SAVE</button>
          </div>
        </div>

        {/* Bottom: action buttons */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "12px 18px", display: "flex", gap: 10 }}>
          <div
            className="k-action-btn k-press"
            onClick={handleAddToWardrobe}
            style={{ flex: 1 }}
          >
            <span>Add to Wardrobe</span>
            <div className="k-action-arrow">
              <span style={{ color: "#fff", fontSize: 14 }}>→</span>
            </div>
          </div>
          <div
            className="k-action-btn k-press"
            onClick={() => goToScreen("WARDROBE")}
            style={{ flex: 1 }}
          >
            <span>Go to Wardrobe</span>
            <div className="k-action-arrow">
              <span style={{ color: "#fff", fontSize: 14 }}>→</span>
            </div>
          </div>
        </div>

        {/* End session modal */}
        {showEndSessionModal && (
          <div className="k-overlay k-fadeIn">
            <div className="k-modal k-scaleIn">
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--k-text)", margin: "0 0 8px" }}>
                End Session?
              </h3>
              <p style={{ fontSize: 14, color: "var(--k-text-mid)", margin: "0 0 20px" }}>
                Your try-on time is almost up. Would you like to extend or save your look?
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    setTryOnTimer((t) => t + 30);
                    setShowEndSessionModal(false);
                  }}
                  className="k-press"
                  style={{ flex: 1, padding: "14px 0", borderRadius: "var(--k-r)", border: "1.5px solid var(--k-border)", background: "var(--k-card)", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--k-text)" }}
                >
                  +30 Seconds
                </button>
                <button
                  onClick={() => {
                    handleAddToWardrobe();
                    setShowEndSessionModal(false);
                    goToScreen("WARDROBE");
                  }}
                  className="k-press"
                  style={{ flex: 1, padding: "14px 0", borderRadius: "var(--k-r)", border: "none", background: "var(--k-maroon)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Save & Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN: WARDROBE
  // =========================================================================
  if (currentScreen === "WARDROBE") {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)" }}>
        <TopBar onLogout={() => goToScreen("FEEDBACK")} />

        {/* Header pill */}
        <div style={{ padding: "12px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => goToScreen("HOME")} className="k-press" style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--k-text)" }}>←</button>
          <div style={{ background: "var(--k-card)", border: "1px solid var(--k-border)", borderRadius: "var(--k-r-pill)", padding: "8px 24px", fontSize: 14, fontWeight: 700, color: "var(--k-text)", boxShadow: "var(--k-shadow)", fontFamily: "Montserrat, sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>
            My Wardrobe
          </div>
          <div style={{ width: 30 }} />
        </div>

        {/* Three-column layout */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "12px 8px", gap: 8 }}>
          {/* Left: saved sarees */}
          <div className="k-no-scroll" style={{ width: "28%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {wardrobeItems.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 8px", color: "var(--k-text-muted)", fontSize: 13 }}>
                <p>No sarees yet.</p>
                <button onClick={() => goToScreen("HOME")} style={{ marginTop: 8, color: "var(--k-maroon)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Browse Sarees</button>
              </div>
            )}
            {wardrobeItems.map((item, idx) => (
              <div key={idx} className="k-shelf-item">
                <GradientBox grad={item.grad} style={{ width: "100%", height: 80, borderRadius: "var(--k-r-sm)", marginBottom: 6 }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--k-text)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--k-maroon)", margin: "0 0 6px" }}>{fmt(item.price)}</p>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => {
                      setSelectedSareeId(item.sareeId);
                      setDrapeStyle(item.drapeStyle);
                      setActiveAccessories(item.accessories);
                      setNeckline(item.neckline);
                      setScanPhase("position");
                      setScanCountdown(3);
                      goToScreen("BODY_SCAN");
                    }}
                    className="k-press"
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "none", background: "var(--k-maroon)", color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                  >
                    Try-On
                  </button>
                  <button
                    onClick={() => setWardrobeItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="k-press"
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid var(--k-border)", background: "var(--k-card)", color: "var(--k-text-muted)", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Center: model view */}
          <div style={{ flex: 1 }}>
            <GradientBox
              grad={["#1A1A1A", "#333333"]}
              style={{ width: "100%", height: "100%", borderRadius: "var(--k-r)" }}
            >
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
                <svg viewBox="0 0 60 120" width="50" height="100" style={{ display: "block", margin: "0 auto 10px", opacity: 0.4 }}>
                  <ellipse cx="30" cy="18" rx="11" ry="14" fill="currentColor"/>
                  <rect x="18" y="30" width="24" height="40" rx="6" fill="currentColor"/>
                  <rect x="10" y="33" width="8" height="30" rx="4" fill="currentColor"/>
                  <rect x="42" y="33" width="8" height="30" rx="4" fill="currentColor"/>
                  <rect x="19" y="70" width="9" height="35" rx="4.5" fill="currentColor"/>
                  <rect x="32" y="70" width="9" height="35" rx="4.5" fill="currentColor"/>
                </svg>
                <p style={{ fontSize: 13, fontFamily: "Roboto, sans-serif", fontWeight: 500, margin: 0 }}>Your Look</p>
              </div>
            </GradientBox>
          </div>

          {/* Right: accessories */}
          <div className="k-no-scroll" style={{ width: "22%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {ACCESSORIES.map((acc) => (
              <div key={acc} className="k-shelf-item">
                <GradientBox grad={GRADIENT_PRESETS[(ACCESSORIES.indexOf(acc) + 2) % GRADIENT_PRESETS.length]} style={{ width: "100%", height: 60, borderRadius: "var(--k-r-sm)", marginBottom: 4 }} />
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--k-text)", margin: "0 0 4px" }}>{acc}</p>
                <button
                  onClick={() =>
                    setActiveAccessories((prev) =>
                      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
                    )
                  }
                  className="k-press"
                  style={{
                    width: "100%",
                    padding: "5px 0",
                    borderRadius: 6,
                    border: "none",
                    background: activeAccessories.includes(acc) ? "var(--k-gold)" : "var(--k-maroon)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {activeAccessories.includes(acc) ? "Remove" : "Try-On"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Complete The Look section */}
        <div style={{ borderTop: "1px solid var(--k-border-l)", background: "var(--k-card)", padding: "10px 18px 0" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--k-text)", margin: "0 0 8px" }}>Complete The Look</p>
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--k-border-l)", marginBottom: 10 }}>
            {(["Blouse", "Jewelry", "Saree"] as const).map((tab) => (
              <div
                key={tab}
                className={`k-look-tab ${wardrobeLookTab === tab ? "active" : ""}`}
                onClick={() => setWardrobeLookTab(tab)}
              >
                <span>{tab}</span>
              </div>
            ))}
          </div>

          {/* Tab content: horizontal scroll of options */}
          <div className="k-no-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
            {wardrobeLookTab === "Blouse" &&
              NECKLINES.slice(0, 3).map((nl) => (
                <div key={nl} className="k-shelf-item" style={{ minWidth: 100, flexShrink: 0 }}>
                  <GradientBox grad={GRADIENT_PRESETS[NECKLINES.indexOf(nl) % GRADIENT_PRESETS.length]} style={{ width: "100%", height: 60, borderRadius: "var(--k-r-sm)", marginBottom: 4 }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--k-text)", margin: "0 0 4px" }}>{nl}</p>
                  <button
                    onClick={() => setNeckline(nl)}
                    className="k-press"
                    style={{ width: "100%", padding: "5px 0", borderRadius: 6, border: "none", background: neckline === nl ? "var(--k-maroon)" : "var(--k-border)", color: neckline === nl ? "#fff" : "var(--k-text)", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                  >
                    Try-On
                  </button>
                </div>
              ))}
            {wardrobeLookTab === "Jewelry" &&
              ACCESSORIES.slice(0, 3).map((acc) => (
                <div key={acc} className="k-shelf-item" style={{ minWidth: 100, flexShrink: 0 }}>
                  <GradientBox grad={GRADIENT_PRESETS[(ACCESSORIES.indexOf(acc) + 1) % GRADIENT_PRESETS.length]} style={{ width: "100%", height: 60, borderRadius: "var(--k-r-sm)", marginBottom: 4 }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--k-text)", margin: "0 0 4px" }}>{acc}</p>
                  <button
                    onClick={() =>
                      setActiveAccessories((prev) =>
                        prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
                      )
                    }
                    className="k-press"
                    style={{ width: "100%", padding: "5px 0", borderRadius: 6, border: "none", background: activeAccessories.includes(acc) ? "var(--k-gold)" : "var(--k-border)", color: activeAccessories.includes(acc) ? "#fff" : "var(--k-text)", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                  >
                    Try-On
                  </button>
                </div>
              ))}
            {wardrobeLookTab === "Saree" &&
              displaySarees.slice(0, 4).map((s) => (
                <div key={s._id} className="k-shelf-item" style={{ minWidth: 100, flexShrink: 0 }}>
                  <GradientBox grad={s.grad || GRADIENT_PRESETS[0]} style={{ width: "100%", height: 60, borderRadius: "var(--k-r-sm)", marginBottom: 4 }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--k-text)", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</p>
                  <button
                    onClick={() => {
                      setSelectedSareeId(s._id);
                      setSelectedColor(0);
                      goToScreen("PRODUCT");
                    }}
                    className="k-press"
                    style={{ width: "100%", padding: "5px 0", borderRadius: 6, border: "none", background: "var(--k-maroon)", color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                  >
                    Try-On
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Move to Cart button */}
        <div style={{ padding: "8px 18px 12px" }}>
          <button
            onClick={handleCreateOrder}
            disabled={wardrobeItems.length === 0}
            className="k-press"
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: "var(--k-r-pill)",
              border: "none",
              background: wardrobeItems.length > 0 ? "var(--k-maroon)" : "var(--k-border)",
              color: wardrobeItems.length > 0 ? "#fff" : "var(--k-text-muted)",
              fontSize: 16,
              fontWeight: 700,
              cursor: wardrobeItems.length > 0 ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Move to Cart
          </button>
        </div>

        {/* WhatsApp consent overlay */}
        {showWhatsappConsent && (
          <div className="k-overlay k-fadeIn">
            <div className="k-modal k-scaleIn">
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--k-text)", margin: "0 0 8px" }}>Share via WhatsApp</h3>
              <p style={{ fontSize: 14, color: "var(--k-text-mid)", margin: "0 0 20px" }}>
                By sharing, you consent to sending selected look details to your WhatsApp number.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowWhatsappConsent(false)} className="k-press" style={{ flex: 1, padding: "14px 0", borderRadius: "var(--k-r)", border: "1.5px solid var(--k-border)", background: "var(--k-card)", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--k-text)" }}>Cancel</button>
                <button
                  onClick={() => {
                    setWhatsappShareCount((c) => c + 1);
                    setShowWhatsappConsent(false);
                    const selected = wardrobeItems.filter((w) => w.selected);
                    const text = encodeURIComponent(
                      `Check out my Wearify looks from ${config.storeName}! ${selected.map((s) => s.name).join(", ")}`
                    );
                    const phone = customerPhone.replace("+", "");
                    window.open(`https://wa.me/${phone || "91"}?text=${text}`, "_blank");
                  }}
                  className="k-press"
                  style={{ flex: 1, padding: "14px 0", borderRadius: "var(--k-r)", border: "none", background: "var(--k-green)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
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
  // SCREEN: ORDER / CHECKOUT
  // =========================================================================
  if (currentScreen === "ORDER") {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)" }}>
        <TopBar onLogout={() => goToScreen("FEEDBACK")} />
        <SubHeader onBack={() => goToScreen("WARDROBE")} onHome={() => goToScreen("HOME")} />

        <div style={{ flex: 1, overflowY: "auto", padding: "0 18px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--k-text)", margin: "16px 0 4px", fontFamily: "Montserrat, sans-serif" }}>Checkout</h2>
          <p style={{ fontSize: 13, color: "var(--k-text-muted)", margin: "0 0 16px" }}>{wardrobeItems.length} Items In Your Checklist</p>

          {/* Item list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            {wardrobeItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 12,
                  background: "var(--k-card)",
                  borderRadius: "var(--k-r)",
                  padding: 12,
                  border: "1px solid var(--k-border-l)",
                  alignItems: "center",
                }}
              >
                <GradientBox grad={item.grad} style={{ width: 70, height: 80, borderRadius: "var(--k-r-sm)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--k-text)", margin: "0 0 2px" }}>{item.name}</p>
                  <p style={{ fontSize: 11, color: "var(--k-text-muted)", margin: "0 0 4px" }}>
                    {item.drapeStyle} · {item.neckline}
                  </p>
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {item.grad.map((c, i) => (
                      <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: c }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--k-maroon)", margin: 0 }}>{fmt(item.price)}</p>
                </div>

                {/* Quantity */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => setOrderQuantities((prev) => ({ ...prev, [idx]: Math.max(1, (prev[idx] || 1) - 1) }))}
                    className="k-press"
                    style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--k-text)", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--k-text)", minWidth: 20, textAlign: "center" }}>{orderQuantities[idx] || 1}</span>
                  <button
                    onClick={() => setOrderQuantities((prev) => ({ ...prev, [idx]: (prev[idx] || 1) + 1 }))}
                    className="k-press"
                    style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--k-text)", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    +
                  </button>
                </div>

                {/* Delete */}
                <button
                  onClick={() => {
                    setWardrobeItems((prev) => prev.filter((_, i) => i !== idx));
                    setOrderQuantities((prev) => {
                      const next = { ...prev };
                      delete next[idx];
                      return next;
                    });
                  }}
                  className="k-press"
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--k-text-muted)", padding: 4 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary card */}
          <div style={{ background: "var(--k-card)", borderRadius: "var(--k-r)", padding: 16, border: "1px solid var(--k-border-l)", marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--k-text)", margin: "0 0 12px" }}>Order Summary</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--k-text-mid)" }}>Subtotal</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--k-text)" }}>{fmt(orderSubtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--k-text-mid)" }}>GST (18%)</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--k-text)" }}>{fmt(Math.round(orderGST * 100) / 100)}</span>
            </div>
            <div className="k-receipt-divider" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--k-text)" }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "var(--k-maroon)" }}>{fmt(orderTotal)}</span>
            </div>
          </div>

          {/* Find Tailor button */}
          <button
            onClick={() => goToScreen("TAILORS")}
            className="k-press"
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: "var(--k-r-pill)",
              border: "1.5px solid var(--k-border)",
              background: "var(--k-card)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              color: "var(--k-text)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Find a Tailor
          </button>

          {/* Proceed to Checkout button */}
          <button
            onClick={() => goToScreen("FEEDBACK")}
            className="k-press"
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: "var(--k-r-pill)",
              border: "none",
              background: "var(--k-maroon)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 20,
            }}
          >
            Proceed To Checkout
          </button>

          {/* Designer Blouse carousel */}
          <HScrollSection title="Designer Blouse">
            {NECKLINES.map((nl) => (
              <div key={nl} style={{ minWidth: 120, textAlign: "center", flexShrink: 0 }}>
                <GradientBox grad={GRADIENT_PRESETS[NECKLINES.indexOf(nl) % GRADIENT_PRESETS.length]} style={{ width: 120, height: 90, borderRadius: "var(--k-r-sm)" }} />
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--k-text)", marginTop: 6 }}>{nl}</p>
              </div>
            ))}
          </HScrollSection>

          {/* Recently Viewed */}
          <HScrollSection title="Recently Viewed Products">
            {displaySarees.slice(0, 6).map((saree) => (
              <ProductCard
                key={saree._id}
                saree={saree}
                onClick={() => {
                  setSelectedSareeId(saree._id);
                  setSelectedColor(0);
                  goToScreen("PRODUCT");
                }}
              />
            ))}
          </HScrollSection>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: BILL GENERATED
  // (Triggered after order -- currently navigated to via FEEDBACK -> DATA_SAVE flow)
  // =========================================================================

  // =========================================================================
  // SCREEN: TAILORS
  // =========================================================================
  if (currentScreen === "TAILORS" && !selectedTailorId) {
    const sortedTailors = [...(tailors || [])].sort((a, b) => {
      if (tailorSort === "Top Rated") return b.rating - a.rating;
      if (tailorSort === "Nearby") return 0;
      return b.rating - a.rating;
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)" }}>
        <TopBar onLogout={() => goToScreen("FEEDBACK")} />
        <SubHeader onBack={() => goToScreen("HOME")} onHome={() => goToScreen("HOME")} />

        <div style={{ padding: "16px 18px 0" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--k-text)", margin: "0 0 4px" }}>Choose From Our Recommended Expert Tailors</h2>
          <p style={{ fontSize: 13, color: "var(--k-text-muted)", margin: "0 0 14px" }}>Verified & Trusted Professionals</p>

          {/* Sort dropdown */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 14 }}>
            <button
              onClick={() => setShowTailorSortDropdown((v) => !v)}
              className="k-press"
              style={{
                padding: "8px 16px",
                borderRadius: "var(--k-r-pill)",
                border: "1px solid var(--k-border)",
                background: "var(--k-card)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--k-text)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Sort By: {tailorSort} <span style={{ fontSize: 10 }}>⌄</span>
            </button>
            {showTailorSortDropdown && (
              <div
                className="k-scaleIn"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: 4,
                  background: "var(--k-card)",
                  border: "1px solid var(--k-border)",
                  borderRadius: "var(--k-r)",
                  boxShadow: "var(--k-shadow-md)",
                  padding: 6,
                  zIndex: 50,
                  width: 180,
                }}
              >
                {["Recommended", "Nearby", "Top Rated"].map((sort) => (
                  <button
                    key={sort}
                    onClick={() => {
                      setTailorSort(sort);
                      setShowTailorSortDropdown(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      border: "none",
                      background: tailorSort === sort ? "var(--k-maroon)" : "transparent",
                      color: tailorSort === sort ? "#fff" : "var(--k-text)",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {sort}
                  </button>
                ))}
                <div style={{ display: "flex", gap: 6, padding: "6px 4px 2px" }}>
                  <button
                    onClick={() => { setTailorSort("Recommended"); setShowTailorSortDropdown(false); }}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid var(--k-border)", background: "var(--k-card)", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "var(--k-text-muted)" }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowTailorSortDropdown(false)}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "none", background: "var(--k-maroon)", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "#fff" }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 18px" }}>
          {sortedTailors.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--k-text-muted)", fontSize: 15 }}>
              No tailors found in {store?.city || "your area"}
            </div>
          )}
          {sortedTailors.map((tailor) => (
            <div key={tailor._id} className="k-tailor-card k-slideUp">
              <div style={{ display: "flex", gap: 12 }}>
                {/* Photo placeholder */}
                <GradientBox
                  grad={GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)]}
                  style={{ width: 60, height: 60, borderRadius: "50%", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--k-text)", margin: "0 0 2px" }}>{tailor.name}</h3>
                  <p style={{ fontSize: 12, color: "var(--k-text-muted)", margin: "0 0 6px" }}>
                    {tailor.specialties?.join(", ") || "General tailoring"}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {/* Avatar group */}
                    <div style={{ display: "flex" }}>
                      {[0, 1, 2].map((i) => (
                        <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: GRADIENT_PRESETS[i][0], border: "1.5px solid var(--k-card)", marginLeft: i > 0 ? -6 : 0 }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--k-text-muted)" }}>×84 Happy Clients</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--k-text-muted)" }}>{tailor.area || tailor.city}</span>
                    <span style={{ fontSize: 11, color: "var(--k-text-light)" }}>· 2.5 km</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => {
                    setSelectedTailorId(tailor.tailorId);
                    goToScreen("TAILOR_DETAIL");
                  }}
                  className="k-press"
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "var(--k-r-pill)",
                    border: "none",
                    background: "var(--k-maroon)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  View Portfolio →
                </button>
                <button
                  onClick={() => {
                    setSelectedTailorId(tailor.tailorId);
                    setShowTailorConsent(true);
                  }}
                  className="k-press"
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "var(--k-r-pill)",
                    border: "1.5px solid var(--k-border)",
                    background: "var(--k-card)",
                    color: "var(--k-text)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Connect With {tailor.name.split(" ")[0]}
                </button>
              </div>
            </div>
          ))}

          {/* Why Choose Our Tailors */}
          <div style={{ marginTop: 20, padding: "16px 0" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--k-text)", margin: "0 0 12px", textAlign: "center" }}>Why Choose Our Tailors?</h3>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {[
                { icon: "✓", label: "Verified Professionals" },
                { icon: "→", label: "2-3 Day Delivery" },
                { icon: "★", label: "Quality Guaranteed" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    background: "var(--k-card)",
                    borderRadius: "var(--k-r)",
                    padding: "14px 8px",
                    border: "1px solid var(--k-border-l)",
                    boxShadow: "var(--k-shadow)",
                  }}
                >
                  <span style={{ fontSize: 20, fontWeight: 700, display: "block", marginBottom: 6, color: "var(--k-maroon)" }}>{badge.icon}</span>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--k-text)", margin: 0, fontFamily: "Roboto, sans-serif" }}>{badge.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tailor consent overlay (shared) */}
        {showTailorConsent && selectedTailorId && (
          <div className="k-overlay k-fadeIn">
            <div className="k-modal k-scaleIn">
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--k-text)", margin: "0 0 8px" }}>
                Connect with Tailor
              </h3>
              <p style={{ fontSize: 14, color: "var(--k-text-mid)", margin: "0 0 20px" }}>
                You will be redirected to WhatsApp with a reference code. Your phone number may be shared with the tailor for follow-up.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setShowTailorConsent(false); setSelectedTailorId(null); }}
                  className="k-press"
                  style={{ flex: 1, padding: "14px 0", borderRadius: "var(--k-r)", border: "1.5px solid var(--k-border)", background: "var(--k-card)", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--k-text)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowTailorConsent(false);
                    const refCode = `WF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
                    const tailorData = tailors?.find((t) => t.tailorId === selectedTailorId);
                    if (tailorData) {
                      const text = encodeURIComponent(
                        `Hi ${tailorData.name}, I found you on Wearify at ${config.storeName}. Reference: ${refCode}`
                      );
                      const phone = tailorData.phone.replace("+", "");
                      window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
                    }
                    setSelectedTailorId(null);
                  }}
                  className="k-press"
                  style={{ flex: 1, padding: "14px 0", borderRadius: "var(--k-r)", border: "none", background: "var(--k-green)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
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
  // SCREEN: TAILOR DETAIL
  // =========================================================================
  if (currentScreen === "TAILOR_DETAIL" && selectedTailorId && !selectedTailor) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--k-border)", borderTopColor: "var(--k-maroon)", animation: "k-spin 0.8s linear infinite", marginBottom: 16 }} />
        <p style={{ fontSize: 15, color: "var(--k-text-muted)", fontFamily: "Roboto, sans-serif" }}>Loading...</p>
      </div>
    );
  }

  if (currentScreen === "TAILOR_DETAIL" && selectedTailor) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)" }}>
        {/* Sub-header only: back + home */}
        <div className="k-subheader" style={{ gap: 12 }}>
          <button
            onClick={() => { setSelectedTailorId(null); goToScreen("TAILORS"); }}
            className="k-press"
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--k-text)", padding: "4px 8px" }}
          >
            ←
          </button>
          <button
            onClick={() => goToScreen("HOME")}
            className="k-press"
            style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--k-text-muted)", padding: "4px 8px" }}
          >
            ⌂
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 18px" }}>
          {/* Tailor photo + info card */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, marginTop: 16 }}>
            <GradientBox
              grad={GRADIENT_PRESETS[2]}
              style={{ width: 80, height: 80, borderRadius: "50%", flexShrink: 0 }}
            />
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--k-text)", margin: "0 0 2px" }}>{selectedTailor.name}</h2>
              <p style={{ fontSize: 13, color: "var(--k-text-muted)", margin: "0 0 4px" }}>
                {selectedTailor.specialties?.join(", ") || "General tailoring"}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "var(--k-gold)", fontWeight: 600 }}>
                  {"\u2605".repeat(Math.round(selectedTailor.rating))} {selectedTailor.rating.toFixed(1)}
                </span>
                <span style={{ fontSize: 12, color: "var(--k-text-muted)" }}>{selectedTailor.area || selectedTailor.city}</span>
              </div>
              {selectedTailor.experience && (
                <p style={{ fontSize: 12, color: "var(--k-text-mid)", marginTop: 4 }}>{selectedTailor.experience} years experience</p>
              )}
            </div>
          </div>

          {selectedTailor.bio && (
            <p style={{ fontSize: 13, color: "var(--k-text-mid)", lineHeight: 1.6, margin: "0 0 18px" }}>
              {selectedTailor.bio}
            </p>
          )}

          {/* Connect button */}
          <button
            onClick={() => setShowTailorConsent(true)}
            className="k-press"
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: "var(--k-r-pill)",
              border: "none",
              background: "var(--k-maroon)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 24,
            }}
          >
            Connect With {selectedTailor.name.split(" ")[0]}
          </button>

          {/* Portfolio */}
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--k-text)", margin: "0 0 12px" }}>Portfolio</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
            {(tailorPortfolio || []).map((item) => (
              <GradientBox
                key={item._id}
                grad={item.grad || GRADIENT_PRESETS[Math.floor(Math.random() * GRADIENT_PRESETS.length)]}
                style={{ width: "100%", height: 120, borderRadius: "var(--k-r-sm)" }}
              >
                {item.tag && (
                  <span style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,.4)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 100 }}>
                    {item.tag}
                  </span>
                )}
              </GradientBox>
            ))}
            {(!tailorPortfolio || tailorPortfolio.length === 0) && (
              <div style={{ gridColumn: "span 3", textAlign: "center", padding: "30px 0", color: "var(--k-text-muted)", fontSize: 14 }}>
                No portfolio items yet
              </div>
            )}
          </div>
        </div>

        {/* Tailor WhatsApp consent */}
        {showTailorConsent && (
          <div className="k-overlay k-fadeIn">
            <div className="k-modal k-scaleIn">
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--k-text)", margin: "0 0 8px" }}>
                Connect with {selectedTailor.name}
              </h3>
              <p style={{ fontSize: 14, color: "var(--k-text-mid)", margin: "0 0 20px" }}>
                You will be redirected to WhatsApp with a reference code. Your phone number may be shared with the tailor for follow-up.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowTailorConsent(false)}
                  className="k-press"
                  style={{ flex: 1, padding: "14px 0", borderRadius: "var(--k-r)", border: "1.5px solid var(--k-border)", background: "var(--k-card)", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--k-text)" }}
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
                    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
                  }}
                  className="k-press"
                  style={{ flex: 1, padding: "14px 0", borderRadius: "var(--k-r)", border: "none", background: "var(--k-green)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
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
        <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)", alignItems: "center", justifyContent: "center" }}>
          <div className="k-popIn" style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--k-green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ fontSize: 32, color: "#fff", fontWeight: 700 }}>✓</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--k-text)", margin: "0 0 8px", fontFamily: "Montserrat, sans-serif" }}>Thank You!</h2>
            <p style={{ fontSize: 15, color: "var(--k-text-muted)", fontFamily: "Roboto, sans-serif" }}>Your feedback helps us improve</p>
          </div>
        </div>
      );
    }

    return (
      <div className="k-overlay k-fadeIn">
        <div className="k-modal k-scaleIn" style={{ maxWidth: 420 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--k-text)", margin: "0 0 4px", fontFamily: "Montserrat, sans-serif" }}>
            Rate Your Experience
          </h2>
          <p style={{ fontSize: 13, color: "var(--k-text-muted)", margin: "0 0 20px" }}>
            Please rate your experience below
          </p>

          {/* Star rating */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 6 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className="k-star"
                onClick={() => setFeedbackRating(star)}
                style={{
                  color: feedbackRating >= star ? "var(--k-gold)" : "var(--k-border)",
                }}
              >
                {feedbackRating >= star ? "\u2605" : "\u2606"}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--k-text-muted)", textAlign: "center", margin: "0 0 18px" }}>
            {feedbackRating}/5 stars
          </p>

          {/* Additional feedback textarea */}
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--k-text)", marginBottom: 6, textAlign: "left" }}>
            Additional feedback
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us more about your experience..."
            style={{
              width: "100%",
              minHeight: 80,
              padding: "10px 12px",
              borderRadius: "var(--k-r-sm)",
              border: "1px solid var(--k-border)",
              background: "var(--k-bg)",
              fontSize: 13,
              color: "var(--k-text)",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          {/* Submit button */}
          <button
            onClick={handleSubmitFeedback}
            disabled={feedbackRating === 0}
            className="k-press"
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: "var(--k-r-pill)",
              border: "none",
              background: feedbackRating > 0 ? "var(--k-maroon)" : "var(--k-border)",
              color: feedbackRating > 0 ? "#fff" : "var(--k-text-muted)",
              fontSize: 15,
              fontWeight: 700,
              cursor: feedbackRating > 0 ? "pointer" : "default",
              marginBottom: 16,
            }}
          >
            Submit feedback
          </button>

          {/* OR divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "var(--k-border)" }} />
            <span style={{ fontSize: 12, color: "var(--k-text-muted)", fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--k-border)" }} />
          </div>

          {/* Home & Logout buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => goToScreen("HOME")}
              className="k-press"
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: "var(--k-r-pill)",
                border: "1.5px solid var(--k-border)",
                background: "var(--k-card)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--k-text)",
              }}
            >
              Home
            </button>
            <button
              onClick={() => goToScreen("DATA_SAVE")}
              className="k-press"
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: "var(--k-r-pill)",
                border: "1.5px solid var(--k-border)",
                background: "var(--k-card)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--k-text)",
              }}
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN: DATA SAVE
  // =========================================================================
  if (currentScreen === "DATA_SAVE") {
    return (
      <div className="k-overlay k-fadeIn">
        <div className="k-modal k-scaleIn">
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--k-text)", margin: "0 0 20px" }}>
            Do you want to save your data?
          </h2>

          <button
            onClick={() => handleEndSessionClean()}
            className="k-press"
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: "var(--k-r-pill)",
              border: "none",
              background: "var(--k-maroon)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            Save
          </button>

          {/* OR */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: "var(--k-border)" }} />
            <span style={{ fontSize: 12, color: "var(--k-text-muted)", fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--k-border)" }} />
          </div>

          <button
            onClick={() => handleEndSessionClean()}
            className="k-press"
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: "var(--k-r-pill)",
              border: "1.5px solid var(--k-border)",
              background: "var(--k-card)",
              color: "var(--k-text)",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Delete
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
      <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="k-scaleIn" style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--k-green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <span style={{ fontSize: 28, color: "#fff", fontWeight: 700 }}>✓</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--k-text)", margin: "0 0 8px", fontFamily: "Montserrat, sans-serif" }}>
            Session Complete
          </h2>
          <p style={{ fontSize: 14, color: "var(--k-text-mid)", lineHeight: 1.5, margin: "0 0 6px" }}>
            All camera data has been cleared. Your privacy is protected.
          </p>
          <p style={{ fontSize: 14, color: "var(--k-text-muted)", margin: "0 0 24px" }}>
            Returning to home screen in{" "}
            <span style={{ fontWeight: 700, color: "var(--k-text)" }}>{endTimer}s</span>
          </p>
          <button
            onClick={resetSession}
            className="k-press"
            style={{
              padding: "14px 36px",
              borderRadius: "var(--k-r-pill)",
              border: "1.5px solid var(--k-border)",
              background: "var(--k-card)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              color: "var(--k-text)",
              boxShadow: "var(--k-shadow)",
            }}
          >
            Return Now
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Fallback
  // =========================================================================
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--k-bg)", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: 18, color: "var(--k-text)", marginBottom: 12 }}>
        Screen: {currentScreen}
      </p>
      <button
        onClick={() => goToScreen("IDLE")}
        className="k-press"
        style={{
          padding: "12px 28px",
          borderRadius: "var(--k-r-pill)",
          border: "none",
          background: "var(--k-maroon)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Return to Start
      </button>
    </div>
  );
}
