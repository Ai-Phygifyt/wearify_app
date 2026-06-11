"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Star } from "lucide-react";

const ORDER_STEPS = ["confirmed", "measurements", "stitching", "ready", "delivered"];

const STEP_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  measurements: "Measured",
  stitching: "Stitching",
  ready: "Ready",
  delivered: "Delivered",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#A94540",
  measurements: "#1A4A65",
  stitching: "#B8860B",
  ready: "#1B5E20",
  delivered: "#1B5E20",
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

  if (!phone) {
    return (
      <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const activeCount = orders ? orders.filter((o) => o.status !== "delivered").length : 0;

  return (
    <div
      className="cx-pageIn"
      style={{
        minHeight: "100%",
        background: "#FFFFFF",
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(180deg, #7A2E32 0%, #6B2529 100%)",
          paddingBottom: 22,
        }}
      >
        {/* App bar row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "calc(env(safe-area-inset-top,0px) + 14px) 16px 13px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="cx-press"
            style={{
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
              display: "flex",
              color: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "#FFFFFF",
              margin: 0,
              marginRight: 26,
            }}
          >
            My Tailor Orders
          </h1>
        </div>

        {/* Hero content */}
        <div style={{ padding: "20px 18px 0" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF", margin: 0, letterSpacing: "-0.01em" }}>
            Track your tailor journey
          </h2>
          <span
            style={{
              display: "inline-block",
              marginTop: 14,
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 13px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.22)",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {activeCount} Active Order{activeCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px 32px" }}>
        {orders === undefined ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 110, borderRadius: 16, background: "linear-gradient(135deg, #F5E6E3, #F0E8DC)", opacity: 0.6 }} className="cx-fadeIn" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div
            className="cx-slideUp"
            style={{
              marginTop: 20,
              background: "#FFFFFF",
              border: "1px solid #F0E6E3",
              borderRadius: 20,
              boxShadow: "0 8px 30px rgba(0,0,0,0.07)",
              padding: "34px 24px 30px",
              textAlign: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/customer/my-tailor/Ellipse 365.svg"
              alt=""
              style={{ width: 120, height: 120, margin: "0 auto 14px", display: "block" }}
            />
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2A2522" }}>No tailor order yet</div>
            <div style={{ fontSize: 13, color: "#9A8F8A", marginTop: 6 }}>Find a tailor through Wearify to get started</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {orders.map((order, idx) => {
              const currentStep = ORDER_STEPS.indexOf(order.status);
              const isExpanded = expandedOrder === order._id;
              const isDelivered = order.status === "delivered";
              const statusColor = STATUS_COLORS[order.status] || "#A94540";

              return (
                <div
                  key={order._id}
                  className={`cx-slideUp cx-d${Math.min(idx + 1, 6)}`}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#FFFFFF",
                    border: "1px solid #F0E8DC",
                    boxShadow: "0 2px 14px rgba(139, 46, 43, .09)",
                  }}
                >
                  {/* Order header */}
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    style={{ padding: "14px 16px", cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#1C1108" }}>
                          {order.tailorName}
                        </div>
                        <div style={{ fontSize: 12, color: "#9C8878", marginTop: 2 }}>
                          {order.service}{order.saree ? ` \u00B7 ${order.saree}` : ""}
                        </div>
                      </div>
                      <span style={{
                        padding: "3px 10px",
                        borderRadius: 100,
                        background: `${statusColor}15`,
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {STEP_LABELS[order.status] || order.status}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ display: "flex", gap: 3, marginTop: 12 }}>
                      {ORDER_STEPS.map((step, i) => (
                        <div
                          key={step}
                          style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            background: i <= currentStep ? statusColor : "#F0E8DC",
                            transition: "background .3s",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      {ORDER_STEPS.map((step, i) => (
                        <span
                          key={step}
                          style={{
                            fontSize: 8,
                            fontWeight: i <= currentStep ? 600 : 400,
                            color: i <= currentStep ? statusColor : "#C4B5A8",
                          }}
                        >
                          {STEP_LABELS[step]}
                        </span>
                      ))}
                    </div>

                    {/* Meta row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                      {order.priceQuoted !== undefined && (
                        <span className="cx-mono" style={{ fontSize: 13, fontWeight: 700, color: "#B8860B" }}>
                          Rs.{order.priceQuoted.toLocaleString("en-IN")}
                        </span>
                      )}
                      {order.dueDate && (
                        <span style={{ fontSize: 11, color: "#9C8878" }}>
                          Due: {order.dueDate}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#C4B5A8", marginLeft: "auto" }}>
                        {order.orderDate}
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #F0E8DC", padding: "14px 16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {order.fabric && (
                          <div style={{ fontSize: 12 }}>
                            <span style={{ color: "#9C8878" }}>Fabric: </span>
                            <span style={{ fontWeight: 600, color: "#1C1108" }}>{order.fabric}</span>
                          </div>
                        )}
                        {order.depositPaid !== undefined && (
                          <div style={{ fontSize: 12 }}>
                            <span style={{ color: "#9C8878" }}>Deposit: </span>
                            <span className="cx-mono" style={{ fontWeight: 600, color: "#1C1108" }}>
                              Rs.{order.depositPaid.toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                        <div style={{ fontSize: 12 }}>
                          <span style={{ color: "#9C8878" }}>Order: </span>
                          <span style={{ fontWeight: 600, color: "#1C1108" }}>{order.orderId}</span>
                        </div>
                      </div>

                      {order.note && (
                        <div style={{ fontSize: 12, color: "#9C8878", marginTop: 10, fontStyle: "italic", lineHeight: 1.5 }}>
                          Note: {order.note}
                        </div>
                      )}

                      {/* WhatsApp tailor button */}
                      {order.tailorWhatsapp && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://wa.me/${order.tailorWhatsapp?.replace(/[^0-9]/g, "")}`, "_blank");
                          }}
                          className="cx-press"
                          style={{
                            width: "100%",
                            marginTop: 12,
                            padding: "10px",
                            borderRadius: 100,
                            background: "var(--cx-grad-whatsapp)",
                            border: "none",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <svg width={15} height={15} viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 0C5.495 0 .16 5.335.157 11.892a11.8 11.8 0 0 0 1.588 5.945L0 24l6.304-1.654a11.9 11.9 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893A11.82 11.82 0 0 0 20.397 3.48 11.82 11.82 0 0 0 12.05 0Z" /></svg>
                          Chat with Tailor
                        </button>
                      )}

                      {/* Rate tailor */}
                      {isDelivered && !order.rating && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F0E8DC" }}>
                          {ratingOrder === order._id ? (
                            <div>
                              <div className="cx-serif" style={{ fontSize: 14, fontWeight: 600, color: "#1C1108", fontStyle: "italic", marginBottom: 10 }}>
                                Rate this tailor
                              </div>
                              <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 10 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={(e) => { e.stopPropagation(); setRatingValue(star); }}
                                    className="cx-star"
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: star <= ratingValue ? "#B8860B" : "#E4D9CC",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <Star size={26} fill={star <= ratingValue ? "var(--cx-gold)" : "transparent"} strokeWidth={1.6} />
                                  </button>
                                ))}
                              </div>
                              <input
                                type="text"
                                placeholder="Add a comment (optional)"
                                value={ratingComment}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setRatingComment(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "10px 14px",
                                  borderRadius: 12,
                                  border: "1px solid #F0E8DC",
                                  background: "#FBF7F1",
                                  fontSize: 13,
                                  color: "#1C1108",
                                  outline: "none",
                                  marginBottom: 10,
                                  boxSizing: "border-box",
                                }}
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRate(); }}
                                disabled={ratingValue === 0 || submittingRating}
                                className="cx-press"
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  borderRadius: 100,
                                  background: ratingValue === 0 ? "#E4D9CC" : "var(--cx-grad-primary)",
                                  border: "none",
                                  color: "#FBF7F1",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: ratingValue === 0 || submittingRating ? "not-allowed" : "pointer",
                                  opacity: ratingValue === 0 ? 0.5 : 1,
                                }}
                              >
                                {submittingRating ? "Submitting..." : "Submit Rating"}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setRatingOrder(order._id); }}
                              className="cx-press"
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: 100,
                                background: "transparent",
                                border: "1.5px solid #8B2E2B",
                                color: "#8B2E2B",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Rate Tailor
                            </button>
                          )}
                        </div>
                      )}

                      {/* Existing rating */}
                      {order.rating !== undefined && order.rating > 0 && (() => {
                        const r = order.rating;
                        return (
                        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 3 }}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              size={15}
                              fill={n <= r ? "var(--cx-gold)" : "transparent"}
                              color={n <= r ? "var(--cx-gold)" : "var(--cx-border)"}
                              strokeWidth={1.6}
                            />
                          ))}
                          {order.ratingComment && (
                            <span style={{ fontSize: 12, color: "#9C8878", fontStyle: "italic", marginLeft: 4 }}>
                              {order.ratingComment}
                            </span>
                          )}
                        </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
