import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { e10SameAsThree } from './e10-same-as-three.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('E10 — sameAs ≥3', () => {
  it('passes when Organization JSON-LD has 3+ sameAs entries', async () => {
    const block = JSON.stringify({
      '@type': 'Organization',
      name: 'Acme',
      sameAs: [
        'https://twitter.com/acme',
        'https://github.com/acme',
        'https://linkedin.com/company/acme',
      ],
    });
    const html = `<html><head><script type="application/ld+json">${block}</script></head></html>`;
    const r = await e10SameAsThree.run(inputFor(html));
    expect(r.status).toBe('pass');
    expect(r.evidence).toContain('3');
  });

  it('warns when sameAs has 1-2 entries', async () => {
    const block = JSON.stringify({
      '@type': 'Organization',
      name: 'Acme',
      sameAs: ['https://twitter.com/acme'],
    });
    const html = `<html><head><script type="application/ld+json">${block}</script></head></html>`;
    const r = await e10SameAsThree.run(inputFor(html));
    expect(r.status).toBe('warn');
    expect(r.evidence).toContain('1');
  });

  it('fails when no Organization JSON-LD with sameAs is present', async () => {
    const r = await e10SameAsThree.run(inputFor('<html><body></body></html>'));
    expect(r.status).toBe('fail');
  });

  it('walks the @graph form to find Organization.sameAs', async () => {
    const block = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: 'Acme' },
        {
          '@type': 'Organization',
          name: 'Acme',
          sameAs: ['https://a.com', 'https://b.com', 'https://c.com'],
        },
      ],
    });
    const html = `<html><head><script type="application/ld+json">${block}</script></head></html>`;
    const r = await e10SameAsThree.run(inputFor(html));
    expect(r.status).toBe('pass');
  });

  it('takes the Organization with the most sameAs entries when multiple blocks exist', async () => {
    const html = `<html><head>
      <script type="application/ld+json">${JSON.stringify({ '@type': 'Organization', sameAs: ['https://a.com'] })}</script>
      <script type="application/ld+json">${JSON.stringify({ '@type': 'Organization', sameAs: ['https://b.com', 'https://c.com', 'https://d.com'] })}</script>
    </head></html>`;
    const r = await e10SameAsThree.run(inputFor(html));
    expect(r.status).toBe('pass');
  });

  it('accepts a single string sameAs value (schema.org allows this)', async () => {
    const block = JSON.stringify({
      '@type': 'Organization',
      sameAs: 'https://twitter.com/acme',
    });
    const html = `<html><head><script type="application/ld+json">${block}</script></head></html>`;
    const r = await e10SameAsThree.run(inputFor(html));
    expect(r.status).toBe('warn');
  });
});
