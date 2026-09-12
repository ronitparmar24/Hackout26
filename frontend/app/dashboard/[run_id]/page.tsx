"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { getRun, filterNLP, type RunResponse } from "@/lib/api";
import DashboardSummary from "@/components/DashboardSummary";
import EmissionsChart from "@/components/EmissionsChart";
import AnomalyTable from "@/components/AnomalyTable";
import ClusterTreeView from "@/components/ClusterTreeView";
import RecommendationPanel from "@/components/RecommendationPanel";
import ExportButtons from "@/components/ExportButtons";
import { BarChart3, Loader2, ShieldAlert } from "lucide-react";
import AIExecutiveSummary from "@/components/AIExecutiveSummary";
import NLPSearchBar from "@/components/NLPSearchBar";
import ForecastChart from "@/components/ForecastChart";
import AIChatWidget from "@/components/AIChatWidget";

export default function DashboardPage() {
  const params = useParams();
  const runId = params.run_id as string;
  
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  useEffect(() => {
    if (!runId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const result = await getRun(runId);
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load run data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [runId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-white/50">Loading analysis data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="glass-card text-center p-12 border-red-500/20">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.suppliers) return null;

  let filteredSuppliers = data.suppliers;
  if (activeFilters) {
    if (activeFilters.tier) {
      filteredSuppliers = filteredSuppliers.filter(s => s.tier.toLowerCase() === activeFilters.tier.toLowerCase());
    }
    if (activeFilters.material_type) {
      filteredSuppliers = filteredSuppliers.filter(s => s.material_type.toLowerCase().includes(activeFilters.material_type.toLowerCase()));
    }
    if (activeFilters.is_anomaly === true) {
      filteredSuppliers = filteredSuppliers.filter(s => s.is_anomaly);
    }
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Emissions <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Dashboard</span>
          </h1>
          <p className="text-white/60">
            Analysis results for <span className="text-white font-medium">{data.filename}</span> · {data.total_suppliers} suppliers
          </p>
        </div>
        <ExportButtons runId={data.run_id} />
      </div>

      {/* AI Components Section */}
      <div className="space-y-6 mb-8">
        <AIExecutiveSummary runId={runId} />
        
        <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
          <NLPSearchBar onFilter={(filters) => setActiveFilters(filters)} />
          {activeFilters && (
            <button 
              onClick={() => setActiveFilters(null)}
              className="text-xs text-cyan-400 hover:text-cyan-300 px-3 py-1 bg-cyan-500/10 rounded-full ml-4"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary */}
      <DashboardSummary
        totalEmissions={data.total_emissions}
        totalSuppliers={filteredSuppliers.length}
        suppliers={filteredSuppliers}
      />

      {/* Forecast & Current Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Emissions Forecast (BAU vs Optimized)</h3>
          </div>
          <ForecastChart runId={runId} />
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Current Emissions Breakdown</h3>
          <EmissionsChart suppliers={filteredSuppliers} />
        </div>
      </div>

      {/* Anomaly & Clusters side by side */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <AnomalyTable suppliers={filteredSuppliers} />
        <ClusterTreeView suppliers={filteredSuppliers} />
      </div>

      {/* Recommendations */}
      <RecommendationPanel suppliers={filteredSuppliers} />

      {/* Supplier table */}
      <div className="mt-8">
        <div className="glass-card p-0 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">All Suppliers {activeFilters ? '(Filtered)' : ''}</h2>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20">
              {filteredSuppliers.length} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-white/50 tracking-wider">
                  <th className="px-6 py-4 font-medium">Supplier</th>
                  <th className="px-6 py-4 font-medium">Tier</th>
                  <th className="px-6 py-4 font-medium">Risk</th>
                  <th className="px-6 py-4 font-medium">Material</th>
                  <th className="px-6 py-4 font-medium">Energy (kg)</th>
                  <th className="px-6 py-4 font-medium">Transport (kg)</th>
                  <th className="px-6 py-4 font-medium text-right">Total (kg)</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...filteredSuppliers]
                  .sort((a, b) => b.total_emissions - a.total_emissions)
                  .map((s, i) => (
                    <tr key={s.id || i} className={`hover:bg-white/5 transition-colors ${s.is_anomaly ? 'bg-red-500/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{s.supplier_name}</div>
                        <div className="text-xs text-white/40">{s.region}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">{s.tier}</span>
                      </td>
                      <td className="px-6 py-4">
                        {s.risk_score ? (
                           <div className="flex items-center gap-2">
                             <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                               <div className={`h-full ${s.risk_score > 70 ? 'bg-red-500' : s.risk_score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${s.risk_score}%` }}></div>
                             </div>
                             <span className="text-xs text-white/70">{s.risk_score}</span>
                           </div>
                        ) : (
                          <span className="text-xs text-white/30">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">{s.material_type}</td>
                      <td className="px-6 py-4 text-sm text-emerald-400">
                        {s.energy_emissions.toFixed(2)}
                        {s.energy_kwh_estimated && <span className="ml-1 text-[10px] text-amber-400">⚡</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-400">
                        {s.transport_emissions.toFixed(2)}
                        {s.transport_km_estimated && <span className="ml-1 text-[10px] text-amber-400">🚚</span>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white text-right">
                        {s.total_emissions.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {s.is_anomaly ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <ShieldAlert className="w-3 h-3" /> Anomaly
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Floating AI Chat */}
      <AIChatWidget runId={runId} />
    </div>
  );
}
