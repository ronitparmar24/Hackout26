"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RetroTerminal from "@/components/RetroTerminal";

function TerminalContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-emerald-400 tracking-tight flex items-center gap-3">
          <span className="animate-pulse">_</span> AI Command Center
        </h1>
        <p className="text-white/60 text-sm font-sans mt-2">
          Direct low-level access to the Scope-3 Decarbonization Engine. Use NLP commands to query the supply chain dataset, execute offsets, and run anomaly detection.
        </p>
      </div>

      <RetroTerminal runId={runId} />
    </div>
  );
}

export default function TerminalPage() {
  return (
    <Suspense fallback={<div className="spinner" />}>
      <TerminalContent />
    </Suspense>
  );
}
