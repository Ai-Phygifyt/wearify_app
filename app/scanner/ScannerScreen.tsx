"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeBodyFit,
  type FitReason,
  useBodyPose,
} from "@/lib/useBodyPose";

// =========================================================================
// Standalone scanner screen — camera + in-browser pose fit guide + capture.
//
// This is a Convex-free fork of the kiosk BodyScanScreen, built so the
// camera/scan flow can be deployed on its own (see app/scanner/page.tsx).
// All backend coupling (store-logo query, storage Ids, try-on upload) has
// been removed; capture simply hands the raw frame blob back to the parent.
// =========================================================================

// Fit region — normalized rect inside the video frame (0..1 coords). Kept in
// sync with the CSS .k-scan-guide-rect insets (left/right 25%, top/bottom 5%).
const FIT_RECT = { x: 0.25, y: 0.05, w: 0.5, h: 0.9 };

// Coaching shown beneath the guide for each framing problem.
const FIT_HINTS: Record<FitReason, string> = {
  detecting: "Detecting…",
  "no-person": "Step into the frame",
  "too-far": "Step a little closer",
  "feet-cut": "Step back so your feet are in the frame",
  "head-cut": "Step back so your head is in the frame",
  "too-wide": "Step back to fit your whole body",
  "off-center": "Move to the centre of the frame",
  ok: "Almost there…",
};

// How long the user holds the pose before auto-fire, then a visible countdown.
const FIT_HOLD_MS = 900;
const AUTO_CAPTURE_COUNTDOWN_SEC = 3;

export function ScannerScreen({
  brandName = "Body Scanner",
  stream,
  onCapture,
  onClose,
}: {
  brandName?: string;
  stream: MediaStream | null;
  onCapture: (blob: Blob) => void;
  onClose?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Two phases driven purely by whether the stream is ready:
  //   no stream  → splash UI (blurred bg + avatar silhouette).
  //   has stream → live webcam + fit guide + auto-capture.
  const scanning = !!stream;
  const poseEnabled = scanning && !!stream;
  const { ready: poseReady, landmarks, error: poseError } = useBodyPose(
    videoRef,
    { enabled: poseEnabled },
  );

  // Full-body framing check — head AND feet inside the rect, with a reason
  // so we can coach the user. fit === true is the only state that arms capture.
  const fitResult = useMemo(
    () => analyzeBodyFit(landmarks, FIT_RECT),
    [landmarks],
  );
  const isFit = fitResult.fit;

  const fitSinceRef = useRef<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const lockAndStartCountdown = useCallback(() => {
    setLocked(true);
    setCountdown(AUTO_CAPTURE_COUNTDOWN_SEC);
  }, []);

  // Hold-timer: while isFit holds for FIT_HOLD_MS, lock + start countdown.
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

  // Attach the stream and explicitly play() — there's no prior tap gesture on
  // this element, so some browsers won't autoplay without the call.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream && el.srcObject !== stream) {
      el.srcObject = stream;
      el.play().catch(() => {
        /* autoplay blocked — frame still arrives muted */
      });
    }
    if (!stream && el.srcObject) el.srcObject = null;
  }, [stream]);

  // Countdown driver — when it reaches 0, snap the full video frame.
  // No crop, no mirror.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      const grab = (): boolean => {
        const video = videoRef.current;
        if (!video || !video.videoWidth || !video.videoHeight) return false;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return false;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => onCapture(blob ?? new Blob([], { type: "image/jpeg" })),
          "image/jpeg",
          0.9,
        );
        return true;
      };
      if (grab()) return;
      // Frame not ready (stream still warming up) — poll briefly.
      let tries = 0;
      const iv = setInterval(() => {
        tries += 1;
        if (grab()) {
          clearInterval(iv);
        } else if (tries >= 25) {
          clearInterval(iv);
          onCapture(new Blob([], { type: "image/jpeg" }));
        }
      }, 100);
      return () => clearInterval(iv);
    }
    const t = setTimeout(
      () => setCountdown((v) => (v === null ? null : v - 1)),
      1000,
    );
    return () => clearTimeout(t);
  }, [countdown, onCapture]);

  const initial = (brandName || "S").trim().charAt(0).toUpperCase() || "S";

  const hintText = poseError
    ? "Detection unavailable — tap the button below"
    : !poseReady
      ? "Loading body detection…"
      : locked
        ? "Hold still…"
        : FIT_HINTS[fitResult.reason];

  return (
    <div className="k-shell k-scan-shell">
      {/* Top bar — brand on the left, optional close on the right */}
      <div className="k-scan-topbar">
        <div className="k-scan-topbar-left">
          <div className="k-scan-topbar-logo">
            <span>{initial}</span>
          </div>
          <div className="k-scan-topbar-title">{brandName}</div>
        </div>
      </div>

      {/* Floating back / home circles */}
      {onClose && (
        <div className="k-scan-actions">
          <button onClick={onClose} className="k-scan-action-btn" aria-label="Back">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kiosk/backward.svg" alt="" aria-hidden width={56} />
          </button>
        </div>
      )}

      {/* Title + subtitle */}
      <div className="k-scan-heading">
        <h1 className="k-scan-title">Create Your Digital Look</h1>
        <p className="k-scan-subtitle">Stand inside the frame for a quick scan</p>
      </div>

      {/* Camera frame — splash until the stream arrives, then live webcam. */}
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

            {/* Fit guide — red until landmarks fall in the rect, green when
                they do, pulsing while locked into the countdown. */}
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

            {/* Manual capture — always available while not counting down. */}
            {countdown === null && (
              <button
                onClick={lockAndStartCountdown}
                className="k-scan-capture"
                aria-label="Capture my look"
              >
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
