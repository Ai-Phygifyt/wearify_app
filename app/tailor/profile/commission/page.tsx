"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KPI, Card, Badge, PageLoading } from "@/components/ui/wearify-ui";

export default function CommissionPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch {
      // ignore
    }
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

  function typeToBadge(type: string) {
    switch (type) {
      case "referral": return "progress";
      case "order": return "active";
      case "payout": return "paid";
      default: return "planned";
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/tailor/profile")}
          className="p-1 rounded-lg hover:bg-wf-card transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wf-text">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-wf-text">Commission & Earnings</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KPI label="Total Earned" value={`Rs.${earnings.totalEarned}`} />
        <KPI label="Pending Payout" value={`Rs.${earnings.totalPending}`} color="var(--color-wf-amber)" />
        <KPI label="Commission Rate" value="10%" subtitle="Platform fee" />
      </div>

      {/* Commission List */}
      <Card title="Commission History">
        {commissions.length === 0 ? (
          <p className="text-sm text-wf-muted py-2">No commission records yet.</p>
        ) : (
          <div className="space-y-0">
            {commissions.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between py-2.5 border-b border-wf-border last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-wf-text capitalize">{entry.type}</span>
                    <Badge status={entry.status === "paid" ? "paid" : "pending"}>
                      {entry.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-wf-muted mt-0.5">
                    {entry.date}
                    {entry.description && ` - ${entry.description}`}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className={`text-sm font-bold ${
                    entry.type === "payout" ? "text-wf-red" : "text-wf-green"
                  }`}>
                    {entry.type === "payout" ? "-" : "+"}Rs.{entry.amount}
                  </div>
                  <Badge status={typeToBadge(entry.type)} className="mt-0.5">
                    {entry.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
