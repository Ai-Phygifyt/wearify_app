"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { Badge, Btn, PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

const ORDER_STEPS = [
  "confirmed",
  "measurements",
  "stitching",
  "ready",
  "delivered",
];

const STEP_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  measurements: "Measurements",
  stitching: "Stitching",
  ready: "Ready",
  delivered: "Delivered",
};

export default function TailorOrdersPage() {
  const router = useRouter();
  const { phone } = useCustomer();

  const orders = useQuery(
    api.tailorOps.listOrdersByCustomer,
    phone ? { customerPhone: phone } : "skip"
  );

  const rateOrder = useMutation(api.tailorOps.rateOrder);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [ratingOrder, setRatingOrder] = useState<Id<"tailorOrders"> | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  if (!phone) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  async function handleRate() {
    if (!ratingOrder || ratingValue === 0) return;
    setSubmittingRating(true);
    try {
      await rateOrder({
        id: ratingOrder,
        rating: ratingValue,
        ratingComment: ratingComment.trim() || undefined,
      });
      setRatingOrder(null);
      setRatingValue(0);
      setRatingComment("");
    } catch {
      // handle error silently
    }
    setSubmittingRating(false);
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="text-wf-primary text-lg cursor-pointer"
        >
          {"\u2190"}
        </button>
        <h1 className="text-lg font-bold text-wf-text">Tailor Orders</h1>
      </div>

      {orders === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-wf-border/50 rounded-xl h-28"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl mb-2">{"\u2702"}</div>
          <div className="text-sm text-wf-muted">No tailor orders yet</div>
          <div className="text-xs text-wf-muted mt-1">
            Find a tailor through Wearify to get started
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currentStep = ORDER_STEPS.indexOf(order.status);
            const isExpanded = expandedOrder === order._id;
            const isDelivered = order.status === "delivered";

            return (
              <div
                key={order._id}
                className="bg-wf-card rounded-xl border border-wf-border overflow-hidden"
              >
                {/* Order header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() =>
                    setExpandedOrder(isExpanded ? null : order._id)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-wf-text">
                        {order.tailorName}
                      </div>
                      <div className="text-xs text-wf-muted mt-0.5">
                        {order.service}
                        {order.saree ? ` - ${order.saree}` : ""}
                      </div>
                    </div>
                    <Badge
                      status={
                        isDelivered
                          ? "active"
                          : currentStep >= 2
                            ? "progress"
                            : "pending"
                      }
                    >
                      {STEP_LABELS[order.status] || order.status}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="flex gap-1 mt-3">
                    {ORDER_STEPS.map((step, i) => (
                      <div
                        key={step}
                        className={`flex-1 h-1.5 rounded-full ${
                          i <= currentStep
                            ? "bg-wf-green"
                            : "bg-wf-border"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {ORDER_STEPS.map((step, i) => (
                      <span
                        key={step}
                        className={`text-[8px] ${
                          i <= currentStep
                            ? "text-wf-green font-semibold"
                            : "text-wf-muted"
                        }`}
                      >
                        {STEP_LABELS[step]}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-wf-muted">
                    <span>Order: {order.orderId}</span>
                    <span>{order.orderDate}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-wf-border px-4 py-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-wf-muted">Price quoted:</span>
                        <span className="ml-1 font-semibold text-wf-text">
                          Rs.{order.priceQuoted.toLocaleString("en-IN")}
                        </span>
                      </div>
                      {order.dueDate && (
                        <div>
                          <span className="text-wf-muted">Due date:</span>
                          <span className="ml-1 font-semibold text-wf-text">
                            {order.dueDate}
                          </span>
                        </div>
                      )}
                      {order.fabric && (
                        <div>
                          <span className="text-wf-muted">Fabric:</span>
                          <span className="ml-1 font-semibold text-wf-text">
                            {order.fabric}
                          </span>
                        </div>
                      )}
                      {order.depositPaid !== undefined && (
                        <div>
                          <span className="text-wf-muted">Deposit:</span>
                          <span className="ml-1 font-semibold text-wf-text">
                            Rs.{order.depositPaid.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </div>
                    {order.note && (
                      <div className="text-xs text-wf-muted mt-2 italic">
                        Note: {order.note}
                      </div>
                    )}

                    {/* Rate tailor after delivery */}
                    {isDelivered && !order.rating && (
                      <div className="mt-3 pt-3 border-t border-wf-border">
                        {ratingOrder === order._id ? (
                          <div>
                            <div className="text-xs font-semibold text-wf-text mb-2">
                              Rate this tailor
                            </div>
                            <div className="flex gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setRatingValue(star)}
                                  className="text-xl cursor-pointer"
                                >
                                  <span
                                    className={
                                      star <= ratingValue
                                        ? "text-wf-amber"
                                        : "text-wf-border"
                                    }
                                  >
                                    {star <= ratingValue
                                      ? "\u2605"
                                      : "\u2606"}
                                  </span>
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              placeholder="Add a comment (optional)"
                              value={ratingComment}
                              onChange={(e) =>
                                setRatingComment(e.target.value)
                              }
                              className="w-full bg-wf-bg border border-wf-border rounded-lg px-3 py-2 text-xs text-wf-text outline-none focus:border-wf-primary mb-2"
                            />
                            <Btn
                              primary
                              small
                              onClick={handleRate}
                              disabled={
                                ratingValue === 0 || submittingRating
                              }
                              className="w-full"
                            >
                              {submittingRating
                                ? "Submitting..."
                                : "Submit Rating"}
                            </Btn>
                          </div>
                        ) : (
                          <Btn
                            small
                            onClick={() => setRatingOrder(order._id)}
                            className="w-full"
                          >
                            Rate Tailor
                          </Btn>
                        )}
                      </div>
                    )}

                    {order.rating && (
                      <div className="mt-2 text-xs">
                        <span className="text-wf-amber">
                          {"\u2605".repeat(order.rating)}
                        </span>
                        {order.ratingComment && (
                          <span className="text-wf-muted ml-2 italic">
                            {order.ratingComment}
                          </span>
                        )}
                      </div>
                    )}
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
