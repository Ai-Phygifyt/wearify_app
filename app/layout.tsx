import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { getToken } from "@/lib/auth-server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wearify — Mission Control",
  description: "AI-powered virtual try-on platform for Indian saree retailers",
  manifest: "/manifest.json",
  applicationName: "Wearify",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wearify",
    startupImage: [
      {
        url: "/icons/apple-splash-2048x2732.png",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#7B1D1D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider initialToken={token}>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
