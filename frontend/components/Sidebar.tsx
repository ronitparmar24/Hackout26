"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  History,
  Leaf,
  Globe,
  Sliders,
  ShieldCheck,
  Building2,
  TerminalSquare,
  Radar,
  FileText,
  Presentation,
  Network,
  type LucideIcon,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

import { listRuns } from "@/lib/api";

interface NavGroup {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
  }>;
}

const navGroups: NavGroup[] = [
  {
    title: "Intelligence",
    items: [
      { href: "/", label: "Intake & Upload", icon: Upload },
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/history", label: "Run History", icon: History },
      { href: "/terminal", label: "AI Command Center", icon: TerminalSquare, badge: "Sys" },
    ],
  },
  {
    title: "Strategy & Modeling",
    items: [
      { href: "/supply-chain", label: "Supply Chain Map", icon: Globe, badge: "Geo" },
      { href: "/simulator", label: "What-If Simulator", icon: Sliders, badge: "AI" },
      { href: "/trading", label: "Carbon Trading Desk", icon: Globe, badge: "Live" },
      { href: "/risk-radar", label: "Climate Risk Radar", icon: Radar, badge: "Alert" },
      { href: "/waterfall", label: "Carbon Waterfall", icon: Network, badge: "Vis" },
    ],
  },
  {
    title: "Governance & ESG",
    items: [
      { href: "/compliance", label: "Audit & Compliance", icon: ShieldCheck, badge: "CSRD" },
      { href: "/suppliers", label: "Supplier Directory", icon: Building2 },
      { href: "/invoicing", label: "Internal Invoicing", icon: FileText, badge: "ICP" },
      { href: "/boardroom", label: "Executive Boardroom", icon: Presentation, badge: "C-Suite" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [latestRunId, setLatestRunId] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const runs = await listRuns();
        if (runs && runs.length > 0) {
          setLatestRunId(runs[0].run_id);
        }
      } catch (err) {}
    })();
  }, []);

  return (
    <aside className="sidebar" id="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Leaf size={20} />
        </div>
        <div>
          <div className="logo-text">CarbonSense</div>
          <span className="logo-badge">Enterprise ESG</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" style={{ overflowY: "auto", flex: 1, paddingBottom: "16px" }}>
        {navGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: "18px" }}>
            <div
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-tertiary)",
                padding: "8px 16px 6px",
              }}
            >
              {group.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const targetHref =
                  latestRunId && item.href !== "/" && item.href !== "/history" && item.href !== "/upload"
                    ? item.href === "/dashboard"
                      ? `/dashboard/${latestRunId}`
                      : `${item.href}?run_id=${latestRunId}`
                    : item.href;

                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : item.href === "/dashboard"
                    ? pathname.startsWith("/dashboard")
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={targetHref}
                    className={isActive ? "active" : ""}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: "0.625rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "var(--radius-full)",
                          background: isActive
                            ? "rgba(16, 185, 129, 0.25)"
                            : "rgba(255, 255, 255, 0.06)",
                          color: isActive ? "var(--emerald-400)" : "var(--text-tertiary)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-tertiary)",
              fontWeight: 500,
            }}
          >
            Appearance
          </span>
          <ThemeToggle />
        </div>
        <div
          style={{
            padding: "4px 14px 10px",
            fontSize: "0.6875rem",
            color: "var(--text-muted)",
          }}
        >
          GHG Scope 3 Platform v2.0
        </div>
      </div>
    </aside>
  );
}
