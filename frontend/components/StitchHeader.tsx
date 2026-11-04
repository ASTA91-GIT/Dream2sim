"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";

interface StitchHeaderProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function StitchHeader({ breadcrumbs }: StitchHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-[var(--surface-container-low)]/80 backdrop-blur-2xl z-40 border-b border-[var(--outline-variant)]/15 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-8 flex items-center justify-between gap-4">
        {/* Left: Clean, human-readable breadcrumb trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            breadcrumbs.map((b, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <React.Fragment key={b.label}>
                  {i > 0 && (
                    <span className="material-symbols-outlined text-sm text-[var(--outline)] select-none">
                      chevron_right
                    </span>
                  )}
                  {b.href && !isLast ? (
                    <Link
                      href={b.href}
                      className="text-sm font-medium text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors truncate"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-[var(--on-surface)] truncate">
                      {b.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <span className="text-sm font-semibold text-[var(--on-surface)]">
              Dashboard
            </span>
          )}
        </nav>

        {/* Right: Clean theme toggle and primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Light / Dark Mode Toggle */}
          <div className="flex items-center bg-[var(--surface-container)]/70 border border-[var(--outline-variant)]/20 rounded-full p-1">
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              className={`p-1.5 rounded-full transition-all ${
                theme === "dark"
                  ? "bg-[var(--surface-container-highest)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
              title="Switch to Dark Mode"
              aria-label="Dark mode"
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
              aria-label="Light mode"
            >
              <span className="material-symbols-outlined text-[16px]">light_mode</span>
            </button>
          </div>

          {/* Clean Primary Action */}
          <Link
            href="/workspace"
            className="btn-gold flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            <span>Launch Simulation</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
