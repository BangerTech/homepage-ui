import Dockerode from "dockerode";
import { readAppSettings } from "./appSettings";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

export function getContainerName(): string {
  const settings = readAppSettings();
  return settings?.containerName || "homepage";
}

export async function restartContainer(name?: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const containerName = name || getContainerName();
    const container = docker.getContainer(containerName);
    await container.restart();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function testContainer(name: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const container = docker.getContainer(name);
    await container.inspect();
    return { ok: true };
  } catch {
    return { ok: false, error: `Container "${name}" not found or Docker socket not accessible` };
  }
}
