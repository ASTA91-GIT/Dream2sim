"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";

interface StitchHeaderProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function StitchHeader({ breadcrumbs }: StitchHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [engineHealthy, setEngineHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/health")
      .then((res) => setEngineHealthy(res.ok))
      .catch(() => setEngineHealthy(false));
  }, []);

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-[var(--surface-container-low)]/80 backdrop-blur-2xl z-40 border-b border-[var(--outline-variant)]/15 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-6 flex items-center justify-between gap-4">
        {/* Left: Branding & Dynamic Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-headline text-base font-bold tracking-tight text-[var(--on-surface)] hidden sm:inline">
              Dream2Sim
            </span>
            <span className="font-telemetry text-[10px] font-bold bg-[var(--primary-container)]/25 text-[var(--primary)] px-2 py-0.5 rounded border border-[var(--primary)]/30">
              SIM-CORE v2.5
            </span>
          </div>

          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden xl:flex items-center gap-1.5 text-[var(--on-surface-variant)] font-telemetry text-xs truncate">
              <span className="text-[var(--outline)]">/</span>
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={b.label}>
                  {i > 0 && <span className="text-[var(--outline)]">/</span>}
                  {b.href ? (
                    <Link href={b.href} className="hover:text-[var(--primary)] transition-colors">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-[var(--on-surface)] font-medium">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live Engine Status, Theme Switcher, Launch Sim */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Real Live Backend Health Badge */}
          <div className="flex items-center gap-1.5 bg-[var(--surface-container)]/70 border border-[var(--outline-variant)]/20 rounded-lg px-2.5 py-1 text-xs font-telemetry">
            <span
              className={`w-2 h-2 rounded-full ${
                engineHealthy === true
                  ? "bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]"
                  : engineHealthy === false
                  ? "bg-[#ff4444]"
                  : "bg-[var(--tertiary)] animate-pulse"
              }`}
            ></span>
            <span className="text-[var(--on-surface-variant)]">
              Backend:{" "}
              <strong className="text-[var(--on-surface)] font-semibold">
                {engineHealthy === true ? "Online" : engineHealthy === false ? "Offline" : "Checking..."}
              </strong>
            </span>
          </div>

          {/* Dark/Light Mode Switcher */}
          <div className="flex items-center bg-[var(--surface-container)]/70 border border-[var(--outline-variant)]/20 rounded-full p-0.5">
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              className={`p-1.5 rounded-full transition-all ${
                theme === "dark"
                  ? "bg-[var(--surface-container-highest)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
              title="Switch to Dark Mode"
            >
              <span className="material-symbols-outlined text-[16px]">dark_mode</span>
            </button>
            <button
              onClick={() => theme !== "light" && toggleTheme()}
              className={`p-1.5 rounded-full transition-all ${
                theme === "light"
                  ? "bg-[var(--surface-container-highest)] text-[var(--tertiary)] shadow-sm"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
              title="Switch to Light Mode"
            >
              <span className="material-symbols-outlined text-[16px]">light_mode</span>
            </button>
          </div>

          <Link
            href="/workspace"
            className="btn-gold flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md"
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            <span>Launch Sim</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
