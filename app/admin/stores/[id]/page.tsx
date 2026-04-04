"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KPI, Card, Badge, Row, Metric, PageLoading } from "@/components/ui/wearify-ui";
import Link from "next/link";
import { use } from "react";

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const store = useQuery(api.stores.getByStoreId, { storeId: id });
  const devices = useQuery(api.devices.getByStoreId, { storeId: id });

  if (!store) return <PageLoading />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Link href="/admin/stores" className="text-[10px] text-wf-muted hover:text-wf-primary no-underline transition-colors">
          ← Stores
        </Link>
        <span className="text-[10px] text-wf-muted">/</span>
        <span className="text-[10px] text-wf-text font-semibold">{store.name}</span>
      </div>

      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-base font-extrabold text-wf-text mb-0.5">
            {store.name}
          </h1>
          <p className="text-[10px] text-wf-subtext">
            {store.storeId} — {store.city} — {store.plan} Plan
          </p>
        </div>
        <Badge status={store.status}>{store.status}</Badge>
      </div>

      {/* KPI Row */}
      <div className="flex gap-2 mb-3">
        <KPI label="MRR" value={`₹${store.mrr > 0 ? (store.mrr / 1000).toFixed(0) + "K" : "—"}`} />
        <KPI label="Health Score" value={`${store.healthScore}/100`} />
        <KPI label="Conversion" value={`${store.conversionRate}%`} />
        <KPI label="Sessions" value={store.sessions} />
        <KPI label="Churn Risk" value={`${store.churnRisk}%`} color={store.churnRisk > 30 ? "var(--color-wf-red)" : "var(--color-wf-green)"} />
        <KPI label="Features" value={`${store.featureScore}/100`} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Store Profile */}
        <Card title="Store Profile">
          {[
            ["Owner", store.ownerName || "—"],
            ["Phone", store.ownerPhone || "—"],
            ["Email", store.ownerEmail || "—"],
            ["GSTIN", store.gstin || "—"],
            ["City", store.city],
            ["Address", store.address || "—"],
            ["Agreement", store.agreementStatus],
            ["Billing", store.billingCycle || "Monthly"],
            ["Discount", store.discountCode || "—"],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-1 text-[9px] border-b border-wf-border last:border-0">
              <span className="text-wf-subtext">{l}</span>
              <span className="font-semibold text-wf-text">{v}</span>
            </div>
          ))}
        </Card>

        {/* Health Metrics */}
        <Card title="Health Metrics">
          <Metric label="Health Score" value={String(store.healthScore)} color={store.healthScore > 90 ? "var(--color-wf-green)" : "var(--color-wf-amber)"} />
          <Metric label="Conversion" value={String(store.conversionRate)} color="var(--color-wf-blue)" />
          <Metric label="Feature Adoption" value={String(store.featureScore)} />
          <Metric label="Catalog Utilization" value={String(store.catalogUtilization)} color="var(--color-wf-green)" />
          <Metric label="Churn Risk" value={String(store.churnRisk)} color={store.churnRisk > 30 ? "var(--color-wf-red)" : "var(--color-wf-green)"} />
        </Card>
      </div>

      {/* Devices at Store */}
      <Card title={`Devices at ${store.name}`} className="mt-2">
        {devices && devices.length > 0 ? (
          devices.map((d) => (
            <Row key={d._id}>
              <span className="w-[60px] font-mono text-[8px] text-wf-muted">{d.deviceId}</span>
              <span className="flex-1 text-[10px] font-semibold">{d.type}</span>
              <Badge status={d.status}>{d.status}</Badge>
              <span className="text-[8px] text-wf-subtext">{d.lastSeen} ago</span>
            </Row>
          ))
        ) : (
          <p className="text-[9px] text-wf-muted py-2">No devices assigned</p>
        )}
      </Card>

      {/* Onboarding Status */}
      <Card title="Onboarding Progress" className="mt-2">
        <div className="flex gap-1 mb-2">
          {["Profile", "KYC Docs", "Legal", "Plan", "Deploy"].map((step, i) => (
            <div
              key={step}
              className={`flex-1 h-[4px] rounded ${
                i < store.onboardingStep ? "bg-wf-green" : "bg-wf-border"
              }`}
            />
          ))}
        </div>
        <div className="text-[9px] text-wf-subtext">
          Step {store.onboardingStep}/5 — {store.onboardingStep === 5 ? "Completed" : "In Progress"}
        </div>
      </Card>
    </div>
  );
}
