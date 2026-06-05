"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STRINGS = {
  home: "Home",
  tool: "Scoring Tool",
  batch: "Batch Analysis",
  about: "About",
  badge: "Badge",
};

export function NavLinks() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: STRINGS.home, exact: true },
    { href: "/about", label: STRINGS.about, exact: false },
    { href: "/tool", label: STRINGS.tool, exact: false },
    { href: "/batch", label: STRINGS.batch, exact: false },
    { href: "/badge", label: STRINGS.badge, exact: false },
  ];

  return (
    <div className="border-b border-border">
      <nav className="mx-auto flex max-w-6xl gap-6 sm:gap-8 px-6 text-xs sm:text-sm overflow-x-auto whitespace-nowrap no-scrollbar">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href) && link.href !== "/";

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono uppercase tracking-widest pt-3 pb-3 border-b-2 transition-colors duration-150 -mb-[1px] ${
                isActive
                  ? "border-accent text-ink font-medium"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
