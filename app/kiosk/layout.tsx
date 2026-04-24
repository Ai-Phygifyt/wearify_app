"use client";

import React, { useEffect, useState } from "react";
import "./kiosk-theme.css";

interface KioskConfig {
  storeId: string;
  storeName: string;
  deviceId?: string;
  deviceToken?: string;
  deviceLabel?: string;
  pairedAt?: number;
}

// Read the stored kiosk config once. Runs in the initializer so React
// never sees a "null" flash on mount. Legacy configs (no deviceToken) are
// wiped so the technician lands on /kiosk/setup.
function loadStoredConfig(): KioskConfig | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem("wearify_kiosk_store");
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as KioskConfig;
    if (parsed.deviceToken) return parsed;
    window.localStorage.removeItem("wearify_kiosk_store");
    return null;
  } catch {
    return null;
  }
}

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<KioskConfig | null>(() => loadStoredConfig());
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Flip checked after first render so SSR/hydration doesn't mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecked(true);
  }, []);

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem("wearify_kiosk_store");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as KioskConfig;
          if (parsed.deviceToken) setConfig(parsed);
          else setConfig(null);
        } catch {
          setConfig(null);
        }
      } else {
        setConfig(null);
      }
    };
    window.addEventListener("kiosk-configured", handler);
    return () => window.removeEventListener("kiosk-configured", handler);
  }, []);

  if (!checked) {
    return (
      <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--k-text-muted)", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <div className="k-shell" style={{
          alignItems: "center",
          justifyContent: "center",
        }}>
          {children}
          <div className="k-footer">
            © Copyright PHYGIFY TECHNO SERVICES PVT. LTD.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="k-shell">
        {children}
        <div className="k-footer">
          © Copyright PHYGIFY TECHNO SERVICES PVT. LTD.
        </div>
      </div>
    </>
  );
}
