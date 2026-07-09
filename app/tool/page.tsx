import { getTranslations } from "next-intl/server";
import { LiveAnalyzer } from "@/components/LiveAnalyzer";
import { Reveal } from "@/components/Reveal";
import { listSubjects, getSubject } from "@/lib/db/subjects";
import type { Subject } from "@/lib/db/types";
import { isDemoSubject } from "@/lib/demo";



// Always fresh — new subjects can be created from this page, so a cached
// subjects list would silently go stale.
export const dynamic = "force-dynamic";

export default async function ToolPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject: subjectParam } = await searchParams;
  const t = await getTranslations("tool");

  let subjects: Subject[] = [];
  let lockedSubject: Subject | undefined;
  try {
    // Demo subjects are excluded from intake — nobody should save real
    // entries onto the fictional example.
    subjects = (await listSubjects()).filter((s) => !isDemoSubject(s));
    // Subject-first flow (Phase 10): ?subject=<id> locks the intake form.
    // Demo subjects can't be locked either — same rule as the dropdown.
    if (subjectParam) {
      const found = await getSubject(subjectParam);
      if (found && !isDemoSubject(found)) lockedSubject = found;
    }
  } catch (err) {
    // The ephemeral analyzer must keep working even if persistence is down.
    console.error("[app/tool] Failed to load subjects:", err);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
      <section className="max-w-3xl mx-auto">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-accent-cta font-semibold">
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 font-display text-2xl font-normal leading-relaxed text-ink sm:text-3xl max-w-2xl">
            {t("h1Part1")}
            <span className="font-light italic text-accent">{t("h1Part2")}</span>
            {t("h1Part3")}
          </h1>
          <p className="mt-5 mb-10 max-w-prose font-sans text-base leading-relaxed text-muted">
            {t("subtitle")}
          </p>
        </Reveal>
        {lockedSubject && (
          <div
            className="mb-8 border border-border bg-surface px-5 py-4"
            style={{ borderLeftWidth: 3, borderLeftColor: "var(--accent)" }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              {t("lockedTitle", { name: lockedSubject.name })}
            </p>
            <p className="mt-1 font-sans text-base leading-relaxed text-muted">{t("lockedBody")}</p>
          </div>
        )}
        <LiveAnalyzer initialSubjects={subjects} lockedSubject={lockedSubject} />
      </section>
    </main>
  );
}
