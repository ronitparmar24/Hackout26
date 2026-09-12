"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRun, listRuns, type RunResponse, type Supplier } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { Radar, AlertTriangle, CloudLightning, ShieldAlert, Globe2, Activity } from "lucide-react";

const GLOBAL_THREATS = [
  {
    id: "THREAT-1",
    type: "Climate",
    severity: "Critical",
    region: "India",
    title: "Severe Monsoon & Flood Warning",
    description: "Unprecedented rainfall in Chennai causing severe logistics delays. Rail networks are operating at 30% capacity.",
    icon: CloudLightning,
    color: "red"
  },
  {
    id: "THREAT-2",
    type: "Geopolitical",
    severity: "High",
    region: "UK",
    title: "Border Tariff Dispute (CBAM)",
    description: "New carbon tax regulations taking effect this week affecting heavy manufacturing imports from non-compliant EU zones.",
    icon: ShieldAlert,
    color: "amber"
  },
  {
    id: "THREAT-3",
    type: "Infrastructure",
    severity: "Moderate",
    region: "Global",
    title: "Maritime Route Congestion",
    description: "Suez Canal backlogs causing 15-day average delays on sea freight.",
    icon: Activity,
    color: "cyan"
  }
];

function RiskRadarContent() {
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
          if (runs && runs.length > 0) {
            activeRunId = runs[0].run_id || (runs[0] as any).id;
          }
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

  // Cross-reference threats with suppliers
  const affectedSuppliers = data.suppliers?.filter((s) => 
    GLOBAL_THREATS.some(t => t.region === s.region || t.region === "Global")
  ) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
            <Radar className="w-8 h-8 text-red-500 animate-[spin_4s_linear_infinite]" />
            Global Risk & Resilience Radar
          </h1>
          <p className="text-white/60 text-sm font-sans mt-2">
            Cross-referencing active supply chain nodes against live climate, geopolitical, and infrastructure threats.
          </p>
        </div>
        <StatusBadge color="high" pulse>3 ACTIVE THREATS</StatusBadge>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Global Threats Feed */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-2">Live Threat Intelligence</h2>
          {GLOBAL_THREATS.map((threat) => {
            const Icon = threat.icon;
            const isRed = threat.color === "red";
            const isAmber = threat.color === "amber";
            
            return (
              <GlassCard key={threat.id} className={`p-5 border-l-4 ${isRed ? "border-l-red-500" : isAmber ? "border-l-amber-500" : "border-l-cyan-500"}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${isRed ? "bg-red-500/20 text-red-400" : isAmber ? "bg-amber-500/20 text-amber-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${isRed ? "bg-red-500/20 text-red-300" : isAmber ? "bg-amber-500/20 text-amber-300" : "bg-cyan-500/20 text-cyan-300"}`}>
                        {threat.severity}
                      </span>
                      <span className="text-xs text-white/50 font-mono">{threat.region}</span>
                    </div>
                    <h3 className="text-white font-bold mb-1">{threat.title}</h3>
                    <p className="text-xs text-white/70 leading-relaxed">{threat.description}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Right: Affected Suppliers */}
        <div className="lg:col-span-7">
          <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4">Vulnerable Supply Nodes ({affectedSuppliers.length})</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {affectedSuppliers.slice(0, 8).map((supplier) => (
              <GlassCard key={supplier.id} className="p-4 bg-red-950/20 border-red-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-2xl rounded-full" />
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-white text-sm truncate pr-4">{supplier.supplier_name}</div>
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                </div>
                <div className="text-xs font-mono text-white/50 flex flex-col gap-1">
                  <span>Region: <span className="text-red-300">{supplier.region}</span></span>
                  <span>Tier: {supplier.tier}</span>
                  <span>Material: {supplier.material_type}</span>
                </div>
              </GlassCard>
            ))}
          </div>
          {affectedSuppliers.length > 8 && (
            <div className="text-center mt-4 text-xs font-mono text-white/40">+ {affectedSuppliers.length - 8} more vulnerable nodes</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RiskRadarPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: "100px auto" }} />}>
      <RiskRadarContent />
    </Suspense>
  );
}
