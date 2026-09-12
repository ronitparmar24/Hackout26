"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRun, listRuns, type RunResponse } from "@/lib/api";
import AnimatedCounter from "@/components/AnimatedCounter";
import GlitchText from "@/components/GlitchText";
import { Maximize, Presentation, Activity, Users, ShieldAlert } from "lucide-react";

function BoardroomContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let activeRunId = runId;
        if (!activeRunId) {
          const runs = await listRuns();
          if (runs && runs.length > 0) activeRunId = runs[0].run_id || (runs[0] as any).id;
        }
        if (activeRunId) {
          const result = await getRun(activeRunId);
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load run", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [runId]);

  if (loading) return <div className="spinner" style={{ margin: "100px auto" }} />;
  if (!data) return <div className="text-white text-center mt-20">No data found.</div>;

  const totalEmissionsTons = data.total_emissions / 1000;
  const anomalies = data.suppliers?.filter(s => s.is_anomaly).length || 0;
  const totalSuppliers = data.total_suppliers;

  return (
    <div className="relative min-h-[85vh] bg-[#0A0E14] text-white flex flex-col rounded-3xl overflow-hidden animate-fade-in border border-white/10 shadow-2xl mt-4 max-w-7xl mx-auto">
      {/* Abstract Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-[#0A0E14] to-[#0A0E14] z-0 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex justify-between items-center px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Presentation className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-mono tracking-widest uppercase text-white/70">
            <GlitchText text="C-Suite Executive Briefing" speed={40} />
          </h1>
        </div>
        <div className="flex items-center gap-6 font-mono text-sm">
          <span className="text-cyan-400 animate-pulse">● LIVE TELEMETRY</span>
          <span className="text-white/40">{new Date().toLocaleDateString()}</span>
          <button onClick={() => window.history.back()} className="text-white/50 hover:text-white flex items-center gap-1.5 transition-colors text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <Maximize className="w-3.5 h-3.5" /> Exit Boardroom
          </button>
        </div>
      </div>

      {/* Main Content (Centered) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold font-heading mb-4 tracking-tight">Scope 3 Emissions</h2>
          <p className="text-xl md:text-2xl text-white/40 font-sans max-w-3xl mx-auto">
            Real-time multi-tier supplier audit for run <span className="font-mono text-cyan-400">{data.run_id.substring(0,8)}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 w-full max-w-7xl">
          {/* KPI 1 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
              <Activity className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="text-sm font-mono text-white/50 uppercase tracking-widest mb-2">Total Carbon Footprint</div>
            <div className="text-6xl md:text-8xl font-bold font-heading text-white flex items-baseline gap-4">
              <AnimatedCounter value={totalEmissionsTons} decimals={0} />
              <span className="text-2xl md:text-4xl text-emerald-400 font-medium">tCO₂e</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
              <Users className="w-10 h-10 text-cyan-400" />
            </div>
            <div className="text-sm font-mono text-white/50 uppercase tracking-widest mb-2">Audited Suppliers</div>
            <div className="text-6xl md:text-8xl font-bold font-heading text-white flex items-baseline gap-4">
              <AnimatedCounter value={totalSuppliers} />
              <span className="text-2xl md:text-4xl text-cyan-400 font-medium">Nodes</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
              <ShieldAlert className="w-10 h-10 text-red-400" />
            </div>
            <div className="text-sm font-mono text-white/50 uppercase tracking-widest mb-2">High-Risk Outliers</div>
            <div className="text-6xl md:text-8xl font-bold font-heading text-red-400 flex items-baseline gap-4">
              <AnimatedCounter value={anomalies} />
              <span className="text-2xl md:text-4xl text-red-400/50 font-medium">Flags</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Strip */}
      <div className="relative z-10 h-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />
    </div>
  );
}

export default function BoardroomPage() {
  return (
    <Suspense fallback={<div className="spinner" />}>
      <BoardroomContent />
    </Suspense>
  );
}
