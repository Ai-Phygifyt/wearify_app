"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KPI, Card, Tabs, Badge, Btn, PageLoading } from "@/components/ui/wearify-ui";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StoresPage() {
  const stores = useQuery(api.stores.list);
  const stats = useQuery(api.stores.getStats);
  const [tab, setTab] = useState("Registry");
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  if (!stores || !stats) return <PageLoading />;

  const filtered =
    filter === "all"
      ? stores
      : stores.filter((s) => s.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-wf-text mb-1">
            Store Network
          </h1>
          <p className="text-sm text-wf-subtext">
            {stats.total} stores — ₹{(stats.totalMrr / 1000).toFixed(0)}K MRR
          </p>
        </div>
        <Link href="/admin/stores/onboard">
          <Btn primary>+ Onboard New Store</Btn>
        </Link>
      </div>

      {/* KPI Row */}
      <div className="flex gap-3 mb-4">
        <KPI label="Total Stores" value={stats.total} />
        <KPI label="Active" value={stats.active} subtitle="Paying" />
        <KPI label="Trial" value={stats.trial} color="var(--color-wf-amber)" />
        <KPI label="Churned" value={stats.churned} color="var(--color-wf-red)" />
        <KPI label="Avg Health" value={`${stats.avgHealth}/100`} />
        <KPI label="MRR" value={`₹${(stats.totalMrr / 1000).toFixed(0)}K`} />
      </div>

      <Tabs
        items={["Registry", "Tailors", "Content", "Field Ops", "Deployment", "Health", "Catalog QA", "Training"]}
        active={tab}
        onChange={setTab}
      />

      {tab === "Registry" && (
        <div>
          {/* Filters */}
          <div className="flex gap-1.5 mb-4">
            {["all", "active", "trial", "churned"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  filter === f
                    ? "bg-wf-primary text-wf-bg"
                    : "bg-wf-card text-wf-subtext border border-wf-border hover:bg-wf-border/50"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Store Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-wf-border text-xs font-bold text-wf-muted uppercase tracking-wider">
                    <th className="text-left py-2 pr-4">ID</th>
                    <th className="text-left py-2 pr-4">Store</th>
                    <th className="text-left py-2 pr-4">City</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2 pr-4">Plan</th>
                    <th className="text-right py-2 pr-4">MRR</th>
                    <th className="text-right py-2 pr-4">Health</th>
                    <th className="text-right py-2 pr-4">Conv %</th>
                    <th className="text-right py-2 pr-4">Sessions</th>
                    <th className="text-right py-2">Churn</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((store) => (
                    <tr
                      key={store._id}
                      onClick={() => router.push(`/admin/stores/${store.storeId}`)}
                      className="border-b border-wf-border hover:bg-wf-primary/5 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-xs text-wf-muted">
                        {store.storeId}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-sm">
                        {store.name}
                      </td>
                      <td className="py-3 pr-4 text-sm text-wf-subtext">
                        {store.city}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge status={store.status}>{store.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-sm font-mono">
                        {store.plan}
                      </td>
                      <td className="py-3 pr-4 text-right text-sm font-mono">
                        ₹{store.mrr > 0 ? `${(store.mrr / 1000).toFixed(0)}K` : "—"}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <span
                          className="text-sm font-mono font-semibold"
                          style={{
                            color:
                              store.healthScore > 90
                                ? "var(--color-wf-green)"
                                : store.healthScore > 70
                                  ? "var(--color-wf-amber)"
                                  : "var(--color-wf-red)",
                          }}
                        >
                          {store.healthScore || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right text-sm font-mono text-wf-subtext">
                        {store.conversionRate}%
                      </td>
                      <td className="py-3 pr-4 text-right text-sm font-mono text-wf-subtext">
                        {store.sessions}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className="text-sm font-mono font-semibold"
                          style={{
                            color:
                              store.churnRisk < 20
                                ? "var(--color-wf-green)"
                                : store.churnRisk < 40
                                  ? "var(--color-wf-amber)"
                                  : "var(--color-wf-red)",
                          }}
                        >
                          {store.churnRisk}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab !== "Registry" && (
        <Card>
          <div className="text-center py-10 text-wf-muted text-sm">
            <span className="text-2xl mb-3 block">🚧</span>
            {tab} — Coming in Phase 1c
          </div>
        </Card>
      )}
    </div>
  );
}
