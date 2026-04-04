"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, Btn } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

const STEPS = [
  "Store Profile",
  "Owner KYC",
  "Docs Upload",
  "Legal Agreements",
  "Plan Selection",
  "Staff Setup",
  "Hardware Config",
  "Go Live",
];

type Errors = Record<string, string>;

const VALIDATORS = {
  phone: (v: string) => {
    if (!v.trim()) return "Phone number is required";
    if (!/^\d{10}$/.test(v)) return "Enter a valid 10-digit mobile number";
    return "";
  },
  email: (v: string) => {
    if (!v.trim()) return "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
    return "";
  },
  pan: (v: string) => {
    if (!v.trim()) return "";
    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(v.toUpperCase())) return "PAN must be like AAAPZ1234C";
    return "";
  },
  gstin: (v: string) => {
    if (!v.trim()) return "";
    if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]$/.test(v.toUpperCase()))
      return "GSTIN must be like 22AAAPZ1234C1Z5";
    return "";
  },
  pin: (v: string) => {
    if (!v.trim()) return "";
    if (!/^\d{6}$/.test(v)) return "PIN code must be 6 digits";
    return "";
  },
};

export default function OnboardPage() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [agreements, setAgreements] = useState<Record<string, boolean>>({});
  const [data, setData] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
    pin: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    gstin: "",
    pan: "",
    plan: "Digital",
    billingCycle: "monthly",
    staffName: "",
    staffPhone: "",
    staffRole: "R04",
  });
  const router = useRouter();
  const createStore = useMutation(api.stores.create);

  const upd = (key: string, raw: string) => {
    let val = raw;
    // Enforce input constraints per field
    if (key === "pin") val = raw.replace(/\D/g, "").slice(0, 6);
    if (key === "pan") val = raw.replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase();
    if (key === "gstin") val = raw.replace(/[^A-Za-z0-9]/g, "").slice(0, 15).toUpperCase();
    if (key === "ownerPhone" || key === "staffPhone") {
      // Strip to digits only
      const digits = raw.replace(/\D/g, "");
      // Remove leading 91 if user types it (we add the prefix ourselves)
      const local = digits.startsWith("91") && digits.length > 10 ? digits.slice(2) : digits;
      val = local.slice(0, 10);
    }

    setData((p) => ({ ...p, [key]: val }));
    if (touched[key]) {
      validateField(key, val);
    }
  };

  const touch = (key: string) => {
    setTouched((p) => ({ ...p, [key]: true }));
    validateField(key, (data as Record<string, string>)[key] || "");
  };

  const validateField = (key: string, val: string) => {
    let err = "";
    if (key === "name" && !val.trim()) err = "Store name is required";
    if (key === "city" && !val.trim()) err = "City is required";
    if (key === "ownerName" && !val.trim()) err = "Owner name is required";
    if (key === "ownerPhone") err = VALIDATORS.phone(val);
    if (key === "ownerEmail") err = VALIDATORS.email(val);
    if (key === "pan") err = VALIDATORS.pan(val);
    if (key === "gstin") err = VALIDATORS.gstin(val);
    if (key === "pin") err = VALIDATORS.pin(val);
    setErrors((p) => ({ ...p, [key]: err }));
    return err;
  };

  const validateStep = (): boolean => {
    const newErrors: Errors = {};
    const newTouched: Record<string, boolean> = {};

    if (step === 0) {
      if (!data.name.trim()) { newErrors.name = "Store name is required"; newTouched.name = true; }
      if (!data.city.trim()) { newErrors.city = "City is required"; newTouched.city = true; }
      const pinErr = VALIDATORS.pin(data.pin);
      if (pinErr) { newErrors.pin = pinErr; newTouched.pin = true; }
    }
    if (step === 1) {
      if (!data.ownerName.trim()) { newErrors.ownerName = "Owner name is required"; newTouched.ownerName = true; }
      const phoneErr = VALIDATORS.phone(data.ownerPhone);
      if (phoneErr) { newErrors.ownerPhone = phoneErr; newTouched.ownerPhone = true; }
      const emailErr = VALIDATORS.email(data.ownerEmail);
      if (emailErr) { newErrors.ownerEmail = emailErr; newTouched.ownerEmail = true; }
      const panErr = VALIDATORS.pan(data.pan);
      if (panErr) { newErrors.pan = panErr; newTouched.pan = true; }
      const gstErr = VALIDATORS.gstin(data.gstin);
      if (gstErr) { newErrors.gstin = gstErr; newTouched.gstin = true; }
    }
    if (step === 5) {
      if (data.staffPhone.trim()) {
        const phoneErr = VALIDATORS.phone(data.staffPhone);
        if (phoneErr) { newErrors.staffPhone = phoneErr; newTouched.staffPhone = true; }
      }
    }

    setErrors((p) => ({ ...p, ...newErrors }));
    setTouched((p) => ({ ...p, ...newTouched }));
    return Object.values(newErrors).every((e) => !e);
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleFinish = async () => {
    await createStore({
      storeId: `ST-${String(Date.now()).slice(-3)}`,
      name: data.name,
      city: data.city,
      state: data.state || undefined,
      address: data.address || undefined,
      pin: data.pin || undefined,
      status: "trial",
      plan: data.plan,
      mrr: data.plan === "Smart" ? 15000 : data.plan === "Digital" ? 10000 : 0,
      ownerName: data.ownerName || undefined,
      ownerPhone: data.ownerPhone ? `+91 ${data.ownerPhone}` : undefined,
      ownerEmail: data.ownerEmail || undefined,
      gstin: data.gstin || undefined,
    });
    router.push("/admin/stores");
  };

  const renderInput = (
    label: string,
    key: string,
    placeholder: string,
    options?: { type?: string; required?: boolean; hint?: string; maxLength?: number; prefix?: string }
  ) => {
    const { type = "text", required = false, hint, maxLength, prefix } = options || {};
    const hasError = touched[key] && errors[key];
    const borderClass = hasError
      ? "border-wf-red focus-within:border-wf-red focus-within:ring-wf-red/20"
      : "border-wf-border focus-within:border-wf-primary focus-within:ring-wf-primary/20";
    return (
      <div className="mb-3">
        <label className="block text-sm font-semibold text-wf-subtext mb-1">
          {label} {required && <span className="text-wf-red">*</span>}
        </label>
        {prefix ? (
          <div className={`flex items-center rounded-lg border bg-white focus-within:ring-2 transition-colors ${borderClass}`}>
            <span className="pl-3 pr-1 text-sm font-semibold text-wf-subtext select-none">{prefix}</span>
            <input
              type={type}
              value={(data as Record<string, string>)[key] || ""}
              onChange={(e) => upd(key, e.target.value)}
              onBlur={() => touch(key)}
              placeholder={placeholder}
              maxLength={maxLength}
              className="flex-1 px-2 py-2 bg-transparent text-sm text-wf-text focus:outline-none"
            />
          </div>
        ) : (
          <input
            type={type}
            value={(data as Record<string, string>)[key] || ""}
            onChange={(e) => upd(key, e.target.value)}
            onBlur={() => touch(key)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`w-full px-3 py-2 rounded-lg border bg-white text-sm text-wf-text focus:outline-none focus:ring-2 transition-colors ${
              hasError
                ? "border-wf-red focus:border-wf-red focus:ring-wf-red/20"
                : "border-wf-border focus:border-wf-primary focus:ring-wf-primary/20"
            }`}
          />
        )}
        {hint && !hasError && (
          <p className="text-xs text-wf-muted mt-0.5">{hint}</p>
        )}
        {hasError && (
          <p className="text-xs text-wf-red mt-0.5">{errors[key]}</p>
        )}
      </div>
    );
  };

  const toggleAgreement = (name: string) => {
    setAgreements((p) => ({ ...p, [name]: !p[name] }));
  };

  const allAgreementsSigned = [
    "MSA", "DPA", "AUP", "HW", "SLA"
  ].every((k) => agreements[k]);

  const goLiveChecks = [
    ["Store Profile", data.name.trim() !== "" && data.city.trim() !== ""],
    ["Owner KYC", data.ownerName.trim() !== "" && data.ownerPhone.trim() !== ""],
    ["Documents Uploaded", false],
    ["Legal Agreements Signed", allAgreementsSigned],
    [`Plan Selected: ${data.plan}`, true],
    ["Staff Assigned", data.staffName.trim() !== ""],
    ["Hardware Configured", true],
  ] as [string, boolean][];

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-extrabold text-wf-text mb-0.5">
        Onboard New Store
      </h1>
      <p className="text-sm text-wf-subtext mb-3">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {/* Progress */}
      <div className="flex gap-1 mb-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className={`w-full h-1 rounded transition-colors ${
                i < step
                  ? "bg-wf-green"
                  : i === step
                    ? "bg-wf-primary"
                    : "bg-wf-border"
              }`}
            />
            <span className={`text-[10px] leading-tight ${i <= step ? "text-wf-text font-semibold" : "text-wf-muted"}`}>
              {s}
            </span>
          </div>
        ))}
      </div>

      <Card>
        {step === 0 && (
          <>
            <h3 className="text-sm font-bold text-wf-text mb-3">Store Profile</h3>
            <div className="grid grid-cols-2 gap-x-4">
              <div>{renderInput("Store Name", "name", "e.g. MAUVE Sarees", { required: true })}</div>
              <div>{renderInput("City", "city", "e.g. Mumbai", { required: true })}</div>
              <div>{renderInput("State", "state", "e.g. Maharashtra")}</div>
              <div>{renderInput("PIN Code", "pin", "e.g. 400001", { hint: "6-digit postal code", maxLength: 6 })}</div>
            </div>
            {renderInput("Address", "address", "Full store address")}
          </>
        )}
        {step === 1 && (
          <>
            <h3 className="text-sm font-bold text-wf-text mb-3">Owner KYC</h3>
            <div className="grid grid-cols-2 gap-x-4">
              <div>{renderInput("Owner Name", "ownerName", "Full legal name", { required: true })}</div>
              <div>{renderInput("Phone", "ownerPhone", "9876543210", { required: true, hint: "10-digit mobile number", maxLength: 10, prefix: "+91" })}</div>
              <div>{renderInput("Email", "ownerEmail", "owner@example.com", { type: "email" })}</div>
              <div>{renderInput("PAN", "pan", "AAAPZ1234C", { hint: "e.g. AAAPZ1234C", maxLength: 10 })}</div>
            </div>
            {renderInput("GSTIN", "gstin", "22AAAPZ1234C1Z5", { hint: "15-character GST number", maxLength: 15 })}
          </>
        )}
        {step === 2 && (
          <>
            <h3 className="text-sm font-bold text-wf-text mb-3">Document Upload</h3>
            {["Aadhaar Card", "PAN Card", "GST Certificate", "Shop License", "Store Photo (Exterior)", "Store Photo (Interior)"].map((doc) => (
              <div key={doc} className="flex items-center justify-between py-3 border-b border-wf-border last:border-0">
                <span className="text-sm text-wf-text">{doc}</span>
                <div className="px-4 py-2 rounded-lg border border-dashed border-wf-border text-xs text-wf-muted cursor-pointer hover:border-wf-primary hover:text-wf-primary transition-colors">
                  Upload file
                </div>
              </div>
            ))}
          </>
        )}
        {step === 3 && (
          <>
            <h3 className="text-sm font-bold text-wf-text mb-3">Legal Agreements</h3>
            {[
              ["MSA", "Master Service Agreement (MSA)", "Covers services, SLA, payment terms"],
              ["DPA", "Data Processing Agreement (DPA)", "DPDP Act compliance, camera/CV processing"],
              ["AUP", "Acceptable Use Policy (AUP)", "Mirror usage rules, content guidelines"],
              ["HW", "Hardware Lease Agreement", "Mirror hardware ownership, insurance"],
              ["SLA", "SLA & Support Terms", "99.9% uptime commitment, support hours"],
            ].map(([key, name, desc]) => (
              <div key={key} className="flex items-center gap-3 py-3 border-b border-wf-border last:border-0">
                <input
                  type="checkbox"
                  checked={agreements[key] || false}
                  onChange={() => toggleAgreement(key)}
                  className="w-4 h-4 accent-wf-primary cursor-pointer flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-wf-text">{name}</div>
                  <div className="text-xs text-wf-muted mt-0.5">{desc}</div>
                </div>
                <span className="text-xs text-wf-primary cursor-pointer hover:underline">View PDF</span>
              </div>
            ))}
            {!allAgreementsSigned && (
              <p className="text-xs text-wf-amber mt-3">All agreements must be accepted to proceed.</p>
            )}
          </>
        )}
        {step === 4 && (
          <>
            <h3 className="text-sm font-bold text-wf-text mb-3">Plan Selection</h3>
            {[
              { id: "Trial", price: "Free / 30 days", features: "1 mirror, basic catalog, limited AI" },
              { id: "Digital", price: "₹10,000/mo", features: "1 mirror, full catalog, AI search, WhatsApp" },
              { id: "Smart", price: "₹15,000/mo", features: "2 mirrors, full AI, CRM, campaigns, analytics" },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => upd("plan", p.id)}
                className={`p-3 rounded-lg border-2 mb-2 cursor-pointer transition-all ${
                  data.plan === p.id
                    ? "border-wf-primary bg-wf-primary/5"
                    : "border-wf-border hover:border-wf-primary/30"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-wf-text">{p.id} Plan</span>
                  <span className="text-sm font-semibold text-wf-primary">{p.price}</span>
                </div>
                <div className="text-xs text-wf-subtext mt-0.5">{p.features}</div>
              </div>
            ))}
          </>
        )}
        {step === 5 && (
          <>
            <h3 className="text-sm font-bold text-wf-text mb-3">Staff Setup</h3>
            <div className="grid grid-cols-2 gap-x-4">
              <div>{renderInput("Staff Name", "staffName", "Primary staff member")}</div>
              <div>{renderInput("Staff Phone", "staffPhone", "9876543210", { hint: "10-digit mobile number", maxLength: 10, prefix: "+91" })}</div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-semibold text-wf-subtext mb-1">Role</label>
              <select
                value={data.staffRole}
                onChange={(e) => upd("staffRole", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-wf-border bg-white text-sm text-wf-text focus:outline-none focus:border-wf-primary focus:ring-2 focus:ring-wf-primary/20"
              >
                <option value="R03">Store Owner (R03)</option>
                <option value="R04">Store Manager (R04)</option>
                <option value="R05">Sales Staff (R05)</option>
              </select>
            </div>
          </>
        )}
        {step === 6 && (
          <>
            <h3 className="text-sm font-bold text-wf-text mb-3">Hardware Configuration</h3>
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🪞</div>
              <p className="text-sm text-wf-text font-semibold">Smart Mirror Setup</p>
              <p className="text-xs text-wf-muted mt-1">Hardware: Jetson Orin NX + 55&quot; Touch Display</p>
              <p className="text-xs text-wf-muted">Camera: Intel RealSense D455</p>
              <p className="text-xs text-wf-muted">Network: WiFi 6 / Ethernet</p>
              <div className="mt-3 p-3 rounded-lg bg-wf-bg border border-wf-border">
                <p className="text-xs text-wf-subtext">
                  Hardware will be pre-configured and shipped. Plug-and-play setup with QR provisioning. Expected delivery: 5-7 business days after plan activation.
                </p>
              </div>
            </div>
          </>
        )}
        {step === 7 && (
          <>
            <h3 className="text-sm font-bold text-wf-text mb-3">Go Live Checklist</h3>
            {goLiveChecks.map(([item, done]) => (
              <div key={item} className="flex items-center gap-3 py-2 text-sm">
                <span className={`text-lg ${done ? "text-wf-green" : "text-wf-amber"}`}>
                  {done ? "✓" : "○"}
                </span>
                <span className={done ? "text-wf-text font-medium" : "text-wf-muted"}>{item}</span>
              </div>
            ))}
          </>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <Btn
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          ← Previous
        </Btn>
        {step < STEPS.length - 1 ? (
          <Btn
            primary
            onClick={handleNext}
          >
            Next: {STEPS[step + 1]} →
          </Btn>
        ) : (
          <Btn primary onClick={handleFinish}>
            Go Live
          </Btn>
        )}
      </div>
    </div>
  );
}
