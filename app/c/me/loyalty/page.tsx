"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { Badge, Card, PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

const TIERS = [
  { name: "Regular", min: 0, max: 999, color: "#9A8D82" },
  { name: "Silver", min: 1000, max: 4999, color: "#A0A0A0" },
  { name: "Gold", min: 5000, max: 14999, color: "#D4A843" },
  { name: "VIP", min: 15000, max: Infinity, color: "#71221D" },
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
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  const points = customer?.loyaltyPoints ?? 0;
  const currentTierName = customer?.loyaltyTier ?? "Regular";
  const currentTier = TIERS.find((t) => t.name === currentTierName) || TIERS[0];
  const nextTier = TIERS.find((t) => t.min > points);
  const progressMax = nextTier ? nextTier.min : points;
  const progressPct = nextTier
    ? Math.min((points / nextTier.min) * 100, 100)
    : 100;

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="text-wf-primary text-lg cursor-pointer"
        >
          {"\u2190"}
        </button>
        <h1 className="text-lg font-bold text-wf-text">
          Loyalty & Rewards
        </h1>
      </div>

      {/* Current tier card */}
      <div
        className="rounded-xl p-5 mb-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}99)`,
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-white/80 font-medium">
              Current Tier
            </div>
            <div className="text-2xl font-extrabold mt-1">
              {currentTierName}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/80 font-medium">Points</div>
            <div className="text-2xl font-extrabold font-mono mt-1">
              {points.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress bar to next tier */}
        {nextTier && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>{currentTierName}</span>
              <span>{nextTier.name} ({nextTier.min.toLocaleString()} pts)</span>
            </div>
            <div className="h-2 rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-xs text-white/80 mt-1">
              {(nextTier.min - points).toLocaleString()} points to {nextTier.name}
            </div>
          </div>
        )}
      </div>

      {/* Tier benefits */}
      <Card title={`${currentTierName} Benefits`}>
        <div className="space-y-2">
          {(TIER_BENEFITS[currentTierName] || []).map((benefit, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-wf-text">
              <span className="text-wf-green mt-0.5">{"\u2713"}</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Points history */}
      <div className="text-sm font-bold text-wf-text mb-3 mt-5">
        Points History
      </div>
      {transactions === undefined ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-wf-border/50 rounded-lg h-14"
            />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-sm text-wf-muted">
          No transactions yet
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((txn) => (
            <div
              key={txn._id}
              className="bg-wf-card rounded-lg border border-wf-border p-3 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-wf-text capitalize">
                  {txn.reason}
                </div>
                <div className="text-[10px] text-wf-muted mt-0.5">
                  {txn.date}
                </div>
              </div>
              <div
                className={`text-sm font-bold font-mono ${
                  txn.type === "earn" ? "text-wf-green" : "text-wf-red"
                }`}
              >
                {txn.type === "earn" ? "+" : "-"}
                {txn.points}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
