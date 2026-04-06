"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { Badge, PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

export default function NewArrivalsPage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [storeFilter, setStoreFilter] = useState("all");

  const storeLinks = useQuery(
    api.customers.listStoreLinks,
    customerId ? { customerId } : "skip"
  );

  // Get sarees from the first few visited stores
  const storeIds = storeLinks?.map((l) => l.storeId) || [];
  const targetStoreId =
    storeFilter !== "all" ? storeFilter : storeIds[0] || "";

  const sarees = useQuery(
    api.sarees.listByStore,
    targetStoreId ? { storeId: targetStoreId } : "skip"
  );

  // For "all" filter, we show from first store; user can pick specific stores
  const displaySarees = sarees
    ?.filter((s) => s.status === "active")
    .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));

  if (!customerId) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-lg font-bold text-wf-text mb-4">New Arrivals</h1>

      {/* Store filter */}
      <div className="mb-4">
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="w-full bg-wf-card border border-wf-border rounded-lg px-3 py-2 text-sm text-wf-text outline-none focus:border-wf-primary"
        >
          <option value="all">
            {storeIds.length > 0
              ? storeLinks?.find((l) => l.storeId === storeIds[0])?.storeName ||
                storeIds[0]
              : "All Stores"}
          </option>
          {storeLinks?.map((link) => (
            <option key={link._id} value={link.storeId}>
              {link.storeName || link.storeId}
            </option>
          ))}
        </select>
      </div>

      {/* Sarees grid */}
      {sarees === undefined && targetStoreId ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-wf-border/50 rounded-xl h-52"
            />
          ))}
        </div>
      ) : !targetStoreId ? (
        <div className="text-center py-12">
          <div className="text-2xl mb-2">{"\u2726"}</div>
          <div className="text-sm text-wf-muted">No stores visited yet</div>
          <div className="text-xs text-wf-muted mt-1">
            Visit a Wearify-powered store to see new arrivals
          </div>
        </div>
      ) : displaySarees && displaySarees.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl mb-2">{"\u2726"}</div>
          <div className="text-sm text-wf-muted">
            No new arrivals at this store
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {displaySarees?.map((saree) => {
            const grad = saree.grad || ["#71221D", "#D4A843"];
            return (
              <div
                key={saree._id}
                className="rounded-xl overflow-hidden border border-wf-border bg-wf-card"
              >
                <div
                  className="h-32 w-full relative"
                  style={{
                    background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
                  }}
                >
                  {saree.tag === "New" && (
                    <div className="absolute top-2 left-2">
                      <Badge status="active" className="text-[10px]">
                        NEW
                      </Badge>
                    </div>
                  )}
                  {saree.tag && saree.tag !== "New" && (
                    <div className="absolute top-2 left-2">
                      <Badge status="progress" className="text-[10px]">
                        {saree.tag}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <div className="text-xs font-bold text-wf-text truncate">
                    {saree.name}
                  </div>
                  <div className="text-[10px] text-wf-subtext mt-0.5">
                    {saree.fabric}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-wf-primary font-bold">
                      Rs.{saree.price.toLocaleString("en-IN")}
                    </div>
                    <Badge
                      status="planned"
                      className="text-[9px] !px-1.5 !py-0"
                    >
                      {saree.occasion}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
