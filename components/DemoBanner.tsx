/**
 * Unmissable label for any screen showing demo data (Phase 9). Server
 * component — render it at the top of a page whenever the subject is
 * flagged DEMO.
 */
export function DemoBanner() {
  return (
    <div
      className="border border-accent bg-accent-light px-5 py-4"
      role="note"
      aria-label="Demo data notice"
    >
      <p className="font-mono text-sm font-bold uppercase tracking-widest text-accent">
        Demo — fictional example
      </p>
      <p className="mt-1 font-sans text-base leading-relaxed text-ink">
        This subject and its texts were written to illustrate the tool. They describe no real
        organization or person.
      </p>
    </div>
  );
}
