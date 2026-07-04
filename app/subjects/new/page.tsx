import Link from "next/link";
import { listSubjects } from "@/lib/db/subjects";
import { isDemoSubject } from "@/lib/demo";
import { NewSubjectForm } from "@/components/NewSubjectForm";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function NewSubjectPage() {
  // Parent-org picker options: real JJ Partners only (never the demo).
  const jjPartners = (await listSubjects()).filter(
    (s) => s.type === "jj_partner" && !isDemoSubject(s),
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
      <Reveal>
        <Link
          href="/subjects"
          className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          ← All subjects
        </Link>
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-accent-cta font-semibold">
          Longitudinal Tracking
        </p>
        <h1 className="mt-2 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          A new <span className="font-light italic text-accent">subject</span> of observation
        </h1>
        <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-muted">
          A subject is whoever you want to read over time — a partner organization, a young
          leader, any voice Ashoka wants to follow. You create it once; every dated material you
          add afterward builds its story.
        </p>
      </Reveal>

      <div className="mt-10">
        <NewSubjectForm jjPartners={jjPartners} />
      </div>
    </main>
  );
}
