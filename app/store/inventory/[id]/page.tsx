"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

function SareeImage({ fileId, fallbackEmoji, fallbackGrad }: { fileId?: Id<"_storage">; fallbackEmoji: string; fallbackGrad: string[] }) {
  const url = useQuery(api.files.getUrl, fileId ? { fileId } : "skip");
  if (fileId && url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="Saree" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    );
  }
  return (
    <div style={{
      width: "100%", height: "100%",
      background: `linear-gradient(135deg, ${fallbackGrad[0]}, ${fallbackGrad[1] || fallbackGrad[0]})`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontSize: 100 }}>{fallbackEmoji}</span>
    </div>
  );
}

const PHOTO_TABS = ["Front View", "Back View", "Pallu Detail", "Border Detail"];
const FABRICS = ["Silk", "Pure Silk", "Cotton", "Georgette", "Crepe", "Chiffon", "Linen", "Cotton-Silk", "Organza", "Tissue"];

export default function SareeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sareeId = params.id as Id<"sarees">;

  const saree = useQuery(api.sarees.getById, { id: sareeId });
  const updateSaree = useMutation(api.sarees.update);
  const updateStock = useMutation(api.sarees.updateStock);
  const deleteSaree = useMutation(api.sarees.remove);

  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [stockInput, setStockInput] = useState("");
  const [editForm, setEditForm] = useState<Record<string, string | number>>({});
  const [saving, setSaving] = useState(false);
  const [photoTab, setPhotoTab] = useState(0);

  if (saree === undefined) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, var(--rt-navy), var(--rt-teal))",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "pulse 2s infinite",
          }}>
            <span style={{ color: "var(--rt-gold)", fontSize: 14, fontWeight: 800, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>W</span>
          </div>
          <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading saree...</span>
        </div>
      </div>
    );
  }

  if (saree === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <BackBtn onClick={() => router.back()} />
        <div className="rt-card" style={{ textAlign: "center", padding: "40px 16px" }}>
          <p style={{ fontSize: 14, color: "var(--rt-muted)" }}>Saree not found</p>
        </div>
      </div>
    );
  }

  function startEditing() {
    setEditing(true);
    setEditForm({
      name: saree!.name,
      price: saree!.price,
      fabric: saree!.fabric,
      description: saree!.description || "",
      region: saree!.region || "",
      weave: saree!.weave || "",
      careInstructions: saree!.careInstructions || "",
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateSaree({
        id: sareeId,
        name: editForm.name as string || undefined,
        price: editForm.price ? Number(editForm.price) : undefined,
        fabric: editForm.fabric as string || undefined,
        description: editForm.description as string || undefined,
        region: editForm.region as string || undefined,
        weave: editForm.weave as string || undefined,
        careInstructions: editForm.careInstructions as string || undefined,
      });
      setEditing(false);
    } catch { /* */ } finally { setSaving(false); }
  }

  async function handleStockUpdate() {
    const n = parseInt(stockInput);
    if (isNaN(n) || n < 0) return;
    await updateStock({ id: sareeId, stock: n });
    setStockInput("");
  }

  async function handleDelete() {
    await deleteSaree({ id: sareeId });
    router.push("/store/inventory");
  }

  const discount = saree.mrp && saree.mrp > saree.price
    ? Math.round(((saree.mrp - saree.price) / saree.mrp) * 100)
    : 0;
  const grad = saree.grad || ["#ddd", "#eee"];
  const stockLabel = saree.stock <= 0 ? "Out of Stock" : saree.stock <= 5 ? `${saree.stock} left` : `${saree.stock} in stock`;
  const stockBadgeClass = saree.stock <= 0 ? "rt-badge rt-badge-alert" : saree.stock <= 5 ? "rt-badge rt-badge-amber" : "rt-badge rt-badge-success";
  const tryOnRate = (saree.views ?? 0) > 0 ? Math.round(((saree.tryOns ?? 0) / (saree.views ?? 1)) * 100) : 0;
  const conversionRate = (saree.tryOns ?? 0) > 0 ? Math.round(((saree.conversions ?? 0) / Math.max(saree.tryOns ?? 1, 1)) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <BackBtn onClick={() => router.back()} />
        <h1 style={{
          flex: 1,
          fontSize: 18,
          fontWeight: 700,
          color: "var(--rt-text)",
          margin: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {saree.name}
        </h1>
        {!editing && (
          <button className="rt-btn rt-btn-ghost rt-btn-sm" onClick={startEditing}>
            Edit
          </button>
        )}
      </div>

      {/* Hero */}
      <div style={{
        width: "100%",
        height: 220,
        borderRadius: "var(--rt-radius-lg)",
        position: "relative",
        overflow: "hidden",
      }}>
        <SareeImage
          fileId={saree.imageIds?.[photoTab]}
          fallbackEmoji={saree.emoji || "\uD83D\uDC57"}
          fallbackGrad={grad}
        />

        {/* Tag badge top-left */}
        {saree.tag && (
          <span style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "4px 12px",
            borderRadius: 100,
            background: "rgba(0,0,0,0.45)",
            color: "white",
            fontSize: 11,
            fontWeight: 700,
            backdropFilter: "blur(6px)",
          }}>
            {saree.tag}
          </span>
        )}

        {/* Low Stock badge bottom-right */}
        {saree.stock > 0 && saree.stock <= 5 && (
          <span style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            padding: "4px 12px",
            borderRadius: 100,
            background: "var(--rt-alert)",
            color: "white",
            fontSize: 11,
            fontWeight: 700,
          }}>
            Low Stock
          </span>
        )}
      </div>

      {/* Photo Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {PHOTO_TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setPhotoTab(i)}
            style={{
              padding: "6px 14px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
              border: `1.5px solid ${photoTab === i ? "var(--rt-teal)" : "var(--rt-border)"}`,
              background: photoTab === i ? "rgba(26, 74, 101, 0.08)" : "transparent",
              color: photoTab === i ? "var(--rt-teal)" : "var(--rt-muted)",
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Core Info */}
      <div className="rt-card">
        {editing ? (
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--rt-muted)", marginBottom: 4 }}>Name</label>
            <input
              type="text"
              value={editForm.name as string}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="rt-input"
            />
          </div>
        ) : (
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--rt-text)", marginBottom: 4 }}>
            {saree.name}
          </div>
        )}

        <div style={{ fontSize: 13, color: "var(--rt-muted)", marginBottom: 12 }}>
          {saree.fabric} {saree.region ? ` \u00B7 ${saree.region}` : ""} {" \u00B7 "}SKU {saree._id.slice(-6).toUpperCase()}
        </div>

        {/* Price */}
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>{"\u20B9"}</span>
            <input
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              className="rt-input rt-mono"
              style={{ width: 120 }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
            <span className="rt-mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--rt-success)" }}>
              {"\u20B9"}{saree.price.toLocaleString("en-IN")}
            </span>
            {discount > 0 && saree.mrp && (
              <>
                <span style={{ fontSize: 14, color: "var(--rt-muted)", textDecoration: "line-through" }}>
                  {"\u20B9"}{saree.mrp.toLocaleString("en-IN")}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--rt-success)" }}>
                  {discount}% off
                </span>
              </>
            )}
          </div>
        )}

        {/* Description */}
        {editing ? (
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--rt-muted)", marginBottom: 4 }}>Description</label>
            <textarea
              value={editForm.description as string}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="rt-input"
              style={{ resize: "none", fontFamily: "inherit" }}
            />
          </div>
        ) : saree.description ? (
          <p style={{ fontSize: 14, color: "var(--rt-text-mid)", lineHeight: 1.6, marginBottom: 12 }}>
            {saree.description}
          </p>
        ) : null}

        {/* Attribute Chips */}
        {!editing && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {saree.colorName && <AttrChip label={saree.colorName} />}
            <AttrChip label={saree.occasion} />
            {saree.weave && <AttrChip label={saree.weave} />}
            {saree.weight && <AttrChip label={saree.weight} />}
          </div>
        )}

        {/* Status badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <span className={stockBadgeClass}>{stockLabel}</span>
          {saree.approvalStatus && (
            <span className={`rt-badge ${
              saree.approvalStatus === "approved" ? "rt-badge-success"
              : saree.approvalStatus === "rejected" ? "rt-badge-alert"
              : "rt-badge-gold"
            }`}>
              {saree.approvalStatus}
            </span>
          )}
        </div>
      </div>

      {/* Edit: additional fields */}
      {editing && (
        <div className="rt-card">
          <div className="rt-card-title">Edit Details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--rt-muted)", marginBottom: 4 }}>Fabric</label>
              <select
                value={editForm.fabric as string}
                onChange={(e) => setEditForm({ ...editForm, fabric: e.target.value })}
                className="rt-select"
              >
                {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--rt-muted)", marginBottom: 4 }}>Region</label>
                <input
                  type="text"
                  value={editForm.region as string}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  className="rt-input"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--rt-muted)", marginBottom: 4 }}>Weave</label>
                <input
                  type="text"
                  value={editForm.weave as string}
                  onChange={(e) => setEditForm({ ...editForm, weave: e.target.value })}
                  className="rt-input"
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--rt-muted)", marginBottom: 4 }}>Care Instructions</label>
              <input
                type="text"
                value={editForm.careInstructions as string}
                onChange={(e) => setEditForm({ ...editForm, careInstructions: e.target.value })}
                className="rt-input"
              />
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              <button className="rt-btn rt-btn-ghost rt-btn-sm" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button className="rt-btn rt-btn-primary rt-btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance */}
      <div className="rt-card">
        <div className="rt-card-title">Performance This Month</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
          <StatBox emoji={"\uD83D\uDC41"} value={saree.views ?? 0} label="Views" />
          <StatBox emoji={"\uD83E\uDE9E"} value={saree.tryOns ?? 0} label="Sessions" />
          <StatBox emoji={"\u2728"} value={saree.tryOns ?? 0} label="Try-Ons" />
          <StatBox emoji={"\uD83D\uDCB0"} value={saree.conversions ?? 0} label="Sales" />
        </div>

        {(saree.tryOns ?? 0) > 0 && (saree.views ?? 0) > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 10 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--rt-text-mid)" }}>Try-On Rate</span>
                <span className="rt-mono" style={{ fontWeight: 700, color: "var(--rt-text)" }}>{tryOnRate}%</span>
              </div>
              <div className="rt-progress">
                <div
                  className="rt-progress-fill"
                  style={{ width: `${Math.min(tryOnRate, 100)}%`, background: "linear-gradient(90deg, var(--rt-teal), var(--rt-teal-light))" }}
                />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--rt-text-mid)" }}>Conversion Rate</span>
                <span className="rt-mono" style={{ fontWeight: 700, color: "var(--rt-text)" }}>{conversionRate}%</span>
              </div>
              <div className="rt-progress">
                <div
                  className="rt-progress-fill"
                  style={{ width: `${Math.min(conversionRate, 100)}%`, background: "linear-gradient(90deg, var(--rt-gold), var(--rt-gold-light))" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Days old */}
        <div style={{
          fontSize: 12,
          color: "var(--rt-muted)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingTop: 4,
          borderTop: "1px solid var(--rt-border)",
          marginTop: 6,
        }}>
          <span>{"\uD83D\uDCC5"}</span>
          <span>{saree.daysOld ?? 0} days in catalogue</span>
        </div>
      </div>

      {/* AI Tags */}
      {saree.aiTags && saree.aiTags.length > 0 && (
        <div className="rt-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>{"\uD83E\uDD16"}</span>
            <span className="rt-card-title" style={{ marginBottom: 0 }}>AI Tags</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {saree.aiTags.map((t) => (
              <span
                key={t}
                style={{
                  padding: "4px 12px",
                  borderRadius: 100,
                  background: "rgba(26, 74, 101, 0.1)",
                  color: "var(--rt-teal)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stock Update */}
      <div className="rt-card">
        <div className="rt-card-title">Update Stock</div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--rt-muted)", marginBottom: 4 }}>
              New stock quantity
            </label>
            <input
              type="number"
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              placeholder={String(saree.stock)}
              className="rt-input rt-mono"
            />
          </div>
          <button
            className="rt-btn rt-btn-primary rt-btn-sm"
            onClick={handleStockUpdate}
            style={{ marginBottom: 1 }}
          >
            Update
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button
          className="rt-btn rt-btn-primary"
          onClick={startEditing}
        >
          Edit Details
        </button>
        <button
          className="rt-btn rt-btn-ghost"
          onClick={() => {
            const msg = encodeURIComponent(
              `Check out ${saree.name} (${saree.fabric}) at \u20B9${saree.price.toLocaleString("en-IN")} on Wearify!`
            );
            window.open(`https://wa.me/?text=${msg}`, "_blank");
          }}
        >
          Share on WhatsApp
        </button>
      </div>

      {/* Delete */}
      <button
        className="rt-btn rt-btn-danger"
        style={{ width: "100%" }}
        onClick={() => setShowDelete(true)}
      >
        Delete Saree
      </button>

      {/* Delete Modal */}
      {showDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowDelete(false)}
        >
          <div
            style={{
              background: "var(--rt-white)",
              borderRadius: "var(--rt-radius-lg)",
              padding: 24,
              maxWidth: 380,
              width: "100%",
              boxShadow: "0 20px 60px rgba(10, 22, 40, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--rt-text)", marginBottom: 8 }}>
              Delete Saree?
            </h3>
            <p style={{ fontSize: 14, color: "var(--rt-text-mid)", marginBottom: 20, lineHeight: 1.5 }}>
              This will permanently remove &ldquo;{saree.name}&rdquo; from your catalogue.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="rt-btn rt-btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <button
                className="rt-btn rt-btn-danger"
                style={{ flex: 1 }}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacing */}
      <div style={{ height: 16 }} />
    </div>
  );
}

/* ---- Helper Components ---- */

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "1.5px solid var(--rt-border)",
        background: "var(--rt-white)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rt-text)" strokeWidth="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}

function AttrChip({ label }: { label: string }) {
  return (
    <span style={{
      padding: "4px 14px",
      borderRadius: 100,
      border: "1.5px solid var(--rt-border)",
      background: "var(--rt-white)",
      fontSize: 12,
      fontWeight: 600,
      color: "var(--rt-text-mid)",
    }}>
      {label}
    </span>
  );
}

function StatBox({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <div className="rt-mono" style={{ fontSize: 16, fontWeight: 700, color: "var(--rt-text)" }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--rt-muted)" }}>{label}</div>
    </div>
  );
}
