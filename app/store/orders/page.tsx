"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type OrderStatus = "pending" | "paid" | "completed" | "cancelled" | "refunded";

const STATUS_BADGE: Record<string, string> = {
  pending:   "w-badge w-badge-gold",
  paid:      "w-badge w-badge-success",
  completed: "w-badge w-badge-success",
  cancelled: "w-badge",
  refunded:  "w-badge",
};

function fmtINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) {
    return `Today, ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function OrdersPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (u.storeId) setStoreId(u.storeId);
    } catch { /* */ }
  }, []);

  const orders = useQuery(
    api.sessionOps.listOrdersByStore,
    storeId ? { storeId } : "skip",
  );

  const all = orders ?? [];
  const visible = filter === "all" ? all : all.filter((o) => o.status === filter);

  const totalRevenue = all.reduce((s, o) => s + (o.total ?? 0), 0);
  const pendingCount = all.filter((o) => o.status === "pending").length;
  const paidCount = all.filter((o) => o.status === "paid" || o.status === "completed").length;

  const stats = [
    { label: "Orders", value: all.length.toString(), color: "var(--w-ink)" },
    { label: "Pending", value: pendingCount.toString(), color: "var(--w-gold)" },
    { label: "Paid", value: paidCount.toString(), color: "var(--w-teal, #1E5C2F)" },
    { label: "Revenue", value: fmtINR(totalRevenue), color: "var(--w-navy)" },
  ];

  const filters: Array<"all" | OrderStatus> = ["all", "pending", "paid", "completed", "cancelled"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          color: "var(--w-ink-muted)", marginBottom: 4,
        }}>
          Kiosk & checkout
        </p>
        <h1 className="w-serif" style={{
          fontSize: 28, fontWeight: 700, fontStyle: "italic",
          color: "var(--w-navy)", lineHeight: 1.1, margin: 0,
        }}>
          Orders
        </h1>
      </div>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {stats.map((s) => (
          <div key={s.label} className="w-card" style={{ padding: "12px 10px", textAlign: "center" }}>
            <div className="w-mono" style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--w-ink-ghost)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="w-btn"
              style={{
                fontSize: 12, padding: "6px 14px",
                background: active ? "var(--w-navy)" : "transparent",
                color: active ? "#fff" : "var(--w-ink-muted)",
                border: `1px solid ${active ? "var(--w-navy)" : "var(--w-cream-border)"}`,
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {orders === undefined ? (
        <div className="w-card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--w-ink-ghost)" }}>
          Loading…
        </div>
      ) : visible.length === 0 ? (
        <div className="w-card" style={{ padding: "56px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🧾</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--w-ink)", marginBottom: 4 }}>
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </div>
          <div style={{ fontSize: 12, color: "var(--w-ink-muted)" }}>
            Kiosk checkouts appear here in real time.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((o) => {
            const expanded = expandedId === o._id;
            const badge = STATUS_BADGE[o.status] ?? "w-badge";
            return (
              <div key={o._id} className="w-card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Summary row — click to expand */}
                <button
                  onClick={() => setExpandedId(expanded ? null : o._id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", background: "transparent", border: "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  {/* Order id pill */}
                  <div style={{
                    padding: "8px 10px", borderRadius: "var(--w-r-sm)",
                    background: "var(--w-cream)", border: "1px solid var(--w-cream-border)",
                    flexShrink: 0,
                  }}>
                    <div className="w-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--w-ink)" }}>
                      #{o.orderId}
                    </div>
                  </div>

                  {/* Middle */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--w-ink)" }}>
                        {o.items.length} {o.items.length === 1 ? "item" : "items"}
                      </span>
                      <span className={badge}>{o.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--w-ink-muted)" }}>
                      {o.customerPhone ? o.customerPhone : "Walk-in"}
                      {" · "}
                      {fmtDate(o.createdAt)}
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="w-mono" style={{ fontSize: 16, fontWeight: 700, color: "var(--w-navy)" }}>
                      {fmtINR(o.total ?? 0)}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--w-ink-ghost)", marginTop: 2 }}>
                      {expanded ? "▲ hide" : "▼ details"}
                    </div>
                  </div>
                </button>

                {/* Expanded */}
                {expanded && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--w-cream-border)" }}>
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {o.items.map((it, idx) => (
                        <div key={idx} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          fontSize: 13,
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--w-ink)" }}>{it.name}</div>
                            <div style={{ fontSize: 11, color: "var(--w-ink-muted)" }}>
                              {it.quantity} × {fmtINR(it.price)}
                            </div>
                          </div>
                          <div className="w-mono" style={{ fontWeight: 600 }}>
                            {fmtINR(it.price * it.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--w-cream-border)",
                      display: "flex", flexDirection: "column", gap: 4, fontSize: 12,
                    }}>
                      <Row label="Subtotal" value={fmtINR(o.subtotal ?? 0)} />
                      <Row label="GST" value={fmtINR(o.gst ?? 0)} />
                      <Row label="Total" value={fmtINR(o.total ?? 0)} bold />
                      {o.paymentMethod && <Row label="Payment" value={o.paymentMethod} muted />}
                      {o.sessionId && <Row label="Session" value={o.sessionId} muted mono />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, muted, mono }: {
  label: string; value: string; bold?: boolean; muted?: boolean; mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--w-ink-muted)" }}>{label}</span>
      <span
        className={mono ? "w-mono" : undefined}
        style={{
          fontWeight: bold ? 700 : 500,
          color: bold ? "var(--w-navy)" : muted ? "var(--w-ink-muted)" : "var(--w-ink)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
