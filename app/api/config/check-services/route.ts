import { NextRequest, NextResponse } from "next/server";

interface CheckResult {
  url: string;
  reachable: boolean;
  status?: number;
  latencyMs?: number;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { urls } = (await req.json()) as { urls: string[] };
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ ok: false, error: "No URLs provided" }, { status: 400 });
    }

    const results: CheckResult[] = await Promise.all(
      urls.map(async (url): Promise<CheckResult> => {
        if (!url?.startsWith("http")) return { url, reachable: false, error: "Invalid URL" };
        const t0 = Date.now();
        try {
          const res = await fetch(url, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
            // Don't follow too many redirects
            redirect: "follow",
          });
          return { url, reachable: res.ok || res.status < 500, status: res.status, latencyMs: Date.now() - t0 };
        } catch (e: unknown) {
          // Some services don't support HEAD — try GET with a short timeout
          try {
            const res = await fetch(url, {
              method: "GET",
              signal: AbortSignal.timeout(4000),
              redirect: "follow",
            });
            return { url, reachable: res.ok || res.status < 500, status: res.status, latencyMs: Date.now() - t0 };
          } catch (e2: unknown) {
            return { url, reachable: false, latencyMs: Date.now() - t0, error: e2 instanceof Error ? e2.message : String(e2) };
          }
        }
      })
    );

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
