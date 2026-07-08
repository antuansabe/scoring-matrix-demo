"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { Subject, AnalysisWithEntry } from "@/lib/db/types";
import { DIMENSIONS, resolveParadigmName } from "@/lib/paradigm";
import {
  STABLE_THRESHOLD,
  computeDimensionDeltas,
  computeEnactmentDelta,
  getDimensionScore,
  resolveNarrativeDirection,
  orderChronologically,
} from "@/lib/compare";
import { ChangeNarrativeCard } from "@/components/ChangeNarrativeCard";
import { Disclosure } from "@/components/Disclosure";
import { Term } from "@/components/Term";
import type { GlossaryKey } from "@/lib/copy/glossary";

// Recharts (~316KB chunk) loads only when the overlaid radar renders — it was
// already mount-gated inside CompareRadar, so ssr:false is behavior-identical
// (Phase 11b, justified by docs/PERFORMANCE.md baseline). The placeholder
// mirrors the chart card's box so nothing shifts when the chunk arrives.
const CompareRadar = dynamic(
  () => import("@/components/CompareRadar").then((m) => m.CompareRadar),
  {
    ssr: false,
    loading: () => (
      <div className="border border-border bg-surface p-4 sm:p-6 lg:p-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">&nbsp;</p>
        <div className="h-[300px] w-full sm:h-[340px] lg:h-[380px]" />
      </div>
    ),
  },
);

const DIRECTION_GLYPH: Record<string, string> = {
  higher: "↑",
  lower: "↓",
  stable: "→",
};

function formatSigned(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

/**
 * Two-entry comparison for a single subject. Both selectors are populated
 * exclusively from this subject's own `analyses` (already scoped
 * server-side by listAnalysesBySubject) — there is no code path by which a
 * second subject's entry could ever be selected.
 */
export function CompareView({
  subject,
  analyses,
}: {
  subject: Subject;
  analyses: AnalysisWithEntry[];
}) {
  const t = useTranslations("compare");
  const tg = useTranslations("genres");
  const [entryAId, setEntryAId] = useState(analyses[0].entry_id);
  const [entryBId, setEntryBId] = useState(analyses[analyses.length - 1].entry_id);

  const selectedA = analyses.find((a) => a.entry_id === entryAId) ?? analyses[0];
  const selectedB = analyses.find((a) => a.entry_id === entryBId) ?? analyses[analyses.length - 1];

  // Always read t1 = earlier, t2 = later, regardless of which dropdown slot
  // the user assigned them to — so the delta sign is never backwards.
  const [t1, t2] = orderChronologically(selectedA, selectedB);

  const dimensionDeltas = computeDimensionDeltas(t1, t2);
  const enactmentDelta = computeEnactmentDelta(t1, t2);
  const direction = resolveNarrativeDirection(enactmentDelta);
  const modelMismatch = t1.model_version !== t2.model_version;

  const t1Scores = Object.fromEntries(DIMENSIONS.map((d) => [d.key, getDimensionScore(t1, d.key)])) as Record<
    (typeof DIMENSIONS)[number]["key"],
    number
  >;
  const t2Scores = Object.fromEntries(DIMENSIONS.map((d) => [d.key, getDimensionScore(t2, d.key)])) as Record<
    (typeof DIMENSIONS)[number]["key"],
    number
  >;

  return (
    <div className="space-y-8">
      {/* Entry selector — both options lists are `analyses`, this subject only */}
      <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {t.rich("comparing", { name: () => <span className="text-ink">{subject.name}</span> })}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-muted" htmlFor="entry-a">
              {t("entryA")}
            </label>
            <select
              id="entry-a"
              value={entryAId}
              onChange={(e) => setEntryAId(e.target.value)}
              className="mt-2 block w-full rounded-md border border-border bg-surface px-3 py-2 font-sans text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {analyses.map((a) => (
                <option key={a.entry_id} value={a.entry_id} disabled={a.entry_id === entryBId}>
                  {a.entry.entry_date} · {a.enactment_score}/100 · {tg(a.entry.genre)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-muted" htmlFor="entry-b">
              {t("entryB")}
            </label>
            <select
              id="entry-b"
              value={entryBId}
              onChange={(e) => setEntryBId(e.target.value)}
              className="mt-2 block w-full rounded-md border border-border bg-surface px-3 py-2 font-sans text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {analyses.map((a) => (
                <option key={a.entry_id} value={a.entry_id} disabled={a.entry_id === entryAId}>
                  {a.entry.entry_date} · {a.enactment_score}/100 · {tg(a.entry.genre)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-widest text-muted/70">
          {t("chronoNote", { t1: t1.entry.entry_date, t2: t2.entry.entry_date })}
        </p>
      </div>

      {/* Guardrail: model_version mismatch — full-width block, not a tooltip */}
      {modelMismatch && (
        <div
          className="border border-border bg-surface p-5 sm:p-6"
          style={{ borderLeftWidth: 4, borderLeftColor: "#E87722" }}
          role="alert"
        >
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink">
            <span
              className="mr-2 inline-block h-2 w-2 align-middle"
              style={{ backgroundColor: "#E87722" }}
              aria-hidden="true"
            />
            {t("mismatchTitle")}
          </p>
          <p className="mt-2 font-sans text-base leading-relaxed text-ink">
            {t.rich("mismatchBody", {
              t1Date: t1.entry.entry_date,
              t2Date: t2.entry.entry_date,
              t1Version: t1.model_version,
              t2Version: t2.model_version,
              name: subject.name,
              b: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </div>
      )}

      {/* Story first (Phase 9): the narrated shift leads; deltas and radar
          support it one labeled click below. The mismatch guardrail above is
          deliberately NOT inside the disclosure — it must be unmissable. */}
      <ChangeNarrativeCard key={`${t1.entry_id}-${t2.entry_id}`} entryId1={t1.entry_id} entryId2={t2.entry_id} />

      <Disclosure showLabel={t("seeNumbers")} hideLabel={t("hideNumbers")}>
      {/* Enactment score delta + narrative direction */}
      <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {t.rich("deltaEyebrow", { term: (chunks) => <Term k="enactmentScore">{chunks}</Term> })}
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-3">
          <span className="font-display text-[56px] font-normal leading-none text-ink sm:text-[64px]">
            {formatSigned(enactmentDelta)}
          </span>
          <span className="font-mono text-sm text-muted">
            {t("deltaLine", {
              t1Score: t1.enactment_score,
              t1Paradigm: resolveParadigmName(t1.enactment_score),
              t2Score: t2.enactment_score,
              t2Paradigm: resolveParadigmName(t2.enactment_score),
            })}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
          <span className="font-mono text-lg text-accent" aria-hidden="true">
            {DIRECTION_GLYPH[direction]}
          </span>
          <span className="font-mono text-sm font-semibold uppercase tracking-widest text-ink">
            {t(`direction_${direction}`)}
          </span>
        </div>
        <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted/70">
          {t("thresholdNote", { threshold: STABLE_THRESHOLD })}
        </p>
      </div>

      {/* Per-dimension delta */}
      <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
        <p className="mb-5 font-mono text-xs uppercase tracking-widest text-muted">{t("perDimension")}</p>
        <ul className="space-y-4">
          {DIMENSIONS.map((d) => {
            const delta = dimensionDeltas[d.key];
            return (
              <li key={d.key} className="border-l-4 pl-4" style={{ borderLeftColor: d.color }}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-ink">
                    <Term k={d.key.toLowerCase() as GlossaryKey}>
                      {d.key} · {d.fullName}
                    </Term>
                  </span>
                  <span className="font-display text-2xl text-ink">{formatSigned(delta)}</span>
                </div>
                <p className="mt-1 font-sans text-xs text-muted">
                  {t("dimLine", { t1: t1Scores[d.key], t2: t2Scores[d.key] })}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Overlaid radar */}
      <CompareRadar
        t1Label={`t1 · ${t1.entry.entry_date}`}
        t1Scores={t1Scores}
        t2Label={`t2 · ${t2.entry.entry_date}`}
        t2Scores={t2Scores}
      />

      {/* Metadata footer — transparency for both entries being compared */}
      <div className="grid grid-cols-1 gap-6 border border-border bg-surface p-5 sm:grid-cols-2 sm:p-6 lg:p-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">t1 · {t1.entry.entry_date}</p>
          <p className="mt-2 font-sans text-base text-ink">
            {tg(t1.entry.genre)} · <Term k="lensA">Lens A</Term>: {t1.lens_a_tag ?? "—"} ·{" "}
            {t("loggedBy", { name: t1.entry.ashokan_name })}
          </p>
          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-muted/70">
            <Term k="modelVersion">{t("model")}</Term> · {t1.model_version}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">t2 · {t2.entry.entry_date}</p>
          <p className="mt-2 font-sans text-base text-ink">
            {tg(t2.entry.genre)} · <Term k="lensA">Lens A</Term>: {t2.lens_a_tag ?? "—"} ·{" "}
            {t("loggedBy", { name: t2.entry.ashokan_name })}
          </p>
          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-muted/70">
            <Term k="modelVersion">{t("model")}</Term> · {t2.model_version}
          </p>
        </div>
      </div>
      </Disclosure>
    </div>
  );
}
