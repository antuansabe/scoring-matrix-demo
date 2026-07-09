/**
 * Longitudinal comparison math (Phase 4). Pure functions only — no I/O, no
 * React — mirrors the style of lib/paradigm.ts. Operates on two analyses for
 * the SAME subject; the caller is responsible for that scoping (see
 * components/CompareView.tsx, which only ever selects from one subject's
 * already-fetched analyses).
 */
import type { DimensionKey } from "@/lib/types";
import type { Analysis } from "@/lib/db/types";

/**
 * Enactment Score deltas smaller than this (either direction) are read as
 * stable rather than real movement. Two independent model calls on similar
 * material can easily differ by a few points of ordinary scoring variance;
 * paradigm bands are ~20 points wide, so ±5 is roughly a quarter-band —
 * small enough to catch real shifts, large enough to filter out noise.
 */
export const STABLE_THRESHOLD = 5;

export type NarrativeDirection = "higher" | "lower" | "stable";

export const NARRATIVE_DIRECTION_LABELS: Record<NarrativeDirection, string> = {
  higher: "Toward Higher Changemaker Density",
  lower: "Toward Lower Changemaker Density",
  stable: "Stable",
};

/** The subset of an Analysis row the delta math actually needs. */
export type ScoredAnalysis = Pick<Analysis, "d1" | "d2" | "d3" | "d4" | "d5" | "enactment_score">;

const DIMENSION_KEYS: DimensionKey[] = ["D1", "D2", "D3", "D4", "D5"];
const FIELD_BY_KEY: Record<DimensionKey, "d1" | "d2" | "d3" | "d4" | "d5"> = {
  D1: "d1",
  D2: "d2",
  D3: "d3",
  D4: "d4",
  D5: "d5",
};

export function getDimensionScore(a: ScoredAnalysis, key: DimensionKey): number {
  return a[FIELD_BY_KEY[key]];
}

/** t2 - t1 for each dimension, signed, range -4..+4. */
export function computeDimensionDeltas(
  t1: ScoredAnalysis,
  t2: ScoredAnalysis,
): Record<DimensionKey, number> {
  const deltas = {} as Record<DimensionKey, number>;
  for (const key of DIMENSION_KEYS) {
    deltas[key] = getDimensionScore(t2, key) - getDimensionScore(t1, key);
  }
  return deltas;
}

/** t2 - t1, signed, range -100..+100. */
export function computeEnactmentDelta(t1: ScoredAnalysis, t2: ScoredAnalysis): number {
  return t2.enactment_score - t1.enactment_score;
}

export function resolveNarrativeDirection(enactmentDelta: number): NarrativeDirection {
  if (enactmentDelta >= STABLE_THRESHOLD) return "higher";
  if (enactmentDelta <= -STABLE_THRESHOLD) return "lower";
  return "stable";
}

/** Shape needed to order two records chronologically. */
export type Dated = { entry: { entry_date: string }; created_at: string };

// Fixed-width entry_date ("YYYY-MM-DD") as a string prefix makes this a valid
// chronological sort key on its own; created_at only breaks ties between
// same-date entries (e.g. Decision #6's same-day, different-genre case).
export function chronoKey(a: Dated): string {
  return `${a.entry.entry_date}T${a.created_at}`;
}

/**
 * Orders two dated records chronologically as [earlier, later] — used
 * anywhere t1/t2 must be read chronologically regardless of which UI slot
 * or API argument position the caller assigned them to.
 */
export function orderChronologically<T extends Dated>(a: T, b: T): [T, T] {
  return chronoKey(a) <= chronoKey(b) ? [a, b] : [b, a];
}
