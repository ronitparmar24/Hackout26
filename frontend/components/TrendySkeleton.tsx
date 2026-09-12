"use client";

import React from "react";
import GlassCard from "./GlassCard";

interface Props {
  height?: number | string;
  width?: number | string;
  className?: string;
  type?: "card" | "text" | "chart";
}

export default function TrendySkeleton({ height = 130, width = "100%", className = "", type = "card" }: Props) {
  if (type === "text") {
    return (
      <div 
        className={`bg-white/5 rounded-md relative overflow-hidden ${className}`} 
        style={{ height, width }}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    );
  }

  if (type === "chart") {
    return (
      <GlassCard className={`p-6 flex flex-col gap-4 relative overflow-hidden ${className}`} style={{ height, width }}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="w-1/3 h-6 bg-white/10 rounded-md" />
        <div className="flex-1 flex items-end gap-2 mt-4">
          {[40, 70, 45, 90, 65, 30, 85].map((h, i) => (
            <div key={i} className="flex-1 bg-white/5 rounded-t-md" style={{ height: `${h}%` }} />
          ))}
        </div>
      </GlassCard>
    );
  }

  // Default card
  return (
    <GlassCard className={`p-6 relative overflow-hidden ${className}`} style={{ height, width }}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/10" />
        <div className="flex-1">
          <div className="w-2/3 h-4 bg-white/10 rounded-md mb-2" />
          <div className="w-1/2 h-3 bg-white/5 rounded-md" />
        </div>
      </div>
      <div className="w-full h-8 bg-white/5 rounded-md mt-auto" />
    </GlassCard>
  );
}
