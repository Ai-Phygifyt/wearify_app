"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { useRouter } from "next/navigation";

const fmt = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

const DEFAULT_GRADS: Record<string, [string, string]> = {
  Wedding: ["#3D0A2E", "#8B1D52"],
  Festival: ["#0D1F3C", "#2D4A7E"],
  Party: ["#2D0A4E", "#5A1A8B"],
  Office: ["#1B3D2E", "#2E6B4A"],
  Daily: ["#2D2A00", "#6B6500"],
  Gift: ["#3D1800", "#7B3A00"],
  default: ["#2D1B4E", "#4A2D6E"],
};

function getGrad(occasion?: string, grad?: string[]): [string, string] {
  if (grad && grad.length >= 2) return [grad[0], grad[1]];
  if (occasion && DEFAULT_GRADS[occasion]) return DEFAULT_GRADS[occasion];
  return DEFAULT_GRADS.default;
}

type SareeItem = {
  _id: string;
  name: string;
  price: number;
  fabric: string;
  occasion: string;
  tag?: string;
  grad?: string[];
  [key: string]: unknown;
};

export default function NewArrivalsPage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [storeFilter, setStoreFilter] = useState("ALL");

  const storeLinks = useQuery(
    api.customers.listStoreLinksEnriched,
    customerId ? { customerId } : "skip"
  );

  const newArrivals = useQuery(
    api.customers.listNewArrivalsForCustomer,
    customerId ? { customerId } : "skip"
  );

  if (!customerId || storeLinks === undefined || newArrivals === undefined) {
    return (
      <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const storeEntries = Object.values(newArrivals as Record<string, { storeId: string; storeName: string; sarees: SareeItem[] }>);
  const filtered = storeFilter === "ALL" ? storeEntries : storeEntries.filter((s) => s.storeId === storeFilter);
  const totalSarees = storeEntries.reduce((acc, s) => acc + s.sarees.length, 0);

  return (
    <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0" }}>
      {/* Hero */}
      <div className="cx-noise cx-paisley" style={{ background: "linear-gradient(155deg, #0D0418 0%, #1A0A2E 25%, #2D1B4E 55%, #6B1D52 80%, #C9941A 100%)", padding: "24px 18px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={() => router.back()} className="cx-press" style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.15)", width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FDF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="cx-serif" style={{ fontSize: 26, fontWeight: 700, color: "#FDF8F0", fontStyle: "italic" }}>New Arrivals</div>
          <div style={{ color: "rgba(253,248,240,.55)", fontSize: 13, marginTop: 4 }}>
            {totalSarees} new sarees across <strong style={{ color: "#E8C46A" }}>{storeEntries.length} stores</strong>
          </div>
        </div>
      </div>
      <div className="cx-zari" />

      {/* Store filter */}
      {storeEntries.length > 1 && (
        <div style={{ background: "#FFFFFF", borderBottom: "1px solid #F2E8EE" }}>
          <div style={{ fontSize: 11, color: "#B8A8C8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", padding: "8px 14px 4px" }}>Filter by store</div>
          <div className="cx-no-scroll" style={{ display: "flex", gap: 8, padding: "0 14px 10px", overflowX: "auto" }}>
            <button onClick={() => setStoreFilter("ALL")} className="cx-press" style={{ padding: "6px 14px", borderRadius: 100, whiteSpace: "nowrap", flexShrink: 0, border: "none", cursor: "pointer", fontSize: 12, fontWeight: storeFilter === "ALL" ? 700 : 500, background: storeFilter === "ALL" ? "linear-gradient(135deg, #2D1B4E, #4A2D6E)" : "rgba(45,27,78,.08)", color: storeFilter === "ALL" ? "#FDF8F0" : "#4A3558" }}>
              All Stores ({totalSarees})
            </button>
            {storeEntries.map((s) => (
              <button key={s.storeId} onClick={() => setStoreFilter(s.storeId)} className="cx-press" style={{ padding: "6px 14px", borderRadius: 100, whiteSpace: "nowrap", flexShrink: 0, border: "none", cursor: "pointer", fontSize: 12, fontWeight: storeFilter === s.storeId ? 700 : 500, background: storeFilter === s.storeId ? "linear-gradient(135deg, #2D1B4E, #4A2D6E)" : "rgba(45,27,78,.08)", color: storeFilter === s.storeId ? "#FDF8F0" : "#4A3558" }}>
                {s.storeName} ({s.sarees.length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saree listings by store */}
      <div style={{ padding: "12px 14px 96px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "#8B7EA0", fontSize: 14 }}>
            No new arrivals yet. Check back soon!
          </div>
        ) : (
          filtered.map((store) => (
            <div key={store.storeId} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #2D1B4E, #4A2D6E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M3 9V21h18V9" stroke="rgba(255,255,255,.85)" strokeWidth="1.6" strokeLinejoin="round" /><path d="M1 7l2-4h18l2 4H1Z" stroke="rgba(255,255,255,.85)" strokeWidth="1.6" strokeLinejoin="round" fill="#C9941A" opacity=".18" /></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1A0A1E" }}>{store.storeName}</div>
                  <div style={{ fontSize: 11, color: "#8B7EA0" }}>{store.sarees.length} new items</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {store.sarees.map((saree, i) => {
                  const g = getGrad(saree.occasion, saree.grad);
                  return (
                    <div
                      key={saree._id}
                      className={`cx-press cx-scaleIn cx-d${Math.min(i + 1, 6)}`}
                      style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 14px rgba(45,27,78,.09)", border: "1px solid #F2E8EE" }}
                    >
                      <div className="cx-silk" style={{ height: 100, background: `linear-gradient(148deg, ${g[0]}, ${g[1]})`, position: "relative" }}>
                        {saree.tag && (
                          <div style={{ position: "absolute", top: 6, right: 6, padding: "2px 8px", borderRadius: 100, background: "rgba(201,148,26,.85)", fontSize: 9, fontWeight: 700, color: "#fff" }}>
                            {saree.tag}
                          </div>
                        )}
                        {saree.occasion && (
                          <div style={{ position: "absolute", bottom: 6, left: 6, padding: "2px 8px", borderRadius: 100, background: "rgba(13,4,24,.65)", backdropFilter: "blur(4px)", fontSize: 9, fontWeight: 600, color: "rgba(253,248,240,.8)" }}>
                            {saree.occasion}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "8px 10px 10px", background: "#FFFFFF" }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "#1A0A1E", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {saree.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                          <span className="cx-mono" style={{ fontWeight: 700, fontSize: 13, color: "#8B6914" }}>
                            {fmt(saree.price)}
                          </span>
                          <span style={{ fontSize: 10, color: "#8B7EA0" }}>
                            {saree.fabric}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
