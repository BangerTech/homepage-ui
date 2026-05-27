"use client";

import { useState, useCallback } from "react";
import { Trash2, Plus } from "lucide-react";
import SaveBar from "@/components/SaveBar";

interface Props {
  initialWidgets: Record<string, unknown>[];
  loadError: string;
}

type WidgetType = "resources" | "search" | "openweathermap" | "greeting" | "datetime" | "custom";

const WIDGET_TEMPLATES: Record<WidgetType, Record<string, unknown>> = {
  resources: { cpu: true, memory: true, disk: "/" },
  search: { provider: "google", target: "_blank" },
  openweathermap: {
    label: "My Location",
    latitude: 0,
    longitude: 0,
    units: "metric",
    provider: "openweathermap",
    apiKey: "",
    cache: 5,
  },
  greeting: { text: "Good morning!" },
  datetime: { text: "datetime", format: { timeStyle: "short", dateStyle: "short", hourCycle: "h23" } },
  custom: {},
};

const SEARCH_PROVIDERS = [
  "google", "duckduckgo", "bing", "baidu", "brave", "startpage",
  "ecosia", "kagi", "yahoo", "yandex",
];

function ResourcesWidget({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {(["cpu", "memory", "cputemp", "uptime"] as const).map((key) => (
        <label
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontSize: 13,
            color: "#8b949e",
          }}
        >
          <input
            type="checkbox"
            checked={!!data[key]}
            onChange={(e) => onChange({ ...data, [key]: e.target.checked || undefined })}
            style={{ accentColor: "#388bfd" }}
          />
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </label>
      ))}
      <div>
        <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
          Disk path
        </label>
        <input
          type="text"
          value={(data.disk as string) || ""}
          onChange={(e) => onChange({ ...data, disk: e.target.value || undefined })}
          placeholder="/"
          style={{ width: "100%", height: 32 }}
        />
      </div>
    </div>
  );
}

function SearchWidget({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
          Provider
        </label>
        <select
          value={(data.provider as string) || "google"}
          onChange={(e) => onChange({ ...data, provider: e.target.value })}
          style={{ width: "100%", height: 32 }}
        >
          {SEARCH_PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
          <option value="custom">custom</option>
        </select>
      </div>
      {data.provider === "custom" && (
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            Custom URL
          </label>
          <input
            type="text"
            value={(data.url as string) || ""}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://search.example.com?q="
            style={{ width: "100%", height: 32 }}
          />
        </div>
      )}
      <div>
        <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
          Open in
        </label>
        <select
          value={(data.target as string) || "_blank"}
          onChange={(e) => onChange({ ...data, target: e.target.value })}
          style={{ width: "100%", height: 32 }}
        >
          <option value="_blank">New tab</option>
          <option value="_self">Same tab</option>
        </select>
      </div>
    </div>
  );
}

function OpenWeatherWidget({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
          Label
        </label>
        <input
          type="text"
          value={(data.label as string) || ""}
          onChange={(e) => onChange({ ...data, label: e.target.value })}
          placeholder="My City"
          style={{ width: "100%", height: 32 }}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            Latitude
          </label>
          <input
            type="number"
            step="0.001"
            value={(data.latitude as number) || 0}
            onChange={(e) => onChange({ ...data, latitude: parseFloat(e.target.value) })}
            style={{ width: "100%", height: 32 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            Longitude
          </label>
          <input
            type="number"
            step="0.001"
            value={(data.longitude as number) || 0}
            onChange={(e) => onChange({ ...data, longitude: parseFloat(e.target.value) })}
            style={{ width: "100%", height: 32 }}
          />
        </div>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
          Units
        </label>
        <select
          value={(data.units as string) || "metric"}
          onChange={(e) => onChange({ ...data, units: e.target.value })}
          style={{ width: "100%", height: 32 }}
        >
          <option value="metric">Metric (°C)</option>
          <option value="imperial">Imperial (°F)</option>
        </select>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
          API Key
        </label>
        <input
          type="text"
          value={(data.apiKey as string) || ""}
          onChange={(e) => onChange({ ...data, apiKey: e.target.value })}
          placeholder="OpenWeatherMap API key"
          style={{ width: "100%", height: 32 }}
        />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
          Cache (minutes)
        </label>
        <input
          type="number"
          value={(data.cache as number) || 5}
          onChange={(e) => onChange({ ...data, cache: parseInt(e.target.value) })}
          style={{ width: "100%", height: 32 }}
        />
      </div>
    </div>
  );
}

function GenericWidget({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  const [json, setJson] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState("");

  function handleBlur() {
    try {
      const parsed = JSON.parse(json);
      onChange(parsed);
      setError("");
    } catch {
      setError("Invalid JSON");
    }
  }

  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
        Widget config (JSON)
      </label>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        onBlur={handleBlur}
        rows={8}
        style={{
          width: "100%",
          backgroundColor: "#0d1117",
          border: `1px solid ${error ? "#f85149" : "#30363d"}`,
          borderRadius: 6,
          color: "#e6edf3",
          padding: "8px 10px",
          fontSize: 12,
          fontFamily: "monospace",
          resize: "vertical",
        }}
      />
      {error && <div style={{ fontSize: 12, color: "#f85149", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function detectType(widget: Record<string, unknown>): WidgetType {
  const keys = Object.keys(widget);
  if ("cpu" in widget || "memory" in widget || "disk" in widget) return "resources";
  if ("provider" in widget && keys.length <= 3) return "search";
  if ("latitude" in widget || "longitude" in widget) return "openweathermap";
  if ("greeting" in widget || widget.type === "greeting") return "greeting";
  if ("datetime" in widget || widget.type === "datetime") return "datetime";
  return "custom";
}

function getWidgetType(widget: Record<string, unknown>): string {
  if ("cpu" in widget || "memory" in widget || "disk" in widget) return "resources";
  if ("provider" in widget && !("latitude" in widget)) return "search";
  if ("latitude" in widget || "longitude" in widget) return "openweathermap";
  return (widget.type as string) || "custom";
}

export default function WidgetsClient({ initialWidgets, loadError }: Props) {
  const [widgets, setWidgets] = useState<Record<string, unknown>[]>(initialWidgets);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<WidgetType>("resources");

  function updateWidget(idx: number, data: Record<string, unknown>) {
    setWidgets((prev) => prev.map((w, i) => (i === idx ? data : w)));
    setHasChanges(true);
  }

  function deleteWidget(idx: number) {
    if (!confirm("Delete this widget?")) return;
    setWidgets((prev) => prev.filter((_, i) => i !== idx));
    setHasChanges(true);
  }

  function addWidget() {
    setWidgets((prev) => [...prev, { ...WIDGET_TEMPLATES[addType] }]);
    setShowAdd(false);
    setHasChanges(true);
  }

  const handleSave = useCallback(async () => {
    const res = await fetch("/api/config/widgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: widgets }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Save failed");
    }
    setHasChanges(false);
  }, [widgets]);

  const WIDGET_LABELS: Record<string, string> = {
    resources: "System Resources",
    search: "Search Bar",
    openweathermap: "OpenWeatherMap",
    greeting: "Greeting",
    datetime: "Date & Time",
    custom: "Custom Widget",
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div
        style={{
          padding: "24px 32px 16px",
          borderBottom: "1px solid #30363d",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e6edf3", margin: 0 }}>
            Widgets
          </h1>
          <p style={{ color: "#8b949e", marginTop: 4, fontSize: 13 }}>
            {widgets.length} info widget{widgets.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 6,
            border: "1px solid #30363d",
            backgroundColor: "#21262d",
            color: "#e6edf3",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Plus size={14} /> Add Widget
        </button>
      </div>

      <div style={{ padding: "20px 32px" }}>
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

        {showAdd && (
          <div
            style={{
              backgroundColor: "#161b22",
              border: "1px solid #388bfd",
              borderRadius: 10,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3", margin: "0 0 12px" }}>
              Add Widget
            </h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {(Object.keys(WIDGET_TEMPLATES) as WidgetType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setAddType(t)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: `1px solid ${addType === t ? "#388bfd" : "#30363d"}`,
                    backgroundColor: addType === t ? "#162032" : "transparent",
                    color: addType === t ? "#58a6ff" : "#8b949e",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {WIDGET_LABELS[t] || t}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={addWidget}
                style={{
                  padding: "7px 16px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#238636",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Add {WIDGET_LABELS[addType]}
              </button>
              <button
                onClick={() => setShowAdd(false)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 6,
                  border: "1px solid #30363d",
                  backgroundColor: "transparent",
                  color: "#8b949e",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {widgets.map((widget, idx) => {
            const type = detectType(widget);
            const typeLabel = WIDGET_LABELS[getWidgetType(widget)] || getWidgetType(widget);
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom: "1px solid #30363d",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3" }}>
                    {typeLabel}
                  </div>
                  <button
                    onClick={() => deleteWidget(idx)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid #30363d",
                      backgroundColor: "transparent",
                      color: "#f85149",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ padding: 16 }}>
                  {type === "resources" && (
                    <ResourcesWidget
                      data={widget}
                      onChange={(d) => updateWidget(idx, d)}
                    />
                  )}
                  {type === "search" && (
                    <SearchWidget data={widget} onChange={(d) => updateWidget(idx, d)} />
                  )}
                  {type === "openweathermap" && (
                    <OpenWeatherWidget
                      data={widget}
                      onChange={(d) => updateWidget(idx, d)}
                    />
                  )}
                  {(type === "greeting" || type === "datetime" || type === "custom") && (
                    <GenericWidget data={widget} onChange={(d) => updateWidget(idx, d)} />
                  )}
                </div>
              </div>
            );
          })}

          {widgets.length === 0 && !loadError && (
            <div style={{ textAlign: "center", padding: 60, color: "#6e7681" }}>
              <p>No widgets configured.</p>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #30363d",
                  backgroundColor: "#21262d",
                  color: "#e6edf3",
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                Add your first widget
              </button>
            </div>
          )}
        </div>
      </div>

      <SaveBar onSave={handleSave} hasChanges={hasChanges} />
    </div>
  );
}
