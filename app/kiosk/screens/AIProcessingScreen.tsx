import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";

export function AIProcessingScreen({ onDone }: { onDone: () => void }) {
  const [cd, setCd] = useState(6);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    if (cd <= 0) { onDone(); return; }
    const t = setTimeout(() => { setCd((v) => v - 1); setProg((v) => Math.min(100, v + 17)); }, 1000);
    return () => clearTimeout(t);
  }, [cd, onDone]);
  return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
      <div className="k-popIn k-breathe" style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(104,38,42,.1), rgba(201,148,26,.12))",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--k-maroon)", marginBottom: 20,
      }}>
        <Sparkles size={36} strokeWidth={2} />
      </div>
      <h2 className="k-display" style={{ fontSize: 22 }}>Creating your look</h2>
      <p style={{ fontSize: 13, color: "var(--k-text-muted)", marginTop: 4 }}>Our AI is tailoring it just for you</p>
      <div style={{ width: "min(70%, 420px)", height: 5, borderRadius: "var(--k-r-pill)", background: "var(--k-border-l)", marginTop: 20, overflow: "hidden" }}>
        <div style={{ width: `${prog}%`, height: "100%", background: "linear-gradient(90deg, var(--k-maroon), var(--k-gold))", borderRadius: "var(--k-r-pill)", transition: "width .8s ease" }} />
      </div>
      <div className="k-mono" style={{ fontSize: 16, color: "var(--k-text-muted)", marginTop: 14 }}>{cd}s</div>
      <div className="k-chip k-chip-green k-slideUp k-d3" style={{ marginTop: 24 }}>
        <ShieldCheck size={14} /> Securely saved
      </div>
    </div>
  );
}
