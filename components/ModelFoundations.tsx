import { Reveal } from "@/components/Reveal";

/**
 * "Model Foundations" — long-form documentation of the instrument for the
 * /about page: how the model was built, the theory behind the five
 * dimensions, the EACH Framework, and a closing statement about Ashoka.
 *
 * Server component. The terracotta (#C44536) and teal (#2A4F4F) accents are
 * applied inline per the validated visual system, since they sit outside the
 * orange-led token palette in globals.css.
 */

const TERRACOTTA = "#C44536";
const TEAL = "#2A4F4F";

const ORIGIN_PARAGRAPHS = [
  "At a board meeting two years ago, three entrepreneurs within Ashoka shared ideas that constituted a breakthrough for the EACH movement. These are the Changemaking Measures — The Changemaker Index (Diana Wells), the Changemaker Density Rate (Bob Spoer), and the Jujitsu dashboards (Claire Fallender).",
  "The Changemaker Density Rate (CMDR) faced a roadblock with Bob's death. As Ashoka looks for new leadership for this Measure, Giselle Kuri from the Framework Change team found inspiration in the work of colleague Antonio Fernández, who built the first Spanish-language dataset capable of detecting machismo in language.",
  "That insight opened a question: if machismo — a deeply embedded worldview — could be detected through language structure, why not changemaking or EACH? And if enough people used a tool to examine their own worldview, could we identify changemaker density within geographies or organizations?",
  "The model is built on the gap between surface discourse — what someone says — and enacted Discourse — what their language actually does. As Van Dijk demonstrates, paternalist mental models routinely use empowerment vocabulary. As Gee shows, this gap is only detectable through structural analysis.",
];

const DIMENSIONS = [
  {
    id: "D1",
    name: "Agency & Contribution",
    desc: "Draws on De Fina's narrative positioning theory and Van Dijk's Ideological Square to detect who is grammatically constructed as an agent — who acts, who is acted upon, and who is systematically absent from contribution.",
  },
  {
    id: "D2",
    name: "Systemic & Architectural Framing",
    desc: "Draws on Lakoff's conceptual metaphor analysis and Entman's framing functions — particularly his absence audit — to determine whether problems and solutions are located at the level of deep structures or individual programs, and what the text systematically leaves out.",
  },
  {
    id: "D3",
    name: "Empathy Enactment",
    desc: "Applies De Fina's second and third levels of narrative positioning alongside Wodak's nomination and predication strategies to distinguish empathy that is stated from empathy that is enacted — perspectives that visibly change the narrator's approach and reveal structural patterns.",
  },
  {
    id: "D4",
    name: "Collaboration & Leadership",
    desc: "Draws on Fairclough's orders of discourse and De Fina's positioning levels to test whether power is genuinely distributed across a text's relational architecture, or merely delegated downward within a fixed hierarchy.",
  },
  {
    id: "D5",
    name: "Identity Embodiment",
    desc: "The most theoretically integrated dimension — brings together De Fina's narratives-as-practice tradition, Gee's enacted Discourse, and Tajfel's social identity theory to test whether changemaker identity is performed through language structure consistently across time and context, rather than activated only when the label is explicitly invoked.",
  },
];

const LENSES = [
  {
    name: "Genre Tag",
    desc: "Every text is identified by its genre before scoring begins, so the model's interpretive ceiling for each dimension shifts accordingly — reading what the text can structurally evidence given its context of production, rather than penalizing it for what its genre structurally cannot carry.",
    badge: null as string | null,
  },
  {
    name: "Cross-Genre Coherence Flag",
    desc: "Tracks whether deeper structural patterns — the attribution of agency, the framing of problems, the positioning of self and other — hold across genre adaptations or collapse under them.",
    badge: "Batch Analysis only",
  },
];

const SKILLS = [
  {
    name: "Nurturing Conscious Empathy",
    desc: "The ability to be aware of and understand our own and others' (human and non-human) perspectives, and to use that understanding to guide one's actions to contribute to the common good.",
  },
  {
    name: "Organizing Open, Fluid & Integrated Teams",
    desc: "The ability to contribute to and thrive beyond your traditional role and team. Seek to be part of an ecosystem of teams that mobilize around new problems or opportunities.",
  },
  {
    name: "Developing Changemaking Leadership",
    desc: "The capacity, as a leader, to envision, enable, and ensure that every team member is an initiator and understands the big picture behind the purpose.",
  },
  {
    name: "Practicing Changemaking Action",
    desc: "The process of creating a novel solution to a social problem that is more effective, efficient, sustainable, or just than existing solutions — and for which the value created accrues primarily to society.",
  },
];

const SHIFTS = [
  {
    index: "Shift 1",
    name: "Empathy-based Societies",
    from: "self-interest and disconnection",
    to: "conscious empathy",
    desc: "Where most systems are built on transactions, rules, and incentives, empathy-based societies are built on the capacity to genuinely understand and be moved by another person's reality. Empathy is learnable, practicable, and scalable.",
  },
  {
    index: "Shift 2",
    name: "Lifelong Contribution",
    from: "contribution at a specific age or stage",
    to: "lifelong generative power",
    desc: "Every stage of life holds agency and unique generative power. The grandmother, the recently arrived migrant, the teenager with no credentials, the retiree with decades of knowledge — all have agency and can practice their contribution.",
  },
  {
    index: "Shift 3",
    name: "Changemaker Networks",
    from: "hierarchical, siloed structures",
    to: "collective intelligence in motion",
    desc: "No single changemaker changes a system alone. The unit of transformation is not the heroic individual — it is the network. A living web of people who trust each other, share knowledge across boundaries, and hold a common direction even without a common blueprint.",
  },
];

const TABLE_ROWS = [
  {
    narrative: "Empathy-Based Societies",
    cultivates: "The connective tissue with others",
    challenges: "Transactional, fear-based systems",
  },
  {
    narrative: "Lifelong Contribution",
    cultivates: "The will to give throughout a lifetime",
    challenges: "Age-limited, exclusionary structures",
  },
  {
    narrative: "Changemaker Networks",
    cultivates: "The collective power to shift systems",
    challenges: "The myth of the lone hero",
  },
];

/** Small reusable eyebrow — IBM Plex Mono, uppercase, terracotta. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-xs uppercase tracking-widest"
      style={{ color: TERRACOTTA }}
    >
      {children}
    </p>
  );
}

/** Small mono subsection label inside a section. */
function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
      {children}
    </p>
  );
}

export function ModelFoundations() {
  return (
    <div>
      {/* SECTION 1 — Origin */}
      <section className="border-t border-border pt-16 pb-16 lg:pt-20 lg:pb-20">
        <Reveal>
          <Eyebrow>HOW WAS THE MODEL BUILT?</Eyebrow>
          <h2 className="mt-4 max-w-3xl font-display text-2xl font-normal leading-tight text-ink sm:text-3xl lg:text-4xl">
            Built on the Gap Between What Language{" "}
            <span className="font-light italic" style={{ color: TERRACOTTA }}>
              Says
            </span>{" "}
            and What It{" "}
            <span className="font-light italic" style={{ color: TERRACOTTA }}>
              Does
            </span>
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <div className="mt-6 max-w-[62ch] space-y-5">
            {ORIGIN_PARAGRAPHS.map((para, i) => (
              <p
                key={i}
                className="font-sans text-base leading-[1.75] text-ink"
              >
                {para}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* SECTION 2 — Theory */}
      <section className="border-t border-border pt-16 pb-16 lg:pt-20 lg:pb-20">
        <Reveal>
          <Eyebrow>THE THEORY BEHIND THE MODEL</Eyebrow>
          <h2 className="mt-4 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl lg:text-4xl">
            Five Dimensions. <span className="font-light italic">Two Lenses.</span>
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mt-6 max-w-[62ch] font-sans text-base leading-[1.75] text-muted">
            The five dimensions were designed at the intersection of external
            sociolinguistic scholarship and the EACH Framework developed by
            Ashoka over decades of learning from changemakers.
          </p>
        </Reveal>

        {/* Five dimension cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DIMENSIONS.map((d, i) => (
            <Reveal key={d.id} delay={i * 80} className="h-full">
              <div className="premium-card flex h-full flex-col p-6">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: TERRACOTTA }}
                  >
                    {d.id}
                  </span>
                  <h3 className="font-display text-lg font-medium leading-snug text-ink">
                    {d.name}
                  </h3>
                </div>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                  {d.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Contextual lenses */}
        <Reveal className="mt-14">
          <SubLabel>CONTEXTUAL LENSES</SubLabel>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {LENSES.map((lens, i) => (
            <Reveal key={lens.name} delay={i * 90} className="h-full">
              <div
                className="premium-card flex h-full flex-col border-l-[3px] p-6"
                style={{ borderLeftColor: TEAL }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-lg font-medium leading-snug text-ink">
                    {lens.name}
                  </h3>
                  {lens.badge && (
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-white"
                      style={{ backgroundColor: TEAL }}
                    >
                      {lens.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                  {lens.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SECTION 3 — EACH Framework */}
      <section className="border-t border-border pt-16 pb-16 lg:pt-20 lg:pb-20">
        <Reveal>
          <Eyebrow>THE EACH FRAMEWORK</Eyebrow>
          <h2 className="mt-4 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl lg:text-4xl">
            Everyone a <span className="font-light italic">Changemaker</span>
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mt-6 max-w-[62ch] font-sans text-base leading-[1.75] text-muted">
            The Everyone a Changemaker (EACH) Framework is built on the insight
            that lasting systems change requires both individual and collective
            transformation. At the personal level, four core skills. At the
            societal level, three large-scale shifts in decision-making.
          </p>
        </Reveal>

        {/* The four skills */}
        <Reveal className="mt-12">
          <SubLabel>THE FOUR SKILLS</SubLabel>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SKILLS.map((skill, i) => (
            <Reveal key={skill.name} delay={i * 80} className="h-full">
              <div className="premium-card flex h-full flex-col p-6">
                <h3 className="font-display text-lg font-medium leading-snug text-ink">
                  {skill.name}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                  {skill.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* The three societal shifts */}
        <Reveal className="mt-14">
          <SubLabel>THE THREE SOCIETAL SHIFTS</SubLabel>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {SHIFTS.map((shift, i) => (
            <Reveal key={shift.name} delay={i * 80} className="h-full">
              <div className="premium-card flex h-full flex-col p-6">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-display text-2xl leading-none"
                    style={{ color: TERRACOTTA }}
                  >
                    &rarr;
                  </span>
                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                      {shift.index}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-medium leading-snug text-ink">
                      {shift.name}
                    </h3>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 font-mono text-[0.7rem] uppercase tracking-wider">
                  <p className="text-muted">
                    From: {shift.from}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span style={{ color: TERRACOTTA }}>&rarr;</span>
                    <span className="font-semibold text-ink">To: {shift.to}</span>
                  </p>
                </div>
                <p className="mt-4 font-sans text-sm leading-relaxed text-muted">
                  {shift.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Summary table */}
        <Reveal className="mt-12">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr style={{ backgroundColor: TEAL }}>
                  <th className="border border-border p-3 text-left font-semibold text-white">
                    Narrative
                  </th>
                  <th className="border border-border p-3 text-left font-semibold text-white">
                    What it cultivates
                  </th>
                  <th className="border border-border p-3 text-left font-semibold text-white">
                    What it challenges
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr
                    key={row.narrative}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F4EFE3",
                    }}
                  >
                    <td className="border border-border p-3 font-medium text-ink">
                      {row.narrative}
                    </td>
                    <td className="border border-border p-3 text-muted">
                      {row.cultivates}
                    </td>
                    <td className="border border-border p-3 text-muted">
                      {row.challenges}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* SECTION 4 — About Ashoka */}
      <section className="border-t border-border pt-16 pb-8 lg:pt-20">
        <Reveal>
          <Eyebrow>ABOUT ASHOKA</Eyebrow>
        </Reveal>
        <Reveal delay={90}>
          <div className="mt-6 max-w-3xl space-y-6">
            <p className="font-sans text-lg leading-relaxed text-ink">
              Ashoka exists to enable the conditions so that people can step
              into their power to give. For more than 45 years we have been
              learning from systems-changing social entrepreneurs to understand
              how the decisions that people make change the rules of society.
            </p>
            <p className="font-display text-xl font-light italic leading-relaxed text-ink sm:text-2xl">
              Our bet is that changemakers can ensure better futures.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
