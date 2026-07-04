/**
 * Phase 9 — seeds the DEMO subjects (one fictional JJ Partner + one fictional
 * NGL) with dated entries showing believable movement, so the full
 * longitudinal story can be demonstrated with zero live-API dependency.
 *
 * Run:  npx tsx scripts/seed-demo.ts
 *
 * Idempotent: deletes any existing DEMO-flagged subjects first (entries and
 * analyses cascade), then inserts fresh. All rows are flagged
 * ashoka_internal_id = 'DEMO' and every screen that shows them renders an
 * unmissable DEMO banner.
 *
 * Provenance, honestly: the texts, scores, and feedback cards below are
 * HAND-CURATED illustrations, not model output — that is why model_version
 * is stamped "demo-seed (hand-curated)" (identical across entries, so the
 * model-mismatch guardrail correctly stays quiet). Dimension scores are
 * hand-chosen; the Enactment Scores are computed from them with the real
 * formula (calculateEnactmentScore), so every number on screen is
 * internally consistent with the instrument.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local before the db client is imported (tsx doesn't auto-load it).
for (const line of readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

import { calculateEnactmentScore, resolveEACHOrientation } from "@/lib/paradigm";
import { DEMO_FLAG, DEMO_ORG_ID, DEMO_NGL_ID } from "@/lib/demo";
import type { DimensionKey, DimensionScore, FeedbackResult, GenreTag } from "@/lib/types";
import type { MaterialGenre } from "@/lib/db/types";

const MODEL_VERSION_DEMO = "demo-seed (hand-curated)";

type DemoEntry = {
  subjectId: string;
  entryDate: string;
  materialGenre: MaterialGenre;
  genreTag: GenreTag; // drives weights + stored as lens_a_tag
  dims: [number, number, number, number, number];
  ashokanName: string;
  contextualNotes: string;
  materialText: string;
  feedback: FeedbackResult;
};

function toDims(d: [number, number, number, number, number]): Record<DimensionKey, DimensionScore> {
  const dim = (score: number): DimensionScore => ({ score, justification: "", quotes: [] });
  return { D1: dim(d[0]), D2: dim(d[1]), D3: dim(d[2]), D4: dim(d[3]), D5: dim(d[4]) };
}

// ---------------------------------------------------------------------------
// Fictional material. Fundación Delta and Alex Rivera do not exist.
// ---------------------------------------------------------------------------

const ORG_T1_TEXT =
  "Fundación Delta's youth program completed another successful year. Our staff delivered forty-two workshops on leadership skills to young people across three neighborhoods, reaching over six hundred beneficiaries. Attendance remained high throughout the year, and exit surveys show strong satisfaction with the training materials our pedagogical team developed. We also expanded our mentorship offering: each participant was assigned a trained adult mentor who guided them through a structured curriculum. We are proud of what our team has achieved and grateful to the donors who make this work possible. Next year we plan to bring the same proven program to two additional neighborhoods, so that more young people can benefit from the tools and knowledge they need to succeed.";

const ORG_T1_FEEDBACK: FeedbackResult = {
  schemaVersion: "1.0",
  summary: {
    keyMessages:
      "The text presents youth development as a service the foundation delivers: workshops designed by staff, knowledge transferred to young people, success measured in attendance and satisfaction. Expansion of the same model is framed as the natural next step.",
    whoActs:
      "The foundation and its staff hold every active verb — delivering, developing, assigning, expanding. Young people appear as beneficiaries who attend, receive, and are guided; no young person initiates or decides anything in this account.",
    theProblem:
      "The problem is implicit: young people lack tools and knowledge, and the foundation supplies them. Nothing in the text asks why those gaps exist or what conditions produce them.",
    theSolution:
      "More of the same program in more places. The solution is programmatic and one-directional — it changes what young people know, not what they get to decide.",
  },
  feedback: {
    whatWorksWell: [
      {
        observation:
          "The text is concrete and accountable about scale and activity — numbers, neighborhoods, and a clear account of what was actually done. That specificity is a foundation later readings can build on.",
        textAnchor: "forty-two workshops on leadership skills to young people across three neighborhoods",
      },
      {
        observation:
          "Mentorship is described as a sustained relationship rather than a one-off event, which gives the program a relational backbone even inside a top-down structure.",
        textAnchor: "each participant was assigned a trained adult mentor",
      },
    ],
    howToStrengthen: [
      {
        gap: "Young people never act in this text — they attend, receive, and are guided.",
        whyItMatters:
          "When the people a program serves are always the objects of its sentences, the language quietly teaches everyone — staff, donors, the young people themselves — that change is something done to them.",
        reframe:
          "Find one real moment where a young person decided, changed, or led something — and let them be the subject of that sentence.",
      },
      {
        gap: "Success is measured entirely by delivery: attendance, satisfaction, reach.",
        whyItMatters:
          "Delivery metrics show the program ran; they cannot show whether anything shifted in who gets to act or decide.",
        reframe:
          "Add one indicator the young people themselves would recognize as success — something they now do or decide that they didn't before.",
      },
    ],
  },
  question:
    "If the young people in this program wrote next year's report themselves, what would they say changed — and would it match what this one says?",
  crossGenre: null,
};

const ORG_T2_TEXT =
  "Something is changing at Fundación Delta. This spring we invited twelve program alumni to review our curriculum, and their feedback was direct: the workshops taught skills, they told us, but rarely asked what young people wanted to build with them. So we are experimenting. Two pilot neighborhoods now run monthly assemblies where participants set part of the agenda, and our team is learning to facilitate rather than instruct. It is slower, and sometimes messier, than the old model. We still design most of the program ourselves, and our reporting still counts workshops and attendance, because that is what our funding requires. But we have started asking a different question in our planning meetings: not only what young people need from us, but what they are ready to lead without us.";

const ORG_T2_FEEDBACK: FeedbackResult = {
  schemaVersion: "1.0",
  summary: {
    keyMessages:
      "The text narrates a transition: alumni feedback has unsettled the delivery model, and the foundation is experimenting with shared agenda-setting while honestly naming what hasn't changed — most design and all reporting still sit with staff.",
    whoActs:
      "Agency is starting to move. Alumni review and speak; participants set part of an agenda; the foundation invites, experiments, and learns. Staff still hold most decisions, and the text says so.",
    theProblem:
      "The problem has been partially relocated — from young people's skill gaps to the program's own habit of not asking. Funding structures are named as a constraint, a first gesture toward the system around the program.",
    theSolution:
      "Pilots and shared agendas — a real structural experiment, still bounded. The closing question ('what they are ready to lead without us') points beyond the current model without yet acting on it.",
  },
  feedback: {
    whatWorksWell: [
      {
        observation:
          "Feedback from young people visibly changed what the organization does — the assemblies exist because alumni spoke. That is empathy with consequences, not sentiment.",
        textAnchor: "their feedback was direct",
      },
      {
        observation:
          "The text is honest about its own limits instead of performing transformation — it names what still hasn't changed, which makes the change it does claim believable.",
        textAnchor: "We still design most of the program ourselves",
      },
    ],
    howToStrengthen: [
      {
        gap: "Participation is granted in fragments — part of an agenda, two pilots — while the frame around it stays fully staff-owned.",
        whyItMatters:
          "Partial invitations are a real step, but the language of 'we invited, we pilot, we allow' keeps the organization as the gatekeeper of every opening.",
        reframe:
          "Name one decision — budget, hiring, program design — where young people's choice is binding, not advisory, and say it plainly.",
      },
      {
        gap: "The funding constraint is mentioned and then accepted as fixed.",
        whyItMatters:
          "Naming a structure without contesting it can quietly excuse the current model — the report counts what funders require, and so the funders' frame remains the real author.",
        reframe:
          "One sentence about what the foundation is doing to renegotiate what it reports — even a small step — would turn the constraint from an excuse into a site of work.",
      },
    ],
  },
  question:
    "When the assemblies disagree with the staff's plan, whose view prevails — and what would it take for that answer to change?",
  crossGenre: null,
};

const ORG_T3_TEXT =
  "Interviewer: What has changed at Fundación Delta this year? Director: The honest answer is that we changed the rules, not just the activities. Since June, three of the nine seats on our program committee belong to youth delegates elected by the assemblies, and that committee — not the staff — approves the annual plan and a quarter of the program budget. We rewrote our reporting so we now track decisions made by young people, not just workshops attended. Interviewer: What has that been like for your team? Director: Humbling, honestly. The delegates rejected our flagship workshop series in October — the one we were proudest of — and redirected those funds to a project we would never have designed. They were right. We are learning that our expertise is one voice at the table, and the neighborhoods hold knowledge we simply don't have. We used to ask how to prepare young people for the future. They have taught us to ask who decides what that future looks like.";

const ORG_T3_FEEDBACK: FeedbackResult = {
  schemaVersion: "1.0",
  summary: {
    keyMessages:
      "The text claims structural change and backs it with mechanisms: elected youth seats, binding approval over plan and budget, reporting rebuilt around decisions rather than attendance. The change is presented as governance, not programming.",
    whoActs:
      "Young people act with authority — they are elected, they approve, they reject, they redirect funds. The staff's agency is redefined as one voice among several, and the text shows that redefinition costing something real.",
    theProblem:
      "The problem is now located in who holds decision-making power, not in young people's skill gaps. The October rejection scene makes the shift concrete instead of rhetorical.",
    theSolution:
      "Shared governance with teeth: seats, budget authority, and metrics that follow decisions. The closing reframe — who decides what the future looks like — states the architectural question directly.",
  },
  feedback: {
    whatWorksWell: [
      {
        observation:
          "Power-sharing is described as a mechanism, not a value — seats, votes, and budget authority that bind the organization even when it disagrees.",
        textAnchor: "that committee — not the staff — approves the annual plan",
      },
      {
        observation:
          "The text lets the organization lose an argument on the record and calls the other side right — reflexivity enacted, not claimed.",
        textAnchor: "They were right.",
      },
    ],
    howToStrengthen: [
      {
        gap: "The new architecture covers a quarter of the budget and a third of the seats; the majority of power still sits where it always did.",
        whyItMatters:
          "The proportions are honest, but the text doesn't yet say whether they are a floor or a ceiling — and that difference is the whole trajectory.",
        reframe:
          "Say where this goes next: is the committee's share designed to grow, and who decides that?",
      },
      {
        gap: "The story stays inside Fundación Delta — nothing yet about whether this model challenges how peer organizations or funders work.",
        whyItMatters:
          "A governance change that stays private improves one institution; naming the norm it breaks invites a field to move.",
        reframe:
          "One sentence positioning this as a challenge to the sector's default — 'programs designed for youth, decided by adults' — would extend the change beyond one organization.",
      },
    ],
  },
  question:
    "Now that young people can reject your best idea, what does the organization know about its own expertise that it couldn't have learned any other way?",
  crossGenre: null,
};

const NGL_T1_TEXT =
  "I joined Fundación Delta's program two years ago because my neighborhood needed something and I didn't know how to help. The workshops taught me to speak in public and to organize my ideas, and I'm grateful for that. Last month I volunteered to coordinate the cleanup of the river path — I made the schedule, called the neighbors, and we did it in two weekends. People said it should be the municipality's job, and maybe they're right, but somebody had to start. I still feel like I'm learning more than leading. The mentors say I have potential, and I want to use it for my community, I just don't always know where to begin.";

const NGL_T1_FEEDBACK: FeedbackResult = {
  schemaVersion: "1.0",
  summary: {
    keyMessages:
      "A first-person account of stepping into action: skills received from a program, then a self-organized cleanup. Agency is real but framed as volunteering inside someone else's structure, with the author's confidence still borrowed from mentors.",
    whoActs:
      "The author acts — coordinates, schedules, convenes neighbors — and that matters. The program and mentors still author the frame: they teach, they assess potential, they name what the author is.",
    theProblem:
      "Problems are local and concrete (the river path), with one passing structural glance — 'it should be the municipality's job' — noticed and then set aside.",
    theSolution:
      "Personal initiative filling institutional gaps. Effective and admirable, and still one-off: nothing yet about changing why the gap exists.",
  },
  feedback: {
    whatWorksWell: [
      {
        observation:
          "The cleanup passage is genuine enacted agency — the author is the subject of every verb that matters in it.",
        textAnchor: "I made the schedule, called the neighbors, and we did it in two weekends",
      },
      {
        observation:
          "The text notices a structural question on its own — whose job this actually is — even if it doesn't pursue it yet.",
        textAnchor: "People said it should be the municipality's job",
      },
    ],
    howToStrengthen: [
      {
        gap: "The author's self-description defers to others' judgment — mentors say there is potential; the text waits for permission.",
        whyItMatters:
          "When authority over who you are sits with someone else, initiative stays borrowed — each action needs an external endorsement to count.",
        reframe:
          "Describe the cleanup as evidence, not exception: what does having done it say about what you can already decide without anyone's sign-off?",
      },
      {
        gap: "The municipality question is raised and dropped in the same sentence.",
        whyItMatters:
          "That dropped thread is exactly where personal action would meet structural change — following it is the difference between filling gaps and closing them.",
        reframe:
          "One sentence about what happens next with the municipality — a petition, a meeting, a question at the town hall — would carry the action to the structure behind it.",
      },
    ],
  },
  question:
    "If nobody ever told you that you had potential, what in your own record would tell you the same thing?",
  crossGenre: null,
};

const NGL_T2_TEXT =
  "Update from the river-path crew: we're not just cleaning anymore. After the third weekend, I asked the obvious question out loud — why does this keep falling on neighbors? Twelve of us went to the municipal council session with photos and a maintenance proposal. They said there was no budget line for the path. So we found the budget rules, and it turns out residents can petition to co-fund maintenance if the district matches it. We collected 214 signatures. Now Doña Carmen manages the schedule, Luis handles the council paperwork, and I mostly connect people who don't yet know they're on the same team. The path is cleaner, but honestly that's the smallest part. We learned that the rules have doors in them, if you go looking. Next assembly is Thursday — bring a neighbor.";

const NGL_T2_FEEDBACK: FeedbackResult = {
  schemaVersion: "1.0",
  summary: {
    keyMessages:
      "The text narrates a shift from doing the work to changing who is responsible for it: a cleanup crew becomes a petition movement that finds and uses a co-funding rule. The author's role has changed from coordinator to connector, and the text says the clean path is the smallest part.",
    whoActs:
      "Many people act, by name — Doña Carmen manages, Luis handles paperwork, twelve neighbors petition, 214 sign. The author distributes the verbs deliberately and keeps the connective role for themselves.",
    theProblem:
      "The problem has moved from a dirty path to the structure behind it — why maintenance falls on neighbors, and what the budget rules allow. The text treats rules as material you can work with, not weather.",
    theSolution:
      "Collective and structural: a petition mechanism, matched funding, distributed roles, and an open invitation. The solution recruits rather than delivers.",
  },
  feedback: {
    whatWorksWell: [
      {
        observation:
          "Leadership is distributed by name and function, not claimed — the author's own role has shrunk on purpose and the work has grown because of it.",
        textAnchor: "I mostly connect people who don't yet know they're on the same team",
      },
      {
        observation:
          "The text finds agency inside the rules themselves — the discovery that structures have usable openings is the changemaker insight, stated in the author's own image.",
        textAnchor: "the rules have doors in them, if you go looking",
      },
    ],
    howToStrengthen: [
      {
        gap: "The council appears only as a gate that said no and then a rule that said maybe.",
        whyItMatters:
          "If the relationship with the institution stays adversarial-transactional, every future improvement will need another petition; an ally inside changes the cost of the next door.",
        reframe:
          "Name one person or office inside the council the crew is building an ongoing relationship with — not for this petition, but for the next ten.",
      },
      {
        gap: "The invitation is warm but unstructured — 'bring a neighbor' recruits attendance, not roles.",
        whyItMatters:
          "Movements outlast moments when newcomers land in responsibilities, not audiences.",
        reframe:
          "Pair the invitation with an opening: name two roles the assembly needs filled Thursday, so a first-timer can leave owning something.",
      },
    ],
  },
  question:
    "You found a door in the budget rules — what would it take for the next crew, in some other neighborhood, to find it in half the time because of you?",
  crossGenre: null,
};

// ---------------------------------------------------------------------------

const ENTRIES: DemoEntry[] = [
  {
    subjectId: DEMO_ORG_ID,
    entryDate: "2026-02-10",
    materialGenre: "report",
    genreTag: "institutional-report",
    dims: [1, 1, 1, 2, 1],
    ashokanName: "Demo Seed",
    contextualNotes: "DEMO · t1 — annual report excerpt, before the governance redesign. Fictional.",
    materialText: ORG_T1_TEXT,
    feedback: ORG_T1_FEEDBACK,
  },
  {
    subjectId: DEMO_ORG_ID,
    entryDate: "2026-04-22",
    materialGenre: "website",
    genreTag: "institutional-report",
    dims: [2, 2, 2, 2, 1],
    ashokanName: "Demo Seed",
    contextualNotes: "DEMO · t2 — website update during the participation pilots. Fictional.",
    materialText: ORG_T2_TEXT,
    feedback: ORG_T2_FEEDBACK,
  },
  {
    subjectId: DEMO_ORG_ID,
    entryDate: "2026-06-30",
    materialGenre: "interview",
    genreTag: "free-form-interview",
    dims: [3, 3, 2, 3, 2],
    ashokanName: "Demo Seed",
    contextualNotes: "DEMO · t3 — director interview after youth delegates joined the program committee. Fictional.",
    materialText: ORG_T3_TEXT,
    feedback: ORG_T3_FEEDBACK,
  },
  {
    subjectId: DEMO_NGL_ID,
    entryDate: "2026-03-05",
    materialGenre: "interview",
    genreTag: "free-form-interview",
    dims: [2, 1, 2, 2, 2],
    ashokanName: "Demo Seed",
    contextualNotes: "DEMO · t1 — program interview, early river-path work. Fictional.",
    materialText: NGL_T1_TEXT,
    feedback: NGL_T1_FEEDBACK,
  },
  {
    subjectId: DEMO_NGL_ID,
    entryDate: "2026-06-18",
    materialGenre: "social",
    genreTag: "social-media-post",
    dims: [3, 2, 3, 2, 2],
    ashokanName: "Demo Seed",
    contextualNotes: "DEMO · t2 — public post after the council petition. Fictional.",
    materialText: NGL_T2_TEXT,
    feedback: NGL_T2_FEEDBACK,
  },
];

async function main() {
  const { getSupabaseClient } = await import("@/lib/db/client");
  const client = getSupabaseClient();

  // Idempotent: remove any prior demo seed (entries + analyses cascade).
  const { error: delErr } = await client.from("subjects").delete().eq("ashoka_internal_id", DEMO_FLAG);
  if (delErr) throw delErr;

  const { error: orgErr } = await client.from("subjects").insert({
    id: DEMO_ORG_ID,
    ashoka_internal_id: DEMO_FLAG,
    name: "DEMO — Fundación Delta (fictional)",
    type: "jj_partner",
    parent_org_id: null,
    created_by: "seed-demo",
  });
  if (orgErr) throw orgErr;

  const { error: nglErr } = await client.from("subjects").insert({
    id: DEMO_NGL_ID,
    ashoka_internal_id: DEMO_FLAG,
    name: "DEMO — Alex Rivera (fictional)",
    type: "ngl",
    parent_org_id: DEMO_ORG_ID,
    created_by: "seed-demo",
  });
  if (nglErr) throw nglErr;

  for (const e of ENTRIES) {
    const dims = toDims(e.dims);
    const enactment = calculateEnactmentScore(dims, e.genreTag);
    const each = resolveEACHOrientation(dims);

    const { data: entry, error: entryErr } = await client
      .from("entries")
      .insert({
        subject_id: e.subjectId,
        entry_date: e.entryDate,
        material_text: e.materialText,
        genre: e.materialGenre,
        ashokan_name: e.ashokanName,
        contextual_notes: e.contextualNotes,
      })
      .select()
      .single();
    if (entryErr) throw entryErr;

    const { error: analysisErr } = await client.from("analyses").insert({
      entry_id: entry.id,
      enactment_score: enactment,
      d1: e.dims[0],
      d2: e.dims[1],
      d3: e.dims[2],
      d4: e.dims[3],
      d5: e.dims[4],
      each_orientation: each,
      lens_a_tag: e.genreTag,
      feedback_card: e.feedback,
      model_version: MODEL_VERSION_DEMO,
    });
    if (analysisErr) throw analysisErr;

    console.log(`seeded ${e.subjectId === DEMO_ORG_ID ? "org" : "ngl"} ${e.entryDate} → enactment ${enactment} · ${each}`);
  }

  console.log("Demo seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
