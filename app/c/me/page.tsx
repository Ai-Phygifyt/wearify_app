"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomer } from "../layout";
import { clearToken, getToken } from "@/lib/phoneAuth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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

  const displayName = user?.name || (customer?.name as string) || "Customer";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const maskedPhone = phone ? `${phone.slice(0, 8)} XXXXX` : "";
  const loyaltyTier = (customer?.loyaltyTier as string) || "Regular";
  const loyaltyPoints = (customer?.loyaltyPoints as number) || 0;
  const storeCredit = (customer?.storeCredit as number) || 0;
  const totalVisits = (customer?.totalVisits as number) || 0;

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
      <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const menuItems = [
    { icon: "profile", label: "Edit Profile", sub: "Name, photo, DOB, height, city", href: "/c/me/profile" },
    { icon: "settings", label: "Preferences", sub: "Occasions, fabrics, colours, upcoming events", href: "/c/me/preferences" },
    { icon: "history", label: "Visit History", sub: `${totalVisits} visits across ${storeLinks?.length || 0} stores`, href: "/c/me/history" },
    { icon: "crown", label: "Loyalty & Credits", sub: `${loyaltyPoints} pts · ₹${storeCredit} credit · ${loyaltyTier}`, href: "/c/me/loyalty" },
    { icon: "scissors", label: "My Tailor Orders", sub: "Track orders, measurements & rate tailors", href: "/c/me/tailor-orders" },
    { icon: "users", label: "Refer a Friend", sub: "Earn ₹500 Wearify credit per referral", href: "/c/me/refer" },
    { icon: "star", label: "Rate Your Visit", sub: "Share feedback on your last store visit", href: "/c/me/feedback" },
    { icon: "lock", label: "Privacy & DPDP", sub: "Manage consent, download or delete data", href: "/c/me/privacy" },
    { icon: "globe", label: "Language", sub: "Tap to change", href: "/c/me/language" },
  ];

  const iconMap: Record<string, React.ReactNode> = {
    profile: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#1A0A2E" strokeWidth="1.6" /><circle cx="12" cy="8" r="4" fill="#C9941A" opacity=".18" /><path d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#1A0A2E" strokeWidth="1.6" strokeLinecap="round" /></svg>,
    settings: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#C9941A" strokeWidth="1.6" fill="#C9941A" opacity=".22" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="#1A0A2E" strokeWidth="1.4" /></svg>,
    history: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#1A0A2E" strokeWidth="1.6" /><circle cx="12" cy="12" r="9" fill="#C9941A" opacity=".07" /><polyline points="12,7 12,12 15,15" stroke="#C9941A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    crown: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><path d="M3 17L6 7l6 5 6-5 3 10H3Z" stroke="#1A0A2E" strokeWidth="1.6" strokeLinejoin="round" fill="#C9941A" opacity=".18" /><line x1="3" y1="20" x2="21" y2="20" stroke="#C9941A" strokeWidth="2" strokeLinecap="round" /></svg>,
    scissors: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><circle cx="6" cy="6" r="3" stroke="#1A0A2E" strokeWidth="1.6" /><circle cx="6" cy="18" r="3" stroke="#1A0A2E" strokeWidth="1.6" /><circle cx="6" cy="6" r="1.5" fill="#C9941A" opacity=".3" /><circle cx="6" cy="18" r="1.5" fill="#C9941A" opacity=".3" /><line x1="20" y1="4" x2="8.12" y2="15.88" stroke="#C9941A" strokeWidth="1.8" strokeLinecap="round" /><line x1="20" y1="20" x2="8" y2="8" stroke="#1A0A2E" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    users: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="#1A0A2E" strokeWidth="1.6" /><path d="M1 21c0-3.866 3.582-7 8-7" stroke="#1A0A2E" strokeWidth="1.6" strokeLinecap="round" /><circle cx="17" cy="7" r="3" stroke="#C9941A" strokeWidth="1.5" /><path d="M23 21c0-3.314-2.686-6-6-6" stroke="#C9941A" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    star: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2Z" stroke="#1A0A2E" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
    lock: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#1A0A2E" strokeWidth="1.6" /><rect x="3" y="11" width="18" height="11" rx="2" fill="#C9941A" opacity=".12" /><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#1A0A2E" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="16" r="1.5" fill="#C9941A" /></svg>,
    globe: <svg width={20} height={20} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#1A0A2E" strokeWidth="1.6" /><path d="M12 3C9 7 9 17 12 21M12 3C15 7 15 17 12 21M3 12h18" stroke="#C9941A" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  };

  return (
    <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0" }}>
      {/* Hero */}
      <div className="cx-noise cx-paisley" style={{ background: "linear-gradient(155deg, #0D0418 0%, #1A0A2E 25%, #2D1B4E 55%, #6B1D52 80%, #C9941A 100%)", padding: "28px 18px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Wearify branding */}
          <div className="cx-slideDown" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>🪷</span>
            <span className="cx-serif cx-gold-shimmer" style={{ fontSize: 17, fontWeight: 700, fontStyle: "italic" }}>Wearify</span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(201,148,26,.2)", border: "2px solid rgba(201,148,26,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: "#E8C46A" }}>
              {initials}
            </div>
            <div>
              <div className="cx-serif" style={{ fontSize: 22, fontWeight: 700, color: "#FDF8F0", fontStyle: "italic" }}>{displayName}</div>
              <div style={{ fontSize: 12, color: "rgba(253,248,240,.45)", marginTop: 3 }}>{maskedPhone}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(201,148,26,.2)", color: "#E8C46A", fontSize: 11, fontWeight: 600 }}>⭐ {loyaltyTier}</span>
                <span style={{ padding: "3px 10px", borderRadius: 100, background: "rgba(253,248,240,.12)", color: "rgba(253,248,240,.7)", fontSize: 11, fontWeight: 600 }}>{totalVisits} Visits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="cx-zari" />

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, borderBottom: "1px solid #F2E8EE", background: "#FFFFFF" }}>
        {[
          { l: "Looks", v: looks?.length || 0 },
          { l: "Stores", v: storeLinks?.length || 0 },
          { l: "Wishlist", v: wishlist?.length || 0 },
          { l: "Credit", v: `₹${storeCredit}` },
        ].map(({ l, v }, i) => (
          <div key={l} style={{ padding: "12px 4px", textAlign: "center", borderRight: i < 3 ? "1px solid #F2E8EE" : undefined }}>
            <div className="cx-mono" style={{ fontWeight: 800, fontSize: 17, color: "#1A0A2E" }}>{v}</div>
            <div style={{ fontSize: 10, color: "#8B7EA0", marginTop: 1 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* My Stores */}
      {storeLinks && storeLinks.length > 0 && (
        <div style={{ padding: "16px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "0 14px" }}>
            <div className="cx-serif" style={{ flex: 1, fontSize: 16, fontWeight: 600, color: "#1A0A1E", fontStyle: "italic" }}>My Stores</div>
            <button onClick={() => router.push("/c/me/stores")} style={{ background: "none", border: "none", color: "#4A2D6E", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>All →</button>
          </div>
          <div className="cx-no-scroll" style={{ display: "flex", gap: 10, padding: "0 14px 14px", overflowX: "auto" }}>
            {storeLinks.map((store) => (
              <div key={store._id} onClick={() => router.push("/c/me/stores")} className="cx-press cx-silk" style={{ flexShrink: 0, width: 130, borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 14px rgba(45,27,78,.09)", border: "1px solid #F2E8EE" }}>
                <div style={{ height: 52, background: "linear-gradient(145deg, #2D1B4E, #4A2D6E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none"><path d="M3 9V21h18V9" stroke="rgba(255,255,255,.85)" strokeWidth="1.6" strokeLinejoin="round" /><path d="M1 7l2-4h18l2 4H1Z" stroke="rgba(255,255,255,.85)" strokeWidth="1.6" strokeLinejoin="round" fill="#C9941A" opacity=".18" /></svg>
                </div>
                <div style={{ padding: "7px 9px 8px", background: "#FFFFFF" }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: "#1A0A1E", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{store.storeName}</div>
                  <div style={{ fontSize: 10, color: "#8B7EA0", marginTop: 1 }}>{store.storeCity}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="cx-zari" style={{ margin: "0 14px 4px" }} />
        </div>
      )}

      {/* Settings menu */}
      <div style={{ padding: "8px 0 80px" }}>
        {menuItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            style={{ width: "100%", display: "flex", gap: 14, alignItems: "center", padding: "14px 18px", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #F2E8EE", textAlign: "left" }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F4EFF9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {iconMap[item.icon]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1A0A1E" }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "#8B7EA0", marginTop: 1 }}>{item.sub}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8A8C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        ))}

        {/* Footer */}
        <div style={{ padding: "12px 18px 8px" }}>
          {/* WhatsApp CTA */}
          <button
            onClick={() => router.push("/c/me/stores")}
            className="cx-press"
            style={{ width: "100%", padding: "12px", borderRadius: 100, background: "linear-gradient(135deg, #1A3A2A, #25D366)", border: "1px solid #25D366", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}
          >
            <svg width={17} height={17} viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 0C5.495 0 .16 5.335.157 11.892a11.8 11.8 0 0 0 1.588 5.945L0 24l6.304-1.654a11.9 11.9 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893A11.82 11.82 0 0 0 20.397 3.48 11.82 11.82 0 0 0 12.05 0Z" /></svg>
            Chat with a Wearify Store
          </button>

          {/* Sign out */}
          <button
            onClick={() => setShowSignOut(true)}
            className="cx-press"
            style={{ width: "100%", padding: "12px", borderRadius: 100, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#FFEBEE", border: "1px solid rgba(183,28,28,.12)", cursor: "pointer" }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#B71C1C" strokeWidth="1.6" strokeLinecap="round" /><rect x="3" y="3" width="6" height="18" rx="1" fill="#FFCDD2" opacity=".2" /><polyline points="16,17 21,12 16,7" stroke="#B71C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" stroke="#B71C1C" strokeWidth="1.8" strokeLinecap="round" /></svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#B71C1C" }}>Sign Out</span>
          </button>

          <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#B8A8C8" }}>
            🪷 Wearify · Phygify Technoservices Pvt. Ltd.
          </div>
        </div>

        {/* Sign-out modal */}
        {showSignOut && (
          <div onClick={() => setShowSignOut(false)} style={{ position: "fixed", inset: 0, background: "rgba(13,4,24,.65)", backdropFilter: "blur(8px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()} className="cx-scaleIn" style={{ background: "#FFFFFF", borderRadius: 24, padding: "24px 22px", maxWidth: 320, width: "100%", boxShadow: "0 24px 80px rgba(10,22,40,.30)", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FFEBEE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#B71C1C" strokeWidth="1.6" strokeLinecap="round" /><polyline points="16,17 21,12 16,7" stroke="#B71C1C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" stroke="#B71C1C" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </div>
              <div className="cx-serif" style={{ fontSize: 19, fontWeight: 600, color: "#1A0A1E", fontStyle: "italic", marginBottom: 6 }}>Sign Out?</div>
              <p style={{ fontSize: 13, color: "#8B7EA0", lineHeight: 1.65, marginBottom: 20 }}>
                You can sign back in anytime with your mobile number.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowSignOut(false)} className="cx-press" style={{ flex: 1, padding: "10px 16px", borderRadius: 100, background: "#FDF8F0", border: "1px solid #E8D5E0", fontSize: 14, fontWeight: 600, color: "#4A3558", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { setShowSignOut(false); handleLogout(); }} className="cx-press" style={{ flex: 1, padding: "10px 16px", borderRadius: 100, background: "#B71C1C", border: "none", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Yes, Sign Out</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
