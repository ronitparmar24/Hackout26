"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import GlassCard from "./GlassCard";

interface Props {
  text: string;
  speed?: number;
}

export default function TypewriterEffect({ text, speed = 30 }: Props) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index < text.length - 1) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      } else {
        setDisplayedText(text);
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <GlassCard className="p-4 mb-6 border-cyan-500/30 bg-cyan-950/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-cyan-900/40 via-transparent to-transparent pointer-events-none" />
      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
        <Sparkles className="w-5 h-5 text-cyan-400" />
      </div>
      <div className="flex-1 font-mono text-sm leading-relaxed text-cyan-50 relative z-10">
        {displayedText}
        {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />}
      </div>
    </GlassCard>
  );
}
