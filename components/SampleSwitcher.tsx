"use client";

import { useTranslations } from "next-intl";
import type { Sample } from "@/lib/types";

/**
 * Row of chips that selects the active anchor sample. Controlled: state lives
 * in page.tsx. Tab-navigable; the active chip carries aria-pressed. On mobile
 * the row becomes a horizontal snap-scroll strip.
 */
export function SampleSwitcher({
  samples,
  selectedId,
  onSelect,
}: {
  samples: Sample[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("samples");
  return (
    <div
      role="group"
      aria-label={t("switcherGroupAria")}
      className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {samples.map((sample) => {
        const active = sample.id === selectedId;
        return (
          <button
            key={sample.id}
            type="button"
            aria-pressed={active}
            aria-label={t("switcherChipAria", { level: sample.paradigmLevel, name: sample.paradigmName })}
            onClick={() => onSelect(sample.id)}
            className={`shrink-0 snap-start whitespace-nowrap border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
              active
                ? "text-white"
                : "border-border bg-surface text-ink hover:bg-bg"
            }`}
            style={
              active
                ? {
                    backgroundColor: sample.accentColor,
                    borderColor: sample.accentColor,
                  }
                : undefined
            }
          >
            {sample.paradigmLevel} · {sample.paradigmName}
          </button>
        );
      })}
    </div>
  );
}
