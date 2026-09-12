"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  UploadCloud,
  Cpu,
  AlertTriangle,
  ShieldCheck,
  FileSpreadsheet,
  Sparkles,
  TrendingDown,
  Layers,
  FileCheck,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Database,
  Globe2,
  Activity,
  FileText,
  HelpCircle,
  Zap,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import GradientBackground from "@/components/GradientBackground";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";

// Demo mini-chart data for the live preview card
const previewBars = [
  { name: "Alpha Steel", tier: "Tier 1", height: 75, emissions: "3,450", color: "#10B981" },
  { name: "Titan Logistics", tier: "Tier 2", height: 92, emissions: "5,820", color: "#EF4444", anomaly: true },
  { name: "Apex Polymer", tier: "Tier 1", height: 45, emissions: "1,980", color: "#10B981" },
  { name: "Omni Freight", tier: "Tier 3", height: 86, emissions: "4,630", color: "#F59E0B" },
  { name: "Bavaria Alloy", tier: "Tier 2", height: 60, emissions: "2,710", color: "#10B981" },
  { name: "PacRim Textile", tier: "Tier 3", height: 80, emissions: "3,890", color: "#22D3EE" },
];

export default function MarketingLandingPage() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* ============================================================ */}
      {/* 1. HERO SECTION WITH FULL GRADIENT MESH BACKGROUND */}
      {/* ============================================================ */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <StatusBadge color="ai" pulse showIcon>
              AI-POWERED SCOPE 3 DECARBONIZATION
            </StatusBadge>
          </motion.div>

          {/* Punchy, Non-Generic Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-heading leading-[1.08] mb-6"
          >
            See every gram of carbon in your{" "}
            <span className="bg-gradient-to-r from-[#10B981] via-[#22D3EE] to-[#60A5FA] bg-clip-text text-transparent">
              supply chain
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto font-sans leading-relaxed mb-10"
          >
            Trace upstream Scope 3 emissions across multi-tier suppliers with audited 
            GHG emission factors, machine-learning anomaly detection, and automated greener supplier routing.
          </motion.p>

          {/* Dual CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <Link href="/upload">
              <Button
                variant="primary"
                className="text-base px-8 py-3.5 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                icon={<ArrowRight className="w-5 h-5 ml-1" />}
                iconPosition="right"
              >
                Try the Demo
              </Button>
            </Link>

            <a href="#how-it-works">
              <Button
                variant="secondary"
                className="text-base px-8 py-3.5"
                icon={<ChevronDown className="w-4 h-4 ml-1" />}
                iconPosition="right"
              >
                See How It Works
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Live Animated Dashboard Teaser Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <GlassCard variant="strong" className="p-6 sm:p-8 relative border-white/20 shadow-2xl">
            {/* Window header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-xs font-mono text-white/50 pl-2">
                  RUN_ID: <span className="text-cyan-400">CS-2026-LIVE</span> • LIVE AUDIT
                </span>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge color="low" showDot pulse>
                  Pipeline Active
                </StatusBadge>
                <span className="text-xs font-mono text-white/40 hidden sm:inline">
                  MongoDB Cloud Synchronized
                </span>
              </div>
            </div>

            {/* KPI pill strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs text-white/50 mb-1">Total Measured Scope 3</div>
                <div className="text-2xl font-bold font-heading text-white flex items-center gap-1.5">
                  <AnimatedCounter value={13611} decimals={0} suffix=" t" />
                  <span className="text-xs text-emerald-400 font-normal font-sans bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    -18.4%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs text-white/50 mb-1">Suppliers Audited</div>
                <div className="text-2xl font-bold font-heading text-white">
                  <AnimatedCounter value={31} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs text-white/50 mb-1">Anomalies Detected</div>
                <div className="text-2xl font-bold font-heading text-red-400 flex items-center gap-2">
                  <AnimatedCounter value={4} />
                  <span className="text-xs text-red-400/80 font-normal font-sans">Isolation Forest</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-xs text-white/50 mb-1">Potential Reduction</div>
                <div className="text-2xl font-bold font-heading text-cyan-400">
                  <AnimatedCounter value={28.6} decimals={1} suffix="%" />
                </div>
              </div>
            </div>

            {/* Simulated Live Bar Chart */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                <span className="font-semibold uppercase tracking-wider text-white/80">
                  Supplier Carbon Intensity by Emitter (kg CO₂e)
                </span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Substitution Ranking Ready
                </span>
              </div>

              <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2 border-b border-white/10">
                {previewBars.map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-mono text-white/80 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded pointer-events-none mb-1">
                      {bar.emissions} kg
                    </div>

                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${bar.height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: idx * 0.1, ease: "easeOut" }}
                      className="w-full rounded-t-lg relative transition-all group-hover:brightness-125"
                      style={{
                        background: bar.anomaly
                          ? "linear-gradient(180deg, #EF4444 0%, rgba(239,68,68,0.4) 100%)"
                          : `linear-gradient(180deg, ${bar.color} 0%, rgba(16,185,129,0.3) 100%)`,
                        boxShadow: bar.anomaly
                          ? "0 0 16px rgba(239,68,68,0.4)"
                          : "0 0 12px rgba(16,185,129,0.2)",
                      }}
                    >
                      {bar.anomaly && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                          Outlier
                        </div>
                      )}
                    </motion.div>

                    <div className="text-[11px] font-medium text-white/60 truncate w-full text-center mt-2 group-hover:text-white transition-colors">
                      {bar.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* 2. PROBLEM / SOLUTION SPLIT SECTION */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <StatusBadge color="moderate">THE SCOPE 3 REALITY</StatusBadge>
          <h2 className="text-3xl sm:text-5xl font-bold font-heading mt-4 mb-4">
            Why Traditional Carbon Accounting Fails
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Up to 90% of an enterprise’s emissions live in Scope 3. Yet companies still audit them using quarterly spreadsheets and guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch relative">
          {/* Left: The Problem Card */}
          <GlassCard className="p-8 sm:p-10 border-red-500/20 bg-red-950/[0.04] relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <StatusBadge color="high">THE LEGACY PROBLEM</StatusBadge>
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>

              <h3 className="text-2xl font-bold font-heading mb-4 text-white">
                Scope 3 data is scattered, manual, and unauditable
              </h3>

              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Sustainability teams spend hundreds of hours manually emailing vendors, coping with missing transit km, and using crude global industry averages that hide emissions.
              </p>

              <ul className="space-y-4 text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs mt-0.5">✕</span>
                  <span><strong>Data black holes:</strong> Suppliers fail to report exact transport modes or fuel types, leaving gaping holes in ESG audits.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs mt-0.5">✕</span>
                  <span><strong>Greenwashing blindspots:</strong> Rogue outliers and misreported values go undetected without automated statistical verification.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs mt-0.5">✕</span>
                  <span><strong>Zero mitigation clarity:</strong> Traditional tools tell you what you emitted, but never who to switch to for immediate reduction.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-red-500/20 text-xs font-mono text-red-400/80">
              RESULT: REGULATORY FINES, FAILED AUDITS & STALLED DECARBONIZATION
            </div>
          </GlassCard>

          {/* Right: The Solution Card */}
          <GlassCard className="p-8 sm:p-10 border-emerald-500/30 bg-emerald-950/[0.05] relative flex flex-col justify-between shadow-[0_0_40px_rgba(16,185,129,0.08)]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <StatusBadge color="low">THE CARBONSENSE SOLUTION</StatusBadge>
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>

              <h3 className="text-2xl font-bold font-heading mb-4 text-white">
                Automated ML ingestion, anomaly traps & greener routing
              </h3>

              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                An intelligent end-to-end data pipeline that computes emissions according to UK DEFRA and US EPA formulas, isolates outliers, and matches you with verified greener partners.
              </p>

              <ul className="space-y-4 text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Smart regression imputers:</strong> Random Forest fills missing supplier energy and transit values with verified industry baselines.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Isolation Forest traps:</strong> Scans supplier data to automatically flag anomalous high-carbon footprints and suspicious anomalies.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Actionable cosine routing:</strong> Recommends lower-emission drop-in replacements with exact percentage reductions and similarity metrics.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-500/20 text-xs font-mono text-emerald-400/90 flex items-center justify-between">
              <span>RESULT: AUDIT-READY TRANSPARENCY & INSTANT 20%+ EMISSIONS CUTS</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. HOW IT WORKS (HORIZONTAL TIMELINE) */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <StatusBadge color="ai">THE WORKFLOW</StatusBadge>
          <h2 className="text-3xl sm:text-5xl font-bold font-heading mt-4 mb-4">
            How It Works in 4 Steps
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            From raw, messy supplier CSVs to executive audit reports in under sixty seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard className="h-full p-6 flex flex-col justify-between border-white/10 hover:border-emerald-500/40">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 font-mono font-bold text-lg">
                  01
                </div>
                <h4 className="text-lg font-bold font-heading text-white mb-2 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-400" /> Upload Supply CSV
                </h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Drop in your vendor manifests or ERP export. We accept supplier names, tier levels, transit modes, and material weights.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-white/40">
                INPUT: CSV OR ERP EXPORT
              </div>
            </GlassCard>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard className="h-full p-6 flex flex-col justify-between border-white/10 hover:border-cyan-500/40">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 font-mono font-bold text-lg">
                  02
                </div>
                <h4 className="text-lg font-bold font-heading text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" /> Fill Gaps & Calculate
                </h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Random Forest regressors impute missing kWh and distances. Official UK DEFRA & US EPA factors calculate Scope 3 totals.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-cyan-400/70">
                ENGINE: 11 GHG FACTORS
              </div>
            </GlassCard>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard className="h-full p-6 flex flex-col justify-between border-white/10 hover:border-amber-500/40">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 font-mono font-bold text-lg">
                  03
                </div>
                <h4 className="text-lg font-bold font-heading text-white mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" /> Detect & Cluster
                </h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Isolation Forest flags statistical greenwashing anomalies. K-Means segments vendors into clean, moderate, and intensive clusters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-amber-400/70">
                ALGO: ISOLATION FOREST + KMEANS
              </div>
            </GlassCard>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard className="h-full p-6 flex flex-col justify-between border-white/10 hover:border-emerald-400/40">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 font-mono font-bold text-lg">
                  04
                </div>
                <h4 className="text-lg font-bold font-heading text-white mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" /> Optimize & Report
                </h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  Review cosine-similarity supplier recommendations, simulate "What-If" reduction scenarios, and export audit-ready PDFs.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-emerald-400/70">
                OUTPUT: CSRD-READY PDF EXPORT
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ASYMMETRIC FEATURE GRID (3x2) */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <StatusBadge color="low">CORE INTELLIGENCE</StatusBadge>
          <h2 className="text-3xl sm:text-5xl font-bold font-heading mt-4 mb-4">
            Built for Enterprise Supply Chains
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            Every feature is engineered to turn confusing climate data into clear, defensible decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <GlassCard className="p-8 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white mb-2">
              Multi-Tier Scope 3 Tracking
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Drill down across Tier 1 direct vendors, Tier 2 components, and Tier 3 raw extractors with comprehensive lifecycle accounting.
            </p>
          </GlassCard>

          {/* Feature 2 */}
          <GlassCard className="p-8 hover:border-red-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white mb-2">
              Isolation Forest Anomaly Detection
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Unsupervised machine learning spots suppliers whose carbon intensity significantly diverges from regional and material baselines.
            </p>
          </GlassCard>

          {/* Feature 3 */}
          <GlassCard className="p-8 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white mb-2">
              K-Means Supplier Clustering
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Automatically segments suppliers into low, moderate, and intensive cohorts so procurement teams know exactly where to negotiate.
            </p>
          </GlassCard>

          {/* Feature 4 */}
          <GlassCard className="p-8 hover:border-emerald-400/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white mb-2">
              Greener Supplier Recommendations
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              High-dimensional cosine similarity identifies drop-in vendor matches in the same tier and material with up to 40% lower footprint.
            </p>
          </GlassCard>

          {/* Feature 5 */}
          <GlassCard className="p-8 hover:border-blue-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white mb-2">
              Official Audit-Ready PDF Reports
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Generate formatted executive summaries and board decks with breakdown tables, anomaly logs, and certified emission factor sources.
            </p>
          </GlassCard>

          {/* Feature 6 */}
          <GlassCard className="p-8 hover:border-cyan-400/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white mb-2">
              Natural Language "Ask Your Data"
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Query your supply chain with plain English prompts like <em>"Which Tier 2 supplier has the worst emissions per kg?"</em> for instant answers.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. LIVE STAT STRIP WITH ANIMATED COUNTERS */}
      {/* ============================================================ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <GlassCard className="p-6 text-center border-white/10 hover:border-emerald-500/30">
            <div className="text-3xl sm:text-4xl font-bold font-heading text-emerald-400 mb-1">
              <AnimatedCounter value={11} />
            </div>
            <div className="text-xs uppercase tracking-wider text-white/60">
              DEFRA & EPA Factors
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center border-white/10 hover:border-cyan-500/30">
            <div className="text-3xl sm:text-4xl font-bold font-heading text-cyan-400 mb-1">
              <AnimatedCounter value={3} />
            </div>
            <div className="text-xs uppercase tracking-wider text-white/60">
              Trained ML Models
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center border-white/10 hover:border-blue-500/30">
            <div className="text-3xl sm:text-4xl font-bold font-heading text-blue-400 mb-1">
              <AnimatedCounter value={100} suffix="%" />
            </div>
            <div className="text-xs uppercase tracking-wider text-white/60">
              Multi-Tier Coverage
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center border-white/10 hover:border-purple-500/30">
            <div className="text-3xl sm:text-4xl font-bold font-heading text-purple-400 mb-1">
              0
            </div>
            <div className="text-xs uppercase tracking-wider text-white/60">
              Black-Box Guesswork
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. METHODOLOGY & CREDIBILITY SECTION */}
      {/* ============================================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <GlassCard variant="strong" className="p-8 sm:p-12 text-center border-white/20 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
            <Database className="w-3.5 h-3.5" /> SCIENTIFIC RIGOR & GOV DATA
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4 text-white">
            Not a Black Box. 100% Auditable Formulas.
          </h2>

          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Every gram of CO₂e calculated by CarbonSense is strictly mapped to official government GHG conversion factor databases: 
            <strong> UK DEFRA/DESNZ 2023</strong> and the <strong>US EPA GHG Emissions Hub</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/60 mb-8">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> DEFRA UK Grid Intensity
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> EPA Freight Factors (Road, Rail, Sea, Air)
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cradle-to-Gate Material Factors
            </span>
          </div>

          <div>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors group"
            >
              <span>View our methodology & GHG factor table</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* ============================================================ */}
      {/* 7. FINAL HEROIC CALL TO ACTION */}
      {/* ============================================================ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative">
        <div className="relative z-10">
          <StatusBadge color="ai" pulse>
            GET STARTED TODAY
          </StatusBadge>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading mt-6 mb-6 leading-tight">
            Ready to trace and eliminate your supply chain carbon?
          </h2>

          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your supplier CSV or test our preloaded demo dataset. 
            No credit card, no complex enterprise onboarding.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/upload">
              <Button
                variant="primary"
                className="text-lg px-9 py-4 shadow-[0_0_35px_rgba(34,211,238,0.4)]"
                icon={<ArrowRight className="w-5 h-5 ml-1" />}
                iconPosition="right"
              >
                Try the Demo
              </Button>
            </Link>

            <Link href="/history">
              <Button variant="secondary" className="text-base px-8 py-4">
                Explore Past Runs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. FOOTER */}
      {/* ============================================================ */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold font-heading text-lg">
              C
            </div>
            <div>
              <div className="font-heading font-bold text-white tracking-wide">CarbonSense</div>
              <div className="text-xs text-white/40">AI-Powered Supply Chain Decarbonization</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
            <Link href="/upload" className="hover:text-emerald-400 transition-colors">
              Upload
            </Link>
            <Link href="/history" className="hover:text-emerald-400 transition-colors">
              History
            </Link>
            <Link href="/methodology" className="hover:text-emerald-400 transition-colors">
              Methodology
            </Link>
            <Link href="/settings" className="hover:text-emerald-400 transition-colors">
              Settings
            </Link>
            <a
              href="https://github.com/ronitparmar24/Hackout26"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              GitHub <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <div>© {new Date().getFullYear()} CarbonSense Inc. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Scope 3 GHG Protocol Compliant • UK DEFRA / US EPA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
