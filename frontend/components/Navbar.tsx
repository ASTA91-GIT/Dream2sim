"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Layers,
  BarChart3,
  Settings,
  Sparkles,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { getMetaApiStatus } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [metaStatus, setMetaStatus] = useState<{ configured: boolean } | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const data = await getMetaApiStatus();
        setMetaStatus(data);
      } catch {
        setMetaStatus(null);
      }
    }
    checkStatus();
  }, []);

  const navItems = [
    { label: "Workspace", href: "/workspace", icon: Layers },
    { label: "Dashboard", href: "/dashboard", icon: Activity },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1e293b] bg-[#090d16]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>Dream2Sim</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded">
                  Meta AI
                </span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-0.5">Idea-to-Simulation Platform</span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-[#1e293b] text-sky-400 border border-slate-700/60"
                      : "text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status & Launch CTA */}
        <div className="flex items-center space-x-3">
          {/* Engine / API Status Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#0f172a] border border-[#1e293b] text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Simulation Engine:</span>
            <span className="text-emerald-400 font-mono font-medium">Ready</span>
          </div>

          <Link
            href="/workspace"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs shadow-md shadow-sky-500/20 transition"
          >
            <span>Launch Simulation</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
