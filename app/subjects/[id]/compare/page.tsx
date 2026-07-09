import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSubject } from "@/lib/db/subjects";
import { listAnalysesBySubject } from "@/lib/db/analyses";
import { CompareView } from "@/components/CompareView";
import { Reveal } from "@/components/Reveal";
import { DemoBanner } from "@/components/DemoBanner";
import { isDemoSubject } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations();
  const subject = await getSubject(id);
  if (!subject) notFound();

  const analyses = await listAnalysesBySubject(id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
      {isDemoSubject(subject) && (
        <div className="mb-8">
          <DemoBanner />
        </div>
      )}
      <Reveal>
        <Link
          href={`/subjects/${id}`}
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          ← {subject.name}
        </Link>
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-accent-cta font-semibold">
          {t(`subjectTypes.${subject.type}`)}
        </p>
        <h1 className="mt-2 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          {t("compare.titlePart1")}
          <span className="font-light italic text-accent">{t("compare.titlePart2")}</span>
        </h1>
        <p className="mt-3 max-w-prose font-sans text-sm leading-relaxed text-muted">
          {t("compare.intro")}
        </p>
      </Reveal>

      <div className="mt-10">
        {analyses.length < 2 ? (
          <div className="border border-border bg-surface p-8 text-center">
            <p className="font-sans text-sm text-muted">
              {t.rich("compare.needTwo", {
                name: subject.name,
                link: (chunks) => (
                  <Link href="/tool" className="text-accent hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
        ) : (
          <CompareView subject={subject} analyses={analyses} />
        )}
      </div>
    </main>
  );
}
