"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { StitchSidebar } from "@/components/StitchSidebar";
import { StitchHeader } from "@/components/StitchHeader";

interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("dream2sim_token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/projects", {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.warn("Backend not reached for projects, using zero state");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError("Please enter a project title.");
      return;
    }
    setSubmitting(true);
    setCreateError(null);
    try {
      const res = await fetch("http://localhost:8000/api/projects", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned HTTP ${res.status}`);
      }
      const newProj = await res.json();
      setProjects((prev) => [newProj, ...prev]);
      setNewTitle("");
      setNewDesc("");
      setSuccessMessage(`Created "${newProj.title}" successfully!`);
      setTimeout(() => {
        setCreateModalOpen(false);
        setSuccessMessage(null);
      }, 700);
    } catch (err: any) {
      console.error("Create project error:", err);
      setCreateError(err.message || "Failed to create project. Please verify backend status.");
    } finally {
      setSubmitting(false);
    }
  };

  const projectCount = projects.length;
  const hasZeroData = projectCount === 0;

  return (
    <div className="min-h-screen bg-[var(--surface-container-lowest)] text-[var(--on-surface)] selection:bg-[#B13BFF] selection:text-white">
      <StitchSidebar />
      <div className="pl-72">
        <StitchHeader
          breadcrumbs={[
            { label: "Dream2Sim Engine", href: "/dashboard" },
            { label: "Operations & Overview" },
          ]}
        />

        <main className="w-full pt-16 min-h-screen pb-16">
          <div className="relative w-full px-6 py-6 flex flex-col gap-6 overflow-hidden">
            {/* Ambient Background Glows matching Stitch */}
            <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-[#B13BFF]/10 blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-[#471396]/20 blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full bg-[#B13BFF]/10 blur-3xl pointer-events-none -z-10"></div>

            {/* TOP WELCOME / ORCHESTRATION BANNER */}
            <section className="relative glass-tier-2 p-6 sm:p-8 rounded-2xl shadow-xl border border-[var(--glass-border-2)]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col gap-2 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-pulse shadow-[0_0_8px_var(--gold-glow)]"></span>
                    <span className="font-telemetry text-[11px] font-bold text-[var(--tertiary)] tracking-wider">
                      SYS·ID: ORCHESTRATOR-CLUSTER-ALPHA
                    </span>
                    <span className="font-telemetry text-xs text-[var(--outline)]">|</span>
                    <span className="font-telemetry text-xs text-[var(--on-surface-variant)]">
                      Active Model: Muse Spark 3.1 Neural SIM
                    </span>
                  </div>
                  <h1 className="font-headline text-2xl sm:text-3xl text-[var(--on-surface)] font-bold tracking-tight">
                    Simulation Operations & Overview
                  </h1>
                  <p className="font-body text-sm text-[var(--on-surface-variant)] leading-relaxed">
                    Here is the real-time operational overview of your active simulations, network topologies, and multi-agent systems.
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link
                    href="/workspace"
                    className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold shadow-lg"
                  >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    <span>+ Launch Workspace</span>
                  </Link>

                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-[var(--surface-container-high)]/80 hover:bg-[var(--surface-container-highest)] text-[var(--primary)] font-telemetry text-xs font-semibold px-4 py-2.5 rounded-lg border border-[var(--outline-variant)]/20 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">create_new_folder</span>
                    <span>+ New Project</span>
                  </button>
                </div>
              </div>
            </section>

            {/* REAL OPERATIONAL STATUS CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Metric 01: Total Saved Projects */}
              <div className="glass-tier-1 p-5 rounded-xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col justify-between hover:border-[var(--primary)]/40 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-telemetry text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold">
                      METRIC 01 / REPOSITORY
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-lg">folder_special</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="font-headline text-3xl font-bold text-[var(--on-surface)]">
                      {projectCount}
                    </div>
                    <span className="font-telemetry text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--tertiary)]/20 text-[var(--tertiary)]">
                      ACTIVE
                    </span>
                  </div>
                  <div className="mt-1.5 font-body text-xs text-[var(--on-surface-variant)] flex items-center gap-1.5">
                    <span className="text-[var(--primary)] font-telemetry text-[11px]">
                      {hasZeroData ? "Zero saved projects" : `${projectCount} active projects`}
                    </span>
                    <span>•</span>
                    <span>SQLite persistence</span>
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-[var(--surface-container-highest)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                    style={{ width: hasZeroData ? "5%" : "85%" }}
                  ></div>
                </div>
              </div>

              {/* Metric 02: Physics Kinematics Core */}
              <div className="glass-tier-1 p-5 rounded-xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col justify-between hover:border-[var(--tertiary)]/40 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-telemetry text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold">
                      METRIC 02 / PHYSICS ENGINE
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--tertiary)] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-lg">precision_manufacturing</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="font-headline text-2xl font-bold text-[var(--on-surface)]">
                      0.05s
                    </div>
                    <span className="font-telemetry text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--tertiary)]/20 text-[var(--tertiary)]">
                      DETERMINISTIC
                    </span>
                  </div>
                  <div className="mt-1.5 font-body text-xs text-[var(--on-surface-variant)] flex items-center gap-1.5">
                    <span className="text-[var(--tertiary)] font-telemetry text-[11px]">
                      IDM & Social Force
                    </span>
                    <span>•</span>
                    <span>Zero collisions</span>
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-[var(--surface-container-highest)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--tertiary)] rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              {/* Metric 03: Multi-Domain Coverage */}
              <div className="glass-tier-1 p-5 rounded-xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col justify-between hover:border-[var(--secondary)]/40 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-telemetry text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold">
                      METRIC 03 / DOMAINS
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--secondary)] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-lg">view_in_ar</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="font-headline text-3xl font-bold text-[var(--on-surface)]">
                      6
                    </div>
                    <span className="font-telemetry text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--secondary)]/20 text-[var(--secondary)]">
                      3D READY
                    </span>
                  </div>
                  <div className="mt-1.5 font-body text-xs text-[var(--on-surface-variant)] flex items-center gap-1.5">
                    <span className="text-[var(--on-surface)] font-telemetry text-[11px]">
                      Drones, AGVs, Crowds
                    </span>
                    <span>•</span>
                    <span>Multi-agent</span>
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-[var(--surface-container-highest)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--secondary)] rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              {/* Metric 04: AI Synthesis Core */}
              <div className="glass-tier-1 p-5 rounded-xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col justify-between hover:border-[var(--primary-container)]/40 transition-all group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-telemetry text-[10px] uppercase tracking-wider text-[var(--on-surface-variant)] font-semibold">
                      METRIC 04 / AI SYNTHESIZER
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--primary-container)] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-lg">neurology</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="font-headline text-2xl font-bold text-[var(--on-surface)]">
                      Active
                    </div>
                    <span className="font-telemetry text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--primary-container)]/30 text-[var(--primary)]">
                      MUSE SPARK
                    </span>
                  </div>
                  <div className="mt-1.5 font-body text-xs text-[var(--on-surface-variant)] flex items-center gap-1.5">
                    <span className="text-[var(--on-surface)] font-telemetry text-[11px]">
                      NLP → Graph Schema
                    </span>
                    <span>•</span>
                    <span>Auto-fallback</span>
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-[var(--surface-container-highest)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--primary-container)] rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
            </section>

            {/* CLEAN EMPTY STATE BLUEPRINT (when 0 projects exist, matching dashboard_light_mode_clean_empty_states) */}
            {hasZeroData && (
              <section className="glass-tier-1 p-8 rounded-2xl border border-dashed border-[var(--outline-variant)]/40 flex flex-col items-center justify-center text-center gap-4 py-12">
                <div className="w-16 h-16 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30 flex items-center justify-center text-[var(--primary)]">
                  <span className="material-symbols-outlined text-3xl">folder_off</span>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                  <h3 className="font-headline text-lg font-bold text-[var(--on-surface)]">
                    No active projects found in repository
                  </h3>
                  <p className="font-body text-xs text-[var(--on-surface-variant)] leading-relaxed">
                    You have 0 projects registered. Initialize your first transit research workspace or load one of the calibrated Quick-Start presets below.
                  </p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="btn-gold px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <span className="material-symbols-outlined text-base">add_box</span>
                  <span>+ Create First Project</span>
                </button>
              </section>
            )}

            {/* QUICK-START SIMULATION TEMPLATES */}
            <section id="templates" className="flex flex-col gap-4 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-xl font-bold text-[var(--on-surface)]">
                    Quick-Start Simulation Templates
                  </h2>
                  <p className="font-body text-xs text-[var(--on-surface-variant)]">
                    Pre-validated spatial graph baselines for rapid network instantiation
                  </p>
                </div>
                <span className="font-telemetry text-xs text-[var(--tertiary)] bg-[var(--tertiary)]/10 px-2.5 py-1 rounded-full border border-[var(--tertiary)]/30 font-semibold">
                  3 Presets Loaded
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Template 1: 4-Way Urban Intersection */}
                <div className="glass-tier-1 p-6 rounded-xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col justify-between hover:border-[var(--primary)] transition-all group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--primary)] border border-[var(--primary)]/20">
                        4 Approaches
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface-container)] flex items-center justify-center text-[var(--on-surface-variant)]">
                        <span className="material-symbols-outlined text-lg">alt_route</span>
                      </div>
                    </div>
                    <h3 className="font-headline text-base font-bold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">
                      Four-Way Urban Intersection
                    </h3>
                    <p className="font-body text-xs text-[var(--on-surface-variant)] leading-relaxed">
                      Standard signalized junction template with crosswalk telemetry, protected turns, and fixed baseline phases.
                    </p>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-container)]/70 flex items-center gap-2 border border-[var(--outline-variant)]/10">
                      <span className="material-symbols-outlined text-sm text-[var(--secondary)]">memory</span>
                      <span className="font-telemetry text-[11px] text-[var(--on-surface-variant)]">
                        Meta AI Node Profile: V1-Symmetric
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/workspace?template=four_way"
                    className="mt-5 w-full py-2.5 px-4 rounded-lg bg-[var(--surface-container-high)] hover:bg-[var(--primary-container)] text-[var(--on-surface)] hover:text-white font-telemetry text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Use Template</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>

                {/* Template 2: Corridor Chokepoint */}
                <div className="glass-tier-1 p-6 rounded-xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col justify-between hover:border-[var(--tertiary)] transition-all group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--tertiary)] border border-[var(--tertiary)]/20">
                        Arterial Flow
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface-container)] flex items-center justify-center text-[var(--on-surface-variant)]">
                        <span className="material-symbols-outlined text-lg">merge</span>
                      </div>
                    </div>
                    <h3 className="font-headline text-base font-bold text-[var(--on-surface)] group-hover:text-[var(--tertiary)] transition-colors">
                      Corridor Chokepoint Dynamics
                    </h3>
                    <p className="font-body text-xs text-[var(--on-surface-variant)] leading-relaxed">
                      Two converging 3-lane arterials with lane-drop bottlenecks and high spillback propagation risk.
                    </p>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-container)]/70 flex items-center gap-2 border border-[var(--outline-variant)]/10">
                      <span className="material-symbols-outlined text-sm text-[var(--tertiary)]">warning</span>
                      <span className="font-telemetry text-[11px] text-[var(--on-surface-variant)]">
                        Stress Profile: High Spillback
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/workspace?template=chokepoint"
                    className="mt-5 w-full py-2.5 px-4 rounded-lg bg-[var(--surface-container-high)] hover:bg-[var(--tertiary)] text-[var(--on-surface)] hover:text-black font-telemetry text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Use Template</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>

                {/* Template 3: Adaptive RL Swarm */}
                <div className="glass-tier-1 p-6 rounded-xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col justify-between hover:border-[var(--secondary)] transition-all group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--secondary)] border border-[var(--secondary)]/20">
                        Multi-Agent
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface-container)] flex items-center justify-center text-[var(--on-surface-variant)]">
                        <span className="material-symbols-outlined text-lg">neurology</span>
                      </div>
                    </div>
                    <h3 className="font-headline text-base font-bold text-[var(--on-surface)] group-hover:text-[var(--secondary)] transition-colors">
                      Adaptive Reinforcement Learning
                    </h3>
                    <p className="font-body text-xs text-[var(--on-surface-variant)] leading-relaxed">
                      Autonomous signal controller optimizing cycle splits in real time based on incoming vehicle densities.
                    </p>
                    <div className="p-2.5 rounded-lg bg-[var(--surface-container)]/70 flex items-center gap-2 border border-[var(--outline-variant)]/10">
                      <span className="material-symbols-outlined text-sm text-[var(--secondary)]">auto_awesome</span>
                      <span className="font-telemetry text-[11px] text-[var(--on-surface-variant)]">
                        Controller: Deep Q-Learning
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/workspace?template=adaptive_rl"
                    className="mt-5 w-full py-2.5 px-4 rounded-lg bg-[var(--surface-container-high)] hover:bg-[var(--secondary-container)] text-[var(--on-surface)] hover:text-white font-telemetry text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Use Template</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </section>

            {/* RECENT SIMULATION PROJECTS SECTION */}
            <section className="mt-2">
              <div className="glass-tier-1 p-6 rounded-xl border border-[var(--outline-variant)]/20 shadow-md flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--primary)]">folder_special</span>
                    <h3 className="font-headline text-base font-bold text-[var(--on-surface)]">
                      Recent Simulation Projects
                    </h3>
                  </div>
                  <Link href="/projects" className="font-telemetry text-xs text-[var(--primary)] hover:underline">
                    View All ({projectCount})
                  </Link>
                </div>

                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {projects.map((p) => (
                      <Link
                        key={p.id}
                        href={`/workspace?project_id=${p.id}`}
                        className="p-4 rounded-xl bg-[var(--surface-container)]/60 hover:bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/20 flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[var(--primary)] group-hover:scale-110 transition-transform">
                            folder
                          </span>
                          <div>
                            <div className="font-headline text-sm font-semibold text-[var(--on-surface)]">
                              {p.title}
                            </div>
                            <div className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                              {p.description || "Active simulation repository"}
                            </div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[var(--outline)] group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-[var(--on-surface-variant)] flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-[var(--outline)]">inbox</span>
                    <span>No saved projects yet. Click "+ New Project" above to create one.</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* New Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-tier-3 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 border border-[var(--glass-border-2)]">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-[var(--on-surface)]">
                Create Simulation Project
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg flex items-center gap-2 text-xs text-[var(--error)]">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{createError}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-400">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-telemetry text-[11px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Mumbai Arterial Redesign"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (createError) setCreateError(null);
                  }}
                  className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/30 rounded-lg px-3 py-2 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-telemetry text-[11px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Description / Abstract
                </label>
                <textarea
                  rows={3}
                  placeholder="Goals, corridor nodes, and expected throughput improvements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/30 rounded-lg px-3 py-2 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setCreateModalOpen(false);
                    setCreateError(null);
                  }}
                  className="px-4 py-2 text-xs text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                      <span>Create Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
