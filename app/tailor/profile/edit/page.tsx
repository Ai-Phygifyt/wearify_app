"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";

const SPECIALTY_OPTIONS = [
  { id: "silk_blouse", label: "Silk Blouse" },
  { id: "cotton_casual", label: "Cotton Casual" },
  { id: "designer_emb", label: "Designer Embroidery" },
  { id: "bridal", label: "Bridal" },
  { id: "fall_pico", label: "Fall & Pico" },
  { id: "petticoat", label: "Petticoat" },
  { id: "heavy_work", label: "Heavy Work" },
  { id: "alteration", label: "Alteration" },
  { id: "readymade", label: "Readymade" },
];

export default function EditProfilePage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [serviceRadius, setServiceRadius] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);

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
  const updateProfile = useMutation(api.tailorOps.updateProfile);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setCity(profile.city);
      setArea(profile.area || "");
      setBio(profile.bio || "");
      setExperience(profile.experience || "");
      setServiceRadius(profile.serviceRadius ? String(profile.serviceRadius) : "");
      setSpecialties(profile.specialties || []);
    }
  }, [profile]);

  if (!tailorId || profile === undefined) return <PageLoading />;

  function toggleSpecialty(id: string) {
    setSpecialties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    try {
      await updateProfile({
        tailorId: tailorId!,
        name: name || undefined,
        city: city || undefined,
        area: area || undefined,
        bio: bio || undefined,
        experience: experience || undefined,
        serviceRadius: serviceRadius ? Number(serviceRadius) : undefined,
        specialties: specialties.length > 0 ? specialties : undefined,
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
        <h1>Edit profile</h1>
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
          ✓ Profile saved
        </div>
      )}

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="t-field">
          <label>Full name</label>
          <input className="t-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="t-field">
            <label>City</label>
            <input className="t-input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="t-field">
            <label>Area</label>
            <input className="t-input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Optional" />
          </div>
        </div>

        <div className="t-field">
          <label>Bio</label>
          <textarea
            className="t-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell customers about yourself"
            style={{ resize: "none", fontFamily: "inherit" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="t-field">
            <label>Experience</label>
            <input className="t-input" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 10 years" />
          </div>
          <div className="t-field">
            <label>Service radius (km)</label>
            <input className="t-input t-mono" type="number" value={serviceRadius} onChange={(e) => setServiceRadius(e.target.value)} placeholder="10" />
          </div>
        </div>

        <div className="t-field">
          <label>Specialties</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {SPECIALTY_OPTIONS.map((opt) => {
              const on = specialties.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleSpecialty(opt.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    background: on ? "var(--maroon-tint)" : "var(--paper)",
                    color: on ? "var(--maroon-ink)" : "var(--ink-3)",
                    border: `1px solid ${on ? "rgba(123, 29, 29, 0.2)" : "var(--line-2)"}`,
                    textAlign: "left",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
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
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
