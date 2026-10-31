"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Settings, Key, ShieldCheck, Cpu, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { getMetaApiStatus } from "@/lib/api";

export default function SettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Configuration & API Status</h1>
          <p className="text-xs text-slate-400 mt-1">
            Meta Model API connectivity status, security safeguards, and simulation engine parameters.
          </p>
        </div>

        {/* API Credentials Status Card */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Key className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-100">Meta Model API Credentials</h3>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              {status?.configured ? (
                <span className="flex items-center text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-md font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Live API Connected
                </span>
              ) : (
                <span className="flex items-center text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-md font-mono text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  Awaiting Credentials (MODEL_API_KEY)
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 text-xs font-mono text-slate-300 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Official Endpoint:</span>
              <span className="text-slate-200">https://api.meta.ai/v1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Primary Reasoning:</span>
              <span className="text-sky-400">Muse Spark & Muse Wonder</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Vision & Audio:</span>
              <span className="text-purple-400">SAM 3.1 & Muse Voice</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Environment Variable:</span>
              <span className="text-amber-400 font-bold">MODEL_API_KEY</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            API secrets are strictly managed in server-side environment variables and are never transmitted to browser JavaScript.
            When <code className="text-amber-400">MODEL_API_KEY</code> is configured in <code className="text-slate-200">.env</code>, Dream2Sim automatically initiates live calls to Meta's endpoints.
          </p>
        </div>

        {/* Security & System Info */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">Security & Isolation</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b] flex flex-col gap-1">
              <span className="text-slate-400 font-medium">Deterministic Isolation</span>
              <span className="text-slate-200 text-[11px]">
                Python engine runs in controlled sandbox without arbitrary code execution.
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b] flex flex-col gap-1">
              <span className="text-slate-400 font-medium">Encrypted Sessions</span>
              <span className="text-slate-200 text-[11px]">
                JWT HS256 tokens and bcrypt salted password hashes.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
