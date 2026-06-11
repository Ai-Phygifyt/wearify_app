"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Camera, RotateCcw, Download } from "lucide-react";
import "./scanner-theme.css";
import { ScannerScreen } from "./ScannerScreen";

type Phase = "start" | "scanning" | "preview";

// Acquire a webcam stream pointed at the requested direction. We ask for the
// tallest frame the camera can give (portrait → 4:3 → anything) because a
// standing subject needs vertical field-of-view to fit head-to-feet.
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
  const [phase, setPhase] = useState<Phase>("start");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureUrl, setCaptureUrl] = useState<string | null>(null);

  // Stop every track on the current stream and clear it.
  const stopCamera = useCallback(() => {
    setStream((prev) => {
      if (prev) prev.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  // Stop the camera and revoke any captured object URL on unmount.
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Triggered by the Start button (a user gesture, required by getUserMedia).
  const handleStart = useCallback(async () => {
    if (requesting) return;
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not supported on this device or browser.");
      return;
    }
    setRequesting(true);
    try {
      const s = await acquireCamera("user");
      setStream(s);
      setPhase("scanning");
    } catch (err) {
      const name = (err as { name?: string })?.name;
      setError(
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? "Camera access was denied. Allow camera access and try again."
          : "Could not open the camera. Check your device and try again.",
      );
    } finally {
      setRequesting(false);
    }
  }, [requesting]);

  const handleCapture = useCallback(
    (blob: Blob) => {
      stopCamera();
      if (!blob || blob.size === 0) {
        setError("Capture failed — please try again.");
        setPhase("start");
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

  const handleRetake = useCallback(() => {
    setCaptureUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhase("start");
    void handleStart();
  }, [handleStart]);

  const handleClose = useCallback(() => {
    stopCamera();
    setPhase("start");
  }, [stopCamera]);

  if (phase === "scanning") {
    return (
      <ScannerScreen
        stream={stream}
        onCapture={handleCapture}
        onClose={handleClose}
      />
    );
  }

  if (phase === "preview" && captureUrl) {
    return (
      <div className="k-shell k-scan-shell">
        <div className="k-scan-heading">
          <h1 className="k-scan-title">Your Scan</h1>
          <p className="k-scan-subtitle">Looking good? Save it or take another.</p>
        </div>
        <div className="scanner-preview-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={captureUrl} alt="Captured scan" className="scanner-preview-img" />
        </div>
        <div className="scanner-actions">
          <button onClick={handleRetake} className="scanner-btn scanner-btn-secondary">
            <RotateCcw size={20} /> Retake
          </button>
          <a
            href={captureUrl}
            download={`body-scan-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.jpg`}
            className="scanner-btn scanner-btn-primary"
          >
            <Download size={20} /> Download
          </a>
        </div>
      </div>
    );
  }

  // start phase
  return (
    <div className="k-shell k-scan-shell scanner-start">
      <div className="scanner-start-card">
        <div className="scanner-start-icon">
          <Camera size={44} color="var(--k-maroon)" strokeWidth={2.25} />
        </div>
        <h1 className="scanner-start-title">Body Scanner</h1>
        <p className="scanner-start-subtitle">
          Stand back so your whole body fits in the frame. We&rsquo;ll guide you
          into position and capture automatically.
        </p>
        {error && <p className="scanner-start-error">{error}</p>}
        <button
          onClick={handleStart}
          disabled={requesting}
          className="scanner-btn scanner-btn-primary scanner-start-btn"
        >
          {requesting ? (
            <>
              <Loader2 size={20} className="k-spin" /> Opening camera…
            </>
          ) : (
            <>
              <Camera size={20} /> Start Scan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
