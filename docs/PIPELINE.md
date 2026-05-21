# Changemaker Scoring Pipeline

A batch CLI for running the Changemaker Paradigm Scoring Matrix at scale. Processes text files through a sequence of commands, each writing an intermediate JSON artifact to a per-text output directory.

## Directory structure

```
pipeline/
├── cli.ts                 — commander entry point
├── commands/
│   └── ingest.ts          — reads .txt files, writes source.json
├── lib/
│   ├── io.ts              — readTextFiles, writeJson, readJson, ensureDir, fileExists
│   ├── logger.ts          — log.info / warn / error / success (picocolors)
│   └── slugify.ts         — slugify, uniqueSlugify
├── input/                 — drop .txt source files here (gitignored)
└── output/                — generated artifacts (gitignored)
    └── {slug}/
        ├── source.json    — written by ingest
        ├── score.json     — written by score (phase 2)
        ├── extraction.json — written by extract (phase 2)
        └── report.json    — written by consolidate (phase 2)
```

## Shared utilities

`lib/text.ts` (root) exports `countWords(text)` — the single source of truth for word counting, shared by the API route and the pipeline. Any change to word-count logic goes there.

## Commands

### `ingest`

Reads every `.txt` file in `--input`, validates word count, and writes `source.json` to `--output/{slug}/`.

```bash
npx tsx pipeline/cli.ts ingest \
  --input ./pipeline/input \
  --output ./pipeline/output

# Overwrite existing outputs
npx tsx pipeline/cli.ts ingest \
  --input ./pipeline/input \
  --output ./pipeline/output \
  --force
```

**Options**

| Flag | Required | Description |
|---|---|---|
| `--input <dir>` | yes | Directory of `.txt` source files |
| `--output <dir>` | yes | Root output directory |
| `--force` | no | Overwrite existing `source.json` files |

**Behavior**

- Files outside the 50–7,000 word range are logged as `WARN` and skipped.
- If `output/{slug}/source.json` already exists and `--force` is not set, the file is skipped with `skipping (exists)`.
- An error in one file is logged and the batch continues.
- Fatal errors (input dir missing) exit with code 1.
- Idempotent: running without `--force` is always safe.

**`source.json` schema (schemaVersion 1)**

```json
{
  "schemaVersion": 1,
  "slug": "test-article",
  "originalFilename": "test-article.txt",
  "wordCount": 147,
  "text": "...",
  "ingestedAt": "2026-05-20T20:00:00.000Z"
}
```

### `score` _(phase 2, not yet implemented)_

Reads `source.json`, calls the Anthropic scorer via `lib/anthropic.ts`, writes `score.json` to the same slug directory.

```bash
npx tsx pipeline/cli.ts score \
  --output ./pipeline/output \
  [--slug <slug>]   # score only one; omit to score all pending
```

### `extract` _(phase 2, not yet implemented)_

Reads `score.json` and applies the EXTRACTOR_SYSTEM_PROMPT to pull structured evidence. Writes `extraction.json`.

### `consolidate` _(phase 2, not yet implemented)_

Reads all `score.json` + `extraction.json` files in `--output` and computes the Density Rate (CMDR) across the corpus. Writes `report.json` at the root output level.

### `report` _(phase 2, not yet implemented)_

Renders `report.json` as a Markdown or CSV summary.

## Typical workflow

```
ingest → score → extract → consolidate → report
```

Each command is independently re-runnable. A failed `score` run can be retried without re-ingesting. Use `--force` on any command to re-run from that step forward.

## Slug collisions

If two filenames produce the same slug (e.g. `mi texto.txt` and `mi-texto.txt`), the second is assigned `{base}-2`, `{base}-3`, etc. Collision resolution is deterministic within a single run (alphabetical file order).

## Schema versioning

Every JSON artifact the pipeline writes carries `"schemaVersion": N`. Increment the version whenever the shape of a file changes in a breaking way. This lets migration scripts detect and upgrade old artifacts without guessing.
