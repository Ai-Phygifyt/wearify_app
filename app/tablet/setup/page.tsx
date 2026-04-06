"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Btn } from "@/components/ui/wearify-ui";

export default function TabletSetupPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Only query when submitted
  const store = useQuery(
    api.stores.getByStoreId,
    submitted && storeId.trim() ? { storeId: storeId.trim() } : "skip"
  );

  // Handle result after query resolves
  React.useEffect(() => {
    if (!submitted) return;
    if (store === undefined) return; // still loading

    if (store === null) {
      setError("Store not found. Please check the Store ID.");
      setSubmitted(false);
      return;
    }

    // Valid store found -- save and redirect
    localStorage.setItem(
      "wearify_tablet_store",
      JSON.stringify({ storeId: store.storeId, storeName: store.name })
    );
    router.replace("/tablet/pin");
  }, [store, submitted, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!storeId.trim()) {
      setError("Please enter a Store ID");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-wf-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-wf-primary mb-1">
            Wearify
          </h1>
          <p className="text-sm text-wf-subtext">
            Tablet Setup
          </p>
        </div>

        {/* Setup card */}
        <div className="bg-wf-card rounded-lg border border-wf-border p-8">
          <h2 className="text-lg font-bold text-wf-text mb-1">
            Configure Tablet
          </h2>
          <p className="text-sm text-wf-subtext mb-6">
            Enter your store ID to link this tablet to your store.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-wf-text mb-2">
              Store ID
            </label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => {
                setStoreId(e.target.value.toUpperCase());
                setError("");
                setSubmitted(false);
              }}
              placeholder="e.g. ST-001"
              className="w-full px-4 py-3 rounded-lg border border-wf-border bg-wf-bg text-wf-text text-base font-mono focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary placeholder:text-wf-muted"
            />

            {error && (
              <p className="text-sm text-wf-red mt-2">{error}</p>
            )}

            <div className="mt-6">
              <Btn
                primary
                onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                disabled={submitted && store === undefined}
                className="w-full"
              >
                {submitted && store === undefined ? "Validating..." : "Link Tablet"}
              </Btn>
            </div>
          </form>
        </div>

        <p className="text-xs text-wf-muted text-center mt-4">
          Contact your administrator if you do not have a Store ID.
        </p>
      </div>
    </div>
  );
}
