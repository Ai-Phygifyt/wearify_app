"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Star, User, Clock, MapPin } from "lucide-react";

const MAROON = "#6E262B";
const KIOSK_IMAGES = ["/kiosk/img1.jpg", "/kiosk/img2.webp", "/kiosk/img3.webp", "/kiosk/img4.jpg"];
const pickImg = (i: number) => KIOSK_IMAGES[i % KIOSK_IMAGES.length];

export default function FeedbackPage() {
  const router = useRouter();
  const { customerId, phone } = useCustomer();

  const stores = useQuery(
    api.customers.listStoreLinksEnriched,
    customerId ? { customerId } : "skip"
  );
  const submitFeedback = useMutation(api.customers.submitFeedback);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function openRate(i: number) {
    setSelectedIdx(i);
    setRating(0);
    setComment("");
  }

  async function handleSubmit(store: any) {
    if (rating === 0 || !customerId || submitting) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        customerId,
        customerPhone: phone,
        storeId: store.storeId,
        rating,
        comment: comment.trim() || undefined,
        date: new Date().toISOString().split("T")[0],
      });
      setSelectedIdx(null);
    } catch {
      /* silently handle */
    }
    setSubmitting(false);
  }

  /* ── Header (shared) ───────────────────────────────────── */
  const Header = (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "#FFFFFF",
        padding: "calc(env(safe-area-inset-top,0px) + 14px) 16px 14px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <button
        onClick={() => (selectedIdx !== null ? setSelectedIdx(null) : router.back())}
        aria-label="Back"
        className="cx-press"
        style={{
          background: "none",
          border: "none",
          padding: 4,
          cursor: "pointer",
          display: "flex",
          color: "#2A2522",
        }}
      >
        <ChevronLeft size={24} strokeWidth={2.2} />
      </button>
      <h1
        style={{
          flex: 1,
          textAlign: "center",
          fontSize: 17,
          fontWeight: 700,
          color: "#2A2522",
          margin: 0,
          marginRight: 28,
        }}
      >
        Rate your visit
      </h1>
    </header>
  );

  const page = (children: React.ReactNode) => (
    <div
      style={{
        minHeight: "100%",
        background: "#FFFFFF",
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {Header}
      {children}
    </div>
  );

  /* ── Loading ───────────────────────────────────────────── */
  if (!customerId || stores === undefined) {
    return page(
      <div className="cx-loading" style={{ paddingTop: 80 }}>
        <div className="cx-typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const list = stores as any[];

  /* ── Empty state ───────────────────────────────────────── */
  if (list.length === 0) {
    return page(
      <div style={{ padding: "100px 22px 24px", display: "flex", justifyContent: "center" }}>
        <div
          className="cx-scaleIn"
          style={{
            width: "100%",
            maxWidth: 340,
            background: "#FFFFFF",
            border: "1px solid #F0E6E3",
            borderRadius: 22,
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            padding: "30px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#FCE4E8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/customer/rate-your-visit/no-visit.svg" alt="" style={{ width: 26, height: 26 }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2A2522" }}>No visits yet</div>
          <div style={{ fontSize: 13, color: "#9A8F8A", marginTop: 8, lineHeight: 1.5 }}>
            Once you&apos;ve visited a Wearify store, you&apos;ll be able to rate your experience here.
          </div>
          <button
            onClick={() => router.push("/c/me")}
            className="cx-press"
            style={{
              marginTop: 22,
              width: "100%",
              height: 50,
              borderRadius: 99,
              border: "1.5px solid #E8E0DD",
              background: "#fff",
              color: "#2A2522",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Back to profile
          </button>
        </div>
      </div>
    );
  }

  /* ── Rate detail ───────────────────────────────────────── */
  if (selectedIdx !== null && list[selectedIdx]) {
    const store = list[selectedIdx];
    const city = [store.storeCity, store.storeState].filter(Boolean).join(", ");
    return page(
      <div style={{ padding: "18px 16px 32px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1C1714", margin: "0 0 16px" }}>
          Rate {store.storeName}
        </h2>

        {/* Store info card */}
        <div
          style={{
            display: "flex",
            gap: 14,
            background: "#FFFFFF",
            border: "1px solid #F0E6E3",
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: 12,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 12,
              flexShrink: 0,
              backgroundImage: `url(${pickImg(selectedIdx)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5, justifyContent: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2A2522" }}>{store.storeName}</div>
            {city && (
              <DetailRow
                icon={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/customer/rate-your-visit/location.svg" alt="" style={{ width: 13, height: 13 }} />
                }
                text={city}
                strong
              />
            )}
            <DetailRow icon={<User size={12} color="#A99F9A" />} text={`${store.visits ?? 0} visits`} extra={store.lastVisit ? `Last: ${store.lastVisit}` : undefined} extraIcon={<Clock size={12} color="#A99F9A" />} />
            {store.storeAddress && <DetailRow icon={<MapPin size={12} color="#A99F9A" />} text={store.storeAddress} />}
            {store.storeHours && <DetailRow icon={<Clock size={12} color="#A99F9A" />} text={store.storeHours} />}
          </div>
        </div>

        {/* Feedback card */}
        <div
          style={{
            border: "1px solid #ECE4E1",
            borderRadius: 18,
            padding: "22px 18px",
          }}
        >
          <div style={{ textAlign: "center", fontSize: 22, fontWeight: 800, color: "#243447" }}>
            Wearify feedback
          </div>
          <div style={{ textAlign: "center", fontSize: 14, color: "#6B7280", marginTop: 4 }}>
            Please rate your experience below
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "18px 0 6px" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="cx-press"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}
                >
                  <Star
                    size={30}
                    color="#F5A623"
                    fill={s <= rating ? "#F5A623" : "transparent"}
                    strokeWidth={1.6}
                  />
                </button>
              ))}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#2A2522" }}>{rating}/5 stars</span>
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, color: "#2A2522", margin: "18px 0 8px" }}>
            Additional feedback
          </div>
          <textarea
            placeholder="My feedback!!"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #DDD4D0",
              background: "#FFFFFF",
              fontSize: 14,
              fontFamily: "inherit",
              color: "#2A2522",
              outline: "none",
              resize: "none",
              lineHeight: 1.5,
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={() => handleSubmit(store)}
            disabled={rating === 0 || submitting}
            className="cx-press"
            style={{
              width: "100%",
              height: 52,
              marginTop: 16,
              borderRadius: 10,
              background: MAROON,
              border: "none",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: rating === 0 || submitting ? "default" : "pointer",
              opacity: rating === 0 || submitting ? 0.6 : 1,
              transition: "opacity .2s",
            }}
          >
            {submitting ? "Submitting…" : "Submit feedback"}
          </button>
        </div>
      </div>
    );
  }

  /* ── Visit list ────────────────────────────────────────── */
  return page(
    <div style={{ padding: "16px 16px 28px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1C1714", margin: "0 0 16px" }}>
        {list.length} Wearify Store
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((store, i) => {
          const city = [store.storeCity, store.storeState].filter(Boolean).join(", ") || store.storeCity;
          return (
            <button
              key={String(store._id)}
              onClick={() => openRate(i)}
              className="cx-press"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                background: "#FFFFFF",
                border: "1px solid #F0E6E3",
                borderRadius: 14,
                boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
                padding: 12,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  flexShrink: 0,
                  backgroundImage: `url(${pickImg(i)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#2A2522" }}>{store.storeName}</div>
                {store.lastVisit && (
                  <div style={{ fontSize: 12, color: "#9A8F8A" }}>{store.lastVisit}</div>
                )}
                {city && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: MAROON, fontWeight: 600 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/customer/rate-your-visit/location.svg" alt="" style={{ width: 12, height: 12 }} />
                    {city}
                  </div>
                )}
              </div>
              <ChevronRight size={20} color="#C4B8B3" strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  text,
  strong,
  extra,
  extraIcon,
}: {
  icon: React.ReactNode;
  text: string;
  strong?: boolean;
  extra?: string;
  extraIcon?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: strong ? MAROON : "#9A8F8A", flexWrap: "wrap" }}>
      <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontWeight: strong ? 700 : 400 }}>{text}</span>
      {extra && (
        <>
          <span style={{ display: "flex", flexShrink: 0, marginLeft: 6 }}>{extraIcon}</span>
          <span>{extra}</span>
        </>
      )}
    </div>
  );
}
