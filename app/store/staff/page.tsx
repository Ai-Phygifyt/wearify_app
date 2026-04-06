"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const ROLE_MAP: Record<string, { label: string; bg: string; color: string }> = {
  R03: { label: "Owner", bg: "rgba(201, 148, 26, 0.15)", color: "#C9941A" },
  R04: { label: "Manager", bg: "rgba(26, 74, 101, 0.1)", color: "#1A4A65" },
  R05: { label: "Salesperson", bg: "rgba(10, 22, 40, 0.08)", color: "#0A1628" },
};

function getRoleInfo(role: string) {
  return ROLE_MAP[role] || { label: role, bg: "rgba(122, 110, 138, 0.1)", color: "#7A6E8A" };
}

function getAvatarGradient(role: string): string {
  switch (role) {
    case "R03": return "linear-gradient(135deg, #C9941A, #E8B84A)";
    case "R04": return "linear-gradient(135deg, #1A4A65, #2A6A85)";
    default: return "linear-gradient(135deg, #0A1628, #1A4A65)";
  }
}

export default function StaffPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<Id<"staff"> | null>(null);
  const [toast, setToast] = useState("");
  const removeStaff = useMutation(api.stores.removeStaff);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch {
      /* ignore */
    }
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

  if (!storeId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1
            className="rt-serif"
            style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--rt-navy)", margin: 0 }}
          >
            Staff
          </h1>
          <p style={{ fontSize: 13, color: "var(--rt-muted)", margin: "4px 0 0" }}>
            {staff?.length ?? 0} team members
          </p>
        </div>
        <button className="rt-btn rt-btn-gold rt-btn-sm" onClick={() => setShowForm(!showForm)}>
          + Add Staff
        </button>
      </div>

      {/* Add Staff Form (collapsible) */}
      {showForm && storeId && (
        <AddStaffForm
          storeId={storeId}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            showToast("Staff added successfully");
          }}
        />
      )}

      {/* Staff List */}
      {staff === undefined ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading staff...</span>
        </div>
      ) : staff.length === 0 ? (
        <div className="rt-card" style={{ textAlign: "center", padding: "32px 16px" }}>
          <p style={{ fontSize: 14, color: "var(--rt-muted)" }}>No staff members yet. Add your first team member.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {staff.map((s) => {
            const roleInfo = getRoleInfo(s.role);
            const initials = s.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div key={s._id} className="rt-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: getAvatarGradient(s.role),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{initials}</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--rt-text)" }}>{s.name}</span>
                      <span
                        className="rt-badge"
                        style={{ background: roleInfo.bg, color: roleInfo.color }}
                      >
                        {roleInfo.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>
                      PIN: {"*".repeat(s.pin.length)} &middot; {s.phone}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => setConfirmRemove(s._id)}
                    style={{
                      padding: 6,
                      borderRadius: 8,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rt-alert)" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                {/* Stats Row */}
                <div className="rt-divider" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div style={{ textAlign: "center" }}>
                    <div className="rt-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--rt-text)" }}>
                      {s.sessionCount ?? 0}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--rt-muted)" }}>Sessions</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div className="rt-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--rt-text)" }}>
                      {s.conversion ?? 0}%
                    </div>
                    <div style={{ fontSize: 11, color: "var(--rt-muted)" }}>Conversion</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div className="rt-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--rt-text)" }}>
                      Rs{(s.revenue ?? 0).toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--rt-muted)" }}>Revenue</div>
                  </div>
                </div>

                {/* Confirm Remove Dialog */}
                {confirmRemove === s._id && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "rgba(183, 28, 28, 0.05)", border: "1px solid rgba(183, 28, 28, 0.15)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--rt-alert)", marginBottom: 8 }}>
                      Remove {s.name}?
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="rt-btn rt-btn-ghost rt-btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => setConfirmRemove(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="rt-btn rt-btn-danger rt-btn-sm"
                        style={{ flex: 1 }}
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

      {/* Toast */}
      {toast && <div className="rt-toast">{toast}</div>}
    </div>
  );
}

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
    if (phone.length < 10) { setError("Enter a valid phone number"); return; }
    if (pin.length < 4 || pin.length > 6) { setError("PIN must be 4-6 digits"); return; }

    setLoading(true);
    setError("");
    try {
      await createStaff({
        name: name.trim(),
        phone: "+91" + phone,
        pin,
        role,
        storeId,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add staff");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rt-card" style={{ border: "1.5px solid var(--rt-gold)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div className="rt-card-title" style={{ margin: 0 }}>Add New Staff</div>
        <button
          onClick={onClose}
          style={{ padding: 4, border: "none", background: "transparent", cursor: "pointer" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--rt-muted)" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {error && (
        <div style={{
          padding: "8px 12px",
          borderRadius: 10,
          background: "rgba(183, 28, 28, 0.08)",
          color: "var(--rt-alert)",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 12,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
            Name *
          </label>
          <input
            className="rt-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff name"
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
            Phone *
          </label>
          <div style={{ display: "flex", border: "1.5px solid var(--rt-border)", borderRadius: "var(--rt-radius-sm)", overflow: "hidden" }}>
            <span
              className="rt-mono"
              style={{
                padding: "10px 12px",
                fontSize: 14,
                color: "var(--rt-muted)",
                background: "var(--rt-cream)",
                borderRight: "1px solid var(--rt-border)",
              }}
            >
              +91
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Phone number"
              maxLength={10}
              style={{
                flex: 1,
                padding: "10px 12px",
                fontSize: 14,
                border: "none",
                outline: "none",
                color: "var(--rt-text)",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
            PIN (4-6 digits) *
          </label>
          <input
            className="rt-input rt-mono"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Tablet login PIN"
            maxLength={6}
            style={{ letterSpacing: "0.25em" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
            Role *
          </label>
          <select
            className="rt-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="R03">Owner</option>
            <option value="R04">Manager</option>
            <option value="R05">Salesperson</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button className="rt-btn rt-btn-ghost" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="rt-btn rt-btn-primary"
            style={{ flex: 1, opacity: loading ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}
