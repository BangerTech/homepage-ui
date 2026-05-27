"use client";

import { useState } from "react";
import { Save, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface SaveBarProps {
  onSave: () => Promise<void>;
  hasChanges?: boolean;
  label?: string;
}

type Status = "idle" | "saving" | "saved" | "error" | "restarting" | "restarted" | "restart-error";

export default function SaveBar({ onSave, hasChanges = false, label = "Unsaved changes" }: SaveBarProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSave() {
    setStatus("saving");
    setError("");
    try {
      await onSave();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      setStatus("error");
      setError(String(e));
    }
  }

  async function handleSaveAndRestart() {
    setStatus("saving");
    setError("");
    try {
      await onSave();
      setStatus("restarting");
      const res = await fetch("/api/docker/restart", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setStatus("restarted");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("restart-error");
        setError(data.error || "Restart failed");
      }
    } catch (e) {
      setStatus("error");
      setError(String(e));
    }
  }

  const isLoading = status === "saving" || status === "restarting";

  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#161b22",
        borderTop: "1px solid #30363d",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 50,
      }}
    >
      <div style={{ fontSize: 13, color: "#8b949e" }}>
        {status === "idle" && hasChanges && (
          <span style={{ color: "#d29922" }}>● {label}</span>
        )}
        {status === "idle" && !hasChanges && (
          <span style={{ color: "#6e7681" }}>No unsaved changes</span>
        )}
        {status === "saving" && (
          <span style={{ color: "#58a6ff", display: "flex", alignItems: "center", gap: 6 }}>
            <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving...
          </span>
        )}
        {status === "restarting" && (
          <span style={{ color: "#58a6ff", display: "flex", alignItems: "center", gap: 6 }}>
            <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Restarting homepage...
          </span>
        )}
        {status === "saved" && (
          <span style={{ color: "#3fb950", display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={13} /> Saved successfully
          </span>
        )}
        {status === "restarted" && (
          <span style={{ color: "#3fb950", display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={13} /> Saved & homepage restarted
          </span>
        )}
        {(status === "error" || status === "restart-error") && (
          <span style={{ color: "#f85149", display: "flex", alignItems: "center", gap: 6 }}>
            <XCircle size={13} /> {error || "An error occurred"}
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSave}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 6,
            border: "1px solid #30363d",
            backgroundColor: isLoading ? "#21262d" : "#21262d",
            color: isLoading ? "#6e7681" : "#e6edf3",
            fontSize: 13,
            fontWeight: 500,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          <Save size={13} />
          Save
        </button>
        <button
          onClick={handleSaveAndRestart}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 6,
            border: "none",
            backgroundColor: isLoading ? "#1a3520" : "#238636",
            color: isLoading ? "#6e7681" : "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw size={13} />
          Save & Restart Homepage
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
