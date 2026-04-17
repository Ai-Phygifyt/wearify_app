"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Local-asset fallback for seeded sarees (served from /public/inventory).
// Keyed by exact saree.name. Seeded sarees were shipped with repo-local images
// before Convex Storage uploads existed, so they don't have imageIds.
export const SAREE_IMAGE: Record<string, string> = {
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

type SareeThumbProps = {
  name: string;
  fileId?: Id<"_storage"> | null;
  grad?: string[];
  emoji?: string;
  emojiSize?: number;
  gradientAngle?: number;
  className?: string;
  style?: React.CSSProperties;
};

// Three-tier fallback: local seeded image → Convex Storage URL → gradient placeholder.
// Fills its parent — size the wrapper, not this component. Emoji overlay only
// appears on the gradient fallback; images don't need decoration.
export function SareeThumb({
  name,
  fileId,
  grad,
  emoji,
  emojiSize = 32,
  gradientAngle = 145,
  className,
  style,
}: SareeThumbProps) {
  const localSrc = SAREE_IMAGE[name];
  const url = useQuery(api.files.getUrl, !localSrc && fileId ? { fileId } : "skip");
  const baseStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", ...style };

  if (localSrc) {
    return <img src={localSrc} alt={name} className={className} style={baseStyle} />;
  }
  if (url) {
    return <img src={url} alt={name} className={className} style={baseStyle} />;
  }

  const g = grad && grad.length ? grad : ["#E8E0D4", "#D4A843"];
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(${gradientAngle}deg, ${g[0]}, ${g[1] || g[0]})`,
        position: "relative",
        display: emoji ? "flex" : undefined,
        alignItems: emoji ? "center" : undefined,
        justifyContent: emoji ? "center" : undefined,
        ...style,
      }}
    >
      {emoji && <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{emoji}</span>}
    </div>
  );
}
