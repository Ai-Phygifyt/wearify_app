"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KPI, Card, Badge, PageLoading, Btn } from "@/components/ui/wearify-ui";

export default function TailorHomePage() {
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

  const newReferrals = useQuery(
    api.tailorOps.listNewReferrals,
    tailorId ? { tailorId } : "skip"
  );

  const orders = useQuery(
    api.tailorOps.listOrders,
    tailorId ? { tailorId } : "skip"
  );

  if (!tailorId || profile === undefined) {
    return <PageLoading />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-wf-subtext">Profile not found.</p>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const activeOrders = orders?.filter(
    (o) => o.status !== "delivered"
  ).length ?? 0;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-wf-primary/10 flex items-center justify-center text-base font-bold text-wf-primary flex-shrink-0">
          {initials}
        </div>
        <div>
          <div className="text-lg font-bold text-wf-text">Hello, {profile.name.split(" ")[0]}</div>
          <div className="text-sm text-wf-subtext">{profile.city}{profile.area ? `, ${profile.area}` : ""}</div>
        </div>
        {profile.badge && (
          <Badge status={profile.badge === "pro" ? "verified" : profile.badge === "verified" ? "verified" : "pending"}>
            {profile.badge}
          </Badge>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3">
        <KPI label="Leads This Month" value={profile.leadsThisMonth ?? 0} />
        <KPI label="Earned This Month" value={`Rs.${profile.earnedThisMonth ?? 0}`} />
        <KPI
          label="Rating"
          value={profile.rating > 0 ? profile.rating.toFixed(1) : "New"}
          subtitle={profile.reviewCount ? `${profile.reviewCount} reviews` : undefined}
        />
        <KPI label="Active Orders" value={activeOrders} />
      </div>

      {/* New Referrals */}
      <Card
        title="New Referrals"
        action={
          newReferrals && newReferrals.length > 0 ? (
            <Badge status="open">{newReferrals.length} new</Badge>
          ) : null
        }
      >
        {!newReferrals || newReferrals.length === 0 ? (
          <p className="text-sm text-wf-muted py-2">No new referrals yet.</p>
        ) : (
          <div className="space-y-2">
            {newReferrals.slice(0, 5).map((ref) => (
              <div
                key={ref._id}
                onClick={() => router.push(`/tailor/referrals/${ref._id}`)}
                className="flex items-center justify-between py-2 border-b border-wf-border last:border-b-0 cursor-pointer hover:bg-wf-primary/5 -mx-2 px-2 rounded transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-wf-text">{ref.customerName}</div>
                  <div className="text-xs text-wf-subtext">
                    {ref.saree || "General"} {ref.fabric ? `- ${ref.fabric}` : ""}
                  </div>
                  <div className="text-[10px] text-wf-muted mt-0.5">
                    {ref.storeName || "Direct"} &middot; {ref.date}
                  </div>
                </div>
                <Badge status="open">new</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Btn
          className="text-center text-xs"
          onClick={() => router.push("/tailor/referrals")}
        >
          View All Referrals
        </Btn>
        <Btn
          className="text-center text-xs"
          onClick={() => router.push("/tailor/orders")}
        >
          My Orders
        </Btn>
        <Btn
          className="text-center text-xs"
          onClick={() => router.push("/tailor/profile/portfolio")}
        >
          My Portfolio
        </Btn>
      </div>
    </div>
  );
}
