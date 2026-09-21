"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFileSelected, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        alert("Please upload a CSV file.");
        return;
      }
      setSelected(file);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  const onClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        id="upload-dropzone"
        onClick={onClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : selected ? "var(--green)" : "rgba(255,255,255,0.15)"}`,
          borderRadius: 16,
          padding: "60px 40px",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "center",
          transition: "all 0.3s ease",
          background: dragging
            ? "rgba(37,99,235,0.06)"
            : selected
            ? "rgba(63,185,80,0.04)"
            : "rgba(255,255,255,0.02)",
          animation: !selected && !dragging ? "pulse-border 3s ease infinite" : "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow overlay when dragging */}
        {dragging && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at center, rgba(37,99,235,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}

        <input
          ref={inputRef}
          id="file-input"
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {selected ? (
          /* File selected state */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "var(--green-bg)",
                border: "1px solid rgba(63,185,80,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              📄
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, color: "var(--green)", marginBottom: 4 }}>
                {selected.name}
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                {formatSize(selected.size)} · CSV file ready to upload
              </p>
            </div>
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  background: "none",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 6,
                  padding: "4px 12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Change file
              </button>
            )}
          </div>
        ) : (
          /* Empty state */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "var(--bg-glass)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                transition: "all 0.3s",
                ...(dragging && {
                  background: "rgba(37,99,235,0.15)",
                  borderColor: "var(--accent)",
                  transform: "scale(1.1)",
                }),
              }}
            >
              {dragging ? "📥" : "📁"}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)", marginBottom: 8 }}>
                {dragging ? "Drop your CSV here" : "Drop your monitoring CSV here"}
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                or{" "}
                <span style={{ color: "var(--accent-light)", fontWeight: 500 }}>
                  click to browse
                </span>
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 16,
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              <span>✓ CSV format</span>
              <span>✓ All services</span>
              <span>✓ Any date range</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
