"use client";

import React, { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import "../store-theme.css";

type LoginTab = "otp" | "password";
type OtpStep = "phone" | "otp" | "set-password";

export default function StoreLoginPage() {
  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const loginWithPassword = useMutation(api.phoneAuth.loginWithPassword);
  const setPasswordMut = useMutation(api.phoneAuth.setPassword);

  const [tab, setTab] = useState<LoginTab>("otp");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoginData, setOtpLoginData] = useState<{ token: string; storeId: string; storeName: string } | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  function saveAndGo(token: string, storeId: string, storeName: string) {
    localStorage.setItem("wearify_auth_token", token);
    localStorage.setItem("wearify_auth_user", JSON.stringify({ storeId, storeName, role: "store_owner" }));
    window.location.href = "/store";
  }

  function handleOtpDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleSendOtp() {
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    setError("");
    setOtpStep("otp");
  }

  async function handleVerifyOtp() {
    const otp = otpDigits.join("");
    if (otp.length !== 6) { setError("Enter all 6 digits of the OTP"); return; }
    setLoading(true); setError("");
    try {
      const r = await loginWithOtp({ phone: "+91" + phone, otp, role: "store_owner" });
      if (!r.success) { setError(r.error || "Login failed"); setLoading(false); return; }
      if (r.hasPassword) {
        saveAndGo(r.token!, r.storeId!, r.storeName || "My Store");
        return;
      }
      setOtpLoginData({ token: r.token!, storeId: r.storeId!, storeName: r.storeName || "My Store" });
      setOtpStep("set-password");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Login failed"); }
    finally { setLoading(false); }
  }

  async function handleSetPassword() {
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true); setError("");
    try {
      await setPasswordMut({ phone: "+91" + phone, password: newPassword, role: "store_owner" });
      if (otpLoginData) saveAndGo(otpLoginData.token, otpLoginData.storeId, otpLoginData.storeName);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to set password"); }
    finally { setLoading(false); }
  }

  async function handlePasswordLogin() {
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    if (!password) { setError("Enter your password"); return; }
    setLoading(true); setError("");
    try {
      const r = await loginWithPassword({ phone: "+91" + phone, password, role: "store_owner" });
      if (!r.success) { setError(r.error || "Login failed"); setLoading(false); return; }
      saveAndGo(r.token!, r.storeId!, r.storeName || "My Store");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Login failed"); }
    finally { setLoading(false); }
  }

  const phoneInput = (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--w-ink-soft)", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Mobile Number
      </label>
      <div style={{
        display: "flex",
        border: "1.5px solid var(--w-cream-border)",
        borderRadius: "var(--w-r-sm)",
        overflow: "hidden",
        background: "#fff",
        boxShadow: "var(--w-shadow-xs)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}>
        <span className="w-mono" style={{
          padding: "13px 14px", fontSize: 13.5,
          color: "var(--w-ink-soft)",
          background: "var(--w-cream)",
          borderRight: "1.5px solid var(--w-cream-border)",
          fontWeight: 500,
          userSelect: "none",
        }}>+91</span>
        <input
          type="tel"
          value={phone}
          maxLength={10}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit phone number"
          style={{
            flex: 1, padding: "13px 14px", fontSize: 15,
            border: "none", outline: "none",
            color: "var(--w-ink)", fontFamily: "'DM Sans', sans-serif",
            background: "transparent",
          }}
        />
      </div>
    </div>
  );

  return (
    <div
      className="store-shell"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 20px",
        background: "radial-gradient(ellipse at 70% -10%, rgba(184,134,11,0.09) 0%, transparent 55%), var(--w-cream)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 76, height: 76,
            borderRadius: 22,
            background: "linear-gradient(145deg, var(--w-navy) 0%, var(--w-teal) 100%)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
            boxShadow: "0 10px 36px rgba(13,31,53,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}>
            <span className="w-serif" style={{ color: "var(--w-gold-bright)", fontSize: 36, fontWeight: 700, fontStyle: "italic", lineHeight: 1 }}>W</span>
          </div>
          <h1 className="w-display" style={{ fontSize: 32, margin: "0 0 10px" }}>Wearify</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ width: 28, height: 1, background: "var(--w-gold)", opacity: 0.45 }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.13em", color: "var(--w-gold)", textTransform: "uppercase" }}>
              Retailer Portal
            </span>
            <div style={{ width: 28, height: 1, background: "var(--w-gold)", opacity: 0.45 }} />
          </div>
        </div>

        {/* Card */}
        <div className="w-card w-card-gold" style={{ padding: "32px 30px" }}>

          {/* Tab Toggle */}
          <div style={{
            display: "flex",
            background: "var(--w-cream)",
            borderRadius: "var(--w-r-sm)",
            padding: 3,
            marginBottom: 28,
            border: "1px solid var(--w-cream-border)",
          }}>
            {(["otp", "password"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); if (t === "otp") setOtpStep("phone"); }}
                style={{
                  flex: 1, padding: "10px 0",
                  borderRadius: "var(--w-r-xs)",
                  fontSize: 13.5, fontWeight: 600, cursor: "pointer", border: "none",
                  background: tab === t ? "linear-gradient(145deg, var(--w-navy), var(--w-teal))" : "transparent",
                  color: tab === t ? "#fff" : "var(--w-ink-soft)",
                  transition: "all 0.22s var(--w-ease)",
                  boxShadow: tab === t ? "0 2px 10px rgba(13,31,53,0.22)" : "none",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                {t === "otp" ? "OTP Login" : "Password Login"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px",
              borderRadius: "var(--w-r-sm)",
              background: "var(--w-danger-bg)",
              color: "var(--w-danger)",
              border: "1px solid rgba(139,0,0,0.12)",
              fontSize: 13, fontWeight: 500,
              marginBottom: 20,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* ── OTP: Phone Step ── */}
          {tab === "otp" && otpStep === "phone" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {phoneInput}
              <button
                className="w-btn w-btn-primary"
                style={{ width: "100%", padding: "13px", fontSize: 14 }}
                onClick={handleSendOtp}
                disabled={loading}
              >
                Send OTP
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="w-divider" style={{ flex: 1, margin: 0 }} />
                <span className="w-mono" style={{ fontSize: 12, color: "var(--w-ink-ghost)", whiteSpace: "nowrap" }}>
                  Demo OTP: <strong style={{ color: "var(--w-gold)" }}>123456</strong>
                </span>
                <div className="w-divider" style={{ flex: 1, margin: 0 }} />
              </div>
            </div>
          )}

          {/* ── OTP: Verify Step ── */}
          {tab === "otp" && otpStep === "otp" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 13.5, color: "var(--w-ink-soft)", textAlign: "center" }}>
                OTP sent to{" "}
                <strong style={{ color: "var(--w-navy)", fontWeight: 700 }}>+91 {phone}</strong>
              </p>

              {/* 6-box OTP input */}
              <div style={{ display: "flex", gap: 9, justifyContent: "center" }}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigit(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    style={{
                      width: 50, height: 58,
                      textAlign: "center",
                      fontSize: 24, fontWeight: 700,
                      fontFamily: "'DM Mono', monospace",
                      border: `2px solid ${digit ? "var(--w-gold)" : "var(--w-cream-border)"}`,
                      borderRadius: "var(--w-r-sm)",
                      background: digit ? "var(--w-gold-pale)" : "#fff",
                      color: "var(--w-navy)",
                      outline: "none",
                      transition: "all 0.18s var(--w-ease)",
                      boxShadow: digit ? "0 0 0 3px var(--w-gold-mist)" : "var(--w-shadow-xs)",
                      caretColor: "var(--w-gold)",
                    }}
                  />
                ))}
              </div>

              <button
                className="w-btn w-btn-primary"
                style={{ width: "100%", padding: "13px", fontSize: 14 }}
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? "Verifying…" : "Verify & Continue"}
              </button>
              <button
                onClick={() => { setOtpStep("phone"); setOtpDigits(["", "", "", "", "", ""]); setError(""); }}
                style={{
                  fontSize: 13, fontWeight: 600, color: "var(--w-teal)",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "6px 8px", textAlign: "center",
                  textDecoration: "underline", textUnderlineOffset: 3,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Change phone number
              </button>
            </div>
          )}

          {/* ── OTP: Set Password Step ── */}
          {tab === "otp" && otpStep === "set-password" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ textAlign: "center", paddingBottom: 4 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "var(--w-success-bg)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14,
                  border: "2px solid rgba(30,92,47,0.18)",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--w-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: "var(--w-navy)", marginBottom: 4 }}>OTP Verified!</p>
                <p style={{ fontSize: 13, color: "var(--w-ink-soft)" }}>Set a password for quicker future logins</p>
              </div>
              <div className="w-divider" />
              <input
                className="w-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
              />
              <input
                className="w-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <button
                className="w-btn w-btn-primary"
                style={{ width: "100%", padding: "13px", fontSize: 14 }}
                onClick={handleSetPassword}
                disabled={loading}
              >
                {loading ? "Saving…" : "Set Password & Enter"}
              </button>
              <button
                onClick={() => otpLoginData && saveAndGo(otpLoginData.token, otpLoginData.storeId, otpLoginData.storeName)}
                style={{
                  fontSize: 13, fontWeight: 500, color: "var(--w-ink-ghost)",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "6px 8px", textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Skip for now, continue to store →
              </button>
            </div>
          )}

          {/* ── Password Flow ── */}
          {tab === "password" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {phoneInput}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--w-ink-soft)", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Password
                </label>
                <input
                  className="w-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                />
              </div>
              <button
                className="w-btn w-btn-primary"
                style={{ width: "100%", padding: "13px", fontSize: 14 }}
                onClick={handlePasswordLogin}
                disabled={loading}
              >
                {loading ? "Logging in…" : "Login to Store"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 11.5, color: "var(--w-ink-ghost)", lineHeight: 1.7 }}>
            By logging in, you agree to Wearify&apos;s Terms of Service and Privacy Policy
          </p>
          <p style={{ fontSize: 10.5, color: "var(--w-cream-border)", marginTop: 10, letterSpacing: "0.05em" }}>
            Phygify Technoservices Pvt. Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
