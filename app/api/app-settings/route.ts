import { NextRequest, NextResponse } from "next/server";
import { readAppSettings, writeAppSettings } from "@/lib/appSettings";
import type { AppSettings } from "@/types";

export async function GET() {
  const settings = readAppSettings();
  if (!settings) {
    return NextResponse.json({ configured: false }, { status: 404 });
  }
  return NextResponse.json({ ...settings, configured: true });
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as AppSettings;
    writeAppSettings({ configPath: body.configPath, containerName: body.containerName, homepageUrl: body.homepageUrl });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
