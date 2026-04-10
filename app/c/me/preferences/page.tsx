"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";

const OCCASIONS = ["Wedding", "Festival", "Party", "Office", "Daily", "Gift"];
const FABRICS = [
  "Pure Silk",
  "Georgette",
  "Cotton",
  "Linen",
  "Chanderi",
  "Banarasi",
  "Kanjivaram",
  "Tussar",
];
const COLORS = [
  { name: "Crimson", swatch: "#DC143C" },
  { name: "Purple", swatch: "#7B3FA0" },
  { name: "Gold", swatch: "#C9941A" },
  { name: "Green", swatch: "#2D8544" },
  { name: "Blue", swatch: "#2C5F7C" },
  { name: "Pink", swatch: "#E88DAF" },
  { name: "White", swatch: "#F5F0E8" },
  { name: "Black", swatch: "#1A1A1A" },
];
const BUDGET_OPTIONS = [
  "Under \u20B95,000",
  "\u20B95,000\u2013\u20B915,000",
  "\u20B915,000\u2013\u20B930,000",
  "\u20B930,000\u2013\u20B950,000",
  "Above \u20B950,000",
];

export default function PreferencesPage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const customer = useQuery(
    api.customers.getById,
    customerId ? { customerId } : "skip"
  );
  const updatePreferences = useMutation(api.customers.updatePreferences);

  const [occasions, setOccasions] = useState<string[]>([]);
  const [fabrics, setFabrics] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [upcomingOccasion, setUpcomingOccasion] = useState("");
  const [upcomingDate, setUpcomingDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (customer) {
      setOccasions((customer as Record<string, unknown>).preferredOccasions as string[] || []);
      setFabrics((customer as Record<string, unknown>).preferredFabrics as string[] || []);
      setColors((customer as Record<string, unknown>).preferredColors as string[] || []);
      setBudget((customer as Record<string, unknown>).budgetRange as string || "");
      setUpcomingOccasion((customer as Record<string, unknown>).upcomingOccasion as string || "");
      setUpcomingDate((customer as Record<string, unknown>).upcomingOccasionDate as string || "");
    }
  }, [customer]);

  function toggleItem(
    list: string[],
    item: string,
    setter: (v: string[]) => void
  ) {
    setter(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
    setSaved(false);
  }

  async function handleSave() {
    if (!customerId) return;
    setSaving(true);
    await updatePreferences({
      customerId,
      preferredOccasions: occasions,
      preferredFabrics: fabrics,
      preferredColors: colors,
      budgetRange: budget || undefined,
      upcomingOccasion: upcomingOccasion || undefined,
      upcomingOccasionDate: upcomingDate || undefined,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!customerId || customer === undefined) {
    return (
      <div
        className="cx-pageIn"
        style={{
          minHeight: "100%",
          background: "#FDF8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="cx-typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "7px 16px",
    borderRadius: 100,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: active ? "none" : "1px solid #E8D5E0",
    background: active
      ? "linear-gradient(135deg, #2D1B4E 0%, #4A2D6E 100%)"
      : "#F4EFF9",
    color: active ? "#FDF8F0" : "#4A3558",
    transition: "all .2s",
  });

  return (
    <div
      className="cx-pageIn"
      style={{ minHeight: "100%", background: "#FDF8F0" }}
    >
      {/* ── Hero ────────────────────────────────────────── */}
      <div
        className="cx-noise cx-paisley"
        style={{
          background: "var(--cx-grad-hero)",
          padding: "28px 18px 22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <button
            onClick={() => router.back()}
            className="cx-press"
            style={{
              background: "rgba(253,248,240,.12)",
              border: "1px solid rgba(253,248,240,.18)",
              borderRadius: 100,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FDF8F0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1
            className="cx-serif"
            style={{
              fontSize: 26,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#FDF8F0",
              margin: 0,
            }}
          >
            My Preferences
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(253,248,240,.55)",
              margin: "4px 0 0",
            }}
          >
            Curate your saree journey
          </p>
        </div>
      </div>
      <div className="cx-zari" />

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ padding: "20px 18px 32px" }}>
        {/* Occasions */}
        <div className="cx-slideUp cx-d1" style={{ marginBottom: 24 }}>
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1A0A1E",
              fontStyle: "italic",
              marginBottom: 10,
            }}
          >
            Occasions
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {OCCASIONS.map((occ) => (
              <button
                key={occ}
                onClick={() => toggleItem(occasions, occ, setOccasions)}
                className="cx-press"
                style={chipStyle(occasions.includes(occ))}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        {/* Fabrics */}
        <div className="cx-slideUp cx-d2" style={{ marginBottom: 24 }}>
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1A0A1E",
              fontStyle: "italic",
              marginBottom: 10,
            }}
          >
            Fabrics
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {FABRICS.map((fab) => (
              <button
                key={fab}
                onClick={() => toggleItem(fabrics, fab, setFabrics)}
                className="cx-press"
                style={chipStyle(fabrics.includes(fab))}
              >
                {fab}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="cx-slideUp cx-d3" style={{ marginBottom: 24 }}>
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1A0A1E",
              fontStyle: "italic",
              marginBottom: 10,
            }}
          >
            Colours
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => toggleItem(colors, c.name, setColors)}
                className="cx-press"
                style={{
                  ...chipStyle(colors.includes(c.name)),
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: c.swatch,
                    border: "1.5px solid rgba(45,27,78,.15)",
                    flexShrink: 0,
                  }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="cx-slideUp cx-d4" style={{ marginBottom: 24 }}>
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1A0A1E",
              fontStyle: "italic",
              marginBottom: 10,
            }}
          >
            Budget Range
          </div>
          <select
            value={budget}
            onChange={(e) => {
              setBudget(e.target.value);
              setSaved(false);
            }}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 16,
              border: "1px solid #E8D5E0",
              background: "#FFFFFF",
              fontSize: 14,
              color: budget ? "#1A0A1E" : "#8B7EA0",
              outline: "none",
              WebkitAppearance: "none",
              appearance: "none" as React.CSSProperties["appearance"],
            }}
          >
            <option value="">Select budget</option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Upcoming Occasion */}
        <div className="cx-slideUp cx-d5" style={{ marginBottom: 28 }}>
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1A0A1E",
              fontStyle: "italic",
              marginBottom: 10,
            }}
          >
            Upcoming Occasion
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="e.g., Daughter's wedding"
              value={upcomingOccasion}
              onChange={(e) => {
                setUpcomingOccasion(e.target.value);
                setSaved(false);
              }}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 16,
                border: "1px solid #E8D5E0",
                background: "#FFFFFF",
                fontSize: 14,
                color: "#1A0A1E",
                outline: "none",
              }}
            />
            <input
              type="date"
              value={upcomingDate}
              onChange={(e) => {
                setUpcomingDate(e.target.value);
                setSaved(false);
              }}
              style={{
                padding: "12px 14px",
                borderRadius: 16,
                border: "1px solid #E8D5E0",
                background: "#FFFFFF",
                fontSize: 14,
                color: "#1A0A1E",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="cx-press"
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 100,
            background: "linear-gradient(135deg, #2D1B4E 0%, #4A2D6E 100%)",
            border: "none",
            color: "#FDF8F0",
            fontSize: 15,
            fontWeight: 700,
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "opacity .2s",
          }}
        >
          {saving ? "Saving..." : saved ? "Saved \u2713" : "Save Preferences"}
        </button>

        {/* Toast */}
        {saved && (
          <div
            className="cx-scaleIn"
            style={{
              marginTop: 14,
              padding: "10px 16px",
              borderRadius: 12,
              background: "#E8F5E9",
              border: "1px solid rgba(27,94,32,.15)",
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "#1B5E20",
            }}
          >
            Preferences saved successfully
          </div>
        )}
      </div>
    </div>
  );
}
