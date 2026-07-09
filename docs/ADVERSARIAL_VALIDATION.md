# Adversarial Validation — Enacted Discourse vs. Keyword Repetition

**Date:** 2026-07-04 · **Scorer:** `claude-sonnet-4-6` via `/api/score` (production pipeline, live calls) · **Prompt/model stamp:** `sonnet-4.6+prompt-2026-06` · **Runs:** 2 per text (temperature 0) · **Origin:** Phase 8 prerequisite, from the June 15 Measures & Impact leadership feedback.

## The claim under test

The instrument's central methodological claim is that it reads **enacted discourse** — who acts, how problems are framed, whether power is shared in the structure of the language — and not **vocabulary**. If that claim is false, the score is trivially gameable: anyone could inflate a text by repeating "changemaker, empathy, systemic, agency." This test constructs the strongest cheap attack and its mirror image:

- **Text A (keyword-stuffed):** 159 words of plausible first-person NGO rhetoric containing **35 hits** of the target vocabulary (changemaker ×9, agency ×8, systemic ×6, empathy ×5, transform ×4, empower ×3) with no named actors besides an undifferentiated "I/we," no concrete action, no structure named, no perspective shift.
- **Text B (worldview-embodying, vocabulary-free):** 182 words of first-person narrative that *demonstrates* redistributed decision-making (six binding resident seats, budget authority, role inversion), names rules as the site of change (bylaws), shows another person's question visibly changing the author's approach, and holds reflexive tension — verified by grep to contain **zero** occurrences of ten target stems (changemak-, empath-, systemic, system, agency, agent, empower-, transform-, stakeholder, ecosystem).

Both texts are first-person reflective, of comparable length, written for this test. Full texts in the appendix below.

## Results

| | Text A (stuffed) | Text B (embodied) |
|---|---|---|
| **Enactment Score** | **6 / 100** | **84 / 100** |
| Paradigm | Spectator | System Architect |
| D1 Agency & Contribution | 1 | 3 |
| D2 Systemic & Architectural Framing | 0 | 3 |
| D3 Empathy Enactment | 0 | 4 |
| D4 Collaboration & Leadership | 0 | 3 |
| D5 Identity Embodiment | 0 | 4 |
| EACH Orientation | Emerging | Full EACH Alignment |
| Detected genre | structured-profile | free-form-interview |
| Run 2 (stability) | identical (6, same dims) | identical (84, same dims) |

**Separation: 78 points, in the hypothesized direction.**

## The scorer's own reasoning (verbatim excerpts, run 1)

On Text A, the model's justifications explicitly diagnose the attack rather than being fooled by it:

- **D1 = 1:** "The text repeatedly invokes 'agency of communities' and 'agency of youth' as rhetorical gestures, but no community member or young person is ever shown acting in the present tense — they are objects of empowerment…"
- **D2 = 0:** "Despite heavy use of the word 'systemic,' no concrete architectural dimension … is named or implied as a site of change."
- **D5 = 0:** "The narrator claims the changemaker label explicitly and repeatedly … but the language architecture enacts none of the paradigm's features."
- **Confidence flag (unprompted):** "Heavy use of changemaker vocabulary … without structural enactment creates a **systematic inflation risk; scores were held at floor values** because no linguistic evidence supports higher rubric levels."

On Text B, every score is anchored to enacted structure, none to vocabulary:

- **D1 = 3:** "residents hold six of eleven seats and their vote 'binds us — including on the budget,' making community members active decision-makers rather than beneficiaries."
- **D3 = 4:** "Rosa's question functions as a genuine epistemic rupture that changes the narrator's direction — not merely emotional solidarity."
- **D4 = 3:** "the former sole planner now takes minutes while a resident chairs the committee."
- **D5 = 4:** "identity is enacted through structural self-demotion and reflexive examination … ('I still catch myself reaching for the pen first')."

## Robustness checks

1. **Stability:** each text was scored twice; both runs returned identical dimension scores and Enactment Scores.
2. **Genre-weight confound eliminated:** the two texts detected different genres, which carry different weight vectors. Recomputing each dimension profile under the *other* text's weights changes nothing material: A scores 6 under either vector; B scores 84 (own) vs 82 (A's). The separation is carried by the dimension readings, not the weighting.
3. **Symmetric brevity:** both texts triggered the same word-count flags (D4/D5 below the 300/400-word thresholds), so neither side of the comparison enjoyed a length advantage.

## Verdict — honest reading

**The claim survives its adversarial test decisively.** Keyword density not only failed to inflate the score; the scorer treated it as evidence *against* the text (naming the inflation risk unprompted and holding scores at floor). Meanwhile a text with zero target vocabulary reached the top band purely on structural evidence. The instrument, as currently prompted, is measuring what it says it measures — on this pair.

**Limits, stated plainly:**
- This is **one constructed pair** (n=1 per condition), authored by the same hand for the test. It rules out the *cheapest* attack; it does not certify robustness against subtler ones (e.g., keyword-stuffed text that also fakes structural moves, or adversarial genre mimicry).
- Text B's D4/D5 scores sit above their word-count confidence thresholds' comfort zone — the scorer flagged this itself. The 78-point separation dwarfs any plausible correction.
- Valid for `sonnet-4.6+prompt-2026-06` only. A model or prompt change invalidates this evidence and requires re-running the test (the texts in the appendix make that a five-minute job).
- **Nothing was tuned.** The scoring prompt was not modified before, during, or after this test.

**Recommended follow-up** (for the framework-paper path): a blind panel of ~10 texts (real institutional material + constructed attacks), scored by the instrument and independently by human raters, to estimate agreement rather than demonstrate a single contrast.

---

## Appendix — full texts as scored

### Text A — keyword-stuffed (159 words)

> As a changemaker, I am deeply committed to systemic change and transformative empathy. My changemaker journey has always been guided by the power of agency — the agency of communities, the agency of youth, and the agency of every stakeholder in our ecosystem. Through empathy-driven leadership, we catalyze systemic transformation across multiple systems, empowering changemakers everywhere to unlock their changemaking potential. Our theory of change is rooted in empathy, agency, and systemic thinking, because we believe everyone can be a changemaker. This year we deepened our commitment to transformative, systemic empathy and scaled our changemaker mindset across all our programs. We empower the empowered and inspire the inspired, building an ecosystem of systemic changemakers who embody agency at every level. I am proud to say that empathy is at the heart of everything we do, and that our systemic approach ensures that changemaking and agency remain central to our transformative vision for a world where everyone exercises changemaker agency.

### Text B — worldview-embodying, vocabulary-free (182 words)

> For years I wrote the annual plan alone and presented it to the neighborhood as a finished thing. Then Rosa, who runs the food cooperative, asked me why the people who live with the consequences of the plan were always the last to see it. The question stung, and it was fair. We rewrote our bylaws that winter. Now the planning committee has eleven seats: six belong to residents, elected each spring, and their vote binds us — including on the budget. Marisol chairs it this year; I take the minutes. When the committee killed my after-school proposal and funded a laundry cooperative instead, I thought they were wrong. Watching it run, I have come to think the error was mine: I had been solving the problems I could see from my desk, not the ones people carry through their week. I still catch myself reaching for the pen first. The difference is that now the rules in our own house no longer let good intentions decide alone, and the neighbors have made better calls than I would have made for them.
