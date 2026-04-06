"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KPI } from "@/components/ui/wearify-ui";

export default function TabletWelcomePage() {
  const router = useRouter();
  const createSession = useMutation(api.sessionOps.createSession);

  const [staffData, setStaffData] = useState<{
    staffId: string;
    name: string;
    role: string;
    storeId: string;
  } | null>(null);
  const [storeConfig, setStoreConfig] = useState<{
    storeId: string;
    storeName: string;
  } | null>(null);

  useEffect(() => {
    const staffRaw = localStorage.getItem("wearify_tablet_staff");
    const storeRaw = localStorage.getItem("wearify_tablet_store");
    if (staffRaw) {
      try { setStaffData(JSON.parse(staffRaw)); } catch { /* ignore */ }
    }
    if (storeRaw) {
      try { setStoreConfig(JSON.parse(storeRaw)); } catch { /* ignore */ }
    }
  }, []);

  // Get today's sessions
  const sessions = useQuery(
    api.sessionOps.listSessionsByStore,
    storeConfig ? { storeId: storeConfig.storeId } : "skip"
  );

  const todaySessions = sessions
    ? sessions.filter((s) => {
        const today = new Date().toDateString();
        return new Date(s.startTime).toDateString() === today;
      })
    : [];

  const activeSessions = todaySessions.filter((s) => s.status === "active").length;
  const completedSessions = todaySessions.filter((s) => s.status === "completed").length;

  const handleGuestSession = async () => {
    if (!storeConfig || !staffData) return;
    try {
      const sessionId = await createSession({
        storeId: storeConfig.storeId,
        storeName: storeConfig.storeName,
        staffId: staffData.staffId as any,
        staffName: staffData.name,
        tabletLinked: true,
      });
      localStorage.setItem(
        "wearify_tablet_session",
        JSON.stringify({ sessionId, startTime: Date.now() })
      );
      router.push("/tablet/catalogue");
    } catch {
      // silently handle
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* KPIs row */}
      <div className="flex gap-4 mb-8">
        <KPI label="Today's Sessions" value={todaySessions.length} subtitle={`${activeSessions} active`} />
        <KPI label="Completed" value={completedSessions} />
        <KPI
          label="Staff"
          value={staffData?.name || "---"}
          subtitle={staffData?.role === "R03" ? "Owner" : staffData?.role === "R04" ? "Manager" : "Salesperson"}
        />
      </div>

      {/* Welcome area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-xl font-extrabold text-wf-text mb-2">
          Welcome to {storeConfig?.storeName || "Wearify"}
        </h1>
        <p className="text-sm text-wf-subtext mb-10">
          How would you like to start?
        </p>

        {/* Three large action buttons */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
          {/* New Customer */}
          <button
            onClick={() => router.push("/tablet/register")}
            className="group flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-wf-card border-2 border-wf-border hover:border-wf-primary hover:bg-wf-primary/5 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-wf-green/10 flex items-center justify-center text-3xl">
              +
            </div>
            <div>
              <div className="text-base font-bold text-wf-text group-hover:text-wf-primary transition-colors">
                New Customer
              </div>
              <div className="text-xs text-wf-subtext mt-1">
                Register & start session
              </div>
            </div>
          </button>

          {/* Returning Customer */}
          <button
            onClick={() => router.push("/tablet/phone")}
            className="group flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-wf-card border-2 border-wf-border hover:border-wf-primary hover:bg-wf-primary/5 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-wf-blue/10 flex items-center justify-center text-3xl">
              {"<->"}
            </div>
            <div>
              <div className="text-base font-bold text-wf-text group-hover:text-wf-primary transition-colors">
                Returning Customer
              </div>
              <div className="text-xs text-wf-subtext mt-1">
                Look up by phone number
              </div>
            </div>
          </button>

          {/* Browse as Guest */}
          <button
            onClick={handleGuestSession}
            className="group flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-wf-card border-2 border-wf-border hover:border-wf-primary hover:bg-wf-primary/5 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-wf-amber/10 flex items-center justify-center text-3xl">
              {"~"}
            </div>
            <div>
              <div className="text-base font-bold text-wf-text group-hover:text-wf-primary transition-colors">
                Browse as Guest
              </div>
              <div className="text-xs text-wf-subtext mt-1">
                Quick catalogue browse
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
