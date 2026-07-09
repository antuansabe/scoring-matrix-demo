# Data Governance — Changemaker Worldview Instrument (Pilot)

**Status:** pilot-phase working document · **Owner:** Antonio Dromundo (ITI) with Giselle Kuri (Framework Change) · **Last reviewed:** 2026-07-04. This answers the governance gap flagged in the June 15 Measures & Impact meeting. It is a factual description of practice, not a legal document.

## What content is analyzed

- **Organizations (JJ Partners):** publicly available institutional material only — published reports, public web copy, public statements, published interviews. Nothing private, leaked, or internal is analyzed.
- **Individuals (NGLs):** material the person wrote or said for the public record, or material they provide themselves. An individual is never analyzed without knowing the instrument exists and what it reads.
- **One firm rule either way:** the instrument reads *texts*, and its outputs describe *texts*. A score is not an assessment of a person's or organization's worth, capability, or fundability, and must never be used as one.

## Consent posture

The pilot analyzes public institutional discourse, where the material is already published speech. For individuals, the posture is informed participation: the subject knows their texts are being read and can see the readings. Before any baseline is treated as official (Phase 8), the subject organization is told the analysis exists. Anyone — person or organization — can ask to see, correct the record of, or remove their data (see Retention).

## Who can access results

- Stored subjects, entries, and analyses are for the **internal Ashoka pilot team** (Framework Change + ITI) and the subjects themselves when shared with them.
- Results are not published, not shared with funders as evaluations, and not used in selection or venture decisions.
- **Known gap, stated honestly:** the pilot app currently has no login; access control is by URL non-discoverability only. The access/auth model (likely Entra/Azure AD SSO) is an open decision tracked in the build plan (§1b) and must be resolved before the tool holds sensitive volume. The database itself is locked (row-level security; server-side key only).

## Retention and deletion

- Entries and analyses are retained in Ashoka's Supabase (Postgres) instance for as long as longitudinal comparison is useful — the tool's purpose is measuring change over time, so history is the point.
- Deletion on request is immediate and structural: removing a subject cascades to all its entries and analyses. No shadow copies are kept.
- Analysis calls are processed by Anthropic's API under Ashoka's account; API inputs are not used to train models per Anthropic's commercial terms.
- The seeded DEMO subject is fictional, labeled as such on every screen, and carries no real-world data.

## Known model limitations and bias considerations

- **The reader is a large language model** (version-stamped on every analysis). Its rhetorical training skews toward English-language, Western argumentative norms; discourse traditions that encode agency or collectivity differently may be read less generously. This is the standing bias risk to check against human judgment, especially for Spanish-language and non-Western material.
- **Genre effects are managed, not eliminated.** Weights adjust by text type (an annual report is not expected to read like a personal interview), but genre still shapes scores — which is why comparisons are only ever subject-to-itself and, ideally, like-genre-to-like-genre.
- **Short texts are less reliable.** Dimension-specific word-count thresholds trigger visible low-confidence flags; flagged scores deserve extra skepticism.
- **Scores are stable but not metrologically precise.** Same-version re-runs are highly consistent (see `ADVERSARIAL_VALIDATION.md`), yet the comparison view still treats differences under ±5 points as "stable" rather than movement, by design.
- **Cross-version comparison is invalid.** Every analysis is stamped with its model+prompt version; the UI refuses to compare across versions silently and shows an unmissable warning instead.
- **Generated narratives are constrained.** The AI-written change summaries receive their numbers pre-computed and are prompted against inventing demographic or personal details; adversarial and fidelity checks on this layer are documented in the build plan (Phase 5).
- **What the instrument cannot do:** detect sincerity, verify facts claimed in a text, or read intent. It describes the architecture of language — nothing else.
