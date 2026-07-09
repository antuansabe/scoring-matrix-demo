import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listSubjects } from "@/lib/db/subjects";
import { isDemoSubject } from "@/lib/demo";
import { NewSubjectForm } from "@/components/NewSubjectForm";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function NewSubjectPage() {
  const t = await getTranslations("newSubject");
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
          {t("back")}
        </Link>
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-accent-cta font-semibold">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          {t("titlePart1")}
          <span className="font-light italic text-accent">{t("titlePart2")}</span>
          {t("titlePart3")}
        </h1>
        <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-muted">
          {t("intro")}
        </p>
      </Reveal>

      <div className="mt-10">
        <NewSubjectForm jjPartners={jjPartners} />
      </div>
    </main>
  );
}
