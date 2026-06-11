"use client";

import { useCallback, useEffect, useState } from "react";
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
    return (
      <div
        className="k-shell k-scan-shell"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          padding: 24,
          minHeight: "100dvh",
        }}
      >
        <h1 className="k-scan-title">Your Scan</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={captureUrl}
          alt="Captured scan"
          style={{
            maxWidth: "100%",
            maxHeight: "68dvh",
            objectFit: "contain",
            borderRadius: 18,
            boxShadow: "0 14px 40px -16px rgba(0,0,0,0.45)",
          }}
        />
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={handleReset} className="k-btn-secondary">
            Retake
          </button>
          <a
            href={captureUrl}
            download={`body-scan-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.jpg`}
            className="k-btn-primary"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          >
            Download
          </a>
        </div>
      </div>
    );
  }

  // consent (default)
  return <ConsentScreen onAllow={handleAllow} onSkip={handleReset} />;
}
