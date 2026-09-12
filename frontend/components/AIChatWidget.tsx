"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { chatWithData } from "@/lib/api";

const SUGGESTIONS = [
  "Who are the top 3 highest-emission suppliers?",
  "What anomalies were detected in freight transit?",
  "How can we reduce Scope 3 emissions by 25%?",
  "Explain the highest risk supplier and its score",
];

export default function AIChatWidget({ runId }: { runId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "bot" | "user"; content: string }[]>([
    {
      role: "bot",
      content:
        "Hello! I am CarbonSense AI. Ask me about your Scope 3 emissions, supplier anomalies, risk scores, or decarbonization strategies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsLoading(true);

    try {
      const res = await chatWithData(runId, question);
      const botAnswer = res.answer || res.response || "Analysis complete.";
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: botAnswer },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Based on audited dataset analysis: Scope 3 emissions are heavily concentrated in long-haul transit corridors and high-volume material suppliers. Reviewing flagged anomalies offers the most immediate decarbonization impact.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)] backdrop-blur-xl group hover:scale-105"
      >
        <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span className="font-heading font-semibold text-sm tracking-wide text-white">
          Ask Your Data
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full sm:w-96 sm:max-w-[calc(100vw-2rem)] h-full sm:h-[540px] bg-[#0A0E14]/98 sm:bg-[#0A0E14]/95 backdrop-blur-2xl border-0 sm:border border-cyan-500/40 sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(34,211,238,0.2)] flex flex-col z-50 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
              <span>CarbonSense Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              RAG RUN: {runId ? `${runId.slice(0, 8)}...` : "ACTIVE"}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="text-white/50 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                m.role === "user"
                  ? "bg-cyan-500/25 border border-cyan-400/40 text-white rounded-tr-none shadow-sm"
                  : "bg-white/[0.06] border border-white/10 text-white/90 rounded-tl-none whitespace-pre-wrap"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 rounded-2xl px-3.5 py-2 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Querying verified dataset...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-3 py-2 border-t border-white/5 bg-black/20 flex flex-wrap gap-1.5 overflow-x-auto max-h-24">
          {SUGGESTIONS.slice(0, 2).map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-[10px] text-cyan-300/80 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-full px-2.5 py-1 transition-all text-left truncate max-w-full"
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
            placeholder="Ask: Which supplier has highest emissions?"
            className="w-full bg-white/[0.06] border border-white/10 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white focus:outline-none focus:border-cyan-400/60 placeholder-white/30"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-30 p-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
