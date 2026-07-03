import { callClaudeWithCachedSystem } from "@/lib/anthropic";
import { CHANGE_NARRATIVE_SYSTEM_PROMPT } from "@/lib/prompts/change-narrative";
import { excerpt } from "@/lib/text";
import { DIMENSIONS } from "@/lib/paradigm";
import {
  computeDimensionDeltas,
  computeEnactmentDelta,
  getDimensionScore,
  resolveNarrativeDirection,
  orderChronologically,
  NARRATIVE_DIRECTION_LABELS,
  type NarrativeDirection,
} from "@/lib/compare";
import type { AnalysisWithMaterialText } from "@/lib/db/types";
import type { DimensionKey } from "@/lib/types";

// Thrown when the model response cannot be parsed into a narrative string.
// Route handlers should map this to a 502 response.
export class ChangeNarrativeParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChangeNarrativeParseError";
  }
}

export type DimensionMovement = "improved" | "regressed" | "stable";

export type ChangeSummary = {
  schemaVersion: "1.0";
  t1EntryDate: string;
  t2EntryDate: string;
  enactmentDelta: number;
  direction: NarrativeDirection;
  dimensionDeltas: Record<DimensionKey, number>;
  dimensionMovement: Record<DimensionKey, DimensionMovement>;
  narrative: string;
};

// Movement is a direct, deterministic read of the sign of an already-computed
// delta — never asked of the model. A whole-point shift on a 0-4 integer
// scale is inherently meaningful (25% of the dimension's range), unlike the
// Enactment Score's ±5 "stable" band, which exists to filter noise across a
// wider composite 0-100 scale.
function resolveMovement(delta: number): DimensionMovement {
  if (delta > 0) return "improved";
  if (delta < 0) return "regressed";
  return "stable";
}

function buildUserMessage(
  t1: AnalysisWithMaterialText,
  t2: AnalysisWithMaterialText,
  dimensionDeltas: Record<DimensionKey, number>,
  enactmentDelta: number,
  directionLabel: string,
): string {
  const dimensionLines = DIMENSIONS.map((d) => {
    const delta = dimensionDeltas[d.key];
    const t1Score = getDimensionScore(t1, d.key);
    const t2Score = getDimensionScore(t2, d.key);
    const sign = delta > 0 ? "+" : "";
    return `${d.key} ${d.fullName}: t1=${t1Score}/4 -> t2=${t2Score}/4 (${sign}${delta})`;
  }).join("\n");
  const enactmentSign = enactmentDelta > 0 ? "+" : "";

  return (
    `COMPUTED DELTAS (already final — do not recompute, do not contradict):\n` +
    `${dimensionLines}\n` +
    `Enactment Score: t1=${t1.enactment_score}/100 -> t2=${t2.enactment_score}/100 (${enactmentSign}${enactmentDelta})\n` +
    `Overall direction: ${directionLabel}\n\n` +
    `---\n\n` +
    `t1 — ${t1.entry.entry_date} (genre: ${t1.entry.genre}):\n"${excerpt(t1.entry.material_text)}"\n\n` +
    `t2 — ${t2.entry.entry_date} (genre: ${t2.entry.genre}):\n"${excerpt(t2.entry.material_text)}"\n\n` +
    `Generate the change narrative JSON.`
  );
}

function parseNarrative(raw: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ChangeNarrativeParseError(
      "Change narrative response is not valid JSON. Raw: " + raw.slice(0, 300),
    );
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new ChangeNarrativeParseError("Change narrative response is not a JSON object.");
  }
  const o = parsed as Record<string, unknown>;
  if (typeof o.narrative !== "string" || o.narrative.trim().length === 0) {
    throw new ChangeNarrativeParseError("Change narrative response missing required 'narrative' string.");
  }
  return o.narrative.trim();
}

/**
 * Generates the Feedback Card "Part D — Change over time" narrative.
 *
 * All deltas, movement classifications, and direction are computed here in
 * TypeScript from lib/compare.ts's Phase 4 functions — the same functions
 * the compare view itself uses to render the displayed numbers. Claude is
 * only asked for the prose `narrative` field; it never emits a number or a
 * direction, so the generated text cannot contradict the displayed deltas.
 *
 * - Model: claude-sonnet-4-6
 * - Temperature: 0
 * - Ephemeral prompt caching: yes (via callClaudeWithCachedSystem)
 * - Retries: up to 4 attempts with exponential back-off (handled by anthropic.ts)
 */
export async function generateChangeSummary(
  entryA: AnalysisWithMaterialText,
  entryB: AnalysisWithMaterialText,
): Promise<ChangeSummary> {
  const [t1, t2] = orderChronologically(entryA, entryB);

  const dimensionDeltas = computeDimensionDeltas(t1, t2);
  const enactmentDelta = computeEnactmentDelta(t1, t2);
  const direction = resolveNarrativeDirection(enactmentDelta);

  const dimensionMovement = {} as Record<DimensionKey, DimensionMovement>;
  for (const d of DIMENSIONS) {
    dimensionMovement[d.key] = resolveMovement(dimensionDeltas[d.key]);
  }

  const { text: rawJson } = await callClaudeWithCachedSystem({
    model: "claude-sonnet-4-6",
    systemPrompt: CHANGE_NARRATIVE_SYSTEM_PROMPT,
    userMessage: buildUserMessage(t1, t2, dimensionDeltas, enactmentDelta, NARRATIVE_DIRECTION_LABELS[direction]),
    maxTokens: 1000,
    temperature: 0,
  });

  const narrative = parseNarrative(rawJson);

  return {
    schemaVersion: "1.0",
    t1EntryDate: t1.entry.entry_date,
    t2EntryDate: t2.entry.entry_date,
    enactmentDelta,
    direction,
    dimensionDeltas,
    dimensionMovement,
    narrative,
  };
}
