"use client";

import React from "react";
import { FileDown, FileText } from "lucide-react";
import { getExportCSVUrl, getExportPDFUrl } from "@/lib/api";

interface Props {
  runId: string;
}

export default function ExportButtons({ runId }: Props) {
  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      <a
        href={getExportCSVUrl(runId)}
        download
        className="btn btn-secondary"
        id="export-csv-btn"
        style={{ textDecoration: "none" }}
      >
        <FileDown size={16} />
        Export CSV
      </a>
      <a
        href={getExportPDFUrl(runId)}
        download
        className="btn btn-primary"
        id="export-pdf-btn"
        style={{ textDecoration: "none" }}
      >
        <FileText size={16} />
        Export PDF Report
      </a>
    </div>
  );
}
