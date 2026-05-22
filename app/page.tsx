"use client";

import { useState } from "react";
import { SAMPLES } from "@/lib/samples";
import type { Sample, ScoreResult } from "@/lib/types";
import { Hero } from "@/components/Hero";
import { InstrumentPitch } from "@/components/InstrumentPitch";
import { DemoGuide } from "@/components/DemoGuide";
import { SampleSwitcher } from "@/components/SampleSwitcher";
import { TextExcerpt } from "@/components/TextExcerpt";
import { ScoreCard } from "@/components/ScoreCard";
import { RadarProfile } from "@/components/RadarProfile";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { JustificationQuotes } from "@/components/JustificationQuotes";
import { LiveAnalyzer } from "@/components/LiveAnalyzer";

// Adapt a pre-scored Sample to the shared ScoreResult shape the result
// components consume. The big Enactment Score shown is the expert pre-score
// (the ground truth in docs/SAMPLES.md), which may differ from the formula
// applied to the dimension scores — ScoreBreakdown surfaces that gap.
function sampleToScoreResult(sample: Sample): ScoreResult {
  return {
    genreTag: sample.genreTag,
    wordCount: sample.excerpt.trim().split(/\s+/).length,
    dimensions: sample.expertScores,
    enactmentScore: sample.expectedEnactmentScore,
    paradigmName: sample.paradigmName,
    eachOrientation: sample.expectedEACHOrientation,
    wordCountWarnings: [],
    confidenceFlags: [],
  };
}

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>(SAMPLES[0].id);
  // The Enactment Score counts up on first paint, but not when the user
  // switches between samples afterward — those just cross-fade.
  const [hasSwitched, setHasSwitched] = useState(false);
  const sample = SAMPLES.find((s) => s.id === selectedId) ?? SAMPLES[0];
  const result = sampleToScoreResult(sample);

  function handleSelectSample(id: string) {
    setSelectedId(id);
    setHasSwitched(true);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pb-4">
      <Hero />
      <InstrumentPitch />
      <DemoGuide />

      <section>
        <SampleSwitcher
          samples={SAMPLES}
          selectedId={selectedId}
          onSelect={handleSelectSample}
        />

        {/* key forces a remount on switch → 200ms opacity fade + the radar
            replays its entry animation. */}
        <div key={sample.id} className="animate-fade-in">
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
            <div>
              <TextExcerpt sample={sample} />
            </div>
            <div className="space-y-8">
              <ScoreBreakdown result={result} accentColor={sample.accentColor} />
              <ScoreCard
                result={result}
                accentColor={sample.accentColor}
                animateScore={!hasSwitched}
              />
              <RadarProfile result={result} accentColor={sample.accentColor} />
            </div>
          </div>
          <div className="mt-8">
            <JustificationQuotes result={result} accentColor={sample.accentColor} />
          </div>
        </div>
      </section>

      {/* Thick accent divider between the samples and the live analyzer. */}
      <div
        role="separator"
        aria-hidden="true"
        className="my-16 h-[3px] w-full bg-accent"
      />

      <section>
        <h2 className="font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
          Try the <span className="font-light italic">instrument</span> on your
          own text
        </h2>
        <p className="mt-2 max-w-prose font-sans text-sm leading-relaxed text-muted">
          Your text is processed securely. We do not store or share what you
          submit.
        </p>
        <div className="mt-8">
          <LiveAnalyzer />
        </div>
      </section>
    </main>
  );
}
