import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AnimatedBackground from "@/components/AnimatedBackground";
import TopBar from "@/components/TopBar";
import CommandPalette from "@/components/CommandPalette";
import MouseGlow from "@/components/MouseGlow";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { Suspense } from "react";

import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "CarbonSense — AI-Powered Supply Chain Dashboard",
  description:
    "Analyze and optimize your supply chain carbon emissions with AI-powered anomaly detection, clustering, and recommendations.",
  keywords: "carbon emissions, supply chain, sustainability, AI, dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Prevent flash of wrong theme - default to dark first */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('carbonsense_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <MouseGlow />
        <CommandPalette />
        <AnimatedBackground />
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Suspense fallback={null}>
              <TopBar />
            </Suspense>
            <ErrorBoundary>
              <div className="animate-fade-in">
                {children}
              </div>
            </ErrorBoundary>
          </main>
        </div>
        <FloatingActionMenu />
      </body>
    </html>
  );
}
