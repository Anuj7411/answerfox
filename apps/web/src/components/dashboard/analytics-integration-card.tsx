'use client';

import { rotateIngestToken } from '@/app/(dashboard)/dashboard/sites/[siteId]/analytics-actions';
import { useState, useTransition } from 'react';

interface AnalyticsIntegrationCardProps {
  readonly siteId: string;
  readonly hasToken: boolean;
  readonly appUrl: string;
}

/**
 * Mint or rotate the per-site ingest token + show a copy-pasteable
 * Next.js middleware snippet. The token is only revealed at the
 * moment of minting — there is no "view current" path.
 */
export function AnalyticsIntegrationCard({
  siteId,
  hasToken,
  appUrl,
}: AnalyticsIntegrationCardProps) {
  const [token, setToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function mint() {
    setError(null);
    startTransition(async () => {
      const res = await rotateIngestToken(siteId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setToken(res.token);
    });
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-slate-base/50 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Analytics integration</h2>
        {hasToken && token === null && (
          <span className="font-mono text-[11.5px] text-ink-dim">Token minted</span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        Forward each request's User-Agent and Referer to{' '}
        <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[12px]">/api/track/visit</code>{' '}
        from your server. We classify it and roll it up here.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={mint}
          disabled={pending}
          className="btn btn-quiet disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Minting…' : hasToken ? 'Rotate token' : 'Mint token'}
        </button>
        {error !== null && <span className="text-[12.5px] text-red-700">{error}</span>}
      </div>

      {token !== null && (
        <div className="mt-4 rounded-xl border border-ember/40 bg-ember/5 p-4">
          <p className="font-mono text-[11.5px] uppercase tracking-wider text-ember">
            New token — copy now, you won't see it again
          </p>
          <pre className="mt-2 overflow-x-auto rounded-md bg-ink text-ink-inverse p-3 font-mono text-[12.5px]">
            <code>{token}</code>
          </pre>
        </div>
      )}

      <details className="mt-5 rounded-xl border border-ink/10 bg-slate-base p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          Next.js middleware example
        </summary>
        <p className="mt-2 text-[12.5px] text-ink-muted">
          Save your ingest token to <code className="font-mono">ANSWERFOX_INGEST_TOKEN</code> in
          your environment, then drop this into <code className="font-mono">middleware.ts</code>.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-ink p-4 font-mono text-[12px] text-ink-inverse">
          <code>{renderNextSnippet({ siteId, appUrl })}</code>
        </pre>
      </details>
    </section>
  );
}

function renderNextSnippet({ siteId, appUrl }: { siteId: string; appUrl: string }) {
  return [
    "import { NextResponse } from 'next/server';",
    "import type { NextRequest } from 'next/server';",
    '',
    'export async function middleware(req: NextRequest) {',
    `  const url = '${appUrl}/api/track/visit';`,
    '  const token = process.env.ANSWERFOX_INGEST_TOKEN;',
    '  if (token) {',
    '    // Fire and forget — never block the user request on this.',
    '    fetch(url, {',
    "      method: 'POST',",
    '      headers: {',
    "        'Authorization': `Bearer ${token}`,",
    "        'Content-Type': 'application/json',",
    '      },',
    '      body: JSON.stringify({',
    `        siteId: '${siteId}',`,
    "        userAgent: req.headers.get('user-agent') ?? '',",
    "        referrer: req.headers.get('referer'),",
    '        path: req.nextUrl.pathname,',
    '      }),',
    '    }).catch(() => {});',
    '  }',
    '  return NextResponse.next();',
    '}',
    '',
    'export const config = {',
    "  matcher: ['/((?!_next/|api/).*)'],",
    '};',
  ].join('\n');
}
