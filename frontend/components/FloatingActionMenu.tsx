"use client";

import React, { useState } from "react";
import { Sparkles, FileDown, Plus, MessageSquare, ShieldAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const runId = searchParams.get("run_id");

  const actions = [
    {
      name: "Ask AI Assistant",
      icon: MessageSquare,
      color: "text-cyan-400",
      onClick: () => {
        setIsOpen(false);
        router.push(runId ? `/terminal?run_id=${runId}` : "/terminal");
      }
    },
    {
      name: "Run Audit",
      icon: ShieldAlert,
      color: "text-red-400",
      onClick: () => {
        setIsOpen(false);
        router.push(runId ? `/compliance?run_id=${runId}` : "/compliance");
      }
    },
    {
      name: "Export Report",
      icon: FileDown,
      color: "text-emerald-400",
      onClick: () => {
        setIsOpen(false);
        window.print();
      }
    }
  ];

  return (
    <div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Expanded Menu Actions */}
      <div 
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col gap-2 transition-all duration-300 origin-bottom ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10 text-white shadow-xl whitespace-nowrap transition-all"
          >
            <action.icon className={`w-4 h-4 ${action.color}`} />
            <span className="font-semibold text-sm">{action.name}</span>
          </button>
        ))}
      </div>

      {/* Main Pill Trigger */}
      <button 
        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)] border border-cyan-500/30 transition-all duration-300 ${
          isOpen ? "bg-cyan-900/60 text-cyan-300 scale-105" : "bg-black/60 backdrop-blur-md text-white hover:bg-cyan-900/40"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Sparkles className={`w-5 h-5 ${isOpen ? "text-cyan-400 animate-pulse" : "text-cyan-400"}`} />
        <span className="font-heading font-bold text-sm tracking-wider">ACTIONS</span>
        <Plus className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
      </button>
    </div>
  );
}
