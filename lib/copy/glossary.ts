/**
 * Phase 11a: the glossary COPY (labels, plain + deeper layers, paradigm
 * meanings, the not-a-verdict line) lives in the message catalogs —
 * messages/en.json (canonical) and messages/es.json — under the
 * `glossary`, `paradigmMeanings`, and `notAVerdict` namespaces, so it
 * switches with the UI language. This module keeps only the key type.
 *
 * The instrument's terms of art (Enactment Score, D1–D5 names, paradigm
 * names, EACH Orientation values, Lens A) stay in English in BOTH
 * languages; the Spanish gloss lives in the plain/deeper layers.
 */
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
  | "radar"
  | "materialDate";
