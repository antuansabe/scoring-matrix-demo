import { useTranslations } from "next-intl";
import type { Sample } from "@/lib/types";

/**
 * Left "text panel": paradigm/genre tags, title + subtitle, and the sample's
 * excerpt in a card whose left border is the sample's accent color.
 * Chrome (title, meta lines) comes from the `samples.*` catalog namespace;
 * the excerpt itself renders verbatim as authored (lib/samples.ts contract).
 */
export function TextExcerpt({ sample }: { sample: Sample }) {
  const t = useTranslations("samples");
  const tg = useTranslations("genreTags");
  const paragraphs = sample.excerpt.split("\n\n");
  const wordCount = sample.excerpt.trim().split(/\s+/).length;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {t("excerptMeta", {
          level: sample.paradigmLevel,
          name: sample.paradigmName,
          genre: tg(sample.genreTag),
        })}
      </p>
      <h2 className="mt-3 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
        {t(`titles.${sample.id}`)}
      </h2>

      <div
        className="mt-5 space-y-4 border border-border bg-surface p-5 sm:p-6"
        style={{ borderLeftWidth: 3, borderLeftColor: sample.accentColor }}
      >
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="font-sans text-[0.95rem] leading-relaxed text-ink"
          >
            {para}
          </p>
        ))}
      </div>
      <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
        {t("excerptWords", { count: wordCount })}
      </p>
    </div>
  );
}
