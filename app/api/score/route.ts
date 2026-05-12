import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import {
  calculateEnactmentScore,
  resolveEACHOrientation,
  resolveParadigmName,
} from "@/lib/paradigm";
import type {
  DimensionKey,
  DimensionScore,
  GenreTag,
  ScoreResult,
} from "@/lib/types";

// The Anthropic SDK needs the Node.js runtime. maxDuration gives the Sonnet
// call room on Vercel.
export const runtime = "nodejs";
export const maxDuration = 30;

const MIN_WORDS = 50;
const MAX_WORDS = 5000;

const DIMENSION_KEYS: DimensionKey[] = ["D1", "D2", "D3", "D4", "D5"];
const VALID_GENRE_TAGS: GenreTag[] = [
  "free-form-interview",
  "structured-profile",
  "social-media-post",
  "institutional-report",
  "speech-public-address",
  "fundraising-copy",
];

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

/** Defensive: strip a surrounding ```json ... ``` (or plain ``` ... ```) fence. */
function stripCodeFences(raw: string): string {
  const s = raw.trim();
  const match = s.match(/^```[a-zA-Z]*\s*\n?([\s\S]*?)\n?```$/);
  return match ? match[1].trim() : s;
}

function isDimensionScore(value: unknown): value is DimensionScore {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.score === "number" &&
    o.score >= 0 &&
    o.score <= 4 &&
    typeof o.justification === "string" &&
    Array.isArray(o.quotes) &&
    o.quotes.every((q) => typeof q === "string")
  );
}

interface ValidatedScore {
  genreTag: GenreTag;
  dimensions: Record<DimensionKey, DimensionScore>;
  enactmentScore: number;
  paradigmName: string;
  eachOrientation: string;
  wordCountWarnings: unknown;
  confidenceFlags: unknown;
}

/** Minimal shape validation of the JSON the scorer returns. */
function validateShape(parsed: unknown): parsed is ValidatedScore {
  if (typeof parsed !== "object" || parsed === null) return false;
  const o = parsed as Record<string, unknown>;

  if (
    typeof o.genreTag !== "string" ||
    !VALID_GENRE_TAGS.includes(o.genreTag as GenreTag)
  ) {
    return false;
  }
  if (typeof o.dimensions !== "object" || o.dimensions === null) return false;
  const dims = o.dimensions as Record<string, unknown>;
  for (const key of DIMENSION_KEYS) {
    if (!isDimensionScore(dims[key])) return false;
  }
  if (typeof o.enactmentScore !== "number") return false;
  if (typeof o.paradigmName !== "string") return false;
  if (typeof o.eachOrientation !== "string") return false;
  return true;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((x): x is string => typeof x === "string")
    : [];
}

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

  // --- length validation (50–5000 words after trimming) ---
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

  // --- API key ---
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[api/score] ANTHROPIC_API_KEY is not configured.");
    return NextResponse.json(
      { error: "The analysis service is not available right now." },
      { status: 500 },
    );
  }

  // --- call Claude ---
  const client = new Anthropic({ apiKey });
  let rawText: string;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });
    const first = response.content[0];
    if (!first || first.type !== "text") {
      throw new Error("The model response contains no text.");
    }
    rawText = first.text;
  } catch (err) {
    console.error("[api/score] Error calling Anthropic:", err);
    return NextResponse.json(
      { error: "Could not complete the analysis. Please try again." },
      { status: 502 },
    );
  }

  // --- parse the JSON the scorer returned ---
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(rawText));
  } catch {
    console.error(
      "[api/score] Could not parse the scorer's JSON:",
      rawText.slice(0, 500),
    );
    return NextResponse.json(
      { error: "The scorer returned an unexpected response." },
      { status: 502 },
    );
  }

  // --- the scorer's documented "too short / gibberish" escape hatch ---
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "error" in parsed &&
    typeof (parsed as Record<string, unknown>).error === "string"
  ) {
    return NextResponse.json(
      { error: (parsed as { error: string }).error },
      { status: 422 },
    );
  }

  // --- shape validation ---
  if (!validateShape(parsed)) {
    console.error(
      "[api/score] Invalid shape from the scorer:",
      JSON.stringify(parsed).slice(0, 500),
    );
    return NextResponse.json(
      { error: "The scorer returned an unexpected response." },
      { status: 502 },
    );
  }

  // --- normalize the dimension scores (ints in [0,4]) ---
  const dimensions = parsed.dimensions;
  for (const key of DIMENSION_KEYS) {
    const d = dimensions[key];
    d.score = Math.min(4, Math.max(0, Math.round(d.score)));
  }

  // --- recompute the derived fields server-side; don't trust the LLM 100% ---
  const serverScore = calculateEnactmentScore(dimensions, parsed.genreTag);
  if (Math.abs(serverScore - parsed.enactmentScore) > 3) {
    console.warn(
      `[api/score] LLM enactmentScore (${parsed.enactmentScore}) differs from server (${serverScore}) by more than 3 points. Using the server value.`,
    );
  }

  const result: ScoreResult = {
    genreTag: parsed.genreTag,
    wordCount: words,
    dimensions,
    enactmentScore: serverScore,
    paradigmName: resolveParadigmName(serverScore),
    eachOrientation: resolveEACHOrientation(dimensions),
    wordCountWarnings: toStringArray(parsed.wordCountWarnings),
    confidenceFlags: toStringArray(parsed.confidenceFlags),
  };

  return NextResponse.json(result, { status: 200 });
}
