"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const QUICK_ACTIONS = [
  { label: "Add Item",   icon: "add-item",   href: "/store/inventory/add" },
  { label: "Customers",  icon: "customers",  href: "/store/customers" },
  { label: "Staff",      icon: "staff",      href: "/store/staff" },
  { label: "Campaigns",  icon: "campaigns",  href: "/store/campaigns" },
  { label: "Analytics",  icon: "analytics",  href: "/store/analytics" },
  { label: "Settings",   icon: "settings",   href: "/store/settings" },
];

function QAIcon({ name }: { name: string }) {
  const s = 22;
  const stroke = "var(--w-gold)";
  const props = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: "1.7", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "add-item":
      return (
        <svg {...props}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      );
    case "customers":
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "staff":
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      );
    case "campaigns":
      return (
        <svg {...props}>
          <path d="M22 2L11 13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...props}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default: return null;
  }
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function SessionBadge({ status }: { status: string }) {
  const cls =
    status === "active" ? "w-badge w-badge-success" :
    status === "completed" ? "w-badge w-badge-teal" :
    "w-badge w-badge-warn";
  return <span className={cls}>{status}</span>;
}

function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "72px 0" }}>
      <div className="w-loadscreen-inner">
        <div className="w-load-mark">
          <span className="w-logomark-letter" style={{ fontSize: 18 }}>W</span>
        </div>
        <div>
          <span className="w-load-text">Loading dashboard</span>
          <span className="w-load-dots"><span /><span /><span /></span>
        </div>
      </div>
    </div>
  );
}

function HealthRing({ score, catalogPct, sessionPct, crmPct }: {
  score: number; catalogPct: number; sessionPct: number; crmPct: number;
}) {
  const pct = Math.min(Math.max(score, 0), 100);
  const ringColor =
    pct > 80 ? "var(--w-success)" :
    pct >= 60 ? "var(--w-warn)" : "var(--w-danger)";
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  const bars = [
    { label: "Catalogue", pct: catalogPct, cls: "w-hbar-fill-teal" },
    { label: "Sessions",  pct: sessionPct, cls: "w-hbar-fill-gold" },
    { label: "CRM",       pct: crmPct,     cls: "w-hbar-fill-navy" },
  ];

  return (
    <div className="w-health-wrap">
      <div className="w-health-ring-col">
        <svg width="108" height="108" viewBox="0 0 108 108" style={{ filter: "drop-shadow(0 4px 14px rgba(28,17,8,0.10))" }}>
          <circle cx="54" cy="54" r={r} fill="none" stroke="var(--w-cream-border)" strokeWidth="8" />
          <circle
            cx="54" cy="54" r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 54 54)"
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
          <text x="54" y="49" textAnchor="middle" dominantBaseline="central"
            fill="var(--w-navy)" fontSize="28" fontWeight="600"
            fontFamily="'DM Mono', monospace">
            {pct}
          </text>
          <text x="54" y="68" textAnchor="middle"
            fill="var(--w-ink-muted)" fontSize="8.5" fontWeight="600"
            fontFamily="'DM Sans', sans-serif" letterSpacing="0.8">
            STORE HEALTH
          </text>
        </svg>
      </div>
      <div className="w-health-bars-col">
        <div className="w-health-bars-title">Health breakdown</div>
        {bars.map((b) => (
          <div key={b.label} className="w-hbar-row">
            <span className="w-hbar-label">{b.label}</span>
            <div className="w-progress" style={{ flex: 1 }}>
              <div className={`w-progress-fill ${b.cls}`} style={{ width: `${b.pct}%` }} />
            </div>
            <span className="w-hbar-pct">{b.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StoreDashboard() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (u.storeId) setStoreId(u.storeId);
      if (u.name) setOwnerName(u.name.split(" ")[0]);
      if (u.storeName) setStoreName(u.storeName);
    } catch { /* ignore */ }
  }, []);

  const store    = useQuery(api.stores.getByStoreId, storeId ? { storeId } : "skip");
  const sessions = useQuery(api.sessionOps.listSessionsByStore, storeId ? { storeId } : "skip");
  const sarees   = useQuery(api.sarees.listByStore, storeId ? { storeId } : "skip");

  if (!storeId) return <LoadingState />;

  const healthScore    = store?.healthScore ?? 0;
  const conversionRate = store?.conversionRate ?? 0;
  const sessionCount   = store?.sessions ?? 0;
  const catalogPct     = store?.catalogUtilization ?? 0;
  const featurePct     = store?.featureScore ?? 0;
  const crmPct         = Math.min(100, Math.round((store?.sessions ?? 0) / 2));
  const activeSessions = sessions?.filter((s) => s.status === "active").length ?? 0;
  const recentSessions = (sessions ?? []).slice(0, 5);
  const todayRevenue   = Math.round((store?.mrr ?? 0) / 30);
  const lowStockCount  = sarees?.filter((s) => s.status === "low_stock").length ?? 0;
  const agingCount     = sarees?.filter((s) => (s.daysOld ?? 0) >= 60).length ?? 0;

  return (
    <div className="w-dash">

      {/* ── Greeting ── */}
      <div className="w-greeting">
        <p className="w-greeting-sub">{storeName || "Your Store"} · {formatDate()}</p>
        <h1 className="w-greeting-title w-display">
          {getGreeting()},<br />{ownerName || "there"}
        </h1>
        <div className="w-rule-gold" style={{ marginTop: 16, width: 64 }} />
      </div>

      {/* ── Store Health ── */}
      <div className="w-card w-card-gold w-section-health">
        <HealthRing score={healthScore} catalogPct={catalogPct} sessionPct={featurePct} crmPct={crmPct} />
      </div>

      {/* ── KPI Grid ── */}
      <div className="w-kpi-grid">
        <div className="w-kpi-card w-card">
          <div className="w-kpi-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="w-mono w-kpi-value">₹{todayRevenue.toLocaleString("en-IN")}</div>
          <div className="w-kpi-label">Today Revenue</div>
        </div>

        <div className="w-kpi-card w-card">
          <div className="w-kpi-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="w-mono w-kpi-value">{recentSessions.filter((s) => s.customerPhone).length}</div>
          <div className="w-kpi-label">Customers</div>
        </div>

        <div className="w-kpi-card w-card">
          <div className="w-kpi-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div className="w-mono w-kpi-value">{conversionRate}%</div>
          <div className="w-kpi-label">Conversion</div>
          {conversionRate > 0 && <span className="w-badge w-badge-success" style={{ marginTop: 6 }}>active</span>}
        </div>

        <div className="w-kpi-card w-card">
          <div className="w-kpi-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <div className="w-mono w-kpi-value">{sessionCount}</div>
          <div className="w-kpi-label">Sessions</div>
          {activeSessions > 0 && <span className="w-badge w-badge-success" style={{ marginTop: 6 }}>{activeSessions} live</span>}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="w-qa-section">
        <div className="w-section-label">Quick actions</div>
        <div className="w-qa-grid">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              className="w-qa-btn w-card"
              onClick={() => router.push(action.href)}
            >
              <div style={{
                width: 44, height: 44,
                borderRadius: "var(--w-r-sm)",
                background: "var(--w-gold-mist)",
                border: "1px solid rgba(184,134,11,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
              }}>
                <QAIcon name={action.icon} />
              </div>
              <span className="w-qa-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Sessions ── */}
      <div className="w-card w-sessions-card">
        <div className="w-card-header">
          <span className="w-card-title">Recent Sessions</span>
          <button className="w-btn w-btn-ghost w-btn-sm" onClick={() => router.push("/store/analytics")}>
            View all
          </button>
        </div>
        {recentSessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="1.5" style={{ marginBottom: 10 }}>
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <p className="w-empty-state">No sessions yet</p>
          </div>
        ) : (
          <div className="w-session-list">
            {recentSessions.map((session, idx) => (
              <div key={session._id} className={`w-session-row${idx > 0 ? " w-session-row--border" : ""}`}>
                <div className="w-session-info">
                  <div className="w-mono w-session-id">{session.sessionId}</div>
                  <div className="w-session-staff">{session.staffName || "Staff"}</div>
                </div>
                <div className="w-session-meta">
                  <SessionBadge status={session.status} />
                  <span className="w-session-time">{timeAgo(session.startTime)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Alerts ── */}
      {(agingCount > 0 || lowStockCount > 0) && (
        <div className="w-alerts">
          <div className="w-section-label">Alerts</div>
          {agingCount > 0 && (
            <div className="w-alert w-alert--warn">
              <div className="w-alert-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <div className="w-alert-title">Aging Inventory</div>
                <div className="w-alert-body">{agingCount} saree{agingCount > 1 ? "s" : ""} sitting 60+ days without movement</div>
              </div>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="w-alert w-alert--danger">
              <div className="w-alert-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <div className="w-alert-title">Low Stock Alert</div>
                <div className="w-alert-body">{lowStockCount} item{lowStockCount > 1 ? "s" : ""} running low on inventory</div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
