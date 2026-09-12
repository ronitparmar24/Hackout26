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
}

export interface RunResponse {
  run_id: string;
  filename: string;
  total_suppliers: number;
  total_emissions: number;
  status: string;
  suppliers?: Supplier[];
}

export interface UploadResponse {
  run_id: string;
  filename: string;
  total_suppliers: number;
  total_emissions: number;
  status: string;
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

export default api;

