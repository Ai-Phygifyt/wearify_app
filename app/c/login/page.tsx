"use client";

import React, { useState } from "react";
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
import { Btn, Tabs } from "@/components/ui/wearify-ui";

type Mode = "login" | "register";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [tab, setTab] = useState("OTP");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const loginWithPassword = useMutation(api.phoneAuth.loginWithPassword);
  const register = useMutation(api.phoneAuth.register);

  const phoneDigits = formatPhone(phone);
  const phoneValid = isValidPhone(phoneDigits);

  function handlePhoneChange(val: string) {
    setPhone(formatPhone(val));
    setError("");
    setOtpSent(false);
    setOtp("");
  }

  async function handleSendOtp() {
    if (!phoneValid) {
      setError("Enter a valid 10-digit mobile number starting with 6-9");
      return;
    }
    setOtpSent(true);
    setError("");
  }

  async function handleOtpLogin() {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await loginWithOtp({
        phone: fullPhone(phoneDigits),
        otp,
        role: "customer",
        name: mode === "register" ? name || "Customer" : undefined,
      });
      if (result.success) {
        setToken(result.token!);
        setStoredUser({
          phone: fullPhone(phoneDigits),
          name: name || "Customer",
          role: "customer",
          customerId: result.customerId as string,
        });
        router.replace("/c");
      } else {
        setError(result.error || "Login failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function handlePasswordLogin() {
    if (!phoneValid) {
      setError("Enter a valid phone number");
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
        phone: fullPhone(phoneDigits),
        password,
        role: "customer",
      });
      if (result.success) {
        setToken(result.token!);
        setStoredUser({
          phone: fullPhone(phoneDigits),
          name: "Customer",
          role: "customer",
          customerId: result.customerId as string,
        });
        router.replace("/c");
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function handleRegister() {
    if (!phoneValid) {
      setError("Enter a valid phone number");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // OTP login auto-creates customer if not exists
      const result = await loginWithOtp({
        phone: fullPhone(phoneDigits),
        otp,
        role: "customer",
        name: name.trim(),
      });
      if (result.success) {
        // Optionally set password
        if (password) {
          await register({
            phone: fullPhone(phoneDigits),
            password,
            name: name.trim(),
            role: "customer",
          }).catch(() => {
            // Account already created via OTP, password set is optional
          });
        }
        setToken(result.token!);
        setStoredUser({
          phone: fullPhone(phoneDigits),
          name: name.trim(),
          role: "customer",
          customerId: result.customerId as string,
        });
        router.replace("/c");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-wf-bg max-w-md mx-auto">
      {/* Header with saree-inspired gradient */}
      <div
        className="relative h-56 flex flex-col items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #71221D 0%, #B8544F 40%, #D4A843 70%, #E8CFA0 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
        }} />
        <div className="relative z-10 text-center">
          <div className="text-4xl font-extrabold text-white tracking-wide mb-1">
            Wearify
          </div>
          <div className="text-sm text-white/80 font-medium">
            Your Personal Saree Collection
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20">
        <div className="bg-wf-card rounded-xl border border-wf-border p-5 shadow-sm">
          {mode === "login" ? (
            <>
              <h2 className="text-lg font-bold text-wf-text mb-4">
                Welcome Back
              </h2>
              <Tabs
                items={["OTP", "Password"]}
                active={tab}
                onChange={(t) => {
                  setTab(t);
                  setError("");
                }}
              />

              {/* Phone input */}
              <div className="mb-4">
                <label className="text-xs text-wf-subtext font-semibold block mb-1">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-wf-muted font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phoneDigits}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="flex-1 bg-wf-bg border border-wf-border rounded-lg px-3 py-2.5 text-sm text-wf-text outline-none focus:border-wf-primary transition-colors"
                  />
                </div>
              </div>

              {tab === "OTP" ? (
                <>
                  {!otpSent ? (
                    <Btn
                      primary
                      onClick={handleSendOtp}
                      disabled={!phoneValid}
                      className="w-full"
                    >
                      Send OTP
                    </Btn>
                  ) : (
                    <>
                      <p className="text-xs text-wf-green mb-3 font-medium">
                        OTP sent to +91 {phoneDigits} (use 123456)
                      </p>
                      <div className="mb-4">
                        <label className="text-xs text-wf-subtext font-semibold block mb-1">
                          Enter 6-digit OTP
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                            setError("");
                          }}
                          className="w-full bg-wf-bg border border-wf-border rounded-lg px-3 py-2.5 text-sm text-wf-text font-mono text-center tracking-widest outline-none focus:border-wf-primary transition-colors"
                        />
                      </div>
                      <Btn
                        primary
                        onClick={handleOtpLogin}
                        disabled={loading || otp.length !== 6}
                        className="w-full"
                      >
                        {loading ? "Verifying..." : "Verify & Login"}
                      </Btn>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="text-xs text-wf-subtext font-semibold block mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-wf-bg border border-wf-border rounded-lg px-3 py-2.5 text-sm text-wf-text outline-none focus:border-wf-primary transition-colors"
                    />
                  </div>
                  <Btn
                    primary
                    onClick={handlePasswordLogin}
                    disabled={loading || !phoneValid || !password}
                    className="w-full"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Btn>
                </>
              )}

              {error && (
                <p className="text-xs text-wf-red mt-3 text-center">{error}</p>
              )}

              <div className="mt-5 text-center">
                <button
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="text-sm text-wf-primary font-semibold cursor-pointer hover:underline"
                >
                  New here? Create account
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-wf-text mb-4">
                Create Account
              </h2>

              <div className="mb-4">
                <label className="text-xs text-wf-subtext font-semibold block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  className="w-full bg-wf-bg border border-wf-border rounded-lg px-3 py-2.5 text-sm text-wf-text outline-none focus:border-wf-primary transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs text-wf-subtext font-semibold block mb-1">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-wf-muted font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phoneDigits}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="flex-1 bg-wf-bg border border-wf-border rounded-lg px-3 py-2.5 text-sm text-wf-text outline-none focus:border-wf-primary transition-colors"
                  />
                </div>
              </div>

              {!otpSent ? (
                <Btn
                  primary
                  onClick={handleSendOtp}
                  disabled={!phoneValid || !name.trim()}
                  className="w-full"
                >
                  Send OTP
                </Btn>
              ) : (
                <>
                  <p className="text-xs text-wf-green mb-3 font-medium">
                    OTP sent to +91 {phoneDigits} (use 123456)
                  </p>
                  <div className="mb-4">
                    <label className="text-xs text-wf-subtext font-semibold block mb-1">
                      Enter 6-digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setError("");
                      }}
                      className="w-full bg-wf-bg border border-wf-border rounded-lg px-3 py-2.5 text-sm text-wf-text font-mono text-center tracking-widest outline-none focus:border-wf-primary transition-colors"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-wf-subtext font-semibold block mb-1">
                      Set Password (optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Choose a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-wf-bg border border-wf-border rounded-lg px-3 py-2.5 text-sm text-wf-text outline-none focus:border-wf-primary transition-colors"
                    />
                  </div>

                  <Btn
                    primary
                    onClick={handleRegister}
                    disabled={loading || otp.length !== 6}
                    className="w-full"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Btn>
                </>
              )}

              {error && (
                <p className="text-xs text-wf-red mt-3 text-center">{error}</p>
              )}

              <div className="mt-5 text-center">
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="text-sm text-wf-primary font-semibold cursor-pointer hover:underline"
                >
                  Already have an account? Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center mt-8 text-xs text-wf-muted pb-6">
        By continuing, you agree to Wearify&apos;s Terms & Privacy Policy
      </div>
    </div>
  );
}
