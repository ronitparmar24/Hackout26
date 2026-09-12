"use client";

import React, { useState } from "react";
import { AlertTriangle, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import GlassCard from "./GlassCard";
import type { Supplier } from "@/lib/api";

interface Props {
  suppliers: Supplier[];
}

type SortKey = "supplier_name" | "tier" | "total_emissions" | "region";

export default function AnomalyTable({ suppliers }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("total_emissions");
  const [sortAsc, setSortAsc] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const anomalies = suppliers.filter((s) => s.is_anomaly);

  const sorted = [...anomalies].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "number" && typeof bv === "number") {
      return sortAsc ? av - bv : bv - av;
    }
    return sortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const displayed = showAll ? sorted : sorted.slice(0, 8);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  if (anomalies.length === 0) {
    return (
      <GlassCard className="animate-fade-in-up">
        <div className="section-title">
          <AlertTriangle size={18} style={{ color: "var(--emerald-400)" }} />
          <h2>Anomaly Detection</h2>
          <div className="section-line" />
        </div>
        <div className="empty-state" style={{ padding: "40px 24px" }}>
          <div className="empty-icon">
            <AlertTriangle size={32} />
          </div>
          <div className="empty-title">No Anomalies Found</div>
          <div className="empty-desc">
            All suppliers are within expected emission ranges. Great job!
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="animate-fade-in-up" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 0" }}>
        <div className="section-title">
          <AlertTriangle size={18} style={{ color: "var(--red-400)" }} />
          <h2>Anomaly Detection</h2>
          <div className="section-line" />
          <span className="badge badge-danger">{anomalies.length} flagged</span>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("supplier_name")} style={{ cursor: "pointer" }}>
                Supplier <SortIcon col="supplier_name" />
              </th>
              <th onClick={() => toggleSort("tier")} style={{ cursor: "pointer" }}>
                Tier <SortIcon col="tier" />
              </th>
              <th onClick={() => toggleSort("region")} style={{ cursor: "pointer" }}>
                Region <SortIcon col="region" />
              </th>
              <th onClick={() => toggleSort("total_emissions")} style={{ cursor: "pointer" }}>
                Emissions <SortIcon col="total_emissions" />
              </th>
              <th>Breakdown</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((s, i) => (
              <tr key={s.id || i} className="anomaly-row">
                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {s.supplier_name}
                </td>
                <td>
                  <span className="badge badge-info">{s.tier}</span>
                </td>
                <td>{s.region}</td>
                <td style={{ fontWeight: 600, color: "var(--red-400)" }}>
                  {s.total_emissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px", fontSize: "0.75rem" }}>
                    <span style={{ color: "var(--emerald-400)" }}>
                      E: {s.energy_emissions.toFixed(1)}
                    </span>
                    <span style={{ color: "var(--blue-400)" }}>
                      T: {s.transport_emissions.toFixed(1)}
                    </span>
                    <span style={{ color: "var(--purple-400)" }}>
                      M: {s.material_emissions.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-danger">
                    <AlertTriangle size={10} /> Anomaly
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {anomalies.length > 8 && (
        <div
          style={{
            padding: "12px 24px",
            textAlign: "center",
            borderTop: "1px solid var(--glass-border)",
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : `Show All ${anomalies.length} Anomalies`}
          </button>
        </div>
      )}
    </GlassCard>
  );
}
