"use client";

import { useState } from "react";
import { Server, Bookmark, Puzzle, RefreshCw, CheckCircle, XCircle, Loader2, FolderOpen, Container } from "lucide-react";
import type { ServiceGroup, BookmarkGroup } from "@/types";

interface Props {
  configPath: string;
  containerName: string;
  homepageTitle: string;
  serviceGroups: ServiceGroup[];
  totalServices: number;
  bookmarkGroups: BookmarkGroup[];
  totalBookmarks: number;
  widgetCount: number;
  error: string;
}

type RestartStatus = "idle" | "loading" | "ok" | "error";

export default function DashboardClient({
  configPath,
  containerName,
  homepageTitle,
  serviceGroups,
  totalServices,
  bookmarkGroups,
  totalBookmarks,
  widgetCount,
  error,
}: Props) {
  const [restartStatus, setRestartStatus] = useState<RestartStatus>("idle");
  const [restartError, setRestartError] = useState("");

  async function handleRestart() {
    setRestartStatus("loading");
    setRestartError("");
    try {
      const res = await fetch("/api/docker/restart", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setRestartStatus("ok");
        setTimeout(() => setRestartStatus("idle"), 5000);
      } else {
        setRestartStatus("error");
        setRestartError(data.error || "Restart failed");
      }
    } catch (e) {
      setRestartStatus("error");
      setRestartError(String(e));
    }
  }

  const stats = [
    {
      label: "Service Groups",
      value: serviceGroups.length,
      sub: `${totalServices} total services`,
      icon: Server,
      color: "#388bfd",
      href: "/services",
    },
    {
      label: "Bookmarks",
      value: totalBookmarks,
      sub: `across ${bookmarkGroups.length} groups`,
      icon: Bookmark,
      color: "#d29922",
      href: "/bookmarks",
    },
    {
      label: "Widgets",
      value: widgetCount,
      sub: "info widgets",
      icon: Puzzle,
      color: "#3fb950",
      href: "/widgets",
    },
  ];

  return (
    <div style={{ padding: "32px 32px 80px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e6edf3", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ color: "#8b949e", marginTop: 4, fontSize: 14 }}>
            Managing config for{" "}
            <span style={{ color: "#58a6ff", fontWeight: 600 }}>{homepageTitle}</span>
          </p>
        </div>

        <button
          onClick={handleRestart}
          disabled={restartStatus === "loading"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            borderRadius: 6,
            border: "none",
            backgroundColor:
              restartStatus === "ok"
                ? "#1a3520"
                : restartStatus === "error"
                ? "#2d1515"
                : "#238636",
            color:
              restartStatus === "ok"
                ? "#3fb950"
                : restartStatus === "error"
                ? "#f85149"
                : "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: restartStatus === "loading" ? "not-allowed" : "pointer",
          }}
        >
          {restartStatus === "loading" ? (
            <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
          ) : restartStatus === "ok" ? (
            <CheckCircle size={15} />
          ) : restartStatus === "error" ? (
            <XCircle size={15} />
          ) : (
            <RefreshCw size={15} />
          )}
          {restartStatus === "loading"
            ? "Restarting..."
            : restartStatus === "ok"
            ? "Restarted!"
            : restartStatus === "error"
            ? "Failed"
            : "Restart Homepage"}
        </button>
      </div>

      {restartError && (
        <div
          style={{
            backgroundColor: "#2d1515",
            border: "1px solid #f85149",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 24,
            color: "#f85149",
            fontSize: 13,
          }}
        >
          {restartError}
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#2d1515",
            border: "1px solid #f85149",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 24,
            color: "#f85149",
            fontSize: 13,
          }}
        >
          Error reading config: {error}
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {stats.map(({ label, value, sub, icon: Icon, color, href }) => (
          <a
            key={label}
            href={href}
            style={{
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 10,
              padding: "20px 20px",
              textDecoration: "none",
              display: "block",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#388bfd";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#30363d";
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: `${color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#e6edf3" }}>{value}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>{label}</div>
              <div style={{ fontSize: 12, color: "#6e7681", marginTop: 2 }}>{sub}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Config info */}
      <div
        style={{
          backgroundColor: "#161b22",
          border: "1px solid #30363d",
          borderRadius: 10,
          padding: "20px",
          marginBottom: 24,
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#8b949e", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Connection
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: FolderOpen, label: "Config path", value: configPath },
            { icon: Container, label: "Container name", value: containerName },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Icon size={14} color="#6e7681" />
              <span style={{ fontSize: 13, color: "#8b949e", width: 110 }}>{label}</span>
              <code
                style={{
                  backgroundColor: "#0d1117",
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontSize: 13,
                  color: "#58a6ff",
                }}
              >
                {value}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Service groups overview */}
      {serviceGroups.length > 0 && (
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid #30363d",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#8b949e", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Service Groups
            </h3>
          </div>
          <div style={{ padding: "8px 0" }}>
            {serviceGroups.map((group, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 20px",
                }}
              >
                <span style={{ fontSize: 14, color: "#e6edf3" }}>{group.name}</span>
                <span
                  style={{
                    backgroundColor: "#21262d",
                    color: "#8b949e",
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 12,
                  }}
                >
                  {group.services.length} service{group.services.length !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
