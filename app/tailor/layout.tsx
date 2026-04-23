"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import "./tailor-theme.css";

const NAV_ITEMS = [
  { key: "home", label: "Home", href: "/tailor", icon: "home" },
  { key: "orders", label: "Orders", href: "/tailor/orders", icon: "orders" },
  { key: "profile", label: "Profile", href: "/tailor/profile", icon: "profile" },
];

function NavIcon({ name, size = 20 }: { name: string; size?: number }) {
  const s = size;
  switch (name) {
    case "home":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "orders":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "profile":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
}

function BottomNav({ newReferralCount }: { newReferralCount: number }) {
  const pathname = usePathname();
  const items = [
    ...NAV_ITEMS.slice(0, 1),
    { key: "referrals", label: "Leads", href: "/tailor/referrals", icon: "orders" as const },
    ...NAV_ITEMS.slice(1),
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "var(--paper, #FFFEFB)",
        borderTop: "1px solid var(--line, rgba(26,21,18,0.08))",
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: 4,
        padding: "10px 8px 28px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {items.map((item) => {
        const isActive =
          item.href === "/tailor"
            ? pathname === "/tailor"
            : pathname.startsWith(item.href);
        const showBadge =
          (item.key === "home" || item.key === "referrals") && newReferralCount > 0;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn("no-underline")}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "6px 4px",
              color: isActive ? "var(--maroon, #7B1D1D)" : "var(--ink-4, #A79986)",
              fontSize: 10,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontWeight: 500,
              position: "relative",
            }}
          >
            <div style={{ position: "relative" }}>
              <NavIcon name={item.icon} size={20} />
              {showBadge && (
                <span
                  style={{
                    position: "absolute",
                    top: -6, right: -10,
                    minWidth: 16, height: 16, padding: "0 4px",
                    borderRadius: 999,
                    background: "var(--maroon, #7B1D1D)",
                    color: "#fff",
                    fontSize: 9,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {newReferralCount > 9 ? "9+" : newReferralCount}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function TailorLayout({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [token, setToken] = useState<string | null>(null);
  const [tailorId, setTailorId] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/tailor/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthState("unauthenticated");
      return;
    }
    const savedToken = localStorage.getItem("wearify_auth_token");
    if (!savedToken) {
      setToken(null);
      router.replace("/tailor/login");
      setAuthState("unauthenticated");
      return;
    }
    setToken(savedToken);
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch {
      // ignore
    }
  }, [isLoginPage, pathname, router]);

  const session = useQuery(
    api.phoneAuth.validateSession,
    token ? { token } : "skip"
  );

  const newReferrals = useQuery(
    api.tailorOps.listNewReferrals,
    tailorId ? { tailorId } : "skip"
  );

  const redirectToLogin = useCallback(() => {
    localStorage.removeItem("wearify_auth_token");
    localStorage.removeItem("wearify_auth_user");
    setAuthState("unauthenticated");
    router.replace("/tailor/login");
  }, [router]);

  useEffect(() => {
    if (isLoginPage || !token) return;
    // Stale-state bailout: if React's token state doesn't match localStorage,
    // the token-reader effect is about to re-sync and re-fire us. Don't
    // redirect on a session === null read from the previous (stale) token —
    // that's the "takes 2 login attempts" bug.
    if (token !== localStorage.getItem("wearify_auth_token")) return;
    if (session === undefined) return;
    if (session === null) {
      redirectToLogin();
      return;
    }
    if (session.role !== "tailor") {
      redirectToLogin();
      return;
    }
    if (session.tailorId) setTailorId(session.tailorId);
    setAuthState("authenticated");
  }, [session, token, isLoginPage, redirectToLogin]);

  if (isLoginPage) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <div className="t-app">{children}</div>
      </>
    );
  }

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-wf-primary flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <div className="text-sm text-wf-subtext">Loading...</div>
        </div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return null;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div className="t-app" style={{ minHeight: "100vh" }}>
        <main style={{ paddingBottom: 88, maxWidth: 480, margin: "0 auto" }}>
          {children}
        </main>
        <BottomNav newReferralCount={newReferrals?.length ?? 0} />
      </div>
    </>
  );
}
