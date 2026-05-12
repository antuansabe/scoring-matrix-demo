# Sample Texts — Expert Pre-Scored Anchor Corpus

Four anchor texts spanning the paradigm scale. Each represents one band and is pre-scored by the research lead (Giselle Kuri). These scores are the **ground truth** against which the live AI scorer is evaluated during the Wednesday session.

**These texts and scores must appear in `lib/samples.ts` exactly as written here.** Do not paraphrase or "improve" them.

---

## Sample A — Asistencialista (Spectator paradigm)

- **id:** `a-spectator`
- **title:** Asistencialista
- **subtitle:** Servicio directo clásico
- **paradigmLevel:** 0
- **paradigmName:** Spectator
- **genreTag:** `fundraising-copy`
- **accentColor:** `#7A6B3E`
- **expectedEnactmentScore:** 12
- **expectedEACHOrientation:** Emerging

### Excerpt (Spanish)

> Cada año atendemos a más de 5,000 niños y niñas en situación de vulnerabilidad en todo el país. Nuestro equipo de voluntarios entrega despensas, organiza posadas navideñas y proporciona apoyo escolar a quienes más lo necesitan. Gracias al esfuerzo de nuestros aliados corporativos, hemos podido extender nuestra labor a tres nuevos estados durante este año.
>
> La pobreza en México sigue siendo un reto enorme, especialmente para los niños que crecen en hogares con carencias múltiples. Por eso nuestro modelo se enfoca en proveer las herramientas básicas que les permitan tener un mejor futuro: alimentación adecuada, materiales escolares y acompañamiento emocional. Confiamos en que con el apoyo de la sociedad civil, podremos seguir transformando vidas.
>
> Este año, gracias a la generosidad de nuestros donantes, logramos impactar a 1,200 familias más que en 2024. Trabajamos con dedicación para asegurar que cada peso donado se traduzca en beneficios tangibles para los pequeños beneficiarios. Nuestro compromiso es seguir creciendo y llegar a más comunidades que nos necesitan.

### Expert scores

| Dim | Score | Justification |
|---|---|---|
| D1 | 0 | Agency belongs entirely to the organization ("atendemos", "entregamos", "proporcionamos"). Children appear exclusively as objects: "beneficiarios", "los pequeños", "quienes más lo necesitan". No present-tense youth agency. |
| D2 | 0 | Poverty named as backdrop, not as system. Solutions are services delivered ("herramientas básicas", "alimentación adecuada"). Zero structural or COMPLETE-framework vocabulary. |
| D3 | 1 | Emotional solidarity present ("confiamos", "trabajamos con dedicación") but no perspectives from community members are voiced. Nomination strategies are deficit-based: "vulnerabilidad", "carencias múltiples". |
| D4 | 1 | "Aliados corporativos" mentioned as financiers, not as co-actors. No intergenerational dimension. Narrator (institution) is the sole driver. |
| D5 | 0 | Purely institutional voice. Zero reflexivity. No first-person narrator, no learning, no positionality. |

### Key quotes to cite

- D1: *"atendemos a más de 5,000 niños y niñas en situación de vulnerabilidad"* · *"proporciona apoyo escolar a quienes más lo necesitan"*
- D2: *"la pobreza en México sigue siendo un reto enorme"* · *"proveer las herramientas básicas"*
- D3: *"los pequeños beneficiarios"* · *"comunidades que nos necesitan"*
- D4: *"gracias al esfuerzo de nuestros aliados corporativos"*
- D5: *"nuestro compromiso es seguir creciendo"* (institutional, no narrator)

---

## Sample B — Retórica vacía (Sympathizer paradigm)

- **id:** `b-sympathizer`
- **title:** Retórica vacía
- **subtitle:** Vocabulario changemaker sin enactment
- **paradigmLevel:** 1
- **paradigmName:** Sympathizer
- **genreTag:** `institutional-report`
- **accentColor:** `#B5341E`
- **expectedEnactmentScore:** 28
- **expectedEACHOrientation:** Emerging

### Excerpt (Spanish)

> Somos una organización transformadora comprometida con el cambio sistémico y el empoderamiento de las comunidades más vulnerables de América Latina. Lideramos iniciativas innovadoras que están redefiniendo el ecosistema de impacto social en la región, articulando alianzas estratégicas con actores de todos los sectores para construir un futuro más equitativo.
>
> Nuestro enfoque holístico integra perspectivas multidisciplinarias y nos permite operar con agilidad en contextos complejos. Hemos consolidado una metodología propia que conjuga investigación de vanguardia, co-creación con beneficiarios y advocacy de alto nivel. Esto nos ha posicionado como referente regional del nuevo paradigma de cambio.
>
> En los últimos cinco años hemos impulsado más de cuarenta proyectos transformadores en doce países, beneficiando a miles de personas y consolidando nuestro liderazgo en innovación social. Nuestro equipo está formado por líderes visionarios comprometidos con generar impacto a escala. Creemos firmemente en el poder transformador de la juventud y en la urgencia de empoderar a la próxima generación de agentes de cambio.

### Expert scores

| Dim | Score | Justification |
|---|---|---|
| D1 | 1 | Vocabulary suggests distributed agency ("empoderamiento", "co-creación") but communities remain passive: "beneficiarios", "miles de personas". Youth deferred to "próxima generación" — explicit future framing, not present. |
| D2 | 2 | "Cambio sistémico", "ecosistema", "paradigma" are named, but no specific COMPLETE dimension is targeted. Systemic vocabulary is decorative, not operative. Reaches level 2 because some structural framing is attempted. |
| D3 | 1 | "Beneficiarios" as a category. Zero direct or reported speech from community members. "Comprometida con", "creemos firmemente" — values stated, perspectives absent. |
| D4 | 1 | "Alianzas estratégicas" abstract. "Equipo de líderes visionarios" reinforces hierarchy. Intergenerational framing positions adults as empowerers, youth as recipients. |
| D5 | 1 | "Somos una organización transformadora", "referente regional", "nuestro liderazgo" — identity claimed repeatedly. No reflexivity, no learning narrative, no acknowledgment of uncertainty or failure. |

### Key quotes to cite

- D1: *"empoderar a la próxima generación de agentes de cambio"* · *"beneficiando a miles de personas"*
- D2: *"redefiniendo el ecosistema de impacto social"* · *"nuevo paradigma de cambio"*
- D3: *"co-creación con beneficiarios"* (claimed, not enacted) · *"creemos firmemente en el poder transformador de la juventud"*
- D4: *"nuestro equipo está formado por líderes visionarios"*
- D5: *"nos ha posicionado como referente regional"* · *"somos una organización transformadora"*

### Why this sample matters

This text is the **greenwashing canary**. It saturates changemaker vocabulary while structurally enacting a Sympathizer paradigm. It is what the model exists to detect — the gap between *declared* identity and *enacted* identity. The expert reviewing the demo should look at this case first.

---

## Sample C — Changemaker enactado

- **id:** `c-changemaker`
- **title:** Changemaker enactado
- **subtitle:** Práctica de campo con reflexividad
- **paradigmLevel:** 3
- **paradigmName:** Changemaker
- **genreTag:** `free-form-interview`
- **accentColor:** `#3D5A6C`
- **expectedEnactmentScore:** 72
- **expectedEACHOrientation:** Empathy-based Societies

### Excerpt (Spanish)

> Las asambleas vecinales con las que trabajamos en Iztapalapa no son destinatarias de nuestra intervención: son las que están definiendo qué problema se trabaja y a qué velocidad. Cuando en 2023 intentamos imponer un cronograma externo financiado por un fondo internacional, las propias asambleas nos lo regresaron — nos dijeron que esa lógica de entregables no se sostenía con los tiempos de las decisiones colectivas. Tuvimos que reaprender lo que habíamos hecho mal.
>
> Lo que entendí ese año es que mi rol no es producir las soluciones, sino facilitar conversaciones entre organizaciones vecinales que históricamente no hablaban entre sí. Hay jóvenes de quince y dieciséis años que están coordinando hoy las mesas de seguridad de su colonia, no porque las hayamos capacitado, sino porque las asambleas decidieron que esos espacios necesitaban su lectura. Algunas de las propuestas más útiles que he visto este año vinieron de ellos.
>
> Sigo aprendiendo a soltar. Mi formación previa me había enseñado a llegar con un diagnóstico y una propuesta; el trabajo aquí me ha exigido lo contrario — escuchar mucho antes de proponer, y aceptar que mi lectura del problema muchas veces está incompleta. Eso ha sido la curva más difícil.

### Expert scores

| Dim | Score | Justification |
|---|---|---|
| D1 | 4 | Assemblies named as the agents defining problem and pace. Youth ("jóvenes de quince y dieciséis años") in present tense, with substantive role: coordinating security mesas, contributing the most useful proposals. Narrator explicitly frames own role as enabling, not directing. |
| D2 | 3 | Reveals tension between two architectures: external project logic (deliverables, timelines from funders) versus collective decision rhythms. Names the Metrics dimension implicitly ("lógica de entregables"). Does not fully name multiple COMPLETE dimensions — caps at 3. |
| D3 | 4 | Course correction enacted: "tuvimos que reaprender lo que habíamos hecho mal". Direct voicing of community position ("nos dijeron que..."). Perspective from assemblies changed the practice. Power dynamics implied (external funder logic vs. local rhythm). |
| D4 | 3 | Bidirectional knowledge flow: youth contributing analyses adults didn't have. Intergenerational collaboration is substantive, not mentorship-shaped. Does not fully reach 4 because the network logic isn't structurally generalized beyond this case. |
| D5 | 4 | High reflexivity: "sigo aprendiendo a soltar", "mi lectura del problema muchas veces está incompleta". Identity is shown as evolving. Failure ("lo que habíamos hecho mal") explicitly named. Multiple voices held in tension without resolution. |

### Key quotes to cite

- D1: *"las asambleas... son las que están definiendo qué problema se trabaja y a qué velocidad"* · *"jóvenes de quince y dieciséis años que están coordinando hoy las mesas de seguridad"*
- D2: *"esa lógica de entregables no se sostenía con los tiempos de las decisiones colectivas"*
- D3: *"tuvimos que reaprender lo que habíamos hecho mal"* · *"nos dijeron que esa lógica de entregables no se sostenía"*
- D4: *"algunas de las propuestas más útiles que he visto este año vinieron de ellos"*
- D5: *"sigo aprendiendo a soltar"* · *"mi lectura del problema muchas veces está incompleta"*

### Note on EACH Orientation

D1 = 4 and D3 = 4 are the two dominant dimensions. By the rule D3 + D1 (both ≥ 3, top two) → **Empathy-based Societies**. Note that D5 = 4 also, which would also point toward Youth in Charge (D1 + D5). This is the **overlap case** documented in `docs/SCORING_MODEL.md`. Surface both — this is intellectually honest and matches the open question Giselle flagged.

---

## Sample D — System Architect

- **id:** `d-system-architect`
- **title:** System Architect
- **subtitle:** Arquitectura institucional puesta en tensión
- **paradigmLevel:** 4
- **paradigmName:** System Architect
- **genreTag:** `free-form-interview`
- **accentColor:** `#2A5A3E`
- **expectedEnactmentScore:** 92
- **expectedEACHOrientation:** Full EACH Alignment

### Excerpt (Spanish)

> Cuando hablamos de transformar la educación, casi siempre hablamos de cambiar lo que ocurre dentro del aula — la pedagogía, los contenidos, la formación docente. Pero las reglas que definen qué cuenta como aprendizaje válido en este país no están en el aula: están en los marcos de evaluación, en los criterios de financiamiento público, en las decisiones de SEP sobre qué se mide y qué no. Hasta que esas reglas no se renombran, lo que pasa dentro del aula sigue empujando contra una arquitectura que premia exactamente lo contrario.
>
> En la red trabajamos con escuelas que están experimentando con métricas de bienestar y de agencia juvenil — métricas que el sistema oficial no reconoce. Una de las maestras con las que trabajamos lo dice mejor que yo: "no es que estemos midiendo cosas distintas; estamos cuestionando que esas otras cosas sean lo medible". Y mientras tanto, hay un grupo de adolescentes que está ayudándonos a diseñar cómo se vería un instrumento de evaluación que tomara en serio su propia lectura de qué les está pasando como aprendices.
>
> Cuando arrancamos no teníamos claro si esto era pedagogía, política pública, o investigación de medición. La respuesta honesta es que es las tres al mismo tiempo, y que esa interdependencia no la podemos resolver eligiendo una. Lo que sí podemos hacer es trabajar simultáneamente en los tres frentes y aceptar que algunas tensiones no se cierran — se sostienen.

### Expert scores

| Dim | Score | Justification |
|---|---|---|
| D1 | 4 | Adolescents in present tense, designing the evaluation instrument with the network ("ayudándonos a diseñar"). Teacher voiced directly. Agency distributed across teachers, students, narrator. |
| D2 | 4 | Multiple COMPLETE dimensions explicitly targeted: Metrics ("métricas que el sistema oficial no reconoce"), Policy/Governance ("decisiones de SEP", "marcos de evaluación", "criterios de financiamiento público"), Cultural ("qué cuenta como aprendizaje válido"). Interdependencies named ("es las tres al mismo tiempo"). Refusal to resolve prematurely. |
| D3 | 4 | Direct reported speech from the teacher with full epistemic weight ("lo dice mejor que yo"). The teacher's framing reframes the narrator's own analysis. Power structures named (SEP, financiamiento público). |
| D4 | 4 | Genuine bidirectional flow: teachers, students, narrator each contribute distinct framings. "Ayudándonos a diseñar" — co-design, not delegation. Multigenerational structure explicit. |
| D5 | 4 | Polyphony: teacher's voice, students' lectura, narrator's reflection. Reflexivity explicit ("la respuesta honesta es..."). Tensions sostenidas without forced resolution. No claim of identity — only enactment. |

### Key quotes to cite

- D1: *"hay un grupo de adolescentes que está ayudándonos a diseñar"* · *"tomara en serio su propia lectura"*
- D2: *"las reglas que definen qué cuenta como aprendizaje válido"* · *"marcos de evaluación", "criterios de financiamiento público", "decisiones de SEP sobre qué se mide y qué no"*
- D3: *"una de las maestras con las que trabajamos lo dice mejor que yo: 'no es que estemos midiendo cosas distintas; estamos cuestionando que esas otras cosas sean lo medible'"*
- D4: *"está ayudándonos a diseñar cómo se vería un instrumento de evaluación"*
- D5: *"la respuesta honesta es que es las tres al mismo tiempo"* · *"algunas tensiones no se cierran — se sostienen"*

### Note on EACH Orientation

All five dimensions = 4. By the rule "all five ≥ 3 with no two clearly dominant" → **Full EACH Alignment**. This is the rarest case and represents the upper bound of the instrument.

---

## Display notes for the UI

When rendering samples in the `SampleSwitcher` and detail views:

- Show the **paradigmName** as the primary label on the chip/button.
- Show the **subtitle** below the title on the detail view.
- The **accentColor** is used for the chip background (with appropriate contrast on text), the radar fill at low opacity, and the left border of the excerpt block.
- Always show the **genreTag** as a mono uppercase eyebrow above the score.
- The expert scores are the **ground truth**. When a user clicks a sample, render those scores directly (do not call the API for samples — they are pre-computed).
- The Live Analyzer (paste-your-own-text feature) is the only path that hits the API.
