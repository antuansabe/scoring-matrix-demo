/**
 * "The Instrument" — three editorial columns: what it measures, what it does
 * not, and why it matters. Server component.
 */
const BLOCKS = [
  {
    header: "What it measures",
    body: "The instrument scores the structural alignment between a text and the changemaker paradigm across five dimensions — agency, systemic framing, empathy enactment, collaboration, and identity embodiment. The output is an Enactment Score from 0 to 100, a radar profile, and an orientation toward Ashoka's three key societal shifts.",
  },
  {
    header: "What it does not measure",
    body: "This is not sentiment analysis. It is not a ranking of how good or impactful a person is. A text saturated with changemaker vocabulary can score Sympathizer. A field practitioner reflecting honestly on a course correction can score Changemaker. The instrument reads architecture, not vocabulary.",
  },
  {
    header: "Why it matters",
    body: "Beyond helping people reflect and grow on their embodiment of changemaking, this tool can allow Ashoka to measure changemaker density within organizations and metro areas. This instrument is the foundation for that diagnostic, so we can offer partners avenues to close the gap between their stated and enacted paradigms.",
  },
];

export function InstrumentPitch() {
  return (
    <section className="border-t border-border py-12 lg:py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        The Instrument
      </p>
      <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-3">
        {BLOCKS.map((block) => (
          <div key={block.header}>
            <div className="h-px w-8 bg-accent" aria-hidden="true" />
            <h3 className="mt-4 font-display text-2xl font-normal leading-tight text-ink">
              {block.header}
            </h3>
            <p className="mt-3 max-w-prose font-sans text-[1.0625rem] leading-[1.6] text-ink">
              {block.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
