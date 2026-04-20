import { Hand, ChevronRight } from "lucide-react";

export function ScanChoiceScreen({ customerName, onUsePrevious, onRescan }: {
  customerName: string; onUsePrevious: () => void; onRescan: () => void;
}) {
  return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="k-modal k-scaleIn" style={{ maxWidth: 380 }}>
        <div className="k-popIn" style={{
          width: 64, height: 64, margin: "0 auto 12px",
          borderRadius: "50%", background: "rgba(104,38,42,.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--k-maroon)",
        }}>
          <Hand size={30} strokeWidth={2} />
        </div>
        <h3 className="k-display" style={{ fontSize: 22, marginBottom: 6 }}>
          Welcome back{customerName ? `, ${customerName.split(" ")[0]}` : ""}
        </h3>
        <p style={{ fontSize: 14, color: "var(--k-text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
          We found your previous body scan. Our AI can use it for your try-on, or you can take a fresh scan.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onUsePrevious} className="k-btn k-btn-primary k-btn-pill" style={{ width: "100%", fontSize: 15 }}>
            Use Previous Scan
            <ChevronRight size={18} />
          </button>
          <button onClick={onRescan} className="k-btn k-btn-secondary k-btn-pill" style={{ width: "100%", fontSize: 14 }}>
            Take Fresh Scan
          </button>
        </div>
      </div>
    </div>
  );
}
