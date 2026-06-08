"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";
import { ChevronLeft, X, Star, MapPin, User, Clock } from "lucide-react";

const MAROON = "#6E262B";
const KIOSK_IMAGES = ["/kiosk/img1.jpg", "/kiosk/img2.webp", "/kiosk/img3.webp", "/kiosk/img4.jpg"];
const pickImg = (i: number) => KIOSK_IMAGES[i % KIOSK_IMAGES.length];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function MyStoresPage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const storeLinks = useQuery(
    api.customers.listStoreLinksEnriched,
    customerId ? { customerId } : "skip"
  );

  const visible = (storeLinks ?? []).filter((s: any) => !dismissed.has(String(s._id)));

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
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="cx-press"
          style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", color: "#2A2522" }}
        >
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#2A2522", letterSpacing: "0.06em", margin: 0, marginRight: 28 }}>
          MY STORES
        </h1>
      </header>

      {/* ── TITLE ──────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 16px 6px" }}>
        <h2 style={{ fontSize: 21, fontWeight: 700, color: "#2A2522", margin: 0 }}>
          {storeLinks ? `${visible.length} Wearify Store${visible.length !== 1 ? "s" : ""}` : "Loading…"}
        </h2>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <div style={{ padding: "10px 16px 28px" }}>
        {storeLinks === undefined ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[1, 2].map((i) => (
              <div key={i} className="cx-fadeIn" style={{ height: 300, borderRadius: 16, background: "linear-gradient(135deg, #F5E6E3, #F0E8DC)", opacity: 0.6 }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="cx-slideUp" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FBE4E8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <MapPin size={28} color={MAROON} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#2A2522" }}>No stores yet</div>
            <div style={{ fontSize: 13, color: "#9A8F8A", marginTop: 6 }}>Visit a Wearify-powered store to see it here</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {visible.map((store: any, idx: number) => (
              <StoreCard
                key={String(store._id)}
                store={store}
                img={pickImg(idx)}
                onDismiss={() => setDismissed((s) => new Set(s).add(String(store._id)))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StoreCard({ store, img, onDismiss }: { store: any; img: string; onDismiss: () => void }) {
  const city = [store.storeCity, store.storeState].filter(Boolean).join(", ");
  const phone = (store.storePhone as string | undefined)?.replace(/[^0-9]/g, "");

  return (
    <div style={{ background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1px solid #F0E6E3", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
      {/* Image */}
      <div style={{ position: "relative", height: 130, backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <X size={14} color="#6B5E5A" strokeWidth={2.4} />
        </button>
        <span style={{ position: "absolute", bottom: 8, left: 8, display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(28,17,8,0.6)", borderRadius: 99, padding: "3px 8px", backdropFilter: "blur(6px)" }}>
          <Star size={10} fill="#F0B429" color="#F0B429" />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff" }}>{(store.rating as number) ?? "5.0"}</span>
        </span>
      </div>

      {/* Details */}
      <div style={{ padding: "12px 12px 14px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#2A2522", lineHeight: 1.2 }}>
          {store.storeName || store.storeId}
        </div>

        {city && (
          <Row icon={<MapPin size={12} color={MAROON} fill={MAROON} />} text={city} strong />
        )}

        <Row
          icon={<User size={11} color="#A99F9A" />}
          text={`${store.visits || 0} visits`}
          extraIcon={<Clock size={11} color="#A99F9A" />}
          extra={store.lastVisit ? `Last: ${store.lastVisit}` : undefined}
        />

        {store.storeAddress && <Row icon={<MapPin size={11} color="#A99F9A" />} text={store.storeAddress} />}
        {store.storeHours && <Row icon={<Clock size={11} color="#A99F9A" />} text={store.storeHours} />}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 6 }}>
          <button
            onClick={() => phone && window.open(`https://wa.me/${phone}`, "_blank")}
            aria-label="WhatsApp"
            className="cx-press"
            style={{ width: 40, height: 40, borderRadius: 11, background: "#F2F1EF", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/customer/home/whatsapp.svg" alt="" style={{ width: 22, height: 22 }} />
          </button>
          <button
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((store.storeAddress || store.storeName || "") + " " + (store.storeCity || ""))}`, "_blank")}
            className="cx-press"
            style={{ flex: 1, height: 40, borderRadius: 11, background: MAROON, border: "none", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Directions
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, text, strong, extraIcon, extra }: { icon: React.ReactNode; text: string; strong?: boolean; extraIcon?: React.ReactNode; extra?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: strong ? "#3A2B28" : "#9A8F8A", lineHeight: 1.3 }}>
      <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontWeight: strong ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
      {extra && (
        <>
          <span style={{ display: "flex", flexShrink: 0, marginLeft: 4 }}>{extraIcon}</span>
          <span style={{ whiteSpace: "nowrap" }}>{extra}</span>
        </>
      )}
    </div>
  );
}
