import { NextResponse } from "next/server";
import { restartContainer } from "@/lib/docker";

export async function POST() {
  const result = await restartContainer();
  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
