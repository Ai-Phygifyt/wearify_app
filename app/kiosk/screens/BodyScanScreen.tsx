import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Home } from "lucide-react";

export function BodyScanScreen({
  storeName,
  stream,
  onCapture,
  onBack,
  onHome,
}: {
  storeName: string;
  stream: MediaStream | null;
  onCapture: () => void;
  onBack: () => void;
  onHome: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

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

  // Countdown drives the actual capture — user taps the button, we count
  // down from 3, then fire onCapture.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { onCapture(); return; }
    const t = setTimeout(() => setCountdown((v) => (v === null ? null : v - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, onCapture]);

  return (
    <div className="k-shell">
      {/* Top bar — same shape as PhoneAuthScreen so these screens read
          as a consistent pair. Back button (left), store name (center),
          home icon (right) where the phone screen has a blank spacer. */}
      <div className="k-topbar">
        <button onClick={onBack} className="k-iconbtn k-press" aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className="k-brand" style={{ fontSize: 18, color: "var(--k-maroon)" }}>{storeName}</div>
        <button onClick={onHome} className="k-iconbtn k-press" aria-label="Home">
          <Home size={18} />
        </button>
      </div>

      {/* Title + subtitle */}
      <div style={{ textAlign: "center", marginTop: 4, marginBottom: 14, padding: "0 20px" }}>
        <h1 className="k-display" style={{ fontSize: 24, margin: 0, color: "var(--k-text)" }}>
          Create Your Digital Look
        </h1>
        <p style={{ fontSize: 14, color: "var(--k-text-muted)", margin: "6px 0 0" }}>
          Stand inside the Frame for a quick scan
        </p>
      </div>

      {/* Scan frame. Two modes:
          - Idle  (countdown === null): blurred webcam + cream wash +
            mannequin guide + cream corner brackets + "Capture" button.
          - Capturing (countdown !== null): same blur + mannequin, but
            corners turn green (pulse via k-scan-corner), blue scan line
            sweeps across, and a small "Ns" pill sits at the top.
            The button is hidden. */}
      {(() => {
        const capturing = countdown !== null;
        return (
          <div className="k-scan-frame" style={{
            flex: 1, margin: "0 20px 20px", position: "relative", borderRadius: 18, overflow: "hidden",
            background: "rgba(200,190,175,.2)",
            boxShadow: "0 4px 18px rgba(104,38,42,.08)",
            minHeight: 0,
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
                filter: "blur(14px) brightness(1.05)",
                scale: "1.1",
              }}
            />

            {/* Cream wash — keeps the mannequin readable on top of any feed. */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(238,230,218,.35), rgba(238,230,218,.55))",
              pointerEvents: "none",
            }} />

            {/* Corner brackets: cream in idle, green-pulsing while capturing
                (.k-scan-corner class drives the colour + pulse animation). */}
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

            {/* Mannequin guide — visible in both modes so the user can see
                themselves "inside" the frame during the countdown. */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}>
              <Mannequin />
            </div>

            {/* Capturing-only overlays: scan line + top pill */}
            {capturing && (
              <>
                <div className="k-scan-line" />
                <div style={{
                  position: "absolute", top: 18, left: "50%",
                  transform: "translateX(-50%)",
                  padding: "6px 16px", borderRadius: "var(--k-r-pill)",
                  background: "rgba(255,255,255,.92)",
                  border: "1px solid rgba(104,38,42,.08)",
                  fontFamily: "'Roboto Mono', 'DM Mono', monospace",
                  fontSize: 15, fontWeight: 700, color: "var(--k-text)",
                  boxShadow: "0 4px 14px rgba(0,0,0,.10)",
                  zIndex: 10,
                }}>
                  {countdown}s
                </div>
              </>
            )}

            {/* Capture button — hidden while counting down */}
            {!capturing && (
              <div style={{
                position: "absolute", bottom: 18, left: 0, right: 0,
                display: "flex", justifyContent: "center",
              }}>
                <button
                  onClick={() => setCountdown(10)}
                  className="k-press"
                  style={{
                    padding: "14px 30px", borderRadius: 999,
                    background: "#fff",
                    border: "none",
                    boxShadow: "0 6px 20px rgba(0,0,0,.12)",
                    fontSize: 17, fontWeight: 600, color: "var(--k-text)",
                    cursor: "pointer",
                  }}
                >
                  Capture My Look
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const size = 28;
  const thick = 2.5;
  const color = "rgba(253, 246, 232, 0.92)";
  const base: React.CSSProperties = { position: "absolute", width: size, height: size };
  const borderStyle = `${thick}px solid ${color}`;
  const map: Record<typeof pos, React.CSSProperties> = {
    tl: { ...base, top: 14, left: 14, borderTop: borderStyle, borderLeft: borderStyle, borderTopLeftRadius: 10 },
    tr: { ...base, top: 14, right: 14, borderTop: borderStyle, borderRight: borderStyle, borderTopRightRadius: 10 },
    bl: { ...base, bottom: 14, left: 14, borderBottom: borderStyle, borderLeft: borderStyle, borderBottomLeftRadius: 10 },
    br: { ...base, bottom: 14, right: 14, borderBottom: borderStyle, borderRight: borderStyle, borderBottomRightRadius: 10 },
  };
  return <div style={map[pos]} />;
}

// Standing mannequin silhouette rendered at the center of the scan frame.
// Cream fill + a thin darker outline to suggest subtle depth, matching
// the in-store-feel reference. Arms are slightly out so the figure reads
// as a full body rather than an icon.
function Mannequin() {
  return (
    <svg
      viewBox="0 0 240 520"
      style={{ height: "92%", maxHeight: 560, width: "auto", filter: "drop-shadow(0 6px 14px rgba(40,20,5,.18))" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mn-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5EAD8" />
          <stop offset="60%" stopColor="#E4D4BD" />
          <stop offset="100%" stopColor="#D3BFA3" />
        </linearGradient>
      </defs>
      <g fill="url(#mn-fill)" stroke="#7A5B3A" strokeWidth="1.4" strokeLinejoin="round">
        {/* Head */}
        <ellipse cx="120" cy="58" rx="34" ry="42" />
        {/* Neck */}
        <path d="M108 96 Q108 108, 120 110 Q132 108, 132 96 Z" />
        {/* Torso + shoulders */}
        <path d="
          M 86 116
          Q 76 120, 72 132
          L 82 206
          Q 84 222, 96 228
          L 144 228
          Q 156 222, 158 206
          L 168 132
          Q 164 120, 154 116
          Q 138 110, 120 110
          Q 102 110, 86 116
          Z
        " />
        {/* Left arm */}
        <path d="
          M 78 128
          Q 60 140, 52 170
          L 42 250
          Q 38 270, 44 290
          Q 52 300, 60 295
          L 64 276
          Q 62 256, 66 240
          L 80 180
          L 86 138
          Z
        " />
        {/* Right arm */}
        <path d="
          M 162 128
          Q 180 140, 188 170
          L 198 250
          Q 202 270, 196 290
          Q 188 300, 180 295
          L 176 276
          Q 178 256, 174 240
          L 160 180
          L 154 138
          Z
        " />
        {/* Left leg */}
        <path d="
          M 94 228
          L 90 320
          Q 88 400, 92 478
          Q 94 496, 106 498
          Q 118 496, 118 478
          L 118 346
          L 122 240
          Z
        " />
        {/* Right leg */}
        <path d="
          M 146 228
          L 150 320
          Q 152 400, 148 478
          Q 146 496, 134 498
          Q 122 496, 122 478
          L 122 346
          L 118 240
          Z
        " />
      </g>
    </svg>
  );
}
