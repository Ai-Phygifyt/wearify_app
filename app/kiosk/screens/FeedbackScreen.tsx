import { useState } from "react";
import { Star, Home, LogOut } from "lucide-react";

export function FeedbackScreen({
  onSubmit,
  onHome,
  onLogout,
}: {
  onSubmit: (rating: number, comment: string) => void;
  onHome: () => void;
  onLogout: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const display = hover || rating;

  return (
    <div className="k-overlay">
      <div className="k-modal k-feedback-modal k-scaleIn">
        <h3 className="k-feedback-title">Try-on Feedback</h3>
        <p className="k-feedback-sub">Please rate your experience below</p>

        <div className="k-feedback-rating">
          <div className="k-feedback-stars">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = n <= display;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="k-feedback-star k-press"
                  aria-label={`${n} star`}
                >
                  <Star
                    size={22}
                    strokeWidth={1.6}
                    color={active ? "var(--k-gold)" : "rgba(0,0,0,0.25)"}
                    fill={active ? "var(--k-gold)" : "transparent"}
                  />
                </button>
              );
            })}
          </div>
          <span className="k-feedback-rating-text">{display}/5 stars</span>
        </div>

        <label className="k-feedback-label">Additional feedback</label>
        <textarea
          className="k-feedback-textarea"
          rows={3}
          placeholder="Tell us more…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          onClick={() => onSubmit(rating, comment)}
          disabled={rating === 0}
          className="k-feedback-submit k-press"
        >
          Submit feedback
        </button>

        <div className="k-feedback-or">OR</div>

        <div className="k-feedback-actions">
          <button onClick={onHome} className="k-feedback-action k-press">
            <Home size={14} /> Home
          </button>
          <button onClick={onLogout} className="k-feedback-action k-press">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>
    </div>
  );
}
