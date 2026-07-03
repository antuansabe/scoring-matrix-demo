import { NextResponse } from "next/server";
import { generateFeedback, FeedbackParseError, type SubjectVoice } from "@/lib/feedback";
import { AnthropicConfigError } from "@/lib/anthropic";
import type { DimensionKey, DimensionScore, GenreTag } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request): Promise<Response> {
  // --- parse body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body is not valid JSON." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 },
    );
  }
  const b = body as Record<string, unknown>;

  // --- validate required fields ---
  const text = typeof b.text === "string" ? b.text : undefined;
  if (!text) {
    return NextResponse.json(
      { error: "Missing 'text' field (must be a string)." },
      { status: 400 },
    );
  }

  if (typeof b.scores !== "object" || b.scores === null) {
    return NextResponse.json(
      { error: "Missing 'scores' field (must be an object)." },
      { status: 400 },
    );
  }

  const genre = typeof b.genre === "string" ? (b.genre as GenreTag) : undefined;
  if (!genre) {
    return NextResponse.json(
      { error: "Missing 'genre' field (must be a string)." },
      { status: 400 },
    );
  }

  const crossGenreContext =
    typeof b.crossGenreContext === "string" ? b.crossGenreContext : undefined;

  if (
    b.subjectVoice !== undefined &&
    b.subjectVoice !== "individual" &&
    b.subjectVoice !== "organization"
  ) {
    return NextResponse.json(
      { error: "`subjectVoice` must be 'individual' or 'organization' when provided." },
      { status: 400 },
    );
  }
  const subjectVoice = b.subjectVoice as SubjectVoice | undefined;

  // --- call feedback generator ---
  try {
    const result = await generateFeedback({
      text,
      scores: b.scores as Record<DimensionKey, DimensionScore>,
      genre,
      crossGenreContext,
      subjectVoice,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof AnthropicConfigError) {
      console.error("[api/feedback] ANTHROPIC_API_KEY is not configured.");
      return NextResponse.json(
        { error: "The feedback service is not available right now." },
        { status: 500 },
      );
    }
    if (err instanceof FeedbackParseError) {
      console.error("[api/feedback] Parse error:", (err as Error).message);
      return NextResponse.json(
        { error: "Could not parse feedback response. Please try again." },
        { status: 502 },
      );
    }
    console.error("[api/feedback] Unexpected error:", err);
    return NextResponse.json(
      { error: "Could not complete the feedback analysis. Please try again." },
      { status: 502 },
    );
  }
}
