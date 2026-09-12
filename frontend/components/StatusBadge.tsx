"use client";

import React from "react";
import { Sparkles, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

export type StatusBadgeColor = "low" | "moderate" | "high" | "ai";

interface StatusBadgeProps {
  color: StatusBadgeColor;
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
  showIcon?: boolean;
  pulse?: boolean;
}

export default function StatusBadge({
  color,
  children,
  className = "",
  showDot = true,
  showIcon = false,
  pulse = false,
}: StatusBadgeProps) {
  const colorStyles: Record<
    StatusBadgeColor,
    {
      badge: string;
      dot: string;
      pulseColor: string;
      icon: React.ReactNode;
    }
  > = {
    low: {
      badge: "bg-[rgba(16,185,129,0.12)] text-[var(--low,#10B981)] border-[rgba(16,185,129,0.30)]",
      dot: "bg-[#10B981]",
      pulseColor: "bg-[#10B981]",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />,
    },
    moderate: {
      badge: "bg-[rgba(245,158,11,0.12)] text-[var(--moderate,#F59E0B)] border-[rgba(245,158,11,0.30)]",
      dot: "bg-[#F59E0B]",
      pulseColor: "bg-[#F59E0B]",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />,
    },
    high: {
      badge: "bg-[rgba(239,68,68,0.12)] text-[var(--high,#EF4444)] border-[rgba(239,68,68,0.30)]",
      dot: "bg-[#EF4444]",
      pulseColor: "bg-[#EF4444]",
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />,
    },
    ai: {
      badge:
        "bg-[rgba(34,211,238,0.12)] text-[var(--ai-accent,#22D3EE)] border-[rgba(34,211,238,0.35)] shadow-[0_0_12px_rgba(34,211,238,0.2)]",
      dot: "bg-[#22D3EE]",
      pulseColor: "bg-[#22D3EE]",
      icon: <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />,
    },
  };

  const style = colorStyles[color] || colorStyles.low;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md tracking-wide transition-all ${style.badge} ${className}`.trim()}
    >
      {showIcon && style.icon}

      {showDot && !showIcon && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.pulseColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
        </span>
      )}

      <span>{children}</span>
    </span>
  );
}
