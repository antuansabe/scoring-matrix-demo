import { NextResponse } from "next/server";
import {
  callClaudeWithCachedSystem,
  AnthropicConfigError,
  type ClaudeCallResult,
} from "@/lib/anthropic";
import { SCORER_SYSTEM_PROMPT } from "@/lib/prompts/scorer";
import { EXTRACTOR_SYSTEM_PROMPT } from "@/lib/prompts/extractor";
import { validateAndComputeScore } from "@/lib/scoring";
import { countWords } from "@/lib/text";
import type {
  AnalysisResult,
  AnalysisUsage,
  ExtractionResult,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MIN_WORDS = 50;
const MAX_WORDS = 7000;

// ---------------------------------------------------------------------------
// Extraction helpers
// ---------------------------------------------------------------------------

/** A valid ExtractionResult with all arrays empty — used on degradation. */
function emptyExtraction(): ExtractionResult {
  return {
    schemaVersion: 1,
    actors: [],
    problemQuotes: [],
    solutionQuotes: [],
    geography: [],
    helloWorldShifts: {
      shift1_contribution: [],
      shift2_sharedExperience: [],
      shift3_valueOfContributions: [],
      shift4_fluidCommunities: [],
    },
  };
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((x): x is string => typeof x === "string")
    : [];
}

/**
 * Parse and validate the extractor's JSON output. Returns a valid
 * ExtractionResult or null if the shape is unacceptable.
 */
function parseExtraction(raw: string): ExtractionResult | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const o = parsed as Record<string, unknown>;

  // Validate minimal shape
  const shifts = o.helloWorldShifts;
  const hasShifts =
    typeof shifts === "object" &&
    shifts !== null &&
    "shift1_contribution" in shifts &&
    "shift2_sharedExperience" in shifts &&
    "shift3_valueOfContributions" in shifts &&
    "shift4_fluidCommunities" in shifts;

  if (!hasShifts) return null;

  const s = shifts as Record<string, unknown>;

  return {
    schemaVersion:
      typeof o.schemaVersion === "number" ? o.schemaVersion : 1,
    actors: toStringArray(o.actors),
    problemQuotes: toStringArray(o.problemQuotes),
    solutionQuotes: toStringArray(o.solutionQuotes),
    geography: toStringArray(o.geography),
    helloWorldShifts: {
      shift1_contribution: toStringArray(s.shift1_contribution),
      shift2_sharedExperience: toStringArray(s.shift2_sharedExperience),
      shift3_valueOfContributions: toStringArray(s.shift3_valueOfContributions),
      shift4_fluidCommunities: toStringArray(s.shift4_fluidCommunities),
    },
  };
}

// ---------------------------------------------------------------------------
// Usage helpers
// ---------------------------------------------------------------------------

function buildUsage(
  scoringResult: ClaudeCallResult,
  extractionResult: ClaudeCallResult | null,
): AnalysisUsage {
  const sU = scoringResult.usage;
  const eU = extractionResult?.usage ?? {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
  };
  return {
    totalInputTokens: sU.inputTokens + eU.inputTokens,
    totalOutputTokens: sU.outputTokens + eU.outputTokens,
    scoringInputTokens: sU.inputTokens,
    scoringOutputTokens: sU.outputTokens,
    extractionInputTokens: eU.inputTokens,
    extractionOutputTokens: eU.outputTokens,
    cacheReadTokens: sU.cacheReadTokens + eU.cacheReadTokens,
    cacheCreationTokens: sU.cacheCreationTokens + eU.cacheCreationTokens,
  };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

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
      { error: 'Missing «text» field (must be a string).' },
      { status: 400 },
    );
  }

  // --- length validation ---
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

  // --- run scoring and extraction in parallel ---
  let scoringCallResult: ClaudeCallResult;
  let extractionCallResult: ClaudeCallResult | null = null;
  let extractionDegraded = false;

  try {
    const scoringPromise = callClaudeWithCachedSystem({
      model: "claude-sonnet-4-6",
      systemPrompt: SCORER_SYSTEM_PROMPT,
      userMessage: text,
      maxTokens: 5000,
      temperature: 0,
    });

    const extractionPromise = callClaudeWithCachedSystem({
      model: "claude-haiku-4-5-20251001",
      systemPrompt: EXTRACTOR_SYSTEM_PROMPT,
      userMessage: text,
      maxTokens: 3000,
      temperature: 0,
    }).catch((err) => {
      // Extraction is non-critical — degrade gracefully
      console.error("[api/analyze] Extraction call failed (degrading):", err);
      extractionDegraded = true;
      return null;
    });

    const [sResult, eResult] = await Promise.all([
      scoringPromise,
      extractionPromise,
    ]);

    scoringCallResult = sResult;
    extractionCallResult = eResult;
  } catch (err) {
    // If the scoring call fails, the whole analysis fails (it's critical)
    if (err instanceof AnthropicConfigError) {
      console.error("[api/analyze] ANTHROPIC_API_KEY is not configured.");
      return NextResponse.json(
        { error: "The analysis service is not available right now." },
        { status: 500 },
      );
    }
    console.error("[api/analyze] Scoring call failed:", err);
    return NextResponse.json(
      { error: "The analysis service is busy right now. Use the Retry button to try this text again." },
      { status: 502 },
    );
  }

  // --- validate and compute the score ---
  const validated = validateAndComputeScore(scoringCallResult.text, words);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validated.error },
      { status: validated.status },
    );
  }

  // --- parse the extraction ---
  let extraction: ExtractionResult;
  if (extractionDegraded || !extractionCallResult) {
    extraction = emptyExtraction();
    extractionDegraded = true;
  } else {
    const parsed = parseExtraction(extractionCallResult.text);
    if (parsed) {
      extraction = parsed;
    } else {
      console.warn(
        "[api/analyze] Extraction JSON failed validation, degrading:",
        extractionCallResult.text.slice(0, 500),
      );
      extraction = emptyExtraction();
      extractionDegraded = true;
    }
  }

  // --- assemble the result ---
  const result: AnalysisResult = {
    score: validated.result,
    extraction,
    meta: {
      wordCount: words,
      analyzedAt: new Date().toISOString(),
      usage: buildUsage(scoringCallResult, extractionCallResult),
      ...(extractionDegraded ? { extractionDegraded: true } : {}),
    },
  };

  return NextResponse.json(result, { status: 200 });
}
