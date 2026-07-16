'use client';

import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { useState } from 'react';

/**
 * Public score-badge picker for a site's Settings page. Renders the live
 * SVG (via the public /api/badge/:domain endpoint) with copyable
 * Markdown, HTML, and direct-URL snippets. The badge is public by design
 * — it's meant to be embedded on the customer's own site or README.
 *
 * The badge value is generated server-side from the site's latest audit,
 * so there's nothing to fabricate here: this component only shapes the
 * snippet strings around whatever the SVG endpoint decides to render.
 */
export interface BadgePickerCardProps {
  readonly siteUrl: string;
}

export function BadgePickerCard({ siteUrl }: BadgePickerCardProps) {
  const domain = hostOf(siteUrl);
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const badgeUrl = `${origin}/api/badge/${encodeURIComponent(domain)}`;
  const linkUrl = `${origin}/site/${encodeURIComponent(domain)}`;

  const markdown = `[![Answerfox agent-readiness](${badgeUrl})](${linkUrl})`;
  const html = `<a href="${linkUrl}"><img src="${badgeUrl}" alt="Answerfox agent-readiness" /></a>`;

  const [copied, setCopied] = useState<'md' | 'html' | 'url' | null>(null);

  async function copy(text: string, which: 'md' | 'html' | 'url') {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      // Clipboard blocked. Silent — button flash just doesn't fire.
    }
  }

  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '18px 20px', borderBottom: `1px solid ${PC.line}` }}>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: PC.ink }}>
          Score badge
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: PC.muted, marginTop: 4 }}>
          Embed the live agent-readiness score on your site or README.
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* PREVIEW */}
        <div
          style={{
            padding: '18px 20px',
            border: `1px solid ${PC.line}`,
            background: '#FCFCFA',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          {/* Directly embed the live SVG. The route caches for 60s. */}
          {/* biome-ignore lint/a11y/useAltText: badge alt is baked into the SVG's <title>. */}
          <img
            src={badgeUrl}
            alt="Answerfox agent-readiness badge for this site"
            style={{ display: 'block' }}
          />
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
            live · updates with each audit
          </span>
        </div>

        {/* MARKDOWN */}
        <Snippet
          label="Markdown"
          hint="for READMEs and Markdown-based docs"
          value={markdown}
          onCopy={() => copy(markdown, 'md')}
          copied={copied === 'md'}
        />

        {/* HTML */}
        <Snippet
          label="HTML"
          hint="for any website"
          value={html}
          onCopy={() => copy(html, 'html')}
          copied={copied === 'html'}
        />

        {/* Direct URL */}
        <Snippet
          label="SVG URL"
          hint="use in image tags, docs, or anywhere image URLs work"
          value={badgeUrl}
          onCopy={() => copy(badgeUrl, 'url')}
          copied={copied === 'url'}
        />
      </div>

      <div
        style={{
          padding: '11px 20px',
          borderTop: `1px solid ${PC.line}`,
          background: '#FCFCFA',
          fontFamily: MONO,
          fontSize: 11.5,
          color: PC.dim,
        }}
      >
        Badge renders "no audit" until this site has been audited at least once.
      </div>
    </div>
  );
}

function Snippet({
  label,
  hint,
  value,
  onCopy,
  copied,
}: {
  label: string;
  hint: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: PC.dim,
          }}
        >
          {label}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>{hint}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <code
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            fontFamily: MONO,
            fontSize: 12,
            color: PC.ink,
            background: PC.hover,
            border: `1px solid ${PC.line}`,
            borderRadius: 7,
            padding: '8px 10px',
            overflowX: 'auto',
            whiteSpace: 'pre',
          }}
        >
          {value}
        </code>
        <button
          type="button"
          onClick={onCopy}
          style={{
            flex: '0 0 auto',
            height: 34,
            padding: '0 12px',
            background: PC.card,
            border: `1px solid ${PC.line}`,
            borderRadius: 7,
            fontFamily: BODY,
            fontSize: 12.5,
            color: PC.ink,
            cursor: 'pointer',
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] ?? url;
  }
}
