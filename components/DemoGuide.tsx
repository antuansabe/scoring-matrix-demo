import Link from "next/link";

const STRINGS = {
  eyebrow: "How to read this demo",
  p1: "Below are four sample texts pre-scored by Ashoka's research lead. Each represents one band of the paradigm scale — from Spectator to System Architect. Click between them to see what the model reads in each text, and why.",
  p2: "To analyze your own text, head over to the",
  linkText: "Live Scorer",
  subheading: "Four anchor samples",
};

export function DemoGuide() {
  return (
    <section className="py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {STRINGS.eyebrow}
      </p>
      <p className="mt-4 max-w-prose font-sans text-lg leading-relaxed text-ink">
        {STRINGS.p1} {STRINGS.p2}{" "}
        <Link href="/tool" className="text-accent underline font-medium hover:opacity-80 transition-opacity">
          {STRINGS.linkText}
        </Link>
        .
      </p>
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted">
        {STRINGS.subheading}
      </p>
    </section>
  );
}
