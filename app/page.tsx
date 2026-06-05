import { Hero } from "@/components/Hero";
import { DIMENSIONS } from "@/lib/paradigm";
import Link from "next/link";

const STRINGS = {
  explainerEyebrow: "ABOUT MEASURING CHANGEMAKER DISCURSIVE ENACTMENT",
  explainerParagraph1: "This tool does not only care about what you say. It's designed to look for how you narrate actions, how you position yourself, and how you describe your relationships and context.",
  explainerParagraph2: "Specifically, it measures the degree to which the architecture of language aligns with what Ashoka calls “the Everyone a Changemaker Framework”.",
  explainerParagraph3: "We are not ranking changemakers; we are reading the traces the worldview leaves — or does not leave — in language. We do so in five dimensions:",
  learnMoreButton: "LEARN MORE ABOUT THE MODEL AND ASHOKA'S FRAMEWORK →",
  ctaEyebrow: "LIVE SCORER",
  ctaTitlePart1: "Ready to score your ",
  ctaTitlePart2: "own text",
  ctaSubtitle: "Analyze your text across the five dimensions using our live parser powered by Ashoka IA.",
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
        <div className="mt-6 max-w-[70ch] space-y-4">
          <p className="font-sans text-[1.0625rem] leading-[1.6] text-ink">
            {STRINGS.explainerParagraph1}
          </p>
          <p className="font-sans text-[1.0625rem] leading-[1.6] text-ink">
            {STRINGS.explainerParagraph2}
          </p>
          <p className="font-sans text-[1.0625rem] leading-[1.6] text-ink">
            {STRINGS.explainerParagraph3}
          </p>
        </div>
        
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-3">
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

        <div className="mt-12">
          <Link
            href="/about"
            className="font-mono text-xs uppercase tracking-widest text-accent hover:text-opacity-80 transition-colors inline-block border border-accent/30 px-5 py-3 rounded-sm"
          >
            {STRINGS.learnMoreButton}
          </Link>
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
