"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageLoading } from "@/components/ui/wearify-ui";

const STATUS_STEPS = ["confirmed", "measurements", "stitching", "ready", "delivered"];
const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  measurements: "Measurements",
  stitching: "Stitching",
  ready: "Ready",
  delivered: "Delivered",
};
const NEXT_LABEL: Record<string, string> = {
  confirmed: "Take measurements",
  measurements: "Start stitching",
  stitching: "Mark ready",
  ready: "Mark delivered",
};

// Accordion-grouped measurements — bust + waist are pinned at top separately.
const MEASUREMENT_GROUPS = [
  {
    key: "upper",
    title: "Upper body",
    fields: [
      { k: "shoulder", lbl: "Shoulder", unit: "in" },
      { k: "armLength", lbl: "Arm length", unit: "in" },
      { k: "backLength", lbl: "Back length", unit: "in" },
    ],
  },
  {
    key: "sleeves",
    title: "Sleeves",
    fields: [
      { k: "sleeve", lbl: "Sleeve", unit: "in" },
    ],
  },
  {
    key: "neck",
    title: "Neck",
    fields: [
      { k: "neck", lbl: "Neck", unit: "in" },
      { k: "neckDepthFront", lbl: "Front depth", unit: "in" },
      { k: "neckDepthBack", lbl: "Back depth", unit: "in" },
    ],
  },
] as const;

type MeasField = "bust" | "waist" | "shoulder" | "armLength" | "backLength" | "sleeve" | "neck" | "neckDepthFront" | "neckDepthBack";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ upper: false, sleeves: false, neck: false });

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch { /* ignore */ }
  }, []);

  const order = useQuery(
    api.tailorOps.getOrderById,
    orderId ? { id: orderId as Id<"tailorOrders"> } : "skip"
  );
  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip"
  );
  const advanceStatus = useMutation(api.tailorOps.advanceOrderStatus);

  if (order === undefined) return <PageLoading />;

  if (!order) {
    return (
      <div className="t-empty">
        <h3>Order not found</h3>
        <button className="t-btn t-btn-ghost" onClick={() => router.push("/tailor/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

  async function handleAdvance() {
    setLoading(true);
    try {
      await advanceStatus({ id: orderId as Id<"tailorOrders"> });
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  function handleContact() {
    const phone = order!.customerPhone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hi ${order!.customerName}, this is ${profile?.name || "your tailor"} from Wearify regarding your order ${order!.orderId}. `
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }

  const currentIdx = STATUS_STEPS.indexOf(order.status);
  const nextLabel = NEXT_LABEL[order.status];

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <button
          type="button"
          className="t-back"
          onClick={() => router.push("/tailor/orders")}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>{order.orderId}</h1>
        <div className="t-right">
          <button
            type="button"
            className="t-icon-btn"
            onClick={handleContact}
            aria-label="WhatsApp customer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Customer name + saree */}
      <div style={{ padding: "0 20px 16px" }}>
        <div className="t-serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.01em" }}>
          {order.customerName}
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
          {order.saree ?? order.service}
        </div>
      </div>

      {/* Pipeline */}
      <div style={{ marginBottom: 20 }}>
        <div className="t-pipeline">
          {STATUS_STEPS.map((s, i) => {
            const done = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <React.Fragment key={s}>
                <div className="t-node">
                  <div className={`t-dot ${done ? "t-done" : isCurrent ? "t-current" : ""}`} />
                  <div className={`t-node-lbl ${isCurrent ? "t-current" : ""}`}>
                    {STATUS_LABELS[s]}
                  </div>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`t-line ${done ? "t-done" : ""}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ margin: "0 20px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div className="t-card t-card-inset" style={{ padding: 12 }}>
          <div className="t-caps" style={{ color: "var(--ink-3)" }}>Due</div>
          <div className="t-num" style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
            {order.dueDate ?? "—"}
          </div>
        </div>
        <div className="t-card t-card-inset" style={{ padding: 12 }}>
          <div className="t-caps" style={{ color: "var(--ink-3)" }}>Total</div>
          <div className="t-num" style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
            ₹{order.priceQuoted.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="t-card t-card-inset" style={{ padding: 12 }}>
          <div className="t-caps" style={{ color: "var(--ink-3)" }}>Deposit</div>
          <div
            className="t-num"
            style={{
              fontSize: 16, fontWeight: 500, marginTop: 4,
              color: order.depositPaid ? "var(--ok)" : "var(--ink-3)",
            }}
          >
            ₹{(order.depositPaid ?? 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Measurements section */}
      <div className="t-section-head" style={{ paddingTop: 8 }}>
        <h2>Measurements</h2>
      </div>

      {/* Pinned: bust + waist */}
      <div className="t-pinned-row">
        <PinnedField label="Bust" value={order.bust} unit="in" />
        <PinnedField label="Waist" value={order.waist} unit="in" />
      </div>

      {MEASUREMENT_GROUPS.map((g) => {
        const populated = g.fields.some((f) => order[f.k as MeasField]);
        return (
          <div key={g.key} className="t-accordion">
            <div
              className="t-acc-head"
              onClick={() => setOpen((prev) => ({ ...prev, [g.key]: !prev[g.key] }))}
              role="button"
              tabIndex={0}
            >
              <div>
                <div className="t-acc-title">{g.title}</div>
                <div className="t-acc-sub">
                  {populated
                    ? `${g.fields.filter((f) => order[f.k as MeasField]).length}/${g.fields.length} filled`
                    : `${g.fields.length} fields`}
                </div>
              </div>
              <svg
                className={`t-acc-chev ${open[g.key] ? "t-open" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            {open[g.key] && (
              <div className="t-acc-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {g.fields.map((f) => (
                    <ReadField
                      key={f.k}
                      label={f.lbl}
                      value={order[f.k as MeasField] as string | undefined}
                      unit={f.unit}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Notes */}
      {order.note && (
        <div style={{ margin: "16px 20px 0" }}>
          <div className="t-card t-card-inset">
            <div className="t-caps" style={{ color: "var(--ink-3)", marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>{order.note}</div>
          </div>
        </div>
      )}

      {/* Rating */}
      {order.status === "delivered" && order.rating && (
        <div style={{ margin: "16px 20px 0" }}>
          <div className="t-card t-card-inset">
            <div className="t-caps" style={{ color: "var(--ink-3)", marginBottom: 8 }}>Customer Rating</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={star <= order.rating! ? "var(--gold)" : "none"}
                    stroke="var(--gold)"
                    strokeWidth="1.8"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="t-mono" style={{ fontSize: 15, fontWeight: 500 }}>{order.rating}/5</span>
            </div>
            {order.ratingComment && (
              <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 10 }}>
                &ldquo;{order.ratingComment}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: 20, display: "flex", gap: 10 }}>
        <button
          type="button"
          className="t-btn t-btn-ghost"
          style={{ flex: "0 0 auto" }}
          onClick={handleContact}
          aria-label="WhatsApp customer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
        {nextLabel && (
          <button
            type="button"
            className="t-btn t-btn-primary"
            style={{ flex: 1 }}
            onClick={handleAdvance}
            disabled={loading}
          >
            {loading ? "…" : nextLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>
      <div style={{ height: 10 }} />
    </div>
  );
}

function PinnedField({ label, value, unit }: { label: string; value?: string; unit: string }) {
  return (
    <div className="t-pinned-field">
      <label>{label}</label>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <input value={value ?? "—"} readOnly />
        <span className="t-unit">{unit}</span>
      </div>
    </div>
  );
}

function ReadField({ label, value, unit }: { label: string; value?: string; unit: string }) {
  return (
    <div className="t-field">
      <label>{label}</label>
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid var(--line-2)",
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          background: "var(--paper)",
          color: value ? "var(--ink)" : "var(--ink-4)",
        }}
      >
        {value ? `${value} ${unit}` : "—"}
      </div>
    </div>
  );
}
