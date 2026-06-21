'use client';

import { updateDisplayName } from '@/app/(dashboard)/dashboard/settings/actions';
import { useState, useTransition } from 'react';

interface DisplayNameFormProps {
  readonly currentName: string | null;
  readonly fallbackEmail: string;
}

/**
 * In-place editor for the user's display name. Empty string clears
 * the name and the dashboard falls back to email everywhere — the
 * "Clear" affordance is intentional, not a missing feature.
 */
export function DisplayNameForm({ currentName, fallbackEmail }: DisplayNameFormProps) {
  const inputId = 'profile-display-name';
  const [name, setName] = useState(currentName ?? '');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const normalized = name.trim();
  const dirty = normalized !== (currentName ?? '');

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateDisplayName(name);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block font-mono text-[11px] uppercase tracking-wider text-ink-dim"
      >
        Display name
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          id={inputId}
          type="text"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          disabled={pending}
          maxLength={80}
          placeholder={fallbackEmail}
          className="min-w-0 flex-1 rounded-md border border-ink/15 bg-slate-base px-3 py-2 font-mono text-[13px] text-ink"
        />
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="btn btn-quiet disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Saving…' : dirty ? 'Save name' : 'Saved'}
        </button>
      </div>
      <p className="mt-2 text-[12.5px] text-ink-muted">
        Leave empty to show your email instead of a display name.
      </p>
      <div className="mt-1 text-[12.5px] text-ink-muted">
        {error !== null && <span className="text-red-700">{error}</span>}
        {error === null && savedAt !== null && !dirty && (
          <span>Saved {formatSavedAgo(savedAt)}.</span>
        )}
      </div>
    </div>
  );
}

function formatSavedAgo(d: Date): string {
  const seconds = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}
