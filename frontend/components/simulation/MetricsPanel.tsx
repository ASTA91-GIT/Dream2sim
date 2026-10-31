"use client";

import React from "react";
import {
  TrendingUp,
  Clock,
  Car,
  Gauge,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { SimulationMetrics } from "@/lib/api";

interface MetricsPanelProps {
  metrics: SimulationMetrics | null;
  isLoading?: boolean;
}

export default function MetricsPanel({ metrics, isLoading }: MetricsPanelProps) {
  if (!metrics) {
    return (
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-8 text-center text-slate-400">
        <Activity className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-pulse" />
        <p className="text-sm">Run a simulation to view verified numerical metrics.</p>
      </div>
    );
  }

  const kpis = [
    {
      title: "Throughput",
      value: `${metrics.throughput_vph}`,
      unit: "VPH",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Avg Waiting Time",
      value: `${metrics.average_waiting_time_seconds}`,
      unit: "sec",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Peak Queue Length",
      value: `${metrics.max_queue_length}`,
      unit: "veh",
      icon: Layers,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      title: "Average Speed",
      value: `${metrics.average_speed_kmh}`,
      unit: "km/h",
      icon: Gauge,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      title: "Congestion Index",
      value: `${metrics.congestion_percentage}%`,
      unit: "network",
      icon: AlertTriangle,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      title: "Signal Efficiency",
      value: `${metrics.signal_efficiency_score}`,
      unit: "/100",
      icon: Zap,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* 6 Core KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`bg-[#0f172a] border ${kpi.border} rounded-xl p-3.5 flex flex-col justify-between shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400">{kpi.title}</span>
                <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                  {kpi.value}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{kpi.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time-Series Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicles Progression Chart */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Vehicle Dynamics (Active vs Queued)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">1s intervals</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.time_series}>
                <defs>
                  <linearGradient id="activeVeh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="queuedVeh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickFormatter={(t) => `${t}s`} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#334155",
                    fontSize: "11px",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="active_vehicles" stroke="#38bdf8" fillOpacity={1} fill="url(#activeVeh)" name="Active" />
                <Area type="monotone" dataKey="queued_vehicles" stroke="#ef4444" fillOpacity={1} fill="url(#queuedVeh)" name="In Queue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Speed Progression Chart */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Velocity Profile (Average km/h)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">IDM Kinematics</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.time_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickFormatter={(t) => `${t}s`} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#334155",
                    fontSize: "11px",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="average_speed_kmh" stroke="#10b981" strokeWidth={2} dot={false} name="Speed (km/h)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
