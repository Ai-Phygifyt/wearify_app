"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const ROLE_MAP: Record<string, { label: string; badge: string; avatarGrad: string }> = {
  R03: {
    label: "Owner",
    badge: "w-badge w-badge-gold",
    avatarGrad: "linear-gradient(145deg, #C9941A, #E8B84A)",
  },
  R04: {
    label: "Manager",
    badge: "w-badge w-badge-teal",
    avatarGrad: "linear-gradient(145deg, var(--w-teal), #2980B9)",
  },
  R05: {
    label: "Salesperson",
    badge: "w-badge w-badge-navy",
    avatarGrad: "linear-gradient(145deg, var(--w-navy), var(--w-navy-mid))",
  },
};

function getRoleInfo(role: string) {
  return ROLE_MAP[role] ?? {
    label: role,
    badge: "w-badge",
    avatarGrad: "linear-gradient(145deg, var(--w-ink-muted), var(--w-ink-soft))",
  };
}

function staffInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="w-mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--w-navy)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--w-ink-ghost)", marginTop: 2, letterSpacing: "0.03em" }}>{label}</div>
    </div>
  );
}

export default function StaffPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<Id<"staff"> | null>(null);
  const [toast, setToast] = useState("");
  const removeStaff = useMutation(api.stores.removeStaff);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (u.storeId) setStoreId(u.storeId);
    } catch { /* */ }
  }, []);

  const staff = useQuery(api.stores.listStaffByStore, storeId ? { storeId } : "skip");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleRemove(id: Id<"staff">) {
    try {
      await removeStaff({ id });
      setConfirmRemove(null);
      showToast("Staff removed");
    } catch {
      showToast("Failed to remove staff");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 4 }}>
            Team
          </p>
          <h1 className="w-serif" style={{ fontSize: 28, fontWeight: 700, fontStyle: "italic", color: "var(--w-navy)", lineHeight: 1.1, margin: 0 }}>
            Staff
          </h1>
          {staff !== undefined && (
            <p style={{ fontSize: 13, color: "var(--w-ink-muted)", marginTop: 5 }}>
              {staff.length} team member{staff.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          className="w-btn w-btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Staff
        </button>
      </div>

      {/* ── Role breakdown ── */}
      {staff !== undefined && staff.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {(["R03", "R04", "R05"] as const).map((role) => {
            const info = getRoleInfo(role);
            const count = staff.filter((s) => s.role === role).length;
            return (
              <div key={role} className="w-card" style={{ padding: "12px 10px", textAlign: "center" }}>
                <div className="w-mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--w-navy)", lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--w-ink-muted)", marginTop: 4, letterSpacing: "0.04em" }}>
                  {info.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Staff Form ── */}
      {showForm && storeId && (
        <AddStaffForm
          storeId={storeId}
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); showToast("Staff added successfully"); }}
        />
      )}

      {/* ── Loading ── */}
      {staff === undefined && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 0" }}>
          <div className="w-loadscreen-inner">
            <div className="w-load-mark"><span className="w-logomark-letter" style={{ fontSize: 17 }}>W</span></div>
            <div><span className="w-load-text">Loading staff</span><span className="w-load-dots"><span /><span /><span /></span></div>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {staff !== undefined && staff.length === 0 && !showForm && (
        <div className="w-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="1.4" style={{ marginBottom: 14 }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="w-serif" style={{ fontSize: 17, fontStyle: "italic", color: "var(--w-ink-soft)", marginBottom: 6 }}>
            No team members yet
          </p>
          <p style={{ fontSize: 13, color: "var(--w-ink-ghost)" }}>Add your first staff member to get started</p>
        </div>
      )}

      {/* ── Staff List ── */}
      {staff !== undefined && staff.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {staff.map((s) => {
            const info = getRoleInfo(s.role);
            const isOwner = s.role === "R03";

            return (
              <div
                key={s._id}
                className="w-card"
                style={{
                  padding: "16px",
                  border: isOwner ? "1.5px solid rgba(184,134,11,0.3)" : "1px solid var(--w-cream-border)",
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 50, height: 50, borderRadius: "50%",
                    background: info.avatarGrad,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: isOwner ? "0 4px 14px rgba(184,134,11,0.28)" : "var(--w-shadow-sm)",
                    border: isOwner ? "2px solid var(--w-gold-pale)" : "2px solid rgba(255,255,255,0.6)",
                  }}>
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>
                      {staffInitials(s.name)}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--w-ink)" }}>{s.name}</span>
                      <span className={info.badge}>{info.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--w-ink-ghost)", display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.8 19.8 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2.02z" />
                      </svg>
                      {s.phone}
                      <span style={{ color: "var(--w-cream-border)" }}>·</span>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      PIN {"•".repeat(s.pin.length)}
                    </div>
                  </div>

                  {/* Remove btn */}
                  <button
                    onClick={() => setConfirmRemove(confirmRemove === s._id ? null : s._id)}
                    style={{
                      width: 32, height: 32, borderRadius: "var(--w-r-xs)",
                      border: "1px solid var(--w-cream-border)",
                      background: confirmRemove === s._id ? "var(--w-danger-bg)" : "transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.18s",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={confirmRemove === s._id ? "var(--w-danger)" : "var(--w-ink-ghost)"}
                      strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                {/* Stats */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
                  marginTop: 14, paddingTop: 14,
                  borderTop: "1px solid var(--w-cream-border)",
                  gap: 0,
                }}>
                  <StatCell value={String(s.sessionCount ?? 0)} label="Sessions" />
                  <div style={{ background: "var(--w-cream-border)" }} />
                  <StatCell value={`${s.conversion ?? 0}%`} label="Conversion" />
                  <div style={{ background: "var(--w-cream-border)" }} />
                  <StatCell value={`₹${(s.revenue ?? 0).toLocaleString("en-IN")}`} label="Revenue" />
                </div>

                {/* Confirm remove */}
                {confirmRemove === s._id && (
                  <div style={{
                    marginTop: 12, padding: "12px 14px",
                    borderRadius: "var(--w-r-sm)",
                    background: "var(--w-danger-bg)",
                    border: "1px solid rgba(139,0,0,0.15)",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--w-danger)", marginBottom: 10 }}>
                      Remove {s.name} from your team?
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="w-btn w-btn-ghost"
                        style={{ flex: 1, fontSize: 13, padding: "8px 12px" }}
                        onClick={() => setConfirmRemove(null)}
                      >
                        Cancel
                      </button>
                      <button
                        style={{
                          flex: 1, fontSize: 13, padding: "8px 12px",
                          borderRadius: "var(--w-r-sm)", border: "none",
                          background: "var(--w-danger)", color: "#fff",
                          fontWeight: 600, cursor: "pointer",
                        }}
                        onClick={() => handleRemove(s._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
          background: "var(--w-navy)", color: "#fff", fontSize: 13, fontWeight: 600,
          padding: "10px 20px", borderRadius: "var(--w-r-pill)",
          boxShadow: "var(--w-shadow-lg)", zIndex: 999,
          whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}

/* ── Add Staff Form ───────────────────────────────────────────────── */
function AddStaffForm({
  storeId,
  onClose,
  onSuccess,
}: {
  storeId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const createStaff = useMutation(api.stores.createStaff);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("R05");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) { setError("Name is required"); return; }
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    if (pin.length < 4 || pin.length > 6) { setError("PIN must be 4–6 digits"); return; }
    setLoading(true);
    setError("");
    try {
      await createStaff({ name: name.trim(), phone: "+91" + phone, pin, role, storeId });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add staff");
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.07em", textTransform: "uppercase",
    color: "var(--w-ink-muted)", marginBottom: 6,
  };

  return (
    <div className="w-card w-card-gold" style={{ padding: 20 }}>
      {/* Form header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <p style={{ ...labelStyle, marginBottom: 2 }}>New Team Member</p>
          <h3 className="w-serif" style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--w-navy)", margin: 0 }}>
            Add Staff
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{ width: 32, height: 32, borderRadius: "var(--w-r-xs)", border: "1px solid var(--w-cream-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-muted)" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: "var(--w-r-sm)",
          background: "var(--w-danger-bg)", border: "1px solid rgba(139,0,0,0.15)",
          color: "var(--w-danger)", fontSize: 13, fontWeight: 600, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>Full Name <span style={{ color: "var(--w-gold)" }}>*</span></label>
          <input className="w-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" />
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>Phone <span style={{ color: "var(--w-gold)" }}>*</span></label>
          <div style={{ display: "flex", border: "1.5px solid var(--w-cream-border)", borderRadius: "var(--w-r-sm)", overflow: "hidden", background: "#fff" }}>
            <span className="w-mono" style={{ padding: "10px 12px", fontSize: 14, color: "var(--w-ink-muted)", background: "var(--w-cream-deep)", borderRight: "1px solid var(--w-cream-border)", flexShrink: 0 }}>
              +91
            </span>
            <input
              type="tel" value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit number" maxLength={10}
              style={{ flex: 1, padding: "10px 12px", fontSize: 14, border: "none", outline: "none", color: "var(--w-ink)", fontFamily: "inherit", background: "transparent" }}
            />
          </div>
        </div>

        {/* PIN */}
        <div>
          <label style={labelStyle}>Tablet PIN (4–6 digits) <span style={{ color: "var(--w-gold)" }}>*</span></label>
          <input
            className="w-input w-mono" type="password" value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="••••" maxLength={6}
            style={{ letterSpacing: "0.3em" }}
          />
        </div>

        {/* Role */}
        <div>
          <label style={labelStyle}>Role <span style={{ color: "var(--w-gold)" }}>*</span></label>
          <select className="w-input" value={role} onChange={(e) => setRole(e.target.value)}
            style={{ appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239C8878' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
            <option value="R05">Salesperson</option>
            <option value="R04">Manager</option>
            <option value="R03">Owner</option>
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
          <button className="w-btn w-btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="w-btn w-btn-primary"
            style={{ flex: 2, opacity: loading ? 0.65 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding…" : "Add Staff Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
