import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { callClaudeWithCachedSystem, AnthropicConfigError } from "@/lib/anthropic";
import { SCORER_SYSTEM_PROMPT } from "@/lib/prompts/scorer";
import { validateAndComputeScore } from "@/lib/scoring";
import { countWords } from "@/lib/text";

// The Anthropic SDK needs the Node.js runtime. maxDuration gives the Sonnet
// call room on Vercel.
export const runtime = "nodejs";
export const maxDuration = 60;

const MIN_WORDS = 50;
const MAX_WORDS = 7000;

export async function POST(request: Request): Promise<Response> {
  // Error messages follow the caller's locale (cw.locale cookie, same-origin
  // fetch sends it automatically); clients render `error` verbatim.
  const t = await getTranslations("apiErrors");

  // --- parse the request body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t("common.badJson") }, { status: 400 });
  }
  const text =
    typeof body === "object" && body !== null && "text" in body
      ? (body as { text: unknown }).text
      : undefined;
  if (typeof text !== "string") {
    return NextResponse.json(
      { error: t("score.missingText") },
      { status: 400 },
    );
  }

  // --- length validation (50–7000 words after trimming) ---
  const words = countWords(text);
  if (words < MIN_WORDS) {
    return NextResponse.json(
      { error: t("score.tooShort", { words, min: MIN_WORDS }) },
      { status: 400 },
    );
  }
  if (words > MAX_WORDS) {
    return NextResponse.json(
      { error: t("score.tooLong", { words, max: MAX_WORDS }) },
      { status: 400 },
    );
  }

  // --- call Claude ---
  let rawJson: string;
  try {
    const result = await callClaudeWithCachedSystem({
      model: "claude-sonnet-4-6",
      systemPrompt: SCORER_SYSTEM_PROMPT,
      userMessage: text,
      maxTokens: 5000,
      temperature: 0,
    });
    rawJson = result.text;
  } catch (err) {
    if (err instanceof AnthropicConfigError) {
      console.error("[api/score] ANTHROPIC_API_KEY is not configured.");
      return NextResponse.json(
        { error: t("score.unavailable") },
        { status: 500 },
      );
    }
    console.error("[api/score] Error calling Anthropic:", err);
    return NextResponse.json(
      { error: t("score.callFailed") },
      { status: 502 },
    );
  }

  // --- validate and compute score ---
  const validated = validateAndComputeScore(rawJson, words);
  if (!validated.ok) {
    // "scorerRejected" carries the scorer's own verbatim message (frozen
    // prompt — untranslatable); everything else maps to the catalog.
    const message =
      validated.errorCode === "scorerRejected" && validated.detail
        ? validated.detail
        : t(`score.${validated.errorCode}`);
    return NextResponse.json(
      { error: message },
      { status: validated.status },
    );
  }

  return NextResponse.json(validated.result, { status: 200 });
}
