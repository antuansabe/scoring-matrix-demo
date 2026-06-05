import { PARADIGM_NAMES, getGenreWeightExplanation, GENRE_WEIGHTS } from "@/lib/paradigm";
import type { ScoreResult, GenreTag } from "@/lib/types";
import { CountUpNumber } from "@/components/CountUpNumber";

/**
 * Headline of a result: Enactment Score (large, Fraunces), paradigm name and
 * descriptor, the EACH orientation as a mono tag, and any word-count /
 * confidence flags. Works with any ScoreResult — a sample's expert scores or a
 * live analysis.
 */
export function ScoreCard({
  result,
  accentColor = "#C41425",
  animateScore = true,
  onGenreChange,
}: {
  result: ScoreResult;
  accentColor?: string;
  animateScore?: boolean;
  onGenreChange?: (genre: GenreTag) => void;
}) {
  const paradigm = PARADIGM_NAMES.find((p) => p.name === result.paradigmName);
  const hasFlags =
    result.wordCountWarnings.length > 0 || result.confidenceFlags.length > 0;

  const activeGenre = result.effectiveGenreTag || result.genreTag;

  return (
    <div
      className="border border-border bg-surface p-5 sm:p-6 lg:p-8"
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
    >
      {/* Genre Selector / Display header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4 mb-4">
        {onGenreChange ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              Genre Tag:
            </span>
            <select
              value={activeGenre}
              onChange={(e) => onGenreChange(e.target.value as GenreTag)}
              className="border border-border bg-bg px-2 py-1 font-mono text-xs uppercase tracking-wider text-ink focus:outline-none"
            >
              {Object.keys(GENRE_WEIGHTS).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Genre · {result.genreTag}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {result.genreOverridden ? (
            <>
              <span className="line-through text-muted/60 font-mono text-xs uppercase tracking-widest">
                Detected: {result.detectedGenreTag}
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-widest bg-accent text-white px-2 py-0.5 font-medium rounded-sm">
                Genre adjusted by user
              </span>
            </>
          ) : (
            <span className="font-mono text-xs uppercase tracking-widest text-muted/60">
              Detected: {result.detectedGenreTag || result.genreTag}
            </span>
          )}
        </div>
      </div>

      <p className="font-sans text-xs text-muted italic -mt-2 mb-4">
        {getGenreWeightExplanation(activeGenre, "en")}
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <CountUpNumber
          value={result.enactmentScore}
          animate={animateScore}
          className="font-display text-[64px] font-normal leading-none text-ink sm:text-[80px] lg:text-[96px]"
        />
        <span className="font-mono text-sm text-muted">/ 100</span>
      </div>
      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
        Enactment Score
      </p>

      <p className="mt-3 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
        {result.paradigmName}
      </p>
      {paradigm && (
        <p className="mt-1 max-w-prose font-sans text-sm italic leading-relaxed text-muted">
          {paradigm.descriptor}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          EACH Orientation
        </span>
        <span
          className="border px-3 py-1 font-mono text-xs uppercase tracking-widest text-ink"
          style={{ borderColor: accentColor }}
        >
          {result.eachOrientation}
        </span>
      </div>

      {hasFlags && (
        <div className="mt-4 space-y-1.5 border-t border-border pt-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Flags
          </p>
          {result.wordCountWarnings.length > 0 && (
            <p className="font-mono text-xs uppercase tracking-widest text-ink">
              <span
                className="mr-2 inline-block h-2 w-2 align-middle"
                style={{ backgroundColor: accentColor }}
                aria-hidden="true"
              />
              Below threshold on: {result.wordCountWarnings.join(", ")}
            </p>
          )}
          {result.confidenceFlags.map((flag, i) => (
            <p key={i} className="font-sans text-xs text-muted">
              {flag}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
