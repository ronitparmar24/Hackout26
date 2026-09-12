"use client";

import React from "react";

interface GradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export default function GradientBackground({
  className = "",
  children,
}: GradientBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated gradient mesh background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {/* Deep background base */}
        <div className="absolute inset-0 bg-[#0A0E14]" />

        {/* Mesh Orb 1: Emerald #10B981 */}
        <div
          className="absolute -top-[20%] -left-[10%] h-[70vw] w-[70vw] max-h-[850px] max-w-[850px] rounded-full blur-[120px] opacity-[0.14] animate-mesh-slow"
          style={{
            background: "radial-gradient(circle, #10B981 0%, rgba(16, 185, 129, 0) 70%)",
            animationDelay: "0s",
          }}
        />

        {/* Mesh Orb 2: Teal #22D3EE */}
        <div
          className="absolute top-[30%] -right-[15%] h-[65vw] w-[65vw] max-h-[750px] max-w-[750px] rounded-full blur-[130px] opacity-[0.12] animate-mesh-slow"
          style={{
            background: "radial-gradient(circle, #22D3EE 0%, rgba(34, 211, 238, 0) 70%)",
            animationDelay: "-5s",
          }}
        />

        {/* Mesh Orb 3: Deep Blue #1E3A8A */}
        <div
          className="absolute -bottom-[20%] left-[20%] h-[75vw] w-[75vw] max-h-[900px] max-w-[900px] rounded-full blur-[140px] opacity-[0.15] animate-mesh-slow"
          style={{
            background: "radial-gradient(circle, #1E3A8A 0%, rgba(30, 58, 138, 0) 70%)",
            animationDelay: "-10s",
          }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {children}
    </div>
  );
}
