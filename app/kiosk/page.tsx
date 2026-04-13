"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/* ═══ CONFIG ═══ */
const CFG = {
  maxTrial: 5,
  maxWardrobe: 10,
  tryOnSec: 180,
  inactivitySec: 300,
  scanValidMonths: 6,
};

const LANGS = [
  { c: "en", n: "English", v: "English" },
  { c: "hi", n: "Hindi", v: "हिंदी" },
  { c: "mr", n: "Marathi", v: "मराठी" },
  { c: "kn", n: "Kannada", v: "ಕನ್ನಡ" },
  { c: "ta", n: "Tamil", v: "தமிழ்" },
  { c: "te", n: "Telugu", v: "తెలుగు" },
  { c: "bn", n: "Bengali", v: "বাংলা" },
  { c: "gu", n: "Gujarati", v: "ગુજરાતી" },
  { c: "ml", n: "Malayalam", v: "മലയാളം" },
];

type Screen =
  | "idle"
  | "modeSelect"
  | "codeEntry"
  | "phoneAuth"
  | "otp"
  | "lang"
  | "scanChoice"
  | "consent"
  | "bodyScan"
  | "aiProcessing"
  | "trialRoom"
  | "home"
  | "productDetail"
  | "wardrobe"
  | "order"
  | "tailors"
  | "tailorDetail"
  | "feedback"
  | "dataSave"
  | "sessionEnd";

interface SareeItem {
  _id: Id<"sarees">;
  name: string;
  type: string;
  fabric: string;
  price: number;
  mrp?: number;
  colors: string[];
  grad?: string[];
  emoji?: string;
  occasion: string;
  description?: string;
  region?: string;
  tag?: string;
  stock: number;
}

interface TrialRoomData {
  sessionId: string;
  storeId: string;
  customerId?: Id<"customers">;
  customerPhone?: string;
  code: string;
  expiresAt: number;
}

function fmtPrice(n: number) {
  const s = Math.round(n).toString();
  if (s.length <= 3) return s;
  return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + s.slice(-3);
}

/* ═══ MAIN KIOSK PAGE ═══ */
export default function KioskPage() {
  const router = useRouter();

  // Store config
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");

  // Screen routing
  const [screen, setScreen] = useState<Screen>("idle");
  const historyRef = useRef<Screen[]>([]);

  // Session / Trial room
  const [trialData, setTrialData] = useState<TrialRoomData | null>(null);
  const [customerId, setCustomerId] = useState<Id<"customers"> | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [hasBodyScan, setHasBodyScan] = useState(false);

  // Language
  const [lang, setLang] = useState("en");

  // Trial room items (sarees from tablet shortlist)
  const [trialItems, setTrialItems] = useState<SareeItem[]>([]);

  // Wardrobe (saved during kiosk session)
  const [wardrobeItems, setWardrobeItems] = useState<SareeItem[]>([]);

  // Cart (for checkout)
  const [cartItems, setCartItems] = useState<Array<SareeItem & { qty: number }>>([]);

  // Selected product for detail view
  const [selectedProduct, setSelectedProduct] = useState<SareeItem | null>(null);

  // Phone auth (customer login path)
  const [phone, setPhone] = useState("");

  // Ref to track scan choice eligibility synchronously (avoids stale state in navigate callbacks)
  const scanEligibleRef = useRef(false);
  const returningRef = useRef(false);

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"info" | "success" | "error" | "warning">("info");
  const [toastVisible, setToastVisible] = useState(false);

  // Mutations
  const markCodeUsed = useMutation(api.trialRoom.markCodeUsed);
  const createSessionMut = useMutation(api.sessionOps.createSession);
  const verifyOtpMut = useMutation(api.phoneAuth.verifyOtp);
  const addToWardrobeMut = useMutation(api.sessionOps.addToWardrobe);
  const createLook = useMutation(api.sessionOps.createLook);
  const createOrder = useMutation(api.sessionOps.createOrder);
  const endSessionMut = useMutation(api.sessionOps.endSession);
  const updateSessionMut = useMutation(api.sessionOps.updateSession);

  // Load config
  useEffect(() => {
    const stored = localStorage.getItem("wearify_kiosk_store");
    if (stored) {
      try {
        const cfg = JSON.parse(stored);
        setStoreId(cfg.storeId);
        setStoreName(cfg.storeName);
      } catch { /* ignore */ }
    } else {
      router.push("/kiosk/setup");
    }
  }, [router]);

  // 5-minute inactivity auto-logout
  const lastActivity = useRef(Date.now());
  useEffect(() => {
    const handler = () => { lastActivity.current = Date.now(); };
    window.addEventListener("touchstart", handler);
    window.addEventListener("mousedown", handler);
    const interval = setInterval(() => {
      if (screen !== "idle" && screen !== "sessionEnd") {
        if (Date.now() - lastActivity.current > CFG.inactivitySec * 1000) {
          handleWipe();
        }
      }
    }, 10000);
    return () => {
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("mousedown", handler);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Navigation helpers
  const navigate = useCallback((s: Screen, product?: SareeItem) => {
    historyRef.current.push(screen);
    if (product) setSelectedProduct(product);
    setScreen(s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const goBack = useCallback(() => {
    const prev = historyRef.current.pop();
    if (prev) setScreen(prev);
  }, []);

  const goHome = useCallback(() => {
    historyRef.current = [];
    setScreen("home");
  }, []);

  const showToast = useCallback((msg: string, type: "info" | "success" | "error" | "warning" = "info") => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const handleWipe = useCallback(() => {
    setTrialData(null);
    setCustomerId(null);
    setCustomerName("");
    setSessionId("");
    setPhone("");
    setIsReturningCustomer(false);
    setHasBodyScan(false);
    setTrialItems([]);
    setWardrobeItems([]);
    setCartItems([]);
    setSelectedProduct(null);
    historyRef.current = [];
    returningRef.current = false;
    scanEligibleRef.current = false;
    setScreen("sessionEnd");
  }, []);

  const triggerLogout = useCallback(() => {
    navigate("dataSave");
  }, [navigate]);

  // Fetch all sarees for this store
  const allSarees = useQuery(
    api.sarees.listByStore,
    storeId ? { storeId } : "skip"
  );

  // Fetch tailors by city
  const storeData = useQuery(
    api.stores.getByStoreId,
    storeId ? { storeId } : "skip"
  );

  if (!storeId) return null;

  // ═══ RENDER SCREENS ═══

  const renderScreen = () => {
    switch (screen) {
      case "idle":
        return <IdleScreen storeName={storeName} onStart={() => navigate("lang")} />;
      case "lang":
        return (
          <LangScreen
            lang={lang}
            onSelect={(c) => {
              setLang(c);
              navigate("modeSelect");
            }}
            storeName={storeName}
          />
        );
      case "modeSelect":
        return (
          <ModeSelectScreen
            storeName={storeName}
            onStoreCode={() => navigate("codeEntry")}
            onCustomerLogin={() => navigate("phoneAuth")}
            onBack={() => setScreen("idle")}
          />
        );
      case "phoneAuth":
        return (
          <PhoneAuthScreen
            storeName={storeName}
            onSubmitPhone={(ph) => {
              setPhone(ph);
              navigate("otp");
            }}
            onBack={goBack}
          />
        );
      case "otp":
        return (
          <OTPScreen
            phone={phone}
            storeId={storeId}
            storeName={storeName}
            onVerified={async (customer) => {
              if (customer) {
                setCustomerId(customer._id);
                setCustomerName(customer.name);
                setIsReturningCustomer(true);
                const scanAge = customer.lastBodyScan
                  ? (Date.now() - customer.lastBodyScan) / (1000 * 60 * 60 * 24 * 30)
                  : Infinity;
                const hasScan = !!customer.lastBodyScan && scanAge < CFG.scanValidMonths;
                setHasBodyScan(hasScan);
                if (customer.language) setLang(customer.language);
                // Set refs synchronously so lang screen reads correct values
                returningRef.current = true;
                scanEligibleRef.current = hasScan;
              } else {
                returningRef.current = false;
                scanEligibleRef.current = false;
              }
              // Create a session for customer login path
              const newSessionId = await createSessionMut({
                storeId,
                storeName,
                customerId: customer?._id,
                customerPhone: `+91${phone}`,
              });
              setSessionId(newSessionId);
              if (returningRef.current && scanEligibleRef.current) {
                navigate("scanChoice");
              } else {
                navigate("consent");
              }
            }}
            onBack={goBack}
          />
        );
      case "codeEntry":
        return (
          <CodeEntryScreen
            storeId={storeId}
            storeName={storeName}
            onValidCode={(data) => {
              setTrialData(data.trialRoom);
              setSessionId(data.trialRoom.sessionId);
              if (data.customer) {
                setCustomerId(data.customer._id);
                setCustomerName(data.customer.name);
                setIsReturningCustomer(true);
                const scanAge = data.customer.lastBodyScan
                  ? (Date.now() - data.customer.lastBodyScan) / (1000 * 60 * 60 * 24 * 30)
                  : Infinity;
                const hasScan = !!data.customer.lastBodyScan && scanAge < CFG.scanValidMonths;
                setHasBodyScan(hasScan);
                if (data.customer.language) setLang(data.customer.language);
                returningRef.current = true;
                scanEligibleRef.current = hasScan;
              } else {
                setCustomerId(data.trialRoom.customerId ?? null);
                setIsReturningCustomer(false);
                setHasBodyScan(false);
                returningRef.current = false;
                scanEligibleRef.current = false;
              }
              // Resolve shortlist items to full saree data
              if (data.mirrorItems && allSarees) {
                const sareeMap = new Map(allSarees.map((s) => [s._id, s]));
                const resolved = data.mirrorItems
                  .map((item: { sareeId: Id<"sarees"> }) => sareeMap.get(item.sareeId))
                  .filter(Boolean) as SareeItem[];
                setTrialItems(resolved);
              }
              // Mark code as used
              markCodeUsed({ code: data.trialRoom.code, storeId });
              if (returningRef.current && scanEligibleRef.current) {
                navigate("scanChoice");
              } else {
                navigate("consent");
              }
            }}
            onBack={() => setScreen("idle")}
          />
        );
      case "scanChoice":
        return (
          <ScanChoiceScreen
            customerName={customerName}
            onUsePrevious={() => {
              // Skip body scan, go directly to trial room or home
              if (trialItems.length > 0) navigate("trialRoom");
              else navigate("home");
            }}
            onRescan={() => {
              navigate("consent");
            }}
          />
        );
      case "consent":
        return (
          <ConsentScreen
            onAllow={() => navigate("bodyScan")}
            onSkip={() => {
              if (trialItems.length > 0) navigate("trialRoom");
              else navigate("home");
            }}
          />
        );
      case "bodyScan":
        return (
          <BodyScanScreen
            storeName={storeName}
            onCapture={() => navigate("aiProcessing")}
            onBack={goBack}
          />
        );
      case "aiProcessing":
        return (
          <AIProcessingScreen
            onDone={() => {
              if (trialItems.length > 0) setScreen("trialRoom");
              else setScreen("home");
            }}
          />
        );
      case "trialRoom":
        return (
          <TrialRoomScreen
            items={trialItems}
            wardrobeItems={wardrobeItems}
            onRemoveItem={(id) =>
              setTrialItems((prev) => prev.filter((s) => s._id !== id))
            }
            onAddToWardrobe={(items) => {
              if (wardrobeItems.length + items.length > CFG.maxWardrobe) {
                showToast(`Wardrobe limit (${CFG.maxWardrobe})`, "warning");
                return;
              }
              setWardrobeItems((prev) => [...prev, ...items]);
              setTrialItems((prev) =>
                prev.filter((s) => !items.some((i) => i._id === s._id))
              );
              for (const item of items) {
                addToWardrobeMut({
                  sessionId,
                  customerId: customerId ?? undefined,
                  sareeId: item._id,
                  sareeName: item.name,
                  price: item.price,
                });
                createLook({
                  sessionId,
                  storeId,
                  customerId: customerId ?? undefined,
                  sareeId: item._id,
                  sareeName: item.name,
                  fabric: item.fabric,
                  price: item.price,
                  grad: item.grad,
                });
              }
              showToast(`Added ${items.length} to wardrobe`, "success");
            }}
            onGoHome={goHome}
            onLogout={triggerLogout}
            showToast={showToast}
            maxTrial={CFG.maxTrial}
            tryOnSec={CFG.tryOnSec}
          />
        );
      case "home":
        return (
          <HomeScreen
            sarees={allSarees || []}
            trialItems={trialItems}
            wardrobeItems={wardrobeItems}
            onProductTap={(p) => navigate("productDetail", p)}
            onSendToTrial={(items) => {
              setTrialItems((prev) => [...prev, ...items]);
              navigate("aiProcessing");
            }}
            navigate={navigate}
            goHome={goHome}
            triggerLogout={triggerLogout}
            trialCount={trialItems.length}
            wardrobeCount={wardrobeItems.length}
            cartCount={cartItems.length}
            maxTrial={CFG.maxTrial}
            showToast={showToast}
          />
        );
      case "productDetail":
        return selectedProduct ? (
          <ProductDetailScreen
            product={selectedProduct}
            allSarees={allSarees || []}
            isInTrial={trialItems.some((s) => s._id === selectedProduct._id)}
            isInWardrobe={wardrobeItems.some((s) => s._id === selectedProduct._id)}
            onAddToTrial={() => {
              if (trialItems.length >= CFG.maxTrial) {
                showToast(`Max ${CFG.maxTrial} sarees per trial`, "warning");
                return;
              }
              setTrialItems((prev) => [...prev, selectedProduct]);
              showToast("Added to Trial Room", "success");
            }}
            onBack={goBack}
            onProductTap={(p) => navigate("productDetail", p)}
            navigate={navigate}
            goHome={goHome}
            triggerLogout={triggerLogout}
            trialCount={trialItems.length}
            wardrobeCount={wardrobeItems.length}
            cartCount={cartItems.length}
          />
        ) : null;
      case "wardrobe":
        return (
          <WardrobeScreen
            items={wardrobeItems}
            onMoveToCart={(items) => {
              setCartItems((prev) => [...prev, ...items.map((i) => ({ ...i, qty: 1 }))]);
              navigate("order");
            }}
            navigate={navigate}
            goHome={goHome}
            triggerLogout={triggerLogout}
            trialCount={trialItems.length}
            wardrobeCount={wardrobeItems.length}
            cartCount={cartItems.length}
            maxWardrobe={CFG.maxWardrobe}
            showToast={showToast}
          />
        );
      case "order":
        return (
          <OrderScreen
            cart={cartItems}
            setCart={setCartItems}
            onCheckout={async () => {
              if (cartItems.length > 0) {
                try {
                  await createOrder({
                    sessionId,
                    storeId,
                    customerId: customerId ?? undefined,
                    items: cartItems.map((c) => ({
                      sareeId: c._id,
                      name: c.name,
                      price: c.price,
                      quantity: c.qty,
                    })),
                  });
                  const cartIds = cartItems.map((c) => c._id);
                  setWardrobeItems((prev) => prev.filter((w) => !cartIds.includes(w._id)));
                } catch { /* ignore */ }
              }
            }}
            onFindTailor={() => navigate("tailors")}
            onBack={goBack}
          />
        );
      case "tailors":
        return (
          <TailorScreen
            storeCity={storeData?.city || ""}
            onBack={goBack}
            showToast={showToast}
          />
        );
      case "feedback":
        return (
          <FeedbackScreen
            onSubmit={async (rating) => {
              if (sessionId) {
                try {
                  await updateSessionMut({
                    sessionId,
                    rating,
                    sareesTriedOn: wardrobeItems.length,
                    sareesBrowsed: trialItems.length + wardrobeItems.length,
                  });
                  await endSessionMut({ sessionId });
                } catch { /* ignore */ }
              }
              handleWipe();
            }}
            onHome={goHome}
            onLogout={handleWipe}
          />
        );
      case "dataSave":
        return (
          <DataSaveScreen
            onSave={() => {
              showToast("Saved to profile", "success");
              navigate("feedback");
            }}
            onDelete={() => {
              setWardrobeItems([]);
              setTrialItems([]);
              setCartItems([]);
              showToast("Data deleted", "info");
              navigate("feedback");
            }}
          />
        );
      case "sessionEnd":
        return <SessionEndScreen onDone={() => setScreen("idle")} />;
      default:
        return <IdleScreen storeName={storeName} onStart={() => navigate("codeEntry")} />;
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative" }}>
      {renderScreen()}
      {toastVisible && (
        <KioskToast msg={toastMsg} type={toastType} onClose={() => setToastVisible(false)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUB-SCREENS
   ═══════════════════════════════════════════════════════════════════════ */

function KioskToast({ msg, type, onClose }: { msg: string; type: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = { info: "var(--k-maroon)", success: "var(--k-green)", error: "var(--k-red)", warning: "var(--k-gold)" }[type] || "var(--k-maroon)";
  return (
    <div className="k-slideDown" style={{
      position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
      background: bg, color: "#fff", padding: "10px 24px", borderRadius: "var(--k-r-pill)",
      fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: "var(--k-shadow-lg)",
    }}>
      {msg}
    </div>
  );
}

/* ── IDLE ── */
function IdleScreen({ storeName, onStart }: { storeName: string; onStart: () => void }) {
  const [slideIdx, setSlideIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);
  const slides = [
    { h: "See Yourself in This Beautiful Saree", s: "Virtual Try-On Experience" },
    { h: "New Bridal Collection", s: "Kanjivaram & Banarasi Silks" },
    { h: "Festival Specials", s: "Exclusive Sarees" },
  ];
  return (
    <div onClick={onStart} className="k-shell" style={{ cursor: "pointer", justifyContent: "flex-end" }}>
      <div className="k-idle-bg" />
      <div style={{ position: "absolute", top: 16, left: 18, zIndex: 10 }}>
        <div className="k-brand" style={{ fontSize: 28 }}>{storeName}</div>
      </div>
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
        <div className="k-scaleIn" style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          background: "rgba(60,50,50,.6)", backdropFilter: "blur(8px)",
          padding: "16px 32px", borderRadius: "var(--k-r)",
        }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>Touch to Start</span>
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px 64px" }}>
        <h1 className="k-brand k-slideUp" style={{ fontSize: 28, textTransform: "uppercase" }}>{slides[slideIdx].h}</h1>
        <p className="k-slideUp k-d2" style={{ fontSize: 14, color: "var(--k-text-mid)", marginTop: 8 }}>{slides[slideIdx].s}</p>
      </div>
    </div>
  );
}

/* ── MODE SELECT ── */
function ModeSelectScreen({ storeName, onStoreCode, onCustomerLogin, onBack }: {
  storeName: string; onStoreCode: () => void; onCustomerLogin: () => void; onBack: () => void;
}) {
  return (
    <div className="k-shell">
      <div className="k-topbar">
        <button onClick={onBack} className="k-press" style={{
          width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--k-border)",
          background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <span style={{ fontSize: 18 }}>&#8249;</span>
        </button>
        <div className="k-brand" style={{ fontSize: 22 }}>{storeName}</div>
        <div style={{ width: 36 }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", gap: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>How would you like to start?</h2>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", marginBottom: 20, textAlign: "center" }}>
          Choose store code if your assistant shared one, or login with your phone number
        </p>

        <button onClick={onStoreCode} className="k-press k-slideUp" style={{
          width: "100%", maxWidth: 320, padding: "20px 24px", borderRadius: "var(--k-r)",
          background: "var(--k-card)", border: "1.5px solid var(--k-border)", boxShadow: "var(--k-shadow)",
          display: "flex", alignItems: "center", gap: 16, cursor: "pointer", textAlign: "left",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--k-r-sm)", background: "var(--k-maroon)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 22, color: "#fff" }}>#</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--k-text)" }}>Store Code</div>
            <div style={{ fontSize: 12, color: "var(--k-text-muted)", marginTop: 2 }}>Enter 6-digit code from your assistant</div>
          </div>
        </button>

        <button onClick={onCustomerLogin} className="k-press k-slideUp k-d2" style={{
          width: "100%", maxWidth: 320, padding: "20px 24px", borderRadius: "var(--k-r)",
          background: "var(--k-card)", border: "1.5px solid var(--k-border)", boxShadow: "var(--k-shadow)",
          display: "flex", alignItems: "center", gap: 16, cursor: "pointer", textAlign: "left",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--k-r-sm)", background: "var(--k-gold)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 22, color: "#fff" }}>📱</span>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--k-text)" }}>Phone Login</div>
            <div style={{ fontSize: 12, color: "var(--k-text-muted)", marginTop: 2 }}>Login with your mobile number</div>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ── PHONE AUTH ── */
function PhoneAuthScreen({ storeName, onSubmitPhone, onBack }: {
  storeName: string; onSubmitPhone: (phone: string) => void; onBack: () => void;
}) {
  const [inp, setInp] = useState("");
  const [error, setError] = useState("");

  const handleKey = (k: string) => { setError(""); if (inp.length < 10) setInp((v) => v + k); };
  const handleDel = () => { setError(""); setInp((v) => v.slice(0, -1)); };
  const handleSubmit = () => {
    if (inp.length !== 10) { setError("Valid 10-digit number required"); return; }
    if (!["6","7","8","9"].includes(inp[0])) { setError("Valid 10-digit number required"); return; }
    onSubmitPhone(inp);
  };

  return (
    <div className="k-shell">
      <div className="k-topbar">
        <button onClick={onBack} className="k-press" style={{
          width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--k-border)",
          background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <span style={{ fontSize: 18 }}>&#8249;</span>
        </button>
        <div className="k-brand" style={{ fontSize: 22 }}>{storeName}</div>
        <div style={{ width: 36 }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Enter Mobile Number</h2>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", marginBottom: 20 }}>OTP will be sent to verify</p>

        {/* Phone display */}
        <div style={{
          width: "100%", maxWidth: 320, padding: "14px 16px", borderRadius: "var(--k-r)",
          border: `1.5px solid ${error ? "var(--k-red)" : "var(--k-border)"}`, background: "var(--k-card)",
          display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
        }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "var(--k-text-muted)" }}>+91</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 500, flex: 1, letterSpacing: "0.1em" }}>
            {inp || <span style={{ color: "var(--k-text-light)" }}>Phone number</span>}
          </span>
        </div>

        {error && <div style={{ fontSize: 13, color: "var(--k-red)", marginBottom: 8, fontWeight: 500 }}>{error}</div>}

        <div className="k-numpad" style={{ width: "100%", maxWidth: 320, marginTop: 8 }}>
          {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, i) => {
            if (k === "") return <div key={i} />;
            if (k === "del") return <button key={i} className="k-num-back" onClick={handleDel}>&#9003;</button>;
            return <button key={i} onClick={() => handleKey(k)}>{k}</button>;
          })}
        </div>

        <button onClick={handleSubmit} disabled={inp.length !== 10} className="k-press" style={{
          width: "100%", maxWidth: 320, marginTop: 12, padding: "14px",
          borderRadius: "var(--k-r-pill)", background: inp.length === 10 ? "var(--k-maroon)" : "var(--k-border)",
          color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer",
        }}>Continue</button>
      </div>
    </div>
  );
}

/* ── OTP SCREEN ── */
function OTPScreen({ phone, storeId, storeName, onVerified, onBack }: {
  phone: string; storeId: string; storeName: string;
  onVerified: (customer: { _id: Id<"customers">; name: string; lastBodyScan?: number; bodyScanFileId?: Id<"_storage">; language?: string } | null) => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const verifyOtp = useMutation(api.phoneAuth.verifyOtp);
  const customer = useQuery(
    api.customers.getByPhone,
    phone ? { phone: `+91${phone}` } : "skip"
  );

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleKey = (k: string) => { setError(""); if (otp.length < 6) setOtp((v) => v + k); };
  const handleDel = () => { setError(""); setOtp((v) => v.slice(0, -1)); };
  const handleSubmit = async () => {
    if (otp.length !== 6) return;
    // customer is undefined while loading, null if not found
    if (customer === undefined) {
      setError("Loading customer data, try again...");
      return;
    }
    try {
      const result = await verifyOtp({ phone: `+91${phone}`, otp });
      if (result.success) {
        onVerified(customer);
      } else {
        setError("Incorrect OTP");
        setOtp("");
      }
    } catch {
      setError("Incorrect OTP");
      setOtp("");
    }
  };

  const maskedPhone = phone ? phone.slice(0, 2) + "****" + phone.slice(-4) : "";

  return (
    <div className="k-shell">
      <div className="k-topbar">
        <button onClick={onBack} className="k-press" style={{
          width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--k-border)",
          background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <span style={{ fontSize: 18 }}>&#8249;</span>
        </button>
        <div className="k-brand" style={{ fontSize: 22 }}>{storeName}</div>
        <div style={{ width: 36 }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Enter OTP</h2>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", marginBottom: 20 }}>OTP sent to +91 {maskedPhone}</p>

        {/* OTP boxes */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              width: 44, height: 52, borderRadius: "var(--k-r-sm)",
              background: "var(--k-card)", border: `1.5px solid ${otp[i] ? "var(--k-maroon)" : "var(--k-border)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace",
            }}>{otp[i] || ""}</div>
          ))}
        </div>

        {error && <div style={{ fontSize: 13, color: "var(--k-red)", marginBottom: 8, fontWeight: 500 }}>{error}</div>}

        <div style={{ marginTop: 4, marginBottom: 8 }}>
          {canResend ? (
            <button onClick={() => { setTimer(60); setCanResend(false); setOtp(""); }} style={{
              fontSize: 13, color: "var(--k-maroon)", fontWeight: 600, cursor: "pointer",
              background: "none", border: "none", textDecoration: "underline",
            }}>Resend OTP</button>
          ) : (
            <div style={{ fontSize: 12, color: "var(--k-text-muted)" }}>
              Resend in <span className="k-mono" style={{ color: "var(--k-maroon)" }}>{timer}s</span>
            </div>
          )}
        </div>

        <div className="k-numpad" style={{ width: "100%", maxWidth: 320, marginTop: 4 }}>
          {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, i) => {
            if (k === "") return <div key={i} />;
            if (k === "del") return <button key={i} className="k-num-back" onClick={handleDel}>&#9003;</button>;
            return <button key={i} onClick={() => handleKey(k)}>{k}</button>;
          })}
        </div>

        <button onClick={handleSubmit} disabled={otp.length !== 6} className="k-press" style={{
          width: "100%", maxWidth: 320, marginTop: 12, padding: "14px",
          borderRadius: "var(--k-r-pill)", background: otp.length === 6 ? "var(--k-maroon)" : "var(--k-border)",
          color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer",
        }}>Continue</button>
      </div>
    </div>
  );
}

/* ── SCAN CHOICE (returning customer with existing body scan) ── */
function ScanChoiceScreen({ customerName, onUsePrevious, onRescan }: {
  customerName: string; onUsePrevious: () => void; onRescan: () => void;
}) {
  return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="k-modal k-scaleIn" style={{ maxWidth: 360 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>👋</div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          Welcome back{customerName ? `, ${customerName.split(" ")[0]}` : ""}!
        </h3>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
          We found your previous body scan. Our AI can use it for your try-on, or you can take a fresh scan.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onUsePrevious} className="k-press" style={{
            width: "100%", padding: "14px", borderRadius: "var(--k-r-pill)",
            background: "var(--k-maroon)", color: "#fff", border: "none",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            Use Previous Scan
          </button>
          <button onClick={onRescan} className="k-press" style={{
            width: "100%", padding: "12px", borderRadius: "var(--k-r-pill)",
            background: "transparent", border: "1.5px solid var(--k-border)",
            fontSize: 14, fontWeight: 600, cursor: "pointer", color: "var(--k-text)",
          }}>
            Take Fresh Scan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── CODE ENTRY ── */
function CodeEntryScreen({
  storeId, storeName, onValidCode, onBack,
}: {
  storeId: string;
  storeName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValidCode: (data: any) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validation = useQuery(
    api.trialRoom.validateCode,
    code.length === 6 ? { code, storeId } : "skip"
  );

  const handleKey = (k: string) => { setError(""); if (code.length < 6) setCode((v) => v + k); };
  const handleDel = () => { setError(""); setCode((v) => v.slice(0, -1)); };
  const handleSubmit = () => {
    if (code.length !== 6) return;
    setLoading(true);
    if (!validation) { setError("Validating..."); setLoading(false); return; }
    if (!validation.valid) { setError(validation.error || "Invalid code"); setCode(""); setLoading(false); return; }
    onValidCode(validation);
    setLoading(false);
  };

  return (
    <div className="k-shell">
      <div className="k-topbar">
        <button onClick={onBack} className="k-press" style={{
          width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--k-border)",
          background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <span style={{ fontSize: 18 }}>&#8249;</span>
        </button>
        <div className="k-brand" style={{ fontSize: 22 }}>{storeName}</div>
        <div style={{ width: 36 }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Enter Trial Room Code</h2>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", marginBottom: 20 }}>6-digit code from your store assistant</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              width: 44, height: 52, borderRadius: "var(--k-r-sm)",
              background: "var(--k-card)", border: `1.5px solid ${code[i] ? "var(--k-maroon)" : "var(--k-border)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace",
            }}>{code[i] || ""}</div>
          ))}
        </div>
        {error && <div style={{ fontSize: 13, color: "var(--k-red)", marginBottom: 8, fontWeight: 500 }}>{error}</div>}
        <div className="k-numpad" style={{ width: "100%", maxWidth: 320, marginTop: 8 }}>
          {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, i) => {
            if (k === "") return <div key={i} />;
            if (k === "del") return <button key={i} className="k-num-back" onClick={handleDel}>&#9003;</button>;
            return <button key={i} onClick={() => handleKey(k)}>{k}</button>;
          })}
        </div>
        <button onClick={handleSubmit} disabled={code.length !== 6 || loading} className="k-press" style={{
          width: "100%", maxWidth: 320, marginTop: 12, padding: "14px",
          borderRadius: "var(--k-r-pill)", background: code.length === 6 ? "var(--k-maroon)" : "var(--k-border)",
          color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer",
        }}>{loading ? "Verifying..." : "Continue"}</button>
      </div>
    </div>
  );
}

/* ── LANGUAGE ── */
function LangScreen({ lang, onSelect, storeName }: { lang: string; onSelect: (c: string) => void; storeName: string }) {
  return (
    <div className="k-shell" style={{ alignItems: "center" }}>
      <div style={{ marginTop: 48, textAlign: "center" }}>
        <div className="k-brand" style={{ fontSize: 28 }}>{storeName}</div>
        <div style={{ width: 120, height: 1, margin: "12px auto", background: "linear-gradient(90deg, transparent, var(--k-gold), transparent)" }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 12 }}>Select Your Language</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: "24px 20px", width: "100%", marginTop: 16 }}>
        {LANGS.map((l) => (
          <button key={l.c} onClick={() => onSelect(l.c)} className="k-press" style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "16px 8px", borderRadius: "var(--k-r-sm)",
            background: lang === l.c ? "var(--k-maroon)" : "var(--k-card)",
            color: lang === l.c ? "#fff" : "var(--k-text)",
            border: `1px solid ${lang === l.c ? "var(--k-maroon)" : "var(--k-border)"}`,
            boxShadow: "var(--k-shadow)", cursor: "pointer", minHeight: 64,
          }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{l.v}</span>
            <span style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{l.n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── CONSENT ── */
function ConsentScreen({ onAllow, onSkip }: { onAllow: () => void; onSkip: () => void }) {
  return (
    <div className="k-overlay">
      <div className="k-modal k-scaleIn">
        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Start Your Try-On</h3>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", lineHeight: 1.6, textAlign: "left", marginBottom: 16 }}>
          Photo processed by on-device AI. Images saved securely. Delete anytime.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onSkip} className="k-press" style={{
            flex: 1, padding: 12, borderRadius: "var(--k-r-pill)",
            background: "transparent", border: "1px solid var(--k-border)", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Skip</button>
          <button onClick={onAllow} className="k-press" style={{
            flex: 1, padding: 12, borderRadius: "var(--k-r-pill)",
            background: "var(--k-maroon)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Allow</button>
        </div>
      </div>
    </div>
  );
}

/* ── BODY SCAN ── */
function BodyScanScreen({ storeName, onCapture, onBack }: { storeName: string; onCapture: () => void; onBack: () => void }) {
  const [detected, setDetected] = useState(false);
  const [phase, setPhase] = useState<"position" | "countdown">("position");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => { const t = setTimeout(() => setDetected(true), 2500); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { onCapture(); return; }
    const t = setTimeout(() => setCountdown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, onCapture]);

  return (
    <div className="k-shell">
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div className="k-brand" style={{ fontSize: 22 }}>{storeName}</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Create Your Digital Look</h2>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", marginBottom: 8 }}>Stand inside the frame</p>
        <div className="k-scan-frame" style={{
          width: "100%", flex: 1, maxHeight: "60vh", borderRadius: "var(--k-r)", overflow: "hidden",
          background: "linear-gradient(180deg, rgba(200,190,175,.3), rgba(200,190,175,.15))", position: "relative",
        }}>
          <div className="k-scan-corner tl" /><div className="k-scan-corner tr" /><div className="k-scan-corner bl" /><div className="k-scan-corner br" />
          {phase === "countdown" && <div className="k-scan-line" />}
          {phase === "countdown" && (
            <div style={{
              position: "absolute", top: "4%", left: "50%", transform: "translateX(-50%)",
              background: "rgba(255,255,255,.85)", padding: "4px 16px", borderRadius: "var(--k-r-sm)",
              fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 600, zIndex: 5,
            }}>{countdown}s</div>
          )}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
            <svg viewBox="0 0 200 400" style={{ height: "70%", opacity: detected ? 0.7 : 0.4 }}>
              <ellipse cx="100" cy="55" rx="28" ry="32" fill="none" stroke={detected ? "var(--k-green)" : "var(--k-text-light)"} strokeWidth="1.5" />
              <path d="M72 87C60 95 40 115 38 160L38 250Q38 260 48 260L65 260L65 200L75 200L75 350Q75 360 85 360L92 360L95 210L105 210L108 360L115 360Q125 360 125 350L125 200L135 200L135 260L152 260Q162 260 162 250L162 160C160 115 140 95 128 87" fill="none" stroke={detected ? "var(--k-green)" : "var(--k-text-light)"} strokeWidth="1.5" />
            </svg>
          </div>
          {phase === "position" && detected && (
            <div style={{ position: "absolute", bottom: "4%", left: "50%", transform: "translateX(-50%)", zIndex: 5, display: "flex", gap: 10 }}>
              <button onClick={() => { setPhase("countdown"); setCountdown(10); }} className="k-press" style={{
                padding: "12px 24px", borderRadius: "var(--k-r-pill)",
                background: "rgba(255,255,255,.85)", border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}>Capture My Look</button>
            </div>
          )}
        </div>
        <button onClick={onBack} className="k-press" style={{
          marginTop: 8, padding: "8px 20px", background: "transparent", border: "1px solid var(--k-border)",
          borderRadius: "var(--k-r-pill)", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--k-text-muted)",
        }}>Back</button>
      </div>
    </div>
  );
}

/* ── AI PROCESSING ── */
function AIProcessingScreen({ onDone }: { onDone: () => void }) {
  const [cd, setCd] = useState(6);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    if (cd <= 0) { onDone(); return; }
    const t = setTimeout(() => { setCd((v) => v - 1); setProg((v) => Math.min(100, v + 17)); }, 1000);
    return () => clearTimeout(t);
  }, [cd, onDone]);
  return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Creating your look...</h2>
      <div style={{ width: "70%", height: 4, borderRadius: "var(--k-r-pill)", background: "var(--k-border-l)", marginTop: 16, overflow: "hidden" }}>
        <div style={{ width: `${prog}%`, height: "100%", background: "linear-gradient(90deg, var(--k-maroon), var(--k-gold))", borderRadius: "var(--k-r-pill)", transition: "width .8s ease" }} />
      </div>
      <div className="k-mono" style={{ fontSize: 16, color: "var(--k-text-muted)", marginTop: 12 }}>{cd}s</div>
      <div className="k-slideUp k-d3" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, padding: "8px 20px", borderRadius: "var(--k-r-pill)", background: "var(--k-green-bg)" }}>
        <span style={{ fontSize: 12, color: "var(--k-green)", fontWeight: 500 }}>🔒 Securely saved</span>
      </div>
    </div>
  );
}

/* ── HEADER ── */
function KioskHeader({ trialCount, wardrobeCount, cartCount, goHome, triggerLogout, navigate, onBack }: {
  trialCount: number; wardrobeCount: number; cartCount: number;
  goHome: () => void; triggerLogout: () => void;
  navigate: (s: Screen) => void; onBack?: () => void;
}) {
  return (
    <div className="k-topbar">
      {onBack ? (
        <button onClick={onBack} className="k-press" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 18 }}>&#8249;</span>
        </button>
      ) : <div style={{ width: 36 }} />}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={trialCount > 0 ? () => navigate("trialRoom") : undefined} className="k-press"
          style={{ position: "relative", cursor: trialCount > 0 ? "pointer" : "default", opacity: trialCount > 0 ? 1 : 0.4, background: "none", border: "none" }}>
          <span style={{ fontSize: 20 }}>👗</span>
          {trialCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "var(--k-gold)", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>{trialCount}</span>}
        </button>
        <button onClick={() => navigate("wardrobe")} className="k-press" style={{ position: "relative", cursor: "pointer", background: "none", border: "none" }}>
          <span style={{ fontSize: 20 }}>👜</span>
          {wardrobeCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "var(--k-maroon)", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>{wardrobeCount}</span>}
        </button>
        {cartCount > 0 && (
          <button onClick={() => navigate("order")} className="k-press" style={{ position: "relative", cursor: "pointer", background: "none", border: "none" }}>
            <span style={{ fontSize: 20 }}>🛒</span>
            <span style={{ position: "absolute", top: -4, right: -4, background: "var(--k-green)", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>{cartCount}</span>
          </button>
        )}
        <button onClick={goHome} className="k-press" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 16 }}>🏠</span>
        </button>
        <button onClick={triggerLogout} className="k-press" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 16 }}>⏻</span>
        </button>
      </div>
    </div>
  );
}

/* ── HOME ── */
function HomeScreen({ sarees, trialItems, wardrobeItems, onProductTap, onSendToTrial, navigate, goHome, triggerLogout, trialCount, wardrobeCount, cartCount, maxTrial, showToast }: {
  sarees: SareeItem[]; trialItems: SareeItem[]; wardrobeItems: SareeItem[];
  onProductTap: (p: SareeItem) => void; onSendToTrial: (items: SareeItem[]) => void;
  navigate: (s: Screen) => void; goHome: () => void; triggerLogout: () => void;
  trialCount: number; wardrobeCount: number; cartCount: number; maxTrial: number;
  showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isInTrial = (id: string) => trialItems.some((s) => s._id === id);
  const isInWardrobe = (id: string) => wardrobeItems.some((s) => s._id === id);

  const toggleSelect = (saree: SareeItem) => {
    if (isInTrial(saree._id) || isInWardrobe(saree._id)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(saree._id)) next.delete(saree._id);
      else { if (next.size >= maxTrial) { showToast(`Max ${maxTrial} sarees per trial`, "warning"); return prev; } next.add(saree._id); }
      return next;
    });
  };

  const sendToTrial = () => {
    const items = sarees.filter((s) => selectedIds.has(s._id));
    onSendToTrial(items);
    setSelectedIds(new Set());
  };

  const filtered = query ? sarees.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.occasion.toLowerCase().includes(query.toLowerCase())) : null;
  const trending = sarees.slice(0, 6);
  const newArrivals = [...sarees].reverse().slice(0, 6);

  return (
    <div className="k-shell">
      <KioskHeader trialCount={trialCount} wardrobeCount={wardrobeCount} cartCount={cartCount} goHome={goHome} triggerLogout={triggerLogout} navigate={navigate} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
        <div style={{ padding: "12px 18px", display: "flex", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: "var(--k-r)", border: "1px solid var(--k-border)", background: "var(--k-card)" }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search saree..."
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14 }} />
            {query && <span onClick={() => setQuery("")} style={{ cursor: "pointer", fontSize: 16 }}>✕</span>}
          </div>
        </div>
        {selectedIds.size > 0 && (
          <div className="k-slideUp" style={{ margin: "0 18px 12px", padding: "10px 14px", borderRadius: "var(--k-r)", background: "linear-gradient(135deg, rgba(201,148,26,.1), rgba(242,212,212,.5))", border: "1px solid rgba(201,148,26,.3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedIds.size} saree(s) selected</span>
            <button onClick={sendToTrial} className="k-press" style={{ padding: "8px 16px", borderRadius: "var(--k-r-pill)", background: "var(--k-gold)", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Send to Trial Room</button>
          </div>
        )}
        {filtered ? (
          <div style={{ padding: "0 18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {filtered.map((s) => <SareeCard key={s._id} saree={s} onTap={() => onProductTap(s)} onCheck={() => toggleSelect(s)} isSelected={selectedIds.has(s._id)} isInTrial={isInTrial(s._id)} isInWardrobe={isInWardrobe(s._id)} />)}
            </div>
          </div>
        ) : (
          <>
            <ScrollSection title="Trending Now">
              {trending.map((s) => <div key={s._id} style={{ minWidth: "45%", maxWidth: "45%", scrollSnapAlign: "start" }}>
                <SareeCard saree={s} onTap={() => onProductTap(s)} onCheck={() => toggleSelect(s)} isSelected={selectedIds.has(s._id)} isInTrial={isInTrial(s._id)} isInWardrobe={isInWardrobe(s._id)} />
              </div>)}
            </ScrollSection>
            <ScrollSection title="New Arrivals">
              {newArrivals.map((s) => <div key={s._id} style={{ minWidth: "45%", maxWidth: "45%", scrollSnapAlign: "start" }}>
                <SareeCard saree={s} onTap={() => onProductTap(s)} onCheck={() => toggleSelect(s)} isSelected={selectedIds.has(s._id)} isInTrial={isInTrial(s._id)} isInWardrobe={isInWardrobe(s._id)} />
              </div>)}
            </ScrollSection>
          </>
        )}
      </div>
    </div>
  );
}

function ScrollSection({ title, children }: { title: string; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", marginBottom: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })} className="k-press" style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })} className="k-press" style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>
      </div>
      <div ref={scrollRef} className="k-no-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", paddingLeft: 18, paddingRight: 18 }}>{children}</div>
    </div>
  );
}

function SareeCard({ saree, onTap, onCheck, isSelected, isInTrial, isInWardrobe }: {
  saree: SareeItem; onTap: () => void; onCheck?: () => void; isSelected: boolean; isInTrial: boolean; isInWardrobe: boolean;
}) {
  const disabled = isInTrial || isInWardrobe;
  const grad = saree.grad || ["#E8E0D4", "#D4A843"];
  const label = isInWardrobe ? "In Wardrobe" : isInTrial ? "In Trial" : isSelected ? "Selected" : null;
  const labelBg = isInWardrobe ? "var(--k-maroon)" : isInTrial ? "var(--k-gold)" : isSelected ? "var(--k-green)" : "";
  return (
    <div className="k-product-card k-slideUp" onClick={disabled ? undefined : onTap} style={{ cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.7 : 1, position: "relative", border: isSelected ? "2px solid var(--k-gold)" : undefined }}>
      {onCheck && !disabled && (
        <div onClick={(e) => { e.stopPropagation(); onCheck(); }} style={{ position: "absolute", top: 8, left: 8, zIndex: 3, width: 24, height: 24, borderRadius: 4, border: `1.5px solid ${isSelected ? "var(--k-gold)" : "rgba(255,255,255,.8)"}`, background: isSelected ? "var(--k-gold)" : "rgba(255,255,255,.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {isSelected && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span>}
        </div>
      )}
      <div style={{ position: "relative", width: "100%", paddingTop: "140%", background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})` }}>
        {saree.emoji && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 32 }}>{saree.emoji}</span>}
        {label && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: labelBg, padding: "4px 0", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#fff" }}>{label}</div>}
      </div>
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{saree.name}</div>
        <div style={{ fontSize: 11, color: "var(--k-text-muted)" }}>{saree.fabric}</div>
        <div className="k-mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--k-maroon)", marginTop: 2 }}>₹{fmtPrice(saree.price)}</div>
      </div>
    </div>
  );
}

/* ── PRODUCT DETAIL ── */
function ProductDetailScreen({ product, allSarees, isInTrial, isInWardrobe, onAddToTrial, onBack, onProductTap, navigate, goHome, triggerLogout, trialCount, wardrobeCount, cartCount }: {
  product: SareeItem; allSarees: SareeItem[]; isInTrial: boolean; isInWardrobe: boolean;
  onAddToTrial: () => void; onBack: () => void; onProductTap: (p: SareeItem) => void;
  navigate: (s: Screen) => void; goHome: () => void; triggerLogout: () => void;
  trialCount: number; wardrobeCount: number; cartCount: number;
}) {
  const [selColor, setSelColor] = useState(0);
  const grad = product.grad || ["#E8E0D4", "#D4A843"];
  const disc = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const similar = allSarees.filter((s) => s.occasion === product.occasion && s._id !== product._id).slice(0, 4);
  return (
    <div className="k-shell">
      <KioskHeader trialCount={trialCount} wardrobeCount={wardrobeCount} cartCount={cartCount} goHome={goHome} triggerLogout={triggerLogout} navigate={navigate} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, padding: "12px 18px" }}>
          <div style={{ width: "45%", position: "relative", borderRadius: "var(--k-r)", overflow: "hidden", paddingTop: "60%", background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})` }}>
            {product.emoji && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 48 }}>{product.emoji}</span>}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{product.name}</h2>
            <div style={{ fontSize: 12, color: "var(--k-text-muted)" }}>{product.fabric} · {product.occasion}</div>
            {product.description && <p style={{ fontSize: 12, color: "var(--k-text-mid)", lineHeight: 1.5 }}>{product.description}</p>}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              {disc > 0 && <span className="k-mono" style={{ fontSize: 12, color: "var(--k-green)", fontWeight: 600 }}>-{disc}%</span>}
              <span className="k-mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--k-maroon)" }}>₹{fmtPrice(product.price)}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Colors</div>
            <div style={{ display: "flex", gap: 6 }}>
              {product.colors.map((c, i) => <div key={i} onClick={() => setSelColor(i)} className="k-swatch" style={{ background: c, borderColor: i === selColor ? "var(--k-maroon)" : "transparent" }} />)}
            </div>
            <button onClick={onAddToTrial} disabled={isInTrial || isInWardrobe} className="k-press" style={{
              width: "100%", padding: "12px", borderRadius: "var(--k-r-pill)", marginTop: 4,
              background: isInTrial || isInWardrobe ? "var(--k-border)" : "var(--k-maroon)",
              color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>{isInWardrobe ? "In Wardrobe" : isInTrial ? "In Trial Room" : "Add to Trial Room"}</button>
          </div>
        </div>
        {similar.length > 0 && <ScrollSection title="Similar Sarees">{similar.map((s) => <div key={s._id} style={{ minWidth: "45%", maxWidth: "45%", scrollSnapAlign: "start" }}><SareeCard saree={s} onTap={() => onProductTap(s)} isSelected={false} isInTrial={false} isInWardrobe={false} /></div>)}</ScrollSection>}
      </div>
    </div>
  );
}

/* ── TRIAL ROOM ── */
function TrialRoomScreen({ items, wardrobeItems, onRemoveItem, onAddToWardrobe, onGoHome, onLogout, showToast, maxTrial, tryOnSec }: {
  items: SareeItem[]; wardrobeItems: SareeItem[]; onRemoveItem: (id: Id<"sarees">) => void;
  onAddToWardrobe: (items: SareeItem[]) => void; onGoHome: () => void; onLogout: () => void;
  showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void; maxTrial: number; tryOnSec: number;
}) {
  const [timer, setTimer] = useState(tryOnSec);
  const [selIdx, setSelIdx] = useState(0);
  const [selForWard, setSelForWard] = useState<Set<string>>(new Set());
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => { if (timer <= 0) { setShowEnd(true); return; } const t = setTimeout(() => setTimer((v) => v - 1), 1000); return () => clearTimeout(t); }, [timer]);

  const toggleWard = (id: string) => { setSelForWard((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
  const moveToWardrobe = () => {
    const sel = items.filter((s) => selForWard.has(s._id));
    if (sel.length === 0) { showToast("Select sarees first", "warning"); return; }
    onAddToWardrobe(sel);
    setSelForWard(new Set());
  };

  const current = items[selIdx] || items[0];
  const grad = current?.grad || ["#E8E0D4", "#D4A843"];

  if (items.length === 0) return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 48 }}>👗</span>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--k-text-muted)", marginTop: 12 }}>Trial Room Empty</h2>
      <button onClick={onGoHome} className="k-press" style={{ marginTop: 16, padding: "12px 24px", borderRadius: "var(--k-r-pill)", background: "var(--k-maroon)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Browse Sarees</button>
    </div>
  );

  return (
    <div className="k-shell" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", background: "linear-gradient(180deg, rgba(245,240,234,.95), transparent)" }}>
        <button onClick={onGoHome} className="k-press" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.8)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}><span style={{ fontSize: 16 }}>🏠</span></button>
        <div className="k-timer"><span style={{ color: timer <= 30 ? "var(--k-red)" : "var(--k-text)" }}>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</span></div>
        <button onClick={onLogout} className="k-press" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.8)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}><span style={{ fontSize: 16 }}>⏻</span></button>
      </div>
      <div style={{ display: "flex", width: "100%", height: "100%", paddingTop: 52 }}>
        <div style={{ width: "30%", height: "100%", overflowY: "auto", padding: "8px 6px", background: "rgba(0,0,0,.03)", borderRight: "1px solid var(--k-border)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, padding: "4px 6px", marginBottom: 6 }}>Trial Room ({items.length}/{maxTrial})</div>
          {items.map((saree, idx) => {
            const active = idx === selIdx;
            const selW = selForWard.has(saree._id);
            const sg = saree.grad || ["#E8E0D4", "#D4A843"];
            return (
              <div key={saree._id} onClick={() => setSelIdx(idx)} className="k-press" style={{ display: "flex", gap: 6, padding: "8px 6px", marginBottom: 6, borderRadius: "var(--k-r-sm)", cursor: "pointer", position: "relative", background: active ? "rgba(242,212,212,.4)" : "var(--k-card)", border: active ? "2px solid var(--k-maroon)" : "1px solid var(--k-border)" }}>
                <div onClick={(e) => { e.stopPropagation(); toggleWard(saree._id); }} style={{ width: 20, height: 20, borderRadius: 3, flexShrink: 0, alignSelf: "center", border: `1.5px solid ${selW ? "var(--k-green)" : "var(--k-text-light)"}`, background: selW ? "var(--k-green)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {selW && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ width: 40, height: 40, borderRadius: "var(--k-r-sm)", flexShrink: 0, background: `linear-gradient(135deg, ${sg[0]}, ${sg[1] || sg[0]})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {saree.emoji && <span style={{ fontSize: 16 }}>{saree.emoji}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{saree.name}</div>
                  <div className="k-mono" style={{ fontSize: 10, color: "var(--k-maroon)", fontWeight: 600 }}>₹{fmtPrice(saree.price)}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onRemoveItem(saree._id); }} style={{ position: "absolute", top: 2, right: 2, cursor: "pointer", background: "none", border: "none", fontSize: 12, color: "var(--k-text-muted)" }}>✕</button>
              </div>
            );
          })}
          {selForWard.size > 0 && <button onClick={moveToWardrobe} className="k-press" style={{ width: "100%", padding: "10px", borderRadius: "var(--k-r-pill)", marginTop: 8, background: "var(--k-maroon)", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Add to Wardrobe ({selForWard.size})</button>}
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          {current && <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`, display: "flex", alignItems: "center", justifyContent: "center" }}>{current.emoji && <span style={{ fontSize: 96, opacity: 0.5 }}>{current.emoji}</span>}</div>}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(245,240,234,.9) 95%)" }} />
          {current && <div style={{ position: "absolute", bottom: 48, right: 16, width: "55%", background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", borderRadius: "var(--k-r)", padding: "12px", boxShadow: "var(--k-shadow-md)" }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{current.name}</div>
            <div className="k-mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--k-maroon)" }}>₹{fmtPrice(current.price)}</div>
            {current.description && <div style={{ fontSize: 11, color: "var(--k-text-muted)", marginTop: 4 }}>{current.description}</div>}
          </div>}
        </div>
      </div>
      {showEnd && <div className="k-overlay"><div className="k-modal k-scaleIn"><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Time&apos;s Up!</h3><p style={{ fontSize: 13, color: "var(--k-text-muted)", marginBottom: 16 }}>Session ending. Continue or logout?</p><div style={{ display: "flex", gap: 10 }}><button onClick={onLogout} className="k-press" style={{ flex: 1, padding: 12, borderRadius: "var(--k-r-pill)", background: "var(--k-red)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Logout</button><button onClick={() => { setTimer((v) => v + 60); setShowEnd(false); }} className="k-press" style={{ flex: 1, padding: 12, borderRadius: "var(--k-r-pill)", background: "transparent", border: "1px solid var(--k-border)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Continue (+1 min)</button></div></div></div>}
    </div>
  );
}

/* ── WARDROBE ── */
function WardrobeScreen({ items, onMoveToCart, navigate, goHome, triggerLogout, trialCount, wardrobeCount, cartCount, maxWardrobe, showToast }: {
  items: SareeItem[]; onMoveToCart: (items: SareeItem[]) => void;
  navigate: (s: Screen) => void; goHome: () => void; triggerLogout: () => void;
  trialCount: number; wardrobeCount: number; cartCount: number; maxWardrobe: number;
  showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void;
}) {
  const [selForCart, setSelForCart] = useState<Set<string>>(new Set());
  const toggleSel = (id: string) => { setSelForCart((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
  const moveToCart = () => { const sel = items.filter((s) => selForCart.has(s._id)); if (sel.length === 0) { showToast("Select sarees first", "warning"); return; } onMoveToCart(sel); setSelForCart(new Set()); };
  return (
    <div className="k-shell">
      <KioskHeader trialCount={trialCount} wardrobeCount={wardrobeCount} cartCount={cartCount} goHome={goHome} triggerLogout={triggerLogout} navigate={navigate} />
      <div style={{ textAlign: "center", padding: "8px 0" }}><div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--k-maroon-d)", color: "#fff", padding: "6px 16px", borderRadius: "var(--k-r-pill)", fontSize: 14, fontWeight: 600 }}>My Wardrobe ({items.length}/{maxWardrobe})</div></div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 18px", paddingBottom: 80 }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--k-text-muted)" }}>
            <span style={{ fontSize: 48 }}>👜</span>
            <div style={{ marginTop: 12, fontSize: 14 }}>Your wardrobe is empty</div>
            <button onClick={goHome} className="k-press" style={{ marginTop: 16, padding: "10px 20px", borderRadius: "var(--k-r-pill)", background: "var(--k-maroon)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Browse Sarees</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {items.map((saree) => {
              const g = saree.grad || ["#E8E0D4", "#D4A843"];
              const selC = selForCart.has(saree._id);
              return (
                <div key={saree._id} className="k-product-card" style={{ border: selC ? "2px solid var(--k-green)" : undefined }}>
                  <div style={{ position: "relative", width: "100%", paddingTop: "120%", background: `linear-gradient(135deg, ${g[0]}, ${g[1] || g[0]})` }}>{saree.emoji && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 32 }}>{saree.emoji}</span>}</div>
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{saree.name}</div>
                    <div className="k-mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--k-maroon)" }}>₹{fmtPrice(saree.price)}</div>
                    <button onClick={() => toggleSel(saree._id)} className="k-press" style={{ width: "100%", marginTop: 6, padding: "6px", borderRadius: "var(--k-r-sm)", fontSize: 10, fontWeight: 600, cursor: "pointer", background: selC ? "var(--k-green)" : "transparent", color: selC ? "#fff" : "var(--k-text)", border: `1px solid ${selC ? "var(--k-green)" : "var(--k-border)"}` }}>{selC ? "✓ Selected" : "Add to Cart"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selForCart.size > 0 && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}><button onClick={moveToCart} className="k-press" style={{ padding: "12px 32px", borderRadius: "var(--k-r-pill)", background: "var(--k-maroon)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "var(--k-shadow-lg)" }}>Move to Cart ({selForCart.size})</button></div>}
    </div>
  );
}

/* ── ORDER ── */
function OrderScreen({ cart, setCart, onCheckout, onFindTailor, onBack }: {
  cart: Array<SareeItem & { qty: number }>; setCart: React.Dispatch<React.SetStateAction<Array<SareeItem & { qty: number }>>>;
  onCheckout: () => Promise<void>; onFindTailor: () => void; onBack: () => void;
}) {
  const [showQR, setShowQR] = useState(false);
  const [qrExp, setQrExp] = useState(600);
  useEffect(() => { if (!showQR || qrExp <= 0) return; const t = setTimeout(() => setQrExp((v) => v - 1), 1000); return () => clearTimeout(t); }, [showQR, qrExp]);
  const updateQty = (idx: number, d: number) => setCart((p) => p.map((item, i) => i === idx ? { ...item, qty: Math.max(1, item.qty + d) } : item));
  const removeItem = (idx: number) => setCart((p) => p.filter((_, i) => i !== idx));
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = cart.reduce((s, i) => s + i.price * i.qty * (i.price < 1000 ? 0.05 : 0.12), 0);
  return (
    <div className="k-shell">
      <div className="k-topbar">
        <button onClick={onBack} className="k-press" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><span style={{ fontSize: 18 }}>&#8249;</span></button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Your Cart</div>
        <div style={{ width: 36 }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px", paddingBottom: 16 }}>
        {cart.map((item, idx) => {
          const g = item.grad || ["#E8E0D4", "#D4A843"];
          return (
            <div key={idx} style={{ display: "flex", gap: 10, padding: "10px", background: "var(--k-card)", borderRadius: "var(--k-r)", boxShadow: "var(--k-shadow)", marginBottom: 8, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "var(--k-r-sm)", flexShrink: 0, background: `linear-gradient(135deg, ${g[0]}, ${g[1] || g[0]})`, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.emoji && <span style={{ fontSize: 20 }}>{item.emoji}</span>}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div><div className="k-mono" style={{ fontSize: 12, color: "var(--k-maroon)", fontWeight: 600 }}>₹{fmtPrice(item.price)}</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => updateQty(idx, -1)} className="k-press" style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                <span className="k-mono" style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => updateQty(idx, 1)} className="k-press" style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
              <button onClick={() => removeItem(idx)} style={{ cursor: "pointer", background: "none", border: "none", fontSize: 16, color: "var(--k-red)" }}>✕</button>
            </div>
          );
        })}
        <div className="k-receipt" style={{ marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: "var(--k-text-muted)" }}>Subtotal</span><span>₹{fmtPrice(subtotal)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: "var(--k-text-muted)" }}>GST</span><span>₹{fmtPrice(Math.round(gst))}</span></div>
          <div className="k-receipt-divider" />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "var(--k-maroon)" }}><span>Total</span><span>₹{fmtPrice(Math.round(subtotal + gst))}</span></div>
          <div style={{ fontSize: 10, color: "var(--k-text-muted)", fontStyle: "italic", marginTop: 4 }}>Prices indicative. Final at counter.</div>
        </div>
        {!showQR ? (
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={async () => { await onCheckout(); setShowQR(true); }} className="k-press" style={{ flex: 1, padding: 14, borderRadius: "var(--k-r-pill)", background: "var(--k-maroon)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Checkout</button>
            <button onClick={onFindTailor} className="k-press" style={{ padding: "14px 16px", borderRadius: "var(--k-r-pill)", background: "transparent", border: "1px solid var(--k-border)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Find Tailor</button>
          </div>
        ) : (
          <div className="k-slideUp" style={{ textAlign: "center", marginTop: 16 }}>
            <div style={{ width: 160, height: 160, margin: "0 auto 8px", background: "var(--k-card)", borderRadius: "var(--k-r)", boxShadow: "var(--k-shadow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>📱</div>
            <div style={{ fontSize: 13, color: "var(--k-text-muted)" }}>Show this to store team. Expires {Math.floor(qrExp / 60)}:{String(qrExp % 60).padStart(2, "0")}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── TAILORS ── */
function TailorScreen({ storeCity, onBack, showToast }: { storeCity: string; onBack: () => void; showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void }) {
  const tailors = useQuery(api.tailorOps.listByCity, storeCity ? { city: storeCity } : "skip");
  return (
    <div className="k-shell">
      <div className="k-topbar">
        <button onClick={onBack} className="k-press" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--k-border)", background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><span style={{ fontSize: 18 }}>&#8249;</span></button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Expert Tailors</div>
        <div style={{ width: 36 }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px" }}>
        {!tailors || tailors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--k-text-muted)", fontSize: 14 }}>No tailors found in this area</div>
        ) : (
          tailors.map((t) => (
            <div key={t._id} className="k-tailor-card k-slideUp" style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: "var(--k-r-sm)", flexShrink: 0, background: "linear-gradient(135deg, #E8E0D4, #D4A843)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✂️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "var(--k-text-muted)" }}>{t.specialties?.join(", ") || "General"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--k-text-muted)" }}>⭐ {t.rating} · {t.city}</div>
                <button onClick={() => showToast("Tailor connection coming soon", "info")} className="k-press" style={{ marginTop: 6, padding: "6px 14px", borderRadius: "var(--k-r-pill)", background: "var(--k-maroon)", color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Connect</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ── FEEDBACK ── */
function FeedbackScreen({ onSubmit, onHome, onLogout }: { onSubmit: (rating: number) => void; onHome: () => void; onLogout: () => void }) {
  const [rating, setRating] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => { if (done) { const t = setTimeout(() => onSubmit(rating), 3000); return () => clearTimeout(t); } }, [done, onSubmit, rating]);
  if (done) return <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}><span className="k-popIn" style={{ fontSize: 64 }}>⭐</span><h2 className="k-slideUp k-d2" style={{ fontSize: 22, fontWeight: 700, marginTop: 12 }}>Thank you!</h2></div>;
  return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="k-modal k-scaleIn" style={{ maxWidth: 340 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700 }}>How was your experience?</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "16px 0" }}>
          {[1, 2, 3, 4, 5].map((n) => <span key={n} onClick={() => setRating(n)} className="k-star k-press" style={{ color: n <= rating ? "var(--k-gold)" : "var(--k-border)" }}>★</span>)}
        </div>
        <button onClick={() => setDone(true)} disabled={rating === 0} className="k-press" style={{ width: "100%", padding: 14, borderRadius: "var(--k-r-pill)", background: rating > 0 ? "var(--k-maroon)" : "var(--k-border)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Submit</button>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={onHome} className="k-press" style={{ flex: 1, padding: 10, borderRadius: "var(--k-r-pill)", background: "transparent", border: "1px solid var(--k-border)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Home</button>
          <button onClick={onLogout} className="k-press" style={{ flex: 1, padding: 10, borderRadius: "var(--k-r-pill)", background: "transparent", border: "1px solid var(--k-border)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Logout</button>
        </div>
      </div>
    </div>
  );
}

/* ── DATA SAVE ── */
function DataSaveScreen({ onSave, onDelete }: { onSave: () => void; onDelete: () => void }) {
  return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="k-modal k-scaleIn" style={{ maxWidth: 340 }}>
        <span style={{ fontSize: 40 }}>🔒</span>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "8px 0" }}>Save your looks?</h3>
        <p style={{ fontSize: 12, color: "var(--k-text-muted)", lineHeight: 1.6, textAlign: "left", marginBottom: 16 }}>Saved to your Wearify profile. Access anytime from your phone.</p>
        <button onClick={onSave} className="k-press" style={{ width: "100%", padding: 14, borderRadius: "var(--k-r-pill)", background: "var(--k-maroon)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>Save</button>
        <div style={{ fontSize: 10, color: "var(--k-text-muted)", marginBottom: 8 }}>OR</div>
        <button onClick={onDelete} className="k-press" style={{ width: "100%", padding: 12, borderRadius: "var(--k-r-pill)", background: "transparent", border: "1px solid var(--k-red)", color: "var(--k-red)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete All</button>
      </div>
    </div>
  );
}

/* ── SESSION END ── */
function SessionEndScreen({ onDone }: { onDone: () => void }) {
  const [cd, setCd] = useState(3);
  useEffect(() => { if (cd <= 0) { onDone(); return; } const t = setTimeout(() => setCd((v) => v - 1), 1000); return () => clearTimeout(t); }, [cd, onDone]);
  return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center", background: "var(--k-maroon-d)" }}>
      <span className="k-popIn" style={{ fontSize: 64 }}>🔒</span>
      <h2 className="k-slideUp k-d2" style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 16 }}>Session Ended</h2>
      <p className="k-slideUp k-d3" style={{ fontSize: 14, color: "rgba(255,255,255,.6)", marginTop: 8 }}>Your privacy is protected.</p>
      <div className="k-mono k-slideUp k-d4" style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginTop: 16 }}>{cd}...</div>
    </div>
  );
}
