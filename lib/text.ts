/**
 * Shared text utilities. Single source of truth for word counting —
 * used by app/api/score/route.ts and pipeline/commands/ingest.ts.
 */

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}
