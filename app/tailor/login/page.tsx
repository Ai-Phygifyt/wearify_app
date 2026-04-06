"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Btn } from "@/components/ui/wearify-ui";

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
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  function saveAuthAndRedirect(token: string, tailorId: string) {
    localStorage.setItem("wearify_auth_token", token);
    localStorage.setItem(
      "wearify_auth_user",
      JSON.stringify({ tailorId, role: "tailor" })
    );
    router.replace("/tailor");
  }

  async function handleSendOtp() {
    if (phone.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setOtpStep("otp");
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
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
    <div className="min-h-screen bg-wf-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-wf-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold tracking-wider">W</span>
          </div>
          <h1 className="text-xl font-bold text-wf-text">Wearify</h1>
          <p className="text-sm text-wf-subtext mt-1">Tailor Portal</p>
        </div>

        {/* Main Tab Toggle: Login | Register */}
        <div className="flex bg-wf-card rounded-lg p-1 mb-6 border border-wf-border">
          <button
            onClick={() => { setMainTab("login"); setError(""); }}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer border-none ${
              mainTab === "login"
                ? "bg-wf-primary text-white"
                : "bg-transparent text-wf-subtext"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setMainTab("register"); setError(""); setRegStep(1); }}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer border-none ${
              mainTab === "register"
                ? "bg-wf-primary text-white"
                : "bg-transparent text-wf-subtext"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-wf-red/10 text-wf-red text-sm font-medium">
            {error}
          </div>
        )}

        {/* ========== LOGIN ========== */}
        {mainTab === "login" && (
          <>
            {/* Login sub-tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setLoginTab("otp"); setError(""); setOtpStep("phone"); }}
                className={`flex-1 py-1.5 rounded text-xs font-semibold cursor-pointer border-none transition-colors ${
                  loginTab === "otp"
                    ? "bg-wf-primary/10 text-wf-primary"
                    : "bg-transparent text-wf-muted"
                }`}
              >
                OTP Login
              </button>
              <button
                onClick={() => { setLoginTab("password"); setError(""); }}
                className={`flex-1 py-1.5 rounded text-xs font-semibold cursor-pointer border-none transition-colors ${
                  loginTab === "password"
                    ? "bg-wf-primary/10 text-wf-primary"
                    : "bg-transparent text-wf-muted"
                }`}
              >
                Password Login
              </button>
            </div>

            {loginTab === "otp" && otpStep === "phone" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-wf-text mb-1.5">Phone Number</label>
                  <div className="flex items-center border border-wf-border rounded-lg bg-white overflow-hidden">
                    <span className="px-3 text-sm text-wf-muted font-mono bg-wf-card border-r border-wf-border py-2.5">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Enter phone number"
                      className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-wf-text"
                      maxLength={10}
                    />
                  </div>
                </div>
                <Btn primary className="w-full" onClick={handleSendOtp} disabled={loading}>
                  Send OTP
                </Btn>
                <p className="text-xs text-wf-muted text-center">
                  Demo OTP: <span className="font-mono font-bold text-wf-subtext">123456</span>
                </p>
              </div>
            )}

            {loginTab === "otp" && otpStep === "otp" && (
              <div className="space-y-4">
                <p className="text-sm text-wf-subtext text-center">
                  Enter the OTP sent to <span className="font-bold text-wf-text">+91 {phone}</span>
                </p>
                <div>
                  <label className="block text-sm font-semibold text-wf-text mb-1.5">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6-digit OTP"
                    className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text font-mono text-center tracking-[0.5em] text-lg"
                    maxLength={6}
                  />
                </div>
                <Btn primary className="w-full" onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Btn>
                <button
                  onClick={() => { setOtpStep("phone"); setOtp(""); setError(""); }}
                  className="w-full text-sm text-wf-primary font-semibold bg-transparent border-none cursor-pointer py-2"
                >
                  Change phone number
                </button>
              </div>
            )}

            {loginTab === "password" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-wf-text mb-1.5">Phone Number</label>
                  <div className="flex items-center border border-wf-border rounded-lg bg-white overflow-hidden">
                    <span className="px-3 text-sm text-wf-muted font-mono bg-wf-card border-r border-wf-border py-2.5">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Enter phone number"
                      className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-wf-text"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-wf-text mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
                  />
                </div>
                <Btn primary className="w-full" onClick={handlePasswordLogin} disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Btn>
              </div>
            )}
          </>
        )}

        {/* ========== REGISTER ========== */}
        {mainTab === "register" && (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      s <= regStep
                        ? "bg-wf-primary text-white"
                        : "bg-wf-border text-wf-muted"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 ${
                        s < regStep ? "bg-wf-primary" : "bg-wf-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Info */}
            {regStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-wf-text">Basic Information</h2>
                <div>
                  <label className="block text-sm font-semibold text-wf-text mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-wf-text mb-1.5">Phone Number</label>
                  <div className="flex items-center border border-wf-border rounded-lg bg-white overflow-hidden">
                    <span className="px-3 text-sm text-wf-muted font-mono bg-wf-card border-r border-wf-border py-2.5">+91</span>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Enter phone number"
                      className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-wf-text"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-wf-text mb-1.5">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-wf-text mb-1.5">City</label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-wf-text mb-1.5">Area</label>
                    <input
                      type="text"
                      value={regArea}
                      onChange={(e) => setRegArea(e.target.value)}
                      placeholder="Area"
                      className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
                    />
                  </div>
                </div>
                <Btn
                  primary
                  className="w-full"
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
                  Next
                </Btn>
              </div>
            )}

            {/* Step 2: Specialties */}
            {regStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-wf-text">Your Specialties</h2>
                <p className="text-sm text-wf-subtext">Select all that apply</p>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIALTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => toggleSpecialty(opt.id)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
                        selectedSpecialties.includes(opt.id)
                          ? "bg-wf-primary/10 text-wf-primary border-wf-primary"
                          : "bg-white text-wf-subtext border-wf-border hover:border-wf-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Btn className="flex-1" onClick={() => setRegStep(1)}>
                    Back
                  </Btn>
                  <Btn primary className="flex-1" onClick={goToStep3}>
                    Next
                  </Btn>
                </div>
              </div>
            )}

            {/* Step 3: Services Pricing */}
            {regStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-wf-text">Service Pricing</h2>
                <p className="text-sm text-wf-subtext">Set pricing for your selected services</p>
                <div className="space-y-3 max-h-[340px] overflow-y-auto">
                  {servicePricing.map((svc, idx) => (
                    <div key={svc.id} className="bg-wf-card rounded-lg p-3 border border-wf-border">
                      <div className="text-sm font-semibold text-wf-text mb-2">{svc.name}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-wf-muted mb-0.5">Min Price</label>
                          <input
                            type="number"
                            value={svc.priceMin || ""}
                            onChange={(e) => updatePricing(idx, "priceMin", Number(e.target.value))}
                            placeholder="0"
                            className="w-full px-2 py-1.5 text-sm border border-wf-border rounded bg-white outline-none text-wf-text"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-wf-muted mb-0.5">Max Price</label>
                          <input
                            type="number"
                            value={svc.priceMax || ""}
                            onChange={(e) => updatePricing(idx, "priceMax", Number(e.target.value))}
                            placeholder="0"
                            className="w-full px-2 py-1.5 text-sm border border-wf-border rounded bg-white outline-none text-wf-text"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-wf-muted mb-0.5">Days</label>
                          <input
                            type="number"
                            value={svc.days || ""}
                            onChange={(e) => updatePricing(idx, "days", Number(e.target.value))}
                            placeholder="7"
                            className="w-full px-2 py-1.5 text-sm border border-wf-border rounded bg-white outline-none text-wf-text"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Btn className="flex-1" onClick={() => setRegStep(2)}>
                    Back
                  </Btn>
                  <Btn primary className="flex-1" onClick={() => { setError(""); setRegStep(4); }}>
                    Next
                  </Btn>
                </div>
              </div>
            )}

            {/* Step 4: Bio & Complete */}
            {regStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-wf-text">About You</h2>
                <div>
                  <label className="block text-sm font-semibold text-wf-text mb-1.5">Bio</label>
                  <textarea
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    placeholder="Tell customers about your experience and what makes your work special..."
                    rows={4}
                    className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text resize-none"
                  />
                </div>
                <div className="bg-wf-card rounded-lg p-4 border border-wf-border">
                  <div className="text-sm font-semibold text-wf-text mb-2">Registration Summary</div>
                  <div className="space-y-1 text-sm text-wf-subtext">
                    <div>Name: <span className="text-wf-text font-medium">{regName}</span></div>
                    <div>Phone: <span className="text-wf-text font-medium">+91 {regPhone}</span></div>
                    <div>City: <span className="text-wf-text font-medium">{regCity}{regArea ? `, ${regArea}` : ""}</span></div>
                    <div>Specialties: <span className="text-wf-text font-medium">{selectedSpecialties.length} selected</span></div>
                    <div>Services: <span className="text-wf-text font-medium">{servicePricing.length} configured</span></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Btn className="flex-1" onClick={() => setRegStep(3)}>
                    Back
                  </Btn>
                  <Btn primary className="flex-1" onClick={handleCompleteRegistration} disabled={loading}>
                    {loading ? "Registering..." : "Complete Registration"}
                  </Btn>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-[10px] text-wf-muted text-center mt-8">
          By continuing, you agree to Wearify&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
