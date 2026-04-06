"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getToken, clearToken, getStoredUser, AuthUser } from "@/lib/phoneAuth";
import { useRouter, usePathname } from "next/navigation";
import { PageLoading } from "@/components/ui/wearify-ui";
import { Id } from "@/convex/_generated/dataModel";

type CustomerCtx = {
  user: AuthUser | null;
  customerId: Id<"customers"> | null;
  phone: string;
};

const CustomerContext = createContext<CustomerCtx>({
  user: null,
  customerId: null,
  phone: "",
});

export function useCustomer() {
  return useContext(CustomerContext);
}

const NAV_ITEMS = [
  { label: "Home", icon: "\u2302", href: "/c" },
  { label: "My Looks", icon: "\u2665", href: "/c/looks" },
  { label: "New", icon: "\u2726", href: "/c/new" },
  { label: "Wishlist", icon: "\u2606", href: "/c/wishlist" },
  { label: "Me", icon: "\u263A", href: "/c/me" },
];

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
  });

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace("/c/login");
      return;
    }
    setTokenState(t);
    setReady(true);
  }, [router]);

  const session = useQuery(
    api.phoneAuth.validateSession,
    ready && token ? { token } : "skip"
  );

  useEffect(() => {
    if (!ready) return;
    if (session === undefined) return; // still loading
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
    });
  }, [session, ready, router]);

  // Login page does not need auth shell
  if (pathname === "/c/login") {
    return <>{children}</>;
  }

  if (!ready || session === undefined) {
    return (
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <div className="max-w-md w-full px-5">
          <PageLoading />
        </div>
      </div>
    );
  }

  if (session === null) return null;

  return (
    <CustomerContext.Provider value={customerCtx}>
      <div className="min-h-screen bg-wf-bg pb-20 max-w-md mx-auto relative">
        {children}

        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-wf-card border-t border-wf-border z-50">
          <div className="flex justify-around items-center py-2">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/c"
                  ? pathname === "/c"
                  : pathname.startsWith(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer transition-colors ${
                    active ? "text-wf-primary" : "text-wf-muted"
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </CustomerContext.Provider>
  );
}
