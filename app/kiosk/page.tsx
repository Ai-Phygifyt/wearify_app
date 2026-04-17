"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SareeThumb } from "@/components/SareeThumb";

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
  | "newCustomer"
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
  imageIds?: Id<"_storage">[];
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
  const recordBodyScan = useMutation(api.customers.recordBodyScan);
  const addTrialCartItem = useMutation(api.sessionOps.addTrialCartItem);
  const removeTrialCartItem = useMutation(api.sessionOps.removeTrialCartItem);

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

  // Restore an in-progress customer session across page refresh.
  // Writes: see persistKioskSession below. Clears: handleWipe.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("wearify_kiosk_session");
      if (!raw) return;
      const s = JSON.parse(raw) as {
        customerId?: Id<"customers">;
        customerName?: string;
        sessionId?: string;
        phone?: string;
        lang?: string;
        hasBodyScan?: boolean;
      };
      if (!s.customerId || !s.sessionId) return;
      setCustomerId(s.customerId);
      setCustomerName(s.customerName ?? "");
      setSessionId(s.sessionId);
      setPhone(s.phone ?? "");
      if (s.lang) setLang(s.lang);
      setIsReturningCustomer(true);
      setHasBodyScan(!!s.hasBodyScan);
      returningRef.current = true;
      scanEligibleRef.current = !!s.hasBodyScan;
      setScreen("home");
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistKioskSession = useCallback((patch: Partial<{
    customerId: Id<"customers">;
    customerName: string;
    sessionId: string;
    phone: string;
    lang: string;
    hasBodyScan: boolean;
  }>) => {
    try {
      const current = JSON.parse(localStorage.getItem("wearify_kiosk_session") ?? "{}");
      localStorage.setItem("wearify_kiosk_session", JSON.stringify({ ...current, ...patch }));
    } catch { /* ignore */ }
  }, []);

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
    hydratedRef.current = null;
    try { localStorage.removeItem("wearify_kiosk_session"); } catch { /* ignore */ }
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

  // Persistent retention — load the customer's wardrobe + trial cart for THIS store.
  // Hydrates local state once `customerId`, `storeId`, and `allSarees` are all ready.
  const savedWardrobe = useQuery(
    api.sessionOps.listWardrobeByCustomer,
    customerId ? { customerId } : "skip",
  );
  const savedTrialCart = useQuery(
    api.sessionOps.listTrialCart,
    customerId && storeId ? { customerId, storeId } : "skip",
  );
  const hydratedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!customerId || !storeId || !allSarees) return;
    if (savedWardrobe === undefined || savedTrialCart === undefined) return;
    const key = `${customerId}:${storeId}`;
    if (hydratedRef.current === key) return;
    hydratedRef.current = key;
    const sareeMap = new Map(allSarees.map((s) => [s._id, s] as const));
    const wardrobeForStore = savedWardrobe
      .filter((w) => w.storeId === storeId)
      .map((w) => sareeMap.get(w.sareeId))
      .filter(Boolean) as SareeItem[];
    const trialForStore = savedTrialCart
      .map((t) => sareeMap.get(t.sareeId))
      .filter(Boolean) as SareeItem[];
    // Diagnostic — check browser console if retention looks off.
    console.log("[kiosk hydrate]", {
      key,
      wardrobeFromDb: savedWardrobe.length,
      wardrobeForStore: wardrobeForStore.length,
      trialCartFromDb: savedTrialCart.length,
      trialForStore: trialForStore.length,
    });
    // Merge rather than replace — codeEntry may have already populated trialItems from tablet shortlist.
    setWardrobeItems((prev) => {
      const have = new Set(prev.map((s) => s._id));
      return [...prev, ...wardrobeForStore.filter((s) => !have.has(s._id))];
    });
    setTrialItems((prev) => {
      const have = new Set(prev.map((s) => s._id));
      return [...prev, ...trialForStore.filter((s) => !have.has(s._id))];
    });
  }, [customerId, storeId, allSarees, savedWardrobe, savedTrialCart]);

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
              if (!customer) {
                // Unknown phone — collect minimal profile (name + DOB) on kiosk
                returningRef.current = false;
                scanEligibleRef.current = false;
                navigate("newCustomer");
                return;
              }
              setCustomerId(customer._id);
              setCustomerName(customer.name);
              setIsReturningCustomer(true);
              const scanAge = customer.lastBodyScan
                ? (Date.now() - customer.lastBodyScan) / (1000 * 60 * 60 * 24 * 30)
                : Infinity;
              const hasScan = !!customer.lastBodyScan && scanAge < CFG.scanValidMonths;
              setHasBodyScan(hasScan);
              if (customer.language) setLang(customer.language);
              returningRef.current = true;
              scanEligibleRef.current = hasScan;
              // Create a session for returning customer
              const newSessionId = await createSessionMut({
                storeId,
                storeName,
                customerId: customer._id,
                customerPhone: `+91${phone}`,
              });
              setSessionId(newSessionId);
              persistKioskSession({
                customerId: customer._id,
                customerName: customer.name,
                sessionId: newSessionId,
                phone,
                lang: customer.language ?? "en",
                hasBodyScan: hasScan,
              });
              if (scanEligibleRef.current) {
                navigate("scanChoice");
              } else {
                navigate("consent");
              }
            }}
            onBack={goBack}
          />
        );
      case "newCustomer":
        return (
          <NewCustomerScreen
            phone={phone}
            storeName={storeName}
            onRegistered={async (cId, cName) => {
              setCustomerId(cId);
              setCustomerName(cName);
              setIsReturningCustomer(false);
              setHasBodyScan(false);
              returningRef.current = false;
              scanEligibleRef.current = false;
              const newSessionId = await createSessionMut({
                storeId,
                storeName,
                customerId: cId,
                customerPhone: `+91${phone}`,
              });
              setSessionId(newSessionId);
              persistKioskSession({
                customerId: cId,
                customerName: cName,
                sessionId: newSessionId,
                phone,
                lang,
                hasBodyScan: false,
              });
              navigate("consent");
            }}
            onBack={() => navigate("otp")}
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
                persistKioskSession({
                  customerId: data.customer._id,
                  customerName: data.customer.name,
                  sessionId: data.trialRoom.sessionId,
                  phone: data.customer.phone?.replace(/^\+91/, "") ?? "",
                  lang: data.customer.language ?? lang,
                  hasBodyScan: hasScan,
                });
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
                if (data.customer) {
                  for (const item of resolved) {
                    addTrialCartItem({ customerId: data.customer._id, storeId, sareeId: item._id });
                    createLook({
                      sessionId: data.trialRoom.sessionId,
                      storeId,
                      customerId: data.customer._id,
                      sareeId: item._id,
                      sareeName: item.name,
                      fabric: item.fabric,
                      price: item.price,
                      grad: item.grad,
                    });
                  }
                }
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
            onCapture={() => {
              if (customerId) {
                recordBodyScan({ customerId }).catch(() => {});
              }
              setHasBodyScan(true);
              scanEligibleRef.current = true;
              persistKioskSession({ hasBodyScan: true });
              navigate("aiProcessing");
            }}
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
            onRemoveItem={(id) => {
              setTrialItems((prev) => prev.filter((s) => s._id !== id));
              if (customerId) removeTrialCartItem({ customerId, storeId, sareeId: id });
            }}
            onAddToWardrobe={(items) => {
              if (wardrobeItems.length + items.length > CFG.maxWardrobe) {
                showToast(`Wardrobe limit (${CFG.maxWardrobe})`, "warning");
                return;
              }
              setWardrobeItems((prev) => [...prev, ...items]);
              setTrialItems((prev) =>
                prev.filter((s) => !items.some((i) => i._id === s._id))
              );
              if (customerId) {
                for (const item of items) {
                  removeTrialCartItem({ customerId, storeId, sareeId: item._id });
                }
              }
              for (const item of items) {
                addToWardrobeMut({
                  sessionId,
                  customerId: customerId ?? undefined,
                  sareeId: item._id,
                  sareeName: item.name,
                  price: item.price,
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
              if (customerId) {
                for (const item of items) {
                  addTrialCartItem({ customerId, storeId, sareeId: item._id });
                  createLook({
                    sessionId,
                    storeId,
                    customerId,
                    sareeId: item._id,
                    sareeName: item.name,
                    fabric: item.fabric,
                    price: item.price,
                    grad: item.grad,
                  });
                }
              }
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
            storeName={storeName}
            storeLogoFileId={storeData?.logoFileId}
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
              if (customerId) {
                addTrialCartItem({ customerId, storeId, sareeId: selectedProduct._id });
                createLook({
                  sessionId,
                  storeId,
                  customerId,
                  sareeId: selectedProduct._id,
                  sareeName: selectedProduct.name,
                  fabric: selectedProduct.fabric,
                  price: selectedProduct.price,
                  grad: selectedProduct.grad,
                });
              }
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
            storeName={storeName}
            storeLogoFileId={storeData?.logoFileId}
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

/* ── NEW CUSTOMER (minimal capture: name + DOB) ── */
function NewCustomerScreen({ phone, storeName, onRegistered, onBack }: {
  phone: string;
  storeName: string;
  onRegistered: (customerId: Id<"customers">, customerName: string) => void;
  onBack: () => void;
}) {
  const ensureByPhone = useMutation(api.customers.ensureByPhone);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 13);
    return d.toISOString().split("T")[0];
  })();

  const ageOk = (iso: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a >= 13 && a <= 120;
  };

  async function handleSubmit() {
    const trimmed = name.trim();
    if (trimmed.length < 2) { setError("Enter your name"); return; }
    if (!ageOk(dob)) { setError("Enter a valid date of birth (13+)"); return; }
    setError("");
    setSaving(true);
    try {
      const result = await ensureByPhone({
        phone: `+91${phone}`,
        name: trimmed,
        dateOfBirth: dob,
      });
      onRegistered(result.customerId, trimmed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create account");
    } finally {
      setSaving(false);
    }
  }

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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px", maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome to Wearify</h2>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", marginBottom: 24, textAlign: "center" }}>
          Quick setup — complete the rest later on the Wearify app.
        </p>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--k-text)", marginBottom: 6 }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="e.g. Ananya Mehta"
              style={{
                width: "100%", padding: "14px 16px", borderRadius: "var(--k-r-sm)",
                border: "1.5px solid var(--k-border)", background: "var(--k-card)",
                fontSize: 16, color: "var(--k-text)", outline: "none",
                boxSizing: "border-box", fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--k-text)", marginBottom: 6 }}>
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              max={maxDob}
              onChange={(e) => { setDob(e.target.value); setError(""); }}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: "var(--k-r-sm)",
                border: "1.5px solid var(--k-border)", background: "var(--k-card)",
                fontSize: 16, color: "var(--k-text)", outline: "none",
                boxSizing: "border-box", fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 13, color: "var(--k-red)", marginTop: 12, fontWeight: 500 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="k-press"
          style={{
            width: "100%", marginTop: 20, padding: "14px",
            borderRadius: "var(--k-r-pill)",
            background: saving ? "var(--k-border)" : "var(--k-maroon)",
            color: "#fff", fontSize: 16, fontWeight: 700, border: "none",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Creating..." : "Continue"}
        </button>

        <p style={{ fontSize: 11, color: "var(--k-text-muted)", marginTop: 16, textAlign: "center" }}>
          Your try-on history and wardrobe will be saved to your phone number.
        </p>
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
function StoreBrand({ storeName, logoFileId }: { storeName: string; logoFileId?: Id<"_storage"> }) {
  const url = useQuery(api.files.getUrl, logoFileId ? { fileId: logoFileId } : "skip");
  const initial = (storeName || "S").trim().charAt(0).toUpperCase() || "S";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, maxWidth: "50%" }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
        background: url ? "var(--k-card)" : "var(--k-maroon)",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1.5px solid var(--k-border)",
      }}>
        {url ? (
          <img src={url} alt={storeName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{initial}</span>
        )}
      </div>
      <span className="k-brand" style={{
        fontSize: 17, color: "var(--k-text)", fontWeight: 700, letterSpacing: 0.3,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {storeName}
      </span>
    </div>
  );
}

function KioskHeader({ trialCount, wardrobeCount, cartCount, goHome, triggerLogout, navigate, onBack, storeName, storeLogoFileId }: {
  trialCount: number; wardrobeCount: number; cartCount: number;
  goHome: () => void; triggerLogout: () => void;
  navigate: (s: Screen) => void; onBack?: () => void;
  storeName?: string; storeLogoFileId?: Id<"_storage">;
}) {
  const iconBtn = (onClick: () => void, emoji: string, count?: number, countBg?: string) => (
    <button onClick={onClick} className="k-press" style={{
      position: "relative", width: 44, height: 44, borderRadius: "50%",
      border: "1.5px solid var(--k-border)", background: "var(--k-card)",
      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    }}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      {count !== undefined && count > 0 && (
        <span style={{
          position: "absolute", top: -2, right: -2, background: countBg || "var(--k-maroon)",
          color: "#fff", borderRadius: "50%", width: 20, height: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700,
        }}>{count}</span>
      )}
    </button>
  );

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 24px", background: "var(--k-card)",
      borderBottom: "1px solid var(--k-border-l)", flexShrink: 0, zIndex: 40,
    }}>
      {onBack ? (
        <button onClick={onBack} className="k-press" style={{
          width: 44, height: 44, borderRadius: "50%", border: "1.5px solid var(--k-border)",
          background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}><span style={{ fontSize: 22 }}>&#8249;</span></button>
      ) : storeName ? (
        <StoreBrand storeName={storeName} logoFileId={storeLogoFileId} />
      ) : <div style={{ width: 44 }} />}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {iconBtn(() => navigate("trialRoom"), "👗", trialCount, "var(--k-gold)")}
        {iconBtn(() => navigate("wardrobe"), "👜", wardrobeCount, "var(--k-maroon)")}
        {cartCount > 0 && iconBtn(() => navigate("order"), "🛒", cartCount, "var(--k-green)")}
        {iconBtn(goHome, "🏠")}
        {iconBtn(triggerLogout, "⏻")}
      </div>
    </div>
  );
}

/* ── HOME ── */
function HomeScreen({ sarees, trialItems, wardrobeItems, onProductTap, onSendToTrial, navigate, goHome, triggerLogout, trialCount, wardrobeCount, cartCount, maxTrial, showToast, storeName, storeLogoFileId }: {
  sarees: SareeItem[]; trialItems: SareeItem[]; wardrobeItems: SareeItem[];
  onProductTap: (p: SareeItem) => void; onSendToTrial: (items: SareeItem[]) => void;
  navigate: (s: Screen) => void; goHome: () => void; triggerLogout: () => void;
  trialCount: number; wardrobeCount: number; cartCount: number; maxTrial: number;
  showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void;
  storeName?: string; storeLogoFileId?: Id<"_storage">;
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
  const trending = sarees.slice(0, 8);
  const newArrivals = [...sarees].reverse().slice(0, 8);

  // Group by occasion for categories
  const occasions = [...new Set(sarees.map((s) => s.occasion))];

  return (
    <div className="k-shell">
      <KioskHeader trialCount={trialCount} wardrobeCount={wardrobeCount} cartCount={cartCount} goHome={goHome} triggerLogout={triggerLogout} navigate={navigate} />

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        {/* Search bar */}
        <div style={{ padding: "16px 24px 8px", display: "flex", gap: 10 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 10,
            padding: "14px 18px", borderRadius: "var(--k-r)",
            border: "1.5px solid var(--k-border)", background: "var(--k-card)",
          }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, occasion, fabric..."
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 16, color: "var(--k-text)" }} />
            {query && <span onClick={() => setQuery("")} style={{ cursor: "pointer", fontSize: 18, color: "var(--k-text-muted)" }}>✕</span>}
          </div>
        </div>

        {/* Selection bar */}
        {selectedIds.size > 0 && (
          <div className="k-slideUp" style={{
            margin: "8px 24px 12px", padding: "14px 20px", borderRadius: "var(--k-r)",
            background: "linear-gradient(135deg, rgba(201,148,26,.08), rgba(242,212,212,.4))",
            border: "1.5px solid rgba(201,148,26,.3)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{selectedIds.size} saree(s) selected</span>
            <button onClick={sendToTrial} className="k-press" style={{
              padding: "10px 24px", borderRadius: "var(--k-r-pill)",
              background: "var(--k-gold)", color: "#fff", border: "none",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>Send to Trial Room</button>
          </div>
        )}

        {/* Content */}
        {filtered ? (
          <div style={{ padding: "8px 24px" }}>
            <div style={{ fontSize: 14, color: "var(--k-text-muted)", marginBottom: 12 }}>{filtered.length} results</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {filtered.map((s) => (
                <SareeCard key={s._id} saree={s} onTap={() => onProductTap(s)} onCheck={() => toggleSelect(s)}
                  isSelected={selectedIds.has(s._id)} isInTrial={isInTrial(s._id)} isInWardrobe={isInWardrobe(s._id)} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Occasion chips */}
            <div style={{ padding: "8px 24px 4px", display: "flex", gap: 8, overflowX: "auto" }}>
              {occasions.map((occ) => (
                <button key={occ} onClick={() => setQuery(occ)} className="k-press" style={{
                  padding: "8px 20px", borderRadius: "var(--k-r-pill)", whiteSpace: "nowrap",
                  background: "var(--k-card)", border: "1.5px solid var(--k-border)",
                  fontSize: 14, fontWeight: 500, cursor: "pointer", color: "var(--k-text)",
                }}>{occ}</button>
              ))}
            </div>

            <ScrollSection title="Trending Now">
              {trending.map((s) => (
                <SareeCard key={s._id} saree={s} onTap={() => onProductTap(s)} onCheck={() => toggleSelect(s)}
                  isSelected={selectedIds.has(s._id)} isInTrial={isInTrial(s._id)} isInWardrobe={isInWardrobe(s._id)} />
              ))}
            </ScrollSection>

            <ScrollSection title="New Arrivals">
              {newArrivals.map((s) => (
                <SareeCard key={s._id} saree={s} onTap={() => onProductTap(s)} onCheck={() => toggleSelect(s)}
                  isSelected={selectedIds.has(s._id)} isInTrial={isInTrial(s._id)} isInWardrobe={isInWardrobe(s._id)} />
              ))}
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
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{title}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })} className="k-press" style={{
            width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--k-border)",
            background: "var(--k-card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>‹</button>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })} className="k-press" style={{
            width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--k-border)",
            background: "var(--k-card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>›</button>
        </div>
      </div>
      <div ref={scrollRef} className="k-no-scroll" style={{
        display: "grid", gridAutoFlow: "column", gridAutoColumns: "220px",
        gap: 16, overflowX: "auto", scrollSnapType: "x mandatory",
        paddingLeft: 24, paddingRight: 24, paddingBottom: 4,
      }}>{children}</div>
    </div>
  );
}

function SareeCard({ saree, onTap, onCheck, isSelected, isInTrial, isInWardrobe }: {
  saree: SareeItem; onTap: () => void; onCheck?: () => void; isSelected: boolean; isInTrial: boolean; isInWardrobe: boolean;
}) {
  const disabled = isInTrial || isInWardrobe;
  const label = isInWardrobe ? "In Wardrobe" : isInTrial ? "In Trial" : isSelected ? "Selected" : null;
  const labelBg = isInWardrobe ? "var(--k-maroon)" : isInTrial ? "var(--k-gold)" : isSelected ? "var(--k-green)" : "";
  const discount = saree.mrp && saree.mrp > saree.price ? Math.round(((saree.mrp - saree.price) / saree.mrp) * 100) : 0;

  return (
    <div className="k-product-card" onClick={disabled ? undefined : onTap} style={{
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.75 : 1,
      position: "relative", border: isSelected ? "2.5px solid var(--k-gold)" : "1px solid var(--k-border-l)",
      scrollSnapAlign: "start", transition: "transform .15s, box-shadow .15s",
    }}>
      {/* Checkbox */}
      {onCheck && !disabled && (
        <div onClick={(e) => { e.stopPropagation(); onCheck(); }} style={{
          position: "absolute", top: 10, left: 10, zIndex: 3, width: 30, height: 30,
          borderRadius: 6, border: `2px solid ${isSelected ? "var(--k-gold)" : "rgba(255,255,255,.9)"}`,
          background: isSelected ? "var(--k-gold)" : "rgba(255,255,255,.75)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,.1)",
        }}>
          {isSelected && <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>✓</span>}
        </div>
      )}

      {/* Tag badge */}
      {saree.tag && (
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 3,
          padding: "3px 10px", borderRadius: "var(--k-r-pill)",
          background: saree.tag === "Premium" ? "var(--k-maroon)" : saree.tag === "Trending" ? "var(--k-gold)" : "var(--k-text-mid)",
          color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
        }}>{saree.tag}</div>
      )}

      {/* Image area */}
      <div className="k-silk" style={{
        position: "relative", width: "100%", paddingTop: "130%", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad} emoji={saree.emoji} emojiSize={36} />
        </div>
        {label && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, background: labelBg,
            padding: "6px 0", textAlign: "center", fontSize: 11, fontWeight: 700,
            color: "#fff", letterSpacing: "0.5px", zIndex: 2,
          }}>{label}</div>
        )}
        {discount > 0 && !label && (
          <div style={{
            position: "absolute", bottom: 8, left: 8, padding: "3px 8px",
            borderRadius: "var(--k-r-pill)", background: "var(--k-green)", color: "#fff",
            fontSize: 11, fontWeight: 700, zIndex: 2,
          }}>-{discount}%</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{saree.name}</div>
        <div style={{ fontSize: 12, color: "var(--k-text-muted)", marginBottom: 6 }}>{saree.fabric} · {saree.occasion}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="k-mono" style={{ fontSize: 16, fontWeight: 700, color: "var(--k-maroon)" }}>₹{fmtPrice(saree.price)}</span>
          {saree.mrp && saree.mrp > saree.price && (
            <span className="k-mono" style={{ fontSize: 12, color: "var(--k-text-light)", textDecoration: "line-through" }}>₹{fmtPrice(saree.mrp)}</span>
          )}
        </div>
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
  const disc = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const similar = allSarees.filter((s) => s.occasion === product.occasion && s._id !== product._id).slice(0, 6);

  return (
    <div className="k-shell">
      <KioskHeader trialCount={trialCount} wardrobeCount={wardrobeCount} cartCount={cartCount} goHome={goHome} triggerLogout={triggerLogout} navigate={navigate} onBack={onBack} />

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {/* Hero section — image left, details right */}
        <div style={{ display: "flex", padding: "24px", gap: 28, minHeight: 320 }}>
          {/* Left: product image */}
          <div className="k-silk" style={{
            width: "38%", maxWidth: 360, position: "relative", borderRadius: "var(--k-r-lg)",
            overflow: "hidden", boxShadow: "var(--k-shadow-md)", flexShrink: 0,
            minHeight: 320,
          }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <SareeThumb name={product.name} fileId={product.imageIds?.[0]} grad={product.grad} emoji={product.emoji} emojiSize={72} />
            </div>
            {/* Tag */}
            {product.tag && (
              <div style={{
                position: "absolute", top: 14, left: 14,
                padding: "4px 14px", borderRadius: "var(--k-r-pill)",
                background: product.tag === "Premium" ? "var(--k-maroon)" : "var(--k-gold)",
                color: "#fff", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
              }}>{product.tag}</div>
            )}
            {disc > 0 && (
              <div style={{
                position: "absolute", bottom: 14, left: 14,
                padding: "4px 12px", borderRadius: "var(--k-r-pill)",
                background: "var(--k-green)", color: "#fff", fontSize: 13, fontWeight: 700,
              }}>-{disc}% OFF</div>
            )}
          </div>

          {/* Right: details */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: 13, color: "var(--k-text-muted)", marginBottom: 6 }}>
              {product.occasion} · {product.fabric}{product.region ? ` · ${product.region}` : ""}
            </div>

            {/* Name */}
            <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>{product.name}</h2>

            {/* Description */}
            {product.description && (
              <p style={{ fontSize: 15, color: "var(--k-text-mid)", lineHeight: 1.6, marginBottom: 16 }}>{product.description}</p>
            )}

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
              <span className="k-mono" style={{ fontSize: 28, fontWeight: 700, color: "var(--k-maroon)" }}>₹{fmtPrice(product.price)}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="k-mono" style={{ fontSize: 16, color: "var(--k-text-light)", textDecoration: "line-through" }}>₹{fmtPrice(product.mrp)}</span>
              )}
              {disc > 0 && (
                <span style={{ padding: "2px 10px", borderRadius: "var(--k-r-pill)", background: "var(--k-green-bg)", color: "var(--k-green)", fontSize: 13, fontWeight: 600 }}>Save ₹{fmtPrice(product.mrp! - product.price)}</span>
              )}
            </div>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Available Colors</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {product.colors.map((c, i) => (
                    <div key={i} onClick={() => setSelColor(i)} style={{
                      width: 32, height: 32, borderRadius: "50%", background: c, cursor: "pointer",
                      border: i === selColor ? "3px solid var(--k-maroon)" : "2px solid var(--k-border)",
                      boxShadow: i === selColor ? "0 0 0 2px rgba(107,26,26,.2)" : "none",
                      transition: "all .15s",
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Details chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {[product.fabric, product.occasion, product.type, product.region].filter(Boolean).map((tag, i) => (
                <span key={i} style={{
                  padding: "6px 14px", borderRadius: "var(--k-r-pill)",
                  background: "var(--k-bg-warm)", fontSize: 12, fontWeight: 500, color: "var(--k-text-mid)",
                }}>{tag}</span>
              ))}
            </div>

            {/* CTA */}
            <button onClick={onAddToTrial} disabled={isInTrial || isInWardrobe} className="k-press" style={{
              width: "100%", maxWidth: 360, padding: "16px 24px", borderRadius: "var(--k-r-pill)",
              background: isInTrial || isInWardrobe ? "var(--k-border)" : "var(--k-maroon)",
              color: "#fff", border: "none", fontSize: 18, fontWeight: 700, cursor: "pointer",
              boxShadow: isInTrial || isInWardrobe ? "none" : "0 4px 16px rgba(107,26,26,.3)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>{isInWardrobe ? "👜" : isInTrial ? "👗" : "✨"}</span>
              {isInWardrobe ? "Already in Wardrobe" : isInTrial ? "Already in Trial Room" : "Add to Trial Room"}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--k-border-l)", margin: "8px 24px 16px" }} />

        {/* Similar sarees */}
        {similar.length > 0 && (
          <ScrollSection title="You May Also Like">
            {similar.map((s) => (
              <SareeCard key={s._id} saree={s} onTap={() => onProductTap(s)} isSelected={false} isInTrial={false} isInWardrobe={false} />
            ))}
          </ScrollSection>
        )}
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

  if (items.length === 0) return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 64 }}>👗</span>
      <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--k-text-muted)", marginTop: 16 }}>Trial Room Empty</h2>
      <button onClick={onGoHome} className="k-press" style={{ marginTop: 20, padding: "16px 36px", borderRadius: "var(--k-r-pill)", background: "var(--k-maroon)", color: "#fff", border: "none", fontSize: 18, fontWeight: 600, cursor: "pointer" }}>Browse Sarees</button>
    </div>
  );

  return (
    <div className="k-shell" style={{ position: "relative", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px",
        background: "linear-gradient(180deg, rgba(245,240,234,.95), transparent)",
      }}>
        <button onClick={onGoHome} className="k-press" style={{
          width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.85)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          border: "none", boxShadow: "var(--k-shadow)",
        }}><span style={{ fontSize: 22 }}>🏠</span></button>
        <div className="k-timer" style={{ padding: "10px 24px", fontSize: 20, fontWeight: 700 }}>
          <span style={{ color: timer <= 30 ? "var(--k-red)" : "var(--k-text)" }}>
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </span>
        </div>
        <button onClick={onLogout} className="k-press" style={{
          width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.85)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          border: "none", boxShadow: "var(--k-shadow)",
        }}><span style={{ fontSize: 22 }}>⏻</span></button>
      </div>

      <div style={{ display: "flex", width: "100%", height: "100vh", paddingTop: 72 }}>
        {/* LEFT panel — saree list */}
        <div style={{
          width: "28%", minWidth: 280, height: "100%", overflowY: "auto",
          padding: "12px 10px", paddingBottom: 80,
          background: "rgba(0,0,0,.03)", borderRight: "1px solid var(--k-border)",
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, padding: "6px 8px", marginBottom: 10 }}>
            Trial Room ({items.length}/{maxTrial})
          </div>
          {items.map((saree, idx) => {
            const active = idx === selIdx;
            const selW = selForWard.has(saree._id);
            return (
              <div key={saree._id} onClick={() => setSelIdx(idx)} style={{
                display: "flex", gap: 10, padding: "12px 10px", marginBottom: 8,
                borderRadius: "var(--k-r-sm)", cursor: "pointer", position: "relative",
                background: active ? "rgba(242,212,212,.4)" : "var(--k-card)",
                border: active ? "2.5px solid var(--k-maroon)" : "1.5px solid var(--k-border)",
                transition: "all .15s",
              }}>
                {/* Checkbox — large touch target */}
                <div onClick={(e) => { e.stopPropagation(); toggleWard(saree._id); }} style={{
                  width: 32, height: 32, borderRadius: 6, flexShrink: 0, alignSelf: "center",
                  border: `2px solid ${selW ? "var(--k-green)" : "var(--k-text-light)"}`,
                  background: selW ? "var(--k-green)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                  {selW && <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>✓</span>}
                </div>
                {/* Thumbnail */}
                <div style={{
                  width: 56, height: 56, borderRadius: "var(--k-r-sm)", flexShrink: 0,
                  overflow: "hidden",
                }}>
                  <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad} emoji={saree.emoji} emojiSize={22} gradientAngle={135} />
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{saree.name}</div>
                  <div className="k-mono" style={{ fontSize: 13, color: "var(--k-maroon)", fontWeight: 600 }}>₹{fmtPrice(saree.price)}</div>
                </div>
                {/* Remove button — bigger touch target */}
                <button onClick={(e) => { e.stopPropagation(); onRemoveItem(saree._id); }} style={{
                  width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
                  background: "var(--k-red-bg)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: "var(--k-red)", fontWeight: 700, flexShrink: 0, alignSelf: "center",
                }}>✕</button>
              </div>
            );
          })}
          {selForWard.size > 0 && (
            <button onClick={moveToWardrobe} className="k-press" style={{
              width: "100%", padding: "14px", borderRadius: "var(--k-r-pill)", marginTop: 12,
              background: "var(--k-maroon)", color: "#fff", border: "none",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}>
              Add to Wardrobe ({selForWard.size})
            </button>
          )}
        </div>

        {/* RIGHT panel — preview */}
        <div style={{ flex: 1, position: "relative", height: "100%" }}>
          {current && (
            <div style={{ position: "absolute", inset: 0 }}>
              <SareeThumb name={current.name} fileId={current.imageIds?.[0]} grad={current.grad} emoji={current.emoji} emojiSize={120} gradientAngle={135} />
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(245,240,234,.9) 90%)" }} />
          {current && (
            <div style={{
              position: "absolute", bottom: 80, right: 24, width: "50%", maxWidth: 480,
              background: "rgba(255,255,255,.92)", backdropFilter: "blur(12px)",
              borderRadius: "var(--k-r-lg)", padding: "20px 24px", boxShadow: "var(--k-shadow-lg)",
            }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{current.name}</div>
              <div className="k-mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--k-maroon)", marginTop: 4 }}>₹{fmtPrice(current.price)}</div>
              {current.description && <div style={{ fontSize: 14, color: "var(--k-text-muted)", marginTop: 6, lineHeight: 1.5 }}>{current.description}</div>}
              <div style={{ fontSize: 12, color: "var(--k-text-light)", marginTop: 8 }}>{current.fabric} · {current.occasion}</div>
            </div>
          )}
        </div>
      </div>

      {/* Time's up dialog */}
      {showEnd && (
        <div className="k-overlay">
          <div className="k-modal k-scaleIn" style={{ maxWidth: 400 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Time&apos;s Up!</h3>
            <p style={{ fontSize: 15, color: "var(--k-text-muted)", marginBottom: 20 }}>Session ending. Continue or logout?</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onLogout} className="k-press" style={{
                flex: 1, padding: 16, borderRadius: "var(--k-r-pill)",
                background: "var(--k-red)", color: "#fff", border: "none",
                fontSize: 16, fontWeight: 600, cursor: "pointer",
              }}>Logout</button>
              <button onClick={() => { setTimer((v) => v + 60); setShowEnd(false); }} className="k-press" style={{
                flex: 1, padding: 16, borderRadius: "var(--k-r-pill)",
                background: "transparent", border: "1.5px solid var(--k-border)",
                fontSize: 16, fontWeight: 600, cursor: "pointer",
              }}>Continue (+1 min)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── WARDROBE ── */
function WardrobeScreen({ items, onMoveToCart, navigate, goHome, triggerLogout, trialCount, wardrobeCount, cartCount, maxWardrobe, showToast, storeName, storeLogoFileId }: {
  items: SareeItem[]; onMoveToCart: (items: SareeItem[]) => void;
  navigate: (s: Screen) => void; goHome: () => void; triggerLogout: () => void;
  trialCount: number; wardrobeCount: number; cartCount: number; maxWardrobe: number;
  showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void;
  storeName?: string; storeLogoFileId?: Id<"_storage">;
}) {
  const [selForCart, setSelForCart] = useState<Set<string>>(new Set());
  const toggleSel = (id: string) => { setSelForCart((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
  const moveToCart = () => { const sel = items.filter((s) => selForCart.has(s._id)); if (sel.length === 0) { showToast("Select sarees first", "warning"); return; } onMoveToCart(sel); setSelForCart(new Set()); };
  return (
    <div className="k-shell">
      <KioskHeader trialCount={trialCount} wardrobeCount={wardrobeCount} cartCount={cartCount} goHome={goHome} triggerLogout={triggerLogout} navigate={navigate} storeName={storeName} storeLogoFileId={storeLogoFileId} />
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
              const selC = selForCart.has(saree._id);
              return (
                <div key={saree._id} className="k-product-card" style={{ border: selC ? "2px solid var(--k-green)" : undefined }}>
                  <div style={{ position: "relative", width: "100%", paddingTop: "120%", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0 }}>
                      <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad} emoji={saree.emoji} emojiSize={32} gradientAngle={135} />
                    </div>
                  </div>
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
      {/* Header */}
      <div className="k-topbar" style={{ padding: "16px 24px" }}>
        <button onClick={onBack} className="k-press" style={{
          width: 44, height: 44, borderRadius: "50%", border: "1.5px solid var(--k-border)",
          background: "var(--k-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}><span style={{ fontSize: 20 }}>&#8249;</span></button>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Your Cart</div>
        <div style={{ fontSize: 14, color: "var(--k-text-muted)" }}>{cart.length} {cart.length === 1 ? "item" : "items"}</div>
      </div>

      {/* Content — centered column layout */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 24px", paddingBottom: 24 }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          {/* Cart items */}
          {cart.map((item, idx) => {
            return (
              <div key={idx} className="k-slideUp" style={{
                display: "flex", gap: 16, padding: "16px", background: "var(--k-card)",
                borderRadius: "var(--k-r)", boxShadow: "var(--k-shadow)", marginBottom: 12, alignItems: "center",
                border: "1px solid var(--k-border-l)",
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: 64, height: 64, borderRadius: "var(--k-r-sm)", flexShrink: 0, overflow: "hidden",
                }}>
                  <SareeThumb name={item.name} fileId={item.imageIds?.[0]} grad={item.grad} emoji={item.emoji} emojiSize={28} gradientAngle={135} />
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "var(--k-text-muted)", marginTop: 2 }}>{item.fabric} · {item.occasion}</div>
                  <div className="k-mono" style={{ fontSize: 16, color: "var(--k-maroon)", fontWeight: 700, marginTop: 4 }}>₹{fmtPrice(item.price)}</div>
                </div>
                {/* Qty controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => updateQty(idx, -1)} className="k-press" style={{
                    width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--k-border)",
                    background: "var(--k-card)", cursor: "pointer", fontSize: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>−</button>
                  <span className="k-mono" style={{ fontSize: 18, fontWeight: 700, minWidth: 28, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateQty(idx, 1)} className="k-press" style={{
                    width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--k-border)",
                    background: "var(--k-card)", cursor: "pointer", fontSize: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>+</button>
                </div>
                {/* Remove */}
                <button onClick={() => removeItem(idx)} className="k-press" style={{
                  width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
                  background: "var(--k-red-bg)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: "var(--k-red)", fontWeight: 700,
                }}>✕</button>
              </div>
            );
          })}

          {/* Receipt */}
          <div style={{
            background: "var(--k-card)", borderRadius: "var(--k-r-lg)",
            padding: "24px", marginTop: 8, boxShadow: "var(--k-shadow-md)",
            border: "1px solid var(--k-border-l)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, marginBottom: 8 }}>
              <span style={{ color: "var(--k-text-muted)" }}>Subtotal</span>
              <span className="k-mono" style={{ fontWeight: 600 }}>₹{fmtPrice(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, marginBottom: 12 }}>
              <span style={{ color: "var(--k-text-muted)" }}>GST</span>
              <span className="k-mono" style={{ fontWeight: 600 }}>₹{fmtPrice(Math.round(gst))}</span>
            </div>
            <div style={{ height: 1, background: "var(--k-border)", marginBottom: 12 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 700, color: "var(--k-maroon)" }}>
              <span>Total</span>
              <span className="k-mono">₹{fmtPrice(Math.round(subtotal + gst))}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--k-text-muted)", fontStyle: "italic", marginTop: 6 }}>Prices indicative. Final at counter.</div>
          </div>

          {/* Actions */}
          {!showQR ? (
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={async () => { await onCheckout(); setShowQR(true); }} className="k-press" style={{
                flex: 1, padding: 18, borderRadius: "var(--k-r-pill)",
                background: "var(--k-maroon)", color: "#fff", border: "none",
                fontSize: 18, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(107,26,26,.3)",
              }}>Checkout</button>
              <button onClick={onFindTailor} className="k-press" style={{
                padding: "18px 28px", borderRadius: "var(--k-r-pill)",
                background: "var(--k-card)", border: "1.5px solid var(--k-border)",
                fontSize: 16, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}>✂️ Find Tailor</button>
            </div>
          ) : (
            <div className="k-slideUp" style={{ textAlign: "center", marginTop: 24 }}>
              <div style={{
                width: 200, height: 200, margin: "0 auto 12px",
                background: "var(--k-card)", borderRadius: "var(--k-r-lg)",
                boxShadow: "var(--k-shadow-md)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 64, border: "1px solid var(--k-border-l)",
              }}>📱</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Show to Store Team</div>
              <div className="k-mono" style={{ fontSize: 16, color: "var(--k-text-muted)" }}>
                Expires in {Math.floor(qrExp / 60)}:{String(qrExp % 60).padStart(2, "0")}
              </div>
            </div>
          )}
        </div>
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
