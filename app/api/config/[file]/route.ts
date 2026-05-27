import { NextRequest, NextResponse } from "next/server";
import { readYamlFile, writeYamlFile, readTextFile, writeTextFile } from "@/lib/config";

const TEXT_FILES = ["custom-css", "custom-js"];
const FILE_MAP: Record<string, string> = {
  services: "services.yaml",
  bookmarks: "bookmarks.yaml",
  widgets: "widgets.yaml",
  settings: "settings.yaml",
  "custom-css": "custom.css",
  "custom-js": "custom.js",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const filename = FILE_MAP[file];
  if (!filename) {
    return NextResponse.json({ error: "Unknown config file" }, { status: 400 });
  }
  try {
    if (TEXT_FILES.includes(file)) {
      const content = readTextFile(filename);
      return NextResponse.json({ content });
    }
    const data = readYamlFile(filename);
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const filename = FILE_MAP[file];
  if (!filename) {
    return NextResponse.json({ error: "Unknown config file" }, { status: 400 });
  }
  try {
    const body = await req.json();
    if (TEXT_FILES.includes(file)) {
      writeTextFile(filename, body.content as string);
    } else {
      writeYamlFile(filename, body.data);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
