"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: 24,
        background: "var(--cx-grad-hero, #FDF8F2)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 22,
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid rgba(184,134,11,0.65)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WifiOff size={36} color="#C9941A" />
      </div>
      <div
        className="cx-serif"
        style={{
          fontSize: 28,
          fontWeight: 700,
          fontStyle: "italic",
          color: "#FBF7F1",
        }}
      >
        You&apos;re offline
      </div>
      <div
        style={{
          fontSize: 14,
          color: "rgba(253,248,240,0.7)",
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        Reconnect to load fresh looks, your wardrobe, and the latest from your stores.
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 12,
          padding: "10px 24px",
          borderRadius: 999,
          border: "1.5px solid rgba(184,134,11,0.65)",
          background: "transparent",
          color: "#C9941A",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
