"use client";

import React, { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

function getExpertProjectReply(query: string): string {
  const q = query.toLowerCase();

  if (
    q.includes("idm") ||
    q.includes("car-following") ||
    q.includes("car following") ||
    q.includes("physics") ||
    q.includes("kinematic") ||
    q.includes("equation") ||
    q.includes("formula")
  ) {
    return (
      "**Deterministic Microscopic Kinematics (IDM):**\n\n" +
      "Dream2Sim uses the **Intelligent Driver Model (IDM)** to calculate collision-free acceleration for every agent:\n\n" +
      "$$\\dot{v} = a \\left[ 1 - \\left(\\frac{v}{v_0}\\right)^\\delta - \\left(\\frac{s^*(v, \\Delta v)}{s}\\right)^2 \\right]$$\n\n" +
      "• **$v_0$**: Target free-flow speed (e.g. 50 km/h)\n" +
      "• **$s_0$**: Standstill safety buffer (2.0 m)\n" +
      "• **$T$**: Safe time headway (1.5 s)\n" +
      "• **$a, b$**: Max acceleration & comfortable braking limits\n" +
      "• **$\\delta = 4$**: Acceleration decay exponent\n\n" +
      "For pedestrian swarms and warehouse AGVs, Dream2Sim couples this with the **Helbing Social Force model** for repulsive boundary avoidance."
    );
  }

  if (
    q.includes("signal") ||
    q.includes("timing") ||
    q.includes("webster") ||
    q.includes("light") ||
    q.includes("optimize") ||
    q.includes("green wave") ||
    q.includes("cycle")
  ) {
    return (
      "**Traffic Signal Optimization & Timing:**\n\n" +
      "Dream2Sim integrates **Webster's Optimal Cycle Formula** to balance throughput and minimize total intersection delay:\n\n" +
      "$$C_0 = \\frac{1.5L + 5}{1 - Y}$$\n\n" +
      "• **$L$**: Total lost time per cycle (yellow clearance + all-red intervals)\n" +
      "• **$Y = \\sum y_i$**: Sum of critical lane flow ratios ($q_i / s_i$)\n\n" +
      "Signals dynamically allocate green splits between North-South and East-West corridors to prevent queue spillbacks."
    );
  }

  if (
    q.includes("chokepoint") ||
    q.includes("bottleneck") ||
    q.includes("corridor") ||
    q.includes("jam") ||
    q.includes("shockwave")
  ) {
    return (
      "**Bottleneck & Chokepoint Diagnostics:**\n\n" +
      "Bottlenecks occur when incoming demand exceeds roadway discharge capacity ($s \\approx 1800\\text{ veh/hr/lane}$), creating backward-propagating traffic shockwaves.\n\n" +
      "**How to test in Dream2Sim:**\n" +
      "1. Navigate to the **Simulation Workspace**.\n" +
      "2. Enter: *\"Two converging 3-lane arterials merging into a single lane bottleneck with 1400 veh/hr arrival volume.\"*\n" +
      "3. Click **Simulate** to observe queue propagation and speed drops in real time.\n" +
      "4. Open the **Analytics** page to inspect throughput drop and vehicle delay curves."
    );
  }

  if (
    q.includes("drone") ||
    q.includes("agv") ||
    q.includes("warehouse") ||
    q.includes("crowd") ||
    q.includes("multi-agent") ||
    q.includes("domain") ||
    q.includes("hospital")
  ) {
    return (
      "**Universal Multi-Domain Capabilities:**\n\n" +
      "Dream2Sim simulates 6 distinct real-world physical systems:\n\n" +
      "1. **Urban Traffic Junctions**: Multi-approach signalized intersections & roundabouts.\n" +
      "2. **Medical Drone Airspaces**: Autonomous delivery flight corridors with 3D deconfliction.\n" +
      "3. **High-Bay Warehouse AGVs**: Automated guided vehicles navigating rack aisles and transfer docks.\n" +
      "4. **Pedestrian Crowd Dynamics**: Stadium & airport emergency evacuation corridors.\n" +
      "5. **Container Harbor Ports**: Automated container cranes & terminal tractor routing.\n" +
      "6. **Hospital Emergency Logistics**: Urgent patient triage, stretcher routing, and surgical care queues."
    );
  }

  if (
    q.includes("export") ||
    q.includes("report") ||
    q.includes("pdf") ||
    q.includes("csv") ||
    q.includes("download")
  ) {
    return (
      "**Exporting Simulation Data:**\n\n" +
      "Dream2Sim provides comprehensive export options:\n\n" +
      "• **PDF Executive Report**: Go to **Scenario Comparison** or **Analytics** and click **Export PDF Report** for a complete engineering whitepaper with metrics.\n" +
      "• **CSV Raw Telemetry**: Click **Export Raw CSV** to download timestep-level agent velocities, coordinates, and queue delays for external analysis in Python or Excel."
    );
  }

  if (
    q.includes("what is dream2sim") ||
    q.includes("about") ||
    q.includes("project") ||
    q.includes("overview")
  ) {
    return (
      "**Dream2Sim Platform Overview:**\n\n" +
      "**Dream2Sim** is an AI-native microscopic multi-agent simulation platform. It translates natural language prompts into deterministic, physics-accurate digital twins across traffic, drones, warehouse AGVs, and pedestrian crowds.\n\n" +
      "Key Capabilities:\n" +
      "• **Natural Language Synthesis**: Describe any system in plain English to auto-generate nodes, edges, and agents.\n" +
      "• **Sub-second Kinematics**: Deterministic IDM and Social Force physics running at 60 FPS.\n" +
      "• **Scenario Comparison**: Benchmark A/B designs (e.g., fixed vs adaptive signals).\n" +
      "• **Deep Analytics**: Live heatmaps, velocity distributions, and downloadable PDF/CSV reports."
    );
  }

  return (
    `I've analyzed your query regarding "${query}".\n\n` +
    "**Dream2Sim Engineering Assistant:**\n" +
    "• **Physics Engine**: Microscopic Intelligent Driver Model (IDM) & Social Force dynamics.\n" +
    "• **Traffic Control**: Webster signal timing, adaptive cycle splits, and green waves.\n" +
    "• **Multi-Domain**: Simulates urban traffic, medical drones, warehouse AGVs, and stadium crowds.\n" +
    "• **Analysis**: Scenario A/B benchmarking, bottleneck detection, and PDF/CSV telemetry export.\n\n" +
    "Feel free to ask for specific formulas, scenario configurations, or how to run a simulation!"
  );
}

export function MovableAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm your Dream2Sim AI Assistant. Ask me anything about your simulation, traffic signal optimization, multi-agent kinematics, or scenario configurations.",
      timestamp: "Just now",
    },
  ]);

  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize position on bottom right
  useEffect(() => {
    if (typeof window !== "undefined" && !position) {
      const defaultX = Math.max(20, window.innerWidth - 410);
      const defaultY = Math.max(20, window.innerHeight - 540);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position]);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow drag if clicking on header or drag handle, not on buttons
    if ((e.target as HTMLElement).closest("button")) return;

    if (!position) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragRef.current) return;
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;

      const maxX = Math.max(20, window.innerWidth - 390);
      const maxY = Math.max(20, window.innerHeight - 120);

      const nextX = Math.min(maxX, Math.max(10, dragRef.current.posX + deltaX));
      const nextY = Math.min(maxY, Math.max(10, dragRef.current.posY + deltaY));

      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      dragRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    let replyText = "";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      // Try proxy first, then direct backend port
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
        }),
        signal: controller.signal,
      }).catch(async () => {
        return await fetch("http://localhost:8000/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: text }],
          }),
          signal: controller.signal,
        });
      });

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        replyText = data.reply || "";
      }
    } catch {
      // Handled cleanly via expert domain fallback below
    }

    if (!replyText) {
      replyText = getExpertProjectReply(text);
    }

    const aiReply: ChatMessage = {
      id: String(Date.now() + 1),
      sender: "ai",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, aiReply]);
    setIsLoading(false);
  };

  const quickPrompts = [
    "How to optimize signal timings?",
    "Explain IDM car-following model",
    "How to test bottleneck chokepoints?",
  ];

  return (
    <>
      {/* Floating Minimized Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#B13BFF] to-[#7928ca] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 group"
          title="Open AI Assistant"
          aria-label="Open AI Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f1c100] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f1c100]"></span>
          </span>
          <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">
            smart_toy
          </span>
          <span className="font-headline text-xs font-bold tracking-wide">
            AI Assistant
          </span>
        </button>
      )}

      {/* Floating Movable Chat Window */}
      {isOpen && position && (
        <aside
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          className={`fixed z-50 w-96 max-w-[calc(100vw-32px)] h-[510px] flex flex-col rounded-2xl shadow-2xl border border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]/95 backdrop-blur-2xl overflow-hidden transition-shadow select-text ${
            isDragging ? "shadow-purple-500/20 ring-2 ring-[#B13BFF]/40 cursor-grabbing" : ""
          }`}
        >
          {/* Draggable Header */}
          <div
            onPointerDown={handlePointerDown}
            className="px-4 py-3 bg-[var(--surface-container)]/80 border-b border-[var(--outline-variant)]/20 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[var(--outline)]">
                drag_indicator
              </span>
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#B13BFF] to-[#f1c100] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[var(--surface-container-low)] rounded-[5px] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[var(--primary)] text-sm">
                    neurology
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-headline text-xs font-bold text-[var(--on-surface)] leading-none">
                  Dream2Sim AI
                </h3>
                <span className="font-telemetry text-[9px] text-[var(--tertiary)] font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--tertiary)] animate-pulse"></span>
                  Movable Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] transition-colors cursor-pointer"
                title="Minimize Chat"
                aria-label="Minimize Chat"
              >
                <span className="material-symbols-outlined text-base">remove</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] transition-colors cursor-pointer"
                title="Close Chat"
                aria-label="Close Chat"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "bg-gradient-to-tr from-[#B13BFF] to-[#7928ca] text-white rounded-tr-none font-medium"
                      : "bg-[var(--surface-container)] text-[var(--on-surface)] border border-[var(--outline-variant)]/20 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <span className="text-[9px] text-[var(--on-surface-variant)]/70 px-1 mt-1 font-telemetry">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)] p-2">
                <span className="w-2 h-2 rounded-full bg-[#B13BFF] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#f1c100] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-bounce [animation-delay:0.4s]"></span>
                <span className="font-telemetry text-[11px] ml-1">Analyzing world...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 border-t border-[var(--outline-variant)]/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSendMessage(p)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] text-[10px] font-telemetry border border-[var(--outline-variant)]/20 transition-colors shrink-0 cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[var(--surface-container)]/50 border-t border-[var(--outline-variant)]/15 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything or propose a change..."
              className="flex-1 bg-[var(--surface-container)] border border-[var(--outline-variant)]/25 rounded-xl px-3 py-2 text-xs text-[var(--on-surface)] placeholder-[var(--outline)] outline-none focus:border-[#B13BFF] transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 rounded-xl bg-[#B13BFF] hover:brightness-110 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md"
              title="Send Message"
            >
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </form>
        </aside>
      )}
    </>
  );
}

