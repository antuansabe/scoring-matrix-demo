import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { generateFeedback, FeedbackParseError, type SubjectVoice } from "@/lib/feedback";
import { AnthropicConfigError } from "@/lib/anthropic";
import type { DimensionKey, DimensionScore, GenreTag } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request): Promise<Response> {
  // Error messages follow the caller's locale (cw.locale cookie).
  const t = await getTranslations("apiErrors");

  // --- parse body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t("common.badJson") }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: t("common.notObject") },
      { status: 400 },
    );
  }
  const b = body as Record<string, unknown>;

  // --- validate required fields ---
  const text = typeof b.text === "string" ? b.text : undefined;
  if (!text) {
    return NextResponse.json(
      { error: t("feedback.missingText") },
      { status: 400 },
    );
  }

  if (typeof b.scores !== "object" || b.scores === null) {
    return NextResponse.json(
      { error: t("feedback.missingScores") },
      { status: 400 },
    );
  }

  const genre = typeof b.genre === "string" ? (b.genre as GenreTag) : undefined;
  if (!genre) {
    return NextResponse.json(
      { error: t("feedback.missingGenre") },
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
      { error: t("feedback.badVoice") },
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
        { error: t("feedback.unavailable") },
        { status: 500 },
      );
    }
    if (err instanceof FeedbackParseError) {
      console.error("[api/feedback] Parse error:", (err as Error).message);
      return NextResponse.json(
        { error: t("feedback.parseFailed") },
        { status: 502 },
      );
    }
    console.error("[api/feedback] Unexpected error:", err);
    return NextResponse.json(
      { error: t("feedback.failed") },
      { status: 502 },
    );
  }
}
