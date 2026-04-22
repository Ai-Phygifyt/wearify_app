import { useEffect, useRef, useState } from "react";

export function BodyScanScreen({
  storeName,
  stream,
  onCapture,
  onBack,
}: {
  storeName: string;
  stream: MediaStream | null;
  onCapture: () => void;
  onBack: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detected, setDetected] = useState(false);
  const [phase, setPhase] = useState<"position" | "countdown">("position");
  const [countdown, setCountdown] = useState(10);

  // Bind the MediaStream from the parent onto the <video> element when
  // either becomes available. React doesn't have a direct prop for this,
  // srcObject has to be set imperatively.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream && el.srcObject !== stream) {
      el.srcObject = stream;
    }
    if (!stream && el.srcObject) {
      el.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    // Fake-detection timer only runs when we actually have a feed —
    // no point "detecting" a user against a blank gradient.
    if (!stream) return;
    const t = setTimeout(() => setDetected(true), 2500);
    return () => clearTimeout(t);
  }, [stream]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { onCapture(); return; }
    const t = setTimeout(() => setCountdown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, onCapture]);

  return (
    <div className="k-shell">
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div className="k-brand" style={{ fontSize: 22 }}>{storeName}</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Create Your Digital Look</h2>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", marginBottom: 8 }}>
          {stream ? "Stand inside the frame" : "Camera unavailable — tap Back to retry"}
        </p>
        <div className="k-scan-frame" style={{
          width: "100%", flex: 1, maxHeight: "60vh", borderRadius: "var(--k-r)", overflow: "hidden",
          background: "linear-gradient(180deg, rgba(200,190,175,.3), rgba(200,190,175,.15))", position: "relative",
        }}>
          {/* Live webcam feed. Mirrored (scaleX(-1)) so the user's left
              appears on their left — matches the in-person mirror UX. */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", zIndex: 1, transform: "scaleX(-1)",
              background: "#000",
            }}
          />
          <div className="k-scan-corner tl" /><div className="k-scan-corner tr" /><div className="k-scan-corner bl" /><div className="k-scan-corner br" />
          {phase === "countdown" && <div className="k-scan-line" />}
          {phase === "countdown" && (
            <div style={{
              position: "absolute", top: "4%", left: "50%", transform: "translateX(-50%)",
              background: "rgba(255,255,255,.85)", padding: "4px 16px", borderRadius: "var(--k-r-sm)",
              fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 600, zIndex: 5,
            }}>{countdown}s</div>
          )}
          {/* Silhouette stays as a translucent guide over the live feed. */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3, pointerEvents: "none" }}>
            <svg viewBox="0 0 200 400" style={{ height: "70%", opacity: detected ? 0.35 : 0.55 }}>
              <ellipse cx="100" cy="55" rx="28" ry="32" fill="none" stroke={detected ? "var(--k-green)" : "#fff"} strokeWidth="1.5" />
              <path d="M72 87C60 95 40 115 38 160L38 250Q38 260 48 260L65 260L65 200L75 200L75 350Q75 360 85 360L92 360L95 210L105 210L108 360L115 360Q125 360 125 350L125 200L135 200L135 260L152 260Q162 260 162 250L162 160C160 115 140 95 128 87" fill="none" stroke={detected ? "var(--k-green)" : "#fff"} strokeWidth="1.5" />
            </svg>
          </div>
          {phase === "position" && detected && (
            <div style={{ position: "absolute", bottom: "4%", left: "50%", transform: "translateX(-50%)", zIndex: 5, display: "flex", gap: 10 }}>
              <button onClick={() => { setPhase("countdown"); setCountdown(10); }} className="k-press" style={{
                padding: "12px 24px", borderRadius: "var(--k-r-pill)",
                background: "rgba(255,255,255,.92)", border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}>Capture My Look</button>
            </div>
          )}
        </div>
        <button onClick={onBack} className="k-press" style={{
          marginTop: 8, padding: "8px 20px", background: "transparent", border: "1px solid var(--k-border)",
          borderRadius: "var(--k-r-pill)", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--k-text-muted)",
        }}>Back</button>
      </div>
    </div>
  );
}
