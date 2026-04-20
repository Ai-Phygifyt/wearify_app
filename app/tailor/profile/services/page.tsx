"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Btn, PageLoading } from "@/components/ui/wearify-ui";

type ServiceRow = {
  id: string;
  name: string;
  priceMin: number;
  priceMax: number;
  days: number;
  active: boolean;
};

// Defaults used when a tailor adds a brand-new service row.
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

  // Hydrate local editing state from the server once. We intentionally
  // don't re-sync on every query update so in-flight edits aren't clobbered.
  useEffect(() => {
    if (profile && rows.length === 0) {
      setRows(profile.services ?? []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (!tailorId || profile === undefined) return <PageLoading />;
  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-wf-subtext">Profile not found.</p>
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
    // Basic validation: name + sensible price band + days > 0.
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/tailor/profile")}
          className="p-1 rounded-lg hover:bg-wf-card transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wf-text">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-wf-text">Services &amp; Pricing</h1>
      </div>

      {savedFlash && (
        <div className="px-4 py-2.5 rounded-lg bg-wf-green/10 text-wf-green text-sm font-medium">
          Services saved.
        </div>
      )}
      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-wf-red/10 text-wf-red text-sm">
          {error}
        </div>
      )}

      {/* Hint */}
      <div className="px-4 py-3 rounded-lg bg-wf-card border border-wf-border text-xs text-wf-subtext">
        Keep active services short and specific (e.g. &ldquo;Blouse stitching&rdquo;, &ldquo;Fall &amp; picco&rdquo;, &ldquo;Alteration&rdquo;). Deactivate a service temporarily instead of deleting if you&apos;re out of capacity — it keeps the price history intact.
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="text-center py-8 text-sm text-wf-muted">
            No services yet. Add one below.
          </div>
        )}
        {rows.map((r, idx) => (
          <div
            key={r.id}
            className={`bg-wf-card rounded-lg p-4 border ${r.active ? "border-wf-border" : "border-wf-border opacity-60"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={r.name}
                onChange={(e) => updateRow(idx, { name: e.target.value })}
                placeholder="Service name"
                className="flex-1 mr-3 px-3 py-2 text-sm font-semibold border border-wf-border rounded-lg outline-none bg-white text-wf-text"
              />
              <label className="flex items-center gap-2 text-xs text-wf-subtext cursor-pointer">
                <input
                  type="checkbox"
                  checked={r.active}
                  onChange={(e) => updateRow(idx, { active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-wf-subtext mb-1">Price min (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={r.priceMin || ""}
                  onChange={(e) => updateRow(idx, { priceMin: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
                />
              </div>
              <div>
                <label className="block text-[11px] text-wf-subtext mb-1">Price max (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={r.priceMax || ""}
                  onChange={(e) => updateRow(idx, { priceMax: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
                />
              </div>
              <div>
                <label className="block text-[11px] text-wf-subtext mb-1">Days</label>
                <input
                  type="number"
                  min={1}
                  value={r.days || ""}
                  onChange={(e) => updateRow(idx, { days: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="mt-3 text-xs text-wf-red bg-transparent border-none cursor-pointer"
            >
              Remove service
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Btn small onClick={addRow}>+ Add service</Btn>
        <Btn primary className="ml-auto" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Btn>
      </div>
    </div>
  );
}
