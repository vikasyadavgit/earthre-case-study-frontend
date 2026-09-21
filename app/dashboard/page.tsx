"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatsPanel from "../components/StatsPanel";
import LogsTable from "../components/LogsTable";
import type { DashboardResponse, StoredState } from "../lib/types";
import { fetchDashboard } from "../lib/api";
import { loadFromStorage } from "../lib/utils";

export default function DashboardPage() {
  const [mounted,   setMounted]   = useState(false);
  const [stored,    setStored]    = useState<StoredState | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError,   setDashError]   = useState<string | null>(null);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setStored(loadFromStorage<StoredState>());
    setMounted(true);
  }, []);

  // Fetch /dashboard as soon as component mounts
  useEffect(() => {
    let cancelled = false;
    setDashLoading(true);
    setDashError(null);

    fetchDashboard()
      .then((data) => { if (!cancelled) setDashboard(data); })
      .catch((e: unknown) => {
        if (!cancelled)
          setDashError(e instanceof Error ? e.message : "Failed to load dashboard.");
      })
      .finally(() => { if (!cancelled) setDashLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // Avoid hydration mismatch — render shell until mounted
  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />
      </div>
    );
  }

  const hasDashboardData = dashboard !== null || dashLoading;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* ── Page header ─────────────────────────────────────── */}
      <div
        style={{
          padding: "40px 24px 28px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(255,255,255,0.01)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blob */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: "8%",
            width: 400,
            height: 200,
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div className="fade-in">
            {/* Live badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "4px 12px",
                borderRadius: 20,
                background: dashError
                  ? "var(--red-bg)"
                  : hasDashboardData
                  ? "rgba(63,185,80,0.1)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  dashError
                    ? "rgba(248,81,73,0.25)"
                    : hasDashboardData
                    ? "rgba(63,185,80,0.2)"
                    : "var(--border-subtle)"
                }`,
                fontSize: 11,
                fontWeight: 600,
                color: dashError
                  ? "var(--red)"
                  : hasDashboardData
                  ? "var(--green)"
                  : "var(--text-muted)",
                marginBottom: 12,
                letterSpacing: "0.04em",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: dashError ? "var(--red)" : "var(--green)",
                  boxShadow: dashError ? "none" : "0 0 6px var(--green)",
                  animation: dashLoading ? "glow-pulse 1.5s infinite" : "none",
                }}
              />
              {dashLoading
                ? "FETCHING LIVE DATA…"
                : dashError
                ? "API ERROR"
                : "LIVE DATA"}
            </div>

            <h1
              style={{
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                marginBottom: 8,
              }}
            >
              SLA Dashboard
            </h1>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {stored?.uploadedAt && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Last upload:{" "}
                  <strong style={{ color: "var(--text-primary)" }}>
                    {new Date(stored.uploadedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </p>
              )}
              {dashboard && (
                <>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Overall SLA:{" "}
                    <strong
                      style={{
                        color: dashboard.sla_met ? "var(--green)" : "var(--red)",
                      }}
                    >
                      {dashboard.availability.toFixed(2)}%
                    </strong>
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    p95 latency:{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {dashboard.p95_latency_ms} ms
                    </strong>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* New upload CTA */}
          <Link
            href="/upload"
            id="new-upload-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              background: "rgba(37,99,235,0.12)",
              border: "1px solid rgba(37,99,235,0.3)",
              color: "var(--accent-light)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(37,99,235,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(37,99,235,0.12)";
            }}
          >
            ⬆ New Upload
          </Link>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────── */}
      {dashError && (
        <div
          style={{
            maxWidth: 1280,
            width: "100%",
            margin: "16px auto 0",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "var(--red-bg)",
              border: "1px solid rgba(248,81,73,0.25)",
              color: "var(--red)",
              fontSize: 13,
            }}
          >
            ⚠️ Dashboard API error: {dashError}
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
          padding: "28px 24px 64px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Stats Panel — always render; loading state handled inside */}
        <div className="fade-in">
          <StatsPanel
            dashboard={dashboard}
            upload={stored?.upload ?? null}
            loading={dashLoading}
          />
        </div>

        {/* Logs Table */}
        <div
          className="fade-in"
          style={{
            opacity: 0,
            animation: "fadeIn 0.4s ease 0.12s forwards",
          }}
        >
          <LogsTable />
        </div>
      </main>
    </div>
  );
}
