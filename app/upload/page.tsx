"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "../components/Navbar";
import UploadZone from "../components/UploadZone";
import UploadResult from "../components/UploadResult";
import { uploadCSV } from "../lib/api";
import type { StoredState, UploadStatus } from "../lib/types";
import { saveToStorage } from "../lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setError(null);
    setProgress(0);

    // Animate progress (fake because fetch doesn't expose upload progress easily)
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 12, 90));
    }, 400);

    try {
      const data = await uploadCSV(file);
      clearInterval(progressInterval);
      setProgress(100);

      // Persist result for dashboard page
      saveToStorage({ upload: data, uploadedAt: new Date().toISOString() });

      setTimeout(() => {
        setResult(data);
        setStatus("success");
      }, 300);
    } catch (e: unknown) {
      clearInterval(progressInterval);
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    }
  };

  const handleViewDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Hero section */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "64px 24px 48px",
          textAlign: "center",
        }}
      >
        {/* Background gradient blobs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 300,
            background: "radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="fade-in" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 20,
              background: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.25)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--accent-light)",
              marginBottom: 24,
              letterSpacing: "0.04em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                animation: "glow-pulse 2s infinite",
              }}
            />
            LIVE · AWS LAMBDA + DYNAMODB
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: 16,
              background: "linear-gradient(135deg, #f0f6fc 0%, #8b949e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SLA Monitoring Dashboard
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "var(--text-secondary)",
              maxWidth: 500,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Upload your monitoring CSV. Our serverless pipeline validates,
            deduplicates, and persists the data — then shows you what actually
            happened.
          </p>
        </div>
      </div>

      {/* Main upload card */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "0 24px 80px",
          zIndex: 1,
        }}
      >
        <div style={{ width: "100%", maxWidth: 640 }}>
          {status === "success" && result ? (
            <div className="fade-in">
              <UploadResult result={result} onViewDashboard={handleViewDashboard} />
            </div>
          ) : (
            <div
              className="glass-card fade-in"
              style={{ padding: 32 }}
            >
              <UploadZone
                onFileSelected={setFile}
                disabled={status === "uploading"}
              />

              {/* Error */}
              {error && (
                <div
                  className="slide-down"
                  style={{
                    marginTop: 16,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "var(--red-bg)",
                    border: "1px solid rgba(248,81,73,0.25)",
                    color: "var(--red)",
                    fontSize: 13,
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Progress bar */}
              {status === "uploading" && (
                <div className="slide-down" style={{ marginTop: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      Processing on AWS Lambda…
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--accent-light)",
                      }}
                    >
                      {Math.round(progress)}%
                    </span>
                  </div>
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
                        width: `${progress}%`,
                        borderRadius: 4,
                        background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                        transition: "width 0.4s ease",
                        boxShadow: "0 0 10px rgba(37,99,235,0.5)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      "Parsing CSV",
                      "Validating rows",
                      "Deduplicating",
                      "Writing to DB",
                    ].map((step, i) => (
                      <span
                        key={step}
                        style={{
                          fontSize: 11,
                          padding: "2px 10px",
                          borderRadius: 20,
                          background:
                            progress > i * 22
                              ? "var(--blue-bg)"
                              : "rgba(255,255,255,0.03)",
                          color:
                            progress > i * 22
                              ? "var(--blue)"
                              : "var(--text-muted)",
                          border: `1px solid ${progress > i * 22 ? "rgba(88,166,255,0.25)" : "transparent"}`,
                          transition: "all 0.3s",
                        }}
                      >
                        {progress > i * 22 ? "✓ " : "· "}
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload button */}
              {status !== "uploading" && (
                <button
                  id="upload-btn"
                  onClick={handleUpload}
                  disabled={!file}
                  style={{
                    width: "100%",
                    marginTop: 20,
                    padding: "14px 24px",
                    borderRadius: 12,
                    border: "none",
                    background: file
                      ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                      : "rgba(255,255,255,0.06)",
                    color: file ? "#fff" : "var(--text-muted)",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: file ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    boxShadow: file
                      ? "0 4px 20px rgba(37,99,235,0.35)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (file) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 30px rgba(37,99,235,0.5)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = file
                      ? "0 4px 20px rgba(37,99,235,0.35)"
                      : "none";
                  }}
                >
                  {file ? "🚀  Process & Upload" : "Select a CSV file first"}
                </button>
              )}

              {/* Footer hint */}
              <p
                style={{
                  marginTop: 16,
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                Processed by AWS Lambda · Stored in DynamoDB · Typically takes
                5–15s
              </p>
            </div>
          )}

          {/* Architecture chips */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "⬆", label: "Next.js Upload" },
              { icon: "→", label: "" },
              { icon: "λ", label: "AWS Lambda" },
              { icon: "→", label: "" },
              { icon: "🗄", label: "DynamoDB" },
              { icon: "→", label: "" },
              { icon: "📊", label: "Dashboard" },
            ].map((chip, i) =>
              chip.label === "" ? (
                <span
                  key={i}
                  style={{ color: "var(--text-muted)", alignSelf: "center" }}
                >
                  {chip.icon}
                </span>
              ) : (
                <span
                  key={chip.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    padding: "5px 12px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {chip.icon} {chip.label}
                </span>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
