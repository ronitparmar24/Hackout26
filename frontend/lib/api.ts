import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

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
  risk_score?: number;
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
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadResponse>("/api/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getRun(runId: string): Promise<RunResponse> {
  const { data } = await api.get<RunResponse>(`/api/runs/${runId}`);
  return data;
}

export async function listRuns(): Promise<UploadResponse[]> {
  const { data } = await api.get<UploadResponse[]>("/api/runs");
  return data;
}

export async function getLatestRun(): Promise<RunResponse | null> {
  try {
    const runs = await listRuns();
    if (runs && runs.length > 0) {
      return await getRun(runs[0].run_id);
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function getExportCSVUrl(runId: string): string {
  return `${API_BASE}/api/export/csv/${runId}`;
}

export function getExportPDFUrl(runId: string): string {
  return `${API_BASE}/api/export/pdf/${runId}`;
}

export async function chatWithData(runId: string, message: string) {
  const { data } = await api.post(`/api/chat/${runId}`, { message });
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
