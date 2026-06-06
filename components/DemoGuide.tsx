import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const STRINGS = {
  eyebrow: "How to read this demo",
  p1: "Below are four sample texts pre-scored by Ashoka's research lead. Each represents one band of the paradigm scale — from Spectator to System Architect. Click between them to see what the model reads in each text, and why.",
  p2: "To analyze your own text, head over to the",
  linkText: "Live Scorer",
  subheading: "Four anchor samples",
};

export function DemoGuide() {
  return (
    <section className="border-t border-border/60 py-12 lg:py-16">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {STRINGS.eyebrow}
        </p>
      </Reveal>
      <Reveal delay={80}>
        <div className="mt-6 p-6 sm:p-8 bg-surface border border-border/50 rounded-xl premium-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-light rounded-full blur-xl -mr-8 -mt-8" />
          <p className="font-sans text-base sm:text-lg leading-relaxed text-ink max-w-4xl relative z-10">
            {STRINGS.p1} {STRINGS.p2}{" "}
            <Link href="/tool" className="text-accent hover:text-accent-cta underline font-semibold transition-colors">
              {STRINGS.linkText}
            </Link>
            .
          </p>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <p className="mt-12 font-mono text-xs uppercase tracking-widest text-muted">
          {STRINGS.subheading}
        </p>
      </Reveal>
    </section>
  );
}
