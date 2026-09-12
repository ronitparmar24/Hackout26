"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

const BASE_ASSETS = [
  { symbol: "VRA-FOR", name: "Verra Forestry", price: 15.2, volatility: 0.02 },
  { symbol: "GS-REN", name: "Gold Standard Renewables", price: 12.1, volatility: 0.015 },
  { symbol: "BLU-CRB", name: "Mangrove Blue Carbon", price: 34.5, volatility: 0.05 },
  { symbol: "DAC-CLMW", name: "Climeworks DAC", price: 350.0, volatility: 0.005 },
  { symbol: "CHR-BIO", name: "Charm Bio-Oil Sequestration", price: 280.0, volatility: 0.03 },
  { symbol: "BCH-AGR", name: "Agricultural Biochar", price: 125.0, volatility: 0.04 },
  { symbol: "EU-ETS", name: "EU Carbon Allowance", price: 88.5, volatility: 0.08 },
];

export default function CarbonTicker() {
  const [assets, setAssets] = useState(
    BASE_ASSETS.map((a) => ({ ...a, currentPrice: a.price, changePct: 0 }))
  );

  useEffect(() => {
    // Simulate live market fluctuation every 2 seconds
    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((asset) => {
          // Random walk based on volatility
          const shift = (Math.random() - 0.5) * asset.volatility * asset.currentPrice;
          const newPrice = Math.max(0.1, asset.currentPrice + shift);
          const changePct = ((newPrice - asset.price) / asset.price) * 100;
          return { ...asset, currentPrice: newPrice, changePct };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#0a0f1d] border-y border-white/10 overflow-hidden flex items-center h-10 relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0f1d] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0f1d] to-transparent z-10" />

      {/* Ticker Tape */}
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 30, // Adjust speed
        }}
      >
        {/* We duplicate the array 3 times to create a seamless infinite scroll loop */}
        {[...assets, ...assets, ...assets].map((asset, i) => {
          const isUp = asset.changePct > 0;
          const isDown = asset.changePct < 0;
          const isFlat = !isUp && !isDown;

          return (
            <div
              key={`${asset.symbol}-${i}`}
              className="flex items-center gap-3 px-6 border-r border-white/5 font-mono text-xs"
            >
              <div className="flex flex-col items-start leading-none">
                <span className="font-bold text-white tracking-wider">{asset.symbol}</span>
                <span className="text-[9px] text-white/40 font-sans tracking-wide">
                  {asset.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pl-2">
                <span className="text-white/90 font-medium">
                  ${asset.currentPrice.toFixed(2)}
                </span>
                <span
                  className={`flex items-center ${
                    isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-white/40"
                  }`}
                >
                  {isUp && <TrendingUp className="w-3 h-3 mr-0.5" />}
                  {isDown && <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isFlat && <Minus className="w-3 h-3 mr-0.5" />}
                  {Math.abs(asset.changePct).toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
