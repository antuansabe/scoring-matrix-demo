import { callClaudeWithCachedSystem } from "@/lib/anthropic";
import { FEEDBACK_SYSTEM_PROMPT } from "@/lib/prompts/feedback";
import type { AppLocale } from "@/i18n/config";
import type {
  DimensionKey,
  DimensionScore,
  FeedbackObservation,
  FeedbackResult,
  FeedbackStrength,
  GenreTag,
} from "@/lib/types";

// Thrown when the model response cannot be parsed into a FeedbackResult.
// Route handlers should map this to a 502 response.
export class FeedbackParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackParseError";
  }
}

/**
 * Whose discourse the text is — steers the card's voice and address only
 * (see the SUBJECT VOICE prompt section), never what is measured. Absent
 * means individual, the instrument's original behavior.
 */
export type SubjectVoice = "individual" | "organization";

export type GenerateFeedbackOpts = {
  text: string;
  scores: Record<DimensionKey, DimensionScore>;
  genre: GenreTag;
  crossGenreContext?: string;
  subjectVoice?: SubjectVoice;
  /**
   * UI locale the card should be written in (§1b, resolved 2026-07-07).
   * Defaults to "en", which keeps the user message byte-identical to the
   * pre-wiring behavior — the directive is only injected for "es". The
   * system prompt (cached) never changes.
   */
  locale?: AppLocale;
};

const DIMENSION_NAMES: Record<DimensionKey, string> = {
  D1: "Agency & Contribution",
  D2: "Systemic & Architectural Framing",
  D3: "Empathy Enactment",
  D4: "Collaboration & Leadership",
  D5: "Identity Embodiment",
};

const DIMENSION_ORDER: DimensionKey[] = ["D1", "D2", "D3", "D4", "D5"];

/** Assemble the user-turn message that carries the text + scoring context. */
function buildUserMessage(
  text: string,
  scores: Record<DimensionKey, DimensionScore>,
  genre: GenreTag,
  crossGenreContext?: string,
  subjectVoice?: SubjectVoice,
  locale: AppLocale = "en",
): string {
  const scoreLines = DIMENSION_ORDER.map((key) => {
    const d = scores[key];
    const quoteLines = d.quotes.length
      ? "\n" + d.quotes.map((q) => `  • "${q}"`).join("\n")
      : "";
    return (
      `${key} ${DIMENSION_NAMES[key]} — Score: ${d.score}/4\n` +
      `  Justification: ${d.justification}${quoteLines}`
    );
  }).join("\n\n");

  const crossSection = crossGenreContext
    ? `\n\n---\n\nCROSS-GENRE CONTEXT:\n${crossGenreContext}`
    : "";

  // Only injected for organizations, so the individual path's user message
  // stays byte-identical to pre-Phase-6 behavior.
  const voiceSection =
    subjectVoice === "organization"
      ? `\n\n---\n\nSUBJECT VOICE: ORGANIZATION — this text is institutional discourse issued in a collective voice; there is no individual narrator.`
      : "";

  // Only injected for Spanish, so all English traffic stays byte-identical
  // to the pre-wiring behavior (same precedent as voiceSection). The
  // textAnchor clause is load-bearing: quotes must stay verbatim in the
  // analyzed text's own language, never translated.
  const languageSection =
    locale === "es"
      ? `\n\n---\n\nOUTPUT LANGUAGE: Spanish. Write every JSON string value in natural Latin American Spanish. Keep the JSON keys in English exactly as specified. Keep the instrument's terms of art in English (Enactment Score, the D1–D5 dimension names, paradigm names, EACH values, Lens A). textAnchor values and any quoted phrases MUST remain verbatim from the analyzed text, in the text's original language — never translate quotes.`
      : "";

  return (
    `TEXT (genre: ${genre}):\n${text}\n\n` +
    `---\n\n` +
    `SCORING RESULTS (anchor your feedback to these structural observations — ` +
    `do not reproduce them verbatim):\n${scoreLines}` +
    crossSection +
    voiceSection +
    languageSection +
    `\n\nGenerate the feedback analysis JSON.`
  );
}

// ---------------------------------------------------------------------------
// Defensive parse helpers
// ---------------------------------------------------------------------------

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function toObservations(v: unknown): FeedbackObservation[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
    .map((x) => ({ observation: str(x.observation), textAnchor: str(x.textAnchor) }));
}

function toStrengths(v: unknown): FeedbackStrength[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
    .map((x) => ({
      gap: str(x.gap),
      whyItMatters: str(x.whyItMatters),
      reframe: str(x.reframe),
    }));
}

/**
 * Parse and validate the model's raw text into a FeedbackResult.
 * Throws FeedbackParseError if the response cannot be parsed or is missing
 * the required top-level structure.
 */
function parseFeedback(raw: string): FeedbackResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new FeedbackParseError(
      "Feedback response is not valid JSON. Raw: " + raw.slice(0, 300),
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new FeedbackParseError("Feedback response is not a JSON object.");
  }
  const o = parsed as Record<string, unknown>;

  const sum = o.summary;
  if (typeof sum !== "object" || sum === null) {
    throw new FeedbackParseError("Feedback response missing required 'summary' object.");
  }
  const s = sum as Record<string, unknown>;

  const fb = o.feedback;
  if (typeof fb !== "object" || fb === null) {
    throw new FeedbackParseError("Feedback response missing required 'feedback' object.");
  }
  const f = fb as Record<string, unknown>;

  return {
    schemaVersion: "1.0",
    summary: {
      keyMessages: str(s.keyMessages),
      whoActs: str(s.whoActs),
      theProblem: str(s.theProblem),
      theSolution: str(s.theSolution),
    },
    feedback: {
      whatWorksWell: toObservations(f.whatWorksWell),
      howToStrengthen: toStrengths(f.howToStrengthen),
    },
    question: str(o.question),
    crossGenre: typeof o.crossGenre === "string" ? o.crossGenre : null,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Call the Feedback Analyst and return a structured FeedbackResult.
 *
 * - Model: claude-sonnet-4-6
 * - Temperature: 0
 * - Ephemeral prompt caching: yes (via callClaudeWithCachedSystem)
 * - Retries: up to 4 attempts with exponential back-off (handled by anthropic.ts)
 *
 * Throws AnthropicConfigError if the API key is missing, FeedbackParseError
 * if the response cannot be parsed, or a raw SDK error on unrecoverable failure.
 */
export async function generateFeedback(
  opts: GenerateFeedbackOpts,
): Promise<FeedbackResult> {
  const { text, scores, genre, crossGenreContext, subjectVoice, locale = "en" } = opts;

  const { text: rawJson } = await callClaudeWithCachedSystem({
    model: "claude-sonnet-4-6",
    systemPrompt: FEEDBACK_SYSTEM_PROMPT,
    userMessage: buildUserMessage(text, scores, genre, crossGenreContext, subjectVoice, locale),
    maxTokens: 2500,
    temperature: 0,
  });

  return { ...parseFeedback(rawJson), language: locale };
}
