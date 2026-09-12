"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRun, getSummary, getExportPDFUrl, getExportCSVUrl } from "@/lib/api";
import { ArrowLeft, FileText, Download, FileSpreadsheet, DownloadCloud } from "lucide-react";
import GlassCard from "@/components/GlassCard";

export default function ReportPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.run_id as string;

  const [data, setData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    getRun(runId).then(setData);
    getSummary(runId).then(setSummary);
  }, [runId]);

  if (!data || !summary) return <div className="p-8 text-white animate-pulse">Loading report...</div>;

  return (
    <div className="max-w-4xl mx-auto pt-12 pb-24">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-cyan-400" /> Audit Report Preview
          </h1>
          <p className="text-white/60 mt-2">Dataset: {data.filename}</p>
        </div>
        <div className="flex gap-3">
          <a 
            href={getExportCSVUrl(runId)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-medium transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> CSV
          </a>
          <a 
            href={getExportPDFUrl(runId)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full font-bold transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Download className="w-4 h-4" /> Download PDF
          </a>
        </div>
      </div>

      <GlassCard className="p-12 bg-white/5 border border-white/20 relative overflow-hidden">
        {/* Document styling simulation */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px]"></div>
        
        <div className="border-b border-white/10 pb-8 mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Scope 3 Emissions Assessment</h2>
          <p className="text-white/50">{new Date().toLocaleDateString()} · CarbonSense Enterprise AI</p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-bold text-white mb-4">1. Executive Summary</h3>
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{summary.executive_summary}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-4">2. Recommended Actions</h3>
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap p-4 bg-white/5 rounded-lg border border-white/10">
              {summary.recommended_actions}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-4">3. Quantitative Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-white/50 text-sm mb-1">Total Carbon Footprint</div>
                <div className="text-2xl font-bold text-white">{data.total_emissions.toLocaleString()} kg CO₂e</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="text-white/50 text-sm mb-1">Suppliers Analyzed</div>
                <div className="text-2xl font-bold text-white">{data.total_suppliers}</div>
              </div>
            </div>
          </section>
        </div>

      </GlassCard>
    </div>
  );
}
