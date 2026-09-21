// ── Upload API ──────────────────────────────────────────────────────────

export interface UploadResponse {
  message: string;
  input_rows: number;
  exact_duplicates_dropped: number;
  conflicting_duplicates_resolved: number;
  output_rows: number;
  invalid_status_rows: number;
  invalid_latency_rows: number;
  rows_written: number;
  batches: number;
}

// ── Dashboard API ───────────────────────────────────────────────────────

export interface ServiceStat {
  service_id: string;
  service_name: string;
  total_checks: number;
  availability: number;   // 0-100 percent
  avg_latency_ms: number;
  sla_met: boolean;
}

export interface DashboardResponse {
  total_checks: number;
  valid_status_checks: number;
  success_checks: number;
  invalid_checks: number;
  availability: number;        // overall 0-100 percent
  sla_met: boolean;
  avg_latency_ms: number;
  p95_latency_ms: number;
  services: ServiceStat[];
}

// ── Checks API ──────────────────────────────────────────────────────────

export interface CheckRecord {
  id: number;
  service_id: string;
  service_name: string;
  timestamp_utc: string;
  status_code: number;
  latency_ms: number;
  is_valid_status: boolean;
  is_valid_latency: boolean;
  exclude_reason: string | null;
  agent: string;
  region: string;
  source_file: string;
  uploaded_at: string;
}

export interface ChecksResponse {
  total: number;
  limit: number;
  offset: number;
  checks: CheckRecord[];
}

export interface ChecksQueryParams {
  limit?: number;
  offset?: number;
  service_id?: string;
  date_from?: string;  // "YYYY-MM-DD"
  date_to?: string;    // "YYYY-MM-DD"
}

// ── UI / App State ──────────────────────────────────────────────────────

export interface StoredState {
  upload: UploadResponse;
  uploadedAt: string;
}

export type UploadStatus = "idle" | "uploading" | "success" | "error";
