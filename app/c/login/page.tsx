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

/* ── Steps ──────────────────────────────────────────────────────────── */
type Step = "phone" | "otp";

/* ── Floating Orb ───────────────────────────────────────────────────── */
function Orb({
  size,
  top,
  left,
  delay,
  opacity,
}: {
  size: number;
  top: string;
  left: string;
  delay: string;
  opacity: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        top,
        left,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(201,148,26,.35) 0%, rgba(201,148,26,.08) 55%, transparent 75%)",
        opacity,
        animation: `cx-float 4.5s ease-in-out infinite`,
        animationDelay: delay,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

export default function CustomerLoginPage() {
  const router = useRouter();

  /* ── Auth state ──────────────────────────────────────────────────── */
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── Convex mutations ───────────────────────────────────────────── */
  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const loginWithPassword = useMutation(api.phoneAuth.loginWithPassword);
  const register = useMutation(api.phoneAuth.register);

  // Keep these accessible for potential future use
  void loginWithPassword;
  void register;

  const phoneDigits = formatPhone(phone);
  const phoneValid = isValidPhone(phoneDigits);

  /* ── Handlers ───────────────────────────────────────────────────── */
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
    // Focus first OTP input after render
    setTimeout(() => otpRefs.current[0]?.focus(), 80);
  }

  const submitOtp = useCallback(
    async (digits: string[]) => {
      const otp = digits.join("");
      if (otp.length !== 6) return;
      setLoading(true);
      setError("");
      try {
        const result = await loginWithOtp({
          phone: fullPhone(phoneDigits),
          otp,
          role: "customer",
          name: "Customer",
        });
        if (result.success && result.token) {
          // Clear any stale data first, then set fresh token
          localStorage.removeItem("wearify_auth_token");
          localStorage.removeItem("wearify_auth_user");
          setToken(result.token);
          setStoredUser({
            phone: fullPhone(phoneDigits),
            name: result.customerId ? "Customer" : "Customer",
            role: "customer",
            customerId: result.customerId as string,
          });
          // Use window.location for a clean navigation (avoids stale state)
          window.location.href = "/c";
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

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (digit && index === 5) {
      const allFilled = next.every((d) => d !== "");
      if (allFilled) {
        submitOtp(next);
      }
    } else if (digit) {
      // Check if all are filled after this input
      const allFilled = next.every((d) => d !== "");
      if (allFilled) {
        submitOtp(next);
      }
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
    for (let i = 0; i < pasted.length && i < 6; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) {
      submitOtp(next);
    }
  }

  /* ── Mounted animation ──────────────────────────────────────────── */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div
      style={{
        minHeight: "100svh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background:
          "linear-gradient(155deg, #0D0418 0%, #1A0A2E 25%, #2D1B4E 55%, #6B1D52 80%, #C9941A 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* ── Paisley + Noise overlays ─────────────────────────────────── */}
      <div
        className="cx-paisley cx-noise"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Floating gold orbs ───────────────────────────────────────── */}
      <Orb size={180} top="5%" left="-8%" delay="0s" opacity={0.5} />
      <Orb size={100} top="18%" left="78%" delay="1.2s" opacity={0.35} />
      <Orb size={130} top="55%" left="85%" delay="0.6s" opacity={0.3} />
      <Orb size={80} top="72%" left="-5%" delay="1.8s" opacity={0.25} />
      <Orb size={60} top="40%" left="60%" delay="2.4s" opacity={0.2} />

      {/* ── Content container ────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 20px",
          flex: 1,
        }}
      >
        {/* ── Logo Section ───────────────────────────────────────────── */}
        <div
          className={mounted ? "cx-pageIn" : ""}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "max(8svh, 48px)",
            marginBottom: 32,
            opacity: mounted ? undefined : 0,
          }}
        >
          {/* Lotus in gold-bordered circle with wave-ring */}
          <div
            style={{
              position: "relative",
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            {/* Wave ring animation */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid rgba(201,148,26,.35)",
                animation: "cx-waveRing 2.8s ease-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid rgba(201,148,26,.25)",
                animation: "cx-waveRing 2.8s ease-out infinite",
                animationDelay: "0.9s",
              }}
            />
            {/* Gold circle with lotus */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                border: "2px solid #C9941A",
                background: "rgba(201,148,26,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                position: "relative",
                zIndex: 1,
              }}
            >
              <span role="img" aria-label="lotus">
                🪷
              </span>
            </div>
          </div>

          {/* Brand name */}
          <h1
            className="cx-serif cx-gold-shimmer"
            style={{
              fontSize: 32,
              fontStyle: "italic",
              fontWeight: 600,
              margin: 0,
              letterSpacing: 1,
              lineHeight: 1.2,
            }}
          >
            Wearify
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "rgba(253,248,240,.55)",
              fontSize: 13,
              fontWeight: 400,
              marginTop: 6,
              letterSpacing: 0.5,
            }}
          >
            Your AI-powered saree experience
          </p>
        </div>

        {/* ── Card ───────────────────────────────────────────────────── */}
        <div
          className={`cx-noise ${mounted ? "cx-slideUp cx-d2" : ""}`}
          style={{
            width: "100%",
            background: "rgba(253,248,240,.97)",
            borderRadius: 20,
            padding: "28px 24px 24px",
            boxShadow: "0 16px 56px rgba(45,27,78,.22), 0 2px 14px rgba(45,27,78,.09)",
            position: "relative",
            overflow: "hidden",
            opacity: mounted ? undefined : 0,
          }}
        >
          {step === "phone" && (
            <div className="cx-fadeIn">
              {/* Heading */}
              <h2
                className="cx-serif"
                style={{
                  fontSize: 22,
                  fontStyle: "italic",
                  fontWeight: 600,
                  color: "#1A0A1E",
                  margin: "0 0 4px 0",
                }}
              >
                Welcome back
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "#8B7EA0",
                  margin: "0 0 22px 0",
                }}
              >
                Sign in with your mobile number
              </p>

              {/* Phone input row */}
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#8B7EA0",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 8,
                }}
              >
                Mobile Number
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 18,
                }}
              >
                {/* +91 prefix tag */}
                <div
                  style={{
                    background: "rgba(45,27,78,.07)",
                    color: "#2D1B4E",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #E8D5E0",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phoneDigits}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  style={{
                    flex: 1,
                    background: "#FDF8F0",
                    border: "1.5px solid #E8D5E0",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#1A0A1E",
                    outline: "none",
                    transition: "border-color .2s",
                    letterSpacing: 1.2,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#C9941A")}
                  onBlur={(e) => (e.target.style.borderColor = "#E8D5E0")}
                />
              </div>

              {/* Error */}
              {error && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#B71C1C",
                    margin: "0 0 12px 0",
                    textAlign: "center",
                  }}
                >
                  {error}
                </p>
              )}

              {/* Send OTP button */}
              <button
                className="cx-press cx-silk"
                onClick={handleSendOtp}
                disabled={!phoneValid}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 100,
                  border: "none",
                  background: phoneValid
                    ? "linear-gradient(135deg, #2D1B4E 0%, #4A2D6E 100%)"
                    : "rgba(45,27,78,.18)",
                  color: phoneValid ? "#FDF8F0" : "#8B7EA0",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: phoneValid ? "pointer" : "not-allowed",
                  transition: "all .25s",
                  letterSpacing: 0.5,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                Send OTP &nbsp;&rarr;
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="cx-fadeIn">
              {/* Back + heading */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <button
                  onClick={() => {
                    setStep("phone");
                    setError("");
                    setOtpDigits(["", "", "", "", "", ""]);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    color: "#4A2D6E",
                    padding: "4px 2px",
                    lineHeight: 1,
                  }}
                  aria-label="Go back"
                >
                  &larr;
                </button>
                <h2
                  className="cx-serif"
                  style={{
                    fontSize: 22,
                    fontStyle: "italic",
                    fontWeight: 600,
                    color: "#1A0A1E",
                    margin: 0,
                  }}
                >
                  Verify OTP
                </h2>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#8B7EA0",
                  margin: "0 0 24px 0",
                }}
              >
                Sent to +91 {phoneDigits}
              </p>

              {/* 6 individual digit inputs */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 18,
                }}
              >
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    disabled={loading}
                    className="cx-mono"
                    style={{
                      width: 44,
                      height: 54,
                      textAlign: "center",
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#1A0A1E",
                      background: d ? "#FDF5E4" : "#FDF8F0",
                      border: `2px solid ${d ? "#C9941A" : "#E8D5E0"}`,
                      borderRadius: 12,
                      outline: "none",
                      transition: "all .2s",
                      caretColor: "#C9941A",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#C9941A";
                      e.target.style.boxShadow = "0 0 0 3px rgba(201,148,26,.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = d ? "#C9941A" : "#E8D5E0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#B71C1C",
                    margin: "0 0 12px 0",
                    textAlign: "center",
                  }}
                >
                  {error}
                </p>
              )}

              {/* Loading state */}
              {loading && (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  <div className="cx-typing" style={{ display: "inline-flex", gap: 3 }}>
                    <span /><span /><span />
                  </div>
                  <p style={{ fontSize: 12, color: "#8B7EA0", marginTop: 6 }}>
                    Verifying...
                  </p>
                </div>
              )}

              {/* Manual verify button */}
              {!loading && (
                <button
                  className="cx-press"
                  onClick={() => submitOtp(otpDigits)}
                  disabled={otpDigits.some((d) => !d)}
                  style={{
                    width: "100%",
                    padding: "13px 0",
                    borderRadius: 100,
                    border: "none",
                    background: otpDigits.every((d) => d)
                      ? "linear-gradient(135deg, #2D1B4E 0%, #4A2D6E 100%)"
                      : "rgba(45,27,78,.18)",
                    color: otpDigits.every((d) => d) ? "#FDF8F0" : "#8B7EA0",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: otpDigits.every((d) => d) ? "pointer" : "not-allowed",
                    transition: "all .25s",
                    marginBottom: 14,
                  }}
                >
                  Verify OTP
                </button>
              )}

              {/* Demo OTP hint pill */}
              <div
                style={{
                  background: "linear-gradient(135deg, #FDF5E4 0%, #FFF8E8 100%)",
                  border: "1px solid rgba(201,148,26,.25)",
                  borderRadius: 100,
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 14 }}>💡</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#8B6914",
                    letterSpacing: 0.3,
                  }}
                >
                  Demo OTP: <span className="cx-mono" style={{ letterSpacing: 2 }}>123456</span>
                </span>
              </div>

              {/* Resend */}
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
                    color: "#4A2D6E",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Zari divider ───────────────────────────────────────────── */}
        <div
          className="cx-zari"
          style={{
            width: "60%",
            margin: "28px auto 0",
            opacity: mounted ? 1 : 0,
            transition: "opacity .8s .5s",
          }}
        />

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: "auto",
            paddingBottom: "max(env(safe-area-inset-bottom, 16px), 20px)",
            paddingTop: 28,
            textAlign: "center",
            opacity: mounted ? 1 : 0,
            transition: "opacity .8s .6s",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "rgba(253,248,240,.35)",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            WEARIFY &middot; Phygify Technoservices Pvt. Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
