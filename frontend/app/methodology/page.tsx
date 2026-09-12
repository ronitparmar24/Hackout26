"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Leaf,
  Target,
  Server,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Cpu,
  BookOpen,
  ArrowRight,
  Database,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";

export default function MethodologyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 pb-32">
      {/* Top Header */}
      <div className="mb-12 text-center max-w-3xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-4">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scientific & Algorithmic Transparency</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-heading text-white tracking-tight mb-4">
          Methodology & <span className="text-gradient">Audit Standards</span>
        </h1>
        <p className="text-white/60 text-base sm:text-lg font-sans leading-relaxed">
          How CarbonSense calculates Scope 3 greenhouse gas emissions, isolates supply chain anomalies with
          unsupervised ML, and strictly bounds generative AI to audited facts.
        </p>
      </div>

      <div className="space-y-12">
        {/* ============================================================ */}
        {/* SECTION 1: TRUST MATRIX - FORMULA VS AI-GENERATED */}
        {/* ============================================================ */}
        <div>
          <div className="flex items-center gap-2.5 mb-6">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold font-heading text-white tracking-tight">
              The Trust Matrix: Formula-Calculated vs. AI-Generated
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Deterministic / Calculated */}
            <GlassCard className="p-6 sm:p-8 border-emerald-500/40 relative overflow-hidden bg-emerald-950/10">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--low,#10B981)]" />
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Deterministic & Auditable</span>
              </div>
              <h3 className="text-xl font-bold font-heading text-white mb-3">
                Formula-Calculated Math
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-sans mb-4">
                All quantitative carbon values are derived via standard cradle-to-gate mathematical formulas
                using published government emission coefficients. Zero LLM hallucination is possible in these metrics.
              </p>

              <ul className="space-y-2.5 text-xs text-white/80 font-mono">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Energy Emissions = kWh × Regional Grid Factor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Transit Emissions = tonne-km × Freight Mode Factor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Material Emissions = Quantity (kg) × Embodied Carbon Factor</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Anomaly Flagging = Isolation Forest decision threshold (-0.12)</span>
                </li>
              </ul>
            </GlassCard>

            {/* AI-Generated & Guardrailed */}
            <GlassCard className="p-6 sm:p-8 border-cyan-400/40 relative overflow-hidden bg-cyan-950/10 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--ai-accent,#22D3EE)]" />
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Context-Grounded & Guardrailed</span>
              </div>
              <h3 className="text-xl font-bold font-heading text-white mb-3">
                AI-Generated Synthesis
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-sans mb-4">
                Generative AI (Large Language Models) is strictly restricted to qualitative synthesis, natural language
                translation, and executive summarization. It is fed only verified numbers from the active run.
              </p>

              <ul className="space-y-2.5 text-xs text-white/80 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong>Executive Summaries:</strong> Synthesizes hot-spots into 3-4 readable paragraphs and 3 action items.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong>Risk Justification:</strong> 1-sentence plain-English justification of calculated supplier risk score.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong>Conversational Copilot:</strong> RAG question-answering strictly grounded in active run context.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong>Deterministic Fallback:</strong> If API keys are absent or offline, fallback heuristics activate automatically.
                  </span>
                </li>
              </ul>
            </GlassCard>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: EMISSION FACTOR SOURCES & COEFFICIENTS */}
        {/* ============================================================ */}
        <div>
          <div className="flex items-center gap-2.5 mb-6">
            <Leaf className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold font-heading text-white tracking-tight">
              Emission Factor Sources & Standard Baselines
            </h2>
          </div>

          <GlassCard className="p-6 sm:p-8">
            <p className="text-sm text-white/80 leading-relaxed font-sans mb-6">
              Our emission factors are sourced directly from internationally accepted climate accounting frameworks:
              the{" "}
              <strong className="text-white">UK Government GHG Conversion Factors for Company Reporting (Defra)</strong>,{" "}
              the <strong className="text-white">EPA GHG Emission Factors Hub (US)</strong>, and the{" "}
              <strong className="text-white">GHG Protocol Scope 3 Standard</strong>.
            </p>

            {/* Factor Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 uppercase font-mono tracking-wider">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Activity / Material</th>
                    <th className="py-3 px-4">Emission Factor</th>
                    <th className="py-3 px-4">Primary Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-white/80">
                  <tr>
                    <td className="py-3 px-4 text-emerald-400">Electricity</td>
                    <td className="py-3 px-4 font-sans text-white">Grid Average (Global weighted)</td>
                    <td className="py-3 px-4 font-bold">0.2330 kg CO₂e / kWh</td>
                    <td className="py-3 px-4 text-white/50">UK Defra & IEA 2023</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-cyan-400">Freight Transit</td>
                    <td className="py-3 px-4 font-sans text-white">Road (HGV articulated truck)</td>
                    <td className="py-3 px-4 font-bold">0.1050 kg CO₂e / tonne-km</td>
                    <td className="py-3 px-4 text-white/50">UK Defra Freight Table</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-cyan-400">Freight Transit</td>
                    <td className="py-3 px-4 font-sans text-white">Rail (Electric & diesel freight)</td>
                    <td className="py-3 px-4 font-bold">0.0400 kg CO₂e / tonne-km</td>
                    <td className="py-3 px-4 text-white/50">EPA GHG Emission Hub</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-cyan-400">Freight Transit</td>
                    <td className="py-3 px-4 font-sans text-white">Sea (Container vessel)</td>
                    <td className="py-3 px-4 font-bold">0.0150 kg CO₂e / tonne-km</td>
                    <td className="py-3 px-4 text-white/50">IMO GHG Study</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-cyan-400">Freight Transit</td>
                    <td className="py-3 px-4 font-sans text-white">Air (Dedicated cargo flight)</td>
                    <td className="py-3 px-4 font-bold">1.0900 kg CO₂e / tonne-km</td>
                    <td className="py-3 px-4 text-white/50">UK Defra Long-haul</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-purple-400">Material</td>
                    <td className="py-3 px-4 font-sans text-white">Primary Steel</td>
                    <td className="py-3 px-4 font-bold">1.8500 kg CO₂e / kg</td>
                    <td className="py-3 px-4 text-white/50">WorldSteel LCI</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-purple-400">Material</td>
                    <td className="py-3 px-4 font-sans text-white">Primary Aluminum (Smelted)</td>
                    <td className="py-3 px-4 font-bold">8.9000 kg CO₂e / kg</td>
                    <td className="py-3 px-4 text-white/50">IAI Lifecycle Model</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-purple-400">Material</td>
                    <td className="py-3 px-4 font-sans text-white">Industrial Plastic (Polymer resin)</td>
                    <td className="py-3 px-4 font-bold">2.5000 kg CO₂e / kg</td>
                    <td className="py-3 px-4 text-white/50">PlasticsEurope Eco-profile</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-purple-400">Material</td>
                    <td className="py-3 px-4 font-sans text-white">Textiles (Natural / synthetic blend)</td>
                    <td className="py-3 px-4 font-bold">4.3000 kg CO₂e / kg</td>
                    <td className="py-3 px-4 text-white/50">Higg MSI Database</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-purple-400">Material</td>
                    <td className="py-3 px-4 font-sans text-white">Processed Timber / Wood</td>
                    <td className="py-3 px-4 font-bold">0.4500 kg CO₂e / kg</td>
                    <td className="py-3 px-4 text-white/50">Ecoinvent 3.9</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: MACHINE LEARNING PIPELINE IN PLAIN ENGLISH */}
        {/* ============================================================ */}
        <div>
          <div className="flex items-center gap-2.5 mb-6">
            <Cpu className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold font-heading text-white tracking-tight">
              Machine Learning Pipeline in Plain English
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Model 1: Imputation */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                  01
                </div>
                <h3 className="text-base font-bold font-heading text-white">
                  Missing Value Imputation (Random Forest)
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-sans mb-3">
                When suppliers fail to provide exact energy usage (kWh) or transit distance (km), we train a{" "}
                <code className="text-amber-400 font-mono">RandomForestRegressor</code> on verified vendors in the dataset.
                It predicts the missing quantity based on supplier Tier, Geographic Region, and Material Type.
              </p>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-mono">
                Transparency guarantee: Imputed values are explicitly tagged with an amber "est" pill on the dashboard.
              </div>
            </GlassCard>

            {/* Model 2: Isolation Forest */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs font-mono">
                  02
                </div>
                <h3 className="text-base font-bold font-heading text-white">
                  Anomaly Detection (Isolation Forest)
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-sans mb-3">
                We use an unsupervised <code className="text-red-400 font-mono">IsolationForest</code> with{" "}
                <code className="text-white font-mono">contamination=0.05</code>. It isolates observations by randomly
                partitioning feature trees. Data points that require very few tree splits are flagged as statistical outliers.
              </p>
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 font-mono">
                Catches unoptimized freight corridors, excessive material usage, and faulty vendor reporting.
              </div>
            </GlassCard>

            {/* Model 3: KMeans */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">
                  03
                </div>
                <h3 className="text-base font-bold font-heading text-white">
                  Supplier Cohort Clustering (K-Means)
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-sans mb-3">
                Using <code className="text-cyan-400 font-mono">KMeans(n_clusters=3)</code> with feature standard scaling,
                we segment suppliers into homogeneous cohorts: Local Light-Manufacturing, Regional Balanced, and Long-Haul
                High-Impact.
              </p>
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-[11px] text-cyan-300 font-mono">
                Enables fair peer benchmarking so a small textile supplier isn't compared directly against heavy steel foundries.
              </div>
            </GlassCard>

            {/* Model 4: Cosine Similarity */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                  04
                </div>
                <h3 className="text-base font-bold font-heading text-white">
                  Decarbonization Swaps (Cosine Similarity)
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-sans mb-3">
                To recommend greener alternatives, we compute pairwise cosine distance across multi-dimensional feature
                vectors (material type, tier compatibility, scale). We identify greener peers in the same cluster with lower
                emissions per unit.
              </p>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
                Generates realistic substitutions that preserve production volume while trimming carbon footprint.
              </div>
            </GlassCard>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold font-heading text-white">Ready to inspect your Scope 3 supply chain?</h4>
            <p className="text-white/50 text-xs font-sans">Upload your vendor manifest or try our sample dataset in seconds.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => (window.location.href = "/")}>
              Home
            </Button>
            <Button variant="primary" onClick={() => (window.location.href = "/upload")} className="gap-2">
              Start Analysis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
