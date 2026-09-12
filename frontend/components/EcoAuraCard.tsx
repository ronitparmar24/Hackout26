"use client";

import React from "react";
import { EcoAuraData } from "@/lib/api";

interface EcoAuraCardProps {
  data: EcoAuraData | null;
  loading?: boolean;
  onOpenRoast?: () => void;
  onOpenShareFlex?: () => void;
}

export default function EcoAuraCard({
  data,
  loading = false,
  onOpenRoast,
  onOpenShareFlex,
}: EcoAuraCardProps) {
  if (loading || !data) {
    return (
      <div
        className="glass-card mb-8 p-6 animate-pulse"
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          minHeight: "180px",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-800" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate circular stroke offset
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.aura_score / 100) * circumference;

  return (
    <div
      className="relative overflow-hidden mb-8 rounded-2xl p-6 transition-all duration-300 shadow-2xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)",
        border: `1px solid ${data.aura_color}33`,
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1), 0 0 24px -6px ${data.aura_color}22`,
      }}
    >
      {/* Background ambient light */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none blur-3xl opacity-20"
        style={{ background: data.aura_color }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-15"
        style={{ background: "#06B6D4" }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Aura Gauge + Grade */}
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-current text-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={data.aura_color}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  filter: `drop-shadow(0 0 8px ${data.aura_color}88)`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className="text-2xl font-black tracking-tight"
                style={{ color: data.aura_color }}
              >
                {data.aura_grade}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {data.aura_score}/100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                Supply Chain Eco-Aura
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${data.aura_color}18`,
                  color: data.aura_color,
                  border: `1px solid ${data.aura_color}44`,
                }}
              >
                {data.aura_title}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Carbon Karma & CBAM Risk Rating
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">
              Evaluated across {data.total_suppliers} vendors • {data.anomaly_count} outliers • {data.concentration_pct}% in top 2 emitters
            </p>
          </div>
        </div>

        {/* Middle: CBAM Financial Exposure */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <span>🇪🇺 EU CBAM Tax Exposure</span>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">€80/t</span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight mt-0.5">
              ${data.cbam_liability_usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <span>⚡ Pot. Savings:</span>
              <span className="font-bold">
                -${data.potential_cbam_savings_usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Gen-Z Quick Actions */}
        <div className="flex flex-wrap lg:flex-col gap-2 w-full lg:w-auto">
          {onOpenRoast && (
            <button
              onClick={onOpenRoast}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
            >
              <span>🔥</span>
              <span>Roast My Footprint</span>
            </button>
          )}

          {onOpenShareFlex && (
            <button
              onClick={onOpenShareFlex}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
            >
              <span>✨</span>
              <span>Share ESG Flex</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Vibe Check Callout */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <span className="text-base flex-shrink-0">💬</span>
          <span className="font-semibold text-slate-400">Vibe Check:</span>
          <span className="italic text-slate-200">{data.vibe_check}</span>
        </div>

        {/* Badges strip */}
        {data.badges && data.badges.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {data.badges.map((b) => (
              <div
                key={b.id}
                title={`${b.name}: ${b.desc}`}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                  b.unlocked
                    ? "bg-slate-800/90 text-slate-200 border-slate-700 hover:border-slate-500"
                    : "bg-slate-900/40 text-slate-600 border-slate-800 opacity-50"
                }`}
              >
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
