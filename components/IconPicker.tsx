"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Image as ImageIcon } from "lucide-react";

const POPULAR_ICONS = [
  "sonarr","radarr","lidarr","readarr","prowlarr","bazarr","overseerr","jellyfin",
  "plex","emby","jellyseerr","tautulli","portainer","traefik","nginx","caddy",
  "nextcloud","vaultwarden","bitwarden","adguard","pihole","unifi","grafana",
  "prometheus","uptime-kuma","heimdall","dasherr","gitea","gitlab","github",
  "qbittorrent","transmission","deluge","nzbget","sabnzbd","jackett","prowlarr",
  "syncthing","filebrowser","immich","photoprism","paperless","freshrss","miniflux",
  "ntfy","gotify","mealie","tandoor","home-assistant","node-red","mosquitto",
  "wireguard","tailscale","cloudflare","docker","kubernetes","proxmox","truenas",
];

const CDN = (name: string) =>
  `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@main/png/${name}.png`;

interface Props {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
}

export default function IconPicker({ value, onChange, onClose }: Props) {
  const [query, setQuery]   = useState("");
  const [custom, setCustom] = useState(value || "");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = query.trim()
    ? POPULAR_ICONS.filter((n) => n.includes(query.toLowerCase()))
    : POPULAR_ICONS;

  function pick(name: string) {
    onChange(name + ".png");
    onClose();
  }

  function applyCustom() {
    onChange(custom.trim());
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass-card animate-slide-in"
        style={{ width: 580, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>Pick an Icon</div>
            <div style={{ fontSize: 12, color: "#4a5568", marginTop: 2 }}>from dashboard-icons · walkxcode</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#7d8fa3" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#4a5568", pointerEvents: "none" }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons..."
              style={{ width: "100%", paddingLeft: 32 }}
            />
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#4a5568", padding: "24px 0" }}>No icons found for &ldquo;{query}&rdquo;</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: 8 }}>
              {filtered.map((name) => {
                const isSelected = value === name + ".png";
                return (
                  <button
                    key={name}
                    onClick={() => pick(name)}
                    title={name}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 6px 8px",
                      borderRadius: 10,
                      border: `1px solid ${isSelected ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.05)"}`,
                      background: isSelected ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                      }
                    }}
                  >
                    {errors[name] ? (
                      <ImageIcon size={28} style={{ color: "#4a5568" }} />
                    ) : (
                      <img
                        src={CDN(name)}
                        alt={name}
                        width={32}
                        height={32}
                        style={{ width: 32, height: 32, objectFit: "contain" }}
                        onError={() => setErrors((p) => ({ ...p, [name]: true }))}
                      />
                    )}
                    <span style={{ fontSize: 10, color: "#7d8fa3", textAlign: "center", wordBreak: "break-all", lineHeight: 1.3 }}>
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom input */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 12, color: "#4a5568", marginBottom: 6 }}>
            Or enter a custom icon name / URL
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {custom && !custom.startsWith("http") && (
              <img
                src={CDN(custom.replace(".png", ""))}
                alt=""
                width={32} height={32}
                style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 6, flexShrink: 0 }}
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
              />
            )}
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="sonarr.png or https://..."
              style={{ flex: 1 }}
              onKeyDown={(e) => { if (e.key === "Enter") applyCustom(); }}
            />
            <button
              onClick={applyCustom}
              style={{
                padding: "0 16px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
