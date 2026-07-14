'use client';

import { useEffect, useRef } from 'react';
import { DISPLAY, PC } from './porcelain';

/**
 * The giant count-up score from the design's score card. Counts 0 → value
 * over 1.1s with a cubic ease-out, honoring prefers-reduced-motion (jumps
 * straight to the value). Client-only because it touches the DOM on mount.
 */
export function AnimatedScore({ value }: { readonly value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const target = Math.max(0, Math.round(value));
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.textContent = String(target);
      return;
    }
    const ease = (t: number) => 1 - (1 - t) ** 3;
    const t0 = performance.now();
    const dur = 1100;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = String(Math.round(ease(p) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span
      ref={ref}
      style={{
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 'clamp(88px,11vw,124px)',
        letterSpacing: '-.055em',
        lineHeight: 0.74,
        color: PC.ink,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      0
    </span>
  );
}
