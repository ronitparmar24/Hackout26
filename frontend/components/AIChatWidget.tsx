"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { chatWithData } from "@/lib/api";

export default function AIChatWidget({ runId }: { runId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "bot"|"user", content: string}[]>([
    { role: "bot", content: "Hi! I'm your CarbonSense AI. Ask me anything about your supply chain data." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await chatWithData(runId, userMessage);
      setMessages((prev) => [...prev, { role: "bot", content: res.response }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "bot", content: "Sorry, I couldn't process that request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] z-50 group"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.1)] flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2 text-cyan-400">
          <Bot className="w-5 h-5" />
          <span className="font-semibold text-sm">CarbonSense AI</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user' 
                ? 'bg-blue-500/20 border border-blue-500/30 text-blue-100' 
                : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-50 rounded-2xl px-4 py-2 text-sm animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your anomalies..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-cyan-500/50"
          />
          <button 
            onClick={sendMessage}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
