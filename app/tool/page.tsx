import { LiveAnalyzer } from "@/components/LiveAnalyzer";

const STRINGS = {
  eyebrow: "SCORING TOOL",
  titlePart1: "Try the ",
  titlePart2: "instrument",
  titlePart3: " on your own text",
  subtitle: "Your text is processed securely. We do not store or share what you submit.",
};

export default function ToolPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="max-w-4xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {STRINGS.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
          {STRINGS.titlePart1}
          <span className="font-light italic text-accent">{STRINGS.titlePart2}</span>
          {STRINGS.titlePart3}
        </h1>
        <p className="mt-2 mb-8 max-w-prose font-sans text-sm leading-relaxed text-muted">
          {STRINGS.subtitle}
        </p>
        <LiveAnalyzer />
      </section>
    </main>
  );
}
