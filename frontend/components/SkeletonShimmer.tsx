"use client";

import React from "react";

interface SkeletonShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "xl" | "full" | "none";
  style?: React.CSSProperties;
}

export default function SkeletonShimmer({
  className = "",
  width,
  height,
  rounded = "lg",
  style,
}: SkeletonShimmerProps) {
  const roundedClass =
    rounded === "sm"
      ? "rounded"
      : rounded === "md"
      ? "rounded-md"
      : rounded === "lg"
      ? "rounded-xl"
      : rounded === "xl"
      ? "rounded-2xl"
      : rounded === "full"
      ? "rounded-full"
      : "";

  return (
    <div
      className={`skeleton-shimmer ${roundedClass} ${className}`.trim()}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
