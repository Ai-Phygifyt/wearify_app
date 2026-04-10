"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";

export default function ReferPage() {
  const router = useRouter();
  const { customerId, phone } = useCustomer();

  const referrals = useQuery(
    api.customers.listReferrals,
    customerId ? { referrerId: customerId } : "skip"
  );
  const createReferral = useMutation(api.customers.createReferral);

  const [friendName, setFriendName] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!customerId || !friendName.trim() || !friendPhone.trim()) return;
    setSending(true);
    try {
      await createReferral({
        referrerId: customerId,
        referrerPhone: phone || "",
        referredName: friendName.trim(),
        referredPhone: friendPhone.trim(),
        status: "Pending",
        date: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
      });
      setFriendName("");
      setFriendPhone("");
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch {
      /* silently handle */
    }
    setSending(false);
  }

  const WHATSAPP_MSG = encodeURIComponent(
    "Hey! I shop for sarees on Wearify and the virtual try-on is amazing. You should try it too! Use my referral and we both get \u20B9500 credit."
  );

  if (!customerId) {
    return (
      <div
        className="cx-pageIn"
        style={{
          minHeight: "100%",
          background: "#FDF8F0",
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

  const statusColor = (status: string) => {
    switch (status) {
      case "Rewarded":
        return { bg: "#E8F5E9", color: "#1B5E20" };
      case "Visited":
        return { bg: "#FDF5E4", color: "#8B6914" };
      default:
        return { bg: "#F4EFF9", color: "#8B7EA0" };
    }
  };

  return (
    <div
      className="cx-pageIn"
      style={{ minHeight: "100%", background: "#FDF8F0" }}
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
              stroke="#FDF8F0"
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
              color: "#FDF8F0",
              margin: 0,
            }}
          >
            Refer a Friend
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(253,248,240,.55)",
              margin: "4px 0 0",
            }}
          >
            Share the joy, earn rewards
          </p>
        </div>
      </div>
      <div className="cx-zari" />

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ padding: "20px 18px 32px" }}>
        {/* Reward card */}
        <div
          className="cx-slideUp cx-d1 cx-silk"
          style={{
            background:
              "linear-gradient(135deg, #C9941A 0%, #E8C46A 55%, #C9941A 100%)",
            borderRadius: 20,
            padding: "22px 20px",
            marginBottom: 20,
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          <div
            className="cx-serif"
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#1A0A2E",
              fontStyle: "italic",
            }}
          >
            Earn {"\u20B9"}500 per referral
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(26,10,46,.6)",
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            Invite a friend to any Wearify-powered store.
            <br />
            You both get {"\u20B9"}500 Wearify credit!
          </div>
        </div>

        {/* Referral form */}
        <div className="cx-slideUp cx-d2" style={{ marginBottom: 20 }}>
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1A0A1E",
              fontStyle: "italic",
              marginBottom: 12,
            }}
          >
            Send a Referral
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <input
              type="text"
              placeholder="Friend's name"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 16,
                border: "1px solid #E8D5E0",
                background: "#FFFFFF",
                fontSize: 14,
                color: "#1A0A1E",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <input
              type="tel"
              placeholder="Friend's phone number"
              value={friendPhone}
              onChange={(e) => setFriendPhone(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 16,
                border: "1px solid #E8D5E0",
                background: "#FFFFFF",
                fontSize: 14,
                color: "#1A0A1E",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={sending || !friendName.trim() || !friendPhone.trim()}
              className="cx-press"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 100,
                background: "linear-gradient(135deg, #2D1B4E 0%, #4A2D6E 100%)",
                border: "none",
                color: "#FDF8F0",
                fontSize: 15,
                fontWeight: 700,
                cursor:
                  sending || !friendName.trim() || !friendPhone.trim()
                    ? "default"
                    : "pointer",
                opacity:
                  sending || !friendName.trim() || !friendPhone.trim()
                    ? 0.6
                    : 1,
                transition: "opacity .2s",
              }}
            >
              {sending ? "Sending..." : "Send Referral"}
            </button>
          </div>

          {sent && (
            <div
              className="cx-scaleIn"
              style={{
                marginTop: 10,
                padding: "10px 16px",
                borderRadius: 12,
                background: "#E8F5E9",
                border: "1px solid rgba(27,94,32,.15)",
                textAlign: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "#1B5E20",
              }}
            >
              Referral sent successfully!
            </div>
          )}
        </div>

        {/* WhatsApp share */}
        <div className="cx-slideUp cx-d3" style={{ marginBottom: 24 }}>
          <button
            onClick={() =>
              window.open(`https://wa.me/?text=${WHATSAPP_MSG}`, "_blank")
            }
            className="cx-press"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 100,
              background: "linear-gradient(135deg, #1A3A2A, #25D366)",
              border: "1px solid #25D366",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg width={17} height={17} viewBox="0 0 24 24" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 0C5.495 0 .16 5.335.157 11.892a11.8 11.8 0 0 0 1.588 5.945L0 24l6.304-1.654a11.9 11.9 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.892-11.893A11.82 11.82 0 0 0 20.397 3.48 11.82 11.82 0 0 0 12.05 0Z" />
            </svg>
            Share on WhatsApp
          </button>
        </div>

        {/* Referral list */}
        <div className="cx-slideUp cx-d4">
          <div
            className="cx-serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1A0A1E",
              fontStyle: "italic",
              marginBottom: 12,
            }}
          >
            Referral History
          </div>

          {referrals === undefined ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 56,
                    borderRadius: 12,
                    background: "#F2E8EE",
                  }}
                />
              ))}
            </div>
          ) : referrals.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                fontSize: 13,
                color: "#8B7EA0",
              }}
            >
              No referrals yet. Share your link to get started!
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {referrals.map((ref: Record<string, unknown>) => {
                const sc = statusColor(ref.status as string);
                return (
                  <div
                    key={ref._id as string}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 14,
                      border: "1px solid #F2E8EE",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "0 2px 14px rgba(45,27,78,.09)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1A0A1E",
                        }}
                      >
                        {ref.referredName as string}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#8B7EA0",
                          marginTop: 2,
                        }}
                      >
                        {ref.date as string}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {ref.reward !== undefined &&
                        (ref.reward as number) > 0 && (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#C9941A",
                            }}
                          >
                            +{ref.reward as number} pts
                          </span>
                        )}
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 100,
                          background: sc.bg,
                          color: sc.color,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {ref.status as string}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
