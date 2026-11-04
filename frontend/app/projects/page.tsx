"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StitchSidebar } from "@/components/StitchSidebar";
import { StitchHeader } from "@/components/StitchHeader";

interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
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
      console.warn("Could not fetch projects:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setCreateError("Please enter a project title.");
      return;
    }
    setSubmitting(true);
    setCreateError(null);
    try {
      const res = await fetch("http://localhost:8000/api/projects", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned HTTP ${res.status}`);
      }
      const newProj = await res.json();
      setProjects((prev) => [newProj, ...prev]);
      setTitle("");
      setDescription("");
      setSuccessMessage(`Initialized "${newProj.title}" successfully!`);
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMessage(null);
      }, 700);
    } catch (err: any) {
      console.error("Initialize project error:", err);
      setCreateError(err.message || "Failed to initialize project. Please verify backend status.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(`http://localhost:8000/api/projects/${id}`, { method: "DELETE" });
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[var(--surface-container-lowest)] text-[var(--on-surface)] selection:bg-[#B13BFF] selection:text-white">
      <StitchSidebar />
      <div className="pl-72">
        <StitchHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Projects" },
          ]}
        />

        <main className="w-full pt-16 min-h-screen px-6 py-6 flex flex-col gap-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-tier-1 p-6 rounded-2xl border border-[var(--outline-variant)]/20 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-telemetry text-xs uppercase tracking-wider text-[var(--secondary)] font-semibold">
                  REPOSITORY NODES
                </span>
                <span className="text-[var(--outline)] font-telemetry">/</span>
                <span className="font-telemetry text-xs text-[var(--on-surface-variant)]">
                  {projects.length} Total Projects
                </span>
              </div>
              <h1 className="font-headline text-2xl font-bold text-[var(--on-surface)] mt-1">
                Urban Simulation Projects
              </h1>
              <p className="font-body text-xs text-[var(--on-surface-variant)] mt-1">
                Manage your urban grid repositories, geometric models, and multi-agent experiments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[var(--surface-container)]/70 border border-[var(--outline-variant)]/20 rounded-lg px-3 py-2 text-xs">
                <span className="material-symbols-outlined text-base mr-2 text-[var(--on-surface-variant)]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter projects..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)]"
                />
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow-lg shrink-0"
              >
                <span className="material-symbols-outlined text-base">create_new_folder</span>
                <span>+ Create Project</span>
              </button>
            </div>
          </div>

          {/* Projects Grid or Zero State */}
          {loading ? (
            <div className="py-20 text-center text-xs text-[var(--on-surface-variant)] flex flex-col items-center gap-2">
              <span className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></span>
              <span>Loading project repository...</span>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((proj) => (
                <div
                  key={proj.id}
                  className="glass-tier-2 p-6 rounded-xl border border-[var(--glass-border-2)] shadow-md flex flex-col justify-between gap-4 hover:border-[var(--primary)] transition-all group"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-telemetry text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--primary-container)]/20 text-[var(--primary)] border border-[var(--primary)]/30">
                        ACTIVE NODE
                      </span>
                      <button
                        onClick={() => handleDelete(proj.id)}
                        className="p-1 rounded text-[var(--outline)] hover:text-[var(--error)] transition-colors"
                        title="Delete project"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>

                    <h3 className="font-headline text-base font-bold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">
                      {proj.title}
                    </h3>
                    <p className="font-body text-xs text-[var(--on-surface-variant)] leading-relaxed line-clamp-3">
                      {proj.description || "Comprehensive multi-agent simulation model."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--outline-variant)]/15 flex items-center justify-between">
                    <span className="font-telemetry text-[11px] text-[var(--on-surface-variant)]">
                      {proj.created_at ? new Date(proj.created_at).toLocaleDateString() : "Just now"}
                    </span>

                    <Link
                      href={`/workspace?project_id=${proj.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-container-high)] hover:bg-[var(--primary-container)] text-[var(--on-surface)] hover:text-white font-telemetry text-xs font-semibold transition-all"
                    >
                      <span>Open Workspace</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Clean Zero-Data Blueprint State matching Stitch */
            <div className="glass-tier-1 p-12 rounded-2xl border border-dashed border-[var(--outline-variant)]/40 flex flex-col items-center justify-center text-center gap-4 py-16">
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30 flex items-center justify-center text-[var(--primary)]">
                <span className="material-symbols-outlined text-3xl">folder_open</span>
              </div>
              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="font-headline text-lg font-bold text-[var(--on-surface)]">
                  {filterQuery ? "No matching projects" : "Zero Projects Registered"}
                </h3>
                <p className="font-body text-xs text-[var(--on-surface-variant)] leading-relaxed">
                  {filterQuery
                    ? "Try adjusting your search criteria."
                    : "No project workspaces exist yet. Create your first multi-domain simulation project to organize simulation runs, scenarios, and spatial graphs."}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="btn-gold px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-base">add_box</span>
                <span>+ Create First Project</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-tier-3 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 border border-[var(--glass-border-2)]">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-[var(--on-surface)]">
                New Urban Simulation Project
              </h3>
              <button
                onClick={() => setModalOpen(false)}
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

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-telemetry text-[11px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bandra-Worli Sea Link Interchange"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (createError) setCreateError(null);
                  }}
                  className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/30 rounded-lg px-3 py-2 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-telemetry text-[11px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Description / Research Objectives
                </label>
                <textarea
                  rows={3}
                  placeholder="Simulate multi-modal congestion relief under varied toll booth configurations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]/30 rounded-lg px-3 py-2 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setModalOpen(false);
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
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                      <span>Initialize Project</span>
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
