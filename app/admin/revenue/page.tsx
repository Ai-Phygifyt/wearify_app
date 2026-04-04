"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KPI, Card, Row, PageLoading } from "@/components/ui/wearify-ui";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RVST = [
  { name: "SaaS Subscription", current: "65K/mo", target: "1.4Cr/yr", pct: 65, color: "#2D8544" },
  { name: "Blouse Referrals", current: "2.4K/mo", target: "22.5L/mo", pct: 15, color: "#D4A843" },
  { name: "Marketplace", current: "800/mo", target: "8L/mo", pct: 8, color: "#2C5F7C" },
  { name: "Manufacturer Intel", current: "0", target: "30L/yr", pct: 0, color: "#71221D" },
  { name: "Promoted Placement", current: "0", target: "5L/mo", pct: 0, color: "#FF6B6B" },
  { name: "White-Label", current: "0", target: "1.2Cr/yr", pct: 0, color: "#4ECDC4" },
  { name: "Training", current: "0", target: "Brand", pct: 0, color: "#FFE66D" },
];

const REV = [
  { m: "Oct", a: 42, f: 38 },
  { m: "Nov", a: 68, f: 72 },
  { m: "Dec", a: 95, f: 90 },
  { m: "Jan", a: 125, f: 130 },
  { m: "Feb", a: 158, f: 155 },
  { m: "Mar", a: 182, f: 190 },
  { m: "Apr", a: 0, f: 215 },
  { m: "May", a: 0, f: 245 },
];

const TTP = {
  contentStyle: {
    background: "#F5F0E8",
    border: "1px solid #E8E0D4",
    borderRadius: 4,
    fontSize: 10,
    color: "#1A1A1A",
  },
};

export default function RevenuePage() {
  const stats = useQuery(api.stores.getStats);

  if (!stats) return <PageLoading />;

  const activePaying = stats.active;
  const avgRevPerStore =
    activePaying > 0
      ? `₹${Math.round(stats.totalMrr / activePaying).toLocaleString("en-IN")}`
      : "₹0";

  return (
    <div>
      <h1 className="text-base font-extrabold text-wf-text mb-1">Revenue Intelligence</h1>
      <p className="text-[10px] text-wf-subtext mb-3">
        7 revenue streams — {activePaying} paying stores — {new Date().toLocaleTimeString()}
      </p>

      {/* KPI Row */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <KPI
          label="Total MRR"
          value={`₹${(stats.totalMrr / 1000).toFixed(0)}K`}
          subtitle="+15% MoM"
        />
        <KPI
          label="Active Paying Stores"
          value={activePaying}
          subtitle={`of ${stats.total} total`}
        />
        <KPI
          label="Avg Revenue/Store"
          value={avgRevPerStore}
          subtitle="per month"
        />
        <KPI
          label="Blouse Referral Rev"
          value="₹2.4K"
          subtitle="15% of target"
          color="var(--color-wf-amber)"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-[1fr_1.2fr] gap-2 mb-2">
        {/* Revenue Streams Card */}
        <Card title="Revenue Streams">
          <div className="space-y-0.5">
            {RVST.map((stream) => (
              <Row key={stream.name} className="flex-col !items-stretch gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-wf-text">{stream.name}</span>
                  <div className="flex gap-3 items-center">
                    <span className="text-[9px] font-mono font-semibold" style={{ color: stream.color }}>
                      ₹{stream.current}
                    </span>
                    <span className="text-[8px] text-wf-muted">
                      Target: ₹{stream.target}
                    </span>
                  </div>
                </div>
                <div className="h-[4px] rounded bg-wf-border">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${Math.max(stream.pct, 0)}%`,
                      backgroundColor: stream.color,
                    }}
                  />
                </div>
              </Row>
            ))}
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card title="Revenue: Actual vs Forecast">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={REV}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D4" />
              <XAxis dataKey="m" tick={{ fontSize: 8, fill: "#9A8D82" }} />
              <YAxis
                tick={{ fontSize: 8, fill: "#9A8D82" }}
                tickFormatter={(v: number) => `${v}K`}
              />
              <Tooltip {...TTP} />
              <Area
                type="monotone"
                dataKey="a"
                stroke="#71221D"
                fill="#2D854410"
                strokeWidth={2}
                name="Actual"
              />
              <Area
                type="monotone"
                dataKey="f"
                stroke="#D4A843"
                fill="transparent"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                name="Forecast"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
