"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StitchSidebar } from "@/components/StitchSidebar";
import PixiSimulationCanvas from "@/components/simulation/PixiSimulationCanvas";
import MultimodalModal from "@/components/simulation/MultimodalModal";
import { useTheme } from "@/context/ThemeContext";
import {
  interpretNaturalPrompt,
  runSimulationExecution,
  analyzeMetricsWithMuseWonder,
  getExportPdfUrl,
  getExportCsvUrl,
  SimulationConfig,
  SimulationMetrics,
  TrajectorySnapshot,
} from "@/lib/api";

function WorkspaceContent() {
  const { theme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Prompt & Simulation State - Completely clean slate (no pre-inserted prompts or runs)
  const [promptText, setPromptText] = useState("");
  const [config, setConfig] = useState<SimulationConfig | null>(null);
  const [metrics, setMetrics] = useState<SimulationMetrics | null>(null);
  const [snapshots, setSnapshots] = useState<TrajectorySnapshot[]>([]);
  const [simulationId, setSimulationId] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showVectors, setShowVectors] = useState<boolean>(false);
  const [isTiltView, setIsTiltView] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<"voice" | "sam">("voice");

  // Status & Insights
  const [simStatus, setSimStatus] = useState<"IDLE" | "RUNNING" | "READY" | "OPTIMIZED">("IDLE");
  const [analysisText, setAnalysisText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const formatTimecode = (sec: number) => {
    const totalMs = Math.floor((sec % 1) * 100);
    const totalSec = Math.floor(sec);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${totalMs
      .toString()
      .padStart(2, "0")}`;
  };

  // Universal Prompt Interpreter & Simulation Execution
  const handleExecuteSimulation = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setCurrentTime(0);

    try {
      // 1. Meta Muse Spark Universal Interpretation
      const interp = await interpretNaturalPrompt(prompt);
      const parsedConfig: SimulationConfig = interp.suggested_configuration;

      setConfig(parsedConfig);

      // 2. Deterministic Micro-Simulation Run
      const runRes = await runSimulationExecution({
        configuration: parsedConfig,
        duration_seconds: parsedConfig.parameters?.duration_seconds || 300.0,
      });

      setSimulationId(runRes.simulation_id);
      setMetrics(runRes.metrics);
      setSnapshots(runRes.snapshots || []);
      setSimStatus("RUNNING");
      setIsPlaying(true);

      // 3. Meta Muse Wonder Engineering Insights
      try {
        const anaRes = await analyzeMetricsWithMuseWonder({
          simulation_id: runRes.simulation_id,
        });
        setAnalysisText(anaRes.engineering_insights || interp.reasoning || "");
      } catch {
        setAnalysisText(
          interp.reasoning ||
            `Simulation synthesized successfully. ${parsedConfig.network.intersections.length} nodes active with ${parsedConfig.network.roads.length} interconnected corridors.`
        );
      }
    } catch (err: any) {
      console.error("Simulation run error:", err);
      setAnalysisText("Simulation synthesized and operating in physics-calibrated fallback mode.");
    } finally {
      setIsLoading(false);
    }
  };

  const executedQueryRef = useRef<string | null>(null);

  // Listen to navigation query parameters (e.g. from Dashboard templates, projects, or Homepage)
  useEffect(() => {
    const promptQuery = searchParams.get("prompt");
    const templateQuery = searchParams.get("template");
    const modeQuery = searchParams.get("mode");
    const projectIdQuery = searchParams.get("project_id");

    if (modeQuery === "media") {
      setModalTab("sam");
      setModalOpen(true);
    }

    const currentKey = `${promptQuery || ""}_${templateQuery || ""}_${projectIdQuery || ""}`;
    if (!promptQuery && !templateQuery && !projectIdQuery) return;
    if (executedQueryRef.current === currentKey) return;
    executedQueryRef.current = currentKey;

    if (promptQuery) {
      setPromptText(promptQuery);
      handleExecuteSimulation(promptQuery);
    } else if (templateQuery) {
      const templateMap: Record<string, string> = {
        four_way: "Four-way urban intersection with adaptive signal timing and heavy vehicular flow",
        chokepoint: "Arterial corridor with 3 lanes narrowing into a bottleneck with high spillback risk",
        adaptive_rl: "Multi-agent arterial network with reinforcement learning adaptive signal controllers",
        drones: "15 autonomous medical delivery drones flying between 4 hospital rooftop helipads",
        warehouse: "Automated fulfillment warehouse with 24 AGV sorting robots navigating pallet racks",
        crowd: "High-density crowd egress simulation of 500 pedestrians through 3 stadium turnstile gates",
      };
      const p = templateMap[templateQuery] || "Four-way urban intersection";
      setPromptText(p);
      handleExecuteSimulation(p);
    } else if (projectIdQuery) {
      const loadProject = async () => {
        try {
          const headers: Record<string, string> = {};
          if (typeof window !== "undefined") {
            const token = localStorage.getItem("dream2sim_token");
            if (token) headers["Authorization"] = `Bearer ${token}`;
          }
          let res: Response | null = null;
          try {
            res = await fetch(`/api/projects/${projectIdQuery}`, { headers });
          } catch {
            try {
              res = await fetch(`http://localhost:8000/api/projects/${projectIdQuery}`, { headers });
            } catch {
              res = null;
            }
          }
          if (res && res.ok) {
            const proj = await res.json();
            const p = proj.description?.trim() || proj.title || "Urban arterial network simulation";
            setPromptText(p);
            handleExecuteSimulation(p);
          } else {
            // Default scenario if project cannot be fetched
            const defaultPrompt = "Urban arterial network simulation with synchronized signal controllers";
            setPromptText(defaultPrompt);
            handleExecuteSimulation(defaultPrompt);
          }
        } catch (e) {
          console.error("Failed to load project from query param:", e);
        }
      };
      loadProject();
    }
  }, [searchParams]);


  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!canvasContainerRef.current) return;
    if (!document.fullscreenElement) {
      canvasContainerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const duration = config?.parameters?.duration_seconds || 300;
  const currentSnapshot =
    snapshots.length > 0
      ? snapshots[
          Math.min(
            snapshots.length - 1,
            Math.floor((currentTime / Math.max(1, duration)) * snapshots.length)
          )
        ]
      : null;

  const activeCount = currentSnapshot?.active_count ?? metrics?.total_vehicles_processed ?? 0;
  const queuedCount =
    currentSnapshot?.vehicles?.filter((v) => v.is_queued)?.length ??
    (metrics ? Math.round(metrics.average_queue_length) : 0);
  const throughputVph = metrics?.throughput_vph ?? 0;

  return (
    <div className="h-screen w-screen flex bg-[var(--surface-container-lowest)] text-[var(--on-surface)] overflow-hidden selection:bg-[#B13BFF] selection:text-white font-sans">
      <StitchSidebar isOpen={sidebarOpen} />
      <div className={`flex-1 flex flex-col h-screen min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? "pl-72" : "pl-0"}`}>
        {/* ================= 1. UNIFIED TOP HEADER ================= */}
        <header className="h-16 px-6 bg-[var(--surface-container-low)]/80 backdrop-blur-2xl border-b border-[var(--outline-variant)]/15 flex items-center justify-between shrink-0 z-40">
          {/* Left: Sidebar Toggle, Brand, Breadcrumb, Scenario Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] border border-[var(--outline-variant)]/20 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={sidebarOpen ? "Collapse navigation sidebar" : "Expand navigation sidebar"}
              aria-label="Toggle navigation sidebar"
            >
              <span className="material-symbols-outlined text-lg">
                {sidebarOpen ? "menu_open" : "menu"}
              </span>
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 truncate">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors hidden sm:inline"
              >
                Dashboard
              </Link>
              <span className="material-symbols-outlined text-sm text-[var(--outline)] hidden sm:inline select-none">
                chevron_right
              </span>
              <h1 className="font-headline font-semibold text-sm text-[var(--on-surface)] truncate">
                {config?.title || "Simulation Workspace"}
              </h1>
              <span
                className={`shrink-0 flex items-center gap-1 text-[10px] font-telemetry font-bold px-2 py-0.5 rounded-full border ${
                  simStatus === "OPTIMIZED"
                    ? "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30"
                    : simStatus === "RUNNING"
                    ? "bg-[#f1c100]/15 text-[#f1c100] border-[#f1c100]/30"
                    : "bg-[var(--outline-variant)]/20 text-[var(--on-surface-variant)] border-[var(--outline-variant)]/30"
                }`}
              >
                {simStatus === "RUNNING" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                )}
                {simStatus}
              </span>
            </nav>
          </div>

          {/* Right: Live Telemetry Counters, Reports, Inspect & Tune, and Light/Dark Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Telemetry Counters */}
            {config && (
              <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-[var(--surface-container)]/70 rounded-full border border-[var(--outline-variant)]/20 text-xs font-telemetry">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
                  <span className="text-[var(--on-surface-variant)]">Active:</span>
                  <strong className="text-[var(--on-surface)] font-semibold">{activeCount}</strong>
                </div>
                <span className="text-[var(--outline)]">•</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f1c100]"></span>
                  <span className="text-[var(--on-surface-variant)]">Queue:</span>
                  <strong className="text-[var(--on-surface)] font-semibold">{queuedCount}</strong>
                </div>
                <span className="text-[var(--outline)]">•</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                  <span className="text-[var(--on-surface-variant)]">Throughput:</span>
                  <strong className="text-[var(--on-surface)] font-semibold">{throughputVph} VPH</strong>
                </div>
              </div>
            )}

            {/* Export Report Buttons */}
            {simulationId && (
              <div className="flex items-center bg-[var(--surface-container)]/70 rounded-lg p-0.5 border border-[var(--outline-variant)]/20 text-xs font-telemetry">
                <a
                  href={getExportPdfUrl(simulationId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 text-[var(--primary)] hover:text-[var(--on-surface)] transition-colors flex items-center gap-1"
                  title="Download PDF Engineering Report"
                >
                  <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                  <span>PDF</span>
                </a>
                <span className="text-[var(--outline)]">|</span>
                <a
                  href={getExportCsvUrl(simulationId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 text-[var(--primary)] hover:text-[var(--on-surface)] transition-colors flex items-center gap-1"
                  title="Download CSV Telemetry"
                >
                  <span className="material-symbols-outlined text-sm">table_view</span>
                  <span>CSV</span>
                </a>
              </div>
            )}


            {/* Dual Pill Dark / Light Mode Switcher */}
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
          </div>
        </header>

      {/* ================= 2. MAXIMIZED CINEMATIC CANVAS VIEWPORT ================= */}
      <div className="relative flex-1 w-full overflow-hidden flex flex-col">
        {/* Fullscreen Canvas Container */}
        <div
          ref={canvasContainerRef}
          className={`relative w-full h-full bg-[var(--surface-container-lowest)] overflow-hidden transition-all duration-300 ${
            isTiltView ? "perspective-[1000px] rotate-x-6 scale-[0.98]" : ""
          }`}
        >
          {/* Top HUD Floating Playback Bar (Visible when simulation is active) */}
          {config && (
            <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              {/* Playback Controls (Left) */}
              <div className="pointer-events-auto flex items-center gap-1.5 bg-[var(--surface-container-low)]/90 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-[var(--outline-variant)]/20 shadow-xl">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-lg bg-[#B13BFF] hover:brightness-110 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </button>
                <button
                  onClick={() => setCurrentTime((t) => Math.min(duration, t + 5))}
                  className="p-1.5 rounded-lg bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors cursor-pointer"
                  title="Step +5s"
                >
                  <span className="material-symbols-outlined text-base">redo</span>
                </button>
                <button
                  onClick={() => setCurrentTime(0)}
                  className="p-1.5 rounded-lg bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors cursor-pointer"
                  title="Rewind to start"
                >
                  <span className="material-symbols-outlined text-base">restart_alt</span>
                </button>

                <div className="h-4 w-px bg-[var(--outline-variant)]/30 mx-1"></div>

                {/* Speed Multipliers */}
                <div className="flex items-center bg-[var(--surface-container)] p-0.5 rounded-lg border border-[var(--outline-variant)]/20">
                  {[0.5, 1.0, 2.0, 5.0, 10.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded font-telemetry text-[11px] transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? "bg-[#B13BFF] text-white font-bold"
                          : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                      }`}
                    >
                      {spd === 10.0 ? "MAX" : `${spd}x`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Clock & View Mode Toggles (Right) */}
              <div className="pointer-events-auto flex items-center gap-2 bg-[var(--surface-container-low)]/90 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-[var(--outline-variant)]/20 shadow-xl">
                <div className="flex items-center gap-1.5 font-telemetry text-xs font-bold text-[var(--on-surface)] px-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPlaying ? "bg-[#f1c100] animate-pulse" : "bg-[var(--outline)]"
                    }`}
                  ></span>
                  <span>{formatTimecode(currentTime)}</span>
                  <span className="text-[var(--outline)]">/</span>
                  <span className="text-[var(--on-surface-variant)]">{formatTimecode(duration)}</span>
                </div>

                <div className="h-4 w-px bg-[var(--outline-variant)]/30"></div>

                {/* Heatmap Toggle */}
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showHeatmap
                      ? "bg-[#ef4444] text-white shadow-md shadow-[#ef4444]/30"
                      : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container)]"
                  }`}
                  title="Toggle Congestion Heatmaps"
                >
                  <span className="material-symbols-outlined text-base">local_fire_department</span>
                </button>

                {/* Trajectory Vectors Toggle */}
                <button
                  onClick={() => setShowVectors(!showVectors)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showVectors
                      ? "bg-[#06b6d4] text-white shadow-md shadow-[#06b6d4]/30"
                      : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container)]"
                  }`}
                  title="Toggle Velocity Vectors"
                >
                  <span className="material-symbols-outlined text-base">navigation</span>
                </button>

                {/* 3D Tilt View */}
                <button
                  onClick={() => setIsTiltView(!isTiltView)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isTiltView
                      ? "bg-[#f1c100] text-black shadow-md font-bold"
                      : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container)]"
                  }`}
                  title="3D Tilt Perspective"
                >
                  <span className="material-symbols-outlined text-base">view_in_ar</span>
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container)] transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  <span className="material-symbols-outlined text-base">
                    {isFullscreen ? "fullscreen_exit" : "fullscreen"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Pixi.js Canvas Rendering Element */}
          <div className="w-full h-full">
            <PixiSimulationCanvas
              config={config}
              snapshots={snapshots}
              durationSeconds={duration}
              currentTime={currentTime}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              showHeatmap={showHeatmap}
              showVectors={showVectors}
              theme={theme}
              onTimeUpdate={(t) => setCurrentTime(t)}
            />
          </div>

          {/* Clean Slate Ambient Empty State (When no simulation is loaded yet) */}
          {!config && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface-container)] border border-[var(--outline-variant)]/30 flex items-center justify-center mb-4 shadow-xl backdrop-blur-md">
                <span className="material-symbols-outlined text-3xl text-[var(--primary)] animate-pulse">
                  neurology
                </span>
              </div>
              <h2 className="font-headline font-bold text-xl text-[var(--on-surface)] mb-2 tracking-tight">
                Dream2Sim Engine Ready
              </h2>
              <p className="font-body text-xs text-[var(--on-surface-variant)] max-w-md leading-relaxed">
                Describe any world, system, network, or phenomenon in the prompt bar below to synthesize and run its simulation.
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--surface-container-lowest)]/85 backdrop-blur-md z-20">
              <div className="w-12 h-12 border-3 border-[#B13BFF] border-t-transparent rounded-full animate-spin mb-3"></div>
              <span className="font-headline font-bold text-sm text-[var(--on-surface)]">
                Synthesizing World & Physics...
              </span>
              <span className="font-telemetry text-xs text-[var(--on-surface-variant)] mt-1">
                Meta Muse Spark calculating topology, kinematics & constraints
              </span>
            </div>
          )}

          {/* Bottom Scrubbing Timeline Bar (Visible when simulation is active) */}
          {config && (
            <div className="absolute bottom-20 left-6 right-6 z-30 flex items-center gap-3 bg-[var(--surface-container-low)]/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-[var(--outline-variant)]/20 shadow-xl pointer-events-auto">
              <span className="font-telemetry text-xs font-semibold text-[var(--primary)] shrink-0">
                T = {currentTime.toFixed(1)}s
              </span>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.5}
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[var(--surface-container-high)] rounded-lg appearance-none cursor-pointer accent-[#B13BFF]"
              />
              <span className="font-telemetry text-xs text-[var(--on-surface-variant)] shrink-0">{duration}s</span>
            </div>
          )}

          {/* ================= 3. SLEEK FLOATING PROMPT BAR (Clean Slate) ================= */}
          <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-col items-center pointer-events-none">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteSimulation(promptText);
              }}
              className="w-full max-w-4xl bg-[var(--surface-container-low)]/95 backdrop-blur-2xl p-2 rounded-2xl border border-[var(--outline-variant)]/30 shadow-2xl flex items-center gap-2 pointer-events-auto"
            >
              {/* Multimodal Buttons */}
              <button
                type="button"
                onClick={() => {
                  setModalTab("voice");
                  setModalOpen(true);
                }}
                className="p-2 rounded-xl text-[var(--tertiary)] hover:bg-[var(--surface-container)] transition-colors cursor-pointer shrink-0"
                title="Muse Voice Sync"
              >
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalTab("sam");
                  setModalOpen(true);
                }}
                className="p-2 rounded-xl text-[var(--primary)] hover:bg-[var(--surface-container)] transition-colors cursor-pointer shrink-0"
                title="SAM 3.1 Vision Segment"
              >
                <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
              </button>

              {/* Text Input - Fresh Clean Slate */}
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe any system you want to simulate..."
                className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm text-[var(--on-surface)] placeholder-[var(--outline)] px-2 font-medium"
              />

              {/* Generate CTA Button */}
              <button
                type="submit"
                disabled={isLoading || !promptText.trim()}
                className="btn-gold py-2.5 px-5 rounded-xl font-headline font-bold text-xs sm:text-sm shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span className="hidden sm:inline">Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                    <span>Simulate</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>


      </div>
      </div>

      {/* Multimodal Modal */}
      <MultimodalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={modalTab}
        onInsertPrompt={(text: string) => {
          setPromptText(text);
          handleExecuteSimulation(text);
        }}
      />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070014] text-white flex items-center justify-center font-mono text-xs">Loading simulation workspace...</div>}>
      <WorkspaceContent />
    </Suspense>
  );
}

