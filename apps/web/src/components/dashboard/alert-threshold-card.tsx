'use client';

import { updateAlertThreshold } from '@/app/(dashboard)/dashboard/sites/[siteId]/alert-actions';
import { useState, useTransition } from 'react';

interface AlertThresholdCardProps {
  readonly siteId: string;
  readonly current: number | null;
}

const PRESETS: ReadonlyArray<number> = [60, 70, 80, 90];

/**
 * Sets the score-drop alert threshold for a site. Pick a preset or
 * type a number; an alert fires the next time an audit crosses below
 * the threshold from above.
 */
export function AlertThresholdCard({ siteId, current }: AlertThresholdCardProps) {
  const [armed, setArmed] = useState(current !== null);
  const [value, setValue] = useState<number>(current ?? 80);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const dirty = (armed ? value : null) !== current;

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateAlertThreshold(siteId, armed ? value : null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-slate-base/50 p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Score-drop alert</h2>
        <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-muted">
          <input
            type="checkbox"
            checked={armed}
            onChange={(e) => setArmed(e.currentTarget.checked)}
            disabled={pending}
            className="h-4 w-4 accent-ember"
          />
          {armed ? 'On' : 'Off'}
        </label>
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        Email me when an audit drops below this score. One email per crossing, not one per
        consecutive failing run.
      </p>

      {armed && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => {
            const active = value === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setValue(p)}
                disabled={pending}
                className={`rounded-full border px-3 py-1.5 font-mono text-[12.5px] ${
                  active
                    ? 'border-ember/60 bg-ember/10 text-ink'
                    : 'border-ink/15 text-ink-muted hover:border-ink/30'
                }`}
                aria-pressed={active}
              >
                {p}
              </button>
            );
          })}
          <label className="flex items-center gap-2 text-[12.5px] text-ink-muted">
            <span>Custom</span>
            <input
              type="number"
              min={0}
              max={100}
              value={value}
              onChange={(e) => {
                const n = Number.parseInt(e.currentTarget.value, 10);
                if (Number.isFinite(n)) setValue(Math.max(0, Math.min(100, n)));
              }}
              disabled={pending}
              className="w-20 rounded-md border border-ink/15 bg-slate-base px-2 py-1 font-mono text-[13px] text-ink"
            />
            <span className="font-mono text-[11px]">/100</span>
          </label>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-[12.5px] text-ink-muted">
          {error !== null && <span className="text-red-700">{error}</span>}
          {error === null && savedAt !== null && !dirty && (
            <span>Saved {formatSavedAgo(savedAt)}.</span>
          )}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="btn btn-solid disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Saving…' : dirty ? 'Save threshold' : 'Saved'}
        </button>
      </div>
    </section>
  );
}

function formatSavedAgo(d: Date): string {
  const seconds = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}
