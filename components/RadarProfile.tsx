"use client";

import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { DIMENSIONS } from "@/lib/paradigm";
import { useTranslations } from "next-intl";
import type { ScoreResult } from "@/lib/types";

/**
 * Radar of the five dimension scores (0–4). Grid in the warm border color,
 * ticks in muted, polygon filled with the accent at 25% opacity over a 2px
 * accent stroke. Client component (Recharts).
 */
export function RadarProfile({
  result,
  accentColor = "#E87722",
}: {
  result: ScoreResult;
  accentColor?: string;
}) {
  // Recharts' ResponsiveContainer can't measure a parent during SSR/prerender
  // (it logs a width/height warning). Render the chart only after mount.
  const t = useTranslations("radarProfile");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = DIMENSIONS.map((d) => ({
    dimension: d.shortName,
    score: result.dimensions[d.key].score,
  }));

  const ariaLabel = t("aria", {
    values: DIMENSIONS.map((d) => `${d.shortName} ${result.dimensions[d.key].score}`).join(", "),
  });

  return (
    <div className="border border-border bg-surface p-4 sm:p-6 lg:p-8">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
        {t("title")}
      </p>
      <div
        role="img"
        aria-label={ariaLabel}
        className="h-[280px] w-full sm:h-[320px] lg:h-[340px]"
      >
        {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="#d9d2c2" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#6b6358", fontSize: 11 }}
            />
            <PolarRadiusAxis
              domain={[0, 4]}
              tickCount={5}
              tick={{ fill: "#6b6358", fontSize: 9 }}
              axisLine={false}
            />
            <Radar
              dataKey="score"
              stroke={accentColor}
              strokeWidth={2}
              fill={accentColor}
              fillOpacity={0.25}
              dot={{ r: 2.5, fill: accentColor, strokeWidth: 0 }}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
