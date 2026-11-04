"use client";

import React, { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isError?: boolean;
}

function parseInlineFormatting(str: string): React.ReactNode[] {
  // Tokenize by markers: **bold**, *italic*, $math$, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\$[^$]+\$|`[^`]+`)/g;
  const parts = str.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-[var(--on-surface)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={idx} className="italic text-[var(--tertiary)] font-normal">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      return (
        <span
          key={idx}
          className="font-mono text-[10.5px] px-1 py-0.5 rounded bg-[var(--surface-container-high)] text-[#f1c100] border border-[var(--outline-variant)]/20 mx-0.5"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="font-mono text-[10.5px] px-1 py-0.5 rounded bg-[var(--surface-container-high)] text-[#B13BFF] border border-[var(--outline-variant)]/20 mx-0.5"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderFormattedMessage(text: string) {
  // Split into paragraphs by double newlines
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();

        // 1. Math equation block: $$...$$
        if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
          const formula = trimmed.slice(2, -2).trim();
          return (
            <div
              key={pIdx}
              className="my-1.5 p-2 rounded-lg bg-[var(--surface-container-high)]/90 border border-[#B13BFF]/30 font-mono text-[11px] text-[#f1c100] text-center overflow-x-auto select-all shadow-inner"
            >
              {formula}
            </div>
          );
        }

        // Code block check: ```...```
        if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
          const codeLines = trimmed.split("\n");
          const lang = codeLines[0].replace("```", "").trim();
          const codeBody = codeLines.slice(1, -1).join("\n");
          return (
            <div key={pIdx} className="my-1.5 rounded-lg overflow-hidden border border-[var(--outline-variant)]/30 bg-[var(--surface-container-highest)] font-mono text-[11px]">
              {lang && (
                <div className="px-2.5 py-1 text-[9px] uppercase tracking-wider text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)]/20 bg-[var(--surface-container-high)] font-semibold">
                  {lang}
                </div>
              )}
              <pre className="p-2.5 overflow-x-auto text-[var(--on-surface)] whitespace-pre">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        const lines = trimmed.split("\n");
        // 2. Bullet list
        const isList = lines.every((line) => {
          const t = line.trim();
          return t.startsWith("•") || t.startsWith("- ") || t.startsWith("* ");
        });

        if (isList) {
          return (
            <ul key={pIdx} className="space-y-1.5 pl-0.5 my-1">
              {lines.map((line, lIdx) => {
                const cleanLine = line.trim().replace(/^[•\-\*]\s*/, "");
                return (
                  <li key={lIdx} className="flex items-start gap-1.5">
                    <span className="text-[#f1c100] font-bold text-xs shrink-0 select-none">•</span>
                    <span className="flex-1">{parseInlineFormatting(cleanLine)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 3. Normal paragraph
        return (
          <p key={pIdx}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {parseInlineFormatting(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
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

    const historyPayload = messages
      .filter((m) => m.id !== "welcome" && !m.isError)
      .slice(-12)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }))
      .concat([{ role: "user", content: text }]);

    const aiMsgId = String(Date.now() + 1);
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      sender: "ai",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, aiPlaceholder]);
    setInputMessage("");
    setIsLoading(true);

    let accumulatedText = "";

    try {
      // 1. Primary real-time Server-Sent Events (SSE) streaming
      let res = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyPayload }),
      }).catch(async () => {
        return await fetch("http://localhost:8000/api/ai/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyPayload }),
        });
      });

      if (res && res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const ev of events) {
            const trimmed = ev.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                accumulatedText += parsed.token;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, text: accumulatedText } : m
                  )
                );
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (err: any) {
              if (dataStr !== "[DONE]") throw err;
            }
          }
        }
      }

      // 2. Fallback to standard chat endpoint if streaming returned empty
      if (!accumulatedText.trim()) {
        const fallbackRes = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyPayload }),
        }).catch(async () => {
          return await fetch("http://localhost:8000/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: historyPayload }),
          });
        });

        if (fallbackRes && fallbackRes.ok) {
          const data = await fallbackRes.json();
          accumulatedText = data.reply || "";
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, text: accumulatedText } : m
            )
          );
        } else {
          const errData = await fallbackRes?.json().catch(() => ({}));
          throw new Error(errData?.detail || `AI Provider error (HTTP ${fallbackRes?.status || "offline"})`);
        }
      }
    } catch (err: any) {
      // Honest, transparent error handling - NEVER fake responses
      const errorMsg =
        err?.message ||
        "Unable to connect to the AI model. Please verify that the backend server is running and your Meta Model API credentials are valid.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: `⚠️ **AI Service Error**: ${errorMsg}`,
                isError: true,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Explain the IDM equation",
    "How does Webster signal timing work?",
    "Write a Python script for traffic data",
    "Help me design a multi-agent scenario",
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
                      : m.isError
                      ? "bg-red-500/10 text-red-300 border border-red-500/30 rounded-tl-none font-sans"
                      : "bg-[var(--surface-container)] text-[var(--on-surface)] border border-[var(--outline-variant)]/20 rounded-tl-none"
                  }`}
                >
                  {m.sender === "user" ? (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  ) : m.text ? (
                    <div>
                      {renderFormattedMessage(m.text)}
                      {isLoading && m === messages[messages.length - 1] && (
                        <span className="inline-block w-1.5 h-3.5 bg-[#B13BFF] ml-1 animate-pulse align-middle" />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-1 text-[var(--on-surface-variant)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B13BFF] animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f1c100] animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-bounce [animation-delay:0.4s]"></span>
                      <span className="font-telemetry text-[11px] italic ml-1">Thinking...</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[var(--on-surface-variant)]/70 px-1 mt-1 font-telemetry">
                  {m.timestamp}
                </span>
              </div>
            ))}

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

