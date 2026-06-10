import { InstrumentPitch } from "@/components/InstrumentPitch";
import { DemoGuide } from "@/components/DemoGuide";
import { SampleShowcase } from "@/components/SampleShowcase";

const STRINGS = {
  eyebrow: "ABOUT THE MODEL",
  titlePart1: "The Changemaker ",
  titlePart2: "Worldview",
  subtitle: "Understanding the underlying methodology, the Ashoka framework, and expert pre-scored anchor texts.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14 sm:py-20 animate-slide-up">
      <div className="max-w-6xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {STRINGS.eyebrow}
        </p>
        <h1 className="mt-5 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl lg:text-5xl">
          {STRINGS.titlePart1}
          <span className="font-light italic text-accent">{STRINGS.titlePart2}</span>
        </h1>
        <p className="mt-3 mb-16 max-w-[55ch] font-sans text-base leading-relaxed text-muted">
          {STRINGS.subtitle}
        </p>

        <InstrumentPitch />
        <DemoGuide />
        <SampleShowcase />
      </div>
    </main>
  );
}
