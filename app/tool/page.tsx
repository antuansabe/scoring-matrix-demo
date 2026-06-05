import { LiveAnalyzer } from "@/components/LiveAnalyzer";

const STRINGS = {
  eyebrow: "TEST THE TOOL:",
  title: "Choose a text where you speak about your work, your role, or a reflection on how you see the world. You can choose any piece of your own writing or a transcript from a video or interview where you speak.",
  subtitle: "You will get an aggregate score, a score per dimension, and direct feedback regarding the framing and language you are using:",
};

export default function ToolPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 animate-slide-up">
      <section className="max-w-4xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {STRINGS.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-2xl font-normal leading-relaxed text-ink sm:text-3xl max-w-3xl">
          Choose a text where you speak about your work, your role, or a reflection on{" "}
          <span className="font-light italic text-accent">how you see the world</span>. You can choose any piece of your own writing or a transcript from a video or interview where you speak.
        </h1>
        <p className="mt-4 mb-8 max-w-prose font-sans text-sm leading-relaxed text-muted">
          {STRINGS.subtitle}
        </p>
        <LiveAnalyzer />
      </section>
    </main>
  );
}
