import { NextResponse } from "next/server";
import { getAnalysisWithMaterialTextByEntryId } from "@/lib/db/analyses";
import { generateChangeSummary, ChangeNarrativeParseError } from "@/lib/changeNarrative";
import { AnthropicConfigError } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  // --- parse body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body is not valid JSON." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const entryId1 = typeof b.entryId1 === "string" ? b.entryId1 : undefined;
  const entryId2 = typeof b.entryId2 === "string" ? b.entryId2 : undefined;
  if (!entryId1 || !entryId2) {
    return NextResponse.json({ error: "Both `entryId1` and `entryId2` are required." }, { status: 400 });
  }
  if (entryId1 === entryId2) {
    return NextResponse.json({ error: "Provide two different entries to compare." }, { status: 400 });
  }

  try {
    const [entryA, entryB] = await Promise.all([
      getAnalysisWithMaterialTextByEntryId(entryId1),
      getAnalysisWithMaterialTextByEntryId(entryId2),
    ]);
    if (!entryA || !entryB) {
      return NextResponse.json({ error: "One or both entries were not found." }, { status: 404 });
    }
    // Decision #4, defense in depth — the compare UI already scopes both
    // selectors to one subject, but this API boundary re-validates it rather
    // than trusting the client.
    if (entryA.entry.subject_id !== entryB.entry.subject_id) {
      return NextResponse.json({ error: "Cannot compare entries from different subjects." }, { status: 400 });
    }

    const summary = await generateChangeSummary(entryA, entryB);
    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    if (err instanceof AnthropicConfigError) {
      console.error("[api/compare/narrative] ANTHROPIC_API_KEY is not configured.");
      return NextResponse.json(
        { error: "The narrative service is not available right now." },
        { status: 500 },
      );
    }
    if (err instanceof ChangeNarrativeParseError) {
      console.error("[api/compare/narrative] Parse error:", (err as Error).message);
      return NextResponse.json(
        { error: "Could not parse the change narrative response. Please try again." },
        { status: 502 },
      );
    }
    console.error("[api/compare/narrative] Unexpected error:", err);
    return NextResponse.json(
      { error: "Could not generate the change narrative. Please try again." },
      { status: 502 },
    );
  }
}
