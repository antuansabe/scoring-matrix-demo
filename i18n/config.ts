/**
 * Client-safe locale constants (Phase 11a). No server imports here — this is
 * shared by the header switcher (client) and the request config (server).
 */
export const LOCALES = ["en", "es"] as const;
export type AppLocale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "cw.locale";
