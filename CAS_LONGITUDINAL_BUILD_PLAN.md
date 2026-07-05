# CAS — Longitudinal Expansion · Master Build Plan

> **Repo:** antuansabe/scoring-matrix-demo · **Live:** scoring-matrix-demo.vercel.app
> **Source spec:** Giselle Kuri, *Changemaker Worldview Model — Narrative Baseline*, Jun 23 2026
> **Owner:** Antonio · **Last updated:** _(agent updates this on every session)_
> **Hard deadline:** Diamond baselines (t1 for each org) by **Sept 1, 2026**

---

## 0. How to use this file (read this first, every session)

This is the single source of truth for the longitudinal rebuild. It is meant to be run by a coding agent (Claude Code) **one phase per session**, not in one continuous run.

**Session protocol — do this every time:**

1. Read `CLAUDE.md` (visual system + repo conventions are non-negotiable).
2. Read this file's **Status tracker** (section 2) and pick the first phase that is `TODO`.
3. Read the files listed in that phase's *Files* before editing anything (pre-flight audit). Report what you found and whether reality matches the plan **before** writing code. If the code already differs from what this plan assumes, STOP and flag it — do not implement around a wrong assumption.
4. Implement only that one phase.
5. Verify with **evidence** (build output, test output, the actual command you ran and what it returned). Do not assert success — show it.
6. Make a local commit using the suggested message. **Do not `git push`.**
7. Update the Status tracker (mark the phase `DONE`, add a one-line progress note with the commit hash).
8. **STOP at the review gate.** Report the diff summary + evidence and wait for Antonio.

**Context hygiene:** if context usage passes ~60%, finish the current step, commit a clean checkpoint, update the tracker, and end the session. A fresh session re-reads this file and resumes cleanly. Do not push through a degraded context window.

**Working agreement (Antonio's review gate):**
- The agent may do all work for a phase autonomously: read, edit, build, test, **local commit**.
- The agent **never pushes** and **never touches the remote/data** until Antonio reviews the diff and says go.
- Exception: phases explicitly marked `PUSH PRE-AUTHORIZED` may be pushed without a stop.

**Credential boundary:** the agent never creates accounts, never handles API keys, secrets, or Supabase service-role keys. It writes code that reads from `process.env`. Antonio sets the actual values in Vercel / `.env.local`.

---

## 1. Decisions locked (do not re-litigate)

These were decided with Antonio. The agent treats them as given.

1. **Storage = Supabase (Postgres).** Already connected; native fit with Next.js 15 / Vercel; relational model fits subjects→entries→analyses; free at pilot scale. All DB access goes through a thin repository layer in `lib/db/` so a later Azure Postgres / Foundry migration is a connection swap, not a rewrite.
2. **Data model = three tables:** `subjects`, `entries`, `analyses` (schema in Phase 1). NGLs reference their parent org via `parent_org_id`.
3. **Every analysis row is stamped with `model_version`** (model id + prompt version). Longitudinal comparison is only valid when both points share a `model_version`; the UI must flag a mismatch rather than silently compare.
4. **Comparison rule: a subject is only ever compared to itself over time.** Never org-vs-individual, never cross-subject. Scores are not portable across subject types.
5. **Weights = per-subject-type profile.** Two weight vectors (`ngl`, `jj_partner`), both defaulting to the current vector. The *mechanism* is Antonio's job; the *values* (especially whether D5 Identity Embodiment is down-weighted for orgs) are Giselle's call. Ship with defaults; expose the vectors in one config file.
6. **One entry = one genre.** Mixed-genre material is split into separate dated entries. This keeps Lens A (Genre & Mobility Tag) clean and actually enables Lens B (Cross-Genre Coherence) as a comparison across same-date entries.
7. **Multi-Ashokan = allowed, lightweight.** Anyone can add an entry; record `ashokan_name` / `created_by`. One nominal owner per subject for hygiene. No role-based permissions for the pilot.
8. **Export = PDF first.** Word and slides are deferred until requested.

---

## 1b. Open decisions (NOT for the agent to decide — Antonio / Giselle)

If a phase hits one of these, stop and ask. Do not guess.

- **Org weight values** (D1–D5 for `jj_partner`). Owner: Giselle. **Note added post-Phase 6:** when these diverge from default, the ephemeral analyzer's on-screen score (computed pre-subject with default weights) will differ from the saved score (recomputed with the org profile at save time). The recompute seam and logging already exist; the pending decision is how the UI communicates that difference to the user. Decide alongside Giselle's values, before Phase 8 baselines.
- **`entry_date` semantics — RESOLVED (Antonio delegated, decided 2026-07-03): `entry_date` officially means the MATERIAL/NARRATIVE date** (when the discourse was produced), not the analysis date. Rationale: the tool's purpose is narrative evolution, so the timeline axis must be when the narrative was produced; the analysis date is not lost — `entries.created_at` (automatic, immutable) already captures it, and cross-analysis comparability is protected by `model_version`, not by dates. No schema change needed; implementation is UI labels ("Material date") + glossary + docs, assigned to Phase 10. **Pending: one-line notification to Giselle** (this amends her June 23 spec's definition, in favor of her own retrospective use cases).
- **Can an NGL exist without a parent JJ Partner**, or is nesting mandatory? Owner: Giselle / Antonio.
- **Access / auth model** for an internal Ashoka tool (who can open it). Likely Entra/Azure AD SSO eventually — governance + IT decision, not a Sept 1 blocker. For the pilot, gate behind a single shared access mechanism Antonio chooses.
- **Export branding/template** for the comparative report. Owner: Antonio.
- **Language of GENERATED content** (Feedback Cards, Part D narratives): should analyses be generated in the user's active UI language (post-11a, EN/ES)? Owner: Antonio + Giselle. Note: wiring locale into the feedback prompt changes stored-output characteristics — decide deliberately, not as an i18n side effect. UI language switching (11a) is independent of this.

---

## 2. Status tracker

| # | Phase | Priority | Status | Commit | Note |
|---|-------|----------|--------|--------|------|
| 0 | Foundations & safety net | — | DONE | a5a54b5 | Build/typecheck pass, health route works. Repo relocated from ~/Desktop (iCloud-synced, caused a multi-hour build hang) to ~/Developer/Changemaker — see note below. |
| 1 | Data layer + schema + persistence | P1 | DONE | 99a4a8b | Migration applied by Antonio. `@supabase/supabase-js` installed; `lib/db/client.ts` + repo functions (subjects/entries/analyses) implemented against the existing Phase 0 stub signatures. Round-trip verified via a temporary `/api/db-selftest` route (subject→entry→analysis created + read back + deleted; `ngl_requires_parent` confirmed to reject an orphan NGL with Postgres error 23514) — route removed before this commit. Build + typecheck pass. (Hash corrected here — the commit was amended after the tracker row was first written, so it couldn't self-reference its own final hash.) |
| 2 | Entry intake (date, subject, type, genre, notes) | P1 | DONE | 3d90191 | Added subject/type/entry-date/genre/ashokan-name/contextual-notes intake to the `/tool` live analyzer (analyze page moved there from `/` since CLAUDE.md was written). New `POST /api/entries` persists entry + analysis via the Phase 1 repo layer, stamped with `MODEL_VERSION`. `analyses.feedback_card` is NOT NULL, so the save form only unlocks once the existing on-demand Deeper Reading feedback exists — no fake data is ever persisted. Added `detectMixedGenreHint` (lib/text.ts) — a cheap interview-vs-report marker heuristic that surfaces a hint, never auto-splits (Decision #6). Verified live via Playwright end-to-end (real Claude calls, not mocked): created a JJ Partner subject with an entry dated 2026-01-15, then a second entry for the same subject dated 2026-06-20 selected from the now-populated "Existing" dropdown — both rows confirmed in Supabase with correct `entry_date` and `model_version: sonnet-4.6+prompt-2026-06`. Build + typecheck pass. |
| 3 | Subject history view | P3→pulled up | DONE | 3d3ca35 | `/subjects` (list: name, type, entry count, last entry date) and `/subjects/[id]` (chronological timeline via the existing `listAnalysesBySubject`) plus a new `/subjects/[id]/entries/[entryId]` route so "Feedback Card" is an actual link, rendering the stored `feedback_card` through the existing `FeedbackCard` component in `initialState="loaded"` mode. Added `listSubjectsWithStats` and `getAnalysisByEntryId` to the repo layer. Added "Subjects" to Header/Footer nav. Verified live via Playwright against the two Phase 2 seeded entries: list shows 2 entries/last date 2026-06-20; detail page shows both in chronological order (2026-01-15 before 2026-06-20); Feedback Card link renders the full stored Deeper Reading content plus D1–D5/model_version. Build + typecheck pass. |
| 4 | Comparative view (delta + overlaid radar + direction) | P2 | DONE | 7c355a0 | New `/subjects/[id]/compare` (linked from the Phase 3 timeline via a "Compare two entries →" CTA, shown once a subject has 2+ entries). Two entry selectors populated exclusively from that subject's own `listAnalysesBySubject` result — no new API route, no free-text ID entry, so cross-subject comparison has no code path, not just a discouraged one. `lib/compare.ts` (pure, no I/O — mirrors `lib/paradigm.ts`'s style): per-dimension delta (D1–D5, signed), enactment delta, and a narrative direction with a stated ±5-point "stable" band (documented inline as roughly a quarter of a paradigm band, to filter ordinary scoring variance from real movement). Direction and dimension deltas are read chronologically (earlier = t1, later = t2) regardless of which dropdown slot the user assigns them to. Overlaid radar (`components/CompareRadar.tsx`) reuses only already-established palette tokens (Ashoka Blue for t1, Ashoka Orange for t2) — no red/green good-bad coloring, consistent with the anti-pattern list and with the instrument's own framing as descriptive, not evaluative. `model_version` mismatch guardrail renders as a full-width bordered block ahead of the deltas (not a tooltip), quoting both exact model versions. **Pre-existing bug found and fixed during this phase's own verification:** `listAnalysesBySubject`'s `.order("entry_date", { foreignTable: "entry" })` silently did not sort the result set (confirmed by raw REST calls with both the alias and the real table name as `foreignTable`) — it returned rows in creation order instead. This was invisible in Phase 3's own verification because its 2 entries happened to be created in chronological order; a 3rd entry added out of creation-order sequence (the Lens A bugfix's 2026-03-10 row, created after the 2026-06-20 row) exposed it. Fixed by querying from `entries` (base table, direct `entry_date` order-by) and embedding `analyses`, instead of the reverse — restores the Phase 1 spec's own stated contract ("joined with entries, ordered by entry_date") for all three callers (`/subjects/[id]`, the entry detail page, and this comparison view) without changing the function's return type or any call site. Verified with real data (the 3-entry seeded subject): default earliest-vs-latest (2026-01-15 vs 2026-06-20) delta arithmetic hand-checked against raw stored D1–D5/enactment scores (D1 -4, D2 -3, D3 -3, D4 -4, D5 -4, enactment -90, direction "Toward Lower Changemaker Density"); reversed-dropdown-slot test confirmed t1/t2 assignment stays chronological regardless of which select the user used; hand-edited one row's `model_version` in Supabase to trigger the mismatch banner (confirmed rendered, screenshotted), then reverted and confirmed the banner disappears. Build + typecheck pass. Pushed to origin. |
| 5 | AI narrative change summary | P2 | DONE | ffc5b35 + 59290a1 | (59290a1 is a follow-up review fix: broadened the Part D anti-invention constraint beyond gender to any demographic/personal attribute, plus a fidelity-when-stated rule — verified against a constructed excerpt explicitly stating age/gender/disability that the model names stated facts without inventing unstated ones. Both commits pushed to origin.) Feedback Card "Part D — Change Over Time," rendered from the Phase 4 compare view (on-demand button, same idle/loading/error/done pattern as the existing Feedback Card, not auto-fetched). New `POST /api/compare/narrative` takes two entry IDs, fetches each server-side (new `getAnalysisWithMaterialTextByEntryId`, server-only — deliberately not added to the shared `AnalysisWithEntry` type so full material_text never ships into the timeline/compare view's client-side props), and re-validates both entries share a subject (Decision #4 defense in depth — a new API boundary is a new trust boundary, independent of the Phase 4 UI's own structural guarantee). All deltas, movement classification (improved/regressed/stable), and direction are computed in TypeScript by reusing Phase 4's `lib/compare.ts` functions directly (extracted `orderChronologically`/`chronoKey` out of `CompareView` into `lib/compare.ts` so both the client and this new server route share one implementation) — Claude is only asked for the prose `narrative` field and never emits a number or a direction, so the generated text cannot contradict the displayed deltas by construction, not by prompting alone. Reuses `callClaudeWithCachedSystem` for retry/backoff + prompt caching, and the existing `lib/feedback.ts` parse-defensively-and-throw-a-named-error pattern. **Verification surfaced a real hallucination, fixed before commit:** cross-checked every claim in the generated narrative against the raw stored D1–D5/enactment deltas — all numeric and directional claims were accurate across 4 separate generations (no contradicted deltas, no dimension misclassified as improved/stable when it had regressed). However, one generation invented the t1 narrator's gender ("her own authority") despite the source excerpt being written entirely in ungendered first-person "I" — a reproducible risk of LLM stochasticity even at temperature 0, not a one-off fluke, since a second generation on the same input correctly stayed gender-neutral. Added an explicit prompt constraint against inventing demographic details not present in the excerpts; re-ran 3 more times post-fix, all gender-neutral, all still numerically accurate. Build + typecheck pass. |
| 6 | Org-language Feedback Card + weight profiles | P3 | DONE | none yet | **Weights mechanism:** new `lib/scoring/weights.ts` — `WEIGHT_PROFILES` keyed by subject type (`ngl`, `jj_partner`), each a full genre-adjusted table (the "current vector" was always per-genre, so a type profile is a table, not one tuple); both point at `DEFAULT_GENRE_WEIGHTS` (moved verbatim from `lib/paradigm.ts`, which now re-exports it as `GENRE_WEIGHTS` so all six existing importers are untouched); `jj_partner` carries the `// TODO: values pending Giselle` marker per §1b — no values invented. `calculateEnactmentScore` gained an optional `subjectType` param; `/api/entries` recomputes the score with the subject's profile at save time (the only point where type is known — the ephemeral analyzer runs pre-subject) and logs the chosen vector. Verified: 60/60 typed-vs-legacy score comparisons identical (5 dim profiles × 6 genres × 2 types, tsx script); live saves against a jj_partner and a temp NGL both logged their type's vector and stored scores identical to client-sent (90/90, no mismatch warning); test rows deleted after. **Org voice:** the Deeper Reading runs before any subject is picked (intake unlocks only after feedback exists), so `subject.type` cannot drive the branch — added an Individual/Organization voice toggle to the FeedbackCard idle state instead, flowing as optional `subjectVoice` through `/api/feedback` → `generateFeedback` → a conditional `SUBJECT VOICE` section in the feedback prompt (mirrors the existing CROSS-GENRE conditional; individual path's user message stays byte-identical to pre-Phase-6). Scorer prompt deliberately untouched — changing it would alter what's measured and force a `MODEL_VERSION` bump invalidating stored comparability. Honest verification finding: the base analyst was already voice-following (zero personification of org texts even on the individual path), so the branch's observable effect is a steering guarantee — org-variant Part C questions target institutional accountability/reflexivity explicitly, and D5 readings are pinned to institutional identity — rather than a night-and-day rewrite; before/after runs on both a third-person report and a first-person-plural "we" mission letter confirmed no personal-interiority framing in either variant and institutionally-addressed questions in the org variant. Build + typecheck pass. |
| 7 | Export to PDF | P3 | TODO | — | — |
| 8 | Diamond baseline pilot dry run (t1) | — | TODO — prereqs DONE | 52e6ae5 (prereqs) | **Prerequisites complete (2026-07-04); baseline seeding itself still pending — happens with Antonio + real Diamond materials.** (1) `docs/ADVERSARIAL_VALIDATION.md`: keyword-stuffed text (35 target-vocabulary hits / 159 words) vs. worldview-embodying text (grep-verified zero hits across ten stems), both run twice through the real scorer — **6/100 Spectator vs 84/100 System Architect**, identical across runs, genre-weight confound eliminated by cross-weight recompute (6→6, 84→82); the scorer's own confidence flag on the stuffed text explicitly named the inflation attempt and held scores at floor. Claim survives; nothing tuned; scoring prompt untouched; limits stated (n=1 pair, version-scoped to sonnet-4.6+prompt-2026-06). (2) `docs/DATA_GOVERNANCE.md`: public-material-only scope, consent posture, internal access (incl. honest no-auth gap → §1b), retention/cascade deletion, model bias/limitations. (3) `docs/METHODOLOGY.md`: equal-width band rationale (legibility device, not empirical cut-points), **"≥70 = Changemaker" meeting paraphrase flagged vs the implemented 60 boundary**, model_version comparability rule, ±5 stable band rationale + its formalization path — written as seed for the De Fina/Georgetown paper. |
| 9 | Guided experience & board-readiness | P2 | DONE | 1114f0a | All 7 steps. **(1) Walkthrough:** 3-step dialog mounted globally (`components/Walkthrough.tsx`), auto-opens on first visit, resumable (step survives navigation — verified), dismissible everywhere, never reappears after done/skip (localStorage `cw.tour.v1`; storage-blocked browsers fail safe to never-auto-open), re-invocable via a new "Start here" header/drawer item. **(2) Demo mode:** `scripts/seed-demo.ts` (idempotent, delete-then-insert) seeds fictional "DEMO — Fundación Delta" (jj_partner, 3 entries: 30→48→66) + "DEMO — Alex Rivera" (ngl child, 45→65); flagged `ashoka_internal_id='DEMO'`, fixed UUIDs so the tour can deep-link; excluded by default from /subjects behind a "Show the demo example" toggle and from the /tool intake dropdown; `DemoBanner` on every demo screen. Texts/scores/cards are hand-curated (stated in the script header) and stamped `model_version: "demo-seed (hand-curated)"` — honest provenance, identical across entries so the mismatch guardrail stays quiet; Enactment Scores computed from the hand-chosen dims with the real formula so every on-screen number is internally consistent. **(3) Glossary:** `lib/copy/glossary.ts` (single source; plain + deeper layers for Enactment Score, D1–D5, paradigm, EACH, Lens A, model version, radar) surfaced via a click-to-open `Term` component wired into ScoreCard, ScoreBreakdown, CompareView, and the entry detail page — covering the first-timer path (/, /tool, subjects, compare, entry). CalculatorWidget/BatchView left as expert surfaces (calculadora already embeds its own bilingual methodology explainer) — scoping judgment flagged for review. **(4) Progressive disclosure:** `/tool` results now lead with `ResultStory` (paradigm name + plain meaning + "not a verdict" line + radar); ScoreCard/Breakdown/Justifications live behind "See the full reading". **(5) Story-first compare:** Part D narrative card moved to lead; deltas/radar/metadata behind "See the numbers behind this reading"; the model-mismatch warning deliberately stays OUTSIDE the disclosure. **(6) A11y:** 16px html floor + FeedbackCard body copy bumped to text-base; t1 radar series now dashed (no color-only encoding); walkthrough/disclosure have no animations, ≥44px targets, dialog semantics + Escape; `lang` corrected "es"→"en" (UI audited ~95% English; flagged, easily reverted — full i18n left as an open decision for Antonio). **(7) `docs/BOARD_DEMO.md`:** 7-minute bilingual (EN+ES) script starting from the demo subject, incl. objection answers; every UI claim in it verified against the running app. Verified per spec (a)–(e) with Playwright on a cleared profile: tour appears/resumes/completes into the demo story/never reappears on both paths; demo longitudinal story renders end-to-end from stored rows with zero live-API dependency (delta +36, t1 30 Sympathizer → t2 66 Changemaker, all dim deltas matching seed math); glossary terms open with plain+deeper layers on compare and entry screens; default-vs-expanded result screenshots captured; build + typecheck pass. |
| 10 | Subject-first workflows & batch intake | P2 | DONE | 52725d7 | All steps incl. step 0. **(0) Material-date semantics implemented:** intake label is now "Material date" with the backdating helper ("…a 2010 interview belongs on the timeline in 2010"), default stays today; new `materialDate` glossary entry (plain + deeper); `docs/METHODOLOGY.md` §2b documents the resolved semantics; `lib/db/types.ts` comment updated; applied migration file left untouched as historical record. **(1) New subject:** primary CTA on `/subjects` + `/subjects/new` (name, type with parent-org picker enforcing NGL nesting client- and server-side, optional Ashoka ID, created_by) via new `POST /api/subjects` (rejects the reserved `DEMO` internal ID) → lands on the empty detail page. **(2) Teaching empty states** on `/subjects` (create-first) and on a zero-entry subject (baseline sentence + "Add its first entry →" / "or add several at once →"; hidden for demo subjects). **(3) Locked intake:** `/tool?subject=<id>` (demo IDs refused server-side) → banner + `EntryIntakeForm` locked mode (no pickers, "Not this subject? Choose another →"), payload pinned server-known; post-save "Back to {subject} →". **(4) Per-subject batch intake:** `/subjects/[id]/add-batch` (`SubjectBatchIntake`) reusing the /batch machinery patterns — pLimit(2), per-item status (queued→scoring→reading→saving→done/failed), error isolation, per-item retry — over the existing pipeline `/api/score`→`/api/feedback`→`/api/entries`; batch-level Ashokan name; per-item label/material-date/genre; org subjects automatically get the Phase 6 organization voice for their Deeper Readings; `/batch` (Hola América tool) untouched — "extend the machinery" read as reuse-the-patterns, flagged at the gate. **(5) Post-save payoff:** `/api/entries` response now includes `subjectEntryCount` (via new repo `countEntriesBySubject`); both the single-save confirmation and the batch done-state surface "…now has N dated entries — the comparison is ready" + "Compare two entries →" the moment N≥2. Verified with Playwright on a cleared profile, full loop live (real scorer/feedback calls): create "QA Fundación Somos Amigos (temp)" → teaching empty state (copy verbatim-checked) → locked /tool entry dated **2010-05-20** (report; saved 0/100; compare CTA correctly absent at count=1) → batch intake entry dated **2026-06-15** (website; saved 85/100; payoff line + compare CTA at count=2) → compare page reads **t1 2010-05-20 → t2 2026-06-15** (16-year retrospective arc, exactly the §1b use case). Supabase rows shown (entry_date = material dates; created_at = analysis date 2026-07-04 — the resolved semantics working); QA subject cascade-deleted after; DB confirmed holding only the two DEMO subjects. Build + typecheck pass. |
| 11a | Copy refresh + 100% English + EN/ES switcher | P2 | DONE | 57331aa (copy) + none yet (i18n) | **Commit 1 (copy refresh, 57331aa — includes Antonio's "more than four decades" amendment):** Home rewritten to the post-June-15 voice (walkthrough positioning, mirror-not-monitor, jargon out), /tool header + Footer description refreshed, both CTAs (tool + demo story) on Home. **Commit 2 (i18n):** `next-intl@4.13.1` in no-locale-routing mode — locale is a persisted cookie (`cw.locale`, default `en`) read by `i18n/request.ts`; `<html lang>` follows it; EN/ES switcher in header (desktop + drawer) does `document.cookie` + `router.refresh()`, no URL change. Full message catalogs `messages/{en,es}.json` (~250 keys each; ICU plurals; rich tags for composed strings); ~25 components/pages migrated off hardcoded STRINGS: walkthrough, glossary (plain+deeper — copy moved OUT of `lib/copy/glossary.ts`, which now exports only the key type), demo banner, empty states, all form labels/errors (intake, new-subject, batch), header/footer, analyzer chrome, ResultStory, FeedbackCard chrome, compare view (incl. the mismatch warning), Part D chrome, score components. **Terms of art stay English in both languages** (Enactment Score, D1–D5 names, paradigm names, EACH values, Lens A) with the Spanish gloss carried by the glossary layers, per spec. English sweep: `CalculatorWidget`'s local EN/ES explainer toggle consolidated into the global switcher (its reviewed ES text kept, local island removed); remaining accent matches are proper nouns/loan words only. **Out of scope honored:** stored/generated content untouched (Feedback Cards, Part D output, demo texts render as authored); locale never wired into any Claude prompt (§1b decision pending); server API error strings remain English (pass-through — flagged); `/about`+`/batch`+`/badge` body content remains English-only (expert surfaces; catalogized chrome only where shared components reach them); Home dimension-card one-liners (lib DIMENSIONS) remain EN — glossary D-terms carry the ES explanations. Verified per spec: (a) grep audit — zero Spanish UI strings outside catalogs (only proper nouns + CalculatorWidget's by-design bilingual data); (b) Playwright — ES toggle switches walkthrough (all steps/buttons), glossary plain+deeper, demo banner, timeline, compare (chrono note, Part D, disclosure), new-subject form labels + placeholders; preference persists across hard navigations; toggle back → full EN; (c) `lang` attribute follows locale both ways; (d) build + typecheck clean; (e) Home EN/ES screenshots captured. |

| 11b | Performance audit & optimization | P3 | TODO | — | Measure first (Lighthouse/bundle), optimize only what the numbers indicate |

`TODO` → `IN PROGRESS` → `DONE`. Critical path to Sept 1 is **Phases 0–4 + 8**. Phases 5–7 are valuable but can land after the first baselines if time is tight.

---

## Phase 0 — Foundations & safety net  ·  `PUSH PRE-AUTHORIZED`

**Goal:** Make the repo safe to refactor and prepare the data layer seam — without changing behavior.

**Why:** Everything after this touches data and architecture. We want a clean build, a verification command, and a `lib/db/` seam in place before we add persistence.

**Files (read first):** `CLAUDE.md`, `package.json`, `app/` routes, the scoring/feedback API route(s), any existing `lib/`.

**Steps:**
1. Confirm `npm run build` and `tsc --noEmit` pass on the current `main`. Capture output as evidence.
2. Add a trivial smoke check: an `/api/health` route returning `{ ok: true, modelVersion }` so future autonomous runs have something to verify against.
3. Create `lib/db/` with an empty repository interface (`subjects.ts`, `entries.ts`, `analyses.ts`) exporting typed function stubs that throw `NotImplemented`. No Supabase wiring yet.
4. Add a `lib/modelVersion.ts` exporting a single constant (e.g. `MODEL_VERSION = "sonnet-4.6+prompt-2026-06"`).
5. Add the Supabase vars to `.env.local.example` (the repo's existing tracked template — do NOT create a separate `.env.example`, it's blocked by `.gitignore`'s `.env*` pattern) — values left blank:
   ```
   SUPABASE_URL=
   SUPABASE_SECRET_KEY=        # server-only, replaces legacy service_role — never expose to the client
   SUPABASE_PUBLISHABLE_KEY=   # optional, only needed if a future phase queries Supabase from the browser
   ```
   Note: Supabase has moved from legacy `anon`/`service_role` JWT keys to `publishable` (`sb_publishable_...`) / `secret` (`sb_secret_...`) keys. Treat `SUPABASE_SECRET_KEY` as equivalent to the old `service_role` key — full privilege, server-only, never in client code.

**Verify:** build + typecheck pass; `/api/health` returns 200 locally; show the output.

**Commit:** `chore: add db seam, model version constant, health check, env template`

**Review gate:** report build evidence. (Push pre-authorized — low risk, no behavior change.)

---

## Phase 1 — Data layer: schema + persistence  ·  P1

**Goal:** A real, queryable Supabase backend with the three tables and a working repository layer.

**Why:** This is the #1 unblocker. Without dated, stored entries per subject, the tool cannot do longitudinal anything.

**Prereq (Antonio, manual):** create the Supabase project and put the keys in `.env.local` + Vercel. Agent does not do this.

**Schema (write as a migration `supabase/migrations/0001_init.sql`):**

```sql
create extension if not exists pgcrypto;  -- required for gen_random_uuid()

create type subject_type as enum ('jj_partner', 'ngl');
create type material_genre as enum ('interview','article','website','report','social','other');

create table subjects (
  id uuid primary key default gen_random_uuid(),
  ashoka_internal_id text,
  name text not null,
  type subject_type not null,
  parent_org_id uuid references subjects(id),  -- NGL -> JJ Partner
  created_at timestamptz default now(),
  created_by text,
  -- Decision #1: NGL must nest under a JJ Partner; JJ Partners have no parent.
  constraint ngl_requires_parent check (
    (type = 'ngl' and parent_org_id is not null) or
    (type = 'jj_partner' and parent_org_id is null)
  )
);

-- Defense in depth: only the server-side secret key touches these tables,
-- but RLS + a deny-all policy means a future accidental use of the
-- publishable key from the browser can't read or write anything.
alter table subjects enable row level security;
alter table entries enable row level security;
alter table analyses enable row level security;

create table entries (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  entry_date date not null,            -- analysis date, NOT source date
  material_text text not null,
  material_source_url text,
  genre material_genre not null,
  ashokan_name text not null,
  contextual_notes text,               -- metadata, not scored
  created_at timestamptz default now()
);

create table analyses (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries(id) on delete cascade,
  enactment_score int not null,        -- 0..100
  d1 int not null, d2 int not null, d3 int not null, d4 int not null, d5 int not null,  -- 0..4 each
  each_orientation text not null,
  lens_a_tag text,
  lens_b_flag text,
  feedback_card jsonb not null,
  model_version text not null,
  created_at timestamptz default now()
);

create index on entries (subject_id, entry_date);
create index on analyses (entry_id);
```

**Steps:**
1. `npm install @supabase/supabase-js` — this is NOT yet a dependency in `package.json`. Confirm the install succeeded before writing any import that references it.
2. Add the Supabase client in `lib/db/client.ts` (server-side only, initialized with `SUPABASE_SECRET_KEY`; never imported from a client component).
3. Implement the repository functions in `lib/db/{subjects,entries,analyses}.ts`: `createSubject`, `getSubject`, `listSubjects`, `createEntry`, `listEntriesBySubject`, `saveAnalysis`, `listAnalysesBySubject` (joined with entries, ordered by `entry_date`).
4. Keep all types in `lib/db/types.ts` (already scaffolded in Phase 0 — extend, don't duplicate).

**Verify:** a throwaway script or a temporary `/api/db-selftest` route that creates a subject, an entry, and an analysis, reads them back, then deletes them — show the round-trip output. Also confirm the `ngl_requires_parent` constraint actually rejects an NGL with no `parent_org_id` (attempt it, show the DB error). Remove the selftest route before commit (or guard behind a dev flag).

**Commit:** `feat(db): supabase schema + repository layer for subjects/entries/analyses`

**Review gate:** STOP. Show the migration, the repo functions, and the round-trip evidence.

---

## Phase 2 — Entry intake  ·  P1

**Goal:** A run can now be *saved* as a dated entry tied to a subject, instead of being ephemeral.

**Why:** Turns the existing one-shot analyzer into a baseline-capturing tool.

**Files:** the single-text analyze page (`/`), the scoring API route, new `lib/db` calls from Phase 1.

**Steps:**
1. Add intake fields to the analyze flow: subject (create new or pick existing), subject type, entry date (defaults to today, editable), genre, Ashokan name, contextual notes.
2. On analyze: run the existing scoring pipeline, then persist `entry` + `analysis` (with `MODEL_VERSION` stamped). Existing ephemeral analysis still renders as today.
3. Validation: required fields, one genre per entry (enforce decision #6 — if the user pastes obviously mixed material, surface a hint, don't auto-split silently).

**Verify:** create two entries for the same subject at two dates via the UI; confirm both rows land in Supabase with correct `entry_date` and `model_version`. Show the rows.

**Commit:** `feat: save analysis as dated entry tied to a subject`

**Review gate:** STOP.

---

## Phase 3 — Subject history view  ·  pulled up from P3

**Goal:** See every entry for a subject, chronologically, with its scores.

**Why:** Cheap to build right after Phase 2, and it's the surface the comparative view plugs into. Pulling it ahead of the P3 line because it de-risks Phase 4.

**Files:** new `app/subjects/page.tsx` (list), `app/subjects/[id]/page.tsx` (detail).

**Steps:**
1. `/subjects`: list subjects with type, # entries, last entry date.
2. `/subjects/[id]`: ordered timeline of entries — date, genre, enactment score, EACH orientation, link to that entry's Feedback Card.
3. Visual system per `CLAUDE.md` (cream/terracotta/teal; Fraunces/IBM Plex).

**Verify:** seeded subject from Phase 2 shows both entries in date order. Screenshot or DOM evidence.

**Commit:** `feat: subject list + history timeline view`

**Review gate:** STOP.

---

## Phase 4 — Comparative view  ·  P2  ·  (this is the headline deliverable)

**Goal:** Pick two entries (t1, t2) for one subject and see the narrative shift.

**Why:** This is the whole point of the expansion — measuring change over time.

**Files:** extend `/batch` (the spec says "adjust what we built for Hola América") or a new `app/subjects/[id]/compare` route; Recharts radar component.

**Steps:**
1. Two-entry selector for a single subject (default: earliest vs latest).
2. Compute per-dimension delta (D1–D5, +/-), enactment delta, and a **narrative direction indicator** (toward higher / lower changemaker density / stable).
3. **Overlaid radar:** t1 and t2 on the same Recharts radar.
4. **Guardrails:** refuse to compare two different subjects; if the two analyses have different `model_version`, show a visible warning that the delta may reflect model change, not narrative change. (Decision #3 + #4.)

**Verify:** comparison of the two seeded entries renders correct deltas and an overlaid radar; trigger the `model_version` warning with a hand-edited row to confirm the guard works. Show both.

**Commit:** `feat: longitudinal comparison — per-dimension delta, overlaid radar, direction indicator`

**Review gate:** STOP.

---

## Phase 5 — AI narrative change summary  ·  P2

**Goal:** A generated paragraph that narrates the shift: which dimensions improved, regressed, stayed stable, and a plausible reading of why.

**Why:** Completes the comparative output the spec asks for (Feedback Card change narrative).

**Files:** new server action / API route; extend Feedback Card rendering (add as "Part D — Change over time").

**Steps:**
1. Sonnet call (temperature 0) that takes both analyses + the computed deltas and writes the change narrative. Structured JSON out, parsed safely.
2. Inputs are the *scores and deltas*, plus short material excerpts — not the full corpus — to keep it grounded and cheap.
3. Reuse existing retry/backoff + caching patterns.

**Verify:** summary text matches the actual deltas (no hallucinated direction). Show one run.

**Commit:** `feat: AI-generated longitudinal change summary (Feedback Card Part D)`

**Review gate:** STOP.

---

## Phase 6 — Org-language Feedback Card + weight profiles  ·  P3

**Goal:** Card language reads correctly for an organization (not a person), and scoring uses the right weight vector per subject type.

**Why:** JJ Partners are institutions; first-person/individual framing misreads them.

**Files:** scoring prompt(s), Feedback Card copy, new `lib/scoring/weights.ts`.

**Steps:**
1. Branch Card copy / prompt framing on `subject.type` (org vs individual phrasing).
2. `lib/scoring/weights.ts`: two named weight vectors keyed by subject type; both default to the current vector. Wire the Enactment computation to pick the vector by type.
3. Leave the org vector at defaults with a clear `// TODO: values pending Giselle` marker. Do **not** invent the D5 down-weight — that's an open decision.

**Verify:** an org subject renders org-appropriate language; switching a subject's type changes which weight vector is applied (log the chosen vector). Show it.

**Commit:** `feat: subject-type-aware feedback card + per-type weight profiles (defaults)`

**Review gate:** STOP.

---

## Phase 7 — Export to PDF  ·  P3

**Goal:** Export the comparative report as a shareable PDF.

**Why:** The spec asks for an exportable comparative report for internal use / partner conversations. PDF is the lowest-friction format.

**Files:** a print-optimized route or server-side PDF generation for the compare view.

**Steps:**
1. Implement PDF export of the Phase 4/5 comparative report (overlaid radar, deltas, change narrative, subject metadata, both dates, `model_version`).
2. Keep Word/slides out of scope unless Antonio asks.

**Verify:** generated PDF opens and contains all sections. Attach/show the file.

**Commit:** `feat: PDF export of comparative report`

**Review gate:** STOP.

---

## Phase 8 — Diamond baseline pilot dry run  ·  critical path

**Goal:** End-to-end rehearsal: seed the Diamond orgs as subjects and generate a real t1 for each, before Sept 1.

**Why:** Proves the whole pipeline on real institutional material and surfaces problems while there's still time. (Deadline origin: Bill's direct request, June 15 Measures & Impact meeting — a "changemaker density" baseline per Diamond by 2026-09-01.)

**Prerequisites (from the June 15 leadership feedback — do these BEFORE the first real baseline):**
- **Adversarial scoring test.** Run and document two contrast cases through the scorer: (a) a keyword-stuffed text ("changemaker", "empathy", "systemic" repeated without substance) and (b) a text that embodies the worldview without using the vocabulary. The instrument's stated claim is that it detects *enacted* discourse, not keyword repetition — this test either produces the evidence for that claim or surfaces a scoring-prompt problem to fix first. Save both texts + scores + rationale in `docs/ADVERSARIAL_VALIDATION.md`.
- **Data governance one-pager.** `docs/DATA_GOVERNANCE.md`: what content is analyzed (public institutional material only), consent posture, who can access results, retention, known model limitations/bias considerations. The June 15 meeting explicitly flagged this as unaddressed — one page turns "they haven't thought about it" into "it's documented."
- **Calibration note.** Short section (can live in the same doc or `docs/METHODOLOGY.md`): rationale for the band thresholds (e.g., ≥70 = Changemaker) and the role of `model_version` in comparability. Requested directly in the June 15 meeting; also feeds the publish-the-framework-as-a-paper path (De Fina / Georgetown).

**Steps:**
1. With Antonio, create the Diamond org subjects (`jj_partner`).
2. Run t1 analyses on real institutional material (one entry per genre where relevant).
3. Sanity-check scores and Card language with Giselle.
4. Log issues back into this file as new phases if needed.

**Verify:** each Diamond org has at least one stored, dated t1 analysis with sane output.

**Commit:** `chore: seed Diamond baseline subjects + t1 entries (pilot)`

**Review gate:** STOP — this is real data; Antonio + Giselle review before anything is treated as official baseline.

---

## Phase 9 — Guided experience & board-readiness  ·  P2  ·  (judgment-heavy: strong model only)

**Goal:** A first-time, non-technical user — think a 65-year-old board member with no context — can open the tool, understand what it is, run their first analysis, and correctly interpret the result **unaided, in under 5 minutes**. That sentence is the acceptance test for this whole phase.

**Why:** The instrument's credibility with leadership depends on comprehension, not spectacle. Right now the tool assumes its user already knows what an Enactment Score, a paradigm band, or Lens A means. Board members and most Ashokans don't. The platform should carry its own narrative — what it measures, why it matters, what a result means — without Antonio standing next to it explaining.

**What this phase is NOT:**
- Not a redesign of the visual identity. CLAUDE.md's system (as corrected) stays. This is layering guidance ON TOP of the existing design, not replacing it.
- Not gamification, badges, confetti, or evaluative framing. The instrument is descriptive. "Higher score" is not "better person/org" — the guided layer must reinforce that framing, never undermine it.
- Not a scoring/data-model change. Zero changes to lib/scoring, lib/compare, prompts that affect scores, or the DB schema. If a copy change would alter how a score is *computed* rather than *explained*, STOP — that's out of scope.

**Steps:**

1. **First-run walkthrough.** A dismissible, resumable guided overlay (or dedicated `/start` flow) that answers, in order: What is this? (2 sentences, plain language) → What do I need? (a text about a person or organization) → Try it (one click loads a demo). Skippable at every step; never shown again once dismissed unless re-invoked from the header. **Positioning requirement (from the June 15 leadership feedback):** the very first sentence must answer "what is this for and for whom" — an *Ashoka-internal instrument for understanding how partner narratives evolve through the relationship with Ashoka*. It is a mirror, not a monitor: never frame it as scoring/judging/policing anyone's language. The June 15 critique ("reads as an internal validation tool, why would anyone volunteer to be policed") is the exact misreading this copy must preempt.

2. **Demo mode with seeded sample data.** One pre-loaded, clearly-labeled DEMO subject (fictional org + one NGL, with 2–3 dated entries showing believable movement) so the full longitudinal story — timeline, compare view, radar, Part D narrative — can be demonstrated live without depending on real data existing or a live Claude call succeeding. The DEMO label must be unmissable on every screen where demo data appears. Seed via a script (`scripts/seed-demo.ts`), flagged in the DB (e.g. `ashoka_internal_id = 'DEMO'`), excluded by default from the real subjects list behind a "Show demo" toggle.

3. **Plain-language layer everywhere a term of art appears.** Every specialized term — Enactment Score, each dimension D1–D5, paradigm names, EACH Orientation, Lens A, model version — gets a one-tap/hover explanation in human language (no sociolinguistics vocabulary in the first sentence; the academic grounding can live one level deeper for those who want it). One source of truth: a single `lib/copy/glossary.ts` so definitions never drift between screens.

4. **Progressive disclosure on results.** Default result view leads with the story: paradigm name + one-paragraph meaning + the radar. Numbers, per-dimension justifications, quotes, and flags live behind a clearly-labeled expansion ("See the full reading"). Experts lose nothing; novices aren't hit with a wall of scores.

5. **Story-first compare view.** For the longitudinal comparison, the Part D narrative (Phase 5) becomes the lead element for non-expert eyes — the deltas and radar support it, not the other way around. Keep the current expert layout available via the same progressive-disclosure pattern.

6. **Readability & accessibility pass for older users.** Minimum 16px body text everywhere, strong contrast per the existing palette, generous touch targets, no information conveyed by color alone (the radar's t1/t2 must also be distinguishable by line style/label). No new animations.

7. **Board demo script.** A short `docs/BOARD_DEMO.md`: a 7-minute walkthrough script in plain English (with the Spanish version alongside), starting from the demo subject, hitting: what it measures → a single reading → the longitudinal story → what Ashoka does with this. Written so anyone on the team — not just Antonio — could give the demo.

**Language note:** audit first. The UI currently mixes Spanish and English surfaces (`/calculadora` vs English labels). For this phase, make the guided layer bilingual-ready but consistent per surface — do not leave a walkthrough that starts in English and ends in Spanish. Flag (don't unilaterally decide) if a full i18n pass seems needed; that's a separate decision for Antonio.

**Verify:** (a) fresh browser profile, no localStorage: the walkthrough appears, is completable, is dismissible, and never reappears after dismissal; (b) demo subject renders the complete longitudinal story end-to-end with zero live-API dependency for the stored parts; (c) every glossary term listed above has a working explanation on every screen it appears; (d) screenshot evidence of the default (novice) vs expanded (expert) result views; (e) `docs/BOARD_DEMO.md` exists and matches what the UI actually shows.

**Commit:** `feat: guided first-run experience, demo mode, plain-language layer, board demo script`

**Review gate:** STOP. This phase is copy- and judgment-heavy — Antonio reviews the actual language line by line, not just the diff shape. The narrative voice here IS the product for the board audience.

---

## Phase 10 — Subject-first workflows & batch intake  ·  P2

**Goal:** Any non-technical user (Giselle, a board member, any Ashokan) can create ANY new subject of analysis — a Diamond org, a JJ Partner, an NGL, a thought leader, whatever Ashoka wants to measure — feed it dated materials from any era (a 2010 interview, a 2026 report), and reach the longitudinal comparison, all through a visible, guided, subject-first flow. The current entry point (hidden at the bottom of the analyzer, text-first) stays but stops being the only way in. Concrete acceptance example — NOT the scope, just one instance of it: create "Fundación Somos Amigos", add a 2010-dated interview and a 2026-dated one, land on the comparison.

**Why:** Phase 2's intake is text-first (analyze → then attach a subject). Non-technical users think subject-first (create the org → feed it materials over time). Both flows are valid; only one exists. This phase adds the missing one without removing the existing one.

**What this phase is NOT:** not a redesign; no schema changes; no changes to scoring or compare logic.

**Steps:**

0. **Implement the resolved `entry_date` semantics (§1b, decided 2026-07-03).** The field now officially means the MATERIAL/NARRATIVE date. No schema change — relabel every UI surface ("Material date", with helper text like "when this was written or said — not today's date"), update the glossary entry, and update docs (BOARD_DEMO.md / METHODOLOGY.md) where the old meaning appears. The intake form should stop defaulting the date to today silently — keep today as the default value but make the label make backdating obvious and natural.

1. **"New subject" on `/subjects`.** A visible primary action: name, type (JJ Partner / NGL with parent-org picker per the nesting constraint), Ashoka internal ID, created_by. On create → land on the subject's (empty) detail page.
2. **Empty state that teaches.** A subject with zero entries should say what to do next in one sentence ("Add its first material — a report, an interview, a public statement — to create the baseline") with an "Add entry" button. An empty state is a teaching surface, not a blank screen.
3. **"Add entry" from the subject page.** Routes to `/tool` with the subject pre-selected and locked in the intake form (query param or equivalent). The user pastes material, analyzes, generates the reading, saves — subject already chosen. After save, offer "Back to [subject]" so the loop closes.
4. **Batch intake for one subject.** Extend the existing `/batch` machinery: paste/upload multiple texts for ONE subject, each with its own date + genre, run analyses (reuse the existing pLimit/error-isolation patterns), persist each as a dated entry. This is what Phase 8 actually needs — Antonio will be ingesting multiple materials per Diamond org, and doing them one at a time through `/tool` doesn't scale to a deadline.
5. **Post-save guidance.** When a subject reaches 2+ entries, surface the "Compare two entries →" CTA in the save-confirmation moment too, not only on the timeline — the comparison is the payoff, and the user who just added the second entry is exactly the person who wants it.

**Verify:** full subject-first loop with Playwright on a fresh profile: create subject → empty state → add entry (2010-dated material) → add second entry (2026-dated) via batch intake → land on compare with correct chronological t1/t2. Show the Supabase rows and the UI at each step.

**Commit:** `feat: subject-first creation flow, teaching empty states, per-subject batch intake`

**Review gate:** STOP.

---

## Phase 11a — Copy refresh + 100% English + EN/ES switcher  ·  P2  ·  (copy is judgment-heavy: strong model preferred)

**Goal:** The platform speaks with one refreshed voice, entirely in English by default, and switches completely to Spanish with one visible control.

**Order matters — do these strictly in sequence** (translating copy that's about to be rewritten is wasted work):

1. **Copy refresh (Commit 1 — review gate before proceeding to i18n).**
   - Home page first: it predates the June 15 positioning learnings and the Phase 9 voice. Rewrite it to carry the same narrative the walkthrough now opens with ("Built by Ashoka to understand the stories behind its partnerships…"), mirror-not-monitor framing, descriptive-not-evaluative.
   - General pass over remaining surfaces (headers, CTAs, section intros, `/about` lead-ins) for voice consistency with `lib/copy/glossary.ts` and the walkthrough. Do not touch scoring/feedback prompts.
   - **Report the proposed copy strings BEFORE wiring them** — same protocol as Phase 9; Antonio reviews language line by line.
2. **100% English sweep.** Audit and convert every remaining Spanish UI string (the ~5% residue flagged in Phase 9's audit, including `/calculadora`'s surfaces — consolidate, don't leave islands). English is the canonical source language.
3. **EN/ES switcher (Commit 2).**
   - A visible language toggle (header), persisted preference (cookie or localStorage), default English.
   - Preferred approach: `next-intl` without locale-based routing (no `/[locale]/` route restructure — a persisted client preference is enough for the pilot). If the pre-flight audit surfaces a blocker with that approach, STOP and report rather than improvising an ad-hoc translation system.
   - Everything UI-visible switches: walkthrough, glossary (plain + deeper layers), empty states, buttons, headers, footers, form labels, error messages, the demo banner.
   - **Explicitly OUT of scope: generated and stored content.** Feedback Cards, Part D narratives, and stored demo texts stay in the language they were generated/authored in. Whether analyses should be *generated* in the user's active language is a product decision for Antonio + Giselle (added to §1b) — do not wire the locale into any Claude prompt in this phase.
   - Translations must be reviewed Spanish, not machine-babble: natural Latin American Spanish, consistent terminology with the glossary (e.g., decide once: "Enactment Score" stays untranslated as a term of art, with a Spanish gloss — mirror how the docs handle it).

**Verify:** (a) grep-level audit shows zero hardcoded user-facing strings outside the message catalogs; (b) Playwright: toggle to ES → walkthrough, glossary, empty states, and form labels all render in Spanish; refresh → preference persists; toggle back → full English; (c) `lang` attribute follows the active locale; (d) build + typecheck clean; (e) screenshots of Home EN vs ES.

**Commits:** `feat: copy refresh — home + platform voice pass` then `feat: EN/ES language switcher (next-intl, persisted preference)`

**Review gate:** STOP after Commit 1 (copy review), STOP again after Commit 2.

---

## Phase 11b — Performance audit & optimization  ·  P3

**Goal:** The platform is measurably fast, and every optimization is justified by a measurement — not by intuition.

**Rule: measure first.** No optimization is applied before the baseline numbers exist.

**Steps:**

1. **Baseline measurement.** Lighthouse (desktop + mobile presets) against a production build (`npm run build && npm run start`, not dev mode) on: `/`, `/tool`, `/subjects`, `/subjects/[id]` (demo subject), `/subjects/[id]/compare`. Plus the Next.js build output's route-size table and, if useful, a bundle analysis. Record everything in `docs/PERFORMANCE.md`.
2. **Diagnose from data.** Likely suspects to check against the numbers — not to fix preemptively: Recharts bundle size on radar-bearing routes (candidate for dynamic import), font loading strategy, client-component boundaries that could be server components, uncached Supabase queries on the subjects pages.
3. **Optimize only what the data indicts.** Each change gets a one-line justification tied to a measurement. No feature removal, no visual changes, no scoring-path changes for the sake of a score.
4. **Re-measure and document.** Before/after table in `docs/PERFORMANCE.md`.

**Targets (reasonable, not heroic):** Lighthouse Performance ≥ 90 desktop / ≥ 75 mobile on the five routes; LCP < 2.5s; no route's first-load JS grossly out of line with its peers without a stated reason.

**Verify:** the before/after table, with the production-build methodology stated.

**Commit:** `perf: measured optimizations per docs/PERFORMANCE.md baseline`

**Review gate:** STOP.

---

## Appendix — guardrails the agent must never violate

- Never push or deploy past a review gate (except Phase 0).
- Never handle secrets/keys or create accounts.
- Never change the visual system defined in `CLAUDE.md`.
- Never compare a subject to a different subject, or across `model_version`, without a visible warning.
- Never invent the open-decision values (org weights, D5 down-weight, auth model).
- Prefer reversible changes; commit per feature so any step can be reverted cleanly.
- Show evidence, not assertions, for every "done."

---

## Appendix B — running this plan with Antigravity CLI (Gemini Flash)

This plan was written tool-agnostic, but the current execution agent is Antigravity CLI, not Claude Code — a few things differ in practice:

- **Antigravity's native "always-on" convention is `.agents/rules/`, not `CLAUDE.md`.** Antigravity won't auto-load `CLAUDE.md` just because it exists. Every session prompt must still explicitly say "read CLAUDE.md and CAS_LONGITUDINAL_BUILD_PLAN.md first" — don't rely on it happening implicitly. Optionally, drop a one-line pointer file at `.agents/rules/project.md` ("Always read CLAUDE.md and CAS_LONGITUDINAL_BUILD_PLAN.md before any change in this repo") so it's automatic instead of retyped each time.
- **Check Antigravity's confirmation/auto-approve setting and make sure it's off** for file writes and any `git`/shell command with side effects. This gives a structural stop, not just a prompt-based one — important because Flash is cheaper and faster but less reliable than Sonnet/Opus at self-imposed "stop and wait" instructions. Don't rely on the plan's prose alone to enforce the review gate with this model.
- **Model routing:** Flash is a good, cheap fit for Phases 0, 1, 2, 3, 6, 7 — they're well-specified and mostly mechanical (this plan hands it the exact schema and steps). Phases 4 and 5 involve judgment calls (delta correctness, guardrail logic, narrative grounding) — consider running those two phases with a stronger model (actual Claude Code, or at minimum a closer manual review of the diff) rather than Flash on default settings.
- **Session grouping for token efficiency:** each fresh session pays a fixed context cost just loading its own system prompt, tools, and this file. Low-risk, mechanical phase pairs can be run in one sitting instead of two separate sessions if context allows — e.g. Phases 2+3 (entry intake + history view share the same data shape and are both low-judgment UI work). Keep Phase 4 as its own dedicated session regardless; it's the highest-value, highest-risk piece and deserves a clean context window and closer review.
- **Prefer a committed, repeatable verification command over free-form "show me it works."** Where practical, have the agent write a small script (e.g. `scripts/verify-phase1.ts`) that performs the round-trip check and prints pass/fail, rather than composing ad hoc curl/psql commands each time. Cheaper to re-run, cheaper to review, less drift between what was verified and what's committed.
