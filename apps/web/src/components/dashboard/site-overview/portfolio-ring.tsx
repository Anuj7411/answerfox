'use client';

import { useEffect, useRef } from 'react';
import { DISPLAY, PC } from './porcelain';

const C = 263.9; // 2πr for r=42

/**
 * The portfolio-readiness ring from the dashboard-home design: a circular
 * progress arc plus a count-up number, animated on mount (honors
 * prefers-reduced-motion). `color` tints the arc + number to the band.
 */
export function PortfolioRing({
  value,
  color = PC.ink,
}: {
  readonly value: number;
  readonly color?: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const score = Math.max(0, Math.min(100, Math.round(value)));
    const targetOffset = C * (1 - score / 100);
    const num = numRef.current;
    const arc = arcRef.current;
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      if (num) num.textContent = String(score);
      if (arc) arc.style.strokeDashoffset = String(targetOffset);
      return;
    }

    const ease = (t: number) => 1 - (1 - t) ** 3;
    const t0 = performance.now();
    const dur = 1100;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      if (num) num.textContent = String(Math.round(ease(p) * score));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    if (arc) {
      requestAnimationFrame(() => {
        arc.style.transition = 'stroke-dashoffset 1100ms cubic-bezier(.16,1,.3,1)';
        arc.style.strokeDashoffset = String(targetOffset);
      });
    }
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div style={{ position: 'relative', width: 96, height: 96 }}>
      <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden>
        <circle cx="48" cy="48" r="42" fill="none" stroke={PC.line} strokeWidth="8" />
        <circle
          ref={arcRef}
          cx="48"
          cy="48"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          ref={numRef}
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 34,
            letterSpacing: '-.02em',
            color: PC.ink,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          0
        </span>
      </div>
    </div>
  );
}
