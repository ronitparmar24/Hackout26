import axios from "axios";
import { getAuthToken } from "./supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach Supabase / Guest Demo Bearer token on every outgoing request
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ---------- In-Memory Caches & Deduplication (Sub-50ms Navigation) ---------- */
let runsCache: { data: UploadResponse[]; timestamp: number } | null = null;
let runsInFlight: Promise<UploadResponse[]> | null = null;
const runDetailCache = new Map<string, { data: RunResponse; timestamp: number }>();
const runDetailInFlight = new Map<string, Promise<RunResponse>>();
const CLIENT_CACHE_TTL = 30000; // 30 seconds

export function clearApiCache() {
  runsCache = null;
  runsInFlight = null;
  runDetailCache.clear();
  runDetailInFlight.clear();
}

/* ---------- Types ---------- */
export interface Supplier {
  id: string;
  run_id: string;
  supplier_name: string;
  tier: string;
  region: string;
  energy_kwh: number;
  energy_kwh_estimated: boolean;
  transport_km: number;
  transport_km_estimated: boolean;
  transport_mode: string;
  material_type: string;
  material_qty: number;
  energy_emissions: number;
  transport_emissions: number;
  material_emissions: number;
  total_emissions: number;
  is_anomaly: boolean;
  cluster_label: number;
  emission_factor_source?: string;
  risk_score?: number;
  risk_reason?: string;
  risk_justification?: string;
  anomaly_reason?: string;
}

export interface RunResponse {
  run_id: string;
  filename: string;
  total_suppliers: number;
  total_emissions: number;
  status: string;
  suppliers?: Supplier[];
  executive_summary?: string;
  recommended_actions?: string;
}

export interface UploadResponse {
  run_id: string;
  filename: string;
  total_suppliers: number;
  total_emissions: number;
  status: string;
}

export interface Settings {
  company_name: string;
  industry: string;
  target_reduction_pct: number;
  baseline_year: number;
  currency: string;
  default_region: string;
}

/* ---------- API Calls ---------- */
export async function uploadCSV(file: File): Promise<UploadResponse> {
  clearApiCache();
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadResponse>("/api/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getRun(runId: string): Promise<RunResponse> {
  if (!runId) throw new Error("runId required");
  const now = Date.now();

  // 1. Check in-memory cache
  const cached = runDetailCache.get(runId);
  if (cached && now - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }

  // 2. Return in-flight promise if already fetching
  if (runDetailInFlight.has(runId)) {
    return runDetailInFlight.get(runId)!;
  }

  const promise = (async () => {
    try {
      const { data } = await api.get<RunResponse>(`/api/runs/${runId}`);
      runDetailCache.set(runId, { data, timestamp: Date.now() });
      return data;
    } finally {
      runDetailInFlight.delete(runId);
    }
  })();

  runDetailInFlight.set(runId, promise);
  return promise;
}

export async function listRuns(): Promise<UploadResponse[]> {
  const now = Date.now();

  // 1. Check in-memory cache
  if (runsCache && now - runsCache.timestamp < CLIENT_CACHE_TTL) {
    return runsCache.data;
  }

  // 2. Return in-flight promise if already fetching
  if (runsInFlight) {
    return runsInFlight;
  }

  runsInFlight = (async () => {
    try {
      const { data } = await api.get<any[]>("/api/runs");
      if (!Array.isArray(data)) return [];
      const normalized = data.map((r) => {
        const runIdentifier = r.run_id || r.id || "";
        return {
          ...r,
          id: runIdentifier,
          run_id: runIdentifier,
        };
      });
      runsCache = { data: normalized, timestamp: Date.now() };
      return normalized;
    } finally {
      runsInFlight = null;
    }
  })();

  return runsInFlight;
}

export async function getLatestRun(): Promise<RunResponse | null> {
  try {
    const runs = await listRuns();
    if (runs && runs.length > 0) {
      const activeId = runs[0].run_id || (runs[0] as any).id;
      if (activeId) {
        return await getRun(activeId);
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}


export function getExportCSVUrl(runId: string): string {
  const token = getAuthToken();
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${API_BASE}/api/export/csv/${runId}${tokenParam}`;
}

export function getExportPDFUrl(runId: string): string {
  const token = getAuthToken();
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${API_BASE}/api/export/pdf/${runId}${tokenParam}`;
}

export interface EcoAuraBadge {
  id: string;
  name: string;
  icon: string;
  desc: string;
  unlocked: boolean;
}

export interface EcoAuraData {
  run_id: string;
  aura_score: number;
  aura_grade: string;
  aura_title: string;
  aura_color: string;
  cbam_liability_usd: number;
  potential_cbam_savings_usd: number;
  vibe_check: string;
  concentration_pct: number;
  anomaly_count: number;
  total_suppliers: number;
  top_culprit: {
    name: string;
    emissions_kg: number;
    pct: number;
    tier: string;
  };
  badges: EcoAuraBadge[];
}

export async function chatWithData(runId: string, message: string, persona: "auditor" | "roast" = "auditor") {
  const { data } = await api.post(`/api/chat/${runId}`, { question: message, message, persona });
  return data;
}

export async function getEcoAura(runId: string): Promise<EcoAuraData> {
  const { data } = await api.get<EcoAuraData>(`/api/aura/${runId}`);
  return data;
}

export async function getSummary(runId: string) {
  const { data } = await api.get(`/api/summary/${runId}`);
  return data;
}

export async function filterNLP(query: string) {
  const { data } = await api.post('/api/filter-nlp', { query });
  return data;
}

export async function getForecast(runId: string) {
  const { data } = await api.get(`/api/forecast/${runId}`);
  return data;
}

export async function getAnomalyExplanation(supplierId: string) {
  const { data } = await api.get(`/api/anomaly-explanation/${supplierId}`);
  return data;
}

export async function getSettings() {
  const { data } = await api.get('/api/settings');
  return data;
}

export async function updateSettings(settings: any) {
  const { data } = await api.post('/api/settings', settings);
  return data;
}

export async function applyRecommendation(runId: string, supplierId: string, recommendedSupplierId: string) {
  const { data } = await api.post('/api/recommendations/apply', { run_id: runId, supplier_id: supplierId, recommended_supplier_id: recommendedSupplierId });
  return data;
}

export default api;
