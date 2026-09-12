"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import GlassCard from "./GlassCard";
import Button from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[CarbonSense ErrorBoundary] Caught component error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <GlassCard
            variant="strong"
            className="max-w-xl w-full p-8 border-red-500/30 bg-red-950/20 text-center shadow-[0_0_40px_rgba(239,68,68,0.15)] relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold font-heading text-white mb-2">
              Component Error Intercepted
            </h2>
            <p className="text-xs text-white/60 font-sans leading-relaxed mb-6">
              CarbonSense caught an unexpected runtime fault in this view. Your active session and backend telemetry data remain secure.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-xl bg-black/40 border border-white/10 text-left font-mono text-[11px] text-red-300/90 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="w-full sm:w-auto text-xs px-5 py-2.5 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Try Recovering View
              </Button>

              <a href="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full justify-center text-xs px-5 py-2.5"
                  icon={<Home className="w-3.5 h-3.5" />}
                >
                  Return to Dashboard
                </Button>
              </a>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
