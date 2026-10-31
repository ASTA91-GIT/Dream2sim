"use client";

import React, { useState } from "react";
import { Sparkles, Mic, Image as ImageIcon, Send, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface PromptEditorProps {
  onSynthesize: (prompt: string) => Promise<void>;
  isLoading: boolean;
  onOpenVoiceModal: () => void;
  onOpenMediaModal: () => void;
  identifiedEntities?: string[];
  identifiedConstraints?: string[];
}

const PRESET_PROMPTS = [
  "Create a four-way intersection in Mumbai during evening rush hour. There are cars, buses, motorcycles, and pedestrians. The north road has heavy traffic, and the eastern road is closed. Simulate traffic for five minutes and suggest better signal timings.",
  "Create a high-density urban junction with an emergency vehicle corridor on the West approach. Evaluate signal green preemption impact.",
  "Simulate a 4-way signalized intersection with an unexpected 50% surge in motorcycle and bus demand on the South approach.",
];

export default function PromptEditor({
  onSynthesize,
  isLoading,
  onOpenVoiceModal,
  onOpenMediaModal,
  identifiedEntities = [],
  identifiedConstraints = [],
}: PromptEditorProps) {
  const [prompt, setPrompt] = useState<string>(PRESET_PROMPTS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSynthesize(prompt);
  };

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <span>Natural-Language Prompt Engine</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">
                Meta Muse Spark
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Describe your scenario in plain English. The AI parses entities, geometry, and constraints.
            </p>
          </div>
        </div>

        {/* Multimodal Actions */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-xs transition border border-slate-700/50"
            title="Transcribe voice using Muse Voice Transcribe"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span>Voice Input</span>
          </button>

          <button
            type="button"
            onClick={onOpenMediaModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-slate-200 text-xs transition border border-slate-700/50"
            title="Segment intersection photograph using SAM 3.1"
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>SAM 3.1 Vision</span>
          </button>
        </div>
      </div>

      {/* Textarea Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g. Create a 4-way intersection with heavy traffic on the North approach and 60s signal timing..."
            className="w-full bg-[#090d16] border border-[#1e293b] focus:border-sky-500 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition resize-none font-sans"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] text-slate-400">
          <span className="text-slate-500 whitespace-nowrap font-medium">Presets:</span>
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPrompt(p)}
              className="px-2.5 py-1 rounded-md bg-[#1e293b]/70 hover:bg-[#1e293b] text-slate-300 border border-slate-800 whitespace-nowrap transition"
            >
              Preset {idx + 1}: {idx === 0 ? "Mumbai Rush Hour" : idx === 1 ? "Emergency Corridor" : "Demand Surge"}
            </button>
          ))}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {identifiedEntities.length > 0 && (
              <span className="flex items-center text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {identifiedEntities.length} Entities Extracted
              </span>
            )}
            {identifiedConstraints.length > 0 && (
              <span className="flex items-center text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded text-[11px]">
                <AlertCircle className="w-3 h-3 mr-1" />
                {identifiedConstraints.length} Constraints Active
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs shadow-lg shadow-sky-500/20 disabled:opacity-50 transition"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Simulation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Simulation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
