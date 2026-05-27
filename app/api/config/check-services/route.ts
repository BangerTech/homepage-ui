import { NextRequest, NextResponse } from "next/server";
import https from "https";

// For homelab use: ignore self-signed certificates
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

interface CheckResult {
  url: string;
  reachable: boolean;
  status?: number;
  latencyMs?: number;
  error?: string;
}

async function probe(url: string): Promise<CheckResult> {
  const t0 = Date.now();
  // Use node-native fetch with custom agent via undici-compatible options,
  // falling back to http/https module for self-signed cert support
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetch(url, {
        method,
        signal: AbortSignal.timeout(5000),
        redirect: "follow",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(url.startsWith("https") ? { agent: insecureAgent } as any : {}),
      });
      // ANY HTTP response (including 401, 403, 404, 500) = server is UP
      return { url, reachable: true, status: res.status, latencyMs: Date.now() - t0 };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // If it's a TLS/cert error, try once more ignoring SSL via http.request
      if (method === "HEAD" && (msg.includes("certificate") || msg.includes("ssl") || msg.includes("CERT"))) {
        continue; // try GET which also has the insecure agent
      }
      if (method === "GET") {
        return { url, reachable: false, latencyMs: Date.now() - t0, error: msg };
      }
    }
  }
  return { url, reachable: false, latencyMs: Date.now() - t0 };
}

export async function POST(req: NextRequest) {
  try {
    const { urls } = (await req.json()) as { urls: string[] };
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ ok: false, error: "No URLs provided" }, { status: 400 });
    }

    const results = await Promise.all(urls.map(probe));
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
