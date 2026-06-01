"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

const FONT_STACK = '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif';

export default function CustomerWelcomePage() {
  const router = useRouter();

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100svh",
        width: "100%",
        overflow: "hidden",
        background: "#FFFFFF",
        fontFamily: FONT_STACK,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Soft coral-pink glows — top-right + bottom-left */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(150% 95% at 100% 0%, rgba(240,158,146,0.78) 0%, rgba(244,180,170,0.45) 30%, rgba(248,212,205,0.18) 52%, rgba(255,255,255,0) 72%)," +
            "radial-gradient(150% 95% at 0% 100%, rgba(241,162,150,0.74) 0%, rgba(244,184,174,0.42) 30%, rgba(248,212,205,0.16) 52%, rgba(255,255,255,0) 72%)",
        }}
      />

      {/* Top bar */}
      <header
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "calc(env(safe-area-inset-top, 0px) + 16px) 22px 0",
        }}
      >
        <span
          style={{
            fontSize: 21,
            fontWeight: 700,
            color: "#68262A",
            letterSpacing: "0.01em",
          }}
        >
          Wearify
        </span>

        <button
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "#FFFFFF",
            border: "1px solid rgba(104,38,42,0.18)",
            borderRadius: 999,
            padding: "7px 13px",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 600,
            color: "#3A2B28",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(104,38,42,0.08)",
          }}
        >
          Eng <ChevronDown size={15} strokeWidth={2.2} />
        </button>
      </header>

      {/* Main content */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 28px",
          textAlign: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/customer/third-screen/image.svg"
          alt="Saree virtual try-on preview"
          style={{
            width: "min(78vw, 320px)",
            height: "auto",
            display: "block",
            marginBottom: 26,
          }}
        />

        <h1
          style={{
            fontSize: 29,
            fontWeight: 500,
            color: "#3A2B28",
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: "0.01em",
          }}
        >
          Find Your Perfect Look
        </h1>

        <p
          style={{
            fontSize: 14,
            fontStyle: "italic",
            color: "#8C4A46",
            margin: "12px 0 0",
            lineHeight: 1.5,
            maxWidth: 300,
          }}
        >
          &ldquo;Explore Bridal, Festive, And Designer Sarees In Real-Time.&rdquo;
        </p>
      </main>

      {/* Footer — CTA + login */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          padding: "0 0 calc(env(safe-area-inset-bottom, 0px) + 18px)",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/c/register")}
          aria-label="Let's Get Started"
          style={{
            display: "block",
            width: "100%",
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
            lineHeight: 0,
          }}
          className="cx-press"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/customer/third-screen/button.svg"
            alt=""
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </button>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <span style={{ fontSize: 13, color: "#5C4A46" }}>
            Already have an account?{" "}
          </span>
          <button
            type="button"
            onClick={() => router.push("/c/login")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              color: "#68262A",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Login
          </button>
        </div>
      </footer>
    </div>
  );
}
