"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { PageLoading } from "@/components/ui/wearify-ui";
import { useRouter } from "next/navigation";

export default function MyLooksPage() {
  const router = useRouter();
  const { customerId } = useCustomer();
  const [storeFilter, setStoreFilter] = useState("all");

  const looks = useQuery(
    api.sessionOps.listByCustomer,
    customerId ? { customerId } : "skip"
  );

  const storeLinks = useQuery(
    api.customers.listStoreLinks,
    customerId ? { customerId } : "skip"
  );

  const toggleFav = useMutation(api.sessionOps.toggleFav);

  if (!customerId) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  const filteredLooks =
    looks && storeFilter !== "all"
      ? looks.filter((l) => l.storeId === storeFilter)
      : looks;

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-lg font-bold text-wf-text mb-4">My Looks</h1>

      {/* Filter bar */}
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

      {/* Looks grid */}
      {filteredLooks === undefined ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-wf-border/50 rounded-xl h-48"
            />
          ))}
        </div>
      ) : filteredLooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl mb-2">{"\u2665"}</div>
          <div className="text-sm text-wf-muted">No looks found</div>
          <div className="text-xs text-wf-muted mt-1">
            Visit a Wearify store and try on sarees to see them here
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredLooks.map((look) => {
            const grad = look.grad || ["#71221D", "#D4A843"];
            return (
              <div
                key={look._id}
                className="rounded-xl overflow-hidden border border-wf-border bg-wf-card"
              >
                <div
                  className="h-32 w-full relative cursor-pointer"
                  onClick={() => router.push(`/c/looks/${look._id}`)}
                  style={{
                    background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
                  }}
                >
                  {/* Heart icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav({ lookId: look._id });
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center cursor-pointer"
                  >
                    <span
                      className={`text-sm ${look.isFav ? "text-wf-red" : "text-wf-muted"}`}
                    >
                      {look.isFav ? "\u2665" : "\u2661"}
                    </span>
                  </button>
                </div>
                <div
                  className="p-2.5 cursor-pointer"
                  onClick={() => router.push(`/c/looks/${look._id}`)}
                >
                  <div className="text-xs font-bold text-wf-text truncate">
                    {look.sareeName}
                  </div>
                  {look.price && (
                    <div className="text-[10px] text-wf-primary font-semibold mt-0.5">
                      Rs.{look.price.toLocaleString("en-IN")}
                    </div>
                  )}
                  {look.storeId && (
                    <div className="text-[10px] text-wf-muted mt-0.5 truncate">
                      {look.storeId}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
