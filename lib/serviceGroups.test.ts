import { describe, expect, it } from "vitest";
import {
  deleteServiceByEditorId,
  identifyServiceGroups,
  reorderServiceGroups,
  reorderServiceLayout,
  reorderServices,
  replaceServiceByEditorId,
  serializeServiceGroups,
} from "./serviceGroups";
import type { ServiceGroup } from "../types";

const groups: ServiceGroup[] = [
  { name: "Media", services: [{ name: "Plex", href: "https://plex.example.com" }] },
  { name: "Network", services: [{ name: "Omada", href: "https://omada.example.com" }] },
  { name: "Automation", services: [{ name: "n8n", href: "https://n8n.example.com" }] },
];

describe("identifyServiceGroups", () => {
  it("gives duplicate group and service names distinct immutable editor identities", () => {
    const identified = identifyServiceGroups([
      {
        name: "Media",
        services: [{ name: "Plex" }, { name: "Plex" }],
      },
      { ...groups[0], services: [{ name: "Jellyfin" }] },
    ]);

    expect(identified.map((group) => group.name)).toEqual(["Media", "Media"]);
    expect(new Set(identified.map((group) => group.editorId)).size).toBe(2);
    expect(new Set(identified.flatMap((group) => group.services.map((service) => service.editorId))).size).toBe(3);
  });
});

describe("service editing", () => {
  const servicesGroup: ServiceGroup = {
    name: "Media",
    services: [
      { name: "A" },
      { name: "B", href: "https://old.example.com" },
      { name: "C" },
    ],
  };

  it("keeps the edited service identity through an in-group reorder", () => {
    const services = identifyServiceGroups([servicesGroup])[0].services;
    const editingId = services[1].editorId;
    const reordered = reorderServices(
      services,
      services[2].editorId,
      services[0].editorId,
    );
    const updated = replaceServiceByEditorId(reordered, editingId, {
      name: "B updated",
      href: "https://new.example.com",
    });

    expect(updated.map((service) => service.name)).toEqual(["C", "A", "B updated"]);
    expect(updated[2].editorId).toBe(editingId);
  });

  it("keeps the edited service identity when an earlier service is deleted", () => {
    const services = identifyServiceGroups([servicesGroup])[0].services;
    const editingId = services[1].editorId;
    const withoutFirst = deleteServiceByEditorId(services, services[0].editorId);
    const updated = replaceServiceByEditorId(withoutFirst, editingId, { name: "B updated" });

    expect(updated.map((service) => service.name)).toEqual(["B updated", "C"]);
    expect(updated[0].editorId).toBe(editingId);
  });
});

describe("service group layout", () => {
  it("matches layout key order to the reordered service groups while preserving settings", () => {
    const identified = identifyServiceGroups([
      { name: "NUC", services: [] },
      { name: "Network Shortcuts", services: [] },
      { name: "Seedboxes", services: [] },
    ]);
    const layout = {
      NUC: { tab: "Services", columns: 4 },
      Seedboxes: { tab: "Shortcuts", style: "row" },
      "Network Shortcuts": { tab: "Shortcuts", columns: 3 },
    };

    expect(reorderServiceLayout(layout, identified)).toEqual({
      NUC: { tab: "Services", columns: 4 },
      "Network Shortcuts": { tab: "Shortcuts", columns: 3 },
      Seedboxes: { tab: "Shortcuts", style: "row" },
    });
  });

  it("retains layout-only entries after service-backed entries", () => {
    const identified = identifyServiceGroups([
      { name: "NUC", services: [] },
      { name: "AI", services: [] },
    ]);
    const layout = {
      NUC: { tab: "Services" },
      Legacy: { tab: "Archived" },
      AI: { tab: "Services" },
    };

    expect(Object.keys(reorderServiceLayout(layout, identified))).toEqual([
      "NUC",
      "AI",
      "Legacy",
    ]);
  });
});

describe("reorderServiceGroups", () => {
  it("moves a service group by editor identity without changing its services", () => {
    const identified = identifyServiceGroups(groups);
    const reordered = reorderServiceGroups(
      identified,
      identified[2].editorId,
      identified[0].editorId,
    );

    expect(reordered.map((group) => group.name)).toEqual([
      "Automation",
      "Media",
      "Network",
    ]);
    expect(reordered[0]).toBe(identified[2]);
    expect(reordered[1]).toBe(identified[0]);
    expect(reordered[2]).toBe(identified[1]);
  });

  it("reorders the intended group when names are duplicated", () => {
    const identified = identifyServiceGroups([
      groups[0],
      { ...groups[0], services: [{ name: "Jellyfin" }] },
      groups[1],
    ]);
    const reordered = reorderServiceGroups(
      identified,
      identified[1].editorId,
      identified[2].editorId,
    );

    expect(reordered.map((group) => group.services[0].name)).toEqual([
      "Plex",
      "Omada",
      "Jellyfin",
    ]);
  });

  it("returns the existing array for a no-op or unknown drop", () => {
    const identified = identifyServiceGroups(groups);

    expect(reorderServiceGroups(
      identified,
      identified[0].editorId,
      identified[0].editorId,
    )).toBe(identified);
    expect(reorderServiceGroups(
      identified,
      "missing",
      identified[0].editorId,
    )).toBe(identified);
  });

  it("serializes the reordered groups without persisting group or service editor identities", () => {
    const identified = identifyServiceGroups(groups);
    const reordered = reorderServiceGroups(
      identified,
      identified[2].editorId,
      identified[0].editorId,
    );

    expect(serializeServiceGroups(reordered)).toEqual([
      { Automation: [{ n8n: { href: "https://n8n.example.com" } }] },
      { Media: [{ Plex: { href: "https://plex.example.com" } }] },
      { Network: [{ Omada: { href: "https://omada.example.com" } }] },
    ]);
  });
});
