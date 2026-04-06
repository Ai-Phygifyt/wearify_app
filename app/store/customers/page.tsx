"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const SEGMENTS = ["All", "VIP", "Regular", "New", "At Risk"];

const SEGMENT_COLORS: Record<string, { bg: string; text: string }> = {
  VIP: { bg: "rgba(201, 148, 26, 0.15)", text: "#C9941A" },
  Regular: { bg: "rgba(26, 74, 101, 0.1)", text: "#1A4A65" },
  New: { bg: "rgba(27, 94, 32, 0.1)", text: "#1B5E20" },
  "At Risk": { bg: "rgba(183, 28, 28, 0.1)", text: "#B71C1C" },
};

function getAvatarColor(segment?: string): string {
  switch (segment) {
    case "VIP": return "linear-gradient(135deg, #C9941A, #E8B84A)";
    case "Regular": return "linear-gradient(135deg, #1A4A65, #2A6A85)";
    case "New": return "linear-gradient(135deg, #1B5E20, #2E7D32)";
    case "At Risk": return "linear-gradient(135deg, #B71C1C, #D32F2F)";
    default: return "linear-gradient(135deg, #0A1628, #1A4A65)";
  }
}

function getInitials(customerId: Id<"customers">, name?: string): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }
  return String(customerId).slice(-2).toUpperCase();
}

export default function CustomersPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeSegment, setActiveSegment] = useState("All");

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch {
      /* ignore */
    }
  }, []);

  const customerLinks = useQuery(api.customers.listByStore, storeId ? { storeId } : "skip");

  if (!storeId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading...</span>
      </div>
    );
  }

  const filtered = (customerLinks ?? []).filter((link) => {
    const seg = link.segment || "New";
    if (activeSegment !== "All" && seg !== activeSegment) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (link.storeName || "").toLowerCase().includes(term) ||
      seg.toLowerCase().includes(term) ||
      String(link.customerId).toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div>
        <h1
          className="rt-serif"
          style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--rt-navy)", margin: 0 }}
        >
          Customers
        </h1>
        <p style={{ fontSize: 13, color: "var(--rt-muted)", margin: "4px 0 0" }}>
          {customerLinks?.length ?? 0} customers linked to your store
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rt-muted)" strokeWidth="2"
          style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="rt-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          style={{ paddingLeft: 40, borderRadius: "var(--rt-radius-pill)" }}
        />
      </div>

      {/* Segment Pills */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {SEGMENTS.map((seg) => (
          <button
            key={seg}
            className={`rt-pill ${activeSegment === seg ? "active" : ""}`}
            onClick={() => setActiveSegment(seg)}
          >
            {seg}
          </button>
        ))}
      </div>

      {/* Customer List */}
      {customerLinks === undefined ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
          <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading customers...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rt-card" style={{ textAlign: "center", padding: "32px 16px" }}>
          <p style={{ fontSize: 14, color: "var(--rt-muted)" }}>No customers found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((link) => {
            const seg = link.segment || "New";
            const colors = SEGMENT_COLORS[seg] || SEGMENT_COLORS["New"];
            const initials = getInitials(link.customerId);

            return (
              <button
                key={link._id}
                onClick={() => router.push(`/store/customers/${link.customerId}`)}
                className="rt-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                  cursor: "pointer",
                  border: "1px solid var(--rt-border)",
                  width: "100%",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: getAvatarColor(seg),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{initials}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--rt-text)" }}>
                    Customer #{String(link.customerId).slice(-6)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span
                      className="rt-badge"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {seg}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--rt-muted)" }}>
                      Last: {link.lastVisit || "N/A"}
                    </span>
                  </div>
                </div>

                {/* CLV */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {link.clv != null && link.clv > 0 && (
                    <div className="rt-mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-text)" }}>
                      Rs{link.clv.toLocaleString("en-IN")}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--rt-muted)" }}>
                    {link.visits ?? 0} visits
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
