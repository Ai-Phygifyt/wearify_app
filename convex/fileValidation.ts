import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Server-side file validation. Mirrored client-side in lib/uploadGuards.ts —
 * keep the two in sync. Client is fast-fail UX; server is the actual
 * security boundary. Convex-facing mutations that accept an `Id<"_storage">`
 * from the client MUST call assertFile before writing the id to any table
 * or acting on the file, otherwise a malicious client can bypass the
 * client-side check and store oversized or wrong-typed blobs.
 */

export type FileGuard = {
  maxBytes: number;
  /** MIME prefixes (ending in "/") or exact types. */
  accept: readonly string[];
  label: string;
};

const MB = 1024 * 1024;

export const GUARDS = {
  sareePhoto:     { maxBytes: 5 * MB,  accept: ["image/"] as const,                        label: "Saree photo" },
  portfolioPhoto: { maxBytes: 5 * MB,  accept: ["image/"] as const,                        label: "Portfolio photo" },
  storeLogo:      { maxBytes: 2 * MB,  accept: ["image/"] as const,                        label: "Store logo" },
  customerPhoto:  { maxBytes: 4 * MB,  accept: ["image/"] as const,                        label: "Profile photo" },
  kycDocument:    { maxBytes: 10 * MB, accept: ["image/", "application/pdf"] as const,     label: "KYC document" },
  bodyScan:       { maxBytes: 10 * MB, accept: ["image/"] as const,                        label: "Body scan photo" },
  lookCutout:     { maxBytes: 5 * MB,  accept: ["image/png"] as const,                     label: "Cutout image" },
} as const;

type FileMetadata = {
  _id: Id<"_storage">;
  _creationTime: number;
  contentType?: string;
  sha256: string;
  size: number;
};

export async function assertFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"_storage">,
  guard: FileGuard,
): Promise<void> {
  // Per convex/_generated/ai/guidelines.md §"File storage": use
  // ctx.db.system.get with the explicit table arg rather than the
  // deprecated ctx.storage.getMetadata.
  const meta = (await ctx.db.system.get(fileId)) as unknown as FileMetadata | null;
  if (!meta) throw new Error(`${guard.label} not found`);
  if (meta.size > guard.maxBytes) {
    const mb = (guard.maxBytes / MB).toFixed(1);
    throw new Error(`${guard.label} exceeds ${mb} MB limit`);
  }
  const ct = meta.contentType ?? "";
  const ok = guard.accept.some((t) =>
    t.endsWith("/") ? ct.startsWith(t) : ct === t,
  );
  if (!ok) {
    const human = guard.accept
      .map((t) => (t === "image/" ? "image" : t === "application/pdf" ? "PDF" : t))
      .join(" or ");
    throw new Error(`${guard.label} must be ${human}`);
  }
}

/** Shortcut for mutations that accept an array of fileIds (e.g. sarees). */
export async function assertFiles(
  ctx: QueryCtx | MutationCtx,
  fileIds: Id<"_storage">[],
  guard: FileGuard,
): Promise<void> {
  await Promise.all(fileIds.map((id) => assertFile(ctx, id, guard)));
}
