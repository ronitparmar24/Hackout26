"use client";

import React, { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { filterNLP } from "@/lib/api";

export default function NLPSearchBar({ onFilter }: { onFilter: (filters: any) => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const filters = await filterNLP(query);
      onFilter(filters);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative group w-full max-w-2xl">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative flex items-center w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden focus-within:border-cyan-500/50 transition-colors">
        <div className="pl-4 text-cyan-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI to filter: 'Show me Tier 1 textile suppliers with anomalies'"
          className="w-full bg-transparent border-none text-white text-sm py-4 pl-3 pr-4 focus:outline-none placeholder-white/30"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border-l border-white/10 flex items-center gap-2 font-medium text-sm"
        >
          {loading ? "Parsing..." : <><Search className="w-4 h-4" /> Search</>}
        </button>
      </div>
    </form>
  );
}
