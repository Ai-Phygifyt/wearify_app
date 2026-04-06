"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "./layout";
import { Card, Badge, PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

const PLACEHOLDER_OFFERS = [
  {
    headline: "Festival Collection 2026",
    subline: "Exclusive Banarasi Silk sarees",
    grad: ["#71221D", "#D4A843"],
    badge: "NEW",
  },
  {
    headline: "Flat 20% Off on Silk",
    subline: "This weekend only",
    grad: ["#2C5F7C", "#71221D"],
    badge: "OFFER",
  },
  {
    headline: "Wedding Season Special",
    subline: "Curated collection for brides",
    grad: ["#D4A843", "#B8544F"],
    badge: "BRIDAL",
  },
];

const QUICK_ACTIONS = [
  { label: "Find a Tailor", icon: "\u2702", href: "/c/me/tailor-orders" },
  { label: "My Measurements", icon: "\u2696", href: "/c/me/preferences" },
  { label: "Refer a Friend", icon: "\u2764", href: "/c/me/refer" },
];

export default function CustomerHomePage() {
  const router = useRouter();
  const { user, customerId } = useCustomer();

  const storeLinks = useQuery(
    api.customers.listStoreLinks,
    customerId ? { customerId } : "skip"
  );

  const looks = useQuery(
    api.sessionOps.listByCustomer,
    customerId ? { customerId } : "skip"
  );

  const displayName = user?.name || "Customer";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!customerId) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Greeting */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-wf-primary flex items-center justify-center text-white font-bold text-base">
          {initials}
        </div>
        <div>
          <div className="text-lg font-bold text-wf-text">
            Hello, {displayName}
          </div>
          <div className="text-xs text-wf-subtext">
            Welcome to your style journey
          </div>
        </div>
      </div>

      {/* Offers carousel */}
      <div className="mb-6">
        <div className="text-sm font-bold text-wf-text mb-3">
          Offers for You
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
          {PLACEHOLDER_OFFERS.map((offer, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-56 rounded-xl overflow-hidden relative"
              style={{
                background: `linear-gradient(135deg, ${offer.grad[0]}, ${offer.grad[1]})`,
              }}
            >
              <div className="p-4 text-white min-h-[110px] flex flex-col justify-between">
                <div>
                  <Badge status="active" className="!text-white !bg-white/20 mb-2 text-[10px]">
                    {offer.badge}
                  </Badge>
                  <div className="text-sm font-bold leading-snug">
                    {offer.headline}
                  </div>
                  <div className="text-xs text-white/80 mt-1">
                    {offer.subline}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Stores */}
      <div className="mb-6">
        <div className="text-sm font-bold text-wf-text mb-3">My Stores</div>
        {storeLinks === undefined ? (
          <div className="animate-pulse bg-wf-border/50 rounded-lg h-20" />
        ) : storeLinks.length === 0 ? (
          <Card>
            <div className="text-sm text-wf-muted text-center py-4">
              Visit a Wearify-powered store to see it here
            </div>
          </Card>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
            {storeLinks.map((link) => (
              <div
                key={link._id}
                onClick={() => router.push("/c/me/stores")}
                className="flex-shrink-0 w-44 bg-wf-card rounded-xl border border-wf-border p-4 cursor-pointer hover:border-wf-primary/30 transition-colors"
              >
                <div className="text-sm font-bold text-wf-text truncate">
                  {link.storeName || link.storeId}
                </div>
                <div className="text-xs text-wf-subtext mt-1">
                  {link.visits || 0} visits
                </div>
                {link.lastVisit && (
                  <div className="text-[10px] text-wf-muted mt-1">
                    Last: {link.lastVisit}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <div className="text-sm font-bold text-wf-text mb-3">
          Quick Actions
        </div>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              className="bg-wf-card rounded-xl border border-wf-border p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-wf-primary/30 transition-colors"
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-[10px] font-semibold text-wf-subtext text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Looks */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-wf-text">Recent Looks</span>
          {looks && looks.length > 0 && (
            <button
              onClick={() => router.push("/c/looks")}
              className="text-xs text-wf-primary font-semibold cursor-pointer"
            >
              View All
            </button>
          )}
        </div>
        {looks === undefined ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-wf-border/50 rounded-xl h-36"
              />
            ))}
          </div>
        ) : looks.length === 0 ? (
          <Card>
            <div className="text-sm text-wf-muted text-center py-4">
              No looks yet. Visit a store and try on sarees!
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {looks.slice(0, 4).map((look) => {
              const grad = look.grad || ["#71221D", "#D4A843"];
              return (
                <div
                  key={look._id}
                  onClick={() => router.push(`/c/looks/${look._id}`)}
                  className="rounded-xl overflow-hidden border border-wf-border cursor-pointer hover:border-wf-primary/30 transition-colors"
                >
                  <div
                    className="h-28 w-full"
                    style={{
                      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
                    }}
                  />
                  <div className="bg-wf-card p-2.5">
                    <div className="text-xs font-bold text-wf-text truncate">
                      {look.sareeName}
                    </div>
                    {look.price && (
                      <div className="text-[10px] text-wf-primary font-semibold mt-0.5">
                        Rs.{look.price.toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WhatsApp CTA */}
      <div
        className="rounded-xl p-4 text-center cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
        }}
        onClick={() =>
          window.open(
            "https://wa.me/?text=Check%20out%20Wearify%20-%20Virtual%20saree%20try-on!",
            "_blank"
          )
        }
      >
        <div className="text-white font-bold text-sm">
          Share Wearify with Friends
        </div>
        <div className="text-white/80 text-xs mt-1">
          Invite them to experience virtual try-on
        </div>
      </div>
    </div>
  );
}
