"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRun, listRuns, type RunResponse } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import { FileText, Printer, Building2, Coins, Calendar } from "lucide-react";

function InvoicingContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Internal Carbon Price (ICP) per ton
  const [icp, setIcp] = useState<number>(50);

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

  // Group emissions by Material Type (simulating internal departments)
  const departments: Record<string, number> = {};
  data.suppliers.forEach(s => {
    const dept = s.material_type + " Division";
    departments[dept] = (departments[dept] || 0) + s.total_emissions;
  });

  const departmentArray = Object.entries(departments).map(([name, emissions]) => ({
    name,
    tons: emissions / 1000,
    cost: (emissions / 1000) * icp
  })).sort((a, b) => b.cost - a.cost);

  const totalTons = departmentArray.reduce((acc, d) => acc + d.tons, 0);
  const totalCost = departmentArray.reduce((acc, d) => acc + d.cost, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-amber-400" />
            Internal Carbon Invoicing
          </h1>
          <p className="text-white/60 text-sm font-sans mt-2">
            Generate financial liabilities for internal business units based on their Scope 3 emissions.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-xl">
          <span className="text-xs font-mono text-white/50 px-2 uppercase">Set ICP Rate:</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
            <input 
              type="number" 
              value={icp} 
              onChange={(e) => setIcp(Number(e.target.value))}
              className="bg-black/50 border border-white/20 rounded-lg pl-6 pr-3 py-1.5 text-white w-24 outline-none focus:border-amber-400 transition-colors font-mono"
            />
          </div>
          <span className="text-xs font-mono text-white/50 pr-2">/ tCO₂e</span>
        </div>
      </div>

      {/* Invoice UI */}
      <GlassCard className="p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-12 border-b-2 border-white/10 pb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-2xl mb-1 tracking-tighter">
              <Building2 className="w-6 h-6 text-amber-400" />
              <span>ESG Treasury Dept.</span>
            </div>
            <div className="text-white/50 text-sm font-mono">100 Sustainability Way, Earth</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white font-heading mb-2 tracking-widest">INVOICE</div>
            <div className="flex flex-col gap-1 text-sm font-mono text-white/60">
              <div className="flex justify-between gap-8">
                <span>Invoice No:</span> <span className="font-bold text-amber-400">CBAM-{data.run_id.substring(0,6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span>Date:</span> <span className="font-bold text-white/90">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Billed To */}
        <div className="mb-12 relative z-10">
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Billed To</div>
          <div className="text-lg font-bold text-white">Internal Business Units</div>
          <div className="text-white/60">Corporate Headquarters</div>
        </div>

        {/* Invoice Table */}
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left mb-12">
            <thead>
              <tr className="border-b-2 border-white/20 text-xs font-bold uppercase tracking-wider text-white/50">
                <th className="py-4">Department / Division</th>
                <th className="py-4 text-right">Volume (tCO₂e)</th>
                <th className="py-4 text-right">Rate (ICP)</th>
                <th className="py-4 text-right">Total Liability</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {departmentArray.map((dept, i) => (
                <tr key={i} className="border-b border-white/5 text-white/80 hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400/50 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    <span className="font-bold text-white/90 font-sans">{dept.name}</span>
                  </td>
                  <td className="py-5 text-right text-cyan-300">{dept.tons.toLocaleString(undefined, { maximumFractionDigits: 1 })} t</td>
                  <td className="py-5 text-right text-white/40">${icp.toFixed(2)}</td>
                  <td className="py-5 text-right font-bold text-amber-400 text-lg">
                    ${dept.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end relative z-10">
          <div className="w-72 space-y-4 font-mono text-sm bg-black/40 p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between text-white/60">
              <span>Total Emissions:</span>
              <span className="text-white">{totalTons.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO₂e</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-white border-t border-white/20 pt-4">
              <span>Amount Due:</span>
              <span className="text-amber-400">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-white/30 font-sans relative z-10">
          This is an internally generated Carbon Tax Liability document. Funds must be transferred to the ESG Treasury for centralized offset procurement.
        </div>
      </GlassCard>

      <div className="mt-8 flex justify-center">
        <Button variant="primary" onClick={() => window.print()} className="gap-2 shadow-[0_0_20px_rgba(251,191,36,0.2)] border-amber-500/50 hover:border-amber-400">
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </Button>
      </div>
    </div>
  );
}

export default function InvoicingPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: "100px auto" }} />}>
      <InvoicingContent />
    </Suspense>
  );
}
