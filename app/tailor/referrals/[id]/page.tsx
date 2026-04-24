"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageLoading } from "@/components/ui/wearify-ui";

export default function ReferralDetailPage() {
  const router = useRouter();
  const params = useParams();
  const referralId = params.id as string;
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quotePrice, setQuotePrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch { /* ignore */ }
  }, []);

  const referral = useQuery(
    api.tailorOps.getReferralById,
    referralId ? { id: referralId as Id<"tailorReferrals"> } : "skip"
  );
  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip"
  );
  const updateStatus = useMutation(api.tailorOps.updateReferralStatus);
  const createOrder = useMutation(api.tailorOps.createOrder);

  if (referral === undefined || profile === undefined) return <PageLoading />;

  if (!referral) {
    return (
      <div className="t-empty">
        <h3>Referral not found</h3>
        <button className="t-btn t-btn-ghost" onClick={() => router.push("/tailor/referrals")}>
          Back to Leads
        </button>
      </div>
    );
  }

  function maskedPhone(phone: string) {
    if (phone.length <= 4) return phone;
    return phone.slice(0, -4).replace(/./g, "*") + phone.slice(-4);
  }

  async function handleSendQuote() {
    if (!quotePrice || Number(quotePrice) <= 0) return;
    setLoading(true);
    try {
      await updateStatus({
        id: referralId as Id<"tailorReferrals">,
        status: "quoted",
      });
      setShowQuoteModal(false);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!profile || !tailorId || !referral) return;
    setLoading(true);
    try {
      await updateStatus({
        id: referralId as Id<"tailorReferrals">,
        status: "confirmed",
      });
      await createOrder({
        tailorId,
        tailorName: profile.name,
        referralId: referralId as Id<"tailorReferrals">,
        customerId: referral.customerId || undefined,
        customerName: referral.customerName,
        customerPhone: referral.customerPhone,
        saree: referral.saree || undefined,
        fabric: referral.fabric || undefined,
        storeId: referral.storeId || undefined,
        service: referral.saree || "General Stitching",
        priceQuoted: quotePrice ? Number(quotePrice) : 0,
        orderDate: new Date().toISOString().split("T")[0],
        note: referral.note || undefined,
      });
      router.push("/tailor/orders");
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleDecline() {
    setLoading(true);
    try {
      await updateStatus({
        id: referralId as Id<"tailorReferrals">,
        status: "declined",
      });
      router.push("/tailor/referrals");
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleMarkContacted() {
    if (referral?.status !== "new") return;
    try {
      await updateStatus({
        id: referralId as Id<"tailorReferrals">,
        status: "contacted",
      });
    } catch { /* ignore */ }
  }

  function handleWhatsApp() {
    if (!referral) return;
    const phone = referral.customerPhone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hi ${referral.customerName}, I'm ${profile?.name || "your tailor"} from Wearify. I received your referral for ${referral.saree || "stitching work"}. Let's discuss the details!`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    handleMarkContacted();
  }

  const pillClass =
    referral.status === "new" ? "t-pill-new"
    : referral.status === "contacted" ? "t-pill-contacted"
    : referral.status === "quoted" ? "t-pill-quoted"
    : referral.status === "confirmed" ? "t-pill-confirmed"
    : referral.status === "declined" ? "t-pill-declined"
    : "t-pill-confirmed";

  const canConvert = referral.status === "new" || referral.status === "contacted" || referral.status === "quoted";

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <button
          type="button"
          className="t-back"
          onClick={() => router.push("/tailor/referrals")}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>Lead</h1>
        <div className="t-right">
          <span className={`t-pill ${pillClass}`}>{referral.status}</span>
        </div>
      </div>

      {/* Customer hero */}
      <div style={{ padding: "0 20px 16px" }}>
        <div className="t-serif" style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
          {referral.customerName}
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
          {referral.saree ?? "General enquiry"}
          {referral.fabric ? ` · ${referral.fabric}` : ""}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {referral.occasion && <span className="t-chip">{referral.occasion}</span>}
          {referral.budget && <span className="t-chip t-mono">{referral.budget}</span>}
          {referral.measurementsShared && (
            <span className="t-chip" style={{ background: "var(--ok-tint)", color: "var(--ok)" }}>
              Measurements on file
            </span>
          )}
        </div>
      </div>

      {/* Customer info card */}
      <div style={{ margin: "0 20px 12px" }}>
        <div className="t-card t-card-inset">
          <InfoRow label="Phone" value={maskedPhone(referral.customerPhone)} mono />
          {referral.storeName && <InfoRow label="Source" value={referral.storeName} />}
          <InfoRow label="Received" value={referral.date} last />
        </div>
      </div>

      {/* Store note */}
      {referral.note && (
        <div style={{ margin: "0 20px 12px" }}>
          <div className="t-card t-card-inset" style={{ background: "var(--ivory-2)" }}>
            <div className="t-caps" style={{ color: "var(--ink-3)", marginBottom: 6 }}>
              Note from store
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>{referral.note}</div>
          </div>
        </div>
      )}

      {/* Convert-to-order hero — dominant CTA per design brief */}
      {canConvert && (
        <div
          style={{
            margin: "8px 20px 16px",
            background: "linear-gradient(160deg, #1A1512 0%, #2E2620 100%)",
            color: "var(--ivory)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 20px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -24, top: -24,
              width: 140, height: 140, borderRadius: 99,
              background: "radial-gradient(circle at 30% 30%, rgba(176,123,26,0.4), transparent 70%)",
            }}
          />
          <div className="t-hero-eyebrow">Ready to commit?</div>
          <h2 className="t-hero-title">
            Convert to <em>order</em>
          </h2>
          <div className="t-hero-sub">
            We&apos;ll pull measurements from the customer&apos;s profile and start the stitching timer.
          </div>
          <div style={{ display: "flex", gap: 10, position: "relative", flexWrap: "wrap" }}>
            <button
              type="button"
              className="t-hero-cta"
              onClick={handleAccept}
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "…" : "Convert to order"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            {referral.status !== "quoted" && (
              <button
                type="button"
                onClick={() => setShowQuoteModal(true)}
                style={{
                  background: "transparent",
                  color: "var(--ivory)",
                  border: "1px solid rgba(250,246,239,0.2)",
                  padding: "11px 16px",
                  borderRadius: 99,
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Send quote
              </button>
            )}
          </div>
        </div>
      )}

      {/* Secondary actions */}
      <div style={{ padding: "0 20px", display: "flex", gap: 10 }}>
        <button type="button" className="t-btn t-btn-ghost" style={{ flex: 1 }} onClick={handleWhatsApp}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          WhatsApp
        </button>
        {canConvert && (
          <button
            type="button"
            className="t-btn t-btn-ghost"
            style={{ flex: 1, color: "var(--urgent)", borderColor: "var(--urgent-tint)" }}
            onClick={handleDecline}
            disabled={loading}
          >
            Decline
          </button>
        )}
      </div>

      <div style={{ height: 28 }} />

      {/* Quote bottom-sheet */}
      {showQuoteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26, 21, 18, 0.4)",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setShowQuoteModal(false)}
        >
          <div
            style={{
              background: "var(--ivory)",
              width: "100%",
              maxWidth: 480,
              borderRadius: "26px 26px 0 0",
              padding: "16px 20px 34px",
              animation: "t-sheet-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: 44, height: 4, borderRadius: 99,
              background: "var(--line-2)", margin: "0 auto 18px",
            }} />
            <h3 className="t-serif" style={{ fontSize: 22, fontWeight: 500, margin: "0 0 6px" }}>
              Send quote
            </h3>
            <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 16px" }}>
              Give the customer a starting price. They&apos;ll see it via WhatsApp and you can always adjust later.
            </p>
            <div className="t-field" style={{ marginBottom: 14 }}>
              <label>Quoted price</label>
              <input
                className="t-input t-mono"
                type="number"
                value={quotePrice}
                onChange={(e) => setQuotePrice(e.target.value)}
                placeholder="₹0"
              />
            </div>
            <button
              type="button"
              className="t-btn t-btn-primary t-btn-full t-btn-lg"
              onClick={handleSendQuote}
              disabled={loading || !quotePrice || Number(quotePrice) <= 0}
            >
              {loading ? "Sending…" : "Send quote"}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes t-sheet-in { from { transform: translateY(100%); } }
      `}</style>
    </div>
  );
}

function InfoRow({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: last ? "none" : "1px solid var(--line)",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{label}</span>
      <span
        className={mono ? "t-mono" : ""}
        style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}
      >
        {value}
      </span>
    </div>
  );
}
