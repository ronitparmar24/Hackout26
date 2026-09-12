"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Database,
  Calculator,
  BrainCircuit,
  Layers,
  Sparkles,
  FileCheck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { getRun, RunResponse } from "@/lib/api";

interface PipelineStep {
  id: number;
  label: string;
  detail: string;
  icon: React.ReactNode;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    label: "Parsing your data",
    detail: "Validating CSV columns and multi-tier supplier headers",
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: 2,
    label: "Estimating missing values (regression)",
    detail: "Predicting unknown kWh electricity and transit km using Random Forest",
    icon: <Calculator className="w-5 h-5" />,
  },
  {
    id: 3,
    label: "Calculating emissions",
    detail: "Mapping UK DEFRA and US EPA emission factors across energy & freight",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    id: 4,
    label: "Detecting anomalies (Isolation Forest)",
    detail: "Scoring statistical divergence to isolate high-carbon supplier outliers",
    icon: <BrainCircuit className="w-5 h-5" />,
  },
  {
    id: 5,
    label: "Clustering suppliers (KMeans)",
    detail: "Grouping peer vendors into low, moderate, and intensive cohorts",
    icon: <Layers className="w-5 h-5" />,
  },
  {
    id: 6,
    label: "Generating recommendations (cosine similarity)",
    detail: "Identifying greener drop-in supplier substitutions in matching tiers",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: 7,
    label: "Finalizing report",
    detail: "Building cloud dashboard metrics and executive audit summaries",
    icon: <FileCheck className="w-5 h-5" />,
  },
];

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const runId = typeof params.run_id === "string" ? params.run_id : "";

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [runData, setRunData] = useState<RunResponse | null>(null);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  // Poll backend run status while orchestrating visual steps
  useEffect(() => {
    if (!runId) return;

    let isMounted = true;

    // Check backend status
    const checkBackendStatus = async () => {
      try {
        const data = await getRun(runId);
        if (isMounted && data) {
          setRunData(data);
          if (data.status === "done") {
            setIsDone(true);
          }
        }
      } catch (err) {
        // Run may still be processing in backend
      }
    };

    const pollInterval = setInterval(checkBackendStatus, 1500);
    checkBackendStatus();

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [runId]);

  // Advance pipeline steps smoothly (minimum step duration so each step is appreciated)
  useEffect(() => {
    if (currentStepIndex < PIPELINE_STEPS.length - 1) {
      const stepTimer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 950);
      return () => clearTimeout(stepTimer);
    } else {
      // All 7 steps reached. Once backend reports done (or after slight buffer), redirect
      const finalizeTimer = setTimeout(() => {
        setIsRedirecting(true);
        setTimeout(() => {
          router.push(`/dashboard/${runId}`);
        }, 800);
      }, 1200);
      return () => clearTimeout(finalizeTimer);
    }
  }, [currentStepIndex, isDone, router, runId]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{
            opacity: isRedirecting ? 0 : 1,
            scale: isRedirecting ? 1.08 : 1,
            filter: isRedirecting ? "blur(10px)" : "blur(0px)",
          }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl"
        >
          <GlassCard
            variant="strong"
            className="p-8 sm:p-12 relative border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.12)] overflow-hidden"
          >
            {/* Specular top glow */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <StatusBadge color="ai" pulse showIcon>
                  PROCESSING SCOPE 3 PIPELINE
                </StatusBadge>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-2 flex items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span>AI Engine at Work</span>
              </h1>

              <p className="text-white/60 text-sm sm:text-base font-sans max-w-md mx-auto">
                Running regression estimation, isolation forest anomaly audits, and supplier clustering.
              </p>

              {runData && (
                <div className="mt-4 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-white/60">
                  <span>File: <strong className="text-white">{runData.filename}</strong></span>
                  <span>•</span>
                  <span>Suppliers: <strong className="text-cyan-400">{runData.total_suppliers}</strong></span>
                </div>
              )}
            </div>

            {/* Vertical Animated Step List */}
            <div className="space-y-3.5 max-w-lg mx-auto mb-8">
              {PIPELINE_STEPS.map((step, idx) => {
                const isStepCompleted = idx < currentStepIndex;
                const isStepActive = idx === currentStepIndex;
                const isStepPending = idx > currentStepIndex;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border
                      ${
                        isStepCompleted
                          ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                          : isStepActive
                          ? "bg-cyan-500/15 border-cyan-400/50 text-white shadow-[0_0_25px_rgba(34,211,238,0.25)] scale-[1.02]"
                          : "bg-white/[0.02] border-white/5 text-white/30"
                      }
                    `}
                  >
                    {/* Status Icon Indicator */}
                    <div className="flex-shrink-0">
                      {isStepCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : isStepActive ? (
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center animate-pulse">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 text-white/20 flex items-center justify-center">
                          {step.icon}
                        </div>
                      )}
                    </div>

                    {/* Step Label & Subtitle */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-heading text-sm font-semibold truncate ${
                            isStepCompleted
                              ? "text-emerald-300"
                              : isStepActive
                              ? "text-cyan-300"
                              : "text-white/40"
                          }`}
                        >
                          {step.id}. {step.label}
                        </span>

                        {isStepCompleted && (
                          <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
                            Done
                          </span>
                        )}
                        {isStepActive && (
                          <span className="text-[10px] uppercase font-mono font-bold text-cyan-300 animate-pulse">
                            Active
                          </span>
                        )}
                      </div>

                      <div
                        className={`text-xs truncate ${
                          isStepActive ? "text-white/70" : "text-white/40"
                        }`}
                      >
                        {step.detail}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="max-w-lg mx-auto pt-2">
              <div className="flex items-center justify-between text-xs text-white/50 mb-2 font-mono">
                <span>PIPELINE PROGRESS</span>
                <span>
                  {Math.round(((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  style={{
                    width: `${((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
