import { NextRequest, NextResponse } from "next/server";
import { testContainer } from "@/lib/docker";

export async function POST(req: NextRequest) {
  try {
    const { containerName } = (await req.json()) as { containerName: string };
    const result = await testContainer(containerName);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
