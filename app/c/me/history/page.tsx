"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";

export default function VisitHistoryPage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const visits = useQuery(
    api.customers.listVisitHistory,
    customerId ? { customerId } : "skip"
  );

  const storeLinks = useQuery(
    api.customers.listStoreLinksEnriched,
    customerId ? { customerId } : "skip"
  );

  if (!customerId) {
    return (
      <div
        className="cx-pageIn"
        style={{
          minHeight: "100%",
          background: "#FDF8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="cx-typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const visitCount = visits?.length ?? 0;
  const storeCount = storeLinks?.length ?? 0;

  return (
    <div
      className="cx-pageIn"
      style={{ minHeight: "100%", background: "#FDF8F0" }}
    >
      {/* ── Hero ────────────────────────────────────────── */}
      <div
        className="cx-noise cx-paisley"
        style={{
          background: "var(--cx-grad-hero)",
          padding: "28px 18px 22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <button
            onClick={() => router.back()}
            className="cx-press"
            style={{
              background: "rgba(253,248,240,.12)",
              border: "1px solid rgba(253,248,240,.18)",
              borderRadius: 100,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FDF8F0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1
            className="cx-serif"
            style={{
              fontSize: 26,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#FDF8F0",
              margin: 0,
            }}
          >
            Visit History
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(253,248,240,.55)",
              margin: "4px 0 0",
            }}
          >
            {visitCount} visit{visitCount !== 1 ? "s" : ""} across {storeCount}{" "}
            store{storeCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="cx-zari" />

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ padding: "20px 18px 32px" }}>
        {visits === undefined ? (
          /* Skeleton */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 80,
                  borderRadius: 16,
                  background: "linear-gradient(90deg, #F2E8EE 0%, #F4EFF9 50%, #F2E8EE 100%)",
                  animation: "cx-shimmerBg 1.5s ease infinite",
                  backgroundSize: "200% auto",
                }}
              />
            ))}
          </div>
        ) : visits.length === 0 ? (
          /* Empty state */
          <div
            className="cx-slideUp"
            style={{ textAlign: "center", padding: "48px 0" }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#F4EFF9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#B8A8C8"
                strokeWidth="1.6"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div
              className="cx-serif"
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#4A3558",
                fontStyle: "italic",
              }}
            >
              No visits yet
            </div>
            <div style={{ fontSize: 13, color: "#8B7EA0", marginTop: 4 }}>
              Your visit history will appear here
            </div>
          </div>
        ) : (
          /* Visit cards */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visits.map((visit: any, idx: number) => (
              <div
                key={visit._id as string}
                className="cx-slideUp cx-press"
                style={{
                  animationDelay: `${0.05 * Math.min(idx, 6)}s`,
                  background: "#FFFFFF",
                  borderRadius: 16,
                  border: "1px solid #F2E8EE",
                  padding: "14px 16px",
                  boxShadow: "0 2px 14px rgba(45,27,78,.09)",
                }}
              >
                {/* Top row: date + purchase badge */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#1A0A1E",
                      }}
                    >
                      {visit.date as string}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#8B7EA0",
                        marginTop: 2,
                      }}
                    >
                      {(visit.storeName as string) ||
                        (visit.storeId as string)}
                    </div>
                  </div>
                  {visit.purchased ? (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 100,
                        background: "#E8F5E9",
                        color: "#1B5E20",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      Purchased
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 100,
                        background: "#F4EFF9",
                        color: "#8B7EA0",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Browsing only
                    </span>
                  )}
                </div>

                {/* Details row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginTop: 10,
                    fontSize: 12,
                    color: "#4A3558",
                  }}
                >
                  {visit.sareesTried !== undefined && (
                    <span>
                      {visit.sareesTried as number} saree
                      {(visit.sareesTried as number) !== 1 ? "s" : ""} tried
                    </span>
                  )}
                  {visit.staffName && (
                    <span style={{ color: "#8B7EA0" }}>
                      Staff: {visit.staffName as string}
                    </span>
                  )}
                </div>

                {/* Points earned */}
                {visit.pointsEarned !== undefined &&
                  (visit.pointsEarned as number) > 0 && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#C9941A",
                      }}
                    >
                      +{visit.pointsEarned as number} points earned
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
