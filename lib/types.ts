/**
 * Core types for the Changemaker Paradigm Scoring Matrix demo.
 * Shapes mirror docs/SCORING_MODEL.md and docs/SYSTEM_PROMPT.md exactly.
 */

/** The five scoring dimensions. */
export type DimensionKey = "D1" | "D2" | "D3" | "D4" | "D5";

/** The six recognized genre tags (docs/SYSTEM_PROMPT.md). */
export type GenreTag =
  | "free-form-interview"
  | "structured-profile"
  | "social-media-post"
  | "institutional-report"
  | "speech-public-address"
  | "fundraising-copy";

/** Paradigm name by Enactment Score band (docs/SCORING_MODEL.md). */
export type ParadigmName =
  | "Spectator"
  | "Sympathizer"
  | "Contributor"
  | "Changemaker"
  | "System Architect";

/**
 * EACH Orientation: one of the five canonical values, or — in the documented
 * overlap case — a free-form "X / Y" string combining two of them.
 */
export type EACHOrientation =
  | "Youth in Charge"
  | "Interconnected Teams"
  | "Empathy-based Societies"
  | "Full EACH Alignment"
  | "Emerging"
  // `string & {}` keeps the literal members visible in editor autocomplete
  // while still admitting the documented dual "X / Y" orientation string.
  | (string & {});

/** A single dimension's score, with its justification and supporting quotes. */
export type DimensionScore = {
  score: number;
  justification: string;
  quotes: string[];
};

/** The structured output returned by the live scorer (docs/SYSTEM_PROMPT.md). */
export type ScoreResult = {
  genreTag: GenreTag;
  wordCount: number;
  dimensions: Record<DimensionKey, DimensionScore>;
  enactmentScore: number;
  paradigmName: ParadigmName;
  eachOrientation: EACHOrientation;
  wordCountWarnings: string[];
  confidenceFlags: string[];
};

/** A pre-scored anchor sample (docs/SAMPLES.md). */
export type Sample = {
  id: string;
  title: string;
  subtitle: string;
  /** 0–4 */
  paradigmLevel: number;
  paradigmName: ParadigmName;
  genreTag: GenreTag;
  /** Hex color string */
  accentColor: string;
  excerpt: string;
  expectedEnactmentScore: number;
  expectedEACHOrientation: string;
  expertScores: Record<DimensionKey, DimensionScore>;
};

// ---------------------------------------------------------------------------
// Extraction & Analysis types (Phase 2 — batch pipeline / /api/analyze)
// ---------------------------------------------------------------------------

/** Hello World shifts — 4 arrays of verbatim quotes from the text. */
export type HelloWorldShifts = {
  shift1_contribution: string[];
  shift2_sharedExperience: string[];
  shift3_valueOfContributions: string[];
  shift4_fluidCommunities: string[];
};

/** Structured extraction output (extractor prompt, schemaVersion 1). */
export type ExtractionResult = {
  schemaVersion: number;
  actors: string[];
  problemQuotes: string[];
  solutionQuotes: string[];
  geography: string[];
  helloWorldShifts: HelloWorldShifts;
};

/** Token usage for cost tracking (both calls combined). */
export type AnalysisUsage = {
  totalInputTokens: number;
  totalOutputTokens: number;
  scoringInputTokens: number;
  scoringOutputTokens: number;
  extractionInputTokens: number;
  extractionOutputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
};

/** Combined scoring + extraction result (returned by /api/analyze). */
export type AnalysisResult = {
  score: ScoreResult;
  extraction: ExtractionResult;
  meta: {
    slug?: string;
    wordCount: number;
    analyzedAt: string;
    usage: AnalysisUsage;
    /** True when extraction failed and was degraded to empty arrays. */
    extractionDegraded?: boolean;
  };
};

