"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listRuns, uploadCSV, type UploadResponse } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import {
  LayoutDashboard,
  Upload,
  Sparkles,
  ArrowRight,
  Database,
  ShieldCheck,
  Globe,
  FileSpreadsheet,
  Layers,
} from "lucide-react";

export default function DashboardIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<UploadResponse[]>([]);
  const [isStartingDemo, setIsStartingDemo] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const fetchedRuns = await listRuns();
        if (isMounted) {
          setRuns(fetchedRuns || []);
          if (fetchedRuns && fetchedRuns.length > 0) {
            // Automatically redirect to the latest audited run
            router.replace(`/dashboard/${fetchedRuns[0].run_id}`);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch runs:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLaunchDemo = async () => {
    setIsStartingDemo(true);
    try {
      const resp = await fetch("/demo_suppliers.csv");
      const csvText = await resp.text();
      const file = new File([csvText], "demo_suppliers.csv", { type: "text/csv" });
      const res = await uploadCSV(file);
      router.push(`/processing/${res.run_id}`);
    } catch (err) {
      console.error("Failed to load demo CSV:", err);
      router.push("/upload");
    } finally {
      setIsStartingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold font-heading text-white tracking-wide">
            Connecting to CarbonSense Telemetry...
          </div>
          <div className="text-xs font-mono text-white/40 mt-1">
            Resolving active supply chain run data
          </div>
        </div>
      </div>
    );
  }

  // If no runs exist in the database, show a pristine glass launchpad
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Intelligence Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-3">
          Supply Chain Carbon Dashboard
        </h1>
        <p className="text-white/60 text-sm max-w-lg mx-auto font-sans">
          Analyze Scope 3 emissions, uncover statistical carbon anomalies with ML, and explore interactive OpenStreetMap geospatial distribution.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Card 1: Launch Demo Dataset */}
        <GlassCard className="p-8 border-cyan-400/40 relative overflow-hidden bg-cyan-950/15 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400" />
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-5">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white mb-2">
              Launch Preloaded Demo Run
            </h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans mb-6">
              Instant access to 70 multi-tier suppliers across UK and India with verified Climatiq DEFRA factors, Isolation Forest anomaly flags, and Leaflet geo-mapping.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleLaunchDemo}
            disabled={isStartingDemo}
            className="w-full justify-center gap-2 py-3"
          >
            {isStartingDemo ? (
              <span>Processing Demo Model...</span>
            ) : (
              <>
                <span>Launch Demo Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </GlassCard>

        {/* Card 2: Upload Custom Data */}
        <GlassCard className="p-8 border-white/15 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 mb-5">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white mb-2">
              Upload Custom Supply Chain CSV
            </h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans mb-6">
              Ingest your proprietary vendor roster with automated column mapping, missing value ML regression imputation, and CSRD compliance reporting.
            </p>
          </div>

          <Link href="/upload" className="w-full">
            <Button variant="secondary" className="w-full justify-center gap-2 py-3">
              <span>Go to CSV Intake</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </GlassCard>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
          <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white font-heading mb-0.5">OpenStreetMap Leaflet</div>
            <div className="text-white/50">Zero-key CartoDB dark glass interactive maps.</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white font-heading mb-0.5">Climatiq Verified</div>
            <div className="text-white/50">GHG Protocol certified factor accounting.</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white font-heading mb-0.5">AI Risk & Copilot</div>
            <div className="text-white/50">Context-grounded natural language analytics.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
