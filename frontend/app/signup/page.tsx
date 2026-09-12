"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Lock, Mail, Building, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import { supabase, setGuestDemoSession } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
          },
        },
      });

      if (authError) {
        // Fallback demo signup
        localStorage.setItem("carbonsense_user_email", email);
        localStorage.setItem("carbonsense_company_name", companyName);
        localStorage.setItem("carbonsense_guest_token", "demo-guest-token");
        document.cookie = "cs_session=demo-guest-token; path=/; max-age=604800";
        router.push("/upload");
        return;
      }

      if (data.session) {
        document.cookie = `cs_session=${data.session.access_token}; path=/; max-age=604800`;
        router.push("/upload");
      } else {
        // Confirmation required or mock mode
        localStorage.setItem("carbonsense_user_email", email);
        localStorage.setItem("carbonsense_guest_token", "demo-guest-token");
        document.cookie = "cs_session=demo-guest-token; path=/; max-age=604800";
        router.push("/upload");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = () => {
    setGuestDemoSession();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mb-4 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">Create Account</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">Start auditing Scope 3 supply chain emissions today</p>
        </div>

        <GlassCard variant="strong" className="p-8 border-white/15 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400"></div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 font-heading">
                Organization / Company Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Acme Global Industries"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 font-heading">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="sustainability@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 font-heading">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full justify-center text-xs py-2.5 mt-2 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
            >
              Register Organization
            </Button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative px-3 bg-[#0d1424] text-[11px] font-mono text-white/40 uppercase">
              or quick access
            </span>
          </div>

          {/* 1-Click Guest Demo Button */}
          <button
            type="button"
            onClick={handleGuestDemo}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-heading font-medium text-xs transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] group"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Continue as Guest Demo (No Signup)</span>
          </button>

          <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-white/50">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2">
              Sign in
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
