"use client";

import { useReducer, useState, useRef, useEffect } from "react";
import pLimit from "p-limit";
import { countWords } from "@/lib/text";
import { CountUpNumber } from "@/components/CountUpNumber";
import { ScoreCard } from "@/components/ScoreCard";
import { RadarProfile } from "@/components/RadarProfile";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { JustificationQuotes } from "@/components/JustificationQuotes";
import type { AnalysisResult } from "@/lib/types";

const ANALYZING_MESSAGES = [
  "Reading the architecture of the text...",
  "Identifying agency patterns...",
  "Mapping systemic framing...",
  "Analyzing empathy quality...",
  "Evaluating collaboration signals...",
  "Assessing identity embodiment...",
  "Extracting key quotes...",
  "Computing paradigm enactment score...",
  "Calibrating dimension weights...",
  "Finalizing analysis...",
];

const SYNTHESIS_MESSAGES = [
  "Reading all articles...",
  "Identifying community narrative patterns...",
  "Analyzing Hello World shifts across the corpus...",
  "Mapping paradigm distribution...",
  "Finding standout voices...",
  "Identifying geographic coverage...",
  "Writing executive summary...",
  "Generating narrative insights...",
  "Compiling the report...",
];

function AnalyzingMessage({ messages = ANALYZING_MESSAGES }: { messages?: string[] }) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    if (mediaQuery.matches) {
      return;
    }

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);

    return () => {
      clearInterval(interval);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [messages.length]);

  if (reduceMotion) {
    return (
      <span className="font-mono text-xs text-muted italic">
        Analyzing...
      </span>
    );
  }

  return (
    <span className="font-mono text-xs text-muted italic inline-flex items-center">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block mr-2 shrink-0" />
      {messages[index]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// State Machine Types
// ---------------------------------------------------------------------------

type BatchItem = {
  id: string;                    // crypto.randomUUID()
  journalistName: string;
  articleTitle: string;
  text: string;                  // pasted article text
  wordCount: number;             // computed using countWords
  status: 'pending' | 'analyzing' | 'done' | 'failed';
  result?: AnalysisResult;       // consolidated analyzer output
  error?: string;
};

function getItemName(item: { journalistName: string; articleTitle: string }): string {
  if (item.journalistName && item.articleTitle) {
    return `${item.journalistName} · ${item.articleTitle}`;
  }
  return item.journalistName || item.articleTitle || "";
}

type BatchState = {
  phase: 'idle' | 'adding' | 'processing' | 'done';
  items: BatchItem[];
  processedCount: number;
  reportPhase: 'idle' | 'generating' | 'ready' | 'error';
  batchNameInput: string;
  reportError?: string;
};

type BatchAction =
  | { type: 'ADD_ITEM'; item: BatchItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'START_PROCESSING' }
  | { type: 'SET_ANALYZING'; id: string }
  | { type: 'SET_DONE'; id: string; result: AnalysisResult }
  | { type: 'SET_FAILED'; id: string; error: string }
  | { type: 'FINISH_PROCESSING' }
  | { type: 'RESET' }
  | { type: 'RETRY_ITEM'; id: string }
  | { type: 'SET_REPORT_PHASE'; phase: 'idle' | 'generating' | 'ready' | 'error' }
  | { type: 'SET_BATCH_NAME'; name: string }
  | { type: 'SET_REPORT_ERROR'; error: string };

// ---------------------------------------------------------------------------
// State Reducer
// ---------------------------------------------------------------------------

function batchReducer(state: BatchState, action: BatchAction): BatchState {
  switch (action.type) {
    case 'RESET':
      return {
        phase: 'idle',
        items: [],
        processedCount: 0,
        reportPhase: 'idle',
        batchNameInput: "",
        reportError: undefined,
      };

    case 'ADD_ITEM': {
      const nextPhase = state.phase === 'done' ? 'adding' : (state.phase === 'idle' ? 'adding' : state.phase);
      return {
        ...state,
        phase: nextPhase,
        items: [...state.items, action.item],
      };
    }

    case 'REMOVE_ITEM': {
      const filtered = state.items.filter((item) => item.id !== action.id);
      return {
        ...state,
        phase: filtered.length === 0 ? 'idle' : state.phase,
        items: filtered,
      };
    }

    case 'START_PROCESSING':
      return {
        ...state,
        phase: 'processing',
        processedCount: 0,
      };

    case 'SET_ANALYZING':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, status: 'analyzing' } : item
        ),
      };

    case 'SET_DONE':
      return {
        ...state,
        processedCount: state.processedCount + 1,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, status: 'done', result: action.result, error: undefined }
            : item
        ),
      };

    case 'SET_FAILED':
      return {
        ...state,
        processedCount: state.processedCount + 1,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, status: 'failed', error: action.error }
            : item
        ),
      };

    case 'FINISH_PROCESSING':
      return {
        ...state,
        phase: 'done',
      };

    case 'RETRY_ITEM': {
      const nextPhase = state.phase === 'done' ? 'adding' : state.phase;
      return {
        ...state,
        phase: nextPhase,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, status: 'pending', error: undefined, result: undefined }
            : item
        ),
      };
    }

    case 'SET_REPORT_PHASE':
      return {
        ...state,
        reportPhase: action.phase,
      };

    case 'SET_BATCH_NAME':
      return {
        ...state,
        batchNameInput: action.name,
      };

    case 'SET_REPORT_ERROR':
      return {
        ...state,
        reportError: action.error,
      };

    default:
      return state;
  }
}

// Helper to resolve paradigm name to its corresponding accent color
function getParadigmColor(name: string): string {
  switch (name) {
    case "Spectator":
      return "#7A6B3E";
    case "Sympathizer":
      return "#B5341E";
    case "Contributor":
      return "#7A6B3E";
    case "Changemaker":
      return "#3D5A6C";
    case "System Architect":
      return "#2A5A3E";
    default:
      return "#C44536";
  }
}

export function BatchView() {
  const [state, dispatch] = useReducer(batchReducer, {
    phase: 'idle',
    items: [],
    processedCount: 0,
    reportPhase: 'idle',
    batchNameInput: "",
  });

  const [journalistName, setJournalistName] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [text, setText] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [reportBlobUrl, setReportBlobUrl] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const wordCount = countWords(text);
  const isWordCountOutOfRange = wordCount > 0 && (wordCount < 50 || wordCount > 7000);
  const isAddDisabled = !journalistName.trim() || !text.trim() || wordCount < 50 || wordCount > 7000;

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAddDisabled) return;

    const newItem: BatchItem = {
      id: crypto.randomUUID(),
      journalistName: journalistName.trim(),
      articleTitle: articleTitle.trim(),
      text: text.trim(),
      wordCount,
      status: 'pending',
    };

    dispatch({ type: 'ADD_ITEM', item: newItem });

    setJournalistName("");
    setArticleTitle("");
    setText("");

    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ---------------------------------------------------------------------------
  // Concurrency and Processing Logic
  // ---------------------------------------------------------------------------

  async function processAll() {
    const pendingItems = state.items.filter((i) => i.status === 'pending');
    if (pendingItems.length === 0) return;

    dispatch({ type: 'START_PROCESSING' });

    const limit = pLimit(2); // maximum 2 concurrent HTTP calls

    await Promise.all(
      pendingItems.map((item) =>
        limit(async () => {
          dispatch({ type: 'SET_ANALYZING', id: item.id });
          try {
            const res = await fetch('/api/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: item.text }),
            });
            if (!res.ok) {
              const errText = await res.text();
              let parsedErr = "The analysis service is busy right now. Use the Retry button to try this text again.";
              try {
                const json = JSON.parse(errText);
                if (json.error) {
                  if (json.error === "Could not complete the analysis. Please try again.") {
                    parsedErr = "The analysis service is busy right now. Use the Retry button to try this text again.";
                  } else {
                    parsedErr = json.error;
                  }
                }
              } catch {
                parsedErr = "The analysis service is busy right now. Use the Retry button to try this text again.";
              }
              throw new Error(parsedErr);
            }
            const result: AnalysisResult = await res.json();
            dispatch({ type: 'SET_DONE', id: item.id, result });
          } catch (err: any) {
            dispatch({
              type: 'SET_FAILED',
              id: item.id,
              error: err.message || "Unknown error occurred",
            });
          }
        })
      )
    );

    dispatch({ type: 'FINISH_PROCESSING' });
  }

  // ---------------------------------------------------------------------------
  // Downloader Implementations
  // ---------------------------------------------------------------------------

  const downloadJSON = () => {
    const doneItems = state.items.filter((i) => i.status === 'done' && i.result);
    const dateStr = new Date().toISOString().split("T")[0];

    const paradigmDistribution = {
      "Spectator": 0,
      "Sympathizer": 0,
      "Contributor": 0,
      "Changemaker": 0,
      "System Architect": 0,
    };
    doneItems.forEach((i) => {
      const pName = i.result?.score.paradigmName;
      if (pName && pName in paradigmDistribution) {
        paradigmDistribution[pName as keyof typeof paradigmDistribution]++;
      }
    });

    const eachDistribution: Record<string, number> = {
      "Youth in Charge": 0,
      "Interconnected Teams": 0,
      "Empathy-based Societies": 0,
      "Full EACH Alignment": 0,
      "Emerging": 0,
    };
    doneItems.forEach((i) => {
      const orientation = i.result?.score.eachOrientation;
      if (orientation) {
        eachDistribution[orientation] = (eachDistribution[orientation] || 0) + 1;
      }
    });

    const articles = doneItems.map((item) => {
      const res = item.result!;
      return {
        name: getItemName(item),
        wordCount: item.wordCount,
        enactmentScore: res.score.enactmentScore,
        paradigmName: res.score.paradigmName,
        eachOrientation: res.score.eachOrientation,
        dimensionScores: {
          D1: res.score.dimensions.D1.score,
          D2: res.score.dimensions.D2.score,
          D3: res.score.dimensions.D3.score,
          D4: res.score.dimensions.D4.score,
          D5: res.score.dimensions.D5.score,
        },
        dimensionJustifications: {
          D1: res.score.dimensions.D1.justification,
          D2: res.score.dimensions.D2.justification,
          D3: res.score.dimensions.D3.justification,
          D4: res.score.dimensions.D4.justification,
          D5: res.score.dimensions.D5.justification,
        },
        extraction: {
          actors: res.extraction.actors,
          problemQuotes: res.extraction.problemQuotes,
          solutionQuotes: res.extraction.solutionQuotes,
          geography: res.extraction.geography,
          helloWorldShifts: {
            shift1_contribution: res.extraction.helloWorldShifts.shift1_contribution,
            shift2_sharedExperience: res.extraction.helloWorldShifts.shift2_sharedExperience,
            shift3_valueOfContributions: res.extraction.helloWorldShifts.shift3_valueOfContributions,
            shift4_fluidCommunities: res.extraction.helloWorldShifts.shift4_fluidCommunities,
          },
        },
      };
    });

    const data = {
      exportedAt: new Date().toISOString(),
      totalAnalyzed: doneItems.length,
      failed: state.items.filter((i) => i.status === 'failed').length,
      averageEnactmentScore:
        doneItems.length > 0
          ? parseFloat(
              (
                doneItems.reduce((acc, i) => acc + (i.result?.score.enactmentScore ?? 0), 0) /
                doneItems.length
              ).toFixed(1)
            )
          : 0,
      paradigmDistribution,
      eachDistribution,
      articles,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analysis-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const dateStr = new Date().toISOString().split("T")[0];

    const escapeCSV = (val: any): string => {
      if (val === undefined || val === null) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      "Name",
      "Score",
      "Paradigm",
      "EACH Orientation",
      "D1",
      "D2",
      "D3",
      "D4",
      "D5",
      "Actors",
      "Problem Quotes",
      "Solution Quotes",
      "Geography",
      "HW Shift 1",
      "HW Shift 2",
      "HW Shift 3",
      "HW Shift 4",
    ];

    const rows = [headers.join(",")];

    state.items.forEach((item) => {
      if (item.status === 'failed') {
        rows.push(
          [
            escapeCSV(getItemName(item)),
            "failed",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ].join(",")
        );
      } else if (item.status === 'done' && item.result) {
        const res = item.result;
        rows.push(
          [
            escapeCSV(getItemName(item)),
            escapeCSV(res.score.enactmentScore),
            escapeCSV(res.score.paradigmName),
            escapeCSV(res.score.eachOrientation),
            escapeCSV(res.score.dimensions.D1.score),
            escapeCSV(res.score.dimensions.D2.score),
            escapeCSV(res.score.dimensions.D3.score),
            escapeCSV(res.score.dimensions.D4.score),
            escapeCSV(res.score.dimensions.D5.score),
            escapeCSV(res.extraction.actors.join(" | ")),
            escapeCSV(res.extraction.problemQuotes.join(" | ")),
            escapeCSV(res.extraction.solutionQuotes.join(" | ")),
            escapeCSV(res.extraction.geography.join(" | ")),
            escapeCSV(res.extraction.helloWorldShifts.shift1_contribution.join(" | ")),
            escapeCSV(res.extraction.helloWorldShifts.shift2_sharedExperience.join(" | ")),
            escapeCSV(res.extraction.helloWorldShifts.shift3_valueOfContributions.join(" | ")),
            escapeCSV(res.extraction.helloWorldShifts.shift4_fluidCommunities.join(" | ")),
          ].join(",")
        );
      }
    });

    const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analysis-summary-${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ---------------------------------------------------------------------------
  // Narrative Report Generation
  // ---------------------------------------------------------------------------

  const handleDownloadCachedReport = () => {
    if (!reportBlobUrl) return;
    const link = document.createElement("a");
    link.href = reportBlobUrl;
    const dateStr = new Date().toISOString().split("T")[0];
    link.download = `narrative-report-${dateStr}.docx`;
    link.click();
  };

  const handleGenerateReport = async () => {
    dispatch({ type: 'SET_REPORT_PHASE', phase: 'generating' });
    dispatch({ type: 'SET_REPORT_ERROR', error: "" });

    // Clean up old report blob URL if any
    if (reportBlobUrl) {
      URL.revokeObjectURL(reportBlobUrl);
      setReportBlobUrl(null);
    }

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: state.items
            .filter((i) => i.status === 'done' && i.result)
            .map((i) => ({ ...i.result, name: getItemName(i) })),
          batchName: state.batchNameInput || undefined,
          exportedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let parsedErr = "Failed to generate report";
        try {
          const json = JSON.parse(errText);
          if (json.error) parsedErr = json.error;
        } catch {
          parsedErr = errText || `HTTP ${response.status}`;
        }
        throw new Error(parsedErr);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setReportBlobUrl(url);

      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      link.download = `narrative-report-${dateStr}.docx`;
      link.click();

      dispatch({ type: 'SET_REPORT_PHASE', phase: 'ready' });
    } catch (err: any) {
      dispatch({ type: 'SET_REPORT_PHASE', phase: 'error' });
      dispatch({ type: 'SET_REPORT_ERROR', error: err.message || "An unexpected error occurred during synthesis." });
    }
  };

  const handleReset = () => {
    if (reportBlobUrl) {
      URL.revokeObjectURL(reportBlobUrl);
      setReportBlobUrl(null);
    }
    dispatch({ type: 'RESET' });
  };

  // ---------------------------------------------------------------------------
  // Stats Calculations
  // ---------------------------------------------------------------------------

  const doneItems = state.items.filter((i) => i.status === 'done');
  const nAnalyzed = doneItems.length;
  const nFailed = state.items.filter((i) => i.status === 'failed').length;

  const avgScore =
    nAnalyzed > 0
      ? Math.round(
          doneItems.reduce((acc, i) => acc + (i.result?.score.enactmentScore ?? 0), 0) / nAnalyzed
        )
      : 0;

  const counts: Record<string, number> = {};
  doneItems.forEach((i) => {
    const pName = i.result?.score.paradigmName;
    if (pName) {
      counts[pName] = (counts[pName] || 0) + 1;
    }
  });

  let mostCommonParadigm = "—";
  let maxCount = 0;
  Object.entries(counts).forEach(([pName, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonParadigm = pName;
    }
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* ── SECCIÓN "ADD TEXTS" ── */}
      {state.phase !== 'processing' && state.phase !== 'done' && (
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">
            ADD TEXTS TO YOUR BATCH
          </p>

          <form onSubmit={handleAddItem} className="border border-border bg-surface p-6 lg:p-8 rounded-sm">
            <div>
              <label htmlFor="journalist-name-input" className="block font-mono text-xs uppercase tracking-widest text-muted mb-2">
                JOURNALIST NAME
              </label>
              <input
                id="journalist-name-input"
                type="text"
                value={journalistName}
                onChange={(e) => setJournalistName(e.target.value)}
                ref={nameInputRef}
                className="w-full bg-transparent border-b border-border pb-1 text-ink font-sans focus:outline-none focus:border-accent text-sm"
                placeholder="e.g. Lucía Torres"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="article-title-input" className="block font-mono text-xs uppercase tracking-widest text-muted mb-2">
                ARTICLE TITLE
              </label>
              <input
                id="article-title-input"
                type="text"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                className="w-full bg-transparent border-b border-border pb-1 text-ink font-sans focus:outline-none focus:border-accent text-sm"
                placeholder="e.g. March piece"
              />
            </div>

            <div className="mt-6">
              <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-2">
                Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full min-h-[180px] resize-y bg-transparent border border-border p-3 text-ink font-sans focus:outline-none focus:border-accent text-sm rounded-sm"
                placeholder="Paste article text here..."
              />
              <div
                className={`mt-2 font-mono text-xs ${isWordCountOutOfRange ? "text-accent" : "text-muted"}`}
              >
                {wordCount} words
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isAddDisabled}
                className="font-display bg-accent text-white px-5 py-2 text-sm hover:bg-opacity-95 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Add to batch →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── LISTA DE TEXTOS AÑADIDOS ── */}
      {state.items.length > 0 && state.phase !== 'processing' && state.phase !== 'done' && (
        <div className="mt-12 space-y-6">
          <div className="flex items-baseline justify-between border-b border-border pb-2">
            <h3 className="font-mono text-xs uppercase tracking-widest text-ink">
              Queue ({state.items.length})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {state.items.map((item) => {
              const isPending = item.status === 'pending';
              const isAnalyzing = item.status === 'analyzing';
              const isDone = item.status === 'done';
              const isFailed = item.status === 'failed';
              return (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {isPending && (
                      <div className="w-3 h-3 rounded-full border-2 border-border shrink-0" title="Pending" />
                    )}
                    {isAnalyzing && (
                      <div className="w-3 h-3 rounded-full border-2 border-accent animate-pulse shrink-0" title="Analyzing" />
                    )}
                    {isDone && (
                      <div className="w-3 h-3 rounded-full bg-[#2A5A3E] shrink-0" title="Done" />
                    )}
                    {isFailed && (
                      <div className="w-3 h-3 rounded-full bg-[#C44536] shrink-0" title="Failed" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                        <span className="font-display font-medium text-lg text-ink truncate">
                          {getItemName(item)}
                        </span>
                        <span className="font-mono text-xs text-muted shrink-0">
                          ({item.wordCount} words)
                        </span>
                        {isDone && item.result && (
                          <span className="font-mono text-xs text-muted">
                            · {item.result.score.enactmentScore}/100 · {item.result.score.paradigmName}
                          </span>
                        )}
                        {isFailed && (
                          <span className="font-mono text-xs text-[#C44536]">
                            · failed
                          </span>
                        )}
                      </div>
                      {isFailed && item.error && (
                        <div className="mt-1 font-mono text-xs text-[#C44536] max-w-xl break-words">
                          Error: {item.error}
                        </div>
                      )}
                      {isAnalyzing && (
                        <div className="mt-1">
                          <AnalyzingMessage />
                        </div>
                      )}
                    </div>
                  </div>
                  {isPending && (
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
                      className="text-muted hover:text-accent font-mono text-lg font-bold px-2 cursor-pointer transition-colors"
                      title="Remove from batch"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="font-mono text-xs text-muted mt-2">
            {state.items.length} {state.items.length === 1 ? "text" : "texts"} added · {Math.round(state.items.reduce((sum, i) => sum + i.wordCount, 0) / state.items.length)} words average
          </div>
        </div>
      )}

      {/* ── BOTÓN PRINCIPAL ── */}
      {state.items.filter((i) => i.status === 'pending').length > 0 && state.phase !== 'processing' && state.phase !== 'done' && (
        <div className="mt-8">
          <button
            onClick={processAll}
            className="font-display text-xl bg-accent text-white w-full py-4 hover:bg-opacity-95 transition-colors cursor-pointer"
          >
            Analyze {state.items.filter((i) => i.status === 'pending').length} {state.items.filter((i) => i.status === 'pending').length === 1 ? 'text' : 'texts'} →
          </button>
        </div>
      )}

      {/* ── SECCIÓN PROGRESS ── */}
      {state.phase === 'processing' && (
        <div className="mt-12 space-y-8 animate-fade-in">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              ANALYZING
            </p>
            <div className="font-display font-light text-[64px] leading-none text-ink mt-2">
              <CountUpNumber value={state.processedCount} animate={true} />
              <span className="text-muted text-2xl font-mono ml-2">/ {state.items.length}</span>
            </div>
            <div className="mt-2 min-h-[1.5rem]">
              <AnalyzingMessage />
            </div>
          </div>

          <div className="w-full h-[2px] bg-border rounded-full overflow-hidden">
            <div
              className="bg-accent h-full transition-all duration-400 ease-out"
              style={{ width: `${(state.processedCount / state.items.length) * 100}%` }}
            />
          </div>

          <p className="font-mono text-xs text-muted italic text-center">
            Processing takes 20–30 seconds per text. Please keep this tab open.
          </p>

          <div className="divide-y divide-border mt-8">
            {state.items.map((item) => {
              const isPending = item.status === 'pending';
              const isAnalyzing = item.status === 'analyzing';
              const isDone = item.status === 'done';
              const isFailed = item.status === 'failed';
              return (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {isPending && (
                      <div className="w-3 h-3 rounded-full border-2 border-border shrink-0" />
                    )}
                    {isAnalyzing && (
                      <div className="w-3 h-3 rounded-full border-2 border-accent animate-pulse shrink-0" />
                    )}
                    {isDone && (
                      <div className="w-3 h-3 rounded-full bg-[#2A5A3E] shrink-0" />
                    )}
                    {isFailed && (
                      <div className="w-3 h-3 rounded-full bg-[#C44536] shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                        <span className="font-display font-medium text-lg text-ink truncate">
                          {getItemName(item)}
                        </span>
                        <span className="font-mono text-xs text-muted shrink-0">
                          ({item.wordCount} words)
                        </span>
                        {isDone && item.result && (
                          <span className="font-mono text-xs text-muted">
                            · {item.result.score.enactmentScore}/100 · {item.result.score.paradigmName}
                          </span>
                        )}
                        {isFailed && (
                          <span className="font-mono text-xs text-[#C44536]">
                            · failed
                          </span>
                        )}
                      </div>
                      {isFailed && item.error && (
                        <div className="mt-1 font-mono text-xs text-[#C44536] max-w-xl break-words">
                          Error: {item.error}
                        </div>
                      )}
                      {isAnalyzing && (
                        <div className="mt-1">
                          <AnalyzingMessage />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SECCIÓN RESULTS ── */}
      {state.phase === 'done' && (
        <div className="mt-12 space-y-12 animate-fade-in">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted text-center mb-6">
              BATCH COMPLETE
            </p>

            <div className="grid grid-cols-3 divide-x divide-border text-center">
              <div>
                <div className="font-display font-light text-[40px] sm:text-[48px] text-ink">
                  {nAnalyzed}
                </div>
                <div className="font-mono text-[10px] sm:text-xs text-muted uppercase tracking-widest mt-1">
                  Analyzed
                </div>
              </div>
              <div>
                <div className="font-display font-light text-[40px] sm:text-[48px] text-ink">
                  {avgScore}
                </div>
                <div className="font-mono text-[10px] sm:text-xs text-muted uppercase tracking-widest mt-1">
                  Avg Score
                </div>
              </div>
              <div>
                <div className="font-display font-light text-[22px] sm:text-[30px] text-ink leading-tight pt-1 truncate px-2" title={mostCommonParadigm}>
                  {mostCommonParadigm}
                </div>
                <div className="font-mono text-[10px] sm:text-xs text-muted uppercase tracking-widest mt-2">
                  Most Common
                </div>
              </div>
            </div>
          </div>

          {nFailed > 0 && (
            <div className="bg-[#FAF7F0] border border-border p-4 rounded-sm text-center">
              <p className="font-mono text-xs text-accent">
                {nFailed} {nFailed === 1 ? "text" : "texts"} could not be analyzed.
              </p>
            </div>
          )}

          <div className="mt-8 flex gap-4 flex-wrap justify-center">
            <button
              onClick={downloadJSON}
              className="font-display bg-accent text-white px-6 py-3 hover:bg-opacity-95 transition-colors cursor-pointer text-sm"
            >
              Download Analysis Data (JSON) ↓
            </button>
            <button
              onClick={downloadCSV}
              className="font-display border border-accent text-accent bg-transparent px-6 py-3 hover:bg-accent hover:text-white transition-all cursor-pointer text-sm"
            >
              Download Summary Table (CSV) ↓
            </button>
          </div>

          <p className="font-mono text-xs text-muted text-center max-w-md mx-auto mt-2 leading-relaxed">
            Paste the JSON into Claude.ai or ChatGPT to generate your community narrative synthesis.
          </p>

          <div className="mt-10 pt-10 border-t border-border">
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-6">
              INDIVIDUAL RESULTS
            </p>

            <div className="space-y-6">
              {state.items.map((item) => {
                if (item.status === 'done' && item.result) {
                  const res = item.result;
                  const isOpen = !!expandedIds[item.id];
                  const accentColor = getParadigmColor(res.score.paradigmName);
                  return (
                    <div key={item.id} className="border border-border bg-surface rounded-sm overflow-hidden">
                      <div
                        onClick={() => toggleExpanded(item.id)}
                        className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-bg/20 transition-colors"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="font-display text-xl font-medium text-ink">
                            {getItemName(item)}
                          </span>
                          <span className="font-mono text-sm text-muted">
                            · {res.score.enactmentScore}/100
                          </span>
                          <span className="font-mono text-xs uppercase tracking-widest px-2 py-0.5 border border-border text-ink bg-bg/50">
                            {res.score.paradigmName}
                          </span>
                        </div>
                        <button
                          className="font-mono text-xs uppercase tracking-widest text-accent font-medium cursor-pointer"
                        >
                          {isOpen ? "Hide analysis ↑" : "See full analysis ↓"}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="border-t border-border p-5 sm:p-6 lg:p-8 bg-bg/10 space-y-8 animate-fade-in">
                          <ScoreCard result={res.score} accentColor={accentColor} animateScore={false} />
                          <div className="grid gap-8 lg:grid-cols-2">
                            <ScoreBreakdown result={res.score} accentColor={accentColor} />
                            <RadarProfile result={res.score} accentColor={accentColor} />
                          </div>
                          <JustificationQuotes result={res.score} accentColor={accentColor} />
                        </div>
                      )}
                    </div>
                  );
                }

                if (item.status === 'failed') {
                  return (
                    <div key={item.id} className="p-4 border border-border bg-surface rounded-sm flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-[#C44536]" />
                          <span className="font-display font-medium text-lg text-ink">
                            {getItemName(item)}
                          </span>
                        </div>
                        {item.error && (
                          <div className="mt-1 font-mono text-xs text-[#C44536] max-w-xl break-words pl-6">
                            Error: {item.error}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'RETRY_ITEM', id: item.id })}
                        className="font-mono text-xs uppercase tracking-widest text-accent border border-accent/20 px-3 py-1.5 hover:bg-accent/5 hover:border-accent transition-all cursor-pointer"
                      >
                        Retry →
                      </button>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* ── SECCIÓN "GENERATE REPORT" ── */}
          {nAnalyzed > 0 && (
            <div className="mt-12 pt-10 border-t border-border animate-fade-in">
              <p className="font-mono text-xs uppercase tracking-widest text-muted mb-6">
                NARRATIVE REPORT
              </p>

              <div className="bg-surface border border-border p-6 rounded-sm">
                {state.reportPhase === 'idle' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-2">
                        Batch or client name (optional)
                      </label>
                      <input
                        type="text"
                        value={state.batchNameInput}
                        onChange={(e) => dispatch({ type: 'SET_BATCH_NAME', name: e.target.value })}
                        className="w-full bg-transparent border-b border-border pb-1 text-ink font-sans focus:outline-none focus:border-accent text-sm"
                        placeholder="e.g. Hola América · May 2026"
                      />
                    </div>
                    
                    <p className="font-mono text-xs text-muted leading-relaxed">
                      The instrument will synthesize all {nAnalyzed} analyzed texts into a structured narrative report — community paradigm profile, Hello World shifts, key patterns, and full data appendix.
                    </p>
                    
                    <button
                      onClick={handleGenerateReport}
                      className="font-display bg-accent text-white w-full py-4 text-lg hover:bg-opacity-95 transition-colors cursor-pointer font-medium"
                    >
                      Generate Narrative Report →
                    </button>
                  </div>
                )}

                {state.reportPhase === 'generating' && (
                  <div className="text-center py-6 space-y-3">
                    <div className="flex justify-center items-center">
                      <AnalyzingMessage messages={SYNTHESIS_MESSAGES} />
                    </div>
                    <p className="font-mono text-xs text-muted italic">
                      This may take 30–60 seconds for large batches.
                    </p>
                  </div>
                )}

                {state.reportPhase === 'ready' && (
                  <div className="text-center py-4 space-y-4">
                    <div className="flex justify-center items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2A5A3E] text-white flex items-center justify-center font-bold text-xs">✓</span>
                      <span className="font-display text-xl text-ink font-medium">Report ready</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={handleDownloadCachedReport}
                        className="font-display bg-accent text-white px-8 py-3 hover:bg-opacity-95 transition-colors cursor-pointer text-base"
                      >
                        Download Report (Word) ↓
                      </button>
                      <p className="font-mono text-xs text-muted max-w-sm mx-auto leading-relaxed">
                        Open in Word, Google Docs, or Pages to review and edit before sharing.
                      </p>
                    </div>
                  </div>
                )}

                {state.reportPhase === 'error' && (
                  <div className="space-y-4 text-center py-4">
                    <p className="font-mono text-xs text-accent">
                      {state.reportError || "Failed to generate report."}
                    </p>
                    <button
                      onClick={() => dispatch({ type: 'SET_REPORT_PHASE', phase: 'idle' })}
                      className="font-mono text-xs uppercase tracking-widest text-accent font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center pt-8">
            <button
              onClick={handleReset}
              className="font-mono text-sm text-muted underline hover:text-ink cursor-pointer bg-transparent border-0"
            >
              Start new batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
