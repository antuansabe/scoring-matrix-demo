"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ScoreResult, GenreTag, FeedbackResult } from "@/lib/types";
import type { Subject } from "@/lib/db/types";
import { ScoreCard } from "@/components/ScoreCard";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { JustificationQuotes } from "@/components/JustificationQuotes";
import { FeedbackCard } from "@/components/FeedbackCard";
import { EntryIntakeForm } from "@/components/EntryIntakeForm";
import { ResultStory } from "@/components/ResultStory";
import { Disclosure } from "@/components/Disclosure";
import { calculateEnactmentScore, resolveParadigmName, resolveEACHOrientation } from "@/lib/paradigm";

const MIN_WORDS = 50;
const MAX_WORDS = 7000;

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

type Status = "idle" | "loading" | "done" | "error";

/** Skeleton shown while the server is scoring — warm borders, surface fill,
    subtle pulse. Shapes mirror the ScoreCard and the Radar. */
function ResultSkeleton() {
  return (
    <div className="mt-8 animate-pulse space-y-8" aria-hidden="true">
      <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
        <div className="h-3 w-48 bg-bg" />
        <div className="mt-3 h-16 w-40 bg-bg sm:h-20 lg:h-24" />
        <div className="mt-4 h-6 w-56 bg-bg" />
        <div className="mt-2 h-4 w-3/4 bg-bg" />
        <div className="mt-5 h-7 w-44 border-t border-border bg-bg" />
      </div>
      <div className="border border-border bg-surface p-4 sm:p-6 lg:p-8">
        <div className="h-3 w-40 bg-bg" />
        <div className="mx-auto mt-4 h-[220px] w-[220px] rounded-full bg-bg sm:h-[260px] sm:w-[260px]" />
      </div>
    </div>
  );
}

/** Paste-your-own-text analyzer. The only path that hits the API. */
export function LiveAnalyzer({
  initialSubjects = [],
  lockedSubject,
}: {
  initialSubjects?: Subject[];
  /** Subject-first flow (Phase 10): the intake form is locked to this subject. */
  lockedSubject?: Subject;
}) {
  const t = useTranslations("analyzer");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const words = countWords(text);
  const outOfRange = words < MIN_WORDS || words > MAX_WORDS;
  const canSubmit = !outOfRange && status !== "loading";
  const showInput = !(status === "done" && result);

  let wordCountLabel: string;
  if (words < MIN_WORDS && words > 0) {
    wordCountLabel = t("wordsMin", { count: words, min: MIN_WORDS });
  } else if (words > MAX_WORDS) {
    wordCountLabel = t("wordsMax", { count: words, max: MAX_WORDS });
  } else {
    wordCountLabel = t("words", { count: words });
  }
  const wordCountIsWarning = words > 0 && outOfRange;

  async function analyze() {
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMsg(null);
    setResult(null);
    setFeedbackResult(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : t("errorUnexpected");
        setErrorMsg(msg);
        setStatus("error");
        return;
      }
      const scoreRes = data as ScoreResult;
      setResult({
        ...scoreRes,
        detectedGenreTag: scoreRes.detectedGenreTag || scoreRes.genreTag,
        effectiveGenreTag: scoreRes.effectiveGenreTag || scoreRes.genreTag,
        genreOverridden: scoreRes.genreOverridden || false,
      });
      setStatus("done");
    } catch {
      setErrorMsg(t("errorConnect"));
      setStatus("error");
    }
  }

  function handleGenreChange(newGenre: GenreTag) {
    if (!result) return;

    const originalGenre = result.detectedGenreTag || result.genreTag;
    const isOverridden = newGenre !== originalGenre;

    const mockDims = {
      D1: { score: result.dimensions.D1.score, justification: "", quotes: [] },
      D2: { score: result.dimensions.D2.score, justification: "", quotes: [] },
      D3: { score: result.dimensions.D3.score, justification: "", quotes: [] },
      D4: { score: result.dimensions.D4.score, justification: "", quotes: [] },
      D5: { score: result.dimensions.D5.score, justification: "", quotes: [] },
    };

    const newScore = calculateEnactmentScore(mockDims, newGenre);
    const newParadigm = resolveParadigmName(newScore);
    const newEACH = resolveEACHOrientation(mockDims);

    setResult({
      ...result,
      genreTag: newGenre,
      enactmentScore: newScore,
      paradigmName: newParadigm,
      eachOrientation: newEACH,
      effectiveGenreTag: newGenre,
      detectedGenreTag: originalGenre,
      genreOverridden: isOverridden,
    });
  }

  function reset() {
    setText("");
    setResult(null);
    setErrorMsg(null);
    setFeedbackResult(null);
    setStatus("idle");
    // Wait one frame so the textarea is mounted again before we scroll/focus.
    requestAnimationFrame(() => {
      textareaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // Focus after the smooth scroll has had time to settle.
      window.setTimeout(() => textareaRef.current?.focus(), 300);
    });
  }

  return (
    <div>
      {showInput && (
        <>
          <label htmlFor="analyzer-text" className="sr-only">
            {t("textLabel")}
          </label>
          <textarea
            id="analyzer-text"
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("placeholder", { min: MIN_WORDS, max: MAX_WORDS })}
            rows={10}
            spellCheck={false}
            className="block min-h-[15rem] w-full resize-y border border-border bg-surface p-4 font-sans text-base leading-relaxed text-ink placeholder:text-muted focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300 rounded-md"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span
              className={`font-mono text-xs uppercase tracking-widest ${
                wordCountIsWarning ? "font-medium text-ink" : "text-muted"
              }`}
            >
              {wordCountLabel}
            </span>
            <button
              type="button"
              onClick={analyze}
              disabled={!canSubmit}
              className="bg-accent-cta px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-white rounded-md transition-all hover:bg-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "loading" ? t("analyzing") : t("analyze")}
            </button>
          </div>
        </>
      )}

      {status === "loading" && (
        <>
          <p className="mt-8 font-mono text-sm text-muted" aria-live="polite">
            {t("analyzingLive")}
            <span className="ml-0.5 inline-block animate-pulse">▍</span>
          </p>
          <ResultSkeleton />
        </>
      )}

      {status === "error" && errorMsg && (
        <div
          className="mt-8 border border-border bg-surface p-5 sm:p-6"
          style={{ borderLeftWidth: 3, borderLeftColor: "#E87722" }}
          role="alert"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-ink">
            <span
              className="mr-2 inline-block h-2 w-2 align-middle"
              style={{ backgroundColor: "#E87722" }}
              aria-hidden="true"
            />
            {t("errorTitle")}
          </p>
          <p className="mt-2 font-sans text-base text-ink">{errorMsg}</p>
        </div>
      )}

      {status === "done" && result && (
        <div className="space-y-8">
          {/* Story first (Phase 9): what the reading means, then the radar.
              The full expert detail — numbers, weights, justifications —
              is one labeled click away and loses nothing. */}
          <ResultStory result={result} />

          <Disclosure showLabel={t("seeFullReading")} hideLabel={t("hideFullReading")}>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
              <div>
                <ScoreCard result={result} onGenreChange={handleGenreChange} />
              </div>
              <div>
                <ScoreBreakdown result={result} />
              </div>
            </div>
            <JustificationQuotes result={result} />
          </Disclosure>

          <div className="mt-8">
            <FeedbackCard
              text={text}
              scores={result.dimensions}
              genre={result.genreTag}
              onLoaded={setFeedbackResult}
            />
          </div>

          <div className="mt-8">
            <EntryIntakeForm
              subjects={subjects}
              lockedSubject={lockedSubject}
              materialText={text}
              score={result}
              feedback={feedbackResult}
              onSaved={(subject) =>
                setSubjects((prev) => (prev.some((s) => s.id === subject.id) ? prev : [subject, ...prev]))
              }
            />
          </div>

          {/* Reset affordance — the only way back to the textarea once a result
              is showing. Editorial mono link, no border, no fill. */}
          <div className="mt-12 flex justify-center border-t border-border pt-8">
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer px-6 py-3 font-mono text-sm uppercase tracking-widest text-muted transition-colors duration-150 hover:text-accent"
            >
              <span className="mr-2" aria-hidden="true">
                ↻
              </span>
              {t("tryAnother")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
