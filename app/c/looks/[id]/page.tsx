"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter, useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

// Renders an actual stored image when a fileId resolves; null otherwise so
// the parent's gradient/silhouette decoration shows through as fallback.
function StoredImage({ fileId, alt }: { fileId: Id<"_storage">; alt: string }) {
  const url = useQuery(api.files.getUrl, { fileId });
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

// Fullscreen lightbox — dark backdrop, contains image at object-fit: contain
// so the whole frame is visible (vs the hero crop which is object-fit: cover).
// Tap backdrop or close button to dismiss; body scroll is locked while open.
function ImageLightbox({ fileId, alt, onClose }: { fileId: Id<"_storage">; alt: string; onClose: () => void }) {
  const url = useQuery(api.files.getUrl, { fileId });
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0, 0, 0, 0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "calc(env(safe-area-inset-top, 0px) + 16px) 16px calc(env(safe-area-inset-bottom, 0px) + 16px)",
        animation: "cx-fadeIn 0.2s ease",
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
        className="cx-press"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 12px)",
          right: 12,
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(255,255,255,.14)",
          backdropFilter: "blur(8px)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 22, fontWeight: 300,
          zIndex: 2,
        }}
      >
        ×
      </button>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "100%", maxHeight: "100%",
            objectFit: "contain",
            borderRadius: 6,
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          }}
        />
      )}
    </div>
  );
}

/* ── colour tokens (inline) ──────────────────────────────────────── */
const P = {
  plum: "#8B2E2B", plumD: "#5E1A18", plumL: "#A94540", plumGhost: "#F5E6E3",
  gold: "#B8860B", goldL: "#D4A017", goldD: "#7A5A08",
  rose: "#C2848A", roseD: "#8B4A52", roseL: "#F0D0D4",
  ivory: "#FBF7F1", blush: "#F8F2E9", white: "#FFFFFF",
  text: "#1C1108", textMid: "#3D2E1E", textMuted: "#9C8878", textGhost: "#C4B5A8", onDark: "#FBF7F1",
  success: "#1B5E20", error: "#8B0000",
  shadow: "0 2px 14px rgba(139, 46, 43, .09)",
  shadowMd: "0 6px 24px rgba(139, 46, 43, .14)",
  r: 16, pill: 100,
};

const fmt = (n: number) => "\u20B9" + Number(n).toLocaleString("en-IN");

/* ── SVG icons ───────────────────────────────────────────────────── */
const BackArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M15 19l-7-7 7-7" stroke={P.onDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? P.gold : "none"}>
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
      stroke={filled ? P.gold : P.onDark}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke={P.onDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WishlistIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ScissorsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="#25D366" strokeWidth="1.5" />
  </svg>
);

/* silk shimmer overlay */
const SilkOverlay = () => (
  <div style={{
    position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", borderRadius: "inherit",
  }}>
    <div style={{
      position: "absolute", top: 0, left: "-100%", width: "55%", height: "100%",
      background: "linear-gradient(105deg,transparent 20%,rgba(255,255,255,.12) 50%,transparent 80%)",
      animation: "cx-shimmer 5.5s ease-in-out infinite",
    }} />
  </div>
);

export default function LookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lookId = params.id as Id<"looks">;
  const { customerId } = useCustomer();
  const [shared, setShared] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const allLooks = useQuery(
    api.sessionOps.listByCustomer,
    customerId ? { customerId } : "skip"
  );
  const wishlist = useQuery(
    api.customers.getWishlist,
    customerId ? { customerId } : "skip"
  );
  const addToWishlist = useMutation(api.customers.addToWishlist);
  const removeFromWishlist = useMutation(api.customers.removeFromWishlist);

  const [toast, setToast] = useState("");
  const showToast = React.useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const look = allLooks?.find((l) => l._id === lookId);

  const sessionLooks = useQuery(
    api.sessionOps.listBySession,
    look?.sessionId ? { sessionId: look.sessionId } : "skip"
  );

  const similarLooks = sessionLooks?.filter((l) => l._id !== lookId);

  /* ── loading ─────────────────────────────────────────────────── */
  if (!customerId || allLooks === undefined) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  /* ── not found ───────────────────────────────────────────────── */
  if (!look) {
    return (
      <div className="cx-fadeIn" style={{ padding: 20, background: P.ivory, minHeight: "100%" }}>
        <button
          onClick={() => router.back()}
          className="cx-press"
          style={{
            display: "flex", alignItems: "center", gap: 6, border: "none",
            background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
            color: P.plum, padding: 0, marginBottom: 20,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke={P.plum} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div className="cx-serif" style={{ fontSize: 20, fontWeight: 600, fontStyle: "italic", color: P.textMid }}>
            Look not found
          </div>
          <div style={{ fontSize: 12, color: P.textMuted, marginTop: 8 }}>
            This look may have been removed
          </div>
        </div>
      </div>
    );
  }

  const grad = look.grad || ["#71221D", "#D4A843"];
  // Priority: AI try-on render → saree catalog photo → gradient placeholder.
  // Mirrors the /c/looks list-page chain so detail and list stay consistent.
  const heroImageFileId = (look.imageFileId ?? look.sareeImageId) as Id<"_storage"> | undefined;
  const shareMessage = encodeURIComponent(
    `Check out this beautiful ${look.sareeName} saree I tried on at Wearify! ${look.price ? fmt(look.price) : ""}`
  );

  // Match the current look's saree against the customer's wishlist so both
  // the top-right heart and the big "Add to Wishlist" button reflect (and
  // toggle) the same underlying state. `lookRow` pins the narrowed non-null
  // type so inner closures (button handlers) don't trip on re-widening.
  const lookRow = look;
  const wishedEntry = (wishlist ?? []).find((w) => w.sareeId === lookRow.sareeId);
  const wished = !!wishedEntry;
  function toggleWishlist() {
    if (!customerId) return;
    if (wished && wishedEntry) {
      removeFromWishlist({ wishlistId: wishedEntry._id });
      showToast("Removed from wishlist");
    } else {
      addToWishlist({
        customerId,
        sareeId: lookRow.sareeId,
        storeId: lookRow.storeId,
        sareeName: lookRow.sareeName,
        price: lookRow.price ?? undefined,
      });
      showToast("Added to wishlist");
    }
  }

  function handleShare() {
    window.open(`https://wa.me/?text=${shareMessage}`, "_blank");
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <div className="cx-pageIn" style={{ background: P.ivory, minHeight: "100%" }}>

      {/* ── 1. Full-bleed hero — image when available, gradient fallback ──
          Tall enough (520px) to show the full saree drape head-to-hem on a
          typical phone screen without cropping at the knees. */}
      <div
        onClick={heroImageFileId ? () => setLightboxOpen(true) : undefined}
        style={{
          height: 520, position: "relative", overflow: "hidden",
          background: `linear-gradient(145deg, ${grad[0]}, ${grad[1] || grad[0]})`,
          cursor: heroImageFileId ? "zoom-in" : "default",
        }}
      >
        {/* Real image (AI try-on render or catalog photo). Falls through to
            the gradient + decorations if fileId doesn't resolve. Tap to open
            in a fullscreen lightbox. */}
        {heroImageFileId && <StoredImage fileId={heroImageFileId} alt={look.sareeName} />}

        {/* Decorations (silk shimmer, cross-hatch, silhouette) only show on
            the placeholder path — would obscure a real image. */}
        {!heroImageFileId && (
          <>
            <SilkOverlay />
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.14, pointerEvents: "none" }}>
              <defs>
                <pattern id="hero-hatch" width="14" height="14" patternUnits="userSpaceOnUse">
                  <path d="M0 14L14 0M-3 3L3 -3M11 17L17 11" stroke="#fff" strokeWidth=".6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-hatch)" />
            </svg>
            <svg
              viewBox="0 0 120 160" width="90" height="120"
              style={{
                position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
                opacity: 0.22, pointerEvents: "none",
              }}
            >
              <path d="M60 5 C30 5 20 35 20 65 C20 95 32 135 60 155 C88 135 100 95 100 65 C100 35 90 5 60 5Z" fill={P.goldL} />
              <ellipse cx="60" cy="48" rx="10" ry="16" fill="none" stroke={P.goldL} strokeWidth="1.5" />
              <circle cx="60" cy="36" r="3" fill={P.goldL} opacity=".5" />
            </svg>
          </>
        )}

        {/* dark-to-transparent gradient at bottom — keep on both paths so
            the title overlay text stays legible against any image. */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 140,
          background: "linear-gradient(to top, rgba(28, 17, 8, .75) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {/* back button (top-left). stopPropagation so tapping it doesn't
            also open the hero lightbox. */}
        <button
          onClick={(e) => { e.stopPropagation(); router.back(); }}
          className="cx-press"
          style={{
            position: "absolute", top: 16, left: 16,
            width: 38, height: 38, borderRadius: "50%", border: "none",
            background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 5,
          }}
        >
          <BackArrow />
        </button>

        {/* fav + share buttons (top-right) — stopPropagation for the same
            reason as the back button. */}
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 10, zIndex: 5 }}>
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
            className="cx-press"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            style={{
              width: 38, height: 38, borderRadius: "50%", border: "none",
              background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              animation: wished ? "cx-heartBeat .55s ease" : "none",
            }}
          >
            <HeartIcon filled={wished} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="cx-press"
            style={{
              width: 38, height: 38, borderRadius: "50%", border: "none",
              background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ShareIcon />
          </button>
        </div>

        {/* title overlay at bottom */}
        <div style={{
          position: "absolute", bottom: 18, left: 20, right: 20, zIndex: 5,
        }}>
          <h1
            className="cx-serif"
            style={{
              fontSize: 24, fontWeight: 700, fontStyle: "italic", color: P.white,
              margin: 0, lineHeight: 1.2,
              textShadow: "0 2px 12px rgba(0,0,0,.35)",
            }}
          >
            {look.sareeName}
          </h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 5 }}>
            {look.fabric && (
              <span style={{
                fontSize: 11, fontWeight: 500, color: "rgba(253,248,240,.7)",
              }}>
                {look.fabric}
              </span>
            )}
            {look.fabric && (
              <span style={{ fontSize: 11, color: "rgba(253,248,240,.35)" }}>{"\u00B7"}</span>
            )}
            <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(253,248,240,.7)" }}>
              {new Date(look.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Price section ────────────────────────────────────── */}
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {look.price != null && (
            <span className="cx-mono" style={{
              fontSize: 28, fontWeight: 600, color: P.gold,
              letterSpacing: -0.5,
            }}>
              {fmt(look.price)}
            </span>
          )}
          <span style={{
            padding: "4px 12px", borderRadius: P.pill,
            background: P.plumGhost, fontSize: 10, fontWeight: 700,
            color: P.plum, letterSpacing: 0.4,
          }}>
            AVAILABLE
          </span>
        </div>
      </div>

      {/* ── 3. Action buttons row ───────────────────────────────── */}
      <div style={{ padding: "16px 20px 0", display: "flex", gap: 10 }}>
        {/* Wishlist toggle — writes to the wishlist table so /c/wardrobe
            Wishlist tab stays in sync. Tapping again removes. */}
        <button
          onClick={toggleWishlist}
          className="cx-press"
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "12px 10px", borderRadius: P.r,
            border: wished ? "none" : `1.5px solid ${P.plum}`,
            background: wished
              ? `linear-gradient(135deg, ${P.plum}, ${P.plumL})`
              : P.white,
            color: wished ? P.white : P.plum,
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            transition: "all .25s",
            boxShadow: wished ? P.shadowMd : "none",
          }}
        >
          <WishlistIcon />
          {wished ? "In Wishlist — tap to remove" : "Add to Wishlist"}
        </button>

        {/* Find a Tailor */}
        <button
          onClick={() => router.push("/c/me/tailor-orders")}
          className="cx-press"
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "12px 10px", borderRadius: P.r,
            border: `1.5px solid ${P.gold}`,
            background: P.white, color: P.goldD,
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}
        >
          <ScissorsIcon />
          Find a Tailor
        </button>
      </div>

      {/* Share on WhatsApp */}
      <div style={{ padding: "10px 20px 0" }}>
        <button
          onClick={handleShare}
          className="cx-press"
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 10px", borderRadius: P.r,
            border: "none",
            background: shared
              ? "linear-gradient(135deg, #128C7E, #25D366)"
              : "linear-gradient(135deg, #25D366, #128C7E)",
            color: P.white,
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            transition: "all .25s",
          }}
        >
          <WhatsAppIcon />
          {shared ? "Link Copied!" : "Share on WhatsApp"}
        </button>
      </div>

      {/* ── Zari divider ────────────────────────────────────────── */}
      <div className="cx-zari" style={{ margin: "20px 20px 0" }} />

      {/* ── 4. Details card ──────────────────────────────────────── */}
      <div style={{ padding: "16px 20px 0" }}>
        <div className="cx-serif" style={{
          fontSize: 16, fontWeight: 600, fontStyle: "italic", color: P.plum, marginBottom: 12,
        }}>
          Details
        </div>
        <div style={{
          background: P.white, borderRadius: P.r,
          boxShadow: P.shadow, padding: 16,
        }}>
          {/* Detail rows */}
          {[
            { label: "Fabric", value: look.fabric },
            { label: "Drape Style", value: look.drapeStyle },
            { label: "Neckline", value: look.neckline },
            { label: "Occasion", value: look.drapeStyle ? undefined : undefined },
            { label: "Store", value: look.storeId },
            { label: "Date", value: new Date(look.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
          ]
            .filter((row) => row.value)
            .map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < arr.length - 1 ? `1px solid ${P.plumGhost}` : "none",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 500, color: P.textMuted }}>
                  {row.label}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: P.text,
                  maxWidth: "60%", textAlign: "right",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {row.value}
                </span>
              </div>
            ))}

          {/* Accessories */}
          {look.accessories && look.accessories.length > 0 && (
            <div style={{
              padding: "10px 0 0",
              borderTop: `1px solid ${P.plumGhost}`,
            }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: P.textMuted }}>Accessories</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {look.accessories.map((a, i) => (
                  <span key={i} style={{
                    padding: "3px 10px", borderRadius: P.pill,
                    background: P.plumGhost, fontSize: 11, fontWeight: 600, color: P.plumL,
                  }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Similar looks ─────────────────────────────────────── */}
      {similarLooks && similarLooks.length > 0 && (
        <div style={{ padding: "20px 0 28px" }}>
          <div className="cx-serif" style={{
            fontSize: 16, fontWeight: 600, fontStyle: "italic", color: P.plum,
            marginBottom: 12, paddingLeft: 20,
          }}>
            From the Same Session
          </div>
          <div className="cx-no-scroll" style={{
            display: "flex", gap: 12, overflowX: "auto",
            paddingLeft: 20, paddingRight: 20, paddingBottom: 4,
          }}>
            {similarLooks.map((sl, idx) => {
              const slGrad = sl.grad || ["#71221D", "#D4A843"];
              const delayClass = `cx-d${(idx % 6) + 1}`;
              const slImageFileId = (sl.imageFileId ?? sl.sareeImageId) as Id<"_storage"> | undefined;
              return (
                <div
                  key={sl._id}
                  className={`cx-scaleIn ${delayClass} cx-hover-lift cx-silk`}
                  onClick={() => router.push(`/c/looks/${sl._id}`)}
                  style={{
                    flexShrink: 0, width: 150, borderRadius: P.r,
                    overflow: "hidden", cursor: "pointer",
                    background: P.white, boxShadow: P.shadow,
                  }}
                >
                  <div style={{
                    height: 210, position: "relative",
                    background: `linear-gradient(135deg, ${slGrad[0]}, ${slGrad[1] || slGrad[0]})`,
                  }}>
                    {slImageFileId ? (
                      <StoredImage fileId={slImageFileId} alt={sl.sareeName} />
                    ) : (
                      <>
                        <SilkOverlay />
                        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.08, pointerEvents: "none" }}>
                          <defs>
                            <pattern id={`sl-${sl._id}`} width="10" height="10" patternUnits="userSpaceOnUse">
                              <path d="M0 10L10 0M-2 2L2 -2M8 12L12 8" stroke="#fff" strokeWidth=".5" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill={`url(#sl-${sl._id})`} />
                        </svg>
                      </>
                    )}
                  </div>
                  <div style={{ padding: "8px 9px 10px" }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: P.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {sl.sareeName}
                    </div>
                    {sl.price != null && (
                      <div className="cx-mono" style={{ fontSize: 11, fontWeight: 600, color: P.gold, marginTop: 2 }}>
                        {fmt(sl.price)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* bottom spacing */}
      {(!similarLooks || similarLooks.length === 0) && <div style={{ height: 28 }} />}

      {toast && (
        <div style={{
          position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)",
          padding: "10px 18px", borderRadius: 100, background: P.plum, color: P.white,
          fontSize: 13, fontWeight: 600, boxShadow: P.shadowMd, zIndex: 50,
        }}>{toast}</div>
      )}

      {lightboxOpen && heroImageFileId && (
        <ImageLightbox
          fileId={heroImageFileId}
          alt={look.sareeName}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
