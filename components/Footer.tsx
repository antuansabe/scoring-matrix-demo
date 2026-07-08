import Link from "next/link";
import { useTranslations } from "next-intl";
import { FEATURES } from "@/lib/flags";

/** Global Footer. Server component; copy from the message catalogs. */
export function Footer() {
  const t = useTranslations();

  const nav = [
    { href: "/", label: t("header.home") },
    { href: "/about", label: t("header.about") },
    { href: "/tool", label: t("header.tool") },
    { href: "/subjects", label: t("header.subjects") },
    ...(FEATURES.batch ? [{ href: "/batch", label: t("header.batch") }] : []),
    ...(FEATURES.badge ? [{ href: "/badge", label: t("header.badge") }] : []),
  ];

  return (
    <footer className="mt-24 border-t border-border/50 bg-surface/30 backdrop-blur-sm relative">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/20 via-accent/40 to-ink/20" />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-border/40">
          {/* Brand block */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-ink font-bold">
                {t("header.brand")}
              </span>
            </div>
            <p className="font-sans text-xs text-muted leading-relaxed max-w-sm">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Calculator link as a premium Card */}
          <div className="md:col-span-4 space-y-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted/80 block">
              {t("footer.methodologyEyebrow")}
            </span>
            <Link
              href="/calculadora"
              className="premium-card p-4 block bg-surface/50 hover:bg-accent-light border border-border/60 hover:border-accent/30 transition-all duration-300 group"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-accent group-hover:text-accent font-semibold block">
                {t("footer.methodologyTitle")}
              </span>
              <span className="text-accent text-[0.7rem] font-sans block mt-2 font-semibold group-hover:translate-x-1 transition-transform duration-200">
                {t("footer.methodologyCta")}
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted/80 block">
              {t("footer.navigation")}
            </span>
            <ul className="space-y-2 font-mono text-[0.68rem] uppercase tracking-wider">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted hover:text-accent transition-colors block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Credits row */}
        <div className="pt-8 flex flex-col sm:flex-row items-start justify-between gap-4">
          <p className="font-mono text-[0.65rem] uppercase leading-relaxed tracking-widest text-muted/70 max-w-3xl">
            {t("footer.credits")}
          </p>
          <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-widest text-muted/50 bg-bg px-2 py-1 border border-border/40 rounded-sm">
            {t("footer.badge")}
          </span>
        </div>
      </div>
    </footer>
  );
}
