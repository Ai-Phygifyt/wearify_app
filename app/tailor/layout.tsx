"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-wf-border z-40 flex justify-around items-center h-16 px-2">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/tailor"
            ? pathname === "/tailor"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors no-underline min-w-[56px] relative",
              isActive ? "text-wf-primary" : "text-wf-muted"
            )}
          >
            <div className="relative">
              <NavIcon name={item.icon} size={20} />
              {item.key === "home" && newReferralCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-wf-red text-white text-[8px] font-bold flex items-center justify-center">
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
  }, [isLoginPage, router]);

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
    return <>{children}</>;
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
      <main className="pb-20 min-h-screen bg-wf-bg">
        <div className="px-4 py-4 max-w-md mx-auto">{children}</div>
      </main>
      <BottomNav newReferralCount={newReferrals?.length ?? 0} />
    </>
  );
}
