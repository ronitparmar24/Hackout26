"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  Clock,
  CheckCircle,
  Loader2,
  Trash2,
  ExternalLink,
  History as HistoryIcon,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";

interface RunRecord {
  run_id: string;
  filename: string;
  total_suppliers: number;
  total_emissions: number;
  status: string;
  timestamp?: string;
}

export default function HistoryPage() {
  const router = useRouter();

  // Load from localStorage if available
  const [runs] = useState<RunRecord[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("carbonsense_runs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h1>
          Run <span className="text-gradient">History</span>
        </h1>
        <p>Browse and revisit past supply chain analyses.</p>
      </div>

      {runs.length === 0 ? (
        <GlassCard className="empty-state animate-fade-in-up">
          <div className="empty-icon">
            <HistoryIcon size={32} />
          </div>
          <div className="empty-title">No Past Analyses</div>
          <div className="empty-desc">
            Upload a CSV file on the home page to begin your first analysis.
            Past runs will appear here.
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: "24px" }}
            onClick={() => router.push("/")}
          >
            Go to Upload
          </button>
        </GlassCard>
      ) : (
        <div className="history-list stagger-children">
          {runs.map((run, i) => (
            <GlassCard
              key={run.run_id}
              className="history-item animate-fade-in-up"
              onClick={() => router.push(`/dashboard?run_id=${run.run_id}`)}
            >
              <div className="history-info">
                <div className="history-file-icon">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <div className="history-filename">{run.filename}</div>
                  <div className="history-meta">
                    {run.total_suppliers} suppliers ·{" "}
                    {run.total_emissions.toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })}{" "}
                    kg CO₂e
                    {run.timestamp && (
                      <>
                        {" "}
                        · <Clock size={11} style={{ display: "inline" }} />{" "}
                        {new Date(run.timestamp).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="history-actions">
                {run.status === "done" ? (
                  <span className="badge badge-success">
                    <CheckCircle size={10} /> Complete
                  </span>
                ) : (
                  <span className="badge badge-processing">
                    <Loader2 size={10} /> Processing
                  </span>
                )}
                <button
                  className="btn btn-icon btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard?run_id=${run.run_id}`);
                  }}
                  title="View Dashboard"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
