"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomer } from "../layout";
import { clearToken, getToken } from "@/lib/phoneAuth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUrl } from "@/lib/ConvexImage";
import { Id } from "@/convex/_generated/dataModel";
import {
  User,
  Settings,
  Clock,
  Crown,
  Scissors,
  Users,
  Star,
  Lock,
  Globe,
  ChevronRight,
  LogOut,
  MessageCircle,
  Store,
  MapPin,
  Flower,
} from "lucide-react";

export default function MePage() {
  const router = useRouter();
  const { user, phone, customerId, customer } = useCustomer();
  const logout = useMutation(api.phoneAuth.logout);
  const [showSignOut, setShowSignOut] = useState(false);

  const storeLinks = useQuery(
    api.customers.listStoreLinksEnriched,
    customerId ? { customerId } : "skip"
  );
  const wishlist = useQuery(
    api.customers.getWishlist,
    customerId ? { customerId } : "skip"
  );
  const looks = useQuery(
    api.sessionOps.listByCustomer,
    customerId ? { customerId } : "skip"
  );
  const visits = useQuery(
    api.customers.listVisitHistory,
    customerId ? { customerId } : "skip"
  );

  const displayName = user?.name || (customer?.name as string) || "Customer";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const photoFileId = (customer as Record<string, unknown> | undefined)?.photoFileId as Id<"_storage"> | undefined;
  const photoUrl = useConvexUrl(photoFileId ?? null);
  const maskedPhone = phone ? `${phone.slice(0, 8)} XXXXX` : "";
  const loyaltyTier = (customer?.loyaltyTier as string) || "Regular";
  const loyaltyPoints = (customer?.loyaltyPoints as number) || 0;
  const storeCredit = (customer?.storeCredit as number) || 0;
  const totalVisits = visits?.length ?? 0;

  async function handleLogout() {
    const token = getToken();
    if (token) {
      try { await logout({ token }); } catch { /* */ }
    }
    clearToken();
    router.replace("/c/login");
  }

  if (!user) {
    return (
      <div className="cx-pageIn cx-loading">
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const menuItems = [
    { Icon: User, label: "Edit Profile", sub: "Name, photo, DOB, height, city", href: "/c/me/profile" },
    { Icon: Settings, label: "Preferences", sub: "Occasions, fabrics, colours, upcoming events", href: "/c/me/preferences" },
    { Icon: Clock, label: "Visit History", sub: `${totalVisits} visit${totalVisits !== 1 ? "s" : ""} across ${storeLinks?.length || 0} store${(storeLinks?.length || 0) !== 1 ? "s" : ""}`, href: "/c/me/history" },
    { Icon: Crown, label: "Loyalty & Credits", sub: `${loyaltyPoints} pts · ₹${storeCredit} credit · ${loyaltyTier}`, href: "/c/me/loyalty", iconClass: "cx-row-icon-gold" },
    { Icon: Scissors, label: "My Tailor Orders", sub: "Track orders, measurements & rate tailors", href: "/c/me/tailor-orders" },
    { Icon: Users, label: "Refer a Friend", sub: "Earn ₹500 Wearify credit per referral", href: "/c/me/refer", iconClass: "cx-row-icon-rose" },
    { Icon: Star, label: "Rate Your Visit", sub: "Share feedback on your last store visit", href: "/c/me/feedback", iconClass: "cx-row-icon-gold" },
    { Icon: Lock, label: "Privacy & DPDP", sub: "Manage consent, download or delete data", href: "/c/me/privacy" },
    { Icon: Globe, label: "Language", sub: "Tap to change", href: "/c/me/language" },
  ];

  const stats: Array<{ l: string; v: string | number }> = [
    { l: "Looks", v: looks?.length || 0 },
    { l: "Stores", v: storeLinks?.length || 0 },
    { l: "Wishlist", v: wishlist?.length || 0 },
    { l: "Credit", v: `₹${storeCredit}` },
  ];

  return (
    <div className="cx-pageIn cx-page">
      {/* Hero */}
      <div className="cx-hero cx-noise cx-paisley">
        <div className="cx-brand-row cx-slideDown" style={{ marginBottom: 14 }}>
          <Flower size={16} color="var(--cx-gold-l)" />
          <span className="cx-serif cx-gold-shimmer" style={{ fontSize: 17, fontWeight: 700, fontStyle: "italic" }}>
            Wearify
          </span>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(184, 134, 11, .18)",
              border: "2px solid rgba(184, 134, 11, .4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 22,
              color: "var(--cx-gold-l)",
              fontFamily: "Cormorant Garamond, serif",
              fontStyle: "italic",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="lazy"
              />
            ) : (
              initials
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="cx-serif" style={{ fontSize: 22, fontWeight: 700, color: "var(--cx-on-dark)", fontStyle: "italic", lineHeight: 1.2 }}>
              {displayName}
            </div>
            <div style={{ fontSize: 12, color: "var(--cx-on-dark-ghost)", marginTop: 3 }}>{maskedPhone}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <span className="cx-badge cx-badge-glass-gold">
                <Crown size={11} strokeWidth={2.4} />
                {loyaltyTier}
              </span>
              <span className="cx-badge cx-badge-glass-light">
                {totalVisits} visit{totalVisits !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="cx-zari" />

      {/* Stats row */}
      <div className="cx-stats">
        {stats.map((s) => (
          <div key={s.l} className="cx-stat">
            <div className="cx-stat-value">{s.v}</div>
            <div className="cx-stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* My Stores */}
      {storeLinks && storeLinks.length > 0 && (
        <section className="cx-section">
          <div className="cx-section-head">
            <span className="cx-section-title cx-section-title-serif">My Stores</span>
            <button className="cx-section-link" onClick={() => router.push("/c/me/stores")}>
              All <ChevronRight size={12} />
            </button>
          </div>
          <div className="cx-no-scroll" style={{ display: "flex", gap: 10, padding: "0 18px 14px", overflowX: "auto" }}>
            {storeLinks.map((store) => (
              <button
                key={store._id}
                onClick={() => router.push("/c/me/stores")}
                className="cx-card cx-press cx-hover-lift"
                style={{ flexShrink: 0, width: 140, cursor: "pointer", border: "none", padding: 0, fontFamily: "inherit", textAlign: "left" }}
              >
                <div style={{ height: 52, background: "var(--cx-grad-plum)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cx-on-dark)" }}>
                  <Store size={20} strokeWidth={1.6} />
                </div>
                <div style={{ padding: "8px 10px 10px" }}>
                  <div className="cx-truncate" style={{ fontWeight: 700, fontSize: 12, color: "var(--cx-text)" }}>
                    {store.storeName}
                  </div>
                  {store.storeCity && (
                    <div style={{ fontSize: 10, color: "var(--cx-text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={9} />
                      {store.storeCity}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="cx-zari" style={{ margin: "0 18px 4px" }} />
        </section>
      )}

      {/* Settings menu */}
      <div style={{ padding: "8px 0 8px" }}>
        {menuItems.map((item) => (
          <button key={item.href} onClick={() => router.push(item.href)} className="cx-row">
            <div className={`cx-row-icon ${item.iconClass ?? ""}`}>
              <item.Icon size={20} strokeWidth={1.7} />
            </div>
            <div className="cx-row-body">
              <div className="cx-row-title">{item.label}</div>
              <div className="cx-row-sub">{item.sub}</div>
            </div>
            <ChevronRight size={16} className="cx-row-chevron" />
          </button>
        ))}
      </div>

      {/* Footer actions */}
      <div style={{ padding: "16px 18px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => router.push("/c/me/stores")} className="cx-btn cx-btn-whatsapp cx-btn-block">
          <MessageCircle size={17} fill="#fff" strokeWidth={0} />
          Chat with a Wearify Store
        </button>

        <button onClick={() => setShowSignOut(true)} className="cx-btn cx-btn-danger cx-btn-block">
          <LogOut size={17} />
          Sign Out
        </button>

        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--cx-text-ghost)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <Flower size={11} />
          Wearify · Phygify Technoservices Pvt. Ltd.
        </div>
      </div>

      {/* Sign-out modal */}
      {showSignOut && (
        <div onClick={() => setShowSignOut(false)} className="cx-modal-overlay">
          <div onClick={(e) => e.stopPropagation()} className="cx-modal">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "var(--cx-error-bg)",
                color: "var(--cx-error)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <LogOut size={24} strokeWidth={2} />
            </div>
            <div className="cx-serif" style={{ fontSize: 20, fontWeight: 600, color: "var(--cx-text)", fontStyle: "italic", marginBottom: 6 }}>
              Sign Out?
            </div>
            <p style={{ fontSize: 13, color: "var(--cx-text-muted)", lineHeight: 1.6, marginBottom: 18 }}>
              You can sign back in anytime with your mobile number.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowSignOut(false)} className="cx-btn cx-btn-ghost" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                onClick={() => { setShowSignOut(false); handleLogout(); }}
                className="cx-btn"
                style={{ flex: 1, background: "var(--cx-error)", color: "#fff" }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
