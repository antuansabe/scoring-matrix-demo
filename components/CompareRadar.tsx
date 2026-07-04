"use client";

import { useEffect, useState } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { DIMENSIONS } from "@/lib/paradigm";
import type { DimensionKey } from "@/lib/types";

// t1 in Ashoka Blue (--ink), t2 in Ashoka Orange (--accent) — the palette's
// two primary tones. Deliberately not a red/green good-bad pairing: this
// instrument reads direction from labels, not color-coded value judgments.
const T1_COLOR = "#0A3558";
const T2_COLOR = "#E87722";

type SeriesScores = Record<DimensionKey, number>;

/**
 * Overlaid two-series radar comparing a subject's t1 vs t2 dimension
 * profile. Same Recharts conventions as RadarProfile (mount-guarded — the
 * ResponsiveContainer can't measure a parent during SSR).
 */
export function CompareRadar({
  t1Label,
  t1Scores,
  t2Label,
  t2Scores,
}: {
  t1Label: string;
  t1Scores: SeriesScores;
  t2Label: string;
  t2Scores: SeriesScores;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = DIMENSIONS.map((d) => ({
    dimension: d.shortName,
    t1: t1Scores[d.key],
    t2: t2Scores[d.key],
  }));

  const ariaLabel = `Overlaid radar profile comparing ${t1Label} and ${t2Label} across the five dimensions, scale 0 to 4.`;

  return (
    <div className="border border-border bg-surface p-4 sm:p-6 lg:p-8">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
        Overlaid Radar Profile · D1–D5 · 0–4
      </p>
      <div role="img" aria-label={ariaLabel} className="h-[300px] w-full sm:h-[340px] lg:h-[380px]">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="65%">
              <PolarGrid stroke="#E5DEC9" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: "#486581", fontSize: 11 }} />
              <PolarRadiusAxis
                domain={[0, 4]}
                tickCount={5}
                tick={{ fill: "#486581", fontSize: 9 }}
                axisLine={false}
              />
              {/* t1 dashed so the two series are distinguishable by line
                  style as well as color (Phase 9: no color-only encoding). */}
              <Radar
                name={t1Label}
                dataKey="t1"
                stroke={T1_COLOR}
                strokeWidth={2}
                strokeDasharray="6 4"
                fill={T1_COLOR}
                fillOpacity={0.12}
                dot={{ r: 2.5, fill: T1_COLOR, strokeWidth: 0 }}
                animationDuration={500}
                animationEasing="ease-out"
              />
              <Radar
                name={t2Label}
                dataKey="t2"
                stroke={T2_COLOR}
                strokeWidth={2}
                fill={T2_COLOR}
                fillOpacity={0.2}
                dot={{ r: 2.5, fill: T2_COLOR, strokeWidth: 0 }}
                animationDuration={500}
                animationEasing="ease-out"
              />
              <Legend
                wrapperStyle={{
                  fontFamily: "var(--font-plex-mono)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  paddingTop: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
