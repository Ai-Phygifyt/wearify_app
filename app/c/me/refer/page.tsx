"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { makeCode } from "./referralCode";

const MAROON = "#6E262B";

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 56,
  padding: "0 16px",
  borderRadius: 12,
  border: "1.5px solid rgba(104,38,42,0.16)",
  background: "#fff",
  fontSize: 15,
  fontFamily: "inherit",
  color: "#2A2522",
  outline: "none",
  boxSizing: "border-box",
};

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

  if (!customerId) {
    return (
      <div className="cx-loading">
        <div className="cx-typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const code = makeCode(customerId);
  const link = `https://wearify.app/register?inviteCode=${code}`;
  const WHATSAPP_MSG = encodeURIComponent(
    `Hey! Shop at any Wearify-powered store and we both get ₹500 credit. Use my code ${code} or sign up here: ${link}`
  );

  function handleSubmit() {
    if (!customerId || !friendName.trim() || !friendPhone.trim()) return;
    // Fire the referral, then immediately open the code / QR page.
    createReferral({
      referrerId: customerId,
      referrerPhone: phone || "",
      referredName: friendName.trim(),
      referredPhone: friendPhone.trim(),
      status: "Pending",
      date: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }).catch(() => {
      /* silently handle */
    });
    router.push("/c/me/refer/code");
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "Rewarded":
        return { bg: "#E3F4E8", color: "#1E7A3D" };
      case "Visited":
        return { bg: "#FAF1DD", color: "#7A5A08" };
      default:
        return { bg: "#F4ECE9", color: "#9A8F8A" };
    }
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#FFFFFF",
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* ── APP BAR ───────────────────────────────────────── */}
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
          onClick={() => router.back()}
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
            fontSize: 15,
            fontWeight: 700,
            color: "#2A2522",
            letterSpacing: "0.06em",
            margin: 0,
            marginRight: 28,
          }}
        >
          REFER A FRIENDS
        </h1>
      </header>

      <div style={{ padding: "18px 16px 32px" }}>
        {/* Heading */}
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#1C1714",
            margin: "0 0 16px",
            letterSpacing: "-0.01em",
          }}
        >
          Invite Friends
        </h2>

        {/* Reward banner */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/customer/refer-friend/card-1.svg"
          alt="Earn ₹500 per referral"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            margin: "0 auto 26px",
          }}
        />

        {/* ── Send a referral ─────────────────────────────── */}
        <div style={{ fontSize: 19, fontWeight: 700, color: "#1C1714", marginBottom: 14 }}>
          Send a referral
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Friend's name"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="tel"
            placeholder="Friend's phone number"
            value={friendPhone}
            onChange={(e) => setFriendPhone(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!friendName.trim() || !friendPhone.trim()}
          className="cx-press"
          style={{
            width: "100%",
            height: 56,
            borderRadius: 12,
            background: MAROON,
            border: "none",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor:
              !friendName.trim() || !friendPhone.trim() ? "default" : "pointer",
            opacity: !friendName.trim() || !friendPhone.trim() ? 0.6 : 1,
            transition: "opacity .2s",
            marginBottom: 12,
          }}
        >
          Send Referral
        </button>

        <button
          onClick={() => window.open(`https://wa.me/?text=${WHATSAPP_MSG}`, "_blank")}
          className="cx-press"
          style={{
            width: "100%",
            height: 56,
            borderRadius: 12,
            background: "#42C152",
            border: "none",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/customer/refer-friend/whatsapp.svg"
            alt=""
            style={{ width: 24, height: 24 }}
          />
          Share to WhatsApp
        </button>

        {/* ── Referral history ────────────────────────────── */}
        <div style={{ marginTop: 26 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#1C1714", marginBottom: 14 }}>
            Referral History
          </div>

          {referrals === undefined ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{ height: 56, borderRadius: 12, background: "#F4ECE9" }}
                />
              ))}
            </div>
          ) : referrals.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "28px 0",
                fontSize: 13,
                color: "#9A8F8A",
              }}
            >
              No referrals yet. Send one to get started!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {referrals.map((ref: Record<string, unknown>) => {
                const sc = statusColor(ref.status as string);
                return (
                  <div
                    key={ref._id as string}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 14,
                      border: "1px solid #F0E6E3",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#2A2522" }}>
                        {ref.referredName as string}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#9A8F8A", marginTop: 2 }}>
                        {ref.date as string}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {ref.reward !== undefined && (ref.reward as number) > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#B8860B" }}>
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
