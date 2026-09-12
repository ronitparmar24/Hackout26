"use client";

import React, { useState } from "react";
import { Shield, Leaf, Target, Server } from "lucide-react";
import GlassCard from "@/components/GlassCard";

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto pt-12 pb-24">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Methodology & Transparency</h1>
        <p className="text-white/60 text-lg">Detailed documentation of our calculation pipelines, ML models, and emission factors.</p>
      </div>

      <div className="space-y-8">
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Server className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-semibold text-white">Data Processing & ML Pipeline</h2>
          </div>
          <div className="prose prose-invert max-w-none text-white/70">
            <p>Our backend relies on Python, Pandas, and scikit-learn to handle high-dimensional supply chain data.</p>
            <ul className="space-y-2 mt-4">
              <li><strong>Imputation (Random Forest):</strong> Missing energy (kWh) and transport (km) values are imputed using a <code>RandomForestRegressor</code> trained on the non-missing subset, utilizing features like Tier, Region, and Material Type.</li>
              <li><strong>Outlier Detection (Isolation Forest):</strong> We use an <code>IsolationForest</code> with <code>contamination=0.05</code> to flag anomalies. A supplier is flagged if their feature vector (normalized emissions and quantities) falls outside the core distribution.</li>
              <li><strong>Clustering (K-Means):</strong> Suppliers are grouped into 3 clusters using <code>KMeans</code> to identify sourcing archetypes and calculate intra-cluster peer averages.</li>
            </ul>
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-semibold text-white">Emission Factors</h2>
          </div>
          <div className="prose prose-invert max-w-none text-white/70">
            <p>Calculations adhere to the GHG Protocol using standard baseline factors.</p>
            <ul className="space-y-2 mt-4">
              <li><strong>Energy:</strong> 0.233 kg CO₂e / kWh (Global Grid Average approximation)</li>
              <li><strong>Transport:</strong> Varies by mode: Road (0.105), Rail (0.040), Sea (0.015), Air (1.090) kg CO₂e / tonne-km.</li>
              <li><strong>Materials:</strong> Steel (1.85), Aluminum (8.90), Plastic (2.50), Textile (4.30), Wood (0.45) kg CO₂e / unit.</li>
            </ul>
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">AI Guardrails</h2>
          </div>
          <div className="prose prose-invert max-w-none text-white/70">
            <p>Our LLM integration (RAG-style assistant and executive summary) operates on strict guidelines to prevent hallucination.</p>
            <ul className="space-y-2 mt-4">
              <li>Context is injected as strict JSON payloads containing exactly calculated numerical data.</li>
              <li>The LLM is prompted to only provide qualitative analysis and risk justifications based on the provided JSON.</li>
              <li>If API keys (OpenAI/Gemini/Groq) are absent, the system seamlessly falls back to a deterministic heuristic engine.</li>
            </ul>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
