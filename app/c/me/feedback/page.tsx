"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { Btn, PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

const QUICK_CHIPS = [
  "Loved it",
  "Great staff",
  "Beautiful collection",
  "Easy to use",
  "Need more variety",
];

export default function FeedbackPage() {
  const router = useRouter();
  const { customerId, phone } = useCustomer();

  const submitFeedback = useMutation(api.customers.submitFeedback);

  const [rating, setRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function toggleChip(chip: string) {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter((c) => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  }

  async function handleSubmit() {
    if (rating === 0) return;
    if (!customerId) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        customerId,
        customerPhone: phone,
        storeId: "general",
        rating,
        chips: selectedChips.length > 0 ? selectedChips : undefined,
        comment: comment.trim() || undefined,
        date: new Date().toISOString().split("T")[0],
      });
      setSubmitted(true);
    } catch {
      // handle error silently
    }
    setSubmitting(false);
  }

  if (!customerId) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  if (submitted) {
    const referralUrl = `https://wa.me/?text=${encodeURIComponent(
      "I just had an amazing experience with Wearify virtual try-on! You should try it too!"
    )}`;

    return (
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.back()}
            className="text-wf-primary text-lg cursor-pointer"
          >
            {"\u2190"}
          </button>
          <h1 className="text-lg font-bold text-wf-text">Feedback</h1>
        </div>

        <div className="text-center py-8">
          <div className="text-4xl mb-3">{"\u2713"}</div>
          <div className="text-lg font-bold text-wf-text">Thank You!</div>
          <div className="text-sm text-wf-muted mt-1">
            Your feedback helps us improve
          </div>

          {rating >= 4 && (
            <div className="mt-6 bg-wf-card rounded-xl border border-wf-border p-4">
              <div className="text-sm font-bold text-wf-text mb-2">
                Loved your experience?
              </div>
              <div className="text-xs text-wf-muted mb-3">
                Recommend Wearify to a friend!
              </div>
              <Btn
                primary
                onClick={() => window.open(referralUrl, "_blank")}
                className="w-full"
              >
                Share on WhatsApp
              </Btn>
            </div>
          )}

          <Btn
            onClick={() => router.push("/c/me")}
            className="mt-4 w-full"
          >
            Back to Profile
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="text-wf-primary text-lg cursor-pointer"
        >
          {"\u2190"}
        </button>
        <h1 className="text-lg font-bold text-wf-text">Feedback</h1>
      </div>

      {/* Star rating */}
      <div className="mb-6">
        <div className="text-sm font-bold text-wf-text mb-3">
          How was your experience?
        </div>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="text-3xl cursor-pointer transition-transform hover:scale-110"
            >
              <span
                className={
                  star <= rating ? "text-wf-amber" : "text-wf-border"
                }
              >
                {star <= rating ? "\u2605" : "\u2606"}
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <div className="text-center text-xs text-wf-muted mt-2">
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

      {/* Quick chips */}
      <div className="mb-5">
        <div className="text-sm font-bold text-wf-text mb-2">Quick Tags</div>
        <div className="flex flex-wrap gap-2">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => toggleChip(chip)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                selectedChips.includes(chip)
                  ? "bg-wf-primary text-white"
                  : "bg-wf-bg border border-wf-border text-wf-subtext"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-5">
        <div className="text-sm font-bold text-wf-text mb-2">
          Tell us more (optional)
        </div>
        <textarea
          placeholder="Share your detailed feedback..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full bg-wf-bg border border-wf-border rounded-lg px-3 py-2.5 text-sm text-wf-text outline-none focus:border-wf-primary resize-none"
        />
      </div>

      <Btn
        primary
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="w-full"
      >
        {submitting ? "Submitting..." : "Submit Feedback"}
      </Btn>
    </div>
  );
}
