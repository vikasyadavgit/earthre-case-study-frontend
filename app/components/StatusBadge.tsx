import { statusColor, statusBg } from "../lib/utils";

interface Props {
  code: number;
}

export default function StatusBadge({ code }: Props) {
  const label =
    code >= 200 && code < 300
      ? "OK"
      : code >= 400 && code < 500
      ? "4xx"
      : code >= 500
      ? "5xx"
      : code >= 300
      ? "3xx"
      : "ERR";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        background: statusBg(code),
        color: statusColor(code),
        border: `1px solid ${statusColor(code)}33`,
        whiteSpace: "nowrap",
        fontFamily: "var(--font-mono, monospace)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: statusColor(code),
          flexShrink: 0,
          boxShadow: `0 0 4px ${statusColor(code)}`,
        }}
      />
      {code} {label}
    </span>
  );
}
