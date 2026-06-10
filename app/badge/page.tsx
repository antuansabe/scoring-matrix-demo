"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const STRINGS = {
  eyebrow: "BADGE & CERTIFICATION PROGRAM",
  titlePart1: "Changemaker ",
  titlePart2: "Narrative Badge",
  subtitle: "Certifying organizations and writers who translate the Everyone a Changemaker worldview into active language.",
  comingSoonTitle: "Program Development & Framework Diagnostics",
  comingSoonText: "The official Narrative Badge Program is currently under design validation for v0.2. In this diagnostic phase, organizations can pilot the system, model scores, and explore requirements below.",
  howItWorksTitle: "How the Certification Works",
  badgeSimulatorTitle: "Interactive Badge Preview & Requirements",
};

const STAGES = [
  {
    step: "01",
    title: "Corpus Submission",
    desc: "Submit a collection of corporate materials, articles, speeches, or reports representing the organization's voice.",
  },
  {
    step: "02",
    title: "AI Structural Audit",
    desc: "The Ashoka AI framework scans syntax, positioning, and context mapping across the five key paradigm dimensions.",
  },
  {
    step: "03",
    title: "Genre Calibration",
    desc: "Scores are calibrated using genre-adjusted weights to compensate for structural communication constraints.",
  },
  {
    step: "04",
    title: "Detailed Diagnosis",
    desc: "Receive a full report detailing enactment score distribution, orientation analysis, and targeted framing feedback.",
  },
  {
    step: "05",
    title: "Badge Certification",
    desc: "Organizations achieving Level 3 (Changemaker) or Level 4 (System Architect) receive the certified Narrative Badge.",
  },
];

const BADGE_LEVELS = [
  {
    level: 0,
    name: "Spectator",
    scoreRange: "0–19",
    color: "#627D98",
    status: "Diagnostic Tier (No Badge Issued)",
    statusColor: "#627D98",
    desc: "The narrative structure positions change as something authored elsewhere by experts or institutions. Distributed agency is not yet present.",
  },
  {
    level: 1,
    name: "Sympathizer",
    scoreRange: "20–39",
    color: "#C46246",
    status: "Diagnostic Tier (No Badge Issued)",
    statusColor: "#C46246",
    desc: "The narrative values change and expresses solidarity with social problems, but framing positions the reader/narrator as a spectator rather than a builder.",
  },
  {
    level: 2,
    name: "Contributor",
    scoreRange: "40–59",
    color: "#F39334",
    status: "Diagnostic Tier (No Badge Issued)",
    statusColor: "#F39334",
    desc: "The narrator begins to assert agency, describing active contributions. However, systemic framing or collaborative dynamics remain partial.",
  },
  {
    level: 3,
    name: "Changemaker",
    scoreRange: "60–79",
    color: "#E87722",
    status: "Ashoka Certified (Badge Awarded)",
    statusColor: "#E87722",
    desc: "Agency is active, distributed, and owned. Language embodies empathy, conscious collaboration, and internal ownership of change.",
  },
  {
    level: 4,
    name: "System Architect",
    scoreRange: "80–100",
    color: "#0A3558",
    status: "Ashoka Certified (Badge Awarded)",
    statusColor: "#0A3558",
    desc: "The highest tier of narrative alignment. Language locates problems and solutions at structural and architectural levels, showing deep systemic framing.",
  },
];

export default function BadgePage() {
  const [activeLevel, setActiveLevel] = useState(3);
  const currentBadge = BADGE_LEVELS[activeLevel];

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 sm:py-20 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {STRINGS.eyebrow}
        </p>
        <h1 className="mt-5 font-display text-3xl font-normal leading-tight text-ink sm:text-4xl lg:text-5xl">
          {STRINGS.titlePart1}
          <span className="font-light italic text-accent">{STRINGS.titlePart2}</span>
        </h1>
        <p className="mt-4 max-w-prose font-sans text-base leading-relaxed text-muted">
          {STRINGS.subtitle}
        </p>

        {/* Coming Soon Alert Card */}
        <Reveal className="mt-12">
          <div className="premium-card p-6 sm:p-8 relative overflow-hidden border-l-4 border-l-accent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-light rounded-full blur-2xl -mr-10 -mt-10" />
            <h2 className="font-display text-xl font-semibold leading-tight text-ink">
              {STRINGS.comingSoonTitle}
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-muted max-w-3xl">
              {STRINGS.comingSoonText}
            </p>
          </div>
        </Reveal>

        {/* Badge Simulator */}
        <section className="mt-20 border-t border-border/60 pt-16">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              SIMULATION
            </p>
            <h2 className="mt-3 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
              {STRINGS.badgeSimulatorTitle}
            </h2>
          </Reveal>

          <Reveal delay={100} className="mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Interactive Badge Display */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-surface border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 relative group overflow-hidden">
              <div className="absolute inset-0 bg-radial from-transparent to-bg/5 pointer-events-none" />
              
              {/* Concentric Seal Badge Visual */}
              <div 
                className="relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-500 hover:rotate-3"
                style={{
                  background: `radial-gradient(circle, var(--surface) 60%, ${currentBadge.color}08 100%)`,
                  border: `4px solid ${currentBadge.color}`,
                  boxShadow: `0 15px 40px -15px ${currentBadge.color}60, inset 0 0 24px ${currentBadge.color}15`
                }}
              >
                {/* Shiny reflex overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/15 to-white/5 opacity-80 pointer-events-none" />
                {/* Concentric dashed border */}
                <div className="absolute inset-2.5 rounded-full border border-dashed border-border/70" />
                
                {/* Badge text */}
                <div className="text-center z-10 px-4">
                  <span className="font-mono text-[0.62rem] uppercase tracking-widest text-muted block mb-1">
                    Ashoka Worldview
                  </span>
                  <span className="font-display text-base font-bold text-ink uppercase tracking-wider block leading-tight">
                    {currentBadge.name}
                  </span>
                  <span 
                    className="font-mono text-[0.65rem] font-bold px-2.5 py-0.5 rounded-full inline-block mt-3 uppercase tracking-wider"
                    style={{ backgroundColor: `${currentBadge.color}15`, color: currentBadge.color }}
                  >
                    Level {currentBadge.level}
                  </span>
                  <span className="text-[0.68rem] text-muted block mt-3 font-mono">
                    Score {currentBadge.scoreRange}
                  </span>
                </div>
              </div>

              {/* Status info */}
              <div className="mt-8 text-center">
                <span className="font-mono text-[0.7rem] uppercase tracking-widest text-muted block">
                  Status
                </span>
                <span 
                  className="font-mono text-xs uppercase tracking-widest font-semibold block mt-1 transition-colors duration-300"
                  style={{ color: currentBadge.statusColor }}
                >
                  {currentBadge.status}
                </span>
              </div>
            </div>

            {/* Level Selector & Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Level Tabs */}
              <div className="flex flex-wrap gap-2">
                {BADGE_LEVELS.map((lvl) => (
                  <button
                    key={lvl.level}
                    onClick={() => setActiveLevel(lvl.level)}
                    className={`px-4 py-2 font-mono text-xs uppercase tracking-widest rounded-md border transition-all cursor-pointer ${
                      lvl.level === activeLevel
                        ? "bg-ink text-white border-ink shadow-sm"
                        : "bg-surface text-muted border-border hover:text-ink hover:border-muted"
                    }`}
                  >
                    Lvl {lvl.level}
                  </button>
                ))}
              </div>

              {/* Active Level Description Card */}
              <div className="premium-card p-6 bg-surface/50 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentBadge.color }}
                  />
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {currentBadge.name} Tier
                  </h3>
                </div>
                <p className="font-sans text-sm leading-relaxed text-ink">
                  {currentBadge.desc}
                </p>
                <div className="mt-6 pt-5 border-t border-border/60 grid grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-muted block uppercase tracking-widest text-[0.65rem]">SCORE WINDOW</span>
                    <span className="text-ink font-semibold mt-1 block">{currentBadge.scoreRange} / 100</span>
                  </div>
                  <div>
                    <span className="text-muted block uppercase tracking-widest text-[0.65rem]">ELIGIBILITY</span>
                    <span className="text-ink font-semibold mt-1 block">
                      {currentBadge.level >= 3 ? "Certified Badge Issued" : "Diagnostic Review Only"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="pt-2 flex justify-start gap-4">
                <Link href="/tool" className="btn-primary py-2.5">
                  Try Live Scorer
                </Link>
                <Link href="/calculadora" className="font-mono text-xs uppercase tracking-widest text-accent hover:text-accent-cta transition-colors inline-flex items-center gap-1 border border-border/60 px-4 py-2.5 rounded-md hover:border-accent/40 bg-surface">
                  Explore Weights
                </Link>
              </div>
            </div>
          </div>
          </Reveal>
        </section>

        {/* Timeline Process */}
        <section className="mt-24 border-t border-border/60 pt-16">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              PROCESS
            </p>
            <h2 className="mt-3 font-display text-2xl font-normal leading-tight text-ink sm:text-3xl">
              {STRINGS.howItWorksTitle}
            </h2>
          </Reveal>

          <div className="mt-12 space-y-6 max-w-3xl">
            {STAGES.map((st, idx) => (
              <Reveal key={st.step} delay={idx * 80}>
              <div
                className="premium-card p-6 bg-surface/40 flex flex-col sm:flex-row gap-5 items-start relative hover:border-accent/30 duration-300"
              >
                <span className="font-display text-3xl font-light text-accent/80 shrink-0 leading-none">
                  {st.step}
                </span>
                <div className="space-y-1">
                  <h3 className="font-display text-base font-semibold text-ink sm:text-lg">
                    {st.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm leading-relaxed text-muted">
                    {st.desc}
                  </p>
                </div>
                {idx < STAGES.length - 1 && (
                  <div className="hidden sm:block absolute left-9 top-full h-6 w-px bg-border/80" />
                )}
              </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
