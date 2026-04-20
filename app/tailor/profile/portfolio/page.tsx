"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Btn, PageLoading } from "@/components/ui/wearify-ui";
import { useUploadFile } from "@/lib/useUpload";
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
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { upload } = useUploadFile();

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch {
      // ignore
    }
  }, []);

  const portfolio = useQuery(
    api.tailorOps.getPortfolio,
    tailorId ? { tailorId } : "skip"
  );

  const addItem = useMutation(api.tailorOps.addPortfolioItem);
  const removeItem = useMutation(api.tailorOps.removePortfolioItem);

  if (!tailorId || portfolio === undefined) {
    return <PageLoading />;
  }

  function handlePhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  function resetForm() {
    setTag(""); setOccasion(""); setStyle("");
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null); setPhotoPreview(null);
    setShowForm(false);
  }

  async function handleAdd() {
    if (!tag.trim()) return;
    setLoading(true);
    try {
      // Upload the photo (if any) first so the mutation either gets a real
      // fileId or falls back to a gradient placeholder when the tailor
      // hasn't picked an image.
      const imageFileId = photo ? await upload(photo) : undefined;
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
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: Id<"tailorPortfolio">) {
    try {
      await removeItem({ id });
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/tailor/profile")}
          className="p-1 rounded-lg hover:bg-wf-card transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wf-text">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-wf-text">Portfolio</h1>
        <Btn small primary className="ml-auto" onClick={() => setShowForm(true)}>
          + Add Work
        </Btn>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-wf-card rounded-lg p-4 border border-wf-border space-y-3">
          <div className="text-sm font-semibold text-wf-text">Add Portfolio Item</div>

          {/* Photo picker — tap to select from device. If not provided, the
              card falls back to a gradient placeholder to keep parity with
              older entries. */}
          <div>
            <label className="block text-xs text-wf-subtext mb-1">Photo</label>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full border border-dashed border-wf-border rounded-lg p-3 bg-white cursor-pointer hover:bg-wf-card/50 transition-colors"
            >
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded" />
              ) : (
                <div className="text-center py-4">
                  <div className="text-xs text-wf-muted">Tap to add a photo (optional)</div>
                  <div className="text-[10px] text-wf-muted mt-1">Good lighting, neutral background works best</div>
                </div>
              )}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoPick}
            />
          </div>

          <div>
            <label className="block text-xs text-wf-subtext mb-1">Tag / Label *</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. Bridal Blouse"
              className="w-full px-3 py-2 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-wf-subtext mb-1">Occasion</label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Wedding"
                className="w-full px-3 py-2 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
              />
            </div>
            <div>
              <label className="block text-xs text-wf-subtext mb-1">Style</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g. Traditional"
                className="w-full px-3 py-2 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Btn small onClick={resetForm}>Cancel</Btn>
            <Btn small primary onClick={handleAdd} disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Btn>
          </div>
        </div>
      )}

      {/* Portfolio Grid */}
      {portfolio.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-wf-muted">No portfolio items yet.</p>
          <p className="text-xs text-wf-muted mt-1">Add your best work to showcase to customers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {portfolio.map((item) => {
            const grad = item.grad || ["#E8D5B7", "#C4A882"];
            return (
              <div
                key={item._id}
                className="rounded-lg overflow-hidden border border-wf-border relative group"
              >
                <div
                  className="h-32 flex items-end p-3 relative"
                  style={{
                    background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                  }}
                >
                  {/* Real photo overlays the gradient when one is uploaded.
                      ConvexImage renders nothing while loading, so the
                      gradient provides a clean fallback. */}
                  {item.imageFileId && (
                    <ConvexImage
                      fileId={item.imageFileId}
                      alt={item.tag || "Portfolio item"}
                      className="absolute inset-0 w-full h-full"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  <div className="relative z-10">
                    {item.tag && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white bg-black/30 backdrop-blur-sm mb-1">
                        {item.tag}
                      </span>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {item.occasion && (
                        <span className="text-[9px] text-white/80">{item.occasion}</span>
                      )}
                      {item.style && (
                        <span className="text-[9px] text-white/80">&middot; {item.style}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
