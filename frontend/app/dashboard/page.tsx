"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Car,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
} from "lucide-react";

const TEMPLATES = [
  {
    id: "mumbai_rush_hour",
    title: "Mumbai 4-Way Junction Rush Hour",
    description: "North approach heavy arrival volume (1,100 VPH), eastern road closed due to construction, 5-minute simulation.",
    entities: ["4-Way Intersection", "Cars", "Motorcycles", "Buses", "Emergency Vehicles"],
    constraints: ["East Road Closed", "Rush-Hour Ingress"],
    signalPhases: "Phase 1: 40s (NS) | Phase 2: 15s (EW)",
  },
  {
    id: "emergency_corridor",
    title: "Emergency Corridor Priority Preemption",
    description: "Ambulance priority routing along West Avenue with adaptive signal preemption.",
    entities: ["Priority Junction", "Emergency Vehicles", "Cross-Traffic"],
    constraints: ["Emergency Preemption", "Downstream Clearance"],
    signalPhases: "Actuated Preemption Trigger",
  },
  {
    id: "signal_breakdown",
    title: "Traffic Signal Timing Breakdown & Spillback",
    description: "Sub-optimal 15-second green time causing 18+ vehicle queue spillback on major arterials.",
    entities: ["Over-saturated Intersection", "Buses", "Passenger Vehicles"],
    constraints: ["Under-allocated Green Time"],
    signalPhases: "Phase 1: 15s | Phase 2: 45s",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
              <span>Simulation Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select a calibrated template or launch the interactive workspace to construct new models.
            </p>
          </div>

          <Link
            href="/workspace"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Natural-Language Simulation</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Simulations", value: "3", icon: Layers, color: "text-sky-400" },
            { label: "Tested Scenarios", value: "8", icon: TrendingUp, color: "text-emerald-400" },
            { label: "Avg Delay Reduction", value: "-24.6%", icon: Clock, color: "text-purple-400" },
            { label: "Engine Accuracy", value: "Deterministic", icon: CheckCircle2, color: "text-amber-400" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold font-mono text-white mt-2">{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Quick-Start Engineering Templates</span>
            </h3>
            <span className="text-xs text-slate-400">Pre-configured physics scenarios</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-[#0f172a] border border-[#1e293b] hover:border-sky-500/50 rounded-xl p-5 shadow-xl flex flex-col justify-between transition group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                      Calibrated Model
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-100 group-hover:text-sky-400 transition">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tpl.description}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tpl.constraints.map((c, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#1e293b] text-slate-300 font-mono">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Signal timing: {tpl.signalPhases}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1e293b]">
                  <Link
                    href="/workspace"
                    className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-[#1e293b] group-hover:bg-sky-500 text-slate-200 group-hover:text-slate-950 font-semibold text-xs transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Simulation</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
