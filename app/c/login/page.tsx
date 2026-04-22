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
import { ArrowLeft, ArrowRight, Lightbulb, Flower } from "lucide-react";

type Step = "phone" | "otp";

function Orb({ size, top, left, delay, opacity }: { size: number; top: string; left: string; delay: string; opacity: number }) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        top,
        left,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(184, 134, 11, .35) 0%, rgba(184, 134, 11, .08) 55%, transparent 75%)",
        opacity,
        animation: "cx-float 4.5s ease-in-out infinite",
        animationDelay: delay,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

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

  return (
    <div
      style={{
        minHeight: "100svh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background: "var(--cx-grad-hero)",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div className="cx-paisley cx-noise" style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none", zIndex: 0 }} />

      <Orb size={180} top="5%" left="-8%" delay="0s" opacity={0.5} />
      <Orb size={100} top="18%" left="78%" delay="1.2s" opacity={0.35} />
      <Orb size={130} top="55%" left="85%" delay="0.6s" opacity={0.3} />
      <Orb size={80} top="72%" left="-5%" delay="1.8s" opacity={0.25} />

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
        {/* Logo */}
        <div
          className={mounted ? "cx-pageIn" : ""}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "max(7svh, 44px)",
            marginBottom: 28,
            opacity: mounted ? undefined : 0,
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: "50%",
              border: "1.5px solid rgba(184, 134, 11, .6)",
              background: "rgba(184, 134, 11, .1)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              color: "var(--cx-gold-l)",
            }}
          >
            <Flower size={34} strokeWidth={1.6} />
          </div>

          <h1 className="cx-serif cx-gold-shimmer" style={{ fontSize: 32, fontStyle: "italic", fontWeight: 600, margin: 0, letterSpacing: 1, lineHeight: 1.2 }}>
            Wearify
          </h1>

          <p style={{ color: "rgba(253,248,240,.55)", fontSize: 13, marginTop: 6, letterSpacing: ".05em" }}>
            Your AI-powered saree experience
          </p>
        </div>

        {/* Card */}
        <div
          className={`cx-noise ${mounted ? "cx-slideUp cx-d2" : ""}`}
          style={{
            width: "100%",
            background: "rgba(253,248,240,.97)",
            borderRadius: "var(--cx-r-xl)",
            padding: "26px 22px 22px",
            boxShadow: "var(--cx-shadow-lg)",
            position: "relative",
            overflow: "hidden",
            opacity: mounted ? undefined : 0,
          }}
        >
          {step === "phone" && (
            <div className="cx-fadeIn">
              <h2 className="cx-serif" style={{ fontSize: 24, fontStyle: "italic", fontWeight: 600, color: "var(--cx-text)", margin: "0 0 4px" }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 13, color: "var(--cx-text-muted)", margin: "0 0 22px" }}>
                Sign in with your mobile number
              </p>

              <label className="cx-label">Mobile Number</label>
              <div style={{ display: "flex", alignItems: "stretch", gap: 8, marginBottom: 16 }}>
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
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phoneDigits}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="cx-input"
                  style={{ letterSpacing: ".06em", fontWeight: 500 }}
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
                className="cx-btn cx-btn-primary cx-btn-block cx-btn-lg cx-silk"
              >
                Send OTP <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: "center", marginTop: 18 }}>
                <span style={{ fontSize: 13, color: "var(--cx-text-muted)" }}>New user? </span>
                <button
                  onClick={() => router.push(`/c/register${phoneDigits ? `?phone=${phoneDigits}` : ""}`)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--cx-gold-d)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <button
                  onClick={() => {
                    setStep("phone");
                    setError("");
                    setOtpDigits(["", "", "", "", "", ""]);
                  }}
                  className="cx-iconbtn cx-iconbtn-sm"
                  aria-label="Go back"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="cx-serif" style={{ fontSize: 22, fontStyle: "italic", fontWeight: 600, color: "var(--cx-text)", margin: 0 }}>
                  Verify OTP
                </h2>
              </div>
              <p style={{ fontSize: 13, color: "var(--cx-text-muted)", margin: "0 0 20px 36px" }}>
                Sent to +91 {phoneDigits}
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
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
                    className={`cx-otp ${d ? "filled" : ""}`}
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
                    borderRadius: "var(--cx-r)",
                    background: "var(--cx-gold-ghost)",
                    border: "1px solid rgba(184, 134, 11, .35)",
                    marginBottom: 14,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cx-text)", marginBottom: 4 }}>
                    No account found
                  </div>
                  <div style={{ fontSize: 12, color: "var(--cx-text-mid)", marginBottom: 12, lineHeight: 1.5 }}>
                    We couldn&apos;t find a Wearify account for +91 {phoneDigits}. Create one in under a minute.
                  </div>
                  <button
                    onClick={() => router.push(`/c/register?phone=${phoneDigits}`)}
                    className="cx-btn cx-btn-gold cx-btn-block"
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
                      color: "var(--cx-plum-l)",
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
                  <p style={{ fontSize: 12, color: "var(--cx-text-muted)", marginTop: 6 }}>Verifying...</p>
                </div>
              )}

              {!loading && !noAccount && (
                <button
                  onClick={() => submitOtp(otpDigits)}
                  disabled={otpDigits.some((d) => !d)}
                  className="cx-btn cx-btn-primary cx-btn-block cx-btn-lg"
                  style={{ marginBottom: 14 }}
                >
                  Verify OTP
                </button>
              )}

              <div
                style={{
                  background: "linear-gradient(135deg, var(--cx-gold-ghost) 0%, #FDF5DB 100%)",
                  border: "1px solid rgba(184, 134, 11, .25)",
                  borderRadius: "var(--cx-r-pill)",
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Lightbulb size={14} color="var(--cx-gold-d)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cx-gold-d)" }}>
                  Demo OTP: <span className="cx-mono" style={{ letterSpacing: 2 }}>123456</span>
                </span>
              </div>

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
                    color: "var(--cx-plum-l)",
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

        <div className="cx-zari" style={{ width: "60%", margin: "26px auto 0", opacity: mounted ? 1 : 0, transition: "opacity .8s .5s" }} />

        <div
          style={{
            marginTop: "auto",
            paddingBottom: "max(env(safe-area-inset-bottom, 16px), 20px)",
            paddingTop: 24,
            textAlign: "center",
            opacity: mounted ? 1 : 0,
            transition: "opacity .8s .6s",
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 500, color: "rgba(253,248,240,.4)", letterSpacing: ".15em", textTransform: "uppercase", margin: 0 }}>
            Wearify · Phygify Technoservices Pvt. Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
