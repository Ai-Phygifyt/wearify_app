"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUploadFile } from "@/lib/useUpload";
import { getToken, getStoredUser } from "@/lib/phoneAuth";
import { Id } from "@/convex/_generated/dataModel";

type Gender = "female" | "male" | "other" | "prefer_not_to_say";
type HeightUnit = "cm" | "ftin";

const MIN_HEIGHT_CM = 120;
const MAX_HEIGHT_CM = 220;
const MIN_AGE_YEARS = 13; // DPDP-aligned lower bound for self-managed accounts

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

export default function OnboardPage() {
  const router = useRouter();
  const completeProfile = useMutation(api.customers.completeProfile);
  const { upload } = useUploadFile();

  const [phone, setPhone] = useState<string>("");
  const [customerId, setCustomerId] = useState<Id<"customers"> | null>(null);

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
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Pull token/user/customer on mount
  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace("/c/login");
      return;
    }
    const stored = getStoredUser();
    if (stored?.customerId) {
      setCustomerId(stored.customerId as Id<"customers">);
    }
  }, [router]);

  // Validate session and derive phone + customerId authoritatively from server
  const session = useQuery(
    api.phoneAuth.validateSession,
    typeof window !== "undefined" && getToken() ? { token: getToken()! } : "skip"
  );
  const customer = useQuery(
    api.customers.getByPhone,
    session?.phone ? { phone: session.phone } : "skip"
  );

  // Hydrate fields from existing customer row (partial data may already exist from kiosk/tablet)
  useEffect(() => {
    if (!customer) return;
    setPhone(customer.phone);
    setCustomerId(customer._id);
    if (customer.profileComplete) {
      router.replace("/c");
      return;
    }
    if (customer.name && customer.name !== "Guest" && customer.name !== "Customer") {
      setFullName(customer.name);
    }
    if (customer.dateOfBirth) setDob(customer.dateOfBirth);
    if (customer.gender) setGender(customer.gender as Gender);
    if (typeof customer.heightCm === "number") {
      setHeightCmState(customer.heightCm);
      const ftIn = cmToFtIn(customer.heightCm);
      setFtVal(ftIn.ft);
      setInVal(ftIn.inch);
    }
    if (customer.heightUnit === "ftin") setHeightUnit("ftin");
    if (customer.city) setCity(customer.city);
    if (customer.email) setEmail(customer.email);
    if (customer.photoFileId) setPhotoFileId(customer.photoFileId);
  }, [customer, router]);

  const photoUrl = useQuery(
    api.files.getUrl,
    photoFileId && !photoPreview ? { fileId: photoFileId } : "skip"
  );

  const displayPhoto = photoPreview || photoUrl || "";

  const initials = useMemo(() => initialsOf(fullName || "U"), [fullName]);

  const maxDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - MIN_AGE_YEARS);
    return d.toISOString().split("T")[0];
  }, []);

  function setHeightCm(n: number) {
    const clamped = Math.min(MAX_HEIGHT_CM, Math.max(MIN_HEIGHT_CM, Math.round(n)));
    setHeightCmState(clamped);
    const ftIn = cmToFtIn(clamped);
    setFtVal(ftIn.ft);
    setInVal(ftIn.inch);
  }

  function setHeightFromFtIn(ft: number, inch: number) {
    setFtVal(ft);
    setInVal(inch);
    setHeightCmState(ftInToCm(ft, inch));
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
    } catch {
      setError("Photo upload failed. Please try again.");
      setPhotoPreview("");
    } finally {
      setPhotoUploading(false);
    }
  }

  function validate(): string {
    if (!fullName.trim() || fullName.trim().length < 2) return "Enter your full name";
    if (!dob) return "Select your date of birth";
    const age = ageFromDob(dob);
    if (age === null) return "Enter a valid date of birth";
    if (age < MIN_AGE_YEARS) return `You must be at least ${MIN_AGE_YEARS} years old`;
    if (age > 120) return "Enter a valid date of birth";
    if (!gender) return "Select a gender";
    if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
      return `Height must be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm`;
    }
    if (!city.trim()) return "Enter your city";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Enter a valid email (or leave blank)";
    }
    return "";
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }
    if (!customerId) { setError("Session lost. Please log in again."); return; }
    setError("");
    setSaving(true);
    try {
      await completeProfile({
        customerId,
        name: fullName.trim(),
        dateOfBirth: dob,
        gender: gender as string,
        heightCm,
        heightUnit,
        city: city.trim(),
        email: email.trim() || undefined,
        photoFileId: photoFileId ?? undefined,
      });
      router.replace("/c");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cx-shell" style={{ minHeight: "100svh", padding: "32px 20px 48px" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 className="cx-serif" style={{ fontSize: 30, fontWeight: 700, fontStyle: "italic", color: "var(--cx-plum)", margin: 0 }}>
            Complete your profile
          </h1>
          <p style={{ fontSize: 14, color: "var(--cx-text-muted)", marginTop: 6 }}>
            So we can tailor recommendations and save your try-on history to your account.
          </p>
          {phone && (
            <div className="cx-mono" style={{ fontSize: 12, color: "var(--cx-text-ghost)", marginTop: 4 }}>
              {phone}
            </div>
          )}
        </div>

        {/* Photo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <label
            htmlFor="photo-input"
            style={{
              position: "relative",
              width: 112, height: 112, borderRadius: "50%",
              background: displayPhoto ? "transparent" : "var(--cx-grad-plum)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden",
              border: "3px solid var(--cx-border-gold)",
              boxShadow: "var(--cx-shadow-md)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {displayPhoto ? (
              <img src={displayPhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span className="cx-serif" style={{ fontSize: 40, fontWeight: 700, color: "var(--cx-gold)", fontStyle: "italic" }}>
                {initials}
              </span>
            )}
            {photoUploading && (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 11, fontWeight: 600,
              }}>
                Uploading...
              </div>
            )}
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--cx-gold)", border: "2px solid var(--cx-ivory)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 14,
            }}>
              {displayPhoto ? "✎" : "+"}
            </div>
            <input
              id="photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoPick(f); }}
              style={{ display: "none" }}
            />
          </label>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--cx-text-muted)", marginTop: -12, marginBottom: 20 }}>
          Photo optional — we&apos;ll show your initials otherwise
        </p>

        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: "var(--cx-r-sm)",
            background: "var(--cx-error-bg)", color: "var(--cx-error)",
            fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Full Name *">
            <input
              className="cx-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ananya Mehta"
              style={inputStyle}
            />
          </Field>

          <Field label="Date of Birth *">
            <input
              type="date"
              value={dob}
              max={maxDob}
              onChange={(e) => setDob(e.target.value)}
              style={inputStyle}
            />
            {dob && ageFromDob(dob) !== null && ageFromDob(dob)! >= MIN_AGE_YEARS && (
              <div style={{ fontSize: 11, color: "var(--cx-text-muted)", marginTop: 4 }}>
                Age: {ageFromDob(dob)}
              </div>
            )}
          </Field>

          <Field label="Gender *">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {([
                ["female", "Female"],
                ["male", "Male"],
                ["other", "Other"],
                ["prefer_not_to_say", "Prefer not to say"],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setGender(val)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--cx-r-sm)",
                    border: gender === val ? "1.5px solid var(--cx-gold)" : "1.5px solid var(--cx-border)",
                    background: gender === val ? "var(--cx-gold-ghost)" : "white",
                    color: gender === val ? "var(--cx-gold-d)" : "var(--cx-text)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "center",
                    fontFamily: "inherit",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="Height *"
            right={
              <div style={{ display: "flex", background: "var(--cx-plum-ghost)", borderRadius: 100, padding: 2 }}>
                {(["cm", "ftin"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setHeightUnit(u)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 100,
                      border: "none",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: heightUnit === u ? "var(--cx-plum)" : "transparent",
                      color: heightUnit === u ? "white" : "var(--cx-plum)",
                      fontFamily: "inherit",
                    }}
                  >
                    {u === "cm" ? "cm" : "ft / in"}
                  </button>
                ))}
              </div>
            }
          >
            {heightUnit === "cm" ? (
              <input
                type="number"
                min={MIN_HEIGHT_CM}
                max={MAX_HEIGHT_CM}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                style={inputStyle}
              />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--cx-border)", borderRadius: "var(--cx-r-sm)", background: "white", overflow: "hidden" }}>
                  <input
                    type="number" min={3} max={7} value={ftVal}
                    onChange={(e) => setHeightFromFtIn(Number(e.target.value), inVal)}
                    style={{ ...inputStyle, border: "none", flex: 1 }}
                  />
                  <span style={{ paddingRight: 12, fontSize: 12, color: "var(--cx-text-muted)" }}>ft</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--cx-border)", borderRadius: "var(--cx-r-sm)", background: "white", overflow: "hidden" }}>
                  <input
                    type="number" min={0} max={11} value={inVal}
                    onChange={(e) => setHeightFromFtIn(ftVal, Number(e.target.value))}
                    style={{ ...inputStyle, border: "none", flex: 1 }}
                  />
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

          <Field label="City *">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              style={inputStyle}
            />
          </Field>

          <Field label="Email (optional)">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </Field>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || photoUploading}
          style={{
            width: "100%",
            marginTop: 24,
            padding: "14px 20px",
            borderRadius: "var(--cx-r-sm)",
            border: "none",
            background: "var(--cx-grad-plum)",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: saving || photoUploading ? "not-allowed" : "pointer",
            opacity: saving || photoUploading ? 0.6 : 1,
            boxShadow: "var(--cx-shadow-gold)",
            fontFamily: "inherit",
          }}
        >
          {saving ? "Saving..." : "Finish & Enter Wearify"}
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--cx-text-muted)", marginTop: 16 }}>
          By finishing, you agree to our DPDP consent terms. You can edit any of these later.
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "var(--cx-r-sm)",
  border: "1.5px solid var(--cx-border)",
  background: "white",
  fontSize: 14,
  color: "var(--cx-text)",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
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
