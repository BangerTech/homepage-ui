import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { getConfigPath } from "@/lib/config";

const FILES = ["services.yaml", "bookmarks.yaml", "widgets.yaml", "settings.yaml", "custom.css", "custom.js"];

export async function GET() {
  try {
    const configPath = getConfigPath();
    const zip = new JSZip();

    for (const file of FILES) {
      const filePath = path.join(configPath, file);
      if (fs.existsSync(filePath)) {
        zip.file(file, fs.readFileSync(filePath, "utf-8"));
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    const uint8  = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="homepage-backup-${timestamp}.zip"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
