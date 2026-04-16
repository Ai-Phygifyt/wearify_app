"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getToken, clearToken, getStoredUser, AuthUser } from "@/lib/phoneAuth";
import { useRouter, usePathname } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
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

// ── Duotone SVG Nav Icons ──────────────────────────────────────────
function NavHome({ active }: { active: boolean }) {
  const c = active ? "#2D1B4E" : "#8B7EA0";
  const a = active ? "#C9941A" : "#B8A8C8";
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="8" rx="1" fill={a} opacity=".25" stroke={a} strokeWidth="1.4"/>
    </svg>
  );
}
function NavLooks({ active }: { active: boolean }) {
  const c = active ? "#8B4A52" : "#8B7EA0";
  const a = active ? "#C2848A" : "#B8A8C8";
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke={c} strokeWidth="1.6" fill={active ? a : "none"} opacity={active ? 1 : .9}/>
    </svg>
  );
}
function NavNew({ active }: { active: boolean }) {
  const c = active ? "#2D1B4E" : "#8B7EA0";
  const a = active ? "#C9941A" : "#B8A8C8";
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.09 6.26L20 9.27l-4.91 4.73L16.18 21 12 18.27 7.82 21l1.09-7L4 9.27l5.91-1.01L12 2Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M12 2l2.09 6.26L20 9.27l-4.91 4.73L16.18 21 12 18.27 7.82 21l1.09-7L4 9.27l5.91-1.01L12 2Z" fill={a} opacity=".18"/>
    </svg>
  );
}
function NavWishlist({ active }: { active: boolean }) {
  const c = active ? "#2D1B4E" : "#8B7EA0";
  const a = active ? "#C9941A" : "#B8A8C8";
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke={c} strokeWidth="1.6"/>
      <rect x="13" y="3" width="8" height="8" rx="2" stroke={c} strokeWidth="1.6"/>
      <rect x="3" y="13" width="8" height="8" rx="2" fill={a} opacity=".22" stroke={a} strokeWidth="1.5"/>
      <rect x="13" y="13" width="8" height="8" rx="2" stroke={c} strokeWidth="1.6"/>
    </svg>
  );
}
function NavMe({ active }: { active: boolean }) {
  const c = active ? "#2D1B4E" : "#8B7EA0";
  const a = active ? "#C9941A" : "#B8A8C8";
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4" stroke={c} strokeWidth="1.6"/>
      <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="7" r="2" fill={a} opacity=".22"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { key: "home", label: "Home", href: "/c", Icon: NavHome },
  { key: "looks", label: "My Looks", href: "/c/looks", Icon: NavLooks },
  { key: "new", label: "New", href: "/c/new", Icon: NavNew },
  { key: "wishlist", label: "Wishlist", href: "/c/wishlist", Icon: NavWishlist },
  { key: "me", label: "Me", href: "/c/me", Icon: NavMe },
];

function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="cx-bottomnav">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/c"
            ? pathname === "/c"
            : pathname.startsWith(item.href);
        return (
          <button
            key={item.key}
            onClick={() => router.push(item.href)}
            className={`cx-navitem ${active ? "active" : ""}`}
          >
            <item.Icon active={active} />
            <span>{item.label}</span>
            <div className="cx-nav-indicator" />
          </button>
        );
      })}
    </nav>
  );
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [customerCtx, setCustomerCtx] = useState<CustomerCtx>({
    user: null,
    customerId: null,
    phone: "",
    customer: null,
  });

  useEffect(() => {
    const t = getToken();
    if (!t) {
      if (pathname !== "/c/login") {
        router.replace("/c/login");
      }
      setReady(true);
      return;
    }
    setTokenState(t);
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
    if (pathname === "/c/login") return;
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
    // Gate: unfinished profile must complete onboarding before accessing /c
    if (customerData !== undefined && pathname !== "/c/onboard") {
      if (customerData && !customerData.profileComplete) {
        router.replace("/c/onboard");
        return;
      }
    }
    const stored = getStoredUser();
    setCustomerCtx({
      user: stored,
      customerId: (stored?.customerId as Id<"customers">) ?? null,
      phone: session.phone,
      customer: customerData as Record<string, unknown> | null,
    });
  }, [session, ready, router, pathname, customerData]);

  // Login and onboard pages render without the bottom nav shell
  if (pathname === "/c/login" || pathname === "/c/onboard") {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {children}
      </>
    );
  }

  if (!ready || session === undefined) {
    return (
      <div className="cx-shell" style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  if (session === null) return null;

  return (
    <CustomerContext.Provider value={customerCtx}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="cx-shell">
        <div className="cx-screen" style={{ paddingBottom: 72 }}>
          {children}
        </div>
        <BottomNav />
      </div>
    </CustomerContext.Provider>
  );
}
