"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import GlassCard from "./GlassCard";
import type { Supplier } from "@/lib/api";

interface Props {
  suppliers: Supplier[];
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="tooltip-value" style={{ color: p.color }}>
          {p.name}: {Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 2 })} kg CO₂e
        </div>
      ))}
    </div>
  );
}

export default function EmissionsChart({ suppliers }: Props) {
  const [view, setView] = useState<"bar" | "area" | "breakdown">("bar");

  // Top 12 suppliers by emissions for bar chart
  const barData = [...suppliers]
    .sort((a, b) => b.total_emissions - a.total_emissions)
    .slice(0, 12)
    .map((s) => ({
      name: s.supplier_name.length > 12 ? s.supplier_name.slice(0, 12) + "…" : s.supplier_name,
      emissions: Number(s.total_emissions.toFixed(2)),
      isAnomaly: s.is_anomaly,
    }));

  // Breakdown by emission source
  const breakdownData = [
    {
      name: "Energy",
      value: suppliers.reduce((sum, s) => sum + s.energy_emissions, 0),
    },
    {
      name: "Transport",
      value: suppliers.reduce((sum, s) => sum + s.transport_emissions, 0),
    },
    {
      name: "Material",
      value: suppliers.reduce((sum, s) => sum + s.material_emissions, 0),
    },
  ].map((d) => ({ ...d, value: Number(d.value.toFixed(2)) }));

  // Tier-grouped area data
  const tiers = ["Tier 1", "Tier 2", "Tier 3"];
  const tierData = tiers.map((tier) => {
    const tierSuppliers = suppliers.filter((s) => s.tier === tier);
    return {
      name: tier,
      energy: Number(
        tierSuppliers.reduce((s, x) => s + x.energy_emissions, 0).toFixed(2)
      ),
      transport: Number(
        tierSuppliers.reduce((s, x) => s + x.transport_emissions, 0).toFixed(2)
      ),
      material: Number(
        tierSuppliers.reduce((s, x) => s + x.material_emissions, 0).toFixed(2)
      ),
    };
  });

  return (
    <GlassCard className="chart-container animate-fade-in-up">
      <div className="chart-header">
        <h3 className="chart-title">Emissions Analysis</h3>
        <div className="chart-tabs">
          <button
            className={`chart-tab ${view === "bar" ? "active" : ""}`}
            onClick={() => setView("bar")}
          >
            By Supplier
          </button>
          <button
            className={`chart-tab ${view === "area" ? "active" : ""}`}
            onClick={() => setView("area")}
          >
            By Tier
          </button>
          <button
            className={`chart-tab ${view === "breakdown" ? "active" : ""}`}
            onClick={() => setView("breakdown")}
          >
            Breakdown
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: 340 }}>
        <ResponsiveContainer>
          {view === "bar" ? (
            <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="emissions" name="Total Emissions" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isAnomaly ? "#ef4444" : COLORS[i % COLORS.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : view === "area" ? (
            <AreaChart data={tierData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <defs>
                <linearGradient id="gradEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradTransport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMaterial" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}
              />
              <Area
                type="monotone"
                dataKey="energy"
                name="Energy"
                stroke="#10b981"
                fill="url(#gradEnergy)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="transport"
                name="Transport"
                stroke="#3b82f6"
                fill="url(#gradTransport)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="material"
                name="Material"
                stroke="#8b5cf6"
                fill="url(#gradMaterial)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={breakdownData}
              margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 13 }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Emissions" radius={[0, 6, 6, 0]}>
                <Cell fill="#10b981" fillOpacity={0.85} />
                <Cell fill="#3b82f6" fillOpacity={0.85} />
                <Cell fill="#8b5cf6" fillOpacity={0.85} />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
