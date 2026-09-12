"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRun, listRuns, type RunResponse, type Supplier } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ExternalLink,
  Layers,
  Leaf,
} from "lucide-react";

function SuppliersContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [materialFilter, setMaterialFilter] = useState("All");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

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
          if (result.suppliers && result.suppliers.length > 0) {
            setSelectedSupplier(result.suppliers[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load supplier directory", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [runId]);

  const suppliers: Supplier[] = data?.suppliers || [];

  // Compute ESG Score Tier: A+, A, B, C, D based on intensity (emissions / material_qty)
  const getEsgRating = (s: Supplier) => {
    if (s.is_anomaly) return { grade: "D", badge: "badge-danger", label: "High Risk Outlier" };
    const intensity = (s.total_emissions || 0) / Math.max(0.1, s.material_qty || 1);
    if (intensity < 3500) return { grade: "A+", badge: "badge-success", label: "Top ESG Leader" };
    if (intensity < 6000) return { grade: "A", badge: "badge-success", label: "Eco Efficient" };
    if (intensity < 15000) return { grade: "B", badge: "badge-warning", label: "Moderate Impact" };
    return { grade: "C", badge: "badge-warning", label: "Heavy Footprint" };
  };

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        s.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.material_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.region && s.region.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTier = tierFilter === "All" || s.tier === tierFilter;
      const matchMat = materialFilter === "All" || s.material_type === materialFilter;

      return matchSearch && matchTier && matchMat;
    });
  }, [suppliers, searchQuery, tierFilter, materialFilter]);

  // Clean alternatives for the selected supplier
  const alternatives = useMemo(() => {
    if (!selectedSupplier) return [];
    return suppliers
      .filter(
        (s) =>
          s.id !== selectedSupplier.id &&
          s.tier === selectedSupplier.tier &&
          s.material_type === selectedSupplier.material_type &&
          (s.total_emissions || 0) < (selectedSupplier.total_emissions || 0)
      )
      .sort((a, b) => (a.total_emissions || 0) - (b.total_emissions || 0))
      .slice(0, 3);
  }, [suppliers, selectedSupplier]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
        <div className="spinner" />
        <p style={{ color: "var(--text-tertiary)" }}>Loading supplier directory...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header animate-fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Building2 size={28} style={{ color: "var(--emerald-400)" }} />
            <h1>Supplier Registry & Green Sourcing Marketplace</h1>
          </div>
          <p>
            Evaluate upstream vendor carbon ratings, audit Scope 3 intensity, and discover certified low-emission alternative suppliers.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <span className="badge badge-success">{suppliers.length} Total Vendors</span>
          <span className="badge badge-warning">
            {suppliers.filter((s) => s.is_anomaly).length} Flagged Outliers
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <GlassCard className="animate-fade-in-up" style={{ padding: "16px 20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search box */}
          <div style={{ position: "relative", flex: 1, minWidth: "220px", maxWidth: "380px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search vendor name, material, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          {/* Tier buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginRight: "4px" }}>Tier:</span>
            {["All", "Tier 1", "Tier 2", "Tier 3"].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`chart-tab ${tierFilter === t ? "active" : ""}`}
                style={{ padding: "4px 12px", fontSize: "0.75rem" }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Material Select */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginRight: "4px" }}>Material:</span>
            {["All", "Steel", "Plastic", "Aluminum", "Textile", "Electronics"].map((m) => (
              <button
                key={m}
                onClick={() => setMaterialFilter(m)}
                className={`chart-tab ${materialFilter === m ? "active" : ""}`}
                style={{ padding: "4px 10px", fontSize: "0.75rem" }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Main Content: Directory List + Selected Vendor Profile */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Supplier Table */}
        <GlassCard>
          <div className="section-title">
            <h2>Audited Suppliers ({filteredSuppliers.length})</h2>
            <div className="section-line" />
          </div>

          <div style={{ overflowX: "auto", maxHeight: "650px", overflowY: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Tier</th>
                  <th>ESG Grade</th>
                  <th>Emissions (kg)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((s) => {
                  const esg = getEsgRating(s);
                  const isSelected = selectedSupplier?.id === s.id;

                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSupplier(s)}
                      style={{
                        cursor: "pointer",
                        background: isSelected ? "rgba(16, 185, 129, 0.08)" : undefined,
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {s.supplier_name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                          {s.material_type} • {s.region}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{s.tier}</span>
                      </td>
                      <td>
                        <span className={`badge ${esg.badge}`}>
                          {esg.grade}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {s.total_emissions?.toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ padding: "4px 10px", fontSize: "0.6875rem" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSupplier(s);
                          }}
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Selected Vendor Detail & Green Substitution Suggestions */}
        {selectedSupplier ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <GlassCard variant="interactive" glowColor="emerald">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "4px" }}>
                    {selectedSupplier.supplier_name}
                  </h3>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                    {selectedSupplier.tier} • {selectedSupplier.region} Facility
                  </div>
                </div>
                {(() => {
                  const esg = getEsgRating(selectedSupplier);
                  return (
                    <div style={{ textAlign: "right" }}>
                      <span className={`badge ${esg.badge}`} style={{ fontSize: "0.875rem", padding: "4px 12px" }}>
                        Grade {esg.grade}
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", display: "block", marginTop: "2px" }}>
                        {esg.label}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Metric Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "20px" }}>
                <div className="glass-subtle">
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                    Electricity Use
                  </span>
                  <div style={{ fontWeight: 700, fontSize: "1.125rem", marginTop: "4px" }}>
                    {selectedSupplier.energy_kwh?.toLocaleString()} kWh
                  </div>
                  {selectedSupplier.energy_kwh_estimated && (
                    <span style={{ fontSize: "0.6875rem", color: "var(--amber-400)" }}>AI Estimated</span>
                  )}
                </div>

                <div className="glass-subtle">
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                    Transit Distance
                  </span>
                  <div style={{ fontWeight: 700, fontSize: "1.125rem", marginTop: "4px" }}>
                    {selectedSupplier.transport_km?.toLocaleString()} km
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-secondary)" }}>
                    via {selectedSupplier.transport_mode}
                  </span>
                </div>

                <div className="glass-subtle">
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                    Material Shipped
                  </span>
                  <div style={{ fontWeight: 700, fontSize: "1.125rem", marginTop: "4px" }}>
                    {selectedSupplier.material_qty} tonnes
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-secondary)" }}>
                    {selectedSupplier.material_type}
                  </span>
                </div>

                <div className="glass-subtle">
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                    Total Footprint
                  </span>
                  <div style={{ fontWeight: 700, fontSize: "1.125rem", marginTop: "4px", color: "var(--emerald-400)" }}>
                    {selectedSupplier.total_emissions?.toLocaleString()} kg
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-secondary)" }}>
                    CO₂ equivalent
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Green Sourcing Swap Alternatives */}
            <GlassCard>
              <div className="section-title">
                <Sparkles size={18} style={{ color: "var(--amber-400)" }} />
                <h2>Cleaner Sourcing Alternatives</h2>
                <div className="section-line" />
              </div>

              {alternatives.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
                  <Leaf size={24} style={{ color: "var(--emerald-400)", margin: "0 auto 8px" }} />
                  This supplier is already among the cleanest vendors in its peer group!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                  {alternatives.map((alt) => {
                    const diff = (selectedSupplier.total_emissions || 0) - (alt.total_emissions || 0);
                    const pct = Math.round((diff / (selectedSupplier.total_emissions || 1)) * 100);

                    return (
                      <div
                        key={alt.id}
                        className="glass-subtle"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 14px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{alt.supplier_name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                            {alt.region} • {alt.transport_mode} Freight
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <TrendingDown size={12} /> -{pct}% CO₂
                          </span>
                          <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                            Saves {(diff / 1000).toFixed(1)} tCO₂e
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        ) : (
          <GlassCard style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
            Select a vendor from the list to view their detailed ESG profile and clean swap recommendations.
          </GlassCard>
        )}
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: "100px auto" }} />}>
      <SuppliersContent />
    </Suspense>
  );
}
