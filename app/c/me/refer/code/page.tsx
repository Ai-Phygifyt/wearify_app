"use client";

import React, { useState } from "react";
import { useCustomer } from "../../../layout";
import { useRouter } from "next/navigation";
import { ChevronLeft, QrCode, Copy, Check } from "lucide-react";
import { makeCode } from "../referralCode";

const MAROON = "#6E262B";

export default function ReferCodePage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

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

  async function copy(value: string, which: "code" | "link") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

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
          src="/customer/refer-friend/card-2.svg"
          alt="Earn ₹500 per referral"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            margin: "0 auto 28px",
          }}
        />

        {/* ── Referral code ───────────────────────────────── */}
        <SectionTitle>Your Referral Code</SectionTitle>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
          <button
            onClick={() => copy(code, "code")}
            className="cx-press"
            style={{
              minWidth: 230,
              padding: "16px 32px",
              borderRadius: 12,
              border: "1.5px solid rgba(104,38,42,0.18)",
              background: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "0.14em",
                color: MAROON,
              }}
            >
              {code}
            </span>
            {copied === "code" ? (
              <Check size={18} color="#1E7A3D" strokeWidth={2.6} />
            ) : (
              <Copy size={17} color="#9A8F8A" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* ── QR code ─────────────────────────────────────── */}
        <SectionTitle>Your QR Code</SectionTitle>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 28,
              background: "#68262A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 26px rgba(104,38,42,0.22)",
            }}
          >
            <QrCode size={146} color="#F5ECD7" strokeWidth={1.4} />
          </div>
        </div>

        {/* ── Referral link ───────────────────────────────── */}
        <SectionTitle>Your Referral Link</SectionTitle>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1.5px solid rgba(104,38,42,0.16)",
            borderRadius: 99,
            padding: "10px 10px 10px 18px",
          }}
        >
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 13.5,
              color: "#5A4F48",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {link}
          </span>
          <button
            onClick={() => copy(link, "link")}
            aria-label="Copy link"
            className="cx-press"
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: copied === "link" ? "#E3F4E8" : "#F4ECE9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {copied === "link" ? (
              <Check size={18} color="#1E7A3D" strokeWidth={2.6} />
            ) : (
              <Copy size={17} color="#5A4F48" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 19,
        fontWeight: 700,
        color: "#1C1714",
        textAlign: "center",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}
