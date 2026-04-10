"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { useRouter } from "next/navigation";

const fmt = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

export default function WishlistPage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const wishlist = useQuery(
    api.customers.getWishlist,
    customerId ? { customerId } : "skip"
  );

  const removeFromWishlist = useMutation(api.customers.removeFromWishlist);

  if (!customerId || wishlist === undefined) {
    return (
      <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const total = wishlist.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0" }}>
      {/* Hero */}
      <div className="cx-noise cx-paisley" style={{ background: "linear-gradient(155deg, #0D0418 0%, #1A0A2E 25%, #2D1B4E 55%, #6B1D52 80%, #C9941A 100%)", padding: "24px 18px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => router.back()} className="cx-press" style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.15)", width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FDF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="cx-serif" style={{ fontSize: 26, fontWeight: 700, color: "#FDF8F0", fontStyle: "italic" }}>My Wishlist</div>
          <div style={{ color: "rgba(253,248,240,.55)", fontSize: 13, marginTop: 4 }}>
            {wishlist.length} sarees saved · <strong style={{ color: "#E8C46A" }}>{fmt(total)}</strong>
          </div>
        </div>
      </div>
      <div className="cx-zari" />

      <div style={{ padding: "12px 14px 96px" }}>
        {wishlist.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>💜</div>
            <div className="cx-serif" style={{ fontSize: 18, fontWeight: 600, color: "#1A0A1E", fontStyle: "italic", marginBottom: 6 }}>
              Your wishlist is empty
            </div>
            <div style={{ fontSize: 13, color: "#8B7EA0", lineHeight: 1.6 }}>
              Tap the heart icon on any look to save it here for later
            </div>
            <button
              onClick={() => router.push("/c/looks")}
              className="cx-press"
              style={{ marginTop: 16, padding: "10px 24px", borderRadius: 100, background: "linear-gradient(135deg, #2D1B4E, #4A2D6E)", color: "#FDF8F0", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              Browse My Looks →
            </button>
          </div>
        ) : (
          <>
            {wishlist.map((item, i) => (
              <div
                key={item._id}
                className={`cx-slideUp cx-d${Math.min(i + 1, 6)}`}
                style={{ marginBottom: 10, padding: "12px 14px", background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #F2E8EE", boxShadow: "0 2px 14px rgba(45,27,78,.09)", display: "flex", gap: 12, alignItems: "center" }}
              >
                {/* Gradient thumbnail */}
                <div className="cx-silk" style={{ width: 64, height: 72, borderRadius: 10, flexShrink: 0, background: "linear-gradient(148deg, #3D0A2E, #8B1D52)" }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1A0A1E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.sareeName}
                  </div>
                  <div style={{ fontSize: 11, color: "#8B7EA0", marginTop: 2 }}>{item.storeId}</div>
                  {item.price && (
                    <div className="cx-mono" style={{ fontWeight: 700, fontSize: 15, color: "#8B6914", marginTop: 4 }}>
                      {fmt(item.price)}
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist({ wishlistId: item._id })}
                  className="cx-press"
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "#FFEBEE", border: "1px solid rgba(183,28,28,.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B71C1C" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Total */}
            <div style={{ marginTop: 16, padding: "14px 16px", background: "#F4EFF9", borderRadius: 16, border: "1px solid #E8D5E0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1A0A1E" }}>Total Wishlist Value</span>
              <span className="cx-mono" style={{ fontWeight: 800, fontSize: 20, color: "#2D1B4E" }}>{fmt(total)}</span>
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={() => {
                const msg = encodeURIComponent(`Hi! I have ${wishlist.length} sarees worth ${fmt(total)} on my Wearify wishlist. Can you help me with these?`);
                window.open(`https://wa.me/?text=${msg}`, "_blank");
              }}
              className="cx-press"
              style={{ marginTop: 12, width: "100%", padding: "12px", borderRadius: 100, background: "linear-gradient(135deg, #1A3A2A, #25D366)", border: "1px solid #25D366", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <svg width={17} height={17} viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 0C5.495 0 .16 5.335.157 11.892a11.8 11.8 0 0 0 1.588 5.945L0 24l6.304-1.654a11.9 11.9 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893A11.82 11.82 0 0 0 20.397 3.48 11.82 11.82 0 0 0 12.05 0Z" /></svg>
              Ask Store About My Wishlist
            </button>
          </>
        )}
      </div>
    </div>
  );
}
