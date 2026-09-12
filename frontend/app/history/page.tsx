"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileSpreadsheet,
  Calendar,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Scale,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  History as HistoryIcon,
  RefreshCw,
  Zap,
  Upload,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import { listRuns, type UploadResponse } from "@/lib/api";

interface RunItem {
  id: string;
  run_id?: string;
  filename: string;
  total_suppliers: number;
  total_emissions: number;
  status: string;
  created_at?: string;
}

export default function HistoryTimelinePage() {
  const router = useRouter();
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([]);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const res: any = await listRuns();
      let list: RunItem[] = [];
      if (Array.isArray(res)) {
        list = res.map((r) => ({
          id: r.id || r.run_id,
          run_id: r.id || r.run_id,
          filename: r.filename || "upload.csv",
          total_suppliers: r.total_suppliers || 0,
          total_emissions: Number(r.total_emissions || 0),
          status: r.status || "done",
          created_at: r.created_at || new Date().toISOString(),
        }));
      }

      // Check localStorage for fallback or extras
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("carbonsense_runs");
          if (saved) {
            const localList = JSON.parse(saved);
            localList.forEach((lr: any) => {
              const rId = lr.run_id || lr.id;
              if (rId && !list.find((x) => x.id === rId)) {
                list.push({
                  id: rId,
                  run_id: rId,
                  filename: lr.filename,
                  total_suppliers: lr.total_suppliers,
                  total_emissions: Number(lr.total_emissions),
                  status: lr.status || "done",
                  created_at: lr.timestamp || new Date().toISOString(),
                });
              }
            });
          }
        } catch (e) {
          // ignore
        }
      }

      setRuns(list);
    } catch (err) {
      console.warn("Could not list runs from backend, checking fallback:", err);
      // Fallback sample runs
      setRuns([
        {
          id: "2f3c90d3-8bcd-45eb-ae08-ad243c0153eb",
          filename: "demo_suppliers.csv",
          total_suppliers: 31,
          total_emissions: 104520.4,
          status: "done",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: "f270431d-719f-4786-9f0e-2b0f51d3eda0",
          filename: "q3_global_supply_chain.csv",
          total_suppliers: 48,
          total_emissions: 182310.0,
          status: "done",
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: "829a2db4-5513-4a49-9ae2-038855167adb",
          filename: "q2_tier1_tier2_audit.csv",
          total_suppliers: 25,
          total_emissions: 139400.8,
          status: "done",
          created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleToggleCompare = (id: string) => {
    setSelectedRunIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 2) {
        // Keep the newest selection + this new one
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  // Run comparison pair
  const comparedRuns = useMemo(() => {
    return runs.filter((r) => selectedRunIds.includes(r.id));
  }, [runs, selectedRunIds]);

  // Emissions trend chart data (chronological)
  const trendData = useMemo(() => {
    return [...runs]
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      .map((r, i) => ({
        index: i + 1,
        label: r.filename.replace(".csv", "").slice(0, 15),
        fullName: r.filename,
        emissions: Number((r.total_emissions / 1000).toFixed(1)),
        rawEmissions: r.total_emissions,
        suppliers: r.total_suppliers,
        id: r.id,
        isSelected: selectedRunIds.includes(r.id),
      }));
  }, [runs, selectedRunIds]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-32">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight">
              Audit Run History & Trajectory
            </h1>
            <StatusBadge color="ai" showDot>
              Multi-Run Intelligence
            </StatusBadge>
          </div>
          <p className="text-white/60 text-sm max-w-2xl font-sans">
            Review past supply chain manifests. Select any 2 runs with the{" "}
            <span className="text-cyan-400 font-semibold">Compare</span> checkbox to view side-by-side
            decarbonization metrics and emissions trajectory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={loadRuns} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => router.push("/upload")} className="gap-2">
            New Analysis
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SIDE-BY-SIDE COMPARISON CARD & TREND CHART (WHEN 2 SELECTED) */}
      {/* ============================================================ */}
      {comparedRuns.length === 2 && (
        <div className="mb-12 animate-fade-in-up">
          <GlassCard className="p-6 md:p-8 border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.15)] relative overflow-hidden bg-[#0A0E14]/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400" />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading text-white tracking-tight">
                    Side-by-Side Run Comparison
                  </h2>
                  <p className="text-white/50 text-xs font-sans">
                    Analyzing Scope 3 delta between{" "}
                    <span className="text-cyan-400 font-mono">{comparedRuns[0].filename}</span> and{" "}
                    <span className="text-emerald-400 font-mono">{comparedRuns[1].filename}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRunIds([])}
                className="text-xs text-white/50 hover:text-white transition-colors underline font-mono"
              >
                Clear comparison
              </button>
            </div>

            {/* Run A vs Run B Delta Matrix */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Run 1 */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-cyan-400/30 relative">
                <div className="text-[10px] font-mono text-cyan-400 font-semibold uppercase tracking-wider mb-2">
                  RUN A (BASE)
                </div>
                <h3 className="text-lg font-bold font-heading text-white truncate mb-1">
                  {comparedRuns[0].filename}
                </h3>
                <div className="text-xs text-white/40 mb-4 font-mono">
                  {new Date(comparedRuns[0].created_at || 0).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[11px] text-white/50 mb-1">Total Emissions</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {(comparedRuns[0].total_emissions / 1000).toFixed(1)}{" "}
                      <span className="text-xs font-sans text-white/40">tCO₂e</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[11px] text-white/50 mb-1">Suppliers Audited</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {comparedRuns[0].total_suppliers}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/dashboard/${comparedRuns[0].id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <span>Open Run A Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Run 2 */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-400/30 relative">
                <div className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-2">
                  RUN B (COMPARISON)
                </div>
                <h3 className="text-lg font-bold font-heading text-white truncate mb-1">
                  {comparedRuns[1].filename}
                </h3>
                <div className="text-xs text-white/40 mb-4 font-mono">
                  {new Date(comparedRuns[1].created_at || 0).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[11px] text-white/50 mb-1">Total Emissions</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {(comparedRuns[1].total_emissions / 1000).toFixed(1)}{" "}
                      <span className="text-xs font-sans text-white/40">tCO₂e</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[11px] text-white/50 mb-1">Suppliers Audited</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {comparedRuns[1].total_suppliers}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/dashboard/${comparedRuns[1].id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <span>Open Run B Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Delta Summary Pill */}
            {(() => {
              const em1 = comparedRuns[0].total_emissions;
              const em2 = comparedRuns[1].total_emissions;
              const diff = em2 - em1;
              const diffPct = em1 > 0 ? ((diff / em1) * 100).toFixed(1) : "0";
              const isReduction = diff < 0;

              return (
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isReduction
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-red-500/20 text-red-400 border border-red-500/40"
                      }`}
                    >
                      {isReduction ? (
                        <TrendingDown className="w-5 h-5" />
                      ) : (
                        <TrendingUp className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-white/60 font-sans">Calculated Net Delta</div>
                      <div className="text-sm font-bold font-heading text-white flex items-center gap-2">
                        <span>
                          {isReduction ? "Decreased by" : "Increased by"}{" "}
                          {Math.abs(diff / 1000).toFixed(1)} tCO₂e ({Math.abs(Number(diffPct))}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-3 py-1.5 rounded-full">
                    Supplier Delta: {comparedRuns[1].total_suppliers - comparedRuns[0].total_suppliers > 0 ? "+" : ""}
                    {comparedRuns[1].total_suppliers - comparedRuns[0].total_suppliers} vendors
                  </span>
                </div>
              );
            })()}

            {/* Trend Line Chart */}
            <div className="pt-4 border-t border-white/10">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Overall Emissions Trajectory Across Audits</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="rgba(255,255,255,0.35)"
                      tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.35)"
                      tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      unit=" t"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10, 14, 20, 0.95)",
                        border: "1px solid rgba(34, 211, 238, 0.4)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                      }}
                      labelStyle={{ color: "#fff", fontWeight: "bold" }}
                      formatter={(val: any) => [`${val} tCO₂e`, "Total Emissions"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="emissions"
                      stroke="#22D3EE"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#22D3EE", strokeWidth: 2, stroke: "#0A0E14" }}
                      activeDot={{ r: 8, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ============================================================ */}
      {/* TIMELINE OF PAST RUNS AS GLASS CARDS OR EMPTY STATE */}
      {/* ============================================================ */}
      {runs.length === 0 && !loading ? (
        <GlassCard className="p-12 text-center max-w-xl mx-auto border-white/10 my-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mx-auto mb-5 shadow-[0_0_25px_rgba(34,211,238,0.2)]">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-heading text-white mb-2">No Audit Runs Yet</h3>
          <p className="text-sm text-white/50 mb-6 leading-relaxed max-w-md mx-auto">
            You haven't run any supply chain carbon audits yet. Upload a supplier CSV or launch our sample dataset to trace Scope 3 emissions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" onClick={() => router.push("/upload")} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Supplier CSV
            </Button>
            <Button variant="secondary" onClick={() => router.push("/upload")} className="gap-2">
              Try Sample Dataset
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="relative">
          {/* Glowing vertical spine line */}
          <div className="absolute top-6 bottom-6 left-6 sm:left-8 w-0.5 bg-gradient-to-b from-cyan-500/60 via-emerald-500/40 to-transparent" />

          <div className="space-y-6">
          {runs.map((run, idx) => {
            const isSelected = selectedRunIds.includes(run.id);
            const formattedDate = new Date(run.created_at || Date.now()).toLocaleDateString(
              undefined,
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );
            const formattedTime = new Date(run.created_at || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={run.id} className="relative flex items-start gap-4 sm:gap-6 group">
                {/* Timeline node icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center z-10 transition-all ${
                    isSelected
                      ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-110"
                      : "bg-[#0A0E14] border border-cyan-400/30 text-cyan-400 group-hover:border-cyan-400 shadow-md"
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </div>

                {/* Main Glass Card */}
                <GlassCard
                  variant="holo"
                  className={`flex-1 p-5 sm:p-6 transition-all border ${
                    isSelected
                      ? "border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.2)] bg-cyan-950/20"
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold font-heading text-white group-hover:text-cyan-300 transition-colors">
                          {run.filename}
                        </h3>
                        <StatusBadge color={run.status === "done" ? "low" : "moderate"}>
                          {run.status === "done" ? "Audited" : "Processing"}
                        </StatusBadge>
                      </div>

                      <div className="text-xs text-white/40 flex items-center gap-2 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-white/30" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{formattedTime}</span>
                        <span>•</span>
                        <span className="text-white/30">ID: {run.id.slice(0, 8)}…</span>
                      </div>
                    </div>

                    {/* Right action block */}
                    <div className="flex items-center gap-3">
                      {/* Compare Checkbox */}
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                            : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/25"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCompare(run.id)}
                          className="hidden"
                        />
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                            isSelected
                              ? "bg-cyan-400 border-cyan-400 text-black"
                              : "border-white/30 bg-white/5"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>Compare</span>
                      </label>

                      {/* Open Dashboard Button */}
                      <Link
                        href={`/dashboard/${run.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-heading font-semibold border border-white/10 hover:border-white/20 transition-all group-hover:scale-105"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                      </Link>
                    </div>
                  </div>

                  {/* Run Quick Stats Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs">
                    <div>
                      <div className="text-white/40 mb-0.5 font-sans">Scope 3 Emissions</div>
                      <div className="text-white font-bold font-mono text-sm">
                        {(run.total_emissions / 1000).toFixed(1)}{" "}
                        <span className="text-[10px] text-white/50">tCO₂e</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-white/40 mb-0.5 font-sans">Audited Suppliers</div>
                      <div className="text-white font-bold font-mono text-sm">
                        {run.total_suppliers}{" "}
                        <span className="text-[10px] text-white/50">vendors</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-white/40 mb-0.5 font-sans">Average / Vendor</div>
                      <div className="text-white font-bold font-mono text-sm">
                        {run.total_suppliers > 0
                          ? (run.total_emissions / run.total_suppliers / 1000).toFixed(1)
                          : "0"}{" "}
                        <span className="text-[10px] text-white/50">tCO₂e</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-white/40 mb-0.5 font-sans">Audit Verification</div>
                      <div className="text-emerald-400 font-medium text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>GHG Scope 3</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
