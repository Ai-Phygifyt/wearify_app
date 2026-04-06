"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCustomer } from "../layout";
import { Row, PageLoading } from "@/components/ui/wearify-ui";
import { clearToken } from "@/lib/phoneAuth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/phoneAuth";

const MENU_ITEMS = [
  { label: "My Stores", href: "/c/me/stores", icon: "\u{1F3EA}" },
  { label: "Preferences", href: "/c/me/preferences", icon: "\u{1F3A8}" },
  { label: "Visit History", href: "/c/me/history", icon: "\u{1F4C5}" },
  { label: "Loyalty & Rewards", href: "/c/me/loyalty", icon: "\u{2B50}" },
  { label: "Refer a Friend", href: "/c/me/refer", icon: "\u{1F91D}" },
  { label: "Feedback", href: "/c/me/feedback", icon: "\u{1F4AC}" },
  { label: "Privacy (DPDP)", href: "/c/me/privacy", icon: "\u{1F512}" },
  { label: "Tailor Orders", href: "/c/me/tailor-orders", icon: "\u{2702}" },
  { label: "Language", href: "/c/me/language", icon: "\u{1F310}" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, phone } = useCustomer();
  const logout = useMutation(api.phoneAuth.logout);

  const displayName = user?.name || "Customer";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const maskedPhone = phone
    ? phone.slice(0, 4) + "****" + phone.slice(-2)
    : "";

  async function handleLogout() {
    const token = getToken();
    if (token) {
      try {
        await logout({ token });
      } catch {
        // ignore
      }
    }
    clearToken();
    router.replace("/c/login");
  }

  if (!user) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-wf-primary flex items-center justify-center text-white font-bold text-xl">
          {initials}
        </div>
        <div>
          <div className="text-lg font-bold text-wf-text">{displayName}</div>
          <div className="text-sm text-wf-muted">{maskedPhone}</div>
        </div>
      </div>

      {/* Menu list */}
      <div className="bg-wf-card rounded-xl border border-wf-border px-4">
        {MENU_ITEMS.map((item, idx) => (
          <Row
            key={item.href}
            onClick={() => router.push(item.href)}
            className={idx === MENU_ITEMS.length - 1 ? "!border-b-0" : ""}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <span className="text-wf-muted text-sm">{"\u203A"}</span>
          </Row>
        ))}
      </div>

      {/* Help & Logout */}
      <div className="mt-4 bg-wf-card rounded-xl border border-wf-border px-4">
        <Row
          onClick={() =>
            window.open(
              "https://wa.me/?text=I%20need%20help%20with%20Wearify",
              "_blank"
            )
          }
        >
          <span className="text-base">{"\u2753"}</span>
          <span className="flex-1 text-sm font-medium">Help & Support</span>
          <span className="text-wf-muted text-sm">{"\u203A"}</span>
        </Row>
        <Row onClick={handleLogout} className="!border-b-0">
          <span className="text-base">{"\u{1F6AA}"}</span>
          <span className="flex-1 text-sm font-medium text-wf-red">
            Logout
          </span>
        </Row>
      </div>

      <div className="text-center text-[10px] text-wf-muted mt-6">
        Wearify v1.0 &middot; Made with love in India
      </div>
    </div>
  );
}
