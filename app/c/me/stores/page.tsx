"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";

export default function MyStoresPage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const storeLinks = useQuery(
    api.customers.listStoreLinksEnriched,
    customerId ? { customerId } : "skip"
  );

  if (!customerId) {
    return (
      <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  return (
    <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0" }}>
      {/* Hero */}
      <div
        className="cx-noise cx-paisley"
        style={{
          background: "linear-gradient(155deg, #0D0418 0%, #1A0A2E 25%, #2D1B4E 55%, #6B1D52 80%, #C9941A 100%)",
          padding: "28px 18px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => router.back()}
              className="cx-press"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(253,248,240,.12)",
                border: "1px solid rgba(253,248,240,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FDF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <h1 className="cx-serif" style={{ fontSize: 22, fontWeight: 700, color: "#FDF8F0", fontStyle: "italic", margin: 0 }}>
                My Stores
              </h1>
              <div style={{ fontSize: 12, color: "rgba(253,248,240,.5)", marginTop: 2 }}>
                {storeLinks ? `${storeLinks.length} Wearify store${storeLinks.length !== 1 ? "s" : ""}` : "Loading..."}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="cx-zari" />

      {/* Content */}
      <div style={{ padding: "20px 16px 32px" }}>
        {storeLinks === undefined ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 140, borderRadius: 16, background: "linear-gradient(135deg, #F4EFF9, #F2E8EE)", opacity: 0.6 }} className="cx-fadeIn" />
            ))}
          </div>
        ) : storeLinks.length === 0 ? (
          <div className="cx-slideUp" style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#F4EFF9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <path d="M3 9V21h18V9" stroke="#2D1B4E" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M1 7l2-4h18l2 4H1Z" stroke="#2D1B4E" strokeWidth="1.6" strokeLinejoin="round" fill="#C9941A" opacity=".18" />
              </svg>
            </div>
            <div className="cx-serif" style={{ fontSize: 17, fontWeight: 600, color: "#1A0A1E", fontStyle: "italic" }}>No stores visited yet</div>
            <div style={{ fontSize: 13, color: "#8B7EA0", marginTop: 6 }}>Visit a Wearify-powered store to see it here</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {storeLinks.map((store, idx) => (
              <div
                key={store._id}
                className={`cx-slideUp cx-d${Math.min(idx + 1, 6)}`}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#FFFFFF",
                  border: "1px solid #F2E8EE",
                  boxShadow: "0 2px 14px rgba(45,27,78,.09)",
                }}
              >
                {/* Store gradient header */}
                <div className="cx-silk" style={{
                  height: 56,
                  background: "linear-gradient(145deg, #2D1B4E, #4A2D6E)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" style={{ position: "relative", zIndex: 1 }}>
                    <path d="M3 9V21h18V9" stroke="rgba(255,255,255,.85)" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M1 7l2-4h18l2 4H1Z" stroke="rgba(255,255,255,.85)" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(201,148,26,.25)" />
                  </svg>
                </div>

                {/* Store details */}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1A0A1E" }}>
                    {store.storeName || store.storeId}
                  </div>

                  {(store.storeCity || store.storeState) && (
                    <div style={{ fontSize: 13, color: "#8B7EA0", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z" stroke="#8B7EA0" strokeWidth="1.6" />
                        <circle cx="12" cy="10" r="3" stroke="#8B7EA0" strokeWidth="1.6" />
                      </svg>
                      {[store.storeCity, store.storeState].filter(Boolean).join(", ")}
                    </div>
                  )}

                  {/* Visit stats */}
                  <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 0 0-8 0v2" stroke="#C9941A" strokeWidth="1.6" strokeLinecap="round" />
                        <circle cx="12" cy="7" r="4" stroke="#C9941A" strokeWidth="1.6" />
                      </svg>
                      <span className="cx-mono" style={{ fontSize: 13, fontWeight: 700, color: "#1A0A1E" }}>
                        {store.visits || 0}
                      </span>
                      <span style={{ fontSize: 11, color: "#8B7EA0" }}>visits</span>
                    </div>
                    {store.lastVisit && (
                      <div style={{ fontSize: 11, color: "#8B7EA0", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="9" stroke="#B8A8C8" strokeWidth="1.6" />
                          <polyline points="12,7 12,12 15,15" stroke="#B8A8C8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Last: {store.lastVisit}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {store.storeAddress && (
                    <div style={{ fontSize: 12, color: "#8B7EA0", marginTop: 8, lineHeight: 1.45 }}>
                      {store.storeAddress}
                    </div>
                  )}

                  {/* Hours */}
                  {(store.storeHours || store.storeClosedOn) && (
                    <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11, color: "#8B7EA0" }}>
                      {store.storeHours && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#B8A8C8" strokeWidth="1.6" />
                            <polyline points="12,6 12,12 16,14" stroke="#B8A8C8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {store.storeHours}
                        </span>
                      )}
                      {store.storeClosedOn && (
                        <span>Closed: {store.storeClosedOn}</span>
                      )}
                    </div>
                  )}

                  <div className="cx-zari" style={{ margin: "12px 0" }} />

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {store.storePhone && (
                      <button
                        onClick={() => window.open(`https://wa.me/${store.storePhone?.replace(/[^0-9]/g, "")}`, "_blank")}
                        className="cx-press"
                        style={{
                          flex: 1,
                          padding: "9px 12px",
                          borderRadius: 100,
                          background: "linear-gradient(135deg, #1A3A2A, #25D366)",
                          border: "none",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 0C5.495 0 .16 5.335.157 11.892a11.8 11.8 0 0 0 1.588 5.945L0 24l6.304-1.654a11.9 11.9 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893A11.82 11.82 0 0 0 20.397 3.48 11.82 11.82 0 0 0 12.05 0Z" /></svg>
                        WhatsApp
                      </button>
                    )}
                    {store.storeAddress && (
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.storeAddress + " " + (store.storeCity || ""))}`, "_blank")}
                        className="cx-press"
                        style={{
                          flex: 1,
                          padding: "9px 12px",
                          borderRadius: 100,
                          background: "transparent",
                          border: "1.5px solid #2D1B4E",
                          color: "#2D1B4E",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z" stroke="#2D1B4E" strokeWidth="1.8" />
                          <circle cx="12" cy="10" r="3" stroke="#2D1B4E" strokeWidth="1.8" />
                        </svg>
                        Directions
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
