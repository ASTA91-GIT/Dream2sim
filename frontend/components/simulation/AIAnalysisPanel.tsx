"use client";

import React, { useState } from "react";
import {
  Brain,
  Sliders,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { SimulationConfig, SimulationMetrics } from "@/lib/api";

interface AIAnalysisPanelProps {
  config: SimulationConfig | null;
  metrics: SimulationMetrics | null;
  analysisText: string;
  onOptimize: () => Promise<void>;
  isOptimizing: boolean;
  optimizationResult: any | null;
  onApplyOptimization: (newConfig: SimulationConfig) => void;
}

export default function AIAnalysisPanel({
  config,
  metrics,
  analysisText,
  onOptimize,
  isOptimizing,
  optimizationResult,
  onApplyOptimization,
}: AIAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<"analysis" | "optimizer">("analysis");

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e293b] bg-[#090d16]/50">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "analysis"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Muse Wonder Reasoning</span>
          </button>

          <button
            onClick={() => setActiveTab("optimizer")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "optimizer"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Signal Optimization</span>
          </button>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 font-mono">
          Meta Muse Wonder
        </span>
      </div>

      {/* Tab 1: Muse Wonder Analysis Content */}
      {activeTab === "analysis" && (
        <div className="p-5 flex flex-col gap-4 text-xs text-slate-300">
          <div className="flex items-center space-x-2 text-slate-200">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="font-semibold text-sm">Grounded Engineering Interpretation</h4>
          </div>

          <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-300 max-h-72 overflow-y-auto">
            {analysisText || (
              <span className="text-slate-500 italic">
                Awaiting simulation completion. Muse Wonder will automatically dissect bottlenecks, queue spillback, and signal phase efficiency once the simulation executes.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Signal Optimizer */}
      {activeTab === "optimizer" && (
        <div className="p-5 flex flex-col gap-4 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-slate-100 flex items-center space-x-2">
                <span>Signal Timing Optimization Trials</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  Multi-Run Search
                </span>
              </h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Simulates alternative green phase duration splits to minimize stopped delay and queue lengths.
              </p>
            </div>

            <button
              onClick={onOptimize}
              disabled={isOptimizing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs shadow-md transition disabled:opacity-50"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Simulating Splits...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Execute Optimization</span>
                </>
              )}
            </button>
          </div>

          {optimizationResult && (
            <div className="flex flex-col gap-3">
              {/* Highlight Card */}
              <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-lg p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      Optimal Phase Allocation Found
                    </span>
                    <p className="text-sm font-semibold text-slate-100">
                      Phase 1: {optimizationResult.best_split?.phase_1_seconds}s | Phase 2: {optimizationResult.best_split?.phase_2_seconds}s
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Delay Reduction</span>
                  <p className="text-base font-bold text-emerald-400 font-mono">
                    -{optimizationResult.wait_time_reduction_seconds}s
                  </p>
                </div>
              </div>

              {/* Trials Table */}
              <div className="border border-[#1e293b] rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1e293b]/60 text-slate-400 text-[10px] uppercase">
                      <th className="py-2 px-3">Split (P1 / P2)</th>
                      <th className="py-2 px-3">Avg Wait (s)</th>
                      <th className="py-2 px-3">Peak Queue</th>
                      <th className="py-2 px-3">Throughput</th>
                      <th className="py-2 px-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] font-mono text-[11px]">
                    {optimizationResult.trials?.map((tr: any, idx: number) => {
                      const isBest =
                        tr.split.phase_1_seconds === optimizationResult.best_split?.phase_1_seconds &&
                        tr.split.phase_2_seconds === optimizationResult.best_split?.phase_2_seconds;
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-[#1e293b]/30 transition ${
                            isBest ? "bg-emerald-950/20 text-emerald-300 font-semibold" : "text-slate-300"
                          }`}
                        >
                          <td className="py-2 px-3">
                            {tr.split.phase_1_seconds}s / {tr.split.phase_2_seconds}s {isBest && "(Best)"}
                          </td>
                          <td className="py-2 px-3">{tr.average_wait_seconds}s</td>
                          <td className="py-2 px-3">{tr.max_queue_length} veh</td>
                          <td className="py-2 px-3">{tr.throughput_vph}</td>
                          <td className="py-2 px-3">{tr.objective_score}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {optimizationResult.optimized_config && (
                <button
                  onClick={() => onApplyOptimization(optimizationResult.optimized_config)}
                  className="self-end flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Apply & Rerun Optimized Scenario</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
