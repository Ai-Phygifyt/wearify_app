"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/** Thumbnail that shows a Convex-stored image or gradient+emoji fallback */
function SareeThumbnail({ fileId, emoji, grad, size }: {
  fileId?: Id<"_storage">;
  emoji: string;
  grad: string[];
  size: number;
}) {
  const url = useQuery(api.files.getUrl, fileId ? { fileId } : "skip");
  if (fileId && url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    );
  }
  return (
    <div style={{
      width: "100%", height: "100%",
      background: `linear-gradient(135deg, ${grad[0] ?? "#0A1628"}, ${grad[1] ?? "#1A4A65"})`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontSize: size }}>{emoji}</span>
    </div>
  );
}

const FILTER_PILLS = ["All", "In Stock", "Low Stock", "Aging"] as const;
type Filter = (typeof FILTER_PILLS)[number];

function stockDotColor(status: string): string {
  if (status === "active") return "var(--rt-success)";
  if (status === "low_stock") return "var(--rt-amber)";
  return "var(--rt-alert)";
}

function defaultGrad(type: string): string[] {
  const map: Record<string, string[]> = {
    Banarasi: ["#C9941A", "#E65100"],
    Kanjeevaram: ["#1A4A65", "#0A1628"],
    Chanderi: ["#1A4A65", "#2A6A85"],
    Tussar: ["#C9941A", "#E8B84A"],
    Organza: ["#E8B84A", "#C9941A"],
    Chiffon: ["#2A6A85", "#1A4A65"],
    Georgette: ["#1B5E20", "#1A4A65"],
    Cotton: ["#0A1628", "#1A4A65"],
    Linen: ["#1B5E20", "#2A6A85"],
  };
  return map[type] ?? ["#0A1628", "#1A4A65"];
}

function tagBadgeStyle(tag: string): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    Premium: { bg: "rgba(201,148,26,0.2)", color: "#C9941A" },
    Trending: { bg: "rgba(26,74,101,0.2)", color: "#1A4A65" },
    New: { bg: "rgba(27,94,32,0.2)", color: "#1B5E20" },
    "Fast Moving": { bg: "rgba(27,94,32,0.2)", color: "#1B5E20" },
    Aging: { bg: "rgba(183,28,28,0.2)", color: "#B71C1C" },
  };
  const colors = map[tag] ?? { bg: "rgba(122,110,138,0.15)", color: "#7A6E8A" };
  return {
    padding: "2px 8px",
    borderRadius: "var(--rt-radius-pill)",
    fontSize: 10,
    fontWeight: 700,
    background: colors.bg,
    color: colors.color,
    backdropFilter: "blur(4px)",
  };
}

/* -------- Loading Spinner -------- */
function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, var(--rt-navy), var(--rt-teal))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 2s infinite",
          }}
        >
          <span
            className="rt-serif"
            style={{ color: "var(--rt-gold)", fontSize: 14, fontWeight: 800, fontStyle: "italic" }}
          >
            W
          </span>
        </div>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading catalogue...</span>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (u.storeId) setStoreId(u.storeId);
    } catch {
      /* ignore */
    }
  }, []);

  const sarees = useQuery(api.sarees.listByStore, storeId ? { storeId } : "skip");

  const filtered = useMemo(() => {
    if (!sarees) return [];
    return sarees.filter((s) => {
      if (search) {
        const t = search.toLowerCase();
        if (
          !s.name.toLowerCase().includes(t) &&
          !s.type.toLowerCase().includes(t) &&
          !s.fabric.toLowerCase().includes(t)
        )
          return false;
      }
      if (filter === "In Stock") return s.status === "active";
      if (filter === "Low Stock") return s.status === "low_stock";
      if (filter === "Aging") return (s.daysOld ?? 0) >= 60;
      return true;
    });
  }, [sarees, search, filter]);

  // Stats
  const totalSKUs = sarees?.length ?? 0;
  const activeCount = sarees?.filter((s) => s.status === "active").length ?? 0;
  const lowCount = sarees?.filter((s) => s.status === "low_stock").length ?? 0;

  if (!storeId) return <LoadingState />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1
          className="rt-serif"
          style={{
            fontSize: 20,
            fontWeight: 700,
            fontStyle: "italic",
            color: "var(--rt-navy)",
            margin: 0,
          }}
        >
          Catalogue
        </h1>
        <button
          className="rt-btn rt-btn-gold rt-btn-sm"
          onClick={() => router.push("/store/inventory/add")}
        >
          + Add Saree
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 16,
            lineHeight: 1,
            pointerEvents: "none",
          }}
        >
          {"\uD83D\uDD0D"}
        </span>
        <input
          type="text"
          className="rt-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sarees..."
          style={{
            paddingLeft: 40,
            borderRadius: 20,
            background: "var(--rt-cream)",
          }}
        />
      </div>

      {/* ── Filter Pills ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 2,
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill}
            className={`rt-pill${filter === pill ? " active" : ""}`}
            onClick={() => setFilter(pill)}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* ── Summary Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div className="rt-card" style={{ textAlign: "center", padding: "10px 8px" }}>
          <div
            className="rt-mono"
            style={{ fontSize: 18, fontWeight: 700, color: "var(--rt-navy)" }}
          >
            {totalSKUs}
          </div>
          <div style={{ fontSize: 11, color: "var(--rt-muted)", marginTop: 2 }}>Total SKUs</div>
        </div>
        <div className="rt-card" style={{ textAlign: "center", padding: "10px 8px" }}>
          <div
            className="rt-mono"
            style={{ fontSize: 18, fontWeight: 700, color: "var(--rt-teal)" }}
          >
            {activeCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--rt-muted)", marginTop: 2 }}>Active</div>
        </div>
        <div className="rt-card" style={{ textAlign: "center", padding: "10px 8px" }}>
          <div
            className="rt-mono"
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: lowCount > 0 ? "var(--rt-amber)" : "var(--rt-muted)",
            }}
          >
            {lowCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--rt-muted)", marginTop: 2 }}>Low Stock</div>
        </div>
      </div>

      {/* ── View Toggle ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
        <button
          onClick={() => setView("grid")}
          style={{
            padding: 6,
            borderRadius: "var(--rt-radius-sm)",
            cursor: "pointer",
            border: "none",
            background: view === "grid" ? "rgba(26,74,101,0.1)" : "transparent",
            color: view === "grid" ? "var(--rt-teal)" : "var(--rt-muted)",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </button>
        <button
          onClick={() => setView("list")}
          style={{
            padding: 6,
            borderRadius: "var(--rt-radius-sm)",
            cursor: "pointer",
            border: "none",
            background: view === "list" ? "rgba(26,74,101,0.1)" : "transparent",
            color: view === "list" ? "var(--rt-teal)" : "var(--rt-muted)",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="4" width="18" height="3" rx="1" />
            <rect x="3" y="10.5" width="18" height="3" rx="1" />
            <rect x="3" y="17" width="18" height="3" rx="1" />
          </svg>
        </button>
      </div>

      {/* ── Content ── */}
      {sarees === undefined ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        /* ── Empty State ── */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "48px 0",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 48 }}>{sarees.length === 0 ? "\uD83E\uDDF5" : "\uD83D\uDD0D"}</span>
          <p
            className="rt-serif"
            style={{
              fontSize: 16,
              fontStyle: "italic",
              color: "var(--rt-muted)",
              margin: 0,
              textAlign: "center",
            }}
          >
            {sarees.length === 0
              ? "No sarees yet"
              : "No sarees match your search"}
          </p>
          {sarees.length === 0 && (
            <>
              <p style={{ fontSize: 13, color: "var(--rt-muted)", margin: 0 }}>
                Add your first saree to get started
              </p>
              <button
                className="rt-btn rt-btn-gold"
                onClick={() => router.push("/store/inventory/add")}
                style={{ marginTop: 8 }}
              >
                + Add Saree
              </button>
            </>
          )}
        </div>
      ) : view === "grid" ? (
        /* ── Grid View (2-col) ── */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {filtered.map((saree) => {
            const grad = saree.grad ?? defaultGrad(saree.type);
            return (
              <button
                key={saree._id}
                onClick={() => router.push(`/store/inventory/${saree._id}`)}
                className="rt-card"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--rt-gold)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,148,26,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--rt-border)";
                  e.currentTarget.style.boxShadow = "var(--rt-shadow)";
                }}
              >
                {/* Image / Gradient header */}
                <div
                  style={{
                    height: 100,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <SareeThumbnail
                    fileId={saree.imageIds?.[0]}
                    emoji={saree.emoji || "\uD83E\uDDE3"}
                    grad={grad}
                    size={48}
                  />
                  {saree.tag && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        ...tagBadgeStyle(saree.tag),
                      }}
                    >
                      {saree.tag}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div style={{ padding: 10 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--rt-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {saree.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>
                    {saree.fabric}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    <span
                      className="rt-mono"
                      style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-navy)" }}
                    >
                      {"\u20B9"}{saree.price.toLocaleString("en-IN")}
                    </span>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: stockDotColor(saree.status),
                        display: "inline-block",
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* ── List View ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((saree) => {
            const grad = saree.grad ?? defaultGrad(saree.type);
            return (
              <button
                key={saree._id}
                onClick={() => router.push(`/store/inventory/${saree._id}`)}
                className="rt-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--rt-gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--rt-border)";
                }}
              >
                {/* Image / Emoji container */}
                <div
                  style={{
                    width: 48,
                    height: 56,
                    borderRadius: "var(--rt-radius-sm)",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <SareeThumbnail
                    fileId={saree.imageIds?.[0]}
                    emoji={saree.emoji || "\uD83E\uDDE3"}
                    grad={grad}
                    size={28}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--rt-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {saree.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>
                    {saree.fabric} &middot; {saree.type}
                  </div>
                </div>

                {/* Price + stock badge */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="rt-mono"
                    style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-navy)" }}
                  >
                    {"\u20B9"}{saree.price.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`rt-badge ${
                      saree.status === "active"
                        ? "rt-badge-success"
                        : saree.status === "low_stock"
                          ? "rt-badge-amber"
                          : "rt-badge-alert"
                    }`}
                  >
                    {saree.status === "active"
                      ? "In Stock"
                      : saree.status === "low_stock"
                        ? `${saree.stock} left`
                        : "Out"}
                  </span>
                </div>

                {/* Chevron */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--rt-muted)"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
