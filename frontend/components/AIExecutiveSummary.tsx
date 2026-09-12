"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Activity, Target } from "lucide-react";
import { getSummary } from "@/lib/api";

export default function AIExecutiveSummary({ runId }: { runId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [actions, setActions] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSummary(runId).then(data => {
      setSummary(data.executive_summary);
      setActions(data.recommended_actions);
      setLoading(false);
    }).catch(console.error);
  }, [runId]);

  if (loading) {
    return (
      <div className="glass-card relative overflow-hidden border-cyan-500/30 p-6 animate-pulse">
        <div className="h-6 w-1/3 bg-white/10 rounded mb-4"></div>
        <div className="h-4 w-full bg-white/5 rounded mb-2"></div>
        <div className="h-4 w-5/6 bg-white/5 rounded"></div>
      </div>
    );
  }

  return (
    <div className="glass-card relative overflow-hidden border-cyan-500/30">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0 opacity-70"></div>
      
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">AI Executive Summary</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
              <Activity className="w-4 h-4" /> Assessment
            </div>
            <p className="text-sm text-white/80 leading-relaxed font-light">
              {summary || "No summary available."}
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
              <Target className="w-4 h-4" /> Recommended Actions
            </div>
            <div className="text-sm text-white/80 leading-relaxed font-light whitespace-pre-wrap bg-white/5 rounded-xl p-4 border border-white/10">
              {actions || "No recommended actions."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
