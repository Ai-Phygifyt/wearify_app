"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function KioskSetupPage() {
  const [storeIdInput, setStoreIdInput] = useState("");
  const [tabletCode, setTabletCode] = useState("123456");
  const [step, setStep] = useState<"store" | "code" | "done">("store");
  const [validatedStoreId, setValidatedStoreId] = useState("");
  const [error, setError] = useState("");

  const store = useQuery(
    api.stores.getByStoreId,
    validatedStoreId ? { storeId: validatedStoreId } : "skip"
  );

  const handleValidateStore = () => {
    setError("");
    if (!storeIdInput.trim()) {
      setError("Please enter a store ID");
      return;
    }
    setValidatedStoreId(storeIdInput.trim());
  };

  // When store data arrives, move to code step
  React.useEffect(() => {
    if (validatedStoreId && store === null) {
      setError("Store not found. Check the Store ID.");
      setValidatedStoreId("");
    } else if (validatedStoreId && store) {
      setStep("code");
    }
  }, [store, validatedStoreId]);

  const handleSaveConfig = () => {
    if (tabletCode.length !== 6 || !/^\d{6}$/.test(tabletCode)) {
      setError("Tablet code must be exactly 6 digits");
      return;
    }
    if (!store) return;

    const config = {
      storeId: store.storeId,
      storeName: store.name,
      tabletCode,
    };
    localStorage.setItem("wearify_kiosk_store", JSON.stringify(config));
    window.dispatchEvent(new Event("kiosk-configured"));
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center space-y-6">
          <div className="text-6xl">&#10003;</div>
          <h1 className="text-3xl font-bold text-white">Kiosk Configured</h1>
          <p className="text-white/60 text-lg">
            Store: {store?.name}
          </p>
          <p className="text-white/40 text-base">
            Redirecting to kiosk...
          </p>
          <button
            onClick={() => (window.location.href = "/kiosk")}
            className="mt-4 px-8 py-4 bg-wf-primary text-white rounded-2xl text-lg font-semibold cursor-pointer"
          >
            Launch Kiosk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="w-full max-w-lg mx-auto px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            Wearify Kiosk Setup
          </h1>
          <p className="text-white/50 text-lg">
            One-time configuration by technician
          </p>
        </div>

        {step === "store" && (
          <div className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Store ID
              </label>
              <input
                type="text"
                value={storeIdInput}
                onChange={(e) => {
                  setStoreIdInput(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleValidateStore()}
                placeholder="e.g. ST-001"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder:text-white/30 outline-none focus:border-wf-primary transition-colors"
              />
            </div>

            {error && (
              <p className="text-wf-red text-sm font-medium">{error}</p>
            )}

            <button
              onClick={handleValidateStore}
              className="w-full py-4 bg-wf-primary text-white rounded-xl text-lg font-semibold cursor-pointer hover:bg-wf-primary/90 transition-colors"
            >
              Validate Store
            </button>
          </div>
        )}

        {step === "code" && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl px-5 py-4 border border-white/10">
              <div className="text-white/50 text-xs uppercase tracking-wide mb-1">
                Store Verified
              </div>
              <div className="text-white text-lg font-semibold">
                {store?.name}
              </div>
              <div className="text-white/40 text-sm">
                {store?.city} &middot; {store?.storeId}
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Tablet Code (6 digits)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={tabletCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setTabletCode(val);
                  setError("");
                }}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-2xl text-center tracking-[0.5em] font-mono outline-none focus:border-wf-primary transition-colors"
              />
              <p className="text-white/30 text-xs mt-2">
                Walk-in guests use this code to start a session without a phone number
              </p>
            </div>

            {error && (
              <p className="text-wf-red text-sm font-medium">{error}</p>
            )}

            <button
              onClick={handleSaveConfig}
              className="w-full py-4 bg-wf-primary text-white rounded-xl text-lg font-semibold cursor-pointer hover:bg-wf-primary/90 transition-colors"
            >
              Save &amp; Launch Kiosk
            </button>

            <button
              onClick={() => {
                setStep("store");
                setValidatedStoreId("");
                setError("");
              }}
              className="w-full py-3 bg-transparent text-white/50 border border-white/20 rounded-xl text-sm font-medium cursor-pointer hover:bg-white/5 transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
