import { NextRequest, NextResponse } from "next/server";
import { Agent, fetch as uFetch } from "undici";

// Single reusable agent that skips certificate validation.
// Safe for homelab use — all requests are server-side to local IPs.
const insecureAgent = new Agent({ connect: { rejectUnauthorized: false } });

interface CheckResult {
  url: string;
  reachable: boolean;
  status?: number;
  latencyMs?: number;
  error?: string;
}

async function probe(url: string): Promise<CheckResult> {
  if (!url?.startsWith("http")) return { url, reachable: false, error: "Invalid URL" };
  const t0 = Date.now();

  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await uFetch(url, {
        method,
        dispatcher: insecureAgent,
        signal: AbortSignal.timeout(5000),
        redirect: "follow",
      });
      // ANY HTTP response = server is UP (401/403/404/500 all mean it's running)
      return { url, reachable: true, status: res.status, latencyMs: Date.now() - t0 };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (method === "HEAD") continue; // try GET as fallback
      return { url, reachable: false, latencyMs: Date.now() - t0, error: msg };
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
