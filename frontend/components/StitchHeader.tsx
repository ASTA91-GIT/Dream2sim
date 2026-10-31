"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";

interface StitchHeaderProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function StitchHeader({ breadcrumbs }: StitchHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-72 right-0 h-16 bg-[var(--surface-container-low)]/80 backdrop-blur-2xl z-40 border-b border-[var(--outline-variant)]/15 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-6 flex items-center justify-between gap-4">
          {/* Left: Branding & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline text-base font-bold tracking-tight text-[var(--on-surface)] hidden sm:inline">
                Dream2Sim
              </span>
              <span className="font-telemetry text-[10px] font-bold bg-[var(--primary-container)]/25 text-[var(--primary)] px-2 py-0.5 rounded border border-[var(--primary)]/30">
                SIM-CORE v2.4
              </span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 text-[var(--on-surface-variant)] font-telemetry text-xs truncate">
              <span className="text-[var(--outline)]">/</span>
              {breadcrumbs ? (
                breadcrumbs.map((b, i) => (
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
                ))
              ) : (
                <>
                  <span>Urban Transit Labs</span>
                  <span className="text-[var(--outline)]">/</span>
                  <span className="text-[var(--on-surface)] font-medium">Mumbai Intersections</span>
                </>
              )}
            </div>
          </div>

          {/* Center: Search with Command Palette kbd & Engine Status */}
          <div className="flex-1 max-w-xl mx-2 hidden md:flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[var(--surface-container)]/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-[var(--outline-variant)]/20 text-[var(--on-surface-variant)] focus-within:border-[var(--primary)] focus-within:text-[var(--on-surface)] transition-all">
              <span className="material-symbols-outlined text-lg mr-2">search</span>
              <input
                className="bg-transparent border-0 outline-none w-full text-xs font-medium text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)]"
                placeholder="Search scenarios, runs, parameters, datasets..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <kbd className="font-telemetry text-[10px] bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/30 px-1.5 py-0.5 rounded text-[var(--on-surface-variant)]">
                ⌘K
              </kbd>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 bg-[var(--surface-container)]/50 border border-[var(--outline-variant)]/20 rounded-lg px-2.5 py-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-pulse shadow-[0_0_8px_var(--gold-glow)]"></span>
              <span className="font-telemetry text-[11px] text-[var(--on-surface-variant)]">
                Engine: <strong className="text-[var(--on-surface)] font-medium">Online</strong> (14ms)
              </span>
            </div>
          </div>

          {/* Right: Velt Live Avatars, Invite, Theme Switcher, Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Velt Live Presence Avatars */}
            <div className="flex items-center -space-x-2" title="Velt Live Collaborative Presence (4 online)">
              <div className="relative w-7 h-7 rounded-full bg-[var(--secondary-container)] border border-[var(--surface-container-lowest)] flex items-center justify-center text-white font-telemetry text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] absolute -bottom-0.5 -right-0.5 ring-2 ring-[var(--surface-container-lowest)]"></span>
                AK
              </div>
              <div className="relative w-7 h-7 rounded-full bg-[var(--primary-container)] border border-[var(--surface-container-lowest)] flex items-center justify-center text-white font-telemetry text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] absolute -bottom-0.5 -right-0.5 ring-2 ring-[var(--surface-container-lowest)]"></span>
                VL
              </div>
              <div className="relative w-7 h-7 rounded-full bg-[var(--surface-container-highest)] border border-[var(--surface-container-lowest)] flex items-center justify-center text-[var(--primary)] font-telemetry text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] absolute -bottom-0.5 -right-0.5 ring-2 ring-[var(--surface-container-lowest)]"></span>
                SR
              </div>
              <div className="w-7 h-7 rounded-full bg-[var(--surface-container-high)] border border-[var(--surface-container-lowest)] flex items-center justify-center text-[var(--on-surface-variant)] font-telemetry text-[10px] font-semibold">
                +3
              </div>
            </div>

            {/* Invite Button */}
            <button
              onClick={() => setInviteModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-[var(--primary-container)]/20 hover:bg-[var(--primary-container)]/35 text-[var(--primary)] border border-[var(--primary)]/30 font-telemetry text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-base">group_add</span>
              <span>Invite</span>
            </button>

            {/* Notifications */}
            <button
              className="relative p-1.5 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container)] transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--tertiary)] shadow-[0_0_8px_var(--gold-glow)]"></span>
            </button>

            {/* Dark/Light Mode Switcher */}
            <div className="flex items-center bg-[var(--surface-container)]/70 border border-[var(--outline-variant)]/20 rounded-full p-0.5">
              <button
                onClick={() => theme !== "dark" && toggleTheme()}
                className={`p-1 rounded-full transition-all ${
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
                className={`p-1 rounded-full transition-all ${
                  theme === "light"
                    ? "bg-[var(--surface-container-highest)] text-[var(--tertiary)] shadow-sm"
                    : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                }`}
                title="Switch to Light Mode"
              >
                <span className="material-symbols-outlined text-[16px]">light_mode</span>
              </button>
            </div>

            {/* User Profile */}
            <Link
              href="/login"
              className="flex items-center gap-2 pl-1 group"
              title="Dr. Kulkarni (Lead Sim Engineer)"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B13BFF] to-[#FFCC00] p-0.5 shadow-sm group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-[var(--surface-container-lowest)] flex items-center justify-center font-telemetry text-xs font-bold text-[var(--primary)]">
                  DK
                </div>
              </div>
              <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-sm group-hover:text-[var(--on-surface)]">
                expand_more
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--tertiary)]">group_add</span>
                <h3 className="font-headline text-lg font-bold text-[var(--on-surface)]">
                  Invite Collaborator (Velt Mesh)
                </h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Share real-time simulation cursor positions, Velt canvas comments, and neural topology branches with your engineering team.
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-telemetry uppercase text-[var(--on-surface-variant)]">
                Collaborator Email Address
              </label>
              <input
                type="email"
                placeholder="colleague@transitlab.org"
                className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/40 rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Velt invitation token generated and dispatched!");
                  setInviteModalOpen(false);
                }}
                className="btn-gold px-4 py-2 rounded-lg text-xs font-bold"
              >
                Send Invite Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
