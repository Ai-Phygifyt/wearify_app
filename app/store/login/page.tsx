"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import "../store-theme.css";

type LoginTab = "otp" | "password";
type OtpStep = "phone" | "otp" | "set-password";

export default function StoreLoginPage() {
  const router = useRouter();
  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const loginWithPassword = useMutation(api.phoneAuth.loginWithPassword);
  const setPasswordMut = useMutation(api.phoneAuth.setPassword);

  const [tab, setTab] = useState<LoginTab>("otp");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoginData, setOtpLoginData] = useState<{ token: string; storeId: string; storeName: string } | null>(null);

  function saveAndGo(token: string, storeId: string, storeName: string) {
    localStorage.setItem("wearify_auth_token", token);
    localStorage.setItem("wearify_auth_user", JSON.stringify({ storeId, storeName, role: "store_owner" }));
    // Hard navigation to avoid React state contamination from login page
    window.location.href = "/store";
  }

  async function handleSendOtp() {
    if (phone.length < 10) { setError("Enter a valid 10-digit phone number"); return; }
    setError(""); setOtpStep("otp");
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) { setError("Enter 6-digit OTP"); return; }
    setLoading(true); setError("");
    try {
      const r = await loginWithOtp({ phone: "+91" + phone, otp, role: "store_owner" });
      if (!r.success) { setError(r.error || "Login failed"); setLoading(false); return; }
      if (r.hasPassword) {
        // User already has a password — go straight to store
        saveAndGo(r.token!, r.storeId!, r.storeName || "My Store");
        return;
      }
      // First-time OTP user — offer to set password
      setOtpLoginData({ token: r.token!, storeId: r.storeId!, storeName: r.storeName || "My Store" });
      setOtpStep("set-password");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Login failed"); }
    finally { setLoading(false); }
  }

  async function handleSetPassword() {
    if (newPassword.length < 6) { setError("Min 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true); setError("");
    try {
      await setPasswordMut({ phone: "+91" + phone, password: newPassword, role: "store_owner" });
      if (otpLoginData) saveAndGo(otpLoginData.token, otpLoginData.storeId, otpLoginData.storeName);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function handlePasswordLogin() {
    if (phone.length < 10) { setError("Enter a valid 10-digit phone"); return; }
    if (!password) { setError("Enter your password"); return; }
    setLoading(true); setError("");
    try {
      const r = await loginWithPassword({ phone: "+91" + phone, password, role: "store_owner" });
      if (!r.success) { setError(r.error || "Login failed"); setLoading(false); return; }
      saveAndGo(r.token!, r.storeId!, r.storeName || "My Store");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Login failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="store-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #0A1628, #1A4A65)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <span className="rt-serif" style={{ color: "#C9941A", fontSize: 28, fontWeight: 700, fontStyle: "italic" }}>W</span>
          </div>
          <h1 className="rt-serif" style={{ fontSize: 26, fontWeight: 700, color: "#0A1628", fontStyle: "italic", margin: 0 }}>Wearify</h1>
          <p style={{ fontSize: 14, color: "#7A6E8A", marginTop: 4 }}>Retailer Portal</p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", background: "#FFFFFF", borderRadius: 12, padding: 4, marginBottom: 24, border: "1px solid #E8D5E0" }}>
          {(["otp", "password"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); if (t === "otp") setOtpStep("phone"); }}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                background: tab === t ? "linear-gradient(135deg, #0A1628, #1A4A65)" : "transparent",
                color: tab === t ? "#fff" : "#3D2B4A",
                transition: "all 0.2s",
              }}
            >
              {t === "otp" ? "OTP Login" : "Password Login"}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "10px 16px", borderRadius: 12, background: "rgba(176,28,28,0.08)", color: "#B71C1C", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* OTP Flow */}
        {tab === "otp" && otpStep === "phone" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#0A1628", marginBottom: 6 }}>Phone Number</label>
              <div style={{ display: "flex", border: "1.5px solid #E8D5E0", borderRadius: 10, overflow: "hidden", background: "white" }}>
                <span className="rt-mono" style={{ padding: "10px 12px", fontSize: 14, color: "#7A6E8A", background: "#FDF8F0", borderRight: "1px solid #E8D5E0" }}>+91</span>
                <input
                  type="tel" value={phone} maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter phone number"
                  style={{ flex: 1, padding: "10px 14px", fontSize: 14, border: "none", outline: "none", color: "#1A0A1E", fontFamily: "inherit" }}
                />
              </div>
            </div>
            <button className="rt-btn rt-btn-primary" style={{ width: "100%" }} onClick={handleSendOtp} disabled={loading}>
              Send OTP
            </button>
            <p className="rt-mono" style={{ fontSize: 12, color: "#7A6E8A", textAlign: "center" }}>
              Demo OTP: <strong style={{ color: "#C9941A" }}>123456</strong>
            </p>
          </div>
        )}

        {tab === "otp" && otpStep === "otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 13, color: "#7A6E8A", textAlign: "center" }}>
              Enter OTP sent to <strong style={{ color: "#0A1628" }}>+91 {phone}</strong>
            </p>
            <input
              className="rt-input rt-mono"
              type="text" value={otp} maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit OTP"
              style={{ textAlign: "center", letterSpacing: "0.5em", fontSize: 20 }}
            />
            <button className="rt-btn rt-btn-primary" style={{ width: "100%" }} onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button onClick={() => { setOtpStep("phone"); setOtp(""); setError(""); }} style={{ fontSize: 13, fontWeight: 600, color: "#1A4A65", background: "none", border: "none", cursor: "pointer", padding: 8 }}>
              Change phone number
            </button>
          </div>
        )}

        {tab === "otp" && otpStep === "set-password" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(27,94,32,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B5E20" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0A1628" }}>OTP Verified!</p>
              <p style={{ fontSize: 12, color: "#7A6E8A", marginTop: 4 }}>Set a password for faster logins (optional)</p>
            </div>
            <input className="rt-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" />
            <input className="rt-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
            <button className="rt-btn rt-btn-primary" style={{ width: "100%" }} onClick={handleSetPassword} disabled={loading}>
              {loading ? "Setting..." : "Set Password & Continue"}
            </button>
            <button onClick={() => otpLoginData && saveAndGo(otpLoginData.token, otpLoginData.storeId, otpLoginData.storeName)} style={{ fontSize: 13, fontWeight: 600, color: "#7A6E8A", background: "none", border: "none", cursor: "pointer", padding: 8 }}>
              Skip for now
            </button>
          </div>
        )}

        {/* Password Flow */}
        {tab === "password" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#0A1628", marginBottom: 6 }}>Phone Number</label>
              <div style={{ display: "flex", border: "1.5px solid #E8D5E0", borderRadius: 10, overflow: "hidden", background: "white" }}>
                <span className="rt-mono" style={{ padding: "10px 12px", fontSize: 14, color: "#7A6E8A", background: "#FDF8F0", borderRight: "1px solid #E8D5E0" }}>+91</span>
                <input
                  type="tel" value={phone} maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter phone number"
                  style={{ flex: 1, padding: "10px 14px", fontSize: 14, border: "none", outline: "none", color: "#1A0A1E", fontFamily: "inherit" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#0A1628", marginBottom: 6 }}>Password</label>
              <input className="rt-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            </div>
            <button className="rt-btn rt-btn-primary" style={{ width: "100%" }} onClick={handlePasswordLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        )}

        <p style={{ fontSize: 11, color: "#7A6E8A", textAlign: "center", marginTop: 32 }}>
          By logging in, you agree to Wearify&apos;s Terms of Service and Privacy Policy.
        </p>
        <p style={{ fontSize: 10, color: "#E8D5E0", textAlign: "center", marginTop: 12 }}>
          Phygify Technoservices Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
