"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const SETTINGS_ITEMS: Array<{ icon: string; label: string; description: string; color: string; href?: string }> = [
  { icon: "🏪", label: "Store Profile", description: "Name, address, hours", color: "#1A4A65", href: "/store/settings/profile" },
  { icon: "👥", label: "Staff & Roles", description: "Manage team members", color: "#0A1628", href: "/store/staff" },
  { icon: "🔔", label: "Notifications", description: "Alert preferences", color: "#C9941A", href: "/store/settings/notifications" },
  { icon: "💳", label: "Billing", description: "Invoices & payment method", color: "#1B5E20", href: "/store/settings/billing" },
  { icon: "🔒", label: "Privacy & DPDP", description: "Data protection settings", color: "#B71C1C" },
  { icon: "🔗", label: "Connected Apps", description: "WhatsApp, POS integrations", color: "#1565C0" },
  { icon: "📸", label: "Photo Booth Guide", description: "Mirror calibration steps", color: "#E65100" },
  { icon: "📤", label: "Export Data", description: "Download reports & data", color: "#7A6E8A" },
  { icon: "🎧", label: "Support", description: "Help center & tickets", color: "#1A4A65" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const logoutMutation = useMutation(api.phoneAuth.logout);
  const updateStore = useMutation(api.stores.update);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch {
      /* ignore */
    }
  }, []);

  const store = useQuery(api.stores.getByStoreId, storeId ? { storeId } : "skip");

  if (!storeId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading...</span>
      </div>
    );
  }

  async function handleLogout() {
    const token = localStorage.getItem("wearify_auth_token");
    if (token) {
      try {
        await logoutMutation({ token });
      } catch {
        /* ignore */
      }
    }
    localStorage.removeItem("wearify_auth_token");
    localStorage.removeItem("wearify_auth_user");
    router.replace("/store/login");
  }

  async function toggleEssentialMode() {
    if (!store) return;
    await updateStore({
      id: store._id,
      essentialMode: !store.essentialMode,
    });
  }

  const planName = store?.subscriptionPlan || store?.plan || "Starter";
  const planPrice = store?.mrr ?? 999;
  const nextBilling = store?.nextBillingDate
    ? new Date(store.nextBillingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Not scheduled";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <h1
        className="rt-serif"
        style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--rt-navy)", margin: 0 }}
      >
        Settings
      </h1>

      {/* Subscription Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #0A1628, #1A4A65)",
          borderRadius: "var(--rt-radius)",
          padding: "20px 18px",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              Current Plan
            </div>
            <div
              className="rt-serif"
              style={{ fontSize: 22, fontWeight: 700, fontStyle: "italic" }}
            >
              {planName}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="rt-mono" style={{ fontSize: 20, fontWeight: 700, color: "#C9941A" }}>
              Rs{planPrice.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>/month</div>
          </div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Next billing: <span style={{ fontWeight: 600, opacity: 1 }}>{nextBilling}</span>
          </div>
        </div>
      </div>

      {/* Essential Mode Toggle */}
      <div className="rt-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-text)" }}>Essential Mode</div>
            <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>
              Lightweight mode for slow connections
            </div>
          </div>
          {store && (
            <button
              onClick={toggleEssentialMode}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background: store.essentialMode ? "var(--rt-success)" : "var(--rt-border)",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: 3,
                  left: store.essentialMode ? 23 : 3,
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          )}
        </div>
      </div>

      {/* Settings List */}
      <div className="rt-card" style={{ padding: 0, overflow: "hidden" }}>
        {SETTINGS_ITEMS.map((item, idx) => (
          <button
            key={item.label}
            onClick={() => { if (item.href) router.push(item.href); }}
            disabled={!item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: idx < SETTINGS_ITEMS.length - 1 ? "1px solid var(--rt-border)" : "none",
              cursor: item.href ? "pointer" : "not-allowed",
              textAlign: "left",
              opacity: item.href ? 1 : 0.55,
            }}
          >
            {/* Icon Circle */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: `${item.color}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>

            {/* Label */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-text)" }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "var(--rt-muted)" }}>{item.description}</div>
            </div>

            {/* Chevron */}
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rt-muted)" strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        className="rt-btn rt-btn-danger"
        style={{ width: "100%", padding: "12px 20px" }}
        onClick={handleLogout}
      >
        Logout
      </button>

      {/* Version */}
      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <span style={{ fontSize: 11, color: "var(--rt-muted)" }}>Wearify Retailer Portal v4.0</span>
      </div>
    </div>
  );
}
