"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { Shirt, ShoppingBag, ShoppingCart, LogOut } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function AIProcessingScreen({
  onDone,
  storeName = "",
  storeLogoFileId,
  trialCount = 0,
  wardrobeCount = 0,
  cartCount = 0,
}: {
  onDone: () => void;
  storeName?: string;
  storeLogoFileId?: Id<"_storage">;
  trialCount?: number;
  wardrobeCount?: number;
  cartCount?: number;
}) {
  const TOTAL_SECONDS = 6;
  const [cd, setCd] = useState(TOTAL_SECONDS);

  const logoUrl = useQuery(api.files.getUrl, storeLogoFileId ? { fileId: storeLogoFileId } : "skip");
  const initial = (storeName || "S").trim().charAt(0).toUpperCase() || "S";

  useEffect(() => {
    if (cd <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setCd((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [cd, onDone]);

  const prog = ((TOTAL_SECONDS - cd) / TOTAL_SECONDS) * 100;

  return (
    <div className="k-shell k-ai-shell">
      <div className="k-ai-topbar">
        <div className="k-ai-topbar-left">
          <div className="k-ai-topbar-logo">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={storeName} />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="k-ai-topbar-title">{storeName}</div>
        </div>
        <div className="k-ai-topbar-icons">
          <button className="k-ai-topbar-icon" aria-label="Wardrobe">
            <ShoppingBag size={20} color="var(--k-maroon)" strokeWidth={2.25} />
            {wardrobeCount > 0 && <span className="k-ai-topbar-badge">{wardrobeCount}</span>}
          </button>
          <button className="k-ai-topbar-icon" aria-label="Trial room">
            <Shirt size={20} color="var(--k-maroon)" strokeWidth={2.25} />
            {trialCount > 0 && <span className="k-ai-topbar-badge">{trialCount}</span>}
          </button>
          <button className="k-ai-topbar-icon" aria-label="Cart">
            <ShoppingCart size={20} color="var(--k-maroon)" strokeWidth={2.25} />
            {cartCount > 0 && <span className="k-ai-topbar-badge">{cartCount}</span>}
          </button>
          <button className="k-ai-topbar-icon" aria-label="Logout">
            <LogOut size={20} color="var(--k-maroon)" strokeWidth={2.25} />
          </button>
        </div>
      </div>

      <div className="k-ai-stage">
        <div className="k-ai-skeleton">
          <div className="k-ai-skel-search" />
          <div className="k-ai-skel-section-head">
            <div className="k-ai-skel-bar k-ai-skel-bar-title" />
            <div className="k-ai-skel-arrows">
              <div className="k-ai-skel-circle" />
              <div className="k-ai-skel-circle" />
            </div>
          </div>
          <div className="k-ai-skel-row">
            <div className="k-ai-skel-card" />
            <div className="k-ai-skel-card" />
            <div className="k-ai-skel-card" />
            <div className="k-ai-skel-card" />
          </div>
          <div className="k-ai-skel-section-head">
            <div className="k-ai-skel-bar k-ai-skel-bar-title" />
            <div className="k-ai-skel-arrows">
              <div className="k-ai-skel-circle" />
              <div className="k-ai-skel-circle" />
            </div>
          </div>
          <div className="k-ai-skel-row">
            <div className="k-ai-skel-trend" />
            <div className="k-ai-skel-trend" />
            <div className="k-ai-skel-trend" />
          </div>
          <div className="k-ai-skel-section-head">
            <div className="k-ai-skel-bar k-ai-skel-bar-title" />
            <div className="k-ai-skel-arrows">
              <div className="k-ai-skel-circle" />
              <div className="k-ai-skel-circle" />
            </div>
          </div>
          <div className="k-ai-skel-row">
            <div className="k-ai-skel-card" />
            <div className="k-ai-skel-card" />
            <div className="k-ai-skel-card" />
            <div className="k-ai-skel-card" />
          </div>
        </div>

        <div className="k-ai-wash" />

        <div className="k-ai-center">
          <h2 className="k-ai-title">Creating your look</h2>
          <p className="k-ai-subtitle">Our AI istailoring it just for you</p>
          <div className="k-ai-bar">
            <div className="k-ai-bar-fill" style={{ width: `${prog}%` }} />
          </div>
          <div className="k-ai-countdown">{cd}s</div>
        </div>
      </div>
    </div>
  );
}
