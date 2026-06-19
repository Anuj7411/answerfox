'use client';

import {
  type GenerateAiFixState,
  generateAIFixAction,
} from '@/app/(dashboard)/dashboard/sites/[siteId]/ai-fix-actions';
import { useActionState, useState } from 'react';

interface AiFixPanelProps {
  readonly findingId: string;
  readonly checkId: string;
}

const initialState: GenerateAiFixState = { status: 'idle' };

/**
 * "Generate fix with AI" button + inline panel that shows the
 * returned artifact, the quota notice, or the error reason.
 *
 * Lives directly inside each finding card on the site detail page,
 * keeping the user one click away from the fix without a modal or
 * route change.
 */
export function AiFixPanel({ findingId, checkId }: AiFixPanelProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async () => generateAIFixAction(findingId),
    initialState,
  );

  if (!open && state.status === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white/60 px-3 py-1.5 text-[12.5px] font-mono hover:border-ember/40 hover:bg-white"
      >
        <span aria-hidden>✦</span>
        Generate fix with AI
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-ink/15 bg-white/70 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">
          AI fix · {checkId}
        </p>
        {state.status === 'succeeded' ? (
          <span className="font-mono text-[11px] text-ink-muted">
            {state.used} / {state.used + state.remaining} used this month
          </span>
        ) : null}
      </div>

      {state.status !== 'quota-exceeded' ? (
        <form action={formAction} className="mt-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-ember/40 bg-ember/10 px-3 py-1.5 text-[13px] font-medium hover:bg-ember/20 disabled:opacity-60"
          >
            {pending
              ? 'Generating...'
              : state.status === 'failed'
                ? 'Try again'
                : state.status === 'succeeded'
                  ? 'Regenerate'
                  : 'Generate'}
          </button>
        </form>
      ) : null}

      {state.status === 'succeeded' ? <ArtifactView state={state} /> : null}

      {state.status === 'quota-exceeded' ? (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3">
          <p className="text-[13px] font-semibold text-amber-950">
            Monthly quota reached ({state.used} / {state.quota})
          </p>
          <p className="mt-1 text-[12.5px] text-amber-900/85">
            Pro tier resets at the start of the next calendar month UTC. Studio gets unlimited
            generations.
          </p>
        </div>
      ) : null}

      {state.status === 'failed' ? (
        <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3">
          <p className="text-[13px] font-semibold text-red-900">Generation failed</p>
          <p className="mt-1 font-mono text-[12px] text-red-900/85">{state.error}</p>
        </div>
      ) : null}
    </div>
  );
}

function ArtifactView({
  state,
}: {
  readonly state: Extract<GenerateAiFixState, { status: 'succeeded' }>;
}) {
  const { artifact } = state;

  return (
    <div className="mt-3 space-y-3">
      <p className="text-[13px] leading-relaxed text-ink/90">{artifact.explanation}</p>

      {artifact.kind === 'file' ? (
        <>
          <p className="font-mono text-[11.5px] uppercase tracking-wide text-ink-muted">
            New file: {artifact.path}
          </p>
          <CodeBlock body={artifact.body} />
        </>
      ) : null}

      {artifact.kind === 'meta' || artifact.kind === 'jsonld' ? (
        <>
          <p className="font-mono text-[11.5px] uppercase tracking-wide text-ink-muted">
            {artifact.kind === 'meta' ? 'Drop in <head>' : 'JSON-LD block'}
          </p>
          <CodeBlock body={artifact.snippet} />
        </>
      ) : null}

      {artifact.kind === 'rewrite' ? (
        <>
          <p className="font-mono text-[11.5px] uppercase tracking-wide text-ink-muted">
            Content rewrite
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] text-red-700">Before</p>
              <CodeBlock body={artifact.oldText} />
            </div>
            <div>
              <p className="font-mono text-[11px] text-emerald-700">After</p>
              <CodeBlock body={artifact.newText} />
            </div>
          </div>
        </>
      ) : null}

      {artifact.kind === 'patch' ? (
        <>
          <p className="font-mono text-[11.5px] uppercase tracking-wide text-ink-muted">
            Unified diff
          </p>
          <CodeBlock body={artifact.diff} />
        </>
      ) : null}
    </div>
  );
}

function CodeBlock({ body }: { readonly body: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 font-mono text-[12px] leading-relaxed text-slate-100">
      {body}
    </pre>
  );
}
