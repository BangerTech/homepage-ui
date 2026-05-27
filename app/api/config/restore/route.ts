import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { getConfigPath } from "@/lib/config";

const ALLOWED = new Set(["services.yaml", "bookmarks.yaml", "widgets.yaml", "settings.yaml", "custom.css", "custom.js"]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const configPath = getConfigPath();
    const restored: string[] = [];

    for (const [filename, zipEntry] of Object.entries(zip.files)) {
      const basename = path.basename(filename);
      if (!ALLOWED.has(basename) || zipEntry.dir) continue;
      const content = await zipEntry.async("string");
      fs.writeFileSync(path.join(configPath, basename), content, "utf-8");
      restored.push(basename);
    }

    if (restored.length === 0) {
      return NextResponse.json({ ok: false, error: "No valid config files found in ZIP" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, restored });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
