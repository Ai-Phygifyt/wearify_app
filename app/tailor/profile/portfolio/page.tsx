"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageLoading } from "@/components/ui/wearify-ui";
import { useUploadFile } from "@/lib/useUpload";
import { GUARDS, assertFileClient } from "@/lib/uploadGuards";
import { ConvexImage } from "@/lib/ConvexImage";

const GRADIENT_PALETTES = [
  ["#E8D5B7", "#C4A882"],
  ["#F5C6AA", "#D4886C"],
  ["#D4B8E0", "#A67BB5"],
  ["#B8D4E0", "#7BA6B5"],
  ["#C8E0B8", "#8FB577"],
  ["#E0D4B8", "#B5A67B"],
  ["#E0B8C8", "#B57B8F"],
  ["#B8E0D4", "#7BB5A6"],
];

export default function PortfolioPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tag, setTag] = useState("");
  const [occasion, setOccasion] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { upload } = useUploadFile();

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch { /* ignore */ }
  }, []);

  const portfolio = useQuery(
    api.tailorOps.getPortfolio,
    tailorId ? { tailorId } : "skip"
  );

  const addItem = useMutation(api.tailorOps.addPortfolioItem);
  const removeItem = useMutation(api.tailorOps.removePortfolioItem);

  if (!tailorId || portfolio === undefined) return <PageLoading />;

  function handlePhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      assertFileClient(f, GUARDS.portfolioPhoto);
    } catch (err: unknown) {
      setPhotoError(err instanceof Error ? err.message : "Invalid file");
      return;
    }
    setPhotoError("");
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  function resetForm() {
    setTag(""); setOccasion(""); setStyle("");
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null); setPhotoPreview(null);
    setPhotoError("");
    setShowForm(false);
  }

  async function handleAdd() {
    if (!tag.trim()) return;
    setLoading(true);
    try {
      const imageFileId = photo ? await upload(photo, GUARDS.portfolioPhoto) : undefined;
      const randomGrad = GRADIENT_PALETTES[Math.floor(Math.random() * GRADIENT_PALETTES.length)];
      await addItem({
        tailorId: tailorId!,
        tag: tag.trim(),
        occasion: occasion.trim() || undefined,
        style: style.trim() || undefined,
        grad: randomGrad,
        imageFileId,
      });
      resetForm();
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: Id<"tailorPortfolio">) {
    try { await removeItem({ id }); } catch { /* ignore */ }
  }

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <button
          type="button"
          className="t-back"
          onClick={() => router.push("/tailor/profile")}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>Portfolio</h1>
        <div className="t-right">
          <button
            type="button"
            className="t-icon-btn"
            onClick={() => setShowForm(true)}
            aria-label="Add work"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {portfolio.length === 0 && !showForm ? (
        <div className="t-empty">
          <div className="t-empty-ill">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <h3>Show your best work</h3>
          <p>
            Add 4–12 photos of past blouses. Good lighting and a neutral background help customers see the detail.
          </p>
          <button
            type="button"
            className="t-btn t-btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add first sample
          </button>
        </div>
      ) : (
        <div className="t-portfolio-grid">
          {portfolio.map((item) => {
            const grad = item.grad || ["#E8D5B7", "#C4A882"];
            return (
              <div key={item._id} className="t-portfolio-tile">
                <div
                  style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                  }}
                />
                {item.imageFileId && (
                  <ConvexImage
                    fileId={item.imageFileId}
                    alt={item.tag || "Portfolio item"}
                    className="t-portfolio-img"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                {item.tag && <span className="t-tag">{item.tag}</span>}
                <button
                  type="button"
                  onClick={() => handleRemove(item._id)}
                  aria-label="Remove"
                  style={{
                    position: "absolute",
                    top: 8, right: 8,
                    width: 26, height: 26, borderRadius: 999,
                    background: "rgba(26, 21, 18, 0.7)",
                    border: 0,
                    backdropFilter: "blur(6px)",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="t-portfolio-tile t-add"
          >
            <div className="t-plus">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span>Add work</span>
          </button>
        </div>
      )}

      <div style={{ height: 28 }} />

      {/* Add form as bottom sheet */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26, 21, 18, 0.4)",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={resetForm}
        >
          <div
            style={{
              background: "var(--ivory)",
              width: "100%",
              maxWidth: 480,
              borderRadius: "26px 26px 0 0",
              padding: "16px 20px 34px",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 44, height: 4, borderRadius: 99,
                background: "var(--line-2)",
                margin: "0 auto 18px",
              }}
            />
            <h3 className="t-serif" style={{ fontSize: 22, fontWeight: 500, margin: "0 0 16px" }}>
              Add a sample
            </h3>

            {/* Photo */}
            <div className="t-field" style={{ marginBottom: 14 }}>
              <label>Photo</label>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                style={{
                  width: "100%",
                  border: "1.5px dashed var(--line-2)",
                  borderRadius: 14,
                  background: "var(--paper)",
                  padding: photoPreview ? 0 : "20px",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "var(--ink-3)" }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Tap to add photo</div>
                    <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>
                      Good lighting, neutral background
                    </div>
                  </div>
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoPick}
              />
              {photoError && (
                <div style={{ fontSize: 12, color: "var(--urgent)", marginTop: 4 }}>
                  {photoError}
                </div>
              )}
            </div>

            <div className="t-field" style={{ marginBottom: 12 }}>
              <label>Label</label>
              <input
                className="t-input"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. Bridal blouse"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              <div className="t-field">
                <label>Occasion</label>
                <input
                  className="t-input"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="Wedding"
                />
              </div>
              <div className="t-field">
                <label>Style</label>
                <input
                  className="t-input"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="Traditional"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="t-btn t-btn-ghost"
                style={{ flex: 1 }}
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                type="button"
                className="t-btn t-btn-primary"
                style={{ flex: 2 }}
                onClick={handleAdd}
                disabled={loading || !tag.trim()}
              >
                {loading ? "Adding…" : "Add to portfolio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
