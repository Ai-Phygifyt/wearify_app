"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "./layout";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Wallet,
  ChevronRight,
  Tag,
  Store,
  Heart,
  Shirt,
  MapPin,
  MessageCircle,
  Flower,
} from "lucide-react";

/* ── Helpers ───────────────────────────────────────────────────────── */
const fmt = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

const DEFAULT_OFFER_GRADS: string[][] = [
  ["#8B2E2B", "#B8860B"],
  ["#8B2E2B", "#D4A017"],
  ["#5E1A18", "#8B4A52"],
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CustomerHomePage() {
  const router = useRouter();
  const { user, customerId, customer } = useCustomer();

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

  const cust = customer as any;
  const displayName: string = user?.name || cust?.name || "there";
  const firstName = displayName.split(" ")[0];
  const credit: number = cust?.storeCredit ?? 0;
  const isLoading = stores === undefined || looks === undefined;

  if (!customerId || isLoading) {
    return (
      <div className="cx-loading">
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const activeOffers = (offers ?? []).filter(
    (o: Record<string, unknown>) => o.active !== false
  );
  const recentLooks = (looks ?? []).slice(0, 3);

  return (
    <div className="cx-pageIn cx-page">
      {/* HERO */}
      <div className="cx-hero cx-noise cx-paisley">
        <div className="cx-brand-row cx-scaleIn">
          <div className="cx-brand-mark">
            <Flower size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="cx-brand-name cx-gold-shimmer">Wearify</div>
            <div className="cx-brand-tag">Your Style Journey</div>
          </div>
        </div>

        <div className="cx-slideUp cx-d1">
          <div className="cx-hero-eyebrow" style={{ marginBottom: 2, textTransform: "none", letterSpacing: 0 }}>
            {greet()}
          </div>
          <div
            className="cx-serif"
            style={{
              fontSize: 30,
              fontWeight: 700,
              fontStyle: "italic",
              color: "var(--cx-on-dark)",
              lineHeight: 1.15,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {firstName}
            <Sparkles size={20} color="var(--cx-gold-l)" fill="var(--cx-gold-l)" />
          </div>
        </div>

        <div className="cx-slideUp cx-d2" style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <span className="cx-badge cx-badge-glass-gold">
            <Heart size={11} strokeWidth={2.4} />
            {looks.length} look{looks.length !== 1 ? "s" : ""}
          </span>
          <span className="cx-badge cx-badge-glass-gold">
            <Store size={11} strokeWidth={2.4} />
            {stores.length} store{stores.length !== 1 ? "s" : ""}
          </span>
        </div>

        {credit > 0 && (
          <button
            className="cx-slideUp cx-d3 cx-press"
            onClick={() => router.push("/c/me/loyalty")}
            style={{
              marginTop: 14,
              background: "var(--cx-grad-gold)",
              borderRadius: "var(--cx-r-pill)",
              padding: "9px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              border: "none",
              fontFamily: "inherit",
              width: "100%",
              boxShadow: "var(--cx-shadow-gold)",
            }}
          >
            <Wallet size={16} color="var(--cx-plum-d)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cx-plum-d)" }}>
              {fmt(credit)} store credit available
            </span>
            <ChevronRight size={16} color="var(--cx-plum-d)" style={{ marginLeft: "auto" }} />
          </button>
        )}
      </div>

      <div className="cx-zari" />

      {/* OFFERS CAROUSEL */}
      {activeOffers.length > 0 && (
        <section className="cx-section cx-slideUp cx-d2">
          <div className="cx-section-head">
            <span className="cx-section-title">
              <Tag size={15} color="var(--cx-gold)" />
              Offers & Promotions
            </span>
          </div>

          <div className="cx-no-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 18px 16px" }}>
            {activeOffers.map((offer: any, i: number) => {
              const grad = offer.grad || DEFAULT_OFFER_GRADS[i % DEFAULT_OFFER_GRADS.length];
              return (
                <div
                  key={offer._id ?? i}
                  className="cx-silk cx-press cx-scaleIn"
                  style={{
                    flexShrink: 0,
                    width: 230,
                    borderRadius: "var(--cx-r)",
                    overflow: "hidden",
                    background: `linear-gradient(135deg, ${grad[0] || "#8B2E2B"}, ${grad[1] || "#B8860B"})`,
                    position: "relative",
                    animationDelay: `${0.06 * i}s`,
                    minHeight: 140,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
                    {offer.badge && (
                      <span
                        style={{
                          background: "rgba(255,255,255,.22)",
                          borderRadius: "var(--cx-r-pill)",
                          padding: "3px 10px",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#fff",
                          textTransform: "uppercase",
                          letterSpacing: ".08em",
                          alignSelf: "flex-start",
                        }}
                      >
                        {offer.badge}
                      </span>
                    )}

                    <div>
                      <div
                        className="cx-serif"
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          fontStyle: "italic",
                          color: "#fff",
                          lineHeight: 1.25,
                        }}
                      >
                        {offer.headline}
                      </div>
                      {offer.subline && (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,.78)", marginTop: 4, lineHeight: 1.4 }}>
                          {offer.subline}
                        </div>
                      )}
                    </div>

                    {offer.cta && (
                      <span
                        style={{
                          background: "rgba(255,255,255,.22)",
                          borderRadius: "var(--cx-r-pill)",
                          padding: "5px 14px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#fff",
                          alignSelf: "flex-start",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {offer.cta} <ChevronRight size={12} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* MY STORES */}
      <section className="cx-section cx-slideUp cx-d3">
        <div className="cx-section-head">
          <span className="cx-section-title">My Stores</span>
          {stores.length > 0 && (
            <button onClick={() => router.push("/c/me/stores")} className="cx-section-link">
              View all <ChevronRight size={12} />
            </button>
          )}
        </div>

        {stores.length === 0 ? (
          <div style={{ margin: "0 18px 16px" }}>
            <div className="cx-card cx-empty" style={{ padding: "24px 16px" }}>
              <div className="cx-empty-icon" style={{ width: 52, height: 52, marginBottom: 10 }}>
                <Store size={22} />
              </div>
              <div style={{ fontSize: 13, color: "var(--cx-text-muted)", maxWidth: 240, margin: "0 auto" }}>
                Visit a Wearify-powered store to see it here
              </div>
            </div>
          </div>
        ) : (
          <div className="cx-no-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 18px 16px" }}>
            {stores.map((store: Record<string, unknown>, i: number) => (
              <div
                key={(store._id as string) || i}
                className="cx-card cx-press cx-scaleIn cx-hover-lift"
                onClick={() => router.push("/c/me/stores")}
                style={{ flexShrink: 0, width: 156, cursor: "pointer", animationDelay: `${0.05 * i}s` }}
              >
                <div
                  style={{
                    height: 54,
                    background: "var(--cx-grad-plum)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--cx-on-dark)",
                  }}
                >
                  <Store size={22} strokeWidth={1.6} />
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div className="cx-truncate" style={{ fontSize: 13, fontWeight: 700, color: "var(--cx-text)" }}>
                    {(store.storeName as string) || (store.storeId as string)}
                  </div>
                  {(store.storeCity as string) && (
                    <div style={{ fontSize: 11, color: "var(--cx-text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={10} />
                      {store.storeCity as string}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: "var(--cx-text-ghost)", marginTop: 4 }}>
                    {(store.visits as number) || 0} visit{((store.visits as number) || 0) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DISCOVER BANNER */}
      <div className="cx-slideUp cx-d4" style={{ padding: "0 18px 16px" }}>
        <button
          className="cx-press cx-silk"
          onClick={() => router.push("/c/new")}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #8B2E2B 0%, #A94540 50%, #B8860B 100%)",
            borderRadius: "var(--cx-r)",
            padding: "20px 18px",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            border: "none",
            textAlign: "left",
            color: "var(--cx-on-dark)",
            fontFamily: "inherit",
            display: "block",
          }}
        >
          <Sparkles size={22} color="var(--cx-gold-l)" fill="var(--cx-gold-l)" />
          <div className="cx-serif" style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", marginTop: 8 }}>
            Discover New Collections
          </div>
          <div style={{ fontSize: 12, color: "rgba(253,248,240,.72)", marginTop: 4 }}>
            Explore curated sarees from your favourite stores
          </div>
          <span
            style={{
              marginTop: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(255,255,255,.18)",
              borderRadius: "var(--cx-r-pill)",
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Browse now <ChevronRight size={13} />
          </span>
        </button>
      </div>

      {/* QUICK ACTION GRID */}
      <div className="cx-slideUp cx-d4" style={{ padding: "0 18px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <QuickAction
            label="My Looks"
            sub={`${looks.length} saved look${looks.length !== 1 ? "s" : ""}`}
            grad="linear-gradient(135deg, #8B4A52, #C2848A)"
            Icon={Heart}
            onClick={() => router.push("/c/looks")}
          />
          <QuickAction
            label="New Arrivals"
            sub="Fresh collections"
            grad="var(--cx-grad-gold)"
            iconColor="var(--cx-plum-d)"
            Icon={Sparkles}
            onClick={() => router.push("/c/new")}
            delay={1}
          />
          <QuickAction
            label="My Wardrobe"
            sub={`${(wardrobe ?? []).length} piece${(wardrobe ?? []).length !== 1 ? "s" : ""}`}
            grad="linear-gradient(135deg, #C2848A, #F0D0D4)"
            iconColor="#5A1A2E"
            Icon={Shirt}
            onClick={() => router.push("/c/wardrobe")}
            delay={2}
          />
          <QuickAction
            label="Store Locator"
            sub={`${stores.length} store${stores.length !== 1 ? "s" : ""}`}
            grad="var(--cx-grad-plum)"
            Icon={MapPin}
            onClick={() => router.push("/c/me/stores")}
            delay={3}
          />
        </div>
      </div>

      {/* RECENT LOOKS */}
      {recentLooks.length > 0 && (
        <section className="cx-section cx-slideUp cx-d5" style={{ padding: "0 0 20px" }}>
          <div className="cx-section-head">
            <span className="cx-section-title">Recent Looks</span>
            {looks.length > 3 && (
              <button onClick={() => router.push("/c/looks")} className="cx-section-link">
                View all <ChevronRight size={12} />
              </button>
            )}
          </div>

          <div className="cx-no-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 18px" }}>
            {recentLooks.map((look: Record<string, unknown>, i: number) => {
              const grad = (look.grad as string[]) || ["#8B2E2B", "#B8860B"];
              return (
                <div
                  key={look._id as string}
                  className="cx-card cx-press cx-scaleIn cx-hover-lift"
                  onClick={() => router.push(`/c/looks/${look._id as string}`)}
                  style={{ flexShrink: 0, width: 156, cursor: "pointer", animationDelay: `${0.05 * i}s` }}
                >
                  <div
                    style={{
                      height: 130,
                      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
                      position: "relative",
                    }}
                  >
                    {(look.storeId as string) && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 6,
                          left: 6,
                          background: "rgba(0,0,0,.50)",
                          borderRadius: "var(--cx-r-pill)",
                          padding: "3px 9px",
                          fontSize: 9,
                          fontWeight: 600,
                          color: "var(--cx-on-dark)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {look.storeId as string}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "8px 10px 10px" }}>
                    <div className="cx-truncate" style={{ fontSize: 13, fontWeight: 700, color: "var(--cx-text)" }}>
                      {look.sareeName as string}
                    </div>
                    {(look.price as number) && (
                      <div className="cx-mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--cx-gold-d)", marginTop: 2 }}>
                        {fmt(look.price as number)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* WHATSAPP CTA */}
      <div className="cx-slideUp cx-d6" style={{ padding: "0 18px 28px" }}>
        <button
          className="cx-press"
          onClick={() =>
            window.open(
              "https://wa.me/?text=Check%20out%20Wearify%20-%20Virtual%20saree%20try-on!",
              "_blank"
            )
          }
          style={{
            width: "100%",
            background: "var(--cx-blush)",
            borderRadius: "var(--cx-r)",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            border: "1px solid var(--cx-border-l)",
            fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "var(--cx-grad-whatsapp)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#fff",
            }}
          >
            <MessageCircle size={22} fill="#fff" strokeWidth={0} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cx-text)" }}>Chat with a store</div>
            <div style={{ fontSize: 12, color: "var(--cx-text-muted)", marginTop: 2 }}>
              Get styling advice via WhatsApp
            </div>
          </div>
          <ChevronRight size={18} color="var(--cx-text-ghost)" />
        </button>
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────── */
function QuickAction({
  label,
  sub,
  grad,
  Icon,
  onClick,
  delay = 0,
  iconColor = "#fff",
}: {
  label: string;
  sub: string;
  grad: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  onClick: () => void;
  delay?: number;
  iconColor?: string;
}) {
  return (
    <button
      className={`cx-card cx-press cx-scaleIn cx-hover-lift cx-d${delay}`}
      onClick={onClick}
      style={{ cursor: "pointer", border: "none", padding: 0, fontFamily: "inherit", textAlign: "left", width: "100%" }}
    >
      <div
        style={{
          height: 56,
          background: grad,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor,
        }}
      >
        <Icon size={24} strokeWidth={1.7} />
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cx-text)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--cx-text-muted)", marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  );
}

