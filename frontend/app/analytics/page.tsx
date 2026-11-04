"use client";

import React from "react";
import Link from "next/link";
import { StitchSidebar } from "@/components/StitchSidebar";
import { StitchHeader } from "@/components/StitchHeader";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-container-lowest)] text-[var(--on-surface)] selection:bg-[#B13BFF] selection:text-white">
      <StitchSidebar />
      <div className="pl-72">
        <StitchHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Analytics" },
          ]}
        />

        <main className="w-full pt-16 min-h-screen px-6 py-6 flex flex-col gap-6">
          {/* Header */}
          <div className="glass-tier-2 p-6 rounded-2xl border border-[var(--glass-border-2)] shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-telemetry text-xs uppercase tracking-wider text-[var(--secondary)] font-bold">
                TELEMETRY LOGS
              </span>
              <span className="text-[var(--outline)] font-telemetry">/</span>
              <span className="font-telemetry text-xs text-[var(--on-surface-variant)]">
                Convergence Curves
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[var(--on-surface)]">
              Simulation Analytics & Telemetry
            </h1>
            <p className="font-body text-xs text-[var(--on-surface-variant)]">
              Examine numerical distributions, vehicular velocity profiles, and queue dissipation rates across simulated iterations.
            </p>
          </div>

          {/* Quick KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-tier-1 p-5 rounded-xl border border-[var(--outline-variant)]/20 shadow-md">
              <span className="font-telemetry text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider">
                Average Speed
              </span>
              <div className="font-headline text-2xl font-bold text-[var(--primary)] mt-1">
                38.4 km/h
              </div>
              <span className="font-telemetry text-[10px] text-[var(--secondary)] font-semibold">
                +14.2% vs baseline
              </span>
            </div>

            <div className="glass-tier-1 p-5 rounded-xl border border-[var(--outline-variant)]/20 shadow-md">
              <span className="font-telemetry text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider">
                Total Vehicles Run
              </span>
              <div className="font-headline text-2xl font-bold text-[var(--tertiary)] mt-1">
                1,842 veh
              </div>
              <span className="font-telemetry text-[10px] text-[var(--on-surface-variant)] font-semibold">
                Across 4 runs
              </span>
            </div>

            <div className="glass-tier-1 p-5 rounded-xl border border-[var(--outline-variant)]/20 shadow-md">
              <span className="font-telemetry text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider">
                Signal Efficiency
              </span>
              <div className="font-headline text-2xl font-bold text-[var(--secondary)] mt-1">
                92.4%
              </div>
              <span className="font-telemetry text-[10px] text-[var(--secondary)] font-semibold">
                Converged in 14 iters
              </span>
            </div>

            <div className="glass-tier-1 p-5 rounded-xl border border-[var(--outline-variant)]/20 shadow-md">
              <span className="font-telemetry text-[10px] text-[var(--on-surface-variant)] uppercase tracking-wider">
                Queue Clearance
              </span>
              <div className="font-headline text-2xl font-bold text-[var(--on-surface)] mt-1">
                4.2 sec
              </div>
              <span className="font-telemetry text-[10px] text-[var(--secondary)] font-semibold">
                -3.8s delay delta
              </span>
            </div>
          </div>

          {/* Historical Runs Table */}
          <div className="glass-tier-1 rounded-2xl border border-[var(--outline-variant)]/20 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--outline-variant)]/15 flex items-center justify-between">
              <h2 className="font-headline text-base font-bold text-[var(--on-surface)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--primary)] text-lg">
                  history_edu
                </span>
                <span>Calibrated Run Records</span>
              </h2>
              <span className="font-telemetry text-xs text-[var(--tertiary)] font-bold">
                Deterministic IDM Physics
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body text-xs">
                <thead>
                  <tr className="bg-[var(--surface-container)]/50 text-[var(--on-surface-variant)] font-telemetry text-[11px] uppercase tracking-wider border-b border-[var(--outline-variant)]/15">
                    <th className="py-3.5 px-6">Scenario Title</th>
                    <th className="py-3.5 px-6">Duration</th>
                    <th className="py-3.5 px-6">Vehicles</th>
                    <th className="py-3.5 px-6">Avg Delay</th>
                    <th className="py-3.5 px-6">Peak Queue</th>
                    <th className="py-3.5 px-6">Throughput</th>
                    <th className="py-3.5 px-6 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]/10 font-telemetry">
                  <tr className="hover:bg-[var(--surface-container-high)]/30 transition-colors">
                    <td className="py-4 px-6 font-headline text-xs font-semibold text-[var(--on-surface)]">
                      Four-Way Worli Naka Intersection — Rush Hour Pulse
                    </td>
                    <td className="py-4 px-6 text-[var(--on-surface-variant)]">300s</td>
                    <td className="py-4 px-6 text-[var(--on-surface-variant)]">142 veh</td>
                    <td className="py-4 px-6 text-[var(--tertiary)] font-bold">18.4s</td>
                    <td className="py-4 px-6 text-[var(--error)] font-bold">14 veh</td>
                    <td className="py-4 px-6 text-[var(--secondary)] font-bold">1,416 VPH</td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href="/workspace"
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--primary)] hover:bg-[var(--primary-container)] hover:text-white transition-all font-semibold"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-[var(--surface-container-high)]/30 transition-colors">
                    <td className="py-4 px-6 font-headline text-xs font-semibold text-[var(--on-surface)]">
                      Adaptive Signal Optimization (55s / 20s split)
                    </td>
                    <td className="py-4 px-6 text-[var(--on-surface-variant)]">300s</td>
                    <td className="py-4 px-6 text-[var(--on-surface-variant)]">142 veh</td>
                    <td className="py-4 px-6 text-[var(--secondary)] font-bold">14.2s</td>
                    <td className="py-4 px-6 text-[var(--secondary)] font-bold">9 veh</td>
                    <td className="py-4 px-6 text-[var(--secondary)] font-bold">1,520 VPH</td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href="/workspace"
                        className="px-3 py-1.5 rounded-lg bg-[var(--surface-container-high)] text-[var(--primary)] hover:bg-[var(--primary-container)] hover:text-white transition-all font-semibold"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
