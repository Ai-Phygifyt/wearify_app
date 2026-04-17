"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ── Toggle ────────────────────────────────────────────────────────── */
function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={on}
      style={{
        width: 46, height: 26, borderRadius: 13, border: "none",
        cursor: disabled ? "default" : "pointer",
        background: on ? "var(--w-success)" : "var(--w-cream-border)",
        position: "relative", transition: "background 0.22s var(--w-ease)",
        flexShrink: 0, opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: "white",
        position: "absolute", top: 3, left: on ? 23 : 3,
        transition: "left 0.22s var(--w-spring)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

/* ── Section heading ───────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 10 }}>
      {children}
    </div>
  );
}

/* ── Settings row ──────────────────────────────────────────────────── */
function SettingsRow({
  icon, label, description, right, border = true, onClick,
}: {
  icon: React.ReactNode; label: string; description?: string;
  right?: React.ReactNode; border?: boolean; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "13px 18px",
        borderBottom: border ? "1px solid var(--w-cream-border)" : "none",
        cursor: onClick ? "pointer" : "default",
        transition: onClick ? "background 0.15s" : "none",
      }}
      onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.background = "var(--w-cream)"; }}
      onMouseLeave={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: "var(--w-r-sm)", flexShrink: 0,
        background: "var(--w-gold-mist)",
        border: "1px solid rgba(184,134,11,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--w-ink)" }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: "var(--w-ink-muted)", marginTop: 1 }}>{description}</div>}
      </div>
      {right ?? (onClick && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      ))}
    </div>
  );
}

/* ── SVG icons ─────────────────────────────────────────────────────── */
const I = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "var(--w-gold)", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const icons = {
  store:    <svg {...I}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  staff:    <svg {...I}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  bell:     <svg {...I}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  billing:  <svg {...I}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  shield:   <svg {...I}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  link:     <svg {...I}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  camera:   <svg {...I}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  download: <svg {...I}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  support:  <svg {...I}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  speed:    <svg {...I}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  whatsapp: <svg {...I}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
  email:    <svg {...I}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  sms:      <svg {...I}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  logout:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--w-danger)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
};

/* ── Inline label field ────────────────────────────────────────────── */
function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 6 }}>
        {label}
      </label>
      <input
        className="w-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  const [form, setForm] = useState({
    name: "", address: "", city: "", state: "", pin: "",
    hours: "", closedOn: "", ownerName: "", ownerEmail: "", whatsappNumber: "",
  });

  const logoutMutation = useMutation(api.phoneAuth.logout);
  const updateStore    = useMutation(api.stores.update);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (u.storeId) setStoreId(u.storeId);
    } catch { /* */ }
  }, []);

  const store = useQuery(api.stores.getByStoreId, storeId ? { storeId } : "skip");

  useEffect(() => {
    if (store) {
      setForm({
        name:           store.name ?? "",
        address:        store.address ?? "",
        city:           store.city ?? "",
        state:          store.state ?? "",
        pin:            store.pin ?? "",
        hours:          store.hours ?? "",
        closedOn:       store.closedOn ?? "",
        ownerName:      store.ownerName ?? "",
        ownerEmail:     store.ownerEmail ?? "",
        whatsappNumber: store.whatsappNumber ?? "",
      });
    }
  }, [store]);

  async function handleLogout() {
    const token = localStorage.getItem("wearify_auth_token");
    if (token) { try { await logoutMutation({ token }); } catch { /* */ } }
    localStorage.removeItem("wearify_auth_token");
    localStorage.removeItem("wearify_auth_user");
    window.location.href = "/store/login";
  }

  async function handleSaveProfile() {
    if (!store) return;
    setSaving(true);
    try {
      await updateStore({ id: store._id, ...form });
      setEditingProfile(false);
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 2500);
    } catch { /* */ } finally { setSaving(false); }
  }

  async function toggleNotif(field: "notifyWhatsApp" | "notifyEmail" | "notifySms") {
    if (!store) return;
    await updateStore({ id: store._id, [field]: !store[field] });
  }

  async function toggleEssentialMode() {
    if (!store) return;
    await updateStore({ id: store._id, essentialMode: !store.essentialMode });
  }

  const planName    = store?.subscriptionPlan || store?.plan || "Starter";
  const planPrice   = store?.mrr ?? 999;
  const nextBilling = store?.nextBillingDate || "2026-05-01";
  const avatarLetter = (store?.name ?? "S").charAt(0).toUpperCase();

  if (!storeId) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="w-loadscreen-inner">
        <div className="w-load-mark"><span className="w-logomark-letter" style={{ fontSize: 17 }}>W</span></div>
        <div><span className="w-load-text">Loading settings</span><span className="w-load-dots"><span /><span /><span /></span></div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* ── Header ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 4 }}>
          Account
        </p>
        <h1 className="w-serif" style={{ fontSize: 28, fontWeight: 700, fontStyle: "italic", color: "var(--w-navy)", lineHeight: 1.1, margin: 0 }}>
          Settings
        </h1>
      </div>

      {/* ── Saved banner ── */}
      {savedBanner && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "11px 16px", borderRadius: "var(--w-r-sm)",
          background: "var(--w-success-bg)", border: "1px solid rgba(30,92,47,0.18)",
          color: "var(--w-success)", fontSize: 13, fontWeight: 600,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          Store profile saved successfully
        </div>
      )}

      {/* ── Store identity card ── */}
      <div className="w-card w-card-gold" style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18, flexShrink: 0,
            background: "linear-gradient(145deg, var(--w-navy), var(--w-teal))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 20px rgba(13,31,53,0.28)",
          }}>
            <span className="w-serif" style={{ color: "var(--w-gold-bright)", fontSize: 26, fontWeight: 700, fontStyle: "italic" }}>
              {avatarLetter}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="w-serif" style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--w-navy)", marginBottom: 2 }}>
              {store?.name || "My Store"}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--w-ink-muted)" }}>
              {[store?.city, store?.state].filter(Boolean).join(", ") || "Location not set"}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
              <span className="w-badge w-badge-navy">{planName}</span>
              <span className={`w-badge ${store?.status === "active" ? "w-badge-success" : "w-badge-warn"}`}>
                {store?.status || "active"}
              </span>
            </div>
          </div>
        </div>

        <div className="w-rule-gold" style={{ marginBottom: 14 }} />

        {/* Store info rows */}
        {!editingProfile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: <svg {...I}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, value: store?.address || "Address not set" },
              { icon: <svg {...I}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, value: store?.hours || "Hours not set" },
              { icon: <svg {...I}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 5.55 5.55l.46-.46a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>, value: store?.whatsappNumber || store?.ownerEmail || "Contact not set" },
            ].map(({ icon, value }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flexShrink: 0, opacity: 0.7 }}>{icon}</div>
                <span style={{ fontSize: 13, color: "var(--w-ink-soft)" }}>{value}</span>
              </div>
            ))}
            <button
              className="w-btn w-btn-ghost w-btn-sm"
              style={{ marginTop: 6, alignSelf: "flex-start" }}
              onClick={() => setEditingProfile(true)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 5 }}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit profile
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Store name"   value={form.name}    onChange={(v) => setForm({ ...form, name: v })}    placeholder="e.g. Silk House" />
              <Field label="Owner name"   value={form.ownerName}  onChange={(v) => setForm({ ...form, ownerName: v })}  placeholder="Full name" />
            </div>
            <Field label="Address"        value={form.address}    onChange={(v) => setForm({ ...form, address: v })}    placeholder="Street address" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="City"   value={form.city}  onChange={(v) => setForm({ ...form, city: v })}  placeholder="City" />
              <Field label="State"  value={form.state} onChange={(v) => setForm({ ...form, state: v })} placeholder="State" />
              <Field label="PIN"    value={form.pin}   onChange={(v) => setForm({ ...form, pin: v })}   placeholder="PIN code" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Store hours"   value={form.hours}    onChange={(v) => setForm({ ...form, hours: v })}    placeholder="e.g. 10am–8pm" />
              <Field label="Closed on"     value={form.closedOn} onChange={(v) => setForm({ ...form, closedOn: v })} placeholder="e.g. Sunday" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Email"     value={form.ownerEmail}    onChange={(v) => setForm({ ...form, ownerEmail: v })}    type="email"   placeholder="owner@email.com" />
              <Field label="WhatsApp"  value={form.whatsappNumber} onChange={(v) => setForm({ ...form, whatsappNumber: v })} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              <button className="w-btn w-btn-ghost" style={{ flex: 1 }} onClick={() => setEditingProfile(false)}>
                Cancel
              </button>
              <button className="w-btn w-btn-primary" style={{ flex: 2 }} onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <><span className="w-spinner" style={{ marginRight: 6 }} />Saving…</>
                ) : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Subscription card ── */}
      <div style={{
        borderRadius: "var(--w-r-md)",
        background: "linear-gradient(145deg, var(--w-navy) 0%, var(--w-teal) 100%)",
        padding: "22px 22px",
        boxShadow: "var(--w-shadow-lg)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative ring */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
              Current Plan
            </div>
            <div className="w-serif" style={{ fontSize: 26, fontWeight: 700, fontStyle: "italic", color: "#fff" }}>
              {planName}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="w-mono" style={{ fontSize: 24, fontWeight: 700, color: "var(--w-gold-bright)", lineHeight: 1 }}>
              ₹{planPrice.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>/month</div>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                Next billing: <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{nextBilling}</strong>
              </span>
            </div>
            <button style={{
              padding: "6px 14px", borderRadius: "var(--w-r-pill)",
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "background 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div>
        <SectionLabel>Notifications</SectionLabel>
        <div className="w-card" style={{ overflow: "hidden", padding: 0 }}>
          <SettingsRow
            icon={icons.whatsapp} label="WhatsApp alerts"
            description="Order updates and customer messages"
            right={<Toggle on={store?.notifyWhatsApp ?? true} onToggle={() => toggleNotif("notifyWhatsApp")} disabled={!store} />}
          />
          <SettingsRow
            icon={icons.email} label="Email digests"
            description="Daily and weekly summary reports"
            right={<Toggle on={store?.notifyEmail ?? false} onToggle={() => toggleNotif("notifyEmail")} disabled={!store} />}
          />
          <SettingsRow
            icon={icons.sms} label="SMS alerts"
            description="Critical stock and session alerts"
            right={<Toggle on={store?.notifySms ?? false} onToggle={() => toggleNotif("notifySms")} disabled={!store} />}
            border={false}
          />
        </div>
      </div>

      {/* ── System ── */}
      <div>
        <SectionLabel>System</SectionLabel>
        <div className="w-card" style={{ overflow: "hidden", padding: 0 }}>
          <SettingsRow
            icon={icons.speed} label="Essential Mode"
            description="Lightweight interface for slow connections"
            right={<Toggle on={store?.essentialMode ?? false} onToggle={toggleEssentialMode} disabled={!store} />}
            border={false}
          />
        </div>
      </div>

      {/* ── Store management ── */}
      <div>
        <SectionLabel>Manage</SectionLabel>
        <div className="w-card" style={{ overflow: "hidden", padding: 0 }}>
          <SettingsRow icon={icons.staff}    label="Staff & Roles"     description="Manage team members and permissions" onClick={() => {}} />
          <SettingsRow icon={icons.link}     label="Connected Apps"    description="WhatsApp, POS and integrations"      onClick={() => {}} />
          <SettingsRow icon={icons.camera}   label="Photo Booth Guide" description="Mirror calibration and setup"        onClick={() => {}} />
          <SettingsRow icon={icons.download} label="Export Data"       description="Download reports and CSV backups"    onClick={() => {}} />
          <SettingsRow icon={icons.shield}   label="Privacy & DPDP"    description="Data protection settings"           onClick={() => {}} border={false} />
        </div>
      </div>

      {/* ── Support ── */}
      <div>
        <SectionLabel>Help</SectionLabel>
        <div className="w-card" style={{ overflow: "hidden", padding: 0 }}>
          <SettingsRow icon={icons.support} label="Support" description="Help centre, FAQs and raise a ticket" onClick={() => {}} border={false} />
        </div>
      </div>

      {/* ── Sign out ── */}
      <div>
        <SectionLabel>Account</SectionLabel>
        <div className="w-card" style={{ overflow: "hidden", padding: 0 }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "13px 18px", width: "100%",
              background: "transparent", border: "none", cursor: "pointer",
              textAlign: "left", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--w-danger-bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 38, height: 38, borderRadius: "var(--w-r-sm)", flexShrink: 0,
              background: "var(--w-danger-bg)", border: "1px solid rgba(139,0,0,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {icons.logout}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--w-danger)" }}>Sign out</div>
              <div style={{ fontSize: 12, color: "var(--w-ink-muted)" }}>Log out of this device</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── Version footer ── */}
      <div style={{ textAlign: "center", padding: "4px 0 16px" }}>
        <p className="w-mono" style={{ fontSize: 11, color: "var(--w-ink-ghost)", letterSpacing: "0.04em" }}>
          Wearify Retailer · v4.0
        </p>
        <p style={{ fontSize: 10.5, color: "var(--w-cream-border)", marginTop: 4, letterSpacing: "0.04em" }}>
          Phygify Technoservices Pvt. Ltd.
        </p>
      </div>

    </div>
  );
}
