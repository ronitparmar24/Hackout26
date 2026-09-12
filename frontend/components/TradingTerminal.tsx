"use client";

import React, { useState } from "react";
import { ArrowRight, Leaf, Coins, ShieldCheck, Activity, Terminal } from "lucide-react";
import GlassCard from "./GlassCard";
import Button from "./Button";
import AnimatedCounter from "./AnimatedCounter";

interface TradingTerminalProps {
  initialEmissions: number;
}

const OFFSETS = [
  { id: "VRA-FOR", name: "Verra Forestry (Brazil)", price: 15.2, type: "Nature", risk: "Low" },
  { id: "GS-REN", name: "Gold Standard Wind (India)", price: 12.1, type: "Energy", risk: "Low" },
  { id: "BLU-CRB", name: "Mangrove Restoration (Indonesia)", price: 34.5, type: "Nature", risk: "Medium" },
  { id: "DAC-CLMW", name: "Climeworks DAC (Iceland)", price: 350.0, type: "Tech", risk: "Zero" },
];

export default function TradingTerminal({ initialEmissions }: TradingTerminalProps) {
  const [residual, setResidual] = useState(initialEmissions);
  const [selectedOffset, setSelectedOffset] = useState(OFFSETS[0]);
  const [orderAmount, setOrderAmount] = useState<number | "">("");
  const [trades, setTrades] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteTrade = () => {
    const amount = Number(orderAmount);
    if (!amount || amount <= 0 || amount > residual) return;

    setIsExecuting(true);
    
    // Simulate network delay for dramatic effect
    setTimeout(() => {
      setResidual((prev) => Math.max(0, prev - amount));
      setTrades((prev) => [
        {
          id: Math.random().toString(36).substring(7),
          asset: selectedOffset.name,
          symbol: selectedOffset.id,
          tons: amount,
          price: selectedOffset.price,
          total: amount * selectedOffset.price,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      setOrderAmount("");
      setIsExecuting(false);
    }, 800);
  };

  const totalSpent = trades.reduce((acc, t) => acc + t.total, 0);
  const progressPct = ((initialEmissions - residual) / initialEmissions) * 100;

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* LEFT: Order Execution (7 cols) */}
      <GlassCard className="lg:col-span-7 p-6 border-cyan-500/30 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-6 text-cyan-400 font-mono text-sm uppercase tracking-wider font-bold">
            <Terminal className="w-4 h-4" />
            <span>Block Trade Execution</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {OFFSETS.map((offset) => (
              <div
                key={offset.id}
                onClick={() => setSelectedOffset(offset)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedOffset.id === offset.id
                    ? "bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    : "bg-white/[0.02] border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-white text-sm">{offset.id}</div>
                  <div className="font-mono text-emerald-400 text-sm font-bold">${offset.price.toFixed(2)}</div>
                </div>
                <div className="text-xs text-white/50 truncate mb-2">{offset.name}</div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">{offset.type}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">Risk: {offset.risk}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
            <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <label className="block text-xs font-mono text-white/50 mb-2 uppercase">Order Size (tCO₂e)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value ? Number(e.target.value) : "")}
                    placeholder="0"
                    className="w-40 bg-transparent border-b-2 border-white/20 focus:border-cyan-400 text-3xl font-heading text-white font-bold outline-none transition-colors py-1"
                  />
                  <button
                    type="button"
                    onClick={() => setOrderAmount(Math.floor(residual))}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-cyan-300"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-white/50 mb-1 uppercase">Estimated Cost</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  ${((Number(orderAmount) || 0) * selectedOffset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full justify-center py-4 text-sm tracking-widest font-mono shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          onClick={handleExecuteTrade}
          disabled={!orderAmount || orderAmount <= 0 || orderAmount > residual || isExecuting}
        >
          {isExecuting ? (
            <span className="animate-pulse">EXECUTING BLOCK TRADE...</span>
          ) : (
            <span className="flex items-center gap-2">
              CONFIRM PURCHASE <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </GlassCard>

      {/* RIGHT: Portfolio & Order Book (5 cols) */}
      <div className="lg:col-span-5 space-y-6 flex flex-col">
        {/* Net Zero Tracker */}
        <GlassCard className="p-6 border-emerald-500/30 bg-emerald-950/20 relative overflow-hidden flex-shrink-0">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
          
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-mono text-sm uppercase tracking-wider font-bold">
            <Activity className="w-4 h-4" />
            <span>Net-Zero Portfolio Tracker</span>
          </div>

          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-xs text-white/50 font-mono uppercase mb-1">Unabated Scope 3</div>
              <div className="text-4xl font-bold font-heading text-white">
                <AnimatedCounter value={residual} decimals={1} />
                <span className="text-sm font-sans text-white/40 ml-2">/ {initialEmissions.toLocaleString()} t</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/50 font-mono uppercase mb-1">Total Deployed</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                <AnimatedCounter value={totalSpent} decimals={0} prefix="$" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-mono text-white/40 mb-1">
              <span>0%</span>
              <span className="text-emerald-400">NET ZERO PROGRESS ({progressPct.toFixed(1)}%)</span>
              <span>100%</span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPct}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Ledger / History */}
        <GlassCard className="p-6 flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center gap-2 mb-4 text-white/80 font-mono text-sm uppercase tracking-wider font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Settlement Ledger</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {trades.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/30 font-mono text-xs text-center p-4 border border-dashed border-white/10 rounded-xl">
                <Coins className="w-8 h-8 mb-2 opacity-50" />
                No block trades executed.<br />Purchase offsets to build your Net-Zero portfolio.
              </div>
            ) : (
              trades.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex justify-between items-center animate-fade-in-up">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{t.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">FILLED</span>
                    </div>
                    <div className="text-[10px] text-white/40 font-mono mt-1">
                      {new Date(t.timestamp).toLocaleTimeString()} • {t.asset}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      {t.tons.toLocaleString()} t
                    </div>
                    <div className="text-[10px] text-white/50 font-mono mt-0.5">
                      ${t.total.toLocaleString(undefined, { maximumFractionDigits: 0 })} @ ${t.price}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
