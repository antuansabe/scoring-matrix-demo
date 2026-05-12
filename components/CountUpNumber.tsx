"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders an integer. When `animate` is true, counts from 0 up to `value` over
 * `durationMs` with an ease-out curve, using requestAnimationFrame (no
 * animation libraries). When false, renders `value` directly. Respects
 * prefers-reduced-motion.
 */
export function CountUpNumber({
  value,
  durationMs = 800,
  animate = true,
  className,
}: {
  value: number;
  durationMs?: number;
  animate?: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(animate ? 0 : value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!animate || reduceMotion || durationMs <= 0) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(value * eased));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs, animate]);

  return <span className={className}>{display}</span>;
}
