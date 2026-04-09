"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/wearify-ui";

interface StoreConfig {
  storeId: string;
  storeName: string;
}

interface StaffData {
  staffId: string;
  name: string;
  role: string;
  storeId: string;
}

export default function TabletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState("");
  const [language, setLanguage] = useState("EN");
  const [checked, setChecked] = useState(false);

  // Single effect: read localStorage AND redirect in one pass (no race)
  useEffect(() => {
    const isSetup = pathname === "/tablet/setup";
    const isPin = pathname === "/tablet/pin";

    const storeRaw = localStorage.getItem("wearify_tablet_store");
    const staffRaw = localStorage.getItem("wearify_tablet_staff");
    const sessRaw = localStorage.getItem("wearify_tablet_session");

    let store: StoreConfig | null = null;
    let staff: StaffData | null = null;

    if (storeRaw) {
      try { store = JSON.parse(storeRaw); } catch { /* ignore */ }
    }
    if (staffRaw) {
      try { staff = JSON.parse(staffRaw); } catch { /* ignore */ }
    }
    if (sessRaw) {
      try {
        const sess = JSON.parse(sessRaw);
        setSessionId(sess.sessionId);
        setSessionStart(sess.startTime);
      } catch { /* ignore */ }
    }

    setStoreConfig(store);
    setStaffData(staff);

    // Redirect logic — uses freshly-read values, not stale state
    if (!store && !isSetup) {
      window.location.href = "/tablet/setup";
      return;
    }
    if (store && !staff && !isSetup && !isPin) {
      window.location.href = "/tablet/pin";
      return;
    }

    setChecked(true);
  }, [pathname]);

  // Session timer
  useEffect(() => {
    if (!sessionStart) { setElapsed(""); return; }
    const interval = setInterval(() => {
      const diff = Date.now() - sessionStart;
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${m}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  // Query mirror devices for this store
  const devices = useQuery(
    api.devices.getByStoreId,
    storeConfig ? { storeId: storeConfig.storeId } : "skip"
  );
  const mirrorOnline = devices
    ? devices.some((d) => d.type === "Mirror" && d.status === "online")
    : false;

  // Skip status bar for setup and pin pages
  const isAuthPage = pathname === "/tablet/setup" || pathname === "/tablet/pin";

  if (!checked) {
    return (
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <div className="animate-pulse text-wf-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wf-bg flex flex-col">
      {/* Top Status Bar */}
      {!isAuthPage && storeConfig && staffData && (
        <header className="bg-wf-card border-b border-wf-border px-6 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-base font-bold text-wf-primary">
              {storeConfig.storeName}
            </span>
            <span className="text-sm text-wf-subtext">
              {staffData.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Session timer */}
            {elapsed && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-wf-subtext">Session</span>
                <span className="text-sm font-mono font-semibold text-wf-text">
                  {elapsed}
                </span>
              </div>
            )}

            {/* Mirror status */}
            <Badge status={mirrorOnline ? "online" : "offline"}>
              Mirror {mirrorOnline ? "Online" : "Offline"}
            </Badge>

            {/* Language selector */}
            <button
              onClick={() => setLanguage(language === "EN" ? "HI" : "EN")}
              className="px-3 py-1 rounded text-xs font-semibold border border-wf-border text-wf-subtext hover:bg-wf-primary/5 cursor-pointer transition-colors"
            >
              {language}
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem("wearify_tablet_staff");
                localStorage.removeItem("wearify_tablet_session");
                window.location.href = "/tablet/pin";
              }}
              className="px-3 py-1 rounded text-xs font-semibold text-wf-red hover:bg-wf-red/10 cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
