"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUploadFile } from "@/lib/useUpload";
import { GUARDS } from "@/lib/uploadGuards";
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
import { Camera, Pencil, Loader2, ArrowLeft, ArrowRight } from "lucide-react";

type Step = "phone" | "otp" | "profile";
const STEPS: Step[] = ["phone", "otp", "profile"];

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

  useEffect(() => {
    const qp = searchParams.get("phone");
    if (qp) {
      const normalized = formatPhone(qp);
      if (isValidPhone(normalized)) setPhone(normalized);
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

  const submitOtp = useCallback(
    async (digits: string[]) => {
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
    },
    [phone, verifyOtp]
  );

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
      const id = await upload(file, GUARDS.customerPhoto);
      setPhotoFileId(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Photo upload failed. Try again.");
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
      localStorage.removeItem("wearify_auth_token");
      localStorage.removeItem("wearify_auth_user");
      setToken(login.token);
      setStoredUser({
        phone: fullPhone(phone),
        name: fullName.trim(),
        role: "customer",
        customerId: login.customerId as string,
      });
      router.replace("/c");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create account");
    } finally {
      setSaving(false);
    }
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--cx-ivory)",
        padding: "28px 18px 48px",
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
        color: "var(--cx-text)",
      }}
    >
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, justifyContent: "center" }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === stepIndex ? 28 : 16,
                height: 4,
                borderRadius: 2,
                background: i <= stepIndex ? "var(--cx-gold)" : "var(--cx-border)",
                transition: "all .3s var(--cx-ease)",
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <h1
            className="cx-serif"
            style={{ fontSize: 28, fontWeight: 700, fontStyle: "italic", color: "var(--cx-plum)", margin: 0, lineHeight: 1.2 }}
          >
            Create your Wearify account
          </h1>
          <p style={{ fontSize: 13, color: "var(--cx-text-muted)", marginTop: 8, lineHeight: 1.5 }}>
            {step === "phone" && "We'll send you a one-time code to verify your number."}
            {step === "otp" && `Enter the 6-digit code sent to +91 ${phone}`}
            {step === "profile" && "Tell us a bit about you so we can personalise your looks."}
          </p>
        </div>

        {error && (
          <div
            className="cx-shake"
            style={{
              padding: "10px 14px",
              borderRadius: "var(--cx-r-md)",
              background: "var(--cx-error-bg)",
              color: "var(--cx-error)",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* STEP 1: PHONE */}
        {step === "phone" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="cx-field">
              <label className="cx-label">Mobile Number</label>
              <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
                <div
                  style={{
                    background: "var(--cx-plum-ghost)",
                    color: "var(--cx-plum)",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "0 14px",
                    borderRadius: "var(--cx-r-md)",
                    border: "1.5px solid var(--cx-border)",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  value={phone}
                  onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }}
                  placeholder="9876543210"
                  className="cx-input cx-mono"
                  style={{ letterSpacing: ".06em" }}
                />
              </div>
            </div>
            <button onClick={handlePhoneNext} disabled={!phoneValid} className="cx-btn cx-btn-primary cx-btn-block cx-btn-lg">
              Send OTP <ArrowRight size={16} />
            </button>
            <p style={{ fontSize: 12, textAlign: "center", color: "var(--cx-text-muted)" }}>
              Already have an account?{" "}
              <button onClick={() => router.push("/c/login")} className="cx-link-btn">Log in</button>
            </p>
          </div>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  className={`cx-otp ${d ? "filled" : ""}`}
                />
              ))}
            </div>
            <p style={{ fontSize: 11, textAlign: "center", color: "var(--cx-text-muted)" }}>
              Demo OTP: <strong style={{ color: "var(--cx-gold-d)" }}>123456</strong>
            </p>
            <button
              onClick={() => submitOtp(otpDigits)}
              disabled={otpDigits.join("").length !== 6 || loading}
              className="cx-btn cx-btn-primary cx-btn-block cx-btn-lg"
            >
              {loading ? <><Loader2 size={16} className="cx-spin" /> Verifying…</> : "Verify"}
            </button>
            <button
              onClick={() => { setStep("phone"); setOtpDigits(["", "", "", "", "", ""]); setError(""); }}
              className="cx-btn cx-btn-ghost cx-btn-block"
            >
              <ArrowLeft size={14} /> Change mobile number
            </button>
          </div>
        )}

        {/* STEP 3: PROFILE */}
        {step === "profile" && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <label
                htmlFor="photo-input"
                style={{
                  position: "relative",
                  width: 112,
                  height: 112,
                  borderRadius: "50%",
                  background: photoPreview ? "transparent" : "var(--cx-grad-plum)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  border: "3px solid var(--cx-border-gold)",
                  boxShadow: "var(--cx-shadow-md)",
                }}
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span className="cx-serif" style={{ fontSize: 40, fontWeight: 700, color: "var(--cx-gold-l)", fontStyle: "italic" }}>
                    {initials}
                  </span>
                )}
                {photoUploading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    <Loader2 size={14} className="cx-spin" /> Uploading…
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--cx-gold)",
                    border: "2px solid var(--cx-ivory)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  {photoPreview ? <Pencil size={14} /> : <Camera size={14} />}
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
            <p style={{ textAlign: "center", fontSize: 11, color: "var(--cx-text-muted)", marginBottom: 22 }}>
              Photo optional — we&apos;ll show your initials otherwise
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Full Name *">
                <input className="cx-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ananya Mehta" />
              </Field>

              <Field label="Date of Birth *">
                <input type="date" className="cx-input" value={dob} max={maxDob} onChange={(e) => setDob(e.target.value)} />
                {dob && ageFromDob(dob) !== null && ageFromDob(dob)! >= MIN_AGE_YEARS && (
                  <div className="cx-field-help">Age: {ageFromDob(dob)}</div>
                )}
              </Field>

              <Field label="Gender *">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(
                    [
                      ["female", "Female"],
                      ["male", "Male"],
                      ["other", "Other"],
                      ["prefer_not_to_say", "Prefer not to say"],
                    ] as const
                  ).map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setGender(v)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--cx-r-md)",
                        border: gender === v ? "1.5px solid var(--cx-gold)" : "1.5px solid var(--cx-border)",
                        background: gender === v ? "var(--cx-gold-ghost)" : "var(--cx-white)",
                        color: gender === v ? "var(--cx-gold-d)" : "var(--cx-text)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s ease",
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </Field>

              <Field
                label="Height *"
                right={
                  <div style={{ display: "flex", background: "var(--cx-plum-ghost)", borderRadius: "var(--cx-r-pill)", padding: 2 }}>
                    {(["cm", "ftin"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setHeightUnit(u)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "var(--cx-r-pill)",
                          border: "none",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          background: heightUnit === u ? "var(--cx-grad-plum)" : "transparent",
                          color: heightUnit === u ? "var(--cx-on-dark)" : "var(--cx-plum)",
                          transition: "all .15s ease",
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
                    className="cx-input"
                  />
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        min={3}
                        max={7}
                        value={ftVal}
                        onChange={(e) => setHeightFromFtIn(Number(e.target.value), inVal)}
                        className="cx-input"
                        style={{ paddingRight: 30 }}
                      />
                      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--cx-text-muted)" }}>ft</span>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        type="number"
                        min={0}
                        max={11}
                        value={inVal}
                        onChange={(e) => setHeightFromFtIn(ftVal, Number(e.target.value))}
                        className="cx-input"
                        style={{ paddingRight: 30 }}
                      />
                      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--cx-text-muted)" }}>in</span>
                    </div>
                  </div>
                )}
                <div className="cx-field-help">
                  {heightUnit === "cm"
                    ? `${cmToFtIn(heightCm).ft} ft ${cmToFtIn(heightCm).inch} in`
                    : `${heightCm} cm`}
                </div>
              </Field>

              <Field label="City *">
                <input className="cx-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" />
              </Field>

              <Field label="Email (optional)">
                <input type="email" className="cx-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </Field>
            </div>

            <button
              onClick={handleFinish}
              disabled={saving || photoUploading}
              className="cx-btn cx-btn-primary cx-btn-block cx-btn-lg"
              style={{ marginTop: 22 }}
            >
              {saving ? <><Loader2 size={16} className="cx-spin" /> Creating account…</> : <>Finish & Enter Wearify <ArrowRight size={16} /></>}
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: "var(--cx-text-muted)", marginTop: 14, lineHeight: 1.5 }}>
              By finishing, you agree to our DPDP consent terms. You can edit any of these later.
            </p>
          </>
        )}
      </div>

    </div>
  );
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="cx-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <label className="cx-label" style={{ marginBottom: 0 }}>{label}</label>
        {right}
      </div>
      {children}
    </div>
  );
}
