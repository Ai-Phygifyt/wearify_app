import { Lock, ShieldCheck, X } from "lucide-react";

export function DataSaveScreen({ onSave, onDelete }: { onSave: () => void; onDelete: () => void }) {
  return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="k-modal k-scaleIn" style={{ maxWidth: 380 }}>
        <div className="k-popIn" style={{
          width: 60, height: 60, margin: "0 auto 12px",
          borderRadius: "50%", background: "rgba(104,38,42,.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--k-maroon)",
        }}>
          <Lock size={28} strokeWidth={2} />
        </div>
        <h3 className="k-display" style={{ fontSize: 20, margin: "4px 0 8px" }}>Save your looks?</h3>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
          Saved to your Wearify profile. Access anytime from your phone.
        </p>
        <button onClick={onSave} className="k-btn k-btn-primary k-btn-pill" style={{ width: "100%", fontSize: 15 }}>
          <ShieldCheck size={16} /> Save
        </button>
        <div style={{ fontSize: 10, color: "var(--k-text-muted)", margin: "10px 0", letterSpacing: "0.1em" }}>OR</div>
        <button onClick={onDelete} className="k-btn k-btn-pill" style={{
          width: "100%", background: "transparent",
          border: "1px solid var(--k-red)", color: "var(--k-red)",
          fontSize: 13, fontWeight: 500,
        }}>
          <X size={15} /> Delete All
        </button>
      </div>
    </div>
  );
}
