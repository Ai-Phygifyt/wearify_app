"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, Clock, User } from "lucide-react";

const MAROON = "#6E262B";
const KIOSK_IMAGES = ["/kiosk/img1.jpg", "/kiosk/img2.webp", "/kiosk/img3.webp", "/kiosk/img4.jpg"];
const pickImg = (i: number) => KIOSK_IMAGES[i % KIOSK_IMAGES.length];

export default function VisitHistoryPage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const visits = useQuery(api.customers.listVisitHistory, customerId ? { customerId } : "skip");
  const storeLinks = useQuery(api.customers.listStoreLinksEnriched, customerId ? { customerId } : "skip");

  const ready = customerId && visits !== undefined && storeLinks !== undefined;
  const visitCount = visits?.length ?? 0;
  const storeCount = storeLinks?.length ?? 0;

  return (
    <div style={{ minHeight: "100%", background: "#FFFFFF", fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif', display: "flex", flexDirection: "column" }}>
      {/* APP BAR */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "#FFFFFF", padding: "calc(env(safe-area-inset-top,0px) + 14px) 16px 14px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <button onClick={() => router.push("/c/me")} aria-label="Back" className="cx-press" style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", color: "#2A2522" }}>
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#2A2522", margin: 0, marginRight: 28 }}>Visit History</h1>
      </header>

      {!ready ? (
        <div className="cx-loading" style={{ flex: 1 }}><div className="cx-typing"><span /><span /><span /></div></div>
      ) : visitCount === 0 ? (
        /* ── EMPTY STATE ──────────────────────────────────────────── */
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 320, background: "#FFFFFF", border: "1px solid #F0E6E3", borderRadius: 20, boxShadow: "0 8px 30px rgba(0,0,0,0.07)", padding: "30px 22px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FBE4E8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/customer/visit-histroy/no-visit.svg" alt="" style={{ width: 24, height: 22 }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2A2522" }}>No visits yet</div>
            <div style={{ fontSize: 13, color: "#9A8F8A", marginTop: 6 }}>
              {visitCount} visit across {storeCount} store{storeCount !== 1 ? "s" : ""}
            </div>
            <button onClick={() => router.push("/c/me")} className="cx-press" style={{ marginTop: 22, width: "100%", height: 50, borderRadius: 99, border: "1.5px solid rgba(104,38,42,0.18)", background: "#fff", color: "#2A2522", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Back to profile
            </button>
          </div>
        </div>
      ) : (
        /* ── POPULATED ────────────────────────────────────────────── */
        <div style={{ padding: "16px 16px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          {(storeLinks as any[]).map((store, i) => {
            const city = [store.storeCity, store.storeState].filter(Boolean).join(", ");
            return (
              <div key={String(store._id)} style={{ display: "flex", gap: 14, background: "#FFFFFF", border: "1px solid #F0E6E3", borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", padding: 12 }}>
                <div style={{ width: 92, height: 92, borderRadius: 12, flexShrink: 0, backgroundImage: `url(${pickImg(i)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#2A2522" }}>{store.storeName || store.storeId}</div>
                  {city && <Row icon={<MapPin size={12} color={MAROON} fill={MAROON} />} text={city} strong />}
                  {store.lastVisit && <Row icon={<Clock size={12} color="#A99F9A" />} text={`Last: ${store.lastVisit}`} />}
                  {store.storeAddress && <Row icon={<User size={12} color="#A99F9A" />} text={store.storeAddress} />}
                  {store.storeHours && <Row icon={<Clock size={12} color="#A99F9A" />} text={store.storeHours} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ icon, text, strong }: { icon: React.ReactNode; text: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: strong ? "#3A2B28" : "#9A8F8A" }}>
      <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontWeight: strong ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
    </div>
  );
}
