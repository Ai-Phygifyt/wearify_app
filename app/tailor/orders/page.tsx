"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge, Tabs, Btn, PageLoading } from "@/components/ui/wearify-ui";

const FILTER_TABS = ["All", "Active", "Ready", "Delivered"];
const STATUS_STEPS = ["confirmed", "measurements", "stitching", "ready", "delivered"];
const STATUS_LABELS = ["Confirmed", "Measurements", "Stitching", "Ready", "Delivered"];

function StatusBar({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-2">
      {STATUS_STEPS.map((step, idx) => (
        <div key={step} className="flex items-center flex-1">
          <div
            className={`h-1.5 rounded-full flex-1 transition-colors ${
              idx <= currentIdx ? "bg-wf-primary" : "bg-wf-border"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export default function TailorOrdersPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch {
      // ignore
    }
  }, []);

  const orders = useQuery(
    api.tailorOps.listOrders,
    tailorId ? { tailorId } : "skip"
  );

  if (!tailorId || orders === undefined) {
    return <PageLoading />;
  }

  const filtered = (() => {
    if (filter === "All") return orders;
    if (filter === "Active")
      return orders.filter(
        (o) => o.status !== "delivered" && o.status !== "ready"
      );
    if (filter === "Ready") return orders.filter((o) => o.status === "ready");
    if (filter === "Delivered")
      return orders.filter((o) => o.status === "delivered");
    return orders;
  })();

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-wf-text">Orders</h1>
        <Btn small primary onClick={() => router.push("/tailor/orders/create")}>
          + New Order
        </Btn>
      </div>

      {/* Filter Tabs */}
      <Tabs items={FILTER_TABS} active={filter} onChange={setFilter} />

      {/* Order List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-wf-muted">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order._id}
              onClick={() => router.push(`/tailor/orders/${order._id}`)}
              className="bg-wf-card rounded-lg p-4 border border-wf-border cursor-pointer hover:border-wf-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="text-sm font-semibold text-wf-text">{order.customerName}</div>
                  <div className="text-xs text-wf-subtext mt-0.5">
                    {order.saree || order.service} {order.fabric ? `- ${order.fabric}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <Badge status={statusToBadge(order.status)}>{order.status}</Badge>
                  <div className="text-sm font-bold text-wf-text mt-1">Rs.{order.priceQuoted}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-wf-muted mb-1">
                <span>{order.orderId}</span>
                <span>&middot;</span>
                <span>{order.orderDate}</span>
                {order.dueDate && (
                  <>
                    <span>&middot;</span>
                    <span>Due: {order.dueDate}</span>
                  </>
                )}
              </div>
              <StatusBar status={order.status} />
              <div className="flex justify-between mt-1.5">
                {STATUS_LABELS.map((label, idx) => (
                  <span
                    key={label}
                    className={`text-[8px] ${
                      idx <= STATUS_STEPS.indexOf(order.status)
                        ? "text-wf-primary font-semibold"
                        : "text-wf-muted"
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
