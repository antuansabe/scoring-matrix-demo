const STRINGS = {
  eyebrow: "An instrument from Ashoka · Framework Change",
  titlePart1: "Every story about change also tells you ",
  titlePart2: "who gets to act",
  titlePart3: ".",
  p1: "Built by Ashoka to understand the stories behind its partnerships, this instrument reads a piece of writing — an interview, a report, a post — and describes how it talks about change: who acts, who decides, who benefits.",
  p2: "It comes from more than four decades of learning alongside the world's leading social entrepreneurs. What they share is a way of speaking: they describe the world through possibility, they treat everyone's contribution as real, and they act accordingly.",
  p3: "It is a mirror, not a monitor. It doesn't grade people or organizations; it describes patterns in language — so we can watch how a narrative evolves over time.",
};

export function Hero() {
  return (
    <section className="pb-14 pt-14 sm:pb-16 sm:pt-20">
      <p className="font-mono text-xs uppercase tracking-widest text-muted animate-slide-up">
        {STRINGS.eyebrow}
      </p>
      <h1 className="mt-5 max-w-4xl font-display text-3xl font-normal leading-[1.15] text-ink sm:text-4xl lg:text-5xl animate-slide-up animation-delay-100">
        {STRINGS.titlePart1}
        <span className="font-light italic text-accent">{STRINGS.titlePart2}</span>
        {STRINGS.titlePart3}
      </h1>
      <div className="mt-8 max-w-[58ch] space-y-5 animate-slide-up animation-delay-200">
        <p className="font-sans text-base leading-[1.75] text-ink">{STRINGS.p1}</p>
        <p className="font-sans text-base leading-[1.75] text-ink">{STRINGS.p2}</p>
        <p className="font-sans text-base leading-[1.75] text-muted">{STRINGS.p3}</p>
      </div>
    </section>
  );
}
