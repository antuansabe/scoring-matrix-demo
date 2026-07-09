"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type {
  DimensionKey,
  DimensionScore,
  FeedbackResult,
  GenreTag,
} from "@/lib/types";

const TEAL = "#2A4F4F";
const TERRACOTTA = "#C44536";

type FeedbackStatus = "idle" | "loading" | "done" | "error";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-widest text-muted border-b border-border pb-3 mb-6">
      {children}
    </p>
  );
}

function FieldLabel({
  children,
  color = TEAL,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <p
      className="font-mono text-xs uppercase tracking-widest mb-2"
      style={{ color }}
    >
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * On-demand Feedback Card for the Live Analyzer results.
 * State machine: idle → loading → done / error.
 * Calls POST /api/feedback with the current text, scores, and genre.
 *
 * Batch mode: pass `initialState="loaded"` and `data={feedbackResult}` to
 * skip the state machine and render the loaded state immediately.
 * In that case, `text`, `scores`, and `genre` may be omitted.
 */
export function FeedbackCard({
  text,
  scores,
  genre,
  initialState = "idle",
  data,
  onLoaded,
}: {
  text?: string;
  scores?: Record<DimensionKey, DimensionScore>;
  genre?: GenreTag;
  /** Skips the idle/loading flow and renders the result immediately. */
  initialState?: "idle" | "loaded";
  /** Required when initialState is "loaded". */
  data?: FeedbackResult;
  /** Called once a live fetch (not the "loaded" prop path) succeeds. */
  onLoaded?: (result: FeedbackResult) => void;
}) {
  const t = useTranslations("feedback");
  const loadingMessages = [t("loading1"), t("loading2"), t("loading3"), t("loading4")];
  const [status, setStatus] = useState<FeedbackStatus>(
    initialState === "loaded" && data ? "done" : "idle",
  );
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(
    initialState === "loaded" && data ? data : null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  // Whose discourse the text is (Decision #5 / Phase 6). Chosen here because
  // the Deeper Reading runs before any subject is picked in the intake form,
  // so subject.type is not yet known. Individual = original behavior.
  const [subjectVoice, setSubjectVoice] = useState<"individual" | "organization">("individual");

  // Cycle through loading messages every 5 s while the Sonnet call is running.
  useEffect(() => {
    if (status !== "loading") return;
    setMsgIdx(0);
    const id = setInterval(
      () => setMsgIdx((i) => (i + 1) % loadingMessages.length),
      5000,
    );
    return () => clearInterval(id);
  }, [status]);

  async function requestFeedback() {
    if (!text || !scores || !genre) return;
    setStatus("loading");
    setErrorMsg(null);
    setFeedbackResult(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // subjectVoice only sent for organizations, keeping the individual
        // request shape identical to pre-Phase-6.
        body: JSON.stringify({
          text,
          scores,
          genre,
          ...(subjectVoice === "organization" ? { subjectVoice } : {}),
        }),
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

      const result = data as FeedbackResult;
      setFeedbackResult(result);
      setStatus("done");
      onLoaded?.(result);
    } catch {
      setErrorMsg(t("errorConnect"));
      setStatus("error");
    }
  }

  // --- IDLE ---
  if (status === "idle") {
    return (
      <div
        className="border border-border bg-surface p-5 sm:p-6 lg:p-8"
        style={{ borderLeftWidth: 3, borderLeftColor: TEAL }}
      >
        <p
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: TEAL }}
        >
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
          {t("idleTitlePart1")}
          <span className="font-light italic" style={{ color: TERRACOTTA }}>
            {t("idleTitlePart2")}
          </span>
          {t("idleTitlePart3")}
        </h2>
        <p className="mt-2 max-w-[55ch] font-sans text-base leading-relaxed text-muted">
          {t("idleBody")}
        </p>

        <div className="mt-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {t("voiceLegend")}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            <label className="flex items-center gap-2 font-sans text-base text-ink">
              <input
                type="radio"
                name="subject-voice"
                checked={subjectVoice === "individual"}
                onChange={() => setSubjectVoice("individual")}
              />
              {t("voiceIndividual")}
            </label>
            <label className="flex items-center gap-2 font-sans text-base text-ink">
              <input
                type="radio"
                name="subject-voice"
                checked={subjectVoice === "organization"}
                onChange={() => setSubjectVoice("organization")}
              />
              {t("voiceOrganization")}
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={requestFeedback}
          className="mt-6 px-6 py-3 font-mono text-sm uppercase tracking-widest text-white rounded-md transition-opacity hover:opacity-80"
          style={{ backgroundColor: TERRACOTTA }}
        >
          {t("cta")}
        </button>
      </div>
    );
  }

  // --- LOADING ---
  if (status === "loading") {
    return (
      <div
        className="border border-border bg-surface p-5 sm:p-6 lg:p-8"
        style={{ borderLeftWidth: 3, borderLeftColor: TEAL }}
      >
        <p
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: TEAL }}
        >
          {t("eyebrow")}
        </p>
        <div className="mt-6 flex items-start gap-4">
          <div
            className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-border"
            style={{ borderTopColor: TEAL }}
          />
          <div>
            <p
              className="font-sans text-base leading-relaxed text-ink"
              aria-live="polite"
            >
              {loadingMessages[msgIdx]}
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
              {t("loadingTime")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR ---
  if (status === "error") {
    return (
      <div
        className="border border-border bg-surface p-5 sm:p-6 lg:p-8"
        style={{ borderLeftWidth: 3, borderLeftColor: TERRACOTTA }}
        role="alert"
      >
        <p
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: TERRACOTTA }}
        >
          {t("unavailable")}
        </p>
        <p className="mt-2 font-sans text-base leading-relaxed text-ink">
          {errorMsg ?? t("errorFallback")}
        </p>
        <button
          type="button"
          onClick={requestFeedback}
          className="mt-4 px-5 py-2 font-mono text-xs uppercase tracking-widest border border-border rounded-md text-muted transition-colors hover:text-ink hover:border-ink"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  // --- DONE ---
  if (!feedbackResult) return null;

  const summaryFields = [
    { label: t("keyMessages"), value: feedbackResult.summary.keyMessages },
    { label: t("whoActs"), value: feedbackResult.summary.whoActs },
    { label: t("theProblem"), value: feedbackResult.summary.theProblem },
    { label: t("theSolution"), value: feedbackResult.summary.theSolution },
  ];

  return (
    <div
      className="border border-border bg-surface"
      style={{ borderLeftWidth: 3, borderLeftColor: TEAL }}
    >
      {/* Card header */}
      <div className="border-b border-border px-5 pb-4 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <p
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: TEAL }}
        >
          {t("eyebrow")}
        </p>
        <h2 className="mt-2 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
          {t("doneTitlePart1")}
          <span className="font-light italic" style={{ color: TERRACOTTA }}>
            {t("doneTitlePart2")}
          </span>
        </h2>
      </div>

      <div className="space-y-12 px-5 py-6 sm:px-6 lg:px-8">
        {/* ── SUMMARY ── */}
        <section>
          <SectionLabel>{t("summary")}</SectionLabel>
          <div className="space-y-6">
            {summaryFields.map(({ label, value }) => (
              <div key={label}>
                <FieldLabel>{label}</FieldLabel>
                <p className="font-sans text-base leading-relaxed text-ink">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEEDBACK ── */}
        <section>
          <SectionLabel>{t("sectionFeedback")}</SectionLabel>

          {/* What Works Well */}
          {feedbackResult.feedback.whatWorksWell.length > 0 && (
            <div className="mb-8">
              <FieldLabel>{t("worksWell")}</FieldLabel>
              <ul className="space-y-5">
                {feedbackResult.feedback.whatWorksWell.map((item, i) => (
                  <li key={i}>
                    <p className="font-sans text-base leading-relaxed text-ink">
                      {item.observation}
                    </p>
                    {item.textAnchor && (
                      <p
                        className="mt-2 border-l-2 pl-4 font-sans text-base italic leading-relaxed text-muted"
                        style={{ borderColor: TEAL }}
                      >
                        &ldquo;{item.textAnchor}&rdquo;
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How to Strengthen It */}
          {feedbackResult.feedback.howToStrengthen.length > 0 && (
            <div>
              <FieldLabel>{t("strengthen")}</FieldLabel>
              <ul className="space-y-6">
                {feedbackResult.feedback.howToStrengthen.map((item, i) => (
                  <li key={i} className="space-y-2">
                    <p className="font-sans text-base font-semibold leading-snug text-ink">
                      {item.gap}
                    </p>
                    <p className="font-sans text-base leading-relaxed text-muted">
                      {item.whyItMatters}
                    </p>
                    <div
                      className="rounded-sm border px-4 py-3 font-sans text-base leading-relaxed text-ink"
                      style={{
                        backgroundColor: `${TERRACOTTA}0A`,
                        borderColor: `${TERRACOTTA}28`,
                      }}
                    >
                      <span
                        className="mb-1 block font-mono text-[0.65rem] uppercase tracking-widest"
                        style={{ color: TERRACOTTA }}
                      >
                        {t("reframe")}
                      </span>
                      {item.reframe}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ── THE QUESTION ── */}
        <section>
          <div
            className="rounded-sm border px-6 py-5"
            style={{
              backgroundColor: `${TEAL}0A`,
              borderColor: `${TEAL}30`,
            }}
          >
            <p
              className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest"
              style={{ color: TEAL }}
            >
              {t("question")}
            </p>
            <p className="font-display text-lg font-normal leading-relaxed text-ink sm:text-xl">
              {feedbackResult.question}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
