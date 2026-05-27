export const dynamic = "force-dynamic";

import { readYamlFile } from "@/lib/config";
import { readAppSettings } from "@/lib/appSettings";
import SettingsClient from "./SettingsClient";
import type { HomepageSettings, AppSettings } from "@/types";

export default function SettingsPage() {
  let homepageSettings: HomepageSettings = {};
  let appSettings: AppSettings = { configPath: "/app/config", containerName: "homepage" };
  let loadError = "";

  try {
    homepageSettings = (readYamlFile("settings.yaml") as HomepageSettings) || {};
  } catch (e) {
    loadError = String(e);
  }

  try {
    appSettings = readAppSettings() || appSettings;
  } catch {
    // ignore
  }

  return (
    <SettingsClient
      initialSettings={homepageSettings}
      initialAppSettings={appSettings}
      loadError={loadError}
    />
  );
}
