import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSubject } from "@/lib/db/subjects";
import { getAnalysisByEntryId } from "@/lib/db/analyses";
import { resolveParadigmName } from "@/lib/paradigm";
import { FeedbackCard } from "@/components/FeedbackCard";
import { Reveal } from "@/components/Reveal";
import { DemoBanner } from "@/components/DemoBanner";
import { isDemoSubject } from "@/lib/demo";
import { Term } from "@/components/Term";
import type { GlossaryKey } from "@/lib/copy/glossary";

export const dynamic = "force-dynamic";

const DIMENSION_LABELS: { key: "d1" | "d2" | "d3" | "d4" | "d5"; label: string }[] = [
  { key: "d1", label: "D1 · Agency & Contribution" },
  { key: "d2", label: "D2 · Systemic & Architectural Framing" },
  { key: "d3", label: "D3 · Empathy Enactment" },
  { key: "d4", label: "D4 · Collaboration & Leadership" },
  { key: "d5", label: "D5 · Identity Embodiment" },
];

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string; entryId: string }>;
}) {
  const { id, entryId } = await params;
  const t = await getTranslations();
  const [subject, analysis] = await Promise.all([getSubject(id), getAnalysisByEntryId(entryId)]);

  if (!subject || !analysis || analysis.entry.subject_id !== id) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
      {isDemoSubject(subject) && (
        <div className="mb-8">
          <DemoBanner />
        </div>
      )}
      <Reveal>
        <Link
          href={`/subjects/${subject.id}`}
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          ← {subject.name}
        </Link>
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-muted">
          {t("entryDetail.meta", { date: analysis.entry.entry_date, genre: t(`genres.${analysis.entry.genre}`), name: analysis.entry.ashokan_name })}
        </p>
        <h1 className="mt-2 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          {subject.name}
        </h1>
        {analysis.entry.contextual_notes && (
          <p className="mt-3 font-sans text-sm italic text-muted">{analysis.entry.contextual_notes}</p>
        )}
      </Reveal>

      <div className="mt-8 border border-border bg-surface p-5 sm:p-6 lg:p-8">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[56px] font-normal leading-none text-ink sm:text-[64px]">
            {analysis.enactment_score}
          </span>
          <span className="font-mono text-sm text-muted">/ 100</span>
        </div>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
          <Term k="enactmentScore">Enactment Score</Term>
        </p>
        <p className="mt-3 font-display text-xl text-ink">{resolveParadigmName(analysis.enactment_score)}</p>
        <p className="mt-2 max-w-[60ch] font-sans text-base leading-relaxed text-muted">
          {t(`paradigmMeanings.${resolveParadigmName(analysis.enactment_score)}`)}
        </p>
        <p className="mt-2 font-sans text-base italic leading-relaxed text-muted">{t("notAVerdict")}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            <Term k="eachOrientation">EACH Orientation</Term>
          </span>
          <span className="border border-accent px-3 py-1 font-mono text-xs uppercase tracking-widest text-ink">
            {analysis.each_orientation}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-5">
          {DIMENSION_LABELS.map((d) => (
            <div key={d.key}>
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                <Term k={d.key as GlossaryKey}>{d.label.split(" · ")[0]}</Term>
              </p>
              <p className="font-display text-2xl text-ink">
                {analysis[d.key]}
                <span className="text-sm text-muted">/4</span>
              </p>
            </div>
          ))}
        </div>

        <p className="mt-5 border-t border-border pt-4 font-mono text-[0.65rem] uppercase tracking-widest text-muted/70">
          <Term k="modelVersion">Model version</Term> · {analysis.model_version}
        </p>
      </div>

      <div className="mt-8">
        <FeedbackCard initialState="loaded" data={analysis.feedback_card} />
      </div>
    </main>
  );
}
