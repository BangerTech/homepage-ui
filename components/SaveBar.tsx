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
  const [error, setError]   = useState("");

  async function handleSave() {
    setStatus("saving"); setError("");
    try {
      await onSave();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      setStatus("error"); setError(String(e));
    }
  }

  async function handleSaveAndRestart() {
    setStatus("saving"); setError("");
    try {
      await onSave();
      setStatus("restarting");
      const res  = await fetch("/api/docker/restart", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setStatus("restarted");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("restart-error");
        setError(data.error || "Restart failed");
      }
    } catch (e) {
      setStatus("error"); setError(String(e));
    }
  }

  const isLoading = status === "saving" || status === "restarting";

  const statusEl = (() => {
    if (status === "idle" && hasChanges)
      return <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 6px #f59e0b", display: "inline-block" }} />
        {label}
      </span>;
    if (status === "idle")
      return <span style={{ color: "#4a5568" }}>No unsaved changes</span>;
    if (status === "saving")
      return <span style={{ color: "#60a5fa", display: "flex", alignItems: "center", gap: 6 }}>
        <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving...
      </span>;
    if (status === "restarting")
      return <span style={{ color: "#60a5fa", display: "flex", alignItems: "center", gap: 6 }}>
        <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Restarting homepage...
      </span>;
    if (status === "saved")
      return <span style={{ color: "#34d399", display: "flex", alignItems: "center", gap: 6 }}>
        <CheckCircle size={13} /> Saved successfully
      </span>;
    if (status === "restarted")
      return <span style={{ color: "#34d399", display: "flex", alignItems: "center", gap: 6 }}>
        <CheckCircle size={13} /> Saved &amp; homepage restarted
      </span>;
    return <span style={{ color: "#f87171", display: "flex", alignItems: "center", gap: 6 }}>
      <XCircle size={13} /> {error || "An error occurred"}
    </span>;
  })();

  return (
    <div style={{
      position: "sticky", bottom: 0, left: 0, right: 0,
      background: "rgba(7,11,17,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "12px 28px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      zIndex: 50,
      boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
    }}>
      <div style={{ fontSize: 13 }}>{statusEl}</div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSave}
          disabled={isLoading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            color: isLoading ? "#4a5568" : "#e2e8f0",
            fontSize: 13, fontWeight: 500,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            backdropFilter: "blur(10px)",
          }}
          onMouseEnter={(e) => {
            if (!isLoading) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
          }}
        >
          <Save size={13} /> Save
        </button>
        <button
          onClick={handleSaveAndRestart}
          disabled={isLoading}
          className="btn-glow"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: isLoading
              ? "rgba(5,150,105,0.3)"
              : "linear-gradient(135deg, #065f46, #047857)",
            color: isLoading ? "#4a5568" : "#fff",
            fontSize: 13, fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: isLoading ? "none" : "0 4px 14px rgba(5,150,105,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <RefreshCw size={13} /> Save &amp; Restart Homepage
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
