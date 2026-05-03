"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISSED_KEY = "wearify_pwa_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    // Already running standalone? No prompt.
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !evt) return null;

  const onInstall = async () => {
    await evt.prompt();
    await evt.userChoice;
    setEvt(null);
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  const onDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setEvt(null);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Install Wearify"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 84,
        zIndex: 200,
        background: "rgba(20, 14, 10, 0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(184,134,11,0.45)",
        borderRadius: 16,
        padding: "14px 14px 14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 18px 50px -12px rgba(0,0,0,0.55)",
        animation: "cx-slideUp 0.3s ease-out",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "rgba(184,134,11,0.18)",
          border: "1px solid rgba(184,134,11,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Download size={18} color="#C9941A" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#FBF7F1",
            letterSpacing: "0.01em",
          }}
        >
          Install Wearify
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(253,248,240,0.6)",
            marginTop: 2,
          }}
        >
          Add to home screen for the full app feel
        </div>
      </div>
      <button
        onClick={onInstall}
        style={{
          padding: "8px 14px",
          borderRadius: 999,
          border: "none",
          background: "#C9941A",
          color: "#1A0F08",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Install
      </button>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          border: "none",
          background: "rgba(255,255,255,0.06)",
          color: "rgba(253,248,240,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
