"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { setToken, setStoredUser, formatPhone, fullPhone, isValidPhone } from "@/lib/phoneAuth";
import { ageFromDob, MIN_AGE_YEARS, maxDobToday } from "@/lib/profileHelpers";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowRight, Calendar, Loader2 } from "lucide-react";

type Step = "phone" | "otp" | "details";

const MAROON = "#6E262B";
const PINK_GLOWS =
  "radial-gradient(150% 95% at 100% 0%, rgba(240,158,146,0.78) 0%, rgba(244,180,170,0.45) 30%, rgba(248,212,205,0.18) 52%, rgba(255,255,255,0) 72%)," +
  "radial-gradient(150% 95% at 0% 100%, rgba(241,162,150,0.74) 0%, rgba(244,184,174,0.42) 30%, rgba(248,212,205,0.16) 52%, rgba(255,255,255,0) 72%)";

// Body-scan in the kiosk captures real sizing; we default height here so the
// minimal sign-up (name + DOB) satisfies completeProfile's 50–250cm guard.
// gender/city stay blank and are editable later in the customer's profile.
const DEFAULT_HEIGHT_CM = 160;

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#9A8F8A",
  marginBottom: 9,
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  height: 54,
  border: "1.5px solid rgba(104,38,42,0.14)",
  borderRadius: 12,
  background: "#FFFFFF",
  padding: "0 16px",
  fontSize: 16.5,
  fontWeight: 500,
  letterSpacing: "0.02em",
  fontFamily: "inherit",
  color: "#2A2522",
  outline: "none",
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyOtp = useMutation(api.phoneAuth.verifyOtp);
  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const completeProfile = useMutation(api.customers.completeProfile);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState<string>("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const qp = searchParams.get("phone");
    if (qp) {
      const normalized = formatPhone(qp);
      if (isValidPhone(normalized)) setPhone(normalized);
    }
  }, [searchParams]);

  const phoneValid = isValidPhone(phone);
  const maxDob = useMemo(() => maxDobToday(), []);
  const dobDisplay = useMemo(() => {
    if (!dob) return "";
    const [y, m, d] = dob.split("-");
    return `${d} - ${m} - ${y}`;
  }, [dob]);

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
          setStep("details");
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
    if (digit && next.every((d) => d !== "")) submitOtp(next);
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
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) submitOtp(next);
  }

  async function handleFinish() {
    const name = fullName.trim();
    if (name.length < 2) { setError("Enter your full name"); return; }
    if (!dob) { setError("Select your date of birth"); return; }
    const age = ageFromDob(dob);
    if (age === null) { setError("Enter a valid date of birth"); return; }
    if (age < MIN_AGE_YEARS) { setError(`You must be at least ${MIN_AGE_YEARS} years old`); return; }
    if (age > 120) { setError("Enter a valid date of birth"); return; }

    setError("");
    setSaving(true);
    try {
      const login = await loginWithOtp({
        phone: fullPhone(phone),
        otp: otpDigits.join(""),
        role: "customer",
        name,
        allowCreate: true,
      });
      if (!login.success || !login.token || !login.customerId) {
        setError(login.error || "Could not create account. Try again.");
        setSaving(false);
        return;
      }
      await completeProfile({
        customerId: login.customerId as Id<"customers">,
        name,
        dateOfBirth: dob,
        gender: "",
        heightCm: DEFAULT_HEIGHT_CM,
        heightUnit: "cm",
        city: "",
      });
      localStorage.removeItem("wearify_auth_token");
      localStorage.removeItem("wearify_auth_user");
      setToken(login.token);
      setStoredUser({
        phone: fullPhone(phone),
        name,
        role: "customer",
        customerId: login.customerId as string,
      });
      router.replace("/c");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create account");
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100svh",
        width: "100%",
        overflow: "hidden",
        background: "#FFFFFF",
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: PINK_GLOWS }} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 22px",
        }}
      >
        {/* Logo + tagline */}
        <div
          className={mounted ? "cx-pageIn" : ""}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26, opacity: mounted ? undefined : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/customer/login/logo.svg" alt="Wearify" style={{ width: "min(40vw, 150px)", height: "auto", display: "block" }} />
          <p style={{ color: "#C0857F", fontSize: 14, marginTop: -4, fontWeight: 500 }}>
            Your AI - Powered Saree Experience
          </p>
        </div>

        {/* Card */}
        <div
          className={mounted ? "cx-slideUp cx-d2" : ""}
          style={{
            width: "100%",
            background: "#FFFFFF",
            borderRadius: 22,
            padding: "26px 22px 24px",
            boxShadow: "0 12px 40px rgba(104,38,42,0.10), 0 2px 8px rgba(0,0,0,0.04)",
            opacity: mounted ? undefined : 0,
          }}
        >
          {/* STEP: PHONE */}
          {step === "phone" && (
            <div className="cx-fadeIn">
              <h2 style={{ fontSize: 23, fontWeight: 700, color: "#2A2522", margin: "0 0 4px", textAlign: "center" }}>
                Register
              </h2>
              <p style={{ fontSize: 14, color: "#9A8F8A", margin: "0 0 22px", textAlign: "center" }}>
                Sign up with your mobile number
              </p>

              <label style={labelStyle}>Mobile Number</label>
              <div style={{ display: "flex", alignItems: "stretch", gap: 10, marginBottom: 20 }}>
                <div
                  style={{
                    height: 54,
                    minWidth: 58,
                    color: "#2A2522",
                    fontSize: 16.5,
                    fontWeight: 700,
                    borderRadius: 12,
                    border: "1.5px solid rgba(104,38,42,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }}
                  placeholder="+91- 7895XXXX85"
                  style={fieldStyle}
                />
              </div>

              {error && (
                <p className="cx-shake" style={{ fontSize: 12, color: "var(--cx-error)", margin: "0 0 12px", textAlign: "center" }}>{error}</p>
              )}

              <PrimaryButton onClick={handlePhoneNext} disabled={!phoneValid}>
                Send OTP <ArrowRight size={18} strokeWidth={2.4} />
              </PrimaryButton>

              <BottomLink router={router} />
            </div>
          )}

          {/* STEP: OTP */}
          {step === "otp" && (
            <div className="cx-fadeIn">
              <h2 style={{ fontSize: 23, fontWeight: 700, color: "#2A2522", margin: "0 0 4px" }}>Verify OTP</h2>
              <p style={{ fontSize: 14, color: "#9A8F8A", margin: "0 0 22px" }}>
                Sent to +91-{phone.replace(/\s/g, "")}
              </p>

              <label style={labelStyle}>Enter OTP</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 22 }}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    disabled={loading}
                    style={{
                      width: "100%",
                      height: 52,
                      textAlign: "center",
                      fontSize: 20,
                      fontWeight: 700,
                      fontFamily: "inherit",
                      color: "#2A2522",
                      border: `1.5px solid ${d ? MAROON : "rgba(104,38,42,0.14)"}`,
                      borderRadius: 12,
                      background: "#FFFFFF",
                      outline: "none",
                      padding: 0,
                    }}
                  />
                ))}
              </div>

              {error && (
                <p className="cx-shake" style={{ fontSize: 12, color: "var(--cx-error)", margin: "0 0 12px", textAlign: "center" }}>{error}</p>
              )}

              <PrimaryButton onClick={() => submitOtp(otpDigits)} disabled={otpDigits.join("").length !== 6 || loading}>
                {loading ? <><Loader2 size={16} className="cx-spin" /> Verifying…</> : <>Verify OTP <ArrowRight size={18} strokeWidth={2.4} /></>}
              </PrimaryButton>

              <div style={{ textAlign: "center", marginTop: 14 }}>
                <button
                  onClick={() => { setOtpDigits(["", "", "", "", "", ""]); setError(""); setTimeout(() => otpRefs.current[0]?.focus(), 80); }}
                  style={{ background: "none", border: "none", color: MAROON, fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, fontFamily: "inherit" }}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* STEP: DETAILS (name + DOB) */}
          {step === "details" && (
            <div className="cx-fadeIn">
              <h2 style={{ fontSize: 23, fontWeight: 700, color: "#2A2522", margin: "0 0 22px", textAlign: "center" }}>
                Register
              </h2>

              <label style={labelStyle}>Full Name</label>
              <input
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(""); }}
                placeholder="e.g. Shalini Gupta"
                style={{ ...fieldStyle, marginBottom: 18 }}
              />

              <label style={labelStyle}>Date Of Birth</label>
              <div style={{ position: "relative", marginBottom: 24 }}>
                <div
                  style={{
                    ...fieldStyle,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: dob ? "#2A2522" : "#B5ABA6", fontSize: 16.5, fontWeight: 500, letterSpacing: "0.02em" }}>
                    {dobDisplay || "DD - MM - YYYY"}
                  </span>
                  <Calendar size={18} color={MAROON} strokeWidth={2} />
                </div>
                {/* Transparent native picker overlaid on top — taps anywhere on
                    the field open the OS date picker on every mobile browser. */}
                <input
                  type="date"
                  max={maxDob}
                  value={dob}
                  onChange={(e) => { setDob(e.target.value); setError(""); }}
                  aria-label="Date of birth"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, border: "none", cursor: "pointer" }}
                />
              </div>

              {error && (
                <p className="cx-shake" style={{ fontSize: 12, color: "var(--cx-error)", margin: "0 0 12px", textAlign: "center" }}>{error}</p>
              )}

              <PrimaryButton onClick={handleFinish} disabled={saving}>
                {saving ? <><Loader2 size={16} className="cx-spin" /> Creating account…</> : <>Register <ArrowRight size={18} strokeWidth={2.4} /></>}
              </PrimaryButton>

              <BottomLink router={router} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="cx-press"
      style={{
        width: "100%",
        height: 56,
        border: "none",
        borderRadius: 999,
        background: MAROON,
        color: "#fff",
        fontFamily: "inherit",
        fontSize: 16,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        boxShadow: "0 8px 22px rgba(110,38,43,0.28)",
        transition: "opacity .2s",
      }}
    >
      {children}
    </button>
  );
}

function BottomLink({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div style={{ textAlign: "center", marginTop: 16 }}>
      <span style={{ fontSize: 13, color: "#9A8F8A" }}>Already have an account? </span>
      <button
        onClick={() => router.push("/c/login")}
        style={{ background: "none", border: "none", color: MAROON, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
      >
        Login
      </button>
    </div>
  );
}
