import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listSubjectsWithStats } from "@/lib/db/subjects";
import { Reveal } from "@/components/Reveal";
import { isDemoSubject } from "@/lib/demo";

// Subjects and entries change independently of any build — never cache this list.
export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  return iso ?? "—";
}

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
  const t = await getTranslations();
  const showDemo = demo === "1";
  const all = await listSubjectsWithStats();
  // Demo rows are excluded from the real list by default (Phase 9) — they
  // exist for guided demonstrations, not as data.
  const subjects = showDemo ? all : all.filter((s) => !isDemoSubject(s));
  const demoCount = all.length - all.filter((s) => !isDemoSubject(s)).length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-cta font-semibold">
          {t("subjects.eyebrow")}
        </p>
        <h1 className="mt-5 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          <span className="font-light italic text-accent">{t("subjects.titlePart1")}</span>
          {t("subjects.titlePart2")}
        </h1>
        <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-muted">
          {t("subjects.intro")}
        </p>
        <div className="mt-6">
          <Link
            href="/subjects/new"
            className="inline-block min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white transition-all hover:bg-accent"
          >
            {t("subjects.newSubject")}
          </Link>
        </div>
        {demoCount > 0 && (
          <p className="mt-3 font-mono text-xs uppercase tracking-widest">
            {showDemo ? (
              <Link href="/subjects" className="text-accent hover:text-accent-cta">
                {t("subjects.hideDemo")}
              </Link>
            ) : (
              <Link href="/subjects?demo=1" className="text-muted hover:text-ink">
                {t("subjects.showDemo")}
              </Link>
            )}
          </p>
        )}
      </Reveal>

      {subjects.length === 0 ? (
        <div className="mt-10 border border-border bg-surface p-8">
          <p className="font-sans text-base leading-relaxed text-ink">
            {t("subjects.emptyBody")}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href="/subjects/new"
              className="min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white transition-all hover:bg-accent"
            >
              {t("subjects.createFirst")}
            </Link>
            <Link href="/tool" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink">
              {t("subjects.orStartFromText")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 divide-y divide-border border-t border-b border-border">
          {subjects.map((s) => (
            <Link
              key={s.id}
              href={`/subjects/${s.id}`}
              className="flex flex-wrap items-center justify-between gap-4 px-2 py-5 -mx-2 transition-colors hover:bg-surface"
            >
              <div>
                <p className="font-display text-lg text-ink">{s.name}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
                  {t(`subjectTypes.${s.type}`)}
                  {isDemoSubject(s) && (
                    <span className="ml-2 border border-accent px-2 py-0.5 font-bold text-accent">
                      {t("subjects.demoChip")}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  {t("subjects.entryCount", { count: s.entryCount })}
                </p>
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  {t("subjects.last", { date: formatDate(s.lastEntryDate) })}
                </p>
                <span className="font-mono text-xs uppercase tracking-widest text-accent">{t("subjects.view")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
