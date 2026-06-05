import { DIMENSIONS, GENRE_WEIGHTS } from "@/lib/paradigm";
import type { ScoreResult } from "@/lib/types";

// A dimension's individual 0–4 score carries the same paradigm naming as the
// overall band (docs/SCORING_MODEL.md).
const LEVEL_NAMES = [
  "Spectator",
  "Sympathizer",
  "Contributor",
  "Changemaker",
  "System Architect",
] as const;

/**
 * Five rows — one per dimension — showing score, the genre-adjusted weight,
 * and the points each dimension contributes to the 0–100 Enactment Score.
 */
export function ScoreBreakdown({
  result,
  accentColor = "#C41425",
}: {
  result: ScoreResult;
  accentColor?: string;
}) {
  const weights = GENRE_WEIGHTS[result.genreTag];
  const formulaScore = Math.round(
    DIMENSIONS.reduce(
      (sum, d, i) => sum + result.dimensions[d.key].score * weights[i],
      0,
    ) * 25,
  );

  return (
    <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
      <p className="mb-5 font-mono text-xs uppercase tracking-widest text-muted">
        Score Breakdown · weights for {result.genreTag}
      </p>
      <ul className="space-y-5">
        {DIMENSIONS.map((d, i) => {
          const score = result.dimensions[d.key].score;
          const clamped = Math.min(4, Math.max(0, Math.round(score)));
          const weightPct = Math.round(weights[i] * 100);
          const contribution = Math.round(score * weights[i] * 25 * 10) / 10;
          return (
            <li key={d.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <span className="font-mono text-xs uppercase tracking-widest text-ink">
                  {d.key} · {d.fullName}
                </span>
                <span className="shrink-0 font-mono text-xs text-muted">
                  weight {weightPct}% · +{contribution.toFixed(1)} pts
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 sm:gap-4">
                <div className="relative h-2 flex-1 bg-bg">
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${(score / 4) * 100}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                  {[1, 2, 3].map((tick) => (
                    <div
                      key={tick}
                      className="absolute inset-y-0 w-px bg-surface"
                      style={{ left: `${(tick / 4) * 100}%` }}
                    />
                  ))}
                </div>
                <span className="w-6 text-right font-display text-2xl font-normal leading-none text-ink">
                  {score}
                </span>
              </div>
              <p className="mt-1 font-sans text-xs text-muted">
                {LEVEL_NAMES[clamped]}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 space-y-2 border-t border-border pt-4">
        <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
          {formulaScore === result.enactmentScore
            ? `Formula yields ${formulaScore}`
            : `Formula yields ${formulaScore} · Expert score: ${result.enactmentScore}`}
        </p>
        {formulaScore !== result.enactmentScore && (
          <p className="font-mono text-[0.7rem] leading-relaxed text-muted">
            Expert pre-scores reflect qualitative judgment beyond the weighted
            formula. The divergence is intentional and is one of the open
            methodological questions for v0.2.
          </p>
        )}
      </div>
    </div>
  );
}
