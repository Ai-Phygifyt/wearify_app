"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge, Card, PageLoading } from "@/components/ui/wearify-ui";

const MENU_ITEMS = [
  { label: "Edit Profile", href: "/tailor/profile/edit", icon: "edit" },
  { label: "Portfolio", href: "/tailor/profile/portfolio", icon: "grid" },
  { label: "Availability", href: "/tailor/profile/availability", icon: "clock" },
  { label: "Services & Pricing", href: "/tailor/profile/edit", icon: "tag" },
  { label: "Verification (KYC)", href: "/tailor/profile/verification", icon: "shield" },
  { label: "Commission & Earnings", href: "/tailor/profile/commission", icon: "wallet" },
  { label: "Ratings & Reviews", href: "/tailor/orders", icon: "star" },
  { label: "Language", href: "#", icon: "globe" },
  { label: "Privacy & Consent", href: "#", icon: "lock" },
  { label: "Help & Support", href: "#", icon: "help" },
];

function MenuIcon({ name }: { name: string }) {
  const cls = "text-wf-subtext";
  switch (name) {
    case "edit":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case "grid":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case "clock":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "tag":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case "shield":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "wallet":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      );
    case "star":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "globe":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "lock":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "help":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return null;
  }
}

export default function TailorProfilePage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);

  const logout = useMutation(api.phoneAuth.logout);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch {
      // ignore
    }
  }, []);

  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip"
  );

  if (!tailorId || profile === undefined) {
    return <PageLoading />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-wf-subtext">Profile not found.</p>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    const token = localStorage.getItem("wearify_auth_token");
    if (token) {
      try {
        await logout({ token });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem("wearify_auth_token");
    localStorage.removeItem("wearify_auth_user");
    router.replace("/tailor/login");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-wf-text">Profile</h1>

      {/* Tailor Card */}
      <div className="bg-wf-card rounded-lg p-5 border border-wf-border flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-wf-primary/10 flex items-center justify-center text-lg font-bold text-wf-primary flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-wf-text truncate">{profile.name}</span>
            {profile.badge && (
              <Badge status={profile.badge === "pro" ? "verified" : profile.badge === "verified" ? "verified" : "pending"}>
                {profile.badge}
              </Badge>
            )}
          </div>
          <div className="text-sm text-wf-subtext">
            {profile.city}{profile.area ? `, ${profile.area}` : ""}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-wf-muted">
              Rating: <span className="font-bold text-wf-text">{profile.rating > 0 ? profile.rating.toFixed(1) : "New"}</span>
            </span>
            <span className="text-xs text-wf-muted">
              ID: <span className="font-mono text-wf-text">{profile.tailorId}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <Card>
        <div className="space-y-0">
          {MENU_ITEMS.map((item, idx) => (
            <div
              key={item.label}
              onClick={() => {
                if (item.href !== "#") router.push(item.href);
              }}
              className={`flex items-center gap-3 py-3 cursor-pointer hover:bg-wf-primary/5 -mx-2 px-2 rounded transition-colors ${
                idx < MENU_ITEMS.length - 1 ? "border-b border-wf-border" : ""
              }`}
            >
              <MenuIcon name={item.icon} />
              <span className="text-sm font-medium text-wf-text flex-1">{item.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wf-muted">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>
      </Card>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-lg text-sm font-semibold text-wf-red bg-wf-red/5 border border-wf-red/20 cursor-pointer hover:bg-wf-red/10 transition-colors"
      >
        Log Out
      </button>

      <p className="text-[10px] text-wf-muted text-center">
        Wearify Tailor Portal v1.0
      </p>
    </div>
  );
}
