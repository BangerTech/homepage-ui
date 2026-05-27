"use client";

import { useState, useCallback } from "react";
import SaveBar from "@/components/SaveBar";

interface Props {
  initialCss: string;
  initialJs: string;
  loadError: string;
}

type Tab = "css" | "js";

export default function CustomClient({ initialCss, initialJs, loadError }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("css");
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch("/api/config/custom-css", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: css }),
      }),
      fetch("/api/config/custom-js", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: js }),
      }),
    ]);
    if (!r1.ok || !r2.ok) throw new Error("Save failed");
    setHasChanges(false);
  }, [css, js]);

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: "24px 32px 16px", borderBottom: "1px solid #30363d" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e6edf3", margin: 0 }}>
          Custom CSS / JS
        </h1>
        <p style={{ color: "#8b949e", marginTop: 4, fontSize: 13 }}>
          Edit custom.css and custom.js injected into the homepage
        </p>
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

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 16,
            borderBottom: "1px solid #30363d",
          }}
        >
          {(["css", "js"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 20px",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab ? "#388bfd" : "transparent"}`,
                backgroundColor: "transparent",
                color: activeTab === tab ? "#e6edf3" : "#8b949e",
                fontSize: 14,
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              custom.{tab}
            </button>
          ))}
        </div>

        {/* Info box */}
        <div
          style={{
            backgroundColor: "#162032",
            border: "1px solid #1f3a5f",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 16,
            fontSize: 13,
            color: "#79c0ff",
          }}
        >
          {activeTab === "css" ? (
            <>
              Styles are injected into <code style={{ backgroundColor: "#0d1117", padding: "1px 5px", borderRadius: 3 }}>{"<head>"}</code>{" "}
              on every page. Use standard CSS. Supports Tailwind{"/"}gradient classes.
            </>
          ) : (
            <>
              Scripts are injected before <code style={{ backgroundColor: "#0d1117", padding: "1px 5px", borderRadius: 3 }}>{"</body>"}</code>{" "}
              on every page.
            </>
          )}
        </div>

        {/* Editor */}
        {activeTab === "css" && (
          <textarea
            value={css}
            onChange={(e) => { setCss(e.target.value); setHasChanges(true); }}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 480,
              backgroundColor: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: 8,
              color: "#e6edf3",
              padding: "14px 16px",
              fontSize: 13,
              fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
            }}
            placeholder="/* Your custom CSS here */&#10;&#10;#col-big {&#10;  grid-column: span 21;&#10;}"
          />
        )}
        {activeTab === "js" && (
          <textarea
            value={js}
            onChange={(e) => { setJs(e.target.value); setHasChanges(true); }}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 480,
              backgroundColor: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: 8,
              color: "#e6edf3",
              padding: "14px 16px",
              fontSize: 13,
              fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
            }}
            placeholder="// Your custom JavaScript here"
          />
        )}
      </div>

      <SaveBar onSave={handleSave} hasChanges={hasChanges} />
    </div>
  );
}
