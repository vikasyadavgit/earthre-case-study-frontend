import type {
  ChecksQueryParams,
  ChecksResponse,
  DashboardResponse,
  UploadResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://agzr8tflm1.execute-api.ap-south-1.amazonaws.com";

// ── POST /upload ──────────────────────────────────────────────────────

/**
 * Upload a CSV file to the serverless processing endpoint.
 * Sends multipart/form-data with key "file".
 */
export async function uploadCSV(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<UploadResponse>;
}

// ── GET /dashboard ────────────────────────────────────────────────────

/**
 * Fetch overall SLA stats and per-service breakdown.
 */
export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await fetch(`${API_BASE}/dashboard`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Dashboard fetch failed (${res.status})`);
  }

  return res.json() as Promise<DashboardResponse>;
}

// ── GET /checks ────────────────────────────────────────────────────────

/**
 * Fetch paginated check records with optional filters.
 */
export async function fetchChecks(
  params: ChecksQueryParams = {}
): Promise<ChecksResponse> {
  const query = new URLSearchParams();
  if (params.limit !== undefined)  query.set("limit",      String(params.limit));
  if (params.offset !== undefined) query.set("offset",     String(params.offset));
  if (params.service_id)           query.set("service_id", params.service_id);
  if (params.date_from)            query.set("date_from",  params.date_from);
  if (params.date_to)              query.set("date_to",    params.date_to);

  const res = await fetch(`${API_BASE}/checks?${query.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Checks fetch failed (${res.status})`);
  }

  return res.json() as Promise<ChecksResponse>;
}
