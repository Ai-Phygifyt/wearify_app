"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Btn, PageLoading } from "@/components/ui/wearify-ui";

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
    } catch {
      // ignore
    }
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

  if (!tailorId || profile === undefined) {
    return <PageLoading />;
  }

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
        <h1 className="text-lg font-bold text-wf-text">Edit Profile</h1>
      </div>

      {saved && (
        <div className="px-4 py-2.5 rounded-lg bg-wf-green/10 text-wf-green text-sm font-medium">
          Profile saved successfully!
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-wf-text mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-wf-text mb-1.5">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-wf-text mb-1.5">Area</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-wf-text mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell customers about yourself..."
            className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-wf-text mb-1.5">Experience</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 10 years"
              className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-wf-text mb-1.5">Service Radius (km)</label>
            <input
              type="number"
              value={serviceRadius}
              onChange={(e) => setServiceRadius(e.target.value)}
              placeholder="e.g. 10"
              className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-wf-text mb-2">Specialties</label>
          <div className="grid grid-cols-2 gap-2">
            {SPECIALTY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleSpecialty(opt.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
                  specialties.includes(opt.id)
                    ? "bg-wf-primary/10 text-wf-primary border-wf-primary"
                    : "bg-white text-wf-subtext border-wf-border hover:border-wf-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Btn primary className="w-full" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Btn>
      </div>
    </div>
  );
}
