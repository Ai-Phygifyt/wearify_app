"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomer } from "../layout";
import { clearToken, getToken } from "@/lib/phoneAuth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUrl } from "@/lib/ConvexImage";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, ChevronRight, ArrowRight, Star } from "lucide-react";

const MAROON = "#6E262B";
const KIOSK_IMAGES = ["/kiosk/img1.jpg", "/kiosk/img2.webp", "/kiosk/img3.webp", "/kiosk/img4.jpg"];
const pickImg = (i: number) => KIOSK_IMAGES[i % KIOSK_IMAGES.length];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function MePage() {
  const router = useRouter();
  const { user, phone, customerId, customer } = useCustomer();
  const logout = useMutation(api.phoneAuth.logout);
  const [showSignOut, setShowSignOut] = useState(false);

  const storeLinks = useQuery(api.customers.listStoreLinksEnriched, customerId ? { customerId } : "skip");
  const wishlist = useQuery(api.customers.getWishlist, customerId ? { customerId } : "skip");
  const looks = useQuery(api.sessionOps.listByCustomer, customerId ? { customerId } : "skip");
  const visits = useQuery(api.customers.listVisitHistory, customerId ? { customerId } : "skip");

  const displayName = user?.name || (customer?.name as string) || "Customer";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const photoFileId = (customer as Record<string, unknown> | undefined)?.photoFileId as Id<"_storage"> | undefined;
  const photoUrl = useConvexUrl(photoFileId ?? null);
  const maskedPhone = phone ? `${phone.slice(0, 8)}XXXX${phone.slice(-2)}` : "";
  const loyaltyTier = (customer?.loyaltyTier as string) || "Regular";
  const loyaltyPoints = (customer?.loyaltyPoints as number) || 0;
  const storeCredit = (customer?.storeCredit as number) || 0;
  const totalVisits = visits?.length ?? 0;
  const storeCount = storeLinks?.length || 0;

  async function handleLogout() {
    const token = getToken();
    if (token) { try { await logout({ token }); } catch { /* */ } }
    clearToken();
    // Full navigation (not router.replace) so the customer layout remounts
    // and the splash / loading screen plays again before the welcome page.
    window.location.replace("/c/welcome");
  }

  if (!user) {
    return <div className="cx-loading"><div className="cx-typing"><span /><span /><span /></div></div>;
  }

  const menuItems = [
    { icon: "edit-profile.svg", label: "Edit Profile", sub: "Name , Photo, DOB, Height, City", href: "/c/me/profile" },
    { icon: "preferences.svg", label: "Preferences", sub: "Occasions, Fabrics, colors, upcomings events", href: "/c/me/preferences" },
    { icon: "visit-histroy.svg", label: "Visit History", sub: `${totalVisits} visits across ${storeCount} store${storeCount !== 1 ? "s" : ""}`, href: "/c/me/history" },
    { icon: "loyalty-credits.svg", label: "Loyalty & Credits", sub: `${loyaltyPoints} pts, ₹${storeCredit} credit, ${loyaltyTier}`, href: "/c/me/loyalty" },
    { icon: "my-tailor-orders.svg", label: "My Tailor Orders", sub: "Track orders, measurements & rate tailors", href: "/c/me/tailor-orders" },
    { icon: "refer-a-friend.svg", label: "Refer a friends", sub: "Earn 500 wearify credit per referral", href: "/c/me/refer" },
    { icon: "privacy.svg", label: "Privacy & DPDP", sub: "Manage consent, download or delete data", href: "/c/me/privacy" },
    { icon: "language.svg", label: "Language", sub: "Tap to change", href: "/c/me/language" },
    { icon: "rate.svg", label: "Rate Your Visit", sub: "Share Feedback on your last store visit", href: "/c/me/feedback" },
  ];

  const stats = [
    { l: "Looks", v: looks?.length || 0 },
    { l: "Stores", v: storeCount },
    { l: "Wishlist", v: wishlist?.length || 0 },
    { l: "Credit", v: `₹${storeCredit}` },
  ];

  return (
    <div style={{ minHeight: "100%", background: "#FFFFFF", fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* ── MAROON HEADER ──────────────────────────────────────────── */}
      <div style={{ background: MAROON, borderRadius: "0 0 26px 26px", padding: "calc(env(safe-area-inset-top,0px) + 14px) 16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <button onClick={() => router.back()} aria-label="Back" className="cx-press" style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", color: "#fff" }}>
            <ChevronLeft size={24} strokeWidth={2.2} />
          </button>
          <h1 style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "0.06em", margin: 0, marginRight: 28 }}>PROFILE</h1>
        </div>

        {/* Profile card */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#ECE3DA", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20, color: MAROON }}>
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
            ) : initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: "#2A2522", lineHeight: 1.2 }}>{displayName}</div>
            <div style={{ fontSize: 14, color: "#9A8F8A", marginTop: 2 }}>{maskedPhone}</div>
            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              <Pill icon="/customer/profile/regular.svg">{loyaltyTier}</Pill>
              <Pill icon="/customer/profile/store.svg">{storeCount} store{storeCount !== 1 ? "s" : ""}</Pill>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <div style={{ margin: "16px 16px 0", background: "#FCF5E9", border: "1px solid #E7D2BC", borderRadius: 14, display: "flex", overflow: "hidden" }}>
        {stats.map((s, i) => (
          <div key={s.l} style={{ flex: 1, textAlign: "center", padding: "14px 4px", borderLeft: i ? "1px solid #EAD9C5" : "none" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#2A2522" }}>{s.v}</div>
            <div style={{ fontSize: 12, color: "#9A8F8A", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── MY STORES ──────────────────────────────────────────────── */}
      {storeLinks && storeLinks.length > 0 && (
        <section style={{ marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", marginBottom: 14 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#2A2522", margin: 0 }}>My Stores</h2>
            <button onClick={() => router.push("/c/me/stores")} className="cx-press" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ fontSize: 15, color: "#9A8F8A", fontWeight: 500 }}>See All</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/customer/home/seeall-arrow.svg" alt="" style={{ width: 30, height: 30 }} />
            </button>
          </div>
          <div className="cx-no-scroll" style={{ display: "flex", gap: 14, overflowX: "auto", padding: "0 16px 4px" }}>
            {(storeLinks as any[]).map((store, i) => (
              <div key={String(store._id)} style={{ flex: "0 0 220px", background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1px solid #F0E6E3", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <div style={{ position: "relative", height: 130, backgroundImage: `url(${pickImg(i)})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                  <span style={{ position: "absolute", bottom: 8, left: 8, display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(28,17,8,0.6)", borderRadius: 99, padding: "3px 8px" }}>
                    <Star size={10} fill="#F0B429" color="#F0B429" />
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff" }}>{(store.rating as number) ?? "5.0"}</span>
                  </span>
                </div>
                <div style={{ padding: "11px 12px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="cx-truncate" style={{ fontSize: 15, fontWeight: 700, color: "#2A2522" }}>{store.storeName || store.storeId}</div>
                    <div className="cx-truncate" style={{ fontSize: 12.5, color: "#9A8F8A", marginTop: 2 }}>{store.storeCity || "—"}</div>
                  </div>
                  <button onClick={() => router.push("/c/me/stores")} aria-label="Open store" style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, border: "1.5px solid rgba(104,38,42,0.16)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <ArrowRight size={16} color={MAROON} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MENU ───────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 18px 8px" }}>
        {menuItems.map((item, i) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="cx-press"
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "15px 0", background: "none", border: "none", borderTop: i ? "1px solid #E7D2BC" : "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
          >
            <span style={{ width: 48, height: 48, borderRadius: 12, background: "#FBF1DD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/customer/profile/${item.icon}`} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: "#2A2522" }}>{item.label}</span>
              <span className="cx-truncate" style={{ display: "block", fontSize: 12.5, color: "#9A8F8A", marginTop: 2 }}>{item.sub}</span>
            </span>
            <ChevronRight size={26} color="#B59A88" strokeWidth={2.2} />
          </button>
        ))}
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 18px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => router.push("/c/me/stores")} className="cx-press" style={{ width: "100%", height: 54, borderRadius: 14, border: "none", background: "#3FB950", color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/customer/home/whatsapp.svg" alt="" style={{ width: 22, height: 22 }} />
          Chat with a Wearify store
        </button>
        <button onClick={() => setShowSignOut(true)} className="cx-press" style={{ width: "100%", height: 54, borderRadius: 14, border: "none", background: MAROON, color: "#fff", fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          Log Out
        </button>
        <div style={{ textAlign: "center", marginTop: 4, fontSize: 12, color: "#9A8F8A" }}>
          © copyright wearify techno services pvt.ltd.
        </div>
      </div>

      {/* Sign-out modal */}
      {showSignOut && (
        <div onClick={() => setShowSignOut(false)} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(28,17,8,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "cx-fadeIn .18s ease" }}>
          <div onClick={(e) => e.stopPropagation()} className="cx-scaleIn" style={{ width: "100%", maxWidth: 340, background: "#fff", borderRadius: 22, padding: "28px 22px 22px", textAlign: "center", boxShadow: "0 24px 80px rgba(10,22,40,.30)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FCE4E8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/customer/logout.svg" alt="" style={{ width: 28, height: 28 }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#2A2522", marginBottom: 6 }}>Logout</div>
            <p style={{ fontSize: 13.5, color: "#9A8F8A", lineHeight: 1.55, margin: "0 0 22px" }}>You can login back in anytime with your mobile number</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowSignOut(false)} className="cx-press" style={{ flex: 1, height: 50, borderRadius: 12, border: "1.5px solid #E4D9CC", background: "#fff", color: "#2A2522", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={() => { setShowSignOut(false); handleLogout(); }} className="cx-press" style={{ flex: 1, height: 50, borderRadius: 12, border: "none", background: MAROON, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FBF1DD", borderRadius: 99, padding: "5px 12px", fontSize: 13, fontWeight: 600, color: MAROON }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" style={{ width: 13, height: 13, objectFit: "contain" }} />
      {children}
    </span>
  );
}
