"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";

const MAROON = "#6E262B";

const LANGUAGES = [
  { code: "en", native: "English", english: "English" },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "mr", native: "मराठी", english: "Marathi" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "te", native: "తెలుగు", english: "Telugu" },
  { code: "bn", native: "বাংলা", english: "Bangali" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati" },
  { code: "ml", native: "മലയാളം", english: "Malayam" },
];

export default function LanguagePage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const customer = useQuery(
    api.customers.getById,
    customerId ? { customerId } : "skip"
  );
  const updateProfile = useMutation(api.customers.updateProfile);

  const [selected, setSelected] = useState("en");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer?.language) setSelected(customer.language);
  }, [customer]);

  async function handleSelect(code: string) {
    if (!customerId || code === selected) return;
    setSelected(code);
    setSaving(true);
    await updateProfile({ customerId, language: code });
    setSaving(false);
  }

  if (!customerId || customer === undefined) {
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
            fontSize: 17,
            fontWeight: 700,
            color: "#2A2522",
            margin: 0,
            marginRight: 28,
          }}
        >
          Language
        </h1>
      </header>

      {/* Language list */}
      <div style={{ padding: "16px 16px 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        {LANGUAGES.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              disabled={saving}
              className="cx-press"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderRadius: 12,
                background: isSelected ? MAROON : "#FFFFFF",
                border: isSelected ? "none" : "1.5px solid #E8E0DD",
                cursor: saving ? "default" : "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "background .2s",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: isSelected ? "#FFFFFF" : "#2A2522",
                  }}
                >
                  {lang.native}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: isSelected ? "rgba(255,255,255,0.72)" : "#9A8F8A",
                    fontWeight: 500,
                  }}
                >
                  {lang.english}
                </div>
              </div>
              {isSelected && (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.26)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={15} color="#FFFFFF" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
