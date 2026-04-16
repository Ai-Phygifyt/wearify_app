"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "./layout";
import { useRouter } from "next/navigation";

/* ── Helpers ───────────────────────────────────────────────────────── */
const fmt = (n: number) => "\u20B9" + Number(n).toLocaleString("en-IN");

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

/* ── Offer icon map ────────────────────────────────────────────────── */
const OFFER_ICON: Record<string, string> = {
  festival: "\uD83C\uDF89",
  loyalty: "\uD83C\uDFC6",
  birthday: "\uD83C\uDF82",
  collection: "\uD83D\uDC51",
  flash: "\u26A1",
  referral: "\uD83D\uDC8C",
};

const DEFAULT_OFFER_GRADS: string[][] = [
  ["#2D1B4E", "#C9941A"],
  ["#6B1D52", "#E8C46A"],
  ["#1A0A2E", "#8B4A52"],
];

/* ── Tokens (inline use) ───────────────────────────────────────────── */
const T = {
  plum: "#2D1B4E",
  plumL: "#4A2D6E",
  plumD: "#1A0A2E",
  gold: "#C9941A",
  goldL: "#E8C46A",
  goldD: "#8B6914",
  ivory: "#FDF8F0",
  blush: "#FBF0F4",
  white: "#FFFFFF",
  text: "#1A0A1E",
  textMid: "#4A3558",
  textMuted: "#8B7EA0",
  textGhost: "#B8A8C8",
  onDark: "#FDF8F0",
  border: "#E8D5E0",
  borderL: "#F2E8EE",
  r: 16,
  pill: 100,
  shadow: "0 2px 14px rgba(45,27,78,.09)",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
/* ═══════════════════════════════════════════════════════════════════════
   HOME SCREEN  (CX-07)
   ═══════════════════════════════════════════════════════════════════════ */
export default function CustomerHomePage() {
  const router = useRouter();
  const { user, customerId, customer } = useCustomer();

  /* ── Data queries ────────────────────────────────────────────────── */
  const stores = useQuery(
    api.customers.listStoreLinksEnriched,
    customerId ? { customerId } : "skip"
  );
  const looks = useQuery(
    api.sessionOps.listByCustomer,
    customerId ? { customerId } : "skip"
  );
  const wardrobe = useQuery(
    api.sessionOps.listWardrobeByCustomer,
    customerId ? { customerId } : "skip"
  );
  const offers = useQuery(
    api.customers.listOffersForCustomer,
    customerId ? { customerId } : "skip"
  );

  /* ── Derived ─────────────────────────────────────────────────────── */
  const cust = customer as any;
  const displayName: string = user?.name || cust?.name || "there";
  const firstName = displayName.split(" ")[0];
  const credit: number = cust?.storeCredit ?? 0;
  const isLoading = stores === undefined || looks === undefined;

  /* ── Loading state ───────────────────────────────────────────────── */
  if (!customerId || isLoading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: T.ivory,
        }}
      >
        <div className="cx-typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const activeOffers = (offers ?? []).filter(
    (o: Record<string, unknown>) => o.active !== false
  );
  const recentLooks = (looks ?? []).slice(0, 3);

  return (
    <div className="cx-pageIn" style={{ background: T.ivory, minHeight: "100%" }}>
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="cx-noise cx-paisley"
        style={{
          background: "var(--cx-grad-hero)",
          padding: "28px 18px 22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Logo row */}
        <div
          className="cx-scaleIn"
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, position: "relative", zIndex: 1 }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.gold}, ${T.goldL})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              boxShadow: "0 2px 12px rgba(201,148,26,.35)",
            }}
          >
            {"\uD83E\uDEB7"}
          </div>
          <div>
            <div className="cx-serif cx-gold-shimmer" style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>
              Wearify
            </div>
            <div style={{ fontSize: 10, color: T.textGhost, letterSpacing: 1.5, textTransform: "uppercase" }}>
              Your Style Journey
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="cx-slideUp cx-d1" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 14, color: T.textGhost, marginBottom: 2, fontWeight: 500 }}>
            {greet()}
          </div>
          <div
            className="cx-serif"
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontStyle: "italic",
              color: T.white,
              lineHeight: 1.2,
            }}
          >
            {firstName} {"\u2728"}
          </div>
        </div>

        {/* Stats pills */}
        <div
          className="cx-slideUp cx-d2"
          style={{
            display: "flex",
            gap: 8,
            marginTop: 16,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              background: "rgba(201,148,26,.18)",
              border: "1px solid rgba(201,148,26,.3)",
              borderRadius: T.pill,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: T.goldL,
            }}
          >
            {looks.length} look{looks.length !== 1 ? "s" : ""}
          </div>
          <div
            style={{
              background: "rgba(201,148,26,.18)",
              border: "1px solid rgba(201,148,26,.3)",
              borderRadius: T.pill,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: T.goldL,
            }}
          >
            {stores.length} store{stores.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Store credit banner */}
        {credit > 0 && (
          <div
            className="cx-slideUp cx-d3 cx-press"
            onClick={() => router.push("/c/me/loyalty")}
            style={{
              marginTop: 14,
              background: `linear-gradient(135deg, ${T.gold}, ${T.goldL})`,
              borderRadius: T.pill,
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span style={{ fontSize: 16 }}>{"\uD83D\uDCB0"}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.plum }}>
              {fmt(credit)} store credit available
            </span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: T.plumD }}>{"\u2192"}</span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ZARI DIVIDER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="cx-zari" />

      {/* ═══════════════════════════════════════════════════════════════
          2. OFFERS CAROUSEL
          ═══════════════════════════════════════════════════════════════ */}
      {activeOffers.length > 0 && (
        <div className="cx-slideUp cx-d2" style={{ padding: "18px 0 0" }}>
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 18px",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 16 }}>{"\uD83C\uDFF7\uFE0F"}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
              Offers & Promotions
            </span>
          </div>

          {/* Horizontal scroll */}
          <div
            className="cx-no-scroll"
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: "0 18px 16px",
            }}
          >
            {activeOffers.map((offer: { _id?: string; type?: string; badge?: string; headline?: string; subline?: string; cta?: string; expiry?: string; grad?: string[]; icon?: string; active?: boolean; [k: string]: unknown }, i: number) => {
              const grad = (offer.grad) || DEFAULT_OFFER_GRADS[i % DEFAULT_OFFER_GRADS.length];
              const icon = OFFER_ICON[(offer.type ?? "") || ""] || "\uD83C\uDF81";
              return (
                <div
                  key={(offer._id ?? "") || i}
                  className="cx-silk cx-press cx-scaleIn"
                  style={{
                    flexShrink: 0,
                    width: 220,
                    borderRadius: T.r,
                    overflow: "hidden",
                    background: `linear-gradient(135deg, ${grad[0] || T.plum}, ${grad[1] || T.gold})`,
                    position: "relative",
                    animationDelay: `${0.08 * i}s`,
                  }}
                >
                  <div style={{ padding: 16, minHeight: 130, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    {/* Badge + dismiss */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      {offer.badge && (
                        <div
                          style={{
                            background: "rgba(255,255,255,.2)",
                            borderRadius: T.pill,
                            padding: "2px 10px",
                            fontSize: 10,
                            fontWeight: 700,
                            color: T.white,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                          }}
                        >
                          {offer.badge}
                        </div>
                      )}
                      <button
                        style={{
                          background: "rgba(255,255,255,.15)",
                          border: "none",
                          borderRadius: "50%",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,.7)",
                          fontSize: 12,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {"\u2715"}
                      </button>
                    </div>

                    {/* Content */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                      <div
                        className="cx-serif"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          fontStyle: "italic",
                          color: T.white,
                          lineHeight: 1.25,
                        }}
                      >
                        {offer.headline as string}
                      </div>
                      {offer.subline && (
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)", marginTop: 3 }}>
                          {offer.subline as string}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    {offer.cta && (
                      <div
                        style={{
                          marginTop: 10,
                          background: "rgba(255,255,255,.2)",
                          borderRadius: T.pill,
                          padding: "5px 14px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: T.white,
                          display: "inline-block",
                          alignSelf: "flex-start",
                          cursor: "pointer",
                        }}
                      >
                        {offer.cta as string}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          3. MY STORES
          ═══════════════════════════════════════════════════════════════ */}
      <div className="cx-slideUp cx-d3" style={{ padding: "12px 0 0" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>My Stores</span>
          {stores.length > 0 && (
            <button
              onClick={() => router.push("/c/me/stores")}
              style={{
                background: "none",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                color: T.gold,
                cursor: "pointer",
              }}
            >
              View all {"\u2192"}
            </button>
          )}
        </div>

        {stores.length === 0 ? (
          <div
            style={{
              margin: "0 18px 16px",
              background: T.white,
              borderRadius: T.r,
              padding: "20px 16px",
              textAlign: "center",
              border: `1px solid ${T.borderL}`,
              boxShadow: T.shadow,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{"\uD83C\uDFEA"}</div>
            <div style={{ fontSize: 13, color: T.textMuted }}>
              Visit a Wearify-powered store to see it here
            </div>
          </div>
        ) : (
          <div
            className="cx-no-scroll"
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: "0 18px 16px",
            }}
          >
            {stores.map((store: Record<string, unknown>, i: number) => (
              <div
                key={(store._id as string) || i}
                className="cx-press cx-scaleIn"
                onClick={() => router.push("/c/me/stores")}
                style={{
                  flexShrink: 0,
                  width: 150,
                  borderRadius: T.r,
                  overflow: "hidden",
                  background: T.white,
                  boxShadow: T.shadow,
                  cursor: "pointer",
                  animationDelay: `${0.06 * i}s`,
                }}
              >
                {/* Gradient header */}
                <div
                  style={{
                    height: 48,
                    background: `linear-gradient(135deg, ${T.plum}, ${T.plumL})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{"\uD83C\uDFEA"}</span>
                </div>
                {/* Info */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: T.text,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {(store.storeName as string) || (store.storeId as string)}
                  </div>
                  {(store.storeCity as string) && (
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                      {store.storeCity as string}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: T.textGhost, marginTop: 4 }}>
                    {(store.visits as number) || 0} visit{((store.visits as number) || 0) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          4. FESTIVAL BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="cx-slideUp cx-d4" style={{ padding: "0 18px 16px" }}>
        <div
          className="cx-press cx-silk"
          onClick={() => router.push("/c/new")}
          style={{
            background: `linear-gradient(135deg, ${T.plum} 0%, ${T.plumL} 50%, ${T.gold} 100%)`,
            borderRadius: T.r,
            padding: "20px 18px",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{"\uD83C\uDF3A"}</div>
            <div
              className="cx-serif"
              style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: T.white, lineHeight: 1.2 }}
            >
              Discover New Collections
            </div>
            <div style={{ fontSize: 12, color: "rgba(253,248,240,.7)", marginTop: 4 }}>
              Explore curated sarees from your favourite stores
            </div>
            <div
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,.18)",
                borderRadius: T.pill,
                padding: "6px 16px",
                fontSize: 12,
                fontWeight: 700,
                color: T.white,
              }}
            >
              Browse now {"\u2192"}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          5. QUICK ACTION GRID (2x2)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="cx-slideUp cx-d4" style={{ padding: "0 18px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* My Looks */}
          <div
            className="cx-press cx-scaleIn"
            onClick={() => router.push("/c/looks")}
            style={{
              borderRadius: T.r,
              overflow: "hidden",
              background: T.white,
              boxShadow: T.shadow,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                height: 52,
                background: `linear-gradient(135deg, #8B4A52, #C2848A)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              {"\uD83E\uDE71"}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>My Looks</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                {looks.length} saved look{looks.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* New Arrivals */}
          <div
            className="cx-press cx-scaleIn cx-d1"
            onClick={() => router.push("/c/new")}
            style={{
              borderRadius: T.r,
              overflow: "hidden",
              background: T.white,
              boxShadow: T.shadow,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                height: 52,
                background: `linear-gradient(135deg, ${T.gold}, ${T.goldL})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              {"\u2728"}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>New Arrivals</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>Fresh collections</div>
            </div>
          </div>

          {/* My Wardrobe */}
          <div
            className="cx-press cx-scaleIn cx-d2"
            onClick={() => router.push("/c/wishlist")}
            style={{
              borderRadius: T.r,
              overflow: "hidden",
              background: T.white,
              boxShadow: T.shadow,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                height: 52,
                background: `linear-gradient(135deg, #C2848A, #F0D0D4)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              {"\uD83D\uDC57"}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>My Wardrobe</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                {(wardrobe ?? []).length} piece{(wardrobe ?? []).length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Store Locator */}
          <div
            className="cx-press cx-scaleIn cx-d3"
            onClick={() => router.push("/c/me/stores")}
            style={{
              borderRadius: T.r,
              overflow: "hidden",
              background: T.white,
              boxShadow: T.shadow,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                height: 52,
                background: `linear-gradient(135deg, ${T.plum}, ${T.plumL})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              {"\uD83C\uDFEA"}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Store Locator</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                {stores.length} store{stores.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          6. RECENT LOOKS
          ═══════════════════════════════════════════════════════════════ */}
      {recentLooks.length > 0 && (
        <div className="cx-slideUp cx-d5" style={{ padding: "0 0 20px" }}>
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px",
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Recent Looks</span>
            {looks.length > 3 && (
              <button
                onClick={() => router.push("/c/looks")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.gold,
                  cursor: "pointer",
                }}
              >
                View all {"\u2192"}
              </button>
            )}
          </div>

          {/* Horizontal scroll */}
          <div
            className="cx-no-scroll"
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: "0 18px",
            }}
          >
            {recentLooks.map((look: Record<string, unknown>, i: number) => {
              const grad = (look.grad as string[]) || ["#2D1B4E", "#C9941A"];
              return (
                <div
                  key={look._id as string}
                  className="cx-press cx-scaleIn"
                  onClick={() => router.push(`/c/looks/${look._id as string}`)}
                  style={{
                    flexShrink: 0,
                    width: 150,
                    borderRadius: T.r,
                    overflow: "hidden",
                    background: T.white,
                    boxShadow: T.shadow,
                    cursor: "pointer",
                    animationDelay: `${0.06 * i}s`,
                  }}
                >
                  {/* Gradient placeholder */}
                  <div
                    style={{
                      height: 120,
                      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
                      position: "relative",
                    }}
                  >
                    {/* Store city badge overlay */}
                    {(look.storeId as string) && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 6,
                          left: 6,
                          background: "rgba(0,0,0,.45)",
                          borderRadius: T.pill,
                          padding: "2px 8px",
                          fontSize: 9,
                          fontWeight: 600,
                          color: T.white,
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {look.storeId as string}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: "8px 10px 10px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: T.text,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {look.sareeName as string}
                    </div>
                    {(look.price as number) && (
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.gold, marginTop: 2 }}>
                        {fmt(look.price as number)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          7. WHATSAPP CTA
          ═══════════════════════════════════════════════════════════════ */}
      <div className="cx-slideUp cx-d6" style={{ padding: "0 18px 28px" }}>
        <div
          className="cx-press"
          onClick={() =>
            window.open(
              "https://wa.me/?text=Check%20out%20Wearify%20-%20Virtual%20saree%20try-on!",
              "_blank"
            )
          }
          style={{
            background: T.blush,
            borderRadius: T.r,
            padding: "18px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            border: `1px solid ${T.borderL}`,
          }}
        >
          {/* WhatsApp icon */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#25D366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Chat with a store</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
              Get styling advice via WhatsApp
            </div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 16, color: T.textGhost }}>{"\u203A"}</span>
        </div>
      </div>
    </div>
  );
}
