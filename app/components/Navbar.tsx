"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(13,17,23,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Brand */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(37,99,235,0.4)",
                fontSize: 16,
              }}
            >
              📡
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              SLA Monitor
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NavLink href="/upload" active={path === "/upload"} label="Upload" icon="⬆" />
          <NavLink href="/dashboard" active={path === "/dashboard"} label="Dashboard" icon="📊" />
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  label,
  icon,
}: {
  href: string;
  active: boolean;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
        transition: "all 0.2s",
        background: active ? "rgba(37,99,235,0.15)" : "transparent",
        color: active ? "var(--accent-light)" : "var(--text-secondary)",
        border: active
          ? "1px solid rgba(37,99,235,0.3)"
          : "1px solid transparent",
      }}
    >
      <span style={{ fontSize: 12 }}>{icon}</span>
      {label}
    </Link>
  );
}
