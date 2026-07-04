/**
 * Phase 9 — single source of truth for plain-language explanations.
 *
 * Every term of art the UI shows gets two layers:
 *   plain  — first sentence(s) a first-time, non-technical reader can use.
 *            No sociolinguistics vocabulary, no scoring mechanics.
 *   deeper — the next layer down for readers who want the grounding.
 *
 * The instrument is descriptive, not evaluative. Nothing in this file may
 * frame a higher score as a better person or organization.
 */
import type { ParadigmName } from "@/lib/types";

export type GlossaryKey =
  | "enactmentScore"
  | "d1"
  | "d2"
  | "d3"
  | "d4"
  | "d5"
  | "paradigm"
  | "eachOrientation"
  | "lensA"
  | "modelVersion"
  | "radar";

export type GlossaryEntry = {
  /** How the term reads where it appears in the UI. */
  label: string;
  /** First layer: human language, zero jargon. */
  plain: string;
  /** Second layer: the grounding, for those who want it. */
  deeper: string;
};

export const GLOSSARY: Record<GlossaryKey, GlossaryEntry> = {
  enactmentScore: {
    label: "Enactment Score",
    plain:
      "A 0–100 reading of how strongly this text enacts a changemaker way of seeing the world — not how good the writing is, and not a judgment of the person or organization behind it.",
    deeper:
      "It is computed from five dimensions (D1–D5), each read 0–4 and weighted by the kind of text. The same author can score differently in different kinds of text — that variation is information, not error.",
  },
  d1: {
    label: "D1 · Agency & Contribution",
    plain:
      "Who gets to act in this text? It reads whether change is something people do — including young people and communities — or something done for them.",
    deeper:
      "Structurally: who is the subject of the active verbs, who initiates and decides, and who only receives.",
  },
  d2: {
    label: "D2 · Systemic & Architectural Framing",
    plain:
      "Where does the text locate the problem — in individuals who need help, or in the rules and structures that shape what's possible?",
    deeper:
      "Higher readings name structures — policies, norms, decision-making architecture — as the thing being changed, not just symptoms being treated.",
  },
  d3: {
    label: "D3 · Empathy Enactment",
    plain:
      "Does understanding other people visibly change what the writer does — or does the text stop at expressing sympathy?",
    deeper:
      "The dimension looks for empathy with consequences: other people's perspectives that alter the approach, not statements of concern.",
  },
  d4: {
    label: "D4 · Collaboration & Leadership",
    plain:
      "Is power shared in this text, or delegated downward? It reads whether leadership flows in more than one direction.",
    deeper:
      "Distributed leadership shows up structurally: others set direction, knowledge travels both ways, and decisions — not just tasks — are shared.",
  },
  d5: {
    label: "D5 · Identity Embodiment",
    plain:
      "Does the changemaker worldview live in how the text is written — or only in the labels it uses for itself?",
    deeper:
      "It reads reflexivity: whether the writer examines their own position and power, rather than simply claiming an identity.",
  },
  paradigm: {
    label: "Paradigm name",
    plain:
      "A shorthand name for the range the score falls in — from Spectator (change happens elsewhere) to System Architect (rewriting the rules together). It describes the text, not the person.",
    deeper:
      "The bands: 0–19 Spectator · 20–39 Sympathizer · 40–59 Contributor · 60–79 Changemaker · 80–100 System Architect.",
  },
  eachOrientation: {
    label: "EACH Orientation",
    plain:
      "Which part of Ashoka's “Everyone a Changemaker” vision this text leans toward, based on which of the five dimensions stand out.",
    deeper:
      "Derived from the shape of the profile: Agency + Identity → Lifelong Contribution; Systemic + Collaboration → Changemaker Networks; Empathy + Agency → Empathy-based Societies; uniformly high → Full EACH Alignment; no dominant pair yet → Emerging.",
  },
  lensA: {
    label: "Lens A · Genre Tag",
    plain:
      "What kind of text the model read this as — an interview, a report, a post. The kind of text changes what's fair to expect from it, so it also adjusts the weighting.",
    deeper:
      "A reflective interview naturally shows more identity work than an annual report; the genre-adjusted weights keep readings fair across kinds of text instead of pretending they're all the same.",
  },
  modelVersion: {
    label: "Model version",
    plain:
      "Which version of the reading model produced this analysis. Scores are only compared over time when the version matches — otherwise a difference could come from the model changing, not the writing.",
    deeper:
      "Every stored analysis is stamped with its model and prompt version. The comparison view warns visibly whenever two readings don't share one.",
  },
  radar: {
    label: "Radar Profile",
    plain:
      "The five dimensions drawn as one shape, so you can see the pattern at a glance — which dimensions carry this text and which are quiet.",
    deeper:
      "Each axis runs 0–4. The shape matters more than the size: two texts with the same score can have very different profiles.",
  },
};

/**
 * The one-paragraph, story-first meaning of each paradigm band. Descriptive,
 * never evaluative — these describe what the TEXT does, not who the author is.
 */
export const PARADIGM_MEANINGS: Record<ParadigmName, string> = {
  Spectator:
    "Change happens elsewhere in this text. Problems and solutions belong to other people — institutions, experts, authorities — and the author's own hands stay out of the frame.",
  Sympathizer:
    "This text cares. It recognizes change and values the people driving it — but still describes change as someone else's job, watched from nearby with sympathy.",
  Contributor:
    "The author steps into the frame. There is real agency here — helping, joining, contributing — though the deeper rules and structures mostly stay unquestioned.",
  Changemaker:
    "This text owns change. Its author acts, decides, and builds with others, and the writing starts naming the structures behind problems, not just their symptoms.",
  "System Architect":
    "This text rewrites rules. Agency is everywhere and shared; problems are traced to structures, and the author works on the architecture itself — who gets to decide, not just what gets done.",
};

/** Standing reminder rendered under every story-first reading. */
export const NOT_A_VERDICT =
  "This describes the text — not the person or organization behind it.";
