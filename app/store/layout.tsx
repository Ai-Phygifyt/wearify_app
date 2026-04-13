"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

/* ── Nav icons ──────────────────────────────────────────────────────── */
function NavIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "white" : "currentColor";
  const s = 19;
  switch (name) {
    case "home":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "catalogue":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case "customers":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "analytics":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "settings":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default: return null;
  }
}

/* ── TopBar ─────────────────────────────────────────────────────────── */
function TopBar({ storeName }: { storeName: string }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  });
  return (
    <header className="w-topbar">
      <div className="w-topbar-brand">
        <div className="w-logomark">
          <span className="w-logomark-letter">W</span>
        </div>
        <div>
          <div className="w-topbar-name">{storeName}</div>
          <div className="w-topbar-date">{dateStr}</div>
        </div>
      </div>
      <div className="w-topbar-actions">
        <button className="w-notif-btn" aria-label="Notifications">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-soft)" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="w-notif-dot" />
        </button>
        <div className="w-avatar">
          <span className="w-avatar-letter">S</span>
        </div>
      </div>
    </header>
  );
}

/* ── Bottom Nav (mobile) ────────────────────────────────────────────── */
function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="w-bottomnav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/store"
          ? pathname === "/store"
          : pathname.startsWith(item.href);
        return (
          <Link key={item.key} href={item.href}
            className={`w-navitem${isActive ? " active" : ""}`}>
            <div className="w-navicon-wrap">
              <NavIcon name={item.icon} active={isActive} />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ── Side Rail (tablet) ─────────────────────────────────────────────── */
function SideRail({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  return (
    <nav className="w-siderail" aria-label="Main navigation">
      {/* Header aligned with topbar */}
      <div className="w-rail-head">
        <div className="w-rail-head-inner">
          <div className="w-logomark" style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0 }}>
            <span className="w-logomark-letter" style={{ fontSize: 17 }}>W</span>
          </div>
          <span className="w-rail-head-name">{storeName}</span>
        </div>
      </div>
      {/* Nav items */}
      <div className="w-rail-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/store"
            ? pathname === "/store"
            : pathname.startsWith(item.href);
          return (
            <Link key={item.key} href={item.href}
              className={`w-rail-item${isActive ? " active" : ""}`}
              title={item.label}>
              <div className="w-rail-icon">
                <NavIcon name={item.icon} active={isActive} />
              </div>
              <span className="w-rail-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ── Loading Screen ─────────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="store-shell w-loadscreen">
      <div className="w-loadscreen-inner">
        <div className="w-load-mark">
          <span className="w-logomark-letter" style={{ fontSize: 20 }}>W</span>
        </div>
        <div>
          <span className="w-load-text">Loading store</span>
          <span className="w-load-dots">
            <span /><span /><span />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Layout ─────────────────────────────────────────────────────────── */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/store/login";

  const [token, setToken] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("My Store");
  const [ready, setReady] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (isLoginPage) { setReady(true); return; }
    const savedToken = localStorage.getItem("wearify_auth_token");
    if (!savedToken) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        window.location.href = "/store/login";
      }
      return;
    }
    setToken(savedToken);
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeName) setStoreName(userData.storeName);
    } catch { /* */ }
    setReady(true);
  }, [isLoginPage, pathname]);

  const session = useQuery(
    api.phoneAuth.validateSession,
    token ? { token } : "skip"
  );

  if (isLoginPage) return <>{children}</>;
  if (!ready || !token) return <LoadingScreen />;
  if (session === undefined) return <LoadingScreen />;

  if (session === null || session.role !== "store_owner") {
    if (!redirectedRef.current) {
      redirectedRef.current = true;
      setTimeout(() => {
        localStorage.removeItem("wearify_auth_token");
        localStorage.removeItem("wearify_auth_user");
        window.location.href = "/store/login";
      }, 100);
    }
    return <LoadingScreen />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <div className="store-shell">
        <TopBar storeName={storeName} />
        <SideRail storeName={storeName} />
        <main className="w-main">
          <div className="w-main-inner">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </>
  );
}