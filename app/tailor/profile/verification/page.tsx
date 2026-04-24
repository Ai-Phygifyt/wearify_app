"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";
import { useUploadFile } from "@/lib/useUpload";
import { GUARDS } from "@/lib/uploadGuards";
import { useConvexUrl } from "@/lib/ConvexImage";
import { Id } from "@/convex/_generated/dataModel";

type DocType = "aadhaar" | "pan" | "address";

function KycDocCard({
  title,
  subtitle,
  fileId,
  verified,
  onPick,
  uploading,
}: {
  title: string;
  subtitle: string;
  fileId?: Id<"_storage">;
  verified: boolean;
  onPick: (file: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const url = useConvexUrl(fileId ?? null);

  const statusLabel = uploading
    ? "Uploading…"
    : verified
      ? "Verified"
      : fileId
        ? "Under review"
        : "Not submitted";
  const dotClass = verified ? "t-verified" : fileId ? "t-pending" : "";

  return (
    <div style={{ padding: "0 20px", marginBottom: 10 }}>
      <div className="t-upload-tile">
        <div className={`t-prev ${fileId ? "t-has" : ""}`}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={`${title} preview`} />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="7" y1="9" x2="17" y2="9" />
              <line x1="7" y1="13" x2="12" y2="13" />
            </svg>
          )}
        </div>
        <div className="t-info">
          <div className="t-doc-name">{title}</div>
          <div className="t-doc-status">
            <div className={`t-status-dot ${dotClass}`} />
            <span>{statusLabel}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>
            {subtitle}
          </div>
        </div>
        {!verified && (
          <button
            type="button"
            className="t-btn t-btn-ghost"
            style={{ padding: "8px 12px", fontSize: 13 }}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {fileId ? "Replace" : "Upload"}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) onPick(f);
          }}
        />
      </div>
    </div>
  );
}

export default function VerificationPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<DocType | null>(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch { /* ignore */ }
  }, []);

  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip",
  );
  const { upload } = useUploadFile();
  const submitKycDocument = useMutation(api.tailorOps.submitKycDocument);

  if (!tailorId || profile === undefined) return <PageLoading />;
  if (!profile) {
    return (
      <div className="t-empty">
        <h3>Profile not found</h3>
      </div>
    );
  }

  async function handlePick(docType: DocType, file: File) {
    setUploadingType(docType);
    setUploadError("");
    try {
      const fileId = await upload(file, GUARDS.kycDocument);
      await submitKycDocument({ tailorId: tailorId!, docType, fileId });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingType(null);
    }
  }

  const verifiedCount = [
    profile.aadhaarVerified,
    profile.panVerified,
    profile.addressVerified,
  ].filter(Boolean).length;
  const statusLabel = verifiedCount === 3 ? "Verified" : verifiedCount >= 1 ? "Partial" : "Unverified";

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <button
          type="button"
          className="t-back"
          onClick={() => router.push("/tailor/profile")}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>Verification</h1>
        <div style={{ width: 36 }} />
      </div>

      {/* Rejection banner */}
      {profile.kycRejectionReason && (
        <div
          style={{
            margin: "0 20px 14px",
            padding: "14px 16px",
            background: "var(--urgent-tint)",
            borderRadius: 14,
            border: "1px solid rgba(192, 62, 28, 0.18)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--urgent)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Admin feedback
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
            {profile.kycRejectionReason}
          </div>
        </div>
      )}

      {/* Transient upload error */}
      {uploadError && (
        <div
          style={{
            margin: "0 20px 14px",
            padding: "10px 14px",
            background: "var(--urgent-tint)",
            color: "var(--urgent)",
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {uploadError}
        </div>
      )}

      {/* KYC meter */}
      <div className="t-kyc-meter" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <div className="t-caps" style={{ color: "var(--ink-3)" }}>Verification</div>
            <div className="t-serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 2, letterSpacing: "-0.01em" }}>
              {statusLabel}
            </div>
          </div>
          <div className="t-mono" style={{ fontSize: 16, fontWeight: 500, color: "var(--ink-2)" }}>
            {verifiedCount}/3
          </div>
        </div>
        <div className="t-kyc-progress">
          <div className="t-bar" style={{ width: `${(verifiedCount / 3) * 100}%` }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 10 }}>
          Usually reviewed within 24 hours. You can replace a document anytime before it&apos;s verified.
        </div>
      </div>

      <KycDocCard
        title="Aadhaar card"
        subtitle="Government ID proof"
        fileId={profile.aadhaarFileId}
        verified={!!profile.aadhaarVerified}
        onPick={(f) => handlePick("aadhaar", f)}
        uploading={uploadingType === "aadhaar"}
      />

      <KycDocCard
        title="PAN card"
        subtitle="Tax identification"
        fileId={profile.panFileId}
        verified={!!profile.panVerified}
        onPick={(f) => handlePick("pan", f)}
        uploading={uploadingType === "pan"}
      />

      <KycDocCard
        title="Address proof"
        subtitle="Utility bill or rental agreement"
        fileId={profile.addressProofFileId}
        verified={!!profile.addressVerified}
        onPick={(f) => handlePick("address", f)}
        uploading={uploadingType === "address"}
      />

      {/* Badge progression */}
      <div style={{ padding: "0 20px", marginTop: 18 }}>
        <div className="t-card t-card-inset">
          <div className="t-caps" style={{ color: "var(--ink-3)", marginBottom: 10 }}>Badge progression</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="t-pill t-pill-new">New</span>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Default badge after registration</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="t-pill t-pill-confirmed">Verified</span>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>All three KYC docs approved</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="t-pill" style={{ background: "var(--gold-tint)", color: "var(--gold-ink)" }}>
                Pro
              </span>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Verified + 50 orders + 4.5★</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 28 }} />
    </div>
  );
}
