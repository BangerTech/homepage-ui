export const dynamic = "force-dynamic";

import { readYamlFile } from "@/lib/config";
import ServicesClient from "./ServicesClient";
import type { ServiceGroup } from "@/types";

function parseServiceGroups(raw: unknown): ServiceGroup[] {
  if (!Array.isArray(raw)) return [];
  const groups: ServiceGroup[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const entries = Object.entries(item as Record<string, unknown>);
    if (!entries.length) continue;
    const [name, services] = entries[0];
    groups.push({
      name,
      services: Array.isArray(services)
        ? services.map((s) => {
            if (typeof s !== "object" || s === null) return { name: "Unknown" };
            const [svcName, svcData] = Object.entries(s as Record<string, unknown>)[0] || [];
            return { name: svcName || "Unknown", ...(svcData as object) };
          })
        : [],
    });
  }
  return groups;
}

export default function ServicesPage() {
  let groups: ServiceGroup[] = [];
  let loadError = "";
  try {
    const raw = readYamlFile("services.yaml");
    groups = parseServiceGroups(raw);
  } catch (e) {
    loadError = String(e);
  }
  return <ServicesClient initialGroups={groups} loadError={loadError} />;
}
