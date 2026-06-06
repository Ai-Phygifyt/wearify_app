"use client";

import React, { useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "./layout";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowRight, ChevronRight, X, Star } from "lucide-react";

const MAROON = "#6E262B";

// Convex-storage image loader. Returns null while resolving so the parent's
// gradient stands in until the real image lands.
function LookTileImage({ fileId, alt }: { fileId: Id<"_storage">; alt: string }) {
  const url = useQuery(api.files.getUrl, { fileId });
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      loading="lazy"
    />
  );
}

/* ── Helpers ───────────────────────────────────────────────────────── */
const fmt = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const KIOSK_IMAGES = ["/kiosk/img1.jpg", "/kiosk/img2.webp", "/kiosk/img3.webp", "/kiosk/img4.jpg"];
const pickImg = (i: number) => KIOSK_IMAGES[i % KIOSK_IMAGES.length];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CustomerHomePage() {
  const router = useRouter();
  const { user, customerId, customer } = useCustomer();

  const stores = useQuery(api.customers.listStoreLinksEnriched, customerId ? { customerId } : "skip");
  const looks = useQuery(api.sessionOps.listByCustomer, customerId ? { customerId } : "skip");
  const wardrobe = useQuery(api.sessionOps.listWardrobeByCustomer, customerId ? { customerId } : "skip");
  const offers = useQuery(api.customers.listOffersForCustomer, customerId ? { customerId } : "skip");

  const [offerIdx, setOfferIdx] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const offerScrollRef = useRef<HTMLDivElement | null>(null);

  const cust = customer as any;
  const displayName: string = user?.name || cust?.name || "there";
  const isLoading = stores === undefined || looks === undefined;

  if (!customerId || isLoading) {
    return (
      <div className="cx-loading">
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const activeOffers = (offers ?? []).filter((o: Record<string, unknown>) => o.active !== false);
  const offerSlides = activeOffers.length > 0 ? activeOffers : [{ _id: "_default" }];
  const recentLooks = (looks ?? []).slice(0, 8);
  const visibleStores = (stores ?? []).filter((s: any) => !dismissed.has(String(s._id)));
  const wardrobeCount = (wardrobe ?? []).length;

  function onOfferScroll() {
    const el = offerScrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== offerIdx) setOfferIdx(idx);
  }

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100%", fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* ── HEADER BAR ─────────────────────────────────────────────── */}
      <header
        style={{
          background: "#ECD9D8",
          padding: "calc(env(safe-area-inset-top, 0px) + 12px) 18px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/customer/home/logo.svg" alt="Wearify" style={{ width: 46, height: 46, borderRadius: "50%" }} />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/customer/home/middle-logo.svg" alt="Wearify — Your Style Journey" style={{ height: 38, width: "auto" }} />

        <button
          onClick={() => router.push("/c/me")}
          aria-label="Notifications"
          style={{
            position: "relative",
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "#FFFFFF",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(104,38,42,0.10)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/customer/home/notification.svg" alt="" style={{ width: 34, height: 34 }} />
        </button>
      </header>

      {/* ── GREETING ───────────────────────────────────────────────── */}
      <section style={{ padding: "20px 18px 0" }}>
        <div style={{ fontSize: 16, color: "#9A8F8A", fontWeight: 500 }}>{greet()}</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#2A2522", margin: "2px 0 0", lineHeight: 1.15 }}>
          {displayName}
        </h1>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <Chip onClick={() => router.push("/c/looks")} icon="/customer/home/looks.svg">
            {looks!.length} look{looks!.length !== 1 ? "s" : ""}
          </Chip>
          <Chip onClick={() => router.push("/c/me/stores")} icon="/customer/home/store.svg">
            {stores!.length} store{stores!.length !== 1 ? "s" : ""}
          </Chip>
        </div>
      </section>

      {/* ── OFFERS & PROMOTIONS ────────────────────────────────────── */}
      <section style={{ marginTop: 26 }}>
        <h2 style={sectionTitle}>Offers &amp; Promotions</h2>
        <div
          ref={offerScrollRef}
          onScroll={onOfferScroll}
          className="cx-no-scroll"
          style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px", gap: 14 }}
        >
          {offerSlides.map((o: any, i: number) => (
            <div key={o._id ?? i} style={{ flex: "0 0 100%", scrollSnapAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/customer/home/offers-promotion-card.svg"
                alt={o.headline || "Offers"}
                style={{ width: "100%", height: "auto", borderRadius: 18, display: "block", boxShadow: "0 8px 24px rgba(104,38,42,0.10)" }}
              />
            </div>
          ))}
        </div>
        {offerSlides.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 14 }}>
            {offerSlides.map((_: any, i: number) => (
              <span
                key={i}
                style={{
                  height: 7,
                  width: i === offerIdx ? 22 : 7,
                  borderRadius: 99,
                  background: i === offerIdx ? MAROON : "#E2D3D2",
                  transition: "width .25s ease, background .25s ease",
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── MY SPACE ───────────────────────────────────────────────── */}
      <section style={{ marginTop: 26, padding: "0 18px" }}>
        <h2 style={{ ...sectionTitle, padding: 0, marginBottom: 14 }}>My Space</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <SpaceCard bg="#FBE4E8" title="My looks" sub={`${looks!.length} saved looks`} onClick={() => router.push("/c/looks")} />
          <SpaceCard bg="#FBF1D7" title="New Arrivals" sub="Frash Collection" onClick={() => router.push("/c/new")} />
          <SpaceCard bg="#EAE3F5" title="My Wardrobe" sub={`${wardrobeCount} Piece${wardrobeCount !== 1 ? "s" : ""}`} onClick={() => router.push("/c/wardrobe")} />
          <SpaceCard bg="#E2F0E4" title="Store Locator" sub={`${stores!.length} store${stores!.length !== 1 ? "s" : ""} nearby`} onClick={() => router.push("/c/me/stores")} />
        </div>
      </section>

      {/* ── MY STORES ──────────────────────────────────────────────── */}
      {visibleStores.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <SectionHead title="My Stores" onSeeAll={() => router.push("/c/me/stores")} />
          <div className="cx-no-scroll" style={{ display: "flex", gap: 14, overflowX: "auto", padding: "0 18px 4px" }}>
            {visibleStores.map((store: any, i: number) => (
              <div
                key={String(store._id) || i}
                style={{ flex: "0 0 230px", background: "#FFFFFF", borderRadius: 18, overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.07)" }}
              >
                <div
                  style={{
                    position: "relative",
                    height: 150,
                    backgroundImage: `url(${pickImg(i)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <button
                    onClick={() => setDismissed((s) => new Set(s).add(String(store._id)))}
                    aria-label="Dismiss"
                    style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    <X size={15} color="#6B5E5A" strokeWidth={2.4} />
                  </button>
                  <span style={{ position: "absolute", bottom: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(28,17,8,0.6)", borderRadius: 99, padding: "4px 9px", backdropFilter: "blur(6px)" }}>
                    <Star size={11} fill="#F0B429" color="#F0B429" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{(store.rating as number) ?? "5.0"}</span>
                  </span>
                </div>
                <div style={{ padding: "12px 14px 14px" }}>
                  <div className="cx-truncate" style={{ fontSize: 16, fontWeight: 700, color: "#2A2522" }}>
                    {(store.storeName as string) || (store.storeId as string)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontSize: 13, color: "#9A8F8A" }}>{(store.storeCity as string) || "—"}</span>
                    <button
                      onClick={() => router.push("/c/me/stores")}
                      aria-label="Open store"
                      style={{ width: 38, height: 38, borderRadius: 12, border: `1.5px solid rgba(104,38,42,0.16)`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <ArrowRight size={17} color={MAROON} strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── RECENT LOOKS ───────────────────────────────────────────── */}
      {recentLooks.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <SectionHead title="Recent Looks" onSeeAll={() => router.push("/c/looks")} />
          <div className="cx-no-scroll" style={{ display: "flex", gap: 14, overflowX: "auto", padding: "0 18px 4px" }}>
            {recentLooks.map((look: any) => {
              const imageFileId = (look.imageFileId ?? look.sareeImageId) as Id<"_storage"> | undefined;
              const grad = (look.grad ?? look.sareeGrad) as string[] | undefined;
              const fallbackBg = grad && grad.length
                ? `linear-gradient(135deg, ${grad[0]}, ${grad[1] ?? grad[0]})`
                : "linear-gradient(135deg, #71221D, #D4A843)";
              return (
                <div
                  key={String(look._id)}
                  onClick={() => router.push(`/c/looks/${String(look._id)}`)}
                  style={{ flex: "0 0 200px", cursor: "pointer" }}
                >
                  <div style={{ position: "relative", height: 250, borderRadius: 16, overflow: "hidden", background: fallbackBg }}>
                    {imageFileId && <LookTileImage fileId={imageFileId} alt={look.sareeName as string} />}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#2A2522", marginTop: 10 }}>
                    {(look.sareeName as string) || "Saree"}
                  </div>
                  {(look.price as number) > 0 && (
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#2A2522", marginTop: 2 }}>
                      {fmt(look.price as number)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── WHATSAPP CTA ───────────────────────────────────────────── */}
      <div style={{ padding: "26px 18px 14px" }}>
        <button
          onClick={() => window.open("https://wa.me/?text=Check%20out%20Wearify%20-%20Virtual%20saree%20try-on!", "_blank")}
          className="cx-press"
          style={{
            width: "100%",
            background: MAROON,
            borderRadius: 18,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            border: "none",
            fontFamily: "inherit",
            textAlign: "left",
            boxShadow: "0 10px 26px rgba(110,38,43,0.28)",
          }}
        >
          <span style={{ width: 46, height: 46, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/customer/home/whatsapp.svg" alt="" style={{ width: 28, height: 28 }} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Chat with a store</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", marginTop: 2 }}>Got styling advice via WhatsApp</div>
          </div>
          <ChevronRight size={22} color="#fff" />
        </button>
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────── */
const sectionTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#2A2522",
  margin: 0,
  padding: "0 18px",
  marginBottom: 14,
};

function Chip({ icon, children, onClick }: { icon: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="cx-press"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: "#FFFFFF",
        border: "1px solid rgba(104,38,42,0.16)",
        borderRadius: 99,
        padding: "9px 16px",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 2px 8px rgba(104,38,42,0.06)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" style={{ width: 14, height: 14 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: MAROON }}>{children}</span>
    </button>
  );
}

function SpaceCard({ bg, title, sub, onClick }: { bg: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="cx-press"
      style={{
        position: "relative",
        background: bg,
        border: "none",
        borderRadius: 16,
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        minHeight: 92,
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 15.5, fontWeight: 700, color: "#2A2522", paddingRight: 34, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#8C8580", marginTop: 4, paddingRight: 34, lineHeight: 1.3 }}>{sub}</div>
      <span
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/customer/home/arrow.svg" alt="" style={{ width: 13, height: 13 }} />
      </span>
    </button>
  );
}

function SectionHead({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", marginBottom: 14 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#2A2522", margin: 0 }}>{title}</h2>
      <button
        onClick={onSeeAll}
        className="cx-press"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
      >
        <span style={{ fontSize: 15, color: "#9A8F8A", fontWeight: 500 }}>See All</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/customer/home/seeall-arrow.svg" alt="" style={{ width: 30, height: 30 }} />
      </button>
    </div>
  );
}
