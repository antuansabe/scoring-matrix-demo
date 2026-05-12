# Changemaker Paradigm Scoring Matrix — Demo

A v0.1 demo of an instrument that measures the discursive enactment of changemaker identity in a text. Five dimensions, anchored in critical discourse analysis and Ashoka's framework.

This is a research prototype, not a production tool.

## What's in here

The demo renders four pre-scored sample texts representing the paradigm scale (Spectator → System Architect), and includes a live analyzer that scores arbitrary text via the Anthropic API.

- Stage 1 scoring model developed by Giselle Kuri, Ashoka Framework Change.
- Demo implementation by Antonio Dromundo, Ashoka ITI.

## Model documentation

The full specification of the instrument lives in `docs/`:
- `docs/SCORING_MODEL.md` — the five dimensions, weights, paradigm names, and EACH orientation logic.
- `docs/SAMPLES.md` — the four anchor texts with expert pre-scores.
- `docs/SYSTEM_PROMPT.md` — the system prompt sent to the live scorer.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Stack

Next.js 16 · TypeScript · Tailwind CSS · Recharts · @anthropic-ai/sdk · deployed on Vercel.

## License

Internal Ashoka research artifact. Not for public redistribution at this stage.
