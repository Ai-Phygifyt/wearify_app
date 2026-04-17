"use client";

import React, { useEffect, useState } from "react";
import "./kiosk-theme.css";

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
      <div className="k-shell" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--k-text-muted)", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="k-shell" style={{ background: "#1A0A0A" }}>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {children}
      </div>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap"
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
