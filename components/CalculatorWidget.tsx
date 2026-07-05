"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  DIMENSIONS,
  GENRE_WEIGHTS,
  calculateEnactmentScore,
  resolveParadigmName,
  resolveEACHOrientation,
} from "@/lib/paradigm";
import type { GenreTag, DimensionKey } from "@/lib/types";

const STRINGS = {
  inputsHeader: "SCORING PROFILE",
  outputsHeader: "CALCULATED OUTPUTS",
  genreLabel: "TEXT GENRE",
  formulaHeader: "ACTIVE FORMULA",
  explainerHeading: "Methodology Explainer · Guía metodológica",
  explainerSub: "Understand how the matrix processes language architecture / Comprendiendo el procesamiento de la arquitectura del lenguaje",
};

const EXPLAINER_SECTIONS = [
  {
    headingEn: "1. AI Scores & Code Weights",
    textEn: "The AI acts as an objective reader assigning a 0–4 score to each dimension based on linguistic signals in the text. Once these scores are assigned, the application logic applies the mathematical weights to calculate the overall score. This separation prevents the AI from directly hallucinating or biasing the final score.",
    headingEs: "1. Puntuaciones de IA y Pesos por Código",
    textEs: "La IA actúa como una lectora objetiva asignando una puntuación de 0 a 4 a cada dimensión basada en señales lingüísticas. Una vez asignadas, la lógica de la aplicación aplica los pesos matemáticos para calcular el puntaje general. Esta separación evita que la IA alucine o sesgue directamente el resultado final.",
  },
  {
    headingEn: "2. Why Weights Shift per Genre",
    textEn: "Weights shift because narrative expectations change. An institutional report is expected to focus heavily on systemic framing (D2), so D2 is weighted higher. Conversely, a social media post or fundraising copy is rhetorically constrained, so empathy (D3) or agency (D1) are weighted higher to offset structural genre constraints.",
    headingEs: "2. Por qué cambian los pesos según el género",
    textEs: "Los pesos cambian porque las expectativas narrativas varían. Se espera que un reporte institucional se enfoque fuertemente en el encuadre sistémico (D2), por lo que D2 pesa más. Por el contrario, una publicación en redes sociales o copia de recaudación de fondos está limitada retóricamente, por lo que la empatía (D3) o la agencia (D1) se ponderan más alto.",
  },
  {
    headingEn: "3. Low Weight on Identity (D5)",
    textEn: "Identity Embodiment (D5) is intentionally weighted low at 10%. Language that directly claims a 'changemaker' identity without executing it is discounted. D5 measures self-reflection, learning from failure, and power awareness — critical features that serve as a fine signal rather than the primary engine of the model.",
    headingEs: "3. Peso bajo en Identidad (D5)",
    textEs: "La Embocadura de la Identidad (D5) se pondera intencionalmente baja con un 10%. El lenguaje que reclama directamente una identidad de 'agente de cambio' sin ejecutarla se descuenta. D5 mide la autorreflexión y el aprendizaje del fracaso: señales finas en lugar del motor principal.",
  },
  {
    headingEn: "4. Deriving the EACH Orientation",
    textEn: "The EACH (Everyone a Changemaker) orientation is derived entirely from the dominant pair of dimensions in the profile (both scoring 3 or higher, and being the top dimensions), not from the overall Enactment Score. This flags whether the narrative is structurally oriented toward Lifelong Contribution (D1+D5), Changemaker Networks (D2+D4), or Empathy-based Societies (D3+D1).",
    headingEs: "4. Derivación de la Orientación EACH",
    textEs: "La orientación EACH se deriva completamente del par dominante de dimensiones en el perfil (ambas puntuando 3 o más y liderando el perfil), no de la puntuación general de Enactment. Esto identifica si la narrativa está orientada estructuralmente a la Contribución de por Vida (D1+D5), Redes de Agentes de Cambio (D2+D4) o Sociedades de Empatía (D3+D1).",
  },
];

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
  const [genre, setGenre] = useState<GenreTag>("free-form-interview");
  // Phase 11a: the methodology explainer follows the GLOBAL locale switcher
  // (its reviewed ES text stays local to this expert surface).
  const locale = useLocale();
  const lang: "en" | "es" = locale === "es" ? "es" : "en";
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
            {STRINGS.inputsHeader}
          </p>

          <div className="space-y-6">
            {/* Genre Selector */}
            <div>
              <label htmlFor="genre-select" className="block font-mono text-xs uppercase tracking-widest text-ink mb-2">
                {STRINGS.genreLabel}
              </label>
              <select
                id="genre-select"
                value={genre}
                onChange={(e) => setGenre(e.target.value as GenreTag)}
                className="block w-full border border-border bg-surface px-4 py-3 font-sans text-sm text-ink rounded-md focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300 cursor-pointer shadow-sm"
              >
                {Object.keys(GENRE_WEIGHTS).map((g) => (
                  <option key={g} value={g}>
                    {g}
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
                      {d.key} · {d.shortName}
                    </span>
                    <span className="font-mono text-[0.7rem] text-muted">
                      weight {Math.round(weights[index] * 100)}%
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
              {STRINGS.outputsHeader}
            </p>

            <div className="space-y-6">
              {/* Score Display */}
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
                  Enactment Score
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
                  Paradigm Level
                </p>
                <p className="mt-1 font-display text-xl font-semibold text-ink" style={{ color: paradigmColor }}>
                  {paradigmName}
                </p>
              </div>

              {/* EACH Orientation */}
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
                  EACH Orientation
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
              {STRINGS.formulaHeader}
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
              {STRINGS.explainerHeading}
            </p>
            <p className="mt-1 font-sans text-sm text-muted italic">
              {STRINGS.explainerSub}
            </p>
          </div>

        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {EXPLAINER_SECTIONS.map((sec, idx) => (
            <div
              key={idx}
              className="premium-card p-6 relative flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
                  {lang === "en" ? sec.headingEn : sec.headingEs}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                  {lang === "en" ? sec.textEn : sec.textEs}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
