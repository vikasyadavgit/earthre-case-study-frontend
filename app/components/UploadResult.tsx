"use client";

import type { UploadResponse } from "../lib/types";
import { formatNumber } from "../lib/utils";

interface Props {
  result: UploadResponse;
  onViewDashboard: () => void;
}

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
  detail?: string;
}

export default function UploadResult({ result, onViewDashboard }: Props) {
  const stats: StatItem[] = [
    {
      label: "Input Rows",
      value: formatNumber(result.input_rows),
      icon: "📋",
      color: "var(--blue)",
      bg: "var(--blue-bg)",
      detail: "Raw records in file",
    },
    {
      label: "Rows Written",
      value: formatNumber(result.rows_written),
      icon: "✅",
      color: "var(--green)",
      bg: "var(--green-bg)",
      detail: "Clean records persisted",
    },
    {
      label: "Duplicates Dropped",
      value: formatNumber(
        result.exact_duplicates_dropped + result.conflicting_duplicates_resolved
      ),
      icon: "🗑",
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      detail: `${result.exact_duplicates_dropped} exact · ${result.conflicting_duplicates_resolved} conflicting`,
    },
    {
      label: "Invalid Rows",
      value: formatNumber(
        result.invalid_status_rows + result.invalid_latency_rows
      ),
      icon: "⚠️",
      color: "var(--red)",
      bg: "var(--red-bg)",
      detail: `${result.invalid_status_rows} bad status · ${result.invalid_latency_rows} bad latency`,
    },
  ];

  const dataQuality = Math.round(
    (result.rows_written / result.input_rows) * 100
  );

  return (
    <div
      className="fade-in"
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Success header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "20px 24px",
          borderRadius: 14,
          background: "var(--green-bg)",
          border: "1px solid rgba(63,185,80,0.25)",
        }}
      >
        <div style={{ fontSize: 28 }}>✅</div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "var(--green)",
              marginBottom: 2,
            }}
          >
            Upload processed successfully
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {result.batches} batch{result.batches !== 1 ? "es" : ""} written to
            database · Data quality score{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {dataQuality}%
            </strong>
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 14,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass-card"
            style={{ padding: "18px 20px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                {s.icon}
              </div>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
                {s.label}
              </span>
            </div>
            <p
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: s.color,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
              }}
            >
              {s.value}
            </p>
            {s.detail && (
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                {s.detail}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Data quality bar */}
      <div
        className="glass-card"
        style={{ padding: "18px 20px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
            Data Quality Score
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: dataQuality >= 95 ? "var(--green)" : dataQuality >= 80 ? "var(--yellow)" : "var(--red)",
            }}
          >
            {dataQuality}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 4,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${dataQuality}%`,
              borderRadius: 4,
              background:
                dataQuality >= 95
                  ? "linear-gradient(90deg, var(--green), #2dba4e)"
                  : dataQuality >= 80
                  ? "linear-gradient(90deg, var(--yellow), #e6a817)"
                  : "linear-gradient(90deg, var(--red), #e63946)",
              transition: "width 1s ease",
            }}
          />
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
          {result.rows_written.toLocaleString()} of{" "}
          {result.input_rows.toLocaleString()} rows passed all quality checks
        </p>
      </div>

      {/* CTA */}
      <button
        id="view-dashboard-btn"
        onClick={onViewDashboard}
        style={{
          width: "100%",
          padding: "14px 24px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.2s",
          boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
          animation: "glow-pulse 2s ease infinite",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 30px rgba(37,99,235,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.4)";
        }}
      >
        View Dashboard
        <span style={{ fontSize: 18 }}>→</span>
      </button>
    </div>
  );
}
