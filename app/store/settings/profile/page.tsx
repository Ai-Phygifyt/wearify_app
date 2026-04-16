"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function StoreProfilePage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const updateStore = useMutation(api.stores.update);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setStateVal] = useState("");
  const [address, setAddress] = useState("");
  const [pin, setPin] = useState("");
  const [area, setArea] = useState("");
  const [hours, setHours] = useState("");
  const [closedOn, setClosedOn] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch { /* ignore */ }
  }, []);

  const store = useQuery(api.stores.getByStoreId, storeId ? { storeId } : "skip");

  useEffect(() => {
    if (!store || dirty) return;
    setName(store.name ?? "");
    setCity(store.city ?? "");
    setStateVal(store.state ?? "");
    setAddress(store.address ?? "");
    setPin(store.pin ?? "");
    setArea(store.area ?? "");
    setHours(store.hours ?? "");
    setClosedOn(store.closedOn ?? "");
    setOwnerName(store.ownerName ?? "");
    setOwnerEmail(store.ownerEmail ?? "");
  }, [store, dirty]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function markDirty<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setDirty(true); };
  }

  async function handleSave() {
    if (!store) return;
    if (!name.trim()) { showToast("Store name is required"); return; }
    if (!city.trim()) { showToast("City is required"); return; }
    setSaving(true);
    try {
      await updateStore({
        id: store._id,
        name: name.trim(),
        city: city.trim(),
        state: state.trim() || undefined,
        address: address.trim() || undefined,
        pin: pin.trim() || undefined,
        area: area.trim() || undefined,
        hours: hours.trim() || undefined,
        closedOn: closedOn.trim() || undefined,
        ownerName: ownerName.trim() || undefined,
        ownerEmail: ownerEmail.trim() || undefined,
      });
      setDirty(false);
      showToast("Profile updated");
    } catch {
      showToast("Failed to save");
    } finally {
      setSaving(false);
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
          Store Profile
        </h1>
      </div>

      <div className="rt-card">
        <div className="rt-card-title">Store Details</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Store Name *">
            <input className="rt-input" value={name} onChange={(e) => markDirty(setName)(e.target.value)} placeholder="Store name" />
          </Field>
          <Field label="Address">
            <textarea className="rt-input" value={address} onChange={(e) => markDirty(setAddress)(e.target.value)} placeholder="Shop no, street" rows={2} style={{ resize: "vertical", fontFamily: "inherit" }} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Area / Locality">
              <input className="rt-input" value={area} onChange={(e) => markDirty(setArea)(e.target.value)} placeholder="Area" />
            </Field>
            <Field label="PIN Code">
              <input className="rt-input rt-mono" value={pin} maxLength={6}
                onChange={(e) => markDirty(setPin)(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="PIN" />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="City *">
              <input className="rt-input" value={city} onChange={(e) => markDirty(setCity)(e.target.value)} placeholder="City" />
            </Field>
            <Field label="State">
              <input className="rt-input" value={state} onChange={(e) => markDirty(setStateVal)(e.target.value)} placeholder="State" />
            </Field>
          </div>
        </div>
      </div>

      <div className="rt-card">
        <div className="rt-card-title">Hours</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Opening Hours">
            <input className="rt-input" value={hours} onChange={(e) => markDirty(setHours)(e.target.value)} placeholder="e.g. 10:00 AM – 9:00 PM" />
          </Field>
          <Field label="Closed On">
            <input className="rt-input" value={closedOn} onChange={(e) => markDirty(setClosedOn)(e.target.value)} placeholder="e.g. Sunday, or leave blank" />
          </Field>
        </div>
      </div>

      <div className="rt-card">
        <div className="rt-card-title">Owner Contact</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Owner Name">
            <input className="rt-input" value={ownerName} onChange={(e) => markDirty(setOwnerName)(e.target.value)} placeholder="Full name" />
          </Field>
          <Field label="Owner Email">
            <input className="rt-input" type="email" value={ownerEmail} onChange={(e) => markDirty(setOwnerEmail)(e.target.value)} placeholder="email@example.com" />
          </Field>
          {store?.ownerPhone && (
            <div style={{ fontSize: 12, color: "var(--rt-muted)" }}>
              Owner phone (login): <span className="rt-mono" style={{ color: "var(--rt-text)" }}>{store.ownerPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <button
        className="rt-btn rt-btn-primary"
        style={{ width: "100%", padding: "12px 20px", opacity: saving || !dirty ? 0.6 : 1 }}
        onClick={handleSave}
        disabled={saving || !dirty}
      >
        {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
      </button>

      {toast && <div className="rt-toast">{toast}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
