/**
 * Exercises lib/aggregate.ts against synthetic fixtures — no env, no network.
 *
 *   npx tsx scripts/verify-aggregate.ts
 *
 * Throws (exit 1) on the first failed assertion; prints a ✓ line per case.
 * Covers the cases the live demo data cannot: multi-entry months, the
 * round-before-band boundary, mixed model versions, and malformed dates.
 */
import {
  groupAnalysesByMonth,
  aggregateOverall,
  formatMonthLabel,
  monthKeyOf,
  UNKNOWN_MONTH,
} from "@/lib/aggregate";
import type { AnalysisWithEntry, MaterialGenre } from "@/lib/db/types";
import type { FeedbackResult } from "@/lib/types";

let counter = 0;

const DUMMY_FEEDBACK: FeedbackResult = {
  schemaVersion: "1.0",
  summary: { keyMessages: "", whoActs: "", theProblem: "", theSolution: "" },
  feedback: { whatWorksWell: [], howToStrengthen: [] },
  question: "",
  crossGenre: null,
};

function mk(
  entryDate: string,
  score: number,
  opts: {
    dims?: [number, number, number, number, number];
    genre?: MaterialGenre;
    modelVersion?: string;
  } = {},
): AnalysisWithEntry {
  const [d1, d2, d3, d4, d5] = opts.dims ?? [2, 2, 2, 2, 2];
  counter += 1;
  return {
    id: `analysis-${counter}`,
    entry_id: `entry-${counter}`,
    enactment_score: score,
    d1,
    d2,
    d3,
    d4,
    d5,
    each_orientation: "Emerging",
    lens_a_tag: null,
    lens_b_flag: null,
    feedback_card: DUMMY_FEEDBACK,
    model_version: opts.modelVersion ?? "test-v1",
    created_at: "2026-07-07T00:00:00Z",
    entry: {
      subject_id: "subject-1",
      entry_date: entryDate,
      genre: opts.genre ?? "report",
      ashokan_name: "QA",
      contextual_notes: null,
    },
  };
}

function assert(condition: boolean, label: string): void {
  if (!condition) {
    console.error(`✗ ${label}`);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
}

// 1. Empty input
assert(groupAnalysesByMonth([]).length === 0, "empty input → []");

// 2. Single-entry month equals the entry
{
  const [m] = groupAnalysesByMonth([mk("2026-07-04", 30)]);
  assert(
    m.month === "2026-07" &&
      m.entryCount === 1 &&
      m.meanEnactment === 30 &&
      m.paradigm === "Sympathizer" &&
      !m.mixedModelVersions,
    "single entry → aggregate equals the entry (30 · Sympathizer)",
  );
}

// 3. Round-before-band boundary: number shown and band must agree
{
  const [low] = groupAnalysesByMonth([mk("2026-07-01", 18), mk("2026-07-20", 20)]);
  assert(
    low.meanEnactment === 19 && low.paradigm === "Spectator",
    "18 & 20 → mean 19 → Spectator",
  );
  const [high] = groupAnalysesByMonth([mk("2026-07-01", 19), mk("2026-07-20", 20)]);
  assert(
    high.meanEnactment === 20 && high.paradigm === "Sympathizer",
    "19 & 20 → mean 19.5 → rounds to 20 → Sympathizer (round-before-band)",
  );
}

// 4. Dimension means at one decimal
{
  const [m] = groupAnalysesByMonth([
    mk("2026-07-01", 50, { dims: [1, 0, 4, 2, 3] }),
    mk("2026-07-10", 50, { dims: [2, 0, 4, 3, 3] }),
    mk("2026-07-20", 50, { dims: [2, 0, 4, 3, 3] }),
  ]);
  assert(
    m.meanDimensions.D1 === 1.7 &&
      m.meanDimensions.D2 === 0 &&
      m.meanDimensions.D3 === 4 &&
      m.meanDimensions.D4 === 2.7 &&
      m.meanDimensions.D5 === 3,
    "dimension means round to one decimal (1.7 / 0 / 4 / 2.7 / 3)",
  );
}

// 5. Mixed model versions flag (guardrail)
{
  const [m] = groupAnalysesByMonth([
    mk("2026-07-01", 40, { modelVersion: "v1" }),
    mk("2026-07-15", 60, { modelVersion: "v2" }),
  ]);
  assert(
    m.mixedModelVersions &&
      m.modelVersions.length === 2 &&
      m.modelVersions[0] === "v1" &&
      m.modelVersions[1] === "v2",
    "mixed model versions within a month → flag raised, versions listed",
  );
  const [clean] = groupAnalysesByMonth([
    mk("2026-08-01", 40, { modelVersion: "v1" }),
    mk("2026-08-15", 60, { modelVersion: "v1" }),
  ]);
  assert(!clean.mixedModelVersions, "uniform model version → no flag");
}

// 6. Ordering with an unknown bucket — nothing dropped
{
  const months = groupAnalysesByMonth([
    mk("2026-07-15", 50),
    mk("garbage", 10),
    mk("2026-06-01", 40),
  ]);
  assert(
    months.length === 3 &&
      months[0].month === "2026-06" &&
      months[1].month === "2026-07" &&
      months[2].month === UNKNOWN_MONTH &&
      months[2].entryCount === 1,
    "ascending months, malformed date bucketed last, nothing dropped",
  );
}

// 7. Genres deduplicated in first-appearance order
{
  const [m] = groupAnalysesByMonth([
    mk("2026-07-01", 50, { genre: "website" }),
    mk("2026-07-05", 50, { genre: "report" }),
    mk("2026-07-09", 50, { genre: "website" }),
  ]);
  assert(
    m.genres.length === 2 && m.genres[0] === "website" && m.genres[1] === "report",
    "genres deduplicated, first-appearance order",
  );
}

// 8. monthKeyOf never uses Date parsing; boundary day stays in its month
assert(monthKeyOf("2026-07-01") === "2026-07", "monthKeyOf boundary: 2026-07-01 → 2026-07");
assert(monthKeyOf("07/01/2026") === null, "monthKeyOf rejects non-ISO dates");

// 9. Localized labels, UTC-pinned
{
  const en = formatMonthLabel("2026-07", "en");
  const es = formatMonthLabel("2026-07", "es");
  assert(en === "July 2026", `formatMonthLabel en → "${en}"`);
  assert(es.includes("julio") && es.includes("2026"), `formatMonthLabel es → "${es}"`);
  assert(formatMonthLabel(UNKNOWN_MONTH, "en") === UNKNOWN_MONTH, "unknown month label passes through");
}

// 10. aggregateOverall: empty input
assert(aggregateOverall([]) === null, "aggregateOverall empty input → null");

// 11. aggregateOverall: demo-subject fixture (Fundación Delta shape)
{
  const o = aggregateOverall([
    mk("2026-02-10", 30, { genre: "report", dims: [1, 1, 1, 2, 1] }),
    mk("2026-04-22", 48, { genre: "website", dims: [2, 2, 2, 2, 1] }),
    mk("2026-06-30", 66, { genre: "interview", dims: [3, 3, 2, 3, 2] }),
  ])!;
  assert(
    o.entryCount === 3 && o.meanEnactment === 48 && o.paradigm === "Contributor",
    "overall demo fixture → 3 texts, mean 48, Contributor",
  );
  assert(
    o.meanDimensions.D1 === 2 &&
      o.meanDimensions.D2 === 2 &&
      o.meanDimensions.D3 === 1.7 &&
      o.meanDimensions.D4 === 2.3 &&
      o.meanDimensions.D5 === 1.3,
    "overall dimension means at one decimal (2 / 2 / 1.7 / 2.3 / 1.3)",
  );
  assert(
    o.earliestDate === "2026-02-10" && o.latestDate === "2026-06-30",
    "overall date range earliest → latest (2026-02-10 → 2026-06-30)",
  );
  assert(
    !o.mixedModelVersions &&
      o.genreCounts.length === 3 &&
      o.genreCounts[0].genre === "report" && o.genreCounts[0].count === 1 &&
      o.genreCounts[1].genre === "website" && o.genreCounts[1].count === 1 &&
      o.genreCounts[2].genre === "interview" && o.genreCounts[2].count === 1,
    "overall genre counts in first-appearance order, no mixed flag",
  );
}

// 12. aggregateOverall: round-before-band across months (same rule as monthly)
{
  const o = aggregateOverall([mk("2026-07-01", 19), mk("2026-08-01", 20)])!;
  assert(
    o.meanEnactment === 20 && o.paradigm === "Sympathizer",
    "overall 19 & 20 across months → mean 19.5 → rounds to 20 → Sympathizer",
  );
}

// 13. aggregateOverall: genre counts accumulate in first-appearance order
{
  const o = aggregateOverall([
    mk("2026-07-01", 50, { genre: "website" }),
    mk("2026-07-05", 50, { genre: "report" }),
    mk("2026-07-09", 50, { genre: "website" }),
  ])!;
  assert(
    o.genreCounts.length === 2 &&
      o.genreCounts[0].genre === "website" && o.genreCounts[0].count === 2 &&
      o.genreCounts[1].genre === "report" && o.genreCounts[1].count === 1,
    "overall genre counts (website 2, report 1), first-appearance order",
  );
}

// 14. aggregateOverall: mixed model versions flag (guardrail)
{
  const o = aggregateOverall([
    mk("2026-07-01", 40, { modelVersion: "v1" }),
    mk("2026-08-15", 60, { modelVersion: "v2" }),
  ])!;
  assert(
    o.mixedModelVersions &&
      o.modelVersions.length === 2 &&
      o.modelVersions[0] === "v1" &&
      o.modelVersions[1] === "v2",
    "overall mixed model versions → flag raised, versions listed",
  );
}

// 15. aggregateOverall: malformed dates count but never extend the range
{
  const o = aggregateOverall([mk("garbage", 10), mk("2026-07-15", 50)])!;
  assert(
    o.entryCount === 2 &&
      o.meanEnactment === 30 &&
      o.earliestDate === "2026-07-15" &&
      o.latestDate === "2026-07-15",
    "overall malformed date counts toward mean, range from valid dates only",
  );
  const allBad = aggregateOverall([mk("garbage", 10)])!;
  assert(
    allBad !== null && allBad.earliestDate === null && allBad.latestDate === null,
    "overall all-malformed dates → aggregate exists, range null/null",
  );
}

// 16. aggregateOverall and groupAnalysesByMonth share the same core math
{
  const rows = [
    mk("2026-07-01", 33, { dims: [1, 2, 3, 4, 0] }),
    mk("2026-07-20", 48, { dims: [2, 2, 2, 1, 3] }),
  ];
  const o = aggregateOverall(rows)!;
  const [m] = groupAnalysesByMonth(rows);
  assert(
    o.meanEnactment === m.meanEnactment &&
      o.paradigm === m.paradigm &&
      o.meanDimensions.D1 === m.meanDimensions.D1 &&
      o.meanDimensions.D2 === m.meanDimensions.D2 &&
      o.meanDimensions.D3 === m.meanDimensions.D3 &&
      o.meanDimensions.D4 === m.meanDimensions.D4 &&
      o.meanDimensions.D5 === m.meanDimensions.D5,
    "single-month input → overall matches the monthly aggregate (shared core)",
  );
}

console.log("\nAll aggregate checks passed.");
