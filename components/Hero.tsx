/** Eyebrow + display headline + subtitle. Server component. */
export function Hero() {
  return (
    <section className="pb-10 pt-12 sm:pb-12 sm:pt-16">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        An instrument from Ashoka · Framework Change
      </p>
      <h1 className="mt-4 max-w-4xl font-display text-3xl font-normal leading-[1.1] text-ink sm:text-4xl lg:text-5xl">
        Changemaker Narrative Measurement Tool
      </h1>
      <div className="mt-5 max-w-[65ch] space-y-5">
        <p className="font-display text-[1.375rem] font-light italic leading-snug text-ink">
          Discover how your language reflects your conviction to change the
          world.
        </p>
        <p className="font-sans text-[1.0625rem] leading-[1.6] text-ink">
          This tool measures the architecture of language and what is behind the
          words you choose. It is anchored in critical discourse analysis and
          Ashoka&apos;s framework with the intention to help you notice the
          framing, grammar, and narrative positioning of what you say, in five
          dimensions:
        </p>
        <ol className="list-decimal pl-5 font-sans text-base leading-[1.6] text-ink">
          <li>Agency &amp; Contribution</li>
          <li>Systemic &amp; Architectural Framing</li>
          <li>Empathy Quality</li>
          <li>Collaboration &amp; Leadership Model</li>
          <li>Identity Embodiment</li>
        </ol>
      </div>
    </section>
  );
}
