import { FeedbackResult } from "@/lib/types";

export type SubjectType = "jj_partner" | "ngl";

export type MaterialGenre =
  | "interview"
  | "article"
  | "website"
  | "report"
  | "social"
  | "other";

export interface Subject {
  id: string;
  ashoka_internal_id: string | null;
  name: string;
  type: SubjectType;
  parent_org_id: string | null;
  created_at: string;
  created_by: string | null;
}

export interface SubjectInput {
  ashoka_internal_id?: string | null;
  name: string;
  type: SubjectType;
  parent_org_id?: string | null;
  created_by?: string | null;
}

export interface Entry {
  id: string;
  subject_id: string;
  /** ISO date YYYY-MM-DD. MATERIAL/NARRATIVE date — when the text was
      written or said, not when it was analyzed (§1b, resolved 2026-07-03).
      The analysis moment lives in created_at. */
  entry_date: string;
  material_text: string;
  material_source_url: string | null;
  genre: MaterialGenre;
  ashokan_name: string;
  contextual_notes: string | null;
  created_at: string;
}

export interface EntryInput {
  subject_id: string;
  entry_date: string;
  material_text: string;
  material_source_url?: string | null;
  genre: MaterialGenre;
  ashokan_name: string;
  contextual_notes?: string | null;
}

export interface Analysis {
  id: string;
  entry_id: string;
  enactment_score: number; // 0..100
  d1: number; // 0..4
  d2: number;
  d3: number;
  d4: number;
  d5: number;
  each_orientation: string;
  lens_a_tag: string | null;
  lens_b_flag: string | null;
  feedback_card: FeedbackResult;
  model_version: string;
  created_at: string;
}

export interface AnalysisInput {
  entry_id: string;
  enactment_score: number;
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  d5: number;
  each_orientation: string;
  lens_a_tag?: string | null;
  lens_b_flag?: string | null;
  feedback_card: FeedbackResult;
  model_version: string;
}

/** Joined analysis with entry data, used for timeline/comparisons. */
export interface AnalysisWithEntry extends Analysis {
  entry: {
    subject_id: string;
    entry_date: string;
    genre: MaterialGenre;
    ashokan_name: string;
    contextual_notes: string | null;
  };
}

/** Subject list row enriched with entry stats, used by /subjects. */
export interface SubjectWithStats extends Subject {
  entryCount: number;
  lastEntryDate: string | null;
}

/**
 * AnalysisWithEntry plus the entry's material_text. Deliberately NOT part of
 * AnalysisWithEntry itself — that type flows into client props for the
 * subject timeline and compare view, neither of which needs (or should ship
 * to the browser) the full source text for every entry in a subject's
 * history. Used only server-side, by the Phase 5 change-narrative route.
 */
export interface AnalysisWithMaterialText extends AnalysisWithEntry {
  entry: AnalysisWithEntry["entry"] & { material_text: string };
}
