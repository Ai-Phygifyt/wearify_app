"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Btn } from "@/components/ui/wearify-ui";
import { Id } from "@/convex/_generated/dataModel";
import { useUploadFile } from "@/lib/useUpload";
import {
  Gender,
  HeightUnit,
  MIN_HEIGHT_CM,
  MAX_HEIGHT_CM,
  cmToFtIn,
  ftInToCm,
  clampHeightCm,
  ageFromDob,
  initialsOf,
  maxDobToday,
  validateProfile,
  validatePhoto,
} from "@/lib/profileHelpers";

type Step = "phone" | "otp" | "profile";

export default function TabletRegisterPage() {
  const router = useRouter();
  const verifyOtp = useMutation(api.phoneAuth.verifyOtp);
  const loginWithOtp = useMutation(api.phoneAuth.loginWithOtp);
  const completeProfile = useMutation(api.customers.completeProfile);
  const { upload } = useUploadFile();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Profile
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCm, setHeightCmState] = useState<number>(160);
  const [ftVal, setFtVal] = useState<number>(5);
  const [inVal, setInVal] = useState<number>(3);
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [photoFileId, setPhotoFileId] = useState<Id<"_storage"> | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const initials = useMemo(() => initialsOf(fullName || "U"), [fullName]);
  const maxDob = useMemo(() => maxDobToday(), []);

  function handleSendOtp() {
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setStep("otp");
    setOtpDigits(["", "", "", "", "", ""]);
    setTimeout(() => otpRefs.current[0]?.focus(), 80);
  }

  const submitOtp = useCallback(async (digits: string[]) => {
    const otp = digits.join("");
    if (otp.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      const r = await verifyOtp({ phone: `+91${phone}`, otp });
      if (r.success) {
        setStep("profile");
      } else {
        setError(r.error || "Invalid OTP");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 80);
      }
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  }, [phone, verifyOtp]);

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

  function setHeightCm(n: number) {
    const clamped = clampHeightCm(n);
    setHeightCmState(clamped);
    const ftIn = cmToFtIn(clamped);
    setFtVal(ftIn.ft);
    setInVal(ftIn.inch);
  }
  function setHeightFromFtIn(ft: number, inch: number) {
    setFtVal(ft);
    setInVal(inch);
    setHeightCmState(ftInToCm(ft, inch));
  }

  async function handlePhotoPick(file: File) {
    if (!file) return;
    const photoErr = validatePhoto(file);
    if (photoErr) { setError(photoErr); return; }
    setError("");
    setPhotoUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    try {
      const id = await upload(file);
      setPhotoFileId(id);
    } catch {
      setError("Photo upload failed. Try again.");
      setPhotoPreview("");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleFinish() {
    const err = validateProfile({ fullName, dob, gender, heightCm, city, email });
    if (err) { setError(err); return; }
    setError("");
    setSaving(true);
    try {
      const login = await loginWithOtp({
        phone: `+91${phone}`,
        otp: otpDigits.join(""),
        role: "customer",
        name: fullName.trim(),
        allowCreate: true,
      });
      if (!login.success || !login.customerId) {
        setError(login.error || "Registration failed");
        setSaving(false);
        return;
      }
      const customerId = login.customerId as Id<"customers">;
      await completeProfile({
        customerId,
        name: fullName.trim(),
        dateOfBirth: dob,
        gender: gender as string,
        heightCm,
        heightUnit,
        city: city.trim(),
        email: email.trim() || undefined,
        photoFileId: photoFileId ?? undefined,
      });
      localStorage.setItem(
        "wearify_tablet_customer",
        JSON.stringify({
          customerId,
          phone: `+91${phone}`,
          name: fullName.trim(),
        })
      );
      router.push("/tablet/occasion");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress bar (3 dots) */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {(["phone", "otp", "profile"] as Step[]).map((s, i) => {
            const done = (["phone", "otp", "profile"] as Step[]).indexOf(step) >= i;
            return (
              <div key={s}
                className={`h-1 w-10 rounded-full transition-colors ${done ? "bg-wf-gold" : "bg-wf-border"}`}
              />
            );
          })}
        </div>

        <div className="bg-wf-card rounded-lg border border-wf-border p-8">
          {/* Step 1: PHONE */}
          {step === "phone" && (
            <>
              <h2 className="text-lg font-bold text-wf-text mb-1">New Customer</h2>
              <p className="text-sm text-wf-subtext mb-6">Enter customer phone number</p>

              <label className="block text-sm font-semibold text-wf-text mb-2">Phone Number</label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-3 rounded-lg bg-wf-bg border border-wf-border text-sm font-mono text-wf-subtext">+91</span>
                <input
                  type="tel" inputMode="numeric" value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                  placeholder="9876543210"
                  className="flex-1 px-4 py-3 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-base font-mono focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary placeholder:text-wf-muted"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-wf-red mt-2">{error}</p>}
              <div className="mt-6">
                <Btn primary onClick={handleSendOtp} className="w-full">Send OTP</Btn>
              </div>
            </>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <>
              <h2 className="text-lg font-bold text-wf-text mb-1">Verify OTP</h2>
              <p className="text-sm text-wf-subtext mb-6">Enter the 6-digit code sent to +91 {phone}</p>

              <div className="flex justify-center gap-2 mb-3">
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="tel" inputMode="numeric" maxLength={1} value={d}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-xl font-mono text-center focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary"
                  />
                ))}
              </div>
              {error && <p className="text-sm text-wf-red mt-2 text-center">{error}</p>}
              <p className="text-xs text-wf-muted mt-2 text-center">Demo OTP: 123456</p>
              <div className="mt-6 flex gap-3">
                <Btn onClick={() => { setStep("phone"); setOtpDigits(["", "", "", "", "", ""]); setError(""); }}>Back</Btn>
                <Btn primary onClick={() => submitOtp(otpDigits)} disabled={loading || otpDigits.join("").length !== 6} className="flex-1">
                  {loading ? "Verifying..." : "Verify"}
                </Btn>
              </div>
            </>
          )}

          {/* Step 3: FULL PROFILE */}
          {step === "profile" && (
            <>
              <h2 className="text-lg font-bold text-wf-text mb-1">Customer Profile</h2>
              <p className="text-sm text-wf-subtext mb-5">
                Complete the customer&apos;s profile so try-on history and recommendations carry across kiosk and the Wearify app.
              </p>

              {/* Photo */}
              <div className="flex justify-center mb-4">
                <label htmlFor="tablet-photo-input" className="relative w-24 h-24 rounded-full border-2 border-wf-gold bg-gradient-to-br from-wf-primary to-wf-primary/70 flex items-center justify-center cursor-pointer overflow-hidden shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-wf-gold italic">{initials}</span>
                  )}
                  {photoUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold">
                      Uploading...
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-wf-gold border-2 border-wf-card flex items-center justify-center text-white text-xs">
                    {photoPreview ? "✎" : "+"}
                  </div>
                  <input id="tablet-photo-input" type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoPick(f); }}
                    className="hidden" />
                </label>
              </div>

              {error && <p className="text-sm text-wf-red mb-3 text-center">{error}</p>}

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-wf-subtext mb-1">Full Name *</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-sm focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-wf-subtext mb-1">Date of Birth *</label>
                  <input type="date" value={dob} max={maxDob} onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-sm focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary" />
                  {dob && ageFromDob(dob) !== null && ageFromDob(dob)! >= 13 && (
                    <div className="text-xs text-wf-muted mt-1">Age: {ageFromDob(dob)}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-wf-subtext mb-1">Gender *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([["female","Female"],["male","Male"],["other","Other"],["prefer_not_to_say","Prefer not to say"]] as const).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setGender(v)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          gender === v
                            ? "border border-wf-gold bg-wf-gold/10 text-wf-gold"
                            : "border border-wf-border bg-wf-bg text-wf-text hover:bg-wf-border/30"
                        }`}>{l}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-wf-subtext">Height *</label>
                    <div className="flex gap-0.5 bg-wf-bg rounded-full p-0.5 border border-wf-border">
                      {(["cm","ftin"] as const).map((u) => (
                        <button key={u} type="button" onClick={() => setHeightUnit(u)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                            heightUnit === u ? "bg-wf-primary text-white" : "bg-transparent text-wf-subtext"
                          }`}>{u === "cm" ? "cm" : "ft / in"}</button>
                      ))}
                    </div>
                  </div>
                  {heightUnit === "cm" ? (
                    <input type="number" min={MIN_HEIGHT_CM} max={MAX_HEIGHT_CM} value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-sm focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary" />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center border border-wf-border rounded-lg bg-wf-bg overflow-hidden">
                        <input type="number" min={3} max={7} value={ftVal}
                          onChange={(e) => setHeightFromFtIn(Number(e.target.value), inVal)}
                          className="flex-1 px-3 py-2 bg-transparent text-wf-text text-sm focus:outline-none" />
                        <span className="pr-3 text-xs text-wf-muted">ft</span>
                      </div>
                      <div className="flex items-center border border-wf-border rounded-lg bg-wf-bg overflow-hidden">
                        <input type="number" min={0} max={11} value={inVal}
                          onChange={(e) => setHeightFromFtIn(ftVal, Number(e.target.value))}
                          className="flex-1 px-3 py-2 bg-transparent text-wf-text text-sm focus:outline-none" />
                        <span className="pr-3 text-xs text-wf-muted">in</span>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-wf-muted mt-1">
                    {heightUnit === "cm"
                      ? `${cmToFtIn(heightCm).ft} ft ${cmToFtIn(heightCm).inch} in`
                      : `${heightCm} cm`}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-wf-subtext mb-1">City *</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-sm focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-wf-subtext mb-1">Email (optional)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-sm focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary" />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <Btn onClick={() => { setStep("otp"); setError(""); }}>Back</Btn>
                <Btn primary onClick={handleFinish} disabled={saving || photoUploading} className="flex-1">
                  {saving ? "Saving..." : "Finish & Continue"}
                </Btn>
              </div>
              <p className="text-[11px] text-wf-muted text-center mt-3">
                DPDP consent defaults applied — customer can update in the Wearify app.
              </p>
            </>
          )}
        </div>

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
