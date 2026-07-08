"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DIMENSIONS,
  GENRE_WEIGHTS,
  calculateEnactmentScore,
  resolveParadigmName,
  resolveEACHOrientation,
} from "@/lib/paradigm";
import type { GenreTag, DimensionKey } from "@/lib/types";

const EXPLAINER_KEYS = ["s1", "s2", "s3", "s4"] as const;

function getParadigmColor(name: string): string {
  switch (name) {
    case "Spectator":
      return "#627D98";
    case "Sympathizer":
      return "#C46246";
    case "Contributor":
      return "#F39334";
    case "Changemaker":
      return "#E87722";
    case "System Architect":
      return "#0A3558";
    default:
      return "#E87722";
  }
}

export function CalculatorWidget() {
  const t = useTranslations("calculator");
  const td = useTranslations("dimensions");
  const tg = useTranslations("genreTags");
  const [genre, setGenre] = useState<GenreTag>("free-form-interview");
  const [scores, setScores] = useState<Record<DimensionKey, number>>({
    D1: 3,
    D2: 2,
    D3: 2,
    D4: 2,
    D5: 2,
  });

  const handleScoreChange = (key: DimensionKey, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  // Construct mock DimensionScore objects for the helper functions
  const mockDims = {
    D1: { score: scores.D1, justification: "", quotes: [] },
    D2: { score: scores.D2, justification: "", quotes: [] },
    D3: { score: scores.D3, justification: "", quotes: [] },
    D4: { score: scores.D4, justification: "", quotes: [] },
    D5: { score: scores.D5, justification: "", quotes: [] },
  };

  const enactmentScore = calculateEnactmentScore(mockDims, genre);
  const paradigmName = resolveParadigmName(enactmentScore);
  const eachOrientation = resolveEACHOrientation(mockDims);
  const paradigmColor = getParadigmColor(paradigmName);

  const weights = GENRE_WEIGHTS[genre];

  // Substitute current scores and weights into the formula representation
  const formulaString = `(${scores.D1} · ${weights[0].toFixed(2)} + ${scores.D2} · ${weights[1].toFixed(2)} + ${scores.D3} · ${weights[2].toFixed(2)} + ${scores.D4} · ${weights[3].toFixed(2)} + ${scores.D5} · ${weights[4].toFixed(2)}) × 25 = ${enactmentScore}`;

  return (
    <div className="space-y-12">
      {/* Interactive Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
        {/* Left: Inputs */}
        <div className="premium-card p-6 sm:p-8 relative overflow-hidden">
          <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
            {t("inputsHeader")}
          </p>

          <div className="space-y-6">
            {/* Genre Selector */}
            <div>
              <label htmlFor="genre-select" className="block font-mono text-xs uppercase tracking-widest text-ink mb-2">
                {t("genreLabel")}
              </label>
              <select
                id="genre-select"
                value={genre}
                onChange={(e) => setGenre(e.target.value as GenreTag)}
                className="block w-full border border-border bg-surface px-4 py-3 font-sans text-sm text-ink rounded-md focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300 cursor-pointer shadow-sm"
              >
                {(Object.keys(GENRE_WEIGHTS) as GenreTag[]).map((g) => (
                  <option key={g} value={g}>
                    {tg(g)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sliders */}
            <div className="space-y-6 pt-6 border-t border-border/60">
              {DIMENSIONS.map((d, index) => (
                <div key={d.key} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono text-xs uppercase tracking-widest text-ink font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.key} · {td(`${d.key}.short`)}
                    </span>
                    <span className="font-mono text-[0.7rem] text-muted">
                      {t("weight", { pct: Math.round(weights[index] * 100) })}
                    </span>
                  </div>
                  <div className="flex items-center gap-5 bg-bg/40 p-3 rounded-md border border-border/40 hover:border-border transition-colors duration-200">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="4"
                        step="1"
                        value={scores[d.key]}
                        onChange={(e) => handleScoreChange(d.key, parseInt(e.target.value))}
                        className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer transition-all focus:outline-none"
                        style={{ accentColor: d.color }}
                      />
                      <div className="mt-1.5 flex justify-between px-0.5 text-[0.65rem] font-mono text-muted">
                        <span>0</span>
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                      </div>
                    </div>
                    <span className="w-8 text-right font-display text-3xl font-normal text-ink" style={{ color: d.color }}>
                      {scores[d.key]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Outputs */}
        <div className="space-y-6">
          <div className="premium-card p-6 sm:p-8 relative overflow-hidden">
            <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
              {t("outputsHeader")}
            </p>

            <div className="space-y-6">
              {/* Score Display */}
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
                  {t("enactmentScore")}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-6xl font-normal leading-none sm:text-7xl transition-all duration-300" style={{ color: paradigmColor }}>
                    {enactmentScore}
                  </span>
                  <span className="font-mono text-lg text-muted">/100</span>
                </div>
              </div>

              {/* Paradigm Name */}
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
                  {t("paradigmLevel")}
                </p>
                <p className="mt-1 font-display text-xl font-semibold text-ink" style={{ color: paradigmColor }}>
                  {paradigmName}
                </p>
              </div>

              {/* EACH Orientation */}
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
                  {t("eachOrientation")}
                </p>
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink font-semibold">
                  {eachOrientation}
                </p>
              </div>
            </div>
          </div>

          {/* Formula Display Box */}
          <div className="premium-card p-6 sm:p-8 relative overflow-hidden">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
              {t("formulaHeader")}
            </p>
            <div className="bg-bg border border-border/60 p-4 font-mono text-xs text-ink leading-relaxed break-all rounded-md">
              {formulaString}
            </div>
          </div>
        </div>
      </div>

      {/* Explainer Prose Section (Bilingual Tab Toggle) */}
      <section className="border-t border-border/60 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {t("explainerHeading")}
            </p>
            <p className="mt-1 font-sans text-sm text-muted italic">
              {t("explainerSub")}
            </p>
          </div>

        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {EXPLAINER_KEYS.map((key) => (
            <div
              key={key}
              className="premium-card p-6 relative flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
                  {t(`explainer.${key}.heading`)}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                  {t(`explainer.${key}.text`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
