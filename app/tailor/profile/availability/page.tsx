"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const HOUR_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
];

type WorkingDays = Record<typeof DAYS[number], boolean>;

export default function AvailabilityPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [available, setAvailable] = useState(true);
  const [workingDays, setWorkingDays] = useState<WorkingDays>({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false,
  });
  const [hoursOpen, setHoursOpen] = useState("09:00");
  const [hoursClose, setHoursClose] = useState("18:00");

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch { /* ignore */ }
  }, []);

  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip"
  );
  const updateAvailability = useMutation(api.tailorOps.updateAvailability);

  useEffect(() => {
    if (profile) {
      setAvailable(profile.available ?? true);
      if (profile.workingDays) setWorkingDays(profile.workingDays);
      if (profile.hoursOpen) setHoursOpen(profile.hoursOpen);
      if (profile.hoursClose) setHoursClose(profile.hoursClose);
    }
  }, [profile]);

  if (!tailorId || profile === undefined) return <PageLoading />;

  function toggleDay(day: typeof DAYS[number]) {
    setWorkingDays((prev) => ({ ...prev, [day]: !prev[day] }));
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    try {
      await updateAvailability({
        tailorId: tailorId!,
        available,
        workingDays,
        hoursOpen,
        hoursClose,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ } finally {
      setLoading(false);
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
        <h1>Availability</h1>
        <div style={{ width: 36 }} />
      </div>

      {saved && (
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
          ✓ Availability saved
        </div>
      )}

      {/* Online toggle */}
      <div style={{ padding: "0 20px", marginBottom: 14 }}>
        <div
          className="t-card t-card-inset"
          style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            <div className="t-serif" style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em" }}>
              {available ? "Currently accepting orders" : "Paused"}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
              {available
                ? "Visible to stores and customers"
                : "Hidden from new referrals"}
            </div>
          </div>
          <button
            type="button"
            className={`t-toggle ${available ? "t-on" : ""}`}
            style={{ transform: "scale(1.2)" }}
            onClick={() => setAvailable(!available)}
            aria-label="Accepting orders"
          />
        </div>
      </div>

      {/* Working days */}
      <div style={{ padding: "0 20px", marginBottom: 14 }}>
        <div className="t-card" style={{ padding: 16 }}>
          <div className="t-caps" style={{ color: "var(--ink-3)", marginBottom: 12 }}>
            Working days
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {DAYS.map((day) => {
              const on = workingDays[day];
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  style={{
                    padding: "10px 0",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    border: 0,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    background: on ? "var(--maroon)" : "var(--ivory-2)",
                    color: on ? "#fff" : "var(--ink-3)",
                    transition: "all 0.15s",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hours */}
      <div style={{ padding: "0 20px" }}>
        <div className="t-card" style={{ padding: 16 }}>
          <div className="t-caps" style={{ color: "var(--ink-3)", marginBottom: 12 }}>
            Working hours
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="t-field">
              <label>Opens at</label>
              <select
                className="t-select"
                value={hoursOpen}
                onChange={(e) => setHoursOpen(e.target.value)}
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div className="t-field">
              <label>Closes at</label>
              <select
                className="t-select"
                value={hoursClose}
                onChange={(e) => setHoursClose(e.target.value)}
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <button
          type="button"
          className="t-btn t-btn-primary t-btn-full t-btn-lg"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving…" : "Save availability"}
        </button>
      </div>
    </div>
  );
}
