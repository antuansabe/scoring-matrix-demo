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
  entry_date: string; // ISO date string YYYY-MM-DD
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
    entry_date: string;
    genre: MaterialGenre;
    ashokan_name: string;
    contextual_notes: string | null;
  };
}
