import { DIMENSIONS } from "@/lib/paradigm";
import type { ScoreResult } from "@/lib/types";

/**
 * Per-dimension justification with the verbatim quotes the score is built on.
 * (CLAUDE.md calls this JustificationQuotes; some prompts call it the
 * "JustificationPanel" — same component.) Renders full-width.
 */
export function JustificationQuotes({
  result,
  accentColor = "#C44536",
}: {
  result: ScoreResult;
  accentColor?: string;
}) {
  return (
    <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
      <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
        Per-dimension reading
      </p>
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
        {DIMENSIONS.map((d) => {
          const { score, justification, quotes } = result.dimensions[d.key];
          return (
            <div key={d.key}>
              <p className="font-mono text-xs uppercase tracking-widest text-ink">
                {d.key} · {d.fullName} · Score {score}/4
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-ink">
                {justification}
              </p>
              {quotes.length > 0 && (
                <>
                  <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
                    Quoted from the text
                  </p>
                  <ul className="mt-1.5 space-y-2">
                    {quotes.map((quote, i) => (
                      <li
                        key={i}
                        className="border-l-2 pl-4 font-sans text-sm italic leading-relaxed text-muted"
                        style={{ borderColor: accentColor }}
                      >
                        “{quote}”
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
