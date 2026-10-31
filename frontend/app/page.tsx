"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Sparkles,
  ArrowRight,
  Layers,
  Brain,
  Activity,
  Cpu,
  Mic,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-[#1e293b]">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-500/10 via-purple-500/10 to-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0f172a] border border-[#1e293b] text-xs font-mono text-sky-400 mb-8 shadow-lg shadow-sky-500/5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Built for the Meta Global AI Developer Hackathon</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
            Idea-to-Simulation, <br />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Powered by Meta AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Describe any real-world situation in natural language. Dream2Sim converts your words into a validated, deterministic, interactive physics simulation with engineering analytics.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/workspace"
              className="flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Live Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-slate-300 font-semibold text-sm border border-[#1e293b] transition"
            >
              Explore Templates
            </Link>
          </div>

          {/* Core Philosophy Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full text-left">
            {[
              { step: "01", title: "Describe", desc: "Speak or type any traffic or urban scenario in plain language." },
              { step: "02", title: "Generate", desc: "Muse Spark extracts entities and constructs valid road network geometry." },
              { step: "03", title: "Simulate", desc: "Deterministic Python physics engine calculates microscopic vehicle kinematics." },
              { step: "04", title: "Reason", desc: "Muse Wonder evaluates real bottlenecks and optimizes signal splits." },
            ].map((item) => (
              <div key={item.step} className="bg-[#0f172a]/70 border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-mono text-sky-400 font-bold">{item.step}</span>
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meta AI Integration Architecture Section */}
      <section className="py-20 border-b border-[#1e293b] bg-[#090d16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">
              Deep Architectural Integration
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              Integrated with Official Meta Model APIs
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Dream2Sim harnesses the specialized capabilities of Meta's model family without replacing deterministic physics ground truth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Muse Spark */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Muse Spark</h3>
                <span className="text-[11px] font-mono text-sky-400">Primary AI Orchestration Engine</span>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Extracts entities, spatial relations, and physical constraints from natural descriptions. Employs Structured Outputs and Tool Calling to safely configure simulation models.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center text-[11px] text-slate-500 font-mono">
                <span>Structured Outputs • Tool Calling</span>
              </div>
            </div>

            {/* Muse Wonder */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Muse Wonder</h3>
                <span className="text-[11px] font-mono text-purple-400">Deep Analytical Reasoning</span>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Dissects actual numerical simulation metrics: queue length spikes, delay distributions, and signal splits. Generates rigorous engineering explanations grounded in physics.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center text-[11px] text-slate-500 font-mono">
                <span>Reasoning Controls • Optimization Insights</span>
              </div>
            </div>

            {/* SAM 3.1 & Muse Voice */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">SAM 3.1 & Muse Voice</h3>
                <span className="text-[11px] font-mono text-indigo-400">Multimodal Input Pipelines</span>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Upload aerial or street intersection photos to localize vehicles with SAM 3.1 segmentation. Speak directly into your microphone with Muse Voice Transcribe speech-to-text.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center text-[11px] text-slate-500 font-mono">
                <span>Vision Segmentation • Audio Transcription</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Physics & Determinism Section */}
      <section className="py-20 border-b border-[#1e293b] bg-[#0c1322]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              Technical Credibility
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              A Real Deterministic Simulation Engine in Pure Python
            </h2>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Dream2Sim does not rely on random frontend visual tricks. Every simulation is driven by an Intelligent Driver Model (IDM) car-following engine with multi-phase traffic signals, road closure rerouting, and exact queue calculation.
            </p>

            <div className="mt-8 flex flex-col gap-3 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Strict determinism: Same seed and configuration yields identical numerical results.</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PixiJS hardware-accelerated 60 FPS rendering decoupled from discrete-time physics.</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automated multi-run signal timing optimizer evaluating true delay reduction.</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/workspace"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
              >
                <span>Try the Mumbai Rush Hour Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Terminal / Code Visual Preview */}
          <div className="w-full lg:max-w-lg bg-[#090d16] border border-[#1e293b] rounded-xl p-5 shadow-2xl font-mono text-[11px] leading-relaxed">
            <div className="flex items-center space-x-1.5 pb-3 border-b border-[#1e293b] text-slate-500 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-slate-400 text-[10px]">mumbai_rush_hour_metrics.json</span>
            </div>

            <pre className="text-slate-300 overflow-x-auto">
{`{
  "total_vehicles_generated": 142,
  "total_vehicles_processed": 118,
  "average_waiting_time_seconds": 18.42,
  "max_queue_length": 14,
  "throughput_vph": 1416.0,
  "signal_efficiency_score": 78.5,
  "kinematics_model": "IDM",
  "engine_status": "deterministic_verified"
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-[#090d16] text-center text-xs text-slate-500 border-t border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-200">Dream2Sim</span>
            <span>— AI-Powered Simulation Platform</span>
          </div>
          <div>
            Built with Next.js, FastAPI, PixiJS, and Meta Model API.
          </div>
        </div>
      </footer>
    </div>
  );
}
