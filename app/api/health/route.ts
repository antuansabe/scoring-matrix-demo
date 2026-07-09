import { NextResponse } from "next/server";
import { MODEL_VERSION } from "@/lib/modelVersion";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      ok: true,
      modelVersion: MODEL_VERSION,
    },
    { status: 200 }
  );
}
