"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Subject, SubjectType, MaterialGenre } from "@/lib/db/types";
import type { ScoreResult, FeedbackResult } from "@/lib/types";
import { detectMixedGenreHint } from "@/lib/text";

const MATERIAL_GENRE_OPTIONS: { value: MaterialGenre; label: string }[] = [
  { value: "interview", label: "Interview" },
  { value: "article", label: "Article" },
  { value: "website", label: "Website" },
  { value: "report", label: "Report" },
  { value: "social", label: "Social Media" },
  { value: "other", label: "Other" },
];

const SUBJECT_TYPE_OPTIONS: { value: SubjectType; label: string }[] = [
  { value: "jj_partner", label: "JJ Partner" },
  { value: "ngl", label: "NGL" },
];

function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const inputClass =
  "block w-full border border-border bg-surface px-3 py-2 font-sans text-sm text-ink placeholder:text-muted focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all rounded-md";
const labelClass = "font-mono text-xs uppercase tracking-widest text-muted";

type SaveStatus = "idle" | "saving" | "done" | "error";

/**
 * Turns a completed live analysis into a dated entry tied to a subject.
 * Requires the Deeper Reading feedback to already exist — `analyses.feedback_card`
 * is not-null in the schema, so there is nothing valid to persist without it.
 */
export function EntryIntakeForm({
  subjects,
  materialText,
  materialSourceUrl,
  score,
  feedback,
  onSaved,
}: {
  subjects: Subject[];
  materialText: string;
  materialSourceUrl?: string;
  score: ScoreResult;
  feedback: FeedbackResult | null;
  onSaved?: (subject: Subject) => void;
}) {
  const jjPartners = useMemo(() => subjects.filter((s) => s.type === "jj_partner"), [subjects]);
  const mixedGenreHint = useMemo(() => detectMixedGenreHint(materialText), [materialText]);

  const [mode, setMode] = useState<"existing" | "new">(subjects.length > 0 ? "existing" : "new");
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? "");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<SubjectType>("jj_partner");
  const [parentOrgId, setParentOrgId] = useState("");
  const [entryDate, setEntryDate] = useState(todayISO);
  const [materialGenre, setMaterialGenre] = useState<MaterialGenre | "">("");
  const [ashokanName, setAshokanName] = useState("");
  const [contextualNotes, setContextualNotes] = useState("");

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSubject, setSavedSubject] = useState<Subject | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

  const subjectValid =
    mode === "existing"
      ? selectedSubjectId.length > 0
      : newName.trim().length > 0 && (newType !== "ngl" || parentOrgId.length > 0);

  const canSave =
    feedback !== null &&
    subjectValid &&
    entryDate.length > 0 &&
    materialGenre.length > 0 &&
    ashokanName.trim().length > 0 &&
    status !== "saving";

  async function handleSave() {
    if (!canSave || !feedback) return;
    setStatus("saving");
    setErrorMsg(null);

    // Lens A (Genre & Mobility Tag) is the model's own genre mechanism — the
    // same one that drove the scoring weights — not the intake's materialGenre.
    const effectiveGenreTag = score.effectiveGenreTag ?? score.detectedGenreTag ?? score.genreTag;

    const payload = {
      ...(mode === "existing"
        ? { subjectId: selectedSubjectId }
        : {
            newSubject: {
              name: newName.trim(),
              type: newType,
              parentOrgId: newType === "ngl" ? parentOrgId : null,
            },
          }),
      entryDate,
      materialGenre,
      ashokanName: ashokanName.trim(),
      contextualNotes: contextualNotes.trim() || undefined,
      materialText,
      materialSourceUrl,
      dimensions: score.dimensions,
      enactmentScore: score.enactmentScore,
      eachOrientation: score.eachOrientation,
      effectiveGenreTag,
      genreOverridden: score.genreOverridden ?? false,
      feedback,
    };

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not save this entry.";
        setErrorMsg(msg);
        setStatus("error");
        return;
      }

      const result = data as { subject: Subject; entry: { id: string } };
      setSavedSubject(result.subject);
      setSavedEntryId(result.entry.id);
      setStatus("done");
      onSaved?.(result.subject);
    } catch {
      setErrorMsg("Could not connect to the save service.");
      setStatus("error");
    }
  }

  // --- DONE ---
  if (status === "done" && savedSubject) {
    return (
      <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8" style={{ borderLeftWidth: 3, borderLeftColor: "var(--accent-2)" }}>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-2">Entry Saved</p>
        <h2 className="mt-3 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
          Logged for <span className="font-light italic text-accent">{savedSubject.name}</span> — {entryDate}
        </h2>
        <div className="mt-5 flex flex-wrap gap-4">
          <Link href={`/subjects/${savedSubject.id}`} className="font-mono text-xs uppercase tracking-widest text-accent hover:text-accent-cta transition-colors">
            View subject history →
          </Link>
          {savedEntryId && (
            <Link
              href={`/subjects/${savedSubject.id}/entries/${savedEntryId}`}
              className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink transition-colors"
            >
              View this entry's Feedback Card →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-surface p-5 sm:p-6 lg:p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Longitudinal Tracking</p>
      <h2 className="mt-3 font-display text-xl font-normal leading-snug text-ink sm:text-2xl">
        Save as a <span className="font-light italic text-accent">dated entry</span>
      </h2>
      <p className="mt-2 max-w-[55ch] font-sans text-sm leading-relaxed text-muted">
        Ties this analysis to a subject so it can be compared over time. Requires the Deeper Reading
        feedback above — it becomes part of the saved record.
      </p>

      {feedback === null && (
        <p className="mt-5 border-l-2 border-border pl-4 font-sans text-sm text-muted">
          Get the Deeper Reading feedback above first, then this form unlocks.
        </p>
      )}

      {mixedGenreHint && (
        <div
          className="mt-5 border px-4 py-3 font-sans text-sm leading-relaxed text-ink rounded-sm"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)", backgroundColor: "color-mix(in srgb, var(--accent) 6%, transparent)" }}
          role="alert"
        >
          {mixedGenreHint}
        </div>
      )}

      <fieldset disabled={feedback === null} className="mt-6 space-y-5 disabled:opacity-40">
        {/* Subject */}
        <div>
          <p className={labelClass}>Subject</p>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 font-sans text-sm text-ink">
              <input
                type="radio"
                name="subject-mode"
                checked={mode === "existing"}
                onChange={() => setMode("existing")}
                disabled={subjects.length === 0}
              />
              Existing
            </label>
            <label className="flex items-center gap-2 font-sans text-sm text-ink">
              <input type="radio" name="subject-mode" checked={mode === "new"} onChange={() => setMode("new")} />
              New
            </label>
          </div>

          {mode === "existing" ? (
            subjects.length > 0 ? (
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className={`${inputClass} mt-3`}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.type === "jj_partner" ? "JJ Partner" : "NGL"}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-3 font-sans text-sm text-muted">No subjects yet — create one below.</p>
            )
          ) : (
            <div className="mt-3 space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Subject name"
                className={inputClass}
              />
              <select value={newType} onChange={(e) => setNewType(e.target.value as SubjectType)} className={inputClass}>
                {SUBJECT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {newType === "ngl" && (
                jjPartners.length > 0 ? (
                  <select value={parentOrgId} onChange={(e) => setParentOrgId(e.target.value)} className={inputClass}>
                    <option value="">Select parent JJ Partner…</option>
                    {jjPartners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="font-sans text-sm text-muted">
                    An NGL must nest under a JJ Partner. Create a JJ Partner subject first.
                  </p>
                )
              )}
            </div>
          )}
        </div>

        {/* Entry date + genre */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="entry-date">
              Entry Date
            </label>
            <input
              id="entry-date"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="material-genre">
              Genre
            </label>
            <select
              id="material-genre"
              value={materialGenre}
              onChange={(e) => setMaterialGenre(e.target.value as MaterialGenre)}
              className={`${inputClass} mt-2`}
            >
              <option value="">Select a genre…</option>
              {MATERIAL_GENRE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ashokan name */}
        <div>
          <label className={labelClass} htmlFor="ashokan-name">
            Ashokan Name
          </label>
          <input
            id="ashokan-name"
            type="text"
            value={ashokanName}
            onChange={(e) => setAshokanName(e.target.value)}
            placeholder="Who is logging this entry"
            className={`${inputClass} mt-2`}
          />
        </div>

        {/* Contextual notes */}
        <div>
          <label className={labelClass} htmlFor="contextual-notes">
            Contextual Notes <span className="normal-case text-muted/70">(optional, not scored)</span>
          </label>
          <textarea
            id="contextual-notes"
            value={contextualNotes}
            onChange={(e) => setContextualNotes(e.target.value)}
            rows={2}
            className={`${inputClass} mt-2 resize-y`}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="bg-accent-cta px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-white rounded-md transition-all hover:bg-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "saving" ? "Saving…" : "Save Entry"}
        </button>
      </fieldset>

      {status === "error" && errorMsg && (
        <div className="mt-4 border border-border bg-surface p-4" style={{ borderLeftWidth: 3, borderLeftColor: "#E87722" }} role="alert">
          <p className="font-sans text-sm text-ink">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
