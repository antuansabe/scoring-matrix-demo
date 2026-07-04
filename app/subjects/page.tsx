import Link from "next/link";
import { listSubjectsWithStats } from "@/lib/db/subjects";
import { Reveal } from "@/components/Reveal";
import { isDemoSubject } from "@/lib/demo";

// Subjects and entries change independently of any build — never cache this list.
export const dynamic = "force-dynamic";

const SUBJECT_TYPE_LABELS: Record<string, string> = {
  jj_partner: "JJ Partner",
  ngl: "NGL",
};

function formatDate(iso: string | null): string {
  return iso ?? "—";
}

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
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
          Longitudinal Tracking
        </p>
        <h1 className="mt-5 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          <span className="font-light italic text-accent">Subjects</span> under observation
        </h1>
        <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-muted">
          Every JJ Partner and NGL under observation. A subject is only ever compared to itself
          over time.
        </p>
        <div className="mt-6">
          <Link
            href="/subjects/new"
            className="inline-block min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white transition-all hover:bg-accent"
          >
            New subject →
          </Link>
        </div>
        {demoCount > 0 && (
          <p className="mt-3 font-mono text-xs uppercase tracking-widest">
            {showDemo ? (
              <Link href="/subjects" className="text-accent hover:text-accent-cta">
                Hide the demo example
              </Link>
            ) : (
              <Link href="/subjects?demo=1" className="text-muted hover:text-ink">
                Show the demo example →
              </Link>
            )}
          </p>
        )}
      </Reveal>

      {subjects.length === 0 ? (
        <div className="mt-10 border border-border bg-surface p-8">
          <p className="font-sans text-base leading-relaxed text-ink">
            No subjects yet. A subject is whoever you want to read over time — an organization
            or a person. Create one, then feed it dated materials.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href="/subjects/new"
              className="min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white transition-all hover:bg-accent"
            >
              Create the first subject →
            </Link>
            <Link href="/tool" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink">
              or start from a text in the Scoring Tool →
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
                  {SUBJECT_TYPE_LABELS[s.type] ?? s.type}
                  {isDemoSubject(s) && (
                    <span className="ml-2 border border-accent px-2 py-0.5 font-bold text-accent">
                      Demo · fictional
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  {s.entryCount} {s.entryCount === 1 ? "entry" : "entries"}
                </p>
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  Last · {formatDate(s.lastEntryDate)}
                </p>
                <span className="font-mono text-xs uppercase tracking-widest text-accent">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
