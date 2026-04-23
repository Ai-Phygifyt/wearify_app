"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

const QUICK_CHIPS = [
  "Great Service",
  "Beautiful Collection",
  "Quick Try-On",
  "Friendly Staff",
  "Clean Store",
  "Good Lighting",
];

export default function FeedbackPage() {
  const router = useRouter();
  const { customerId, phone } = useCustomer();

  const submitFeedback = useMutation(api.customers.submitFeedback);

  // Target the most-recent visit. Without this the submit has no real
  // store to attribute to (was hardcoded "general", which no store
  // surface reads — so the feedback effectively went nowhere).
  const lastVisit = useQuery(
    api.customers.getLastVisit,
    customerId ? { customerId } : "skip"
  );

  const [rating, setRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function toggleChip(chip: string) {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  }

  async function handleSubmit() {
    if (rating === 0 || !customerId || !lastVisit) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        customerId,
        customerPhone: phone,
        storeId: lastVisit.storeId,
        sessionId: lastVisit.sessionId,
        rating,
        chips: selectedChips.length > 0 ? selectedChips : undefined,
        comment: comment.trim() || undefined,
        date: new Date().toISOString().split("T")[0],
      });
      setSubmitted(true);
    } catch {
      /* silently handle */
    }
    setSubmitting(false);
  }

  if (!customerId || lastVisit === undefined) {
    return (
      <div
        className="cx-pageIn"
        style={{
          minHeight: "100%",
          background: "#FBF7F1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="cx-typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  /* ── No visits yet ──────────────────────────────────── */
  if (lastVisit === null) {
    return (
      <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FBF7F1" }}>
        <div
          className="cx-noise cx-paisley"
          style={{
            background: "var(--cx-grad-hero)",
            padding: "28px 18px 22px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <button
              onClick={() => router.back()}
              className="cx-press"
              style={{
                background: "rgba(253,248,240,.12)",
                border: "1px solid rgba(253,248,240,.18)",
                borderRadius: 100,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginBottom: 14,
              }}
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FBF7F1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1
              className="cx-serif"
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontStyle: "italic",
                color: "#FBF7F1",
                margin: 0,
              }}
            >
              Feedback
            </h1>
          </div>
        </div>
        <div className="cx-zari" />

        <div
          className="cx-scaleIn"
          style={{ textAlign: "center", padding: "56px 24px" }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#F5E6E3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Star size={30} color="#B8860B" strokeWidth={1.6} />
          </div>
          <div
            className="cx-serif"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#1C1108",
              fontStyle: "italic",
            }}
          >
            No visits yet
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#9C8878",
              marginTop: 8,
              lineHeight: 1.5,
              maxWidth: 280,
              margin: "8px auto 0",
            }}
          >
            Once you&apos;ve visited a Wearify store, you&apos;ll be able to rate your experience here.
          </div>

          <button
            onClick={() => router.push("/c/me")}
            className="cx-press"
            style={{
              marginTop: 28,
              width: "100%",
              padding: "14px",
              borderRadius: 100,
              background: "var(--cx-grad-primary)",
              border: "none",
              color: "#FBF7F1",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  /* ── Success state ──────────────────────────────────── */
  if (submitted) {
    return (
      <div
        className="cx-pageIn"
        style={{ minHeight: "100%", background: "#FBF7F1" }}
      >
        {/* Hero */}
        <div
          className="cx-noise cx-paisley"
          style={{
            background: "var(--cx-grad-hero)",
            padding: "28px 18px 22px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <button
              onClick={() => router.back()}
              className="cx-press"
              style={{
                background: "rgba(253,248,240,.12)",
                border: "1px solid rgba(253,248,240,.18)",
                borderRadius: 100,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginBottom: 14,
              }}
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FBF7F1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1
              className="cx-serif"
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontStyle: "italic",
                color: "#FBF7F1",
                margin: 0,
              }}
            >
              Feedback
            </h1>
          </div>
        </div>
        <div className="cx-zari" />

        {/* Thank you */}
        <div
          className="cx-scaleIn"
          style={{ textAlign: "center", padding: "56px 24px" }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#E8F5E9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1B5E20"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div
            className="cx-serif"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#1C1108",
              fontStyle: "italic",
            }}
          >
            Thank you!
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#9C8878",
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            Your feedback helps us improve
          </div>

          <button
            onClick={() => router.push("/c/me")}
            className="cx-press"
            style={{
              marginTop: 28,
              width: "100%",
              padding: "14px",
              borderRadius: 100,
              background: "var(--cx-grad-primary)",
              border: "none",
              color: "#FBF7F1",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  /* ── Main form ──────────────────────────────────────── */
  return (
    <div
      className="cx-pageIn"
      style={{ minHeight: "100%", background: "#FBF7F1" }}
    >
      {/* ── Hero ────────────────────────────────────────── */}
      <div
        className="cx-noise cx-paisley"
        style={{
          background: "var(--cx-grad-hero)",
          padding: "28px 18px 22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <button
            onClick={() => router.back()}
            className="cx-press"
            style={{
              background: "rgba(253,248,240,.12)",
              border: "1px solid rgba(253,248,240,.18)",
              borderRadius: 100,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FBF7F1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1
            className="cx-serif"
            style={{
              fontSize: 26,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#FBF7F1",
              margin: 0,
            }}
          >
            Rate Your Visit
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(253,248,240,.7)",
              margin: "4px 0 0",
            }}
          >
            {lastVisit.storeName
              ? `How was ${lastVisit.storeName}?`
              : "How was your last visit?"}
            {lastVisit.date && (
              <span
                className="cx-mono"
                style={{ color: "rgba(253,248,240,.5)", marginLeft: 6 }}
              >
                · {lastVisit.date}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="cx-zari" />

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ padding: "24px 18px 32px" }}>
        {/* Star rating */}
        <div className="cx-slideUp cx-d1" style={{ marginBottom: 28 }}>
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1C1108",
              fontStyle: "italic",
              marginBottom: 14,
              textAlign: "center",
            }}
          >
            How was your experience?
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="cx-press"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 28,
                  lineHeight: 1,
                  color: star <= rating ? "#B8860B" : "#E4D9CC",
                  transition: "color .15s, transform .15s",
                  padding: 4,
                }}
              >
                <Star size={32} fill={star <= rating ? "var(--cx-gold)" : "transparent"} strokeWidth={1.6} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#9C8878",
                marginTop: 8,
              }}
            >
              {rating === 5
                ? "Excellent!"
                : rating === 4
                  ? "Great!"
                  : rating === 3
                    ? "Good"
                    : rating === 2
                      ? "Fair"
                      : "Poor"}
            </div>
          )}
        </div>

        {/* Quick feedback chips */}
        <div className="cx-slideUp cx-d2" style={{ marginBottom: 24 }}>
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1C1108",
              fontStyle: "italic",
              marginBottom: 10,
            }}
          >
            Quick Feedback
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {QUICK_CHIPS.map((chip) => {
              const active = selectedChips.includes(chip);
              return (
                <button
                  key={chip}
                  onClick={() => toggleChip(chip)}
                  className="cx-press"
                  style={{
                    padding: "7px 16px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: active ? "none" : "1px solid #E4D9CC",
                    background: active
                      ? "var(--cx-grad-primary)"
                      : "#F5E6E3",
                    color: active ? "#FBF7F1" : "#3D2E1E",
                    transition: "all .2s",
                  }}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment */}
        <div className="cx-slideUp cx-d3" style={{ marginBottom: 28 }}>
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1C1108",
              fontStyle: "italic",
              marginBottom: 10,
            }}
          >
            Tell us more{" "}
            <span style={{ fontWeight: 400, color: "#9C8878" }}>
              (optional)
            </span>
          </div>
          <textarea
            placeholder="Share your detailed feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 16,
              border: "1px solid #E4D9CC",
              background: "#FFFFFF",
              fontSize: 14,
              color: "#1C1108",
              outline: "none",
              resize: "none",
              lineHeight: 1.55,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="cx-press"
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 100,
            background:
              rating === 0
                ? "#E4D9CC"
                : "var(--cx-grad-primary)",
            border: "none",
            color: rating === 0 ? "#9C8878" : "#FBF7F1",
            fontSize: 15,
            fontWeight: 700,
            cursor: rating === 0 || submitting ? "default" : "pointer",
            opacity: submitting ? 0.7 : 1,
            transition: "opacity .2s, background .2s",
          }}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
