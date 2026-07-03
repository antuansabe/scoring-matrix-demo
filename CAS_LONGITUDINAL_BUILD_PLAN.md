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

- **Org weight values** (D1–D5 for `jj_partner`). Owner: Giselle.
- **Can an NGL exist without a parent JJ Partner**, or is nesting mandatory? Owner: Giselle / Antonio.
- **Access / auth model** for an internal Ashoka tool (who can open it). Likely Entra/Azure AD SSO eventually — governance + IT decision, not a Sept 1 blocker. For the pilot, gate behind a single shared access mechanism Antonio chooses.
- **Export branding/template** for the comparative report. Owner: Antonio.

---

## 2. Status tracker

| # | Phase | Priority | Status | Commit | Note |
|---|-------|----------|--------|--------|------|
| 0 | Foundations & safety net | — | DONE | a5a54b5 | Build/typecheck pass, health route works. Repo relocated from ~/Desktop (iCloud-synced, caused a multi-hour build hang) to ~/Developer/Changemaker — see note below. |
| 1 | Data layer + schema + persistence | P1 | DONE | 99a4a8b | Migration applied by Antonio. `@supabase/supabase-js` installed; `lib/db/client.ts` + repo functions (subjects/entries/analyses) implemented against the existing Phase 0 stub signatures. Round-trip verified via a temporary `/api/db-selftest` route (subject→entry→analysis created + read back + deleted; `ngl_requires_parent` confirmed to reject an orphan NGL with Postgres error 23514) — route removed before this commit. Build + typecheck pass. (Hash corrected here — the commit was amended after the tracker row was first written, so it couldn't self-reference its own final hash.) |
| 2 | Entry intake (date, subject, type, genre, notes) | P1 | DONE | 3d90191 | Added subject/type/entry-date/genre/ashokan-name/contextual-notes intake to the `/tool` live analyzer (analyze page moved there from `/` since CLAUDE.md was written). New `POST /api/entries` persists entry + analysis via the Phase 1 repo layer, stamped with `MODEL_VERSION`. `analyses.feedback_card` is NOT NULL, so the save form only unlocks once the existing on-demand Deeper Reading feedback exists — no fake data is ever persisted. Added `detectMixedGenreHint` (lib/text.ts) — a cheap interview-vs-report marker heuristic that surfaces a hint, never auto-splits (Decision #6). Verified live via Playwright end-to-end (real Claude calls, not mocked): created a JJ Partner subject with an entry dated 2026-01-15, then a second entry for the same subject dated 2026-06-20 selected from the now-populated "Existing" dropdown — both rows confirmed in Supabase with correct `entry_date` and `model_version: sonnet-4.6+prompt-2026-06`. Build + typecheck pass. |
| 3 | Subject history view | P3→pulled up | DONE | none yet | `/subjects` (list: name, type, entry count, last entry date) and `/subjects/[id]` (chronological timeline via the existing `listAnalysesBySubject`) plus a new `/subjects/[id]/entries/[entryId]` route so "Feedback Card" is an actual link, rendering the stored `feedback_card` through the existing `FeedbackCard` component in `initialState="loaded"` mode. Added `listSubjectsWithStats` and `getAnalysisByEntryId` to the repo layer. Added "Subjects" to Header/Footer nav. Verified live via Playwright against the two Phase 2 seeded entries: list shows 2 entries/last date 2026-06-20; detail page shows both in chronological order (2026-01-15 before 2026-06-20); Feedback Card link renders the full stored Deeper Reading content plus D1–D5/model_version. Build + typecheck pass. |
| 4 | Comparative view (delta + overlaid radar + direction) | P2 | TODO | — | — |
| 5 | AI narrative change summary | P2 | TODO | — | — |
| 6 | Org-language Feedback Card + weight profiles | P3 | TODO | — | — |
| 7 | Export to PDF | P3 | TODO | — | — |
| 8 | Diamond baseline pilot dry run (t1) | — | TODO | — | — |

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

**Why:** Proves the whole pipeline on real institutional material and surfaces problems while there's still time.

**Steps:**
1. With Antonio, create the Diamond org subjects (`jj_partner`).
2. Run t1 analyses on real institutional material (one entry per genre where relevant).
3. Sanity-check scores and Card language with Giselle.
4. Log issues back into this file as new phases if needed.

**Verify:** each Diamond org has at least one stored, dated t1 analysis with sane output.

**Commit:** `chore: seed Diamond baseline subjects + t1 entries (pilot)`

**Review gate:** STOP — this is real data; Antonio + Giselle review before anything is treated as official baseline.

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
