"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

function SareeImage({ fileId, fallbackEmoji, fallbackGrad }: {
  fileId?: Id<"_storage">; fallbackEmoji: string; fallbackGrad: string[];
}) {
  const url = useQuery(api.files.getUrl, fileId ? { fileId } : "skip");
  if (fileId && url) {
    return <img src={url} alt="Saree" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  return (
    <div style={{
      width: "100%", height: "100%",
      background: `linear-gradient(145deg, ${fallbackGrad[0]}, ${fallbackGrad[1] || fallbackGrad[0]})`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontSize: 96 }}>{fallbackEmoji}</span>
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
  const [resubmitting, setResubmitting] = useState(false);

  /* ── Loading ── */
  if (saree === undefined) {
    return (
      <div className="w-page-loading" style={{ minHeight: "60vh" }}>
        <div className="w-load-mark"><span className="w-logomark-letter" style={{ fontSize: 17 }}>W</span></div>
        <div><span className="w-load-text">Loading saree</span><span className="w-load-dots"><span /><span /><span /></span></div>
      </div>
    );
  }

  /* ── Not found ── */
  if (saree === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <BackBtn onClick={() => router.back()} />
        <div className="w-card w-inv-empty">
          <p className="w-serif" style={{ fontSize: 17, fontStyle: "italic", color: "var(--w-ink-muted)" }}>Saree not found</p>
        </div>
      </div>
    );
  }

  const isPending = saree.approvalStatus === "pending";
  const isCorrections = saree.approvalStatus === "corrections";

  async function handleResubmit() {
    setResubmitting(true);
    try { await updateSaree({ id: sareeId, approvalStatus: "pending" }); }
    catch { /* */ } finally { setResubmitting(false); }
  }

  function startEditing() {
    setEditing(true);
    setEditForm({
      name: saree!.name, price: saree!.price,
      fabric: saree!.fabric, description: saree!.description || "",
      region: saree!.region || "", weave: saree!.weave || "",
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
    ? Math.round(((saree.mrp - saree.price) / saree.mrp) * 100) : 0;
  const grad = saree.grad || ["#0D1F35", "#1A5276"];
  const stockLabel = saree.stock <= 0 ? "Out of Stock" : saree.stock <= 5 ? `${saree.stock} left` : `${saree.stock} in stock`;
  const stockBadgeClass = saree.stock <= 0 ? "w-badge w-badge-danger" : saree.stock <= 5 ? "w-badge w-badge-warn" : "w-badge w-badge-success";
  const tryOnRate = (saree.views ?? 0) > 0 ? Math.round(((saree.tryOns ?? 0) / (saree.views ?? 1)) * 100) : 0;
  const conversionRate = (saree.tryOns ?? 0) > 0 ? Math.round(((saree.conversions ?? 0) / Math.max(saree.tryOns ?? 1, 1)) * 100) : 0;

  return (
    <div className="w-detail-root">

      {/* ── Header ── */}
      <div className="w-detail-header">
        <BackBtn onClick={() => router.back()} />
        <h1 className="w-detail-heading">{saree.name}</h1>
        {!editing && !isPending && (
          <button className="w-btn w-btn-ghost w-btn-sm" onClick={startEditing}>Edit</button>
        )}
      </div>

      {/* ── Approval banners ── */}
      {isPending && (
        <div className="w-approval-banner w-approval-banner--pending">
          <div className="w-approval-icon">⏳</div>
          <div>
            <div className="w-approval-title">Pending Admin Approval</div>
            <div className="w-approval-body">Awaiting admin review. Editing is not available until approved.</div>
          </div>
        </div>
      )}
      {isCorrections && (
        <div className="w-approval-banner w-approval-banner--corrections">
          <div className="w-approval-banner-top">
            <div className="w-approval-icon">✏️</div>
            <div>
              <div className="w-approval-title" style={{ color: "var(--w-gold)" }}>Corrections Requested</div>
              <div className="w-approval-body">Admin has requested changes. Please edit and resubmit.</div>
            </div>
          </div>
          {saree.correctionNote && (
            <div className="w-correction-note-box">
              <span className="w-correction-note-label">Admin note</span>
              {saree.correctionNote}
            </div>
          )}
          <button className="w-btn w-btn-primary w-btn-sm" style={{ alignSelf: "flex-start" }}
            onClick={handleResubmit} disabled={resubmitting}>
            {resubmitting ? "Resubmitting…" : "Resubmit for Approval"}
          </button>
        </div>
      )}

      {/* ── Hero image ── */}
      <div className="w-detail-hero">
        <SareeImage fileId={saree.imageIds?.[photoTab]} fallbackEmoji={saree.emoji || "👗"} fallbackGrad={grad} />
        {saree.tag && (
          <span className="w-detail-hero-tag">{saree.tag}</span>
        )}
        {saree.stock > 0 && saree.stock <= 5 && (
          <span className="w-detail-hero-lowstock">Low Stock</span>
        )}
      </div>

      {/* ── Photo tabs ── */}
      <div className="w-photo-tabs">
        {PHOTO_TABS.map((tab, i) => (
          <button key={tab} className={`w-photo-tab${photoTab === i ? " active" : ""}`}
            onClick={() => setPhotoTab(i)}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Core info card ── */}
      <div className="w-card w-detail-info-card">
        {editing ? (
          <div className="w-field" style={{ marginBottom: 12 }}>
            <label className="w-label">Name</label>
            <input className="w-input" type="text" value={editForm.name as string}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
        ) : (
          <div className="w-detail-name">{saree.name}</div>
        )}

        <div className="w-detail-meta">
          {saree.fabric}{saree.region ? ` · ${saree.region}` : ""} · SKU {saree._id.slice(-6).toUpperCase()}
        </div>

        {/* Price */}
        {editing ? (
          <div className="w-detail-price-edit">
            <span className="w-detail-price-prefix">₹</span>
            <input type="number" className="w-input w-mono" style={{ width: 130 }}
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
          </div>
        ) : (
          <div className="w-detail-price-row">
            <span className="w-mono w-detail-price">₹{saree.price.toLocaleString("en-IN")}</span>
            {discount > 0 && saree.mrp && (
              <>
                <span className="w-detail-mrp">₹{saree.mrp.toLocaleString("en-IN")}</span>
                <span className="w-badge w-badge-success">{discount}% off</span>
              </>
            )}
          </div>
        )}

        {/* Description */}
        {editing ? (
          <div className="w-field" style={{ marginTop: 12 }}>
            <label className="w-label">Description</label>
            <textarea className="w-input w-textarea" rows={3}
              value={editForm.description as string}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          </div>
        ) : saree.description ? (
          <p className="w-detail-description">{saree.description}</p>
        ) : null}

        {/* Attribute chips */}
        {!editing && (
          <div className="w-attr-chips">
            {saree.colorName && <AttrChip label={saree.colorName} />}
            <AttrChip label={saree.occasion} />
            {saree.weave && <AttrChip label={saree.weave} />}
            {saree.weight && <AttrChip label={saree.weight} />}
          </div>
        )}

        {/* Status badges */}
        <div className="w-detail-badges">
          <span className={stockBadgeClass}>{stockLabel}</span>
          {saree.approvalStatus && (
            <span className={`w-badge ${saree.approvalStatus === "approved" ? "w-badge-success" :
                saree.approvalStatus === "rejected" ? "w-badge-danger" : "w-badge-gold"
              }`}>{saree.approvalStatus}</span>
          )}
        </div>
      </div>

      {/* ── Edit additional fields ── */}
      {editing && (
        <div className="w-card w-detail-edit-card">
          <div className="w-card-title w-serif" style={{ marginBottom: 14 }}>Edit Details</div>
          <div className="w-modal-form">
            <div className="w-field">
              <label className="w-label">Fabric</label>
              <select className="w-input w-select" value={editForm.fabric as string}
                onChange={(e) => setEditForm({ ...editForm, fabric: e.target.value })}>
                {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="w-field">
                <label className="w-label">Region</label>
                <input className="w-input" type="text" value={editForm.region as string}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })} />
              </div>
              <div className="w-field">
                <label className="w-label">Weave</label>
                <input className="w-input" type="text" value={editForm.weave as string}
                  onChange={(e) => setEditForm({ ...editForm, weave: e.target.value })} />
              </div>
            </div>
            <div className="w-field">
              <label className="w-label">Care Instructions</label>
              <input className="w-input" type="text" value={editForm.careInstructions as string}
                onChange={(e) => setEditForm({ ...editForm, careInstructions: e.target.value })} />
            </div>
            <div className="w-modal-actions">
              <button className="w-btn w-btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
              <button className="w-btn w-btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
                {saving ? <><span className="w-spinner" /> Saving…</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Performance ── */}
      <div className="w-card w-detail-perf-card">
        <div className="w-card-header" style={{ marginBottom: 14 }}>
          <span className="w-card-title">Performance this month</span>
        </div>
        <div className="w-perf-stats">
          <StatBox icon="👁" value={saree.views ?? 0} label="Views" />
          <StatBox icon="🪞" value={saree.tryOns ?? 0} label="Sessions" />
          <StatBox icon="✨" value={saree.tryOns ?? 0} label="Try-Ons" />
          <StatBox icon="💰" value={saree.conversions ?? 0} label="Sales" />
        </div>

        {(saree.tryOns ?? 0) > 0 && (saree.views ?? 0) > 0 && (
          <div className="w-perf-bars">
            <div className="w-perf-bar-row">
              <div className="w-perf-bar-labels">
                <span>Try-On Rate</span>
                <span className="w-mono">{tryOnRate}%</span>
              </div>
              <div className="w-progress">
                <div className="w-progress-fill w-hbar-fill-teal"
                  style={{ width: `${Math.min(tryOnRate, 100)}%` }} />
              </div>
            </div>
            <div className="w-perf-bar-row">
              <div className="w-perf-bar-labels">
                <span>Conversion Rate</span>
                <span className="w-mono">{conversionRate}%</span>
              </div>
              <div className="w-progress">
                <div className="w-progress-fill w-hbar-fill-gold"
                  style={{ width: `${Math.min(conversionRate, 100)}%` }} />
              </div>
            </div>
          </div>
        )}

        <div className="w-perf-days">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {saree.daysOld ?? 0} days in catalogue
        </div>
      </div>

      {/* ── AI Tags ── */}
      {saree.aiTags && saree.aiTags.length > 0 && (
        <div className="w-card w-detail-aitags-card">
          <div className="w-card-header" style={{ marginBottom: 12 }}>
            <span className="w-card-title">AI Tags</span>
            <span style={{ fontSize: 16 }}>🤖</span>
          </div>
          <div className="w-aitags-wrap">
            {saree.aiTags.map((t) => (
              <span key={t} className="w-aitag">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Stock update ── */}
      {!isPending && (
        <div className="w-card w-detail-stock-card">
          <div className="w-card-title w-serif" style={{ marginBottom: 14 }}>Update Stock</div>
          <div className="w-stock-row">
            <div className="w-field" style={{ flex: 1 }}>
              <label className="w-label">New quantity</label>
              <input type="number" className="w-input w-mono"
                value={stockInput} placeholder={String(saree.stock)}
                onChange={(e) => setStockInput(e.target.value)} />
            </div>
            <button className="w-btn w-btn-primary" style={{ alignSelf: "flex-end" }}
              onClick={handleStockUpdate}>
              Update
            </button>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      {!isPending && (
        <div className="w-detail-actions">
          <button className="w-btn w-btn-primary" style={{ flex: 1 }} onClick={startEditing}>
            Edit Details
          </button>
          <button className="w-btn w-btn-ghost" style={{ flex: 1 }} onClick={() => {
            const msg = encodeURIComponent(`Check out ${saree.name} (${saree.fabric}) at ₹${saree.price.toLocaleString("en-IN")} on Wearify!`);
            window.open(`https://wa.me/?text=${msg}`, "_blank");
          }}>
            Share
          </button>
        </div>
      )}

      {/* ── Delete button ── */}
      {!isPending && (
        <button className="w-btn w-btn-danger-outline" style={{ width: "100%" }}
          onClick={() => setShowDelete(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
          Delete Saree
        </button>
      )}

      {/* ── Delete modal ── */}
      {showDelete && (
        <div className="w-modal-backdrop" onClick={() => setShowDelete(false)}>
          <div className="w-modal w-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="w-delete-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--w-danger)" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
              </svg>
            </div>
            <h3 className="w-serif w-delete-title">Delete this saree?</h3>
            <p className="w-delete-body">
              This will permanently remove &ldquo;{saree.name}&rdquo; from your catalogue. This cannot be undone.
            </p>
            <div className="w-modal-actions" style={{ marginTop: 20 }}>
              <button className="w-btn w-btn-ghost" style={{ flex: 1 }} onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="w-btn w-btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}

/* ── Helpers ── */
function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="w-back-btn" onClick={onClick} aria-label="Go back">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}

function AttrChip({ label }: { label: string }) {
  return <span className="w-attr-chip">{label}</span>;
}

function StatBox({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="w-perf-statbox">
      <span className="w-perf-statbox-icon">{icon}</span>
      <div className="w-mono w-perf-statbox-val">{value}</div>
      <div className="w-perf-statbox-label">{label}</div>
    </div>
  );
}