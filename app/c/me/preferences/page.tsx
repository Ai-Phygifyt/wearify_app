"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { Btn, PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

const OCCASIONS = ["Wedding", "Festival", "Office", "Party", "Daily", "Gift"];
const FABRICS = ["Silk", "Cotton", "Linen", "Chiffon", "Georgette", "Organza"];
const COLORS = [
  { name: "Red", color: "#C0392B" },
  { name: "Gold", color: "#D4A843" },
  { name: "Maroon", color: "#71221D" },
  { name: "Blue", color: "#2C5F7C" },
  { name: "Green", color: "#2D8544" },
  { name: "Pink", color: "#E88DAF" },
  { name: "Purple", color: "#7B3FA0" },
  { name: "Beige", color: "#D4C5A0" },
  { name: "Black", color: "#1A1A1A" },
  { name: "White", color: "#F5F0E8" },
  { name: "Orange", color: "#E67E22" },
  { name: "Yellow", color: "#F1C40F" },
];
const BUDGET_OPTIONS = [
  "Under Rs.5,000",
  "Rs.5,000 - Rs.10,000",
  "Rs.10,000 - Rs.25,000",
  "Rs.25,000 - Rs.50,000",
  "Rs.50,000+",
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
      setOccasions(customer.preferredOccasions || []);
      setFabrics(customer.preferredFabrics || []);
      setColors(customer.preferredColors || []);
      setBudget(customer.budgetRange || "");
      setUpcomingOccasion(customer.upcomingOccasion || "");
      setUpcomingDate(customer.upcomingOccasionDate || "");
    }
  }, [customer]);

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
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
    setTimeout(() => setSaved(false), 2000);
  }

  if (!customerId || customer === undefined) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="text-wf-primary text-lg cursor-pointer"
        >
          {"\u2190"}
        </button>
        <h1 className="text-lg font-bold text-wf-text">Preferences</h1>
      </div>

      {/* Occasions */}
      <div className="mb-5">
        <div className="text-sm font-bold text-wf-text mb-2">Occasions</div>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((occ) => (
            <button
              key={occ}
              onClick={() => toggleItem(occasions, occ, setOccasions)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                occasions.includes(occ)
                  ? "bg-wf-primary text-white"
                  : "bg-wf-bg border border-wf-border text-wf-subtext"
              }`}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      {/* Fabrics */}
      <div className="mb-5">
        <div className="text-sm font-bold text-wf-text mb-2">Fabrics</div>
        <div className="flex flex-wrap gap-2">
          {FABRICS.map((fab) => (
            <button
              key={fab}
              onClick={() => toggleItem(fabrics, fab, setFabrics)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                fabrics.includes(fab)
                  ? "bg-wf-primary text-white"
                  : "bg-wf-bg border border-wf-border text-wf-subtext"
              }`}
            >
              {fab}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-5">
        <div className="text-sm font-bold text-wf-text mb-2">Colors</div>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => toggleItem(colors, c.name, setColors)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                colors.includes(c.name)
                  ? "bg-wf-primary text-white"
                  : "bg-wf-bg border border-wf-border text-wf-subtext"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full border border-wf-border/50"
                style={{ backgroundColor: c.color }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="mb-5">
        <div className="text-sm font-bold text-wf-text mb-2">Budget Range</div>
        <select
          value={budget}
          onChange={(e) => {
            setBudget(e.target.value);
            setSaved(false);
          }}
          className="w-full bg-wf-bg border border-wf-border rounded-lg px-3 py-2 text-sm text-wf-text outline-none focus:border-wf-primary"
        >
          <option value="">Select budget</option>
          {BUDGET_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Upcoming occasion */}
      <div className="mb-5">
        <div className="text-sm font-bold text-wf-text mb-2">
          Upcoming Occasion
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g., Daughter's wedding"
            value={upcomingOccasion}
            onChange={(e) => {
              setUpcomingOccasion(e.target.value);
              setSaved(false);
            }}
            className="flex-1 bg-wf-bg border border-wf-border rounded-lg px-3 py-2 text-sm text-wf-text outline-none focus:border-wf-primary"
          />
          <input
            type="date"
            value={upcomingDate}
            onChange={(e) => {
              setUpcomingDate(e.target.value);
              setSaved(false);
            }}
            className="bg-wf-bg border border-wf-border rounded-lg px-3 py-2 text-sm text-wf-text outline-none focus:border-wf-primary"
          />
        </div>
      </div>

      <Btn
        primary
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
      </Btn>
    </div>
  );
}
