"use client";

import type { ScoreResult } from "@/lib/types";
import { PARADIGM_NAMES } from "@/lib/paradigm";
import { PARADIGM_MEANINGS, NOT_A_VERDICT } from "@/lib/copy/glossary";
import { Term } from "@/components/Term";
import { RadarProfile } from "@/components/RadarProfile";

/**
 * Story-first lead for an analysis result (Phase 9, progressive disclosure).
 * Leads with what the reading MEANS — paradigm name, one plain paragraph,
 * the radar — before any numbers. The full expert detail lives behind the
 * Disclosure that follows this component in LiveAnalyzer.
 */
export function ResultStory({ result }: { result: ScoreResult }) {
  const paradigm = PARADIGM_NAMES.find((p) => p.name === result.paradigmName);
  const range = paradigm ? `${paradigm.scoreRange[0]}–${paradigm.scoreRange[1]}` : "";

  return (
    <div className="space-y-8">
      <div className="border border-border bg-surface p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          What this reading says
        </p>
        <h2 className="mt-4 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
          <Term k="paradigm">{result.paradigmName}</Term>
        </h2>
        <p className="mt-4 max-w-[60ch] font-sans text-base leading-relaxed text-ink">
          {PARADIGM_MEANINGS[result.paradigmName]}
        </p>
        <p className="mt-4 font-sans text-base leading-relaxed text-muted">
          Its <Term k="enactmentScore">Enactment Score</Term> is {result.enactmentScore} out of 100
          — the {result.paradigmName} range ({range}).
        </p>
        <p className="mt-5 border-t border-border pt-4 font-sans text-base italic leading-relaxed text-muted">
          {NOT_A_VERDICT}
        </p>
      </div>

      <RadarProfile result={result} />
    </div>
  );
}
