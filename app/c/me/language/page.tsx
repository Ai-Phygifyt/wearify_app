"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { Btn, PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "en", native: "English", english: "English" },
  { code: "hi", native: "\u0939\u093F\u0928\u094D\u0926\u0940", english: "Hindi" },
  { code: "ta", native: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD", english: "Tamil" },
  { code: "te", native: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41", english: "Telugu" },
  { code: "kn", native: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1", english: "Kannada" },
  { code: "ml", native: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02", english: "Malayalam" },
  { code: "mr", native: "\u092E\u0930\u093E\u0920\u0940", english: "Marathi" },
  { code: "gu", native: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0", english: "Gujarati" },
  { code: "bn", native: "\u09AC\u09BE\u0982\u09B2\u09BE", english: "Bengali" },
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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (customer?.language) {
      setSelected(customer.language);
    }
  }, [customer]);

  async function handleSave() {
    if (!customerId) return;
    setSaving(true);
    await updateProfile({
      customerId,
      language: selected,
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

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="text-wf-primary text-lg cursor-pointer"
        >
          {"\u2190"}
        </button>
        <h1 className="text-lg font-bold text-wf-text">Language</h1>
      </div>

      <div className="text-xs text-wf-muted mb-4">
        Choose your preferred language for the Wearify experience
      </div>

      {/* Language grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setSelected(lang.code);
              setSaved(false);
            }}
            className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
              selected === lang.code
                ? "bg-wf-primary/10 border-wf-primary"
                : "bg-wf-card border-wf-border hover:border-wf-primary/30"
            }`}
          >
            <div
              className={`text-base font-bold ${
                selected === lang.code ? "text-wf-primary" : "text-wf-text"
              }`}
            >
              {lang.native}
            </div>
            <div className="text-xs text-wf-muted mt-1">{lang.english}</div>
          </button>
        ))}
      </div>

      <Btn
        primary
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Language"}
      </Btn>
    </div>
  );
}
