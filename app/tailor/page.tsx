"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";

export default function TailorHomePage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch {
      // ignore
    }
  }, []);

  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip"
  );

  const newReferrals = useQuery(
    api.tailorOps.listNewReferrals,
    tailorId ? { tailorId } : "skip"
  );

  const orders = useQuery(
    api.tailorOps.listOrders,
    tailorId ? { tailorId } : "skip"
  );

  if (!tailorId || profile === undefined) {
    return <PageLoading />;
  }

  if (!profile) {
    return (
      <div className="t-empty">
        <p>Profile not found.</p>
      </div>
    );
  }

  const firstName = profile.name.split(" ")[0];
  const leadCount = newReferrals?.length ?? 0;
  const activeOrders = orders?.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length ?? 0;
  const inProgress = orders?.filter((o) => o.status === "stitching" || o.status === "ready") ?? [];

  return (
    <div className="t-screen">
      {/* Top bar */}
      <div className="t-topbar">
        <div style={{ width: 36 }} />
        <h1 style={{ opacity: 0 }}>Home</h1>
        <div className="t-right">
          <div className="t-icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {leadCount > 0 && (
              <div style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, borderRadius: 99,
                background: "var(--maroon)",
                border: "2px solid var(--paper)",
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ padding: "0 20px 4px" }}>
        <div style={{ fontSize: 13, color: "var(--ink-3)", letterSpacing: "0.04em" }}>Good morning,</div>
        <div className="t-serif" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.01em", marginTop: 2 }}>
          {firstName} <em style={{ color: "var(--gold)", fontStyle: "italic", fontWeight: 400 }}>ji</em>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: "18px 0 0" }}>
        <div className="t-hero" onClick={() => router.push("/tailor/referrals")} role="button" tabIndex={0}>
          <div className="t-hero-acc" />
          <div className="t-hero-eyebrow">
            Today · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </div>
          <h2 className="t-hero-title">
            {leadCount > 0 ? (
              <>You have <em>{leadCount} new {leadCount === 1 ? "lead" : "leads"}</em><br />waiting to be contacted.</>
            ) : (
              <>No new leads <em>right now</em>.<br />Check back soon.</>
            )}
          </h2>
          {leadCount > 0 && newReferrals && newReferrals[0] && (
            <div className="t-hero-sub">
              First one from {newReferrals[0].storeName ?? "Wearify"}.
            </div>
          )}
          <button className="t-hero-cta" type="button">
            {leadCount > 0 ? "Review leads" : "View all leads"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="t-section-head">
        <h2>This month</h2>
        <span className="t-link" onClick={() => router.push("/tailor/profile/commission")}>Details</span>
      </div>
      <div className="t-stat-row">
        <div className="t-stat">
          <div className="t-stat-lbl">Leads</div>
          <div className="t-stat-val">{profile.leadsThisMonth ?? 0}</div>
          {(profile.leadsThisMonth ?? 0) > 0 && (
            <div className="t-stat-delta">this month</div>
          )}
        </div>
        <div className="t-stat">
          <div className="t-stat-lbl">Earned</div>
          <div className="t-stat-val"><small>₹</small>{(profile.earnedThisMonth ?? 0).toLocaleString("en-IN")}</div>
          <div className="t-stat-delta" style={{ color: "var(--ink-3)" }}>this month</div>
        </div>
        <div className="t-stat">
          <div className="t-stat-lbl">Rating</div>
          <div className="t-stat-val">
            {profile.rating > 0 ? profile.rating.toFixed(1) : "—"}
            {profile.rating > 0 && <small>/5</small>}
          </div>
          <div className="t-stat-delta" style={{ color: "var(--ink-3)" }}>
            {profile.reviewCount ? `${profile.reviewCount} reviews` : "No reviews"}
          </div>
        </div>
      </div>

      {/* New leads preview */}
      {leadCount > 0 && (
        <>
          <div className="t-section-head">
            <h2>New leads</h2>
            <span className="t-link" onClick={() => router.push("/tailor/referrals")}>
              See all ({leadCount})
            </span>
          </div>
          <div className="t-lead-list">
            {newReferrals!.slice(0, 2).map((ref) => (
              <div
                key={ref._id}
                className="t-lead t-new"
                onClick={() => router.push(`/tailor/referrals/${ref._id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="t-lead-head">
                  <div>
                    <div className="t-lead-name">{ref.customerName}</div>
                    <div className="t-lead-meta">
                      {ref.saree || "General enquiry"}
                      {ref.fabric ? ` · ${ref.fabric}` : ""}
                    </div>
                  </div>
                  <span className="t-pill t-pill-new">new</span>
                </div>
                <div className="t-lead-source">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  {ref.storeName ?? "Direct"} · {ref.date}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* In progress orders */}
      {inProgress.length > 0 && (
        <>
          <div className="t-section-head">
            <h2>In progress</h2>
            <span className="t-link" onClick={() => router.push("/tailor/orders")}>
              {activeOrders} {activeOrders === 1 ? "order" : "orders"}
            </span>
          </div>
          <div className="t-lead-list">
            {inProgress.slice(0, 2).map((o) => (
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
                </div>
                <div className="t-order-due">
                  <div className="t-days">{o.dueDate ?? "—"}</div>
                  <div className="t-lbl">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}
