import { useTranslations } from "next-intl";
import { CalculatorWidget } from "@/components/CalculatorWidget";
import { Reveal } from "@/components/Reveal";

export default function CalculatorPage() {
  const t = useTranslations("calculator");
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl lg:text-5xl">
            {t("titlePart1")}
            <span className="font-light italic text-accent">{t("titlePart2")}</span>
          </h1>
          <p className="mt-2 mb-12 max-w-prose font-sans text-lg leading-relaxed text-ink">
            {t("subtitle")}
          </p>
        </Reveal>

        <CalculatorWidget />
      </div>
    </main>
  );
}
