"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft, Heart, MapPin } from "lucide-react";

/* Convex-storage image loader */
function LookImage({ fileId, alt }: { fileId: Id<"_storage">; alt: string }) {
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

const SareeSVG = () => (
  <svg viewBox="0 0 80 100" width="44" height="56" style={{ opacity: 0.13, position: "absolute", bottom: 6, right: 8 }}>
    <path d="M40 5 C20 5 15 25 15 45 C15 65 22 85 40 95 C58 85 65 65 65 45 C65 25 60 5 40 5Z" fill="#D4A017" />
    <ellipse cx="40" cy="32" rx="6" ry="10" fill="none" stroke="#D4A017" strokeWidth="1" />
  </svg>
);

export default function MyLooksPage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [storeFilter, setStoreFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [toast, setToast] = useState("");
  const showToast = React.useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }, []);

  const looks = useQuery(
    api.sessionOps.listByCustomer,
    customerId ? { customerId } : "skip"
  );
  const storeLinks = useQuery(
    api.customers.listStoreLinksEnriched,
    customerId ? { customerId } : "skip"
  );
  const wishlist = useQuery(
    api.customers.getWishlist,
    customerId ? { customerId } : "skip"
  );
  const addToWishlist = useMutation(api.customers.addToWishlist);
  const removeFromWishlist = useMutation(api.customers.removeFromWishlist);

  // Map of sareeId → wishlistRowId. Heart button uses this both to show
  // filled/outlined state and to pick add vs remove on tap. Keyed by
  // sareeId so toggling a look flips every other look of the same saree
  // too (same-saree try-ons share a wishlist entry).
  const wishlistBySareeId = React.useMemo(() => {
    const map = new Map<string, Id<"wishlist">>();
    for (const w of wishlist ?? []) map.set(String(w.sareeId), w._id);
    return map;
  }, [wishlist]);

  if (!customerId) {
    return (
      <div className="cx-loading"><div className="cx-typing"><span /><span /><span /></div></div>
    );
  }

  const allLooks = looks ?? [];
  const storeCount = new Set(allLooks.map((l) => l.storeId)).size;

  const storeFiltered = storeFilter === "all"
    ? allLooks
    : allLooks.filter((l) => l.storeId === storeFilter);

  const uniqueDates = Array.from(
    new Set(storeFiltered.map((l) => new Date(l.createdAt).toLocaleDateString("en-IN")))
  );

  const filteredLooks = dateFilter === "all"
    ? storeFiltered
    : storeFiltered.filter(
        (l) => new Date(l.createdAt).toLocaleDateString("en-IN") === dateFilter
      );

  const storeCountMap: Record<string, number> = {};
  allLooks.forEach((l) => {
    storeCountMap[l.storeId] = (storeCountMap[l.storeId] || 0) + 1;
  });

  return (
    <div className="cx-pageIn cx-page">
      {/* HERO */}
      <div className="cx-hero cx-noise">
        <button onClick={() => router.back()} className="cx-back" style={{ marginBottom: 14 }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="cx-hero-title">My Looks</h1>
        <p className="cx-hero-sub">
          {allLooks.length} try-on{allLooks.length !== 1 ? "s" : ""} across <strong>{storeCount} store{storeCount !== 1 ? "s" : ""}</strong>
        </p>
      </div>
      <div className="cx-zari" />

      {/* Store filter */}
      <div
        style={{
          background: "var(--cx-white)",
          padding: "12px 18px 10px",
          position: "sticky",
          top: 0,
          zIndex: 20,
          borderBottom: "1px solid var(--cx-border-l)",
        }}
      >
        <div className="cx-eyebrow" style={{ marginBottom: 8 }}>Filter by store</div>
        <div className="cx-chip-row">
          <button
            onClick={() => { setStoreFilter("all"); setDateFilter("all"); }}
            className={`cx-chip ${storeFilter === "all" ? "active" : ""}`}
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
                className={`cx-chip ${isActive ? "active" : ""}`}
              >
                {s.storeName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Date filter */}
      {storeFiltered.length > 0 && uniqueDates.length > 1 && (
        <div style={{ padding: "10px 18px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setDateFilter("all")} className={`cx-chip cx-btn-sm ${dateFilter === "all" ? "active" : ""}`}>All</button>
          {uniqueDates.map((d) => (
            <button key={d} onClick={() => setDateFilter(d)} className={`cx-chip cx-btn-sm ${dateFilter === d ? "active" : ""}`}>{d}</button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div style={{ padding: "16px 18px 24px" }}>
        {looks === undefined ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="cx-skeleton" style={{ height: 200, animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        ) : filteredLooks.length === 0 ? (
          <div className="cx-fadeIn cx-empty">
            <div className="cx-empty-icon"><Heart size={26} /></div>
            <div className="cx-empty-title">No looks yet</div>
            <div className="cx-empty-sub">
              Visit a Wearify store and try on sarees to see them here
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {filteredLooks.map((look, idx) => {
              const enriched = look as typeof look & {
                sareeImageId?: Id<"_storage">;
                sareeGrad?: string[];
              };
              const grad = enriched.grad || enriched.sareeGrad || ["#71221D", "#D4A843"];
              const storeInfo = storeLinks?.find((s) => s.storeId === look.storeId);
              const delayClass = `cx-d${(idx % 6) + 1}`;
              const displayImageId: Id<"_storage"> | undefined =
                enriched.imageFileId ?? enriched.sareeImageId;

              return (
                <div
                  key={look._id}
                  className={`cx-card cx-scaleIn ${delayClass} cx-hover-lift`}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    onClick={() => router.push(`/c/looks/${look._id}`)}
                    className="cx-silk"
                    style={{
                      height: 140,
                      position: "relative",
                      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
                    }}
                  >
                    {displayImageId && <LookImage fileId={displayImageId} alt={look.sareeName} />}
                    {!displayImageId && <SareeSVG />}

                    {/* heart → wishlist toggle (appears in /c/wardrobe Wishlist tab) */}
                    {(() => {
                      const wishedId = wishlistBySareeId.get(String(look.sareeId));
                      const wished = !!wishedId;
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!customerId) return;
                            if (wished && wishedId) {
                              removeFromWishlist({ wishlistId: wishedId });
                              showToast("Removed from wishlist");
                            } else {
                              addToWishlist({
                                customerId,
                                sareeId: look.sareeId,
                                storeId: look.storeId,
                                sareeName: look.sareeName,
                                price: look.price ?? undefined,
                              });
                              showToast("Added to wishlist");
                            }
                          }}
                          className="cx-iconbtn cx-iconbtn-sm cx-iconbtn-glass"
                          style={{ position: "absolute", top: 8, right: 8 }}
                          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart
                            size={15}
                            color={wished ? "var(--cx-gold-l)" : "#fff"}
                            fill={wished ? "var(--cx-gold-l)" : "transparent"}
                            strokeWidth={2}
                          />
                        </button>
                      );
                    })()}

                    {/* store city */}
                    {storeInfo?.storeCity && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          background: "rgba(58, 15, 13, .72)",
                          backdropFilter: "blur(6px)",
                          borderRadius: "var(--cx-r-pill)",
                          padding: "3px 9px",
                          fontSize: 9,
                          fontWeight: 600,
                          color: "var(--cx-on-dark)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <MapPin size={9} />
                        {storeInfo.storeCity}
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => router.push(`/c/looks/${look._id}`)}
                    style={{ padding: "10px 12px 12px" }}
                  >
                    <div className="cx-truncate" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--cx-text)" }}>
                      {look.sareeName}
                    </div>
                    {look.price != null && (
                      <div className="cx-mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--cx-gold-d)", marginTop: 3 }}>
                        ₹{Number(look.price).toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)",
          padding: "10px 18px", borderRadius: 100, background: "#8B2E2B", color: "white",
          fontSize: 13, fontWeight: 600, boxShadow: "var(--cx-shadow-md)", zIndex: 50,
        }}>{toast}</div>
      )}
    </div>
  );
}
