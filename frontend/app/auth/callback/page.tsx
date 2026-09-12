"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Loader2, AlertCircle } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { supabase, setSupabaseUserSession } from "@/lib/supabase";
import { listRuns } from "@/lib/api";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleAuthCallback() {
      try {
        // 1. Check for URL error parameters
        const errorDescription = searchParams.get("error_description") || searchParams.get("error");
        if (errorDescription) {
          throw new Error(errorDescription);
        }

        // 2. Exchange authorization code for session (PKCE) or retrieve active session (Implicit flow)
        let session = null;

        // Check if there is a code param in the URL (PKCE flow)
        const code = searchParams.get("code");
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          session = data.session;
        }

        // If no session yet, check getSession() which parses hash fragment (#access_token=...)
        if (!session) {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          session = data.session;
        }

        if (!session) {
          // Check if session tokens are in window.location.hash
          if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get("access_token");
            if (accessToken) {
              setSupabaseUserSession(accessToken);
            }
          } else {
            throw new Error("No authentication session detected from OAuth callback.");
          }
        } else {
          setSupabaseUserSession(session.access_token, session.user.email);
        }

        // 3. Determine redirect target: /dashboard if user has existing runs, otherwise /upload
        try {
          const runs = await listRuns();
          if (mounted) {
            if (runs && runs.length > 0) {
              router.push("/dashboard");
            } else {
              router.push("/upload");
            }
          }
        } catch (e) {
          if (mounted) router.push("/upload");
        }
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        if (mounted) {
          setError(err.message || "Failed to complete Google sign-in. Please try again.");
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(err.message || "OAuth authentication failed")}`);
          }, 3000);
        }
      }
    }

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <GlassCard variant="strong" className="p-8 border-white/15 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400"></div>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mb-4 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
            <Leaf className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold font-heading text-white mb-2">
            {error ? "Authentication Failed" : "Authenticating with Supabase"}
          </h2>

          {error ? (
            <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                <p className="text-[11px] text-red-400/70 mt-1">Redirecting back to login portal...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
              <p className="text-xs font-mono text-white/60">
                Verifying Google identity & establishing secure session...
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <GlassCard variant="strong" className="p-8 border-white/15 shadow-2xl">
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                <p className="text-xs font-mono text-white/60">Loading OAuth session...</p>
              </div>
            </GlassCard>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

