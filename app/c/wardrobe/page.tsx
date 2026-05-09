"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, X, Heart, Shirt, MessageCircle } from "lucide-react";

type Tab = "wardrobe" | "wishlist";

const fmt = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

function ThumbImage({ fileId }: { fileId: Id<"_storage"> }) {
  const url = useQuery(api.files.getUrl, { fileId });
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

function Thumb({ imageId, grad }: { imageId?: Id<"_storage">; grad?: string[] }) {
  const bg = grad && grad.length >= 2
    ? `linear-gradient(148deg, ${grad[0]}, ${grad[1]})`
    : "linear-gradient(148deg, #5E1A18, #8B2E2B)";
  return (
    <div
      className="cx-silk"
      style={{
        position: "relative",
        width: 64,
        height: 72,
        borderRadius: "var(--cx-r-sm)",
        flexShrink: 0,
        background: bg,
        overflow: "hidden",
      }}
    >
      {imageId && <ThumbImage fileId={imageId} />}
    </div>
  );
}

export default function WishlistPage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [tab, setTab] = useState<Tab>("wardrobe");

  const wishlist = useQuery(
    api.customers.getWishlist,
    customerId ? { customerId } : "skip"
  );
  const wardrobe = useQuery(
    api.sessionOps.listWardrobeByCustomer,
    customerId ? { customerId } : "skip"
  );
  const removeFromWishlist = useMutation(api.customers.removeFromWishlist);
  const removeFromWardrobe = useMutation(api.sessionOps.removeFromWardrobe);

  if (!customerId || wishlist === undefined || wardrobe === undefined) {
    return (
      <div className="cx-pageIn cx-loading">
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const wishlistTotal = wishlist.reduce((sum, item) => sum + (item.price || 0), 0);
  const wardrobeTotal = wardrobe.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="cx-pageIn cx-page">
      {/* Hero */}
      <div className="cx-hero cx-noise cx-paisley">
        <button onClick={() => router.back()} className="cx-back" style={{ marginBottom: 14 }}>
          <ArrowLeft size={18} />
        </button>
        <div className="cx-hero-title">
          {tab === "wardrobe" ? "My Wardrobe" : "Wishlist"}
        </div>
        <div className="cx-hero-sub">
          {tab === "wardrobe"
            ? <>{wardrobe.length} pieces from the mirror · <strong>{fmt(wardrobeTotal)}</strong></>
            : <>{wishlist.length} sarees hearted · <strong>{fmt(wishlistTotal)}</strong></>}
        </div>
      </div>
      <div className="cx-zari" />

      {/* Tabs */}
      <div style={{ padding: "14px 14px 0" }}>
        <div className="cx-tabs">
          <button onClick={() => setTab("wardrobe")} className={`cx-tab ${tab === "wardrobe" ? "active" : ""}`}>
            Wardrobe · {wardrobe.length}
          </button>
          <button onClick={() => setTab("wishlist")} className={`cx-tab ${tab === "wishlist" ? "active" : ""}`}>
            Wishlist · {wishlist.length}
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 14px 24px" }}>
        {/* WARDROBE TAB */}
        {tab === "wardrobe" && (
          wardrobe.length === 0 ? (
            <div className="cx-empty">
              <div className="cx-empty-icon"><Shirt size={26} /></div>
              <div className="cx-empty-title">Nothing in your wardrobe yet</div>
              <div className="cx-empty-sub">
                Save looks from the smart mirror during your next store visit to build your wardrobe
              </div>
            </div>
          ) : (
            <>
              {wardrobe.map((w, i) => (
                <div
                  key={w._id}
                  className={`cx-card cx-slideUp cx-d${Math.min(i + 1, 6)}`}
                  style={{ marginBottom: 10, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}
                >
                  <Thumb
                    imageId={
                      // AI try-on render first (the customer wearing this saree),
                      // catalog flat-lay (no model) only as fallback.
                      (w.lookImageFileId as Id<"_storage"> | undefined) ??
                      (w.sareeImageId as Id<"_storage"> | undefined)
                    }
                    grad={w.sareeGrad}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cx-truncate" style={{ fontWeight: 700, fontSize: 14, color: "var(--cx-text)" }}>
                      {w.sareeName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--cx-text-muted)", marginTop: 2 }}>
                      {w.storeName ?? w.storeId}{w.storeCity ? ` · ${w.storeCity}` : ""}
                    </div>
                    {w.drapeStyle && (
                      <div style={{ fontSize: 10, color: "var(--cx-rose)", marginTop: 2, fontStyle: "italic" }}>
                        {w.drapeStyle}
                      </div>
                    )}
                    {w.price != null && (
                      <div className="cx-mono" style={{ fontWeight: 700, fontSize: 14, color: "var(--cx-gold-d)", marginTop: 4 }}>
                        {fmt(Number(w.price))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromWardrobe({ wardrobeId: w._id, customerId })}
                    className="cx-iconbtn cx-iconbtn-danger"
                    aria-label="Remove from wardrobe"
                  >
                    <X size={16} strokeWidth={2.2} />
                  </button>
                </div>
              ))}

              <div className="cx-card-soft" style={{ marginTop: 16, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--cx-text)" }}>Wardrobe value</span>
                <span className="cx-mono" style={{ fontWeight: 800, fontSize: 20, color: "var(--cx-plum)" }}>{fmt(wardrobeTotal)}</span>
              </div>
            </>
          )
        )}

        {/* WISHLIST TAB */}
        {tab === "wishlist" && (
          wishlist.length === 0 ? (
            <div className="cx-empty">
              <div className="cx-empty-icon"><Heart size={26} /></div>
              <div className="cx-empty-title">Your wishlist is empty</div>
              <div className="cx-empty-sub">
                Tap the heart on any look or saree to save it here for later
              </div>
              <button onClick={() => router.push("/c/looks")} className="cx-btn cx-btn-primary" style={{ marginTop: 18 }}>
                Browse My Looks
              </button>
            </div>
          ) : (
            <>
              {wishlist.map((item, i) => (
                <div
                  key={item._id}
                  className={`cx-card cx-slideUp cx-d${Math.min(i + 1, 6)}`}
                  style={{ marginBottom: 10, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}
                >
                  <Thumb grad={undefined} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cx-truncate" style={{ fontWeight: 700, fontSize: 14, color: "var(--cx-text)" }}>
                      {item.sareeName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--cx-text-muted)", marginTop: 2 }}>{item.storeId}</div>
                    {item.price && (
                      <div className="cx-mono" style={{ fontWeight: 700, fontSize: 14, color: "var(--cx-gold-d)", marginTop: 4 }}>
                        {fmt(item.price)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromWishlist({ wishlistId: item._id })}
                    className="cx-iconbtn cx-iconbtn-danger"
                    aria-label="Remove from wishlist"
                  >
                    <X size={16} strokeWidth={2.2} />
                  </button>
                </div>
              ))}

              <div className="cx-card-soft" style={{ marginTop: 16, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--cx-text)" }}>Total Wishlist Value</span>
                <span className="cx-mono" style={{ fontWeight: 800, fontSize: 20, color: "var(--cx-plum)" }}>{fmt(wishlistTotal)}</span>
              </div>

              <button
                onClick={() => {
                  const msg = encodeURIComponent(`Hi! I have ${wishlist.length} sarees worth ${fmt(wishlistTotal)} on my Wearify wishlist. Can you help me with these?`);
                  window.open(`https://wa.me/?text=${msg}`, "_blank");
                }}
                className="cx-btn cx-btn-whatsapp cx-btn-block"
                style={{ marginTop: 12 }}
              >
                <MessageCircle size={17} fill="#fff" strokeWidth={0} />
                Ask Store About My Wishlist
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
}
