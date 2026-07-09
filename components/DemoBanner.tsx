import { useTranslations } from "next-intl";

/**
 * Unmissable label for any screen showing demo data (Phase 9). Server
 * component — render it at the top of a page whenever the subject is
 * flagged DEMO.
 */
export function DemoBanner() {
  const t = useTranslations("demoBanner");
  return (
    <div className="border border-accent bg-accent-light px-5 py-4" role="note" aria-label={t("aria")}>
      <p className="font-mono text-sm font-bold uppercase tracking-widest text-accent">{t("title")}</p>
      <p className="mt-1 font-sans text-base leading-relaxed text-ink">{t("body")}</p>
    </div>
  );
}
