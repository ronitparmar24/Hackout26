"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAnomalyExplanation, getRun, type Supplier } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import { ShieldAlert, Info, ArrowLeft, Leaf } from "lucide-react";

export default function SupplierProfile() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.supplier_id as string;
  const runId = params.run_id as string;
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    getRun(runId).then(res => {
      const s = res.suppliers?.find(sup => sup.id === supplierId);
      if (s) setSupplier(s);
    });
    getAnomalyExplanation(supplierId).then(res => {
      setRiskData(res);
    });
  }, [runId, supplierId]);

  if (!supplier || !riskData) return <div className="p-8 text-white animate-pulse">Loading supplier profile...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{supplier.supplier_name}</h1>
          <p className="text-white/60">{supplier.tier} Supplier · {supplier.region}</p>
        </div>
        {supplier.is_anomaly && (
          <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-2 font-medium">
            <ShieldAlert className="w-5 h-5" /> Flagged Anomaly
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-8 border-cyan-500/30">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">AI Risk Analysis</h3>
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-white">{riskData.risk_score}</span>
              <span className="text-white/50 text-sm">/ 100 Risk Score</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${riskData.risk_score > 70 ? 'bg-red-500' : riskData.risk_score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                style={{ width: `${riskData.risk_score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" /> Justification
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">{riskData.risk_justification}</p>
          </div>

          {riskData.anomaly_reason && (
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <h4 className="text-sm font-medium text-red-400 mb-2">Anomaly Detected</h4>
              <p className="text-sm text-red-300/80 leading-relaxed">{riskData.anomaly_reason}</p>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-8">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">Emissions Breakdown</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white">Energy ({supplier.energy_kwh_estimated ? 'Est.' : 'Actual'})</span>
                <span className="text-emerald-400">{supplier.energy_emissions.toFixed(2)} kg</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{width: `${(supplier.energy_emissions / supplier.total_emissions) * 100}%`}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white">Transport ({supplier.transport_mode})</span>
                <span className="text-blue-400">{supplier.transport_emissions.toFixed(2)} kg</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width: `${(supplier.transport_emissions / supplier.total_emissions) * 100}%`}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white">Material ({supplier.material_type})</span>
                <span className="text-purple-400">{supplier.material_emissions.toFixed(2)} kg</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{width: `${(supplier.material_emissions / supplier.total_emissions) * 100}%`}}></div></div>
            </div>
            
            <div className="pt-4 border-t border-white/10 mt-6 flex justify-between items-center">
              <span className="font-medium text-white">Total Carbon Footprint</span>
              <span className="text-xl font-bold text-white">{supplier.total_emissions.toLocaleString()} kg CO₂e</span>
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
