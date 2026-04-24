"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";

type ServiceRow = {
  id: string;
  name: string;
  priceMin: number;
  priceMax: number;
  days: number;
  active: boolean;
};

function newRow(): ServiceRow {
  return {
    id: `svc-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    priceMin: 0,
    priceMax: 0,
    days: 7,
    active: true,
  };
}

export default function ServicesPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch { /* ignore */ }
  }, []);

  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip",
  );
  const updateServices = useMutation(api.tailorOps.updateServices);

  useEffect(() => {
    if (profile && rows.length === 0) {
      setRows(profile.services ?? []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (!tailorId || profile === undefined) return <PageLoading />;
  if (!profile) {
    return (
      <div className="t-empty">
        <h3>Profile not found</h3>
      </div>
    );
  }

  function updateRow(idx: number, patch: Partial<ServiceRow>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }
  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  async function handleSave() {
    setError("");
    for (const r of rows) {
      if (!r.name.trim()) { setError("Every service needs a name"); return; }
      if (r.priceMin < 0 || r.priceMax < r.priceMin) {
        setError(`"${r.name}" has an invalid price range`); return;
      }
      if (r.days < 1) { setError(`"${r.name}" needs a delivery time of at least 1 day`); return; }
    }
    setSaving(true);
    try {
      await updateServices({
        tailorId: tailorId!,
        services: rows.map((r) => ({
          id: r.id,
          name: r.name.trim(),
          priceMin: r.priceMin,
          priceMax: r.priceMax,
          days: r.days,
          active: r.active,
        })),
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <button
          type="button"
          className="t-back"
          onClick={() => router.push("/tailor/profile")}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>Services</h1>
        <div style={{ width: 36 }} />
      </div>

      {savedFlash && (
        <div
          style={{
            margin: "0 20px 12px",
            padding: "10px 14px",
            background: "var(--ok-tint)",
            color: "var(--ok)",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          ✓ Services saved
        </div>
      )}
      {error && (
        <div
          style={{
            margin: "0 20px 12px",
            padding: "10px 14px",
            background: "var(--urgent-tint)",
            color: "var(--urgent)",
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Helpful hint */}
      <div style={{ margin: "0 20px 16px" }}>
        <div
          className="t-card t-card-inset"
          style={{
            background: "var(--ivory-2)",
            borderColor: "transparent",
            fontSize: 13,
            color: "var(--ink-3)",
            lineHeight: 1.5,
          }}
        >
          Keep active services short and specific (e.g. &ldquo;Blouse stitching&rdquo;, &ldquo;Fall &amp; picco&rdquo;, &ldquo;Alteration&rdquo;). Deactivate temporarily instead of deleting to keep price history intact.
        </div>
      </div>

      {rows.length === 0 && (
        <div className="t-empty" style={{ padding: "24px 24px 0" }}>
          <p>No services yet. Add one below to start taking orders.</p>
        </div>
      )}

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r, idx) => (
          <div
            key={r.id}
            className="t-card"
            style={{ padding: 16, opacity: r.active ? 1 : 0.6 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <input
                className="t-input"
                style={{
                  flex: 1,
                  fontFamily: "var(--font-serif)",
                  fontSize: 17,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
                value={r.name}
                onChange={(e) => updateRow(idx, { name: e.target.value })}
                placeholder="Service name"
              />
              <button
                type="button"
                className={`t-toggle ${r.active ? "t-on" : ""}`}
                onClick={() => updateRow(idx, { active: !r.active })}
                aria-label="Active"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div className="t-field">
                <label>Min (₹)</label>
                <input
                  className="t-input t-mono"
                  type="number"
                  min={0}
                  value={r.priceMin || ""}
                  onChange={(e) => updateRow(idx, { priceMin: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="t-field">
                <label>Max (₹)</label>
                <input
                  className="t-input t-mono"
                  type="number"
                  min={0}
                  value={r.priceMax || ""}
                  onChange={(e) => updateRow(idx, { priceMax: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="t-field">
                <label>Days</label>
                <input
                  className="t-input t-mono"
                  type="number"
                  min={1}
                  value={r.days || ""}
                  onChange={(e) => updateRow(idx, { days: Number(e.target.value) })}
                  placeholder="7"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeRow(idx)}
              style={{
                marginTop: 10,
                background: "transparent",
                border: 0,
                color: "var(--urgent)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div style={{ padding: "20px", display: "flex", gap: 10 }}>
        <button type="button" className="t-btn t-btn-ghost" onClick={addRow}>
          + Add service
        </button>
        <button
          type="button"
          className="t-btn t-btn-primary"
          style={{ marginLeft: "auto" }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
