import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSubject } from "@/lib/db/subjects";
import { isDemoSubject } from "@/lib/demo";
import { SubjectBatchIntake } from "@/components/SubjectBatchIntake";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function AddBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = await getSubject(id);
  if (!subject) notFound();
  // The demo is a display piece — nothing gets added to it.
  if (isDemoSubject(subject)) redirect(`/subjects/${id}`);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
      <Reveal>
        <Link
          href={`/subjects/${subject.id}`}
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          ← {subject.name}
        </Link>
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-accent-cta font-semibold">
          Batch Intake
        </p>
        <h1 className="mt-2 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          Add several materials to <span className="font-light italic text-accent">{subject.name}</span>
        </h1>
        <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-muted">
          Paste each text with its own material date and genre — a decade of reports in one
          sitting, if you have them. Each one is analyzed and saved as its own dated entry on this
          subject&apos;s timeline.
        </p>
      </Reveal>

      <div className="mt-10">
        <SubjectBatchIntake subject={subject} />
      </div>
    </main>
  );
}
