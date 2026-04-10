"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";

const TIERS = [
  { name: "Regular", min: 0, max: 999, color: "#8B7EA0", icon: "\u2022" },
  { name: "Silver", min: 1000, max: 4999, color: "#A0A0A0", icon: "\u25C7" },
  { name: "Gold", min: 5000, max: 14999, color: "#C9941A", icon: "\u2726" },
  { name: "VIP", min: 15000, max: Infinity, color: "#6B1D52", icon: "\u2605" },
];

const TIER_BENEFITS: Record<string, string[]> = {
  Regular: ["Earn points on every visit", "Access to new collections"],
  Silver: [
    "All Regular benefits",
    "5% extra discount on purchases",
    "Priority booking for events",
  ],
  Gold: [
    "All Silver benefits",
    "10% extra discount on purchases",
    "Free alterations",
    "Early access to sales",
  ],
  VIP: [
    "All Gold benefits",
    "Personal stylist consultation",
    "15% extra discount",
    "Complimentary home delivery",
    "Exclusive VIP events",
  ],
};

export default function LoyaltyPage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const customer = useQuery(
    api.customers.getById,
    customerId ? { customerId } : "skip"
  );

  const transactions = useQuery(
    api.customers.getLoyaltyTransactions,
    customerId ? { customerId } : "skip"
  );

  if (!customerId || customer === undefined) {
    return (
      <div
        className="cx-pageIn"
        style={{
          minHeight: "100%",
          background: "#FDF8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="cx-typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const points = (customer as Record<string, unknown>)?.loyaltyPoints as number ?? 0;
  const currentTierName =
    ((customer as Record<string, unknown>)?.loyaltyTier as string) || "Regular";
  const storeCredit = (customer as Record<string, unknown>)?.storeCredit as number ?? 0;
  const currentTier =
    TIERS.find((t) => t.name === currentTierName) || TIERS[0];
  const nextTier = TIERS.find((t) => t.min > points);
  const progressPct = nextTier
    ? Math.min((points / nextTier.min) * 100, 100)
    : 100;

  return (
    <div
      className="cx-pageIn"
      style={{ minHeight: "100%", background: "#FDF8F0" }}
    >
      {/* ── Hero ────────────────────────────────────────── */}
      <div
        className="cx-noise cx-paisley"
        style={{
          background: "var(--cx-grad-hero)",
          padding: "28px 18px 22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <button
            onClick={() => router.back()}
            className="cx-press"
            style={{
              background: "rgba(253,248,240,.12)",
              border: "1px solid rgba(253,248,240,.18)",
              borderRadius: 100,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FDF8F0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1
            className="cx-serif"
            style={{
              fontSize: 26,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#FDF8F0",
              margin: 0,
            }}
          >
            Loyalty & Credits
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(253,248,240,.55)",
              margin: "4px 0 0",
            }}
          >
            Your rewards at a glance
          </p>
        </div>
      </div>
      <div className="cx-zari" />

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ padding: "20px 18px 32px" }}>
        {/* Tier card */}
        <div
          className="cx-slideUp cx-d1 cx-silk"
          style={{
            background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}cc)`,
            borderRadius: 20,
            padding: "22px 20px",
            marginBottom: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(253,248,240,.7)",
                  fontWeight: 500,
                }}
              >
                Current Tier
              </div>
              <div
                className="cx-serif"
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#FDF8F0",
                  fontStyle: "italic",
                  marginTop: 2,
                }}
              >
                {currentTierName}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(253,248,240,.7)",
                  fontWeight: 500,
                }}
              >
                Points
              </div>
              <div
                className="cx-mono"
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#FDF8F0",
                  marginTop: 2,
                }}
              >
                {points.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {nextTier && (
            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "rgba(253,248,240,.6)",
                  marginBottom: 6,
                }}
              >
                <span>{currentTierName}</span>
                <span>
                  {nextTier.name} ({nextTier.min.toLocaleString()} pts)
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 100,
                  background: "rgba(253,248,240,.2)",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 100,
                    background: "#FDF8F0",
                    width: `${progressPct}%`,
                    transition: "width .6s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(253,248,240,.6)",
                  marginTop: 4,
                }}
              >
                {(nextTier.min - points).toLocaleString()} points to{" "}
                {nextTier.name}
              </div>
            </div>
          )}
        </div>

        {/* Store credit banner */}
        <div
          className="cx-slideUp cx-d2"
          style={{
            background:
              "linear-gradient(135deg, #C9941A 0%, #E8C46A 55%, #C9941A 100%)",
            borderRadius: 16,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "rgba(45,27,78,.6)", fontWeight: 500 }}>
              Wearify Credit
            </div>
            <div
              className="cx-mono"
              style={{ fontSize: 22, fontWeight: 800, color: "#1A0A2E" }}
            >
              \u20B9{storeCredit.toLocaleString()}
            </div>
          </div>
          <svg
            width={28}
            height={28}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1A0A2E"
            strokeWidth="1.6"
            opacity={0.5}
          >
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </div>

        {/* Tier benefits grid */}
        <div className="cx-slideUp cx-d3" style={{ marginBottom: 24 }}>
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1A0A1E",
              fontStyle: "italic",
              marginBottom: 12,
            }}
          >
            Tier Benefits
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                style={{
                  background:
                    tier.name === currentTierName ? "#F4EFF9" : "#FFFFFF",
                  border: `1.5px solid ${tier.name === currentTierName ? "#E8D5E0" : "#F2E8EE"}`,
                  borderRadius: 16,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: tier.color,
                    }}
                  >
                    {tier.icon}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#1A0A1E",
                    }}
                  >
                    {tier.name}
                  </span>
                  {tier.name === currentTierName && (
                    <span
                      style={{
                        fontSize: 9,
                        padding: "1px 6px",
                        borderRadius: 100,
                        background: "#2D1B4E",
                        color: "#FDF8F0",
                        fontWeight: 700,
                        marginLeft: "auto",
                      }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {(TIER_BENEFITS[tier.name] || []).map((b, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 11,
                        color: "#4A3558",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 4,
                        lineHeight: 1.35,
                      }}
                    >
                      <span style={{ color: "#1B5E20", flexShrink: 0 }}>
                        {"\u2713"}
                      </span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction history */}
        <div className="cx-slideUp cx-d4">
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1A0A1E",
              fontStyle: "italic",
              marginBottom: 12,
            }}
          >
            Points History
          </div>

          {transactions === undefined ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 56,
                    borderRadius: 12,
                    background: "#F2E8EE",
                  }}
                />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                fontSize: 13,
                color: "#8B7EA0",
              }}
            >
              No transactions yet
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {transactions.map((txn: Record<string, unknown>) => (
                <div
                  key={txn._id as string}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 14,
                    border: "1px solid #F2E8EE",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 2px 14px rgba(45,27,78,.09)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1A0A1E",
                        textTransform: "capitalize" as const,
                      }}
                    >
                      {txn.reason as string}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#8B7EA0",
                        marginTop: 2,
                      }}
                    >
                      {txn.date as string}
                    </div>
                  </div>
                  <div
                    className="cx-mono"
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color:
                        (txn.type as string) === "earn"
                          ? "#1B5E20"
                          : "#B71C1C",
                    }}
                  >
                    {(txn.type as string) === "earn" ? "+" : "-"}
                    {txn.points as number}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
