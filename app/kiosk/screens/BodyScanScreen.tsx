"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Home, SwitchCamera } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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
  const [countdown, setCountdown] = useState<number | null>(null);

  const logoUrl = useQuery(api.files.getUrl, storeLogoFileId ? { fileId: storeLogoFileId } : "skip");
  const initial = (storeName || "S").trim().charAt(0).toUpperCase() || "S";

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream && el.srcObject !== stream) el.srcObject = stream;
    if (!stream && el.srcObject) el.srcObject = null;
  }, [stream]);

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
    const t = setTimeout(() => setCountdown((v) => (v === null ? null : v - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, onCapture]);

  const capturing = countdown !== null;

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
          <img src="/kiosk/backward.svg" alt="" aria-hidden width={44} />
        </button>
        <button onClick={onHome} className="k-scan-action-btn" aria-label="Home">
          <Home size={22} color="var(--k-maroon)" strokeWidth={2.25} fill="var(--k-maroon)" />
        </button>
      </div>

      {/* Title + subtitle */}
      <div className="k-scan-heading">
        <h1 className="k-scan-title">Create Your Digital Look</h1>
        <p className="k-scan-subtitle">Stand inside the Frame for a quick scan</p>
      </div>

      {/* Camera frame */}
      <div className={`k-scan-frame-wrap ${capturing ? "is-capturing" : ""}`}>
        {!capturing && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/try-on/bg.svg" alt="" aria-hidden className="k-scan-bg" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/try-on/blur.svg" alt="" aria-hidden className="k-scan-blur" />
          </>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="k-scan-video"
          style={{
            display: capturing ? "block" : "none",
          }}
        />

        {!capturing && (
          <div className="k-scan-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/try-on/avatar.svg" alt="" aria-hidden />
          </div>
        )}

        {capturing ? (
          <>
            <div className="k-scan-corner tl" />
            <div className="k-scan-corner tr" />
            <div className="k-scan-corner bl" />
            <div className="k-scan-corner br" />
          </>
        ) : (
          <>
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
          </>
        )}

        {capturing && (
          <>
            <div className="k-scan-line" />
            <div className="k-scan-countdown">{countdown}s</div>
          </>
        )}

        {!capturing && onSwitchCamera && (
          <button
            onClick={onSwitchCamera}
            className="k-scan-flip"
            aria-label={cameraFacing === "user" ? "Switch to back camera" : "Switch to front camera"}
            title={cameraFacing === "user" ? "Switch to back camera" : "Switch to front camera"}
          >
            <SwitchCamera size={18} strokeWidth={2.25} />
          </button>
        )}

        {!capturing && (
          <button onClick={() => setCountdown(10)} className="k-scan-capture" aria-label="Capture my look">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/try-on/button.svg" alt="Capture My Look" />
          </button>
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
