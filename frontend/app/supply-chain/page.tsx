"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRun, listRuns, type RunResponse, type Supplier } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import {
  Globe,
  Plane,
  Ship,
  Truck,
  Train,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Leaf,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function SupplyChainContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  useEffect(() => {
    (async () => {
      try {
        let activeRunId = runId;
        if (!activeRunId) {
          const runs = await listRuns();
          if (runs && runs.length > 0) {
            activeRunId = runs[0].run_id;
          }
        }
        if (activeRunId) {
          const result = await getRun(activeRunId);
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load supply chain data", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [runId]);

  const suppliers: Supplier[] = data?.suppliers || [];
  const filteredSuppliers =
    selectedRegion === "All"
      ? suppliers
      : suppliers.filter((s) => s.region === selectedRegion);

  // Modal breakdown
  const modes = ["Road", "Rail", "Sea", "Air"];
  const modeData = modes.map((mode) => {
    const matched = filteredSuppliers.filter((s) => s.transport_mode === mode);
    const count = matched.length;
    const totalEmissions = matched.reduce((sum, s) => sum + (s.transport_emissions || 0), 0);
    const totalKm = matched.reduce((sum, s) => sum + (s.transport_km || 0), 0);
    const totalQty = matched.reduce((sum, s) => sum + (s.material_qty || 0), 0);
    return {
      mode,
      count,
      emissions: Math.round(totalEmissions),
      km: Math.round(totalKm),
      qty: Math.round(totalQty * 10) / 10,
    };
  });

  const modeColors: Record<string, string> = {
    Road: "#3b82f6",
    Rail: "#10b981",
    Sea: "#06b6d4",
    Air: "#ef4444",
  };

  // Regional breakdown
  const regions = ["UK", "India"];
  const regionMetrics = regions.map((reg) => {
    const regSuppliers = suppliers.filter((s) => s.region === reg);
    const emissions = regSuppliers.reduce((sum, s) => sum + (s.total_emissions || 0), 0);
    const avgEnergy =
      regSuppliers.length > 0
        ? regSuppliers.reduce((sum, s) => sum + (s.energy_kwh || 0), 0) / regSuppliers.length
        : 0;
    return {
      region: reg,
      count: regSuppliers.length,
      emissions: Math.round(emissions),
      avgEnergy: Math.round(avgEnergy),
    };
  });

  // High impact transit routes
  const topTransitSuppliers = [...filteredSuppliers]
    .sort((a, b) => (b.transport_emissions || 0) - (a.transport_emissions || 0))
    .slice(0, 6);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
        <div className="spinner" />
        <p style={{ color: "var(--text-tertiary)" }}>Mapping supply chain networks...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header animate-fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Globe size={28} style={{ color: "var(--emerald-400)" }} />
            <h1>Global Logistics & Supply Chain Corridors</h1>
          </div>
          <p>
            Trace cross-border Scope 3 freight emissions, modal splits, and geographic manufacturing clusters.
          </p>
        </div>

        {/* Region Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--glass-bg)", padding: "4px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
          <Filter size={15} style={{ color: "var(--text-tertiary)" }} />
          <span style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>Region:</span>
          {["All", "UK", "India"].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`chart-tab ${selectedRegion === reg ? "active" : ""}`}
              style={{ padding: "4px 12px", fontSize: "0.75rem" }}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Regional Intensity Cards */}
      <div className="kpi-grid animate-fade-in-up">
        {regionMetrics.map((rm) => (
          <GlassCard key={rm.region} variant="interactive" glowColor="emerald">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={18} style={{ color: "var(--teal-400)" }} />
                <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>{rm.region} Hub</span>
              </div>
              <span className="badge badge-info">{rm.count} Active Nodes</span>
            </div>
            <div style={{ marginTop: "16px" }}>
              <div className="kpi-value" style={{ fontSize: "1.75rem" }}>
                {(rm.emissions / 1000).toFixed(1)} <span style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>tCO₂e</span>
              </div>
              <div className="kpi-label">Cumulative Regional Emissions</div>
            </div>
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--glass-border)", fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
              <span>Avg Grid Energy:</span>
              <span style={{ fontWeight: 600 }}>{rm.avgEnergy.toLocaleString()} kWh</span>
            </div>
          </GlassCard>
        ))}

        <GlassCard variant="interactive" glowColor="blue">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Truck size={18} style={{ color: "var(--blue-400)" }} />
            <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>Freight Intensity</span>
          </div>
          <div style={{ marginTop: "16px" }}>
            <div className="kpi-value" style={{ fontSize: "1.75rem" }}>
              {modeData.reduce((s, m) => s + m.emissions, 0).toLocaleString()} <span style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>kg CO₂e</span>
            </div>
            <div className="kpi-label">Total Upstream Transportation Impact</div>
          </div>
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--glass-border)", fontSize: "0.75rem", color: "var(--emerald-400)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Leaf size={13} />
            <span>Multi-modal shift opportunities identified</span>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row: Mode Distribution & Modal Volume vs Emissions */}
      <div className="dashboard-grid animate-fade-in-up" style={{ marginTop: "24px" }}>
        <GlassCard>
          <div className="section-title">
            <h2>Transportation Mode Emissions Split</h2>
            <div className="section-line" />
          </div>
          <div style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeData}>
                <XAxis dataKey="mode" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="custom-tooltip">
                          <div className="tooltip-label">{item.mode} Freight</div>
                          <div className="tooltip-value">{item.emissions.toLocaleString()} kg CO₂e</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                            Distance: {item.km.toLocaleString()} km | Weight: {item.qty}t
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="emissions" radius={[6, 6, 0, 0]}>
                  {modeData.map((entry) => (
                    <Cell key={entry.mode} fill={modeColors[entry.mode] || "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="section-title">
            <h2>Transit Factor Multipliers (per tonne-km)</h2>
            <div className="section-line" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
            {[
              { mode: "Air Freight", factor: 0.89939, desc: "Highest carbon footprint — 8.6x heavier than Road", icon: Plane, color: "var(--red-400)" },
              { mode: "Road (HGVs)", factor: 0.10356, desc: "Standard road freight, high volume in domestic networks", icon: Truck, color: "var(--blue-400)" },
              { mode: "Rail Freight", factor: 0.02583, desc: "Ultra-low impact electric/diesel intermodal transit", icon: Train, color: "var(--emerald-400)" },
              { mode: "Sea Cargo Ship", factor: 0.01205, desc: "Most carbon-efficient per ton-km across continents", icon: Ship, color: "var(--cyan-400)" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.mode} className="glass-subtle" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "rgba(255, 255, 255, 0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: f.color }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{f.mode}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{f.desc}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: f.color }}>{f.factor}</span>
                    <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", display: "block" }}>kg/t-km</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Critical Logistics Hotspots Table */}
      <GlassCard className="animate-fade-in-up" style={{ marginTop: "24px" }}>
        <div className="section-title">
          <AlertTriangle size={18} style={{ color: "var(--amber-400)" }} />
          <h2>Top Carbon-Intensive Freight Corridors</h2>
          <div className="section-line" />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Region</th>
                <th>Material & Shipped Weight</th>
                <th>Distance</th>
                <th>Mode</th>
                <th>Freight Emissions</th>
                <th>Decarbonization Action</th>
              </tr>
            </thead>
            <tbody>
              {topTransitSuppliers.map((s) => {
                const isAir = s.transport_mode === "Air";
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.supplier_name}</td>
                    <td><span className="badge badge-info">{s.region}</span></td>
                    <td>{s.material_type} ({s.material_qty}t)</td>
                    <td>{s.transport_km?.toLocaleString()} km</td>
                    <td>
                      <span className={`badge ${isAir ? "badge-danger" : "badge-success"}`}>
                        {s.transport_mode}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: isAir ? "var(--red-400)" : "var(--text-primary)" }}>
                      {s.transport_emissions?.toLocaleString()} kg
                    </td>
                    <td>
                      {isAir ? (
                        <span style={{ fontSize: "0.75rem", color: "var(--amber-400)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <ArrowRight size={12} /> Shift to Rail/Sea (-88% CO₂)
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--emerald-400)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Leaf size={12} /> Optimized Corridor
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
    </div>
  );
}

export default function SupplyChainPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: "100px auto" }} />}>
      <SupplyChainContent />
    </Suspense>
  );
}
