"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { Btn, Badge, PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

const REFERRAL_MESSAGE =
  "Hey! I've been using Wearify to virtually try on sarees before buying. It's amazing! You should try it too. Download the app and use my referral link to get 100 bonus loyalty points!";

export default function ReferPage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const referrals = useQuery(
    api.customers.listReferrals,
    customerId ? { referrerId: customerId } : "skip"
  );

  if (!customerId) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  const shareUrl = `https://wa.me/?text=${encodeURIComponent(REFERRAL_MESSAGE)}`;

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="text-wf-primary text-lg cursor-pointer"
        >
          {"\u2190"}
        </button>
        <h1 className="text-lg font-bold text-wf-text">Refer a Friend</h1>
      </div>

      {/* Referral CTA card */}
      <div
        className="rounded-xl p-5 mb-5 text-white"
        style={{
          background: "linear-gradient(135deg, #71221D, #D4A843)",
        }}
      >
        <div className="text-base font-bold mb-2">
          Share the Joy of Wearify
        </div>
        <div className="text-xs text-white/80 mb-4 leading-relaxed">
          {REFERRAL_MESSAGE}
        </div>
        <Btn
          onClick={() => window.open(shareUrl, "_blank")}
          className="!bg-white !text-wf-primary w-full"
        >
          Share on WhatsApp
        </Btn>
      </div>

      {/* Reward info */}
      <div className="bg-wf-card rounded-xl border border-wf-border p-4 mb-5">
        <div className="text-sm font-bold text-wf-text mb-2">How it works</div>
        <div className="space-y-2 text-xs text-wf-subtext">
          <div className="flex items-start gap-2">
            <span className="font-bold text-wf-primary">1.</span>
            <span>Share your referral link with friends</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-wf-primary">2.</span>
            <span>They visit a Wearify-powered store</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-wf-primary">3.</span>
            <span>
              You both earn{" "}
              <span className="font-bold text-wf-green">100 loyalty points!</span>
            </span>
          </div>
        </div>
      </div>

      {/* Referral history */}
      <div className="text-sm font-bold text-wf-text mb-3">
        Referral History
      </div>
      {referrals === undefined ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-wf-border/50 rounded-lg h-14"
            />
          ))}
        </div>
      ) : referrals.length === 0 ? (
        <div className="text-center py-8 text-sm text-wf-muted">
          No referrals yet. Share your link to get started!
        </div>
      ) : (
        <div className="space-y-2">
          {referrals.map((ref) => (
            <div
              key={ref._id}
              className="bg-wf-card rounded-lg border border-wf-border p-3 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-wf-text">
                  {ref.referredName}
                </div>
                <div className="text-[10px] text-wf-muted mt-0.5">
                  {ref.date}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ref.reward !== undefined && ref.reward > 0 && (
                  <span className="text-xs text-wf-green font-bold">
                    +{ref.reward} pts
                  </span>
                )}
                <Badge
                  status={
                    ref.status === "Rewarded"
                      ? "active"
                      : ref.status === "Visited"
                        ? "progress"
                        : "pending"
                  }
                >
                  {ref.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
