"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, FolderOpen, Container, Rocket } from "lucide-react";

type Step = 1 | 2 | 3;
type TestState = "idle" | "loading" | "ok" | "error";

export default function SetupPage() {
  const [step, setStep] = useState<Step>(1);

  const [configPath, setConfigPath] = useState("/app/config");
  const [configTest, setConfigTest] = useState<TestState>("idle");
  const [configError, setConfigError] = useState("");

  const [containerName, setContainerName] = useState("homepage");
  const [dockerTest, setDockerTest] = useState<TestState>("idle");
  const [dockerError, setDockerError] = useState("");

  const [saving, setSaving] = useState(false);

  async function testConfigPath() {
    setConfigTest("loading");
    setConfigError("");
    try {
      const res = await fetch("/api/config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configPath }),
      });
      const data = await res.json();
      if (data.ok) {
        setConfigTest("ok");
      } else {
        setConfigTest("error");
        setConfigError(data.error || "Path not valid");
      }
    } catch (e) {
      setConfigTest("error");
      setConfigError(String(e));
    }
  }

  async function testDocker() {
    setDockerTest("loading");
    setDockerError("");
    try {
      const res = await fetch("/api/docker/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ containerName }),
      });
      const data = await res.json();
      if (data.ok) {
        setDockerTest("ok");
      } else {
        setDockerTest("error");
        setDockerError(data.error || "Container not found");
      }
    } catch (e) {
      setDockerTest("error");
      setDockerError(String(e));
    }
  }

  async function finish() {
    setSaving(true);
    try {
      const res = await fetch("/api/app-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configPath, containerName }),
      });
      if (!res.ok) throw new Error("Save failed");
      window.location.href = "/";
    } catch {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "linear-gradient(135deg, #388bfd, #58a6ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: "bold",
              color: "#fff",
              margin: "0 auto 16px",
            }}
          >
            H
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#e6edf3", margin: 0 }}>
            Welcome to Homepage UI
          </h1>
          <p style={{ color: "#8b949e", marginTop: 8, fontSize: 15 }}>
            Let&apos;s connect to your homepage configuration
          </p>
        </div>

        {/* Step progress */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            gap: 0,
          }}
        >
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor:
                    step === s ? "#388bfd" : step > s ? "#3fb950" : "#21262d",
                  color: step >= s ? "#fff" : "#8b949e",
                  border: `2px solid ${step === s ? "#388bfd" : step > s ? "#3fb950" : "#30363d"}`,
                  transition: "all 0.2s",
                }}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  style={{
                    width: 60,
                    height: 2,
                    backgroundColor: step > s ? "#3fb950" : "#30363d",
                    transition: "background-color 0.2s",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 12,
            padding: 32,
          }}
        >
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <FolderOpen size={20} color="#388bfd" />
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#e6edf3", margin: 0 }}>
                  Config Directory
                </h2>
              </div>
              <p style={{ color: "#8b949e", marginBottom: 12, marginTop: 6, fontSize: 14 }}>
                Enter the path to the homepage config directory <strong style={{ color: "#e6edf3" }}>as seen from inside this container</strong>.
              </p>
              <div
                style={{
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 20,
                  fontSize: 12,
                  color: "#8b949e",
                  lineHeight: 1.7,
                }}
              >
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: "#6e7681" }}>Host path:</span>{" "}
                  <code style={{ color: "#f0883e" }}>/media/docker-extern-ssd/homepage/config</code>
                </div>
                <div style={{ marginBottom: 4, color: "#6e7681", paddingLeft: 8 }}>↓ mounted as ↓</div>
                <div>
                  <span style={{ color: "#6e7681" }}>Container path:</span>{" "}
                  <code style={{ color: "#3fb950" }}>/app/config</code>
                  <span style={{ color: "#6e7681", marginLeft: 6 }}>(use this)</span>
                </div>
              </div>

              <label style={{ display: "block", marginBottom: 6, color: "#8b949e", fontSize: 13 }}>
                Config path
              </label>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  value={configPath}
                  onChange={(e) => {
                    setConfigPath(e.target.value);
                    setConfigTest("idle");
                  }}
                  style={{ flex: 1, height: 36 }}
                  placeholder="/app/config"
                />
                <button
                  onClick={testConfigPath}
                  disabled={configTest === "loading"}
                  style={{
                    padding: "0 16px",
                    height: 36,
                    borderRadius: 6,
                    border: "1px solid #30363d",
                    backgroundColor: "#21262d",
                    color: "#e6edf3",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  {configTest === "loading" ? (
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  ) : null}
                  Test
                </button>
              </div>

              {configTest === "ok" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#3fb950",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  <CheckCircle size={14} /> Config directory is accessible
                </div>
              )}
              {configTest === "error" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                    color: "#f85149",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  <XCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                  {configError}
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={configTest !== "ok"}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: configTest === "ok" ? "#238636" : "#21262d",
                  color: configTest === "ok" ? "#fff" : "#6e7681",
                  fontWeight: 600,
                  fontSize: 14,
                  marginTop: 8,
                  cursor: configTest === "ok" ? "pointer" : "not-allowed",
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <Container size={20} color="#388bfd" />
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#e6edf3", margin: 0 }}>
                  Docker Container
                </h2>
              </div>
              <p style={{ color: "#8b949e", marginBottom: 24, marginTop: 6, fontSize: 14 }}>
                Enter the name of your homepage Docker container. This is used to restart
                homepage after saving changes.
              </p>

              <label style={{ display: "block", marginBottom: 6, color: "#8b949e", fontSize: 13 }}>
                Container name
              </label>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  value={containerName}
                  onChange={(e) => {
                    setContainerName(e.target.value);
                    setDockerTest("idle");
                  }}
                  style={{ flex: 1, height: 36 }}
                  placeholder="homepage"
                />
                <button
                  onClick={testDocker}
                  disabled={dockerTest === "loading"}
                  style={{
                    padding: "0 16px",
                    height: 36,
                    borderRadius: 6,
                    border: "1px solid #30363d",
                    backgroundColor: "#21262d",
                    color: "#e6edf3",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  {dockerTest === "loading" ? (
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  ) : null}
                  Test
                </button>
              </div>

              {dockerTest === "ok" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#3fb950",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  <CheckCircle size={14} /> Container found and accessible
                </div>
              )}
              {dockerTest === "error" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                    color: "#f85149",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  <XCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                  {dockerError}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 6,
                    border: "1px solid #30363d",
                    backgroundColor: "transparent",
                    color: "#8b949e",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={dockerTest !== "ok"}
                  style={{
                    flex: 2,
                    padding: "10px 0",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: dockerTest === "ok" ? "#238636" : "#21262d",
                    color: dockerTest === "ok" ? "#fff" : "#6e7681",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: dockerTest === "ok" ? "pointer" : "not-allowed",
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <Rocket size={20} color="#388bfd" />
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#e6edf3", margin: 0 }}>
                  Ready to Launch
                </h2>
              </div>
              <p style={{ color: "#8b949e", marginBottom: 24, marginTop: 6, fontSize: 14 }}>
                Everything is configured. Here&apos;s a summary of your settings:
              </p>

              <div
                style={{
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: 8,
                  overflow: "hidden",
                  marginBottom: 24,
                }}
              >
                {[
                  { label: "Config Path", value: configPath },
                  { label: "Container Name", value: containerName },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderBottom: i === 0 ? "1px solid #30363d" : "none",
                    }}
                  >
                    <span style={{ color: "#8b949e", fontSize: 13 }}>{label}</span>
                    <code
                      style={{
                        backgroundColor: "#161b22",
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

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 6,
                    border: "1px solid #30363d",
                    backgroundColor: "transparent",
                    color: "#8b949e",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={finish}
                  disabled={saving}
                  style={{
                    flex: 2,
                    padding: "10px 0",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: "#388bfd",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? (
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Rocket size={14} />
                  )}
                  Launch Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#6e7681" }}>
          Settings are stored in <code style={{ color: "#58a6ff" }}>/app/data/app-settings.json</code>
        </p>
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
