"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";
import { uploadCSV } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";

interface ParsedPreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

const EXPECTED_COLUMNS = [
  { name: "supplier_name", type: "Text", desc: "Company / legal vendor entity name", sample: "Apex Alloys Ltd" },
  { name: "tier", type: "Categorical", desc: "Supply chain tier (Tier 1, Tier 2, Tier 3)", sample: "Tier 1" },
  { name: "region", type: "Location", desc: "Country or geographic zone (e.g. UK, India)", sample: "UK" },
  { name: "energy_kwh", type: "Numeric", desc: "Electricity consumption (auto-imputed if empty)", sample: "1420.50" },
  { name: "transport_km", type: "Numeric", desc: "Freight shipping distance in kilometers", sample: "650.00" },
  { name: "transport_mode", type: "Categorical", desc: "Freight mode: Road, Rail, Sea, or Air", sample: "Road" },
  { name: "material_type", type: "Categorical", desc: "Steel, Plastic, Aluminum, Textile, Electronics", sample: "Steel" },
  { name: "material_qty", type: "Numeric", desc: "Quantity in metric tonnes", sample: "12.50" },
];

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse first 5 rows of CSV for instant glass table preview
  const parseCSVPreview = (fileObj: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text
          .split(/\r\n|\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length < 2) {
          setErrorMessage("The selected file is empty or missing headers.");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const rows = lines
          .slice(1, 6)
          .map((line) => line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, "")));

        setPreview({
          headers,
          rows,
          totalRows: lines.length - 1,
        });
        setErrorMessage(null);
      } catch (err) {
        setErrorMessage("Failed to read CSV preview. Please ensure it is standard UTF-8 CSV.");
      }
    };
    reader.readAsText(fileObj);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (!selected.name.endsWith(".csv")) {
        setErrorMessage("Only .csv files are supported.");
        return;
      }
      setFile(selected);
      parseCSVPreview(selected);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith(".csv")) {
        setErrorMessage("Only .csv files are supported.");
        return;
      }
      setFile(selected);
      parseCSVPreview(selected);
    }
  };

  // Load demo CSV automatically
  const handleLoadSample = async () => {
    setErrorMessage(null);
    try {
      const res = await fetch("/demo_suppliers.csv");
      if (!res.ok) throw new Error("Could not fetch demo dataset");
      const blob = await res.blob();
      const sampleFile = new File([blob], "demo_suppliers.csv", { type: "text/csv" });
      setFile(sampleFile);
      parseCSVPreview(sampleFile);
    } catch (err) {
      setErrorMessage("Failed to load sample dataset automatically. Please try uploading manually.");
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const res = await uploadCSV(file);
      // Route immediately to the newly built /processing/[run_id] page
      router.push(`/processing/${res.run_id}`);
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setErrorMessage(
        err.response?.data?.detail || "Error uploading file. Please check column names and try again."
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-10 pb-24 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <StatusBadge color="ai" showIcon className="mb-4">
          AUTOMATED INGESTION & PIPELINE
        </StatusBadge>

        <h1 className="text-3xl sm:text-5xl font-bold text-white font-heading tracking-tight mb-4">
          Upload Supply Chain Data
        </h1>
        <p className="text-white/60 text-base sm:text-lg">
          Drop in your supplier manifest. Our AI engine imputes missing parameters, calculates verified GHG totals, and detects anomalies.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Large Glass Card Drop Zone */}
      {!file ? (
        <GlassCard
          variant="strong"
          className="p-8 sm:p-12 mb-8 relative group overflow-hidden border-white/15"
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative rounded-2xl p-12 sm:p-16 text-center transition-all duration-300 border-2 border-dashed
              ${
                isDragging
                  ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.25)] scale-[1.01]"
                  : "border-white/20 hover:border-cyan-400/50 hover:bg-white/[0.02]"
              }
            `}
          >
            <div className="flex flex-col items-center justify-center">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${
                  isDragging
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "bg-white/[0.05] border border-white/10 text-cyan-400"
                }`}
              >
                <UploadCloud className="w-10 h-10" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-2">
                Drag and drop your supplier CSV here
              </h3>
              <p className="text-white/50 text-sm sm:text-base mb-8 max-w-md">
                Supports .csv files up to 25MB with standard UTF-8 headers
              </p>

              <label className="cursor-pointer">
                <Button variant="secondary" className="px-7 py-3">
                  Browse Files
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>
        </GlassCard>
      ) : (
        /* Preview Glass Card (First 5 Rows) */
        <GlassCard variant="strong" className="p-6 sm:p-8 mb-8 border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-heading font-bold text-white text-lg flex items-center gap-2">
                  <span>{file.name}</span>
                  <StatusBadge color="low">Valid CSV</StatusBadge>
                </div>
                <div className="text-xs text-white/50">
                  {(file.size / 1024).toFixed(1)} KB • {preview?.totalRows || 0} total supplier rows ready for ingestion
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="text-xs px-4 py-2"
              >
                Choose Another File
              </Button>

              <Button
                variant="primary"
                onClick={handleUploadAndAnalyze}
                isLoading={isUploading}
                className="text-sm px-6 py-2.5 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                icon={<ArrowRight className="w-4 h-4 ml-1" />}
                iconPosition="right"
              >
                Looks good, analyze it
              </Button>
            </div>
          </div>

          {/* Table Preview */}
          {preview && (
            <div>
              <div className="flex items-center justify-between text-xs text-white/60 mb-3 font-mono">
                <span>PREVIEWING FIRST 5 ROWS</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Columns Mapped to GHG Protocol
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04] text-white/70 font-semibold font-heading uppercase tracking-wider">
                      {preview.headers.map((h, i) => (
                        <th key={i} className="py-3 px-4 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {preview.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-4 text-white/80 whitespace-nowrap font-mono text-[11px]">
                            {cell || <span className="text-white/30 italic">auto-predict</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* Action Strip Below Drop Zone */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <button
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors group px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span>Don't have a file? Try our sample dataset</span>
        </button>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <Info className="w-4 h-4 text-white/50" />
          <span>CSV Format Guide</span>
          {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Collapsible CSV Format Guide Glass Card */}
      {showGuide && (
        <GlassCard className="p-6 sm:p-8 mb-8 border-white/15 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold font-heading text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Expected CSV Column Schema
            </h4>
            <span className="text-xs text-white/40 font-mono">8 COLUMNS REQUIRED</span>
          </div>

          <p className="text-xs text-white/60 mb-6">
            If numeric columns like <code>energy_kwh</code> or <code>transport_km</code> are left blank, our regression models will automatically predict values based on tier, material, and region.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXPECTED_COLUMNS.map((col, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400">{col.name}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/50">
                    {col.type}
                  </span>
                </div>
                <div className="text-xs text-white/70 mb-2">{col.desc}</div>
                <div className="text-[11px] font-mono text-white/40">
                  Example: <span className="text-emerald-400/80">{col.sample}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
