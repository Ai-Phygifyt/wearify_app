"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Btn } from "@/components/ui/wearify-ui";

type Step = "phone" | "otp" | "welcome";

export default function TabletPhoneLookupPage() {
  const router = useRouter();
  const verifyOtp = useMutation(api.phoneAuth.verifyOtp);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Query customer when we have a phone
  const customer = useQuery(
    api.customers.getByPhone,
    step !== "phone" && phone ? { phone: `+91${phone}` } : "skip"
  );

  // Query last visit info
  const storeLinks = useQuery(
    api.customers.listStoreLinks,
    customer?._id ? { customerId: customer._id } : "skip"
  );

  const handleSendOtp = () => {
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
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
        if (!customer) {
          setError("No customer found with this phone. Please register as a new customer.");
          setStep("phone");
          setLoading(false);
          return;
        }
        setStep("welcome");
      } else {
        setError(result.error || "Invalid OTP");
      }
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!customer) return;
    localStorage.setItem(
      "wearify_tablet_customer",
      JSON.stringify({
        customerId: customer._id,
        phone: customer.phone,
        name: customer.name,
      })
    );
    router.push("/tablet/occasion");
  };

  // Get store config for last visit
  let lastVisitText = "";
  if (storeLinks && storeLinks.length > 0) {
    const sorted = [...storeLinks].sort((a, b) => {
      if (!a.lastVisit) return 1;
      if (!b.lastVisit) return -1;
      return b.lastVisit.localeCompare(a.lastVisit);
    });
    if (sorted[0]?.lastVisit) {
      lastVisitText = `Last visit: ${sorted[0].lastVisit} at ${sorted[0].storeName || "store"}`;
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-wf-card rounded-lg border border-wf-border p-8">
          {/* Step 1: Phone input */}
          {step === "phone" && (
            <>
              <h2 className="text-lg font-bold text-wf-text mb-1">Returning Customer</h2>
              <p className="text-sm text-wf-subtext mb-6">Enter customer phone number to look up</p>

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
              <div className="mt-6 flex gap-3">
                <Btn onClick={() => router.push("/tablet")}>Back</Btn>
                <Btn primary onClick={handleSendOtp} className="flex-1">
                  Send OTP
                </Btn>
              </div>
            </>
          )}

          {/* Step 2: OTP verification */}
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

          {/* Step 3: Welcome back */}
          {step === "welcome" && customer && (
            <div className="text-center">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-wf-primary/10 flex items-center justify-center text-2xl font-bold text-wf-primary mx-auto mb-4">
                {customer.initials || customer.name.slice(0, 2).toUpperCase()}
              </div>

              <h2 className="text-xl font-extrabold text-wf-text mb-1">
                Welcome back, {customer.name}!
              </h2>
              <p className="text-sm text-wf-subtext mb-2">
                +91 {phone}
              </p>

              {lastVisitText && (
                <p className="text-xs text-wf-muted mb-2">{lastVisitText}</p>
              )}

              {/* Customer stats */}
              <div className="flex justify-center gap-6 my-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-wf-text font-mono">
                    {customer.totalVisits || 0}
                  </div>
                  <div className="text-xs text-wf-subtext">Visits</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-wf-text font-mono">
                    {customer.loyaltyPoints || 0}
                  </div>
                  <div className="text-xs text-wf-subtext">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-wf-text font-mono">
                    {customer.loyaltyTier || "Regular"}
                  </div>
                  <div className="text-xs text-wf-subtext">Tier</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Btn onClick={() => { setStep("phone"); setOtp(""); setPhone(""); setError(""); }}>
                  Different Customer
                </Btn>
                <Btn primary onClick={handleContinue}>
                  Continue
                </Btn>
              </div>
            </div>
          )}
        </div>

        {/* Back link */}
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
