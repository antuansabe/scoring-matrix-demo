# Performance — Phase 11b audit (measured, not guessed)

## 1. Methodology

- **Date:** 2026-07-08 · branch `feat/longitudinal-foundation`, baseline measured at `403571d` (after the hide-surfaces, i18n-completion, AI-locale, and monthly-aggregate commits — those change bundles, so earlier numbers would not be comparable).
- **Build:** production only — `npm run build && npm run start` (Next.js 16.2.6, Turbopack). Never `next dev`.
- **Tool:** Lighthouse 13.4.0 via `npx lighthouse`, headless Chrome (`--headless=new`), `--only-categories=performance`.
- **Form factors:** desktop = `--preset=desktop`; mobile = Lighthouse default config (Moto-class emulation, 4× CPU slowdown, slow-4G throttling: 150 ms RTT, ~1.6 Mbps).
- **Runs:** 3 per route × form factor; the tables report the **median of 3** (Lighthouse jitters a few points run to run).
- **Routes** (per the Phase 11b spec): `/`, `/tool`, `/subjects`, `/subjects/[id]` (demo subject), `/subjects/[id]/compare`. Demo data seeded via `scripts/seed-demo.ts`.
- **Machine:** Apple M2, local Supabase round-trips over the public internet (TTFB numbers include real DB latency — `force-dynamic` routes).
- Raw Lighthouse JSONs kept outside the repo (session scratchpad); this document records the medians.

**Targets:** Performance ≥ 90 desktop / ≥ 75 mobile on all five routes; LCP < 2.5 s.

## 2. Build output

Next 16 + Turbopack does not print a per-route First-Load-JS table; all 21 routes build as `ƒ (Dynamic) server-rendered on demand`. Largest client chunks (uncompressed on disk, baseline):

| Chunk | Size | Contents |
|---|---|---|
| `0iq-7i1.~suu9.js` | 316 KB | recharts + d3 |
| `0pq0.tuponklb.js` | 316 KB | recharts + d3 (second variant) |
| `07lhk_q6pmm3r.js` | 224 KB | framework/shared |
| `180r8l4npnr7k.js` | 144 KB | framework/shared |

## 3. Baseline (median of 3)

| Route | Form | Perf | LCP | TBT | CLS | TTFB | Total bytes |
|---|---|---|---|---|---|---|---|
| home | desktop | 97 | 1.25 s | 0 ms | 0.000 | 21 ms | 968 KB |
| home | mobile | 77 | 6.46 s | 30 ms | 0.000 | 14 ms | 965 KB |
| tool | desktop | 97 | 1.29 s | 0 ms | 0.000 | 206 ms | 1069 KB |
| tool | mobile | 77 | 6.76 s | 32 ms | 0.000 | 182 ms | 1065 KB |
| subjects | desktop | 97 | 1.25 s | 0 ms | 0.000 | 613 ms | 970 KB |
| subjects | mobile | 91 | 3.55 s | 15 ms | 0.000 | 534 ms | 966 KB |
| subject-detail | desktop | 94 | 1.25 s | 0 ms | 0.000 | 2650 ms | 971 KB |
| subject-detail | mobile | 77 | 6.61 s | 26 ms | 0.000 | 319 ms | 968 KB |
| compare | desktop | 97 | 1.33 s | 0 ms | 0.000 | 345 ms | 1075 KB |
| compare | mobile | 77 | 6.76 s | 37 ms | 0.000 | 314 ms | 1071 KB |

Baseline verdict vs targets: **desktop ≥ 90 everywhere ✓ · mobile ≥ 75 everywhere ✓ (barely: 77 on four routes) · LCP < 2.5 s FAILS on mobile everywhere (6.5–6.8 s; desktop passes).**

## 4. Diagnosis (from the data, not intuition)

1. **`public/logo.png` = 597 KB transferred on every route** — 62 % of each page's total byte weight, a 1756×1593 PNG rendered at 40 px in the sticky header via a raw `<img>` with no intrinsic dimensions. On slow-4G it alone is ~3 s of bandwidth. Indicted by `total-byte-weight` and the network-requests audit on all ten cells.
2. **The mobile LCP element is the first-run Walkthrough dialog** (`lcp-breakdown-insight`: `body > div.fixed … p.mt-4` — the walkthrough's step-1 paragraph). Lighthouse always runs a fresh profile, so the Phase 9 tour auto-opens; it mounts only **after hydration**, so mobile LCP = time for ~965 KB of assets to download on slow-4G + hydrate. The logo's 597 KB sits directly in that critical path.
3. **recharts (two 316 KB chunks, ~100 KB transferred)** rides the first load of `/tool` and `/compare` (1065–1075 KB vs ~966 KB elsewhere) via static barrel imports in `RadarProfile`/`CompareRadar`, both of which already render `null` until a `useEffect` mount flag — the payload is pure dead weight at load time. Indicted by the per-route byte deltas and (mildly) mobile TBT.
4. TTFB on `force-dynamic` routes is real Supabase latency (subjects 534–613 ms; one desktop subject-detail median hit 2.65 s). With CLS 0.000 and TBT ≤ 37 ms everywhere, TTFB is **not** what's failing the LCP target — the JS/bandwidth path is.

## 5. Changes applied (each justified by a measurement)

1. **Resized `public/logo.png` 1756×1593 (611 KB) → 132×120 (18 KB)** — 3× the 40 px rendered size, pixel-identical at display size; added `width`/`height` attributes to the header `<img>`. Justified by: 597 KB transfer = 62 % of total-byte-weight on every measured cell (§4.1).
2. **`next/dynamic` (ssr:false) for `RadarProfile` (in `ResultStory`) and `CompareRadar` (in `CompareView`)** with box-identical loading placeholders. Behavior-identical by construction — both components already rendered nothing until mount. Justified by: +~100 KB first-load on `/tool` and `/compare` (§4.3).

## 6. Before / after (median of 3, same methodology)

| Route | Form | Perf before → after | LCP before → after | Bytes before → after |
|---|---|---|---|---|
| home | desktop | 97 → **100** | 1.25 s → **0.73 s** | 968 → **390 KB** |
| home | mobile | 77 → **91** | 6.46 s → **3.47 s** | 965 → **387 KB** |
| tool | desktop | 97 → **100** | 1.29 s → **0.80 s** | 1069 → **398 KB** |
| tool | mobile | 77 → **92** | 6.76 s → **3.39 s** | 1065 → **394 KB** |
| subjects | desktop | 97 → **100** | 1.25 s → **0.73 s** | 970 → **391 KB** |
| subjects | mobile | 91 → **90** | 3.55 s → 3.71 s | 966 → **388 KB** |
| subject-detail | desktop | 94 → **100** | 1.25 s → **0.78 s** | 971 → **392 KB** |
| subject-detail | mobile | 77 → **90** | 6.61 s → **3.64 s** | 968 → **389 KB** |
| compare | desktop | 97 → **100** | 1.33 s → **0.79 s** | 1075 → **398 KB** |
| compare | mobile | 77 → **91** | 6.76 s → **3.48 s** | 1071 → **394 KB** |

(TBT ≤ 30 ms and CLS 0.000 on every cell, both before and after. The `/subjects` mobile 91→90 and 3.55→3.71 s movements are within Lighthouse run-to-run jitter for a route whose TTFB is dominated by live Supabase latency.)

**Verdict vs targets after optimization:**
- Performance ≥ 90 desktop: **met, 100 on all five routes** (was 94–97).
- Performance ≥ 75 mobile: **met with margin, 90–92 on all five routes** (was 77 on four of five).
- LCP < 2.5 s: **met on desktop (0.73–0.80 s); NOT met on mobile (3.39–3.71 s)** — see Findings.

Visual/behavioral identity verified live after the changes: header logo renders at the same 44×40 CSS px (from the 132×120 asset); the dynamically-loaded compare radar renders both t1/t2 series behind its disclosure; build + typecheck clean.

## 7. Findings (target misses that the phase boundaries forbid fixing)

**Mobile LCP 3.39–3.71 s (> 2.5 s target) — structural, and out of boundary to fix.**
The post-optimization mobile LCP element is still the **first-run Walkthrough dialog paragraph** (`lcp-breakdown-insight`, home & subject-detail: `div.fixed … p.mt-4`, "Built by Ashoka…"). Lighthouse always audits a fresh profile, so the Phase 9 walkthrough auto-opens on every run; it mounts **after hydration by design** (client `useEffect` + localStorage check), so its paint time is floor-bounded by: ~390 KB of framework/app JS on emulated slow-4G (~2 s of pure bandwidth at 1.6 Mbps) + hydration on a 4×-throttled CPU. The remaining levers would all cross Phase 11b boundaries:

- Deferring, SSR-ing, or lazy-mounting the walkthrough changes a designed Phase 9 feature's behavior (and its localStorage-gated auto-open logic) — **not a performance tweak**.
- The residual byte floor is framework + catalog + fonts; cutting it means removing features.

Context that bounds the real-world impact: this LCP shape only occurs on a user's **first-ever mobile visit** (the walkthrough never auto-opens again after dismissal), and the mobile Performance score still lands at 90–92 because TBT/CLS are clean. Returning-visitor LCP is the page's own content, which desktop numbers (0.73–0.80 s) approximate. If the 2.5 s mobile first-visit LCP ever becomes a hard requirement, the decision to re-time the walkthrough belongs to a product review (Antonio + Giselle), not to this phase.

## 8. Documented, deliberately NOT applied

- **Fonts:** all loaded weights are in use (grep: `font-light` ×28 … `font-semibold` ×35, italics ×38) — dropping any would be a visual change (boundary). Fraunces stays variable-axis for both styles.
- **Full message catalog (~529 keys) serialized to the client on every page** (`NextIntlClientProvider` receives `getMessages()` whole): ~6–8 KB gzipped. A namespace allowlist would save it but adds a maintenance failure mode (every new client `useTranslations` namespace must be hand-registered). Not what's failing any target — documented, not applied.
- **`loading.tsx` / streaming for `force-dynamic` routes:** TTFB is visible in the numbers (§4.4) but is not what misses the targets; adding loading shells is a borderline visual change, so it stays out until data indicts TTFB specifically.
- **`/about` still carries the recharts chunk** (static import in `SampleShowcase`): not in the measured route list; same one-line fix applies if `/about` is ever added to the target set.
- **`background-attachment: fixed` gradients:** scroll-repaint cost, invisible to these audits (CLS 0.000, TBT ≤ 37 ms). Untouched.
