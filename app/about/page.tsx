import { SampleShowcase } from "@/components/SampleShowcase";
import { ModelFoundations } from "@/components/ModelFoundations";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14 sm:py-20 animate-slide-up">
      <div className="max-w-6xl mx-auto">
        <ModelFoundations />
        <SampleShowcase />
      </div>
    </main>
  );
}
