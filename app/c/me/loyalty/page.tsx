"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Flower2,
  Snowflake,
  Award,
  Crown,
  Check,
} from "lucide-react";

const MAROON = "#6E262B";

type Tier = {
  name: string;
  min: number;
  accent: string;
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  benefits: string[];
};

const TIERS: Tier[] = [
  {
    name: "Regular",
    min: 0,
    accent: "#C7565C",
    cardBg: "#FCEFF1",
    cardBorder: "#F4DDE0",
    iconBg: "#F7DCE0",
    Icon: Flower2,
    benefits: ["Earn points on every visit", "Access to new collections"],
  },
  {
    name: "Silver",
    min: 1000,
    accent: "#8A93A0",
    cardBg: "#F4F5F7",
    cardBorder: "#E7E9ED",
    iconBg: "#E4E7EC",
    Icon: Snowflake,
    benefits: [
      "All Regular benefits",
      "5% extra discount on purchases",
      "Priority booking for events",
    ],
  },
  {
    name: "Gold",
    min: 5000,
    accent: "#D6A12C",
    cardBg: "#FBF4E6",
    cardBorder: "#F1E4C6",
    iconBg: "#F3E4C2",
    Icon: Award,
    benefits: [
      "All Silver benefits",
      "10% extra discount on purchases",
      "Free alterations",
      "Early access to sales",
    ],
  },
  {
    name: "VIP",
    min: 15000,
    accent: "#8B5CC4",
    cardBg: "#F6F1FB",
    cardBorder: "#E9DEF5",
    iconBg: "#E9DEF5",
    Icon: Crown,
    benefits: [
      "All Gold benefits",
      "Personal stylist consultation",
      "15% extra discount",
      "Complimentary home delivery",
      "Exclusive VIP events",
    ],
  },
];

export default function LoyaltyPage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [visible, setVisible] = useState(5);

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
      <div className="cx-loading">
        <div className="cx-typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const c = customer as Record<string, unknown>;
  const points = (c.loyaltyPoints as number) ?? 0;
  const currentTierName = (c.loyaltyTier as string) || "Regular";
  const storeCredit = (c.storeCredit as number) ?? 0;
  const nextTier = TIERS.find((t) => t.min > points);
  const progressPct = nextTier ? Math.min((points / nextTier.min) * 100, 100) : 100;
  const txns = (transactions as any[]) || [];

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#FFFFFF",
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* ── APP BAR ───────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#FFFFFF",
          padding: "calc(env(safe-area-inset-top,0px) + 14px) 16px 14px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="cx-press"
          style={{
            background: "none",
            border: "none",
            padding: 4,
            cursor: "pointer",
            display: "flex",
            color: "#2A2522",
          }}
        >
          <ChevronLeft size={24} strokeWidth={2.2} />
        </button>
        <h1
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 15,
            fontWeight: 700,
            color: "#2A2522",
            letterSpacing: "0.06em",
            margin: 0,
            marginRight: 28,
          }}
        >
          LOYALTY &amp; CREDITS
        </h1>
      </header>

      <div style={{ padding: "18px 16px 32px" }}>
        {/* Heading */}
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#1C1714",
            margin: "0 0 16px",
            letterSpacing: "-0.01em",
          }}
        >
          Your rewards at a glance
        </h2>

        {/* ── Tier card ───────────────────────────────────── */}
        <div
          style={{
            background:
              "radial-gradient(130% 130% at 78% 18%, #8A3438 0%, #5E2125 52%, #3F1518 100%)",
            borderRadius: 18,
            padding: "18px 18px 20px",
            marginBottom: 16,
            color: "#FBF7F1",
            boxShadow: "0 10px 26px rgba(94,33,37,0.28)",
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
              <div style={{ fontSize: 12, color: "rgba(253,247,241,0.66)" }}>
                Current Tier
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 1 }}>
                {currentTierName}
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.28)",
                  color: "rgba(253,247,241,0.9)",
                }}
              >
                Valid until Dec 31, 2026
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "rgba(253,247,241,0.66)" }}>
                Total Points
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  lineHeight: 1,
                  marginTop: 4,
                }}
              >
                {points.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: "rgba(253,247,241,0.6)" }}>
                pts
              </div>
            </div>
          </div>

          {/* Progress */}
          {nextTier && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11.5,
                  color: "rgba(253,247,241,0.7)",
                  marginBottom: 7,
                }}
              >
                <span>Progress to {nextTier.name}</span>
                <span>
                  {points.toLocaleString()}/{nextTier.min.toLocaleString()} pts
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 100,
                  background: "rgba(253,247,241,0.22)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 100,
                    width: `${Math.max(progressPct, 4)}%`,
                    background:
                      "linear-gradient(90deg, #F6A23B 0%, #F8C66B 100%)",
                    transition: "width .6s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "rgba(253,247,241,0.7)",
                  marginTop: 7,
                }}
              >
                {(nextTier.min - points).toLocaleString()} points to{" "}
                {nextTier.name}
              </div>
            </div>
          )}
        </div>

        {/* ── Wallet credits ──────────────────────────────── */}
        <div
          style={{
            background: "linear-gradient(180deg, #F4CE6D 0%, #EFC156 100%)",
            borderRadius: 16,
            padding: "16px 18px",
            marginBottom: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 12.5, color: "#7A5A12", fontWeight: 600 }}>
              Wallet Credits
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#3A2A08",
                marginTop: 2,
              }}
            >
              ₹{storeCredit.toLocaleString()}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/customer/loyalty-credits/wallet-card.svg"
            alt=""
            style={{ width: 42, height: 33 }}
          />
        </div>

        {/* ── Tier benefits ───────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1C1714" }}>
            Tier Benefits
          </div>
          <button
            className="cx-press"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12.5,
              fontWeight: 600,
              color: MAROON,
            }}
          >
            View all tiers <ChevronRight size={15} strokeWidth={2.4} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                background: tier.cardBg,
                border: `1px solid ${tier.cardBorder}`,
                borderRadius: 14,
                padding: 13,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: tier.iconBg,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <tier.Icon size={14} color={tier.accent} strokeWidth={2} />
                </span>
                <span
                  style={{ fontWeight: 700, fontSize: 14, color: "#1C1714" }}
                >
                  {tier.name}
                </span>
                {tier.name === currentTierName && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      padding: "2px 7px",
                      borderRadius: 100,
                      background: "#C2484E",
                      color: "#fff",
                    }}
                  >
                    YOU
                  </span>
                )}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                {tier.benefits.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 5,
                      fontSize: 11,
                      color: "#5A4F48",
                      lineHeight: 1.3,
                    }}
                  >
                    <span
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: "50%",
                        border: `1.4px solid ${tier.accent}`,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Check size={8} color={tier.accent} strokeWidth={3} />
                    </span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Points history ──────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1C1714" }}>
            Points History
          </div>
          <button
            className="cx-press"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12.5,
              fontWeight: 500,
              color: "#9A8F8A",
            }}
          >
            All Transactions <SlidersHorizontal size={14} strokeWidth={2} />
          </button>
        </div>

        <div
          style={{
            border: "1px solid #F0E6E3",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          {/* column header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 1.45fr 0.85fr 0.55fr",
              gap: 6,
              padding: "11px 14px",
              background: "#FAF7F5",
              borderBottom: "1px solid #F0E6E3",
              fontSize: 10.5,
              fontWeight: 600,
              color: "#9A8F8A",
            }}
          >
            <span>Date</span>
            <span>Description</span>
            <span>Type</span>
            <span style={{ textAlign: "right" }}>Points</span>
          </div>

          {transactions === undefined ? (
            <div style={{ padding: "28px 0", textAlign: "center" }}>
              <div className="cx-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : txns.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 14px",
                fontSize: 12.5,
                color: "#9A8F8A",
              }}
            >
              No transactions yet
            </div>
          ) : (
            txns.slice(0, visible).map((txn, i) => {
              const earned = (txn.type as string) === "earn";
              const [datePart, timePart] = splitDate(txn.date as string);
              return (
                <div
                  key={String(txn._id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.15fr 1.45fr 0.85fr 0.55fr",
                    gap: 6,
                    alignItems: "center",
                    padding: "12px 14px",
                    borderBottom:
                      i < Math.min(visible, txns.length) - 1
                        ? "1px solid #F4ECE9"
                        : "none",
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: 11.5, fontWeight: 600, color: "#2A2522" }}
                    >
                      {datePart}
                    </div>
                    {timePart && (
                      <div style={{ fontSize: 10.5, color: "#A99F9A", marginTop: 1 }}>
                        {timePart}
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#2A2522",
                        textTransform: "capitalize",
                      }}
                    >
                      {txn.reason as string}
                    </div>
                    {txn.storeId && (
                      <div
                        style={{
                          fontSize: 10.5,
                          color: "#A99F9A",
                          marginTop: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {String(txn.storeId)}
                      </div>
                    )}
                  </div>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 100,
                        background: earned ? "#E3F4E8" : "#FBE3E1",
                        color: earned ? "#1E7A3D" : "#C0392B",
                      }}
                    >
                      {earned ? "Earned" : "Redeemed"}
                    </span>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: earned ? "#1E7A3D" : "#C0392B",
                    }}
                  >
                    {earned ? "+" : "-"}
                    {txn.points as number}
                  </div>
                </div>
              );
            })
          )}

          {txns.length > visible && (
            <button
              onClick={() => setVisible((v) => v + 5)}
              className="cx-press"
              style={{
                width: "100%",
                padding: "12px 0",
                background: "#FAF7F5",
                border: "none",
                borderTop: "1px solid #F0E6E3",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#2A2522",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              Load More <ChevronDown size={15} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Split "May 20, 2024 · 02:35 PM" or "May 20, 2024" into [date, time]. */
function splitDate(raw: string): [string, string] {
  if (!raw) return ["", ""];
  const parts = raw.split(/\s*[·•|]\s*/);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(" ")];
  return [raw, ""];
}
