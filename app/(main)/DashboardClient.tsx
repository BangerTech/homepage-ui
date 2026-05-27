"use client";

import { useState, useEffect } from "react";
import {
  Server, Bookmark, Puzzle, RefreshCw, CheckCircle, XCircle,
  Loader2, FolderOpen, Container, Activity, Layers,
} from "lucide-react";
import type { ServiceGroup, BookmarkGroup } from "@/types";

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
}

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
  configPath, containerName, homepageTitle,
  serviceGroups, totalServices, bookmarkGroups, totalBookmarks, widgetCount, error,
}: Props) {
  const [restartStatus, setRestartStatus] = useState<RestartStatus>("idle");
  const [restartError, setRestartError]   = useState("");
  const [containers, setContainers]       = useState<DockerContainer[]>([]);
  const [containersLoading, setContainersLoading] = useState(true);

  useEffect(() => {
    fetch("/api/docker/containers")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setContainers(d.containers); })
      .catch(() => {})
      .finally(() => setContainersLoading(false));
  }, [restartStatus]);

  async function handleRestart() {
    setRestartStatus("loading");
    setRestartError("");
    try {
      const res  = await fetch("/api/docker/restart", { method: "POST" });
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

  const running = containers.filter((c) => c.state === "running").length;
  const stopped = containers.filter((c) => c.state !== "running").length;

  const stats = [
    {
      label: "Service Groups", value: serviceGroups.length,
      sub: `${totalServices} total services`, icon: Server,
      grad: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
      glow: "rgba(59,130,246,0.25)", href: "/services",
    },
    {
      label: "Bookmarks", value: totalBookmarks,
      sub: `across ${bookmarkGroups.length} groups`, icon: Bookmark,
      grad: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
      glow: "rgba(245,158,11,0.25)", href: "/bookmarks",
    },
    {
      label: "Widgets", value: widgetCount,
      sub: "info widgets", icon: Puzzle,
      grad: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
      glow: "rgba(16,185,129,0.25)", href: "/widgets",
    },
    {
      label: "Containers", value: running,
      sub: `${stopped} stopped`, icon: Activity,
      grad: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
      glow: "rgba(139,92,246,0.25)", href: "#containers",
    },
  ];

  return (
    <div style={{ padding: "36px 36px 80px", minHeight: "100vh" }}>

      {/* ── Hero header ── */}
      <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 800,
            background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}>
            Dashboard
          </h1>
          <p style={{ margin: "5px 0 0", color: "#7d8fa3", fontSize: 14 }}>
            Managing config for{" "}
            <span style={{
              background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 600,
            }}>
              {homepageTitle}
            </span>
          </p>
        </div>

        <button
          onClick={handleRestart}
          disabled={restartStatus === "loading"}
          className="btn-glow"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 20px", borderRadius: 9, border: "none",
            background: restartStatus === "ok"
              ? "linear-gradient(135deg, #064e3b, #065f46)"
              : restartStatus === "error"
              ? "linear-gradient(135deg, #450a0a, #7f1d1d)"
              : "linear-gradient(135deg, #065f46, #047857)",
            color: restartStatus === "ok" ? "#34d399"
                 : restartStatus === "error" ? "#f87171" : "#fff",
            fontWeight: 600, fontSize: 14,
            cursor: restartStatus === "loading" ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(5,150,105,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {restartStatus === "loading" ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
           : restartStatus === "ok"    ? <CheckCircle size={15} />
           : restartStatus === "error" ? <XCircle size={15} />
           : <RefreshCw size={15} />}
          {restartStatus === "loading" ? "Restarting..."
           : restartStatus === "ok"    ? "Restarted!"
           : restartStatus === "error" ? "Failed"
           : "Restart Homepage"}
        </button>
      </div>

      {/* errors */}
      {(restartError || error) && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 10, padding: "10px 16px", marginBottom: 24, color: "#f87171", fontSize: 13,
        }}>
          {restartError || `Error reading config: ${error}`}
        </div>
      )}

      {/* ── Stats grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map(({ label, value, sub, icon: Icon, grad, glow, href }) => (
          <a
            key={label}
            href={href}
            className="card-3d"
            style={{
              textDecoration: "none", display: "block",
              background: "rgba(17,24,39,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "22px 20px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              cursor: "pointer",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* subtle gradient bg */}
            <div style={{
              position: "absolute", top: -20, right: -20,
              width: 100, height: 100, borderRadius: "50%",
              background: grad, opacity: 0.08, filter: "blur(20px)",
              pointerEvents: "none",
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: grad, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 14px ${glow}`,
              }}>
                <Icon size={18} color="#fff" />
              </div>
              <span style={{
                fontSize: 32, fontWeight: 800,
                background: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1,
              }}>{value}</span>
            </div>
            <div style={{ marginTop: 16, position: "relative" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{label}</div>
              <div style={{ fontSize: 12, color: "#4a5568", marginTop: 3 }}>{sub}</div>
            </div>
          </a>
        ))}
      </div>

      {/* ── Connection info ── */}
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#4a5568", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
          Connection
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: FolderOpen, label: "Config path",    value: configPath },
            { icon: Container,  label: "Container name", value: containerName },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={13} color="#7d8fa3" />
              </div>
              <span style={{ fontSize: 13, color: "#7d8fa3", width: 110 }}>{label}</span>
              <code style={{
                background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)",
                padding: "3px 10px", borderRadius: 6, fontSize: 13, color: "#60a5fa",
              }}>
                {value}
              </code>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* ── Container Status ── */}
        <div className="glass-card" style={{ padding: "20px 24px" }} id="containers">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4a5568", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Docker Containers
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
              <span style={{ color: "#10b981" }}>● {running} running</span>
              <span style={{ color: "#4a5568" }}>● {stopped} stopped</span>
            </div>
          </div>
          {containersLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4a5568", fontSize: 13, padding: "8px 0" }}>
              <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Loading containers...
            </div>
          ) : containers.length === 0 ? (
            <div style={{ color: "#4a5568", fontSize: 13, padding: "8px 0" }}>No containers found</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 300, overflowY: "auto" }}>
              {containers
                .sort((a, b) => (a.state === "running" ? -1 : 1) - (b.state === "running" ? -1 : 1))
                .map((c) => (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "7px 10px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span className={`status-dot ${c.state === "running" ? "running" : "stopped"}`} />
                    <span style={{ fontSize: 13, color: c.state === "running" ? "#e2e8f0" : "#7d8fa3", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "#4a5568", whiteSpace: "nowrap", marginLeft: 8 }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Service Groups overview ── */}
        {serviceGroups.length > 0 && (
          <div className="glass-card" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4a5568", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              Service Groups
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 300, overflowY: "auto" }}>
              {serviceGroups.map((group, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "7px 10px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Layers size={13} color="#6366f1" />
                    <span style={{ fontSize: 13, color: "#e2e8f0" }}>{group.name}</span>
                  </div>
                  <span style={{
                    background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                    color: "#818cf8", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
                  }}>
                    {group.services.length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
