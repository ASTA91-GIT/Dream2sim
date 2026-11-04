"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import Volumetric3DSimulation from "@/components/simulation/Volumetric3DSimulation";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [heroPrompt, setHeroPrompt] = useState("");

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroPrompt.trim()) {
      router.push("/workspace");
      return;
    }
    router.push(`/workspace?prompt=${encodeURIComponent(heroPrompt.trim())}`);
  };

  const setPromptChip = (chipText: string) => {
    setHeroPrompt(chipText);
  };

  return (
    <div className="min-h-screen bg-[#030308] text-[var(--on-surface)] selection:bg-[#B13BFF] selection:text-white flex flex-col font-body overflow-x-hidden">
      {/* Dynamic Background Atmospheric Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full bg-[#B13BFF]/12 blur-[160px]"></div>
        <div className="absolute top-1/3 -right-40 w-[650px] h-[650px] rounded-full bg-[#00f0ff]/8 blur-[170px]"></div>
        <div className="absolute bottom-20 left-1/3 w-[700px] h-[400px] rounded-full bg-[#FFCC00]/6 blur-[180px]"></div>
        {/* Subtle Engineering Dot Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      </div>

      {/* Floating Glassmorphic Top Bar */}
      <header className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto glass-tier-2 h-16 px-4 sm:px-6 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-xl">
        {/* Left: Brand Identity & Version */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#B13BFF] to-[#00f0ff] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-[6px] bg-[#090040] flex items-center justify-center">
              <span className="material-symbols-outlined text-[var(--primary)] text-lg">view_in_ar</span>
            </div>
          </div>
          <span className="font-headline text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Dream2Sim
          </span>
          <span className="hidden sm:inline-flex items-center font-telemetry text-[10px] font-bold bg-[#00f0ff]/10 text-[#00f0ff] px-2 py-0.5 rounded border border-[#00f0ff]/30 whitespace-nowrap tracking-wide">
            3D v2.5
          </span>
        </Link>

        {/* Center: Clean Non-Wrapping Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-telemetry text-[var(--on-surface-variant)] shrink min-w-0">
          <Link
            href="/workspace"
            className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
          >
            Workspace
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
          >
            Dashboard
          </Link>
          <Link
            href="/projects"
            className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
          >
            Simulations
          </Link>
          <Link
            href="/scenario-comparison"
            className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
          >
            Comparison
          </Link>
          <Link
            href="http://localhost:8000/docs"
            target="_blank"
            className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
          >
            API Docs
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center shrink-0"
            title="Toggle Light/Dark Theme"
          >
            <span className="material-symbols-outlined text-base">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-telemetry font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap shrink-0"
          >
            <span>Sign In</span>
          </Link>

          <Link
            href="/workspace"
            className="btn-gold flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-lg whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            <span>Launch Engine</span>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col items-center z-10">
        {/* Creative Headline: Half Monumental Modern + Half Flowing Calligraphy */}
        <h1 className="text-center max-w-5xl leading-[1.08] select-none">
          <span className="block font-headline text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-2">
            Idea to Simulation.
          </span>
          <span className="block font-calligraphy text-5xl sm:text-7xl lg:text-8xl font-normal italic tracking-tight bg-gradient-to-r from-[#00f0ff] via-[#FFCC00] to-[#E3B5FF] bg-clip-text text-transparent py-1">
            Any Domain, in Full 3D.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 font-body text-base sm:text-lg text-white/70 text-center max-w-3xl leading-relaxed">
          From <strong className="text-[#00f0ff] font-medium">autonomous drone corridors</strong> and <strong className="text-[#FFCC00] font-medium">automated warehouse robotics</strong> to <strong className="text-[#00ff88] font-medium">stadium crowd evacuations</strong>, Dream2Sim translates your natural language descriptions into collision-free, deterministic 3D digital twins in real time.
        </p>

        {/* INTERACTIVE 3D SIMULATION CENTERPIECE */}
        <div className="mt-10 w-full">
          <Volumetric3DSimulation />
        </div>

        {/* REAL-TIME NATURAL LANGUAGE PROMPT SANDBOX */}
        <div className="mt-8 w-full max-w-4xl">
          <form
            onSubmit={handlePromptSubmit}
            className="glass-tier-2 p-2 sm:p-2.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center gap-3 backdrop-blur-xl bg-[#090040]/70"
          >
            <div className="flex items-center gap-2 px-3 w-full sm:flex-1 text-white/50">
              <span className="material-symbols-outlined text-[#FFCC00]">auto_awesome</span>
              <input
                type="text"
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                placeholder="Describe any simulation (e.g. 15 medical delivery drones flying between 4 hospital rooftops)..."
                className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm text-white placeholder:text-white/35 font-body font-medium"
              />
            </div>
            <button
              type="submit"
              className="btn-gold w-full sm:w-auto px-6 py-3 rounded-xl font-headline text-xs sm:text-sm font-bold shadow-xl flex items-center justify-center gap-2 group cursor-pointer whitespace-nowrap"
            >
              <span>Simulate World</span>
              <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Quick Preset Chips for Multi-Agent Domains */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-telemetry">
            <span className="text-white/40">Explore multi-agent domains:</span>
            {[
              { label: "🚁 Hospital Rooftop Drones", prompt: "15 autonomous medical delivery drones flying between 4 hospital rooftop helipads" },
              { label: "📦 High-Bay AGV Warehouse", prompt: "Automated fulfillment warehouse with 24 AGV sorting robots navigating pallet racks" },
              { label: "🚶 Stadium Evacuation", prompt: "High-density crowd egress simulation of 500 pedestrians through 3 stadium turnstile gates" },
              { label: "🚢 Deepwater Harbor Ships", prompt: "Harbor container terminal with 8 cargo ships queuing through deepwater navigation fairway" },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setPromptChip(chip.prompt)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-[11px]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ASYMMETRIC ENGINEERING BENTO */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full z-10">
        <div className="mb-8">
          <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Deterministic Kinetics. Real AI Reasoning.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Card 1: 3D Microscopic Physics (Spans 2 cols) */}
          <div className="md:col-span-2 glass-tier-1 p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between bg-gradient-to-br from-[#0c0f24] to-[#070020]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-telemetry text-xs font-bold text-[#FFCC00] bg-[#FFCC00]/10 px-2.5 py-1 rounded border border-[#FFCC00]/30">
                  01 / DETERMINISTIC KINEMATICS
                </span>
                <span className="material-symbols-outlined text-white/30">precision_manufacturing</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-white">
                Zero-Collision Microscopic Physics Engine
              </h3>
              <p className="font-body text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                Every vehicle, drone, AGV, and pedestrian executes continuous kinematic equations calibrated at 0.05-second intervals. Integrated IDM car-following and Social Force crowd dynamics provide mathematically guaranteed, collision-free navigation.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 font-telemetry text-center">
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <div className="text-base font-bold text-[#00f0ff]">0.05s</div>
                <div className="text-[10px] text-white/50">Time-Step Resolution</div>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <div className="text-base font-bold text-[#00ff88]">0.00%</div>
                <div className="text-[10px] text-white/50">Collision Rate</div>
              </div>
              <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                <div className="text-base font-bold text-[#FFCC00]">10,000+</div>
                <div className="text-[10px] text-white/50">Max Agent Capacity</div>
              </div>
            </div>
          </div>

          {/* Card 2: Multimodal Neural Fusion */}
          <div className="glass-tier-1 p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between bg-gradient-to-br from-[#120a28] to-[#090022]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-telemetry text-xs font-bold text-[#B13BFF] bg-[#B13BFF]/10 px-2.5 py-1 rounded border border-[#B13BFF]/30">
                  02 / MULTIMODAL SENSORS
                </span>
                <span className="material-symbols-outlined text-white/30">graphic_eq</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-white">
                Voice & Vision Scene Parsing
              </h3>
              <p className="font-body text-xs text-white/70 mt-2 leading-relaxed">
                Direct your simulation using natural speech via Meta Muse Voice, or upload aerial footage parsed by SAM 3.1 to automatically extract corridor geometries and physical boundaries.
              </p>
            </div>

            {/* Simulated Audio Waveform */}
            <div className="mt-6 flex items-center justify-center gap-1 h-12 bg-black/40 rounded-xl p-2 border border-white/5">
              {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 30, 75, 50, 85, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-[#B13BFF] to-[#00f0ff] rounded-full animate-pulse"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                ></div>
              ))}
            </div>
          </div>

          {/* Card 3: Deep AI Reasoning */}
          <div className="glass-tier-1 p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between bg-gradient-to-br from-[#071322] to-[#030914]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-telemetry text-xs font-bold text-[#00f0ff] bg-[#00f0ff]/10 px-2.5 py-1 rounded border border-[#00f0ff]/30">
                  03 / REASONING AI
                </span>
                <span className="material-symbols-outlined text-white/30">psychology</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-white">
                Meta Muse Wonder Analytics
              </h3>
              <p className="font-body text-xs text-white/70 mt-2 leading-relaxed">
                Rather than generating generic summaries, Muse Wonder analyzes actual trajectory time-series to diagnose bottlenecks, quantify queue dissipation, and calculate optimal controller timings.
              </p>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-black/40 border border-white/5 font-telemetry text-[11px] text-white/60">
              <span className="text-[#00f0ff] font-bold">Insight:</span> Increasing Phase 2 green duration by 14 seconds prevents downstream corridor spillback.
            </div>
          </div>
        </div>
      </section>

      {/* UNIVERSAL SIMULATION TAXONOMY MATRIX */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full z-10">
        <div className="glass-tier-2 p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-6 bg-[#08081c]/80 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h3 className="font-headline text-xl sm:text-2xl font-bold text-white">
                Universal Multi-Domain Capabilities
              </h3>
              <p className="font-body text-xs sm:text-sm text-white/60 mt-1">
                Dream2Sim abstracts physical multi-agent environments into structured topological graphs: Nodes, Corridors, Kinematic Agents, and Phase Controllers.
              </p>
            </div>
            <Link
              href="/workspace"
              className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline text-xs font-bold shadow-lg self-start sm:self-auto"
            >
              <span>Open Blank Canvas</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: "flight", name: "Drone Airspace", desc: "Corridors & 3D Vertiports", color: "text-[#00f0ff]" },
              { icon: "precision_manufacturing", name: "Warehouse AGVs", desc: "Storage Racks & Aisles", color: "text-[#FFCC00]" },
              { icon: "directions_walk", name: "Crowd Evacuation", desc: "Plazas & Stadium Gates", color: "text-[#00ff88]" },
              { icon: "sailing", name: "Maritime Harbors", desc: "Deepwater Fairways & Berths", color: "text-[#38bdf8]" },
              { icon: "train", name: "Rail Transit", desc: "Mainline & Freight Switching", color: "text-[#e879f9]" },
              { icon: "traffic", name: "Smart Cities", desc: "Adaptive Signal Arterials", color: "text-[#fb923c]" },
            ].map((domain) => (
              <div
                key={domain.name}
                className="bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/10 flex flex-col items-center text-center transition-all group"
              >
                <span className={`material-symbols-outlined text-2xl mb-2 ${domain.color} group-hover:scale-110 transition-transform`}>
                  {domain.icon}
                </span>
                <span className="font-headline text-xs font-bold text-white">{domain.name}</span>
                <span className="font-telemetry text-[10px] text-white/50 mt-1">{domain.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/10 py-8 px-6 text-center text-xs font-telemetry text-white/50 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--primary)] text-base">view_in_ar</span>
            <span className="font-headline font-bold text-white">Dream2Sim</span>
            <span>— Microscopic Multi-Domain 3D Simulation Platform</span>
          </div>
          <div>
            Built with Three.js WebGL, Meta Model API, Intelligent Driver Model (IDM), and Social Force Dynamics.
          </div>
        </div>
      </footer>
    </div>
  );
}
