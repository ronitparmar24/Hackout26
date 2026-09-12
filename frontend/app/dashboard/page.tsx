"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getRun, type RunResponse } from "@/lib/api";
import DashboardSummary from "@/components/DashboardSummary";
import EmissionsChart from "@/components/EmissionsChart";
import AnomalyTable from "@/components/AnomalyTable";
import ClusterTreeView from "@/components/ClusterTreeView";
import RecommendationPanel from "@/components/RecommendationPanel";
import ExportButtons from "@/components/ExportButtons";
import { BarChart3, Loader2 } from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const result = await getRun(runId);
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load run data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [runId]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "16px",
        }}
      >
        <div className="spinner" />
        <p style={{ color: "var(--text-tertiary)" }}>Loading analysis data...</p>
      </div>
    );
  }

  if (!runId) {
    return (
      <div>
        <div className="page-header animate-fade-in">
          <h1>Dashboard</h1>
          <p>Upload a CSV file to see your emissions analysis.</p>
        </div>
        <div className="glass-card empty-state animate-fade-in-up">
          <div className="empty-icon">
            <BarChart3 size={32} />
          </div>
          <div className="empty-title">No Analysis Selected</div>
          <div className="empty-desc">
            Go to the Upload page to analyze your supply chain data, or select a
            past run from History.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header animate-fade-in">
          <h1>Dashboard</h1>
        </div>
        <div
          className="glass-card animate-fade-in"
          style={{
            textAlign: "center",
            padding: "60px 40px",
            borderColor: "rgba(239, 68, 68, 0.2)",
          }}
        >
          <p style={{ color: "var(--red-400)" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.suppliers) return null;

  const { suppliers } = data;

  return (
    <div>
      {/* Header */}
      <div
        className="animate-fade-in"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>
            Emissions <span className="text-gradient">Dashboard</span>
          </h1>
          <p>
            Analysis results for{" "}
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
              {data.filename}
            </span>{" "}
            · {data.total_suppliers} suppliers
          </p>
        </div>
        <ExportButtons runId={data.run_id} />
      </div>

      {/* KPI Summary */}
      <DashboardSummary
        totalEmissions={data.total_emissions}
        totalSuppliers={data.total_suppliers}
        suppliers={suppliers}
      />

      {/* Charts */}
      <EmissionsChart suppliers={suppliers} />

      <div style={{ height: "24px" }} />

      {/* Anomaly & Clusters side by side */}
      <div className="dashboard-grid">
        <AnomalyTable suppliers={suppliers} />
        <ClusterTreeView suppliers={suppliers} />
      </div>

      {/* Recommendations */}
      <RecommendationPanel suppliers={suppliers} />

      {/* Supplier table */}
      <div style={{ marginTop: "24px" }}>
        <div
          className="glass-card animate-fade-in-up"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <div style={{ padding: "20px 24px 0" }}>
            <div className="section-title">
              <h2>All Suppliers</h2>
              <div className="section-line" />
              <span className="badge badge-info">{suppliers.length} total</span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Tier</th>
                  <th>Region</th>
                  <th>Transport</th>
                  <th>Material</th>
                  <th>Energy (kg)</th>
                  <th>Transport (kg)</th>
                  <th>Material (kg)</th>
                  <th>Total (kg CO₂e)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...suppliers]
                  .sort((a, b) => b.total_emissions - a.total_emissions)
                  .map((s, i) => (
                    <tr
                      key={s.id || i}
                      className={s.is_anomaly ? "anomaly-row" : ""}
                    >
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                        {s.supplier_name}
                        {s.energy_kwh_estimated && (
                          <span
                            title="Energy estimated via ML"
                            style={{
                              marginLeft: "6px",
                              fontSize: "0.6875rem",
                              color: "var(--amber-400)",
                            }}
                          >
                            ⚡ est.
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-info">{s.tier}</span>
                      </td>
                      <td style={{ fontSize: "0.8125rem" }}>{s.region}</td>
                      <td style={{ fontSize: "0.8125rem" }}>{s.transport_mode}</td>
                      <td style={{ fontSize: "0.8125rem" }}>{s.material_type}</td>
                      <td style={{ color: "var(--emerald-400)", fontSize: "0.8125rem" }}>
                        {s.energy_emissions.toFixed(2)}
                      </td>
                      <td style={{ color: "var(--blue-400)", fontSize: "0.8125rem" }}>
                        {s.transport_emissions.toFixed(2)}
                      </td>
                      <td style={{ color: "var(--purple-400)", fontSize: "0.8125rem" }}>
                        {s.material_emissions.toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {s.total_emissions.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        {s.is_anomaly ? (
                          <span className="badge badge-danger">Anomaly</span>
                        ) : (
                          <span className="badge badge-success">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <div className="spinner" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
