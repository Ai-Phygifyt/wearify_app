"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUploadFile } from "@/lib/useUpload";
import { setToken, setStoredUser, formatPhone, fullPhone, isValidPhone } from "@/lib/phoneAuth";
import {
  Gender,
  HeightUnit,
  MIN_HEIGHT_CM,
  MAX_HEIGHT_CM,
  MIN_AGE_YEARS,
  cmToFtIn,
  ftInToCm,
  clampHeightCm,
  ageFromDob,
  initialsOf,
  maxDobToday,
  validateProfile,
  validatePhoto,
} from "@/lib/profileHelpers";
import { Id } from "@/convex/_generated/dataModel";

type Step = "phone" | "otp" | "profile";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyOtp = useMutation(api.phoneAuth.verifyOtp);
  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const completeProfile = useMutation(api.customers.completeProfile);
  const { upload } = useUploadFile();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState<string>("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Profile
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
  const [saving, setSaving] = useState(false);

  // Pre-fill phone if passed via ?phone= (from /c/login no-account CTA)
  useEffect(() => {
    const qp = searchParams.get("phone");
    if (qp) {
      const normalized = formatPhone(qp);
      if (isValidPhone(normalized)) {
        setPhone(normalized);
      }
    }
  }, [searchParams]);

  const phoneValid = isValidPhone(phone);
  const initials = useMemo(() => initialsOf(fullName || "U"), [fullName]);
  const maxDob = useMemo(() => maxDobToday(), []);

  function handlePhoneNext() {
    if (!phoneValid) {
      setError("Enter a valid 10-digit mobile number starting with 6–9");
      return;
    }
    setError("");
    setStep("otp");
    setOtpDigits(["", "", "", "", "", ""]);
    setTimeout(() => otpRefs.current[0]?.focus(), 80);
  }

  const submitOtp = useCallback(async (digits: string[]) => {
    const otp = digits.join("");
    if (otp.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      const r = await verifyOtp({ phone: fullPhone(phone), otp });
      if (r.success) {
        setStep("profile");
      } else {
        setError(r.error || "Invalid OTP");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 80);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [phone, verifyOtp]);

  function handleOtpInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setError("");
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    if (digit) {
      const allFilled = next.every((d) => d !== "");
      if (allFilled) submitOtp(next);
    }
  }
  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const next = [...otpDigits];
      next[index - 1] = "";
      setOtpDigits(next);
      otpRefs.current[index - 1]?.focus();
    }
  }
  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const next = [...otpDigits];
    for (let i = 0; i < pasted.length && i < 6; i++) next[i] = pasted[i];
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) submitOtp(next);
  }

  function setHeightCm(n: number) {
    const clamped = clampHeightCm(n);
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
    const photoErr = validatePhoto(file);
    if (photoErr) { setError(photoErr); return; }
    setError("");
    setPhotoUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    try {
      const id = await upload(file);
      setPhotoFileId(id);
    } catch {
      setError("Photo upload failed. Try again.");
      setPhotoPreview("");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleFinish() {
    const err = validateProfile({ fullName, dob, gender, heightCm, city, email });
    if (err) { setError(err); return; }
    setError("");
    setSaving(true);
    try {
      // Create the customer + open session (allowCreate:true marks this as register intent)
      const login = await loginWithOtp({
        phone: fullPhone(phone),
        otp: otpDigits.join(""),
        role: "customer",
        name: fullName.trim(),
        allowCreate: true,
      });
      if (!login.success || !login.token || !login.customerId) {
        setError(login.error || "Could not create account. Try again.");
        setSaving(false);
        return;
      }
      // Save the rest of the profile
      await completeProfile({
        customerId: login.customerId as Id<"customers">,
        name: fullName.trim(),
        dateOfBirth: dob,
        gender: gender as string,
        heightCm,
        heightUnit,
        city: city.trim(),
        email: email.trim() || undefined,
        photoFileId: photoFileId ?? undefined,
      });
      // Persist auth to localStorage
      localStorage.removeItem("wearify_auth_token");
      localStorage.removeItem("wearify_auth_user");
      setToken(login.token);
      setStoredUser({
        phone: fullPhone(phone),
        name: fullName.trim(),
        role: "customer",
        customerId: login.customerId as string,
      });
      window.location.href = "/c";
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100svh", background: "#FDF8F0", padding: "28px 20px 48px" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, justifyContent: "center" }}>
          {(["phone", "otp", "profile"] as Step[]).map((s, i) => {
            const done = (["phone", "otp", "profile"] as Step[]).indexOf(step) >= i;
            return (
              <div key={s} style={{
                width: 32, height: 4, borderRadius: 2,
                background: done ? "#C9941A" : "#E8D5E0",
                transition: "background 0.3s",
              }} />
            );
          })}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 className="cx-serif" style={{ fontSize: 28, fontWeight: 700, fontStyle: "italic", color: "#2D1B4E", margin: 0 }}>
            Create your Wearify account
          </h1>
          <p style={{ fontSize: 13, color: "#8B7EA0", marginTop: 6 }}>
            {step === "phone" && "We'll send you a one-time code to verify your number."}
            {step === "otp" && `Enter the 6-digit code sent to +91 ${phone}`}
            {step === "profile" && "Tell us a bit about you so we can personalise your looks."}
          </p>
        </div>

        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: 10,
            background: "#FFEBEE", color: "#B71C1C",
            fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* STEP 1: PHONE */}
        {step === "phone" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Mobile Number">
              <div style={{ display: "flex", alignItems: "center", borderRadius: 10, border: "1.5px solid #E8D5E0", background: "white", overflow: "hidden" }}>
                <span className="cx-mono" style={{ padding: "12px 14px", fontSize: 14, color: "#8B7EA0", background: "#FBF0F4", borderRight: "1px solid #E8D5E0" }}>+91</span>
                <input
                  type="tel" inputMode="numeric" autoFocus
                  value={phone}
                  onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }}
                  placeholder="9876543210"
                  className="cx-mono"
                  style={{ flex: 1, padding: "12px 14px", border: "none", fontSize: 16, color: "#1A0A1E", outline: "none", fontFamily: "inherit" }}
                />
              </div>
            </Field>
            <button onClick={handlePhoneNext} disabled={!phoneValid}
              style={primaryBtn(!phoneValid)}>
              Send OTP
            </button>
            <p style={{ fontSize: 12, textAlign: "center", color: "#8B7EA0" }}>
              Already have an account?{" "}
              <button onClick={() => router.push("/c/login")} style={linkBtn}>
                Log in
              </button>
            </p>
          </div>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="tel" inputMode="numeric" maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={handleOtpPaste}
                  className="cx-mono"
                  style={{
                    width: 44, height: 52, borderRadius: 10,
                    border: `1.5px solid ${d ? "#C9941A" : "#E8D5E0"}`,
                    background: "white", textAlign: "center",
                    fontSize: 22, fontWeight: 700, color: "#1A0A1E",
                    outline: "none", fontFamily: "inherit",
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: 11, textAlign: "center", color: "#8B7EA0" }}>
              Demo OTP: <strong style={{ color: "#C9941A" }}>123456</strong>
            </p>
            <button onClick={() => submitOtp(otpDigits)} disabled={otpDigits.join("").length !== 6 || loading}
              style={primaryBtn(otpDigits.join("").length !== 6 || loading)}>
              {loading ? "Verifying…" : "Verify"}
            </button>
            <button
              onClick={() => { setStep("phone"); setOtpDigits(["", "", "", "", "", ""]); setError(""); }}
              style={linkBtn}
            >
              Change mobile number
            </button>
          </div>
        )}

        {/* STEP 3: PROFILE */}
        {step === "profile" && (
          <>
            {/* Photo */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <label htmlFor="photo-input"
                style={{
                  position: "relative", width: 112, height: 112, borderRadius: "50%",
                  background: (photoPreview) ? "transparent" : "linear-gradient(135deg, #2D1B4E 0%, #4A2D6E 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", overflow: "hidden",
                  border: "3px solid #DFC07A", boxShadow: "0 6px 24px rgba(45,27,78,.14)",
                }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span className="cx-serif" style={{ fontSize: 40, fontWeight: 700, color: "#C9941A", fontStyle: "italic" }}>
                    {initials}
                  </span>
                )}
                {photoUploading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 600 }}>
                    Uploading…
                  </div>
                )}
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#C9941A", border: "2px solid #FDF8F0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 14,
                }}>{photoPreview ? "✎" : "+"}</div>
                <input id="photo-input" type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoPick(f); }}
                  style={{ display: "none" }} />
              </label>
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: "#8B7EA0", marginTop: -12, marginBottom: 20 }}>
              Photo optional — we&apos;ll show your initials otherwise
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Full Name *">
                <input style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ananya Mehta" />
              </Field>

              <Field label="Date of Birth *">
                <input type="date" style={inputStyle} value={dob} max={maxDob} onChange={(e) => setDob(e.target.value)} />
                {dob && ageFromDob(dob) !== null && ageFromDob(dob)! >= MIN_AGE_YEARS && (
                  <div style={{ fontSize: 11, color: "#8B7EA0", marginTop: 4 }}>Age: {ageFromDob(dob)}</div>
                )}
              </Field>

              <Field label="Gender *">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {([["female","Female"],["male","Male"],["other","Other"],["prefer_not_to_say","Prefer not to say"]] as const).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setGender(v)}
                      style={{
                        padding: "10px 12px", borderRadius: 10,
                        border: gender === v ? "1.5px solid #C9941A" : "1.5px solid #E8D5E0",
                        background: gender === v ? "#FDF5E4" : "white",
                        color: gender === v ? "#8B6914" : "#1A0A1E",
                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      }}>{l}</button>
                  ))}
                </div>
              </Field>

              <Field label="Height *" right={
                <div style={{ display: "flex", background: "#F4EFF9", borderRadius: 100, padding: 2 }}>
                  {(["cm","ftin"] as const).map((u) => (
                    <button key={u} type="button" onClick={() => setHeightUnit(u)}
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
                    <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E8D5E0", borderRadius: 10, background: "white", overflow: "hidden" }}>
                      <input type="number" min={3} max={7} value={ftVal}
                        onChange={(e) => setHeightFromFtIn(Number(e.target.value), inVal)}
                        style={{ ...inputStyle, border: "none", flex: 1 }} />
                      <span style={{ paddingRight: 12, fontSize: 12, color: "#8B7EA0" }}>ft</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E8D5E0", borderRadius: 10, background: "white", overflow: "hidden" }}>
                      <input type="number" min={0} max={11} value={inVal}
                        onChange={(e) => setHeightFromFtIn(ftVal, Number(e.target.value))}
                        style={{ ...inputStyle, border: "none", flex: 1 }} />
                      <span style={{ paddingRight: 12, fontSize: 12, color: "#8B7EA0" }}>in</span>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 11, color: "#8B7EA0", marginTop: 4 }}>
                  {heightUnit === "cm"
                    ? `${cmToFtIn(heightCm).ft} ft ${cmToFtIn(heightCm).inch} in`
                    : `${heightCm} cm`}
                </div>
              </Field>

              <Field label="City *">
                <input style={inputStyle} value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" />
              </Field>

              <Field label="Email (optional)">
                <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </Field>
            </div>

            <button onClick={handleFinish} disabled={saving || photoUploading}
              style={{ ...primaryBtn(saving || photoUploading), marginTop: 24 }}>
              {saving ? "Creating account…" : "Finish & Enter Wearify"}
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "#8B7EA0", marginTop: 16 }}>
              By finishing, you agree to our DPDP consent terms. You can edit any of these later.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1.5px solid #E8D5E0", background: "white",
  fontSize: 14, color: "#1A0A1E", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

const linkBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  color: "#2D1B4E", fontWeight: 700, textDecoration: "underline",
  fontFamily: "inherit", fontSize: 13,
};

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "14px 20px", borderRadius: 10, border: "none",
    background: "linear-gradient(135deg, #2D1B4E 0%, #4A2D6E 100%)",
    color: "white", fontSize: 15, fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    boxShadow: "0 4px 20px rgba(201,148,26,.28)",
    fontFamily: "inherit",
  };
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#1A0A1E" }}>{label}</label>
        {right}
      </div>
      {children}
    </div>
  );
}
