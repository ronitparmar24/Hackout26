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
  User,
  LogOut,
  Settings as SettingsIcon,
  ChevronDown,
} from "lucide-react";
import { getUserSession, clearUserSession } from "@/lib/supabase";

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
    <header className="glass-card mb-6 px-3.5 sm:px-5 py-3 border-white/10 relative z-40 w-full max-w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left: Active Dataset Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                latestRun ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-400"
              }`}
            />
            <span className="font-mono truncate max-w-[140px] sm:max-w-[240px] md:max-w-none text-white">
              {latestRun ? `Dataset: ${latestRun.filename}` : "No Dataset Active"}
            </span>
          </div>

          {latestRun && (
            <span className="hidden lg:inline-flex text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 flex-shrink-0">
              {latestRun.total_suppliers} Vendors • {(latestRun.total_emissions / 1000).toFixed(0)}t CO₂e
            </span>
          )}
        </div>

        {/* Right: Operational Shortcuts & Mobile Hamburger */}
        <div className="flex items-center gap-2 flex-shrink-0">

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

          {/* User Auth Profile Menu */}
          <UserAuthMenu />

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

function UserAuthMenu() {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    getUserSession().then((session) => setUser(session));
  }, []);

  const handleLogout = () => {
    clearUserSession();
    window.location.href = "/login";
  };

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-heading font-medium text-cyan-300 hover:text-cyan-200 border border-cyan-400/30 transition-all"
      >
        <User className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-heading text-white/90 hover:text-white transition-colors"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || "User Avatar"}
            className="w-5 h-5 rounded-full object-cover border border-white/20 shadow-sm"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-black font-bold text-[10px]">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <span className="hidden sm:inline-block max-w-[100px] truncate">
          {user.isGuest ? "Guest Demo" : user.name || user.email}
        </span>
        <ChevronDown className="w-3 h-3 text-white/40" />
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0a0f1d] border border-white/15 p-2 shadow-2xl z-50 animate-fade-in-up">
            <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center gap-2.5">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate font-heading">
                  {user.name || "Authenticated User"}
                </div>
                <div className="text-[11px] text-white/50 truncate font-mono">
                  {user.email || "guest.demo@carbonsense.io"}
                </div>
                {user.isGuest && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[9px] border border-cyan-400/20">
                    Guest Demo Mode
                  </span>
                )}
              </div>
            </div>


            <Link
              href="/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Company Settings</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
