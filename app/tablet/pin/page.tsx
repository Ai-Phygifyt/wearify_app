"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TabletPinPage() {
  const router = useRouter();
  const staffPinLogin = useMutation(api.phoneAuth.staffPinLogin);

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeId, setStoreId] = useState("");

  useEffect(() => {
    const storeRaw = localStorage.getItem("wearify_tablet_store");
    if (storeRaw) {
      try {
        const s = JSON.parse(storeRaw);
        setStoreName(s.storeName);
        setStoreId(s.storeId);
      } catch { /* ignore */ }
    } else {
      router.replace("/tablet/setup");
    }
  }, [router]);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length >= 4) return;
    setPin((prev) => prev + digit);
    setError("");
  }, [pin]);

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (pin.length !== 4 || !storeId) return;
    setLoading(true);
    setError("");
    try {
      const result = await staffPinLogin({ storeId, pin });
      if (result.success) {
        localStorage.setItem(
          "wearify_tablet_staff",
          JSON.stringify({
            staffId: result.staffId,
            name: result.name,
            role: result.role,
            storeId: result.storeId,
          })
        );
        // Hard navigation to avoid layout race condition with stale staffData state
        window.location.href = "/tablet";
      } else {
        setError(result.error || "Invalid PIN");
        setPin("");
      }
    } catch {
      setError("Login failed. Please try again.");
      setPin("");
    } finally {
      setLoading(false);
    }
  }, [pin, storeId, staffPinLogin, router]);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin, handleSubmit]);

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="min-h-screen bg-wf-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-wf-primary mb-1">
            Wearify
          </h1>
          <p className="text-sm text-wf-subtext">{storeName}</p>
        </div>

        {/* PIN card */}
        <div className="bg-wf-card rounded-lg border border-wf-border p-8">
          <h2 className="text-lg font-bold text-wf-text text-center mb-6">
            Staff Login
          </h2>

          {/* PIN dots */}
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  i < pin.length
                    ? "bg-wf-primary scale-110"
                    : "bg-wf-border"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-wf-red text-center mb-4">{error}</p>
          )}

          {/* Numeric keypad: 3x4 grid */}
          <div className="grid grid-cols-3 gap-3">
            {digits.map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                disabled={loading}
                className="h-16 rounded-lg bg-wf-bg border border-wf-border text-xl font-bold text-wf-text hover:bg-wf-primary/10 active:bg-wf-primary/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                {d}
              </button>
            ))}

            {/* Bottom row: Backspace, 0, Enter */}
            <button
              onClick={handleBackspace}
              disabled={loading || pin.length === 0}
              className="h-16 rounded-lg bg-wf-bg border border-wf-border text-sm font-semibold text-wf-subtext hover:bg-wf-red/10 active:bg-wf-red/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              DEL
            </button>
            <button
              onClick={() => handleDigit("0")}
              disabled={loading}
              className="h-16 rounded-lg bg-wf-bg border border-wf-border text-xl font-bold text-wf-text hover:bg-wf-primary/10 active:bg-wf-primary/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              0
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || pin.length !== 4}
              className="h-16 rounded-lg bg-wf-primary text-white text-sm font-bold hover:bg-wf-primary/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "..." : "GO"}
            </button>
          </div>
        </div>

        {/* Reset tablet link */}
        <button
          onClick={() => {
            localStorage.removeItem("wearify_tablet_store");
            localStorage.removeItem("wearify_tablet_staff");
            localStorage.removeItem("wearify_tablet_session");
            router.replace("/tablet/setup");
          }}
          className="block w-full text-center text-xs text-wf-muted mt-4 hover:text-wf-subtext cursor-pointer"
        >
          Reset Tablet Configuration
        </button>
      </div>
    </div>
  );
}
