"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge, Card, PageLoading } from "@/components/ui/wearify-ui";
import { useUploadFile } from "@/lib/useUpload";
import { useConvexUrl } from "@/lib/ConvexImage";
import { Id } from "@/convex/_generated/dataModel";

type DocType = "aadhaar" | "pan" | "address";

// Single card that handles upload + preview + status for one KYC doc type.
// Renders one of three states: no file yet ("Tap to upload"), file submitted
// and awaiting admin review, or file approved by admin.
function KycDocCard({
  title,
  subtitle,
  accentClass,
  icon,
  fileId,
  verified,
  onPick,
  uploading,
}: {
  title: string;
  subtitle: string;
  accentClass: string;
  icon: React.ReactNode;
  fileId?: Id<"_storage">;
  verified: boolean;
  onPick: (file: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const url = useConvexUrl(fileId ?? null);

  const statusLabel = verified ? "Verified" : fileId ? "Under review" : "Not submitted";
  const statusTone: "verified" | "pending" | "offline" = verified
    ? "verified"
    : fileId
      ? "pending"
      : "offline";

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accentClass}`}>
            {icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-wf-text">{title}</div>
            <div className="text-xs text-wf-muted">{subtitle}</div>
          </div>
        </div>
        <Badge status={statusTone}>{statusLabel}</Badge>
      </div>

      {/* Preview of the uploaded document, if any */}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`${title} preview`}
          className="mt-3 w-full max-h-48 object-cover rounded-lg border border-wf-border"
        />
      )}

      {/* Upload / replace control. Tailor can replace a rejected doc by
          tapping the tile again — backend clears the verified flag. */}
      {!verified && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-3 w-full border border-dashed border-wf-border rounded-lg p-4 text-center bg-transparent cursor-pointer hover:bg-wf-card/50 transition-colors disabled:opacity-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-wf-muted)" strokeWidth="2" className="mx-auto mb-2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div className="text-xs text-wf-muted">
            {uploading ? "Uploading..." : fileId ? `Replace ${title}` : `Tap to upload ${title}`}
          </div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onPick(f);
        }}
      />
    </Card>
  );
}

export default function VerificationPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<DocType | null>(null);

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
      <div className="text-center py-12">
        <p className="text-sm text-wf-subtext">Profile not found.</p>
      </div>
    );
  }

  async function handlePick(docType: DocType, file: File) {
    setUploadingType(docType);
    try {
      const fileId = await upload(file);
      await submitKycDocument({ tailorId: tailorId!, docType, fileId });
    } finally {
      setUploadingType(null);
    }
  }

  const verifiedCount = [
    profile.aadhaarVerified,
    profile.panVerified,
    profile.addressVerified,
  ].filter(Boolean).length;
  const badgeLevel = verifiedCount === 3 ? "Verified" : verifiedCount >= 1 ? "Partial" : "Unverified";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/tailor/profile")}
          className="p-1 rounded-lg hover:bg-wf-card transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wf-text">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-wf-text">KYC Verification</h1>
      </div>

      {/* Rejection banner — shown when admin has rejected and tailor hasn't
          yet resubmitted. Uploading a new doc clears the reason server-side. */}
      {profile.kycRejectionReason && (
        <div className="px-4 py-3 rounded-lg bg-wf-red/10 border border-wf-red/30 text-wf-red text-sm">
          <div className="font-semibold mb-1">Admin feedback</div>
          <div className="text-xs">{profile.kycRejectionReason}</div>
        </div>
      )}

      {/* Status summary */}
      <div className="bg-wf-card rounded-lg p-4 border border-wf-border text-center">
        <div className="text-sm text-wf-subtext mb-2">Verification Status</div>
        <Badge
          status={badgeLevel === "Verified" ? "verified" : badgeLevel === "Partial" ? "pending" : "offline"}
          className="text-base px-4 py-1"
        >
          {badgeLevel}
        </Badge>
        <div className="text-xs text-wf-muted mt-2">{verifiedCount}/3 documents verified</div>
        <div className="w-full h-1.5 bg-wf-border rounded-full mt-2">
          <div
            className="h-full bg-wf-green rounded-full transition-all"
            style={{ width: `${(verifiedCount / 3) * 100}%` }}
          />
        </div>
        <div className="text-[11px] text-wf-muted mt-3">
          Usually reviewed within 24 hours. You can replace a document anytime before it&apos;s verified.
        </div>
      </div>

      <KycDocCard
        title="Aadhaar Card"
        subtitle="Government ID proof"
        accentClass="bg-wf-blue/10"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-wf-blue)" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="7" y1="9" x2="17" y2="9" />
            <line x1="7" y1="13" x2="12" y2="13" />
          </svg>
        }
        fileId={profile.aadhaarFileId}
        verified={!!profile.aadhaarVerified}
        onPick={(f) => handlePick("aadhaar", f)}
        uploading={uploadingType === "aadhaar"}
      />

      <KycDocCard
        title="PAN Card"
        subtitle="Tax identification"
        accentClass="bg-wf-amber/10"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-wf-amber)" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="7" y1="9" x2="17" y2="9" />
            <line x1="7" y1="13" x2="14" y2="13" />
          </svg>
        }
        fileId={profile.panFileId}
        verified={!!profile.panVerified}
        onPick={(f) => handlePick("pan", f)}
        uploading={uploadingType === "pan"}
      />

      <KycDocCard
        title="Address Proof"
        subtitle="Utility bill / rental agreement"
        accentClass="bg-wf-green/10"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-wf-green)" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        }
        fileId={profile.addressProofFileId}
        verified={!!profile.addressVerified}
        onPick={(f) => handlePick("address", f)}
        uploading={uploadingType === "address"}
      />

      {/* Badge progression */}
      <div className="bg-wf-card rounded-lg p-4 border border-wf-border">
        <div className="text-sm font-semibold text-wf-text mb-2">Badge Progression</div>
        <div className="space-y-2 text-xs text-wf-subtext">
          <div className="flex items-center gap-2">
            <Badge status="pending">New</Badge>
            <span>Default badge after registration</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge status="verified">Verified</Badge>
            <span>All 3 KYC documents verified</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge status="active">Pro</Badge>
            <span>Verified + 50+ orders + 4.5+ rating</span>
          </div>
        </div>
      </div>
    </div>
  );
}
