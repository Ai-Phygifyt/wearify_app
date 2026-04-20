"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";

export default function CommissionPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch { /* ignore */ }
  }, []);

  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip"
  );
  const earnings = useQuery(
    api.tailorOps.getEarnings,
    tailorId ? { tailorId } : "skip"
  );
  const commissions = useQuery(
    api.tailorOps.listCommission,
    tailorId ? { tailorId } : "skip"
  );

  if (!tailorId || profile === undefined || earnings === undefined || commissions === undefined) {
    return <PageLoading />;
  }

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <button
          type="button"
          className="t-back"
          onClick={() => router.push("/tailor/profile")}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>Earnings</h1>
        <div style={{ width: 36 }} />
      </div>

      {/* Hero summary */}
      <div style={{ padding: "0 20px 16px" }}>
        <div
          style={{
            background: "linear-gradient(160deg, #1A1512 0%, #2E2620 100%)",
            color: "var(--ivory)",
            borderRadius: "var(--radius-lg)",
            padding: "22px 22px 20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -24, top: -24,
              width: 140, height: 140, borderRadius: 99,
              background: "radial-gradient(circle at 30% 30%, rgba(176,123,26,0.4), transparent 70%)",
            }}
          />
          <div className="t-hero-eyebrow" style={{ position: "relative" }}>Total earned</div>
          <div
            className="t-mono"
            style={{
              position: "relative",
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            ₹{(earnings.totalEarned ?? 0).toLocaleString("en-IN")}
          </div>
          <div className="t-hero-sub" style={{ margin: 0 }}>
            Pending payout{" "}
            <strong className="t-mono" style={{ color: "var(--gold)" }}>
              ₹{(earnings.totalPending ?? 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </div>

      {/* Commission rate card */}
      <div style={{ padding: "0 20px 16px" }}>
        <div className="t-card t-card-inset" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="t-caps" style={{ color: "var(--ink-3)" }}>Platform fee</div>
            <div className="t-serif" style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>
              10% on each order
            </div>
          </div>
          <div
            className="t-mono"
            style={{
              fontSize: 20, fontWeight: 500,
              padding: "6px 12px",
              borderRadius: 99,
              background: "var(--gold-tint)",
              color: "var(--gold-ink)",
            }}
          >
            10%
          </div>
        </div>
      </div>

      {/* History */}
      <div className="t-section-head">
        <h2>History</h2>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{commissions.length} entries</span>
      </div>

      {commissions.length === 0 ? (
        <div className="t-empty">
          <p>No commission records yet. They&apos;ll appear here once your first order completes.</p>
        </div>
      ) : (
        <div style={{ padding: "0 20px" }}>
          <div className="t-card" style={{ padding: 0, overflow: "hidden" }}>
            {commissions.map((entry, idx) => {
              const isPayout = entry.type === "payout";
              const pillClass =
                entry.type === "referral" ? "t-pill-quoted"
                : entry.type === "order" ? "t-pill-confirmed"
                : "t-pill-declined";
              return (
                <div
                  key={entry._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderBottom: idx < commissions.length - 1 ? "1px solid var(--line)" : "none",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, textTransform: "capitalize" }}>
                        {entry.type}
                      </span>
                      <span className={`t-pill ${pillClass}`}>
                        {entry.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3, letterSpacing: "0.03em" }}>
                      {entry.date}
                      {entry.description ? ` · ${entry.description}` : ""}
                    </div>
                  </div>
                  <div
                    className="t-mono"
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: isPayout ? "var(--urgent)" : "var(--ok)",
                      flexShrink: 0,
                    }}
                  >
                    {isPayout ? "−" : "+"}₹{entry.amount.toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ height: 28 }} />
    </div>
  );
}
