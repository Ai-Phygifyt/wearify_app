"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../../layout";
import { Badge, PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

export default function VisitHistoryPage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [storeFilter, setStoreFilter] = useState("all");

  const visits = useQuery(
    api.customers.listVisitHistory,
    customerId ? { customerId } : "skip"
  );

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

  const filteredVisits =
    visits && storeFilter !== "all"
      ? visits.filter((v) => v.storeId === storeFilter)
      : visits;

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="text-wf-primary text-lg cursor-pointer"
        >
          {"\u2190"}
        </button>
        <h1 className="text-lg font-bold text-wf-text">Visit History</h1>
      </div>

      {/* Store filter */}
      <div className="mb-4">
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="w-full bg-wf-card border border-wf-border rounded-lg px-3 py-2 text-sm text-wf-text outline-none focus:border-wf-primary"
        >
          <option value="all">All Stores</option>
          {storeLinks?.map((link) => (
            <option key={link._id} value={link.storeId}>
              {link.storeName || link.storeId}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      {filteredVisits === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-wf-border/50 rounded-xl h-20"
            />
          ))}
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl mb-2">{"\u{1F4C5}"}</div>
          <div className="text-sm text-wf-muted">No visit history yet</div>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-3 bottom-3 w-px bg-wf-border" />

          <div className="space-y-4">
            {filteredVisits.map((visit) => (
              <div key={visit._id} className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex-shrink-0 w-8 flex justify-center pt-1">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      visit.purchased
                        ? "bg-wf-green border-wf-green"
                        : "bg-wf-card border-wf-border"
                    }`}
                  />
                </div>

                {/* Visit card */}
                <div className="flex-1 bg-wf-card rounded-xl border border-wf-border p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-wf-text">
                        {visit.date}
                      </div>
                      <div className="text-xs text-wf-muted mt-0.5">
                        {visit.storeName || visit.storeId}
                      </div>
                    </div>
                    {visit.purchased && (
                      <Badge status="active">Purchased</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-wf-subtext">
                    {visit.sareesTried !== undefined && (
                      <span>
                        {visit.sareesTried} sarees tried
                      </span>
                    )}
                    {visit.staffName && (
                      <span>Staff: {visit.staffName}</span>
                    )}
                  </div>
                  {visit.pointsEarned !== undefined &&
                    visit.pointsEarned > 0 && (
                      <div className="text-xs text-wf-green font-semibold mt-1">
                        +{visit.pointsEarned} points earned
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
