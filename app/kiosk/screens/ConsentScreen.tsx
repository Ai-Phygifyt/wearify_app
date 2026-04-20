import { Camera } from "lucide-react";

export function ConsentScreen({ onAllow, onSkip }: { onAllow: () => void; onSkip: () => void }) {
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
          Photo processed by on-device AI. Images saved securely. Delete anytime.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onSkip} className="k-btn k-btn-secondary k-btn-pill" style={{ flex: 1, fontSize: 14 }}>
            Skip
          </button>
          <button onClick={onAllow} className="k-btn k-btn-primary k-btn-pill" style={{ flex: 1, fontSize: 14 }}>
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
