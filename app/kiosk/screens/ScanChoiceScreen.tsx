export function ScanChoiceScreen({ customerName, hasPreviousScan, onUsePrevious, onRescan }: {
  customerName: string;
  hasPreviousScan: boolean;
  onUsePrevious: () => void;
  onRescan: () => void;
}) {
  const heading = hasPreviousScan
    ? `Welcome back${customerName ? `, ${customerName.split(" ")[0]}` : ""}`
    : `Welcome${customerName ? `, ${customerName.split(" ")[0]}` : ""}`;
  const subtitle = hasPreviousScan
    ? "We found your previous body scan. Our AI can use it for your try-on, or you can take a fresh scan."
    : "Let’s capture a quick body scan so our AI can render sarees on you.";

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
            <img src="/kiosk/octicon.svg" alt="" aria-hidden width={64} />
          </div>
          <h2 className="k-scan-choice-title">{heading}</h2>
          <p className="k-scan-choice-subtitle">{subtitle}</p>

          <div className="k-scan-choice-actions">
            {hasPreviousScan && (
              <button onClick={onUsePrevious} className="k-scan-choice-btn k-scan-choice-btn-primary">
                Use Previous Scan
              </button>
            )}
            <button
              onClick={onRescan}
              className={
                hasPreviousScan
                  ? "k-scan-choice-btn k-scan-choice-btn-secondary"
                  : "k-scan-choice-btn k-scan-choice-btn-primary"
              }
            >
              {hasPreviousScan ? "Take Fresh Scan" : "Start Body Scan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
