"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Toggle, Btn, PageLoading } from "@/components/ui/wearify-ui";

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
    } catch {
      // ignore
    }
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

  if (!tailorId || profile === undefined) {
    return <PageLoading />;
  }

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
    } catch {
      // ignore
    } finally {
      setLoading(false);
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
        <h1 className="text-lg font-bold text-wf-text">Availability</h1>
      </div>

      {saved && (
        <div className="px-4 py-2.5 rounded-lg bg-wf-green/10 text-wf-green text-sm font-medium">
          Availability saved!
        </div>
      )}

      {/* Online/Offline Toggle */}
      <div className="bg-wf-card rounded-lg p-5 border border-wf-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-wf-text">
              {available ? "Online" : "Offline"}
            </div>
            <div className="text-xs text-wf-subtext mt-0.5">
              {available
                ? "You are visible to stores and customers"
                : "You are hidden from new referrals"}
            </div>
          </div>
          <div className="scale-150">
            <Toggle on={available} onToggle={() => setAvailable(!available)} />
          </div>
        </div>
      </div>

      {/* Working Days */}
      <div className="bg-wf-card rounded-lg p-4 border border-wf-border">
        <div className="text-sm font-bold text-wf-text mb-3">Working Days</div>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`py-2.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                workingDays[day]
                  ? "bg-wf-primary text-white border-wf-primary"
                  : "bg-white text-wf-muted border-wf-border"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-wf-card rounded-lg p-4 border border-wf-border">
        <div className="text-sm font-bold text-wf-text mb-3">Working Hours</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-wf-subtext mb-1">Opens at</label>
            <select
              value={hoursOpen}
              onChange={(e) => setHoursOpen(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text cursor-pointer"
            >
              {HOUR_OPTIONS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-wf-subtext mb-1">Closes at</label>
            <select
              value={hoursClose}
              onChange={(e) => setHoursClose(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text cursor-pointer"
            >
              {HOUR_OPTIONS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Btn primary className="w-full" onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Availability"}
      </Btn>
    </div>
  );
}
