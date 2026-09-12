"use client";

import React, { useEffect, useRef } from "react";

export default function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for smooth performance
      rafId = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.transform = `translate(${e.clientX - 400}px, ${e.clientY - 400}px)`;
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed inset-0 z-[-1] transition-opacity duration-300"
      style={{
        width: "800px",
        height: "800px",
        background: "radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, rgba(16, 185, 129, 0.02) 40%, rgba(0, 0, 0, 0) 70%)",
        opacity: 1,
        willChange: "transform",
        top: 0,
        left: 0,
      }}
    />
  );
}
