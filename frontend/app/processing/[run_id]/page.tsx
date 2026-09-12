"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2, Loader2, Database, BrainCircuit, Activity } from "lucide-react";
import GlassCard from "@/components/GlassCard";

const steps = [
  { id: 1, label: "Parsing CSV & Validating Schema", icon: <Database className="w-5 h-5" /> },
  { id: 2, label: "Calculating Base GHG Factors", icon: <Activity className="w-5 h-5" /> },
  { id: 3, label: "Detecting Outliers (Isolation Forest)", icon: <BrainCircuit className="w-5 h-5" /> },
  { id: 4, label: "Synthesizing AI Executive Summary", icon: <CheckCircle2 className="w-5 h-5" /> },
];

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const runId = params.run_id;
  
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Simulate realistic pipeline stages before redirecting
    const timer1 = setTimeout(() => setCurrentStep(2), 1500);
    const timer2 = setTimeout(() => setCurrentStep(3), 3500);
    const timer3 = setTimeout(() => setCurrentStep(4), 5000);
    const timer4 = setTimeout(() => {
      router.push(`/dashboard/${runId}`);
    }, 6500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [runId, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <GlassCard className="p-12 max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-4 tracking-wide flex items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          AI Engine Processing
        </h1>
        <p className="text-white/50 mb-12">Analyzing multi-tier supply chain emissions...</p>

        <div className="space-y-6 text-left max-w-md mx-auto">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isPending = currentStep < step.id;

            return (
              <div 
                key={step.id} 
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500
                  ${isCompleted ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : ''}
                  ${isCurrent ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 scale-105 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : ''}
                  ${isPending ? 'bg-white/5 border border-white/10 text-white/30' : ''}
                `}
              >
                <div className="shrink-0">
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : 
                   isCurrent ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                   step.icon}
                </div>
                <div className="font-medium">{step.label}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
