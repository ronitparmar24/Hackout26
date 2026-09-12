"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong" | "heavy" | "interactive" | "subtle" | "glow" | "danger" | "holo";
  glowColor?: "emerald" | "teal" | "amber" | "blue" | "purple" | "red" | "ai";
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  id?: string;
}

export default function GlassCard({
  children,
  className = "",
  variant = "default",
  glowColor,
  hover = true,
  onClick,
  style,
  id,
}: GlassCardProps) {
  const variantClass =
    variant === "strong" || variant === "heavy"
      ? "glass-card-strong"
      : variant === "subtle"
      ? "glass-subtle"
      : variant === "interactive"
      ? "glass-interactive"
      : variant === "danger"
      ? "glass-danger"
      : variant === "holo"
      ? "glass-holo"
      : "glass-card";

  const glowClass = glowColor ? `glow-${glowColor}` : "";
  const hoverClass = hover ? "" : "no-hover";

  return (
    <div
      id={id}
      className={`${variantClass} ${hoverClass} ${glowClass} ${className}`.trim()}
      onClick={onClick}
      style={{
        ...style,
        cursor: onClick ? "pointer" : undefined,
      }}
    >
      <div className="glass-specular-bar" aria-hidden="true" />
      {children}
    </div>
  );
}
