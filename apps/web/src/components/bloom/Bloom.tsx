'use client';

import { useEffect, useRef } from 'react';
import type { BloomOpts } from './types';

/**
 * Mounts the v3.4 bloom engine on an absolutely-positioned canvas behind the
 * page. SSR-safe: the engine is dynamically imported inside useEffect, so the
 * canvas-only code never runs on the server. Mounts once; reads the latest
 * opts from a ref so a re-render does not restart the animation.
 */
export function Bloom({ opts }: { opts: BloomOpts }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let stop: (() => void) | undefined;
    let cancelled = false;

    import('./engine').then(({ mountBloom }) => {
      if (cancelled || !canvasRef.current) return;
      stop = mountBloom(canvasRef.current, optsRef.current);
    });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
  );
}
