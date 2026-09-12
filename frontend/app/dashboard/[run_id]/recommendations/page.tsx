"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRun, applyRecommendation, type RunResponse } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import { ArrowLeft, ArrowRight, CheckCircle2, ArrowDown } from "lucide-react";

export default function RecommendationsPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.run_id as string;
  
  const [data, setData] = useState<RunResponse | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  useEffect(() => {
    getRun(runId).then(setData);
  }, [runId]);

  if (!data) return <div className="p-8 animate-pulse text-white">Loading recommendations...</div>;

  const handleApply = async (rec: any) => {
    setApplying(rec.from_supplier);
    try {
      // Find the IDs
      const fromSup = data.suppliers?.find(s => s.supplier_name === rec.from_supplier);
      const toSup = data.suppliers?.find(s => s.supplier_name === rec.to_supplier);
      if (fromSup && toSup) {
        await applyRecommendation(runId, fromSup.id, toSup.id);
        setApplied(new Set([...applied, rec.from_supplier]));
      }
    } catch(e) {
      alert("Error applying recommendation");
    } finally {
      setApplying(null);
    }
  };

  // We are assuming recommendations come through data.recommendations in the API
  const recommendations = (data as any).recommendations || [];

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Decarbonization Swaps</h1>
        <p className="text-white/60">AI-matched lower emission supplier alternatives.</p>
      </div>

      {recommendations.length === 0 ? (
        <GlassCard className="p-8 text-center text-white/50">
          No recommendations available for this run.
        </GlassCard>
      ) : (
        <div className="grid gap-6">
          {recommendations.map((rec: any, idx: number) => {
            const isApplied = applied.has(rec.from_supplier);
            return (
              <GlassCard key={idx} className={`p-6 border-cyan-500/30 transition-all ${isApplied ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                  
                  {/* From Supplier */}
                  <div className="flex-1 text-center md:text-right">
                    <div className="text-sm font-semibold text-white/50 uppercase mb-2">Current</div>
                    <div className="text-xl font-bold text-white">{rec.from_supplier}</div>
                  </div>

                  {/* Swap Indicator */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-sm font-bold border border-emerald-500/30 flex items-center gap-1">
                      <ArrowDown className="w-4 h-4" />
                      {rec.emissions_reduction_pct.toFixed(1)}% Reduction
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/30 hidden md:block" />
                  </div>

                  {/* To Supplier */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-sm font-semibold text-emerald-400/80 uppercase mb-2">Recommended Match</div>
                    <div className="text-xl font-bold text-emerald-400">{rec.to_supplier}</div>
                    <div className="text-sm text-white/50 mt-1">Similarity Score: {(rec.similarity_score * 100).toFixed(1)}%</div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                    {isApplied ? (
                      <button disabled className="w-full md:w-auto px-6 py-3 bg-white/10 text-white/50 rounded-full flex items-center justify-center gap-2 font-medium">
                        <CheckCircle2 className="w-5 h-5" /> Applied
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApply(rec)}
                        disabled={applying === rec.from_supplier}
                        className="w-full md:w-auto px-6 py-3 bg-cyan-500 text-black hover:bg-cyan-400 rounded-full font-semibold transition-colors disabled:opacity-50"
                      >
                        {applying === rec.from_supplier ? "Applying..." : "Apply Swap"}
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
