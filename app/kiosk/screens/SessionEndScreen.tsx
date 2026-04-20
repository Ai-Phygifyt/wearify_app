import { useState, useEffect } from "react";
import { Lock } from "lucide-react";

export function SessionEndScreen({ onDone }: { onDone: () => void }) {
  const [cd, setCd] = useState(3);
  useEffect(() => { if (cd <= 0) { onDone(); return; } const t = setTimeout(() => setCd((v) => v - 1), 1000); return () => clearTimeout(t); }, [cd, onDone]);
  return (
    <div className="k-shell" style={{
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, var(--k-maroon) 0%, var(--k-maroon-d) 100%)",
    }}>
      <div className="k-popIn k-breathe" style={{
        width: 100, height: 100, borderRadius: "50%",
        background: "rgba(255,255,255,.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,.15)",
      }}>
        <Lock size={44} strokeWidth={1.8} />
      </div>
      <h2 className="k-display k-slideUp k-d2" style={{ fontSize: 24, color: "#fff", marginTop: 18 }}>Session Ended</h2>
      <p className="k-slideUp k-d3" style={{ fontSize: 14, color: "rgba(255,255,255,.65)", marginTop: 6 }}>Your privacy is protected.</p>
      <div className="k-mono k-slideUp k-d4" style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginTop: 18 }}>{cd}…</div>
    </div>
  );
}
