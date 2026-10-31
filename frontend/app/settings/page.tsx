"use client";

import React, { useEffect, useState } from "react";
import { StitchSidebar } from "@/components/StitchSidebar";
import { StitchHeader } from "@/components/StitchHeader";
import { getMetaApiStatus } from "@/lib/api";

export default function SettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [veltEnabled, setVeltEnabled] = useState(true);
  const [cudaAcceleration, setCudaAcceleration] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await getMetaApiStatus();
        setStatus(res);
      } catch (e) {
        setStatus(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--surface-container-lowest)] text-[var(--on-surface)] selection:bg-[#B13BFF] selection:text-white">
      <StitchSidebar />
      <div className="pl-72">
        <StitchHeader
          breadcrumbs={[
            { label: "Overview", href: "/dashboard" },
            { label: "Settings & Integrations" },
          ]}
        />

        <main className="w-full pt-16 min-h-screen px-6 py-6 flex flex-col gap-6 max-w-5xl">
          {/* Header */}
          <div className="glass-tier-2 p-6 rounded-2xl border border-[var(--glass-border-2)] shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-telemetry text-xs uppercase tracking-wider text-[var(--primary)] font-bold">
                SYSTEM CONFIGURATION
              </span>
              <span className="text-[var(--outline)] font-telemetry">/</span>
              <span className="font-telemetry text-xs text-[var(--on-surface-variant)]">
                Node Environment
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[var(--on-surface)]">
              Settings & Integrations
            </h1>
            <p className="font-body text-xs text-[var(--on-surface-variant)] leading-relaxed">
              Configure Meta Model API connectivity, Velt live presence mesh, and high-performance physics compute flags.
            </p>
          </div>

          {/* Meta Model API Status */}
          <div className="glass-tier-1 p-6 rounded-2xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[var(--tertiary)] text-xl">
                  key
                </span>
                <h3 className="font-headline text-base font-bold text-[var(--on-surface)]">
                  Meta Model API Gateway
                </h3>
              </div>

              {status?.configured ? (
                <span className="flex items-center gap-1.5 font-telemetry text-xs font-bold px-3 py-1 rounded-full bg-[var(--secondary-container)] text-[var(--secondary)] border border-[var(--secondary)]/30">
                  <span className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse"></span>
                  Live Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-telemetry text-xs font-bold px-3 py-1 rounded-full bg-[var(--tertiary)]/20 text-[var(--tertiary)] border border-[var(--tertiary)]/30">
                  <span className="w-2 h-2 rounded-full bg-[var(--tertiary)]"></span>
                  Awaiting Credentials (MODEL_API_KEY)
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-container-lowest)]/80 border border-[var(--outline-variant)]/20 font-telemetry text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--on-surface-variant)]">Official API Endpoint:</span>
                <span className="text-[var(--on-surface)]">https://api.meta.ai/v1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--on-surface-variant)]">Reasoning Models:</span>
                <span className="text-[var(--primary)] font-bold">Muse Spark 3.1 & Muse Wonder</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--on-surface-variant)]">Vision & Audio Multi-Modal:</span>
                <span className="text-[var(--secondary)] font-bold">SAM 3.1 & Muse Voice</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--on-surface-variant)]">Server Variable:</span>
                <span className="text-[var(--tertiary)] font-bold">MODEL_API_KEY</span>
              </div>
            </div>

            <p className="font-body text-xs text-[var(--on-surface-variant)] leading-relaxed">
              API credentials are kept strictly server-side and never exposed to browser memory. When configured in <code>.env</code>, all simulation runs and prompts automatically utilize Meta's live endpoints.
            </p>
          </div>

          {/* Velt Real-Time Collaboration Settings */}
          <div className="glass-tier-1 p-6 rounded-2xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[var(--primary)] text-xl">
                  forum
                </span>
                <h3 className="font-headline text-base font-bold text-[var(--on-surface)]">
                  Velt Collaboration Mesh
                </h3>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={veltEnabled}
                  onChange={(e) => setVeltEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--surface-container-high)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-container)]"></div>
              </label>
            </div>

            <p className="font-body text-xs text-[var(--on-surface-variant)] leading-relaxed">
              Enables live cursor tracking, in-viewport spatial comment pins, and presence broadcast across all connected engineers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-telemetry">
              <div className="p-3 rounded-lg bg-[var(--surface-container)]/70 flex items-center justify-between">
                <span className="text-[var(--on-surface-variant)]">Mesh Channel:</span>
                <span className="text-[var(--on-surface)] font-bold">org-mumbai-urban-01</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-container)]/70 flex items-center justify-between">
                <span className="text-[var(--on-surface-variant)]">Heartbeat Latency:</span>
                <span className="text-[var(--secondary)] font-bold">12ms (Optimal)</span>
              </div>
            </div>
          </div>

          {/* Compute & Simulation Engine */}
          <div className="glass-tier-1 p-6 rounded-2xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[var(--secondary)] text-xl">
                  memory
                </span>
                <h3 className="font-headline text-base font-bold text-[var(--on-surface)]">
                  Deterministic Physics Engine (CUDA)
                </h3>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cudaAcceleration}
                  onChange={(e) => setCudaAcceleration(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--surface-container-high)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--tertiary)]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-telemetry">
              <div className="p-3 rounded-lg bg-[var(--surface-container)]/70 flex flex-col gap-1">
                <span className="text-[var(--on-surface-variant)]">Time Step (Δt):</span>
                <span className="text-[var(--on-surface)] font-bold">0.10 seconds</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-container)]/70 flex flex-col gap-1">
                <span className="text-[var(--on-surface-variant)]">Car-Following Model:</span>
                <span className="text-[var(--on-surface)] font-bold">Intelligent Driver (IDM)</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-container)]/70 flex flex-col gap-1">
                <span className="text-[var(--on-surface-variant)]">Lane Change Model:</span>
                <span className="text-[var(--on-surface)] font-bold">MOBIL Cooperative</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
