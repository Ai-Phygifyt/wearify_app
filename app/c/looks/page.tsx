"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, Heart } from "lucide-react";

const MAROON = "#6E262B";

/* Convex-storage image loader */
function LookImage({ fileId, alt }: { fileId: Id<"_storage">; alt: string }) {
  const url = useQuery(api.files.getUrl, { fileId });
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
  );
}

const longDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const shortDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });

/* eslint-disable @typescript-eslint/no-explicit-any */
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

  const looks = useQuery(api.sessionOps.listByCustomer, customerId ? { customerId } : "skip");
  const storeLinks = useQuery(api.customers.listStoreLinksEnriched, customerId ? { customerId } : "skip");
  const wishlist = useQuery(api.customers.getWishlist, customerId ? { customerId } : "skip");
  const addToWishlist = useMutation(api.customers.addToWishlist);
  const removeFromWishlist = useMutation(api.customers.removeFromWishlist);

  const wishlistBySareeId = React.useMemo(() => {
    const map = new Map<string, Id<"wishlist">>();
    for (const w of wishlist ?? []) map.set(String(w.sareeId), w._id);
    return map;
  }, [wishlist]);

  if (!customerId) {
    return <div className="cx-loading"><div className="cx-typing"><span /><span /><span /></div></div>;
  }

  const allLooks = (looks ?? []) as any[];
  const storeCount = new Set(allLooks.map((l) => l.storeId)).size;

  const storeFiltered = storeFilter === "all" ? allLooks : allLooks.filter((l) => l.storeId === storeFilter);
  const uniqueDates = Array.from(new Set(storeFiltered.map((l) => shortDate(l.createdAt))));
  const filteredLooks = dateFilter === "all" ? storeFiltered : storeFiltered.filter((l) => shortDate(l.createdAt) === dateFilter);

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
          MY LOOKS
        </h1>
      </header>

      {/* ── TITLE ──────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 18px 0" }}>
        <h2 style={{ fontSize: 25, fontWeight: 700, color: "#2A2522", margin: 0 }}>
          {allLooks.length} Try-On{allLooks.length !== 1 ? "s" : ""} Across {storeCount} Store{storeCount !== 1 ? "s" : ""}
        </h2>
        <div style={{ fontSize: 13.5, color: "#9A8F8A", marginTop: 6 }}>Filter By Stores</div>
      </div>

      {/* ── STORE FILTER ───────────────────────────────────────────── */}
      <div className="cx-no-scroll" style={{ display: "flex", alignItems: "center", gap: 10, overflowX: "auto", padding: "12px 18px 4px" }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, background: MAROON, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src="/customer/filter.svg" alt="" width={15} height={17} style={{ display: "block" }} />
        </span>
        <Chip active={storeFilter === "all"} onClick={() => { setStoreFilter("all"); setDateFilter("all"); }}>All</Chip>
        {(storeLinks as any[] | undefined)?.map((s) => (
          <Chip key={s._id} active={storeFilter === s.storeId} onClick={() => { setStoreFilter(s.storeId); setDateFilter("all"); }}>
            {String(s.storeName || s.storeId).split(" ")[0].toUpperCase()}
          </Chip>
        ))}
      </div>

      {/* ── DATE FILTER ────────────────────────────────────────────── */}
      {storeFiltered.length > 0 && (
        <div className="cx-no-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", padding: "10px 18px 4px" }}>
          <Chip active={dateFilter === "all"} onClick={() => setDateFilter("all")}>All</Chip>
          {uniqueDates.map((d) => (
            <Chip key={d} active={dateFilter === d} onClick={() => setDateFilter(d)}>{d}</Chip>
          ))}
        </div>
      )}

      {/* ── GRID ───────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 16px 28px" }}>
        {looks === undefined ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="cx-fadeIn" style={{ height: 260, borderRadius: 16, background: "linear-gradient(135deg, #F5E6E3, #F0E8DC)", opacity: 0.6 }} />
            ))}
          </div>
        ) : filteredLooks.length === 0 ? (
          <div className="cx-fadeIn" style={{ textAlign: "center", padding: "56px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FBE4E8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Heart size={26} color={MAROON} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#2A2522" }}>No looks yet</div>
            <div style={{ fontSize: 13, color: "#9A8F8A", marginTop: 6 }}>Try on sarees at a Wearify store to see them here</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {filteredLooks.map((look) => {
              const grad = look.grad || look.sareeGrad || ["#71221D", "#D4A843"];
              const storeInfo = (storeLinks as any[] | undefined)?.find((s) => s.storeId === look.storeId);
              const displayImageId: Id<"_storage"> | undefined = look.imageFileId ?? look.sareeImageId;
              const wishedId = wishlistBySareeId.get(String(look.sareeId));
              const wished = !!wishedId;
              const occasion = look.sareeOccasion as string | undefined;

              return (
                <div key={look._id} style={{ background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1px solid #F0E6E3", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                  <div
                    onClick={() => router.push(`/c/looks/${look._id}`)}
                    style={{ position: "relative", height: 220, cursor: "pointer", background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})` }}
                  >
                    {displayImageId && <LookImage fileId={displayImageId} alt={look.sareeName} />}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!customerId) return;
                        if (wished && wishedId) {
                          removeFromWishlist({ wishlistId: wishedId });
                          showToast("Removed from wishlist");
                        } else {
                          addToWishlist({ customerId, sareeId: look.sareeId, storeId: look.storeId, sareeName: look.sareeName, price: look.price ?? undefined });
                          showToast("Added to wishlist");
                        }
                      }}
                      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                      style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Heart size={15} color={MAROON} fill={wished ? MAROON : "transparent"} strokeWidth={2} />
                    </button>

                    {occasion && (
                      <span style={{ position: "absolute", bottom: 8, left: 8, padding: "4px 11px", borderRadius: 99, background: "rgba(255,255,255,0.92)", fontSize: 10.5, fontWeight: 600, color: "#2A2522" }}>
                        {occasion}
                      </span>
                    )}
                  </div>

                  <div onClick={() => router.push(`/c/looks/${look._id}`)} style={{ padding: "11px 12px 13px", cursor: "pointer" }}>
                    <div className="cx-truncate" style={{ fontSize: 14.5, fontWeight: 700, color: "#2A2522" }}>
                      {look.sareeName}
                    </div>
                    <div className="cx-truncate" style={{ fontSize: 12, color: "#9A8F8A", marginTop: 3 }}>
                      {longDate(look.createdAt)}{storeInfo?.storeCity ? ` • ${storeInfo.storeCity}` : ""}
                    </div>
                    {look.price != null && (
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#2A2522", marginTop: 6 }}>
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
        <div style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", padding: "10px 18px", borderRadius: 100, background: MAROON, color: "white", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 50 }}>{toast}</div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="cx-press"
      style={{
        flexShrink: 0,
        padding: "9px 18px",
        borderRadius: 11,
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
