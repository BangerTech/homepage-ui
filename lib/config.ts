import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { readAppSettings } from "./appSettings";

export function getConfigPath(): string {
  const settings = readAppSettings();
  return settings?.configPath || "/app/config";
}

export function readYamlFile(filename: string): unknown {
  const configPath = getConfigPath();
  const filePath = path.join(configPath, filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return yaml.load(content);
}

export function writeYamlFile(filename: string, data: unknown): void {
  const configPath = getConfigPath();
  const filePath = path.join(configPath, filename);
  const content = yaml.dump(data, { indent: 4, lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(filePath, content, "utf-8");
}

export function readTextFile(filename: string): string {
  const configPath = getConfigPath();
  const filePath = path.join(configPath, filename);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

export function writeTextFile(filename: string, content: string): void {
  const configPath = getConfigPath();
  const filePath = path.join(configPath, filename);
  fs.writeFileSync(filePath, content, "utf-8");
}

export function testConfigPath(configPath: string): { ok: boolean; error?: string } {
  try {
    const servicesFile = path.join(configPath, "services.yaml");
    if (!fs.existsSync(servicesFile)) {
      return { ok: false, error: "services.yaml not found at that path" };
    }
    fs.accessSync(servicesFile, fs.constants.R_OK | fs.constants.W_OK);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
