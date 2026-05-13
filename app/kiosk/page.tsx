"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SareeThumb } from "@/components/SareeThumb";
import { SareeImageGallery } from "@/components/SareeImageGallery";
import { useConvexUrl } from "@/lib/ConvexImage";
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowRight,
  Check, X, Search, Home, LogOut, Phone, Hash, Camera, Lock,
  Shirt, ShoppingBag, ShoppingCart, Sparkles, Scissors, Star, QrCode,
  Minus, Plus, Delete, Loader2, ShieldCheck, Eye, SlidersHorizontal, Heart, Trash2, Upload,
  Users, MapPin,
} from "lucide-react";
import { useUploadFile } from "@/lib/useUpload";
import { GUARDS } from "@/lib/uploadGuards";
import { cancelBgRemoval, clearBgRemovalState, enqueueBgRemoval, useBgRemovalStatus } from "@/lib/bgRemovalQueue";
import { ScanChoiceScreen } from "./screens/ScanChoiceScreen";
import { ConsentScreen } from "./screens/ConsentScreen";
import { BodyScanScreen } from "./screens/BodyScanScreen";
import { AIProcessingScreen } from "./screens/AIProcessingScreen";
import { FeedbackScreen } from "./screens/FeedbackScreen";
import { DataSaveScreen } from "./screens/DataSaveScreen";
import { SessionEndScreen } from "./screens/SessionEndScreen";
import { TailorDetailModal } from "./screens/TailorDetailModal";

/* ═══ CONFIG ═══ */
const CFG = {
  maxTrial: 5,
  maxWardrobe: 10,
  tryOnSec: 240, // 4-minute trial-room countdown
  trialEndAutoLogoutSec: 180, // 3-min grace on the "Time's Up" popup before auto-logout
  trialEndContinueSec: 120, // "Continue" button adds 2 minutes
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

// Try-on error prefix → user-facing toast text.
// Action throws strings prefixed with `<CODE>:` so we can pattern-match
// without parsing free-form errors. See spec §"UX states" §"Synchronous
// error toasts".
const TRYON_TOAST: Array<{ prefix: string; text: string; type: "warning" | "error" | "info" }> = [
  { prefix: "CONCURRENCY_LIMIT:", text: "Wait for current renders to finish", type: "info" },
  { prefix: "SESSION_CAP_REACHED:", text: "You've reached this session's try-on limit", type: "warning" },
  { prefix: "RATE_LIMIT_MINUTE:", text: "Too many try-ons just now — wait a moment", type: "warning" },
  { prefix: "RATE_LIMIT_HOUR:", text: "Too many try-ons recently", type: "warning" },
  { prefix: "TRYON_DISABLED:", text: "Try-on is temporarily unavailable", type: "warning" },
  { prefix: "NO_BODY_SCAN:", text: "Please complete a body scan first", type: "warning" },
  { prefix: "UNAUTHORIZED:", text: "Session error — restart kiosk", type: "error" },
];

function handleTryOnError(
  err: Error,
  showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void,
  onNoBodyScan?: () => void,
): void {
  const msg = err.message ?? String(err);
  if (msg.includes("NO_BODY_SCAN:") && onNoBodyScan) {
    showToast("Please complete a body scan first", "warning");
    onNoBodyScan();
    return;
  }
  for (const { prefix, text, type } of TRYON_TOAST) {
    if (msg.includes(prefix)) {
      showToast(text, type);
      return;
    }
  }
  showToast("Something went wrong — try again", "error");
}

/* ═══ MAIN KIOSK PAGE ═══ */
export default function KioskPage() {
  const router = useRouter();

  // Store config
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  // Device token — minted by /kiosk/setup via kioskPairing.consumePairingCode.
  // Passed to every guarded mutation; if the server rejects it (revoked),
  // we wipe localStorage and bounce back to /kiosk/setup.
  const [deviceToken, setDeviceToken] = useState("");

  // Screen routing
  const [screen, setScreen] = useState<Screen>("idle");
  const historyRef = useRef<Screen[]>([]);

  // Session / Trial room
  const [trialData, setTrialData] = useState<TrialRoomData | null>(null);
  const [customerId, setCustomerId] = useState<Id<"customers"> | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [hasBodyScan, setHasBodyScan] = useState(false);

  // Webcam stream lives at the page level so ConsentScreen can open it
  // (on Allow) and BodyScanScreen can consume it, and so cleanup is
  // owned in one place — stopped on capture, Skip, wipe, or unmount.
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  // Front ("user") or back ("environment") camera. Persists across the
  // switch so the same direction is requested when the consent flow
  // re-opens the camera in a future session.
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");

  // Language
  const [lang, setLang] = useState("en");

  // Trial room items (sarees from tablet shortlist)
  const [trialItems, setTrialItems] = useState<SareeItem[]>([]);

  // Shortlisted items from the tablet (only populated when the customer
  // entered via store code — codeEntry path). Renders as a "Shortlisted"
  // ScrollSection above Trending on the kiosk home screen.
  const [shortlistedItems, setShortlistedItems] = useState<SareeItem[]>([]);

  // Maps sareeId → lookId so TrialTile can subscribe reactively.
  // Populated as each runTryOn resolves; cleared on session wipe.
  const [sareeLookIds, setSareeLookIds] = useState<Record<string, Id<"looks">>>({});

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

  // Tracks sareeIds with an in-flight runTryOn fired by the reconciliation
  // effect below. Prevents the effect from double-firing while a promise is
  // pending — without this, every re-render that doesn't yet have the lookId
  // mapped would queue another action call.
  const inFlightTryOnRef = useRef<Set<string>>(new Set());

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"info" | "success" | "error" | "warning">("info");
  const [toastVisible, setToastVisible] = useState(false);

  // Mutations
  const markCodeUsed = useMutation(api.trialRoom.markCodeUsed);
  const createSessionMut = useMutation(api.sessionOps.createSession);
  const verifyOtpMut = useMutation(api.phoneAuth.verifyOtp);
  const addToWardrobeMut = useMutation(api.sessionOps.addToWardrobe);
  const removeFromWardrobeMut = useMutation(api.sessionOps.removeFromWardrobe);
  const runTryOn = useAction(api.tryOn.runTryOn);
  const retryLookMut = useAction(api.tryOn.retryLook);
  const createOrder = useMutation(api.sessionOps.createOrder);
  const endSessionMut = useMutation(api.sessionOps.endSession);
  const updateSessionMut = useMutation(api.sessionOps.updateSession);
  const recordBodyScan = useMutation(api.customers.recordBodyScan);
  const { upload } = useUploadFile();
  const addCartItem = useMutation(api.sessionOps.addCartItem);
  const updateCartQtyMut = useMutation(api.sessionOps.updateCartQty);
  const removeCartItemMut = useMutation(api.sessionOps.removeCartItem);
  const clearCartMut = useMutation(api.sessionOps.clearCart);

  // Fan-out state: set to true when the user chooses "Retake + refresh".
  // Lives in the parent so the useEffect (below showToast) can access
  // retryLookMut, trialItems, sareeLookIds, and deviceToken directly —
  // no prop-drilling of callback.
  const [pendingFanOut, setPendingFanOut] = useState(false);
  const bodyScanInfo = useQuery(
    api.customers.getBodyScanInfo,
    customerId ? { customerId } : "skip",
  );

  // Cached AI renders for the current trial cart — keyed sareeId → lookId,
  // returned only for completed looks whose personFileId matches the
  // customer's current bodyScanFileId. Used by the reconciliation effect
  // below to skip a fresh runTryOn (and the cost of a fresh RunPod render)
  // when a reusable look already exists. A rescan / retake invalidates
  // automatically because the customer's bodyScanFileId changes.
  const cachedLooksForTrial = useQuery(
    api.tryOn.getCachedLooksForSarees,
    customerId && trialItems.length > 0
      ? { customerId, sareeIds: trialItems.map((t) => t._id) }
      : "skip",
  );
  // Holds the scan ts that was current when the fan-out was armed.
  // null = not yet armed; any number = the baseline to compare against.
  const previousScanTs = useRef<number | null>(null);

  // Load config
  useEffect(() => {
    const stored = localStorage.getItem("wearify_kiosk_store");
    if (stored) {
      try {
        const cfg = JSON.parse(stored);
        // Legacy configs without deviceToken are treated as unpaired —
        // bounce to setup so the technician pairs via the real flow.
        if (!cfg.deviceToken) {
          localStorage.removeItem("wearify_kiosk_store");
          router.push("/kiosk/setup");
          return;
        }
        setStoreId(cfg.storeId);
        setStoreName(cfg.storeName);
        setDeviceToken(cfg.deviceToken);
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

  // Shortlisted-rail persistence — sessionId-keyed so a stale entry from a
  // previous customer's pairing won't surface for the next pairing.
  // autoTrialDone prevents re-firing the first-2 auto-trial on mid-session
  // page refresh.
  const persistShortlisted = useCallback(
    (record: { sessionId: string; sareeIds: Id<"sarees">[]; autoTrialDone: boolean }) => {
      try {
        localStorage.setItem("wearify_kiosk_shortlisted", JSON.stringify(record));
      } catch { /* ignore quota errors */ }
    },
    [],
  );

  const readShortlistedRecord = useCallback(():
    | { sessionId: string; sareeIds: Id<"sarees">[]; autoTrialDone: boolean }
    | null => {
    try {
      const raw = localStorage.getItem("wearify_kiosk_shortlisted");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.sessionId !== "string") return null;
      if (!Array.isArray(parsed?.sareeIds)) return null;
      return parsed as {
        sessionId: string;
        sareeIds: Id<"sarees">[];
        autoTrialDone: boolean;
      };
    } catch {
      return null;
    }
  }, []);

  // 5-minute inactivity auto-logout. Also listens to keydown (forms) and
  // touchmove (scrolling) so a legitimately-engaged customer isn't wiped
  // mid-flow. handleWipe clears local state + wearify_kiosk_session so
  // the next customer on this shared mirror doesn't inherit PII.
  const lastActivity = useRef(Date.now());
  useEffect(() => {
    const handler = () => { lastActivity.current = Date.now(); };
    window.addEventListener("touchstart", handler);
    window.addEventListener("touchmove", handler);
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", handler);
    const interval = setInterval(() => {
      if (screen !== "idle" && screen !== "sessionEnd") {
        if (Date.now() - lastActivity.current > CFG.inactivitySec * 1000) {
          handleWipe();
        }
      }
    }, 10000);
    return () => {
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("touchmove", handler);
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", handler);
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

  // Fan-out effect: fires retryLook with useLatestBodyScan=true for every
  // trial look once the customer records a new body scan. Gated on
  // bodyScanInfo.ts changing from the value that was snapshotted when the
  // user clicked "Retake + refresh" — so cancelling mid-scan flow leaves
  // pendingFanOut=true but the effect never fires (ts didn't change).
  useEffect(() => {
    if (!pendingFanOut) return;

    // First render after arming: snapshot the current ts so we can detect
    // a change in subsequent renders. Do NOT fire the fan-out yet.
    if (previousScanTs.current === null) {
      // bodyScanInfo may still be undefined (query loading); treat null/undefined
      // as "no existing scan" and store -1 as the baseline so any real ts will differ.
      previousScanTs.current = bodyScanInfo?.ts ?? -1;
      return;
    }

    // No new scan yet — ts unchanged or query still loading.
    if (!bodyScanInfo?.ts) return;
    if (bodyScanInfo.ts === previousScanTs.current) return;

    // The scan ts changed — a fresh scan was recorded after the flag was set.
    previousScanTs.current = null;

    // Fan-out: retry all looks that have a lookId (completed or failed).
    // Skipping queued/processing entries avoids double-submitting jobs that
    // are already in-flight with the old scan. Failed entries are included
    // because they would benefit from a fresh scan just as much as completed ones.
    const lookIdsToRetry = trialItems
      .map((s) => sareeLookIds[s._id])
      .filter(Boolean) as Id<"looks">[];
    for (const lookId of lookIdsToRetry) {
      retryLookMut({ deviceToken, lookId, useLatestBodyScan: true })
        .catch((err: Error) => handleTryOnError(err, showToast));
    }
    setPendingFanOut(false);
  // trialItems and sareeLookIds are captured at effect-run time; including
  // them as deps is correct — if the list changes before the scan comes in
  // we want the latest list when the effect finally fires.
  }, [pendingFanOut, bodyScanInfo, trialItems, sareeLookIds, retryLookMut, deviceToken, showToast]);

  // Reconciliation effect — for each trialItem missing a lookId in
  // sareeLookIds, either reuse a cached render (cachedLooksForTrial)
  // or fire runTryOn. Covers three flows:
  //   1. Items added to trialItems BEFORE a body scan: the call-site
  //      runTryOn throws NO_BODY_SCAN: server-side, no looks row gets
  //      inserted, sareeLookIds stays empty — TrialTile would otherwise
  //      stay on "Preparing…" forever after the eventual scan completes.
  //   2. Retention-hydrated trial cart items on a returning customer:
  //      hydration restores trialItems but not sareeLookIds. With cached
  //      renders available, no RunPod cost is paid for items the customer
  //      already had rendered against the same body scan.
  //   3. Same-session re-add of a previously rendered saree (e.g. via
  //      wardrobe → cart → trial): the cache returns the existing lookId,
  //      so no duplicate render fires.
  // Cache resolution gate: wait for cachedLooksForTrial to settle before
  // deciding what to fire — without this, the effect could race the cache
  // resolve and submit a fresh RunPod job for an item we'd otherwise reuse.
  // Server-side dedup at _findExistingLook still catches concurrent fires
  // for cache misses, so a fresh runTryOn is safe.
  useEffect(() => {
    if (!customerId) return;
    if (!sessionId) return;
    if (!deviceToken) return;
    if (!bodyScanInfo?.hasFileId) return;
    if (cachedLooksForTrial === undefined) return;
    for (const item of trialItems) {
      if (sareeLookIds[item._id]) continue;
      const cachedLookId = cachedLooksForTrial[item._id];
      if (cachedLookId) {
        // Cache hit — reuse the existing completed look. The TrialTile
        // for this saree subscribes via getLook(lookId) and renders the
        // stored AI image directly. No RunPod call.
        setSareeLookIds((prev) => ({ ...prev, [item._id]: cachedLookId }));
        continue;
      }
      if (inFlightTryOnRef.current.has(item._id)) continue;
      const sareeId = item._id;
      inFlightTryOnRef.current.add(sareeId);
      runTryOn({ deviceToken, sessionId, sareeId })
        .then((res) => {
          inFlightTryOnRef.current.delete(sareeId);
          setSareeLookIds((prev) => ({ ...prev, [sareeId]: res.lookId }));
        })
        .catch((err: Error) => {
          inFlightTryOnRef.current.delete(sareeId);
          handleTryOnError(err, showToast);
        });
    }
  }, [customerId, sessionId, deviceToken, bodyScanInfo?.hasFileId, trialItems, sareeLookIds, cachedLooksForTrial, runTryOn, showToast]);

  // Stop every track on the current webcam stream and clear the ref.
  // Safe to call even if the stream was already stopped.
  const stopCamera = useCallback(() => {
    setCameraStream((prev) => {
      if (prev) prev.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  // Triggered by ConsentScreen's "Allow" button. Asks the browser for
  // webcam access; on success we cache the stream and advance to the
  // body-scan screen, which renders it as a live <video>. On denial or
  // missing hardware we stay on the consent modal and surface a toast so
  // the user can either retry or hit Skip.
  const handleAllowCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      showToast("Camera is not supported on this device.", "error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      navigate("bodyScan");
    } catch (err) {
      const name = (err as { name?: string })?.name;
      const msg =
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "Camera access denied. Tap Skip to continue without a scan."
          : "Could not open the camera. Check your device and try again.";
      showToast(msg, "error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast, cameraFacing]);

  // Swap front/back camera mid-session. Stops the current stream first
  // so the OS releases the device, then re-acquires with the opposite
  // facingMode. Falls back to the original direction if the new one
  // isn't available (e.g. kiosk display with only one camera).
  const handleSwitchCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
    const next: "user" | "environment" = cameraFacing === "user" ? "environment" : "user";
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      setCameraFacing(next);
    } catch {
      // Re-acquire the previous direction so the user isn't left with no preview.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        setCameraStream(stream);
      } catch { /* nothing else to try */ }
      showToast("Other camera is not available on this device.", "warning");
    }
  }, [cameraFacing, cameraStream, showToast]);

  const handleWipe = useCallback(() => {
    setTrialData(null);
    setCustomerId(null);
    setCustomerName("");
    setSessionId("");
    setPhone("");
    setHasBodyScan(false);
    setTrialItems([]);
    setShortlistedItems([]);
    setSareeLookIds({});
    setWardrobeItems([]);
    setCartItems([]);
    setSelectedProduct(null);
    historyRef.current = [];
    returningRef.current = false;
    scanEligibleRef.current = false;
    hydratedRef.current = null;
    shortlistHydratedRef.current = null;
    // Clear fan-out flag so a stale pendingFanOut from a previous session
    // doesn't accidentally fire during the next customer's session.
    setPendingFanOut(false);
    previousScanTs.current = null;
    inFlightTryOnRef.current.clear();
    // Drop any pending bg-removal jobs and stale per-look statuses from
    // the queue's module-level state. Long-running kiosk tabs serve many
    // customers; without this the `states` map grows unboundedly across
    // the day. The WASM model itself stays warm — only the bookkeeping
    // resets.
    clearBgRemovalState();
    stopCamera();
    try { localStorage.removeItem("wearify_kiosk_session"); } catch { /* ignore */ }
    try { localStorage.removeItem("wearify_kiosk_shortlisted"); } catch { /* ignore */ }
    setScreen("sessionEnd");
  }, [stopCamera]);

  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const triggerLogout = useCallback(() => {
    setShowSavePrompt(true);
  }, []);

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

  // Persistent retention — load the customer's wardrobe + cart for THIS store.
  // Hydrates local state once `customerId`, `storeId`, and `allSarees` are all ready.
  // Trial items are NOT persisted — they live only in React state for the session.
  const savedWardrobe = useQuery(
    api.sessionOps.listWardrobeByCustomer,
    customerId ? { customerId } : "skip",
  );
  const savedCart = useQuery(
    api.sessionOps.listCart,
    customerId && storeId ? { customerId, storeId } : "skip",
  );
  // Reactive sareeId → AI-render fileId map for the wardrobe screen.
  // listWardrobeByCustomer surfaces lookImageFileId per row when the
  // wardrobe item is bound to a completed look. The screen renders this
  // in preference to the catalog photo.
  const wardrobeLookImages = React.useMemo(() => {
    const m: Record<string, Id<"_storage">> = {};
    if (savedWardrobe) {
      for (const w of savedWardrobe) {
        const fid = (w as { lookImageFileId?: Id<"_storage"> }).lookImageFileId;
        if (fid) m[w.sareeId] = fid;
      }
    }
    return m;
  }, [savedWardrobe]);
  // Parallel sareeId → bg-removed cutout fileId map. Same shape as
  // wardrobeLookImages but reads the new `lookImageNoBgFileId` field.
  // Only the kiosk WardrobeScreen consumes this; the customer PWA
  // /c/wardrobe deliberately ignores it (keeps showing the AI render
  // with its original RunPod backdrop).
  const wardrobeLookCutouts = React.useMemo(() => {
    const m: Record<string, Id<"_storage">> = {};
    if (savedWardrobe) {
      for (const w of savedWardrobe) {
        const fid = (w as { lookImageNoBgFileId?: Id<"_storage"> }).lookImageNoBgFileId;
        if (fid) m[w.sareeId] = fid;
      }
    }
    return m;
  }, [savedWardrobe]);
  const hydratedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!customerId || !storeId || !allSarees) return;
    if (savedWardrobe === undefined || savedCart === undefined) return;
    const key = `${customerId}:${storeId}`;
    if (hydratedRef.current === key) return;
    hydratedRef.current = key;
    const sareeMap = new Map(allSarees.map((s) => [s._id, s] as const));
    // Dedup *within* the hydrated lists too, not just against prev.
    // The server can hold multiple wardrobe rows for the same saree
    // (one per session that added it) — naive flatMap would produce
    // duplicate _id entries and trigger the "same key" React warning.
    const uniqBySareeId = <T extends { _id: string }>(items: T[]) => {
      const seen = new Set<string>();
      const out: T[] = [];
      for (const item of items) {
        if (seen.has(item._id)) continue;
        seen.add(item._id);
        out.push(item);
      }
      return out;
    };
    const wardrobeForStore = uniqBySareeId(
      savedWardrobe
        .filter((w) => w.storeId === storeId)
        .map((w) => sareeMap.get(w.sareeId))
        .filter(Boolean) as SareeItem[]
    );
    const cartForStore = uniqBySareeId(
      savedCart
        .map((c) => {
          const saree = sareeMap.get(c.sareeId);
          return saree ? { ...saree, qty: c.qty } : null;
        })
        .filter(Boolean) as Array<SareeItem & { qty: number }>
    );
    setWardrobeItems((prev) => {
      const have = new Set(prev.map((s) => s._id));
      return [...prev, ...wardrobeForStore.filter((s) => !have.has(s._id))];
    });
    setCartItems((prev) => {
      const have = new Set(prev.map((s) => s._id));
      return [...prev, ...cartForStore.filter((s) => !have.has(s._id))];
    });
  }, [customerId, storeId, allSarees, savedWardrobe, savedCart]);

  // Restore the Shortlisted rail across browser refresh. Keyed on sessionId
  // so a stale localStorage entry from a previous customer's pairing won't
  // surface for the next pairing — sessionId-mismatch is a no-op.
  // The shortlistedItems.length === 0 guard prevents re-hydrating on top of
  // fresh state set by the codeEntry handler in the same render cycle.
  const shortlistHydratedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sessionId || !allSarees) return;
    if (shortlistedItems.length > 0) return;
    if (shortlistHydratedRef.current === sessionId) return;
    const record = readShortlistedRecord();
    if (!record || record.sessionId !== sessionId) return;
    const sareeMap = new Map(allSarees.map((s) => [s._id, s] as const));
    const restored = record.sareeIds
      .map((id) => sareeMap.get(id))
      .filter(Boolean) as SareeItem[];
    if (restored.length > 0) {
      setShortlistedItems(restored);
      shortlistHydratedRef.current = sessionId;
    }
  }, [sessionId, allSarees, shortlistedItems.length, readShortlistedRecord]);

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
            onSelect={(c) => setLang(c)}
            onNext={() => navigate("modeSelect")}
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
            storeLogoFileId={storeData?.logoFileId}
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
            storeLogoFileId={storeData?.logoFileId}
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
                deviceToken,
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
              // Eager body-scan gate: customers with NO scan on file ever go to
              // consent first, so the trial-room flow can't throw NO_BODY_SCAN:
              // server-side. Stale-scan customers (lastBodyScan present but >6
              // months old) still go to home — the server only enforces presence
              // of bodyScanFileId, not staleness, so they won't trip the error.
              // Customers can still tap Skip on consent to land on home in
              // browse-only mode; subsequent send-to-trial attempts are
              // pre-checked client-side and re-route to consent (no server hit).
              if (!customer.bodyScanFileId) {
                navigate("consent");
              } else {
                navigate("home");
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
            storeLogoFileId={storeData?.logoFileId}
            onRegistered={async (cId, cName) => {
              setCustomerId(cId);
              setCustomerName(cName);
              setHasBodyScan(false);
              returningRef.current = false;
              scanEligibleRef.current = false;
              const newSessionId = await createSessionMut({
                storeId,
                storeName,
                customerId: cId,
                customerPhone: `+91${phone}`,
                deviceToken,
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
              // A newly-registered customer never has a scan on file. Eager
              // gate sends them straight to consent — same rationale as the
              // OTP no-scan branch. Skip on consent still lands them on home
              // in browse-only mode.
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
            storeLogoFileId={storeData?.logoFileId}
            onValidCode={(data) => {
              setTrialData(data.trialRoom);
              setSessionId(data.trialRoom.sessionId);
              if (data.customer) {
                setCustomerId(data.customer._id);
                setCustomerName(data.customer.name);
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
                setHasBodyScan(false);
                returningRef.current = false;
                scanEligibleRef.current = false;
              }
              // Resolve shortlist items to full saree data, sorted by addedAt
              // ascending (oldest first — staff queues priority items first).
              let resolved: SareeItem[] = [];
              if (data.mirrorItems && allSarees) {
                const sareeMap = new Map(allSarees.map((s) => [s._id, s]));
                const sortedMirror = [...data.mirrorItems].sort(
                  (a: { addedAt?: number }, b: { addedAt?: number }) =>
                    (a.addedAt ?? 0) - (b.addedAt ?? 0),
                );
                resolved = sortedMirror
                  .map((item: { sareeId: Id<"sarees"> }) => sareeMap.get(item.sareeId))
                  .filter(Boolean) as SareeItem[];
              }
              setShortlistedItems(resolved);
              persistShortlisted({
                sessionId: data.trialRoom.sessionId,
                sareeIds: resolved.map((s) => s._id),
                autoTrialDone: false,
              });

              // Auto-trial the first 2 (oldest by addedAt). Remaining items
              // sit in the Shortlisted home rail until the customer self-adds
              // them. Replaces the previous bulk-dump-into-trialRoom behavior.
              //
              // Body-scan gate: when the customer has no scan on file, we
              // populate trialItems but DON'T fire runTryOn — that would
              // throw NO_BODY_SCAN: server-side. Once the customer completes
              // the body scan via the consent flow below, the reconciliation
              // effect (search "Reconciliation effect") sees bodyScanInfo
              // flip and fires runTryOn for the queued items.
              const firstTwo = resolved.slice(0, 2);
              const customerHasScan = data.customer?.hasBodyScanFile === true;
              if (firstTwo.length > 0) {
                setTrialItems((prev) => {
                  const existingIds = new Set(prev.map((s) => s._id));
                  const merged = [...prev];
                  for (const item of firstTwo) {
                    if (!existingIds.has(item._id)) merged.push(item);
                  }
                  return merged;
                });
                if (data.customer && customerHasScan) {
                  for (const item of firstTwo) {
                    runTryOn({
                      deviceToken: deviceToken!,
                      sessionId: data.trialRoom.sessionId,
                      sareeId: item._id,
                    })
                      .then((res) => {
                        setSareeLookIds((prev) => ({ ...prev, [item._id]: res.lookId }));
                      })
                      .catch((err: Error) => {
                        // Defense-in-depth: scan was deleted between login
                        // and this call. The eager gate above should have
                        // caught the no-scan case — landing here is rare.
                        handleTryOnError(err, showToast, () => navigate("consent"));
                      });
                  }
                }
              }
              persistShortlisted({
                sessionId: data.trialRoom.sessionId,
                sareeIds: resolved.map((s) => s._id),
                autoTrialDone: true,
              });
              // Mark code as used
              markCodeUsed({ code: data.trialRoom.code, storeId });
              // Eager body-scan gate (matches phoneAuth / newCustomer paths):
              // route no-scan customers through consent → bodyScan first.
              // Auto-trial fires deferred via the reconciliation effect once
              // the scan is recorded. Customers with a scan land directly on
              // home with the Shortlisted rail and the first-2 already
              // rendering against the AI.
              if (data.customer && !customerHasScan) {
                navigate("consent");
              } else {
                navigate("home");
              }
            }}
            onBack={() => setScreen("idle")}
          />
        );
      case "scanChoice": {
        // Guard: only offer "Use Previous Scan" when a real file was persisted.
        // Legacy records may have lastBodyScan but no bodyScanFileId.
        const hasPreviousScan = bodyScanInfo?.hasFileId === true;
        return (
          <ScanChoiceScreen
            customerName={customerName}
            hasPreviousScan={hasPreviousScan}
            onUsePrevious={() => {
              if (trialItems.length > 0) navigate("trialRoom");
              else navigate("home");
            }}
            onRescan={() => {
              navigate("consent");
            }}
          />
        );
      }
      case "consent":
        return (
          <ConsentScreen
            onAllow={handleAllowCamera}
            onSkip={() => {
              stopCamera();
              if (trialItems.length > 0) navigate("trialRoom");
              else navigate("home");
            }}
          />
        );
      case "bodyScan":
        return (
          <BodyScanScreen
            storeName={storeName}
            storeLogoFileId={storeData?.logoFileId}
            triggerLogout={triggerLogout}
            stream={cameraStream}
            cameraFacing={cameraFacing}
            onSwitchCamera={handleSwitchCamera}
            onCapture={async (blob) => {
              if (!customerId) {
                stopCamera();
                goBack();
                return;
              }
              if (blob.size === 0) {
                stopCamera();
                showToast("Body scan failed — please try again", "error");
                goBack();
                return;
              }
              try {
                const file = new File(
                  [blob],
                  `bodyscan-${Date.now()}.jpg`,
                  { type: "image/jpeg" },
                );
                const fileId = await upload(file, GUARDS.bodyScan);
                await recordBodyScan({ customerId, deviceToken, bodyScanFileId: fileId });
                setHasBodyScan(true);
                scanEligibleRef.current = true;
                persistKioskSession({ hasBodyScan: true });
                stopCamera();
                // Skip the AI processing screen when there's nothing queued
                // to process — common on the eager-gate path where a customer
                // completes their first scan with an empty trial room. Goes
                // straight to home. With queued items (codeEntry deferred
                // auto-trial path), aiProcessing shows real per-look progress
                // and auto-advances on first completion.
                if (trialItems.length > 0) {
                  navigate("aiProcessing");
                } else {
                  navigate("home");
                }
              } catch (err) {
                console.error(err);
                stopCamera();
                showToast("Body scan upload failed — please try again", "error");
                goBack();
              }
            }}
            onBack={() => {
              stopCamera();
              goBack();
            }}
            onHome={() => {
              stopCamera();
              goHome();
            }}
          />
        );
      case "aiProcessing":
        return (
          <AIProcessingScreen
            trialItems={trialItems}
            sareeLookIds={sareeLookIds}
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
            cartItemIds={new Set(cartItems.map((c) => c._id))}
            customerName={customerName}
            phone={phone}
            onAddToCart={(saree) => {
              // Trial-room "Add to Cart": item stays in the trial rail
              // (parallel intents — trying-on + buying). Skip if already
              // in cart. Mirrors the WardrobeScreen.onToggleInCart add
              // path but never removes.
              if (cartItems.some((c) => c._id === saree._id)) {
                showToast("Already in cart", "info");
                return;
              }
              if (customerId) {
                addCartItem({ customerId, storeId, sareeId: saree._id, qty: 1 });
              }
              setCartItems((prev) => [...prev, { ...saree, qty: 1 }]);
              showToast("Added to cart", "success");
            }}
            onRemoveItem={(id) => {
              // Cancel any pending bg-removal job for this saree's look —
              // saves CPU when the customer rapidly adds/removes. No-op if
              // already processing or finished.
              const pendingLookId = sareeLookIds[id];
              if (pendingLookId) cancelBgRemoval(pendingLookId);
              setTrialItems((prev) => prev.filter((s) => s._id !== id));
            }}
            onAddToWardrobe={(items) => {
              // Filter out any saree that's already in the wardrobe —
              // re-adding the same _id would duplicate React keys and
              // also double-persist on the server.
              const existingIds = new Set(wardrobeItems.map((w) => w._id));
              const fresh = items.filter((i) => !existingIds.has(i._id));
              if (fresh.length === 0) {
                setTrialItems((prev) =>
                  prev.filter((s) => !items.some((i) => i._id === s._id))
                );
                return;
              }
              if (wardrobeItems.length + fresh.length > CFG.maxWardrobe) {
                showToast(`Wardrobe limit (${CFG.maxWardrobe})`, "warning");
                return;
              }
              setWardrobeItems((prev) => [...prev, ...fresh]);
              setTrialItems((prev) =>
                prev.filter((s) => !items.some((i) => i._id === s._id))
              );
              // Only persist the fresh sarees. Server-side is idempotent now
              // too but skipping a round-trip when we know it's a no-op.
              // Pass the AI try-on lookId (when one exists) so /c/wardrobe
              // and the kiosk wardrobe surface the customer-on-saree render
              // instead of the catalog photo. Per-customer sareeLookIds is
              // populated by runTryOn .then() callbacks; for items added
              // before the render completes, lookId stays undefined here
              // and the customer can re-trigger by re-adding later.
              for (const item of fresh) {
                addToWardrobeMut({
                  sessionId,
                  customerId: customerId ?? undefined,
                  sareeId: item._id,
                  sareeName: item.name,
                  price: item.price,
                  lookId: sareeLookIds[item._id],
                });
              }
              showToast(`Added ${fresh.length} to wardrobe`, "success");
            }}
            onGoHome={goHome}
            onGoToWardrobe={() => navigate("wardrobe")}
            onLogout={triggerLogout}
            showToast={showToast}
            maxTrial={CFG.maxTrial}
            tryOnSec={CFG.tryOnSec}
            sareeLookIds={sareeLookIds}
            retryLookMut={retryLookMut}
            deviceToken={deviceToken}
            navigate={navigate}
            setPendingFanOut={setPendingFanOut}
            cartCount={cartItems.reduce((n, c) => n + c.qty, 0)}
            storeName={storeName}
            storeLogoFileId={storeData?.logoFileId}
          />
        );
      case "home":
        return (
          <HomeScreen
            sarees={allSarees || []}
            trialItems={trialItems}
            wardrobeItems={wardrobeItems}
            shortlistedItems={shortlistedItems}
            onProductTap={(p) => navigate("productDetail", p)}
            onSendToTrial={(items) => {
              setTrialItems((prev) => [...prev, ...items]);
              // Client-side body-scan pre-check: if the customer has no scan
              // on file, do NOT fire runTryOn — it would throw NO_BODY_SCAN:
              // server-side and surface as a red Convex error in the console.
              // Items still land in trialItems; the reconciliation effect
              // re-fires runTryOn after recordBodyScan flips bodyScanInfo.
              if (customerId && bodyScanInfo?.hasFileId === false) {
                showToast("Body scan needed to try sarees on", "warning");
                navigate("consent");
                return;
              }
              if (customerId && bodyScanInfo?.hasFileId === true) {
                for (const item of items) {
                  runTryOn({
                    deviceToken: deviceToken!,
                    sessionId,
                    sareeId: item._id,
                  })
                    .then((res) => {
                      setSareeLookIds((prev) => ({ ...prev, [item._id]: res.lookId }));
                    })
                    .catch((err: Error) => {
                      // Defense-in-depth — scan deleted mid-session, etc.
                      handleTryOnError(err, showToast, () => navigate("consent"));
                    });
                }
              }
              navigate("trialRoom");
            }}
            navigate={navigate}
            goHome={goHome}
            triggerLogout={triggerLogout}
            trialCount={trialItems.length}
            wardrobeCount={wardrobeItems.length}
            cartCount={cartItems.length}
            maxTrial={CFG.maxTrial}
            showToast={showToast}
            storeName={storeData?.name || storeName}
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
              // Body-scan pre-check, same shape as HomeScreen.onSendToTrial.
              // No-scan customers route to consent without firing runTryOn,
              // so the Convex server log stays clean.
              if (customerId && bodyScanInfo?.hasFileId === false) {
                showToast("Body scan needed to try sarees on", "warning");
                navigate("consent");
                return;
              }
              if (customerId && bodyScanInfo?.hasFileId === true) {
                runTryOn({
                  deviceToken: deviceToken!,
                  sessionId,
                  sareeId: selectedProduct._id,
                })
                  .then((res) => {
                    setSareeLookIds((prev) => ({ ...prev, [selectedProduct._id]: res.lookId }));
                  })
                  .catch((err: Error) => {
                    // Defense-in-depth — scan deleted mid-session, etc.
                    handleTryOnError(err, showToast, () => navigate("consent"));
                  });
              }
              showToast("Added to Trial Room", "success");
              navigate("trialRoom");
            }}
            onBack={goBack}
            onProductTap={(p) => navigate("productDetail", p)}
            navigate={navigate}
            goHome={goHome}
            triggerLogout={triggerLogout}
            trialCount={trialItems.length}
            wardrobeCount={wardrobeItems.length}
            cartCount={cartItems.length}
            storeName={storeData?.name || storeName}
            storeLogoFileId={storeData?.logoFileId}
          />
        ) : null;
      case "wardrobe":
        return (
          <WardrobeScreen
            items={wardrobeItems}
            lookImages={wardrobeLookImages}
            lookCutouts={wardrobeLookCutouts}
            sareeLookIds={sareeLookIds}
            cartItemIds={new Set(cartItems.map((c) => c._id))}
            onToggleInCart={(saree) => {
              const inCart = cartItems.some((c) => c._id === saree._id);
              if (inCart) {
                // Remove from cart — both server (if customer) and local.
                if (customerId) {
                  removeCartItemMut({ customerId, storeId, sareeId: saree._id });
                }
                setCartItems((prev) => prev.filter((c) => c._id !== saree._id));
                showToast("Removed from cart", "info");
              } else {
                // Add to cart — both server (if customer) and local.
                if (customerId) {
                  addCartItem({ customerId, storeId, sareeId: saree._id, qty: 1 });
                }
                setCartItems((prev) => [...prev, { ...saree, qty: 1 }]);
                showToast("Added to cart", "success");
                navigate("order");
              }
            }}
            onRemoveFromWardrobe={(saree) => {
              if (customerId && savedWardrobe) {
                const row = savedWardrobe.find((w) => w.sareeId === saree._id);
                if (row) {
                  removeFromWardrobeMut({ wardrobeId: row._id, customerId }).catch(() => {});
                }
              }
              setWardrobeItems((prev) => prev.filter((w) => w._id !== saree._id));
              showToast("Removed from wardrobe", "info");
            }}
            navigate={navigate}
            goHome={goHome}
            triggerLogout={triggerLogout}
            trialCount={trialItems.length}
            wardrobeCount={wardrobeItems.length}
            cartCount={cartItems.length}
            maxWardrobe={CFG.maxWardrobe}
            storeName={storeData?.name || storeName}
            storeLogoFileId={storeData?.logoFileId}
          />
        );
      case "order":
        return (
          <OrderScreen
            cart={cartItems}
            onUpdateQty={(idx, d) => {
              setCartItems((prev) => prev.map((item, i) => {
                if (i !== idx) return item;
                const nextQty = Math.max(1, item.qty + d);
                if (customerId && nextQty !== item.qty) {
                  updateCartQtyMut({ customerId, storeId, sareeId: item._id, qty: nextQty });
                }
                return { ...item, qty: nextQty };
              }));
            }}
            onRemoveItem={(idx) => {
              setCartItems((prev) => {
                const victim = prev[idx];
                if (victim && customerId) {
                  removeCartItemMut({ customerId, storeId, sareeId: victim._id });
                }
                return prev.filter((_, i) => i !== idx);
              });
            }}
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
                    deviceToken,
                  });
                  const cartIds = cartItems.map((c) => c._id);

                  // Remove the purchased items from server-side wardrobe so
                  // /c/wardrobe (customer PWA, reactive subscription) and
                  // future kiosk hydrations no longer show them. Best-effort
                  // per-row delete — race / missing rows are silent.
                  if (customerId && savedWardrobe) {
                    for (const sareeId of cartIds) {
                      const row = savedWardrobe.find((w) => w.sareeId === sareeId);
                      if (row) {
                        try {
                          await removeFromWardrobeMut({ wardrobeId: row._id, customerId });
                        } catch { /* ignore */ }
                      }
                    }
                  }

                  setWardrobeItems((prev) => prev.filter((w) => !cartIds.includes(w._id)));
                  if (customerId) {
                    try { await clearCartMut({ customerId, storeId }); } catch { /* ignore */ }
                  }
                  setCartItems([]);
                } catch { /* ignore */ }
              }
            }}
            onFindTailor={() => navigate("tailors")}
            onProductTap={(p) => navigate("productDetail", p)}
            onBack={goBack}
            navigate={navigate}
            goHome={goHome}
            triggerLogout={triggerLogout}
            trialCount={trialItems.length}
            wardrobeCount={wardrobeItems.length}
            cartCount={cartItems.length}
            storeName={storeData?.name || storeName}
            storeLogoFileId={storeData?.logoFileId}
            recentlyViewed={(allSarees ?? []).slice(0, 12)}
          />
        );
      case "tailors":
        return (
          <TailorScreen
            storeCity={storeData?.city || ""}
            storeId={storeId}
            storeName={storeData?.name || storeName}
            customerId={customerId}
            customerName={customerName}
            customerPhone={phone ? `+91${phone}` : ""}
            onBack={goBack}
            showToast={showToast}
            navigate={navigate}
            goHome={goHome}
            triggerLogout={triggerLogout}
            trialCount={trialItems.length}
            wardrobeCount={wardrobeItems.length}
            cartCount={cartItems.length}
            storeLogoFileId={storeData?.logoFileId}
            allSarees={allSarees ?? []}
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
      {showSavePrompt && (
        <DataSaveScreen
          onSave={() => {
            setShowSavePrompt(false);
            showToast("Saved to profile", "success");
            setShowFeedback(true);
          }}
          onDelete={() => {
            setShowSavePrompt(false);
            setWardrobeItems([]);
            setTrialItems([]);
            setCartItems([]);
            showToast("Data deleted", "info");
            setShowFeedback(true);
          }}
        />
      )}
      {showFeedback && (
        <FeedbackScreen
          onSubmit={async (rating, comment) => {
            if (sessionId) {
              try {
                await updateSessionMut({
                  sessionId,
                  rating,
                  ratingComment: comment || undefined,
                  sareesTriedOn: wardrobeItems.length,
                  sareesBrowsed: trialItems.length + wardrobeItems.length,
                });
                await endSessionMut({ sessionId, deviceToken });
              } catch { /* ignore */ }
            }
            setShowFeedback(false);
            handleWipe();
          }}
          onHome={() => {
            setShowFeedback(false);
            goHome();
          }}
          onLogout={() => {
            setShowFeedback(false);
            handleWipe();
          }}
        />
      )}
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
function IdleScreen({ storeName: _storeName, onStart }: { storeName: string; onStart: () => void }) {
  return (
    <div onClick={onStart} className="k-shell k-idle-shell" style={{ cursor: "pointer" }}>
      {/* Background image */}
      <div className="k-idle-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kiosk/first-page/background.jpg"
          alt=""
          aria-hidden
          className="k-idle-img active"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kiosk/ideal-screen-2.svg"
          alt=""
          aria-hidden
          className="k-idle-overlay"
        />
      </div>

      {/* Top bar */}
      <div className="k-idle-top">
        <div className="k-idle-brand">PHYGIFYT</div>
        <div className="k-idle-lang" onClick={(e) => { e.stopPropagation(); onStart(); }}>
          <span>Eng</span>
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Center touch-to-start button */}
      <div className="k-idle-cta-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kiosk/first-page/touch-to-start.svg"
          alt="Touch to Start"
          className="k-idle-touch"
        />
      </div>

      {/* Bottom copy */}
      <div className="k-idle-copy">
        <h1 className="k-idle-headline">SEE YOURSELF IN THIS BEAUTIFUL SAREE</h1>
        <p className="k-idle-subline">EXPERIENCE OUR CURATED COLLECTION WITH VIRTUAL TRY-ON</p>
      </div>
    </div>
  );
}

/* ── MODE SELECT ── */
function ModeSelectScreen({ onStoreCode, onCustomerLogin }: {
  storeName: string; onStoreCode: () => void; onCustomerLogin: () => void; onBack: () => void;
}) {
  const [selected, setSelected] = useState<"store" | "phone" | null>(null);
  const handleNext = () => {
    if (selected === "store") onStoreCode();
    else if (selected === "phone") onCustomerLogin();
  };

  return (
    <div className="k-lang-shell">
      <div className="k-lang-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-1.svg" alt="" aria-hidden className="k-lang-bg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-2.svg" alt="" aria-hidden className="k-lang-overlay" />
      </div>

      <div className="k-lang-content">
        <div className="k-lang-top">
          <div className="k-lang-brand">PHYGIFYT</div>
          <div className="k-lang-langbtn">
            <span>Eng</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="k-lang-heading k-slideUp">
          <h1 className="k-lang-title">How would you like to start?</h1>
          <p className="k-lang-subtitle">Choose store code if your assistant shared<br />one, or login with your phone number</p>
        </div>

        <div className="k-mode-grid">
          <button
            onClick={() => setSelected("store")}
            className={`k-mode-card k-press k-slideUp k-d2 ${selected === "store" ? "active" : ""}`}
          >
            <div className="k-mode-card-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/kiosk/login/store-code.svg" alt="" aria-hidden />
            </div>
            <div className="k-mode-card-label">Store Code</div>
          </button>

          <button
            onClick={() => setSelected("phone")}
            className={`k-mode-card k-press k-slideUp k-d3 ${selected === "phone" ? "active" : ""}`}
          >
            <div className="k-mode-card-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/kiosk/login/phone-login.svg" alt="" aria-hidden />
            </div>
            <div className="k-mode-card-label">Phone Login</div>
          </button>
        </div>

        <div className="k-lang-next-wrap">
          <button onClick={handleNext} disabled={!selected} className="k-mode-next">Next</button>
        </div>
      </div>
    </div>
  );
}

/* ── PHONE AUTH ── */
function PhoneAuthScreen({ storeName, storeLogoFileId, onSubmitPhone, onBack }: {
  storeName: string; storeLogoFileId?: Id<"_storage">;
  onSubmitPhone: (phone: string) => void; onBack: () => void;
}) {
  const [inp, setInp] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const logoUrl = useQuery(api.files.getUrl, storeLogoFileId ? { fileId: storeLogoFileId } : "skip");
  const initial = (storeName || "S").trim().charAt(0).toUpperCase() || "S";

  const handleSubmit = () => {
    if (inp.length !== 10) { setError("Valid 10-digit number required"); return; }
    if (!["6","7","8","9"].includes(inp[0])) { setError("Valid 10-digit number required"); return; }
    onSubmitPhone(inp);
  };

  return (
    <div className="k-pair-shell">
      <div className="k-lang-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-1.svg" alt="" aria-hidden className="k-lang-bg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-2.svg" alt="" aria-hidden className="k-lang-overlay" />
      </div>

      <div className="k-pair-topbar">
        <div className="k-pair-topbar-logo">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={storeName} />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="k-pair-topbar-title">{storeName}</div>
      </div>

      <div className="k-pair-content">
        <button onClick={onBack} className="k-pair-back" aria-label="Back">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kiosk/backward.svg" alt="" aria-hidden width={48} />
        </button>

        <h1 className="k-phone-title k-slideUp">Hello!</h1>
        <p className="k-phone-subtitle k-slideUp k-d1">Sign-in with your mobile</p>

        <div className="k-phone-field k-slideUp k-d2" onClick={() => inputRef.current?.focus()}>
          <div className="k-phone-prefix">
            <Phone size={18} strokeWidth={2.25} />
            <span>+91</span>
          </div>
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            value={inp}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
              setInp(v);
              setError("");
            }}
            className="k-phone-input"
            aria-label="Mobile number"
          />
        </div>

        {error && <div className="k-pair-error">{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={inp.length !== 10}
          className="k-phone-submit k-slideUp k-d3"
        >
          Continue <ArrowRight size={22} />
        </button>

        <p className="k-phone-terms k-slideUp k-d4">
          By Continuing You Agree To Our Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
}

/* ── OTP SCREEN ── */
function OTPScreen({ phone, storeName, storeLogoFileId, onVerified, onBack }: {
  phone: string; storeId: string; storeName: string;
  storeLogoFileId?: Id<"_storage">;
  onVerified: (customer: { _id: Id<"customers">; name: string; lastBodyScan?: number; bodyScanFileId?: Id<"_storage">; language?: string } | null) => void;
  onBack: () => void;
}) {
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const logoUrl = useQuery(api.files.getUrl, storeLogoFileId ? { fileId: storeLogoFileId } : "skip");
  const initial = (storeName || "S").trim().charAt(0).toUpperCase() || "S";

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

  const handleSubmit = async () => {
    if (otp.length !== OTP_LENGTH) return;
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

  const maskedPhone = phone ? phone.slice(0, 2) + "*****" + phone.slice(-3) : "";

  return (
    <div className="k-pair-shell">
      <div className="k-lang-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-1.svg" alt="" aria-hidden className="k-lang-bg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-2.svg" alt="" aria-hidden className="k-lang-overlay" />
      </div>

      <div className="k-pair-topbar">
        <div className="k-pair-topbar-logo">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={storeName} />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="k-pair-topbar-title">{storeName}</div>
      </div>

      <div className="k-pair-content">
        <button onClick={onBack} className="k-pair-back" aria-label="Back">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kiosk/backward.svg" alt="" aria-hidden width={48} />
        </button>

        <h1 className="k-otp-title k-slideUp">Hello!</h1>
        <p className="k-otp-subtitle k-slideUp k-d1">Enter a OTP</p>
        <p className="k-otp-sent k-slideUp k-d2">OTP sent to +91 {maskedPhone}</p>

        <div className="k-otp-boxes k-slideUp k-d3" onClick={() => inputRef.current?.focus()}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <div key={i} className={`k-otp-box ${otp[i] ? "filled" : ""}`}>
              {otp[i] || "0"}
            </div>
          ))}
        </div>

        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoFocus
          value={otp}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
            setOtp(v);
            setError("");
          }}
          className="k-pair-hidden-input"
          aria-label="OTP"
        />

        {error && <div className="k-pair-error">{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={otp.length !== OTP_LENGTH}
          className="k-otp-submit k-slideUp k-d4"
        >
          Continue <ArrowRight size={22} />
        </button>

        <div className="k-otp-resend k-slideUp k-d5">
          {canResend ? (
            <button
              onClick={() => { setTimer(60); setCanResend(false); setOtp(""); }}
              className="k-otp-resend-btn"
            >
              Resend OTP
            </button>
          ) : (
            <span>Resend in {timer}s</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── NEW CUSTOMER (minimal capture: name + DOB) ── */
function NewCustomerScreen({ phone, storeName, storeLogoFileId, onRegistered, onBack }: {
  phone: string;
  storeName: string;
  storeLogoFileId?: Id<"_storage">;
  onRegistered: (customerId: Id<"customers">, customerName: string) => void;
  onBack: () => void;
}) {
  const ensureByPhone = useMutation(api.customers.ensureByPhone);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const logoUrl = useQuery(api.files.getUrl, storeLogoFileId ? { fileId: storeLogoFileId } : "skip");
  const initial = (storeName || "S").trim().charAt(0).toUpperCase() || "S";

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
    <div className="k-pair-shell">
      <div className="k-lang-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-1.svg" alt="" aria-hidden className="k-lang-bg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-2.svg" alt="" aria-hidden className="k-lang-overlay" />
      </div>

      <div className="k-pair-topbar">
        <div className="k-pair-topbar-logo">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={storeName} />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="k-pair-topbar-title">{storeName}</div>
      </div>

      <div className="k-pair-content">
        <button onClick={onBack} className="k-pair-back" aria-label="Back">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kiosk/backward.svg" alt="" aria-hidden width={48} />
        </button>

        <h1 className="k-welcome-title k-slideUp">Welcome to Wearify</h1>
        <p className="k-welcome-subtitle k-slideUp k-d1">
          Quick setup-complete the rest later on the<br />Wearify app.
        </p>

        <div className="k-welcome-field k-slideUp k-d2">
          <label className="k-welcome-label">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="e.g. Ananya Mehta"
            className="k-welcome-input"
          />
        </div>

        <div className="k-welcome-field k-slideUp k-d3">
          <label className="k-welcome-label">Date of Birth</label>
          <input
            type="date"
            value={dob}
            max={maxDob}
            onChange={(e) => { setDob(e.target.value); setError(""); }}
            placeholder="dd-mm-yyyy"
            className="k-welcome-input k-welcome-input-date"
          />
        </div>

        {error && <div className="k-pair-error">{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="k-welcome-submit k-slideUp k-d4"
        >
          {saving ? (<><Loader2 size={20} className="k-spin" /> Creating…</>) : (<>Continue <ArrowRight size={22} /></>)}
        </button>

        <p className="k-welcome-note k-slideUp k-d5">
          Your try-on history and wardrobe will be saved to your<br />phone number.
        </p>
      </div>
    </div>
  );
}

/* ── SCAN CHOICE (returning customer with existing body scan) ── */

/* ── CODE ENTRY ── */
function CodeEntryScreen({
  storeId, storeName, storeLogoFileId, onValidCode, onBack,
}: {
  storeId: string;
  storeName: string;
  storeLogoFileId?: Id<"_storage">;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValidCode: (data: any) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [deviceLabel, setDeviceLabel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const logoUrl = useQuery(api.files.getUrl, storeLogoFileId ? { fileId: storeLogoFileId } : "skip");
  const initial = (storeName || "S").trim().charAt(0).toUpperCase() || "S";

  const validateCodeMut = useMutation(api.trialRoom.validateCode);

  const handleSubmit = async () => {
    if (code.length !== 6 || loading) return;
    setLoading(true);
    try {
      const validation = await validateCodeMut({ code, storeId });
      if (!validation.valid) {
        setError(validation.error || "Invalid code");
        setCode("");
        return;
      }
      onValidCode(validation);
    } catch {
      setError("Could not verify code. Try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="k-pair-shell">
      <div className="k-lang-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-1.svg" alt="" aria-hidden className="k-lang-bg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-2.svg" alt="" aria-hidden className="k-lang-overlay" />
      </div>

      <div className="k-pair-topbar">
        <div className="k-pair-topbar-logo">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={storeName} />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="k-pair-topbar-title">{storeName}</div>
      </div>

      <div className="k-pair-content">
        <button onClick={onBack} className="k-pair-back" aria-label="Back">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kiosk/backward.svg" alt="" aria-hidden width={48} />
        </button>

        <h1 className="k-pair-title k-slideUp">Pair this kiosk</h1>
        <p className="k-pair-subtitle k-slideUp k-d1">
          Ask the store owner or admin for a 6-digit<br />pairing code
        </p>

        <div className="k-pair-field k-slideUp k-d2">
          <div className="k-pair-label">PAIRING CODE</div>
          <div className="k-pair-codes" onClick={() => codeInputRef.current?.focus()}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`k-pair-codebox ${code[i] ? "filled" : ""}`}>
                {code[i] || "0"}
              </div>
            ))}
          </div>
          <input
            ref={codeInputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
              setCode(v);
              setError("");
            }}
            className="k-pair-hidden-input"
            aria-label="Pairing code"
          />
        </div>

        <div className="k-pair-field k-slideUp k-d3">
          <div className="k-pair-label">DEVICE LABLE (OPTIONAL)</div>
          <input
            type="text"
            value={deviceLabel}
            onChange={(e) => setDeviceLabel(e.target.value)}
            placeholder="e.g.Front mirror, Trial room 2"
            className="k-pair-input"
          />
        </div>

        {error && <div className="k-pair-error">{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={code.length !== 6 || loading}
          className="k-pair-submit k-slideUp k-d4"
        >
          {loading ? (<><Loader2 size={20} className="k-spin" /> Verifying…</>) : "Pair Kiosk"}
        </button>

        <div className="k-pair-helpers k-slideUp k-d5">
          <p>Secure pairing between this device &amp; your account</p>
          <p>Ask the store owner to generate a fresh code if pairing<br />has expired</p>
        </div>
      </div>
    </div>
  );
}

/* ── LANGUAGE ── */
function LangScreen({ lang, onSelect, onNext }: { lang: string; onSelect: (c: string) => void; onNext: () => void; storeName: string }) {
  return (
    <div className="k-lang-shell">
      <div className="k-lang-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-1.svg" alt="" aria-hidden className="k-lang-bg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-2.svg" alt="" aria-hidden className="k-lang-overlay" />
      </div>

      <div className="k-lang-content">
        <div className="k-lang-top">
          <div className="k-lang-brand">PHYGIFYT</div>
          <div className="k-lang-langbtn">
            <span>Eng</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="k-lang-heading k-slideUp">
          <h1 className="k-lang-title">Select your language</h1>
          <p className="k-lang-subtitle">Choose your preferred language</p>
        </div>

        <div className="k-lang-grid">
          {LANGS.map((l, i) => (
            <button
              key={l.c}
              onClick={() => onSelect(l.c)}
              className={`k-lang-card k-press k-slideUp k-d${Math.min((i % 8) + 1, 8)} ${lang === l.c ? "active" : ""}`}
            >
              <span className="k-lang-card-native">{l.v}</span>
              <span className="k-lang-card-name">{l.n}</span>
            </button>
          ))}
        </div>

        <div className="k-lang-next-wrap">
          <button onClick={onNext} className="k-lang-next">Next</button>
        </div>
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
  navigate: (s: Screen, product?: SareeItem) => void; onBack?: () => void;
  storeName?: string; storeLogoFileId?: Id<"_storage">;
}) {
  const iconBtn = (
    onClick: () => void,
    Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>,
    label: string,
    count?: number,
    badgeBg?: string,
  ) => (
    <button onClick={onClick} className="k-iconbtn k-press" aria-label={label}>
      <Icon size={20} strokeWidth={2} />
      {count !== undefined && count > 0 && (
        <span className="k-iconbtn-badge" style={{ background: badgeBg || "var(--k-maroon)" }}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "22px 24px", background: "var(--k-card)",
      borderBottom: "1px solid var(--k-border-l)", flexShrink: 0, zIndex: 40,
    }}>
      {onBack ? (
        <button onClick={onBack} className="k-iconbtn k-press" aria-label="Back">
          <ChevronLeft size={22} />
        </button>
      ) : (
        <StoreBrand storeName={storeName ?? ""} logoFileId={storeLogoFileId} />
      )}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {iconBtn(() => navigate("trialRoom"), Shirt, "Trial room", trialCount, "var(--k-gold)")}
        {iconBtn(() => navigate("wardrobe"), ShoppingBag, "Wardrobe", wardrobeCount, "var(--k-maroon)")}
        {iconBtn(() => navigate("order"), ShoppingCart, "Cart", cartCount, "var(--k-green)")}
        {iconBtn(goHome, Home, "Home")}
        {iconBtn(triggerLogout, LogOut, "Logout")}
      </div>
    </div>
  );
}

/* ── HOME ── */
function HomeScreen({ sarees, trialItems, wardrobeItems, shortlistedItems, onProductTap, onSendToTrial, navigate, goHome, triggerLogout, trialCount, wardrobeCount, cartCount, maxTrial, showToast, storeName, storeLogoFileId }: {
  sarees: SareeItem[]; trialItems: SareeItem[]; wardrobeItems: SareeItem[];
  shortlistedItems: SareeItem[];
  onProductTap: (p: SareeItem) => void; onSendToTrial: (items: SareeItem[]) => void;
  navigate: (s: Screen, product?: SareeItem) => void; goHome: () => void; triggerLogout: () => void;
  trialCount: number; wardrobeCount: number; cartCount: number; maxTrial: number;
  showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void;
  storeName?: string; storeLogoFileId?: Id<"_storage">;
}) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  // Price band: null = any. Stored as [min, max | null] in rupees.
  const [priceBand, setPriceBand] = useState<[number, number | null] | null>(null);
  // Multi-select tags (Premium / Trending / Fast Moving / New — whatever the store curates)
  const [tagFilter, setTagFilter] = useState<Set<string>>(new Set());

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

  // Predefined price bands (rupees). Matching a saree's price against one
  // band is enough — we don't combine multiple bands.
  const PRICE_BANDS: Array<{ label: string; range: [number, number | null] }> = [
    { label: "Under ₹5K", range: [0, 5000] },
    { label: "₹5K – ₹15K", range: [5000, 15000] },
    { label: "₹15K – ₹30K", range: [15000, 30000] },
    { label: "₹30K – ₹50K", range: [30000, 50000] },
    { label: "₹50K+", range: [50000, null] },
  ];
  const availableTags = Array.from(
    new Set(sarees.map((s) => s.tag).filter((t): t is string => !!t))
  ).sort();
  const activeFilterCount = (priceBand ? 1 : 0) + tagFilter.size;

  // Combined search + filter. If any of query/priceBand/tagFilter is
  // active we render the flat "results" grid; otherwise the curated
  // Trending / New Arrivals rails.
  const anyFilterActive = !!query || !!priceBand || tagFilter.size > 0;
  const matchesFilters = (s: SareeItem) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.occasion.toLowerCase().includes(q) &&
        !(s.fabric || "").toLowerCase().includes(q)
      ) return false;
    }
    if (priceBand) {
      const [min, max] = priceBand;
      if (s.price < min) return false;
      if (max !== null && s.price >= max) return false;
    }
    if (tagFilter.size > 0) {
      if (!s.tag || !tagFilter.has(s.tag)) return false;
    }
    return true;
  };
  const filtered = anyFilterActive ? sarees.filter(matchesFilters) : null;
  const trending = sarees.slice(0, 8);
  const newArrivals = [...sarees].reverse().slice(0, 8);

  // Group by occasion for categories
  const occasions = [...new Set(sarees.map((s) => s.occasion))];

  const favourites = shortlistedItems.length > 0
    ? shortlistedItems
    : wardrobeItems.length > 0
      ? wardrobeItems
      : sarees.slice(0, 8);

  return (
    <div className="k-shell">
      <KioskHeader trialCount={trialCount} wardrobeCount={wardrobeCount} cartCount={cartCount} goHome={goHome} triggerLogout={triggerLogout} navigate={navigate} storeName={storeName} storeLogoFileId={storeLogoFileId} />

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>
        {!filtered ? (
          <div className="k-home-content">
            <div className="k-home-search-row">
              <div className="k-home-search">
                <Search size={22} color="var(--k-text-muted)" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search saree..."
                />
                {query && (
                  <button onClick={() => setQuery("")} aria-label="Clear" className="k-home-search-clear">
                    <X size={20} />
                  </button>
                )}
              </div>
              <button onClick={() => navigate("consent")} className="k-home-scan-btn" aria-label="Scan">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/kiosk/home/scan.svg" alt="" aria-hidden width={28} />
              </button>
            </div>

            <HomeRail title="My Favourites">
              {favourites.map((s) => (
                <FavouriteCard
                  key={s._id}
                  saree={s}
                  onTap={() => onProductTap(s)}
                  onAddToTrial={() => {
                    if (isInTrial(s._id) || isInWardrobe(s._id)) return;
                    if (trialItems.length >= maxTrial) {
                      showToast(`Max ${maxTrial} sarees per trial`, "warning");
                      return;
                    }
                    onSendToTrial([s]);
                  }}
                  liked={likedIds.has(s._id)}
                  onToggleLike={() => toggleLike(s._id)}
                  inTrial={isInTrial(s._id)}
                  inWardrobe={isInWardrobe(s._id)}
                />
              ))}
            </HomeRail>

            <HomeRail title="Trending Now">
              {trending.map((s) => (
                <TrendingCard key={s._id} saree={s} onTap={() => onProductTap(s)} />
              ))}
            </HomeRail>

            <HomeRail title="New Arrivals">
              {newArrivals.map((s) => (
                <NewArrivalCard key={s._id} saree={s} onTap={() => onProductTap(s)} />
              ))}
            </HomeRail>
          </div>
        ) : null}

        <div style={{ display: filtered ? "block" : "none" }}>
        {/* Search bar + filter */}
        <div style={{ padding: "16px 24px 8px", display: "flex", gap: 10, position: "relative" }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 10,
            padding: "14px 18px", borderRadius: 14,
            border: "1px solid var(--k-border)", background: "var(--k-card)",
            transition: "border-color .2s ease, box-shadow .2s ease",
          }}>
            <Search size={18} color="var(--k-text-muted)" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, occasion, fabric..."
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 16, color: "var(--k-text)", fontFamily: "inherit" }} />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear" style={{
                background: "transparent", border: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: "var(--k-text-muted)", padding: 4,
              }}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filter toggle — matches search-bar height, maroon fill when filters are active */}
          <button
            onClick={() => setFilterOpen((v) => !v)}
            aria-label="Filters"
            className="k-press"
            style={{
              position: "relative",
              width: 52, height: 52, flexShrink: 0,
              borderRadius: 14,
              border: activeFilterCount > 0 ? "1px solid var(--k-maroon)" : "1px solid var(--k-border)",
              background: activeFilterCount > 0 ? "var(--k-maroon)" : "var(--k-card)",
              color: activeFilterCount > 0 ? "#fff" : "var(--k-text)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "all .18s ease",
            }}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4,
                minWidth: 18, height: 18, borderRadius: 9,
                background: "var(--k-gold)", color: "#fff",
                fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 5px",
                boxShadow: "0 2px 6px rgba(201,148,26,.35)",
              }}>{activeFilterCount}</span>
            )}
          </button>

          {/* Filter panel */}
          {filterOpen && (
            <div
              className="k-slideUp"
              style={{
                position: "absolute",
                top: "calc(100% - 4px)", right: 24, left: 24,
                background: "var(--k-card)",
                border: "1px solid var(--k-border)",
                borderRadius: 16,
                boxShadow: "0 14px 40px rgba(0,0,0,.12)",
                padding: "16px 18px",
                zIndex: 30,
              }}
            >
              {/* Price */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--k-text-muted)", marginBottom: 8 }}>
                Price
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {PRICE_BANDS.map((b) => {
                  const active = priceBand !== null && priceBand[0] === b.range[0] && priceBand[1] === b.range[1];
                  return (
                    <button
                      key={b.label}
                      onClick={() => setPriceBand(active ? null : b.range)}
                      className="k-press"
                      style={{
                        padding: "8px 14px", borderRadius: "var(--k-r-pill)",
                        border: active ? "1.5px solid var(--k-maroon)" : "1.5px solid var(--k-border)",
                        background: active ? "var(--k-maroon)" : "transparent",
                        color: active ? "#fff" : "var(--k-text)",
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>

              {/* Tags */}
              {availableTags.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--k-text-muted)", marginBottom: 8 }}>
                    Tags
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {availableTags.map((tag) => {
                      const active = tagFilter.has(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => setTagFilter((prev) => {
                            const next = new Set(prev);
                            if (next.has(tag)) next.delete(tag); else next.add(tag);
                            return next;
                          })}
                          className="k-press"
                          style={{
                            padding: "8px 14px", borderRadius: "var(--k-r-pill)",
                            border: active ? "1.5px solid var(--k-gold)" : "1.5px solid var(--k-border)",
                            background: active ? "var(--k-gold)" : "transparent",
                            color: active ? "#fff" : "var(--k-text)",
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Footer actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--k-border)", paddingTop: 12 }}>
                <button
                  onClick={() => { setPriceBand(null); setTagFilter(new Set()); }}
                  disabled={activeFilterCount === 0}
                  style={{
                    background: "transparent", border: "none",
                    color: activeFilterCount === 0 ? "var(--k-text-light)" : "var(--k-maroon)",
                    fontSize: 13, fontWeight: 600,
                    cursor: activeFilterCount === 0 ? "default" : "pointer",
                    padding: "6px 10px",
                  }}
                >
                  Clear all
                </button>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="k-btn k-btn-primary k-btn-pill k-press"
                  style={{ padding: "8px 22px", fontSize: 13 }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selection bar */}
        {selectedIds.size > 0 && (
          <div className="k-slideUp" style={{
            margin: "8px 24px 12px", padding: "14px 20px", borderRadius: "var(--k-r)",
            background: "linear-gradient(135deg, rgba(201,148,26,.1), rgba(104,38,42,.06))",
            border: "1px solid rgba(201,148,26,.3)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span className="k-heading" style={{ fontSize: 16 }}>{selectedIds.size} saree{selectedIds.size > 1 ? "s" : ""} selected</span>
            <button onClick={sendToTrial} className="k-btn k-btn-pill k-press" style={{
              background: "var(--k-gold)", color: "#fff", boxShadow: "0 4px 12px rgba(201,148,26,.3)",
              padding: "10px 22px", fontSize: 14, fontWeight: 600,
            }}>Send to Trial Room <ChevronRight size={16} /></button>
          </div>
        )}

        {/* Content */}
        {filtered ? (
          <div style={{ padding: "8px 24px" }}>
            <div style={{ fontSize: 13, color: "var(--k-text-muted)", marginBottom: 12 }}>{filtered.length} results</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
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

            {shortlistedItems.length > 0 && (
              <ScrollSection title="Shortlisted">
                {shortlistedItems.map((s) => (
                  <SareeCard key={s._id} saree={s} onTap={() => onProductTap(s)} onCheck={() => toggleSelect(s)}
                    isSelected={selectedIds.has(s._id)} isInTrial={isInTrial(s._id)} isInWardrobe={isInWardrobe(s._id)} />
                ))}
              </ScrollSection>
            )}

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

            {/* All sarees — full grid below the curated rails so customers
                aren't capped at the 16 visible in Trending + New Arrivals.
                Uses the same grid layout as the filtered-results view. */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: 14 }}>
                <div className="k-display" style={{ fontSize: 20 }}>All Sarees</div>
                <div style={{ fontSize: 13, color: "var(--k-text-muted)" }}>{sarees.length} {sarees.length === 1 ? "item" : "items"}</div>
              </div>
              <div style={{ padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                {sarees.map((s) => (
                  <SareeCard key={s._id} saree={s} onTap={() => onProductTap(s)} onCheck={() => toggleSelect(s)}
                    isSelected={selectedIds.has(s._id)} isInTrial={isInTrial(s._id)} isInWardrobe={isInWardrobe(s._id)} />
                ))}
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

function HomeRail({ title, children }: { title: string; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div className="k-home-section">
      <div className="k-home-section-head">
        <h2 className="k-home-section-title">{title}</h2>
        <div className="k-home-nav">
          <button onClick={() => scrollRef.current?.scrollBy({ left: -360, behavior: "smooth" })} className="k-home-nav-btn" aria-label="Scroll left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kiosk/home/backward.svg" alt="" aria-hidden width={40} />
          </button>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 360, behavior: "smooth" })} className="k-home-nav-btn" aria-label="Scroll right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kiosk/home/forward.svg" alt="" aria-hidden width={40} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="k-home-rail k-no-scroll">
        {children}
      </div>
    </div>
  );
}

function FavouriteCard({ saree, onTap, onAddToTrial, liked, onToggleLike, inTrial, inWardrobe }: {
  saree: SareeItem; onTap: () => void; onAddToTrial: () => void;
  liked: boolean; onToggleLike: () => void;
  inTrial: boolean; inWardrobe: boolean;
}) {
  const disabled = inTrial || inWardrobe;
  return (
    <div className="k-fav-card">
      <div className="k-fav-card-img" onClick={onTap}>
        <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad} emoji={saree.emoji} emojiSize={36} />
        <button
          type="button"
          className={`k-fav-heart ${liked ? "is-liked" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
          aria-label={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
        >
          <Heart size={18} fill={liked ? "#dc2626" : "transparent"} color={liked ? "#dc2626" : "#9ca3af"} strokeWidth={2.25} />
        </button>
      </div>
      <div className="k-fav-card-info">
        <div className="k-fav-tag">{saree.occasion}</div>
        <div className="k-fav-name">{saree.name}</div>
        <div className="k-fav-meta">{saree.fabric} • 6.3 meters</div>
        <div className="k-fav-price">₹{fmtPrice(saree.price)}</div>
        <button
          className="k-fav-add-btn"
          onClick={(e) => { e.stopPropagation(); onAddToTrial(); }}
          disabled={disabled}
        >
          {inWardrobe ? "In Wardrobe" : inTrial ? "In Trial Room" : "Add To Trial Room"}
        </button>
      </div>
    </div>
  );
}

function TrendingCard({ saree, onTap }: { saree: SareeItem; onTap: () => void }) {
  return (
    <div className="k-trend-card" onClick={onTap}>
      <div className="k-trend-card-img">
        <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad} emoji={saree.emoji} emojiSize={48} />
      </div>
      <div className="k-trend-card-label">{saree.occasion || saree.name}</div>
    </div>
  );
}

function NewArrivalCard({ saree, onTap }: { saree: SareeItem; onTap: () => void }) {
  return (
    <div className="k-arrival-card" onClick={onTap}>
      <div className="k-arrival-card-img">
        <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad} emoji={saree.emoji} emojiSize={48} />
      </div>
      <div className="k-arrival-card-name">{saree.fabric || saree.name}</div>
    </div>
  );
}

function ScrollSection({ title, children }: { title: string; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: 14 }}>
        <div className="k-display" style={{ fontSize: 20 }}>{title}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })} className="k-iconbtn k-press" aria-label="Scroll left">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })} className="k-iconbtn k-press" aria-label="Scroll right">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="k-no-scroll" style={{
        display: "grid", gridAutoFlow: "column", gridAutoColumns: "170px",
        gap: 14, overflowX: "auto", scrollSnapType: "x mandatory",
        paddingLeft: 24, paddingRight: 24, paddingBottom: 6, paddingTop: 4,
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
          borderRadius: 7, border: `2px solid ${isSelected ? "var(--k-gold)" : "rgba(255,255,255,.95)"}`,
          background: isSelected ? "var(--k-gold)" : "rgba(255,255,255,.82)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,.12)",
          transition: "all .15s ease",
          color: "#fff",
        }}>
          {isSelected && <Check size={16} strokeWidth={3} />}
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
      <div style={{ position: "relative", width: "100%", paddingTop: "120%", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad} emoji={saree.emoji} emojiSize={36} />
        </div>
        {label && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, background: labelBg,
            padding: "5px 0", textAlign: "center", fontSize: 10, fontWeight: 700,
            color: "#fff", letterSpacing: "0.5px", zIndex: 2,
          }}>{label}</div>
        )}
        {discount > 0 && !label && (
          <div style={{
            position: "absolute", bottom: 8, left: 8, padding: "3px 8px",
            borderRadius: "var(--k-r-pill)", background: "var(--k-green)", color: "#fff",
            fontSize: 10, fontWeight: 700, zIndex: 2,
          }}>-{discount}%</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{saree.name}</div>
        <div style={{ fontSize: 11, color: "var(--k-text-muted)", marginBottom: 6,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{saree.fabric} · {saree.occasion}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexWrap: "wrap" }}>
          <span className="k-mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--k-maroon)" }}>₹{fmtPrice(saree.price)}</span>
          {saree.mrp && saree.mrp > saree.price && (
            <span className="k-mono" style={{ fontSize: 11, color: "var(--k-text-light)", textDecoration: "line-through" }}>₹{fmtPrice(saree.mrp)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── PRODUCT DETAIL ── */
function ProductDetailScreen({ product, allSarees, isInTrial, isInWardrobe, onAddToTrial, onBack, onProductTap, navigate, goHome, triggerLogout, trialCount, wardrobeCount, cartCount, storeName, storeLogoFileId }: {
  product: SareeItem; allSarees: SareeItem[]; isInTrial: boolean; isInWardrobe: boolean;
  onAddToTrial: () => void; onBack: () => void; onProductTap: (p: SareeItem) => void;
  navigate: (s: Screen, product?: SareeItem) => void; goHome: () => void; triggerLogout: () => void;
  trialCount: number; wardrobeCount: number; cartCount: number;
  storeName?: string; storeLogoFileId?: Id<"_storage">;
}) {
  const [selColor, setSelColor] = useState(0);
  const [liked, setLiked] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);
  const similar = allSarees.filter((s) => s.occasion === product.occasion && s._id !== product._id).slice(0, 8);

  const subtitle = [product.fabric, "Handwoven", product.region].filter(Boolean).join(" · ");
  const handwovenLabel = product.region ? `Handwoven In ${product.region}` : "Handwoven";

  return (
    <div className="k-shell">
      <KioskHeader
        trialCount={trialCount}
        wardrobeCount={wardrobeCount}
        cartCount={cartCount}
        goHome={goHome}
        triggerLogout={triggerLogout}
        navigate={navigate}
        storeName={storeName}
        storeLogoFileId={storeLogoFileId}
      />

      <div className="k-detail-content">
        {/* Back / Home row */}
        <div className="k-detail-actions">
          <button onClick={onBack} className="k-detail-action-btn k-detail-home-btn k-press" aria-label="Back">
            <ChevronLeft size={26} color="var(--k-maroon)" strokeWidth={2.25} />
          </button>
          <button onClick={goHome} className="k-detail-action-btn k-detail-home-btn k-press" aria-label="Home">
            <Home size={22} color="var(--k-maroon)" strokeWidth={2.25} fill="var(--k-maroon)" />
          </button>
        </div>

        {/* Hero — image + info */}
        <div className="k-detail-hero">
          <div className="k-detail-img">
            <SareeImageGallery name={product.name} imageIds={product.imageIds} grad={product.grad} emoji={product.emoji} emojiSize={72} />
            <div className="k-detail-rating">
              <Star size={13} fill="var(--k-gold)" color="var(--k-gold)" strokeWidth={0} />
              <span>4.5</span>
            </div>
            <button
              onClick={() => setLiked((v) => !v)}
              className={`k-detail-heart${liked ? " is-liked" : ""}`}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart size={20} fill={liked ? "#E53935" : "transparent"} color={liked ? "#E53935" : "var(--k-text-mid)"} strokeWidth={2} />
            </button>
          </div>

          <div className="k-detail-info">
            <h2 className="k-detail-title">{product.name}</h2>
            <div className="k-detail-subtitle">{subtitle}</div>

            <div className="k-detail-price-row">
              <span className="k-detail-price">₹ {fmtPrice(product.price)}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="k-detail-mrp">₹ {fmtPrice(product.mrp)}</span>
              )}
            </div>

            <div className="k-detail-divider" />

            <div className="k-detail-colors-head">Colors</div>
            <div className="k-detail-colors">
              {product.colors.slice(0, 6).map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelColor(i)}
                  className={`k-detail-color${i === selColor ? " is-active" : ""}`}
                  style={{ background: c }}
                  aria-label={`Color ${i + 1}`}
                />
              ))}
            </div>

            <div className="k-detail-divider k-detail-section-divider" />

            <div className="k-detail-features">
              <div className="k-detail-feature">
                <div className="k-detail-feature-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/kiosk/detail/pure-silk.svg" alt="" aria-hidden />
                </div>
                <span className="k-detail-feature-label">100% {product.fabric || "Pure Silk"}</span>
              </div>
              <div className="k-detail-feature">
                <div className="k-detail-feature-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/kiosk/detail/hand-woven.svg" alt="" aria-hidden />
                </div>
                <span className="k-detail-feature-label">{handwovenLabel}</span>
              </div>
              <div className="k-detail-feature">
                <div className="k-detail-feature-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/kiosk/detail/premium.svg" alt="" aria-hidden />
                </div>
                <span className="k-detail-feature-label">Premium Quality</span>
              </div>
              <div className="k-detail-feature">
                <div className="k-detail-feature-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/kiosk/detail/easy-return.svg" alt="" aria-hidden />
                </div>
                <span className="k-detail-feature-label">Easy Return</span>
              </div>
            </div>

            <button
              onClick={onAddToTrial}
              disabled={isInTrial || isInWardrobe}
              className="k-detail-tryon k-press"
            >
              {isInWardrobe ? "ALREADY IN WARDROBE" : isInTrial ? "ALREADY IN TRIAL ROOM" : "TRY-ON"}
            </button>
          </div>
        </div>

        {/* Similar Categories */}
        {similar.length > 0 && (
          <>
            <div className="k-detail-divider k-detail-section-divider" />
            <div className="k-detail-similar">
              <div className="k-detail-similar-head">
                <h3 className="k-detail-similar-title">Similar Categories</h3>
                <div className="k-detail-similar-nav">
                  <button
                    className="k-detail-nav-btn"
                    onClick={() => railRef.current?.scrollBy({ left: -260, behavior: "smooth" })}
                    aria-label="Previous"
                  >
                    <ChevronLeft size={18} color="var(--k-text)" strokeWidth={2.25} />
                  </button>
                  <button
                    className="k-detail-nav-btn"
                    onClick={() => railRef.current?.scrollBy({ left: 260, behavior: "smooth" })}
                    aria-label="Next"
                  >
                    <ChevronRight size={18} color="var(--k-text)" strokeWidth={2.25} />
                  </button>
                </div>
              </div>
              <div ref={railRef} className="k-detail-similar-rail k-no-scroll">
                {similar.map((s) => (
                  <div key={s._id} className="k-detail-sim-card" onClick={() => onProductTap(s)}>
                    <div className="k-detail-sim-img">
                      <SareeThumb name={s.name} fileId={s.imageIds?.[0]} grad={s.grad} emoji={s.emoji} emojiSize={36} />
                      <button
                        className="k-detail-heart is-liked"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Like"
                      >
                        <Heart size={18} fill="#E53935" color="#E53935" strokeWidth={2} />
                      </button>
                    </div>
                    <div className="k-detail-sim-info">
                      <div className="k-detail-sim-name">{s.name}</div>
                      <div className="k-detail-sim-row">
                        <span className="k-detail-sim-meta">{[s.fabric, "Handwoven"].filter(Boolean).join(" · ")}</span>
                        <span className="k-detail-sim-price">₹{fmtPrice(s.price)}</span>
                      </div>
                      {s.colors.length > 0 && (
                        <div className="k-detail-sim-colors">
                          {s.colors.slice(0, 5).map((c, i) => (
                            <span key={i} className="k-detail-sim-swatch" style={{ background: c }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="k-detail-footer">
        © Copyright PHYGIFY TECHNO SERVICES PVT. LTD .
      </div>
    </div>
  );
}

/* ── TRIAL TILE ── */
// Per-saree component that subscribes reactively to its look row.
// Renders skeleton while waiting for runTryOn to resolve or the job to finish,
// shows the AI result on completion, and falls back to the saree thumbnail on failure.
// Click handlers, selection badges, and remove buttons stay on the parent wrapper.
// =========================================================================
// TrialTile — small card on the trial-room left rail.
// Render phases:
//   1. AI generating (queued/processing/no-lookId) → catalog photo
//      behind a gaussian-blur wave
//   2. AI completed → plain catalog photo (no wave, no cutout). The
//      bg-removed cutout still gets enqueued (right-panel preview reads
//      it), but the small card stays on the catalog so the customer can
//      glance and recognize the saree without their own face shrunk to
//      ~120px tall. Also closes a click-blocking bug where the cutout's
//      z-index 3 covered the checkbox at z-index 2.
//   3. Failed → catalog + error chip + Retry button
//
// Bg removal is enqueued the moment we observe (status === "completed" &&
// imageFileId set && imageNoBgFileId missing). The queue is sequential
// (see lib/bgRemovalQueue.ts) so multiple tiles don't all fire at once.
// =========================================================================

function TrialTile({
  saree,
  lookId,
  retryLookMut,
  deviceToken,
  showToast,
}: {
  saree: SareeItem;
  lookId: Id<"looks"> | undefined;
  retryLookMut: (args: { deviceToken: string; lookId: Id<"looks"> }) => Promise<{ lookId: Id<"looks"> }>;
  deviceToken: string;
  showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void;
}) {
  const look = useQuery(
    api.tryOn.getLook,
    lookId ? { lookId } : "skip",
  );
  const status = look?.status;
  const resultUrl = useConvexUrl(look?.imageFileId);

  const { upload } = useUploadFile();
  const attachBgRemoved = useMutation(api.tryOn.attachBgRemovedImage);
  const deleteOrphan = useMutation(api.tryOn.deleteOrphanCutout);
  // bgStatus is intentionally NOT subscribed here. The small card never
  // renders the cutout (right-panel does), so this component doesn't
  // need to react to queue advances. The enqueue effect below still
  // fires for downstream consumers.

  // Enqueue bg-removal when (1) the look is completed, (2) we have a
  // resolvable URL for the source AI image, and (3) no cutout exists yet.
  // useBgRemovalStatus filters re-fires inside the queue — re-rendering
  // here is harmless.
  useEffect(() => {
    if (!lookId || !look) return;
    if (look.status !== "completed") return;
    if (!look.imageFileId || !resultUrl) return;
    if (look.imageNoBgFileId) return;
    if (!deviceToken) return;
    const sourceImageFileId = look.imageFileId;
    enqueueBgRemoval({
      lookId,
      sourceImageFileId,
      srcUrl: resultUrl,
      deviceToken,
      upload: (file) => upload(file, GUARDS.lookCutout),
      attach: (args) =>
        attachBgRemoved({
          deviceToken,
          lookId,
          sourceImageFileId: args.sourceImageFileId,
          fileId: args.fileId,
        }),
      cleanup: (fileId) => deleteOrphan({ deviceToken, fileId }).then(() => undefined),
    });
  }, [
    lookId, look, resultUrl, deviceToken, upload, attachBgRemoved, deleteOrphan,
  ]);

  // Phase 2 — AI completed. Show the catalog flat-lay; the right-panel
  // hero is where the customer sees themselves wearing the saree (with
  // the bg-removed cutout). Decoupling the small thumbnail from the
  // cutout lifecycle also fixes a click-blocking bug: the cutout's
  // z-index 3 overlay used to swallow taps on the checkbox + remove
  // buttons (z-index 2), so "Move to Wardrobe" never appeared once a
  // tile flipped to completed.
  if (status === "completed") {
    return (
      <div className="k-card k-card-hover" style={{ aspectRatio: "1 / 1.2", overflow: "hidden" }}>
        <SareeThumb
          name={saree.name}
          fileId={saree.imageIds?.[3] ?? saree.imageIds?.[2] ?? saree.imageIds?.[0]}
          grad={saree.grad}
          emoji={saree.emoji}
          emojiSize={32}
          gradientAngle={135}
        />
      </div>
    );
  }

  // Phase 4 — failed.
  if (status === "failed") {
    const errMsg = look?.errorMessage ?? "Something went wrong";
    return (
      <div className="k-card" style={{
        aspectRatio: "1 / 1.2",
        position: "relative",
        overflow: "hidden",
      }}>
        <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
          padding: 12, gap: 8,
          background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,.55) 100%)",
        }}>
          <span className="k-chip k-chip-maroon" style={{ fontSize: 13 }}>
            {errMsg}
          </span>
          <button
            className="k-btn k-btn-primary k-btn-pill"
            style={{ padding: "8px 14px", fontSize: 13 }}
            onClick={(e) => {
              e.stopPropagation();
              if (!lookId) return;
              retryLookMut({ deviceToken, lookId })
                .catch((err: Error) => handleTryOnError(err, showToast));
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Wave animation — only reached for queued/processing/no-lookId
  // (status === "completed" + "failed" branch above). Always the
  // "generating" phase here; "polishing" was for the small-card cutout
  // transition which we no longer render.
  return (
    <div className="k-card" style={{ aspectRatio: "1 / 1.2", position: "relative", overflow: "hidden" }}>
      <div className="k-wave-stage" data-phase="generating">
        <div className="k-wave-image" style={{ position: "absolute", inset: 0 }}>
          <SareeThumb
            name={saree.name}
            fileId={saree.imageIds?.[3] ?? saree.imageIds?.[2] ?? saree.imageIds?.[0]}
            grad={saree.grad}
          />
        </div>
        <div className="k-wave-sheen" />
        <div className="k-wave-grain" />
        <div className="k-wave-veil" />
      </div>
    </div>
  );
}

// =========================================================================
// TrialPreviewImage — right-panel hero in the trial room.
//
// Same lifecycle phases as TrialTile, with two differences:
//   - Phase A/B captions are visible ("Draping your saree…" / "Polishing
//     the cutout…" + queue position when 2+ jobs are stacked).
//   - Phase 3 renders the cutout at ~80% of the panel with a soft drop
//     shadow and the ivory backdrop showing through.
//
// Bg removal itself is not enqueued from here — TrialTile owns the
// enqueue side-effect, and there's always a tile mounted whenever the
// preview is mounted, so we just observe.
// =========================================================================

function TrialPreviewImage({ saree, lookId }: {
  saree: SareeItem;
  lookId: Id<"looks"> | undefined;
}) {
  const look = useQuery(
    api.tryOn.getLook,
    lookId ? { lookId } : "skip",
  );
  const status = look?.status;
  const resultUrl = useConvexUrl(look?.imageFileId);
  const cutoutUrl = useConvexUrl(look?.imageNoBgFileId);
  const bgStatus = useBgRemovalStatus(lookId ?? null);

  // No look at all yet — plain catalog photo (e.g. saree just added,
  // runTryOn in flight but no row inserted yet).
  if (!lookId) {
    return (
      <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad} emoji={saree.emoji} emojiSize={160} gradientAngle={135} />
    );
  }

  // Phase 3 — cutout ready. Render at ~80% with the ivory wash behind.
  if (status === "completed" && cutoutUrl) {
    return (
      <div className="k-wave-stage is-revealed" style={{ position: "absolute", inset: 0 }}>
        <div className="k-trial-cutout is-shown">
          <img src={cutoutUrl} alt={saree.name} />
        </div>
      </div>
    );
  }

  // Phase A — AI is generating. Heavy blur, catalog photo as the base.
  // Phase B — AI done but cutout pending. Softer blur, AI render as the base.
  // Phase "failed" — bg removal bailed. Fall through to plain AI render.
  if (status === "completed" && bgStatus.state === "failed" && resultUrl) {
    return (
      <img src={resultUrl} alt={saree.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 14 }} />
    );
  }

  const isPolishing =
    status === "completed" || bgStatus.state === "queued" || bgStatus.state === "processing";
  const phase: "generating" | "polishing" = isPolishing ? "polishing" : "generating";

  const captionTitle = isPolishing ? "Polishing the cutout…" : "Draping your saree…";
  const captionSub =
    bgStatus.state === "queued" && bgStatus.total > 1
      ? `Next in line · ${bgStatus.position} of ${bgStatus.total}`
      : bgStatus.state === "processing"
        ? "Almost ready"
        : status === "queued" || !status
          ? "Awaiting render"
          : "Generating";

  return (
    <div className="k-wave-stage" data-phase={phase}>
      {resultUrl ? (
        <img className="k-wave-image" src={resultUrl} alt="" aria-hidden />
      ) : (
        <div className="k-wave-image" style={{ position: "absolute", inset: 0 }}>
          <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={saree.grad} emoji={saree.emoji} emojiSize={160} gradientAngle={135} />
        </div>
      )}
      <div className="k-wave-sheen" />
      <div className="k-wave-grain" />
      <div className="k-wave-veil" />
      <div className="k-wave-caption">
        <span className="k-wave-caption-title">{captionTitle}</span>
        <span className="k-wave-caption-sub">{captionSub}</span>
      </div>
    </div>
  );
}

// =========================================================================
// TrialHeroCutout — the centerpiece of the v2 trial room.
//
// Renders the bg-removed AI cutout of the active saree, anchored to the
// podium. Falls back to a wave (with the catalog photo or AI-with-bg as
// the under-image) while the look is still queued/processing/has-no-cutout.
// On bg-removal failure, falls through to the raw AI render.
// =========================================================================

function TrialHeroCutout({ saree, lookId }: {
  saree: SareeItem;
  lookId: Id<"looks"> | undefined;
}) {
  const look = useQuery(api.tryOn.getLook, lookId ? { lookId } : "skip");
  const status = look?.status;
  const resultUrl = useConvexUrl(look?.imageFileId);
  const cutoutUrl = useConvexUrl(look?.imageNoBgFileId);
  const bgStatus = useBgRemovalStatus(lookId ?? null);

  // Cutout ready — the goal: customer "standing on the pedestal" with
  // the kiosk's themed background showing through transparent edges.
  if (status === "completed" && cutoutUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={cutoutUrl} alt={saree.name} />;
  }

  // Bg-removal explicitly failed — fall back to raw AI render so the
  // customer isn't stuck on an infinite wave. Defense-in-depth path.
  // (Previously fell here on "still processing" too — that surfaced
  // the kitchen-backdrop scene briefly. Now gated on bgStatus.failed.)
  if (status === "completed" && bgStatus.state === "failed" && resultUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={resultUrl} alt={saree.name} style={{ borderRadius: 24 }} />
    );
  }

  // Otherwise still in flight (RunPod processing OR bg-removal queue).
  // Wave animation hides the in-progress state; under-image is the AI
  // render once we have it, else the catalog fallback.
  return (
    <div className="k-trial-v2-cutout-wave">
      <div className="k-wave-stage" data-phase={status === "completed" ? "polishing" : "generating"}>
        {resultUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="k-wave-image" src={resultUrl} alt="" aria-hidden />
        ) : (
          <div className="k-wave-image" style={{ position: "absolute", inset: 0 }}>
            <SareeThumb
              name={saree.name}
              fileId={saree.imageIds?.[3] ?? saree.imageIds?.[2] ?? saree.imageIds?.[0]}
              grad={saree.grad}
            />
          </div>
        )}
        <div className="k-wave-sheen" />
        <div className="k-wave-grain" />
        <div className="k-wave-veil" />
      </div>
    </div>
  );
}

// =========================================================================
// TrialCardV2 — left-rail card with WhatsApp share + X remove + Add to
// Cart (or "In Cart"). Catalog photo top, action strip bottom.
// =========================================================================

function TrialCardV2({ saree, lookId, deviceToken, active, inCart, onSelect, onShare, onRemove, onAddToCart }: {
  saree: SareeItem;
  // The completed look's id (or undefined). Drives the bg-removal
  // enqueue effect below so the hero cutout actually appears for
  // each saree in trial. Must be threaded from the parent — without
  // it, no one calls enqueueBgRemoval and the hero stays on the wave
  // forever (regression from the v1 → v2 layout refactor).
  lookId: Id<"looks"> | undefined;
  deviceToken: string;
  active: boolean;
  inCart: boolean;
  onSelect: () => void;
  onShare: () => void;
  onRemove: () => void;
  onAddToCart: () => void;
}) {
  // Subscribe to the look so we can decide when to enqueue bg-removal.
  // This subscription is per-card (one per trial item) — same shape as
  // commit 81ef8c9's TrialTile owned. Cheap: Convex dedups identical
  // useQuery calls within a tab.
  const look = useQuery(api.tryOn.getLook, lookId ? { lookId } : "skip");
  const resultUrl = useConvexUrl(look?.imageFileId);
  const { upload } = useUploadFile();
  const attachBgRemoved = useMutation(api.tryOn.attachBgRemovedImage);
  const deleteOrphan = useMutation(api.tryOn.deleteOrphanCutout);

  useEffect(() => {
    if (!lookId || !look) return;
    if (look.status !== "completed") return;
    if (!look.imageFileId || !resultUrl) return;
    if (look.imageNoBgFileId) return;
    if (!deviceToken) return;
    const sourceImageFileId = look.imageFileId;
    enqueueBgRemoval({
      lookId,
      sourceImageFileId,
      srcUrl: resultUrl,
      deviceToken,
      upload: (file) => upload(file, GUARDS.lookCutout),
      attach: (args) =>
        attachBgRemoved({
          deviceToken,
          lookId,
          sourceImageFileId: args.sourceImageFileId,
          fileId: args.fileId,
        }),
      cleanup: (fileId) => deleteOrphan({ deviceToken, fileId }).then(() => undefined),
    });
  }, [lookId, look, resultUrl, deviceToken, upload, attachBgRemoved, deleteOrphan]);

  return (
    <div
      className={`k-trial-card-v2${active ? " is-active" : ""}`}
      onClick={onSelect}
    >
      <div className="k-trial-card-v2-img">
        {/* Trial-rail thumbnail prefers slot 0 (model wearing the saree)
            so the card visually matches what the customer is trying on,
            with slots 3/2 only as fallback for older sarees that lack
            slot 0. Differs from the runTryOn garment-input chain (which
            wants the flat-lay slot 3) — different intent. */}
        <SareeThumb
          name={saree.name}
          fileId={saree.imageIds?.[0] ?? saree.imageIds?.[3] ?? saree.imageIds?.[2]}
          grad={saree.grad}
          emoji={saree.emoji}
          emojiSize={28}
          gradientAngle={135}
        />
        <button
          className="k-trial-card-v2-corner-btn is-wa"
          onClick={(e) => { e.stopPropagation(); onShare(); }}
          aria-label="Share on WhatsApp"
        >
          {/* Inline WhatsApp glyph — keeping the green color via parent class */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.59 1.38 5.07L2 22l5.07-1.38A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.07 14.07c-.21.6-1.21 1.16-1.7 1.21-.42.04-.96.06-1.55-.1-.36-.1-.82-.25-1.41-.5-2.49-1.07-4.12-3.58-4.24-3.74-.12-.16-1.01-1.34-1.01-2.56s.64-1.82.87-2.07c.23-.25.5-.31.66-.31s.33 0 .47.01c.15.01.36-.06.56.43.21.51.71 1.77.77 1.9.06.13.1.28.02.45-.08.17-.12.27-.24.42-.12.15-.25.34-.36.45-.12.12-.24.25-.1.49.13.24.6.99 1.29 1.6.88.79 1.62 1.04 1.86 1.16.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.05.1.05.6-.16 1.18z"/>
          </svg>
        </button>
        <button
          className="k-trial-card-v2-corner-btn is-x"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove from trial"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
      <button
        className={`k-trial-card-v2-cta${inCart ? " in-cart" : ""}`}
        onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
      >
        {inCart ? <><Check size={12} strokeWidth={3} /> In Cart</> : "Add to Cart"}
      </button>
    </div>
  );
}

// =========================================================================
// SareeDetailPanel — right-rail card showing the active saree's name,
// description, price, similar-categories carousel, and color swatches.
// =========================================================================

function SareeDetailPanel({ saree, onSelectSimilar }: {
  saree: SareeItem;
  onSelectSimilar: (s: { _id: Id<"sarees">; name: string; price: number; imageIds?: Id<"_storage">[]; grad?: string[]; emoji?: string }) => void;
}) {
  const similar = useQuery(api.sarees.listSimilar, { sareeId: saree._id, limit: 3 });

  // Color swatch palette — saree.colors[] are color names like "Pink",
  // "Blue", "Mustard". Map to a small named-color palette so the dots
  // render. Unknown names fall back to a neutral.
  const COLOR_MAP: Record<string, string> = {
    pink: "#E8959F", red: "#B53A48", maroon: "#7B1D1D", blue: "#3A6FB5",
    navy: "#1F3A6E", teal: "#1F827E", green: "#3F8A4D", olive: "#717C32",
    yellow: "#E8C84A", mustard: "#C9941A", gold: "#C9941A", orange: "#D6803C",
    purple: "#6B3A87", lavender: "#B8A3D6", black: "#1A1A1A", white: "#F5F0E6",
    cream: "#EFE3CF", beige: "#D9C9A8", brown: "#7C5A3C", grey: "#999",
    gray: "#999", silver: "#C8C8CC",
  };
  const swatches = (saree.colors ?? []).slice(0, 5).map((c) => {
    const key = c.toLowerCase().trim();
    return COLOR_MAP[key] ?? "#9C8878";
  });

  return (
    <div className="k-trial-v2-right">
      <div className="k-trial-v2-right-name">{saree.name}</div>
      {saree.description && (
        <div className="k-trial-v2-right-desc">{saree.description.slice(0, 80)}{saree.description.length > 80 ? "…" : ""}</div>
      )}
      <div className="k-trial-v2-right-price">₹{fmtPrice(saree.price)}</div>
      <div className="k-trial-v2-right-divider" />

      <div className="k-trial-v2-right-section-h">
        <span>Similar Categories</span>
        <span className="arrow"><ChevronRight size={14} /></span>
      </div>
      <div className="k-trial-v2-similar">
        {similar === undefined ? (
          <>
            <div className="k-trial-v2-similar-thumb" style={{ background: "rgba(255,255,255,.12)" }} />
            <div className="k-trial-v2-similar-thumb" style={{ background: "rgba(255,255,255,.12)" }} />
            <div className="k-trial-v2-similar-thumb" style={{ background: "rgba(255,255,255,.12)" }} />
          </>
        ) : (
          similar.map((s) => (
            <div
              key={s._id}
              className="k-trial-v2-similar-thumb"
              onClick={() => onSelectSimilar(s)}
              role="button"
              aria-label={`View ${s.name}`}
            >
              <SareeThumb
                name={s.name}
                fileId={s.imageIds?.[3] ?? s.imageIds?.[2] ?? s.imageIds?.[0]}
                grad={s.grad}
                emoji={s.emoji}
                emojiSize={20}
              />
            </div>
          ))
        )}
      </div>

      {swatches.length > 0 && (
        <>
          <div className="k-trial-v2-right-divider" />
          <div className="k-trial-v2-right-section-h">
            <span>Select Color</span>
          </div>
          <div className="k-trial-v2-colors">
            {swatches.map((color, i) => (
              <div
                key={i}
                className="k-trial-v2-color-dot"
                style={{ background: color }}
                aria-label={saree.colors?.[i]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── TRIAL ROOM ── */
function TrialRoomScreen({ items, wardrobeItems, cartItemIds, customerName, phone, onAddToCart, onRemoveItem, onAddToWardrobe, onGoHome, onGoToWardrobe, onLogout, showToast, maxTrial, tryOnSec, sareeLookIds, retryLookMut, deviceToken, navigate, setPendingFanOut, cartCount, storeName, storeLogoFileId }: {
  items: SareeItem[]; wardrobeItems: SareeItem[]; onRemoveItem: (id: Id<"sarees">) => void;
  // Sareeids currently in the cart — for showing "In Cart" state on trial cards.
  cartItemIds: Set<string>;
  customerName: string;
  phone: string;
  // One-tap add to cart from the trial-room card. Parent fires the
  // mutation + updates local cart + emits a toast. Saree stays in trial.
  onAddToCart: (saree: SareeItem) => void;
  onAddToWardrobe: (items: SareeItem[]) => void; onGoHome: () => void; onGoToWardrobe: () => void; onLogout: () => void;
  showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void; maxTrial: number; tryOnSec: number;
  sareeLookIds: Record<string, Id<"looks">>;
  retryLookMut: (args: { deviceToken: string; lookId: Id<"looks"> }) => Promise<{ lookId: Id<"looks"> }>;
  deviceToken: string;
  navigate: (s: Screen, product?: SareeItem) => void;
  setPendingFanOut: (v: boolean) => void;
  cartCount: number;
  storeName?: string;
  storeLogoFileId?: Id<"_storage">;
}) {
  const [timer, setTimer] = useState(tryOnSec);
  const [selIdx, setSelIdx] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [endCountdown, setEndCountdown] = useState(CFG.trialEndAutoLogoutSec);
  const [retakeOpen, setRetakeOpen] = useState(false);

  useEffect(() => { if (timer <= 0) { setShowEnd(true); return; } const t = setTimeout(() => setTimer((v) => v - 1), 1000); return () => clearTimeout(t); }, [timer]);

  // Auto-logout grace timer on the "Time's Up" popup. Re-initializes every
  // time the popup opens so a Continue → re-trigger sequence gets a fresh
  // 3-minute window. Cleared when the popup closes (Continue button) or
  // when the user explicitly hits Logout.
  useEffect(() => {
    if (!showEnd) return;
    setEndCountdown(CFG.trialEndAutoLogoutSec);
  }, [showEnd]);

  useEffect(() => {
    if (!showEnd) return;
    if (endCountdown <= 0) {
      onLogout();
      return;
    }
    const t = setTimeout(() => setEndCountdown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [showEnd, endCountdown, onLogout]);

  // Close the Retake confirm modal when the session-end overlay takes over —
  // both use .k-overlay (z-index 100), so without this the retake modal would
  // sit above the Time's Up dialog due to render order.
  useEffect(() => { if (showEnd && retakeOpen) setRetakeOpen(false); }, [showEnd, retakeOpen]);

  // Clamp selIdx as items list shrinks (X-out of the active card etc.).
  const safeSelIdx = Math.min(selIdx, Math.max(0, items.length - 1));
  const current = items[safeSelIdx] || items[0];

  // WhatsApp share for a single saree — opens wa.me with prefilled text.
  // Mirrors /c/looks/[id] handleShare. Customer name personalizes if known.
  const handleShareSaree = (saree: SareeItem) => {
    const greet = customerName ? `${customerName}, check out` : "Check out";
    const msg = encodeURIComponent(
      `${greet} this beautiful ${saree.name} saree at ${storeName ?? "Wearify"}! ₹${fmtPrice(saree.price)}`,
    );
    window.open(`https://wa.me/${phone ? phone.replace(/[^\d]/g, "") : ""}?text=${msg}`, "_blank");
  };

  // Add the currently-active (right-panel-visible) saree to wardrobe,
  // then redirect into the wardrobe so the customer lands where the
  // item just went.
  const addActiveToWardrobe = () => {
    if (!current) return;
    onAddToWardrobe([current]);
    showToast("Added to wardrobe", "success");
    onGoToWardrobe();
  };

  if (items.length === 0) return (
    <div className="k-shell">
      <KioskHeader
        trialCount={items.length}
        wardrobeCount={wardrobeItems.length}
        cartCount={cartCount}
        goHome={onGoHome}
        triggerLogout={onLogout}
        navigate={navigate}
        storeName={storeName}
        storeLogoFileId={storeLogoFileId}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="k-popIn" style={{
          width: 110, height: 110, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(104,38,42,.08), rgba(201,148,26,.1))",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--k-maroon)",
        }}>
          <Shirt size={52} strokeWidth={1.6} />
        </div>
        <h2 className="k-display k-slideUp k-d2" style={{ fontSize: 24, color: "var(--k-text)", marginTop: 18 }}>Trial Room Empty</h2>
        <p className="k-slideUp k-d3" style={{ fontSize: 13, color: "var(--k-text-muted)", marginTop: 4 }}>Select sarees from the catalog to get started</p>
        <button onClick={onGoHome} className="k-btn k-btn-primary k-btn-pill k-press k-slideUp k-d4" style={{ marginTop: 22, padding: "14px 32px", fontSize: 16, fontWeight: 600 }}>
          Browse Sarees <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const similar = items.filter((s) => s._id !== current?._id).slice(0, 3);
  const colors = ["#a3c8ad", "#cb9d7a", "#c44141", "#f0d96b", "#3878b6"];

  return (
    <div className="k-trial-v2-shell">
      {/* Page-level header (logo + name + 4 action icons) — kept as the
          existing KioskHeader. Sits at top in normal flow; the
          immersive stage below fills the remaining viewport. */}
      <KioskHeader
        trialCount={items.length}
        wardrobeCount={wardrobeItems.length}
        cartCount={cartCount}
        goHome={onGoHome}
        triggerLogout={onLogout}
        navigate={navigate}
        storeName={storeName}
        storeLogoFileId={storeLogoFileId}
      />

      {/* Immersive stage — everything from here lives below the header */}
      <div className="k-trial-v2-stage">
      {/* Full-bleed background image */}
      <div className="k-trial-v2-bg" />

      {/* Decorative podium asset anchored at the floor */}
      <div className="k-trial-v2-podium">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/poduim.png" alt="" aria-hidden />
      </div>

      {/* Customer cutout — bg-removed AI render of the active saree */}
      {current && (
        <div className="k-trial-v2-cutout">
          <TrialHeroCutout saree={current} lookId={sareeLookIds[current._id]} />
        </div>
      )}

      {/* Subhead — back-arrow / Trial Room pill + timer / retake camera */}
      <div className="k-trial-v2-subhead">
        <button
          onClick={onGoHome}
          aria-label="Back"
          className="k-trial-v2-iconbtn"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="k-trial-v2-subhead-center">
          <div className="k-trial-v2-pill">Trial Room</div>
          <div className="k-trial-v2-timer" style={{ color: timer <= 30 ? "var(--k-red)" : undefined }}>
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </div>
        </div>
        <button
          onClick={() => setRetakeOpen(true)}
          aria-label="Retake body scan"
          className="k-trial-v2-iconbtn"
          title="Retake body scan"
        >
          <Camera size={20} />
        </button>
      </div>

      {/* Left rail — Selected Sarees */}
      <div className="k-trial-v2-left">
        <div className="k-trial-v2-left-header">Selected Sarees</div>
        <div className="k-trial-v2-left-stack">
          {items.map((saree, idx) => (
            <TrialCardV2
              key={saree._id}
              saree={saree}
              lookId={sareeLookIds[saree._id]}
              deviceToken={deviceToken}
              active={idx === safeSelIdx}
              inCart={cartItemIds.has(saree._id)}
              onSelect={() => setSelIdx(idx)}
              onShare={() => handleShareSaree(saree)}
              onRemove={() => onRemoveItem(saree._id)}
              onAddToCart={() => onAddToCart(saree)}
            />
          ))}
        </div>
        <button className="k-trial-v2-add-more" onClick={onGoHome}>
          Add More
        </button>
      </div>

      {/* Right rail — saree detail */}
      {current && (
        <SareeDetailPanel
          saree={current}
          onSelectSimilar={(s) => {
            // Tapping a similar-categories thumb: if the saree is already
            // in the trial rail, switch the active preview to it. If not,
            // jump to its product detail page so the customer can add it.
            const idx = items.findIndex((i) => i._id === s._id);
            if (idx >= 0) {
              setSelIdx(idx);
            } else {
              navigate("productDetail", s as SareeItem);
            }
          }}
        />
      )}

      {/* Bottom dock — two stacked CTAs centered above the podium */}
      <div className="k-trial-v2-dock">
        <button
          className="k-trial-v2-dock-pill is-light"
          onClick={addActiveToWardrobe}
          disabled={!current}
        >
          <ShoppingBag size={18} style={{ marginRight: 10 }} />
          Add to Wardrobe
          <span className="badge">1</span>
        </button>
        <button
          className="k-trial-v2-dock-pill is-dark"
          onClick={onGoToWardrobe}
        >
          Go to Wardrobe
          <span className="arrow">
            <ChevronRight size={18} />
          </span>
        </button>
      </div>
      </div>{/* /.k-trial-v2-stage */}

      {/* Time's up dialog */}
      {showEnd && (
        <div className="k-overlay">
          <div className="k-modal k-scaleIn" style={{ maxWidth: 400 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Time&apos;s Up!</h3>
            <p style={{ fontSize: 15, color: "var(--k-text-muted)", marginBottom: 8 }}>Session ending. Continue or logout?</p>
            <p style={{ fontSize: 13, color: "var(--k-red)", fontWeight: 600, marginBottom: 20 }}>
              Auto-logout in {Math.floor(endCountdown / 60)}:{String(endCountdown % 60).padStart(2, "0")}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onLogout} className="k-press" style={{
                flex: 1, padding: 16, borderRadius: "var(--k-r-pill)",
                background: "var(--k-red)", color: "#fff", border: "none",
                fontSize: 16, fontWeight: 600, cursor: "pointer",
              }}>Logout</button>
              <button onClick={() => { setTimer((v) => v + CFG.trialEndContinueSec); setShowEnd(false); }} className="k-press" style={{
                flex: 1, padding: 16, borderRadius: "var(--k-r-pill)",
                background: "transparent", border: "1.5px solid var(--k-border)",
                fontSize: 16, fontWeight: 600, cursor: "pointer",
              }}>Continue (+2 min)</button>
            </div>
          </div>
        </div>
      )}

      {/* Retake body scan confirm modal */}
      {retakeOpen && (
        <RetakeConfirmModal
          onClose={() => setRetakeOpen(false)}
          onConfirm={(alsoRefresh) => {
            navigate("scanChoice");
            setRetakeOpen(false);
            if (alsoRefresh) {
              setPendingFanOut(true);
            }
          }}
        />
      )}
    </div>
  );
}

/* ── RETAKE CONFIRM MODAL ── */
function RetakeConfirmModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (alsoRefresh: boolean) => void;
}) {
  return (
    <div className="k-overlay" onClick={onClose}>
      <div className="k-card" onClick={(e) => e.stopPropagation()} style={{
        maxWidth: 420, padding: 24, gap: 16,
        display: "flex", flexDirection: "column",
      }}>
        <h3 className="k-heading" style={{ margin: 0 }}>Retake body scan?</h3>
        <p style={{ color: "var(--k-text-muted)", margin: 0 }}>
          We&apos;ll capture a fresh scan. Should we also refresh the
          looks already in your trial room with the new pose?
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="k-btn k-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="k-btn k-btn-secondary" onClick={() => onConfirm(false)}>
            Just retake
          </button>
          <button className="k-btn k-btn-primary" onClick={() => onConfirm(true)}>
            Retake + refresh
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── WARDROBE ── */
// Per-saree thumbnail that subscribes to the bound look (if any) and shows
// the AI try-on render once the look completes. Mirrors TrialTile's pattern
// so wardrobe cards stay reactive to in-flight try-on jobs.
function WardrobeCardImg({ saree, lookId, serverLookFileId, serverCutoutFileId }: {
  saree: SareeItem;
  lookId?: Id<"looks">;
  serverLookFileId?: Id<"_storage">;
  serverCutoutFileId?: Id<"_storage">;
}) {
  const look = useQuery(api.tryOn.getLook, lookId ? { lookId } : "skip");
  const liveCutout = look?.status === "completed" ? look.imageNoBgFileId ?? undefined : undefined;
  const liveRender = look?.status === "completed" ? look.imageFileId ?? undefined : undefined;
  // Priority: live cutout (best — transparent bg) → server cutout → live render → server render → catalog
  const fileId =
    liveCutout ??
    serverCutoutFileId ??
    liveRender ??
    serverLookFileId ??
    saree.imageIds?.[3] ??
    saree.imageIds?.[2] ??
    saree.imageIds?.[0];
  return (
    <SareeThumb
      name={saree.name}
      fileId={fileId}
      grad={saree.grad}
      emoji={saree.emoji}
      emojiSize={24}
      gradientAngle={135}
    />
  );
}

function WardrobeScreen({ items, lookImages, lookCutouts, sareeLookIds, cartItemIds, onToggleInCart, onRemoveFromWardrobe, navigate, goHome, triggerLogout, trialCount, wardrobeCount, cartCount, storeName, storeLogoFileId }: {
  items: SareeItem[];
  lookImages: Record<string, Id<"_storage">>;
  lookCutouts: Record<string, Id<"_storage">>;
  sareeLookIds: Record<string, Id<"looks">>;
  cartItemIds: Set<string>;
  onToggleInCart: (saree: SareeItem) => void;
  onRemoveFromWardrobe: (saree: SareeItem) => void;
  navigate: (s: Screen, product?: SareeItem) => void; goHome: () => void; triggerLogout: () => void;
  trialCount: number; wardrobeCount: number; cartCount: number; maxWardrobe: number;
  storeName?: string; storeLogoFileId?: Id<"_storage">;
}) {
  const [selIdx, setSelIdx] = useState(0);
  const shelfRef = useRef<HTMLDivElement>(null);
  const safeIdx = Math.min(selIdx, Math.max(0, items.length - 1));
  const active = items[safeIdx];

  // Live look subscription for the showcase — mirrors WardrobeCardImg so the
  // center model picks up the AI render the moment the look completes, even
  // if the server-persisted wardrobe row hasn't been re-fetched yet.
  const activeLookId = active ? sareeLookIds[active._id] : undefined;
  const activeLook = useQuery(api.tryOn.getLook, activeLookId ? { lookId: activeLookId } : "skip");
  const activeLiveCutout = activeLook?.status === "completed" ? activeLook.imageNoBgFileId ?? undefined : undefined;
  const activeLiveRender = activeLook?.status === "completed" ? activeLook.imageFileId ?? undefined : undefined;
  const activeShowcaseFileId = active
    ? activeLiveCutout
      ?? lookCutouts[active._id]
      ?? activeLiveRender
      ?? lookImages[active._id]
      ?? active.imageIds?.[3]
      ?? active.imageIds?.[2]
      ?? active.imageIds?.[0]
    : undefined;

  return (
    <div className="k-ward-shell">
      <KioskHeader
        trialCount={trialCount}
        wardrobeCount={wardrobeCount}
        cartCount={cartCount}
        goHome={goHome}
        triggerLogout={triggerLogout}
        navigate={navigate}
        storeName={storeName}
        storeLogoFileId={storeLogoFileId}
      />

      <div className="k-ward-actions">
        <button onClick={goHome} className="k-ward-back k-press" aria-label="Back">
          <ChevronLeft size={26} color="var(--k-maroon)" strokeWidth={2.25} />
        </button>
        <div className="k-ward-pill">
          My Wardrobe <Heart size={20} fill="var(--k-maroon)" color="var(--k-maroon)" />
        </div>
        <button onClick={goHome} className="k-ward-home k-press" aria-label="Home">
          <Home size={22} color="var(--k-maroon)" strokeWidth={2.25} fill="var(--k-maroon)" />
        </button>
      </div>

      <div className="k-ward-stage">
        {/* Full-bleed wardrobe background — covers the whole stage */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/wardrobe.svg" alt="" aria-hidden className="k-ward-bg" />

        <div className="k-ward-content">
          {/* Left — small saree cards stacked on the wardrobe shelves */}
          <div className="k-ward-left">
            <button
              className="k-ward-scroll-btn"
              onClick={() => shelfRef.current?.scrollBy({ top: -200, behavior: "smooth" })}
              aria-label="Scroll up"
            >
              <ChevronUp size={18} strokeWidth={2.25} />
            </button>
            <div ref={shelfRef} className="k-ward-shelf k-no-scroll">
              {items.length === 0 ? (
                <div style={{ padding: "20px 12px", textAlign: "center", color: "var(--k-text-muted)", fontSize: 12 }}>
                  No sarees in wardrobe yet
                </div>
              ) : (
                items.map((saree, i) => {
                  const inCart = cartItemIds.has(saree._id);
                  return (
                    <div
                      key={saree._id}
                      className={`k-ward-card${i === safeIdx ? " is-active" : ""}`}
                      onClick={() => setSelIdx(i)}
                    >
                      <div className="k-ward-card-img">
                        <WardrobeCardImg
                          saree={saree}
                          lookId={sareeLookIds[saree._id]}
                          serverLookFileId={lookImages[saree._id]}
                          serverCutoutFileId={lookCutouts[saree._id]}
                        />
                      </div>
                      <div className="k-ward-card-info">
                        <div className="k-ward-card-name">{saree.name}</div>
                        <div className="k-ward-card-price">₹{fmtPrice(saree.price)}</div>
                        <div className="k-ward-card-actions">
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleInCart(saree); }}
                            className={`k-ward-card-btn k-ward-card-btn-cart k-press${inCart ? " is-in-cart" : ""}`}
                          >
                            {inCart ? <Check size={9} strokeWidth={3} /> : <ShoppingBag size={9} strokeWidth={2.5} />}
                            {inCart ? "In Cart" : "Add To Cart"}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemoveFromWardrobe(saree); }}
                            className="k-ward-card-btn k-ward-card-btn-remove k-press"
                          >
                            <Trash2 size={9} strokeWidth={2.25} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              className="k-ward-scroll-btn"
              onClick={() => shelfRef.current?.scrollBy({ top: 200, behavior: "smooth" })}
              aria-label="Scroll down"
            >
              <ChevronDown size={18} strokeWidth={2.25} />
            </button>
          </div>

          {/* Center — model standing on the wardrobe podium */}
          <div className="k-ward-center">
            {active ? (
              <div className="k-ward-look">
                <SareeThumb
                  name={active.name}
                  fileId={activeShowcaseFileId}
                  grad={active.grad}
                  emoji={active.emoji}
                  emojiSize={64}
                  gradientAngle={135}
                  style={{ objectFit: "contain", objectPosition: "center bottom" }}
                />
              </div>
            ) : (
              <div className="k-ward-empty">
                <Heart size={48} strokeWidth={1.6} color="var(--k-maroon)" />
                <div style={{ fontSize: 16, color: "var(--k-text)", fontWeight: 600 }}>Your wardrobe is empty</div>
                <button onClick={goHome} className="k-btn k-btn-primary k-btn-pill k-press" style={{ marginTop: 6 }}>
                  Browse Sarees <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Floating CTA — Move to Cart pill */}
        {active && (
          <div className="k-ward-cta-wrap">
            <button
              onClick={() => onToggleInCart(active)}
              className="k-ward-cta k-press"
              disabled={cartItemIds.has(active._id)}
            >
              <span className="k-ward-cta-icon">
                <ShoppingBag size={16} color="#fff" strokeWidth={2.25} />
              </span>
              {cartItemIds.has(active._id) ? "In Cart" : "Move to Cart"}
            </button>
          </div>
        )}
      </div>

      <div className="k-detail-footer">
        © Copyright PHYGIFY TECHNO SERVICES PVT. LTD .
      </div>
    </div>
  );
}

/* ── ORDER ── */
function OrderScreen({ cart, recentlyViewed, onUpdateQty, onRemoveItem, onCheckout, onFindTailor, onProductTap, onBack, navigate, goHome, triggerLogout, trialCount, wardrobeCount, cartCount, storeName, storeLogoFileId }: {
  cart: Array<SareeItem & { qty: number }>;
  recentlyViewed: SareeItem[];
  onUpdateQty: (idx: number, delta: number) => void;
  onRemoveItem: (idx: number) => void;
  onCheckout: () => Promise<void>; onFindTailor: () => void;
  onProductTap: (saree: SareeItem) => void; onBack: () => void;
  navigate: (s: Screen, product?: SareeItem) => void; goHome: () => void; triggerLogout: () => void;
  trialCount: number; wardrobeCount: number; cartCount: number;
  storeName?: string; storeLogoFileId?: Id<"_storage">;
}) {
  const [showQR, setShowQR] = useState(false);
  const [qrExp, setQrExp] = useState(600);
  const recentRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!showQR || qrExp <= 0) return; const t = setTimeout(() => setQrExp((v) => v - 1), 1000); return () => clearTimeout(t); }, [showQR, qrExp]);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = cart.reduce((s, i) => s + i.price * i.qty * (i.price < 1000 ? 0.05 : 0.12), 0);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="k-cart-shell">
      <KioskHeader
        trialCount={trialCount}
        wardrobeCount={wardrobeCount}
        cartCount={cartCount}
        goHome={goHome}
        triggerLogout={triggerLogout}
        navigate={navigate}
        storeName={storeName}
        storeLogoFileId={storeLogoFileId}
      />

      <div className="k-cart-actions">
        <button onClick={onBack} className="k-cart-back k-press" aria-label="Back">
          <ChevronLeft size={26} color="var(--k-maroon)" strokeWidth={2.25} />
        </button>
        <div className="k-cart-title-wrap">
          <div className="k-cart-title">Your Cart</div>
          <div className="k-cart-subtitle">
            {cart.length === 0
              ? "Cart is empty"
              : `${cart.length} ${cart.length === 1 ? "Item" : "Items"} In Your Cart`}
          </div>
        </div>
        <button onClick={goHome} className="k-cart-home k-press" aria-label="Home">
          <Home size={22} color="var(--k-maroon)" strokeWidth={2.25} fill="var(--k-maroon)" />
        </button>
      </div>

      <div className="k-cart-content">
        {cart.length === 0 ? (
          <div className="k-cart-empty">
            <ShoppingCart size={48} strokeWidth={1.6} color="var(--k-maroon)" />
            <div style={{ fontSize: 16, color: "var(--k-text)", fontWeight: 600 }}>Your cart is empty</div>
            <button onClick={goHome} className="k-btn k-btn-primary k-btn-pill k-press" style={{ marginTop: 6 }}>
              Browse Sarees <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="k-cart-grid">
              {/* Left — cart items */}
              <div className="k-cart-list">
                {cart.map((item, idx) => (
                  <div key={`${item._id}-${idx}`} className="k-cart-card">
                    <div className="k-cart-card-img">
                      <SareeThumb
                        name={item.name}
                        fileId={item.imageIds?.[0]}
                        grad={item.grad}
                        emoji={item.emoji}
                        emojiSize={28}
                        gradientAngle={135}
                      />
                    </div>
                    <div className="k-cart-card-info">
                      <div className="k-cart-card-name">{item.name}</div>
                      <div className="k-cart-card-meta">{item.description ?? "Description"}</div>
                      <div className="k-cart-card-meta">
                        Color: {item.colors?.[0] ? "—" : "Default"}
                      </div>
                      <div className="k-cart-card-price">₹{fmtPrice(item.price)}</div>
                      <div className="k-cart-qty">
                        <button
                          onClick={() => onUpdateQty(idx, -1)}
                          className="k-cart-qty-btn"
                          aria-label="Decrease"
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="k-cart-qty-val">{item.qty}</span>
                        <button
                          onClick={() => onUpdateQty(idx, 1)}
                          className="k-cart-qty-btn"
                          aria-label="Increase"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => {/* share placeholder */}}
                      className="k-cart-share"
                      aria-label="Share"
                    >
                      <Upload size={14} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="k-cart-remove"
                      aria-label="Remove"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Right — order summary */}
              <div className="k-cart-summary">
                <div className="k-cart-summary-title">Order Summary</div>
                <div className="k-cart-summary-row">
                  <span>Subtotal ({totalQty})</span>
                  <span>₹{fmtPrice(subtotal)}</span>
                </div>
                <div className="k-cart-summary-row">
                  <span>GST (18%)</span>
                  <span>₹{fmtPrice(Math.round(gst))}</span>
                </div>
                <div className="k-cart-summary-divider" />
                <div className="k-cart-summary-total">
                  <span className="k-cart-summary-total-label">Total</span>
                  <span className="k-cart-summary-total-value">₹{fmtPrice(Math.round(subtotal + gst))}</span>
                </div>
                <div className="k-cart-summary-note">
                  The total amount you pay includes all applicable customs duties &amp; taxes.
                  We guarantee no additional charges on delivery.
                </div>
                <button onClick={onFindTailor} className="k-cart-tailor-btn k-press">
                  <Scissors size={14} /> Find Tailor <ArrowRight size={14} />
                </button>
                <button
                  onClick={async () => { await onCheckout(); setShowQR(true); }}
                  className="k-cart-checkout-btn k-press"
                  disabled={cart.length === 0}
                >
                  Proceed To Checkout
                </button>
              </div>
            </div>

            {/* QR card — appears after checkout */}
            {showQR && (
              <div className="k-cart-qr-card k-slideUp">
                <div className="k-cart-qr-box">
                  <QrCode size={84} strokeWidth={1.4} />
                </div>
                <div className="k-cart-qr-info">
                  <div className="k-cart-qr-title">Show to Store Team</div>
                  <div className="k-cart-qr-timer">
                    Expires in {Math.floor(qrExp / 60)}:{String(qrExp % 60).padStart(2, "0")}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="k-cart-recent">
            <div className="k-cart-recent-head">
              <div className="k-cart-recent-title">Recently Viewed Products</div>
              <div className="k-detail-similar-nav">
                <button
                  className="k-detail-nav-btn"
                  onClick={() => recentRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} color="var(--k-text)" strokeWidth={2.25} />
                </button>
                <button
                  className="k-detail-nav-btn"
                  onClick={() => recentRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
                  aria-label="Next"
                >
                  <ChevronRight size={18} color="var(--k-text)" strokeWidth={2.25} />
                </button>
              </div>
            </div>
            <div ref={recentRef} className="k-cart-recent-rail k-no-scroll">
              {recentlyViewed.map((s) => (
                <div
                  key={s._id}
                  className="k-cart-recent-card"
                  onClick={() => onProductTap(s)}
                >
                  <SareeThumb
                    name={s.name}
                    fileId={s.imageIds?.[0]}
                    grad={s.grad}
                    emoji={s.emoji}
                    emojiSize={32}
                    gradientAngle={135}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="k-detail-footer">
        © Copyright PHYGIFY TECHNO SERVICES PVT. LTD .
      </div>
    </div>
  );
}

/* ── TAILORS ── */
function TailorScreen({
  storeCity,
  storeId,
  storeName,
  customerId,
  customerName,
  customerPhone,
  onBack,
  showToast,
  navigate,
  goHome,
  triggerLogout,
  trialCount,
  wardrobeCount,
  cartCount,
  storeLogoFileId,
  allSarees,
}: {
  storeCity: string;
  storeId: string;
  storeName: string;
  customerId: Id<"customers"> | null;
  customerName: string;
  customerPhone: string;
  onBack: () => void;
  showToast: (msg: string, type: "info" | "success" | "error" | "warning") => void;
  navigate: (s: Screen, product?: SareeItem) => void;
  goHome: () => void;
  triggerLogout: () => void;
  trialCount: number;
  wardrobeCount: number;
  cartCount: number;
  storeLogoFileId?: Id<"_storage">;
  allSarees: SareeItem[];
}) {
  const tailors = useQuery(api.tailorOps.listByCity, storeCity ? { city: storeCity } : "skip");
  const createReferral = useMutation(api.tailorOps.createReferral);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [viewing, setViewing] = useState<NonNullable<typeof tailors>[number] | null>(null);
  const [filter, setFilter] = useState<"sort" | "recommended" | "nearby" | "topRated">("sort");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function handleConnect(t: {
    _id: Id<"tailors">;
    tailorId: string;
    name: string;
    phone: string;
  }) {
    const phoneDigits = (t.phone || "").replace(/[^0-9]/g, "");
    if (!phoneDigits) {
      showToast("Tailor contact not available", "warning");
      return;
    }
    setConnecting(t._id);
    try {
      if (customerId && customerName && customerPhone) {
        try {
          await createReferral({
            tailorId: t.tailorId,
            customerId,
            customerName,
            customerPhone,
            storeId: storeId || undefined,
            storeName: storeName || undefined,
            measurementsShared: true,
            date: new Date().toISOString().slice(0, 10),
          });
        } catch { /* analytics-level failure, don't block WhatsApp handoff */ }
      }
      const intro = customerName ? `Hi ${t.name}, I'm ${customerName}` : `Hi ${t.name}`;
      const storeLine = storeName ? ` at ${storeName}` : "";
      const msg = `${intro}${storeLine}. I'd like to discuss a blouse stitching job. (via Wearify)`;
      window.open(
        `https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
      showToast("Opening WhatsApp…", "success");
    } finally {
      setConnecting(null);
    }
  }

  // Sort/filter the list reactively. Without geo data, "Near By" falls back
  // to the unsorted list; "Top Rated" sorts by rating descending; "Sort By"
  // and "Recommended" use the canonical order from the query.
  const visibleTailors = (() => {
    if (!tailors) return [];
    const arr = [...tailors];
    if (filter === "topRated") arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return showAll ? arr : arr.slice(0, 6);
  })();

  return (
    <div className="k-tailor-shell">
      <KioskHeader
        trialCount={trialCount}
        wardrobeCount={wardrobeCount}
        cartCount={cartCount}
        goHome={goHome}
        triggerLogout={triggerLogout}
        navigate={navigate}
        storeName={storeName}
        storeLogoFileId={storeLogoFileId}
      />

      <div className="k-tailor-actions">
        <button onClick={onBack} className="k-tailor-back k-press" aria-label="Back">
          <ChevronLeft size={26} color="var(--k-maroon)" strokeWidth={2.25} />
        </button>
        <div className="k-tailor-pill">Expert Tailor</div>
        <button onClick={goHome} className="k-tailor-home k-press" aria-label="Home">
          <Home size={22} color="var(--k-maroon)" strokeWidth={2.25} fill="var(--k-maroon)" />
        </button>
      </div>

      <div className="k-tailor-filters">
        <button
          onClick={() => setFilter("sort")}
          className="k-tailor-chip k-tailor-chip-sort"
        >
          Sort By
          <ChevronRight size={12} strokeWidth={3} />
        </button>
        {([
          { id: "recommended", label: "Recommended" },
          { id: "nearby", label: "Near By" },
          { id: "topRated", label: "Top Rated" },
        ] as const).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`k-tailor-chip${filter === f.id ? " is-active" : ""}`}
          >
            <span className="k-tailor-chip-check">
              {filter === f.id && <Check size={9} strokeWidth={3} />}
            </span>
            {f.label}
          </button>
        ))}
      </div>

      <div className="k-tailor-content">
        {!tailors ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--k-text-muted)" }}>
            <Loader2 size={28} className="k-spin" style={{ color: "var(--k-maroon)" }} />
          </div>
        ) : tailors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--k-text-muted)" }}>
            <div style={{
              width: 80, height: 80, margin: "0 auto 12px",
              borderRadius: "50%", background: "rgba(104,38,42,.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--k-maroon)",
            }}>
              <Scissors size={34} strokeWidth={1.6} />
            </div>
            <div style={{ fontSize: 14 }}>No tailors found in this area</div>
          </div>
        ) : (
          <>
            {visibleTailors.map((t, i) => {
              const liked = likedIds.has(t._id);
              // Mock portfolio — pull 3 catalog images, rotated per tailor index
              // so each card shows a distinct trio. This is a UI-only stand-in
              // until real portfolio uploads land on the tailor schema.
              const portfolio = [0, 1, 2].map((k) => allSarees[(i * 3 + k) % Math.max(allSarees.length, 1)]);
              const initial = (t.name || "?").trim().charAt(0).toUpperCase();
              const happy = t.referrals ?? t.reviewCount ?? 0;
              const happyLabel = happy >= 1000 ? `${Math.round(happy / 100) / 10}k+` : happy >= 100 ? `${Math.floor(happy / 100) * 100}+` : `${happy}`;
              return (
                <div
                  key={t._id}
                  className="k-tailorx-card k-slideUp"
                  onClick={() => setViewing(t)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                >
                  <div className="k-tailorx-portfolio">
                    {portfolio.map((s, k) => (
                      <div key={k} className="k-tailorx-portfolio-cell">
                        {s ? (
                          <SareeThumb
                            name={s.name}
                            fileId={s.imageIds?.[0]}
                            grad={s.grad}
                            emoji={s.emoji}
                            emojiSize={28}
                            gradientAngle={135}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "var(--k-bg-warm)" }} />
                        )}
                      </div>
                    ))}
                    <span className="k-tailorx-map-pill">📍 Show on Map</span>
                    <button
                      className="k-tailorx-heart"
                      onClick={(e) => { e.stopPropagation(); toggleLike(t._id); }}
                      aria-label={liked ? "Unlike" : "Like"}
                    >
                      <Heart size={14} fill={liked ? "#E53935" : "transparent"} color={liked ? "#E53935" : "var(--k-text-mid)"} strokeWidth={2} />
                    </button>
                  </div>

                  <div className="k-tailorx-info">
                    <div className="k-tailorx-avatar">{initial}</div>
                    <div className="k-tailorx-meta">
                      <div className="k-tailorx-name">{t.name}</div>
                      <div className="k-tailorx-spec">{t.specialties?.join(" & ") || "General"}</div>
                    </div>
                    <div className="k-tailorx-stats">
                      <div className="k-tailorx-stat">
                        <Star size={12} fill="var(--k-gold)" color="var(--k-gold)" strokeWidth={0} />
                        <span className="k-tailorx-stat-val">{(t.rating ?? 0).toFixed(1)}</span>
                        <span className="k-tailorx-stat-label">Rating</span>
                      </div>
                      <div className="k-tailorx-stat">
                        <Users size={12} color="var(--k-maroon)" strokeWidth={2.4} />
                        <span className="k-tailorx-stat-val">{happyLabel}</span>
                        <span className="k-tailorx-stat-label">Happy Clients</span>
                      </div>
                      <div className="k-tailorx-stat">
                        <MapPin size={12} color="var(--k-maroon)" strokeWidth={2.4} />
                        <span className="k-tailorx-stat-val">{t.city}</span>
                        <span className="k-tailorx-stat-label">{t.area || "—"}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleConnect(t); }}
                      disabled={connecting === t._id}
                      className="k-tailorx-cta k-press"
                    >
                      {connecting === t._id ? "…" : "Get in touch"}
                    </button>
                  </div>
                </div>
              );
            })}

            {tailors.length > 6 && !showAll && (
              <button onClick={() => setShowAll(true)} className="k-tailorx-show-more k-press">
                Show More
              </button>
            )}
          </>
        )}
      </div>

      <div className="k-detail-footer">
        © Copyright PHYGIFY TECHNO SERVICES PVT. LTD .
      </div>

      {viewing && (
        <TailorDetailModal
          tailor={viewing}
          onClose={() => setViewing(null)}
          connecting={connecting === viewing._id}
          onConnect={async () => {
            const target = viewing;
            setViewing(null);
            await handleConnect(target);
          }}
        />
      )}
    </div>
  );
}

/* ── FEEDBACK ── */
