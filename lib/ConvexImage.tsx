"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Renders an image from Convex storage.
 * Shows a placeholder while loading or if no fileId provided.
 */
export function ConvexImage({
  fileId,
  alt,
  style,
  className,
  placeholder,
}: {
  fileId?: Id<"_storage"> | null;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: React.ReactNode;
}) {
  const url = useQuery(
    api.files.getUrl,
    fileId ? { fileId } : "skip"
  );

  if (!fileId || url === undefined) {
    return <>{placeholder || null}</>;
  }

  if (url === null) {
    return <>{placeholder || null}</>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt || "Image"}
      style={{ objectFit: "cover", ...style }}
      className={className}
    />
  );
}

/**
 * Hook to get a single Convex storage URL.
 */
export function useConvexUrl(fileId?: Id<"_storage"> | null): string | null {
  const url = useQuery(
    api.files.getUrl,
    fileId ? { fileId } : "skip"
  );
  return url ?? null;
}
