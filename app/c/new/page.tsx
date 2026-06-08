"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, ArrowRight, Sparkles } from "lucide-react";

const MAROON = "#6E262B";
const fmt = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

const KIOSK_IMAGES = ["/kiosk/img1.jpg", "/kiosk/img2.webp", "/kiosk/img3.webp", "/kiosk/img4.jpg"];
const pickImg = (i: number) => KIOSK_IMAGES[i % KIOSK_IMAGES.length];

type SareeItem = {
  _id: string;
  name: string;
  price: number;
  fabric?: string;
  occasion?: string;
  tag?: string;
  imageIds?: Id<"_storage">[];
  [key: string]: unknown;
};

// Resolves the saree's first catalog image (model-worn shot — right for browse).
function SareeImage({ ids, fallback, alt }: { ids?: Id<"_storage">[]; fallback: string; alt: string }) {
  const first = ids && ids.length ? ids[0] : undefined;
  const url = useQuery(api.files.getUrl, first ? { fileId: first } : "skip");
  const src = url || fallback;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function NewArrivalsPage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [storeFilter, setStoreFilter] = useState("ALL");

  const storeLinks = useQuery(api.customers.listStoreLinksEnriched, customerId ? { customerId } : "skip");
  const newArrivals = useQuery(api.customers.listNewArrivalsForCustomer, customerId ? { customerId } : "skip");

  if (!customerId || storeLinks === undefined || newArrivals === undefined) {
    return (
      <div className="cx-loading">
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const storeEntries = Object.values(
    newArrivals as Record<string, { storeId: string; storeName: string; sarees: SareeItem[] }>
  );

  // City lookup from linked stores (arrivals data doesn't carry city).
  const cityById: Record<string, string> = {};
  (storeLinks as any[]).forEach((l) => { cityById[l.storeId] = l.storeCity || ""; });

  // Flatten every new-arrival saree, tagged with its store.
  const allItems = storeEntries.flatMap((e) =>
    e.sarees.map((s) => ({ saree: s, storeId: e.storeId, storeName: e.storeName, city: cityById[e.storeId] || "" }))
  );
  const items = storeFilter === "ALL" ? allItems : allItems.filter((it) => it.storeId === storeFilter);
  const totalSarees = allItems.length;
  const storeCount = storeEntries.length;

  return (
    <div style={{ minHeight: "100%", background: "#FFFFFF", fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* ── APP BAR ────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#FFFFFF",
          padding: "calc(env(safe-area-inset-top, 0px) + 14px) 16px 14px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <button onClick={() => router.back()} aria-label="Back" className="cx-press" style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", color: "#2A2522" }}>
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#2A2522", letterSpacing: "0.06em", margin: 0, marginRight: 28 }}>
          NEW ARRIVALS
        </h1>
      </header>

      {/* ── TITLE ──────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 18px 0" }}>
        <h2 style={{ fontSize: 25, fontWeight: 700, color: "#2A2522", margin: 0 }}>Freshly Curated</h2>
        <div style={{ fontSize: 14, color: "#9A8F8A", marginTop: 6 }}>
          {totalSarees} New Saree{totalSarees !== 1 ? "s" : ""} Across{" "}
          <span style={{ color: MAROON, fontWeight: 700 }}>{storeCount} Store{storeCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* ── STORE FILTER CHIPS ─────────────────────────────────────── */}
      <div className="cx-no-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", padding: "16px 18px 4px" }}>
        <FilterChip active={storeFilter === "ALL"} onClick={() => setStoreFilter("ALL")}>All</FilterChip>
        {(storeLinks as any[]).map((s) => (
          <FilterChip key={s.storeId} active={storeFilter === s.storeId} onClick={() => setStoreFilter(s.storeId)}>
            {String(s.storeName || s.storeId).split(" ")[0].toUpperCase()}
          </FilterChip>
        ))}
      </div>

      {/* ── GRID ───────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 16px 28px" }}>
        {items.length === 0 ? (
          <div className="cx-slideUp" style={{ textAlign: "center", padding: "56px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FBE4E8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Sparkles size={26} color={MAROON} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#2A2522" }}>No new arrivals</div>
            <div style={{ fontSize: 13, color: "#9A8F8A", marginTop: 6 }}>Check back soon for fresh collections</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {items.map(({ saree, city }, i) => (
              <div key={saree._id} style={{ background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1px solid #F0E6E3", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <div style={{ position: "relative", height: 190, background: "linear-gradient(135deg, #71221D, #D4A843)" }}>
                  <SareeImage ids={saree.imageIds} fallback={pickImg(i)} alt={saree.name} />
                  <span style={{ position: "absolute", top: 8, right: 8, padding: "4px 11px", borderRadius: 99, background: MAROON, fontSize: 10.5, fontWeight: 700, color: "#fff", zIndex: 2 }}>
                    New
                  </span>
                  {saree.occasion && (
                    <span style={{ position: "absolute", bottom: 8, left: 8, padding: "4px 11px", borderRadius: 99, background: "rgba(255,255,255,0.92)", fontSize: 10.5, fontWeight: 600, color: "#2A2522", zIndex: 2 }}>
                      {saree.occasion}
                    </span>
                  )}
                </div>
                <div style={{ padding: "11px 12px 13px" }}>
                  <div className="cx-truncate" style={{ fontSize: 14.5, fontWeight: 700, color: "#2A2522" }}>
                    {saree.name}
                  </div>
                  {city && <div style={{ fontSize: 12, color: "#9A8F8A", marginTop: 3 }}>• {city}</div>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#2A2522" }}>{fmt(saree.price)}</span>
                    <span style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid rgba(104,38,42,0.16)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ArrowRight size={16} color={MAROON} strokeWidth={2.2} />
                    </span>
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

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="cx-press"
      style={{
        flexShrink: 0,
        padding: "9px 18px",
        borderRadius: 99,
        border: active ? "none" : "1px solid rgba(0,0,0,0.10)",
        background: active ? MAROON : "#F4F2F0",
        color: active ? "#fff" : "#6B5E5A",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.02em",
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}
