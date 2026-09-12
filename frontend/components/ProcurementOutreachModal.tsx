"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, Sparkles, Mail, ShieldAlert, Flame, FileText } from "lucide-react";
import { Supplier } from "@/lib/api";

interface ProcurementOutreachModalProps {
  supplier: Supplier;
  onClose: () => void;
}

type Tone = "collaborative" | "mandate" | "ultimatum";

export default function ProcurementOutreachModal({
  supplier,
  onClose,
}: ProcurementOutreachModalProps) {
  const [tone, setTone] = useState<Tone>("mandate");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  
  // Calculate some dynamic values for the text
  const totalEmissionsTons = (supplier.total_emissions / 1000).toFixed(1);
  const estimatedTaxLiability = (supplier.total_emissions / 1000 * 85).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const anomalyReason = supplier.anomaly_reason || supplier.risk_reason || "Statistical divergence in carbon intensity compared to tier and material cohort averages.";

  const getFullText = (t: Tone) => {
    if (t === "collaborative") {
      return `Subject: Partnership on Decarbonization Initiatives - ${supplier.supplier_name}

Hi Team at ${supplier.supplier_name},

As part of our commitment to reducing Scope 3 emissions across our supply chain, we have recently completed our annual carbon audit using CarbonSense AI. 

In reviewing our ${supplier.tier} partners, we noticed that your recent carbon footprint for the materials provided is approximately ${totalEmissionsTons} tCO₂e. Our models have flagged this as higher than the expected baseline for your cohort, primarily due to ${anomalyReason}.

We value our partnership and would like to work together to identify immediate reduction opportunities. We have data suggesting that switching to a higher mix of renewable energy or shifting freight modes could reduce this footprint significantly. 

Could we schedule a call next week to discuss potential sustainability initiatives and how we can support you in this transition?

Best regards,
Procurement & Sustainability Team`;
    }

    if (t === "mandate") {
      return `Subject: ACTION REQUIRED: Scope 3 Emissions Compliance - ${supplier.supplier_name}

To the Management Team at ${supplier.supplier_name},

We are contacting you regarding your current carbon emissions performance. Our latest Scope 3 audit using CarbonSense AI has flagged ${supplier.supplier_name} as a high-risk outlier within our ${supplier.tier} supply chain.

Your assessed footprint of ${totalEmissionsTons} tCO₂e significantly deviates from acceptable baselines. Specifically, the audit flagged: ${anomalyReason}. 

As impending CBAM and SEC climate regulations take effect, this level of carbon intensity introduces a projected tax liability of $${estimatedTaxLiability} to our supply chain, which is unsustainable for our continued partnership.

We require a formal Decarbonization Action Plan from your team within the next 30 days detailing how you intend to align with our net-zero targets. 

Please confirm receipt of this mandate.

Sincerely,
Enterprise Procurement Compliance`;
    }

    // Ultimatum (Roast)
    return `Subject: URGENT: Critical Carbon Anomaly - Immediate Rectification Required

Listen up ${supplier.supplier_name},

Your latest carbon data is completely unacceptable. Our AI just audited our ${supplier.tier} suppliers and your footprint of ${totalEmissionsTons} tCO₂e is a massive red flag that is destroying our ESG rating.

Reason flagged: ${anomalyReason}.

Your carbon intensity is literally projected to cost us $${estimatedTaxLiability} in incoming CBAM carbon taxes. We are not going to foot the bill for your lack of renewable energy and inefficient transit modes. 

If we don't see an immediate shift to greener practices or receive a legally binding decarbonization commitment within 14 days, we will trigger our automated vendor substitution protocols and switch to one of the 4 greener alternatives our AI has already matched us with.

Fix this immediately.

- Chief Procurement Officer`;
  };

  useEffect(() => {
    setIsGenerating(true);
    setDisplayedText("");
    const targetText = getFullText(tone);
    let i = 0;
    
    // Simulate typing effect
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + targetText.charAt(i));
      i++;
      if (i >= targetText.length) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 5); // very fast typing effect

    return () => clearInterval(interval);
  }, [tone]);

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullText(tone));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{
          background: "linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)",
          border: `1px solid rgba(34, 211, 238, 0.3)`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px -5px rgba(34, 211, 238, 0.2)`,
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold font-heading text-white tracking-tight">AI Outreach Copilot</h3>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono border border-red-500/40 uppercase font-bold tracking-wider">
                  Anomaly Targeted
                </span>
              </div>
              <p className="text-xs text-white/50 font-sans">
                Drafting decarbonization mandate for: <strong className="text-white">{supplier.supplier_name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Sidebar / Tone Selection */}
          <div className="lg:w-64 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/20 flex flex-col gap-4 overflow-y-auto">
            <div>
              <div className="text-[10px] font-mono uppercase text-white/40 mb-2 font-bold tracking-wider">Select Mandate Tone</div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setTone("collaborative")}
                  className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tone === "collaborative"
                      ? "bg-emerald-500/20 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${tone === "collaborative" ? "text-emerald-400" : "text-white"}`}>
                    <Mail className="w-4 h-4" /> Collaborative
                  </div>
                  <div className="text-[10px] text-white/50 leading-relaxed">
                    Gentle nudge. Focuses on partnership and supporting their transition.
                  </div>
                </button>

                <button
                  onClick={() => setTone("mandate")}
                  className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tone === "mandate"
                      ? "bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${tone === "mandate" ? "text-cyan-400" : "text-white"}`}>
                    <ShieldAlert className="w-4 h-4" /> Formal Mandate
                  </div>
                  <div className="text-[10px] text-white/50 leading-relaxed">
                    Professional but firm. Requires action plan within 30 days. Highlights CBAM risk.
                  </div>
                </button>

                <button
                  onClick={() => setTone("ultimatum")}
                  className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tone === "ultimatum"
                      ? "bg-red-500/20 border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${tone === "ultimatum" ? "text-red-400" : "text-white"}`}>
                    <Flame className="w-4 h-4" /> Savage Ultimatum
                  </div>
                  <div className="text-[10px] text-white/50 leading-relaxed">
                    Aggressive zero-tolerance approach. Threatens immediate vendor substitution.
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">Generated Using</div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                CarbonSense GPT-4 Copilot
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col overflow-hidden relative">
            <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/10 p-5 font-sans text-sm text-white/80 whitespace-pre-wrap overflow-y-auto leading-relaxed">
              {displayedText}
              {isGenerating && <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />}
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white/70" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>

              <button
                className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 border border-cyan-300 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => {
                  alert("Draft saved to outbox and ready for executive review.");
                  onClose();
                }}
              >
                <Mail className="w-4 h-4" />
                <span>Save to Drafts</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
