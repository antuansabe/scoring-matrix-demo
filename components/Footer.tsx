import Link from "next/link";

const STRINGS = {
  calculatorLabelEs: "Cómo se calcula el score",
  calculatorLabelEn: "How the score is calculated",
  credits: "A collaboration between Ashoka Framework Change and Ashoka ITI, co-led by Giselle Kuri and Antonio Dromundo. Stage 1 scoring model and demo built jointly by both teams. v0.1 — not a production tool.",
  nav: {
    home: "Home",
    tool: "Scoring Tool",
    batch: "Batch Analysis",
    about: "About",
    badge: "Badge",
  }
};

/** Global Footer. Server component. */
export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-transparent">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Calculator Link & Nav links row */}
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-border/50">
          <div>
            <Link
              href="/calculadora"
              className="font-mono text-xs uppercase tracking-widest text-accent hover:text-opacity-80 transition-colors inline-flex items-center gap-1.5"
            >
              <span>{STRINGS.calculatorLabelEs}</span>
              <span className="text-muted/60">/</span>
              <span>{STRINGS.calculatorLabelEn}</span>
              <span className="text-[0.65rem] font-sans">→</span>
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.68rem] uppercase tracking-widest text-muted">
            <Link href="/" className="hover:text-ink transition-colors">
              {STRINGS.nav.home}
            </Link>
            <Link href="/tool" className="hover:text-ink transition-colors">
              {STRINGS.nav.tool}
            </Link>
            <Link href="/batch" className="hover:text-ink transition-colors">
              {STRINGS.nav.batch}
            </Link>
            <Link href="/about" className="hover:text-ink transition-colors">
              {STRINGS.nav.about}
            </Link>
            <Link href="/badge" className="hover:text-ink transition-colors">
              {STRINGS.nav.badge}
            </Link>
          </div>
        </div>

        {/* Credit details */}
        <div>
          <p className="font-mono text-[0.68rem] uppercase leading-relaxed tracking-widest text-muted/80">
            {STRINGS.credits}
          </p>
        </div>
      </div>
    </footer>
  );
}
