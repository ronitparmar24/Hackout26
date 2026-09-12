"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { listRuns, type UploadResponse } from "@/lib/api";
import {
  Sparkles,
  FileSpreadsheet,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  Upload,
  History,
  BookOpen,
  Sliders,
} from "lucide-react";

export default function TopBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");
  const [latestRun, setLatestRun] = useState<UploadResponse | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const runs = await listRuns();
        if (runs && runs.length > 0) {
          if (runId) {
            const current = runs.find((r) => r.run_id === runId);
            setLatestRun(current || runs[0]);
          } else {
            setLatestRun(runs[0]);
          }
        }
      } catch (err) {
        // backend might be starting
      }
    })();
  }, [runId]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const activeRunId = latestRun?.run_id || "demo";

  return (
    <header className="glass-card mb-6 px-4 sm:px-6 py-3 border-white/10 relative z-40">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left: Active Dataset Status */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span
              className={`w-2 h-2 rounded-full ${
                latestRun ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-400"
              }`}
            />
            <span className="font-mono truncate max-w-[160px] sm:max-w-none text-white">
              {latestRun ? `Dataset: ${latestRun.filename}` : "No Dataset Active"}
            </span>
          </div>

          {latestRun && (
            <span className="hidden sm:inline-flex text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
              {latestRun.total_suppliers} Vendors • {(latestRun.total_emissions / 1000).toFixed(0)}t CO₂e
            </span>
          )}
        </div>

        {/* Right: Operational Shortcuts & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <Link
            href={`/simulator?run_id=${activeRunId}`}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-heading font-medium text-white/80 hover:text-white border border-white/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>What-If Simulator</span>
          </Link>

          <Link
            href={`/compliance?run_id=${activeRunId}`}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-heading font-medium text-white/80 hover:text-white border border-white/10 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSRD Audit</span>
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 border border-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Glass Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-1.5 animate-fade-in-up">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span>Home Overview</span>
          </Link>

          <Link
            href="/upload"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Upload & Live Demo</span>
          </Link>

          <Link
            href={latestRun ? `/dashboard/${latestRun.run_id}` : "/upload"}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>Active Dashboard</span>
          </Link>

          <Link
            href="/history"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Run History</span>
          </Link>

          <Link
            href="/methodology"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Methodology & Audit</span>
          </Link>

          <Link
            href={`/simulator?run_id=${activeRunId}`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>What-If Simulator</span>
          </Link>

          <Link
            href={`/compliance?run_id=${activeRunId}`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CSRD Compliance</span>
          </Link>
        </div>
      )}
    </header>
  );
}
