export const dynamic = "force-dynamic";

import { readYamlFile } from "@/lib/config";
import BookmarksClient from "./BookmarksClient";
import type { BookmarkGroup } from "@/types";

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
            const bInfo = Array.isArray(bData) ? bData[0] : bData;
            return { name: bName || "Unknown", href: "", ...(bInfo as object) };
          })
        : [],
    });
  }
  return groups;
}

export default function BookmarksPage() {
  let groups: BookmarkGroup[] = [];
  let loadError = "";
  try {
    const raw = readYamlFile("bookmarks.yaml");
    groups = parseBookmarkGroups(raw);
  } catch (e) {
    loadError = String(e);
  }
  return <BookmarksClient initialGroups={groups} loadError={loadError} />;
}
