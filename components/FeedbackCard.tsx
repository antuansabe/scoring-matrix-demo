"use client";

import { useState, useEffect } from "react";
import type {
  DimensionKey,
  DimensionScore,
  FeedbackResult,
  GenreTag,
} from "@/lib/types";

const TEAL = "#2A4F4F";
const TERRACOTTA = "#C44536";

const LOADING_MESSAGES = [
  "Reading the structure of your text...",
  "Mapping who acts and who doesn't...",
  "Identifying what the language does...",
  "Drafting your feedback...",
];

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
  const [status, setStatus] = useState<FeedbackStatus>(
    initialState === "loaded" && data ? "done" : "idle",
  );
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(
    initialState === "loaded" && data ? data : null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);

  // Cycle through loading messages every 5 s while the Sonnet call is running.
  useEffect(() => {
    if (status !== "loading") return;
    setMsgIdx(0);
    const id = setInterval(
      () => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length),
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
        body: JSON.stringify({ text, scores, genre }),
      });
      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "An unexpected error occurred while generating feedback.";
        setErrorMsg(msg);
        setStatus("error");
        return;
      }

      const result = data as FeedbackResult;
      setFeedbackResult(result);
      setStatus("done");
      onLoaded?.(result);
    } catch {
      setErrorMsg("Could not connect to the feedback service.");
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
          Deeper Reading
        </p>
        <h2 className="mt-3 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
          Get a{" "}
          <span className="font-light italic" style={{ color: TERRACOTTA }}>
            closer look
          </span>{" "}
          at your text
        </h2>
        <p className="mt-2 max-w-[55ch] font-sans text-sm leading-relaxed text-muted">
          A structured reading of what your text says and does, with specific
          guidance to strengthen it.
        </p>
        <button
          type="button"
          onClick={requestFeedback}
          className="mt-6 px-6 py-3 font-mono text-sm uppercase tracking-widest text-white rounded-md transition-opacity hover:opacity-80"
          style={{ backgroundColor: TERRACOTTA }}
        >
          Get a closer look at your text
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
          Deeper Reading
        </p>
        <div className="mt-6 flex items-start gap-4">
          <div
            className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-border"
            style={{ borderTopColor: TEAL }}
          />
          <div>
            <p
              className="font-sans text-sm leading-relaxed text-ink"
              aria-live="polite"
            >
              {LOADING_MESSAGES[msgIdx]}
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
              This usually takes 10–30 seconds.
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
          Feedback Unavailable
        </p>
        <p className="mt-2 font-sans text-sm leading-relaxed text-ink">
          {errorMsg ?? "Something went wrong. Please try again."}
        </p>
        <button
          type="button"
          onClick={requestFeedback}
          className="mt-4 px-5 py-2 font-mono text-xs uppercase tracking-widest border border-border rounded-md text-muted transition-colors hover:text-ink hover:border-ink"
        >
          ↻ Retry
        </button>
      </div>
    );
  }

  // --- DONE ---
  if (!feedbackResult) return null;

  const summaryFields = [
    { label: "Key Messages", value: feedbackResult.summary.keyMessages },
    { label: "Who Acts & Who Doesn't", value: feedbackResult.summary.whoActs },
    { label: "The Problem", value: feedbackResult.summary.theProblem },
    { label: "The Solution", value: feedbackResult.summary.theSolution },
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
          Deeper Reading
        </p>
        <h2 className="mt-2 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
          Your Text:{" "}
          <span className="font-light italic" style={{ color: TERRACOTTA }}>
            A Closer Look
          </span>
        </h2>
      </div>

      <div className="space-y-12 px-5 py-6 sm:px-6 lg:px-8">
        {/* ── SUMMARY ── */}
        <section>
          <SectionLabel>Summary</SectionLabel>
          <div className="space-y-6">
            {summaryFields.map(({ label, value }) => (
              <div key={label}>
                <FieldLabel>{label}</FieldLabel>
                <p className="font-sans text-sm leading-relaxed text-ink">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEEDBACK ── */}
        <section>
          <SectionLabel>Feedback</SectionLabel>

          {/* What Works Well */}
          {feedbackResult.feedback.whatWorksWell.length > 0 && (
            <div className="mb-8">
              <FieldLabel>What Works Well</FieldLabel>
              <ul className="space-y-5">
                {feedbackResult.feedback.whatWorksWell.map((item, i) => (
                  <li key={i}>
                    <p className="font-sans text-sm leading-relaxed text-ink">
                      {item.observation}
                    </p>
                    {item.textAnchor && (
                      <p
                        className="mt-2 border-l-2 pl-4 font-sans text-sm italic leading-relaxed text-muted"
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
              <FieldLabel>How to Strengthen It</FieldLabel>
              <ul className="space-y-6">
                {feedbackResult.feedback.howToStrengthen.map((item, i) => (
                  <li key={i} className="space-y-2">
                    <p className="font-sans text-sm font-semibold leading-snug text-ink">
                      {item.gap}
                    </p>
                    <p className="font-sans text-sm leading-relaxed text-muted">
                      {item.whyItMatters}
                    </p>
                    <div
                      className="rounded-sm border px-4 py-3 font-sans text-sm leading-relaxed text-ink"
                      style={{
                        backgroundColor: `${TERRACOTTA}0A`,
                        borderColor: `${TERRACOTTA}28`,
                      }}
                    >
                      <span
                        className="mb-1 block font-mono text-[0.65rem] uppercase tracking-widest"
                        style={{ color: TERRACOTTA }}
                      >
                        Reframe
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
              A Question to Sit With
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
