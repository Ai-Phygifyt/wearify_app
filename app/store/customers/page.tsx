"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Segment = "All" | "VIP" | "Regular" | "New" | "At Risk";

const SEGMENT_STYLE: Record<string, { badge: string; avatarGrad: string }> = {
  VIP:      { badge: "w-badge w-badge-gold",    avatarGrad: "linear-gradient(145deg, var(--w-gold), var(--w-gold-bright))" },
  Regular:  { badge: "w-badge w-badge-teal",    avatarGrad: "linear-gradient(145deg, var(--w-teal), #2980B9)" },
  New:      { badge: "w-badge w-badge-success", avatarGrad: "linear-gradient(145deg, var(--w-success), #27AE60)" },
  "At Risk":{ badge: "w-badge w-badge-danger",  avatarGrad: "linear-gradient(145deg, var(--w-danger), #C0392B)" },
};

function segmentStyle(seg: string) {
  return SEGMENT_STYLE[seg] ?? { badge: "w-badge w-badge-navy", avatarGrad: "linear-gradient(145deg, var(--w-navy), var(--w-teal))" };
}

function initials(id: string): string {
  return id.slice(-2).toUpperCase();
}

function TrendIcon({ positive }: { positive: boolean }) {
  return positive ? (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ) : (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

export default function CustomersPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeSegment, setActiveSegment] = useState<Segment>("All");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (u.storeId) setStoreId(u.storeId);
    } catch { /* */ }
  }, []);

  const links = useQuery(api.customers.listByStore, storeId ? { storeId } : "skip");

  const allLinks = links ?? [];

  const counts: Record<Segment, number> = {
    All:       allLinks.length,
    VIP:       allLinks.filter((l) => l.segment === "VIP").length,
    Regular:   allLinks.filter((l) => l.segment === "Regular").length,
    New:       allLinks.filter((l) => (l.segment ?? "New") === "New").length,
    "At Risk": allLinks.filter((l) => l.segment === "At Risk").length,
  };

  const totalClv = allLinks.reduce((sum, l) => sum + (l.clv ?? 0), 0);

  const filtered = allLinks.filter((l) => {
    const seg = l.segment ?? "New";
    if (activeSegment !== "All" && seg !== activeSegment) return false;
    if (search) {
      const q = search.toLowerCase();
      return String(l.customerId).toLowerCase().includes(q) || seg.toLowerCase().includes(q);
    }
    return true;
  });

  const SEGMENTS: Segment[] = ["All", "VIP", "Regular", "New", "At Risk"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 4 }}>
          CRM
        </p>
        <h1 className="w-serif" style={{ fontSize: 28, fontWeight: 700, fontStyle: "italic", color: "var(--w-navy)", lineHeight: 1.1, margin: 0 }}>
          Customers
        </h1>
      </div>

      {/* ── Summary bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="w-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div className="w-kpi-icon-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--w-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="w-mono w-kpi-value" style={{ fontSize: 22 }}>{allLinks.length}</div>
          <div className="w-kpi-label">Total Customers</div>
        </div>

        <div className="w-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div className="w-kpi-icon-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--w-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="w-mono w-kpi-value" style={{ fontSize: 22 }}>₹{totalClv.toLocaleString("en-IN")}</div>
          <div className="w-kpi-label">Total CLV</div>
        </div>
      </div>

      {/* ── Segment breakdown ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {(["VIP", "Regular", "New", "At Risk"] as Segment[]).map((seg) => (
          <button
            key={seg}
            onClick={() => setActiveSegment(activeSegment === seg ? "All" : seg)}
            style={{
              padding: "10px 8px", borderRadius: "var(--w-r-sm)",
              border: `1.5px solid ${activeSegment === seg ? "var(--w-gold)" : "var(--w-cream-border)"}`,
              background: activeSegment === seg ? "var(--w-gold-mist)" : "var(--w-cream-deep)",
              cursor: "pointer", textAlign: "center",
              transition: "all 0.18s var(--w-ease)",
              boxShadow: activeSegment === seg ? "var(--w-shadow-gold)" : "var(--w-shadow-xs)",
            }}
          >
            <div className="w-mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--w-navy)", lineHeight: 1 }}>
              {counts[seg]}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--w-ink-muted)", marginTop: 3, letterSpacing: "0.04em" }}>
              {seg}
            </div>
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        border: "1.5px solid var(--w-cream-border)", borderRadius: "var(--w-r-sm)",
        background: "#fff", padding: "10px 14px", boxShadow: "var(--w-shadow-xs)",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text" value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers…"
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "var(--w-ink)", background: "transparent", fontFamily: "'DM Sans', sans-serif" }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--w-ink-ghost)", padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Filter pills ── */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {SEGMENTS.map((seg) => (
          <button key={seg} className={`w-pill${activeSegment === seg ? " active" : ""}`}
            onClick={() => setActiveSegment(seg)}>
            {seg}
            <span style={{ marginLeft: 5, fontSize: 11, fontWeight: 700, color: activeSegment === seg ? "rgba(255,255,255,0.7)" : "var(--w-ink-muted)" }}>
              {counts[seg]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {links === undefined && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 0" }}>
          <div className="w-loadscreen-inner">
            <div className="w-load-mark"><span className="w-logomark-letter" style={{ fontSize: 17 }}>W</span></div>
            <div><span className="w-load-text">Loading customers</span><span className="w-load-dots"><span /><span /><span /></span></div>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {links !== undefined && filtered.length === 0 && (
        <div className="w-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="1.4" style={{ marginBottom: 14 }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="w-serif" style={{ fontSize: 17, fontStyle: "italic", color: "var(--w-ink-soft)" }}>
            {search ? "No customers match your search" : "No customers yet"}
          </p>
        </div>
      )}

      {/* ── Customer list ── */}
      {filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((link) => {
            const seg = link.segment ?? "New";
            const style = segmentStyle(seg);
            const isVip = seg === "VIP";

            return (
              <button
                key={link._id}
                onClick={() => router.push(`/store/customers/${link.customerId}`)}
                className="w-card"
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", textAlign: "left",
                  cursor: "pointer", width: "100%",
                  border: isVip ? "1.5px solid rgba(184,134,11,0.3)" : "1px solid var(--w-cream-border)",
                  transition: "transform 0.22s var(--w-spring), box-shadow 0.22s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = isVip ? "var(--w-shadow-gold)" : "var(--w-shadow-md)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: style.avatarGrad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: isVip ? "0 4px 14px rgba(184,134,11,0.28)" : "var(--w-shadow-sm)",
                  border: isVip ? "2px solid var(--w-gold-pale)" : "2px solid rgba(255,255,255,0.6)",
                }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
                    {initials(String(link.customerId))}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--w-ink)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Customer #{String(link.customerId).slice(-6).toUpperCase()}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className={style.badge}>{seg}</span>
                    {link.lastVisit && (
                      <span style={{ fontSize: 11, color: "var(--w-ink-ghost)" }}>Last: {link.lastVisit}</span>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {(link.clv ?? 0) > 0 && (
                    <div className="w-mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--w-navy)", marginBottom: 3 }}>
                      ₹{(link.clv ?? 0).toLocaleString("en-IN")}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="2" strokeLinecap="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                    <span style={{ fontSize: 11, color: "var(--w-ink-muted)" }}>{link.visits ?? 0} visits</span>
                  </div>
                </div>

                {/* Chevron */}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginLeft: 4 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}
