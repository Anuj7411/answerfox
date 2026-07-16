'use client';

import { type AddSiteFormState, addSiteAction } from '@/app/(dashboard)/dashboard/sites/actions';
import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { useActionState } from 'react';

const initialState: AddSiteFormState = {};

const fieldLabel = {
  display: 'block',
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '.06em',
  textTransform: 'uppercase' as const,
  color: PC.dim,
};

const fieldInput = {
  marginTop: 8,
  width: '100%',
  height: 42,
  padding: '0 14px',
  border: `1px solid ${PC.faint}`,
  borderRadius: 9,
  background: PC.card,
  fontFamily: BODY,
  fontSize: 15,
  color: PC.ink,
  outline: 'none',
} as const;

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
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label htmlFor="name" style={fieldLabel}>
          Display name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={80}
          placeholder="My personal site"
          autoComplete="off"
          style={fieldInput}
        />
        {errors.name !== undefined && <FieldError>{errors.name}</FieldError>}
      </div>

      <div>
        <label htmlFor="url" style={fieldLabel}>
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://your-site.com"
          autoComplete="url"
          inputMode="url"
          style={fieldInput}
        />
        {errors.url !== undefined && <FieldError>{errors.url}</FieldError>}
      </div>

      {errors.general !== undefined && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 9,
            border: `1px solid ${PC.redWash}`,
            background: PC.redWash,
            fontSize: 13,
            color: PC.red,
          }}
        >
          {errors.general}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        style={{
          height: 44,
          background: PC.ink,
          border: 'none',
          borderRadius: 9,
          fontFamily: BODY,
          fontSize: 14,
          fontWeight: 500,
          color: '#FAFAF8',
          cursor: isPending ? 'progress' : 'pointer',
          opacity: isPending ? 0.75 : 1,
        }}
      >
        {isPending ? 'Adding…' : 'Add site'}
      </button>
    </form>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '8px 0 0', fontSize: 13, color: PC.red }}>{children}</p>;
}
