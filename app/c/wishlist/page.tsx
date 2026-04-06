"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCustomer } from "../layout";
import { Btn, PageLoading } from "@/components/ui/wearify-ui";

export default function WishlistPage() {
  const { customerId } = useCustomer();

  const wishlist = useQuery(
    api.customers.getWishlist,
    customerId ? { customerId } : "skip"
  );

  const removeFromWishlist = useMutation(api.customers.removeFromWishlist);

  if (!customerId) {
    return (
      <div className="p-5">
        <PageLoading />
      </div>
    );
  }

  const total = wishlist?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;

  const storeMessage = encodeURIComponent(
    `Hi! I have a wishlist of ${wishlist?.length || 0} sarees worth Rs.${total.toLocaleString("en-IN")} on Wearify. Can you help me with these?`
  );

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-lg font-bold text-wf-text mb-4">My Wishlist</h1>

      {wishlist === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-wf-border/50 rounded-xl h-20"
            />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl mb-2">{"\u2606"}</div>
          <div className="text-sm text-wf-muted">Your wishlist is empty</div>
          <div className="text-xs text-wf-muted mt-1">
            Tap the heart icon on any look to add it here
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {wishlist.map((item) => (
              <div
                key={item._id}
                className="bg-wf-card rounded-xl border border-wf-border p-3 flex items-center gap-3"
              >
                <div
                  className="w-16 h-16 rounded-lg flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, #71221D, #D4A843)`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-wf-text truncate">
                    {item.sareeName}
                  </div>
                  <div className="text-xs text-wf-muted mt-0.5">
                    {item.storeId}
                  </div>
                  {item.price && (
                    <div className="text-sm text-wf-primary font-bold mt-0.5">
                      Rs.{item.price.toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    removeFromWishlist({ wishlistId: item._id })
                  }
                  className="text-wf-red text-lg cursor-pointer flex-shrink-0 px-2"
                >
                  {"\u2715"}
                </button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 bg-wf-card rounded-xl border border-wf-border p-4 flex justify-between items-center">
            <span className="text-sm font-semibold text-wf-text">Total</span>
            <span className="text-lg font-extrabold text-wf-primary">
              Rs.{total.toLocaleString("en-IN")}
            </span>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-4">
            <Btn
              primary
              onClick={() =>
                window.open(`https://wa.me/?text=${storeMessage}`, "_blank")
              }
              className="w-full"
            >
              Ask Store About My Wishlist
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}
