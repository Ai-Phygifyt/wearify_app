"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge, Card, Btn, PageLoading } from "@/components/ui/wearify-ui";

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
    } catch {
      // ignore
    }
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

  if (referral === undefined || profile === undefined) {
    return <PageLoading />;
  }

  if (!referral) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-wf-subtext">Referral not found.</p>
        <Btn className="mt-4" onClick={() => router.push("/tailor/referrals")}>Back to Referrals</Btn>
      </div>
    );
  }

  function statusToBadge(status: string) {
    switch (status) {
      case "new": return "open";
      case "contacted": return "progress";
      case "quoted": return "pending";
      case "confirmed": return "active";
      case "declined": return "terminated";
      case "completed": return "verified";
      default: return "planned";
    }
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
    } catch {
      // ignore error
    } finally {
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
    } catch {
      // ignore error
    } finally {
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
    } catch {
      // ignore error
    } finally {
      setLoading(false);
    }
  }

  function handleWhatsApp() {
    if (!referral) return;
    const phone = referral.customerPhone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hi ${referral.customerName}, I'm ${profile?.name || "your tailor"} from Wearify. I received your referral for ${referral.saree || "stitching work"}. Let's discuss the details!`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/tailor/referrals")}
          className="p-1 rounded-lg hover:bg-wf-card transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wf-text">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-wf-text">Referral Detail</h1>
        <Badge status={statusToBadge(referral.status)} className="ml-auto">
          {referral.status}
        </Badge>
      </div>

      {/* Customer Info */}
      <Card title="Customer Info">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-wf-subtext">Name</span>
            <span className="font-medium text-wf-text">{referral.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-wf-subtext">Phone</span>
            <span className="font-mono text-wf-text">{maskedPhone(referral.customerPhone)}</span>
          </div>
          {referral.storeName && (
            <div className="flex justify-between">
              <span className="text-wf-subtext">Store</span>
              <span className="font-medium text-wf-text">{referral.storeName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-wf-subtext">Date</span>
            <span className="text-wf-text">{referral.date}</span>
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card title="Details">
        <div className="space-y-2 text-sm">
          {referral.saree && (
            <div className="flex justify-between">
              <span className="text-wf-subtext">Saree</span>
              <span className="font-medium text-wf-text">{referral.saree}</span>
            </div>
          )}
          {referral.fabric && (
            <div className="flex justify-between">
              <span className="text-wf-subtext">Fabric</span>
              <span className="text-wf-text">{referral.fabric}</span>
            </div>
          )}
          {referral.occasion && (
            <div className="flex justify-between">
              <span className="text-wf-subtext">Occasion</span>
              <span className="text-wf-text">{referral.occasion}</span>
            </div>
          )}
          {referral.budget && (
            <div className="flex justify-between">
              <span className="text-wf-subtext">Budget</span>
              <span className="font-medium text-wf-text">{referral.budget}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-wf-subtext">Measurements Shared</span>
            <Badge status={referral.measurementsShared ? "verified" : "pending"}>
              {referral.measurementsShared ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Note from store */}
      {referral.note && (
        <Card title="Note from Store">
          <p className="text-sm text-wf-subtext">{referral.note}</p>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Btn primary className="w-full" onClick={handleWhatsApp}>
          Contact on WhatsApp
        </Btn>

        {(referral.status === "new" || referral.status === "contacted") && (
          <Btn className="w-full" onClick={() => setShowQuoteModal(true)}>
            Send Quote
          </Btn>
        )}

        {(referral.status === "new" || referral.status === "contacted" || referral.status === "quoted") && (
          <div className="flex gap-3">
            <Btn primary className="flex-1" onClick={handleAccept} disabled={loading}>
              Accept
            </Btn>
            <Btn danger className="flex-1" onClick={handleDecline} disabled={loading}>
              Decline
            </Btn>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-wf-text">Send Quote</h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="p-1 bg-transparent border-none cursor-pointer text-wf-muted"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-wf-text mb-1.5">Price (Rs.)</label>
              <input
                type="number"
                value={quotePrice}
                onChange={(e) => setQuotePrice(e.target.value)}
                placeholder="Enter quoted price"
                className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
              />
            </div>
            <Btn primary className="w-full" onClick={handleSendQuote} disabled={loading}>
              {loading ? "Sending..." : "Send Quote"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
