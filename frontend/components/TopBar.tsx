"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { listRuns, type UploadResponse } from "@/lib/api";
import { Sparkles, FileSpreadsheet, ShieldCheck, ArrowUpRight, Activity } from "lucide-react";

export default function TopBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");
  const [latestRun, setLatestRun] = useState<UploadResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const runs = await listRuns();
        if (runs && runs.length > 0) {
          if (runId) {
            const current = runs.find((r) => r.run_id === runId);
            setLatestRun(current || runs[0]);
          } else {
            setLatestRun(runs[0]);
          }
        }
      } catch (err) {
        // backend might be starting
      }
    })();
  }, [runId]);

  return (
    <header
      className="glass"
      style={{
        marginBottom: "24px",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        borderRadius: "var(--radius-md)",
      }}
    >
      {/* Left: Active Dataset Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: latestRun ? "var(--emerald-400)" : "var(--text-tertiary)",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: latestRun ? "var(--emerald-500)" : "var(--amber-400)",
              boxShadow: latestRun ? "0 0 8px var(--emerald-glow)" : undefined,
            }}
          />
          {latestRun ? (
            <span>Active Dataset: {latestRun.filename}</span>
          ) : (
            <span>No Dataset Loaded</span>
          )}
        </div>

        {latestRun && (
          <span
            className="badge badge-info"
            style={{ fontSize: "0.6875rem", padding: "2px 8px" }}
          >
            {latestRun.total_suppliers} Vendors • {(latestRun.total_emissions / 1000).toFixed(0)}t CO₂e
          </span>
        )}
      </div>

      {/* Right: Quick Operational Shortcuts */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link
          href={latestRun ? `/simulator?run_id=${latestRun.run_id}` : "/simulator"}
          className="btn btn-sm btn-secondary"
          style={{
            fontSize: "0.75rem",
            padding: "5px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            textDecoration: "none",
          }}
        >
          <Sparkles size={13} style={{ color: "var(--teal-400)" }} />
          <span>What-If Simulator</span>
        </Link>

        <Link
          href={latestRun ? `/compliance?run_id=${latestRun.run_id}` : "/compliance"}
          className="btn btn-sm btn-secondary"
          style={{
            fontSize: "0.75rem",
            padding: "5px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            textDecoration: "none",
          }}
        >
          <ShieldCheck size={13} style={{ color: "var(--emerald-400)" }} />
          <span>CSRD Audit</span>
        </Link>
      </div>
    </header>
  );
}
