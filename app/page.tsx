"use client";

import { useRouter } from "next/navigation";
import {
  Shield,
  Store,
  Tablet,
  Sparkles,
  Smartphone,
  Scissors,
  ArrowUpRight,
  Languages,
  Layers,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Module = {
  title: string;
  audience: string;
  tagline: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
};

const MODULES: Module[] = [
  {
    title: "Mission Control",
    audience: "Wearify ops",
    tagline: "18-section admin console — stores, fleet, agents, compliance.",
    href: "/admin/login",
    cta: "Admin sign in",
    icon: Shield,
    accent: "#71221D",
    iconBg: "#71221D12",
  },
  {
    title: "Store Dashboard",
    audience: "Retail owners & managers",
    tagline: "Inventory, customers, staff, campaigns, analytics for your store.",
    href: "/store/login",
    cta: "Store sign in",
    icon: Store,
    accent: "#2C5F7C",
    iconBg: "#2C5F7C12",
  },
  {
    title: "Sales Tablet",
    audience: "In-store stylists",
    tagline: "PIN-auth tablet app — curate shortlists, pair customer sessions.",
    href: "/tablet/setup",
    cta: "Launch tablet",
    icon: Tablet,
    accent: "#2D8544",
    iconBg: "#2D854412",
  },
  {
    title: "Smart Mirror",
    audience: "Kiosk · in-store",
    tagline: "AI virtual try-on, 9-language, body-scan aware — the main stage.",
    href: "/kiosk",
    cta: "Open kiosk",
    icon: Sparkles,
    accent: "#B07B1A",
    iconBg: "#B07B1A14",
  },
  {
    title: "Customer App",
    audience: "End customers",
    tagline: "My looks, wardrobe, loyalty and tailor discovery in your pocket.",
    href: "/c/login",
    cta: "Customer sign in",
    icon: Smartphone,
    accent: "#7A3B8C",
    iconBg: "#7A3B8C12",
  },
  {
    title: "Tailor Studio",
    audience: "Blouse partners",
    tagline: "Orders, measurements, referrals, KYC and commission ledger.",
    href: "/tailor/login",
    cta: "Tailor sign in",
    icon: Scissors,
    accent: "#1A5F4C",
    iconBg: "#1A5F4C12",
  },
];

const FEATURE_CHIPS = [
  { icon: Sparkles, label: "AI virtual try-on" },
  { icon: Languages, label: "9 Indian languages" },
  { icon: Layers, label: "Realtime Convex backend" },
  { icon: Heart, label: "Loyalty & referrals" },
];

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-wf-bg">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-gradient-to-b from-[#71221D08] to-transparent" />

      <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-20 sm:pt-20 sm:pb-24">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-wf-primary flex items-center justify-center shadow-sm">
              <span className="text-white text-lg font-bold tracking-wider">W</span>
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold text-wf-text">Wearify</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-wf-muted">
                Try on the moment
              </div>
            </div>
          </div>
          <a
            href="mailto:hello@wearify.ai"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-wf-subtext hover:text-wf-primary transition-colors"
          >
            Talk to sales
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </header>

        <section className="mt-16 sm:mt-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-wf-border bg-wf-panel px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-wf-subtext">
            <span className="w-1.5 h-1.5 rounded-full bg-wf-green animate-pulse" />
            Live across 5 pilot stores
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-wf-text leading-[1.05]">
            AI-powered virtual try-on,
            <br />
            <span className="text-wf-primary">end-to-end for saree retail.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-wf-subtext max-w-2xl">
            Six connected surfaces — from the smart mirror on the showroom floor to the
            tailor who stitches the blouse. Pick your entry point below.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {FEATURE_CHIPS.map((chip) => (
              <div
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-wf-card border border-wf-border px-3 py-1.5 text-xs text-wf-subtext"
              >
                <chip.icon className="w-3.5 h-3.5 text-wf-primary" />
                {chip.label}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 sm:mt-16">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-wf-text">Choose a module</h2>
              <p className="text-sm text-wf-subtext mt-1">
                Each surface has its own login. All six share one live Convex backend.
              </p>
            </div>
            <div className="hidden sm:block text-[11px] uppercase tracking-[0.16em] text-wf-muted">
              6 modules
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {MODULES.map((m) => (
              <button
                key={m.title}
                onClick={() => router.push(m.href)}
                className="group relative text-left rounded-2xl bg-wf-panel border border-wf-border p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(113,34,29,0.25)] hover:border-wf-primary/30 cursor-pointer overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: m.accent }}
                />

                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ background: m.iconBg }}
                  >
                    <m.icon className="w-6 h-6" style={{ color: m.accent }} />
                  </div>
                  <ArrowUpRight
                    className="w-4 h-4 text-wf-muted group-hover:text-wf-primary transition-colors -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 duration-200"
                  />
                </div>

                <div className="mt-5">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-wf-muted font-semibold">
                    {m.audience}
                  </div>
                  <h3 className="mt-1.5 text-[17px] font-bold text-wf-text">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-wf-subtext leading-relaxed">
                    {m.tagline}
                  </p>
                </div>

                <div
                  className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold"
                  style={{ color: m.accent }}
                >
                  {m.cta}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-14 sm:mt-16 rounded-2xl bg-wf-card border border-wf-border p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-[0.16em] text-wf-muted font-semibold">
              New to Wearify?
            </div>
            <h3 className="mt-1 text-lg font-bold text-wf-text">
              Shoppers can sign up on the Customer app.
            </h3>
            <p className="mt-1 text-sm text-wf-subtext">
              Phone + OTP, no passwords. Your looks and wardrobe sync from any Wearify store.
            </p>
          </div>
          <button
            onClick={() => router.push("/c/register")}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-wf-primary text-white text-sm font-semibold px-5 py-2.5 hover:bg-wf-primary/90 transition-colors cursor-pointer whitespace-nowrap"
          >
            Create account
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </section>

        <footer className="mt-14 sm:mt-20 pt-6 border-t border-wf-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-wf-muted">
            © {new Date().getFullYear()} Phygify Technoservices Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs text-wf-muted">
            Made for Indian saree retail.
          </p>
        </footer>
      </div>
    </main>
  );
}
