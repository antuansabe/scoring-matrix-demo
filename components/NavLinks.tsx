"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks() {
  const pathname = usePathname();
  const isHomeActive = pathname === "/";
  const isBatchActive = pathname.startsWith("/batch");

  return (
    <div className="border-b border-border">
      <nav className="mx-auto flex max-w-6xl gap-8 px-6 text-sm">
        <Link
          href="/"
          className={`font-mono uppercase tracking-widest pt-3 pb-3 border-b-2 transition-colors duration-150 -mb-[1px] ${
            isHomeActive
              ? "border-accent text-ink font-medium"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Instrument Demo
        </Link>
        <Link
          href="/batch"
          className={`font-mono uppercase tracking-widest pt-3 pb-3 border-b-2 transition-colors duration-150 -mb-[1px] ${
            isBatchActive
              ? "border-accent text-ink font-medium"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Batch Analysis
        </Link>
      </nav>
    </div>
  );
}
