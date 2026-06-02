export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-base text-ink">
      <div className="text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-ink-muted">
          Answerfox · apps/web
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">
          Day 1 scaffold is live.
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
