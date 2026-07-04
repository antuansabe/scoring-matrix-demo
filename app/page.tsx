import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { DIMENSIONS } from "@/lib/paradigm";
import { DEMO_ORG_ID } from "@/lib/demo";
import Link from "next/link";

const STRINGS = {
  explainerEyebrow: "What the instrument reads",
  explainerTitlePart1: "The ",
  explainerTitlePart2: "five dimensions",
  explainerTitlePart3: " every reading rests on",
  explainerParagraph1: "The instrument doesn't ask what a text claims. It reads what the language does: who appears as the subject of the verbs, where problems are located, whether other people's perspectives visibly change anything.",
  explainerParagraph2: "That architecture is read against what Ashoka calls the Everyone a Changemaker framework — the conviction that change works best when everyone has the standing to make it.",
  explainerParagraph3: "We are not ranking changemakers. We are reading the traces a worldview leaves — or doesn't leave — in language, across five dimensions:",
  learnMoreButton: "How the model was built →",
  ctaEyebrow: "Try it",
  ctaTitlePart1: "Read one ",
  ctaTitlePart2: "text",
  ctaTitlePart3: " — or follow a whole story",
  ctaSubtitle: "Paste something a person or an organization actually wrote or said, and get the full reading in about a minute. Or start with the fictional demo — a complete story, already told over time — to see where this leads.",
  ctaButton: "Open the Scoring Tool →",
  ctaDemoLink: "See the demo story →",
};

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-16">
      <Hero />
      
      {/* Five Dimensions Explainer */}
      <section className="border-t border-border pt-16 pb-20 lg:pt-20 lg:pb-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {STRINGS.explainerEyebrow}
          </p>
          <h2 className="mt-4 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl lg:text-4xl max-w-2xl">
            {STRINGS.explainerTitlePart1}
            <span className="font-light italic text-accent">{STRINGS.explainerTitlePart2}</span>
            {STRINGS.explainerTitlePart3}
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <div className="mt-6 max-w-[62ch] space-y-5">
            <p className="font-sans text-base leading-[1.75] text-ink">
              {STRINGS.explainerParagraph1}
            </p>
            <p className="font-sans text-base leading-[1.75] text-ink">
              {STRINGS.explainerParagraph2}
            </p>
            <p className="font-sans text-base leading-[1.75] text-muted">
              {STRINGS.explainerParagraph3}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIMENSIONS.map((d, i) => (
            <Reveal key={d.key} delay={i * 90} className="h-full">
              <div
                className="premium-card p-6 relative border-l-4 flex flex-col justify-between h-full"
                style={{ borderLeftColor: d.color, borderTopWidth: 0 }}
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span
                      className="font-mono text-[0.7rem] font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${d.color}12`, color: d.color }}
                    >
                      {d.key}
                    </span>
                    <h3 className="font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
                      {d.fullName}
                    </h3>
                  </div>
                  <p className="font-sans text-sm leading-relaxed text-muted line-clamp-4">
                    {d.oneLineDescription}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10" delay={100}>
          <Link
            href="/about"
            className="font-mono text-xs uppercase tracking-widest text-accent hover:text-accent-cta transition-colors inline-flex items-center gap-1"
          >
            {STRINGS.learnMoreButton}
          </Link>
        </Reveal>
      </section>

      {/* Live Analyzer Entry */}
      <section className="border-t border-border pt-16 pb-8 lg:pt-20">
        <Reveal className="max-w-3xl">
          <div className="premium-card p-8 sm:p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent-2/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-accent-2/20 transition-all duration-700" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {STRINGS.ctaEyebrow}
            </p>
            <h3 className="mt-5 font-display text-2xl font-normal leading-snug text-ink sm:text-3xl">
              {STRINGS.ctaTitlePart1}
              <span className="font-light italic text-accent">{STRINGS.ctaTitlePart2}</span>
              {STRINGS.ctaTitlePart3}
            </h3>
            <p className="mt-4 max-w-[55ch] font-sans text-base leading-relaxed text-muted">
              {STRINGS.ctaSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/tool" className="btn-primary">
                {STRINGS.ctaButton}
              </Link>
              <Link
                href={`/subjects/${DEMO_ORG_ID}`}
                className="font-mono text-xs uppercase tracking-widest text-accent hover:text-accent-cta transition-colors"
              >
                {STRINGS.ctaDemoLink}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
