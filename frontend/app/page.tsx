"use client";

import React from "react";
import UploadForm from "@/components/UploadForm";
import { Leaf, BarChart3, Shield, Cpu } from "lucide-react";
import GlassCard from "@/components/GlassCard";

const features = [
  {
    icon: <BarChart3 size={22} />,
    title: "Emission Analytics",
    desc: "Visualize carbon footprints across your entire supply chain with interactive charts.",
    color: "var(--emerald-400)",
    bg: "rgba(16, 185, 129, 0.1)",
  },
  {
    icon: <Shield size={22} />,
    title: "Anomaly Detection",
    desc: "AI-powered Isolation Forest detects unusual emission patterns in real-time.",
    color: "var(--red-400)",
    bg: "rgba(239, 68, 68, 0.1)",
  },
  {
    icon: <Cpu size={22} />,
    title: "Smart Clustering",
    desc: "KMeans clustering groups similar suppliers for targeted optimization.",
    color: "var(--purple-400)",
    bg: "rgba(139, 92, 246, 0.1)",
  },
];

export default function HomePage() {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Hero Section */}
      <div className="hero">
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "var(--radius-full)",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              marginBottom: "32px",
              fontSize: "0.8125rem",
              color: "var(--emerald-400)",
              fontWeight: 500,
            }}
          >
            <Leaf size={14} />
            Carbon-Aware Supply Chain Intelligence
          </div>
        </div>

        <h1
          className="hero-title animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          Measure. Analyze.
          <br />
          <span className="text-gradient">Decarbonize.</span>
        </h1>

        <p
          className="hero-subtitle animate-fade-in-up"
          style={{ animationDelay: "350ms" }}
        >
          Upload your supply chain data and let AI uncover emission hotspots,
          detect anomalies, and recommend greener supplier alternatives.
        </p>

        <div
          className="hero-upload-container animate-fade-in-up"
          style={{ animationDelay: "500ms" }}
        >
          <UploadForm />
        </div>
      </div>

      {/* Features Section */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "80px 0 60px",
        }}
      >
        <div
          className="stagger-children"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((f, i) => (
            <GlassCard key={i} className="animate-fade-in-up">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-md)",
                  background: f.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: f.color,
                  marginBottom: "16px",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
