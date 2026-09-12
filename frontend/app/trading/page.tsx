"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getRun, listRuns, type RunResponse } from "@/lib/api";
import CarbonTicker from "@/components/CarbonTicker";
import TradingTerminal from "@/components/TradingTerminal";
import { LayoutDashboard, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";

function TradingDeskContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const runId = searchParams.get("run_id");
  const [data, setData] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let activeRunId = runId;
        if (!activeRunId) {
          const runs = await listRuns();
          if (runs && runs.length > 0) {
            activeRunId = runs[0].run_id || (runs[0] as any).id;
          }
        }
        if (activeRunId) {
          const result = await getRun(activeRunId);
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load run for trading desk", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [runId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner" />
        <p className="text-white/50 font-mono text-sm">Connecting to Carbon Exchange...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <StatusBadge color="high">No Audit Data Found</StatusBadge>
        <p className="text-white/60">Upload a supply chain dataset to enable the Trading Desk.</p>
        <Button variant="primary" onClick={() => router.push("/upload")}>Go to Upload</Button>
      </div>
    );
  }

  const initialEmissionsTons = Math.round(data.total_emissions / 1000);

  return (
    <div className="w-full min-h-screen bg-[#060913] flex flex-col">
      {/* 1. Live Ticker Tape */}
      <CarbonTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight">
                Carbon Treasury & Offset Desk
              </h1>
              <StatusBadge color="ai" pulse>LIVE MARKET SIMULATION</StatusBadge>
            </div>
            <p className="text-white/60 text-sm font-sans max-w-2xl">
              Execute simulated block trades of high-durability carbon removal credits to offset the residual <strong className="text-white">{initialEmissionsTons.toLocaleString()} tCO₂e</strong> from your audited supply chain dataset (<span className="font-mono text-cyan-400">{data.filename}</span>).
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/10 px-4 py-2 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div className="text-xs">
              <div className="text-white/50 font-mono uppercase">Compliance Tier</div>
              <div className="text-white font-bold">SBTi Net-Zero Standard</div>
            </div>
          </div>
        </div>

        {/* 2. Main Trading Terminal */}
        <TradingTerminal initialEmissions={initialEmissionsTons} />
      </div>
    </div>
  );
}

export default function TradingDeskPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: "100px auto" }} />}>
      <TradingDeskContent />
    </Suspense>
  );
}
