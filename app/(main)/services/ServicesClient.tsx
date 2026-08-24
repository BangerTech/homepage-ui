"use client";

import { useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2,
  X, Check, GripVertical, Image as ImageIcon,
  WifiOff, Loader2 as Spin,
} from "lucide-react";
import SaveBar from "@/components/SaveBar";
import IconPicker from "@/components/IconPicker";
import { useReachability } from "@/components/ReachabilityProvider";
import {
  deleteServiceByEditorId,
  identifyServiceGroups,
  reorderServiceGroups,
  reorderServiceLayout,
  reorderServices,
  replaceServiceByEditorId,
  serializeServiceGroups,
} from "@/lib/serviceGroups";
import type {
  IdentifiedService,
  IdentifiedServiceGroup,
} from "@/lib/serviceGroups";
import type { ServiceGroup, Service } from "@/types";

interface Props { initialGroups: ServiceGroup[]; loadError: string; }

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
  service, onEdit, onDelete, reachStatus,
}: {
  service: IdentifiedService;
  onEdit: () => void; onDelete: () => void;
  reachStatus?: "checking" | "ok" | "error";
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.editorId,
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
      <button
        type="button"
        aria-label={`Reorder service ${service.name}`}
        title="Drag to reorder service"
        {...attributes}
        {...listeners}
        style={{
          width: 24, height: 28, padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", background: "transparent",
          cursor: "grab", flexShrink: 0, color: "#4a5568", touchAction: "none",
        }}
      >
        <GripVertical size={14} />
      </button>

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
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {service.name}
          </span>
          {reachStatus === "checking" && <Spin size={11} style={{ color: "#4a5568", animation: "spin 1s linear infinite", flexShrink: 0 }} />}
          {reachStatus === "ok"       && <span title="Reachable" style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 5px #10b981", flexShrink: 0, display: "inline-block" }} />}
          {reachStatus === "error"    && <span title="Not reachable"><WifiOff size={11} style={{ color: "#ef4444", flexShrink: 0 }} /></span>}
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

/* ── Sortable service group ── */
function SortableGroupCard({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="glass-card"
      style={{
        position: "relative",
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : "auto",
        marginBottom: 14,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        aria-label={`Reorder group ${label}`}
        title="Drag to reorder group"
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        style={{
          position: "absolute", top: 13, left: 14, zIndex: 2,
          width: 26, height: 30, padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", background: "transparent", color: "#4a5568",
          cursor: isDragging ? "grabbing" : "grab", touchAction: "none",
        }}
      >
        <GripVertical size={15} />
      </button>
      {children}
    </div>
  );
}

/* ── Main component ── */
export default function ServicesClient({ initialGroups, loadError }: Props) {
  const [groups, setGroups]             = useState<IdentifiedServiceGroup[]>(() => identifyServiceGroups(initialGroups));
  const [expandedGroups, setExpanded]   = useState<Set<string>>(() => new Set(initialGroups.map((_, index) => `service-group-${index}`)));
  const nextGroupId                     = useRef(initialGroups.length);
  const nextServiceId                   = useRef(initialGroups.reduce((total, group) => total + group.services.length, 0));
  const [editingService, setEditing]    = useState<{ groupId: string; serviceId: string | null } | null>(null);
  const [addingGroup, setAddingGroup]   = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [hasChanges, setHasChanges]     = useState(false);
  const [groupOrderChanged, setGroupOrderChanged] = useState(false);
  const [renamingGroup, setRenaming]    = useState<string | null>(null);
  const [renameValue, setRenameValue]   = useState("");
  const { reachability, isChecking, lastChecked, triggerCheck } = useReachability();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function toggleGroup(groupId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  function addGroup() {
    if (!newGroupName.trim()) return;
    const editorId = `service-group-${nextGroupId.current++}`;
    setGroups((p) => [...p, { editorId, name: newGroupName.trim(), services: [] }]);
    setExpanded((p) => new Set([...p, editorId]));
    setNewGroupName(""); setAddingGroup(false); setHasChanges(true);
  }

  function deleteGroup(groupId: string) {
    const group = groups.find((candidate) => candidate.editorId === groupId);
    if (!group || !confirm(`Delete group "${group.name}" and all its services?`)) return;
    setGroups((p) => p.filter((candidate) => candidate.editorId !== groupId));
    setExpanded((p) => { const next = new Set(p); next.delete(groupId); return next; });
    if (editingService?.groupId === groupId) setEditing(null);
    if (renamingGroup === groupId) setRenaming(null);
    setHasChanges(true);
  }

  function saveService(service: Service) {
    if (!editingService) return;
    const { groupId, serviceId } = editingService;
    setGroups((current) => current.map((group) => {
      if (group.editorId !== groupId) return group;
      if (serviceId === null) {
        return {
          ...group,
          services: [
            ...group.services,
            { ...service, editorId: `service-${nextServiceId.current++}` },
          ],
        };
      }
      return {
        ...group,
        services: replaceServiceByEditorId(group.services, serviceId, service),
      };
    }));
    setEditing(null); setHasChanges(true);
  }

  function deleteService(groupId: string, serviceId: string) {
    const group = groups.find((candidate) => candidate.editorId === groupId);
    const service = group?.services.find((candidate) => candidate.editorId === serviceId);
    if (!service || !confirm(`Delete service "${service.name}"?`)) return;
    setGroups((current) => current.map((candidate) => candidate.editorId === groupId
      ? { ...candidate, services: deleteServiceByEditorId(candidate.services, serviceId) }
      : candidate));
    if (editingService?.groupId === groupId && editingService.serviceId === serviceId) setEditing(null);
    setHasChanges(true);
  }

  function commitRename(groupId: string) {
    if (!renameValue.trim()) return;
    setGroups((p) => p.map((g) => g.editorId === groupId ? { ...g, name: renameValue.trim() } : g));
    setRenaming(null); setHasChanges(true);
  }

  function handleServiceDragEnd(event: DragEndEvent, groupId: string) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setGroups((current) => current.map((group) => group.editorId === groupId
      ? {
          ...group,
          services: reorderServices(group.services, String(active.id), String(over.id)),
        }
      : group));
    setHasChanges(true);
  }

  function handleGroupDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setGroups((current) => reorderServiceGroups(current, String(active.id), String(over.id)));
    setGroupOrderChanged(true);
    setHasChanges(true);
  }

  const handleSave = useCallback(async () => {
    let reorderedSettings: Record<string, unknown> | null = null;

    if (groupOrderChanged) {
      const settingsResponse = await fetch("/api/config/settings");
      const settingsPayload = await settingsResponse.json() as { data?: unknown; error?: string };
      if (!settingsResponse.ok) {
        throw new Error(settingsPayload.error || "Could not read settings before saving group order");
      }

      if (settingsPayload.data && typeof settingsPayload.data === "object" && !Array.isArray(settingsPayload.data)) {
        const settings = settingsPayload.data as Record<string, unknown>;
        const layout = settings.layout;
        if (layout && typeof layout === "object" && !Array.isArray(layout)) {
          reorderedSettings = {
            ...settings,
            layout: reorderServiceLayout(layout as Record<string, unknown>, groups),
          };
        }
      }
    }

    const servicesResponse = await fetch("/api/config/services", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: serializeServiceGroups(groups) }),
    });
    if (!servicesResponse.ok) {
      const data = await servicesResponse.json();
      throw new Error(data.error || "Save failed");
    }

    if (reorderedSettings) {
      const settingsResponse = await fetch("/api/config/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: reorderedSettings }),
      });
      if (!settingsResponse.ok) {
        const data = await settingsResponse.json();
        throw new Error(data.error || "Services saved, but Homepage layout order could not be updated");
      }
    }

    setGroupOrderChanged(false);
    setHasChanges(false);
  }, [groupOrderChanged, groups]);

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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {lastChecked && (
            <div style={{ fontSize: 11, color: "#4a5568", display: "flex", alignItems: "center", gap: 5 }}>
              {isChecking
                ? <><Spin size={11} style={{ animation: "spin 1s linear infinite" }} /> Checking...</>
                : <><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 4px #10b981", display: "inline-block" }} /> {lastChecked.toLocaleTimeString()}</>}
            </div>
          )}
          <button onClick={triggerCheck} disabled={isChecking} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 9,
            border: "1px solid rgba(16,185,129,0.25)",
            background: "rgba(16,185,129,0.08)", color: "#34d399", fontSize: 13, fontWeight: 600,
            cursor: isChecking ? "not-allowed" : "pointer",
          }}>
            {isChecking ? <Spin size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {isChecking ? "Checking..." : "Re-Check"}
          </button>
          <button onClick={() => setAddingGroup(true)} className="btn-glow" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(59,130,246,0.25)",
            background: "rgba(59,130,246,0.1)", color: "#60a5fa", fontSize: 13, fontWeight: 600,
          }}>
            <Plus size={14} /> Add Group
          </button>
        </div>
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGroupDragEnd}>
          <SortableContext items={groups.map((group) => group.editorId)} strategy={verticalListSortingStrategy}>
            {groups.map((group) => {
              const expanded = expandedGroups.has(group.editorId);
              const sortIds  = group.services.map((service) => service.editorId);

              return (
                <SortableGroupCard key={group.editorId} id={group.editorId} label={group.name}>
              {/* Group header */}
              <div
                style={{
                  display: "flex", alignItems: "center", padding: "14px 18px 14px 48px",
                  cursor: "pointer", userSelect: "none",
                  borderBottom: expanded ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: expanded ? "rgba(255,255,255,0.02)" : "transparent",
                  transition: "background 0.15s",
                }}
                onClick={() => toggleGroup(group.editorId)}
              >
                <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 10 }}>
                  {expanded
                    ? <ChevronDown size={15} color="#4a5568" />
                    : <ChevronRight size={15} color="#4a5568" />}

                  {renamingGroup === group.editorId ? (
                    <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") commitRename(group.editorId); if (e.key === "Escape") setRenaming(null); }}
                      onClick={(e) => e.stopPropagation()} style={{ height: 30, fontSize: 15, fontWeight: 700 }} />
                  ) : (
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{group.name}</span>
                  )}

                  <span style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                    {group.services.length}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 5 }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setEditing({ groupId: group.editorId, serviceId: null })} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 7, border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.08)", color: "#60a5fa", fontSize: 12 }}>
                    <Plus size={12} /> Add
                  </button>
                  <button onClick={() => { setRenaming(group.editorId); setRenameValue(group.name); }} style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#7d8fa3" }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => deleteGroup(group.editorId)} style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.15)", background: "transparent", color: "#ef4444", opacity: 0.7 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Services */}
              {expanded && (
                <div style={{ padding: "10px 14px" }}>
                  {editingService?.groupId === group.editorId && editingService.serviceId === null && (
                    <ServiceForm service={EMPTY_SERVICE} onSave={saveService} onCancel={() => setEditing(null)} />
                  )}

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleServiceDragEnd(e, group.editorId)}>
                    <SortableContext items={sortIds} strategy={verticalListSortingStrategy}>
                      {group.services.map((service) =>
                        editingService?.groupId === group.editorId && editingService.serviceId === service.editorId ? (
                          <ServiceForm key={service.editorId} service={service} onSave={saveService} onCancel={() => setEditing(null)} />
                        ) : (
                          <SortableServiceRow
                            key={service.editorId}
                            service={service}
                            onEdit={() => setEditing({ groupId: group.editorId, serviceId: service.editorId })}
                            onDelete={() => deleteService(group.editorId, service.editorId)}
                            reachStatus={service.href ? reachability[service.href] : undefined}
                          />
                        )
                      )}
                    </SortableContext>
                  </DndContext>

                  {group.services.length === 0 && !(editingService?.groupId === group.editorId && editingService.serviceId === null) && (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#4a5568", fontSize: 13 }}>
                      No services yet.{" "}
                      <button onClick={() => setEditing({ groupId: group.editorId, serviceId: null })} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 13, padding: 0 }}>
                        Add one
                      </button>
                    </div>
                  )}
                </div>
              )}
                </SortableGroupCard>
              );
            })}
          </SortableContext>
        </DndContext>

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
