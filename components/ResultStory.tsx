"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { ScoreResult } from "@/lib/types";
import { PARADIGM_NAMES } from "@/lib/paradigm";
import { Term } from "@/components/Term";

// Recharts (~316KB chunk) loads only when a result actually renders — it was
// already mount-gated inside RadarProfile, so ssr:false is behavior-identical
// (Phase 11b, justified by docs/PERFORMANCE.md baseline). The placeholder
// mirrors the chart card's box so nothing shifts when the chunk arrives.
const RadarProfile = dynamic(
  () => import("@/components/RadarProfile").then((m) => m.RadarProfile),
  {
    ssr: false,
    loading: () => (
      <div className="border border-border bg-surface p-4 sm:p-6 lg:p-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">&nbsp;</p>
        <div className="h-[280px] w-full sm:h-[320px] lg:h-[340px]" />
      </div>
    ),
  },
);

/**
 * Story-first lead for an analysis result (Phase 9, progressive disclosure).
 * Leads with what the reading MEANS — paradigm name, one plain paragraph,
 * the radar — before any numbers.
 */
export function ResultStory({ result }: { result: ScoreResult }) {
  const t = useTranslations();
  const paradigm = PARADIGM_NAMES.find((p) => p.name === result.paradigmName);
  const range = paradigm ? `${paradigm.scoreRange[0]}–${paradigm.scoreRange[1]}` : "";

  return (
    <div className="space-y-8">
      <div className="border border-border bg-surface p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {t("resultStory.eyebrow")}
        </p>
        <h2 className="mt-4 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
          <Term k="paradigm">{result.paradigmName}</Term>
        </h2>
        <p className="mt-4 max-w-[60ch] font-sans text-base leading-relaxed text-ink">
          {t(`paradigmMeanings.${result.paradigmName}`)}
        </p>
        <p className="mt-4 font-sans text-base leading-relaxed text-muted">
          {t.rich("resultStory.scoreSentence", {
            score: result.enactmentScore,
            paradigm: result.paradigmName,
            range,
            term: () => <Term k="enactmentScore">Enactment Score</Term>,
          })}
        </p>
        <p className="mt-5 border-t border-border pt-4 font-sans text-base italic leading-relaxed text-muted">
          {t("notAVerdict")}
        </p>
      </div>

      <RadarProfile result={result} />
    </div>
  );
}
