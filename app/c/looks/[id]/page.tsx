"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Btn, Badge, PageLoading } from "@/components/ui/wearify-ui";
import { Id } from "@/convex/_generated/dataModel";
import { useCustomer } from "../../layout";

export default function LookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lookId = params.id as Id<"looks">;

  const toggleFav = useMutation(api.sessionOps.toggleFav);
  const toggleWish = useMutation(api.sessionOps.toggleWish);

  const { customerId } = useCustomer();

  const allLooks = useQuery(
    api.sessionOps.listByCustomer,
    customerId ? { customerId } : "skip"
  );

  const look = allLooks?.find((l: { _id: string }) => l._id === lookId);

  const sessionLooks = useQuery(
    api.sessionOps.listBySession,
    look?.sessionId ? { sessionId: look.sessionId } : "skip"
  );

  const similarLooks = sessionLooks?.filter(
    (l: { _id: string }) => l._id !== lookId
  );

  if (!customerId || allLooks === undefined) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  if (!look) {
    return (
      <div className="px-5 pt-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-wf-primary font-semibold cursor-pointer mb-4"
        >
          {"\u2190"} Back
        </button>
        <div className="text-center py-12">
          <div className="text-sm text-wf-muted">Look not found</div>
        </div>
      </div>
    );
  }

  const grad = look.grad || ["#71221D", "#D4A843"];
  const shareMessage = encodeURIComponent(
    `Check out this beautiful ${look.sareeName} saree I tried on at Wearify! Rs.${look.price?.toLocaleString("en-IN") || "N/A"}`
  );

  return (
    <div className="pb-4">
      {/* Back button overlay */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center cursor-pointer shadow-sm"
      >
        <span className="text-wf-text text-sm">{"\u2190"}</span>
      </button>

      {/* Hero gradient */}
      <div
        className="w-full h-72 relative"
        style={{
          background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
        }}
      >
        {/* Fav button */}
        <button
          onClick={() => toggleFav({ lookId: look._id })}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center cursor-pointer shadow-sm"
        >
          <span
            className={`text-lg ${look.isFav ? "text-wf-red" : "text-wf-muted"}`}
          >
            {look.isFav ? "\u2665" : "\u2661"}
          </span>
        </button>
      </div>

      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-wf-card rounded-xl border border-wf-border p-4">
          <div className="text-base font-bold text-wf-text">{look.sareeName}</div>
          <div className="flex items-center gap-2 mt-1">
            {look.fabric && (
              <span className="text-xs text-wf-subtext">{look.fabric}</span>
            )}
            {look.drapeStyle && (
              <Badge status="progress">{look.drapeStyle}</Badge>
            )}
          </div>
          {look.price && (
            <div className="text-lg font-extrabold text-wf-primary mt-2">
              Rs.{look.price.toLocaleString("en-IN")}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-wf-muted">
            <span>{look.storeId}</span>
            <span>{"\u00B7"}</span>
            <span>{new Date(look.createdAt).toLocaleDateString("en-IN")}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-4">
          <Btn
            primary
            onClick={() =>
              window.open(`https://wa.me/?text=${shareMessage}`, "_blank")
            }
            className="w-full"
          >
            Share with Family
          </Btn>
          <Btn
            onClick={() => router.push("/c/me/tailor-orders")}
            className="w-full"
          >
            Find a Tailor
          </Btn>
          <Btn
            onClick={() => toggleWish({ lookId: look._id })}
            className="w-full"
          >
            {look.isWished ? "Remove from Wishlist" : "Add to Wishlist"}
          </Btn>
        </div>

        {/* Similar looks from same session */}
        {similarLooks && similarLooks.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-bold text-wf-text mb-3">
              From the Same Session
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
              {similarLooks.map(
                (sl: {
                  _id: Id<"looks">;
                  grad?: string[];
                  sareeName: string;
                  price?: number;
                }) => {
                  const slGrad = sl.grad || ["#71221D", "#D4A843"];
                  return (
                    <div
                      key={sl._id}
                      onClick={() => router.push(`/c/looks/${sl._id}`)}
                      className="flex-shrink-0 w-32 rounded-xl overflow-hidden border border-wf-border bg-wf-card cursor-pointer"
                    >
                      <div
                        className="h-24 w-full"
                        style={{
                          background: `linear-gradient(135deg, ${slGrad[0]}, ${slGrad[1] || slGrad[0]})`,
                        }}
                      />
                      <div className="p-2">
                        <div className="text-[10px] font-bold text-wf-text truncate">
                          {sl.sareeName}
                        </div>
                        {sl.price && (
                          <div className="text-[10px] text-wf-primary font-semibold">
                            Rs.{sl.price.toLocaleString("en-IN")}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
