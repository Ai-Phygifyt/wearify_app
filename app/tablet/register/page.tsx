"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Btn, Toggle } from "@/components/ui/wearify-ui";
import { Id } from "@/convex/_generated/dataModel";

type Step = "phone" | "otp" | "name" | "consent";

export default function TabletRegisterPage() {
  const router = useRouter();
  const verifyOtp = useMutation(api.phoneAuth.verifyOtp);
  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const updateConsent = useMutation(api.customers.updateConsent);
  const updateProfile = useMutation(api.customers.updateProfile);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<Id<"customers"> | null>(null);

  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 13);
    return d.toISOString().split("T")[0];
  })();

  // Consent toggles
  const [consentHistory, setConsentHistory] = useState(true);
  const [consentMessages, setConsentMessages] = useState(true);
  const [consentAi, setConsentAi] = useState(true);
  const [consentPhotos, setConsentPhotos] = useState(true);

  const handleSendOtp = () => {
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    // OTP is dummy -- just move to OTP step
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await verifyOtp({ phone: `+91${phone}`, otp });
      if (result.success) {
        setStep("name");
      } else {
        setError(result.error || "Invalid OTP");
      }
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = () => {
    if (!name.trim()) {
      setError("Please enter the customer's name");
      return;
    }
    if (!dob) {
      setError("Please enter date of birth");
      return;
    }
    const age = (() => {
      const d = new Date(dob);
      if (isNaN(d.getTime())) return -1;
      const now = new Date();
      let a = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
      return a;
    })();
    if (age < 13) {
      setError("Customer must be at least 13 years old");
      return;
    }
    setError("");
    setStep("consent");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      // Create customer via loginWithOtp
      const result = await loginWithOtp({
        phone: `+91${phone}`,
        otp: "123456",
        role: "customer",
        name: name.trim(),
      });
      if (!result.success) {
        setError(result.error || "Registration failed");
        setLoading(false);
        return;
      }

      const cId = result.customerId as Id<"customers">;
      setCustomerId(cId);

      // Persist DOB captured at tablet (customer completes the rest at /c)
      await updateProfile({
        customerId: cId,
        dateOfBirth: dob,
      });

      // Update consent
      await updateConsent({
        customerId: cId,
        consentHistory,
        consentMessages,
        consentAiPersonal: consentAi,
        consentPhotos,
        consentGrantedDate: new Date().toISOString().split("T")[0],
      });

      // Save customer info for session
      localStorage.setItem(
        "wearify_tablet_customer",
        JSON.stringify({
          customerId: cId,
          phone: `+91${phone}`,
          name: name.trim(),
        })
      );

      router.push("/tablet/occasion");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {(["phone", "otp", "name", "consent"] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s
                    ? "bg-wf-primary text-white"
                    : (["phone", "otp", "name", "consent"] as Step[]).indexOf(step) > i
                      ? "bg-wf-green text-white"
                      : "bg-wf-border text-wf-muted"
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div className="flex-1 h-0.5 bg-wf-border" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-wf-card rounded-lg border border-wf-border p-8">
          {/* Step 1: Phone */}
          {step === "phone" && (
            <>
              <h2 className="text-lg font-bold text-wf-text mb-1">New Customer</h2>
              <p className="text-sm text-wf-subtext mb-6">Enter customer phone number</p>

              <label className="block text-sm font-semibold text-wf-text mb-2">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-3 rounded-lg bg-wf-bg border border-wf-border text-sm font-mono text-wf-subtext">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(val);
                    setError("");
                  }}
                  placeholder="9876543210"
                  className="flex-1 px-4 py-3 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-base font-mono focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary placeholder:text-wf-muted"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-wf-red mt-2">{error}</p>}
              <div className="mt-6">
                <Btn primary onClick={handleSendOtp} className="w-full">
                  Send OTP
                </Btn>
              </div>
            </>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <>
              <h2 className="text-lg font-bold text-wf-text mb-1">Verify OTP</h2>
              <p className="text-sm text-wf-subtext mb-6">
                Enter the 6-digit code sent to +91 {phone}
              </p>

              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(val);
                  setError("");
                }}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-xl font-mono tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary placeholder:text-wf-muted placeholder:tracking-[0.5em]"
                autoFocus
              />
              {error && <p className="text-sm text-wf-red mt-2">{error}</p>}
              <p className="text-xs text-wf-muted mt-2">Demo OTP: 123456</p>
              <div className="mt-6 flex gap-3">
                <Btn onClick={() => { setStep("phone"); setOtp(""); setError(""); }}>
                  Back
                </Btn>
                <Btn primary onClick={handleVerifyOtp} disabled={loading} className="flex-1">
                  {loading ? "Verifying..." : "Verify"}
                </Btn>
              </div>
            </>
          )}

          {/* Step 3: Name + DOB */}
          {step === "name" && (
            <>
              <h2 className="text-lg font-bold text-wf-text mb-1">Customer Details</h2>
              <p className="text-sm text-wf-subtext mb-6">
                Phone verified. Capture the basics — customer completes the rest on the Wearify app.
              </p>

              <label className="block text-sm font-semibold text-wf-text mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-base focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary placeholder:text-wf-muted"
                autoFocus
              />

              <label className="block text-sm font-semibold text-wf-text mt-4 mb-2">Date of Birth</label>
              <input
                type="date"
                value={dob}
                max={maxDob}
                onChange={(e) => { setDob(e.target.value); setError(""); }}
                className="w-full px-4 py-3 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-base focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary"
              />

              {error && <p className="text-sm text-wf-red mt-2">{error}</p>}
              <div className="mt-6 flex gap-3">
                <Btn onClick={() => { setStep("otp"); setError(""); }}>
                  Back
                </Btn>
                <Btn primary onClick={handleNameSubmit} className="flex-1">
                  Continue
                </Btn>
              </div>
            </>
          )}

          {/* Step 4: DPDP Consent */}
          {step === "consent" && (
            <>
              <h2 className="text-lg font-bold text-wf-text mb-1">Privacy Consent</h2>
              <p className="text-sm text-wf-subtext mb-6">
                Digital Personal Data Protection (DPDP) compliance. The customer can choose what data to share.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-semibold text-wf-text">Visit History</div>
                    <div className="text-xs text-wf-subtext">Store visit & try-on records</div>
                  </div>
                  <Toggle on={consentHistory} onToggle={() => setConsentHistory(!consentHistory)} />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-semibold text-wf-text">WhatsApp Updates</div>
                    <div className="text-xs text-wf-subtext">Offers, new arrivals & reminders</div>
                  </div>
                  <Toggle on={consentMessages} onToggle={() => setConsentMessages(!consentMessages)} />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-semibold text-wf-text">AI Personalization</div>
                    <div className="text-xs text-wf-subtext">Smart recommendations based on preferences</div>
                  </div>
                  <Toggle on={consentAi} onToggle={() => setConsentAi(!consentAi)} />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-semibold text-wf-text">Photos</div>
                    <div className="text-xs text-wf-subtext">Virtual try-on images saved to profile</div>
                  </div>
                  <Toggle on={consentPhotos} onToggle={() => setConsentPhotos(!consentPhotos)} />
                </div>
              </div>

              {error && <p className="text-sm text-wf-red mt-4">{error}</p>}

              <div className="mt-6 flex gap-3">
                <Btn onClick={() => { setStep("name"); setError(""); }}>
                  Back
                </Btn>
                <Btn primary onClick={handleSave} disabled={loading} className="flex-1">
                  {loading ? "Saving..." : "Save & Continue"}
                </Btn>
              </div>
            </>
          )}
        </div>

        {/* Back to welcome */}
        <button
          onClick={() => router.push("/tablet")}
          className="block w-full text-center text-xs text-wf-muted mt-4 hover:text-wf-subtext cursor-pointer"
        >
          Back to Welcome
        </button>
      </div>
    </div>
  );
}
