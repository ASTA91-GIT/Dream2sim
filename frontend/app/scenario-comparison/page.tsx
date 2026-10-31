"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StitchSidebar } from "@/components/StitchSidebar";
import { StitchHeader } from "@/components/StitchHeader";

export default function ScenarioComparisonPage() {
  const [selectedBaseline, setSelectedBaseline] = useState("Fixed 90s Phase Baseline");
  const [selectedOptimized, setSelectedOptimized] = useState("Adaptive Meta RL Cycle");

  const comparisonData = [
    {
      metric: "Average Travel Delay",
      baseline: "48.2 s",
      optimized: "36.4 s",
      delta: "-24.5%",
      isPositive: true,
      unit: "seconds / vehicle",
    },
    {
      metric: "Intersection Throughput",
      baseline: "1,180 VPH",
      optimized: "1,420 VPH",
      delta: "+20.3%",
      isPositive: true,
      unit: "vehicles / hour",
    },
    {
      metric: "Maximum Queue Length",
      baseline: "28 vehicles",
      optimized: "14 vehicles",
      delta: "-50.0%",
      isPositive: true,
      unit: "vehicles",
    },
    {
      metric: "Congestion Spillback Risk",
      baseline: "68.4%",
      optimized: "18.2%",
      delta: "-73.4%",
      isPositive: true,
      unit: "risk probability",
    },
    {
      metric: "Signal Efficiency Score",
      baseline: "62.0%",
      optimized: "91.8%",
      delta: "+48.0%",
      isPositive: true,
      unit: "algorithmic rating",
    },
    {
      metric: "Carbon Emission Estimate",
      baseline: "142 kg/hr",
      optimized: "108 kg/hr",
      delta: "-23.9%",
      isPositive: true,
      unit: "CO2 equivalent",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-container-lowest)] text-[var(--on-surface)] selection:bg-[#B13BFF] selection:text-white">
      <StitchSidebar />
      <div className="pl-72">
        <StitchHeader
          breadcrumbs={[
            { label: "Overview", href: "/dashboard" },
            { label: "Scenario Comparison" },
          ]}
        />

        <main className="w-full pt-16 min-h-screen px-6 py-6 flex flex-col gap-6">
          {/* Header */}
          <div className="glass-tier-2 p-6 rounded-2xl border border-[var(--glass-border-2)] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-telemetry text-xs uppercase tracking-wider text-[var(--tertiary)] font-bold">
                  EVALUATION MATRIX
                </span>
                <span className="text-[var(--outline)] font-telemetry">/</span>
                <span className="font-telemetry text-xs text-[var(--on-surface-variant)]">
                  Differential Telemetry
                </span>
              </div>
              <h1 className="font-headline text-2xl font-bold text-[var(--on-surface)] mt-1">
                Scenario Comparison & Policy Benchmark
              </h1>
              <p className="font-body text-xs text-[var(--on-surface-variant)] mt-1">
                Contrast baseline deterministic traffic runs against AI-optimized signal configurations and transit priority corridors.
              </p>
            </div>

            <Link
              href="/workspace"
              className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold shadow-lg shrink-0"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Open in Workspace</span>
            </Link>
          </div>

          {/* Scenario Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Scenario A: Baseline */}
            <div className="glass-tier-1 p-5 rounded-xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-telemetry text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]">
                  SCENARIO A (BASELINE)
                </span>
                <span className="material-symbols-outlined text-[var(--outline)]">history</span>
              </div>
              <h3 className="font-headline text-base font-bold text-[var(--on-surface)]">
                {selectedBaseline}
              </h3>
              <p className="font-body text-xs text-[var(--on-surface-variant)]">
                Traditional fixed-time 90s dual-phase cycle with uncoordinated arterial progression. Eastern road barrier closed.
              </p>
              <div className="flex items-center gap-3 pt-2 font-telemetry text-xs text-[var(--outline)]">
                <span>Duration: 300s</span>
                <span>•</span>
                <span>Vehicles: 842</span>
              </div>
            </div>

            {/* Scenario B: Optimized */}
            <div className="glass-tier-2 p-5 rounded-xl border border-[var(--primary)]/40 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-telemetry text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--tertiary)]/20 text-[var(--tertiary)] border border-[var(--tertiary)]/30">
                  SCENARIO B (AI REINFORCED)
                </span>
                <span className="material-symbols-outlined text-[var(--tertiary)]">auto_awesome</span>
              </div>
              <h3 className="font-headline text-base font-bold text-[var(--on-surface)]">
                {selectedOptimized}
              </h3>
              <p className="font-body text-xs text-[var(--on-surface-variant)]">
                Dynamic 110s split with 15s extended North green buffer, automated bus preemption, and queue mitigation.
              </p>
              <div className="flex items-center gap-3 pt-2 font-telemetry text-xs text-[var(--secondary)] font-semibold">
                <span>Duration: 300s</span>
                <span>•</span>
                <span>Vehicles: 914</span>
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="glass-tier-1 rounded-2xl border border-[var(--outline-variant)]/20 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--outline-variant)]/15 flex items-center justify-between">
              <h2 className="font-headline text-base font-bold text-[var(--on-surface)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)] text-lg">
                  compare_arrows
                </span>
                <span>Quantitative Differential Matrix</span>
              </h2>
              <span className="font-telemetry text-xs text-[var(--secondary)] font-bold">
                Net Efficiency Gain: +34.2%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body text-xs">
                <thead>
                  <tr className="bg-[var(--surface-container)]/50 text-[var(--on-surface-variant)] font-telemetry text-[11px] uppercase tracking-wider border-b border-[var(--outline-variant)]/15">
                    <th className="py-3.5 px-6">Metric Description</th>
                    <th className="py-3.5 px-6">Baseline Policy</th>
                    <th className="py-3.5 px-6">AI Optimized Policy</th>
                    <th className="py-3.5 px-6 text-right">Variance (Δ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]/10">
                  {comparisonData.map((row) => (
                    <tr key={row.metric} className="hover:bg-[var(--surface-container-high)]/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-[var(--on-surface)]">
                        <div>{row.metric}</div>
                        <div className="text-[10px] text-[var(--outline)] font-telemetry mt-0.5">
                          {row.unit}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-telemetry text-[var(--on-surface-variant)] font-medium">
                        {row.baseline}
                      </td>
                      <td className="py-4 px-6 font-telemetry text-[var(--on-surface)] font-bold text-[var(--primary)]">
                        {row.optimized}
                      </td>
                      <td className="py-4 px-6 text-right font-telemetry font-bold">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--secondary-container)]/40 text-[var(--secondary)] border border-[var(--secondary)]/30">
                          {row.delta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
