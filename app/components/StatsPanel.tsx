"use client";

import { useState } from "react";
import type { DashboardResponse, UploadResponse } from "../lib/types";
import {
  formatNumber,
  formatPercent,
  formatLatencyMs,
  serviceColor,
} from "../lib/utils";

interface Props {
  dashboard: DashboardResponse | null;
  upload: UploadResponse | null;
  loading?: boolean;
}

export default function StatsPanel({ dashboard, upload, loading }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const overall = dashboard;

  return (
    <section
      id="stats-panel"
      className="glass-card"
      style={{ overflow: "hidden" }}
    >
      {/* ── Collapse header ───────────────────────────────── */}
      <button
        id="stats-collapse-btn"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-primary)",
          borderBottom: collapsed ? "none" : "1px solid var(--border-subtle)",
          transition: "border-color 0.3s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--blue-bg)",
              border: "1px solid rgba(88,166,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            📊
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>SLA Statistics</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {loading
                ? "Loading…"
                : overall
                ? `${formatNumber(overall.total_checks)} total checks · ${overall.services.length} services`
                : "Upload a CSV to see stats"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {overall && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 20,
                background: overall.sla_met ? "var(--green-bg)" : "var(--red-bg)",
                color: overall.sla_met ? "var(--green)" : "var(--red)",
                border: `1px solid ${overall.sla_met ? "rgba(63,185,80,0.3)" : "rgba(248,81,73,0.3)"}`,
              }}
            >
              {formatPercent(overall.availability)} overall
            </span>
          )}
          <span
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.3s",
              display: "inline-block",
            }}
          >
            ↑
          </span>
        </div>
      </button>

      {/* ── Collapsible body ──────────────────────────────── */}
      <div
        style={{
          maxHeight: collapsed ? 0 : 3000,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <div style={{ padding: "24px" }}>
          {loading ? (
            <LoadingSkeleton />
          ) : !overall ? (
            <EmptyState />
          ) : (
            <>
              {/* ── Overall summary cards ─────────────────── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                {buildOverallCards(overall, upload).map((c) => (
                  <SummaryCard key={c.label} {...c} />
                ))}
              </div>

              {/* ── Per-service SLA rows ───────────────────── */}
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Per-Service Breakdown
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...overall.services]
                  .sort((a, b) => a.availability - b.availability)
                  .map((s) => (
                    <ServiceRow key={s.service_id} svc={s} />
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Helper: build summary card list ─────────────────────────────────────

function buildOverallCards(
  d: DashboardResponse,
  upload: UploadResponse | null
) {
  const cards = [
    {
      label: "Total Checks",
      value: formatNumber(d.total_checks),
      icon: "🔍",
      color: "var(--blue)",
      bg: "var(--blue-bg)",
    },
    {
      label: "Overall SLA",
      value: formatPercent(d.availability),
      icon: d.sla_met ? "✅" : "⚠️",
      color: d.sla_met ? "var(--green)" : "var(--red)",
      bg: d.sla_met ? "var(--green-bg)" : "var(--red-bg)",
      detail: d.sla_met ? "≥ 99.9% threshold met" : "Below 99.9% threshold",
    },
    {
      label: "Avg Latency",
      value: formatLatencyMs(d.avg_latency_ms),
      icon: "⚡",
      color: "var(--purple)",
      bg: "var(--purple-bg)",
      detail: `p95: ${formatLatencyMs(d.p95_latency_ms)}`,
    },
    {
      label: "Successful Checks",
      value: formatNumber(d.success_checks),
      icon: "✓",
      color: "var(--green)",
      bg: "var(--green-bg)",
      detail: `${formatNumber(d.valid_status_checks)} valid status`,
    },
    {
      label: "Invalid Checks",
      value: formatNumber(d.invalid_checks),
      icon: "✗",
      color: d.invalid_checks > 0 ? "var(--red)" : "var(--green)",
      bg: d.invalid_checks > 0 ? "var(--red-bg)" : "var(--green-bg)",
    },
  ];

  if (upload) {
    cards.push(
      {
        label: "Duplicates Dropped",
        value: formatNumber(
          upload.exact_duplicates_dropped + upload.conflicting_duplicates_resolved
        ),
        icon: "🗑",
        color: "var(--yellow)",
        bg: "var(--yellow-bg)",
        detail: `${upload.exact_duplicates_dropped} exact · ${upload.conflicting_duplicates_resolved} conflicting`,
      },
      {
        label: "Invalid Rows",
        value: formatNumber(
          upload.invalid_status_rows + upload.invalid_latency_rows
        ),
        icon: "⚠",
        color: "var(--orange)",
        bg: "var(--orange-bg)",
        detail: `${upload.invalid_status_rows} status · ${upload.invalid_latency_rows} latency`,
      }
    );
  }

  return cards;
}

// ── Sub-components ──────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  icon,
  color,
  bg,
  detail,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
  detail?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        padding: "14px 16px",
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <p
        style={{
          fontSize: 20,
          fontWeight: 800,
          color,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      {detail && (
        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{detail}</p>
      )}
    </div>
  );
}

function ServiceRow({
  svc,
}: {
  svc: DashboardResponse["services"][number];
}) {
  const met = svc.sla_met;
  const pct = svc.availability;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr 110px 120px 90px",
        alignItems: "center",
        gap: 16,
        padding: "14px 18px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${met ? "rgba(63,185,80,0.1)" : "rgba(248,81,73,0.15)"}`,
      }}
    >
      {/* Name */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: serviceColor(svc.service_id),
            boxShadow: `0 0 6px ${serviceColor(svc.service_id)}`,
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: serviceColor(svc.service_id), whiteSpace: "nowrap" }}>
            {svc.service_id}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            {svc.service_name}
          </p>
        </div>
      </div>

      {/* SLA bar */}
      <div>
        <div
          style={{
            height: 6,
            borderRadius: 4,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(pct, 100)}%`,
              borderRadius: 4,
              background: met
                ? "linear-gradient(90deg, var(--green), #2dba4e)"
                : "linear-gradient(90deg, var(--red), #e63946)",
            }}
          />
        </div>
        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
          {formatNumber(svc.total_checks)} checks
        </p>
      </div>

      {/* Availability % */}
      <div style={{ textAlign: "right" }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: met ? "var(--green)" : "var(--red)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatPercent(pct)}
        </p>
        <p style={{ fontSize: 10, color: "var(--text-muted)" }}>SLA</p>
      </div>

      {/* Avg latency */}
      <div style={{ textAlign: "right" }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatLatencyMs(svc.avg_latency_ms)}
        </p>
        <p style={{ fontSize: 10, color: "var(--text-muted)" }}>avg latency</p>
      </div>

      {/* Badge */}
      <div style={{ textAlign: "right" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 20,
            background: met ? "var(--green-bg)" : "var(--red-bg)",
            color: met ? "var(--green)" : "var(--red)",
            border: `1px solid ${met ? "rgba(63,185,80,0.3)" : "rgba(248,81,73,0.3)"}`,
          }}
        >
          {met ? "✓ MET" : "✗ BREACH"}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
      <p style={{ fontSize: 32, marginBottom: 12 }}>📊</p>
      <p style={{ fontSize: 14 }}>
        Stats will appear after uploading a monitoring CSV.
      </p>
    </div>
  );
}
