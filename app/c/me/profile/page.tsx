"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUploadFile } from "@/lib/useUpload";
import { useCustomer } from "../../layout";
import { Id } from "@/convex/_generated/dataModel";

type Gender = "female" | "male" | "other" | "prefer_not_to_say";
type HeightUnit = "cm" | "ftin";

const MIN_HEIGHT_CM = 120;
const MAX_HEIGHT_CM = 220;

function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  if (inch === 12) return { ft: ft + 1, inch: 0 };
  return { ft, inch };
}
function ftInToCm(ft: number, inch: number): number {
  return Math.round((ft * 12 + inch) * 2.54);
}
function ageFromDob(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
}

export default function EditProfilePage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const updateProfile = useMutation(api.customers.updateProfile);
  const { upload } = useUploadFile();

  const customer = useQuery(
    api.customers.getById,
    customerId ? { customerId } : "skip"
  );

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCm, setHeightCmState] = useState<number>(160);
  const [ftVal, setFtVal] = useState<number>(5);
  const [inVal, setInVal] = useState<number>(3);
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [photoFileId, setPhotoFileId] = useState<Id<"_storage"> | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!customer) return;
    setFullName((customer as Record<string, unknown>).name as string || "");
    setDob((customer as Record<string, unknown>).dateOfBirth as string || "");
    setGender(((customer as Record<string, unknown>).gender as Gender) || "");
    const h = (customer as Record<string, unknown>).heightCm as number | undefined;
    if (typeof h === "number") {
      setHeightCmState(h);
      const ftIn = cmToFtIn(h);
      setFtVal(ftIn.ft);
      setInVal(ftIn.inch);
    }
    const hu = (customer as Record<string, unknown>).heightUnit as string | undefined;
    if (hu === "ftin") setHeightUnit("ftin");
    setCity((customer as Record<string, unknown>).city as string || "");
    setEmail((customer as Record<string, unknown>).email as string || "");
    const pf = (customer as Record<string, unknown>).photoFileId as Id<"_storage"> | undefined;
    setPhotoFileId(pf ?? null);
  }, [customer]);

  const photoUrl = useQuery(
    api.files.getUrl,
    photoFileId && !photoPreview ? { fileId: photoFileId } : "skip"
  );
  const displayPhoto = photoPreview || photoUrl || "";
  const initials = useMemo(() => initialsOf(fullName || "U"), [fullName]);

  const maxDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 13);
    return d.toISOString().split("T")[0];
  }, []);

  function mark<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setDirty(true); };
  }

  function setHeightCm(n: number) {
    const clamped = Math.min(MAX_HEIGHT_CM, Math.max(MIN_HEIGHT_CM, Math.round(n)));
    setHeightCmState(clamped);
    const ftIn = cmToFtIn(clamped);
    setFtVal(ftIn.ft);
    setInVal(ftIn.inch);
    setDirty(true);
  }
  function setHeightFromFtIn(ft: number, inch: number) {
    setFtVal(ft);
    setInVal(inch);
    setHeightCmState(ftInToCm(ft, inch));
    setDirty(true);
  }

  async function handlePhotoPick(file: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Photo must be JPEG, PNG, or WebP");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Photo must be under 4 MB");
      return;
    }
    setError("");
    setPhotoUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    try {
      const id = await upload(file);
      setPhotoFileId(id);
      setDirty(true);
    } catch {
      setError("Photo upload failed.");
      setPhotoPreview("");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleSave() {
    if (!customerId) return;
    if (!fullName.trim() || fullName.trim().length < 2) { setError("Enter your full name"); return; }
    if (!dob) { setError("Select date of birth"); return; }
    const age = ageFromDob(dob);
    if (age === null || age < 13 || age > 120) { setError("Enter a valid date of birth"); return; }
    if (!gender) { setError("Select a gender"); return; }
    if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) { setError(`Height must be between ${MIN_HEIGHT_CM}-${MAX_HEIGHT_CM} cm`); return; }
    if (!city.trim()) { setError("Enter your city"); return; }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email"); return; }
    setError("");
    setSaving(true);
    try {
      await updateProfile({
        customerId,
        name: fullName.trim(),
        initials: initials,
        dateOfBirth: dob,
        gender: gender as string,
        heightCm,
        heightUnit,
        city: city.trim(),
        email: email.trim() || undefined,
        photoFileId: photoFileId ?? undefined,
      });
      setDirty(false);
      setToast("Profile updated");
      setTimeout(() => setToast(""), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!customer) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 18px 40px", background: "#FDF8F0", minHeight: "100%" }}>
      {/* Header with back */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => router.push("/c/me")}
          style={{ padding: 6, border: "none", background: "transparent", cursor: "pointer" }}
          aria-label="Back"
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#2D1B4E" strokeWidth="1.8">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="cx-serif" style={{ fontSize: 24, fontWeight: 700, fontStyle: "italic", color: "#2D1B4E", margin: 0 }}>
          Edit Profile
        </h1>
      </div>

      {/* Photo */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <label htmlFor="photo-input"
          style={{
            position: "relative", width: 100, height: 100, borderRadius: "50%",
            background: displayPhoto ? "transparent" : "var(--cx-grad-plum)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", overflow: "hidden",
            border: "3px solid var(--cx-border-gold)",
            boxShadow: "var(--cx-shadow-md)",
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {displayPhoto ? (
            <img src={displayPhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span className="cx-serif" style={{ fontSize: 36, fontWeight: 700, color: "#C9941A", fontStyle: "italic" }}>
              {initials}
            </span>
          )}
          {photoUploading && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10 }}>
              Uploading...
            </div>
          )}
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: 28, height: 28, borderRadius: "50%",
            background: "#C9941A", border: "2px solid #FDF8F0",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 12,
          }}>
            ✎
          </div>
          <input id="photo-input" type="file" accept="image/jpeg,image/png,image/webp"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoPick(f); }}
            style={{ display: "none" }} />
        </label>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--cx-error-bg)", color: "var(--cx-error)", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Full Name">
          <input style={inputStyle} value={fullName} onChange={(e) => mark(setFullName)(e.target.value)} />
        </Field>

        <Field label="Date of Birth">
          <input type="date" style={inputStyle} value={dob} max={maxDob} onChange={(e) => mark(setDob)(e.target.value)} />
          {dob && ageFromDob(dob) !== null && (
            <div style={{ fontSize: 11, color: "var(--cx-text-muted)", marginTop: 4 }}>Age: {ageFromDob(dob)}</div>
          )}
        </Field>

        <Field label="Gender">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {([["female","Female"],["male","Male"],["other","Other"],["prefer_not_to_say","Prefer not to say"]] as const).map(([v, l]) => (
              <button key={v} type="button" onClick={() => mark(setGender)(v)}
                style={{
                  padding: "10px 12px", borderRadius: 10,
                  border: gender === v ? "1.5px solid #C9941A" : "1.5px solid var(--cx-border)",
                  background: gender === v ? "var(--cx-gold-ghost)" : "white",
                  color: gender === v ? "var(--cx-gold-d)" : "var(--cx-text)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>{l}</button>
            ))}
          </div>
        </Field>

        <Field label="Height" right={
          <div style={{ display: "flex", background: "var(--cx-plum-ghost)", borderRadius: 100, padding: 2 }}>
            {(["cm","ftin"] as const).map((u) => (
              <button key={u} type="button" onClick={() => { setHeightUnit(u); setDirty(true); }}
                style={{
                  padding: "4px 12px", borderRadius: 100, border: "none", fontSize: 11, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  background: heightUnit === u ? "#2D1B4E" : "transparent",
                  color: heightUnit === u ? "white" : "#2D1B4E",
                }}>{u === "cm" ? "cm" : "ft / in"}</button>
            ))}
          </div>
        }>
          {heightUnit === "cm" ? (
            <input type="number" min={MIN_HEIGHT_CM} max={MAX_HEIGHT_CM} value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))} style={inputStyle} />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--cx-border)", borderRadius: 10, background: "white", overflow: "hidden" }}>
                <input type="number" min={3} max={7} value={ftVal}
                  onChange={(e) => setHeightFromFtIn(Number(e.target.value), inVal)}
                  style={{ ...inputStyle, border: "none", flex: 1 }} />
                <span style={{ paddingRight: 12, fontSize: 12, color: "var(--cx-text-muted)" }}>ft</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--cx-border)", borderRadius: 10, background: "white", overflow: "hidden" }}>
                <input type="number" min={0} max={11} value={inVal}
                  onChange={(e) => setHeightFromFtIn(ftVal, Number(e.target.value))}
                  style={{ ...inputStyle, border: "none", flex: 1 }} />
                <span style={{ paddingRight: 12, fontSize: 12, color: "var(--cx-text-muted)" }}>in</span>
              </div>
            </div>
          )}
          <div style={{ fontSize: 11, color: "var(--cx-text-muted)", marginTop: 4 }}>
            {heightUnit === "cm"
              ? `${cmToFtIn(heightCm).ft} ft ${cmToFtIn(heightCm).inch} in`
              : `${heightCm} cm`}
          </div>
        </Field>

        <Field label="City">
          <input style={inputStyle} value={city} onChange={(e) => mark(setCity)(e.target.value)} />
        </Field>

        <Field label="Email (optional)">
          <input type="email" style={inputStyle} value={email} onChange={(e) => mark(setEmail)(e.target.value)} />
        </Field>
      </div>

      <button onClick={handleSave} disabled={saving || !dirty || photoUploading}
        style={{
          width: "100%", marginTop: 24, padding: "14px 20px", borderRadius: 10, border: "none",
          background: "var(--cx-grad-plum)", color: "white", fontSize: 15, fontWeight: 700,
          cursor: saving || !dirty ? "not-allowed" : "pointer",
          opacity: saving || !dirty ? 0.5 : 1,
          boxShadow: "var(--cx-shadow-gold)", fontFamily: "inherit",
        }}>
        {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
      </button>

      {toast && (
        <div style={{
          position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)",
          padding: "10px 18px", borderRadius: 100, background: "#2D1B4E", color: "white",
          fontSize: 13, fontWeight: 600, boxShadow: "var(--cx-shadow-md)", zIndex: 50,
        }}>{toast}</div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1.5px solid var(--cx-border)", background: "white",
  fontSize: 14, color: "var(--cx-text)", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--cx-text)" }}>{label}</label>
        {right}
      </div>
      {children}
    </div>
  );
}
