import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { FEATURES } from "@/lib/flags";
import type { DimensionKey } from "@/lib/types";

/**
 * "Model Foundations" — long-form documentation of the instrument for the
 * /about page: how the model was built, the theory behind the five
 * dimensions, the EACH Framework, and a closing statement about Ashoka.
 *
 * Server component. All copy lives in the `foundations.*` catalog namespace
 * (dimension names come from `dimensions.*` — terms of art, English in both
 * locales). The local arrays below are key manifests: ids, order, and color
 * only. The terracotta (#C44536) and teal (#2A4F4F) accents are applied
 * inline per the validated visual system, since they sit outside the
 * orange-led token palette in globals.css.
 */

const TERRACOTTA = "#C44536";
const TEAL = "#2A4F4F";

const DIMENSION_KEYS: DimensionKey[] = ["D1", "D2", "D3", "D4", "D5"];

const LENS_KEYS = [
  { id: "genreTag", hasBadge: false },
  // The badge ("Batch Analysis only") only makes sense while /batch exists.
  { id: "coherence", hasBadge: FEATURES.batch },
] as const;

const SKILL_KEYS = ["s1", "s2", "s3", "s4"] as const;
const SHIFT_KEYS = ["s1", "s2", "s3"] as const;
const TABLE_ROW_KEYS = ["r1", "r2", "r3"] as const;

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
  const t = useTranslations("foundations");
  const td = useTranslations("dimensions");

  return (
    <div>
      {/* SECTION 1 — Origin */}
      <section className="border-t border-border pt-16 pb-16 lg:pt-20 lg:pb-20">
        <Reveal>
          <Eyebrow>{t("origin.eyebrow")}</Eyebrow>
          <h2 className="mt-4 max-w-3xl font-display text-2xl font-normal leading-tight text-ink sm:text-3xl lg:text-4xl">
            {t("origin.titlePart1")}
            <span className="font-light italic" style={{ color: TERRACOTTA }}>
              {t("origin.titleSays")}
            </span>
            {t("origin.titlePart2")}
            <span className="font-light italic" style={{ color: TERRACOTTA }}>
              {t("origin.titleDoes")}
            </span>
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <div className="mt-6 max-w-[62ch] space-y-5">
            {(["p1", "p2", "p3", "p4"] as const).map((p) => (
              <p
                key={p}
                className="font-sans text-base leading-[1.75] text-ink"
              >
                {t(`origin.${p}`)}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* SECTION 2 — Theory */}
      <section className="border-t border-border pt-16 pb-16 lg:pt-20 lg:pb-20">
        <Reveal>
          <Eyebrow>{t("theory.eyebrow")}</Eyebrow>
          <h2 className="mt-4 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl lg:text-4xl">
            {t("theory.titlePart1")}
            <span className="font-light italic">{t("theory.titlePart2")}</span>
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mt-6 max-w-[62ch] font-sans text-base leading-[1.75] text-muted">
            {t("theory.intro")}
          </p>
        </Reveal>

        {/* Five dimension cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DIMENSION_KEYS.map((key, i) => (
            <Reveal key={key} delay={i * 80} className="h-full">
              <div className="premium-card flex h-full flex-col p-6">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: TERRACOTTA }}
                  >
                    {key}
                  </span>
                  <h3 className="font-display text-lg font-medium leading-snug text-ink">
                    {td(`${key}.full`)}
                  </h3>
                </div>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                  {t(`dims.${key}`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Contextual lenses */}
        <Reveal className="mt-14">
          <SubLabel>{t("lensesLabel")}</SubLabel>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {LENS_KEYS.map((lens, i) => (
            <Reveal key={lens.id} delay={i * 90} className="h-full">
              <div
                className="premium-card flex h-full flex-col border-l-[3px] p-6"
                style={{ borderLeftColor: TEAL }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-lg font-medium leading-snug text-ink">
                    {t(`lenses.${lens.id}.name`)}
                  </h3>
                  {lens.hasBadge && (
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-white"
                      style={{ backgroundColor: TEAL }}
                    >
                      {t(`lenses.${lens.id}.badge`)}
                    </span>
                  )}
                </div>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                  {t(`lenses.${lens.id}.desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SECTION 3 — EACH Framework */}
      <section className="border-t border-border pt-16 pb-16 lg:pt-20 lg:pb-20">
        <Reveal>
          <Eyebrow>{t("each.eyebrow")}</Eyebrow>
          <h2 className="mt-4 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl lg:text-4xl">
            {t("each.titlePart1")}
            <span className="font-light italic">{t("each.titlePart2")}</span>
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="mt-6 max-w-[62ch] font-sans text-base leading-[1.75] text-muted">
            {t("each.intro")}
          </p>
        </Reveal>

        {/* The four skills */}
        <Reveal className="mt-12">
          <SubLabel>{t("each.skillsLabel")}</SubLabel>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SKILL_KEYS.map((key, i) => (
            <Reveal key={key} delay={i * 80} className="h-full">
              <div className="premium-card flex h-full flex-col p-6">
                <h3 className="font-display text-lg font-medium leading-snug text-ink">
                  {t(`skills.${key}.name`)}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                  {t(`skills.${key}.desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* The three societal shifts */}
        <Reveal className="mt-14">
          <SubLabel>{t("each.shiftsLabel")}</SubLabel>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {SHIFT_KEYS.map((key, i) => (
            <Reveal key={key} delay={i * 80} className="h-full">
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
                      {t(`shifts.${key}.index`)}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-medium leading-snug text-ink">
                      {t(`shifts.${key}.name`)}
                    </h3>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 font-mono text-[0.7rem] uppercase tracking-wider">
                  <p className="text-muted">
                    {t("each.fromLabel")} {t(`shifts.${key}.from`)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span style={{ color: TERRACOTTA }}>&rarr;</span>
                    <span className="font-semibold text-ink">
                      {t("each.toLabel")} {t(`shifts.${key}.to`)}
                    </span>
                  </p>
                </div>
                <p className="mt-4 font-sans text-sm leading-relaxed text-muted">
                  {t(`shifts.${key}.desc`)}
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
                    {t("table.narrative")}
                  </th>
                  <th className="border border-border p-3 text-left font-semibold text-white">
                    {t("table.cultivates")}
                  </th>
                  <th className="border border-border p-3 text-left font-semibold text-white">
                    {t("table.challenges")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROW_KEYS.map((key, i) => (
                  <tr
                    key={key}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F4EFE3",
                    }}
                  >
                    <td className="border border-border p-3 font-medium text-ink">
                      {t(`table.rows.${key}.narrative`)}
                    </td>
                    <td className="border border-border p-3 text-muted">
                      {t(`table.rows.${key}.cultivates`)}
                    </td>
                    <td className="border border-border p-3 text-muted">
                      {t(`table.rows.${key}.challenges`)}
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
          <Eyebrow>{t("ashoka.eyebrow")}</Eyebrow>
        </Reveal>
        <Reveal delay={90}>
          <div className="mt-6 max-w-3xl space-y-6">
            <p className="font-sans text-lg leading-relaxed text-ink">
              {t("ashoka.p1")}
            </p>
            <p className="font-display text-xl font-light italic leading-relaxed text-ink sm:text-2xl">
              {t("ashoka.p2")}
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
