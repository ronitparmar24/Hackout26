"use client";

import React from "react";
import { ArrowRight, TrendingDown, Sparkles } from "lucide-react";
import GlassCard from "./GlassCard";
import type { Supplier } from "@/lib/api";

interface Recommendation {
  from_supplier: string;
  to_supplier: string;
  similarity_score: number;
  emissions_reduction_pct: number;
}

interface Props {
  suppliers: Supplier[];
}

export default function RecommendationPanel({ suppliers }: Props) {
  // Build recommendations from supplier data:
  // For each anomaly, find the most similar non-anomaly supplier in the same tier
  const anomalies = suppliers.filter((s) => s.is_anomaly);
  const normals = suppliers.filter((s) => !s.is_anomaly);

  const recommendations: Recommendation[] = [];

  anomalies.forEach((anomaly) => {
    const sameTier = normals.filter((n) => n.tier === anomaly.tier);
    if (sameTier.length === 0) return;

    // Find the one with lowest emissions in the same tier
    const best = sameTier.reduce((a, b) =>
      a.total_emissions < b.total_emissions ? a : b
    );

    const anomEmissions = Math.max(1, Number(anomaly.total_emissions || 0));
    const bestEmissions = Math.max(0, Number(best.total_emissions || 0));

    const reductionPct = Math.round(
      ((anomEmissions - bestEmissions) / anomEmissions) * 100
    );

    if (reductionPct > 0) {
      recommendations.push({
        from_supplier: anomaly.supplier_name,
        to_supplier: best.supplier_name,
        similarity_score: Math.max(0.5, Math.min(1.0, 1 - Math.abs(anomEmissions - bestEmissions) / anomEmissions)),
        emissions_reduction_pct: reductionPct,
      });
    }
  });

  // Sort by highest reduction potential
  recommendations.sort((a, b) => b.emissions_reduction_pct - a.emissions_reduction_pct);

  return (
    <GlassCard className="animate-fade-in-up">
      <div className="section-title">
        <Sparkles size={18} style={{ color: "var(--amber-400)" }} />
        <h2>AI Recommendations</h2>
        <div className="section-line" />
      </div>

      {recommendations.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 24px" }}>
          <div className="empty-icon">
            <Sparkles size={32} />
          </div>
          <div className="empty-title">No Recommendations</div>
          <div className="empty-desc">
            No supplier substitution recommendations available for this run.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {recommendations.slice(0, 6).map((rec, i) => (
            <div className="rec-card" key={i}>
              <div className="rec-arrow">
                <span style={{ color: "var(--red-400)", fontWeight: 600 }}>
                  {rec.from_supplier}
                </span>
                <ArrowRight size={14} style={{ color: "var(--text-tertiary)" }} />
                <span style={{ color: "var(--emerald-400)", fontWeight: 600 }}>
                  {rec.to_supplier}
                </span>
              </div>
              <div className="rec-metrics">
                <div className="rec-metric">
                  <span className="rec-metric-label">Similarity</span>
                  <span className="rec-metric-value" style={{ color: "var(--blue-400)" }}>
                    {(rec.similarity_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="rec-metric">
                  <span className="rec-metric-label">Emission Reduction</span>
                  <span
                    className="rec-metric-value"
                    style={{
                      color: "var(--emerald-400)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <TrendingDown size={14} />
                    {rec.emissions_reduction_pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
