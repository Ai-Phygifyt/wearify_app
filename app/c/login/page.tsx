"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  setToken,
  setStoredUser,
  formatPhone,
  fullPhone,
  isValidPhone,
} from "@/lib/phoneAuth";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

type Step = "phone" | "otp";

const MAROON = "#6E262B";
const PINK_GLOWS =
  "radial-gradient(150% 95% at 100% 0%, rgba(240,158,146,0.78) 0%, rgba(244,180,170,0.45) 30%, rgba(248,212,205,0.18) 52%, rgba(255,255,255,0) 72%)," +
  "radial-gradient(150% 95% at 0% 100%, rgba(241,162,150,0.74) 0%, rgba(244,184,174,0.42) 30%, rgba(248,212,205,0.16) 52%, rgba(255,255,255,0) 72%)";

export default function CustomerLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [noAccount, setNoAccount] = useState(false);
  const [mounted, setMounted] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);

  const phoneDigits = formatPhone(phone);
  const phoneValid = isValidPhone(phoneDigits);

  useEffect(() => { setMounted(true); }, []);

  function handlePhoneChange(val: string) {
    setPhone(formatPhone(val));
    setError("");
  }

  function handleSendOtp() {
    if (!phoneValid) {
      setError("Enter a valid 10-digit mobile number starting with 6-9");
      return;
    }
    setStep("otp");
    setOtpDigits(["", "", "", "", "", ""]);
    setError("");
    setTimeout(() => otpRefs.current[0]?.focus(), 80);
  }

  const submitOtp = useCallback(
    async (digits: string[]) => {
      const otp = digits.join("");
      if (otp.length !== 6) return;
      setLoading(true);
      setError("");
      setNoAccount(false);
      try {
        const result = await loginWithOtp({
          phone: fullPhone(phoneDigits),
          otp,
          role: "customer",
        });
        if (result.success && result.token) {
          localStorage.removeItem("wearify_auth_token");
          localStorage.removeItem("wearify_auth_user");
          setToken(result.token);
          setStoredUser({
            phone: fullPhone(phoneDigits),
            name: "",
            role: "customer",
            customerId: result.customerId as string,
          });
          router.replace("/c");
        } else if (result.errorCode === "NO_ACCOUNT") {
          setNoAccount(true);
          setOtpDigits(["", "", "", "", "", ""]);
        } else {
          setError(result.error || "Invalid OTP");
          setOtpDigits(["", "", "", "", "", ""]);
          setTimeout(() => otpRefs.current[0]?.focus(), 80);
        }
      } catch {
        setError("Something went wrong. Please try again.");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 80);
      }
      setLoading(false);
    },
    [loginWithOtp, phoneDigits, router]
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

  const fieldStyle: React.CSSProperties = {
    flex: 1,
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
      {/* Soft coral-pink glows — top-right + bottom-left */}
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
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 26,
            opacity: mounted ? undefined : 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/customer/login/logo.svg"
            alt="Wearify"
            style={{ width: "min(40vw, 150px)", height: "auto", display: "block" }}
          />
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
            position: "relative",
            opacity: mounted ? undefined : 0,
          }}
        >
          {step === "phone" && (
            <div className="cx-fadeIn">
              <h2 style={{ fontSize: 23, fontWeight: 700, color: "#2A2522", margin: "0 0 4px" }}>
                Welcome Back
              </h2>
              <p style={{ fontSize: 14, color: "#9A8F8A", margin: "0 0 22px" }}>
                Login with your mobile number
              </p>

              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#9A8F8A",
                  marginBottom: 9,
                }}
              >
                Mobile Number
              </label>
              <div style={{ display: "flex", alignItems: "stretch", gap: 10, marginBottom: 20 }}>
                <div
                  style={{
                    height: 54,
                    minWidth: 58,
                    background: "#FFFFFF",
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
                  maxLength={10}
                  placeholder="+91- 7895XXXX85"
                  value={phoneDigits}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  style={fieldStyle}
                />
              </div>

              {error && (
                <p className="cx-shake" style={{ fontSize: 12, color: "var(--cx-error)", margin: "0 0 12px", textAlign: "center" }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={!phoneValid}
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
                  cursor: phoneValid ? "pointer" : "not-allowed",
                  opacity: phoneValid ? 1 : 0.55,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  boxShadow: "0 8px 22px rgba(110,38,43,0.28)",
                  transition: "opacity .2s",
                }}
              >
                Send OTP <ArrowRight size={18} strokeWidth={2.4} />
              </button>

              <div style={{ textAlign: "center", marginTop: 18 }}>
                <span style={{ fontSize: 13, color: "#9A8F8A" }}>New user? </span>
                <button
                  onClick={() => router.push(`/c/register${phoneDigits ? `?phone=${phoneDigits}` : ""}`)}
                  style={{
                    background: "none",
                    border: "none",
                    color: MAROON,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Register
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="cx-fadeIn">
              <h2 style={{ fontSize: 23, fontWeight: 700, color: "#2A2522", margin: "0 0 4px" }}>
                Verify OTP
              </h2>
              <p style={{ fontSize: 14, color: "#9A8F8A", margin: "0 0 22px" }}>
                Sent to +91-{phoneDigits.replace(/\s/g, "")}
              </p>

              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#9A8F8A",
                  marginBottom: 11,
                }}
              >
                Enter OTP
              </label>

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

              {error && !noAccount && (
                <p className="cx-shake" style={{ fontSize: 12, color: "var(--cx-error)", margin: "0 0 12px", textAlign: "center" }}>
                  {error}
                </p>
              )}

              {noAccount && (
                <div
                  style={{
                    padding: "14px",
                    borderRadius: 14,
                    background: "rgba(244,180,170,0.16)",
                    border: "1px solid rgba(110,38,43,0.18)",
                    marginBottom: 14,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2A2522", marginBottom: 4 }}>
                    No account found
                  </div>
                  <div style={{ fontSize: 12, color: "#6B5E5A", marginBottom: 12, lineHeight: 1.5 }}>
                    We couldn&apos;t find a Wearify account for +91 {phoneDigits}. Create one in under a minute.
                  </div>
                  <button
                    onClick={() => router.push(`/c/register?phone=${phoneDigits}`)}
                    className="cx-press"
                    style={{
                      width: "100%",
                      height: 48,
                      border: "none",
                      borderRadius: 999,
                      background: MAROON,
                      color: "#fff",
                      fontFamily: "inherit",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Register as new user
                  </button>
                  <button
                    onClick={() => {
                      setNoAccount(false);
                      setStep("phone");
                      setOtpDigits(["", "", "", "", "", ""]);
                    }}
                    style={{
                      marginTop: 10,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: MAROON,
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                      fontFamily: "inherit",
                    }}
                  >
                    Try a different number
                  </button>
                </div>
              )}

              {loading && (
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div className="cx-typing" style={{ display: "inline-flex", gap: 3 }}>
                    <span /><span /><span />
                  </div>
                  <p style={{ fontSize: 12, color: "#9A8F8A", marginTop: 6 }}>Verifying...</p>
                </div>
              )}

              {!loading && !noAccount && (
                <button
                  onClick={() => submitOtp(otpDigits)}
                  disabled={otpDigits.some((d) => !d)}
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
                    cursor: otpDigits.some((d) => !d) ? "not-allowed" : "pointer",
                    opacity: otpDigits.some((d) => !d) ? 0.55 : 1,
                    marginBottom: 14,
                    boxShadow: "0 8px 22px rgba(110,38,43,0.28)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 9,
                  }}
                >
                  Verify OTP <ArrowRight size={18} strokeWidth={2.4} />
                </button>
              )}

              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => {
                    setOtpDigits(["", "", "", "", "", ""]);
                    setError("");
                    setTimeout(() => otpRefs.current[0]?.focus(), 80);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: MAROON,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                    fontFamily: "inherit",
                  }}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
