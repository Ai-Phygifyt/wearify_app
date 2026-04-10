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
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}>
        <div style={{ textAlign: "center", width: "100%", maxWidth: 440 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--k-green-bg)", border: "2px solid rgba(45,133,68,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32, color: "var(--k-green)" }}>
            ✓
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--k-text)", margin: "0 0 8px" }}>Kiosk Configured</h1>
          <p style={{ fontSize: 15, color: "var(--k-text-muted)", margin: "0 0 6px" }}>
            Store: <strong style={{ color: "var(--k-text)" }}>{store?.name}</strong>
          </p>
          <p style={{ fontSize: 13, color: "var(--k-text-light)", margin: "0 0 28px" }}>
            {store?.city} · {store?.storeId}
          </p>
          <button
            onClick={() => (window.location.href = "/kiosk")}
            style={{
              padding: "14px 40px",
              borderRadius: 14,
              background: "var(--k-maroon)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Launch Kiosk →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(107,26,26,.1)", border: "1.5px solid rgba(107,26,26,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--k-gold)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>W</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--k-text)", margin: "0 0 6px", letterSpacing: -0.5 }}>
            Kiosk Setup
          </h1>
          <p style={{ fontSize: 14, color: "var(--k-text-muted)", margin: 0 }}>
            One-time configuration by technician
          </p>
        </div>

        {step === "store" && (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--k-text-mid)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Store ID
            </label>
            <input
              type="text"
              value={storeIdInput}
              onChange={(e) => { setStoreIdInput(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleValidateStore()}
              placeholder="e.g. ST-001"
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: 12,
                background: "var(--k-card)",
                border: "1.5px solid var(--k-border)",
                color: "var(--k-text)",
                fontSize: 16,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: 1,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 16,
              }}
            />

            {error && (
              <p style={{ fontSize: 13, color: "var(--k-red)", margin: "0 0 12px", textAlign: "center" }}>{error}</p>
            )}

            <button
              onClick={handleValidateStore}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                background: "var(--k-maroon)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Validate Store
            </button>
          </div>
        )}

        {step === "code" && (
          <div>
            {/* Verified store info */}
            <div style={{
              padding: "14px 18px",
              borderRadius: 12,
              background: "var(--k-green-bg)",
              border: "1px solid rgba(45,133,68,.2)",
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, color: "var(--k-green)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontWeight: 600 }}>
                ✓ Store Verified
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--k-text)" }}>{store?.name}</div>
              <div style={{ fontSize: 13, color: "var(--k-text-muted)", marginTop: 2 }}>
                {store?.city} · {store?.storeId}
              </div>
            </div>

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--k-text-mid)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Tablet Code (6 digits)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={tabletCode}
              onChange={(e) => { setTabletCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: 12,
                background: "var(--k-card)",
                border: "1.5px solid var(--k-border)",
                color: "var(--k-text)",
                fontSize: 24,
                fontFamily: "'DM Mono', monospace",
                textAlign: "center",
                letterSpacing: 8,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 6,
              }}
            />
            <p style={{ fontSize: 12, color: "var(--k-text-light)", margin: "0 0 16px", textAlign: "center" }}>
              Default: 123456
            </p>

            {error && (
              <p style={{ fontSize: 13, color: "var(--k-red)", margin: "0 0 12px", textAlign: "center" }}>{error}</p>
            )}

            <button
              onClick={handleSaveConfig}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                background: "var(--k-maroon)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              Save & Launch Kiosk
            </button>

            <button
              onClick={() => { setStep("store"); setValidatedStoreId(""); setError(""); }}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                background: "transparent",
                color: "var(--k-text-muted)",
                border: "1px solid var(--k-border)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
