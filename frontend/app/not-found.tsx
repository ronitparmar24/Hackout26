"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Sparkles, LayoutDashboard } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8 text-center border-white/15 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400" />
        
        <div className="text-7xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">
          404
        </div>
        
        <h2 className="text-xl font-bold font-heading text-white mb-2">
          Page Not Found
        </h2>
        
        <p className="text-xs text-white/60 font-sans leading-relaxed mb-6">
          The requested route or supply chain telemetry report could not be located in the active namespace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full justify-center gap-2 text-xs">
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full justify-center gap-2 text-xs">
              <Home className="w-4 h-4" />
              <span>Intake Portal</span>
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
