"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge, Card, Btn, PageLoading } from "@/components/ui/wearify-ui";

export default function VerificationPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch {
      // ignore
    }
  }, []);

  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip"
  );

  const updateVerification = useMutation(api.tailorOps.updateVerification);

  if (!tailorId || profile === undefined) {
    return <PageLoading />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-wf-subtext">Profile not found.</p>
      </div>
    );
  }

  const verifiedCount = [
    profile.aadhaarVerified,
    profile.panVerified,
    profile.addressVerified,
  ].filter(Boolean).length;

  const badgeLevel =
    verifiedCount === 3 ? "Verified" : verifiedCount >= 1 ? "Partial" : "Unverified";

  async function handleSubmit() {
    setLoading(true);
    try {
      // In a real app, this would trigger document verification
      // For now, mark as pending (backend would process)
      await updateVerification({
        tailorId: tailorId!,
        aadhaarVerified: profile!.aadhaarVerified || false,
        panVerified: profile!.panVerified || false,
        addressVerified: profile!.addressVerified || false,
      });
      setSubmitted(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

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

      {submitted && (
        <div className="px-4 py-2.5 rounded-lg bg-wf-green/10 text-wf-green text-sm font-medium">
          Documents submitted for verification!
        </div>
      )}

      {/* Badge Status */}
      <div className="bg-wf-card rounded-lg p-4 border border-wf-border text-center">
        <div className="text-sm text-wf-subtext mb-2">Verification Status</div>
        <Badge
          status={badgeLevel === "Verified" ? "verified" : badgeLevel === "Partial" ? "pending" : "offline"}
          className="text-base px-4 py-1"
        >
          {badgeLevel}
        </Badge>
        <div className="text-xs text-wf-muted mt-2">
          {verifiedCount}/3 documents verified
        </div>
        <div className="w-full h-1.5 bg-wf-border rounded-full mt-2">
          <div
            className="h-full bg-wf-green rounded-full transition-all"
            style={{ width: `${(verifiedCount / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Aadhaar */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-wf-blue/10 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-wf-blue)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="7" y1="9" x2="17" y2="9" />
                <line x1="7" y1="13" x2="12" y2="13" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-wf-text">Aadhaar Card</div>
              <div className="text-xs text-wf-muted">Government ID proof</div>
            </div>
          </div>
          <Badge status={profile.aadhaarVerified ? "verified" : "pending"}>
            {profile.aadhaarVerified ? "Verified" : "Pending"}
          </Badge>
        </div>
        {!profile.aadhaarVerified && (
          <div className="mt-3 border border-dashed border-wf-border rounded-lg p-4 text-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-wf-muted)" strokeWidth="2" className="mx-auto mb-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="text-xs text-wf-muted">Tap to upload Aadhaar</div>
          </div>
        )}
      </Card>

      {/* PAN */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-wf-amber/10 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-wf-amber)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="7" y1="9" x2="17" y2="9" />
                <line x1="7" y1="13" x2="14" y2="13" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-wf-text">PAN Card</div>
              <div className="text-xs text-wf-muted">Tax identification</div>
            </div>
          </div>
          <Badge status={profile.panVerified ? "verified" : "pending"}>
            {profile.panVerified ? "Verified" : "Pending"}
          </Badge>
        </div>
        {!profile.panVerified && (
          <div className="mt-3 border border-dashed border-wf-border rounded-lg p-4 text-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-wf-muted)" strokeWidth="2" className="mx-auto mb-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="text-xs text-wf-muted">Tap to upload PAN</div>
          </div>
        )}
      </Card>

      {/* Address Proof */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-wf-green/10 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-wf-green)" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-wf-text">Address Proof</div>
              <div className="text-xs text-wf-muted">Utility bill / rental agreement</div>
            </div>
          </div>
          <Badge status={profile.addressVerified ? "verified" : "pending"}>
            {profile.addressVerified ? "Verified" : "Pending"}
          </Badge>
        </div>
        {!profile.addressVerified && (
          <div className="mt-3 border border-dashed border-wf-border rounded-lg p-4 text-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-wf-muted)" strokeWidth="2" className="mx-auto mb-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="text-xs text-wf-muted">Tap to upload address proof</div>
          </div>
        )}
      </Card>

      {/* Badge Progression Info */}
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

      {verifiedCount < 3 && (
        <Btn primary className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit for Verification"}
        </Btn>
      )}
    </div>
  );
}
