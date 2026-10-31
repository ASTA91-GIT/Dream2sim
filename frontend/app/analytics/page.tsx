"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { BarChart3, TrendingUp, Clock, Zap, Download, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Analytics & Historical Runs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review numerical performance logs, compare cross-scenario bottlenecks, and export technical documentation.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Completed Simulation Records</span>
            </h3>
            <span className="text-xs text-slate-400">Grounded in Python Physics</span>
          </div>

          <div className="border border-[#1e293b] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1e293b]/60 text-slate-400 text-[10px] uppercase">
                  <th className="py-3 px-4">Scenario Title</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Vehicles Generated</th>
                  <th className="py-3 px-4">Avg Waiting Time</th>
                  <th className="py-3 px-4">Peak Queue</th>
                  <th className="py-3 px-4">Throughput</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] font-mono text-[11px] text-slate-300">
                <tr className="hover:bg-[#1e293b]/20">
                  <td className="py-3 px-4 font-sans font-medium text-slate-100">Mumbai 4-Way Junction Rush Hour</td>
                  <td className="py-3 px-4">300s</td>
                  <td className="py-3 px-4">142 veh</td>
                  <td className="py-3 px-4 text-amber-400">18.42s</td>
                  <td className="py-3 px-4 text-rose-400">14 veh</td>
                  <td className="py-3 px-4 text-emerald-400">1416.0 VPH</td>
                  <td className="py-3 px-4 font-sans">
                    <Link href="/workspace" className="text-sky-400 hover:underline">
                      Inspect &rarr;
                    </Link>
                  </td>
                </tr>

                <tr className="hover:bg-[#1e293b]/20">
                  <td className="py-3 px-4 font-sans font-medium text-slate-100">Optimized Signal Split (55s / 20s)</td>
                  <td className="py-3 px-4">300s</td>
                  <td className="py-3 px-4">142 veh</td>
                  <td className="py-3 px-4 text-emerald-400">14.20s</td>
                  <td className="py-3 px-4 text-emerald-400">9 veh</td>
                  <td className="py-3 px-4 text-emerald-400">1520.0 VPH</td>
                  <td className="py-3 px-4 font-sans">
                    <Link href="/workspace" className="text-sky-400 hover:underline">
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
  );
}
