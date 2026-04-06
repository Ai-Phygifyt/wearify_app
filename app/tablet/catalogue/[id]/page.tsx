"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge, Btn, PageLoading } from "@/components/ui/wearify-ui";
import { Id } from "@/convex/_generated/dataModel";

export default function SareeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sareeId = params.id as Id<"sarees">;

  const addToShortlist = useMutation(api.sessionOps.addToShortlist);
  const markSentToMirror = useMutation(api.sessionOps.markSentToMirror);
  const incrementViews = useMutation(api.sarees.incrementViews);

  const [storeId, setStoreId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [addedToShortlist, setAddedToShortlist] = useState(false);
  const [sentToMirror, setSentToMirror] = useState(false);

  useEffect(() => {
    const storeRaw = localStorage.getItem("wearify_tablet_store");
    const sessRaw = localStorage.getItem("wearify_tablet_session");
    if (storeRaw) try { setStoreId(JSON.parse(storeRaw).storeId); } catch { /* ignore */ }
    if (sessRaw) try { setSessionId(JSON.parse(sessRaw).sessionId); } catch { /* ignore */ }
  }, []);

  // Fetch saree details
  const saree = useQuery(api.sarees.getById, sareeId ? { id: sareeId } : "skip");

  // Fetch shortlist to check if already added
  const shortlistItems = useQuery(
    api.sessionOps.getShortlist,
    sessionId ? { sessionId } : "skip"
  );

  // Check if saree is in shortlist
  useEffect(() => {
    if (shortlistItems && sareeId) {
      const item = shortlistItems.find((i) => i.sareeId === sareeId);
      if (item) {
        setAddedToShortlist(true);
        if (item.sentToMirror) setSentToMirror(true);
      }
    }
  }, [shortlistItems, sareeId]);

  // Increment views on mount
  useEffect(() => {
    if (sareeId) {
      incrementViews({ id: sareeId }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sareeId]);

  const handleAddToShortlist = async () => {
    if (!sessionId || !storeId || addedToShortlist) return;
    try {
      await addToShortlist({ sessionId, sareeId, storeId });
      setAddedToShortlist(true);
    } catch { /* ignore */ }
  };

  const handleSendToMirror = async () => {
    if (!sessionId || !storeId) return;
    try {
      // Add to shortlist if not already
      if (!addedToShortlist) {
        await addToShortlist({ sessionId, sareeId, storeId });
        setAddedToShortlist(true);
      }
      // Mark as sent to mirror
      const item = shortlistItems?.find((i) => i.sareeId === sareeId);
      if (item) {
        await markSentToMirror({ shortlistId: item._id });
      }
      setSentToMirror(true);
    } catch { /* ignore */ }
  };

  if (!saree) {
    return (
      <div className="h-full p-6">
        <PageLoading />
      </div>
    );
  }

  const grad = saree.grad || ["#E8E0D4", "#D4A843"];

  return (
    <div className="h-full overflow-auto">
      {/* Top bar */}
      <div className="sticky top-0 bg-wf-bg/95 backdrop-blur-sm border-b border-wf-border px-6 py-3 flex items-center justify-between z-10">
        <button
          onClick={() => router.back()}
          className="text-sm font-semibold text-wf-primary cursor-pointer hover:underline"
        >
          Back to Catalogue
        </button>
        <div className="flex gap-2">
          <Btn small onClick={handleAddToShortlist} disabled={addedToShortlist}>
            {addedToShortlist ? "In Shortlist" : "Add to Shortlist"}
          </Btn>
          <Btn primary small onClick={handleSendToMirror} disabled={sentToMirror}>
            {sentToMirror ? "Sent to Mirror" : "Send to Mirror"}
          </Btn>
        </div>
      </div>

      <div className="flex gap-6 p-6">
        {/* Left: Image/gradient placeholder */}
        <div className="w-1/3 flex-shrink-0">
          <div
            className="w-full aspect-[3/4] rounded-xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
            }}
          >
            {saree.emoji && (
              <span className="absolute top-4 left-4 text-5xl">{saree.emoji}</span>
            )}
            {saree.tag && (
              <div className="absolute top-4 right-4">
                <Badge status={saree.tag === "Premium" ? "active" : "pending"}>
                  {saree.tag}
                </Badge>
              </div>
            )}

            {/* Stock status */}
            <div className="absolute bottom-4 left-4">
              <Badge
                status={
                  saree.status === "active"
                    ? "active"
                    : saree.status === "low_stock"
                      ? "pending"
                      : "offline"
                }
              >
                {saree.status === "active"
                  ? `In Stock (${saree.stock})`
                  : saree.status === "low_stock"
                    ? `Low Stock (${saree.stock})`
                    : "Out of Stock"}
              </Badge>
            </div>
          </div>

          {/* Color swatches */}
          {saree.colors && saree.colors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-wf-subtext mb-2">Colors</h4>
              <div className="flex gap-2">
                {saree.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-wf-border"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              {saree.colorName && (
                <p className="text-xs text-wf-muted mt-1">{saree.colorName}</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-wf-text mb-1">
            {saree.name}
          </h1>
          <p className="text-sm text-wf-subtext mb-4">
            {saree.type} &middot; {saree.fabric} &middot; {saree.occasion}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-extrabold text-wf-text font-mono">
              {"\u20B9"}{saree.price.toLocaleString("en-IN")}
            </span>
            {saree.mrp && saree.mrp > saree.price && (
              <>
                <span className="text-base text-wf-muted line-through font-mono">
                  {"\u20B9"}{saree.mrp.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-semibold text-wf-green">
                  {Math.round(((saree.mrp - saree.price) / saree.mrp) * 100)}% off
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {saree.description && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-wf-text mb-1">Description</h3>
              <p className="text-sm text-wf-subtext leading-relaxed">{saree.description}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {saree.region && (
              <div className="bg-wf-bg rounded-lg px-4 py-3">
                <div className="text-xs text-wf-muted">Region</div>
                <div className="text-sm font-semibold text-wf-text">{saree.region}</div>
              </div>
            )}
            {saree.weave && (
              <div className="bg-wf-bg rounded-lg px-4 py-3">
                <div className="text-xs text-wf-muted">Weave</div>
                <div className="text-sm font-semibold text-wf-text">{saree.weave}</div>
              </div>
            )}
            {saree.weight && (
              <div className="bg-wf-bg rounded-lg px-4 py-3">
                <div className="text-xs text-wf-muted">Weight</div>
                <div className="text-sm font-semibold text-wf-text">{saree.weight}</div>
              </div>
            )}
            <div className="bg-wf-bg rounded-lg px-4 py-3">
              <div className="text-xs text-wf-muted">Fabric</div>
              <div className="text-sm font-semibold text-wf-text">{saree.fabric}</div>
            </div>
          </div>

          {/* Draping styles */}
          {saree.drapingStyles && saree.drapingStyles.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-wf-text mb-2">Draping Styles</h3>
              <div className="flex flex-wrap gap-2">
                {saree.drapingStyles.map((style, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-wf-bg border border-wf-border text-xs font-semibold text-wf-subtext"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Care instructions */}
          {saree.careInstructions && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-wf-text mb-1">Care Instructions</h3>
              <p className="text-xs text-wf-subtext leading-relaxed">
                {saree.careInstructions}
              </p>
            </div>
          )}

          {/* Social proof */}
          {saree.tryOns !== undefined && saree.tryOns > 0 && (
            <div className="bg-wf-primary/5 rounded-lg px-4 py-3 mt-4">
              <p className="text-sm text-wf-primary font-semibold">
                {saree.tryOns} {saree.tryOns === 1 ? "woman" : "women"} tried this month
              </p>
            </div>
          )}

          {/* AI tags */}
          {saree.aiTags && saree.aiTags.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-wf-muted mb-1">AI Tags</h4>
              <div className="flex flex-wrap gap-1">
                {saree.aiTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-wf-primary/10 text-wf-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom actions (sticky on right side) */}
          <div className="flex gap-3 mt-8 pt-4 border-t border-wf-border">
            <Btn onClick={handleAddToShortlist} disabled={addedToShortlist} className="flex-1">
              {addedToShortlist ? "Already in Shortlist" : "Add to Shortlist"}
            </Btn>
            <Btn primary onClick={handleSendToMirror} disabled={sentToMirror} className="flex-1">
              {sentToMirror ? "Sent to Mirror" : "Send to Mirror"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
