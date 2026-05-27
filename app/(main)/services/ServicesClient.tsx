"use client";

import { useState, useCallback } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2,
  X, Check, GripVertical, Image as ImageIcon,
} from "lucide-react";
import SaveBar from "@/components/SaveBar";
import IconPicker from "@/components/IconPicker";
import type { ServiceGroup, Service } from "@/types";

interface Props { initialGroups: ServiceGroup[]; loadError: string; }

function serializeGroups(groups: ServiceGroup[]): unknown[] {
  return groups.map((g) => ({
    [g.name]: g.services.map((s) => {
      const { name, ...rest } = s;
      return { [name]: rest };
    }),
  }));
}

const EMPTY_SERVICE: Service = { name: "", icon: "", href: "", description: "", id: "" };
const CDN = (n: string) => `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@main/png/${n.replace(".png",""  )}.png`;

/* ── Service Form ── */
function ServiceForm({ service, onSave, onCancel }: { service: Service; onSave: (s: Service) => void; onCancel: () => void }) {
  const [form, setForm]           = useState<Service>({ ...EMPTY_SERVICE, ...service });
  const [showWidget, setShowWidget] = useState(!!service.widget);
  const [widgetJson, setWidgetJson] = useState(service.widget ? JSON.stringify(service.widget, null, 2) : "");
  const [widgetError, setWidgetError] = useState("");
  const [showPicker, setShowPicker]   = useState(false);

  function handleSave() {
    if (!form.name.trim()) return;
    const s = { ...form };
    (Object.keys(s) as Array<keyof Service>).forEach((k) => {
      if (s[k] === "" || s[k] === undefined) delete s[k];
    });
    if (showWidget && widgetJson.trim()) {
      try { s.widget = JSON.parse(widgetJson); setWidgetError(""); }
      catch { setWidgetError("Invalid JSON for widget"); return; }
    } else { delete s.widget; }
    onSave(s);
  }

  const iconName = form.icon?.replace(".png","") || "";
  const isUrl    = form.icon?.startsWith("http");

  return (
    <>
      {showPicker && (
        <IconPicker
          value={form.icon || ""}
          onChange={(v) => setForm({ ...form, icon: v })}
          onClose={() => setShowPicker(false)}
        />
      )}
      <div style={{
        background: "rgba(59,130,246,0.06)",
        border: "1px solid rgba(59,130,246,0.25)",
        borderRadius: 12, padding: 18, marginBottom: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#4a5568", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Service" style={{ width: "100%", height: 34 }} />
          </div>

          {/* Icon with picker */}
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#4a5568", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Icon</label>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {/* preview */}
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                {iconName && !isUrl ? (
                  <img src={CDN(iconName)} alt="" width={22} height={22} style={{ objectFit: "contain" }}
                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }} />
                ) : isUrl ? (
                  <img src={form.icon} alt="" width={22} height={22} style={{ objectFit: "contain" }}
                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }} />
                ) : <ImageIcon size={14} style={{ color: "#4a5568" }} />}
              </div>
              <input value={form.icon || ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="sonarr.png" style={{ flex: 1, height: 34 }} />
              <button onClick={() => setShowPicker(true)} title="Browse icons" style={{
                height: 34, padding: "0 10px", borderRadius: 8, flexShrink: 0,
                border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)",
                color: "#60a5fa", fontSize: 12, whiteSpace: "nowrap",
              }}>Browse</button>
            </div>
          </div>

          {/* URL */}
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#4a5568", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>URL</label>
            <input value={form.href || ""} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="http://192.168.1.100:8080" style={{ width: "100%", height: 34 }} />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#4a5568", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
            <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" style={{ width: "100%", height: 34 }} />
          </div>

          {/* Server */}
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#4a5568", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Server (Docker)</label>
            <input value={form.server || ""} onChange={(e) => setForm({ ...form, server: e.target.value })} placeholder="my-docker" style={{ width: "100%", height: 34 }} />
          </div>

          {/* ID */}
          <div>
            <label style={{ display: "block", fontSize: 11, color: "#4a5568", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>ID (CSS class)</label>
            <input value={form.id || ""} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="col-big" style={{ width: "100%", height: 34 }} />
          </div>
        </div>

        {/* Widget toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#7d8fa3", userSelect: "none", marginBottom: 10 }}>
          <input type="checkbox" checked={showWidget} onChange={(e) => setShowWidget(e.target.checked)} style={{ accentColor: "#3b82f6" }} />
          Has widget integration
        </label>

        {showWidget && (
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 11, color: "#4a5568", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Widget (JSON)</label>
            <textarea
              value={widgetJson}
              onChange={(e) => setWidgetJson(e.target.value)}
              rows={5}
              style={{
                width: "100%",
                border: `1px solid ${widgetError ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 8, padding: "8px 12px", fontSize: 12,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace", resize: "vertical",
              }}
              placeholder={'{\n  "type": "pihole",\n  "url": "http://...",\n  "key": "..."\n}'}
            />
            {widgetError && <div style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>{widgetError}</div>}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            display: "flex", alignItems: "center", gap: 4, padding: "6px 14px",
            borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent", color: "#7d8fa3", fontSize: 13,
          }}>
            <X size={13} /> Cancel
          </button>
          <button onClick={handleSave} disabled={!form.name.trim()} style={{
            display: "flex", alignItems: "center", gap: 4, padding: "6px 14px",
            borderRadius: 8, border: "none",
            background: form.name.trim() ? "linear-gradient(135deg, #065f46, #047857)" : "rgba(255,255,255,0.05)",
            color: form.name.trim() ? "#fff" : "#4a5568",
            fontSize: 13, fontWeight: 600,
            boxShadow: form.name.trim() ? "0 4px 12px rgba(5,150,105,0.3)" : "none",
          }}>
            <Check size={13} /> Save Service
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Sortable service row ── */
function SortableServiceRow({
  service, groupIdx, serviceIdx,
  onEdit, onDelete,
}: {
  service: Service; groupIdx: number; serviceIdx: number;
  onEdit: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${groupIdx}-${serviceIdx}-${service.name}`,
  });
  const iconName = service.icon?.replace(".png", "") || "";
  const isUrl    = service.icon?.startsWith("http");

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px", borderRadius: 9, marginBottom: 4,
        background: isDragging ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isDragging ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.04)"}`,
        cursor: "default",
      }}
      onMouseEnter={(e) => { if (!isDragging) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { if (!isDragging) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
    >
      <div {...attributes} {...listeners} style={{ cursor: "grab", flexShrink: 0, color: "#4a5568", touchAction: "none" }}>
        <GripVertical size={14} />
      </div>

      {/* icon preview */}
      <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        {iconName && !isUrl ? (
          <img src={`https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@main/png/${iconName}.png`} alt="" width={18} height={18} style={{ objectFit: "contain" }}
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }} />
        ) : isUrl ? (
          <img src={service.icon} alt="" width={18} height={18} style={{ objectFit: "contain" }}
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }} />
        ) : <ImageIcon size={12} style={{ color: "#4a5568" }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {service.name}
        </div>
        {service.href && (
          <div style={{ fontSize: 11, color: "#4a5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {service.href}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
        {service.widget && (
          <span style={{ fontSize: 10, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa", padding: "2px 7px", borderRadius: 5 }}>
            widget
          </span>
        )}
        <button onClick={onEdit} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#7d8fa3", transition: "all 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#e2e8f0"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#7d8fa3"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <Pencil size={12} />
        </button>
        <button onClick={onDelete} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", color: "#ef4444", opacity: 0.6, transition: "all 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.6"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ServicesClient({ initialGroups, loadError }: Props) {
  const [groups, setGroups]             = useState<ServiceGroup[]>(initialGroups);
  const [expandedGroups, setExpanded]   = useState<Set<string>>(new Set(initialGroups.map((g) => g.name)));
  const [editingService, setEditing]    = useState<{ groupIdx: number; serviceIdx: number | null } | null>(null);
  const [addingGroup, setAddingGroup]   = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [hasChanges, setHasChanges]     = useState(false);
  const [renamingGroup, setRenaming]    = useState<number | null>(null);
  const [renameValue, setRenameValue]   = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function toggleGroup(name: string) {
    setExpanded((prev) => { const s = new Set(prev); s.has(name) ? s.delete(name) : s.add(name); return s; });
  }

  function addGroup() {
    if (!newGroupName.trim()) return;
    setGroups((p) => [...p, { name: newGroupName.trim(), services: [] }]);
    setExpanded((p) => new Set([...p, newGroupName.trim()]));
    setNewGroupName(""); setAddingGroup(false); setHasChanges(true);
  }

  function deleteGroup(idx: number) {
    if (!confirm(`Delete group "${groups[idx].name}" and all its services?`)) return;
    setGroups((p) => p.filter((_, i) => i !== idx)); setHasChanges(true);
  }

  function saveService(service: Service) {
    if (!editingService) return;
    const { groupIdx, serviceIdx } = editingService;
    setGroups((p) => p.map((g, gi) => {
      if (gi !== groupIdx) return g;
      const svcs = [...g.services];
      serviceIdx === null ? svcs.push(service) : (svcs[serviceIdx] = service);
      return { ...g, services: svcs };
    }));
    setEditing(null); setHasChanges(true);
  }

  function deleteService(groupIdx: number, serviceIdx: number) {
    if (!confirm(`Delete service "${groups[groupIdx].services[serviceIdx].name}"?`)) return;
    setGroups((p) => p.map((g, gi) => gi === groupIdx ? { ...g, services: g.services.filter((_, si) => si !== serviceIdx) } : g));
    setHasChanges(true);
  }

  function commitRename(idx: number) {
    if (!renameValue.trim()) return;
    const old = groups[idx].name;
    setGroups((p) => p.map((g, i) => i === idx ? { ...g, name: renameValue.trim() } : g));
    setExpanded((p) => { const s = new Set(p); if (s.has(old)) { s.delete(old); s.add(renameValue.trim()); } return s; });
    setRenaming(null); setHasChanges(true);
  }

  function handleServiceDragEnd(event: DragEndEvent, groupIdx: number) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setGroups((p) => p.map((g, gi) => {
      if (gi !== groupIdx) return g;
      const ids  = g.services.map((_, si) => `${gi}-${si}-${g.services[si].name}`);
      const from = ids.indexOf(String(active.id));
      const to   = ids.indexOf(String(over.id));
      if (from === -1 || to === -1) return g;
      return { ...g, services: arrayMove(g.services, from, to) };
    }));
    setHasChanges(true);
  }

  const handleSave = useCallback(async () => {
    const res = await fetch("/api/config/services", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: serializeGroups(groups) }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed"); }
    setHasChanges(false);
  }, [groups]);

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        padding: "28px 36px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(180deg, rgba(59,130,246,0.04) 0%, transparent 100%)",
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #e2e8f0, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Services
          </h1>
          <p style={{ color: "#4a5568", marginTop: 4, fontSize: 13, margin: "4px 0 0" }}>
            {groups.reduce((a, g) => a + g.services.length, 0)} services across {groups.length} groups
          </p>
        </div>
        <button onClick={() => setAddingGroup(true)} className="btn-glow" style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(59,130,246,0.25)",
          background: "rgba(59,130,246,0.1)", color: "#60a5fa", fontSize: 13, fontWeight: 600,
        }}>
          <Plus size={14} /> Add Group
        </button>
      </div>

      <div style={{ padding: "24px 36px" }}>
        {loadError && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 16px", marginBottom: 20, color: "#f87171", fontSize: 13 }}>
            {loadError}
          </div>
        )}

        {/* Add group form */}
        {addingGroup && (
          <div className="glass-card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 8, alignItems: "center", border: "1px solid rgba(59,130,246,0.25)" }}>
            <input autoFocus value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addGroup(); if (e.key === "Escape") setAddingGroup(false); }}
              placeholder="Group name (e.g. SmartHome)" style={{ flex: 1, height: 34 }} />
            <button onClick={addGroup} style={{ padding: "0 16px", height: 34, borderRadius: 8, border: "none", background: "linear-gradient(135deg, #065f46, #047857)", color: "#fff", fontSize: 13, fontWeight: 600 }}>Add</button>
            <button onClick={() => { setAddingGroup(false); setNewGroupName(""); }} style={{ padding: "0 14px", height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#7d8fa3", fontSize: 13 }}>Cancel</button>
          </div>
        )}

        {/* Groups */}
        {groups.map((group, groupIdx) => {
          const expanded = expandedGroups.has(group.name);
          const sortIds  = group.services.map((_, si) => `${groupIdx}-${si}-${group.services[si].name}`);

          return (
            <div key={groupIdx} className="glass-card" style={{ marginBottom: 14, overflow: "hidden" }}>
              {/* Group header */}
              <div
                style={{
                  display: "flex", alignItems: "center", padding: "14px 18px",
                  cursor: "pointer", userSelect: "none",
                  borderBottom: expanded ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: expanded ? "rgba(255,255,255,0.02)" : "transparent",
                  transition: "background 0.15s",
                }}
                onClick={() => toggleGroup(group.name)}
              >
                <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 10 }}>
                  {expanded
                    ? <ChevronDown size={15} color="#4a5568" />
                    : <ChevronRight size={15} color="#4a5568" />}

                  {renamingGroup === groupIdx ? (
                    <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") commitRename(groupIdx); if (e.key === "Escape") setRenaming(null); }}
                      onClick={(e) => e.stopPropagation()} style={{ height: 30, fontSize: 15, fontWeight: 700 }} />
                  ) : (
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{group.name}</span>
                  )}

                  <span style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                    {group.services.length}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 5 }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setEditing({ groupIdx, serviceIdx: null })} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 7, border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.08)", color: "#60a5fa", fontSize: 12 }}>
                    <Plus size={12} /> Add
                  </button>
                  <button onClick={() => { setRenaming(groupIdx); setRenameValue(group.name); }} style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#7d8fa3" }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => deleteGroup(groupIdx)} style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", color: "#ef4444", opacity: 0.7 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Services */}
              {expanded && (
                <div style={{ padding: "10px 14px" }}>
                  {editingService?.groupIdx === groupIdx && editingService.serviceIdx === null && (
                    <ServiceForm service={EMPTY_SERVICE} onSave={saveService} onCancel={() => setEditing(null)} />
                  )}

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleServiceDragEnd(e, groupIdx)}>
                    <SortableContext items={sortIds} strategy={verticalListSortingStrategy}>
                      {group.services.map((service, serviceIdx) =>
                        editingService?.groupIdx === groupIdx && editingService.serviceIdx === serviceIdx ? (
                          <ServiceForm key={serviceIdx} service={service} onSave={saveService} onCancel={() => setEditing(null)} />
                        ) : (
                          <SortableServiceRow
                            key={`${groupIdx}-${serviceIdx}-${service.name}`}
                            service={service} groupIdx={groupIdx} serviceIdx={serviceIdx}
                            onEdit={() => setEditing({ groupIdx, serviceIdx })}
                            onDelete={() => deleteService(groupIdx, serviceIdx)}
                          />
                        )
                      )}
                    </SortableContext>
                  </DndContext>

                  {group.services.length === 0 && !(editingService?.groupIdx === groupIdx && editingService.serviceIdx === null) && (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#4a5568", fontSize: 13 }}>
                      No services yet.{" "}
                      <button onClick={() => setEditing({ groupIdx, serviceIdx: null })} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 13, padding: 0 }}>
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
          <div style={{ textAlign: "center", padding: 60, color: "#4a5568" }}>
            <p>No service groups found.</p>
            <button onClick={() => setAddingGroup(true)} style={{ padding: "9px 18px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e2e8f0", fontSize: 13, marginTop: 8 }}>
              Add your first group
            </button>
          </div>
        )}
      </div>

      <SaveBar onSave={handleSave} hasChanges={hasChanges} />
    </div>
  );
}
