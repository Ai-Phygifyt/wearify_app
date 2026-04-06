"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import "./store-theme.css";

const NAV_ITEMS = [
  { key: "home", label: "Home", href: "/store", icon: "home" },
  { key: "catalogue", label: "Catalogue", href: "/store/inventory", icon: "catalogue" },
  { key: "customers", label: "Customers", href: "/store/customers", icon: "customers" },
  { key: "analytics", label: "Analytics", href: "/store/analytics", icon: "analytics" },
  { key: "settings", label: "Settings", href: "/store/settings", icon: "settings" },
];

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "white" : "currentColor";
  const s = 18;
  switch (name) {
    case "home":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case "catalogue":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
    case "customers":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "analytics":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case "settings":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    default: return null;
  }
}

function TopBar({ storeName }: { storeName: string }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="rt-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0A1628, #1A4A65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#C9941A", fontSize: 14, fontWeight: 800, letterSpacing: 2, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>W</span>
        </div>
        <div>
          <div className="rt-serif" style={{ fontSize: 17, fontWeight: 700, color: "#0A1628", fontStyle: "italic", lineHeight: 1.2 }}>
            {storeName}
          </div>
          <div style={{ fontSize: 11, color: "#7A6E8A" }}>{dateStr}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button style={{ position: "relative", padding: 8, borderRadius: 10, border: "none", background: "transparent", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D2B4A" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#C9941A", border: "2px solid white" }} />
        </button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #0A1628, #1A4A65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#C9941A", fontSize: 13, fontWeight: 700 }}>S</span>
        </div>
      </div>
    </div>
  );
}

function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="rt-bottomnav">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/store" ? pathname === "/store" : pathname.startsWith(item.href);
        return (
          <Link key={item.key} href={item.href} className={`rt-navitem ${isActive ? "active" : ""}`} style={{ position: "relative" }}>
            <div className="rt-navicon">
              <NavIcon name={item.icon} active={isActive} />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [token, setToken] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("My Store");
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/store/login";

  useEffect(() => {
    if (isLoginPage) { setAuthState("unauthenticated"); return; }
    const savedToken = localStorage.getItem("wearify_auth_token");
    if (!savedToken) { router.replace("/store/login"); setAuthState("unauthenticated"); return; }
    setToken(savedToken);
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeName) setStoreName(userData.storeName);
    } catch { /* */ }
  }, [isLoginPage, router]);

  const session = useQuery(api.phoneAuth.validateSession, token ? { token } : "skip");

  const redirectToLogin = useCallback(() => {
    localStorage.removeItem("wearify_auth_token");
    localStorage.removeItem("wearify_auth_user");
    setAuthState("unauthenticated");
    router.replace("/store/login");
  }, [router]);

  useEffect(() => {
    if (isLoginPage || !token) return;
    if (session === undefined) return;
    if (session === null || session.role !== "store_owner") { redirectToLogin(); return; }
    setAuthState("authenticated");
  }, [session, token, isLoginPage, redirectToLogin]);

  if (isLoginPage) return <>{children}</>;

  if (authState === "loading") {
    return (
      <div className="store-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0A1628, #1A4A65)", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 2s infinite" }}>
            <span style={{ color: "#C9941A", fontSize: 14, fontWeight: 800, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>W</span>
          </div>
          <span style={{ fontSize: 14, color: "#7A6E8A" }}>Loading store...</span>
        </div>
      </div>
    );
  }

  if (authState === "unauthenticated") return null;

  return (
    <>
      {/* Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div className="store-shell" style={{ minHeight: "100vh" }}>
        <TopBar storeName={storeName} />
        <main style={{ paddingTop: 56, paddingBottom: 80, minHeight: "100vh" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 16px" }}>
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </>
  );
}
