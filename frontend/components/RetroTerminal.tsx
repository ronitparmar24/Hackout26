"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon } from "lucide-react";

interface CommandLog {
  command: string;
  output: string;
  timestamp: string;
}

export default function RetroTerminal({ runId }: { runId: string | null }) {
  const [history, setHistory] = useState<CommandLog[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const MOCK_SYSTEM_INIT = `[SYSTEM] SCOPE-3 AI COMMAND CENTER v2.1.4
[INIT] Establishing secure handshake with supply chain database...
[OK] Connected to Dataset: ${runId || "NONE"}
Type 'help' to see available commands.`;

  useEffect(() => {
    // Initial welcome message
    setHistory([
      { command: "", output: MOCK_SYSTEM_INIT, timestamp: new Date().toLocaleTimeString() },
    ]);
  }, [runId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    let output = "";

    switch (trimmed) {
      case "help":
        output = `AVAILABLE COMMANDS:
- scan anomalies : Runs Isolation Forest over active dataset
- fetch vendor [name] : Retrieves risk profile for specific vendor
- execute offset [amount] : Transfers funds to carbon treasury
- ping : Checks ML model latency
- clear : Clears terminal history`;
        break;
      case "scan anomalies":
        output = `[PROCESSING] Initializing Isolation Forest...
[DETECTED] 3 Outliers flagged in Tier 3 (Logistics divergence)
[WARN] ANOMALY_MegaPolluter deviates +400% from cluster baseline
[RECOMMENDATION] Shift sourcing to recommended peer (Cosine Similarity: 0.89)`;
        break;
      case "ping":
        output = `Model Latency: 42ms
Database Latency: 12ms
Cache Hit Ratio: 98%
Status: HEALTHY`;
        break;
      case "clear":
        setHistory([]);
        return;
      case "sudo":
      case "rm -rf":
        output = `ACCESS DENIED: ESG Compliance Protocol active. You do not have permission to delete carbon records.`;
        break;
      default:
        if (trimmed.startsWith("fetch vendor")) {
          const name = trimmed.split("fetch vendor")[1].trim() || "UNKNOWN";
          output = `[QUERY] Searching for vendor: ${name.toUpperCase()}...
[RESULT] Found 1 match. 
Tier: 2 | Region: APAC | Risk Score: 78/100
[AI NOTE] High reliance on fossil-fuel inland transport.`;
        } else if (trimmed.startsWith("execute offset")) {
          output = `[FINANCE] Routing offset request to Carbon Treasury...
[SUCCESS] Block trade confirmed. Ledger updated via Zero-Knowledge Proof.`;
        } else if (trimmed) {
          output = `Command not found: ${trimmed}. Type 'help' for available commands.`;
        }
    }

    if (trimmed) {
      setIsTyping(true);
      // Simulate typing delay for effect
      setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          { command: cmd, output, timestamp: new Date().toLocaleTimeString() },
        ]);
        setIsTyping(false);
      }, 600);
    }
    setInput("");
  };

  return (
    <div className="w-full h-[600px] bg-black border-2 border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col font-mono text-emerald-400">
      {/* Terminal Header */}
      <div className="bg-emerald-950/50 px-4 py-2 border-b border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-sm font-bold tracking-widest">ROOT@ESG-CORE ~ /sys/carbon</span>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
        </div>
      </div>

      {/* Terminal Body */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {history.map((log, i) => (
          <div key={i} className="mb-4">
            {log.command && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-600">[{log.timestamp}]</span>
                <span className="text-white">root@esg-core:~$</span>
                <span className="text-emerald-300 font-bold">{log.command}</span>
              </div>
            )}
            <div className="whitespace-pre-wrap text-emerald-500/90 leading-relaxed text-sm">
              {log.output}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-emerald-500/70 mb-2">
            <span className="animate-pulse">Processing request...</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="text-white">root@esg-core:~$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCommand(input);
            }}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-emerald-300 font-bold caret-emerald-400 placeholder-emerald-800"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
