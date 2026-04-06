"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const QUICK_LINKS = [
  { emoji: "💰", label: "Revenue Detail", subtitle: "Daily & monthly breakdown", color: "#1B5E20" },
  { emoji: "📊", label: "Category Report", subtitle: "Performance by saree type", color: "#1A4A65" },
  { emoji: "❤️", label: "Health Score", subtitle: "Store health metrics", color: "#B71C1C" },
  { emoji: "🤖", label: "AI Forecast", subtitle: "Demand predictions", color: "#C9941A" },
  { emoji: "🏆", label: "Staff Leaderboard", subtitle: "Team performance ranking", color: "#E65100" },
  { emoji: "📦", label: "Dead Stock", subtitle: "Slow-moving inventory", color: "#7A6E8A" },
];

export default function AnalyticsPage() {
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch {
      /* ignore */
    }
  }, []);

  const sarees = useQuery(api.sarees.listByStore, storeId ? { storeId } : "skip");
  const store = useQuery(api.stores.getByStoreId, storeId ? { storeId } : "skip");

  if (!storeId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading...</span>
      </div>
    );
  }

  // Derive KPIs from sarees data
  const totalRevenue = (sarees ?? []).reduce((acc, s) => acc + s.price * (s.conversions ?? 0), 0);
  const totalConversions = (sarees ?? []).reduce((acc, s) => acc + (s.conversions ?? 0), 0);
  const totalTryOns = (sarees ?? []).reduce((acc, s) => acc + (s.tryOns ?? 0), 0);
  const avgBasket = totalConversions > 0 ? Math.round(totalRevenue / totalConversions) : 0;
  const conversionRate = totalTryOns > 0 ? Math.round((totalConversions / totalTryOns) * 100) : (store?.conversionRate ?? 0);
  const footfall = store?.sessions ?? 0;

  // Revenue by category (saree type)
  const categoryMap: Record<string, number> = {};
  (sarees ?? []).forEach((s) => {
    const rev = s.price * (s.conversions ?? 0);
    categoryMap[s.type] = (categoryMap[s.type] || 0) + rev;
  });
  const categoryData = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCategoryRev = categoryData.length > 0 ? categoryData[0][1] : 1;

  // AI Insight
  const topType = categoryData.length > 0 ? categoryData[0][0] : "Banarasi";
  const lowStockCount = (sarees ?? []).filter((s) => s.stock <= 5 && s.stock > 0).length;
  const aiInsight = `${topType} sarees are driving ${categoryData.length > 0 ? Math.round((categoryData[0][1] / (totalRevenue || 1)) * 100) : 0}% of your revenue this period. ${lowStockCount > 0 ? `${lowStockCount} items are running low on stock -- consider reordering soon.` : "Inventory levels look healthy."}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <h1
        className="rt-serif"
        style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--rt-navy)", margin: 0 }}
      >
        Analytics
      </h1>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <KPICard label="Revenue" value={`Rs${totalRevenue.toLocaleString("en-IN")}`} subtitle="Total estimated" />
        <KPICard label="Avg Basket" value={`Rs${avgBasket.toLocaleString("en-IN")}`} subtitle="Per conversion" />
        <KPICard label="Conversion" value={`${conversionRate}%`} subtitle="Try-on to buy" />
        <KPICard label="Footfall" value={String(footfall)} subtitle="Total sessions" />
      </div>

      {/* Quick Links Grid */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--rt-navy)", marginBottom: 10 }}>Quick Reports</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {QUICK_LINKS.map((link) => (
            <div
              key={link.label}
              className="rt-card"
              style={{ cursor: "pointer", padding: "12px 14px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${link.color}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {link.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--rt-text)" }}>{link.label}</div>
                  <div style={{ fontSize: 11, color: "var(--rt-muted)" }}>{link.subtitle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="rt-card">
        <div className="rt-card-title">Revenue by Category</div>
        {sarees === undefined ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <span style={{ fontSize: 13, color: "var(--rt-muted)" }}>Loading...</span>
          </div>
        ) : categoryData.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--rt-muted)", textAlign: "center", padding: "16px 0" }}>
            No sales data yet
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {categoryData.map(([type, rev], idx) => {
              const pct = Math.round((rev / maxCategoryRev) * 100);
              const barColors = [
                "linear-gradient(90deg, #0A1628, #1A4A65)",
                "linear-gradient(90deg, #C9941A, #E8B84A)",
                "linear-gradient(90deg, #1A4A65, #2A6A85)",
                "linear-gradient(90deg, #1B5E20, #2E7D32)",
                "linear-gradient(90deg, #E65100, #FF8F00)",
              ];
              return (
                <div key={type}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rt-text)" }}>{type}</span>
                    <span className="rt-mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--rt-text-mid)" }}>
                      Rs{rev.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: "var(--rt-border)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: 4,
                        background: barColors[idx % barColors.length],
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Insight */}
      <div
        className="rt-card"
        style={{
          background: "rgba(26, 74, 101, 0.06)",
          border: "1px solid rgba(26, 74, 101, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-teal)", marginBottom: 4 }}>
              AI Insight
            </div>
            <div style={{ fontSize: 13, color: "var(--rt-text-mid)", lineHeight: 1.5 }}>
              {aiInsight}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="rt-card" style={{ padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: "var(--rt-muted)", marginBottom: 4 }}>{label}</div>
      <div className="rt-mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--rt-text)" }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: "var(--rt-muted)", marginTop: 2 }}>{subtitle}</div>
      )}
    </div>
  );
}
