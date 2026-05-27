import { NextRequest, NextResponse } from "next/server";
import { testConfigPath } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { configPath } = (await req.json()) as { configPath: string };
    const result = testConfigPath(configPath);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
