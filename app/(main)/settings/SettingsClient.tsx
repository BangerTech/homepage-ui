"use client";

import { useState, useCallback } from "react";
import { CheckCircle, XCircle, Loader2, Trash2, Plus } from "lucide-react";
import SaveBar from "@/components/SaveBar";
import type { HomepageSettings, AppSettings } from "@/types";

interface Props {
  initialSettings: HomepageSettings;
  initialAppSettings: AppSettings;
  loadError: string;
}

type TestState = "idle" | "loading" | "ok" | "error";

const THEMES = ["dark", "light"];
const COLORS = ["slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];
const BLUR_OPTIONS = ["", "sm", "md", "lg", "xl", "2xl", "3xl"];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#8b949e",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        margin: "0 0 16px",
        paddingBottom: 10,
        borderBottom: "1px solid #30363d",
      }}
    >
      {children}
    </h2>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#e6edf3", marginBottom: 4 }}>
        {label}
      </label>
      {hint && (
        <div style={{ fontSize: 12, color: "#6e7681", marginBottom: 6 }}>{hint}</div>
      )}
      {children}
    </div>
  );
}

export default function SettingsClient({ initialSettings, initialAppSettings, loadError }: Props) {
  const [settings, setSettings] = useState<HomepageSettings>(initialSettings);
  const [appSettings, setAppSettings] = useState<AppSettings>(initialAppSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const [configTest, setConfigTest] = useState<TestState>("idle");
  const [configError, setConfigError] = useState("");
  const [dockerTest, setDockerTest] = useState<TestState>("idle");
  const [dockerError, setDockerError] = useState("");

  function update(patch: Partial<HomepageSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
    setHasChanges(true);
  }

  function updateBackground(patch: Partial<NonNullable<HomepageSettings["background"]>>) {
    setSettings((prev) => ({
      ...prev,
      background: { ...(prev.background || {}), ...patch },
    }));
    setHasChanges(true);
  }

  function updateLayoutGroup(name: string, patch: Record<string, unknown>) {
    setSettings((prev) => ({
      ...prev,
      layout: {
        ...(prev.layout || {}),
        [name]: { ...(prev.layout?.[name] || {}), ...patch },
      },
    }));
    setHasChanges(true);
  }

  function deleteLayoutGroup(name: string) {
    setSettings((prev) => {
      const layout = { ...(prev.layout || {}) };
      delete layout[name];
      return { ...prev, layout };
    });
    setHasChanges(true);
  }

  const [newLayoutName, setNewLayoutName] = useState("");

  function addLayoutGroup() {
    if (!newLayoutName.trim()) return;
    updateLayoutGroup(newLayoutName.trim(), {});
    setNewLayoutName("");
  }

  async function testConfigPath() {
    setConfigTest("loading");
    setConfigError("");
    const res = await fetch("/api/config/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configPath: appSettings.configPath }),
    });
    const data = await res.json();
    if (data.ok) setConfigTest("ok");
    else { setConfigTest("error"); setConfigError(data.error || "Path not valid"); }
  }

  async function testDocker() {
    setDockerTest("loading");
    setDockerError("");
    const res = await fetch("/api/docker/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ containerName: appSettings.containerName }),
    });
    const data = await res.json();
    if (data.ok) setDockerTest("ok");
    else { setDockerTest("error"); setDockerError(data.error || "Not found"); }
  }

  const handleSave = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch("/api/config/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: settings }),
      }),
      fetch("/api/app-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appSettings),
      }),
    ]);
    if (!r1.ok || !r2.ok) throw new Error("Save failed");
    setHasChanges(false);
  }, [settings, appSettings]);

  const inputStyle = { width: "100%", height: 36 };
  const layoutGroups = Object.entries(settings.layout || {});

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: "24px 32px 16px", borderBottom: "1px solid #30363d" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e6edf3", margin: 0 }}>Settings</h1>
        <p style={{ color: "#8b949e", marginTop: 4, fontSize: 13 }}>
          Homepage appearance and App configuration
        </p>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 800 }}>
        {loadError && (
          <div
            style={{
              backgroundColor: "#2d1515",
              border: "1px solid #f85149",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 20,
              color: "#f85149",
              fontSize: 13,
            }}
          >
            {loadError}
          </div>
        )}

        {/* ── General ───────────────────────── */}
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 10,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <SectionHeader>General</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Title">
              <input
                type="text"
                value={settings.title || ""}
                onChange={(e) => update({ title: e.target.value })}
                style={inputStyle}
                placeholder="My Homepage"
              />
            </Field>
            <Field label="Language">
              <input
                type="text"
                value={settings.language || ""}
                onChange={(e) => update({ language: e.target.value })}
                style={inputStyle}
                placeholder="en"
              />
            </Field>
            <Field label="Favicon URL">
              <input
                type="text"
                value={settings.favicon || ""}
                onChange={(e) => update({ favicon: e.target.value })}
                style={inputStyle}
                placeholder="https://..."
              />
            </Field>
            <Field label="Theme">
              <select
                value={settings.theme || "dark"}
                onChange={(e) => update({ theme: e.target.value })}
                style={inputStyle}
              >
                {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Color">
              <select
                value={settings.color || "slate"}
                onChange={(e) => update({ color: e.target.value })}
                style={inputStyle}
              >
                {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Equal Heights">
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#8b949e", height: 36 }}>
                <input
                  type="checkbox"
                  checked={!!settings.useEqualHeights}
                  onChange={(e) => update({ useEqualHeights: e.target.checked })}
                  style={{ accentColor: "#388bfd" }}
                />
                Use equal heights for service cards
              </label>
            </Field>
          </div>
        </div>

        {/* ── Background ─────────────────────── */}
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 10,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <SectionHeader>Background</SectionHeader>
          <Field label="Image URL">
            <input
              type="text"
              value={settings.background?.image || ""}
              onChange={(e) => updateBackground({ image: e.target.value })}
              style={inputStyle}
              placeholder="https://images.unsplash.com/..."
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <Field label="Blur">
              <select
                value={settings.background?.blur || ""}
                onChange={(e) => updateBackground({ blur: e.target.value })}
                style={inputStyle}
              >
                {BLUR_OPTIONS.map((b) => <option key={b} value={b}>{b || "none"}</option>)}
              </select>
            </Field>
            <Field label="Saturate (0-100)">
              <input
                type="number"
                min={0} max={200}
                value={settings.background?.saturate ?? 100}
                onChange={(e) => updateBackground({ saturate: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </Field>
            <Field label="Brightness (0-100)">
              <input
                type="number"
                min={0} max={100}
                value={settings.background?.brightness ?? 100}
                onChange={(e) => updateBackground({ brightness: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </Field>
            <Field label="Opacity (0-100)">
              <input
                type="number"
                min={0} max={100}
                value={settings.background?.opacity ?? 100}
                onChange={(e) => updateBackground({ opacity: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </Field>
          </div>
        </div>

        {/* ── Layout Groups ────────────────────── */}
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 10,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <SectionHeader>Layout Groups</SectionHeader>

          {layoutGroups.map(([name, cfg]) => (
            <div
              key={name}
              style={{
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#e6edf3" }}>{name}</span>
                <button
                  onClick={() => deleteLayoutGroup(name)}
                  style={{ padding: "3px 8px", borderRadius: 5, border: "1px solid #30363d", backgroundColor: "transparent", color: "#f85149", cursor: "pointer" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <Field label="Icon">
                  <input
                    type="text"
                    value={cfg.icon || ""}
                    onChange={(e) => updateLayoutGroup(name, { icon: e.target.value })}
                    style={inputStyle}
                    placeholder="si-docker"
                  />
                </Field>
                <Field label="Style">
                  <select
                    value={cfg.style || ""}
                    onChange={(e) => updateLayoutGroup(name, { style: e.target.value || undefined })}
                    style={inputStyle}
                  >
                    <option value="">default</option>
                    <option value="row">row</option>
                    <option value="column">column</option>
                  </select>
                </Field>
                <Field label="Columns">
                  <input
                    type="number"
                    min={1} max={6}
                    value={cfg.columns ?? ""}
                    onChange={(e) => updateLayoutGroup(name, { columns: e.target.value ? parseInt(e.target.value) : undefined })}
                    style={inputStyle}
                    placeholder="auto"
                  />
                </Field>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#8b949e", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!cfg.useEqualHeights}
                    onChange={(e) => updateLayoutGroup(name, { useEqualHeights: e.target.checked || undefined })}
                    style={{ accentColor: "#388bfd" }}
                  />
                  Equal heights
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#8b949e", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!cfg.initiallyCollapsed}
                    onChange={(e) => updateLayoutGroup(name, { initiallyCollapsed: e.target.checked || undefined })}
                    style={{ accentColor: "#388bfd" }}
                  />
                  Initially collapsed
                </label>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addLayoutGroup(); }}
              placeholder="New group name"
              style={{ flex: 1, height: 32 }}
            />
            <button
              onClick={addLayoutGroup}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "5px 12px", borderRadius: 6, border: "1px solid #30363d",
                backgroundColor: "#21262d", color: "#e6edf3", fontSize: 13,
              }}
            >
              <Plus size={13} /> Add
            </button>
          </div>
        </div>

        {/* ── App Configuration ─────────────────── */}
        <div
          style={{
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 10,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <SectionHeader>App Configuration</SectionHeader>
          <p style={{ fontSize: 13, color: "#8b949e", marginBottom: 12, marginTop: 0 }}>
            Change where Homepage UI looks for config files and which container to restart.
            The config path must be the path <strong style={{ color: "#e6edf3" }}>inside this container</strong>{" "}
            (e.g. <code style={{ backgroundColor: "#0d1117", padding: "1px 5px", borderRadius: 3, color: "#3fb950" }}>/app/config</code>,
            which maps to your host volume mount).
          </p>

          <Field label="Config Path">
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input
                type="text"
                value={appSettings.configPath}
                onChange={(e) => { setAppSettings({ ...appSettings, configPath: e.target.value }); setConfigTest("idle"); setHasChanges(true); }}
                style={{ flex: 1, height: 36 }}
                placeholder="/app/config"
              />
              <button
                onClick={testConfigPath}
                disabled={configTest === "loading"}
                style={{
                  padding: "0 14px", height: 36, borderRadius: 6,
                  border: "1px solid #30363d", backgroundColor: "#21262d",
                  color: "#e6edf3", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {configTest === "loading" && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
                Test
              </button>
            </div>
            {configTest === "ok" && <div style={{ color: "#3fb950", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><CheckCircle size={12} /> Accessible</div>}
            {configTest === "error" && <div style={{ color: "#f85149", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><XCircle size={12} /> {configError}</div>}
          </Field>

          <Field label="Container Name">
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input
                type="text"
                value={appSettings.containerName}
                onChange={(e) => { setAppSettings({ ...appSettings, containerName: e.target.value }); setDockerTest("idle"); setHasChanges(true); }}
                style={{ flex: 1, height: 36 }}
                placeholder="homepage"
              />
              <button
                onClick={testDocker}
                disabled={dockerTest === "loading"}
                style={{
                  padding: "0 14px", height: 36, borderRadius: 6,
                  border: "1px solid #30363d", backgroundColor: "#21262d",
                  color: "#e6edf3", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {dockerTest === "loading" && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
                Test
              </button>
            </div>
            {dockerTest === "ok" && <div style={{ color: "#3fb950", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><CheckCircle size={12} /> Container found</div>}
            {dockerTest === "error" && <div style={{ color: "#f85149", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><XCircle size={12} /> {dockerError}</div>}
          </Field>
        </div>
      </div>

      <SaveBar onSave={handleSave} hasChanges={hasChanges} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
