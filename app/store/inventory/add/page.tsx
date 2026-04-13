"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUploadFile } from "@/lib/useUpload";
import { Id } from "@/convex/_generated/dataModel";

const TYPES = ["Banarasi", "Kanjeevaram", "Chanderi", "Tussar", "Organza", "Chiffon", "Georgette", "Cotton", "Linen", "Paithani"];
const FABRICS = ["Silk", "Pure Silk", "Cotton", "Georgette", "Crepe", "Chiffon", "Linen", "Cotton-Silk", "Organza", "Tissue"];
const OCCASIONS = ["Wedding", "Festival", "Party", "Office", "Daily", "Gift"];
const WEIGHTS = ["Light", "Medium", "Heavy"];
const COLOURS = ["Red", "Maroon", "Blue", "Navy Blue", "Green", "Yellow", "Pink", "Purple", "Gold", "Orange", "White", "Black", "Teal", "Cream", "Peach", "Beige", "Ivory"];

const PHOTO_SLOTS = [
  { key: "front", label: "Front", emoji: "👗" },
  { key: "back", label: "Back", emoji: "🔄" },
  { key: "pallu", label: "Pallu", emoji: "✨" },
  { key: "border", label: "Border", emoji: "🌺" },
] as const;

type PhotoKey = (typeof PHOTO_SLOTS)[number]["key"];
type PhotoState = Record<PhotoKey, File | null>;
type PhotoPreview = Record<PhotoKey, string | null>;

const AI_TAGS_POOL = [
  "Traditional", "Handwoven", "Zari Work", "Temple Border", "Bridal",
  "Festive", "Lightweight", "Heavy Weight", "Premium", "Brocade",
  "Block Print", "Hand Embroidered", "Daily Wear", "Party Wear",
  "Kanjeevaram Style", "Banarasi Style", "Designer", "Contemporary",
];

export default function AddSareePage() {
  const router = useRouter();
  const createSaree = useMutation(api.sarees.create);
  const { upload } = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<PhotoKey | null>(null);

  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [photos, setPhotos] = useState<PhotoState>({ front: null, back: null, pallu: null, border: null });
  const [previews, setPreviews] = useState<PhotoPreview>({ front: null, back: null, pallu: null, border: null });

  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiTagging, setAiTagging] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [fabric, setFabric] = useState(FABRICS[0]);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [color, setColor] = useState(COLOURS[0]);
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [weave, setWeave] = useState("");
  const [weight, setWeight] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [showAdditional, setShowAdditional] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch { /* ignore */ }
  }, []);

  const photoCount = Object.values(photos).filter(Boolean).length;

  useEffect(() => {
    if (photoCount >= 2 && !aiTagging && !aiDone) simulateAITagging();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoCount]);

  function simulateAITagging() {
    setAiTagging(true); setAiDone(false); setAiTags([]);
    setTimeout(() => {
      const shuffled = [...AI_TAGS_POOL].sort(() => Math.random() - 0.5);
      const generated = shuffled.slice(0, 4 + Math.floor(Math.random() * 3));
      const tags = [type, fabric, ...generated].filter((v, i, a) => a.indexOf(v) === i);
      setAiTags(tags); setAiTagging(false); setAiDone(true);
    }, 3000);
  }

  function handlePhotoClick(slot: PhotoKey) {
    setActiveSlot(slot);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!activeSlot || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    setPhotos((prev) => ({ ...prev, [activeSlot]: file }));
    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [activeSlot]: url }));
    e.target.value = "";
  }

  function removeTag(tag: string) { setAiTags(aiTags.filter((t) => t !== tag)); }
  function addTag() {
    const t = newTag.trim();
    if (t && !aiTags.includes(t)) { setAiTags([...aiTags, t]); setNewTag(""); }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function handleSave(addAnother: boolean) {
    if (!name.trim() || name.trim().length < 2 || name.trim().length > 100) {
      setError("Saree name is required (2–100 characters)"); return;
    }
    if (!price || Number(price) < 100 || Number(price) > 500000) {
      setError("Price must be between ₹100 and ₹5,00,000"); return;
    }
    if (!stock || Number(stock) < 1) { setError("Stock must be at least 1"); return; }
    if (photoCount < 1) { setError("Please add at least 1 photo"); return; }
    if (!storeId) { setError("Store ID not found. Please re-login."); return; }

    setLoading(true); setError("");
    try {
      const imageIds: Id<"_storage">[] = [];
      for (const key of ["front", "back", "pallu", "border"] as PhotoKey[]) {
        const file = photos[key];
        if (file) { const id = await upload(file); imageIds.push(id); }
      }
      const stockNum = parseInt(stock);
      let status = "active";
      if (stockNum <= 0) status = "out_of_stock";
      else if (stockNum <= 5) status = "low_stock";

      await createSaree({
        storeId, name: name.trim(), type, fabric, occasion,
        price: parseFloat(price), stock: stockNum, status,
        colors: [color], colorName: color,
        description: description.trim() || undefined,
        region: region.trim() || undefined, weave: weave.trim() || undefined,
        weight: weight || undefined, careInstructions: careInstructions.trim() || undefined,
        aiTags: aiTags.length > 0 ? aiTags : undefined,
        imageIds: imageIds.length > 0 ? imageIds : undefined,
      });

      if (addAnother) {
        showToast("Saree added! Form reset.");
        setName(""); setPrice(""); setStock("1"); setDescription("");
        setRegion(""); setWeave(""); setWeight(""); setCareInstructions("");
        setPhotos({ front: null, back: null, pallu: null, border: null });
        setPreviews({ front: null, back: null, pallu: null, border: null });
        setAiTags([]); setAiDone(false);
      } else {
        router.push("/store/inventory");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add saree");
    } finally { setLoading(false); }
  }

  return (
    <div className="w-add-root">
      <input ref={fileInputRef} type="file" accept="image/*"
        style={{ display: "none" }} onChange={handleFileChange} />

      {/* ── Header ── */}
      <div className="w-detail-header">
        <button className="w-back-btn" onClick={() => router.back()} aria-label="Go back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <p className="w-page-eyebrow">Catalogue</p>
          <h1 className="w-display w-page-title" style={{ fontSize: 26 }}>Add New Saree</h1>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && <div className="w-toast">{toast}</div>}

      {/* ── Error ── */}
      {error && (
        <div className="w-modal-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Photo section ── */}
      <div className="w-card w-add-photos-card">
        <div className="w-card-header">
          <span className="w-card-title">Photos</span>
          <span className="w-mono" style={{
            fontSize: 12, fontWeight: 700,
            color: photoCount >= 2 ? "var(--w-success)" : "var(--w-ink-muted)",
          }}>{photoCount}/4</span>
        </div>
        <p className="w-add-photos-hint">Add 2+ photos to unlock AI auto-tagging</p>
        <div className="w-photo-slots">
          {PHOTO_SLOTS.map((slot) => {
            const hasPhoto = !!photos[slot.key];
            const preview = previews[slot.key];
            return (
              <button key={slot.key} className={`w-photo-slot${hasPhoto ? " filled" : ""}`}
                onClick={() => handlePhotoClick(slot.key)}>
                {preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={slot.label} className="w-photo-slot-img" />
                    <div className="w-photo-slot-check">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="w-photo-slot-label">{slot.label}</span>
                  </>
                ) : (
                  <>
                    <span className="w-photo-slot-emoji">{slot.emoji}</span>
                    <span className="w-photo-slot-plus">+</span>
                    <span className="w-photo-slot-name">{slot.label}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
        {photoCount === 0 && (
          <p className="w-add-photos-req">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            At least 1 photo required
          </p>
        )}
      </div>

      {/* ── AI Tags ── */}
      {(aiTagging || aiDone) && (
        <div className="w-aitag-panel">
          <div className="w-card-header" style={{ marginBottom: 12 }}>
            <span className="w-card-title">AI Auto-Tags</span>
            <span style={{ fontSize: 16 }}>🤖</span>
          </div>
          {aiTagging ? (
            <div className="w-aitag-loading">
              <div className="w-aitag-skeleton-wrap">
                {["Detecting weave…", "Identifying region…", "Classifying occasion…", "Estimating weight…"].map((t) => (
                  <span key={t} className="w-aitag-skeleton">{t}</span>
                ))}
              </div>
              <div className="w-progress" style={{ marginTop: 12 }}>
                <div className="w-progress-fill w-hbar-fill-gold w-aitag-progress-fill" style={{ width: "65%" }} />
              </div>
              <p className="w-aitag-model-note">Processing with FashionCLIP model…</p>
            </div>
          ) : (
            <div>
              <div className="w-aitags-wrap">
                {aiTags.map((tag) => (
                  <span key={tag} className="w-aitag w-aitag-removable">
                    {tag}
                    <button className="w-aitag-remove" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
                <button className="w-aitag-add-btn" onClick={() => document.getElementById("add-tag-input")?.focus()}>
                  + Add tag
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input id="add-tag-input" type="text" className="w-input" style={{ flex: 1, fontSize: 13 }}
                  value={newTag} placeholder="Custom tag…"
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
              </div>
              <p className="w-aitag-hint">Tap × to remove incorrect tags — improves Smart Mirror search.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Basic Details ── */}
      <div className="w-card w-add-form-card">
        <div className="w-card-title w-serif" style={{ marginBottom: 16 }}>Basic Details</div>
        <div className="w-modal-form">

          <div className="w-field">
            <label className="w-label">Saree Name <span className="w-label-req">*</span></label>
            <input type="text" className="w-input" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kanjivaram Bridal Silk" maxLength={100} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="w-field">
              <label className="w-label">Price (₹) <span className="w-label-req">*</span></label>
              <div className="w-price-input-wrap">
                <span className="w-price-prefix w-mono">₹</span>
                <input type="text" className="w-mono w-price-input"
                  value={price} placeholder="12500"
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} />
              </div>
            </div>
            <div className="w-field">
              <label className="w-label">Stock Qty <span className="w-label-req">*</span></label>
              <input type="text" className="w-input w-mono" value={stock}
                placeholder="1" onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="w-field">
              <label className="w-label">Fabric <span className="w-label-req">*</span></label>
              <select className="w-input w-select" value={fabric} onChange={(e) => setFabric(e.target.value)}>
                {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="w-field">
              <label className="w-label">Primary Colour</label>
              <select className="w-input w-select" value={color} onChange={(e) => setColor(e.target.value)}>
                {COLOURS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="w-field">
              <label className="w-label">Type</label>
              <select className="w-input w-select" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="w-field">
              <label className="w-label">Occasion</label>
              <select className="w-input w-select" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Additional Details (collapsible) ── */}
      <div className="w-card w-add-additional-card">
        <button className="w-collapsible-trigger" onClick={() => setShowAdditional(!showAdditional)}>
          <span className="w-collapsible-title">Additional Details</span>
          <span className="w-collapsible-opt">optional</span>
          <svg className={`w-collapsible-chevron${showAdditional ? " open" : ""}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showAdditional && (
          <div className="w-collapsible-body">
            <div className="w-modal-form">
              <div className="w-field">
                <label className="w-label">Description</label>
                <textarea className="w-input w-textarea" rows={3} value={description}
                  placeholder="Describe the saree — helps AI recommendations…"
                  onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="w-field">
                  <label className="w-label">Region</label>
                  <input type="text" className="w-input" value={region}
                    placeholder="e.g., Varanasi" onChange={(e) => setRegion(e.target.value)} />
                </div>
                <div className="w-field">
                  <label className="w-label">Weave</label>
                  <input type="text" className="w-input" value={weave}
                    placeholder="e.g., Jacquard" onChange={(e) => setWeave(e.target.value)} />
                </div>
              </div>
              <div className="w-field">
                <label className="w-label">Weight</label>
                <div className="w-channel-pills">
                  {WEIGHTS.map((w) => (
                    <button key={w} className={`w-channel-pill${weight === w ? " active" : ""}`}
                      onClick={() => setWeight(weight === w ? "" : w)}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-field">
                <label className="w-label">Care Instructions</label>
                <textarea className="w-input w-textarea" rows={2} value={careInstructions}
                  placeholder="e.g., Dry clean only"
                  onChange={(e) => setCareInstructions(e.target.value)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Save buttons ── */}
      <div className="w-add-save-row">
        <button className="w-btn w-btn-primary" style={{ flex: 2 }}
          onClick={() => handleSave(false)} disabled={loading}>
          {loading ? <><span className="w-spinner" /> Saving…</> : "Save & Done"}
        </button>
        <button className="w-btn w-btn-ghost" style={{ flex: 1 }}
          onClick={() => handleSave(true)} disabled={loading}>
          + Add Another
        </button>
      </div>

      <div style={{ height: 16 }} />
    </div>
  );
}