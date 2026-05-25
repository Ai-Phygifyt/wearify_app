"use client";

// =========================================================================
// useBodyPose — in-browser pose detection for the kiosk body-scan screen.
//
// What it does
// ------------
// Wraps MediaPipe Tasks Vision' PoseLandmarker. Loads the WASM runtime
// + a single landmarker model (pose_landmarker_lite, ~5MB) lazily from
// Google's CDN — no static asset shipping required.
//
// Once loaded, it runs detectForVideo() inside a requestAnimationFrame
// loop, and exposes the most recent set of 33 normalized body landmarks
// (each {x,y} in 0..1, relative to the rendered video frame).
//
// Caller passes a ref to a <video> element. The hook only runs the
// detection loop while `enabled` is true and the video has dimensions —
// safe to call before the camera stream is attached.
//
// The hook is fail-soft: any error during model load, runtime init, or
// per-frame detect resolves into `ready=false` + `error` (string). The
// caller can fall back to manual capture in that case.
// =========================================================================

import { useEffect, useRef, useState } from "react";
import type { PoseLandmarker, PoseLandmarkerResult } from "@mediapipe/tasks-vision";

// Body landmark indices we care about, mirrored from MediaPipe's pose model.
// We use these to decide whether the visible person is "inside" the guide
// silhouette. Anything not listed here (eye/ear/finger detail) is ignored
// for fit-checking — head/shoulders/hips/knees/ankles are enough to know
// the person is properly framed.
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export type PoseLandmark = { x: number; y: number; z?: number; visibility?: number };

export type BodyPoseState = {
  /** True once the model + runtime are loaded and detection is running. */
  ready: boolean;
  /** Latest 33 normalized landmarks (x,y in 0..1 of the video frame). Null until first detect. */
  landmarks: PoseLandmark[] | null;
  /** Latest error string, if model load or per-frame detect failed. Null otherwise. */
  error: string | null;
};

// Hosted assets — these are the exact paths the MediaPipe team publishes
// alongside the package. Pinning to the package version keeps WASM and
// the JS bindings on the same build. The model file URL is stable.
const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export function useBodyPose(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  opts: { enabled?: boolean } = {},
): BodyPoseState {
  const { enabled = true } = opts;

  const [ready, setReady] = useState(false);
  const [landmarks, setLandmarks] = useState<PoseLandmark[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs (not state) for things that shouldn't trigger re-renders.
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    (async () => {
      try {
        // Dynamic import — keeps MediaPipe out of the main bundle for
        // every non-scan page. The dynamic import resolves to ~30KB JS
        // (the runtime loads ~3MB of WASM + ~5MB of model weights on
        // first call below).
        const { FilesetResolver, PoseLandmarker: PL } = await import(
          "@mediapipe/tasks-vision"
        );

        const filesetResolver = await FilesetResolver.forVisionTasks(WASM_BASE);
        if (cancelled) return;

        const landmarker = await PL.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            // GPU delegate is faster but falls back to CPU if WebGL is
            // unavailable (e.g. inside an Android WebView with GPU
            // acceleration disabled). MediaPipe handles the fallback.
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setReady(true);
        startDetectLoop();
      } catch (e) {
        if (cancelled) return;
        // Surface as a string so the caller can show a friendly message.
        // Most common failure: model fetch blocked offline.
        setError(e instanceof Error ? e.message : String(e));
      }
    })();

    function startDetectLoop() {
      const tick = () => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (!video || !landmarker) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        // detectForVideo wants a monotonically-increasing timestamp.
        // performance.now() gives us that without coupling to wall
        // clock; the underlying tracker uses deltas for smoothing.
        const ts = performance.now();
        // Don't detect on the same frame twice (some browsers fire
        // rAF faster than the video can advance) — MediaPipe will
        // refuse identical timestamps.
        const isReady = video.readyState >= 2 && video.videoWidth > 0;
        if (isReady && ts > lastTsRef.current) {
          lastTsRef.current = ts;
          try {
            const result: PoseLandmarkerResult = landmarker.detectForVideo(
              video,
              ts,
            );
            // landmarks is a list of pose results (one per person we asked
            // to track — numPoses:1, so we take the first). Each pose is
            // an array of 33 {x,y,z,visibility} normalized to the
            // video's pixel dimensions.
            const pose = result.landmarks?.[0] ?? null;
            setLandmarks(pose);
          } catch (e) {
            // Don't blow up the loop on a transient detect error —
            // surface it once and keep going so the next frame can
            // recover.
            setError(e instanceof Error ? e.message : String(e));
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
      setReady(false);
      setLandmarks(null);
    };
  }, [enabled, videoRef]);

  return { ready, landmarks, error };
}

// =========================================================================
// fits — small helper for asking "are these landmarks within this rect?".
//
// The rect is expressed in the same normalized 0..1 space as the
// landmarks, which means a caller can compute it once from the
// silhouette guide's CSS percentages and reuse it across frames.
//
// Only landmarks with visibility >= 0.5 are checked — invisible joints
// (out of frame, occluded) shouldn't fail the fit test, otherwise a
// person facing the camera with one hand behind them would always
// register as "out of frame".
// =========================================================================
export function landmarksFitInRect(
  landmarks: PoseLandmark[] | null,
  rect: { x: number; y: number; w: number; h: number },
  indices: readonly number[],
): boolean {
  if (!landmarks) return false;
  for (const idx of indices) {
    const p = landmarks[idx];
    if (!p) return false;
    if (p.visibility !== undefined && p.visibility < 0.5) continue;
    if (p.x < rect.x || p.x > rect.x + rect.w) return false;
    if (p.y < rect.y || p.y > rect.y + rect.h) return false;
  }
  return true;
}
