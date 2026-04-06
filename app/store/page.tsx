"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const QUICK_ACTIONS = [
  { label: "Add Saree", emoji: "\uD83E\uDDF5", href: "/store/inventory/add" },
  { label: "Customers", emoji: "\uD83D\uDC65", href: "/store/customers" },
  { label: "Staff", emoji: "\uD83D\uDC54", href: "/store/staff" },
  { label: "Campaigns", emoji: "\uD83D\uDCE3", href: "/store/campaigns" },
  { label: "Analytics", emoji: "\uD83D\uDCCA", href: "/store/analytics" },
  { label: "Settings", emoji: "\u2699\uFE0F", href: "/store/settings" },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* -------- Health Score Ring -------- */
function HealthRing({
  score,
  catalogPct,
  sessionPct,
  crmPct,
}: {
  score: number;
  catalogPct: number;
  sessionPct: number;
  crmPct: number;
}) {
  const pct = Math.min(Math.max(score, 0), 100);
  const color =
    pct > 80
      ? "var(--rt-success)"
      : pct >= 60
        ? "var(--rt-amber)"
        : "var(--rt-alert)";
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--rt-border)"
          strokeWidth="7"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x="40"
          y="36"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--rt-navy)"
          fontSize="24"
          fontWeight="700"
          className="rt-mono"
        >
          {pct}
        </text>
        <text
          x="40"
          y="54"
          textAnchor="middle"
          fill="var(--rt-muted)"
          fontSize="9"
          fontWeight="600"
        >
          Store Health
        </text>
      </svg>
      <div style={{ display: "flex", gap: 6 }}>
        <span className="rt-badge rt-badge-teal">Catalogue {catalogPct}%</span>
        <span className="rt-badge rt-badge-gold">Sessions {sessionPct}%</span>
        <span className="rt-badge rt-badge-navy">CRM {crmPct}%</span>
      </div>
    </div>
  );
}

/* -------- Time Ago Helper -------- */
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* -------- Status Badge -------- */
function SessionBadge({ status }: { status: string }) {
  const cls =
    status === "active"
      ? "rt-badge rt-badge-success"
      : status === "completed"
        ? "rt-badge rt-badge-teal"
        : "rt-badge rt-badge-amber";
  return <span className={cls}>{status}</span>;
}

/* -------- Loading Spinner -------- */
function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--rt-navy), var(--rt-teal))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 2s infinite",
          }}
        >
          <span
            className="rt-serif"
            style={{ color: "var(--rt-gold)", fontSize: 14, fontWeight: 800, fontStyle: "italic" }}
          >
            W
          </span>
        </div>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading dashboard...</span>
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
    } catch {
      /* ignore */
    }
  }, []);

  const store = useQuery(api.stores.getByStoreId, storeId ? { storeId } : "skip");
  const sessions = useQuery(api.sessionOps.listSessionsByStore, storeId ? { storeId } : "skip");
  const sarees = useQuery(api.sarees.listByStore, storeId ? { storeId } : "skip");

  if (!storeId) return <LoadingState />;

  // Derived values
  const healthScore = store?.healthScore ?? 0;
  const conversionRate = store?.conversionRate ?? 0;
  const sessionCount = store?.sessions ?? 0;
  const catalogPct = store?.catalogUtilization ?? 0;
  const featurePct = store?.featureScore ?? 0;
  const crmPct = Math.min(100, Math.round((store?.sessions ?? 0) / 2));
  const activeSessions = sessions?.filter((s) => s.status === "active").length ?? 0;
  const recentSessions = (sessions ?? []).slice(0, 5);
  const todayRevenue = Math.round((store?.mrr ?? 0) / 30);

  // Inventory stats for alerts
  const lowStockCount = sarees?.filter((s) => s.status === "low_stock").length ?? 0;
  const agingCount = sarees?.filter((s) => (s.daysOld ?? 0) >= 60).length ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Greeting (no card) ── */}
      <div>
        <h1
          className="rt-serif"
          style={{
            fontSize: 22,
            fontWeight: 600,
            fontStyle: "italic",
            color: "var(--rt-navy)",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {getGreeting()}, {ownerName || "there"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--rt-muted)", margin: "4px 0 0" }}>
          {storeName || "Your Store"} &middot; {formatDate()}
        </p>
      </div>

      {/* ── Health Score ── */}
      <div
        className="rt-card"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}
      >
        <HealthRing
          score={healthScore}
          catalogPct={catalogPct}
          sessionPct={featurePct}
          crmPct={crmPct}
        />
      </div>

      {/* ── KPI Grid (2x2) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Today Revenue */}
        <div className="rt-card" style={{ padding: 14 }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>{"\uD83D\uDCB0"}</div>
          <div
            className="rt-mono"
            style={{ fontSize: 22, fontWeight: 700, color: "var(--rt-navy)" }}
          >
            {"\u20B9"}{todayRevenue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>Today Revenue</div>
        </div>

        {/* Customers Served */}
        <div className="rt-card" style={{ padding: 14 }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>{"\uD83D\uDC65"}</div>
          <div
            className="rt-mono"
            style={{ fontSize: 22, fontWeight: 700, color: "var(--rt-navy)" }}
          >
            {recentSessions.filter((s) => s.customerPhone).length}
          </div>
          <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>Customers Served</div>
        </div>

        {/* Conversion Rate */}
        <div className="rt-card" style={{ padding: 14 }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>{"\uD83D\uDCC8"}</div>
          <div
            className="rt-mono"
            style={{ fontSize: 22, fontWeight: 700, color: "var(--rt-navy)" }}
          >
            {conversionRate}%
          </div>
          <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>Conversion Rate</div>
          {conversionRate > 0 && (
            <span
              className="rt-badge rt-badge-success"
              style={{ marginTop: 4, display: "inline-block" }}
            >
              {"\u2191"} active
            </span>
          )}
        </div>

        {/* Mirror Sessions */}
        <div className="rt-card" style={{ padding: 14 }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>{"\uD83E\uDE9E"}</div>
          <div
            className="rt-mono"
            style={{ fontSize: 22, fontWeight: 700, color: "var(--rt-navy)" }}
          >
            {sessionCount}
          </div>
          <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>Mirror Sessions</div>
          {activeSessions > 0 && (
            <span
              className="rt-badge rt-badge-success"
              style={{ marginTop: 4, display: "inline-block" }}
            >
              {activeSessions} live
            </span>
          )}
        </div>
      </div>

      {/* ── Quick Actions (3x2) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            className="rt-card"
            onClick={() => router.push(action.href)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "14px 8px",
              cursor: "pointer",
              border: "1px solid var(--rt-border)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--rt-gold)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(201,148,26,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--rt-border)";
              e.currentTarget.style.boxShadow = "var(--rt-shadow)";
            }}
          >
            <span style={{ fontSize: 20 }}>{action.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--rt-navy)" }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Recent Sessions ── */}
      <div className="rt-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span className="rt-card-title" style={{ marginBottom: 0 }}>Recent Sessions</span>
          <button
            className="rt-btn rt-btn-ghost rt-btn-sm"
            onClick={() => router.push("/store/analytics")}
          >
            View All
          </button>
        </div>
        {recentSessions.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--rt-muted)", padding: "16px 0", textAlign: "center" }}>
            No sessions yet
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recentSessions.map((session, idx) => (
              <div
                key={session._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderTop: idx > 0 ? "1px solid var(--rt-border)" : "none",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="rt-mono"
                    style={{ fontSize: 12, color: "var(--rt-muted)", marginBottom: 2 }}
                  >
                    {session.sessionId}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--rt-text)", fontWeight: 500 }}>
                    {session.staffName || "Staff"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <SessionBadge status={session.status} />
                  <span style={{ fontSize: 10, color: "var(--rt-muted)" }}>
                    {timeAgo(session.startTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Smart Alerts ── */}
      {(agingCount > 0 || lowStockCount > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {agingCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                background: "var(--rt-cream)",
                borderRadius: "var(--rt-radius-sm)",
                borderLeft: "4px solid var(--rt-amber)",
              }}
            >
              <span style={{ fontSize: 20 }}>{"\u23F3"}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--rt-text)" }}>
                  Aging Inventory
                </div>
                <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>
                  {agingCount} saree{agingCount > 1 ? "s" : ""} sitting 60+ days without movement
                </div>
              </div>
            </div>
          )}
          {lowStockCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                background: "var(--rt-cream)",
                borderRadius: "var(--rt-radius-sm)",
                borderLeft: "4px solid var(--rt-alert)",
              }}
            >
              <span style={{ fontSize: 20 }}>{"\uD83D\uDCE6"}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--rt-text)" }}>
                  Low Stock Alert
                </div>
                <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>
                  {lowStockCount} item{lowStockCount > 1 ? "s" : ""} running low on inventory
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
