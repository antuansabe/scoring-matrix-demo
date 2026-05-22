# Walkthrough — Extractor + Batch Analysis Endpoint

## Files Changed

| File | Action | Description |
|---|---|---|
| [extractor.ts](file:///Users/Antonn/Desktop/Changemaker/lib/prompts/extractor.ts) | MODIFY | Filled with `EXTRACTOR_SYSTEM_PROMPT` (was empty placeholder) |
| [types.ts](file:///Users/Antonn/Desktop/Changemaker/lib/types.ts) | MODIFY | Added `HelloWorldShifts`, `ExtractionResult`, `AnalysisUsage`, `AnalysisResult` |
| [scoring.ts](file:///Users/Antonn/Desktop/Changemaker/lib/scoring.ts) | NEW | Extracted `validateAndComputeScore` + helpers from score route |
| [route.ts](file:///Users/Antonn/Desktop/Changemaker/app/api/score/route.ts) | MODIFY | Slimmed down to use `validateAndComputeScore` import (223→93 lines) |
| [route.ts](file:///Users/Antonn/Desktop/Changemaker/app/api/analyze/route.ts) | NEW | Batch analysis: scoring (Sonnet) + extraction (Haiku) in parallel |

---

## 7 Verifications

### ✅ 1. `npx tsc --noEmit` — CLEAN
No errors, no warnings. All new types and imports compile correctly.

### ✅ 2. `npm run build` — CLEAN
```
✓ Compiled successfully in 2.0s
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/analyze    ← NEW
└ ƒ /api/score      ← UNCHANGED
```

### ✅ 3. `POST /api/analyze` with test-article.txt — 200 OK
Full `AnalysisResult` returned with `score`, `extraction`, and `meta`. See full JSON below.

### ✅ 4. `POST /api/score` still works — 200 OK
Same response shape as before the refactor: `genreTag`, `wordCount`, `dimensions` (D1–D5), `enactmentScore`, `paradigmName`, `eachOrientation`, `wordCountWarnings`, `confidenceFlags`. No extra fields, no missing fields. Demo público no se rompe.

### ✅ 5. Short text (5 words) → 400
```json
{"error":"Text is too short: 5 words. Minimum 50 words required."}
```
HTTP status 400 as expected.

### ✅ 6. Quotes are verbatim substrings
Every quote in the extraction output is a literal substring of the original test-article.txt. Verified below.

### ✅ 7. Cost Estimate
From the `usage` in the response:
- **Scoring** (Sonnet 4.6): 274 input + 1,185 output tokens
- **Extraction** (Haiku 4.5): 1,341 input + 377 output tokens
- Cache creation: 2,714 tokens (first call only; subsequent calls will hit cache)

| | Input rate | Output rate | Input tokens | Output tokens | Cost |
|---|---|---|---|---|---|
| Sonnet scoring | $3/1M | $15/1M | 274 | 1,185 | $0.018 |
| Haiku extraction | $0.80/1M | $4/1M | 1,341 | 377 | $0.003 |
| **Total** | | | **1,615** | **1,562** | **~$0.02** |

> [!TIP]
> After the first call, the system prompts are cached. With cache hits (90% cheaper reads), the per-analysis cost drops further. For a batch of 100 texts, expect **~$2–3 total**.

---

## Full Extraction JSON from test-article.txt

```json
{
  "schemaVersion": 1,
  "actors": [
    "las asambleas vecinales",
    "jóvenes de quince y dieciséis años"
  ],
  "problemQuotes": [
    "esa lógica de entregables no se sostenía con los tiempos de las decisiones colectivas"
  ],
  "solutionQuotes": [
    "mi rol no es producir las soluciones, sino facilitar conversaciones entre organizaciones vecinales que históricamente no hablaban entre sí",
    "las asambleas decidieron que esos espacios necesitaban su lectura"
  ],
  "geography": [
    "Iztapalapa"
  ],
  "helloWorldShifts": {
    "shift1_contribution": [
      "Hay jóvenes de quince y dieciséis años que están coordinando hoy las mesas de seguridad de su colonia",
      "Algunas de las propuestas más útiles que he visto este año vinieron de ellos"
    ],
    "shift2_sharedExperience": [],
    "shift3_valueOfContributions": [
      "Algunas de las propuestas más útiles que he visto este año vinieron de ellos"
    ],
    "shift4_fluidCommunities": [
      "facilitar conversaciones entre organizaciones vecinales que históricamente no hablaban entre sí"
    ]
  }
}
```

### Analysis of Hello World Shifts

| Shift | Expected | Actual | Assessment |
|---|---|---|---|
| **shift1_contribution** (personas contribuyen al bien común) | Quotes reales | ✅ 2 quotes: youth coordinating security tables + "las propuestas más útiles vinieron de ellos" | Correct — shows active contribution |
| **shift2_sharedExperience** (movimiento es experiencia compartida) | Possibly empty | ✅ Empty `[]` | Correct — the text is about community organizing in Iztapalapa, not about migration as shared experience |
| **shift3_valueOfContributions** (contribuciones son valiosas) | Quotes reales | ✅ 1 quote: "las propuestas más útiles" | Correct — explicitly values contributions |
| **shift4_fluidCommunities** (comunidades fluidas como vehículo) | Quotes reales | ✅ 1 quote: connecting organizations that "historically didn't talk to each other" | Correct — fluid inter-organizational networks as change vehicle |

> [!NOTE]
> `shift2_sharedExperience` is correctly empty — this text is about vecinal community organizing, not about migration/displacement as a shared human experience. The extractor correctly didn't force a match.

### Verbatim Verification

All quotes are **exact substrings** of the original text. For example:
- `"Hay jóvenes de quince y dieciséis años que están coordinando hoy las mesas de seguridad de su colonia"` ← appears verbatim at position 522–624 of the text
- `"esa lógica de entregables no se sostenía con los tiempos de las decisiones colectivas"` ← appears verbatim at position 335–420

---

## `/api/score` Shape Comparison

Both before and after the refactor, `/api/score` returns:

```typescript
{
  genreTag: GenreTag;          // ✅ present
  wordCount: number;           // ✅ present
  dimensions: {                // ✅ present, 5 dimensions
    D1: { score, justification, quotes };
    D2: { score, justification, quotes };
    D3: { score, justification, quotes };
    D4: { score, justification, quotes };
    D5: { score, justification, quotes };
  };
  enactmentScore: number;      // ✅ present (server-recomputed)
  paradigmName: ParadigmName;  // ✅ present (server-recomputed)
  eachOrientation: string;     // ✅ present (server-recomputed)
  wordCountWarnings: string[]; // ✅ present
  confidenceFlags: string[];   // ✅ present
}
```

No fields added, no fields removed. The refactor only moved the validation logic to a shared module — the HTTP contract is identical.

---

## NO COMMIT
All changes are local, uncommitted.
