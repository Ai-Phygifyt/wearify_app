"use client";

import React, { useEffect, useState } from "react";

interface KioskConfig {
  storeId: string;
  storeName: string;
  tabletCode: string;
}

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<KioskConfig | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("wearify_kiosk_store");
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {
        setConfig(null);
      }
    }
    setChecked(true);
  }, []);

  // Listen for config updates from setup page
  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem("wearify_kiosk_store");
      if (stored) {
        try {
          setConfig(JSON.parse(stored));
        } catch {
          setConfig(null);
        }
      }
    };
    window.addEventListener("kiosk-configured", handler);
    return () => window.removeEventListener("kiosk-configured", handler);
  }, []);

  if (!checked) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white/40 text-lg">Loading...</div>
      </div>
    );
  }

  // Not configured -> show setup
  if (!config) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-black">
        {children}
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-wf-bg">
      {children}
    </div>
  );
}
