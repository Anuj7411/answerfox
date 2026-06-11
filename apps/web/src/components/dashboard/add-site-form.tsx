'use client';

import { type AddSiteFormState, addSiteAction } from '@/app/(dashboard)/dashboard/sites/actions';
import { useActionState } from 'react';

const initialState: AddSiteFormState = {};

/**
 * Add-site form. Uses React 19's useActionState so:
 * - The form works without JS (progressive enhancement)
 * - Field-level errors persist across the round-trip
 * - The submit button shows a pending state
 *
 * On success, the Server Action redirects to /dashboard/sites and
 * this component never re-renders (the new page does).
 */
export function AddSiteForm() {
  const [state, formAction, isPending] = useActionState(addSiteAction, initialState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="block font-mono text-[12.5px] tracking-wide text-ink-muted"
        >
          Display name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={80}
          placeholder="My personal site"
          className="mt-2 w-full rounded-lg border border-ink/15 bg-white/60 px-4 py-2.5 text-[15px] outline-none focus:border-ink/40"
          autoComplete="off"
        />
        {errors.name !== undefined && <p className="mt-2 text-sm text-red-700">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="url" className="block font-mono text-[12.5px] tracking-wide text-ink-muted">
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://your-site.com"
          className="mt-2 w-full rounded-lg border border-ink/15 bg-white/60 px-4 py-2.5 text-[15px] outline-none focus:border-ink/40"
          autoComplete="url"
          inputMode="url"
        />
        {errors.url !== undefined && <p className="mt-2 text-sm text-red-700">{errors.url}</p>}
      </div>

      {errors.general !== undefined && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {errors.general}
        </div>
      )}

      <button type="submit" disabled={isPending} className="btn btn-solid w-full">
        {isPending ? 'Adding...' : 'Add site'}
      </button>
    </form>
  );
}
