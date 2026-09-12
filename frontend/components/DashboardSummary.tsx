"use client";

import React from "react";
import { Zap, Users, AlertTriangle, Layers } from "lucide-react";
import GlassCard from "./GlassCard";
import type { Supplier } from "@/lib/api";

interface Props {
  totalEmissions: number;
  totalSuppliers: number;
  suppliers: Supplier[];
}

export default function DashboardSummary({
  totalEmissions,
  totalSuppliers,
  suppliers,
}: Props) {
  const anomalyCount = suppliers.filter((s) => s.is_anomaly).length;
  const clusterLabels = [...new Set(suppliers.map((s) => s.cluster_label))];
  const topCluster = clusterLabels.length;

  const cards = [
    {
      icon: <Zap size={22} />,
      label: "Total Emissions",
      value: `${totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })}`,
      unit: "kg CO₂e",
      color: "var(--emerald-400)",
      bg: "rgba(16, 185, 129, 0.12)",
      accent: "var(--emerald-500)",
    },
    {
      icon: <Users size={22} />,
      label: "Total Suppliers",
      value: totalSuppliers.toString(),
      unit: "analyzed",
      color: "var(--blue-400)",
      bg: "rgba(59, 130, 246, 0.12)",
      accent: "var(--blue-500)",
    },
    {
      icon: <AlertTriangle size={22} />,
      label: "Anomalies Detected",
      value: anomalyCount.toString(),
      unit: "flagged",
      color: anomalyCount > 0 ? "var(--red-400)" : "var(--emerald-400)",
      bg: anomalyCount > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
      accent: anomalyCount > 0 ? "var(--red-500)" : "var(--emerald-500)",
    },
    {
      icon: <Layers size={22} />,
      label: "Clusters",
      value: topCluster.toString(),
      unit: "groups",
      color: "var(--purple-400)",
      bg: "rgba(139, 92, 246, 0.12)",
      accent: "var(--purple-500)",
    },
  ];

  return (
    <div className="kpi-grid stagger-children">
      {cards.map((card, i) => (
        <GlassCard key={i} className="kpi-card animate-fade-in-up">
          <div
            className="kpi-icon"
            style={{ background: card.bg, color: card.color }}
          >
            {card.icon}
          </div>
          <div className="kpi-value" style={{ color: card.color }}>
            {card.value}
          </div>
          <div className="kpi-label">
            {card.label}{" "}
            <span style={{ color: "var(--text-muted)" }}>· {card.unit}</span>
          </div>
          <div
            className="kpi-accent"
            style={{ background: card.accent }}
          />
        </GlassCard>
      ))}
    </div>
  );
}
