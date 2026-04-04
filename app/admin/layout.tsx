"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const ADMIN_EMAIL = "admin@wearify.com";
import {
  LayoutDashboard,
  AlertTriangle,
  Store,
  Monitor,
  Bot,
  Brain,
  TrendingUp,
  Receipt,
  Network,
  Headphones,
  Scale,
  Shield,
  Database,
  Building2,
  ScrollText,
  Rocket,
  ServerCog,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "AI Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { key: "command-center", label: "Command Center", icon: AlertTriangle, href: "/admin/command-center" },
  { key: "stores", label: "Stores", icon: Store, href: "/admin/stores" },
  { key: "devices", label: "Devices", icon: Monitor, href: "/admin/devices" },
  { key: "agents", label: "AI Agents", icon: Bot, href: "/admin/agents" },
  { key: "models", label: "AI Models", icon: Brain, href: "/admin/models" },
  { key: "revenue", label: "Revenue", icon: TrendingUp, href: "/admin/revenue" },
  { key: "billing", label: "Billing & Tax", icon: Receipt, href: "/admin/billing" },
  { key: "network", label: "Network Intel", icon: Network, href: "/admin/network" },
  { key: "support", label: "Support", icon: Headphones, href: "/admin/support" },
  { key: "legal", label: "Legal", icon: Scale, href: "/admin/legal" },
  { key: "security", label: "Security", icon: Shield, href: "/admin/security" },
  { key: "data-governance", label: "Data Governance", icon: Database, href: "/admin/data-governance" },
  { key: "vendors", label: "Vendors", icon: Building2, href: "/admin/vendors" },
  { key: "audit", label: "Audit Trail", icon: ScrollText, href: "/admin/audit" },
  { key: "releases", label: "OTA & Releases", icon: Rocket, href: "/admin/releases" },
  { key: "resilience", label: "DR & Resilience", icon: ServerCog, href: "/admin/resilience" },
  { key: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-white border-r border-wf-border z-30 flex flex-col transition-all duration-300 overflow-hidden",
        collapsed ? "w-[56px]" : "w-[210px]"
      )}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b border-wf-border flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-wf-primary flex items-center justify-center flex-shrink-0">
          <span className="text-wf-bg text-[9px] font-bold tracking-wider">W</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-[10px] text-wf-primary tracking-[3px] font-bold">WEARIFY</div>
            <div className="text-[9px] text-wf-muted">Mission Control</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md mb-0.5 text-xs font-semibold transition-all duration-150 no-underline",
                isActive
                  ? "bg-wf-primary/10 text-wf-primary"
                  : "text-wf-subtext hover:bg-wf-card hover:text-wf-text"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={14} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="p-3 border-t border-wf-border text-wf-muted hover:text-wf-text text-xs cursor-pointer bg-transparent"
      >
        {collapsed ? "→" : "← Collapse"}
      </button>
    </aside>
  );
}

function Topbar({ sidebarWidth, userEmail, onLogout }: { sidebarWidth: number; userEmail: string; onLogout: () => void }) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(i);
  }, []);

  return (
    <header
      className="fixed top-0 right-0 h-12 bg-white/80 backdrop-blur-md border-b border-wf-border z-20 flex items-center justify-between px-6"
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-wf-green animate-pulse" />
        <span className="text-xs text-wf-subtext">
          Platform Live — {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-wf-muted font-mono">v4.0</span>
        <span className="text-xs text-wf-subtext">{userEmail}</span>
        <button
          onClick={onLogout}
          title="Sign out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-wf-subtext hover:text-wf-red hover:bg-wf-red/5 transition-colors cursor-pointer bg-transparent border-none"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [userEmail, setUserEmail] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const sidebarWidth = collapsed ? 56 : 210;

  const isLoginPage = pathname === "/admin/login";

  const redirectToLogin = useCallback(() => {
    setAuthState("unauthenticated");
    router.replace("/admin/login");
  }, [router]);

  useEffect(() => {
    if (isLoginPage) {
      setAuthState("unauthenticated");
      return;
    }

    authClient.getSession().then(({ data }) => {
      if (data?.user?.email === ADMIN_EMAIL) {
        setAuthState("authenticated");
        setUserEmail(data.user.email);
      } else if (data?.user) {
        // Signed in but not the superadmin — sign out and reject
        authClient.signOut().then(() => redirectToLogin());
      } else {
        redirectToLogin();
      }
    });
  }, [isLoginPage, redirectToLogin]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace("/admin/login");
  };

  // Login page renders without the admin shell
  if (isLoginPage) {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {children}
      </>
    );
  }

  // Loading state
  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-wf-primary flex items-center justify-center">
            <span className="text-wf-bg text-xs font-bold">W</span>
          </div>
          <div className="text-sm text-wf-subtext">Loading...</div>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect is in progress
  if (authState === "unauthenticated") {
    return null;
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Topbar sidebarWidth={sidebarWidth} userEmail={userEmail} onLogout={handleLogout} />
      <main
        className="pt-12 min-h-screen bg-wf-bg transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-6">{children}</div>
      </main>
    </>
  );
}
