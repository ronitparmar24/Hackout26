"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { uploadCSV } from "@/lib/api";

export default function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are accepted.");
      return;
    }
    setSelectedFile(file);
    setError(null);
    setUploading(true);
    setProgress(10);

    // Simulate progress for visual feedback
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 85));
    }, 300);

    try {
      const result = await uploadCSV(file);
      clearInterval(progressInterval);
      setProgress(100);

      // Brief delay to show completion
      setTimeout(() => {
        router.push(`/dashboard?run_id=${result.run_id}`);
      }, 600);
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setUploading(false);
      const message =
        err.response?.data?.detail ||
        (err.code === "ERR_NETWORK" || !err.response
          ? "Cannot connect to backend server. Please make sure the FastAPI backend is running on port 8000."
          : "Upload failed. Please check your CSV format.");
      setError(message);
    }
  }, [router]);


  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div>
      <div
        className={`upload-zone ${dragOver ? "drag-over" : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        id="upload-zone"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={onFileSelect}
          style={{ display: "none" }}
          id="csv-file-input"
        />

        {uploading ? (
          <div className="animate-fade-in">
            <div className="upload-icon" style={{ animation: "rotate-slow 2s linear infinite" }}>
              <Loader2 size={32} />
            </div>
            <div className="upload-title">
              {progress >= 100 ? "Analysis Complete!" : "Analyzing your data..."}
            </div>
            <div className="upload-subtitle" style={{ marginBottom: "20px" }}>
              {selectedFile?.name}
            </div>
            <div className="upload-progress" style={{ maxWidth: "400px", margin: "0 auto" }}>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "0.8125rem",
                  color: "var(--text-tertiary)",
                }}
              >
                {progress >= 100 ? (
                  <span style={{ color: "var(--emerald-400)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <CheckCircle size={14} /> Redirecting to dashboard...
                  </span>
                ) : (
                  `Processing... ${Math.round(progress)}%`
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              {dragOver ? <FileSpreadsheet size={32} /> : <Upload size={32} />}
            </div>
            <div className="upload-title">
              {dragOver ? "Drop your CSV file here" : "Upload Supply Chain Data"}
            </div>
            <div className="upload-subtitle">
              Drag & drop a CSV file, or click to browse
            </div>
            <div
              style={{
                marginTop: "16px",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              Required columns: supplier_name, tier, region, energy_kwh, transport_km,
              transport_mode, material_type, material_qty
            </div>
          </>
        )}
      </div>

      {/* Sample CSV Download Helper */}
      <div
        style={{
          marginTop: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          fontSize: "0.8125rem",
          color: "var(--text-tertiary)",
        }}
      >
        <span>Need dummy data to test?</span>
        <a
          href="/demo_suppliers.csv"
          download="demo_suppliers.csv"
          className="btn btn-sm btn-secondary"
          id="download-sample-csv-btn"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <FileSpreadsheet size={14} />
          Download demo_suppliers.csv
        </a>
      </div>


      {error && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--red-400)",
            fontSize: "0.875rem",
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
