import { LiveAnalyzer } from "@/components/LiveAnalyzer";
import { Reveal } from "@/components/Reveal";
import { listSubjects } from "@/lib/db/subjects";
import type { Subject } from "@/lib/db/types";

const STRINGS = {
  eyebrow: "TEST THE TOOL:",
  subtitle: "You will get an aggregate score, a score per dimension, and direct feedback regarding the framing and language you are using:",
};

// Always fresh — new subjects can be created from this page, so a cached
// subjects list would silently go stale.
export const dynamic = "force-dynamic";

export default async function ToolPage() {
  let subjects: Subject[] = [];
  try {
    subjects = await listSubjects();
  } catch (err) {
    // The ephemeral analyzer must keep working even if persistence is down.
    console.error("[app/tool] Failed to load subjects:", err);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
      <section className="max-w-3xl mx-auto">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-accent-cta font-semibold">
            {STRINGS.eyebrow}
          </p>
          <h1 className="mt-5 font-display text-2xl font-normal leading-relaxed text-ink sm:text-3xl max-w-2xl">
            Choose a text where you speak about your work, your role, or a reflection on{" "}
            <span className="font-light italic text-accent">how you see the world</span>. You can choose any piece of your own writing or a transcript from a video or interview where you speak.
          </h1>
          <p className="mt-5 mb-10 max-w-prose font-sans text-sm leading-relaxed text-muted">
            {STRINGS.subtitle}
          </p>
        </Reveal>
        <LiveAnalyzer initialSubjects={subjects} />
      </section>
    </main>
  );
}
