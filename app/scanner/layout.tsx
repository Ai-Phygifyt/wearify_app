import React from "react";
import "../kiosk/kiosk-theme.css";

// Standalone scanner module — reuses the kiosk body-scan UI/theme but without
// the kiosk's device-pairing gate, so /scanner works as its own entry point.
export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
