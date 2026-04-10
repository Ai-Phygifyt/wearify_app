"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "en", native: "English", english: "English" },
  { code: "hi", native: "\u0939\u093F\u0928\u094D\u0926\u0940", english: "Hindi" },
  { code: "mr", native: "\u092E\u0930\u093E\u0920\u0940", english: "Marathi" },
  { code: "kn", native: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1", english: "Kannada" },
  { code: "ta", native: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD", english: "Tamil" },
  { code: "te", native: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41", english: "Telugu" },
  { code: "bn", native: "\u09AC\u09BE\u0982\u09B2\u09BE", english: "Bengali" },
  { code: "gu", native: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0", english: "Gujarati" },
  { code: "ml", native: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02", english: "Malayalam" },
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
    if (customer?.language) {
      setSelected(customer.language);
    }
  }, [customer]);

  async function handleSelect(code: string) {
    if (!customerId || code === selected) return;
    setSelected(code);
    setSaving(true);
    await updateProfile({
      customerId,
      language: code,
    });
    setSaving(false);
  }

  if (!customerId || customer === undefined) {
    return (
      <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  return (
    <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0" }}>
      {/* Hero */}
      <div
        className="cx-noise cx-paisley"
        style={{
          background: "linear-gradient(155deg, #0D0418 0%, #1A0A2E 25%, #2D1B4E 55%, #6B1D52 80%, #C9941A 100%)",
          padding: "28px 18px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => router.back()}
              className="cx-press"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(253,248,240,.12)",
                border: "1px solid rgba(253,248,240,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FDF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <h1 className="cx-serif" style={{ fontSize: 22, fontWeight: 700, color: "#FDF8F0", fontStyle: "italic", margin: 0 }}>
                Language
              </h1>
              <div style={{ fontSize: 12, color: "rgba(253,248,240,.5)", marginTop: 2 }}>
                Choose your preferred language
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="cx-zari" />

      {/* Content */}
      <div style={{ padding: "20px 16px 32px" }}>
        {/* Language list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {LANGUAGES.map((lang, i) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`cx-press cx-slideUp cx-d${Math.min(i + 1, 6)}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: isSelected ? "#F4EFF9" : "#FFFFFF",
                  border: isSelected ? "1.5px solid #2D1B4E" : "1px solid #F2E8EE",
                  cursor: saving ? "not-allowed" : "pointer",
                  textAlign: "left",
                  boxShadow: isSelected ? "0 2px 14px rgba(45,27,78,.09)" : "none",
                  transition: "all .2s",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: isSelected ? "#2D1B4E" : "#1A0A1E",
                  }}>
                    {lang.native}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: isSelected ? "#4A2D6E" : "#8B7EA0",
                    fontWeight: 500,
                  }}>
                    {lang.english}
                  </div>
                </div>
                {isSelected && (
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(201,148,26,.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <polyline points="20 6 9 17 4 12" stroke="#C9941A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="cx-zari" style={{ margin: "24px 0" }} />

        {/* Note */}
        <div className="cx-slideUp cx-d4" style={{
          borderRadius: 14,
          background: "#FDF5E4",
          border: "1px solid rgba(201,148,26,.18)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10" stroke="#8B6914" strokeWidth="1.6" />
            <line x1="12" y1="16" x2="12" y2="12" stroke="#8B6914" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="#8B6914" />
          </svg>
          <div style={{ fontSize: 12, color: "#8B6914", lineHeight: 1.55 }}>
            Changes apply to WhatsApp messages and the Wearify interface.
          </div>
        </div>
      </div>
    </div>
  );
}
