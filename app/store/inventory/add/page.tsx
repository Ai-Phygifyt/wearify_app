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
  { key: "front", label: "Front", emoji: "\uD83D\uDC57" },
  { key: "back", label: "Back", emoji: "\uD83D\uDD04" },
  { key: "pallu", label: "Pallu", emoji: "\u2728" },
  { key: "border", label: "Border", emoji: "\uD83C\uDF3A" },
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

  // Photos
  const [photos, setPhotos] = useState<PhotoState>({ front: null, back: null, pallu: null, border: null });
  const [previews, setPreviews] = useState<PhotoPreview>({ front: null, back: null, pallu: null, border: null });

  // AI Tags
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiTagging, setAiTagging] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [newTag, setNewTag] = useState("");

  // Form fields
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

  // Additional details collapsed
  const [showAdditional, setShowAdditional] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch { /* ignore */ }
  }, []);

  const photoCount = Object.values(photos).filter(Boolean).length;

  // Trigger AI auto-tagging when 2+ photos
  useEffect(() => {
    if (photoCount >= 2 && !aiTagging && !aiDone) {
      simulateAITagging();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoCount]);

  function simulateAITagging() {
    setAiTagging(true);
    setAiDone(false);
    setAiTags([]);
    setTimeout(() => {
      const shuffled = [...AI_TAGS_POOL].sort(() => Math.random() - 0.5);
      const generated = shuffled.slice(0, 4 + Math.floor(Math.random() * 3));
      const tags = [type, fabric, ...generated].filter((v, i, a) => a.indexOf(v) === i);
      setAiTags(tags);
      setAiTagging(false);
      setAiDone(true);
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

  function removeTag(tag: string) {
    setAiTags(aiTags.filter((t) => t !== tag));
  }

  function addTag() {
    const t = newTag.trim();
    if (t && !aiTags.includes(t)) {
      setAiTags([...aiTags, t]);
      setNewTag("");
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleSave(addAnother: boolean) {
    if (!name.trim() || name.trim().length < 2 || name.trim().length > 100) {
      setError("Saree name is required (2-100 characters)");
      return;
    }
    if (!price || Number(price) < 100 || Number(price) > 500000) {
      setError("Price must be between \u20B9100 and \u20B95,00,000");
      return;
    }
    if (!stock || Number(stock) < 1) {
      setError("Stock must be at least 1");
      return;
    }
    if (photoCount < 1) {
      setError("Please add at least 1 photo");
      return;
    }
    if (!storeId) {
      setError("Store ID not found. Please re-login.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload all photos to Convex storage
      const imageIds: Id<"_storage">[] = [];
      const photoKeys: PhotoKey[] = ["front", "back", "pallu", "border"];
      for (const key of photoKeys) {
        const file = photos[key];
        if (file) {
          const id = await upload(file);
          imageIds.push(id);
        }
      }

      const stockNum = parseInt(stock);
      let status = "active";
      if (stockNum <= 0) status = "out_of_stock";
      else if (stockNum <= 5) status = "low_stock";

      await createSaree({
        storeId,
        name: name.trim(),
        type,
        fabric,
        occasion,
        price: parseFloat(price),
        stock: stockNum,
        status,
        colors: [color],
        colorName: color,
        description: description.trim() || undefined,
        region: region.trim() || undefined,
        weave: weave.trim() || undefined,
        weight: weight || undefined,
        careInstructions: careInstructions.trim() || undefined,
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => router.back()}
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
        <h1 className="rt-serif" style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--rt-navy)", margin: 0 }}>
          Add New Saree
        </h1>
      </div>

      {/* Toast */}
      {toast && <div className="rt-toast">{toast}</div>}

      {/* Error */}
      {error && (
        <div style={{
          padding: "10px 14px",
          borderRadius: "var(--rt-radius)",
          background: "rgba(183, 28, 28, 0.08)",
          color: "var(--rt-alert)",
          fontSize: 13,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span>{"\u26A0"}</span> {error}
        </div>
      )}

      {/* Photo Section */}
      <div className="rt-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div className="rt-card-title" style={{ marginBottom: 0 }}>Photos</div>
          <span
            className="rt-mono"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: photoCount >= 2 ? "var(--rt-success)" : "var(--rt-muted)",
            }}
          >
            {photoCount}/4 added
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--rt-muted)", marginBottom: 10 }}>
          Add photos for AI tagging
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {PHOTO_SLOTS.map((slot) => {
            const hasPhoto = !!photos[slot.key];
            const preview = previews[slot.key];
            return (
              <button
                key={slot.key}
                onClick={() => handlePhotoClick(slot.key)}
                style={{
                  flex: 1,
                  minWidth: 70,
                  height: 88,
                  borderRadius: 14,
                  border: `2px dashed ${hasPhoto ? "var(--rt-success)" : "var(--rt-border)"}`,
                  background: hasPhoto ? "rgba(27, 94, 32, 0.04)" : "var(--rt-white)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  cursor: "pointer",
                  padding: 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={slot.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
                    />
                    <div style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "var(--rt-success)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span style={{
                      position: "absolute",
                      bottom: 2,
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--rt-teal)",
                      background: "rgba(255,255,255,0.85)",
                      padding: "1px 6px",
                      borderRadius: 6,
                    }}>
                      {slot.label}
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 20 }}>{slot.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--rt-muted)" }}>+</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--rt-muted)" }}>{slot.label}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
        {photoCount === 0 && (
          <p style={{ fontSize: 12, color: "var(--rt-alert)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <span>{"\u26A0"}</span> At least 1 photo required
          </p>
        )}
      </div>

      {/* AI Auto-Tags */}
      {(aiTagging || aiDone) && (
        <div style={{
          borderRadius: "var(--rt-radius)",
          border: "2px solid var(--rt-gold)",
          background: "rgba(201, 148, 26, 0.05)",
          padding: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>{"\uD83E\uDD16"}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-navy)" }}>AI Auto-Tags</span>
          </div>

          {aiTagging ? (
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {["Detecting weave...", "Identifying region...", "Classifying occasion...", "Estimating weight..."].map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 100,
                      background: "var(--rt-border)",
                      fontSize: 12,
                      color: "var(--rt-muted)",
                      animation: "pulse 2s infinite",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="rt-progress" style={{ marginBottom: 6 }}>
                <div
                  className="rt-progress-fill"
                  style={{ width: "65%", background: "linear-gradient(90deg, var(--rt-gold), var(--rt-gold-light))" }}
                />
              </div>
              <p style={{ fontSize: 10, color: "var(--rt-muted)" }}>Processing with FashionCLIP model...</p>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {aiTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 100,
                      background: "rgba(26, 74, 101, 0.1)",
                      color: "var(--rt-teal)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        color: "var(--rt-teal)",
                        fontSize: 14,
                        lineHeight: 1,
                        opacity: 0.7,
                      }}
                    >
                      {"\u00D7"}
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => document.getElementById("add-tag-input")?.focus()}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 100,
                    border: "1.5px dashed var(--rt-teal)",
                    background: "none",
                    color: "var(--rt-teal)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Add tag
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  id="add-tag-input"
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Custom tag..."
                  className="rt-input"
                  style={{ flex: 1, fontSize: 12, padding: "6px 12px" }}
                />
              </div>
              <p style={{ fontSize: 10, color: "var(--rt-muted)", marginTop: 8 }}>
                Tap {"\u00D7"} to remove incorrect tags. These improve Smart Mirror search.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Basic Details */}
      <div className="rt-card">
        <div className="rt-card-title">Basic Details</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Saree Name */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
              Saree Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kanjivaram Bridal Silk"
              maxLength={100}
              className="rt-input"
            />
          </div>

          {/* Price + Quantity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                Price ({"\u20B9"}) *
              </label>
              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1.5px solid var(--rt-border)",
                borderRadius: "var(--rt-radius-sm)",
                background: "var(--rt-white)",
                overflow: "hidden",
              }}>
                <span
                  className="rt-mono"
                  style={{
                    padding: "10px 12px",
                    fontSize: 14,
                    color: "var(--rt-muted)",
                    background: "var(--rt-cream)",
                    borderRight: "1.5px solid var(--rt-border)",
                  }}
                >
                  {"\u20B9"}
                </span>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                  placeholder="12500"
                  className="rt-mono"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    fontSize: 14,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    color: "var(--rt-text)",
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                Stock Qty *
              </label>
              <input
                type="text"
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
                placeholder="1"
                className="rt-input rt-mono"
              />
            </div>
          </div>

          {/* Fabric + Colour */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                Fabric *
              </label>
              <select
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="rt-select"
              >
                {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                Primary Colour
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="rt-select"
              >
                {COLOURS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Type + Occasion */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rt-select"
              >
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                Occasion
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="rt-select"
              >
                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details (collapsible) */}
      <div className="rt-card" style={{ padding: 0, overflow: "hidden" }}>
        <button
          onClick={() => setShowAdditional(!showAdditional)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--rt-navy)" }}>
            Additional Details (optional)
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--rt-muted)"
            strokeWidth="2"
            style={{
              transition: "transform 0.2s",
              transform: showAdditional ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {showAdditional && (
          <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Description */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the saree - helps AI recommendations..."
                rows={3}
                className="rt-input"
                style={{ resize: "none", fontFamily: "inherit" }}
              />
            </div>

            {/* Region + Weave */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                  Region
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g., Varanasi"
                  className="rt-input"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                  Weave
                </label>
                <input
                  type="text"
                  value={weave}
                  onChange={(e) => setWeave(e.target.value)}
                  placeholder="e.g., Jacquard"
                  className="rt-input"
                />
              </div>
            </div>

            {/* Weight */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                Weight
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {WEIGHTS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeight(weight === w ? "" : w)}
                    className="rt-pill"
                    style={{
                      ...(weight === w
                        ? { background: "var(--rt-navy)", color: "white", borderColor: "var(--rt-navy)" }
                        : {}),
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Care Instructions */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
                Care Instructions
              </label>
              <textarea
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="e.g., Dry clean only"
                rows={2}
                className="rt-input"
                style={{ resize: "none", fontFamily: "inherit" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16 }}>
        <button
          className="rt-btn rt-btn-primary"
          style={{ width: "100%" }}
          onClick={() => handleSave(false)}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save & Done"}
        </button>
        <button
          className="rt-btn rt-btn-ghost"
          style={{ width: "100%" }}
          onClick={() => handleSave(true)}
          disabled={loading}
        >
          Save & Add Another
        </button>
      </div>
    </div>
  );
}
