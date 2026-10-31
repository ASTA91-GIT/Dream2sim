"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";

export default function SignupPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          full_name: fullName,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Registration failed. Please check inputs.");
      }

      const data = await res.json();
      localStorage.setItem("dream2sim_token", data.access_token);
      localStorage.setItem("dream2sim_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[var(--surface-container-lowest)] selection:bg-[#B13BFF] selection:text-white">
      {/* Ambient Atmospheric Glow Orbs */}
      <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full bg-[#B13BFF]/15 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-32 w-[500px] h-[500px] rounded-full bg-[#471396]/30 blur-[130px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-[#FFCC00]/5 blur-[150px] pointer-events-none"></div>

      {/* Blueprint Grid Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="signup-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#B13BFF" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#signup-grid)" />
      </svg>

      {/* Top Floating Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-container-low)]/80 backdrop-blur-md border border-[var(--outline-variant)]/20 text-xs font-telemetry text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Return to Homepage</span>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-[var(--surface-container-low)]/80 backdrop-blur-md border border-[var(--outline-variant)]/20 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
          title="Toggle Theme"
        >
          <span className="material-symbols-outlined text-lg">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
      </div>

      {/* Center Glass Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="glass-tier-2 rounded-2xl p-8 sm:p-10 shadow-2xl border border-[var(--glass-border-2)] flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#B13BFF] to-[#FFCC00] p-0.5 shadow-lg shadow-[#B13BFF]/25 flex items-center justify-center mb-1">
              <div className="w-full h-full rounded-[10px] bg-[#090040] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#E3B5FF] text-2xl">person_add</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-2xl font-bold tracking-tight text-[var(--on-surface)]">
                Create Simulation Seat
              </h1>
              <span className="font-telemetry text-[10px] font-bold bg-[#FFCC00]/20 text-[#FFCC00] px-2 py-0.5 rounded border border-[#FFCC00]/30">
                PROD
              </span>
            </div>
            <p className="font-body text-xs text-[var(--on-surface-variant)] max-w-xs">
              Initialize your engineering credentials to orchestrate autonomous multi-agent urban simulations.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-lg bg-[var(--error-container)]/30 border border-[var(--error)]/50 text-[var(--error)] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="font-telemetry text-[11px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                Full Name & Title
              </label>
              <div className="flex items-center bg-[var(--surface-container-lowest)]/80 border border-[var(--outline-variant)]/30 rounded-lg px-3 py-2.5 focus-within:border-[var(--primary)] transition-all">
                <span className="material-symbols-outlined text-[18px] text-[var(--on-surface-variant)] mr-2">
                  badge
                </span>
                <input
                  type="text"
                  required
                  placeholder="Dr. Rajesh Kulkarni"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-xs font-medium text-[var(--on-surface)] placeholder:text-[var(--outline-variant)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-telemetry text-[11px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                Lab or Institutional Email
              </label>
              <div className="flex items-center bg-[var(--surface-container-lowest)]/80 border border-[var(--outline-variant)]/30 rounded-lg px-3 py-2.5 focus-within:border-[var(--primary)] transition-all">
                <span className="material-symbols-outlined text-[18px] text-[var(--on-surface-variant)] mr-2">
                  mail
                </span>
                <input
                  type="email"
                  required
                  placeholder="rkulkarni@mumbai-urban.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-xs font-medium text-[var(--on-surface)] placeholder:text-[var(--outline-variant)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-telemetry text-[11px] uppercase tracking-wider text-[var(--on-surface-variant)]">
                Master Security Key (Password)
              </label>
              <div className="flex items-center bg-[var(--surface-container-lowest)]/80 border border-[var(--outline-variant)]/30 rounded-lg px-3 py-2.5 focus-within:border-[var(--primary)] transition-all">
                <span className="material-symbols-outlined text-[18px] text-[var(--on-surface-variant)] mr-2">
                  lock
                </span>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-xs font-medium text-[var(--on-surface)] placeholder:text-[var(--outline-variant)]"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full mt-2 py-3 px-4 rounded-lg font-headline text-sm font-bold shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">
                    check_circle
                  </span>
                  <span>Complete Registration & Launch</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--on-surface-variant)] pt-2 border-t border-[var(--outline-variant)]/15">
            <span>Already have credentials?</span>
            <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
