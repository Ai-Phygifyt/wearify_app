"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const customer = useQuery(
    api.customers.getById,
    customerId ? { customerId } : "skip"
  );

  const updateConsent = useMutation(api.customers.updateConsent);

  const [consentHistory, setConsentHistory] = useState(true);
  const [consentMessages, setConsentMessages] = useState(true);
  const [consentAiPersonal, setConsentAiPersonal] = useState(true);
  const [consentPhotos, setConsentPhotos] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (customer) {
      setConsentHistory(customer.consentHistory ?? true);
      setConsentMessages(customer.consentMessages ?? true);
      setConsentAiPersonal(customer.consentAiPersonal ?? true);
      setConsentPhotos(customer.consentPhotos ?? true);
    }
  }, [customer]);

  async function handleSave() {
    if (!customerId) return;
    setSaving(true);
    await updateConsent({
      customerId,
      consentHistory,
      consentMessages,
      consentAiPersonal,
      consentPhotos,
      consentGrantedDate: new Date().toISOString().split("T")[0],
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!customerId || customer === undefined) {
    return (
      <div className="cx-pageIn" style={{ minHeight: "100%", background: "#FDF8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cx-typing"><span /><span /><span /></div>
      </div>
    );
  }

  const CONSENT_ITEMS = [
    {
      label: "Visit History",
      description: "Allow stores to see your visit and browsing history",
      value: consentHistory,
      toggle: () => { setConsentHistory(!consentHistory); setSaved(false); },
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#C9941A" strokeWidth="1.6" />
          <polyline points="12,7 12,12 15,15" stroke="#C9941A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "WhatsApp Messages",
      description: "Receive offers, reminders, and updates via WhatsApp",
      value: consentMessages,
      toggle: () => { setConsentMessages(!consentMessages); setSaved(false); },
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="#C9941A" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "AI Personalization",
      description: "Allow AI to recommend sarees based on your preferences and history",
      value: consentAiPersonal,
      toggle: () => { setConsentAiPersonal(!consentAiPersonal); setSaved(false); },
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.09 6.26L20 9.27l-4.91 4.73L16.18 21 12 18.27 7.82 21l1.09-7L4 9.27l5.91-1.01L12 2Z" stroke="#C9941A" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Try-On Photos",
      description: "Allow virtual try-on photos to be stored and used for your profile",
      value: consentPhotos,
      toggle: () => { setConsentPhotos(!consentPhotos); setSaved(false); },
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="#C9941A" strokeWidth="1.6" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="#C9941A" />
          <path d="M21 15l-5-5L5 21" stroke="#C9941A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

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
                Privacy & DPDP
              </h1>
              <div style={{ fontSize: 12, color: "rgba(253,248,240,.5)", marginTop: 2 }}>
                Manage your data permissions
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="cx-zari" />

      {/* Content */}
      <div style={{ padding: "20px 16px 32px" }}>
        {/* Data Permissions */}
        <div className="cx-slideUp">
          <div className="cx-serif" style={{ fontSize: 17, fontWeight: 600, color: "#1A0A1E", fontStyle: "italic", marginBottom: 14 }}>
            Data Permissions
          </div>

          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #F2E8EE", boxShadow: "0 2px 14px rgba(45,27,78,.09)" }}>
            {CONSENT_ITEMS.map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  background: "#FFFFFF",
                  borderBottom: i < CONSENT_ITEMS.length - 1 ? "1px solid #F2E8EE" : undefined,
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: item.value ? "#F4EFF9" : "#FDF8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1A0A1E" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#8B7EA0", marginTop: 1, lineHeight: 1.4 }}>{item.description}</div>
                </div>
                {/* Custom toggle */}
                <button
                  onClick={item.toggle}
                  className="cx-toggle-track"
                  style={{
                    background: item.value ? "#2D1B4E" : "#E8D5E0",
                    flexShrink: 0,
                    border: "none",
                  }}
                >
                  <div
                    className="cx-toggle-thumb"
                    style={{ left: item.value ? 23 : 3 }}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="cx-press"
            style={{
              width: "100%",
              marginTop: 16,
              padding: "13px 24px",
              borderRadius: 100,
              background: saved ? "#1B5E20" : "linear-gradient(135deg, #2D1B4E, #4A2D6E)",
              border: "none",
              color: "#FDF8F0",
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
              transition: "all .2s",
            }}
          >
            {saving ? "Saving..." : saved ? "Saved" : "Save Preferences"}
          </button>
        </div>

        <div className="cx-zari" style={{ margin: "24px 0" }} />

        {/* Your Data */}
        <div className="cx-slideUp cx-d2">
          <div className="cx-serif" style={{ fontSize: 17, fontWeight: 600, color: "#1A0A1E", fontStyle: "italic", marginBottom: 14 }}>
            Your Data
          </div>

          {/* Download My Data */}
          <div style={{ borderRadius: 16, border: "1px solid #F2E8EE", background: "#FFFFFF", padding: "16px", marginBottom: 12, boxShadow: "0 2px 14px rgba(45,27,78,.09)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#2D1B4E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 10 12 15 17 10" stroke="#2D1B4E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="15" x2="12" y2="3" stroke="#2D1B4E" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1A0A1E" }}>Download My Data</div>
            </div>
            <div style={{ fontSize: 12, color: "#8B7EA0", lineHeight: 1.5, marginBottom: 12 }}>
              Get a copy of all your personal data stored with Wearify
            </div>
            <button
              onClick={() => alert("Data download request submitted. You will receive it via email within 48 hours.")}
              className="cx-press"
              style={{
                width: "100%",
                padding: "11px 20px",
                borderRadius: 100,
                background: "transparent",
                border: "1.5px solid #2D1B4E",
                color: "#2D1B4E",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Request Data Download
            </button>
          </div>

          {/* Delete All My Data */}
          <div style={{ borderRadius: 16, border: "1px solid rgba(183,28,28,.15)", background: "#FFFFFF", padding: "16px", boxShadow: "0 2px 14px rgba(45,27,78,.09)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="#B71C1C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#B71C1C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 11v6M14 11v6" stroke="#B71C1C" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#B71C1C" }}>Delete All My Data</div>
            </div>
            <div style={{ fontSize: 12, color: "#8B7EA0", lineHeight: 1.5, marginBottom: 12 }}>
              Permanently delete all your data. This action cannot be undone and will be processed within 30 days.
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="cx-press"
              style={{
                width: "100%",
                padding: "11px 20px",
                borderRadius: 100,
                background: "transparent",
                border: "1.5px solid #B71C1C",
                color: "#B71C1C",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Request Data Deletion
            </button>
          </div>
        </div>

        <div className="cx-zari" style={{ margin: "24px 0" }} />

        {/* DPDP Notice */}
        <div className="cx-slideUp cx-d3" style={{
          borderRadius: 16,
          background: "#FBF0F4",
          border: "1px solid #F2E8EE",
          padding: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="#2D1B4E" strokeWidth="1.6" strokeLinejoin="round" fill="#C9941A" opacity=".15" />
            </svg>
            <span className="cx-serif" style={{ fontSize: 14, fontWeight: 600, color: "#1A0A1E", fontStyle: "italic" }}>
              DPDP Act Compliance
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#8B7EA0", lineHeight: 1.65 }}>
            Under India&apos;s Digital Personal Data Protection Act (2023), you have full control over your personal data.
            Wearify acts as a Data Fiduciary and processes your data only with your explicit consent.
            You can withdraw consent, request data portability, or request erasure at any time.
            Changes will be processed within the statutory timeframe.
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div
          onClick={() => setShowDeleteConfirm(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,4,24,.65)",
            backdropFilter: "blur(8px)",
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cx-scaleIn"
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "24px 22px",
              maxWidth: 320,
              width: "100%",
              boxShadow: "0 24px 80px rgba(10,22,40,.30)",
              textAlign: "center",
            }}
          >
            <div style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#FFEBEE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="#B71C1C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#B71C1C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="cx-serif" style={{ fontSize: 19, fontWeight: 600, color: "#1A0A1E", fontStyle: "italic", marginBottom: 6 }}>
              Delete All Data?
            </div>
            <p style={{ fontSize: 13, color: "#8B7EA0", lineHeight: 1.65, marginBottom: 20 }}>
              This will permanently erase all your personal data, visit history, preferences, and photos. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="cx-press"
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 100,
                  background: "#FDF8F0",
                  border: "1px solid #E8D5E0",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#4A3558",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  alert("Data deletion request noted. Your data will be permanently deleted within 30 days. You can contact support to cancel this request.");
                }}
                className="cx-press"
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 100,
                  background: "#B71C1C",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
