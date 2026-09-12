"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, ArrowRight, TerminalSquare, Radar, Presentation, Network, FileText, Upload, LayoutDashboard, History, Building2 } from "lucide-react";
import { listRuns } from "@/lib/api";

const COMMANDS = [
  { id: "upload", name: "Intake & Upload", icon: Upload, route: "/" },
  { id: "dashboard", name: "Main Dashboard", icon: LayoutDashboard, route: "/dashboard" },
  { id: "history", name: "Run History", icon: History, route: "/history" },
  { id: "terminal", name: "AI Command Center", icon: TerminalSquare, route: "/terminal" },
  { id: "risk", name: "Climate Risk Radar", icon: Radar, route: "/risk-radar" },
  { id: "waterfall", name: "Carbon Waterfall", icon: Network, route: "/waterfall" },
  { id: "invoicing", name: "Internal Invoicing", icon: FileText, route: "/invoicing" },
  { id: "boardroom", name: "Executive Boardroom", icon: Presentation, route: "/boardroom" },
  { id: "suppliers", name: "Supplier Directory", icon: Building2, route: "/suppliers" },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [runId, setRunId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for CMD+K or CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch runId for routing
  useEffect(() => {
    if (isOpen && !runId) {
      listRuns().then((runs) => {
        if (runs && runs.length > 0) {
          setRunId(runs[0].run_id || (runs[0] as any).id);
        }
      }).catch(() => {});
    }
  }, [isOpen, runId]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        executeCommand(filteredCommands[activeIndex]);
      }
    }
  };

  const executeCommand = (cmd: typeof COMMANDS[0]) => {
    setIsOpen(false);
    let target = cmd.route;
    if (runId && target !== "/" && target !== "/history") {
      if (target === "/dashboard") target = `/dashboard/${runId}`;
      else target = `${target}?run_id=${runId}`;
    }
    router.push(target);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-2xl bg-[#0A0E14] border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/50 mr-3" />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Search pages or actions (e.g. 'Dashboard')..."
            className="flex-1 bg-transparent border-none outline-none text-white text-lg font-sans placeholder-white/30"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1 text-[10px] font-mono text-white/40 bg-white/5 px-2 py-1 rounded">
            <Command className="w-3 h-3" /> <span>K</span>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm font-mono">No results found for "{query}"</div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isActive = idx === activeIndex;
              return (
                <div 
                  key={cmd.id}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isActive ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-white/70 hover:bg-white/5 border border-transparent"
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => executeCommand(cmd)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold text-sm">{cmd.name}</span>
                  </div>
                  {isActive && <ArrowRight className="w-4 h-4 animate-pulse" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
