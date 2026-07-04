"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { OPEN_TOUR_EVENT } from "@/components/Walkthrough";

const STRINGS = {
  home: "Home",
  tool: "Scoring Tool",
  batch: "Batch Analysis",
  about: "About",
  badge: "Density Badge",
  subjects: "Subjects",
  tour: "Start here",
  brandName: "Changemaker Worldview",
};

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: STRINGS.home, exact: true },
    { href: "/about", label: STRINGS.about, exact: false },
    { href: "/tool", label: STRINGS.tool, exact: false },
    { href: "/subjects", label: STRINGS.subjects, exact: false },
    { href: "/batch", label: STRINGS.batch, exact: false },
    { href: "/badge", label: STRINGS.badge, exact: false },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg/90 border-b border-border/60 shadow-sm transition-all duration-300">
      {/* Top micro-ribbon with metadata */}
      <div className="bg-ink text-[0.68rem] text-white py-1 px-6 border-b border-border/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center font-mono uppercase tracking-widest">
          <span>Scoring Matrix · Ashoka Framework Change</span>
          <span className="opacity-80 font-semibold">v0.5</span>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="mx-auto max-w-6xl px-6 py-3.5 flex items-center justify-between">
        {/* Left Side: Brand Logo and Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Ashoka Logo"
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="h-6 w-px bg-border/60 hidden sm:block" />
          <span className="font-display text-sm tracking-wider font-semibold uppercase text-ink hidden sm:block transition-colors duration-250 group-hover:text-accent">
            {STRINGS.brandName}
          </span>
        </Link>

        {/* Center/Right Side: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href) && link.href !== "/";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-xs uppercase tracking-widest py-1 border-b-2 transition-all duration-200 ${
                  isActive
                    ? "border-accent text-ink font-semibold"
                    : "border-transparent text-muted hover:text-ink hover:border-border"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(OPEN_TOUR_EVENT))}
            className="cursor-pointer font-mono text-xs uppercase tracking-widest py-1 border-b-2 border-transparent text-accent hover:text-accent-cta"
          >
            {STRINGS.tour}
          </button>
        </nav>

        {/* Right Side: Hamburger Button for Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="md:hidden flex items-center justify-center p-1.5 rounded-md text-ink hover:text-accent hover:bg-border/20 transition-all cursor-pointer"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border/40 bg-bg/95 backdrop-blur-lg animate-fade-in">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {links.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href) && link.href !== "/";

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`font-mono text-xs uppercase tracking-widest py-2.5 px-4 rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-accent-light text-accent font-semibold border-l-4 border-accent"
                      : "text-muted hover:text-ink hover:bg-border/20 border-l-4 border-transparent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent(OPEN_TOUR_EVENT));
              }}
              className="cursor-pointer text-left font-mono text-xs uppercase tracking-widest py-2.5 px-4 rounded-md border-l-4 border-transparent text-accent hover:bg-border/20"
            >
              {STRINGS.tour}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
