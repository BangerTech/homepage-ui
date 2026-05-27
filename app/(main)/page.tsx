export const dynamic = "force-dynamic";

import { readAppSettings } from "@/lib/appSettings";
import { readYamlFile } from "@/lib/config";
import DashboardClient from "./DashboardClient";
import type { ServiceGroup, BookmarkGroup, HomepageSettings } from "@/types";

function parseServiceGroups(raw: unknown): ServiceGroup[] {
  if (!Array.isArray(raw)) return [];
  const groups: ServiceGroup[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const [name, services] = Object.entries(item as Record<string, unknown>)[0] || [];
    if (!name) continue;
    groups.push({
      name,
      services: Array.isArray(services)
        ? services.map((s) => {
            const [svcName, svcData] = Object.entries(s as Record<string, unknown>)[0] || [];
            return { name: svcName || "Unknown", ...(svcData as object) };
          })
        : [],
    });
  }
  return groups;
}

function parseBookmarkGroups(raw: unknown): BookmarkGroup[] {
  if (!Array.isArray(raw)) return [];
  const groups: BookmarkGroup[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const [name, bookmarks] = Object.entries(item as Record<string, unknown>)[0] || [];
    if (!name) continue;
    groups.push({
      name,
      bookmarks: Array.isArray(bookmarks)
        ? bookmarks.map((b) => {
            const [bName, bData] = Object.entries(b as Record<string, unknown>)[0] || [];
            const bArray = Array.isArray(bData) ? bData[0] : bData;
            return { name: bName || "Unknown", href: "", ...(bArray as object) };
          })
        : [],
    });
  }
  return groups;
}

export default function DashboardPage() {
  const settings = readAppSettings();
  let serviceGroups: ServiceGroup[] = [];
  let bookmarkGroups: BookmarkGroup[] = [];
  let widgetCount = 0;
  let homepageTitle = "Homepage";
  let error = "";

  try {
    const rawServices = readYamlFile("services.yaml");
    serviceGroups = parseServiceGroups(rawServices);
  } catch (e) {
    error = String(e);
  }

  try {
    const rawBookmarks = readYamlFile("bookmarks.yaml");
    bookmarkGroups = parseBookmarkGroups(rawBookmarks);
  } catch {
    // ignore
  }

  try {
    const rawWidgets = readYamlFile("widgets.yaml");
    widgetCount = Array.isArray(rawWidgets) ? rawWidgets.length : 0;
  } catch {
    // ignore
  }

  try {
    const rawSettings = readYamlFile("settings.yaml") as HomepageSettings;
    homepageTitle = rawSettings?.title || "Homepage";
  } catch {
    // ignore
  }

  const totalServices = serviceGroups.reduce((acc, g) => acc + g.services.length, 0);
  const totalBookmarks = bookmarkGroups.reduce((acc, g) => acc + g.bookmarks.length, 0);

  return (
    <DashboardClient
      configPath={settings?.configPath || ""}
      containerName={settings?.containerName || ""}
      homepageTitle={homepageTitle}
      serviceGroups={serviceGroups}
      totalServices={totalServices}
      bookmarkGroups={bookmarkGroups}
      totalBookmarks={totalBookmarks}
      widgetCount={widgetCount}
      error={error}
    />
  );
}
