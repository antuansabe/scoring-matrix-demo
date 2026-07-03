import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubject } from "@/lib/db/subjects";
import { listAnalysesBySubject } from "@/lib/db/analyses";
import { CompareView } from "@/components/CompareView";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

const SUBJECT_TYPE_LABELS: Record<string, string> = {
  jj_partner: "JJ Partner",
  ngl: "NGL",
};

export default async function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = await getSubject(id);
  if (!subject) notFound();

  const analyses = await listAnalysesBySubject(id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
      <Reveal>
        <Link
          href={`/subjects/${id}`}
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          ← {subject.name}
        </Link>
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-accent-cta font-semibold">
          {SUBJECT_TYPE_LABELS[subject.type] ?? subject.type}
        </p>
        <h1 className="mt-2 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          Compare <span className="font-light italic text-accent">two entries</span>
        </h1>
        <p className="mt-3 max-w-prose font-sans text-sm leading-relaxed text-muted">
          A subject is only ever compared to itself over time — never to another subject, and never
          silently across a model version change.
        </p>
      </Reveal>

      <div className="mt-10">
        {analyses.length < 2 ? (
          <div className="border border-border bg-surface p-8 text-center">
            <p className="font-sans text-sm text-muted">
              {subject.name} needs at least two dated entries to compare. Log another entry from the{" "}
              <Link href="/tool" className="text-accent hover:underline">
                Scoring Tool
              </Link>
              .
            </p>
          </div>
        ) : (
          <CompareView subject={subject} analyses={analyses} />
        )}
      </div>
    </main>
  );
}
