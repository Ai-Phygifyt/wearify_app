"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";

const MENU_ITEMS = [
  { label: "Edit profile", href: "/tailor/profile/edit", icon: "edit" },
  { label: "Portfolio", href: "/tailor/profile/portfolio", icon: "grid" },
  { label: "Availability", href: "/tailor/profile/availability", icon: "clock" },
  { label: "Services & pricing", href: "/tailor/profile/services", icon: "tag" },
  { label: "Verification (KYC)", href: "/tailor/profile/verification", icon: "shield" },
  { label: "Commission & earnings", href: "/tailor/profile/commission", icon: "wallet" },
  { label: "Ratings & reviews", href: "/tailor/profile/ratings", icon: "star" },
  { label: "Language", href: "#", icon: "globe" },
  { label: "Privacy & consent", href: "#", icon: "lock" },
  { label: "Help & support", href: "#", icon: "help" },
];

function MenuIcon({ name }: { name: string }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "edit": return (<svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
    case "grid": return (<svg {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>);
    case "clock": return (<svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
    case "tag": return (<svg {...props}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>);
    case "shield": return (<svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
    case "wallet": return (<svg {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>);
    case "star": return (<svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
    case "globe": return (<svg {...props}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>);
    case "lock": return (<svg {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
    case "help": return (<svg {...props}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);
    default: return null;
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
    } catch { /* ignore */ }
  }, []);

  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip"
  );

  if (!tailorId || profile === undefined) return <PageLoading />;
  if (!profile) {
    return (
      <div className="t-empty">
        <h3>Profile not found</h3>
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
      try { await logout({ token }); } catch { /* ignore */ }
    }
    localStorage.removeItem("wearify_auth_token");
    localStorage.removeItem("wearify_auth_user");
    router.replace("/tailor/login");
  }

  const isVerified = !!profile.aadhaarVerified && !!profile.panVerified && !!profile.addressVerified;

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <div style={{ width: 36 }} />
        <h1>Profile</h1>
        <div style={{ width: 36 }} />
      </div>

      {/* Identity card */}
      <div style={{ margin: "0 20px" }}>
        <div className="t-card t-card-inset" style={{ display: "flex", alignItems: "center", gap: 14, padding: 18 }}>
          <div className="t-avatar" style={{ width: 64, height: 64, fontSize: 22 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-serif" style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em" }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
              {profile.city}{profile.area ? ` · ${profile.area}` : ""}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {isVerified && (
                <span className="t-pill t-pill-confirmed">Verified</span>
              )}
              {profile.badge === "pro" && (
                <span className="t-pill" style={{ background: "var(--gold-tint)", color: "var(--gold-ink)" }}>
                  Pro
                </span>
              )}
              <span className="t-chip t-mono">{profile.tailorId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* At-a-glance */}
      <div className="t-stat-row" style={{ marginTop: 14 }}>
        <div className="t-stat">
          <div className="t-stat-lbl">Rating</div>
          <div className="t-stat-val">
            {profile.rating > 0 ? profile.rating.toFixed(1) : "—"}
            {profile.rating > 0 && <small>/5</small>}
          </div>
        </div>
        <div className="t-stat">
          <div className="t-stat-lbl">Reviews</div>
          <div className="t-stat-val">{profile.reviewCount ?? 0}</div>
        </div>
        <div className="t-stat">
          <div className="t-stat-lbl">Referrals</div>
          <div className="t-stat-val">{profile.referrals ?? 0}</div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ margin: "22px 20px 0" }}>
        <div
          className="t-card"
          style={{ padding: 0, overflow: "hidden" }}
        >
          {MENU_ITEMS.map((item, idx) => {
            const disabled = item.href === "#";
            return (
              <div
                key={item.label}
                onClick={() => { if (!disabled) router.push(item.href); }}
                role={disabled ? undefined : "button"}
                tabIndex={disabled ? -1 : 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderBottom: idx < MENU_ITEMS.length - 1 ? "1px solid var(--line)" : "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.4 : 1,
                  color: "var(--ink)",
                }}
              >
                <MenuIcon name={item.icon} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                  {item.label}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div style={{ margin: "18px 20px 10px" }}>
        <button
          type="button"
          onClick={handleLogout}
          className="t-btn t-btn-full"
          style={{
            background: "var(--urgent-tint)",
            color: "var(--urgent)",
            border: "1px solid rgba(192, 62, 28, 0.18)",
            padding: "14px 18px",
          }}
        >
          Log out
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.06em", padding: "8px 0 24px" }}>
        WEARIFY TAILOR · v1.0
      </p>
    </div>
  );
}
