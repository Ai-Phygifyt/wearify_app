"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar, Check } from "lucide-react";

const MAROON = "#6E262B";

const OCCASIONS = ["Wedding", "Festival", "Party", "Office", "Daily", "Gift"];
const FABRICS = ["Pure Silk", "Georgette", "Cotton", "Linen", "Chanderi", "Banarasi", "Kanjivaram", "Tussar"];
const COLORS = [
  { name: "Crimson", swatch: "#DC143C" },
  { name: "Purple", swatch: "#7B3FA0" },
  { name: "Gold", swatch: "#E0A800" },
  { name: "Green", swatch: "#2D8544" },
  { name: "Blue", swatch: "#1F5FE0" },
  { name: "Pink", swatch: "#F4B9CD" },
  { name: "Black", swatch: "#1A1A1A" },
  { name: "White", swatch: "#FFFFFF" },
];
const BUDGET_OPTIONS = ["Under ₹5,000", "₹5,000–₹15,000", "₹15,000–₹30,000", "₹30,000–₹50,000", "Above ₹50,000"];

const fieldStyle: React.CSSProperties = {
  width: "100%",
  height: 52,
  padding: "0 16px",
  borderRadius: 12,
  border: "1.5px solid rgba(104,38,42,0.14)",
  background: "#fff",
  fontSize: 15,
  fontFamily: "inherit",
  color: "#2A2522",
  outline: "none",
  boxSizing: "border-box",
};

/* eslint-disable react-hooks/set-state-in-effect */
export default function PreferencesPage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const customer = useQuery(api.customers.getById, customerId ? { customerId } : "skip");
  const updatePreferences = useMutation(api.customers.updatePreferences);

  const [occasions, setOccasions] = useState<string[]>([]);
  const [fabrics, setFabrics] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [upcomingOccasion, setUpcomingOccasion] = useState("");
  const [upcomingDate, setUpcomingDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!customer) return;
    const c = customer as Record<string, unknown>;
    setOccasions((c.preferredOccasions as string[]) || []);
    setFabrics((c.preferredFabrics as string[]) || []);
    setColors((c.preferredColors as string[]) || []);
    setLocation((c.city as string) || "");
    setBudget((c.budgetRange as string) || "");
    setUpcomingOccasion((c.upcomingOccasion as string) || "");
    setUpcomingDate((c.upcomingOccasionDate as string) || "");
  }, [customer]);

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
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
      city: location.trim() || undefined,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!customerId || customer === undefined) {
    return <div className="cx-loading"><div className="cx-typing"><span /><span /><span /></div></div>;
  }

  return (
    <div style={{ minHeight: "100%", background: "#FFFFFF", fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* APP BAR */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "#FFFFFF", padding: "calc(env(safe-area-inset-top,0px) + 14px) 16px 14px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <button onClick={() => router.back()} aria-label="Back" className="cx-press" style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", color: "#2A2522" }}>
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#2A2522", letterSpacing: "0.06em", margin: 0, marginRight: 28 }}>MY PREFERENCE</h1>
      </header>

      <div style={{ padding: "20px 18px 36px" }}>
        {/* Occasions */}
        <Section title="Occasions">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {OCCASIONS.map((occ) => (
              <Pill key={occ} active={occasions.includes(occ)} onClick={() => toggleItem(occasions, occ, setOccasions)}>{occ}</Pill>
            ))}
          </div>
        </Section>

        {/* Fabrics */}
        <Section title="Fabrics">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {FABRICS.map((fab) => (
              <Pill key={fab} active={fabrics.includes(fab)} onClick={() => toggleItem(fabrics, fab, setFabrics)}>{fab}</Pill>
            ))}
          </div>
        </Section>

        {/* Colors */}
        <Section title="Colors">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {COLORS.map((c) => (
              <Pill key={c.name} active={colors.includes(c.name)} onClick={() => toggleItem(colors, c.name, setColors)}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: c.swatch, border: c.name === "White" ? "1px solid #D8C9BC" : "1px solid rgba(0,0,0,0.1)", flexShrink: 0, display: "inline-block" }} />
                {c.name}
              </Pill>
            ))}
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <input style={fieldStyle} placeholder="eg:- Mumbai" value={location} onChange={(e) => { setLocation(e.target.value); setSaved(false); }} />
        </Section>

        {/* Budget */}
        <Section title="Budget Range">
          <select value={budget} onChange={(e) => { setBudget(e.target.value); setSaved(false); }} style={{ ...fieldStyle, color: budget ? "#2A2522" : "#9A8F8A", WebkitAppearance: "none", appearance: "none" as React.CSSProperties["appearance"] }}>
            <option value="">Select budget</option>
            {BUDGET_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Section>

        {/* Upcoming Occasion */}
        <Section title="Upcoming Occasion" last>
          <div style={{ display: "flex", gap: 10 }}>
            <input style={{ ...fieldStyle, flex: 1, minWidth: 0 }} placeholder="eg.Daughter wedding" value={upcomingOccasion} onChange={(e) => { setUpcomingOccasion(e.target.value); setSaved(false); }} />
            <div style={{ position: "relative", flex: "0 0 140px" }}>
              <input type="date" style={{ ...fieldStyle, paddingRight: 38 }} value={upcomingDate} onChange={(e) => { setUpcomingDate(e.target.value); setSaved(false); }} />
              <Calendar size={17} color={MAROON} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>
        </Section>

        {/* Save */}
        <button onClick={handleSave} disabled={saving} className="cx-press"
          style={{ width: "100%", marginTop: 26, height: 56, borderRadius: 14, background: MAROON, border: "none", color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: saving ? "default" : "pointer", opacity: saving ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 22px rgba(110,38,43,0.26)" }}>
          {saving ? "Saving…" : saved ? <>Saved Preferences <Check size={18} strokeWidth={2.6} /></> : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 24 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#2A2522", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="cx-press"
      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 99, border: active ? "none" : "1px solid rgba(104,38,42,0.18)", background: active ? MAROON : "#fff", color: active ? "#fff" : "#2A2522", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}
