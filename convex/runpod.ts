// convex/runpod.ts
//
// Pure RunPod / ComfyUI helpers. No Convex DB access; no _generated imports.
// Used by convex/tryOn.ts. Action-runtime only (uses fetch).
//
// See docs/superpowers/specs/2026-05-03-kiosk-runpod-tryon-design.md §"ComfyUI workflow port"

// =====================================================================
// Types
// =====================================================================

export type RunPodJobStatus =
  | "IN_QUEUE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMED_OUT";

export type RunPodStatusResponse = {
  id: string;
  status: RunPodJobStatus;
  output?: {
    images?: Array<
      | string
      | { base64?: string; data?: string; url?: string }
    >;
  };
  error?: string;
};

export type RunPodRunPayload = {
  input: {
    workflow: Record<string, unknown>;
  };
};

// =====================================================================
// Base64 helpers (ported from comfyui_next/app/api/run/route.ts:11-18)
// =====================================================================

export function fixBase64Padding(base64: string): string {
  const pure = base64.replace(/^data:image\/[a-z]+;base64,/, "");
  const pad = pure.length % 4;
  if (pad > 0) return pure + "=".repeat(4 - pad);
  return pure;
}

// Convert a Blob (from ctx.storage.get) to a base64 string.
// btoa() doesn't accept arbitrary bytes directly — chunk through binary string.
export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  // Process in chunks to avoid call-stack issues on large images.
  const CHUNK = 0x8000;
  for (let i = 0; i < buf.length; i += CHUNK) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(buf.subarray(i, i + CHUNK)),
    );
  }
  // btoa is available in the Convex action runtime.
  return btoa(bin);
}

export function base64ToBytes(base64: string): Uint8Array {
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
