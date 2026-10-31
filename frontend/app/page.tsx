"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--surface-container-lowest)] text-[var(--on-surface)] selection:bg-[#B13BFF] selection:text-white flex flex-col font-body overflow-x-hidden">
      {/* Floating Glassmorphic Top Bar */}
      <header className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto glass-tier-2 px-6 py-3 rounded-2xl border border-[var(--glass-border-2)] shadow-2xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#B13BFF] to-[#FFCC00] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-[6px] bg-[#090040] flex items-center justify-center">
              <span className="material-symbols-outlined text-[var(--primary)] text-lg">hub</span>
            </div>
          </div>
          <span className="font-headline text-lg font-bold tracking-tight text-[var(--on-surface)]">
            Dream2Sim
          </span>
          <span className="font-telemetry text-[10px] font-bold bg-[var(--primary-container)]/20 text-[var(--primary)] px-2 py-0.5 rounded border border-[var(--primary)]/30">
            SIM-CORE v2.4
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-telemetry text-[var(--on-surface-variant)]">
          <Link href="/dashboard" className="hover:text-[var(--primary)] transition-colors">
            Dashboard
          </Link>
          <Link href="/workspace" className="hover:text-[var(--primary)] transition-colors">
            Simulation Workspace
          </Link>
          <Link href="/projects" className="hover:text-[var(--primary)] transition-colors">
            Projects
          </Link>
          <Link href="/scenario-comparison" className="hover:text-[var(--primary)] transition-colors">
            Comparison
          </Link>
          <Link href="http://localhost:8000/docs" target="_blank" className="hover:text-[var(--primary)] transition-colors">
            API Docs
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-[var(--surface-container)]/70 border border-[var(--outline-variant)]/20 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
            title="Toggle Light/Dark Theme"
          >
            <span className="material-symbols-outlined text-base">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-telemetry font-semibold text-[var(--primary)] hover:bg-[var(--surface-container)] transition-all"
          >
            <span>Sign In</span>
          </Link>

          <Link
            href="/workspace"
            className="btn-gold flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-lg"
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            <span>Launch Sim</span>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-20 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6">
        {/* Ambient Atmospheric Lights */}
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full bg-[#B13BFF]/15 blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-[#471396]/30 blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#FFCC00]/5 blur-[160px] pointer-events-none"></div>

        {/* SVG Blueprint Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#B13BFF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-tier-1 text-xs font-telemetry text-[var(--primary)] border border-[var(--primary)]/30 shadow-lg mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-pulse shadow-[0_0_8px_var(--gold-glow)]"></span>
            <span>Meta Global AI Hackathon • Multimodal Microscopic Traffic Platform</span>
          </div>

          {/* Headline */}
          <h1 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--on-surface)] max-w-4xl leading-[1.1]">
            Idea-to-Simulation, <br />
            <span className="bg-gradient-to-r from-[#E3B5FF] via-[#FFCC00] to-[#B13BFF] bg-clip-text text-transparent">
              Powered by Meta AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 font-body text-base sm:text-lg text-[var(--on-surface-variant)] max-w-2xl leading-relaxed">
            Describe any real-world situation in natural language. Dream2Sim converts your words into a validated, deterministic, interactive physics simulation with engineering analytics.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/workspace"
              className="btn-gold flex items-center gap-2 px-7 py-3.5 rounded-xl font-headline text-sm font-bold shadow-xl shadow-[var(--gold-glow)]"
            >
              <span>Launch Live Workspace</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>

            <Link
              href="/dashboard"
              className="glass-tier-1 hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] font-telemetry text-xs font-semibold px-6 py-3.5 rounded-xl border border-[var(--outline-variant)]/30 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span>Open Dashboard</span>
            </Link>
          </div>

          {/* 4 Steps Banner */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
            {[
              {
                step: "01 / PROMPT",
                title: "Describe World",
                desc: "Natural instruction powered by Muse Spark voice sync or SAM 3.1 video input.",
                color: "text-[var(--primary)]",
              },
              {
                step: "02 / SYNTHESIS",
                title: "Topological Graph",
                desc: "Physics-calibrated parsing constructs multi-lane junctions and signal phases.",
                color: "text-[var(--tertiary)]",
              },
              {
                step: "03 / COMPUTE",
                title: "Deterministic IDM",
                desc: "Sub-millisecond microscopic kinematics with collision-free car-following.",
                color: "text-[var(--secondary)]",
              },
              {
                step: "04 / REASON",
                title: "Meta Model AI",
                desc: "Muse Wonder evaluates queue dissipation and optimizes phase splits.",
                color: "text-[var(--primary)]",
              },
            ].map((card) => (
              <div
                key={card.step}
                className="glass-tier-1 p-5 rounded-xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col justify-between"
              >
                <span className={`font-telemetry text-[10px] font-bold tracking-wider ${card.color}`}>
                  {card.step}
                </span>
                <div className="mt-3">
                  <h3 className="font-headline text-sm font-bold text-[var(--on-surface)]">
                    {card.title}
                  </h3>
                  <p className="font-body text-xs text-[var(--on-surface-variant)] mt-1 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D TRAFFIC VISUALIZATION SHOWCASE */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="glass-tier-2 p-6 sm:p-8 rounded-2xl border border-[var(--glass-border-2)] shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-telemetry text-xs uppercase tracking-wider text-[var(--tertiary)] font-bold">
                  HIGH-FIDELITY VIEWPORT
                </span>
                <span className="text-[var(--outline)] font-telemetry">/</span>
                <span className="font-telemetry text-xs text-[var(--on-surface-variant)]">
                  Live CAD Intersection
                </span>
              </div>
              <h2 className="font-headline text-2xl font-bold text-[var(--on-surface)] mt-1">
                Worli Naka 4-Way Traffic Nexus (Rush Hour Pulse)
              </h2>
            </div>

            <Link
              href="/workspace"
              className="btn-gold flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold self-start sm:self-auto"
            >
              <span>Interact in Real Time</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {/* Intersection CAD Blueprint Box */}
          <div className="relative w-full h-[480px] rounded-xl bg-[#090040] overflow-hidden border border-[var(--outline-variant)]/30 flex items-center justify-center shadow-inner">
            {/* SVG Background Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="nexus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e3b5ff" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#nexus-grid)" />
            </svg>

            {/* CAD Layout */}
            <div className="relative w-[480px] h-[480px] flex items-center justify-center">
              {/* North-South Road */}
              <div className="absolute w-36 h-full bg-[#18114c]/90 flex items-center justify-center">
                <div className="w-0.5 h-full border-r border-dashed border-[#9a8ca0]/60"></div>
              </div>
              {/* East-West Road */}
              <div className="absolute h-36 w-full bg-[#18114c]/90 flex items-center justify-center">
                <div className="h-0.5 w-full border-b border-dashed border-[#9a8ca0]/60"></div>
              </div>
              {/* Central Junction */}
              <div className="absolute w-36 h-36 bg-[#27215b]/90 z-0 flex items-center justify-center">
                <div className="w-full h-full opacity-30 bg-[radial-gradient(#e3b5ff_1px,transparent_1px)] [background-size:12px_12px]"></div>
              </div>

              {/* East Closed Hazard Barrier */}
              <div className="absolute right-0 w-[172px] h-36 bg-[#93000a]/20 flex flex-col items-center justify-center p-2 z-10">
                <div className="w-full h-7 bg-[#f1c100] rounded flex items-center justify-center shadow">
                  <span className="font-telemetry text-[9px] font-black uppercase text-black">
                    EAST CORRIDOR BARRIER
                  </span>
                </div>
              </div>

              {/* Live Signal Lights */}
              <div className="absolute top-[138px] left-[138px] w-3 h-3 rounded-full bg-[#22c55e] animate-ping"></div>
              <div className="absolute bottom-[138px] left-[138px] w-3 h-3 rounded-full bg-[#ef4444]"></div>
              <div className="absolute top-[138px] right-[138px] w-3 h-3 rounded-full bg-[#ef4444]"></div>

              {/* Floating Velt Comment Pins */}
              <div className="absolute top-[20%] left-[45%] flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-tier-3 text-[10px] font-telemetry border border-[#B13BFF]/40 shadow-lg">
                <span className="w-4 h-4 rounded-full bg-[#c167ff] text-white flex items-center justify-center text-[8px] font-bold">AK</span>
                <span>Signal phase buffer: +15s green</span>
              </div>
            </div>

            {/* Floating Live Telemetry HUD */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-container-high)]/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-[var(--outline-variant)]/20 font-telemetry text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[var(--secondary)] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse"></span>
                  Engine Online
                </span>
                <span className="text-[var(--outline)]">|</span>
                <span className="text-[var(--on-surface-variant)]">Throughput: <strong className="text-[var(--on-surface)]">1,420 VPH</strong></span>
                <span className="text-[var(--outline)]">|</span>
                <span className="text-[var(--on-surface-variant)]">Avg Delay: <strong className="text-[var(--tertiary)]">18.4s</strong></span>
              </div>
              <span className="text-[var(--primary)] font-bold">CUDA Accelerated (0.42x RT)</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-[var(--outline-variant)]/15 py-8 px-6 text-center text-xs font-telemetry text-[var(--on-surface-variant)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--primary)] text-base">hub</span>
            <span className="font-headline font-bold text-[var(--on-surface)]">Dream2Sim</span>
            <span>— AI-Powered Urban Simulation Platform</span>
          </div>
          <div>
            Built with Meta Model API, Intelligent Driver Model (IDM), and Velt Collaborative Mesh.
          </div>
        </div>
      </footer>
    </div>
  );
}
