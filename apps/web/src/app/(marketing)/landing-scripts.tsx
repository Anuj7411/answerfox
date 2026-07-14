'use client';

import { useEffect } from 'react';

/**
 * Landing interactions, ported from the answerfox-landing.html design's
 * script (kinetic hero word-reveal, terminal typing, scroll reveals,
 * the X-Ray drag slider, magnetic buttons, copy). Runs once on mount and
 * cleans up its listeners/observers. The markup + styles are the verbatim
 * design; this only drives the behavior.
 */
export function LandingScripts() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js');
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cleanups: Array<() => void> = [];

    // NAV shadow on scroll
    const nav = document.getElementById('nav');
    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener('scroll', onScroll));
    }

    // HERO: split the headline into words, then stagger them in
    const hero = document.querySelector<HTMLElement>('.hero');
    const heroH = document.getElementById('heroH');
    if (heroH) {
      const frag = document.createDocumentFragment();
      for (const n of Array.from(heroH.childNodes)) {
        if (n.nodeType === 3) {
          const text = n.textContent ?? '';
          for (const t of text.split(/(\s+)/)) {
            if (t.trim() === '') {
              frag.appendChild(document.createTextNode(t));
            } else {
              const s = document.createElement('span');
              s.className = 'w';
              s.textContent = t;
              frag.appendChild(s);
            }
          }
        } else if (n.nodeType === 1) {
          (n as HTMLElement).classList.add('w');
          frag.appendChild(n);
        }
      }
      heroH.innerHTML = '';
      heroH.appendChild(frag);
    }

    const typeTerm = () => {
      const cmd = 'answerfox audit yourdocs.dev';
      const el = document.getElementById('tcmd');
      const out = document.getElementById('tout');
      if (!el || !out) return;
      if (reduce) {
        el.textContent = cmd;
        for (const c of Array.from(out.children)) c.classList.add('on');
        return;
      }
      let i = 0;
      const step = () => {
        if (i <= cmd.length) {
          el.textContent = cmd.slice(0, i);
          i++;
          window.setTimeout(step, 42 + Math.random() * 40);
        } else {
          const lines = out.children;
          let j = 0;
          const show = () => {
            if (j < lines.length) {
              lines[j]?.classList.add('on');
              j++;
              window.setTimeout(show, 300);
            }
          };
          show();
        }
      };
      step();
    };

    requestAnimationFrame(() => {
      for (const e of Array.from(document.querySelectorAll('.hero .reveal'))) e.classList.add('in');
      const ws = Array.from(document.querySelectorAll<HTMLElement>('.hero h1 .w'));
      if (reduce) {
        for (const w of ws) w.classList.add('in');
        hero?.classList.add('lit');
        typeTerm();
        return;
      }
      ws.forEach((w, i) => window.setTimeout(() => w.classList.add('in'), 120 + i * 62));
      window.setTimeout(
        () => {
          hero?.classList.add('lit');
          typeTerm();
        },
        120 + ws.length * 62 + 120,
      );
    });

    // Scroll reveals + proof count-up
    const countUp = (el: Element) => {
      const to = Number(el.getAttribute('data-to'));
      const from = 61;
      if (reduce) {
        el.textContent = String(to);
        return;
      }
      let t0: number | null = null;
      const d = 1100;
      const loop = (t: number) => {
        if (t0 === null) t0 = t;
        const p = Math.min((t - t0) / d, 1);
        const e = 1 - (1 - p) ** 3;
        el.textContent = String(Math.round(from + (to - from) * e));
        if (p < 1) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
            const proof = en.target.querySelector('#proofTo');
            if (proof) countUp(proof);
          }
        }
      },
      { threshold: 0.18 },
    );
    for (const e of Array.from(document.querySelectorAll('.reveal'))) {
      if (!e.closest('.hero')) io.observe(e);
    }
    cleanups.push(() => io.disconnect());

    // X-RAY slider drag
    const slider = document.getElementById('slider');
    const handle = document.getElementById('shandle');
    if (slider && handle) {
      let drag = false;
      const setPos = (pct: number) => {
        const v = Math.max(8, Math.min(92, pct));
        slider.style.setProperty('--pos', `${v}%`);
        handle.setAttribute('aria-valuenow', String(Math.round(v)));
      };
      const fromX = (x: number) => {
        const r = slider.getBoundingClientRect();
        setPos(((x - r.left) / r.width) * 100);
      };
      const onHandleDown = (e: PointerEvent) => {
        drag = true;
        handle.classList.remove('nudge');
        try {
          handle.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      };
      const onSliderDown = (e: PointerEvent) => {
        if ((e.target as Element).closest('.shandle')) return;
        handle.classList.remove('nudge');
        fromX(e.clientX);
        drag = true;
      };
      const onMove = (e: PointerEvent) => {
        if (drag) fromX(e.clientX);
      };
      const onUp = () => {
        drag = false;
      };
      const onKey = (e: KeyboardEvent) => {
        const c = Number(handle.getAttribute('aria-valuenow')) || 54;
        if (e.key === 'ArrowLeft') {
          setPos(c - 4);
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          setPos(c + 4);
          e.preventDefault();
        }
      };
      handle.addEventListener('pointerdown', onHandleDown);
      slider.addEventListener('pointerdown', onSliderDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      handle.addEventListener('keydown', onKey);
      cleanups.push(() => {
        handle.removeEventListener('pointerdown', onHandleDown);
        slider.removeEventListener('pointerdown', onSliderDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        handle.removeEventListener('keydown', onKey);
      });
    }

    // Magnetic buttons
    if (!reduce) {
      for (const b of Array.from(document.querySelectorAll<HTMLElement>('[data-mag]'))) {
        const onBMove = (e: PointerEvent) => {
          const r = b.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          b.style.transform = `translate(${x * 0.14}px,${y * 0.24 - 2}px)`;
        };
        const onBLeave = () => {
          b.style.transform = '';
        };
        b.addEventListener('pointermove', onBMove);
        b.addEventListener('pointerleave', onBLeave);
        cleanups.push(() => {
          b.removeEventListener('pointermove', onBMove);
          b.removeEventListener('pointerleave', onBLeave);
        });
      }
    }

    // Terminal copy
    const tc = document.getElementById('termCopy');
    if (tc) {
      const onCopy = () => {
        try {
          void navigator.clipboard.writeText('npx answerfox audit yourdocs.dev');
          tc.style.color = 'var(--c-green)';
          window.setTimeout(() => {
            tc.style.color = '';
          }, 1200);
        } catch {
          /* ignore */
        }
      };
      tc.addEventListener('click', onCopy);
      cleanups.push(() => tc.removeEventListener('click', onCopy));
    }

    // Safety net: reveal anything still hidden after 2.6s
    const fallback = window.setTimeout(() => {
      for (const e of Array.from(document.querySelectorAll('.reveal:not(.in)')))
        e.classList.add('in');
      for (const e of Array.from(document.querySelectorAll('.hero h1 .w:not(.in)')))
        e.classList.add('in');
    }, 2600);
    cleanups.push(() => window.clearTimeout(fallback));

    return () => {
      for (const c of cleanups) c();
    };
  }, []);

  return null;
}
