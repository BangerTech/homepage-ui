import { NextResponse } from "next/server";
import Dockerode from "dockerode";

export async function GET() {
  try {
    const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });
    const containers = await docker.listContainers({ all: true });
    const result = containers.map((c) => ({
      id: c.Id.slice(0, 12),
      name: (c.Names[0] || "").replace(/^\//, ""),
      image: c.Image,
      state: c.State,   // "running" | "exited" | "paused" | ...
      status: c.Status, // human-readable e.g. "Up 2 hours"
    }));
    return NextResponse.json({ ok: true, containers: result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
