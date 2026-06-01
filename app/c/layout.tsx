"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getToken, clearToken, getStoredUser, AuthUser } from "@/lib/phoneAuth";
import { useRouter, usePathname } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Home, Sparkles, Heart, Shirt, User } from "lucide-react";
import InstallPrompt from "@/components/c/InstallPrompt";
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

const PUBLIC_ROUTES = new Set<string>(["/c/welcome", "/c/login", "/c/register", "/c/offline"]);
// Two-stage launch sequence: saree-backdrop splash → branded logo screen → app.
const SPLASH_ONE_MS = 1300;
const SPLASH_TWO_MS = 1600;

function Splash() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#FBF7F1",
        overflow: "hidden",
        animation: "cx-fadeIn 0.25s ease-out",
      }}
    >
      {/* Full-bleed saree-illustration backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/customer/first-screen/background.svg"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      {/* Centered frosted Wearify badge */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(53vw, 208px)",
            animation: "cx-scaleIn 0.55s ease-out both",
          }}
        >
          {/* Real frosted-glass disc — the SVG's own backdrop-filter can't blur
              the page when loaded via <img>, so we render the blur here. The
              disc matches the logo's internal circle (≈96% of the SVG width,
              vertically centered within the 185×180 viewBox). */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "96%",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "2px solid rgba(255,255,255,0.85)",
              boxShadow: "0 18px 50px rgba(94,26,24,0.12)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/customer/first-screen/logo.svg"
            alt="Wearify — Try-on the moment"
            style={{
              position: "relative",
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      </div>

      {/* Copyright */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
          textAlign: "center",
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(94, 26, 24, 0.62)",
          letterSpacing: "0.01em",
          animation: "cx-fadeIn 0.6s ease-out 0.3s both",
        }}
      >
        ©copyright wearify techno services pvt.ltd.
      </div>
    </div>
  );
}

function SplashTwo() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        overflow: "hidden",
        background: "#FFFFFF",
        animation: "cx-fadeIn 0.35s ease-out",
      }}
    >
      {/* Soft coral-pink corner glows — strongest across the top, faint at the
          bottom corners — over a clean white field. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(150% 95% at 100% 0%, rgba(240,158,146,0.78) 0%, rgba(244,180,170,0.45) 30%, rgba(248,212,205,0.18) 52%, rgba(255,255,255,0) 72%)," +
            "radial-gradient(150% 95% at 0% 100%, rgba(241,162,150,0.74) 0%, rgba(244,184,174,0.42) 30%, rgba(248,212,205,0.16) 52%, rgba(255,255,255,0) 72%)",
        }}
      />

      {/* Centered Wearify wordmark */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/customer/second-screen/logo.svg"
          alt="Wearify — Try-on the moment"
          style={{
            width: "min(54vw, 216px)",
            height: "auto",
            display: "block",
            animation: "cx-scaleIn 0.6s ease-out both",
          }}
        />
      </div>

      {/* Copyright */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
          textAlign: "center",
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(94, 26, 24, 0.62)",
          letterSpacing: "0.01em",
          animation: "cx-fadeIn 0.6s ease-out 0.25s both",
        }}
      >
        ©copyright wearify techno services pvt.ltd.
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
  // 0 = saree splash, 1 = branded logo screen, 2 = done.
  const [splashStage, setSplashStage] = useState<0 | 1 | 2>(0);
  const [customerCtx, setCustomerCtx] = useState<CustomerCtx>({
    user: null,
    customerId: null,
    phone: "",
    customer: null,
  });

  useEffect(() => {
    const t1 = setTimeout(() => setSplashStage(1), SPLASH_ONE_MS);
    const t2 = setTimeout(() => setSplashStage(2), SPLASH_ONE_MS + SPLASH_TWO_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
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
      router.replace("/c/welcome");
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

  if (splashStage === 0) return <Splash />;
  if (splashStage === 1) return <SplashTwo />;

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
          <InstallPrompt />
          <BottomNav />
        </div>
      </div>
    </CustomerContext.Provider>
  );
}
