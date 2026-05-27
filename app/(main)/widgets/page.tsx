export const dynamic = "force-dynamic";

import { readYamlFile } from "@/lib/config";
import WidgetsClient from "./WidgetsClient";

export default function WidgetsPage() {
  let widgets: Record<string, unknown>[] = [];
  let loadError = "";
  try {
    const raw = readYamlFile("widgets.yaml");
    widgets = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  } catch (e) {
    loadError = String(e);
  }
  return <WidgetsClient initialWidgets={widgets} loadError={loadError} />;
}
