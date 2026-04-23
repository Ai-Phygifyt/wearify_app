"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store, Sparkles } from "lucide-react";

const fmt = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

const DEFAULT_GRADS: Record<string, [string, string]> = {
  Wedding: ["#5E1A18", "#8B2E2B"],
  Festival: ["#0D1F3C", "#2D4A7E"],
  Party: ["#5E1A18", "#A94540"],
  Office: ["#1B3D2E", "#2E6B4A"],
  Daily: ["#2D2A00", "#6B6500"],
  Gift: ["#3D1800", "#7B3A00"],
  default: ["#8B2E2B", "#A94540"],
};

function getGrad(occasion?: string, grad?: string[]): [string, string] {
  if (grad && grad.length >= 2) return [grad[0], grad[1]];
  if (occasion && DEFAULT_GRADS[occasion]) return DEFAULT_GRADS[occasion];
  return DEFAULT_GRADS.default;
}

const KIOSK_IMAGES = [
  "/kiosk/img1.jpg",
  "/kiosk/img2.webp",
  "/kiosk/img3.webp",
  "/kiosk/img4.jpg",
];
const pickImg = (i: number) => KIOSK_IMAGES[i % KIOSK_IMAGES.length];

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
      <div className="cx-pageIn cx-loading">
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const storeEntries = Object.values(
    newArrivals as Record<string, { storeId: string; storeName: string; sarees: SareeItem[] }>
  );
  const filtered = storeFilter === "ALL" ? storeEntries : storeEntries.filter((s) => s.storeId === storeFilter);
  const totalSarees = storeEntries.reduce((acc, s) => acc + s.sarees.length, 0);

  return (
    <div className="cx-pageIn cx-page">
      {/* Hero */}
      <div className="cx-hero cx-hero-img cx-noise cx-paisley">
        <div className="cx-hero-img-zoom" style={{ backgroundImage: `url(${pickImg(0)})` }} />
        <button onClick={() => router.back()} className="cx-back" style={{ marginBottom: 14 }}>
          <ArrowLeft size={18} />
        </button>
        <div className="cx-hero-eyebrow" style={{ color: "var(--cx-gold-l)" }}>Freshly curated</div>
        <div className="cx-hero-title">New Arrivals</div>
        <div className="cx-hero-sub">
          {totalSarees} new sarees across <strong>{storeEntries.length} store{storeEntries.length !== 1 ? "s" : ""}</strong>
        </div>
      </div>
      <div className="cx-zari" />

      {/* Store filter */}
      {storeEntries.length > 1 && (
        <div style={{ background: "var(--cx-white)", borderBottom: "1px solid var(--cx-border-l)", padding: "10px 18px 12px" }}>
          <div className="cx-eyebrow" style={{ marginBottom: 8 }}>Filter by store</div>
          <div className="cx-chip-row">
            <button onClick={() => setStoreFilter("ALL")} className={`cx-chip ${storeFilter === "ALL" ? "active" : ""}`}>
              All Stores ({totalSarees})
            </button>
            {storeEntries.map((s) => (
              <button key={s.storeId} onClick={() => setStoreFilter(s.storeId)} className={`cx-chip ${storeFilter === s.storeId ? "active" : ""}`}>
                {s.storeName} ({s.sarees.length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saree listings */}
      <div style={{ padding: "16px 14px 24px" }}>
        {filtered.length === 0 ? (
          <div className="cx-empty">
            <div className="cx-empty-icon"><Sparkles size={26} /></div>
            <div className="cx-empty-title">No new arrivals yet</div>
            <div className="cx-empty-sub">Check back soon for fresh collections from your stores</div>
          </div>
        ) : (
          filtered.map((store) => (
            <div key={store.storeId} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--cx-r-md)",
                    background: "var(--cx-grad-plum)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--cx-on-dark)",
                    flexShrink: 0,
                  }}
                >
                  <Store size={18} strokeWidth={1.6} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="cx-truncate" style={{ fontWeight: 700, fontSize: 14, color: "var(--cx-text)" }}>
                    {store.storeName}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--cx-text-muted)" }}>
                    {store.sarees.length} new item{store.sarees.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {store.sarees.map((saree, i) => {
                  const g = getGrad(saree.occasion, saree.grad);
                  return (
                    <div
                      key={saree._id}
                      className={`cx-card cx-press cx-scaleIn cx-hover-lift cx-d${Math.min(i + 1, 6)}`}
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="cx-tile-img cx-silk"
                        style={{
                          height: 150,
                          backgroundImage: `linear-gradient(160deg, ${g[0]}55, ${g[1]}88), url(${pickImg(i)})`,
                        }}
                      >
                        {saree.tag && (
                          <span
                            style={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              padding: "3px 9px",
                              borderRadius: "var(--cx-r-pill)",
                              background: "var(--cx-grad-gold)",
                              fontSize: 9,
                              fontWeight: 700,
                              color: "var(--cx-plum-d)",
                              letterSpacing: ".04em",
                              zIndex: 2,
                            }}
                          >
                            {saree.tag}
                          </span>
                        )}
                        {saree.occasion && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: 6,
                              left: 6,
                              padding: "3px 9px",
                              borderRadius: "var(--cx-r-pill)",
                              background: "rgba(28, 17, 8, .65)",
                              backdropFilter: "blur(4px)",
                              fontSize: 9,
                              fontWeight: 600,
                              color: "var(--cx-on-dark)",
                              zIndex: 2,
                            }}
                          >
                            {saree.occasion}
                          </span>
                        )}
                      </div>
                      <div style={{ padding: "8px 10px 10px" }}>
                        <div className="cx-truncate" style={{ fontWeight: 700, fontSize: 12.5, color: "var(--cx-text)" }}>
                          {saree.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                          <span className="cx-mono" style={{ fontWeight: 700, fontSize: 13, color: "var(--cx-gold-d)" }}>
                            {fmt(saree.price)}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--cx-text-muted)" }}>{saree.fabric}</span>
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
