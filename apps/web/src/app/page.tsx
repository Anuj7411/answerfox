import { Bloom } from '@/components/bloom/Bloom';

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-base text-ink">
      <Bloom
        opts={{
          ember: [248, 148, 68],
          intensity: 0.8,
          cx: 0.5,
          cy: 0.42,
          radius: 0.55,
          orbitX: 0.32,
          orbitY: 0.24,
          orbitPeriod: 34,
        }}
      />
      <div className="relative text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-ink-muted">
          Answerfox · apps/web
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">
          The v3.4 bloom, in React.
        </h1>
        <p className="mt-4 font-body text-lg text-ink-muted">
          Next.js 15 · Tailwind 4 · Slate Family tokens · self-hosted fonts
        </p>
        <span
          className="mt-8 inline-block h-3 w-3 rounded-full"
          style={{ background: 'var(--ember)' }}
        />
      </div>
    </main>
  );
}
