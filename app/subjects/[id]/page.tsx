import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubject } from "@/lib/db/subjects";
import { listAnalysesBySubject } from "@/lib/db/analyses";
import { resolveParadigmName } from "@/lib/paradigm";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

const SUBJECT_TYPE_LABELS: Record<string, string> = {
  jj_partner: "JJ Partner",
  ngl: "NGL",
};
const GENRE_LABELS: Record<string, string> = {
  interview: "Interview",
  article: "Article",
  website: "Website",
  report: "Report",
  social: "Social Media",
  other: "Other",
};

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = await getSubject(id);
  if (!subject) notFound();

  const [parent, analyses] = await Promise.all([
    subject.parent_org_id ? getSubject(subject.parent_org_id) : Promise.resolve(null),
    listAnalysesBySubject(id),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
      <Reveal>
        <Link
          href="/subjects"
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          ← All subjects
        </Link>
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-accent-cta font-semibold">
          {SUBJECT_TYPE_LABELS[subject.type] ?? subject.type}
        </p>
        <h1 className="mt-2 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          {subject.name}
        </h1>
        {parent && (
          <p className="mt-2 font-sans text-sm text-muted">
            NGL of{" "}
            <Link href={`/subjects/${parent.id}`} className="text-accent hover:underline">
              {parent.name}
            </Link>
          </p>
        )}
      </Reveal>

      <div className="mt-10 border-t border-border pt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {analyses.length} {analyses.length === 1 ? "Entry" : "Entries"} · Chronological
        </p>

        {analyses.length === 0 ? (
          <p className="mt-6 font-sans text-sm text-muted">No entries logged yet for this subject.</p>
        ) : (
          <ol className="mt-6 divide-y divide-border border-b border-border">
            {analyses.map((a) => (
              <li key={a.id} className="py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      {a.entry.entry_date} · {GENRE_LABELS[a.entry.genre] ?? a.entry.genre} · logged by{" "}
                      {a.entry.ashokan_name}
                    </p>
                    <p className="mt-2 font-display text-xl text-ink">
                      {a.enactment_score}{" "}
                      <span className="font-sans text-sm text-muted">
                        / 100 — {resolveParadigmName(a.enactment_score)}
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
                    View Feedback Card →
                  </Link>
                </div>
                {a.entry.contextual_notes && (
                  <p className="mt-3 font-sans text-sm italic text-muted">{a.entry.contextual_notes}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
