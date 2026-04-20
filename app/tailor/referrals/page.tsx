"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";

const FILTERS = [
  { k: "all", lbl: "All" },
  { k: "new", lbl: "New" },
  { k: "contacted", lbl: "Contacted" },
  { k: "quoted", lbl: "Quoted" },
  { k: "confirmed", lbl: "Confirmed" },
  { k: "declined", lbl: "Declined" },
];

export default function TailorReferralsPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch { /* ignore */ }
  }, []);

  const referrals = useQuery(
    api.tailorOps.listReferrals,
    tailorId ? { tailorId } : "skip"
  );

  if (!tailorId || referrals === undefined) return <PageLoading />;

  const filtered = filter === "all" ? referrals : referrals.filter((r) => r.status === filter);
  const newCount = referrals.filter((r) => r.status === "new").length;

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <div style={{ width: 36 }} />
        <h1>Leads</h1>
        <div style={{ width: 36 }} />
      </div>

      {/* "new leads today" urgency banner */}
      {newCount > 0 && (
        <div
          style={{
            margin: "0 20px 14px",
            padding: "12px 14px",
            background: "var(--maroon-tint)",
            color: "var(--maroon-ink)",
            borderRadius: 12,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8, height: 8, borderRadius: 99,
              background: "var(--maroon)",
            }}
          />
          <span>
            <strong>{newCount} new {newCount === 1 ? "lead" : "leads"}</strong> from kiosks and Wearify.
          </span>
        </div>
      )}

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

      <div style={{ height: 14 }} />

      {filtered.length === 0 ? (
        <div className="t-empty">
          <div className="t-empty-ill">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3>No leads in this view</h3>
          <p>New customer handoffs from stores and kiosks show up here first.</p>
        </div>
      ) : (
        <div className="t-lead-list">
          {filtered.map((ref) => (
            <LeadCard key={ref._id} ref_={ref} onClick={() => router.push(`/tailor/referrals/${ref._id}`)} />
          ))}
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}

type RefRow = {
  _id: string;
  customerName: string;
  status: string;
  saree?: string;
  fabric?: string;
  storeName?: string;
  occasion?: string;
  budget?: string;
  date: string;
};

function LeadCard({ ref_, onClick }: { ref_: RefRow; onClick: () => void }) {
  const pillClass =
    ref_.status === "new" ? "t-pill-new"
    : ref_.status === "contacted" ? "t-pill-contacted"
    : ref_.status === "quoted" ? "t-pill-quoted"
    : ref_.status === "confirmed" ? "t-pill-confirmed"
    : ref_.status === "declined" ? "t-pill-declined"
    : "t-pill-confirmed";
  return (
    <div className={`t-lead ${ref_.status === "new" ? "t-new" : ""}`} onClick={onClick} role="button" tabIndex={0}>
      <div className="t-lead-head">
        <div>
          <div className="t-lead-name">{ref_.customerName}</div>
          <div className="t-lead-meta">
            {ref_.saree || "General enquiry"}
            {ref_.fabric ? ` · ${ref_.fabric}` : ""}
          </div>
        </div>
        <span className={`t-pill ${pillClass}`}>{ref_.status}</span>
      </div>
      {(ref_.occasion || ref_.budget) && (
        <div className="t-lead-body">
          {ref_.occasion && <span>{ref_.occasion}</span>}
          {ref_.occasion && ref_.budget && <span className="t-sep" />}
          {ref_.budget && <span className="t-mono">{ref_.budget}</span>}
        </div>
      )}
      <div className="t-lead-source">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        {ref_.storeName ?? "Direct"} · {ref_.date}
      </div>
    </div>
  );
}
