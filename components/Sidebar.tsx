"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Bookmark,
  Puzzle,
  Settings,
  Code2,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/services", label: "Services", icon: Server },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/widgets", label: "Widgets", icon: Puzzle },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/custom", label: "Custom CSS / JS", icon: Code2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        backgroundColor: "#161b22",
        borderRight: "1px solid #30363d",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid #30363d",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #388bfd, #58a6ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: "bold",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            H
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#e6edf3", fontSize: 15 }}>
              Homepage UI
            </div>
            <div style={{ fontSize: 11, color: "#6e7681" }}>Config Editor</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 6,
                marginBottom: 2,
                textDecoration: "none",
                color: active ? "#e6edf3" : "#8b949e",
                backgroundColor: active ? "#21262d" : "transparent",
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                transition: "background-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#1c2128";
                  (e.currentTarget as HTMLElement).style.color = "#e6edf3";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#8b949e";
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #30363d",
        }}
      >
        <a
          href="https://gethomepage.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "#6e7681",
            textDecoration: "none",
          }}
        >
          <ExternalLink size={12} />
          gethomepage.dev
        </a>
      </div>
    </aside>
  );
}
