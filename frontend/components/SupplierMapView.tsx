"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Layers,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  X,
  Zap,
  Truck,
  Package,
  Compass,
  MapPin,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import Button from "@/components/Button";
import { Supplier } from "@/lib/api";
import { getSupplierCoordinates } from "@/lib/geo";

interface SupplierMapViewProps {
  suppliers: Supplier[];
  runId: string;
  selectedSupplierId?: string | null;
  onSelectSupplier?: (supplier: Supplier) => void;
}

// Tile layers configurations
const TILE_LAYERS = {
  dark: {
    name: "CartoDB Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  osm: {
    name: "OpenStreetMap Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

// Map controller to handle programmatic flyTo animation
function MapFlyToHandler({
  targetCoords,
  zoom = 9,
}: {
  targetCoords: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, zoom, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [targetCoords, zoom, map]);
  return null;
}

// Map bounds fitter for initial framing
function MapBoundsFitter({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (bounds && !hasFitted.current) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
        hasFitted.current = true;
      } catch (err) {
        console.error("Failed to fit bounds", err);
      }
    }
  }, [bounds, map]);

  return null;
}

export default function SupplierMapView({
  suppliers,
  runId,
  selectedSupplierId,
  onSelectSupplier,
}: SupplierMapViewProps) {
  const [activeTileTheme, setActiveTileTheme] = useState<"dark" | "osm">("dark");
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);

  // Maximum emissions for size scaling
  const maxEmissions = useMemo(() => {
    if (!suppliers.length) return 1;
    return Math.max(...suppliers.map((s) => Number(s.total_emissions || 0)));
  }, [suppliers]);

  // Pre-calculate coordinates for each supplier
  const supplierLocations = useMemo(() => {
    return suppliers.map((s) => ({
      supplier: s,
      coords: getSupplierCoordinates(s),
    }));
  }, [suppliers]);

  // Overall map bounding box
  const bounds = useMemo<L.LatLngBoundsExpression | null>(() => {
    if (!supplierLocations.length) return null;
    const latLngs = supplierLocations.map((item) => item.coords);
    return L.latLngBounds(latLngs);
  }, [supplierLocations]);

  // Sync external selectedSupplierId with map fly-to
  useEffect(() => {
    if (selectedSupplierId) {
      const match = supplierLocations.find(
        (item) => item.supplier.id === selectedSupplierId
      );
      if (match) {
        setActiveSupplier(match.supplier);
        setFlyToCoords(match.coords);
      }
    }
  }, [selectedSupplierId, supplierLocations]);

  // Create custom glassmorphism SVG/HTML marker icons
  const getCustomMarkerIcon = (supplier: Supplier, isSelected: boolean) => {
    const score = Number(supplier.risk_score ?? (supplier.is_anomaly ? 85 : 20));
    const isHigh = score >= 70 || supplier.is_anomaly;
    const isMod = score >= 40 && score < 70;

    // Palette consistent with CarbonSense design system
    const colorHex = isHigh ? "#EF4444" : isMod ? "#F59E0B" : "#10B981";
    const glowHex = isHigh
      ? "rgba(239, 68, 68, 0.7)"
      : isMod
      ? "rgba(245, 158, 11, 0.6)"
      : "rgba(16, 185, 129, 0.6)";
    const bgFill = isHigh
      ? "rgba(239, 68, 68, 0.3)"
      : isMod
      ? "rgba(245, 158, 11, 0.3)"
      : "rgba(16, 185, 129, 0.3)";

    // Size dynamically proportional to emission volume
    const ratio = Math.min(
      1,
      Math.max(0, Number(supplier.total_emissions || 0) / maxEmissions)
    );
    const size = Math.round(24 + ratio * 20); // 24px - 44px
    const tierText =
      supplier.tier === "Tier 1" ? "T1" : supplier.tier === "Tier 2" ? "T2" : "T3";

    const html = `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${
          isHigh
            ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background: ${glowHex}; opacity: 0.5; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ""
        }
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 9999px;
          background: ${bgFill};
          backdrop-filter: blur(8px);
          border: ${isSelected ? "2.5px" : "1.5px"} solid ${colorHex};
          box-shadow: 0 0 ${isSelected ? "24px 6px" : "12px 2px"} ${glowHex};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        ">
          <span style="
            font-family: ui-monospace, monospace;
            font-size: ${Math.max(9, Math.round(size * 0.36))}px;
            font-weight: 700;
            color: #FFFFFF;
            letter-spacing: -0.05em;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
          ">
            ${tierText}
          </span>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-glass-pin",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const handleMarkerClick = (supplier: Supplier, coords: [number, number]) => {
    setActiveSupplier(supplier);
    setFlyToCoords(coords);
    if (onSelectSupplier) {
      onSelectSupplier(supplier);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl backdrop-blur-2xl">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/75 border border-white/15 backdrop-blur-md text-xs font-mono text-white/80 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>
            OpenStreetMap + Leaflet •{" "}
            <strong className="text-white">{suppliers.length} Locations</strong>
          </span>
        </div>

        {/* Tile Theme Switcher */}
        <div className="flex items-center bg-black/75 p-1 rounded-xl border border-white/15 backdrop-blur-md text-xs font-heading">
          <button
            type="button"
            onClick={() => setActiveTileTheme("dark")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTileTheme === "dark"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Carto Dark
          </button>
          <button
            type="button"
            onClick={() => setActiveTileTheme("osm")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTileTheme === "osm"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            OSM Standard
          </button>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-black/80 border border-white/15 backdrop-blur-md text-[11px] font-mono text-white/70 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          <span>Low Risk (&lt;40)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
          <span>Moderate (40-69)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
          <span>High / Anomaly (≥70)</span>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <div className="w-full h-[580px] lg:h-[640px]">
        <MapContainer
          center={[30.0, 40.0]}
          zoom={3}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
          style={{ background: "#0B0F17" }}
        >
          <TileLayer
            url={TILE_LAYERS[activeTileTheme].url}
            attribution={TILE_LAYERS[activeTileTheme].attribution}
            maxZoom={19}
          />

          <MapBoundsFitter bounds={bounds} />
          <MapFlyToHandler targetCoords={flyToCoords} />

          {/* Plot Markers */}
          {supplierLocations.map(({ supplier, coords }) => {
            const isSelected = activeSupplier?.id === supplier.id;
            return (
              <Marker
                key={supplier.id}
                position={coords}
                icon={getCustomMarkerIcon(supplier, isSelected)}
                eventHandlers={{
                  click: () => handleMarkerClick(supplier, coords),
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Interactive Supplier Detail Glass Panel Overlay */}
      {activeSupplier && (
        <div className="absolute top-4 right-4 bottom-4 w-full max-w-sm z-[1001] pointer-events-auto animate-fade-in">
          <GlassCard
            variant="strong"
            className="h-full flex flex-col justify-between p-5 border-cyan-400/40 bg-[#0B0F17]/90 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-y-auto"
          >
            <div>
              {/* Header & Close Button */}
              <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        activeSupplier.tier === "Tier 1"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : activeSupplier.tier === "Tier 2"
                          ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                          : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                      }`}
                    >
                      {activeSupplier.tier}
                    </span>
                    <span className="text-white/40 text-xs font-mono">
                      {activeSupplier.region || "Global"}
                    </span>
                    {activeSupplier.is_anomaly && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Anomaly
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold font-heading text-white tracking-tight leading-snug">
                    {activeSupplier.supplier_name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSupplier(null)}
                  className="p-1.5 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Total Emissions Hero Metric */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-4">
                <div className="text-[11px] font-mono text-white/40 uppercase mb-1">
                  Scope 3 Footprint
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold font-mono text-white">
                    {(Number(activeSupplier.total_emissions || 0) / 1000).toFixed(2)}{" "}
                    <span className="text-sm font-normal text-cyan-300 font-sans">
                      tCO₂e
                    </span>
                  </div>
                  <div className="text-xs font-mono text-white/60">
                    {Number(activeSupplier.total_emissions || 0).toLocaleString()}{" "}
                    kg
                  </div>
                </div>

                {/* Audit Lineage */}
                <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    Source:{" "}
                    {activeSupplier.emission_factor_source ||
                      "Climatiq / DEFRA 2024"}
                  </span>
                </div>
              </div>

              {/* 3-Way Emissions Breakdown */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-emerald-500/20">
                  <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-1 text-[11px]">
                    <Zap className="w-3 h-3" />
                    <span>Energy</span>
                  </div>
                  <div className="text-white font-bold text-xs">
                    {(Number(activeSupplier.energy_emissions || 0) / 1000).toFixed(1)}t
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-cyan-500/20">
                  <div className="flex items-center gap-1 text-cyan-400 font-semibold mb-1 text-[11px]">
                    <Truck className="w-3 h-3" />
                    <span>Transit</span>
                  </div>
                  <div className="text-white font-bold text-xs">
                    {(Number(activeSupplier.transport_emissions || 0) / 1000).toFixed(1)}t
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-purple-500/20">
                  <div className="flex items-center gap-1 text-purple-400 font-semibold mb-1 text-[11px]">
                    <Package className="w-3 h-3" />
                    <span>Mat</span>
                  </div>
                  <div className="text-white font-bold text-xs">
                    {(Number(activeSupplier.material_emissions || 0) / 1000).toFixed(1)}t
                  </div>
                </div>
              </div>

              {/* Operational Attributes */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-sans mb-4">
                <div className="flex justify-between text-white/60">
                  <span>Material Category:</span>
                  <span className="text-white font-medium">
                    {activeSupplier.material_type} ({activeSupplier.material_qty} t)
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Transport Mode:</span>
                  <span className="text-white font-medium">
                    {activeSupplier.transport_mode} ({activeSupplier.transport_km} km)
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Energy Intensity:</span>
                  <span className="text-white font-medium">
                    {Number(activeSupplier.energy_kwh || 0).toLocaleString()} kWh
                  </span>
                </div>
              </div>

              {/* AI Risk Score Pill & Summary */}
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 mb-4">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-cyan-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    AI Risk Index
                  </span>
                  <span className="text-white font-bold font-mono">
                    {Number(
                      activeSupplier.risk_score ??
                        (activeSupplier.is_anomaly ? 85 : 20)
                    ).toFixed(0)}
                    /100
                  </span>
                </div>
                <p className="text-[11px] text-white/70 font-sans leading-relaxed line-clamp-3">
                  {activeSupplier.risk_reason ||
                    activeSupplier.risk_justification ||
                    "Standard supply chain profile grounded in verified activity factors."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <Link
                href={`/dashboard/${runId}/supplier/${activeSupplier.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-semibold transition-colors"
              >
                <span>Full Supplier Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
