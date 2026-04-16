"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function NotificationsPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const updateStore = useMutation(api.stores.update);

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappNumberDirty, setWhatsappNumberDirty] = useState(false);
  const [savingNumber, setSavingNumber] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch { /* ignore */ }
  }, []);

  const store = useQuery(api.stores.getByStoreId, storeId ? { storeId } : "skip");

  useEffect(() => {
    if (!store || whatsappNumberDirty) return;
    setWhatsappNumber(store.whatsappNumber ?? "");
  }, [store, whatsappNumberDirty]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function toggle(field: "notifyWhatsApp" | "notifyEmail" | "notifySms") {
    if (!store) return;
    try {
      await updateStore({ id: store._id, [field]: !store[field] });
    } catch {
      showToast("Failed to update");
    }
  }

  async function saveWhatsappNumber() {
    if (!store) return;
    setSavingNumber(true);
    try {
      const num = whatsappNumber.trim();
      await updateStore({ id: store._id, whatsappNumber: num || undefined });
      setWhatsappNumberDirty(false);
      showToast("WhatsApp number saved");
    } catch {
      showToast("Failed to save");
    } finally {
      setSavingNumber(false);
    }
  }

  if (!storeId || store === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => router.push("/store/settings")}
          style={{ padding: 6, border: "none", background: "transparent", cursor: "pointer" }}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rt-navy)" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="rt-serif" style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--rt-navy)", margin: 0 }}>
          Notifications
        </h1>
      </div>

      <p style={{ fontSize: 13, color: "var(--rt-muted)", margin: 0 }}>
        Choose how Wearify contacts you about session alerts, low stock, pending approvals, and account updates.
      </p>

      {/* Channel toggles */}
      <div className="rt-card" style={{ padding: 0, overflow: "hidden" }}>
        <ChannelRow
          icon="💬"
          color="#1B5E20"
          label="WhatsApp"
          description="Instant alerts on your business WhatsApp"
          enabled={!!store?.notifyWhatsApp}
          onToggle={() => toggle("notifyWhatsApp")}
          divider
        />
        <ChannelRow
          icon="📧"
          color="#1565C0"
          label="Email"
          description={store?.ownerEmail || "Set owner email in Store Profile"}
          enabled={!!store?.notifyEmail}
          onToggle={() => toggle("notifyEmail")}
          disabled={!store?.ownerEmail}
          divider
        />
        <ChannelRow
          icon="📱"
          color="#C9941A"
          label="SMS"
          description={store?.ownerPhone || "SMS to registered phone"}
          enabled={!!store?.notifySms}
          onToggle={() => toggle("notifySms")}
        />
      </div>

      {/* WhatsApp number */}
      {store?.notifyWhatsApp && (
        <div className="rt-card">
          <div className="rt-card-title">WhatsApp Business Number</div>
          <div style={{ fontSize: 12, color: "var(--rt-muted)", marginBottom: 10 }}>
            {store.whatsappVerified
              ? "Verified — messages will be sent to this number."
              : "Pending verification. Ops will confirm within 24h."}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="rt-input"
              value={whatsappNumber}
              onChange={(e) => { setWhatsappNumber(e.target.value); setWhatsappNumberDirty(true); }}
              placeholder="+91 90000 00000"
              style={{ flex: 1 }}
            />
            <button
              className="rt-btn rt-btn-primary rt-btn-sm"
              onClick={saveWhatsappNumber}
              disabled={savingNumber || !whatsappNumberDirty}
              style={{ opacity: savingNumber || !whatsappNumberDirty ? 0.6 : 1 }}
            >
              {savingNumber ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {toast && <div className="rt-toast">{toast}</div>}
    </div>
  );
}

function ChannelRow({
  icon, color, label, description, enabled, onToggle, divider, disabled,
}: {
  icon: string;
  color: string;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  divider?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderBottom: divider ? "1px solid var(--rt-border)" : "none",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          width: 42, height: 42, borderRadius: 12,
          background: `${color}14`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-text)" }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--rt-muted)" }}>{description}</div>
      </div>
      <button
        onClick={() => { if (!disabled) onToggle(); }}
        disabled={disabled}
        style={{
          width: 44, height: 24, borderRadius: 12, border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          background: enabled ? "var(--rt-success)" : "var(--rt-border)",
          position: "relative", transition: "background 0.2s",
          flexShrink: 0,
        }}
        aria-label={`Toggle ${label}`}
      >
        <div
          style={{
            width: 18, height: 18, borderRadius: "50%",
            background: "white", position: "absolute", top: 3,
            left: enabled ? 23 : 3, transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}
