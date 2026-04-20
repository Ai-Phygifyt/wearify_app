import { useState, useEffect } from "react";
import { Star, Home, LogOut } from "lucide-react";

export function FeedbackScreen({ onSubmit, onHome, onLogout }: { onSubmit: (rating: number) => void; onHome: () => void; onLogout: () => void }) {
  const [rating, setRating] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => { if (done) { const t = setTimeout(() => onSubmit(rating), 3000); return () => clearTimeout(t); } }, [done, onSubmit, rating]);
  if (done) return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="k-popIn" style={{
        width: 100, height: 100, borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(201,148,26,.15), rgba(201,148,26,.05))",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--k-gold)",
      }}>
        <Star size={48} fill="var(--k-gold)" strokeWidth={1.6} />
      </div>
      <h2 className="k-display k-slideUp k-d2" style={{ fontSize: 24, marginTop: 18 }}>Thank you!</h2>
      <p className="k-slideUp k-d3" style={{ fontSize: 14, color: "var(--k-text-muted)", marginTop: 4 }}>We appreciate your feedback</p>
    </div>
  );
  return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="k-modal k-scaleIn" style={{ maxWidth: 380 }}>
        <h3 className="k-display" style={{ fontSize: 20 }}>How was your experience?</h3>
        <p style={{ fontSize: 13, color: "var(--k-text-muted)", marginTop: 4 }}>Tap a star to rate</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, margin: "22px 0" }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const active = n <= rating;
            return (
              <span key={n} onClick={() => setRating(n)} className="k-star k-press" aria-label={`${n} star`}>
                <Star size={36} strokeWidth={1.6}
                  color={active ? "var(--k-gold)" : "var(--k-border)"}
                  fill={active ? "var(--k-gold)" : "transparent"} />
              </span>
            );
          })}
        </div>
        <button onClick={() => setDone(true)} disabled={rating === 0} className="k-btn k-btn-primary k-btn-pill" style={{ width: "100%", fontSize: 14 }}>
          Submit
        </button>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={onHome} className="k-btn k-btn-secondary k-btn-pill" style={{ flex: 1, fontSize: 12, minHeight: 40, padding: "8px 14px" }}>
            <Home size={14} /> Home
          </button>
          <button onClick={onLogout} className="k-btn k-btn-secondary k-btn-pill" style={{ flex: 1, fontSize: 12, minHeight: 40, padding: "8px 14px" }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
