"use client";

import React from "react";
import { FileDown, FileText } from "lucide-react";
import { getExportCSVUrl, getExportPDFUrl } from "@/lib/api";

interface Props {
  runId: string;
}

export default function ExportButtons({ runId }: Props) {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
      <a
        href={getExportCSVUrl(runId)}
        download
        className="btn btn-secondary !py-2 !px-3 sm:!px-4 !text-xs whitespace-nowrap"
        id="export-csv-btn"
        style={{ textDecoration: "none" }}
      >
        <FileDown size={14} />
        <span>Export CSV</span>
      </a>
      <a
        href={getExportPDFUrl(runId)}
        download
        className="btn btn-primary !py-2 !px-3 sm:!px-4 !text-xs whitespace-nowrap"
        id="export-pdf-btn"
        style={{ textDecoration: "none" }}
      >
        <FileText size={14} />
        <span>Export PDF Report</span>
      </a>
    </div>
  );
}

