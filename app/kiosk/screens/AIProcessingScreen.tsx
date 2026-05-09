import { useEffect, useMemo, useRef } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// =========================================================================
// AIProcessingScreen — real-progress transition between "send to trial"
// (or post-bodyScan) and the trial room.
//
// Behavior:
//   - Subscribes to the actual `looks` rows for the trial items via
//     tryOn.getLooksByIds. Status flows queued → processing → completed
//     reactively as RunPod renders complete.
//   - Auto-advances (calls onDone) the moment the FIRST look completes.
//     The trial room handles the rest with per-tile wave animations.
//   - Hard 60s safety timeout so a stuck render never traps the customer.
//   - If trialItems.length === 0 the parent should NOT mount this screen
//     and route directly to home — the empty state has nothing to show.
// =========================================================================

type TrialItemRef = { _id: Id<"sarees"> };

export function AIProcessingScreen({
  trialItems,
  sareeLookIds,
  onDone,
}: {
  trialItems: TrialItemRef[];
  sareeLookIds: Record<string, Id<"looks">>;
  onDone: () => void;
}) {
  // Snapshot lookIds for items that actually have one. The reconciliation
  // effect populates these asynchronously (especially after a deferred
  // body-scan capture) so the list can grow during this screen's lifetime —
  // useMemo + the trialItems / sareeLookIds deps keeps the array fresh
  // without churning the useQuery key on every render.
  const lookIds = useMemo(
    () =>
      trialItems
        .map((item) => sareeLookIds[item._id])
        .filter((id): id is Id<"looks"> => id !== undefined),
    [trialItems, sareeLookIds],
  );

  const looks = useQuery(
    api.tryOn.getLooksByIds,
    lookIds.length > 0 ? { lookIds } : "skip",
  );

  const total = trialItems.length;
  const completed = looks?.filter((l) => l.status === "completed").length ?? 0;
  const failed = looks?.filter((l) => l.status === "failed").length ?? 0;
  const inFlight = Math.max(0, total - completed - failed);

  // Bar percentage — counts terminal states (completed + failed) toward
  // progress so a failed look doesn't hold the bar at 0%. The trial room
  // shows failed tiles with a Retry CTA, so propagating them as "done"
  // here is honest.
  const pct = total > 0 ? Math.round(((completed + failed) / total) * 100) : 0;

  // onDone is typically an inline arrow at the parent, so its identity
  // changes on every parent re-render. Pin the callback in a ref so the
  // safety-timer effect below can run mount-only (otherwise reactive
  // query updates would reset the 60s timer indefinitely and the safety
  // path would never fire). Sync via an effect-after-render rather than
  // assigning during render (linter prefers it; behaviorally equivalent
  // for our use because the ref is read inside other effects/timeouts,
  // never during render).
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  // Auto-advance when ANY look reaches a terminal state (completed or
  // failed) AND the total work is done — covers the "all failed" case
  // (caption used to read "Finishing up" forever and the customer was
  // trapped). For partial completion, advance on the first success;
  // the trial room handles remaining in-flight items with per-tile
  // wave animations.
  useEffect(() => {
    if (total === 0) return;
    if (completed + failed >= total) {
      onDoneRef.current();
      return;
    }
    if (completed >= 1) onDoneRef.current();
  }, [completed, failed, total]);

  // Safety timeout — never trap the customer. 60s is generous enough to
  // cover a typical RunPod cold start (~30-60s). Mount-only effect
  // (empty deps) so the timer measures real wall-clock time, not the
  // distance from the most recent reactive query update.
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), 60_000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="k-shell" style={{ alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
      <div
        className="k-popIn k-breathe"
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(104,38,42,.1), rgba(201,148,26,.12))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--k-maroon)",
          marginBottom: 20,
        }}
      >
        <Sparkles size={36} strokeWidth={2} />
      </div>
      <h2 className="k-display" style={{ fontSize: 22 }}>Creating your look</h2>
      <p style={{ fontSize: 13, color: "var(--k-text-muted)", marginTop: 4 }}>
        {inFlight > 0
          ? "Our AI is tailoring it just for you"
          : completed === total
            ? "All set — opening your trial room"
            : "Finishing up"}
      </p>
      <div
        style={{
          width: "min(70%, 420px)",
          height: 5,
          borderRadius: "var(--k-r-pill)",
          background: "var(--k-border-l)",
          marginTop: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg, var(--k-maroon), var(--k-gold))",
            borderRadius: "var(--k-r-pill)",
            transition: "width .8s ease",
          }}
        />
      </div>
      <div className="k-mono" style={{ fontSize: 16, color: "var(--k-text-muted)", marginTop: 14 }}>
        {completed} of {total} ready
        {failed > 0 ? ` · ${failed} failed` : ""}
      </div>
      <div className="k-chip k-chip-green k-slideUp k-d3" style={{ marginTop: 24 }}>
        <ShieldCheck size={14} /> Securely saved
      </div>
    </div>
  );
}
