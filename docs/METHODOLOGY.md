# Calibration Note — Bands, Versioning, and the Stability Threshold

**Status:** working note, intended as seed material for the framework paper (De Fina / Georgetown path) · **Applies to:** `sonnet-4.6+prompt-2026-06` · **Last reviewed:** 2026-07-04. Companion documents: `SCORING_MODEL.md` (full rubric), `ADVERSARIAL_VALIDATION.md` (construct evidence), `DATA_GOVERNANCE.md`.

## 1. The measurement, in one paragraph

Five dimensions of enacted discourse (D1 Agency & Contribution, D2 Systemic & Architectural Framing, D3 Empathy Enactment, D4 Collaboration & Leadership, D5 Identity Embodiment) are each read on a 0–4 ordinal rubric anchored in discourse-analytic scholarship (Van Dijk, De Fina, Gee, Lakoff, Entman, Wodak, Fairclough). A genre-adjusted weighted sum maps the profile to a 0–100 **Enactment Score**: `(Σ Dn·wn) × 25`. The score describes a *text's* alignment with the changemaker paradigm — never a person's or organization's worth.

## 2. Rationale for the band thresholds

| Band | Name | Reading |
|---|---|---|
| 0–19 | Spectator | change happens elsewhere |
| 20–39 | Sympathizer | change is valued, still someone else's job |
| 40–59 | Contributor | the author enters the frame |
| 60–79 | Changemaker | change is owned and built with others |
| 80–100 | System Architect | the rules themselves are the work |

Three deliberate choices, stated so they can be defended or revised:

1. **Equal 20-point widths.** The bands are a *legibility device* over an ordinal scale, not empirically derived cut-points. Equal widths make the mapping honest about that: no threshold pretends to precision the underlying 0–4 rubric doesn't have. The alternative — data-derived thresholds — requires a calibration corpus we do not yet have; adopting one later is a versioned change (see §3).
2. **Five bands because the rubric has five enactment levels.** Each 0–4 rubric level has a qualitative anchor; the bands project that ladder onto the composite. A text scoring uniformly at rubric level n lands mid-band n (e.g., all-3s ≈ 75, squarely Changemaker).
3. **Band names are descriptive, not evaluative.** "Higher" means *more strongly enacts this particular worldview in this particular text* — an annual report scoring 35 is a normal annual report, not a failing organization.

**A drift warning worth recording:** the threshold has occasionally been paraphrased in meetings as "≥70 = Changemaker." The implemented boundary is **60**, and has been since v0.1 (`lib/paradigm.ts` is the single source of truth). Calibration notes exist precisely so paraphrase never silently becomes spec.

Genre weights (documented in `SCORING_MODEL.md`) exist for fairness across kinds of text: a reflective interview naturally affords more identity work than an annual report, so weights shift modestly by detected genre. Since Phase 6 the weighting mechanism also supports per-subject-type profiles (organization vs. individual); both currently share the default vector pending Framework Change's decision on org-specific values.

## 3. `model_version` and longitudinal comparability

Every stored analysis is stamped with `model_version` (model id + prompt version). The rule, locked as Decision #3 of the build plan:

- **A delta is only evidence of narrative change when both endpoints share a `model_version`.** Otherwise the delta may measure the instrument, not the text.
- The comparison view enforces this visibly: mismatched versions trigger an unmissable warning; there is no silent cross-version comparison anywhere in the product.
- Any change to the scoring prompt or model — including seemingly innocent copy edits that alter what is measured — requires bumping `MODEL_VERSION` (`lib/modelVersion.ts`) and, for continuity, re-scoring or re-baselining. This is also why the adversarial validation (see companion doc) is version-scoped and must be re-run per version.
- Corollary for the paper: cross-version continuity is an open methodological problem (anchoring via a fixed reference corpus re-scored under each version is the intended approach).

## 4. The ±5 "stable" band (comparison view)

When two same-version analyses of the same subject are compared, Enactment deltas with |Δ| < 5 are reported as **Stable** rather than directional movement (`STABLE_THRESHOLD`, `lib/compare.ts`, Phase 4).

Rationale: two independent readings of similar material can differ by a few points of ordinary scoring variance without any narrative shift; paradigm bands are 20 points wide, so ±5 = a quarter-band — small enough to catch real movement, large enough to keep noise from being narrated as change. Direction labels ("toward higher / lower changemaker density") attach only beyond that band. Per-dimension deltas are integers on 0–4 and are reported exactly; a one-point dimension move (25% of that scale) is treated as inherently meaningful.

The ±5 value is a reasoned default, not an estimated confidence interval. A formal replacement — re-scoring a fixed corpus N times per version and setting the band at, say, 2σ of observed run-to-run variance — is a natural early contribution of the academic collaboration.

## 5. What is not yet claimed

No inter-rater reliability study against human discourse analysts; no external validation cohort; adversarial evidence currently n=1 pair (decisive but narrow — see `ADVERSARIAL_VALIDATION.md`). These are the gaps the De Fina / Georgetown collaboration is best placed to close, in roughly that order: blind human-vs-instrument agreement on a mixed corpus, then variance-based stability bands, then threshold calibration.
