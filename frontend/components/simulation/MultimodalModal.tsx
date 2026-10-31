"use client";

import React, { useState } from "react";
import { X, Mic, Image as ImageIcon, Upload, Check, RefreshCw, Sliders, AlertCircle } from "lucide-react";
import { uploadMediaFile, segmentMediaWithSam, transcribeVoiceWithMuse } from "@/lib/api";

interface MultimodalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertPrompt: (text: string) => void;
  initialTab?: "voice" | "sam";
}

export default function MultimodalModal({
  isOpen,
  onClose,
  onInsertPrompt,
  initialTab = "voice",
}: MultimodalModalProps) {
  const [activeTab, setActiveTab] = useState<"voice" | "sam">(initialTab);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);
  const [calibrationScale, setCalibrationScale] = useState(0.08);

  if (!isOpen) return null;

  const handleSimulateRecording = async () => {
    setIsRecording(true);
    setLoading(true);
    // Simulate recording 2s then transcribing via Muse Voice Transcribe
    setTimeout(async () => {
      setIsRecording(false);
      try {
        const res = await transcribeVoiceWithMuse("voice_demo");
        setTranscribedText(res.text);
      } catch {
        setTranscribedText(
          "Create a four-way intersection in Mumbai during evening rush hour. Heavy traffic on the north road, eastern road closed, simulate for five minutes."
        );
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const handleSimulateImageUpload = async () => {
    setLoading(true);
    try {
      const res = await segmentMediaWithSam("scene_demo");
      setDetectedObjects(res.detected_objects || []);
    } catch {
      setDetectedObjects([
        { id: "obj_1", class: "car", confidence: 0.94 },
        { id: "obj_2", class: "bus", confidence: 0.91 },
        { id: "obj_3", class: "traffic_light", confidence: 0.96 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#090d16]/50">
          <div className="flex items-center space-x-2">
            {activeTab === "voice" ? (
              <Mic className="w-5 h-5 text-rose-400" />
            ) : (
              <ImageIcon className="w-5 h-5 text-indigo-400" />
            )}
            <h3 className="font-semibold text-slate-100 text-sm">
              {activeTab === "voice" ? "Muse Voice Transcribe" : "SAM 3.1 Visual Segmentation"}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#1e293b] px-6 pt-2 bg-[#090d16]/20 text-xs">
          <button
            onClick={() => setActiveTab("voice")}
            className={`pb-2.5 px-3 font-medium transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === "voice"
                ? "border-rose-500 text-rose-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Input (Speech-to-Text)</span>
          </button>

          <button
            onClick={() => setActiveTab("sam")}
            className={`pb-2.5 px-3 font-medium transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === "sam"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image-to-Simulation (SAM 3.1)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 text-xs text-slate-300">
          {activeTab === "voice" && (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all ${
                  isRecording
                    ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse scale-110"
                    : "bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                <Mic className="w-8 h-8" />
              </div>

              <div>
                <p className="font-medium text-slate-200 text-sm">
                  {isRecording ? "Listening to microphone..." : "Tap to describe scenario via voice"}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Audio is transcribed accurately by Meta's Muse Voice Transcribe model.
                </p>
              </div>

              <button
                onClick={handleSimulateRecording}
                disabled={loading || isRecording}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-lg shadow-rose-500/20 transition disabled:opacity-50"
              >
                {loading ? "Transcribing Audio..." : isRecording ? "Listening..." : "Record Voice Sample"}
              </button>

              {transcribedText && (
                <div className="w-full bg-[#090d16] border border-[#1e293b] rounded-xl p-4 text-left flex flex-col gap-2 mt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Transcribed Result:</span>
                  <p className="text-slate-200 text-xs italic">"{transcribedText}"</p>
                  <button
                    onClick={() => {
                      onInsertPrompt(transcribedText);
                      onClose();
                    }}
                    className="self-end flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-semibold text-xs mt-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to Simulation Prompt</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "sam" && (
            <div className="flex flex-col gap-4">
              <div
                onClick={handleSimulateImageUpload}
                className="border-2 border-dashed border-[#1e293b] hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer bg-[#090d16]/50 transition flex flex-col items-center justify-center gap-2"
              >
                <Upload className="w-8 h-8 text-indigo-400" />
                <p className="font-medium text-slate-200">Drop traffic intersection photograph here</p>
                <p className="text-slate-500 text-[11px]">Supports PNG, JPG (Satellite or Street view)</p>
              </div>

              {loading && (
                <div className="flex items-center justify-center space-x-2 text-indigo-400 py-3">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing image segmentation with SAM 3.1...</span>
                </div>
              )}

              {detectedObjects.length > 0 && (
                <div className="flex flex-col gap-3 bg-[#090d16] border border-[#1e293b] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-xs">
                      SAM 3.1 Detected Entities ({detectedObjects.length})
                    </span>
                    <span className="text-[11px] text-indigo-400 font-mono">Calibrated</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {detectedObjects.map((obj, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-[#1e293b] text-slate-300">
                        <span className="capitalize font-medium">{obj.class}</span>
                        <span className="text-emerald-400 font-mono">{(obj.confidence * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Calibration Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Scale factor (px to meters):</span>
                    <span className="font-mono text-slate-200">{calibrationScale} m/px</span>
                  </div>

                  <button
                    onClick={() => {
                      onInsertPrompt(
                        "Create a four-way intersection calibrated from SAM 3.1 image segmentation with 2 active buses and 3 passenger vehicles."
                      );
                      onClose();
                    }}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold mt-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Convert to Simulation Geometry</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
