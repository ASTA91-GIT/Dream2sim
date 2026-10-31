"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PixiSimulationCanvas from "@/components/simulation/PixiSimulationCanvas";
import PromptEditor from "@/components/simulation/PromptEditor";
import MetricsPanel from "@/components/simulation/MetricsPanel";
import AIAnalysisPanel from "@/components/simulation/AIAnalysisPanel";
import ScenarioComparison from "@/components/simulation/ScenarioComparison";
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
import { Download, FileText, Share2, Layers, CheckCircle2 } from "lucide-react";

export default function WorkspacePage() {
  const [config, setConfig] = useState<SimulationConfig | null>(null);
  const [metrics, setMetrics] = useState<SimulationMetrics | null>(null);
  const [snapshots, setSnapshots] = useState<TrajectorySnapshot[]>([]);
  const [simulationId, setSimulationId] = useState<string | null>(null);

  // AI & Analysis state
  const [analysisText, setAnalysisText] = useState<string>("");
  const [identifiedEntities, setIdentifiedEntities] = useState<string[]>([]);
  const [identifiedConstraints, setIdentifiedConstraints] = useState<string[]>([]);

  // Optimization & Scenario comparison state
  const [optimizationResult, setOptimizationResult] = useState<any | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [scenariosHistory, setScenariosHistory] = useState<any[]>([]);

  // Loading states & modal
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<"voice" | "sam">("voice");

  // Initial auto-synthesis on mount
  useEffect(() => {
    handleSynthesize(
      "Create a four-way intersection in Mumbai during evening rush hour. There are cars, buses, motorcycles, and pedestrians. The north road has heavy traffic, and the eastern road is closed. Simulate traffic for five minutes and suggest better signal timings."
    );
  }, []);

  const handleSynthesize = async (promptText: string) => {
    setIsLoading(true);
    try {
      // 1. Muse Spark interpretation
      const interp = await interpretNaturalPrompt(promptText);
      const parsedConfig = interp.suggested_configuration;
      setConfig(parsedConfig);
      setIdentifiedEntities(interp.identified_entities || []);
      setIdentifiedConstraints(interp.identified_constraints || []);

      // 2. Deterministic execution
      const runRes = await runSimulationExecution({
        configuration: parsedConfig,
        duration_seconds: parsedConfig.parameters.duration_seconds || 300.0,
      });

      setSimulationId(runRes.simulation_id);
      setMetrics(runRes.metrics);
      setSnapshots(runRes.snapshots || []);

      // 3. Scenario recording for comparative analysis
      setScenariosHistory((prev) => [
        {
          id: runRes.simulation_id,
          title: parsedConfig.title || "Baseline Scenario",
          metrics: runRes.metrics,
        },
      ]);

      // 4. Muse Wonder deep analysis
      try {
        const anaRes = await analyzeMetricsWithMuseWonder({
          simulation_id: runRes.simulation_id,
        });
        setAnalysisText(anaRes.engineering_insights);
      } catch {
        setAnalysisText("Deterministic simulation executed successfully. Bottlenecks and queue metrics recorded.");
      }
    } catch (err) {
      console.error("Synthesis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeSignals = async () => {
    if (!config || !simulationId) return;
    setIsOptimizing(true);
    try {
      const optRes = await optimizeSignals({
        simulation_id: simulationId,
        configuration: config,
      });
      setOptimizationResult(optRes);
    } catch (err) {
      console.error("Optimization failed:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimization = async (newConfig: SimulationConfig) => {
    setConfig(newConfig);
    setIsLoading(true);
    try {
      const runRes = await runSimulationExecution({
        configuration: newConfig,
        duration_seconds: newConfig.parameters.duration_seconds,
      });

      setMetrics(runRes.metrics);
      setSnapshots(runRes.snapshots || []);

      // Add to scenario comparison history
      setScenariosHistory((prev) => [
        ...prev,
        {
          id: runRes.simulation_id,
          title: "Optimized Signal Split",
          metrics: runRes.metrics,
        },
      ]);

      // Refresh Muse Wonder analysis
      try {
        const anaRes = await analyzeMetricsWithMuseWonder({
          simulation_id: runRes.simulation_id,
        });
        setAnalysisText(anaRes.engineering_insights);
      } catch {}
    } catch (err) {
      console.error("Failed to run optimized scenario:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Prompt Editor Section */}
        <PromptEditor
          onSynthesize={handleSynthesize}
          isLoading={isLoading}
          identifiedEntities={identifiedEntities}
          identifiedConstraints={identifiedConstraints}
          onOpenVoiceModal={() => {
            setModalTab("voice");
            setIsModalOpen(true);
          }}
          onOpenMediaModal={() => {
            setModalTab("sam");
            setIsModalOpen(true);
          }}
        />

        {/* Core Workspace Layout: Simulation Canvas & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: PixiJS Canvas & Comparison (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <PixiSimulationCanvas
              config={config}
              snapshots={snapshots}
              durationSeconds={config?.parameters.duration_seconds || 300.0}
            />

            {/* Canvas Bottom Action Bar: Reports Export & Config */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-medium">Verified Outputs:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono text-[11px]">
                  Deterministic Python Engine
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {simulationId && (
                  <>
                    <a
                      href={getExportPdfUrl(simulationId)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-200 transition border border-slate-700/60"
                      title="Download engineering PDF report"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      <span>PDF Report</span>
                    </a>

                    <a
                      href={getExportCsvUrl(simulationId)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-200 transition border border-slate-700/60"
                      title="Download CSV metrics"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>CSV Metrics</span>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Scenario Comparison Component */}
            <ScenarioComparison scenarios={scenariosHistory} />
          </div>

          {/* Right Column: Live Metrics Dashboard & AI Reasoning (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <MetricsPanel metrics={metrics} isLoading={isLoading} />

            <AIAnalysisPanel
              config={config}
              metrics={metrics}
              analysisText={analysisText}
              onOptimize={handleOptimizeSignals}
              isOptimizing={isOptimizing}
              optimizationResult={optimizationResult}
              onApplyOptimization={handleApplyOptimization}
            />
          </div>
        </div>
      </main>

      {/* Multimodal Modal for Muse Voice & SAM 3.1 */}
      <MultimodalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
        onInsertPrompt={(text) => handleSynthesize(text)}
      />
    </div>
  );
}
