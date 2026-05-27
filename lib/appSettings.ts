import fs from "fs";
import path from "path";
import type { AppSettings } from "@/types";

const DATA_DIR = process.env.DATA_PATH || "/app/data";
const SETTINGS_FILE = path.join(DATA_DIR, "app-settings.json");

export function readAppSettings(): AppSettings | null {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return null;
    const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return JSON.parse(data) as AppSettings;
  } catch {
    return null;
  }
}

export function writeAppSettings(settings: AppSettings): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

export function isConfigured(): boolean {
  return readAppSettings() !== null;
}
