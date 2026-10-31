"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Overview / Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "My Projects", href: "/projects", icon: "folder_open" },
  { label: "Simulation Workspace", href: "/workspace", icon: "science" },
  { label: "Scenario Comparison", href: "/scenario-comparison", icon: "compare_arrows" },
  { label: "Analytics & Telemetry", href: "/analytics", icon: "insights" },
  { label: "AI Assistant (Muse)", href: "/workspace?mode=ai", icon: "neurology", badge: "3.1" },
  { label: "Media Studio (SAM 3.1)", href: "/workspace?mode=media", icon: "video_settings" },
  { label: "Collaboration & Velt", href: "/dashboard#velt", icon: "forum", badge: "LIVE" },
  { label: "Settings & Integrations", href: "/settings", icon: "tune" },
  { label: "Documentation & API", href: "http://localhost:8000/docs", icon: "terminal" },
];

export function StitchSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[var(--surface-container-low)]/80 backdrop-blur-2xl z-50 flex flex-col justify-between border-r border-[var(--outline-variant)]/20 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 gap-2 bg-[var(--surface-container)]/30 border-b border-[var(--outline-variant)]/10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="material-symbols-outlined text-[var(--primary)] text-2xl group-hover:scale-110 transition-transform">
              hub
            </span>
            <span className="font-headline text-lg font-bold tracking-tight text-[var(--on-surface)]">
              Dream2Sim
            </span>
          </Link>
          <span className="font-telemetry text-[10px] uppercase font-bold tracking-widest bg-[var(--primary-container)]/20 text-[var(--primary)] px-2 py-0.5 rounded border border-[var(--primary)]/30">
            CORE
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--primary-container)] text-white shadow-[0_0_16px_rgba(177,59,255,0.3)] font-semibold"
                    : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-white" : "text-[var(--primary)]"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`font-telemetry text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? "bg-white/20 text-white" : "bg-[var(--tertiary)]/20 text-[var(--tertiary)] font-bold"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Telemetry and System Health Footer */}
      <div className="p-4 flex flex-col gap-2.5 bg-[var(--surface-container)]/40 border-t border-[var(--outline-variant)]/15">
        <div className="bg-[var(--surface-container-high)]/60 backdrop-blur-md rounded-lg p-2.5 flex items-center justify-between border border-[var(--outline-variant)]/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] shadow-[0_0_8px_var(--gold-glow)] animate-pulse"></span>
            <span className="font-telemetry text-xs text-[var(--on-surface)] font-medium">
              Muse Spark 3.1
            </span>
          </div>
          <span className="font-telemetry text-[10px] font-bold text-[var(--primary)] bg-[var(--primary-container)]/20 px-1.5 py-0.5 rounded border border-[var(--primary)]/20">
            READY
          </span>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[var(--primary)] text-sm">
              sensors
            </span>
            <span className="font-telemetry text-xs text-[var(--on-surface-variant)]">
              Sys Health 99.98%
            </span>
          </div>
          <span className="font-telemetry text-[10px] text-[var(--secondary)] font-semibold">
            PROD-US
          </span>
        </div>
      </div>
    </aside>
  );
}
