"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";

const FILTERS = [
  { k: "all", lbl: "All" },
  { k: "confirmed", lbl: "Confirmed" },
  { k: "measurements", lbl: "Measure" },
  { k: "stitching", lbl: "Stitching" },
  { k: "ready", lbl: "Ready" },
  { k: "delivered", lbl: "Delivered" },
  { k: "cancelled", lbl: "Cancelled" },
];

export default function TailorOrdersPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch { /* ignore */ }
  }, []);

  const orders = useQuery(
    api.tailorOps.listOrders,
    tailorId ? { tailorId } : "skip"
  );

  if (!tailorId || orders === undefined) return <PageLoading />;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <div style={{ width: 36 }} />
        <h1>Orders</h1>
        <div className="t-right">
          <button
            type="button"
            className="t-icon-btn"
            onClick={() => router.push("/tailor/orders/create")}
            aria-label="New order"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="t-seg" style={{ overflowX: "auto" }}>
        {FILTERS.map((f) => (
          <button
            key={f.k}
            type="button"
            className={filter === f.k ? "t-on" : ""}
            onClick={() => setFilter(f.k)}
          >
            {f.lbl}
          </button>
        ))}
      </div>

      <div style={{ height: 16 }} />

      {filtered.length === 0 ? (
        <div className="t-empty">
          <div className="t-empty-ill">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
          </div>
          <h3>No orders yet</h3>
          <p>New orders will appear here once you convert a lead or create one manually.</p>
        </div>
      ) : (
        <div className="t-lead-list">
          {filtered.map((o) => (
            <div
              key={o._id}
              className="t-order-row"
              onClick={() => router.push(`/tailor/orders/${o._id}`)}
              role="button"
              tabIndex={0}
            >
              <div className="t-order-thumb" />
              <div>
                <div className="t-order-title">{o.customerName}</div>
                <div className="t-order-sub">
                  {o.service}{o.saree ? ` · ${o.saree}` : ""}
                </div>
                <div style={{ marginTop: 4 }}>
                  <span className={`t-pill ${statusPillClass(o.status)}`}>{o.status}</span>
                </div>
              </div>
              <div className="t-order-due">
                <div className="t-days">{o.dueDate ?? "—"}</div>
                <div className="t-lbl">Due</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}

function statusPillClass(status: string): string {
  switch (status) {
    case "confirmed": return "t-pill-new";
    case "measurements": return "t-pill-contacted";
    case "stitching": return "t-pill-quoted";
    case "ready": return "t-pill-confirmed";
    case "delivered": return "t-pill-confirmed";
    case "cancelled": return "t-pill-declined";
    default: return "t-pill-declined";
  }
}
