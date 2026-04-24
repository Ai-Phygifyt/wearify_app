"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { sendOtp, verifyOtpCode } from "@/lib/otp";

const SPECIALTY_OPTIONS = [
  { id: "silk_blouse", label: "Silk Blouse" },
  { id: "cotton_casual", label: "Cotton Casual" },
  { id: "designer_emb", label: "Designer Embroidery" },
  { id: "bridal", label: "Bridal" },
  { id: "fall_pico", label: "Fall & Pico" },
  { id: "petticoat", label: "Petticoat" },
  { id: "heavy_work", label: "Heavy Work" },
  { id: "alteration", label: "Alteration" },
  { id: "readymade", label: "Readymade" },
];

type MainTab = "login" | "register";
type LoginTab = "otp" | "password";
type OtpStep = "phone" | "otp";

interface ServicePricing {
  id: string;
  name: string;
  priceMin: number;
  priceMax: number;
  days: number;
  active: boolean;
}

export default function TailorLoginPage() {
  const router = useRouter();
  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const loginWithPassword = useMutation(api.phoneAuth.loginWithPassword);
  const registerUser = useMutation(api.phoneAuth.register);
  const updateProfile = useMutation(api.tailorOps.updateProfile);
  const updateServices = useMutation(api.tailorOps.updateServices);

  const [mainTab, setMainTab] = useState<MainTab>("login");
  const [loginTab, setLoginTab] = useState<LoginTab>("otp");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Registration state
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regArea, setRegArea] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [servicePricing, setServicePricing] = useState<ServicePricing[]>([]);
  const [regBio, setRegBio] = useState("");

  const otp = otpDigits.join("");

  useEffect(() => {
    // Auto-focus the first OTP box whenever the tailor lands on the OTP step.
    if (otpStep === "otp" && mainTab === "login") {
      otpRefs.current[0]?.focus();
    }
  }, [otpStep, mainTab]);

  function saveAuthAndRedirect(token: string, tailorId: string) {
    localStorage.setItem("wearify_auth_token", token);
    localStorage.setItem(
      "wearify_auth_user",
      JSON.stringify({ tailorId, role: "tailor" })
    );
    router.replace("/tailor");
  }

  function handleOtpDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? "";
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleSendOtp() {
    if (phone.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setError(""); setLoading(true);
    const send = await sendOtp("+91" + phone);
    setLoading(false);
    if (!send.success) { setError(send.error); return; }
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpStep("otp");
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setError("Enter all 6 digits of the OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const v = await verifyOtpCode("+91" + phone, otp);
      if (!v.success) { setError(v.error); setLoading(false); return; }
      const result = await loginWithOtp({
        phone: "+91" + phone,
        otp,
        role: "tailor",
      });
      if (!result.success) {
        setError(result.error || "Login failed");
        setLoading(false);
        return;
      }
      saveAuthAndRedirect(result.token!, result.tailorId!);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLogin() {
    if (phone.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await loginWithPassword({
        phone: "+91" + phone,
        password,
        role: "tailor",
      });
      if (!result.success) {
        setError(result.error || "Login failed");
        setLoading(false);
        return;
      }
      saveAuthAndRedirect(result.token!, result.tailorId!);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleSpecialty(id: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function goToStep3() {
    if (selectedSpecialties.length === 0) {
      setError("Select at least one specialty");
      return;
    }
    setError("");
    const pricing = selectedSpecialties.map((id) => ({
      id,
      name: SPECIALTY_OPTIONS.find((s) => s.id === id)?.label || id,
      priceMin: 0,
      priceMax: 0,
      days: 7,
      active: true,
    }));
    setServicePricing(pricing);
    setRegStep(3);
  }

  function updatePricing(index: number, field: keyof ServicePricing, value: number) {
    setServicePricing((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function handleCompleteRegistration() {
    setLoading(true);
    setError("");
    try {
      const result = await registerUser({
        phone: "+91" + regPhone,
        password: regPassword,
        name: regName,
        role: "tailor",
      });
      if (!result.success) {
        setError(result.error || "Registration failed");
        setLoading(false);
        return;
      }
      const tailorId = result.tailorId!;
      const token = result.token!;

      await updateProfile({
        tailorId,
        name: regName,
        city: regCity,
        area: regArea || undefined,
        specialties: selectedSpecialties,
        bio: regBio || undefined,
      });

      if (servicePricing.length > 0) {
        await updateServices({
          tailorId,
          services: servicePricing,
        });
      }

      saveAuthAndRedirect(token, tailorId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "0 20px",
      }}
    >
      {/* Auth hero — serif logo, no page chrome */}
      <div style={{ padding: "64px 8px 24px", textAlign: "center" }}>
        <div
          className="t-serif"
          style={{
            fontSize: 44,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          Wearify<em style={{ fontStyle: "italic", color: "var(--gold)", fontWeight: 400 }}>.</em>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
          Tailor portal
        </div>
      </div>

      {/* Login / Register segment toggle */}
      <div className="t-seg" style={{ margin: "0 0 22px" }}>
        <button
          type="button"
          className={mainTab === "login" ? "t-on" : ""}
          onClick={() => { setMainTab("login"); setError(""); }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={mainTab === "register" ? "t-on" : ""}
          onClick={() => { setMainTab("register"); setError(""); setRegStep(1); }}
        >
          Create account
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--urgent-tint)",
            color: "var(--urgent)",
            borderRadius: 12,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* ========== LOGIN ========== */}
      {mainTab === "login" && (
        <>
          {/* Login sub-tabs */}
          <div
            className="t-seg"
            style={{
              margin: "0 0 20px",
              background: "transparent",
              padding: 0,
              borderBottom: "1px solid var(--line)",
              borderRadius: 0,
            }}
          >
            <button
              type="button"
              onClick={() => { setLoginTab("otp"); setError(""); setOtpStep("phone"); setOtpDigits(["", "", "", "", "", ""]); }}
              style={{
                padding: "10px 0",
                background: "transparent",
                border: 0,
                borderBottom: `2px solid ${loginTab === "otp" ? "var(--maroon)" : "transparent"}`,
                color: loginTab === "otp" ? "var(--ink)" : "var(--ink-3)",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
                boxShadow: "none",
                borderRadius: 0,
              }}
            >
              OTP
            </button>
            <button
              type="button"
              onClick={() => { setLoginTab("password"); setError(""); }}
              style={{
                padding: "10px 0",
                background: "transparent",
                border: 0,
                borderBottom: `2px solid ${loginTab === "password" ? "var(--maroon)" : "transparent"}`,
                color: loginTab === "password" ? "var(--ink)" : "var(--ink-3)",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
                boxShadow: "none",
                borderRadius: 0,
              }}
            >
              Password
            </button>
          </div>

          {loginTab === "otp" && otpStep === "phone" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <PhoneField
                value={phone}
                onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
              />
              <button
                type="button"
                className="t-btn t-btn-primary t-btn-full t-btn-lg"
                onClick={handleSendOtp}
                disabled={loading}
              >
                Send OTP
              </button>
            </div>
          )}

          {loginTab === "otp" && otpStep === "otp" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <p style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center", margin: 0 }}>
                Enter the 6-digit code sent to{" "}
                <span className="t-mono" style={{ color: "var(--ink)" }}>+91 {phone}</span>
              </p>
              <div className="t-otp-row">
                {otpDigits.map((d, i) => {
                  const isCur = i === otpDigits.findIndex((x) => x === "");
                  const filled = !!d;
                  return (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpDigit(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                      className={`t-otp-box ${filled ? "t-filled" : ""} ${isCur && !filled ? "t-cur" : ""}`}
                      style={{ outline: "none" }}
                    />
                  );
                })}
              </div>
              <button
                type="button"
                className="t-btn t-btn-primary t-btn-full t-btn-lg"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying…" : "Verify & continue"}
              </button>
              <button
                type="button"
                onClick={() => { setOtpStep("phone"); setOtpDigits(["", "", "", "", "", ""]); setError(""); }}
                style={{
                  background: "transparent",
                  border: 0,
                  color: "var(--maroon)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: "4px 0",
                }}
              >
                Change phone number
              </button>
            </div>
          )}

          {loginTab === "password" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <PhoneField
                value={phone}
                onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
              />
              <div className="t-field">
                <label>Password</label>
                <input
                  className="t-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <button
                type="button"
                className="t-btn t-btn-primary t-btn-full t-btn-lg"
                onClick={handlePasswordLogin}
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          )}
        </>
      )}

      {/* ========== REGISTER ========== */}
      {mainTab === "register" && (
        <>
          {/* Wizard progress bar */}
          <div className="t-wizard-bar" style={{ padding: "0 0 16px" }}>
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`t-seg-dot ${s <= regStep ? "t-on" : ""}`} />
            ))}
          </div>

          {regStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionHeading eyebrow={`Step 1 of 4`} title="Basic information" />
              <div className="t-field">
                <label>Full name</label>
                <input
                  className="t-input"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <PhoneField
                label="Phone number"
                value={regPhone}
                onChange={(v) => setRegPhone(v.replace(/\D/g, "").slice(0, 10))}
              />
              <div className="t-field">
                <label>Password</label>
                <input
                  className="t-input"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="t-field">
                  <label>City</label>
                  <input
                    className="t-input"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Mumbai"
                  />
                </div>
                <div className="t-field">
                  <label>Area</label>
                  <input
                    className="t-input"
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <button
                type="button"
                className="t-btn t-btn-primary t-btn-full t-btn-lg"
                style={{ marginTop: 6 }}
                onClick={() => {
                  if (!regName || !regPhone || !regCity || !regPassword) {
                    setError("Please fill all required fields");
                    return;
                  }
                  if (regPhone.length < 10) {
                    setError("Enter a valid 10-digit phone number");
                    return;
                  }
                  if (regPassword.length < 6) {
                    setError("Password must be at least 6 characters");
                    return;
                  }
                  setError("");
                  setRegStep(2);
                }}
              >
                Continue
              </button>
            </div>
          )}

          {regStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionHeading
                eyebrow="Step 2 of 4"
                title="Your specialties"
                sub="Pick everything you stitch. Customers filter by these."
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SPECIALTY_OPTIONS.map((opt) => {
                  const on = selectedSpecialties.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleSpecialty(opt.id)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        background: on ? "var(--maroon-tint)" : "var(--paper)",
                        color: on ? "var(--maroon-ink)" : "var(--ink-3)",
                        border: `1px solid ${on ? "rgba(123, 29, 29, 0.2)" : "var(--line-2)"}`,
                        textAlign: "left",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" className="t-btn t-btn-ghost" style={{ flex: 1 }} onClick={() => setRegStep(1)}>
                  Back
                </button>
                <button
                  type="button"
                  className="t-btn t-btn-primary"
                  style={{ flex: 2 }}
                  onClick={goToStep3}
                  disabled={selectedSpecialties.length === 0}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {regStep === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionHeading
                eyebrow="Step 3 of 4"
                title="Service pricing"
                sub="You can always tweak these later from your profile."
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {servicePricing.map((svc, idx) => (
                  <div key={svc.id} className="t-card" style={{ padding: 14 }}>
                    <div className="t-serif" style={{ fontSize: 16, fontWeight: 500, marginBottom: 10 }}>
                      {svc.name}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div className="t-field">
                        <label>Min (₹)</label>
                        <input
                          className="t-input t-mono"
                          type="number"
                          value={svc.priceMin || ""}
                          onChange={(e) => updatePricing(idx, "priceMin", Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div className="t-field">
                        <label>Max (₹)</label>
                        <input
                          className="t-input t-mono"
                          type="number"
                          value={svc.priceMax || ""}
                          onChange={(e) => updatePricing(idx, "priceMax", Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div className="t-field">
                        <label>Days</label>
                        <input
                          className="t-input t-mono"
                          type="number"
                          value={svc.days || ""}
                          onChange={(e) => updatePricing(idx, "days", Number(e.target.value))}
                          placeholder="7"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" className="t-btn t-btn-ghost" style={{ flex: 1 }} onClick={() => setRegStep(2)}>
                  Back
                </button>
                <button
                  type="button"
                  className="t-btn t-btn-primary"
                  style={{ flex: 2 }}
                  onClick={() => { setError(""); setRegStep(4); }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {regStep === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionHeading eyebrow="Step 4 of 4" title="About you" sub="A short bio customers see on your profile." />
              <div className="t-field">
                <label>Bio</label>
                <textarea
                  className="t-textarea"
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="Tell customers about your experience and what makes your work special…"
                  rows={4}
                  style={{ resize: "none", fontFamily: "inherit" }}
                />
              </div>
              <div
                className="t-card t-card-inset"
                style={{ background: "var(--ivory-2)", borderColor: "transparent" }}
              >
                <div className="t-caps" style={{ color: "var(--ink-3)", marginBottom: 8 }}>
                  Review
                </div>
                <SummaryRow label="Name" value={regName} />
                <SummaryRow label="Phone" value={`+91 ${regPhone}`} mono />
                <SummaryRow label="Location" value={regArea ? `${regCity}, ${regArea}` : regCity} />
                <SummaryRow label="Specialties" value={`${selectedSpecialties.length} selected`} />
                <SummaryRow label="Services" value={`${servicePricing.length} configured`} last />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" className="t-btn t-btn-ghost" style={{ flex: 1 }} onClick={() => setRegStep(3)}>
                  Back
                </button>
                <button
                  type="button"
                  className="t-btn t-btn-primary t-btn-lg"
                  style={{ flex: 2 }}
                  onClick={handleCompleteRegistration}
                  disabled={loading}
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <p
        style={{
          fontSize: 11,
          color: "var(--ink-4)",
          textAlign: "center",
          margin: "auto 0 28px",
          paddingTop: 32,
        }}
      >
        By continuing, you agree to Wearify&apos;s Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

function PhoneField({ label = "Phone number", value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="t-field">
      <label>{label}</label>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          background: "var(--paper)",
          border: "1px solid var(--line-2)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <span
          className="t-mono"
          style={{
            padding: "12px 14px",
            color: "var(--ink-3)",
            fontSize: 15,
            background: "var(--ivory-2)",
            borderRight: "1px solid var(--line)",
          }}
        >
          +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="98765 43210"
          className="t-mono"
          maxLength={10}
          style={{
            flex: 1,
            padding: "12px 14px",
            fontSize: 16,
            border: 0,
            outline: "none",
            background: "transparent",
            color: "var(--ink)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.02em",
          }}
        />
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div>
      {eyebrow && (
        <div className="t-caps" style={{ color: "var(--ink-3)", marginBottom: 4 }}>
          {eyebrow}
        </div>
      )}
      <h2
        className="t-serif"
        style={{
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "6px 0 0", lineHeight: 1.5 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function SummaryRow({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: last ? "none" : "1px solid var(--line)",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{label}</span>
      <span
        className={mono ? "t-mono" : ""}
        style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}
      >
        {value}
      </span>
    </div>
  );
}
