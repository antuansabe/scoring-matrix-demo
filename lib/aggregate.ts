/**
 * Monthly aggregation math. Pure functions only — no I/O, no React —
 * mirrors lib/compare.ts.
 *
 * ⚠️  PROVISIONAL — aggregation method (simple mean) awaits Giselle's
 * validation. See docs/PREGUNTAS_METODOLOGIA_GISELLE.md questions #2
 * and #6. The mechanism is wired and the math is correct for its chosen
 * method, but the METHOD ITSELF is an open framework decision, not a
 * settled one. Do not present aggregates to leadership as final until
 * Giselle confirms or adjusts. This note must stay until she does.
 *
 * Groups a subject's analyses by the MONTH of entry_date (the MATERIAL
 * date, not created_at — §1b resolved semantics), so a JJ Partner is read
 * at each moment through ALL of that month's materials — website, reports,
 * interviews — rather than a single text. Each text keeps its own score;
 * the month adds an aggregate reading on top.
 */
import type { DimensionKey, ParadigmName } from "@/lib/types";
import type { AnalysisWithEntry, MaterialGenre } from "@/lib/db/types";
import { resolveParadigmName } from "@/lib/paradigm";

/** "YYYY-MM", or UNKNOWN_MONTH when entry_date is malformed. */
export type MonthKey = string;

/**
 * Bucket for rows whose entry_date is not a valid YYYY-MM-DD prefix.
 * Never silently dropped — surfaced last and labeled, in the same spirit as
 * the model-version guardrail (anomalies warn visibly, never disappear).
 */
export const UNKNOWN_MONTH: MonthKey = "unknown";

export interface MonthlyAggregate {
  /** "2026-07" | UNKNOWN_MONTH. */
  month: MonthKey;
  entryCount: number;
  /** Mean enactment score, rounded to the nearest integer. */
  meanEnactment: number;
  /**
   * Band of the ROUNDED mean. Rounding happens BEFORE band resolution so
   * the number on screen and its paradigm can never disagree (a raw mean of
   * 19.5 displays as 20 and must read Sympathizer, not Spectator).
   */
  paradigm: ParadigmName;
  /** Mean of each dimension (0–4), rounded to one decimal. */
  meanDimensions: Record<DimensionKey, number>;
  /** Unique material genres, in order of first appearance within the month. */
  genres: MaterialGenre[];
  /** Unique model versions, in order of first appearance within the month. */
  modelVersions: string[];
  /**
   * Guardrail (Decision #3): true when the month mixes model versions —
   * the UI must warn visibly (CompareView posture), never compare silently.
   */
  mixedModelVersions: boolean;
  /** The month's analyses, preserving the caller's chronological order. */
  analyses: AnalysisWithEntry[];
}

/**
 * entry_date → "YYYY-MM" by string slice — never via new Date(), which
 * parses date-only strings as UTC midnight and can shift the month when
 * reformatted in a western timezone. Returns null when the value is not a
 * YYYY-MM-DD-prefixed string.
 */
export function monthKeyOf(entryDate: string): MonthKey | null {
  return /^\d{4}-\d{2}-\d{2}/.test(entryDate) ? entryDate.slice(0, 7) : null;
}

const DIMENSION_KEYS: DimensionKey[] = ["D1", "D2", "D3", "D4", "D5"];

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Shared aggregate fields — one math, whatever the grouping window. */
interface AggregateCore {
  entryCount: number;
  /** Mean enactment score, rounded to the nearest integer. */
  meanEnactment: number;
  /** Band of the ROUNDED mean — rounding happens BEFORE band resolution. */
  paradigm: ParadigmName;
  /** Mean of each dimension (0–4), rounded to one decimal. */
  meanDimensions: Record<DimensionKey, number>;
  /** Unique material genres, in order of first appearance. */
  genres: MaterialGenre[];
  /** Unique model versions, in order of first appearance. */
  modelVersions: string[];
  /** Guardrail (Decision #3): true when the set mixes model versions. */
  mixedModelVersions: boolean;
}

/**
 * The single source of the aggregate math (mean → round → band, dimension
 * means at one decimal) shared by the monthly bands and the overall subject
 * summary. Precondition: rows is non-empty.
 */
function aggregateCore(rows: AnalysisWithEntry[]): AggregateCore {
  const n = rows.length;

  const meanEnactment = Math.round(
    rows.reduce((sum, a) => sum + a.enactment_score, 0) / n,
  );

  const meanDimensions = {} as Record<DimensionKey, number>;
  for (const key of DIMENSION_KEYS) {
    const field = key.toLowerCase() as "d1" | "d2" | "d3" | "d4" | "d5";
    meanDimensions[key] = round1(
      rows.reduce((sum, a) => sum + a[field], 0) / n,
    );
  }

  const genres: MaterialGenre[] = [];
  const modelVersions: string[] = [];
  for (const a of rows) {
    if (!genres.includes(a.entry.genre)) genres.push(a.entry.genre);
    if (!modelVersions.includes(a.model_version)) {
      modelVersions.push(a.model_version);
    }
  }

  return {
    entryCount: n,
    meanEnactment,
    paradigm: resolveParadigmName(meanEnactment),
    meanDimensions,
    genres,
    modelVersions,
    mixedModelVersions: modelVersions.length > 1,
  };
}

/**
 * Groups analyses into monthly aggregates, sorted ascending by month
 * (lexicographic equals chronological for YYYY-MM keys), with the
 * UNKNOWN_MONTH bucket last. Within a month the caller's order is kept —
 * listAnalysesBySubject already returns entry_date asc, created_at asc.
 * Empty input → [].
 */
export function groupAnalysesByMonth(
  analyses: AnalysisWithEntry[],
): MonthlyAggregate[] {
  const buckets = new Map<MonthKey, AnalysisWithEntry[]>();
  for (const a of analyses) {
    const key = monthKeyOf(a.entry.entry_date) ?? UNKNOWN_MONTH;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(a);
    } else {
      buckets.set(key, [a]);
    }
  }

  const keys = [...buckets.keys()].sort((a, b) => {
    if (a === UNKNOWN_MONTH) return 1;
    if (b === UNKNOWN_MONTH) return -1;
    return a < b ? -1 : 1;
  });

  return keys.map((month) => {
    const rows = buckets.get(month) as AnalysisWithEntry[];
    return { month, ...aggregateCore(rows), analyses: rows };
  });
}

/**
 * Overall reading across ALL of a subject's analyses — same PROVISIONAL
 * simple-mean method as the monthly bands (see the note at the top of this
 * file; it applies here in full).
 */
export interface OverallAggregate extends AggregateCore {
  /** Count per genre, in order of first appearance. */
  genreCounts: { genre: MaterialGenre; count: number }[];
  /** Earliest valid entry_date (YYYY-MM-DD), or null when none is valid. */
  earliestDate: string | null;
  /** Latest valid entry_date (YYYY-MM-DD), or null when none is valid. */
  latestDate: string | null;
}

/**
 * Aggregates a subject's full corpus into one overall reading. Shares
 * aggregateCore with groupAnalysesByMonth — identical mean/round/band rules.
 * Malformed entry_dates still count toward entryCount and genreCounts but
 * never extend the date range (validity gate: monthKeyOf). Empty input → null.
 */
export function aggregateOverall(
  analyses: AnalysisWithEntry[],
): OverallAggregate | null {
  if (analyses.length === 0) return null;

  const genreCounts: { genre: MaterialGenre; count: number }[] = [];
  let earliestDate: string | null = null;
  let latestDate: string | null = null;

  for (const a of analyses) {
    const existing = genreCounts.find((g) => g.genre === a.entry.genre);
    if (existing) {
      existing.count += 1;
    } else {
      genreCounts.push({ genre: a.entry.genre, count: 1 });
    }

    if (monthKeyOf(a.entry.entry_date) !== null) {
      const date = a.entry.entry_date.slice(0, 10);
      if (earliestDate === null || date < earliestDate) earliestDate = date;
      if (latestDate === null || date > latestDate) latestDate = date;
    }
  }

  return { ...aggregateCore(analyses), genreCounts, earliestDate, latestDate };
}

/**
 * Localized month header label ("July 2026" / "julio de 2026"). Builds the
 * Date via Date.UTC and formats with timeZone: "UTC" so the label can never
 * shift across a month boundary. Returns the raw key for UNKNOWN_MONTH —
 * the caller substitutes an i18n label.
 */
export function formatMonthLabel(month: MonthKey, locale: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return month;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
