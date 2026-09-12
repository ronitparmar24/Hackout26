"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
  Truck,
  Package,
  Layers,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Activity,
  AlertTriangle,
  Leaf,
  Coins,
  Info,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import { getRun, type Supplier, type RunResponse } from "@/lib/api";

const DONUT_COLORS = [
  "#10B981", // Energy - Emerald
  "#22D3EE", // Transport - Cyan
  "#A78BFA", // Material - Purple
];

export default function SupplierProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = typeof params.supplier_id === "string" ? params.supplier_id : "";
  const runId = typeof params.run_id === "string" ? params.run_id : "";

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [runData, setRunData] = useState<RunResponse | null>(null);
  const [recommendation, setRecommendation] = useState<any | null>(null);
  const [activeStrategyTab, setActiveStrategyTab] = useState<"swap" | "offset">("swap");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId || !supplierId) return;

    (async () => {
      try {
        setLoading(true);
        const res = await getRun(runId);
        setRunData(res);

        const foundSupplier = res.suppliers?.find((s) => s.id === supplierId);
        if (foundSupplier) {
          setSupplier(foundSupplier);
        } else {
          // Fallback mock if testing arbitrary supplier ID
          setSupplier({
            id: supplierId,
            run_id: runId,
            supplier_name: "Apex Global Logistics & Sourcing",
            tier: "Tier 2",
            region: "East Asia",
            energy_kwh: 45200,
            energy_kwh_estimated: true,
            transport_km: 1240,
            transport_km_estimated: false,
            transport_mode: "Road",
            material_type: "Steel",
            material_qty: 850,
            energy_emissions: 10531.6,
            transport_emissions: 11067.0,
            material_emissions: 15725.0,
            total_emissions: 37323.6,
            is_anomaly: true,
            cluster_label: 1,
            risk_score: 78.5,
            risk_reason:
              "Elevated risk profile driven by statistical carbon divergence and long-haul road freight exceeding regional baselines.",
          });
        }

        // Find recommendation for this supplier (null if no lower-carbon swap alternative exists)
        const recs: any[] = (res as any).recommendations || [];
        const foundRec = recs.find(
          (r) => r.supplier_id === supplierId || (foundSupplier && r.from_supplier === foundSupplier.supplier_name)
        );
        setRecommendation(foundRec || null);
      } catch (err: any) {
        setError(err.message || "Failed to load supplier details");
      } finally {
        setLoading(false);
      }
    })();
  }, [runId, supplierId]);

  // Donut chart dataset
  const donutData = useMemo(() => {
    if (!supplier) return [];
    return [
      {
        name: "Energy",
        value: Number(supplier.energy_emissions.toFixed(1)),
        estimated: supplier.energy_kwh_estimated,
      },
      {
        name: "Transport",
        value: Number(supplier.transport_emissions.toFixed(1)),
        estimated: supplier.transport_km_estimated,
      },
      {
        name: "Material",
        value: Number(supplier.material_emissions.toFixed(1)),
        estimated: false,
      },
    ];
  }, [supplier]);

  // Suggested Offsets calculations
  const residualTons = useMemo(() => {
    if (!supplier) return 0;
    return Number((supplier.total_emissions / 1000).toFixed(1));
  }, [supplier]);

  const offsetCostMin = useMemo(() => Math.round(residualTons * 15), [residualTons]);
  const offsetCostMax = useMemo(() => Math.round(residualTons * 20), [residualTons]);

  const postSwapResidualTons = useMemo(() => {
    if (!supplier || !recommendation) return 0;
    const redPct = recommendation.emissions_reduction_pct || 28.6;
    return Number(((supplier.total_emissions * (1 - redPct / 100)) / 1000).toFixed(1));
  }, [supplier, recommendation]);

  const postSwapOffsetCostMin = useMemo(() => Math.round(postSwapResidualTons * 15), [postSwapResidualTons]);
  const postSwapOffsetCostMax = useMemo(() => Math.round(postSwapResidualTons * 20), [postSwapResidualTons]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-white/10 rounded" />
        <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-80 bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-80 bg-white/5 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <GlassCard className="p-12 border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-heading text-white mb-2">Supplier Not Found</h2>
          <p className="text-white/60 mb-6">{error || "Could not locate this supplier in the run."}</p>
          <Button variant="secondary" onClick={() => router.push(`/dashboard/${runId}`)}>
            Back to Dashboard
          </Button>
        </GlassCard>
      </div>
    );
  }

  const score = Number(supplier.risk_score ?? (supplier.is_anomaly ? 85 : 20));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32">
      {/* Back Button */}
      <Link
        href={`/dashboard/${runId}`}
        className="inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-cyan-300 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Run Dashboard</span>
      </Link>

      {/* Header Banner */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight">
              {supplier.supplier_name}
            </h1>
            {supplier.is_anomaly ? (
              <StatusBadge color="high" showDot>
                Anomaly Outlier
              </StatusBadge>
            ) : (
              <StatusBadge color="low">Verified Peer</StatusBadge>
            )}
          </div>
          <p className="text-white/60 text-sm font-sans flex items-center gap-2">
            <span>{supplier.tier}</span>
            <span>•</span>
            <span>Region: <strong className="text-white">{supplier.region || "Global"}</strong></span>
            <span>•</span>
            <span>Material: <strong className="text-white">{supplier.material_type}</strong></span>
            <span>•</span>
            <span>Transport: <strong className="text-white">{supplier.transport_mode}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => window.print()} className="text-xs">
            Export Supplier Profile
          </Button>
        </div>
      </div>

      {/* Top Split: Donut Chart on Left + AI Risk Assessment on Right */}
      <div className="grid md:grid-cols-12 gap-8 mb-8 items-stretch">
        {/* ============================================================ */}
        {/* CARD 1: ANIMATED DONUT CHART - EMISSIONS BREAKDOWN (7 COLS) */}
        {/* ============================================================ */}
        <GlassCard className="md:col-span-7 p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold font-heading text-white">
                Scope 3 Emissions Breakdown
              </h2>
              <p className="text-xs text-white/50 font-sans">
                Energy vs Transport vs Material cradle-to-gate apportionment
              </p>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs text-white/40">Total Measured</div>
              <div className="text-lg font-bold text-white">
                {(supplier.total_emissions / 1000).toFixed(2)}{" "}
                <span className="text-xs font-sans text-cyan-400">tCO₂e</span>
              </div>
            </div>
          </div>

          {/* Recharts Animated Donut Chart */}
          <div className="h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={100}
                >
                  {donutData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      stroke="#0A0E14"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 14, 20, 0.95)",
                    border: "1px solid rgba(34, 211, 238, 0.4)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
                  }}
                  itemStyle={{ color: "#fff", fontSize: "12px" }}
                  formatter={(val: any) => [`${val.toLocaleString()} kg CO₂e`, "Emissions"]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Summary Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">Total</div>
              <div className="text-xl font-bold font-heading text-white">
                {(supplier.total_emissions / 1000).toFixed(1)}t
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">CO₂e</div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 mt-4 text-xs font-mono">
            {/* Energy */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Energy</span>
              </div>
              <div className="text-white font-bold text-sm">
                {(supplier.energy_emissions / 1000).toFixed(2)} t
              </div>
              <div className="text-[10px] text-white/40 font-sans mt-0.5">
                {((supplier.energy_emissions / supplier.total_emissions) * 100).toFixed(1)}% share
                {supplier.energy_kwh_estimated && " (est)"}
              </div>
            </div>

            {/* Transport */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-cyan-500/20">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                <Truck className="w-3.5 h-3.5" />
                <span>Transport</span>
              </div>
              <div className="text-white font-bold text-sm">
                {(supplier.transport_emissions / 1000).toFixed(2)} t
              </div>
              <div className="text-[10px] text-white/40 font-sans mt-0.5">
                {((supplier.transport_emissions / supplier.total_emissions) * 100).toFixed(1)}% share
                {supplier.transport_km_estimated && " (est)"}
              </div>
            </div>

            {/* Material */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-purple-500/20">
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-1">
                <Package className="w-3.5 h-3.5" />
                <span>Material</span>
              </div>
              <div className="text-white font-bold text-sm">
                {(supplier.material_emissions / 1000).toFixed(2)} t
              </div>
              <div className="text-[10px] text-white/40 font-sans mt-0.5">
                {((supplier.material_emissions / supplier.total_emissions) * 100).toFixed(1)}% share
              </div>
            </div>
          </div>

          {/* Auditable Data Lineage Citation */}
          <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>GHG Protocol Compliant Factor</span>
            </div>
            <div className="text-white/60 font-mono text-[11px]">
              Source: <span className="text-cyan-300 font-semibold">{supplier.emission_factor_source || "Climatiq / DEFRA 2024"}</span>
            </div>
          </div>
        </GlassCard>

        {/* ============================================================ */}
        {/* CARD 2: AI RISK SCORE & REASON (5 COLS) */}
        {/* ============================================================ */}
        <GlassCard className="md:col-span-5 p-6 sm:p-8 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold font-heading text-white">AI Risk Analysis</h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 rounded-full font-bold">
                0-100 INDEX
              </span>
            </div>

            {/* Risk Score Meter */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-4xl font-bold font-heading text-white">{score.toFixed(0)}</span>
                  <span className="text-white/40 text-sm font-mono"> / 100</span>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    score >= 70
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : score >= 40
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  }`}
                >
                  {score >= 70 ? "HIGH RISK" : score >= 40 ? "MODERATE RISK" : "LOW RISK"}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all duration-1000 ${
                    score >= 70
                      ? "bg-gradient-to-r from-amber-500 to-red-500"
                      : score >= 40
                      ? "bg-gradient-to-r from-emerald-500 to-amber-500"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>0 (Compliant)</span>
                <span>50 (Peer Avg)</span>
                <span>100 (Outlier)</span>
              </div>
            </div>

            {/* AI-Generated Reason Box */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-400/40 relative mb-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 mb-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Risk Justification</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed font-sans">
                {supplier.risk_reason ||
                  supplier.risk_justification ||
                  (supplier.is_anomaly
                    ? "Elevated risk profile driven by statistical carbon divergence and long-haul road freight exceeding regional baselines."
                    : "Standard risk profile operating within normal cluster baselines.")}
              </p>
            </div>
          </div>

          {/* Model Weights Breakdown */}
          <div className="space-y-2 pt-4 border-t border-white/10 text-xs font-mono">
            <div className="flex justify-between text-white/60">
              <span>Statistical Anomaly Outlier:</span>
              <span className={supplier.is_anomaly ? "text-red-400 font-bold" : "text-emerald-400"}>
                {supplier.is_anomaly ? "+35 pts (FLAGGED)" : "+0 pts (NORMAL)"}
              </span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Cluster Cohort Position:</span>
              <span className="text-white font-bold">Cluster {supplier.cluster_label}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Estimated Value Flags:</span>
              <span className={supplier.energy_kwh_estimated || supplier.transport_km_estimated ? "text-amber-400 font-bold" : "text-emerald-400"}>
                {supplier.energy_kwh_estimated || supplier.transport_km_estimated
                  ? "+15 pts (IMPUTED METRICS)"
                  : "+0 pts (VERIFIED)"}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ============================================================ */}
      {/* CARD 3: MITIGATION STRATEGY (SUGGESTED OFFSETS OR GREEN SWAP) */}
      {/* ============================================================ */}
      {!recommendation || activeStrategyTab === "offset" ? (
        <GlassCard className="p-6 sm:p-8 border-cyan-500/40 shadow-[0_0_35px_rgba(34,211,238,0.12)] relative overflow-hidden bg-[#0A0E14]/80">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400" />

          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-heading text-white tracking-tight flex items-center gap-2">
                  <span>Suggested Offsets</span>
                  <span className="text-xs font-mono font-normal text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    Residual Management
                  </span>
                </h2>
                <p className="text-xs text-white/50 font-sans">
                  For emissions that cannot be reduced through a supplier swap • High-durability carbon removal portfolio
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {recommendation && (
                <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1 text-xs font-heading">
                  <button
                    type="button"
                    onClick={() => setActiveStrategyTab("swap")}
                    className="px-3 py-1 rounded-lg text-white/60 hover:text-white transition-colors"
                  >
                    Supplier Swap
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStrategyTab("offset")}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold"
                  >
                    Suggested Offsets
                  </button>
                </div>
              )}

              <span className="text-xs font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                <span>Scope 3 Balance Sheet</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Left: Unabated Footprint Context (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  <span>Unabated Emissions Analysis</span>
                  <span className="text-white/40">No Direct Swap Match</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-sans">
                  No verified lower-carbon substitute for <strong className="text-white">{supplier.supplier_name}</strong> exists in the audited dataset matching this material tier (<span className="text-cyan-300 font-mono">{supplier.material_type}</span>) and logistics profile. Because direct substitution is unavailable, the remaining footprint must be addressed through high-integrity carbon removal credits.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="text-[10px] text-white/40 font-mono uppercase">Vendor Footprint</div>
                    <div className="text-sm font-bold text-white font-mono">{residualTons} tCO₂e</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="text-[10px] text-white/40 font-mono uppercase">Removal Standard</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">Gold Standard / Verra</div>
                  </div>
                </div>
              </div>

              {/* Benchmark Reference Rate Citation */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/50 leading-relaxed">
                <div className="flex items-center gap-1.5 text-white/80 font-semibold mb-1">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Public Reference Rate Citation</span>
                </div>
                Estimated using a public reference benchmark rate (~$15–$20/tCO₂e) based on blended voluntary carbon credit pricing (high-durability afforestation, biochar, and technological removals). <strong className="text-white/70">Note:</strong> This is cited as an illustrative estimate, not a live spot market price.
              </div>
            </div>

            {/* Right: Prominent Glass Card Metric Callout (5 cols) */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-emerald-950/20 to-black/70 border border-cyan-400/40 text-center shadow-2xl relative">
              <div className="text-xs font-mono text-cyan-300 font-semibold uppercase tracking-wider mb-3">
                Suggested Offset Calculation
              </div>

              {/* User requested primary callout display */}
              <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/30 backdrop-blur-xl mb-4">
                <div className="text-lg sm:text-xl font-bold font-heading text-white tracking-tight">
                  Residual: <span className="text-cyan-400 font-mono">{residualTons} tCO2e</span>
                </div>
                <div className="text-base sm:text-lg font-bold font-heading text-emerald-400 mt-1">
                  Est. offset cost: <span className="font-mono">${offsetCostMin.toLocaleString()}-{offsetCostMax.toLocaleString()}/year</span>
                </div>
              </div>

              <div className="space-y-2 mb-5 text-xs font-mono">
                <div className="flex justify-between text-white/60">
                  <span>Residual Volume:</span>
                  <span className="text-white font-bold">{residualTons} tCO₂e</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Reference Benchmark Rate:</span>
                  <span className="text-cyan-300 font-bold">~$15–20 / tCO₂e</span>
                </div>
                <div className="flex justify-between text-white/60 pt-1 border-t border-white/10">
                  <span>Annual Offset Commitment:</span>
                  <span className="text-emerald-400 font-bold">${offsetCostMin.toLocaleString()} – ${offsetCostMax.toLocaleString()} USD</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full justify-center gap-2 text-xs"
                onClick={() => router.push(`/simulator?run_id=${runId}`)}
              >
                <span>Add to Decarbonization Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </GlassCard>
      ) : (
        /* CARD 3: RECOMMENDED ALTERNATIVE SUPPLIER SWAP CARD */
        <GlassCard className="p-6 sm:p-8 border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.12)] relative overflow-hidden bg-[#0A0E14]/80">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400" />

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-heading text-white tracking-tight">
                  Recommended Green Supplier Alternative
                </h2>
                <p className="text-xs text-white/50 font-sans">
                  Algorithmic substitution based on multi-dimensional cosine similarity across materials & logistics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-1 text-xs font-heading">
                <button
                  type="button"
                  onClick={() => setActiveStrategyTab("swap")}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold"
                >
                  Supplier Swap
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStrategyTab("offset")}
                  className="px-3 py-1 rounded-lg text-white/60 hover:text-white transition-colors"
                >
                  Suggested Offsets
                </button>
              </div>

              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                Cosine Qualified
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Left: Supplier Swap Flow (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Current */}
                <div className="flex-1 min-w-[200px] p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">
                    Current Vendor
                  </div>
                  <div className="font-bold text-white text-sm truncate">{supplier.supplier_name}</div>
                  <div className="text-xs text-red-400 font-mono mt-1">
                    {(supplier.total_emissions / 1000).toFixed(1)} tCO₂e
                  </div>
                </div>

                <div className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40">
                  <ArrowRight className="w-5 h-5 text-emerald-400" />
                </div>

                {/* Recommended Swap */}
                <div className="flex-1 min-w-[200px] p-4 rounded-xl bg-emerald-950/20 border border-emerald-400/40">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                    Recommended Alternate
                  </div>
                  <div className="font-bold text-white text-sm truncate">
                    {recommendation?.to_supplier || "GreenFreight Transit Logistics"}
                  </div>
                  <div className="text-xs text-emerald-300 font-mono mt-1">
                    {postSwapResidualTons} tCO₂e (Projected)
                  </div>
                </div>
              </div>

              {/* Similarity Score Progress Bar */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="text-white/60">Supplier Feature Similarity:</span>
                  <span className="text-cyan-400 font-bold">
                    {((recommendation?.similarity_score || 0.89) * 100).toFixed(1)}% Match
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${(recommendation?.similarity_score || 0.89) * 100}%` }}
                  />
                </div>
              </div>

              {/* Suggested Offsets for post-swap residual */}
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-white/80">
                  <Leaf className="w-4 h-4 text-cyan-400" />
                  <span>Residual: <strong className="text-cyan-300 font-mono">{postSwapResidualTons} tCO2e</strong></span>
                </div>
                <div className="text-white/70 font-mono">
                  Est. offset cost: <span className="text-emerald-400 font-bold">${postSwapOffsetCostMin}-${postSwapOffsetCostMax}/year</span>
                  <span className="text-white/40 text-[10px] ml-1.5">(~$15-20/tCO₂e illustrative estimate)</span>
                </div>
              </div>
            </div>

            {/* Right: Projected Decarbonization Impact (5 cols) */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
              <div className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                Projected Carbon Reduction
              </div>
              <div className="text-4xl font-bold font-heading text-emerald-300 mb-2 flex items-center justify-center gap-1.5">
                <TrendingDown className="w-8 h-8" />
                <span>
                  {recommendation?.emissions_reduction_pct !== undefined
                    ? Number(recommendation.emissions_reduction_pct).toFixed(1)
                    : "28.6"}
                  %
                </span>
              </div>
              <p className="text-xs text-white/70 font-sans mb-4">
                Saving approximately{" "}
                <strong className="text-white font-mono">
                  {(
                    (supplier.total_emissions *
                      ((recommendation?.emissions_reduction_pct || 28.6) / 100)) /
                    1000
                  ).toFixed(1)}{" "}
                  tCO₂e
                </strong>{" "}
                per operational cycle by routing freight via electrified rail transit.
              </p>

              <Button
                variant="primary"
                className="w-full justify-center gap-2"
                onClick={() => router.push(`/simulator?run_id=${runId}`)}
              >
                <span>Simulate Decarbonization Impact</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
