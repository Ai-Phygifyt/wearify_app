"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <svg
            key={n}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "var(--gold)" : "none"}
            stroke={filled ? "var(--gold)" : "var(--ink-4)"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}

function formatOrderDate(d: string): string {
  // orderDate is stored as YYYY-MM-DD
  const parsed = new Date(d + "T00:00:00");
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TailorRatingsPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch { /* ignore */ }
  }, []);

  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip"
  );
  const reviewData = useQuery(
    api.tailorOps.listReviewsForTailor,
    tailorId ? { tailorId } : "skip"
  );

  if (!tailorId || profile === undefined || reviewData === undefined) {
    return <PageLoading />;
  }

  if (!profile) {
    return (
      <div className="t-empty">
        <h3>Profile not found</h3>
      </div>
    );
  }

  const reviews = reviewData.reviews;
  const distribution = reviewData.distribution; // [1★, 2★, 3★, 4★, 5★]
  const total = reviews.length;
  const avg = profile.rating ?? 0;
  const maxBucket = Math.max(1, ...distribution);

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <button
          type="button"
          className="t-back"
          onClick={() => router.push("/tailor/profile")}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>Ratings &amp; reviews</h1>
        <div style={{ width: 36 }} />
      </div>

      {/* Summary card */}
      <div style={{ margin: "0 20px 18px" }}>
        <div
          className="t-card"
          style={{
            padding: 20,
            background: "linear-gradient(160deg, var(--paper) 0%, var(--ivory-2) 100%)",
          }}
        >
          {total === 0 ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div
                className="t-serif"
                style={{
                  fontSize: 40,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: "var(--ink-4)",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                —
              </div>
              <Stars value={0} size={18} />
              <div
                style={{
                  fontSize: 13,
                  color: "var(--ink-3)",
                  marginTop: 12,
                  lineHeight: 1.5,
                }}
              >
                No reviews yet. Complete and deliver orders through Wearify to collect customer ratings.
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    className="t-serif"
                    style={{
                      fontSize: 48,
                      fontWeight: 500,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {avg.toFixed(1)}
                    <span style={{ fontSize: 18, color: "var(--ink-3)", marginLeft: 2 }}>
                      /5
                    </span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Stars value={avg} size={16} />
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-3)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginTop: 8,
                    }}
                  >
                    {total} {total === 1 ? "review" : "reviews"}
                  </div>
                </div>

                {/* Distribution bars */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star - 1];
                    const pct = (count / maxBucket) * 100;
                    return (
                      <div
                        key={star}
                        style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}
                      >
                        <span
                          className="t-mono"
                          style={{ width: 14, color: "var(--ink-3)", textAlign: "right" }}
                        >
                          {star}
                        </span>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="var(--gold)"
                          stroke="var(--gold)"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            borderRadius: 99,
                            background: "var(--line)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background:
                                count === 0
                                  ? "transparent"
                                  : "linear-gradient(90deg, var(--maroon), var(--gold))",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <span
                          className="t-mono"
                          style={{
                            width: 20,
                            textAlign: "right",
                            color: "var(--ink-3)",
                            fontSize: 11,
                          }}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reviews list */}
      {total > 0 && (
        <>
          <div className="t-section-head" style={{ paddingTop: 4 }}>
            <h2>All reviews</h2>
          </div>
          <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {reviews.map((r) => (
              <div key={r._id} className="t-card" style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      className="t-serif"
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        lineHeight: 1.2,
                      }}
                    >
                      {r.customerMasked}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                      {r.service} · {formatOrderDate(r.orderDate)}
                    </div>
                  </div>
                  <Stars value={r.rating} size={13} />
                </div>

                {r.comment && (
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      color: "var(--ink-2)",
                      lineHeight: 1.55,
                      fontStyle: "italic",
                      fontFamily: "var(--font-serif)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    &ldquo;{r.comment}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
