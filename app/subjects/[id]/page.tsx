import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSubject } from "@/lib/db/subjects";
import { listAnalysesBySubject } from "@/lib/db/analyses";
import { resolveParadigmName } from "@/lib/paradigm";
import { groupAnalysesByMonth, formatMonthLabel, UNKNOWN_MONTH } from "@/lib/aggregate";
import { Reveal } from "@/components/Reveal";
import { DemoBanner } from "@/components/DemoBanner";
import { isDemoSubject } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations();
  const locale = await getLocale();
  const subject = await getSubject(id);
  if (!subject) notFound();

  const [parent, analyses] = await Promise.all([
    subject.parent_org_id ? getSubject(subject.parent_org_id) : Promise.resolve(null),
    listAnalysesBySubject(id),
  ]);

  // Score per text stays on each entry row; the month band adds the
  // aggregate reading across ALL of that month's materials (by entry_date —
  // the material date), so the subject is read moment by moment through its
  // whole corpus, not a single text.
  const months = groupAnalysesByMonth(analyses);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
      {isDemoSubject(subject) && (
        <div className="mb-8">
          <DemoBanner />
        </div>
      )}
      <Reveal>
        <Link
          href="/subjects"
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          {t("subjectDetail.back")}
        </Link>
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-accent-cta font-semibold">
          {t(`subjectTypes.${subject.type}`)}
        </p>
        <h1 className="mt-2 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          {subject.name}
        </h1>
        {parent && (
          <p className="mt-2 font-sans text-sm text-muted">
            {t("subjectDetail.nglOf")}{" "}
            <Link href={`/subjects/${parent.id}`} className="text-accent hover:underline">
              {parent.name}
            </Link>
          </p>
        )}
      </Reveal>

      <div className="mt-10 border-t border-border pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {t("subjectDetail.entriesChronological", { count: analyses.length })}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {!isDemoSubject(subject) && analyses.length > 0 && (
              <>
                <Link
                  href={`/tool?subject=${subject.id}`}
                  className="font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:text-accent-cta"
                >
                  {t("subjectDetail.addEntry")}
                </Link>
                <Link
                  href={`/subjects/${subject.id}/add-batch`}
                  className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
                >
                  {t("subjectDetail.addBatch")}
                </Link>
              </>
            )}
            {analyses.length >= 2 && (
              <Link
                href={`/subjects/${subject.id}/compare`}
                className="font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:text-accent-cta"
              >
                {t("subjectDetail.compare")}
              </Link>
            )}
          </div>
        </div>

        {analyses.length === 0 ? (
          <div className="mt-6 border border-border bg-surface p-6 sm:p-8">
            <p className="max-w-[60ch] font-sans text-base leading-relaxed text-ink">
              {t("subjectDetail.emptyBody", { name: subject.name })}
            </p>
            {!isDemoSubject(subject) && (
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link
                  href={`/tool?subject=${subject.id}`}
                  className="min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white transition-all hover:bg-accent"
                >
                  {t("subjectDetail.addFirst")}
                </Link>
                <Link
                  href={`/subjects/${subject.id}/add-batch`}
                  className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink"
                >
                  {t("subjectDetail.orSeveral")}
                </Link>
              </div>
            )}
          </div>
        ) : (
          months.map((m) => (
            <section key={m.month} className="mt-8">
              {/* Month band — the aggregate reading across the month's materials */}
              <div className="border border-border bg-surface px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      {m.month === UNKNOWN_MONTH
                        ? t("subjectDetail.monthUnknown")
                        : formatMonthLabel(m.month, locale)}
                      {" · "}
                      {t("subjectDetail.monthEntryCount", { count: m.entryCount })}
                    </p>
                    <p className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                      {m.meanEnactment}{" "}
                      <span className="font-sans text-sm text-muted">
                        {t("subjectDetail.monthOutOf100", { paradigm: m.paradigm })}
                      </span>
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      {t("subjectDetail.monthAvgDims")}
                    </p>
                    <p className="mt-1 font-mono text-xs uppercase tracking-widest text-accent">
                      D1 {m.meanDimensions.D1} · D2 {m.meanDimensions.D2} · D3 {m.meanDimensions.D3} · D4 {m.meanDimensions.D4} · D5 {m.meanDimensions.D5}
                    </p>
                    <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
                      {m.genres.map((g) => t(`genres.${g}`)).join(" · ")}
                    </p>
                  </div>
                </div>
                {m.mixedModelVersions && (
                  <p className="mt-3 border-t border-border pt-3 font-sans text-sm text-ink">
                    {t("subjectDetail.monthMixedModels", { versions: m.modelVersions.join(", ") })}
                  </p>
                )}
              </div>

              {/* Per-entry rows — each text keeps its own score */}
              <ol className="divide-y divide-border border-b border-border">
                {m.analyses.map((a) => (
                  <li key={a.id} className="py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-muted">
                          {t("subjectDetail.entryMeta", { date: a.entry.entry_date, genre: t(`genres.${a.entry.genre}`), name: a.entry.ashokan_name })}
                        </p>
                        <p className="mt-2 font-display text-xl text-ink">
                          {a.enactment_score}{" "}
                          <span className="font-sans text-sm text-muted">
                            {t("subjectDetail.outOf100", { paradigm: resolveParadigmName(a.enactment_score) })}
                          </span>
                        </p>
                        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-accent">
                          {a.each_orientation}
                        </p>
                      </div>
                      <Link
                        href={`/subjects/${subject.id}/entries/${a.entry_id}`}
                        className="whitespace-nowrap font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:text-accent-cta"
                      >
                        {t("subjectDetail.viewCard")}
                      </Link>
                    </div>
                    {a.entry.contextual_notes && (
                      <p className="mt-3 font-sans text-sm italic text-muted">{a.entry.contextual_notes}</p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
