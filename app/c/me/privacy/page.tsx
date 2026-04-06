"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { Toggle, Btn, PageLoading } from "@/components/ui/wearify-ui";
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
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  const CONSENT_ITEMS = [
    {
      label: "Visit History",
      description: "Allow stores to see your visit and browsing history",
      value: consentHistory,
      toggle: () => {
        setConsentHistory(!consentHistory);
        setSaved(false);
      },
    },
    {
      label: "WhatsApp Messages",
      description:
        "Receive offers, reminders, and updates via WhatsApp",
      value: consentMessages,
      toggle: () => {
        setConsentMessages(!consentMessages);
        setSaved(false);
      },
    },
    {
      label: "AI Personalization",
      description:
        "Allow AI to recommend sarees based on your preferences and history",
      value: consentAiPersonal,
      toggle: () => {
        setConsentAiPersonal(!consentAiPersonal);
        setSaved(false);
      },
    },
    {
      label: "Photos",
      description:
        "Allow virtual try-on photos to be stored and used for your profile",
      value: consentPhotos,
      toggle: () => {
        setConsentPhotos(!consentPhotos);
        setSaved(false);
      },
    },
  ];

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="text-wf-primary text-lg cursor-pointer"
        >
          {"\u2190"}
        </button>
        <h1 className="text-lg font-bold text-wf-text">
          Privacy & Data (DPDP)
        </h1>
      </div>

      <div className="text-xs text-wf-muted mb-5 leading-relaxed">
        Under India&apos;s Digital Personal Data Protection Act, you have full
        control over your data. Manage your consent preferences below.
      </div>

      {/* Consent toggles */}
      <div className="bg-wf-card rounded-xl border border-wf-border divide-y divide-wf-border">
        {CONSENT_ITEMS.map((item) => (
          <div
            key={item.label}
            className="px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-wf-text">
                {item.label}
              </div>
              <div className="text-[10px] text-wf-muted mt-0.5 leading-relaxed">
                {item.description}
              </div>
            </div>
            <Toggle on={item.value} onToggle={item.toggle} />
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="mt-5">
        <Btn
          primary
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
        </Btn>
      </div>

      {/* Data actions */}
      <div className="mt-6 space-y-3">
        <div className="bg-wf-card rounded-xl border border-wf-border p-4">
          <div className="text-sm font-bold text-wf-text mb-1">
            Download My Data
          </div>
          <div className="text-xs text-wf-muted mb-3">
            Get a copy of all your personal data stored with Wearify
          </div>
          <Btn
            onClick={() =>
              alert(
                "Data download request submitted. You will receive it via email within 48 hours."
              )
            }
            className="w-full"
          >
            Request Data Download
          </Btn>
        </div>

        <div className="bg-wf-card rounded-xl border border-wf-red/20 p-4">
          <div className="text-sm font-bold text-wf-red mb-1">
            Delete All My Data
          </div>
          <div className="text-xs text-wf-muted mb-3">
            Permanently delete all your data. This action cannot be undone and
            will be processed within 30 days.
          </div>
          <Btn
            danger
            onClick={() =>
              alert(
                "Data deletion request noted. Your data will be permanently deleted within 30 days. You can contact support to cancel this request."
              )
            }
            className="w-full"
          >
            Request Data Deletion
          </Btn>
        </div>
      </div>
    </div>
  );
}
