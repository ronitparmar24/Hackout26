"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRun, listRuns, type RunResponse } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import { Layers, ArrowDown, Network } from "lucide-react";

function WaterfallContent() {
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
  if (!data || !data.suppliers) return <div className="text-white text-center mt-20">No data found.</div>;

  // Group emissions by Tier
  const tierMap: Record<string, number> = { "Tier 3": 0, "Tier 2": 0, "Tier 1": 0 };
  data.suppliers.forEach(s => {
    if (tierMap[s.tier] !== undefined) {
      tierMap[s.tier] += s.total_emissions;
    }
  });

  const total = data.total_emissions;
  const t3Pct = (tierMap["Tier 3"] / total) * 100 || 0;
  const t2Pct = (tierMap["Tier 2"] / total) * 100 || 0;
  const t1Pct = (tierMap["Tier 1"] / total) * 100 || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-32 relative overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_6s_ease-in-out_infinite]" />

      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
          <Network className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white tracking-tight mb-4">
          Carbon Lineage Waterfall
        </h1>
        <p className="text-white/60 text-sm font-sans max-w-2xl mx-auto">
          Visualize the accumulation of Scope 3 emissions as they flow upwards from raw material extraction (Tier 3) to final assembly (Tier 1).
        </p>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Tier 3 Block */}
        <GlassCard className="w-full sm:w-[500px] p-6 text-center border-purple-500/30 relative z-10">
          <div className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-1">Raw Materials Extraction</div>
          <div className="text-2xl font-bold text-white mb-2">Tier 3 Suppliers</div>
          <div className="text-4xl font-bold font-heading text-purple-300">
            {(tierMap["Tier 3"] / 1000).toFixed(1)} <span className="text-lg">tCO₂e</span>
          </div>
          <div className="text-xs text-white/40 mt-2">{t3Pct.toFixed(1)}% of total footprint</div>
        </GlassCard>

        {/* Flow Line */}
        <div className="h-16 w-1 bg-gradient-to-b from-purple-500/50 to-cyan-500/50 relative flex items-center justify-center my-2">
          <ArrowDown className="w-4 h-4 text-cyan-400 absolute bg-[#0a0f1d]" />
        </div>

        {/* Tier 2 Block */}
        <GlassCard className="w-full sm:w-[600px] p-6 text-center border-cyan-500/30 relative z-10">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">Processing & Manufacturing</div>
          <div className="text-2xl font-bold text-white mb-2">Tier 2 Suppliers</div>
          <div className="text-4xl font-bold font-heading text-cyan-300">
            {(tierMap["Tier 2"] / 1000).toFixed(1)} <span className="text-lg">tCO₂e</span>
          </div>
          <div className="text-xs text-white/40 mt-2">
            + {t2Pct.toFixed(1)}% accumulated added emissions
          </div>
        </GlassCard>

        {/* Flow Line */}
        <div className="h-16 w-1 bg-gradient-to-b from-cyan-500/50 to-emerald-500/50 relative flex items-center justify-center my-2">
          <ArrowDown className="w-4 h-4 text-emerald-400 absolute bg-[#0a0f1d]" />
        </div>

        {/* Tier 1 Block */}
        <GlassCard className="w-full sm:w-[700px] p-6 text-center border-emerald-500/30 relative z-10">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">Final Assembly & OEM</div>
          <div className="text-2xl font-bold text-white mb-2">Tier 1 Suppliers</div>
          <div className="text-4xl font-bold font-heading text-emerald-300">
            {(tierMap["Tier 1"] / 1000).toFixed(1)} <span className="text-lg">tCO₂e</span>
          </div>
          <div className="text-xs text-white/40 mt-2">
            + {t1Pct.toFixed(1)}% accumulated added emissions
          </div>
        </GlassCard>

        {/* Final Result */}
        <div className="mt-12 p-1 rounded-3xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500">
          <div className="bg-[#0a0f1d] px-12 py-6 rounded-3xl text-center">
            <div className="text-xs font-mono text-white/60 uppercase tracking-widest mb-2">Total Supply Chain Footprint</div>
            <div className="text-5xl font-bold font-heading text-white">
              {(total / 1000).toFixed(1)} <span className="text-2xl text-cyan-400">tCO₂e</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function WaterfallPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: "100px auto" }} />}>
      <WaterfallContent />
    </Suspense>
  );
}
