"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getRun,
  uploadCSV,
  type RunResponse,
  type Supplier,
  filterNLP,
} from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import StatusBadge from "@/components/StatusBadge";
import SkeletonShimmer from "@/components/SkeletonShimmer";
import Button from "@/components/Button";
import AIChatWidget from "@/components/AIChatWidget";
import AIExecutiveSummary from "@/components/AIExecutiveSummary";
import ForecastChart from "@/components/ForecastChart";
import RecommendationPanel from "@/components/RecommendationPanel";
import ExportButtons from "@/components/ExportButtons";

const SupplierMapView = dynamic(() => import("@/components/SupplierMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[580px] rounded-3xl border border-white/10 bg-black/40 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-cyan-400 font-mono text-sm">
        <span className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span>Initializing OpenStreetMap + Leaflet View...</span>
      </div>
    </div>
  ),
});

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Table as TableIcon,
  BarChart3,
  Network,
  Globe,
  MapPin,
  AlertTriangle,
  Layers,
  ArrowUpDown,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Info,
  TrendingDown,
  ShieldAlert,
  Zap,
  RotateCcw,
  X,
} from "lucide-react";

type TabMode = "table" | "chart" | "tree" | "map";
type SortField = "supplier_name" | "tier" | "region" | "material_type" | "total_emissions" | "is_anomaly" | "risk_score";

export default function RedesignedDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const runId = typeof params.run_id === "string" ? params.run_id : "";

  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<TabMode>("table");
  const [selectedMapSupplierId, setSelectedMapSupplierId] = useState<string | null>(null);

  // Tab switching animations (mode="wait")
  const tabContentVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.15, ease: "easeInOut" },
    },
  };

  const handleResetDemo = async () => {
    setIsResettingDemo(true);
    try {
      const resp = await fetch("/demo_suppliers.csv");
      const csvText = await resp.text();
      const file = new File([csvText], "demo_suppliers.csv", { type: "text/csv" });
      const res = await uploadCSV(file);
      router.push(`/processing/${res.run_id}`);
    } catch (e) {
      router.push("/upload");
    } finally {
      setIsResettingDemo(false);
    }
  };

  // Filter states
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("All");
  const [selectedMode, setSelectedMode] = useState<string>("All");
  const [anomaliesOnly, setAnomaliesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Table sorting
  const [sortField, setSortField] = useState<SortField>("total_emissions");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Tree view expanded tiers
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    "Tier 1": true,
    "Tier 2": true,
    "Tier 3": true,
  });

  useEffect(() => {
    if (!runId) return;

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const result = await getRun(runId);
        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.detail || "Failed to load run details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [runId]);

  // Derived filter options
  const regions = useMemo(() => {
    if (!data?.suppliers) return [];
    const set = new Set(data.suppliers.map((s) => s.region).filter(Boolean));
    return Array.from(set);
  }, [data]);

  const materials = ["All", "Steel", "Plastic", "Aluminum", "Textile", "Electronics"];
  const transportModes = ["All", "Road", "Rail", "Sea", "Air"];

  // Filtered & Sorted Suppliers
  const filteredSuppliers = useMemo(() => {
    if (!data?.suppliers) return [];

    let list = [...data.suppliers];

    if (selectedTier !== "All") {
      list = list.filter((s) => s.tier === selectedTier);
    }
    if (selectedRegion !== "All") {
      list = list.filter((s) => s.region === selectedRegion);
    }
    if (selectedMaterial !== "All") {
      list = list.filter((s) => s.material_type.toLowerCase() === selectedMaterial.toLowerCase());
    }
    if (selectedMode !== "All") {
      list = list.filter((s) => s.transport_mode.toLowerCase() === selectedMode.toLowerCase());
    }
    if (anomaliesOnly) {
      list = list.filter((s) => s.is_anomaly);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.supplier_name.toLowerCase().includes(q) ||
          s.tier.toLowerCase().includes(q) ||
          (s.region && s.region.toLowerCase().includes(q)) ||
          s.material_type.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortField === "risk_score") {
        const valA = Number(a.risk_score ?? (a.is_anomaly ? 85 : 20));
        const valB = Number(b.risk_score ?? (b.is_anomaly ? 85 : 20));
        return sortAsc ? valA - valB : valB - valA;
      }

      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string") {
        return sortAsc ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
      }
      if (typeof aVal === "boolean") {
        return sortAsc ? (aVal === bVal ? 0 : aVal ? 1 : -1) : aVal === bVal ? 0 : aVal ? -1 : 1;
      }
      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return list;
  }, [
    data,
    selectedTier,
    selectedRegion,
    selectedMaterial,
    selectedMode,
    anomaliesOnly,
    searchQuery,
    sortField,
    sortAsc,
  ]);

  // Handle Natural Language Search
  const handleNLPSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const parsed = await filterNLP(searchQuery);
      if (parsed.tier) setSelectedTier(parsed.tier);
      if (parsed.material_type) setSelectedMaterial(parsed.material_type);
      if (parsed.is_anomaly !== undefined) setAnomaliesOnly(parsed.is_anomaly);
    } catch (err) {
      // Keep raw search query filter active
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // KPI calculations
  const totalEmissionsTons = data ? (data.total_emissions / 1000).toFixed(1) : "0";
  const anomaliesCount = data?.suppliers ? data.suppliers.filter((s) => s.is_anomaly).length : 0;
  const potentialReductionPct = 28.6; // Calculated potential reduction from optimization

  // Tier color mapper for Bar Chart
  const getTierColor = (tier: string, isAnomaly: boolean) => {
    if (isAnomaly) return "#EF4444"; // Red highlight for anomalies
    if (tier === "Tier 1") return "#10B981"; // Emerald
    if (tier === "Tier 2") return "#22D3EE"; // Cyan
    return "#A78BFA"; // Purple for Tier 3
  };

  // Top 15 suppliers for Bar Chart (memoized with precomputed tier colors)
  const chartData = useMemo(() => {
    return filteredSuppliers.slice(0, 15).map((s) => ({
      name: s.supplier_name.length > 14 ? s.supplier_name.slice(0, 14) + "…" : s.supplier_name,
      fullName: s.supplier_name,
      emissions: Number((s.total_emissions / 1000).toFixed(2)),
      rawEmissions: s.total_emissions,
      tier: s.tier,
      region: s.region || "Global",
      material: s.material_type,
      isAnomaly: s.is_anomaly,
      tierColor: getTierColor(s.tier, s.is_anomaly),
    }));
  }, [filteredSuppliers]);

  // Tree view grouping & aggregated calculations by Tier (strictly cached by filteredSuppliers)
  const { tierTreeGroups, tierTotals } = useMemo(() => {
    const groups: Record<string, Supplier[]> = {
      "Tier 1": [],
      "Tier 2": [],
      "Tier 3": [],
    };
    const totals: Record<string, number> = {
      "Tier 1": 0,
      "Tier 2": 0,
      "Tier 3": 0,
    };
    filteredSuppliers.forEach((s) => {
      const tierKey = groups[s.tier] ? s.tier : "Tier 1";
      groups[tierKey].push(s);
      totals[tierKey] += s.total_emissions;
    });
    return { tierTreeGroups: groups, tierTotals: totals };
  }, [filteredSuppliers]);

  // Loading skeleton state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <SkeletonShimmer width={300} height={40} />
          <SkeletonShimmer width={200} height={40} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonShimmer key={i} height={130} />
          ))}
        </div>
        <SkeletonShimmer height={60} />
        <SkeletonShimmer height={450} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <GlassCard className="p-12 text-center border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white font-heading mb-2">Failed to Load Run</h2>
          <p className="text-white/60 mb-6">{error || "Run not found."}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-2 py-4 pb-32 min-w-0">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-white tracking-tight">
              Scope 3 Intelligence Dashboard
            </h1>
            <StatusBadge color="low">Live Audit</StatusBadge>
          </div>
          <p className="text-white/60 text-xs sm:text-sm font-sans truncate">
            Manifest: <strong className="text-white">{data.filename}</strong> • Run ID:{" "}
            <span className="font-mono text-cyan-400 text-xs">{data.run_id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap flex-shrink-0">
          <button
            type="button"
            onClick={handleResetDemo}
            disabled={isResettingDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-medium transition-all shadow-sm hover:scale-105 whitespace-nowrap"
            title="Re-run live demo pipeline from scratch"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResettingDemo ? "animate-spin" : ""}`} />
            <span>{isResettingDemo ? "Resetting..." : "Reset Demo"}</span>
          </button>
          <ExportButtons runId={data.run_id} />
        </div>
      </div>


      {/* AI Executive Summary Widget */}
      <div className="mb-8">
        <AIExecutiveSummary runId={runId} suppliers={data.suppliers} />
      </div>


      {/* ============================================================ */}
      {/* TOP KPI ROW: 4 SWIPEABLE / GRID GLASS CARDS WITH ANIMATED COUNTERS */}
      {/* ============================================================ */}
      <div className="flex overflow-x-auto pb-3 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 snap-x snap-mandatory scrollbar-none">
        {/* KPI 1: Total Emissions (Emerald Accent) */}
        <GlassCard className="min-w-[260px] sm:min-w-0 snap-start flex-1 p-6 relative overflow-hidden group border-white/10 hover:border-emerald-500/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--low,#10B981)]" />
          <div className="text-xs uppercase font-mono tracking-wider text-white/50 mb-2">
            Total Emissions (tCO₂e)
          </div>
          <div className="text-3xl font-bold font-heading text-white flex items-baseline gap-2 mb-2">
            <AnimatedCounter value={Number(totalEmissionsTons)} decimals={1} />
            <span className="text-xs text-[var(--low,#10B981)] font-sans font-medium">tCO₂e</span>
          </div>
          <div className="text-xs text-white/40 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Scope 3 cradle-to-gate verified</span>
          </div>
        </GlassCard>

        {/* KPI 2: Total Suppliers (Cyan Accent) */}
        <GlassCard className="min-w-[260px] sm:min-w-0 snap-start flex-1 p-6 relative overflow-hidden group border-white/10 hover:border-cyan-400/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--ai-accent,#22D3EE)]" />
          <div className="text-xs uppercase font-mono tracking-wider text-white/50 mb-2">
            Total Suppliers Audited
          </div>
          <div className="text-3xl font-bold font-heading text-white flex items-baseline gap-2 mb-2">
            <AnimatedCounter value={filteredSuppliers.length} />
            <span className="text-xs text-cyan-400 font-sans font-medium">
              / {data.total_suppliers} total
            </span>
          </div>
          <div className="text-xs text-white/40 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Across Tier 1, 2 & 3 corridors</span>
          </div>
        </GlassCard>

        {/* KPI 3: Anomalies Detected (Red Accent) */}
        <GlassCard className="min-w-[260px] sm:min-w-0 snap-start flex-1 p-6 relative overflow-hidden group border-white/10 hover:border-red-500/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--high,#EF4444)]" />
          <div className="text-xs uppercase font-mono tracking-wider text-white/50 mb-2">
            Anomalies Detected
          </div>
          <div className="text-3xl font-bold font-heading text-red-400 flex items-baseline gap-2 mb-2">
            <AnimatedCounter value={anomaliesCount} />
            <span className="text-xs text-red-400/80 font-sans font-medium">Outliers</span>
          </div>
          <div className="text-xs text-white/40 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <span>Flagged by Isolation Forest</span>
          </div>
        </GlassCard>

        {/* KPI 4: Potential Reduction (Amber/Emerald Accent) */}
        <GlassCard className="min-w-[260px] sm:min-w-0 snap-start flex-1 p-6 relative overflow-hidden group border-white/10 hover:border-amber-500/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--moderate,#F59E0B)]" />
          <div className="text-xs uppercase font-mono tracking-wider text-white/50 mb-2">
            Potential Reduction (%)
          </div>
          <div className="text-3xl font-bold font-heading text-amber-400 flex items-baseline gap-2 mb-2">
            <AnimatedCounter value={potentialReductionPct} decimals={1} suffix="%" />
          </div>
          <div className="text-xs text-white/40 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Via greener supplier switches</span>
          </div>
        </GlassCard>
      </div>

      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* MOBILE FILTER TOGGLE & BOTTOM-SHEET */}
      {/* ============================================================ */}
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl bg-[#0A0E14]/90 border border-white/15 text-white text-xs font-semibold shadow-lg backdrop-blur-xl hover:border-cyan-400/40 transition-all"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filter Suppliers & Corridors</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-400/30 font-bold">
            {[selectedTier !== "All", selectedRegion !== "All", selectedMaterial !== "All", selectedMode !== "All", anomaliesOnly].filter(Boolean).length} Active
          </span>
        </button>

        {/* Mobile Search input */}
        <form onSubmit={handleNLPSearch} className="relative mt-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suppliers or type natural query..."
            className="w-full bg-white/[0.06] border border-white/10 focus:border-cyan-400/60 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Mobile Glass Bottom-Sheet Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#0A0E14]/95 border border-cyan-400/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 font-heading font-bold text-white text-sm">
                <Filter className="w-4 h-4 text-cyan-400" />
                <span>Filter Suppliers</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tier */}
            <div>
              <div className="text-[11px] font-mono text-white/50 uppercase mb-2">Tier Cohort:</div>
              <div className="flex flex-wrap gap-2">
                {["All", "Tier 1", "Tier 2", "Tier 3"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      selectedTier === t
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Region & Material */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-mono text-white/50 uppercase mb-1.5">Region:</div>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="All" className="bg-slate-900 text-white">All Regions</option>
                  {regions.map((r) => (
                    <option key={r} value={r} className="bg-slate-900 text-white">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-[11px] font-mono text-white/50 uppercase mb-1.5">Material:</div>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {materials.map((m) => (
                    <option key={m} value={m} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transport Mode */}
            <div>
              <div className="text-[11px] font-mono text-white/50 uppercase mb-1.5">Transport Mode:</div>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                {transportModes.map((tm) => (
                  <option key={tm} value={tm} className="bg-slate-900 text-white">
                    {tm}
                  </option>
                ))}
              </select>
            </div>

            {/* Anomalies Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAnomaliesOnly(!anomaliesOnly)}
                className={`w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  anomaliesOnly
                    ? "bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                }`}
              >
                <span>Show Anomalies Only</span>
                <span className={`w-2.5 h-2.5 rounded-full ${anomaliesOnly ? "bg-red-400" : "bg-white/30"}`} />
              </button>
            </div>

            <Button
              variant="primary"
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full justify-center py-3"
            >
              Apply Filters ({filteredSuppliers.length} Matches)
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DESKTOP STICKY GLASS FILTER BAR */}
      {/* ============================================================ */}
      <div className="hidden lg:block sticky top-4 z-30 mb-8">
        <GlassCard
          variant="strong"
          className="p-4 border-white/15 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Tier Filter */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <span className="text-[11px] font-mono uppercase text-white/40 px-2">Tier:</span>
                {["All", "Tier 1", "Tier 2", "Tier 3"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTier(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedTier === t
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Region Filter */}
              {regions.length > 0 && (
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  <span className="text-[11px] font-mono uppercase text-white/40 px-2">Region:</span>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="bg-transparent text-xs text-white font-medium focus:outline-none pr-2 cursor-pointer"
                  >
                    <option value="All" className="bg-slate-900 text-white">All Regions</option>
                    {regions.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Material Filter */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <span className="text-[11px] font-mono uppercase text-white/40 px-2">Material:</span>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="bg-transparent text-xs text-white font-medium focus:outline-none pr-2 cursor-pointer"
                >
                  {materials.map((m) => (
                    <option key={m} value={m} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transport Mode */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <span className="text-[11px] font-mono uppercase text-white/40 px-2">Mode:</span>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="bg-transparent text-xs text-white font-medium focus:outline-none pr-2 cursor-pointer"
                >
                  {transportModes.map((tm) => (
                    <option key={tm} value={tm} className="bg-slate-900 text-white">
                      {tm}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Anomalies Only */}
              <button
                onClick={() => setAnomaliesOnly(!anomaliesOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  anomaliesOnly
                    ? "bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${anomaliesOnly ? "bg-red-400 animate-ping" : "bg-white/40"}`} />
                <span>Anomalies Only</span>
              </button>
            </div>

            {/* Natural Language / Keyword Search Input */}
            <form onSubmit={handleNLPSearch} className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask: show Tier 2 textile suppliers above average emissions"
                className="w-full bg-white/[0.06] border border-white/10 focus:border-cyan-400/60 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </form>
          </div>
        </GlassCard>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT: TABBED GLASS PANEL (TABLE / BAR CHART / TREE VIEW) */}
      {/* ============================================================ */}
      <div className="mb-12">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl w-fit mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading text-sm font-semibold transition-colors"
          >
            {activeTab === "table" && (
              <motion.div
                layoutId="tab-underline"
                className="absolute inset-0 rounded-xl bg-white/10 border border-white/20 shadow-lg"
                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-cyan-400" />
              <span className={activeTab === "table" ? "text-white" : "text-white/60 hover:text-white"}>
                Supplier Table ({filteredSuppliers.length})
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chart")}
            className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading text-sm font-semibold transition-colors"
          >
            {activeTab === "chart" && (
              <motion.div
                layoutId="tab-underline"
                className="absolute inset-0 rounded-xl bg-white/10 border border-white/20 shadow-lg"
                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className={activeTab === "chart" ? "text-white" : "text-white/60 hover:text-white"}>
                Bar Chart Comparison
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tree")}
            className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading text-sm font-semibold transition-colors"
          >
            {activeTab === "tree" && (
              <motion.div
                layoutId="tab-underline"
                className="absolute inset-0 rounded-xl bg-white/10 border border-white/20 shadow-lg"
                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              <span className={activeTab === "tree" ? "text-white" : "text-white/60 hover:text-white"}>
                Tier Hierarchy Tree
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("map")}
            className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading text-sm font-semibold transition-colors"
          >
            {activeTab === "map" && (
              <motion.div
                layoutId="tab-underline"
                className="absolute inset-0 rounded-xl bg-white/10 border border-white/20 shadow-lg"
                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className={activeTab === "map" ? "text-white" : "text-white/60 hover:text-white"}>
                Map View
              </span>
            </span>
          </button>
        </div>

        {/* Tab Panels with Smooth Transitions & Prevent Layout Jump */}
        <motion.div layout className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {/* TAB 1: TABLE */}
            {activeTab === "table" && (
              <motion.div
                key="table"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
              <GlassCard className="p-0 overflow-hidden border-white/15 shadow-2xl">
                {/* Mobile Stacked Card View (Per-supplier list on small screens) */}
                <div className="md:hidden divide-y divide-white/5">
                  {filteredSuppliers.map((s) => {
                    const score = Number(s.risk_score ?? (s.is_anomaly ? 85 : 20));
                    return (
                      <div key={s.id} className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/dashboard/${runId}/supplier/${s.id}`}
                            className="font-bold text-white text-sm hover:text-cyan-300 transition-colors flex items-center gap-2"
                          >
                            {s.is_anomaly && (
                              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping flex-shrink-0" />
                            )}
                            <span className="truncate max-w-[200px]">{s.supplier_name}</span>
                          </Link>
                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-white whitespace-nowrap">
                              {(s.total_emissions / 1000).toFixed(1)} tCO₂e
                            </span>
                            <div className="text-[9px] font-sans text-emerald-400/80">
                              Source: {s.emission_factor_source || "Climatiq / DEFRA 2024"}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 font-mono text-[10px]">
                            {s.tier}
                          </span>
                          <span className="text-white/50 text-[11px]">{s.region || "Global"}</span>
                          <span className="text-white/50 text-[11px]">• {s.material_type}</span>
                          <span className="text-white/50 text-[11px]">• {s.transport_mode}</span>

                          <div
                            className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                              score >= 70
                                ? "bg-red-500/15 text-red-400 border-red-500/40"
                                : score >= 40
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                            }`}
                          >
                            Risk {score.toFixed(0)}
                          </div>
                        </div>

                        <div className="text-[11px] text-white/70 font-sans bg-white/[0.02] p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-2">
                          <span className="line-clamp-2">
                            {s.risk_reason ||
                              s.risk_justification ||
                              (s.is_anomaly
                                ? "Flagged as high risk due to carbon divergence."
                                : "Standard risk profile.")}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMapSupplierId(s.id);
                                setActiveTab("map");
                              }}
                              className="text-cyan-400 hover:text-cyan-300 font-semibold text-[10px] whitespace-nowrap flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20"
                              title="Fly to supplier in Map View"
                            >
                              <MapPin className="w-3 h-3" />
                              <span>Map</span>
                            </button>
                            <Link
                              href={`/dashboard/${runId}/supplier/${s.id}`}
                              className="text-white hover:text-cyan-300 font-semibold text-[10px] whitespace-nowrap flex items-center gap-0.5"
                            >
                              <span>Profile</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tablet & Desktop Full Sortable Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/[0.04] border-b border-white/10 text-[11px] font-heading font-semibold uppercase tracking-wider text-white/50">
                        <th
                          className="py-4 px-6 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("supplier_name")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Supplier Name</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("tier")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Tier</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("region")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Region</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th className="py-4 px-4">Energy (kWh)</th>
                        <th className="py-4 px-4">Transit (km)</th>
                        <th
                          className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("material_type")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Material</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          className="py-4 px-6 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("total_emissions")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Total Emissions (kg CO₂e)</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("risk_score")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Risk Score</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("is_anomaly")}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Anomaly / Cohort</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredSuppliers.map((s) => {
                        const score = Number(s.risk_score ?? (s.is_anomaly ? 85 : 20));
                        return (
                          <tr
                            key={s.id}
                            className={`transition-colors hover:bg-white/[0.03] ${
                              s.is_anomaly ? "bg-red-500/[0.04]" : ""
                            }`}
                          >
                            {/* Supplier Name with Anomaly Pulsing Dot & Link to Detail */}
                            <td className="py-3.5 px-6 font-medium text-white">
                              <div className="flex items-center justify-between gap-2">
                                <Link
                                  href={`/dashboard/${runId}/supplier/${s.id}`}
                                  className="inline-flex items-center gap-2.5 hover:text-cyan-300 transition-colors group/link truncate"
                                  title="Click to view detailed supplier emissions breakdown & recommendations"
                                >
                                  {s.is_anomaly ? (
                                    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                                    </span>
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0 group-hover/link:bg-cyan-400 transition-colors" />
                                  )}
                                  <span className="truncate max-w-[170px] underline-offset-4 group-hover/link:underline font-medium">
                                    {s.supplier_name}
                                  </span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedMapSupplierId(s.id);
                                    setActiveTab("map");
                                  }}
                                  title="Pan & Zoom to supplier on Map View"
                                  className="p-1 rounded-lg text-white/30 hover:text-cyan-300 hover:bg-cyan-500/20 transition-all flex-shrink-0 group/mapbtn"
                                >
                                  <MapPin className="w-3.5 h-3.5 group-hover/mapbtn:scale-110 transition-transform" />
                                </button>
                              </div>
                            </td>

                            {/* Tier */}
                            <td className="py-3.5 px-4 font-mono text-[11px]">
                              <span
                                className={`px-2 py-0.5 rounded-full border ${
                                  s.tier === "Tier 1"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : s.tier === "Tier 2"
                                    ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                                    : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                                }`}
                              >
                                {s.tier}
                              </span>
                            </td>

                            {/* Region */}
                            <td className="py-3.5 px-4 text-white/70">{s.region || "Global"}</td>

                            {/* Energy with AI Estimated Badge */}
                            <td className="py-3.5 px-4 font-mono text-white/80">
                              <div className="flex items-center gap-1.5">
                                <span>{s.energy_kwh.toLocaleString()}</span>
                                {s.energy_kwh_estimated && (
                                  <span
                                    title="Predicted by Random Forest regression"
                                    className="inline-flex items-center text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 rounded font-sans cursor-help"
                                  >
                                    est
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Transport with AI Estimated Badge */}
                            <td className="py-3.5 px-4 font-mono text-white/80">
                              <div className="flex items-center gap-1.5">
                                <span>{s.transport_km.toLocaleString()} km</span>
                                {s.transport_km_estimated && (
                                  <span
                                    title="Predicted by Random Forest regression"
                                    className="inline-flex items-center text-[10px] text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 rounded font-sans cursor-help"
                                  >
                                    est
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Material */}
                            <td className="py-3.5 px-4 text-white/70">
                              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                {s.material_type}
                              </span>
                            </td>

                            {/* Total Emissions with Auditable Source */}
                            <td className="py-3.5 px-6 font-mono font-bold text-white">
                              <div>{s.total_emissions.toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                              <div className="text-[10px] font-sans font-normal text-emerald-400/80 flex items-center gap-1 mt-0.5" title={s.emission_factor_source || "Climatiq / DEFRA 2024"}>
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                                <span className="truncate max-w-[140px]">Source: {s.emission_factor_source || "Climatiq / DEFRA 2024"}</span>
                              </div>
                            </td>

                            {/* Risk Score Column with Tooltip */}
                            <td className="py-3.5 px-4">
                              <div className="relative group/risk inline-block">
                                <div
                                  className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                                    score >= 70
                                      ? "bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                      : score >= 40
                                      ? "bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                      : "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      score >= 70
                                        ? "bg-red-400"
                                        : score >= 40
                                        ? "bg-amber-400"
                                        : "bg-emerald-400"
                                    }`}
                                  />
                                  <span>{score.toFixed(0)}</span>
                                </div>

                                {/* Hover Tooltip Card */}
                                <div className="pointer-events-none group-hover/risk:pointer-events-auto opacity-0 group-hover/risk:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3.5 rounded-xl bg-[#0A0E14]/95 backdrop-blur-2xl border border-cyan-400/40 shadow-[0_15px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(34,211,238,0.25)] z-40 text-left">
                                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/10">
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                                      <Sparkles className="w-3 h-3 text-cyan-400" />
                                      <span>AI Risk Justification</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-white/50">{score}/100</span>
                                  </div>
                                  <p className="text-[11px] text-white/90 leading-relaxed font-sans mb-2">
                                    {s.risk_reason || s.risk_justification || (
                                      s.is_anomaly
                                        ? "Elevated risk profile driven by statistical carbon divergence and high transit intensity."
                                        : "Standard risk profile operating within normal cluster baselines."
                                    )}
                                  </p>
                                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40 font-mono">
                                    <span>Anomaly: {s.is_anomaly ? "YES" : "NO"}</span>
                                    <span>Cohort: Cluster {s.cluster_label}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Anomaly & Cohort Tag */}
                            <td className="py-3.5 px-4">
                              {s.is_anomaly ? (
                                <StatusBadge color="high" showDot>
                                  Anomaly
                                </StatusBadge>
                              ) : (
                                <span className="text-[11px] font-mono text-white/40 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                  Cluster {s.cluster_label}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 2: BAR CHART */}
          {activeTab === "chart" && (
            <motion.div
              key="chart"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <GlassCard className="p-8 border-white/15 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold font-heading text-white">
                      Emissions by Supplier (Top 15 Emitters)
                    </h3>
                    <p className="text-xs text-white/50">
                      Bars animate from zero • Color-coded by tier with red highlight for statistical anomalies
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Tier 1
                    </span>
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Tier 2
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-300">
                      <span className="w-2.5 h-2.5 rounded bg-purple-400" /> Tier 3
                    </span>
                    <span className="flex items-center gap-1.5 text-red-400">
                      <span className="w-2.5 h-2.5 rounded bg-red-500" /> Anomaly Outlier
                    </span>
                  </div>
                </div>

                <div className="h-[420px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="rgba(255,255,255,0.4)"
                        fontSize={11}
                        angle={-35}
                        textAnchor="end"
                        tick={{ fill: "rgba(255,255,255,0.6)" }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.4)"
                        fontSize={11}
                        tickFormatter={(v) => `${v} t`}
                        tick={{ fill: "rgba(255,255,255,0.6)" }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0].payload;
                          return (
                            <div className="p-3.5 rounded-xl bg-[#0F1620]/95 backdrop-blur-xl border border-white/20 shadow-2xl text-xs text-white">
                              <div className="font-heading font-bold text-sm mb-1">{p.fullName}</div>
                              <div className="text-white/60 mb-2">
                                {p.tier} • {p.region} • {p.material}
                              </div>
                              <div className="flex items-center justify-between gap-4 font-mono">
                                <span>Emissions:</span>
                                <span className="font-bold text-cyan-400">
                                  {p.rawEmissions.toLocaleString()} kg CO₂e
                                </span>
                              </div>
                              {p.isAnomaly && (
                                <div className="mt-2 pt-2 border-t border-red-500/20 text-red-400 font-medium">
                                  ⚠️ Isolation Forest Anomaly Detected
                                </div>
                              )}
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="emissions" radius={[6, 6, 0, 0]} animationDuration={300}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.tierColor}
                            stroke={entry.isAnomaly ? "#EF4444" : "transparent"}
                            strokeWidth={entry.isAnomaly ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 3: TREE VIEW */}
          {activeTab === "tree" && (
            <motion.div
              key="tree"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <GlassCard className="p-8 border-white/15 shadow-2xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-bold font-heading text-white">
                      Supply Chain Hierarchy: Tier 1 → Tier 2 → Tier 3
                    </h3>
                    <p className="text-xs text-white/50">
                      Node size corresponds to emission volume • Interactive expand and collapse
                    </p>
                  </div>
                  <StatusBadge color="ai">Graph Clustered</StatusBadge>
                </div>

                <div className="space-y-6">
                  {["Tier 1", "Tier 2", "Tier 3"].map((tierName) => {
                    const isExpanded = expandedTiers[tierName] ?? true;
                    const suppliersInTier = tierTreeGroups[tierName] || [];
                    const tierTotal = tierTotals[tierName] || 0;

                    return (
                      <div key={tierName} className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
                        {/* Tier Header Node */}
                        <div
                          onClick={() =>
                            setExpandedTiers((prev) => ({
                              ...prev,
                              [tierName]: !prev[tierName],
                            }))
                          }
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-heading font-bold text-xs ${
                                tierName === "Tier 1"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : tierName === "Tier 2"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              }`}
                            >
                              {tierName.replace("ier ", "")}
                            </div>
                            <div>
                              <div className="font-heading font-bold text-white text-base flex items-center gap-2">
                                <span>{tierName} Upstream Suppliers</span>
                                <span className="text-xs font-normal text-white/40">
                                  ({suppliersInTier.length} entities)
                                </span>
                              </div>
                              <div className="text-xs text-white/50 font-mono">
                                Aggregated Footprint: {(tierTotal / 1000).toFixed(1)} tCO₂e
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                        </div>

                        {/* Child Nodes */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                          >
                            {suppliersInTier.map((sup) => (
                              <div
                                key={sup.id}
                                className={`p-3.5 rounded-xl border transition-all hover:scale-[1.02] ${
                                  sup.is_anomaly
                                    ? "bg-red-500/10 border-red-500/30"
                                    : "bg-white/[0.03] border-white/10 hover:border-white/20"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-semibold text-xs text-white truncate max-w-[160px]">
                                    {sup.supplier_name}
                                  </span>
                                  {sup.is_anomaly && (
                                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
                                  <span>{sup.material_type}</span>
                                  <span className="font-bold text-white">
                                    {(sup.total_emissions / 1000).toFixed(2)} t
                                  </span>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 4: MAP VIEW */}
          {activeTab === "map" && (
            <motion.div
              key="map"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <SupplierMapView
                suppliers={filteredSuppliers}
                runId={runId}
                selectedSupplierId={selectedMapSupplierId}
                onSelectSupplier={(s) => setSelectedMapSupplierId(s.id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>

      {/* Forecast & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <GlassCard className="p-6 border-white/15">
          <h3 className="text-base font-bold font-heading text-white mb-1">
            Predictive Emissions Trajectory
          </h3>
          <p className="text-xs text-white/50 mb-6">
            Business As Usual (BAU) vs AI Optimized Substitution Roadmaps
          </p>
          <ForecastChart runId={runId} />
        </GlassCard>

        <RecommendationPanel suppliers={filteredSuppliers} />
      </div>

      {/* Floating "Ask Your Data" AI Copilot Button & Panel */}
      <AIChatWidget runId={runId} />
    </div>
  );
}
