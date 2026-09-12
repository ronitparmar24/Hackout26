"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Users } from "lucide-react";
import GlassCard from "./GlassCard";
import type { Supplier } from "@/lib/api";

const CLUSTER_COLORS = [
  "var(--emerald-400)",
  "var(--blue-400)",
  "var(--purple-400)",
  "var(--amber-400)",
  "var(--cyan-400)",
  "var(--red-400)",
];

interface Props {
  suppliers: Supplier[];
}

export default function ClusterTreeView({ suppliers }: Props) {
  const clusterMap = new Map<number, Supplier[]>();
  suppliers.forEach((s) => {
    const list = clusterMap.get(s.cluster_label) || [];
    list.push(s);
    clusterMap.set(s.cluster_label, list);
  });

  const clusters = Array.from(clusterMap.entries()).sort(
    ([a], [b]) => a - b
  );

  const [expanded, setExpanded] = useState<Set<number>>(
    new Set(clusters.map(([label]) => label))
  );

  const toggle = (label: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <GlassCard className="animate-fade-in-up">
      <div className="section-title">
        <Users size={18} style={{ color: "var(--purple-400)" }} />
        <h2>Supplier Clusters</h2>
        <div className="section-line" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {clusters.map(([label, items]) => {
          const isOpen = expanded.has(label);
          const color = CLUSTER_COLORS[label % CLUSTER_COLORS.length];
          const avgEmissions =
            items.reduce((s, x) => s + x.total_emissions, 0) / items.length;

          return (
            <div className="cluster-group" key={label}>
              <div className="cluster-header" onClick={() => toggle(label)}>
                <div className="cluster-info">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <div
                    className="cluster-dot"
                    style={{ background: color }}
                  />
                  <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                    Cluster {label}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: `${color}20`,
                      color: color,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {items.length} suppliers
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-tertiary)",
                  }}
                >
                  Avg: {avgEmissions.toFixed(1)} kg CO₂e
                </span>
              </div>

              <div className={`cluster-content ${isOpen ? "expanded" : "collapsed"}`}>
                <div className="cluster-items">
                  {items
                    .sort((a, b) => b.total_emissions - a.total_emissions)
                    .map((s, i) => (
                      <div className="cluster-item" key={s.id || i}>
                        <div>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: "0.875rem",
                              color: "var(--text-primary)",
                            }}
                          >
                            {s.supplier_name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-tertiary)",
                              marginTop: "2px",
                            }}
                          >
                            {s.tier} · {s.region} · {s.transport_mode}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: color,
                            }}
                          >
                            {s.total_emissions.toFixed(1)} kg
                          </div>
                          {s.is_anomaly && (
                            <span
                              className="badge badge-danger"
                              style={{ fontSize: "0.625rem", padding: "2px 6px" }}
                            >
                              Anomaly
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
