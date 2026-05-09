"use client";

// =====================================================================
// bgRemovalQueue — sequential FIFO background-removal pipeline for the
// kiosk trial room. One job at a time:
//
//   fetch(srcUrl) → blob → removeBackground(blob) → upload PNG →
//   attachBgRemovedImage mutation → mark done.
//
// Why sequential: @imgly/background-removal is single-threaded WASM
// (~150-200 MB resident model). Running jobs in parallel doesn't speed
// anything up because they share one thread, and stacking model
// instances is what OOMs the tab. A queue keeps memory bounded, the
// model warm, and the UI responsive.
//
// The queue is a module-level singleton keyed nowhere — there is one
// kiosk per tab, so a process-wide queue is the right scope. Subscribe
// via useBgRemovalStatus(lookId) for reactive UI states.
// =====================================================================

import { useSyncExternalStore } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { GUARDS } from "./uploadGuards";

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

export type BgRemovalState =
  | "idle"        // never enqueued or already finished
  | "queued"      // waiting in line
  | "processing" // model currently chewing on this one
  | "done"        // imageNoBgFileId already attached (or just attached)
  | "failed";     // bailed out — UI should fall back

export type BgRemovalStatus = {
  state: BgRemovalState;
  /** 1-indexed position in the pending queue, or 0 if processing/done. */
  position: number;
  /** Total pending jobs (including processing). For copy like "2 of 5". */
  total: number;
  error?: string;
};

type Job = {
  lookId: Id<"looks">;
  sourceImageFileId: Id<"_storage">;
  srcUrl: string;
  deviceToken: string;
  /**
   * Caller-supplied finalize step — runs the Convex mutation. Passed in
   * (rather than imported) so the queue stays decoupled from the React
   * hook layer and easy to test.
   */
  attach: (args: {
    sourceImageFileId: Id<"_storage">;
    fileId: Id<"_storage">;
  }) => Promise<{ patched: boolean; reason?: string }>;
  /**
   * Caller-supplied uploader. Same dependency-injection rationale.
   */
  upload: (file: File) => Promise<Id<"_storage">>;
  /**
   * Caller-supplied orphan cleanup. Called when `attach()` returns
   * { patched: false } so the uploaded PNG doesn't accumulate as dead
   * bytes in Convex Storage. Best-effort — errors are swallowed.
   */
  cleanup?: (fileId: Id<"_storage">) => Promise<void>;
};

type Listener = () => void;

// ---------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------

const pending: Job[] = [];
const states = new Map<string, BgRemovalStatus>();
const listeners = new Set<Listener>();
let running = false;
let removeBgFn: ((input: Blob) => Promise<Blob>) | null = null;

function notify() {
  for (const l of listeners) l();
}

function setStatus(lookId: Id<"looks">, status: BgRemovalStatus) {
  states.set(lookId, status);
  notify();
}

function recomputePositions() {
  // Update positional info for every queued job. O(N) where N is queue
  // length — N is bounded by trial-room cap (max 5 sarees) so it's
  // basically free.
  for (let i = 0; i < pending.length; i++) {
    const job = pending[i];
    states.set(job.lookId, {
      state: "queued",
      position: i + 1,
      total: pending.length + (running ? 1 : 0),
    });
  }
}

// Lazy-load the heavy WASM module on first use. Cached for subsequent
// calls so the model only loads once per tab session.
async function getRemoveBg(): Promise<(input: Blob) => Promise<Blob>> {
  if (removeBgFn) return removeBgFn;
  const mod = await import("@imgly/background-removal");
  removeBgFn = mod.removeBackground;
  return removeBgFn;
}

async function runOne(job: Job): Promise<void> {
  setStatus(job.lookId, { state: "processing", position: 0, total: pending.length + 1 });

  // 1. Fetch the source image as a blob.
  const res = await fetch(job.srcUrl);
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const srcBlob = await res.blob();

  // 2. Run bg-removal — single WASM thread, sequential by construction.
  const removeBackground = await getRemoveBg();
  const cutoutBlob = await removeBackground(srcBlob);

  // 3. Defensive size guard before paying for the upload. The server
  // will reject anyway, but failing here keeps the UX snappy.
  if (cutoutBlob.size > GUARDS.lookCutout.maxBytes) {
    throw new Error(`cutout exceeds ${GUARDS.lookCutout.maxBytes} bytes`);
  }

  // 4. Wrap in a File so the existing useUploadFile guard applies.
  const cutoutFile = new File([cutoutBlob], `look-${job.lookId}-nobg.png`, {
    type: "image/png",
  });
  const fileId = await job.upload(cutoutFile);

  // 5. Patch the looks row. If the mutation rejects (stale_source,
  // already_set, no_source), the uploaded PNG is now an orphan in
  // Convex Storage — best-effort cleanup keeps the storage tidy. We
  // also throw so the caller flips state to "failed" rather than "done"
  // (TrialTile's fallback path keys on bgStatus.state === "failed").
  const result = await job.attach({ sourceImageFileId: job.sourceImageFileId, fileId });
  if (!result.patched) {
    if (job.cleanup) {
      job.cleanup(fileId).catch((err) => {
        console.warn("[bgRemovalQueue] orphan cleanup failed", job.lookId, err);
      });
    }
    throw new Error(`attach rejected: ${result.reason ?? "unknown"}`);
  }
}

async function pump(): Promise<void> {
  if (running) return;
  running = true;
  while (pending.length > 0) {
    const job = pending.shift()!;
    recomputePositions();
    try {
      await runOne(job);
      setStatus(job.lookId, { state: "done", position: 0, total: pending.length });
    } catch (err) {
      // Silent fall-through: log so dev can see, but the UI just falls
      // back to imageFileId. No retry — re-mounting TrialTile re-tries.
      console.warn("[bgRemovalQueue]", job.lookId, err);
      setStatus(job.lookId, {
        state: "failed",
        position: 0,
        total: pending.length,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    recomputePositions();
  }
  running = false;
  notify();
}

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

/**
 * Enqueue a bg-removal job. Idempotent: re-enqueueing the same lookId
 * while it's already queued/processing is a no-op (state is preserved).
 * If a previous attempt failed, re-enqueue retries.
 */
export function enqueueBgRemoval(job: Job): void {
  const existing = states.get(job.lookId);
  if (existing && (existing.state === "queued" || existing.state === "processing")) {
    return;
  }
  if (existing && existing.state === "done") {
    return;
  }
  pending.push(job);
  setStatus(job.lookId, {
    state: "queued",
    position: pending.length,
    total: pending.length + (running ? 1 : 0),
  });
  recomputePositions();
  // Fire-and-forget; pump() guards against re-entry.
  void pump();
}

/**
 * Drop a queued job before it starts. No-op if already processing or
 * finished. Useful when a customer removes a saree from the trial room
 * — its cutout is no longer needed.
 */
export function cancelBgRemoval(lookId: Id<"looks">): void {
  const idx = pending.findIndex((j) => j.lookId === lookId);
  if (idx >= 0) {
    pending.splice(idx, 1);
    states.delete(lookId);
    recomputePositions();
    notify();
  }
}

/**
 * Reset the queue's per-customer state. Call from kiosk logout
 * (handleWipe) so a long-running tab serving multiple customers
 * doesn't accumulate stale `done` entries indefinitely. The model
 * itself (removeBgFn) is intentionally NOT reset — it stays warm
 * across customers. Any in-flight `pending` job for the previous
 * customer is dropped; the in-progress one (if any) finishes naturally
 * and its result lands on the now-orphaned looks row (harmless — the
 * trial room of a logged-out customer is gone).
 */
export function clearBgRemovalState(): void {
  pending.length = 0;
  states.clear();
  notify();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Cached idle snapshot — useSyncExternalStore requires getSnapshot to
// return referentially stable results when nothing has changed. Returning
// a fresh object every call would loop infinitely.
const IDLE_SNAPSHOT: BgRemovalStatus = { state: "idle", position: 0, total: 0 };

function getSnapshot(lookId: Id<"looks"> | undefined | null): BgRemovalStatus {
  if (!lookId) return IDLE_SNAPSHOT;
  return states.get(lookId) ?? IDLE_SNAPSHOT;
}

/**
 * React hook — re-renders whenever the queue advances. Backed by
 * useSyncExternalStore so the subscription is wired up before paint
 * (no setState-in-effect lint warning).
 */
export function useBgRemovalStatus(
  lookId: Id<"looks"> | undefined | null,
): BgRemovalStatus {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(lookId),
    // SSR / initial-paint: there's no kiosk on the server, but Next still
    // calls getServerSnapshot during hydration — return the idle snapshot.
    () => IDLE_SNAPSHOT,
  );
}
