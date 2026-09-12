"use client";

import React, { useState } from "react";
import { X, Share2, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { EcoAuraData } from "@/lib/api";

interface ShareableFlexCardProps {
  data: EcoAuraData | null;
  companyName?: string;
  onClose: () => void;
}

export default function ShareableFlexCard({
  data,
  companyName = "Enterprise Operations",
  onClose,
}: ShareableFlexCardProps) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopyFlex = () => {
    const text = `🌱 Excited to share our verified Scope 3 Carbon Audit powered by CarbonSense AI!
🎯 Eco-Aura Rating: ${data.aura_grade} (${data.aura_score}/100) - ${data.aura_title}
🛡️ CBAM Tax Shield: $${data.potential_cbam_savings_usd.toLocaleString()} projected savings identified
📊 Verified against GHG Protocol Corporate Standard across ${data.total_suppliers} suppliers.
#Scope3 #Decarbonization #ESG #NetZero #Sustainability`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8"
        style={{
          background: "linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)",
          border: `1px solid ${data.aura_color}44`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px -5px ${data.aura_color}33`,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified ESG Flex Badge</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">{companyName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Scope 3 Audited Footprint & Decarbonization Score</p>
        </div>

        {/* Big Graphic Badge */}
        <div
          className="p-6 rounded-2xl relative overflow-hidden text-center mb-6"
          style={{
            background: "linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: `1px solid ${data.aura_color}33`,
          }}
        >
          <div
            className="w-28 h-28 mx-auto rounded-full flex flex-col items-center justify-center shadow-xl relative"
            style={{
              background: `radial-gradient(circle, ${data.aura_color}22 0%, rgba(15, 23, 42, 0.9) 75%)`,
              border: `3px solid ${data.aura_color}`,
              boxShadow: `0 0 30px ${data.aura_color}55`,
            }}
          >
            <span className="text-4xl font-black tracking-tight" style={{ color: data.aura_color }}>
              {data.aura_grade}
            </span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              {data.aura_score}/100
            </span>
          </div>

          <div className="mt-4">
            <div className="text-sm font-bold text-white uppercase tracking-wider">{data.aura_title}</div>
            <div className="text-xs text-slate-400 mt-1 italic max-w-xs mx-auto">
              "{data.vibe_check}"
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-700/50 text-left">
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">CBAM Tax Shield</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                +${data.potential_cbam_savings_usd.toLocaleString()}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Audited Baseline</div>
              <div className="text-base font-bold text-white mt-0.5">
                {data.total_suppliers} Suppliers
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>GHG Protocol Scope 3 & ISO 14064 Compliance Certified</span>
          </div>
        </div>

        {/* Share Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyFlex}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Copy LinkedIn / Social Flex</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
