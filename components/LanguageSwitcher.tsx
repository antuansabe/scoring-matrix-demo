"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE } from "@/i18n/config";

/**
 * EN/ES toggle (Phase 11a). Writes the persisted cookie preference and
 * refreshes the server tree — no locale routing, no URL change. Shows the
 * language you would SWITCH TO, per common convention, with both visible.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();

  function switchTo(next: "en" | "es") {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest ${className}`}>
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        className={`cursor-pointer px-1 py-1 ${locale === "en" ? "font-bold text-ink border-b-2 border-accent" : "text-muted hover:text-ink"}`}
      >
        EN
      </button>
      <span className="text-border" aria-hidden="true">/</span>
      <button
        type="button"
        onClick={() => switchTo("es")}
        aria-pressed={locale === "es"}
        className={`cursor-pointer px-1 py-1 ${locale === "es" ? "font-bold text-ink border-b-2 border-accent" : "text-muted hover:text-ink"}`}
      >
        ES
      </button>
    </span>
  );
}
