import { Hero } from "@/components/Hero";
import { DIMENSIONS } from "@/lib/paradigm";
import Link from "next/link";

const STRINGS = {
  explainerEyebrow: "MODEL ARCHITECTURE",
  explainerTitle: "The Five Dimensions",
  ctaEyebrow: "LIVE SCORER",
  ctaTitlePart1: "Ready to score your ",
  ctaTitlePart2: "own text",
  ctaSubtitle: "Analyze your text across the five dimensions using our live parser powered by Claude.",
  ctaButton: "Open Live Analyzer →",
};

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-16">
      <Hero />
      
      {/* Five Dimensions Explainer */}
      <section className="border-t border-border py-12 lg:py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {STRINGS.explainerEyebrow}
        </p>
        <h2 className="mt-4 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
          {STRINGS.explainerTitle}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-3">
          {DIMENSIONS.map((d) => (
            <div key={d.key} className="relative">
              <div className="h-px w-8" style={{ backgroundColor: d.color }} aria-hidden="true" />
              <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted">
                {d.key}
              </p>
              <h3 className="mt-1 font-display text-xl font-normal leading-tight text-ink">
                {d.fullName}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                {d.oneLineDescription}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Analyzer Entry */}
      <section className="border-t border-border py-12 lg:py-16">
        <div className="border border-border bg-surface p-6 sm:p-8 rounded-sm max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {STRINGS.ctaEyebrow}
          </p>
          <h3 className="mt-4 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
            {STRINGS.ctaTitlePart1}
            <span className="font-light italic text-accent">{STRINGS.ctaTitlePart2}</span>
          </h3>
          <p className="mt-3 max-w-prose font-sans text-[1.0625rem] leading-[1.6] text-ink">
            {STRINGS.ctaSubtitle}
          </p>
          <div className="mt-6">
            <Link
              href="/tool"
              className="font-display bg-accent text-white px-5 py-3 text-sm hover:bg-opacity-95 transition-colors inline-block rounded-sm"
            >
              {STRINGS.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
