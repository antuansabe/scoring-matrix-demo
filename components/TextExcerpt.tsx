import type { Sample } from "@/lib/types";

/**
 * Left "text panel": paradigm/genre tags, title + subtitle, and the sample's
 * excerpt in a card whose left border is the sample's accent color.
 */
export function TextExcerpt({ sample }: { sample: Sample }) {
  const paragraphs = sample.excerpt.split("\n\n");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Paradigm {sample.paradigmLevel} · {sample.paradigmName} ·{" "}
        {sample.genreTag}
      </p>
      <h2 className="mt-3 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
        {sample.title}
      </h2>
      <p className="mt-1 font-sans text-sm italic text-muted">
        {sample.subtitle}
      </p>

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
        Excerpt · {sample.excerpt.trim().split(/\s+/).length} words
      </p>
    </div>
  );
}
