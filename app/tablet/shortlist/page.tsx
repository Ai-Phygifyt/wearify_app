"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge, Btn, PageLoading } from "@/components/ui/wearify-ui";
import { Id } from "@/convex/_generated/dataModel";

export default function TabletShortlistPage() {
  const router = useRouter();
  const removeFromShortlist = useMutation(api.sessionOps.removeFromShortlist);
  const markSentToMirror = useMutation(api.sessionOps.markSentToMirror);
  const generateCode = useMutation(api.trialRoom.generateCode);

  const [sessionId, setSessionId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [customerId, setCustomerId] = useState<Id<"customers"> | undefined>(undefined);
  const [customerPhone, setCustomerPhone] = useState<string | undefined>(undefined);
  const [staffId, setStaffId] = useState<Id<"staff"> | undefined>(undefined);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [trialCode, setTrialCode] = useState("");
  const [codeExpiresAt, setCodeExpiresAt] = useState(0);
  const [codeCountdown, setCodeCountdown] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const sessRaw = localStorage.getItem("wearify_tablet_session");
    const storeRaw = localStorage.getItem("wearify_tablet_store");
    const custRaw = localStorage.getItem("wearify_tablet_customer");
    const staffRaw = localStorage.getItem("wearify_tablet_staff");
    if (sessRaw) try { setSessionId(JSON.parse(sessRaw).sessionId); } catch { /* ignore */ }
    if (storeRaw) try { setStoreId(JSON.parse(storeRaw).storeId); } catch { /* ignore */ }
    if (custRaw) {
      try {
        const cust = JSON.parse(custRaw);
        setCustomerId(cust.customerId as Id<"customers">);
        setCustomerPhone(cust.phone);
      } catch { /* ignore */ }
    }
    if (staffRaw) {
      try { setStaffId(JSON.parse(staffRaw).staffId as Id<"staff">); } catch { /* ignore */ }
    }
  }, []);

  // Fetch shortlist items
  const shortlistItems = useQuery(
    api.sessionOps.getShortlist,
    sessionId ? { sessionId } : "skip"
  );

  // Fetch all sarees for this store to get details
  const allSarees = useQuery(
    api.sarees.listByStore,
    storeId ? { storeId } : "skip"
  );

  // Check for existing trial room code
  const existingTrialRoom = useQuery(
    api.trialRoom.getBySession,
    sessionId ? { sessionId } : "skip"
  );

  // Build lookup map
  const sareeMap = new Map<string, NonNullable<typeof allSarees>[number]>();
  if (allSarees) {
    for (const s of allSarees) {
      sareeMap.set(s._id, s);
    }
  }

  // Countdown timer for code expiry
  useEffect(() => {
    if (!codeExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, codeExpiresAt - Date.now());
      if (remaining <= 0) {
        setCodeCountdown("Expired");
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCodeCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [codeExpiresAt]);

  const handleRemove = async (shortlistId: Id<"shortlist">) => {
    try {
      await removeFromShortlist({ shortlistId });
    } catch { /* ignore */ }
  };

  const handleGenerateCodeAndSend = useCallback(async (itemIds?: Id<"shortlist">[]) => {
    if (!sessionId || !storeId) return;
    setSending(true);
    try {
      // Mark items as sent to mirror
      if (itemIds) {
        for (const id of itemIds) {
          await markSentToMirror({ shortlistId: id });
        }
      } else if (shortlistItems) {
        for (const item of shortlistItems) {
          if (!item.sentToMirror) {
            await markSentToMirror({ shortlistId: item._id });
          }
        }
      }

      // Generate or retrieve trial room code
      const result = await generateCode({
        sessionId,
        storeId,
        customerId,
        customerPhone,
        staffId,
      });

      setTrialCode(result.code);
      setCodeExpiresAt(result.expiresAt);
      setShowCodeModal(true);
    } catch (err) {
      console.error("Failed to generate code:", err);
    } finally {
      setSending(false);
    }
  }, [sessionId, storeId, customerId, customerPhone, staffId, shortlistItems, markSentToMirror, generateCode]);

  const handleSendSingleToMirror = async (shortlistId: Id<"shortlist">) => {
    await handleGenerateCodeAndSend([shortlistId]);
  };

  const handleSendAllToMirror = async () => {
    await handleGenerateCodeAndSend();
  };

  const handleShowExistingCode = () => {
    if (existingTrialRoom) {
      setTrialCode(existingTrialRoom.code);
      setCodeExpiresAt(existingTrialRoom.expiresAt);
      setShowCodeModal(true);
    }
  };

  const sentCount = shortlistItems?.filter((i) => i.sentToMirror).length || 0;
  const totalCount = shortlistItems?.length || 0;

  if (!sessionId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-wf-muted mb-4">No active session</p>
          <Btn primary onClick={() => router.push("/tablet")}>
            Start a Session
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-wf-text">Shortlist</h1>
          <p className="text-sm text-wf-subtext">
            {totalCount} {totalCount === 1 ? "item" : "items"} shortlisted &middot; {sentCount} sent to mirror
          </p>
        </div>
        <div className="flex gap-3">
          <Btn onClick={() => router.push("/tablet/catalogue")}>
            Back to Catalogue
          </Btn>
          {existingTrialRoom && (
            <Btn onClick={handleShowExistingCode}>
              View Code
            </Btn>
          )}
          <Btn
            primary
            onClick={handleSendAllToMirror}
            disabled={totalCount === 0 || sentCount === totalCount || sending}
          >
            {sending ? "Sending..." : "Send All to Mirror"}
          </Btn>
        </div>
      </div>

      {/* Session summary card */}
      <div className="flex gap-4 mb-4">
        <div className="bg-wf-card rounded-lg border border-wf-border px-5 py-3 flex-1">
          <div className="text-xs text-wf-subtext mb-0.5">Items Shortlisted</div>
          <div className="text-2xl font-extrabold text-wf-text font-mono">{totalCount}</div>
        </div>
        <div className="bg-wf-card rounded-lg border border-wf-border px-5 py-3 flex-1">
          <div className="text-xs text-wf-subtext mb-0.5">Sent to Mirror</div>
          <div className="text-2xl font-extrabold text-wf-green font-mono">{sentCount}</div>
        </div>
        <div className="bg-wf-card rounded-lg border border-wf-border px-5 py-3 flex-1">
          <div className="text-xs text-wf-subtext mb-0.5">Pending</div>
          <div className="text-2xl font-extrabold text-wf-amber font-mono">{totalCount - sentCount}</div>
        </div>
      </div>

      {/* Shortlist items */}
      <div className="flex-1 overflow-auto">
        {shortlistItems === undefined ? (
          <PageLoading />
        ) : shortlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <p className="text-sm text-wf-muted">No items in shortlist yet</p>
            <Btn primary onClick={() => router.push("/tablet/catalogue")}>
              Browse Catalogue
            </Btn>
          </div>
        ) : (
          <div className="space-y-3">
            {shortlistItems.map((item) => {
              const saree = sareeMap.get(item.sareeId);
              if (!saree) return null;

              const grad = saree.grad || ["#E8E0D4", "#D4A843"];

              return (
                <div
                  key={item._id}
                  className="bg-wf-card rounded-lg border border-wf-border p-4 flex items-center gap-4"
                >
                  {/* Gradient thumbnail */}
                  <div
                    className="w-20 h-20 rounded-lg flex-shrink-0 relative"
                    style={{
                      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1] || grad[0]})`,
                    }}
                  >
                    {saree.emoji && (
                      <span className="absolute inset-0 flex items-center justify-center text-xl">
                        {saree.emoji}
                      </span>
                    )}
                  </div>

                  {/* Saree info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-wf-text truncate">
                      {saree.name}
                    </div>
                    <div className="text-xs text-wf-subtext mt-0.5">
                      {saree.type} &middot; {saree.fabric}
                    </div>
                    <div className="text-base font-extrabold text-wf-text font-mono mt-1">
                      {"\u20B9"}{saree.price.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Mirror status */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => !item.sentToMirror && handleSendSingleToMirror(item._id)}
                      disabled={!!item.sentToMirror || sending}
                      className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        item.sentToMirror
                          ? "bg-wf-green/10 text-wf-green"
                          : "bg-wf-primary text-white hover:bg-wf-primary/90"
                      }`}
                    >
                      {item.sentToMirror ? "Sent to Mirror" : "Send to Mirror"}
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-wf-red hover:bg-wf-red/10 cursor-pointer transition-colors text-sm font-bold"
                      title="Remove from shortlist"
                    >
                      X
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trial Room Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-[420px] shadow-2xl text-center">
            <div className="text-sm text-wf-subtext mb-2">Trial Room Code</div>
            <div className="text-5xl font-extrabold font-mono tracking-[0.3em] text-wf-primary mb-4">
              {trialCode}
            </div>
            <div className="text-sm text-wf-subtext mb-1">
              Enter this code on the mirror to start try-on
            </div>
            <div className={`text-sm font-semibold mb-6 ${codeCountdown === "Expired" ? "text-wf-red" : "text-wf-green"}`}>
              {codeCountdown === "Expired" ? "Code expired" : `Expires in ${codeCountdown}`}
            </div>
            <div className="flex gap-3 justify-center">
              <Btn onClick={() => setShowCodeModal(false)}>
                Close
              </Btn>
              {codeCountdown === "Expired" && (
                <Btn primary onClick={handleSendAllToMirror}>
                  Generate New Code
                </Btn>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
