import type { Service, ServiceGroup } from "../types";

export interface IdentifiedService extends Service {
  editorId: string;
}

export interface IdentifiedServiceGroup extends Omit<ServiceGroup, "services"> {
  editorId: string;
  services: IdentifiedService[];
}

export function serializeServiceGroups(groups: IdentifiedServiceGroup[]): unknown[] {
  return groups.map((group) => ({
    [group.name]: group.services.map((service) => {
      const rest: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(service)) {
        if (key !== "name" && key !== "editorId") rest[key] = value;
      }
      return { [service.name]: rest };
    }),
  }));
}

export function identifyServiceGroups(
  groups: ServiceGroup[],
): IdentifiedServiceGroup[] {
  let serviceIndex = 0;

  return groups.map((group, groupIndex) => ({
    ...group,
    editorId: `service-group-${groupIndex}`,
    services: group.services.map((service) => ({
      ...service,
      editorId: `service-${serviceIndex++}`,
    })),
  }));
}

export function reorderServiceLayout<T>(
  layout: Record<string, T>,
  groups: IdentifiedServiceGroup[],
): Record<string, T> {
  const reordered: Record<string, T> = {};
  const included = new Set<string>();

  for (const group of groups) {
    if (Object.prototype.hasOwnProperty.call(layout, group.name) && !included.has(group.name)) {
      reordered[group.name] = layout[group.name];
      included.add(group.name);
    }
  }

  for (const [name, settings] of Object.entries(layout)) {
    if (!included.has(name)) reordered[name] = settings;
  }

  return reordered;
}

export function reorderServiceGroups(
  groups: IdentifiedServiceGroup[],
  activeId: string,
  overId: string,
): IdentifiedServiceGroup[] {
  const from = groups.findIndex((group) => group.editorId === activeId);
  const to = groups.findIndex((group) => group.editorId === overId);

  if (from === -1 || to === -1 || from === to) return groups;

  const reordered = [...groups];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);
  return reordered;
}

export function reorderServices(
  services: IdentifiedService[],
  activeId: string,
  overId: string,
): IdentifiedService[] {
  const from = services.findIndex((service) => service.editorId === activeId);
  const to = services.findIndex((service) => service.editorId === overId);

  if (from === -1 || to === -1 || from === to) return services;

  const reordered = [...services];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);
  return reordered;
}

export function replaceServiceByEditorId(
  services: IdentifiedService[],
  editorId: string,
  service: Service,
): IdentifiedService[] {
  const index = services.findIndex((candidate) => candidate.editorId === editorId);
  if (index === -1) return services;

  const updated = [...services];
  updated[index] = { ...service, editorId };
  return updated;
}

export function deleteServiceByEditorId(
  services: IdentifiedService[],
  editorId: string,
): IdentifiedService[] {
  const index = services.findIndex((service) => service.editorId === editorId);
  if (index === -1) return services;
  return services.filter((service) => service.editorId !== editorId);
}
