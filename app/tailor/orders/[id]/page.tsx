"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge, Card, Btn, PageLoading } from "@/components/ui/wearify-ui";

const STATUS_STEPS = ["confirmed", "measurements", "stitching", "ready", "delivered"];
const STATUS_LABELS = ["Confirmed", "Measurements", "Stitching", "Ready", "Delivered"];

function StatusProgress({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {STATUS_STEPS.map((step, idx) => (
          <div key={step} className="flex items-center flex-1 gap-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                idx < currentIdx
                  ? "bg-wf-green text-white"
                  : idx === currentIdx
                    ? "bg-wf-primary text-white"
                    : "bg-wf-border text-wf-muted"
              }`}
            >
              {idx < currentIdx ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                idx + 1
              )}
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  idx < currentIdx ? "bg-wf-green" : "bg-wf-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {STATUS_LABELS.map((label, idx) => (
          <span
            key={label}
            className={`text-[9px] text-center flex-1 ${
              idx <= currentIdx ? "text-wf-primary font-semibold" : "text-wf-muted"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch {
      // ignore
    }
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

  if (order === undefined) {
    return <PageLoading />;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-wf-subtext">Order not found.</p>
        <Btn className="mt-4" onClick={() => router.push("/tailor/orders")}>Back to Orders</Btn>
      </div>
    );
  }

  function statusToBadge(status: string) {
    switch (status) {
      case "confirmed": return "progress";
      case "measurements": return "progress";
      case "stitching": return "pending";
      case "ready": return "active";
      case "delivered": return "verified";
      default: return "planned";
    }
  }

  async function handleAdvance() {
    setLoading(true);
    try {
      await advanceStatus({ id: orderId as Id<"tailorOrders"> });
    } catch {
      // ignore
    } finally {
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

  const measurements = [
    { label: "Bust", value: order.bust },
    { label: "Waist", value: order.waist },
    { label: "Shoulder", value: order.shoulder },
    { label: "Arm Length", value: order.armLength },
    { label: "Back Length", value: order.backLength },
    { label: "Neck Depth (Front)", value: order.neckDepthFront },
    { label: "Neck Depth (Back)", value: order.neckDepthBack },
    { label: "Sleeve", value: order.sleeve },
    { label: "Neck", value: order.neck },
  ].filter((m) => m.value);

  const isAtFinalStatus = order.status === "delivered";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/tailor/orders")}
          className="p-1 rounded-lg hover:bg-wf-card transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wf-text">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-wf-text">Order {order.orderId}</h1>
          <span className="text-xs text-wf-muted">{order.orderDate}</span>
        </div>
        <Badge status={statusToBadge(order.status)} className="ml-auto">
          {order.status}
        </Badge>
      </div>

      {/* Status Progress */}
      <div className="bg-wf-card rounded-lg p-4 border border-wf-border">
        <StatusProgress status={order.status} />
      </div>

      {/* Order Info */}
      <Card title="Order Info">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-wf-subtext">Customer</span>
            <span className="font-medium text-wf-text">{order.customerName}</span>
          </div>
          {order.saree && (
            <div className="flex justify-between">
              <span className="text-wf-subtext">Saree</span>
              <span className="text-wf-text">{order.saree}</span>
            </div>
          )}
          {order.fabric && (
            <div className="flex justify-between">
              <span className="text-wf-subtext">Fabric</span>
              <span className="text-wf-text">{order.fabric}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-wf-subtext">Service</span>
            <span className="text-wf-text">{order.service}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-wf-subtext">Price</span>
            <span className="font-bold text-wf-text">Rs.{order.priceQuoted}</span>
          </div>
          {order.depositPaid !== undefined && order.depositPaid !== null && (
            <div className="flex justify-between">
              <span className="text-wf-subtext">Deposit Paid</span>
              <span className="text-wf-green font-medium">Rs.{order.depositPaid}</span>
            </div>
          )}
          {order.dueDate && (
            <div className="flex justify-between">
              <span className="text-wf-subtext">Due Date</span>
              <span className="text-wf-text">{order.dueDate}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Measurements */}
      {measurements.length > 0 && (
        <Card title="Measurements">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {measurements.map((m) => (
              <div key={m.label} className="flex justify-between">
                <span className="text-wf-subtext">{m.label}</span>
                <span className="font-mono text-wf-text">{m.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notes */}
      {order.note && (
        <Card title="Notes">
          <p className="text-sm text-wf-subtext">{order.note}</p>
        </Card>
      )}

      {/* Rating (if delivered) */}
      {order.status === "delivered" && order.rating && (
        <Card title="Customer Rating">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={star <= order.rating! ? "var(--color-wf-amber)" : "none"}
                  stroke="var(--color-wf-amber)"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-bold text-wf-text">{order.rating}/5</span>
          </div>
          {order.ratingComment && (
            <p className="text-sm text-wf-subtext mt-2">{order.ratingComment}</p>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {!isAtFinalStatus && (
          <Btn primary className="w-full" onClick={handleAdvance} disabled={loading}>
            {loading ? "Updating..." : `Advance to ${STATUS_LABELS[STATUS_STEPS.indexOf(order.status) + 1] || "Next"}`}
          </Btn>
        )}
        <Btn className="w-full" onClick={handleContact}>
          Contact Customer
        </Btn>
      </div>
    </div>
  );
}
