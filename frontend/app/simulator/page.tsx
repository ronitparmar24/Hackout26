"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRun, listRuns, type RunResponse, type Supplier } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import confetti from "canvas-confetti";
import {
  Sliders,
  Sparkles,
  TrendingDown,
  DollarSign,
  Leaf,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Zap,
  Flame,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulation Sliders
  const [airToRailShift, setAirToRailShift] = useState<number>(50); // % of air shifted to rail
  const [renewableEnergyPct, setRenewableEnergyPct] = useState<number>(40); // % suppliers on clean energy
  const [recycledMaterialPct, setRecycledMaterialPct] = useState<number>(30); // % recycled material substitution
  const [decoupleAnomalies, setDecoupleAnomalies] = useState<boolean>(true); // replace anomalies

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
        console.error("Failed to load data for simulator", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [runId]);

  const suppliers: Supplier[] = data?.suppliers || [];

  // Recalculate emissions under active scenario
  const simulationResults = useMemo(() => {
    if (!suppliers.length) {
      return {
        baselineTotal: 0,
        scenarioTotal: 0,
        reductionTotal: 0,
        pctReduction: 0,
        baselineEnergy: 0,
        scenarioEnergy: 0,
        baselineTransport: 0,
        scenarioTransport: 0,
        baselineMaterial: 0,
        scenarioMaterial: 0,
        costSavingsUsd: 0,
      };
    }

    let bEnergy = 0;
    let bTransport = 0;
    let bMaterial = 0;

    let sEnergy = 0;
    let sTransport = 0;
    let sMaterial = 0;

    suppliers.forEach((s) => {
      const isAnomaly = s.is_anomaly;

      const origEnergyEm = s.energy_emissions || 0;
      const origTransportEm = s.transport_emissions || 0;
      const origMaterialEm = s.material_emissions || 0;

      bEnergy += origEnergyEm;
      bTransport += origTransportEm;
      bMaterial += origMaterialEm;

      // If decoupling anomalies, cap anomaly emissions to median normal emissions
      let supEnergyEm = origEnergyEm;
      let supTransportEm = origTransportEm;
      let supMaterialEm = origMaterialEm;

      if (decoupleAnomalies && isAnomaly) {
        supEnergyEm = Math.min(supEnergyEm, 1500);
        supTransportEm = Math.min(supTransportEm, 800);
        supMaterialEm = Math.min(supMaterialEm, 25000);
      }

      // 1. Renewable Energy reduction
      // Clean power cuts grid emission factor by up to 85%
      const energyFactorDiscount = 0.85 * (renewableEnergyPct / 100);
      supEnergyEm = supEnergyEm * (1 - energyFactorDiscount);

      // 2. Air to Rail modal shift
      // Air freight factor = 0.899, Rail = 0.025 (~97% reduction)
      if (s.transport_mode === "Air") {
        const shiftedFraction = airToRailShift / 100;
        const savedFraction = shiftedFraction * 0.97;
        supTransportEm = supTransportEm * (1 - savedFraction);
      }

      // 3. Recycled Material substitution
      // Secondary/recycled metals & plastics reduce footprint by ~60%
      const materialDiscount = 0.6 * (recycledMaterialPct / 100);
      supMaterialEm = supMaterialEm * (1 - materialDiscount);

      sEnergy += supEnergyEm;
      sTransport += supTransportEm;
      sMaterial += supMaterialEm;
    });

    const baselineTotal = bEnergy + bTransport + bMaterial;
    const scenarioTotal = sEnergy + sTransport + sMaterial;
    const reductionTotal = baselineTotal - scenarioTotal;
    const pctReduction = baselineTotal > 0 ? (reductionTotal / baselineTotal) * 100 : 0;

    // Estimated CBAM / Carbon Tax savings: $85 per metric tonne of CO2e
    const costSavingsUsd = (reductionTotal / 1000) * 85;

    return {
      baselineTotal: Math.round(baselineTotal),
      scenarioTotal: Math.round(scenarioTotal),
      reductionTotal: Math.round(reductionTotal),
      pctReduction: Math.round(pctReduction * 10) / 10,
      baselineEnergy: Math.round(bEnergy),
      scenarioEnergy: Math.round(sEnergy),
      baselineTransport: Math.round(bTransport),
      scenarioTransport: Math.round(sTransport),
      baselineMaterial: Math.round(bMaterial),
      scenarioMaterial: Math.round(sMaterial),
      costSavingsUsd: Math.round(costSavingsUsd),
    };
  }, [suppliers, airToRailShift, renewableEnergyPct, recycledMaterialPct, decoupleAnomalies]);

  const chartData = [
    {
      category: "Energy Emissions",
      Baseline: Math.round(simulationResults.baselineEnergy / 1000),
      Simulated: Math.round(simulationResults.scenarioEnergy / 1000),
    },
    {
      category: "Freight Logistics",
      Baseline: Math.round(simulationResults.baselineTransport / 1000),
      Simulated: Math.round(simulationResults.scenarioTransport / 1000),
    },
    {
      category: "Material Embodied",
      Baseline: Math.round(simulationResults.baselineMaterial / 1000),
      Simulated: Math.round(simulationResults.scenarioMaterial / 1000),
    },
  ];

  const [activePreset, setActivePreset] = useState<string | null>(null);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#06B6D4", "#F59E0B", "#8B5CF6", "#EC4899"],
      });
    } catch (e) {
      // ignore
    }
  };

  const applyPreset = (presetName: string) => {
    setActivePreset(presetName);
    if (presetName === "netzero") {
      setAirToRailShift(90);
      setRenewableEnergyPct(85);
      setRecycledMaterialPct(75);
      setDecoupleAnomalies(true);
      triggerCelebration();
    } else if (presetName === "freight") {
      setAirToRailShift(100);
      setRenewableEnergyPct(45);
      setRecycledMaterialPct(35);
      setDecoupleAnomalies(true);
      triggerCelebration();
    } else if (presetName === "outliers") {
      setAirToRailShift(50);
      setRenewableEnergyPct(30);
      setRecycledMaterialPct(25);
      setDecoupleAnomalies(true);
      triggerCelebration();
    } else if (presetName === "circular") {
      setAirToRailShift(40);
      setRenewableEnergyPct(65);
      setRecycledMaterialPct(90);
      setDecoupleAnomalies(false);
      triggerCelebration();
    }
  };

  const resetDefaults = () => {
    setActivePreset(null);
    setAirToRailShift(50);
    setRenewableEnergyPct(40);
    setRecycledMaterialPct(30);
    setDecoupleAnomalies(true);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
        <div className="spinner" />
        <p style={{ color: "var(--text-tertiary)" }}>Initializing simulation models...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header animate-fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Sliders size={28} style={{ color: "var(--teal-400)" }} />
            <h1>Decarbonization What-If Simulator</h1>
          </div>
          <p>
            Simulate operational decarbonization pathways in real time. Adjust logistics modal shifts, clean power adoption, and circular material sourcing.
          </p>
        </div>

        <button onClick={resetDefaults} className="btn btn-secondary btn-sm" id="reset-scenario-btn">
          <RotateCcw size={14} />
          Reset Baseline
        </button>
      </div>

      {/* 1-Click Decarbonization Speedrun Strip */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>1-Click Decarbonization Speedruns</span>
              <span className="text-[10px] text-amber-400 font-mono font-semibold">GEN-Z PRESETS 🔥</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Select an aggressive scenario preset to simulate immediate carbon collapse
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => applyPreset("netzero")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activePreset === "netzero"
                ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20"
            }`}
          >
            <span>🚀</span>
            <span>Net-Zero Speedrun</span>
          </button>

          <button
            onClick={() => applyPreset("freight")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activePreset === "freight"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-105"
                : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
            }`}
          >
            <span>🚆</span>
            <span>Ground the Freight</span>
          </button>

          <button
            onClick={() => applyPreset("outliers")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activePreset === "outliers"
                ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105"
                : "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
            }`}
          >
            <span>✂️</span>
            <span>Outlier Purge</span>
          </button>

          <button
            onClick={() => applyPreset("circular")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activePreset === "circular"
                ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105"
                : "bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20"
            }`}
          >
            <span>🌿</span>
            <span>Max Circularity</span>
          </button>
        </div>
      </div>

      {/* KPI Abatement Summary */}
      <div className="kpi-grid animate-fade-in-up">
        <GlassCard variant="interactive" glowColor="emerald">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingDown size={20} style={{ color: "var(--emerald-400)" }} />
            <span style={{ fontWeight: 700 }}>Emission Abatement</span>
          </div>
          <div className="kpi-value" style={{ marginTop: "12px", color: "var(--emerald-400)" }}>
            -{(simulationResults.reductionTotal / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
            <span style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>tCO₂e</span>
          </div>
          <div className="kpi-label">Target CO₂ Reduction in Scenario</div>
          <div className="badge badge-success" style={{ marginTop: "10px" }}>
            {simulationResults.pctReduction}% Overall Reduction
          </div>
        </GlassCard>

        <GlassCard variant="interactive" glowColor="amber">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DollarSign size={20} style={{ color: "var(--amber-400)" }} />
            <span style={{ fontWeight: 700 }}>Carbon Tax Savings</span>
          </div>
          <div className="kpi-value" style={{ marginTop: "12px", color: "var(--amber-400)" }}>
            ${simulationResults.costSavingsUsd.toLocaleString()}
          </div>
          <div className="kpi-label">Projected CBAM / Carbon Credit Savings</div>
          <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Based on $85/tonne EU ETS benchmark
          </div>
        </GlassCard>

        <GlassCard variant="interactive" glowColor="teal">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Leaf size={20} style={{ color: "var(--teal-400)" }} />
            <span style={{ fontWeight: 700 }}>Projected Target</span>
          </div>
          <div className="kpi-value" style={{ marginTop: "12px" }}>
            {(simulationResults.scenarioTotal / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
            <span style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>tCO₂e</span>
          </div>
          <div className="kpi-label">Simulated Annual Scope 3 Footprint</div>
          <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "var(--emerald-400)" }}>
            Baseline: {(simulationResults.baselineTotal / 1000).toLocaleString()} tCO₂e
          </div>
        </GlassCard>
      </div>

      {/* Control Sliders & Scenario Comparison */}
      <div className="dashboard-grid animate-fade-in-up" style={{ marginTop: "24px" }}>
        {/* Sliders Panel */}
        <GlassCard variant="heavy">
          <div className="section-title">
            <Sparkles size={18} style={{ color: "var(--emerald-400)" }} />
            <h2>Scenario Levers & Interventions</h2>
            <div className="section-line" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "16px" }}>
            {/* Lever 1: Air to Rail Shift */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Air-to-Rail Freight Shift
                </label>
                <span style={{ fontWeight: 700, color: "var(--emerald-400)" }}>
                  {airToRailShift}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={airToRailShift}
                onChange={(e) => setAirToRailShift(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--emerald-500)", cursor: "pointer" }}
              />
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                Converts expedited air corridors to intermodal rail & coastal sea routes.
              </div>
            </div>

            {/* Lever 2: Renewable Energy Adoption */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Supplier Renewable PPA Transition
                </label>
                <span style={{ fontWeight: 700, color: "var(--teal-400)" }}>
                  {renewableEnergyPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={renewableEnergyPct}
                onChange={(e) => setRenewableEnergyPct(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--teal-500)", cursor: "pointer" }}
              />
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                Incentivizes Tier 1 & Tier 2 factories to adopt on-site solar & clean grid tariffs.
              </div>
            </div>

            {/* Lever 3: Recycled Materials */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Recycled & Circular Material Share
                </label>
                <span style={{ fontWeight: 700, color: "var(--blue-400)" }}>
                  {recycledMaterialPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={recycledMaterialPct}
                onChange={(e) => setRecycledMaterialPct(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--blue-500)", cursor: "pointer" }}
              />
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                Substitutes virgin primary steel and plastics with low-carbon recycled feedstock.
              </div>
            </div>

            {/* Lever 4: Anomaly Decoupling Toggle */}
            <div className="glass-subtle" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Decouple Outlier Anomalies
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                  Auto-substitute top extreme emitters flagged by Isolation Forest
                </div>
              </div>
              <button
                onClick={() => setDecoupleAnomalies(!decoupleAnomalies)}
                className={`btn btn-sm ${decoupleAnomalies ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "6px 16px" }}
              >
                {decoupleAnomalies ? "Active" : "Disabled"}
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Comparison Chart */}
        <GlassCard>
          <div className="section-title">
            <h2>Baseline vs. Scenario Comparison (tCO₂e)</h2>
            <div className="section-line" />
          </div>
          <div style={{ height: "320px", marginTop: "12px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="category" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-tooltip">
                          <div className="tooltip-label">{payload[0].payload.category}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
                            Baseline: <strong>{payload[0].value} tCO₂e</strong>
                          </div>
                          <div style={{ color: "var(--emerald-400)", fontSize: "0.8125rem", marginTop: "2px" }}>
                            Simulated: <strong>{payload[1].value} tCO₂e</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="Baseline" fill="rgba(255, 255, 255, 0.2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Simulated" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: "20px", padding: "12px 16px", borderRadius: "var(--radius-md)", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.8125rem", color: "var(--emerald-400)" }}>
            <CheckCircle2 size={16} />
            <span>
              This scenario achieves <strong>{simulationResults.pctReduction}% reduction</strong>, exceeding the 2030 Science-Based Target initiative (SBTi) 42% requirement!
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: "100px auto" }} />}>
      <SimulatorContent />
    </Suspense>
  );
}
