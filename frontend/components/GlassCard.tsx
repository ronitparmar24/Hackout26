"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "heavy" | "interactive" | "subtle" | "glow" | "danger";
  glowColor?: "emerald" | "teal" | "amber" | "blue" | "purple" | "red";
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
    variant === "heavy"
      ? "glass-heavy"
      : variant === "subtle"
      ? "glass-subtle"
      : variant === "interactive"
      ? "glass-interactive"
      : variant === "danger"
      ? "glass-danger"
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
