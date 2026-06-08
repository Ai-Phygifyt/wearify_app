"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter, useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, Heart, Scissors } from "lucide-react";

const MAROON = "#6E262B";
const fmt = (n: number) => "₹" + Number(n).toLocaleString("en-IN");
const longDate = (ts: number) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function StoredImage({ fileId, alt }: { fileId: Id<"_storage">; alt: string }) {
  const url = useQuery(api.files.getUrl, { fileId });
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
  );
}

function ImageLightbox({ fileId, alt, onClose }: { fileId: Id<"_storage">; alt: string; onClose: () => void }) {
  const url = useQuery(api.files.getUrl, { fileId });
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "calc(env(safe-area-inset-top,0px) + 16px) 16px", animation: "cx-fadeIn 0.2s ease" }}>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close" style={{ position: "absolute", top: "calc(env(safe-area-inset-top,0px) + 12px)", right: 12, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.14)", border: "none", cursor: "pointer", color: "#fff", fontSize: 22, zIndex: 2 }}>×</button>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 6 }} />
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function LookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lookId = params.id as Id<"looks">;
  const { customerId } = useCustomer();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const showToast = React.useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000); }, []);

  const allLooks = useQuery(api.sessionOps.listByCustomer, customerId ? { customerId } : "skip");
  const wishlist = useQuery(api.customers.getWishlist, customerId ? { customerId } : "skip");
  const addToWishlist = useMutation(api.customers.addToWishlist);
  const removeFromWishlist = useMutation(api.customers.removeFromWishlist);
  const deleteLookMut = useMutation(api.sessionOps.deleteLook);

  const look = (allLooks as any[] | undefined)?.find((l) => l._id === lookId);
  const saree = useQuery(api.sarees.getById, look?.sareeId ? { id: look.sareeId as Id<"sarees"> } : "skip") as any;

  if (!customerId || allLooks === undefined) {
    return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="cx-typing"><span /><span /><span /></div></div>;
  }

  if (!look) {
    return (
      <div className="cx-fadeIn" style={{ padding: 20, background: "#fff", minHeight: "100%", fontFamily: '"DM Sans", sans-serif' }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: MAROON, padding: 0, marginBottom: 20 }}>
          <ChevronLeft size={18} /> Back
        </button>
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2A2522" }}>Look not found</div>
          <div style={{ fontSize: 13, color: "#9A8F8A", marginTop: 8 }}>This look may have been removed</div>
        </div>
      </div>
    );
  }

  const grad = look.grad || look.sareeGrad || ["#71221D", "#D4A843"];
  const heroImageFileId = (look.imageFileId ?? look.sareeImageId) as Id<"_storage"> | undefined;
  const wishedEntry = (wishlist ?? []).find((w: any) => w.sareeId === look.sareeId);
  const wished = !!wishedEntry;

  function toggleWishlist() {
    if (!customerId || !look) return;
    if (wished && wishedEntry) { removeFromWishlist({ wishlistId: wishedEntry._id }); showToast("Removed from wishlist"); }
    else { addToWishlist({ customerId, sareeId: look.sareeId, storeId: look.storeId, sareeName: look.sareeName, price: look.price ?? undefined }); showToast("Added to wishlist"); }
  }
  function handleShare() {
    const msg = encodeURIComponent(`Check out this beautiful ${look!.sareeName} saree I tried on at Wearify! ${look!.price ? fmt(look!.price) : ""}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }
  async function handleDelete() {
    if (!customerId || deleting || !look) return;
    setDeleting(true);
    try { await deleteLookMut({ lookId: look._id, customerId }); router.replace("/c/looks"); }
    catch { showToast("Couldn't delete — try again"); setDeleting(false); setDeleteConfirmOpen(false); }
  }

  // Product-detail rows — sourced from the saree record, rendered only when present.
  const detailRows: { label: string; value?: string }[] = [
    { label: "Type", value: saree?.type || "Saree" },
    { label: "Fabric", value: saree?.fabric || look.fabric },
    { label: "Color", value: saree?.colorName || (saree?.colors?.length ? saree.colors.join(" / ") : undefined) },
    { label: "Pattern", value: saree?.weave },
    { label: "Occasion", value: saree?.occasion || look.sareeOccasion },
    { label: "Style", value: saree?.drapingStyles?.length ? saree.drapingStyles.join(", ") : saree?.region },
  ].filter((r) => r.value);

  // Standard saree specs; Wash Care pulls real careInstructions when present.
  const specRows = [
    { feature: "Saree Length", value: "5.5 Meter" },
    { feature: "Blouse Length", value: "0.8 Meter" },
    { feature: "Wash Care", value: saree?.careInstructions || "Dry Clean Only" },
  ];

  const available = !saree || saree.status === "active" || (saree.stock ?? 1) > 0;

  return (
    <div style={{ minHeight: "100%", background: "#FFFFFF", fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <div
        onClick={heroImageFileId ? () => setLightboxOpen(true) : undefined}
        style={{ height: 560, position: "relative", overflow: "hidden", background: `linear-gradient(145deg, ${grad[0]}, ${grad[1] || grad[0]})`, cursor: heroImageFileId ? "zoom-in" : "default" }}
      >
        {heroImageFileId && <StoredImage fileId={heroImageFileId} alt={look.sareeName} />}
        <button
          onClick={(e) => { e.stopPropagation(); router.back(); }}
          aria-label="Back"
          className="cx-press"
          style={{ position: "absolute", top: "calc(env(safe-area-inset-top,0px) + 14px)", left: 16, width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
        >
          <ChevronLeft size={22} color="#2A2522" strokeWidth={2.2} />
        </button>
      </div>

      {/* ── TITLE + AVAILABILITY ───────────────────────────────────── */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#2A2522", margin: 0, lineHeight: 1.15 }}>{look.sareeName}</h1>
          <span style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 99, border: `1.5px solid ${MAROON}`, fontSize: 11.5, fontWeight: 700, color: MAROON, letterSpacing: "0.04em", marginTop: 4 }}>
            {available ? "AVAILABLE" : "SOLD OUT"}
          </span>
        </div>
        <div style={{ fontSize: 15, color: "#9A8F8A", marginTop: 6 }}>
          {(saree?.fabric || look.fabric) ? `${saree?.fabric || look.fabric} · ` : ""}{longDate(look.createdAt)}
        </div>

        {/* price + icon actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          {look.price != null && <span style={{ fontSize: 28, fontWeight: 700, color: "#2A2522" }}>{fmt(look.price)}</span>}
          <div style={{ display: "flex", gap: 10 }}>
            <IconBtn onClick={toggleWishlist} aria-label="Wishlist">
              <Heart size={20} color={MAROON} fill={wished ? MAROON : "transparent"} strokeWidth={2} />
            </IconBtn>
            <IconBtn onClick={handleShare} aria-label="Share on WhatsApp">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/customer/looks/whatsapp.svg" alt="" style={{ width: 24, height: 24 }} />
            </IconBtn>
            <IconBtn onClick={() => setDeleteConfirmOpen(true)} aria-label="Delete look">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/customer/looks/delete.svg" alt="" style={{ width: 17, height: 20 }} />
            </IconBtn>
          </div>
        </div>
      </div>

      {/* ── FIND A TAILOR ──────────────────────────────────────────── */}
      <div style={{ padding: "18px 20px 0" }}>
        <button
          onClick={() => router.push("/c/me/tailor-orders")}
          className="cx-press"
          style={{ width: "100%", height: 56, borderRadius: 14, border: "none", background: MAROON, color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 22px rgba(110,38,43,0.26)" }}
        >
          <Scissors size={18} /> Find a Tailor
        </button>
      </div>

      {/* ── PRODUCT DETAIL ─────────────────────────────────────────── */}
      <div style={{ padding: "26px 20px 0" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#2A2522", margin: "0 0 14px" }}>Product Detail</h2>
        <div style={{ border: "1px solid #E7DCD9", borderRadius: 18, padding: "20px 18px" }}>
          {detailRows.map((r) => (
            <div key={r.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2A2522" }}>{r.label}</div>
              <div style={{ fontSize: 14.5, color: "#5C5048", marginTop: 2, lineHeight: 1.35 }}>{r.value}</div>
            </div>
          ))}

          {saree?.description && (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2A2522", marginTop: 24, marginBottom: 10 }}>Products Details</div>
              <p style={{ fontSize: 13.5, color: "#5C5048", lineHeight: 1.55, margin: 0 }}>{saree.description}</p>
            </>
          )}

          {/* Feature / Value table */}
          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", paddingBottom: 8 }}>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: "#2A2522" }}>Feature</div>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: "#2A2522" }}>Value</div>
            </div>
            {specRows.map((s) => (
              <div key={s.feature} style={{ display: "flex", padding: "12px 0", borderTop: "1px solid #F0E8E5" }}>
                <div style={{ flex: 1, fontSize: 14, color: "#3A2B28" }}>{s.feature}</div>
                <div style={{ flex: 1, fontSize: 14, color: "#5C5048" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 28 }} />

      {toast && (
        <div style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", padding: "10px 18px", borderRadius: 100, background: MAROON, color: "#fff", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 50 }}>{toast}</div>
      )}

      {lightboxOpen && heroImageFileId && <ImageLightbox fileId={heroImageFileId} alt={look.sareeName} onClose={() => setLightboxOpen(false)} />}

      {deleteConfirmOpen && (
        <div onClick={() => !deleting && setDeleteConfirmOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(28,17,8,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "cx-fadeIn .18s ease" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, background: "#fff", borderRadius: 18, padding: "22px 22px 18px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2A2522", marginBottom: 6 }}>Delete this look?</div>
            <div style={{ fontSize: 13, color: "#6B5E5A", lineHeight: 1.5, marginBottom: 18 }}>The AI render will be removed from your history. This can&apos;t be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirmOpen(false)} disabled={deleting} className="cx-press" style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: "1.5px solid #E7DCD9", background: "#fff", color: "#2A2522", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="cx-press" style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: "none", background: "#B3261E", color: "#fff", fontSize: 14, fontWeight: 700, cursor: deleting ? "wait" : "pointer", opacity: deleting ? 0.7 : 1, fontFamily: "inherit" }}>{deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IconBtn({ onClick, children, ...rest }: { onClick: () => void; children: React.ReactNode; [k: string]: any }) {
  return (
    <button onClick={onClick} className="cx-press" style={{ width: 46, height: 46, borderRadius: 12, border: "1.5px solid rgba(104,38,42,0.22)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} {...rest}>
      {children}
    </button>
  );
}
