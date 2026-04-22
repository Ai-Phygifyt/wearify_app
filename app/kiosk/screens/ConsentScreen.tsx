import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";

export function ConsentScreen({
  onAllow,
  onSkip,
}: {
  onAllow: () => void | Promise<void>;
  onSkip: () => void;
}) {
  const [requesting, setRequesting] = useState(false);

  async function handleAllow() {
    if (requesting) return;
    setRequesting(true);
    try {
      await onAllow();
    } finally {
      // Parent resolves whether we navigate away; either way the button
      // shouldn't stay spinning forever if we land back here on denial.
      setRequesting(false);
    }
  }

  return (
    <div className="k-overlay">
      <div className="k-modal k-scaleIn">
        <div className="k-popIn" style={{
          width: 60, height: 60, margin: "0 auto 12px",
          borderRadius: "50%", background: "rgba(104,38,42,.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--k-maroon)",
        }}>
          <Camera size={28} strokeWidth={2} />
        </div>
        <h3 className="k-display" style={{ fontSize: 20, marginBottom: 8 }}>Start Your Try-On</h3>
        <p style={{ fontSize: 14, color: "var(--k-text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
          We&apos;ll use the camera on this mirror to capture your look. Images are saved securely and you can delete them anytime.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onSkip}
            disabled={requesting}
            className="k-btn k-btn-secondary k-btn-pill"
            style={{ flex: 1, fontSize: 14 }}
          >
            Skip
          </button>
          <button
            onClick={handleAllow}
            disabled={requesting}
            className="k-btn k-btn-primary k-btn-pill"
            style={{ flex: 1, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            {requesting ? (<><Loader2 size={16} className="k-spin" /> Opening…</>) : "Allow"}
          </button>
        </div>
      </div>
    </div>
  );
}
