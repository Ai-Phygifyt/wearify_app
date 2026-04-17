"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ── Icon helpers ─────────────────────────────────────────────────── */
const S = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "var(--w-gold)", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function IconRevenue() { return <svg {...S}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>; }
function IconBasket() { return <svg {...S}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>; }
function IconConversion() { return <svg {...S}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>; }
function IconSessions() { return <svg {...S}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>; }
function IconHealth() { return <svg {...S}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>; }
function IconBox() { return <svg {...S}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>; }
function IconEye() { return <svg {...S}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>; }
function IconTryOn() { return <svg {...S}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>; }
function IconStar() { return <svg {...S}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>; }
function IconAlert() { return <svg {...S}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>; }
function IconCpu() { return <svg {...S}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>; }
function IconTrophy() { return <svg {...S}><polyline points="14 9 12 11 10 9" /><path d="M21 3H3l8 9.46V19l2-1 2 1v-6.54L21 3z" /></svg>; }

const BAR_GRADS = [
  "linear-gradient(90deg, var(--w-navy), var(--w-teal))",
  "linear-gradient(90deg, var(--w-gold), var(--w-gold-bright))",
  "linear-gradient(90deg, var(--w-teal), #2980B9)",
  "linear-gradient(90deg, var(--w-success), #27AE60)",
  "linear-gradient(90deg, #8B4513, #D2691E)",
];

const QUICK_REPORTS = [
  { label: "Revenue Detail",      subtitle: "Daily & monthly breakdown",  Icon: IconRevenue },
  { label: "Category Report",     subtitle: "Performance by saree type",  Icon: IconBasket },
  { label: "Health Score",        subtitle: "Store health metrics",       Icon: IconHealth },
  { label: "AI Forecast",         subtitle: "Demand predictions",        Icon: IconCpu },
  { label: "Staff Leaderboard",   subtitle: "Team performance ranking",   Icon: IconTrophy },
  { label: "Dead Stock",          subtitle: "Slow-moving inventory",      Icon: IconBox },
];

/* ── Mini KPI card ────────────────────────────────────────────────── */
function KpiCard({ icon, label, value, sub, trend }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; trend?: "up" | "down" | null;
}) {
  return (
    <div className="w-kpi-card w-card" style={{ padding: "16px 16px 14px" }}>
      <div className="w-kpi-icon-wrap" style={{ marginBottom: 10 }}>{icon}</div>
      <div className="w-mono w-kpi-value">{value}</div>
      <div className="w-kpi-label">{label}</div>
      {sub && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
          {trend === "up" && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--w-success)" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
          )}
          {trend === "down" && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--w-danger)" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
            </svg>
          )}
          <span style={{ fontSize: 10.5, color: trend === "up" ? "var(--w-success)" : trend === "down" ? "var(--w-danger)" : "var(--w-ink-ghost)", fontWeight: 600 }}>
            {sub}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Funnel bar ───────────────────────────────────────────────────── */
function FunnelStep({ label, value, pct, grad, isLast }: {
  label: string; value: number; pct: number; grad: string; isLast?: boolean;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--w-ink-soft)" }}>{label}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
          <span className="w-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--w-navy)" }}>{value.toLocaleString("en-IN")}</span>
          <span style={{ fontSize: 10.5, color: "var(--w-ink-ghost)" }}>{pct}%</span>
        </div>
      </div>
      <div className="w-progress" style={{ height: 10, marginBottom: isLast ? 0 : 14 }}>
        <div className="w-progress-fill" style={{ width: `${pct}%`, background: grad, transition: "width 0.8s var(--w-spring)" }} />
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (u.storeId) setStoreId(u.storeId);
    } catch { /* */ }
  }, []);

  const sarees = useQuery(api.sarees.listByStore, storeId ? { storeId } : "skip");
  const store  = useQuery(api.stores.getByStoreId, storeId ? { storeId } : "skip");

  const loading = sarees === undefined || store === undefined;

  /* ── Derived metrics ── */
  const totalRevenue     = (sarees ?? []).reduce((a, s) => a + s.price * (s.conversions ?? 0), 0);
  const totalConversions = (sarees ?? []).reduce((a, s) => a + (s.conversions ?? 0), 0);
  const totalTryOns      = (sarees ?? []).reduce((a, s) => a + (s.tryOns ?? 0), 0);
  const totalViews       = (sarees ?? []).reduce((a, s) => a + (s.views ?? 0), 0);
  const avgBasket        = totalConversions > 0 ? Math.round(totalRevenue / totalConversions) : 0;
  const convRate         = totalTryOns > 0 ? Math.round((totalConversions / totalTryOns) * 100) : (store?.conversionRate ?? 0);
  const footfall         = store?.sessions ?? 0;
  const todayRevenue     = Math.round((store?.mrr ?? 0) / 30);

  const totalItems  = (sarees ?? []).length;
  const activeItems = (sarees ?? []).filter((s) => s.approvalStatus === "approved").length;
  const pendingItems = (sarees ?? []).filter((s) => s.approvalStatus === "pending").length;
  const lowStock    = (sarees ?? []).filter((s) => s.stock > 0 && s.stock <= 5).length;
  const outOfStock  = (sarees ?? []).filter((s) => s.stock <= 0).length;
  const agingItems  = (sarees ?? []).filter((s) => (s.daysOld ?? 0) >= 60 && (s.conversions ?? 0) === 0).length;

  /* ── Category revenue breakdown ── */
  const catMap: Record<string, number> = {};
  (sarees ?? []).forEach((s) => {
    const r = s.price * (s.conversions ?? 0);
    catMap[s.type] = (catMap[s.type] || 0) + r;
  });
  const catData = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCatRev = catData[0]?.[1] || 1;

  /* ── Top performers (by revenue) ── */
  const topSarees = [...(sarees ?? [])]
    .filter((s) => (s.conversions ?? 0) > 0)
    .sort((a, b) => b.price * (b.conversions ?? 0) - a.price * (a.conversions ?? 0))
    .slice(0, 5);

  /* ── Funnel percentages ── */
  const maxFunnel   = Math.max(totalViews, totalTryOns, totalConversions, 1);
  const viewsPct    = Math.round((totalViews / maxFunnel) * 100);
  const tryOnsPct   = Math.round((totalTryOns / maxFunnel) * 100);
  const convPct     = Math.round((totalConversions / maxFunnel) * 100);

  /* ── AI insight ── */
  const topType = catData[0]?.[0] ?? "Banarasi";
  const topPct  = catData[0] ? Math.round((catData[0][1] / (totalRevenue || 1)) * 100) : 0;
  const aiInsight = totalRevenue > 0
    ? `${topType} sarees are driving ${topPct}% of your revenue this period.${lowStock > 0 ? ` ${lowStock} item${lowStock > 1 ? "s" : ""} are running low on stock — consider reordering.` : " Inventory levels look healthy."}`
    : `Add sarees to your catalogue and track sessions to unlock revenue insights and AI-powered demand forecasts.`;

  if (!storeId) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "72px 0" }}>
      <div className="w-loadscreen-inner">
        <div className="w-load-mark"><span className="w-logomark-letter" style={{ fontSize: 17 }}>W</span></div>
        <div><span className="w-load-text">Loading analytics</span><span className="w-load-dots"><span /><span /><span /></span></div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* ── Header ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 4 }}>
          Insights
        </p>
        <h1 className="w-serif" style={{ fontSize: 28, fontWeight: 700, fontStyle: "italic", color: "var(--w-navy)", lineHeight: 1.1, margin: 0 }}>
          Analytics
        </h1>
      </div>

      {/* ── KPI grid ── */}
      <div className="w-kpi-grid">
        <KpiCard icon={<IconRevenue />} label="Est. Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} sub="All time" />
        <KpiCard icon={<IconBasket />}  label="Avg Basket"   value={`₹${avgBasket.toLocaleString("en-IN")}`}   sub="Per sale" />
        <KpiCard icon={<IconConversion />} label="Conversion" value={`${convRate}%`} sub={totalTryOns > 0 ? "Try-on → buy" : undefined} trend={convRate > 20 ? "up" : undefined} />
        <KpiCard icon={<IconSessions />}   label="Sessions"   value={String(footfall)} sub={`₹${todayRevenue.toLocaleString("en-IN")} today`} />
      </div>

      {/* ── Sales funnel ── */}
      <div className="w-card w-card-gold" style={{ padding: "20px 22px" }}>
        <div className="w-card-header" style={{ marginBottom: 18 }}>
          <span className="w-card-title">Sales Funnel</span>
          {totalConversions > 0 && (
            <span className="w-badge w-badge-success">{convRate}% close rate</span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <span className="w-load-dots"><span /><span /><span /></span>
          </div>
        ) : totalViews === 0 && totalTryOns === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="1.4" style={{ marginBottom: 10 }}>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <p className="w-serif" style={{ fontSize: 15, fontStyle: "italic", color: "var(--w-ink-soft)" }}>No session data yet</p>
          </div>
        ) : (
          <>
            <FunnelStep label="Views"       value={totalViews}       pct={viewsPct}  grad="linear-gradient(90deg, var(--w-navy), var(--w-teal))" />
            <FunnelStep label="Try-Ons"     value={totalTryOns}      pct={tryOnsPct} grad="linear-gradient(90deg, var(--w-gold), var(--w-gold-bright))" />
            <FunnelStep label="Conversions" value={totalConversions}  pct={convPct}   grad="linear-gradient(90deg, var(--w-success), #27AE60)" isLast />
          </>
        )}
      </div>

      {/* ── Revenue by category ── */}
      <div className="w-card" style={{ padding: "20px 22px" }}>
        <div className="w-card-header" style={{ marginBottom: 16 }}>
          <span className="w-card-title">Revenue by Category</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <span className="w-load-dots"><span /><span /><span /></span>
          </div>
        ) : catData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="1.4" style={{ marginBottom: 10 }}>
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
            </svg>
            <p className="w-serif" style={{ fontSize: 15, fontStyle: "italic", color: "var(--w-ink-soft)" }}>No sales recorded yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {catData.map(([type, rev], i) => {
              const pct = Math.round((rev / maxCatRev) * 100);
              return (
                <div key={type}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--w-ink)" }}>{type}</span>
                    <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                      <span className="w-mono" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--w-navy)" }}>
                        ₹{rev.toLocaleString("en-IN")}
                      </span>
                      <span style={{ fontSize: 10.5, color: "var(--w-ink-ghost)" }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="w-progress" style={{ height: 8 }}>
                    <div className="w-progress-fill" style={{ width: `${pct}%`, background: BAR_GRADS[i % BAR_GRADS.length], transition: "width 0.8s var(--w-spring)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Inventory health ── */}
      <div>
        <div className="w-section-label">Inventory health</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { value: totalItems,   label: "Total",    color: "var(--w-navy)" },
            { value: activeItems,  label: "Live",     color: "var(--w-success)" },
            { value: lowStock,     label: "Low Stock",color: "var(--w-warn)" },
            { value: outOfStock,   label: "Out",      color: "var(--w-danger)" },
          ].map(({ value, label, color }) => (
            <div key={label} className="w-card" style={{ padding: "12px 10px", textAlign: "center" }}>
              <div className="w-mono" style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--w-ink-muted)", marginTop: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {(agingItems > 0 || pendingItems > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {agingItems > 0 && (
              <div className="w-alert w-alert--warn">
                <div className="w-alert-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <div className="w-alert-title">Aging Inventory</div>
                  <div className="w-alert-body">{agingItems} saree{agingItems > 1 ? "s" : ""} have been in catalogue 60+ days without a sale</div>
                </div>
              </div>
            )}
            {pendingItems > 0 && (
              <div className="w-alert w-alert--warn">
                <div className="w-alert-icon"><IconAlert /></div>
                <div>
                  <div className="w-alert-title">Pending Approval</div>
                  <div className="w-alert-body">{pendingItems} item{pendingItems > 1 ? "s" : ""} awaiting admin review before going live</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Top performers ── */}
      {topSarees.length > 0 && (
        <div className="w-card" style={{ padding: "20px 22px" }}>
          <div className="w-card-header" style={{ marginBottom: 14 }}>
            <span className="w-card-title">Top Performers</span>
            <span className="w-badge w-badge-gold">By revenue</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {topSarees.map((s, i) => {
              const rev = s.price * (s.conversions ?? 0);
              const maxRev = topSarees[0].price * (topSarees[0].conversions ?? 0);
              const pct = Math.round((rev / (maxRev || 1)) * 100);
              return (
                <div key={s._id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 0",
                  borderBottom: i < topSarees.length - 1 ? "1px solid var(--w-cream-border)" : "none",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: i === 0 ? "var(--w-gold-mist)" : "var(--w-cream-deep)",
                    border: `1px solid ${i === 0 ? "rgba(184,134,11,0.25)" : "var(--w-cream-border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span className="w-mono" style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? "var(--w-gold)" : "var(--w-ink-ghost)" }}>
                      {i + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--w-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                      {s.name}
                    </div>
                    <div className="w-progress" style={{ height: 4 }}>
                      <div className="w-progress-fill" style={{ width: `${pct}%`, background: i === 0 ? "linear-gradient(90deg, var(--w-gold), var(--w-gold-bright))" : "linear-gradient(90deg, var(--w-navy), var(--w-teal))", transition: "width 0.8s var(--w-spring)" }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="w-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--w-navy)" }}>₹{rev.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: 10.5, color: "var(--w-ink-ghost)" }}>{s.conversions ?? 0} sold</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AI insight ── */}
      <div className="w-card" style={{
        padding: "18px 20px",
        background: "var(--w-teal-soft)",
        border: "1px solid rgba(26,82,118,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "var(--w-r-sm)", flexShrink: 0,
            background: "rgba(26,82,118,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
              <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
              <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
              <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
              <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--w-teal)", marginBottom: 6, letterSpacing: "0.01em" }}>
              AI Insight
            </div>
            <div style={{ fontSize: 13.5, color: "var(--w-ink-soft)", lineHeight: 1.65 }}>
              {aiInsight}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick reports ── */}
      <div>
        <div className="w-section-label">Quick reports</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {QUICK_REPORTS.map(({ label, subtitle, Icon }) => (
            <div key={label} className="w-card" style={{ padding: "14px 16px", cursor: "default", opacity: 0.75 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="w-kpi-icon-wrap" style={{ marginBottom: 0, flexShrink: 0 }}>
                  <Icon />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--w-ink)", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "var(--w-ink-muted)" }}>{subtitle}</div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <span className="w-badge w-badge-navy" style={{ fontSize: 10, letterSpacing: "0.05em" }}>Coming soon</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
