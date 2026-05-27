"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import SaveBar from "@/components/SaveBar";
import type { BookmarkGroup, Bookmark } from "@/types";

interface Props {
  initialGroups: BookmarkGroup[];
  loadError: string;
}

function serializeGroups(groups: BookmarkGroup[]): unknown[] {
  return groups.map((g) => ({
    [g.name]: g.bookmarks.map((b) => {
      const { name, ...rest } = b;
      return { [name]: [rest] };
    }),
  }));
}

const EMPTY_BOOKMARK: Bookmark = { name: "", href: "", abbr: "", icon: "" };

function BookmarkForm({
  bookmark,
  onSave,
  onCancel,
}: {
  bookmark: Bookmark;
  onSave: (b: Bookmark) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Bookmark>({ ...EMPTY_BOOKMARK, ...bookmark });

  function handleSave() {
    if (!form.name.trim() || !form.href.trim()) return;
    const b = { ...form };
    if (!b.abbr) delete b.abbr;
    if (!b.icon) delete b.icon;
    onSave(b);
  }

  const inputStyle = {
    width: "100%",
    height: 32,
    backgroundColor: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: 6,
    color: "#e6edf3",
    padding: "0 10px",
    fontSize: 13,
  };

  return (
    <div
      style={{
        backgroundColor: "#0d1117",
        border: "1px solid #388bfd",
        borderRadius: 8,
        padding: 14,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            Name *
          </label>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="GitHub"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            URL (href) *
          </label>
          <input
            style={inputStyle}
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
            placeholder="https://github.com"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            Abbreviation
          </label>
          <input
            style={inputStyle}
            value={form.abbr || ""}
            onChange={(e) => setForm({ ...form, abbr: e.target.value })}
            placeholder="GH"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            Icon
          </label>
          <input
            style={inputStyle}
            value={form.icon || ""}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="github.png"
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 12px",
            borderRadius: 6,
            border: "1px solid #30363d",
            backgroundColor: "transparent",
            color: "#8b949e",
            fontSize: 13,
          }}
        >
          <X size={13} /> Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!form.name.trim() || !form.href.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 12px",
            borderRadius: 6,
            border: "none",
            backgroundColor:
              form.name.trim() && form.href.trim() ? "#238636" : "#21262d",
            color: form.name.trim() && form.href.trim() ? "#fff" : "#6e7681",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Check size={13} /> Save
        </button>
      </div>
    </div>
  );
}

export default function BookmarksClient({ initialGroups, loadError }: Props) {
  const [groups, setGroups] = useState<BookmarkGroup[]>(initialGroups);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(initialGroups.map((g) => g.name))
  );
  const [editing, setEditing] = useState<{ gIdx: number; bIdx: number | null } | null>(null);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  function toggleGroup(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function addGroup() {
    if (!newGroupName.trim()) return;
    setGroups((prev) => [...prev, { name: newGroupName.trim(), bookmarks: [] }]);
    setExpanded((prev) => new Set([...prev, newGroupName.trim()]));
    setNewGroupName("");
    setAddingGroup(false);
    setHasChanges(true);
  }

  function deleteGroup(idx: number) {
    if (!confirm(`Delete group "${groups[idx].name}"?`)) return;
    setGroups((prev) => prev.filter((_, i) => i !== idx));
    setHasChanges(true);
  }

  function saveBookmark(bookmark: Bookmark) {
    if (!editing) return;
    const { gIdx, bIdx } = editing;
    setGroups((prev) =>
      prev.map((g, gi) => {
        if (gi !== gIdx) return g;
        const bookmarks = [...g.bookmarks];
        if (bIdx === null) bookmarks.push(bookmark);
        else bookmarks[bIdx] = bookmark;
        return { ...g, bookmarks };
      })
    );
    setEditing(null);
    setHasChanges(true);
  }

  function deleteBookmark(gIdx: number, bIdx: number) {
    if (!confirm(`Delete "${groups[gIdx].bookmarks[bIdx].name}"?`)) return;
    setGroups((prev) =>
      prev.map((g, gi) =>
        gi === gIdx ? { ...g, bookmarks: g.bookmarks.filter((_, i) => i !== bIdx) } : g
      )
    );
    setHasChanges(true);
  }

  const handleSave = useCallback(async () => {
    const data = serializeGroups(groups);
    const res = await fetch("/api/config/bookmarks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Save failed");
    }
    setHasChanges(false);
  }, [groups]);

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
            Bookmarks
          </h1>
          <p style={{ color: "#8b949e", marginTop: 4, fontSize: 13 }}>
            {groups.reduce((a, g) => a + g.bookmarks.length, 0)} bookmarks across {groups.length}{" "}
            groups
          </p>
        </div>
        <button
          onClick={() => setAddingGroup(true)}
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
          <Plus size={14} /> Add Group
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

        {addingGroup && (
          <div
            style={{
              backgroundColor: "#161b22",
              border: "1px solid #388bfd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
              display: "flex",
              gap: 8,
            }}
          >
            <input
              autoFocus
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addGroup();
                if (e.key === "Escape") setAddingGroup(false);
              }}
              placeholder="Group name"
              style={{ flex: 1, height: 32 }}
            />
            <button
              onClick={addGroup}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#238636",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Add
            </button>
            <button
              onClick={() => setAddingGroup(false)}
              style={{
                padding: "5px 12px",
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
        )}

        {groups.map((group, gIdx) => {
          const isExpanded = expanded.has(group.name);
          return (
            <div
              key={gIdx}
              style={{
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                borderRadius: 10,
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  cursor: "pointer",
                  userSelect: "none",
                  borderBottom: isExpanded ? "1px solid #30363d" : "none",
                }}
                onClick={() => toggleGroup(group.name)}
              >
                <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 8 }}>
                  {isExpanded ? (
                    <ChevronDown size={16} color="#6e7681" />
                  ) : (
                    <ChevronRight size={16} color="#6e7681" />
                  )}
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3" }}>
                    {group.name}
                  </span>
                  <span
                    style={{
                      backgroundColor: "#21262d",
                      color: "#8b949e",
                      fontSize: 11,
                      padding: "2px 7px",
                      borderRadius: 10,
                    }}
                  >
                    {group.bookmarks.length}
                  </span>
                </div>
                <div
                  style={{ display: "flex", gap: 4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setEditing({ gIdx, bIdx: null })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid #30363d",
                      backgroundColor: "transparent",
                      color: "#8b949e",
                      fontSize: 12,
                    }}
                  >
                    <Plus size={12} /> Add
                  </button>
                  <button
                    onClick={() => deleteGroup(gIdx)}
                    style={{
                      padding: "4px 7px",
                      borderRadius: 6,
                      border: "1px solid #30363d",
                      backgroundColor: "transparent",
                      color: "#f85149",
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: "8px 16px" }}>
                  {editing?.gIdx === gIdx && editing.bIdx === null && (
                    <BookmarkForm
                      bookmark={EMPTY_BOOKMARK}
                      onSave={saveBookmark}
                      onCancel={() => setEditing(null)}
                    />
                  )}

                  {group.bookmarks.map((bm, bIdx) => (
                    <div key={bIdx}>
                      {editing?.gIdx === gIdx && editing.bIdx === bIdx ? (
                        <BookmarkForm
                          bookmark={bm}
                          onSave={saveBookmark}
                          onCancel={() => setEditing(null)}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 6,
                            marginBottom: 4,
                            backgroundColor: "#1c2128",
                          }}
                        >
                          {bm.abbr && (
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                backgroundColor: "#21262d",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#8b949e",
                                flexShrink: 0,
                              }}
                            >
                              {bm.abbr}
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>
                              {bm.name}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#6e7681",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {bm.href}
                            </div>
                          </div>
                          {bm.icon && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "#6e7681",
                                backgroundColor: "#1c2128",
                                padding: "2px 6px",
                                borderRadius: 4,
                                border: "1px solid #30363d",
                              }}
                            >
                              {bm.icon}
                            </span>
                          )}
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            <button
                              onClick={() => setEditing({ gIdx, bIdx })}
                              style={{
                                padding: "3px 7px",
                                borderRadius: 5,
                                border: "1px solid #30363d",
                                backgroundColor: "transparent",
                                color: "#8b949e",
                              }}
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => deleteBookmark(gIdx, bIdx)}
                              style={{
                                padding: "3px 7px",
                                borderRadius: 5,
                                border: "1px solid #30363d",
                                backgroundColor: "transparent",
                                color: "#f85149",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {group.bookmarks.length === 0 && !(editing?.gIdx === gIdx && editing.bIdx === null) && (
                    <div style={{ textAlign: "center", padding: 16, color: "#6e7681", fontSize: 13 }}>
                      No bookmarks.{" "}
                      <button
                        onClick={() => setEditing({ gIdx, bIdx: null })}
                        style={{ background: "none", border: "none", color: "#388bfd", cursor: "pointer", fontSize: 13, padding: 0 }}
                      >
                        Add one
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SaveBar onSave={handleSave} hasChanges={hasChanges} />
    </div>
  );
}
