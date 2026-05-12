# Scoring Matrix Demo — Project Context

## What this is

An interactive demo of the **Changemaker Paradigm Scoring Matrix**, a language analysis instrument developed by Ashoka (Framework Change department, led by Giselle Kuri) to measure the degree to which the architecture of a text is consistent with the changemaker paradigm.

The demo is being built by Antonio Dromundo (Ashoka ITI / Drupal builder) for a working session on Wednesday with an academic expert in rhetorical analysis. Audience: rigorous, doctorate-holding, will challenge the methodology.

**This is a v0.1 demo.** It must be deployable, beautiful, and intellectually honest. It is not a production tool — Density Rate (CMDR), authentication, and persistence are explicitly out of scope.

## What the demo must do

1. Show 4 pre-scored sample texts that span the paradigm scale (Spectator → System Architect). User clicks between them and sees the model's reading of each.
2. For each sample, render: Enactment Score (0–100), Paradigm Name, Radar Profile across 5 dimensions, EACH Orientation, and per-dimension justification quotes from the text.
3. Allow a user to paste their own text and get it scored live by Claude through a server route (API key never leaves the server).
4. Communicate the architecture of the model — not just its outputs — so an expert reviewing it understands what is being measured and why.

## The model in one minute

Read `docs/SCORING_MODEL.md` for the full spec. Quick summary:

- **5 dimensions**, each scored 0–4: D1 Agency & Contribution, D2 Systemic & Architectural Framing, D3 Empathy Quality, D4 Collaboration & Leadership, D5 Identity Embodiment.
- **Weights**: D1 25% · D2 25% · D3 20% · D4 20% · D5 10%. Adjusted by genre (see `docs/SCORING_MODEL.md`).
- **Enactment Score** = (Σ Dn × wn) × 25 → range 0–100.
- **Paradigm names** by score band: 0–19 Spectator · 20–39 Sympathizer · 40–59 Contributor · 60–79 Changemaker · 80–100 System Architect.
- **EACH Orientation** is derived from which dimensions dominate the profile (Youth in Charge, Interconnected Teams, Empathy-based Societies, or Full Alignment).
- **Genre Tag** modulates weights and minimum word counts.
- **Cross-Genre Coherence Flag** (HIGH/MEDIUM/LOW) is out of scope for v0.1 since we only score one text at a time.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Recharts** for the radar chart
- **@anthropic-ai/sdk** for the live scoring (server-side only, in API route)
- **Vercel** for deploy
- No database. No auth. No user state persistence.

## Visual system (non-negotiable)

This visual system was validated in the v0.1 sketch with Giselle. Do not redesign.

### Palette

```
--bg:        #F4EFE3   /* warm cream background */
--surface:   #FAF7F0   /* card / panel surface */
--ink:       #1F1B16   /* primary text */
--muted:     #6B6358   /* secondary text */
--border:    #D9D2C2   /* soft warm border */
--accent:    #C44536   /* terracotta accent, rules, key marks */
--accent-2:  #2A4F4F   /* deep teal, secondary accent */
```

### Paradigm colors (used for sample tags and per-paradigm accents)

```
0 Spectator        #7A6B3E   olive
1 Sympathizer      #B5341E   rust
2 Contributor      #7A6B3E   olive (lighter use)
3 Changemaker      #3D5A6C   slate
4 System Architect #2A5A3E   forest
```

### Typography

Load from Google Fonts in `app/layout.tsx`:

- **Fraunces** — display, serif. Weights 300, 400, 500, 600. Use italics aggressively for conceptual emphasis. Headlines should mix a regular weight with italic word(s) inside the same line.
- **IBM Plex Sans** — body. Weights 300, 400, 500, 600.
- **IBM Plex Mono** — eyebrows, tags, numeric labels, technical metadata. Always uppercase, tracking-widest when used as a label.

### Layout rules

- Page background gets two very subtle radial gradients: terracotta from top-left, teal from bottom-right, both at ~4–5% opacity. Like grain, not like color.
- Cards (Surface): cream with 1px warm border, generous padding (24–32px), no drop shadows or rounded corners larger than 6px. The aesthetic is editorial / academic — closer to a printed journal than a SaaS dashboard.
- Use a horizontal rule made from a 1px line, often with an em-dash or short hyphen as section anchor.
- Numbers (scores) should be large and serif. Labels should be small mono uppercase.
- Never use emoji as UI. Use Lucide icons sparingly if at all.

### Anti-patterns (do not do)

- Drop shadows on cards. Heavy gradients on backgrounds. Rainbow accent palettes. Material Design or Bootstrap defaults. Large rounded corners. Stock SaaS hero sections. Emoji. Animated splashes. Light/dark mode toggle (not needed for v0.1).

## File structure

```
scoring-matrix-demo/
├── CLAUDE.md
├── docs/
│   ├── SCORING_MODEL.md
│   ├── SAMPLES.md
│   └── SYSTEM_PROMPT.md
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       └── score/
│           └── route.ts
├── components/
│   ├── Header.tsx
│   ├── SampleSwitcher.tsx
│   ├── TextExcerpt.tsx
│   ├── ScoreCard.tsx
│   ├── RadarProfile.tsx
│   ├── ScoreBreakdown.tsx
│   ├── EACHOrientation.tsx
│   ├── JustificationQuotes.tsx
│   └── LiveAnalyzer.tsx
├── lib/
│   ├── types.ts
│   ├── paradigm.ts
│   ├── samples.ts
│   └── prompt.ts
├── public/
├── .env.local.example
└── package.json
```

## Coding conventions

- TypeScript strict. No `any` unless commented why.
- React Server Components by default. Add `"use client"` only where state, effects, or browser APIs require it (the radar, the analyzer textarea, the sample switcher).
- One component per file. Components named the same as the file. Co-locate small types if not shared.
- No `useEffect` for data fetching — use server components or async route handlers.
- Styling: Tailwind utilities, with CSS variables from `globals.css` for tokens. No styled-components, no CSS-in-JS.
- Keep components dumb: data flows down from `page.tsx` (server) into client islands.
- Naming: paradigm names are `Spectator | Sympathizer | Contributor | Changemaker | System Architect` (capitalized, no abbreviations).

## What I want from you (Claude Code)

- Be conservative. Read existing files before editing. Don't reshape architecture unprompted.
- Pause for review after each prompt's deliverable. Tell me what you did, what to verify, and what you'd do next — but wait for the next prompt before proceeding.
- If a decision isn't covered here or in `docs/`, ask. Don't invent.
- Don't add libraries beyond what's in the stack list unless I approve.
- Use the visual system. Do not reach for shadcn defaults.

## Out of scope for v0.1

- Density Rate (CMDR) aggregation across multiple respondents
- User authentication or account creation
- Persistence (database, cookies, localStorage for state)
- Cross-genre coherence (requires multiple texts per author)
- Internationalization beyond what samples contain
- Mobile-first detailed polish (responsive, but desktop is primary)
- Analytics
