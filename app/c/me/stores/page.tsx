"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

export default function MyStoresPage() {
  const router = useRouter();
  const { customerId } = useCustomer();

  const storeLinks = useQuery(
    api.customers.listStoreLinks,
    customerId ? { customerId } : "skip"
  );

  if (!customerId) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="text-wf-primary text-lg cursor-pointer"
        >
          {"\u2190"}
        </button>
        <h1 className="text-lg font-bold text-wf-text">My Stores</h1>
      </div>

      {storeLinks === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-wf-border/50 rounded-xl h-24"
            />
          ))}
        </div>
      ) : storeLinks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl mb-2">{"\u{1F3EA}"}</div>
          <div className="text-sm text-wf-muted">No stores visited yet</div>
          <div className="text-xs text-wf-muted mt-1">
            Visit a Wearify-powered store to see it here
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {storeLinks.map((link) => (
            <div
              key={link._id}
              className="bg-wf-card rounded-xl border border-wf-border p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-wf-text">
                    {link.storeName || link.storeId}
                  </div>
                  <div className="text-xs text-wf-muted mt-1">
                    Store ID: {link.storeId}
                  </div>
                </div>
                {link.segment && (
                  <span className="text-[10px] font-semibold text-wf-primary bg-wf-primary/10 px-2 py-0.5 rounded">
                    {link.segment}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-wf-subtext">
                <span>
                  <span className="font-semibold text-wf-text">
                    {link.visits || 0}
                  </span>{" "}
                  visits
                </span>
                {link.lastVisit && (
                  <span>
                    Last visit:{" "}
                    <span className="font-semibold text-wf-text">
                      {link.lastVisit}
                    </span>
                  </span>
                )}
              </div>
              {link.clv !== undefined && link.clv > 0 && (
                <div className="text-xs text-wf-primary font-semibold mt-2">
                  Lifetime value: Rs.{link.clv.toLocaleString("en-IN")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
