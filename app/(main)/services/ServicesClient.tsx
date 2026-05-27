"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, X, Check, GripVertical } from "lucide-react";
import SaveBar from "@/components/SaveBar";
import type { ServiceGroup, Service } from "@/types";

interface Props {
  initialGroups: ServiceGroup[];
  loadError: string;
}

function serializeGroups(groups: ServiceGroup[]): unknown[] {
  return groups.map((g) => ({
    [g.name]: g.services.map((s) => {
      const { name, ...rest } = s;
      return { [name]: rest };
    }),
  }));
}

const EMPTY_SERVICE: Service = {
  name: "",
  icon: "",
  href: "",
  description: "",
  id: "",
};

function ServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: Service;
  onSave: (s: Service) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Service>({ ...EMPTY_SERVICE, ...service });
  const [showWidget, setShowWidget] = useState(!!service.widget);
  const [widgetJson, setWidgetJson] = useState(
    service.widget ? JSON.stringify(service.widget, null, 2) : ""
  );
  const [widgetError, setWidgetError] = useState("");

  function handleSave() {
    if (!form.name.trim()) return;
    const s = { ...form };
    // Clean empty fields
    Object.keys(s).forEach((k) => {
      const key = k as keyof Service;
      if (s[key] === "" || s[key] === undefined) delete s[key];
    });
    if (showWidget && widgetJson.trim()) {
      try {
        s.widget = JSON.parse(widgetJson);
        setWidgetError("");
      } catch {
        setWidgetError("Invalid JSON for widget");
        return;
      }
    } else {
      delete s.widget;
    }
    onSave(s);
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
        padding: 16,
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
            placeholder="My Service"
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
            placeholder="service.png"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            URL (href)
          </label>
          <input
            style={inputStyle}
            value={form.href || ""}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
            placeholder="http://192.168.1.100:8080"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            Description
          </label>
          <input
            style={inputStyle}
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            ID (CSS column size)
          </label>
          <input
            style={inputStyle}
            value={form.id || ""}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            placeholder="col-big, col-small..."
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            Server (Docker)
          </label>
          <input
            style={inputStyle}
            value={form.server || ""}
            onChange={(e) => setForm({ ...form, server: e.target.value })}
            placeholder="my-docker"
          />
        </div>
      </div>

      {/* Widget toggle */}
      <div style={{ marginBottom: 10 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontSize: 13,
            color: "#8b949e",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={showWidget}
            onChange={(e) => setShowWidget(e.target.checked)}
            style={{ accentColor: "#388bfd" }}
          />
          Has widget integration
        </label>
      </div>

      {showWidget && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontSize: 12, color: "#6e7681", marginBottom: 4 }}>
            Widget (JSON)
          </label>
          <textarea
            value={widgetJson}
            onChange={(e) => setWidgetJson(e.target.value)}
            rows={5}
            style={{
              width: "100%",
              backgroundColor: "#0d1117",
              border: `1px solid ${widgetError ? "#f85149" : "#30363d"}`,
              borderRadius: 6,
              color: "#e6edf3",
              padding: "8px 10px",
              fontSize: 12,
              fontFamily: "monospace",
              resize: "vertical",
            }}
            placeholder={'{\n  "type": "pihole",\n  "url": "http://...",\n  "key": "..."\n}'}
          />
          {widgetError && (
            <div style={{ fontSize: 12, color: "#f85149", marginTop: 4 }}>{widgetError}</div>
          )}
        </div>
      )}

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
          disabled={!form.name.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 12px",
            borderRadius: 6,
            border: "none",
            backgroundColor: form.name.trim() ? "#238636" : "#21262d",
            color: form.name.trim() ? "#fff" : "#6e7681",
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

export default function ServicesClient({ initialGroups, loadError }: Props) {
  const [groups, setGroups] = useState<ServiceGroup[]>(initialGroups);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(initialGroups.map((g) => g.name))
  );
  const [editingService, setEditingService] = useState<{
    groupIdx: number;
    serviceIdx: number | null;
  } | null>(null);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  function toggleGroup(name: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function addGroup() {
    if (!newGroupName.trim()) return;
    setGroups((prev) => [...prev, { name: newGroupName.trim(), services: [] }]);
    setExpandedGroups((prev) => new Set([...prev, newGroupName.trim()]));
    setNewGroupName("");
    setAddingGroup(false);
    setHasChanges(true);
  }

  function deleteGroup(idx: number) {
    if (!confirm(`Delete group "${groups[idx].name}" and all its services?`)) return;
    setGroups((prev) => prev.filter((_, i) => i !== idx));
    setHasChanges(true);
  }

  function addService(groupIdx: number) {
    setEditingService({ groupIdx, serviceIdx: null });
  }

  function editService(groupIdx: number, serviceIdx: number) {
    setEditingService({ groupIdx, serviceIdx });
  }

  function deleteService(groupIdx: number, serviceIdx: number) {
    const svcName = groups[groupIdx].services[serviceIdx].name;
    if (!confirm(`Delete service "${svcName}"?`)) return;
    setGroups((prev) =>
      prev.map((g, gi) =>
        gi === groupIdx
          ? { ...g, services: g.services.filter((_, si) => si !== serviceIdx) }
          : g
      )
    );
    setHasChanges(true);
  }

  function saveService(service: Service) {
    if (!editingService) return;
    const { groupIdx, serviceIdx } = editingService;
    setGroups((prev) =>
      prev.map((g, gi) => {
        if (gi !== groupIdx) return g;
        const services = [...g.services];
        if (serviceIdx === null) {
          services.push(service);
        } else {
          services[serviceIdx] = service;
        }
        return { ...g, services };
      })
    );
    setEditingService(null);
    setHasChanges(true);
  }

  function startRename(idx: number) {
    setRenamingGroup(idx);
    setRenameValue(groups[idx].name);
  }

  function commitRename(idx: number) {
    if (!renameValue.trim()) return;
    const oldName = groups[idx].name;
    setGroups((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, name: renameValue.trim() } : g))
    );
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(oldName)) {
        next.delete(oldName);
        next.add(renameValue.trim());
      }
      return next;
    });
    setRenamingGroup(null);
    setHasChanges(true);
  }

  const handleSave = useCallback(async () => {
    const data = serializeGroups(groups);
    const res = await fetch("/api/config/services", {
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
      {/* Page header */}
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
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e6edf3", margin: 0 }}>Services</h1>
          <p style={{ color: "#8b949e", marginTop: 4, fontSize: 13 }}>
            {groups.reduce((a, g) => a + g.services.length, 0)} services across {groups.length} groups
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

        {/* Add group form */}
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
              alignItems: "center",
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
              placeholder="Group name (e.g. SmartHome)"
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
              onClick={() => {
                setAddingGroup(false);
                setNewGroupName("");
              }}
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

        {groups.map((group, groupIdx) => {
          const expanded = expandedGroups.has(group.name);
          return (
            <div
              key={groupIdx}
              style={{
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                borderRadius: 10,
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              {/* Group header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  cursor: "pointer",
                  userSelect: "none",
                  borderBottom: expanded ? "1px solid #30363d" : "none",
                }}
                onClick={() => toggleGroup(group.name)}
              >
                <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 8 }}>
                  {expanded ? (
                    <ChevronDown size={16} color="#6e7681" />
                  ) : (
                    <ChevronRight size={16} color="#6e7681" />
                  )}
                  {renamingGroup === groupIdx ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(groupIdx);
                        if (e.key === "Escape") setRenamingGroup(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ height: 28, fontSize: 14, fontWeight: 600 }}
                    />
                  ) : (
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3" }}>
                      {group.name}
                    </span>
                  )}
                  <span
                    style={{
                      backgroundColor: "#21262d",
                      color: "#8b949e",
                      fontSize: 11,
                      padding: "2px 7px",
                      borderRadius: 10,
                    }}
                  >
                    {group.services.length}
                  </span>
                </div>
                <div
                  style={{ display: "flex", gap: 4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => addService(groupIdx)}
                    title="Add service"
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
                    onClick={() => startRename(groupIdx)}
                    title="Rename group"
                    style={{
                      padding: "4px 7px",
                      borderRadius: 6,
                      border: "1px solid #30363d",
                      backgroundColor: "transparent",
                      color: "#8b949e",
                    }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteGroup(groupIdx)}
                    title="Delete group"
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

              {/* Services list */}
              {expanded && (
                <div style={{ padding: "8px 16px" }}>
                  {/* Add service form */}
                  {editingService?.groupIdx === groupIdx &&
                    editingService.serviceIdx === null && (
                      <ServiceForm
                        service={EMPTY_SERVICE}
                        onSave={saveService}
                        onCancel={() => setEditingService(null)}
                      />
                    )}

                  {group.services.map((service, serviceIdx) => (
                    <div key={serviceIdx}>
                      {editingService?.groupIdx === groupIdx &&
                      editingService.serviceIdx === serviceIdx ? (
                        <ServiceForm
                          service={service}
                          onSave={saveService}
                          onCancel={() => setEditingService(null)}
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
                            border: "1px solid transparent",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.borderColor = "#30363d")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.borderColor = "transparent")
                          }
                        >
                          <GripVertical
                            size={14}
                            color="#6e7681"
                            style={{ flexShrink: 0, cursor: "grab" }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#e6edf3",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {service.name}
                            </div>
                            {service.href && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#6e7681",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {service.href}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            {service.widget && (
                              <span
                                style={{
                                  fontSize: 11,
                                  backgroundColor: "#162032",
                                  color: "#58a6ff",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                }}
                              >
                                widget
                              </span>
                            )}
                            {service.icon && (
                              <span
                                style={{
                                  fontSize: 11,
                                  backgroundColor: "#1c2128",
                                  color: "#6e7681",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  border: "1px solid #30363d",
                                }}
                              >
                                {service.icon}
                              </span>
                            )}
                            <button
                              onClick={() => editService(groupIdx, serviceIdx)}
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
                              onClick={() => deleteService(groupIdx, serviceIdx)}
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

                  {group.services.length === 0 &&
                    !(editingService?.groupIdx === groupIdx && editingService.serviceIdx === null) && (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "#6e7681",
                          fontSize: 13,
                        }}
                      >
                        No services yet.{" "}
                        <button
                          onClick={() => addService(groupIdx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#388bfd",
                            cursor: "pointer",
                            fontSize: 13,
                            padding: 0,
                          }}
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

        {groups.length === 0 && !loadError && (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "#6e7681",
            }}
          >
            <p>No service groups found.</p>
            <button
              onClick={() => setAddingGroup(true)}
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
              Add your first group
            </button>
          </div>
        )}
      </div>

      <SaveBar onSave={handleSave} hasChanges={hasChanges} />
    </div>
  );
}
