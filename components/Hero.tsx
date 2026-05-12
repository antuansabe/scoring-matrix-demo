/** Eyebrow + display headline + subtitle. Server component. */
export function Hero() {
  return (
    <section className="pb-10 pt-12 sm:pb-12 sm:pt-16">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        An instrument from Ashoka · Framework Change
      </p>
      <h1 className="mt-4 max-w-4xl font-display text-3xl font-normal leading-[1.1] text-ink sm:text-4xl lg:text-5xl">
        Reading the <span className="font-light italic">architecture</span> of a
        text — not its <span className="font-light italic">sentiment</span>.
      </h1>
      <p className="mt-5 max-w-[65ch] font-sans text-lg leading-relaxed text-ink">
        A measurement instrument for the discursive enactment of changemaker
        identity. Five dimensions, anchored in critical discourse analysis and
        Ashoka&apos;s framework. Built to read what changemaker language does —
        not what it claims.
      </p>
    </section>
  );
}
