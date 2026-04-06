"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Btn, Badge, Card, KPI } from "@/components/ui/wearify-ui";

export default function TabletSessionPage() {
  const router = useRouter();
  const endSession = useMutation(api.sessionOps.endSession);
  const updateSession = useMutation(api.sessionOps.updateSession);

  const [sessionId, setSessionId] = useState("");
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState("");
  const [customerData, setCustomerData] = useState<{ customerId: string; name: string; phone: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState("");

  useEffect(() => {
    const sessRaw = localStorage.getItem("wearify_tablet_session");
    const custRaw = localStorage.getItem("wearify_tablet_customer");
    if (sessRaw) {
      try {
        const s = JSON.parse(sessRaw);
        setSessionId(s.sessionId);
        setSessionStart(s.startTime);
      } catch { /* ignore */ }
    }
    if (custRaw) {
      try { setCustomerData(JSON.parse(custRaw)); } catch { /* ignore */ }
    }
  }, []);

  // Timer
  useEffect(() => {
    if (!sessionStart || completed) return;
    const interval = setInterval(() => {
      const diff = Date.now() - sessionStart;
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${m}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart, completed]);

  // Fetch session data
  const session = useQuery(
    api.sessionOps.getSession,
    sessionId ? { sessionId } : "skip"
  );

  // Fetch shortlist
  const shortlistItems = useQuery(
    api.sessionOps.getShortlist,
    sessionId ? { sessionId } : "skip"
  );

  const shortlistCount = shortlistItems?.length || 0;
  const sentToMirrorCount = shortlistItems?.filter((i) => i.sentToMirror).length || 0;

  const handleComplete = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const result = await endSession({ sessionId });
      setDuration(result.duration);
      setCompleted(true);
      setShowFeedback(true);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleRating = async (r: number) => {
    setRating(r);
    if (sessionId) {
      try {
        await updateSession({
          sessionId,
          rating: r,
          sareesTriedOn: sentToMirrorCount,
          sareesBrowsed: shortlistCount,
        });
      } catch { /* ignore */ }
    }
  };

  const handleNewSession = () => {
    localStorage.removeItem("wearify_tablet_session");
    localStorage.removeItem("wearify_tablet_customer");
    router.replace("/tablet");
  };

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
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-wf-text">Session</h1>
            <p className="text-xs text-wf-muted font-mono">{sessionId}</p>
          </div>
          {!completed && (
            <Badge status={session?.status === "active" ? "active" : "completed"}>
              {session?.status || "active"}
            </Badge>
          )}
          {completed && (
            <Badge status="resolved">Completed</Badge>
          )}
        </div>

        {/* KPIs */}
        <div className="flex gap-4 mb-6">
          <KPI
            label="Duration"
            value={completed ? duration : elapsed}
            subtitle={completed ? "Session ended" : "Running"}
          />
          <KPI
            label="Shortlisted"
            value={shortlistCount}
          />
          <KPI
            label="Sent to Mirror"
            value={sentToMirrorCount}
            color="var(--color-wf-green)"
          />
        </div>

        {/* Customer info */}
        {customerData && (
          <Card title="Customer" className="mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-wf-primary/10 flex items-center justify-center text-base font-bold text-wf-primary">
                {customerData.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-wf-text">{customerData.name}</div>
                <div className="text-xs text-wf-subtext">{customerData.phone}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Session details */}
        <Card title="Session Details" className="mb-4">
          <div className="grid grid-cols-2 gap-4">
            {session?.occasion && (
              <div>
                <div className="text-xs text-wf-muted">Occasion</div>
                <div className="text-sm font-semibold text-wf-text">{session.occasion}</div>
              </div>
            )}
            {session?.budget && (
              <div>
                <div className="text-xs text-wf-muted">Budget</div>
                <div className="text-sm font-semibold text-wf-text">{session.budget}</div>
              </div>
            )}
            {session?.staffName && (
              <div>
                <div className="text-xs text-wf-muted">Staff</div>
                <div className="text-sm font-semibold text-wf-text">{session.staffName}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-wf-muted">Started</div>
              <div className="text-sm font-semibold text-wf-text">
                {session?.startTime
                  ? new Date(session.startTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--"}
              </div>
            </div>
          </div>
        </Card>

        {/* Sarees tried summary */}
        <Card title={`Sarees (${shortlistCount})`} className="mb-6">
          {shortlistItems && shortlistItems.length > 0 ? (
            <div className="space-y-2">
              {shortlistItems.map((item, i) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm text-wf-text">
                    {i + 1}. Saree
                  </span>
                  <Badge status={item.sentToMirror ? "active" : "pending"}>
                    {item.sentToMirror ? "Tried" : "Shortlisted"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-wf-muted">No sarees shortlisted</p>
          )}
        </Card>

        {/* Feedback section (shown after completion) */}
        {showFeedback && (
          <Card title="Session Feedback" className="mb-6">
            <p className="text-sm text-wf-subtext mb-4">
              How was the experience? Rate this session.
            </p>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`w-12 h-12 rounded-lg text-xl cursor-pointer transition-all ${
                    star <= rating
                      ? "bg-wf-amber text-white"
                      : "bg-wf-bg border border-wf-border text-wf-muted hover:border-wf-amber"
                  }`}
                >
                  {star <= rating ? "\u2605" : "\u2606"}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-wf-green font-semibold">
                {rating >= 4
                  ? "Great session!"
                  : rating >= 3
                    ? "Good session"
                    : "Thanks for the feedback"}
              </p>
            )}
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center pt-4">
          {!completed && (
            <>
              <Btn onClick={() => router.push("/tablet/catalogue")}>
                Back to Catalogue
              </Btn>
              <Btn onClick={() => router.push("/tablet/shortlist")}>
                View Shortlist
              </Btn>
              <Btn danger onClick={handleComplete} disabled={loading}>
                {loading ? "Ending..." : "Complete Session"}
              </Btn>
            </>
          )}
          {completed && (
            <Btn primary onClick={handleNewSession} className="px-10">
              Start New Session
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}
