"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogOut, SwitchCamera } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  POSE_LANDMARKS,
  landmarksFitInRect,
  useBodyPose,
} from "@/lib/useBodyPose";

// =========================================================================
// Fit region — normalized rect inside the video frame (0..1 coords).
// Must be kept in sync with the CSS .k-scan-guide-rect inset values:
//   left: 25% / right: 25% / top: 5% / bottom: 5%
// → x=0.25, w=0.50, y=0.05, h=0.90
//
// Currently used ONLY for the on-screen fit check (does the user's
// body sit inside the green silhouette?). The captured photo is
// uploaded FULL-FRAME, un-mirrored — earlier attempts at cropping it
// to FIT_RECT for "deterministic model size" did not help the trial-
// room layout enough to justify the change, and the loose 5%/5% rect
// is more forgiving for users to actually fit into.
//
// This rect serves two purposes:
//   1. On-screen fit check — does the user's body sit inside the
//      green silhouette? (drives auto-capture trigger)
//   2. The captured photo is cropped to this rect before upload, so
//      every saved scan has the model at the same scale and position
//      in the frame. The trial-room cutout sizing relies on that
//      determinism — see .k-trial-v2-cutout in kiosk-theme.css.
//
// Mirror is intentionally NOT applied — the RunPod Qwen workflow was
// trained on un-mirrored frames, and pose-conditioned generation can
// flip left/right details (drape direction, hand placement) if the
// input orientation is reversed.
// =========================================================================
const FIT_RECT = { x: 0.25, y: 0.05, w: 0.50, h: 0.90 };

// Landmarks that must all lie inside FIT_RECT for the scan to "lock in".
// Head + shoulders + hips + ankles cover full-body framing; knees are
// implicit. Hands/face detail is intentionally ignored — a person with
// hands at their side or by their face should still register as in-frame.
const FIT_LANDMARKS = [
  POSE_LANDMARKS.NOSE,
  POSE_LANDMARKS.LEFT_SHOULDER,
  POSE_LANDMARKS.RIGHT_SHOULDER,
  POSE_LANDMARKS.LEFT_HIP,
  POSE_LANDMARKS.RIGHT_HIP,
  POSE_LANDMARKS.LEFT_ANKLE,
  POSE_LANDMARKS.RIGHT_ANKLE,
] as const;

// How long the user has to stay inside the rect before the auto-fire
// kicks in, then a brief visible countdown so the user can hold still.
const FIT_HOLD_MS = 900;
const AUTO_CAPTURE_COUNTDOWN_SEC = 3;

export function BodyScanScreen({
  storeName,
  storeLogoFileId,
  stream,
  cameraFacing,
  onSwitchCamera,
  onCapture,
  onBack,
  onHome,
  triggerLogout,
}: {
  storeName: string;
  storeLogoFileId?: Id<"_storage">;
  stream: MediaStream | null;
  cameraFacing?: "user" | "environment";
  onSwitchCamera?: () => void;
  onCapture: (blob: Blob) => void;
  onBack: () => void;
  onHome: () => void;
  triggerLogout?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // The screen has two distinct phases:
  //   scanning=false → original splash UI (blurred bg + avatar silhouette
  //                    + "Capture My Look" button). No webcam visible.
  //   scanning=true  → live webcam, green/red fit guide, auto-capture
  //                    once the user holds the pose for FIT_HOLD_MS.
  // The user taps "Capture My Look" to move from splash → scanning.
  const [scanning, setScanning] = useState(false);

  // Pose detection only spins up once the user is actually scanning,
  // so the splash screen doesn't pay the WASM/model download cost.
  const poseEnabled = scanning && !!stream;
  const { ready: poseReady, landmarks, error: poseError } = useBodyPose(
    videoRef,
    { enabled: poseEnabled },
  );

  // "fit" = current frame's landmarks satisfy FIT_RECT for all required points.
  const isFit = useMemo(
    () => landmarksFitInRect(landmarks, FIT_RECT, FIT_LANDMARKS),
    [landmarks],
  );

  // Locked state + auto-capture countdown collapsed into a single
  // transition so the hold-timer effect never has to call setState
  // synchronously in its body.
  const fitSinceRef = useRef<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const lockAndStartCountdown = useCallback(() => {
    setLocked(true);
    setCountdown(AUTO_CAPTURE_COUNTDOWN_SEC);
  }, []);

  // Hold-timer: while isFit is true, schedule the lock for FIT_HOLD_MS
  // out. If the user leaves the rect before then, the cleanup clears
  // the timer and the next fit starts a fresh hold.
  useEffect(() => {
    if (!scanning || locked) return;
    if (!isFit) {
      fitSinceRef.current = null;
      return;
    }
    if (fitSinceRef.current === null) fitSinceRef.current = performance.now();
    const armedAt = fitSinceRef.current;
    const remaining = Math.max(0, FIT_HOLD_MS - (performance.now() - armedAt));
    const t = setTimeout(() => {
      if (fitSinceRef.current === armedAt) lockAndStartCountdown();
    }, remaining);
    return () => clearTimeout(t);
  }, [scanning, isFit, locked, lockAndStartCountdown]);

  // Attach stream to video element when it changes.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream && el.srcObject !== stream) el.srcObject = stream;
    if (!stream && el.srcObject) el.srcObject = null;
  }, [stream]);

  // Countdown driver — when it reaches 0, snap the full video frame.
  // No crop, no mirror — matches the original pre-pose-detection flow.
  // The RunPod Qwen workflow expects the un-altered camera frame.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      const video = videoRef.current;
      if (!video || !video.videoWidth) {
        onCapture(new Blob([], { type: "image/jpeg" }));
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        onCapture(new Blob([], { type: "image/jpeg" }));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => onCapture(blob ?? new Blob([], { type: "image/jpeg" })),
        "image/jpeg",
        0.9,
      );
      return;
    }
    const t = setTimeout(
      () => setCountdown((v) => (v === null ? null : v - 1)),
      1000,
    );
    return () => clearTimeout(t);
  }, [countdown, onCapture]);

  const logoUrl = useQuery(api.files.getUrl, storeLogoFileId ? { fileId: storeLogoFileId } : "skip");
  const initial = (storeName || "S").trim().charAt(0).toUpperCase() || "S";

  // Hint text — only shown during scanning; pre-capture splash has its
  // own subtitle ("Stand inside the frame for a quick scan").
  const hintText = poseError
    ? "Detection unavailable — tap the button below"
    : !poseReady
      ? "Loading body detection…"
      : locked
        ? "Hold still…"
        : isFit
          ? "Almost there…"
          : "Step inside the frame";

  return (
    <div className="k-shell k-scan-shell">
      {/* Top bar — logo + store name on left, logout on right */}
      <div className="k-scan-topbar">
        <div className="k-scan-topbar-left">
          <div className="k-scan-topbar-logo">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={storeName} />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="k-scan-topbar-title">{storeName}</div>
        </div>
        {triggerLogout && (
          <button onClick={triggerLogout} className="k-scan-topbar-icon" aria-label="Logout">
            <LogOut size={22} color="var(--k-maroon)" strokeWidth={2.25} />
          </button>
        )}
      </div>

      {/* Floating back / home circles */}
      <div className="k-scan-actions">
        <button onClick={onBack} className="k-scan-action-btn" aria-label="Back">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kiosk/backward.svg" alt="" aria-hidden width={56} />
        </button>
        <button onClick={onHome} className="k-scan-action-btn" aria-label="Home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kiosk/home.svg" alt="" aria-hidden width={56} />
        </button>
      </div>

      {/* Title + subtitle */}
      <div className="k-scan-heading">
        <h1 className="k-scan-title">Create Your Digital Look</h1>
        <p className="k-scan-subtitle">Stand inside the frame for a quick scan</p>
      </div>

      {/* Camera frame. Two phases:
       *   scanning=false → original splash (blurred bg + avatar + button)
       *   scanning=true  → live webcam with the fit guide on top
       *
       * The <video> element is conditionally rendered (vs always mounted)
       * because we don't want it to start ticking frames behind the
       * splash screen — pose detection only spins up after this swap. */}
      <div className={`k-scan-frame-wrap ${scanning ? "is-capturing" : ""}`}>
        {!scanning && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/try-on/bg.svg" alt="" aria-hidden className="k-scan-bg" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/try-on/blur.svg" alt="" aria-hidden className="k-scan-blur" />
            <div className="k-scan-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/try-on/avatar.svg" alt="" aria-hidden />
            </div>
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
            <button onClick={() => setScanning(true)} className="k-scan-capture" aria-label="Capture my look">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/try-on/button.svg" alt="Capture My Look" />
            </button>
          </>
        )}

        {scanning && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="k-scan-video"
            />

            {/* Fit guide — red until landmarks fall in the rect, green
                when they do, pulsing while locked into the countdown. */}
            <div
              className={`k-scan-guide${isFit ? " is-fit" : ""}${locked ? " is-locked" : ""}`}
            >
              <div className="k-scan-guide-rect">
                <div className="k-scan-guide-figure">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/try-on/avatar.svg" alt="" aria-hidden />
                </div>
              </div>
              <div className="k-scan-guide-hint">{hintText}</div>
              {countdown !== null && countdown > 0 && (
                <div className="k-scan-guide-countdown">{countdown}</div>
              )}
            </div>

            {/* Viewfinder corner ticks. */}
            <div className="k-scan-corner tl" />
            <div className="k-scan-corner tr" />
            <div className="k-scan-corner bl" />
            <div className="k-scan-corner br" />

            {/* Camera flip — hidden once the countdown is running so it
                can't disrupt the in-flight capture. */}
            {countdown === null && onSwitchCamera && (
              <button
                onClick={onSwitchCamera}
                className="k-scan-flip"
                aria-label={cameraFacing === "user" ? "Switch to back camera" : "Switch to front camera"}
                title={cameraFacing === "user" ? "Switch to back camera" : "Switch to front camera"}
              >
                <SwitchCamera size={18} strokeWidth={2.25} />
              </button>
            )}

            {/* Manual capture — always visible while not actively
                counting down, as a guaranteed escape hatch if pose
                detection is slow to load or fails to find a fit. */}
            {countdown === null && (
              <button onClick={lockAndStartCountdown} className="k-scan-capture" aria-label="Capture my look">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/try-on/button.svg" alt="Capture My Look" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const size = 44;
  const thick = 3;
  const color = "rgba(255, 255, 255, 0.95)";
  const base: React.CSSProperties = { position: "absolute", width: size, height: size, zIndex: 6 };
  const borderStyle = `${thick}px solid ${color}`;
  const map: Record<typeof pos, React.CSSProperties> = {
    tl: { ...base, top: 18, left: 18, borderTop: borderStyle, borderLeft: borderStyle },
    tr: { ...base, top: 18, right: 18, borderTop: borderStyle, borderRight: borderStyle },
    bl: { ...base, bottom: 18, left: 18, borderBottom: borderStyle, borderLeft: borderStyle },
    br: { ...base, bottom: 18, right: 18, borderBottom: borderStyle, borderRight: borderStyle },
  };
  return <div style={map[pos]} />;
}
