/** "How to read this demo" — one orienting paragraph + a transition line.
    Server component. */
export function DemoGuide() {
  return (
    <section className="py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        How to read this demo
      </p>
      <p className="mt-4 max-w-prose font-sans text-lg leading-relaxed text-ink">
        Below are four sample texts pre-scored by Ashoka&apos;s research lead.
        Each represents one band of the paradigm scale — from Spectator to System
        Architect. Click between them to see what the model reads in each text,
        and why. Further down, paste any text of your own to see the live scorer
        at work.
      </p>
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted">
        Four anchor samples → live analyzer
      </p>
    </section>
  );
}
