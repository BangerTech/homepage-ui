"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Server, Bookmark, Puzzle,
  Settings, Code2, ExternalLink, Sparkles, Home,
} from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/",          label: "Dashboard",      icon: LayoutDashboard, color: "#3b82f6" },
  { href: "/services",  label: "Services",        icon: Server,          color: "#8b5cf6" },
  { href: "/bookmarks", label: "Bookmarks",       icon: Bookmark,        color: "#f59e0b" },
  { href: "/widgets",   label: "Widgets",         icon: Puzzle,          color: "#10b981" },
  { href: "/settings",  label: "Settings",        icon: Settings,        color: "#6366f1" },
  { href: "/custom",    label: "Custom CSS / JS", icon: Code2,           color: "#ec4899" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [homepageUrl, setHomepageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/app-settings")
      .then((r) => r.json())
      .then((d) => { if (d.homepageUrl) setHomepageUrl(d.homepageUrl); })
      .catch(() => {});
  }, []);

  return (
    <aside style={{
      width: 230,
      minWidth: 230,
      background: "linear-gradient(180deg, #0d1117 0%, #070b11 100%)",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* ambient glow top */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 200,
        background: "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(59,130,246,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{ padding: "22px 16px 18px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: "bold",
            color: "#fff",
            flexShrink: 0,
            boxShadow: "0 4px 16px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}>
            H
          </div>
          <div>
            <div style={{
              fontWeight: 700,
              fontSize: 15,
              background: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Homepage UI
            </div>
            <div style={{ fontSize: 11, color: "#4a5568", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
              <Sparkles size={9} style={{ color: "#3b82f6" }} />
              Config Editor
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)", margin: "0 16px" }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 9,
                marginBottom: 3,
                textDecoration: "none",
                color: active ? "#e2e8f0" : "#7d8fa3",
                background: active
                  ? `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`
                  : "transparent",
                border: `1px solid ${active ? color + "33" : "transparent"}`,
                fontWeight: active ? 600 : 400,
                fontSize: 13.5,
                transition: "all 0.18s ease",
                position: "relative",
                boxShadow: active ? `0 2px 12px ${color}22, inset 0 1px 0 ${color}22` : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.04)";
                  el.style.color = "#e2e8f0";
                  el.style.border = "1px solid rgba(255,255,255,0.07)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "transparent";
                  el.style.color = "#7d8fa3";
                  el.style.border = "1px solid transparent";
                }
              }}
            >
              {/* active indicator */}
              {active && (
                <div style={{
                  position: "absolute",
                  left: 0, top: "50%",
                  transform: "translateY(-50%)",
                  width: 3, height: 18,
                  borderRadius: "0 3px 3px 0",
                  background: `linear-gradient(180deg, ${color}, ${color}88)`,
                  boxShadow: `0 0 8px ${color}88`,
                }} />
              )}
              <div style={{
                width: 28, height: 28,
                borderRadius: 7,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? `${color}22` : "transparent",
                flexShrink: 0,
                transition: "background 0.18s",
              }}>
                <Icon size={15} color={active ? color : "currentColor"} />
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)", margin: "0 16px" }} />

      {/* Footer */}
      <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
        {homepageUrl && (
          <a
            href={homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 9,
              textDecoration: "none", fontSize: 13.5, fontWeight: 600,
              color: "#34d399",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(16,185,129,0.15)";
              el.style.borderColor = "rgba(16,185,129,0.35)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(16,185,129,0.08)";
              el.style.borderColor = "rgba(16,185,129,0.2)";
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Home size={14} color="#34d399" />
            </div>
            Open Homepage
            <ExternalLink size={11} style={{ marginLeft: "auto", opacity: 0.6 }} />
          </a>
        )}
        <a
          href="https://gethomepage.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px",
            fontSize: 12, color: "#4a5568", textDecoration: "none", transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#7d8fa3"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#4a5568"; }}
        >
          <ExternalLink size={11} />
          gethomepage.dev
        </a>
      </div>
    </aside>
  );
}
