"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type FilterKey = "all" | "approved" | "pending" | "low_stock";

const SAREE_IMAGE: Record<string, string> = {
  "Chanderi Floral":           "/inventory/Chanderi-Floral.jpeg",
  "Chiffon Rose Garden":       "/inventory/Chiffon-Rose-Garden.webp",
  "Cotton Handloom Daily":     "/inventory/Cotton-Handloom-Daily.webp",
  "Georgette Sequin Party":    "/inventory/Georgette-Sequin-Party.webp",
  "Kanjeevaram Temple Border": "/inventory/Kanjeevaram-Temple-Border.webp",
  "Linen Summer Fresh":        "/inventory/Linen-Summer-Fresh.jpeg",
  "Organza Pastel Dream":      "/inventory/Organza-Pastel-Dream.jpeg",
  "Paithani Heritage":         "/inventory/Paithani-Heritage.webp",
  "Tussar Geometric":          "/inventory/Tussar-Geometric.webp",
};

function SareeThumb({ name, fileId, grad }: { name: string; fileId?: Id<"_storage">; grad: string[] }) {
  const localSrc = SAREE_IMAGE[name];
  const url = useQuery(api.files.getUrl, !localSrc && fileId ? { fileId } : "skip");

  if (localSrc) {
    return <img src={localSrc} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  if (url) {
    return <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  return (
    <div style={{
      width: "100%", height: "100%",
      background: `linear-gradient(145deg, ${grad[0]}, ${grad[1] || grad[0]})`,
    }} />
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "approved" ? "var(--w-success)" :
    status === "pending"  ? "var(--w-gold)"    :
    status === "rejected" ? "var(--w-danger)"  : "var(--w-ink-ghost)";
  return (
    <span style={{
      display: "inline-block",
      width: 7, height: 7,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
    }} />
  );
}

export default function InventoryPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (u.storeId) setStoreId(u.storeId);
    } catch { /* */ }
  }, []);

  const sarees = useQuery(api.sarees.listByStore, storeId ? { storeId } : "skip");

  const filtered = (sarees ?? []).filter((s) => {
    if (filter === "approved"  && s.approvalStatus !== "approved") return false;
    if (filter === "pending"   && s.approvalStatus !== "pending")  return false;
    if (filter === "low_stock" && s.stock > 5) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.fabric.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = {
    all:       (sarees ?? []).length,
    approved:  (sarees ?? []).filter((s) => s.approvalStatus === "approved").length,
    pending:   (sarees ?? []).filter((s) => s.approvalStatus === "pending").length,
    low_stock: (sarees ?? []).filter((s) => s.stock <= 5).length,
  };

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all",       label: "All" },
    { key: "approved",  label: "Live" },
    { key: "pending",   label: "Pending" },
    { key: "low_stock", label: "Low Stock" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 4 }}>
            Catalogue
          </p>
          <h1 className="w-serif" style={{ fontSize: 28, fontWeight: 700, fontStyle: "italic", color: "var(--w-navy)", lineHeight: 1.1, margin: 0 }}>
            Your Collection
          </h1>
        </div>
        <button
          className="w-btn w-btn-primary"
          style={{ flexShrink: 0, padding: "10px 16px", fontSize: 13 }}
          onClick={() => router.push("/store/inventory/add")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 6 }}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Item
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        border: "1.5px solid var(--w-cream-border)",
        borderRadius: "var(--w-r-sm)",
        background: "#fff",
        padding: "10px 14px",
        boxShadow: "var(--w-shadow-xs)",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or fabric…"
          style={{
            flex: 1, border: "none", outline: "none",
            fontSize: 14, color: "var(--w-ink)",
            background: "transparent", fontFamily: "'DM Sans', sans-serif",
          }}
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
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`w-pill${filter === f.key ? " active" : ""}`}
          >
            {f.label}
            <span style={{
              marginLeft: 5,
              fontSize: 11, fontWeight: 700,
              color: filter === f.key ? "rgba(255,255,255,0.75)" : "var(--w-ink-muted)",
            }}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {sarees === undefined && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
          <div className="w-loadscreen-inner">
            <div className="w-load-mark"><span className="w-logomark-letter" style={{ fontSize: 17 }}>W</span></div>
            <div><span className="w-load-text">Loading catalogue</span><span className="w-load-dots"><span /><span /><span /></span></div>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {sarees !== undefined && filtered.length === 0 && (
        <div className="w-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="1.4" style={{ marginBottom: 14 }}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p className="w-serif" style={{ fontSize: 17, fontStyle: "italic", color: "var(--w-ink-soft)", marginBottom: 6 }}>
            {search ? "No items match your search" : "Your catalogue is empty"}
          </p>
          {!search && (
            <button className="w-btn w-btn-primary w-btn-sm" style={{ marginTop: 12 }}
              onClick={() => router.push("/store/inventory/add")}>
              Add your first item
            </button>
          )}
        </div>
      )}

      {/* ── Saree list ── */}
      {filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((saree) => {
            const grad = saree.grad || ["#0D1F35", "#1A5276"];
            const isLow = saree.stock > 0 && saree.stock <= 5;
            const isOut = saree.stock <= 0;
            return (
              <button
                key={saree._id}
                onClick={() => router.push(`/store/inventory/${saree._id}`)}
                className="w-card"
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", textAlign: "left",
                  border: "1px solid var(--w-cream-border)",
                  cursor: "pointer", width: "100%",
                  transition: "transform 0.22s var(--w-spring), box-shadow 0.22s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--w-shadow-md)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.boxShadow = "";
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 60, height: 70, borderRadius: 10,
                  overflow: "hidden", flexShrink: 0,
                  boxShadow: "var(--w-shadow-sm)",
                }}>
                  <SareeThumb name={saree.name} fileId={saree.imageIds?.[0]} grad={grad} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <StatusDot status={saree.approvalStatus ?? "pending"} />
                    <span style={{
                      fontSize: 14.5, fontWeight: 700, color: "var(--w-ink)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {saree.name}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--w-ink-muted)", marginBottom: 6 }}>
                    {saree.fabric}{saree.region ? ` · ${saree.region}` : ""}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="w-mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--w-navy)" }}>
                      ₹{saree.price.toLocaleString("en-IN")}
                    </span>
                    {isOut && <span className="w-badge w-badge-danger">Out of stock</span>}
                    {isLow && !isOut && <span className="w-badge w-badge-warn">{saree.stock} left</span>}
                    {saree.tag && <span className="w-badge w-badge-gold">{saree.tag}</span>}
                  </div>
                </div>

                {/* Chevron */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
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
