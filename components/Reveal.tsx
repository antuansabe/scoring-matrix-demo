"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Scroll-triggered reveal wrapper. Children start slightly lowered and
 * transparent, then ease into place the first time the element scrolls into
 * the viewport (via IntersectionObserver). Reveals once and stays put. Use
 * `delay` to stagger siblings. Honors prefers-reduced-motion by rendering
 * fully visible with no transition.
 *
 * No animation libraries — same philosophy as CountUpNumber.
 */
export function Reveal({
  children,
  delay = 0,
  variant = "rise",
  className = "",
  style,
  threshold = 0.15,
  rootMargin = "0px 0px -8% 0px",
}: {
  children: ReactNode;
  /** ms to wait before this element's transition starts — used for stagger. */
  delay?: number;
  variant?: "rise" | "rise-sm" | "fade";
  className?: string;
  style?: CSSProperties;
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${variant}${visible ? " is-visible" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
    >
      {children}
    </div>
  );
}
