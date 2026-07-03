/**
 * Shared text utilities. Single source of truth for word counting —
 * used by app/api/score/route.ts and pipeline/commands/ingest.ts.
 */

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

// Interview-format markers (turn-taking / Q&A) vs. report-format markers
// (structured section headers) — surfaced material genres per Decision #6.
const INTERVIEW_MARKERS = /\b(Q:|A:|Pregunta:|Respuesta:|Entrevistador(a)?:|Interviewer:)/gi;
const REPORT_MARKERS =
  /\b(Executive Summary|Resumen Ejecutivo|Introduction|Introducci[oó]n|Methodology|Metodolog[ií]a|Conclusion|Conclusi[oó]n)\b/gi;

/**
 * Cheap heuristic for material that looks like it mixes an interview/dialogue
 * format with report-style structured sections. Per Decision #6, one entry
 * must be one genre — this only surfaces a hint; it never auto-splits.
 * Returns a human-readable warning, or null if no mixing signal is found.
 */
export function detectMixedGenreHint(text: string): string | null {
  const interviewHits = (text.match(INTERVIEW_MARKERS) ?? []).length;
  const reportHits = (text.match(REPORT_MARKERS) ?? []).length;

  if (interviewHits >= 3 && reportHits >= 2) {
    return "This text looks like it may mix an interview/dialogue format with report-style sections. One entry should be one genre — consider splitting this into separate dated entries instead of saving it as a single one.";
  }
  return null;
}
