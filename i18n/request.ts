import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, type AppLocale } from "@/i18n/config";

/**
 * Phase 11a — locale WITHOUT locale routing. The active language is a
 * persisted cookie preference (set by the header switcher), never a URL
 * segment. English is canonical; Spanish is the one alternative.
 */
export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  const locale: AppLocale = raw === "es" ? "es" : "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
