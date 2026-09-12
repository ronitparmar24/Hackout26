"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileSpreadsheet, ArrowRight, CheckCircle2 } from "lucide-react";
import { uploadCSV } from "@/lib/api";
import GlassCard from "@/components/GlassCard";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

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
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadCSV(file);
      router.push(`/processing/${res.run_id}`);
    } catch (e) {
      console.error(e);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-20 pb-32">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Upload Supply Chain Data
        </h1>
        <p className="text-lg text-white/60 font-light max-w-2xl mx-auto">
          Securely upload your CSV for immediate AI processing and ML-powered anomaly detection.
        </p>
      </div>

      <GlassCard className="p-12 relative overflow-hidden group">
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300
            ${isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}
            ${file ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
          `}
        >
          {file ? (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-emerald-500/20 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <div className="text-xl font-medium text-white">{file.name}</div>
              <div className="text-white/50 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="mt-6 flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-cyan-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] group disabled:opacity-50"
              >
                {isUploading ? "Processing..." : "Run AI Analysis"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-white/5 rounded-full mb-4">
                <UploadCloud className="w-12 h-12 text-cyan-400" />
              </div>
              <div className="text-xl font-medium text-white">Drag and drop your CSV here</div>
              <div className="text-white/50 mb-6">or click to browse from your computer</div>
              
              <label className="cursor-pointer px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-colors">
                Select File
                <input type="file" className="hidden" accept=".csv" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
              </label>
            </div>
          )}
        </div>
      </GlassCard>

      <div className="mt-12 flex items-center justify-center gap-4 text-white/50">
        <FileSpreadsheet className="w-5 h-5" />
        <span className="text-sm">Need a template? <a href="/demo_suppliers.csv" download className="text-cyan-400 hover:underline">Download demo dataset</a></span>
      </div>
    </div>
  );
}
