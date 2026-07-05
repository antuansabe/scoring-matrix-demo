import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="pb-14 pt-14 sm:pb-16 sm:pt-20">
      <p className="font-mono text-xs uppercase tracking-widest text-muted animate-slide-up">
        {t("eyebrow")}
      </p>
      <h1 className="mt-5 max-w-4xl font-display text-3xl font-normal leading-[1.15] text-ink sm:text-4xl lg:text-5xl animate-slide-up animation-delay-100">
        {t("titlePart1")}
        <span className="font-light italic text-accent">{t("titlePart2")}</span>
        {t("titlePart3")}
      </h1>
      <div className="mt-8 max-w-[58ch] space-y-5 animate-slide-up animation-delay-200">
        <p className="font-sans text-base leading-[1.75] text-ink">{t("p1")}</p>
        <p className="font-sans text-base leading-[1.75] text-ink">{t("p2")}</p>
        <p className="font-sans text-base leading-[1.75] text-muted">{t("p3")}</p>
      </div>
    </section>
  );
}
