import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ConsentScreen({
  onAllow,
  onSkip,
}: {
  onAllow: () => void | Promise<void>;
  onSkip: () => void;
}) {
  const [requesting, setRequesting] = useState(false);

  async function handleAllow() {
    if (requesting) return;
    setRequesting(true);
    try {
      await onAllow();
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="k-pair-shell">
      <div className="k-lang-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-1.svg" alt="" aria-hidden className="k-lang-bg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kiosk/ideal-screen-2.svg" alt="" aria-hidden className="k-lang-overlay" />
      </div>

      <div className="k-scan-choice-overlay">
        <div className="k-scan-choice-modal k-scaleIn">
          <div className="k-scan-choice-icon k-popIn">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kiosk/try-on.svg" alt="" aria-hidden width={44} />
          </div>
          <h2 className="k-scan-choice-title">Start Your Try-On</h2>
          <p className="k-scan-choice-subtitle">
            We&rsquo;ll use the camera on this mirror to capture your look, Images are saved securely and you can delete them anytime.
          </p>

          <div className="k-scan-choice-actions">
            <button
              onClick={handleAllow}
              disabled={requesting}
              className="k-scan-choice-btn k-scan-choice-btn-primary"
            >
              {requesting ? (<><Loader2 size={18} className="k-spin" /> Opening…</>) : "Allow"}
            </button>
            <button
              onClick={onSkip}
              disabled={requesting}
              className="k-scan-choice-btn k-scan-choice-btn-secondary"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
