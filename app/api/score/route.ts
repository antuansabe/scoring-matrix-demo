import { NextResponse } from "next/server";
import { callClaudeWithCachedSystem, AnthropicConfigError } from "@/lib/anthropic";
import { SCORER_SYSTEM_PROMPT } from "@/lib/prompts/scorer";
import { validateAndComputeScore } from "@/lib/scoring";
import { countWords } from "@/lib/text";

// The Anthropic SDK needs the Node.js runtime. maxDuration gives the Sonnet
// call room on Vercel.
export const runtime = "nodejs";
export const maxDuration = 30;

const MIN_WORDS = 50;
const MAX_WORDS = 7000;

export async function POST(request: Request): Promise<Response> {
  // --- parse the request body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body is not valid JSON." },
      { status: 400 },
    );
  }
  const text =
    typeof body === "object" && body !== null && "text" in body
      ? (body as { text: unknown }).text
      : undefined;
  if (typeof text !== "string") {
    return NextResponse.json(
      { error: "Missing «text» field (must be a string)." },
      { status: 400 },
    );
  }

  // --- length validation (50–7000 words after trimming) ---
  const words = countWords(text);
  if (words < MIN_WORDS) {
    return NextResponse.json(
      {
        error: `Text is too short: ${words} ${
          words === 1 ? "word" : "words"
        }. Minimum ${MIN_WORDS} words required.`,
      },
      { status: 400 },
    );
  }
  if (words > MAX_WORDS) {
    return NextResponse.json(
      {
        error: `Text is too long: ${words} words. Maximum ${MAX_WORDS} words.`,
      },
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
      maxTokens: 3000,
      temperature: 0,
    });
    rawJson = result.text;
  } catch (err) {
    if (err instanceof AnthropicConfigError) {
      console.error("[api/score] ANTHROPIC_API_KEY is not configured.");
      return NextResponse.json(
        { error: "The analysis service is not available right now." },
        { status: 500 },
      );
    }
    console.error("[api/score] Error calling Anthropic:", err);
    return NextResponse.json(
      { error: "Could not complete the analysis. Please try again." },
      { status: 502 },
    );
  }

  // --- validate and compute score ---
  const validated = validateAndComputeScore(rawJson, words);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validated.error },
      { status: validated.status },
    );
  }

  return NextResponse.json(validated.result, { status: 200 });
}
