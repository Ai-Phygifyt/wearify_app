"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Btn } from "@/components/ui/wearify-ui";
import { Id } from "@/convex/_generated/dataModel";

const OCCASIONS = [
  { key: "Wedding", label: "Wedding", emoji: "ring", color: "bg-wf-red/10 text-wf-red" },
  { key: "Festival", label: "Festival", emoji: "star", color: "bg-wf-amber/10 text-wf-amber" },
  { key: "Office", label: "Office", emoji: "work", color: "bg-wf-blue/10 text-wf-blue" },
  { key: "Party", label: "Party", emoji: "party", color: "bg-wf-primary/10 text-wf-primary" },
  { key: "Daily", label: "Daily", emoji: "sun", color: "bg-wf-green/10 text-wf-green" },
  { key: "Gift", label: "Gift", emoji: "gift", color: "bg-wf-amber/10 text-wf-amber" },
];

const BUDGETS = [
  "Under 5K",
  "5K-10K",
  "10K-25K",
  "25K-50K",
  "50K-1L",
  "1L+",
];

const COLOR_SWATCHES = [
  { name: "Red", hex: "#C0392B" },
  { name: "Gold", hex: "#D4A843" },
  { name: "Blue", hex: "#2C5F7C" },
  { name: "Green", hex: "#2D8544" },
  { name: "Pink", hex: "#E91E8C" },
  { name: "Purple", hex: "#8E44AD" },
  { name: "Orange", hex: "#E67E22" },
  { name: "Cream", hex: "#F5E6C8" },
  { name: "Black", hex: "#1A1A1A" },
  { name: "White", hex: "#FAFAFA" },
];

export default function TabletOccasionPage() {
  const router = useRouter();
  const createSession = useMutation(api.sessionOps.createSession);

  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [visitNote, setVisitNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [storeConfig, setStoreConfig] = useState<{ storeId: string; storeName: string } | null>(null);
  const [staffData, setStaffData] = useState<{ staffId: string; name: string } | null>(null);
  const [customerData, setCustomerData] = useState<{ customerId: string; phone: string; name: string } | null>(null);

  useEffect(() => {
    const storeRaw = localStorage.getItem("wearify_tablet_store");
    const staffRaw = localStorage.getItem("wearify_tablet_staff");
    const custRaw = localStorage.getItem("wearify_tablet_customer");
    if (storeRaw) try { setStoreConfig(JSON.parse(storeRaw)); } catch { /* ignore */ }
    if (staffRaw) try { setStaffData(JSON.parse(staffRaw)); } catch { /* ignore */ }
    if (custRaw) try { setCustomerData(JSON.parse(custRaw)); } catch { /* ignore */ }
  }, []);

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleStart = async () => {
    if (!storeConfig) return;
    setLoading(true);
    try {
      const sessionId = await createSession({
        storeId: storeConfig.storeId,
        storeName: storeConfig.storeName,
        staffId: staffData?.staffId as Id<"staff"> | undefined,
        staffName: staffData?.name,
        customerId: customerData?.customerId as Id<"customers"> | undefined,
        customerPhone: customerData?.phone,
        tabletLinked: true,
        occasion: selectedOccasion || undefined,
        budget: selectedBudget || undefined,
      });

      localStorage.setItem(
        "wearify_tablet_session",
        JSON.stringify({
          sessionId,
          startTime: Date.now(),
          occasion: selectedOccasion,
          budget: selectedBudget,
          visitNote,
          colors: selectedColors,
        })
      );

      router.push("/tablet/catalogue");
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-extrabold text-wf-text mb-1">
          {customerData ? `${customerData.name}'s Visit` : "Guest Visit"}
        </h1>
        <p className="text-sm text-wf-subtext mb-6">
          Help us find the perfect saree. Select occasion and budget.
        </p>

        {/* Occasion grid */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-wf-text mb-3">Occasion</h3>
          <div className="grid grid-cols-3 gap-3">
            {OCCASIONS.map((occ) => (
              <button
                key={occ.key}
                onClick={() => setSelectedOccasion(selectedOccasion === occ.key ? "" : occ.key)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer text-left ${
                  selectedOccasion === occ.key
                    ? "border-wf-primary bg-wf-primary/5"
                    : "border-wf-border bg-wf-card hover:border-wf-primary/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${occ.color} flex items-center justify-center text-sm font-bold mb-2`}>
                  {occ.key.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-sm font-bold text-wf-text">{occ.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Budget range */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-wf-text mb-3">Budget Range</h3>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBudget(selectedBudget === b ? "" : b)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  selectedBudget === b
                    ? "bg-wf-primary text-white"
                    : "bg-wf-card border border-wf-border text-wf-text hover:border-wf-primary/40"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Color preferences */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-wf-text mb-3">Color Preferences (optional)</h3>
          <div className="flex flex-wrap gap-3">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.name}
                onClick={() => toggleColor(c.name)}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-transform ${
                  selectedColors.includes(c.name) ? "scale-110" : "opacity-70 hover:opacity-100"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 transition-colors ${
                    selectedColors.includes(c.name)
                      ? "border-wf-primary"
                      : "border-wf-border"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] text-wf-subtext">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visit note */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-wf-text mb-3">Visit Note (optional)</h3>
          <textarea
            value={visitNote}
            onChange={(e) => setVisitNote(e.target.value)}
            placeholder="Any special requirements, preferences, or notes..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-sm resize-none focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary placeholder:text-wf-muted"
          />
        </div>

        {/* Action */}
        <div className="flex gap-3 justify-end">
          <Btn onClick={() => router.push("/tablet")}>Cancel</Btn>
          <Btn primary onClick={handleStart} disabled={loading}>
            {loading ? "Starting..." : "Start Browsing"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
