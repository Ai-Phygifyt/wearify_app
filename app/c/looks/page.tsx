"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { useRouter } from "next/navigation";

/* ── colour tokens (inline) ──────────────────────────────────────── */
const P = {
  plum: "#2D1B4E", plumD: "#1A0A2E", plumL: "#4A2D6E", plumGhost: "#F4EFF9",
  gold: "#C9941A", goldL: "#E8C46A", goldD: "#8B6914",
  rose: "#C2848A", roseD: "#8B4A52", roseL: "#F0D0D4",
  ivory: "#FDF8F0", blush: "#FBF0F4", white: "#FFFFFF",
  text: "#1A0A1E", textMid: "#4A3558", textMuted: "#8B7EA0", textGhost: "#B8A8C8", onDark: "#FDF8F0",
  success: "#1B5E20", error: "#B71C1C",
  shadow: "0 2px 14px rgba(45,27,78,.09)",
  r: 16, pill: 100,
};

/* helper: saree silhouette SVG for card hero */
const SareeSVG = () => (
  <svg viewBox="0 0 80 100" width="44" height="56" style={{ opacity: 0.13, position: "absolute", bottom: 6, right: 8 }}>
    <path d="M40 5 C20 5 15 25 15 45 C15 65 22 85 40 95 C58 85 65 65 65 45 C65 25 60 5 40 5Z" fill={P.goldL} />
    <ellipse cx="40" cy="32" rx="6" ry="10" fill="none" stroke={P.goldL} strokeWidth="1" />
  </svg>
);

/* helper: silk shimmer overlay */
const SilkOverlay = () => (
  <div style={{
    position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", borderRadius: "inherit",
  }}>
    <div style={{
      position: "absolute", top: 0, left: "-100%", width: "55%", height: "100%",
      background: "linear-gradient(105deg,transparent 20%,rgba(255,255,255,.15) 50%,transparent 80%)",
      animation: "cx-shimmer 5.5s ease-in-out infinite",
    }} />
  </div>
);

export default function MyLooksPage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [storeFilter, setStoreFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const looks = useQuery(
    api.sessionOps.listByCustomer,
    customerId ? { customerId } : "skip"
  );
  const storeLinks = useQuery(
    api.customers.listStoreLinksEnriched,
    customerId ? { customerId } : "skip"
  );
  const toggleFav = useMutation(api.sessionOps.toggleFav);

  /* ── loading state ───────────────────────────────────────────── */
  if (!customerId) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  /* ── derived data ────────────────────────────────────────────── */
  const allLooks = looks ?? [];
  const storeCount = new Set(allLooks.map((l) => l.storeId)).size;

  // store-filtered
  const storeFiltered = storeFilter === "all"
    ? allLooks
    : allLooks.filter((l) => l.storeId === storeFilter);

  // unique dates from store-filtered
  const uniqueDates = Array.from(
    new Set(storeFiltered.map((l) => new Date(l.createdAt).toLocaleDateString("en-IN")))
  );

  // date-filtered
  const filteredLooks = dateFilter === "all"
    ? storeFiltered
    : storeFiltered.filter(
        (l) => new Date(l.createdAt).toLocaleDateString("en-IN") === dateFilter
      );

  /* per-store count for pills */
  const storeCountMap: Record<string, number> = {};
  allLooks.forEach((l) => {
    storeCountMap[l.storeId] = (storeCountMap[l.storeId] || 0) + 1;
  });

  return (
    <div className="cx-pageIn" style={{ background: P.ivory, minHeight: "100%" }}>

      {/* ── 1. Plum hero header ─────────────────────────────────── */}
      <div
        className="cx-noise"
        style={{
          position: "relative",
          background: "var(--cx-grad-hero)",
          padding: "20px 20px 22px",
          overflow: "hidden",
        }}
      >
        {/* back btn */}
        <button
          onClick={() => router.back()}
          className="cx-press"
          style={{
            width: 36, height: 36, borderRadius: "50%", border: "none",
            background: "rgba(255,255,255,.18)", display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            backdropFilter: "blur(6px)", marginBottom: 14,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke={P.onDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1
          className="cx-serif"
          style={{ fontSize: 26, fontWeight: 700, fontStyle: "italic", color: P.white, margin: 0, lineHeight: 1.15 }}
        >
          My Looks
        </h1>
        <p style={{ fontSize: 12, color: "rgba(253,248,240,.65)", marginTop: 4, fontWeight: 500 }}>
          {allLooks.length} try-on{allLooks.length !== 1 ? "s" : ""} across {storeCount} store{storeCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── 2. Zari divider ─────────────────────────────────────── */}
      <div className="cx-zari" />

      {/* ── 3. Store filter row ─────────────────────────────────── */}
      <div style={{
        background: P.white, padding: "12px 20px 10px", position: "sticky", top: 0, zIndex: 20,
        borderBottom: `1px solid rgba(232,213,224,.5)`,
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: P.textMuted, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8 }}>
          Filter by store
        </div>
        <div className="cx-no-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {/* All stores pill */}
          <button
            onClick={() => { setStoreFilter("all"); setDateFilter("all"); }}
            className="cx-press"
            style={{
              flexShrink: 0, padding: "6px 14px", borderRadius: P.pill, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              background: storeFilter === "all"
                ? `linear-gradient(135deg, ${P.plum}, ${P.plumL})`
                : P.plumGhost,
              color: storeFilter === "all" ? P.white : P.textMid,
              transition: "all .2s",
            }}
          >
            All Stores ({allLooks.length})
          </button>

          {storeLinks?.map((s) => {
            const isActive = storeFilter === s.storeId;
            const count = storeCountMap[s.storeId] || 0;
            return (
              <button
                key={s._id}
                onClick={() => { setStoreFilter(s.storeId); setDateFilter("all"); }}
                className="cx-press"
                style={{
                  flexShrink: 0, padding: "6px 14px", borderRadius: P.pill, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                  background: isActive
                    ? `linear-gradient(135deg, ${P.plum}, ${P.plumL})`
                    : P.plumGhost,
                  color: isActive ? P.white : P.textMid,
                  transition: "all .2s",
                }}
              >
                {s.storeName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Date filter chips ────────────────────────────────── */}
      {storeFiltered.length > 0 && uniqueDates.length > 1 && (
        <div style={{ padding: "10px 20px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setDateFilter("all")}
            className="cx-press"
            style={{
              padding: "4px 12px", borderRadius: P.pill, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600,
              background: dateFilter === "all" ? P.plum : P.plumGhost,
              color: dateFilter === "all" ? P.white : P.textMid,
              transition: "all .2s",
            }}
          >
            All
          </button>
          {uniqueDates.map((d) => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              className="cx-press"
              style={{
                padding: "4px 12px", borderRadius: P.pill, border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 600,
                background: dateFilter === d ? P.plum : P.plumGhost,
                color: dateFilter === d ? P.white : P.textMid,
                transition: "all .2s",
              }}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* ── 5. 2-column grid ────────────────────────────────────── */}
      <div style={{ padding: "16px 20px 24px" }}>
        {looks === undefined ? (
          /* skeleton */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                height: 200, borderRadius: P.r, background: P.plumGhost,
                animation: "cx-fadeIn .6s ease both", animationDelay: `${i * 0.06}s`,
              }} />
            ))}
          </div>
        ) : filteredLooks.length === 0 ? (
          /* ── 6. Empty state ─────────────────────────────────── */
          <div className="cx-fadeIn" style={{
            textAlign: "center", padding: "48px 20px",
          }}>
            <div style={{ fontSize: 38, marginBottom: 10, opacity: 0.4 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke={P.textGhost} strokeWidth="1.4" />
              </svg>
            </div>
            <div className="cx-serif" style={{ fontSize: 18, fontWeight: 600, fontStyle: "italic", color: P.textMid }}>
              No looks yet
            </div>
            <div style={{ fontSize: 12, color: P.textMuted, marginTop: 6, lineHeight: 1.5 }}>
              Visit a Wearify store and try on sarees to see them here
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {filteredLooks.map((look, idx) => {
              const grad = look.grad || ["#71221D", "#D4A843"];
              const storeInfo = storeLinks?.find((s) => s.storeId === look.storeId);
              const delayClass = `cx-d${(idx % 6) + 1}`;

              return (
                <div
                  key={look._id}
                  className={`cx-scaleIn ${delayClass} cx-hover-lift`}
                  style={{
                    borderRadius: P.r, overflow: "hidden",
                    background: P.white,
                    boxShadow: P.shadow,
                    cursor: "pointer",
                  }}
                >
                  {/* card hero */}
                  <div
                    onClick={() => router.push(`/c/looks/${look._id}`)}
                    className="cx-silk"
                    style={{
                      height: 130, position: "relative",
                      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
                    }}
                  >
                    <SilkOverlay />

                    {/* saree silhouette */}
                    <SareeSVG />

                    {/* cross-hatch SVG pattern */}
                    <svg
                      width="100%" height="100%"
                      style={{ position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none" }}
                    >
                      <defs>
                        <pattern id={`p-${look._id}`} width="12" height="12" patternUnits="userSpaceOnUse">
                          <path d="M0 12L12 0M-3 3L3 -3M9 15L15 9" stroke="#fff" strokeWidth=".6" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#p-${look._id})`} />
                    </svg>

                    {/* heart button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFav({ lookId: look._id });
                      }}
                      className="cx-press"
                      style={{
                        position: "absolute", top: 8, right: 8,
                        width: 30, height: 30, borderRadius: "50%",
                        border: "none", cursor: "pointer",
                        background: "rgba(255,255,255,.22)",
                        backdropFilter: "blur(6px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill={look.isFav ? P.gold : "none"}>
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                          stroke={look.isFav ? P.gold : P.onDark}
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* store city badge */}
                    {storeInfo?.storeCity && (
                      <div style={{
                        position: "absolute", bottom: 8, left: 8,
                        background: "rgba(26,10,46,.72)", backdropFilter: "blur(6px)",
                        borderRadius: P.pill, padding: "3px 9px",
                        fontSize: 9, fontWeight: 600, color: P.onDark,
                        display: "flex", alignItems: "center", gap: 3,
                      }}>
                        <span style={{ fontSize: 10 }}>{"\uD83C\uDFEA"}</span>
                        {storeInfo.storeCity}
                      </div>
                    )}
                  </div>

                  {/* card bottom */}
                  <div
                    onClick={() => router.push(`/c/looks/${look._id}`)}
                    style={{ padding: "10px 10px 11px", background: P.white }}
                  >
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: P.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {look.sareeName}
                    </div>
                    {look.price != null && (
                      <div className="cx-mono" style={{ fontSize: 12, fontWeight: 600, color: P.gold, marginTop: 2 }}>
                        {"\u20B9"}{Number(look.price).toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
