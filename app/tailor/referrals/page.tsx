"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge, Tabs, PageLoading } from "@/components/ui/wearify-ui";

const FILTER_TABS = ["All", "New", "Contacted", "Quoted", "Confirmed", "Declined"];

export default function TailorReferralsPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch {
      // ignore
    }
  }, []);

  const referrals = useQuery(
    api.tailorOps.listReferrals,
    tailorId ? { tailorId } : "skip"
  );

  if (!tailorId || referrals === undefined) {
    return <PageLoading />;
  }

  const filtered =
    filter === "All"
      ? referrals
      : referrals.filter((r) => r.status === filter.toLowerCase());

  function statusToBadge(status: string) {
    switch (status) {
      case "new": return "open";
      case "contacted": return "progress";
      case "quoted": return "pending";
      case "confirmed": return "active";
      case "declined": return "terminated";
      case "completed": return "verified";
      default: return "planned";
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/tailor")}
          className="p-1 rounded-lg hover:bg-wf-card transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wf-text">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-wf-text">Referrals</h1>
        <span className="text-sm text-wf-muted ml-auto">{referrals.length} total</span>
      </div>

      {/* Filter Tabs */}
      <Tabs items={FILTER_TABS} active={filter} onChange={setFilter} />

      {/* Referral List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-wf-muted">No referrals found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ref) => (
            <div
              key={ref._id}
              onClick={() => router.push(`/tailor/referrals/${ref._id}`)}
              className="bg-wf-card rounded-lg p-4 border border-wf-border cursor-pointer hover:border-wf-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-wf-text">{ref.customerName}</div>
                  <div className="text-xs text-wf-subtext mt-0.5">
                    {ref.saree || "General Service"} {ref.fabric ? `- ${ref.fabric}` : ""}
                  </div>
                </div>
                <Badge status={statusToBadge(ref.status)}>{ref.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-wf-muted">
                {ref.storeName && <span>Store: {ref.storeName}</span>}
                {ref.occasion && <span>Occasion: {ref.occasion}</span>}
                {ref.budget && <span>Budget: {ref.budget}</span>}
                <span>{ref.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
