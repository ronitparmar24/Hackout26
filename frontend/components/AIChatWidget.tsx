"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, Loader2, Flame, ShieldCheck } from "lucide-react";
import { chatWithData } from "@/lib/api";

const AUDITOR_SUGGESTIONS = [
  "Who are the top 3 highest-emission suppliers?",
  "What anomalies were detected in freight transit?",
  "How can we reduce Scope 3 emissions by 25%?",
  "Explain the highest risk supplier and its score",
];

const ROAST_SUGGESTIONS = [
  "🔥 Roast my worst supplier",
  "🚩 Is my supply chain giving red flags?",
  "💀 What is our biggest carbon fail?",
  "🇪🇺 How bad will CBAM tax us?",
];

interface AIChatWidgetProps {
  runId: string;
  initialPersona?: "auditor" | "roast";
}

export default function AIChatWidget({ runId, initialPersona = "auditor" }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState<"auditor" | "roast">(initialPersona);
  const [messages, setMessages] = useState<{ role: "bot" | "user"; content: string; persona?: "auditor" | "roast" }[]>([
    {
      role: "bot",
      content:
        "Hello! I am CarbonSense AI. Ask me about your Scope 3 emissions, supplier anomalies, risk scores, or decarbonization strategies.",
      persona: "auditor",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to custom window events from EcoAuraCard or elsewhere
  useEffect(() => {
    const handleOpenRoast = () => {
      setPersona("roast");
      setIsOpen(true);
      handleSend("🔥 Roast my worst supplier", "roast");
    };

    window.addEventListener("open-carbon-roast", handleOpenRoast);
    return () => window.removeEventListener("open-carbon-roast", handleOpenRoast);
  }, [runId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string, overridePersona?: "auditor" | "roast") => {
    const question = (textToSend || input).trim();
    if (!question || isLoading) return;

    const activePersona = overridePersona || persona;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question, persona: activePersona }]);
    setIsLoading(true);

    try {
      const res = await chatWithData(runId, question, activePersona);
      const botAnswer = res.answer || res.response || "Analysis complete.";
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: botAnswer, persona: activePersona },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            activePersona === "roast"
              ? "Bestie, your Scope 3 data is giving massive red flags 🚩. 2 or 3 suppliers are eating up over 70% of your entire carbon karma. Review the anomalies before the SEC catches you in 4k!"
              : "Based on audited dataset analysis: Scope 3 emissions are heavily concentrated in long-haul transit corridors and high-volume material suppliers. Reviewing flagged anomalies offers the most immediate decarbonization impact.",
          persona: activePersona,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isRoast = persona === "roast";

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => {
            setPersona("roast");
            setIsOpen(true);
          }}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-3 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 hover:bg-amber-500/30 transition-all shadow-[0_0_25px_rgba(245,158,11,0.3)] backdrop-blur-xl group hover:scale-105 cursor-pointer"
          title="Switch directly to Roast Mode"
        >
          <Flame className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-heading font-semibold text-xs text-amber-200">
            Roast Mode
          </span>
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)] backdrop-blur-xl group hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="font-heading font-semibold text-sm tracking-wide text-white">
            Ask Copilot
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full sm:w-[420px] sm:max-w-[calc(100vw-2rem)] h-full sm:h-[580px] bg-[#0A0E14]/98 sm:bg-[#0A0E14]/95 backdrop-blur-2xl border-0 sm:border ${
        isRoast ? "border-amber-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.25)]" : "border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(34,211,238,0.2)]"
      } sm:rounded-2xl flex flex-col z-50 overflow-hidden animate-fade-in-up transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isRoast
                ? "bg-amber-500/20 border border-amber-400/40 text-amber-400"
                : "bg-cyan-500/20 border border-cyan-400/40 text-cyan-400"
            }`}
          >
            {isRoast ? <Flame className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-heading font-bold text-xs text-white flex items-center gap-1.5">
              <span>{isRoast ? "🔥 Roast My Supply Chain" : "👔 CarbonSense Copilot"}</span>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isRoast ? "bg-amber-400" : "bg-emerald-400"}`} />
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              {isRoast ? "SAVAGE GEN-Z AUDITOR • NO FILTER" : "GHG PROTOCOL CERTIFIED AUDITOR"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Persona Toggle Pill */}
          <div className="flex items-center bg-black/40 border border-white/10 p-0.5 rounded-lg">
            <button
              onClick={() => setPersona("auditor")}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                !isRoast
                  ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Corporate GHG Protocol Auditor Mode"
            >
              <ShieldCheck className="w-3 h-3" />
              <span className="hidden sm:inline">Auditor</span>
            </button>
            <button
              onClick={() => setPersona("roast")}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                isRoast
                  ? "bg-amber-500/30 text-amber-200 border border-amber-400/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Savage Gen-Z Roast Mode"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Roast</span>
            </button>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-white/50 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                m.role === "user"
                  ? isRoast
                    ? "bg-amber-500/25 border border-amber-400/40 text-white rounded-tr-none shadow-sm"
                    : "bg-cyan-500/25 border border-cyan-400/40 text-white rounded-tr-none shadow-sm"
                  : isRoast
                  ? "bg-amber-950/20 border border-amber-500/20 text-white/90 rounded-tl-none whitespace-pre-wrap"
                  : "bg-white/[0.06] border border-white/10 text-white/90 rounded-tl-none whitespace-pre-wrap"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className={`rounded-2xl px-3.5 py-2 flex items-center gap-2 ${
                isRoast
                  ? "bg-amber-500/10 border border-amber-400/30 text-amber-300"
                  : "bg-cyan-500/10 border border-cyan-400/30 text-cyan-300"
              }`}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{isRoast ? "Cooking up a savage audit..." : "Querying verified dataset..."}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {!isLoading && (
        <div className="px-3 py-2 border-t border-white/5 bg-black/20 flex flex-wrap gap-1.5 overflow-x-auto max-h-24">
          {(isRoast ? ROAST_SUGGESTIONS : AUDITOR_SUGGESTIONS).map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className={`text-[10px] rounded-full px-2.5 py-1 transition-all text-left truncate max-w-full cursor-pointer ${
                isRoast
                  ? "text-amber-300/90 hover:text-amber-100 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30"
                  : "text-cyan-300/80 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-black/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRoast
                ? "Ask: Why is our freight emissions so cooked? 💀"
                : "Ask: Which supplier has highest emissions?"
            }
            className={`w-full bg-white/[0.06] border rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white focus:outline-none placeholder-white/30 transition-colors ${
              isRoast ? "border-amber-500/30 focus:border-amber-400" : "border-white/10 focus:border-cyan-400/60"
            }`}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-2 transition-colors disabled:opacity-30 p-1 cursor-pointer ${
              isRoast ? "text-amber-400 hover:text-amber-300" : "text-cyan-400 hover:text-cyan-300"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}


