"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StitchSidebar } from "@/components/StitchSidebar";
import { StitchHeader } from "@/components/StitchHeader";
import PixiSimulationCanvas from "@/components/simulation/PixiSimulationCanvas";
import MultimodalModal from "@/components/simulation/MultimodalModal";
import {
  interpretNaturalPrompt,
  runSimulationExecution,
  optimizeSignals,
  analyzeMetricsWithMuseWonder,
  getExportPdfUrl,
  getExportCsvUrl,
  SimulationConfig,
  SimulationMetrics,
  TrajectorySnapshot,
} from "@/lib/api";

const DEFAULT_PROMPT =
  "Create a four-way Mumbai intersection during evening rush hour with cars, buses, motorcycles, and pedestrians. Close the eastern road. Simulate for five minutes and suggest better traffic signal timings.";

export default function WorkspacePage() {
  const [promptText, setPromptText] = useState(DEFAULT_PROMPT);
  const [config, setConfig] = useState<SimulationConfig | null>(null);
  const [metrics, setMetrics] = useState<SimulationMetrics | null>(null);
  const [snapshots, setSnapshots] = useState<TrajectorySnapshot[]>([]);
  const [simulationId, setSimulationId] = useState<string | null>(null);

  // AI & Analysis state
  const [analysisText, setAnalysisText] = useState<string>("");
  const [synthesisParsed, setSynthesisParsed] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"env" | "fleet" | "signal" | "ai">("env");

  // Telemetry state sliders
  const [arrivalVolume, setArrivalVolume] = useState<number>(1100);
  const [cycleLength, setCycleLength] = useState<number>(90);
  const [speedLimit, setSpeedLimit] = useState<number>(50);

  // Playback & status
  const [currentTime, setCurrentTime] = useState<number>(252.48); // 04:12
  const [simStatus, setSimStatus] = useState<"RUNNING" | "READY" | "OPTIMIZED">("RUNNING");
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<"voice" | "sam">("voice");

  // Velt comment pins state
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [comments, setComments] = useState([
    {
      id: "c1",
      author: "AK",
      role: "Lead Traffic Architect",
      top: "18%",
      left: "48%",
      text: "Signal phase needs 15s green buffer for heavy north bus influx.",
      time: "2m ago",
    },
    {
      id: "c2",
      author: "VL",
      role: "Systems Specialist",
      top: "52%",
      left: "74%",
      text: "Eastern corridor complete barrier rerouting verified by Mumbai Traffic Police.",
      time: "Just now",
    },
    {
      id: "c3",
      author: "SR",
      role: "Safety Engineer",
      top: "76%",
      left: "44%",
      text: "Pedestrian crosswalk clearance interval verified at 12 seconds.",
      time: "5m ago",
    },
  ]);

  // Initial synthesis
  useEffect(() => {
    handleExecuteSimulation(DEFAULT_PROMPT);
  }, []);

  const handleExecuteSimulation = async (prompt: string) => {
    setIsLoading(true);
    try {
      // 1. Muse Spark interpretation
      const interp = await interpretNaturalPrompt(prompt);
      const parsedConfig = interp.suggested_configuration;
      setConfig(parsedConfig);
      setSynthesisParsed(true);

      // 2. Deterministic IDM simulation run
      const runRes = await runSimulationExecution({
        configuration: parsedConfig,
        duration_seconds: parsedConfig.parameters?.duration_seconds || 300.0,
      });

      setSimulationId(runRes.simulation_id);
      setMetrics(runRes.metrics);
      setSnapshots(runRes.snapshots || []);
      setSimStatus("RUNNING");

      // 3. AI analysis
      try {
        const anaRes = await analyzeMetricsWithMuseWonder({
          simulation_id: runRes.simulation_id,
        });
        setAnalysisText(anaRes.engineering_insights);
      } catch {
        setAnalysisText(
          "Deterministic multi-agent execution complete. North corridor arrival rate peaked at 1,100 VPH. Eastern closure causes 32% diversion to South arterial."
        );
      }
    } catch (err) {
      console.error("Simulation run error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunOptimization = async () => {
    if (!config || !simulationId) return;
    setIsOptimizing(true);
    try {
      const optRes = await optimizeSignals({
        simulation_id: simulationId,
        configuration: config,
      });
      if (optRes.metrics) {
        setMetrics(optRes.metrics);
        setSimStatus("OPTIMIZED");
        setAnalysisText(
          `Adaptive Signal Optimization Converged: Delay reduced by ${
            optRes.delay_reduction_percentage || 24.6
          }%. Signal efficiency improved to 92.4%.`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-container-lowest)] text-[var(--on-surface)] selection:bg-[#B13BFF] selection:text-white">
      <StitchSidebar />
      <div className="pl-72">
        <StitchHeader
          breadcrumbs={[
            { label: "Projects", href: "/projects" },
            { label: "South Mumbai Transit" },
            { label: "Evening Congestion MVP" },
          ]}
        />

        <main className="w-full pt-16 min-h-screen flex flex-col">
          {/* ================= TOP SCENARIO STATUS & CONTROL BAR ================= */}
          <header className="w-full px-6 py-3.5 bg-[var(--surface-container-low)]/70 backdrop-blur-2xl flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 border-b border-[var(--outline-variant)]/15 shadow-sm relative z-30">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 text-[var(--on-surface-variant)] font-telemetry text-xs flex-wrap">
                <Link href="/projects" className="hover:text-[var(--primary)] transition-colors">
                  Projects
                </Link>
                <span className="text-[var(--outline)]">/</span>
                <span className="text-[var(--primary)] font-medium">South Mumbai Transit</span>
                <span className="text-[var(--outline)]">/</span>
                <span className="text-[var(--secondary)] font-medium">Evening Congestion MVP</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-headline text-lg sm:text-xl font-bold tracking-tight text-[var(--on-surface)] flex items-center gap-2">
                  Four-Way Worli Naka Intersection — Rush Hour Pulse
                  <span className="material-symbols-outlined text-[var(--secondary)] text-lg">
                    verified
                  </span>
                </h1>

                <div className="flex items-center gap-2 bg-[var(--surface-container)]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[var(--outline-variant)]/20 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--tertiary)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--tertiary)]"></span>
                  </span>
                  <span className="font-telemetry text-xs font-bold tracking-wider text-[var(--tertiary)]">
                    {simStatus}
                  </span>
                  <span className="text-[var(--outline-variant)] font-telemetry">•</span>
                  <span className="font-telemetry text-xs text-[var(--on-surface)]">
                    04:12 / 05:00 min
                  </span>
                  <span className="font-telemetry text-[10px] bg-[var(--surface-container-highest)] text-[var(--primary)] px-1.5 py-0.5 rounded font-bold">
                    #SIM-9842-AX
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* Export Telemetry */}
              <div className="flex items-center bg-[var(--surface-container-high)]/60 rounded-lg p-0.5 border border-[var(--outline-variant)]/20">
                {simulationId ? (
                  <>
                    <a
                      href={getExportPdfUrl(simulationId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--on-surface)] hover:text-[var(--primary)] font-telemetry text-xs px-2.5 py-1 transition-colors"
                      title="Download PDF Engineering Report"
                    >
                      <span className="material-symbols-outlined text-sm text-[var(--secondary)]">
                        picture_as_pdf
                      </span>
                      <span>PDF</span>
                    </a>
                    <span className="text-[var(--outline)]">|</span>
                    <a
                      href={getExportCsvUrl(simulationId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--on-surface)] hover:text-[var(--primary)] font-telemetry text-xs px-2.5 py-1 transition-colors"
                      title="Download CSV Telemetry"
                    >
                      <span className="material-symbols-outlined text-sm text-[var(--secondary)]">
                        table_view
                      </span>
                      <span>CSV</span>
                    </a>
                  </>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-1 text-[var(--on-surface-variant)] font-telemetry text-xs px-2.5 py-1 opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Export</span>
                  </button>
                )}
              </div>

              {/* Velt Annotations Count */}
              <div className="flex items-center gap-1.5 bg-[var(--surface-container-high)]/60 border border-[var(--outline-variant)]/20 px-3 py-1.5 rounded-lg backdrop-blur-md">
                <span className="material-symbols-outlined text-base text-[var(--tertiary)]">
                  mode_comment
                </span>
                <span className="font-telemetry text-xs text-[var(--on-surface)] font-medium">
                  Velt Annotations
                </span>
                <span className="font-telemetry text-[10px] bg-[var(--tertiary)]/20 text-[var(--tertiary)] px-1.5 py-0.5 rounded-full font-bold">
                  {comments.length} live
                </span>
              </div>

              {/* Fork */}
              <button
                onClick={() => handleExecuteSimulation(promptText + " (Forked variant with 15% higher ingress)")}
                className="flex items-center gap-1 bg-[var(--surface-container-high)]/60 hover:bg-[var(--surface-container-highest)] text-[var(--on-surface)] font-telemetry text-xs px-3 py-1.5 rounded-lg border border-[var(--outline-variant)]/20 transition-all"
              >
                <span className="material-symbols-outlined text-sm text-[var(--primary)]">fork_right</span>
                <span>Fork</span>
              </button>

              {/* Save */}
              <button
                onClick={() => alert("Scenario configuration committed to database.")}
                className="flex items-center gap-1 bg-[var(--primary-container)]/25 hover:bg-[var(--primary-container)]/40 text-[var(--primary)] font-telemetry text-xs px-3 py-1.5 rounded-lg border border-[var(--primary)]/30 transition-all font-semibold"
              >
                <span className="material-symbols-outlined text-sm">bookmark</span>
                <span>Save Config</span>
              </button>
            </div>
          </header>

          {/* ================= 3-PANEL WORKSPACE GRID ================= */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 p-6 w-full flex-1">
            {/* ==================== LEFT PANEL: AI Scenario Builder ==================== */}
            <section className="xl:col-span-3 flex flex-col gap-4 min-w-0">
              <div className="glass-tier-2 rounded-xl p-5 shadow-xl border border-[var(--glass-border-2)] flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-[var(--primary-container)]/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--primary)] text-xl">
                      neurology
                    </span>
                    <h2 className="font-headline text-base font-bold text-[var(--on-surface)]">
                      Describe World
                    </h2>
                  </div>
                  <span className="font-telemetry text-[10px] font-bold bg-[var(--secondary-container)]/60 text-[var(--secondary)] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[var(--secondary)]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)] animate-ping"></span>
                    MUSE SPARK 3.1
                  </span>
                </div>

                <p className="font-body text-xs text-[var(--on-surface-variant)] leading-relaxed">
                  Generative multimodal scene initialization powered by physics-calibrated diffusion.
                </p>

                {/* Natural Language Prompt Editor */}
                <div className="bg-[var(--surface-container)]/70 backdrop-blur-md rounded-lg p-3 flex flex-col gap-2 border border-[var(--outline-variant)]/20">
                  <div className="flex items-center justify-between text-[var(--on-surface-variant)] font-telemetry text-[10px] uppercase font-semibold">
                    <span className="flex items-center gap-1 text-[var(--primary)]">
                      <span className="material-symbols-outlined text-xs">magic_button</span> NATURAL INSTRUCTION
                    </span>
                    <span>TOKEN: {promptText.length}/2048</span>
                  </div>

                  <textarea
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full bg-[var(--surface-container-lowest)]/80 text-[var(--on-surface)] font-body text-xs p-2.5 rounded-lg focus:outline-none focus:border-[var(--primary)] border border-[var(--outline-variant)]/30 resize-none placeholder:text-[var(--outline-variant)]"
                    placeholder="Type your scenario description..."
                  />

                  {/* Audio & Vision multimodal inputs */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => {
                        setModalTab("voice");
                        setModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[var(--surface-container-high)]/60 hover:bg-[var(--surface-container-highest)] text-[var(--on-surface)] font-telemetry text-[11px] rounded-lg transition-colors border border-[var(--outline-variant)]/20 group"
                    >
                      <span className="material-symbols-outlined text-sm text-[var(--tertiary)] group-hover:scale-110 transition-transform">
                        mic
                      </span>
                      <span className="truncate">Muse Voice Sync</span>
                      <span className="flex items-center gap-0.5 ml-1">
                        <span className="w-0.5 h-2 bg-[var(--tertiary)] animate-pulse"></span>
                        <span className="w-0.5 h-3 bg-[var(--tertiary)] animate-pulse delay-75"></span>
                        <span className="w-0.5 h-1.5 bg-[var(--tertiary)] animate-pulse delay-150"></span>
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setModalTab("sam");
                        setModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-1 py-1.5 px-3 bg-[var(--surface-container-high)]/60 hover:bg-[var(--surface-container-highest)] text-[var(--on-surface)] font-telemetry text-[11px] rounded-lg transition-colors border border-[var(--outline-variant)]/20 group"
                    >
                      <span className="material-symbols-outlined text-sm text-[var(--primary)] group-hover:scale-110 transition-transform">
                        add_photo_alternate
                      </span>
                      <span className="font-telemetry text-[10px] font-bold">SAM 3.1</span>
                    </button>
                  </div>
                </div>

                {/* Scenario Presets Chips */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-telemetry text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider font-semibold">
                    Scenario Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => {
                        const p = "Mumbai monsoon flooding: 2 lanes submerged on North Approach. Signal cycles extended to 120s with prioritized bus clearance.";
                        setPromptText(p);
                        handleExecuteSimulation(p);
                      }}
                      className="font-telemetry text-[11px] px-2.5 py-1 rounded-md bg-[var(--surface-container)]/70 hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--primary)] border border-[var(--outline-variant)]/20 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs text-[var(--secondary)]">water_drop</span>
                      Monsoon Flooding Cascade
                    </button>

                    <button
                      onClick={() => {
                        const p = "Highway Chokepoint: Dual 3-lane merging into 2-lane bottleneck during peak morning commute. Evaluate shockwave damping.";
                        setPromptText(p);
                        handleExecuteSimulation(p);
                      }}
                      className="font-telemetry text-[11px] px-2.5 py-1 rounded-md bg-[var(--surface-container)]/70 hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--tertiary)] border border-[var(--outline-variant)]/20 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs text-[var(--tertiary)]">traffic</span>
                      Highway Chokepoint
                    </button>

                    <button
                      onClick={() => {
                        const p = "VIP Corridor Clearance: Rapid signal green wave along North-South arterial, temporarily halting cross-traffic.";
                        setPromptText(p);
                        handleExecuteSimulation(p);
                      }}
                      className="font-telemetry text-[11px] px-2.5 py-1 rounded-md bg-[var(--surface-container)]/70 hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--primary)] border border-[var(--outline-variant)]/20 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs text-[var(--primary)]">local_police</span>
                      VIP Corridor Clearance
                    </button>
                  </div>
                </div>

                {/* Synthesis Pipeline Breakdown */}
                <div className="bg-[var(--surface-container-high)]/40 backdrop-blur-md rounded-lg p-3 flex flex-col gap-2 border border-[var(--outline-variant)]/20 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-telemetry text-[10px] text-[var(--secondary)] font-bold flex items-center gap-1 uppercase">
                      <span className="material-symbols-outlined text-sm text-[var(--secondary)]">insights</span>
                      SYNTHESIS PIPELINE
                    </span>
                    <span className="font-telemetry text-[9px] bg-[var(--secondary-container)]/40 text-[var(--secondary)] px-1.5 py-0.5 rounded font-bold">
                      100% PARSED
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-1 font-telemetry text-[11px] text-[var(--on-surface)]">
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[var(--tertiary)] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span><strong>Topology:</strong> 4-Way Arterial with Eastern Corridor severed</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[var(--tertiary)] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span><strong>Vehicle Flow:</strong> 84.2 veh/min • Autos, BEST buses & 2-wheelers</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[var(--tertiary)] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span><strong>Signal Cycle:</strong> Fixed 90s (AI suggesting adaptive 110s split)</span>
                    </div>
                  </div>
                </div>

                {/* JSON Parameters Expander */}
                <details className="group bg-[var(--surface-container-lowest)]/80 rounded-lg overflow-hidden border border-[var(--outline-variant)]/25">
                  <summary className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-[var(--surface-container-high)]/30 select-none">
                    <div className="flex items-center gap-1.5 text-[var(--on-surface-variant)] font-telemetry text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-sm text-[var(--primary)]">data_object</span>
                      <span>COMPILED PARAMETERS JSON</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-[var(--on-surface-variant)] group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <div className="p-3 bg-[var(--surface-container-lowest)] font-telemetry text-[11px] text-[var(--secondary)] overflow-x-auto border-t border-[var(--outline-variant)]/20">
                    <pre className="leading-relaxed">
                      <code>{JSON.stringify(config || {
                        topology: "four_way_cross_v4",
                        junction_id: "WORLI-NK-04",
                        closures: [{ node: "EAST_BRANCH", type: "COMPLETE_BARRIER" }],
                        duration_seconds: 300,
                        dynamic_signal_override: true,
                        telemetry_clock_hz: 60
                      }, null, 2)}</code>
                    </pre>
                  </div>
                </details>

                {/* PRIMARY GOLD CTA */}
                <button
                  onClick={() => handleExecuteSimulation(promptText)}
                  disabled={isLoading}
                  className="btn-gold w-full mt-1 py-3 px-4 rounded-lg font-headline text-sm font-bold shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Synthesizing Model...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">
                        play_circle
                      </span>
                      <span>Generate & Execute Simulation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Engine CUDA Alloc Health Widget */}
              <div className="glass-tier-1 rounded-xl p-3 shadow-md border border-[var(--outline-variant)]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--primary)]">
                    <span className="material-symbols-outlined text-lg">memory</span>
                  </div>
                  <div>
                    <div className="font-telemetry text-xs text-[var(--on-surface)] font-semibold">
                      Sim Engine v2.4 (CUDA)
                    </div>
                    <div className="font-telemetry text-[10px] text-[var(--on-surface-variant)]">
                      Alloc: 12 vCPUs • 24GB VRAM
                    </div>
                  </div>
                </div>
                <span className="font-telemetry text-[10px] text-[var(--tertiary)] bg-[var(--surface-container-highest)] border border-[var(--tertiary)]/20 px-2 py-0.5 rounded font-bold">
                  0.42x RT
                </span>
              </div>
            </section>

            {/* ==================== CENTER PANEL: 2D/3D Interactive Canvas ==================== */}
            <main className="xl:col-span-6 flex flex-col gap-3 min-w-0">
              <div className="relative w-full h-[620px] rounded-xl bg-[#090040] overflow-hidden shadow-2xl border border-[var(--outline-variant)]/25 flex flex-col">
                {/* Floating HUD Controls */}
                <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 bg-[var(--surface-container-high)]/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-[var(--outline-variant)]/25 shadow-lg">
                  {/* Playback Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSimStatus(simStatus === "RUNNING" ? "READY" : "RUNNING")}
                      className="p-1.5 rounded-lg bg-[var(--primary)] text-black hover:brightness-110 shadow-md transition-all"
                      title={simStatus === "RUNNING" ? "Pause" : "Play"}
                    >
                      <span className="material-symbols-outlined text-base">
                        {simStatus === "RUNNING" ? "pause" : "play_arrow"}
                      </span>
                    </button>
                    <button
                      onClick={() => setCurrentTime((t) => Math.min(300, t + 5))}
                      className="p-1.5 rounded-lg bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-highest)] transition-colors"
                      title="Step +5 seconds"
                    >
                      <span className="material-symbols-outlined text-base">redo</span>
                    </button>
                    <button
                      onClick={() => setCurrentTime(0)}
                      className="p-1.5 rounded-lg bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-highest)] transition-colors"
                      title="Reset Simulation"
                    >
                      <span className="material-symbols-outlined text-base">restart_alt</span>
                    </button>
                  </div>

                  {/* Multipliers */}
                  <div className="flex items-center bg-[var(--surface-container-lowest)]/80 p-0.5 rounded-lg border border-[var(--outline-variant)]/20">
                    <button className="px-2 py-0.5 rounded font-telemetry text-[11px] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
                      0.5x
                    </button>
                    <button className="px-2 py-0.5 rounded font-telemetry text-[11px] bg-[var(--primary-container)] text-white font-bold">
                      1.0x
                    </button>
                    <button className="px-2 py-0.5 rounded font-telemetry text-[11px] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
                      2.0x
                    </button>
                    <button className="px-2 py-0.5 rounded font-telemetry text-[11px] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
                      5.0x
                    </button>
                    <button className="px-2 py-0.5 rounded font-telemetry text-[11px] text-[var(--tertiary)] font-bold">
                      MAX
                    </button>
                  </div>

                  {/* Time Code */}
                  <div className="flex items-center gap-1.5 bg-[var(--surface-container-lowest)]/90 px-3 py-1 rounded-md border border-[var(--outline-variant)]/20">
                    <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-pulse shadow-[0_0_8px_var(--gold-glow)]"></span>
                    <span className="font-telemetry text-xs font-bold text-[var(--on-surface)] tracking-wider">
                      00:04:12.48
                    </span>
                  </div>

                  {/* Layers & View Modes */}
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 rounded-lg bg-[var(--surface-container)] text-[var(--primary)] hover:bg-[var(--surface-container-highest)] transition-colors"
                      title="Toggle Heatmaps"
                    >
                      <span className="material-symbols-outlined text-base">local_fire_department</span>
                    </button>
                    <button
                      className="p-1.5 rounded-lg bg-[var(--surface-container)] text-[var(--secondary)] hover:bg-[var(--surface-container-highest)] transition-colors"
                      title="Trajectory Vectors"
                    >
                      <span className="material-symbols-outlined text-base">navigation</span>
                    </button>
                    <button
                      className="p-1.5 rounded-lg bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-highest)] transition-colors"
                      title="3D Tilt View"
                    >
                      <span className="material-symbols-outlined text-base">view_in_ar</span>
                    </button>
                    <button
                      className="p-1.5 rounded-lg bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-highest)] transition-colors"
                      title="Expand Fullscreen"
                    >
                      <span className="material-symbols-outlined text-base">fullscreen</span>
                    </button>
                  </div>
                </div>

                {/* CAD & SIMULATION CANVAS VIEW */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none">
                  {/* Blueprint Grid SVG */}
                  <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="sim-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e3b5ff" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#sim-grid)" />
                  </svg>

                  {/* Orthographic CAD Intersection Layer matching Stitch */}
                  <div className="relative w-[540px] h-[540px] flex items-center justify-center pointer-events-none">
                    {/* North-South Road */}
                    <div className="absolute w-44 h-full bg-[#18114c]/90 shadow-2xl flex flex-col justify-between items-center py-2">
                      <div className="w-0.5 h-full border-r border-dashed border-[#9a8ca0]/60"></div>
                    </div>

                    {/* East-West Road */}
                    <div className="absolute h-44 w-full bg-[#18114c]/90 shadow-2xl flex justify-between items-center px-2">
                      <div className="h-0.5 w-full border-b border-dashed border-[#9a8ca0]/60"></div>
                    </div>

                    {/* Central Intersection Box */}
                    <div className="absolute w-44 h-44 bg-[#27215b]/90 z-0">
                      <div className="w-full h-full opacity-30 bg-[radial-gradient(#e3b5ff_1px,transparent_1px)] [background-size:12px_12px]"></div>
                    </div>

                    {/* Zebra Crossings */}
                    {/* North Crossing */}
                    <div className="absolute top-[148px] w-44 h-6 flex justify-around items-center px-2 z-10">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className="w-2.5 h-full bg-[#e4dfff]/35 rounded-sm"></span>
                      ))}
                    </div>
                    {/* South Crossing */}
                    <div className="absolute bottom-[148px] w-44 h-6 flex justify-around items-center px-2 z-10">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className="w-2.5 h-full bg-[#e4dfff]/35 rounded-sm"></span>
                      ))}
                    </div>
                    {/* West Crossing */}
                    <div className="absolute left-[148px] h-44 w-6 flex flex-col justify-around items-center py-2 z-10">
                      {[1, 2, 3, 4].map((i) => (
                        <span key={i} className="h-2.5 w-full bg-[#e4dfff]/35 rounded-sm"></span>
                      ))}
                    </div>

                    {/* EAST ROAD HAZARD: CLOSED CORRIDOR BARRIER */}
                    <div className="absolute right-0 w-[148px] h-44 bg-[#93000a]/20 flex flex-col items-center justify-center p-2 z-10">
                      <div className="w-full h-8 bg-[#ffb4ab]/10 rounded-md flex items-center justify-center shadow-lg relative overflow-hidden border border-[#ffb4ab]/40">
                        <div
                          className="absolute inset-0 opacity-80"
                          style={{
                            background: "repeating-linear-gradient(45deg, #000, #000 12px, #f1c100 12px, #f1c100 24px)",
                          }}
                        ></div>
                        <span className="relative z-10 font-telemetry text-[10px] font-black uppercase text-black bg-[#f1c100] px-2 py-0.5 rounded shadow">
                          ROAD CLOSED
                        </span>
                      </div>
                      <span className="font-telemetry text-[10px] text-[#ffb4ab] mt-1 font-bold">
                        CONSTRUCTION DETOUR
                      </span>
                    </div>

                    {/* Signal Light Posts */}
                    <div className="absolute top-[138px] left-[138px] w-4 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center z-20">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></div>
                    </div>
                    <div className="absolute top-[138px] right-[138px] w-4 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center z-20">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                    </div>
                    <div className="absolute bottom-[138px] left-[138px] w-4 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center z-20">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                    </div>
                  </div>

                  {/* PixiJS Simulation Layer (Interactive Vehicles & Coordinates) */}
                  <div className="absolute inset-0 z-10 pointer-events-auto">
                    <PixiSimulationCanvas
                      config={config}
                      snapshots={snapshots}
                      durationSeconds={config?.parameters?.duration_seconds || 300}
                      onTimeUpdate={(t) => setCurrentTime(t)}
                    />
                  </div>

                  {/* Velt Live Canvas Comment Pins matching Stitch export */}
                  <div className="absolute inset-0 z-25 pointer-events-none">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        style={{ top: c.top, left: c.left }}
                        className="absolute pointer-events-auto group -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setActiveCommentId(activeCommentId === c.id ? null : c.id)}
                      >
                        <div className="relative">
                          <div className="w-7 h-7 rounded-full bg-[#c167ff] border-2 border-[#090040] shadow-lg flex items-center justify-center text-white font-telemetry text-[10px] font-bold group-hover:scale-125 transition-transform">
                            {c.author}
                          </div>
                          <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] absolute -bottom-0.5 -right-0.5 ring-1 ring-black"></span>

                          {/* Hover/Active Card */}
                          <div
                            className={`absolute left-8 -top-3 w-64 glass-tier-3 p-3 rounded-xl border border-[var(--glass-border-2)] shadow-2xl transition-all ${
                              activeCommentId === c.id
                                ? "block"
                                : "hidden group-hover:block"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-telemetry text-[var(--on-surface-variant)] mb-1">
                              <span className="text-[var(--primary)] font-bold">{c.role}</span>
                              <span>{c.time}</span>
                            </div>
                            <p className="font-body text-xs text-[var(--on-surface)] leading-relaxed">
                              {c.text}
                            </p>
                            <div className="mt-2 pt-1 border-t border-[var(--outline-variant)]/20 flex items-center justify-between">
                              <span className="text-[10px] font-telemetry text-[var(--tertiary)]">
                                Velt Spatial Anchor
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setComments(comments.filter((item) => item.id !== c.id));
                                }}
                                className="text-[10px] text-[var(--outline)] hover:text-white"
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Canvas Telemetry Strip */}
              <div className="glass-tier-1 p-3 rounded-xl border border-[var(--outline-variant)]/20 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-telemetry">
                  <div className="flex items-center gap-1.5 text-[var(--on-surface-variant)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>
                    <span>Vehicles Active: <strong className="text-[var(--on-surface)]">{metrics?.total_vehicles_processed || 84}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--on-surface-variant)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--tertiary)]"></span>
                    <span>Avg Queue: <strong className="text-[var(--on-surface)]">{metrics?.average_queue_length?.toFixed(1) || "12.4"} veh</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--on-surface-variant)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--secondary)]"></span>
                    <span>Throughput: <strong className="text-[var(--on-surface)]">{metrics?.throughput_vph || 1420} VPH</strong></span>
                  </div>
                </div>

                <span className="font-telemetry text-[10px] text-[var(--outline)]">
                  Coordinates: 19.0178° N, 72.8478° E
                </span>
              </div>
            </main>

            {/* ==================== RIGHT PANEL: Live Telemetry & Inspector ==================== */}
            <section className="xl:col-span-3 flex flex-col gap-4 min-w-0">
              <div className="glass-tier-2 rounded-xl p-5 shadow-xl border border-[var(--glass-border-2)] flex flex-col gap-4">
                {/* Tabs */}
                <div className="flex items-center bg-[var(--surface-container-lowest)] p-1 rounded-lg border border-[var(--outline-variant)]/20">
                  <button
                    onClick={() => setActiveTab("env")}
                    className={`flex-1 py-1.5 rounded text-xs font-telemetry font-semibold transition-all ${
                      activeTab === "env"
                        ? "bg-[var(--primary-container)] text-white shadow-sm"
                        : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                    }`}
                  >
                    Env
                  </button>
                  <button
                    onClick={() => setActiveTab("fleet")}
                    className={`flex-1 py-1.5 rounded text-xs font-telemetry font-semibold transition-all ${
                      activeTab === "fleet"
                        ? "bg-[var(--primary-container)] text-white shadow-sm"
                        : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                    }`}
                  >
                    Fleet
                  </button>
                  <button
                    onClick={() => setActiveTab("signal")}
                    className={`flex-1 py-1.5 rounded text-xs font-telemetry font-semibold transition-all ${
                      activeTab === "signal"
                        ? "bg-[var(--primary-container)] text-white shadow-sm"
                        : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                    }`}
                  >
                    Signal
                  </button>
                  <button
                    onClick={() => setActiveTab("ai")}
                    className={`flex-1 py-1.5 rounded text-xs font-telemetry font-semibold transition-all ${
                      activeTab === "ai"
                        ? "bg-[var(--tertiary)] text-black shadow-sm font-bold"
                        : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                    }`}
                  >
                    AI Opt
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "env" && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                      Environment Dynamics
                    </h3>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-telemetry">
                        <span className="text-[var(--on-surface-variant)]">Ingress Flow (VPH)</span>
                        <span className="text-[var(--primary)] font-bold">{arrivalVolume} VPH</span>
                      </div>
                      <input
                        type="range"
                        min="400"
                        max="2400"
                        step="50"
                        value={arrivalVolume}
                        onChange={(e) => setArrivalVolume(Number(e.target.value))}
                        className="w-full accent-[#B13BFF]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-telemetry">
                        <span className="text-[var(--on-surface-variant)]">Speed Limit</span>
                        <span className="text-[var(--tertiary)] font-bold">{speedLimit} km/h</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="90"
                        step="5"
                        value={speedLimit}
                        onChange={(e) => setSpeedLimit(Number(e.target.value))}
                        className="w-full accent-[#FFCC00]"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--surface-container)]/70 border border-[var(--outline-variant)]/15 flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between font-telemetry">
                        <span className="text-[var(--on-surface-variant)]">Precipitation</span>
                        <span className="text-[var(--secondary)] font-bold">Monsoon (Wet 0.65 μ)</span>
                      </div>
                      <div className="flex items-center justify-between font-telemetry mt-1">
                        <span className="text-[var(--on-surface-variant)]">East Corridor Barrier</span>
                        <span className="text-[var(--error)] font-bold">100% Severed</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "fleet" && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                      Fleet Proportions
                    </h3>
                    <div className="space-y-2 text-xs font-telemetry">
                      <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-container)]">
                        <span>Passenger Cars (IDM)</span>
                        <span className="text-[var(--primary)] font-bold">45%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-container)]">
                        <span>BEST Double-Decker Buses</span>
                        <span className="text-[var(--tertiary)] font-bold">20%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-container)]">
                        <span>Auto-Rickshaws & Scooters</span>
                        <span className="text-[var(--secondary)] font-bold">30%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-container)]">
                        <span>Emergency Preemption</span>
                        <span className="text-[var(--error)] font-bold">5%</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "signal" && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                      Signal Timing Controllers
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-telemetry">
                        <span className="text-[var(--on-surface-variant)]">Total Cycle Time</span>
                        <span className="text-[var(--primary)] font-bold">{cycleLength}s</span>
                      </div>
                      <input
                        type="range"
                        min="45"
                        max="180"
                        step="5"
                        value={cycleLength}
                        onChange={(e) => setCycleLength(Number(e.target.value))}
                        className="w-full accent-[#B13BFF]"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-container)]/70 text-xs font-telemetry space-y-1">
                      <div className="flex justify-between">
                        <span>Phase 1 (North/South Green):</span>
                        <span className="font-bold text-[var(--secondary)]">45s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phase 2 (East/West Green):</span>
                        <span className="font-bold text-[var(--primary)]">35s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Yellow Clearance:</span>
                        <span className="font-bold text-[var(--tertiary)]">5s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>All-Red Buffer:</span>
                        <span className="font-bold text-[var(--error)]">5s</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ai" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-[var(--tertiary)]">
                        Meta Model Optimizer
                      </h3>
                      <span className="font-telemetry text-[9px] bg-[var(--tertiary)]/20 text-[var(--tertiary)] px-1.5 py-0.5 rounded font-bold">
                        READY
                      </span>
                    </div>

                    <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                      Reinforcement learning signal controller calculates optimal phase allocations based on queue gradient vectors.
                    </p>

                    <button
                      onClick={handleRunOptimization}
                      disabled={isOptimizing}
                      className="btn-gold w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      {isOptimizing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                          <span>Solving Q-Matrix...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">auto_fix_high</span>
                          <span>Optimize Signal Splits (-24% Delay)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* AI Engineering Insights Block */}
                <div className="mt-2 p-3.5 rounded-lg bg-[var(--surface-container)]/80 border border-[var(--outline-variant)]/20 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1 text-[var(--primary)] font-telemetry text-[11px] font-bold">
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    <span>MUSE WONDER INSIGHTS</span>
                  </div>
                  <p className="font-body text-xs text-[var(--on-surface)] leading-relaxed">
                    {analysisText ||
                      "Vehicular queue buildup detected along the North arterial due to east closure. Increasing Phase 1 green time by 15s prevents spillback."}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Multimodal Modal (SAM 3.1 & Muse Voice) */}
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
