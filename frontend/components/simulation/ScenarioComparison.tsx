"use client";

import React from "react";
import { GitCompare, TrendingDown, TrendingUp, CheckCircle, ShieldAlert } from "lucide-react";

interface ScenarioComparisonProps {
  scenarios: Array<{
    id: string;
    title: string;
    metrics: {
      average_waiting_time_seconds: number;
      average_travel_time_seconds: number;
      throughput_vph: number;
      max_queue_length: number;
      congestion_percentage: number;
      signal_efficiency_score: number;
    };
  }>;
}

export default function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  if (!scenarios || scenarios.length < 2) {
    return (
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 text-center text-slate-400">
        <GitCompare className="w-6 h-6 mx-auto mb-2 text-slate-500" />
        <p className="text-xs">Run an alternative scenario or execute signal optimization to compare results side-by-side.</p>
      </div>
    );
  }

  const baseline = scenarios[0];
  const alternative = scenarios[1];

  const waitDiff = Number(
    (alternative.metrics.average_waiting_time_seconds - baseline.metrics.average_waiting_time_seconds).toFixed(2)
  );
  const queueDiff = alternative.metrics.max_queue_length - baseline.metrics.max_queue_length;
  const throughputDiff = Number(
    (alternative.metrics.throughput_vph - baseline.metrics.throughput_vph).toFixed(1)
  );

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Scenario Comparison & Trade-off Analysis</h4>
            <p className="text-xs text-slate-400">Comparing Baseline vs Alternative Intervention</p>
          </div>
        </div>

        {waitDiff < 0 ? (
          <span className="flex items-center text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2.5 py-1 rounded-lg">
            <TrendingDown className="w-3.5 h-3.5 mr-1" />
            {Math.abs(waitDiff)}s Lower Delay
          </span>
        ) : (
          <span className="flex items-center text-xs font-mono text-rose-400 bg-rose-950/50 border border-rose-800 px-2.5 py-1 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +{waitDiff}s Greater Delay
          </span>
        )}
      </div>

      {/* Comparison Table */}
      <div className="border border-[#1e293b] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#1e293b]/60 text-slate-400 text-[10px] uppercase">
              <th className="py-2.5 px-3">Metric</th>
              <th className="py-2.5 px-3">{baseline.title} (A)</th>
              <th className="py-2.5 px-3">{alternative.title} (B)</th>
              <th className="py-2.5 px-3">Delta (B - A)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b] font-mono text-[11px]">
            <tr className="hover:bg-[#1e293b]/20">
              <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Avg Waiting Time</td>
              <td className="py-2.5 px-3 text-slate-300">{baseline.metrics.average_waiting_time_seconds}s</td>
              <td className="py-2.5 px-3 text-slate-300">{alternative.metrics.average_waiting_time_seconds}s</td>
              <td className={`py-2.5 px-3 font-bold ${waitDiff <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {waitDiff <= 0 ? `${waitDiff}s` : `+${waitDiff}s`}
              </td>
            </tr>

            <tr className="hover:bg-[#1e293b]/20">
              <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Peak Queue Length</td>
              <td className="py-2.5 px-3 text-slate-300">{baseline.metrics.max_queue_length} veh</td>
              <td className="py-2.5 px-3 text-slate-300">{alternative.metrics.max_queue_length} veh</td>
              <td className={`py-2.5 px-3 font-bold ${queueDiff <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {queueDiff <= 0 ? `${queueDiff} veh` : `+${queueDiff} veh`}
              </td>
            </tr>

            <tr className="hover:bg-[#1e293b]/20">
              <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Throughput</td>
              <td className="py-2.5 px-3 text-slate-300">{baseline.metrics.throughput_vph} VPH</td>
              <td className="py-2.5 px-3 text-slate-300">{alternative.metrics.throughput_vph} VPH</td>
              <td className={`py-2.5 px-3 font-bold ${throughputDiff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {throughputDiff >= 0 ? `+${throughputDiff} VPH` : `${throughputDiff} VPH`}
              </td>
            </tr>

            <tr className="hover:bg-[#1e293b]/20">
              <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">Signal Efficiency</td>
              <td className="py-2.5 px-3 text-slate-300">{baseline.metrics.signal_efficiency_score}/100</td>
              <td className="py-2.5 px-3 text-slate-300">{alternative.metrics.signal_efficiency_score}/100</td>
              <td className="py-2.5 px-3 font-bold text-sky-400">
                {(alternative.metrics.signal_efficiency_score - baseline.metrics.signal_efficiency_score).toFixed(1)} pts
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
