"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function BillingPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch { /* ignore */ }
  }, []);

  const store = useQuery(api.stores.getByStoreId, storeId ? { storeId } : "skip");

  if (!storeId || store === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading...</span>
      </div>
    );
  }

  if (!store) {
    return (
      <div style={{ padding: "32px 0", textAlign: "center" }}>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Store not found.</span>
      </div>
    );
  }

  const planName = store.subscriptionPlan || store.plan || "Starter";
  const mrr = store.mrr ?? 0;
  const billingCycle = store.billingCycle || "Monthly";
  const nextBillingDate = store.nextBillingDate;
  const agreementStatus = store.agreementStatus;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => router.push("/store/settings")}
          style={{ padding: 6, border: "none", background: "transparent", cursor: "pointer" }}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rt-navy)" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="rt-serif" style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--rt-navy)", margin: 0 }}>
          Billing
        </h1>
      </div>

      {/* Plan card */}
      <div
        style={{
          background: "linear-gradient(135deg, #0A1628, #1A4A65)",
          borderRadius: "var(--rt-radius)",
          padding: "22px 20px",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              Current Plan
            </div>
            <div className="rt-serif" style={{ fontSize: 24, fontWeight: 700, fontStyle: "italic" }}>
              {planName}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="rt-mono" style={{ fontSize: 22, fontWeight: 700, color: "#C9941A" }}>
              Rs{mrr.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>/{billingCycle.toLowerCase()}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", gap: 6 }}>
          <Row label="Billing cycle" value={billingCycle} />
          <Row label="Next billing" value={nextBillingDate ? formatDate(nextBillingDate) : "Not scheduled"} />
          <Row label="Agreement" value={capitalize(agreementStatus)} />
        </div>
      </div>

      {/* Payment method */}
      <div className="rt-card">
        <div className="rt-card-title">Payment Method</div>
        <div style={{ fontSize: 14, color: "var(--rt-text)" }}>
          {store.paymentMethod ? capitalize(store.paymentMethod) : "Not configured"}
        </div>
        {store.bankName && (
          <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 4 }}>
            {store.bankName}
            {store.bankAccount ? ` · A/C •••• ${store.bankAccount.slice(-4)}` : ""}
          </div>
        )}
      </div>

      {/* GST */}
      {(store.gstin || store.pan) && (
        <div className="rt-card">
          <div className="rt-card-title">Tax Details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {store.gstin && <KV label="GSTIN" value={store.gstin} mono />}
            {store.pan && <KV label="PAN" value={store.pan} mono />}
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, color: "var(--rt-muted)", textAlign: "center", padding: "4px 16px" }}>
        To change plan or update payment method, contact your Wearify account manager.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: "var(--rt-muted)" }}>{label}</span>
      <span className={mono ? "rt-mono" : undefined} style={{ color: "var(--rt-text)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function capitalize(s: string | undefined): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
