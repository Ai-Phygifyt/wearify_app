"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getToken, clearToken, getStoredUser, AuthUser } from "@/lib/phoneAuth";
import { useRouter, usePathname } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Home, Sparkles, Heart, Shirt, User } from "lucide-react";
import "./customer-theme.css";

type CustomerCtx = {
  user: AuthUser | null;
  customerId: Id<"customers"> | null;
  phone: string;
  customer: Record<string, unknown> | null;
};

const CustomerContext = createContext<CustomerCtx>({
  user: null,
  customerId: null,
  phone: "",
  customer: null,
});

export function useCustomer() {
  return useContext(CustomerContext);
}

const NAV_ITEMS = [
  { key: "home", label: "Home", href: "/c", Icon: Home },
  { key: "looks", label: "Looks", href: "/c/looks", Icon: Heart },
  { key: "new", label: "New", href: "/c/new", Icon: Sparkles },
  { key: "wardrobe", label: "Wardrobe", href: "/c/wardrobe", Icon: Shirt },
  { key: "me", label: "Me", href: "/c/me", Icon: User },
];

function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="cx-bottomnav">
      {NAV_ITEMS.map(({ key, label, href, Icon }) => {
        const active = href === "/c" ? pathname === "/c" : pathname.startsWith(href);
        return (
          <button
            key={key}
            onClick={() => router.push(href)}
            className={`cx-navitem ${active ? "active" : ""}`}
            aria-label={label}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
            <span>{label}</span>
            <div className="cx-nav-indicator" />
          </button>
        );
      })}
    </nav>
  );
}

const PUBLIC_ROUTES = new Set<string>(["/c/login", "/c/register", "/c/offline"]);
const SPLASH_MS = 1200;

function Splash() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "var(--cx-grad-hero)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 14,
        animation: "cx-fadeIn 0.25s ease-out",
      }}
    >
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 26,
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid rgba(184,134,11,0.65)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          animation: "cx-scaleIn 0.5s ease-out",
        }}
      >
        <span
          className="cx-serif"
          style={{ fontSize: 52, fontWeight: 700, fontStyle: "italic", color: "var(--cx-gold-l)" }}
        >
          W
        </span>
      </div>
      <div
        className="cx-serif"
        style={{
          fontSize: 32,
          fontWeight: 700,
          fontStyle: "italic",
          color: "#FBF7F1",
          letterSpacing: "0.02em",
        }}
      >
        Wearify
      </div>
      <div
        style={{
          fontSize: 11,
          color: "rgba(253,248,240,0.55)",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        Try on the moment
      </div>
    </div>
  );
}

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500;600&display=swap";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [splashing, setSplashing] = useState(true);
  const [customerCtx, setCustomerCtx] = useState<CustomerCtx>({
    user: null,
    customerId: null,
    phone: "",
    customer: null,
  });

  useEffect(() => {
    const t = setTimeout(() => setSplashing(false), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Always sync React's token state to what's actually in localStorage.
    // The old code only called setTokenState on the "has token" branch,
    // so once a token was set, React kept it forever even after clearToken
    // wiped localStorage — leading to useQuery subscribing with an invalid
    // token and session handler redirecting on /c/login→/c navigation.
    const t = getToken();
    setTokenState(t);
    if (!t && !PUBLIC_ROUTES.has(pathname)) {
      router.replace("/c/login");
    }
    setReady(true);
  }, [router, pathname]);

  const session = useQuery(
    api.phoneAuth.validateSession,
    ready && token ? { token } : "skip"
  );

  const customerData = useQuery(
    api.customers.getByPhone,
    session && session.role === "customer" ? { phone: session.phone } : "skip"
  );

  useEffect(() => {
    if (!ready) return;
    if (PUBLIC_ROUTES.has(pathname)) return;
    // Stale-state bailout: if React's token state doesn't match localStorage,
    // the token-reader effect is about to re-sync and re-fire us. Don't
    // redirect on a session === null read from the previous (stale) token —
    // that's the "goes back to phone login on first try" bug.
    if (token !== getToken()) return;
    if (session === undefined) return;
    if (session === null) {
      clearToken();
      router.replace("/c/login");
      return;
    }
    if (session.role !== "customer") {
      clearToken();
      router.replace("/c/login");
      return;
    }
    const stored = getStoredUser();
    setCustomerCtx({
      user: stored,
      customerId: (stored?.customerId as Id<"customers">) ?? null,
      phone: session.phone,
      customer: customerData as Record<string, unknown> | null,
    });
  }, [session, ready, router, pathname, customerData, token]);

  if (splashing) return <Splash />;

  if (PUBLIC_ROUTES.has(pathname)) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href={FONT_LINK} rel="stylesheet" />
        {children}
      </>
    );
  }

  if (!ready || session === undefined) {
    return (
      <div className="cx-page-root">
        <div className="cx-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="cx-typing"><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  if (session === null) return null;

  return (
    <CustomerContext.Provider value={customerCtx}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href={FONT_LINK} rel="stylesheet" />
      <div className="cx-page-root">
        <div className="cx-shell">
          <div className="cx-screen">{children}</div>
          <BottomNav />
        </div>
      </div>
    </CustomerContext.Provider>
  );
}
