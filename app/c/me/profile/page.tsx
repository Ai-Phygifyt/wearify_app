"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUploadFile } from "@/lib/useUpload";
import { GUARDS } from "@/lib/uploadGuards";
import { useCustomer } from "../../layout";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, Check } from "lucide-react";

type Gender = "female" | "male" | "other" | "prefer_not_to_say";
type HeightUnit = "cm" | "ftin";

const MAROON = "#6E262B";
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
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 52,
  padding: "0 16px",
  borderRadius: 12,
  border: "1.5px solid rgba(104,38,42,0.14)",
  background: "#fff",
  fontSize: 15.5,
  fontWeight: 500,
  color: "#2A2522",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = { fontSize: 13.5, fontWeight: 700, color: "#2A2522", marginBottom: 8, display: "block" };

export default function EditProfilePage() {
  const router = useRouter();
  const { customerId, phone } = useCustomer();
  const updateProfile = useMutation(api.customers.updateProfile);
  const { upload } = useUploadFile();

  const customer = useQuery(api.customers.getById, customerId ? { customerId } : "skip");

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCm, setHeightCmState] = useState<number>(160);
  const [ftVal, setFtVal] = useState<number>(5);
  const [inVal, setInVal] = useState<number>(3);
  const [heightCmInput, setHeightCmInput] = useState<string>("160");
  const [ftInput, setFtInput] = useState<string>("5");
  const [inInput, setInInput] = useState<string>("3");
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
    const c = customer as Record<string, unknown>;
    setFullName((c.name as string) || "");
    setDob((c.dateOfBirth as string) || "");
    setGender((c.gender as Gender) || "");
    const h = c.heightCm as number | undefined;
    if (typeof h === "number") {
      setHeightCmState(h);
      setHeightCmInput(String(h));
      const ftIn = cmToFtIn(h);
      setFtVal(ftIn.ft); setInVal(ftIn.inch);
      setFtInput(String(ftIn.ft)); setInInput(String(ftIn.inch));
    }
    if ((c.heightUnit as string) === "ftin") setHeightUnit("ftin");
    setCity((c.city as string) || "");
    setEmail((c.email as string) || "");
    setPhotoFileId((c.photoFileId as Id<"_storage"> | undefined) ?? null);
  }, [customer]);

  const photoUrl = useQuery(api.files.getUrl, photoFileId && !photoPreview ? { fileId: photoFileId } : "skip");
  const displayPhoto = photoPreview || photoUrl || "";
  const initials = useMemo(() => initialsOf(fullName || "U"), [fullName]);
  const maskedPhone = phone ? `${phone.slice(0, 8)}XXXX${phone.slice(-2)}` : "";
  const maxDob = useMemo(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 13); return d.toISOString().split("T")[0]; }, []);

  function mark<T>(setter: (v: T) => void) { return (v: T) => { setter(v); setDirty(true); }; }

  function onHeightCmChange(raw: string) {
    setHeightCmInput(raw); setDirty(true);
    const n = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(n)) {
      setHeightCmState(n);
      const ftIn = cmToFtIn(n);
      setFtVal(ftIn.ft); setInVal(ftIn.inch);
      setFtInput(String(ftIn.ft)); setInInput(String(ftIn.inch));
    }
  }
  function onHeightCmBlur() {
    const parsed = Number(heightCmInput);
    const safe = Number.isFinite(parsed) ? Math.round(parsed) : heightCm;
    const clamped = Math.min(MAX_HEIGHT_CM, Math.max(MIN_HEIGHT_CM, safe));
    setHeightCmState(clamped); setHeightCmInput(String(clamped));
    const ftIn = cmToFtIn(clamped);
    setFtVal(ftIn.ft); setInVal(ftIn.inch);
    setFtInput(String(ftIn.ft)); setInInput(String(ftIn.inch));
  }
  function onFtInChange(rawFt: string, rawIn: string) {
    setFtInput(rawFt); setInInput(rawIn); setDirty(true);
    const ft = Number(rawFt), inch = Number(rawIn);
    if (rawFt.trim() !== "" && Number.isFinite(ft) && rawIn.trim() !== "" && Number.isFinite(inch)) {
      setFtVal(ft); setInVal(inch);
      const cm = ftInToCm(ft, inch); setHeightCmState(cm); setHeightCmInput(String(cm));
    }
  }
  function onFtInBlur() {
    const ft = Number(ftInput), inch = Number(inInput);
    const clampedFt = Math.min(7, Math.max(3, Number.isFinite(ft) ? Math.round(ft) : ftVal));
    const clampedIn = Math.min(11, Math.max(0, Number.isFinite(inch) ? Math.round(inch) : inVal));
    setFtVal(clampedFt); setInVal(clampedIn);
    setFtInput(String(clampedFt)); setInInput(String(clampedIn));
    const cm = Math.min(MAX_HEIGHT_CM, Math.max(MIN_HEIGHT_CM, ftInToCm(clampedFt, clampedIn)));
    setHeightCmState(cm); setHeightCmInput(String(cm));
  }

  async function handlePhotoPick(file: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Photo must be JPEG, PNG, or WebP"); return; }
    if (file.size > 4 * 1024 * 1024) { setError("Photo must be under 4 MB"); return; }
    setError(""); setPhotoUploading(true);
    setPhotoPreview(URL.createObjectURL(file));
    try {
      const id = await upload(file, GUARDS.customerPhoto);
      setPhotoFileId(id); setDirty(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Photo upload failed."); setPhotoPreview("");
    } finally { setPhotoUploading(false); }
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
    setError(""); setSaving(true);
    try {
      await updateProfile({
        customerId, name: fullName.trim(), initials, dateOfBirth: dob, gender: gender as string,
        heightCm, heightUnit, city: city.trim(), email: email.trim() || undefined, photoFileId: photoFileId ?? undefined,
      });
      setDirty(false); setToast("Profile updated"); setTimeout(() => setToast(""), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  }

  if (!customer) {
    return <div className="cx-loading"><div className="cx-typing"><span /><span /><span /></div></div>;
  }

  const heightHelper = heightUnit === "cm" ? `${cmToFtIn(heightCm).ft}ft ${cmToFtIn(heightCm).inch}in` : `${heightCm} cm`;

  return (
    <div style={{ minHeight: "100%", background: "#FFFFFF", fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* APP BAR */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "#FFFFFF", padding: "calc(env(safe-area-inset-top,0px) + 14px) 16px 14px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <button onClick={() => router.push("/c/me")} aria-label="Back" className="cx-press" style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", color: "#2A2522" }}>
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <h1 style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#2A2522", letterSpacing: "0.06em", margin: 0, marginRight: 28 }}>EDIT PROFILE</h1>
      </header>

      <div style={{ padding: "22px 18px 36px" }}>
        {/* Avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <label htmlFor="photo-input" style={{ position: "relative", width: 104, height: 104, cursor: "pointer" }}>
            <span style={{ display: "block", width: "100%", height: "100%", borderRadius: "50%", background: displayPhoto ? "#ECE3DA" : "#F4ECE3", overflow: "hidden", border: "6px solid #FBF3E8", boxShadow: "0 10px 26px rgba(110,38,43,0.12), 0 0 0 1px #F0E3D4", position: "relative" }}>
              {displayPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayPhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700, color: MAROON }}>{initials}</span>
              )}
              {photoUploading && (
                <span style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10 }}>Uploading…</span>
              )}
            </span>
            <span style={{ position: "absolute", bottom: -2, right: -2, width: 44, height: 44, borderRadius: "50%", background: "#FBF3E8", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(110,38,43,0.14)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/customer/profile/camera.svg" alt="Change photo" style={{ width: 24, height: 21 }} />
            </span>
            <input id="photo-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoPick(f); }} style={{ display: "none" }} />
          </label>
        </div>

        {error && (
          <div className="cx-shake" style={{ padding: "10px 14px", borderRadius: 10, background: "var(--cx-error-bg)", color: "var(--cx-error)", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{error}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={fullName} onChange={(e) => mark(setFullName)(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Phone number</label>
            <input style={{ ...inputStyle, color: "#9A8F8A", background: "#FAF7F5" }} value={maskedPhone} readOnly />
          </div>

          <div>
            <label style={labelStyle}>Date of Birth</label>
            <input type="date" style={inputStyle} value={dob} max={maxDob} onChange={(e) => mark(setDob)(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Gender</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {([["female", "Female"], ["male", "Male"], ["other", "Other"], ["prefer_not_to_say", "Prefer not to say"]] as const).map(([v, l]) => {
                const on = gender === v;
                return (
                  <button key={v} type="button" onClick={() => mark(setGender)(v)} className="cx-press"
                    style={{ height: 50, borderRadius: 12, border: on ? "none" : "1.5px solid rgba(104,38,42,0.16)", background: on ? MAROON : "#fff", color: on ? "#fff" : "#2A2522", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Height</label>
              <div style={{ display: "flex", background: "#F4ECE3", borderRadius: 99, padding: 3 }}>
                {(["cm", "ftin"] as const).map((u) => (
                  <button key={u} type="button" onClick={() => { setHeightUnit(u); setDirty(true); }}
                    style={{ padding: "5px 14px", borderRadius: 99, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: heightUnit === u ? MAROON : "transparent", color: heightUnit === u ? "#fff" : MAROON }}>
                    {u === "cm" ? "cm" : "ft/in"}
                  </button>
                ))}
              </div>
            </div>
            {heightUnit === "cm" ? (
              <input type="number" inputMode="numeric" min={MIN_HEIGHT_CM} max={MAX_HEIGHT_CM} value={heightCmInput} onChange={(e) => onHeightCmChange(e.target.value)} onBlur={onHeightCmBlur} style={inputStyle} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <input type="number" inputMode="numeric" min={3} max={7} value={ftInput} onChange={(e) => onFtInChange(e.target.value, inInput)} onBlur={onFtInBlur} style={{ ...inputStyle, paddingRight: 34 }} />
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9A8F8A" }}>ft</span>
                </div>
                <div style={{ position: "relative" }}>
                  <input type="number" inputMode="numeric" min={0} max={11} value={inInput} onChange={(e) => onFtInChange(ftInput, e.target.value)} onBlur={onFtInBlur} style={{ ...inputStyle, paddingRight: 34 }} />
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9A8F8A" }}>in</span>
                </div>
              </div>
            )}
            <div style={{ fontSize: 12, color: "#9A8F8A", marginTop: 6 }}>{heightHelper}</div>
          </div>

          <div>
            <label style={labelStyle}>City</label>
            <input style={inputStyle} value={city} onChange={(e) => mark(setCity)(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Email (optional)</label>
            <input type="email" style={inputStyle} value={email} placeholder="Required" onChange={(e) => mark(setEmail)(e.target.value)} />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving || !dirty || photoUploading} className="cx-press"
          style={{ width: "100%", marginTop: 26, height: 56, borderRadius: 14, border: "none", background: MAROON, color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: saving || !dirty ? "default" : "pointer", opacity: saving ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 22px rgba(110,38,43,0.26)" }}>
          {saving ? "Saving…" : dirty ? "Save Changes" : <>Saved <Check size={18} strokeWidth={2.6} /></>}
        </button>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", padding: "10px 18px", borderRadius: 100, background: MAROON, color: "#fff", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 50 }}>{toast}</div>
      )}
    </div>
  );
}
