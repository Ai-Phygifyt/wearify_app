"use client";

import React, { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { SareeThumb } from "./SareeThumb";

type Props = {
  name: string;
  imageIds?: Id<"_storage">[];
  grad?: string[];
  emoji?: string;
  emojiSize?: number;
  gradientAngle?: number;
  className?: string;
  style?: React.CSSProperties;
};

// Min horizontal swipe distance before we treat it as a slide intent.
const SWIPE_MIN_PX = 40;

// Multi-image gallery for product detail surfaces (tablet [id] + kiosk
// ProductDetailScreen). Falls through to a single SareeThumb when there
// are 0 or 1 imageIds — no arrows, no dots, no swipe handlers attached.
// Arrows disable at the ends (no wraparound) so the affordance stays clear.
export function SareeImageGallery({
  name,
  imageIds,
  grad,
  emoji,
  emojiSize = 72,
  gradientAngle = 135,
  className,
  style,
}: Props) {
  const ids = imageIds ?? [];
  const total = ids.length;
  const [index, setIndex] = useState(0);

  // Defensive clamp — if a saree's imageIds list shrinks while the user is
  // viewing it (rare, but possible if admin deletes), don't crash.
  const safeIndex = total === 0 ? 0 : Math.min(Math.max(index, 0), total - 1);
  const currentId = total > 0 ? ids[safeIndex] : undefined;

  const touchStartX = useRef<number | null>(null);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);
  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, Math.max(total - 1, 0)));
  }, [total]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (dx > SWIPE_MIN_PX) goPrev();
    else if (dx < -SWIPE_MIN_PX) goNext();
  };

  const showControls = total > 1;
  const atStart = safeIndex === 0;
  const atEnd = safeIndex === total - 1;

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...style }}
      onTouchStart={showControls ? onTouchStart : undefined}
      onTouchEnd={showControls ? onTouchEnd : undefined}
    >
      <SareeThumb
        name={name}
        fileId={currentId ?? null}
        grad={grad}
        emoji={emoji}
        emojiSize={emojiSize}
        gradientAngle={gradientAngle}
      />

      {showControls && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            disabled={atStart}
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            style={arrowStyle({ side: "left", disabled: atStart })}
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>

          <button
            type="button"
            aria-label="Next image"
            disabled={atEnd}
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            style={arrowStyle({ side: "right", disabled: atEnd })}
          >
            <ChevronRight size={22} strokeWidth={2.4} />
          </button>

          <div style={dotsContainerStyle}>
            {ids.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === safeIndex ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === safeIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                  transition: "width 0.25s ease, background 0.25s ease",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function arrowStyle({ side, disabled }: { side: "left" | "right"; disabled: boolean }): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: 12,
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: disabled ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.55)",
    color: "#fff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "background 0.18s ease, opacity 0.18s ease",
    zIndex: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    padding: 0,
  };
}

const dotsContainerStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 14,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 20,
  background: "rgba(0,0,0,0.4)",
  zIndex: 10,
};
