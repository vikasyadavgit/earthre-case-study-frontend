// ── Date & Time ───────────────────────────────────────────────────────

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ── Number Formatting ──────────────────────────────────────────────────

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatPercent(n: number): string {
  return `${n.toFixed(2)}%`;
}

// ── Latency ────────────────────────────────────────────────────────────

export function formatLatencyMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  return `${ms} ms`;
}

// ── Colour helpers ─────────────────────────────────────────────────────

export function statusColor(code: number): string {
  if (code >= 200 && code < 300) return "var(--green)";
  if (code >= 300 && code < 400) return "var(--blue)";
  if (code >= 400 && code < 500) return "var(--yellow)";
  return "var(--red)";
}

export function statusBg(code: number): string {
  if (code >= 200 && code < 300) return "var(--green-bg)";
  if (code >= 300 && code < 400) return "var(--blue-bg)";
  if (code >= 400 && code < 500) return "var(--yellow-bg)";
  return "var(--red-bg)";
}

// ── Service colour palette ─────────────────────────────────────────────

const SERVICE_COLORS: Record<string, string> = {
  "svc-reports":  "var(--blue)",
  "svc-search":   "var(--purple)",
  "svc-payments": "var(--green)",
  "svc-notify":   "var(--orange)",
  "svc-auth":     "var(--yellow)",
};

const SERVICE_BG: Record<string, string> = {
  "svc-reports":  "var(--blue-bg)",
  "svc-search":   "var(--purple-bg)",
  "svc-payments": "var(--green-bg)",
  "svc-notify":   "var(--orange-bg)",
  "svc-auth":     "var(--yellow-bg)",
};

export function serviceColor(id: string): string {
  return SERVICE_COLORS[id] ?? "var(--accent-light)";
}

export function serviceBg(id: string): string {
  return SERVICE_BG[id] ?? "rgba(255,255,255,0.08)";
}

// ── localStorage helpers ───────────────────────────────────────────────

const STORAGE_KEY = "sla_dashboard_v2";

export function saveToStorage<T>(data: T): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function loadFromStorage<T>(): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
