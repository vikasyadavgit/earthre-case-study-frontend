"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CheckRecord, ChecksQueryParams } from "../lib/types";
import { fetchChecks } from "../lib/api";
import ServiceBadge from "./ServiceBadge";
import StatusBadge from "./StatusBadge";
import { formatLatencyMs, formatTimestamp } from "../lib/utils";

const PAGE_SIZE = 50;

const SERVICES = [
  { value: "",              label: "All Services" },
  { value: "svc-reports",  label: "svc-reports" },
  { value: "svc-search",   label: "svc-search" },
  { value: "svc-payments", label: "svc-payments" },
  { value: "svc-notify",   label: "svc-notify" },
  { value: "svc-auth",     label: "svc-auth" },
];

export default function LogsTable() {
  const [records, setRecords]   = useState<CheckRecord[]>([]);
  const [total, setTotal]       = useState(0);
  const [offset, setOffset]     = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Filters
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");
  const [serviceId,  setServiceId]  = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (off: number, params: ChecksQueryParams) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await fetchChecks({ ...params, limit: PAGE_SIZE, offset: off });
      setRecords(res.checks);
      setTotal(res.total);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load checks.");
      setRecords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount and whenever filters / offset change
  useEffect(() => {
    const params: ChecksQueryParams = {};
    if (dateFrom)   params.date_from  = dateFrom;
    if (dateTo)     params.date_to    = dateTo;
    if (serviceId)  params.service_id = serviceId;
    load(offset, params);
  }, [offset, dateFrom, dateTo, serviceId, load]);

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages  = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const applyFilters = () => setOffset(0); // triggers useEffect

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setServiceId("");
    setOffset(0);
  };

  const hasFilters = !!(dateFrom || dateTo || serviceId);

  return (
    <section id="logs-table" className="glass-card" style={{ overflow: "hidden" }}>

      {/* ── Header + filters ──────────────────────────────────── */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--purple-bg)",
              border: "1px solid rgba(163,113,247,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🗂
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Check Logs</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {loading
                ? "Loading…"
                : total > 0
                ? `${total.toLocaleString()} records${hasFilters ? " (filtered)" : ""}`
                : "No records"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <select
            id="service-filter"
            value={serviceId}
            onChange={(e) => { setServiceId(e.target.value); setOffset(0); }}
          >
            {SERVICES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <input
            id="date-from-filter"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="From date"
          />
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>→</span>
          <input
            id="date-to-filter"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="To date"
          />

          <button
            id="apply-filter-btn"
            onClick={applyFilters}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            Apply
          </button>

          {hasFilters && (
            <button
              id="clear-filter-btn"
              onClick={clearFilters}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table body ────────────────────────────────────────── */}
      <div style={{ overflowX: "auto" }}>
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : records.length === 0 ? (
          <EmptyState filtered={hasFilters} />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Service</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Agent</th>
                <th>Region</th>
                <th>Source File</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "monospace",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatTimestamp(r.timestamp_utc)}
                  </td>
                  <td>
                    <ServiceBadge
                      serviceId={r.service_id}
                      serviceName={r.service_name}
                    />
                  </td>
                  <td>
                    <StatusBadge code={r.status_code} />
                  </td>
                  <td
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      color:
                        r.latency_ms > 1000
                          ? "var(--yellow)"
                          : "var(--text-primary)",
                    }}
                  >
                    {formatLatencyMs(r.latency_ms)}
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                    {r.agent}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.04)",
                        color: "var(--text-secondary)",
                        fontFamily: "monospace",
                      }}
                    >
                      {r.region}
                    </span>
                  </td>
                  <td
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.source_file}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────── */}
      {!loading && !error && totalPages > 1 && (
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Page {currentPage} of {totalPages}
            {" · "}
            {(offset + 1).toLocaleString()}–
            {Math.min(offset + PAGE_SIZE, total).toLocaleString()} of{" "}
            {total.toLocaleString()}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <PaginationBtn
              id="prev-page-btn"
              label="← Prev"
              disabled={offset === 0}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            />
            <PaginationBtn
              id="next-page-btn"
              label="Next →"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            />
          </div>
        </div>
      )}
    </section>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────

function PaginationBtn({
  id,
  label,
  disabled,
  onClick,
}: {
  id: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        border: "1px solid var(--border-subtle)",
        background: disabled ? "transparent" : "rgba(255,255,255,0.04)",
        color: disabled ? "var(--text-muted)" : "var(--text-primary)",
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
    >
      {label}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 44, borderRadius: 8, opacity: 1 - i * 0.08 }}
        />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <p style={{ fontSize: 36, marginBottom: 16 }}>⚠️</p>
      <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
        Could not load logs
      </p>
      <p style={{ fontSize: 13, maxWidth: 440, margin: "0 auto", color: "var(--text-muted)" }}>
        {message}
      </p>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <p style={{ fontSize: 36, marginBottom: 16 }}>{filtered ? "🔍" : "📭"}</p>
      <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
        {filtered ? "No records match your filters" : "No checks yet"}
      </p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
        {filtered
          ? "Try adjusting the date range or service filter."
          : "Upload a CSV file to populate the check log."}
      </p>
    </div>
  );
}
