"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge, Btn, PageLoading } from "@/components/ui/wearify-ui";
import { Id } from "@/convex/_generated/dataModel";

const OCCASION_FILTERS = ["All", "Wedding", "Festival", "Office", "Party", "Daily", "Gift"];
const FABRIC_FILTERS = ["All", "Silk", "Cotton", "Linen", "Georgette", "Chiffon"];
const SORT_OPTIONS = ["Default", "Price: Low", "Price: High"];

export default function TabletCataloguePage() {
  const router = useRouter();
  const addToShortlist = useMutation(api.sessionOps.addToShortlist);

  const [storeId, setStoreId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [customerId, setCustomerId] = useState<Id<"customers"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [occasionFilter, setOccasionFilter] = useState("All");
  const [fabricFilter, setFabricFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Default");
  const [shortlistCount, setShortlistCount] = useState(0);
  const [showPrevious, setShowPrevious] = useState(false);

  useEffect(() => {
    const storeRaw = localStorage.getItem("wearify_tablet_store");
    const sessRaw = localStorage.getItem("wearify_tablet_session");
    const custRaw = localStorage.getItem("wearify_tablet_customer");
    if (storeRaw) {
      try { setStoreId(JSON.parse(storeRaw).storeId); } catch { /* ignore */ }
    }
    if (sessRaw) {
      try { setSessionId(JSON.parse(sessRaw).sessionId); } catch { /* ignore */ }
    }
    if (custRaw) {
      try { setCustomerId(JSON.parse(custRaw).customerId as Id<"customers">); } catch { /* ignore */ }
    }
  }, []);

  // Query sarees
  const allSarees = useQuery(
    api.sarees.listByStore,
    storeId ? { storeId } : "skip"
  );

  const searchResults = useQuery(
    api.sarees.search,
    storeId && searchTerm.trim()
      ? { storeId, searchTerm: searchTerm.trim() }
      : "skip"
  );

  // Query shortlist
  const shortlistItems = useQuery(
    api.sessionOps.getShortlist,
    sessionId ? { sessionId } : "skip"
  );

  // Query previous shortlist for returning customers
  const previousShortlist = useQuery(
    api.sessionOps.getCustomerPreviousShortlist,
    customerId && storeId && sessionId
      ? { customerId, storeId, currentSessionId: sessionId }
      : "skip"
  );

  useEffect(() => {
    setShortlistCount(shortlistItems?.length || 0);
  }, [shortlistItems]);

  // Build saree lookup map for previous shortlist display
  const sareeMap = new Map<string, NonNullable<typeof allSarees>[number]>();
  if (allSarees) {
    for (const s of allSarees) {
      sareeMap.set(s._id, s);
    }
  }

  // Determine which sarees to show
  const baseSarees = searchTerm.trim() ? searchResults : allSarees;

  // Apply filters and sort
  const filteredSarees = useMemo(() => {
    if (!baseSarees) return [];

    let result = [...baseSarees];

    // Occasion filter
    if (occasionFilter !== "All") {
      result = result.filter((s) => s.occasion === occasionFilter);
    }

    // Fabric filter
    if (fabricFilter !== "All") {
      result = result.filter((s) => s.fabric === fabricFilter);
    }

    // Sort
    if (sortOption === "Price: Low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "Price: High") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [baseSarees, occasionFilter, fabricFilter, sortOption]);

  const handleAddToShortlist = async (sareeId: Id<"sarees">) => {
    if (!sessionId || !storeId) return;
    try {
      await addToShortlist({
        sessionId,
        sareeId,
        storeId,
        ...(customerId ? { customerId } : {}),
      });
    } catch {
      // already added or error
    }
  };

  const isInShortlist = (sareeId: Id<"sarees">) => {
    return shortlistItems?.some((item) => item.sareeId === sareeId) || false;
  };

  if (!storeId) {
    return <PageLoading />;
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Search bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sarees by name, type, fabric..."
            className="w-full px-4 py-2.5 pl-10 rounded-lg border border-wf-border bg-wf-card text-sm text-wf-text focus:outline-none focus:ring-2 focus:ring-wf-primary/30 focus:border-wf-primary placeholder:text-wf-muted"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wf-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Shortlist floating badge */}
        <button
          onClick={() => router.push("/tablet/shortlist")}
          className="relative px-4 py-2.5 rounded-lg bg-wf-primary text-white text-sm font-semibold cursor-pointer hover:bg-wf-primary/90 transition-colors"
        >
          Shortlist
          {shortlistCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-wf-red text-white text-xs font-bold flex items-center justify-center">
              {shortlistCount}
            </span>
          )}
        </button>

        {/* Session button */}
        <button
          onClick={() => router.push("/tablet/session")}
          className="px-4 py-2.5 rounded-lg border border-wf-border text-sm font-semibold text-wf-subtext cursor-pointer hover:bg-wf-primary/5 transition-colors"
        >
          Session
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-1 mr-2">
          <span className="text-xs text-wf-muted">Occasion:</span>
          {OCCASION_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setOccasionFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                occasionFilter === f
                  ? "bg-wf-primary/10 text-wf-primary"
                  : "text-wf-muted hover:text-wf-subtext hover:bg-wf-border/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 mr-2">
          <span className="text-xs text-wf-muted">Fabric:</span>
          {FABRIC_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFabricFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                fabricFilter === f
                  ? "bg-wf-primary/10 text-wf-primary"
                  : "text-wf-muted hover:text-wf-subtext hover:bg-wf-border/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-wf-muted">Sort:</span>
          {SORT_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSortOption(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                sortOption === s
                  ? "bg-wf-primary/10 text-wf-primary"
                  : "text-wf-muted hover:text-wf-subtext hover:bg-wf-border/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Previously shortlisted banner for returning customers */}
      {previousShortlist && previousShortlist.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowPrevious(!showPrevious)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-wf-gold/10 border border-wf-gold/30 cursor-pointer hover:bg-wf-gold/15 transition-colors"
          >
            <span className="text-sm font-semibold text-wf-text">
              Previously Shortlisted ({previousShortlist.length})
            </span>
            <span className="text-xs text-wf-subtext">
              {showPrevious ? "Hide" : "Show"} &middot; Tap to re-add
            </span>
          </button>
          {showPrevious && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {previousShortlist.map((item) => {
                const alreadyInCurrent = isInShortlist(item.sareeId);
                const saree = sareeMap.get(item.sareeId);
                const grad = saree?.grad || ["#E8E0D4", "#D4A843"];
                return (
                  <button
                    key={item._id}
                    onClick={() => !alreadyInCurrent && handleAddToShortlist(item.sareeId)}
                    disabled={alreadyInCurrent}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left cursor-pointer transition-colors flex items-center gap-2 ${
                      alreadyInCurrent
                        ? "border-wf-green/30 bg-wf-green/5 text-wf-green"
                        : "border-wf-border bg-wf-card text-wf-text hover:border-wf-primary/40"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})` }}
                    />
                    <div className="min-w-0">
                      <div className="truncate">{saree?.name || "Saree"}</div>
                      <div className="text-[10px] text-wf-muted mt-0.5">
                        {alreadyInCurrent ? "Already added" : saree ? `₹${saree.price.toLocaleString("en-IN")}` : "Tap to re-add"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-xs text-wf-muted mb-2">
        {baseSarees === undefined ? "Loading..." : `${filteredSarees.length} sarees found`}
      </div>

      {/* Saree grid - 3 columns for landscape tablet */}
      <div className="flex-1 overflow-auto">
        {baseSarees === undefined ? (
          <PageLoading />
        ) : filteredSarees.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-wf-muted">
            No sarees found matching your criteria
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredSarees.map((saree) => {
              const grad = saree.grad || ["#E8E0D4", "#D4A843"];
              const inShortlist = isInShortlist(saree._id);

              return (
                <div
                  key={saree._id}
                  className="bg-wf-card rounded-lg border border-wf-border overflow-hidden hover:border-wf-primary/40 transition-colors"
                >
                  {/* Gradient placeholder */}
                  <button
                    onClick={() => router.push(`/tablet/catalogue/${saree._id}`)}
                    className="w-full h-32 cursor-pointer relative"
                    style={{
                      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
                    }}
                  >
                    {saree.emoji && (
                      <span className="absolute top-2 left-2 text-2xl">{saree.emoji}</span>
                    )}
                    {saree.tag && (
                      <div className="absolute top-2 right-2">
                        <Badge status={saree.tag === "Premium" ? "active" : saree.tag === "Trending" ? "progress" : "pending"}>
                          {saree.tag}
                        </Badge>
                      </div>
                    )}
                  </button>

                  {/* Card body */}
                  <div className="p-3">
                    <button
                      onClick={() => router.push(`/tablet/catalogue/${saree._id}`)}
                      className="text-left w-full cursor-pointer"
                    >
                      <div className="text-sm font-bold text-wf-text truncate">
                        {saree.name}
                      </div>
                      <div className="text-xs text-wf-subtext mt-0.5">
                        {saree.type} &middot; {saree.fabric}
                      </div>
                    </button>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-extrabold text-wf-text font-mono">
                        {"\u20B9"}{saree.price.toLocaleString("en-IN")}
                      </span>
                      {/* Stock indicator */}
                      <Badge
                        status={
                          saree.status === "active"
                            ? "active"
                            : saree.status === "low_stock"
                              ? "pending"
                              : "offline"
                        }
                      >
                        {saree.status === "active"
                          ? "In Stock"
                          : saree.status === "low_stock"
                            ? `${saree.stock} left`
                            : "Out"}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <Btn
                        primary
                        small
                        onClick={() => handleAddToShortlist(saree._id)}
                        disabled={inShortlist || saree.status === "out_of_stock"}
                        className="flex-1"
                      >
                        {inShortlist ? "In Shortlist" : "Send to Mirror"}
                      </Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
