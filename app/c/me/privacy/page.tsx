"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const MAROON = "#6E262B";

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
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
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
      <div className="cx-loading">
        <div className="cx-typing">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  const PERMISSIONS = [
    {
      icon: "visit-histroy.svg",
      tile: "#FCE4E8",
      label: "Visit History",
      description: "Allow stores to see your visit and browsing history",
      value: consentHistory,
      toggle: () => { setConsentHistory((v) => !v); setSaved(false); },
    },
    {
      icon: "whatsapp.svg",
      tile: "#FCEFD6",
      label: "WhatsApp Messages",
      description: "Receive offers, reminders, updates, and order notifications via WhatsApp.",
      value: consentMessages,
      toggle: () => { setConsentMessages((v) => !v); setSaved(false); },
    },
    {
      icon: "ai.svg",
      tile: "#F2EAFA",
      label: "AI Personalization",
      description: "Enable AI-powered recommendations based on your preferences and shopping history.",
      value: consentAiPersonal,
      toggle: () => { setConsentAiPersonal((v) => !v); setSaved(false); },
    },
    {
      icon: "try-on.svg",
      tile: "#E9F6E3",
      label: "Try-on Photos",
      description: "Allow virtual try-on photos to be securely stored for your profile experience.",
      value: consentPhotos,
      toggle: () => { setConsentPhotos((v) => !v); setSaved(false); },
    },
  ];

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
          Privacy &amp; DPDP
        </h1>
      </header>

      <div style={{ padding: "20px 16px 32px" }}>
        {/* ── Data Permissions ────────────────────────────── */}
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#1C1714",
            margin: "0 0 16px",
            letterSpacing: "-0.01em",
          }}
        >
          Data Permissions
        </h2>

        <div
          style={{
            borderRadius: 18,
            border: "1px solid #F0E6E3",
            background: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            overflow: "hidden",
            marginBottom: 30,
          }}
        >
          {PERMISSIONS.map((item, i) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px",
                borderBottom: i < PERMISSIONS.length - 1 ? "1px solid #F2ECE9" : undefined,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: item.tile,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/customer/privacy/${item.icon}`} alt="" style={{ width: 26, height: 26 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#2A2522" }}>{item.label}</div>
                <div style={{ fontSize: 12.5, color: "#9A8F8A", marginTop: 2, lineHeight: 1.4 }}>
                  {item.description}
                </div>
              </div>
              <Toggle on={item.value} onClick={item.toggle} />
            </div>
          ))}

          <div style={{ padding: "8px 16px 16px" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="cx-press"
              style={{
                width: "100%",
                height: 54,
                borderRadius: 12,
                background: saved ? "#1E7A3D" : MAROON,
                border: "none",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1,
                transition: "background .2s",
              }}
            >
              {saving ? "Saving…" : saved ? "Saved" : "Save Preferences"}
            </button>
          </div>
        </div>

        {/* ── Your Data ───────────────────────────────────── */}
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#1C1714",
            margin: "0 0 16px",
            letterSpacing: "-0.01em",
          }}
        >
          Your Data
        </h2>

        {/* Download */}
        <InfoCard
          icon="download.svg"
          tile="#FAF1DD"
          title="Download my data"
          description="Get a copy of all your data stored with Wearify"
        />
        <ActionButton onClick={() => setShowDownloadConfirm(true)}>
          Request Data Download
        </ActionButton>

        <div style={{ height: 22 }} />

        {/* Delete */}
        <InfoCard
          icon="delete.svg"
          tile="#FAF1DD"
          title="Delete all my data"
          description="Permanently remove your account data. This action cannot be undone and data will be deleted within 30 days."
        />
        <ActionButton onClick={() => setShowDeleteConfirm(true)}>
          Request Data Delete
        </ActionButton>
      </div>

      {/* Download popup */}
      {showDownloadConfirm && (
        <ConfirmModal
          icon="download-2.svg"
          title="Download"
          message="Your file is being prepared."
          confirmLabel="Download"
          onCancel={() => setShowDownloadConfirm(false)}
          onConfirm={() => setShowDownloadConfirm(false)}
        />
      )}

      {/* Delete popup */}
      {showDeleteConfirm && (
        <ConfirmModal
          icon="delete-2.svg"
          title="Delete"
          message="Are you sure you want to delete all your data"
          confirmLabel="Delete"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

function ConfirmModal({
  icon,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  icon: string;
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28, 17, 8, .55)",
        backdropFilter: "blur(6px)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cx-scaleIn"
        style={{
          background: "#FFFFFF",
          borderRadius: 24,
          padding: "28px 22px 22px",
          maxWidth: 320,
          width: "100%",
          boxShadow: "0 24px 80px rgba(10,22,40,.30)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#FCE4E8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/customer/privacy/${icon}`} alt="" style={{ width: 28, height: 28 }} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#2A2522", marginBottom: 6 }}>
          {title}
        </div>
        <p style={{ fontSize: 13.5, color: "#9A8F8A", lineHeight: 1.6, margin: "0 0 22px" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            className="cx-press"
            style={{
              flex: 1,
              height: 50,
              borderRadius: 12,
              background: "#fff",
              border: "1.5px solid #E4D9CC",
              fontSize: 15,
              fontWeight: 700,
              color: "#2A2522",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cx-press"
            style={{
              flex: 1,
              height: 50,
              borderRadius: 12,
              background: MAROON,
              border: "none",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="cx-press"
      style={{
        width: 52,
        height: 30,
        borderRadius: 99,
        border: "none",
        background: on ? "#6E262B" : "#E4D9CC",
        position: "relative",
        flexShrink: 0,
        cursor: "pointer",
        transition: "background .2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
          transition: "left .2s",
        }}
      />
    </button>
  );
}

function InfoCard({
  icon,
  tile,
  title,
  description,
}: {
  icon: string;
  tile: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        borderRadius: 14,
        border: "1px solid #ECE4E1",
        background: "#FFFFFF",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: tile,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/customer/privacy/${icon}`} alt="" style={{ width: 26, height: 26 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#2A2522" }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "#9A8F8A", marginTop: 2, lineHeight: 1.45 }}>
          {description}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="cx-press"
      style={{
        width: "100%",
        height: 56,
        marginTop: 12,
        borderRadius: 12,
        background: "#6E262B",
        border: "none",
        color: "#fff",
        fontSize: 16,
        fontWeight: 700,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
