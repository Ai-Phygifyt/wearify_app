"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { ConsentScreen } from "../kiosk/screens/ConsentScreen";
import { BodyScanScreen } from "../kiosk/screens/BodyScanScreen";

// =========================================================================
// /scanner — standalone body-scan module.
//
// Reuses the exact kiosk scanner section (ConsentScreen → BodyScanScreen)
// outside the full kiosk session flow. Camera acquisition is lifted from
// the kiosk page; capture terminates in a simple preview (Retake / Download)
// since there's no customer session to upload against here.
// =========================================================================

type Phase = "consent" | "scan" | "preview";

// Acquire a webcam stream pointed at the requested direction — tiered to ask
// for the tallest frame first (portrait → 4:3 → anything), matching the
// kiosk's acquireCamera so a standing full body fits the frame.
async function acquireCamera(
  want: "user" | "environment",
): Promise<MediaStream> {
  const tiers: MediaTrackConstraints[] = [
    { facingMode: want, width: { ideal: 1080 }, height: { ideal: 1440 }, aspectRatio: { ideal: 3 / 4 } },
    { facingMode: want, width: { ideal: 1280 }, height: { ideal: 960 }, aspectRatio: { ideal: 4 / 3 } },
    { facingMode: want },
  ];
  let lastErr: unknown;
  for (const video of tiers) {
    try {
      return await navigator.mediaDevices.getUserMedia({ video, audio: false });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Camera unavailable");
}

export default function ScannerPage() {
  const [phase, setPhase] = useState<Phase>("consent");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureUrl, setCaptureUrl] = useState<string | null>(null);
  // Topbar label — reuse the kiosk store name when this device is paired, so
  // the scanner header matches the kiosk; otherwise a neutral default.
  const [storeName, setStoreName] = useState("Body Scanner");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wearify_kiosk_store");
      if (raw) {
        const cfg = JSON.parse(raw) as { storeName?: string };
        if (cfg.storeName) setStoreName(cfg.storeName);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const stopCamera = useCallback(() => {
    setStream((prev) => {
      if (prev) prev.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  // Stop the camera on unmount.
  useEffect(() => () => stopCamera(), [stopCamera]);

  // ConsentScreen "Allow" — kiosk hardware faces the customer as "environment",
  // and the constraint is a hint, so it falls back to the only camera on
  // single-camera devices (laptops/phones in portrait test).
  const handleAllow = useCallback(async () => {
    try {
      const s = await acquireCamera("environment");
      setStream(s);
      setPhase("scan");
    } catch {
      // Permission denied / no camera — stay on consent so the user can retry.
      setPhase("consent");
    }
  }, []);

  const handleCapture = useCallback(
    (blob: Blob) => {
      stopCamera();
      if (!blob || blob.size === 0) {
        setPhase("consent");
        return;
      }
      setCaptureUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setPhase("preview");
    },
    [stopCamera],
  );

  const handleReset = useCallback(() => {
    stopCamera();
    setCaptureUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhase("consent");
  }, [stopCamera]);

  if (phase === "scan") {
    return (
      <BodyScanScreen
        storeName={storeName}
        stream={stream}
        onCapture={handleCapture}
        onBack={handleReset}
        onHome={handleReset}
      />
    );
  }

  if (phase === "preview" && captureUrl) {
    const initial = (storeName || "S").trim().charAt(0).toUpperCase() || "S";
    return (
      <div className="k-shell k-scan-shell">
        {/* Top bar — same as the scan screen for visual continuity. */}
        <div className="k-scan-topbar">
          <div className="k-scan-topbar-left">
            <div className="k-scan-topbar-logo">
              <span>{initial}</span>
            </div>
            <div className="k-scan-topbar-title">{storeName}</div>
          </div>
        </div>

        <div className="k-scan-heading">
          <h1 className="k-scan-title">Your Scan</h1>
          <p className="k-scan-subtitle">Looking good? Save it or take another.</p>
        </div>

        {/* Captured frame reuses the live-scan media treatment, but with
            `is-capturing` so the frosted-glass ::after overlay (translucent
            gradient + backdrop blur) is disabled — otherwise it masks the
            captured photo and makes it look blurry. */}
        <div className="k-scan-frame-wrap is-capturing">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={captureUrl} alt="Captured scan" className="scanner-preview-img" />
        </div>

        <div className="scanner-preview-actions">
          <button
            onClick={handleReset}
            className="k-scan-choice-btn k-scan-choice-btn-secondary"
          >
            <RotateCcw size={20} strokeWidth={2.25} />
            Retake
          </button>
          <a
            href={captureUrl}
            download={`body-scan-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.jpg`}
            className="k-scan-choice-btn k-scan-choice-btn-primary"
          >
            <Download size={20} strokeWidth={2.25} />
            Download
          </a>
        </div>
      </div>
    );
  }

  // consent (default)
  return <ConsentScreen onAllow={handleAllow} onSkip={handleReset} />;
}
