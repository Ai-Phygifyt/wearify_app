"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, Maximize2, Trash2, Shirt, Heart } from "lucide-react";

type Tab = "wardrobe" | "wishlist";
const MAROON = "#6E262B";
const fmt = (n: number) => "₹" + Number(n).toLocaleString("en-IN");
const longDate = (ts: number) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

type GalleryItem = { id: string; name: string; price: number; imageId?: Id<"_storage">; grad?: string[] };

function StoredImage({ fileId, contain }: { fileId: Id<"_storage">; contain?: boolean }) {
  const url = useQuery(api.files.getUrl, { fileId });
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: contain ? "contain" : "cover" }} loading="lazy" />
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function WardrobePage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [tab, setTab] = useState<Tab>("wardrobe");
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const wishlist = useQuery(api.customers.getWishlist, customerId ? { customerId } : "skip");
  const wardrobe = useQuery(api.sessionOps.listWardrobeByCustomer, customerId ? { customerId } : "skip");
  const removeFromWishlist = useMutation(api.customers.removeFromWishlist);
  const removeFromWardrobe = useMutation(api.sessionOps.removeFromWardrobe);

  React.useEffect(() => { setSelected(0); }, [tab]);
  React.useEffect(() => {
    if (lightbox) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [lightbox]);

  if (!customerId || wishlist === undefined || wardrobe === undefined) {
    return <div className="cx-loading"><div className="cx-typing"><span /><span /><span /></div></div>;
  }

  const wardrobeItems: GalleryItem[] = (wardrobe as any[]).map((w) => ({
    id: String(w._id),
    name: w.sareeName,
    price: Number(w.price) || 0,
    imageId: (w.lookImageFileId as Id<"_storage"> | undefined) ?? (w.sareeImageId as Id<"_storage"> | undefined),
    grad: w.sareeGrad,
  }));
  const wishlistRows = wishlist as any[];

  const total = wardrobeItems.reduce((s, it) => s + it.price, 0);
  const idx = Math.min(selected, Math.max(wardrobeItems.length - 1, 0));
  const current = wardrobeItems[idx];

  function removeWardrobe() {
    if (!current || !customerId) return;
    removeFromWardrobe({ wardrobeId: current.id as Id<"wardrobe">, customerId });
    setSelected(0);
  }

  return (
    <div style={{ minHeight: "100%", background: "#FFFFFF", fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif', display: "flex", flexDirection: "column" }}>
      {/* ── APP BAR ────────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "#FFFFFF", padding: "calc(env(safe-area-inset-top,0px) + 14px) 16px 14px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <button onClick={() => router.back()} aria-label="Back" className="cx-press" style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", color: "#2A2522" }}>
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#2A2522", letterSpacing: "0.06em", margin: 0, marginRight: 28 }}>MY WARDROBE</h1>
      </header>

      {/* ── TABS ───────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", background: "#F4F2F0", borderRadius: 12, padding: 4 }}>
          <TabBtn active={tab === "wardrobe"} onClick={() => setTab("wardrobe")}>Wardrobe - {wardrobeItems.length}</TabBtn>
          <TabBtn active={tab === "wishlist"} onClick={() => setTab("wishlist")}>Wishlist - {wishlistRows.length}</TabBtn>
        </div>
      </div>

      {/* ── WARDROBE TAB → gallery ─────────────────────────────────── */}
      {tab === "wardrobe" && (
        <>
          <div style={{ flex: 1, padding: "16px 16px 0" }}>
            {wardrobeItems.length === 0 || !current ? (
              <EmptyState icon={<Shirt size={26} color={MAROON} />} title="Nothing in your wardrobe yet" sub="Save looks from the smart mirror to build your wardrobe" />
            ) : (
              <>
                <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", height: 440, background: current.imageId ? "#ECE3DA" : `linear-gradient(150deg, ${current.grad?.[0] || "#71221D"}, ${current.grad?.[1] || "#D4A843"})` }}>
                  {current.imageId && <StoredImage fileId={current.imageId} />}
                  <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.94)", borderRadius: 12, padding: "8px 12px", boxShadow: "0 2px 10px rgba(0,0,0,0.10)", maxWidth: "60%" }}>
                    <div className="cx-truncate" style={{ fontSize: 12.5, fontWeight: 700, color: "#2A2522" }}>{current.name}</div>
                    {current.price > 0 && <div style={{ fontSize: 12.5, fontWeight: 700, color: MAROON, marginTop: 1 }}>{fmt(current.price)}</div>}
                  </div>
                  <button onClick={() => current.imageId && setLightbox(true)} aria-label="Expand" className="cx-press" style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.94)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                    <Maximize2 size={16} color="#2A2522" />
                  </button>
                  <button onClick={removeWardrobe} aria-label="Remove" className="cx-press" style={{ position: "absolute", bottom: 12, right: 12, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.94)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                    <Trash2 size={17} color={MAROON} />
                  </button>
                </div>

                <div className="cx-no-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", padding: "14px 0 4px" }}>
                  {wardrobeItems.map((it, i) => (
                    <button key={it.id} onClick={() => setSelected(i)} aria-label={it.name} style={{ position: "relative", flexShrink: 0, width: 72, height: 90, borderRadius: 12, overflow: "hidden", cursor: "pointer", padding: 0, border: i === idx ? `2.5px solid ${MAROON}` : "2.5px solid transparent", background: it.imageId ? "#ECE3DA" : `linear-gradient(150deg, ${it.grad?.[0] || "#71221D"}, ${it.grad?.[1] || "#D4A843"})` }}>
                      {it.imageId && <StoredImage fileId={it.imageId} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {wardrobeItems.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderTop: "1px solid rgba(0,0,0,0.07)", marginTop: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#2A2522" }}>Wardrobe Value</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: MAROON }}>{fmt(total)}</span>
            </div>
          )}
        </>
      )}

      {/* ── WISHLIST TAB → grid ────────────────────────────────────── */}
      {tab === "wishlist" && (
        <div style={{ padding: "16px 16px 28px" }}>
          {wishlistRows.length === 0 ? (
            <EmptyState icon={<Heart size={26} color={MAROON} />} title="Your wishlist is empty" sub="Tap the heart on any look to save it here" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {wishlistRows.map((w) => (
                <div key={String(w._id)} style={{ background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1px solid #F0E6E3", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                  <div style={{ position: "relative", height: 200, background: `linear-gradient(135deg, ${w.sareeGrad?.[0] || "#71221D"}, ${w.sareeGrad?.[1] || "#D4A843"})` }}>
                    {w.sareeImageId && <StoredImage fileId={w.sareeImageId as Id<"_storage">} />}
                    <button
                      onClick={() => removeFromWishlist({ wishlistId: w._id })}
                      aria-label="Remove from wishlist"
                      style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Heart size={15} color={MAROON} fill={MAROON} strokeWidth={2} />
                    </button>
                    {w.sareeOccasion && (
                      <span style={{ position: "absolute", bottom: 8, left: 8, padding: "4px 11px", borderRadius: 99, background: "rgba(255,255,255,0.92)", fontSize: 10.5, fontWeight: 600, color: "#2A2522" }}>{w.sareeOccasion}</span>
                    )}
                  </div>
                  <div style={{ padding: "11px 12px 13px" }}>
                    <div className="cx-truncate" style={{ fontSize: 14.5, fontWeight: 700, color: "#2A2522" }}>{w.sareeName}</div>
                    <div className="cx-truncate" style={{ fontSize: 12, color: "#9A8F8A", marginTop: 3 }}>
                      {longDate(w._creationTime)}{w.storeCity ? ` • ${w.storeCity}` : ""}
                    </div>
                    {w.price != null && <div style={{ fontSize: 15, fontWeight: 700, color: "#2A2522", marginTop: 6 }}>{fmt(Number(w.price))}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && current?.imageId && (
        <div onClick={() => setLightbox(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "cx-fadeIn 0.2s ease" }}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(false); }} aria-label="Close" style={{ position: "absolute", top: "calc(env(safe-area-inset-top,0px) + 12px)", right: 12, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.14)", border: "none", cursor: "pointer", color: "#fff", fontSize: 22, zIndex: 2 }}>×</button>
          <div style={{ position: "relative", width: "100%", height: "80%" }} onClick={(e) => e.stopPropagation()}>
            <StoredImage fileId={current.imageId} contain />
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="cx-press" style={{ flex: 1, padding: "11px 8px", borderRadius: 9, border: "none", background: active ? MAROON : "transparent", color: active ? "#fff" : "#6B5E5A", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
      {children}
    </button>
  );
}

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="cx-fadeIn" style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FBE4E8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#2A2522" }}>{title}</div>
      <div style={{ fontSize: 13, color: "#9A8F8A", marginTop: 6 }}>{sub}</div>
    </div>
  );
}
